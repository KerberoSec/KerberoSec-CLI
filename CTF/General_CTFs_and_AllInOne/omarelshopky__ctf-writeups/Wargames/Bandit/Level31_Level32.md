# Bandit Level 31 --> Level 32
## Level Goal
There is a git repository at ssh://bandit31-git@localhost/home/bandit31-git/repo. The password for the user bandit31-git is the same as for the user bandit31.

Clone the repository and find the password for the next level.

## Commands you may need to solve this level
git

## Solution

Make dir in tmp folder then clone repository
```console
bandit31@bandit:~$ mkdir /tmp/repolev31
bandit31@bandit:~$ cd /tmp/repolev31
bandit31@bandit:/tmp/repolev31$ git clone ssh://bandit31-git@localhost/home/bandit31-git/repo
```

repo contain README file 
```console
bandit31@bandit:/tmp/repolev31$ cd repo
bandit31@bandit:/tmp/repolev31/repo$ ls
README.md
bandit31@bandit:/tmp/repolev31/repo$ cat README.md 
This time your task is to push a file to the remote repository.

Details:
    File name: key.txt
    Content: 'May I come in?'
    Branch: master
```

so our task is to push a file to repo, first lets make a file contain this text
```console
bandit31@bandit:/tmp/repolev31/repo$ nano key.txt
bandit31@bandit:/tmp/repolev31/repo$ cat key.txt 
May I come in?
```

After that add and commit our change
```console
bandit31@bandit:/tmp/repolev31/repo$ git add .
bandit31@bandit:/tmp/repolev31/repo$ git commit
On branch master
Your branch is up-to-date with 'origin/master'.
nothing to commit, working tree clean
```

That mean there is something prevent change lets see hidden files
```console
bandit31@bandit:/tmp/repolev31/repo$ ls -a
.  ..  .git  .gitignore  key.txt  README.md
bandit31@bandit:/tmp/repolev31/repo$ cat .gitignore
*.txt
```

So all file with extension .txt ignored, we should force it to change
```console
git add -f key.txt
git commit 
git push
```
## Password
> 56a9bf19c63d650ce78e6ec0354ee45e

  
