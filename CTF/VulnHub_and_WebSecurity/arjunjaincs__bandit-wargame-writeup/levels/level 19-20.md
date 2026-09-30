# 🧭 Bandit Level 19 → 20

## 🎯 Level Goal
> To gain access to the next level, you should use the setuid binary in the homedirectory. Execute it without arguments to find out how to use it. The password for this level can be found in the usual place (/etc/bandit_pass), after you have used the setuid binary.

---
## 📂 Key Commands Used

```
ls -l
./bandit20-do cat /etc/bandit_pass/bandit20
```

---
## 🧠 Takeaways

- Ran `ls -l` to see permissions, ownership, and special bits.
- A **setuid** binary is a program that runs with the privileges of its owner, not the user who runs it.
- So I just ran `cat` and printed the bandit20 file using the executable.

---
## 🔐 Password for Level 20
``
```
0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO
```

---