Networks are simply things connected. For example, your friendship circle: you are all connected because of similar interests, hobbies, skills and sorts.

INTERNET
- The Internet is one giant network that consists of many, many small networks within itself
- private (intranet) or public networks (internet)

ID DEVICES on a network
- IP address
- media access control (MAC) address

### Internet Protocol address id's a host on a network

| octet 1 | octet 2 | octet 3 | octet 4   |
|---------|---------|----------|----------|
| (0-255) | (0-255) | (0-255)  | (0-255)  |
- example: `192.168.1.1`

### MAC address
- physical devices on network
- network interface motherboard is unique
- 12 character hexadecimal number
- first 6 chars represent the company
- last 6 chars is unique number
- `a4:c3:f0:85:ac:2d`
- these can be spoofed (faked) = 1 device pretends to id another using its MAC address
- [scenario] firewall allows comms to/from MAC of admins. IF device spoofs this MAC address, firewall will think its getting comms from the admin (not true)

## Ping ICMP
- ICMP = internet control message protocol
- ICMP packets determine the performance of a connection between devices (if connection exists)
- `ping -c 10.10.10.10`

## LAN Topology

Local Area Network (LAN). topology = design of a network

🌟 Star Topology ⭐
- devices indep connected via central networking device (switch, hub)
- more expensive but has advantages (scalable)
- more scale = more maintenance, harder to troubleshoot
- packets go thru the switch, if switch is down = network down

🚌 Bus Topology 🚌
- single connection, _backbone cable_
- prone to becoming slow and bottlenecks
- lots of packets => bottleneck
- difficult to troubleshoot, difficult to id which device has problem
- little redundancy in case of failures
- easy and cost effective
- `[]---|---|---|----[]`

💍 Ring topology 💍
- token topology
- devices connected directly to each other in a loop
- less cables and dependance on dedicated hardware
- a device will only send received data from another device in this topology it it does not have any to send itself
- if device has its own data, it sends that 1st
- easy to troubleshoot
- less bottlenecks
- if device or cable goes down= broken data, packet loss

## Switch

Switches are dedicated devices within a network that are designed to aggregate multiple other devices such as computers, printers, or any other networking-capable device using ethernet.

Switches are usually found in larger networks such as businesses, schools, or similar-sized networks, where there are many devices to connect to the network.

- Switches can connect a large number of devices by having ports of 4, 8, 16, 24, 32, and 64 for devices to plug into.

Router = It's a router's job to connect networks and pass data between them

## Subnetting

Subnetting is the term given to splitting up a network into smaller, miniature networks within itself.
- business: 3 departments
- internet --> router --> switch 🔡 <--> departments

Subnetting is achieved by splitting up the number of hosts that can fit within the network, represented by a number called a subnet mask

Subnets use IP addresses in three different ways:
- Identify the network address
- Identify the host address
- Identify the default gateway

**network address** {network} `192.168.1.0` <-- {device} `192.168.1.100`

**host address** ID's the device on the subnet `192.168.1.1`

**default gateway** special address given to a device on network, send info to another network.

- data that needs to go to a device not on same network will be sent to this device
- default use host address is `.1` or `.254` == `192.168.1.254`

homes do not typically have subnets

Subnetting provides benefits: 
- Efficiency, Security, Full control

Example: a cafe has subnets
- staff, cash machine, devices
- general public {hotspot}

## ARP protocol

- address resolution protocol (ARP) = allows devices to ID themselves on a network
- the ARP protocol associates with the MAC address on a IP address on a network
- each device logs the MAC addresses associated with other devices
- each device within network has logs (cache) which has ids of devices

ARP protocol sends out:
- ARP request : sends out message to devices asking if the MAC address matches the requested IP address. if yes, reply
- ARP reply : initial device gets reply and remembers this in cache ARP entry

## DHCP protocol

Dynamic Host Configuration Protocol (DHCP) = connect to a network
```
device_connected = true

if !assigned_IPaddress:

	then send_request and check if DHCP_servers > 0:

if DHCP_servers > 0:

	return IP_address and confirmation

if confirmation == true:

	return "device DHCP ACK"

```

---
## OSI Model

The OSI model (or _Open Systems Interconnection Model_) is an absolute fundamental model used in networking.

- layer 7 Application GUI
- layer 6 presentation: standardization translator
- layer 5 session create connection to other computer, makes a session (active)  syncs 2 computers on same page for data transfer, packets sessions are unique, data only between sessions
- layer 4 transport 2 protocols: TCP / UDP
	-  `TCP` transmission control protocol (reliable & constant connection)
	- `UDP` user datagram protocol (no sync, data gets sent regardless)
	
- layer 3 network routing packets for optimal path

	`Open Shortest Path First`
	`Routing Info Protocol` (RIP)
	what path is: shortest > most reliable > faster connection ?
	IP addresses and routers
	
- layer 2 data link 🔗 physical address of transmission
	gets packet from network and adds MAC (_media access control_) at end point
	`NIC` (_network interface card_) which has unique ID
	MACs cant be changed, can be spoofed
	data links presents data for transmission

- layer 1 physical physical wires to hardware `1` and `0`s
	ethernet cable

---

## Packets & frames

- [packet [frame] ]
- encapsulation (packet + frame)
- no encapsulation (frame)

## TCP
#tcp
- _transmission control protocol_ has 4 layers
- application
- transport
- internet
- network interface

`encapsulation` is adding packet data
TCP checks there is a connection client <--> server before data is sent

TCP PACKETS
- source port (sender open port, chosen @ random 0-65525 not in use)
- destination port (port service is running on remote host, port 80)
- source IP the device IP sending the packet
- destination IP
- sequence number when connection, piece of dta is given random number
- acknowledgement adds +1 to sequence number
- checksum TCP integrity, corrupt data if different from sent data
- data header stores the bytes of file
- flag specific flags for specific behaviour for packets

  
### 3 way handshake (connection between devices)

1. SYN initial packet sent by client to start connection, synch 2 devices
2. SYN/ACK receiveing device sends message to synch with client
3. ACK packet used by client / server to say messages/packets received
4. DATA connection established, data is sent
5. FIN packet is used to close connection
6. RST packet quickly ends all communication. some problem in process

any sent data is given random number sequence incrementing by 1
both computers must agree on number sequence

	SYN {client: _Initial Sequence Number_ (ISN) 0}
	SYN/ACK {server: ISN 5000, ACK ISN 0 }
	ACK {client: ISN 5000, data, ISN+1 }

TCP closing connection:
- TCP closes connection after data received ASAP --> FIN

### UDP
#udp User Datagram Protocol

- stateless
- no need for constant connection
- no 3 way handshake
- used for streaming video/ chat/ unstable connection
- _faster_ than TCP
- user software decides how fast packets are sent (flexible)

no setup process for connections, no safeguards for data integrity

- TTL = _Time to Live_ , expiry for packet, prevent clogging network
- source address = IP address of device packet is being sent from
- destination address = packet being sent to
- source port = port that sender sent TCP packet from, randomly chosen
- destination port = port the app/service is running on
- data = data bytes of file transmitted and stored

  
## Ports 101

ports enforce what can park and where
- data sent will be sent through these ports `0 - 65,535`
- web data is PORT 80
- PORT `0-1024` == "common port"
- FTP port 21 protocol to file sharing/ download files
- SSH port 22 protocol securely login to systems
- HTTP port 80 protocol www
- HTTPS port 443 securely encrypts wwww data
- SMB port 445 server message block, similar to FTP, printers
- RDP port 3389 remote desktop protocol, secure logging into system desktop GUI

### Port forwarding

Port forwarding is essential in connecting apps & services to the internet
configured by the router of a network
- network server IP address `192.168.1.10`

public access to network
```
 INTRANET: webserver on port 80 <----> [ computer_1, computer_2]
```

NETWORK 1: `192.168.1.10` port 80
```
INTRANET: webserver on port 80 <----> [ computer_1, computer_2]
```
- network 1 has IP address public `82.62.51.70` port 80

NETWORK 2: IP address `172.68.43.21`
```
network 2 --> network 1 public IP
```
  

  
  

### FIREWALL 🔥

A firewall is a device within a network responsible for determining what traffic is allowed to enter and exit.
- Where the traffic is coming from?
- Where is the traffic going to?
- What port is the traffic for?
- What protocol is the traffic using? UDP / TCP/ both?
- firewalls == packet inspections

`stateful` firewall:
	- determines the behaviour of a device upon whole connection
	- uses many resources
	- if connection from host is bad, it blocks the whole device

`stateless` firewall:
	- static set of rules to determine if packets are accepted
	- if device sends bad packet, not all device is blocked
	- less resource hungry but dumb (follows strict rules only)
	- can receive lots of traffic `DDOS` attack _Distributed Denial of Service_

  
  
  

### VPN

A Virtual Private Network (or VPN for short) is a technology that allows devices on separate networks to communicate securely by creating a dedicated path between each other over the Internet (known as a tunnel).

devices connected to same VPN can communicate
- VPNs allows networks in different locations to be connected
- privacy, encrypts data , not vulnerable to sniffing
- anonymous

VPN technology
- `PPP` authentication & encryption of data. private key and public certificate, they must match to connect
- `PPTP` point 👉 to point 👈 tunneling , easy to setup, widely used, weak encryption
- `IPSec` internet protocol security encrypts data , difficult to set up, strong encryption, widely supported

  
  
  
  

### LAN networking devices

- a router connects networks & passes data
- later 3 of OSI (open systems interconnection model)
- the interface with website or console that allows admin port forwarding or firewall
- routers are not the same as switches
- shortest path > most reliable > fastest path

SWITCH:
- networking device that connects multiple devices (3-63) using ethernet cable
- layer 2 and layer 3 (layer 2 cant work on layer 1)
- layer 2 uses MAC address, send frame to correct device
- layer 3 (semi router: sends frames and packets)

### VLAN _virtual local area network_

router:
- `192.168.1.1` == VLAN 1 (sales department)
- `192.168.2.1` == VLAN 2 (accounting department)
- VLAN 1 can't talk to VLAN 2 but can get internet

  
  
  

## DNS

- domain name system IP address <--> google.com
- `0-255`. `0-255`. `0-255`. `0-255` octets
### domain hierarchy

- root domain
- top level
- second level

url: `[subdomain]` `[second level]` `[top level]`

top level domain `TLD`  ".com"
- < 253 chars
- `gTLD` generic '.org', '.gov'
- `ccTLD` country code '.ca', '.co.uk', '.club'

second level domain
- domain name < 63 characters , a-z 0-9   `tryhackme`

subdomain
- `admin.tryhackme.`
- `jupiter.servers.tryhackme.com`
- same restrictions as 2nd level

  
  

### DNS record types

- records resolve to IPv4 addresses, for example `104.26.10.229`

AAAA Record

- records resolve to IPv6 addresses, for example `2606:4700:20::681a:be5`

CNAME (Alias) Record
- resolve another domain name
1. `mainwebsite.com`
2. `www.mainwebsite.com`
3. `mainwebsite.io`

each website points to the other

MX Record
- resolve the address of the service that do email for the domain
- `tryhackme.com` 
- MX record: `alt1.aspmx.l.google.com`

TXT Record
- free text fields data gets stored
- list servers with authority to send email for the domain

### Make a request

steps
1. request domain name (checks cache for history)
2. recursive DNS server => ISP (google etc are cached, sent back to you)
3. root server redirect you to TLD server
	
	[`request: tryhackme.com` ] .... root sever: '.com' ==> .com address

4. domain name server/s for TLD records where to find server to answer DNS request
5. authoritative DNS servers records domain name, has time to live value

- `nslookip --type=CNAME shop.website.thm`
- `server: 127.0.0.53`
- `nslookup --type=TXT website.thm`

  

# HTTP in detail

- hypertext transfer protocol
- HTTPS (HyperText Transfer Protocol Secure)
- URL = uniform resource locator

```
scheme//user@domain.com:port/path?query#fragment

http//user:password@tryhackme.com:80/view-room?id=1#task3

```

- scheme HTTP, HTTPS
- user `username : password`
- host domain `IP`
- port `port 80`
- path file name or location
- query string `./blog?id=1`
- fragment reference on actual page requested

```
GET / HTTP/1.1
Host: tryhackme.com
User-Agent: Mozilla/5.0 Firefox/87.0
Referer: https://tryhackme.com/
```

```
HTTP/1.1 200 OK
Server: nginx/1.15.8
Date: Fri, 09 Apr 2021 13:34:03 GMT
Content-Type: text/html
Content-Length: 98

<html>
<head>
	<title>TryHackMe</title>
</head>
<body>
	Welcome To TryHackMe.com
</body>
</html>

```

HTTP METHODS
- GET request
- POST request, submitting data to web server, new records
- PUT request submitting data to update info
- DELETE

  
HTTP STATUS CODES
- 100-199 = not commonly used
- 200-299 = successful request
- 300-399 = redirect client request
- 400-499 = error with request
- 500-599 = errors on server side, major problem with server

common status codes
- 200 = ok
- 201 = new user created
- 301 = permanent redirect , webpage moved
- 302 = temp redirect
- 400 = bad request, missing/error
- 401 = not authorized, username:password
- 403 = forbidden, no permission to view resource logged in/out
- 405 = method not allowed, sending GET when expecting POST
- 404 = page not found
- 500 = internal service error, sever couldn't handle request
- 503 = service unavailable , overloaded or down
  
## how websites work

There are two major components that make up a website:
- Front End (Client-Side): the way your browser renders a website.
- Back End (Server-Side): a server that processes your request and returns a response.

Javascript

```
<script src="/location/of/javascript_file.js"></script>

document.getElementById("demo").innerHTML = "Hack the Planet";

<button onclick='document.getElementById("demo").innerHTML = "Button Clicked";'>Click Me!</button>

```

  
### HTML injection
- sensitive data exposure == look in source code for credentials
- vulnerability that occurs when unfiltered user input is displayed on the page
- website fails to sanitize user input, and that input is used on the page, an attacker can inject HTML code

```
<script>
function sayHi(){
const name = document.getElementsById('name').value
document.getElementsById("welcome-msg").innerHTML = "welcome " + name
}
</script>

// NEVER TRUST USER INPUT
<a href="http://hacker"> in the input field

```

# Putting it all together
- Load Balancers have 2 main features:
- ensure high traffic websites can handle the load and provide fall over if server is unresponsive
- `request website --> load balancer gets request --> multiple servers`
- uses algorithms to decide which server for request
- `round robin` algorithm sends request to each server in turn and checks how many requests server is dealing with
- CDN content delivery networks
- allows host static files for website (JS, CSS, images, videos)
- CDN finds nearest server physically located

Databases
- store info
- webservers communicate with databases
- MySQL, MongoDB, GraphQL, Postgres etc

WAF _web app firewall_
- `web request --> WAF --> web server`
- job: protect app from hacking and denial of service

## how web servers work

A web server is a software that listens for incoming connections and then utilizes the HTTP protocol to deliver web content to its clients.

- Apache, Nginx, IIS and NodeJS
- Nginx and Apache share the same default location of /var/www/html in Linux operating systems
- IIS uses `C:\inetpub\wwwroot` for the Windows
- request: `http://www.example.com/picture.jpg `
- get: `/var/www/html/picture.jpg` from its local hard drive.

Virtual hosts
- web servers with many domain names
- checks HTTP headers, finds a match returns website. if no match default website shown
- `one.com` has `/var/www/website_one`
- `two.com` has `/var/www/website_two`
- no limit to websites on web server

Static vs dynamic content
- static = no changes, all files included
- dynamic = constant changes (blog, news site)

scripting & backend languages
- interactive websites
- interact with databases
- call external services
- process data from the user
- PHP, Python, Ruby, NodeJS, Perl and many more

  
### REQUEST TO WEBSITE PROCESS

1. request website in browser
2. check local cache for IP address
3. check recursive DNS server for address
4. query root server to find auth DNS server
5. auth DNS server advises IP address for the website
6. request passes thru web app firewall (WAF)
7. request passes thru load balancer
8. connect to webserver on port 80 or 443
9. web server receives the GET request
10. web app talks to database
11. browser render the HTML into website

