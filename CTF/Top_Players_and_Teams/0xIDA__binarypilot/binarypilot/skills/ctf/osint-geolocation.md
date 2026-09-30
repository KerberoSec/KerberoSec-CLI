---
name: osint-geolocation
description: "CTF OSINT geolocation and media analysis. Reverse image search (Google Lens crop, Yandex for faces, Baidu for China), MGRS military grid coordinate conversion, Google Plus Codes (XXXX+XX format), metadata extraction with exiftool, VGA signal analysis, Google Street View panorama matching with ORB feature detection, road sign language analysis (Kanji=Japan, Cyrillic=Russia), post-Soviet architecture brand identification, IP geolocation with ip-api, Google Lens cropped region search, reflected mirrored text reading, What3Words 3-meter precision, Overpass Turbo spatial queries for POI discovery. Triggers: 'geolocation ctf', 'reverse image search', 'osint location', 'mgrs coordinates', 'google plus codes', 'what3words', 'street view matching', 'overpass turbo', 'metadata exif', 'road sign identification', 'osint image analysis'."
---

# CTF OSINT: Geolocation & Media Analysis

Reverse image search, coordinate systems, Street View, Overpass Turbo.

---

## Phase 1: Image Analysis Checklist

```bash
# Metadata extraction:
exiftool image.jpg           # EXIF: GPS, camera, timestamp
pdfinfo document.pdf         # PDF metadata
mediainfo video.mp4          # Video metadata

# Visual stego check:
# Always view at full resolution: check ALL corners/edges
# Look for black-on-dark or white-on-light tiny text
# Twitter strips EXIF on upload; Tumblr preserves more in avatars
```

---

## Phase 2: Reverse Image Search Strategy

| Tool | Best for |
|------|----------|
| Google Lens (crop first) | Landmarks, shops, signs: crop to specific feature |
| Google Images | Most comprehensive |
| TinEye | Exact match |
| Yandex | Faces, Eastern Europe |
| Baidu / graph.baidu.com | Chinese locations, simplified Chinese text |
| Bing Visual Search | General |

**Key technique:** Always crop to just the distinctive element before searching. Full scene → generic results. Cropped shop sign → exact business with address.

---

## Phase 3: Coordinate Systems

### MGRS (Military Grid Reference System)

```text
# Format example: "4V FH 246 677"
# Convert online: mgrs.com/convert → lat/long → Google Maps
# Identification: grid-based military coordinates with letter+number combo
```

### Google Plus Codes

```text
# Format: XXXX+XX (short) or 8FVC9G8F+6W (full)
# Characters: 23456789CFGHJMPQRVWX (no vowels/confusion chars)
# Resolution: ~14m x 14m standard, higher precision with more chars

# Generate: Google Maps → click pin → Plus Code in details panel
# Or enter coordinates in search bar → code appears in results
# API (requires key): GET https://maps.googleapis.com/maps/api/geocode/json?address=PLUS+CODE
```

### What3Words (3-meter precision)

```python
# Format: word1.word2.word3
# Adjacent squares have COMPLETELY different addresses (no spatial correlation)
# Website: https://what3words.com

# Workflow:
# 1. Identify location via geolocation techniques
# 2. Get precise GPS from Google Maps satellite view
# 3. Enter coordinates at what3words.com → get 3-word address
# 4. Fine-tune: shift by small amounts, try 5-10 adjacent squares

# Common pitfalls:
# - 3m precision matters: building entrance vs. parking lot differ
# - Camera position vs. subject: W3W refers to WHERE camera IS
# - Match exact viewpoint of the photo, not just the landmark

python3 -c "
from PIL import Image
img = Image.open('input.jpg')
img.transpose(Image.FLIP_LEFT_RIGHT).save('flipped.jpg')
"
# Reflected text (water/glass): flip horizontally, then read
```

---

## Phase 4: Street View Panorama Matching

```python
import cv2
import numpy as np

# Feature matching challenge vs candidate panoramas:
challenge = cv2.imread('challenge.jpg')
candidate = cv2.imread('panorama.jpg')

orb = cv2.ORB_create(nfeatures=5000)
kp1, des1 = orb.detectAndCompute(challenge, None)
kp2, des2 = orb.detectAndCompute(candidate, None)

bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
matches = bf.match(des1, des2)
score = sum(1 for m in matches if m.distance < 50)
print(f"Match score: {score}")
```

```bash
# Street View metadata API:
# GET https://maps.googleapis.com/maps/api/streetview/metadata?location=LAT,LNG&key=KEY

# Road sign language identification:
# Kanji + blue highway signs → Japan
# Cyrillic + wide boulevards → Russia/CIS
# White X crossing signs → Canada
# Yellow diamond warning signs → USA/Canada
# Green autobahn signs → Germany
# Left-hand traffic → UK, Japan, Australia, India
```

---

## Phase 5: Country Identification Shortcuts

| Visual Feature | Country/Region |
|---|---|
| Kanji + blue highway signs | Japan |
| Cyrillic + wide boulevards | Russia/CIS |
| White X-shape crossing signs | Canada |
| Yellow diamond warning signs | USA/Canada |
| Green autobahn signs | Germany |
| Brown tourist signs | France |
| Bollards with red reflectors | Netherlands |
| Panel apartment blocks + Cyrillic | Post-Soviet |
| Blue license plates | EU countries |

**Post-Soviet recognition chain:**
1. Brutalist concrete buildings
2. Reverse image search vehicle models → Russian/CIS market
3. Cyrillic script confirms Russian-language region
4. Regional flags alongside national tricolor
5. Named restaurants/chains → search "brand + locations"

---

## Phase 6: Overpass Turbo Spatial Queries

```text
[out:json][timeout:25];
{{geocodeArea:Barcelona}}->.searchArea;

(
  node["railway"="subway_entrance"](area.searchArea);
)->.metros;

(
  node(around.metros:10)["shop"~"newsagent|kiosk"];
  way(around.metros:10)["shop"~"newsagent|kiosk"];
);

out body;>;out skel qt;
```

```text
# Common OSM tags:
# shop: newsagent, kiosk, bakery, supermarket
# amenity: cafe, restaurant, bank, atm, pharmacy
# tourism: hotel, attraction, museum, viewpoint
# railway: station, subway_entrance, halt

# Hotels near coordinate:
node(around:200,48.8566,2.3522)["tourism"="hotel"];
```

**Tool:** https://overpass-turbo.eu/

---

## Phase 7: IP Geolocation

```bash
# Free, no API key:
curl "http://ip-api.com/json/103.150.68.150"
curl "https://ipinfo.io/103.150.68.150/json"

# Windows telemetry imprbeacons.dat contains CIP field (IP of device)
# Correlate with login history for attribution
```

---

## Phase 8: Photo Verification via Google Maps Photos

```bash
# When reverse image search fails (original photo):
# 1. Identify candidate location name via non-visual OSINT
#    (Strava GPS, social media, address research)
# 2. Search location on Google Maps → Photos tab
# 3. Compare user-submitted images against challenge image
# 4. Match scene elements: buildings, trees, paths, signage

# Micro-landmark matching:
# Utility poles, pathway rocks, bollards, planters
# Find same features in Street View → pinpoint exact 3m square
```

---

## Output

Save to `.omop/engagement/ctf/osint/`:
- `location.txt`: identified coordinates or address
- `flag.txt`: W3W / Plus Code / MGRS answer

## Next Phase

→ `ctf-osint-web` for username/email/domain OSINT
→ `ctf-osint-social` for social media investigation
