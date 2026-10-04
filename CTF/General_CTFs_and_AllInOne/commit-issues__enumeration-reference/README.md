# 🔍 enumeration-reference

> Most people scan, see open ports, and freeze. This reference tells you exactly what to do next: from your first gobuster run to advanced API fuzzing and OSINT. This is the reference you keep open during every CTF and engagement: web, DNS, SMB, SNMP, and the advanced techniques most people don't know exist. Noob to practitioner, one repo. 🔍 Part of the SudoCode Pentesting Methodology Guide by SudoChef.

![Documentation](https://img.shields.io/badge/Documentation-Complete-C9667A?style=flat-square)
![CTF Ready](https://img.shields.io/badge/CTF-Ready-7ABFB0?style=flat-square)
![Kali Linux](https://img.shields.io/badge/Kali_Linux-Ready-9B8EC4?style=flat-square)
![No Code](https://img.shields.io/badge/Docs_Only-No_Code-2B2D3A?style=flat-square)

---

## 🧭 Navigation

- [What is Enumeration?](#-what-is-enumeration)
- [Where it fits in the workflow](#-where-it-fits-in-the-workflow)
- [Web Enumeration](#-web-enumeration)
- [DNS Enumeration](#-dns-enumeration)
- [SMB Enumeration](#-smb-enumeration)
- [Other Services](#-other-services)
- [Wordlists](#-wordlists)
- [Advanced Techniques](#-advanced-techniques)
- [CTF Workflow & Checklist](#-ctf-workflow--checklist)
- [Full Reference Index](#-full-reference-index)

---

## 🔍 What is Enumeration?

**Enumeration is the process of actively pulling information from a target to build a complete picture of what's there, how it's configured, and where the weaknesses are.**

It's not just finding open ports. It's interrogating every service behind those ports, mapping out network structure, identifying software versions, finding hidden directories, discovering subdomains, and piecing together everything that could lead to access.

If scanning is scoping a building for unlocked doors and windows: enumeration is what happens after you find them. You walk through every accessible room. You try every desk drawer. You check the filing cabinets. You look in the medicine cabinet. You're looking for attack surfaces: the places where something is exposed, misconfigured, outdated, or just left open by accident.

> 📖 Full explanation with workflow diagrams and category breakdowns → [what-is-enumeration/intro.md](what-is-enumeration/intro.md)

---

## 🔄 Where it fits in the workflow
```
Reconnaissance (passive: OSINT, no target contact)
        ↓
Scanning (active: nmap, find open ports)
        ↓
Enumeration (active: interrogate every open port and service)  ← YOU ARE HERE
        ↓
Vulnerability Identification
        ↓
Exploitation
        ↓
Post-Exploitation & Pillaging
```

New to nmap and scanning? Start with the **nmap-reference** repo first:
https://github.com/commit-issues/nmap-reference

---

## 🌐 Web Enumeration

Web servers are the most common attack surface in CTF and real engagements. When you find port 80 or 443: this is your starting point.

**The core concept:** Web servers host files and folders. Some are public. Many are hidden but still accessible if you know to ask. Directory busting sends thousands of requests: one per guess, and reports what actually exists.

| Topic | What's covered |
|---|---|
| [Understanding HTTP Response Codes](web-enumeration/directories.md) | 200, 301, 302, 403, 404: what each means and what to do |
| [Directory & File Enumeration](web-enumeration/directories.md) | What directory busting is, common paths worth finding, what to do when you find something |
| [gobuster](web-enumeration/gobuster.md) | The CTF standard: dir, dns, and vhost modes, all flags, wordlists, install all 3 OS |
| [feroxbuster](web-enumeration/feroxbuster.md) | Recursive scanning: finds nested directories gobuster misses |
| [ffuf](web-enumeration/ffuf.md) | The fuzzer: directories, subdomains, vhosts, parameters, POST bodies |

---

## 🌍 DNS Enumeration

DNS is the internet's phone book, and it's full of information companies didn't mean to expose. Subdomains, mail servers, internal hostnames, and infrastructure details are all hiding in DNS records.

**The core concept:** Every subdomain is a potential attack surface. Dev environments, admin panels, staging servers: all running different software with different security postures. DNS enumeration finds them.

| Topic | What's covered |
|---|---|
| [DNS Basics & Record Types](dns-enumeration/basics.md) | What DNS is, A/AAAA/CNAME/MX/TXT/NS records explained, why DNS leaks so much |
| [Domains vs Subdomains vs Vhosts](what-is-enumeration/domains-vs-subdomains.md) | The difference, why subdomains are gold, how to add hosts to /etc/hosts |
| [DNS Tools](dns-enumeration/tools.md) | dig, dnsrecon, amass, fierce, dnsx: install all 3 OS, commands, docs |
| [Zone Transfers](dns-enumeration/zone-transfers.md) | What they are, why they're critical findings, how to attempt one |

---

## 🖥️ SMB Enumeration

SMB has the longest history of critical vulnerabilities of any common service. When you see ports 139 or 445: stop everything and enumerate it properly.

**The core concept:** SMB is Windows file sharing. It exposes shares, usernames, password policies, and OS versions: often without credentials. EternalBlue (MS17-010) still shows up on unpatched systems.

| Topic | What's covered |
|---|---|
| [SMB Enumeration](smb-enumeration/basics.md) | What SMB is, enum4linux-ng, netexec, smbclient, crackmapexec: full workflow |

---

## 🔌 Other Services

Every open port is a potential attack vector. These services are frequently misconfigured and consistently underenumerated.

| Service | Port | What's covered |
|---|---|---|
| [FTP](other-services/ftp.md) | 21 | Anonymous login, file download, vsftpd backdoor, nmap scripts |
| [SSH](other-services/ssh.md) | 22 | Version detection, key files, username enumeration, default creds |
| [SMTP](other-services/smtp.md) | 25 | User enumeration via VRFY/RCPT/EXPN, open relay testing |
| [SNMP](other-services/snmp.md) | 161 UDP | Community strings, snmpwalk, OID queries, credential exposure |

> ⚠️ **SNMP runs on UDP**: nmap's default scan misses it. Always run `nmap -sU -p 161 <target>` separately.

---

## 📚 Wordlists

Your tools are only as good as the wordlists you feed them. Using the wrong list means missing findings that were always there.

| Topic | What's covered |
|---|---|
| [Wordlists Complete Guide](wordlists/wordlists.md) | SecLists install all 3 OS, best lists by scenario, security warning on sources, John the Ripper Jumbo, CeWL custom wordlists |

**Quick reference: most used lists:**

| Scenario | List |
|---|---|
| Directory busting | `Discovery/Web-Content/raft-medium-directories.txt` |
| Subdomains | `Discovery/DNS/subdomains-top1million-5000.txt` |
| Password cracking | `rockyou.txt` |
| Parameter fuzzing | `Discovery/Web-Content/burp-parameter-names.txt` |

---

## 🔬 Advanced Techniques

This is where enumeration separates beginners from practitioners. These techniques find what automated tools miss: hidden APIs, forgotten endpoints, leaked credentials, and infrastructure that was never meant to be public.

| Topic | What's covered |
|---|---|
| [API Enumeration](advanced/api-enumeration.md) | What APIs are, finding hidden endpoints, Swagger/GraphQL, JWT attacks, modern API security |
| [Parameter Fuzzing](advanced/parameter-fuzzing.md) | Hidden parameters, ffuf fuzzing, Arjun, SQLi/LFI/SSRF/IDOR testing |
| [Advanced Content Discovery](advanced/content-discovery-advanced.md) | Wayback Machine, Google dorking, certificate transparency logs, JS file analysis, exposed .git |
| [Virtual Host Fuzzing](advanced/vhost-fuzzing.md) | What vhosts are, why DNS misses them, gobuster vhost, ffuf Host header fuzzing |
| [Automation & Chaining](advanced/automation-and-chaining.md) | Chaining tools together, full enumeration script, httpx, feeding tool output into the next tool |
| [OSINT for Enumeration](advanced/osint-for-enumeration.md) | Shodan, Censys, WHOIS/ASN, LinkedIn recon, GitHub dorking, theHarvester |

---

## ✅ CTF Workflow & Checklist

| Topic | What's covered |
|---|---|
| [CTF Enumeration Checklist](ctf-workflow/checklist.md) | Step by step checklist: fast scan to full enumeration, service-specific checks, stuck decision tree |
| [What To Do After Enumeration](what-next/after-enumeration.md) | Finding by finding: what each result means and your next action, prioritization table |

---

## 📁 Full Reference Index

### 🧠 What is Enumeration
| File | What's inside |
|---|---|
| [Introduction to Enumeration](what-is-enumeration/intro.md) | Plain English definition, building analogy, passive vs active, the 4 types of enumeration |
| [Domains, Subdomains & Virtual Hosts](what-is-enumeration/domains-vs-subdomains.md) | The difference, why subdomains are gold, /etc/hosts explained fully |

### 🌐 Web Enumeration
| File | What's inside |
|---|---|
| [Directory & File Enumeration](web-enumeration/directories.md) | HTTP codes, common paths, what to do when you find something |
| [gobuster](web-enumeration/gobuster.md) | dir/dns/vhost modes, all flags, wordlists, CTF vs pro |
| [feroxbuster](web-enumeration/feroxbuster.md) | Recursive scanning, flags, when to use over gobuster |
| [ffuf](web-enumeration/ffuf.md) | Fuzzing explained, all modes, filtering, parameter fuzzing |

### 🌍 DNS Enumeration
| File | What's inside |
|---|---|
| [DNS Basics](dns-enumeration/basics.md) | Record types, why DNS leaks infrastructure, dig and nslookup |
| [DNS Tools](dns-enumeration/tools.md) | dig, dnsrecon, amass, fierce, dnsx: full install and commands |
| [Zone Transfers](dns-enumeration/zone-transfers.md) | What they are, how to attempt, what to do when it works |

### 🖥️ SMB Enumeration
| File | What's inside |
|---|---|
| [SMB Basics & Tools](smb-enumeration/basics.md) | What SMB is, enum4linux-ng, netexec, smbclient, crackmapexec |

### 🔌 Other Services
| File | What's inside |
|---|---|
| [FTP](other-services/ftp.md) | Anonymous login, file transfer, vsftpd backdoor |
| [SSH](other-services/ssh.md) | Version detection, key files, user enumeration |
| [SMTP](other-services/smtp.md) | User enumeration, open relay testing, response codes |
| [SNMP](other-services/snmp.md) | Community strings, snmpwalk, OID reference, credential exposure |

### 📚 Wordlists
| File | What's inside |
|---|---|
| [Wordlists Complete Guide](wordlists/wordlists.md) | SecLists, John the Ripper Jumbo, CeWL, security warning |

### 🔬 Advanced
| File | What's inside |
|---|---|
| [API Enumeration](advanced/api-enumeration.md) | APIs explained, finding hidden endpoints, GraphQL, JWT |
| [Parameter Fuzzing](advanced/parameter-fuzzing.md) | Hidden parameters, Arjun, vulnerability testing |
| [Advanced Content Discovery](advanced/content-discovery-advanced.md) | Wayback Machine, crt.sh, JS analysis, exposed .git |
| [Virtual Host Fuzzing](advanced/vhost-fuzzing.md) | Vhosts vs subdomains, gobuster vhost, ffuf Host header |
| [Automation & Chaining](advanced/automation-and-chaining.md) | Tool chaining, full enumeration script, httpx |
| [OSINT for Enumeration](advanced/osint-for-enumeration.md) | Shodan, Censys, WHOIS, LinkedIn, GitHub dorking |

### ✅ CTF Workflow
| File | What's inside |
|---|---|
| [CTF Enumeration Checklist](ctf-workflow/checklist.md) | Step by step checklist, decision tree for when you're stuck |
| [What To Do After Enumeration](what-next/after-enumeration.md) | Post-enumeration actions, prioritization table, teaser to methodology guide |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*