---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, networking, basics]
source: TryHackMe: What is Networking?
platform: tryhackme
room: What is Networking?
slug: what-is-networking
path: TryHackMe/40-networking/network-fundamentals/01-what-is-networking.md
topic: 40-networking
domain: [networking]
skills: [tcp-ip, icmp, addressing]
artifacts: [concept-notes, lab-notes]
sanitized: true
---

# Networking Basics

- **Type:** Concept + interactive mini-labs
- **Focus:** What is a network, the Internet, ping/ICMP, IP vs MAC
- **Source context:** TryHackMe “What is Networking?” room

---

## Summary

In everyday life, a **network** is simply “things that are connected”:

- A public transportation system
- The national power grid
- Postal services
- A social circle of friends

In computing, the idea is the same, but the “things” are **devices**:

- Laptops, phones, servers
- Cameras, traffic lights, industrial controllers
- Even sensors in agriculture, smart homes, etc.

> A computer network = two or more devices connected so they can exchange data.

Networks vary in size from 2 devices on a home Wi-Fi to billions of devices across the globe.
Because networks are now embedded in almost everything, **basic networking is foundational for cyber security**.

---

## Key Concepts

### 2. What Is the Internet?

The Internet is:

> “A network of networks”: one huge global network made up of many smaller networks.

Analogy:

- Alice, Bob, Jim form one small network (they all talk directly).
- Alice also knows Zayn and Toby and can speak their language.
- Alice acts as a **bridge**, connecting two smaller groups into a bigger network.

In computing terms:

- Small, internal networks are usually **private networks**.
- The connections between them, visible to the world, form the **public network** (the Internet).

So any given network is typically one of:

1. **Private network**: e.g. your home LAN, office network.
2. **Public network**: the larger Internet that connects many private networks.

---

### 3. Identifying Devices: IP and MAC

Like humans having both **names** and **fingerprints**, devices also have two identifiers:

1. **IP address**: logical address, can change over time.
2. **MAC address**: hardware address of the network interface, meant to be unique.

#### 3.1 IP Addresses

An IPv4 address looks like:

```text
192.168.1.254
```

- 4 groups (“octets”), each 0-255.

- Together they identify a device on a network **for some period of time**.

- Within a single network, the same IP cannot be active on two devices at once.

There are two main categories:

- **Private IP address**: used **inside** a local network.

  - Example: `192.168.1.77` and `192.168.1.74` on the same home LAN.

- **Public IP address**: used on the Internet, assigned by your ISP.

  - Multiple devices in the same home can share a single public IP via NAT.

Because IPv4 only supports about 4.29 billion addresses (2³²), we are hitting limits.
**IPv6** is the newer scheme:

- Uses 128-bit addresses (2¹²⁸ possibilities).

- Provides essentially “enough” unique addresses for the foreseeable future.

- Syntax is longer, hexadecimal (e.g. `2001:0db8::1`), but solves exhaustion.

### 3.2 MAC Addresses

- Burned into the **network interface** at the factory.

- 12 hexadecimal characters, usually written in pairs with separators:

```text
a4:c3:f0:85:ac:2d
```

- First 6 hex digits: vendor / manufacturer.

- Last 6 hex digits: device-specific identifier.

Despite being “hardware identifiers”, MAC addresses can be **spoofed**:

- A device can pretend to have another device’s MAC.

- If a network trusts MAC addresses too much (e.g. firewall rules or Wi-Fi paywalls by MAC), spoofing can bypass restrictions.

The interactive hotel Wi-Fi lab demonstrates this:

- Alice has paid → her MAC is allowed.

- Bob has not paid → his packets are dropped.

- If Bob changes his MAC to match Alice’s, the router can be fooled.

---

### 4. Ping and ICMP: Basic Connectivity Testing

**Ping** is one of the simplest and most useful network tools.

- It uses **ICMP (Internet Control Message Protocol)** echo requests and echo replies.

- Measures:

  - Whether a host is reachable.

  - Round-trip time (latency) between the two devices.

Example usage:

```bash
ping 8.8.8.8
ping example.com
```

Typical output shows:

- Packets sent vs packets received.

- Loss percentage.

- Minimum / average / maximum round-trip time.

Use cases:

- Check whether a host is online.

- Roughly diagnose latency or packet loss.

- Quick connectivity test before deeper troubleshooting.

In the room’s mini-lab, pinging `8.8.8.8` on the provided website reveals a flag confirming success.

---

### 5. Checklist: Mental Model for Basic Networking

When thinking about a simple network scenario, I can walk through:

- **Who is connected to whom?**

  - What devices are on the same private network?

  - Where is the boundary to the public Internet?

- **How are devices identified?**

  - IP address (logical): public vs private.

  - MAC address (hardware): can it be trusted or spoofed?

- **Is connectivity working?**

  - Use `ping` (ICMP) to test reachability and latency.

  - If ping fails: check IP, routing, firewall, or physical connection.

- **What version of IP is used?**

  - IPv4 addressing and limitations.

  - IPv6 addresses beginning to appear in modern networks.

This model is enough to reason about many beginner-level network and security tasks.

---

### 6. Glossary (EN: ZH)

- Network: 网络
- Private network: 私有网络
- Public network: 公共网络
- Internet: 互联网
- Host / device: 主机 / 设备
- IP address (IPv4 / IPv6): IP 地址（IPv4 / IPv6）
- Public IP: 公网 IP
- Private IP: 内网 IP
- MAC address (Media Access Control): MAC 地址（介质访问控制地址）
- Network interface: 网络接口 / 网卡
- Ping: Ping 命令（连通性测试）
- ICMP (Internet Control Message Protocol): 互联网控制报文协议
- Echo request / Echo reply: 回显请求 / 回显应答
- Packet loss: 丢包
- Latency / Round-trip time (RTT): 延迟 / 往返时间
- Spoofing (MAC spoofing): 欺骗 / 伪造（MAC 欺骗）
