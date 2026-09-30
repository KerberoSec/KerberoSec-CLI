# Bandit Level 13 --> Level 14
## Level Goal

The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level. Note: localhost is a hostname that refers to the machine you are working on

## Commands you may need to solve this level
ssh, telnet, nc, openssl, s_client, nma

## Solution
ls command show file in home directory "sshkey.private" 
```console
bandit13@bandit:~$ ls
sshkey.private
```

we can log in next level by using private key as follow
```console
bandit13@bandit:~$ ssh -i sshkey.private bandit14@lcoalhost
```
all levels pass in bandit_pass folder we can get our pass from there 
```console
bandit14@bandit:~$ cat /etc/bandit_pass/bandit14
4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e
```

## Password
> 4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e

  
