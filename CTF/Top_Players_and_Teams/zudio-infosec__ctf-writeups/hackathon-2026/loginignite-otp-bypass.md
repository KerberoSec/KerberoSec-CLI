# 🔥 LoginIgnite (Web/API: OTP Validation Bypass)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 (CydeaRange) |
| Category | Web Exploitation / API |
| Tools Used | Gobuster, Burp Suite, browser |

---

## 🧩 Description

A login app with a two-factor flow: username/password, then an OTP step.
No credentials were provided up front: had to be discovered through
recon.

---

## 🔍 Reconnaissance

**Step 1: Enumerate endpoints**

```
$ gobuster dir -u http://target/ -w common.txt
```

Turned up `/api/users/`: an unauthenticated API endpoint listing user
records, including an admin username and password in plain view.

---

## ⚔️ Attack Process

**Step 1: Log in with the leaked admin credentials**

Used the username/password pulled from `/api/users/` to log in normally.
This triggered the second factor: a randomly generated OTP sent to
"verify" the login.

**Step 2: Intercept the OTP verification request**

With Burp Suite's proxy active, submitted the OTP step (with a guessed
or blank code, since the real OTP value wasn't accessible) and
intercepted the outgoing verification request before it reached the
server.

**Step 3: Flip the validity flag**

The intercepted request body carried a field indicating whether the
submitted OTP was valid: `false` by default, since the real code was
never entered. Edited that field directly to `true` in Burp.

**Step 4: Forward and get the flag**

Forwarded the tampered request. The server trusted the client-supplied
validity flag instead of independently re-checking the OTP server-side: login completed as if the OTP had been verified correctly, and the flag
appeared immediately.

---

## 🚩 Flag
```
flag{...}   <!-- fill in exact string -->
```

---

## 💡 Lessons Learned

- Directory/endpoint enumeration (`gobuster`) is worth running even on
  apps that look like plain login forms: hidden API routes often leak
  credentials directly
- OTP/2FA verification must be judged entirely server-side; a
  client-supplied "is this valid" boolean is trivially forgeable in
  Burp
- Trusting any client-controlled state field for an authorization
  decision is the same class of bug regardless of whether it's a
  cookie, a hidden form field, or a JSON body field

---

## 🛠️ Tools Used

- **Gobuster**: endpoint enumeration
- **Burp Suite**: intercepting and tampering with the OTP verification request

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
