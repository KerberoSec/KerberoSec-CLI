#RAW NOTES

subdomains

data,www both with 80 and 22 port open

---

nmap scan 

```html
nmap -A [vulnlawyers.co.uk](http://vulnlawyers.co.uk/)
Starting Nmap 7.91 ( [https://nmap.org](https://nmap.org/) ) at 2021-06-15 16:26 +0545
Nmap scan report for [vulnlawyers.co.uk](http://vulnlawyers.co.uk/) (159.65.54.26)
Host is up (0.20s latency).
Not shown: 996 closed ports
PORT    STATE    SERVICE      VERSION
22/tcp  open     ssh          OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 3c:7e:3a:1a:2a:89:b5:87:0a:e0:48:db:bd:74:f9:88 (RSA)
|   256 21:9e:e5:64:eb:49:e1:d2:fe:7a:a1:2d:df:d0:bf:1c (ECDSA)
|_  256 06:e2:18:c4:f0:ce:b8:02:51:11:86:f7:3c:16:d0:d1 (ED25519)
25/tcp  filtered smtp
80/tcp  open     http         nginx 1.14.0 (Ubuntu)
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: [CTFchallenge.com](http://ctfchallenge.com/)
445/tcp filtered microsoft-ds
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Service detection performed. Please report any incorrect results at [https://nmap.org/submit/](https://nmap.org/submit/) .
Nmap done: 1 IP address (1 host up) scanned in 30.31 seconds

---

subdomain

data.vulnlawyers.co.uk

[^FLAG^E78DEBBFDFBEAFF1336B599B0724A530^FLAG^]

---

```html
json.flag = "[^FLAG^25032EB0D322F7330182507FBAA1A55F^FLAG^]";
json.users = [];
json.users[0] = {};
json.users[0].email = "[yusef.mcclain@vulnlawyers.co.uk](mailto:yusef.mcclain@vulnlawyers.co.uk)";
json.users[0].name = "Yusef Mcclain";
json.users[1] = {};
json.users[1].email = "[shayne.cairns@vulnlawyers.co.uk](mailto:shayne.cairns@vulnlawyers.co.uk)";
json.users[1].name = "Shayne Cairns";
json.users[2] = {};
json.users[2].email = "[eisa.evans@vulnlawyers.co.uk](mailto:eisa.evans@vulnlawyers.co.uk)";
json.users[2].name = "Eisa Evans";
json.users[3] = {};
json.users[3].email = "[jaskaran.lowe@vulnlawyers.co.uk](mailto:jaskaran.lowe@vulnlawyers.co.uk)";
json.users[3].name = "Jaskaran Lowe";
json.users[4] = {};
json.users[4].email = "[marsha.blankenship@vulnlawyers.co.uk](mailto:marsha.blankenship@vulnlawyers.co.uk)";
json.users[4].name = "Marsha Blankenship";
```

---

[data.vulnlawyers.co.uk](http://data.vulnlawyers.co.uk): users directory found

---

using clusterbomb attack type

email: jask.... pass: summer

---

idor in lawers profile

[^FLAG^938F5DC109A1E9B4FF3E3E92D29A56B3^FLAG^]

---

shayne is the manager

---

COMPLETED
