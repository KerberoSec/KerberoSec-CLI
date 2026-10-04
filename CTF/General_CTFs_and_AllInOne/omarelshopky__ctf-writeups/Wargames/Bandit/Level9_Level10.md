# Bandit Level 9 --> Level 10
## Level Goal

The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.

## Commands you may need to solve this level
grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

## Solution
ls command show file in home directory "data.txt" has many line of text 
```console
bandit9@bandit:~$ ls
data.txt
```
get human readable strings preceded by several ‘=’
```console
bandit9@bandit:~$ strings data.txt | grep == 
========== the*2i"4
========== password
Z)========== is
&========== truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk
```

## Password
> truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk
