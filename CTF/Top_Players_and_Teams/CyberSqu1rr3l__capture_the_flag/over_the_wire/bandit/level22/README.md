```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___ ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  (_  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / / / /  
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___|___|
```
A program is running automatically at regular intervals from cron, the time-based job
scheduler. Look in `/etc/cron.d/` for the configuration and see what command is being
executed. [^1]

Solution
----------------------------------------------------------------------------------------
As written in the description, we move to the `/etc/cron.d` directory and print its
contents with `ls`. This way, we can spot many cronjobs, one of which seems to be linked
to the current level with `cronjob_bandit22` and so we print its contents.
```bash
$ cat cronjob_bandit22
@reboot bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
* * * * * bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null

$ cat /usr/bin/cronjob_bandit22.sh 
#!/bin/bash
chmod 644 /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
cat /etc/bandit_pass/bandit22 > /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```
This, in turn references the bash script `/usr/bin/cronjob_bandit22.sh` which we then
have a look at. In it, we see a change in file permissions and the copying of the next
level's password into `/tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv`, a temporary file. And
indeed, by checking the contents of it, we can discover the password for the next level.

[^1]: https://overthewire.org/wargames/bandit/bandit22.html
