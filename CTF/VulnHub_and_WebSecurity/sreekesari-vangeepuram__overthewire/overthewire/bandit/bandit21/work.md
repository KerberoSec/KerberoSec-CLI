What a simple challenge, right!
![Bandit21](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit21/level21-%3Elevel22.png)

Let's see how to get the password of the user `bandit22`:
```
bandit21@bandit:~$ ls -al
total 24
drwxr-xr-x  2 root     root     4096 May  7 20:14 .
drwxr-xr-x 41 root     root     4096 May  7 20:14 ..
-rw-r--r--  1 root     root      220 May 15  2017 .bash_logout
-rw-r--r--  1 root     root     3526 May 15  2017 .bashrc
-r--------  1 bandit21 bandit21   33 May  7 20:14 .prevpass
-rw-r--r--  1 root     root      675 May 15  2017 .profile
bandit21@bandit:~$ cat .prevpass 
GbKksEFF4yrVs6il55v6gwY5aVje5f0j
bandit21@bandit:~$ 
bandit21@bandit:~$ ls /etc/cron.d/
cronjob_bandit15_root  cronjob_bandit22       cronjob_bandit24       .placeholder           
cronjob_bandit17_root  cronjob_bandit23       cronjob_bandit25_root  
bandit21@bandit:~$ ls /etc/cron.d/cronjob_bandit22
/etc/cron.d/cronjob_bandit22
bandit21@bandit:~$ cat /etc/cron.d/cronjob_bandit22
@reboot bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
* * * * * bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
bandit21@bandit:~$ /usr/bin/cronjob_bandit22.sh
chmod: changing permissions of '/tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv': Operation not permitted
/usr/bin/cronjob_bandit22.sh: line 3: /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv: Permission denied
bandit21@bandit:~$ cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
Yk7owGAcWjwMVRwrTesJEwB7WVOiILLI
bandit21@bandit:~$
```

The whole point of this challenge is to introduce us about the `cron-jobs`.

Cron-jobs are generally some-kinda scheduled jobs, which will be executed depending on the schedule stated by the user.

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `Yk7owGAcWjwMVRwrTesJEwB7WVOiILLI` to log into the remote-machine as `bandit22`.

**Warning: Please, first try Level 22 -> Level 23! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
