### Bandit 1 → 2

**Level Goal:**  
The password for the next level is stored in a file called: located in the home directory.

**Commands Used:**  
- `ls` → list directory contents
- `cat` → read the contents of a file  

**Steps:**
```bash
ls # to check the existence of the file
cat ./- 
```
**Explanation:**

Why not just use `cat -`? That's the trap here, because if we try that we get no output, since the program is trying over and over again to interpret the `-` as a flag. So we use `./-` to define to the program the path of the file (`.` means on the current directory, `~` means on the home directory and would also work).

**Solution:**
```
263JGJPfgU6LtdEvgfWU1XP5yac29mFx
```

