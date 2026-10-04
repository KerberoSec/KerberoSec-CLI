# ENOWARS 10: Writeup

Attack/Defense CTF · 2026-07-18

This writeup documents the vulnerabilities we found across the ten scored services,
how each was exploited, and the patch we deployed (or why we chose not to). It is
organized one section per service. Each section follows the same shape:

- **Service**: stack, how flags are stored/retrieved.
- **Vulnerability**: the flaw and why it works.
- **Exploitation**: how an attacker steals a flag.
- **Patch**: our fix and why it is safe for the checker (SLA).

A short "lessons learned" section on operational (SLA) pitfalls closes the writeup: in A/D, keeping services *up and correct* is worth more than any single vuln, and
several of our hardest moments were self-inflicted availability bugs, not attacks.

---

## Contents

1. [leet-date: JWKS injection (`jku` header)](#1-leet-date--jwks-injection-jku-header)
2. [SignMeMaybe: SSRF via redirect allow-list](#2-signmemaybe--ssrf-via-redirect-allow-list)
3. [flagdrive: GDPR export nonce-prefix IDOR](#3-flagdrive--gdpr-export-nonce-prefix-idor)
4. [OverEats: notes-export IDOR](#4-overeats--notes-export-idor)
5. [inbox: government-agent AUDITLOG escalation](#5-inbox--government-agent-auditlog-escalation)
6. [d3pl0y: suid VM privilege escalation](#6-d3pl0y--suid-vm-privilege-escalation)
7. [greple: availability fix (Zig)](#7-greple--availability-fix-zig)
8. [funsplash: partial-coverage image censor](#8-funsplash--partial-coverage-image-censor)
9. [superregister & mediocre: analyzed, not patched](#9-superregister--mediocre--analyzed-not-patched)
10. [Operational lessons (SLA)](#10-operational-lessons-sla)

---

## 1. leet-date: JWKS injection (`jku` header)

**Stack:** Go `leetdate` service + Python `payments` (JWT issuer) + nginx front. Flags
live in `premium_perks.perk_text` of premium users; retrieved via
`GET /api/users/<handle>/perk` (requires the caller to be premium).

### Vulnerability

`payments` issues RS256 "receipt" JWTs; `leetdate` verifies them against a JWKS.
The Go verifier (`src/internal/premiumjwt/verifier.go`) resolves the signing key by
trying, in order: cached kid → refresh from the configured JWKS URL → inline `jwk`
header (kid lookup only) → **`jku` header**. The `jku` branch accepted any URL whose
host passed a weak prefix check:

```go
func allowedJKU(raw string) bool {
    u, err := url.Parse(raw)
    if err != nil { return false }
    return strings.HasPrefix(u.Host, "payments")   // the hole
}
```

`HasPrefix(host, "payments")` is not an allow-list: `payments-evil`,
`payments.attacker.tld`, `paymentsX…` all pass. A JWT can therefore point `jku` at an
attacker-controlled JWKS. The compose file even shipped
`extra_hosts: ["payments-evil:host-gateway"]`, a breadcrumb for the intended exploit.

### Exploitation

1. Register an attacker account on the target → session cookie.
2. Stand up a JWKS server hosting an RSA public key under some `kid`.
   Cross-team delivery works via nip.io: inside a target container,
   `payments.<our-ip-dashed>.nip.io` resolves to our box (containers have external
   DNS) and passes the prefix check.
3. Forge a receipt: header `{kid, jku: http://payments.<ip>.nip.io:<port>/jwks.json}`,
   claims `{sub: <attacker handle>, aud, iss, …}`, signed with **our** RSA key.
4. `POST /api/me/redeem-premium` → target fetches our JWKS, validates our signature →
   attacker is premium.
5. `GET /api/users/<victim handle>/perk` → `perk_text` = flag.

### Patch

The legitimate flow never needs `jku`: real receipts always resolve via kid + the
*configured* JWKS URL. So we simply refuse token-supplied key URLs:

```go
func allowedJKU(raw string) bool {
    // A/D patch: never trust a JWKS URL supplied inside the token.
    return false
}
```

SLA-safe because we only removed an acceptance path; legit receipts still verify via
kid lookup. Verified end-to-end: `payments` mint → `redeem-premium` → `is_premium:true`.

> **Operational footnote.** Rebuilding `leetdate` shifted its Docker IP; the long-lived
> nginx front had cached `payments`' old IP (`proxy_pass http://payments:7000` resolves
> once at startup with no `resolver`), so `/pay/*` began returning 502 and the checker
> could no longer obtain receipts. Fixed with `docker compose restart web`. Durable fix:
> add `resolver 127.0.0.11` and a variable `proxy_pass` so nginx re-resolves per request.

---

## 2. SignMeMaybe: SSRF via redirect allow-list

**Stack:** C#/.NET. Flags are sealed "archive packets" stored per contract; retrieved by
the owner via `GET /api/contracts/{reference}/archive/packet`.

### Vulnerability

The service fetches user-supplied "annex" URLs server-side to embed as PDF attachments
(`RemoteAnnexFetcher`). The **initial** URL is checked against loopback/private ranges
(with connection pinning to defeat DNS rebinding), but the **redirect** path granted a
special bypass to an internal endpoint:

```csharp
private static async Task<ResolvedAnnexTarget?> ResolveRedirectTargetAsync(Uri uri, ...)
{
    if (IsAllowedInternalArchivePacketUri(uri, serviceHost))       // 127.0.0.1/internal/archive/packets/<stamp>
        return new ResolvedAnnexTarget(uri, IPAddress.Loopback, IsInternalArchivePacket: true);
    return await ResolveInitialTargetAsync(uri, serviceHost, cancellationToken);
}
```

When the fetched URI matched the internal-archive pattern, the fetcher also *auto-added*
the internal worker header `X-SignMeMaybe-Pdf-Worker`. So an attacker's external server
could 302-redirect a server-side fetch into
`http://127.0.0.1:<port>/internal/archive/packets/<victim-stamp>`; the request originated
from loopback with the correct header → the internal endpoint returned the sealed packet
(flag), which was then embedded in the attacker's generated PDF.

### Exploitation

1. Create a contract with a `<link rel="attachment" href="http://attacker/">` annex.
2. Attacker's server replies `302 → http://127.0.0.1:<port>/internal/archive/packets/<victim-stamp>`.
3. Fetcher follows (redirect allow-listed), adds the worker header, reads the sealed
   packet, embeds it → attacker downloads the PDF with the flag inside.

The connection-pinning/rebinding hardening was real but irrelevant here: this path
*explicitly* whitelists loopback.

### Patch

Redirects must pass the same SSRF checks as the initial request; there is no legitimate
flow that redirects a user annex into the loopback internal endpoint:

```csharp
private static async Task<ResolvedAnnexTarget?> ResolveRedirectTargetAsync(Uri uri, ...)
{
    // A/D patch: redirects get the same loopback/SSRF checks as the initial URI.
    // (internal-archive bypass removed)
    return await ResolveInitialTargetAsync(uri, serviceHost, cancellationToken);
}
```

(We also removed the header-injection block, now dead.) Legit external annex fetching and
the same-service `/api/links/leave` redirect still work. Verified: store `ArchivePacket`
via `POST /api/contracts` → retrieve via `/archive/packet`.

> Note: the live source had drifted from the initial image (a `notary`→`archive` rename),
> a reminder to always reason from the running box.

---

## 3. flagdrive: GDPR export nonce-prefix IDOR

**Stack:** Rust backend + Postgres. Flags live in per-user GDPR exports, downloaded by ID
`GET /api/gdpr/download/{gdpr_id}` where `gdpr_id = username-timestamp-nonce`
(nonce = 32 random hex chars). This was one of two services we observed being actively
exploited in captured traffic.

### Vulnerability

The download had **no auth**: by design, the 32-char random nonce was meant to be the
capability. But the lookup matched a **nonce *range*, not the exact value**:

```rust
let mut nonce_upper = nonce.to_string();
if let Some(last) = nonce_upper.pop() {
    nonce_upper.push((last as u8 + 1) as char);   // increment last char
}
// WHERE username = $1 AND nonce >= $2 AND nonce < $3   ($2 = nonce, $3 = nonce_upper)
```

`nonce >= given AND nonce < given_with_last_char_incremented` is a **prefix range**: any
stored nonce that *starts with* the supplied string matches. Supplying a single hex
character reduces the entire 32-char keyspace to **16 guesses**.

### Exploitation

For any victim username (from `attack.json`):

```
GET http://<team>:4859/api/gdpr/download/<victim>-latest-0
GET http://<team>:4859/api/gdpr/download/<victim>-latest-1
...                                                     -f     # 16 requests total
```

`latest` also removes the need to know the timestamp. One of the 16 prefixes matches the
victim's export → full GDPR data (flag). The captured attack traffic showed exactly this
(`…/gdpr/download/<user>-latest-<…d68,d67,d66>`: walking the last char of a short prefix).

### Patch

Exact match, range logic removed:

```rust
// latest branch:
"SELECT content FROM gdpr_data WHERE username = $1 AND nonce = $2 ORDER BY timestamp DESC LIMIT 1"
// timestamped branch:
"SELECT content FROM gdpr_data WHERE username = $1 AND timestamp = $2 AND nonce = $3"
```

The checker always downloads with the full, exact `gdpr_id` it received, so exact match is
provably identical for legit use. Verified: full-id download → 200 + export; single-char
prefix → 404.

---

## 4. OverEats: notes-export IDOR

**Stack:** Python/Flask (+ Go livetrack, nginx, Postgres). Flags are encrypted "notes"
attached to orders. Also observed being probed in captured traffic
(`/api/notes/export?order_id=…`, `/api/orders/NNN/details`).

### Vulnerability

`export_notes` (`/api/notes/export`) had two branches. The default correctly scoped to the
caller; the `order_id` branch did not:

```python
if order_id:
    notes = db_query("SELECT ... FROM order_notes WHERE order_id = %s", (order_id,), fetchall=True)  # no owner check
else:
    notes = db_query("SELECT ... FROM order_notes WHERE customer_id = %s", (g.current_user['id'],), fetchall=True)
```

`@require_auth` only proves the caller is *some* logged-in user: it does not check they
own the order. Any authenticated user could read any order's notes by ID. (Order IDs are
sequential and enumerable, and `/api/orders/recent` lists recent ones unauthenticated.)

### Exploitation

1. Register any account on the target.
2. `GET /api/orders/recent` → harvest valid order IDs.
3. `GET /api/notes/export?order_id=N` → encrypted note blob (flag material) for each.

### Patch

Scope the `order_id` branch to the caller's own orders (notes are customer-owned, enforced
by `create_note`, so customer-only scoping matches the checker):

```python
if order_id:
    notes = db_query(
        "SELECT n.id, n.order_id, n.encrypted_data, n.hmac_signature "
        "FROM order_notes n JOIN orders o ON o.id = n.order_id "
        "WHERE n.order_id = %s AND o.customer_id = %s",
        (order_id, g.current_user['id']), fetchall=True)
```

Verified: attacker export → `{"exports":[]}`; both legit paths (owner with `order_id`, and
no-arg) still return the note. (`/api/orders/<id>/details` was already properly
authorized; `/api/orders/recent` exposes only non-sensitive fields by design.)

---

## 5. inbox: government-agent AUDITLOG escalation

**Stack:** Go from-scratch IMAP (1234) + SMTP (4321) server. Flags are delivered as mail;
normally retrieved by the owner via IMAP `SELECT`/`FETCH`.

### Vulnerability

The service has a "government agent" privilege. A gated command exposed any user's audit
log:

```go
// cmdAuditlog:
if len(cmd.Args) > 0 {
    if !s.user.GovernmentAgent { return s.w.NO(cmd.Tag, "AUDITLOG permission denied") }
    targetUsername = cmd.Args[0]      // read ANOTHER user's auditlog
    ...
}
```

`GovernmentAgent` is obtained through `ELEV_AGENT`, which runs a stripped, source-less
binary `/service/gov_verify <challenge> <response>` and promotes on exit 0: i.e. a
signature check whose weakness is the intended exploit. Once promoted,
`AUDITLOG <victim>` reads the victim's activity log (flags).

Path traversal was *not* available: `isValidUsername` allows only `[A-Za-z0-9_+-]`.

### Exploitation

`ELEV_AGENT` → bypass `gov_verify` → become `GovernmentAgent` → `AUDITLOG <victim>` → flag.

### Patch

Rather than touch the fragile crypto, we removed the escalation at its sink: no
legitimate feature needs one user reading another's audit log:

```go
// cmdAuditlog:
if len(cmd.Args) > 0 {
    return s.w.NO(cmd.Tag, "AUDITLOG permission denied")   // cross-user always denied
}
targetUsername := s.user.Username
```

The cross-user branch now returns *before* any privilege check, so even a wrongly-promoted
agent gains nothing. Self-audit (no-arg) and normal IMAP mail are untouched. Verified:
`AUDITLOG` (self) and `SELECT INBOX` succeed; `AUDITLOG <other>` → `NO permission denied`;
full round-trip ~4 ms.

---

## 6. d3pl0y: suid VM privilege escalation

**Stack:** Python/FastAPI + a Hare bytecode VM (`/api` prefix; HTTP Basic
`username:token`). Users upload "objects" and execute them; flags live in private objects.

### Vulnerability

`execute(suid=True)` runs an object **as its owner** (`caller = owner`; inside the VM,
`op_getobj` authorizes reads with `caller`'s identity), gated by an `s` permission, and
`set_share` permitted granting `s` to the wildcard receiver `*public`. Any object with a
public `s`-allow could be run, as its owner, by anyone → the VM program reads the owner's
private objects (flags).

### Exploitation

Invoke `execute(owner=victim, name=<object with public s>, suid=True)` with VM code that
reads the victim's flag object: the run executes with the victim's read rights.

### Patch status: **reverted, currently unpatched**

Our first fix blocked `*public` `s`-allow grants in `set_share`. This **broke SLA**: the
checker legitimately creates `*public` `s` shares as part of normal operation
(`set_permission … failed: 400`). We reverted.

The correct fix must live in the **VM's `op_getobj` under suid**: constrain what a suid
run may read rather than forbidding the public share: which needs Hare work and an
accurate baseline of the checker's suid usage. This service is **parked**; anyone resuming
it must baseline the checker's exact suid flow before changing code.

> **Lesson.** This is the canonical "don't patch on a hypothesis about the checker" case: > the obvious fix over-restricted a path the checker depends on. Baseline the legitimate
> flow first, every time.

---

## 7. greple: availability fix (Zig)

**Stack:** Zig (search/paste/shorturl/user app), ~3,100 LOC. `echo.py` is a decoy sidecar.

We did **not** find/patch the flag vulnerability here. We did apply an
organizer-distributed availability fix for a `FileNotFound` crash on `/console`
(`main.zig` skips users whose record is missing on `error.FileNotFound`; `templates.zig`
renders a row only when the user is present), rebuilt with `--no-cache`, and restored the
endpoint (200). This recovered SLA only; the actual exploit remains open. Backups at
`src/*.zig.bak`.

*(Any externally-provided patch was read in full before deployment to confirm it was a
genuine availability fix and not a trojan.)*

---

## 8. funsplash: partial-coverage image censor

**Stack:** Gleam (compiles to Erlang) + Postgres. Photo-sharing app with public/premium/
private photos.

**No SQL injection:** all queries are parameterized (`pog` with `$1`/`$2`). Access control
on private photos is correct (`get_data_private` requires login and `creator == user.id`).

The real weakness is the **premium censor**. Premium photos serve a "censored" copy from
`/photos_premium/` to non-premium users. `premium_mask` (Erlang) builds a **fixed black
rectangle covering only the center third** of the image (⅓: ⅔ in both axes); `apply_mask`
overwrites covered pixels (destructive there) but leaves the **outer two-thirds in
cleartext**. So flag content outside the center box leaks in the "censored" version.
(Secondary candidates: trivial premium-status acquisition, or the path selection in
`get_data_premium`.)

We chose **not to patch** this under the round timer: fixing the censor means changing
custom PNG image-processing (whole-image or destructive masking) without breaking the
checker's PNG validation: high risk of an SLA regression for a difficult, uncertain fix.
A correct approach would first empirically upload a premium photo, download
`/premium_photo-<asset>`, observe exactly what leaks, and design the censor fix against
that baseline.

---

## 9. superregister & mediocre: analyzed, not patched

**superregister** (Go) ships only a **compiled binary** (plus a committed `vm_priv.pem` and
sqlite): no source. Patching would require reverse engineering; low ROI, left alone.

**mediocre** is an emulated 1980s **PDP-11 running DSM (MUMPS)** medical-records mainframe,
reached via telnet through haproxy (:1980). Flags are patient records; the intended vuln is
a weak/default privileged login (e.g. the classic `MGR` account) that reads all records.
We left it unpatched: there is no application source, the "code" runs inside a `.dsk` disk
image, and it consists of nine interdependent SimH containers with long boot healthchecks, so any edit carries a large risk of zeroing the service's SLA. Its emulator containers were
also the dominant CPU load on the box.

---

## 10. Operational lessons (SLA)

In A/D, availability is most of the score, and our worst moments were self-inflicted, not
attacks:

1. **Reconcile the whole stack after every build.** After `docker compose ... --build <svc>`,
   run a bare `docker compose up -d` so sibling proxies (nginx/haproxy) re-resolve upstream
   IPs. A stale cached IP caused a `/pay/*` 502 on leet-date.
2. **Validate interpreted code before rebuilding.** A stray `):` crash-looped d3pl0y for
   minutes. `python3 -c "import ast; ast.parse(open('f').read())"` catches it pre-deploy.
   Compiled services (Go/Rust/Zig/C#) fail the build instead and leave the old container
   running: safer.
3. **Baseline the checker's legit flow before patching.** The d3pl0y over-restriction broke
   a path the checker relied on. Never patch on an assumption about the checker.
4. **Work from the live box, not the initial image.** Several services had drifted from the
   distributed tarball.
5. **Monitoring can starve the game.** Our Arkime/Elasticsearch instance consumed ~17 GB of
   RAM and caused checker timeouts ("responding too slow") across services. Run heavy
   monitoring only while actively investigating; raw pcaps remain grep-able without it.
6. **"Too slow" is not "wrong patch."** A service that answers a manual request in
   milliseconds but shows orange on the scoreboard is a *latency/contention* problem: a
   patch that closes a vuln never costs SLA by itself. Diagnose latency directly; don't
   revert a security fix to chase an SLA blip.

---

*Patched & verified: leet-date, SignMeMaybe, flagdrive, OverEats, inbox. Availability fix:
greple. Analyzed / parked: d3pl0y (reverted), funsplash, superregister, mediocre.*
