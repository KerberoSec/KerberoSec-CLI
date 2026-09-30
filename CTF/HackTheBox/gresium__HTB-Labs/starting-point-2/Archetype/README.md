# HTB: Archetype (Starting Point Tier 2)

## Overview
- Platform: Hack The Box
- Path: Starting Point: Tier 2
- Target OS: Windows
- Focus: SMB enumeration, MSSQL access, command execution, privilege escalation
- Difficulty: Beginner → Intermediate

This lab introduces attacking a Windows host exposing SMB and Microsoft SQL Server, followed by local privilege escalation.

---

## Attack Path Summary

### 1. Reconnaissance
- Initial port scan identified:
  - SMB (TCP 445)
  - Microsoft SQL Server (TCP 1433)

Key takeaway: Always correlate open ports with likely services and attack surface.

---

### 2. SMB Enumeration
- Enumerated SMB shares without authentication
- Identified a non-administrative share containing sensitive files
- Retrieved a configuration/backup file leaking credentials

Key takeaway: Misconfigured SMB shares frequently expose credentials.

---

### 3. MSSQL Access
- Authenticated to Microsoft SQL Server using discovered credentials
- Used Impacket tooling to establish an interactive SQL session
- Verified permissions and enabled command execution

Key takeaway: Database access often leads directly to OS-level command execution.

---

### 4. Command Execution
- Enabled extended stored procedures
- Executed system commands through SQL Server
- Achieved a reverse shell on the target host

Key takeaway: Database features like command execution are high-risk when misconfigured.

---

### 5. Privilege Escalation
- Enumerated the system for escalation vectors
- Identified sensitive command history files
- Extracted administrator credentials from command history
- Escalated to Administrator

Key takeaway: Local enumeration is critical; credentials are often reused or stored insecurely.

---

## Tools Used
- nmap
- smbclient
- Impacket (mssqlclient)
- winPEAS
- netcat

---

## Key Lessons Learned
- SMB misconfigurations are common and dangerous
- MSSQL can be abused beyond database access
- Command history files are a frequent source of credential leakage
- Structured enumeration beats random exploitation

---

## Notes
- Target IP, credentials, and flags are intentionally omitted
- This write-up focuses on methodology, not spoilers
- Content complies with Hack The Box publishing rules
