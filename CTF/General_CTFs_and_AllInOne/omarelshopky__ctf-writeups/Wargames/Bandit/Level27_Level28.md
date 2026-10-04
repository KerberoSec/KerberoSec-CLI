# Bandit Level 27 --> Level 28
## Level Goal
There is a git repository at ssh://bandit27-git@localhost/home/bandit27-git/repo. The password for the user bandit27-git is the same as for the user bandit27.

Clone the repository and find the password for the next level.

## Commands you may need to solve this level
git

## Solution

Make dir in tmp folder then clone repository
```console
bandit27@bandit:~$ mkdir /tmp/repolev27
bandit27@bandit:~$ cd /tmp/repolev27
bandit27@bandit:/tmp/repolev27$ git clone ssh://bandit27-git@localhost/home/bandit27-git/repo
```

repo contain README file contain the pass
```console
bandit27@bandit:/tmp/repolev27$ cd repo
bandit27@bandit:/tmp/repolev27/repo$ ls
README
bandit27@bandit:/tmp/repolev27/repo$ cat README 
The password to the next level is: 0ef186ac70e04ea33b4c1853d2526fa2
```

## Password
> 0ef186ac70e04ea33b4c1853d2526fa2

  
