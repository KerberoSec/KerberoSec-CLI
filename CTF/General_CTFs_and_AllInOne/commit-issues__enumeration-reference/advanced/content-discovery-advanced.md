# 🕵🏽 Advanced Content Discovery
## 📋 Contents

- [The Mindset Shift](#-the-mindset-shift)
- [Wayback Machine: The Internet's Memory](#-wayback-machine--the-internets-memory)
- [Google Dorking for Content Discovery](#-google-dorking-for-content-discovery)
- [Certificate Transparency Logs: crt.sh](#-certificate-transparency-logs--crtsh)
- [JavaScript File Analysis](#-javascript-file-analysis)
- [Source Code Review During Enumeration](#-source-code-review-during-enumeration)
- [Recommended Advanced Content Discovery Workflow](#-recommended-advanced-content-discovery-workflow)

---

You ran gobuster. You ran ffuf. You found some directories. Most people stop there. Advanced content discovery goes beyond what tools can find automatically: it uses sources, techniques, and thinking patterns that most people never consider. This is where you find the endpoints that were never supposed to be public, the credentials that were accidentally committed, and the infrastructure that was meant to stay hidden.

---

## 🧠 The Mindset Shift

Standard enumeration asks: *"What paths exist on this server right now?"*

Advanced content discovery asks: *"What has ever existed, what was accidentally exposed, what is hidden in plain sight, and what can I find without touching the target at all?"*

The answer to those questions lives in:
- The history of the internet
- Search engine indexes
- Certificate transparency logs
- JavaScript files
- Source code repositories
- The target's own documentation

---

## ⏪ Wayback Machine: The Internet's Memory

The Wayback Machine (web.archive.org) is an archive of the internet going back to the late 1990s. It takes snapshots of websites over time: meaning it has copies of pages, files, and endpoints that may no longer exist on the live site but were once public.

**Why this matters:** Developers delete pages. They change URLs. They remove functionality. But the Wayback Machine already saved a copy. And old endpoints often still work on the live server even after they've been removed from the navigation.
```bash
# Check archived versions of a site manually
# Visit: https://web.archive.org/web/*/example.com/*

# Use waybackurls to extract all archived URLs automatically
# Install
go install github.com/tomnomnom/waybackurls@latest

# Run
waybackurls example.com | tee wayback-urls.txt

# Filter for interesting paths
cat wayback-urls.txt | grep -E "\.(php|asp|aspx|jsp|json|xml|config|bak|old|zip|tar|gz)$"

# Filter for parameters: potential injection points
cat wayback-urls.txt | grep "?"

# Sort and deduplicate
cat wayback-urls.txt | sort -u > wayback-clean.txt
```

**What to look for in Wayback results:**
- Old admin panels that were moved but not deleted
- Backup files (`.bak`, `.old`, `.zip`) that were briefly public
- API endpoints from old versions of the application
- Parameters that reveal application logic
- Old subdomains that still resolve

---

## 🔍 Google Dorking for Content Discovery

Google has indexed portions of websites that were never meant to be public: exposed directories, login pages, config files, and more. Google dorks are specialized search operators that target specific types of exposed content.

> 💡 **Full Google Dorking reference** is in its own dedicated repo: `google-dorking`: part of the SudoCode Pentesting Methodology Guide series. What's here focuses specifically on content discovery use cases.
```bash
# Find all indexed pages on a site
site:example.com

# Find login pages
site:example.com inurl:login
site:example.com inurl:admin
site:example.com inurl:dashboard

# Find exposed files
site:example.com filetype:php
site:example.com filetype:config
site:example.com filetype:env
site:example.com filetype:log
site:example.com filetype:sql
site:example.com filetype:bak

# Find directory listings
site:example.com intitle:"index of"

# Find exposed configuration files
site:example.com inurl:config
site:example.com inurl:.env

# Find API documentation
site:example.com inurl:swagger
site:example.com inurl:api-docs
site:example.com inurl:openapi
```

---

## 📜 Certificate Transparency Logs: crt.sh

Every SSL/TLS certificate issued for a domain is logged in public Certificate Transparency (CT) logs. This is a security feature designed to prevent fraudulent certificates, but it also means every subdomain that has ever had a certificate issued is publicly recorded.

**Why this is powerful:** Companies issue certificates for subdomains they think are private: internal tools, staging environments, VPN portals. Those certificates are logged publicly. You can find subdomains this way that would never show up in DNS brute forcing because they use uncommon words.
```bash
# Query crt.sh manually
# Visit: https://crt.sh/?q=%.example.com

# Query via command line
curl -s "https://crt.sh/?q=%.example.com&output=json" | \
  python3 -c "import sys,json; [print(x['name_value']) for x in json.load(sys.stdin)]" | \
  sort -u

# Extract unique subdomains
curl -s "https://crt.sh/?q=%.example.com&output=json" | \
  python3 -c "import sys,json; [print(x['name_value']) for x in json.load(sys.stdin)]" | \
  sort -u | \
  grep -v '\*' > ct-subdomains.txt

# Resolve which ones are live
cat ct-subdomains.txt | dnsx -a +short
```

**What to look for:**
- Internal tool names: `jenkins.example.com`, `gitlab.example.com`, `jira.example.com`
- Staging and dev environments: `staging.example.com`, `dev-api.example.com`
- Unusual subdomains that suggest internal infrastructure
- Wildcard certificates (`*.example.com`): means they issue certs for many subdomains

---

## 📦 JavaScript File Analysis

JavaScript files are the most underutilized source of intelligence during web enumeration. Modern web applications load megabytes of JavaScript that contains the entire frontend application logic: including every API endpoint the app talks to, authentication logic, and sometimes hardcoded credentials.

**The key insight:** The JavaScript file has to know about every API endpoint to call them. Those endpoints are in the code. You just have to find them.

### Finding JavaScript Files
```bash
# Find JS files with gobuster
gobuster dir -u http://<target> \
  -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt \
  -x js -o js-files.txt

# Find JS files with ffuf
ffuf -u http://<target>/FUZZ \
  -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt \
  -e .js -mc 200
```

### Extracting Intelligence from JS Files
```bash
# Download a JS file
curl -s http://<target>/app.js -o app.js

# Extract API endpoints
grep -oP '["'"'"'`]/[a-zA-Z0-9_/.-]+["'"'"'`]' app.js | sort -u

# Find fetch/axios/XHR calls: shows API calls
grep -E "(fetch|axios|\.get|\.post|XMLHttpRequest)" app.js

# Find hardcoded credentials or API keys
grep -iE "(password|passwd|secret|api_key|apikey|token|auth|credential)" app.js

# Find internal IP addresses or hostnames
grep -oP '\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b' app.js
grep -oP 'https?://[a-zA-Z0-9._-]+' app.js

# Find AWS keys (format: AKIA...)
grep -oP 'AKIA[A-Z0-9]{16}' app.js

# Find potential S3 bucket names
grep -iE "s3\.amazonaws\.com|\.s3\." app.js
```

### Tools for JS Analysis

**LinkFinder: extracts endpoints from JS automatically:**
```bash
# Install
pip3 install linkfinder

# Run against a single JS file
python3 linkfinder.py -i http://<target>/app.js -o cli

# Run against an entire domain: crawls and finds all JS files
python3 linkfinder.py -i http://<target> -d -o cli
```

**JSBeautifier: makes minified JS readable:**
```bash
# Install
pip3 install jsbeautifier

# Beautify a minified JS file
js-beautify app.min.js > app-readable.js
```

---

## 🔓 Source Code Review During Enumeration

If you find exposed source code: through a `.git` directory, a backup file, or a public repository: reading it carefully reveals far more than any tool can find automatically.

### Exposed .git Directories

A `.git` directory in a web root means the entire git history is accessible: including files that were deleted, credentials that were committed and removed, and the full development history.
```bash
# Check if .git is exposed
curl http://<target>/.git/HEAD

# If you get a response instead of 404: it's exposed
# Use git-dumper to download the entire repository
pip3 install git-dumper
git-dumper http://<target>/.git/ ./dumped-repo

# Once dumped: look through the git history
cd dumped-repo
git log --oneline
git show <commit-hash>

# Search history for credentials
git log -p | grep -iE "(password|secret|key|token|credential)"
```

### What to Look For in Source Code
```bash
# Hardcoded credentials
grep -rE "(password|passwd|secret|api_key|token)" .

# Database connection strings
grep -rE "(mysql|postgresql|mongodb|redis):\/\/" .

# Internal IP addresses
grep -rE "\b(10|172\.16|192\.168)\.[0-9]+\.[0-9]+\b" .

# TODO comments: developers often leave security notes
grep -rE "(TODO|FIXME|HACK|XXX|BUG)" .

# Debug flags
grep -rE "(debug|DEBUG|development|DEV)" .
```

---

## 🔄 Recommended Advanced Content Discovery Workflow
```bash
# Step 1: check historical content
waybackurls example.com | grep -E "\.(php|bak|old|config|env|sql)$"

# Step 2: certificate transparency for subdomains
curl -s "https://crt.sh/?q=%.example.com&output=json" | \
  python3 -c "import sys,json; [print(x['name_value']) for x in json.load(sys.stdin)]" | \
  sort -u > ct-subdomains.txt

# Step 3: find and analyze JS files
gobuster dir -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -x js
curl -s http://<target>/app.js | grep -iE "(api|endpoint|password|secret|key)"

# Step 4: check for exposed .git
curl -s http://<target>/.git/HEAD
# If exposed: git-dumper http://<target>/.git/ ./dumped-repo

# Step 5: Google dork for exposed content
# site:example.com filetype:env
# site:example.com intitle:"index of"
# site:example.com inurl:swagger
```

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*