# TryHackMe: Further Nmap

**Platform:** TryHackMe | **Category:** Network Reconnaissance & Enumeration | **Difficulty:** Beginner-Intermediate

---

## Overview

This writeup documents my hands-on work through TryHackMe's *Further Nmap* room. Rather than treating it as a checklist of commands, I approached it as a structured study of *attacker thinking*: why each scan type exists, what trade-offs it makes, and 
when a real-world engagement demands one over another. The room also served as a forcing function to understand how defenders can detect or fail to detect, each technique.

---

## Recon Mindset: Why Enumeration Comes First

The first thing this room reinforced is a principle I consider foundational: you cannot exploit what you haven't mapped. A target exposes up to 65,535 ports, and services don't always live where convention says they should.
HTTP doesn't always run on 80. SMB doesn't always announce itself on 445. In CTF environments and real penetration tests alike, careful enumeration is what separates a systematic attacker from a noisy one.

I found it useful to think about port scanning in terms of *noise tolerance*: how visible do I want to be, and what can I afford to miss?

---

## Scan Types: Understanding the Trade-offs

### TCP Connect Scan (`-sT`)

The most straightforward scan. Nmap completes a full three-way handshake (SYN → SYN/ACK → ACK) with each target port. Per **RFC 9293**, a closed port responds with a RST; a firewall-filtered port returns nothing at all.

The critical drawback I noted: full connections are routinely logged by applications. Running `-sT` against a production target is loud: the equivalent of knocking on every door and waiting for an answer. It's the fallback when you don't have sudo privileges,
but not the default choice for a careful engagement.

### SYN "Half-Open" Scan (`-sS`): Default with Sudo

This is where things get more interesting. Instead of completing the handshake, the scanner sends a SYN, receives a SYN/ACK from open ports, and then immediately fires a RST: tearing down the connection before it's ever established.

Why does this matter?

- Applications typically log connections only after the handshake completes. A SYN scan often **leaves no application-layer log**.
- Older IDS systems watch for completed handshakes as the trigger for alert generation: a half-open connection may slip through.
- It's faster: no time spent completing and gracefully tearing down thousands of connections.

The cost is root/sudo privileges, since crafting raw packets is a privileged operation. This is Nmap's default when run as root, which tells you something about its practical value.

```bash
sudo nmap -sS -p 1-5000 <target>
```

### UDP Scan (`-sU`)

UDP scanning exposed what I consider one of the most unintuitive aspects of network enumeration: the absence of a response is meaningful information, but not unambiguous information. An open UDP port often sends *nothing back*: Nmap marks it `open|filtered` 
because a firewall silence and a genuinely open port are indistinguishable without a protocol-specific probe.

Closed UDP ports, on the other hand, trigger an ICMP "port unreachable": which is how Nmap confirms them as closed.

The practical consequence: UDP scanning is slow. On a good connection, scanning the top 1000 ports can take 20+ minutes. I learned to use `--top-ports 20` to focus on the highest-value UDP services and keep scan time reasonable.

```bash
sudo nmap -sU --top-ports 20 <target>
```

### NULL, FIN, and Xmas Scans (`-sN` / `-sF` / `-sX`)

These three are grouped because they share a common logic: they exploit a specific behaviour defined in RFC 793. Compliant TCP stacks should respond with RST to closed ports when they receive malformed or flag-less packets and should send *nothing* for open ports.
This makes them useful for **firewall evasion**, since many firewalls block packets with the SYN flag specifically (blocking new connections) while letting through other TCP packets.

| Scan | Flags Set | Wireshark Appearance |
|------|-----------|----------------------|
| NULL (`-sN`) | None | Empty packet |
| FIN (`-sF`) | FIN only | Graceful close request |
| Xmas (`-sX`) | PSH + URG + FIN | "Lights up" in Wireshark |

The important caveat I learned: **Windows hosts and many Cisco devices respond with RST regardless of port state**. Against a Windows target, all three scans will report every port as closed not because the ports are closed, but because the OS doesn't follow
the RFC 793 convention. This is a concrete example of how OS fingerprinting shapes scan strategy.

> 📸 *Screenshot: Xmas scan result against the lab target showing all 999 ports as `open|filtered`. This is expected Linux RFC-compliant behaviour "no response" to malformed packets on open ports.*

### Ping Sweep (`-sn`)

Before committing to deep scanning, I used `-sn` to map which hosts are alive across a subnet. Nmap sends ICMP echo requests, plus TCP SYN to port 443 and TCP ACK/SYN to port 80, to identify active hosts without scanning their ports.

```bash
nmap -sn 172.16.0.0/16
```

Useful for the initial reconnaissance phase of a black-box assessment where the full network topology isn't known.

---

## Firewall Evasion Techniques

Understanding these techniques is as valuable for defenders designing detection rules as it is for testers trying to bypass them:

| Switch | What It Does | Why It Matters |
|--------|-------------|----------------|
| `-Pn` | Skips ICMP host discovery | Many Windows hosts block ICMP by default: without this, Nmap marks them "dead" and skips them entirely |
| `-f` | Fragments packets | IDS/firewalls doing deep packet inspection may miss fragmented payloads |
| `--mtu <n>` | Custom packet size (multiple of 8) | Finer control over fragmentation |
| `--scan-delay <ms>` | Adds inter-packet delay | Evades time-based IDS triggers |
| `--badsum` | Sends invalid checksums | Real TCP/IP stacks drop these; firewalls may respond automatically, *revealing their presence* |
| `--data-length <n>` | Appends random padding | Changes the packet size profile, avoiding signature-based detection |

The `-Pn` switch was immediately relevant in the lab: the target did not respond to ICMP pings, which would have caused Nmap to silently skip it in a default scan. Adding `-Pn` told Nmap to treat it as alive regardless and proceed with the scan.
This is a common scenario when testing Windows or hardened Linux targets.

> 📸 *Screenshot: Ping test against lab target showing no ICMP response, followed by successful Nmap scan output with `-Pn`.*

---

## Nmap Scripting Engine (NSE)

The NSE turned out to be the most practically powerful feature in the room. It's a Lua-based scripting engine that extends Nmap from a port scanner into something closer to a lightweight vulnerability assessment tool.

Scripts are organised by category:

| Category | Purpose |
|----------|---------|
| `safe` | No impact on target |
| `discovery` | Query services for additional information |
| `auth` | Test for authentication bypass |
| `brute` | Credential brute-forcing |
| `vuln` | Scan for known CVEs |
| `intrusive` | May destabilise services (avoid on production) |

### Practical Example: FTP Anonymous Login

I ran the `ftp-anon` script against the lab target's FTP service:

```bash
nmap -p 21 --script ftp-anon <target>
```

The script returned a confirmed anonymous login: a misconfiguration that, in a real engagement, would immediately escalate the assessment. Anonymous FTP access is a classic low-hanging finding.

> 📸 *Screenshot: `ftp-anon` script output confirming anonymous FTP login successful.*

### Finding Relevant Scripts Locally

Rather than relying solely on Nmap's online documentation, I practiced locating scripts on-disk:

```bash
grep "smb" /usr/share/nmap/scripts/script.db
ls -l /usr/share/nmap/scripts/*smb*
```

This surfaces `smb-os-discovery.nse`, which queries the SMB protocol to fingerprint the underlying operating system: useful for building a target profile before exploitation.

---

## Lab Scan Results

```bash
# Xmas scan: first 999 ports
sudo nmap -sX -p 1-999 <target>
# Result: All 999 ports reported as open|filtered
# Reason: Linux RFC-compliant behaviour: no response to malformed packets

# SYN scan: first 5000 ports
sudo nmap -sS -p 1-5000 <target>
# Open ports found: 5

# FTP anonymous login check
nmap -p 21 --script ftp-anon <target>
# Result: Anonymous login permitted
```

> 📸 *Screenshot: Wireshark capture during TCP Connect scan on port 80, showing full three-way handshake (SYN → SYN/ACK → ACK), confirming port 80 as open and the connection logged end-to-end.*

---

## Screenshots

Screenshots are organised under [`/screenshots`](./screenshots/) in this repository:

```
screenshots/
├── 01_icmp_no_response.png        # Ping to lab target showing ICMP blocked
├── 02_xmas_scan_result.png        # Xmas scan: 999 ports open|filtered (Linux behaviour)
├── 03_syn_scan_open_ports.png     # SYN scan: 5 open ports on first 5000
├── 04_ftp_anon_script.png         # NSE ftp-anon script: anonymous login confirmed
└── 05_wireshark_tcp_connect.png   # Wireshark: full TCP handshake on port 80
```

---

## Command Reference

```bash
# SYN scan with verbosity, full port range, save all formats
sudo nmap -sS -vv -p- -oA scan_results <target>

# Aggressive mode (OS detection + version + scripts + traceroute)
sudo nmap -A <target>

# Run all vuln category scripts
sudo nmap --script=vuln <target>

# UDP scan on most common ports
sudo nmap -sU --top-ports 20 <target>

# Ping sweep across /16
nmap -sn 172.16.0.0/16

# Timing level 5 (fastest, noisiest)
sudo nmap -T5 <target>

# FTP anonymous login check
nmap -p 21 --script ftp-anon <target>

# SMB OS discovery
nmap -p 445 --script smb-os-discovery <target>
```

---

## Key Takeaways

Working through this room deepened my understanding of a few principles that matter beyond the tooling:

**Scan selection is contextual, not arbitrary.** Choosing between TCP Connect, SYN, and UDP isn't a matter of preference: it depends on your privilege level, the target OS, the network environment, and your noise tolerance for the engagement.

**Absence of response is information.** UDP scanning in particular teaches you that "no answer" doesn't mean "closed". The `open|filtered` state is a reminder that incomplete information is still information, it shapes what you probe next.

**NSE turns enumeration into assessment.** Running `ftp-anon` against a live target takes seconds. The shift from "I see port 21 open" to "I can log in anonymously" is not trivial, it's the difference between a surface finding and an actual risk.

**Firewalls reveal themselves.** The `--badsum` switch is an elegant example of security thinking: an invalid checksum that a real TCP stack would drop silently becomes a signal if a firewall auto-responds. Understanding what *shouldn't* respond but
does is core to mapping defensive infrastructure.

---

*Part of my [TryHackMe Writeups](../) collection. I document these rooms to build disciplined habits around structured enumeration, clear technical communication, and understanding the "why" behind every tool.*
