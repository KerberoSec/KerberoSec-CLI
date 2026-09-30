# 🌐 DNS Enumeration: The Basics

DNS stands for Domain Name System. Before you can enumerate subdomains, understand zone transfers, or use any DNS tool effectively: you need to understand what DNS actually is and why it leaks so much useful information.

---

## 🧠 What is DNS: Plain English

DNS is the internet's phone book.

When you type `google.com` into your browser, your computer doesn't actually know where that is. It asks a DNS server: "hey, what's the IP address for google.com?" The DNS server looks it up and responds with something like `142.250.80.46`. Your browser then connects to that IP address.

Without DNS, you'd have to memorize IP addresses for every website you visit. DNS translates human-readable names into machine-readable addresses.

**Why this matters for enumeration:** DNS records contain a map of a company's entire internet infrastructure. Mail servers, web servers, internal hostnames, third-party services: all of it is stored in DNS records. And a lot of it is publicly queryable.

---

## 📋 DNS Record Types That Matter

Not all DNS records are created equal. These are the ones you'll encounter and actually care about:

| Record Type | What it does | Why it matters |
|---|---|---|
| `A` | Maps a hostname to an IPv4 address | Primary record: tells you the IP of a host |
| `AAAA` | Maps a hostname to an IPv6 address | Same as A but for IPv6 |
| `CNAME` | Canonical Name: alias pointing to another hostname | Reveals internal hostnames and third-party services |
| `MX` | Mail Exchange: where email is routed | Reveals email provider and mail server infrastructure |
| `TXT` | Text record: stores arbitrary text | Often contains SPF records, verification tokens, and sometimes sensitive info |
| `NS` | Name Server: which servers handle DNS for this domain | Critical for zone transfer attempts |
| `PTR` | Reverse lookup: IP address to hostname | Useful for mapping IP ranges back to hostnames |
| `SOA` | Start of Authority: administrative info about the zone | Contains primary nameserver and admin email |
| `SRV` | Service record: location of specific services | Reveals internal services like VoIP, LDAP, and more |

---

## 🔍 Why DNS Enumeration Reveals So Much

Companies don't always think carefully about what their DNS records expose. Here's what you commonly find:

**Subdomains that reveal infrastructure:**
```
mail.company.com        → they use their own mail server
vpn.company.com         → VPN portal: login page
dev.company.com         → development environment: often less secure
staging.company.com     → staging server: often running older software
jenkins.company.com     → CI/CD server: often exposed
gitlab.company.com      → internal git server
jira.company.com        → project management: username enumeration
```

**TXT records that reveal technology stack:**
```
v=spf1 include:sendgrid.net     → they use SendGrid for email
v=spf1 include:google.com       → they use Google Workspace
MS=ms12345678                   → Microsoft 365 tenant verification
```

**CNAME records that reveal third-party services:**
```
assets.company.com → company.s3.amazonaws.com    → AWS S3 bucket
cdn.company.com → company.cloudfront.net          → CloudFront CDN
help.company.com → company.zendesk.com            → Zendesk support
```

Each of these is a potential attack surface: a third-party service that might be misconfigured, a subdomain running old software, or an internal tool accidentally exposed.

---

## 🛠️ Basic DNS Queries: dig & nslookup

Before using advanced tools, know how to query DNS manually. These commands are available on all platforms.

### dig (Linux/macOS: most powerful)
```bash
# Basic A record lookup
dig example.com

# Specific record type
dig example.com MX
dig example.com TXT
dig example.com NS
dig example.com AAAA

# Short output: just the answer
dig example.com +short

# Query a specific DNS server
dig @8.8.8.8 example.com

# Reverse lookup: IP to hostname
dig -x 10.10.10.1
```

### nslookup (Windows/macOS/Linux: beginner friendly)
```bash
# Basic lookup
nslookup example.com

# Specific record type
nslookup -type=MX example.com
nslookup -type=TXT example.com
nslookup -type=NS example.com

# Query a specific DNS server
nslookup example.com 8.8.8.8

# Reverse lookup
nslookup 10.10.10.1
```

---

## 📊 What to Look For in DNS Output

When you run a DNS query, here's how to read what comes back:
```bash
$ dig example.com

;; ANSWER SECTION:
example.com.    300    IN    A    93.184.216.34
```

- `example.com.`: the hostname queried
- `300`: TTL (Time to Live) in seconds: how long this record is cached
- `IN`: Internet class (always IN for normal DNS)
- `A`: record type
- `93.184.216.34`: the actual answer: the IP address

Low TTL values (under 300) sometimes indicate active infrastructure changes: worth noting.

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*