# Bandit Level 25 --> Level 26
## Level Goal
Logging in to bandit26 from bandit25 should be fairly easy… The shell for user bandit26 is not /bin/bash, but something else. Find out what it is, how it works and how to break out of it.

## Commands you may need to solve this level
ssh, cat, more, vi, ls, id, pwd

## Solution

There is private key in home directory so we can use it to login
```console
bandit25@bandit:~$ ls
bandit26.sshkey
bandit25@bandit:~$ ssh -i bandit26.sshkey bandit26@localhost
```

Conection close emmediatily so we can set shell from vim before close to do that minimize terminal screen then login again and click v
```console
:set shell=/bin/bash
:shell
```

get pass from bandit_pass folder```console
bandit26@bandit:~$ cat /etc/bandit_pass/bandit26
5czgV9L3Xx8JPOyRbXh6lQbmIOWvPT6Z
```

## Password
> 5czgV9L3Xx8JPOyRbXh6lQbmIOWvPT6Z

  
