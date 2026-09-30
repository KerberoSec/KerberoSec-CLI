# Bandit Level 18
## Part I
```bash
    cat /etc/bandit_pass/bandit17
    # The password of bandit17: xLYVMN9WE5zQ5vHacb0sZEVqbrp7nBTn
    # After listing and 'wc - l' command, Both password.new and password.old have 100 line of keys.
    diff passwords.new passwords.old | grep "<"
    # Lines preceded by a < are lines from the first file.
    # kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd
```
And copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i))
## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit18* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit10-20/Level18.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit18
	# OR ssh bandit18@bandit.labs.overthewire.org -p 2220
	# password: kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd
	# Byebye !!
```
2. Enter the password as shown in the comment of bash.
