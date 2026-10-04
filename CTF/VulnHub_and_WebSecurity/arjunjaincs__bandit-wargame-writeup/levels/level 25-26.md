2# 🧭 Bandit Level 25 → 26

## 🎯 Level Goal
> Logging in to bandit26 from bandit25 should be fairly easy… The shell for user bandit26 is not **/bin/bash**, but something else. Find out what it is, how it works and how to break out of it.

---
## 📂 Key Commands Used

```
ssh -oHostKeyAlgorithms=+ssh-dss -i bandit26.sshkey bandit26@localhost -p 2220
```

---
## 🧠 Takeaways

- This was a fun level, had to Google a lot but finally made it in.
- Basically I used a vulnerability in `more` which was executed to show us a text when we login to ssh of bandit26.
- After I got the shell access, I used `vim` text editor inside the shell and changed the path from that text to /bin/bash and got access to bandit26.

---
## 🔐 Password for Level 26
``
```

```

---