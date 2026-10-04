# Nmap Bible: From Beginner to Expert

> A practical, beginner-to-expert, single-file reference for **Nmap (Network Mapper)**: discovery, port scanning, service/version detection, OS fingerprinting, NSE, output, troubleshooting, performance, IPv6, automation, and advanced options.

[![Nmap](https://img.shields.io/badge/Nmap-Network%20Mapper-blue)](https://nmap.org/)
[![Documentation](https://img.shields.io/badge/docs-official-orange)](https://nmap.org/book/man.html)
[![NSE](https://img.shields.io/badge/NSE-611%2B%20scripts-purple)](https://nmap.org/nsedoc/)

---

## ⚠️ Legal and safety notice

Only scan systems and networks that you own or have explicit permission to test.

Nmap is a legitimate network administration and security-auditing tool, but scanning third-party infrastructure can violate laws, contracts, acceptable-use policies, or monitoring rules. Some NSE scripts can be intrusive, exploit vulnerabilities, perform brute-force checks, or cause service disruption.

For learning, use:

- Your own machines/VMs
- A deliberately vulnerable lab
- A CTF/lab platform that explicitly permits scanning
- `scanme.nmap.org` for Nmap's authorized demonstration target, while respecting its usage policy

This README intentionally explains advanced capabilities, but examples should be adapted only to authorized targets.

---

## Table of contents

- [1. What is Nmap?](#1-what-is-nmap)
- [2. Mental model](#2-mental-model)
- [3. Installation](#3-installation)
- [4. Verify installation](#4-verify-installation)
- [5. Command structure](#5-command-structure)
- [6. Target specification](#6-target-specification)
- [7. Host discovery](#7-host-discovery)
- [8. Port states](#8-port-states)
- [9. Port selection](#9-port-selection)
- [10. Port scanning techniques](#10-port-scanning-techniques)
- [11. Service and version detection](#11-service-and-version-detection)
- [12. OS detection](#12-os-detection)
- [13. Nmap scripts / NSE](#13-nmap-scripts--nse)
- [14. Timing and performance](#14-timing-and-performance)
- [15. Firewall / IDS / packet manipulation](#15-firewall--ids--packet-manipulation)
- [16. Output formats](#16-output-formats)
- [17. Runtime interaction](#17-runtime-interaction)
- [18. IPv6](#18-ipv6)
- [19. Useful real-world workflows](#19-useful-real-world-workflows)
- [20. Defensive auditing workflows](#20-defensive-auditing-workflows)
- [21. NSE categories](#21-nse-categories)
- [22. NSE discovery and script management](#22-nse-discovery-and-script-management)
- [23. Script arguments](#23-script-arguments)
- [24. Troubleshooting](#24-troubleshooting)
- [25. Performance cookbook](#25-performance-cookbook)
- [26. Reading Nmap output](#26-reading-nmap-output)
- [27. Automation](#27-automation)
- [28. Cheat sheet](#28-cheat-sheet)
- [29. Option reference](#29-option-reference)
- [30. Learning path](#30-learning-path)
- [31. Further reading](#31-further-reading)

---

# 1. What is Nmap?

**Nmap (Network Mapper)** is an open-source tool for network discovery and security auditing.

It can help answer questions such as:

- Which hosts are alive?
- Which TCP/UDP ports are reachable?
- Which services appear to be listening?
- What software/version appears to be running?
- What operating system/device type is likely?
- Which firewall/filtering behavior is visible?
- Which NSE checks provide additional information?
- How does the network topology look?

Nmap is useful for:

- Network inventory
- Troubleshooting
- Service discovery
- Security assessments
- Vulnerability validation
- Configuration auditing
- Incident-response investigation
- Lab and CTF learning
- Monitoring changes over time

Nmap's official reference guide documents the command-line interface and is the authoritative source for exact behavior.

---

# 2. Mental model

Think of an Nmap assessment as a pipeline:

```text
Targets
   │
   ▼
Host discovery
   │
   ├── host appears down ──► stop (unless -Pn)
   │
   ▼
Port scan
   │
   ▼
Port states
   │
   ▼
Service/version detection (-sV)
   │
   ▼
OS detection (-O)
   │
   ▼
NSE scripts (--script)
   │
   ▼
Traceroute (-traceroute)
   │
   ▼
Output (-oA / -oX / -oN / -oG)
```

A common mistake is jumping straight to `-A` for every task. A better approach is to start with the smallest scan that answers the question, then increase scope.

---

# 3. Installation

## Linux

Debian/Ubuntu:

```bash
sudo apt update
sudo apt install nmap
```

Fedora/RHEL-family systems:

```bash
sudo dnf install nmap
```

Arch:

```bash
sudo pacman -S nmap
```

## macOS

Using Homebrew:

```bash
brew install nmap
```

## Windows

Download the official installer from:

https://nmap.org/download.html

Windows installations commonly use **Npcap** for packet capture/raw networking functionality.

## Build from source

Use the official Nmap source and build instructions:

https://nmap.org/book/inst-source.html

---

# 4. Verify installation

```bash
nmap --version
```

or:

```bash
nmap -V
```

Show help:

```bash
nmap -h
```

Show the complete command-line reference:

```bash
man nmap
```

On many systems:

```bash
nmap --help
```

Check NSE installation:

```bash
nmap --script-help default
```

---

# 5. Command structure

General form:

```bash
nmap [Scan Type(s)] [Options] <target>
```

Examples:

```bash
nmap 192.168.1.10
nmap example.com
nmap 192.168.1.0/24
nmap -p 22,80,443 192.168.1.10
nmap -sV -p 1-1000 192.168.1.10
nmap -O 192.168.1.10
nmap -A 192.168.1.10
```

A useful way to think about a command:

```text
nmap
 ├── what to scan?       target
 ├── which hosts?        discovery options
 ├── which ports?        -p / --top-ports / -F
 ├── how to scan?        -sS / -sT / -sU / ...
 ├── identify service?   -sV
 ├── identify OS?        -O
 ├── run scripts?        -sC / --script
 ├── speed?              -T*
 └── save results?       -oA / -oX / -oN / -oG
```

---

# 6. Target specification

## Single host

```bash
nmap 192.168.1.10
```

## Hostname

```bash
nmap server.example.com
```

## Multiple targets

```bash
nmap 192.168.1.10 192.168.1.20 192.168.1.30
```

## CIDR network

```bash
nmap 192.168.1.0/24
```

A `/24` normally represents 256 IPv4 addresses.

## IP ranges

```bash
nmap 192.168.1.1-50
```

Multiple octet ranges are possible:

```bash
nmap 192.168.1-3.1-254
```

Use carefully: ranges can become very large.

## Wildcards

```bash
nmap 192.168.1.*
```

## Input file

```bash
nmap -iL targets.txt
```

Example `targets.txt`:

```text
192.168.1.10
192.168.1.20
server01.example.internal
```

## Exclude targets

```bash
nmap 192.168.1.0/24 --exclude 192.168.1.1
```

Multiple exclusions:

```bash
nmap 192.168.1.0/24 --exclude 192.168.1.1,192.168.1.254
```

Exclude from a file:

```bash
nmap 192.168.1.0/24 --excludefile exclude.txt
```

## Random targets

```bash
nmap -iR 10
```

Use this only in environments where the generated targets are explicitly authorized.

## List targets without scanning

```bash
nmap -sL 192.168.1.0/24
```

This is excellent for checking that your target expression means what you think it means.

---

# 7. Host discovery

Host discovery answers:

> "Which targets appear to be online?"

## Ping scan

```bash
nmap -sn 192.168.1.0/24
```

`-sn` performs host discovery without a normal port scan.

## Skip host discovery

```bash
nmap -Pn 192.168.1.10
```

Useful when ICMP or discovery probes are blocked.

Important: `-Pn` can make a large scan much slower because Nmap treats every specified target as potentially online.

## TCP SYN discovery

```bash
nmap -sn -PS443 192.168.1.0/24
```

Multiple ports:

```bash
nmap -sn -PS22,80,443 192.168.1.0/24
```

## TCP ACK discovery

```bash
nmap -sn -PA80,443 192.168.1.0/24
```

## ICMP echo

```bash
nmap -sn -PE 192.168.1.0/24
```

## ICMP timestamp

```bash
nmap -sn -PP 192.168.1.0/24
```

## ICMP address mask

```bash
nmap -sn -PM 192.168.1.0/24
```

## UDP discovery

```bash
nmap -sn -PU53,161 192.168.1.0/24
```

## SCTP INIT discovery

```bash
nmap -sn -PY80 192.168.1.0/24
```

## IP protocol discovery

```bash
nmap -sn -PO1,2,4 192.168.1.0/24
```

## Disable implicit ARP/ND discovery

```bash
nmap -sn --disable-arp-ping 192.168.1.0/24
```

For local Ethernet networks, Nmap normally uses ARP/IPv6 Neighbor Discovery because it is highly effective.

## Discovery reason

```bash
nmap -sn --reason 192.168.1.0/24
```

---

# 8. Port states

Nmap commonly reports:

| State | Meaning |
|---|---|
| `open` | An application appears to be listening |
| `closed` | Reachable, but no application is listening |
| `filtered` | Filtering prevents Nmap from determining open/closed |
| `unfiltered` | Reachable, but Nmap cannot determine open/closed with that scan |
| `open|filtered` | Could be open or filtered |
| `closed|filtered` | Could be closed or filtered |

### Important

`open` does **not** mean "vulnerable".

`filtered` does **not** necessarily mean "secure".

Nmap is reporting observations from a particular scan technique, port, protocol, and network path.

---

# 9. Port selection

## Default scan

```bash
nmap 192.168.1.10
```

## Specific port

```bash
nmap -p 80 192.168.1.10
```

## Multiple ports

```bash
nmap -p 22,80,443 192.168.1.10
```

## Range

```bash
nmap -p 1-1024 192.168.1.10
```

## All TCP ports

```bash
nmap -p- 192.168.1.10
```

Equivalent conceptually to:

```bash
nmap -p 1-65535 192.168.1.10
```

## Top ports

```bash
nmap --top-ports 100 192.168.1.10
```

## Fast scan

```bash
nmap -F 192.168.1.10
```

`-F` scans fewer ports than the normal default port set.

## TCP-only port list

```bash
nmap -p T:22,80,443 192.168.1.10
```

## UDP-only port list

```bash
nmap -p U:53,67,68,123,161 192.168.1.10
```

## TCP and UDP together

```bash
nmap -p T:80,443,U:53,161 192.168.1.10
```

## Service-name port specification

```bash
nmap -p http,https,ssh 192.168.1.10
```

## Exclude ports

```bash
nmap -p 1-1000 --exclude-ports 80,443 192.168.1.10
```

## Port ranges with exclusions

```bash
nmap -p 1-65535 --exclude-ports 22,25,110 192.168.1.10
```

## Scan ports in numerical order

```bash
nmap -r 192.168.1.10
```

Nmap normally randomizes the scan order.

---

# 10. Port scanning techniques

Nmap supports multiple scanning methods. Choose based on your authorized assessment objective and network conditions.

## SYN scan: `-sS`

```bash
sudo nmap -sS 192.168.1.10
```

Commonly called a "half-open" scan. It sends TCP SYN probes and analyzes responses without completing a normal TCP connection in the usual case.

Often the default privileged TCP scan.

## TCP connect scan: `-sT`

```bash
nmap -sT 192.168.1.10
```

Uses the operating system's TCP connect mechanism. Useful when raw-packet privileges are unavailable.

## UDP scan: `-sU`

```bash
sudo nmap -sU 192.168.1.10
```

UDP scanning can be significantly slower than TCP scanning because many UDP services do not respond to unsolicited probes.

Target a smaller UDP set first:

```bash
sudo nmap -sU -p 53,67,68,123,161 192.168.1.10
```

## FIN scan: `-sF`

```bash
sudo nmap -sF 192.168.1.10
```

Uses TCP FIN probes and can be useful for characterizing TCP filtering behavior on some systems.

## NULL scan: `-sN`

```bash
sudo nmap -sN 192.168.1.10
```

Sends TCP packets with no TCP flags set.

## Xmas scan: `-sX`

```bash
sudo nmap -sX 192.168.1.10
```

Sets FIN, PSH, and URG TCP flags.

## ACK scan: `-sA`

```bash
sudo nmap -sA 192.168.1.10
```

Primarily useful for mapping filtering behavior rather than determining open ports.

## Window scan: `-sW`

```bash
sudo nmap -sW 192.168.1.10
```

A variation of ACK scanning that uses TCP window information on some stacks.

## Maimon scan: `-sM`

```bash
sudo nmap -sM 192.168.1.10
```

Uses FIN/ACK behavior and is useful mainly for specialized TCP-stack analysis.

## SCTP INIT scan: `-sY`

```bash
sudo nmap -sY 192.168.1.10
```

## SCTP COOKIE-ECHO scan: `-sZ`

```bash
sudo nmap -sZ 192.168.1.10
```

## IP protocol scan: `-sO`

```bash
sudo nmap -sO 192.168.1.10
```

This identifies supported IP protocols rather than TCP/UDP listening ports.

## FTP bounce: `-b`

FTP bounce scanning is a legacy/deprecated technique and is generally not appropriate for modern assessments.

---

# 11. Service and version detection

## Basic version detection

```bash
nmap -sV 192.168.1.10
```

Nmap probes discovered services and attempts to identify the application and version.

## Light version detection

```bash
nmap -sV --version-light 192.168.1.10
```

Equivalent to low version-scan intensity.

## Maximum version detection

```bash
nmap -sV --version-all 192.168.1.10
```

## Explicit intensity

```bash
nmap -sV --version-intensity 9 192.168.1.10
```

Valid intensity range:

```text
0-9
```

Default intensity is typically `7`.

## Version tracing

```bash
nmap -sV --version-trace 192.168.1.10
```

Useful for understanding why a service was or was not identified.

## Scan all ports during version detection

```bash
nmap -sV --allports -p- 192.168.1.10
```

Use carefully because version detection across every port can be expensive.

## Service detection with selected ports

```bash
nmap -sV -p 22,25,53,80,110,443,3306 192.168.1.10
```

---

# 12. OS detection

## Basic OS detection

```bash
sudo nmap -O 192.168.1.10
```

## OS + service + scripts + traceroute

```bash
sudo nmap -A 192.168.1.10
```

`-A` enables:

- OS detection
- Version detection
- Default NSE scripts
- Traceroute

It is convenient, but broader and noisier than a focused scan.

## Aggressive OS guessing

```bash
sudo nmap -O --osscan-guess 192.168.1.10
```

Alias:

```bash
sudo nmap -O --fuzzy 192.168.1.10
```

## Limit OS detection

```bash
sudo nmap -O --osscan-limit 192.168.1.0/24
```

## Maximum OS detection retries

```bash
sudo nmap -O --max-os-tries 1 192.168.1.10
```

Lower values can improve speed at the cost of accuracy.

---

# 13. Nmap scripts / NSE

The **Nmap Scripting Engine (NSE)** extends Nmap using Lua scripts.

NSE can perform:

- Discovery
- Service enumeration
- Metadata collection
- Version enrichment
- Configuration checks
- Vulnerability checks
- Authentication-related checks
- Brute-force testing
- Some exploitation tasks

Use scripts according to their documentation and your authorization.

Official NSE documentation:

https://nmap.org/nsedoc/

## Default scripts

```bash
nmap -sC 192.168.1.10
```

Equivalent:

```bash
nmap --script=default 192.168.1.10
```

## Specific script

```bash
nmap --script http-title -p 80,443 192.168.1.10
```

## Multiple scripts

```bash
nmap --script http-title,http-headers -p 80,443 192.168.1.10
```

## Script category

```bash
nmap --script safe 192.168.1.10
```

## Vulnerability scripts

Only run against systems you are authorized to test:

```bash
nmap --script vuln 192.168.1.10
```

## Discovery scripts

```bash
nmap --script discovery 192.168.1.10
```

## Version scripts

```bash
nmap --script version 192.168.1.10
```

## Combine categories

```bash
nmap --script "safe,discovery" 192.168.1.10
```

## Script exclusion

```bash
nmap --script "default and not intrusive" 192.168.1.10
```

NSE script selection expressions support Boolean operators such as:

```text
and
or
not
```

---

# 14. Timing and performance

Nmap has dynamic timing algorithms plus timing templates.

## Timing templates

| Template | Name | General idea |
|---|---|---|
| `-T0` | paranoid | Extremely slow |
| `-T1` | sneaky | Very slow |
| `-T2` | polite | Slower / lower network load |
| `-T3` | normal | Default |
| `-T4` | aggressive | Faster on reliable networks |
| `-T5` | insane | Very aggressive; accuracy may suffer |

Example:

```bash
nmap -T4 192.168.1.0/24
```

Do not assume faster is better. Rate limits, packet loss, congestion, firewalls, and fragile devices can make aggressive scans less reliable.

## Host timeout

```bash
nmap --host-timeout 30m 192.168.1.0/24
```

## Minimum packet rate

```bash
nmap --min-rate 100 192.168.1.0/24
```

## Maximum packet rate

```bash
nmap --max-rate 500 192.168.1.0/24
```

## Scan delay

```bash
nmap --scan-delay 100ms 192.168.1.10
```

## Maximum scan delay

```bash
nmap --max-scan-delay 1s 192.168.1.10
```

## Minimum parallelism

```bash
nmap --min-parallelism 10 192.168.1.0/24
```

## Maximum parallelism

```bash
nmap --max-parallelism 100 192.168.1.0/24
```

## Maximum retries

```bash
nmap --max-retries 2 192.168.1.10
```

## Initial RTT timeout

```bash
nmap --initial-rtt-timeout 100ms 192.168.1.10
```

## Minimum RTT timeout

```bash
nmap --min-rtt-timeout 100ms 192.168.1.10
```

## Maximum RTT timeout

```bash
nmap --max-rtt-timeout 500ms 192.168.1.10
```

Use manual timing controls carefully. Nmap's adaptive timing is usually a better starting point.

---

# 15. Firewall / IDS / packet manipulation

Nmap contains options that alter packet construction and network behavior.

These are advanced features. Do not use them to bypass controls on systems without authorization.

## Fragment packets

```bash
sudo nmap -f 192.168.1.10
```

## Specify MTU

```bash
sudo nmap --mtu 32 192.168.1.10
```

The MTU value must meet Nmap's constraints and should be used only when you understand the network path.

## Decoys

```bash
sudo nmap -D RND:5 192.168.1.10
```

Decoys make traffic appear to originate from multiple source addresses.

Only use this in an authorized lab/assessment where such traffic is permitted.

## Spoof source address

```bash
sudo nmap -S <source-ip> 192.168.1.10
```

This can make responses unusable unless routing is controlled appropriately.

## Source port

```bash
sudo nmap --source-port 53 192.168.1.10
```

## Data length

```bash
sudo nmap --data-length 20 192.168.1.10
```

## Custom hexadecimal payload

```bash
sudo nmap --data 00FFAA 192.168.1.10
```

## Custom string payload

```bash
sudo nmap --data-string "NMAP" 192.168.1.10
```

## MAC address spoofing

```bash
sudo nmap --spoof-mac 0 192.168.1.10
```

Or a vendor prefix/name supported by your Nmap installation.

## Interface selection

```bash
sudo nmap -e eth0 192.168.1.10
```

## Send Ethernet frames

```bash
sudo nmap --send-eth 192.168.1.10
```

## Send IP packets

```bash
sudo nmap --send-ip 192.168.1.10
```

### Important

These features are not a magic "undetectable mode." Network devices, IDS/IPS systems, switches, routers, and endpoint telemetry can still detect scanning behavior.

---

# 16. Output formats

Never rely only on terminal output for serious assessments.

## Normal output

```bash
nmap -oN scan.txt 192.168.1.10
```

## XML

```bash
nmap -oX scan.xml 192.168.1.10
```

XML is useful for programmatic processing.

## Grepable output

```bash
nmap -oG scan.gnmap 192.168.1.10
```

This format is convenient for simple shell pipelines, although XML is usually preferable for robust automation.

## All major formats

```bash
nmap -oA scan 192.168.1.10
```

Creates:

```text
scan.nmap
scan.xml
scan.gnmap
```

## Verbose output

```bash
nmap -v 192.168.1.10
```

More verbosity:

```bash
nmap -vv 192.168.1.10
```

## Debugging

```bash
nmap -d 192.168.1.10
```

More:

```bash
nmap -dd 192.168.1.10
```

## Show reasons

```bash
nmap --reason 192.168.1.10
```

## Show only open/possibly open ports

```bash
nmap --open 192.168.1.10
```

## Packet trace

```bash
sudo nmap --packet-trace -p 22,80,443 192.168.1.10
```

This is excellent for learning how Nmap works at packet level.

## Append output

```bash
nmap --append-output -oN scan.txt 192.168.1.10
```

## Resume a stopped scan

```bash
nmap --resume scan.nmap
```

## XML stylesheet options

```bash
nmap -oX scan.xml --stylesheet <path-or-url> 192.168.1.10
```

Disable stylesheet association:

```bash
nmap -oX scan.xml --no-stylesheet 192.168.1.10
```

---

# 17. Runtime interaction

While a scan is running, Nmap supports interactive commands.

Press:

```text
v
```

to increase verbosity.

Press:

```text
V
```

to decrease verbosity.

Press:

```text
d
```

to increase debugging.

Press:

```text
D
```

to decrease debugging.

Press:

```text
p
```

to display packet information / status.

Press:

```text
?
```

to display runtime help.

Press:

```text
Enter
```

to get a status update.

Exact runtime behavior can vary by version/platform, so consult `nmap --help` and the reference guide for your installed version.

---

# 18. IPv6

Use:

```bash
nmap -6 2001:db8: 10
```

Hostname resolving to IPv6:

```bash
nmap -6 server.example.com
```

Combine with service detection:

```bash
nmap -6 -sV 2001:db8: 10
```

IPv6 discovery and packet behavior differ from IPv4. Neighbor Discovery is important on local Ethernet networks.

---

# 19. Useful real-world workflows

## Workflow 1: Is the host alive?

```bash
nmap -sn 192.168.1.10
```

## Workflow 2: Discover a subnet

```bash
nmap -sn 192.168.1.0/24 -oA discovery
```

## Workflow 3: Quick TCP assessment

```bash
nmap -T4 --top-ports 100 192.168.1.10
```

## Workflow 4: Full TCP port inventory

```bash
nmap -sS -p- -T4 192.168.1.10 -oA full-tcp
```

## Workflow 5: Identify services

```bash
nmap -sV -p 22,80,443,3306 192.168.1.10
```

## Workflow 6: Identify OS

```bash
sudo nmap -O 192.168.1.10
```

## Workflow 7: Comprehensive assessment

```bash
sudo nmap -A -T4 192.168.1.10
```

Use `-A` when you actually need its breadth.

## Workflow 8: TCP + UDP inventory

```bash
sudo nmap -sS -sU -p T:22,80,443,U:53,123,161 192.168.1.10
```

## Workflow 9: Default NSE

```bash
nmap -sC -sV 192.168.1.10
```

## Workflow 10: Save an assessment

```bash
sudo nmap -sS -sV -O -oA assessment 192.168.1.10
```

## Workflow 11: Scan a list

```bash
nmap -iL targets.txt -sV -oA fleet
```

## Workflow 12: Skip discovery

```bash
nmap -Pn -sV -p 80,443 192.168.1.10
```

## Workflow 13: Troubleshoot filtering

```bash
sudo nmap -sA -p 22,80,443 192.168.1.10
```

Then compare with:

```bash
sudo nmap -sS -p 22,80,443 192.168.1.10
```

## Workflow 14: Learn packet behavior

```bash
sudo nmap --packet-trace -p 80 192.168.1.10
```

---

# 20. Defensive auditing workflows

Nmap is especially useful when you ask a specific defensive question.

## "What is exposed?"

```bash
nmap -sS -sV --open -p- 192.168.1.10 -oA exposure
```

## "What changed since last month?"

Save both scans:

```bash
nmap -sS -sV -oA before 192.168.1.10
nmap -sS -sV -oA after 192.168.1.10
```

Use Ndiff:

```bash
ndiff before.xml after.xml
```

## "Which servers expose SSH/HTTP/HTTPS?"

```bash
nmap -p 22,80,443 --open 192.168.1.0/24 -oA services
```

## "Which services reveal versions?"

```bash
nmap -sV --open 192.168.1.0/24 -oA versions
```

## "Which hosts respond?"

```bash
nmap -sn 192.168.1.0/24 -oA hosts
```

---

# 21. NSE categories

NSE scripts are grouped into categories.

| Category | Typical purpose |
|---|---|
| `auth` | Authentication-related checks |
| `broadcast` | Broadcast-based discovery |
| `brute` | Brute-force authentication testing |
| `default` | Scripts enabled by `-sC` |
| `discovery` | Information discovery |
| `dos` | Denial-of-service testing |
| `exploit` | Exploit-related checks |
| `external` | Uses external services |
| `fuzzer` | Protocol/input fuzzing |
| `info` | Information gathering |
| `intrusive` | More intrusive checks |
| `malware` | Malware-related detection |
| `safe` | Generally safer information checks |
| `version` | Service/version enrichment |
| `vuln` | Vulnerability detection |

The category list and individual script documentation can change as Nmap evolves. Always inspect the installed version's documentation.

---

# 22. NSE discovery and script management

List scripts installed on a typical Linux system:

```bash
ls /usr/share/nmap/scripts/
```

Find a script:

```bash
find /usr/share/nmap/scripts -name 'http*'
```

Get help for a script:

```bash
nmap --script-help http-title
```

Search installed NSE documentation:

```bash
nmap --script-help "http-*"
```

List scripts by category:

```bash
nmap --script-help vuln
```

Update the NSE script database after installing or changing scripts:

```bash
sudo nmap --script-updatedb
```

### Script location

Typical locations vary by OS/package. Nmap also supports custom data directories.

---

# 23. Script arguments

Some NSE scripts accept arguments.

General form:

```bash
nmap --script <script> --script-args '<key=value,...>' <target>
```

Example structure:

```bash
nmap --script <script-name> \
     --script-args '<documented-argument=value>' \
     <authorized-target>
```

Always read the specific script's documentation first:

```bash
nmap --script-help <script-name>
```

Do not guess script arguments.

Official NSEDoc:

https://nmap.org/nsedoc/

---

# 24. Troubleshooting

## Problem: "Host seems down"

Try:

```bash
nmap -Pn <target>
```

But understand that `-Pn` disables normal host discovery.

## Problem: No ports are shown

Try a focused port scan:

```bash
nmap -p 22,80,443 <target>
```

Then:

```bash
nmap -sV -p 22,80,443 <target>
```

## Problem: UDP scan is very slow

Start small:

```bash
sudo nmap -sU -p 53,123,161 <target>
```

Avoid scanning all 65,535 UDP ports unless the assessment requires it.

## Problem: OS detection failed

Try:

```bash
sudo nmap -O <target>
```

OS fingerprinting generally works better when Nmap can observe suitable open and closed ports.

## Problem: Service is unknown

Try:

```bash
nmap -sV --version-all -p <port> <target>
```

## Problem: Need to understand packets

```bash
sudo nmap --packet-trace -p <port> <target>
```

## Problem: Need more diagnostics

```bash
nmap -vv <target>
```

or:

```bash
nmap -dd <target>
```

## Problem: Results differ between machines

Check:

- Nmap version
- OS
- privileges
- interface
- routing
- firewall
- IPv4 vs IPv6
- packet loss
- timing options
- target changes

Use:

```bash
nmap --iflist
```

to inspect interfaces and routes.

---

# 25. Performance cookbook

## Fast discovery of a /24

```bash
nmap -sn -T4 192.168.1.0/24
```

## Fast common-port check

```bash
nmap -T4 --top-ports 100 192.168.1.0/24
```

## Full TCP scan

```bash
nmap -sS -p- -T4 192.168.1.10
```

## Full TCP + version detection

```bash
nmap -sS -sV -p- -T4 192.168.1.10
```

This can take substantially longer than a port-only scan.

## Controlled rate

```bash
nmap --max-rate 200 192.168.1.0/24
```

## Avoid unnecessary work

Instead of:

```bash
nmap -A 192.168.1.0/24
```

consider:

```bash
nmap -p 22,80,443 --open -sV 192.168.1.0/24
```

if your actual question is simply "which machines expose these services?"

---

# 26. Reading Nmap output

Example:

```text
PORT     STATE  SERVICE VERSION
22/tcp   open   ssh     OpenSSH
80/tcp   open   http    Apache httpd
443/tcp  open   https   nginx
3306/tcp filtered mysql
```

Interpretation:

### `22/tcp`

- Port: `22`
- Protocol: TCP

### `open`

A service appears to be listening.

### `ssh`

Nmap's service-name guess.

### `OpenSSH`

Version detection identified the application family.

### `filtered`

Nmap cannot determine whether the port is open because filtering interferes with the scan.

### `VERSION`

Treat detected versions as evidence, not unquestionable truth. Fingerprinting is probabilistic.

---

# 27. Automation

## Bash

```bash
#!/usr/bin/env bash

TARGET="$1"

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <target>"
  exit 1
fi

nmap -sS -sV --open -oA "scan-${TARGET}" "$TARGET"
```

Use safe filenames in production; raw target strings can contain characters unsuitable for filenames.

## XML processing

Prefer XML when integrating Nmap with scripts:

```bash
nmap -sV -oX scan.xml 192.168.1.10
```

Then parse the XML with your preferred language/library.

## Python

Install a suitable XML parser/library from your environment, then:

```python
import xml.etree.ElementTree as ET

tree = ET.parse("scan.xml")
root = tree.getroot()

for host in root.findall("host"):
    address = host.find("address")
    if address is None:
        continue

    ip = address.attrib.get("addr")

    for port in host.findall("./ports/port"):
        state = port.find("state")
        service = port.find("service")

        if state is None:
            continue

        if state.attrib.get("state") == "open":
            name = service.attrib.get("name") if service is not None else "unknown"
            print(ip, port.attrib.get("portid"), name)
```

For serious automation, XML is generally more robust than scraping terminal text.

---

# 28. Cheat sheet

## Discovery

```bash
nmap -sL 192.168.1.0/24
nmap -sn 192.168.1.0/24
nmap -Pn 192.168.1.10
```

## Common TCP scans

```bash
nmap -sS 192.168.1.10
nmap -sT 192.168.1.10
nmap -sA 192.168.1.10
nmap -sF 192.168.1.10
nmap -sN 192.168.1.10
nmap -sX 192.168.1.10
```

## UDP / protocol

```bash
sudo nmap -sU 192.168.1.10
sudo nmap -sO 192.168.1.10
```

## Ports

```bash
nmap -p 80 192.168.1.10
nmap -p 22,80,443 192.168.1.10
nmap -p 1-1024 192.168.1.10
nmap -p- 192.168.1.10
nmap --top-ports 100 192.168.1.10
nmap -F 192.168.1.10
```

## Fingerprinting

```bash
nmap -sV 192.168.1.10
sudo nmap -O 192.168.1.10
sudo nmap -A 192.168.1.10
```

## NSE

```bash
nmap -sC 192.168.1.10
nmap --script default 192.168.1.10
nmap --script safe 192.168.1.10
nmap --script discovery 192.168.1.10
nmap --script vuln 192.168.1.10
```

## Output

```bash
nmap -oN scan.txt 192.168.1.10
nmap -oX scan.xml 192.168.1.10
nmap -oG scan.gnmap 192.168.1.10
nmap -oA scan 192.168.1.10
```

## Debugging

```bash
nmap -v 192.168.1.10
nmap -vv 192.168.1.10
nmap -d 192.168.1.10
sudo nmap --packet-trace -p 80 192.168.1.10
```

## IPv6

```bash
nmap -6 2001:db8: 10
```

---

# 29. Option reference

This section groups the principal Nmap command-line options by function. Nmap has a very large option set, and exact behavior can change between releases. Run `nmap --help` and consult the official reference guide for the version installed on your system.

## Target specification

| Option | Purpose |
|---|---|
| `<target>` | Hostname, IPv4/IPv6 address, range, or network |
| `-iL <file>` | Read targets from a file |
| `-iR <num>` | Choose random targets |
| `--exclude <targets>` | Exclude targets |
| `--excludefile <file>` | Read exclusions from a file |

## Host discovery

| Option | Purpose |
|---|---|
| `-sL` | List targets without scanning |
| `-sn` | Host discovery only; no port scan |
| `-Pn` | Skip host discovery |
| `-PS` | TCP SYN discovery |
| `-PA` | TCP ACK discovery |
| `-PU` | UDP discovery |
| `-PY` | SCTP INIT discovery |
| `-PE` | ICMP echo discovery |
| `-PP` | ICMP timestamp discovery |
| `-PM` | ICMP address-mask discovery |
| `-PO` | IP protocol discovery |
| `--disable-arp-ping` | Disable ARP/ND discovery |

## TCP/UDP/SCTP scanning

| Option | Purpose |
|---|---|
| `-sS` | TCP SYN scan |
| `-sT` | TCP connect scan |
| `-sU` | UDP scan |
| `-sF` | TCP FIN scan |
| `-sN` | TCP NULL scan |
| `-sX` | TCP Xmas scan |
| `-sA` | TCP ACK scan |
| `-sW` | TCP Window scan |
| `-sM` | TCP Maimon scan |
| `-sY` | SCTP INIT scan |
| `-sZ` | SCTP COOKIE-ECHO scan |
| `-sO` | IP protocol scan |
| `-b` | Legacy FTP bounce mechanism |

## Port selection

| Option | Purpose |
|---|---|
| `-p <ports>` | Specify ports |
| `-p-` | Scan all TCP ports |
| `-F` | Fast scan |
| `--top-ports <n>` | Scan N most common ports |
| `--port-ratio <ratio>` | Scan ports above frequency ratio |
| `-r` | Scan ports sequentially |
| `--exclude-ports <ports>` | Exclude ports |

## Service/version detection

| Option | Purpose |
|---|---|
| `-sV` | Service/version detection |
| `--version-intensity <0-9>` | Version probe intensity |
| `--version-light` | Lower version intensity |
| `--version-all` | Try all version probes |
| `--version-trace` | Trace version detection |
| `--allports` | Do not exclude ports from version detection |
| `-sR` | Alias for `-sV` in modern Nmap |

## OS detection

| Option | Purpose |
|---|---|
| `-O` | OS detection |
| `--osscan-limit` | Limit OS detection to promising hosts |
| `--osscan-guess` | Guess more aggressively |
| `--fuzzy` | Alias for aggressive OS guessing |
| `--max-os-tries <n>` | Maximum OS detection attempts |

## NSE

| Option | Purpose |
|---|---|
| `-sC` | Default NSE scripts |
| `--script <expr>` | Select scripts/categories |
| `--script-args <args>` | Pass script arguments |
| `--script-args-file <file>` | Read script arguments |
| `--script-trace` | Trace script activity |
| `--script-updatedb` | Update script database |
| `--script-help <expr>` | Show script help |

## Timing/performance

| Option | Purpose |
|---|---|
| `-T0` | Paranoid |
| `-T1` | Sneaky |
| `-T2` | Polite |
| `-T3` | Normal |
| `-T4` | Aggressive |
| `-T5` | Insane |
| `--min-hostgroup` | Minimum parallel host group |
| `--max-hostgroup` | Maximum parallel host group |
| `--min-parallelism` | Minimum probe parallelism |
| `--max-parallelism` | Maximum probe parallelism |
| `--min-rtt-timeout` | Minimum RTT timeout |
| `--max-rtt-timeout` | Maximum RTT timeout |
| `--initial-rtt-timeout` | Initial RTT timeout |
| `--max-retries` | Maximum probe retries |
| `--host-timeout` | Give up after host timeout |
| `--scan-delay` | Delay between probes |
| `--max-scan-delay` | Maximum scan delay |
| `--min-rate` | Minimum packet rate |
| `--max-rate` | Maximum packet rate |

## Firewall / packet controls

| Option | Purpose |
|---|---|
| `-f` | Fragment packets |
| `--mtu <value>` | Fragment using specified MTU |
| `-D <decoys>` | Use decoy addresses |
| `-S <address>` | Spoof source address |
| `-e <interface>` | Choose network interface |
| `--source-port <port>` | Use source port |
| `--data <hex>` | Append custom hex data |
| `--data-string <text>` | Append custom string data |
| `--data-length <n>` | Append random data |
| `--ip-options <options>` | Specify IP options |
| `--ttl <value>` | Set IP TTL |
| `--spoof-mac <mac/vendor>` | Spoof MAC address |
| `--badsum` | Send invalid TCP/UDP checksums |
| `--send-eth` | Send using raw Ethernet |
| `--send-ip` | Send using raw IP |

## Output

| Option | Purpose |
|---|---|
| `-oN <file>` | Normal output |
| `-oX <file>` | XML output |
| `-oG <file>` | Grepable output |
| `-oA <basename>` | Normal + XML + grepable |
| `-v` | Verbose |
| `-vv` | More verbose |
| `-d` | Debug |
| `-dd` | More debugging |
| `--reason` | Explain state reasons |
| `--open` | Show only open/possibly open ports |
| `--packet-trace` | Show packets |
| `--append-output` | Append instead of overwrite |
| `--resume <file>` | Resume aborted scan |
| `--stylesheet` | XML stylesheet |
| `--webxml` | Reference Nmap web stylesheet |
| `--no-stylesheet` | Disable XML stylesheet |
| `--noninteractive` | Disable keyboard interaction |

## Miscellaneous

| Option | Purpose |
|---|---|
| `-6` | IPv6 scanning |
| `-A` | OS + version + default scripts + traceroute |
| `--traceroute` | Trace network path |
| `--datadir <dir>` | Custom Nmap data directory |
| `--send-eth` | Send Ethernet frames |
| `--send-ip` | Send IP packets |
| `--privileged` | Assume raw-packet privileges |
| `--unprivileged` | Assume no raw-packet privileges |
| `-V` | Show Nmap version |
| `-h` | Help |

---

# 30. Learning path

## Level 1: Beginner

Learn:

```bash
nmap <target>
nmap -sn <network>
nmap -p 80 <target>
nmap -p 1-1024 <target>
nmap -sV <target>
nmap -oA scan <target>
```

Understand:

- IP addresses
- CIDR
- TCP vs UDP
- Ports
- DNS
- ICMP
- Firewalls
- `open`, `closed`, `filtered`

## Level 2: Intermediate

Learn:

```bash
-sS
-sT
-sU
-p
-F
--top-ports
-sV
-O
-sC
--script
-T4
-oX
-oA
```

Practice interpreting:

- SYN/SYN-ACK/RST
- UDP responses
- Service fingerprints
- OS fingerprints
- NSE output
- XML

## Level 3: Advanced

Learn:

```bash
--reason
--packet-trace
--version-trace
--script-trace
--min-rate
--max-rate
--min-parallelism
--max-parallelism
--scan-delay
--max-retries
-6
-sO
```

Study:

- TCP/IP behavior
- Network filtering
- Packet captures
- Routing
- Rate limiting
- IDS/IPS behavior
- IPv6

## Level 4: Expert

Study:

- Nmap source code
- NSE development
- Lua
- Nmap service probes
- OS fingerprint database
- XML output schema
- Custom NSE scripts
- Network measurement
- Scan performance
- Packet-level troubleshooting
- Responsible security assessment methodology

---

# 31. Further reading

## Official Nmap documentation

- Nmap documentation: https://nmap.org/docs.html
- Nmap Reference Guide: https://nmap.org/book/man.html
- Nmap Network Scanning book: https://nmap.org/book/
- NSE documentation: https://nmap.org/nsedoc/
- NSE script list: https://nmap.org/nsedoc/scripts/
- NSE categories: https://nmap.org/nsedoc/categories/
- Nmap download: https://nmap.org/download.html

## Related tools

Nmap also ships with companion utilities including:

- **Ncat**: networking utility
- **Nping**: packet generation/network probing
- **Ndiff**: compare Nmap XML results
- **Zenmap**: graphical Nmap interface where available

Official documentation:

https://nmap.org/book/

---

# Golden rules

1. **Know what you are authorized to scan.**
2. **Start small.**
3. **Discover hosts before scanning everything.**
4. **Choose ports based on the question you are trying to answer.**
5. **Use `-sV` when service identification matters.**
6. **Use `-O` when OS fingerprinting matters.**
7. **Use NSE deliberately; read script documentation first.**
8. **Do not assume `open` means vulnerable.**
9. **Do not assume `filtered` means secure.**
10. **Save results with `-oA` for repeatable assessments.**
11. **Prefer XML for automation.**
12. **Use packet traces to understand what Nmap is actually sending.**
13. **Do not blindly use `-A` everywhere.**
14. **Do not blindly use `-T5`; faster can mean less reliable.**
15. **Validate important findings with another source such as service configuration, packet capture, logs, or authenticated inspection.**
16. **Always check the documentation for the Nmap version you are actually running.**

---

## One-command progression

A practical progression for a single authorized target:

```bash
# 1. Basic
nmap <target>

# 2. Specific ports
nmap -p 22,80,443 <target>

# 3. Service detection
nmap -sV -p 22,80,443 <target>

# 4. Default NSE
nmap -sC -sV -p 22,80,443 <target>

# 5. Full TCP ports
sudo nmap -sS -p- <target>

# 6. Full TCP + service detection
sudo nmap -sS -sV -p- <target>

# 7. OS detection
sudo nmap -O <target>

# 8. Broad assessment
sudo nmap -A <target>

# 9. Save everything
sudo nmap -sS -sV -O -oA assessment <target>
```

---

## Final note

This README is designed as a **living Nmap reference**, not a replacement for the official manual.

Nmap evolves. Options, scripts, databases, fingerprints, and defaults can change. For exact behavior, always cross-check your installed version:

```bash
nmap --version
nmap --help
man nmap
```

Official reference:

https://nmap.org/book/man.html

---

**Nmap Bible: learn the packet, understand the result, validate the finding.**
