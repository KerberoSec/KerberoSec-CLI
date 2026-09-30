---
layout: default
title: ProLabs
nav_order: 4
description: "HTB ProLab walkthroughs: Dante, Offshore, RastaLabs, Zephyr, Cybernetics, APTLabs"
permalink: /prolabs/
---

# HackTheBox ProLabs: Detailed Walkthroughs

> Enterprise-grade lab environments simulating real corporate networks. Each covers multi-machine attack paths, lateral movement, and domain dominance.

### Diagram Legend

The network topology diagrams below use the following color coding:

```mermaid
graph LR
    DC[Domain Controller]:::dc
    ENTRY[Entry Point]:::entry
    LINUX[Linux Host]:::linux
    WIN[Windows Host]:::windows
    PIVOT[Pivot / Hardened / MSP]:::pivot

    classDef dc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef entry fill:#2d5016,stroke:#9fef00,color:#fff
    classDef linux fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef windows fill:#3d1a5c,stroke:#b366ff,color:#fff
    classDef pivot fill:#8b4513,stroke:#ff8c00,color:#fff
```

- **Red**: Domain Controllers (primary targets for domain dominance)
- **Green**: Entry points (initial foothold machines)
- **Blue**: Linux hosts
- **Purple**: Windows hosts
- **Orange**: Pivot points, hardened hosts, or MSP infrastructure

---

## 1. Dante (Beginner)

**Machines:** 14 | **Flags:** 27 | **Format:** DANTE{} | **Level:** Penetration Tester Level 1

### Network Architecture
- **Subnet 1 (172.16.1.0/24):** Entry network accessible via VPN
- **Subnet 2 (172.16.2.0/24):** Internal network requiring pivoting through bastion host

**Network Topology:**

```mermaid
graph LR
    classDef dc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef entry fill:#2d5016,stroke:#9fef00,color:#fff
    classDef linux fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef windows fill:#3d1a5c,stroke:#b366ff,color:#fff
    
    subgraph Internet
        VPN[VPN Connection]
    end
    
    subgraph Subnet1["Subnet 1 - 172.16.1.0/24"]
        WEB01[DANTE-WEB-NIX01]:::entry
        NIX02[DANTE-NIX02]:::linux
        NIX03[DANTE-NIX03]:::linux
        NIX04[DANTE-NIX04]:::linux
        FTP05[DANTE-FTP-NIX05]:::linux
        SQL01[DANTE-SQL01]:::windows
        WS01[DANTE-WS01]:::windows
        WS02[DANTE-WS02]:::windows
        WS03[DANTE-WS03]:::windows
        ADMIN01[DANTE-ADMIN01]:::windows
    end
    
    subgraph Subnet2["Subnet 2 - 172.16.2.0/24"]
        DC01[DANTE-DC01]:::dc
        HOST1[Hidden Host 1]:::linux
        HOST2[Hidden Host 2]:::windows
        HOST3[Hidden Host 3]:::linux
    end
    
    VPN --> WEB01
    WEB01 --> NIX02
    WEB01 --> SQL01
    NIX03 --> DC01
    SQL01 --> WS01
    WS02 --> DC01
    ADMIN01 --> Subnet2
```

### Known Machines

| Machine | Role | Key Techniques |
|---------|------|----------------|
| DANTE-WEB-NIX01 | Web server (entry point) | Web exploitation, initial foothold |
| DANTE-NIX02 | Linux host | Service exploitation, credential reuse |
| DANTE-NIX03 | Linux host | Privilege escalation, pivoting |
| DANTE-NIX04 | Linux host | Custom exploitation |
| DANTE-FTP-NIX05 | FTP server | FTP enumeration, file retrieval |
| DANTE-SQL01 | Database server | SQL exploitation, credential extraction |
| DANTE-WS01 | Windows workstation | Windows exploitation, lateral movement |
| DANTE-WS02 | Windows workstation | Post-exploitation, credential harvesting |
| DANTE-WS03 | Windows workstation | Privilege escalation |
| DANTE-DC01 | Domain Controller | AD enumeration, domain compromise |
| DANTE-ADMIN01 | Admin server | Jenkins exploitation |
| + 3 additional hosts in second subnet | Various | Pivoting required |

### Techniques Covered
- Network enumeration and service discovery
- Web application exploitation (SQLi, file upload, CMS exploits)
- Buffer overflow and custom payload crafting
- Pivoting through bastion hosts (Chisel, SSH tunneling, Ligolo-ng)
- Password profiling and credential reuse
- Windows and Linux privilege escalation
- Basic Active Directory enumeration
- Multi-network pivoting

### Writeup Resources
- [Beginner Guide: dr34mhacks](https://dr34mhacks.github.io/posts/dante-walkthrough-beginner-guide/)
- [Review: Nicholas D'Acri (Medium)](https://nicholasdacri.medium.com/htb-pro-lab-dante-review-wrecks-lessons-02ca78c1e26e)
- [Dante Prolab: Barath (Medium)](https://medium.com/@barath.ravan/dante-prolab-hackthebox-50ef7101d7cb)
- [Review: The Grey Corner](https://thegreycorner.com/2021/12/15/hackthebox_dante-review.html)
- [Review: Dev-angelist (Medium)](https://medium.com/@dev-angelist/my-journey-into-htb-dante-prolab-0a02e00311fd)
- [Walkthrough: s4my9](https://s4my9.github.io/posts/dante-htb-prolab/)

---

## 2. Offshore (Intermediate)

**Machines:** 21 | **Flags:** 38 | **Level:** Penetration Tester Level 2

### Network Architecture
- **DMZ:** Internet-facing services
- **4 Active Directory Domains:** Multi-domain forest with trust relationships

**Network Topology:**

```mermaid
graph LR
    classDef dc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef entry fill:#2d5016,stroke:#9fef00,color:#fff
    classDef dmz fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef internal fill:#1a3a5c,stroke:#4da6ff,color:#fff
    
    subgraph DMZ["DMZ - Internet Facing"]
        WEB[Web Server]:::entry
        MAIL[Mail Server]:::dmz
    end
    
    subgraph Domain1["Domain 1"]
        DC1[Domain Controller 1]:::dc
        SRV1[Server 1]:::internal
        WS1[Workstation 1]:::internal
    end
    
    subgraph Domain2["Domain 2"]
        DC2[Domain Controller 2]:::dc
        SRV2[Server 2]:::internal
    end
    
    subgraph Domain3["Domain 3"]
        DC3[Domain Controller 3]:::dc
        SRV3[Server 3]:::internal
    end
    
    subgraph Domain4["Domain 4"]
        DC4[Domain Controller 4]:::dc
    end
    
    WEB --> Domain1
    Domain1 -->|Trust| Domain2
    Domain2 -->|Trust| Domain3
    Domain3 -->|Trust| Domain4
```

### Techniques Covered

| Category | Specific Techniques |
|----------|-------------------|
| Web Exploitation | PHP RFI, CMS exploitation, web shells |
| Active Directory | Kerberoasting, AS-REP Roasting, DCSync, Pass-the-Hash |
| ADCS | ESC1 certificate abuse |
| Delegation | Constrained Delegation exploitation |
| Lateral Movement | NTLM Relay, PrintNightmare, Shadow Credentials |
| Pivoting | Ligolo-ng multi-hop tunneling |
| Credential Attacks | Password spraying, hash cracking, credential reuse |
| Enumeration | BloodHound, PowerView, AD enumeration at every stage |

### Key Takeaways
- ENUMERATION is critical at every stage
- BloodHound is essential for mapping AD attack paths
- CRTP knowledge gets you reasonably far
- Combines web exploitation with heavy AD content
- Includes some CTF-style crypto challenges

### Writeup Resources
- [Offshore Review: robsware (Medium)](https://robsware.medium.com/hackthebox-offshore-review-df5d17390922)
- [Offshore Review: mrb3n](https://www.mrb3n.com/?p=551)
- [Offshore Review: thehackerish](https://thehackerish.com/penetration-testing-lab-review-hackthebox-offshore/)
- [Offshore Review: TheZenTester](https://thezentester.com/htb-pro-labs-offshore-a-review/)
- [Offshore ProLab: LazyHackers](https://lazyhackers.in/article/hackthebox-offshore-pro-lab)
- [HTBPro Writeups](https://htbpro.xyz/)

---

## 3. RastaLabs (Intermediate)

**Machines:** 15 | **Level:** Red Team Operator Level 2

### Overview
Created by Rastamouse (creator of CRTO certification). Simulates a realistic corporate environment where all systems are reasonably patched, forcing reliance on misconfigurations and AD weaknesses rather than CVEs.

**Network Topology:**

```mermaid
graph TD
    classDef dc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef entry fill:#2d5016,stroke:#9fef00,color:#fff
    classDef server fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef workstation fill:#3d1a5c,stroke:#b366ff,color:#fff
    
    subgraph External["External / Phishing"]
        PHISH[Phishing Campaign]:::entry
    end
    
    subgraph Corporate["Corporate Network"]
        DC[Domain Controller]:::dc
        FS[File Server]:::server
        WEB[Web Server]:::server
        WS1[Workstation 1]:::workstation
        WS2[Workstation 2]:::workstation
        WS3[Workstation 3]:::workstation
        DB[Database Server]:::server
        MAIL[Mail Server]:::server
    end
    
    PHISH --> WS1
    WS1 --> FS
    WS1 --> WEB
    FS --> WS2
    WS2 --> DB
    DB --> WS3
    WS3 --> DC
```

### Techniques Covered

| Category | Specific Techniques |
|----------|-------------------|
| Initial Access | Phishing campaigns, OSINT on company info |
| Credential Attacks | Password cracking, brute-forcing, password manipulation, wordlist creation |
| Active Directory | AD misconfiguration exploitation, trust abuse |
| Lateral Movement | C2 frameworks, network pivoting |
| Persistence | Establishing persistent access |
| Privilege Escalation | Local privesc, domain escalation |
| Evasion | Payload obfuscation, AV bypass |

### Essential Tools
- BloodHound (AD relationship mapping)
- Impacket Suite (network protocol interactions)
- C2 Framework (Cobalt Strike / Sliver / Covenant)
- PowerView / SharpHound

### Key Advice
- NOT beginner-friendly; requires solid AD and red team fundamentals
- Rastamouse's blog archives are directly relevant to lab techniques
- Take hierarchical notes for quick reference during enumeration
- Directly aligned with CRTO certification material

### Writeup Resources
- [Review: Vardan Bansal (Medium)](https://medium.com/@vardan_24823/review-of-hackthebox-pro-labs-rastalabs-30fcd4228c47)
- [Everything You Need to Know: Krishnakant (Medium)](https://medium.com/@kksharma.infosec/hack-the-box-rastalabs-review-everything-you-need-to-know-before-starting-378ffe3cc5ff)
- [Review: RedTeamTrainingReviews](https://www.redteamtrainingreviews.com/hackthebox/rastalabs.html)
- [Review: Dylan Marino](https://dylanmarino.com/rastalabs-review/)
- [Detailed Review: sathiyanarayana (Medium)](https://sathiyanarayana-pentester.medium.com/hackthebox-rastalabs-where-your-patience-and-coffee-will-be-tested-a-detailed-review-of-this-537f9f4bc710)

---

## 4. Zephyr (Intermediate)

**Machines:** 17 | **Flags:** 17 | **Level:** Red Team Operator Level 1

### Network Architecture
- **3 Active Directory Domains** with 3 Domain Controllers
- Pure Active Directory: no web apps, no advanced stuff
- Each domain has corresponding servers and workstations

**Network Topology:**

```mermaid
graph LR
    classDef dc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef entry fill:#2d5016,stroke:#9fef00,color:#fff
    classDef server fill:#1a3a5c,stroke:#4da6ff,color:#fff
    classDef workstation fill:#3d1a5c,stroke:#b366ff,color:#fff
    
    subgraph DomainA["Domain A"]
        DCA[DC-A]:::dc
        SRVA1[Server A1]:::server
        SRVA2[Server A2]:::server
        WSA1[Workstation A1]:::workstation
        WSA2[Workstation A2]:::entry
    end
    
    subgraph DomainB["Domain B"]
        DCB[DC-B]:::dc
        SRVB1[Server B1]:::server
        WSB1[Workstation B1]:::workstation
    end
    
    subgraph DomainC["Domain C"]
        DCC[DC-C]:::dc
        SRVC1[Server C1]:::server
        WSC1[Workstation C1]:::workstation
    end
    
    WSA2 --> SRVA1
    SRVA1 --> DCA
    DCA -->|Trust| DCB
    DCB --> SRVB1
    SRVB1 --> WSB1
    DCB -->|Trust| DCC
    DCC --> SRVC1
```

### Techniques Covered

| Category | Specific Techniques |
|----------|-------------------|
| AD Enumeration | BloodHound, domain trust mapping |
| Kerberos Attacks | Kerberoasting, Pass-the-Hash, ticket manipulation |
| Delegation | Constrained Delegation abuse |
| Cross-Domain | Pivoting between domains, trust exploitation |
| ADCS | Certificate Services exploitation |
| DPAPI | Data Protection API secret extraction |
| Lateral Movement | Multi-domain privilege escalation |

### Created By
- Daniel Morris (dmw0ng) and Matthew Bach (TheCyberGeek)

### Key Advice
- Integrates tools like BloodHound and Kerberoasting across a sprawling interconnected network
- Directly aligned with CRTP and CRTO material
- Requires thinking about attack strategies across domain boundaries
- Not just linear "exploit one machine, move on": requires strategic pivoting

### Writeup Resources
- [Review: pri3st (Medium)](https://medium.com/@pri3st/hack-the-box-red-team-operator-pro-labs-review-zephyr-8c175b4d02fe)
- [Review: arth0s (Medium)](https://arth0s.medium.com/hackthebox-zephyr-pro-lab-review-a016ac17a26f)
- [Pentester's Perspective: Technicalhats (Medium)](https://yennitarunkumar.medium.com/hack-the-box-zephyr-pro-lab-a-pentesters-perspective-48986a90a601)
- [Official Blog Post](https://www.hackthebox.com/blog/professional-labs-zephyr)

---

## 5. Cybernetics (Advanced)

**Machines:** 20+ | **Level:** Red Team Operator Level 2

### Overview
Immersive enterprise AD environment with advanced infrastructure and strong security posture. Systems are fully patched with hardened OS configurations. AV catches default payloads.

**Network Topology:**

```mermaid
graph TD
    classDef dc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef entry fill:#2d5016,stroke:#9fef00,color:#fff
    classDef hardened fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef server fill:#1a3a5c,stroke:#4da6ff,color:#fff
    
    subgraph Perimeter["Perimeter - Hardened"]
        PHISH[Phishing Entry]:::entry
        WEB[Web Server]:::hardened
    end
    
    subgraph ChildDomain["Child Domain"]
        CDC[Child DC]:::dc
        SRV1[App Server]:::server
        SRV2[File Server]:::server
        WS1[Workstation]:::hardened
    end
    
    subgraph ParentDomain["Parent/Forest Root"]
        PDC[Root DC]:::dc
        SRV3[Admin Server]:::server
    end
    
    PHISH --> WS1
    WEB --> SRV1
    WS1 --> SRV2
    SRV2 --> CDC
    CDC -->|Parent Trust| PDC
    PDC --> SRV3
```

### Techniques Covered

| Category | Specific Techniques |
|----------|-------------------|
| AV Evasion | Custom C# payloads, encrypted payloads, obfuscation |
| Phishing | Advanced phishing campaigns (particularly challenging section) |
| Active Directory | Child/parent domain traversal, cross-forest attacks |
| Lateral Movement | Multi-domain lateral movement |
| Custom Tooling | Building custom C# tools for Windows environments |
| Hardened Environments | Bypassing updated AV, hardened OS configurations |

### Key Challenges
- Default binaries/payloads get flagged and removed by AV
- Phishing section requires significant research
- Playing solo is quite challenging
- Custom C# code essential for Windows environments
- Earns Red Team Operator Level 2 certification upon completion

### Writeup Resources
- [Review: swzhouu (Medium)](https://swzhouu.medium.com/hack-the-box-cybernetics-pro-lab-review-a02c91026c90)
- [Review: RedTeamTrainingReviews](https://www.redteamtrainingreviews.com/hackthebox/cybernetics.html)
- [AD Labs Review: GitHub](https://github.com/ryan412/ADLabsReview)
- [ProLabs Review: Leo Smith](https://leosmith.wtf/blog/big-boy-cert.html)

---

## 6. APTLabs (Advanced)

**Machines:** 20+ | **Level:** Red Team Operator Level 3

### Overview
The most challenging ProLab. Simulates a targeted attack by an external threat agent against a Managed Service Provider (MSP). No CVEs are needed: all attacks exploit misconfigurations and trust relationships. Requires C2 framework usage (Cobalt Strike recommended).

**Network Topology:**

```mermaid
graph LR
    classDef dc fill:#5c1a1a,stroke:#ff4444,color:#fff
    classDef entry fill:#2d5016,stroke:#9fef00,color:#fff
    classDef msp fill:#8b4513,stroke:#ff8c00,color:#fff
    classDef client fill:#1a3a5c,stroke:#4da6ff,color:#fff
    
    subgraph MSP["MSP Network"]
        ENTRY[Entry Point]:::entry
        MSP_DC[MSP DC]:::dc
        MSP_SRV[MSP Tools]:::msp
    end
    
    subgraph ClientA["Client A"]
        CA_DC[Client A DC]:::dc
        CA_SRV[Client A Server]:::client
    end
    
    subgraph ClientB["Client B"]
        CB_DC[Client B DC]:::dc
        CB_SRV[Client B Server]:::client
    end
    
    subgraph ClientC["Client C"]
        CC_DC[Client C DC]:::dc
        CC_SRV[Client C Server]:::client
    end
    
    ENTRY --> MSP_DC
    MSP_SRV --> CA_DC
    MSP_SRV --> CB_DC
    MSP_SRV --> CC_DC
    CA_DC --> CA_SRV
    CB_DC --> CB_SRV
    CC_DC --> CC_SRV
```

### Techniques Covered

| Category | Specific Techniques |
|----------|-------------------|
| APT Simulation | Long-lasting TTPs, patient attack chains |
| Enterprise Technology | Attacking real enterprise software and services |
| MSP Exploitation | Compromising MSP to reach client networks |
| Multi-Domain | Compromising all client networks |
| C2 Operations | Cobalt Strike or equivalent C2 framework mandatory |
| Research | Heavy "Google-ninja" research required |

### Key Characteristics
- Took ~2 months to complete (vs 1 month for other ProLabs)
- No hand-holding; Discord community is the only help
- Goal: compromise ALL client networks and reach Domain Admin everywhere
- Cobalt Strike recommended over open-source C2
- Requires advanced research skills

### Writeup Resources
- [APTLabs Review: Avantguard](https://avantguard.io/en/blog/aptlabs-review)
- [Review: RedTeamTrainingReviews](https://www.redteamtrainingreviews.com/hackthebox/aptlabs.html)
- [AD Labs Review: GitHub](https://github.com/ryan412/ADLabsReview)
- [ProLabs Review: Leo Smith](https://leosmith.wtf/blog/big-boy-cert.html)

---

## ProLab Progression Path

```
Dante (Beginner) --> Offshore (Intermediate) --> RastaLabs (Intermediate)
                                                      |
                                                      v
                     Zephyr (Intermediate) --> Cybernetics (Advanced)
                                                      |
                                                      v
                                              APTLabs (Advanced)
```

**Certification Alignment:**
- Dante/Offshore: OSCP, CPTS preparation
- RastaLabs/Zephyr: CRTO, CRTP preparation
- Cybernetics/APTLabs: Advanced red team operations
