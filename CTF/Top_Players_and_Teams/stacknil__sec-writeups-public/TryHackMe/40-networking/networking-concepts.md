---
type: resource-note
status: done
created: 2026-01-18
updated: 2026-03-11
tags: [security-writeup, tryhackme, networking, fundamentals]
source: TryHackMe: Networking Concepts
platform: tryhackme
room: Networking Concepts
slug: networking-concepts
path: TryHackMe/40-networking/networking-concepts.md
topic: 40-networking
domain: [networking]
skills: [osi-model, tcp-ip, ip-subnetting, tcp-udp, telnet]
artifacts: [concept-notes, cookbook]
sanitized: true
---

# Networking Concepts

## Summary

* **What this room trains:** mental model of how data moves from an app to the wire (OSI + TCP/IP), and how to reason about addresses, ports, and encapsulation.
* **Main concepts:** OSI 7 layers vs TCP/IP stack, MAC vs IP, private vs public IP, routing, UDP vs TCP, TCP handshake, encapsulation, basic TCP interaction via `telnet`.
* **What I will reuse elsewhere:** quickly classifying a symptom by layer (“L2 vs L3 vs L4”), reading packet captures, validating subnet ranges, and testing open TCP ports without heavy tooling.

## EN: ZH Glossary (quick)

| Term (EN)                                | 中文                 | Plain meaning                                                                    |
| ---------------------------------------- | ------------------ | -------------------------------------------------------------------------------- |
| OSI model (Open Systems Interconnection) | OSI 七层模型           | A conceptual stack describing how network communication can be split into layers |
| TCP/IP model                             | TCP/IP 协议栈         | The practical Internet protocol stack used in real systems                       |
| Physical layer                           | 物理层                | Cables / radio / signals that move bits                                          |
| Data Link layer                          | 数据链路层              | Local segment delivery (Ethernet/Wi‑Fi) using MAC addresses                      |
| MAC address (Media Access Control)       | MAC 地址             | 48-bit hardware address used on a local link (Ethernet/Wi‑Fi)                    |
| OUI (Organizationally Unique Identifier) | 组织唯一标识（厂商前缀）       | The vendor prefix in a MAC address (first 3 bytes)                               |
| Network layer                            | 网络层                | IP addressing + routing between networks                                         |
| Subnet / CIDR (e.g., /24)                | 子网 / CIDR 表示法      | How many leftmost bits are the “network part”                                    |
| Routing                                  | 路由                 | Forwarding packets across multiple networks via routers                          |
| Transport layer                          | 传输层                | Process-to-process delivery using ports (TCP/UDP)                                |
| Port                                     | 端口                 | A 16-bit number identifying an application endpoint on a host                    |
| UDP (User Datagram Protocol)             | UDP 用户数据报协议        | Connectionless, no built-in delivery guarantee                                   |
| TCP (Transmission Control Protocol)      | TCP 传输控制协议         | Connection-oriented, reliable byte stream                                        |
| Three-way handshake                      | 三次握手               | TCP connection setup: SYN → SYN-ACK → ACK                                        |
| Encapsulation                            | 封装                 | Each layer wraps data with its own header (and sometimes trailer)                |
| Telnet                                   | 远程终端协议 / telnet 工具 | A simple TCP client; useful to “talk” to open TCP ports                          |

## Key Concepts

### 1.1 OSI model (7 layers) as a debugging lens

The OSI model is a **conceptual decomposition**. It is not a strict implementation requirement, but it is a strong tool for:

* locating failure domains (e.g., “link down” vs “routing broken” vs “service not listening”),
* mapping tools to layers (Wireshark spans multiple layers, `ip a` is mainly L3/L2, `telnet` is L4+),
* communicating precisely (e.g., “Layer 3 routing issue”, “Layer 7 firewall/WAF policy”).

OSI layers (bottom → top):

| Layer | Name         | Core function                       | Typical examples                 |
| ----: | ------------ | ----------------------------------- | -------------------------------- |
|     7 | Application  | App-facing network services         | HTTP(S), DNS, SMTP, SSH          |
|     6 | Presentation | Encoding / compression / encryption | Unicode, MIME, TLS semantics     |
|     5 | Session      | Session management / sync           | RPC, NFS (conceptually)          |
|     4 | Transport    | End-to-end transport + ports        | TCP, UDP                         |
|     3 | Network      | Logical addressing + routing        | IP, ICMP, IPSec                  |
|     2 | Data Link    | Same-segment delivery               | Ethernet (802.3), Wi‑Fi (802.11) |
|     1 | Physical     | Bits on a medium                    | copper/fiber, radio bands        |

Practical pitfall:

* Layer boundaries blur in real stacks. Treat OSI as a **reasoning scaffold**, not a strict rule.

### 1.2 Layer 2: MAC addressing and “local segment” thinking

Ethernet/Wi‑Fi frames carry **two MAC addresses**:

* **Source MAC**: sender’s NIC on that link
* **Destination MAC**: next hop on that link (often the router / access point)

MAC addresses are 48 bits (6 bytes), often written like:

`aa:bb:cc:dd:ee:ff`

Key idea:

* The first 3 bytes are typically the **vendor prefix (OUI)**.
* MAC addresses are meaningful only within a local broadcast domain; they are not used for Internet-wide routing.

### 1.3 Layer 3: IP addressing, subnets, and routing

IP addresses identify **hosts across networks**. For IPv4:

* 32 bits total → 4 octets → each octet is `0..255`.

Example format:

`192.168.X.Y/24`

CIDR `/24` means:

* the leftmost 24 bits are the network prefix
* typical host range: `.1 .. .254` within that subnet

Conceptual anchors:

* **Network address**: all host bits 0 (e.g., `192.168.X.0`)
* **Broadcast address**: all host bits 1 (e.g., `192.168.X.255`): targets all hosts in the subnet

Private IPv4 ranges (memorize):

* `10.0.0.0/8`
* `172.16.0.0/12`
* `192.168.0.0/16`

Routing:

* Routers operate primarily at **Layer 3**.
* Each hop strips the L2 frame and forwards based on the L3 destination IP, re-encapsulating into a new L2 frame for the next link.

### 1.4 Layer 4: UDP vs TCP and what “reliable” actually means

UDP:

* connectionless
* minimal overhead
* no built-in acknowledgement/retransmission
* good for latency-sensitive use cases (streaming, VoIP, some DNS)

TCP:

* connection-oriented
* reliable ordered byte stream via sequence numbers + ACKs
* starts with **three-way handshake**:

```text
Client -> Server : SYN
Server -> Client : SYN-ACK
Client -> Server : ACK
```

Ports:

* 16-bit field → `1..65535` (0 is reserved)
* ports identify **process endpoints**, while IP identifies the **host**

### 1.5 Encapsulation: the “life of a packet” mental model

Encapsulation means each layer wraps the payload coming from the layer above:

```text
[Application Data]
   ↓ add TCP/UDP header
[TCP segment / UDP datagram]
   ↓ add IP header
[IP packet]
   ↓ add Ethernet/Wi‑Fi header (+ trailer)
[L2 frame on the wire]
```

Receiving side does the reverse (decapsulation).

Why this matters:

* it explains why packet captures show multiple headers,
* it explains why L2 addresses change hop-by-hop while L3 destination stays stable end-to-end (ignoring NAT),
* it helps you predict “what fields should exist at what layer”.

### 1.6 Telnet as a “raw-ish” TCP client

Telnet is historically a remote terminal protocol, but in security labs it is useful as a **simple TCP client**:

* quickly test whether a TCP port is open
* interact with plaintext services
* manually craft minimal protocol messages (e.g., HTTP request)

Security note:

* Telnet transmits data in plaintext. Use SSH for real administration.

## Pattern Cards

### Pattern 1: Map a symptom to a layer

* **Signal:** “Can’t reach a site” / “Service times out” / “Wi‑Fi connected but no Internet”
* **Hypothesis:** failure domain is likely at L1/L2/L3/L4/L7
* **Checks (minimal):**

  * L1/L2: link status, interface up, Wi‑Fi association
  * L3: `ip a`, default gateway, route table
  * L4: test port reachability (e.g., `telnet $T 80`)
* **Expected output:**

  * L3 OK → you see an IP + gateway route
  * L4 OK → TCP connects and you can send bytes
* **Next step decision:**

  * L4 connect fails → check firewall/routing/port closed
  * L4 connects but app fails → think L7 (HTTP, TLS, auth)

### Pattern 2: When I see an IP/CIDR, infer the usable host range

* **Signal:** you see something like `10.0.0.42/24`
* **Hypothesis:** network prefix defines the subnet; host range is predictable
* **Checks (minimal):**

  * `/24` ⇒ network = `10.0.0.0`, broadcast = `10.0.0.255`, usable ≈ `10.0.0.1..254`
* **Expected output:**

  * you can sanity-check whether two hosts are “same subnet” (same /24 prefix)
* **Next step decision:**

  * same subnet → L2 delivery possible (ARP, MAC)
  * different subnet → routing required (router / gateway)

### Pattern 3: Use `telnet` to test and speak to a TCP service

* **Signal:** “Port is open, but what is it?” / “I need to send a minimal request.”
* **Hypothesis:** the service expects plaintext protocol messages
* **Checks (minimal):**

  * `telnet $T <PORT>`
  * for HTTP: send `GET / HTTP/1.1` + `Host: example` + blank line
* **Expected output:**

  * banner, echo, time string, or HTTP response headers
* **Next step decision:**

  * cleartext works → proceed with protocol-aware tooling
  * no readable output → might be encrypted (TLS) or binary protocol

## Command Cookbook

> Keep commands reproducible. Use placeholders.

```bash
export T=TARGET_IP

# (Linux) inspect interface + IP configuration
ip a s
# (Optional legacy)
ifconfig

# Test TCP services with telnet
# Echo server (example: port 7)
telnet $T 7

# Daytime server (example: port 13)
telnet $T 13

# HTTP over raw TCP (example: port 80)
telnet $T 80
# then type:
# GET / HTTP/1.1
# Host: example
# <press Enter twice>
```

Notes:

* Why `ip a s`: quickly confirms interface state, L2 MAC, IPv4/CIDR, and broadcast address.
* What to look for:

  * `state UP`, an `inet` line, and a sensible prefix (e.g., `/24`)
  * `link/ether` shows the MAC address
* Telnet exit: `Ctrl + ]` then `quit`.

## Evidence

* Store screenshots/outputs under `assets/`.
* Remove usernames, tokens, and real public IPs/domains.

Suggested asset filenames :

* `assets/mac-address-oui.png`: MAC layout (vendor prefix vs device ID)
* `assets/wireshark-mac-highlight.png`: source/destination MAC in a frame
* `assets/routing-multipath.png`: multiple possible L3 paths
* `assets/ipv4-octets.png`: IPv4 octets and ranges
* `assets/tcp-3way-handshake.png`: SYN/SYN-ACK/ACK diagram
* `assets/encapsulation-stack.png`: headers added per layer

## Takeaways

* **1 thing I would do faster next time:** map any observation to an OSI layer immediately (it reduces random debugging).
* **1 check I keep forgetting:** verify the subnet prefix (`/24`, `/16`, etc.) before assuming two hosts can talk directly.
* **1 reference worth re-reading:** TCP connection setup and what packet captures show at each layer during handshake.

## References

* RFC 1122: Requirements for Internet Hosts: Communication Layers (TCP/IP model grounding).
* RFC 1918: Address Allocation for Private Internets (private IPv4 ranges).
* RFC 791: Internet Protocol (IPv4).
* RFC 768: User Datagram Protocol (UDP).
* RFC 9293: Transmission Control Protocol (TCP).
* RFC 854: TELNET Protocol Specification.
