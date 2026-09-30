# 🧭 Bandit Level 20 → 21

## 🎯 Level Goal
> There is a setuid binary in the homedirectory that does the following: it makes a connection to localhost on the port you specify as a commandline argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit20). If the password is correct, it will transmit the password for the next level (bandit21).

---
## 📂 Key Commands Used

```
ncat -lvnp 3290
```

---
## 🧠 Takeaways

- This was a fun one, I first opened a server on the port `3290` and then logged into the ssh using a different portal.
- Then used executable to connect with the port, went back to the local server, sent in my last password and in return received the password for next level.

---
## 🔐 Password for Level 21
``
```
EeoULMCra2q0dSkYj561DX7s1CpBuOBt
```

---