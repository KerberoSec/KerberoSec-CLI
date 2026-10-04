# Bandit Level 7
## Part I
#### Properties given:
- Owned by user bandit7.
- Owned by group bandit6.
- 33 bytes in size.
#### Hint:
> ***Somewhere on the server***: this phrase means that we should search in all the OTW server "/".

Enter the following command in your Terminal :  
```bash
    ls -la
    # There's not a single file in this wd: /home/bandit6
```
```bash
    find / -type f -user bandit7 -group bandit6 -size 33c -exec cat {} +
```
and copy the last text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i)).

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit7* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level7.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit7
	# OR ssh bandit7@bandit.labs.overthewire.org -p 2220
	# password: HKBPTKQnIay4Fw76bEy8PVxKEDQRKTzs
```
2. Enter the password as shown in the comment of bash.
