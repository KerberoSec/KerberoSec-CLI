### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Initial Enumeration of the Domain <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Initial Enumeration of the Domain

Internal pentest: 172.16.5.0/23 only, grey-box, non-evasive, optional `htb-student` AD account but starting unauthenticated.

Key data points to hunt for:

| Data | Why |
|---|---|
| AD users | Spray targets |
| AD-joined computers | DCs, file servers, SQL, web, Exchange, etc. |
| Key services | Kerberos, NetBIOS, LDAP, DNS |
| Vulnerable hosts/services | Quick wins |

Passive listening:

```diff
+ $ sudo -E wireshark
+ $ sudo tcpdump -i ens224
+ $ sudo responder -I ens224 -A
```

<br>

Active sweep (alive hosts only, no per-target spam):

```diff
+ $ fping -asgq 172.16.5.0/23
```

<br>

Nmap aggressive scan with output to all formats:

```diff
+ $ sudo nmap -v -A -iL hosts.txt -oA host-enum
```

<br>

Look for: DC services (53/88/389/636/3268/3269), legacy OS banners (Win7/Server2008 = MS08-067/EternalBlue territory), MSSQL on 1433.

User enum via Kerberos pre-auth (no failed-logon events):

```diff
+ $ git clone https://github.com/ropnop/kerbrute.git
+ $ cd kerbrute && sudo make all
+ $ sudo mv dist/kerbrute_linux_amd64 /usr/local/bin/kerbrute
```

<br>

Run user enum against DC with `jsmith.txt` from [statistically-likely-usernames](https://github.com/insidetrust/statistically-likely-usernames):

```diff
+ $ kerbrute userenum -d INLANEFREIGHT.LOCAL --dc 172.16.5.5 jsmith.txt -o valid_ad_users
```

<br>

Pivot to SYSTEM-level on a domain-joined host (MS08-067 / EternalBlue / BlueKeep / SeImpersonate via JuicyPotato / 0-day local privesc / psexec with local admin): SYSTEM ≈ domain user via computer account impersonation.

Be aware: aggressive Nmap, vuln scripts, and tools like Inveigh/Responder are noisy. Communicate stealth requirements with the client up front.

<br>

---

<br>

### Initial Enumeration Exercise

IP: 10.129.225.44

SSH `htb-student:HTB_@cademy_stdnt!`.

---

### Question 1:
From your scans, what is the "commonName" of host 172.16.5.5?

#### SSH in, verify subnet routing on `ens224`, fire targeted nmap.

```diff
+ $ ssh htb-student@10.129.225.44
+ $ ip a
+ $ nmap -sT -sC -sV -v -F 172.16.5.5
```

	| ssl-cert: Subject:
	| Subject Alternative Name: DNS:ACADEMY-EA-DC01.INLANEFREIGHT.LOCAL, DNS:INLANEFREIGHT.LOCAL, DNS:INLANEFREIGHT
	| Issuer: commonName=INLANEFREIGHT-CA

&#x1F6A9; found **ACADEMY-EA-DC--edit--.INLANEFREIGHT.LOCAL**.

---

### Question 2:
What host is running "Microsoft SQL Server 2019 15.00.2000.00"? (IP, not name)

#### Sweep alive hosts in /23, then scan the non-DC candidates for MSSQL banner.

```diff
+ $ fping -asgq 172.16.5.0/23
+ $ nmap -sT -sV -v -F 172.16.5.130
```

	1433/tcp open  ms-sql-s      Microsoft SQL Server 2019 15.00.2000

&#x1F6A9; found **172.16.5.--edit--**.
