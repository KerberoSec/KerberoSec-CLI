---
title: "Mayhem: Decrypting Havoc C2 from a PCAP"
room: "Mayhem"
platform: TryHackMe
url: https://tryhackme.com/room/mayhemroom
difficulty: Medium
date_solved: 2026-07-10
time_to_solve: "≈30m"
tags: [forensics, pcap, havoc-c2, network-analysis, dfir]
cves: []
flags: { forensics: true }
flagship: true
order: 40
---

A packet-capture forensics box. The riddle ("Mayhem's beauty… in disorder it molds") is the tell: **Mayhem = Havoc**, the open-source C2 framework. The evidence archive holds a PCAP of a **Havoc C2** session; reconstruct the operator's activity and pull two flags plus a stolen file.

## Method
Static analysis of a single capture: no live target. Extract `evidence.zip` (MD5 provided), open the PCAP, and read the story out of the traffic: the compromised host's identity, the C2 channel, the commands the operator ran, and what they exfiltrated.

## Investigation
- **Host identity.** From the captured host/enumeration traffic, recover the user context the operator is running everything under: a full **SID** (`S-1-5-21-…`), and the server's **link-local IPv6** address (`fe80::…`, zone index and all: enter it exactly as seen).
- **Operator activity.** The operator prints a flag to their own console; it surfaces (base64-encoded, then decoded) in the C2 stream (`THM{HavOc_C2_…}`). They establish **persistence by adding a new local administrator account**: the username/password pair is visible in the command traffic (note the username is a deliberate 12-char look-alike, *not* "administrator").
- **Collection.** The operator locates and reads a sensitive file: the full Windows path is recoverable (`C:\Users\…\clients.csv`), and a second flag lives *inside* that file (`THM{I_Can_SEE_…}`).

## Findings
Attacker SID, the server's IPv6, both `THM{}` flags, the persistence credentials, and the stolen file path were all recovered from the capture. Flag values masked here per THM convention.

## The Lesson
Two things this box rewards: (1) reading the *theme*: "Mayhem/Havoc" narrows the entire investigation to one C2 framework's traffic shape before you open Wireshark; (2) trusting the mask over your assumptions: the persistence username was `administrato` (12 chars), a look-alike, not "administrator" (13). In forensics the artifact is truth; the plausible reading isn't.

