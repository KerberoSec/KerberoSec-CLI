# Bandit Level 5 --> Level 6
## Level Goal

The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:

  * human-readable
  * 1033 bytes in size
  * not executable

## Commands you may need to solve this level
ls, cd, cat, file, du, find

## Solution
ls command show that there is folder in home directory "inhere"
```console
bandit5@bandit:~$ ls
inhere
```

Lets see it
```console
bandit5@bandit:~$ cd inhere
bandit5@bandit:~/inhere$
```

ls command show 20 folders in inhere directory.
```console
bandit5@bandit:~/inhere$ ls
maybehere00  maybehere03  maybehere06  maybehere09  maybehere12  maybehere15  maybehere18
maybehere01  maybehere04  maybehere07  maybehere10  maybehere13  maybehere16  maybehere19
maybehere02  maybehere05  maybehere08  maybehere11  maybehere14  maybehere17
```

First find not executable and 1033bytes in size files
```console
bandit5@bandit:~/inhere$ find -not -executable -size 1033c
./maybehere07/.file2
```

Check human readablity
```console
bandit5@bandit:~/inhere$ file ./maybehere07/.file2
./maybehere07/.file2: ASCII text, with very long lines
```

Password in "./maybehere07/.file2" 
```console
bandit5@bandit:~/inhere$ cat ./maybehere07/.file2
DXjZPULLxYr17uwoI01bNLQbtFemEgo7
```

## Password
> DXjZPULLxYr17uwoI01bNLQbtFemEgo7
