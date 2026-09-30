Hey, we gotta git-it!
![Bandit27](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit27/level27-%3Elevel28.png)

Here we go:
```
bandit27@bandit:~$ mkdir /tmp/bd27-git
bandit27@bandit:~$ cd /tmp/bd27-git
bandit27@bandit:/tmp/bd27-git$ git clone ssh://bandit27-git@localhost/home/bandit27-git/repo
Cloning into 'repo'...
Could not create directory '/home/bandit27/.ssh'.
The authenticity of host 'localhost (127.0.0.1)' can't be established.
ECDSA key fingerprint is SHA256:98UL0ZWr85496EtCRkKlo20X3OPnyPSB5tB5RPbhczc.
Are you sure you want to continue connecting (yes/no)? yes
Failed to add the host to the list of known hosts (/home/bandit27/.ssh/known_hosts).
This is a OverTheWire game server. More information on http://www.overthewire.org/wargames

bandit27-git@localhost's password: 
remote: Counting objects: 3, done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 0), reused 0 (delta 0)
Receiving objects: 100% (3/3), 287 bytes | 0 bytes/s, done.
bandit27@bandit:/tmp/bd27-git$ ls
repo
bandit27@bandit:/tmp/bd27-git$ cd repo
bandit27@bandit:/tmp/bd27-git/repo$ ls
README
bandit27@bandit:/tmp/bd27-git/repo$ cat 
^C
bandit27@bandit:/tmp/bd27-git/repo$ cat README 
The password to the next level is: 0ef186ac70e04ea33b4c1853d2526fa2
bandit27@bandit:/tmp/bd27-git/repo$
```
Simple, right?

For those who don't know about `Source-Control Management [SCM]` or `Version Control System [VCS]`, check about `git` [here](https://git-scm.com/).
It's created by the same creator of the Linux-Kernel, `Linus-Torvalds`!

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `0ef186ac70e04ea33b4c1853d2526fa2` to log into the remote-machine as `bandit28`.

**Warning: Please, first try Level 28 -> Level 29! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
