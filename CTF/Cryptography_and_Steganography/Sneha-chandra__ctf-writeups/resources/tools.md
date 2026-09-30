# CTF Toolkit Reference 🛠️

My go-to tools organized by category. All tested on Kali Linux.

---

## Web Exploitation

| Tool | Use Case | Install |
|---|---|---|
| Burp Suite | HTTP intercept, fuzzing, repeater | Pre-installed on Kali |
| sqlmap | Automated SQL injection | `sudo apt install sqlmap` |
| gobuster | Directory/file enumeration | `sudo apt install gobuster` |
| ffuf | Fast web fuzzer | `sudo apt install ffuf` |
| curl | Manual HTTP requests | Pre-installed |
| nikto | Web vulnerability scanner | `sudo apt install nikto` |

**Quick commands:**
```bash
# Directory brute force
gobuster dir -u http://target.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# SQL injection test
sqlmap -u "http://target.com/page?id=1" --dbs

# Header inspection
curl -v http://target.com 2>&1 | grep -i "< "
```

---

## Cryptography

| Tool | Use Case | Install |
|---|---|---|
| Python (pycryptodome) | RSA, AES, custom ciphers | `pip install pycryptodome` |
| CyberChef | Multi-step crypto operations | Browser (gchq.github.io/CyberChef) |
| hashcat | Hash cracking (GPU) | `sudo apt install hashcat` |
| john | Hash cracking (CPU) | `sudo apt install john` |
| RsaCtfTool | RSA attack automation | `pip install rsactftool` |

**Quick commands:**
```bash
# ROT-13 decode
echo "ciphertext" | tr 'A-Za-z' 'N-ZA-Mn-za-m'

# Base64 decode
echo "dGVzdA==" | base64 -d

# MD5 crack
john --format=raw-md5 hash.txt --wordlist=/usr/share/wordlists/rockyou.txt

# Identify hash type
hash-identifier "5f4dcc3b5aa765d61d8327deb882cf99"
```

---

## Digital Forensics & Steganography

| Tool | Use Case | Install |
|---|---|---|
| binwalk | File carving, embedded file detection | `sudo apt install binwalk` |
| steghide | JPEG/BMP steganography | `sudo apt install steghide` |
| exiftool | EXIF metadata extraction | `sudo apt install libimage-exiftool-perl` |
| strings | Extract printable strings | Pre-installed |
| foremost | File recovery by header signature | `sudo apt install foremost` |
| zsteg | PNG/BMP steganography | `gem install zsteg` |
| stegsolve | Visual steganography analysis | Java app (download jar) |
| volatility | Memory forensics | `pip install volatility3` |

**Quick commands:**
```bash
# Extract embedded files
binwalk -e suspicious_file.jpg

# Steghide extraction
steghide extract -sf image.jpg -p "passphrase"

# Check all strings in a binary
strings -n 8 binary_file | grep -iE "flag|ctf|key|password|secret"

# Memory forensics (list processes)
python3 vol.py -f memory.dmp windows.pslist
```

---

## Network Analysis

| Tool | Use Case | Install |
|---|---|---|
| Wireshark | Packet capture & analysis | `sudo apt install wireshark` |
| tshark | CLI Wireshark | `sudo apt install tshark` |
| Nmap | Port scanning, service detection | `sudo apt install nmap` |
| netcat | TCP/UDP connections | Pre-installed (`nc`) |
| tcpdump | Lightweight packet capture | Pre-installed |

**Quick commands:**
```bash
# Full port scan
nmap -sV -sC -p- target.com

# Extract HTTP streams from pcap
tshark -r capture.pcap -Y "http" -T fields -e http.host -e http.request.uri

# Listen on a port
nc -lvnp 4444

# Find credentials in pcap
tshark -r capture.pcap -Y "ftp || http.authorization" -T fields -e ftp.request.arg -e http.authorization
```

---

## OSINT

| Tool | Use Case |
|---|---|
| Maltego | Entity relationship mapping |
| theHarvester | Email/subdomain enumeration |
| Shodan | Internet-facing device search |
| Google Dorks | Advanced search operators |
| Wayback Machine | Historical web content |

**Google Dork examples:**
```
site:target.com filetype:pdf
site:target.com inurl:admin
"@target.com" filetype:xls
intitle:"index of" site:target.com
```

---

## My Python CTF Starter Script

```python
import base64, codecs, string, requests
from itertools import cycle

def rot(text, n=13):
    return codecs.decode(text, 'rot_13') if n == 13 else \
           ''.join(chr((ord(c) - ord('A' if c.isupper() else 'a') + n) % 26 +
                       ord('A' if c.isupper() else 'a')) if c.isalpha() else c for c in text)

def b64d(s): return base64.b64decode(s + "==").decode(errors='ignore')
def b64e(s): return base64.b64encode(s.encode()).decode()

def xor_crack(ct: bytes, key: bytes) -> bytes:
    return bytes(a ^ b for a, b in zip(ct, cycle(key)))

def freq_analysis(text):
    from collections import Counter
    counts = Counter(c.lower() for c in text if c.isalpha())
    return counts.most_common(5)
```

---

*Last updated: June 2026*
