# 🔁 Bandit Level 3 → Level 4

Reading the goal:

The password for the next level is stored in a hidden file in the inhere directory.

I know that to find hidden files, I have to use `ls -a` instead of just `ls`, because hidden files (those starting with a dot `.`) are not shown by default.

`inhere.png`  
Here we can see that we have to use `ls -a`: using plain `ls` won't reveal the hidden file, which makes sense.

`hiddenfile.png`  
After running `ls -a`, we see the hidden file. Then I used `cat` to read it and get the password:

```
bandit3@bandit:~/inhere$ cat .hidden
2WmrDFRmJIq3IPxneAaMGhap0pFhF3NJ
bandit3@bandit:~/inhere$
```
