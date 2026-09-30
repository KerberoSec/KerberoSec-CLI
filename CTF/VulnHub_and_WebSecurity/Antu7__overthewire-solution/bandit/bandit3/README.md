# Bandit3

link-> https://overthewire.org/wargames/bandit/bandit3.html

## LEVEL GOAL

The password for the next level is stored in a hidden file in the inhere directory.

Commands you may need to solve this level
ls, cd, cat, file, du, find

## SOLUTION

```
antu@root:~/overthewire-bandit/bandit3$ ssh bandit3@bandit.labs.overthewire.org -p 2220
bandit3@bandit.labs.overthewire.org's password: UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK
bandit3@bandit:~$ ls
inhere
bandit3@bandit:~$ cd inhere
bandit3@bandit:~$
bandit3@bandit:~$ ls -a
bandit3@bandit:~$ .  ..  .hidden
bandit3@bandit:~$ cat .hidden
pIwrPrtPN36QITSp3EQaw936yaFoFgAB
```

So `pIwrPrtPN36QITSp3EQaw936yaFoFgAB` is our password to get access into next level

## Note
you also can use those to pass these challenges.

1) more 
2) less 
3) head
4) grep .
5) nano
6) vim