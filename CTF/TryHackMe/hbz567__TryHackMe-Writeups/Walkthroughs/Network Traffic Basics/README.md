# Network Traffic Basics

**Platform:** [TryHackMe](https://tryhackme.com/)  
**Room:** [Network Traffic Basics](https://tryhackme.com/room/networktrafficbasics)

## Introduction

Network Traffic Analysis (NTA) is the practice of capturing and examining data packets as they move across a network. The objective is to gain visibility into communications, detect abnormal behavior, and identify potential threats.

It is important to understand that NTA is not limited to tools like Wireshark. Instead, it combines:

- Log correlation  
- Deep packet inspection  
- Flow-based analysis (NetFlow/IPFIX)  
- Behavioral monitoring  

This room introduces the fundamentals of network traffic analysis, why it matters, and how we can observe and interpret traffic within different network layers.

## Why Do We Analyze Network Traffic?

Monitoring network traffic helps security teams detect malicious activity and understand how systems interact.

### Scenario: DNS Tunneling & Beaconing

Imagine receiving an alert that a workstation is sending an unusually high number of DNS requests to the same domain, but with constantly changing subdomains.

Example log entries:

```
2025-10-03 09:15:23 SRC=192.168.1.16 QUERY=aj39skdm.malicious-tld.com QTYPE=A
2025-10-03 09:15:31 SRC=192.168.1.16 QUERY=msd91azx.malicious-tld.com QTYPE=A
2025-10-03 09:15:45 SRC=192.168.1.16 QUERY=cmd01.malicious-tld.com QTYPE=TXT
```

From logs alone, we can identify:

- Source IP address  
- Queried domain  
- Query type  
- Timestamp  

However, logs do not reveal the actual content of DNS replies.

Attackers may abuse DNS TXT records to transmit command-and-control (C2) instructions. Inspecting full packet captures allows analysts to decode embedded data (often Base64 encoded).

### Purpose of Network Traffic Analysis

From a defensive standpoint, NTA enables us to:

- Detect suspicious or malicious activity  
- Investigate anomalies and performance issues  
- Reconstruct incidents during forensic investigations  
- Validate security alerts  

### Question

**What technique is used to smuggle C2 commands over DNS?**

**Answer:** DNS Tunneling

## Observing Network Traffic via the TCP/IP Stack

To understand what we can monitor, we look at the TCP/IP model. Each layer adds headers containing valuable metadata.

Logs typically record selected header fields, but full packet capture reveals everything.

### Application Layer

At this layer, we observe:

- Application headers  
- Payload (actual content)

Example: HTTP GET request

```
GET /downloads/suspicious_package.zip HTTP/1.1
Host: www.tryhackme.thm
User-Agent: curl/7.85.0
```

Response:

```
HTTP/1.1 200 OK
Content-Type: application/zip
Content-Length: 10485760
```

While logs show the requested file and status code, they do not reveal the contents of the ZIP file.

### Transport Layer

The transport layer encapsulates data using TCP or UDP.

Firewall logs commonly include:

- Source and destination ports  
- TCP flags (SYN, ACK, PSH)  
- Packet length  

Example:

```
ACCEPT TCP src=192.168.1.45 dst=172.217.22.14 sport=51432 dport=443 flags=SYN
```

To detect session hijacking attempts, analysts examine **TCP sequence numbers**. Large unexpected jumps may indicate injection attempts.

### Internet Layer

The Internet layer handles IP addressing and fragmentation.

Fields commonly logged:

- Source IP  
- Destination IP  
- TTL  

However, detecting fragmentation-based evasion requires analyzing:

- Fragment offset  
- Total length  
- Overlapping fragments  

Attackers may manipulate fragmentation to bypass IDS systems.

### Link Layer

This layer manages MAC addressing and ARP communication.

Log limitations:

- MAC spoofing or ARP poisoning may not be fully visible in logs  
- Full packet capture is required to observe gratuitous ARP responses  

### Questions

1. **Size of the ZIP file in HTTP example?**  
   `10485760` bytes  

2. **Attack used to evade IDS?**  
   Fragmentation  

3. **TCP field used to detect session hijacking?**  
   Sequence Number  

## Network Traffic Sources and Flows

Traffic originates from two main source categories:

### 1. Intermediary Devices

Examples:

- Firewalls  
- Routers  
- Switches  
- IDS/IPS  
- Web proxies  

These devices generate management and routing traffic but primarily forward endpoint traffic.

### 2. Endpoint Devices

Examples:

- Workstations  
- Servers  
- IoT devices  
- Virtual machines  

Endpoints generate the majority of network traffic.

## Traffic Flow Categories

### North-South Traffic

Traffic entering or leaving the LAN.

Common protocols:

- HTTPS  
- DNS  
- SSH  
- SMTP  
- VPN  

This traffic typically passes through the firewall.

### East-West Traffic

Internal traffic within the LAN.

Includes:

- Kerberos / LDAP  
- SMB  
- Database connections  
- DHCP  
- Internal DNS  

East-West traffic is critical during lateral movement investigations.

### Questions

1. **Which devices generate the most traffic?**  
   Endpoints  

2. **Which service is contacted before SMB authentication?**  
   Kerberos  

3. **What does TLS stand for?**  
   Transport Layer Security  

## Methods to Observe Network Traffic

Network traffic visibility comes from three main sources:

- Logs  
- Full Packet Capture  
- Network Flow Statistics  

### Logs

Logs provide summarized information.

Examples:

```
Oct 8 11:20:15 sshd: Accepted password for user from 192.168.1.50
```

```
192.168.1.50 "GET /index.html HTTP/1.1" 200 2326
```

Logs are useful but limited. They rarely contain full packet details.

### Full Packet Capture

Two primary methods:

#### Network TAP

- Hardware device  
- Copies traffic without performance impact  
- Operates at link layer  

#### Port Mirroring (SPAN)

Software-based duplication of traffic.

Cisco example:

```
monitor session 1 source interface fastEthernet0/1
monitor session 1 destination interface fastEthernet0/2
```

### Best Practices

- Proper placement of TAP or mirror  
- Storage planning (1 Gbps ≈ 10.8 TB/day)  
- Consider performance impact  

### Analysis Tools

- Wireshark  
- tcpdump  
- Snort  
- Suricata  
- Zeek  

## Network Flow Monitoring

### NetFlow

- Developed by Cisco  
- Collects metadata about traffic flows  
- Useful for detecting anomalies  

### IPFIX

- Vendor-neutral successor to NetFlow  
- Standardized by IETF  
- Offers flexible templating  

Flow monitoring does not capture packets but summarizes communication patterns.

### Flags

**Scenario 1 (HTTP Traffic):**  
THM{FoundTheMalware}

**Scenario 2 (DNS Traffic):**  
THM{C2CommandFound}

## Conclusion

This room covered:

- Purpose of Network Traffic Analysis  
- DNS tunneling and beaconing  
- TCP/IP layer visibility  
- IDS evasion techniques  
- Network flow monitoring  
- Traffic sources and flow directions  
- TAP vs Port Mirroring  

Understanding network traffic is fundamental for SOC analysts and penetration testers. It enables detection, investigation, and response to sophisticated attacks across modern enterprise environments.