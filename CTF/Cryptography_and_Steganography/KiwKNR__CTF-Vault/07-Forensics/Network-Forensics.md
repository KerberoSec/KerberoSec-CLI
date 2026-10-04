---
tags: [ctf, forensics, network, wireshark, pcap]
created: 2026-05-01
---

# 🌐 Network Forensics

> วิเคราะห์ packet capture (.pcap, .pcapng) เพื่อ extract ข้อมูล: files, credentials, commands ที่ส่ง/รับ

---

## 🛠 Tools

### Wireshark ⭐ Standard
GUI: open .pcap file → visual analysis

### tshark: CLI Wireshark
```bash
tshark -r capture.pcap                       # display packets
tshark -r capture.pcap -Y "http"             # filter
tshark -r capture.pcap -T fields -e ip.src -e ip.dst
```

### NetworkMiner
Auto-extract:
- Files transferred
- Credentials
- Sessions
- Hosts/OS detected

ใช้สำหรับ "quick win": เปิดไฟล์ → ดู Files tab → flag อาจอยู่ตรงนั้นเลย

### tcpdump
```bash
tcpdump -r capture.pcap                       # read
tcpdump -r capture.pcap -A 'host 1.2.3.4'    # ASCII output
tcpdump -r capture.pcap -X 'port 80'         # hex+ASCII
```

### Zeek (Bro)
Log-based: generate logs จาก pcap (HTTP, DNS, SSL, files, ...)

---

## 🎯 Wireshark Workflow

### 1. First impressions
- File → Statistics → Capture File Properties
- Statistics → Protocol Hierarchy → ดูว่ามี protocol อะไรบ้าง
- Statistics → Conversations → ดู IP/Port pairs
- Statistics → Endpoints → unique hosts

### 2. Display Filters

| Filter | Description |
|--------|-------------|
| `ip.addr == 1.2.3.4` | source or dest = 1.2.3.4 |
| `ip.src == 1.2.3.4` | only source |
| `tcp.port == 80` | tcp port 80 |
| `udp.port == 53` | DNS |
| `http` | HTTP only |
| `http.request.method == "POST"` | HTTP POST |
| `http contains "flag"` | HTTP packets containing string |
| `tcp contains "flag"` | TCP payload contains |
| `dns.qry.name contains "evil"` | DNS query name |
| `ssl.handshake.type == 1` | TLS Client Hello |
| `frame contains "flag"` | any frame |
| `tcp.stream eq 0` | first TCP stream |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | SYN packets |
| `!arp && !icmp` | exclude |

### 3. Follow Stream
- Right-click packet → Follow → TCP Stream / HTTP Stream
- Reassemble การสนทนา → เห็น raw data

### 4. Export Objects
File → Export Objects → HTTP → ดูไฟล์ที่ถูก transfer (HTML, JS, images, downloads)

ทำเหมือนกันสำหรับ:
- HTTP
- SMB
- FTP-DATA
- TFTP
- IMF (email)

### 5. Decrypt TLS
ถ้ามี:
- Pre-master secret log (`SSLKEYLOGFILE`)
- Server private key (RSA only: not for ECDHE)

Edit → Preferences → Protocols → TLS → (Pre)-Master-Secret log filename

---

## 🎯 Common CTF Patterns

### Pattern 1: HTTP file download
```
Statistics → HTTP → Requests → see all URLs
File → Export Objects → HTTP → save files
```

ไฟล์ที่ download อาจมี flag (PDF, image, ZIP)

### Pattern 2: HTTP POST credentials
```
Filter: http.request.method == "POST"
Right-click → Follow → HTTP Stream
```
ดู form data ที่ส่ง: `username=admin&password=...`

### Pattern 3: FTP/Telnet plaintext
```
Filter: ftp || telnet
Right-click → Follow → TCP Stream
```
ดูคำสั่งที่ user พิมพ์: รวมถึง password (FTP cmd "PASS")

### Pattern 4: DNS exfiltration
Attacker encode data ใน subdomain query:
```
deadbeef.attacker.com
1234abcd.attacker.com
flag-aaa.attacker.com
```

```bash
tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name | sort -u
```

หรือ Wireshark filter `dns.qry.name`

### Pattern 5: ICMP exfil
ICMP packet มี data field: attacker hide flag in there
```
Filter: icmp
ดู Data field
```

### Pattern 6: USB traffic
USB capture → keystroke recovery (HID)
```bash
# Extract HID data
tshark -r usb.pcap -Y "usb.transfer_type == 0x01" -T fields -e usb.capdata
```

แล้ว map HID codes → keystrokes (มี script สำเร็จ)

### Pattern 7: Wi-Fi
WPA handshake (4-way) → crack with hashcat
```bash
hcxpcapngtool -o handshake.hc22000 capture.pcap
hashcat -m 22000 handshake.hc22000 rockyou.txt
```

แล้ว decrypt traffic ใน Wireshark
- Edit → Preferences → IEEE 802.11 → Decryption keys

### Pattern 8: TLS with key
```
Filter: tls
```
ถ้ามี key → ดูเป็น HTTP ปกติ

---

## 🎯 ICS/SCADA Protocols (industrial)

โจทย์ขั้นสูงอาจมี:
- **Modbus**: port 502
- **DNP3**
- **S7comm** (Siemens)
- **EtherNet/IP**

Wireshark dissect ได้: filter `modbus`, `s7comm`, etc.

---

## 🛠 Useful tshark commands

### Extract URLs
```bash
tshark -r capture.pcap -Y "http.request" -T fields -e http.host -e http.request.uri
```

### Extract DNS queries
```bash
tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name | sort -u
```

### Extract Email
```bash
tshark -r capture.pcap -Y "smtp" -T fields -e smtp.req.parameter
```

### Save TCP stream to file
```bash
tshark -r capture.pcap -q -z follow,tcp,raw,5 > stream5.txt
```

### Convert .pcap to .pcapng or vice versa
```bash
editcap -F pcapng input.pcap output.pcapng
```

### Merge captures
```bash
mergecap -w merged.pcap cap1.pcap cap2.pcap
```

### Filter to new file
```bash
tcpdump -r big.pcap -w small.pcap 'host 1.2.3.4 and port 80'
```

---

## 🎯 Decoding Encoded Data ใน Traffic

### Base64 in HTTP cookies / headers
```bash
tshark -r capture.pcap -Y "http" -T fields -e http.cookie | sort -u
# decode base64
```

### Encrypted POST body
- ดู ASCII ใน Follow Stream
- ถ้าดูเหมือน base64 → decode
- ถ้าดู random → encrypted (need key)

### Hex-encoded
ใน CyberChef → "From Hex"

---

## 🔍 Strings on pcap

```bash
strings capture.pcap | grep -iE "flag|password|secret|api"
strings capture.pcap | grep -E "[a-zA-Z0-9+/]{50,}={0,2}"      # base64-like
```

---

## 🔥 Specialized tools

### chaosreader
Old but useful: extract sessions, files
```bash
chaosreader capture.pcap
# Generates HTML report + extracted files
```

### Networkminer (Windows/Mono Linux)
GUI auto-extract: ใช้ก่อนทุกครั้งที่เจอ pcap ใหม่

### Brim / Zui
GUI สำหรับ Zeek logs + pcap

### Suricata / Snort
IDS: load pcap → see alerts (rules-based)

### scapy (Python)
สำหรับ custom analysis
```python
from scapy.all import *
packets = rdpcap('capture.pcap')

# Filter
http_packets = [p for p in packets if TCP in p and p[TCP].dport == 80]

# Extract HTTP body
for p in http_packets:
    if Raw in p:
        print(p[Raw].load)
```

---

## 🎯 Check List

ทุกครั้งที่เจอ pcap:

- [ ] Open ใน NetworkMiner: ดู Files / Credentials
- [ ] Open ใน Wireshark: Statistics → Protocol Hierarchy
- [ ] Statistics → Conversations
- [ ] Export Objects → HTTP, SMB
- [ ] Filter: `http.request.method == "POST"`
- [ ] Filter: `ftp || telnet`
- [ ] Filter: `dns.qry.name`: exotic subdomains?
- [ ] strings on pcap file
- [ ] ดู unusual ports (SSH on 8080? Reverse shell?)
- [ ] ดู ICMP/DNS for exfil
- [ ] If wifi: extract handshake → crack

---

## 🔗 ที่เกี่ยวข้อง

- [Forensics-Intro](Forensics-Intro.md)
- [Memory-Forensics](Memory-Forensics.md)
- [Disk-Forensics](Disk-Forensics.md)
- [Crack WPA hash](../04-Cryptography/Hash-Attacks.md)

## 📚 References

- "Practical Packet Analysis": Chris Sanders
- wiki.wireshark.org
- malware-traffic-analysis.net (free .pcap challenges)

---

#ctf #forensics #network #wireshark #pcap
