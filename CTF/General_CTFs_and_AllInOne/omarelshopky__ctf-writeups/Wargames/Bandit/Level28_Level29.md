# Bandit Level 28 --> Level 29
## Level Goal
There is a git repository at ssh://bandit28-git@localhost/home/bandit28-git/repo. The password for the user bandit28-git is the same as for the user bandit28.

Clone the repository and find the password for the next level.

## Commands you may need to solve this level
git

## Solution

Make dir in tmp folder then clone repository
```console
bandit28@bandit:~$ mkdir /tmp/repolev28
bandit28@bandit:~$ cd /tmp/repolev28
bandit28@bandit:/tmp/repolev28$ git clone ssh://bandit28-git@localhost/home/bandit28-git/repo
```

repo contain README file contain the pass
```console
bandit28@bandit:/tmp/repolev28$ cd repo
bandit28@bandit:/tmp/repolev28/repo$ ls
README.md
bandit28@bandit:/tmp/repolev28/repo$ cat README.md
# Bandit Notes
Some notes for level29 of bandit.

## credentials

- username: bandit29
- password: xxxxxxxxxx
```

browse for log info
```console
andit28@bandit:/tmp/repolev28/repo$ git log
commit edd935d60906b33f0619605abd1689808ccdd5ee
Author: Morla Porla <morla@overthewire.org>
Date:   Thu May 7 20:14:49 2020 +0200

    fix info leak

commit c086d11a00c0648d095d04c089786efef5e01264
Author: Morla Porla <morla@overthewire.org>
Date:   Thu May 7 20:14:49 2020 +0200

    add missing data

commit de2ebe2d5fd1598cd547f4d56247e053be3fdc38
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:49 2020 +0200

    initial commit of README.md
```

See the different between commit
```console
bandit28@bandit:/tmp/repolev28/repo$ git diff c086d11a00c0648d095d04c089786efef5e01264 edd935d60906b33f0619605abd1689808ccdd5ee
diff --git a/README.md b/README.md
index 3f7cee8..5c6457b 100644
--- a/README.md
+++ b/README.md
@@ -4,5 +4,5 @@ Some notes for level29 of bandit.
 ## credentials
 
 - username: bandit29
-- password: bbc96594b4e001778eee9975372716b2
+- password: xxxxxxxxxx
```

## Password
> bbc96594b4e001778eee9975372716b2

  
