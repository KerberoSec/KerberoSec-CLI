### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Tools of the Trade <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Tools of the Trade

Windows host tools live in `C:\Tools`. Linux host tools sit in the `htb-student` PATH or `/opt/`.

| Tool | Use |
|---|---|
| `PowerView` / `SharpView` | PowerShell + .NET situational awareness in AD. Replacement for `net*`. Quick wins for Kerberoast/ASREP. |
| `BloodHound` + `SharpHound` | Visualize AD relationships; map attack paths via Neo4j graph. C# ingestor for Windows. |
| `BloodHound.py` | Python ingestor (Impacket-based) for non-domain-joined Linux. |
| `Kerbrute` | Go tool. Kerberos pre-auth user enum + password spray + brute force. |
| `Impacket` | Python toolkit for Windows protocols (psexec, wmiexec, secretsdump, GetUserSPNs, GetNPUsers, etc.). |
| `Responder` | LLMNR/NBT-NS/MDNS poisoner. |
| `Inveigh` / `InveighZero` | PowerShell + C# spoofing/poisoning equivalent of Responder. |
| `rpcclient` / `rpcinfo` | Linux MS-RPC enumeration via Samba. |
| `CrackMapExec` (now NetExec) | Live-off-the-land enum/attack/post-ex over SMB, WMI, WinRM, MSSQL. |
| `Rubeus` | C# Kerberos abuse: Kerberoasting, ASREProasting, S4U, ticket import. |
| `GetUserSPNs.py` | Impacket Kerberoast helper. |
| `Hashcat` | GPU password cracker. |
| `enum4linux` / `enum4linux-ng` | SMB/Samba enum, password policy, user/group dump. |
| `ldapsearch` / `windapsearch` | LDAP query tools for users/groups/computers. |
| `DomainPasswordSpray.ps1` | PowerShell domain-aware password spray (auto-pulls policy + user list). |
| `LAPSToolkit` | Audit/abuse Microsoft LAPS deployments. |
| `smbmap` | Domain-wide SMB share enum. |
| `psexec.py` / `wmiexec.py` | Impacket lateral-movement shells. |
| `Snaffler` | Hunt for creds/sensitive data on accessible shares. |
| `smbserver.py` | Quick SMB server for file transfer to/from Windows hosts. |
| `setspn.exe` | Built-in SPN add/read/modify/delete. |
| `Mimikatz` | Pass-the-hash, plaintext password / Kerberos ticket extraction. |
| `secretsdump.py` | Remote SAM/LSA/NTDS dump. |
| `evil-winrm` | WinRM interactive shell from Linux. |
| `mssqlclient.py` | Impacket MSSQL client. |
| `noPac.py` | CVE-2021-42278 + CVE-2021-42287 standard user → DA. |
| `rpcdump.py` | Impacket RPC endpoint mapper. |
| `CVE-2021-1675.py` | PrintNightmare PoC. |
| `ntlmrelayx.py` | Impacket SMB relay. |
| `PetitPotam.py` | CVE-2021-36942 auth coercion via MS-EFSRPC. |
| `gettgtpkinit.py` / `getnthash.py` | PKINIT cert/TGT manipulation; U2U PAC NT hash extraction. |
| `adidnsdump` | Dump DNS records from AD-integrated DNS. |
| `gpp-decrypt` | Crack Group Policy Preferences cpasswords. |
| `GetNPUsers.py` | Impacket ASREProast. |
| `lookupsid.py` | SID brute force. |
| `ticketer.py` | Forge TGT/TGS: Golden/Silver/inter-realm tickets. |
| `raiseChild.py` | Automated child → parent domain escalation. |
| `AD Explorer` | Sysinternals AD viewer/editor + offline snapshots. |
| `PingCastle` | AD security maturity audit. |
| `Group3r` | GPO security misconfig auditor. |
| `ADRecon` | Comprehensive AD data extraction → Excel report. |
