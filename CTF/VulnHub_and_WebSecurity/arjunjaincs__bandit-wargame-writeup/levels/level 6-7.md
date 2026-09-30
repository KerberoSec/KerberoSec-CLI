# 🧭 Bandit Level 6 → 7

## 🎯 Level Goal
> The password for the next level is stored **somewhere on the server** and has all of the following properties:

- owned by user bandit7
- owned by group bandit6
- 33 bytes in size

---
## 📂 Key Commands Used

```
find / -user bandit7 -group bandit6 -size 33c
cat /var/lib/dpkg/info/bandit7.password
```

---
## 🧠 Takeaways

- **Used `-size 33c`** to find files **exactly 33 bytes** (1 byte = 1 character)
- c = bytes and b = 512-byte-blocks
- `-user <username>` matches files owned by a specific **user**
- `-group <groupname>` matches files owned by a specific **group** 
- Always run `find` from **root `/`** if you're not sure where the file is
- Use `cat <filepath>` to print file contents once found
- Avoid limiting `find` to just `/home` or current dir unless you’re sure
- These filters simulate **real-world privilege escalation / forensic tasks**

---
## 🔐 Password for Level 7
``
```
morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj
```

---