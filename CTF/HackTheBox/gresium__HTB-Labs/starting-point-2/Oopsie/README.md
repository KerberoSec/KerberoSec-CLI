# HTB: Oopsie (Starting Point Tier 2)

## Overview
- Platform: Hack The Box
- Path: Starting Point: Tier 2
- Target OS: Linux
- Focus: Web enumeration, access control flaws, file upload abuse, SUID privilege escalation
- Difficulty: Beginner → Intermediate

This lab focuses on abusing insecure web application logic and escalating privileges via misconfigured SUID binaries.

---

## Attack Path Summary

### 1. Web Reconnaissance
- Identified a web application requiring authentication
- Intercepted HTTP traffic using a proxy
- Enumerated hidden paths leading to a login endpoint

Key takeaway: Intercepting and inspecting traffic often reveals undocumented functionality.

---

### 2. Authentication Bypass
- Manipulated client-side data to bypass access restrictions
- Modified session-related values to gain access to restricted pages

Key takeaway: Never trust client-controlled data for authorization decisions.

---

### 3. File Upload Abuse
- Gained access to a file upload feature
- Uploaded a malicious payload to a predictable directory
- Achieved remote command execution on the server

Key takeaway: File upload functionality is a high-risk attack surface if improperly validated.

---

### 4. Credential Discovery
- Enumerated application files on the server
- Discovered hardcoded credentials inside backend configuration files
- Used recovered credentials to access a local user account

Key takeaway: Storing credentials in plaintext configuration files is a critical security flaw.

---

### 5. Privilege Escalation
- Enumerated binaries with the SUID permission set
- Identified a vulnerable executable running with elevated privileges
- Abused insecure command execution to escalate to root

Key takeaway: SUID binaries combined with unsafe command handling frequently lead to full compromise.

---

## Tools Used
- Burp Suite / browser proxy
- curl
- netcat
- find
- standard Linux utilities

---

## Key Lessons Learned
- Client-side controls are not security controls
- Web uploads must be strictly validated and isolated
- Configuration files often leak sensitive credentials
- SUID misconfigurations remain a common privilege escalation vector

---

## Notes
- Target IP, credentials, and flags are intentionally omitted
- This write-up documents methodology, not step-by-step exploitation
- Content complies with Hack The Box publishing guidelines
