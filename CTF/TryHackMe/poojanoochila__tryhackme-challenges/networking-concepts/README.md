# Networking Concepts 

## Overview

This room introduces the fundamental concepts of computer networking. It covers how devices communicate across networks, the purpose of IP addresses, MAC addresses, ports, protocols, DNS, and the layered networking models used in modern communication.

Understanding these concepts is essential for cybersecurity professionals, network administrators, SOC analysts, penetration testers, and anyone working with computer systems.

---

## Learning Objectives

- Understand what a network is
- Learn about IP addressing
- Differentiate between public and private IP addresses
- Understand MAC addresses
- Learn the purpose of ports and protocols
- Understand DNS and domain name resolution
- Explore common networking protocols
- Learn the OSI and TCP/IP networking models

---

## What is a Network?

A network is a collection of devices connected together to exchange information and resources.

Examples include:

- Home Wi-Fi networks
- Corporate networks
- University networks
- The Internet

Networks allow devices such as computers, servers, smartphones, and printers to communicate efficiently.

---

## IP Addresses

An IP (Internet Protocol) address uniquely identifies a device on a network.

### IPv4 Example

192.168.1.10

IPv4 addresses consist of four octets separated by periods.

### Public IP Addresses

Public IPs are reachable from the Internet and are assigned by Internet Service Providers (ISPs).

Example:

8.8.8.8

### Private IP Addresses

Private IP addresses are used within local networks and are not directly accessible from the Internet.

Common private ranges:

| Range | Purpose |
|---------|---------|
| 10.0.0.0: 10.255.255.255 | Private Networks |
| 172.16.0.0: 172.31.255.255 | Private Networks |
| 192.168.0.0: 192.168.255.255 | Home/Office Networks |

---

## MAC Addresses

A MAC (Media Access Control) address is a unique hardware identifier assigned to a network interface card (NIC).

Example:

00:1A:2B:3C:4D:5E

Characteristics:

- Layer 2 address
- Used within local networks
- Usually permanently assigned by manufacturers

---

## Ports

Ports allow multiple services to run on a single device.

Common Ports:

| Port | Service |
|--------|---------|
| 21 | FTP |
| 22 | SSH |
| 23 | Telnet |
| 25 | SMTP |
| 53 | DNS |
| 80 | HTTP |
| 110 | POP3 |
| 143 | IMAP |
| 443 | HTTPS |
| 3389 | RDP |

Ports help direct traffic to the appropriate application or service.

---

## Protocols

Protocols define rules for communication between devices.

### TCP (Transmission Control Protocol)

Features:

- Reliable communication
- Error checking
- Connection-oriented

Common uses:

- Web browsing
- Email
- File transfers

### UDP (User Datagram Protocol)

Features:

- Faster communication
- No connection establishment
- Less overhead

Common uses:

- Streaming
- Gaming
- VoIP

---

## DNS (Domain Name System)

DNS translates human-readable domain names into IP addresses.

Example:

google.com → 142.250.x.x

Without DNS, users would need to remember IP addresses for every website.

DNS acts as the Internet's phonebook.

---

## Common Networking Devices

### Router

Routes traffic between networks and the Internet.

### Switch

Connects devices within the same network and forwards traffic efficiently.

### Firewall

Filters incoming and outgoing network traffic based on security rules.

### Access Point

Provides wireless connectivity to network devices.

---

## OSI Model

The OSI (Open Systems Interconnection) Model contains seven layers.

| Layer | Function |
|---------|----------|
| 7 | Application |
| 6 | Presentation |
| 5 | Session |
| 4 | Transport |
| 3 | Network |
| 2 | Data Link |
| 1 | Physical |

### Layer Breakdown

#### Application Layer
User-facing services such as HTTP, FTP, SMTP.

#### Presentation Layer
Handles encryption, compression, and formatting.

#### Session Layer
Manages communication sessions.

#### Transport Layer
Responsible for TCP and UDP communications.

#### Network Layer
Handles IP addressing and routing.

#### Data Link Layer
Uses MAC addresses for local communication.

#### Physical Layer
Transfers raw bits across cables or wireless media.

---

## TCP/IP Model

The TCP/IP model is the practical networking model used on the Internet.

| Layer | Responsibilities |
|---------|-----------------|
| Application | User services |
| Transport | TCP / UDP |
| Internet | IP Routing |
| Network Access | Physical transmission |

---

## Packet Transmission Process

When accessing a website:

1. User enters a domain name.
2. DNS resolves the domain to an IP address.
3. TCP connection is established.
4. HTTP/HTTPS request is sent.
5. Server responds with requested data.
6. Browser renders the webpage.

---

## Security Relevance

Networking concepts are foundational for cybersecurity.

Applications include:

- Traffic analysis
- Intrusion detection
- Network monitoring
- Threat hunting
- Incident response
- Penetration testing
- SOC operations

Understanding protocols, ports, IP addressing, and packet flow enables security analysts to identify suspicious activity and investigate attacks effectively.

---

## Key Takeaways

- Networks enable communication between devices.
- IP addresses uniquely identify devices.
- MAC addresses identify network interfaces.
- Ports allow multiple services to operate simultaneously.
- DNS translates domain names into IP addresses.
- TCP provides reliable communication, while UDP prioritizes speed.
- The OSI and TCP/IP models explain how network communication functions.
- Networking knowledge forms the foundation of cybersecurity analysis and defense.

---

## Tools and Concepts Covered

- IP Addressing
- MAC Addressing
- DNS
- TCP
- UDP
- Network Devices
- OSI Model
- TCP/IP Model
- Ports and Services

---

## Conclusion

The Networking Concepts room provides a strong foundation in networking fundamentals. These concepts are essential for understanding how systems communicate and are critical for cybersecurity careers, particularly in SOC analysis, threat hunting, incident response, and penetration testing.

Mastering these fundamentals creates the groundwork for more advanced topics such as packet analysis, network security monitoring, and attack detection.
