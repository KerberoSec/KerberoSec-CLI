---
type: resource-note
status: done
created: 2026-01-31
updated: 2026-03-11
tags: [security-writeup, tryhackme, wireshark, networking]
source: "TryHackMe: Wireshark: The Basics"
platform: tryhackme
room: "Wireshark: The Basics"
slug: wireshark-the-basics
path: TryHackMe/40-networking/wireshark-the-basics.md
topic: 40-networking
domain: [forensics, networking]
skills: [wireshark, pcap, display-filters]
artifacts: [concept-notes, cookbook]
sanitized: true
---

# Wireshark: The Basics

## Summary

* Wireshark is a packet analyzer (network traffic analyser / 网络流量分析器) for live capture and offline PCAP inspection.
* The UI is organized to support fast triage: Packet List → Packet Details → Packet Bytes (hex/ASCII).
* Your basic analysis loop is: load PCAP → navigate packets → dissect layers → filter down → reconstruct streams → extract artifacts.
* Two filter planes exist: capture filters (what you collect) vs display filters (what you view). This room focuses on display filters.

## Key Concepts

### 1.1 What Wireshark is / is not

* Wireshark is not an IDS (Intrusion Detection System / 入侵检测系统). It does not block or modify traffic; it helps you interpret it.
* Its output quality depends on analyst hypotheses + protocol knowledge.

### 1.2 Primary use cases

* Troubleshooting: congestion, retransmissions, failure points.
* Security hunting: rogue hosts, abnormal ports, suspicious protocols.
* Protocol learning: response codes, headers, payloads.

### 1.3 GUI mental model (5 prominent sections)

* Toolbar: capture, filtering, sorting, export/merge, statistics.
* Display Filter Bar: the main query input for display filters.
* Recent Files: fast recall of prior PCAPs.
* Capture Filter & Interfaces: choose interface and optional capture filter before sniffing.
* Status Bar: capture state + profile + displayed/total packet counts.

ASCII layout sketch (conceptual)

```
+--------------------------------------------------------------+
| Toolbar                                                      |
+--------------------------------------------------------------+
| Display Filter Bar: [ <filter expr> ]                         |
+-----------------------------+-------------------------------+
| Packet List Pane            | Packet Details Pane            |
| (summary rows)              | (protocol tree / fields)       |
+-----------------------------+-------------------------------+
| Packet Bytes Pane (hex + ASCII, highlights follow selection) |
+--------------------------------------------------------------+
| Status Bar (packets: displayed/total, profile, etc.)          |
+--------------------------------------------------------------+
```

### 1.4 Packet dissection (protocol dissection / 协议剖析)

* Click a packet → Packet Details shows the protocol stack as a tree.
* Clicking a field highlights its corresponding bytes in the Packet Bytes pane (byte-level grounding).
* Typical stack shown in this room:

  * Frame (L1-ish)
  * Ethernet / MAC (L2)
  * IP (L3)
  * TCP/UDP + ports (L4)
  * Reassembly / errors (TCP segment reassembly)
  * Application protocol (e.g., HTTP)
  * Application data (payload)

## Pattern Cards

### 2.1 “If you can click it, you can filter it”

* Select a field in Packet Details → right-click → Apply as Filter (immediate narrowing).
* Use Prepare as Filter when you want to build a compound expression before applying.

### 2.2 Conversation-first triage

* When you want the whole conversation (endpoints + ports) rather than a single field:

  * Right-click a packet → Conversation Filter.
* If you want highlighting without reducing the view:

  * View → Colourise Conversation.

### 2.3 Reconstruct application content

* Packet-level views fragment payload.
* Follow Stream reconstructs application-level data:

  * Follow TCP/UDP/HTTP Stream (depending on protocol).
* After following, Wireshark applies a stream filter automatically; clear it using the “X” on the display filter bar.

### 2.4 “Navigate like a debugger”

* Go to Packet: jump to a packet number when the task gives you an anchor (e.g., “packet 38”).
* Find Packet: search content using String/Regex/Hex/Display filter, with the correct search scope (list/details/bytes).
* Mark + Comments: annotate packets for later review or collaboration; marks reset per session, comments persist in the capture file.

## Command Cookbook

### 3.1 Display filter examples

```text
# By protocol
http
arp
dhcp
ftp
smtp
pop
imap

# By port
tcp.port == 80
udp.port == 53

# By IP address (example placeholder)
ip.addr == TARGET_IP
```

### 3.2 File hash (terminal)

```bash
md5sum <filename>
```

## Workflow Checklist (mapped to the room tasks)

Task 1-2: Loading + first orientation

* Load a PCAP via:

  * File → Open, or drag-and-drop, or double-click from Recent Files.
* Confirm you understand pane roles:

  * Packet List (summary) → click selects.
  * Packet Details (tree) → protocol fields.
  * Packet Bytes (hex/ASCII) → byte-level truth.

Traffic sniffing controls

* Start capture: blue shark fin.
* Stop: red square.
* Restart: green circular arrow.

Merging PCAPs

* File → Merge.
* Save merged output before analysis.

Capture file properties

* Statistics → Capture File Properties (or pcap icon bottom-left).
* Useful fields: capture time, interface, comments, hashes/identifiers (for provenance).

Task 3: Packet dissection

* Use a known packet number as an example anchor.
* Inspect each layer systematically:

  * L2: MAC addresses
  * L3: IPv4/IPv6 addresses
  * L4: TCP/UDP ports, flags, seq/ack
  * App: HTTP method/status, headers
  * App data: HTML/text content
* Watch for reassembly notes when payload spans multiple TCP segments.

Task 4: Navigation + exporting + expert info

* Find Packet:

  * Choose input type (String/Regex/Hex/Display filter) + correct search scope.
* Export packets / objects:

  * Export packets to reduce scope for sharing.
  * Export objects (files) when protocols support it (e.g., HTTP/SMB/TFTP).
* Time display format:

  * View → Time Display Format (default is seconds since capture start; UTC often improves interpretability).

Expert Information (Expert Info)

* Use it as a “hint engine” for anomalies, not as ground truth.
* Severity levels described in this room:

  * Chat (blue): normal workflow.
  * Note (cyan): notable event (e.g., HTTP errors).
  * Warn (yellow): unusual but not fatal.
  * Error (red): malformed/dissection problems.

Task 5: Filtering

* Capture filter vs display filter:

  * Capture filter = filter during collection (reduces what is stored).
  * Display filter = filter during viewing (does not modify the underlying file).

Right-click filtering modes

* Apply as Filter: apply now (single field).
* Prepare as Filter: stage a filter and combine using AND/OR before applying.
* Conversation Filter: isolate conversation (endpoints + ports).
* Apply as Column: add a field as a column to compare across many packets.
* Follow Stream: reconstruct app-layer stream; auto-applies stream filter; clear with “X”.

## Pitfalls

* Searching the wrong pane: a string in Packet Details won’t be found if you search only Packet List.
* Over-trusting color: packet coloring is a triage aid, not evidence.
* Forgetting stream filters: Follow Stream silently applies a stream filter; if you “lose packets,” check the display filter bar.
* Mixing capture vs display filters: beginners often type display syntax into capture filter fields.

## References

* Wireshark User’s Guide (official): [https://www.wireshark.org/docs/wsug_html/](https://www.wireshark.org/docs/wsug_html/)
* Display filter syntax (manpage): [https://www.wireshark.org/docs/man-pages/wireshark-filter.html](https://www.wireshark.org/docs/man-pages/wireshark-filter.html)

## CN: EN Glossary (small)

* packet capture / PCAP：数据包抓包文件
* packet dissection：协议剖析 / 分层解析
* display filter：显示过滤器（只影响“看见什么”）
* capture filter：抓包过滤器（影响“抓到什么”）
* reassembly：重组（多段 TCP 负载拼接）
* expert information：专家信息（异常提示聚合视图）
* follow stream：跟踪流（重建应用层对话）
