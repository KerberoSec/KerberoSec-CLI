<div align="center">
  *[Image: Week 3: Cold Access]*

  # WEEK 3: Cold Access
  ### OffSec Arctic Howl · Tundra Realm · Season 2
</div>

---

## Challenge Overview

| Field | Details |
|-------|---------|
| **Status** | ✅ COMPLETED |
| **Category** | Browser Exploit Analysis · PCAP Forensics · Shellcode RE |
| **Difficulty** | Hard |
| **Event** | Arctic Howl: The Cascade Expanse: Season 2 |
| **Score** | 10 / 10 |

---

## Scenario

A staff member at Cascade NGO Hub reported unusual endpoint behavior shortly after checking email and opening a suspicious link. Incident artifacts included packet capture and exported logs. No obvious malware executable was dropped to disk, suggesting browser-based exploitation and in-memory payload execution.

**Files Provided:**
- `initial_access.zip`
- `initial_access.pcapng`
- `export.txt` (Wireshark export)

---

## Questions

| # | Question |
|---|----------|
| 1 | What was the initial attack vector used by the adversary, and through which protocol was it delivered? |
| 2 | What protocol has been used to notify that the exploit was successful? |
| 3 | What CVE is related to this vulnerability? |
| 4 | Which specific assembly instruction helps enable the execution of the final command string? |
| 5 | What technique has been used to deliver the final stage of the payload within the exploit? |
| 6 | Which custom or native function has been called to execute the final command in the exploit? |
| 7 | What is the full command executed at the end of the exploit? |
| 8 | What is the value of the offset added to a register to retrieve the command string? |
| 9 | Which structure/location does the exploit search to find the import/dispatch table? |
| 10 | Which two V8/DOM object types does the exploit confuse? |

---

## Key Skills

- POP3 and HTTP timeline correlation
- Browser exploit extraction from PCAP
- JavaScript and WebAssembly exploit triage
- V8 type confusion analysis (DOM bridge abuse)
- JIT spraying shellcode reconstruction
- x64 disassembly and calling convention validation
- Evidence-driven answer verification (avoid inferred/hallucinated payloads)

---

## Key Findings

| Question | Answer |
|----------|--------|
| **Q1: Initial Access** | Phishing email delivered over POP3, user opened malicious URL over HTTP (`http://34.250.131.104/`) |
| **Q2: Success Signal** | ICMP |
| **Q3: CVE** | `CVE-2024-5830` |
| **Q4: Enabling Instruction** | `mov byte ptr [rcx + 8], 0` |
| **Q5: Final Stage Technique** | JIT Spraying |
| **Q6: Execution Function** | `WinExec` |
| **Q7: Full Command** | `ping db` |
| **Q8: Command Offset** | `0x252` |
| **Q9: Dispatch Lookup Target** | `dispatch_table_from_imports` (scan from `0x40600` for marker `0x1f8d`) |
| **Q10: Object Confusion** | `DOMRect` and `AudioBuffer` |

---

## Attack Chain

```text
Victim retrieves phishing email via POP3
    ↓
Victim opens malicious URL http://34.250.131.104/ over HTTP
    ↓
Exploit page serves JS + WebAssembly payload (V8 type confusion chain)
    ↓
DOMRect/AudioBuffer confusion gives arbitrary read/write in renderer context
    ↓
Exploit scans TrustedCage dispatch_table_from_imports (marker 0x1f8d)
    ↓
JIT-sprayed shellcode resolves WinExec from module base (+0x707d0)
    ↓
Shellcode builds command pointer using offset 0x252
    ↓
mov byte ptr [rcx + 8], 0 null-terminates command string
    ↓
WinExec("ping db", 1) executes via call rax
    ↓
ICMP ping traffic confirms successful code execution
```

---

## Why This Matters

- This challenge demonstrates a modern browser exploit flow where no traditional malware binary is required on disk.
- Telemetry can look like normal browsing until object confusion and in-memory payload execution occur.
- Correct forensic process requires extracting and decoding actual exploit bytes, not guessing based on common PoCs.

---

## Files

| File | Description |
|------|-------------|
| [INVESTIGATION_REPORT.md](./INVESTIGATION_REPORT.md) | Full deep-dive forensic report with scripts, shellcode reconstruction, and disassembly |

---

## Tools Used

`Wireshark` · `PowerShell` · `Python 3` · `Capstone` · `WebAssembly triage` · `Regex extraction`

---

*Writeup completed: March 18, 2026 · OffSec Arctic Howl: Season 2 · Score: 10/10 correct*