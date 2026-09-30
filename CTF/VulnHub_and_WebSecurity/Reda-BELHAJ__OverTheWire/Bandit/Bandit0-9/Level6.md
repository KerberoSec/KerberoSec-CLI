# Bandit Level 6
## Part I

#### Properties given:

- Human-readable
- 1033 bytes in size
- Not executable

Enter the following command in your Terminal :  
```bash
    cd inhere/
    # change the working directory to inhere/
```
```bash
    ls -la
    # We did find a lot of directories (20) under inhere/ , So we have to automate the search about the properties given
    find . -type f -size 1033c -exec cat {} +
    # OR use 'cat $(find . -type f -size 1033c)'
    # -type f -size 1033c : we select only files with 1033 bytes 'c' for bytes
    # -exec cat {} +      : we execute cat < "the result of find command" 
    #             {} will be expanded to the files found 
    #             and + will enable us to read as many arguments as possible per invocation of cat
    # try to use 'man' command to figure out your approach
```
and copy the text to your clipboard (or try [the scp Method](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level1.md#part-i)).

## Part II

The ***host*** to which you need to connect is *bandit.labs.overthewire.org*, on ***port*** 2220. The ***username*** is *bandit6* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Bandit/Bandit0-9/Level6.md#part-i). 

1. Enter the following command:  

```bash
	ssh bandit.labs.overthewire.org -p 2220 -l bandit6
	# OR ssh bandit6@bandit.labs.overthewire.org -p 2220
	# password: DXjZPULLxYr17uwoI01bNLQbtFemEgo7
```
2. Enter the password as shown in the comment of bash.
