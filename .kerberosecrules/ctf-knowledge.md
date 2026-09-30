# CTF & Security Walkthroughs Knowledge Base

## Overview
KerberoSec is equipped with an integrated, pre-indexed offline knowledge base containing 30,000+ curated cybersecurity writeups, challenge solutions, vulnerability explanations, and exploitation methodologies.

## Knowledge Base Location
- Primary Global Path: `~/.kerberosec/knowledge/ctf`
- Repository Local Path: `KerberoSec-CLI/CTF`
- Environment Variable: `$KERBEROSEC_CTF_KNOWLEDGE_DIR`

## Taxonomy & Structure
The knowledge base is organized into 7 primary domains:

1. `Cryptography_and_Steganography/`:
   - Cryptographic attacks: RSA (Wiener, Hastad, Common Modulus), AES (ECB, CBC padding oracle), ECC, lattice reductions (LLL, CVP, LWE), classical and modern ciphers.
   - Steganography: LSB extraction, PNG chunk analysis, EXIF manipulation, sound waveform forensics (.wav), and spectral analysis.

2. `General_CTFs_and_AllInOne/`:
   - Multi-discipline international competitions including DEF CON CTF, Google CTF, PlaidCTF, HITCON, and annual national CTFs.
   - Real-world vulnerability chains combining web, binary, crypto, and infrastructure misconfigurations.

3. `HackTheBox/`:
   - Enterprise and lab machine writeups covering Linux and Windows targets.
   - Active Directory exploitation: AS-REP roasting, Kerberoasting, BloodHound graph analysis, constrained/unconstrained delegation, DCSync, pass-the-hash, and token manipulation.

4. `PicoCTF/`:
   - Educational and progressive challenges covering binary reverse engineering, buffer overflows, format string bugs, SQL injection, and forensics.

5. `Top_Players_and_Teams/`:
   - High-tier methodologies, exploit scripts, and novel bypass techniques from world-ranked teams (such as perfectblue, p4-team, dicegang).

6. `TryHackMe/`:
   - Practical rooms, network pivoting, SOC monitoring, log analysis, and methodical service enumeration guides.

7. `VulnHub_and_WebSecurity/`:
   - Vulnerable VMs, OverTheWire wargames, and core web application vulnerabilities (SQLi, XSS, SSRF, SSTI, Prototype Pollution, JWT forgery, IDOR).

## How KerberoSec Uses This Knowledge Base
Whenever the user asks a question relating to:
- Solving a CTF challenge or analyzing an unfamiliar artifact
- Exploiting a specific vulnerability (such as a CVE, misconfiguration, or cryptographic weakness)
- Developing a solver script or payload
- Designing mitigation strategies based on real-world patterns

KerberoSec should:
1. Search the knowledge base for relevant writeups using `run_commands` (e.g. `grep -ril "keyword" ~/.kerberosec/knowledge/ctf` or `find`) or `search_codebase` / `read_files`.
2. Extract the underlying methodology, mathematical formula, tool command, or exploit logic.
3. Adapt the solution accurately to the user's specific scenario with clear explanations and step-by-step guidance.
