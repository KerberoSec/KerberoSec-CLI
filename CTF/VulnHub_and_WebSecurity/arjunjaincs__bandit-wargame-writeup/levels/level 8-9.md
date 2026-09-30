# 🧭 Bandit Level 8 → 9

## 🎯 Level Goal
> The password for the next level is stored in the file **data.txt** and is the only line of text that occurs only once

---
## 📂 Key Commands Used

```
sort data.txt | uniq -u
```

---
## 🧠 Takeaways

- We first sorted the file alphabetically and then found the unique one using `uniq`
- Alternatively, I also did `sort data.txt | uniq -c` which worked in this scenario since the amount of text wasn't too much so after sorting it, I just printed count of each line and found the unique one.

---
## 🔐 Password for Level 9
``
```
4CKMh1JI91bUIZZPXDqGanal4xvAg0JM
```

---