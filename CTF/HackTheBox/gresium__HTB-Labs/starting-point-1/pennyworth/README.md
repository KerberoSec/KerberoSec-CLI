# Hack The Box: Pennyworth (Starting Point)

## Overview

**Pennyworth** is a Hack The Box *Starting Point* machine designed to introduce fundamental concepts related to **web service enumeration**, **Jenkins misconfiguration**, and **remote code execution via script consoles**.

The lab focuses on identifying exposed services, enumerating application versions, understanding CI/CD tooling risks, and abusing Jenkins Script Console access to gain command execution.

- **Difficulty:** Starting Point  
- **Category:** Web / CI-CD / Linux  
- **Platform:** Hack The Box  
- **Key Skills:** Enumeration, Jenkins, Groovy, Command Execution  

---

## Initial Enumeration

A basic TCP scan reveals an exposed web service running on a non-standard port.

Key findings:
- Port **8080** is open
- The service is identified as **Jetty**
- Jenkins is accessible through the web interface

Service versions identified:
- **Jetty:** 9.4.39.v20210325  
- **Jenkins:** 2.289.1  

These versions indicate an older Jenkins deployment that may expose administrative functionality.

---

## Jenkins Discovery

Navigating to the Jenkins web interface confirms:
- Jenkins is publicly accessible
- No authentication is required for critical features
- The **Script Console** is enabled

The Jenkins Script Console allows administrators to execute **Groovy scripts** directly on the server, which is extremely dangerous when exposed.

---

## Jenkins Script Console Abuse

The Jenkins Script Console accepts **Groovy** as input.  
Groovy has direct access to Java APIs and system commands.

By submitting a Groovy payload, command execution on the underlying system is achieved.

Important observations:
- The script execution context runs with high privileges
- Commands are executed as the **root** user
- Full system compromise is possible

Example logic abused:
- Use Groovy to invoke system command execution
- Detect operating system
- Execute shell commands accordingly

---

## Command Execution Context

From script execution behavior, the following is confirmed:

- **Execution user:** root
- **Operating system:** Linux
- **Command execution method:** Groovy → Java Runtime

Additional enumeration confirms:
- Jenkins uses Groovy for scripting
- On Windows targets, the equivalent command shell would be `cmd.exe`
- On Linux targets, standard shell execution is available

---

## Supporting Knowledge Confirmed During the Lab

- **CVE** stands for *Common Vulnerabilities and Exposures*
- **CIA Triad** consists of:
  - Confidentiality
  - Integrity
  - Availability
- Jenkins Script Console only accepts **Groovy**
- Alternative to `ip a` for network info on Linux: `ifconfig`

---

## Impact Summary

This machine demonstrates how a **single exposed administrative interface** can result in full system compromise.

Key takeaways:
- Jenkins should never expose Script Console publicly
- CI/CD tools run with high privileges and are high-value targets
- Version enumeration is critical for identifying weak deployments

---

## Final Result

- Remote Code Execution achieved
- Commands executed as **root**
- Full system compromise
- Root flag successfully obtained

---

## Lessons Learned

- Always restrict Jenkins administrative interfaces
- Disable Script Console unless absolutely required
- Apply authentication and network access controls
- Treat CI/CD infrastructure as critical attack surface

---

## Status

✅ **Root flag owned**  
✅ **Machine completed**

