# 🔁 Bandit Level 9 → Level 10

Goal:

The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.

If we run the command `strings`, we can extract all human-readable strings from the binary file. This reveals the password among other readable content. The command to use is:

```
strings data.txt
```

`password.png`  
To narrow it down and avoid guessing, we can search for lines that contain the word "password":

```
strings data.txt | grep "password"
```

This shows us the context and how many `=` signs are used. From there, we run a more specific command to find the exact line with the password:

```
strings data.txt | grep "=========="
```

`realpassword.png`  
Output:

```
bandit9@bandit:~$ strings data.txt | grep "=========="
========== the
========== password
E========== is
5========== FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey
bandit9@bandit:~$
```

The last line contains the actual password:  
`FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey`
