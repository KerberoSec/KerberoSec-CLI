# Love

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Windows |
| **Difficulty** | Easy |
| **IP Address** | 10.129.124.83 |
| **Status** | Retired |

## Overview
Love is an Easy Windows machine built around a PHP "Voting System" application and a companion file-scanner utility. The file scanner is vulnerable to Server-Side Request Forgery (SSRF), which is abused to reach an internal-only password manager and recover credentials. Those credentials unlock the Voting System's admin panel, which suffers from an authenticated file-upload RCE. Privilege escalation to `NT AUTHORITY\SYSTEM` is achieved through an `AlwaysInstallElevated` misconfiguration.

## Reconnaissance
An `nmap` scan showed a Windows host running Apache/PHP alongside standard Windows services:

```
80/tcp   open  http         Apache httpd 2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27 - "Voting System using PHP"
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
443/tcp  open  ssl/http     403 Forbidden (cert CN=staging.love.htb, org=ValentineCorp)
445/tcp  open  microsoft-ds Windows 10 Pro 19042
3306/tcp open  mysql?
5000/tcp open  http         403 Forbidden
```

The TLS certificate on port 443 leaked the virtual host `staging.love.htb`, and SMB/NetBIOS enumeration confirmed the hostname `LOVE` on a Windows 10 Pro 19042 build.

## Enumeration
Adding `staging.love.htb` to the hosts file exposed a "demo" file-scanner page that accepts a target URL/IP to scan. Pointing it at `127.0.0.1:5000` (the otherwise 403-forbidden service) returned credentials embedded in the response: `admin : @LoveIsInTheAir!!!!`. The scanner's URL parameter is effectively an SSRF primitive, letting the attacker pivot into services bound only to localhost. Logging into the port-5000/administrative panel with these credentials confirmed access to the Voting System's admin area, which allows adding voters together with a photo upload: a classic avenue for a web shell.

## Foothold
The Voting System "Add Voter" form uploads a photo without validating its contents, allowing a PHP web shell to be stored under `images/`. `files/exploit.py` automates this chain:

1. Logs into `admin/login.php` with the recovered credentials.
2. Uploads a PHP payload (embedded, base64/gzip-packed reverse shell dropper) as the "photo" field of `admin/voters_add.php`, saved as `shell.php`.
3. Requests `images/shell.php`, which writes a `D3fa1t_shell.exe` reverse-shell binary to `C:\windows\temp` and executes it with the attacker's IP/port.

```powershell
python3 exploit.py   # after editing IP/PORT/creds at the top of the script
```

Catching the resulting connection with a Netcat listener produced a shell in the context of the `phoebe` user.

## Privilege Escalation
Running WinPEAS as `phoebe` flagged a classic elevation-of-privilege misconfiguration:

```
AlwaysInstallElevated set to 1 in HKLM!
AlwaysInstallElevated set to 1 in HKCU!
```

With this registry setting enabled system-wide, any MSI package is installed with SYSTEM privileges regardless of the invoking user's rights. An `msfvenom`-generated Windows x64 Meterpreter payload was packaged as an MSI and dropped into the XAMPP web root, then installed remotely, which triggered a SYSTEM-level Meterpreter session (Metasploit's `exploit/windows/local/always_install_elevated` module maps to the same technique). This granted full `NT AUTHORITY\SYSTEM` access.

## Lessons Learned
- SSRF in an internal "utility" tool can be used to reach services that are otherwise firewalled to localhost: always validate/allow-list SSRF targets.
- Unrestricted file upload on "photo" fields is a recurring path to remote code execution; content-type/extension checks must be enforced server-side.
- `AlwaysInstallElevated` should never be enabled on production Windows hosts: it turns any low-privileged user into SYSTEM via a crafted MSI.

## Tools & References
- `files/exploit.py`: custom Python PoC that logs in, uploads the PHP dropper, and triggers the reverse shell.
- WinPEAS: used to enumerate the AlwaysInstallElevated misconfiguration.
- Metasploit `exploit/windows/local/always_install_elevated`: technique used for the SYSTEM-level MSI privilege escalation.
- `test.exe` (compiled Windows reverse-shell/test binary, ~900KB): omitted from the repository per binary-hygiene policy; it was a locally generated payload artifact with no unique value beyond what `exploit.py` already documents.
