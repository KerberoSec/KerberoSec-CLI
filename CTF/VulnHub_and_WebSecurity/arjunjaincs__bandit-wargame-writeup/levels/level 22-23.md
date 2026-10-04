# 🧭 Bandit Level 22 → 23

## 🎯 Level Goal
> A program is running automatically at regular intervals from **cron**, the time-based job scheduler. Look in **/etc/cron.d/** for the configuration and see what command is being executed.

---
## 📂 Key Commands Used

```
echo I am user bandit23 | md5sum
cat /tmp/8ca319486bfbbc3663ea0fbe81326349
```

---
## 🧠 Takeaways

- Did not knew that md5sum was a hashing technique otherwise this would have been quicker.
- First read the cron files and went to last file which said that the password was in temp, and the temp filename was made using md5sum hash of `bandit23`
- So found the hash, opened the file in tmp folder and found the password.

---
## 🔐 Password for Level 23
``
```
0Zf11ioIjMVN551jX3CmStKLYqjk54Ga
```

---