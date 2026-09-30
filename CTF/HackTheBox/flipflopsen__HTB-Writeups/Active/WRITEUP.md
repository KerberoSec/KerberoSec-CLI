# Active

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Windows |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.100 |
| **Status** | Retired |

## Overview
Active is an Active Directory box built around two very common real-world AD misconfigurations: a Group Policy Preferences (GPP) password left in SYSVOL, and a Kerberoastable service account. Anonymous SMB access to SYSVOL exposes a `Groups.xml` file containing an encrypted "cpassword", which decrypts using Microsoft's publicly known AES key to a plaintext local/service account password. That account is then used to enumerate and Kerberoast a service account with an SPN, whose cracked password grants Domain Administrator rights.

## Reconnaissance
An `nmap` full-port scan (`nmap -sC -sV -oN nmap/inital 10.10.10.100`) identified a Windows Server 2008 R2 SP1 domain controller for the `active.htb` domain:

```
53/tcp    open  domain        Microsoft DNS 6.1.7601 (1DB15D39) (Windows Server 2008 R2 SP1)
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
389/tcp   open  ldap          (Domain: active.htb, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          (Global Catalog)
3269/tcp  open  tcpwrapped
49152-49158/tcp open msrpc / ncacn_http
```

The presence of DNS, Kerberos, LDAP and SMB together confirmed this was a Domain Controller for `active.htb`.

## Enumeration
With SMB open, the shares were enumerated for anonymous/guest access. The `SYSVOL` share (present on every DC to distribute Group Policy Objects) was readable, which is a classic starting point on AD boxes: GPOs are frequently used to push preferences (drive mappings, scheduled tasks, local user accounts) that can contain the legacy GPP "cpassword" field.

## Foothold
A `Groups.xml` file was located inside SYSVOL containing an encrypted `cpassword` attribute. Since Microsoft published the static AES-256 key used for GPP encryption (MS14-025), the value can be decrypted offline (e.g. with `gpp-decrypt`). Decrypting the recovered blob yielded a plaintext credential:

```
GPPstillStandingStrong2k18
```

This password was tied to a domain service account, giving an initial low-privileged foothold on the domain (SMB/LDAP authentication as that user).

## Privilege Escalation
With valid low-privileged domain credentials, the domain was further enumerated for Kerberoastable accounts (accounts with a Service Principal Name set). Requesting a TGS ticket for the vulnerable SPN and cracking the resulting hash offline recovers the service account's plaintext password. Because this account held Administrator-equivalent rights, the cracked credentials could be used (e.g. via `psexec.py`/`wmiexec.py`) to obtain a SYSTEM/Administrator shell on the domain controller.

*Note: the local notes for this machine captured the recon output and the recovered GPP password but not the full command transcript for the Kerberoasting/crack stage; the description above reflects the standard, publicly documented technique for this retired machine rather than a fabricated command log.*

## Lessons Learned
- Legacy Group Policy Preferences passwords are trivially reversible: never store credentials in GPOs.
- Anonymous/guest read access to SYSVOL should be restricted where possible and audited.
- Kerberoasting highlights the importance of long, random service account passwords and minimal privilege assignment for SPN-bearing accounts.

## Tools & References
- `nmap` for service/version discovery.
- `gpp-decrypt` (or CrackMapExec/PowerSploit `Get-GPPPassword`) for decrypting the GPP cpassword.
- Impacket (`GetUserSPNs.py`, `psexec.py`) for Kerberoasting and remote execution.
- `hashcat`/`john` for offline cracking of the Kerberoast TGS-REP hash.
- Public reference: MS14-025 (Group Policy Preferences credential disclosure).
