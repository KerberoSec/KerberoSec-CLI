# ⚡ ffuf: Fuzz Faster U Fool

ffuf is a web fuzzer. While gobuster and feroxbuster are built specifically for directory enumeration, ffuf is a general-purpose fuzzing tool: meaning you can put the `FUZZ` keyword anywhere in a request and it will cycle through your wordlist in that position. This makes it incredibly flexible.

Official documentation: https://github.com/ffuf/ffuf

---

## 📦 Installation

**Linux (Kali):**
```bash
sudo apt install ffuf
```

**macOS:**
```bash
brew install ffuf
```

**Windows:**
Download the latest release from:
https://github.com/ffuf/ffuf/releases

Extract and run directly or add to PATH.

---

## 🤔 What is Fuzzing: Actually?

Fuzzing comes from software testing. The original idea was simple: throw unexpected, random, or malformed input at a program and see if it breaks. If it crashes, errors out, or behaves differently than expected, you found something worth investigating.

Here's a simple way to think about it:

Imagine you're trying to find a secret room in a building. You go down a hallway and knock on every door. Most doors get no answer: those are your 404s, nothing there. But one door: someone answers. That's your finding.

Fuzzing is the automated version of knocking on every door. Instead of you typing each path manually, ffuf sends thousands of requests in seconds and flags the ones that got an answer.

**The key insight: different responses mean something different exists.**

This is why ffuf's filtering flags (`-fs`, `-fc`, `-fw`) are so important. Without them you're drowning in noise. With them you can reduce thousands of results down to the handful that actually matter.

**Fuzzing can target:**
- URL paths: finding hidden directories and files
- Subdomains: finding hidden subdomains
- Virtual hosts: finding hidden web apps on the same IP
- Parameters: finding hidden GET and POST parameters
- Parameter values: testing for injection vulnerabilities
- Headers: finding header-based access controls
- Request bodies: testing login forms and API endpoints

ffuf handles all of these with one tool. That's why it's in every serious pentester's toolkit.

---

## 🧠 Fuzzing vs Directory Busting

**Directory busting** (gobuster, feroxbuster) sends requests to `/wordlistentry`: it's always appending to the URL path.

**Fuzzing** (ffuf) puts `FUZZ` wherever you want: in the path, in a parameter, in a header, in the request body. It's the same idea but with complete flexibility over where the guessing happens.
```bash
# Directory busting: FUZZ is always the path
ffuf -u http://<target>/FUZZ -w wordlist.txt

# Parameter fuzzing: FUZZ is a query parameter value
ffuf -u http://<target>/page?id=FUZZ -w numbers.txt

# Header fuzzing: FUZZ is inside a header
ffuf -u http://<target>/ -H "X-Forwarded-For: FUZZ" -w ips.txt

# POST body fuzzing: FUZZ is in the request body
ffuf -u http://<target>/login -X POST -d "username=admin&password=FUZZ" -w passwords.txt
```

---

## 📁 Directory Enumeration
```bash
# Basic directory scan
ffuf -u http://<target>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt

# With file extensions
ffuf -u http://<target>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -e .php,.html,.txt,.bak

# Save output
ffuf -u http://<target>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -o ffuf-dir.txt -of md

# Full recommended CTF command
ffuf -u http://<target>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -e .php,.html,.txt,.bak -t 50 -o ffuf-dir.txt -of md
```

---

## 🌐 Subdomain Enumeration
```bash
# Basic subdomain fuzzing
ffuf -u http://FUZZ.example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# Filter out false positives by response size
ffuf -u http://FUZZ.example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 1234

# Filter by word count
ffuf -u http://FUZZ.example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fw 12
```

---

## 🖥️ Virtual Host Fuzzing
```bash
# Basic vhost fuzzing
ffuf -u http://<target-ip> -H "Host: FUZZ.example.com" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# Filter false positives: run without filter first to get the default response size, then filter it
ffuf -u http://<target-ip> -H "Host: FUZZ.example.com" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 1234
```

> 💡 **How to find the filter size:** Run ffuf once without any filter. Look at the size of all the false positive responses: they'll all be the same size. Then rerun with `-fs <that size>` to hide them and only see real results.

---

## 🔎 Parameter Fuzzing

Parameter fuzzing finds hidden GET and POST parameters that aren't documented or visible. This leads directly to vulnerabilities like SQL injection, Local File Inclusion (LFI), Server-Side Request Forgery (SSRF), and Insecure Direct Object Reference (IDOR).
```bash
# GET parameter fuzzing
ffuf -u http://<target>/page?FUZZ=value -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt

# GET parameter value fuzzing
ffuf -u http://<target>/page?id=FUZZ -w /usr/share/seclists/Fuzzing/integers.txt

# POST parameter fuzzing
ffuf -u http://<target>/login -X POST -d "FUZZ=value" -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt -H "Content-Type: application/x-www-form-urlencoded"

# POST value fuzzing: password brute force
ffuf -u http://<target>/login -X POST -d "username=admin&password=FUZZ" -w /usr/share/seclists/Passwords/Common-Credentials/10k-most-common.txt -H "Content-Type: application/x-www-form-urlencoded" -fc 401
```

---

## 🚩 Important Flags

| Flag | What it does |
|---|---|
| `-u` | Target URL: place `FUZZ` where you want fuzzing |
| `-w` | Wordlist path |
| `-e` | Extensions to append (`.php,.html,.txt`) |
| `-t` | Threads (default 40) |
| `-o` | Output file |
| `-of` | Output format (md, json, html, csv) |
| `-fs` | Filter by response size: hide responses of this size |
| `-fc` | Filter by status code: hide these codes |
| `-fw` | Filter by word count |
| `-fl` | Filter by line count |
| `-mc` | Match only these status codes (show these, hide everything else) |
| `-H` | Add custom header |
| `-X` | HTTP method (GET, POST, PUT) |
| `-d` | POST data body |
| `-b` | Cookie |
| `-r` | Follow redirects |
| `-recursion` | Enable recursion |
| `-recursion-depth` | Set recursion depth |

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| Threads | 50-100 | 10-20 |
| Filter false positives | Essential | Essential |
| Parameter fuzzing | Go for it | Careful: can trigger WAF alerts |
| POST fuzzing | Use freely | Check scope first |
| Output format | Any | Save as JSON or CSV for reporting |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*