I think you are GITTING better!
![Bandit29](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit29/level29-%3Elevel30.png)

Let's see what we can git, here:
```
bandit29@bandit:~$ mkdir /tmp/b29-git
bandit29@bandit:~$ cd /tmp/b29-git
bandit29@bandit:/tmp/b29-git$ git clone ssh://bandit29-git@localhost/home/bandit29-git/repo
Cloning into 'repo'...
Could not create directory '/home/bandit29/.ssh'.
The authenticity of host 'localhost (127.0.0.1)' can't be established.
ECDSA key fingerprint is SHA256:98UL0ZWr85496EtCRkKlo20X3OPnyPSB5tB5RPbhczc.
Are you sure you want to continue connecting (yes/no)? yes
Failed to add the host to the list of known hosts (/home/bandit29/.ssh/known_hosts).
This is a OverTheWire game server. More information on http://www.overthewire.org/wargames

bandit29-git@localhost's password: 
remote: Counting objects: 16, done.
remote: Compressing objects: 100% (11/11), done.
remote: Total 16 (delta 2), reused 0 (delta 0)
Receiving objects: 100% (16/16), done.
Resolving deltas: 100% (2/2), done.
bandit29@bandit:/tmp/b29-git$ ls
repo
bandit29@bandit:/tmp/b29-git$ cd repo/
bandit29@bandit:/tmp/b29-git/repo$ ls
README.md
bandit29@bandit:/tmp/b29-git/repo$ cat README.md 
# Bandit Notes
Some notes for bandit30 of bandit.

## credentials

- username: bandit30
- password: <no passwords in production!>

bandit29@bandit:/tmp/b29-git/repo$ git branch
* master
bandit29@bandit:/tmp/b29-git/repo$ git log -p
commit 208f463b5b3992906eabf23c562eda3277fea912
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:51 2020 +0200

    fix username

diff --git a/README.md b/README.md
commit 208f463b5b3992906eabf23c562eda3277fea912
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:51 2020 +0200

    fix username

diff --git a/README.md b/README.md
commit 208f463b5b3992906eabf23c562eda3277fea912
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:51 2020 +0200

    fix username

diff --git a/README.md b/README.md
index 2da2f39..1af21d3 100644
--- a/README.md
+++ b/README.md
@@ -3,6 +3,6 @@ Some notes for bandit30 of bandit.
 
 ## credentials
 
-- username: bandit29
+- username: bandit30
 - password: <no passwords in production!>
 

commit 18a6fd6d5ef7f0874bbdda2fa0d77b3b81fd63f7
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:51 2020 +0200

    initial commit of README.md

diff --git a/README.md b/README.md
new file mode 100644
index 0000000..2da2f39
--- /dev/null
+++ b/README.md
@@ -0,0 +1,8 @@
+# Bandit Notes
+Some notes for bandit30 of bandit.
+
+## credentials
+
+- username: bandit29
+- password: <no passwords in production!>
+
bandit29@bandit:/tmp/b29-git/repo$ git checkout 
dev                  master               origin/HEAD          origin/sploits-dev   
HEAD                 origin/dev           origin/master        sploits-dev          
bandit29@bandit:/tmp/b29-git/repo$ git checkout 
dev                  master               origin/HEAD          origin/sploits-dev   
HEAD                 origin/dev           origin/master        sploits-dev          
bandit29@bandit:/tmp/b29-git/repo$ git checkout dev 
Branch dev set up to track remote branch dev from origin.
Switched to a new branch 'dev'
bandit29@bandit:/tmp/b29-git/repo$ git branch
* dev
  master
bandit29@bandit:/tmp/b29-git/repo$ ls
code  README.md
bandit29@bandit:/tmp/b29-git/repo$ cat README.md 
# Bandit Notes
Some notes for bandit30 of bandit.

## credentials

- username: bandit30
- password: 5b90576bedb2cc04c86a9e924ce42faf
bandit29@bandit:/tmp/b29-git/repo$
```
Since the hints in the `README.md` says `<no passwords in production!>`, we looked at the development branch!
That's it! This is just a git-thing...

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `5b90576bedb2cc04c86a9e924ce42faf` to log into the remote-machine as `bandit30`.

**Warning: Please, first try Level 30 -> Level 31! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
