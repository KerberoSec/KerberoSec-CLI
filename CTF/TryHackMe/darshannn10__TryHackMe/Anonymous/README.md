#  [Anonymous](https://tryhackme.com/room/anonymous)

> Darshan Patel

## Overview

| Tables | Description |
| ------ | ----------- |
| Challenge Name | Anonymousy |
| Difficulty | medium |
| Tags | security, linux, permissions, medium|

---

```bash
export IP=10.10.190.158
```

---

```bash
nmap -vvv -p- -sC -sV -A -v -oN nmap/initial.nmap 10.10.190.158
```

Open-Ports:
```
21 ftp
22 ssh
139 smbd
445 smbd 
```

Logged onto the ftp server anonymously and replaced the crontab executable file with a reverse shell file

Once I had the reverse shell I got the user flag and loaded [linpeas](https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS) onto the system 

Using linpeas I noticed that env was running as root meaning that I could use it to exploit root and I did so

