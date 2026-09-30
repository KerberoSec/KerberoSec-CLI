### Bandit 4 → 5

**Level Goal:**  
The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.

**Commands Used:**  
- `ls` → list directory contents
- `cd` → change to a different directory
- `file` → determine file type
- `cat` → read the contents of a file  

**Steps:**
```bash
ls # to check the existence of the folder
cd inhere
file ./*
cat ./-file07
```
**Explanation:**

Inside of `inhere` we can see (using `ls` for example) there are 10 files, but let's try to open the first one:
```
cat ./-file0

\�G�I�d�� �`"��g���     '�����▒
```
This is clearly not human-readable. To find the one that is, we can take 2 paths: open every file until one of them is readable or use `file` to check every file type at the same time and open the one that's readable, we're going for the second option. To use the command we need to specify a file or a directory, so in this case to specify every file inside the directory we're currently located in we do:

```bash
file ./*

./-file00: data
./-file01: data
./-file02: data
./-file03: data
./-file04: data
./-file05: data
./-file06: data
./-file07: ASCII text
./-file08: data
./-file09: data
```

Nice! File 07 is ASCII Text so it should be more readable than it's siblings. We open it with `cat ./-file07` and there's our flag.

**Solution:**
```
4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw
```

