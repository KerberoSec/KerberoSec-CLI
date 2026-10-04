# 🌐 RDAP: Registration Data Access Protocol

> The Complete Practical Guide to RDAP for Passive Reconnaissance, Domain Intelligence, IP Intelligence, ASN Investigation, Registration Analysis, OSINT, Threat Intelligence, and Security Research.

---

# 📖 Table of Contents

- [What is RDAP?](#-what-is-rdap)
- [Why RDAP Exists](#-why-rdap-was-created)
- [WHOIS vs RDAP](#-whois-vs-rdap)
- [Where RDAP Fits in Cybersecurity](#-where-rdap-fits-in-cybersecurity)
- [Passive Reconnaissance](#-passive-reconnaissance)
- [What RDAP Can Tell You](#-what-rdap-can-tell-you)
- [What RDAP Cannot Tell You](#-what-rdap-cannot-tell-you)
- [RDAP Architecture](#-rdap-architecture)
- [RDAP Objects](#-rdap-objects)
- [Domain Objects](#-domain-objects)
- [IP Network Objects](#-ip-network-objects)
- [Autonomous System Numbers](#-autonomous-system-numbers)
- [Entities](#-entities)
- [Events](#-events)
- [Nameservers](#-nameservers)
- [Status Codes](#-status-codes)
- [RDAP JSON](#-rdap-json)
- [Prerequisites](#-prerequisites)
- [Tools Required](#-tools-required)
- [Using curl](#-using-curl)
- [Browser-Based RDAP](#-browser-based-rdap)
- [Finding an RDAP Server](#-finding-an-rdap-server)
- [Domain Lookup](#-domain-lookup)
- [IP Lookup](#-ip-lookup)
- [IPv6 Lookup](#-ipv6-lookup)
- [ASN Lookup](#-asn-lookup)
- [Nameserver Investigation](#-nameserver-investigation)
- [Parsing RDAP JSON](#-parsing-rdap-json)
- [jq](#-using-jq-with-rdap)
- [Python Automation](#-python-automation)
- [Bulk RDAP Queries](#-bulk-rdap-queries)
- [RDAP Reconnaissance Workflow](#-rdap-reconnaissance-workflow)
- [RDAP + WHOIS](#-rdap--whois)
- [RDAP + DNS](#-rdap--dns)
- [RDAP + Nmap](#-rdap--nmap)
- [RDAP + Gobuster](#-rdap--gobuster)
- [RDAP + Certificate Transparency](#-rdap--certificate-transparency)
- [RDAP + ASN](#-rdap--asn)
- [Practical Scenarios](#-practical-scenarios)
- [Threat Intelligence](#-threat-intelligence)
- [Incident Response](#-incident-response)
- [Domain Investigation](#-domain-investigation)
- [IP Investigation](#-ip-investigation)
- [Infrastructure Mapping](#-infrastructure-mapping)
- [Automation](#-automation)
- [Building a Recon Script](#-building-a-recon-script)
- [Error Handling](#-error-handling)
- [Rate Limits](#-rate-limits)
- [Privacy](#-privacy)
- [Limitations](#-limitations)
- [Common Mistakes](#-common-mistakes)
- [Defensive Security](#-defensive-security)
- [Professional Recon Methodology](#-professional-recon-methodology)
- [RDAP Cheat Sheet](#-rdap-cheat-sheet)
- [Mastery Checklist](#-mastery-checklist)
- [Recommended Learning Path](#-recommended-learning-path)
- [Legal Disclaimer](#-legal-disclaimer)

---

# 🌐 What is RDAP?

**RDAP** stands for:

> **Registration Data Access Protocol**

RDAP is a modern protocol designed to provide structured access to Internet registration data.

It was developed as a modern replacement/alternative to the traditional WHOIS system.

RDAP uses:

```text
HTTP
+
JSON
+
Standardized data structures
````

This makes RDAP significantly easier for software to consume compared with traditional WHOIS text output.

---

# 🎯 Why Was RDAP Created?

Traditional WHOIS has several problems:

* Output is primarily text-based
* Formatting varies between registries
* Different servers use different field names
* Automated parsing can be difficult
* Internationalization is inconsistent
* Authentication/authorization models are limited
* Referral behavior can be complicated

RDAP addresses many of these problems by using:

```text
HTTP
    ↓
JSON
    ↓
Structured registration data
```

Instead of:

```text
WHOIS
    ↓
Unstructured text
    ↓
Custom parsing
```

---

# 🔄 WHOIS vs RDAP

## WHOIS

```text
Client
  ↓
WHOIS Server
  ↓
Text Response
```

Example:

```text
Domain Name: example.com
Registrar: Example Registrar
Creation Date: ...
Name Server: ...
```

---

## RDAP

```text
Client
  ↓
HTTP Request
  ↓
RDAP Server
  ↓
JSON Response
```

Example conceptually:

```json
{
  "objectClassName": "domain",
  "ldhName": "example.com",
  "events": [],
  "nameservers": []
}
```

---

# 🆚 Comparison

| Feature              | WHOIS                     | RDAP          |
| -------------------- | ------------------------- | ------------- |
| Protocol style       | Traditional text protocol | HTTP          |
| Output               | Text                      | JSON          |
| Standardization      | Limited                   | Much stronger |
| Automation           | Difficult                 | Easier        |
| Machine-readable     | Poor                      | Excellent     |
| Internationalization | Limited                   | Better        |
| HTTP support         | No                        | Yes           |
| Structured entities  | No                        | Yes           |
| Modern replacement   | Legacy                    | Modern        |

---

# 📍 Where RDAP Fits in Cybersecurity

RDAP belongs under:

```text
security-tools/
└── reconnaissance/
    └── passive-reconnaissance/
        └── rdap/
            └── README.md
```

RDAP is primarily a:

> **Passive Reconnaissance / Registration Intelligence tool**

It can help security professionals understand:

```text
Domains
IP ranges
Networks
Registrars
Registries
Organizations
Nameservers
Registration dates
Network allocations
```

---

# 🕵️ Passive Reconnaissance

RDAP is particularly useful during passive reconnaissance.

A simplified methodology:

```text
                    RECONNAISSANCE
                          │
              ┌───────────┴───────────┐
              │                       │
           PASSIVE                  ACTIVE
              │                       │
       ┌──────┼──────┐          ┌─────┼─────┐
       │      │      │          │           │
     WHOIS   RDAP    DNS       Nmap      Gobuster
```

RDAP should generally be used before active probing.

---

# 🔎 What RDAP Can Tell You

Depending on the registry and available data, RDAP can provide:

### Domain information

```text
Domain name
Registrar
Registration events
Domain status
Nameservers
DNSSEC information
```

### IP information

```text
IP network
CIDR
Start address
End address
Organization
Country
Network events
Abuse contacts
```

### Entity information

```text
Organizations
Registrars
Contacts
Roles
```

---

# 🚫 What RDAP Cannot Tell You

RDAP is **not** a vulnerability scanner.

It will not normally tell you:

```text
Open ports
Running services
Web vulnerabilities
Passwords
Application vulnerabilities
Firewall configuration
Operating system
Installed software
```

For those activities, other tools are required.

For example:

```text
RDAP
 ↓
Registration intelligence

Nmap
 ↓
Network/service enumeration

Gobuster
 ↓
Web resource enumeration

Burp Suite
 ↓
Application security testing
```

---

# 🏗️ RDAP Architecture

A simplified architecture:

```text
                 Security Researcher
                         │
                         ▼
                    RDAP Client
                         │
                         ▼
                    HTTP Request
                         │
                         ▼
                  RDAP Server
                         │
                         ▼
                Registry / Database
                         │
                         ▼
                    JSON Response
```

---

# 🌍 RDAP Infrastructure

The Internet uses multiple registration authorities.

For domains, registry information is associated with TLDs.

For IP addresses and ASNs, Regional Internet Registries are important.

Examples include:

```text
ARIN
RIPE NCC
APNIC
LACNIC
AFRINIC
```

The appropriate RDAP server depends on the resource being investigated.

---

# 🌎 Regional Internet Registries

## ARIN

Primarily serves North America and parts of the Caribbean.

---

## RIPE NCC

Primarily serves Europe, the Middle East, and parts of Central Asia.

---

## APNIC

Primarily serves the Asia-Pacific region.

---

## AFRINIC

Serves Africa.

---

## LACNIC

Serves Latin America and the Caribbean.

---

# 🧩 RDAP Objects

RDAP represents different types of registration data as objects.

Important object types include:

```text
Domain
IP Network
Autonomous System
Entity
Nameserver
```

---

# 🌐 Domain Objects

A domain RDAP response represents a registered domain.

Conceptually:

```json
{
  "objectClassName": "domain",
  "ldhName": "example.com"
}
```

Important fields can include:

```text
ldhName
unicodeName
status
events
entities
nameservers
secureDNS
```

---

# 🔤 LDH Name

LDH stands for:

> Letters, Digits, Hyphen

An LDH domain name is the ASCII representation of a domain.

Example:

```text
example.com
```

RDAP may also provide a Unicode representation for internationalized domain names.

---

# 🌍 Internationalized Domain Names

Internationalized Domain Names can contain characters outside the traditional ASCII character set.

RDAP can represent:

```text
ASCII / A-label
+
Unicode / U-label
```

This is important when investigating internationalized domains.

---

# 📅 RDAP Events

Events describe important changes or lifecycle events.

Examples may include:

```text
registration
expiration
last changed
transfer
```

Conceptually:

```json
{
  "eventAction": "registration",
  "eventDate": "2020-01-01T00:00:00Z"
}
```

---

# 🧠 Why Events Matter

Events can help establish:

```text
When was a domain registered?
When was it updated?
When does it expire?
```

This can be useful in:

* Threat intelligence
* Incident response
* Domain monitoring
* Brand protection
* Asset management

---

# 🔐 Domain Status

RDAP can expose domain status values.

Examples include:

```text
clientTransferProhibited
serverTransferProhibited
clientUpdateProhibited
clientDeleteProhibited
```

Status values should be interpreted according to the registry/registrar context.

Do not automatically classify a status as a vulnerability.

---

# 🖥️ Nameservers

A domain response may contain nameservers.

Conceptually:

```json
{
  "nameservers": [
    {
      "ldhName": "ns1.example.net"
    }
  ]
}
```

Nameservers can provide infrastructure relationships.

---

# 🔗 Nameserver Relationships

Consider:

```text
example.com
      │
      ▼
ns1.example.net
      │
      ▼
DNS Infrastructure
```

You can investigate these relationships with:

```bash
dig NS example.com
```

---

# 🌐 IP Network Objects

RDAP can represent IP address allocations.

For example:

```text
203.0.113.0/24
```

The response can include information such as:

```text
Start Address
End Address
CIDR
Name
Country
Organization
Events
Entities
```

---

# 🧮 CIDR

Understanding CIDR is important.

Example:

```text
203.0.113.0/24
```

represents a network containing:

```text
203.0.113.0
through
203.0.113.255
```

Understanding CIDR helps interpret network allocations.

---

# 🔢 Autonomous System Numbers

An ASN identifies an autonomous system.

Example:

```text
AS64500
```

ASN information can help connect:

```text
IP
 ↓
Network
 ↓
ASN
 ↓
Organization
```

---

# 👥 Entities

RDAP has a structured entity model.

An entity may represent:

```text
Registrar
Registrant
Administrative contact
Technical contact
Organization
Abuse contact
```

An entity can have different roles.

For example:

```text
roles:
  registrar
```

or:

```text
roles:
  registrant
```

---

# 🎭 Entity Roles

Common roles can include:

```text
registrant
registrar
administrative
technical
abuse
billing
```

Not every role will be present.

Privacy protections may also hide information.

---

# 🔒 Privacy and Redaction

Modern registration systems frequently redact personal information.

You may see:

```text
REDACTED
```

or limited entity information.

This can happen because of:

```text
Privacy regulations
Registry policies
Registrar policies
Privacy services
Data protection requirements
```

Do not assume the absence of information means the entity does not exist.

---

# 📦 RDAP JSON

One of RDAP's biggest advantages is structured JSON.

Example:

```json
{
  "objectClassName": "domain",
  "ldhName": "example.com",
  "status": [
    "active"
  ]
}
```

This makes automation much easier.

---

# 🛠️ Prerequisites

You should understand:

* Linux command line
* HTTP
* JSON
* DNS
* Domains
* IP addresses
* CIDR
* ASN
* Basic Python

Helpful commands:

```bash
curl
jq
dig
host
nslookup
whois
```

---

# 📦 Tools Required

RDAP does not necessarily require a dedicated command-line tool.

You can use:

```text
curl
```

to make RDAP requests.

For JSON processing:

```text
jq
```

Install on Debian/Kali:

```bash
sudo apt update
sudo apt install curl jq
```

Verify:

```bash
curl --version
jq --version
```

---

# 🌐 Using curl

RDAP is accessed over HTTP/HTTPS.

The basic concept is:

```bash
curl RDAP_URL
```

For example:

```bash
curl https://rdap.example/...
```

The exact endpoint depends on the registry and resource.

---

# 🔎 Finding the Correct RDAP Server

Do not blindly assume that one RDAP server handles every domain or IP.

The correct server depends on the registration authority.

A common approach is:

```text
Resource
   ↓
Determine authoritative registry
   ↓
Determine RDAP service
   ↓
Query resource
```

For production tooling, use official RDAP bootstrap information rather than hardcoding assumptions.

---

# 🌐 Domain Lookup

The general workflow is:

```text
Domain
 ↓
Determine authoritative RDAP service
 ↓
Query domain endpoint
 ↓
Receive JSON
 ↓
Parse JSON
```

Conceptually:

```bash
curl "https://RDAP-SERVER/domain/example.com"
```

Replace:

```text
RDAP-SERVER
```

with the appropriate authoritative service.

---

# 📡 IP Lookup

Similarly:

```bash
curl "https://RDAP-SERVER/ip/8.8.8.8"
```

The exact server depends on the address allocation.

---

# 🌐 IPv6 Lookup

RDAP also supports IPv6 resources.

Example concept:

```bash
curl "https://RDAP-SERVER/ip/2001:db8::1"
```

IPv6 reconnaissance requires familiarity with:

```text
IPv6 notation
CIDR
Network allocation
Regional Internet Registries
```

---

# 🔢 ASN Lookup

RDAP services may expose ASN information.

Conceptually:

```bash
curl "https://RDAP-SERVER/autnum/AS64500"
```

Depending on the service, the path and representation can vary.

---

# 🖥️ Nameserver Investigation

You can investigate nameservers using DNS first:

```bash
dig NS example.com
```

Then investigate the associated domain/IP infrastructure through RDAP where applicable.

Example workflow:

```text
example.com
 ↓
NS record
 ↓
ns1.example.net
 ↓
DNS resolution
 ↓
IP
 ↓
RDAP
```

---

# 🧰 Using jq with RDAP

`jq` is extremely useful for RDAP.

Suppose:

```bash
curl "RDAP_URL" > response.json
```

Pretty-print:

```bash
jq . response.json
```

---

# 🔍 Extract Object Type

```bash
jq '.objectClassName' response.json
```

---

# 🔍 Extract Domain

```bash
jq '.ldhName' response.json
```

---

# 🔍 Extract Status

```bash
jq '.status' response.json
```

---

# 🔍 Extract Events

```bash
jq '.events' response.json
```

---

# 🔍 Extract Nameservers

```bash
jq '.nameservers' response.json
```

---

# 🔍 Extract Nameserver Names

Depending on the response structure:

```bash
jq '.nameservers[]?.ldhName' response.json
```

The `?` prevents errors when the field is missing.

---

# 🔍 Extract Entities

```bash
jq '.entities' response.json
```

---

# 🔍 Search Entire JSON

```bash
jq '.. | strings' response.json
```

This can be useful for exploratory analysis.

---

# 🐍 Python Automation

Python is particularly useful because RDAP returns JSON.

Basic example:

```python
import requests

url = "https://RDAP-SERVER/domain/example.com"

response = requests.get(url, timeout=10)

if response.ok:
    data = response.json()
    print(data)
else:
    print("Request failed:", response.status_code)
```

---

# 🧠 Extracting Basic Information

```python
import requests

url = "https://RDAP-SERVER/domain/example.com"

response = requests.get(url, timeout=10)
data = response.json()

print("Domain:", data.get("ldhName"))
print("Status:", data.get("status"))
print("Events:", data.get("events"))
```

---

# 📅 Extracting Events

```python
for event in data.get("events", []):
    print(
        event.get("eventAction"),
        event.get("eventDate")
    )
```

This can produce information such as:

```text
registration 2020-01-01T00:00:00Z
expiration   2027-01-01T00:00:00Z
```

---

# 🖥️ Extracting Nameservers

```python
for ns in data.get("nameservers", []):
    print(ns.get("ldhName"))
```

---

# 👥 Extracting Entities

```python
for entity in data.get("entities", []):
    print("Roles:", entity.get("roles"))
```

Remember:

> Entity data may be missing or redacted.

---

# 📦 Saving JSON

```bash
curl "RDAP_URL" -o rdap.json
```

Now you have:

```text
rdap.json
```

This can be stored with your reconnaissance evidence.

---

# 🔄 Bulk RDAP Queries

Suppose you have:

```text
domains.txt
```

containing:

```text
example.com
example.org
example.net
```

A basic shell workflow can process them.

However:

> Do not blindly send large numbers of requests.

Respect:

* Rate limits
* Registry policies
* Terms of service
* Network resources

---

# 🧠 Better Bulk Recon

For a professional workflow:

```text
Input
 ↓
Validate domain
 ↓
Determine RDAP authority
 ↓
Query
 ↓
Cache result
 ↓
Parse JSON
 ↓
Store result
 ↓
Generate report
```

---

# 🧪 Scenario 1: Domain Investigation

Objective:

> Gather passive registration information.

Workflow:

```text
Target Domain
      ↓
RDAP
      ↓
Registrar
      ↓
Registration Events
      ↓
Status
      ↓
Nameservers
      ↓
Entities
```

This creates the initial registration profile.

---

# 🧪 Scenario 2: Investigating a Suspicious Domain

Suppose you encounter:

```text
login-example-security.com
```

Perform passive analysis:

```text
RDAP
 ↓
Creation date
 ↓
Registrar
 ↓
Nameservers
 ↓
Status
```

Then correlate with:

```text
DNS
Certificate Transparency
Threat intelligence
Public reports
```

Do not conclude that a domain is malicious based solely on:

```text
Young domain
+
Privacy protection
```

Those characteristics are not sufficient evidence.

---

# 🧪 Scenario 3: Incident Response

Suppose a suspicious IP appears in logs:

```text
203.0.113.10
```

Query the appropriate RDAP service:

```text
IP
 ↓
RDAP
 ↓
Network allocation
 ↓
Organization
 ↓
Abuse contact
 ↓
ASN
```

This can help an incident responder understand the network context.

---

# 🧪 Scenario 4: Infrastructure Mapping

Start with:

```text
example.com
```

Then:

```text
RDAP
 ↓
Nameservers
 ↓
DNS
 ↓
IP
 ↓
RDAP
 ↓
Network
 ↓
ASN
```

You are building an infrastructure relationship map.

---

# 🧪 Scenario 5: ASN Investigation

Suppose an IP belongs to:

```text
AS64500
```

You can investigate the ASN.

Conceptually:

```text
ASN
 ↓
Organization
 ↓
Network prefixes
 ↓
IP ranges
 ↓
Domains / services
```

Be careful:

> ASN ownership does not mean every IP/service in that network is operated directly by the organization in the way you might assume.

Cloud and hosting providers commonly host many unrelated customers.

---

# 🧪 Scenario 6: Domain Lifecycle Investigation

Use RDAP events to examine:

```text
Registration
Update
Expiration
Transfer
```

This can help identify potentially relevant changes.

For example:

```text
Domain
 ↓
Registration event
 ↓
Historical context
 ↓
Recent update
 ↓
DNS changes
```

Correlate with other sources.

---

# 🧪 Scenario 7: Brand Monitoring

An organization can monitor newly registered domains resembling its brand.

Conceptually:

```text
Brand
 ↓
Potential look-alike domain
 ↓
RDAP
 ↓
Registration date
 ↓
Registrar
 ↓
Nameservers
 ↓
Threat intelligence
```

RDAP can provide registration context but does not itself prove malicious intent.

---

# 🧪 Scenario 8: Asset Inventory

Organizations can maintain a registration database:

```text
Domain
Registrar
Created
Updated
Expires
Nameservers
Status
```

This helps with:

* Domain lifecycle management
* Security monitoring
* Renewal tracking
* Brand protection
* Incident response

---

# 🔗 RDAP + WHOIS

WHOIS and RDAP complement each other.

Workflow:

```text
WHOIS
  +
RDAP
  ↓
Registration intelligence
```

WHOIS can be useful when:

* A legacy registry exposes useful information
* You need traditional WHOIS output
* A specific registrar still provides WHOIS information

RDAP is preferable for:

* Structured data
* Automation
* JSON processing
* Standardized workflows

---

# 🔗 RDAP + DNS

This is one of the most useful combinations.

```text
RDAP
 ↓
Nameserver
 ↓
DNS
 ↓
IP
 ↓
RDAP
```

Commands:

```bash
dig NS example.com
```

Then:

```bash
dig A example.com
```

Then investigate the resulting IP through the appropriate RDAP service.

---

# 🔗 RDAP + Nmap

RDAP:

```text
Passive
```

Nmap:

```text
Active
```

Workflow:

```text
RDAP
 ↓
Identify IP/network context
 ↓
Authorization check
 ↓
Nmap
 ↓
Port/service enumeration
```

Example:

```bash
nmap -sV AUTHORIZED_IP
```

Only perform active scanning against systems you are authorized to test.

---

# 🔗 RDAP + Gobuster

RDAP can provide the initial infrastructure context.

Gobuster can then perform authorized web enumeration.

Workflow:

```text
RDAP
 ↓
Domain
 ↓
DNS
 ↓
Web host
 ↓
Gobuster
 ↓
Web resource enumeration
```

These tools serve different purposes.

---

# 🔗 RDAP + Certificate Transparency

Certificate Transparency is valuable for discovering hostnames.

Conceptually:

```text
example.com
     ↓
Certificate Transparency
     ↓
www.example.com
api.example.com
dev.example.com
staging.example.com
```

Then:

```text
Hostname
 ↓
DNS
 ↓
IP
 ↓
RDAP
```

This creates an excellent passive-recon loop.

---

# 🔗 RDAP + ASN

A useful infrastructure chain:

```text
Domain
 ↓
DNS
 ↓
IP
 ↓
RDAP
 ↓
Network
 ↓
ASN
 ↓
Organization
```

This is useful for understanding Internet infrastructure ownership/allocation.

---

# 🧠 Complete Passive Recon Methodology

A mature passive-recon workflow could look like:

```text
                       TARGET
                         │
                         ▼
                       RDAP
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Domain      Events     Entities
              │
              ▼
         Nameservers
              │
              ▼
              DNS
              │
        ┌─────┼─────┐
        ▼     ▼     ▼
        A    MX    TXT
        │
        ▼
        IP
        │
        ▼
       RDAP
        │
        ▼
      Network
        │
        ▼
       ASN
        │
        ▼
   Organization
```

Additional passive sources:

```text
Certificate Transparency
Search engines
Public repositories
Public documentation
Threat intelligence
Historical DNS
```

---

# 🧠 Passive → Active Transition

After passive reconnaissance:

```text
Passive Recon
     ↓
Asset Identification
     ↓
Scope Validation
     ↓
Active Recon
     ↓
Enumeration
     ↓
Vulnerability Assessment
```

Do not skip the:

```text
Scope Validation
```

step.

---

# 🤖 Building an RDAP Recon Script

A more complete Python project could look like:

```text
rdap-recon/
│
├── main.py
├── rdap.py
├── parser.py
├── utils.py
├── requirements.txt
│
├── input/
│   └── domains.txt
│
├── output/
│   ├── raw/
│   └── reports/
│
└── README.md
```

---

# 🐍 Example Project Structure

```python
def query_rdap(url):
    pass

def parse_domain(data):
    pass

def extract_events(data):
    pass

def extract_nameservers(data):
    pass

def save_result(data):
    pass
```

A production implementation should also include:

```text
Timeouts
Retries
Rate limiting
Caching
Logging
Error handling
Input validation
```

---

# ⚠️ Error Handling

Possible HTTP responses include:

```text
200
400
401
403
404
429
500
503
```

Important:

### 404

The resource may not exist or may not be available through that service.

### 429

You may have exceeded a rate limit.

### 403

Access may be restricted.

### 5xx

The service may be experiencing an issue.

---

# 🚦 Rate Limits

Do not build reconnaissance scripts that continuously hammer RDAP services.

Bad:

```text
1000 requests
↓
Immediately
↓
No delay
↓
No caching
```

Better:

```text
Request
 ↓
Cache
 ↓
Wait when appropriate
 ↓
Retry carefully
```

---

# 💾 Caching

If you have already queried:

```text
example.com
```

there is usually no reason to repeatedly request the same information during the same investigation.

Store:

```text
rdap/example.com.json
```

Then reuse it.

---

# 🔐 Privacy Considerations

RDAP can contain personal or organizational registration information depending on the registry.

Do not:

* Collect unnecessary personal data
* Publish private information
* Attempt to bypass privacy protections
* Abuse registration services
* Use registration data for harassment

Use only the information necessary for legitimate security research.

---

# ⚠️ Common Mistakes

## Mistake 1: Assuming RDAP returns everything

It does not.

Privacy and registry policies limit information.

---

## Mistake 2: Treating RDAP as a scanner

RDAP does not scan ports.

---

## Mistake 3: Assuming the registrar owns the infrastructure

A registrar manages domain registration.

It does not necessarily operate the website or server.

---

## Mistake 4: Assuming IP ownership equals application ownership

Hosting providers frequently host customer infrastructure.

---

## Mistake 5: Treating a recent domain as malicious

A newly registered domain can be completely legitimate.

---

## Mistake 6: Ignoring the registry

Different resources can be handled by different registration authorities.

---

## Mistake 7: Hardcoding RDAP servers

RDAP service discovery matters.

For robust tooling, use standardized bootstrap information.

---

# 🛡️ Defensive Security

Security teams can use RDAP for:

### Domain monitoring

Monitor registration information.

### Incident response

Investigate suspicious domains/IPs.

### Asset management

Track domain ownership and expiration.

### Threat intelligence

Correlate suspicious infrastructure.

### Brand protection

Monitor look-alike domains.

### Infrastructure management

Understand IP allocations and network relationships.

---

# 📊 Security Asset Inventory

A useful internal database could contain:

| Asset          | Type    | Registrar/Org     | Created | Updated | Expires | Status    |
| -------------- | ------- | ----------------- | ------- | ------- | ------- | --------- |
| example.com    | Domain  | Example Registrar | 2020    | 2026    | 2027    | Active    |
| 203.0.113.0/24 | Network | Example ISP       | -       | -       | -       | Allocated |

---

# 🔍 Threat Intelligence Workflow

Suppose an indicator appears:

```text
Suspicious Domain
```

Perform:

```text
RDAP
 ↓
Registration information
 ↓
DNS
 ↓
IP
 ↓
IP RDAP
 ↓
ASN
 ↓
Threat intelligence
```

Then correlate:

```text
Domain
IP
ASN
Nameserver
Certificate
Registration date
```

The goal is **correlation**, not a single-point conclusion.

---

# 🚨 Incident Response Workflow

A practical IR workflow:

```text
Alert
 ↓
Indicator
 ↓
RDAP
 ↓
Registration context
 ↓
DNS
 ↓
IP
 ↓
ASN
 ↓
Historical intelligence
 ↓
Determine relevance
 ↓
Contain / Investigate
```

---

# 🧠 Domain Investigation Mindset

When looking at a domain, ask:

```text
When was it registered?

Who is the registrar?

What nameservers does it use?

What status does it have?

What registration events exist?

What IP does it resolve to?

Who is allocated that IP range?

What ASN is involved?

Are certificates associated with the domain?

What other public intelligence exists?
```

This mindset is more important than memorizing commands.

---

# 🗺️ Infrastructure Relationship Map

RDAP can contribute to a graph such as:

```text
                 Organization
                      │
                      ▼
                     ASN
                      │
                      ▼
                  IP Network
                      │
                      ▼
                     IP
                      │
                      ▼
                  Domain
                      │
             ┌────────┴────────┐
             ▼                 ▼
        Nameserver          Certificate
             │
             ▼
             DNS
```

This is how individual pieces of passive information become infrastructure intelligence.

---

# 🧪 Advanced Investigation Example

Suppose you start with:

```text
example.com
```

### Step 1: RDAP

```text
Domain
Registrar
Events
Nameservers
Status
```

### Step 2: DNS

```bash
dig A example.com
dig AAAA example.com
dig NS example.com
dig MX example.com
dig TXT example.com
```

### Step 3: IP RDAP

Investigate the resulting IP allocation.

### Step 4: ASN

Determine the relevant network/ASN context.

### Step 5: Certificate Transparency

Identify additional hostnames.

### Step 6: Correlation

Build:

```text
Domain
 ↓
Subdomains
 ↓
IPs
 ↓
Networks
 ↓
ASN
 ↓
Organizations
```

### Step 7: Active Testing

Only if explicitly authorized:

```text
Nmap
 ↓
Gobuster
 ↓
Burp Suite
```

---

# 🧠 RDAP in a Penetration Test

A professional penetration test might begin:

```text
Scope
 ↓
Passive Recon
 ↓
RDAP
 ↓
WHOIS
 ↓
DNS
 ↓
Certificate Transparency
 ↓
OSINT
 ↓
Asset Validation
 ↓
Active Recon
 ↓
Enumeration
 ↓
Vulnerability Assessment
```

RDAP is therefore an early-stage intelligence source.

---

# 📋 Professional RDAP Checklist

## Domain

* [ ] Domain identified
* [ ] RDAP server identified
* [ ] Registrar identified
* [ ] Registration event identified
* [ ] Update event identified
* [ ] Expiration event identified
* [ ] Status identified
* [ ] Nameservers identified
* [ ] Entities reviewed
* [ ] Privacy/redaction noted

## IP

* [ ] IP identified
* [ ] RDAP network identified
* [ ] CIDR identified
* [ ] Organization identified
* [ ] ASN investigated
* [ ] Abuse contact identified where available
* [ ] Network events reviewed

## Correlation

* [ ] DNS reviewed
* [ ] Certificate Transparency reviewed
* [ ] ASN relationships reviewed
* [ ] Public intelligence reviewed
* [ ] Findings documented

---

# 🧾 RDAP Cheat Sheet

## Query concept

```bash
curl "https://RDAP-SERVER/domain/example.com"
```

## IP

```bash
curl "https://RDAP-SERVER/ip/8.8.8.8"
```

## ASN

```bash
curl "https://RDAP-SERVER/autnum/AS64500"
```

## Save response

```bash
curl "RDAP_URL" -o rdap.json
```

## Pretty-print

```bash
jq . rdap.json
```

## Object type

```bash
jq '.objectClassName' rdap.json
```

## Domain

```bash
jq '.ldhName' rdap.json
```

## Status

```bash
jq '.status' rdap.json
```

## Events

```bash
jq '.events' rdap.json
```

## Nameservers

```bash
jq '.nameservers' rdap.json
```

## Entities

```bash
jq '.entities' rdap.json
```

---

# 🏆 RDAP Mastery Checklist

You have a strong understanding of RDAP when you can:

* [ ] Explain what RDAP means
* [ ] Explain why RDAP exists
* [ ] Explain WHOIS vs RDAP
* [ ] Explain passive reconnaissance
* [ ] Understand RDAP architecture
* [ ] Understand domain objects
* [ ] Understand IP network objects
* [ ] Understand ASN objects
* [ ] Understand entities
* [ ] Understand entity roles
* [ ] Understand events
* [ ] Understand nameservers
* [ ] Understand status codes
* [ ] Read RDAP JSON
* [ ] Use curl
* [ ] Use jq
* [ ] Query domain information
* [ ] Query IP information
* [ ] Understand IPv4 and IPv6
* [ ] Understand CIDR
* [ ] Understand ASN relationships
* [ ] Automate RDAP queries
* [ ] Handle errors
* [ ] Respect rate limits
* [ ] Use caching
* [ ] Correlate RDAP with DNS
* [ ] Correlate RDAP with WHOIS
* [ ] Correlate RDAP with Certificate Transparency
* [ ] Use RDAP during incident response
* [ ] Use RDAP during threat intelligence investigations
* [ ] Document findings professionally

---

# 🧭 Recommended Learning Path

If RDAP is part of your cybersecurity learning journey:

```text
Internet Fundamentals
        ↓
DNS
        ↓
WHOIS
        ↓
RDAP
        ↓
IP Addressing
        ↓
CIDR
        ↓
ASN
        ↓
BGP Fundamentals
        ↓
Certificate Transparency
        ↓
Passive Reconnaissance
        ↓
Nmap
        ↓
Gobuster
        ↓
Burp Suite
```

# 🧠 The Big Picture

RDAP should not be learned as merely:

```bash
curl "some-url"
```

Understand the relationship:

```text
                 INTERNET RESOURCE
                         │
            ┌────────────┴────────────┐
            │                         │
          DOMAIN                       IP
            │                         │
            ▼                         ▼
           RDAP                      RDAP
            │                         │
      Registration                Allocation
            │                         │
            ▼                         ▼
        Registrar                  Network
            │                         │
            └────────────┬────────────┘
                         ▼
                        ASN
                         │
                         ▼
                    Organization
```

Then correlate this with:

```text
DNS
 │
 ├── A
 ├── AAAA
 ├── MX
 ├── NS
 ├── TXT
 └── CNAME

Certificate Transparency
 │
 └── Hostnames

OSINT
 │
 └── Public intelligence
```

This is the foundation of passive infrastructure reconnaissance.

---

# 🏁 Final Takeaway

WHOIS introduced security professionals to registration data.

RDAP takes that concept further by providing:

```text
Structured
+
Standardized
+
HTTP-based
+
JSON-based
+
Machine-readable
```

registration data.

The most important skill is not memorizing RDAP URLs.

It is learning how to **correlate registration information with other passive intelligence sources**.

A mature workflow looks like:

```text
                     TARGET
                       │
                       ▼
                    WHOIS
                       │
                       ▼
                     RDAP
                       │
                       ▼
                      DNS
                       │
              ┌────────┴────────┐
              ▼                 ▼
             IP                NS
              │
              ▼
             RDAP
              │
              ▼
             ASN
              │
              ▼
         Organization
              │
              ▼
Certificate Transparency
              │
              ▼
        Public OSINT
              │
              ▼
      Asset Understanding
              │
              ▼
      Scope Verification
              │
              ▼
       Active Recon
              │
              ▼
         Enumeration
```

> **RDAP gives you structured registration intelligence. DNS gives you relationships. IP intelligence gives you network context. ASN data gives you allocation context. Together, they form a powerful passive reconnaissance foundation.**

---

# ⚠️ Legal Disclaimer

RDAP is a legitimate Internet registration-data protocol.

However, the information obtained through RDAP should be used responsibly.

Only perform subsequent active reconnaissance or security testing against:

* Systems you own
* Applications you own
* Authorized penetration-testing targets
* CTF/lab environments
* Systems where you have explicit permission

Respect:

* Scope
* Privacy
* Rate limits
* Registry policies
* Terms of service
* Applicable laws and regulations

Passive reconnaissance does not automatically authorize active testing.

---