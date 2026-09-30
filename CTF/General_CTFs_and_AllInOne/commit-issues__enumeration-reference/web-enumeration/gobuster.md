# 🔍 Gobuster

Gobuster is the go-to directory and subdomain enumeration tool for CTF players and penetration testers. It's fast, reliable, and simple enough to get running in under a minute, but deep enough to cover most enumeration scenarios you'll encounter.

Official documentation: https://github.com/OJ/gobuster

---

## 📦 Installation

**Linux (Kali: pre-installed, or install manually):**
```bash
sudo apt install gobuster
```

**macOS:**
```bash
brew install gobuster
```

**Windows:**
Download the latest release from:
https://github.com/OJ/gobuster/releases

Extract the zip and add the folder to your PATH, or run it directly from the extracted folder.

---

## 🧠 How Gobuster Works

Gobuster takes a wordlist: a text file with one path per line, and sends an HTTP request for each word against your target. It reports back which paths returned a response code that isn't 404.

It has three main modes:

| Mode | What it does |
|---|---|
| `dir` | Directory and file enumeration |
| `dns` | Subdomain enumeration |
| `vhost` | Virtual host discovery |

---

## 📁 dir Mode: Directory & File Enumeration

This is what you'll use most. Point it at a web server and it finds hidden directories and files.
```bash
# Basic directory scan
gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt

# With file extensions
gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt -x php,html,txt,bak

# Save output to file
gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt -o gobuster-dir.txt

# Increase threads for speed
gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt -t 50

# Show only specific status codes
gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt --status-codes 200,301,302,403

# Full recommended CTF command
gobuster dir -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,html,txt,bak -t 50 -o gobuster-dir.txt
```

---

## 🌐 dns Mode: Subdomain Enumeration

Use this to find subdomains of a target domain.
```bash
# Basic subdomain scan
gobuster dns -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# Show IP addresses of found subdomains
gobuster dns -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --show-ips

# Save output
gobuster dns -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -o gobuster-dns.txt

# Full recommended command
gobuster dns -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt --show-ips -o gobuster-dns.txt
```

> ⚠️ For DNS mode you need a domain name, not an IP address. Use the target's domain: check your HTB machine info or the web server's response headers for the hostname.

---

## 🖥️ vhost Mode: Virtual Host Discovery

Use this to find virtual hosts running on the same IP address that don't have DNS records.
```bash
# Basic vhost scan
gobuster vhost -u http://<target> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# With domain appended automatically
gobuster vhost -u http://<target> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain

# Filter out false positives by response size
gobuster vhost -u http://<target> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --exclude-length 280

# Full recommended command
gobuster vhost -u http://<target> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain -o gobuster-vhost.txt
```

> 💡 **vhost vs dns mode:** Use `dns` mode when you have a domain and want to find subdomains via DNS resolution. Use `vhost` mode when you have an IP address and want to find virtual hosts configured on that web server. On HTB, vhost mode is almost always more useful.

---

## 🚩 Important Flags

| Flag | What it does |
|---|---|
| `-u` | Target URL |
| `-w` | Wordlist path |
| `-x` | File extensions to append (php,html,txt) |
| `-t` | Number of threads (default 10, use 50 for speed) |
| `-o` | Output file |
| `-q` | Quiet mode: only show results |
| `--status-codes` | Only show specific response codes |
| `--exclude-length` | Exclude responses of a specific size (removes false positives) |
| `--append-domain` | Append the base domain to wordlist entries in vhost mode |
| `-k` | Skip SSL certificate verification (use on HTTPS targets with self-signed certs) |
| `--delay` | Add delay between requests (use on slow or rate-limited targets) |
| `-b` | Blacklist status codes (e.g. `-b 404,403`) |

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| Threads | 50-100 | 10-20: don't hammer the target |
| Wordlist size | Largest available | Medium: balance coverage with noise |
| Extensions | php,html,txt,bak,zip | Targeted to the tech stack |
| Output | Good habit | Required: save everything |
| Speed | Fast as possible | Slow down: rate limiting is real |

---

## 📚 Wordlists: What to Use

Gobuster is only as good as the wordlist you give it. See the full wordlists reference at [wordlists/wordlists.md](../wordlists/wordlists.md) for a complete breakdown.

**Quick start: these cover 90% of cases:**

| Scenario | Wordlist |
|---|---|
| General directory busting | `/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt` |
| Files with extensions | `/usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt` |
| Subdomain enumeration | `/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt` |
| Quick scan | `/usr/share/wordlists/dirb/common.txt` |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*