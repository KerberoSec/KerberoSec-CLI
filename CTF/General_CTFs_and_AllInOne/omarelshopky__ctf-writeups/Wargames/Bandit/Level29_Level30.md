# Bandit Level 29 --> Level 30
## Level Goal
There is a git repository at ssh://bandit29-git@localhost/home/bandit29-git/repo. The password for the user bandit29-git is the same as for the user bandit29.

Clone the repository and find the password for the next level.

## Commands you may need to solve this level
git

## Solution

Make dir in tmp folder then clone repository
```console
bandit29@bandit:~$ mkdir /tmp/repolev29
bandit29@bandit:~$ cd /tmp/repolev29
bandit29@bandit:/tmp/repolev29$ git clone ssh://bandit29-git@localhost/home/bandit29-git/repo
```

repo contain README file contain the pass
```console
bandit29@bandit:/tmp/repolev29$ cd repo
bandit29@bandit:/tmp/repolev29/repo$ ls
README.md
bandit29@bandit:/tmp/repolev29/repo$ cat README.md 
# Bandit Notes
Some notes for bandit30 of bandit.

## credentials

- username: bandit30
- password: <no passwords in production!>
```

browse for log info
```console
bandit29@bandit:/tmp/repolev29/repo$ git log
commit 208f463b5b3992906eabf23c562eda3277fea912
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:51 2020 +0200

    fix username

commit 18a6fd6d5ef7f0874bbdda2fa0d77b3b81fd63f7
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:51 2020 +0200

    initial commit of README.md
```

See the different between commit
```console
bandit29@bandit:/tmp/repolev29/repo$ git diff 208f463b5b3992906eabf23c562eda3277fea912  18a6fd6d5ef7f0874bbdda2fa0d77b3b81fd63f7
diff --git a/README.md b/README.md
index 1af21d3..2da2f39 100644
--- a/README.md
+++ b/README.md
@@ -3,6 +3,6 @@ Some notes for bandit30 of bandit.
 
 ## credentials
 
-- username: bandit30
+- username: bandit29
 - password: <no passwords in production!>
```

See other branches 
```console
bandit29@bandit:/tmp/repolev29/repo$ git branch -la
* master
  remotes/origin/HEAD -> origin/master
  remotes/origin/dev
  remotes/origin/master
  remotes/origin/sploits-dev
```

Change branch to dev
```console
bandit29@bandit:/tmp/repolev29/repo$ git checkout origin/dev
Note: checking out 'origin/dev'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by performing another checkout.

If you want to create a new branch to retain commits you create, you may
do so (now or) by using -b with the checkout command again. Example:

  git checkout -b <new-branch-name>

HEAD is now at bc83328... add data needed for development
```
Now see Readme
```console
bandit29@bandit:/tmp/repolev29/repo$ ls
code  README.md
bandit29@bandit:/tmp/repolev29/repo$ cat README.md 
# Bandit Notes
Some notes for bandit30 of bandit.

## credentials

- username: bandit30
- password: 5b90576bedb2cc04c86a9e924ce42faf
```

## Password
> 5b90576bedb2cc04c86a9e924ce42faf

  
