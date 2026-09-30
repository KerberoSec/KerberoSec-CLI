---
name: forensics-network
description: "CTF network forensics. Wireshark/tshark PCAP analysis, TLS decryption with SSLKEYLOGFILE/RSA key, HTTP object extraction, USB HID decode, SMB3 decryption, TCP stream reconstruction, BCD encoding. Triggers: 'network forensics', 'pcap analysis', 'wireshark ctf', 'tshark', 'tls decrypt', 'usb forensics', 'smb decrypt', 'http exfil pcap', 'packet capture forensics'."
---

# CTF Forensics: Network (PCAP)

Wireshark/tshark analysis, TLS decryption, USB HID decode, HTTP exfil, SMB3 decryption.

## Install

```bash
apt-get install -y wireshark tshark tcpdump
pip install pyshark scapy --break-system-packages
```

---

## Phase 1: Initial Triage

```bash
PCAP="capture.pcap"

# Protocol summary:
tshark -r "$PCAP" -q -z io,phs

# All conversations:
tshark -r "$PCAP" -q -z conv,tcp
tshark -r "$PCAP" -q -z conv,udp

# All DNS queries:
tshark -r "$PCAP" -Y "dns.flags.response == 0" -T fields -e dns.qry.name

# All HTTP requests:
tshark -r "$PCAP" -Y "http.request" -T fields -e http.host -e http.request.uri | sort -u

# Find credentials:
tshark -r "$PCAP" -Y "http.authorization" -T fields -e http.authorization
tshark -r "$PCAP" -Y "ftp.request.command == PASS" -T fields -e ftp.request.arg
```

---

## Phase 2: TLS Decryption

```bash
PCAP="capture.pcap"

# Method 1: SSLKEYLOGFILE (browser exported pre-master secrets):
# In Wireshark: Edit → Preferences → Protocols → TLS → Pre-Master-Secret log file → sslkeylog.txt
# OR via tshark:
tshark -r "$PCAP" -o "tls.keylog_file:sslkeylog.txt" -Y "http" \
  -T fields -e http.request.uri -e http.file_data

# Method 2: RSA private key (only works without PFS):
# Wireshark: Edit → Preferences → Protocols → TLS → Edit RSA keys list
# Add: IP, port, protocol, server.key
tshark -r "$PCAP" \
  -o "tls.keys_list:10.0.0.1,443,http,server.key" \
  -Y "http" -T fields -e http.request.uri

# Method 3: Crack weak RSA key from certificate:
python3 -c "
import pyshark
cap = pyshark.FileCapture('$PCAP', display_filter='tls.handshake.type == 11')
for pkt in cap:
    # Extract certificate from TLS handshake
    print(pkt)
"
# Then factor the RSA modulus from the certificate:
# openssl x509 -in cert.pem -text -noout | grep -A 15 'Modulus'
```

---

## Phase 3: HTTP Object Extraction

```bash
PCAP="capture.pcap"

# Export all HTTP objects:
tshark -r "$PCAP" --export-objects http,/tmp/http_objects/
ls -la /tmp/http_objects/

# Extract specific TCP stream:
tshark -r "$PCAP" -q -z "follow,tcp,ascii,0"   # stream 0
tshark -r "$PCAP" -q -z "follow,tcp,ascii,5"   # stream 5

# Follow HTTP stream with raw:
tshark -r "$PCAP" -q -z "follow,tcp,raw,3" | xxd

# Extract file upload (multipart form data):
tshark -r "$PCAP" -Y "http.request.method == POST" \
  -T fields -e http.file_data | xxd
```

---

## Phase 4: USB HID Decode

```bash
PCAP="capture.pcap"

# Extract USB keyboard data:
tshark -r "$PCAP" -Y "usb.transfer_type == 0x01" -T fields -e usb.capdata > usb_data.txt

# Decode HID keycodes:
python3 << 'EOF'
# USB HID keymap (common keys):
KEYMAP = {
    0x04: 'a', 0x05: 'b', 0x06: 'c', 0x07: 'd', 0x08: 'e',
    0x09: 'f', 0x0a: 'g', 0x0b: 'h', 0x0c: 'i', 0x0d: 'j',
    0x0e: 'k', 0x0f: 'l', 0x10: 'm', 0x11: 'n', 0x12: 'o',
    0x13: 'p', 0x14: 'q', 0x15: 'r', 0x16: 's', 0x17: 't',
    0x18: 'u', 0x19: 'v', 0x1a: 'w', 0x1b: 'x', 0x1c: 'y',
    0x1d: 'z', 0x1e: '1', 0x1f: '2', 0x20: '3', 0x21: '4',
    0x22: '5', 0x23: '6', 0x24: '7', 0x25: '8', 0x26: '9',
    0x27: '0', 0x28: '\n', 0x2c: ' ', 0x2d: '-', 0x2e: '=',
}

output = []
with open('usb_data.txt') as f:
    for line in f:
        data = bytes.fromhex(line.strip().replace(':', ''))
        if len(data) < 8:
            continue
        modifier = data[0]  # Shift=0x02, Ctrl=0x01
        keycode = data[2]
        if keycode in KEYMAP:
            char = KEYMAP[keycode]
            if modifier & 0x02:  # Shift
                char = char.upper()
            output.append(char)

print(''.join(output))
EOF

# USB mouse path extraction:
tshark -r "$PCAP" -Y "usb.transfer_type == 0x01" \
  -T fields -e usb.capdata | python3 -c "
import sys
import matplotlib.pyplot as plt

x, y = [0], [0]
for line in sys.stdin:
    data = bytes.fromhex(line.strip().replace(':', ''))
    if len(data) < 4:
        continue
    dx = int.from_bytes(bytes([data[1]]), signed=True)
    dy = int.from_bytes(bytes([data[2]]), signed=True)
    x.append(x[-1] + dx)
    y.append(y[-1] - dy)  # Y-axis invert

plt.plot(x, y)
plt.savefig('mouse_path.png')
"
```

---

## Phase 5: SMB3 Decryption

```bash
# SMB3 encryption requires session key derivation
# 1. Extract NTLMv2 hash from SMB handshake:
tshark -r "$PCAP" -Y "ntlmssp.auth" -T fields \
  -e ntlmssp.auth.username -e ntlmssp.auth.domain \
  -e ntlmssp.ntlmclientchallenge -e ntlmssp.auth.ntresponse

# 2. Format for hashcat (NTLMv2):
# username: domain:challenge:ntresponse[:ntproofstr]
echo "user: DOMAIN:$(tshark ...):$(tshark ...)" > ntlmv2.hash
hashcat -m 5600 ntlmv2.hash /usr/share/wordlists/rockyou.txt

# 3. Session key derivation (SP800-108 KDF): Python:
python3 << 'EOF'
import hmac, hashlib

def ntowfv2(password, user, userdom):
    nt_hash = hashlib.new('md4', password.encode('utf-16-le')).digest()
    return hmac.new(nt_hash, (user.upper() + userdom).encode('utf-16-le'), 'md5').digest()

NT_RESP_HASH = bytes.fromhex("NTPROOFSTR_HEX")  # first 16 bytes of NT response
sess_key = hmac.new(ntowfv2("PASSWORD", "USER", "DOMAIN"), NT_RESP_HASH, 'md5').digest()
print("Session key:", sess_key.hex())
# Use in Wireshark: Edit → Preferences → Protocols → NTLMSSP
EOF
```

---

## Phase 6: BCD Encoding

```bash
# Binary-Coded Decimal: each decimal digit packed in 4 bits
# 0x49 → 4, 9 (not 73 decimal)

python3 << 'EOF'
data = bytes.fromhex("49 27 6D...")  # hex from packet
result = ""
for byte in data:
    hi = (byte >> 4) & 0xF
    lo = byte & 0xF
    result += str(hi) + str(lo)
print("BCD decoded:", result)
EOF
```

---

## Output

Save to `.omop/engagement/ctf/forensics/network/`:
- `streams/`: extracted TCP streams
- `objects/`: HTTP exported files
- `decoded.txt`: USB/BCD decoded data
- `decrypted.pcap`: TLS-decrypted capture

## Next Phase

→ `ctf-forensics-stego` for image analysis
→ `ctf-reverse-tools` for binary artifacts from PCAP
