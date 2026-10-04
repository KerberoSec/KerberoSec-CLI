This is nothing but patching!
![Bandit28](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit28/level28-%3Elevel29.png)

Let's unpatch the patch, LOL:
```
bandit28@bandit:~$ mkdir /tmp/b28-git/
bandit28@bandit:~$ cd /tmp/b28-git/
bandit28@bandit:/tmp/b28-git$ ls
bandit28@bandit:/tmp/b28-git$ git clone ssh://bandit28-git@localhost/home/bandit28-git/repo
Cloning into 'repo'...
Could not create directory '/home/bandit28/.ssh'.
The authenticity of host 'localhost (127.0.0.1)' can't be established.
ECDSA key fingerprint is SHA256:98UL0ZWr85496EtCRkKlo20X3OPnyPSB5tB5RPbhczc.
Are you sure you want to continue connecting (yes/no)? yes
Failed to add the host to the list of known hosts (/home/bandit28/.ssh/known_hosts).
This is a OverTheWire game server. More information on http://www.overthewire.org/wargames

bandit28-git@localhost's password: 
remote: Counting objects: 9, done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 9 (delta 2), reused 0 (delta 0)
Receiving objects: 100% (9/9), done.
Resolving deltas: 100% (2/2), done.
bandit28@bandit:/tmp/b28-git$ ls
repo
bandit28@bandit:/tmp/b28-git$ cd repo/
bandit28@bandit:/tmp/b28-git/repo$ ls
README.md
bandit28@bandit:/tmp/b28-git/repo$ cat README.md 
# Bandit Notes
Some notes for level29 of bandit.

## credentials

- username: bandit29
- password: xxxxxxxxxx

bandit28@bandit:/tmp/b28-git/repo$ git log -p
commit edd935d60906b33f0619605abd1689808ccdd5ee
Author: Morla Porla <morla@overthewire.org>
Date:   Thu May 7 20:14:49 2020 +0200

    fix info leak

diff --git a/README.md b/README.md
index 3f7cee8..5c6457b 100644
--- a/README.md
+++ b/README.md
@@ -4,5 +4,5 @@ Some notes for level29 of bandit.
 ## credentials
 
 - username: bandit29
-- password: bbc96594b4e001778eee9975372716b2
+- password: xxxxxxxxxx
 

commit c086d11a00c0648d095d04c089786efef5e01264
Author: Morla Porla <morla@overthewire.org>
Date:   Thu May 7 20:14:49 2020 +0200

    add missing data

diff --git a/README.md b/README.md
index 7ba2d2f..3f7cee8 100644
--- a/README.md
+++ b/README.md
@@ -4,5 +4,5 @@ Some notes for level29 of bandit.
 ## credentials
 
 - username: bandit29
-- password: <TBD>
+- password: bbc96594b4e001778eee9975372716b2
 

commit de2ebe2d5fd1598cd547f4d56247e053be3fdc38
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:49 2020 +0200

    initial commit of README.md

diff --git a/README.md b/README.md
new file mode 100644
index 0000000..7ba2d2f
--- /dev/null
+++ b/README.md
@@ -0,0 +1,8 @@
+# Bandit Notes
+Some notes for level29 of bandit.
+
+## credentials
+
+- username: bandit29
+- password: <TBD>
+
bandit28@bandit:/tmp/b28-git/repo$
```
If you knew how git-works, this'll be a simple challenge for you.
`GIT` is a great tool for developers and people who continuously upgrades or rollbacks the version of their files or codes, etc...

Since it's a vast topic, I suggest you to study a bit on it by investing some of your time.
After learning it, you'll really feel like "Why didn't I learn this great tool?" for sure!
So, it's worth of investing your time.

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `bbc96594b4e001778eee9975372716b2` to log into the remote-machine as `bandit29`.

**Warning: Please, first try Level 29 -> Level 30! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
