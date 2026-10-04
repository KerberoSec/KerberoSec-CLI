# Bandit Level 14

> The password for the next level can be retrieved by submitting the password of the current level to **port 30000 on localhost**.

## Login

```shell
ssh -i sshkey.private bandit14@bandit.labs.overthewire.org -p 2220
```

## Solution

To take the password of the current level.

```shell
cat /etc/bandit_pass/bandit14
```

```text
MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS
```

```shell
echo "MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS" | nc -v localhost 30000
```

```text
8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
```

