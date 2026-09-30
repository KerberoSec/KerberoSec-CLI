# HTB Challenges: Writeup Repository

HTB Challenges are focused, single-technique tasks that isolate specific offensive security concepts across eleven categories. Unlike Machines, which require a full engagement lifecycle, each Challenge targets one technique or vulnerability class in a controlled, contained environment. They are the most efficient mechanism on the platform for drilling precision across specific skill domains, and the fastest way to fill gaps identified after a failed machine or Pro Lab attempt.

Writeups are organised by category, matching the folder structure of this repository. Each folder contains one markdown file per completed Challenge. The approach across all categories follows a three-phase difficulty progression: Easy challenges build foundational technique; Medium challenges introduce practical exploitation and tool adaptation; Hard and Insane challenges require independent research, custom scripting, and techniques that rarely appear in structured training material.

---

## Repository Structure

```
1. Challenges/
├── 1. OSINT/
├── 2. Coding/
├── 3. Web/
├── 4. Reversing/
├── 5. AI - ML/
├── 6. Forensics/
├── 7. Crypto/
├── 8. pwn/
├── 9. Mobile/
├── 10. Hardware/
├── 11. Misc/
└── README.md
```

---

## Category Reference

| Category | Folder | Difficulty Range | Key Skills |
|---|---|---|---|
| OSINT | 1. OSINT | Easy → Medium | Passive reconnaissance, metadata extraction, social footprinting, geolocation, OSINT framework tooling |
| Coding & Scripting | 2. Coding | Easy → Medium | Scripting for exploitation, automation, algorithm implementation, protocol interaction |
| Web Application | 3. Web | Easy → Insane | XSS, SQLi, SSRF, IDOR, deserialization, business logic flaws, prototype pollution, GraphQL, OAuth abuse |
| Reverse Engineering | 4. Reversing | Easy → Insane | Static analysis, dynamic analysis, assembly reading, deobfuscation, packer analysis, symbolic execution |
| AI & Machine Learning | 5. AI: ML | Easy → Hard | Adversarial inputs, model extraction, prompt injection, ML pipeline abuse |
| Forensics | 6. Forensics | Easy → Insane | File carving, memory analysis, PCAP analysis, steganography, timeline reconstruction, malware triage |
| Cryptography | 7. Crypto | Easy → Insane | Classical ciphers, RSA attacks, padding oracle, block cipher modes, side-channel attacks, lattice methods |
| Binary Exploitation | 8. pwn | Medium → Insane | Stack overflows, format strings, ret2libc, ROP chains, heap exploitation, GOT overwrite, kernel pwn |
| Mobile | 9. Mobile | Easy → Medium | APK analysis, Android traffic interception, certificate pinning bypass, mobile API exploitation |
| Hardware | 10. Hardware | Easy → Medium | Firmware analysis, UART/JTAG interaction, logic analysis, embedded system exploitation |
| Miscellaneous | 11. Misc | Easy → Hard | Mixed category; technique chaining across domains not fitting a single classification |

---

## Recommended Progression

Start with OSINT, Coding, and the easier end of Web and Forensics to build foundational tool familiarity and reconnaissance discipline. Move into Reversing, Cryptography, and intermediate Web once static analysis and basic exploit development are comfortable. pwn and advanced Cryptography should follow after binary fundamentals are solid: attempting heap exploitation without stack overflow fluency wastes significantly more time than the sequential approach costs.

AI-ML and Hardware can be approached in parallel with Medium-tier work in other categories; they are self-contained domains with limited prerequisite overlap. Misc challenges are best approached last within each difficulty tier, as they frequently combine techniques from multiple categories.

---

## Writeup Format

Each writeup follows a consistent structure:

- Challenge name, category, difficulty, and point value
- Initial observations and reconnaissance approach
- Vulnerability or technique identification
- Exploitation steps with relevant commands and tool output
- Flag retrieval
- Post-completion notes: alternative approaches from community writeup review
- Key takeaway: one technique or tool worth retaining

---

## Tools Referenced Across Writeups

**OSINT:** theHarvester, Maltego, Shodan, Recon-ng, Exiftool, Spiderfoot, OSINT Framework

**Web:** Burp Suite, ffuf, SQLMap, Caido, custom Python requests scripts

**Reversing:** Ghidra, IDA Free, x64dbg, Cutter, strings, ltrace, strace, Detect-It-Easy

**Forensics:** Volatility 3, Autopsy, Wireshark, Zeek, Foremost, Binwalk, Exiftool, CyberChef

**Cryptography:** SageMath, CyberChef, Hashcat, custom Python (PyCryptodome, gmpy2)

**pwn:** pwntools, GDB with pwndbg, ROPgadget, checksec, one_gadget

**Mobile:** jadx, apktool, Frida, objection, mitmproxy

**Hardware:** Binwalk, Firmwalker, logic analyser tooling, minicom

---

## Notes

Writeups for active challenges are published upon HTB retirement or when HTB designates the content as publicly discussable. Difficulty ratings reflect the platform's classification at time of completion. Point values are noted per writeup as they reflect difficulty at time of solve: HTB occasionally adjusts ratings as the community completes challenges.
