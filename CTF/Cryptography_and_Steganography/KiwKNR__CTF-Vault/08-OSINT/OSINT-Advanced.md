---
tags: [ctf, osint, advanced, geolocation]
created: 2026-05-02
---

# 🕵️ OSINT ขั้นสูง

> **OSINT (Open Source Intelligence)** = สืบจากข้อมูลสาธารณะ: ใน CTF ขั้นสูง เน้น geolocation, image investigation, person tracking

ดู [../02-Reconnaissance/OSINT-Techniques](../02-Reconnaissance/OSINT-Techniques.md) สำหรับ basics: หน้านี้เน้นเทคนิคที่ใช้ใน OSINT challenge ระดับ "หา flag จากภาพถ่าย" หรือ "track real person"

---

## 🌍 Geolocation Challenges

CTF ให้ภาพมาแล้วถามว่า "ที่นี่ที่ไหน?": ต้องใช้ทุก clue ในภาพ

### Clue หลักที่ใช้

#### 1. ป้ายข้อความ
- ภาษาที่ใช้: narrows country
- Font, style: บางประเทศมีลายเซ็น
- ที่อยู่ ชื่อร้าน
- เบอร์โทร: area code = country/region

#### 2. ตัวยาน
- รถยนต์: ทะเบียนรถ (format ต่างกันแต่ละประเทศ)
- ระบบขับ (left-hand, right-hand)
- รถไฟ, รถบัสรูปแบบ

#### 3. โครงสร้าง
- ปลั๊กไฟ (Type A US, Type C/F EU, Type G UK, Type I AU)
- เสาไฟฟ้า
- ตู้ไปรษณีย์สี (red UK, blue US, yellow DE/FR)
- หลังคาบ้าน
- หน้าต่างรูปแบบ
- Manhole cover

#### 4. ธรรมชาติ
- พืช พรรณ: ภูมิอากาศ
- ภูเขา (skyline)
- ทะเล direction (ทิศทาง coast)
- เงา: ทิศของดวงอาทิตย์ → คำนวณเวลา/latitude

#### 5. ป้ายถนน
- รูปร่าง stop sign แตกต่างกัน
- ป้ายความเร็ว (km/h vs mph)
- เส้นถนนสี (white/yellow)

### Reverse Image Search

| Tool | จุดเด่น |
|------|--------|
| **Google Images** | ทั่วไป |
| **Yandex** ⭐ | เก่งกว่า Google ใน face/objects ของยุโรปตะวันออก |
| **TinEye** | เก่งสำหรับหา exact match |
| **Bing Visual** | บางครั้งดี |
| **Lens (Google)** | mobile, รวดเร็ว |
| **PimEyes** | face search (controversial) |
| **SauceNAO** | anime/illustration |

→ Yandex มักเก่งกว่าใน geolocation เพราะ index ภาพ travel เยอะกว่า

### Google Maps Tools

#### Street View
- ตรวจ: ที่ไหนคือ best match
- มี "year" slider: ดูว่าภาพถ่ายปีไหน

#### Google Earth
- 3D view + historical imagery
- Time slider → match shadow/sun position
- Sun position → คำนวณเวลาถ่ายภาพ

### Sun position
ใช้ **SunCalc** (suncalc.org):
- ใส่วันที่ (เดาจาก context หรือ EXIF)
- ลาก marker ใน map
- ปรับทิศทางเงา
- → location

```
ภาพ: เงาไปทางตะวันออก, ตอนเย็น → ดวงอาทิตย์อยู่ตะวันตก
+ พืช tropical
+ ภาษาบนป้าย = Thai
→ Thailand, ภาคตะวันออก, late afternoon
```

---

## 🛠 Tools ที่ใช้บ่อย

### exiftool
```bash
exiftool image.jpg

# Look for:
# GPSLatitude, GPSLongitude  ← jackpot
# CreateDate, DateTimeOriginal
# Camera Make/Model: narrows
# Software: what edited
```

### Photos with GPS
ตั้งแต่ 2010s phones ใส่ GPS ใน EXIF: แต่ social media ลบทิ้งบ่อย

→ แต่ถ้าได้ original file (ไม่ผ่าน WhatsApp/IG/FB) → มี GPS

### Direct from EXIF coords:
```bash
exiftool -GPSLatitude -GPSLongitude -GPSAltitude image.jpg
# → Google Maps → flag location!
```

---

## 🌐 Geo-tagged services

### Flickr Map
flickr.com/map: ดูรูปที่ tag location

### Mapillary / Google Street View
crowdsourced street imagery

### OpenStreetMap (OSM)
- map data ละเอียดกว่า Google ใน rural areas
- ค้นหา POI specific (เช่น "convenience store ใน area")

### Strava Heatmap
running/cycling routes: เคยใช้ระบุ military bases (2018)

### Wigle
wigle.net: WiFi SSID location DB
- หา SSID specific → ที่ไหน
- ใช้ใน CTF challenge ที่ให้ SSID มา

---

## 👤 Person Tracking (ระวัง: ethical lines)

### Username Pivot

หา username ใน platform:
- **Sherlock** ⭐
  ```bash
  pip install sherlock-project
  sherlock username
  ```
- **WhatsMyName**
- **Maigret** (more data)
  ```bash
  maigret username
  ```
- **Namechk**: manual check across 100+ services

### Email-based
- **HaveIBeenPwned**: was email in breach?
- **Hunter.io**: find emails for domain
- **Epieos** (free version): email → linked Google ID, sites
- **GHunt**: Google account → recovery info, photos

### Phone-based
- **Truecaller** (with limit)
- **OSINT-Industries** ($)
- Search phone in WhatsApp / Telegram → photo

### Image-based
- **PimEyes**: face → match across web
- **Yandex**: surprisingly good at face

### Domain WHOIS history
- **WhoisXML API**
- **DomainTools**: historical records (paid)
- **whois.domaintools.com**: public

หากหามาตรการป้องกัน privacy แล้ว: historical WHOIS อาจ leak old contact

---

## 🛰 Satellite Imagery

### Google Earth Pro
ฟรี: historical imagery, 3D, time slider

### Sentinel Hub
ฟรี satellite imagery, 10m resolution
- sentinel-hub.com/explore/eobrowser

### ESA Copernicus Open Access Hub
ฟรี Sentinel-1, Sentinel-2, Sentinel-3 data

### Planet (paid)
1m resolution, daily imaging: ใช้ในงาน journalism

### Yandex Maps
รัสเซีย/CIS countries บางที่ดีกว่า Google

---

## 🎯 OSINT CTF Patterns

### Pattern 1: "เจ้าของบัญชีนี้คือใคร?"
1. Username → Sherlock → all platforms
2. Profile → bio, posts → real name?
3. Real name → LinkedIn → workplace
4. Workplace → email format → email
5. Email → HaveIBeenPwned → past data

### Pattern 2: "ภาพนี้ถ่ายที่ไหน?"
1. Reverse search (Yandex first)
2. exiftool → GPS?
3. Visual analysis: ป้าย, ภาษา, สถาปัตยกรรม
4. Cross-reference Google Maps Street View
5. Sun position + shadows → time/lat

### Pattern 3: "หา domain owner"
1. WHOIS lookup (มัก redacted now)
2. WHOIS history → old records
3. SSL cert SAN list → other domains
4. Subdomain enumeration → linked services
5. crt.sh → certificate transparency

### Pattern 4: "ตามรอย transaction"
- Bitcoin: blockchain.com / blockchair.com
- Ethereum: etherscan.io
- Cluster analysis (Chainalysis-style: limited free tools)

### Pattern 5: "หาเอกสาร"
- Google dorks
  ```
  site:target.com filetype:pdf
  intitle:"index of" "private"
  ```
- Wayback Machine: old version
- archive.today: historical snapshots
- DNSDumpster: DNS history

---

## 🛠 Tool Stack (OSINT Power User)

| Category | Tools |
|----------|-------|
| **Username** | Sherlock, Maigret, WhatsMyName |
| **Email** | Epieos, GHunt, holehe, EmailRep |
| **Phone** | PhoneInfoga |
| **Image** | Yandex, Google Lens, TinEye, PimEyes |
| **Geolocation** | Google Earth, SunCalc, Mapillary, OSM |
| **Domain** | crt.sh, SecurityTrails, DNSDumpster |
| **Social Media** | Twint (deprecated), Snscrape |
| **Document** | Google dorks, Wayback Machine |
| **Aggregator** | OSINT Framework (osintframework.com), IntelTechniques |
| **Crypto** | blockchain.com, etherscan, OXT |

---

## 📚 Methodology

### 1. Document everything
- Screenshots, URLs, timestamps
- ใช้ Hunchly (browser extension): auto capture

### 2. Pivot
- 1 piece of info → 10 leads → 100 data points
- Use mind map (Maltego, draw.io, etc.)

### 3. Verify
- 1 source = rumor
- 3+ sources = fact
- Triangulate

### 4. Privacy / Ethics
- Don't engage target
- Don't post findings publicly
- Respect "right to be forgotten"

---

## 🎯 Famous OSINT cases (study)

### Bellingcat investigations
- MH17 (2014): Russian missile, traced to specific brigade
- Skripal poisoning (2018): GRU operatives identified
- These use heavy OSINT: ดู techniques

### Trace Labs
- Missing person CTF: real cases
- Practice OSINT for good

---

## 🔗 ที่เกี่ยวข้อง

- [../02-Reconnaissance/OSINT-Techniques](../02-Reconnaissance/OSINT-Techniques.md)
- [Geo-OSINT-Tricks](Geo-OSINT-Tricks.md)
- [../07-Forensics/Forensics-Intro](../07-Forensics/Forensics-Intro.md)

## 📚 References

- bellingcat.com (investigations + guides)
- osintframework.com
- "Open Source Intelligence Techniques": Michael Bazzell
- traceLabs.org

---

#ctf #osint #advanced
