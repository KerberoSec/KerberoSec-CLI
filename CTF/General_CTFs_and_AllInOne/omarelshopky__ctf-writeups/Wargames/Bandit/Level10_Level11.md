# Bandit Level 10 --> Level 11
## Level Goal

The password for the next level is stored in the file data.txt, which contains base64 encoded data

## Commands you may need to solve this level
grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

## Solution
ls command show file in home directory "data.txt"  
```console
bandit10@bandit:~$ ls
data.txt
```

Let's see it
```console
bandit10@bandit:~$ cat data.txt
VGhlIHBhc3N3b3JkIGlzIElGdWt3S0dzRlc4TU9xM0lSRnFyeEUxaHhUTkViVVBSCg==
```

It's in base64 so let's decode it
```console
bandit10@bandit:~$ base64 -d data.txt
The password is IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR
```

## Password
> IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR

