# Windows Fundamentals 1: Notes

## 📌 Overview

**Windows Fundamentals 1** is a foundation-level introduction to the Windows operating system.

The goal of this lab was to understand the basic purpose of common Windows components rather than master them immediately.

Topics covered:

- Windows Editions
- Windows Desktop / GUI
- Introduction to Windows
- Remote Desktop Protocol (RDP)
- NTFS
- NTFS Permissions
- Alternate Data Streams (ADS)
- `%windir%`
- `System32`
- User Accounts
- User Profiles
- Local Users and Groups
- User Permissions
- User Account Control (UAC)
- Settings
- Control Panel
- Installed Software
- Task Manager
- Processes
- CPU and RAM usage

---

# 🧠 Key Concepts

## 1. Windows Editions

Windows has different editions for different use cases.

The lab introduced:

| Edition / Environment | General Purpose |
|---|---|
| Windows Home | Consumer / personal use |
| Windows Pro | Professional / business use |
| Windows Server | Server / infrastructure workloads |

The Windows virtual machine used in this room was **Windows Server 2019 Standard**.

### Why the OS matters

For a SOC Analyst, identifying the operating system and version is useful because the OS affects:

- Available security features
- System behavior
- Administrative tools
- Logging capabilities
- Support status

### EOL

**EOL = End of Life**

An EOL operating system is no longer in its normal supported lifecycle. Unsupported systems can increase security risk because they may not receive normal security updates.

---

# 2. Windows Desktop / GUI

## GUI

**GUI = Graphical User Interface**

The Windows Desktop is the graphical environment shown after successful authentication.

Important components introduced in the lab:

1. Desktop
2. Start Menu
3. Search
4. Task View
5. Taskbar
6. Toolbars
7. Notification Area / System Tray

### Local Account

An account that exists on a particular Windows computer.

### Domain Account

An account managed centrally through an organization's directory environment, such as Active Directory (AD).

### Credentials

Information used for authentication, such as a username and password.

---

## Desktop

The Desktop is the main workspace after login.

It can contain shortcuts to:

- Applications
- Files
- Folders
- System locations

Right-clicking provides a context menu with actions relevant to the selected location or object.

---

## Start Menu

The Start Menu provides access to:

- Applications
- Files
- Settings
- User/account functions
- Power options

Power options can include:

- Shut down
- Restart
- Sleep
- Lock

---

## Taskbar

The Taskbar is used to:

- Launch applications
- Switch between open applications
- Access Start
- Access Search
- Access Task View
- Access system functions

### Pinned vs Running

A pinned application is a shortcut kept on the Taskbar.

A running application is currently executing.

These are not the same thing.

---

## Notification Area / System Tray

The Notification Area can show:

- Time/date
- Network status
- Volume
- Application/system icons

It can provide a quick visual clue that certain software may be active, but it is **not a reliable method for determining whether a process is running**.

For investigation, better sources include:

- Task Manager
- Services
- PowerShell
- Event Viewer
- EDR telemetry

---

## Task View

Task View allows users to view and switch between open windows and, depending on the Windows configuration, virtual desktops.

---

## Windows Search

Windows Search can locate:

- Applications
- Files
- Settings
- Administrative tools

Examples:

```text
Task Manager
Event Viewer
PowerShell
Command Prompt
Services
Control Panel
```

---

# 3. AttackBox and Windows Lab Machine

TryHackMe can provide an **AttackBox** and a separate **Lab Machine**.

| Machine | Purpose |
|---|---|
| AttackBox | Working / analyst environment |
| Lab Machine | Windows system being studied |

Conceptually:

```text
AttackBox
    │
    │ Network
    ↓
Windows Lab Machine
```

The Windows lab machine is the system being interacted with during the room.

---

# 4. Remote Desktop Protocol (RDP)

## RDP

**RDP = Remote Desktop Protocol**

RDP is Microsoft's protocol for remotely accessing and interacting with a Windows computer.

Instead of physically sitting at the Windows system:

```text
Your Computer
     ↓
    RDP
     ↓
Remote Windows Machine
```

you receive a remote graphical Windows session.

---

## RDP Authentication

The basic authentication flow is:

```text
IP Address
    +
Username
    +
Password
    ↓
Authentication
    ↓
Windows Session
```

The lab credentials are **lab-only information** and should not be published in a public repository.

Do not place passwords, tokens, or other secrets in GitHub documentation.

---

## SOC Relevance

RDP itself is not malicious.

It is a legitimate remote administration protocol that can also be abused by attackers.

During a SOC investigation, useful questions include:

- Who logged in?
- Which account was used?
- Where did the connection originate?
- When did the login occur?
- Was the login successful?
- Was the RDP access authorized?
- What happened after the remote session was established?

This eventually connects to:

```text
RDP Login
   ↓
User Session
   ↓
Process Execution
   ↓
File Activity
   ↓
Network Activity
   ↓
Windows Event Logs
   ↓
SIEM Alert
   ↓
SOC Investigation
```

---

# 5. Windows File System

## NTFS

**NTFS = New Technology File System**

NTFS is a commonly used Windows file system.

The lab also introduced older filesystem concepts such as:

- FAT16
- FAT32
- HPFS

For Windows endpoint security work, NTFS is particularly important.

---

## NTFS Features

The lab introduced NTFS features including:

- File and folder permissions
- Journaling
- Encryption through EFS
- Alternate Data Streams

---

## NTFS Permissions

NTFS permissions control who can access or modify files and folders.

Important permissions introduced include:

| Permission | Basic Meaning |
|---|---|
| Full Control | Broad control over the object |
| Modify | Modify and, where applicable, delete |
| Read & Execute | Read and execute applicable files |
| List Folder Contents | View/list folder contents |
| Read | Read/view data |
| Write | Create or modify applicable data |

Permissions can be assigned to users and groups.

---

## Permission Mental Model

```text
User
  │
  ├── Direct Permissions
  │
  └── Group Membership
          │
          ↓
    Group Permissions
          │
          ↓
     Effective Access
```

This becomes important when investigating:

- Account compromise
- Privilege escalation
- Unauthorized file access
- Lateral movement
- Access control

---

## NTFS Journaling

NTFS is a journaling filesystem.

The journal helps Windows with filesystem recovery and tracking filesystem operations needed for recovery.

Do not confuse:

```text
NTFS Journal
    ↓
Filesystem-related information/recovery
```

with:

```text
Windows Event Logs
    ↓
Operating-system and security event records
```

They serve different purposes.

---

## EFS

**EFS = Encrypting File System**

EFS provides file-level encryption.

Do not confuse it with BitLocker:

```text
EFS
 ↓
File-level encryption

BitLocker
 ↓
Volume/device-level encryption
```

---

# 6. Alternate Data Streams (ADS)

## ADS

**ADS = Alternate Data Streams**

NTFS allows a file to contain multiple data streams.

Conceptually:

```text
file.txt
   │
   ├── Main data stream
   │
   └── Alternate Data Stream
```

The normal data stream is associated with `$DATA`.

---

## Security Relevance

ADS is a legitimate NTFS feature, but attackers can abuse it to hide data.

Therefore:

```text
ADS detected
    ↓
Investigate
    ↓
Determine context
    ↓
Legitimate or suspicious?
```

Do not use:

```text
ADS = Malware
```

That conclusion would be too strong without additional evidence.

---

# 7. Windows Directory and `%windir%`

The Windows installation is commonly located at:

```text
C:\Windows
```

However, Windows does not have to be installed on the C: drive.

## `%windir%`

`%windir%` is an environment variable representing the Windows installation directory.

Typical example:

```text
%windir%
    ↓
C:\Windows
```

This is more reliable than assuming Windows is always installed at `C:\Windows`.

---

## Environment Variables

Environment variables store values about the operating-system environment.

Examples:

```text
%windir%
%PATH%
%TEMP%
%USERNAME%
```

They are commonly encountered in:

- Command Prompt
- PowerShell
- Scripts
- Process command lines
- Windows administration

---

# 8. System32

A common System32 path is:

```text
%windir%\System32
```

which normally resolves to:

```text
C:\Windows\System32
```

System32 contains many important Windows:

- Executables
- Libraries
- Utilities
- Operating-system files

---

## System32 Safety

System32 is a critical Windows directory.

Do not randomly:

- Delete files
- Rename files
- Modify files

Doing so can cause Windows to malfunction.

For learning purposes:

> Inspect and understand System32; do not modify it destructively.

---

## SOC Relevance

A process may have an executable path such as:

```text
C:\Windows\System32\example.exe
```

The path is useful evidence, but it is not proof that the executable is legitimate.

A stronger investigation considers:

```text
Process
   ↓
Executable
   ↓
File Path
   ↓
Command Line
   ↓
Parent Process
   ↓
User
   ↓
Network Activity
```

---

# 9. User Accounts

Two broad account types introduced in the lab are:

## Administrator

An Administrator account has greater privileges and can perform system-level administrative actions.

Examples include:

- Managing users
- Managing groups
- Installing software
- Changing system settings

## Standard User

A Standard User has more limited permissions.

The account can perform normal user activities but is restricted from many system-level administrative operations.

---

## Administrator vs Standard User

```text
Administrator
     ↓
Higher privileges
     ↓
Greater ability to modify the system

Standard User
     ↓
Lower privileges
     ↓
More restricted access
```

### SOC relevance

Account privilege matters when investigating:

- Account compromise
- Privilege escalation
- Unauthorized administrative actions
- Lateral movement

---

# 10. User Profiles

User profiles are normally stored under:

```text
C:\Users
```

A user's profile can contain folders such as:

```text
Desktop
Documents
Downloads
Music
Pictures
```

Example:

```text
C:\Users\<username>\Downloads
```

A downloaded file may appear there, but the location alone does not prove the file is malicious.

---

## User Profile Creation

Conceptually:

```text
New User Account
       ↓
First Login
       ↓
User Profile Service
       ↓
Profile Created
       ↓
C:\Users\<username>
```

---

# 11. Local Users and Groups

Windows provides the Local Users and Groups management console:

```text
lusrmgr.msc
```

It contains:

```text
Local Users and Groups
        │
        ├── Users
        │
        └── Groups
```

### Users

The Users section contains local user accounts.

### Groups

The Groups section contains local security groups.

---

## Why Groups Matter

Instead of assigning every permission individually, Windows can assign privileges and permissions through groups.

Example:

```text
Administrators
      │
      ├── Alice
      ├── Bob
      └── Charlie
```

A user can also belong to multiple groups.

Example:

```text
Alice
 │
 ├── Users
 ├── Remote Desktop Users
 └── AnotherGroup
```

Therefore:

> When investigating a compromised account, identify its group memberships, not only the username.

---

# 12. User Account Control (UAC)

## UAC

**UAC = User Account Control**

UAC is a Windows security mechanism designed to control privilege elevation.

---

## Administrator Does Not Mean Always Elevated

This is one of the most important concepts from the lab.

An Administrator account does not mean that every process automatically runs with full administrative privileges.

Conceptually:

```text
Administrator Account
        │
        ├── Normal Activity
        │       ↓
        │   Normal Context
        │
        └── Privileged Operation
                ↓
             UAC Prompt
                ↓
             Elevation
```

---

## Standard User and UAC

A Standard User may attempt an action requiring administrator privileges.

Conceptually:

```text
Standard User
      ↓
Privileged Operation
      ↓
UAC Prompt
      ↓
Administrator Credentials
      ↓
Elevation
```

Without valid authorization, the privileged operation does not proceed.

---

## UAC Shield

The UAC shield icon indicates that an action may require elevation.

It does **not** mean that the application is malware.

Legitimate applications can require administrative privileges.

---

## UAC Is Not Antivirus

Do not think:

```text
UAC = Malware Protection
```

Instead:

```text
UAC
 ↓
Privilege Elevation Control
```

Malware can still execute under a standard user context.

---

## UAC and SOC Investigation

Useful investigation questions include:

- Which account launched the process?
- Did the process request elevation?
- Was elevation successful?
- What happened after elevation?
- Did the elevated process modify the system?

Mental model:

```text
Account Privilege
      ↓
Process Privilege
      ↓
Elevation Request
      ↓
UAC
      ↓
Resulting System Activity
```

---

# 13. Settings and Control Panel

Windows provides two major configuration interfaces:

```text
Windows Configuration
        │
        ├── Settings
        │
        └── Control Panel
```

## Settings

Settings is the modern Windows configuration interface.

It provides access to areas such as:

- System
- Network & Internet
- Personalization
- Accounts
- Applications
- Devices
- Updates
- Privacy/security-related settings

---

## Control Panel

Control Panel is the older/traditional Windows configuration interface.

It still exposes configuration options that may not be directly available in Settings.

Examples include:

- Programs and Features
- Some network configuration
- Hardware configuration
- Administrative configuration
- Legacy system settings

---

## Settings vs Control Panel

| Settings | Control Panel |
|---|---|
| Modern interface | Traditional/legacy interface |
| Primary configuration interface in modern Windows | Still contains many legacy/advanced options |
| Easier for general configuration | Contains older administrative interfaces |
| Some options can redirect to Control Panel | Provides interfaces not fully migrated to Settings |

---

# 14. Installed Applications

A useful Control Panel path is:

```text
Control Panel
     ↓
Programs
     ↓
Programs and Features
```

This can show information such as:

- Application name
- Publisher
- Version

---

## SOC Relevance

Installed software can be an investigation clue.

Questions include:

- What software is installed?
- Who published it?
- What version is installed?
- Was it expected?
- Is it authorized?
- Is it related to the incident?

However:

> Programs and Features is not a complete inventory of every executable or application on a Windows system.

Portable applications, scripts, and other artifacts may not appear there.

---

# 15. Network Adapter Configuration

A network adapter is the Windows interface used to connect to a network.

Examples:

- Ethernet
- Wi-Fi

The Windows configuration path may move between Settings and Control Panel.

Conceptually:

```text
Settings
   ↓
Network & Internet
   ↓
Change Adapter Options
   ↓
Control Panel
```

Network configuration can affect:

- IP addressing
- Connectivity
- DNS
- Routing
- Network interfaces

These concepts become more important during network-security learning.

---

# 16. Task Manager

## What Is Task Manager?

Task Manager is a built-in Windows utility that provides basic visibility into what is happening on a Windows system.

It can show:

- Running applications
- Running processes
- CPU usage
- RAM usage
- System performance information

---

## Process

A **process** is a running instance of a program.

Conceptually:

```text
Program on Disk
      ↓
Program Executes
      ↓
Process Created
      ↓
Windows Manages Process
```

Example:

```text
chrome.exe
    ↓
Chrome process running
```

---

## File vs Process

This distinction is fundamental:

```text
File
 ↓
Stored on disk
```

versus:

```text
Process
 ↓
Currently executing
```

A file existing on disk does not mean it is currently running.

---

## CPU

**CPU = Central Processing Unit**

CPU performs instructions for running programs and operating-system activity.

Task Manager can display CPU utilization.

Example:

```text
CPU: 25%
```

---

## RAM

**RAM = Random Access Memory**

RAM is temporary working memory used by running programs and the operating system.

Task Manager can display memory utilization.

Example:

```text
Memory: 70%
```

---

## Simple View vs More Details

Task Manager may initially open in a limited view.

Selecting:

```text
More details
```

opens the detailed interface.

The detailed view is more useful for technical troubleshooting and security investigation.

---

# 17. Process Investigation

Seeing a process does not automatically tell me whether it is malicious.

For example:

```text
powershell.exe
```

only tells me that PowerShell is running.

A SOC Analyst needs additional context:

```text
Process
   ↓
Executable Path
   ↓
Command Line
   ↓
Parent Process
   ↓
User Account
   ↓
Start Time
   ↓
Network Connections
   ↓
File / Registry Activity
```

---

## CPU Usage as a Clue

If a machine becomes slow and Task Manager shows:

```text
CPU
 ↓
99%
```

I can identify which process is consuming the CPU.

Example:

```text
Process A → 5%
Process B → 10%
Process C → 80%
Process D → 4%
```

Process C becomes a candidate for investigation.

But:

> **High CPU usage does not automatically mean malware.**

Remember:

```text
Indicator ≠ Proof
```

---

## RAM Usage as a Clue

The same principle applies to memory.

Possible causes of high RAM usage include:

- Legitimate applications
- Browser tabs
- Virtual machines
- Memory leaks
- Normal system activity
- Malware

Additional evidence is required before concluding that activity is malicious.

---

# 18. Task Manager Is a Starting Point

Task Manager provides basic endpoint visibility.

It is not a complete SOC investigation platform.

A deeper investigation may require:

- Windows Event Logs
- Sysmon
- Endpoint Detection and Response (EDR)
- Security Information and Event Management (SIEM)
- PowerShell logs
- Network telemetry
- Process creation events

---

# 🛡️ SOC Relevance

The concepts from Windows Fundamentals 1 connect together:

```text
Windows Endpoint
│
├── Users
│     └── Permissions
│
├── Files
│     └── NTFS
│
├── Processes
│     └── Task Manager
│
├── System
│     └── Windows / System32
│
├── Security
│     └── UAC
│
└── Configuration
      ├── Settings
      └── Control Panel
```

Later this becomes:

```text
Windows Endpoint
      ↓
Logs + Telemetry
      ↓
Detection
      ↓
Investigation
      ↓
Incident Response
```

---

# 🔎 Important Investigation Questions

When investigating Windows activity, useful questions include:

### User

Who is the user?

### Account

Is the account Administrator or Standard User?

### Groups

Which groups does the account belong to?

### Files

What files were accessed or modified?

### Permissions

Who can access or modify the file?

### Process

What process is running?

### Executable

Where is the executable located?

### Command Line

What command line was used?

### Parent Process

What process launched it?

### Network

What network connections did it make?

### Privilege

Was privilege elevation requested?

### Timeline

When did the activity occur?

---

# ⚠️ Things to Remember

- Windows is widely used in enterprise environments.
- Operating systems have support lifecycles.
- EOL systems can increase security risk.
- Windows Server and Windows desktop environments have different roles.
- GUI means Graphical User Interface.
- RDP means Remote Desktop Protocol.
- RDP is legitimate but can be abused.
- AttackBox and the Windows lab machine are different environments.
- NTFS means New Technology File System.
- NTFS permissions control access to files and folders.
- NTFS is a journaling filesystem.
- EFS provides file-level encryption.
- ADS means Alternate Data Streams.
- ADS is legitimate but can be abused.
- ADS does not automatically mean malware.
- `%windir%` identifies the Windows installation directory.
- System32 contains important Windows components.
- Do not randomly modify System32.
- A System32 path alone does not prove an executable is legitimate.
- User profiles are normally stored under `C:\Users`.
- `lusrmgr.msc` opens Local Users and Groups.
- Group membership can affect effective access.
- UAC controls privilege elevation.
- Administrator does not mean every process is automatically elevated.
- UAC is not antivirus.
- Settings and Control Panel both exist in modern Windows.
- Programs and Features provides basic installed-software information.
- Task Manager shows processes and resource usage.
- A process is a running instance of a program.
- High CPU or RAM usage is an investigation clue, not proof of malware.
- Task Manager is a starting point, not a complete SOC investigation tool.

---

# 🧠 My Key Takeaways

## 1. Windows fundamentals come before Windows security investigation

I need to understand normal Windows behavior before I can confidently identify abnormal behavior.

## 2. Users, groups, and permissions are connected

```text
User
 ↓
Groups
 ↓
Permissions
 ↓
Effective Access
```

## 3. Processes are different from files

```text
File
 ↓
Stored on disk

Process
 ↓
Currently executing
```

## 4. UAC is about privilege elevation

```text
User
 ↓
Privileged Operation
 ↓
UAC
 ↓
Elevation
```

## 5. System32 is important, but the path alone is not enough

A process being located in System32 is only one piece of evidence.

## 6. Security analysis requires context

```text
RDP
  ≠
Attack
```

```text
ADS
  ≠
Malware
```

```text
High CPU
  ≠
Malware
```

```text
System32
  ≠
Automatically Legitimate
```

The correct approach is to gather additional evidence.

---

# 🚀 Further Learning

The lab points toward deeper Windows topics:

- Important Windows folders and files
- Windows Management Consoles
- Windows Defender
- Windows Firewall
- Core Windows Processes
- Windows Event Logs
- PowerShell
- Sysmon
- Endpoint Detection and Response (EDR)
- Security Information and Event Management (SIEM)
- Windows authentication
- Active Directory
- Privilege escalation
- Windows endpoint investigation

A logical next step after learning basic processes is understanding **Core Windows Processes**.

---

# 🧠 Final Mental Model

```text
                         WINDOWS ENDPOINT
                                │
          ┌─────────────────────┼─────────────────────┐
          ↓                     ↓                     ↓
       USERS                  FILES                PROCESSES
          │                     │                     │
    ┌─────┴─────┐             NTFS              Task Manager
    ↓           ↓               │                     │
 Admin       Standard       Permissions            CPU / RAM
 User          User             │                     │
    │           │              ADS                   │
    └─────┬─────┘              │                     │
          ↓                     ↓                     ↓
      Groups                 System32             Execution
          │                     │                     │
          └──────────────┬──────┴─────────────────────┘
                         ↓
                  WINDOWS SECURITY
                         │
                         ├── UAC
                         ├── Authentication
                         ├── Permissions
                         └── Configuration
                                  │
                         ┌────────┴────────┐
                         ↓                 ↓
                     Settings        Control Panel
                         │
                         └────────┬────────┘
                                  ↓
                           SYSTEM ACTIVITY
                                  ↓
                         LOGS + TELEMETRY
                                  ↓
                            SOC DETECTION
                                  ↓
                           INVESTIGATION
                                  ↓
                        INCIDENT RESPONSE
```

---

# 🎯 Knowledge Check

Before moving on, I should be able to answer these without looking at my notes:

1. What is the difference between an Administrator and a Standard User?
2. What is UAC?
3. Why does an Administrator account not mean every process is elevated?
4. What is NTFS?
5. What are NTFS permissions?
6. What is an Alternate Data Stream?
7. Why can ADS be relevant to security investigations?
8. What is `%windir%`?
9. What is the purpose of `C:\Windows\System32`?
10. Where are Windows user profiles normally stored?
11. What does `lusrmgr.msc` open?
12. Why is group membership important?
13. What is RDP?
14. Why can legitimate RDP activity still be security-relevant?
15. What is a process?
16. What is the difference between a file and a process?
17. What can Task Manager tell you?
18. Why doesn't high CPU usage automatically mean malware?
19. What is the difference between Settings and Control Panel?
20. Why is understanding normal Windows behavior important for a SOC Analyst?
