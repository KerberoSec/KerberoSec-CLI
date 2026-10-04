---
tags: [ctf, fundamentals]
created: 2026-05-01
---

# 🚩 CTF คืออะไร?

## คำจำกัดความ

**Capture The Flag (CTF)** คือการแข่งขันด้านความปลอดภัยทางคอมพิวเตอร์ ที่ผู้เล่นต้องค้นหา **"flag"** ซึ่งเป็นข้อความเฉพาะที่ซ่อนอยู่ในโจทย์ มักอยู่ในรูปแบบ:

```
flag{this_is_the_flag}
HTB{example_flag_format}
picoCTF{another_format}
CTF{<hash>}
```

เมื่อหา flag เจอ ก็เอาไป submit ในระบบเพื่อรับคะแนน

---

## ทำไมต้องเล่น CTF?

### 1. เรียนรู้ความปลอดภัยจริงในสภาพที่ปลอดภัย
ในชีวิตจริงเราโจมตีระบบใครไม่ได้ (ผิดกฎหมาย) แต่ CTF จัดสภาพแวดล้อมที่ "ออกแบบมาให้แฮก": ปลอดภัยทั้งกฎหมายและจริยธรรม

### 2. ฝึก mindset ของผู้โจมตี (Attacker Mindset)
การจะปกป้องระบบได้ ต้องคิดเหมือนผู้โจมตี CTF บังคับให้คิดแบบ "นี่จะพังได้ยังไง" แทนที่จะคิดแบบ "นี่ทำงานยังไง"

### 3. โอกาสเข้าวงการ Cybersecurity
- บริษัทใหญ่ๆ (Google, Microsoft, ธนาคาร) ดู CTF ranking ในการรับสมัครงาน Security/Pentester
- Bug Bounty hunter ส่วนใหญ่เริ่มจาก CTF
- รายงาน HackerOne 2025 ระบุว่า web vulnerabilities คิดเป็นกว่า 65% ของ valid reports: และ hunter หลายคนฝึกฝนทักษะมาจาก CTF

### 4. ชุมชนและความสนุก
CTF มีชุมชนทั่วโลก: Discord, Reddit (r/securityCTF), CTFtime: เล่นเป็นทีม สนุก และได้เพื่อนใหม่

---

## องค์ประกอบของโจทย์ CTF

โจทย์ CTF ทุกข้อมีโครงสร้างคล้ายกัน:

```
┌─────────────────────────────────────┐
│  Title: Easy SQL Injection          │
│  Category: Web                      │
│  Points: 100                        │
│  Description: Login as admin to get │
│               the flag              │
│  Files: source.php (optional)       │
│  URL: http://chal.ctf.com:1337      │
│  Hints: (อาจมีหรือไม่มี)            │
└─────────────────────────────────────┘
```

**สิ่งที่ต้องอ่านให้ขาด:**
1. **Description**: บอกใบ้ว่าใช้เทคนิคอะไร (เช่น "Cookies are tasty" → ลองแก้ cookie)
2. **Category**: บอกประเภท เช่น Web, Crypto, Pwn
3. **Points**: ยิ่งสูงยิ่งยาก
4. **Files**: ดาวน์โหลด source code หรือ binary มาวิเคราะห์
5. **Hints**: ถ้าติดจริงค่อยเปิด (บางที่หักคะแนน)

---

## ตัวอย่าง flag format ที่เจอบ่อย

| Format | ใช้ใน |
|--------|-------|
| `flag{...}` | ทั่วไป |
| `FLAG{...}` | หลายงาน |
| `picoCTF{...}` | picoCTF |
| `HTB{...}` | HackTheBox |
| `THM{...}` | TryHackMe |
| `CTF{...}` | DefCon, ทั่วไป |
| `<32-hex>` | บางงาน เช่น `a1b2c3d4...` |

> 💡 **Tip**: เมื่อเริ่มแข่ง อ่าน Rules เสมอเพื่อรู้ format ของ flag: บางทีหาได้แล้วยิ่งใหญ่แต่ submit ผิด format

---

## 🔗 เชื่อมต่อหัวข้ออื่น

- รู้จักประเภทแล้วไปดู [ประเภท CTF](CTF-Types.md)
- เตรียมเครื่องที่ [Tools-Setup](Tools-Setup.md)
- เรียนวิธีคิดที่ [Methodology](Methodology.md)

---

#ctf #fundamentals
