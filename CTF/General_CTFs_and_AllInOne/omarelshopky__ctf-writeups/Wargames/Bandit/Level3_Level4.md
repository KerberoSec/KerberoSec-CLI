# Bandit Level 3 --> Level 4
## Level Goal

The password for the next level is stored in a hidden file in the inhere directory.

## Commands you may need to solve this level
ls, cd, cat, file, du, find

## Solution
ls command show that there is folder in home directory "inhere"
```console
bandit3@bandit:~$ ls
inhere
```

Lets see it
```console
bandit3@bandit:~$ cd inhere
bandit3@bandit:~/inhere$ 
```

ls command show nothing in inhere directory so use -a flag to see all hidden files
```console
bandit3@bandit:~/inhere$ ls
bandit3@bandit:~/inhere$ ls -a
.  ..  .hidden
```

Password in ".hidden" file
```console
bandit3@bandit:~/inhere$ cat .hidden
pIwrPrtPN36QITSp3EQaw936yaFoFgAB
```

## Password
> pIwrPrtPN36QITSp3EQaw936yaFoFgAB
