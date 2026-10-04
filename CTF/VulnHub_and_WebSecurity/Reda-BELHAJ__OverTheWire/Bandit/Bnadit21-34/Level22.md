# Bandit Level 22
## Part I

```bash
    top
    #   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
    #  2850 bandit21  20   0   21468   5256   3100 S   0.0  0.1   0:00.28 bash
    # 22068 bandit21  20   0   21148   4836   3020 S   0.0  0.1   0:00.05 bash
    # There's two processes 
```
```bash
    cd /etc/cron.d/
    ls -la
    cat cronjob_bandit22
    # @reboot bandit23 /usr/bin/cronjob_bandit22.sh  &> /dev/null
    # * * * * * bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
    cat /usr/bin/cronjob_bandit22.sh
    # There's two commands 'chmod' and 'cat'
    cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit22* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level22.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit22
	# OR ssh bandit22@bandit.labs.overthewire.org -p 2220
	# password: Yk7owGAcWjwMVRwrTesJEwB7WVOiILLI
```
2. Enter the password as shown in the comment of bash.
