# Responder: Hack The Box (Starting Point)

## Overview
**Responder** is a Starting Point machine on Hack The Box that introduces Windows authentication attacks, Local/Remote File Inclusion concepts, and credential harvesting using the Responder tool.  
The lab focuses on abusing misconfigurations to capture NetNTLMv2 hashes and reuse credentials for remote access.

**Difficulty:** Starting Point  
**Category:** Web / Windows / Credential Attacks  
**Platform:** Hack The Box  

---

## Key Concepts
- Web redirection and virtual hosts
- PHP-based web applications
- Local File Inclusion (LFI)
- Remote File Inclusion (RFI)
- NTLM authentication
- NetNTLMv2 hash capture
- Responder usage
- Password cracking with John the Ripper
- Windows remote access (WinRM)

---

## Enumeration Summary
- **Redirected Domain:** `unika.htb`
- **Web Technology:** PHP
- **Vulnerable Parameter:** `page`
- **Vulnerabilities Identified:**
  - Local File Inclusion (LFI)
  - Remote File Inclusion (RFI)
- **Authentication Protocol:** NTLM / NetNTLMv2
- **Captured Credential Type:** NetNTLMv2 hash

---

## Exploitation Highlights
- Exploited LFI/RFI via the `page` parameter
- Used **Responder** to intercept NTLM authentication
- Captured NetNTLMv2 hash
- Cracked hash using **John the Ripper**
- Retrieved administrator credentials

---

## Credentials
- **Username:** `administrator`
- **Password:** `badminton`

---

## Privileged Access
- **Remote Service:** Windows Remote Management (WinRM)
- **Port:** `5985`
- **Result:** Full administrative access obtained

---

## Tools Used
- Nmap
- Responder
- John the Ripper
- curl / browser
- Evil-WinRM

---

## Learning Outcome
This machine demonstrates how:
- File inclusion bugs lead to credential theft
- NTLM authentication can be abused on internal networks
- Captured hashes can be cracked and reused
- Misconfigurations chain into full system compromise

---

## Machine Status
✅ Root flag owned  
