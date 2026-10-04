# 🔁 Bandit Level 7 → Level 8

Goal:

The password for the next level is stored in the file data.txt next to the word millionth

Here we can use `grep` to find the line containing the word. But first, I mistakenly tried using `grep` alone, which didn’t work as expected.  
We need to read the file contents using `cat` and then pipe it to `grep` to search for the word "millionth", since the password is located next to it.

```
bandit7@bandit:~$ cat data.txt | grep "millionth"
millionth       dfwvzFQi4mU0wfNbFOe9RoWskMLg7eEc
bandit7@bandit:~$
```

Doing what I wrote above resulted in us gaining the correct password.
