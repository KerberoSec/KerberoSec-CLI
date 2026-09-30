# HTB: Markup (Starting Point Tier 2)

## Overview
- Platform: Hack The Box
- Path: Starting Point: Tier 2
- Target OS: Windows
- Focus: Web enumeration, XML External Entity (XXE) injection, credential discovery, insecure service execution
- Difficulty: Beginner → Intermediate

This lab introduces abusing XML parsers through XXE injection and leveraging insecure service execution on a Windows host.

---

## Attack Path Summary

### 1. Service & Application Enumeration
- Identified a web application running on Apache
- Enumerated application functionality accepting user-supplied input

Key takeaway: Understanding how user input is processed is critical for finding injection points.

---

### 2. Authentication Weakness
- Discovered weak or default credentials allowing access to restricted functionality
- Logged into the application with minimal resistance

Key takeaway: Default credentials remain a common and dangerous misconfiguration.

---

### 3. XML Processing & XXE
- Identified XML being processed by the application
- Confirmed the XML parser allowed external entity resolution
- Leveraged XXE to read internal files from the system

Key takeaway: XXE vulnerabilities can lead to file disclosure and further compromise.

---

### 4. Information Disclosure
- Extracted sensitive information from application responses
- Identified usernames and system paths through leaked data

Key takeaway: Information disclosure often enables the next stage of exploitation.

---

### 5. Insecure Service Execution
- Discovered a scheduled or service-based executable running with elevated privileges
- Identified an insecurely referenced executable path
- Replaced or hijacked the executable to gain higher privileges

Key takeaway: Improperly secured service paths on Windows can lead to privilege
