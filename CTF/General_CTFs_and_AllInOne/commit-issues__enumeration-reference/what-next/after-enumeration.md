# 🗺️ What To Do After Enumeration
## 📋 Contents

- [The Mindset Shift](#-the-mindset-shift)
- [The Post-Enumeration Flow](#-the-post-enumeration-flow)
- [Finding by Finding: What To Do Next](#-finding-by-finding--what-to-do-next)
- [Prioritization: What to Try First](#-prioritization--what-to-try-first)
- [Want to Go Deeper?](#-want-to-go-deeper)

---

You've run the scans. You've checked every port. You've enumerated the web server, dug into DNS, checked SMB, analyzed the JavaScript files, and fuzzed the parameters. Now you have a list of findings. The question everyone asks at this point: what do I actually do with all of this?

This is where enumeration ends and exploitation begins.

---

## 🧠 The Mindset Shift

Enumeration is intelligence gathering. You've been building a picture of the target: what's there, how it's configured, what version it's running, what's accessible.

Now you shift from *"what is here?"* to *"what can I do with what I found?"*

Every finding from enumeration maps to a next action. Nothing you found is useless: even dead ends tell you something. Here's how to work through everything systematically.

---

## 🔄 The Post-Enumeration Flow
```
Enumeration finding
        ↓
Categorize: what type of finding is this?
        ↓
Research: what does this version/misconfiguration allow?
        ↓
Exploit or Escalate
        ↓
Document
```

---

## 🎯 Finding by Finding: What To Do Next

### You found an open port with an identified service version
```bash
# Research the version
searchsploit <service> <version>
# Visit: https://exploit-db.com
# Visit: https://nvd.nist.gov
# Google: "<service> <version> CVE"
```

Every version number is a potential CVE. Copy the exact version string nmap gave you and search it. If a public exploit exists: read it carefully before running it.

---

### You found a web login page

- Try default credentials first: always
- Common defaults: `admin/admin`, `admin/password`, `root/root`, `guest/guest`
- Check if the login page leaks the technology: "Powered by WordPress" means try `admin/admin` on `/wp-login.php`
- Test for SQL injection: enter `' OR '1'='1` in the username field
- Check the page source for hints, hidden fields, commented-out credentials

---

### You found a directory listing (`/backup`, `/files`, `/uploads`)

- Download everything accessible
- Look for: `.zip`, `.tar`, `.sql`, `.bak`, `.config`, `.env`, `.key`
- Any database backup is extremely high value: often contains credentials
- Any `.env` file almost certainly contains credentials
- Any SSH key files: use them immediately
```bash
# Download everything recursively
wget -r http://<target>/backup/
```

---

### You found an exposed `.git` directory
```bash
# Dump the entire repository
git-dumper http://<target>/.git/ ./dumped-repo

# Search the history for credentials
cd dumped-repo
git log --oneline
git log -p | grep -iE "(password|secret|key|token)"
```

---

### You found valid SMB shares
```bash
# Connect and download everything
smbclient //<target>/ShareName -N
smb: \> mget *

# Search downloaded files for credentials
grep -rE "(password|passwd|secret|key)" ./downloaded-files/
```

---

### You found valid usernames

Build a username list and test credentials across every service:
```bash
# Create username file
echo "jsmith" >> users.txt
echo "admin" >> users.txt
echo "john.smith" >> users.txt

# Password spray SSH
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://<target>

# Password spray SMB
netexec smb <target> -u users.txt -p 'Password123' --continue-on-success

# Check password policy first: avoid lockouts
enum4linux-ng -A <target> | grep -i "password policy"
```

---

### You found credentials

Test them everywhere: credential reuse is one of the most common paths to access:
```bash
# SSH
ssh username@<target>

# SMB
smbclient //<target>/C$ -U username

# FTP
ftp <target>

# Web login pages
# Try manually in browser

# Database
mysql -u username -p -h <target>
```

---

### You found a subdomain or vhost
```bash
# Add to /etc/hosts
echo "<ip> subdomain.example.com" >> /etc/hosts

# Enumerate it like a fresh target
gobuster dir -u http://subdomain.example.com \
  -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \
  -x php,html,txt \
  -t 50
```

---

### You found SNMP with default community string
```bash
# Full walk: save everything
snmpwalk -v2c -c public <target> > snmp-full.txt

# Search for credentials in process list
grep -iE "(password|passwd|secret)" snmp-full.txt

# Get user list for password spraying
snmpwalk -v2c -c public <target> 1.3.6.1.4.1.77.1.2.25
```

---

### You found an API endpoint
```bash
# Test for unauthenticated access
curl -s http://<target>/api/v1/users
curl -s http://<target>/api/v1/admin

# Fuzz for parameters
arjun -u http://<target>/api/v1/users

# Test for IDOR: change IDs
curl -s http://<target>/api/v1/users/1
curl -s http://<target>/api/v1/users/2

# Test JWT if present
jwt_tool <token>
```

---

## 📋 Prioritization: What to Try First

Not all findings are equal. Here's how to prioritize:

| Priority | Finding | Why |
|---|---|---|
| 🔴 Critical | Default credentials that work | Immediate access |
| 🔴 Critical | Public exploit for identified version | Direct path to RCE |
| 🔴 Critical | Credentials found in files | Try everywhere |
| 🟠 High | SQL injection on login form | Authentication bypass |
| 🟠 High | Exposed `.env` or config files | Credential extraction |
| 🟠 High | Accessible SMB shares | File access, credential hunting |
| 🟡 Medium | Username list | Enables credential attacks |
| 🟡 Medium | Old software versions | Research required |
| 🟢 Low | Technology stack identified | Informs attack direction |

---

## 🌸 Want to Go Deeper?

Enumeration is the foundation. Here is where the series goes next:

| Resource | What It Covers |
|---|---|
| [nmap-reference](https://github.com/commit-issues/nmap-reference) | Complete nmap flag, scan, and NSE reference: go deeper on scanning |
| [google-dorking](https://github.com/commit-issues/google-dorking) | OSINT, passive recon, finding exposed assets before you scan anything |
| [exploitation-reference](https://github.com/commit-issues/exploitation-reference) | Coming soon: what to do once enumeration gives you a foothold 👀 |

> You found the services. You mapped the surface. Now you figure out which door opens.

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*