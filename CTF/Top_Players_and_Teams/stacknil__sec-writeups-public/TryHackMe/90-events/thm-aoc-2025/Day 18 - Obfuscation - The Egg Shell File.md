---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, obfuscation]
source: TryHackMe: Advent of Cyber 2025 Day 18
platform: tryhackme
room: Advent of Cyber 2025 Day 18: Obfuscation: The Egg Shell File
slug: aoc-2025-day-18-obfuscation-the-egg-shell-file
path: TryHackMe/90-events/thm-aoc-2025/Day 18: Obfuscation: The Egg Shell File.md
topic: 90-events
domain: [forensics, blueteam]
skills: [triage, powershell]
artifacts: [lab-notes]
sanitized: true
---

# Advent of Cyber 2025 Day 18: Obfuscation: The Egg Shell File

## Summary

This lab is a *defender-side* exercise on reversing common **obfuscation** techniques used in phishing and script-based malware. You’ll practice:

* Recognizing “gibberish” patterns (Base64, ROT, XOR, hashes)
* Using **CyberChef** ("Cyber Swiss Army Knife") to *deobfuscate* and *re-obfuscate* data
* Editing and safely executing a PowerShell script (`SantaStealer.ps1`) inside an isolated VM

Core idea: obfuscation **raises investigation cost** and **evades naive string matching**, but it’s usually reversible once you identify the transform chain.

---

## Key Concepts

### Obfuscation vs Encoding vs Encryption

* **Obfuscation**: intentionally makes data/code harder to read/scan. Goal = evade/slow analysis.
* **Encoding**: represent data in a transport-safe format (compatibility/usability), e.g., Base64.
* **Encryption**: confidentiality with a key + algorithm; without the key, recovery should be computationally hard.

Mental model:

```
1| Obfuscation: readability ↓, reversibility often easy
2| Encoding: transport compatibility ↑, reversibility deterministic
3| Encryption: confidentiality ↑, reversibility requires key
```

### Common techniques in this lab

* **ROT1 / ROT13**: Caesar-style character shifts (quick visual detection).
* **Base64**: “printable” ASCII representation; often ends with `=` or `==`.
* **XOR (exclusive OR)**: bytewise transform with a key; has the “self-inverse” property.
* **MD5 hash**: one-way function; reversal is usually via lookup (rainbow tables / crack databases).

### XOR “self-inverse” property (why deobfuscation works)

If `C = P XOR K`, then `P = C XOR K`.

So deobfuscation often means: **apply XOR again with the same key**.

---

### CyberChef Quickstart

CyberChef UI mental mapping:

* **Operations** (left): searchable function library
* **Recipe** (middle): pipeline (chained transforms)
* **Input** (top-right): paste data here
* **Output** (bottom-right): results appear here

Tip: You can **toggle** steps on/off to debug a pipeline.

Useful operations for this day:

* `From Base64` / `To Base64`
* `XOR`
* `To Hex` / `From Hex`
* `ROT13`, `ROT47`
* `Magic` (auto-tries common decoders; treat as a *hint*, not truth)

---

### Practical Workflow (SantaStealer.ps1)

**Safety note**: run unknown scripts only in a disposable VM/sandbox. Treat the script as potentially hostile.

#### Part 1: Deobfuscate C2 URL (Base64)

Goal: decode `$C2B64` and paste decoded URL into `$C2`, then run script to get **flag 1**.

Steps:

1. Copy the value of `$C2B64`.
2. In CyberChef: `From Base64`.
3. Copy output URL into script variable `$C2`.
4. Save file.
5. Run script from PowerShell.

PowerShell execution (example):

```powershell
1| cd .\Desktop\
2| .\SantaStealer.ps1
```

Expected behavior (high-level): the script performs checks, downloads/validates something, then prints a token-like flag.

#### Part 2: Obfuscate API key (XOR single-byte 0x37 → Hex)

Goal: obfuscate a plaintext API key using XOR key `0x37`, convert result to hex, paste into `$ObfApiKey`, then rerun script for **flag 2**.

CyberChef recipe:

```text
1| Input: API_KEY_REDACTED
2| XOR
3|   Key: 37
4|   Key type: Hex
5| To Hex
6|   Delimiter: None
```

Then paste the resulting hex string into:

```powershell
1| $ObfApiKey = "API_KEY_REDACTED"
```

Rerun:

```powershell
1| cd .\Desktop\
2| .\SantaStealer.ps1
```

---

### Pattern Recognition Cheat Sheet

Use these “fast heuristics” before you brute-force recipes.

| Looks like…                                  | Likely technique | Why                     | First attempt                 |
| -------------------------------------------- | ---------------- | ----------------------- | ----------------------------- |
| Mostly `A-Z a-z 0-9 + /` with `=` padding    | Base64           | Transport-safe encoding | `From Base64`                 |
| Readable text but letters “shifted”          | ROT1/ROT13       | Simple substitution     | `ROT13` (or try ROT variants) |
| Same length as plaintext but full of symbols | XOR              | Bytewise scrambling     | `XOR` with candidate key      |
| 32 hex chars                                 | MD5              | fixed-size hash         | hash lookup / crack DB        |

---

### Layered Obfuscation (Order Matters)

Attackers often chain transforms. Reverse by applying operations **in the opposite order**.

Example chain:

```
1| plaintext
2|   -> gzip compress
3|   -> XOR(key)
4|   -> Base64
5| ciphertext
```

Deobfuscation:

```
1| Base64 decode
2| XOR(key)
3| gzip decompress
4| plaintext
```

---

### Pitfalls & Debugging (things that waste time)

* **Wrong key format**: `0x37` must be provided as hex byte (`37`) with key type **Hex**.
* **Hex delimiter**: `To Hex` may insert spaces; set delimiter to **None** if the script expects a continuous string.
* **Invisible whitespace**: copy/paste may include newline; validate with length checks.
* **Base64 padding**: missing `=` can break decoding; some tools auto-fix, some don’t.
* **Script not saved**: edit in the IDE but forget Ctrl+S, then you rerun old logic.
* **Wrong working directory**: PowerShell runs from current directory; `cd` to Desktop first.
* **Execution policy**: Windows may block running `.ps1` by default; in a lab VM you can adjust policy *temporarily* (prefer process scope) rather than disabling system protections globally.

---

### Defensive Takeaways

* **String matching alone is fragile**: obfuscation breaks naive signatures.
* Prefer **behavioral detection** (process + network + script block logging) and **deobfuscation at ingest**.
* Store both **raw** and **normalized** variants of suspicious artifacts (raw script, decoded URLs, extracted keys) for repeatable analysis.
* Document your recipe like a reproducible experiment: *Input → Operations → Output*.

---

## Glossary (EN → 中文)

* Obfuscation（混淆）
* Deobfuscation（去混淆 / 反混淆）
* Encoding（编码）
* Encryption（加密）
* Base64（Base64 编码）
* XOR / Exclusive OR（异或）
* Single-byte key（单字节密钥）
* Hex / Hexadecimal（十六进制）
* Hash（哈希）
* MD5（MD5 摘要算法）
* Execution policy（执行策略）
* Script block logging（脚本块日志）

---

## References

* RFC 4648: Base-N Encodings (Base64)
* RFC 1321: MD5 Message-Digest Algorithm
* GCHQ CyberChef (project + online demo)
* Microsoft Learn: PowerShell `about_Scripts`, `about_Signing`
* TryHackMe: Advent of Cyber (context)
