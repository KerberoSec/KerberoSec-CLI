# Objetive 
- The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions
## Solution
- For this level, you need to know how to rotate 13 letters forward in the data.txt file. To do this, use the command tr 'A-Za-z' 'N-ZA-Mn-za-m'
- 7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4
## Commans used 

- ssh 
- pwd
- cat
- ls
- tr
- cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
 

