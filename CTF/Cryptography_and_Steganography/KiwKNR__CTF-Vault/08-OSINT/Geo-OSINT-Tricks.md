---
tags: [ctf, osint, geolocation, geo]
created: 2026-05-02
---

# 🗺 Geo-OSINT Tricks: เคล็ดลับระบุพิกัด

> Focused workflow สำหรับโจทย์ "ภาพนี้ถ่ายที่ไหน?": เป็น sub-genre ของ OSINT ที่นิยมมากใน CTF + GeoGuessr

---

## 🎯 Quick Wins ก่อนเริ่ม Visual

### 1. Check EXIF first (5 วินาที)
```bash
exiftool image.jpg | grep -i gps
```
ถ้ามี GPS → จบโจทย์

ส่วนใหญ่ EXIF ถูกลบ (social media strip metadata): แต่ challenge บางตัวลืม strip

### 2. Reverse search (1 นาที)
- **Yandex Images** ⭐ first
- Google Lens
- TinEye

ถ้าภาพดังพอ → match เจอทันที

### 3. ดู filename
ภาพชื่อ `IMG_paris_2023.jpg` หรือ `bangkok_temple.png`?

---

## 🌐 Visual Clues: Country Identifiers

### ภาษาบนป้าย
| Script | Country |
|--------|---------|
| Latin (English/EU langs) | EU/Americas/etc |
| Thai (ไทย) | Thailand |
| Lao (ລາວ) | Laos |
| Khmer (ខ្មែរ) | Cambodia |
| Burmese (မြန်မာ) | Myanmar |
| Vietnamese (with diacritics) | Vietnam |
| Chinese (Simplified) | Mainland China |
| Chinese (Traditional) | Taiwan, HK, Macau |
| Japanese (kanji+kana) | Japan |
| Korean (Hangul) | Korea |
| Cyrillic | Russia, Ukraine, Belarus, ... |
| Arabic | MENA region |
| Hebrew | Israel |
| Devanagari | India, Nepal |
| Tamil | India (south), Sri Lanka |

### Stop signs ⭐ classic
- Most countries: red octagon "STOP"
- France: red octagon "STOP"
- Quebec: red octagon "ARRÊT" (only French)
- Israel: hand symbol (no text)
- China: octagon with "停"
- Japan: red **triangle** "止まれ"
- Saudi Arabia: red octagon Arabic + English

### License Plates
| Format | Country |
|--------|---------|
| `AB-1234-CD` blue strip | EU (specific country code) |
| `1ABC234` (CA) | US California |
| `กก-1234` | Thailand |
| `0X-XXX` | Various |

EU plates มี **country code** ตัวซ้าย (D=Germany, F=France, NL=Netherlands)
- ดู Wikipedia "Vehicle registration plates"

### Power Outlets (เห็นใน indoor shots)
- Type A (US, Japan): 2 flat parallel
- Type B (US, Japan): 2 flat + ground
- Type C (EU): 2 round
- Type E/F (EU/RU): 2 round + clip/ground
- Type G (UK, SG, MY, HK): 3 rectangular
- Type I (AU, CN, AR): 2 angled flat

### Sky / Climate
- Tropical green vegetation → Equatorial belt
- Snow → cold region (or alpine)
- Desert → Sahara, Middle East, Australia, US Southwest
- Mediterranean: palm + olive trees → Med coast

### Architecture
- Pagoda → East Asia
- Onion dome → Eastern Orthodox/Russia
- Minaret → Muslim country
- Stilted houses → SE Asia

### Driving Side
- Right-hand drive (drive on left): UK, Japan, Australia, India, Thailand, Malaysia, Indonesia, ...
- Left-hand drive (drive on right): Most of world

ดูป้ายจราจร, รถผ่าน → เร็วในการ narrow

---

## 🌞 Sun Position → Time + Latitude

### Concept
ดวงอาทิตย์มี:
- **Azimuth**: ทิศ (North, East, South, West)
- **Altitude**: สูงจาก horizon

ภาพมีเงา → คำนวณ azimuth ได้
ขนาดเงา + ขนาด object → altitude

### Tools
- **SunCalc.org** ⭐
  - ใส่วันที่ (รู้จาก context หรือ EXIF)
  - ลาก marker → ดู sun position ที่เวลาต่างๆ
  - เปรียบเทียบกับเงาในภาพ → narrow location/time

- **PeakFinder**: match mountain skyline → location

### Workflow
```
1. ภาพมีเงา? → จดทิศและความยาว
2. มี object ที่รู้ขนาด (คน 1.7m, รถ 4m)? → คำนวณ altitude ของดวงอาทิตย์
3. SunCalc → ลองหลายตำแหน่งบน Earth → match
```

---

## 🔍 Specific Tools for Geo Challenges

### GeoGuessr: sister activity
Practice tool สำหรับฝึก geolocation skills
- Free version: 5 rounds/day
- Pro: unlimited

### GeoDetective / GeoSpy
AI-based: upload image → guess location

### GeoHints
geohints.com: guide สำหรับ regional clues

### The Plonk It Guide
plonkit.net: geographic clues compendium

### Mapillary
Like Google Street View แต่ crowdsourced: มี coverage ที่ Google ไม่มี

---

## 🚦 Specific Country Clues (Memorize)

### South-East Asia
| Country | Clue |
|---------|------|
| Thailand | ป้าย Thai script, ขับซ้าย, รถสามล้อ tuk-tuk |
| Vietnam | Latin with diacritics, scooter เยอะ, ขับขวา |
| Cambodia | Khmer script, ขับขวา |
| Indonesia | Bahasa, ขับซ้าย, mosque |
| Philippines | English+Tagalog, jeepney, ขับขวา |
| Malaysia | Malay (Latin) + Chinese, ขับซ้าย |
| Singapore | English, modern, ขับซ้าย, "Lion city" plates |

### EU
- Yellow/black plates → NL
- Yellow front plate → UK
- Bilingual signs → Belgium, Switzerland, Wales
- Bollards (street barriers): style varies

### USA Regions
- Highway shield shape (interstate, US route, state)
- License plate background
- Architecture (adobe = SW, brownstone = NE)
- Regional flora

### Russia / CIS
- Cyrillic
- Blue/white road signs
- Lada cars
- Specific architecture (panel buildings)

---

## 🔐 Privacy of Geo Metadata

ภาพที่ถูก upload ไป:
- **WhatsApp, Signal**: strips EXIF
- **Telegram**: strips EXIF
- **Discord**: strips EXIF
- **Twitter/X**: strips most EXIF
- **Facebook/Instagram**: strips EXIF
- **Direct upload (own server, email attachment)**: keeps EXIF
- **Reddit**: strips EXIF (modern)

→ ใน CTF ถ้าได้ภาพ "raw": มักมี EXIF → check first

---

## 🛠 Practical Geo Workflow

### Stage 1: Quick Wins (60 seconds)
```bash
exiftool image.jpg | grep -i gps        # GPS in EXIF
exiftool image.jpg                       # Camera/Software clues
```

Reverse search (Yandex first)

### Stage 2: Coarse Localization (5 min)
- Country/region from:
  - ภาษา
  - License plates
  - Outlets (indoor)
  - Stop signs
  - Driving side
  - Climate / vegetation

→ narrow to country/state

### Stage 3: Fine Localization (30 min)
- Distinctive features:
  - Mountains skyline → PeakFinder
  - ชื่อร้าน, ป้ายธุรกิจ → Google Maps text search ใน region
  - ป้ายถนน with names
  - Bus number / public transit specific

→ Google Maps Satellite + Street View match

### Stage 4: Time of Day (advanced)
- Sun shadow + SunCalc

---

## 🎯 ตัวอย่าง CTF Challenge

### Challenge: "Where is this taken?"
1. ภาพมี:
   - Asian script ที่ดูเหมือน Thai
   - รถสามล้อ
   - ขับซ้าย
   - ป้ายร้าน "ก๋วยเตี๋ยวลุงสมศักดิ์"
   - mountains in background
2. → Thailand, ภาคเหนือ
3. Google search ร้าน "ก๋วยเตี๋ยวลุงสมศักดิ์ ชื่อจังหวัด"
4. → ระบุ exact street → flag = lat/lng

---

## 📚 Daily Practice

- **GeoGuessr**: 5 round/day ฟรี
- **GeoHints**: region facts
- **Plonkit**: country guides
- **r/geoguessr** Reddit: community

ทุกวัน 30 นาที → 6 เดือน → master

---

## 🔗 ที่เกี่ยวข้อง

- [OSINT-Advanced](OSINT-Advanced.md)
- [../02-Reconnaissance/OSINT-Techniques](../02-Reconnaissance/OSINT-Techniques.md)
- [Image metadata](../07-Forensics/Forensics-Intro.md)

## 📚 References

- geohints.com
- plonkit.net
- bellingcat.com (investigation case studies)
- traceLabs

---

#ctf #osint #geolocation
