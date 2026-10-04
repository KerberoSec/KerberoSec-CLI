# 🧭 Bandit Level 18 → 19

## 🎯 Level Goal
> The password for the next level is stored in a file **readme** in the homedirectory. Unfortunately, someone has modified **.bashrc** to log you out when you log in with SSH.

---
## 📂 Key Commands Used

```
ssh bandit18@bandit.labs.overthewire.org -p 2220 ls
ssh bandit18@bandit.labs.overthewire.org -p 2220 cat readme
```

---
## 🧠 Takeaways

- So we first run `ls` to list the files in home directory
- Then command logs in **just to run `cat readme`** and exits, skipping the interactive shell and `.bashrc`.

---
## 🔐 Password for Level 19
``
```
cGWpMaKXVwDUNgPAVJbWYuGHVn9zl3j8
```

---