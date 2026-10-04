# Bandit Level 30 --> Level 31
## Level Goal
There is a git repository at ssh://bandit30-git@localhost/home/bandit30-git/repo. The password for the user bandit30-git is the same as for the user bandit30.

Clone the repository and find the password for the next level.

## Commands you may need to solve this level
git

## Solution

Make dir in tmp folder then clone repository
```console
bandit30@bandit:~$ mkdir /tmp/repolev30
bandit30@bandit:~$ cd /tmp/repolev30
bandit30@bandit:/tmp/repolev30$ git clone ssh://bandit30-git@localhost/home/bandit30-git/repo
```

repo contain README file 
```console
bandit30@bandit:/tmp/repolev29$ cd repo
bandit30@bandit:/tmp/repolev30/repo$ ls
README.md
bandit30@bandit:/tmp/repolev30/repo$ cat README.md 
just an epmty file... muahaha
```

browse for log info
```console
bandit30@bandit:/tmp/repolev30/repo$ git log
commit 3aefa229469b7ba1cc08203e5d8fa299354c496b
Author: Ben Dover <noone@overthewire.org>
Date:   Thu May 7 20:14:54 2020 +0200

    initial commit of README.md
```

See other branches 
```console
bandit30@bandit:/tmp/repolev30/repo$ git branch -la
* master
  remotes/origin/HEAD -> origin/master
  remotes/origin/master
```

Show git tags
```console
bandit30@bandit:/tmp/repolev30/repo$ git tag
secret
```
There is a tag named secret maybe its contain the pass
```console
bandit30@bandit:/tmp/repolev30/repo$ git show --tags secret
47e603bb428404d265f59c42920d81e5
47e603bb428404d265f59c42920d81e5
```

## Password
> 47e603bb428404d265f59c42920d81e5

  
