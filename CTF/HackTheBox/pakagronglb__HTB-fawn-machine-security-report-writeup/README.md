# HackTheBox Fawn Machine: Security Assessment & Interactive Q&A Walkthrough

![Platform](https://img.shields.io/badge/HackTheBox-Starting%20Point-9FEF00?style=flat-square&logo=hackthebox)
</br>
![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen?style=flat-square)
![OS](https://img.shields.io/badge/OS-Unix-blue?style=flat-square)

---

## Overview

This repository contains a detailed security assessment and hands-on walkthrough of the HackTheBox "Fawn" machine. The attached report and this README demonstrate critical security risks associated with legacy FTP configurations and guide learners through interactive penetration testing questions and answers.

- **Report ID**: HTB-FAWN-2025-002
- **Assessment Date**: October 13, 2025
- **Report Date**: October 16, 2025
- **Analyst**: Pakagrong Lebel ([github.com/pakagronglb](https://github.com/pakagronglb))

## Machine Profile

| Attribute         | Value                     |
|-------------------|---------------------------|
| Platform          | HackTheBox Starting Point |
| Difficulty        | Very Easy                 |
| Target IP         | 10.129.1.14               |
| Operating System  | Unix                      |
| Service           | vsftpd 3.0.3              |
| Attack Vector     | Anonymous FTP             |

---

## Interactive Q&A Walkthrough

### Task 1: Protocol Identification
**Q**: What does the 3-letter acronym FTP stand for?

> _Answer:_ **File Transfer Protocol**

---

### Task 2: Default FTP Port
**Q**: Which port does the FTP service listen on usually?

> _Answer:_ **21**

---

### Task 3: Secure Alternative Protocol
**Q**: FTP sends data in the clear. What acronym is used for the secure extension of FTP over SSH?

> _Answer:_ **SFTP**

---

### Task 4: Connectivity Testing Command
**Q**: What is the command used to send an ICMP echo request?

> _Answer:_ **ping**

---

### Task 5: Service Identification
**Q**: From your scans, what version is FTP running on the target?

> _Answer:_ **vsftpd 3.0.3**

---

### Task 6: OS Fingerprinting
**Q**: From your scans, what OS type is running on the target?

> _Answer:_ **Unix**

---

### Task 7: FTP Help Menu
**Q**: What is the command to display the 'ftp' client help menu?

> _Answer:_ **ftp -?**

---

### Task 8: Anonymous Username
**Q**: Username used over FTP for unauthenticated login?

> _Answer:_ **anonymous**

---

### Task 9: FTP Login Success Code
**Q**: What is the response code for 'Login successful'?

> _Answer:_ **230**

---

### Task 10: Directory Listing
**Q**: Common FTP command to list files and directories other than 'dir'?

> _Answer:_ **ls**

---

### Task 11: File Downloading Command
**Q**: Command used to download files over FTP?

> _Answer:_ **get**

---

### Task 12: Root Flag Extraction
**Q**: What is the root flag?

> _Flag:_ **035db21c881520061c53e0536e44f815**

---

## Technical Assessment Summary

### Key Vulnerabilities

- **Anonymous FTP Authentication (CWE-287, CVSS 9.1 CRITICAL):** No credentials required, full filesystem access.
- **Sensitive Data Exposure (CWE-200/CWE-732):** World-readable files (644 permissions).
- **Cleartext Data Transmission (CWE-319, CVSS 5.9 MEDIUM):** FTP data sent with no encryption.
- **Lack of Network Access Controls (CWE-284):** Service open to all IPs, no firewall filtering.

### Attack Chain Overview

1. **Reconnaissance**: Nmap service scan identifies FTP on port 21.
2. **Initial Access**: Login via FTP using 'anonymous', exploit authentication bypass.
3. **Discovery**: Use 'ls' and 'dir' to view directories/files.
4. **Exfiltration**: Download flag using 'get flag.txt'.

_Compromise achieved in under 15 minutes._

### Remediation Recommendations

- **Disable Anonymous FTP**: Edit `/etc/vsftpd.conf` and set `anonymous_enable=NO`.
- **Migrate to SFTP/FTPS** for encrypted file transfer.
- **Enforce Least Privilege** on sensitive files (`chmod 600`, `chown root:root`).
- **Implement Network Controls**: Restrict access to trusted IP addresses using firewall rules.
- **Continuous Monitoring**: Enable logging, SIEM integration, and regular vulnerability scans.

### Compliance Impact

- Breaches **PCI-DSS 8.1**, **HIPAA 164.312(a)(2)(i)**, **GDPR Article 32** standards.

---

## Learning Objectives

- Understand FTP/anonymous authentication weaknesses
- Practice Linux/Unix enumeration and exfiltration tactics
- Map exploits to MITRE ATT&CK
- Write clear technical documentation for security assessments

---

## Resources

- [vsftpd Documentation](https://security.appspot.com/vsftpd/vsftpd_conf.html)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [HackTheBox: Starting Point](https://hackthebox.com/starting-point)
- [OpenSSH SFTP](https://www.openssh.com/)

---

## Download Full Report

The full technical report with comprehensive timeline, mitigation steps, MITRE mapping, IOCs, and compliance analysis is included in this repo:

`HTB-Fawn-Machine-Security-Assessment-Report.pdf`

---

## Disclaimer

This assessment was performed in an authorized HackTheBox environment. All findings and techniques are demonstrated for educational purposes. Never conduct unauthorized assessments on live systems.

---

## Author Contact

- **GitHub**: [pakagronglb](https://github.com/pakagronglb)
- **LinkedIn**: [Pakagrong Lebel](https://linkedin.com/in/pakagronglb)

