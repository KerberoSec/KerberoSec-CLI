# level 6

```
ssh bandit6@bandit.labs.overthewire.org -p 2220
```

### The password for the next level is stored somewhere on the server and has all of the following properties:

- owned by user bandit7
- owned by group bandit6
- 33 bytes in size

```bash
find / -type f -user bandit7 -group bandit6 -size 33c
## better
find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null
```

### Explanation of each part:

- `/` → role in the entire server

- `-type f` → files only

- `-user bandit7` → owner bandit7

- `-group bandit6` → group bandit6

- `-size 33c` → Size 33 bytes

- `2>/dev/null` → hides Permission denied errors

<img width="927" height="451" alt="image" src="https://github.com/user-attachments/assets/6dbcf07a-c18f-441f-b14d-1a87af47f06e" />

```
morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj
```

