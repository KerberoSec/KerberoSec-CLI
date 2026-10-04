Maybe this is just a reference to something?
![Bandit30](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit30/level30-%3Elevel31.png)

Let's see:
```
bandit30@bandit:~$ mkdir /tmp/b30-git
bandit30@bandit:~$ cd /tmp/b30-git
bandit30@bandit:/tmp/b30-git$ ls
bandit30@bandit:/tmp/b30-git$ git clone ssh://bandit30-git@localhost/home/bandit30-git/repo
Cloning into 'repo'...
Could not create directory '/home/bandit30/.ssh'.
The authenticity of host 'localhost (127.0.0.1)' can't be established.
ECDSA key fingerprint is SHA256:98UL0ZWr85496EtCRkKlo20X3OPnyPSB5tB5RPbhczc.
Are you sure you want to continue connecting (yes/no)? yes
Failed to add the host to the list of known hosts (/home/bandit30/.ssh/known_hosts).
This is a OverTheWire game server. More information on http://www.overthewire.org/wargames

bandit30-git@localhost's password: 
remote: Counting objects: 4, done.
remote: Total 4 (delta 0), reused 0 (delta 0)
Receiving objects: 100% (4/4), done.
bandit30@bandit:/tmp/b30-git$ ls
repo
bandit30@bandit:/tmp/b30-git$ cd repo/
bandit30@bandit:/tmp/b30-git/repo$ ls
README.md
bandit30@bandit:/tmp/b30-git/repo$ cat README.md 
just an epmty file... muahaha
bandit30@bandit:/tmp/b30-git/repo$ git log -p
commit 3aefa229469b7ba1cc08203e5d8fa299354c496b
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:54 2020 +0200

    initial commit of README.md

diff --git a/README.md b/README.md
new file mode 100644
index 0000000..029ba42
--- /dev/null
+++ b/README.md
@@ -0,0 +1 @@
+just an epmty file... muahaha
bandit30@bandit:/tmp/b30-git/repo$ git checkout 
HEAD            master          origin/HEAD     origin/master   secret          
bandit30@bandit:/tmp/b30-git/repo$ git checkout secret
fatal: reference is not a tree: secret
bandit30@bandit:/tmp/b30-git/repo$ git status
HEAD detached at origin/master
nothing to commit, working tree clean
bandit30@bandit:/tmp/b30-git/repo$ git branch
* (HEAD detached at origin/master)
  master
bandit30@bandit:/tmp/b30-git/repo$ git tag
secret
bandit30@bandit:/tmp/b30-git/repo$ git show secret 
47e603bb428404d265f59c42920d81e5
bandit30@bandit:/tmp/b30-git/repo$
```
So this is about learning to `tag` in git.
See about this [here](https://git-scm.com/book/en/v2/Git-Basics-Tagging).

We can also solve this challenge by getting into the `.git/` directory, like this:
```
bandit30@bandit:~$ cd /tmp/b30-git
bandit30@bandit:/tmp/b30-git$ cd repo/.git/
bandit30@bandit:/tmp/b30-git/repo/.git$ ls -al
total 56
drwxr-sr-x 8 bandit30 root 4096 Sep  3 16:49 .
drwxr-sr-x 3 bandit30 root 4096 Sep  3 16:45 ..
drwxr-sr-x 2 bandit30 root 4096 Sep  3 16:45 branches
-rw-r--r-- 1 bandit30 root  276 Sep  3 16:45 config
-rw-r--r-- 1 bandit30 root   73 Sep  3 16:45 description
-rw-r--r-- 1 bandit30 root   23 Sep  3 16:49 HEAD
drwxr-sr-x 2 bandit30 root 4096 Sep  3 16:45 hooks
-rw-r--r-- 1 bandit30 root  137 Sep  3 16:49 index
drwxr-sr-x 2 bandit30 root 4096 Sep  3 16:45 info
drwxr-sr-x 3 bandit30 root 4096 Sep  3 16:45 logs
drwxr-sr-x 4 bandit30 root 4096 Sep  3 16:45 objects
-rw-r--r-- 1 bandit30 root   41 Sep  3 16:49 ORIG_HEAD
-rw-r--r-- 1 bandit30 root  165 Sep  3 16:45 packed-refs
drwxr-sr-x 5 bandit30 root 4096 Sep  3 16:45 refs
bandit30@bandit:/tmp/b30-git/repo/.git$ cat packed-refs 
# pack-refs with: peeled fully-peeled 
3aefa229469b7ba1cc08203e5d8fa299354c496b refs/remotes/origin/master
f17132340e8ee6c159e0a4a6bc6f80e1da3b1aea refs/tags/secret
bandit30@bandit:/tmp/b30-git/repo/.git$ git show f17132340e8ee6c159e0a4a6bc6f80e1da3b1aea
47e603bb428404d265f59c42920d81e5
bandit30@bandit:/tmp/b30-git/repo/.git$
```
Here we go...the secret!

Since git simply pack things-up with it's algorithm...it's obvious.

You can see more about this packing feature provided by git [here](https://git-scm.com/docs/pack-heuristics).

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `47e603bb428404d265f59c42920d81e5` to log into the remote-machine as `bandit31`.

**Warning: Please, first try Level 31 -> Level 32! Otherwise it's useless to simply cpy-pst the command[s]/password[s].

