# The Hollow Courier: Secure Coding Writeup

**Target:** `core_application` / Salt Gate checkpoint service
**Class:** Broken access control via IP spoofing (CWE-290: Authentication Bypass by Spoofing; related CWE-350: Reliance on Reverse DNS/IP Resolution)
**Component:** `checkpoint/app/__init__.py`, `checkpoint/conf/Caddyfile`, `checkpoint/app/gate.py`

---

## 1. Summary

The Salt Gate application exposes an internal-only route, `POST /gate/decree`, that mints "crown decrees": binding authority that should only ever be reachable by the Watch's own internal relay, never by a courier on the public road. Access is gated purely by source-IP inspection (`gate.require_internal()`), which trusts `request.remote_addr` after Werkzeug's `ProxyFix` middleware rewrites it from the `X-Forwarded-For` header.

`ProxyFix` was configured with `x_for=2`, telling it to trust the **second-from-right** entry in `X-Forwarded-For` as the genuine client address. The actual deployment topology has only **one** trusted hop in front of the Flask app (the Caddy perimeter). This mismatch meant an external attacker could prepend a forged, internal-looking IP to their own `X-Forwarded-For` header and have it accepted as `request.remote_addr`, bypassing the internal-only check entirely and sealing arbitrary crown decrees from the public internet.

---

## 2. The vulnerable chain

### 2.1 The gate the check is supposed to protect

`checkpoint/app/routes.py`:

```python
@gate_bp.route("/gate/decree", methods=["POST"])
def decree():
    """Inner desk: seal a binding crown decree for the watch.

    Sealing a decree turns a watch order into something the realm must honour,
    so the desk is open to internal watch traffic only.
    """
    if not gate.require_internal():
        abort(403)
    ...
```

This route has no authentication of its own: it is protected *entirely* by network-origin inspection.

### 2.2 The origin check

`checkpoint/app/gate.py`:

```python
INTERNAL_NETWORKS = (
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.2/32"),
)

def _origin_address() -> str:
    return request.remote_addr or ""

def is_internal_request() -> bool:
    try:
        origin = ipaddress.ip_address(_origin_address())
    except ValueError:
        return False
    return any(origin in network for network in INTERNAL_NETWORKS)
```

This logic is sound *if and only if* `request.remote_addr` cannot be influenced by the caller. That guarantee lives entirely in the `ProxyFix` configuration.

### 2.3 The mismatch

`checkpoint/app/__init__.py` (before fix):

```python
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=2, x_proto=1, x_host=1)
```

`x_for=2` tells Werkzeug: "trust the value **two positions from the right** in `X-Forwarded-For` as the real client IP, because two proxies sit between the client and this app."

`checkpoint/conf/Caddyfile`:

```
:8000 {
    reverse_proxy 127.0.0.1:5000 {
        trusted_proxies private_ranges
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

There is exactly **one** hop here: internet → Caddy (`:8000`) → Flask (`127.0.0.1:5000`). Caddy is the only trusted proxy in the chain. `x_for` should therefore be `1`, not `2`.

Caddy's `reverse_proxy` does not strip an inbound `X-Forwarded-For` header before appending the connecting peer's address: it appends the real client IP to whatever value the client already sent, and forwards the *whole* resulting header upstream. So the header Flask receives is:

```
X-Forwarded-For: <attacker-controlled prefix>, <attacker's real IP appended by Caddy>
```

With `x_for=2`, ProxyFix reads the **second-from-right** entry: which is the attacker-controlled prefix, not the address Caddy actually saw. If that prefix is `10.0.0.1`, `request.remote_addr` becomes `10.0.0.1`, which falls inside `10.0.0.0/8`, and `is_internal_request()` returns `True`.

---

## 3. Proof of concept

Simulated against the Flask app directly (`test_client`), which reproduces the exact header shape Caddy would produce for a single-hop topology:

```python
forged_header = "10.0.0.1, 203.0.113.77"  # attacker-prefix, then attacker's real IP (as Caddy would append it)

resp = client.post(
    "/app/gate/decree",
    data={"order": "forge attempt"},
    headers={"X-Forwarded-For": forged_header},
)
```

**Against the original `x_for=2` configuration:**

```
Status: 200
{'authority': 'CROWN', 'decree': 1, 'order': 'forge attempt (old config)', 'sealed': True}
```

An unauthenticated, external caller successfully sealed a crown decree: full compromise of the intended trust boundary.

**Against the fixed `x_for=1` configuration:**

```
Status: 403
```

The same spoofed header is now correctly rejected.

**Regression check**: a genuine internal caller must still work:

```python
resp2 = client.post(
    "/app/gate/decree",
    data={"order": "legit internal decree"},
    headers={"X-Forwarded-For": "127.0.0.2"},
)
```

```
Status: 200
{'authority': 'CROWN', 'decree': 1, 'order': 'legit internal decree', 'sealed': True}
```

The fix closes the spoofing path without breaking legitimate internal traffic from the watch relay.

---

## 4. The fix

`checkpoint/app/__init__.py`:

```diff
-    # Deployment expects an edge cache and the application perimeter.
-    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=2, x_proto=1, x_host=1)
+    # Exactly one trusted hop sits in front of this app: the Caddy perimeter
+    # (see conf/Caddyfile). ProxyFix must be told x_for=1 to match that
+    # topology -- with a higher count, an attacker can prepend fake entries
+    # to X-Forwarded-For and shift their own address into the position
+    # ProxyFix trusts, spoofing request.remote_addr and defeating the
+    # internal-network check in gate.require_internal().
+    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
```

A single-value change (`2` → `1`) that realigns the trusted-hop count with the actual, documented proxy topology. `x_proto` and `x_host` are left untouched: Caddy is also the sole source of `X-Forwarded-Proto`/`X-Forwarded-Host`, so `x_proto=1`/`x_host=1` were already correct.

### Why this is the right fix (and not a Caddyfile change)

Caddy always **appends** the real, TCP-level peer address as the right-most entry of `X-Forwarded-For`: it cannot be tricked into putting a spoofed value in that right-most position, because that position reflects the actual socket peer, not header content. Reading from the right, one hop in, is therefore exactly as trustworthy as the number of real proxies between the attacker and the app. Since there is one real proxy (Caddy), `x_for=1` is the correct and sufficient value; no attacker-supplied prefix can ever occupy that position.

(An alternative, complementary hardening would be enabling Caddy's global `trusted_proxies_strict` option to have Caddy itself discard untrusted prefixes before forwarding, but that option is only valid in the global `servers` block, not inside a per-site `reverse_proxy` directive, and this Caddyfile has no global block. The `x_for` fix alone fully closes the vulnerability for this topology and is the minimal, correct change.)

---

## 5. Verification

Full test suite, unmodified:

```
25 passed in 2.71s
```

No functional regressions. The existing test suite does not exercise the proxy boundary in-process (by its own docstring: *"the inner desk's provenance rules belong to the perimeter and are exercised in deployment, not in this in-process test harness"*), which is precisely why this class of misconfiguration shipped undetected: the security-critical logic lived entirely in infrastructure config, outside the automated test surface.

---

## 6. Impact

- **Confidentiality:** None directly (the endpoint doesn't leak data).
- **Integrity:** High. Any unauthenticated network caller could seal arbitrary "CROWN" decrees: the application's own docstring states this "turns a watch order into something the realm must honour." This is a full authorization bypass on the application's highest-privilege action.
- **Availability:** Low direct impact, though decree-flooding could pollute the ledger/audit trail.

## 7. Root cause

Trusting a specific position in a client-influenceable header (`X-Forwarded-For`) requires that position to correspond exactly to the number of proxies that actually sit between the untrusted network and the application. This value must be kept in lockstep with the real deployment topology; it is not a tunable that can be set generously "to be safe": a *larger* trusted-hop count is *less* safe, since it reaches further into attacker-controlled territory. Any future change to the proxy chain (adding a CDN, load balancer, etc.) requires updating `x_for` to match, and ideally should be covered by an integration test that exercises the deployed proxy configuration rather than only the in-process Flask test client.
