# Bandit

## Level 0

* Goal: The goal of this level is for you to log into the game using SSH. The host to which you need to connect is bandit.labs.overthewire.org, on port 2220. The username is bandit0 and the password is bandit0. Once logged in, go to the Level 1 page to find out how to beat Level 1.

* Commands: ssh

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit0 #enter password (bandit0)
```

## Level 1

* Goal: The password for the next level is stored in a file called readme located in the home directory. Use this password to log into bandit1 using SSH. Whenever you find a password for a level, use SSH (on port 2220) to log into that level and continue the game.

* Commands: ls, cd, cat, file, du, find

* Solution -

```shell
ls #show list of files, in this case, readme

cat readme #show content of readme
#copy the password (boJ9jbbUNNfktd78OOpsqOltutMc3MY1)

exit #exit current ssh session
```

## Level 2

* Goal: The password for the next level is stored in a file called: located in the home directory.

* Commands: ls, cd, cat, file, du, find

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit1 #enter copied password

ls

cat ./- #filename is -, copy password (CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9)

exit
```

## Level 3

* Goal: The password for the next level is stored in a file called spaces in this filename located in the home directory.

* Commands: ls, cd, cat, file, du, find

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit2

ls

cat "spaces in this filename" #password (UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK)

exit
```

## Level 4

* Goal: The password for the next level is stored in a hidden file in the inhere directory.

* Commands: ls, cd, cat, file, du, find

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit3

ls

cd inhere/

ls -a #shows all files, including hidden file (with prefix .)

cat .hidden #password (pIwrPrtPN36QITSp3EQaw936yaFoFgAB)

exit
```

## Level 5

* Goal: The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.

* Commands: ls, cd, cat, file, du, find

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit4

ls

cd inhere/

ls #shows all files, we need only human-readable file

cd .. #return to parent directory

file inhere/* #shows file-type for all files inside inhere/
#shows that -file07 is human-readable

cd inhere/

cat ./-file07 #password (koReBOKuIDDepwhWk7jZC0RTdopnAYKh)

exit
```

## Level 6

* Goal: The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:

    human-readable, 1033 bytes in size, not executable

* Commands: ls, cd, cat, file, du, find

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit5

ls

cd inhere/

find . -type f -size 1033c #1033 bytes, file type, shows one file

cat ./maybehere07/.file2 #password (DXjZPULLxYr17uwoI01bNLQbtFemEgo7)

exit
```

## Level 7

* Goal: The password for the next level is stored somewhere on the server and has all of the following properties:

    owned by user bandit7, owned by group bandit6, 33 bytes in size

* Commands: ls, cd, cat, file, du, find, grep

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit6

ls -a #shows all files

find / -user bandit7 -group bandit6 -size 33c -type f 2> /dev/null
#here, / used to search all files and directories
#-user and -group field to search file owned by given user and group
#2> is used for stderr, so that error messages are sent to /dev/null

cat /var/lib/dpkg/info/bandit7.password #password (HKBPTKQnIay4Fw76bEy8PVxKEDQRKTzs)

exit
```

## Level 8

* Goal: The password for the next level is stored in the file data.txt next to the word millionth.

* Commands: grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit7

ls

grep millionth data.txt #shows line with the word 'millionth'
#password (cvX2JJa4CFALtqS87jk27qwqGhBM9plV)

exit
```

## Level 9

* Goal: The password for the next level is stored in the file data.txt and is the only line of text that occurs only once.

* Commands: grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit8

ls

sort data.txt | uniq -uc #this will sort the file for uniq to work
#uniq -uc will give count for unique strings
#password (UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR)

exit
```

## Level 10

* Goal: The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.

* Commands: grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit9

ls

strings data.txt | grep "=="
#strings filters out human-readable content
#password (truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk)

exit
```

## Level 11

* Goal: The password for the next level is stored in the file data.txt, which contains base64 encoded data.

* Commands: grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit10

ls

man base64

base64 -d data.txt #password (IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR)

exit
```

## Level 12

* Goal: The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions.

* Commands: grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit11

ls

tr 'A-Za-z' 'N-ZA-Mn-za-m' < data.txt
#translate for ROT13
#password (5Te8Y4drgCRfCx8ugdwuEX8KFC6k2EUu)

exit
```

## Level 13

* Goal: The password for the next level is stored in the file data.txt, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work using mkdir. For example: mkdir /tmp/myname123. Then copy the datafile using cp, and rename it using mv (read the manpages!)

* Commands: grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd, mkdir, cp, mv, file

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit12

ls

mkdir /tmp/dir1

cp data.txt /tmp/dir1

cd /tmp/dir1

ls

xxd -r data.txt > data1 #reversing hexdump and moving output to data1

file data1 #shows that it is gzip compressed data

mv data1 data1.gz

gzip -d -k data1.gz #decompress data1.gz

file data1 #bzip2 compressed data

bzip2 -d -k data1

ls

file data1.out #gzip compressed data

mv data1.out data1.gz

gzip -dk data1.gz

file data1 #POSIX tar archive

mv data1 data1.tar

tar -xvf data1.tar #gives file named data5.bin

file data5.bin #shows that it is a tar file

tar -xvf data5.bin #gives data6.bin

file data6.bin #it is a bzip2 file

bzip2 -dk data6.bin

file data6.bin.out #tar file again

tar -xvf data6.bin.out #gives data8.bin

file data8.bin #gzip compressed file

mv data8.bin data8.gz

gzip -dk data8.gz

file data8 #ASCII text

cat data8
#password (8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL)

exit
```

## Level 14

* Goal: The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level. Note: localhost is a hostname that refers to the machine you are working on.

* Commands: ssh, telnet, nc, openssl, s_client, nmap

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit13

ls #shows sshkey.private

file sshkey.private #PEM RSA private key

ssh -i sshkey.private bandit14@localhost
#using localhost as we are already using bandit.labs.overthewire.org
#login as bandit14

cat /etc/bandit_pass/bandit14
#password (4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e)
```

## Level 15

* Goal: The password for the next level can be retrieved by submitting the password of the current level to port 30000 on localhost.

* Commands: ssh, telnet, nc, openssl, s_client, nmap

* Solution -

```shell
nc -h #help for netcat

nc localhost 30000 #prompt for entering prev password
#password (BfMYroe26WYalil77FoDi9qh59eK5xNr)

exit

exit
```

## Level 16

* Goal: The password for the next level can be retrieved by submitting the password of the current level to port 30001 on localhost using SSL encryption. Helpful note: Getting “HEARTBEATING” and “Read R BLOCK”? Use -ign_eof and read the “CONNECTED COMMANDS” section in the manpage. Next to ‘R’ and ‘Q’, the ‘B’ command also works in this version of that command…

* Commands: ssh, telnet, nc, openssl, s_client, nmap

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit15

man openssl

openssl s_client -crlf -connect localhost:30001 -servername localhost
#connect to port 30001 on localhost using openssl
#password (cluFn7wTiGryunymYOu4RcffSxQluehd)

exit
```

## Level 17

* Goal: The credentials for the next level can be retrieved by submitting the password of the current level to a port on localhost in the range 31000 to 32000. First find out which of these ports have a server listening on them. Then find out which of those speak SSL and which don’t. There is only 1 server that will give the next credentials, the others will simply send back to you whatever you send to it.

* Commands: ssh, telnet, nc, openssl, s_client, nmap

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit16

man nc

nc -zv localhost 31000-32000 #port scan
#gives 5 open ports, listening

openssl s_client -crlf -connect localhost:31790 -servername localhost
#only port with SSL
#gives private key, to be stored in a file

exit

chmod 400 pvtkey #proper permissions for key file

ssh -i pvtkey bandit.labs.overthewire.org -p 2220 -l bandit17
```

## Level 18

* Goal: There are 2 files in the homedirectory: passwords.old and passwords.new. The password for the next level is in passwords.new and is the only line that has been changed between passwords.old and passwords.new. NOTE: if you have solved this level and see ‘Byebye!’ when trying to log into bandit18, this is related to the next level, bandit19.

* Commands: cat, grep, ls, diff

* Solution -

```shell
man diff

diff -c passwords.new passwords.old
#shows difference
#password (kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd)

exit

ssh bandit.labs.overthewire.org -p 2220 -l bandit18
```

## Level 19

* Goal: The password for the next level is stored in a file readme in the homedirectory. Unfortunately, someone has modified .bashrc to log you out when you log in with SSH.

* Commands: ssh, ls, cat

* Solution -

```shell
#currently in home directory, logged out of ssh
man ssh

ssh -t bandit.labs.overthewire.org -p 2220 -l bandit18 /bin/sh
#to overcome logging out issue

ls

cat readme
#password (IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x)

exit
```

## Level 20

* Goal: To gain access to the next level, you should use the setuid binary in the homedirectory. Execute it without arguments to find out how to use it. The password for this level can be found in the usual place (/etc/bandit_pass), after you have used the setuid binary.

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit19

ls

./bandit20-do

./bandit-20-do id

./bandit-20-do cat /etc/bandit_pass/bandit20
#password (GbKksEFF4yrVs6il55v6gwY5aVje5f0j)

exit
```

## Level 21

* Goal: There is a setuid binary in the homedirectory that does the following: it makes a connection to localhost on the port you specify as a commandline argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit20). If the password is correct, it will transmit the password for the next level (bandit21). NOTE: Try connecting to your own network daemon to see if it works as you think.

* Commands: ssh, nc, cat, bash, screen, tmux, Unix ‘job control’

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit20

ls

./suconnect

man nc

cat /etc/bandit_pass/bandit20

echo "GbKksEFF4yrVs6il55v6gwY5aVje5f0j" | nc -l localhost -p 31000 &
#can use any port here, ampersand added to shift job to background

./suconnect 31000
#password (gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr)

exit
```

## Level 22

* Goal: A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.

* Commands: cron, crontab, crontab(5) (use “man 5 crontab” to access this)

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit21

man cron

man crontab

man 5 crontab

ls /etc/cron.d/

cat /etc/cron.d/cronjob_bandit22

cat /usr/bin/cronjob_bandit22.sh

cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
#password (Yk7owGAcWjwMVRwrTesJEwB7WVOiILLI)

exit
```

## Level 23

* Goal: A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed. NOTE: Looking at shell scripts written by other people is a very useful skill. The script for this level is intentionally made easy to read. If you are having problems understanding what it does, try executing it to see the debug information it prints.

* Commands: cron, crontab, crontab(5)

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit22

ls /etc/cron.d/

cat /etc/cron.d/cronjob_bandit23

cat /usr/bin/cronjob_bandit23.sh

/usr/bin/cronjob_bandit23.sh
#debug script

bash -x /usr/bin/cronjob_bandit23.sh
#myname can be given value of bandit23 to get tmp directory

$myname

myname=bandit23

echo I am user $myname | md5sum | cut -d ' ' -f 1
#gives 8ca319486bfbbc3663ea0fbe81326349

cat /tmp/8ca319486bfbbc3663ea0fbe81326349
#password (jc1udXuA1tiHqjIsL8yaapX5XIAI6i0n)

exit
```

## Level 24

* Goal: A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed. NOTE: This level requires you to create your own first shell-script. This is a very big step and you should be proud of yourself when you beat this level! NOTE 2: Keep in mind that your shell script is removed once executed, so you may want to keep a copy around…

* Commands: cron, crontab, crontab(5)

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit23

ls /etc/cron.d/

cat /etc/cron.d/cronjob_bandit24.sh

cat /usr/bin/cronjob_bandit24.sh

ls /var/spool/

mkdir /tmp/myname0

cd /tmp/myname0

touch script.sh

touch passwd

vim script.sh
#write shell script to 
#copy content of /etc/bandit_pass/bandit24 to /tmp/myname0/passwd and save file

chmod 777 script.sh
#in order for script to be executed by anyone

chmod 777 passwd

cp script.sh /var/spool/bandit24
#copy script to given location

/usr/bin/cronjob_bandit24.sh
#execute script
#password (UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ)

exit
```

## Level 25

* Goal: A daemon is listening on port 30002 and will give you the password for bandit25 if given the password for bandit24 and a secret numeric 4-digit pincode. There is no way to retrieve the pincode except by going through all of the 10000 combinations, called brute-forcing.

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit24

man nc

nc localhost 30002
#connect to see format required for password and pincode
#script with loop can be created to brute-force connection

mkdir /tmp/srivathsan

cd /tmp/srivathsan

touch brutescript.sh

chmod 777 brutescript.sh

vim brutescript.sh
#script used
: '
#!/bin/bash

for value in {1000..9999}
do
    echo "UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ $value"
done | nc localhost 30002 | grep -v Try
'

./brutescript.sh
#password (uNG9O58gUE7snukf3bvZ0rxhtnjzSGzG)

exit
```

## Level 26

* Goal: Logging in to bandit26 from bandit25 should be fairly easy… The shell for user bandit26 is not /bin/bash, but something else. Find out what it is, how it works and how to break out of it.

* Commands: ssh, cat, more, vi, ls, id, pwd

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit25

ls
#sshkey for login is given

ssh -i bandit26.sshkey bandit26@localhost -vvv
#use -vvv for detailed error message

cat /etc/passwd | grep bandit26
#shows user details, includes shell used

cat /etc/shells
#shows shells used

cat /usr/bin/showtext #shell used
#contains command more to show ascii art
#more allows us to execute commands when output buffers
#so we can shorten screen to make buffered output, and run more with vim

ssh -i bandit26.sshkey bandit26@localhost
#resize screen to make it really short, in order to execute commands using more
#type v to enter vim

:r /etc/bandit_pass/bandit26
#password (5czgV9L3Xx8JPOyRbXh6lQbmIOWvPT6Z)

:set shell=/bin/bash #to set shell through vim

:shell
#launches shell for bandit26
```

## Level 27

* Goal: Good job getting a shell! Now hurry and grab the password for bandit27!

* Commands: ls

* Solution -

```shell
ls

./bandit27-do
#this binary allows us to run commands as another user

./bandit27-do cat /etc/bandit_pass/bandit27
#password (3ba3118a22e93127a4ed485be72ef5ea)

exit
#to exit out of vim, :q!

exit
```

## Level 28

* Goal: There is a git repository at ssh://bandit27-git@localhost/home/bandit27-git/repo. The password for the user bandit27-git is the same as for the user bandit27. Clone the repository and find the password for the next level.

* Commands: git

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit27

man git

mkdir /tmp/srivathsan0

cd /tmp/srivathsan0

git clone ssh://bandit27-git@localhost/home/bandit27-git/repo

ls

cd repo/

ls

cat README
#password (0ef186ac70e04ea33b4c1853d2526fa2)

exit
```

## Level 29

* Goal: There is a git repository at ssh://bandit28-git@localhost/home/bandit28-git/repo. The password for the user bandit28-git is the same as for the user bandit28. Clone the repository and find the password for the next level.

* Commands: git

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit28

mkdir /tmp/srivathsan1

cd /tmp/srivathsan1

git clone ssh://bandit28-git@localhost/home/bandit28-git/repo

ls

cd repo/

ls

cat README.md
#shows hidden password for bandit29

git log
#shows previous commits

git log -p #shows diff between commits
#password (bbc96594b4e001778eee9975372716b2)

exit
```

## Level 30

* Goal: There is a git repository at ssh://bandit29-git@localhost/home/bandit29-git/repo. The password for the user bandit29-git is the same as for the user bandit29. Clone the repository and find the password for the next level.

* Commands: git

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit29

mkdir /tmp/srivathsan2

cd /tmp/srivathsan2

git clone ssh://bandit29-git@localhost/home/bandit29-git/repo

ls

cd repo/

ls

cat README.md

git log -p

git log --stat

git branch -a
#show all branches

git checkout dev
#shift to branch - dev

git log -p
#password (5b90576bedb2cc04c86a9e924ce42faf)

exit
```

## Level 31

* Goal: There is a git repository at ssh://bandit30-git@localhost/home/bandit30-git/repo. The password for the user bandit30-git is the same as for the user bandit30. Clone the repository and find the password for the next level.

* Commands: git

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit30

mkdir /tmp/srivathsan3

cd /tmp/srivathsan3

git clone ssh://bandit30-git@localhost/home/bandit30-git/repo

ls

cd repo/

ls

cat README.md

git tag
#shows tag called secret

git show secret
#password (47e603bb428404d265f59c42920d81e5)

exit
```

## Level 32

* Goal: There is a git repository at ssh://bandit31-git@localhost/home/bandit31-git/repo. The password for the user bandit31-git is the same as for the user bandit31. Clone the repository and find the password for the next level.

* Commands: git

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit31

mkdir /tmp/srivathsan4

cd /tmp/srivathsan4

git clone ssh://bandit31-git@localhost/home/bandit31-git/repo

ls

cd repo/

ls

cat README.md
#we need to push key.txt to the repo as given

ls -la
#shows .gitignore file

cat .gitignore
#contains *.txt, so all .txt files will be ignored

rm .gitignore
#now we can add key.txt

echo 'May I come in?' > key.txt
#creates key.txt with content

git add -A
#adds all files, ready for committing

git commit -m "key.txt created"

git push
#password (56a9bf19c63d650ce78e6ec0354ee45e)

exit
```

## Level 33

* Goal: After all this git stuff its time for another escape. Good luck!

* Commands: sh, man

* Solution -

```shell
ssh bandit.labs.overthewire.org -p 2220 -l bandit32
#uppercase shell, cannot enter lowercase commands
#all commands are converted to uppercase
#it shows that there are three parameters, separated by colons
#we can access them by $0, $1, $2 through parameter substitution

$shell
#converts it to $SHELL, default shell

$0
#takes us to sh

export SHELL=/bin/bash

$SHELL
#takes us to /bin/bash
#lowercase commands will work now

ls

cat /etc/bandit_pass/bandit33
#password (c9c3199ddf4121b10cf581a98d51caee)

exit

exit
```
