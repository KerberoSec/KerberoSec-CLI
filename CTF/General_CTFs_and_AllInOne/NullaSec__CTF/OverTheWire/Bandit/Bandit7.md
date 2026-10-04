### Bandit 7 → 8

**Level Goal:**  
The password for the next level is stored in the file data.txt next to the word millionth

**Commands Used:**  
- `ls` → list directory contents
- `grep` → print lines that match patterns
- `cat` → read the contents of a file  

**Steps:**
```bash
ls # to check the existence of the file
cat data.txt | grep "millionth"
```
**Explanation:**

This one is very simple but has a lot of new information packed. In the previous problems the solution was reached using the `find` command, but we were looking for files with unique characteristics. Now we need to look for a specific content inside a file and for that we're going to use a new command called `grep`. 

We're also going to use a pipe, which is represented by `|` so that the `grep` order is applied to the output of the `cat data.txt`.

The final command `cat data.txt | grep "millionth"` gives us:

```
millionth       dfwvzFQi4mU0wfNbFOe9RoWskMLg7eEc
```
Since we know the password is next to the word millionth we have solved this problem.

**Solution:**
```
dfwvzFQi4mU0wfNbFOe9RoWskMLg7eEc
```

