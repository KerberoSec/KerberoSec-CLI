- https://tryhackme.com/room/wireshark
- https://www.wireshark.org/download.html  on Linux `sudo apt install wireshark` 

#Networking 

Wireshark, a tool used for creating and analyzing PCAPs (network packet capture files), is commonly used as one of the best packet analysis tools.

## Overview 

Welcome screen shows capture filter, graphs with no activity have no data

click on green ribbon for Capture Filters, helpful to have to narrow down packets

after filter selection and see line graph have activity, double click on it to see live packets

click on a packet and the middle section gives you all the data about it
- Packet Number
- Time
- Source
- Destination
- Protocol
- Length
- Packet Info

ARP poisoning is used by Red Teams to sniff packets
ARP Poisoning you can redirect the traffic from the host(s) to the machine you're monitoring from.

## Filtering captures

wireshark has boolean operators
- and `&&` 
- or `||`
- equals `==`
- not equal `!=`
- gt `>`
- lt `<`

BASIC FILTERING
- syntax: `[service | protocol ].<filtered item> [boolean] <IP>`
- `ip.addr == <IP>`
- `ip.src == <SRC IP> and ip.dst == <DST IP>` filter source and destination
- `tcp.port eq <PORT NUM> or <PROTOCOL NAME>`
- `udp.port eq <PORT NUM> or <PROTOCOL NAME>`

## Packet dissection

wireshark uses OSI model

7 layers of OSI model:
7. application: HTTP FTP IRC SSH DNS
6. presentation: SSL SSH IMAP MPEG JPEG
5. session: API , sockets, WinSock 
4. transport: TCP UDP , e2e connection
3. network: packets , IP, ICMP, IPSEC, IGMP
2. data link: frames, ethernet, switch, bridge
1. physical: coax fiber wireless hubs, repeaters

a packet captured has data in middle section of wireshark, shows the layers

[Frame] (1):
	- Encapsulation type
	- arrival time
	- Epoch time
	- frame number
	- frame length

[MAC] (2):
	- Ethernet II, SRC
	- Destination
	- Source
	- Type

[IP] (3):
	- Internet Protocol
	- Differentiated Services
	- Flags

[Protocol] (4):
	- Transmission Control Protocol (source port, destination port)
	- Flags
	- SEQ/ACK
	- Timestamps

[App Protocol] (5):
	- HTP
	- Content length
	- HTTP response
	- app data , app specific data

## ARP traffic 

ARP or Address Resolution Protocol is a Layer 2 protocol that is used to connect IP Addresses with MAC Addresses.

- REQUEST messages
- RESPONSE messages
- most devices self identify or wireshark will ID it as `intel_78` for example of suspicious traffic/ unrecognized source
- enable physical addresses: View > Name Resolution > Ensure that Resolve Physical Address is checked
- always stay on side of caution when analyzing packets

```
No.  Time  Source         Destination Protocol Length Info
1    0.00  Intel_78:0c:02 Broadcast   ARP      60     
2    0.00  Cisco251_af:f4 Broadcast   ARP      60
```

ARP requests packets
analyze packet and its details
- Opcode: request        {operation code}
- Target MAC address:

ARP reply packets
- Opcode reply 
- Sender MAC address: 
- Sender IP address: 

----
start the AttackBox
`/root/Rooms/Wireshark101` click on `task7.pcap`

What is the Opcode for Packet 6?
- request (1)

What is the source MAC Address of Packet 19?
- ` 80:fb:06:f0:45:d7 `

What 4 packets are Reply packets?
- 76, 400, 459, 520

What IP Address is at 80:fb:06:f0:45:d7?
-  `10.251.23.1`

---

## ICMP traffic

ICMP or Internet Control Message Protocol is used to analyze various nodes on a network. This is most commonly used with utilities like ping and traceroute.

```
No  Time  Source        Destination    Protocol   Length  Info
75  61.8  86.64.145.29  10.251.23.139  ICMP       98      Echo (ping)
```

ICMP request 
- ping packet request
- Internet Control Message Protocol
	- `Type: 8 (Echo ping request)`
	- `Code: 0`  reply packet 
	- timestamp
	- data string 

ICMP reply
- `Type: 0 (Echo ping reply)`
- `Code: 0`

---
` /root/Rooms/Wireshark101`

  
What is the type for packet 4?
- 8  (echo ping request)

What is the type for packet 5?
- 0 (echo ping reply)

What is the timestamp for packet 12, only including month day and year?
- (Wireshark time is based off your machine, so +1/-1 day if wrong)
- May 30, 2013

What is the full data string for packet 18?
- data (48 bytes)
- `08090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031323334353637`

---

## TCP traffic

TCP or Transmission Control Protocol handles the delivery of packets including sequencing and errors.

- TCP handshake SYN, SYN/ACK, ACK 

Transmission Control Protocol
- `Sequence number (raw): `
- `acknowledgement number: `  if 0 then port was closed, Preferences > TCP > check Relative sequence numbers

## DNS traffic

Domain Name Service protocol is used to resolves names with IP addresses.

analyzing DNS packets
- query-response
- DNS-servers only
- UDP
if any of these is out of place = inspect further

```
No.  Time   Source        Destination    Protocol   Length Info
1    0.00   192.168.43.9  192.168.43.1   DNS        80     Standard  
```

DNS QUERY
- where the query came from
- what was being queried
- `User Datagram Protocol, Src Port: xxxxx, Dst Port: 53`  if not UDP 53 but TCP 53 = suspicious! 
- `Queries: 8.8.8.8.in-addr.arpa: type PTR, class IN`

DNS RESPONSE
- response packet that includes an answer 
- `Answers: 8.8.8.8.in-addr.arpa: type PTR, class IN, google-public-dns-a.google.com`

---
`task10.pcap`

What is being queried in packet 1?
- ` 8.8.8.8.in-addr.arpa `

What site is being queried in packet 26?
- ` www.wireshark.org `

What is the Transaction ID for packet 26?
- ` 0x2c58 `

---

## HTTP traffic 

HTTP or Hypertext Transfer Protocol is a commonly used port for the world wide web and used by some websites

- Hypertext Transfer Protocol
- `P3P: policyref="http://www.googleadservices.com/pagead/p3p.xml", CP="NOI DEV PSA PSD IVA PVD OTP OUR OTR IND OTC"\r\n `
- `[Request URI [truncated]: http://pafead2.googlesyndication.com/pagead/ads?client=ca-pub-<nums>&random-<nums>&lmt=<nums>&format=468x60_as&output=html&url=http%3A`

look for 
- host
- user-agent
- requested URI & response
analysis:  Statistics > Protocol Hierarchy, opens window

File > Export Objects > HTTP

organize all endpoints and IPs for a capture
Stats > Endpoints

---

What percent of packets originate from Domain Name System?
-  Stats > Protocol Hierarchy
- 4.7

What endpoint ends in .237?
- Stats > Endpoints
- 145.254.160.237

What is the user-agent listed in packet 4?
- `Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.6) Gecko/20040113)`
- 

  
Looking at the data stream what is the full request URI from packet 18?
- `HTP [truncated] GET` 
- ` http://pagead/ads?client=ca-pub-2309191948673629&random=1084443430285&lmt=1082467020&format=468x60_as&output=html&url=http%3A%2F%2Fwww.ethereal.com%2Fdownload.html&color_bg=FFFFFF&color_text=333333&color_link=000000&color_url=666633&color_border=666633 `

What domain name was requested from packet 38?
- HTP  requested URI:
- ` www.ethereal.com `

Looking at the data stream what is the full request URI from packet 38?
- `http:///www.ethereal.com/download.html `

---

## HTTPS traffic
HTTPS or Hypertext Transfer Protocol Secure can be one of the most annoying protocols to understand from a packet analysis perspective and can be confusing to understand the steps needed to take in order to analyze HTTPS packets.

steps to make a secure tunnel 
1. Client and server agree on a protocol version
2. Client and server select a cryptographic algorithm
3. The client and server can authenticate to each other; this step is optional
4. Creates a secure tunnel with a public key

Analyze HTTPS traffic
- look for handshake client & server

Client Hello packet
```
Transport Layer Security
  SSLv2 Record Layer: Client Hello
    Handshake Message Type: Client Hello (1)
    Version: SSL 3.0 (0x0300)
```

Server Hello packet
```
Transport Layer Security
  SSLv3 Record Layer: Handshake Protocol: Server Hello
  ...
  ...
  Random ID:  <nums>
    Session ID Length: 32
    Session ID: <nums>
  SSLv3 Record Layer: Handshake Protocol: Certificate
    Content Type: Handshake (22)
    Version: SSL 3.0 (0x0300)
```

Client Key Exchange packet, determine public key to use to encrypt messages
```
Transport Layer Security
  SSLv3 Record Layer: Handshake Protocol: Client Key Exchange
  ...
  ...
  Handshake Protocol: Client Key Exchange 
    Handshake Type: Client Key Exchange (16)
    Length: 128
  SSLv3 Record Layer: Change Cipher Spec Protocol: Change Cipher Spec
    Content Type: Change Cipher Spec (20)
    Length: 1
  SSLv3 Record Layer: Handshake Protocol: Encrypted Handshake Message
    Content Type: Handshake (22)
```

Server confirms public key & creates secure tunnel
```
Transport Layer Security
  SSLv3 Record Layer: Handshake Protocol: Client Key Exchange
    Handshake Protocol: Client Key Exchange
      Handshake Type: Client Key Exchange (16)
      Length: 128
  SSLv3 Record Layer: Change Cipher Spec Protocol: Change Cipher Spec
    Content Type: Change Cipher Spec (20)
    Version: SSL 3.0 (0x0300)
    Length: 1
  SSLv3 Record Layer: Handshake Protocol: Encrypted Handshake Message
    Content Type: Handshake (22)
```

encrypted traffic

### Practical HTTPS packet analysis

analyze `snakeoil_070531.pcap` 
task12.zip 

packet 11
Secure Sockets Layer > SSLv3 Records Layer:  encrypted data

RSA tool
Edit > Preferences > Protocols > TLS or SSL 
- 127.0.0.1
- port `start_tls`
- protocol `http`
- `keyfile`: RSA key location

now it shows decrypted data

File > Export Objects > HTTP   opens window of localhost filenames

---
  
Looking at the data stream what is the full request URI for packet 31?
- ` https://localhost/icons/apache_pb.png `

Looking at the data stream what is the full request URI for packet 50?
- ` https://localhost/icons/back.gif `

What is the User-Agent listed in packet 50?
- User-Agent: `Mozilla/5.0 (X11; U; Linux i686; fr; rv:1.8.0.2) Gecko/20060308 Firefox/1.5.0.2\r\n`
---

## Analyzing Exploit PCAPS

We have gathered PCAP files from a recent Windows Active Directory Exploit called Zerologon or CVE-2020-1472.

The scenario within the PCAP file contains a Windows Domain Controller with a 
- private IP of `192.168.100.6`
- attacker private IP ` 192.168.100.128 `

OpenVPN and ARP protocols
- unknown protocols = DCERPC , EPM
- attacker IP is sending all the requests
- `ip.src==192.168.100.128`
- 

Looking further at the PCAP we can see SMB2/3 traffic and DRSUAPI traffic, again with prior knowledge of the attack we know that it uses secretsdump to dump hashes. Secretsdump abuses SMB2/3 and DRSUAPI to do this, so we can assume that this traffic is secretsdump.

---
- https://infosecwriteups.com/wireshark-101-walkthrough-tryhackme-4d9f7d4264b0

- https://www.wireshark.org/docs/
- https://wiki.wireshark.org/SampleCaptures
- https://dfirmadness.com/case-001-pcap-analysis/
- https://tryhackme.com/room/overpass2hacked