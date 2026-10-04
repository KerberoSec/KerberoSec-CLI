# HTB: Unified (Starting Point Tier 2)

## Overview
- Platform: Hack The Box
- Path: Starting Point: Tier 2
- Target OS: Linux
- Focus: Service enumeration, Log4Shell exploitation, NoSQL abuse, credential manipulation
- Difficulty: Intermediate

This lab focuses on identifying vulnerable enterprise software, exploiting Log4j via JNDI injection, and abusing backend databases to gain administrative access.

---

## Attack Path Summary

### 1. Service Enumeration
- Identified multiple open ports, including HTTPS and a management interface
- Discovered a UniFi Network application running on a non-standard port

Key takeaway: Management interfaces often expose high-value attack surfaces.

---

### 2. Application Fingerprinting
- Identified the UniFi Network application and its exact version
- Researched known vulnerabilities affecting the discovered version

Key takeaway: Version identification directly enables targeted exploitation.

---

### 3. Log4Shell (Log4j) Exploitation
- Identified a vulnerable Log4j implementation
- Used a JNDI injection payload leveraging LDAP
- Confirmed successful exploitation by monitoring network callbacks

Key takeaway: Out-of-band verification is critical when exploiting deserialization-style flaws.

---

### 4. Backend Service Enumeration
- Discovered a MongoDB instance used by the application
- Identified the default UniFi database

Key takeaway: Backend services are often exposed internally and trust application-level access.

---

### 5. Database Abuse
- Enumerated administrative users directly from MongoDB
- Modified database entries to reset credentials
- Gained administrative access to the application

Key takeaway: Direct database access bypasses all application-layer security.

---

### 6. Privilege Escalation
- Used recovered credentials to escalate privileges
- Achieved root-level access on the target system

Key takeaway: Application compromise frequently leads to full system compromise.

---

## Tools Used
- nmap
- curl
- tcpdump
- LDAP listener tools
- MongoDB client utilities

---

## Key Lessons Learned
- Log4j vulnerabilities are catastrophic when unpatched
- Management applications should never be internet-exposed
- Database access equals total trust
- Defense-in-depth is mandatory for enterprise software

---

## Notes
- Target IPs, credentials, and flags are intentionally omitted
- This write-up focuses on methodology, not exploitation steps
- Content complies with Hack The Box publishing guidelines
