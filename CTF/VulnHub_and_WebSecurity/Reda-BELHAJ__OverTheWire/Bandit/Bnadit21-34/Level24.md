# Bandit Level 24
## Part I

```bash
    ps -aux
    # USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
    # bandit23   922  0.0  0.1  21156  5080 pts/33   Ss+  14:36   0:00 -bash
    # bandit23  6488  0.0  0.1  21156  5080 pts/21   Ss+  14:48   0:00 -bash
    # bandit23  9915  0.0  0.0  23816  3508 pts/95   S+   14:57   0:00 nano script
    # bandit23 11295  0.0  0.1  21148  4860 pts/76   Ss   15:00   0:00 -bash
    # bandit23 17360  0.0  0.1  21148  4868 pts/95   Ss   14:09   0:00 -bash
```
```bash
    cd /etc/cron.d/
    ls -al
    cat cronjob_bandit24
    # @reboot bandit24 /usr/bin/cronjob_bandit24.sh  &> /dev/null
    # * * * * * bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
    cat /usr/bin/cronjob_bandit24.sh
    # We see a pretty simple program Lets run it
    /usr/bin/cronjob_bandit24.sh
```
```bash
    mkdir /tmp/reda3
    cd /tmp/reda3
    chmod 777 .
    vim firstscript.sh
    # !/bin/sh
    # cat /etc/bandit_pass/bandit24 > /tmp/reda3/result_password
    # Then [ESC] and :wq to save and quit.
    chmod 777 firstscript.sh
    # Make the shell executable for all the users
    cp firstscript.sh /var/spool/bandit24
    # After few seconds 'result_password' will appear
    cat result_password
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit24* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level24.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit24
	# OR ssh bandit24@bandit.labs.overthewire.org -p 2220
	# password: UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ
```
2. Enter the password as shown in the comment of bash.
