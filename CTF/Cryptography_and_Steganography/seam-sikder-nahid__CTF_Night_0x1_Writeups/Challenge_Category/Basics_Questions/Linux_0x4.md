
# Linux 0x4

**Category:** Basics Questions

**Author:** Pran0x

---

### Question:
Which command helps identify kernel version for potential privilege escalation?

A) hostname  
B) uname -a  
C) whoami  
D) lsmod  

**Enter the Ans only (i.e. A):** 

---

### Answer: B

---

### Explanation:

The `uname -a` command prints detailed system information including the kernel version, which is essential for identifying vulnerabilities related to privilege escalation.

- `hostname` shows the system’s network name, not kernel info.  
- `whoami` displays the current username.  
- `lsmod` lists loaded kernel modules but does not show kernel version.

Knowing the exact kernel version helps attackers or security researchers find known exploits to escalate privileges.
