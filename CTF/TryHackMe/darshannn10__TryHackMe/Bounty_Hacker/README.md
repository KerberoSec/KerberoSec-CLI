# [Bounty Hacker](https://tryhackme.com/room/cowboyhacker)
> Darshan Patel

## Overview

| Tables | Description |
| ------ | ----------- |
| Challenge Name | Bounty Hacker |
| Difficulty | Medium |
| Tags | linux, tar, priv-esc, security|

---
```bash
export IP=10.10.206.24
```

---

```bash
nmap -vvv -p 22,80 -sC -sV -A -v -oN nmap/initial.nmap $IP
```

Ports:
```
21 ftp
22 ssh
80 http
```

Accessed the ftp server as anonymous.

Found and downloaded two files, task.txt amd locks.txt
task.txt indicates who may be a user on the server
locks have potential passwords

Using hydra to brute force the passwords
```
lin:RedDr4gonSynd1cat3
```

Once I logged in, I grabbed the user flag ```THM{CR1M3_SyNd1C4T3}````, then I ran `sudo -l` to see what I could run 

Noticed I can run `/tar` as root.
Using a [gtfo](https://gtfobins.github.io/) bin I got access as root 
root flag: `THM{80UN7Y_h4cK3r}`
