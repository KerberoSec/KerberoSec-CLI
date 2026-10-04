# Hack The Box: Offensive Security Portfolio

[HTB](https://app.hackthebox.com/profile/019caac6-3992-7146-9da0-0e5ee8fb5d63) | [LinkedIn](https://www.linkedin.com/in/rjurkevich/)

UPD: 13.05.2026: Current rank: Global: 448 | Ireland: 2

Goal: Global: TOP100 | Ireland: TOP2

---

After years split across multiple platforms and the blue team/red team divide, this repository represents a deliberate consolidation. One platform. One discipline. The decision was to stop distributing effort and go deep: exclusively into offensive security, exclusively on Hack The Box, with no artificial ceiling on what gets targeted or owned. The focus is red team: web exploitation, binary analysis, Active Directory, cloud, hardware, cryptography, and the full depth of every domain encountered at Hard and Insane difficulty.

This repository is a structured, cumulative record of that work: Machines, Challenges, Pro Labs, Fortresses, and Sherlocks. Each section maintains its own dedicated README documenting progression rationale, skill mappings, and HTB Academy preparation guidance. Writeups document how problems were approached and solved: attack chain, tooling decisions, key techniques, and alternative paths identified post-completion.

---

## Repository Structure

```
Writeups/
├── 1. Challenges/
│   ├── 1. OSINT/
│   ├── 2. Coding/
│   ├── 3. Web/
│   ├── 4. Reversing/
│   ├── 5. AI - ML/
│   ├── 6. Forensics/
│   ├── 7. Crypto/
│   ├── 8. pwn/
│   ├── 9. Mobile/
│   ├── 10. Hardware/
│   ├── 11. Misc/
│   └── README.md
├── 2. Machines/
│   ├── 1. Linux/
│   │   ├── 1. Easy/
│   │   ├── 2. Medium/
│   │   ├── 3. Hard/
│   │   └── 4. Insane/
│   ├── 2. Windows/
│   │   ├── 1. Easy/
│   │   ├── 2. Medium/
│   │   ├── 3. Hard/
│   │   └── 4. Insane/
│   └── README.md
├── 3. Pro Labs/
│   ├── 1. Full Pro Labs/
│   │   ├── 1. Entry Level/
│   │   ├── 2. Intermediate Level/
│   │   ├── 3. Advanced Level/
│   │   └── 4. Expert Level/
│   ├── 2. Mini Pro Labs/
│   │   ├── 1. Entry Level/
│   │   ├── 2. Intermediate Level/
│   │   └── 3. Advanced Level/
│   └── README.md
├── 4. Fortress/
│   ├── 1. Jet.md
│   ├── 2. Akerva.md
│   ├── 3. Context.md
│   ├── 4. Faraday.md
│   ├── 5. Synacktiv.md
│   ├── 6. AWS.md
│   └── README.md
├── 5. Sherlocks/
│   ├── 1. Very Easy/
│   ├── 2. Easy/
│   ├── 3. Medium/
│   ├── 4. Hard/
│   ├── 5. Insane/
│   └── README.md
└── README.md
```

---

## Sections

### 1. Challenges

Focused, single-technique tasks across eleven categories, approached through a three-phase difficulty progression: Easy (foundation), Medium (applied exploitation), Hard and Insane (research and custom tooling). Individual writeup files live inside each category folder.

| Category | Folder |
|---|---|
| OSINT | 1. OSINT |
| Coding & Scripting | 2. Coding |
| Web Application | 3. Web |
| Reverse Engineering | 4. Reversing |
| AI & Machine Learning | 5. AI: ML |
| Forensics | 6. Forensics |
| Cryptography | 7. Crypto |
| Binary Exploitation | 8. pwn |
| Mobile | 9. Mobile |
| Hardware | 10. Hardware |
| Miscellaneous | 11. Misc |

---

### 2. Machines

Full end-to-end machine writeups organised by operating system and difficulty tier. Each writeup covers the complete attack chain: enumeration methodology, initial access, privilege escalation, and key technique notes. Alternative approaches identified through post-completion review are noted where they differ meaningfully from the primary path.

- **Linux**: Easy / Medium / Hard / Insane
- **Windows**: Easy / Medium / Hard / Insane

---

### 3. Pro Labs
Enterprise-scale network lab writeups organised by lab type and difficulty tier. Full Pro Labs are documented with engagement-style summaries covering attack chain narrative, pivoting approach, and techniques applied at each stage. Mini Pro Labs are documented per-lab with focused attack chain and technique notes. Step-by-step solutions are withheld in accordance with platform policy.

- **Full Pro Labs**: Entry Level / Intermediate Level / Advanced Level / Expert Level
- **Mini Pro Labs**: Entry Level / Intermediate Level / Advanced Level

---

### 4. Fortress

Six partner-built, multi-flag environments, each documented as a standalone writeup file. Each file covers the reconnaissance approach, flag chain narrative, partner context, and post-completion findings.

| # | Fortress | Partner |
|---|---|---|
| 1 | Jet | HTB Community |
| 2 | Akerva | Akerva |
| 3 | Context | Context IS / Accenture Security |
| 4 | Faraday | Faraday Security |
| 5 | Synacktiv | Synacktiv |
| 6 | AWS | Amazon Web Services |

---

### 5. Sherlocks

Blue team and DFIR investigation writeups organised by difficulty tier. Each writeup documents scenario context, artefacts provided, investigative methodology, tools used, findings with reasoning, and MITRE ATT&CK technique references. Sherlocks serve a dual purpose: building DFIR fluency and informing offensive OPSEC by exposing exactly what defenders observe.

- **Tiers**: Very Easy / Easy / Medium / Hard / Insane

---

## Writeup Policy

Writeups are personal technical notes produced after independent completion. They document attack chains, tooling decisions, and key techniques: not step-by-step replication guides. Content for active, non-retired machines and recently released material is withheld until HTB designates it publicly discussable. Community writeups are reviewed after every completion; where a meaningfully different approach is identified, it is noted with attribution. This repository contains no platform credentials, VPN configurations, or any material in violation of the HTB Terms of Service.

---

## HTB Academy Alignment

All progression decisions align with the [HTB Academy Penetration Tester Job Role Path (CPTS)](https://academy.hackthebox.com/path/preview/penetration-tester). Individual section READMEs map each activity category to the relevant Academy modules as preparation guidance. The Academy path provides structured theory; the platform environments documented here are its applied expression.

---

## Methodology

**Enumerate before exploiting.** No exploitation attempt is made before the attack surface is fully mapped.

**Manual before automated.** Vulnerability identification is always manual first. Automated tooling is used for confirmation and execution, not discovery.

**Understand before moving on.** A completed environment that is not fully understood is revisited after the relevant Academy module: a solve without comprehension is not progress.

**Document dead ends.** Failed approaches are recorded in Hard and Insane writeups. The elimination process is as instructive as the solution.

**Review alternative paths.** Community writeups are consulted after every completion. Meaningfully different approaches are noted and, where feasible, attempted independently.

**Apply offensive skills to defensive understanding.** Sherlocks are treated as direct inputs to offensive OPSEC: understanding what defenders observe informs evasion and tradecraft decisions in active environments.

---

## Platform Context

All content documented here is completed on the [Hack The Box](https://www.hackthebox.com) platform under its standard Terms of Service. No techniques or tooling documented here are applied outside of authorised environments.

---

*Last updated: April 2026. Active and recently released content is excluded from published writeups pending retirement.*
