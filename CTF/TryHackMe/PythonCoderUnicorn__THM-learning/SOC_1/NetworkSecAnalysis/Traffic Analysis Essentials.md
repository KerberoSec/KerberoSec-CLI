- https://tryhackme.com/room/trafficanalysisessentials

#Networking #NetworkSecurity

NETWORK SECURITY CONTROL LEVELS
- physical = prevent unauth physical access with locks etc
- technical = prevent unauth access to network data (tunnels and security layers)
- admin = creating policies, access levels and auth processes

ACCESS CONTROL APPROACH
- starting point of Network Security is set of controls to ensure authentication and authorization
THREAT CONTROL APPROACH
- detecting and preventing anomalous/ malicious activities  on the network, both internal and external traffic data probes

KEY ELEMENTS OF ACCESS CONTROL
- firewall protection = controls in/out traffic with rules, block suspicious traffic
- Network Access Control (NAC) = verifies device specifications and conditions
- ID and Access Management (IAM) = controls & manages the asset IDs and user access to data systems and resources over the network
- Load Balancing = controls the resource usage to distribute tasks over a set of resources
- Network Segmentation = creates & controls network ranges and isolates user access levels, protects internal network devices from network
- Virtual Private Network (VPN) = creates & controls encrypted communication between devices over the network
- Zero trust model = never trust , always verify

KEY ELEMENTS OF THREAT CONTROL
- intrusion detection & prevention (IDS/IPS) = inspects traffic and creates alerts when detecting a threat
- Data Loss Prevention (DLP) = inspects traffic and analysis of the data & blocks extraction of sensitive data
- Endpoint Protection = protects all endpoints that connect to the network
- cloud security = VPN and data encryption
- SIEM security info and event management
- SOAR security orchestration automation and response
- network traffic analysis , detection, response

MANAGED SECURITY SERVICES (MSS)
- network penetration testing  = simulate attacks external/internal
- vulnerability assessment = analyzing vulns in environment
- incident response = address and managing security breach (ID, contain, eliminate)
- behavioural analysis = create baseline and traffic profile patterns to detect attacks/ vulns

NETWORK TRAFFIC ANALYSIS
Traffic analysis is one of the essential approaches used in network security, and it is part of multiple disciplines of network security operations listed below:

- Network Sniffing and Packet Analysis (Covered in [**Wireshark room**](https://tryhackme.com/room/wiresharkthebasics))
- Network Monitoring (Covered in [**Zeek room**](https://tryhackme.com/room/zeekbro))
- Intrusion Detection and Prevention (Covered in [**Snort room**](https://tryhackme.com/room/snort))  
- Network Forensics (Covered in [**NetworkMiner room**](https://tryhackme.com/room/networkminer))
- Threat Hunting (Covered in [**Brim room**](https://tryhackme.com/room/brim))

|                                                                                                                                                                                                                                                                                                                                              |                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Flow Analysis**                                                                                                                                                                                                                                                                                                                            | **Packet Analysis**                                                                                                                                                                                                                                                                                                                    |
| Collecting data/evidence from the networking devices. This type of analysis aims to provide statistical results through the data summary without applying in-depth packet-level investigation.<br><br>- **Advantage:** Easy to collect and analyse.<br>- **Challenge:** Doesn't provide full packet details to get the root cause of a case. | Collecting all available network data. Applying in-depth packet-level investigation (often called Deep Packet Inspection (DPI) ) to detect and block anomalous and malicious packets.<br><br>- **Advantage:** Provides full packet details to get the root cause of a case.<br>- **Challenge:** Requires time and skillset to analyse. |
|                                                                                                                                                                                                                                                                                                                                              |                                                                                                                                                                                                                                                                                                                                        |

Benefits of the Traffic Analysis:
- Provides full network visibility.
- Helps comprehensive baselining for asset tracking.
- Helps to detect/respond to anomalies and threats.

Network data is a pure and rich data source. Even if it is encoded/encrypted, it still provides a value by pointing to an odd, weird or unexpected pattern/situation. Therefore traffic analysis is still a must-to-have skill for any security analyst who wants to detect and respond to advanced threats.

```
Level-1 is simulating the identification and filtering of malicious IP addresses.

red dots = malicious packets

10.10.99.62
10.10.99.99, 

thm{packet_master}

thm{detection_master}

```

