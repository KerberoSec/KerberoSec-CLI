# Bandit Level 2 --> Level 3 
## Level Goal

The password for the next level is stored in a file called spaces in this filename located in the home directory

## Commands you may need to solve this level
ls, cd, cat, file, du, find

## Solution
ls command show that there is file in home directory "spaces in this filename"
```
bandit2@bandit:~$ ls
spaces in this filename
```
Becouse filename contain spaces, write it between double quote.
```
bandit2@bandit:~$ cat "spaces in this filename"
UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK
```

## Password
> UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK

