# Introductory Networking

**Platform:** [TryHackMe](https://tryhackme.com/)  
**Room:** [Introductory Networking](https://tryhackme.com/room/introtonetworking)

---

# The OSI Model: Overview

The OSI (Open Systems Interconnection) Model is a standardized conceptual framework used to understand how networking operates.

Although real-world networking primarily follows the TCP/IP model, the OSI model is often preferred for learning purposes because of its clear separation into seven distinct layers.

The OSI model consists of seven layers.

---

### Layer 7: Application

The Application Layer provides network services directly to user applications. It acts as the interface between software applications and the network.

---

### Layer 6: Presentation

The Presentation Layer translates data into a standardized format suitable for transmission.

It is responsible for:
- Data translation  
- Encryption / Decryption  
- Compression  

---

### Layer 5: Session

The Session Layer establishes, manages, and terminates sessions between two communicating systems.

Responsibilities:
- Session establishment  
- Session maintenance  
- Synchronization  

---

### Layer 4: Transport

The Transport Layer is responsible for end-to-end communication and protocol selection.

Two major protocols operate here:

- **TCP (Transmission Control Protocol)**: Reliable, connection-based communication.
- **UDP (User Datagram Protocol)**: Fast, connectionless communication.

Data units:
- TCP → Segment
- UDP → Datagram

---

### Layer 3: Network

The Network Layer handles logical addressing and routing using IP addresses.

Example:

```bash
192.168.1.1
```

Data unit: Packet

---

### Layer 2: Data Link

The Data Link Layer manages physical addressing using MAC addresses.

Responsibilities:
- Adds MAC addresses
- Error detection
- Frame formatting

Data unit: Frame

---

### Layer 1: Physical

The Physical Layer deals with hardware-level transmission of bits across the medium.

Data unit: Bits

---

## OSI Model: Answers

1. 4  
2. 2  
3. 2  
4. 1  
5. 6  
6. 5  
7. 7  
8. 3  
9. Segments  
10. 7  
11. UDP  

---

# Encapsulation

Encapsulation is the process of adding headers (and sometimes trailers) as data moves down the OSI layers.

- Transport Layer → Adds protocol info  
- Network Layer → Adds IP addresses  
- Data Link Layer → Adds MAC + trailer (FCS/CRC)

Data naming by layer:

| Layer | Name |
|-------|------|
| 5-7 | Data |
| 4 | Segment / Datagram |
| 3 | Packet |
| 2 | Frame |
| 1 | Bits |

The reverse process is called **De-encapsulation**.

---

## Encapsulation: Answers

1. Frames  
2. Datagrams  
3. De-Encapsulation  
4. Data Link  
5. Aye  

---

# The TCP/IP Model

The TCP/IP model forms the foundation of modern networking.

It consists of four layers:
1. Application  
2. Transport  
3. Internet  
4. Network Interface  

---

## Three-Way Handshake (TCP)

TCP establishes a connection using:

1. SYN  
2. SYN/ACK  
3. ACK  

This ensures reliable communication before data transmission begins.

---

## TCP/IP Model: Answers

1. TCP/IP  
2. Transport  
3. Application  
4. Physical  
5. Internet  
6. Connection-based  
7. Synchronise  
8. SYN/ACK  
9. ACK  

---

# Ping

Ping tests connectivity using ICMP.

Basic syntax:

```bash
ping <target>
```

Example:

```bash
ping bbc.co.uk
```

---

## Ping: Answers

1. `ping bbc.co.uk`  
2. 217.160.0.152  
3. -i  
4. -4  
5. -v  

---

# Traceroute
Traceroute can be used to map the path your request takes as it heads to the target machine.

Linux:

```bash
traceroute <destination>
```

Windows:

```bash
tracert <destination>
```

---

## Traceroute: Answers

1. -i  
2. -T  
3. Internet  

---

# WHOIS
Domains are leased out by companies called Domain Registrars. If you want a domain, you go and register with a registrar, then lease the domain for a certain length of time.

Whois essentially allows you to query who a domain name is registered to.

```bash
whois <domain>
```

## WHOIS: Answers

1. 94025  
2. 29/03/1997  
3. Redmond  
4. Bellevue Golf Course  
5. msnhst@microsoft.com  

---

# Dig & DNS
Dig allows us to manually query recursive DNS servers of our choice for information about domains.

```bash
dig <domain> @<dns-server-ip>
```

DNS resolution order:

1. Hosts File  
2. Local DNS Cache  
3. Recursive DNS Server  
4. Root Server  
5. TLD Server  
6. Authoritative Name Server  

TTL is measured in seconds.

24 hours = 86400 seconds.

---

## Dig: Answers

1. Domain Name System  
2. Recursive  
3. Top-Level Domain  
4. Hosts File  
5. 8.8.4.4  
6. 86400  

---

# Conclusion

This room provided foundational understanding of:

- OSI vs TCP/IP models  
- Encapsulation  
- TCP three-way handshake  
- Networking tools (ping, traceroute, whois, dig)  
- DNS resolution process  

A strong networking foundation is essential for cybersecurity and penetration testing.