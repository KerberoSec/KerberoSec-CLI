# Bandit Level 28
## Part I

```bash
    mkdir /tmp/reda4
    cd /tmp/reda4
    git clone ssh://bandit27-git@localhost/home/bandit27-git/repo
    # Paste 3ba3118a22e93127a4ed485be72ef5ea
    cd repo
    cat README
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit28* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level28.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit28
	# OR ssh bandit28@bandit.labs.overthewire.org -p 2220
	# password: 0ef186ac70e04ea33b4c1853d2526fa2
```
2. Enter the password as shown in the comment of bash.
