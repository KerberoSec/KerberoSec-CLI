---
tags: [ctf, fundamentals, tool, setup]
created: 2026-05-01
---

# 🛠 เครื่องมือและการเซ็ตอัพ

## 🐧 OS แนะนำสำหรับเล่น CTF

### ตัวเลือกที่ 1: Kali Linux ⭐ แนะนำสำหรับมือใหม่
- มีเครื่องมือพร้อมใช้กว่า 600 ตัว (Burp, sqlmap, nmap, gdb, Ghidra, ฯลฯ)
- ดาวน์โหลด: kali.org/get-kali

### ตัวเลือกที่ 2: Parrot OS
- คล้าย Kali แต่กิน RAM น้อยกว่า
- ดีไซน์สวยกว่า

### ตัวเลือกที่ 3: Ubuntu/Debian + ติดตั้งเอง
- เหมาะกับคนชอบสะอาดและเข้าใจ tool ที่ใช้

### วิธีรัน
- **VirtualBox / VMware**: เซฟสุด แยกกับเครื่องหลัก
- **WSL2** (Windows): เร็วกว่า VM แต่บาง tool ใช้ไม่ได้
- **Dual boot**: เร็วสุดแต่ยุ่ง

> ⚠️ อย่าลง Kali เป็น OS หลัก ถ้าไม่ได้เป็น pentester เต็มตัว: มันไม่เหมาะใช้งานทั่วไป

---

## 🔥 เครื่องมือ "ต้องมี" สำหรับทุกคน

### 1. Burp Suite (Community Edition ฟรี)
- **คือ proxy** ที่ดักจับ HTTP/HTTPS traffic ระหว่าง browser ↔ server
- ใช้ใน [Web](Web-Exploitation.md) **เกือบทุกโจทย์**
- ตั้งค่า: Proxy → Intercept → Set browser proxy = `127.0.0.1:8080` + ติดตั้ง CA cert
- Pro tip: ใช้ FoxyProxy extension ใน Firefox สลับเปิด-ปิด proxy ได้

### 2. nmap
- สแกน port และ service ของเป้าหมาย
- ดูเพิ่มเติม [Active-Recon](../02-Reconnaissance/Active-Recon.md)
```bash
nmap -sV -sC -p- -oN scan.txt target.com  # full scan
```

### 3. Wireshark
- วิเคราะห์ traffic เครือข่ายจาก pcap files
- ใช้ใน Forensics/Network category

### 4. CyberChef ⭐ "Swiss Army Knife"
- เว็บเบราว์เซอร์ tool: gchq.github.io/CyberChef
- ทำได้: encode/decode, crypto, hashing, regex, ฯลฯ
- ลากบล็อก operations ต่อกันเป็น "recipe"

### 5. Python + pwntools
```bash
pip install pwntools
```
- ใช้เขียน exploit script (ใน Pwn, Web automation, Crypto)
- มาตรฐานในวงการ

### 6. Ghidra (ฟรี โดย NSA)
- Reverse engineering: decompile binary เป็น C-like code
- ดาวน์โหลด: ghidra-sre.org

### 7. gdb + pwndbg / gef
- Debugger สำหรับ Pwn category
```bash
git clone https://github.com/pwndbg/pwndbg
cd pwndbg && ./setup.sh
```

### 8. file, strings, xxd, hexdump (built-in Linux)
```bash
file mystery.bin       # ระบุชนิดไฟล์
strings mystery.bin    # ดึง printable strings
xxd mystery.bin | head # ดู hex
```

### 9. binwalk
- วิเคราะห์ firmware/file ที่มีไฟล์อื่นซ้อนอยู่ข้างใน
```bash
binwalk -e suspicious.png  # extract embedded files
```

### 10. sqlmap
- automated SQL injection: ใช้ตอนหลัง [SQL-Injection](../03-Web-Exploitation/SQL-Injection.md) ที่ทำมือเสร็จ
```bash
sqlmap -u "http://target/page?id=1" --dbs
```

---

## 📦 รายการเครื่องมือเต็มแยกตามหมวด

### Web
| Tool | ใช้ทำอะไร |
|------|----------|
| Burp Suite | Proxy, repeat, intruder |
| OWASP ZAP | ทางเลือกฟรีของ Burp Pro |
| sqlmap | Automated SQLi |
| ffuf, gobuster, dirsearch | Directory bruteforce |
| nuclei | Template-based scanner |
| jwt_tool, jwt.io | JWT analysis |
| nikto | Web server scanner |
| wpscan | WordPress |
| arjun, paramspider | Parameter discovery |

### Crypto
| Tool | ใช้ทำอะไร |
|------|----------|
| CyberChef | Encode/decode/cipher ทั่วไป |
| dCode.fr | เว็บถอดรหัสคลาสสิก |
| RsaCtfTool | RSA attacks อัตโนมัติ |
| sage / SageMath | คณิตศาสตร์ขั้นสูง |
| hashcat, john | Crack hash |
| openssl | Symmetric/asymmetric ทั่วไป |
| Pycryptodome | Python crypto library |

### Forensics
| Tool | ใช้ทำอะไร |
|------|----------|
| Volatility 3 | Memory forensics |
| Autopsy / Sleuth Kit | Disk forensics |
| Wireshark / NetworkMiner | Network forensics |
| binwalk, foremost, scalpel | File carving |
| exiftool | Metadata |
| photorec, testdisk | Recover deleted files |

### Stego
| Tool | ใช้ทำอะไร |
|------|----------|
| steghide | Hide/extract ในรูป/เสียง |
| zsteg | LSB stego ใน PNG/BMP |
| stegsolve.jar | ดู bit planes |
| sonic-visualiser | Spectrogram audio |
| stegseek | Bruteforce steghide |
| aperisolve.com | Web stego analyzer |

### Reverse Engineering
| Tool | ใช้ทำอะไร |
|------|----------|
| Ghidra | Decompile (ฟรี) |
| IDA Free / Pro | Industry standard |
| Binary Ninja | สมัยใหม่ ใช้ง่าย |
| radare2 / cutter | Open-source RE |
| dnSpy | .NET |
| jadx | Android APK |
| apktool | APK extract/repack |
| frida | Dynamic instrumentation |
| dex2jar | Convert .dex เป็น .jar |

### Pwn
| Tool | ใช้ทำอะไร |
|------|----------|
| pwntools (Python) | Exploit framework |
| gdb + pwndbg/gef | Debugger |
| ROPgadget, ropper | หา ROP gadgets |
| pwninit | Setup CTF binary |
| one_gadget | หา one-shot RCE ใน libc |
| checksec | ดู protections (NX, PIE, RELRO, Canary) |

---

## 📝 เซ็ตอัพ Workspace

โครงสร้างโฟลเดอร์ที่แนะนำเวลาแข่งแต่ละครั้ง:

```
~/ctf/
├── <ctf-name>/
│   ├── web/
│   │   ├── chal-1/
│   │   │   ├── source/      # source code ที่ download
│   │   │   ├── exploit.py   # script ที่เขียน
│   │   │   ├── notes.md     # บันทึกความคิด
│   │   │   └── flag.txt     # flag ที่ได้
│   │   └── ...
│   ├── crypto/
│   ├── pwn/
│   └── _writeup.md          # เขียน writeup หลังจบ
```

> 💡 **เคล็ดลับ**: ใช้ Obsidian (vault นี้!) จดโน้ตขณะแข่ง: กดเชื่อม `[link](link.md)` ไปดู cheatsheet ได้เร็ว

---

## 🌐 บัญชีออนไลน์ที่ควรมี

- [ ] **CTFtime.org**: ดูตารางการแข่งทั่วโลก + writeups
- [ ] **GitHub**: เก็บ exploit script ของตัวเอง + ดู repo คนอื่น
- [ ] **HackTheBox / TryHackMe**: ฝึก
- [ ] **Discord**: ทีม CTF ส่วนใหญ่ใช้
- [ ] **PortSwigger account**: ฟรี Web Security Academy

---

## 🔗 ต่อไป

- เซ็ตเสร็จแล้วไปเรียน [วิธีคิด/ขั้นตอนแก้โจทย์](Methodology.md)
- หรือกระโดดไปหมวดที่อยากฝึก: [Web](../03-Web-Exploitation/SQL-Injection.md) / [Crypto](../04-Cryptography/Classical-Ciphers.md)

---

#ctf #fundamentals #tool #setup
