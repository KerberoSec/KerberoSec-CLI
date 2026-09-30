# HTB Starting Point 1: Appointment

## Overview
**Appointment** is a beginner-level web exploitation lab focused on identifying and exploiting a basic **SQL Injection** vulnerability in an authentication mechanism.

The objective is to understand how improper input handling can allow attackers to bypass login controls without valid credentials.

---

## Attack Surface
- **Service:** HTTP
- **Port:** 80
- **Web Server:** Apache httpd 2.4.38 (Debian)

---

## Key Concepts
- SQL Injection
- Authentication bypass
- HTTP response codes
- Web directory enumeration
- OWASP Top 10 (A03:2021: Injection)

---

## Enumeration
Initial reconnaissance revealed:
- A web login form exposed over HTTP
- No visible client-side input validation
- Standard error handling for invalid credentials

---

## Vulnerability
The application concatenates user input directly into an SQL query without sanitization.

This allows attackers to inject SQL comments, causing the password check to be ignored.

---

## Exploitation
By inserting a SQL comment character into the login input, authentication can be bypassed without knowing the password.

**Example technique:**
- Commenting out the remainder of the SQL query
- Forcing the database to return a valid result

---

## Result
- Successful login as an administrative user
- Root flag obtained
- Lab completed

---

## Security Takeaways
- User input must never be trusted
- Parameterized queries prevent SQL Injection
- Authentication logic should not rely on string concatenation
- Input validation and proper error handling are critical

---

## Classification
- **Vulnerability Type:** SQL Injection
- **OWASP:** A03:2021: Injection
- **Difficulty:** Starting Point 1
