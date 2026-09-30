# Linux 0x2

**Category:** Basics Questions

**Author:** Pran0x

---

### Question:
Which file contains user account information in Linux?

A) /etc/shadow  
B) /etc/passwd  
C) /var/log/auth.log  
D) /home/user/.bashrc  

**Enter the Ans only (i.e. A):** 

---

### Answer: B

---
### Explanation:

In Linux, the file `/etc/passwd` contains essential information about user accounts. It stores user names, user IDs (UID), group IDs (GID), home directories, and login shells.

- Although `/etc/shadow` holds password hashes and related security information, it does not contain general user account details.  
- `/var/log/auth.log` is a log file for authentication-related messages.  
- `/home/user/.bashrc` is a shell script run when a user opens a new terminal session.

The `/etc/passwd` file is world-readable to allow many programs to get user info without needing elevated permissions, but sensitive password info is kept separately in `/etc/shadow`.
 

