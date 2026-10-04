# Bandit Level 26

> Good job getting a shell! Now hurry and grab the password for bandit27!

## Login

```shell
ssh bandit26@bandit.labs.overthewire.org -p 2220

s0773xxkk0MXfdqOfPRVr9L3jJBUOgCZ
```

## Solution

After we have a shell in the previous level now we are `bandit26` so let's have the password for the next level.

```shell
ls -lh
```

```shell
./bandit27-do
```

```text
Run a command as another user.
  Example: ./bandit27-do id
```

```shell
./bandit27-do cat /etc/bandit_pass/bandit27
```

```text
upsNCc7vzaRDx6oZC6GiR6ERwe1MowGB
```

