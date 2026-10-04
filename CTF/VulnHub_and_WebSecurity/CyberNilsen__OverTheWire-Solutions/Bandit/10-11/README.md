# 🔁 Bandit Level 10 → Level 11

Goal:

The password for the next level is stored in the file data.txt, which contains base64 encoded data

Here we can run `cat data.txt` and use `grep "=="` to filter out the base64-encoded line,  
since base64 strings often end with `==` padding.

```
bandit10@bandit:~$ ls
data.txt
bandit10@bandit:~$ cat data.txt | grep "=="
VGhlIHBhc3N3b3JkIGlzIGR0UjE3M2ZaS2IwUlJzREZTR3NnMlJXbnBOVmozcVJyCg==
bandit10@bandit:~$
```

Here we see our potential password line.  
Then we decode it using this command:

```
bandit10@bandit:~$ cat data.txt | grep "==" | base64 -d
```

And we find the correct password:

```
The password is dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr
bandit10@bandit:~$
```
