# Driver

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Windows |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.106 |
| **Status** | Retired |

## Overview
Driver is an easy-rated Windows machine themed around printer/firmware management. A basic-auth protected "MFP Firmware Update Center" web portal accepts weak default credentials, exposing a firmware-upload feature backed by an SMB share. Uploading a malicious Shell Command File (`.scf`) causes the server to reach out to an attacker-controlled listener, leaking the NTLM hash of the user `tony`. Cracking that hash yields a valid password usable over WinRM for a foothold, and privilege escalation to `NT AUTHORITY\SYSTEM` is achieved through a local printer-driver privilege escalation exploit present on the host.

## Reconnaissance
`nmap -sC -sV` against `driver.htb` (10.10.11.106) identified:

```
80/tcp  open  http         Microsoft IIS httpd 10.0
| http-auth:
| HTTP/1.1 401 Unauthorized
|_  Basic realm=MFP Firmware Update Center. Please enter password for admin
135/tcp open  msrpc        Microsoft Windows RPC
445/tcp open  microsoft-ds Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
```

The host advertises itself as `DRIVER` (Windows), and the web server on port 80 is protected by HTTP Basic Authentication for a "MFP Firmware Update Center" portal. SMB (445) was open with message signing not required/disabled, and WinRM (5985) was also reachable, confirming a typical Windows lateral-movement target once credentials are obtained.

## Enumeration
Basic-auth on the web portal accepted the trivial/default credential pair `admin:admin`, granting access to the firmware management page. The application allows an "admin" to upload printer firmware files, which are stored on an accessible SMB share ostensibly for a remote support team to review. This upload feature accepts arbitrary file types, opening the door to abusing Windows' automatic rendering of certain special files (such as `.scf`/`.url` icon files) when the containing folder is later browsed by a user/administrator via Explorer.

## Foothold
A malicious **Shell Command File** (`.scf`) was crafted so that its icon resource points to a UNC path on an attacker-controlled SMB listener (e.g. using `responder` or `impacket`'s SMB server). When uploaded to the firmware share and the file's folder was later browsed by a real user/administrator on the target, Windows automatically attempted to fetch the icon resource over SMB: leaking an NTLMv2 authentication handshake for the user `tony` to the listener.

The captured NTLM hash was cracked offline (e.g. with `hashcat`/`john`) to recover `tony`'s plaintext password. With valid credentials, a WinRM session was established:

```
evil-winrm -i driver.htb -u tony -p <cracked-password>
```

This provided the initial foothold as the standard user `tony`.

## Privilege Escalation
After upgrading the WinRM shell to a full Meterpreter session, local enumeration (e.g. via `winPEAS`/`Seatbelt` or manual driver/service checks) revealed that the machine had a vulnerable **printer driver** installed, exposing a known local privilege escalation vector related to the Windows Print Spooler / third-party printer driver stack (the well-known class of "PrintNightmare"-era print-driver privilege escalation issues affecting this era of Windows builds). Using a matching public local-exploit module against the vulnerable driver escalated the session directly to `NT AUTHORITY\SYSTEM`, allowing the root/SYSTEM flag to be read.

## Lessons Learned
- Default/weak Basic-Auth credentials (`admin:admin`) on management portals remain a common and trivially exploitable weakness.
- File upload features that place attacker-controlled content on a share browsed by other users enable classic SCF/URL-file NTLM hash leak attacks: uploads should be restricted by type and never placed where privileged users browse them directly.
- Captured NTLM hashes are only as strong as the underlying password; weak passwords are cracked quickly offline.
- Outdated/vulnerable printer drivers are a recurring Windows local privilege escalation vector and should be patched or removed if unused.

## Tools & References
- `nmap` for service enumeration.
- SMB/NTLM capture listener (Responder/Impacket `smbserver`) to harvest the leaked hash via a crafted `.scf` file.
- `hashcat`/`john` for offline NTLM hash cracking.
- `evil-winrm` for the WinRM foothold shell.
- Metasploit/Meterpreter and a public local privilege-escalation module for the vulnerable printer driver to obtain `NT AUTHORITY\SYSTEM`.
- No large binaries, captures, or key material were present locally for this machine; only the `notes` file (merged into this document) and the `nmap` scan output existed and have been preserved/cleaned up accordingly.
