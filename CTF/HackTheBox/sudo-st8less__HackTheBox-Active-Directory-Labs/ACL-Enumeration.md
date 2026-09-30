### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: ACL Enumeration <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Enumerating ACLs with PowerView

`Find-InterestingDomainAcl` blasts way too much data: start from a known-controlled user and dig forward.

Get target user's SID:

```diff
+ PS> Import-Module .\PowerView.ps1
+ PS> $sid = Convert-NameToSid wley
```

<br>

Find rights wley has across the domain. Without `-ResolveGUIDs`, ACE types come back as raw GUIDs (`00299570-246d-11d0-a768-00aa006e0529` = User-Force-Change-Password). With the flag they're human-readable:

```diff
+ PS> Get-DomainObjectACL -ResolveGUIDs -Identity * | ? {$_.SecurityIdentifier -eq $sid}
```

<br>

Reverse-lookup a raw GUID without PowerView (useful when you can't load the module):

```diff
+ PS> $guid = "00299570-246d-11d0-a768-00aa006e0529"
+ PS> Get-ADObject -SearchBase "CN=Extended-Rights,$((Get-ADRootDSE).ConfigurationNamingContext)" -Filter {ObjectClass -like 'ControlAccessRight'} -Properties * | Select Name,DisplayName,DistinguishedName,rightsGuid | ? {$_.rightsGuid -eq $guid} | fl
```

<br>

Pure built-in Get-Acl alternative (slower, but works without PowerView):

```diff
+ PS> Get-ADUser -Filter * | Select-Object -ExpandProperty SamAccountName > ad_users.txt
+ PS> foreach($line in [System.IO.File]::ReadLines("C:\Users\htb-student\Desktop\ad_users.txt")) { get-acl "AD:\$(Get-ADUser $line)" | Select-Object Path -ExpandProperty Access | Where-Object {$_.IdentityReference -match 'INLANEFREIGHT\\wley'} }
```

<br>

Walking the chain (wley → damundsen via ForceChangePassword → Help Desk Level 1 GenericWrite → nested into Information Technology → GenericAll over adunn → DCSync rights):

```diff
+ PS> $sid2 = Convert-NameToSid damundsen
+ PS> Get-DomainObjectACL -ResolveGUIDs -Identity * | ? {$_.SecurityIdentifier -eq $sid2} -Verbose
```

<br>

Check group nesting:

```diff
+ PS> Get-DomainGroup -Identity "Help Desk Level 1" | select memberof
```

<br>

Continue the chain:

```diff
+ PS> $itgroupsid = Convert-NameToSid "Information Technology"
+ PS> Get-DomainObjectACL -ResolveGUIDs -Identity * | ? {$_.SecurityIdentifier -eq $itgroupsid} -Verbose
+ PS> $adunnsid = Convert-NameToSid adunn
+ PS> Get-DomainObjectACL -ResolveGUIDs -Identity * | ? {$_.SecurityIdentifier -eq $adunnsid} -Verbose
```

<br>

Look for `DS-Replication-Get-Changes` + `DS-Replication-Get-Changes-In-Filtered-Set` = DCSync.

<br>

---

<br>

### Enumerating ACLs with BloodHound

Set the user as starting node. Under `Node Info → Outbound Control Rights`:
- `First Degree Object Control` = direct rights
- `Transitive Object Control` = full chain

Right-click an edge → `Help` for abuse syntax + opsec considerations + tool refs.

Useful pre-built queries:
- `Find Shortest Paths to Domain Admins`
- `Find AS-REP Roastable Users`
- DCSync: search node → confirm `GetChanges` + `GetChangesAll`

<br>

---

<br>

### ACL Enumeration Exercise

IP: 10.129.195.215

RDP `htb-student:Academy_student_AD!`.

---

### Question 1:
What is the rights GUID for User-Force-Change-Password?

&#x1F6A9; found **00299570-246d-11d0-a768-00aa006e0529**.

---

### Question 2:
What flag can we use with PowerView to show us the ObjectAceType in a human-readable format during our enumeration?

&#x1F6A9; found **ResolveGUIDs**.

---

### Question 3:
What privileges does the user damundsen have over the Help Desk Level 1 group?

#### RDP, import PowerView, get damundsen SID, query ACL on the target group, filter by SID.

```diff
+ $ xfreerdp /v:10.129.195.215 /u:htb-student /p:'Academy_student_AD!' /dynamic-resolution
+ PS> Import-Module ./PowerView.ps1
+ PS> $damundsensid = Get-DomainUser damundsen | Select-Object -ExpandProperty objectsid
+ PS> Get-DomainObjectACL -Identity "Help Desk Level 1" -ResolveGUIDs | ? {$_.SecurityIdentifier -eq $damundsensid}
```

	ActiveDirectoryRights : ListChildren, ReadProperty, GenericWrite

&#x1F6A9; found **GenericWrite**.

---

### Question 4:
Enumerate the ActiveDirectoryRights that the user forend has over the user dpayne (Dagmar Payne).

```diff
+ PS> $sid = Convert-NameToSid forend
+ PS> Get-DomainObjectACL -ResolveGUIDs -Identity * | ? {$_.SecurityIdentifier -eq $sid}
```

	ObjectDN              : CN=Dagmar Payne,OU=HelpDesk,...
	ActiveDirectoryRights : GenericAll

&#x1F6A9; found **GenericAll**.

---

### Question 5:
What is the ObjectAceType of the first right that the forend user has over the GPO Management group?

```diff
+ PS> Get-DomainObjectACL -SearchBase "CN=GPO MANAGEMENT,OU=SECURITY GROUPS,OU=CORP,DC=INLANEFREIGHT,DC=LOCAL" -ResolveGUIDs | ? {$_.SecurityIdentifier -eq $sid} -Verbose
```

	ActiveDirectoryRights  : Self
	ObjectAceType          : Self-Membership

&#x1F6A9; found **Self-Membership**.
