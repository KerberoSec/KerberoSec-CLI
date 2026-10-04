# 🔁 Bandit Level 4 → Level 5

Goal

The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.

Here I know I have to use the `file` command to find the only human-readable file, but I didn’t remember the exact syntax, so I had to use Google to figure it out.

After researching a bit, I found out the command was:

```
file ./*
```

This shows all the files and what type of data they contain.

`humanreadable.png`  
Now that we know which file is human-readable, we can `cat` that file:

```
bandit4@bandit:~/inhere$ cat ./-file07
4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw
bandit4@bandit:~/inhere$
```

Trying all the files manually is possible of course, but tiring and unnecessary.  
Here’s an example of a file that is **not** human-readable:

```
bandit4@bandit:~/inhere$ cat ./-file00
�6);/:ˋd�Jhp␦r��}�k'���vjbandit4@bandit:~/inhere$
```
