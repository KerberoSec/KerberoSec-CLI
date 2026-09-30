# Bandit1

link-> https://overthewire.org/wargames/bandit/bandit1.html

## LEVEL GOAL

The password for the next level is stored in a file called: located in the home directory

## SOLUTION

```
antu@root:~/overthewire-bandit/bandit1$ ssh bandit1@bandit.labs.overthewire.org -p 2220
bandit1@bandit.labs.overthewire.org's password: boJ9jbbUNNfktd78OOpsqOltutMc3MY1
bandit1@bandit:~$ ls
-
```
What is that? A `-` symbol? wired. Because of that symbol, we don't read that file because its act as a parameter
```
bandit1@bandit:~$ cat ./-
CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9
```  
So `CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9` is our password to get access into next level

## Note
you also can use those to pass these challenges.
```
bandit1@bandit:~$ cat < -
CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9
```

1) more 
2) less 
3) head
4) grep .
5) nano
6) vim