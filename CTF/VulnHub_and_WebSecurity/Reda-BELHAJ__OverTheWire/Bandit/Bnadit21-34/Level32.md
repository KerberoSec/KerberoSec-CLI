# Bandit Level 32
## Part I

```bash
    mkdir /tmp/reda9
    cd /tmp/reda9
    git clone ssh://bandit31-git@localhost/home/bandit31-git/repo
    # Paste 47e603bb428404d265f59c42920d81e5
    cd repo
    cat README
```
```bash
    vim key.txt
    # May I come in? [ESC] :wq
    git add key.txt -f
    # We force the commit because git ignore all the .txt because of the configuration in '.gitignore'
    git commit
    # Enter a message and save ^X
    git push
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit32* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level32.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit32
	# OR ssh bandit32@bandit.labs.overthewire.org -p 2220
	# password: 56a9bf19c63d650ce78e6ec0354ee45e
```
2. Enter the password as shown in the comment of bash.
