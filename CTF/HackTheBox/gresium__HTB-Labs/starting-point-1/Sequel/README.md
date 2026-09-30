# Appointment / Sequel: Hack The Box (Starting Point)

## Overview
This lab focuses on basic SQL and database enumeration concepts using a MySQL/MariaDB backend. It is part of the Hack The Box **Starting Point** series and introduces common database misconfigurations and SQL fundamentals.

**Difficulty:** Starting Point  
**Category:** Web / Database  
**Platform:** Hack The Box  

---

## Key Concepts
- Service enumeration with Nmap
- Identifying MySQL/MariaDB services and versions
- MySQL authentication behavior
- Basic SQL syntax and query structure
- Understanding common SQL vulnerabilities
- OWASP Top 10: A03:2021: Injection

---

## Enumeration Summary
- **Database Port:** 3306
- **Database Engine:** MariaDB
- **Web Server:** Apache (Debian)
- **Authentication Issue:** Root login without password
- **Custom Database Identified:** `htb`

---

## Tools Used
- nmap
- mysql (CLI client)
- Web browser

---

## What I Learned
- How to detect and identify database services during reconnaissance
- How insecure database authentication can lead to full compromise
- Core SQL syntax (`*`, `;`, comments)
- Why SQL Injection remains a critical and common vulnerability
- How database exposure fits into real-world attack paths

---

## Completion Status
- All tasks completed
- Root flag obtained
- Lab successfully completed

---

## Notes
This lab reinforces the importance of proper database access controls and secure SQL handling in web applications.
