# 🍪 CookieCrumb Bakery (Web: Session Forgery)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 (CydeaRange) |
| Category | Web Exploitation |
| Tools Used | Burp Suite, browser, Google |

---

## 🧩 Description

A bakery-themed login page with a plain sign-in form: username, password,
"Sign in". Nothing else visible on the page.

---

## 🔍 Reconnaissance

**Step 1: Try default/guessable creds**

No account was ever handed out for this one. Tried the obvious first:

```
username: guest
password: guest
```

Logged straight in: default credentials left enabled.

---

## ⚔️ Attack Process

**Step 1: Capture the authenticated request**

With Burp Suite's proxy running, refreshed a page while logged in as
`guest` and intercepted the request. The `Cookie` header carried a
`PHPSESSID` value that was clearly not random session noise: it was a
clean 32-character hex string, the exact shape of an MD5 hash.

**Step 2: Recognize the hash**

A guest session shouldn't normally *be* a recognizable hash. The natural
guess: the session ID is `md5(username)`. Checked it against the MD5 of
`"admin"`: googled `md5 hash of admin` to get the reference value.

**Step 3: Swap the session cookie**

In Burp Repeater, replaced the `PHPSESSID` cookie value with `md5("admin")`
and forwarded the request: impersonating the admin session without ever
knowing the admin password.

**Step 4: Read the response**

The forged request came back authenticated as `admin`, and the flag was
sitting right in the response body.

---

## 🚩 Flag
```
flag{...}   <!-- fill in exact string -->
```

---

## 💡 Lessons Learned

- Never derive session identifiers from a predictable, hashable value
  (username, email, timestamp): an attacker only needs to guess the
  input, not brute-force the session space
- A "guest" account that's left enabled is often the fastest way into
  the rest of an app's session-handling logic
- Burp Repeater + a single cookie swap is enough to fully break session
  integrity when the session ID isn't cryptographically random

---

## 🛠️ Tools Used

- **Burp Suite**: intercepting and forging the session cookie
- **Google**: reference MD5 hash lookup

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
