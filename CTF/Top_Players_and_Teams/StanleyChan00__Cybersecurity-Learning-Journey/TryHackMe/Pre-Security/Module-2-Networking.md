# TryHackMe Pre Security: Module 2: Network Fundamentals

## What is Networking?
A network isn't necessarily exclusive to devices and computers. Anything connected together can form a network, such as a public transportation system or a network of friends within a neighborhood.

A network, in the context of cybersecurity, is simply a group of devices connected to each other. The internet is what connects private networks together.

**Internet Protocol(IP) Address:** An identifying number assigned to a device on a network. A public address (given by the Internet Service Provider (ISP)) identifies that network on the wider global internet, while a private address identifies a specific device within a local network.

Example IP address: `192.168.1.1`

Each section of the IP address is known as an octet. IPv4 is currently the main numbering protocol being used. IPv6 is the newer protocol, which allows for a  larger number of IP addresses.

**Media Access Control(MAC) Address:** This is the unique physical identifier that comes with each device and can not be changed.

Example MAC address: `a4:c3:f0:85:ac:2d`

An example of an attack is called "spoofing" which is a malicious attacker pretending to have a different MAC address to gain access into a poorly made system. 

**Ping:** `ping` is the command used to test the connection between devices. It does this by sending Internet Control Message Protocol(ICMP) packets to a device and tests the time for it to go to the device and back. 

The syntax is just: `ping "(IP Address/URL)"`

## Intro to LAN
### Local Area Network(LAN) Topologies:
The architecture of a network. Here are various types. Each one has unique pros and cons and can be understood by understanding how data flows through each topology. Like everything, don't memorize the pros and cons but understand the mechanisms. The weaknesses and strengths will become naturally apparent. 

#### Star Topology:
The predominating feature of this topology is a central networking device which has all the devices connect individually to it. 

#### Bus Topology:

Visually speaking, it’s just a tree branch that has further branches that stem from that *singular* branch.

All the data travels through the same branching cable.

#### Ring Topology:

All the devices are connected to each other in a form of a loop. Data can only travel in one direction through each device, like a circle.

---

#### Switch:

Rather than indiscriminately sending data out to everyone, a switch is a device which allows you to discriminately decide which device will get the data. 

Like a mailman handing out mail that was designated for a single house. 

#### Router:

A router connects networks together. A home router, for example, connects that private local area network(LAN) to the public wide area network(WAN/Internet).

---

### Subnetting:

This is the process of splitting up a network into smaller individually separated networks. An example would be a business that has different departments within their organization dividing up their network so each department has their own unique subnet.

This is very important for security as it isolates groups that shouldn't have access to another. For example, a Starbucks having multiple networks, one for employees, one for customer Wi-Fi, one for cashiers, one for cameras, etc... Its very important for these groups to be isolated. 

This is done through **subnet masks**. 

Converting to binary:

To understand this, we need to understand that IP addresses are not just numbers but in computer terms, bits. Specifically, 32 bits .*(Note, this isn’t in this specific module of the course but I wanted to ensure I understood it)*

Example: IP address:

`192.168.1.10` is actually `11000000.10101000.00000001.00001010`

This conversion happens within each octet and each octet has 8 values. Whenever one bit is flipped “on” as “1”, that value will get added with the rest of the other bits that are also flipped “1”

The positional values within an octet are as follows:

`128, 64, 32, 16, 8, 4 , 2 , 1` so with our example, the 2nd octet of our IP address, 10101000, will be:

`128 + 0 + 32 + 0 + 8 + 0 + 0 + 0 = 168`

Hence how we get the second octet of our example IP 192.**168**.1.10

#### Subnet Masks:
This is how we both translate an IP address to see which network it is on as well as how we define the bounds of the subnets.

Subnet masks look just like an IP address and are also 32 bits long. The difference here is that they **always** have consecutive 1s followed by consecutive 0s. 

It looks like this for example: `255.255.255.0` or in binary `11111111.11111111.11111111.00000000`

You line this up with the IP address of a device. Each "1" that the IP address lines up represents the network address. To illustrate:

`11000000.10101000.00000001.00001010` - IP address: `192.168.1.10/24`

`11111111.11111111.11111111.00000000` - Subnet Mask: `255.255.255.0` 

Every time the 1 appears, we just carry it down from that same position within the IP address. By doing so, we get the following network address:

`11000000.10101000.00000001.00000000` - Network address: `192.168.1.0`

*(Just to note that `/24` used is the notation for expressing the amount of "1s" in the subnet mask. Here, there are 24 "1s": 3 octets hence "/24". This notation is called Classless Inter-Domain Routing(CIDR))*

**Subnetting:** In regards to the example above, the entire last octet is available for use. That means that there is a maximum of 256 devices/IP address that can be used on that network.

Now, say we want to division out this network and have 2 seperate subnets instead. To do this, we just "borrow" a bit from the subnet mask. So now the subnet mask would be:

`11111111.11111111.11111111.10000000` - Subnet Mask: `255.255.255.128` 

By doing this, the network was effectively cut in half. It went from one network with 256 devices to two networks with 128 devices each. All the devices with an IP address of:

`192.168.1.0/25` through `192.168.1.127/25` are now in the first subnet, say the accounting department. While the IP addresses of: `192.168.1.128/25` through `192.168.1.255/25` are in the second subnet, say the HR department.

Thus the network has successfully been divded and grouped up into 2 subnets. If we want to divide it up into more subnets, we do the same thing and "borrow" another bit from the subnet mask(now /26). Which would now make for 4 subnets. /27 would be 8 subnets and so on. 

**Default Gateway & Broadcast address:** These are usually the first and last address respectively on each subnet. The default gateway is the router which sends data out to different subnets or the internet and the broadcast address is used to send out data to all the devices within a subnet. 

**Address Resolution Protocol(ARP):** This is how a device finds another device on the network. It sends a broadcast out to the network asking "who has X IP address". The device with that IP address responds with their MAC address. Now that device is identified and can be stored on the ARP cache.

**Dynamic Host Configuration Protocol(DHCP):** This is how a device obtains an IP address. The process in which this happens can be remembered by the acronym "DORA"("Discover. Offer. Request. Acknowledge").

The device sends out a broadcast, searching for the DHCP server. The DHCP server responds with an available IP address that's open to use. The device then confirms that it wants that IP address and the DHCP acknowledges and finalizes it. 

## OSI Model
Open Systems Interconnection Model. This is the conceptual framework in how devices send, receive, and interpret data. 

There's 7 layers. It can be remembered by this mnemonic:

"Please Do Not Throw Sausage Pizzas Away" as in "Physical. Data link. Network. Transport. Session. Presentation. Application"

At each layer from layer 7 moving towards the physical layer, the data gets wrapped up before getting sent to the next layer via **encapsulation**.

**De-encapsulation** is the opposite process as data gets unwrapped moving from layer 1 and on.

### 1.) Physical
This is the physical real world layer that sends data via electricity or otherwise. All the wires, ethernet cables, etc lives here.

The data chunks here are **bits**.

### 2.) Data Link
This is where physical MAC addresses are used to forward the data to the correct physical device. The ARP and MAC address knowledge lives here.

This layer receives "packets" (Next lesson covers this more) from the network layer and adds in the physical MAC address for the receiving point and wraps it as **"frames"**

Also every network enabled computer has a “NIC”(Network Interface Card) which has the MAC address burned onto it.

### 3.) Network
This is where all the network routing takes place, where data is sent through subnets or the internet. 

It takes "segments" from the transport layer and wraps them with IP addresses as **"packets"** before sending them on their way. 

 Protocols for routing include:
 
* Open Shortest Path First(OSPF)  
* RIP(Routing Information Protocol)

### 4.) Transport
This layer determines how data is split up and actually sent. It wraps data as **"segments"** before sending it to the network layer.

Two different Protocols:

TCP(Transmission Control Protocol):
* Keeps constant connection between devices for the entire duration in which data is sent and received
* Reliability and guarantee is the goal

UDP(User Datagram Protocol):
* No continuous connection.
* This is much faster but is also less reliable and it doesn’t care if data is received.
* Packets sent can be lost and the receiver gets only half the “picture”
* (Data chunks from this protocol are called **"datagrams"**)
### 5.) Session
This is the connection between the devices that is maintained while the communication between them is established and open.

“Checkpoints” can also be used, which is as it sounds like. Also, the session is called a session when connection is successfully established.

### 6.) Presentation
This is where data is translated and formatted so that it's ready to be seen.

Since computers speak in binary so this binary data needs to be translated so that it can understood by the application layer.

This is also where encryption and data compression happens.

### 7.) Application
The interface **between** the user and the network, which allows them to send and receive data. 

GUI(Graphical User Interface) or DNS(Domain Name System, how website addresses are translated into IP addresses).

## Packets & Frames
As covered already in the OSI model: packets are data that's encapsulated in layer 3, the Network layer containing IP address information. 

When sent to the 2nd layer, the Data Link layer, they're wrapped as "frames" which includes the physical MAC address. 

Some packet headers that may be attached in layer 3:

* Time to Live(Expiry timer on the packet)
* Checksum(Checks if the data was corrupted)
* Source Address
* Destination Address

### Transmission Control Protocol(TCP): The three way handshake: 
Unlike the OSI model, which is a theoretical concept, the **TCP/IP** model is the current foundational archtiteture used today for the internet and modern networks. 

It has 4 layers and is pretty much just a condensed version of the OSI model.

1.) Network Interface(Basically all the hardware and physical stuff)
2.) Internet(Network)
3.) Transport
4.) Application

Some crucial TCP headers:

* Source Port: Random available port chosen from 0-65535 that's opened by the sender to send a TCP packet
* Destination Port: The receiving port. This is not a random port number chosen.
* Source IP & Destination IP: As it sounds
* Sequence Number: Explained more below
* Acknowledgement Number: Sequence number + 1
* Checksum: As explained prior
* Data:
* Flag: Determines how the packet should be handled by the three way handshake process below

#### Three Way Handshake:

As I already noted, TCP is the reliable protocol which keeps a constant connection the entire time until everything is finished. 

<img width="50%" height="50%" alt="Three Way Handshake" src="https://github.com/user-attachments/assets/4172dee9-a548-4e3f-bca7-25d4779bbb36" />

The picture from the lesson above is what this protocol looks like. 

* **SYN** = Synchronize 

* **ACK** = Acknowledge

What happens here is:

1.) The initial person at "SYN" picks a random number called "Initial Sequence Number"(ISN) and sends it to the receiver. T

2.) The receiver then acknowledges that ISN and adds one to it. This is the acknowledgment number. They also have their own sequence number and send that back to the initial person. 

3.) That initial person then acknowledges that new sequence number(By adding one) along with confirming their ISN +1, then sends it back a final time 

Now the connection is established and the **DATA** message is sent. 

There is also:

* FIN = Properly closes the connection 
* RST = last resort aborts/ends all connection

<img width="50%" height="50%" alt="Closing Three Way Handshake" src="https://github.com/user-attachments/assets/7d4176c5-2d2f-4b1a-9940-a8961319b19a" />

The proper closure of the connection via FIN packets looks like the above. 

### UDP/IP

As previously noted, UDP is the much faster protocol than TCP. However it can lose data and have unstable connections. 

It's a **stateless** protocol which does not require constant connection between the devices. Checksum is also not here as there is no regard for whether data is received or not.

Some UDP packet headers:

* Time to Live(TTL): Expiry time for the packet
* Source & Destination Address
* Source Port: Same as TCP header
* Destination Port: Same as TCP header
* Data

UDP for example would be used for a video call. TCP would be used for file transfer. 

### Ports
As noted already, ports range from 0-65,535. We can imagine them as rooms.

Each device has its own set of 65,535 available private "rooms". Whenever we connect to another server, we temporarily open up one of our "rooms" to establish a connection to that server's "room", essentially making a path from our room to theirs. 

So for example, if I wanted to go to youtube on my laptop, I would connect to Youtube's IP via the Domain Name System(Covered in the next web module [here](Module-3-Web.md)) and knock on one of their ports, specifically port 443, to connect to their website.

Our device would open up a temporary port, usually one between 49,152 and 65,535(These are called ephemeral ports, which are the temporary ports we use to browse the web), to connect to them and finally establish a connection.

Now, we specifically ask for port 443 because port 443 is the port agreed upon by the internet to be designated for the HTTPS protocol. So whenever we want to visit a HTTPS website, we always knock on port 443 of that IP address to get there.  

All the ports from 0-1023 are like this and are known as "common ports" or "well-known ports" reserved for specific services or protocols. Here are a few more as examples.

* File Transfer Protocol(FTP): Port 21: Download files from here
* Secure Shell(SSH): Port 22: Used to securely login to systems
* HyperText Trasnfer Protocol(HTTP): Port 80: Websites
* HyperText Transfer Protocol Secure(HTTPS): Port 443: Encrypted and secure HTTP for websites
* Server Message Block(SMB): Port 445: Shares files as well as devices
* Remote Desktop Protocol(RDP): Port 3389: Control a device over a network. Proprietary from Microsoft

  
## Extending Your Network

### Port Forwarding 
Say I'm hosting a server, a minecraft server for example. Without port forwarding, my friend(let's say Jack) will not be able to access my server. Only those within my network have access to it.

So to "open" it, I use port forwarding. That is, allowing access to my minecraft server(the port) via my router.

So when someone requests a connection to my public IP asking for this specific port(our minecraft server), my router will now send them to that port on our private IP address.

Port forwarding essentially just opens up this door(our port) for entry and allows "Jack" to get into my minecraft server. 

It allows the network to go from this:

<img width="100%" height="100%" alt="Network 1" src="https://github.com/user-attachments/assets/94b2cf0d-334a-4c7c-a650-176e07df1d3f" />

To this:

<img width="100%" height="100%" alt="Port Forwarding" src="https://github.com/user-attachments/assets/0e25981a-a425-4cbc-92f0-34fe50c5dbb4" />

### Firewalls 
This is the border security of our network. It filters what can come in or out of a network. This is crucial for security because it's like a security guard filtering who can come into a building. 

Filters can be determined by factors such as the traffic source/destination, port entry, protocol usage, etc.

Can be categorized into 2-5 types. But primary categories taught in this lesson:

* Stateless 
* Stateful
  
In essence, stateless does not have memory and is strictly rules based.

Whereas stateful is much more intelligent, is context & memory based("State Table"), and adapts to dynamic situations. 

### VPN Basics 
Virtual Private Network(VPN)

From a consumer standpoint, we understand VPNs as a service that hides our IP from the public internet as well as encrypts our data so it's not visible to the router or our ISP.(I am currently using a VPN today!)

However, VPNs also have a corporate purpose that works in fundamentally the same way. For example, it would allow an employee to go home and access the office's network on their device at home while remaining secure as all the data is encrypted.

They're virtually dropped right into the office network while they are at their home. 

Another method, which is what the TryHackMe course is using as an example, is 2 offices forming a "tunnel" between them by connecting two devices across each other as a VPN, forming a "third" network. (These are Site-to-Site VPNs)

Which allows files to be shared across each other securely in the same way through that "third" network. 

Some VPN Technologies:

* Point-to-Point Protocol(PPP): PPTP uses this protocol. This is what authenticates the user and packages the data. Can not travel out of the network on it's own.
* Point-to-Point Tunneling Protocol(PPTP): This is what wraps the PPP data and allows it to travel
  *(note PPP & PPTP are old and outdated/obsolete. Encryption is weak and big security flaws)*
* Internet Protocol Security(IPSec): This is the main VPN protocol suite(It's not a single protocol but a collection of protocols) used today. Quickly, how it's used:

Three main protocols used by IPSec:
1) Authentication Header(AH): Authenticates the data and also checks for data corruption(like checksum)
2) Encapsulating Security Payload(ESP): Encrypts the data
3) Internet Key Exchange(IKE): Sets up how the devices talks to each other and securely share the encryption keys
   
Two different modes in which IPSec is used:
1) Transport mode: Only encrypts the data, not the IP
2) Tunnel mode: Encrypts both the data and IP by wrapping them in a new packet(Site-to-Site VPNs)

### VLAN
Switches can operate on both layer 2 and 3. However layer 2 switches can't operate on layer 3 as they lack the ability to read IP addresses. Layer 3 switches can do both. 

Virtual Local Area Networks(VLANs) are very similar to subnets. However, subnets split up a network based off of IP addresses. Whereas VLANs split up a network right out of layer 2 using the switch. Switches isolate the "networks" within the device itself virtually. 

Subnets and VLANs are almost always paired together, used alongside each other.
