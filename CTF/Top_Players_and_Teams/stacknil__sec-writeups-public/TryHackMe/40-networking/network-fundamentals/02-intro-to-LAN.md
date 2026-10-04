---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, networking, lan]
source: TryHackMe: Intro to LAN
platform: tryhackme
room: Intro to LAN
slug: intro-to-lan
path: TryHackMe/40-networking/network-fundamentals/02-intro-to-LAN.md
topic: 40-networking
domain: [networking]
skills: [lan, switching, topology]
artifacts: [concept-notes]
sanitized: true
---

# Intro to LAN

## Summary

A **Local Area Network (LAN)** is a network that connects devices within a limited physical area (home, office, lab, small data centre rack, etc.).

Typical components:

* **Endpoints**: PCs, laptops, phones, printers, cameras, sensors…
* **Switches**: aggregate many Ethernet links inside the LAN.
* **Routers**: connect one LAN to other networks (e.g. the Internet) at Layer 3.

From a security perspective, the LAN is the environment we usually **pivot through** once we get an initial foothold: lateral movement, sniffing, spoofing, service discovery, etc. Understanding how the LAN is wired and addressed tells us what is realistically attackable.

---

## Key Concepts

### 2. LAN Topologies (Network Layouts)

A **topology** describes how devices are arranged and interconnected. Historically there were several physical topologies; modern networks are mostly star‑like, but the concepts still show up in exams and old environments.

#### 2.1 Star Topology

All devices connect to a single central device (switch or hub):

```text
   PC1      PC2
    |        |
    +---[ Switch ]--- PC3
             |
            AP
```

**Pros**

* Easy to scale: add another port and cable.
* One cable or host failing does not kill the whole network.

**Cons**

* The central switch is a **single point of failure**.
* More cabling + hardware → higher cost.

**Security angle**

* Attacker traffic usually converges at the switch; ARP spoofing or port mirroring can be used to sniff.
* DoS on the central device (or its uplink) can impact everyone.

---

#### 2.2 Bus Topology

All hosts share a single backbone cable:

```text
PC1 ---- PC2 ---- PC3 ---- PC4
          |
        (backbone)
```

**Pros**

* Cheap and simple to wire.

**Cons**

* A break in the main cable can take the entire network down.
* All devices contend for the same medium → collisions, congestion.
* Troubleshooting is hard because *all* traffic rides the same path.

**Security angle**

* Historically, any host could easily sniff **all** traffic on the bus.
* Today, similar effects can be emulated with hubs / misconfigured switches or SPAN ports.

---

#### 2.3 Ring Topology

Devices form a closed loop and forward frames for each other:

```text
      PC1
      / \
   PC4   PC2
      \ /
      PC3
```

Data travels in one direction around the ring.

**Pros**

* Less cabling than star.
* Lower risk of congestion than a shared bus.

**Cons**

* A single broken link or failed node can break the entire ring.
* Packets may traverse many hops to reach the target → latency.

**Security angle**

* Predictable single path can be useful for monitoring, but any compromised forwarding node can eavesdrop or drop traffic.

> Modern Ethernet LANs are *logically* switched stars, often with multiple switches and redundant links forming more complex logical topologies.

---

### 3. Switches: Layer 2 Aggregation

A **switch** operates mostly at OSI Layer 2 (data link). It connects many Ethernet devices and learns which **MAC address** is reachable via which port.

Key behaviour:

* Maintains a **MAC address table** (port → MAC mappings).
* For known MAC destinations: forwards frames only to the correct port.
* For unknown or broadcast frames: **floods** out all relevant ports.

```text
[PC A]--(port1)      (port2)--[PC B]
[PC C]--(port3)      (port4)--[Router]

MAC table example:
- port1 → MAC_A
- port2 → MAC_B
- port3 → MAC_C
- port4 → MAC_R
```

Security‑relevant points:

* Compared to hubs, switches reduce passive sniffing, but:

  * ARP spoofing / poisoning can still redirect traffic.
  * MAC flooding attacks can overflow the MAC table and force flooding.
* Features like VLANs, port isolation, and 802.1X exist to enforce segmentation and access control: if configured.

---

### 4. Routers: Layer 3 Gateways

A **router** connects multiple networks and forwards IP packets between them. It works at **Layer 3 (network layer)**.

Concepts:

* Each router interface belongs to a different **IP subnet**.
* The router maintains a **routing table** (destination network → next hop).
* Hosts send packets destined for other networks to their **default gateway**, which is usually the router’s LAN IP.

Simple diagram:

```text
LAN 1: 192.168.1.0/24       LAN 2: 10.0.0.0/24

[PC A]--+                  +--[PC B]
        |                  |
     192.168.1.1      10.0.0.1
           \        /
            [ Router ]
               |
            Internet
```

Security‑relevant points:

* Router ACLs / firewall rules decide what can cross between networks.
* Misconfigured default gateways or routing tables can leak traffic to the wrong place.
* Once inside a LAN, compromising the router gives powerful control: eavesdropping, traffic redirection, MITM.

---

### 5. Subnetting Primer

A **subnet** is a logical slice of an IP network, defined by an IP range and a **subnet mask** or prefix length.

Example: `192.168.1.0/24`

* Network address: `192.168.1.0`  (identifies the subnet)
* Usable host range: `192.168.1.1`: `192.168.1.254`
* Typical default gateway: `192.168.1.1` or `192.168.1.254`
* Broadcast address: `192.168.1.255`

Why subnetting matters for security:

* Determines how big a broadcast domain is → how far ARP/DHCP/broadcast scans reach.
* Used to separate roles: e.g., staff, guests, IoT devices on different subnets.
* Lateral movement often follows subnet boundaries: once you know the CIDR block, you know what to scan.

---

### 6. ARP: Address Resolution Protocol

**ARP (Address Resolution Protocol)** maps IP addresses to MAC addresses inside a LAN.

Workflow:

1. Host A wants to send an IP packet to `192.168.1.10`.
2. It checks its **ARP cache**. If no entry:
3. It broadcasts an **ARP Request**: `Who has 192.168.1.10? Tell 192.168.1.20.`
4. The owner (Host B) replies with an **ARP Reply**: `192.168.1.10 is at 18:AC:33:12:88:29.`
5. Host A records the mapping `(192.168.1.10 → 18:AC:33:12:88:29)` in its ARP cache.

ASCII flow:

```text
[Host A] 192.168.1.20
  |
  | ARP Request (broadcast): who has 192.168.1.10?
  v
[Switch] → forwards to all ports
  ^
  | ARP Reply (unicast): 192.168.1.10 is at 18:AC:33:12:88:29
[Host B] 192.168.1.10
```

Security‑relevant points:

* ARP has **no authentication**.
* Attackers can send fake ARP replies to poison caches → redirect traffic through themselves (**ARP spoofing / ARP poisoning**).
* Classic man‑in‑the‑middle (MITM) primitive in IPv4 LANs.

---

### 7. DHCP: Dynamic Host Configuration Protocol

**DHCP** automatically assigns IP configuration to hosts, so users don’t have to set addresses manually.

The basic IPv4 lease process is a four‑step handshake (DORA):

```text
Client                     DHCP Server
  |  1. DHCP Discover  →    |
  |  2. ←  DHCP Offer       |
  |  3. DHCP Request   →    |
  |  4. ←  DHCP ACK         |
```

* **Discover**: client broadcasts asking for configuration.
* **Offer**: server proposes an IP (e.g., `192.168.1.10`) and other options.
* **Request**: client accepts the offer and requests that address.
* **ACK**: server confirms the lease; client configures itself and starts using it.

Security‑relevant points:

* **Rogue DHCP server** can hand out malicious default gateways or DNS servers.
* **DHCP starvation** attacks try to exhaust the pool of available addresses, causing denial of service.
* Monitoring DHCP logs helps identify unknown or suspicious clients.

---

### 8. Why LAN Basics Matter for Offense / Defense

* When you pop a box on a LAN, your next questions are:

  * What is the subnet? (`ip addr`, `ip route`, `ifconfig`)
  * Who else is here? (ARP table, broadcasts, scanning)
  * Where is the gateway? (routing table, default route)
* Knowledge of switching, routing, ARP, and DHCP helps you:

  * Predict where your packets will go.
  * Design ARP/DHCP attacks realistically.
  * Understand which devices are worth targeting for maximum control.
* For defenders, the same knowledge is used to place segmentation, detection, and controls in the right spots.

---

## Glossary (EN → ZH)

| English Term                               | 中文术语                   |
| ------------------------------------------ | ---------------------- |
| LAN (Local Area Network)                   | 局域网                    |
| topology                                   | 拓扑结构                   |
| star topology                              | 星型拓扑                   |
| bus topology                               | 总线拓扑                   |
| ring topology                              | 环形拓扑                   |
| switch                                     | 交换机                    |
| hub                                        | 集线器                    |
| router                                     | 路由器                    |
| default gateway                            | 默认网关                   |
| subnet                                     | 子网                     |
| subnet mask                                | 子网掩码                   |
| broadcast address                          | 广播地址                   |
| MAC address                                | MAC 地址 / 物理地址          |
| IP address                                 | IP 地址                  |
| broadcast                                  | 广播                     |
| broadcast domain                           | 广播域                    |
| collision domain                           | 冲突域                    |
| routing table                              | 路由表                    |
| ARP (Address Resolution Protocol)          | 地址解析协议                 |
| ARP cache                                  | ARP 缓存                 |
| ARP spoofing / poisoning                   | ARP 欺骗 / ARP 投毒        |
| DHCP (Dynamic Host Configuration Protocol) | 动态主机配置协议               |
| DHCP Discover / Offer / Request / ACK      | DHCP 发现 / 提供 / 请求 / 确认 |
| lease (DHCP)                               | 租约                     |
| man‑in‑the‑middle (MITM)                   | 中间人攻击                  |
| access control list (ACL)                  | 访问控制列表                 |
| VLAN (Virtual LAN)                         | 虚拟局域网                  |
