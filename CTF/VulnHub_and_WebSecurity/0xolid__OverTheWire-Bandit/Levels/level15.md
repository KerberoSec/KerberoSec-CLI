# Bandit Level 15

> The password for the next level can be retrieved by submitting the password of the current level to **port 30001 on localhost** using SSL/TLS encryption.

## Login

```shell
ssh bandit15@bandit.labs.overthewire.org -p 2220

kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
```

## Solution

```shell
cat /etc/bandit_pass/bandit15
```

```text
8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
```

```shell
echo "8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo" | openssl s_client -connect localhost:30001
```

We have to add the `-ing_eof` to the command to (ignore End of File) and get the password.

```shell
echo "8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo" | openssl s_client -connect localhost:30001 -ign_eof
```

```text
kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
```

