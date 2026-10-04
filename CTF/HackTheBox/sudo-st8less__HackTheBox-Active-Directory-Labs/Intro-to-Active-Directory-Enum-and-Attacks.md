### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Introduction <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Introduction to Active Directory Enumeration & Attacks

`Active Directory` (AD): Windows directory service, released with Server 2000. Built on x.500/LDAP. Centralized management of users, computers, groups, GPOs, trusts. Provides authentication, authorization, accounting in Windows enterprise environments.

Why care? Microsoft AD holds ~43% of enterprise IAM market share. 2000+ Microsoft CVEs in the last two years. Misconfigured services + permissions + user/OS vulns = perfect storm.

Goal of an AD-focused engagement: gain a foothold, then escalate vertically/laterally toward the assessment objective (specific host, mailbox, DB, full DA compromise). Tools to know: `Sysinternals`, `WMI`, `DNS`, `Responder`, `Kerbrute`, `BloodHound`, `PowerView`, `SharpView`, `Hashcat`.

Must be comfortable enumerating/attacking AD from both Linux and Windows: sometimes from a managed workstation or VDI ("living off the land").

<br>

---

<br>

### Real-World Examples

| Scenario | Path |
|---|---|
| 1 | SYSTEM on a domain host → Kerberoast → cracked TGS overnight with `d3ad0ne` rule → wrote SCF files to shares with Responder → captured DA NetNTLMv2 hash. |
| 2 | SMB NULL → user list + password policy → spray `Spring@18` → BloodHound → found DA session on host → Rubeus pulled TGT → pass-the-ticket → DA + cross-domain takeover via nested groups. |
| 3 | LinkedIn2Username + statistically-likely-usernames + Kerbrute userenum → 516 valid users → spray `Welcome2021` → BloodHound → all users had RDP to a single box → DomainPasswordSpray with `Fall2021` → Help Desk user with GenericAll on Enterprise Key Admins → Shadow Credentials → DCSync. |

<br>

---

<br>

### Connecting to the Lab Hosts

FreeRDP to Windows attack host (`MS01`):

```diff
+ $ xfreerdp /v:<MS01 IP> /u:htb-student /p:Academy_student_AD!
```

<br>

SSH to Parrot Linux attack host (`ATTACK01`):

```diff
+ $ ssh htb-student@<ATTACK01 IP>
```

<br>

`ATTACK01` also runs XRDP for GUI access (BloodHound):

```diff
+ $ xfreerdp /v:<ATTACK01 IP> /u:htb-student /p:HTB_@cademy_stdnt!
```

<br>

Toolkit:
- Windows host: `C:\Tools` directory + AD PowerShell module loaded on PS launch.
- Linux host: tools in `htb-student` PATH or under `/opt/`.
