# Bandit Level 16
## Part I

```bash
    openssl s_client -quiet -connect 127.0.0.1:30001
    # Paste the password 
    # Correct!
    # cluFn7wTiGryunymYOu4RcffSxQluehd
```
And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit16* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit10-20/Level16.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit16
	# OR ssh bandit16@bandit.labs.overthewire.org -p 2220
	# password: cluFn7wTiGryunymYOu4RcffSxQluehd
```
2. Enter the password as shown in the comment of bash.
