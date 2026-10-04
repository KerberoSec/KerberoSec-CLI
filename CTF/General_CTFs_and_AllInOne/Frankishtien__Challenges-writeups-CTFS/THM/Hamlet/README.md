# TryHackMe Hamlet Writeup 

------

## Nmap Scan

```
nmap -sCV -Pn Macine_Ip
```

```ruby
Nmap scan report for 10.112.168.133
Host is up (0.51s latency).
Not shown: 984 filtered tcp ports (no-response)
PORT      STATE  SERVICE  VERSION
20/tcp    closed ftp-data
21/tcp    open   ftp      vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -rwxr-xr-x    1 0        0             113 Sep 15  2021 password-policy.md
|_-rw-r--r--    1 0        0            1425 Sep 15  2021 ufw.status
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.137.69
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp    open   ssh      OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 a0:ef:4c:32:28:a6:4c:7f:60:d6:a6:63:32:ac:ab:27 (RSA)
|   256 5a:6d:1a:39:97:00:be:c7:10:6e:36:5c:7f:ca:dc:b2 (ECDSA)
|_  256 0b:77:40:b2:cc:30:8d:8e:45:51:fa:12:7c:e2:95:c7 (ED25519)
80/tcp    open   http     lighttpd 1.4.45
|_http-server-header: lighttpd/1.4.45
|_http-title: Hamlet Annotation Project
8000/tcp  open   http     Apache httpd 2.4.48 ((Debian))
|_http-server-header: Apache/2.4.48 (Debian)
|_http-open-proxy: Proxy might be redirecting requests
|_http-title: Site doesn't have a title (text/html).
8080/tcp  open   http     Apache Tomcat (language: en)
|_http-open-proxy: Proxy might be redirecting requests
| http-title: WebAnno - Log in 
|_Requested resource was http://10.112.168.133:8080/login.html
|_http-trane-info: Problem with XML parsing of /evox/about
|_http-favicon: Spring Java Framework
50000/tcp closed ibm-db2
50001/tcp closed unknown
50002/tcp closed iiimsf
50003/tcp closed unknown
50006/tcp closed unknown
50300/tcp closed unknown
50389/tcp closed unknown
50500/tcp closed unknown
50636/tcp closed unknown
50800/tcp closed unknown
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 69.74 seconds

```

