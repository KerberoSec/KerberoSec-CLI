# PATN '24: Present Around the Network 🥇

**Result:** 1st Place  
**Organizer:** IET Delhi Local Network  
**Format:** Technical presentation competition  
**Topic:** Network Security & Emerging Threats

---

## Competition Overview

PATN (Present Around the Network) is IET's flagship competition where participants present on networking and technology topics. The 2024 edition focused on cybersecurity, IoT security, and emerging network threats.

As President of IET On Campus at Amity University, I represented our chapter and secured 1st place.

---

## Presentation Topic

**"Ransomware in the Age of IoT: Detection, Defense, and Digital Resilience"**

Covering:
- How ransomware targets IoT networks and edge devices
- Shannon entropy-based detection techniques (from my published research)
- Behavioral heuristics for early-stage detection
- Defense strategies: network segmentation, shadow copy protection, EDR integration
- Case study: WannaCry's propagation through unpatched SMB

---

## Key Points Covered

### 1. IoT Attack Surface Expansion
- 15+ billion IoT devices connected as of 2024
- Majority run outdated firmware with no patch management
- Default credentials are still the #1 entry vector

### 2. Ransomware Delivery via IoT
- Ransomware uses IoT devices as pivots into enterprise networks
- Once inside, moves laterally via SMB, RDP, or credential harvesting
- Targets: NAS drives, industrial SCADA, hospital equipment

### 3. Detection Methodology (from ICEIL 2024 research)
```
File System Monitoring
    ↓
Entropy Calculation per file (Shannon)
    ↓
Flag files with entropy > 7.2 bits/byte
    ↓
Cross-reference with process behavior
    ↓
Alert + Isolate
```

### 4. Defense Layers
| Layer | Mechanism |
|---|---|
| Network | Segment IoT on isolated VLAN |
| Endpoint | EDR with behavioral monitoring |
| Backup | Immutable backups, shadow copy protection |
| Identity | MFA + privileged access management |
| Detection | Entropy-based file monitoring + SIEM |

---

## Judging Criteria

| Criterion | Weight | My Score |
|---|---|---|
| Technical depth | 30% | 28/30 |
| Presentation clarity | 25% | 24/25 |
| Q&A handling | 20% | 19/20 |
| Relevance & novelty | 25% | 23/25 |
| **Total** | **100%** | **94/100** |

---

## Resources Used

- ICEIL 2024 research paper (Springer Nature)
- CISA Ransomware Guide 2024
- NIST Cybersecurity Framework 2.0
- Wireshark network captures for live demo

---

## Takeaways

Winning PATN reinforced that clear communication of technical concepts is as important as the research itself. Being able to explain entropy-based detection to a mixed technical/non-technical panel, and handle pointed questions about false positive rates: was the key differentiator.
