---
name: forensics-network-advanced
description: "CTF advanced network forensics. Timing-based packet encoding, USB HID mouse/pen drawing recovery, DNS exfiltration via query names, TCP flag base64 covert channel, ICMP steganography, Active Directory RID recycling, Timeroasting NTP hash, decompression anomaly detection. Triggers: 'timing covert channel', 'usb hid recovery', 'dns covert channel', 'tcp flags stego', 'icmp stego', 'ad ridenum', 'timeroasting', 'ntp hash', 'covert channel', 'advanced pcap'."
---

# CTF Forensics: Advanced Network Channels

Timing-based encoding, USB HID drawing, DNS/TCP/ICMP covert channels, AD attacks.

---

## Phase 1: PCAP Triage

```bash
PCAP="capture.pcap"

# Protocol distribution:
tshark -q -z io,phs -r "$PCAP"

# Identify unusual traffic:
tshark -r "$PCAP" -q -z conv,ip | sort -k3 -rn | head -20

# Find interfaces with timing-based encoding:
# Look for packets with only two distinct inter-packet intervals
tshark -r "$PCAP" -T fields -e frame.number -e frame.time_delta \
  | awk '{print $2}' | sort | uniq -c | sort -rn | head -5
```

---

## Phase 2: Timing-Based Encoding

```python
import pyshark
from collections import Counter

cap = pyshark.FileCapture('capture.pcap', display_filter='tcp.stream eq 0')

timestamps = []
for pkt in cap:
    timestamps.append(float(pkt.sniff_timestamp))

# Inter-packet intervals:
intervals = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps)-1)]

# Find two distinct values (short = 0, long = 1):
rounded = [round(t, 2) for t in intervals]
counts = Counter(rounded)
print("Distinct intervals:", sorted(counts.keys()))

# Map to bits:
values = sorted(counts.keys())
bits = [0 if t <= values[0] + (values[1]-values[0])/2 else 1 for t in rounded]
data = bytes(int(''.join(map(str, bits[i:i+8])), 2) for i in range(0, len(bits)-7, 8))
print(data.decode(errors='replace'))
```

---

## Phase 3: USB HID Recovery

```bash
PCAP="usb.pcap"

# Extract USB interrupt transfer data:
tshark -r "$PCAP" -Y "usb.transfer_type == 0x01" \
  -T fields -e usb.capdata | xxd -r -p > hid_data.bin

# Mouse HID report format (7 bytes): Button | Mode | RelX | RelY | ...
python3 << 'EOF'
import struct
from PIL import Image, ImageDraw

with open('hid_data.bin', 'rb') as f:
    data = f.read()

x, y = 0, 0
positions = [(0, 0)]

for i in range(0, len(data)-6, 7):
    chunk = data[i:i+7]
    if len(chunk) < 7: break
    
    button = chunk[0]
    mode = chunk[1]
    rel_x = struct.unpack('b', bytes([chunk[2]]))[0]  # signed
    rel_y = struct.unpack('b', bytes([chunk[3]]))[0]  # signed
    
    x += rel_x
    y += rel_y
    
    if button & 0x01:  # Pen touching / mouse button pressed
        positions.append((x, y))

# Normalize and draw:
min_x = min(p[0] for p in positions)
min_y = min(p[1] for p in positions)
max_x = max(p[0] for p in positions)
max_y = max(p[1] for p in positions)

W, H = 800, 600
img = Image.new('RGB', (W, H), 'white')
draw = ImageDraw.Draw(img)
for px, py in positions:
    nx = int((px - min_x) / (max_x - min_x + 1) * (W-1))
    ny = int((py - min_y) / (max_y - min_y + 1) * (H-1))
    draw.ellipse([nx-2, ny-2, nx+2, ny+2], fill='black')

img.save('usb_drawing.png')
EOF
```

---

## Phase 4: DNS Covert Channel

```bash
PCAP="network.pcap"

# Extract all DNS query names:
tshark -r "$PCAP" -Y "dns" -T fields -e dns.qry.name | sort -u

# Detect data-in-subdomains (long/encoded subdomain labels):
tshark -r "$PCAP" -Y "dns" -T fields -e dns.qry.name \
  | awk '{ if (length($1) > 50 || $1 ~ /^[A-Z2-7=]+\.[^.]+\.[^.]+$/) print }'

# Decode base32 subdomain chunks:
python3 << 'EOF'
import base64
subdomains = ["ONXW2ZJAMFZAGLTDN5XA====", ...]
for s in subdomains:
    try:
        print(base64.b32decode(s + '='*(8 - len(s)%8)).decode())
    except:
        print(s)
EOF

# Extract DNS TXT records:
tshark -r "$PCAP" -Y "dns.resp.type == 16" -T fields -e dns.txt
```

---

## Phase 5: TCP Flag Covert Channel

```python
import pyshark

cap = pyshark.FileCapture('capture.pcap', display_filter='tcp')

# TCP flags: SYN=0x02, ACK=0x10, FIN=0x01, RST=0x04, PSH=0x08, URG=0x20
# 6 flags = 6 bits → map directly to base64 alphabet
BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

encoded = ''
for pkt in cap:
    if hasattr(pkt, 'tcp'):
        flags = int(pkt.tcp.flags, 16) & 0x3F  # lower 6 bits
        encoded += BASE64_CHARS[flags]

import base64
try:
    decoded = base64.b64decode(encoded + '==').decode()
    print(decoded)
except:
    print(f"Raw base64: {encoded}")
```

---

## Phase 6: ICMP Steganography

```python
from scapy.all import rdpcap, ICMP

pkts = rdpcap('capture.pcap')
icmp_payloads = []

for pkt in pkts:
    if ICMP in pkt and pkt[ICMP].type == 8:  # echo request
        payload = bytes(pkt[ICMP].payload)
        icmp_payloads.append(payload)

# Byte rotation decode (common pattern):
decoded = bytes((b - 1) % 256 for payload in icmp_payloads for b in payload)
print(decoded.decode(errors='replace'))

# XOR decode:
key = 0x42  # try common keys
decoded = bytes(b ^ key for payload in icmp_payloads for b in payload)
print(decoded.decode(errors='replace'))
```

---

## Phase 7: Active Directory: RID Recycling

```bash
# Guest SMB auth + LSARPC RID enumeration
# Enumerate all user accounts by iterating Relative Identifiers

TARGET="dc.domain.local"

# Test guest auth:
rpcclient -U "" -N "$TARGET" -c "getdompwinfo"

# RID brute force:
for rid in $(seq 500 2000); do
  result=$(rpcclient -U "" -N "$TARGET" -c "lookupsids S-1-5-21-DOMAIN-$rid" 2>/dev/null)
  if echo "$result" | grep -q "User"; then
    echo "RID $rid: $result"
  fi
done
```

---

## Phase 8: Timeroasting

```bash
# NTP requests to domain controllers leak HMAC-MD5 hashes
# Machine accounts set no-preauth → offline crackable

# Find NTP traffic:
tshark -r "$PCAP" -Y "ntp" -T fields -e ip.src -e ntp.ctrl.authenticator
# Authenticator field = HMAC-MD5(NTP_payload, password)

# Offline crack:
hashcat -m 30100 timeroast_hashes.txt /usr/share/wordlists/rockyou.txt

# Active timeroasting (if on network):
git clone https://github.com/SecuraBV/Timeroast /opt/timeroast
python3 /opt/timeroast/timeroast.py "$TARGET" -o hashes.txt
hashcat -m 30100 hashes.txt wordlist.txt
```

---

## Output

Save to `.omop/engagement/ctf/forensics/network/`:
- `covert-data.txt`: decoded covert channel
- `usb-drawing.png`: USB HID visualization
- `flag.txt`: found flag

## Next Phase

→ `ctf-forensics-network` for standard PCAP analysis
→ `ctf-misc-dns` for DNS-specific attacks
