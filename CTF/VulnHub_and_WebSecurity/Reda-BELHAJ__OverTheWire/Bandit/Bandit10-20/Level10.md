# Bandit Level 10
## Part I
Enter the following command in your Terminal :  
```bash
    file data.txt
    # It appears that 'data.txt' is a data file
    strings data.txt | grep '=' | awk -F' ' '{print $2}' | awk 'length($0) > 10'
    # strings   : Print the strings of printable characters in files.
    # grep '='  : From the hint "preceded by several ‘=’ characters."
    # awk -F' ' : Tells awk what field separator to use. In our case, -F' ' means that the separator is " " (space)
    # '{print $2}' : Print the 2sd operator.
    # awk 'length($0) > 10' : Choose the words that have 10+ characters. (human-readable strings)
    # OR we can brute force it since all the password that have a 32 len.
```
And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i)).

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit10* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit10-20/Level10.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit10
	# OR ssh bandit10@bandit.labs.overthewire.org -p 2220
	# password: truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk
```
2. Enter the password as shown in the comment of bash.
