## Appointment HackTheBox
### Short Description
Simple room on SQLi. Nothing much.
<br>**`Skills:`**
- Nmap
- Gobuster/ FFUF
- 

---

### First Step: `Setting up & NetScan`
As we have moved to our next level, we will do things a bit different so you don't have to lose our progress in our browser. For that we will assign our IP to a domain. You can do this from our kali machine by editing `/etc/hosts` and putting the **IP** with a valid **URL** we want. <br>***e.g:***
```terminal
127.0.0.1       localhost
127.0.1.1       mehere

# The following lines are desirable for IPv6 capable hosts
::1     localhost ip6-localhost ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
10.10.52.105    rootme.thm
10.129.71.208   hack.appointment.box
```
as you can see at the bottom I have 2 IP assigned to the URL. You can choose any name you want.

Now I'll run `nmap` on this site. (You know the drill.)
```bash
nmap -A -sV --privileged -T4 <ip> -p- -O -sC -v
```
**`Result`**
|PORT|STATE|SERVICE|VERSION|
|----|----|----|----|
|80/tcp|open|http|Apache httpd 2.4.38 ((Debian))|

```terminal
|_http-favicon: Unknown favicon MD5: 7D4140C76BF7648531683BFA4F7F8C22
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.38 (Debian)
|_http-title: Login
```

If we visit the site, we will see a login page. Upon inspection with `wappalyzer` we can see that this site has:
 - Apache 2.4.38
 - Ubuntu
 - Jquery
 - PHP

As we know which services are running here, we will now try to Fuzz directories and files related to them. I personally use ffuf for this, but you can use whatever you want.

```bash
ffuf -u http://hack.appointment.box/FUZZ -w ~/custom-wl/OneListForAll/dict/common_short.txt -v -r -c
```
After searching I've come across some interesting files and directories but there was nothing but `directory listing`. 

---
### Getting in: `as Admin`
Anyways, as we have a login page, we will try to test for SQLi. In this room we have MySQL. Lab says we have to login as admin and we can do that just by commenting out the password.

For that, we have to use the `#` sign as it's used to comment out the rest in MySQL.

In username field type `admin'#` and you are in.

---
