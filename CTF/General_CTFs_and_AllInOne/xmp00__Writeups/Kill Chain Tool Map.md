## Kill Chain Tool Map

---

## Legal Disclaimer

This document is produced for educational purposes and authorized security testing only.
All tools, techniques, and methods described herein are to be used exclusively on:
systems you own, systems for which you have explicit written authorization, and
authorized training platforms including Hack The Box, TryHackMe, and VulnHub.

Unauthorized use against systems you do not own or have permission to test is illegal
under the Computer Fraud and Abuse Act (USA), Computer Misuse Act (UK), and equivalent
legislation in all jurisdictions. The author assumes no liability for misuse.

Always obtain written authorization before testing.

---

## TABLE OF CONTENTS

    KILL CHAIN
      Stage 1   Reconnaissance
      Stage 2   Initial Access
      Stage 3   Exploitation
        3.1     Web Application
        3.2     Network Services
        3.3     Active Directory
        3.4     Linux
        3.5     Windows
        3.6     Binary Exploitation
      Stage 4   Post-Exploitation
      Stage 5   Lateral Movement
      Stage 6   Privilege Escalation
        6.1     Linux
        6.2     Windows
        6.3     Active Directory
      Stage 7   Persistence
      Stage 8   Defense Evasion & AV/EDR Bypass
      Stage 9   Exfiltration

    SUPPLEMENTARY DOMAINS
      A   Mobile (Android / iOS)
      B   Cloud (AWS / Azure / GCP)
      C   Containers & Kubernetes
      D   Wireless
      E   Hardware & IoT
      F   Thick Client Applications
      G   ICS / SCADA / OT
      H   Blockchain / Web3
      I   VoIP & Telecommunications

    CTF CHALLENGE CATEGORIES
      J   Forensics
      K   Cryptography
      L   Steganography
      M   Reverse Engineering
      N   Binary Exploitation (Pwn)
      O   Web Challenges
      P   OSINT Challenges
      Q   Miscellaneous

    REFERENCE
        Wordlists, payloads, community, platforms

---

## COLUMN GUIDE

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|

- Status:   Active / Deprecated / Superseded
- Kali:     Yes = apt install  |  Manual = clone/build required
- Platform: Linux / Windows / Both / Browser
- Alt:      Drop-in replacement or fallback when primary is detected or unavailable

---

# STAGE 1: RECONNAISSANCE

    INPUT:  Target scope: domain, IP range, organization name
    OUTPUT: Subdomains, open ports, services, tech stack, leaked credentials,
            employee names, email formats, cloud assets, full attack surface map

## 1.1 Passive DNS & Subdomain Enumeration

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Amass](https://github.com/owasp-amass/amass) | Subdomain enum via DNS, cert transparency, scraping | Most comprehensive passive + active subdomain collection in one tool | Active | Manual | Linux | Subfinder |
| [Subfinder](https://github.com/projectdiscovery/subfinder) | Passive subdomain discovery via 50+ APIs | Fastest passive-only subdomain tool; no active probing: stealth-first | Active | Manual | Linux | Amass |
| [Assetfinder](https://github.com/tomnomnom/assetfinder) | Subdomain discovery via cert logs and web | Single binary, fast, minimal output: good first pass | Active | Manual | Linux | Subfinder |
| [DNSRecon](https://github.com/darkoperator/dnsrecon) | DNS enumeration, zone transfers, brute-force | Best for zone transfer testing and comprehensive DNS record pulls | Active | Yes | Linux | DNSEnum |
| [DNSEnum](https://www.kali.org/tools/dnsenum/) | DNS enumeration, zone transfers, Google scraping | Automates zone transfer and Google subdomain scraping in one command | Active | Yes | Linux | DNSRecon |
| [Fierce](https://www.kali.org/tools/fierce/) | DNS recon, subdomain brute-force | Locates non-contiguous IP space; good for large org recon | Active | Yes | Linux | DNSRecon |
| [MassDNS](https://github.com/blechschmidt/massdns) | High-performance DNS resolution | Resolves millions of subdomains per minute; use after wordlist generation | Active | Manual | Linux | DNSx |
| [DNSx](https://github.com/projectdiscovery/dnsx) | DNS toolkit: resolve, brute-force, wildcard filter | Integrates natively with Subfinder and Amass output via pipes | Active | Manual | Linux | MassDNS |
| [crt.sh](https://crt.sh/) | Certificate transparency log search | Reveals subdomains from historical SSL certs including expired | Active | N/A | Browser | Censys |
| [Haktrails](https://github.com/hakluke/haktrails) | SecurityTrails API wrapper | Pulls historical DNS: finds subdomains that no longer resolve but existed | Active | Manual | Linux | crt.sh |

## 1.2 Internet-Wide Search Engines

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Shodan](https://www.shodan.io/) | Internet device index: banners, ports, services, vulns | Indexes raw service banners; finds exposed industrial systems, cameras, databases | Active | No | Browser/CLI | Censys |
| [Censys](https://censys.io/) | TLS certificate and host scanning index | Better for certificate analysis and precise service fingerprinting than Shodan | Active | No | Browser/CLI | Shodan |
| [Fofa](https://fofa.info/) | Chinese internet-wide asset search | Better coverage of Asian infrastructure; different index from Shodan | Active | No | Browser | Shodan |
| [ZoomEye](https://www.zoomeye.org/) | Cyberspace search engine | Good secondary source when Shodan quota exhausted | Active | No | Browser | Shodan |
| [GreyNoise](https://www.greynoise.io/) | Internet background noise classification | Distinguishes mass-scanner noise from targeted traffic | Active | No | Browser/API | Shodan |
| [LeakIX](https://leakix.net/) | Exposed services and indexed data leaks | Finds actively leaking services: exposed Redis, MongoDB, Elasticsearch with data | Active | No | Browser | Shodan |
| [FullHunt](https://fullhunt.io/) | Attack surface discovery | Domain-centric org-wide exposure mapping | Active | No | Browser | Shodan |
| [BinaryEdge](https://www.binaryedge.io/) | Internet scanning and threat intel | More frequent scanning than Shodan; better for time-sensitive recon | Active | No | Browser/API | Shodan |
| [IVRE](https://ivre.rocks/) | Self-hosted network recon framework | Run your own scan history without external API limits | Active | Manual | Linux | Shodan |

## 1.3 WHOIS, IP & ASN Intelligence

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Whois](https://www.kali.org/tools/whois/) | Domain registration data | Reveals registrant, nameservers, org; historical via ViewDNS | Active | Yes | Linux | Browser |
| [BGP.he.net](https://bgp.he.net/) | ASN, IP range, BGP routing data | Maps entire IP ranges owned by org via ASN lookup | Active | No | Browser | BGPView |
| [BGPView](https://bgpview.io/) | ASN routing, IP prefix, peer data | API-accessible; better for scripting IP range enumeration | Active | No | Browser/API | BGP.he.net |
| [ipinfo.io](https://ipinfo.io/) | IP geolocation, ASN, hostname | Fast IP enrichment; API usable in scripts for bulk lookups | Active | No | Browser/API | ipinfo |
| [SecurityTrails](https://securitytrails.com/) | Historical DNS, WHOIS, IP history | Best for finding old IPs, nameserver changes, historical subdomains | Active | No | Browser/API | Haktrails |

## 1.4 Google Dorking

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [GHDB (Exploit-DB)](https://www.exploit-db.com/google-hacking-database) | Pre-built dorks for exposed files, admin panels, cameras | 7,000+ dorks; community-maintained; searchable by category | Active | No | Browser | Manual dorks |
| [DorkSearch](https://dorksearch.com/) | Pre-built dork execution interface | Executes dorks without manual construction; faster enumeration | Active | No | Browser | GHDB |

## 1.5 Email & Employee OSINT

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [theHarvester](https://github.com/laramies/theHarvester) | Emails, subdomains, IPs, names from 30+ sources | Supports Shodan, HunterIO, Bing, LinkedIn scraping built-in | Active | Yes | Linux | SpiderFoot |
| [Hunter.io](https://hunter.io/) | Corporate email format discovery | Reveals email format and validates real addresses | Active | No | Browser/API | theHarvester |
| [PhoneBook.cz](https://phonebook.cz/) | Email, domain, URL intel database | Large breach-correlated email intelligence; free tier | Active | No | Browser | Intelligence X |
| [Intelligence X](https://intelx.io/) | Dark web, breach data, Tor, Telegram search | Indexes Tor sites, pastebins, dark web; unique data not on HIBP | Active | No | Browser | PhoneBook.cz |

## 1.6 OSINT Frameworks & Aggregators

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [SpiderFoot](https://github.com/smicallef/spiderfoot) | Automated OSINT: 200+ modules across all data types | Self-hosted; linked entity graph output; best all-in-one passive automation | Active | Manual | Linux | Maltego |
| [Recon-ng](https://github.com/lanmaster53/recon-ng) | Modular web recon framework (Metasploit-style) | Module marketplace; API key management; scriptable | Active | Yes | Linux | SpiderFoot |
| [Maltego](https://www.maltego.com/) | Visual link analysis with API transforms | Best for visualizing entity relationships; not for automation | Active | Yes (CE) | Both | SpiderFoot |
| [OSINT Framework](https://osintframework.com/) | Categorized OSINT tool directory | Browser-based directory; starting point for manual investigation | Active | No | Browser | N/A |
| [Datasploit](https://github.com/DataSploit/datasploit) | Multi-target OSINT: person, company, phone, domain | Correlates data across sources for single target automatically | Active | Manual | Linux | SpiderFoot |
| [Photon](https://github.com/s0md3v/Photon) | Web crawler for OSINT: emails, social, endpoints, keys | Extracts OSINT from a website's own content; finds tokens in source | Active | Manual | Linux | Katana |

## 1.7 Username & Identity OSINT

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Sherlock](https://github.com/sherlock-project/sherlock) | Username across 400+ platforms | Fastest username enumeration tool; async checks | Active | Manual | Linux | Maigret |
| [Maigret](https://github.com/soxoj/maigret) | Username across 3,000+ sites with profile aggregation | More sites than Sherlock; adds account details not just existence | Active | Manual | Linux | Sherlock |
| [Holehe](https://github.com/megadose/holehe) | Email to account registration check across platforms | Checks if email is registered without needing password reset | Active | Manual | Linux | Sherlock |
| [GHunt](https://github.com/mxrch/GHunt) | Google account investigation: Maps, Calendar, Drive exposure | Extracts data from Google accounts via public API without credentials | Active | Manual | Linux | Manual OSINT |
| [WhatsMyName](https://github.com/WebBreacher/WhatsMyName) | Username enumeration dataset used by Maigret and SpiderFoot | Underlying dataset for multiple tools; useful to check raw data | Active | Manual | Linux | Sherlock |

## 1.8 Secret & Credential Leak Discovery

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Trufflehog](https://github.com/trufflesecurity/trufflehog) | Secrets in git repos, S3, filesystems, CI/CD | Verifies secrets are live (not just detected); covers 700+ credential types | Active | Manual | Linux | GitLeaks |
| [GitLeaks](https://github.com/gitleaks/gitleaks) | Hardcoded secrets in git history | Faster than Trufflehog on large repos; SARIF output for pipelines | Active | Manual | Linux | Trufflehog |
| [Gitrob](https://github.com/michenriksen/gitrob) | Sensitive file discovery across GitHub org repos | Maps entire org repos for exposed files: keys, config, backups | Active | Manual | Linux | Trufflehog |
| [Git-Hound](https://github.com/tillson/git-hound) | GitHub code search for secrets using dorks | Uses GitHub search API; finds secrets in public code without cloning | Active | Manual | Linux | Trufflehog |
| [Have I Been Pwned](https://haveibeenpwned.com/) | Email breach check | Fast check if target emails appear in known breach datasets | Active | No | Browser/API | Intelligence X |

## 1.9 Cloud Asset Discovery

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [CloudEnum](https://github.com/initstring/cloud_enum) | AWS S3, Azure Blob, GCP Storage enumeration | Checks all three major providers simultaneously from one command | Active | Manual | Linux | S3Scanner |
| [S3Scanner](https://github.com/sa7mon/S3Scanner) | Open S3 bucket discovery and content listing | Fastest dedicated S3 scanner; lists contents of open buckets | Active | Manual | Linux | CloudEnum |
| [GCPBucketBrute](https://github.com/RhinoSecurityLabs/GCPBucketBrute) | GCS bucket enumeration | GCP-specific; checks bucket existence and permissions | Active | Manual | Linux | CloudEnum |

## 1.10 Active Web Enumeration

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Gobuster](https://github.com/OJ/gobuster) | Directory, file, vhost, DNS brute-force | Fastest standard directory brute-forcer; supports multiple modes | Active | Yes | Linux | Feroxbuster |
| [Feroxbuster](https://github.com/epi052/feroxbuster) | Recursive directory discovery | Recursively follows discovered paths automatically; better for deep trees | Active | Yes | Linux | Gobuster |
| [FFuf](https://github.com/ffuf/ffuf) | Full-featured web fuzzer: dir, vhost, param, header | Most flexible fuzzer; use for parameter discovery and vhost fuzzing | Active | Yes | Linux | Gobuster |
| [Dirsearch](https://github.com/maurosoria/dirsearch) | Web path scanner with auto-extension testing | Automatically appends extensions per language: php, asp, jsp | Active | Yes | Linux | Feroxbuster |
| [Wfuzz](https://www.kali.org/tools/wfuzz/) | Web fuzzer with filter and match expressions | Strongest filtering options; use when precise response-code filtering needed | Active | Yes | Linux | FFuf |
| [Katana](https://github.com/projectdiscovery/katana) | Next-gen web crawler: JS parsing, headless, API-aware | Crawls SPAs and JavaScript-heavy apps that Gobuster misses | Active | Manual | Linux | Hakrawler |
| [Hakrawler](https://github.com/hakluke/hakrawler) | Fast endpoint extraction: links, forms, JS | Pipes directly from httpx output; quick and minimal | Active | Manual | Linux | Katana |
| [GAU](https://github.com/lc/gau) | Fetch known URLs from Wayback, OTX, CommonCrawl | Retrieves historical URLs without active scanning; stealthy | Active | Manual | Linux | Waybackurls |
| [Waybackurls](https://github.com/tomnomnom/waybackurls) | Historical URL extraction from Wayback Machine | Simplest way to get all historical endpoints for a domain | Active | Manual | Linux | GAU |
| [ParamSpider](https://github.com/devanshbatham/ParamSpider) | Parameter discovery from web archives | Finds GET/POST parameters from Wayback data without touching target | Active | Manual | Linux | Arjun |
| [Arjun](https://github.com/s0md3v/Arjun) | HTTP parameter discovery via brute-force | Actively fuzzes endpoints for hidden parameters; covers GET/POST/JSON/XML | Active | Manual | Linux | ParamSpider |
| [Httpx](https://github.com/projectdiscovery/httpx) | HTTP probing: status, tech, title, content-type | Fast HTTP probe for large subdomain lists; fingerprints at scale | Active | Manual | Linux | Nmap HTTP scripts |
| [Nuclei](https://github.com/projectdiscovery/nuclei) | Template-based vulnerability scanner | Community templates for CVEs, misconfigs, exposed panels | Active | Manual | Linux | Nikto |
| [Nikto](https://www.kali.org/tools/nikto/) | Web server misconfiguration scanner | Quick default-credential and known-file checks; noisy but thorough | Active | Yes | Linux | Nuclei |
| [Whatweb](https://www.kali.org/tools/whatweb/) | Web technology fingerprinting | Identifies CMS, framework, server, analytics from HTTP responses | Active | Yes | Linux | Wappalyzer CLI |

## 1.11 Network Scanning

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Nmap](https://nmap.org/) | Port scan, service version, OS detect, NSE scripts | The standard; NSE library covers hundreds of service-specific checks | Active | Yes | Both | Masscan + manual |
| [Masscan](https://github.com/robertdavidgraham/masscan) | TCP SYN scan at Internet scale | Fastest port scanner; scans 10M ports/second; use for large ranges then hand to Nmap | Active | Yes | Linux | RustScan |
| [RustScan](https://github.com/RustScan/RustScan) | Fast port scan that pipes directly to Nmap | Finds open ports in seconds then automatically runs Nmap on results | Active | Manual | Linux | Masscan |
| [Naabu](https://github.com/projectdiscovery/naabu) | Fast port scanner with Nmap integration | Better for integration with ProjectDiscovery toolchain | Active | Manual | Linux | RustScan |
| [Autorecon](https://github.com/Tib3rius/AutoRecon) | Automated multi-service enumeration orchestrator | Runs Nmap plus all relevant service enumeration tools automatically; HTB essential | Active | Manual | Linux | Manual enumeration |

---

# STAGE 2: INITIAL ACCESS

    INPUT:  Attack surface map, identified services, technology stack, employee data
    OUTPUT: Foothold shell, valid credentials, authenticated session, phishing callback

## 2.1 Phishing & Social Engineering Infrastructure

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [GoPhish](https://github.com/gophish/gophish) | Phishing campaign management, email tracking, landing pages | Best open-source phishing platform; detailed per-victim tracking dashboard | Active | Manual | Linux | King Phisher |
| [Evilginx3](https://github.com/kgretzky/evilginx2) | Reverse proxy phishing with MFA bypass via session cookie theft | Captures session tokens post-authentication; bypasses TOTP and push MFA entirely | Active | Manual | Linux | Modlishka |
| [EvilGoPhish](https://github.com/fin3ss3g0d/evilgophish) | GoPhish + Evilginx2 combined with SMS campaign support | Combines email tracking from GoPhish with MFA bypass from Evilginx | Active | Manual | Linux | Separate tools |
| [Modlishka](https://github.com/drk1wi/Modlishka) | Reverse proxy phishing framework | More flexible than Evilginx for custom phishlet creation | Active | Manual | Linux | Evilginx3 |
| [Muraena](https://github.com/muraenateam/muraena) | Automated reverse proxy phishing and credential harvest | Designed for automation; integrates with GoPhish natively | Active | Manual | Linux | Evilginx3 |
| [SET](https://github.com/trustedsec/social-engineer-toolkit) | Full social engineering: phishing, credential harvest, payloads | All-in-one framework; HTA, web clone, SMS, and more attack vectors | Active | Yes | Linux | GoPhish |
| [King Phisher](https://github.com/rsmusllp/king-phisher) | Full phishing campaign toolkit with geo-tracking | More feature-rich reporting than GoPhish; server-client architecture | Active | Manual | Linux | GoPhish |
| [dnstwist](https://github.com/elceef/dnstwist) | Domain typosquatting and lookalike domain generation | Generates all typosquat variants; supports IDN homoglyph attacks | Active | Yes | Linux | URLCrazy |
| [Swaks](https://github.com/jetmore/swaks) | SMTP testing and email spoofing | Tests email deliverability; verifies phishing infrastructure before campaigns | Active | Yes | Linux | Telnet |

## 2.2 Payload Generation & Weaponization

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [MSFvenom](https://www.kali.org/tools/metasploit-framework/) | Payload generation: shellcode, exe, dll, script formats | Wide format support; stageless and staged; baseline tool: heavily signatured | Active | Yes | Linux | Donut |
| [Donut](https://github.com/TheWover/donut) | Converts .NET assemblies, EXE, DLL to position-independent shellcode | Enables in-memory execution of .NET tools from C2; avoids disk writes | Active | Manual | Linux | GadgetToJScript |
| [GadgetToJScript](https://github.com/med0x2e/GadgetToJScript) | .NET deserialization gadgets in JS, VBS, HTA | Delivers shellcode via scripting hosts; useful for macro-free phishing | Active | Manual | Linux | Donut |
| [Sharpshooter](https://github.com/mdsecactivebreach/SharpShooter) | Payload generation for JS, VBS, HTA, macro delivery | Stage-0 payload specialist; sandbox detection and COM staging built-in | Active | Manual | Linux | MSFvenom |
| [ScareCrow](https://github.com/optiv/ScareCrow) | EDR-evading shellcode loader: signed containers, side-loading | Creates signed payloads that mimic legitimate Windows tools | Active | Manual | Linux | Freeze |
| [Freeze](https://github.com/Tylous/Freeze) | Shellcode loader: sleep obfuscation + direct syscalls + encryption | Combines multiple evasion layers in one tool; Go-based for low baseline detection | Active | Manual | Linux | ScareCrow |
| [Nimcrypt2](https://github.com/icyguider/Nimcrypt2) | Shellcode encryption and loader in Nim | Nim produces low AV-detection executables; good for initial access | Active | Manual | Linux | OffensiveNim |
| [Villain](https://github.com/t3l3machus/Villain) | Backdoor generator and multi-session handler | Manages multiple reverse shells with built-in obfuscation | Active | Manual | Linux | MSFvenom handler |
| [Hoaxshell](https://github.com/t3l3machus/hoaxshell) | HTTP/HTTPS reverse shell using non-standard request patterns | Abuses HTTP protocol to create beacon-like shell; good AV evasion | Active | Manual | Linux | MSFvenom |

## 2.3 Exploitation Frameworks

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Metasploit Framework](https://www.metasploit.com/) | Exploit execution, payload staging, post-exploitation modules | Largest public exploit library; msfconsole is the standard platform | Active | Yes | Linux | Manual exploits |
| [SearchSploit](https://www.exploit-db.com/searchsploit) | Offline search of Exploit-DB | Searches local copy of Exploit-DB without internet; use on restricted networks | Active | Yes | Linux | Exploit-DB browser |
| [Exploit-DB](https://www.exploit-db.com/) | Public exploit archive with PoC code | Primary source for CVE PoC code; searchable by CVE, platform, type | Active | No | Browser | Packetstorm |

## 2.4 Password Spraying & Credential Attacks

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Kerbrute](https://github.com/ropnop/kerbrute) | AD username enumeration and Kerberos password spray | Does not trigger traditional logon failure events; stealthy for AD spraying | Active | Manual | Linux | CrackMapExec |
| [Hydra](https://www.kali.org/tools/hydra/) | Online brute-force: SSH, FTP, HTTP, SMB, RDP, many more | Widest protocol support; parallel attacks | Active | Yes | Linux | Medusa |
| [Medusa](https://www.kali.org/tools/medusa/) | Parallel network login brute-force | More stable than Hydra on some protocols; supports resumable sessions | Active | Yes | Linux | Hydra |
| [Spray](https://github.com/Greenwolf/Spray) | Password spraying with lockout avoidance | Automatically pauses between sprays to respect lockout policy thresholds | Active | Manual | Linux | Kerbrute |
| [NetExec](https://github.com/Pennyw0rth/NetExec) | SMB, WinRM, LDAP, SSH, MSSQL credential validation at scale | Supersedes CrackMapExec; active development; validates credentials across subnets | Active | Manual | Linux | CrackMapExec |
| [Crowbar](https://github.com/galkan/crowbar) | RDP, VNC, SSH brute-force with key support | Only tool that brute-forces RDP reliably; supports certificate authentication | Active | Manual | Linux | Hydra |
| [BruteSpray](https://github.com/x90skysn3k/brutespray) | Auto-brutes services from Nmap XML output | Takes nmap XML directly; removes manual step of extracting services for Hydra | Active | Yes | Linux | Hydra |

---

# STAGE 3: EXPLOITATION

    INPUT:  Open services, web application, identified vulnerabilities, valid credentials
    OUTPUT: Remote code execution, file read, authentication bypass, shell access

## 3.1 Web Application Exploitation

### Core Proxies

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Burp Suite Pro](https://portswigger.net/burp/pro) | Full web application testing platform | Industry standard; Repeater, Intruder, Scanner, Collaborator: nothing replaces it | Active | Yes (CE) | Both | OWASP ZAP |
| [OWASP ZAP](https://www.zaproxy.org/) | Web proxy and active scanner | Free alternative; better automated scanning than Burp CE | Active | Yes | Both | Burp Suite CE |
| [Caido](https://caido.io/) | Modern web proxy with workflow automation | Newer architecture; faster for scripted workflows; growing plugin ecosystem | Active | No | Both | Burp Suite |
| [mitmproxy](https://mitmproxy.org/) | Interactive CLI and Python-scriptable HTTPS proxy | Best for scripted interception; write Python to modify requests automatically | Active | Yes | Linux | Burp Suite |

### SQL Injection

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [SQLmap](https://sqlmap.org/) | Automated SQL injection detection and exploitation | Handles all injection types; DB takeover, file read/write, OS shell | Active | Yes | Linux | Manual |
| [NoSQLMap](https://github.com/codingo/NoSQLMap) | NoSQL injection: MongoDB, CouchDB, Redis, Cassandra | Only tool specifically built for NoSQL injection enumeration | Active | Manual | Linux | Manual |
| [SQLNinja](https://www.kali.org/tools/sqlninja/) | MS SQL Server exploitation via SQL injection | MSSQL-specific; xp_cmdshell, privilege escalation, OS access | Active | Yes | Linux | SQLmap |

### Cross-Site Scripting (XSS)

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [XSStrike](https://github.com/s0md3v/XSStrike) | XSS detection with context analysis and WAF bypass | Understands injection context; generates context-aware bypass payloads | Active | Manual | Linux | Dalfox |
| [Dalfox](https://github.com/hahwul/dalfox) | Fast XSS scanner with parameter analysis | Faster than XSStrike; better for bulk scanning; blind XSS support | Active | Manual | Linux | XSStrike |
| [BeEF](https://github.com/beefproject/beef) | Browser exploitation framework via XSS hook | Post-exploitation after XSS: controls victim browsers, extracts credentials | Active | Yes | Linux | XSSHunter |
| [XSSHunter](https://xsshunter.com/) | Blind XSS payload delivery and callback tracking | Self-hosted blind XSS infrastructure; better for long-term engagements | Active | No | Web service | Interactsh |

### Server-Side Request Forgery (SSRF)

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Gopherus](https://github.com/tarunkant/Gopherus) | Gopher protocol SSRF payload generator | Generates SSRF payloads to exploit Redis, FastCGI, SMTP, MySQL internally | Active | Manual | Linux | Manual |
| [Interactsh](https://github.com/projectdiscovery/interactsh) | Out-of-band interaction server: DNS, HTTP, SMTP callbacks | Self-hosted alternative to Burp Collaborator; no subscription required | Active | Manual | Linux | Burp Collaborator |

### Server-Side Template Injection (SSTI)

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Tplmap](https://github.com/epinna/tplmap) | SSTI detection and exploitation across 15+ engines | Automatically identifies engine (Jinja2, Twig, Freemarker) and exploits | Active | Manual | Linux | SSTImap |
| [SSTImap](https://github.com/vladko312/SSTImap) | Improved SSTI exploitation framework | More active development than Tplmap; more engine coverage | Active | Manual | Linux | Tplmap |

### XML External Entity (XXE)

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [XXEinjector](https://github.com/enjoiz/XXEinjector) | Automated XXE injection and file exfiltration | Automates blind XXE via OOB techniques; supports error-based extraction | Active | Manual | Linux | Manual + Burp |
| [oxml_xxe](https://github.com/BuffaloWill/oxml_xxe) | XXE in Office and PDF file formats | Embeds XXE payloads in DOCX, XLSX, PPTX for file upload attack vectors | Active | Manual | Linux | Manual |

### Deserialization

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [ysoserial](https://github.com/frohoff/ysoserial) | Java deserialization gadget chain payloads | Generates payloads for Java frameworks: Commons, Spring, Hibernate | Active | Manual | Linux (Java) | Manual gadgets |
| [ysoserial.net](https://github.com/pwntester/ysoserial.net) | .NET deserialization payloads | .NET equivalent; covers BinaryFormatter, JSON.NET, ViewState | Active | Manual | Windows | Manual |
| [Marshalsec](https://github.com/mbechler/marshalsec) | Java deserialization via marshalling frameworks | Targets XStream, Jackson, Fastjson specifically | Active | Manual | Linux | ysoserial |
| [PHPGGC](https://github.com/ambionics/phpggc) | PHP deserialization gadget chains | PHP-specific; works with Laravel, Symfony, Monolog | Active | Manual | Linux | Manual |

### JWT & Authentication

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [JWT_Tool](https://github.com/ticarpi/jwt_tool) | JWT testing: algorithm confusion, none-alg, brute-force | Tests all JWT attack vectors; also cracks weak secrets | Active | Manual | Linux | Manual + Burp JWT ext |
| [JWT-Cracker](https://github.com/lmammino/jwt-cracker) | JWT secret brute-force | Faster than JWT_Tool for dedicated HS256 secret cracking | Active | Manual | Linux | Hashcat mode 16500 |

### GraphQL

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [GraphQLmap](https://github.com/swisskyrepo/GraphQLmap) | GraphQL injection, introspection, IDOR | Exploits introspection to map schema then fuzzes for injections | Active | Manual | Linux | InQL |
| [InQL](https://github.com/doyensec/inql) | GraphQL security testing within Burp Suite | Integrates into Burp; generates Intruder wordlists from schema | Active | Manual | Both | GraphQLmap |
| [Clairvoyance](https://github.com/nikitastupin/clairvoyance) | GraphQL schema recovery when introspection disabled | Recovers field names via differential error analysis | Active | Manual | Linux | Manual |
| [BatchQL](https://github.com/nicowillis/batchql) | GraphQL batching attack tester | Tests batch query abuse for brute-force bypass and DoS | Active | Manual | Linux | Manual |

### File Upload Attacks

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Fuxploider](https://github.com/almandin/fuxploider) | File upload vulnerability detection and exploitation | Tests extension filtering, content-type bypass, double extension | Active | Manual | Linux | Manual |
| [Upload_Bypass](https://github.com/sAjibuu/Upload_Bypass) | Automated file upload restriction bypass | Comprehensive bypass testing: MIME, extension, magic bytes, polyglots | Active | Manual | Linux | Fuxploider |

### API Testing

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Postman](https://www.postman.com/) | API interaction, manual testing, collection management | Best GUI for API workflow testing; import OpenAPI specs directly | Active | No | Both | Insomnia |
| [Insomnia](https://insomnia.rest/) | REST and GraphQL client | Cleaner interface than Postman; better for GraphQL specifically | Active | No | Both | Postman |
| [Kiterunner](https://github.com/assetnote/kiterunner) | API route discovery using real API route wordlists | Uses actual API routes from public APIs; far better than Gobuster for APIs | Active | Manual | Linux | Gobuster |
| [Restler](https://github.com/microsoft/restler-fuzzer) | Stateful REST API fuzzing | Intelligently chains API calls; finds logic flaws from OpenAPI specs | Active | Manual | Linux | Manual |

### CMS-Specific

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [WPScan](https://github.com/wpscanteam/wpscan) | WordPress vulnerability scanner | Plugin, theme, user enumeration; CVE-correlated findings | Active | Yes | Linux | Nuclei WP templates |
| [CMSmap](https://github.com/dionach/CMSmap) | Multi-CMS scanner: WordPress, Joomla, Drupal, Moodle | Single tool covers four major CMS platforms | Active | Manual | Linux | WPScan |
| [Droopescan](https://github.com/SamJoan/droopescan) | Drupal, SilverStripe, WordPress scanner | Best for Drupal version and module enumeration | Active | Manual | Linux | CMSmap |
| [Joomscan](https://www.kali.org/tools/joomscan/) | Joomla vulnerability scanner | OWASP-maintained; Joomla-specific component enumeration | Active | Yes | Linux | CMSmap |

## 3.2 Network Service Exploitation

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Metasploit Framework](https://www.metasploit.com/) | Exploit modules for network services, staged payloads | Largest collection of network service exploits; auxiliary modules for everything | Active | Yes | Linux | Manual PoC |
| [Impacket](https://github.com/fortra/impacket) | Python library: SMB, LDAP, Kerberos, MSSQL, DCE/RPC | Core toolkit for every AD/Windows engagement; 15+ attack scripts included | Active | Yes | Linux | Manual |
| [Responder](https://github.com/lgandx/Responder) | LLMNR, NBT-NS, MDNS poisoning; credential capture | Captures NTLMv1/v2 hashes from network; enable HTTP/SMB servers for relay | Active | Yes | Linux | Inveigh (Windows) |
| [mitm6](https://github.com/dirkjanm/mitm6) | IPv6 DNS takeover for WPAD and NTLM relay | Exploits default Windows IPv6 preference; pairs with ntlmrelayx for SYSTEM | Active | Manual | Linux | Responder |
| [ntlmrelayx](https://github.com/fortra/impacket) | NTLM relay to SMB, LDAP, MSSQL, HTTP | Part of Impacket; relays captured hashes to gain authenticated access | Active | Yes | Linux | MultiRelay |
| [Bettercap](https://github.com/bettercap/bettercap) | Network MITM: ARP, DNS, HTTPS, BLE, WiFi | Unified MITM framework; scripting support; replaces ettercap for modern networks | Active | Yes | Linux | Ettercap |
| [Coercer](https://github.com/p0dalirius/Coercer) | Forces Windows auth via 12 methods: SpoolSS, PetitPotam | Tests all known coercion techniques systematically; pairs with ntlmrelayx | Active | Manual | Linux | PetitPotam |
| [PetitPotam](https://github.com/topotam/PetitPotam) | LSARPC/EFS-based authentication coercion | Reliable DC coercion for NTLM relay plus ADCS ESC8 attack chain | Active | Manual | Linux | Coercer |
| [PrintNightmare CVE-2021-1675](https://github.com/cube0x0/CVE-2021-1675) | Print Spooler RCE and LPE | Remote code execution as SYSTEM on unpatched Windows | Active | Manual | Linux | Metasploit module |
| [EternalBlue MS17-010](https://github.com/3ndG4me/AutoBlue-MS17-010) | SMBv1 RCE | Pre-patched Windows; still appears on HTB older machines | Active | Manual | Linux | Metasploit eternalblue |

## 3.3 Active Directory Exploitation

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [BloodHound](https://github.com/BloodHoundAD/BloodHound) | AD attack path visualization via graph analysis | Maps shortest path to DA; essential for every AD engagement | Active | Manual | Both | Adalanche |
| [BloodHound CE](https://github.com/SpecterOps/BloodHound) | BloodHound Community Edition: modernized backend | Replaces legacy BloodHound; improved UI, new attack edges | Active | Manual | Both | BloodHound legacy |
| [SharpHound](https://github.com/BloodHoundAD/SharpHound) | C# BloodHound data collector | Runs on Windows domain-joined host; most complete collection | Active | Manual | Windows | BloodHound.py |
| [BloodHound.py](https://github.com/dirkjanm/BloodHound.py) | Python BloodHound collector: remote, no Windows needed | Runs from Linux attacker machine with domain credentials | Active | Manual | Linux | SharpHound |
| [PowerView](https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1) | AD enumeration via PowerShell | Granular LDAP queries; ACL enumeration; domain trust mapping | Active | Manual | Windows | PowerView.py |
| [PowerView.py](https://github.com/aniqfakhrul/powerview.py) | Python port of PowerView | Same functionality as PowerView but runs from Linux | Active | Manual | Linux | PowerView |
| [Rubeus](https://github.com/GhostPack/Rubeus) | Kerberos attack toolkit: roasting, PTT, overpass-the-hash | Most complete Kerberos exploitation tool available publicly | Active | Manual | Windows | Impacket Kerberos |
| [Certipy](https://github.com/ly4k/Certipy) | ADCS enumeration and exploitation: ESC1-ESC13 | Python-based; runs from Linux; discovers and exploits certificate template misconfigs | Active | Manual | Linux | Certify |
| [Certify](https://github.com/GhostPack/Certify) | ADCS C# enumeration and exploitation | Windows-based; used when Certipy is blocked by EDR | Active | Manual | Windows | Certipy |
| [LDAPdomaindump](https://github.com/dirkjanm/ldapdomaindump) | LDAP AD data extraction to HTML, JSON, grep-friendly format | Quick first-pass AD enumeration; readable output for manual review | Active | Yes | Linux | PowerView.py |
| [PingCastle](https://www.pingcastle.com/) | AD security posture audit and risk scoring | Produces detailed security report; identifies misconfigs beyond BloodHound paths | Active | Manual | Windows | Purple Knight |
| [Adalanche](https://github.com/lkarlslund/Adalanche) | AD attack path analysis with more edge types than BloodHound | Includes Azure and Entra ID paths; faster collection in some environments | Active | Manual | Both | BloodHound |
| [BloodyAD](https://github.com/CravateRouge/bloodyAD) | AD attribute manipulation from Linux | Modifies ACLs, adds users to groups, sets attributes without Windows tools | Active | Manual | Linux | PowerView.py |
| [NetExec](https://github.com/Pennyw0rth/NetExec) | SMB, WinRM, LDAP, SSH, MSSQL lateral movement and enumeration | Active replacement for CrackMapExec; use this over CME for all new work | Active | Manual | Linux | CrackMapExec |
| [CrackMapExec](https://github.com/byt3bl33d3r/CrackMapExec) | Network-wide credential testing and AD enumeration | Superseded by NetExec; use NetExec instead | Superseded | Yes | Linux | NetExec |
| [Evil-WinRM](https://github.com/Hackplayers/evil-winrm) | WinRM interactive shell for Windows targets | Full-featured shell; file upload/download; PowerShell modules; AMSI bypass | Active | Yes | Linux | NetExec WinRM |
| [Mimikatz](https://github.com/gentilkiwi/mimikatz) | Credential extraction: LSASS, DPAPI, Kerberos tickets | Core credential tool; heavily signatured: must obfuscate or use forks | Active | Manual | Windows | Nanodump |
| [Snaffler](https://github.com/SnaffCon/Snaffler) | SMB share crawler for credentials and sensitive data | Automatically prioritizes interesting files: passwords, keys, configs | Active | Manual | Windows | PowerHuntShares |
| [noPac](https://github.com/cube0x0/noPac) | CVE-2021-42278/42287: Sam Account Name spoofing to DA | One of the most reliable DA escalation paths on unpatched DCs | Active | Manual | Linux | Metasploit noPac |
| [impacket-secretsdump](https://github.com/fortra/impacket) | Remote SAM and NTDS dump without LSASS | Extracts all domain hashes remotely if admin credentials available | Active | Yes | Linux | NetExec --ntds |
| [pywhisker](https://github.com/ShutdownRepo/pywhisker) | Shadow credentials attack: msDS-KeyCredentialLink | Python-based shadow credential manipulation; no Windows needed | Active | Manual | Linux | Whisker (C#) |
| [Kerbrute](https://github.com/ropnop/kerbrute) | Kerberos user enumeration and password spray | No LDAP bind required; does not generate traditional logon failures | Active | Manual | Linux | Rubeus (Windows) |

### ADCS: ESC Misconfiguration Matrix

| ESC | Misconfiguration | Requirement | Tool |
|-----|-----------------|-------------|------|
| ESC1 | Template allows SAN specification + any user enrollment | Enrollee Supplies Subject = True | Certipy req -upn administrator@domain |
| ESC2 | Any-purpose EKU or no EKU + any user enrollment | Any Purpose EKU | Certipy |
| ESC3 | Certificate Request Agent EKU: enroll on behalf of another | Request Agent template + second template | Certipy with -on-behalf-of |
| ESC4 | Writable certificate template ACL | Write access to template | Certipy template -save-old |
| ESC5 | Writable PKI object ACLs | Write access to CA or template container | Certipy / Manual LDAP |
| ESC6 | EDITF_ATTRIBUTESUBJECTALTNAME2 flag on CA | CA flag enabled + enrollment rights | Certipy |
| ESC7 | Manage CA or Manage Certificates rights | CA officer access | Certipy ca -enable-template |
| ESC8 | HTTP enrollment endpoint: NTLM relay to AD CS | AD CS web enrollment + relay position | Certipy + ntlmrelayx |
| ESC9 | No security extension on certificate template | CT_FLAG_NO_SECURITY_EXTENSION + GenericWrite | Certipy shadow + modify UPN |
| ESC10 | Weak certificate mapping on DC | DC trust misconfiguration | Certipy |
| ESC11 | NTLM relay to RPC-based CA endpoint | Relay position + no EPA | Certipy |
| ESC13 | OID group link: groups inherited via certificate | Issuance policy with group link | Certipy |

## 3.4 Linux Exploitation

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [GTFOBins](https://gtfobins.github.io/) | SUID, sudo, capability, cron binary abuse reference | Definitive reference for binary abuse; covers 300+ binaries | Active | No | Browser | LOLBAS (Windows) |
| [Linux Exploit Suggester 2](https://github.com/jondonas/linux-exploit-suggester-2) | Kernel exploit recommendations from uname output | Cross-references kernel version against known LPE CVEs | Active | Manual | Linux | LinPEAS suggestions |
| [DirtyPipe CVE-2022-0847](https://github.com/AlexisAhmed/CVE-2022-0847-DirtyPipe-Exploits) | Linux kernel 5.8-5.16 arbitrary file write | Overwrites SUID binaries or /etc/passwd; most reliable modern kernel LPE | Active | Manual | Linux | PwnKit |
| [PwnKit CVE-2021-4034](https://github.com/ly4k/PwnKit) | Polkit pkexec LPE affecting all Linux distros | Works on default installs without any configuration; extremely reliable | Active | Manual | Linux | DirtyPipe |

## 3.5 Windows Exploitation

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [SharpUp](https://github.com/GhostPack/SharpUp) | Windows privilege escalation enumeration in C# | Runs in memory via execute-assembly; avoids PowerShell logging | Active | Manual | Windows | PowerUp |
| [PowerUp](https://github.com/PowerShellMafia/PowerSploit/blob/master/Privesc/PowerUp.ps1) | PowerShell PrivEsc: service misconfigs, DLL hijacking | Auto-exploits found issues: unquoted service paths, weak permissions | Active | Manual | Windows | SharpUp |
| [Watson](https://github.com/rasta-mouse/Watson) | Missing patch enumeration for LPE CVEs | Checks specific CVE patch status; more targeted than generic suggester | Active | Manual | Windows | WinPEAS |
| [Nishang](https://github.com/samratashok/nishang) | PowerShell offensive scripts collection | Complete offensive PS library: shells, keyloggers, persistence, exfil | Active | Yes | Windows | PowerSploit |

## 3.6 Binary Exploitation

### Disassemblers & Decompilers

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Ghidra](https://ghidra-sre.org/) | Full reverse engineering suite: disassembly, decompilation, scripting | NSA-developed; free; decompiler covers x86, ARM, MIPS, PowerPC | Active | Yes | Both | IDA Free |
| [IDA Pro / IDA Free](https://hex-rays.com/ida-free/) | Industry-standard disassembler and debugger | Best decompiler output; Hex-Rays plugin ecosystem; IDA Free covers x86/x64 | Active | Yes (Free) | Both | Ghidra |
| [Binary Ninja](https://binary.ninja/) | Modern disassembler with Python API | Better for automated analysis scripting; cloud version available | Active | No | Both | Ghidra |
| [Radare2](https://rada.re/n/) | CLI-based disassembler, debugger, binary analysis | Fully scriptable; runs headless; use when GUI is unavailable | Active | Yes | Linux | Ghidra |
| [Cutter](https://cutter.re/) | GUI frontend for Radare2 | Makes Radare2 accessible without CLI complexity | Active | Manual | Both | Ghidra |
| [Decompiler Explorer](https://dogbolt.org/) | Browser-based multi-decompiler comparison | Runs Ghidra, Hex-Rays, Binary Ninja, RetDec simultaneously | Active | No | Browser | Individual tools |

### Debuggers

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [GDB](https://www.gnu.org/software/gdb/) | GNU debugger for Linux binaries | Base debugger for Linux exploit development; extend with pwndbg or GEF | Active | Yes | Linux | LLDB |
| [pwndbg](https://github.com/pwndbg/pwndbg) | GDB plugin for exploit development | Best GDB extension: heap visualization, telescope, context display | Active | Manual | Linux | GEF |
| [GEF](https://github.com/hugsy/gef) | GDB Enhanced Features plugin | Lighter than pwndbg; better for embedded and ARM debugging | Active | Manual | Linux | pwndbg |
| [PEDA](https://github.com/longld/peda) | Python Exploit Development Assistance for GDB | Classic plugin; less maintained than pwndbg but still works | Active | Manual | Linux | pwndbg |
| [x64dbg](https://x64dbg.com/) | Windows x64 and x32 debugger | Standard Windows debugger for malware analysis and exploit dev | Active | No | Windows | WinDbg |
| [WinDbg](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/) | Microsoft kernel and user-mode debugger | Required for kernel exploit development on Windows | Active | No | Windows | x64dbg |

### Exploit Development Tools

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Pwntools](https://github.com/Gallopsled/pwntools) | Python exploit development framework | Essential for CTF pwn; handles connections, packing, ROP, shellcode | Active | Yes | Linux | Manual scripting |
| [ROPgadget](https://github.com/JonathanSalwan/ROPgadget) | ROP chain gadget finder in binaries | Finds all gadgets in binary and libc; generates automatic ROP chains | Active | Yes | Linux | Ropper |
| [Ropper](https://github.com/sashs/Ropper) | ROP, JOP, SOP chain construction tool | Better interactive interface than ROPgadget; semantic gadget search | Active | Manual | Linux | ROPgadget |
| [One_gadget](https://github.com/david942j/one_gadget) | Find execve one-shot gadgets in libc | Finds gadgets that give shell with one call; essential for heap pwn | Active | Manual | Linux | ROPgadget |
| [checksec](https://github.com/slimm609/checksec.sh) | Binary security mitigation checker | First thing to run on any binary; determines exploitation approach | Active | Yes | Linux | pwntools checksec |
| [Angr](https://angr.io/) | Symbolic execution and automated exploit generation | Finds vulnerability paths automatically in complex binaries | Active | Manual | Linux | Manual analysis |
| [libc-database](https://github.com/niklasb/libc-database) | Find libc version from leaked function addresses | Matches leaked addresses to known libc versions for ret2libc | Active | Manual | Linux | libs.lol |
| [Patchelf](https://github.com/NixOS/patchelf) | Patch ELF to use specific libc version | Set RPATH to use challenge-provided libc; essential for local testing | Active | Manual | Linux | Manual |

### Binary Mitigations Reference

| Mitigation | Common Bypass |
|-----------|---------------|
| NX / DEP | ROP chains: ret2libc, ret2plt, SROP |
| ASLR | Info leak + calculate base; partial overwrite |
| Stack Canary | Format string leak; bruteforce on fork servers |
| PIE | Info leak to find base; partial overwrite last byte |
| Full RELRO | Cannot overwrite GOT; use other write targets |
| Partial RELRO | GOT overwrite still possible |

### Fuzzing

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [AFL++](https://github.com/AFLplusplus/AFLplusplus) | Coverage-guided binary fuzzer | State of the art; QEMU mode for non-instrumented binaries | Active | Manual | Linux | Libfuzzer |
| [Libfuzzer](https://llvm.org/docs/LibFuzzer.html) | In-process LLVM fuzzing library | Better for library fuzzing; integrates with ASan and UBSan | Active | No | Linux | AFL++ |
| [Boofuzz](https://github.com/jtpereyda/boofuzz) | Network protocol fuzzer | Successor to Sulley; structured protocol fuzzing for network services | Active | Manual | Linux | Manual Scapy |

---

# STAGE 4: POST-EXPLOITATION

    INPUT:  Shell access (user or root/SYSTEM) on target
    OUTPUT: Credentials, hashes, tickets, sensitive data, network map, pivot paths

## 4.1 Credential Dumping

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Mimikatz](https://github.com/gentilkiwi/mimikatz) | LSASS dump, DPAPI, wdigest, Kerberos tickets | Definitive credential tool; heavily signatured: must obfuscate | Active | Manual | Windows | Nanodump |
| [Nanodump](https://github.com/helpsystems/nanodump) | Stealthy LSASS dump with multiple evasion options | Designed to avoid EDR; uses various handle acquisition methods | Active | Manual | Windows | Mimikatz |
| [Lsassy](https://github.com/Hackndo/lsassy) | Remote LSASS credential extraction from Linux | Dumps and parses LSASS remotely over SMB without uploading tools | Active | Manual | Linux | NetExec modules |
| [ProcDump](https://learn.microsoft.com/en-us/sysinternals/downloads/procdump) | LSASS memory dump via Microsoft-signed binary | Signed by Microsoft; often allowed by AV; dump then parse offline | Active | No | Windows | Mimikatz |
| [DonPAPI](https://github.com/login-securite/DonPAPI) | Remote DPAPI secret dumping from Linux | Extracts Windows DPAPI credentials: browser creds, VPN, WiFi | Active | Manual | Linux | SharpDPAPI |
| [SharpDPAPI](https://github.com/GhostPack/SharpDPAPI) | .NET DPAPI credential decryption | Extracts user and machine DPAPI secrets; access Chrome/Edge passwords | Active | Manual | Windows | DonPAPI |
| [LaZagne](https://github.com/AlessandroZ/LaZagne) | Local credential recovery from all sources | Retrieves passwords from 60+ software: browsers, databases, SSH, email | Active | Manual | Both | Mimikatz (Windows) |
| [HackBrowserData](https://github.com/moonD4rk/HackBrowserData) | Browser credential and cookie extraction | Extracts passwords, cookies, history from all major browsers | Active | Manual | Both | LaZagne |
| [impacket-secretsdump](https://github.com/fortra/impacket) | Remote SAM database and NTDS.dit dump | Dumps all local and domain hashes; no agent upload required | Active | Yes | Linux | NetExec --ntds |

## 4.2 Host Enumeration & Survey

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Seatbelt](https://github.com/GhostPack/Seatbelt) | Windows host security survey: 100+ checks | Enumerates tokens, GPO, local users, AV, network connections, tasks | Active | Manual | Windows | WinPEAS |
| [WinPEAS](https://github.com/carlospolop/PEASS-ng) | Automated Windows PrivEsc and host enumeration | Color-coded output; covers all PrivEsc vectors; download fresh build | Active | Manual | Windows | Seatbelt |
| [LinPEAS](https://github.com/carlospolop/PEASS-ng) | Automated Linux PrivEsc and host enumeration | Most comprehensive Linux enumeration script; color-coded by severity | Active | Manual | Linux | LinEnum |
| [LinEnum](https://github.com/rebootuser/LinEnum) | Linux host enumeration script | Faster than LinPEAS; cleaner output; useful when LinPEAS is too noisy | Active | Manual | Linux | LinPEAS |
| [Linux Smart Enumeration](https://github.com/diego-treitos/linux-smart-enumeration) | Tiered Linux enumeration (levels 0-2) | Level 1 is quick for time-pressure; level 2 is comprehensive | Active | Manual | Linux | LinPEAS |
| [pspy](https://github.com/DominicBreuker/pspy) | Linux process monitor without root | Watches process creation in real time; catches cron jobs and SUID abuse | Active | Manual | Linux | Manual /proc |

---

# STAGE 5: LATERAL MOVEMENT

    INPUT:  Credentials, hashes, tickets, foothold on one host
    OUTPUT: Access to additional hosts, higher-privilege accounts, network traversal

## 5.1 Pivoting & Tunneling

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Ligolo-ng](https://github.com/nicocha30/ligolo-ng) | Reverse TCP/TLS tunnel with TUN interface: no SOCKS needed | Creates actual network interface on attacker machine; tools work natively | Active | Manual | Linux | Chisel |
| [Chisel](https://github.com/jpillora/chisel) | TCP/UDP tunnel over HTTP secured by SSH | [Kali package](https://www.kali.org/tools/chisel/); client on target; no SOCKS proxy needed for basic port forward | Active | Yes | Both | Ligolo-ng |
| [SSHuttle](https://github.com/sshuttle/sshuttle) | SSH-based transparent VPN proxy | Works like a VPN via SSH; all traffic routed without SOCKS configuration | Active | Yes | Linux | Chisel |
| [Proxychains4](https://github.com/haad/proxychains) | Route any tool through SOCKS proxy | Use after setting up SOCKS via Chisel or Ligolo; makes any tool pivot-aware | Active | Yes | Linux | Native SOCKS support |
| [Rpivot](https://github.com/klever1988/rpivot) | Reverse SOCKS proxy for restricted networks | Works behind NAT; use when target cannot initiate outbound TCP | Active | Manual | Both | Chisel reverse |
| [SocksOverRDP](https://github.com/nccgroup/SocksOverRDP) | SOCKS5 proxy over RDP connection | Use when only RDP is available for pivoting in corporate environments | Active | Manual | Windows | Chisel |
| [Neo-reGeorg](https://github.com/L-codes/Neo-reGeorg) | SOCKS tunnel through web shell over HTTP | Use when only HTTP is available; drop web shell then tunnel through it | Active | Manual | Both | Chisel |
| [Socat](https://www.kali.org/tools/socat/) | Bidirectional data relay and port redirector | Flexible one-liner port forwarding; runs on target to forward ports | Active | Yes | Linux | Netcat |

## 5.2 Lateral Movement Execution

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [impacket-psexec](https://github.com/fortra/impacket) | SMB-based remote command execution | Creates service and executes; triggers Windows Event 7045; noisy | Active | Yes | Linux | impacket-smbexec |
| [impacket-smbexec](https://github.com/fortra/impacket) | SMB execution without service creation | Stealthier than psexec; still requires admin share access | Active | Yes | Linux | impacket-wmiexec |
| [impacket-wmiexec](https://github.com/fortra/impacket) | WMI-based remote execution | No service creation; semi-interactive shell; less logged than psexec | Active | Yes | Linux | impacket-dcomexec |
| [impacket-dcomexec](https://github.com/fortra/impacket) | DCOM-based remote execution: MMC20, ShellWindows | Uses legitimate DCOM interfaces; varies logging profile from WMI | Active | Yes | Linux | impacket-wmiexec |
| [impacket-atexec](https://github.com/fortra/impacket) | Task Scheduler remote execution | Executes via scheduled task; useful when SMB exec methods are blocked | Active | Yes | Linux | NetExec --exec-method |
| [Evil-WinRM](https://github.com/Hackplayers/evil-winrm) | Interactive WinRM shell | Full interactive shell; file upload/download; PowerShell module loading | Active | Yes | Linux | NetExec winrm |
| [NetExec](https://github.com/Pennyw0rth/NetExec) | Multi-protocol lateral movement at scale | Tests all exec methods; -M modules for post-exploitation actions | Active | Manual | Linux | CrackMapExec |

## 5.3 Pass-the-Hash / Pass-the-Ticket

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [impacket-psexec -hashes](https://github.com/fortra/impacket) | Pass-the-Hash via SMB | Accepts LM:NTLM hash format; gains shell without cracking | Active | Yes | Linux | NetExec -H |
| [Mimikatz sekurlsa: pth](https://github.com/gentilkiwi/mimikatz) | Pass-the-Hash and Key via process injection | Creates new process in context of target hash; most flexible PTH | Active | Manual | Windows | Impacket |
| [Rubeus asktgt](https://github.com/GhostPack/Rubeus) | Overpass-the-Hash: NTLM hash to Kerberos TGT | Converts NTLM hash to TGT for Kerberos authentication | Active | Manual | Windows | Impacket getTGT |
| [Rubeus ptt](https://github.com/GhostPack/Rubeus) | Pass-the-Ticket injection | Injects TGT or TGS into current session | Active | Manual | Windows | Mimikatz kerberos: ptt |
| [impacket-getTGT](https://github.com/fortra/impacket) | Request TGT with hash or password from Linux | Linux-side Kerberos TGT request; set KRB5CCNAME env var after | Active | Yes | Linux | Rubeus |

---

# STAGE 6: PRIVILEGE ESCALATION

    INPUT:  Low-privilege shell (user or service account)
    OUTPUT: root (Linux) / SYSTEM or Domain Admin (Windows/AD)

## 6.1 Linux Privilege Escalation

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [LinPEAS](https://github.com/carlospolop/PEASS-ng) | Comprehensive Linux PrivEsc enumeration | Color-coded severity; covers SUID, sudo, cron, capabilities, writable paths | Active | Manual | Linux | LinEnum |
| [pspy](https://github.com/DominicBreuker/pspy) | Process monitoring without root | Reveals cron jobs and scripts running as root in real time | Active | Manual | Linux | Manual /proc |
| [GTFOBins](https://gtfobins.github.io/) | Abuse sudo, SUID, capability binaries for shell | Definitive reference; look up any binary for its escalation method | Active | No | Browser | Manual research |
| [Linux Exploit Suggester 2](https://github.com/jondonas/linux-exploit-suggester-2) | Kernel LPE CVE matching from uname output | Cross-references kernel version against known exploits with PoC links | Active | Manual | Linux | LinPEAS suggestions |
| [GodPotato](https://github.com/BeichenDream/GodPotato) | SeImpersonatePrivilege to SYSTEM on all Windows versions | Works on Windows Server 2012-2022; most reliable potato variant | Active | Manual | Windows | SweetPotato |
| [SweetPotato](https://github.com/CCob/SweetPotato) | SeImpersonatePrivilege to SYSTEM via COM and WinRM | Combines Juicy, Rogue, PrintSpoofer techniques in one binary | Active | Manual | Windows | GodPotato |
| [PrintSpoofer](https://github.com/itm4n/PrintSpoofer) | SeImpersonatePrivilege on Windows 10 and Server 2019 | Uses Print Spooler pipe trick; fast and reliable | Active | Manual | Windows | GodPotato |

### Linux Escalation Technique Reference

| Technique | Enumeration Command | Notes |
|-----------|--------------------|--------------------|
| Sudo misconfiguration | sudo -l | Check NOPASSWD and wildcard entries |
| SUID binaries | find / -perm -4000 -ls 2>/dev/null | Cross-reference with GTFOBins |
| GUID binaries | find / -perm -2000 -ls 2>/dev/null | Less common but same principle |
| Writable /etc/passwd | ls -la /etc/passwd | Append root-equivalent user if writable |
| Capabilities | getcap -r / 2>/dev/null | python3+cap_setuid is instant root |
| Cron jobs | cat /etc/cron* /var/spool/cron/* 2>/dev/null | Watch for writable scripts via pspy |
| World-writable service scripts | find / -writable -type f 2>/dev/null | Scripts called by root processes |
| PATH hijacking | echo $PATH | Writable PATH + SUID calling relative binary |
| Docker group | id \| grep docker | docker run -v /:/mnt alpine chroot /mnt sh |
| LXD/LXC group | id \| grep lxd | Image import to privileged container with host mount |
| NFS root_squash off | cat /etc/exports | Mount from attacker, create SUID shell |
| LD_PRELOAD via sudo | sudo -l shows env_keep+=LD_PRELOAD | Compile malicious .so, trigger via sudo |

## 6.2 Windows Privilege Escalation

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [WinPEAS](https://github.com/carlospolop/PEASS-ng) | Automated Windows PrivEsc enumeration | Most comprehensive; covers service misconfigs, registry, token privileges | Active | Manual | Windows | Seatbelt |
| [PowerUp](https://github.com/PowerShellMafia/PowerSploit/blob/master/Privesc/PowerUp.ps1) | PowerShell PrivEsc: service misconfigs, DLL hijacking | Auto-exploits found issues: unquoted service paths, weak permissions | Active | Manual | Windows | SharpUp |
| [SharpUp](https://github.com/GhostPack/SharpUp) | C# equivalent of PowerUp | Runs in memory via execute-assembly; avoids PowerShell logging | Active | Manual | Windows | PowerUp |
| [Watson](https://github.com/rasta-mouse/Watson) | Missing patch enumeration for specific LPE CVEs | Checks exact patches rather than guessing from build number | Active | Manual | Windows | WinPEAS |
| [LOLBAS](https://lolbas-project.github.io/) | Living-off-the-land binary reference for Windows | Covers execution, download, bypass via signed Microsoft binaries | Active | No | Browser | GTFOBins (Linux) |

## 6.3 Active Directory Privilege Escalation

| Technique | Tool | Notes |
|-----------|------|-------|
| Kerberoasting | impacket-GetUserSPNs / Rubeus kerberoast | Request TGS for service accounts; crack offline |
| AS-REP Roasting | impacket-GetNPUsers / Rubeus asreproast | Targets accounts with pre-auth disabled |
| ADCS ESC1-ESC13 | Certipy | Misconfigured certificate templates (see ESC matrix in Stage 3.3) |
| DCSync | mimikatz lsadump: dcsync /user:krbtgt | Requires Domain Admin or replication rights |
| Unconstrained Delegation | BloodHound + Rubeus monitor | Wait for DA TGT, inject it |
| Constrained Delegation S4U2Self | Rubeus s4u | Impersonate any user to target service |
| Resource-Based Constrained Delegation | rbcd-attack + Certipy | Write GenericWrite to computer account |
| Shadow Credentials | certipy shadow auto / pywhisker | msDS-KeyCredentialLink manipulation |
| noPac CVE-2021-42278/42287 | noPac | Rename computer account to match DC |
| DnsAdmins to SYSTEM | Manual + dnscmd | DLL loaded by DNS service as SYSTEM |
| Backup Operators to DA | SeBackupPrivilege | Dump NTDS.dit via Volume Shadow Copy |
| Server Operators to SYSTEM | sc config via NetExec | Modify system service binaries |

---

# STAGE 7: PERSISTENCE

    INPUT:  SYSTEM / root / Domain Admin access
    OUTPUT: Mechanisms for regaining access; surviving reboots and credential rotations

## 7.1 Windows / Active Directory Persistence

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [SharpPersist](https://github.com/mandiant/SharPersist) | C# persistence: scheduled tasks, registry, startup, service | Multiple persistence methods from Mandiant; structured and well-tested | Active | Manual | Windows | Manual |
| [Empire](https://github.com/BC-SECURITY/Empire) | Persistence module library for post-exploitation | Large module library for WMI, registry, startup folder persistence | Active | Manual | Linux | Metasploit |
| [PowerSploit](https://github.com/PowerShellMafia/PowerSploit) | PowerShell persistence scripts | Comprehensive PowerShell persistence; hook it to any payload | Active | Manual | Windows | Empire |

### Windows Persistence Techniques

| Technique | Method | Stealth |
|-----------|--------|---------|
| Registry Run key | reg add HKCU\Software\Microsoft\Windows\CurrentVersion\Run | Medium |
| Startup folder | %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\ | Medium |
| Scheduled task | schtasks /create /tn name /tr payload.exe /sc onlogon /ru SYSTEM | Medium |
| Service installation | sc create name binPath= payload.exe start= auto | Medium |
| DLL hijacking | Replace DLL in search path loaded by legitimate service | High |
| WMI subscription | PowerSploit New-PermanentWMIEvent | High |
| COM hijacking | Modify HKCU COM class to load attacker DLL | High |
| Golden Ticket | mimikatz kerberos: golden /user:admin /krbtgt:HASH | Very High |
| Silver Ticket | mimikatz kerberos: golden /user:svc /service:cifs /rc4:HASH | Very High |
| AdminSDHolder ACL | Add attacker to AdminSDHolder ACL | Very High |
| SID History | Inject Domain Admin SID into low-priv user | Very High |
| Skeleton Key | mimikatz misc: skeleton: any password authenticates | Operational |

## 7.2 Linux Persistence

| Technique | Method | Stealth |
|-----------|--------|---------|
| SSH authorized_keys | Add attacker pubkey to root/.ssh/authorized_keys | High |
| Cron job | crontab -l with appended reverse shell | Medium |
| Systemd service | Create /etc/systemd/system/malicious.service | Medium |
| .bashrc / .profile | Append reverse shell command | Medium |
| SUID shell copy | cp /bin/bash /tmp/.bash; chmod +s /tmp/.bash | Low |
| LD_PRELOAD system-wide | /etc/ld.so.preload injection | High |
| PAM backdoor | Modify PAM config to accept magic password | Very High |

---

# STAGE 8: DEFENSE EVASION & AV/EDR BYPASS

    INPUT:  Need to execute payloads or tools in a monitored environment
    OUTPUT: Undetected execution; bypassed AMSI, ETW, signature detection, behavioral analysis

## 8.1 Detection Methods Reference

| Detection Method | What It Catches | Bypass Approach |
|-----------------|-----------------|-----------------|
| Signature-based | Known tool hashes, byte patterns, strings | Compile custom, rewrite, obfuscate, encrypt |
| Heuristic | Behavioral patterns, suspicious API calls | Use indirect syscalls, LOLBins, sleep masking |
| AMSI | In-memory script content before execution | Patch AmsiScanBuffer, reflection bypass, PowerShell v2 |
| ETW | Telemetry events from process execution | Patch EtwEventWrite, reduce event generation |
| Memory scanning | Shellcode and reflective DLL in memory | Encrypt in-memory, obfuscate PE headers |
| Userland hooking | EDR hooks on NTDLL exports | Unhook NTDLL, use direct or indirect syscalls |
| Behavioral analysis | Process tree, network, file system anomalies | Match legitimate behavior patterns |
| Sandbox | Automated detonation environment | Sandbox detection plus delayed execution |

## 8.2 Obfuscation Tools

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Invoke-Obfuscation](https://github.com/danielbohannon/Invoke-Obfuscation) | PowerShell script obfuscation | Multiple obfuscation layers: string, encoding, AST, command token | Active | Manual | Windows | Chimera |
| [Chimera](https://github.com/tokyoneon/Chimera) | PowerShell obfuscation and AMSI bypass | Designed to evade modern AV; combines multiple bypass techniques | Active | Manual | Linux | Invoke-Obfuscation |
| [Chameleon](https://github.com/klezVirus/chameleon) | PowerShell script obfuscation | Configurable obfuscation pipeline; better evasion against modern AV | Active | Manual | Linux | Invoke-Obfuscation |
| [ConfuserEx](https://github.com/yck1509/ConfuserEx) | .NET assembly obfuscation and protection | Applies control flow, renaming, anti-debug, anti-dump to .NET payloads | Active | Manual | Windows | Obfuscar |

## 8.3 AMSI Bypass

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [AMSI.fail](https://amsi.fail/) | Browser-based AMSI bypass payload generator | Generates current working bypasses; regenerates to avoid signature | Active | No | Browser | Manual bypass |
| [AMSITrigger](https://github.com/RythmStick/AMSITrigger) | Find which strings trigger AMSI detection | Identifies exact triggering string in script; allows targeted obfuscation | Active | Manual | Windows | Manual bisect |

### AMSI Bypass Techniques

| Technique | Approach | Detection Risk |
|-----------|----------|---------------|
| AmsiScanBuffer patch | Overwrite function prologue with xor eax,eax + ret | Medium |
| Reflection amsiInitFailed | Set amsiInitFailed field to true via .NET reflection | High: well-signatured |
| PowerShell v2 | powershell.exe -version 2: AMSI not loaded | Low, limited compatibility |
| NTDLL unhooking | Load clean NTDLL copy from disk, restore original bytes | Low |
| COM/DCOM execution | Execute outside AMSI-monitored hosts via WMI or Task Scheduler | Low |
| Custom CLR host | .NET runtime without AMSI integration | Very Low |

## 8.4 Payload Loaders & Shellcode Execution

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [ScareCrow](https://github.com/optiv/ScareCrow) | EDR-evading shellcode loader with signed binaries | Spoofs code signing certificates; DLL side-loading support | Active | Manual | Linux | Freeze |
| [Freeze](https://github.com/Tylous/Freeze) | Shellcode loader: sleep masking + direct syscalls + encryption | Combines multiple evasion layers; Go-based for low baseline detection | Active | Manual | Linux | ScareCrow |
| [Donut](https://github.com/TheWover/donut) | .NET and PE to position-independent shellcode | Enables in-memory .NET execution; input for other loaders | Active | Manual | Linux | Manual shellcode |
| [Nimcrypt2](https://github.com/icyguider/Nimcrypt2) | Shellcode encryption and loader in Nim | Nim binaries have very low AV detection baseline | Active | Manual | Linux | OffensiveNim |
| [OffensiveNim](https://github.com/byt3bl33d3r/OffensiveNim) | Nim-based offensive techniques and templates | Full template library: shellcode injection, AMSI bypass, persistence | Active | Manual | Linux | Nimcrypt2 |
| [OffensiveRust](https://github.com/trickster0/OffensiveRust) | Rust-based shellcode injection and process injection templates | Rust produces low-entropy, low-detection binaries; growing toolset | Active | Manual | Linux | OffensiveNim |

## 8.5 Process Injection Techniques

| Technique | Tool / Reference | Detection Risk |
|-----------|-----------------|---------------|
| Classic DLL injection (CreateRemoteThread + LoadLibrary) | Manual / Metasploit | High |
| Reflective DLL injection | [ReflectiveDLLInjection](https://github.com/stephenfewer/ReflectiveDLLInjection) | Medium |
| Process hollowing | [Process-Hollowing](https://github.com/m0n0ph1/Process-Hollowing) | Medium |
| APC queue injection | Manual C code | Medium |
| Thread execution hijacking | Manual SetThreadContext | Medium |
| Early Bird APC injection | Manual | Low |
| NTDLL unhooking | [Freshycalls](https://github.com/crummie5/FreshyCalls) | Low |
| Direct syscalls | [SysWhispers2](https://github.com/jthuraisamy/SysWhispers2) | Low |
| Indirect syscalls | [SysWhispers3](https://github.com/klezVirus/SysWhispers3) | Very Low |

## 8.6 Living-off-the-Land References

| Resource | URL | Usage |
|----------|-----|-------|
| [LOLBAS](https://lolbas-project.github.io/) | https://lolbas-project.github.io/ | Windows signed binary abuse |
| [GTFOBins](https://gtfobins.github.io/) | https://gtfobins.github.io/ | Linux binary abuse |
| [LOLOL Farm](https://lolol.farm/) | https://lolol.farm/ | All living-off-the-land resources aggregated |
| [WADComs](https://wadcoms.github.io/) | https://wadcoms.github.io/ | Windows and AD commands for specific situations |

## 8.7 C2 Frameworks

| Framework | Type | Distinguishing Fact | Status | Platform | Alt / If Blocked |
|-----------|------|---------------------|--------|----------|-----------------|
| [Cobalt Strike](https://www.cobaltstrike.com/) | Commercial | Industry gold standard; Beacon payload; largest ecosystem | Active | Both | Sliver |
| [Sliver](https://github.com/BishopFox/sliver) | Open-source (Go) | Best free Cobalt Strike alternative; mTLS, HTTP/S, DNS, WireGuard C2 | Active | Linux | Havoc |
| [Havoc](https://github.com/HavocC2/Havoc) | Open-source | Stealth-focused; modern Demon agent; reflective loading; Graph API C2 | Active | Linux | Sliver |
| [Mythic](https://github.com/its-a-feature/Mythic) | Open-source | Agent-agnostic; web UI; modular; supports multiple language agents | Active | Linux | Sliver |
| [Brute Ratel C4](https://bruteratel.com/) | Commercial | Lowest EDR detection rate in tests; OPSEC-centric design | Active | Both | Cobalt Strike |
| [Empire BC-Security](https://github.com/BC-SECURITY/Empire) | Open-source | PowerShell and Python agents; large module library | Active | Linux | Sliver |
| [PoshC2](https://github.com/nettitude/PoshC2) | Open-source | PowerShell-based; simpler architecture; good for quick engagements | Active | Linux | Empire |
| [Covenant](https://github.com/cobbr/Covenant) | Open-source (.NET) | .NET C2; execute-assembly natively; runs on Windows/Linux | Active | Both | Empire |
| [CALDERA](https://github.com/mitre/caldera) | Open-source (MITRE) | ATT&CK-mapped adversary emulation; automated attack chains | Active | Linux | Manual |

---

# STAGE 9: EXFILTRATION

    INPUT:  Access to target data; need to extract without triggering DLP
    OUTPUT: Data moved to attacker-controlled infrastructure

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Rclone](https://rclone.org/) | Cloud storage exfiltration: S3, Dropbox, OneDrive, GDrive | Exfiltrates to cloud storage; blends with legitimate cloud traffic | Active | Manual | Both | Manual curl |
| [DNSExfiltrator](https://github.com/Arno0x/DNSExfiltrator) | Data exfiltration over DNS | Uses DNS queries to encode and exfiltrate data; bypasses HTTP DLP | Active | Manual | Both | dnscat2 |
| [dnscat2](https://github.com/iagox86/dnscat2) | Encrypted C2 channel over DNS | Full C2 over DNS; exfiltration and command channel combined | Active | Manual | Both | DNSExfiltrator |
| [PacketWhisper](https://github.com/TryCatchHCF/PacketWhisper) | Steganographic DNS exfiltration | Encodes data into FQDN patterns; defeats DNS monitoring | Active | Manual | Linux | DNSExfiltrator |
| [PyExfil](https://github.com/ytisf/pyexfil) | Multi-protocol exfiltration: NTP, ICMP, Slack, DNS, HTTP | Tests multiple exfil channels; find what bypasses DLP | Active | Manual | Linux | Manual |
| Impacket SMB Server | Host SMB share; target copies files to it | impacket-smbserver share /loot -smb2support | Active | Yes | Linux | Python HTTP server |

---
---

# APPENDIX A: MOBILE PENTESTING (Android / iOS)

## Android

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF) | Static and dynamic analysis for Android and iOS | All-in-one automated scanner; reveals hardcoded secrets, manifest issues, APIs | Active | Manual | Linux | Manual analysis |
| [Frida](https://frida.re/) | Dynamic instrumentation: hook functions, bypass SSL pinning, root detection | Most powerful mobile runtime manipulation tool; scripting-based | Active | Manual | Both | Objection |
| [Objection](https://github.com/sensepost/objection) | Runtime exploration toolkit powered by Frida | Pre-built Frida scripts for common bypasses: SSL pinning, root detection | Active | Manual | Linux | Frida scripts |
| [APKTool](https://github.com/iBotPeaches/Apktool) | APK reverse engineering: decode, modify, rebuild | Decodes APK to Smali; rebuild after modification for testing | Active | Manual | Linux | JADX |
| [JADX](https://github.com/skylot/jadx) | APK decompilation to readable Java | Better readability than Smali; GUI version available | Active | Manual | Both | APKTool |
| [Dex2Jar](https://github.com/pxb1988/dex2jar) | Convert DEX bytecode to JAR for Java decompilation | Step in APK analysis pipeline before JD-GUI | Active | Manual | Both | JADX |
| [JD-GUI](https://java-decompiler.github.io/) | Java decompiler GUI | Visualize JAR content from Dex2Jar output | Active | Manual | Both | JADX |
| [Drozer](https://github.com/WithSecureLabs/drozer) | Android security assessment framework: IPC, intent attacks | Tests exported components, content providers, intent vulnerabilities | Active | Manual | Linux | Manual ADB |
| [ADB](https://developer.android.com/tools/adb) | Android Debug Bridge: shell, file transfer, package management | Required for all Android device interaction | Active | Yes | Both | N/A |
| [ApkLeaks](https://github.com/dwisiswant0/apkleaks) | Scan APK for secrets, endpoints, API keys | Automated secret discovery in decompiled APK; fast first-pass | Active | Manual | Linux | Manual grep |
| [Fridump](https://github.com/Nightbringer21/fridump) | Memory dump via Frida | Dumps app memory for credential extraction | Active | Manual | Linux | Manual Frida |
| [House](https://github.com/nccgroup/house) | Web GUI for Frida-based Android assessment | Lowers barrier to Frida usage | Active | Manual | Linux | Objection |
| [RMS Runtime Mobile Security](https://github.com/m0bilesecurity/RMS-Runtime-Mobile-Security) | Web-based Frida interface for Android and iOS | Visual Frida management; simplifies runtime manipulation | Active | Manual | Linux | House |
| [Genymotion](https://www.genymotion.com/) | Android emulator for testing | Best performance among Android emulators; ARM translation support | Active | No | Both | Android Studio AVD |

## iOS

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Frida](https://frida.re/) | Runtime manipulation on jailbroken iOS | Same toolchain as Android; requires jailbreak for full access | Active | Manual | Linux | Objection |
| [Objection](https://github.com/sensepost/objection) | Runtime iOS exploration via Frida | Works on jailbroken and patched (FridaGadget injection) iOS | Active | Manual | Linux | Manual Frida |
| [Checkra1n](https://checkra.in/) | Hardware-based iOS jailbreak (A5-A11 chips) | Unpatchable vulnerability-based; works on older iPhones | Active | No | Linux | Unc0ver |
| [Needle](https://github.com/WithSecureLabs/needle) | iOS app security assessment framework | Static and dynamic analysis; binary analysis, data storage checks | Active | Manual | Linux | MobSF |
| [iLEAPP](https://github.com/abrignoni/iLEAPP) | iOS log and artifact parser | Forensic artifact extraction from iOS backups and file dumps | Active | Manual | Both | Manual analysis |
| [Class-dump](https://monovm.com/blog/class-dump-on-ios/) | Objective-C class interface extraction from iOS binaries | Reveals all class methods and properties without source code | Active | No | macOS | Ghidra |
| [SSL Kill Switch 2](https://github.com/nabla-c0d3/ssl-kill-switch2) | SSL pinning bypass via Cydia Substrate | Jailbreak-only; patches SecureTransport to disable pinning globally | Active | No | iOS (jailbroken) | Objection SSL bypass |

## Mobile Standards

| Standard | URL |
|----------|-----|
| OWASP Mobile Top 10 | https://owasp.org/www-project-mobile-top-10/ |
| OWASP MASVS | https://mas.owasp.org/MASVS/ |
| OWASP MASTG | https://mas.owasp.org/MASTG/ |
| Frida CodeShare | https://codeshare.frida.re/ |

---

# APPENDIX B: CLOUD PENTESTING

## AWS

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Pacu](https://github.com/RhinoSecurityLabs/pacu) | AWS exploitation framework: Metasploit for AWS | 80+ modules: IAM enum, PrivEsc, EC2 attacks, S3, Lambda | Active | Manual | Linux | Manual AWS CLI |
| [ScoutSuite](https://github.com/nccgroup/ScoutSuite) | Multi-cloud security audit: AWS, Azure, GCP, OCI, Alibaba | Passive; produces risk-rated HTML report; no resource modification | Active | Manual | Linux | Prowler |
| [Prowler](https://github.com/prowler-cloud/prowler) | Multi-cloud security assessment: 400+ checks, compliance frameworks | Supports CIS, NIST, GDPR, HIPAA, PCI-DSS | Active | Manual | Linux | ScoutSuite |
| [CloudFox](https://github.com/BishopFox/cloudfox) | Find exploitable attack paths in AWS and Azure | Enumerates attack paths: S3 to EC2 to IAM role to admin | Active | Manual | Linux | Pacu |
| [Pmapper](https://github.com/nccgroup/PMapper) | AWS IAM privilege escalation path analysis | Maps all IAM PrivEsc paths; BloodHound for AWS IAM | Active | Manual | Linux | CloudFox |
| [S3Scanner](https://github.com/sa7mon/S3Scanner) | Open S3 bucket discovery and listing | Fastest S3 bucket scanner; lists all accessible contents | Active | Manual | Linux | CloudEnum |
| [CloudGoat](https://github.com/RhinoSecurityLabs/cloudgoat) | Vulnerable-by-design AWS environment for practice | Official Rhino Security Labs practice environment | Active | Manual | Linux | Cloudfoxable |
| [WeirdAAL](https://github.com/carnal0wnage/weirdAAL) | AWS attack library: modules for various service attacks | Covers uncommon attack paths: Glacier, Cognito, AppSync | Active | Manual | Linux | Pacu |

## Azure

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [ROADtools](https://github.com/dirkjanm/ROADtools) | Azure AD enumeration and attack toolset | Best for Azure AD/Entra ID graph exploration; Python-based | Active | Manual | Linux | AADInternals |
| [AADInternals](https://github.com/Gerenios/AADInternals) | Azure AD offensive and forensic PowerShell toolkit | Covers token abuse, backdoors, phishing, info gathering | Active | Manual | Windows | ROADtools |
| [MicroBurst](https://github.com/NetSPI/MicroBurst) | Azure security enumeration and exploitation in PowerShell | Covers Azure storage, Key Vault, service principals, management APIs | Active | Manual | Windows | ROADtools |
| [Stormspotter](https://github.com/Azure/Stormspotter) | Azure AD attack path visualization: BloodHound for Azure | Maps identity attack paths in Azure AD and subscription | Active | Manual | Both | BloodHound CE (Azure edges) |
| [TokenTactics](https://github.com/rvrsh3ll/TokenTactics) | Azure AD OAuth token manipulation | Refresh token abuse, token persistence, device code phishing | Active | Manual | Windows | Manual |
| [GraphSpy](https://github.com/RedByte1337/GraphSpy) | Microsoft Graph API attack tool | Enumerates and attacks via Graph API using stolen tokens | Active | Manual | Linux | ROADtools |

## GCP

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [GCPBucketBrute](https://github.com/RhinoSecurityLabs/GCPBucketBrute) | GCS bucket enumeration | GCP-specific; checks bucket existence, ACLs, and content access | Active | Manual | Linux | CloudEnum |
| [GCP IAM PrivEsc](https://github.com/RhinoSecurityLabs/GCP-IAM-Privilege-Escalation) | GCP IAM privilege escalation techniques database | Documents all known GCP IAM PrivEsc paths | Active | Manual | Linux | Manual |

---

# APPENDIX C: CONTAINERS & KUBERNETES

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Kube-hunter](https://github.com/aquasecurity/kube-hunter) | Kubernetes security testing: remote and in-cluster | Passive enumeration and active exploitation of K8s misconfigs | Active | Manual | Linux | CDK |
| [Peirates](https://github.com/inguardians/peirates) | Kubernetes penetration testing framework | Token exfiltration, privilege escalation, lateral movement in K8s | Active | Manual | Linux | Kube-hunter |
| [CDK](https://github.com/cdk-team/CDK) | Container and Kubernetes security toolkit | Escape detection plus exploitation plus info gathering in one binary | Active | Manual | Linux | Deepce |
| [Deepce](https://github.com/stealthcopter/deepce) | Docker privilege escalation and enumeration | Checks all escape vectors: socket, capabilities, mounts | Active | Manual | Linux | CDK |
| [Kubeletctl](https://github.com/cyberark/kubeletctl) | Kubelet API exploitation: exec without auth | Exploits unauthenticated kubelet endpoints for container exec | Active | Manual | Linux | Manual curl |
| [BadPods](https://github.com/BishopFox/badPods) | Pod spec privilege escalation templates | Reference manifests for hostPID, hostNetwork, privileged containers | Active | No | Reference | Manual |
| [Amicontained](https://github.com/genuinetools/amicontained) | Container introspection: capabilities, seccomp, namespace | Identifies what privileges the current container has | Active | Manual | Linux | Manual /proc |
| [RBAC-Police](https://github.com/PaloAltoNetworks/rbac-police) | Kubernetes RBAC misconfiguration analysis | Evaluates all service account permissions against attack policies | Active | Manual | Linux | Manual |

### Container Escape Reference

| Method | Requirement | Exploit |
|--------|-------------|---------|
| Privileged container | --privileged flag | fdisk -l; mount /dev/sda1 /mnt; chroot /mnt |
| Docker socket mount | /var/run/docker.sock accessible | docker run -v /:/host alpine chroot /host sh |
| hostPID | hostPID=true | nsenter -t 1 -m -u -n -i sh |
| hostNetwork | hostNetwork=true | Access node network; attack K8s API |
| CAP_SYS_ADMIN | SYS_ADMIN capability | Multiple escape paths; cgroup/mount abuse |
| CVE-2019-5736 | runc < 1.0-rc6 | Overwrite host runc binary |
| CVE-2020-15257 | Containerd < 1.3.9 | UNIX socket exposure |

---

# APPENDIX D: WIRELESS PENTESTING

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Aircrack-ng](https://www.aircrack-ng.org/) | WEP/WPA/WPA2 cracking, packet injection, monitoring | Core wireless suite; airodump-ng, aireplay-ng, airmon-ng included | Active | Yes | Linux | N/A |
| [Hcxdumptool](https://github.com/ZerBea/hcxdumptool) | PMKID and EAPOL capture without client deauth | Captures PMKID from AP without requiring connected client | Active | Yes | Linux | Aircrack-ng suite |
| [Hcxtools](https://github.com/ZerBea/hcxtools) | Convert wireless captures for Hashcat cracking | Converts .pcapng to Hashcat 22000 format; required after hcxdumptool | Active | Yes | Linux | Manual conversion |
| [Wifite2](https://github.com/kimocoder/wifite2) | Automated wireless auditing: WEP/WPA/WPS/PMKID | Automates entire WPA cracking pipeline; integrates all relevant tools | Active | Yes ([Kali](https://www.kali.org/tools/wifite/)) | Linux | Airgeddon |
| [Airgeddon](https://github.com/v1s1t0r1sh3r3/airgeddon) | All-in-one wireless framework with evil twin | More attack options than Wifite; evil twin with captive portal built-in | Active | Manual | Linux | Wifite2 |
| [Bettercap](https://github.com/bettercap/bettercap) | WiFi MITM, BLE, network attacks in one framework | Multi-protocol; WiFi AP mode, deauth, BLE scanning, ARP spoofing | Active | Yes | Linux | Airgeddon |
| [Kismet](https://www.kismetwireless.net/) | Wireless network detector, sniffer, WIDS | Passive detection; captures all 802.11 frames; wide hardware support | Active | Yes | Linux | Airodump-ng |
| [Wifiphisher](https://github.com/wifiphisher/wifiphisher) | Rogue AP with phishing portal: evil twin | Automates credential harvesting via fake AP with pre-built phishing templates | Active | Yes | Linux | Airgeddon evil twin |
| [Hostapd-wpe](https://github.com/OpenSecurityResearch/hostapd-wpe) | WPA Enterprise attack: EAP credential capture | Captures MSCHAP-v2 challenge-response from WPA-Enterprise clients | Active | Manual | Linux | EAPHammer |
| [EAPHammer](https://github.com/s0lst1c3/eaphammer) | Targeted WPA/WPA2 Enterprise attacks | GTC downgrade, EAP-MD5, PMKID capture for enterprise WiFi | Active | Manual | Linux | Hostapd-wpe |
| [Reaver](https://www.kali.org/tools/reaver/) | WPS PIN brute-force attack | Standard WPS attack tool; Pixie Dust attack support | Active | Yes | Linux | Bully |
| [PixieWPS](https://www.kali.org/tools/pixiewps/) | WPS Pixie Dust offline attack | Exploits WPS design flaw; recovers PIN from a few packets | Active | Yes | Linux | Reaver -K |
| [Bully](https://www.kali.org/tools/bully/) | WPS brute-force attack in C | More reliable than Reaver against some AP firmware | Active | Yes | Linux | Reaver |

### Wireless Attack Methodology

| Phase | Tool | Command |
|-------|------|---------|
| Enable monitor mode | airmon-ng | sudo airmon-ng start wlan0 |
| Survey APs | airodump-ng | sudo airodump-ng wlan0mon |
| Target specific AP | airodump-ng | sudo airodump-ng -c CH --bssid BSSID -w capture wlan0mon |
| Force handshake | aireplay-ng | sudo aireplay-ng --deauth 10 -a BSSID wlan0mon |
| PMKID capture | hcxdumptool | sudo hcxdumptool -o capture.pcapng --enable_status=3 |
| Convert for Hashcat | hcxpcapngtool | hcxpcapngtool -o hash.22000 capture.pcapng |
| Crack | Hashcat | hashcat -m 22000 hash.22000 /usr/share/wordlists/rockyou.txt |

---

# APPENDIX E: HARDWARE & IoT SECURITY

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Flipper Zero](https://flipperzero.one/) | Sub-GHz, NFC, RFID, BLE, IR, iButton, GPIO | Multi-protocol hardware toolkit in pocket form; portable | Active | No | Standalone | HackRF |
| [Proxmark3](https://proxmark.com/) | RFID/NFC reading, writing, cloning, emulation | Most capable RFID tool; supports LF and HF cards | Active | No | Linux | Flipper Zero |
| [HackRF One](https://greatscottgadgets.com/hackrf/) | Wideband SDR transceiver 1MHz-6GHz | Transmits and receives across entire RF spectrum | Active | No | Linux | RTL-SDR (receive only) |
| [RTL-SDR](https://www.rtl-sdr.com/) | Software-defined radio receiver | Cheapest entry to SDR; receive-only; USB dongle | Active | No | Linux | HackRF One |
| [GNU Radio](https://www.gnuradio.org/) | SDR signal processing framework | Visual signal flow programming; pairs with HackRF/RTL-SDR | Active | Yes | Linux | Universal Radio Hacker |
| [Universal Radio Hacker](https://github.com/jopohl/urh) | RF signal analysis and protocol reverse engineering | GUI-based; auto-detects modulation; cleaner than GNU Radio for analysis | Active | Yes | Linux | GNU Radio |
| [Binwalk](https://github.com/ReFirmLabs/binwalk) | Firmware extraction and analysis | Identifies and extracts file systems from firmware images | Active | Yes | Linux | Firmwalker |
| [FACT Firmware Analysis](https://github.com/fkie-cad/FACT_core) | Automated firmware analysis framework | Full pipeline: unpack, scan, compare, web interface | Active | Manual | Linux | Binwalk + manual |
| [Firmadyne](https://github.com/firmadyne/firmadyne) | Linux-based firmware emulation and vulnerability testing | Emulates firmware in QEMU for dynamic analysis without hardware | Active | Manual | Linux | FACT |
| [Bus Pirate](http://dangerousprototypes.com/docs/Bus_Pirate) | UART, SPI, I2C, 1-Wire protocol analysis | Universal protocol sniffer; read/write embedded chips | Active | No | Standalone | Manual logic analyzer |
| [JTAGulator](http://www.grandideastudio.com/jtagulator/) | JTAG/UART pin identification on unknown hardware | Identifies debug interface pins via automated probing | Active | No | Standalone | Manual probing |
| [OpenOCD](https://openocd.org/) | On-chip debugger for embedded processors | Interfaces with JTAG adapters; allows memory read/write and code execution | Active | Yes | Linux | J-Link |
| [ChipWhisperer](https://www.newae.com/chipwhisperer/) | Side-channel attack platform: power analysis, fault injection | Professional hardware attack platform for glitching and SPA/DPA | Active | No | Linux | Manual oscilloscope |

---

# APPENDIX F: THICK CLIENT APPLICATION TESTING

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Burp Suite](https://portswigger.net/burp) | Intercept and modify thick client HTTP/HTTPS traffic | Configure as proxy for thick client; requires proxy settings in app | Active | Yes (CE) | Both | mitmproxy |
| [Echo Mirage](https://www.bindshell.net/tools/echomirage) | Hook and modify network traffic in thick clients | Intercepts Winsock calls without proxy configuration | Active | No | Windows | Wireshark + Frida |
| [Wireshark](https://www.wireshark.org/) | Packet capture and protocol analysis | Used when client does not use HTTP; captures raw protocol traffic | Active | Yes | Both | tcpdump |
| [Procmon Sysinternals](https://learn.microsoft.com/en-us/sysinternals/downloads/procmon) | File system, registry, process activity monitoring | Reveals configuration files, registry keys, temp file handling | Active | No | Windows | strace (Linux) |
| [x64dbg](https://x64dbg.com/) | Debug thick client executables | Identify hardcoded credentials, bypass license checks, analyze crypto | Active | No | Windows | OllyDbg |
| [Ghidra](https://ghidra-sre.org/) | Reverse engineer thick client binaries | Decompile to find hardcoded keys, API endpoints, auth logic | Active | Yes | Both | IDA |
| [dnSpy](https://github.com/dnSpy/dnSpy) | .NET assembly debugger and editor | Debug and modify .NET thick clients at runtime; edit IL and recompile | Active | No | Windows | ILSpy |
| [ILSpy](https://github.com/icsharpcode/ILSpy) | .NET assembly decompiler | Decompile C# thick clients to readable source without source code | Active | Manual | Windows | dnSpy |
| [CFF Explorer](https://ntcore.com/?page_id=388) | PE file editor and structure viewer | Edit PE headers, imports, resources of thick client executables | Active | No | Windows | PE-bear |
| [Frida](https://frida.re/) | Dynamic instrumentation of thick client at runtime | Hook .NET/native functions; bypass authentication, extract keys | Active | Manual | Both | x64dbg |
| [Fiddler](https://www.telerik.com/fiddler) | HTTP/HTTPS proxy for Windows applications | Some thick clients use WinHTTP and auto-detect system proxy | Active | No | Windows | Burp Suite |

---

# APPENDIX G: ICS / SCADA / OT SECURITY

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [PLCScan](https://github.com/yanehiro/PLCScan) | PLC device discovery and fingerprinting | Identifies Siemens, Rockwell, Schneider PLCs on network | Active | Manual | Linux | Nmap ICS scripts |
| [Nmap ICS NSE scripts](https://nmap.org/nsedoc/) | Modbus, DNP3, EtherNet/IP enumeration | --script modbus-discover, --script enip-info, S7 detection | Active | Yes | Linux | PLCScan |
| [Metasploit ICS modules](https://www.metasploit.com/) | ICS/SCADA protocol exploitation | Modbus, DNP3, BACnet scanning and limited exploitation | Active | Yes | Linux | Manual |
| [ModbusPal](http://modbuspal.sourceforge.net/) | Modbus simulator and testing | Simulates Modbus master/slave; test protocol interaction | Active | No | Linux (Java) | Modbustools |
| [Redpoint ICS Nmap scripts](https://github.com/digitalbond/Redpoint) | ICS-specific Nmap NSE scripts by Digital Bond | Best collection of ICS enumeration scripts | Active | Manual | Linux | Native Nmap scripts |
| [GRASSMARLIN](https://github.com/nsacyber/GRASSMARLIN) | ICS network topology visualization: NSA-released | Passively maps ICS networks from PCAP; no active scanning | Active | Manual | Both | Wireshark |

---

# APPENDIX H: BLOCKCHAIN / WEB3 SECURITY

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [Slither](https://github.com/crytic/slither) | Solidity static analysis framework | Detects 80+ vulnerability classes in smart contracts; Trail of Bits | Active | Manual | Linux | Mythril |
| [Mythril](https://github.com/ConsenSys/mythril) | Symbolic execution for EVM smart contracts | Finds integer overflow, reentrancy, delegatecall issues automatically | Active | Manual | Linux | Slither |
| [Echidna](https://github.com/crytic/echidna) | Smart contract fuzzer: property-based | Fuzzes contracts against user-defined properties; finds edge cases | Active | Manual | Linux | Foundry fuzzing |
| [Foundry](https://github.com/foundry-rs/foundry) | Ethereum development toolkit with integrated testing | forge test + cast for on-chain interaction; fastest dev/test cycle | Active | Manual | Linux | Hardhat |
| [Hardhat](https://hardhat.org/) | Ethereum development environment and testing | Node.js-based; large plugin ecosystem; console.log in Solidity | Active | Manual | Linux | Foundry |
| [Brownie](https://github.com/eth-brownie/brownie) | Python Ethereum testing framework | Python-native; good for scripting attacks and on-chain testing | Active | Manual | Linux | Foundry |
| [Tenderly](https://tenderly.co/) | Transaction simulation and contract debugging | Simulates transactions against mainnet state; useful for PoC dev | Active | No | Browser | Hardhat fork |
| [DeFi not-so-smart-contracts](https://github.com/crytic/not-so-smart-contracts) | Collection of DeFi vulnerability examples with PoC | Reference for all known DeFi vulnerability patterns | Active | No | Reference | Manual research |
| [Ethervm.io Decompiler](https://ethervm.io/decompile) | EVM bytecode decompiler | Decompiles unverified contract bytecode to pseudo-source | Active | No | Browser | Panoramix |

---

# APPENDIX I: VOIP & TELECOMMUNICATIONS

| Tool | Coverage / Attack | Distinguishing Fact | Status | Kali | Platform | Alt / If Blocked |
|------|------------------|---------------------|--------|------|----------|-----------------|
| [SIPVicious](https://github.com/EnableSecurity/sipvicious) | SIP enumeration and attack suite | Standard VoIP pentesting toolkit: svmap, svwar, svcrack, svreport | Active | Yes | Linux | Manual |
| [Wireshark](https://www.wireshark.org/) | VoIP call capture and decoding | Built-in SIP and RTP dissectors; captures and plays back VoIP calls | Active | Yes | Both | tcpdump |
| [Asterisk](https://www.asterisk.org/) | Open-source PBX for VoIP lab setup | Set up rogue PBX for testing and attack simulation | Active | Manual | Linux | FreeSWITCH |
| [Mr.SIP](https://github.com/meliht/Mr.SIP) | SIP-based offensive security tool | DoS, enumeration, simulated call attacks via SIP | Active | Manual | Linux | SIPVicious |
| [Sngrep](https://github.com/irontec/sngrep) | SIP message flow visualization | Real-time SIP call flow diagrams; better than Wireshark for SIP | Active | Yes | Linux | Wireshark |
| [Scapy](https://scapy.net/) | Custom SIP/RTP packet crafting | Craft arbitrary SIP messages and RTP streams; full protocol control | Active | Yes | Linux | Manual socket code |

---
---

# CTF CHALLENGE CATEGORIES

# APPENDIX J: FORENSICS

| Tool | Coverage | Distinguishing Fact | Status | Kali | Platform |
|------|----------|---------------------|--------|------|----------|
| [Volatility3](https://github.com/volatilityfoundation/volatility3) | Memory forensics: processes, network, registry, credentials | Standard memory forensics framework; Python3; profiles for Windows/Linux | Active | Manual | Linux |
| [Volatility2](https://github.com/volatilityfoundation/volatility) | Legacy memory forensics (Python2) | Some old CTF images require v2; keep both available | Active | Manual | Linux |
| [Autopsy](https://www.autopsy.com/) | Full digital forensics platform: disk, timeline, carving | GUI-based; file carving, timeline, keyword search on disk images | Active | Yes | Both |
| [Sleuth Kit](https://www.sleuthkit.org/) | CLI disk forensics: image analysis, file carving | Underlies Autopsy; use CLI for scripted analysis | Active | Yes | Linux |
| [Bulk Extractor](https://github.com/simsong/bulk_extractor) | Automated feature extraction from disk and memory images | Finds emails, URLs, credit cards, credentials without parsing filesystem | Active | Yes | Linux |
| [Foremost](https://www.kali.org/tools/foremost/) | File carving from disk images | Carves deleted files by header/footer signatures | Active | Yes | Linux |
| [Scalpel](https://www.kali.org/tools/scalpel/) | Fast file carving | Faster than Foremost; configurable file type signatures | Active | Yes | Linux |
| [Wireshark](https://www.wireshark.org/) | PCAP analysis for network forensics | Standard; follow TCP stream, extract files from HTTP/FTP | Active | Yes | Both |
| [NetworkMiner](https://www.netresec.com/?page=NetworkMiner) | Passive PCAP analysis and file extraction | Extracts transferred files, credentials, sessions from PCAP automatically | Active | No | Windows |
| [tshark](https://www.wireshark.org/docs/man-pages/tshark.html) | CLI Wireshark for scripted PCAP analysis | Use for piped analysis; scriptable with display filters | Active | Yes | Linux |
| [Exiftool](https://exiftool.org/) | Metadata extraction from files | Extracts EXIF, IPTC, XMP from images, PDFs, Office docs | Active | Yes | Both |
| [Binwalk](https://github.com/ReFirmLabs/binwalk) | Binary and firmware analysis and extraction | Identifies and extracts embedded files in any binary | Active | Yes | Linux |
| [Strings](https://www.kali.org/tools/binutils/) | Extract printable strings from binary files | Quickest way to find plaintext artifacts in binary challenges | Active | Yes | Linux |
| [CyberChef](https://gchq.github.io/CyberChef/) | Data transformation: decode, decrypt, convert, analyze | Swiss army knife for encoding/decoding challenges | Active | No | Browser |
| [Yara](https://github.com/VirusTotal/yara) | Pattern matching for malware identification | Write rules to identify specific patterns in files or memory | Active | Yes | Linux |

---

# APPENDIX K: CRYPTOGRAPHY

| Tool | Coverage | Distinguishing Fact | Status | Kali | Platform |
|------|----------|---------------------|--------|------|----------|
| [Hashcat](https://hashcat.net/hashcat/) | GPU-accelerated hash cracking: 3600+ modes | Fastest hash cracker; rule-based attacks essential for realistic passwords | Active | Yes | Both |
| [John the Ripper](https://www.openwall.com/john/) | CPU hash cracking with extensive format support | Better format support than Hashcat for obscure hashes | Active | Yes | Linux |
| [CyberChef](https://gchq.github.io/CyberChef/) | Encoding, decoding, crypto operations, data analysis | Solves most easy/medium crypto CTF challenges visually | Active | No | Browser |
| [SageMath](https://www.sagemath.org/) | Mathematical computing for RSA, ECC, number theory | Required for serious crypto challenges; Python-based algebra system | Active | No | Linux |
| [PyCryptodome](https://pycryptodome.readthedocs.io/) | Python cryptographic library | Implement and test crypto attacks programmatically | Active | Manual | Linux |
| [RsaCtfTool](https://github.com/RsaCtfTool/RsaCtfTool) | RSA attack automation: Wiener, Hastad, factor | Tries all RSA attacks automatically from public key | Active | Manual | Linux |
| [FactorDB](http://factordb.com/) | Online integer factorization database | Instantly factors numbers that have been factored before | Active | No | Browser |
| [XORtool](https://github.com/hellman/xortool) | XOR cipher analysis and cracking | Detects XOR key length and decrypts multi-byte XOR | Active | Manual | Linux |
| [Quipqiup](https://quipqiup.com/) | Substitution cipher solver | Fastest classical substitution cipher solver | Active | No | Browser |
| [dcode.fr](https://www.dcode.fr/) | Classical cipher toolkit: 200+ ciphers | Largest collection of classical cipher solvers | Active | No | Browser |

---

# APPENDIX L: STEGANOGRAPHY

| Tool | Coverage | Distinguishing Fact | Status | Kali | Platform |
|------|----------|---------------------|--------|------|----------|
| [Steghide](https://github.com/StefanoDeVuono/steghide) | Hide/extract data in JPEG, BMP, WAV | Most common steg tool in CTFs; always try with no password first | Active | Yes | Linux |
| [Stegsolve](https://github.com/eugenekolo/sec-tools/tree/master/stego/stegsolve/stegsolve) | Image steganography analysis: bit planes, channels | Visualizes all bit planes; reveals hidden images | Active | Manual | Linux (Java) |
| [Zsteg](https://github.com/zed-0xff/zsteg) | PNG/BMP steg detection: LSB, RGB channels | Automatically detects and extracts common PNG steganography | Active | Manual | Linux |
| [ExifTool](https://exiftool.org/) | Metadata extraction from image files | Hidden data often stored in EXIF comments | Active | Yes | Both |
| [Binwalk](https://github.com/ReFirmLabs/binwalk) | Find embedded files in images | Images with appended data or embedded archives | Active | Yes | Linux |
| [Foremost](https://www.kali.org/tools/foremost/) | File carving from images | Extracts files hidden inside other files | Active | Yes | Linux |
| [Sonic Visualiser](https://www.sonicvisualiser.org/) | Audio analysis and spectrogram visualization | Reveals data hidden in audio spectrograms: common CTF technique | Active | No | Both |
| [Audacity](https://www.audacityteam.org/) | Audio editing and spectrogram analysis | Slow down, reverse, spectrogram view of audio | Active | Yes | Both |
| [StegOnline](https://georgeom.net/StegOnline/upload) | Browser-based image steganography analysis | No install required; good for quick checks | Active | No | Browser |
| [Outguess](https://www.kali.org/tools/outguess/) | Steganography in JPEG via DCT coefficients | Hides in statistical redundancy; less common than steghide | Active | Yes | Linux |
| [Snow](https://darkside.com.au/snow/) | Whitespace steganography in text files | Hides data in trailing whitespace; invisible in editors | Active | Manual | Linux |

---

# APPENDIX M: REVERSE ENGINEERING

| Tool | Coverage | Distinguishing Fact | Status | Kali | Platform |
|------|----------|---------------------|--------|------|----------|
| [Ghidra](https://ghidra-sre.org/) | Disassembly, decompilation, scripting | NSA-developed; free; covers x86, ARM, MIPS, PowerPC | Active | Yes | Both |
| [IDA Pro / IDA Free](https://hex-rays.com/ida-free/) | Disassembly, decompilation (x86/x64 in free) | Industry standard; IDA Free covers common architectures | Active | Yes (Free) | Both |
| [Binary Ninja](https://binary.ninja/) | Modern decompiler with Python scripting | Faster analysis than IDA for large binaries; cloud version | Active | No | Both |
| [Radare2](https://rada.re/n/) | CLI reverse engineering framework | Fully scriptable; headless operation; wide architecture support | Active | Yes | Linux |
| [Cutter](https://cutter.re/) | Radare2 GUI frontend | Makes Radare2 accessible; Ghidra decompiler integration | Active | Manual | Both |
| [GDB + pwndbg](https://github.com/pwndbg/pwndbg) | Dynamic analysis and debugging | Essential for following program execution during RE | Active | Manual | Linux |
| [x64dbg](https://x64dbg.com/) | Windows binary debugging | Standard Windows RE debugger; plugin ecosystem | Active | No | Windows |
| [dnSpy](https://github.com/dnSpy/dnSpy) | .NET assembly decompiler and debugger | Debug .NET apps at runtime; modify IL code | Active | No | Windows |
| [ILSpy](https://github.com/icsharpcode/ILSpy) | .NET decompiler | Clean .NET source decompilation | Active | Manual | Windows |
| [JADX](https://github.com/skylot/jadx) | Java and Android decompiler | Best readability for Java and Kotlin decompilation | Active | Manual | Both |
| [JD-GUI](https://java-decompiler.github.io/) | Java class file decompiler | Decompile individual .class files or JARs | Active | Manual | Both |
| [Decompiler Explorer](https://dogbolt.org/) | Browser-based multi-decompiler comparison | Runs Ghidra, Hex-Rays, Binary Ninja, RetDec simultaneously | Active | No | Browser |
| [Angr](https://angr.io/) | Symbolic execution for automated analysis | Finds flag comparison logic automatically; use for keygens | Active | Manual | Linux |
| [Z3](https://github.com/Z3Prover/z3) | SMT solver for constraint solving | Solve mathematical constraints in RE challenges automatically | Active | Manual | Linux |
| [QEMU](https://www.qemu.org/) | Cross-architecture emulation for non-x86 binaries | Run ARM, MIPS, SPARC binaries for analysis | Active | Yes | Linux |
| [FLOSS](https://github.com/mandiant/flare-floss) | Extract static and decoded strings from binaries | Extracts obfuscated strings via dynamic analysis | Active | Manual | Linux |
| [Detect-it-Easy (DIE)](https://github.com/horsicq/Detect-It-Easy) | Binary packer/protector identification | Identifies which packer/obfuscator was used before reversing | Active | Manual | Both |
| [UPX](https://upx.github.io/) | UPX packed binary decompression | upx -d binary to unpack common CTF binaries | Active | Yes | Linux |

## RE CTF Resources

| Resource | URL |
|----------|-----|
| Corelan Exploit Writing | https://www.corelan.be/index.php/articles/ |
| LiveOverflow Binary | https://youtube.com/@LiveOverflow |
| Reverse Engineering for Beginners (Yurichev) | https://beginners.re/ |
| OpenSecurityTraining2 | https://opensecuritytraining.info/ |

---

# APPENDIX N: BINARY EXPLOITATION (PWN) CTF RESOURCES

| Resource | URL |
|----------|-----|
| ROPemporium | https://ropemporium.com |
| pwn.college | https://pwn.college |
| Exploit Education | https://exploit.education |
| PWNABLE.KR | https://pwnable.kr |
| PWNABLE.TW | https://pwnable.tw |
| CTF Wiki | https://ctf-wiki.org |
| pwntools docs | https://docs.pwntools.com |

---

# APPENDIX O: WEB CHALLENGES CTF RESOURCES

| Resource | URL |
|----------|-----|
| PortSwigger Web Academy | https://portswigger.net/web-security |
| PayloadsAllTheThings | https://github.com/swisskyrepo/PayloadsAllTheThings |
| HackTricks Web | https://book.hacktricks.xyz/pentesting-web |
| OWASP Testing Guide | https://owasp.org/www-project-web-security-testing-guide/ |

---

# APPENDIX P: OSINT CHALLENGES

| Resource | URL |
|----------|-----|
| OSINT Framework | https://osintframework.com |
| Bellingcat Toolkit | https://bellingcat.gitbook.io/toolkit |
| Overpass Turbo OSM queries | https://overpass-turbo.eu |
| Google Earth | https://earth.google.com |
| Yandex Maps | https://yandex.com/maps |
| Baidu Maps | https://maps.baidu.com |
| TraceLabs | https://www.tracelabs.org |

---

# APPENDIX Q: MISCELLANEOUS CTF

| Tool | Coverage | Distinguishing Fact | Status | Kali | Platform |
|------|----------|---------------------|--------|------|----------|
| [CyberChef](https://gchq.github.io/CyberChef/) | Encoding/decoding/transformation pipeline | Solves 80% of misc encoding challenges visually | Active | No | Browser |
| [Tesseract](https://github.com/tesseract-ocr/tesseract) | OCR for text extraction from images | Extracts text from challenge images | Active | Yes | Linux |
| [pngcheck](https://www.kali.org/tools/pngcheck/) | PNG file structure validation and inspection | Reveals corrupt or hidden chunks in PNG files | Active | Yes | Linux |
| [010 Editor](https://www.sweetscape.com/010editor/) | Hex editor with binary templates | Best hex editor; templates auto-parse known file formats | Active | No | Both |
| [xxd](https://www.kali.org/tools/xxd/) | Hexdump and reverse hexdump | xxd -r reverses hex to binary | Active | Yes | Linux |
| [Python](https://python.org/) | General scripting for challenge automation | Write custom decoders, parsers, brute-forcers in minutes | Active | Yes | Both |
| [pwntools](https://github.com/Gallopsled/pwntools) | CTF framework: tubes, packing, encoding | tubes for interacting with remote challenges | Active | Yes | Linux |
| [Flask](https://flask.palletsprojects.com/) | Quick web server for callbacks and testing | Set up SSRF/SSTI callback receiver in one command | Active | Manual | Linux |

---
---

# REFERENCE

## Core Wordlists & Payload References

| Resource | URL |
|----------|-----|
| SecLists | https://github.com/danielmiessler/SecLists |
| PayloadsAllTheThings | https://github.com/swisskyrepo/PayloadsAllTheThings |
| InternalAllTheThings | https://github.com/swisskyrepo/InternalAllTheThings |
| HardwareAllTheThings | https://github.com/swisskyrepo/HardwareAllTheThings |
| FuzzDB | https://github.com/fuzzdb-project/fuzzdb |
| IntruderPayloads | https://github.com/1N3/IntruderPayloads |
| CommonSpeak2 | https://github.com/assetnote/commonspeak2-wordlists |
| OneRuleToRuleThemAll | https://github.com/NotSoSecure/password_cracking_rules |
| GTFOBins | https://gtfobins.github.io |
| LOLBAS | https://lolbas-project.github.io |
| WADComs | https://wadcoms.github.io |
| RevShells | https://www.revshells.com |
| HackTricks | https://book.hacktricks.xyz |
| Exploit-DB | https://www.exploit-db.com |
| MITRE ATT&CK | https://attack.mitre.org |
| CyberChef | https://gchq.github.io/CyberChef |
| Decompiler Explorer | https://dogbolt.org |

## Learning Platforms

| Platform | URL | Primary Use |
|----------|-----|-------------|
| Hack The Box | https://www.hackthebox.com | Machines, Pro Labs, Challenges |
| HTB Academy | https://academy.hackthebox.com | Structured learning paths |
| TryHackMe | https://tryhackme.com | Guided rooms, beginner-friendly |
| PortSwigger Academy | https://portswigger.net/web-security | Web exploitation, free, excellent |
| PentesterLab | https://pentesterlab.com | Web and code review |
| VulnHub | https://www.vulnhub.com | Offline vulnerable VMs |
| PicoCTF | https://picoctf.org | CTF challenges, beginner to advanced |
| CTFtime | https://ctftime.org | CTF event calendar and archive |
| PWNABLE.KR | https://pwnable.kr | Binary exploitation |
| ROPemporium | https://ropemporium.com | ROP chain development |
| pwn.college | https://pwn.college | Binary exploitation curriculum |
| GOAD AD Lab | https://github.com/Orange-Cyberdefense/GOAD | Active Directory lab environment |
| CloudGoat | https://github.com/RhinoSecurityLabs/cloudgoat | AWS pentesting practice |
| Awesome-Pentest | https://github.com/enaqx/awesome-pentest | Comprehensive pentest resource list |
| Awesome-Hacking | https://github.com/Hack-with-Github/Awesome-Hacking | Curated hacking resources |

---
