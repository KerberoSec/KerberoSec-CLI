# Detecting Web Attacks

## Room Overview

This room focuses on detecting web attacks using web server logs, network traffic analysis, and Web Application Firewalls (WAFs). During the investigation, an attacker performs directory fuzzing, brute-force attacks, and SQL Injection to compromise a banking application and steal customer data.

---

## Learning Objectives

- Understand client-side and server-side web attacks
- Identify attack patterns in web server logs
- Analyse HTTP traffic using Wireshark
- Investigate brute-force and SQL Injection attacks
- Understand the role of Web Application Firewalls (WAFs)
- Develop SOC investigation skills

---

## Client-Side Attacks

Client-side attacks target users and their browsers.

### Common Attacks

### Cross-Site Scripting (XSS)
Runs malicious JavaScript inside a trusted website.

Impact:
- Session hijacking
- Cookie theft
- Account compromise

### Cross-Site Request Forgery (CSRF)
Forces authenticated users to perform unwanted actions.

### Clickjacking
Uses hidden elements to trick users into clicking malicious content.

### Answers

Q: What class of attacks relies on exploiting the user's behaviour or device?
A: Client-Side

Q: What is the most common client-side attack?
A: XSS

---

## Server-Side Attacks

Server-side attacks target web applications and backend systems.

### Common Attacks

### Brute Force
Repeated login attempts using automated tools.

### SQL Injection (SQLi)
Manipulates database queries to access or modify data.

Example:
' OR '1'='1

### Command Injection
Executes operating system commands through vulnerable input fields.

### Answers

Q: What class of attacks relies on exploiting vulnerabilities within web servers?
A: Server-Side

Q: Which server-side attack lets attackers abuse forms to dump database contents?
A: SQLi

---

## Log-Based Detection

Web server logs provide evidence of attacks.

### Important Log Fields

- Client IP Address
- Timestamp
- Requested Page
- Status Code
- Response Size
- Referrer
- User-Agent

### Attack Sequence

#### Directory Fuzzing
The attacker scans for hidden directories and pages.

Indicators:
- Multiple requests
- Rapid scanning behaviour
- Many successful 200 responses

Tool Used:
FFUF v2.1.0

#### Brute Force Attack
Target:
/login.php

Indicators:
- Repeated POST requests
- Multiple failed logins
- Final successful login with 302 redirect

#### SQL Injection
Payloads observed:

' OR '1'='1

1' OR 'a'='a

Purpose:
- Authentication bypass
- Database extraction

### Investigation Answers

Q: What is the attacker's User-Agent while performing the directory fuzz?
A: FFUF v2.1.0

Q: What is the name of the page on which the attacker performs a brute-force attack?
A: /login.php

Q: What is the complete decoded SQLi payload used on /changeusername.php?
A: %' OR '1'='1

---

## Network-Based Detection

Network traffic analysis provides visibility into:

- HTTP requests
- POST data
- Cookies
- Authentication attempts
- SQL Injection payloads

### Wireshark Investigation

Useful Filter:
http

Follow HTTP Stream to view complete requests and responses.

### Findings

Successful brute-force password:
astrongpassword123

Flag recovered through SQL Injection:
THM{dumped_the_db}

### Answers

Q: What password does the attacker successfully identify?
A: astrongpassword123

Q: What is the flag the attacker found in the database?
A: THM{dumped_the_db}

---

## Web Application Firewall (WAF)

A WAF inspects and filters web requests before they reach the application.

### WAF Capabilities

- Block malicious requests
- Detect attack patterns
- Rate limiting
- CAPTCHA challenges
- Threat intelligence integration

### Example Rule

IF User-Agent CONTAINS "sqlmap"
THEN BLOCK

### Challenge-Response Mechanisms

- CAPTCHA
- Browser validation
- Rate limiting

### Answers

Q: What do WAFs inspect and filter?
A: Web Requests

Q: Create a custom firewall rule to block User-Agent matching "BotTHM".
A: IF User-Agent CONTAINS "BotTHM" THEN BLOCK

---

## Indicators of Compromise (IOCs)

Directory Fuzzer:
FFUF v2.1.0

SQL Injection Tool:
sqlmap

Brute Force Target:
/login.php

SQLi Payload:
%' OR '1'='1

Compromised Password:
astrongpassword123

Database Flag:
THM{dumped_the_db}

---

## MITRE ATT&CK Mapping

T1595: Active Scanning

T1110: Brute Force

T1190: Exploit Public-Facing Application

T1213: Data from Information Repositories

---

## Key Takeaways

- Client-side attacks occur on user systems and are difficult for SOC teams to observe.
- Server-side attacks leave evidence in logs and network traffic.
- Brute-force attacks generate repeated authentication attempts.
- SQL Injection can expose sensitive database information.
- Wireshark provides deeper visibility than server logs alone.
- WAFs help prevent common web attacks before they reach the application.
- Combining logs, network traffic, and WAF telemetry improves detection and response capabilities.
