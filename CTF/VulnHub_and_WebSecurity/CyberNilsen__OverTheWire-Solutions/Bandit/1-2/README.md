# 🔁 Bandit Level 1 → Level 2

First I read the goal, and saw this:

The password for the next level is stored in a file called: located in the home directory

This tells me that the file is literally named `-`. So I ran `ls` to confirm:

```
bandit1@bandit:~$ ls
-
```

Then I tried to read it using `cat -`, but that didn’t work:

```
bandit1@bandit:~$ cat -
^C
```

This is because `cat -` is interpreted as reading from **standard input**, not a file named `-`. To fix this, I used `cat ./-`, which tells the shell to read the file named `-` in the current directory:

```
bandit1@bandit:~$ cat ./-
263JGJPfgU6LtdEvgfWU1XP5yac29mFx
```

✅ After running the command above, I got the password for the next level! 😄
