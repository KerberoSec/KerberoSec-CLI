# Objetive
- The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.

## What is human-readable file ?
- These are files that humans can naturally read without needing to be processed by a computer. The content of these files is generally encoded in ASCII or Unicode. Unlike a machine-readable file, which is in binary and needs to be translated or processed to be read by a human.

## Solution 
- To solve this level, I realized it would be tedious to figure out which files were readable one by one. So I researched how to use the `file` and `find` commands.

- First, I used the `find` command to search the current directory and its subdirectories.

- The `-type f` command filters only the files containing regular expressions, excluding directories and subdirectories.

- `-exec file {}` executes `file` on all the files grouped by `find` in a single call, reducing the number of times `file` needs to be used.

- `grep -i "text"` filters everything that appears in the previous command and returns only the files containing "text".

- This gave me the password for the next level: 4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw

## commands used
- ssh 
- ls 
- pwd 
- cd 
- grep 
- find
- file

