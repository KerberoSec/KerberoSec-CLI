# 📓 TryHackMe Writeups

> Analytical writeups from my TryHackMe learning journey, focused on *reasoning process* over answer reproduction.

[![TryHackMe](https://img.shields.io/badge/TryHackMe-bluxbxllalisha-red?style=flat&logo=tryhackme&logoColor=white)](https://tryhackme.com/p/bluxbxllalisha)
![Rooms Completed](https://img.shields.io/badge/Rooms%20Completed-7-blue?style=flat)
![Rank](https://img.shields.io/badge/Rank-Top%2040%25-green?style=flat)

---

## 🎯 Purpose

These writeups are **not walkthroughs**: they are analytical documents that capture:

- The reasoning behind each approach I took
- Why certain techniques worked or failed
- Connections to real-world frameworks (MITRE ATT&CK, NIST, kill chain models)
- Lessons that transfer beyond the specific challenge

Most of my practical security work happens in my **self-built VMware lab** (Kali + Ubuntu), so TryHackMe rooms here are supplemented with hands-on lab replication where relevant.

---

## 📂 Writeup Index

| Room                                                                | Category                          | Difficulty | Key Concepts                                                    | Writeup                                               |
|---------------------------------------------------------------------|-----------------------------------|------------|-----------------------------------------------------------------|-------------------------------------------------------|
| [Cyber Kill Chain](./Cyber-Kill-Chain/)                             | Threat Intelligence / Frameworks  | Easy       | Lockheed Martin Kill Chain, ATT&CK mapping, adversary lifecycle | [📄 Read](./Cyber-Kill-Chain/README.md)               |
| [Nmap (Further Nmap)](./Further-Nmap/)                              | Network Reconnaissance            | Easy       | Advanced scan types, OS fingerprinting, NSE scripts, evasion    | [📄 Read](./Further-Nmap/README.md)                   |
| [Junior Security Analyst Intro](./Junior-Security-Analyst-Intro/)   | SOC Operations                    | Easy       | Alert triage, SOC L1 workflow, IOC identification               | [📄 Read](./Junior-Security-Analyst-Intro/README.md)  |
| [Defensive Security Intro](./Defensive-Security-Intro/)             | Blue Team                         | Easy       | Threat Intelligence, SOC, DFIR, Malware Analysis, SIEM          | [📄 Read](./Defensive-Security-Intro/README.md)       |
| [SOC Fundamentals](./SOC-Fundamentals/)                             | SOC Operations                    | Easy       | SOC team structure, monitoring, escalation processes            | [📄 Read](./SOC-Fundamentals/README.md)               |
| [Offensive Security Intro](./Offensive-Security-Intro/)             | Offensive                         | Easy       | Web application hacking, ethical hacking methodology            | [📄 Read](./Offensive-Security-Intro/README.md)       |
| [SOC Role in Blue Team](./SOC-Role-in-Blue-Team/)                   | Blue Team / SOC                   | Easy       | L1 analyst role, detection strategies, blue team ops            | [📄 Read](./SOC-Role-in-Blue-Team/README.md)          |

---

## 🔗 How These Connect to My Broader Work

These rooms reinforce concepts I apply directly in my projects:

- **Cyber Kill Chain** → informs threat modeling in [ThreatLens](https://github.com/Alisha-chaudhary/ThreatLens)
- **Nmap / Further Nmap** → techniques used in my [ssh-enum](https://github.com/Alisha-chaudhary/ssh-enum) CVE research lab
- **SOC Fundamentals + Defensive Security** → underpins SIEM rule development and detection engineering work
- **Offensive Security Intro** → complements red-team perspective applied in [BreachProbe](https://github.com/Alisha-chaudhary/BreachProbe)

---

## 🧪 Lab Environment

All hands-on work is conducted in an isolated **VMware Workstation Pro** environment:

```
Host OS     : Windows 11
VM 1        : Kali Linux (attacker machine)
VM 2        : Ubuntu (target / detection machine)
Network     : Host-only / NAT (isolated from production)
```

Where a TryHackMe room has a hands-on component I found particularly instructive, I replicate the scenario in my local lab and document the differences in behaviour and output.

---

## 📁 Writeup Structure

Each writeup folder follows this format:

```
Room-Name/
├── README.md          ← Main writeup (reasoning, findings, lessons)
├── screenshots/       ← Annotated evidence
│   ├── 01-initial-scan.png
│   └── ...
└── notes.md           ← Raw notes taken during the room (optional)
```

---

## 🏅 TryHackMe Badges

| Badge | Rarity |
|-------|--------|
| First alert closed | Rare (6.8%) |
| First scenario completed | Rare (5.4%) |
| 100% true positive rate | Rare (4.4%) |
| 3 Day Streak | Common |

---

*Part of my cybersecurity portfolio at [github.com/Alisha-chaudhary](https://github.com/Alisha-chaudhary)*
