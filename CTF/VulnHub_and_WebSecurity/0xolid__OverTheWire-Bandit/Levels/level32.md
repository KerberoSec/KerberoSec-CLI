# Bandit Level 32

> After all this `git` stuff, it’s time for another escape. Good luck!

## Login

```shell
ssh bandit32@bandit.labs.overthewire.org -p 2220

3O9RfhqyAlVBEZpVb6LYStshZoqoSx5K
```

## Solution

```shell
WELCOME TO THE UPPERCASE SHELL
>> whoami
sh: 1: WHOAMI: Permission denied
```

Here we see that we are in a shell that change all our commands to uppercase.

The one thing in linux that is uppercase is variables. Specifically, the variable `$0` has a reference to a shell. You can see this with `echo $0` on your machine.
This lets us break out of the uppercase shell and we can use commands again.

```shell
cat /etc/bandit\_pass/bandit33
```

```text
tQdtbs5D5i2vJwkO8mEyYEyTL8izoeJ0
```

