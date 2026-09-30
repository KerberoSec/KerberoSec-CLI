# level 22

> ## A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.

>[!note]
> ### Looking at shell scripts written by other people is a very useful skill. The script for this level is intentionally made easy to read. If you are having problems understanding what it does, try executing it to see the debug information it prints.

```bash
cd /etc/cron.d/
cat cronjob_bandit23
cat /usr/bin/cronjob_bandit23.sh
/usr/bin/cronjob_bandit23.sh

```

<img width="993" height="741" alt="image" src="https://github.com/user-attachments/assets/b285acb7-a657-4853-8ba4-8f8ac31171c6" />

>[!Caution]
> # this is password for user bandit 22 we need pass for bandit 23

```bash
myname=bandit23
echo I am user $myname | md5sum | cut -d ' ' -f 1
cat /tmp/8ca319486bfbbc3663ea0fbe81326349
```

<img width="892" height="147" alt="image" src="https://github.com/user-attachments/assets/dbfef5b2-4e85-4f0e-a836-83a60dbdc2f8" />

```
0Zf11ioIjMVN551jX3CmStKLYqjk54Ga
```

