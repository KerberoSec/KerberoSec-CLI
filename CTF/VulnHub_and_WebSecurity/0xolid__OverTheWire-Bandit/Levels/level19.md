# Bandit Level 19

> To gain access to the next level, you should use the setuid binary in the homedirectory. Execute it without arguments to find out how to use it. The password for this level can be found in the usual place (/etc/bandit_pass), after you have used the setuid binary.

## Login

```shell
ssh bandit19@bandit.labs.overthewire.org -p 2220

cGWpMaKXVwDUNgPAVJbWYuGHVn9zl3j8
```

## Solution

```shell
ls -lah
```

We see that the file is a setuid file, that's means we can act as another user when we run the script.

```shell
./bandit20-do whoami
```

```text
bandit20
```

When we run the script we act like user `bandit20` so let's read the password for the next level.

```shell
./bandit20-do cat /etc/bandit_pass/bandit20
```

```text
0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO
```

