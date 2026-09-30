```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___ __   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  |__`. 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / / |_ | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___|__.'
```
A program is running automatically at regular intervals from cron, the time-based job
scheduler. Look in `/etc/cron.d/` for the configuration and see what command is being
executed. Looking at shell scripts written by other people is a very useful skill.
The script for this level is intentionally made easy to read. Upon having problems
understanding what it does, we can try executing it to see the debug information it
prints. [^1]

Solution
----------------------------------------------------------------------------------------
Once again, we first move to the `/etc/cron.d/` configuration directory and investigate
this level's *bandit23* bash script that was referenced in the cron job to be run every
minute and upon system start up, `/usr/bin/cronjob_bandit23.sh`.
```bash
#!/bin/bash

myname=$(whoami)
mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)

echo "Copying passwordfile /etc/bandit_pass/$myname to /tmp/$mytarget"

cat /etc/bandit_pass/$myname > /tmp/$mytarget
```
This bash script prints the phrase "I am user bandit23"; then applies MD5 encryption on
it and extracts only the hash from it. Finally, it copies the next level's password into
a temporary file with the file name of the previously extracted hash. In order, to find
out this file name, we can reproduce it with `echo I am user bandit23 | md5sum | cut -d
' ' -f 1`. It is our objective now, to get the contents of the password file with either
of those two commands.
```bash
cat /tmp/8ca319486bfbbc3663ea0fbe81326349
cat /tmp/$(echo I am user bandit23 | md5sum | cut -d ' ' -f 1)
```

[^1]: https://overthewire.org/wargames/bandit/bandit23.html
