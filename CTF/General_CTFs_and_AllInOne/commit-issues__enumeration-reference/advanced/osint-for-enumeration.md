# 🕵🏽 OSINT for Enumeration

## 📋 Contents

- [Passive vs Active: Why It Matters](#-passive-vs-active--why-it-matters)
- [Shodan: Search Engine for Internet-Connected Devices](#-shodan--search-engine-for-internet-connected-devices)
- [Censys: Alternative to Shodan](#-censys--alternative-to-shodan)
- [WHOIS & ASN Lookups](#-whois--asn-lookups--mapping-infrastructure)
- [LinkedIn & Social Media: People Intelligence](#-linkedin--social-media--people-intelligence)
- [GitHub Dorking: Finding Leaked Credentials](#-github-dorking--finding-leaked-credentials)
- [Email & Breach Data](#-email--breach-data)
- [Recommended OSINT Workflow](#-recommended-osint-workflow)
- [CTF vs Professional Use](#️-ctf-vs-professional-use)

---
OSINT stands for Open-Source Intelligence. It means gathering information from publicly available sources: without ever touching the target directly. This is passive reconnaissance, and it's the step most people skip because it feels slow. It isn't. Done well, OSINT gives you a complete picture of your target's infrastructure, employees, technology stack, and potential attack vectors before you send a single packet.

The best pentesters build their target profile through OSINT first. By the time they run their first active scan, they already know what they're looking for.

---

## 🧠 Passive vs Active: Why It Matters

**Passive enumeration (OSINT):**
- You never contact the target's systems directly
- The target cannot log or detect your activity
- Uses publicly available sources: search engines, databases, social media, certificate logs
- Legal in virtually all contexts: you're only accessing public information
- Should always come before active enumeration

**Active enumeration:**
- You send packets directly to the target
- The target's systems can log your activity
- Requires authorization in professional engagements
- Tools like nmap, gobuster, ffuf

**The workflow:**
```
OSINT (passive) → build a complete picture
        ↓
Active enumeration → confirm and expand on what OSINT found
        ↓
Exploitation → attack the specific weaknesses identified
```

---

## 🌐 Shodan: Search Engine for Internet-Connected Devices

Shodan is a search engine that continuously scans the internet and indexes what it finds: open ports, service banners, software versions, SSL certificates, and more. Unlike Google which indexes web pages, Shodan indexes devices and services.

**Why it matters:** Shodan has already scanned your target. You can look up what's exposed without sending a single packet to the target yourself.

Website: https://www.shodan.io
Free account gives limited results: paid gives full access
```bash
# Install Shodan CLI
pip3 install shodan

# Initialize with your API key (free at shodan.io)
shodan init <your-api-key>

# Search for a specific IP
shodan host <target-ip>

# Search for a domain
shodan search hostname:example.com

# Find all open ports on an IP
shodan host <target-ip> --history

# Search for specific software
shodan search "Apache 2.4.18"
shodan search "IIS 6.0"

# Find exposed services in a country
shodan search "port:3389 country:US"

# Find exposed databases
shodan search "port:27017 MongoDB"
shodan search "port:6379 Redis"

# Find devices by organization
shodan search "org:Example Company"
```

**Useful Shodan filters:**

| Filter | Example | What it finds |
|---|---|---|
| `hostname:` | `hostname:example.com` | Services on a domain |
| `org:` | `org:Microsoft` | Services owned by an org |
| `port:` | `port:22` | Services on a specific port |
| `country:` | `country:US` | Services in a country |
| `product:` | `product:nginx` | Specific software |
| `vuln:` | `vuln:CVE-2021-44228` | Services vulnerable to a CVE |
| `ssl:` | `ssl:example.com` | Services with certs for a domain |

---

## 🔭 Censys: Alternative to Shodan

Censys is similar to Shodan: it continuously scans the internet and indexes what it finds. It has a different dataset and sometimes finds things Shodan misses. Use both.

Website: https://search.censys.io
Free account available
```bash
# Install Censys CLI
pip3 install censys

# Search for an IP
censys view --index-type hosts <target-ip>

# Search for a domain
censys search "parsed.names: example.com" --index-type certificates
```

---

## 🌍 WHOIS & ASN Lookups: Mapping Infrastructure

WHOIS records contain registration information for domains and IP addresses. ASN (Autonomous System Number) lookups reveal which IP ranges belong to an organization.
```bash
# Domain WHOIS
whois example.com

# IP WHOIS
whois <target-ip>

# Find ASN for an organization
# Visit: https://bgp.he.net
# Search for the company name

# Find all IP ranges for an ASN
whois -h whois.radb.net -- '-i origin AS12345'

# Use amass for ASN enumeration
amass intel -asn 12345
amass intel -org "Example Company"
```

**What to look for in WHOIS:**
- Registrar and registration dates
- Name servers: can reveal hosting provider
- Contact emails: useful for phishing simulations in authorized engagements
- Related domains registered by the same entity
- IP netblocks owned by the organization

---

## 👤 LinkedIn & Social Media: People Intelligence

People are the most exploitable attack surface in any organization. LinkedIn, Twitter/X, Instagram, and GitHub reveal employee names, job titles, technology stacks, and internal project names.

**What you're looking for:**

**From LinkedIn:**
- Employee names: for username enumeration and phishing
- Job titles: reveals org structure and who has privileged access
- Technology mentions in job postings: "experience with AWS, Kubernetes, and Jenkins" tells you their stack
- Recently departed employees: often leave with access still enabled
- IT and security staff: know who's watching

**From job postings:**
```
Job posting: "Must have experience with Cisco ASA firewalls,
             Splunk SIEM, and Windows Server 2019"

This tells you:
- They use Cisco ASA firewalls
- They run Splunk for log monitoring
- Their servers run Windows Server 2019
```

**Username format discovery:**
Once you have employee names you can guess username formats:
```
John Smith might be:
jsmith
john.smith
smithj
johns
j.smith
```

Test your guessed format against discovered services: SSH, SMB, email.

---

## 🐙 GitHub Dorking: Finding Leaked Credentials

GitHub is an enormous source of accidentally leaked sensitive information. Developers commit code with credentials, API keys, and internal documentation: then push it to public repositories.
```bash
# Search GitHub directly: visit https://github.com/search

# Common dorks to run manually
"example.com" password
"example.com" api_key
"example.com" secret
"example.com" DB_PASSWORD
"example.com" AWS_ACCESS_KEY
"@example.com" password

# Organization-specific searches
org:examplecompany password
org:examplecompany secret
org:examplecompany .env
```

**Automated GitHub secret scanning:**
```bash
# Install truffleHog
pip3 install truffleHog3

# Scan a specific repository
trufflehog git https://github.com/example/repo

# Scan an entire organization
trufflehog github --org=examplecompany

# Install gitleaks
# Linux
sudo apt install gitleaks

# macOS
brew install gitleaks

# Windows: download from: https://github.com/gitleaks/gitleaks/releases

# Scan a repo with gitleaks
gitleaks detect --source /path/to/cloned/repo
gitleaks detect --source /path/to/cloned/repo -r gitleaks-report.json
```

**What you commonly find:**
- AWS access keys and secret keys
- Database connection strings with credentials
- API keys for third-party services
- Private SSH keys
- Internal hostnames and IP addresses
- `.env` files committed by accident

---

## 📧 Email & Breach Data

Email addresses connected to a domain reveal employee names, email format conventions, and potential credential reuse.
```bash
# theHarvester: collects emails, subdomains, IPs from public sources
sudo apt install theharvester      # Linux
pip3 install theHarvester          # macOS/Windows

# Gather emails and subdomains
theHarvester -d example.com -b google,bing,linkedin,twitter

# Save output
theHarvester -d example.com -b all -f theharvester-output.html

# Hunter.io: finds email addresses for a domain
# Visit: https://hunter.io
# Free tier: 25 searches/month
```

---

## 🔄 Recommended OSINT Workflow
```bash
# Step 1: domain and infrastructure mapping
whois example.com
amass intel -org "Example Company"
shodan search "hostname:example.com"

# Step 2: subdomain discovery via passive sources
amass enum -passive -d example.com -o passive-subs.txt
curl -s "https://crt.sh/?q=%.example.com&output=json" | \
  python3 -c "import sys,json; [print(x['name_value']) for x in json.load(sys.stdin)]" | \
  sort -u >> passive-subs.txt

# Step 3: people intelligence
theHarvester -d example.com -b google,linkedin -f harvester.html

# Step 4: GitHub secret scanning
trufflehog github --org=examplecompany

# Step 5: compile everything before going active
# You now have:
# - IP ranges owned by the target
# - All known subdomains
# - Employee names and email format
# - Technology stack
# - Potential leaked credentials
# THEN start active enumeration
```

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| OSINT before active | Sometimes skipped | Always: it's in the methodology |
| Shodan/Censys | Check for exposed services | Full infrastructure mapping |
| LinkedIn recon | Rarely relevant | Essential for social engineering scope |
| GitHub dorking | Check for leaked keys | Full org scan: critical findings |
| Breach data | Not usually relevant | Check for credential reuse |
| Document everything | Good habit | Required: all findings go in report |

---

## 🔗 Go Deeper

This section covers OSINT as it applies to enumeration. For the full
OSINT and Google dorking reference: operators, people finding, dark
web intelligence, free research tools, and complete investigation
workflows: the dedicated guide is here:

| Resource | What It Covers |
|---|---|
| [google-dorking](https://github.com/commit-issues/google-dorking) | Complete OSINT and search engine intelligence reference |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*