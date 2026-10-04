# Bandit Level 18 --> Level 19
## Level Goal
The password for the next level is stored in a file readme in the homedirectory. Unfortunately, someone has modified .bashrc to log you out when you log in with SSH.

## Commands you may need to solve this level
ssh, ls, cat

## Solution

connect close emmediatily so write two commands in the same line to execute before exit
```console
ssh -t bandit18@bandit.labs.overthewire.org -p 2220 cat readme
```

## Password
> IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x

  
