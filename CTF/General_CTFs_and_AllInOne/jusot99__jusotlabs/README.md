# **JusotLabs**

### _A Curated Arsenal for Ethical Hacking & Offensive Security_

*[Image: JusotLabs]*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Welcome to **JusotLabs**, a hand-curated arsenal for ethical hackers, penetration testers, and security researchers. This is where ideas meet action, a place to **learn, experiment, and sharpen real-world hacking skills**.

> [!WARNING]
> **JusotLabs is for education and ethical research only.** Using these tools outside of authorized environments is prohibited.

## What's Inside

- 🛠️ **[Security Tools](scripts/)** → DNS recon, port scanning, ARP spoofing, MITM, threat detection, DDoS simulation, HTTP probing, system hardening, and privilege escalation enumeration.
- 📝 **[CTF Writeups](writeups/)** → Detailed walkthroughs for Hack The Box, OverTheWire, and VulnHub machines.
- 📚 **[Reading List](reading-list.md)** → Curated book and resource references to deepen your knowledge.

> [!NOTE]
> **All tools are Linux-compatible.** Some scripts require root privileges ➜ check the documentation before running.

## Quick Start

> [!TIP]
> Clone the repo, install dependencies, and **start with `dnsinfo.py`** for a quick reconnaissance demo.

```bash
pip install -r requirements.txt
python3 scripts/dnsinfo.py example.com
```

## Tools

| Script | Description |
|--------|-------------|
| `dnsinfo.py` | Advanced DNS recon & subdomain enumeration |
| `nlg.py` | Network security auditing platform with MITM |
| `ghostmitm.py` | LAN man-in-the-middle attack tool |
| `netbreaker.py` | DDoS simulation (UDP/ICMP/SYN/Slowloris) |
| `portscanner.py` | Multi-threaded TCP port scanner |
| `secforce.py` | Real-time network threat detector |
| `semok.py` | Layer 7 HTTP load testing tool |
| `codeprobe.py` | HTTP status code analyzer |
| `harden-linux.sh` | Linux system hardening script |
| `root-hunter.sh` | Privilege escalation recon script |
| [`specter.ps1`](scripts/specter.ps1) | Windows post-exploitation recon |

---

> [!TIP]
> **Star the repo** ⭐ if you find it useful ➜ it helps others discover it too.

Whether you're **studying, experimenting, or building your portfolio**, JusotLabs is your **launchpad for mastery**. Stay curious, stay sharp, and never stop learning.
