# 🎯 OSCP Machine Notes

A comprehensive collection of **27 VulnHub machine walkthroughs**: from beginner to advanced: covering the full spectrum of penetration testing techniques for OSCP preparation.

**Author:** Ankit Patidar (ANKIT48274)

---

## 📋 Machine Index

| #  | Machine | Difficulty | Focus Areas | Status |
|----|---------|-----------|-------------|--------|
| 1 | [EVM-1](EVM-1/README.md) | Beginner / Medium | WordPress, WPScan, SMB Enum, Simple Privesc | ✅ |
| 2 | [DC-6](DC6/README.md) | Beginner | WordPress, wpscan, Privilege Escalation | ✅ |
| 2 | [Escalate Linux 1](EscalateLinux1/README.md) | Medium / Advanced | 12+ Privilege Escalation Paths | ✅ |
| 3 | [FristiLeaks 1.3](FristiLeaks1_3/README.md) | Medium | Web Exploitation, Hash Cracking, Privesc | ✅ |
| 4 | [Hackme 1](Hackme1/README.md) | Beginner | SQL Injection, File Upload, SUID Privesc | ✅ |
| 5 | [Kioptrix Level 1 (#1)](Kioptrix1/README.md) | Beginner | mod_ssl/OpenSSL Exploit, Kernel Exploit | ✅ |
| 6 | [Kioptrix Level 1.1 (#2)](Kioptrix2/README.md) | Beginner | SQL Injection, MySQL UDF Exploit | ✅ |
| 7 | [Kioptrix Level 1.2 (#3)](Kioptrix3/README.md) | Beginner | LFI/RFI, Log Poisoning, SUID Misconfig | ✅ |
| 8 | [Kioptrix Level 1.3 (#4)](Kioptrix4/README.md) | Beginner | SQL Injection, Shell Escape, MySQL | ✅ |
| 9 | [Kioptrix 2014 (#5)](Kioptrix2014/README.md) | Intermediate | Multiple Web Vulns, Custom Privesc | ✅ |
| 10 | [LinSecurity](LinSecurity/README.md) | Intermediate | WordPress, Hash Cracking, Enumeration | ✅ |
| 11 | [Mr-Robot 1](MrRobot1/README.md) | Beginner → Intermediate | WordPress, SUID Abuse, Credential Cracking | ✅ |
| 12 | [Pinky's Palace v2](PinkysPalace/README.md) | Intermediate / Hard | WordPress, SQL Injection, Multiple Privesc | ✅ |
| 13 | [PwnLab Init](PwnLabInit/README.md) | Medium | LFI, Log Poisoning, Hash Cracking, Privesc | ✅ |
| 14 | [pWnOS 2.0](pWnOS2_0/README.md) | Medium | SQL Injection, Web Exploitation, Privesc | ✅ |
| 15 | [/dev/random: Scream](Scream/README.md) | Medium | Windows XP, phpMyAdmin, Hash Extraction | ✅ |
| 16 | [SickOs 1.2](SickOs1_2/README.md) | Medium | Squid Proxy, Command Injection, Privesc | ✅ |
| 17 | [SkyTower 1](SkyTower1/README.md) | Medium | SQL Injection, Web Exploitation, Automation | ✅ |
| 18 | [SolidState](SolidState/README.md) | Easy / Medium | Apache James RCE, Java Deserialization | ✅ |
| 19 | [Stapler 1](Stapler1/README.md) | Easy | Multi-Service Enumeration, Web Exploitation | ✅ |
| 20 | [Temple of Doom](TempleOfDoom/README.md) | Intermediate | Web Exploitation, Hash Cracking, Privesc | ✅ |
| 21 | [Troll 1](Troll1/README.md) | Intermediate | Steganography, FTP, Web Enumeration | ✅ |
| 22 | [Troll 2](Troll2/README.md) | Intermediate / Hard | Steganography, Deep Enumeration | ✅ |
| 23 | [Vulnix](Vulnix/README.md) | Intermediate | NFS, Password Cracking, SSH Privesc | ✅ |
| 24 | [VulnOS 2](VulnOS2/README.md) | Easy / Medium | Joomla CMS, LFI, SQL Injection, Privesc | ✅ |
| 25 | [Web Developer 1](WebDeveloper1/README.md) | Intermediate | WordPress, wpscan, tcpdump Privesc | ✅ |
| 26 | [Wintermute](Wintermute/README.md) | Intermediate | Multi-Machine, Pivoting, Password Cracking | ✅ |
| 27 | [Zico2](Zico2/README.md) | Intermediate | Joomla LFI, Database Enum, Privesc | ✅ |

---

## 🧠 Skills Coverage

| Category | Techniques |
|----------|-----------|
| **Reconnaissance** | Nmap scanning, netdiscover, arp-scan, service fingerprinting |
| **Web Enumeration** | Gobuster, dirb, ffuf, whatweb, nikto, WPScan, JoomScan |
| **Web Exploitation** | SQL Injection, LFI/RFI, Log Poisoning, Command Injection, File Upload |
| **CMS Exploitation** | WordPress (wpscan, theme editor, plugin vulns), Joomla (LFI, RCE) |
| **Credential Attacks** | Hash cracking (John/Hashcat), Hydra, Password Spraying |
| **Service Exploitation** | MySQL UDF, Apache James RCE, Squid Proxy, SMB, FTP |
| **Post-Exploitation** | Shell Upgrade (pty), Persistence, Credential Harvesting |
| **Linux Privilege Escalation** | SUID Abuse, Sudo Misconfig, Cron Jobs, Capabilities, PATH Hijacking, Kernel Exploits |
| **Windows Exploitation** | SAM/SYSTEM Extraction, NTLM Cracking, RDP |
| **Steganography** | steghide, zsteg, strings, exiftool, outguess |
| **Pivoting** | SSH Tunneling, Multi-Machine Exploitation |
| **Automation** | LinPEAS, sqlmap, Burp Suite, Metasploit |

---

## 🚀 Quick Start

Each machine folder contains a standalone `README.md` walkthrough. Navigate to any machine and follow the notes:

```bash
cd OSCP-Machine-Notes
# Pick a machine and follow along
cat Kioptrix1/README.md
```

---

## 📝 Note

- These are **personal OSCP preparation notes** documenting step-by-step exploitation paths.
- Target IP addresses are shown as `<TARGET_IP>`: substitute your own lab IP.
- Screenshots are placeholder comments: add your own during actual practice.
- Flag values shown are from community writeups; actual values may differ.

---

*M4d3 w1th ❤️ by Ankit Patidar*
