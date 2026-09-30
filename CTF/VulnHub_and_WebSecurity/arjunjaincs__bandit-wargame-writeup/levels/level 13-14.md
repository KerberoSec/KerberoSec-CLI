# 🧭 Bandit Level 13 → 14

## 🎯 Level Goal
> The password for the next level is stored in **/etc/bandit_pass/bandit14 and can only be read by user bandit14**. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level. **Note:** **localhost** is a hostname that refers to the machine you are working on

---
## 📂 Key Commands Used

```
ssh -i sshkey.private bandit14@bandit.labs.overthewire.org -p 2220
```

---
## 🧠 Takeaways

- We can use a private sshkey to login into localhost. Did not knew that so I spent countless hours trying to figure out this.

---
## 🔐 Password for Level 14
``
```
MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS
```

---