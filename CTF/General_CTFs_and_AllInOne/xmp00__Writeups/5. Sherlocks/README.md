# HTB Sherlocks: Writeup Repository

HTB Sherlocks are defensive security and DFIR-focused investigations. Each Sherlock presents a realistic incident scenario: a compromised server, a malware infection, a suspicious log trail, and asks the investigator to answer a structured series of questions by analysing provided artefacts. Artefact types vary by scenario: EVTX logs, memory dumps, PCAP files, disk images, prefetch data, browser history, malware samples, and more.

Sherlocks serve a direct offensive purpose alongside their defensive surface value. Every technique that appears in a Sherlock: persistence mechanisms, credential access patterns, lateral movement artefacts: is exactly what those techniques look like to a defender. Working through them builds a precise understanding of what gets logged, what gets missed, and what detection gaps exist. That understanding feeds directly into OPSEC decisions and evasion methodology in active red team environments.

Writeups are organised by the platform's official difficulty rating. Each folder contains one markdown file per completed Sherlock, documenting methodology, tools used, key artefact locations, and answers with reasoning.

---

## Repository Structure

```
5. Sherlocks/
├── 1. Very Easy/
├── 2. Easy/
├── 3. Medium/
├── 4. Hard/
├── 5. Insane/
└── README.md
```

---

## Difficulty Reference

| Difficulty | Typical Duration | Complexity | Artefact Scope |
|---|---|---|---|
| Very Easy | < 1 hour | Single attack vector; high log granularity | Usually one artefact type; beginner-friendly tooling |
| Easy | 2-4 hours | Intermediate knowledge required; moderate log granularity | One to two artefact types; some cross-referencing |
| Medium | 4-8 hours | Multi-step attack chain; log granularity varies by vector | Multiple artefact types; correlation across sources required |
| Hard | 8-15 hours | Complex, multi-stage incidents; advanced tooling and analysis | Broad artefact scope; threat actor TTPs and evasion present |
| Insane | 15+ hours | Expert-level; limited log visibility; advanced malware or APT simulation | Deep forensic analysis; custom tooling often required |

---

## Writeup Format

Each writeup follows a consistent structure:

- Scenario summary
- Artefacts provided
- Tools used
- Investigation walkthrough (per-question where relevant)
- Key indicators of compromise
- MITRE ATT&CK technique references
- Offensive OPSEC note: what this scenario reveals about detection surface and evasion opportunities

---

## Tools Referenced Across Writeups

**Log analysis:** Chainsaw, Hayabusa, Event Log Explorer, evtx_dump

**Memory forensics:** Volatility 3, MemProcFS

**PCAP analysis:** Wireshark, Zeek, NetworkMiner, tshark

**Disk and filesystem:** FTK Imager, Autopsy, MFT parsers, Eric Zimmermann's toolset (MFTECmd, PECmd, Timeline Explorer)

**Malware analysis:** Detect-It-Easy, capa, PEStudio, CyberChef, olevba, FLOSS

**Timeline correlation:** Plaso/log2timeline, Timeline Explorer

**General:** jq, grep, sqlite3, python3

---

## Notes

Sherlocks are regularly added to the platform. This repository reflects completed writeups at the time of the most recent commit: it is not a complete catalogue of every available Sherlock. Writeups for active (non-retired) Sherlocks are withheld until retirement or community writeup availability, in line with HTB's content policy.

Difficulties are as assigned by HTB at time of completion. HTB occasionally re-rates Sherlocks; where a re-rating occurs after a writeup is published, the original rating is noted alongside the current one.
