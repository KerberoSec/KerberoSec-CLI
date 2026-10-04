# Bandit Level 31
## Part I

```bash
    mkdir /tmp/reda8
    cd /tmp/reda8
    git clone ssh://bandit30-git@localhost/home/bandit30-git/repo
    # Paste 5b90576bedb2cc04c86a9e924ce42faf
    cd repo
    cat README
    git show
    # Shows the changes made in the README.md file Nothing interesting
```
```bash
    git show-ref --tags -d
    # we have a tag : secret
    git show secret
    # 47e603bb428404d265f59c42920d81e5
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit31* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level31.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit31
	# OR ssh bandit31@bandit.labs.overthewire.org -p 2220
	# password: 47e603bb428404d265f59c42920d81e5
```
2. Enter the password as shown in the comment of bash.
