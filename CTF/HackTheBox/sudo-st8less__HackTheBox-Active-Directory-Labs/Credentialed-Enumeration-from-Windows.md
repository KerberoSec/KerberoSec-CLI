### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Credentialed Enumeration: from Windows <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### ActiveDirectory PowerShell Module

Built-in admin module: 147 cmdlets. Stealthier than dropping tools.

Check loaded modules and import:

```diff
+ PS> Get-Module
+ PS> Import-Module ActiveDirectory
```

<br>

Domain info (functional level, child domains, FSMO holders):

```diff
+ PS> Get-ADDomain
```

<br>

Kerberoastable users (SPN set):

```diff
+ PS> Get-ADUser -Filter {ServicePrincipalName -ne "$null"} -Properties ServicePrincipalName
```

<br>

Trusts:

```diff
+ PS> Get-ADTrust -Filter *
```

<br>

Groups + group details + members:

```diff
+ PS> Get-ADGroup -Filter * | select name
+ PS> Get-ADGroup -Identity "Backup Operators"
+ PS> Get-ADGroupMember -Identity "Backup Operators"
```

<br>

---

<br>

### PowerView

Functions cheat sheet:

| Command | Description |
|---|---|
| `Export-PowerViewCSV` | Append results to CSV |
| `ConvertTo-SID` | User/group name → SID |
| `Get-DomainSPNTicket` | Request TGS for SPN account |
| `Get-Domain` | Current/specified AD domain object |
| `Get-DomainController` | DC list |
| `Get-DomainUser` | All / specific user |
| `Get-DomainComputer` | All / specific computer |
| `Get-DomainGroup` | All / specific group |
| `Get-DomainOU` | OU search |
| `Find-InterestingDomainAcl` | ACLs with mod rights to non-built-in objects |
| `Get-DomainGroupMember` | Group members |
| `Get-DomainFileServer` | Likely file servers |
| `Get-DomainDFSShare` | DFS shares |
| `Get-DomainGPO` | GPOs |
| `Get-DomainPolicy` | Default domain / DC policy |
| `Get-NetLocalGroup` | Local groups (local/remote) |
| `Get-NetLocalGroupMember` | Local group members |
| `Get-NetShare` | Open shares |
| `Get-NetSession` | Session info |
| `Test-AdminAccess` | Local admin check |
| `Find-DomainUserLocation` | Where specific user is logged in |
| `Find-DomainShare` | Reachable shares |
| `Find-InterestingDomainShareFile` | File-content search across shares |
| `Find-LocalAdminAccess` | Hosts where current user is local admin |
| `Get-DomainTrust` | Domain trusts |
| `Get-ForestTrust` | Forest trusts |
| `Get-DomainForeignUser` | Users in foreign-domain groups |
| `Get-DomainForeignGroupMember` | Cross-domain group members |
| `Get-DomainTrustMapping` | Map all trusts |

Specific user info:

```diff
+ PS> Get-DomainUser -Identity mmorgan -Domain inlanefreight.local | Select-Object name,samaccountname,memberof,pwdlastset,lastlogontimestamp,admincount,serviceprincipalname,useraccountcontrol
```

<br>

Recursive group membership (catches nested groups):

```diff
+ PS> Get-DomainGroupMember -Identity "Domain Admins" -Recurse
```

<br>

Trust map:

```diff
+ PS> Get-DomainTrustMapping
```

<br>

Local admin check:

```diff
+ PS> Test-AdminAccess -ComputerName ACADEMY-EA-MS01
```

<br>

SPN-set users (Kerberoast targets):

```diff
+ PS> Get-DomainUser -SPN -Properties samaccountname,ServicePrincipalName
```

<br>

---

<br>

### SharpView

.NET port of PowerView (BC-Security maintained Empire 4 fork). Useful when PowerShell is restricted.

```diff
+ PS> .\SharpView.exe Get-DomainUser -Help
+ PS> .\SharpView.exe Get-DomainUser -Identity forend
```

<br>

---

<br>

### Snaffler

Hunts shares for credentials/sensitive files in the domain context.

```diff
+ PS> .\Snaffler.exe -s -d inlanefreight.local -o snaffler.log -v data
```

<br>

Flags: `-s` = console, `-d` = domain, `-o` = log, `-v data` = data only (best signal-to-noise). Color-codes finds (red = high value).

<br>

---

<br>

### BloodHound (SharpHound from Windows)

Run from domain-joined Windows or any Windows host that can reach the domain:

```diff
+ PS> .\SharpHound.exe -c All --zipfilename ILFREIGHT
```

<br>

Drop the resulting `.zip` into BloodHound GUI → run pre-built queries. Two killer queries:
- `Find Computers with Unsupported Operating Systems`: legacy Win7 / Server 2008 = potential MS08-067/EternalBlue
- `Find Computers where Domain Users are Local Admin`: every account is local admin = quick foothold + memory dumping

<br>

---

<br>

### Credentialed Enum from Windows Exercise

IP: 10.129.198.178

RDP `htb-student:Academy_student_AD!`.

---

### Question 1:
Using Bloodhound, determine how many Kerberoastable accounts exist within the INLANEFREIGHT domain.

#### RDP in, run SharpHound with -c All, ingest the ZIP into BloodHound, run the "List All Kerberoastable Accounts" pre-built query in the Kerberos analysis section.

```diff
+ $ xfreerdp /v:10.129.198.178 /u:htb-student /p:'Academy_student_AD!' /dynamic-resolution
+ PS> cd c:\Tools
+ PS> .\SharpHound.exe -c All --zipfilename minesweeper
+ PS> cd BloodHound-GUI; .\BloodHound.exe
```

&#x1F6A9; found **13**.

---

### Question 2:
What PowerView function allows us to test if a user has administrative access to a local or remote host?

&#x1F6A9; found **Test-AdminAccess**.

---

### Question 3:
Run Snaffler and hunt for a readable web config file. What is the name of the user in the connection string within the file?

#### Snaffler the domain: finds web.config with hardcoded SQL connection string.

```diff
+ PS> .\Snaffler.exe -s -d inlanefreight.local -o snuffstuff.log -v data
```

	<add name="myConnectionString" connectionString="server=ACADEMY-EA-DB01;database=Employees;uid=sa;password=ILFREIGHTDB01!;" />

&#x1F6A9; found **sa**.

---

### Question 4:
What is the password for the database user?

#### Pulled from the same connection string.

&#x1F6A9; found **ILFREIGHTD--edit--!**.
