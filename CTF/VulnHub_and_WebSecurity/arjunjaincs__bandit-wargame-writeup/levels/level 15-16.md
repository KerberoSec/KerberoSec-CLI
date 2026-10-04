# 🧭 Bandit Level 15 → 16

## 🎯 Level Goal
> The password for the next level can be retrieved by submitting the password of the current level to **port 30001 on localhost** using SSL/TLS encryption.
> 
  **Helpful note: Getting “DONE”, “RENEGOTIATING” or “KEYUPDATE”? Read the “CONNECTED COMMANDS” section in the manpage.**

---
## 📂 Key Commands Used

```
openssl s_client -connect localhost:30001
```

---
## 🧠 Takeaways

- `openssl s_client` is used to make an encrypted connection to the port.

---
## 🔐 Password for Level 16
``
```
kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
```

---