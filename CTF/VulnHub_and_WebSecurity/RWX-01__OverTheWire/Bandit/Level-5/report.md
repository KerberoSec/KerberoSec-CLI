# Objetive
- The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:

- human-readable
- 1033 bytes in size
- not executable

## Solution 

- To find the password for this level, the first thing I had to learn was how to use the `du` command, which is used to find the disk size of a file or directory. Then, since I was trying to find a readable file of a specific size, I realized that listing the `inhere` directory would show several subdirectories, and it seemed very tedious to try each one. I simply had to add `du` with the `-size 1033c` parameter to the command from the previous level so that it would give me the password inside the `maybehere07` directory HWasnPhtq9AVKe0dmk45nxy20cvUa6EG: `find . -type f -size 1033c -exec file {} + | grep -i "text"`

## commands used
- ssh 
- pwd
- ls
- cd 
- cat 
- find
- file
- find . -type f -size 1033c -exec  file {} +  | grep -i "text"
- cat ./maybehere07/.file2
