# 🔁 Bandit Level 5 → Level 6

Goal:

The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:

- human-readable
- 1033 bytes in size
- not executable

From the last level, we know we have to do something similar, but this time using multiple arguments with the `find` command.

`ls.png`  
Here we can see that there are lots of directories, and inside one of those directories there are lots of files:

```
bandit5@bandit:~/inhere/maybehere00$ ls
-file1  -file2  -file3  spaces file1  spaces file2  spaces file3
bandit5@bandit:~/inhere/maybehere00$
```

To find the correct file, we run this command:

```
find . -type f ! -executable -size 1033c -readable
```

Explanation:
- `.` → search in the current directory
- `-type f` → look for files
- `! -executable` → exclude executable files
- `-size 1033c` → match files that are exactly 1033 bytes
- `-readable` → only include readable files

Once we run that command, we find the correct file and use `cat` to read it:

`find.png`  
Here we can see the content and confirm that what we did worked:

```
bandit5@bandit:~/inhere$ cat ./maybehere07/.file2
HWasnPhtq9AVKe0dmk45nxy20cvUa6EG
```
