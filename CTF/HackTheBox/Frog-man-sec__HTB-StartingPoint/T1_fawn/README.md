## Fawn HackTheBox
#### Room Description:
Basic room all you need is:
- network scanning
- nmap
- ftp
____

#### First Step: `network scan`
well just like we drink coffee when we get up, we run a nmap scan when we get an **IP** .
```bash
# nmap command:
nmap -A -sV --privileged -T4 <ip> -p- -O -sC -v
```
|PORT|STATE|SERVICE|VERSION|
|----|----|----|----|
|21/tcp|open|ftp|vsftpd 3.0.3|

#### Getting in:
upon inspection of Nmap result I've came across this:
```| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0              32 Jun 04  2021 flag.txt
```
which means the server allows anonymous login and there is a file containing our flag.
