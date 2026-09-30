```
 ▐ ▄ ▄▄▄ .▄▄▄▄▄    .▄▄ · ▄▄▄ . ▄▄·      ▄▄·  ▄ .▄ ▄▄▄· ▄▄▌  ▄▄▌  ▄▄▄ . ▐ ▄  ▄▄ • ▄▄▄ .
•█▌▐█▀▄.▀·•██      ▐█ ▀. ▀▄.▀·▐█ ▌▪    ▐█ ▌▪██▪▐█▐█ ▀█ ██•  ██•  ▀▄.▀·•█▌▐█▐█ ▀ ▪▀▄.▀·
▐█▐▐▌▐▀▀▪▄ ▐█.▪    ▄▀▀▀█▄▐▀▀▪▄██ ▄▄    ██ ▄▄██▀▐█▄█▀▀█ ██▪  ██▪  ▐▀▀▪▄▐█▐▐▌▄█ ▀█▄▐▀▀▪▄
██▐█▌▐█▄▄▌ ▐█▌·    ▐█▄▪▐█▐█▄▄▌▐███▌    ▐███▌██▌▐▀▐█ ▪▐▌▐█▌▐▌▐█▌▐▌▐█▄▄▌██▐█▌▐█▄▪▐█▐█▄▄▌
▀▀ █▪ ▀▀▀  ▀▀▀      ▀▀▀▀  ▀▀▀ ·▀▀▀     ·▀▀▀ ▀▀▀ · ▀  ▀ .▀▀▀ .▀▀▀  ▀▀▀ ▀▀ █▪·▀▀▀▀  ▀▀▀ 
```
Practice the skills you have learned in the Network Security module. [^1]

What is the highest port number being open less than 10,000?
-----------------------------------------------------------------------------------------
Use the `nmap -sS -p0-10000 <MACHINE_IP_ADDRESS>` command to find out that the highest
port number less than *10.000* which is also open, is *8080* and stands for the 
*http-proxy* service.

There is an open port outside the common 1000 ports; it is above 10,000.
-----------------------------------------------------------------------------------------
This can be found out with the command `nmap -sT --exclude-ports 1-10000 -p-` followed by
the machine IP address and the port is *10021* which stands for the *ftp, vsftpd 3.0.3*
service.

How many TCP ports are open?
-----------------------------------------------------------------------------------------
Now, we can scan all TCP ports with `nmap -sT -p-` and find out *six* are open.

What is the flag hidden in the HTTP server header?
-----------------------------------------------------------------------------------------
For, this we simply apply `telnet <MACHINE_IP_ADDRESS> 80` and press enter two times to 
get the server header with the flag in response to the request.

What is the flag hidden in the SSH server header?
-----------------------------------------------------------------------------------------
Now, we simply change the port number to *22* and obtain the SSH server header with the
flag.

What is the version of the FTP server listening on a nonstandard port?
-----------------------------------------------------------------------------------------
From the second task, we already know that the port *10021* hosts a FTP server and now we
can once again use `telnet` to find out that its version is *vsFTPd 3.0.3*.

What is the flag in one of these two accounts accessible via FTP?
-----------------------------------------------------------------------------------------
We learned two usernames using social engineering: *eddie* and *quinn*.
Since we don't know the password of either of these two accounts, we want to use `hydra`
to retrieve `eddie:jordan` and `quinn:andrea` in the following way.
```
$ hydra -l eddie -P /usr/share/wordlists/rockyou.txt <TARGET_IP_ADDRESS> ftp -s 10021
$ hydra -l quinn -P /usr/share/wordlists/rockyou.txt <TARGET_IP_ADDRESS> ftp -s 10021
```
Then, we can login with `ftp <MACHINE_IP_ADDRESS> 10021` and the credentials `USER eddie`
and `PASS jordan`. With the command `ls`, we find out, that there is no file in the
current directory. So, we assume that `USER quinn` and `PASS andrea` is more useful, and
indeed there is a `ftp_flag.txt` file in the current directory containing the flag.

Browsing to `http://<MACHINE_IP_ADDRESS>:8080` displays a small challenge that will give
you a flag once you solve it. What is the flag?
-----------------------------------------------------------------------------------------
The challenge here is to use `nmap` to scan the target IP address as covertly as possible
in order to avoid being detected by the IDS. So, we use this command `nmap -sN
<MACHINE_IP_ADDRESS>` to not send any bits, with the TCP flag header being zero.

[^1]: https://tryhackme.com/room/netsecchallenge
