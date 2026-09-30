# 🦀 Feroxbuster

Feroxbuster is a fast, recursive content discovery tool written in Rust. The key word is **recursive**: unlike gobuster which only scans one level deep, feroxbuster automatically follows directories it finds and scans inside them too. This means it finds things gobuster misses.

Official documentation: https://github.com/epi052/feroxbuster

---

## 📦 Installation

**Linux (Kali):**
```bash
sudo apt install feroxbuster
```

**macOS:**
```bash
brew install feroxbuster
```

**Windows:**
Download the latest release from:
https://github.com/epi052/feroxbuster/releases

Extract and run directly or add to PATH.

---

## 🧠 Why Feroxbuster Over Gobuster?

Gobuster scans the paths you give it: one level. If it finds `/admin/`, it reports it and moves on. It does NOT automatically scan inside `/admin/`.

Feroxbuster finds `/admin/`, then immediately starts scanning `/admin/` for more directories, and so on, recursively, until it hits a depth limit you set.
```
gobuster finds:     /admin/
feroxbuster finds:  /admin/
                    /admin/users/
                    /admin/users/export/
                    /admin/config/
                    /admin/config/database/
```

**Use gobuster when:** You want a fast, flat scan to find the obvious stuff quickly.
**Use feroxbuster when:** You want thorough recursive coverage and don't want to miss nested directories.

---

## 🚀 Basic Usage
```bash
# Basic recursive scan
feroxbuster -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt

# With file extensions
feroxbuster -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,html,txt,bak

# Limit recursion depth
feroxbuster -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -d 3

# Save output
feroxbuster -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -o ferox-output.txt

# Filter out specific response sizes (removes false positives)
feroxbuster -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt --filter-size 1234

# Full recommended CTF command
feroxbuster -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,html,txt,bak -d 4 -t 50 -o ferox-output.txt
```

---

## 🚩 Important Flags

| Flag | What it does |
|---|---|
| `-u` | Target URL |
| `-w` | Wordlist path |
| `-x` | File extensions to append |
| `-d` | Recursion depth (default unlimited: always set this) |
| `-t` | Threads (default 50) |
| `-o` | Output file |
| `-q` | Quiet mode |
| `--filter-size` | Filter responses by size: removes false positives |
| `--filter-status` | Filter out specific status codes |
| `--no-recursion` | Disable recursion: makes it behave like gobuster |
| `-k` | Skip SSL verification |
| `--redirects` | Follow redirects |
| `--rate-limit` | Limit requests per second |
| `--resume-from` | Resume a previous scan from a state file |

> 💡 **Always set `-d`**: without a depth limit feroxbuster will recurse forever on large sites. `-d 3` or `-d 4` is usually enough for CTF boxes.

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| Recursion depth | 4-5 | 2-3: avoid hammering deep paths |
| Threads | 50 | 10-20 |
| Rate limiting | Not needed | Use `--rate-limit` |
| Output | Good habit | Required |
| Filter false positives | `--filter-size` | Essential: clean output matters |

---

## 🔄 Feroxbuster + Gobuster Workflow

The best approach on a CTF box is to run both:
```bash
# Step 1: gobuster for speed, find the obvious stuff
gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt -t 50 -o gobuster-quick.txt

# Step 2: feroxbuster for depth, find what gobuster missed
feroxbuster -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -d 4 -t 50 -o ferox-deep.txt
```

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*