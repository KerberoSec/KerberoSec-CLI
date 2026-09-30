# ✅ CTF Enumeration Checklist
## 📋 Contents

- [Before You Start](#-before-you-start)
- [Phase 1: Initial Scanning](#-phase-1--initial-scanning)
- [Phase 2: Web Enumeration](#-phase-2--web-enumeration-ports-80-443-8080-8443)
- [Phase 3: Service-Specific Enumeration](#-phase-3--service-specific-enumeration)
- [Phase 4: Advanced Enumeration](#️-phase-4--advanced-enumeration)
- [If You're Stuck: Decision Tree](#-if-youre-stuck--decision-tree)
- [Documentation Template](#-documentation-template)

---

This is your step-by-step enumeration checklist for CTF boxes: HackTheBox, TryHackMe, PicoCTF, and similar platforms. Follow it in order. The answer is almost always hiding in something you didn't enumerate thoroughly enough.

---

## 🧠 Before You Start

- [ ] Connected to VPN: confirm with `ip addr show` and check for your VPN interface
- [ ] Created a working directory: `mkdir ~/htb-<machinename> && cd ~/htb-<machinename>`
- [ ] Target IP confirmed and saved: `export TARGET=<ip>`
- [ ] Output logging enabled: all commands saving to files

---

## 🔍 Phase 1: Initial Scanning

### Fast Port Scan First: Always
```bash
# Fast top ports
nmap -sV -sC -T4 --top-ports 20 -oN quick.txt $TARGET

# If host appears down
nmap -sV -sC -T4 -Pn --top-ports 20 -oN quick.txt $TARGET
```

- [ ] Run fast scan
- [ ] Note every open port
- [ ] Note every service version
- [ ] Search every version number on exploit-db.com

### Full Port Scan: Run in Background
```bash
nmap -p- --min-rate 5000 -T4 -oN full.txt $TARGET
```

- [ ] Run full port scan in a second terminal tab
- [ ] Check results when complete: compare to quick scan
- [ ] Any new ports? Enumerate them immediately

### UDP Scan: Don't Skip This
```bash
nmap -sU --top-ports 20 -oN udp.txt $TARGET
```

- [ ] Run UDP scan
- [ ] Port 161 open? → SNMP enumeration
- [ ] Port 53 open? → DNS enumeration

---

## 🌐 Phase 2: Web Enumeration (Ports 80, 443, 8080, 8443)

### First Look

- [ ] Open in browser: look at it with your eyes
- [ ] Check page source: Ctrl+U
- [ ] Check `robots.txt` → `http://<target>/robots.txt`
- [ ] Check `sitemap.xml` → `http://<target>/sitemap.xml`
- [ ] Note any technology hints: powered by, generator meta tags, response headers

### Directory Busting
```bash
# Quick scan first
gobuster dir -u http://$TARGET -w /usr/share/wordlists/dirb/common.txt -t 50 -oN gobuster-quick.txt

# Medium scan
gobuster dir -u http://$TARGET \
  -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \
  -x php,html,txt,bak \
  -t 50 \
  -o gobuster-medium.txt
```

- [ ] Run quick directory scan
- [ ] Run medium directory scan with extensions
- [ ] Check every result: visit each one in browser
- [ ] Found `/admin` or `/login`? → try default credentials
- [ ] Found `/.git`? → run git-dumper
- [ ] Found `/.env`? → download it immediately
- [ ] Found `/backup` or `.bak` files? → download everything

### Virtual Host Fuzzing
```bash
# Get default response size first
curl -s http://$TARGET | wc -c

# Fuzz vhosts
ffuf -u http://$TARGET \
  -H "Host: FUZZ.<domain>" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs <default_size> \
  -t 50
```

- [ ] Identify the domain name (check nmap output, SSL cert, web response)
- [ ] Run vhost fuzzing
- [ ] Found new vhosts? → add to `/etc/hosts`, enumerate each one

### API Enumeration
```bash
curl -s http://$TARGET/api
curl -s http://$TARGET/swagger.json
curl -s http://$TARGET/api-docs
```

- [ ] Check common API paths manually
- [ ] Found swagger/API docs? → read every endpoint
- [ ] Found `/graphql`? → run introspection query
- [ ] Find JS files and analyze them for endpoints and credentials

---

## 🔐 Phase 3: Service-Specific Enumeration

### SSH (Port 22)
```bash
nmap --script ssh-hostkey,ssh-auth-methods -p 22 $TARGET
```

- [ ] Note SSH version: search for CVEs
- [ ] Check if password auth is enabled
- [ ] Found private key files elsewhere? → `chmod 600 id_rsa && ssh -i id_rsa user@$TARGET`

### FTP (Port 21)
```bash
ftp $TARGET
# Try: anonymous / anonymous
nmap --script ftp-anon -p 21 $TARGET
```

- [ ] Try anonymous login
- [ ] Download all accessible files: `mget *`
- [ ] Check for vsftpd 2.3.4 backdoor
- [ ] Try write access: `put test.txt`

### SMB (Ports 139, 445)
```bash
enum4linux-ng -A $TARGET
smbclient -L //$TARGET/ -N
nmap --script smb-vuln-ms17-010 -p 445 $TARGET
```

- [ ] Run enum4linux-ng: note users, shares, password policy
- [ ] List shares: try null session
- [ ] Connect to each accessible share
- [ ] Download everything readable
- [ ] Check for EternalBlue

### DNS (Port 53)
```bash
dig $TARGET NS +short
dig axfr @$TARGET <domain>
```

- [ ] Attempt zone transfer
- [ ] Success? → add all discovered hosts to `/etc/hosts`
- [ ] Run subdomain brute force

### SNMP (UDP Port 161)
```bash
onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt $TARGET
snmpwalk -v2c -c public $TARGET > snmp-walk.txt
```

- [ ] Brute force community string
- [ ] Found valid string? → full snmpwalk
- [ ] Check processes for credentials
- [ ] Check user list

### SMTP (Port 25)
```bash
nc $TARGET 25
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/Names/names.txt -t $TARGET
```

- [ ] Banner grab: note software version
- [ ] User enumeration: VRFY, RCPT, EXPN
- [ ] Found valid users? → add to username list

---

## 🕵🏽 Phase 4: Advanced Enumeration

- [ ] Run waybackurls on the domain
- [ ] Check crt.sh for subdomains
- [ ] Analyze JavaScript files for hidden endpoints
- [ ] Parameter fuzzing on all found endpoints
- [ ] Check for exposed `.git` directory
- [ ] Run Nikto on all web servers
```bash
nikto -h http://$TARGET -o nikto.txt
waybackurls <domain> | grep -E "\.(php|bak|config)$"
curl -s "https://crt.sh/?q=%.<domain>&output=json" | python3 -c "import sys,json; [print(x['name_value']) for x in json.load(sys.stdin)]" | sort -u
```

---

## 🚨 If You're Stuck: Decision Tree

**Nothing on port 80?**
→ Check other web ports: 8080, 8443, 8000, 3000, 5000
→ Run full port scan if not done yet
→ Try HTTPS version

**Directory busting found nothing interesting?**
→ Try larger wordlist
→ Try more extensions: `.php`, `.asp`, `.aspx`, `.jsp`, `.txt`, `.xml`, `.bak`, `.zip`
→ Run feroxbuster for recursive scanning
→ Try vhost fuzzing

**Can't log in anywhere?**
→ Check all found usernames against default passwords
→ Check if passwords were found elsewhere (FTP files, SMB shares, SNMP)
→ Try credential stuffing across all services

**All ports seem dead?**
→ Did you run UDP scan?
→ Did you use `-Pn` flag?
→ Are you connected to VPN?

**SMB access but nothing useful?**
→ Check every share recursively
→ Try authenticating with any found credentials
→ Check for EternalBlue

**Web app but can't find the vulnerability?**
→ Did you check ALL response codes: including 403s?
→ Did you fuzz parameters?
→ Did you analyze JS files?
→ Did you check for vhosts?
→ Did you try SQL injection on every input field?

---

## 📋 Documentation Template

Keep a notes file as you go:
```bash
# Create notes file
cat > notes.txt << 'EOF'
Target: 
IP: 
OS: 
Open Ports: 

Web:
- Port 80: 
- Technologies: 
- Interesting directories: 
- Credentials found: 

Users found:
- 

Credentials found:
- 

Rabbit holes (dead ends):
- 

Next steps:
- 
EOF
```

---

## 🔗 Related References

This checklist assumes you already know your nmap. If you need the
full flag reference, scan combinations, NSE scripts, and CTF vs
professional scanning breakdown:

| Resource | What It Covers |
|---|---|
| [nmap-reference](https://github.com/commit-issues/nmap-reference) | Complete nmap reference: flags, scans, NSE, parsing output |
| [google-dorking](https://github.com/commit-issues/google-dorking) | Passive recon and OSINT before you touch the target |
| [exploitation-reference](https://github.com/commit-issues/exploitation-reference) | Coming soon: what happens after enumeration gives you a lead 👀 |

> The checklist gets you to the door. The references tell you how to pick the lock.

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*