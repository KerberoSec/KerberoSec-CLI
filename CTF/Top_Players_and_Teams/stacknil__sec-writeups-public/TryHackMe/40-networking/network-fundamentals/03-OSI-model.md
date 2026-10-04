---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, networking, osi]
source: TryHackMe: OSI Model
platform: tryhackme
room: OSI Model
slug: osi-model
path: TryHackMe/40-networking/network-fundamentals/03-OSI-model.md
topic: 40-networking
domain: [networking]
skills: [osi-model, tcp-ip, ports]
artifacts: [concept-notes]
sanitized: true
---

# OSI Model

> Room: **OSI Model**: networking fundamentals for security

---

## Summary

**OSI (Open Systems Interconnection) model** is a 7‑layer conceptual model describing how data moves from one application to another across a network.

For security work, it is basically a **map of where attacks and controls live**:

* Web exploits → mostly **Layer 7: Application**
* TLS, encryption, data formats → **Layer 6: Presentation**
* Sessions, cookies, VPN tunnels → **Layer 5: Session**
* Port scans, DoS, TCP handshake tricks → **Layer 4: Transport**
* IP addressing, routing, subnets → **Layer 3: Network**
* ARP spoofing, MAC filtering, VLANs → **Layer 2: Data Link**
* Cable taps, Wi‑Fi jamming, physical access → **Layer 1: Physical**

When a packet is sent, every layer **adds its own header/trailer** (encapsulation). On the way back up the stack at the receiver, layers **strip their headers** (decapsulation).

```text
Sender (encapsulation)                           Receiver (decapsulation)

L7 Application   ── data ─────────────────────▶  L7 Application
L6 Presentation  ── [L6 hdr][data] ───────────▶  L6     ▲
L5 Session       ── [L5 hdr][... ] ───────────▶  L5     │
L4 Transport     ── [TCP/UDP hdr][... ] ─────▶  L4     │
L3 Network       ── [IP hdr][... ] ──────────▶  L3     │
L2 Data Link     ── [MAC hdr][... ][FCS] ────▶  L2     │
L1 Physical      ── bits on wire / RF ───────▶  L1     │
```

---

## Key Concepts

### 2. Layer overview

| Layer | Name         | PDU (data unit)                | Typical devices / examples         |
| ----: | ------------ | ------------------------------ | ---------------------------------- |
|     7 | Application  | Data                           | Browser, mail client, DNS resolver |
|     6 | Presentation | Data                           | TLS/SSL, codecs, encoders          |
|     5 | Session      | Data                           | Session manager, RPC, NetBIOS      |
|     4 | Transport    | Segment (TCP) / Datagram (UDP) | TCP, UDP, ports                    |
|     3 | Network      | Packet                         | IP, routers, layer‑3 firewalls     |
|     2 | Data Link    | Frame                          | Switch, NIC, MAC, ARP, VLAN        |
|     1 | Physical     | Bits                           | Cables, Wi‑Fi, hubs, repeaters     |

---

### 3. Layer 1: Physical

**Role:** Move raw bits between devices.

* Medium: copper cables, fibre, radio (Wi‑Fi), infrared, etc.
* Encodes `1` and `0` as **voltage levels, light pulses, radio waves**.
* Defines: pinouts, connector types, electrical/optical specs, data rate.

**Examples:** Ethernet cabling, Wi‑Fi radio, Bluetooth, repeaters, hubs.

**Security notes:**

* Cable taps, hardware keyloggers, RF jamming are **physical‑layer attacks**.
* If an attacker owns this layer (physically in your rack), higher‑layer controls are weakened.

---

### 4. Layer 2: Data Link

**Role:** Local delivery over a single link / LAN.

* Uses **MAC addresses** (Media Access Control) burned into NICs.
* PDU is a **frame**: `[Dst MAC][Src MAC][Payload][FCS]`.
* Provides error detection (Frame Check Sequence) and framing.
* Converts Layer‑3 packets into frames suitable for the local medium.

**Devices & protocols:**

* NICs, **switches**, bridges, wireless access points.
* ARP (Address Resolution Protocol) lives logically between L2 and L3, mapping IP ⇄ MAC.

**Security notes:**

* **MAC spoofing** to bypass simple MAC filters.
* **ARP spoofing / poisoning** → man‑in‑the‑middle on LAN.
* VLAN hopping and switch misconfiguration issues.

---

### 5. Layer 3: Network

**Role:** End‑to‑end logical addressing and routing between networks.

* Uses **IP addresses** (e.g., 192.168.1.10).
* PDU is a **packet**.
* Responsible for **routing**: choosing a path through multiple networks.
* Handles fragmentation / reassembly when packets cross links with different MTU sizes.

**Devices & protocols:**

* Routers, layer‑3 switches, firewalls.
* Protocols: IPv4/IPv6, ICMP, routing protocols such as **OSPF** and **RIP** (THM only names them).

**Security notes:**

* IP spoofing, routing table poisoning, ICMP misuse (ping sweeps, covert channels).
* Subnetting is a Layer‑3 design tool: split networks for **isolation and control**.

---

### 6. Layer 4: Transport (TCP vs UDP)

**Role:** Host‑to‑host delivery, ports, reliability.

* Identifies **applications** on a host using **port numbers** (e.g., TCP 80, UDP 53).
* Manages how data is chopped into segments and re‑ordered.

#### TCP: Transmission Control Protocol

* **Connection‑oriented**, reliable, ordered.
* Uses the **3‑way handshake**: `SYN → SYN/ACK → ACK`.
* Provides acknowledgements, retransmission, and flow control.
* Slower but safe: used for web (HTTP/S), email, file transfer, etc.

#### UDP: User Datagram Protocol

* **Connectionless**, “fire‑and‑forget”.
* No guarantee of delivery, ordering, or duplicate protection.
* Much lower overhead → better for **real‑time** data: VoIP, video streaming, DNS queries, discovery protocols.

**Security notes:**

* Port scans (Nmap etc.) target **Layer‑4 ports**.
* SYN floods, UDP floods, and other DoS attacks abuse transport behaviour.

---

### 7. Layer 5: Session

**Role:** Create, manage, and tear down logical **sessions** between hosts.

* Sets up, maintains, and closes communication channels.
* Can implement **checkpoints / resynchronisation** so only recent data must be resent on failure.
* Each session is unique; data from one session is not mixed with another.

**Examples (conceptual):**

* Login sessions, RPC sessions, SMB sessions.
* Under the hood of many “stateful” protocols, though modern stacks often blur L5 with L4/L7.

---

### 8. Layer 6: Presentation

**Role:** Translate data formats so different applications can understand each other.

* Handles **encoding, compression, and encryption**.
* Converts between internal data formats and standard formats for the wire.

**Examples:**

* Text encodings (ASCII, UTF‑8), image formats (JPEG, PNG), video codecs.
* **TLS/SSL** encryption for HTTPS (often pictured at this layer).

**Security notes:**

* Where data is **encrypted/decrypted**; weak ciphers or bad implementations leak here.

---

### 9. Layer 7: Application

**Role:** Closest to the user: defines **how software talks on the network**.

* Implements high‑level protocols and user‑visible behaviour.
* Every application protocol has its own message formats and semantics.

**Examples:**

* **HTTP/HTTPS**: web browsing & APIs
* **SMTP/IMAP/POP3**: email
* **DNS**: name resolution
* **FTP/SFTP**, **SSH**, file‑sharing, chat protocols, etc.

**Security notes:**

* Most CTF web rooms and real‑world app bugs are here: XSS, SQLi, auth bypass, IDOR, etc.
* Good understanding of OSI helps map an observed bug back down to the right layer (firewall, router, app code…).

---

### 10. Quick “mental elevator” from L1 to L7

```text
User clicks a link in the browser (L7)
  ↓
Browser builds an HTTP request (L7) and maybe encrypts it with TLS (L6)
  ↓
Session for this TCP connection is tracked (L5)
  ↓
TCP segments with source/dest ports are created (L4)
  ↓
Each segment is wrapped in an IP packet with source/dest IP (L3)
  ↓
IP packets are wrapped into Ethernet/Wi‑Fi frames with MAC addresses (L2)
  ↓
Frames are converted to electrical/optical/RF signals on the wire/air (L1)
```

On the way back, the receiving host walks **up** the same staircase, stripping headers and finally handing the HTTP response to the browser.

---

### 11. Key terminology (EN → ZH)

| Term (EN)                                  | 中文术语                |
| ------------------------------------------ | ------------------- |
| OSI model (Open Systems Interconnection)   | OSI 模型 / 开放系统互连模型   |
| Layer                                      | 分层 / 层              |
| Encapsulation                              | 封装                  |
| Decapsulation                              | 解封装                 |
| Physical layer                             | 物理层                 |
| Data Link layer                            | 数据链路层               |
| Network layer                              | 网络层                 |
| Transport layer                            | 传输层                 |
| Session layer                              | 会话层                 |
| Presentation layer                         | 表示层                 |
| Application layer                          | 应用层                 |
| MAC address                                | MAC 地址 / 物理地址       |
| NIC (Network Interface Card)               | 网卡                  |
| IP address                                 | IP 地址               |
| Router                                     | 路由器                 |
| Switch                                     | 交换机                 |
| Frame                                      | 帧                   |
| Packet                                     | 分组 / 数据包            |
| Segment (TCP)                              | 段                   |
| PDU (Protocol Data Unit)                   | 协议数据单元              |
| TCP (Transmission Control Protocol)        | 传输控制协议 TCP          |
| UDP (User Datagram Protocol)               | 用户数据报协议 UDP         |
| Routing                                    | 路由                  |
| Subnetting                                 | 子网划分                |
| ARP (Address Resolution Protocol)          | 地址解析协议 ARP          |
| DHCP (Dynamic Host Configuration Protocol) | 动态主机配置协议 DHCP       |
| TLS / SSL                                  | 传输层安全协议 / 安全套接字层    |
| HTTP / HTTPS                               | 超文本传输协议 / 安全超文本传输协议 |

---
