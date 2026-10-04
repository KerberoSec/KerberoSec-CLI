Let's work on pushing things...
![Bandit31](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit31/level31-%3Elevel32.png)

Let's go:
```
bandit31@bandit:~$ mkdir /tmp/b31-git && cd /tmp/b31-git
bandit31@bandit:/tmp/b31-git$ git clone ssh://bandit31-git@localhost/home/bandit31-git/repo
Cloning into 'repo'...
Could not create directory '/home/bandit31/.ssh'.
The authenticity of host 'localhost (127.0.0.1)' can't be established.
ECDSA key fingerprint is SHA256:98UL0ZWr85496EtCRkKlo20X3OPnyPSB5tB5RPbhczc.
Are you sure you want to continue connecting (yes/no)? yes
Failed to add the host to the list of known hosts (/home/bandit31/.ssh/known_hosts).
This is a OverTheWire game server. More information on http://www.overthewire.org/wargames

bandit31-git@localhost's password: 
remote: Counting objects: 4, done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 4 (delta 0), reused 0 (delta 0)
Receiving objects: 100% (4/4), 383 bytes | 0 bytes/s, done.
bandit31@bandit:/tmp/b31-git$ cd repo
bandit31@bandit:/tmp/b31-git/repo$ ls -al
total 20
drwxr-sr-x 3 bandit31 root 4096 Sep  3 18:24 .
drwxr-sr-x 3 bandit31 root 4096 Sep  3 18:24 ..
drwxr-sr-x 8 bandit31 root 4096 Sep  3 18:24 .git
-rw-r--r-- 1 bandit31 root    6 Sep  3 18:24 .gitignore
-rw-r--r-- 1 bandit31 root  147 Sep  3 18:24 README.md
bandit31@bandit:/tmp/b31-git/repo$ cat README.md 
This time your task is to push a file to the remote repository.

Details:
    File name: key.txt
    Content: 'May I come in?'
    Branch: master

bandit31@bandit:/tmp/b31-git/repo$ cat .gitignore 
*.txt
bandit31@bandit:/tmp/b31-git/repo$ echo "May I come in?" > key.txt
bandit31@bandit:/tmp/b31-git/repo$ git rm .gitignore 
rm '.gitignore'
bandit31@bandit:/tmp/b31-git/repo$ ls -al
total 20
drwxr-sr-x 3 bandit31 root 4096 Sep  3 18:25 .
drwxr-sr-x 3 bandit31 root 4096 Sep  3 18:24 ..
drwxr-sr-x 8 bandit31 root 4096 Sep  3 18:25 .git
-rw-r--r-- 1 bandit31 root   15 Sep  3 18:25 key.txt
-rw-r--r-- 1 bandit31 root  147 Sep  3 18:24 README.md
bandit31@bandit:/tmp/b31-git/repo$ git status
On branch master
Your branch is up-to-date with 'origin/master'.
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

	deleted:    .gitignore

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	key.txt

bandit31@bandit:/tmp/b31-git/repo$ git add .
bandit31@bandit:/tmp/b31-git/repo$ git commit -m "Trying to fetch the password for bandit32! Attempt-1..."
[master 100058f] Trying to fetch the password for bandit32! Attempt-1...
 2 files changed, 1 insertion(+), 1 deletion(-)
 delete mode 100644 .gitignore
 create mode 100644 key.txt
bandit31@bandit:/tmp/b31-git/repo$ git push origin master 
Could not create directory '/home/bandit31/.ssh'.
The authenticity of host 'localhost (127.0.0.1)' can't be established.
ECDSA key fingerprint is SHA256:98UL0ZWr85496EtCRkKlo20X3OPnyPSB5tB5RPbhczc.
Are you sure you want to continue connecting (yes/no)? yes
Failed to add the host to the list of known hosts (/home/bandit31/.ssh/known_hosts).
This is a OverTheWire game server. More information on http://www.overthewire.org/wargames

bandit31-git@localhost's password: 
Counting objects: 3, done.
Delta compression using up to 2 threads.
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 320 bytes | 0 bytes/s, done.
Total 3 (delta 0), reused 0 (delta 0)
remote: ### Attempting to validate files... ####
remote: 
remote: .oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.
remote: 
remote: Well done! Here is the password for the next level:
remote: 56a9bf19c63d650ce78e6ec0354ee45e
remote: 
remote: .oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.oOo.
remote: 
To ssh://localhost/home/bandit31-git/repo
 ! [remote rejected] master -> master (pre-receive hook declined)
error: failed to push some refs to 'ssh://bandit31-git@localhost/home/bandit31-git/repo'
bandit31@bandit:/tmp/b31-git/repo$
```
This challenge aims to introduce us about , how to ignore files which don't need to be tracked in our project.
We used a simple file called `.gitignore` which consists of files which no-longer requires tracking!

Learn more about it [here](https://git-scm.com/docs/gitignore).

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `56a9bf19c63d650ce78e6ec0354ee45e` to log into the remote-machine as `bandit32`.

**Warning: Please, first try Level 32 -> Level 33! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
