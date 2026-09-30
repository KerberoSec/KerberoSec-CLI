### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Enumerating & Retrieving Password Policies <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Password Policy: from Linux (Credentialed)

CrackMapExec with valid creds:

```diff
+ $ crackmapexec smb 172.16.5.5 -u avazquez -p Password123 --pass-pol
```

<br>

---

<br>

### Password Policy: from Linux (SMB NULL Session)

`rpcclient` null session: works on legacy / upgraded-in-place DCs:

```diff
+ $ rpcclient -U "" -N 172.16.5.5
+ rpcclient $> querydominfo
+ rpcclient $> getdompwinfo
```

<br>

`enum4linux`: Samba toolkit wrapper:

```diff
+ $ enum4linux -P 172.16.5.5
```

<br>

`enum4linux-ng`: Python rewrite, JSON/YAML output, color:

```diff
+ $ enum4linux-ng -P 172.16.5.5 -oA ilfreight
```

<br>

Tool→port quick ref:

| Tool | Port |
|---|---|
| nmblookup | 137/UDP |
| nbtstat | 137/UDP |
| net | 139/TCP, 135/TCP, 49152-65535 |
| rpcclient | 135/TCP |
| smbclient | 445/TCP |

<br>

---

<br>

### Password Policy: Null Session from Windows

Establish null session:

```diff
+ C:\> net use \\DC01\ipc$ "" /u:""
```

<br>

Common errors:
- 1331 = account disabled
- 1326 = wrong password
- 1909 = account locked

<br>

---

<br>

### Password Policy: LDAP Anonymous Bind from Linux

Legacy config (pre-Server 2003 default). Pull policy fields with `ldapsearch`:

```diff
+ $ ldapsearch -h 172.16.5.5 -x -b "DC=INLANEFREIGHT,DC=LOCAL" -s sub "*" | grep -m 1 -B 10 pwdHistoryLength
```

<br>

Key fields: `minPwdLength`, `lockoutThreshold`, `pwdProperties` (1 = complexity enabled).

<br>

---

<br>

### Password Policy: from Windows

Built-in `net.exe`:

```diff
+ C:\> net accounts
```

<br>

PowerView:

```diff
+ PS> Import-Module .\PowerView.ps1
+ PS> Get-DomainPolicy
```

<br>

---

<br>

### Analyzing the Policy

INLANEFREIGHT.LOCAL example:
- Min length: 8
- Lockout threshold: 5
- Lockout duration: 30 min (auto-unlock)
- Complexity: enabled

Default new-domain policy:

| Policy | Default |
|---|---|
| Enforce password history | 24 days |
| Maximum password age | 42 days |
| Minimum password age | 1 day |
| Minimum password length | 7 |
| Complexity | Enabled |
| Reversible encryption | Disabled |
| Account lockout duration | Not set |
| Account lockout threshold | 0 |
| Reset lockout counter after | Not set |

<br>

---

<br>

### Enumerating & Retrieving Password Policies Exercise

IP: 10.129.22.59

SSH `htb-student:HTB_@cademy_stdnt!`.

---

### Question 1:
What is the default Minimum password length when a new domain is created?

#### Pulled from default-policy table above.

&#x1F6A9; found **7**.

---

### Question 2:
What is the minPwdLength set to in the INLANEFREIGHT.LOCAL domain?

#### SSH in, confirm 172.16.5.0/23 reachable, run enum4linux-ng pulling password policy via SMB null session.

```diff
+ $ ssh htb-student@10.129.22.59
+ $ enum4linux-ng -P 172.16.5.5
```

	domain_password_information:
	  pw_history_length: 24
	  min_pw_length: 8

&#x1F6A9; found **8**.
