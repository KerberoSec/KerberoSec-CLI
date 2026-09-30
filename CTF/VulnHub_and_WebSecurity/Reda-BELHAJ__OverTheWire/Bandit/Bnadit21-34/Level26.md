# Bandit Level 26
## Part I

```bash
    ssh -i bandit26.sshkey bandit26@localhost
    # Connection to localhost closed
```
```bash
    cat /etc/passwd | grep bandit26
    cat /usr/bin/showtext
    # It appears that showtext is a bash program that run when we try to connect to Level26
    # We try another time an ssh connection with a 'more' exploit
    # Try to decrease lenght of your terminal window
    ssh -i bandit26.sshkey bandit26@localhost
    # Type 'v' to access the vim editor 
    # Then :e /etc/bandit_pass/bandit26
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit26* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level26.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit26
	# OR ssh bandit26@bandit.labs.overthewire.org -p 2220
	# password: 5czgV9L3Xx8JPOyRbXh6lQbmIOWvPT6Z
```
2. Enter the password as shown in the comment of bash.
