# 🔎 Parameter Fuzzing
## 📋 Contents

- [What is a Parameter: Plain English](#-what-is-a-parameter--plain-english)
- [Why Parameter Fuzzing Leads to Vulnerabilities](#-why-parameter-fuzzing-leads-to-vulnerabilities)
- [ffuf: Parameter Fuzzing](#-ffuf--parameter-fuzzing)
- [Arjun: Dedicated Parameter Discovery](#️-arjun--dedicated-parameter-discovery)
- [Testing Found Parameters](#-testing-found-parameters)
- [How to Find the Default Response Size](#-how-to-find-the-default-response-size)
- [Recommended Parameter Fuzzing Workflow](#-recommended-parameter-fuzzing-workflow)
- [CTF vs Professional Use](#️-ctf-vs-professional-use)

---

You found the page. You found the API endpoint. But the real vulnerability is often hiding one layer deeper: in a parameter you didn't know existed. Parameter fuzzing is the technique of finding hidden inputs that the application never told you about. This is where SQL injection, Local File Inclusion, SSRF, and IDOR vulnerabilities live.

---

## 🧠 What is a Parameter: Plain English

A parameter is an input you send to a web application that changes what it does or what it returns.

You've seen them in URLs your whole life:
```
https://shop.example.com/products?category=shoes&sort=price&page=2
```

Everything after the `?` is parameters:
- `category=shoes`: filter by category
- `sort=price`: sort by price
- `page=2`: show page 2

The application reads these values and uses them to fetch data, filter results, or change behavior. Parameters also exist in form submissions (POST requests): login forms, search boxes, file uploads: where they're sent in the request body instead of the URL.

**Why hidden parameters exist:**
- Developers add debug parameters during development and forget to remove them
- Internal parameters used by the frontend are never documented publicly
- Old parameters from previous versions of the application still work
- Parameters that were intentionally hidden to obscure functionality

---

## 💀 Why Parameter Fuzzing Leads to Vulnerabilities

Hidden parameters are dangerous because they're often:
- Not validated properly: the developer didn't expect anyone to find them
- Not sanitized: user input goes directly into database queries or file operations
- Not authenticated: accessible without proper permission checks

**The vulnerability chain:**
```
Find hidden parameter
        ↓
Test what it accepts
        ↓
Send unexpected input
        ↓
SQL Injection / LFI / SSRF / IDOR
        ↓
Data exposure / Remote Code Execution / Privilege Escalation
```

**Common vulnerabilities found through parameter fuzzing:**

| Vulnerability | What it is | Example |
|---|---|---|
| **SQLi** (SQL Injection) | User input goes into a database query | `?id=1' OR '1'='1` |
| **LFI** (Local File Inclusion) | User input used to load a file | `?page=../../../../etc/passwd` |
| **SSRF** (Server-Side Request Forgery) | Server makes requests based on user input | `?url=http://internal-server` |
| **IDOR** (Insecure Direct Object Reference) | Changing an ID gives you someone else's data | `?user_id=1337` |
| **RCE** (Remote Code Execution) | Input gets executed as code | `?cmd=whoami` |

---

## ⚡ ffuf: Parameter Fuzzing

ffuf is the best tool for parameter fuzzing because of its flexible `FUZZ` keyword placement and powerful filtering options.

### Finding Hidden GET Parameters
```bash
# Fuzz parameter names: what parameters does this endpoint accept?
ffuf -u "http://<target>/page?FUZZ=value" \
  -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \
  -fs <default_response_size>

# Fuzz parameter values: what values does this parameter accept?
ffuf -u "http://<target>/page?id=FUZZ" \
  -w /usr/share/seclists/Fuzzing/integers.txt \
  -fs <default_response_size>

# Fuzz both parameter name and value simultaneously
ffuf -u "http://<target>/page?FUZZ=test" \
  -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \
  -mc 200,301,302,403
```

### Finding Hidden POST Parameters
```bash
# Fuzz POST parameter names
ffuf -u "http://<target>/login" \
  -X POST \
  -d "FUZZ=value" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \
  -fs <default_response_size>

# Fuzz POST parameter values
ffuf -u "http://<target>/login" \
  -X POST \
  -d "username=admin&password=FUZZ" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -w /usr/share/wordlists/rockyou.txt \
  -fc 401,403
```

### JSON Body Fuzzing
```bash
# Fuzz JSON parameter names
ffuf -u "http://<target>/api/v1/user" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"FUZZ":"value"}' \
  -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \
  -fs <default_response_size>

# Fuzz JSON parameter values
ffuf -u "http://<target>/api/v1/user" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"id":"FUZZ"}' \
  -w /usr/share/seclists/Fuzzing/integers.txt \
  -fs <default_response_size>
```

---

## 🛠️ Arjun: Dedicated Parameter Discovery

Arjun is a tool specifically built for finding hidden HTTP parameters. It's smarter than simple fuzzing: it analyzes response differences to identify parameters the application actually responds to.

### Installation

**Linux/macOS:**
```bash
pip3 install arjun
```

**Windows:**
```bash
pip install arjun
```

Official documentation: https://github.com/s0md3v/Arjun

### Commands
```bash
# Basic GET parameter discovery
arjun -u http://<target>/page

# POST parameter discovery
arjun -u http://<target>/page -m POST

# JSON parameter discovery
arjun -u http://<target>/api/endpoint -m JSON

# With custom headers (for authenticated endpoints)
arjun -u http://<target>/page -H "Authorization: Bearer <token>"

# Save output
arjun -u http://<target>/page -o arjun-output.json

# Use custom wordlist
arjun -u http://<target>/page -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt

# Increase threads for speed
arjun -u http://<target>/page -t 10
```

**What Arjun output looks like:**
```
[+] Parameters found: 3
    - id
    - debug
    - admin
```

Those three parameters exist and the application responds differently when you send them. Now you test each one.

---

## 🧪 Testing Found Parameters

Once you've found hidden parameters, test them for vulnerabilities:

### SQL Injection Quick Test
```bash
# Manual test
curl "http://<target>/page?id=1'"
curl "http://<target>/page?id=1 OR 1=1"

# Automated with sqlmap
sqlmap -u "http://<target>/page?id=1" --batch --dbs
```

### Local File Inclusion Quick Test
```bash
# Linux
curl "http://<target>/page?file=../../../../etc/passwd"
curl "http://<target>/page?page=../../../etc/passwd"

# Windows
curl "http://<target>/page?file=../../../../windows/win.ini"
```

### SSRF Quick Test
```bash
# Point it at your own machine: does it connect back?
curl "http://<target>/page?url=http://<your-ip>:8080"

# Point at internal resources
curl "http://<target>/page?url=http://127.0.0.1"
curl "http://<target>/page?url=http://169.254.169.254"  # AWS metadata
```

### IDOR Quick Test
```bash
# If you're user 1337: can you access user 1?
curl "http://<target>/api/profile?user_id=1" -H "Authorization: Bearer <your-token>"
curl "http://<target>/api/profile?user_id=2" -H "Authorization: Bearer <your-token>"
```

### Command Injection Quick Test
```bash
curl "http://<target>/page?cmd=id"
curl "http://<target>/page?cmd=whoami"
curl "http://<target>/page?ip=127.0.0.1;id"
curl "http://<target>/page?ip=127.0.0.1|whoami"
```

---

## 🔍 How to Find the Default Response Size

Before you can filter false positives you need to know the default response size: what the application returns when a parameter doesn't exist or isn't recognized.
```bash
# Run ffuf briefly without a filter to see default responses
ffuf -u "http://<target>/page?FUZZ=test" \
  -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \
  -t 10

# Look at the output: most responses will have the same size
# That size is your false positive: filter it with -fs
# Example: if most show "Size: 1234" then add -fs 1234 to your real scan
```

---

## 🔄 Recommended Parameter Fuzzing Workflow
```bash
# Step 1: find hidden parameters with Arjun
arjun -u http://<target>/page
arjun -u http://<target>/api/endpoint -m POST

# Step 2: fuzz parameter values with ffuf
ffuf -u "http://<target>/page?id=FUZZ" \
  -w /usr/share/seclists/Fuzzing/integers.txt \
  -fs <default_size>

# Step 3: test each found parameter for common vulnerabilities
# SQLi
sqlmap -u "http://<target>/page?id=1" --batch

# LFI
ffuf -u "http://<target>/page?file=FUZZ" \
  -w /usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt \
  -fs <default_size>

# Step 4: test POST parameters the same way
arjun -u http://<target>/login -m POST
```

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| Parameter fuzzing | Always run it | Always run it: high finding potential |
| SQLi testing | Sqlmap full auto | Manual first, then sqlmap with permission |
| LFI testing | Go for it | Check scope: file reads can expose sensitive data |
| SSRF testing | Go for it | Be careful: SSRF can reach internal infrastructure |
| Command injection | Exploit immediately | Document: critical finding, don't execute destructive commands |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*