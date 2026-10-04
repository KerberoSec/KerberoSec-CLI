# Bandit Level 16

> The credentials for the next level can be retrieved by submitting the password of the current level to **a port on localhost in the range 31000 to 32000**. First find out which of these ports have a server listening on them. Then find out which of those speak SSL/TLS and which don’t. There is only 1 server that will give the next credentials, the others will simply send back to you whatever you send to it.

## Login

```shell
ssh bandit16@bandit.labs.overthewire.org -p 2220

8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
```

## Solution

```shell
cat /etc/bandit_pass/bandit16
```

```text
kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
```

```shell
nmap -sV -p31000-32000 localhost
```

```text
31790/tcp open  ssl/unknown
```

```shell
echo "kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx" | openssl s_client -connect localhost:31790 -ign_eof
```

Then he will give you a SSH privat key you need to copy it and past it in a file in your local machine. Then change his permetion with `chmod 600 file_name`.
Then use it to connect to the next level.

