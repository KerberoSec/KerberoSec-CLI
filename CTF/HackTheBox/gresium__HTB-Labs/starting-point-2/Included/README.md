# HTB: Included (Starting Point Tier 2)

## Overview
- Platform: Hack The Box
- Path: Starting Point: Tier 2
- Target OS: Linux
- Focus: UDP enumeration, Local File Inclusion (LFI), credential reuse, container escape
- Difficulty: Intermediate

This lab demonstrates how multiple small misconfigurations: UDP services, LFI, and container privileges: can be chained into full system compromise.

---

## Attack Path Summary

### 1. Network Enumeration
- Identified a UDP service running on the target
- Discovered a Trivial File Transfer Protocol (TFTP) service

Key takeaway: UDP services are often overlooked but can expose critical files.

---

### 2. Web Vulnerability Identification
- Identified a web application running on HTTP
- Confirmed the application was vulnerable to Local File Inclusion (LFI)

Key takeaway: LFI vulnerabilities allow attackers to read sensitive system and application files.

---

### 3. File Disclosure & Lateral Movement
- Used LFI to retrieve sensitive web server files
- Discovered authentication-related files enabling lateral movement
- Reused obtained credentials to access a local user account

Key takeaway: LFI often leads directly to credential disclosure.

---

### 4. Privilege Escalation via Containers
- Enumerated user group memberships
- Identified membership in a container management group
- Leveraged container privileges to launch a privileged container
- Mounted the host filesystem inside the container

Key takeaway: Container misconfigurations frequently allow full host compromise.

---

### 5. Root Access
- Accessed the host filesystem from the container
- Retrieved root-level data from the mounted filesystem

Key takeaway: Containers are not security boundaries when misconfigured.

---

## Tools Used
- nmap (TCP & UDP)
- tftp
- curl / browser
- standard Linux utilities
- container runtime tools

---

## Key Lessons Learned
- UDP services require the same scrutiny as TCP
- LFI vulnerabilities can be chained with other weaknesses
- Group memberships can be as dangerous as sudo access
- Privileged containers effectively equal root access

---

## Notes
- Target IPs, credentials, and flags are intentionally omitted
- This write-up focuses on attack methodology, not step-by-step exploitation
- Content complies with Hack The Box publishing guidelines
