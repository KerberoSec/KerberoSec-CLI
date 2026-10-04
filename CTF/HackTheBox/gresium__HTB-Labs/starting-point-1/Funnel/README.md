# Hack The Box: Funnel (Starting Point)

## Overview
**Funnel** is a Starting Point machine on Hack The Box designed to introduce core concepts around **FTP enumeration**, **credential reuse**, **internal services**, and **SSH tunneling**.  
The lab focuses on identifying exposed services, extracting sensitive information from backups, and accessing an internal database service via **local port forwarding**.

- **Difficulty:** Starting Point  
- **Category:** Network / Linux  
- **Platform:** Hack The Box  
- **Key Skills:** Enumeration, FTP, SSH, Port Forwarding, PostgreSQL

---

## Initial Enumeration

A TCP scan reveals that the target exposes **two open TCP ports**.  
Further enumeration identifies an **FTP service** that allows anonymous access and an SSH service used later for tunneling.

Key findings:
- Limited external attack surface
- Presence of internal-only services not directly accessible

---

## FTP Enumeration and Credential Discovery

Connecting to the FTP server using **anonymous authentication** reveals a directory named: mail-backup

Inside this directory, backup files related to internal communications and onboarding information are found.  
From these files, a **default password** used by new team members is identified: funnel123#!#

Reviewing the backup data further shows that one user has **not changed their default password**: christine 

This credential reuse provides the foothold required to proceed.

---

This credential reuse provides the foothold required to proceed.

---

## Internal Service Identification

Once authenticated, inspection of local services reveals an internal database service listening on: TCP 5432

The service is identified as: Postgresql 

Importantly, this service is **bound to localhost only**, meaning it cannot be accessed directly from the attacking machine.

---

## SSH Tunneling (Local Port Forwarding)

Because PostgreSQL is only accessible internally, an **SSH tunnel** is required.

The correct tunneling method for this scenario is: Local Port Forwarding 

This allows the attacker to forward a local port on their machine to the remote PostgreSQL service running on `127.0.0.1:5432`.

A dynamic tunnel **could** be used, but local port forwarding is the most direct and appropriate choice here.

---

## Database Enumeration and Flag Retrieval

After establishing the tunnel, the PostgreSQL service becomes accessible locally.  
Enumerating the databases reveals a database named: secrets 

This database contains the flag required to complete the machine.

---

## Summary of Key Findings

- **Open TCP Ports:** 2  
- **FTP Directory Exposed:** `mail_backup`  
- **Default Password Discovered:** `funnel123#!#`  
- **User with Unchanged Password:** `christine`  
- **Internal Service:** PostgreSQL (TCP 5432, localhost only)  
- **Tunnel Type Used:** Local Port Forwarding  
- **Flag Database:** `secrets`

---

## Lessons Learned

- Backup files frequently contain sensitive credentials
- Anonymous FTP access is a high-risk misconfiguration
- Internal-only services are often exposed through tunneling
- Default credentials are still one of the most common attack vectors
- SSH port forwarding is a critical skill for lateral access

---

## Status

✅ Root flag obtained  
✅ Machine completed  

---

*Write-up created for educational purposes as part of Hack The Box Starting Point practice.*
