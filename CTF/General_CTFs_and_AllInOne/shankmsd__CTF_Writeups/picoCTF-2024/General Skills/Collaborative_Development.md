## Challenge 🧩

My team has been working very hard on new features for our flag printing program! I wonder how they'll work together?

Author: JEFFERY JOHN</br>
Points: 75

Hints:

1. `git branch -a` will let you see available branches
2. How can file 'diffs' be brought to the main branch? Don't forget to `git config`!
3. Merge conflicts can be tricky! Try a text editor like nano, emacs, or vim.

## Solution 🕵️‍♂️

```bash
┌──(user㉿shell)-[~]
└─$ ./extractor.sh drop-in collabDev
```

The flag is spread across 4 commits, flag is in python file

```py
# init flag printer
print("Printing the flag...")
```

```py
# add part 1
print("Printing the flag...")
print("picoCTF{t3@mw0rk_", end='')
```

```py
# add part 2
print("Printing the flag...")
print("m@k3s_th3_dr3@m_", end='')
```

```py
# add part 3
print("Printing the flag...")
print("w0rk_xxxxxxxx}")
```

Tool Used: </br>
[GitTools Extractor](https://github.com/internetwache/GitTools/tree/master/Extractor)

## Flag 🚩

`picoCTF{t3@mw0rk_m@k3s_th3_dr3@m_w0rk_xxxxxxxx}`
