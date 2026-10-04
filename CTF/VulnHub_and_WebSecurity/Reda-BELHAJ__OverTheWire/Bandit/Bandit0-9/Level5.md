# Bandit Level 5
## Part I

Enter the following command in your Terminal :  
```bash
      cd inhere/
      # change the working directory to inhere/
```
```bash
      ls -la
      # there's 10 files and the one who store the password is "-file07" (the lenght of the key)
      # if your terminal is messed up, try the "reset" command.
      cat < -file07
```
and copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i)).

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit5* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level5.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit5
	# OR ssh bandit5@bandit.labs.overthewire.org -p 2220
	# password: koReBOKuIDDepwhWk7jZC0RTdopnAYKh
```
2. Enter the password as shown in the comment of bash.
