\![CI](https://github.com/stabrea/ctf-writeups/actions/workflows/ci.yml/badge.svg)
# CTF Writeups

A collection of Capture The Flag challenge writeups documenting my approach to solving security challenges across multiple domains. Each writeup covers the attack methodology, the underlying vulnerability, and defensive mitigations: because understanding both sides is what separates a security professional from a script kiddie.

## Writeups by Category

### Web Exploitation

| Challenge | Difficulty | Points | Description |
|-----------|------------|--------|-------------|
| [SQL Injection: Login Bypass](web/sql-injection-login-bypass.md) | Medium | 200 | Exploiting a login form via SQL injection |
| [XSS: Stored Cross-Site Scripting](web/xss-cookie-theft.md) | Medium | 250 | Cookie theft through stored XSS in a comment form |

### Cryptography

| Challenge | Difficulty | Points | Description |
|-----------|------------|--------|-------------|
| [RSA: Small Public Exponent Attack](crypto/rsa-small-exponent.md) | Hard | 300 | Exploiting RSA with e=3 via cube root attack |
| [Hash Length Extension Attack](crypto/hash-length-extension.md) | Hard | 350 | Forging MACs against naive H(secret \|\| message) construction |

### Network Forensics

| Challenge | Difficulty | Points | Description |
|-----------|------------|--------|-------------|
| [Network Forensics: Hidden in Plain Sight](network/packet-analysis.md) | Easy | 150 | Extracting credentials from unencrypted network traffic |

### Digital Forensics

| Challenge | Difficulty | Points | Description |
|-----------|------------|--------|-------------|
| [Steganography: Secrets in Images](forensics/steganography-png.md) | Medium | 200 | Recovering a flag hidden in a PNG using LSB steganography |

## Tools

These are the primary tools referenced across the writeups:

- **Web**: Burp Suite, sqlmap, Browser DevTools
- **Crypto**: Python (pycryptodome, gmpy2), hash_extender
- **Network**: Wireshark, tshark, tcpdump
- **Forensics**: binwalk, zsteg, stegsolve, exiftool, strings
- **General**: CyberChef, John the Ripper, Hashcat

## Resources

Platforms and resources for practicing CTF skills:

- [HackTheBox](https://www.hackthebox.com/): Realistic penetration testing labs
- [TryHackMe](https://tryhackme.com/): Guided cybersecurity training rooms
- [PicoCTF](https://picoctf.org/): Beginner-friendly CTF by Carnegie Mellon
- [OverTheWire](https://overthewire.org/wargames/): Wargames for learning Linux and security basics
- [CryptoHack](https://cryptohack.org/): Cryptography-focused challenges
- [OWASP Top 10](https://owasp.org/www-project-top-ten/): Essential web vulnerability reference
- [CTFtime](https://ctftime.org/): CTF event calendar and team rankings

## Disclaimer

All writeups are for educational purposes only. Techniques described here should only be used on systems you own or have explicit authorization to test. Unauthorized access to computer systems is illegal.

## License

[MIT](LICENSE)