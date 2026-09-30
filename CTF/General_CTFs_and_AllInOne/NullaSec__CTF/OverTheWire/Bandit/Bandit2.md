### Bandit 2 → 3

**Level Goal:**  
The password for the next level is stored in a file called --spaces in this filename-- located in the home directory.

**Commands Used:**  
- `ls` → list directory contents
- `cat` → read the contents of a file  

**Steps:**
```bash
ls # to check the existence of the file
cat ./"--spaces in this filename--"
```
**Explanation:**

Like the previous level we can't use just `cat --spaces in this filename--` because of the same reason. But what if we try `./--spaces in this filename--`? We get `cat: ./--spaces: No such file or directory` because the file name has spaces between the characters, so the program is just reading the path `./--spaces` and ignoring the rest after that first space, which is breaking the program. So in this level we learnt that we need to use `" "` when dealing with file names with spaces present.

**Solution:**
```
MNk8KNH3Usiio41PRUEoDFPqfxLPlSmx
```

