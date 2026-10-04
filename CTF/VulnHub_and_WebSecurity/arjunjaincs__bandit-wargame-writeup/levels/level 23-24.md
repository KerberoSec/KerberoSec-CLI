# 🧭 Bandit Level 23 → 24

## 🎯 Level Goal
> A program is running automatically at regular intervals from **cron**, the time-based job scheduler. Look in **/etc/cron.d/** for the configuration and see what command is being executed.

---
## 📂 Key Commands Used

```
chmod +x hack.sh
```

---
## 🧠 Takeaways

- First I found out that the script was running all bash files inside the folder, so I made my own script that copied the password and sent it to tmp folder.
- The script was easy, then used `chmod` to convert it to runnable and BOOM that was it, interesting but decently hard.

---
## 🔐 Password for Level 24
``
```
gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8
```

---