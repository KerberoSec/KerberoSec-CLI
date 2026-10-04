# Bandit Level 20
## Part I

```bash
    file bandit20-do
    # bandit20-do: setuid ELF 32-bit LSB executable...
    ./bandit20-do
    # They ll give us an example Example: ./bandit20-do id
    ./bandit20-do cat /etc/bandit_pass/bandit20
```

And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit20* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit10-20/Level20.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit20
	# OR ssh bandit20@bandit.labs.overthewire.org -p 2220
	# password: GbKksEFF4yrVs6il55v6gwY5aVje5f0j
```
2. Enter the password as shown in the comment of bash.
