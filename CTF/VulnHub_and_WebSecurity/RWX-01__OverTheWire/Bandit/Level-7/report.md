# Objetive
- The password for the next level is stored in the file data.txt next to the word millionth 
## Solution
- To find the next level password, I just had to use the `sort` command with the `uniq -u` parameter, which means I want to filter out the repeated lines and show only the unique ones. I then filtered the word `millionth` with `grep`, thus obtaining the word and the password that appears next to it.dfwvzFQi4mU0wfNbFOe9RoWskMLg7eEc

## commands used
- pwd 
- ls 
- grep 
- sort 
- uniq 
- cat data.txt 
- cat data.txt | sort uniq -u | grep -i "millionth"
