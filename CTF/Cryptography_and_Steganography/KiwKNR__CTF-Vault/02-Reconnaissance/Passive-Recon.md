---
tags: [ctf, recon, passive, osint]
created: 2026-05-01
---

# 🕵️ Passive Reconnaissance: เก็บข้อมูลโดยไม่แตะเป้าหมาย

## What & Why

**Passive Recon** คือการเก็บข้อมูลเป้าหมายโดย **ไม่ส่ง packet ใดๆ ไปยังเป้าหมาย** ใช้ข้อมูลที่ public อยู่แล้ว

**ทำไมต้องทำก่อน Active?**
1. ไม่ทิ้งร่องรอย: เป้าหมายไม่รู้ตัวว่าโดนสำรวจ
2. หาข้อมูลที่ scan ตรงๆ ไม่เจอ (เช่น subdomain เก่า, dev environment ที่ลืมปิด)
3. ใน CTF: เผยข้อมูล metadata ของผู้สร้างโจทย์ที่อาจ leak flag

---

## 🔍 แหล่งข้อมูลหลัก

### 1. WHOIS
ดูข้อมูลการจดโดเมน: เจ้าของ, registrar, วันที่จด, name servers

```bash
whois example.com
```

ใน CTF บางทีโจทย์ซ่อน flag ใน WHOIS field (เช่น registrant name = `flag{...}`)

### 2. DNS Records
```bash
# A record (IP)
dig example.com A

# All records
dig example.com ANY

# MX (mail), TXT (verification, SPF, DKIM)
dig example.com MX
dig example.com TXT

# Reverse lookup
dig -x 8.8.8.8

# Zone transfer (rarely works แต่ลองดู)
dig @ns1.example.com example.com AXFR
```

**ทำไมสำคัญ:** TXT records บางทีมี internal info เช่น cloud provider, dev tools

### 3. Subdomain Enumeration (passive)

**crt.sh**: ค้น Certificate Transparency logs (ทุก SSL cert ที่ถูกออกถูกบันทึก public)
```bash
curl "https://crt.sh/?q=%25.example.com&output=json" | jq -r '.[].name_value' | sort -u
```

**Subfinder** (passive)
```bash
subfinder -d example.com -all
```

**amass** (intel mode)
```bash
amass intel -d example.com
amass enum -passive -d example.com
```

> 💡 ใน CTF การหา subdomain ที่ "ลืม" เช่น `dev.target.com`, `staging.target.com` ทำให้เจอ vuln เก่าๆ

### 4. Google Dorking (Google Hacking)

**Operator สำคัญ:**
| Operator | ความหมาย |
|----------|---------|
| `site:` | จำกัดโดเมน |
| `inurl:` | URL มีคำนี้ |
| `intitle:` | title มีคำนี้ |
| `intext:` | content มีคำนี้ |
| `filetype:` | จำกัดประเภทไฟล์ |
| `cache:` | ดู cached version |
| `-` | ตัดออก |
| `""` | match exact |

**Dork ที่ใช้บ่อยใน CTF/recon:**
```
site:target.com filetype:pdf
site:target.com filetype:txt
site:target.com inurl:admin
site:target.com intitle:"index of"
site:target.com ext:env OR ext:bak OR ext:old
site:target.com intext:"password"
"target.com" filetype:log
"target.com" "API_KEY"
```

ลองใน [Google Hacking Database](https://www.exploit-db.com/google-hacking-database): มี dork สำเร็จรูปกว่า 8000+ dork

### 5. Wayback Machine: web.archive.org

ดูเว็บในอดีต: บางทีเจอ:
- Endpoint เก่าที่ลืมปิด
- API key ใน JS file ที่ถูก commit แล้วลบ
- Backup file ที่เคยอยู่ใน server

```bash
# ดึง URL ทั้งหมดที่ archive เคยเก็บ
curl "http://web.archive.org/cdx/search/cdx?url=*.example.com/*&output=text&fl=original&collapse=urlkey"

# หรือใช้ tool
waybackurls example.com
gau example.com  # GetAllUrls
```

### 6. Shodan: "search engine for IoT/servers"

ค้นเครื่องที่ expose service สู่อินเทอร์เน็ต

```
hostname:example.com
org:"Example Corp"
http.title:"Login"
port:22 country:TH
ssl.cert.subject.cn:example.com
```

ใน CTF: Shodan มักให้ข้อมูล IP จริงเบื้องหลัง CDN, port ที่เปิดอยู่ที่ scan ปกติไม่เจอ

### 7. Censys: คล้าย Shodan

```
services.tls.certificates.leaf_data.subject.common_name: "*.example.com"
```

### 8. GitHub Dorking

ค้น secret ที่หลุดใน repo:
```
"target.com" password
"target.com" api_key
"target.com" filename:.env
org:Example filename:.env
```

**Tool อัตโนมัติ:**
- **trufflehog**: สแกน repo หา secrets
- **gitleaks**: ตรวจ git history
- **github-search** scripts

### 9. Social Media / LinkedIn

- หาชื่อพนักงาน → username pattern (`firstname.lastname@`)
- เห็นเทคโนโลยีที่ใช้ในประวัติงาน
- รูปถ่ายใน office อาจมี whiteboard/monitor ที่เห็นข้อมูล

### 10. Pastebin / Discord / Telegram leaks

- pastebin.com search "example.com"
- haveibeenpwned.com: ดูว่า email หลุดในการรั่วไหลไหน

### 11. Image OSINT (สำหรับ OSINT challenge)

- **EXIF**: `exiftool image.jpg` ดู GPS, camera, timestamp
- **Reverse image search**: Google Images, TinEye, Yandex (Yandex เก่งสุดสำหรับใบหน้า)
- **Geoguessr techniques**: ดู license plate, ป้ายภาษา, ทิศทางการขับรถ
- **Sun position / shadows** → ระบุเวลา + ทิศ

### 12. Email Harvesting

**theHarvester:**
```bash
theHarvester -d example.com -b google,bing,linkedin
```

**Hunter.io**: ค้น email ของพนักงาน

---

## 🧰 Recon Frameworks (รวบยอดทุกอย่าง)

### recon-ng
Framework แบบ console (คล้าย Metasploit) มี module passive recon เยอะ
```bash
recon-ng
> marketplace install all
> modules load recon/domains-hosts/hackertarget
```

### Spiderfoot
GUI + CLI: automated OSINT

### Maltego
Visual graph: ดีที่ visualize ความสัมพันธ์

---

## 📝 Workflow ตัวอย่าง (สำหรับเป้าหมาย example.com)

```bash
# 1. WHOIS + DNS
whois example.com > whois.txt
dig example.com ANY +noall +answer > dns.txt

# 2. Subdomains
subfinder -d example.com -silent | tee subs.txt
curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq -r '.[].name_value' | sort -u >> subs.txt
sort -u subs.txt -o subs.txt

# 3. URLs from history
waybackurls example.com > wayback.txt
gau example.com >> wayback.txt

# 4. Sensitive files in history
grep -E '\.(env|bak|old|sql|log|json|config)' wayback.txt

# 5. Google dorks (manual)
# site:example.com filetype:pdf
# site:example.com inurl:admin

# 6. GitHub
trufflehog github --org=Example
```

---

## 🚨 ระวัง: Passive ที่ "เผลอ Active"

บาง tool/source อาจส่ง packet ไปยังเป้าหมายโดยไม่รู้ตัว:
- `whois` query บาง registrar log IP คนถาม
- ดูเว็บใน Wayback Machine = เปิดเว็บผ่าน proxy = archive log
- Shodan ทำการ scan เอง: เราแค่ดูผล

ใน CTF ไม่มีปัญหา แต่ใน red team จริงต้องระวัง

---

## 🔗 ต่อไป

- เก็บข้อมูล passive ครบแล้วไป [Active-Recon](Active-Recon.md) เพื่อยืนยัน
- ถ้ามีโจทย์ OSINT-only ลึกๆ ดู [OSINT-Techniques](OSINT-Techniques.md)
- พบเว็บแล้วก็ [Enumeration](Enumeration.md)

---

#ctf #recon #passive #osint
