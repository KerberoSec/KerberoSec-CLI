# Module 5: Network Security

> **Portfolio scope:** Detailed notes on passive reconnaissance, active reconnaissance, Nmap host discovery and port scanning, service enumeration, and protocol-aware analysis. Commands are for authorized lab ranges only.

## Module coverage

This module developed a structured network-assessment workflow:

1. collect passive information;
2. identify live hosts;
3. discover TCP and UDP services;
4. fingerprint protocols and versions;
5. enumerate each service using protocol knowledge;
6. validate vulnerabilities safely;
7. preserve output for reporting and comparison.

The main lesson is that enumeration quality determines the rest of the assessment. A fast scan that misses hosts or mislabels services can produce incorrect conclusions.

---

## 1. Passive reconnaissance

Passive reconnaissance uses information that can be collected without directly probing the target’s systems.

### Sources

- DNS records;
- certificate transparency logs;
- public IP allocation and ASN information;
- search engines;
- public documentation and job postings;
- source-code repositories;
- archived websites;
- metadata intentionally supplied by the client;
- cloud and SaaS inventory provided for the engagement.

### DNS review

Useful record types:

- `A` / `AAAA`: IPv4/IPv6 addresses;
- `CNAME`: aliases and third-party dependencies;
- `MX`: mail infrastructure;
- `TXT`: SPF, verification records, and service metadata;
- `NS`: authoritative name servers;
- `SOA`: zone authority and timing information;
- `SRV`: service discovery in some environments.

Authorized examples:

```bash
dig example.test A
dig example.test MX
dig example.test TXT
dig _service._tcp.example.test SRV
```

Passive findings are hypotheses. A certificate name or old DNS record does not prove the service is current or in scope.

---

## 2. Active reconnaissance

Active reconnaissance sends traffic to the target environment.

### Common activities

- ICMP and TCP host discovery;
- port scanning;
- banner grabbing;
- protocol-specific queries;
- TLS certificate inspection;
- service and operating-system fingerprinting;
- route and latency observation.

Because active reconnaissance can trigger alerts or create load, it should follow approved source addresses, rates, and timing.

---

## 3. Host discovery with Nmap

Nmap first attempts to determine which hosts are up unless discovery is disabled.

### Local network discovery

On a local Ethernet segment, ARP discovery is highly reliable:

```bash
sudo nmap -sn 10.10.20.0/24 -oA evidence/discovery-local
```

### Routed network discovery

ICMP may be blocked, so combine probes where permitted:

```bash
sudo nmap -sn \
  -PE -PP \
  -PS22,80,443 \
  -PA53,3389 \
  10.10.30.0/24 \
  -oA evidence/discovery-routed
```

Options vary by privileges and platform. The purpose is to solicit different response types rather than relying on one “ping.”

### Disabling discovery

```bash
sudo nmap -Pn 10.10.30.25
```

`-Pn` treats the host as online and scans it directly. It is useful when discovery probes are filtered, but scanning every address in a large range with `-Pn` can be slow and noisy.

### List scan

```bash
nmap -sL 10.10.30.0/24
```

This lists targets and may perform name resolution without scanning target ports.

---

## 4. TCP port scanning

### SYN scan

```bash
sudo nmap -sS -p- --min-rate 500 10.10.30.25 -oA evidence/tcp-all
```

A SYN scan sends an initial SYN and interprets responses:

- SYN/ACK: open;
- RST: closed;
- no response or ICMP filtering message: filtered/unknown.

Rate options must be chosen carefully for the environment. Aggressive rates can cause packet loss, false negatives, or service impact.

### TCP connect scan

```bash
nmap -sT -p 22,80,443 10.10.30.25
```

A connect scan uses the operating system’s full TCP connection. It works without raw-packet privileges but is more visible in application logs.

### Targeted scan

After broad discovery, repeat a focused scan with version detection and scripts:

```bash
sudo nmap -sS -sV \
  -p 22,80,443 \
  --script default,safe \
  10.10.30.25 \
  -oA evidence/tcp-focused
```

Do not run broad script categories blindly. Read script documentation and consider side effects.

### Port states

- **open:** application accepts connections;
- **closed:** host reachable but no service listening;
- **filtered:** packet filtering prevents a conclusion;
- **unfiltered:** reachable but open/closed not determined by that scan;
- **open|filtered:** no response distinguishes the two;
- **closed|filtered:** rare ambiguous result.

A filtered result does not prove the host is down.

---

## 5. UDP scanning

UDP has no handshake, so scanning is slower and results are frequently ambiguous.

```bash
sudo nmap -sU --top-ports 100 10.10.30.25 -oA evidence/udp-top100
```

Interpretation:

- UDP response: open;
- ICMP port unreachable: closed;
- no response: open|filtered;
- other ICMP errors: filtered.

Version detection and protocol-specific probes can clarify results:

```bash
sudo nmap -sU -sV -p 53,67,68,69,123,161,500 10.10.30.25
```

Important UDP services may include DNS, DHCP, TFTP, NTP, SNMP, IPsec/IKE, and application-specific protocols.

---

## 6. Service and version detection

```bash
nmap -sV --version-all -p 22,80,443 10.10.30.25
```

Nmap probes the service and compares responses with its database.

### Limitations

- banners may be hidden or changed;
- reverse proxies mask backend technology;
- vendor patches may be backported;
- non-standard services may run on expected ports;
- TLS may require SNI;
- service detection can trigger application behavior.

Version output is a lead, not proof of vulnerability.

### TLS inspection

```bash
openssl s_client -connect 10.10.30.25:443 -servername app.example.test -showcerts
```

Inspect:

- subject alternative names;
- issuer and chain;
- validity;
- protocol and cipher;
- hostname match;
- alternate names revealing additional assets.

---

## 7. Nmap Scripting Engine (NSE)

NSE scripts support discovery, enumeration, versioning, and vulnerability checks.

### Script categories

- `default`;
- `safe`;
- `discovery`;
- `version`;
- `auth`;
- `vuln`;
- `intrusive`;
- `brute`;
- others.

Read help before use:

```bash
nmap --script-help http-title
nmap --script-help smb-enum-shares
```

Targeted example:

```bash
nmap -p 80,443 --script http-title,http-headers,http-methods 10.10.30.25
```

Scripts labeled `safe` can still send unusual requests. Authorization and service sensitivity remain relevant.

---

## 8. Protocol-aware enumeration

An open port is the start of analysis.

### HTTP/HTTPS

- virtual hosts;
- titles and headers;
- methods;
- redirects;
- cookies;
- application and API routes;
- TLS configuration;
- authentication mechanisms.

```bash
curl -i http://10.10.30.25/
curl -k -I https://app.example.test/
```

Use `-k` only in a lab to inspect a service with an untrusted certificate; real clients should validate certificates.

### DNS

- authoritative behavior;
- recursion;
- zone-transfer configuration;
- internal names exposed externally;
- version leakage where applicable.

```bash
dig @10.10.30.25 example.test SOA
dig @10.10.30.25 example.test AXFR
```

Attempt zone transfer only when authorized. A refusal is normal and expected.

### SMB

- dialect/version;
- signing requirements;
- share enumeration;
- anonymous access;
- domain/workgroup information;
- file permissions.

```bash
nmap -p445 --script smb-protocols,smb2-security-mode 10.10.30.25
smbclient -L //10.10.30.25/ -N
```

Do not attempt credential guessing unless explicitly permitted.

### SSH

- version and algorithms;
- host keys;
- authentication methods;
- weak or obsolete algorithms;
- exposed administrative access.

```bash
nmap -p22 --script ssh2-enum-algos,ssh-hostkey 10.10.30.25
```

### FTP

- anonymous access;
- TLS support;
- writable directories;
- banner/version;
- separation from executable web paths.

```bash
nmap -p21 --script ftp-anon,ftp-syst 10.10.30.25
```

### SNMP

SNMPv1/v2c uses community strings and lacks modern confidentiality. SNMPv3 supports authentication and privacy.

```bash
snmpwalk -v2c -c <authorized-community> 10.10.30.25 1.3.6.1.2.1
```

SNMP can reveal interfaces, routes, processes, and device metadata. Treat community strings as credentials.

### SMTP

- banner and TLS;
- supported extensions;
- relay behavior;
- user enumeration protections;
- authentication requirements.

```bash
openssl s_client -starttls smtp -connect mail.example.test:25
```

### Database services

Determine whether the database is intended to be remotely exposed, whether TLS and authentication are required, and whether the service is restricted to application networks.

---

## 9. Scan planning and accuracy

### Two-pass workflow

**Pass 1: discovery:** identify hosts and open ports efficiently.

**Pass 2: focused enumeration:** run version detection and targeted scripts against known ports.

This reduces unnecessary probing and produces cleaner evidence.

### Timing

Nmap timing templates range from cautious to aggressive. Higher speed can cause:

- packet loss;
- missed services;
- intrusion-prevention blocking;
- application stress;
- unreliable latency assumptions.

Choose timing based on network quality and engagement rules rather than habit.

### Name resolution

Use `-n` to disable reverse DNS when it causes delay or data leakage:

```bash
nmap -n -sS -p 80,443 10.10.30.25
```

Alternatively, name resolution may provide useful asset context when authorized.

### Output preservation

```bash
nmap -sV -oA evidence/app-server 10.10.30.25
```

Save:

- exact command;
- Nmap version;
- date/time;
- source system/IP;
- raw output;
- interpretation and follow-up.

XML output can be parsed for comparison across scans.

---

## 10. Example assessment sequence

Target: one authorized lab host.

```bash
# 1. Confirm target and discovery
sudo nmap -sn 10.10.30.25 -oA evidence/01-discovery

# 2. Scan all TCP ports
sudo nmap -sS -p- 10.10.30.25 -oA evidence/02-tcp-all

# 3. Focus on discovered ports
sudo nmap -sS -sV -p22,80,445 10.10.30.25 -oA evidence/03-services

# 4. Run protocol-specific safe enumeration
sudo nmap -p22 --script ssh2-enum-algos,ssh-hostkey 10.10.30.25 -oA evidence/04-ssh
sudo nmap -p80 --script http-title,http-headers,http-methods 10.10.30.25 -oA evidence/05-http
sudo nmap -p445 --script smb-protocols,smb2-security-mode 10.10.30.25 -oA evidence/06-smb
```

Then continue with manual protocol analysis rather than assuming the scan output is a finding.

---

## 11. Reporting network findings

Weak finding:

> Port 22 is open.

Stronger finding:

> The SSH management service is reachable from the user network. The service permits password authentication and is not restricted to the approved management subnet. This increases credential-attack and lateral-movement exposure. Restrict TCP/22 to the management network, require key-based or centrally controlled authentication, and monitor failed and successful administrative sign-ins.

The report explains why the exposure matters and how to fix it.

---

## Common mistakes

- scanning with `-Pn` across huge ranges unnecessarily;
- assuming ICMP failure means the host is down;
- running every NSE vulnerability script without review;
- treating banner version as proof of vulnerability;
- ignoring UDP;
- scanning too quickly and missing results;
- failing to account for virtual hosts and SNI;
- reporting open ports without business context;
- not saving raw output;
- attempting credential attacks without specific authorization.

---

## Portfolio takeaway

I learned to separate host discovery, port discovery, service fingerprinting, and protocol enumeration into distinct steps. Nmap is most effective when the scan strategy is adapted to network behavior and every result is validated using protocol knowledge.

## References

- TryHackMe Jr Penetration Tester (Legacy): https://tryhackme.com/path/outline/jrpenetrationtester-legacy
- Official Nmap reference guide: https://nmap.org/book/man.html
- Nmap host discovery: https://nmap.org/book/man-host-discovery.html
- Nmap port-scanning techniques: https://nmap.org/book/man-port-scanning-techniques.html
