# CTF Write-ups

Detailed step-by-step solutions for Capture The Flag challenges. Each write-up includes methodology, tools used, lessons learned, and proof-of-concept code.

## 📋 Repository Structure

```
ctf-writeups/
├── picoctf/              # PicoCTF challenge solutions
├── web-exploitation/     # Web-focused CTF challenges
│   └── global-truth-bank-jwt-weak-secret/ # JWT Weak Secret -> Admin Privilege Escalation
├── reverse-engineering/  # Reverse engineering challenges
└── README.md
```

## 🎯 Challenge Categories

### PicoCTF
Solutions for PicoCTF competitions focusing on:
- Web exploitation
- Cryptography
- Reverse engineering
- Forensics
- General skills

### Web Exploitation
Detailed write-ups for web-based CTF challenges:
- [JWT Weak Secret -> Admin Privilege Escalation (Global Truth Bank)](./web-exploitation/global-truth-bank-jwt-weak-secret/README.md)
- Authentication bypass
- SQL injection
- Cross-site scripting (XSS)
- Server-side template injection
- API vulnerabilities
- File upload vulnerabilities

### Reverse Engineering
Challenges involving:
- Binary analysis
- Malware analysis
- Code obfuscation
- Cryptographic algorithms

## 📝 Write-up Format

Each write-up follows this structure:

```markdown
# Challenge Name

## Challenge Description
[Description of the challenge]

## Difficulty Level
[Easy/Medium/Hard]

## Tools Used
- Tool 1
- Tool 2
- Tool 3

## Enumeration & Discovery
[Initial reconnaissance and information gathering]

## Exploitation Process
[Step-by-step exploitation methodology]

## Proof of Concept
[Code or commands demonstrating the exploit]

## Key Learnings
[What was learned from this challenge]

## Mitigation Recommendations
[How to prevent this vulnerability]

## References
[Links to relevant resources]
```

## 🔧 Tools & Techniques

### Common Tools
- Burp Suite
- curl / wget
- Postman
- Nmap
- Wireshark
- GDB / Radare2
- John the Ripper
- Hashcat

### Techniques
- Source code analysis
- Network traffic inspection
- Cryptographic analysis
- Binary analysis
- Social engineering

## 🎓 Learning Path

1. Start with easy challenges to understand CTF basics
2. Progress to medium difficulty for deeper understanding
3. Tackle hard challenges to master advanced techniques
4. Document everything you learn
5. Review and refine your methodology

## 📊 Challenge Statistics

| Category | Count | Completion Status |
| :--- | :---: | :--- |
| PicoCTF | TBD | In Progress |
| Web Exploitation | 1 | In Progress |
| Reverse Engineering | TBD | In Progress |

## 🔗 Useful Resources

- [PicoCTF Official](https://picoctf.org/)
- [TryHackMe](https://tryhackme.com/)
- [HackTheBox](https://www.hackthebox.com/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)

## 💡 Tips for CTF Success

1. **Read Carefully**: Understand the challenge requirements completely
2. **Enumerate Thoroughly**: Gather all possible information
3. **Document Progress**: Keep detailed notes of your findings
4. **Try Different Approaches**: Don't get stuck on one method
5. **Learn from Others**: Study other people's write-ups
6. **Practice Regularly**: Consistency is key to improvement

## ⚖️ Ethical Guidelines

All challenges in these write-ups are from legitimate CTF platforms:
- PicoCTF (official competition)
- TryHackMe (authorized practice platform)
- HackTheBox (authorized practice platform)

All solutions are for educational purposes only.

## 📝 Contributing

This is a personal learning repository documenting my CTF journey. Feedback and suggestions are welcome.

## 📄 License

This repository is for educational purposes.

---

**Last Updated:** February 2026
**Author:** Tito Oscar Mwaisengela
