```
:::::::.                            `::                ::   .:                      :::                     
 ;;;'';;'                            ;;               ,;;   ;;,                     ;;; .;;,                
 [[[__[[\. ,ccc,   ,c  ,   [ccccc,=[[[[[[.           ,[[[,,,[[[  ,ccc,   ,cc[[[cc.  [[[[[/' ,cc[[[cc.=,,[[==
 $$""""Y$$$$$"c$$$$$'  $$$ $$$$"$$$  $$`$$$     $P   "$$$"""$$$ $$$cc$$$ $$$       _$$$$,   $$$___--'`$$$"``
_88o,,od8P888   88888   888888  Y88o 88, 88b   88     888   "88o888   88888b    ,o,"888"88o,88b    ,o,888   
""YUMMMP"  "YUMMP  "YUM" MPMMM  "MMM MMM  'MooMM      MMM    YMM "YUM" MP "YUMMMMP" MMM "MMP""YUMMMMP""MM,  
                                            MM                                                              
                                           ##"                                                              
                                          m##"
```
You were boasting on and on about your elite hacker skills in the bar and a few Bounty
Hunters decided they'd take you up on claims! Prove your status is more than just a few
glasses at the bar. I sense bell peppers and beef in your future! [^1]

Find open ports on the machine.
-----------------------------------------------------------------------------------------
We can scan for open ports on the machine with `nmap -sT -p- <TARGET_MACHINE_IP>` which
results in 55529 filtered and 10003 closed TCP ports. The scan results in the following
open ports that are worth further investigation.

```
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
```

Upon navigating to the website in a browser of our choice, we are greeted with a dialogue
from cowboy bebop's space crew. But, apart from that there is nothing inherently
suspicious to note here. Next, we target the FTP and SSH server.

Who wrote the task list?
-----------------------------------------------------------------------------------------
In order to connect to the FTP server, we use the command `ftp <TARGET_MACHINE_IP> -p 21`
and provide the name *anonymous* when logging in. However, whenever we want to list the
current directory after a successful login, we are denied its permission since passive
mode is refused. After reading the manpage, we find out that the `-p` option actually
acivates passive mode for data transfers, rather than the port. Instead, we can just
provide the port after the IP address without the `-p` flag. This way, we are finally
able to list the directory contents with `ls` and discover two interesting files
*locks.txt* and *task.txt*. Since FTP itself does not store information about who
originally created a file, we want to rely on SSH instead. However, we can read their
contents with the `more` command, and thus find out who wrote the *task.txt* file.

What service can you bruteforce with the text file found?
-----------------------------------------------------------------------------------------
The *locks.txt* file appears to contain a wordlist that helps us get user accesss for
the user who wrote the *task.txt* file through a brute-forcing attack on the service
under port 22.

What is the users password? 
-----------------------------------------------------------------------------------------
In order, to automate the brute force attack, we can utilize one of the tools, such as
*hydra* and download the wordlist with `get locks.txt` on FTP. With that, we can run
`hydra -l lin -P locks.txt <TARGET_MACHINE_IP> ssh` to find a valid password from the
dictionary. Finally, hydra finds the password for the target with the username and we
can log in.

### user.txt
Having logged in to `ssh lin@<TARGET_MACHINE_IP>` with the password retrieved from the
dictionary brute force attack, we can proceed to investigate the *user.txt* file in
the desktop folder for the flag.

### root.txt
In order, to get *root* access on the machine, we need to perform privilege escalation.
First, we try to perform `sudo` commands with lin's account and discover, that to a
limited extend, they are possible. In order to find out more, we can query `sudo -l` to
list the allowed and forbidden sudo commands for lin's user account.

```
Matching Defaults entries for lin on <TARGET_MACHINE_IP>:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User lin may run the following commands on <TARGET_MACHINE_IP>:
    (root) /bin/tar
```

With this, we want to investigate, what we can do with the `/bin/tar` command and check
its manpage. Further, in the *gtfobins* reference [^2], we can discover an executable
that can spawn an interactive system shell with the `tar` command.
```bash
sudo tar cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```
With this, we were able to spawn an interactive bash shell, and view the contents
of the *root.txt* in the `/root/` folder.

[^1]: https://tryhackme.com/room/cowboyhacker
[^2]: https://gtfobins.org/gtfobins/tar/
