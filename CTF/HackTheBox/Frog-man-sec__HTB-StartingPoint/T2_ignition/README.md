## Ignition HackTheBox
#### About Box
Well, this room is quite weird as this doesn't contain much of a feature. is it shit or am I missing something?

---
#### Step Recon:
```bash
sudo nmap -A -sV --privileged -T4 10.129.123.43 -p- -O -sC -v | tee -a nmap.md
```
**`Result:`**
|PORT|STATE|SERVICE|VERSION|
|---|---|---|---|
|80/tcp|open|http|nginx 1.14.2|

we have only one port open here. Upon visiting the IP, I saw it says `ignition.htb`. So I've added it to `/etc/hosts` with associated IP.

**`Wappalyzer`**
- PHP
- MySql
- JQuery

I've fuzzed some directory with `FFUF` and go the admin panel. Now let's get into it.

#### Step to get in
Box is set to default admin name and a weak password. They gave us a hint by telling us to check common pass from 2023. So I did and got a pass that got me into the admin panel.

There you will get the flag.