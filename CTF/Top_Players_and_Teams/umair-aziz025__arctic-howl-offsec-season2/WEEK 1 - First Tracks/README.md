<div align="center">
  *[Image: Week 1: First Tracks]*

  # WEEK 1: First Tracks
  ### OffSec Arctic Howl · Tundra Realm · Season 2
</div>

---

## Challenge Overview

| Field | Details |
|-------|---------|
| **Status** | ✅ COMPLETED |
| **Category** | Malware Analysis · PCAP Forensics · Incident Response |
| **Difficulty** | Easy |
| **Event** | Arctic Howl: The Cascade Expanse: Season 2 |
| **Score** | 40 / 40 |

---

## 📋 Scenario

At the Cascade Law Archive, the IT department detected a sudden cold spike in outbound network traffic shortly after onboarding a new developer. While the firm primarily operates on Windows systems, the new hire requested a Mac laptop. The developer reports no intentional software downloads, but confirms cloning a starter Xcode project from an internal Git repository as part of onboarding.

**File Provided:** `capture.pcap` (ZIP password: `3531e680028eb73989f3a3b2ce129241`)

---

## 🎯 Questions

| # | Question |
|---|----------|
| 1 | What URL did the malware download the first stage from? What user-agent sent the request? |
| 2 | How does the C2 server obfuscate its payloads? |
| 3 | Analyze the `looz` payload. What information does it extract from the victim machine? |
| 4 | Analyze the `cozfi_xhh` payload. What information does it extract from the victim machine? |
| 5 | How does the malware attempt to infect other devices? Which payload is responsible? |
| 6 | What file contained the initial malware? How is the initial payload obfuscated? |

---

## 🔑 Key Skills

- PCAP analysis (Wireshark / tshark)
- Multi-layer encoding reversal (triple hex, 7× Base64)
- AppleScript malware analysis
- Mac forensics and macOS artifact locations
- Git hook injection detection
- C2 infrastructure mapping
- Supply chain attack investigation
- IOC extraction and detection rule authoring (YARA, Sigma, Snort)

---

## 🔍 Key Findings

| Question | Answer |
|----------|--------|
| **Q1: Initial Download** | `http://bu1knames.io/a` via `curl/8.7.1` |
| **Q2: Obfuscation** | 7× nested Base64 in AppleScript payloads |
| **Q3: looz Payload** | Exfiltrates browser, macOS version, Safari version, locale, firewall status, SIP status, CPU info → POST to `/i` |
| **Q4: cozfi_xhh** | Exfiltrates Apple Notes + Reminders, serial number → ZIP upload to `/n?s=<serial>` |
| **Q5: Propagation** | `jez` payload injects malicious pre-commit hooks into all local Git repos |
| **Q6: Initial File** | `xcassets.sh` hidden in `.xcodeproj/xcuserdata/.xcassets/`: triple hex encoded |

---

## 🧬 Attack Chain

```
Developer clones trojanized Xcode project
    ↓
xcassets.sh executes (triple hex → curl bu1knames.io/a)
    ↓
C2 delivers 7× Base64 encoded AppleScript payloads
    ↓
looz: System profiling → POST /i
seizecj: Secondary profiling
cozfi_xhh: Apple Notes + Reminders theft → POST /n
txzx_vostfdi: Persistence
jez: Git pre-commit hook injection (propagation)
    ↓
Infection spreads to all local repos → shared with other developers
```

---

## 🌐 C2 Infrastructure

**Domain:** `bu1knames.io` · **Protocol:** HTTP · **Port:** 80

| Endpoint | Purpose |
|----------|---------|
| `/a` | Initial beacon + payload download |
| `/l` | Environment data |
| `/s/<name>` | Payload distribution |
| `/i` | System info exfiltration |
| `/n` | Notes/Reminders upload |

---

## 📂 Files

| File | Description |
|------|-------------|
| [INVESTIGATION_REPORT.md](./INVESTIGATION_REPORT.md) | Full forensic analysis + all 6 question solutions |

---

## 🛠️ Tools Used

`Wireshark` · `tshark` · `xxd` · `base64` · `Python 3` · `Kali Linux VM` · `grep/sed/awk`

---

*Writeup completed: March 4, 2026 · OffSec Arctic Howl: Season 2 · Score: 6/6 correct*
