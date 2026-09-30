---
tags: [ctf, osint, recon]
created: 2026-05-01
---

# 🌍 OSINT Techniques (Open-Source Intelligence)

> "OSINT คือศิลปะของการประกอบชิ้นส่วนข้อมูลสาธารณะให้เป็นภาพรวม"

OSINT challenge ใน CTF มักไม่มี vulnerability ทางเทคนิค: มันคือเกมการสืบ ให้ flag จากเบาะแสในรูปภาพ บัญชี social media หรือเว็บที่ลืม

---

## 🎯 ประเภทของ OSINT challenge

1. **People Search**: หาบุคคลจากรูป/ชื่อ/handle
2. **Geolocation**: บอก location จากรูป
3. **Account Tracing**: หา social media ของคน
4. **Historical / Wayback**: หาข้อมูลที่ลบไปแล้ว
5. **Document/Metadata**: หาข้อมูลใน file
6. **Corporate**: สืบบริษัท

---

## 1️⃣ Image OSINT

### EXIF Metadata

ทุกภาพถ่ายมี metadata ฝังอยู่: ถ้าถ่ายจากกล้อง/มือถือไม่ได้ strip ออกจะมี:
- GPS coordinates
- Date/time
- Camera make/model
- Software ที่ใช้แก้

```bash
exiftool image.jpg

# หรือออนไลน์
# https://exif.tools
# https://jimpl.com
```

> 💡 ใน CTF บางทีโจทย์ **ลบ EXIF ออกแล้ว** แต่ลืมข้อมูลใน thumbnail (รูปย่อในไฟล์) ที่ยังมี GPS อยู่

```bash
# ดึง thumbnail
exiftool -b -ThumbnailImage image.jpg > thumb.jpg
exiftool thumb.jpg
```

### Reverse Image Search

| Engine | จุดเด่น |
|--------|---------|
| **Google Images** | ทั่วไป |
| **Yandex** ⭐ | เก่งสุดสำหรับใบหน้าและภาพในรัสเซีย/ยุโรปตะวันออก |
| **Bing Visual Search** | ดี |
| **TinEye** | หา exact match: ดูประวัติการใช้รูป |
| **Baidu** | จีน |

> Yandex มักเจอผลที่ Google ไม่เจอ: ลอง Yandex เป็นอันดับแรก

### Geolocation จากรูป (Geoguessr-style)

**Clues ที่ต้องสังเกต:**

1. **ภาษาในป้าย**: ระบุประเทศ
2. **License plate**: รูปร่าง สีบ่งบอกประเทศ
   - Yellow plate (front+back) = UK, Netherlands
   - Long plate = Europe
   - Square plate = Asia (ส่วนใหญ่)
3. **Driving side**: ซ้ายมือ (UK, ญี่ปุ่น, ไทย, ออสซี่) vs ขวามือ
4. **Power lines / Pole shape**: แต่ละประเทศต่างกัน
5. **Road markings**: สี (เหลือง vs ขาว), pattern
6. **ทิศทางของแสงแดด**: ตำแหน่งดวงอาทิตย์ + เงา → ทิศ + เวลา
7. **Vegetation**: ต้นไม้ในเขตร้อน vs หนาว
8. **Bollards**: ในยุโรปแต่ละประเทศมีเอกลักษณ์
9. **Architecture**: สถาปัตยกรรมเฉพาะถิ่น

**Tools:**
- **Google Earth / Street View**: ตรวจสอบสถานที่ที่สงสัย
- **Mapillary**: Street View ของชาวบ้าน (มีในที่ Google ไม่มี)
- **OpenStreetMap**: ดู layout ถนน
- **GeoSpy.ai**: AI guess location จากรูป (ใหม่ปี 2024-2025)
- **SunCalc**: ดูตำแหน่งดวงอาทิตย์ตามเวลา/พิกัด

### Sun Position
ถ้ารูปมีเงา ใช้ shadow direction + suncalc.org คำนวณ:
- ทิศของเงา + เวลาในรูป → พิกัดประมาณ

### ภาพถ่าย "Selfie of Doom"
หลายคนโพสต์ selfie ที่ sea ของหน้าต่างซ้อนใน reflection: Yandex/AI ปัจจุบัน enhance ได้

---

## 2️⃣ People & Account OSINT

### Username Search

**Sherlock**: search username ในกว่า 400 site
```bash
sherlock username
```

**WhatsMyName**: whatsmyname.app

**Namechk / Knowem**: ดูว่า username ใช้ในเว็บไหนบ้าง

### Email OSINT

**Hunter.io**: หา email pattern ของบริษัท

**Have I Been Pwned**: haveibeenpwned.com: เช็คว่า email หลุดในการ breach ไหน

**EmailRep**: emailrep.io: reputation ของ email

**Holehe**: เช็ค email ใน 100+ services
```bash
holehe email@example.com
```

**GHunt**: หาข้อมูลจาก Gmail (ชื่อ, profile pic, Google services ที่ใช้)

### Phone Number

**PhoneInfoga**
```bash
phoneinfoga scan -n +66812345678
```

### LinkedIn Recon

- ดูพนักงานทั้งหมด → ชื่อ → email pattern
- เห็น tech stack จากประวัติ ("Worked with AWS, K8s")
- Mentor in Cybersecurity? อาจมี blog/Twitter

**ScrapedIn / LinkedIn2Username**: สร้าง list email จาก company

### Twitter/X

- **Advanced Search**: ค้นใน timeframe เฉพาะ
  ```
  from:username since:2020-01-01 until:2020-12-31
  ```
- **Tweet Deleter Archive** (politwoops): บางทีเก็บ deleted tweets ไว้

### Facebook

- Facebook search แบบ pre-2019 ตายไปแล้ว แต่ยังใช้ Google dork ได้
  ```
  site:facebook.com "John Doe" "Bangkok"
  ```
- **Facebook Graph Search workarounds**: ใช้ `intelx.io`

### Instagram

- **Imginn / Picuki**: ดู profile โดยไม่ต้องล็อกอิน
- **inflact.com**: เครื่องมือต่างๆ

### Discord

Discord ID จาก username: ใช้ disboard.org

---

## 3️⃣ Document & File OSINT

### PDF Metadata
```bash
exiftool document.pdf
pdfinfo document.pdf
```

ดู:
- Author
- Creation tool (Microsoft Word? โหลดจาก Adobe?)
- Creation/Modification date
- Software version

### Office Documents (.docx, .xlsx, .pptx)

จริงๆ คือ ZIP file
```bash
unzip document.docx -d docx_extracted
ls docx_extracted/docProps/
cat docx_extracted/docProps/core.xml  # author, title, etc.
```

### Hidden ใน document
- Word: comments, tracked changes, hidden text
- Excel: hidden sheets, hidden columns/rows, named ranges
- PDF: layers, comments, form fields ที่ซ่อน

---

## 4️⃣ Historical Web OSINT

### Wayback Machine: web.archive.org
```bash
# ดึง URL ทั้งหมด
waybackurls example.com > urls.txt

# ดู snapshot ในวันที่กำหนด
# https://web.archive.org/web/2020*/example.com
```

### Google Cache
```
cache:example.com
```

### archive.today / archive.ph
อีกทางเลือกของ Wayback

### CommonCrawl
data ของ web crawl ขนาดใหญ่ ฟรี

---

## 5️⃣ Domain & Infrastructure OSINT

### DNS History
- **SecurityTrails** (มี free tier)
- **DNSdumpster**: dnsdumpster.com
- **ViewDNS.info**

### IP History / Reverse IP
- **ViewDNS.info**: domains hosted on same IP
- **Hurricane Electric BGP**: bgp.he.net

### SSL Certificates
- **crt.sh**: Certificate Transparency search
- **Censys**: ค้น cert แบบ advanced

> certificate มักเปิดเผย subdomain เพราะออกใบเดียวครอบคลุมหลาย CN/SAN

---

## 6️⃣ Corporate / Business OSINT

### Sources
- **OpenCorporates**: opencorporates.com
- **SEC EDGAR** (USA): sec.gov/edgar
- **Companies House** (UK)
- **กรมพัฒนาธุรกิจการค้า** (ไทย): dbd.go.th

### Job postings
"We're looking for someone with **Splunk, AWS, Okta, K8s** experience"
→ บริษัทใช้เทคโนโลยีเหล่านี้

---

## 7️⃣ Real-time / Live OSINT

### Flight Tracking
- **flightradar24.com**
- **adsbexchange.com** (มี military/blocked aircraft ที่ FR24 ซ่อน)

### Marine
- **marinetraffic.com**
- **vesselfinder.com**

### Live Cameras
- **insecam.org**: webcam ที่ไม่ได้ใส่ password
- **Shodan**: `webcamxp` หรือ `default password`

---

## 🛠 OSINT Frameworks

### Maltego
GUI tool: ลาก "Transform" เพื่อ pivot จาก entity หนึ่ง → อื่นๆ
- Free Community Edition จำกัด 12 results/transform

### SpiderFoot
Automated OSINT: รัน 200+ modules

### IntelOwl
รวม API ของ OSINT services

### OSINT Framework: osintframework.com
ไม่ใช่ tool แต่เป็น **list** ของ tool/แหล่งข้อมูลทั้งหมด: bookmark ไว้!

---

## 📋 OSINT Workflow (ตัวอย่าง challenge)

> โจทย์: "Find John Smith's home address. Photo: [john.jpg]"

1. **Image OSINT**
   - `exiftool john.jpg`: มี GPS? → ตอบเลย ไม่ก็ต่อ
   - Reverse search → เจอ profile ของ John ใน Twitter, Instagram

2. **Account Pivot**
   - Twitter @johnsmith: ดู tweet ล่าสุด มี geotag ไหม?
   - LinkedIn: บริษัทที่ทำงาน

3. **Cross-reference**
   - Sherlock username `johnsmith2024` → เจอ GitHub
   - GitHub commit history → email `john@gmail.com`
   - Have I Been Pwned email → leak ไหน?

4. **Geolocation**
   - รูป "morning coffee at home": มี landmark ในรูป
   - Yandex reverse → เจอ café ในเมือง X

5. **เชื่อมโยง**
   - บริษัท + เมือง + รูปบ้าน + Yandex (street view) → narrow down

> ⚠️ **จริยธรรม**: OSINT ใน CTF ใช้กับ "Persona" สมมติเท่านั้น การ stalk คนจริงผิดกฎหมายและจริยธรรม

---

## 🔗 ต่อไป

- เครื่องมือ recon โดยรวม [Tools-Setup](../01-Fundamentals/Tools-Setup.md)
- ลึก passive [Passive-Recon](Passive-Recon.md)
- เริ่ม web [03-Web-Exploitation/SQL-Injection](../03-Web-Exploitation/SQL-Injection.md)

---

#ctf #osint #recon
