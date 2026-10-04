# Bandit Level 22

> A program is running automatically at regular intervals from **cron**, the time-based job scheduler. Look in **/etc/cron.d/** for the configuration and see what command is being executed.
> NOTE: Looking at shell scripts written by other people is a very useful skill. The script for this level is intentionally made easy to read. If you are having problems understanding what it does, try executing it to see the debug information it prints.

## Login

```shell
ssh bandit22@bandit.labs.overthewire.org -p 2220

tRae0UfB9v0UzbCdn9cY0gQnds9GF58Q
```

## Solution

```shell
cd /etc/cron.d/
```

```shell
ls -la
```

```shell
cat cronjob_bandit23
```

```text
@reboot bandit23 /usr/bin/cronjob_bandit23.sh  &> /dev/null
* * * * * bandit23 /usr/bin/cronjob_bandit23.sh  &> /dev/null
```

```shell
cat /usr/bin/cronjob_bandit23.sh
```

```shell
#!/bin/bash

myname=$(whoami)
mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)

echo "Copying passwordfile /etc/bandit_pass/$myname to /tmp/$mytarget"

cat /etc/bandit_pass/$myname > /tmp/$mytarget
```

```shell
echo "I am user bandit23" | md5sum | cut -d ' ' -f 1
```

```text
8ca319486bfbbc3663ea0fbe81326349
```

```shell
cat /tmp/8ca319486bfbbc3663ea0fbe81326349
```

```text
0Zf11ioIjMVN551jX3CmStKLYqjk54Ga
```

