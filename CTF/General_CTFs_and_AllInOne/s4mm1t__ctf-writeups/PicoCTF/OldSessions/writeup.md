# Old Sessions

**Platform:** picoCTF (CyLab Security Academy)
**Category:** Web Exploitation
**Difficulty:** Easy
**Date:** 2026-05-31
**Tags:** `session-hijacking` `cookies` `web` `authentication`

---

## TL;DR

The web app never expires user sessions. A public `/sessions` endpoint leaks all active session tokens: including admin's. Replacing your session cookie with the admin's token grants full access and reveals the flag.

---

## Description

> Proper session timeout controls are critical for securing user accounts. If a user logs in on a public or shared computer but doesn't explicitly log out, and session expiration dates are misconfigured, the session may remain active indefinitely.

The challenge gives us a social media platform called "The New Twitter" and tells us sessions never expire. Our goal: find the flag.

---

## Recon

### First Look

Opened the site: just a login/register page. No obvious entry points on the surface.

Registered an account with generic credentials and logged in. The homepage showed a feed with a few comments from other users.

**This comment immediately stood out:**

> `mary_jones_8992`: *"Hey I found a strange page at /sessions"*

That's not a random comment: that's the hint baked into the challenge. A user reporting a suspicious endpoint is a classic OSINT/recon signal.

### Checking the /sessions endpoint

Navigated to `/sessions` directly:

```
http://dolphin-cove.picoctf.net:<port>/sessions
```

Response:
```
1) session:GSoe-wV8rZUpG-jIHVfuYHXX8CnrcMJcuu9hbAzQ6FA, {'_permanent': True, 'key': 'admin'}
2) session:q8r9D7p7fgzh4usStyIU8avejvQe1HLB25wNpTiMZ10, {'_permanent': True, 'key': '1'}
```

Two active sessions: one belonging to `admin`, one to my account (key: 1). Both marked `_permanent: True`, confirming sessions never expire.

**Key insight:** The endpoint is publicly accessible without authentication. Any logged-in user can see every active session token on the server: including privileged ones.

---

## Exploitation

### Session Hijacking

The attack is straightforward: replace my session cookie with the admin's token.

1. Opened **DevTools → Application → Cookies**
2. Found the `session` cookie for the domain
3. Double-clicked the value and replaced it with the admin session token:

```
GSoe-wV8rZUpG-jIHVfuYHXX8CnrcMJcuu9hbAzQ6FA
```

4. Refreshed the page

The server accepted the token and authenticated me as `admin`: no password required.

---

## Flag

Homepage displayed after session hijack:

```
Welcome admin
picoCTF{s3t_s3ss10n_3xp1rat10n5_7139c037}
```

---

## Why This Worked

Two vulnerabilities chained together:

**1. Sessions never expire (`_permanent: True`)**
Once a session is created, it lives forever. There's no timeout, no rotation, no invalidation on logout.

**2. Unauthenticated `/sessions` endpoint**
The server exposes all active sessions: including their raw tokens: to any logged-in user. This turns a configuration flaw into a full account takeover.

Either vulnerability alone is bad. Together they're critical: an attacker just needs to register, visit `/sessions`, grab any token, and become that user.

---

## Key Takeaways

- **Always set session expiration**: `_permanent: True` without a `PERMANENT_SESSION_LIFETIME` is a misconfiguration
- **Never expose session data**: internal session stores should never be publicly routable
- **Session tokens = passwords**: treat them with the same sensitivity

---

## References

- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [CWE-613: Insufficient Session Expiration](https://cwe.mitre.org/data/definitions/613.html)
- [Flask Session Security](https://flask.palletsprojects.com/en/stable/security/#set-cookie-options)
