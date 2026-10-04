---
title: "Network Intercept: EotW CTF SS CASE IT 2025 Network Forensics Writeup"
date: "2025-05-27"
description: "Analyzing fragmented network traffic to reconstruct distributed authentication tokens across multiple protocols and encoding schemes"
tags: ["ctf", "network-forensics", "wireshark", "pcap-analysis", "base64", "base32", "xor", "ss-case-it-2025"]
---

# Network Intercept: EotW CTF SS CASE IT 2025 Network Forensics Writeup

## Challenge Overview

In a sophisticated intelligence operation, our resistance hackers successfully deployed a covert packet sniffer on one of the AI regime's surveillance networks. This daring infiltration allowed us to capture critical network traffic flowing between surveillance drones, command servers, and authentication systems during a 24-hour monitoring window.

Intelligence analysis has revealed that the AI regime has implemented a new distributed security architecture where access tokens and authentication credentials are fragmented across multiple systems and protocols. This fragmentation strategy is designed to prevent complete credential compromise even if individual network segments are intercepted.

Our mission is to analyze the captured network traffic, identify the fragmented token components, decode the various obfuscation methods, and reconstruct the complete access token that will grant us entry to their command infrastructure.

**Challenge Details:**
- **Name:** Network Intercept
- **Category:** Network Forensics
- **Difficulty:** Medium
- **Points:** 250
- **Flag Format:** `sscit{...}`

## The Intelligence Brief

The captured network traffic represents communications between multiple AI regime systems during a routine authentication cycle. Our signals intelligence team has identified that the regime's new security protocol distributes authentication tokens across different network protocols using various encoding methods to avoid detection by automated monitoring systems.

The captured PCAP file `improved_network_capture.pcap` contains traffic from:
- HTTP communications between command servers
- FTP file transfers for system updates
- DNS queries for service discovery
- ICMP maintenance packets for system health monitoring

Intelligence suggests that a complete access token was transmitted during this timeframe, but it was deliberately fragmented and encoded using different methods across these protocols. Our cryptanalysis team believes the token follows the standard resistance flag format and will provide administrative access to the regime's command systems.

## Initial Network Analysis

Upon receiving the network capture file, I began with comprehensive traffic analysis:

### PCAP File Overview
```bash
# Basic file information
file improved_network_capture.pcap
# Output: improved_network_capture.pcap: pcap capture file

# Check file size and packet count
ls -lh improved_network_capture.pcap
capinfos improved_network_capture.pcap
```

### Traffic Summary Analysis
```bash
# Get overall traffic statistics
tcpdump -r improved_network_capture.pcap -n | head -20

# Analyze protocol distribution
tcpdump -r improved_network_capture.pcap -n | awk '{print $3}' | sort | uniq -c | sort -nr
```

The initial analysis revealed traffic across multiple protocols:
- HTTP (port 80): Command server communications
- FTP (port 21): File transfer operations
- DNS (port 53): Service discovery queries
- ICMP: System maintenance packets

### Network Topology Discovery
```bash
# Identify unique IP addresses
tcpdump -r improved_network_capture.pcap -n | grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | sort | uniq

# Analyze communication patterns
tcpdump -r improved_network_capture.pcap -n | awk '{print $3 " -> " $5}' | sort | uniq -c
```

This revealed a network topology with several key nodes:
- 192.168.1.10: Command server
- 192.168.1.20: Authentication server
- 192.168.1.30: File server
- 192.168.1.100-110: Surveillance drones

## Network Forensics Investigation

### Step 1: Configuration Discovery

I began by examining HTTP traffic for configuration information:

```bash
# Analyze HTTP traffic for configuration data
tcpdump -r improved_network_capture.pcap -A | grep -A20 -B5 "encoding_methods"
```

This revealed critical intelligence about the regime's encoding strategy:
```json
{
  "system": "surveillance",
  "version": "2.1.4",
  "encoding_methods": [
    {"type": "base64", "use": "authentication headers"},
    {"type": "base32", "use": "domain names"},
    {"type": "xor", "key": "0x42", "use": "maintenance packets"},
    {"type": "note": "All system identifiers are encrypted using these methods"}
  ],
  "fragment_distribution": {
    "http_headers": "part1",
    "ftp_responses": "part2", 
    "dns_queries": "part3",
    "icmp_data": "part4"
  }
}
```

**Intelligence breakthrough!** This configuration revealed the fragmentation strategy and encoding methods used by the regime.

### Step 2: HTTP Header Analysis (Base64 Fragment)

Based on the configuration, I searched for Base64-encoded data in HTTP headers:

```bash
# Extract HTTP headers containing system identifiers
tcpdump -r improved_network_capture.pcap -A | grep -A5 -B5 "X-System-ID"
```

This revealed an authentication header:
```
GET /api/status HTTP/1.1
Host: 192.168.1.10
X-System-ID: SN-45692-c3NjaXR7dzFyM3No
X-Auth-Type: Bearer
User-Agent: AI-Drone/2.1.4
```

The X-System-ID header contained a Base64-encoded fragment after the last hyphen:

```bash
# Decode the Base64 fragment
echo "c3NjaXR7dzFyM3No" | base64 -d
# Output: sscit{w1r3sh
```

**First fragment discovered:** `sscit{w1r3sh`

### Step 3: FTP Response Analysis (Base64 Fragment)

Examining FTP traffic for encoded responses:

```bash
# Analyze FTP responses for encoded data
tcpdump -r improved_network_capture.pcap -A | grep -A5 -B5 "CWD command successful"
```

This revealed an FTP response with encoded module information:
```
220 AI Regime FTP Server Ready
USER admin
331 Password required for admin
PASS ********
230 User admin logged in
CWD /modules
250 CWD command successful. Module ID: NGFya19uM3Yzcg==
```

Decoding the Base64 module ID:

```bash
# Decode the FTP response fragment
echo "NGFya19uM3Yzcg==" | base64 -d
# Output: 4rk_n3v3r
```

**Second fragment discovered:** `4rk_n3v3r`

### Step 4: DNS Query Analysis (Base32 Fragment)

Searching for Base32-encoded data in DNS queries:

```bash
# Examine DNS queries for encoded subdomains
tcpdump -r improved_network_capture.pcap -A | grep -A5 -B5 "system-"
```

This revealed a DNS query with an encoded subdomain:
```
DNS Query: system-nbswy3dpnzrw==.ai-regime.net
Response: NXDOMAIN (expected for encoded queries)
```

The subdomain between "system-" and ".ai-regime.net" was Base32-encoded:

```bash
# Decode the Base32 DNS fragment
echo "nbswy3dpnzrw==" | base32 -d
# Output: _m1ss3s_
```

**Third fragment discovered:** `_m1ss3s_`

### Step 5: ICMP Data Analysis (XOR Fragment)

Examining ICMP packets for XOR-encoded maintenance data:

```bash
# Analyze ICMP packets for maintenance data
tcpdump -r improved_network_capture.pcap -A | grep -A10 -B5 "MAINTENANCE"
```

This revealed ICMP packets with encoded maintenance information:
```
ICMP Echo Request
Data: MAINTENANCE: [binary data follows]
Hex: 71 2c 27 5f 72 36 2a 2c 33 71 75 38 2d
```

According to the configuration, this data was XOR-encoded with key 0x42:

```python
# XOR decoding script
encoded_data = [0x71, 0x2c, 0x27, 0x5f, 0x72, 0x36, 0x2a, 0x2c, 0x33, 0x71, 0x75, 0x38, 0x2d]
xor_key = 0x42

decoded = ""
for byte in encoded_data:
    decoded += chr(byte ^ xor_key)

print(decoded)
# Output: th3_p4ck3ts}
```

**Fourth fragment discovered:** `th3_p4ck3ts}`

### Step 6: Token Reconstruction

Combining all discovered fragments in order:

1. **HTTP Header (Base64):** `sscit{w1r3sh`
2. **FTP Response (Base64):** `4rk_n3v3r`
3. **DNS Query (Base32):** `_m1ss3s_`
4. **ICMP Data (XOR):** `th3_p4ck3ts}`

**Complete reconstructed token:** `sscit{w1r3sh4rk_n3v3r_m1ss3s_th3_p4ck3ts}`

## Complete Network Analysis Script

Here's a comprehensive script for automated network forensics:

```bash
#!/bin/bash

echo "=== Network Intercept Analysis Tool ==="
echo "Analyzing captured AI regime network traffic..."

PCAP_FILE="improved_network_capture.pcap"
OUTPUT_DIR="network_analysis"

# Create analysis directory
mkdir -p "$OUTPUT_DIR"

# Verify PCAP file exists
if [ ! -f "$PCAP_FILE" ]; then
    echo "Error: PCAP file not found!"
    exit 1
fi

echo "PCAP File: $PCAP_FILE"
echo "File Size: $(ls -lh $PCAP_FILE | awk '{print $5}')"
echo ""

# Generate traffic statistics
echo "Generating traffic statistics..."
capinfos "$PCAP_FILE" > "$OUTPUT_DIR/pcap_info.txt"

# Extract protocol distribution
echo "Analyzing protocol distribution..."
tcpdump -r "$PCAP_FILE" -n | awk '{print $3}' | cut -d'.' -f5 | sort | uniq -c | sort -nr > "$OUTPUT_DIR/protocol_stats.txt"

# Extract unique IP addresses
echo "Identifying network topology..."
tcpdump -r "$PCAP_FILE" -n | grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | sort | uniq > "$OUTPUT_DIR/ip_addresses.txt"

# Search for configuration data
echo "Searching for configuration information..."
tcpdump -r "$PCAP_FILE" -A | grep -A20 -B5 "encoding_methods" > "$OUTPUT_DIR/config_data.txt"

# Extract HTTP headers for Base64 data
echo "Analyzing HTTP headers for encoded fragments..."
tcpdump -r "$PCAP_FILE" -A | grep -A5 -B5 "X-System-ID" > "$OUTPUT_DIR/http_headers.txt"

# Extract Base64 fragment from HTTP
http_fragment=$(tcpdump -r "$PCAP_FILE" -A | grep "X-System-ID" | cut -d'-' -f3 | head -1)
if [ ! -z "$http_fragment" ]; then
    echo "Found HTTP fragment: $http_fragment"
    decoded_http=$(echo "$http_fragment" | base64 -d 2>/dev/null)
    echo "Decoded HTTP fragment: $decoded_http"
    echo "$decoded_http" > "$OUTPUT_DIR/fragment1.txt"
fi

# Extract FTP responses for Base64 data
echo "Analyzing FTP responses for encoded fragments..."
tcpdump -r "$PCAP_FILE" -A | grep -A5 -B5 "Module ID" > "$OUTPUT_DIR/ftp_responses.txt"

# Extract Base64 fragment from FTP
ftp_fragment=$(tcpdump -r "$PCAP_FILE" -A | grep "Module ID" | cut -d':' -f2 | tr -d ' ' | head -1)
if [ ! -z "$ftp_fragment" ]; then
    echo "Found FTP fragment: $ftp_fragment"
    decoded_ftp=$(echo "$ftp_fragment" | base64 -d 2>/dev/null)
    echo "Decoded FTP fragment: $decoded_ftp"
    echo "$decoded_ftp" > "$OUTPUT_DIR/fragment2.txt"
fi

# Extract DNS queries for Base32 data
echo "Analyzing DNS queries for encoded fragments..."
tcpdump -r "$PCAP_FILE" -A | grep -A5 -B5 "system-" > "$OUTPUT_DIR/dns_queries.txt"

# Extract Base32 fragment from DNS
dns_fragment=$(tcpdump -r "$PCAP_FILE" -A | grep "system-" | sed 's/.*system-\([^.]*\).*/\1/' | head -1)
if [ ! -z "$dns_fragment" ]; then
    echo "Found DNS fragment: $dns_fragment"
    decoded_dns=$(echo "$dns_fragment" | base32 -d 2>/dev/null)
    echo "Decoded DNS fragment: $decoded_dns"
    echo "$decoded_dns" > "$OUTPUT_DIR/fragment3.txt"
fi

# Extract ICMP data for XOR decoding
echo "Analyzing ICMP packets for XOR-encoded fragments..."
tcpdump -r "$PCAP_FILE" -A | grep -A10 -B5 "MAINTENANCE" > "$OUTPUT_DIR/icmp_data.txt"

# Create XOR decoder for ICMP data
cat > "$OUTPUT_DIR/xor_decoder.py" << 'EOF'
#!/usr/bin/env python3

# XOR decoder for ICMP maintenance data
encoded_hex = "712c275f72362a2c337175382d"  # Example from ICMP packet
xor_key = 0x42

# Convert hex string to bytes
encoded_bytes = bytes.fromhex(encoded_hex)

# XOR decode
decoded = ""
for byte in encoded_bytes:
    decoded += chr(byte ^ xor_key)

print(decoded)
EOF

# Execute XOR decoder
if command -v python3 &> /dev/null; then
    echo "Decoding ICMP XOR fragment..."
    icmp_decoded=$(python3 "$OUTPUT_DIR/xor_decoder.py" 2>/dev/null)
    echo "Decoded ICMP fragment: $icmp_decoded"
    echo "$icmp_decoded" > "$OUTPUT_DIR/fragment4.txt"
fi

# Reconstruct complete token
echo ""
echo "=== TOKEN RECONSTRUCTION ==="
if [ -f "$OUTPUT_DIR/fragment1.txt" ] && [ -f "$OUTPUT_DIR/fragment2.txt" ] && [ -f "$OUTPUT_DIR/fragment3.txt" ] && [ -f "$OUTPUT_DIR/fragment4.txt" ]; then
    complete_token=""
    complete_token+=$(cat "$OUTPUT_DIR/fragment1.txt")
    complete_token+=$(cat "$OUTPUT_DIR/fragment2.txt")
    complete_token+=$(cat "$OUTPUT_DIR/fragment3.txt")
    complete_token+=$(cat "$OUTPUT_DIR/fragment4.txt")
    
    echo "*** COMPLETE ACCESS TOKEN RECONSTRUCTED ***"
    echo "Token: $complete_token"
    echo "$complete_token" > "$OUTPUT_DIR/complete_token.txt"
else
    echo "Warning: Not all fragments were successfully decoded"
fi

echo ""
echo "Analysis complete. Results saved to $OUTPUT_DIR/"
```

## Advanced Network Forensics Techniques

### Wireshark Analysis

For more detailed analysis using Wireshark:

```bash
# Open in Wireshark with specific filters
wireshark improved_network_capture.pcap

# Useful Wireshark filters:
# http.request.method == "GET"
# ftp.response.code == 250
# dns.qry.name contains "system-"
# icmp.data contains "MAINTENANCE"
```

### Protocol-Specific Analysis

```bash
# HTTP-specific analysis
tcpdump -r improved_network_capture.pcap -A 'port 80' > http_traffic.txt

# FTP-specific analysis
tcpdump -r improved_network_capture.pcap -A 'port 21' > ftp_traffic.txt

# DNS-specific analysis
tcpdump -r improved_network_capture.pcap -A 'port 53' > dns_traffic.txt

# ICMP-specific analysis
tcpdump -r improved_network_capture.pcap -A 'icmp' > icmp_traffic.txt
```

### Statistical Analysis

```bash
# Generate conversation statistics
tshark -r improved_network_capture.pcap -q -z conv,ip

# Protocol hierarchy statistics
tshark -r improved_network_capture.pcap -q -z io,phs

# Endpoint statistics
tshark -r improved_network_capture.pcap -q -z endpoints,ip
```

## Intelligence Assessment

### Extracted Network Intelligence

The network forensics analysis revealed critical information about the AI regime's distributed security architecture:

1. **Fragmentation Strategy:** Authentication tokens split across four different protocols
2. **Encoding Methods:** Multiple encoding schemes (Base64, Base32, XOR) to avoid detection
3. **Network Topology:** Command and control infrastructure with specialized servers
4. **Communication Patterns:** Regular authentication cycles and maintenance protocols
5. **Security Measures:** Distributed credential storage to prevent complete compromise

### Security Vulnerabilities Identified

1. **Predictable Fragmentation:** Consistent pattern of token distribution across protocols
2. **Weak Encoding:** Simple encoding methods easily reversible with proper analysis
3. **Configuration Exposure:** Network configuration data transmitted in plaintext
4. **Protocol Correlation:** Fragments transmitted in predictable sequence across protocols
5. **Maintenance Protocols:** XOR key reuse across multiple maintenance sessions

## Countermeasures and Defense

### For Blue Team Analysis

```bash
# Implement network monitoring
tcpdump -i any -w network_monitor.pcap 'not port 22'

# Analyze traffic patterns
ntopng -i eth0 -P /var/lib/ntopng/ntopng.pid

# Detect encoding patterns
tshark -r capture.pcap -Y "http.request.uri contains base64" -T fields -e http.request.uri

# Monitor DNS for encoded queries
dig @8.8.8.8 suspicious-domain.com +trace
```

### Security Recommendations

1. **Traffic Encryption:** Implement end-to-end encryption for all network communications
2. **Token Management:** Use secure token generation and distribution mechanisms
3. **Protocol Diversification:** Avoid predictable patterns in multi-protocol communications
4. **Encoding Strength:** Implement cryptographically secure encoding methods
5. **Network Segmentation:** Isolate critical authentication infrastructure

## Lessons Learned

This network forensics challenge demonstrated several critical concepts:

1. **Multi-Protocol Analysis:** Understanding how data can be distributed across different network protocols
2. **Encoding Recognition:** Identifying and decoding various encoding schemes in network traffic
3. **Pattern Analysis:** Recognizing systematic approaches to data fragmentation
4. **Tool Proficiency:** Using tcpdump, Wireshark, and custom scripts for comprehensive analysis
5. **Intelligence Correlation:** Combining multiple data sources to reconstruct complete information

## Conclusion

The network forensics analysis of the intercepted AI regime traffic proved highly successful, yielding the complete access token `sscit{w1r3sh4rk_n3v3r_m1ss3s_th3_p4ck3ts}` through systematic analysis of fragmented and encoded network communications.

This investigation highlighted the importance of:

- **Comprehensive Protocol Analysis:** Examining traffic across multiple network protocols
- **Encoding Recognition:** Understanding various encoding methods and their applications
- **Fragment Reconstruction:** Systematically collecting and combining distributed data
- **Configuration Intelligence:** Leveraging discovered configuration data for analysis guidance
- **Tool Integration:** Using multiple forensic tools for complete network analysis

The regime's distributed security approach: while more sophisticated than simple credential storage: still contained fundamental weaknesses that allowed complete token reconstruction through proper forensic analysis. The predictable fragmentation patterns and weak encoding methods provided multiple attack vectors for intelligence extraction.

This captured access token represents a significant intelligence breakthrough, potentially providing administrative access to the AI regime's command infrastructure. The understanding of their distributed security architecture will prove invaluable for future network infiltration operations.

The resistance continues, one packet at a time.

---

*This writeup is part of my CTF journey documenting the techniques and methodologies used in cybersecurity competitions. For more writeups and cybersecurity content, visit [0x4m4.com](https://0x4m4.com)* 