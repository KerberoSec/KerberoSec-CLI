## Objetive
- The password for the next level is stored somewhere on the server and has all of the following properties:

- owned by user bandit7
- owned by group bandit6
- 33 bytes in size
## Solution 
- The first problem I encountered at this level was not knowing which directory the password was located in. After listing the files in my home directory, I could access it using `cd ..` and then access the user `bandit7`, but I didn't have permission to view the password with that user. Since I already knew the path to the password and then accessed my user `bandit6`, I executed the following command: `find . / -type f -group bandit6 -user bandit7 -size 33c`. This gave me a series of errors, but I managed to solve it by redirecting them to the path `/dev/null/`, which gave me the password for the next level. morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj
## commands used
- ssh 
- pwd
- ls 
- find .
- find /
- cd 
- cat 
- find . / -type f -group bandit6 -user bandit7 -size 33c 
- find . / -type f -group bandit6 -user bandit7 -size 33c 2>/dev/null 
- cat /var/lib/dpkg/info/bandit7.password
