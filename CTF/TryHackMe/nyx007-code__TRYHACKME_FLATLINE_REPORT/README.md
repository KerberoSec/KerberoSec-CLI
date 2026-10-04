# TryHackMe: Flatline CTF | Penetration Testing Report

![Platform](https://img.shields.io/badge/Platform-TryHackMe-red?style=flat-square)
![Target OS](https://img.shields.io/badge/Target%20OS-Windows%2010%20x64-blue?style=flat-square)
![Severity](https://img.shields.io/badge/Severity-Critical%209.8-critical?style=flat-square)
![CVE](https://img.shields.io/badge/CVE-2021--37624-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-Complete-brightgreen?style=flat-square)

A professional penetration testing report documenting the full exploitation of the [Flatline](https://tryhackme.com/room/flatline) room on TryHackMe. The assessment covers end-to-end exploitation from initial reconnaissance through to full SYSTEM-level access using a FreeSWITCH default credentials vulnerability.

---

## 📋 Report Details

| Field | Details |
|---|---|
| **Author** | Avnika Nayee |
| **Date** | 14 March 2026 |
| **Engagement Dates** | 6 March 2026: 8 March 2026 |
| **Target** | TryHackMe: Flatline (Windows 10 x64) |
| **Classification** | Confidential: Lab Environment |
| **Methodology** | PTES, OWASP WSTG v4.2, NIST SP 800-115 |

---

## 🎯 Summary

This report documents a full compromise of the Flatline virtual machine through a **Critical** (CVSS 9.8) unauthenticated Remote Command Execution vulnerability in FreeSWITCH 1.10.1. The engagement resulted in full `NT AUTHORITY\SYSTEM` access and successful capture of both user and root flags.

---

## 🔍 Vulnerabilities Found

### Finding 1: FreeSWITCH Default Credentials RCE (Critical)

| Field | Details |
|---|---|
| **CVE** | CVE-2021-37624 |
| **Exploit-DB** | EDB-47799 |
| **CVSS v3.1 Score** | 9.8 (Critical) |
| **CVSS v3.1 Vector** | `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| **Affected Component** | FreeSWITCH 1.10.1: Event Socket (Port 8021) |
| **OWASP Top 10** | A05: Security Misconfiguration; A07: Authentication Failures |
| **MITRE ATT&CK** | T1059: Command Execution; T1105: Ingress Tool Transfer |

FreeSWITCH's Event Socket Library was exposed on TCP port 8021 with its default password (`ClueCon`) unchanged. This allowed unauthenticated remote command execution at elevated privilege levels.

### Finding 2: OpenClinic GA 5.194.18 Writable Service Binary (High)

| Field | Details |
|---|---|
| **Exploit-DB** | EDB-50448 |
| **CVSS v3.1 Score** | 7.8 (High) |
| **Affected Component** | `C:\projects\openclinic\mariadb\bin\mysqld.exe` |
| **OWASP Top 10** | A05: Security Misconfiguration |
| **MITRE ATT&CK** | T1574.010: Service Binary Hijacking; T1068: Privilege Escalation |

---

## ⚙️ Attack Chain

```
Reconnaissance  →  Vulnerability Research  →  RCE via FreeSWITCH  →  Payload Delivery
     (Nmap)         (Searchsploit / CVE)        (EDB-47799)           (msfvenom + Python HTTP)
                                                                               ↓
                                                          Privilege Escalation (getsystem)
                                                                               ↓
                                                         NT AUTHORITY\SYSTEM  →  Flags Captured
```

---

## 🛠️ Tools Used

| Tool | Version | Purpose |
|---|---|---|
| Nmap | 7.95 | Port scanning and service version detection |
| Searchsploit / Exploit-DB |: | Exploit research (EDB-47799; EDB-50448) |
| Python 3 exploit.py |: | FreeSWITCH RCE delivery script |
| Metasploit Framework | v6.4.99 | Payload generation and multi/handler listener |
| msfvenom |: | Windows Meterpreter reverse TCP payload |
| Python3 http.server |: | Hosting payload for delivery to target |
| PowerShell Invoke-WebRequest |: | Downloading payload to target |
| Meterpreter |: | Remote session management and privilege escalation |

---

## 📂 Repository Contents

```
├── README.md
└── TryHackMe_Flatline_Report_Avnika_Nayee.pdf   # Full penetration testing report
```

---

## 🗺️ MITRE ATT&CK Mapping

| Tactic | Technique | ID |
|---|---|---|
| Initial Access | Exploit Public-Facing Application | T1190 |
| Execution | Command and Scripting Interpreter | T1059 |
| Execution | PowerShell | T1059.001 |
| Command & Control | Ingress Tool Transfer | T1105 |
| Command & Control | Application Layer Protocol | T1071 |
| Privilege Escalation | Exploitation for Privilege Escalation | T1068 |
| Privilege Escalation | Hijack Execution Flow: Service Binary Hijacking | T1574.010 |
| Discovery | File and Directory Discovery | T1083 |
| Collection | Data from Local System | T1005 |

---

## 🔒 Remediation Recommendations

1. **Change Default Credentials**: Replace the FreeSWITCH default password (`ClueCon`) with a strong, unique passphrase immediately.
2. **Restrict Event Socket Access**: Limit FreeSWITCH port 8021 to trusted internal IP addresses only via firewall rules.
3. **Disable Unnecessary Services**: Remove or disable services not required for core functionality to reduce the attack surface.
4. **Implement Network Segmentation**: Ensure critical services are not directly exposed to external or untrusted networks.
5. **Apply Security Updates**: Keep FreeSWITCH and all installed software updated to the latest patched versions.
6. **Enable Monitoring and Logging**: Deploy detection tooling to alert on suspicious command execution and unusual outbound connections.

---

## 📚 References

- [CVE-2021-37624](https://nvd.nist.gov/vuln/detail/CVE-2021-37624)
- [EDB-47799: FreeSWITCH 1.10.1 Command Execution](https://www.exploit-db.com/exploits/47799)
- [EDB-50448: OpenClinic GA 5.194.18 Local Privilege Escalation](https://www.exploit-db.com/exploits/50448)
- [MITRE ATT&CK Framework](https://attack.mitre.org)
- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [NIST SP 800-115](https://csrc.nist.gov/publications/detail/sp/800-115/final)
- [Penetration Testing Execution Standard (PTES)](http://www.pentest-standard.org)

---

## ⚠️ Disclaimer

This report was produced solely within the **TryHackMe platform** as part of an authorised lab exercise. All activity was conducted inside a dedicated VPN environment against a machine explicitly provided for security training purposes. The techniques and findings documented here are for **educational purposes only**. Performing these actions against systems without explicit authorisation is illegal and unethical.
