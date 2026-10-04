# Bandit Level 1 --> Level 2 
## Level Goal

The password for the next level is stored in a file called: located in the home directory.

## Commands you may need to solve this level
ls, cd, cat, file, du, find

## Solution
ls command show that there is file in home directory "-"
```
bandit1@bandit:~$ ls
-
```
Becouse filename start with dash, write ./ before the name.
```
bandit1@bandit:~$ cat ./-
CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9
```

## Password
> CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9

