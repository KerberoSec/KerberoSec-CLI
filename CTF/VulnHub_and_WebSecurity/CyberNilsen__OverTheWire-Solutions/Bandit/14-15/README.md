# 📡 Bandit Level 14 → Level 15

## 🎯 Goal

The password for the next level can be retrieved by submitting the password of the current level to port 30000 on localhost.

---

## 🧪 Steps Taken

1. **Initial confusion**  
   I first thought the challenge was about logging into port 30000 via SSH instead of the usual port 2220:

   ```bash
   ssh bandit15@localhost -p 30000
   ```

   But this didn’t work: the server expects something else.

2. **Re-evaluating the goal**  
   The goal mentions "submitting the password" to port 30000. That sounds like a job for `nc` (Netcat), which can send data to a port.

3. **Tried using the wrong password**  
   I mistakenly used the password from Level 13:

   ```bash
   echo FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn | nc localhost 30000
   ```

   Result:

   ```
   Wrong! Please enter the correct current password.
   ```

4. **Realized the correct password is for the current user**  
   Since I’m logged in as `bandit14`, I should be submitting **bandit14’s password**. I found it by running:

   ```bash
   cat /etc/bandit_pass/bandit14
   ```

   Output:

   ```
   MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS
   ```

5. **Submit the correct password using Netcat**

   ```bash
   echo MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS | nc localhost 30000
   ```

   Result:

   ```
   Correct!
   8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
   ```

✅ That’s the password for **Bandit Level 15**.

