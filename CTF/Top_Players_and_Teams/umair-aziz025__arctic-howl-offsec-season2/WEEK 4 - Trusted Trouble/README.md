<div align="center">
  *[Image: Week 4: Trusted Trouble]*

  # WEEK 4: Trusted Trouble
  ### OffSec Arctic Howl · MegacorpOne Insider Threat (PCAP Forensics)
</div>

---

## Challenge Overview

| Field | Details |
|-------|---------|
| **Status** | ✅ COMPLETED |
| **Category** | PCAP Forensics · Mail Forensics · Insider Threat Analysis |
| **Difficulty** | Hard |
| **Event** | Arctic Howl: The Cascade Expanse: Season 2 |
| **Score** | 8 / 8 |

---

## Scenario

Megacorp One hired new employees and then detected suspicious data leakage. No obvious endpoint breakage was observed, but suspicious activity appeared across MAIL and CLIENT captures.

**Files Provided:** multi-folder PCAP dataset (`MAIL`, `CLIENT5`, `CLIENT10`, `CLIENT12`, `CLIENT13`)

---

## Questions

| # | Question |
|---|----------|
| 1 | How many people applied to work at MegacorpOne? |
| 2 | Out of total applicants, whose application was accepted? |
| 3 | What is the name of the hiring manager? |
| 4 | Which employee had VPN issues? |
| 5 | Which employee(s) were violating company policy? |
| 6 | What public IP was used for exfiltration? |
| 7 | What was exfiltrated (include sensitive data)? |
| 8 | Which employee was the insider threat? |

---

## Key Skills

- Large PCAP triage and anomaly reduction
- SMTP stream reconstruction and timeline correlation
- Internal HTTP upload extraction from multipart POST data
- 7z payload recovery and decryption workflow
- SQLite artifact inspection for credential confirmation
- Evidence-to-identity mapping in insider investigations

---

## Key Findings

| Question | Answer |
|----------|--------|
| **Q1: Applicants** | `9` |
| **Q2: Accepted** | `fernanda.ribeiro, samuel.adu, min-jun.park` |
| **Q3: Hiring Manager** | `tatiana.petrov` |
| **Q4: VPN Issues** | `fernanda.ribeiro` |
| **Q5: Policy Violations** | `min-jun.park, samuel.adu` |
| **Q6: Exfil Public IP** | `203.98.112.47` |
| **Q7: Exfiltrated Data** | `sensitive.db` (SQLite) with `Robin Schwartz / 5up3r5Tr0NgP@$$w0rd!` |
| **Q8: Insider Threat** | `samuel.adu` |

---

## Attack Chain

```text
Mass applicant email workflow via SMTP (resume.pdf submissions)
    ↓
Hiring manager sends onboarding instructions to accepted users
    ↓
Client hostnames and VPN IP collection campaign
    ↓
Insider-side traffic from CLIENT10 to external endpoint 203.98.112.47 (WireGuard)
    ↓
Internal HTTP staging to 10.10.0.254 with multipart uploads (note1, note2, note3)
    ↓
note2 leaks password hint: "Don't forget P@$$w0rd!"
    ↓
note3 is actually encrypted 7z payload
    ↓
Recovered sensitive.db (SQLite users table)
    ↓
Exfiltrated credential confirmed: Robin Schwartz / 5up3r5Tr0NgP@$$w0rd!
```

---

## Files

| File | Description |
|------|-------------|
| [INVESTIGATION_REPORT.md](./INVESTIGATION_REPORT.md) | Full forensic report, evidence chain, and validation commands |

---

## Tools Used

`Wireshark` · `tshark` · `Python 3` · `7-Zip` · `SQLite3` · `PowerShell`

---

*Writeup completed: March 25, 2026 · OffSec Arctic Howl: Season 2 · Score: 8/8 correct*

