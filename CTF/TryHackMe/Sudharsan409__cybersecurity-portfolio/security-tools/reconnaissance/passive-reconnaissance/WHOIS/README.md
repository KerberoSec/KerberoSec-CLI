# 🌐 WHOIS: The Complete Practical Guide

> A comprehensive field guide to WHOIS for passive reconnaissance, domain intelligence, registration analysis, and OSINT.

---

## 📌 Table of Contents

* [What is WHOIS?](#-what-is-whois)
* [Where WHOIS Fits in a Pentest](#-where-whois-fits-in-a-pentest)
* [Passive vs Active Reconnaissance](#-passive-vs-active-reconnaissance)
* [What Information Can WHOIS Provide?](#-what-information-can-whois-provide)
* [WHOIS vs RDAP](#-whois-vs-rdap)
* [Prerequisites](#-prerequisites)
* [Installation](#-installation)
* [Verify Installation](#-verify-installation)
* [Basic Syntax](#-basic-syntax)
* [Domain WHOIS Lookup](#-domain-whois-lookup)
* [IP Address WHOIS](#-ip-address-whois)
* [Nameservers](#-nameservers)
* [Registrar Information](#-registrar-information)
* [Registration Dates](#-registration-dates)
* [Domain Status](#-domain-status)
* [Registrant Information](#-registrant-information)
* [Privacy Protection](#-privacy-protection)
* [WHOIS Servers](#-whois-servers)
* [Querying a Specific WHOIS Server](#-querying-a-specific-whois-server)
* [WHOIS for IP Ranges](#-whois-for-ip-ranges)
* [WHOIS and ASN Reconnaissance](#-whois-and-asn-reconnaissance)
* [Reverse WHOIS](#-reverse-whois)
* [WHOIS and DNS](#-whois-and-dns)
* [WHOIS and Nmap](#-whois-and-nmap)
* [WHOIS and Gobuster](#-whois-and-gobuster)
* [WHOIS and Other Recon Tools](#-whois-and-other-recon-tools)
* [Practical Scenarios](#-practical-scenarios)
* [Building a Reconnaissance Workflow](#-building-a-reconnaissance-workflow)
* [Automation](#-automation)
* [Common Errors](#-common-errors)
* [Limitations](#-limitations)
* [Operational Considerations](#-operational-considerations)
* [Defensive Perspective](#-defensive-perspective)
* [WHOIS Cheat Sheet](#-whois-cheat-sheet)
* [Mastery Checklist](#-mastery-checklist)
* [Recommended Learning Path](#-recommended-learning-path)
* [Legal Disclaimer](#-legal-disclaimer)

---

# 🌐 What is WHOIS?

**WHOIS** is a protocol and query system traditionally used to retrieve registration and allocation information about Internet resources.

Depending on the registry and privacy settings, a domain WHOIS query may provide information such as:

* Domain name
* Registrar
* Registration date
* Updated date
* Expiration date
* Domain status
* Nameservers
* Registry information
* Registrant information where publicly available
* Administrative contacts where publicly available
* Technical contacts where publicly available

For IP addresses, WHOIS can provide information about:

* IP allocation
* Regional Internet Registry
* Organization
* Network range
* ASN
* Abuse contact
* Allocation information

---

# 🎯 Where WHOIS Fits in a Pentest

WHOIS belongs primarily to:

```text
security-tools/
└── reconnaissance/
    └── passive-reconnaissance/
        └── whois/
            └── README.md
```

A simplified reconnaissance workflow:

```text
                    Reconnaissance
                          │
             ┌────────────┴────────────┐
             │                         │
       Passive Recon              Active Recon
             │                         │
       ┌─────┴─────┐             ┌─────┴─────┐
       │           │             │           │
     WHOIS        DNS           Nmap      Gobuster
     RDAP         OSINT         Scanning   Enumeration
```

WHOIS is useful at the **beginning of an assessment** because it can provide context before you interact directly with the target infrastructure.

---

# 🕵️ Passive vs Active Reconnaissance

## Passive Reconnaissance

Passive reconnaissance gathers information without directly probing the target's systems.

Examples:

```text
WHOIS
RDAP
Search engines
Certificate Transparency
Public DNS information
Public company information
Public documentation
```

---

## Active Reconnaissance

Active reconnaissance directly interacts with the target.

Examples:

```text
Nmap
Gobuster
Port scanning
Service enumeration
Web crawling
HTTP requests
```

The distinction is important:

```text
WHOIS
  ↓
Passive information gathering

Nmap
  ↓
Active network reconnaissance

Gobuster
  ↓
Active web enumeration
```

---

# 📊 What Information Can WHOIS Provide?

A WHOIS response may contain fields similar to:

```text
Domain Name:
Registrar:
Creation Date:
Updated Date:
Expiration Date:
Domain Status:
Name Server:
Registrant:
Registrant Organization:
Registrant Country:
Administrative Contact:
Technical Contact:
```

However:

> **Do not assume every query will expose every field.**

Modern privacy regulations, privacy-protection services, registry policies, and registrar policies can hide personal information.

---

# 🔄 WHOIS vs RDAP

WHOIS is the traditional system.

**RDAP (Registration Data Access Protocol)** is the newer standardized approach to registration-data access.

RDAP provides structured responses, generally using HTTP and JSON.

Conceptually:

```text
WHOIS
  ↓
Text-oriented registration data

RDAP
  ↓
Structured JSON registration data
```

For modern reconnaissance, learn both.

---

# 🧰 Prerequisites

You should understand:

* DNS
* Domains
* Registrars
* Registries
* IP addresses
* CIDR
* Autonomous System Numbers
* Nameservers
* DNS records
* Basic Linux command-line usage

Helpful commands:

```bash
dig
nslookup
host
curl
whois
```

---

# 📦 Installation

## 🐧 Kali Linux

Check:

```bash
whois --version
```

If necessary:

```bash
sudo apt update
sudo apt install whois
```

---

## 🐧 Debian / Ubuntu

```bash
sudo apt update
sudo apt install whois
```

---

## 🍎 macOS

Depending on the macOS version, WHOIS may already be available.

Check:

```bash
whois --version
```

If unavailable, install an appropriate WHOIS package using your preferred package manager.

---

## 🪟 Windows

Windows does not traditionally ship with the Linux `whois` command.

Options include:

* WSL
* Security-testing distributions
* Third-party WHOIS clients
* Web-based WHOIS/RDAP services

For a security-learning environment, Kali Linux or WSL is convenient.

---

# ✅ Verify Installation

Run:

```bash
whois --version
```

Then:

```bash
whois --help
```

You can also check:

```bash
which whois
```

Example:

```text
/usr/bin/whois
```

---

# 🧠 Basic Syntax

The basic syntax is:

```bash
whois DOMAIN
```

Example using a documentation domain:

```bash
whois example.com
```

For a real penetration test, replace the domain with an authorized target.

---

# 🌍 Domain WHOIS Lookup

Basic:

```bash
whois example.com
```

Look for:

```text
Registrar
Creation Date
Updated Date
Expiration Date
Name Servers
Domain Status
```

---

# 📅 Registration Dates

Three particularly useful dates are:

```text
Creation Date
Updated Date
Expiration Date
```

Example:

```text
Creation Date: 2020-01-01
Updated Date: 2026-01-01
Expiration Date: 2027-01-01
```

These dates can help establish:

* Approximate domain age
* Recent registration changes
* Potentially interesting infrastructure changes

---

# 🏢 Registrar Information

WHOIS may identify the registrar.

For example:

```text
Registrar:
Example Registrar Ltd
```

This tells you which registrar manages the domain registration.

The registrar is **not necessarily the organization that owns the domain**.

This distinction is important:

```text
Registrar
   ≠
Registrant
```

---

# 🌐 Nameservers

WHOIS commonly exposes nameservers.

Example:

```text
Name Server:
NS1.EXAMPLE.NET
NS2.EXAMPLE.NET
```

Nameservers are valuable because they provide clues about the DNS infrastructure.

You can investigate them further using:

```bash
dig NS example.com
```

or:

```bash
dig +short NS example.com
```

---

# 🔐 Domain Status

You may see statuses such as:

```text
clientTransferProhibited
serverTransferProhibited
clientUpdateProhibited
clientDeleteProhibited
```

These are registry/registrar controls.

They can provide insight into how the domain is managed.

Do not automatically interpret a status as a vulnerability.

---

# 👤 Registrant Information

Historically, WHOIS frequently exposed:

```text
Registrant Name
Registrant Organization
Registrant Address
Registrant Email
Registrant Phone
```

Today, this information is often:

* Redacted
* Privacy-protected
* Replaced by a proxy service
* Restricted by registry policy
* Limited because of privacy regulations

Example:

```text
Registrant Organization:
REDACTED FOR PRIVACY
```

This is normal.

---

# 🛡️ WHOIS Privacy Protection

Domain owners can use privacy services.

Instead of:

```text
Registrant:
John Smith
```

you may see:

```text
Registrant:
Privacy Protected
```

This reduces exposure of personal registration information.

From a security perspective:

> **Do not assume missing WHOIS information means the domain has no owner.**

It usually means the public registration data is restricted.

---

# 🖥️ IP Address WHOIS

WHOIS can also be queried against an IP address.

Example:

```bash
whois 8.8.8.8
```

You may receive information such as:

```text
NetRange
CIDR
Organization
Country
OriginAS
Abuse Contact
```

This can help determine who controls or has been allocated the address range.

---

# 📡 IP Range Investigation

Suppose you discover:

```text
203.0.113.10
```

You can query:

```bash
whois 203.0.113.10
```

The result may indicate that the IP belongs to a larger allocation:

```text
203.0.113.0/24
```

This provides infrastructure context.

---

# 🧮 Understanding CIDR

You may encounter:

```text
203.0.113.0/24
```

This represents an IP network.

Understanding CIDR helps you interpret WHOIS output.

Common examples:

```text
/24
/23
/22
/16
```

WHOIS can therefore help connect:

```text
Domain
   ↓
IP
   ↓
Network range
   ↓
Organization
   ↓
ASN
```

---

# 🔢 Autonomous System Numbers

An **ASN (Autonomous System Number)** identifies an autonomous system on the Internet.

Example:

```text
AS64500
```

WHOIS information can sometimes reveal the ASN associated with an IP allocation.

You can then investigate the ASN using appropriate Internet registries and routing-information services.

---

# 🌐 WHOIS and DNS

WHOIS and DNS answer different questions.

### WHOIS

```text
Who manages this registration?
When was it registered?
Which registrar manages it?
What nameservers are associated?
```

### DNS

```text
What IP does this domain resolve to?
Which mail server handles email?
What TXT records exist?
What other DNS records are published?
```

Use them together.

Example:

```bash
whois example.com
```

Then:

```bash
dig example.com
```

Then:

```bash
dig NS example.com
```

Then:

```bash
dig MX example.com
```

---

# 🔎 Useful DNS Queries

## A Record

```bash
dig A example.com
```

## AAAA Record

```bash
dig AAAA example.com
```

## MX Record

```bash
dig MX example.com
```

## NS Record

```bash
dig NS example.com
```

## TXT Record

```bash
dig TXT example.com
```

## All Common Information

```bash
dig ANY example.com
```

> Note: Many DNS servers intentionally provide limited or empty responses to `ANY` queries. Do not rely on it as a complete enumeration method.

---

# 🔗 WHOIS + DNS Workflow

A simple passive reconnaissance workflow:

```text
WHOIS
  ↓
Registrar
Creation date
Nameservers
Domain status
  ↓
DNS
  ↓
A / AAAA
MX
NS
TXT
  ↓
Infrastructure understanding
```

---

# 🧭 WHOIS + Nmap

WHOIS should generally come **before** active scanning.

Example:

```text
WHOIS
 ↓
Identify domain information
 ↓
DNS
 ↓
Identify IP
 ↓
Nmap
 ↓
Identify exposed services
```

For example:

```bash
whois example.com
```

Then:

```bash
dig +short example.com
```

Then, only when authorized:

```bash
nmap -sV AUTHORIZED_IP
```

This demonstrates the distinction between:

```text
Passive reconnaissance
        ↓
Active reconnaissance
```

---

# 🔎 WHOIS + Gobuster

These tools have very different purposes.

### WHOIS

```text
Passive reconnaissance
```

### Gobuster

```text
Active web enumeration
```

A logical workflow:

```text
WHOIS
 ↓
Domain information
 ↓
DNS
 ↓
Identify web host
 ↓
Gobuster
 ↓
Discover web resources
```

For example:

```text
example.com
    ↓
www.example.com
    ↓
https://www.example.com
    ↓
Gobuster
    ↓
/admin
/api
/login
```

---

# 🧪 Practical Scenario 1: Initial Domain Reconnaissance

### Objective

Understand an authorized target domain before active testing.

### Step 1

```bash
whois example.com
```

### Step 2

Record:

```text
Registrar
Creation date
Expiration date
Nameservers
Domain status
```

### Step 3

Perform DNS analysis:

```bash
dig NS example.com
dig MX example.com
dig TXT example.com
```

### Step 4

Document the infrastructure.

---

# 🧪 Practical Scenario 2: Investigating an IP

Suppose DNS gives:

```text
203.0.113.10
```

Run:

```bash
whois 203.0.113.10
```

Look for:

```text
Organization
CIDR
Network range
ASN
Abuse contact
```

This helps establish who appears to control the network allocation.

---

# 🧪 Practical Scenario 3: Investigating a New Domain

Suppose an organization has:

```text
new-example.com
```

Run:

```bash
whois new-example.com
```

Look at:

```text
Creation Date
Registrar
Nameservers
Domain Status
```

A recently registered domain may be worth investigating further during authorized threat-intelligence work.

---

# 🧪 Practical Scenario 4: Infrastructure Change Investigation

Suppose a domain's WHOIS data shows:

```text
Updated Date:
2026-08-01
```

You can compare this with other available public information.

Possible follow-up:

```text
WHOIS
 ↓
DNS
 ↓
Certificate Transparency
 ↓
Historical DNS data
 ↓
Public documentation
```

The goal is to establish whether infrastructure has changed.

---

# 🧪 Practical Scenario 5: Nameserver Investigation

WHOIS:

```text
Name Server:
ns1.example.net
ns2.example.net
```

Then:

```bash
dig NS example.com
```

Then investigate the nameserver domain through authorized/passive sources.

This can reveal relationships between domains and DNS infrastructure.

---

# 🧪 Practical Scenario 6: Registrar Investigation

WHOIS may identify:

```text
Registrar:
Example Registrar
```

This can help with:

* Asset inventory
* Incident response
* Domain ownership verification
* Threat intelligence
* Brand monitoring

---

# 🧪 Practical Scenario 7: Security Incident Investigation

During an incident, WHOIS information can provide historical context.

For example:

```text
Suspicious Domain
       ↓
WHOIS
       ↓
Creation Date
Registrar
Nameservers
Status
       ↓
DNS
       ↓
IP
       ↓
Infrastructure investigation
```

A newly registered domain may be relevant to phishing or malicious infrastructure investigations, although **domain age alone is not evidence of maliciousness**.

---

# 🧪 Practical Scenario 8: Domain Ownership Verification

WHOIS can assist in determining:

```text
Registrar
Registration status
Registration dates
Organization information
```

However, WHOIS should not be treated as definitive proof of ownership when privacy services or proxy registrations are involved.

Use multiple authoritative sources.

---

# 🧪 Practical Scenario 9: Security Asset Inventory

Organizations can use WHOIS to help maintain:

```text
Domain
Registrar
Expiration
Nameservers
Organization
```

A basic inventory might look like:

| Domain      | Registrar   | Created | Expires | Nameserver      |
| ----------- | ----------- | ------- | ------- | --------------- |
| example.com | Registrar A | 2020    | 2027    | ns1.example.net |

This can help identify domains approaching expiration.

---

# 🔄 WHOIS + RDAP

For modern workflows:

```text
WHOIS
  +
RDAP
```

Use WHOIS when you need traditional registry information.

Use RDAP when you want structured registration data.

Conceptually:

```text
Domain
  │
  ├── WHOIS
  │
  └── RDAP
       │
       ▼
Registration information
```

---

# 📡 Querying WHOIS Servers

WHOIS operates through servers associated with registries and registrars.

Your client may automatically determine an appropriate server.

You can inspect available command options:

```bash
whois --help
```

Depending on the WHOIS client installed on your system, you may be able to specify a server manually.

For example, some clients support:

```bash
whois -h WHOIS_SERVER example.com
```

Check your local implementation:

```bash
man whois
```

---

# 🧠 WHOIS Server Hierarchy

A simplified model:

```text
You
 ↓
WHOIS Client
 ↓
WHOIS Server
 ↓
Registry / Registrar
 ↓
Registration Database
```

Different domain extensions may be managed by different registries.

For example:

```text
.com
.org
.net
.co.uk
```

can have different registration authorities and data policies.

---

# 🌍 Country-Code Domains

Country-code top-level domains are called **ccTLDs**.

Examples:

```text
.uk
.in
.de
.fr
.au
```

Their WHOIS behavior can differ significantly.

You may encounter:

```text
Different WHOIS servers
Different fields
Different privacy policies
Different registration rules
```

Therefore:

> Never assume every TLD behaves exactly like `.com`.

---

# 🔄 WHOIS Output Is Not Standardized

Different WHOIS servers can return different formats.

You might see:

```text
Registrar:
```

on one server and:

```text
Registrar Name:
```

on another.

This is one reason RDAP is valuable: it provides a more standardized structured format.

---

# 🔍 Searching WHOIS Output

Save output:

```bash
whois example.com > whois.txt
```

Search:

```bash
grep -i registrar whois.txt
```

Search for nameservers:

```bash
grep -i "name server" whois.txt
```

Search for dates:

```bash
grep -Ei "creation|created|updated|expiration|expiry" whois.txt
```

---

# 💾 Saving Reconnaissance Results

A professional reconnaissance directory might look like:

```text
recon/
├── whois/
│   ├── domain-whois.txt
│   └── ip-whois.txt
│
├── dns/
│   ├── ns.txt
│   ├── mx.txt
│   └── txt.txt
│
└── notes.md
```

This keeps passive reconnaissance organized.

---

# 🤖 Basic Automation

You can automate repeated queries with a shell loop.

Example for authorized domains:

```bash
while read domain; do
    echo "===== $domain ====="
    whois "$domain"
done < domains.txt
```

Save results:

```bash
while read domain; do
    whois "$domain" > "results/${domain}.txt"
done < domains.txt
```

Create the directory first:

```bash
mkdir -p results
```

---

# 🐍 Simple Python Automation

A basic workflow can invoke the local WHOIS client:

```python
import subprocess

domain = "example.com"

result = subprocess.run(
    ["whois", domain],
    capture_output=True,
    text=True
)

print(result.stdout)
```

For larger automation projects, consider using structured RDAP APIs rather than parsing inconsistent WHOIS text.

---

# ⚠️ Automation Considerations

When automating reconnaissance:

* Respect rate limits
* Cache results
* Avoid unnecessary queries
* Follow the engagement scope
* Store results securely
* Do not collect unnecessary personal information

---

# 🧠 Passive Reconnaissance Toolkit

WHOIS is only one component.

A useful passive-recon toolkit includes:

```text
WHOIS
RDAP
DNS
Certificate Transparency
Search Engines
Public DNS datasets
ASN information
BGP information
Public cloud information
Public repositories
Public documentation
```

A mature workflow combines multiple sources.

---

# 🔗 WHOIS + Certificate Transparency

Certificate Transparency logs can reveal hostnames appearing in TLS certificates.

Conceptually:

```text
WHOIS
 ↓
example.com
 ↓
Certificate Transparency
 ↓
dev.example.com
api.example.com
staging.example.com
```

This is a powerful passive-recon combination.

---

# 🔗 WHOIS + ASN

The relationship can be:

```text
Domain
 ↓
DNS
 ↓
IP
 ↓
ASN
 ↓
Organization
```

This helps you understand how Internet infrastructure is organized.

---

# 🔗 WHOIS + Search Engines

Search engines can provide public information that WHOIS cannot.

For example:

```text
WHOIS
   +
Search engines
   +
DNS
```

can provide a broader picture of an organization's public presence.

---

# 🧠 Important Distinction: WHOIS ≠ DNS

WHOIS does not tell you everything DNS can tell you.

DNS may provide:

```text
A
AAAA
MX
NS
TXT
CNAME
CAA
```

WHOIS may provide:

```text
Registrar
Registration dates
Domain status
Nameservers
Registration information
```

Use both.

---

# 🧠 Important Distinction: WHOIS ≠ Nmap

WHOIS:

```text
Passive
Registration information
Ownership/infrastructure context
```

Nmap:

```text
Active
Ports
Services
Service versions
Network behavior
```

They belong to different phases of reconnaissance.

---

# 🧠 Important Distinction: WHOIS ≠ Gobuster

WHOIS:

```text
Passive reconnaissance
```

Gobuster:

```text
Active web enumeration
```

A good security methodology might therefore look like:

```text
WHOIS
 ↓
DNS
 ↓
Nmap
 ↓
Gobuster
 ↓
Burp Suite
 ↓
Vulnerability Assessment
```

---

# 🚨 Common WHOIS Errors

## "WHOIS command not found"

Install the package:

```bash
sudo apt install whois
```

---

## "No match for domain"

Possible reasons:

* Domain does not exist
* Wrong TLD
* Registry does not provide traditional WHOIS
* Query server issue
* Data is unavailable

Verify DNS:

```bash
dig example.com
```

---

## Information is Redacted

This is normal.

For example:

```text
Registrant:
REDACTED FOR PRIVACY
```

Use:

```text
RDAP
DNS
Certificate Transparency
Public records
```

to obtain additional **publicly available** context.

---

## WHOIS Output Looks Different

This is expected.

Different registries and WHOIS servers can format information differently.

Use:

```bash
man whois
```

and understand the registry involved.

---

# ⚠️ Limitations of WHOIS

WHOIS is useful, but it has limitations.

### Privacy

Registrant information may be hidden.

### Inconsistent formatting

Different registries return different formats.

### Historical information

Current WHOIS data may not show previous ownership.

### Accuracy

Registration information can be incomplete or outdated.

### Attribution

An IP or domain being associated with an organization does not automatically mean that organization operates every service behind it.

---

# 🧠 Avoid Making Incorrect Assumptions

Suppose:

```text
WHOIS
Organization: Example Hosting Ltd
```

This does **not** necessarily mean:

```text
Example Hosting Ltd owns the website.
```

It could simply mean:

```text
Example Hosting Ltd
        ↓
Provides hosting
        ↓
Customer operates website
```

Always correlate WHOIS with other evidence.

---

# 🛡️ Defensive Perspective

Security teams can use WHOIS for:

### Asset management

Identify domains registered by an organization.

### Domain expiration monitoring

Prevent accidental domain expiration.

### Threat intelligence

Investigate suspicious domains.

### Incident response

Gather registration context.

### Brand monitoring

Identify potentially suspicious look-alike domains.

### Infrastructure mapping

Connect:

```text
Domain
 ↓
IP
 ↓
Network
 ↓
ASN
```

---

# 🔐 Protecting Your Organization

Organizations should maintain an inventory of:

```text
Domains
Subdomains
Registrars
Expiration dates
Nameservers
DNS providers
Cloud providers
IP allocations
Certificates
```

Do not rely on WHOIS alone.

---

# 📋 Professional Reconnaissance Checklist

When performing passive reconnaissance against an authorized target:

* [ ] Identify primary domain
* [ ] Perform WHOIS lookup
* [ ] Check registrar
* [ ] Record creation date
* [ ] Record expiration date
* [ ] Record update date
* [ ] Record domain status
* [ ] Record nameservers
* [ ] Perform RDAP lookup where appropriate
* [ ] Enumerate DNS records
* [ ] Identify IP addresses
* [ ] Identify ASN where relevant
* [ ] Review Certificate Transparency data
* [ ] Correlate findings
* [ ] Document evidence
* [ ] Avoid unsupported assumptions

---

# 🧭 Complete Passive Recon Workflow

A strong passive reconnaissance workflow:

```text
                     TARGET DOMAIN
                           │
                           ▼
                        WHOIS
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          Registrar      Dates      Nameservers
              │                         │
              │                         ▼
              │                        DNS
              │                         │
              │                ┌────────┼────────┐
              │                ▼        ▼        ▼
              │                A       MX       TXT
              │                │
              │                ▼
              │               IP
              │                │
              │                ▼
              │               ASN
              │
              ▼
             RDAP
              │
              ▼
     Structured registration data
              │
              ▼
 Certificate Transparency / OSINT
              │
              ▼
      Consolidated Asset Picture
```

Only after this passive phase should you move into active testing when authorized:

```text
Passive Recon
      ↓
Active Recon
      ↓
Enumeration
      ↓
Vulnerability Assessment
      ↓
Exploitation
```

---

# 🧾 WHOIS Cheat Sheet

## Domain

```bash
whois example.com
```

## IP

```bash
whois 8.8.8.8
```

## Save output

```bash
whois example.com > whois.txt
```

## Search registrar

```bash
grep -i registrar whois.txt
```

## Search nameservers

```bash
grep -i "name server" whois.txt
```

## Search dates

```bash
grep -Ei "creation|created|updated|expiration|expiry" whois.txt
```

## DNS

```bash
dig A example.com
dig AAAA example.com
dig NS example.com
dig MX example.com
dig TXT example.com
```

## Help

```bash
whois --help
```

## Manual

```bash
man whois
```

---

# 🏆 WHOIS Mastery Checklist

You can consider yourself proficient with WHOIS when you can:

* [ ] Explain what WHOIS is
* [ ] Explain passive reconnaissance
* [ ] Perform domain WHOIS lookups
* [ ] Perform IP WHOIS lookups
* [ ] Identify registrars
* [ ] Understand registration dates
* [ ] Understand domain status
* [ ] Identify nameservers
* [ ] Understand WHOIS privacy
* [ ] Explain WHOIS vs RDAP
* [ ] Understand IP allocations
* [ ] Understand CIDR
* [ ] Understand ASN relationships
* [ ] Correlate WHOIS with DNS
* [ ] Correlate WHOIS with Certificate Transparency
* [ ] Use WHOIS before active reconnaissance
* [ ] Automate basic queries responsibly
* [ ] Document reconnaissance findings
* [ ] Avoid making unsupported attribution claims

---

# 📚 Recommended Learning Order

If you are learning reconnaissance from scratch:

```text
1. Internet fundamentals
        ↓
2. Domain names
        ↓
3. DNS
        ↓
4. WHOIS
        ↓
5. RDAP
        ↓
6. IP addresses & CIDR
        ↓
7. ASN / BGP concepts
        ↓
8. Certificate Transparency
        ↓
9. Nmap
        ↓
10. Gobuster
        ↓
11. Burp Suite
```

---

# 🎯 Final Takeaway

WHOIS is one of the simplest tools in a penetration tester's toolkit, but it teaches an extremely important security concept:

> **Understand the target before interacting with the target.**

A mature reconnaissance process does not begin with:

```text
nmap -p- target
```

It begins by building context:

```text
Domain
  ↓
WHOIS
  ↓
RDAP
  ↓
DNS
  ↓
IP
  ↓
ASN
  ↓
Certificate Transparency
  ↓
Public intelligence
  ↓
Active reconnaissance
  ↓
Enumeration
```

WHOIS alone will rarely provide the complete picture.

Its real value comes from **correlating registration data with DNS, IP addressing, ASN information, certificates, and other publicly available intelligence**.

---

# ⚠️ Legal Disclaimer

WHOIS itself is a legitimate information-retrieval mechanism.

However, information obtained through reconnaissance should only be used for legitimate purposes.

Only perform security testing and subsequent active enumeration against:

* Systems you own
* Your own applications
* Authorized penetration-testing targets
* Dedicated security labs
* CTF environments
* Systems where you have explicit permission

Respect:

* Scope
* Privacy
* Terms of service
* Rate limits
* Applicable laws and regulations

Passive reconnaissance does not automatically mean every subsequent action is authorized.

---

## 🚀 Next Steps

After learning WHOIS, the natural progression is:

```text
WHOIS
  ↓
RDAP
  ↓
DNS Enumeration
  ↓
Certificate Transparency
  ↓
ASN / IP Intelligence
  ↓
Nmap
  ↓
Gobuster
  ↓
Burp Suite
```

