# 📚 Wordlists

## 📋 Contents

- [What is a Wordlist: Plain English](#-what-is-a-wordlist--plain-english)
- [Security Warning: Where You Get Wordlists Matters](#️-security-warning--where-you-get-wordlists-matters)
- [SecLists: The Gold Standard](#-seclists--the-gold-standard)
- [SecLists Directory Structure](#-seclists-directory-structure)
- [The Right List for the Right Job](#-the-right-list-for-the-right-job)
- [Password Cracking: John the Ripper](#-password-cracking--john-the-ripper)
- [Building Custom Wordlists with CeWL](#-building-custom-wordlists-with-cewl)
- [Built-in Kali Wordlists](#-built-in-kali-wordlists)
- [Recommended Wordlist Strategy](#-recommended-wordlist-strategy)

---

A wordlist is only as good as what's in it. The right wordlist on the right target is the difference between finding the admin panel in 30 seconds and running a scan for 6 hours that finds nothing. This guide covers what wordlists are, where to get them safely, which ones to use for each scenario, and how to build your own.

---

## 🧠 What is a Wordlist: Plain English

A wordlist is a text file with one entry per line. Your enumeration tool reads the file, sends a request for each entry, and reports back what got a response.

For directory busting, each line is a path: `admin`, `login`, `backup`, `config`.
For subdomain enumeration, each line is a subdomain: `dev`, `staging`, `api`, `mail`.
For password attacks, each line is a password: `password123`, `Welcome1`, `Summer2024`.

The quality of your results depends entirely on the quality of your wordlist. A bad wordlist misses things. A good wordlist finds them.

---

## ⚠️ Security Warning: Where You Get Wordlists Matters

This is important and most guides skip it entirely.

Wordlists are text files: they can't directly harm you. But the sources you download them from can.

**Only download wordlists from:**
- SecLists (GitHub: danielmiessler/SecLists): the gold standard, maintained by security professionals
- Official tool repositories (dirb, dirbuster, gobuster releases)
- Kali Linux built-in lists: pre-installed and vetted

**Never download wordlists from:**
- Random forum posts or Pastebin links
- Unofficial "super wordlist" collections from unknown sources
- Torrent files or file sharing sites
- Any source that requires you to disable antivirus or run a script to "extract" the list

A malicious actor could distribute a wordlist bundled with a script that phones home, exfiltrates data, or installs malware. Text files are safe. Zip archives with extraction scripts, installers, or anything that requires execution: are not.

**The rule:** If it's not on GitHub from a known security researcher or in your OS package manager: don't use it.

---

## 🥇 SecLists: The Gold Standard

SecLists is the most comprehensive collection of security testing wordlists available. It covers directories, subdomains, usernames, passwords, fuzzing payloads, and more. Maintained by Daniel Miessler and actively updated.

GitHub: https://github.com/danielmiessler/SecLists

### Installation

**Linux (Kali: recommended):**
```bash
# Install via apt
sudo apt install seclists

# Lists install to:
/usr/share/seclists/
```

**Linux (manual install):**
```bash
git clone https://github.com/danielmiessler/SecLists.git /usr/share/seclists
```

**macOS:**
```bash
brew install seclists

# Lists install to:
/opt/homebrew/share/seclists/
# or
/usr/local/share/seclists/
```

**Windows:**
```
# Download the zip from GitHub releases:
https://github.com/danielmiessler/SecLists/releases

# Extract to a memorable location:
C:\tools\seclists\

# Or clone with git if you have it installed:
git clone https://github.com/danielmiessler/SecLists.git C:\tools\seclists
```

---

## 📂 SecLists Directory Structure

Once installed, here's where the important lists live:
```
SecLists/
├── Discovery/
│   ├── Web-Content/          ← directory and file enumeration
│   └── DNS/                  ← subdomain enumeration
├── Passwords/
│   ├── Common-Credentials/   ← common passwords
│   └── Leaked-Databases/     ← rockyou and others
├── Usernames/
│   └── Names/                ← username lists
├── Fuzzing/                  ← fuzzing payloads
└── Miscellaneous/            ← everything else
```

---

## 🎯 The Right List for the Right Job

### 🌐 Web Directory Enumeration

| List | Size | Best for |
|---|---|---|
| `Discovery/Web-Content/common.txt` | Small | Quick first pass |
| `Discovery/Web-Content/raft-medium-directories.txt` | Medium | Standard CTF scan |
| `Discovery/Web-Content/raft-large-directories.txt` | Large | Thorough scan |
| `Discovery/Web-Content/raft-medium-files.txt` | Medium | File discovery |
| `Discovery/Web-Content/directory-list-2.3-medium.txt` | Medium | Classic dirbuster list |
| `Discovery/Web-Content/burp-parameter-names.txt` | Medium | Parameter fuzzing |

**Quick start command:**
```bash
gobuster dir -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,html,txt,bak -t 50
```

---

### 🌐 Subdomain Enumeration

| List | Size | Best for |
|---|---|---|
| `Discovery/DNS/subdomains-top1million-5000.txt` | Small | Fast first pass |
| `Discovery/DNS/subdomains-top1million-20000.txt` | Medium | Standard scan |
| `Discovery/DNS/subdomains-top1million-110000.txt` | Large | Thorough scan |
| `Discovery/DNS/bitquark-subdomains-top100000.txt` | Large | Alternative source |

**Quick start command:**
```bash
gobuster dns -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --show-ips
```

---

### 👤 Username Lists

| List | Best for |
|---|---|
| `Usernames/Names/names.txt` | General username enumeration |
| `Usernames/top-usernames-shortlist.txt` | Quick check: most common usernames |
| `Usernames/xato-net-10-million-usernames.txt` | Large scale enumeration |

---

### 🔑 Password Lists

| List | Best for |
|---|---|
| `Passwords/Common-Credentials/10k-most-common.txt` | Quick password spray |
| `Passwords/Common-Credentials/100k-most-used-passwords-NCSC.txt` | Thorough spray |
| `Passwords/Leaked-Databases/rockyou.txt.tar.gz` | Full brute force |

> 💡 **rockyou.txt** is the most famous password list in cybersecurity: 14 million passwords leaked from the RockYou breach in 2009. It's the first list you try on any password cracking task in CTF. On Kali it lives at `/usr/share/wordlists/rockyou.txt.gz`: extract it with `gunzip /usr/share/wordlists/rockyou.txt.gz`.

---

## 🔨 Password Cracking: John the Ripper

When you find a hash: a scrambled version of a password: you need a cracking tool to recover the original password. John the Ripper is the standard.

> ⚠️ **Important note on versions:** The original `john` package in many package managers is outdated. You want **John the Ripper Jumbo**: the community-enhanced version with support for more hash types and better performance.

### Installation

**Linux (Kali: Jumbo version pre-installed):**
```bash
# Verify you have Jumbo
john --list=formats | grep -i jumbo

# If not installed
sudo apt install john
```

**macOS: Jumbo version:**
```bash
# Homebrew installs Jumbo by default
brew install john-jumbo

# Verify
john --list=formats | wc -l
# Should show 400+ formats if Jumbo is installed
# Original john only shows ~40 formats
```

**Windows:**
```
# Download Jumbo builds from:
https://www.openwall.com/john/

# Look for the Windows binaries package
# Extract and run john.exe from the run/ folder
```

### Common John Commands
```bash
# Crack with rockyou wordlist
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt

# Crack SSH private key
ssh2john id_rsa > id_rsa.hash
john id_rsa.hash --wordlist=/usr/share/wordlists/rockyou.txt

# Crack zip file password
zip2john file.zip > zip.hash
john zip.hash --wordlist=/usr/share/wordlists/rockyou.txt

# Show cracked passwords
john hash.txt --show

# List supported hash formats
john --list=formats

# Identify hash type first
john --list=formats | grep -i md5
```

---

## 🔧 Building Custom Wordlists with CeWL

CeWL (Custom Word List generator) crawls a website and builds a wordlist from the words it finds. This is useful because people often use words related to their organization as passwords and directory names.

### Installation

**Linux:**
```bash
sudo apt install cewl
```

**macOS:**
```bash
brew install cewl
```

**Windows:**
Download from: https://github.com/digininja/CeWL

### Commands
```bash
# Basic crawl: generates wordlist from target site
cewl http://<target> -w custom-wordlist.txt

# Set crawl depth
cewl http://<target> -d 3 -w custom-wordlist.txt

# Set minimum word length
cewl http://<target> -m 6 -w custom-wordlist.txt

# Include email addresses found on site
cewl http://<target> --email -w custom-wordlist.txt

# Full recommended command
cewl http://<target> -d 3 -m 6 -w custom-wordlist.txt

# Use your custom list with gobuster
gobuster dir -u http://<target> -w custom-wordlist.txt
```

> 💡 **When to use CeWL:** If you're enumerating a company's website before a real engagement: their product names, employee names, and industry terms are likely to appear as passwords and directory names. CeWL automates the collection of those terms.

---

## 📋 Built-in Kali Wordlists

Kali Linux comes with several wordlists pre-installed at `/usr/share/wordlists/`:
```bash
# List available wordlists
ls /usr/share/wordlists/

# Most important ones:
/usr/share/wordlists/rockyou.txt.gz      # extract first with gunzip
/usr/share/wordlists/dirb/common.txt     # quick directory scan
/usr/share/wordlists/dirb/big.txt        # larger directory scan
/usr/share/wordlists/dirbuster/          # dirbuster lists
```

---

## 🔄 Recommended Wordlist Strategy
```bash
# Step 1: quick scan with small list first
gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt -t 50

# Step 2: if nothing interesting, move to medium SecLists
gobuster dir -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 50

# Step 3: add extensions based on what tech stack you identified
gobuster dir -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,html,txt,bak -t 50

# Step 4: if you have context about the target, use CeWL
cewl http://<target> -d 3 -m 6 -w custom.txt
gobuster dir -u http://<target> -w custom.txt -t 50
```

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*