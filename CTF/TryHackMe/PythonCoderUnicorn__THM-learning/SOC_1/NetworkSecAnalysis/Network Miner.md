NetworkMiner is an open-source traffic sniffer, pcap handler and protocol analyser. Developed and still maintained by Netresec.
- _NetworkMiner is an open source Network Forensic Analysis Tool (NFAT)_
-  _passive network sniffer/packet capturing tool to detect operating systems, sessions, hostnames, open ports etc. without putting any traffic on the network_
- parse pcap files

Network Traffic Analysis (NTA)

part of the Security Operations daily monitoring
incident response and threat hunting

## Intro Network Forensics

Network Forensics is a specific subdomain of the Forensics domain, and it focuses on network traffic investigation. Network Forensics discipline covers the work done to access information transmitted by listening and investigating live and recorded traffic, gathering evidence/artefacts and understanding potential problems.

-  the action of recording packets of network traffic and creating investigatable sources and establishing a root: cause analysis of an event
- GOAL = provide sufficient information to detect malicious activities, security breaches, policy/regulation compliance, system health and user behaviour.

process IDs hosts in terms: `time, frequency, protocol, app & data`

*having enough data and the right timeline capture is crucial*

Forensics use cases:
- network discovery
- packet reassembling (unencrypted trafic flows)
- data leakage detection 
- anomaly detection (review all ports, sources, destinations)
- policy/regulation compliance

Advantages of Network Forensics
- availability of network evidence (capture traffic)
- ease of data/evidence collection
- hard to delete transferred data 
- availability of log sources
- gather evidence to detect non-residential threats hiding in memory

Challenges of Network Forensics
- deciding what to do
- sufficient data/evidence collection
- short data capture (can't capture all network activity pre/during/post event)
- incomplete capture data on suspicious events
- encrypted traffic 
- GDPR & Privacy = capturing the traffic is same as recording everything
- nonstandard port usage (capture traffic on known ports but also uncommon ports)
- time zone issues 
- lack of logs  (attackers know logs are important so they delete them)

evidence resources to gather data 
`TAPS / inline devices / SPAN ports / Hubs / Switches / Routers / DHCP servers / name servers / authentication servers / forewalls / web proxies / central log servers / Logs (IDS/IPS, App, OS, device)`

## Network Miner 

```
traffic sniffing   = grabs traffic passing through network
parsing PCAP files = show content of packets
protocol analysis  = ID protocols in pcaps
OS fingerprinting  = ID OS from pcap
file extraction    = extract images , HTML files, emails from pcap
credential grabbing
clear text keywords = extract keywords & dtrings from pcap
```

Operating Modes
- sniffer mode (Windows only)  ignore this mode
- packet parsing / processing 

WIRESHARK IS BETTER FOR  FEATURES

## Using Network Miner

```
File > Open  or drag & drop pcap

Case Panel (rigth side) lists pcap files 

open > upload a .pcap file > case panel > right click > show meta data > expand window

----
use mx3.pcap

What is the total number of frames?

460

  
How many IP addresses use the same MAC address with host 145.253.2.203?

Hosts tab > MAC address (ascending) > expand 145.253.2.203
= 2

How many packets were sent from host 65.208.228.223?

Hosts tab > Sent Packets (descending) > expand 
Sent: 72 packets

How many packets were sent from host 65.208.228.223?

Host tab > Hostname > expand > Host details
Web Server Banner 1: TCP 80 Apache

# mx4.pcap

what is the extracted username?

Credential tab > username
#B\Administrator

what is the extracted password?

$NETNTLMv2$#B$136B077D942D9A63$FBFF3C253926907AAAAD670A9037F2A5$01010000000000000094D71AE38CD60170A8D571127AE49E00000000020004003300420001001E003000310035003600360053002D00570049004E00310036002D004900520004001E0074006800720065006500620065006500730063006F002E0063006F006D0003003E003000310035003600360073002D00770069006E00310036002D00690072002E0074006800720065006500620065006500730063006F002E0063006F006D0005001E0074006800720065006500620065006500730063006F002E0063006F006D00070008000094D71AE38CD601060004000200000008003000300000000000000000000000003000009050B30CECBEBD73F501D6A2B88286851A6E84DDFAE1211D512A6A5A72594D340A001000000000000000000000000000000000000900220063006900660073002F003100370032002E00310036002E00360036002E0033003600000000000000000000000000

```

part 2

```
mx7.pcap

What is the name of the Linux distro mentioned in the file associated with frame 63075?

Files > filter 63075 > Souce host = centos

  
What is the header of the page associated with frame 75942?

Files > filter 75942 > right click on Filename: index.html > open file
= password-ned AB

  
What is the source address of the image "ads.bmp.2E5F0FD9.bmp"?

Files > filter 2E5F0FD9 > source host: 80.239.178.187

  
What is the frame number of the possible TLS anomaly?

Anomalies 36255 

# mx9.pcap

Look at the messages. Which platform sent a password reset email?

facebook

  
What is the email address of Branson Matheson?

branson@sandsite.org

```

 
 version differences
 - 2.7 detects duplicate MAC addresses
 - 1.6 can handle frames
 - 1.6 provide more details on packet details

## Exercises

```
# case1.pcap

What is the OS name of the host 131.151.37.122?

Hosts > Hostname > Windows - Windows NT 4

---
- https://medium.com/@laupeiip/tryhackme-networkminer-write-up-3fa9c220c3e4

Investigate the hosts 131.151.37.122 and 131.151.32.91.  
How many data bytes were received from host 131.151.32.91 to host 131.151.37.122 through port 1065?

192 ?

  
Investigate the hosts 131.151.37.122 and 131.151.32.21.  
How many data bytes were received from host 131.151.37.122 to host 131.151.32.21 through port 143?

20769 ?

What is the sequence number of frame 9?

2AD77400

# case2.pcap

What is the USB product's brand name?

asix

Lumia 535

Files > Filter fish = Source host: 50.22.95.9

Credentials > Username: homer = Password: spring2015

pop.gmx.com

```

