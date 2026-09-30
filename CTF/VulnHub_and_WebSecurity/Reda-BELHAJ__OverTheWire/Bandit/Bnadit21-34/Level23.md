# Bandit Level 23
## Part I

```bash
    top
    #   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
    # 12297 bandit22  20   0   21148   4868   3040 S   0.0  0.1   0:00.08 bash
    # There's one process 
```
```bash
    cd /etc/cron.d/
    ls -la
    cat cronjob_bandit23
    # @reboot bandit23 /usr/bin/cronjob_bandit23.sh  &> /dev/null
    # * * * * * bandit23 /usr/bin/cronjob_bandit23.sh &> /dev/null
    cat /usr/bin/cronjob_bandit23.sh
    # We see a pretty simple shell Lets run it
    /usr/bin/cronjob_bandit23.sh
    # Don' try to chmod the file like i did in the first attempt its already an executable.
    cat /tmp/8169b67bd894ddbb4412f91573b38db3
    # password: Yk7owGAcWjwMVRwrTesJEwB7WVOiILLI we got the same password because in the shell the variable 'myname' is bandit2
    # Lets try convert "I am user bandit23" with md5sum 
    echo I am user bandit23 | md5sum | cut -d ' ' -f 1
    cat /tmp/8ca319486bfbbc3663ea0fbe81326349
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit23* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level23.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit23
	# OR ssh bandit23@bandit.labs.overthewire.org -p 2220
	# password: jc1udXuA1tiHqjIsL8yaapX5XIAI6i0n
```
2. Enter the password as shown in the comment of bash.
