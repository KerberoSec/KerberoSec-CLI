---
tags: [ctf, recon, active, scanning]
created: 2026-05-01
---

# 🔦 Active Reconnaissance: สแกนเป้าหมายตรงๆ

## What & Why

**Active Recon** = ส่ง packet ไปยังเป้าหมายเพื่อดู response ทำให้ได้ข้อมูลละเอียดกว่า [Passive-Recon](Passive-Recon.md) แต่ **ทิ้งร่องรอย** (log)

ใน CTF: ส่วนใหญ่ทำได้เต็มที่ ไม่ต้องห่วง stealth (เว้นแต่โจทย์มี IDS/honeypot)

---

## 1️⃣ Port Scanning ด้วย nmap

### พื้นฐานที่ต้องรู้

**TCP Three-way Handshake:**
```
Client                      Server
  ──── SYN ────────────────►
  ◄─── SYN/ACK ────────────
  ──── ACK ────────────────►
```

nmap ใช้การส่ง packet ที่ไม่ครบ handshake เพื่อดูว่า port เปิดไหม โดยไม่ต้อง connect เต็ม

### Scan Types

| Flag | ชื่อ | วิธีทำงาน | ใช้เมื่อไหร่ |
|------|------|----------|-------------|
| `-sS` | SYN scan (default ถ้ามี root) | ส่ง SYN ดู SYN/ACK | เร็ว ทิ้งร่องรอยน้อย |
| `-sT` | TCP connect | connect เต็ม | ไม่มี root |
| `-sU` | UDP scan | ส่ง UDP probe | หา DNS, SNMP, NTP |
| `-sV` | Version detect | คุย handshake แต่ละ service | จะรู้ version |
| `-sC` | Default scripts | รัน NSE script ชุด default | ดี baseline |
| `-A` | Aggressive | -sV + -sC + OS + traceroute | full info |
| `-O` | OS detect | ดู TCP/IP fingerprint | รู้ OS |
| `-Pn` | No ping | ข้าม host discovery | host block ICMP |

### คำสั่งที่ใช้บ่อยใน CTF

```bash
# Quick scan (1000 popular ports)
nmap -sV -sC target.htb

# Full scan ทุก port
nmap -p- -T4 target.htb

# Scan ทุก port + service version
nmap -p- -sV -sC -oA full target.htb

# UDP scan (ช้ามาก ทำเฉพาะ port สำคัญ)
nmap -sU --top-ports 20 target.htb

# Aggressive
nmap -A target.htb

# Specific ports
nmap -p 80,443,8080,8443 target.htb

# Save output 3 รูปแบบ (.nmap, .gnmap, .xml)
nmap -oA scan_name target.htb
```

### Timing (T0-T5)
- `-T0` paranoid: 5 นาที/probe (ใช้กับ IDS)
- `-T3` normal: default
- `-T4` aggressive: เร็ว ใช้ใน CTF
- `-T5` insane: เร็วมาก แต่อาจ miss

### NSE (Nmap Scripting Engine)
nmap มี script กว่า 600 ตัว เช็ค vulnerabilities ทั่วไป

```bash
# รันทุก script ในกลุ่ม
nmap --script vuln target.htb

# Script เฉพาะ
nmap --script smb-vuln* -p 445 target.htb
nmap --script http-enum -p 80 target.htb
nmap --script ssl-enum-ciphers -p 443 target.htb

# Script เฉพาะ HTTP
nmap --script "http-*" -p 80 target.htb
```

**Script ที่ควรรู้:**
- `vuln`: ตรวจ CVE ทั่วไป
- `auth`: bypass auth
- `default`: script พื้นฐาน
- `discovery`: หาข้อมูลเพิ่ม
- `safe`: script ที่ไม่กระทบ target

---

## 2️⃣ Web Directory/File Bruteforce

### ทำไมต้องทำ?
เว็บส่วนใหญ่ไม่ link ทุก endpoint จากหน้าหลัก: มีหน้า admin, backup, API ที่ "รู้ก็เข้าได้" (security through obscurity ที่ผิด)

### gobuster
```bash
# Directory mode
gobuster dir -u http://target.htb -w /usr/share/wordlists/dirb/common.txt

# Extensions
gobuster dir -u http://target.htb -w wordlist.txt -x php,html,txt,bak

# DNS subdomain
gobuster dns -d example.com -w subdomains.txt

# Vhost (virtual host)
gobuster vhost -u http://target.htb -w subdomains.txt
```

### ffuf ⭐ เร็วกว่า gobuster
```bash
# Directory
ffuf -u http://target.htb/FUZZ -w wordlist.txt

# Filter status code (ตัด 404)
ffuf -u http://target.htb/FUZZ -w wordlist.txt -fc 404

# Filter size
ffuf -u http://target.htb/FUZZ -w wordlist.txt -fs 1234

# Subdomain (vhost)
ffuf -u http://target.htb -H "Host: FUZZ.target.htb" -w subs.txt -fs 1234

# Parameter fuzz
ffuf -u http://target.htb/page.php?FUZZ=test -w params.txt -fs 0
```

**ทริค**: ใช้ `-fs` (filter size) ตัด response ที่เหมือนๆ กัน เช่น "Not Found page" ที่ขนาด 1234 bytes

### dirsearch
```bash
dirsearch -u http://target.htb -e php,html,js,txt,bak -w wordlist.txt
```

### Wordlists ที่ดี
- **SecLists**: github.com/danielmiessler/SecLists ⭐ ต้องมี
  - `Discovery/Web-Content/common.txt`: เริ่มต้น
  - `Discovery/Web-Content/raft-large-directories.txt`: ใหญ่
  - `Discovery/Web-Content/big.txt`: ใหญ่มาก
- **Assetnote wordlists**: wordlists.assetnote.io
- **Jhaddix all.txt**: รวม ~3M entries

---

## 3️⃣ Service-Specific Enumeration

ดูใน [Enumeration](Enumeration.md) สำหรับวิธี enum แต่ละ service ละเอียด

**Service พบบ่อยใน CTF:**
| Port | Service | Tool |
|------|---------|------|
| 21 | FTP | `ftp`, `nmap --script ftp-*` |
| 22 | SSH | banner grab, version |
| 23 | Telnet | `telnet` |
| 25 | SMTP | `smtp-user-enum`, VRFY |
| 53 | DNS | `dig`, zone transfer |
| 80, 443 | HTTP(S) | Burp, gobuster, nikto |
| 110 | POP3 | `nmap --script pop3-*` |
| 139, 445 | SMB | `enum4linux`, `smbclient` |
| 143 | IMAP | banner |
| 161 | SNMP | `snmpwalk`, `onesixtyone` |
| 389 | LDAP | `ldapsearch` |
| 1433 | MSSQL | `nmap --script ms-sql-*` |
| 3306 | MySQL | `mysql -h target` |
| 3389 | RDP | `xfreerdp`, `rdesktop` |
| 5432 | PostgreSQL | `psql` |
| 5985, 5986 | WinRM | `evil-winrm` |
| 6379 | Redis | `redis-cli` |
| 8080, 8443, 8000 | Alt HTTP | เหมือน 80/443 |
| 27017 | MongoDB | `mongo` |

---

## 4️⃣ Web Crawling / Spidering

### Burp Suite
- Right-click site → "Engagement tools" → "Discover content"
- หรือใช้ "Site map" ที่จะค่อยๆ build เอง

### katana (ProjectDiscovery) ⭐
```bash
katana -u https://target.htb -d 5  # depth 5
katana -u https://target.htb -jc   # parse JS files
```

### hakrawler
```bash
echo "https://target.htb" | hakrawler
```

---

## 5️⃣ JS Analysis

JavaScript ฝั่ง client มักมี:
- API endpoints
- API keys (เผลอ commit)
- Hidden parameters
- Logic ที่บอก attack surface

### LinkFinder
```bash
python linkfinder.py -i https://target.htb/main.js -o cli
```

### SecretFinder
หาคำว่า api_key, password, token, etc. ใน JS

### Manual
```bash
# ดึง JS ทั้งหมด
curl -s https://target.htb | grep -Eo 'src="[^"]+\.js"' | cut -d'"' -f2

# Beautify (ถ้าโดน minified)
js-beautify main.js > main.pretty.js
```

---

## 6️⃣ Vulnerability Scanners (ใช้ระวัง)

> ⚠️ ใน CTF: tool พวกนี้บางทีโดนแบน เพราะส่ง request เยอะมาก อ่าน rule ก่อน

### nikto
```bash
nikto -h http://target.htb
```

### nuclei (template-based) ⭐
```bash
nuclei -u https://target.htb -t /home/user/nuclei-templates/
```

### whatweb / wappalyzer
ระบุ tech stack:
```bash
whatweb http://target.htb
```

---

## 7️⃣ Network Mapping

### traceroute
```bash
traceroute target.htb        # UDP (default Linux)
traceroute -T target.htb     # TCP
traceroute -I target.htb     # ICMP
```

### masscan ⭐ เร็วมาก (รวดเร็วกว่า nmap หลายเท่า)
```bash
masscan -p1-65535 10.10.10.0/24 --rate=10000
```

ใช้ masscan เพื่อหา port ทั้งหมดเร็วๆ แล้วเอา nmap ตามมา deep scan port ที่เปิด

### Workflow combo
```bash
# 1. masscan หา port ทั้งหมด
masscan -p1-65535 target.htb --rate=10000 -oG masscan.txt

# 2. extract ports
ports=$(grep "Ports:" masscan.txt | awk '{print $5}' | cut -d'/' -f1 | sort -un | tr '\n' ',')

# 3. nmap deep scan
nmap -sV -sC -p $ports target.htb -oA nmap_full
```

---

## 🎯 Workflow ตัวอย่างสำหรับ Boot2Root (HTB-style)

```bash
# 1. Initial scan (เร็ว)
nmap -sV --top-ports 1000 -oA initial target.htb

# 2. Full scan (ทุก port)
nmap -p- -T4 --min-rate=1000 -oA allports target.htb

# 3. Deep scan port ที่เปิด
nmap -sV -sC -p 22,80,443 -oA deep target.htb

# 4. UDP top ports
sudo nmap -sU --top-ports 20 -oA udp target.htb

# 5. ถ้ามี HTTP: bruteforce
ffuf -u http://target.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -fc 404

# 6. ถ้ามี subdomain hint
ffuf -u http://target.htb -H "Host: FUZZ.target.htb" -w subs.txt -fs <baseline-size>

# 7. Service-specific enum (ดู Enumeration.md)
```

---

## 💡 Tips

- **เริ่มจาก scan ที่เร็วก่อน** แล้วค่อยลึกขึ้น (กฎ "narrow then deep")
- **Save ผลลัพธ์เสมอ**: `-oA` ใน nmap ช่วยให้กลับมาดูทีหลัง
- **Run scan ใน background** ตอนทำอย่างอื่น: port scan เต็มอาจกินเวลาหลายชั่วโมง
- **อย่าลืม UDP**: มี service ดีๆ อยู่ (DNS, SNMP, NTP, IKE)

---

## 🔗 ต่อไป

- หาบริการแล้วไป [Enumeration](Enumeration.md) เพื่อ enum ลึก
- เจอเว็บแล้วไป [Web](../03-Web-Exploitation/SQL-Injection.md)
- ก่อนหน้า [Passive-Recon](Passive-Recon.md)

---

#ctf #recon #active #scanning
