# OSINT

Open Source Intelligence gathering for CTF challenges.

## Quick wins
- Try username pivots first; many CTF personas reuse handles
- If email is available, pivot to breached data/metadata
- Keep an "all-in-one" framework handy for categories you forget
- Check EXIF data on images for GPS coordinates

## Username Hunting

### Tools
- [Sherlock](https://github.com/sherlock-project/sherlock): Hunt usernames across social networks
- [WhatsMyName](https://whatsmyname.app/): Username enumeration
- [Namechk](https://namechk.com/): Check username availability

```bash
# Sherlock usage
python3 sherlock username

# Check specific sites
python3 sherlock username --site twitter --site github
```

## Email Investigation

### Tools
- [Epieos](https://epieos.com/): Email to social accounts
- [Hunter.io](https://hunter.io/): Find company emails
- [Have I Been Pwned](https://haveibeenpwned.com/): Check breach databases

### Email header analysis
```
Received: from mail.example.com
X-Originating-IP: [1.2.3.4]
```

## Image Analysis

### Reverse image search
- [Google Images](https://images.google.com/)
- [TinEye](https://tineye.com/)
- [Yandex Images](https://yandex.com/images/): Often finds more results

### EXIF metadata
```bash
# Extract metadata
exiftool image.jpg

# Look for GPS coordinates
exiftool -gps* image.jpg

# Remove metadata (for opsec)
exiftool -all= image.jpg
```

### Geolocation from images
- Look for: signs, language, architecture, vegetation, sun position
- [GeoGuessr](https://www.geoguessr.com/): Practice
- [Bellingcat OSM Search](https://osm-search.bellingcat.com/)
- [SunCalc](https://www.suncalc.org/): Sun position calculator

## Google Dorking

```
# Limit to domain
site:target.com

# Find specific file types
filetype:pdf confidential
filetype:sql password

# Directory listings
intitle:"index of"

# Admin pages
inurl:admin

# Leaked credentials
"password" filetype:log

# Config files
filetype:env DB_PASSWORD

# Backup files
filetype:bak OR filetype:backup

# Combine operators
site:target.com filetype:pdf intext:confidential
```

## Domain Research

### WHOIS
- [DomainTools](https://whois.domaintools.com/)
- [ICANN Lookup](https://lookup.icann.org/)

```bash
whois example.com
```

### DNS
```bash
# DNS records
dig example.com ANY
nslookup -type=any example.com

# Zone transfer (if allowed)
dig axfr @ns1.example.com example.com

# Subdomain enumeration
subfinder -d example.com
```

### Historical data
- [SecurityTrails](https://securitytrails.com/): DNS history
- [Wayback Machine](https://web.archive.org/): Historical snapshots
- [crt.sh](https://crt.sh/): Certificate transparency logs

## Social Media

### Twitter/X
- Advanced search: `from:username since:2023-01-01 until:2023-12-31`
- Deleted tweets: Wayback Machine

### GitHub
```
# Search in code
password filename:.env
api_key extension:json
```

### LinkedIn
- Use Google: `site:linkedin.com "target company"`

## Phone Numbers

- [PhoneInfoga](https://github.com/sundowndev/phoneinfoga)
- [NumLookup](https://www.numlookup.com/)
- [Truecaller](https://www.truecaller.com/)

## IP/Network

```bash
# IP geolocation
curl ipinfo.io/1.2.3.4

# Shodan search
shodan search "hostname:target.com"
```

### Tools
- [Shodan](https://www.shodan.io/)
- [Censys](https://censys.io/)
- [VirusTotal](https://www.virustotal.com/): IP/domain reputation

## Framework
- [OSINT Framework](https://osintframework.com/): Comprehensive tool collection
- [IntelTechniques](https://inteltechniques.com/tools/): Custom search tools
