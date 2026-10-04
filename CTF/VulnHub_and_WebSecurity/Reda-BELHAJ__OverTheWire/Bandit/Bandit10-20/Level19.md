# Bandit Level 19
## Part I
#### 1st Method
```bash
    ssh bandit18@bandit.labs.overthewire.org -p 2220 "cat readme"
```
### 2sd Method
```bash
    ssh -t bandit18@bandit.labs.overthewire.org -p 2220  /bin/sh
    # we try to force the server to start with bash shell
    $ ls -la
    $ cat readme
    # IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit19* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit10-20/Level19.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit19
	# OR ssh bandit19@bandit.labs.overthewire.org -p 2220
	# password: IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x
```
2. Enter the password as shown in the comment of bash.
