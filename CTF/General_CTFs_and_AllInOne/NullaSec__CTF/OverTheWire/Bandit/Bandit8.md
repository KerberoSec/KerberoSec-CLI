### Bandit 8 → 9

**Level Goal:**  

The password for the next level is stored in the file data.txt and is the only line of text that occurs only once.

**Commands Used:**  
- `ls` → list directory contents
- `sort` → sort lines of text files
- `uniq` → report or omit unique lines

**Steps:**
```bash
ls # to check the existence of the file
sort data.txt | uniq -u
```
**Explanation:**

We're again working with pipes, this time to apply the `uniq` command (which gives us the unique lines on a file when using the `-u` flag) to the output of the sorted file. It's important to sort the file because that's the only way of making `uniq` return the unique lines, doing only the latter command would give a wrong output.

**Solution:**
```
4CKMh1JI91bUIZZPXDqGanal4xvAg0JM
```

