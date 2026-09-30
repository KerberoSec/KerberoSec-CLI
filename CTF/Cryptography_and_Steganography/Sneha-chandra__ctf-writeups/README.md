# CTF Writeups 🚩

> My collection of Capture The Flag (CTF) competition writeups: documenting challenges, thought processes, tools used, and solutions across cybersecurity competitions.

**Competitions included:**
- 🥇 **Capture the Ops CTF '24**: 1st Place (VRGD & GDG Club, Amity University)
- 🥇 **PATN '24**: 1st Place (Present Around the Network, IET Delhi Local Network)

---

## About Me

I'm Sneha Chandra: cybersecurity researcher, IET President at Amity University, and B.Tech CSE graduate (Amity University, 2025). Previously interned at NVIDIA as a Technical Program Manager. CTFs are where I keep my offensive skills sharp alongside my defensive research work.

**Research:** Published ransomware detection research in Springer Nature (ICEIL 2024, SCOPUS).  
**Links:** [LinkedIn](https://linkedin.com/in/sneha-chandra-euphoria) · [GitHub](https://github.com/sneha-chandra) · [Portfolio](https://sneha-chandra.github.io/portfolio)

---

## Repository Structure

```
ctf-writeups/
├── capture-the-ops-2024/       # 🥇 1st Place: Amity University CTF
│   ├── README.md               # Competition overview
│   ├── web-flag-hunter.md      # Web exploitation challenge
│   ├── crypto-caesar-break.md  # Cryptography challenge
│   └── forensics-hidden-data.md # Digital forensics challenge
├── patn-2024/                  # 🥇 1st Place: IET Delhi (PATN)
│   └── README.md               # Presentation + competition notes
├── resources/
│   └── tools.md                # CTF toolkit reference
└── README.md
```

---

## Writeup Index

### 🥇 Capture the Ops CTF '24: 1st Place

| Challenge | Category | Difficulty | Tools Used |
|---|---|---|---|
| [Flag Hunter](./capture-the-ops-2024/web-flag-hunter.md) | Web Exploitation | Medium | Burp Suite, curl, DevTools |
| [Caesar's Secret](./capture-the-ops-2024/crypto-caesar-break.md) | Cryptography | Easy | Python, frequency analysis |
| [Hidden in Plain Sight](./capture-the-ops-2024/forensics-hidden-data.md) | Digital Forensics | Medium | Binwalk, strings, steghide |

### 🥇 PATN '24: 1st Place (IET Delhi)

| Item | Description |
|---|---|
| [Competition Overview](./patn-2024/README.md) | PATN format, topic, judging criteria, and key takeaways |

---

## Categories I Play

| Category | Description | My Comfort Level |
|---|---|---|
| Web Exploitation | SQL injection, XSS, IDOR, path traversal | ⭐⭐⭐⭐ |
| Cryptography | Caesar, Vigenère, RSA, hash cracking | ⭐⭐⭐⭐ |
| Digital Forensics | File carving, steganography, metadata | ⭐⭐⭐ |
| OSINT | Open-source intelligence gathering | ⭐⭐⭐⭐ |
| Reverse Engineering | Binary analysis, disassembly | ⭐⭐ |
| Network Analysis | Wireshark, pcap analysis, Nmap | ⭐⭐⭐⭐ |

---

## Tools & Setup

See [resources/tools.md](./resources/tools.md) for my full CTF toolkit.

**Quick setup:**
```bash
# Install common CTF tools on Kali Linux / Ubuntu
sudo apt install binwalk steghide exiftool nmap wireshark netcat john hashcat

# Python crypto tools
pip install pycryptodome requests beautifulsoup4

# Web tools
sudo apt install burpsuite sqlmap gobuster
```

---

## Key Takeaways

Things I've learned that apply directly to my research:

1. **Entropy is everything**: many forensics challenges involve detecting anomalous data in files, the same principle I apply in ransomware detection research
2. **Enumeration before exploitation**: slow down, map the attack surface before jumping in
3. **Network analysis**: packet captures often hold the answer; Wireshark is indispensable
4. **Automation pays off**: writing quick Python scripts during CTFs is faster than manual analysis for pattern-heavy challenges

---

*Writeups are posted after competition windows close to respect other participants.*
