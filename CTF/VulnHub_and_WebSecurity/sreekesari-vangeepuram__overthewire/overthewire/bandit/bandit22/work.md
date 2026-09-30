This challenge is very BASHing!
![Bandit22](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit22/level22-%3Elevel23.png)

Let's see what we can do here;
```
bandit22@bandit:~$ ls /etc/cron.d/
cronjob_bandit15_root  cronjob_bandit17_root  cronjob_bandit22  cronjob_bandit23  cronjob_bandit24  cronjob_bandit25_root
bandit22@bandit:~$ cat /etc/cron.d/cronjob_bandit23 
@reboot bandit23 /usr/bin/cronjob_bandit23.sh  &> /dev/null
* * * * * bandit23 /usr/bin/cronjob_bandit23.sh  &> /dev/null
bandit22@bandit:~$ cat /usr/bin/cronjob_bandit23.sh
#!/bin/bash

myname=$(whoami)
mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)

echo "Copying passwordfile /etc/bandit_pass/$myname to /tmp/$mytarget"

cat /etc/bandit_pass/$myname > /tmp/$mytarget
bandit22@bandit:~$ /usr/bin/cronjob_bandit23.sh
Copying passwordfile /etc/bandit_pass/bandit22 to /tmp/8169b67bd894ddbb4412f91573b38db3
bandit22@bandit:~$ echo "I am user bandit23" | md5sum | cut -d ' ' -f 1
8ca319486bfbbc3663ea0fbe81326349
bandit22@bandit:~$ cat /tmp/8ca319486bfbbc3663ea0fbe81326349
jc1udXuA1tiHqjIsL8yaapX5XIAI6i0n
bandit22@bandit:~$
```

This challenge introduces the concept of `hashing`!
Hashing is a function in `Cryptology` which is unidirectional.
`MD5` is a famous `hash-function`.

If you wanna know how this command work, check it out here: `https://en.wikipedia.org/wiki/Md5sum`.

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `jc1udXuA1tiHqjIsL8yaapX5XIAI6i0n` to log into the remote-machine as `bandit23`.

**Warning: Please, first try Level 23 -> Level 24! Otherwise it's useless to simply cpy-pst the command[s]/password[s].

