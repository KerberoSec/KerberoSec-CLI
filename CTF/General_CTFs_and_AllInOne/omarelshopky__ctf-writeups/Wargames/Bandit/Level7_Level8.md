# Bandit Level 7 --> Level 8
## Level Goal

The password for the next level is stored in the file data.txt next to the word millionth

## Commands you may need to solve this level
grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

## Solution
ls command show file in home directory "data.txt" has many line of text 
```console
bandit7@bandit:~$ ls
data.txt
```

find the line has the word "millionth"
```console
bandit7@bandit:~$ grep millionth data.txt
millionth	cvX2JJa4CFALtqS87jk27qwqGhBM9plV 
```

## Password
> cvX2JJa4CFALtqS87jk27qwqGhBM9plV
