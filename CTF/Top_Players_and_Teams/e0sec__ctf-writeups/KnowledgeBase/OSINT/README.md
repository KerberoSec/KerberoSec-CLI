# OSINT Roadmap: Full Surface

**e0 Security** · Full methodology by artifact type: IMINT · GEOINT · SOCMINT · TECHINT. Passive-first discipline across every surface.

`● PASSIVE FIRST` · `NIST 800-53` · `SOC 2 TYPE II` · `MITRE ATT&CK v14`

## Table of Contents

- [Universal Principles](#universal-principles)
- [01. Username / Handle](#01-username--handle)
- [02. Email Address](#02-email-address)
- [03. Phone Number](#03-phone-number)
- [04. Image / Photo: IMINT](#04-image--photo--imint)
- [05. Audio File: Technical Analysis](#05-audio-file--technical-analysis)
- [06. Video File](#06-video-file)
- [07. Domain / Website](#07-domain--website)
- [08. IP Address](#08-ip-address)
- [09. Geolocation: GEOINT](#09-geolocation--geoint)
- [10. Documents / Files: Metadata](#10-documents--files--metadata)
- [11. Social Media: Deep Investigation](#11-social-media--deep-investigation)
- [12. Infostealer Intelligence: Hudson Rock](#12-infostealer-intelligence--hudson-rock)
- [13. Master Tool Stack](#13-master-tool-stack)
- [14. Investigation Decision Tree](#14-investigation-decision-tree)

---

## Universal Principles

Run before anything.

- **Passive first.** Exhaust all passive methods before any active query. Active interaction leaves traces.
- **OPSEC always.** Sock puppet accounts, VPN + Tor for sensitive lookups. Never your real IP against a target.
- **Document everything.** Screenshot + URL + timestamp every artifact. Hash downloaded files immediately with `sha256sum`.
- **Maintain evidence chain.** Note what led to what. Tools: CherryTree, Obsidian, Hunchly, or Maltego for link analysis.
- **Workflow order:** (1) Passive: no contact with target systems. (2) Semi-passive: queries that may appear in logs. (3) Active: last resort.
- **Dedicated browser profile.** No personal cookies, no autofill, no logged-in accounts tied to real identity.

---

## 01. Username / Handle

`Passive` `Semi-Active`

### Phase 1: Existence Check

```bash
# Username presence across platforms
Sherlock:    sherlock <username>
Maigret:     python3 -m maigret <username> --all-sites
WhatsMyName: https://whatsmyname.app
Namechk:     https://namechk.com
```

> Note: after `pip install sherlock-project`, the command is `sherlock <username>` (or `python3 -m sherlock_project <username>`), not `python3 sherlock <username>`.

### Phase 2: Google Dorking

```
# Exact handle
"<username>"

# Platform scoped
site:reddit.com "<username>"

# Cross-platform exclusion
"<username>" -site:twitter.com -site:instagram.com

# Email hints
"<username>" "@gmail.com" OR "@protonmail.com"

# Real name correlation
"<username>" "first last"

# Paste sites
site:pastebin.com "<username>"
```

### Phase 3: Breach Data

```
HaveIBeenPwned: https://haveibeenpwned.com
Dehashed:       https://dehashed.com (paid, plaintext)
IntelX:         https://intelx.io
LeakCheck:      https://leakcheck.io

# Hudson Rock: infostealer compromise check
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-username?username=<user>
```

### Phase 4: Social Graph

```
Twitter/X:   Nitter (see note below), advanced search operators
             from:<user> since:2020-01-01 until:2024-01-01
Reddit:      https://camas.unddit.com (full history)
Instagram:   pip install instaloader
             instaloader --login=<sock> <username>
TikTok:      Tikhub API, snscrape
LinkedIn:    site:linkedin.com/in "<username>"
```

### Phase 5: Username → Email Pivot

```
Hunter.io    → email discovery by name/domain
Phonebook.cz → bulk email/domain lookup
Skymem       → email archiver
EmailHippo   → deliverability validation
# Try username prefix as email local-part
```

---

## 02. Email Address

`Passive` `Technical`

### Phase 1: Validation & Breach Check

```
EmailHippo:     https://tools.emailhippo.com
HaveIBeenPwned: https://haveibeenpwned.com
Dehashed:       https://dehashed.com
IntelX:         https://intelx.io

# Gravatar lookup: often returns profile photo
echo -n "email@domain.com" | md5sum
# → https://gravatar.com/<md5_hash>
```

### Phase 2: Dorking

```
# Exact match
"email@domain.com"

# Forum/community posts
"email@domain.com" site:forum* OR site:community*

# Git commit history
"email@domain.com" site:github.com

# Paste sites
site:pastebin.com "email@domain.com"
```

### Phase 3: Header Analysis (if email received)

```
# Open full headers in mail client
# Extract key fields:
Received:          → originating IP
X-Originating-IP:  → sender device IP
X-Mailer:          → email client/version
Date:               → timezone offset → location hint

# Parse online
MXToolbox: https://mxtoolbox.com/EmailHeaders.aspx
```

### Phase 4: SMTP Verification

```
# Manual SMTP probe
telnet mail.domain.com 25
EHLO test.com
MAIL FROM:<verify@test.com>
RCPT TO:<target@domain.com>
# 250 = valid | 550 = invalid
# Note: many servers block this now
```

### Phase 5: Infostealer Intel (Hudson Rock)

```
# Search by email
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-email?email=<email>

# Search by domain (org-wide exposure)
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-domain?domain=<domain>

# Key response fields
date_compromised   → timeline anchor
malware_family     → Redline / Raccoon / Vidar / etc.
credentials[].url  → compromised services
antiviruses        → what failed to catch it
computer_name      → device identifier
```

### Phase 6: Email → Username Pivot

```
# Extract email local-part (prefix)
user@domain.com → user

# Run prefix through full username chain
sherlock "user"
python3 -m maigret "user" --all-sites

# Check variations
user → user123, user_, _user, userXX
```

---

## 03. Phone Number

`Passive`

### Phase 1: Carrier & Format

```
Numverify:         https://numverify.com
FreeCarrierLookup: https://freecarrierlookup.com
# Normalize to E.164: +1-555-867-5309
```

### Phase 2: Reverse Lookup

```
Truecaller:  https://truecaller.com/search/us/<number>
Sync.me:     https://sync.me
SpyDialer:   https://www.spydialer.com
Whitepages:  https://www.whitepages.com/reverse-phone

# Google dork both formatted variants
"555-867-5309" OR "5558675309" OR "+15558675309"
```

### Phase 3: Platform Pivot

```
WhatsApp:  Add to contacts → profile photo, status, last seen
Telegram:  @username search if number linked to account
Signal:    Registration check (limited visible info)
# Truecaller crowdsource name → run name through OSINT chain
```

### Phase 4: Breach Data

```
Dehashed: search phone number field
IntelX:   https://intelx.io → phone search

# Hudson Rock IP endpoint for associated device
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-ip?ip=<x.x.x.x>
```

---

## 04. Image / Photo: IMINT

`IMINT` `GEOINT` `Passive`

### Phase 1: Reverse Image Search (run all simultaneously)

```
Google Images: images.google.com → upload or paste URL
TinEye:        https://tineye.com (best for exact duplicates)
Yandex:        https://yandex.com/images (best for faces)
Bing Visual:   https://www.bing.com/visualsearch
PimEyes:       https://pimeyes.com (facial recognition, paid)
```

### Phase 2: Metadata Extraction

```
exiftool image.jpg

# Key fields to extract:
GPS Latitude/Longitude → Google Maps pin → Street View
DateTimeOriginal       → cross-reference claimed timeline
Make / Model           → device corroboration
Software               → Photoshop version → manipulation flag
Artist / Author        → identity pivot

# Web UI alternative
http://exif.regex.info/exif.cgi
```

### Phase 3: Visual Geolocation (no GPS)

```
# Methodology: narrow iteratively
1. Vegetation type   → climate zone
2. Architecture      → regional style
3. Signage language  → country/region
4. Vehicle plates    → jurisdiction format
5. Power lines       → country-specific config
6. Road markings     → left/right-hand traffic

# Sun angle analysis
Shadow direction + angle → https://www.suncalc.org
Input: estimated location + date → verify time of day

# Ground truth confirmation
Google Street View → drag Pegman to candidate coords
Mapillary:  https://www.mapillary.com
KartaView:  https://kartaview.org
```

### Phase 4: Manipulation Detection

```
Forensically:  https://29a.ch/photo-forensics
# → Error Level Analysis (ELA)
# → Clone detection
# → Metadata viewer

FotoForensics: https://fotoforensics.com
Izitru:        https://www.izitru.com
```

### Phase 5: Face → Identity

```
PimEyes:   https://pimeyes.com → match → reverse image those results
GeoSpy.ai: AI-based image geolocation
Yandex:    Strongest facial matching of free tools

# Workflow: face match → profile photo → username → OSINT chain
```

---

## 05. Audio File: Technical Analysis

`Technical` `IMINT`

### Phase 1: Metadata Extraction

```
exiftool audio.mp3
# ID3 tags: artist, album, recording software, timestamps, GPS

mediainfo audio.mp3
# Codec, bitrate, encoding library, creation date
```

### Phase 2: FFmpeg Analysis

```bash
# Full metadata dump
ffmpeg -i audio.mp3 -f ffmetadata metadata.txt

# Detailed stream info (JSON)
ffprobe -v quiet -print_format json -show_format -show_streams audio.mp3

# Convert for analysis tools
ffmpeg -i audio.mp3 -ar 44100 -ac 1 output.wav

# Extract audio from video
ffmpeg -i video.mp4 -vn -acodec copy audio.aac

# Detect silence / edited gaps
ffmpeg -i audio.mp3 -af silencedetect=noise=-30dB:d=0.5 -f null - 2>&1 | grep silence

# Convert to WAV for Sonic Visualiser
ffmpeg -i audio.mp3 -f wav output.wav
```

### Phase 3: Spectral Analysis

```
Sonic Visualiser: https://www.sonicvisualiser.org
# Spectrogram → background noise signatures
# ENF analysis: Electrical Network Frequency
# ENF embeds power grid freq (50Hz EU / 60Hz US)
# ENF database match → timestamp + geography

Audacity:
# Analyze → Plot Spectrum
# Identify HVAC, machinery, mains hum (50/60Hz)
# Noise floor → mic/room fingerprint
```

### Phase 4: Background Noise Intel

```
Church bells    → bell pattern → church location
Train sounds    → route/schedule databases
Aircraft        → FlightAware historical + timestamp
Music playing   → Shazam / AcoustID → release date
Bird calls      → https://xeno-canto.org → geographic range
Language/accent → region narrowing
```

### Phase 5: Voice Analysis

```
# Speaker diarization
pip install pyannote.audio
# → Number of speakers, separate tracks

# Formant analysis (accent region)
PRAAT: https://www.fon.hum.uva.nl/praat/

# Deepfake / AI voice detection
AIVoiceDetector: https://aivoicedetector.com
Resemble Detect: https://lipsync.com/detect
# Synthetic voices → unnatural formant transitions
# Visible in Sonic Visualiser spectrogram
```

---

## 06. Video File

`IMINT` `GEOINT` `Technical`

### Phase 1: Metadata

```
exiftool video.mp4
mediainfo video.mp4
ffprobe -v quiet -print_format json -show_format -show_streams video.mp4
```

### Phase 2: Frame Extraction

```bash
# Extract keyframes (I-frames only)
ffmpeg -i video.mp4 -vf "select=eq(pict_type\,I)" -vsync vfr frame_%04d.png

# 1 frame per second
ffmpeg -i video.mp4 -vf fps=1 frame_%04d.png

# Specific timestamp
ffmpeg -i video.mp4 -ss 00:01:23 -vframes 1 frame_at_83s.png
```

### Phase 3: Frame Analysis Pipeline

```
# Each extracted frame → run full IMAGE chain (Section 04)
→ Reverse image search
→ ExifTool on the frame
→ Visual geolocation from content
→ Face detection → identity pivot
```

### Phase 4: Shadow / Sun Analysis

```
1. Extract frame with visible shadow
2. Measure shadow angle relative to object
3. SunCalc.org → input estimated location
4. Iterate latitude until sun elevation matches
→ Narrows latitude band to ±5° typically
→ Cross with known date for time-of-day confirmation
```

### Phase 5: Deepfake Detection

```
Sensity.ai:        https://sensity.ai
InVID / WeVerify:  https://weverify.eu
Microsoft VFAD:    Video Forensics Active Defense
FakeCatcher:       Intel frame-by-frame rPPG analysis
```

---

## 07. Domain / Website

`Passive` `Technical`

### Phase 1: Registration Data

```
whois domain.com
https://lookup.icann.org

# Historical WHOIS
Whoisology:  https://whoisology.com
DomainTools: https://domaintools.com (paid)

# Domain age → Creation Date field
```

### Phase 2: DNS Enumeration

```bash
# Basic records
dig domain.com ANY
dig domain.com MX
dig domain.com TXT    # SPF, DMARC, verification tokens
dig domain.com NS

# Subdomain enumeration (passive)
subfinder -d domain.com
amass enum -passive -d domain.com

# Certificate transparency
https://crt.sh/?q=%25.domain.com

# Shodan subdomain
hostname:domain.com

# Historical DNS
SecurityTrails: https://securitytrails.com
PassiveDNS:     https://passivedns.cn
```

### Phase 3: IP Investigation

```
dig +short domain.com  # get IP

Shodan:    shodan host <IP>
Censys:    https://search.censys.io
AbuseIPDB: https://www.abuseipdb.com
IPinfo:    https://ipinfo.io/<IP>
ViewDNS:   https://viewdns.info/reverseip/
```

### Phase 4: Content Analysis

```
Wayback Machine: https://web.archive.org/web/*/domain.com
# Historical content, removed pages, old contact info

Google cache: cache:domain.com

BuiltWith:   https://builtwith.com (tech stack)
Wappalyzer:  browser extension for live detection
```

### Phase 5: Google Dorking

```
site:domain.com filetype:pdf
site:domain.com inurl:admin
site:domain.com "index of"
site:domain.com ext:sql OR ext:bak OR ext:log
site:domain.com "internal" OR "confidential"
link:domain.com -site:domain.com  # who links to them
```

### Phase 6: SSL/TLS Certificate

```
crt.sh: Historical certs → subdomains → org name
# Subject Alt Names → additional domains
SSLShopper: https://www.sslshopper.com/ssl-checker.html
```

---

## 08. IP Address

`Passive` `Technical`

### Phase 1: Basic Enrichment

```bash
curl https://ipinfo.io/<IP>/json
# Returns: org, city, region, country, ASN, hostname

IPStack: https://ipstack.com
MaxMind: https://www.maxmind.com/en/geoip-demo
ASN:     curl https://ipinfo.io/<IP>/org
```

### Phase 2: Shodan / Censys

```
shodan host <IP>
shodan search "net:<CIDR>"

# Key Shodan output fields:
Open ports + services    → attack surface
Banner text              → software versions
Historical data tab      → what was running before
Vulnerabilities tab      → CVE correlation (Shodan Plus)

Censys: https://search.censys.io/hosts/<IP>
```

### Phase 3: Passive DNS

```
SecurityTrails: https://securitytrails.com
RiskIQ:         Microsoft Defender TI
DNSDB:          https://www.dnsdb.info
# What domains have resolved to this IP historically?
```

### Phase 4: Threat Intel Cross-Reference

```
VirusTotal:     https://virustotal.com/gui/ip-address/<IP>
OTX AlienVault: https://otx.alienvault.com/indicator/ip/<IP>
IBM X-Force:    https://exchange.xforce.ibmcloud.com
AbuseIPDB:      https://www.abuseipdb.com

# Hudson Rock IP lookup
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-ip?ip=<x.x.x.x>
```

---

## 09. Geolocation: GEOINT

`GEOINT` `IMINT`

### Phase 1: Coordinate Enrichment (have GPS)

```
Google Maps:   paste coords directly
Google Earth:  historical imagery timeline slider
What3Words:    https://what3words.com
Sentinel Hub:  https://www.sentinel-hub.com
Planet Labs:   https://www.planet.com (near-daily commercial)
```

### Phase 2: Visual Geolocation Methodology

```
# Iterative narrowing: macro to micro
1. Continent:     vegetation, architecture style
2. Country:       language, license plates, currency, road markings
3. City:          skyline, landmarks, transit branding
4. Neighborhood:  street signs, business names → Maps search
5. Confirm:       Street View match at candidate coords

Mapillary: https://www.mapillary.com
KartaView: https://kartaview.org
Overpass:  https://overpass-turbo.eu (query OSM data)
```

### Phase 3: Satellite / Aerial Analysis

```
Google Earth Pro: Free: history back to 1984
  File → Show Historical Imagery → timeline slider

Sentinel-2: 10m resolution, free, ESA
  https://apps.sentinel-hub.com/eo-browser/

Bing Maps:          Often higher res than Google in rural areas
USGS EarthExplorer: https://earthexplorer.usgs.gov (Landsat, free, historical)
```

### Phase 4: Shadow-Based Geolocation

```
# Given: image with shadow + approximate date
1. Measure shadow length relative to object height
2. Calculate sun elevation: arctan(height/shadow_length)
3. SunCalc: https://www.suncalc.org
4. Vary latitude until elevation matches at that date
→ Narrows latitude band to ±5° typically
```

### Phase 5: Flight / Vessel Correlation

```
# Aircraft overhead
FlightRadar24:  https://www.flightradar24.com
ADS-B Exchange: https://globe.adsbexchange.com (unfiltered)
Historical ADS-B: History tab → match timestamp to image

# Vessel tracking
MarineTraffic: https://www.marinetraffic.com
VesselFinder:  https://www.vesselfinder.com
```

---

## 10. Documents / Files: Metadata

`Technical` `Passive`

### Phase 1: Universal Metadata Extraction

```bash
exiftool document.pdf
exiftool -csv *.docx > metadata_batch.csv
exiftool -r /directory > recursive_extract.txt
```

Key fields:

```
Author / Creator  → real name → identity pivot
Last Modified By  → collaboration chain
Software          → version → org-standard build
Template path     → UNC path → internal server name
Creation datetime → timezone offset → location hint
Company field     → org affiliation
```

### Phase 2: Format-Specific Tools

```bash
# PDF
pdfinfo document.pdf
python pdfid.py document.pdf
python pdf-parser.py document.pdf
binwalk document.pdf  # embedded objects

# DOCX/XLSX/PPTX: they're ZIP containers
unzip -o document.docx -d extracted/
cat extracted/docProps/core.xml   # author, dates
cat extracted/docProps/app.xml    # company, version
grep -r "http" extracted/         # external links
```

### Phase 3: Hidden Data Detection

```bash
# Steganography
steghide info image.jpg
zsteg image.png
stegoveritas image.jpg

# PDF hidden layers
# Unlock layers in Acrobat/Okular → hidden text

# Word: track changes
# Accept all changes → reveals deleted content
# Comments → author names, timestamps
```

---

## 11. Social Media: Deep Investigation

`Passive` `Semi-Active`

### Twitter / X

```
# Advanced search operators
from:<user> since:2020-01-01 until:2024-01-01
from:<user> geocode:lat,lng,radius
from:<user> filter:media

Nitter: https://nitter.net/<username>: no account needed, but see note below

Twint (archived, unmaintained since API v1.1 shutdown):
  pip install twint
  twint -u <username> --since 2020-01-01 -o output.json --json

# First tweet finder
https://www.firsttweet.info

# Deleted tweets
Wayback Machine + Politwoops
```

> **Nitter caveat:** it's not dead, but it's unstable. X now requires authenticated account pools for most requests, so any given public instance can go down without warning. Check a live instance-status page (e.g. `status.d420.de`) before relying on a specific instance, or self-host.

### Reddit

```
# Full comment history including deleted
https://camas.unddit.com

# Deleted posts/comments
https://www.unddit.com/u/<username>

# Cross-reference username through OSINT chain
```

> **Pushshift caveat:** Reddit revoked general Pushshift API access in May 2023. What remains is a moderator-only program restricted to moderation purposes: no public historical research access. For deleted-post recovery today, use an alternative such as PullPush or Arctic Shift instead of assuming Pushshift access.

### Instagram

```
pip install instaloader
instaloader <username>
instaloader --login=<sock_account> <username>
# Private profiles need authenticated sock

# EXIF sometimes survives on older posts
# Location tags → coordinates → GEOINT chain
# Tagged users → social graph expansion
```

### Facebook

```
# Graph search
https://www.facebook.com/search/top/?q=<query>

# Phone number lookup
Add to contacts → check Messenger

# Photos of → identity corroboration
# Friends list → social graph
```

### LinkedIn

```
site:linkedin.com/in "<name>" "<company>"

# Org chart mapping
Employee list → org structure → reporting chain

# Employment history
Timeline → corroborate claimed employment dates

# Skills endorsements → colleague social graph
```

---

## 12. Infostealer Intelligence: Hudson Rock

`Technical` `Passive`

### API Endpoints: Cavalier OSINT Tier

*(Verified against Hudson Rock's live documentation.)*

```
# Search by email
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-email?email=<email>

# Search by domain (org-wide exposure check)
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-domain?domain=<domain.com>

# Search by IP
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-ip?ip=<x.x.x.x>

# Search by username
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-username?username=<user>

# URLs by domain (shadow IT discovery)
GET https://cavalier.hudsonrock.com/api/json/v2/osint-tools/urls-by-domain?domain=<domain.com>
```

### Response Fields to Extract

```
date_compromised       → timeline anchor
computer_name          → device identifier
operating_system       → target environment
malware_family         → Redline / Raccoon / Vidar / etc.
antiviruses             → what was running, what failed
credentials[].url      → which services compromised
credentials[].username → account identifiers
credentials[].password → paid Cavalier tier
```

### Pivot Chain from Results

```
malware_family      → TTPs → MITRE ATT&CK mapping
date_compromised    → cross-reference breach timelines
credentials[].url   → domain OSINT chain (Section 07)
computer_name        → hostname → internal network hints
antiviruses          → AV evasion context for that family
```

### Companion Tools

```
IntelX:    https://intelx.io    corroborate findings
Dehashed:  https://dehashed.com plaintext dump cross-ref
LeakCheck: https://leakcheck.io breach correlation
Flare.io:  dark web stealer log monitoring (paid)
```

---

## 13. Master Tool Stack

| Category  | Tool             | Purpose                                | Install / URL                       |
|-----------|------------------|-----------------------------------------|--------------------------------------|
| Framework | Maltego          | Link analysis, entity graphs           | maltego.com                          |
| Framework | SpiderFoot       | Automated OSINT framework              | `pip install spiderfoot`             |
| Framework | Recon-ng         | Modular web recon                      | `pip install recon-ng`               |
| Identity  | Sherlock         | Username across 300+ platforms         | `pip install sherlock-project`       |
| Identity  | Maigret          | Username + site profiling              | `pip install maigret`                |
| Identity  | Holehe           | Email → registered accounts            | `pip install holehe`                 |
| Search    | Shodan           | Internet-connected device search       | `pip install shodan`                 |
| Search    | Censys           | Certificate + host search              | search.censys.io                     |
| Search    | ZoomEye          | Cyberspace mapping                     | zoomeye.org                          |
| DNS       | Subfinder        | Passive subdomain enumeration          | `go install subfinder`               |
| DNS       | Amass            | Attack surface mapping                 | `go install amass`                   |
| Media     | ExifTool         | Universal metadata extraction          | `apt install libimage-exiftool-perl` |
| Media     | FFmpeg           | Audio/video analysis + conversion      | `apt install ffmpeg`                 |
| Media     | Sonic Visualiser | Audio spectral analysis, ENF           | sonicvisualiser.org                  |
| Media     | Audacity         | Audio editing + analysis               | audacityteam.org                     |
| Image     | TinEye           | Reverse image, exact duplicates        | tineye.com                           |
| Image     | PimEyes          | Facial recognition search              | pimeyes.com                          |
| Image     | Forensically     | Image manipulation detection           | 29a.ch/photo-forensics               |
| GEOINT    | Google Earth Pro | Historical satellite imagery           | earth.google.com                     |
| GEOINT    | SunCalc          | Sun angle + shadow analysis            | suncalc.org                          |
| GEOINT    | Sentinel Hub     | ESA satellite imagery                  | sentinel-hub.com                     |
| Breach    | Hudson Rock      | Infostealer compromise intel           | cavalier.hudsonrock.com              |
| Breach    | Dehashed         | Breach data + plaintext                | dehashed.com                         |
| Breach    | IntelX           | Dark web + breach search               | intelx.io                            |
| Docs      | CherryTree       | Hierarchical evidence notes            | giuspen.net/cherrytree               |
| Docs      | Hunchly          | Auto-capture browser evidence          | hunch.ly                             |

---

## 14. Investigation Decision Tree

**▸ Got an artifact? Start here.**

| Artifact    | Pivot chain |
|-------------|-------------|
| USERNAME    | Sherlock → Breach data → Social graph → Email pivot → Username chain |
| EMAIL       | Breach check → Gravatar (face) → Header analysis → Hudson Rock → Username pivot |
| PHONE       | Carrier lookup → Truecaller → WhatsApp/Telegram → Social platform pivot |
| IMAGE       | ExifTool (GPS?) → Reverse image → Visual geolocation → Face search → identity |
| AUDIO       | ffprobe metadata → Spectral analysis → ENF → Background sounds → Voice analysis |
| VIDEO       | ffprobe → Frame extraction → IMAGE chain per frame → Shadow analysis |
| DOMAIN      | WHOIS → DNS enum → IP chain → Wayback → Dorking → Cert transparency |
| IP          | Shodan → Passive DNS → Threat intel → ASN → Reverse IP → Hudson Rock |
| DOCUMENT    | ExifTool → Author → Company → Template UNC path → Identity chain |
| COORDINATES | Google Earth (history) → Satellite → Street View confirm → Flight/vessel correlation |

**▸ Pivot chain: all bidirectional**

```
Username ⟷ Email ⟷ Phone ⟷ Real Name ⟷ Address ⟷ Social Graph ⟷ Employer ⟷ Associates ⟷ IP / Domain ⟷ Breach Data
```

---

*OSINT Roadmap: e0 Security · Passive-first methodology reference.*
