# Linux 0x3 

**Category:** Basics Questions

**Author:** Pran0x

---

### Question:
What does the sudo command do?

A) Switches user  
B) Runs a command as root  
C) Starts a service  
D) Opens a new terminal  

**Enter the Ans only (i.e. A):** 

---

### Answer: B

---
### Explanation:

The `sudo` command allows a permitted user to execute a command as the superuser (root) or another user, as specified by the security policy.

- Most commonly, `sudo` is used to run commands with root privileges temporarily without logging in as the root user.  
- For example, `sudo apt update` runs the `apt update` command as root to update package lists.  
- Unlike `su` which switches the user shell, `sudo` runs a single command with elevated privileges.
