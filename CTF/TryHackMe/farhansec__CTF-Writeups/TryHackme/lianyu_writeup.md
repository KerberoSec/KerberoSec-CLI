```
 ██╗     ██╗ █████╗ ███╗   ██╗    ██╗   ██╗██╗   ██╗
 ██║     ██║██╔══██╗████╗  ██║    ╚██╗ ██╔╝██║   ██║
 ██║     ██║███████║██╔██╗ ██║     ╚████╔╝ ██║   ██║
 ██║     ██║██╔══██║██║╚██╗██║      ╚██╔╝  ██║   ██║
 ███████╗██║██║  ██║██║ ╚████║       ██║   ╚██████╔╝
 ╚══════╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝       ╚═╝    ╚═════╝
           TryHackMe: Lian Yu
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-07 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Medium | ⭐ **Rating:** ⭐⭐⭐☆☆

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

- [x] Port scan: FTP (21), SSH (22), HTTP (80), RPC (111, 37187)
- [x] Confirmed anonymous FTP login blocked
- [x] Web enumeration: found `/island/` and `/island/2100/`
- [x] Discovered hidden word `vigilante` in white text at `/island/`
- [x] Read HTML comment at `/island/2100/`: clue pointing to `.ticket` extension
- [x] Feroxbuster with `.ticket` extension → found `green_arrow.ticket`
- [x] Decoded Base58 token → FTP password `!#th3h00d`
- [x] FTP login as `vigilante`: downloaded three image files
- [x] Stegseek cracked `aa.jpg` passphrase (`password`) → extracted `ss.zip`
- [x] Unzipped `ss.zip` → retrieved `passwd.txt` and `shado` (`M3tahuman`)
- [x] Identified corrupted PNG magic bytes on `Leave_me_alone.png`
- [x] Fixed PNG header in hex editor → image revealed SSH password hint
- [x] SSH login as `slade` with password `M3tahuman`
- [x] Retrieved user flag
- [x] Identified `sudo pkexec` with slade's password
- [x] `sudo pkexec /bin/bash` → root shell
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration (including custom `.ticket` extension)
- 📂 FTP client: authenticated login and file retrieval
- 🔍 Stegseek: steganography brute force against JPEG files
- 🔬 Steghide: extracting hidden data from images
- 🛠️ Hex editor: repairing corrupted PNG magic bytes
- 🔑 Base58 decoder: decoding the FTP password from the ticket file
- 🔐 SSH: authenticated user shell

---

## ⚡ TL;DR

A layered reconnaissance trail: a white-text hidden word on a web page pointed to a directory, an HTML comment hinted at a `.ticket` file extension, and a Feroxbuster scan with that custom extension surfaced a Base58-encoded FTP password. FTP served three images: one with a zip hidden via steghide (cracked passphrase: `password`), one with corrupted PNG magic bytes concealing a password hint. Fixing the header revealed the SSH password; `slade:M3tahuman` got in. `sudo pkexec /bin/bash` finished the job.

---

## 📖 Introduction

Today's target is **Lian Yu**: the Arrow-themed island where Oliver Queen honed his skills, and where the box author hid credentials in increasingly elaborate places. This is the most puzzle-box-style machine in the series so far: no brute force of a login form, no SQLi, no upload bypass. Instead, the path winds through hidden white text, a custom file extension nobody would guess without a clue, steganography brute force, a corrupted image file with deliberately wrong magic bytes, and a Base58 encoding detour. It rewards patient, methodical enumeration over speed.

### Prerequisites

Readers are assumed to know:

- Basic web enumeration and what file extensions mean for discovery tools
- What steganography is and how `steghide`/`stegseek` work
- What PNG magic bytes are and how to fix a corrupted file header in a hex editor
- What Base58 encoding is (commonly used in Bitcoin addresses: not in passwords, until today)

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full-range sweep with RustScan, Nmap for service and version fingerprinting:*

```bash
rustscan -a 10.48.156.154 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 21/tcp | FTP | vsftpd 3.0.2 |
| 22/tcp | SSH | OpenSSH 6.7p1 Debian 5+deb8u8 |
| 80/tcp | HTTP | Apache (title: Purgatory) |
| 111/tcp | RPC | rpcbind 2-4 |
| 37187/tcp | RPC status | RPC #100024 |

Five ports: more interesting than the usual two. The FTP server and `rpcbind` are new additions to this series. Anonymous FTP login was tried immediately and blocked:

```bash
ftp 10.48.156.154
# anonymous → 530 Permission denied.
```

FTP requires credentials. The web server's title is "Purgatory": thematic, and a clue to keep in mind. RPC ports 111 and 37187 are `rpcbind` and its associated `status` service; *these turned out to be irrelevant to the attack path and are likely just artefacts of the box's OS configuration.*

### Web Enumeration: Layer 1

*(~5 mins into the box)*

*Initial Feroxbuster scan with standard extensions:*

```bash
feroxbuster -u http://10.48.156.154 \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
301  http://10.48.156.154/island        # ^^^ key directory
200  http://10.48.156.154/island/index.html
301  http://10.48.156.154/island/2100   # ^^^ deeper
200  http://10.48.156.154/island/2100/index.html
```

### Hidden Word: White Text at `/island/`

Navigating to `/island/` shows what appears to be a single paragraph of in-character text. But `Ctrl+A` to select all, or a glance at the page source: reveals a word rendered in white text against a white background:

```
The Code Word is:
vigilante
```

Invisible to a casual visitor. Visible to anyone who reads the source. The word `vigilante` becomes the FTP username: this isn't obvious yet, but it becomes clear later.

### Web Enumeration: Layer 2: The `.ticket` Clue

The page at `/island/2100/` contains an embedded (unavailable) YouTube video and a single HTML comment:

```html
<!-- you can avail your .ticket here but how? -->
```

The `.ticket` extension is non-standard: nothing would enumerate it by default. This is the box explicitly telling us what to add to Feroxbuster's extension list.

*Re-running Feroxbuster on `/island/2100/` with `.ticket` added:*

```bash
feroxbuster -u http://10.48.156.154/island/2100 \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html,.ticket
```

```
# output
200  http://10.48.156.154/island/2100/green_arrow.ticket   # ^^^ found it
```

*Contents of `green_arrow.ticket`:*

```
RTy8yhBQdscX
```

A short string. Not plaintext, not hex, not Base64 (wrong character set). Base58: the encoding used by Bitcoin addresses, distinguishable because it omits characters `0`, `O`, `I`, and `l` to prevent visual confusion. Decoded:

```
!#th3h00d
```

FTP password confirmed.

---

## 🚪 Foothold

*(~20 mins into the box)*

### FTP Login: Image File Retrieval

Combining the username found in white text (`vigilante`) with the decoded ticket password (`!#th3h00d`):

*FTP login as `vigilante`:*

```bash
ftp 10.48.156.154
# Name: vigilante
# Password: !#th3h00d
# 230 Login successful.
```

*Three files in the FTP root:*

```
-rw-r--r--  Leave_me_alone.png   (511 KB)
-rw-r--r--  Queen's_Gambit.png   (537 KB)
-rw-r--r--  aa.jpg               (186 KB)
```

All three downloaded. Visual inspection: `aa.jpg` shows a soldier, `Queen's_Gambit.png` shows a ship. `Leave_me_alone.png` refuses to open: the file is corrupted.

### Steganography: `aa.jpg`

**What is steganography?** Hiding data inside another file: typically an image: in a way that's invisible to the naked eye. `steghide` embeds data in JPEG/BMP/WAV files behind a passphrase; `stegseek` is a purpose-built brute forcer for steghide-protected files.

*Brute forcing the steghide passphrase on `aa.jpg`:*

```bash
stegseek --crack aa.jpg /usr/share/wordlists/rockyou.txt
```

```
# output
[i] Found passphrase: "password"
[i] Original filename: "ss.zip"
[i] Extracting to "aa.jpg.out"
```

Passphrase: `password`. The hidden payload is a zip archive named `ss.zip`.

*Extracting the zip contents:*

```bash
unzip ss.zip
```

Two files emerge:

- `passwd.txt`: flavour text, no actionable credentials
- `shado`: contains a single string: `M3tahuman`

`M3tahuman` is a password. The filename `shado` is a reference to Shado, a character from the Arrow series: keeping the theme intact.

### Corrupted PNG: Magic Byte Repair

`Leave_me_alone.png` wouldn't open, and `exiftool` confirmed why:

```bash
exiftool Leave_me_alone.png
```

```
Error: File format error
```

*Inspecting the raw hex of the file header:*

```
Corrupt:  58 45 6F AE 0A 0D 1A 0A ...
Correct:  89 50 4E 47 0D 0A 1A 0A ...  (.PNG)
```

**What are magic bytes?** The first few bytes of a file identify its format to the operating system and applications: independently of the file extension. PNG files must begin with the signature `89 50 4E 47 0D 0A 1A 0A`. This file's first four bytes had been deliberately overwritten, breaking the signature and preventing any image viewer from opening it.

*Fixing the header in a hex editor: replacing the corrupt bytes with the correct PNG signature:*

```
Before: 58 45 6F AE 0A 0D 1A 0A
After:  89 50 4E 47 0D 0A 1A 0A
```

The repaired file opened as a valid PNG image, displaying the message:

```
Just leave me alone here is what you want
Password
```

The image confirms `M3tahuman` (extracted from `shado`) is the SSH password.

---

## 🐚 Shell / Access

*(~35 mins into the box)*

Two SSH usernames were known from context: `vigilante` (from the web page) and `slade` (from the Arrow lore and FTP filenames). `vigilante` failed; `slade` with password `M3tahuman` connected cleanly:

```bash
ssh slade@10.48.156.154
```

```
# output (banner)
Way To SSH...
Loading.........Done..
Connecting To Lian_Yu  Happy Hacking

[WELCOME ASCII ART]

slade@LianYu:~$
```

*Collecting the user flag:*

```bash
cat user.txt
```

```
THM{P30P7E_K33P_53CRET5__C0MPUT3R5_D0N'T}
                        --Felicity Smoak
```

---

## 📈 Escalation

*(~36 mins into the box)*

### sudo pkexec: Root Shell

*Checking sudo permissions:*

```bash
sudo -l
```

```
User slade may run the following commands on LianYu:
    (root) PASSWD: /usr/bin/pkexec
```

**What is `pkexec`?** PolicyKit's `pkexec` is designed to allow an authorised user to run a command as another user: similar to `sudo`. When granted via `sudoers` without restriction on which program `pkexec` can *itself* execute, it becomes a direct path to a root shell. Note that unlike previous boxes, this entry uses `PASSWD` rather than `NOPASSWD`: slade's own SSH password (`M3tahuman`) is required to authenticate the `sudo` call.

*Spawning a root shell through pkexec:*

```bash
sudo pkexec /bin/bash
```

```
# prompt for slade's password: M3tahuman
root@LianYu:~#
```

*Collecting the root flag:*

```bash
cat /root/root.txt
```

```
Mission accomplished

You are injected me with Mirakuru:) ---> Now slade Will become DEATHSTROKE.

THM{MY_W0RD_I5_MY_B0ND_IF_I_ACC3PT_YOUR_CONTRACT_THEN_IT_WILL_BE_COMPL3TED_OR_I'LL_BE_D34D}
                                                                      --DEATHSTROKE
```

---

## 💥 Exploitation

The complete attack chain:

1. **White-text hidden word** at `/island/` → FTP username `vigilante`
2. **HTML comment** at `/island/2100/` → `.ticket` extension clue
3. **Feroxbuster** with `.ticket` → `green_arrow.ticket` → Base58 decoded to FTP password `!#th3h00d`
4. **FTP login as `vigilante`** → three image files downloaded
5. **Stegseek on `aa.jpg`** (passphrase: `password`) → `ss.zip` → `shado` file → password `M3tahuman`
6. **PNG magic byte repair** on `Leave_me_alone.png` → image confirmed `M3tahuman` as SSH password
7. **SSH as `slade`** → user flag
8. **`sudo pkexec /bin/bash`** → root shell → root flag

---

## 🐇 Rabbit Holes

### `vigilante` as a Password

The word `vigilante` appeared in white text on `/island/` and immediately *felt* like a password. Anonymous FTP was already blocked, so the obvious next guess was trying `vigilante` as both username and password for FTP: no luck. It turned out to be the username, with the password buried several more steps down the chain. This is the box's main misdirection: give you half a credential early and make you work for the other half.

### `vigilante` SSH Login

After decoding `M3tahuman` from the zip, the first SSH attempt used `vigilante` as the username (since it was the known account name from the web page). That failed: `vigilante` doesn't appear to have a system account with password auth enabled. Switching to `slade` (the other Arrow character whose name appears contextually in the FTP files and theme) worked immediately.

### `Queen's_Gambit.png`: Steghide Dead End

`Queen's_Gambit.png` was run through stegseek and steghide as well. *It appeared to contain no hidden data, or at least nothing extractable with rockyou.txt as the passphrase list.* The box's intended path runs only through `aa.jpg` and `Leave_me_alone.png`.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `THM{P30P7E_K33P_53CRET5__C0MPUT3R5_D0N'T}` | `/home/slade/user.txt` |
| Root | `THM{MY_W0RD_I5_MY_B0ND_IF_I_ACC3PT_YOUR_CONTRACT_THEN_IT_WILL_BE_COMPL3TED_OR_I'LL_BE_D34D}` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Credentials hidden in white-on-white text | Medium | Never embed credentials or hints in HTML: even "invisible" ones; source code is always readable |
| FTP accessible with guessable credentials | High | Disable FTP entirely if not needed; if required, enforce strong passwords and restrict by IP |
| Sensitive files (images with hidden data) served over FTP | High | Never store credential-bearing files on network-accessible servers; restrict FTP directories strictly |
| Password hidden in steganographic zip (`password` passphrase) | High | If steganography must be used for legitimate purposes, use a strong, unique passphrase |
| Corrupted PNG concealing password hint | Medium | Security through obscurity is not security: file header manipulation delays but does not prevent discovery |
| `sudo pkexec /bin/bash` allowed | Critical | Never grant unrestricted `pkexec` via `sudoers`; restrict it to specific, non-shell-spawning operations if required at all |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Enumeration isn't just running the same tools with the same flags every time: Lian Yu's key step was adding `.ticket` to Feroxbuster's extension list based on a clue buried in an HTML comment. Paying attention to what the target is telling you, not just what your tools return by default, is what separates a methodical tester from one who gives up at the first dead end.

---

## 🔁 If I Did It Again

Check the page source of every web page manually before running directory scanners: the `.ticket` clue and the `vigilante` white-text were both in the HTML. Reading those first would have shaved significant scan time and gotten to the FTP credentials faster.

---

## 🔚 Changelog

*Last updated: 2026-06-07*

---

[↑ Back to top](#)
