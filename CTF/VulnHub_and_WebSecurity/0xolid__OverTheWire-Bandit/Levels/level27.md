# Bandit Level 27

> There is a git repository at `ssh://bandit27-git@bandit.labs.overthewire.org/home/bandit27-git/repo` via the port `2220`. The password for the user `bandit27-git` is the same as for the user `bandit27`.

## Login

```shell
ssh bandit27@bandit.labs.overthewire.org -p 2220

upsNCc7vzaRDx6oZC6GiR6ERwe1MowGB
```

## Solution

In your machine you have to clone the repo on port 2220 and the password is the same.

```shell
git clone ssh://bandit27-git@bandit.labs.overthewire.org:2220/home/bandit27-git/repo
```

```shell
cd repo
```

```shell
cat README.md
```

```text
The password to the next level is: Yz9IpL0sBcCeuG7m9uQFt8ZNpS4HZRcN
```

