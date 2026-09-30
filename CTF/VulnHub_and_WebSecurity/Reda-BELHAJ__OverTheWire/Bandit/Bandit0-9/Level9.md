# Bandit Level 9
## Part I
Enter the following command in your Terminal :  
```bash
    wc -l data.txt
    # There's 1001 line in data.txt 
    sort data.txt | uniq -u
    # OR sort data.txt | uniq -c | grep "1 "
    # and we can check by running also 'sort data.txt | uniq -c' 
    #       it gives the number of times the line appears in 'data.txt' (Once 1)
```
And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i)).

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit9* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level9.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit9
	# OR ssh bandit9@bandit.labs.overthewire.org -p 2220
	# password: UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR
```
2. Enter the password as shown in the comment of bash.
