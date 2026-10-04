# Bandit Level 17 --> Level 18
## Level Goal
There are 2 files in the homedirectory: passwords.old and passwords.new. The password for the next level is in passwords.new and is the only line that has been changed between passwords.old and passwords.new

**NOTE:** if you have solved this level and see ‘Byebye!’ when trying to log into bandit18, this is related to the next level, bandit19

## Commands you may need to solve this level
cat, grep, ls, diff

## Solution

There is two files in home dir contain many lines, password is the change between them
```console
bandit17@bandit:~$ ls
passwords.new  passwords.old
```

diff command compare two file then output the difference (Password)
```console
bandit17@bandit:~$ diff passwords.old passwords.new
42c42
< w0Yfolrc5bwjS4qw5mq1nnQi6mF03bii
---
> kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd
```

## Password
> kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd

  
