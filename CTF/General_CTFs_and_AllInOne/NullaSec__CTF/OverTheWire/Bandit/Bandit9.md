### Bandit 9 → 10

**Level Goal:**  

The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.

**Commands Used:**  
- `ls` → list directory contents
- `grep` → print lines that match patterns
- `strings` → print the sequences of printable characters in files

**Steps:**
```bash
ls # to check the existence of the file
strings data.txt | grep "==="
```
**Explanation:**

If you've done the previous problems this one might start to be easier, by reading the contents of the Level Goal it's clear we're dealing with file content filtering, so `grep` is our partner in this case.

But a very important step before that is to filter only the human readable strings, since this file is a mess of all kinds of characters. For that we use `strings` to return all the readable strings and then we apply `grep` to the output (with a pipe) using "===" as filter since the Level Goal gives us that hint.

The command `strings data.txt | grep "==="` should return:
```
========== the
========== password
Q========== is%
>u`9J========== FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey
```

**Solution:**
```
FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey
```

