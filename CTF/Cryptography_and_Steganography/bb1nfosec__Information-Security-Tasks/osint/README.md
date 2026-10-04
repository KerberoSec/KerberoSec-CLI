# OSINT

> Open-Source Intelligence: collecting and analyzing publicly available information.

---

## OSINT Framework

```
Target
  │
  ├── Identity      → Name, aliases, email, phone, social profiles
  ├── Infrastructure → Domains, IPs, ASNs, certificates, cloud assets
  ├── Organization  → Employees, org structure, tech stack, job postings
  └── Physical       → Location, images, metadata, geolocation
```

---

## Email & Identity

```bash
# Verify email exists without sending
holehe target@email.com          # checks 120+ sites for account existence

# Email to social profile
python3 socialscan.py target@email.com

# Breach data lookup
haveibeenpwned.com API:
curl "https://haveibeenpwned.com/api/v3/breachedaccount/user@example.com" \
  -H "hibp-api-key: YOUR_KEY"

# Username across platforms
sherlock targetusername           # 300+ sites
```

---

## Domain & Infrastructure

```bash
# Passive DNS: historical records
curl "https://api.hackertarget.com/hostsearch/?q=example.com"

# Certificate transparency: find subdomains
curl "https://crt.sh/?q=%.example.com&output=json" | jq '.[].name_value' | sort -u

# All subdomains via multiple sources
subfinder -d example.com -silent
amass enum -passive -d example.com

# ASN / IP range of org
whois -h whois.radb.net -- '-i origin AS12345'
bgp.he.net lookup

# Historical WHOIS
viewdns.info/whois/?domain=example.com
domaintools.com

# Web tech stack
whatweb https://example.com
wappalyzer (browser extension)

# Google dorks
site:example.com filetype:pdf
site:example.com inurl:admin
"@example.com" site:linkedin.com
```

---

## Shodan / Attack Surface

```python
import shodan

api = shodan.Shodan("YOUR_API_KEY")

# Search for org's internet-exposed services
results = api.search('org:"Target Company" port:22,3389,8080')
for r in results["matches"]:
    print(r["ip_str"], r["port"], r.get("product",""), r.get("version",""))

# Find exposed cameras
results = api.search('product:"webcam" country:"IN"')

# Exposed databases
results = api.search('product:MongoDB port:27017 -authentication')
```

```bash
# Shodan CLI
shodan search --fields ip_str,port,org "ssl.cert.subject.cn:*.example.com"

# Similar: Censys, FOFA, ZoomEye, Netlas
```

---

## Social Media & People

```bash
# Twitter / X: without API
nitter.net/username           # public profile mirror

# LinkedIn employee enumeration
theHarvester -d example.com -b linkedin

# Facebook / Instagram
osintgram targetusername      # Instagram OSINT tool

# Phone number lookup
phoneinfoga scan -n "+1234567890"

# Image reverse search
# - images.google.com
# - yandex.com/images (best for face search)
# - tineye.com
# - pimeyes.com (face search)
```

---

## Image & Metadata

```bash
# Extract EXIF from image (GPS coords, device, software)
exiftool photo.jpg
exiftool -gps:all photo.jpg

# Strip metadata before publishing
exiftool -all= photo.jpg

# Google Street View timestamp for location verification
# maps.google.com → Street View → drag pegman → check date

# Geolocation from image clues
# - GeoGuessr technique: signs, vegetation, architecture, car plates
# - sun position → timestamp via suncalc.org
# - shadow direction → cardinal orientation
```

---

## Dark Web OSINT

```bash
# Tor-based search
# ahmia.fi: clearnet search for .onion sites
# darksearch.io: dark web search engine

# Leaked credentials
IntelligenceX: intelx.io
Dehashed: dehashed.com

# Paste sites
psbdmp.ws: pastebin dump search
paste.telegrm.io

# Automated monitoring
GitGuardian: monitors GitHub for leaked secrets
TruffleHog: scan repos for secrets
```

---

## OSINT Frameworks & Tools

| Tool | Purpose |
|------|---------|
| [Maltego](https://www.maltego.com) | Visual link analysis, automated transforms |
| [SpiderFoot](https://github.com/smicallef/spiderfoot) | Automated OSINT on domains/IPs/emails |
| [theHarvester](https://github.com/laramies/theHarvester) | Emails, subdomains, IPs from public sources |
| [Recon-ng](https://github.com/lanmaster53/recon-ng) | Web reconnaissance framework |
| [Shodan](https://shodan.io) | Internet-exposed device search |
| [Amass](https://github.com/owasp-amass/amass) | Deep subdomain enumeration |
| [holehe](https://github.com/megadose/holehe) | Email-to-account checker |
| [Sherlock](https://github.com/sherlock-project/sherlock) | Username across 300+ platforms |
| [Phoneinfoga](https://github.com/sundowndev/phoneinfoga) | Phone number reconnaissance |
| [Maigret](https://github.com/soxoj/maigret) | Username profiling across 3000+ sites |

---

## OPSEC for OSINT

- Use a dedicated VM with clean browser profile
- Use a VPN or Tor: your target may log visitors
- Create sock puppet accounts with unique emails
- Never log into personal accounts during an investigation
- `curl` direct vs browser: different fingerprints
