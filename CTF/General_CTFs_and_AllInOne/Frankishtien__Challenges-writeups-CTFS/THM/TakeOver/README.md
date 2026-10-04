# TryHackMe TakeOver Writeup

## Nmap scan

 
```
nmap -sCV 10.10.142.229   
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-07-04 22:44 EDT
Nmap scan report for 10.10.142.229
Host is up (0.29s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 40:91:d5:4f:19:f3:9a:ef:15:9f:08:76:0d:d7:81:cd (RSA)
|   256 20:ab:64:21:3e:da:34:90:ba:a0:c8:58:44:dd:7d:39 (ECDSA)
|_  256 ad:eb:b8:37:68:9d:3a:08:4e:1b:9b:30:d6:31:7f:ca (ED25519)
80/tcp  open  http     Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Did not follow redirect to https://futurevera.thm/
|_http-server-header: Apache/2.4.41 (Ubuntu)
443/tcp open  ssl/http Apache httpd 2.4.41 ((Ubuntu))
| tls-alpn: 
|_  http/1.1
|_http-title: FutureVera
| ssl-cert: Subject: commonName=futurevera.thm/organizationName=Futurevera/stateOrProvinceName=Oregon/countryName=US
| Not valid before: 2022-03-13T10:05:19
|_Not valid after:  2023-03-13T10:05:19
|_ssl-date: TLS randomness does not represent time
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 22.43 seconds
                                                                                            
```

## ffuf

```
ffuf -H "Host: FUZZ.futurevera.thm" -u https://10.10.142.229 -w /usr/share/seclists/Discovery/Web-Content/common.txt -fs 0,4605
```

![image](https://github.com/user-attachments/assets/ebc7fb83-0686-468a-82d7-c77a7cf77e63)

found
```
support.futurevera.thm
blog.futurevera.thm
```

on **``https://support.futurevera.thm/``**

![image](https://github.com/user-attachments/assets/fecdf04f-b89c-46f2-ae35-953c2ea7728e)

click ``view Certificate`` found secret subdomain:

![image](https://github.com/user-attachments/assets/fc86598a-0e16-415d-840d-46dbdb356d8d)

```
http://secrethelpdesk934752.support.futurevera.thm/
```

![image](https://github.com/user-attachments/assets/2256bdfb-9280-49a0-acf7-756d7c1a3f1c)

```
flag{beea0d6edfcee06a59b83fb50ae81b2f}
```

