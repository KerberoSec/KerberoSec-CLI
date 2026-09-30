---
name: osint-web
description: "CTF OSINT web and DNS investigation. Google dorking, DNS TXT/zone transfer, WHOIS, Wayback Machine CDX API, certificate transparency, OSINT framework. Triggers: 'osint', 'ctf osint', 'google dork', 'dns osint', 'zone transfer', 'whois', 'wayback machine', 'web osint', 'open source intelligence', 'passive recon ctf'."
---

# CTF OSINT: Web & DNS

Google dorking → DNS enumeration → zone transfer → WHOIS → Wayback Machine → CT logs.

---

## Phase 1: Google Dorking

```bash
TARGET="target.com"

# Basic dorks:
# site:$TARGET
# site:$TARGET filetype:pdf OR filetype:doc
# site:$TARGET intext:"password" OR intext:"api_key"
# site:$TARGET inurl:admin
# site:$TARGET -www (find subdomains in Google)
# "target.com" filetype:env OR filetype:cfg OR filetype:conf
# intext:"BEGIN RSA PRIVATE KEY" site:$TARGET
# inurl:".php?id=" site:$TARGET
# cache:$TARGET

# GitHub secrets:
# org:$TARGET password OR secret OR api_key
# org:$TARGET filename:.env
# "$TARGET" password filename:.env

# Paste sites:
# site:pastebin.com $TARGET password
# site:hastebin.com $TARGET
```

---

## Phase 2: DNS Enumeration

```bash
TARGET="target.com"

# Basic lookups:
dig $TARGET ANY
dig $TARGET A
dig $TARGET MX
dig $TARGET NS
dig $TARGET TXT    # SPF, DKIM, verification codes, Google/AWS verification
dig $TARGET CNAME

# TXT records often contain sensitive info:
dig $TARGET TXT | grep -v "^;"
# Look for: v=spf1 (mail infra), google-site-verify (Google services)
# _dmarc.$TARGET, _domainkey.$TARGET (email verification)
# Challenge/verification tokens sometimes contain flag or hints

# Zone transfer (AXFR):
dig @ns1.$TARGET AXFR $TARGET
dig @ns2.$TARGET AXFR $TARGET

# Try each nameserver:
for ns in $(dig $TARGET NS +short); do
  echo "=== Zone transfer from $ns ==="
  dig @$ns AXFR $TARGET
done

# Subzone enumeration:
dig _dmarc.$TARGET TXT
dig mail.$TARGET MX
dig autodiscover.$TARGET CNAME
```

---

## Phase 3: WHOIS & Registrar Info

```bash
TARGET="target.com"

# Domain WHOIS:
whois $TARGET
whois $TARGET | grep -iE "registrar|created|updated|expires|name server|email|phone|address"

# IP WHOIS:
whois $(dig $TARGET A +short | head -1)

# ARIN/RIPE lookup:
curl -s "https://rdap.arin.net/registry/ip/$(dig $TARGET A +short | head -1)"

# Reverse WHOIS (same registrant):
# https://viewdns.info/reversewhois/?q=email@domain.com
```

---

## Phase 4: Wayback Machine

```bash
TARGET="target.com"

# CDX API: list all archived URLs:
curl -s "http://web.archive.org/cdx/search/cdx?url=*.$TARGET&output=json&fl=original&collapse=urlkey" | \
  python3 -c "import json,sys; [print(x[0]) for x in json.load(sys.stdin)]" | head -200

# Find old endpoints, hidden paths, removed pages:
curl -s "http://web.archive.org/cdx/search/cdx?url=$TARGET/*&output=json&fl=original&collapse=urlkey" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data:
    url = item[0]
    if any(x in url for x in ['admin', 'backup', 'login', 'api', '.env', 'config', '.sql', '.zip']):
        print(url)
"

# Snapshot with specific date:
curl -s "https://web.archive.org/web/20230101000000*/$TARGET" | grep -o 'href="[^"]*"'

# Download oldest version:
OLDEST_SNAP=$(curl -s "http://archive.org/wayback/available?url=$TARGET" | python3 -c "import json,sys; print(json.load(sys.stdin)['archived_snapshots']['closest']['url'])")
curl -s "$OLDEST_SNAP"
```

---

## Phase 5: Certificate Transparency

```bash
TARGET="target.com"

# crt.sh (find all SSL certs issued):
curl -s "https://crt.sh/?q=%.$TARGET&output=json" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
names = set()
for entry in data:
    for name in entry.get('name_value', '').split('\n'):
        names.add(name.strip().lstrip('*.'))
for name in sorted(names):
    print(name)
" | grep -v "^*" | sort -u

# Also check with different wildcards:
curl -s "https://crt.sh/?q=%.%.${TARGET}&output=json" | \
  python3 -c "import json,sys; [print(x.get('name_value','')) for x in json.load(sys.stdin)]" | \
  sort -u
```

---

## Phase 6: Email Enumeration

```bash
TARGET="target.com"

# theHarvester:
theHarvester -d $TARGET -b google -l 500
theHarvester -d $TARGET -b linkedin -l 500
theHarvester -d $TARGET -b bing -l 500

# Hunter.io API (free tier):
curl -s "https://api.hunter.io/v2/domain-search?domain=$TARGET&api_key=API_KEY" | jq .data.emails

# GitHub search for company email pattern:
# "@target.com" in:email type:user
# grep -r "target.com" *.git
```

---

## Phase 7: OSINT Tools & Frameworks

```bash
TARGET="target.com"

# Shodan (see recon-shodan skill):
shodan domain $TARGET
shodan search "hostname:$TARGET"

# Spyse / SecurityTrails:
curl -s "https://api.securitytrails.com/v1/domain/$TARGET" \
  -H "APIKEY: YOUR_KEY" | jq .subdomain_count

# BuiltWith (tech stack OSINT):
# https://builtwith.com/?$TARGET

# DNSDumpster:
# https://dnsdumpster.com/?target=$TARGET

# ViewDNS.info:
curl -s "https://viewdns.info/reverseip/?host=$TARGET&t=1" | grep -oE '[a-zA-Z0-9._-]+\.[a-z]{2,}' | sort -u
```

---

## Output

Save to `.omop/engagement/ctf/osint/`:
- `google-dorks.txt`: useful dork results
- `dns-records.txt`: all DNS records
- `subdomains.txt`: CT log + AXFR subdomains
- `wayback-urls.txt`: historical URLs
- `emails.txt`: discovered email addresses

## Next Phase

→ `recon-subdomain` for active subdomain enumeration
→ `recon-cloud-assets` for cloud asset discovery
