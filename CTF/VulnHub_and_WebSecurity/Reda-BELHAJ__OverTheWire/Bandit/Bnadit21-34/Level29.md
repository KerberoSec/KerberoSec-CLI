# Bandit Level 29
## Part I

```bash
    mkdir /tmp/reda5
    cd /tmp/reda5
    git clone  ssh://bandit28-git@localhost/home/bandit28-git/repo
    # Paste 0ef186ac70e04ea33b4c1853d2526fa2
    cd repo
    cat README
    git show
    # Shows the changes made in the README.md file
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit29* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level29.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit29
	# OR ssh bandit29@bandit.labs.overthewire.org -p 2220
	# password: bbc96594b4e001778eee9975372716b2
```
2. Enter the password as shown in the comment of bash.
