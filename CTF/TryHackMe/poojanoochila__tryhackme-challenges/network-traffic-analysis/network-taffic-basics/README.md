# Traffic Analysis Basics

## Overview

This repository contains my notes, investigation process, and findings from the TryHackMe Traffic Analysis Basics room.

The room introduces fundamental network traffic analysis concepts, packet capture techniques, network taps, and identifying malicious activity within captured traffic.

---

## Skills Practiced

- Network Traffic Analysis
- Packet Inspection
- HTTP Traffic Analysis
- Network Tap Placement
- Malware Download Detection
- Packet Capture Investigation
- Indicator Identification
- Security Monitoring

---

## Objectives

- Understand network visibility concepts
- Identify optimal locations for packet capture
- Analyze HTTP requests and responses
- Detect malicious downloads
- Extract indicators from network traffic

---

## Tools & Concepts

| Category | Technology |
|-----------|------------|
| Traffic Analysis | Packet Inspection |
| Network Monitoring | Network Taps |
| Protocol Analysis | HTTP |
| Security Operations | Threat Hunting |
| Detection | IOC Analysis |

---

## Investigation Summary

The room simulated malicious web activity where a workstation downloaded a malicious PowerShell payload through an HTTP request.

The investigation involved:

1. Determining the best network tap placement.
2. Capturing traffic flowing between the workstation and firewall.
3. Identifying HTTP communication.
4. Reviewing HTTP response content.
5. Locating the malicious PowerShell script.
6. Extracting the challenge flag.

---

## Key Takeaways

- Proper network visibility is critical.
- Strategic packet capture locations provide maximum coverage.
- HTTP traffic can expose malicious payloads in clear text.
- Traffic analysis remains an essential SOC analyst skill.

---

## Learning Outcome

This room strengthened foundational packet analysis skills used during:

- SOC Monitoring
- Incident Response
- Threat Hunting
- Malware Investigations
- Network Forensics
