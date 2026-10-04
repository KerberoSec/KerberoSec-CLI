# 🛠️ DNS Enumeration Tools

These tools go beyond manual `dig` and `nslookup` queries: they automate subdomain discovery, brute force DNS records, and map out infrastructure at scale.

---

## 🔍 dig: The Swiss Army Knife of DNS

Already covered in basics, but here are the power-user commands worth knowing.

**Install:**
- Linux/macOS: Pre-installed
- Windows: Download BIND tools from https://www.isc.org/download/
```bash
# Enumerate ALL record types at once
dig example.com ANY

# Trace the full DNS resolution path
dig example.com +trace

# Check all nameservers for a domain
dig example.com NS +short

# Query each nameserver directly
dig @ns1.example.com example.com

# Bulk lookup from a file
for sub in $(cat subdomains.txt); do dig $sub.example.com +short; done
```

---

## 🔎 dnsrecon: Comprehensive DNS Reconnaissance

dnsrecon automates multiple DNS enumeration techniques in one tool: standard record enumeration, zone transfers, subdomain brute forcing, and more.

**Install:**
- Kali Linux: Pre-installed
- Linux: `sudo apt install dnsrecon`
- macOS: `pip3 install dnsrecon --break-system-packages`
- Windows: `pip install dnsrecon`

Official documentation: https://github.com/darkoperator/dnsrecon
```bash
# Standard enumeration: all record types
dnsrecon -d example.com

# Brute force subdomains
dnsrecon -d example.com -D /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t brt

# Zone transfer attempt
dnsrecon -d example.com -t axfr

# Reverse lookup on an IP range
dnsrecon -r 192.168.1.0/24

# Google enumeration: finds subdomains via Google
dnsrecon -d example.com -t goo

# Full recommended recon command
dnsrecon -d example.com -t std,brt,axfr -D /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

---

## 💪 Amass: The Big Gun

Amass is the most comprehensive subdomain enumeration tool available. It uses passive sources (certificate transparency logs, search engines, APIs), active DNS brute forcing, and web scraping to find subdomains that other tools miss.

**Install:**
- Kali Linux: `sudo apt install amass`
- Linux: `sudo apt install amass`
- macOS: `brew install amass`
- Windows: Download from https://github.com/owasp-amass/amass/releases

Official documentation: https://github.com/owasp-amass/amass
```bash
# Passive enumeration: no direct contact with target
amass enum -passive -d example.com

# Active enumeration: brute force + passive
amass enum -active -d example.com

# With brute forcing
amass enum -brute -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# Save output
amass enum -d example.com -o amass-output.txt

# Full recommended command
amass enum -active -brute -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -o amass-output.txt
```

> 💡 Amass is slow but thorough. Run it in the background while you work on other things. It regularly finds subdomains that gobuster dns and dnsrecon miss because it pulls from so many different sources.

---

## ⚡ fierce: Fast DNS Reconnaissance

Fierce is a fast, lightweight DNS reconnaissance tool focused on finding non-contiguous IP space and subdomains. Great for a quick first pass.

**Install:**
- Kali Linux: Pre-installed
- Linux: `sudo apt install fierce`
- macOS: `pip3 install fierce --break-system-packages`
- Windows: `pip install fierce`

Official documentation: https://github.com/mschwager/fierce
```bash
# Basic subdomain scan
fierce --domain example.com

# With custom wordlist
fierce --domain example.com --wordlist /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

# With DNS server specified
fierce --domain example.com --dns-servers 8.8.8.8

# Save output
fierce --domain example.com > fierce-output.txt
```

---

## 🌐 dnsx: Fast DNS Toolkit

dnsx is a fast and multi-purpose DNS toolkit that excels at bulk DNS resolution: taking a list of potential subdomains and quickly resolving which ones actually exist.

**Install:**
- Linux: `sudo apt install dnsx`
- macOS: `brew install dnsx`
- Windows: Download from https://github.com/projectdiscovery/dnsx/releases

Official documentation: https://github.com/projectdiscovery/dnsx
```bash
# Resolve a list of subdomains
cat subdomains.txt | dnsx

# Find subdomains with A records only
cat subdomains.txt | dnsx -a

# Get all record types
cat subdomains.txt | dnsx -a -aaaa -cname -mx -txt -ns

# Brute force subdomains
dnsx -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

---

## 📊 Tool Comparison

| Tool | Best for | Speed | Passive? |
|---|---|---|---|
| **dig** | Manual queries, scripting | ⚡ Instant | ✅ Yes |
| **dnsrecon** | Comprehensive single-tool recon | 🟡 Medium | ✅ Partially |
| **amass** | Deep subdomain discovery | 🔴 Slow | ✅ Yes |
| **fierce** | Quick first pass | ⚡ Fast | ❌ No |
| **dnsx** | Bulk resolution of wordlists | ⚡ Fast | ❌ No |

---

## 🔄 Recommended DNS Enumeration Workflow
```bash
# Step 1: quick manual check
dig example.com ANY +short
dig example.com NS +short

# Step 2: attempt zone transfer (see zone-transfers.md)
dig axfr @ns1.example.com example.com

# Step 3: fast subdomain brute force
dnsrecon -d example.com -D /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t brt

# Step 4: deep passive + active enumeration (run in background)
amass enum -active -brute -d example.com -o amass-output.txt

# Step 5: resolve and verify all found subdomains
cat amass-output.txt | dnsx -a +short
```

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*