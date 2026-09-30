# Common CTF Challenges

Reference notes, commands, and ready-to-use snippets for Capture the Flag competitions. Keep it locally, search fast, and copy what you need mid-challenge.

## Table of Contents

- [Categories](#categories)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Contributing](#contributing)

## Categories

| Category | Description | Scripts | Status |
|----------|-------------|:-------:|:------:|
| [crypto/](./crypto/) | Ciphers, RSA attacks, encoding schemes | 13 | Complete |
| [pwn/](./pwn/) | Binary exploitation, ROP, format strings | 22 | Complete |
| [web/](./web/) | SQLi, XSS, SSTI, SSRF, XXE, CSRF | 8 | Complete |
| [reverse/](./reverse/) | Angr, Z3, GDB scripts, Frida hooks | 12 | Complete |
| [forensics/](./forensics/) | Disk, memory, PCAP analysis | 4 | Complete |
| [network/](./network/) | ARP spoofing, MITM, Scapy | 1 | Complete |
| [mobile/](./mobile/) | APK reversing, Frida, SSL pinning bypass | - | Complete |
| [crack/](./crack/) | Hashcat, John, password cracking | - | Complete |
| [cloud/](./cloud/) | AWS S3, Firebase exploitation | - | Complete |
| [osint/](./osint/) | Username hunting, EXIF, Google dorking | - | Complete |
| [web3/](./web3/) | Smart contract vulnerabilities | - | Complete |
| [steganography/](./steganography/) | Image/audio steg tools | - | Complete |
| [esolangs/](./esolangs/) | Brainfuck, Malbolge, Whitespace | - | Complete |
| [misc/](./misc/) | QR recovery, DTMF, Git extraction | - | Complete |
| [machine/](./machine/) | Linux privesc, enumeration | - | Complete |
| [jailbreak/](./jailbreak/) | Sandbox escapes, restricted shells | - | Complete |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ByamB4/Common-CTF-Challenges.git
cd Common-CTF-Challenges

# Search for keywords
grep -r "pickle" .
grep -r "sql" web/

# Or use ripgrep (faster)
rg -n "pickle"
rg -n "sql" web/
```

## Usage

### During a CTF

1. **Identify the category**: Jump into the matching folder
2. **Scan for payloads**: Check README.md for quick references
3. **Search for specific techniques**: Use `grep` or `rg`
4. **Run scripts if needed**: Most are standalone Python

### Search Examples

```bash
# Find RSA attack scripts
rg "wiener" crypto/

# Find format string payloads
rg "fmtstr" pwn/

# Find SQL injection techniques
rg "union" web/sqli/

# Find all Python scripts
find . -name "*.py" -type f
```

### Running Scripts

```bash
# Example: RSA attack
python crypto/asymmetric-cipher/src/wiener_attack.py

# Example: Blind SQLi
python web/sqli/src/mysql_blind_get_version.py

# Example: MITM attack (requires root)
sudo python network/mitm.py
```

## Directory Structure

```
Common-CTF-Challenges/
├── crypto/
│   ├── README.md           # Cipher references
│   ├── asymmetric-cipher/  # RSA attacks
│   │   └── src/            # Python scripts
│   └── img/                # Cipher images
├── pwn/
│   ├── README.md           # Exploitation techniques
│   └── src/
│       ├── x32/            # 32-bit exploits
│       └── x64/            # 64-bit exploits
├── web/
│   ├── README.md           # Web exploitation
│   ├── sqli/               # SQL injection
│   ├── ssrf/               # SSRF attacks
│   └── ...
├── reverse/
│   ├── README.md           # Reversing tools
│   └── src/                # Angr, Z3, GDB scripts
├── forensics/
│   ├── README.md           # Forensics techniques
│   └── src/                # Analysis scripts
├── network/
│   ├── README.md           # Network attacks
│   └── mitm.py             # ARP spoofing script
└── CONTRIBUTING.md         # Contribution guide
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Adding new scripts and documentation
- Code style and docstring requirements
- Pull request process

## Notes

- Use these materials ethically and only in competitions or authorized environments
- Links are provided for convenience; mirror important payloads locally for offline use
- All Python scripts include docstrings explaining usage and dependencies
- Test scripts before relying on them in live competitions
