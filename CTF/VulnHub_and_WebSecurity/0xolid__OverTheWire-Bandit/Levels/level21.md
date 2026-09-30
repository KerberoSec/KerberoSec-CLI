# Bandit Level 21

> A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in `/etc/cron.d/` for the configuration and see what command is being executed.

## Login

```shell
ssh bandit21@bandit.labs.overthewire.org -p 2220

EeoULMCra2q0dSkYj561DX7s1CpBuOBt
```

## Solution

```shell
cd /etc/cron.d/
```

```shell
ls -la
```

```shell
cat cronjob_bandit22
```

```text
@reboot bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
* * * * * bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
```

```shell
cat /usr/bin/cronjob_bandit22.sh
```

```text
#!/bin/bash
chmod 644 /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
cat /etc/bandit_pass/bandit22 > /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```

```shell
cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```

```text
tRae0UfB9v0UzbCdn9cY0gQnds9GF58Q
```

