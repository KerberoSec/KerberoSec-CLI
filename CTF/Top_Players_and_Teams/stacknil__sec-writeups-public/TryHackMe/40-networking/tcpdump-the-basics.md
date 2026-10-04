---
type: resource-note
status: done
created: 2026-02-13
updated: 2026-03-11
tags: [security-writeup, tryhackme, tcpdump, networking]
source: "TryHackMe: Tcpdump: The Basics"
platform: tryhackme
room: "Tcpdump: The Basics"
slug: tcpdump-the-basics
path: TryHackMe/40-networking/tcpdump-the-basics.md
topic: 40-networking
domain: [networking]
skills: [tcpdump, pcap, pcap-filters]
artifacts: [cookbook]
sanitized: true
---

# Tcpdump: The Basics

## Summary

* `tcpdump` makes network “conversations” visible by capturing packets live or reading packet capture files (PCAP).
* Core workflow: choose interface (`-i`), optionally cap count (`-c`), avoid name resolution (`-n`/`-nn`), and save (`-w`) or read (`-r`) captures.
* Filtering is essential: filter by host, port, protocol, and combine conditions with logical operators.
* Advanced filtering uses `pcap-filter` byte-offset syntax (e.g., `tcp[tcpflags]`) to match TCP flag patterns.
* Output formatting options (`-q/-e/-A/-xx/-X`) control what and how data is printed.

## Key Concepts

### 1.1 Why packet capture matters

Networking stacks hide most protocol detail behind UIs. Capturing traffic lets you observe mechanisms you normally never see (e.g., ARP queries, TCP 3-way handshake).

### 1.2 `tcpdump` + `libpcap`

* `tcpdump` relies on `libpcap` (packet capture library). Both were released for Unix-like systems in the late 1980s / early 1990s.
* `libpcap` underpins many other networking tools; it was ported to Windows as `winpcap`.

### 1.3 Interfaces (sniffing points)

You must decide which interface to capture from.

* List interfaces: `ip a s` (or `ip address show`).
* Capture on a specific interface: `-i <INTERFACE>` (e.g., `eth0`, `ens5`).
* Capture on all interfaces: `-i any`.

### 1.4 PCAP files

* Save captured packets: `-w <FILE>` (commonly `.pcap`).
* Read packets from a file: `-r <FILE>`.
* Saving is useful for later inspection (e.g., with Wireshark).

### 1.5 Name resolution

`tcpdump` may resolve IPs to domain names and ports to service names.

* Numeric addresses only: `-n`.
* Numeric addresses and ports (no DNS + no service lookup): `-nn`.

### 1.6 Verbosity

* `-v` prints more IP details (TTL, identification, total length, options, etc.).
* Increase verbosity with `-vv` and `-vvv` (see `man tcpdump`).

## Pattern Cards

### Pattern 2.1 “Capture → Save → Re-read with filters”

Use when you expect iterative analysis.

* Live capture with minimal noise and stable naming:

  * `sudo tcpdump -i <IFACE> -nn -w capture.pcap`
* Later, re-read and slice by interest:

  * `tcpdump -r capture.pcap <FILTER> -nn`

### Pattern 2.2 “One hypothesis, one filter”

Start with a narrow question (one host/port/protocol), and only then widen.

* Host hypothesis: `host <IP|HOSTNAME>`
* Port hypothesis: `port <N>`
* Protocol hypothesis: `icmp` / `tcp` / `udp` / `ip` / `ip6`

### Pattern 2.3 “Flags-based TCP triage”

Use when you suspect connection attempts, resets, or unusual TCP behavior.

* Only SYN: `"tcp[tcpflags] == tcp-syn"`
* Has SYN: `"tcp[tcpflags] & tcp-syn != 0"`
* Has SYN or ACK: `"tcp[tcpflags] & (tcp-syn|tcp-ack) != 0"`

## Command Cookbook

All examples use safe placeholders:

* `TARGET_IP`, `TARGET_HOST`, `IFACE`, `FILE.pcap`

### 3.1 Basic capture

```bash
# Capture on a specific interface
sudo tcpdump -i IFACE

# Capture on all interfaces
sudo tcpdump -i any

# Capture N packets then stop
sudo tcpdump -i IFACE -c COUNT

# Save to PCAP (no scrolling output)
sudo tcpdump -i IFACE -w capture.pcap

# Read from PCAP
tcpdump -r capture.pcap
```

### 3.2 Avoid resolution delays

```bash
# Numeric IPs only
sudo tcpdump -i IFACE -n

# Numeric IPs and numeric ports
sudo tcpdump -i IFACE -nn
```

### 3.3 Verbose decode

```bash
sudo tcpdump -i IFACE -v
sudo tcpdump -i IFACE -vv
sudo tcpdump -i IFACE -vvv
```

### 3.4 Filtering expressions

#### Host

```bash
# Any traffic exchanged with a host
sudo tcpdump host TARGET_HOST -w out.pcap

# Source-only / destination-only
sudo tcpdump src host TARGET_IP -nn
sudo tcpdump dst host TARGET_IP -nn
```

#### Port

```bash
# Any traffic to/from port
sudo tcpdump -i IFACE port 53 -n

# Source-only / destination-only
sudo tcpdump src port 53 -n
sudo tcpdump dst port 53 -n
```

#### Protocol

```bash
sudo tcpdump -i IFACE icmp -n
sudo tcpdump -i IFACE tcp -n
sudo tcpdump -i IFACE udp -n
```

#### Logical operators

```bash
# Both conditions must match
sudo tcpdump host 1.1.1.1 and tcp

# Either condition matches
sudo tcpdump udp or icmp

# Negation
sudo tcpdump not tcp
```

### 3.5 Advanced filtering

#### Size-based

```bash
# LENGTH is in bytes
sudo tcpdump 'greater LENGTH'
sudo tcpdump 'less LENGTH'
```

#### Header-byte / TCP flags (pcap-filter)

Byte reference syntax: `proto[expr:size]` where `expr` is byte offset (0 = first byte), `size` is 1/2/4 (default 1).

```bash
# TCP flags field
sudo tcpdump 'tcp[tcpflags] == tcp-syn'

sudo tcpdump 'tcp[tcpflags] & tcp-syn != 0'

sudo tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-ack) != 0'
```

TCP flag constants covered:

* `tcp-syn` (Synchronize)
* `tcp-ack` (Acknowledge)
* `tcp-fin` (Finish)
* `tcp-rst` (Reset)
* `tcp-push` (Push)

### 3.6 Reading a PCAP and counting matches

```bash
# Example pattern: count lines that match a filter
# (reading a PCAP doesn't require sudo)
tcpdump -r traffic.pcap src host TARGET_IP -n | wc
```

## 4) Displaying Packets

### Output modes

* `-q`: quick output (shorter lines)
* `-e`: include link-layer header (e.g., MAC addresses)
* `-A`: print packet data as ASCII
* `-xx`: print packet data in hex (octet-by-octet)
* `-X`: print in both hex and ASCII

Examples:

```bash
tcpdump -r TwoPackets.pcap -q
tcpdump -r TwoPackets.pcap -e
tcpdump -r TwoPackets.pcap -A
tcpdump -r TwoPackets.pcap -xx
tcpdump -r TwoPackets.pcap -X
```

Interpretation notes:

* ASCII is only reliable for plain-text payloads; encryption/compression/non-Latin text often requires hex.
* `-e` is useful for protocols like ARP/DHCP where MAC-level context matters.

## 5) Mini Diagrams

### 5.1 Practical workflow

```text
[Choose IFACE] -> (optional -c COUNT) -> (-nn) -> [Filter Expression] ->
  |-> live display (stdout)
  |-> save to PCAP (-w file.pcap) -> re-read (-r file.pcap) -> refine filters
```

### 5.2 Filter composition (mental model)

```text
primitive: host / port / protocol
combine:   and / or / not
refine:    header-byte tests (proto[expr:size]) e.g., tcp[tcpflags]
```

## 6) Room Questions Checklist (Method-only)

These require the provided PCAPs (`traffic.pcap`, `TwoPackets.pcap`) and should be answered by running filters locally.

* Task 2: “numeric format only” option

  * Identify which flag disables name resolution (`-n`).

* Task 3:

  * ICMP packet count in `traffic.pcap`:

    * `tcpdump -r traffic.pcap icmp -n | wc -l`
  * Host that asked for MAC of `192.168.124.137` (ARP who-has):

    * `tcpdump -r traffic.pcap arp -n` then locate the ARP request.
  * First DNS query hostname (subdomain):

    * `tcpdump -r traffic.pcap port 53 -n` and inspect the first query line.

* Task 4:

  * Only TCP RST packets count:

    * `tcpdump -r traffic.pcap 'tcp[tcpflags] == tcp-rst' -n | wc -l`
  * Host that sent packets larger than 15000 bytes:

    * `tcpdump -r traffic.pcap 'greater 15000' -n` and inspect source IP.

* Task 5:

  * MAC address of the host that sent an ARP request:

    * Use `-e` while filtering ARP:

      * `tcpdump -r traffic.pcap -e arp`

## Takeaways

* `tcpdump` is “fast + composable”: interface selection, filter expressions, and output formatting cover most day-to-day protocol analysis needs.
* Treat filtering as a first-class skill: without filters you drown in packets.
* For deeper protocol mechanics, `pcap-filter` byte-level expressions (especially TCP flags) are a practical bridge between “protocol theory” and “traffic reality”.

## References

* `man tcpdump`
* `man pcap-filter`

## CN: EN Glossary

* Packet capture (抓包/数据包捕获): recording packets from an interface into a viewable stream or file.
* PCAP (数据包捕获文件): packet capture file format (e.g., `*.pcap`).
* Interface (网络接口): capture point such as `eth0`, `ens5`, or `lo`.
* Name resolution (名称解析): mapping IP→hostname and port→service name.
* Verbosity (详细输出级别): how much protocol detail is printed (`-v/-vv/-vvv`).
* Filter expression (过滤表达式): rules that select packets to display/capture.
* TCP flags (TCP 标志位): SYN/ACK/FIN/RST/PUSH bits used by TCP.
* Byte offset (字节偏移): position of a byte in a header (`proto[expr:size]`).
