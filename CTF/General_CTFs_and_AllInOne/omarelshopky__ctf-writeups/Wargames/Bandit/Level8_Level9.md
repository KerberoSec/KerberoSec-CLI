# Bandit Level 7 --> Level 8
## Level Goal

The password for the next level is stored in the file data.txt and is the only line of text that occurs only once

## Commands you may need to solve this level
grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

## Solution
ls command show file in home directory "data.txt" has many line of text 
```console
bandit8@bandit:~$ ls
data.txt
```

Get the only line of text that occurs only once
*(uniq command compare line by line so we should sort data first so similar line stand together)*
```console
bandit8@bandit:~$ sort data.txt | uniq -u
UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR
```

## Password
> UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR
