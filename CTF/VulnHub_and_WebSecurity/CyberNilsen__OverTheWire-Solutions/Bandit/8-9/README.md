# 🔁 Bandit Level 8 → Level 9

Goal:

The password for the next level is stored in the file data.txt and is the only line of text that occurs only once

Knowing that it's a line that's unique, we know to use the `uniq` command.  
We don't need to use `grep` here. Instead, we first sort the file and then run `uniq -u` to find the line that occurs only once.

```
bandit8@bandit:~$ sort data.txt | uniq -u
4CKMh1JI91bUIZZPXDqGanal4xvAg0JM
bandit8@bandit:~$
```

This results in us finding the correct line and password.
