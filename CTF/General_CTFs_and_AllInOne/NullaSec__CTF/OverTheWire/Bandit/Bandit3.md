### Bandit 3 → 4

**Level Goal:**  
The password for the next level is stored in a hidden file in the inhere directory.

**Commands Used:**  
- `ls` → list directory contents
- `cd` → change to a different directory
- `cat` → read the contents of a file  

**Steps:**
```bash
ls # to check the existence of the folder
cd inhere
ls -a
cat ./...Hiding-From-You
```
**Explanation:**

After changing to the directory `inhere` we instinctively run `ls` to list the files, but this time the output is empty. The Level Goal tells us there's a hidden file, so we have to put the flag `-a`  on the command to reveal all files. Doing `ls -a` inside the folder returns:

```.  ..  ...Hiding-From-You```

Where:
- `.` is the current directory
- `..` is the parent directory
- `...Hiding-From-You` is obviously the hidden file

Note: Hidden files always have a `.` at the beginning of the file name.

Now we run a simple `cat ./...Hiding-From-You` to open the file, it is mandatory to specify the path since it's hidden.

**Solution:**
```
2WmrDFRmJIq3IPxneAaMGhap0pFhF3NJ
```

