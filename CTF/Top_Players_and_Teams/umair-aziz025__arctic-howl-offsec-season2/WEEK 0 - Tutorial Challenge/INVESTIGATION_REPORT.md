<div align="center">*[Image: Tutorial Challenge]*</div>

---

# Tutorial Challenge Writeup
## OffSec Arctic Howl CTF: Tundra Realm

---

## Challenge Overview

**Difficulty:** Tutorial / Beginner  
**Category:** Web Server Forensics  
**Objective:** Analyze web server access logs to identify an attack and data breach  
**Files Provided:**
- `tutorial.txt` - Contains a flag
- `access.log` - Apache/Nginx web server access logs

---

## Part 1: Tutorial Flag Extraction

### Question
What is the flag in tutorial.txt?

### Answer
```
TryHarder
```

### Solution Steps

1. **Extract the tutorial file from the provided ZIP:**
   ```bash
   unzip 49fbd8f1cf0f2755d4f29ef3210cb147-tutorial.zip
   cd tutorial
   ```

2. **Inspect the file contents:**
   ```bash
   cat tutorial.txt
   ```

   **Output:**
   ```
   VGhlIGFuc3dlciB0byB0aGlzIGV4ZXJjaXNlIGlzICdUcnlIYXJkZXInIC0gbm90IGV4YWN0bHkgb3JpZ2luYWwsIGJ1dCBjbGVhcmx5IGVmZmVjdGl2ZS4gSW4gdGhlIGludGVyZXN0IG9mIHNhdmluZyB0aW1lLCBJJ3ZlIGFscmVhZHkgZXh0cmFjdGVkIHRoZSBBcGFjaGUgYWNjZXNzIGxvZyBmcm9tIHRoZSBzZXJ2ZXIgYW5kIGluY2x1ZGVkIGl0IGluIHRoZSBmaWxlcyBmb3IgdGhpcyBleGVyY2lzZS4gVGhlIGFjY2VzcyBsb2cgY29udGFpbnMgZXZlcnkgcmVxdWVzdCBtYWRlIHRvIHRoZSBzZXJ2ZXIgaW4gdGhlIGxhc3QgNDggaG91cnMuCgpJJ3ZlIGFsc28gaW5jbHVkZWQgdGhlIHNvdXJjZSBjb2RlIGZvciB0aGUgd2ViIGFwcGxpY2F0aW9uIGluIGNhc2UgeW91IHdhbnQgdG8gdW5kZXJzdGFuZCBob3cgaXQgd29ya3MuIEJ1dCB0byBiZSBob25lc3QsIHlvdSBkb24ndCByZWFsbHkgbmVlZCB0byBsb29rIGF0IHRoZSBjb2RlIHRvIGZpZ3VyZSBvdXQgd2hhdCBoYXBwZW5lZCDigJMganVzdCBhbmFseXplIHRoZSBsb2dzLgoKPCEtLW1vcmUgZmxhdm9ydGV4dA==
   ```

3. **Recognize Base64 encoding** (the `==` padding at the end is a giveaway)

4. **Decode the Base64 string:**
   ```bash
   base64 -d tutorial.txt
   ```

   **Decoded Output:**
   ```
   The answer to this exercise is 'TryHarder' - not exactly original, but clearly effective. In the interest of saving time, I've already extracted the Apache access log from the server and included it in the files for this exercise. The access log contains every request made to the server in the last 48 hours.

   I've also included the source code for the web application in case you want to understand how it works. But to be honest, you don't really need to look at the code to figure out what happened: just analyze the logs.

   <!--more flavortext--[truncated]
   ```

5. **Extract the flag:** `TryHarder`

### Key Takeaways
- Always check for common encoding schemes (Base64, hex, URL encoding)
- Base64 strings are often recognizable by character set (`A-Za-z0-9+/=`) and padding
- Use tools: `base64 -d` on Linux/Mac, `[System.Convert]: FromBase64String()` on PowerShell

---

## Part 2: Web Server Attack Analysis

### Question
Analyze the file `access.log` and determine how the attacker gained access to the server and identify what data they were able to extract.

### Context
The access log contains 48 hours of HTTP requests to a web server. The goal is to identify malicious activity and determine what data was compromised.

---

### Attack Analysis

#### 1. Attacker's IP Address
**Answer:**  
```
192.168.1.101
```

**How to find:**
```bash
# Look for suspicious patterns in the log
grep -E "(\.\.\/|%2e%2e|etc/passwd|\.ssh)" access.log

# Identify the source IP
grep "../../../../" access.log | awk '{print $1}' | sort -u
```

**Result:** All malicious requests originated from `192.168.1.101`

---

#### 2. Attack Timestamp
**Answer:**  
```
01/Oct/2025:08:17:55 +0000
```

**Log Entry:**
```
192.168.1.101 - - [01/Oct/2025:08:17:55 +0000] "GET /public/plugins/welcome/../../../../../../../../home/dave/.ssh/id_rsa HTTP/1.1" 200 1678
```

- **Date:** October 1, 2025
- **Time:** 08:17:55 UTC
- **Response Code:** 200 (success)
- **Bytes Transferred:** 1,678 bytes

---

#### 3. Attack Vector
**Answer:**  
```
Path Traversal / Directory Traversal Vulnerability
```

**Technical Details:**

**Vulnerable Request:**
```http
GET /public/plugins/welcome/../../../../../../../../home/dave/.ssh/id_rsa HTTP/1.1
```

**How it works:**
1. Web application serves files from `/public/plugins/welcome/`
2. Attacker appends `../../../../../../../../` to traverse up directories
3. Path resolves to root filesystem `/`
4. Accesses sensitive file outside web root: `/home/dave/.ssh/id_rsa`

**Effective Path:**
```
/public/plugins/welcome/../../../../../../../../home/dave/.ssh/id_rsa
→ /public/plugins/../../../../../../../../home/dave/.ssh/id_rsa
→ /public/../../../../../../../../home/dave/.ssh/id_rsa
→ /../../../../../../../../home/dave/.ssh/id_rsa
→ /home/dave/.ssh/id_rsa
```

**Vulnerability:** The web server did not properly sanitize user input or restrict file access to the web root directory.

---

#### 4. Data Extracted
**Answer:**  
```
SSH Private Key (id_rsa) belonging to user "dave"
```

**Evidence:**
- **File Path:** `/home/dave/.ssh/id_rsa`
- **HTTP Status:** `200 OK` (successful download)
- **File Size:** `1,678 bytes` (typical size for RSA private key)
- **Content Type:** Text file (private key)

**What is an SSH Private Key?**
- Used for passwordless authentication to SSH servers
- Acts as a cryptographic identity
- Equivalent to a password (but more powerful)

---

#### 5. Impact & Attacker Capabilities

**What can the attacker do with dave's private key?**

1. **SSH Access:**
   ```bash
   ssh -i stolen_id_rsa dave@target-server.com
   ```
   - Login as user "dave" without knowing password
   - Access all files dave can access
   - Run commands as dave

2. **Lateral Movement:**
   - Use dave's account to access other systems
   - Check for SSH keys or credentials in dave's home directory
   - Pivot to other servers where dave has access

3. **Privilege Escalation:**
   - Check if dave has sudo permissions
   - Search for misconfigurations or vulnerabilities
   - Potentially gain root access

4. **Persistence:**
   - Add new SSH keys to dave's `authorized_keys`
   - Maintain access even if password is changed
   - Install backdoors

5. **Data Exfiltration:**
   - Access sensitive files owned by dave
   - Read email, documents, source code
   - Steal intellectual property or customer data

---

### Attack Timeline Reconstruction

**Step 1: Reconnaissance (Not shown in logs)**
- Attacker likely scanned the web application
- Identified plugin directory structure
- Tested for path traversal vulnerability

**Step 2: Exploitation**
```
01/Oct/2025:08:17:55 +0000
GET /public/plugins/welcome/../../../../../../../../home/dave/.ssh/id_rsa
→ Response: 200 OK, 1678 bytes
```

**Step 3: Post-Exploitation (Likely)**
- Attacker downloads the private key
- Attempts SSH login: `ssh -i id_rsa dave@target-ip`
- Gains shell access to the server

**Step 4: Potential Next Actions**
- Establish persistence
- Escalate privileges
- Exfiltrate additional data
- Cover tracks (delete logs)

---

## Detection & Prevention

### How to Detect This Attack

**1. Log Analysis:**
```bash
# Detect path traversal attempts
grep -E "(\.\.\/|\.\.\\|%2e%2e)" access.log

# Find successful exfiltration (200 response to traversal)
grep -E "(\.\.\/|%2e%2e)" access.log | grep " 200 "

# Identify sensitive file access
grep -E "(id_rsa|passwd|shadow|authorized_keys)" access.log
```

**2. Intrusion Detection System (IDS) Rules:**
```
alert http any any -> any any (
    msg:"Path Traversal Attempt";
    content:"../";
    nocase;
    classtype:web-application-attack;
    sid:1000001;
)
```

**3. File Integrity Monitoring:**
- Monitor access to sensitive files (`/home/*/.ssh/*`)
- Alert on unusual file reads by web server process

**4. Behavioral Analysis:**
- Web server process (`www-data`, `nginx`) accessing SSH keys is abnormal
- Unexpected outbound SSH connections after web request

---

### How to Prevent This Attack

**1. Input Validation:**
```python
# Python example
import os

def safe_path_join(base_dir, user_input):
    # Resolve to absolute path
    requested_path = os.path.abspath(os.path.join(base_dir, user_input))
    
    # Ensure the path is within base_dir
    if not requested_path.startswith(os.path.abspath(base_dir)):
        raise ValueError("Path traversal attempt detected")
    
    return requested_path
```

**2. Web Server Configuration:**

**Nginx:**
```nginx
location /public/ {
    alias /var/www/public/;
    # Prevent directory traversal
    if ($request_uri ~* "\.\.") {
        return 403;
    }
}
```

**Apache:**
```apache
<Directory /var/www/public>
    # Deny access to parent directories
    AllowOverride None
    Options -Indexes -FollowSymLinks
</Directory>
```

**3. Filesystem Permissions:**
```bash
# Web server should NOT have read access to SSH keys
chmod 600 /home/dave/.ssh/id_rsa
chown dave:dave /home/dave/.ssh/id_rsa

# Restrict web server user permissions
usermod -s /sbin/nologin www-data
```

**4. Security Hardening:**
- Run web server in a chroot jail
- Use SELinux/AppArmor to restrict file access
- Implement Web Application Firewall (WAF)
- Regular security audits and penetration testing

**5. Monitoring & Response:**
- Real-time log analysis (SIEM)
- Alert on path traversal patterns
- Automated blocking of malicious IPs
- Incident response procedures

---

## Solution Summary

### Question 1: Tutorial Flag
**Flag:** `TryHarder`  
**Method:** Base64 decode tutorial.txt

---

### Question 2: Attack Analysis

| Question | Answer |
|----------|--------|
| **Attacker IP** | 192.168.1.101 |
| **Attack Time** | 01/Oct/2025:08:17:55 +0000 |
| **Attack Type** | Path Traversal / Directory Traversal |
| **Vulnerable Endpoint** | /public/plugins/welcome/ |
| **Malicious Request** | `GET /public/plugins/welcome/../../../../../../../../home/dave/.ssh/id_rsa` |
| **Data Stolen** | SSH Private Key (id_rsa) |
| **File Size** | 1,678 bytes |
| **HTTP Response** | 200 OK (successful) |
| **Impact** | Unauthorized SSH access to server as user "dave" |

---

## Key Takeaways

### Technical Skills Learned
1. **Log Analysis:** Parse Apache/Nginx logs to identify attacks
2. **Path Traversal:** Understand how `../` sequences bypass access controls
3. **SSH Keys:** Recognize the value of private keys in post-exploitation
4. **Base64 Decoding:** Use encoding/decoding tools for CTF challenges

### Security Principles
1. **Input Validation:** Never trust user input
2. **Principle of Least Privilege:** Web servers shouldn't access SSH keys
3. **Defense in Depth:** Multiple security layers (WAF, IDS, file permissions)
4. **Logging & Monitoring:** Detect attacks through log analysis

### Real-World Relevance
- Path traversal is a common vulnerability (OWASP Top 10)
- SSH key theft enables persistent access
- Many breaches start with simple web vulnerabilities
- Proper log analysis can detect attacks before major damage

---

## Tools Used

- `cat` - View file contents
- `base64` - Decode Base64 strings
- `grep` - Search logs for patterns
- `awk` - Extract specific fields from logs
- `sort` / `uniq` - Identify unique IPs

---

## Challenge Reflection

This tutorial challenge effectively teaches:
- **Forensic Analysis:** Reconstructing attacks from logs
- **Web Security:** Understanding common vulnerabilities
- **Impact Assessment:** Evaluating the severity of data breaches
- **Defensive Thinking:** Learning how to prevent similar attacks

The challenge simulates a real-world scenario where an analyst must investigate a suspected breach using only access logs. This is a fundamental skill for:
- Security Operations Center (SOC) analysts
- Incident responders
- Penetration testers (understanding attacker perspective)
- Web developers (secure coding practices)

---

**Tutorial Challenge: COMPLETE ✅**

---

*Writeup completed: March 4, 2026*  
*Event: OffSec Arctic Howl: Tundra Realm*  
*Challenge: Tutorial: Web Server Attack Analysis*  
*Difficulty: Beginner*
