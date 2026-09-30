# Operator Methodology Playbook (2026)

Reference for the AI planner: canonical, actively-maintained tools a professional
reaches for at each engagement phase, loaded at build time as a static file (the
runtime AI never browses the web: it only reads this). Each tool is marked
**active** (touches/sends packets to the target) or **passive** (OSINT / no
direct interaction): load-bearing for constraints like "without hitting the
server." Authorized-testing framing throughout; no destructive/DoS/mass-target
tooling included.

## 1. Recon: passive OSINT (subdomains, ASN, emails, leaks)
- **theHarvester** (passive): emails, subdomains, hosts from search engines/PGP/Shodan-Censys aggregation: `install: pipx install theHarvester`
- **crt.sh / Certificate Transparency** (passive): enumerate issued certs to reveal subdomains, no direct target contact: `install: none (web/curl query)`
- **Shodan CLI** (passive): pre-indexed banners/service history for a target ASN or IP: `install: pipx install shodan`
- **Censys CLI** (passive): pre-indexed host/cert data, complementary coverage to Shodan: `install: pipx install censys`
- **whois / ASN lookup (bgp.he.net, ARIN/RIPE)** (passive): org-to-ASN-to-IP-range mapping before any scanning: `install: none (whois preinstalled or apt install whois)`

## 2. Subdomain / asset discovery
- **subfinder** (passive): fast passive subdomain enum from ~30+ public sources, the default first pass: `install: go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest`
- **amass** (passive by default, active with `-active`): deepest passive source coverage plus optional active DNS/brute-force enum: `install: go install -v github.com/owasp-amass/amass/v4/...@master`
- **assetfinder** (passive): quick, no-API-key subdomain/related-domain baseline: `install: go install github.com/tomnomnom/assetfinder@latest`
- **bbot** (passive/active modes): modular OSINT recon framework, correlates infra relationships beyond flat subdomain lists: `install: pipx install bbot`

## 3. DNS resolution & probing
- **dnsx** (active, low-touch): bulk resolve subdomains to live A/AAAA/CNAME records, filter dead hosts before further work: `install: go install github.com/projectdiscovery/dnsx/cmd/dnsx@latest`
- **httpx** (active, low-touch): probe resolved hosts for live HTTP(S), title/status/tech-stack fingerprinting: `install: go install github.com/projectdiscovery/httpx/cmd/httpx@latest`
- **katana** (active): headless-capable crawler for JS-heavy apps, feeds URLs into fuzzing/vuln scanning: `install: go install github.com/projectdiscovery/katana/cmd/katana@latest`

## 4. Port/service scanning
Active:
- **nmap** (active): the standard for deep service/version/OS detection and NSE scripting on a focused target set: `install: apt install nmap` (or `brew install nmap`)
- **naabu** (active): fast Go port scanner built to pipe into the rest of the ProjectDiscovery chain: `install: go install github.com/projectdiscovery/naabu/v2/cmd/naabu@latest`
- **masscan** (active): internet-scale SYN scanning across huge IP ranges, no service detection: `install: apt install masscan`
- **rustscan** (active): very fast full-range port discovery that auto-pipes results into nmap for depth: `install: brew install rustscan`

Passive:
- **Shodan** (passive): historical/pre-scanned open-port and banner data with zero packets to target: `install: pipx install shodan`
- **Censys** (passive): same category as Shodan; broader cert/host correlation: `install: pipx install censys`

## 5. Web content discovery / fuzzing
- **ffuf** (active): most versatile Go fuzzer: directories, params, vhosts, POST bodies: `install: go install github.com/ffuf/ffuf/v2@latest`
- **feroxbuster** (active): Rust recursive content discovery, strong default recursion + robots.txt parsing: `install: cargo install feroxbuster` (or `apt install feroxbuster`)
- **gobuster** (active): simple, very fast dir/DNS/vhost brute-forcer, good quick first sweep: `install: go install github.com/OJ/gobuster/v3@latest`
- **dirsearch** (active): friendly, well-maintained Python alternative for straightforward runs: `install: pipx install dirsearch`

## 6. Web vulnerability scanning
- **nuclei** (active): template-based scanner (9,000+ community templates), fastest path from recon output to known-CVE/misconfig hits; scanner output is a lead, not a finding: needs manual confirmation: `install: go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest`
- **nikto** (active): classic web-server misconfig/outdated-software scanner, good complementary sanity pass: `install: apt install nikto` (or `brew install nikto`)
- Pipeline: `subfinder | dnsx | httpx | nuclei` is the standard chain; `httpx -silent | nuclei -t <templates>` is the common web-vuln step.

## 7. Specific web exploitation
- **sqlmap** (active): canonical automated SQL-injection detection/exploitation across MySQL/PostgreSQL/MSSQL/etc.: `install: apt install sqlmap`
- **dalfox** (active): modern Go XSS scanner: reflected/stored/DOM detection, WAF-aware, pipes well into recon output: `install: go install github.com/hahwul/dalfox/v2@latest`
- **XSStrike** (active): parser-driven XSS detection with intelligent payload generation, complements Dalfox: `install: git clone https://github.com/s0md3v/XSStrike && pip install -r requirements.txt`

## 8. Credential attacks / password cracking
*Authorization-sensitive: online guessing can lock out accounts or trip alerting; only run within signed scope.*
- **hydra** (active): network logon brute-forcer across FTP/SSH/HTTP/RDP/etc., the default online cracker: `install: apt install hydra`
- **medusa** (active): thread-based parallel logon cracker, more stable against slow/flaky services: `install: apt install medusa`
- **hashcat** (offline, no target contact): GPU-accelerated hash cracking, mask/rule-based attacks: `install: brew install hashcat` (or `apt install hashcat`)
- **John the Ripper** (offline, no target contact): CPU-based hash/format auto-detection cracker, strong for archives/docs: `install: apt install john`

## 9. Network / Active Directory
*Authorization-sensitive: these tools capture credentials/traffic and can disrupt AD auth flows: lab or explicit-scope only.*
- **NetExec (nxc)** (active): the current CrackMapExec successor; SMB/WinRM/LDAP/MSSQL/RDP enum, spraying, and BloodHound collection in one tool: `install: pipx install netexec`
- **Impacket** (active): scripts behind nearly every AD attack (secretsdump, GetUserSPN, GetTGT, ntlmrelayx): `install: pipx install impacket`
- **BloodHound CE** (active collection, passive-ish graph analysis): ingests AD relationships via SharpHound (Windows) or bloodhound-ce-python (Linux), visualizes attack paths to Domain Admin: `install: docker compose -f https://ghst.ly/getbhce up` (server); `pipx install bloodhound-ce` (Linux collector)
- **Responder** (active): LLMNR/NBT-NS/mDNS poisoning for initial credential capture: `install: apt install responder`

## 10. Cloud
- **prowler** (active, read-only API calls): broadest AWS/Azure/GCP CSPM checks with compliance-framework mapping: `install: pipx install prowler`
- **trivy** (active/local): container image, IaC (Terraform), and filesystem vulnerability/misconfig scanning: `install: brew install trivy`
- **checkov** (passive, static analysis): IaC scanning (Terraform/CloudFormation/Kubernetes) pre-deployment, broadest built-in policy coverage: `install: pipx install checkov`
- Note: ScoutSuite is now read-only/archived (last release Sep 2024): prefer Prowler + Checkov + Trivy for a current stack.

## 11. Wireless
*Legally sensitive: capturing handshakes/PMKIDs or deauthing clients requires written authorization and is illegal against networks you don't own/aren't scoped to test.*
- **aircrack-ng suite** (active): airodump-ng/aireplay-ng/aircrack-ng for capture, injection, and WPA/WPA2 key recovery: `install: apt install aircrack-ng`
- **hcxdumptool / hcxtools** (active): modern PMKID/EAPOL capture with broader adapter/6GHz support: `install: apt install hcxtools hcxdumptool`
- **wifite** (active): automated wrapper that drives aircrack-ng/hcxtools for broad, minimal-interaction sweeps: `install: apt install wifite`

## 12. Vulnerability scanning: general
- **nuclei** (active): fast, template-driven, best for web/API surfaces and CI/CD-integrated scanning: `install: go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest`
- **OpenVAS / Greenbone (GVM)** (active): comprehensive authenticated host/network vulnerability scanning (160k+ NVTs), heavier and slower than Nuclei but broader infra depth: `install: apt install gvm` (or Greenbone Community Container via Docker)

## Methodology principles for the planner
- **Passive before active.** Exhaust OSINT/passive sources (crt.sh, Shodan, Censys, subfinder, amass passive) before any packet touches the target.
- **Least-intrusive first.** Resolve/probe (dnsx, httpx) before scanning (naabu/nmap) before fuzzing/exploiting (ffuf, nuclei, sqlmap).
- **Respect explicit user constraints.** "Without hitting the server" / "no active scanning" → passive-only tool set (Shodan, Censys, crt.sh, theHarvester, amass in passive mode). Never substitute an active tool when passive was requested.
- **Chain via files, not memory.** Standard pipelines pass output through files/stdout (`subfinder -silent | dnsx -silent | httpx -silent | nuclei`) so each stage is independently inspectable.
- **Scanner output is a lead, not a finding.** Especially nuclei/nikto/OpenVAS hits need manual confirmation before being reported as a vulnerability.
- **Flag authorization-sensitive categories explicitly.** Credential attacks, AD tooling, and wireless capture should be called out as requiring signed scope/rules-of-engagement: never assume blanket authorization.
- **Never fabricate a tool.** If no canonical tool fits the ask, say so rather than inventing one: this file is the closed set the planner should draw from.

## Sources (consulted 2026-07-25)
- ProjectDiscovery tool suite / recon pipeline: https://x.com/pdiscoveryio/status/1970567801023721872 ; https://projectdiscovery.io/nuclei
- Subdomain enumeration landscape 2026: https://redteamworld.com/tools/subdomain-enumeration-best-osint-tool/ ; https://www.osintteam.com/passive-subdomain-enumeration-uncovering-more-subdomains-than-subfinder-amass/
- Port scanner comparison (nmap/masscan/rustscan/naabu): https://netalith.com/blogs/cybersecurity/nmap-vs-masscan-vs-rustscan-2026-comparison ; https://s0cm0nkey.gitbook.io/port-scanner-shootout/port-scanner-shootout-part-4-the-results
- Web fuzzing tool comparison: https://github.com/six2dez/pentest-book/blob/master/others/web-fuzzers-comparision.md ; https://www.thehacker.recipes/web/recon/directory-fuzzing
- Nuclei / bug bounty 2026 methodology: https://jonathansblog.co.uk/nuclei-vulnerability-scanner ; https://github.com/Cyber-note/Full-Bug-Bounty-Hunting-Methodology-2026
- AD toolkit (NetExec/Impacket/BloodHound/Responder): https://www.redfoxsec.com/blog/netexec-for-red-teamers-the-modern-toolkit-for-active-directory-exploitation ; https://bloodhound.specterops.io/get-started/quickstart/community-edition-quickstart ; https://github.com/dirkjanm/bloodhound.py
- Cloud security tooling 2026: https://cloudaware.com/blog/cloud-security-tools/ ; https://kloudle.com/comparisons/cloudsploit-scoutsuite-prowler-free-cspm/
- Wireless pentest tools/legality 2026: https://wifiaudit.io/blog/capturing-wpa-handshakes ; https://www.redfoxsec.com/blog/wifi-pentesting-guide-2026
- Password cracking tools: https://www.webasha.com/blog/top-password-cracking-tools-for-ethical-hackers-security-professionals-complete-guide ; https://spyboy.blog/2025/09/08/password-cracking-tools-hydra-john-the-ripper-hashcat-how-they-work-safe-legal-lab-setup/
- SQLi/XSS exploitation tooling: https://github.com/hahwul/dalfox ; https://github.com/s0md3v/XSStrike
- PTES / OWASP methodology, passive-before-active principle: https://ironmoss.com/blog/ptes-penetration-testing-methodology/ ; https://mycybersecuritypath.com/cybersecurity/pentest-methodologies/
- Nuclei vs OpenVAS/Greenbone: https://secrails.com/blog/openvas-vulnerability-scanning-guide ; https://www.cyberalternatives.com/nuclei-alternatives/vs-greenbone-openvas
- theHarvester / Shodan / Censys OSINT: https://github.com/laramies/theHarvester/wiki/Installation ; https://www.decryptiondigest.com/blog/best-osint-tools-threat-intelligence
