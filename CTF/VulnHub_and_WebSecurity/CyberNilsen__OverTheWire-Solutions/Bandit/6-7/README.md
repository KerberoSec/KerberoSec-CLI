# 🔁 Bandit Level 6 → Level 7

Goal:

The password for the next level is stored somewhere on the server and has all of the following properties:

- owned by user bandit7
- owned by group bandit6
- 33 bytes in size

When trying the `find` command, we realize it doesn’t return anything because we don’t know the exact location of the file. But we can still try running it in the current directory:

```
find . -type f -user bandit7 -group bandit6 -size 33c
```

This gives us nothing.

Unsure what to do next, I tried this command instead:

```
find / -type f -group bandit6 -user bandit7 -size 33c
```

This searches the entire system. It gives us results, but also a lot of clutter: many permission errors and unreadable directories.

`errors.png`  
To suppress or ignore those errors, I added this to the end of the command:

```
2>/dev/null
```

This hides the error output and lets us focus on the actual results:

```
find / -type f -group bandit6 -user bandit7 -size 33c 2>/dev/null
```

`password.png`  
This reveals the correct file path. Then we can `cat` the file to get the password:

```
bandit6@bandit:~$ cat /var/lib/dpkg/info/bandit7.password
morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj
```
