# Hammer: CTF Walkthrough (TryHackMe)

**Platform:** TryHackMe  
**Room:** Hammer  
**Difficulty:** Medium  
**Category:** Web  
**Scope:** `http://hammer.thm:1337` (SSH not tested)

This walkthrough is written for an authorized CTF environment (TryHackMe). Do not reuse these techniques on systems you don’t own or have explicit permission to test.

---

## 0) Setup

Add the target hostname locally:

```bash
echo "$TARGET_IP hammer.thm" | sudo tee -a /etc/hosts
ping -c 3 hammer.thm
```

---

## 1) Recon

### 1.1 Port scan

A quick scan identified two relevant services:

- `22/tcp` (SSH)
- `1337/tcp` (HTTP)

*(I focused on the web service for this room.)*

### 1.2 Web fingerprint

Browsing `http://hammer.thm:1337` showed a login/reset flow. Basic fingerprinting indicated:

- Apache (Ubuntu)
- PHP session cookie (`PHPSESSID`)
- Standard web stack assets (Bootstrap, JS/CSS)

---

## 2) Web Enumeration (Hidden content)

### 2.1 Clue: directory naming convention

While inspecting the page source, I noticed a developer hint indicating directories follow a prefix pattern:

- `hmr_<name>`

### 2.2 Fuzzing with the prefix

Using `ffuf` against `hmr_` endpoints:

```bash
ffuf -u http://hammer.thm:1337/hmr_FUZZ -w /usr/share/wordlists/dirb/common.txt -mc 200
```

Key discovery:

- `/hmr_logs/`

### 2.3 Log leak → valid user identifier

The logs were accessible from the web root. Reading the error log exposed a valid email:

```text
[... auth failure ...] user tester@hammer.thm ... Invalid email address
```

✅ **Checkpoint:** I now had a valid account identifier: `tester@hammer.thm`

---

## 3) Initial Access (Password reset OTP weakness)

### 3.1 Reset flow overview

The password reset endpoint is:

- `/reset_password.php`

The flow uses a **4-digit OTP**. During testing, I observed:

- A client-side parameter (e.g., `s`) that updates via JavaScript timing
- The OTP validation is server-side; the client-side countdown itself is not a real security control
- The OTP attempt tracking was tied to session behavior (`PHPSESSID`)

### 3.2 Rate limiting behavior

The application rate-limited OTP attempts **by IP**, but it trusted the `X-Forwarded-For` header. That meant:

- Repeating attempts from the same apparent source triggered a block
- Rotating `X-Forwarded-For` avoided the block

Observed responses:

- Same IP after several attempts:
  - `HTTP/1.1 429 Too Many Requests`
  - “Too many attempts. Please try again later.”

- Rotating `X-Forwarded-For`:
  - `HTTP/1.1 200 OK`
  - “Incorrect OTP. Please try again.”

✅ **Checkpoint:** Rate limit could be bypassed by varying `X-Forwarded-For` while keeping the OTP session consistent.

### 3.3 OTP enumeration (CTF context)

Because the OTP is only 4 digits (0000-9999) and rate limiting could be bypassed, the OTP became enumerable in the lab environment.

After obtaining the correct OTP, I completed the reset, logged in as `tester@hammer.thm`, and captured the first flag.

✅ **Checkpoint:** Authenticated access to the dashboard (Flag 1: **[REDACTED]**)

---

## 4) Post-Auth: Command execution + JWT authorization weakness

### 4.1 Finding the command execution feature

Inside the dashboard, there was a feature that accepted JSON and executed a system command.

A benign test confirmed command execution and user context:

**Request**
```http
POST /execute_command.php HTTP/1.1
Host: hammer.thm:1337
Content-Type: application/json
Authorization: Bearer [REDACTED_VALID_JWT]

{"command":"id"}
```

**Response**
```json
{"output":"uid=33(www-data) gid=33(www-data) groups=33(www-data)"}
```

✅ **Checkpoint:** Remote command execution as `www-data` was possible *post-auth*.

### 4.2 JWT observation

The session/authorization used a JWT. The JWT header contained a `kid` field that referenced a **local filesystem path**:

```json
{
  "alg": "HS256",
  "typ": "JWT",
  "kid": "/var/www/html/[REDACTED_KEY_NAME].key"
}
```

Important note (implementation detail):

- The backend resolved `kid` by reading a local file and using its contents as the HMAC secret for verification.
- This is an **insecure key resolution design** (implementation flaw), not a JWT weakness by itself.

### 4.3 Key retrieval and token forgery (lab context)

Because the dashboard already allowed server-side command execution, I used that capability to read the key file referenced by `kid` (redacted in this write-up).

Result:

- `[REDACTED_SECRET_KEY]`

With the signing key, it became possible (in this lab) to forge a JWT with elevated claims (e.g., `role: admin`) and use it to access privileged functionality.

✅ **Checkpoint:** Forged elevated JWT → privileged access → stable command execution as `www-data`

---

## 5) Final Flag

Using the elevated access, I retrieved the final proof file:

**Request**
```http
POST /execute_command.php HTTP/1.1
Host: hammer.thm:1337
Content-Type: application/json
Authorization: Bearer [FORGED_ADMIN_JWT]

{"command":"cat /home/ubuntu/flag.txt"}
```

**Response**
```json
{"output":"THM{[REDACTED_FLAG]}"}
```

✅ **Checkpoint:** Final flag obtained (**[REDACTED]**)

---

