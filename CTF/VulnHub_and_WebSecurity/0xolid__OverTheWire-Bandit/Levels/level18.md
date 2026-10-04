# Bandit Level 18

> The password for the next level is stored in a file **readme** in the homedirectory. Unfortunately, someone has modified **.bashrc** to log you out when you log in with SSH.

## Login

```shell
ssh bandit18@bandit.labs.overthewire.org -p 2220

x2gLTTjFwMOhQ8oWNbMN362QKxfRqGlO
```

## Solution

The script will log you out so you need to add your commande with the connection.

```shell
ssh bandit18@bandit.labs.overthewire.org -p 2220 cat readme
```

```text
cGWpMaKXVwDUNgPAVJbWYuGHVn9zl3j8
```

