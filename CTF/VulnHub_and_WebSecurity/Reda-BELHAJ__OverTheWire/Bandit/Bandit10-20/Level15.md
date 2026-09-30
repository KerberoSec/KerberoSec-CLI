# Bandit Level 15

## Part I
Enter the following command in your Terminal :  
```bash
    cd /etc/bandit_pass/
    cat bandit14
```
You can't get all the password they are protected by Group/User permissions. :smiley:
And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i)).

```bash
    telnet 127.0.0.1 30000
    # Paste the password 
    # Correct!
    # BfMYroe26WYalil77FoDi9qh59eK5xNr
```

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit15* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit10-20/Level15.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit15
	# OR ssh bandit15@bandit.labs.overthewire.org -p 2220
	# password: BfMYroe26WYalil77FoDi9qh59eK5xNr
```
2. Enter the password as shown in the comment of bash.
