# meh

| Field | Details |
|-------|---------|
| **Challenge** | meh |
| **Platform** | themctf.com |
| **Category** | Web |
| **Flag** | `THEM?!CTF{an0ther_4noth3r_sh1t_ch4lleng3_f5bc552656c9a3d06c3f890}` |

---

## Overview

A basic web app with user profiles. The flag is stored in the `admin` user's profile and is exposed via an Insecure Direct Object Reference (IDOR) vulnerability in the profile endpoint.

---

## Steps

**1. Register**: create any account.

**2. Login**: after login you land on your own profile:

```
http://45.130.164.173:30205/profile/e1
```

**3. Visit the admin profile directly**: substitute your username for `admin` in the URL:

```
http://45.130.164.173:30205/profile/admin
```

The server returns the admin's profile page without any authorisation check, leaking the flag in the `Constellation` field.

---

## Root Cause

The `/profile/<username>` endpoint performs no session-based access control: it serves any user's data to any authenticated (or possibly unauthenticated) requester. Switching the path parameter from your own username to `admin` is sufficient to read their profile.

---

## Flag

```
THEM?!CTF{an0ther_4noth3r_sh1t_ch4lleng3_f5bc552656c9a3d06c3f890}
```
