# Bandit Level 8
## Part I

Enter the following command in your Terminal :  
```bash
    wc -l data.txt
    # There's 98567 line in data.txt 
    grep millionth data.txt
```
and copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i)).

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit8* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level8.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit8
	# OR ssh bandit8@bandit.labs.overthewire.org -p 2220
	# password: cvX2JJa4CFALtqS87jk27qwqGhBM9plV
```
2. Enter the password as shown in the comment of bash.
