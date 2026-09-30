# 🔐 Bandit Level 15 → Level 16

## 🎯 Goal

The password for the next level can be retrieved by submitting the password of the current level to port 30001 on localhost using SSL/TLS encryption.

Helpful note: Getting “DONE”, “RENEGOTIATING” or “KEYUPDATE”? Read the “CONNECTED COMMANDS” section in the manpage.

---

## 🧪 Steps Taken

1. **Understand the challenge**  
   The goal mentions SSL/TLS encryption, so we need a tool that supports secure connections. `ncat` (Netcat with SSL support) is perfect for this.

2. **Research how to use SSL with Netcat**  
   I found the correct syntax from the official Ncat guide:  
   [https://nmap.org/ncat/guide/ncat-ssl.html](https://nmap.org/ncat/guide/ncat-ssl.html)

3. **Find the current password**  
   I retrieved the password for `bandit15` from the usual location:

   ```bash
   cat /etc/bandit_pass/bandit15
   ```

   Output:

   ```
   8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
   ```

4. **Submit the password using SSL**

   ```bash
   echo 8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo | ncat --ssl localhost 30001
   ```

   Output:

   ```
   Correct!
   kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
   ```

✅ That’s the password for **Bandit Level 16**.
