# Linux 0x5

**Category:** Basics Questions

**Author:** Pran0x

---

### Question:
What does `find / -perm -4000 2>/dev/null` search for?

A) Files owned by root  
B) World-writable files  
C) SUID binaries  
D) Hidden directories  

**Enter the Ans only (i.e. A):** 

---

### Answer: C

---

### Explanation:

The command `find / -perm -4000 2>/dev/null` searches the entire filesystem (`/`) for files with the **SUID (Set User ID)** permission bit set.

- The permission `4000` refers to the SUID bit.  
- Files with SUID set run with the privileges of the file owner, often root, which can be a security risk if misused.  
- `2>/dev/null` suppresses error messages (e.g., permission denied).  
- Finding SUID binaries helps in privilege escalation during penetration testing.
