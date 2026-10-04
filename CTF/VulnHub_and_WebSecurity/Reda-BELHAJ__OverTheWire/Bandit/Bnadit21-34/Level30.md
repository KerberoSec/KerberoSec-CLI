# Bandit Level 30
## Part I

```bash
    mkdir /tmp/reda6
    cd /tmp/reda6
    git clone  ssh://bandit28-git@localhost/home/bandit28-git/repo
    # Paste 0ef186ac70e04ea33b4c1853d2526fa2
    cd repo
    cat README
    git show
    # Shows the changes made in the README.md file Nothing interesting
```
```bash
    git show-branch --all
    # Shows the commit ancestry graph starting from the commit with both remote-tracking branches and local branches.
    # Lets switch to 'origin/dev' and see those data needed for development
    git checkout -b origin/dev
    git remote show origin
    git checkout dev
```
```bash
    cat README.md
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit30* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level30.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit30
	# OR ssh bandit30@bandit.labs.overthewire.org -p 2220
	# password: 5b90576bedb2cc04c86a9e924ce42faf
```
2. Enter the password as shown in the comment of bash.
