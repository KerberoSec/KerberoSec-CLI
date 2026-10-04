---
name: recon
description: "CTF reconnaissance skill. Fast OSINT, flag format detection, challenge identification. Use for CTF challenges, binary analysis, and crypto challenges. Triggers: 'ctf', 'ctf recon', 'challenge', 'pwn', 'crypto', 'rev', 'forensics'."
version: 1.0.0
phase: ["recon"]
category: ["exploitation"]
tools: ["pwntools", "curl", "grep", "jq", "hashcat", "john"]
tags: ["ctf", "osint", "binary", "crypto", "flag"]
---

# CTF Reconnaissance

You are performing **CTF reconnaissance**. Your goal is to quickly identify the challenge type, flag format, and attack vectors.

## Tool Usage

**Check tool availability first:**
```bash
where.exe pwntools 2>&1 || echo "[MISSING] pwntools - Install: pip3 install pwntools"
where.exe curl 2>&1 || echo "[MISSING] curl"
```

### Priority Order

1. **pwntools**: Binary analysis, exploit development
2. **curl**: Web challenge probing
3. **grep/jq**: Output parsing, flag extraction
4. **hashcat/john**: Hash identification and cracking

### Commands

```bash
# Web challenge recon
curl -sk "https://target/page" -D - | Select-String "Set-Cookie|Location|Server"

# Binary analysis with pwntools
python3 -c "from pwn import *; e = ELF('./binary'); print(e.checksec())"

# Hash identification
python3 -c "import hashlib; print(hashlib.algorithms_available)"

# Flag format detection
grep -r "FLAG\|CTF\|ctf{" . --include="*.txt" --include="*.html"
```

## CTF Challenge Types

| Type | Indicators | Tools |
|------|------------|-------|
| **Web** | HTTP, forms, cookies, JWT | curl, burpsuite, sqlmap |
| **Pwn/Binary** | ELF, binary, buffer overflow | pwntools, gdb |
| **Crypto** | Encrypted, base64, RSA, AES | python3, hashcat |
| **Forensics** | pcap, memory dump, disk image | volatility, wireshark, autopsy |
| **Rev** | Binary, obfuscated, packed | radare2, angr, pwntools |
| **Misc** | Stego, encoding, OSINT | stegsolve, exiftool |

## Flag Format Detection

Common flag formats:
- `FLAG{...}`, `CTF{...}`, `ctf{...}`
- `flag{...}`, `FLAG-...`, `CTF-...`

```bash
grep -rE "(FLAG|CTF|flag|ctf)\{[A-Za-z0-9_]+\}" . --include="*.txt" --include="*.html" --include="*.php"
```

## Output

Save to `.omop/ctf/<challenge-name>/`:
- `recon.txt`: Initial recon findings
- `flag.txt`: Extracted flags
- `challenge-type.txt`: Identified challenge type

## Next Phase

After recon, proceed to **ctf-exploit** for exploitation.
