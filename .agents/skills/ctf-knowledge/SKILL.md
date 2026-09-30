---
name: ctf-knowledge
description: Autonomous offline knowledge retrieval from 30,000+ curated CTF writeups, vulnerability guides, and exploit walkthroughs (HackTheBox, TryHackMe, PicoCTF, Web, Crypto, Stego, Pwn).
---

# CTF Knowledge Retrieval

This skill enables KerberoSec to consult the pre-installed 30,000+ CTF writeup database.

## Database Location
- Global path: `~/.kerberosec/knowledge/ctf`
- Environment variable: `$KERBEROSEC_CTF_KNOWLEDGE_DIR`
- Repository fallback: `<repo>/CTF`

## Execution Procedure
1. Identify the domain:
   - Cryptography / Steganography: search in `Cryptography_and_Steganography/`
   - Active Directory / Enterprise HTB: search in `HackTheBox/`
   - Web / VulnHub / OverTheWire: search in `VulnHub_and_WebSecurity/`
   - Guided rooms / Pivot: search in `TryHackMe/`
   - General / DEF CON / High difficulty: search in `General_CTFs_and_AllInOne/` or `Top_Players_and_Teams/`

2. Search for the topic:
   Run a fast search command:
   ```bash
   grep -ril "challenge_name_or_keyword" ~/.kerberosec/knowledge/ctf/
   ```
   Or locate relevant files:
   ```bash
   find ~/.kerberosec/knowledge/ctf/ -iname "*keyword*.md"
   ```

3. Read the relevant writeup using `read_files`.
4. Provide the user with a clean, beginner-friendly explanation following the zero-prior-knowledge principle, explaining every command and value origin.
