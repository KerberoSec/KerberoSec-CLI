# level 10 

```
ssh bandit10@bandit.labs.overthewire.org -p 2220
```

> ### The password for the next level is stored in the file data.txt, which contains base64 encoded data

```bash
cat data.txt
cat data.txt | base64 -d
```

<img width="782" height="161" alt="image" src="https://github.com/user-attachments/assets/b2de869e-0734-4c6b-bd8c-1986d5f7cfda" />

```
dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr
```

