---
tags: [ctf, fundamentals, methodology]
created: 2026-05-01
---

# 🧠 Methodology: วิธีคิดและขั้นตอนแก้โจทย์ CTF

> **กฎทอง**: "ถ้าติด 30 นาที ให้หยุด อ่านโจทย์ใหม่ จดสิ่งที่รู้ แล้วลองมุมใหม่"

โจทย์ CTF ที่ดีจะมีคำใบ้แอบในชื่อโจทย์ description หรือไฟล์: การมองข้ามคือสาเหตุที่ผู้เล่นเสียเวลาเป็นชั่วโมงกับโจทย์ง่ายๆ

---

## 🔄 The CTF Solving Loop

```
       ┌──────────────────┐
       │ 1. อ่านโจทย์     │
       └────────┬─────────┘
                ▼
       ┌──────────────────┐
       │ 2. Recon         │ ← เก็บข้อมูลให้มากที่สุด
       └────────┬─────────┘
                ▼
       ┌──────────────────┐
       │ 3. Hypothesize   │ ← "น่าจะเป็น vuln แบบ ___"
       └────────┬─────────┘
                ▼
       ┌──────────────────┐
       │ 4. Test          │ ← ลองยิง payload เล็กๆ
       └────────┬─────────┘
                ▼
       ┌──────────────────┐
       │ 5. Exploit       │ ← เขียน script เต็ม
       └────────┬─────────┘
                ▼
       ┌──────────────────┐
       │ 6. Get Flag 🚩   │
       └──────────────────┘
              ▲
              │ ถ้าไม่ได้ ⮌ กลับไปข้อ 2 หรือ 3
```

---

## ขั้นตอนละเอียด

### 1️⃣ อ่านโจทย์ให้ "ขาด"

อ่าน description **3 รอบ**:
- รอบ 1: ภาพรวม
- รอบ 2: เก็บคำสำคัญ: "cookie", "admin", "fast", "metadata"
- รอบ 3: หาความเชื่อมโยงระหว่างชื่อโจทย์กับเทคนิค

**ตัวอย่างชื่อโจทย์ → ใบ้ว่าอะไร:**
| ชื่อโจทย์ | ใบ้ว่า |
|---------|-------|
| "Time is precious" | Race condition / Time-based attack |
| "Cookie Monster" | Cookie tampering |
| "Speak Friend, and Enter" | Buffer overflow (LotR + binary) |
| "Stuck in the middle" | MITM / Padding oracle |
| "Cat lovers" | LFI ที่อ่านไฟล์ด้วย `cat` |
| "Polygon" | คณิตศาสตร์ / เลขเรขาคณิต |
| "RSA easy" | RSA แต่มี vulnerability บางอย่าง |

### 2️⃣ Recon (ละเอียดที่สุดเท่าที่ทำได้)

ดู [Passive-Recon](../02-Reconnaissance/Passive-Recon.md), [Active-Recon](../02-Reconnaissance/Active-Recon.md), [Enumeration](../02-Reconnaissance/Enumeration.md)

**Web challenge เริ่มยังไง:**

1. เปิดในเบราว์เซอร์: ดู page, ลอง interact กับทุก feature
2. **View Source** (Ctrl+U): comments, hidden inputs
3. **Network tab** (F12): headers, cookies, hidden requests
4. ดูไฟล์มาตรฐาน:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/.git/`: ถ้าเปิดอยู่ ใช้ git-dumper
   - `/.env`
   - `/admin`, `/login`, `/api`
   - `/backup.zip`, `/backup.tar`
   - `/phpinfo.php`, `/info.php`
5. **Wappalyzer** extension: ดู tech stack
6. ลองเปลี่ยน extension ของหน้าหลัก: `index.php` → `index.aspx` → `index.jsp`
   - เปลี่ยนแล้ว response ต่างกัน = บอกภาษา backend
7. Burp ตั้งดักทุก request ขณะ browse

**Binary challenge เริ่มยังไง:**

```bash
file ./binary           # 32/64-bit, statically/dynamically linked?
checksec ./binary       # NX, PIE, RELRO, Canary?
strings ./binary | less # ดู strings ที่น่าสน
./binary                # ลองรัน ดูพฤติกรรม
ltrace ./binary         # ดู library calls
strace ./binary         # ดู syscalls
```

### 3️⃣ ตั้งสมมติฐาน (Hypothesize)

จาก Recon เราจะมี clue หลายตัว ให้รวบมาเป็นสมมติฐาน:

> "form login มี `' OR '1'='1` ทำให้ error ต่างจากเดิม → น่าจะมี SQL injection"

> "binary ไม่มี canary, ไม่มี PIE, มี `system()` ใน plt → buffer overflow + ret2plt"

**Common patterns ใน CTF:**
- เห็น `?file=home.html` → ลอง [LFI](../03-Web-Exploitation/LFI-RFI.md)
- เห็น `?url=...` → ลอง [SSRF](../03-Web-Exploitation/SSRF.md)
- เห็น `?id=1` → ลอง [SQLi](../03-Web-Exploitation/SQL-Injection.md)
- เห็น textbox ที่จะถูก render ในหน้า → ลอง [XSS](../03-Web-Exploitation/XSS.md)
- เห็น search ที่ render ค่าใน template → ลอง [SSTI](../03-Web-Exploitation/SSTI.md)
- เห็น JWT token → ลอง [JWT-Attacks](../03-Web-Exploitation/JWT-Attacks.md)

### 4️⃣ Test (ทดสอบสมมติฐาน)

**กฎ**: เริ่มจาก payload ที่ "ง่ายที่สุด" ที่ confirm สมมติฐานได้
- SQLi → `'` (เช็ค error) ก่อน `' OR 1=1--`
- XSS → `<script>alert(1)</script>` ก่อน steal cookie
- SSRF → `http://localhost/` ก่อน metadata service

ทำไมต้องเริ่มเล็ก? เพราะถ้า payload ใหญ่ไม่ work อาจตีความผิด: สมมุติว่าไม่มี vuln ทั้งที่จริงๆ มีแต่ใหญ่เกิน

### 5️⃣ Exploit (สร้าง full exploit)

เมื่อ confirm vuln แล้ว เขียน script เต็ม โดยใช้:
- **Python + requests** สำหรับ web automation
- **pwntools** สำหรับ binary
- **Burp Intruder** สำหรับ bruteforce parameter

**Template Python exploit:**
```python
import requests

URL = "http://chal.ctf.com:1337"
s = requests.Session()

# 1. Login / setup
r = s.post(f"{URL}/login", data={"user": "admin", "pass": "x' OR '1'='1"})

# 2. Exploit
r = s.get(f"{URL}/admin")
print(r.text)
```

### 6️⃣ Submit flag: ตรวจ format!

```
flag{abc_123}    ✓
abc_123          ✗ (ลืมใส่ wrapper)
flag{abc_123}    ← ระวัง space ก่อน/หลัง
```

---

## 🎯 Mindset Hacks

### Hack #1: "ถ้าออกแบบโจทย์นี้ จะเอา flag ไว้ตรงไหน"
ลองคิดในมุมคนสร้างโจทย์: เขาตั้งใจให้เราใช้เทคนิคอะไร? feature ไหนที่ไม่ปกติคือ "ทาง" ที่เขาเปิดให้

### Hack #2: "อะไรที่ ดู `แปลก` ที่สุดในโจทย์?"
- Comment ที่เหมือน TODO
- Function ที่ไม่ได้เรียกใช้
- Endpoint ที่ขึ้น 403 แทน 404
- Cookie ชื่อแปลกๆ

ของแปลกมักเป็นทางแก้

### Hack #3: "1 step at a time"
อย่าพยายามแก้ทั้งโจทย์ในก้าวเดียว แตกย่อย:
1. หา injection point ก่อน
2. confirm มี vuln
3. หาวิธี extract ข้อมูล
4. หา flag

### Hack #4: เมื่อหมดทาง ลองสิ่งเหล่านี้
- เปลี่ยน HTTP method (`GET` → `POST` → `PUT` → `OPTIONS`)
- ใส่/ตัด trailing slash
- เปลี่ยน Content-Type
- เพิ่ม header `X-Forwarded-For: 127.0.0.1`
- ลอง `Host: localhost` แทน domain
- ลอง URL encode ซ้อนๆ (double encode)
- ลอง path traversal `../`
- ลองส่งค่าซ้ำ (parameter pollution: `?id=1&id=2`)
- เปลี่ยน case (`admin` → `ADMIN` → `Admin`)

---

## 📋 Checklist ก่อนยอมแพ้

ก่อนเปิด writeup หรือถามคนอื่น เช็คให้แน่ใจว่าทำสิ่งเหล่านี้แล้ว:

- [ ] อ่าน description ครบทุกคำ
- [ ] ลองทุก HTTP method
- [ ] ดู response headers ทุกตัว
- [ ] ลอง view source + check JS files
- [ ] รัน `strings` (ถ้าเป็น binary)
- [ ] ลองรัน `binwalk` (ถ้าเป็นไฟล์)
- [ ] ดู metadata (`exiftool`)
- [ ] ทดสอบ vuln พื้นฐาน (SQLi, XSS, LFI) ทุกจุด input
- [ ] ตรวจ encoding (base64, hex, URL, unicode)
- [ ] กลับไปอ่าน hint ของโจทย์อีกครั้ง

---

## ⏱ การจัดการเวลา (สำคัญในแข่งจริง)

- **Timer 30 นาที**: ถ้าติดเกิน 30 นาที ข้ามไปข้ออื่น แล้วกลับมาทีหลัง
- **กฎ 80/20**: ใน 4 ชั่วโมงแรกของการแข่ง 24 ชม. แก้โจทย์ง่ายให้หมดก่อน อย่าจมข้อยาก
- **ถ่ายทอดในทีม**: ถ้าเล่นทีม คนละหมวด: อย่าทุกคนรุมโจทย์เดียว เว้นแต่เป็นโจทย์สุดท้าย

---

## 🔗 ต่อไป

- ลุย [Recon ก่อนเลย](../02-Reconnaissance/Passive-Recon.md)
- หรือเลือก [Web](../03-Web-Exploitation/SQL-Injection.md)
- กลับ [00-START-HERE](00-START-HERE.md)

---

#ctf #fundamentals #methodology
