# CTF Toolkit: curated links & short notes

A living list of useful online tools, libraries, and platforms for CTFs (crypto, web, pwn, reverse, forensics, recon, etc.). Designed to be beginner friendly while still useful for seasoned players.

---

## 🚩 General / Helpers
- **CyberChef**: Swiss-army knife for transforms/decoding.  
  https://gchq.github.io/CyberChef/  
- **Hex Editor (in-browser)**: quick hex edits.  
  https://hexed.it/  
- **RapidTables: Converters (ASCII/Hex/Dec/Bin/Base64)**  
  https://www.rapidtables.com/convert/number/ascii-hex-bin-dec-converter.html  
- **XOR Calculator**: quick XOR encode/decode.  
  https://xor.pw/  
- **Regex test (regex101)**: build & test regexes interactively.  
  https://regex101.com/ / https://www.debuggex.com/

---

## 🔐 Cryptography
- **dCode**: huge collection of ciphers & decoders.  
  https://www.dcode.fr/  
- **QuipQiUp**: substitution cipher solver.  
  https://quipqiup.com/  
- **RsaCtfTool**: practical RSA attack toolkit.  
  https://github.com/RsaCtfTool/RsaCtfTool  
- **FactorDB**: integer factorization DB (check factors quickly).  
  https://factordb.com/  
- **SageMathCell**: quick number theory & symbolic math in browser.  
  https://sagecell.sagemath.org/  
- **Morse Translator**: online morse encoder/decoder.  
  https://morsecode.world/international/translator.html  
- **Big Numbers Calculator**: arbitrary big-int calc in browser.  
  http://www.javascripter.net/math/calculators/100digitbigintcalculator.htm  
- **Hash Identifier (Kali tool)**: fingerprint hash types.  
  https://www.kali.org/tools/hash-identifier/

---

## 🧠 Recon / OSINT / Enumeration
- **nmap**: network/service discovery.  
  https://nmap.org/  
- **ffuf**: fast web fuzzer for directories & virtual hosts.  
  https://github.com/ffuf/ffuf  
- **gobuster**: directory & DNS bruteforce alternative.  
  https://github.com/OJ/gobuster  
- **amass**: subdomain enumeration & graphing.  
  https://github.com/OWASP/Amass  
- **theHarvester**: email/host recon from public sources.  
  https://github.com/laramies/theHarvester

---

## 🕸️ Web / Application security
- **Burp Suite**: intercepting proxy + web security tools.  
  https://portswigger.net/burp  
- **OWASP ZAP**: automated web scanner (Burp alternative).  
  https://www.zaproxy.org/  
- **Nikto**: web server scanner.  
  https://cirt.net/Nikto2  
- **CSP Evaluator**: evaluate/validate Content Security Policies.  
  https://csp-evaluator.withgoogle.com/  
- **Traversal Archives**: sample archives for directory-traversal practice.  
  https://github.com/jwilk/traversal-archives

---

## 🧩 Pwn / Exploitation / Binary
- **pwntools**: Python CTF/pwn toolkit (sockets, ROP helpers).  
  https://github.com/Gallopsled/pwntools  
- **ROPgadget** / **ropper**: find ROP gadgets.  
  https://github.com/JonathanSalwan/ROPgadget  
- **pwndbg / gef / peda**: gdb enhancements for exploit dev.  
  https://github.com/pwndbg/pwndbg  
- **radare2 / Cutter**: RE framework (CLI + Cutter GUI).  
  https://rada.re/n/  
- **ghidra**: decompiler & reverse engineering suite.  
  https://github.com/NationalSecurityAgency/ghidra  
- **qemu / binfmt_misc**: run foreign-arch binaries locally.

---

## 🔁 Reverse / Forensics / Stego
- **Binwalk**: extract embedded files from firmware/images.  
  https://github.com/ReFirmLabs/binwalk  
- **strings (binutils)**: grep printable strings from binaries.  
- **foremost / scalpel**: file carving from images/memory dumps.  
  https://github.com/jaimegonzalez/foremost  
- **exiftool**: read/write metadata (images, docs).  
  https://exiftool.org/  
- **stegsolve / zsteg**: image steg analysis & extraction.  
  stegsolve: search jars; zsteg: https://github.com/zed-0xff/zsteg  
- **steghide**: classic stego embed/extract tool.  
  https://www.kali.org/tools/steghide/

---

## 🔒 Password cracking / Hashes
- **hashcat**: GPU accelerated password cracking.  
  https://hashcat.net/hashcat/  
- **John the Ripper**: versatile password cracker.  
  https://www.openwall.com/john/  
- **rockyou.txt** and other wordlists: commonly used wordlists (Kali, SecLists).

---

## 🧾 Collections / Cheatsheets / Payloads
- **PayloadsAllTheThings**: payloads, bypasses, checklist.  
  https://github.com/swisskyrepo/PayloadsAllTheThings  
- **Awesome CTF**: curated resources & writeups.  
  https://github.com/apsdehal/awesome-ctf

---

## 🧭 CTF platforms / practice & writeups
- **CTFtime**: calendar & team rankings of CTF events.  
  https://ctftime.org/  
- **OverTheWire**: hands-on wargames for beginners.  
  https://overthewire.org/wargames/  
- **picoCTF**: beginner CTF with learning materials.  
  https://picoctf.org/  
- **HackTheBox**: VM labs & challenge boxes.  
  https://www.hackthebox.com/  
- **TryHackMe**: guided rooms, beginner friendly.  
  https://tryhackme.com/  
- **Root-Me**: many categories & challenges.  
  https://www.root-me.org/

---

## 🔗 Useful GitHub repos (quick list)
- https://github.com/Gallopsled/pwntools  
- https://github.com/ffuf/ffuf  
- https://github.com/NationalSecurityAgency/ghidra  
- https://github.com/ReFirmLabs/binwalk  
- https://github.com/RsaCtfTool/RsaCtfTool  
- https://github.com/OWASP/Amass  
- https://github.com/swisskyrepo/PayloadsAllTheThings

---

## 📝 Example “Getting started”: common one-liners
```bash
# Basic network scan + service detection
nmap -sC -sV -oA scan <target>

# Quick file strings
strings binary | less

# Extract firmware/image contents
binwalk -e firmware.bin

# Run a local Python pwntools script
python3 exploit.py

# Bruteforce directories
ffuf -w /path/to/wordlist -u https://target/FUZZ
