# 🧭 Bandit Level 5 → 6

## 🎯 Level Goal
> The password for the next level is stored in a file somewhere under the **inhere** directory and has all of the following properties:

- human-readable
- 1033 bytes in size
- not executable

---
## 📂 Key Commands Used

```
find -size 1033c
```

---
## 🧠 Takeaways

- We can use criteria in `find` to find a desired file.

Optionally, we can do -
```
find . -type f -size 1033c ! -executable -exec file {} \; | grep 'ASCII text'
```

find . -type f → search for files
-size 1033c → file size = 1033 bytes
! -executable → file is not executable
-exec file {} \; → check file type
| grep 'ASCII text → confirm it's human-readable

---
## 🔐 Password for Level 6
``
```
HWasnPhtq9AVKe0dmk45nxy20cvUa6EG
```

---