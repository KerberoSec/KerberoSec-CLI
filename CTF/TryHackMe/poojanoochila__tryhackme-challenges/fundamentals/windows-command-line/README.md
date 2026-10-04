# Windows Command Line: TryHackMe

## Project Overview

This repository documents practical Windows command-line operations learned through the TryHackMe Windows Command Line room. The project focuses on endpoint navigation, process management, networking, user administration, and system investigation from a cybersecurity and SOC analyst perspective.

The goal of this repository is to build foundational Windows investigation skills required for:

* SOC Operations
* Incident Response
* Endpoint Investigation
* Threat Hunting
* System Administration
* Malware Analysis Preparation

---

# Key Topics Covered

* Windows file system navigation
* Process monitoring
* Service enumeration
* Network diagnostics
* User and privilege investigation
* Windows administrative commands
* Endpoint triage fundamentals

---

# Commands Practiced

## File System Commands

```cmd
mkdir Investigation
cd Investigation
dir
copy evidence.txt backup.txt
```

## Networking Commands

```cmd
ipconfig /all
netstat -ano
ping google.com
nslookup google.com
```

## Process & Service Commands

```cmd
tasklist
sc query
wmic process list brief
```

## User & Privilege Commands

```cmd
net user
net localgroup administrators
whoami /priv
```

---

# Important Ports and Services

| Port | Service     | Description             |
| ---- | ----------- | ----------------------- |
| 135  | RpcSs       | Remote Procedure Call   |
| 3389 | TermService | Remote Desktop Services |
| 445  | SMB         | File Sharing            |

---

# Cybersecurity Relevance

Understanding Windows CMD commands is essential for SOC analysts because most enterprise endpoints operate in Windows environments. These commands assist analysts in:

* Investigating suspicious processes
* Identifying active network connections
* Enumerating users and privileges
* Detecting abnormal services
* Performing rapid endpoint triage
* Supporting incident response workflows

---

# Skills Developed

* Windows endpoint investigation
* Command-line navigation
* Process analysis
* Service enumeration
* Network troubleshooting
* Security-focused system analysis

---

# Key Learning Outcomes

* Improved understanding of Windows internals
* Better visibility into endpoint operations
* Practical exposure to Windows administrative commands
* Stronger incident investigation capability
* Enhanced networking and troubleshooting knowledge

---

# Future Improvements

* Add PowerShell investigation commands
* Include Sysinternals tools usage
* Add Windows Event Log analysis
* Perform advanced network investigations
* Expand into Active Directory enumeration

---

# Conclusion

The TryHackMe Windows Command Line room provided practical exposure to Windows endpoint operations and strengthened foundational cybersecurity investigation skills. These concepts directly support SOC analyst responsibilities, endpoint monitoring, and incident response activities.
