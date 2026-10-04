# Bandit2

link-> https://overthewire.org/wargames/bandit/bandit2.html

## LEVEL GOAL

The password for the next level is stored in a file called spaces in this filename located in the home directory

Commands you may need to solve this level
ls, cd, cat, file, du, find

## SOLUTION

```
antu@root:~/overthewire-bandit/bandit2$ ssh bandit2@bandit.labs.overthewire.org -p 2220
bandit2@bandit.labs.overthewire.org's password: CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9
bandit2@bandit:~$ ls
spaces in this filename
bandit2@bandit:~$ cat spaces\ in\ this\ filename
UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK
```

So `UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK` is our password to get access into next level

## Note
you also can use those to pass these challenges.

1) more 
2) less 
3) head
4) grep .
5) nano
6) vim