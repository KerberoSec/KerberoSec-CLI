# Bandit Level 27
## Part I

```bash
    ssh bandit.labs.overthewire.org -p 2220 -l bandit26
    # Decrease the lenght of the window then enter the password
    # Password: 5czgV9L3Xx8JPOyRbXh6lQbmIOWvPT6Z
    # Type v fo vim editor
```
```bash
    # Lets try to set the bash to '/bin/sh'
    # Now it appears that we are in a child process launched by a shell called 'subshell'
    :! ls -la
    :! file bandit27-do
    # bandit27-do : setuid ELF 32-bit LSB executable..
    :! ./bandit27-do cat /etc/bandit_pass/bandit27
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit27* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level27.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit27
	# OR ssh bandit27@bandit.labs.overthewire.org -p 2220
	# password: 3ba3118a22e93127a4ed485be72ef5ea
```
2. Enter the password as shown in the comment of bash.
