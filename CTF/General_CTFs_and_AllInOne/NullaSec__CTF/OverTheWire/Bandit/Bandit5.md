### Bandit 5 → 6

**Level Goal:**  
The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:

- human-readable
- 1033 bytes in size
- not executable

**Commands Used:**  
- `ls` → list directory contents
- `cd` → change to a different directory
- `find` → search for files by conditions
- `cat` → read the contents of a file  

**Steps:**
```bash
ls # to check the existence of the folder
cd inhere
find . -type f -size 1033c ! -executable
cat ./inhere/maybehere07/.file2
```
**Explanation:**

We are again directed to the `inhere` directory, where we can find using `ls` that there are 20 subdirectories waiting for us. We could try to open each one of them and look at each file, but what if we could be more efficient? So let's learn how to use `find` to find a file given specific filters.

The path is `.`, which means the current directory we're on. The `-type` is a file, since that's what the problem gave us. The `-size` is 1033c and it's important to put the "c" (characters) since this defines the 1033 as being bytes. Finally with `! -executable` we define that executable files aren't wanted, thus remaining only human-readable ones.

The final command is: `find . -type f -size 1033c ! -executable` which returns `./inhere/maybehere07/.file2`

If we do `cat` on that path we'll get our password.

**Solution:**
```
HWasnPhtq9AVKe0dmk45nxy20cvUa6EG
```

