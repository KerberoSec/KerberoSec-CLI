# level 5

```
ssh bandit5@bandit.labs.overthewire.org -p 2220
```

#### he password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:

- human-readable
- 1033 bytes in size
- not executable

```
find . -type f -size 1033c ! -executable
```

<img width="1208" height="183" alt="image" src="https://github.com/user-attachments/assets/326a9777-02a3-46c8-8d45-cabd1979cd30" />

> ## another way

```
find . -type f -size 1033c ! -executable -exec file {} \; | grep ASCII
```

<img width="916" height="65" alt="image" src="https://github.com/user-attachments/assets/3b8f9343-345d-430f-8279-bcb350d71f3a" />

```
HWasnPhtq9AVKe0dmk45nxy20cvUa6EG
```

