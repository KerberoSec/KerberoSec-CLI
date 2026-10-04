# OVERTHEWIRE GAMES: BANDIT

### ssh bandit0@bandit.labs.overthewire.org -p 2220 (bandit0)
```
HINT: The password for the next level is stored in a file called readme located in the home directory. 

cat readme
Output: NH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL
```

### ssh bandit1@bandit.labs.overthewire.org -p 2220 (NH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL)
```
HINT: The password for the next level is stored in a file called - located in the home directory

bandit1@bandit:~$ cat ./-
rRGizSaX8Mk1RTb1CNQoXTcYZWU6lgzi
```

### ssh bandit2@bandit.labs.overthewire.org -p 2220 (rRGizSaX8Mk1RTb1CNQoXTcYZWU6lgzi)
```
HINT: The password for the next level is stored in a file called spaces in this filename located in the home directory

bandit2@bandit:~$ ls
spaces in this filename
bandit2@bandit:~$ cat *
aBZ0W5EmUfAf7kHTQeOwd8bauFJ2lAiG
```

### ssh bandit3@bandit.labs.overthewire.org -p 2220 (aBZ0W5EmUfAf7kHTQeOwd8bauFJ2lAiG)
```
HINT: The password for the next level is stored in a hidden file in the inhere directory.

bandit3@bandit:~$ ls
inhere
bandit3@bandit:~$ cd inhere/
bandit3@bandit:~/inhere$ ls -la
total 12 \
drwxr-xr-x 2 root    root    4096 Sep  1 06:30 .
drwxr-xr-x 3 root    root    4096 Sep  1 06:30 ..
-rw-r----- 1 bandit4 bandit3   33 Sep  1 06:30 .hidden
bandit3@bandit:~/inhere$ cat .hidden
2EW7BBsr6aMMoJ2HjW067dm8EgX26xNe
```

### ssh bandit4@bandit.labs.overthewire.org -p 2220 (2EW7BBsr6aMMoJ2HjW067dm8EgX26xNe)
```
HINT: The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.

bandit4@bandit:~/inhere$ ls
-file00  -file01  -file02  -file03  -file04  -file05  -file06  -file07  -file08  -file09
bandit4@bandit:~/inhere$ cat -- -file07
lrIWWI6bB37kxfiCQZqUdOIYfr6eEeqR
```

### ssh bandit5@bandit.labs.overthewire.org -p 2220 (lrIWWI6bB37kxfiCQZqUdOIYfr6eEeqR)
```
HINT: The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:
    human-readable
    1033 bytes in size
    not executable

bandit5@bandit:~/inhere$ ls -la * | grep 1033
-rw-r-----  1 root bandit5 1033 Sep  1 06:30 .file2
Directori 07 - amb awk
P4L4vucdmLnm8I7Vl7jG1ApGSfjYKqJU 
```

### ssh bandit6@bandit.labs.overthewire.org -p 2220 (P4L4vucdmLnm8I7Vl7jG1ApGSfjYKqJU)
```
HINT: The password for the next level is stored somewhere on the server and has all of the following properties:
    owned by user bandit7
    owned by group bandit6
    33 bytes in size

bandit6@bandit:/$ ls -lisa * */* | grep bandit7 | grep bandit6
76678  12 -rw-------  1 bandit6  bandit6   12288 Sep  7 05:00 bandit7.password.swp
find / -name bandit7.password.swp
cat /var/tmp/bandit7.password.swp
z7WtoNQU2XfjmMtWA8u5rN4vzqu4v99S
```

### ssh bandit7@bandit.labs.overthewire.org -p 2220 (z7WtoNQU2XfjmMtWA8u5rN4vzqu4v99S)
```
HINT: The password for the next level is stored in the file data.txt next to the word millionth

bandit7@bandit:~$ cat data.txt | grep millionth
millionth	TESKZC0XvTetK0S9xNwm25STk5iWrBvP 
```

### ssh bandit8@bandit.labs.overthewire.org -p 2220 (TESKZC0XvTetK0S9xNwm25STk5iWrBvP)
```
HINT: The password for the next level is stored in the file data.txt and is the only line of text that occurs only once

bandit8@bandit:~$ cat data.txt | sort | uniq -u
EN632PlfYiZbn3PhVK3XOGSlNInNE00t
```

### ssh bandit9@bandit.labs.overthewire.org -p 2220 (EN632PlfYiZbn3PhVK3XOGSlNInNE00t)
```
HINT: The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.

bandit9@bandit:~$ strings data.txt | grep =
========== G7w8LIi6J3kTb8A7j9LgrywtEUlyyp6s
```

### ssh bandit10@bandit.labs.overthewire.org -p 2220 (G7w8LIi6J3kTb8A7j9LgrywtEUlyyp6s)
```
HINT: The password for the next level is stored in the file data.txt, which contains base64 encoded data

bandit10@bandit:~$ base64 -d data.txt
The password is 6zPeziLdR2RKNdNYFNb6nVCKzphlXHBM
```

### ssh bandit11@bandit.labs.overthewire.org -p 2220 (6zPeziLdR2RKNdNYFNb6nVCKzphlXHBM)
```
HINT: The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions

bandit11@bandit:~$ cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
The password is JVNBBFSmZwKKOP0XbFXOoW8chDz5yVRv
```

### ssh bandit12@bandit.labs.overthewire.org -p 2220 (JVNBBFSmZwKKOP0XbFXOoW8chDz5yVRv)
```

```