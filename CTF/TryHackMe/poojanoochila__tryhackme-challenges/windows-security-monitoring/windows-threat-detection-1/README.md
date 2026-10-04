# Windows Threat Detection 1

## Overview

This repository documents my completion of the Windows Threat Detection 1 room on TryHackMe. The room focuses on detecting and investigating common Windows Initial Access techniques by analyzing Windows event logs and system activity.

The investigation scenarios simulate real-world attacks that SOC analysts frequently encounter, including phishing campaigns, RDP-based intrusion attempts, and malware propagation via removable media.

---

## Skills Practiced

* Windows Event Log Analysis
* Security Event Correlation
* Threat Hunting
* Incident Investigation
* IOC Identification
* Process Creation Analysis
* Authentication Log Analysis
* MITRE ATT&CK Mapping

---

## Investigation Methodology

During this room, I followed a structured SOC investigation workflow:

1. Review available Windows security events.
2. Identify suspicious authentication activity.
3. Analyze process creation and execution chains.
4. Investigate file system activity and downloaded artifacts.
5. Examine network connections initiated by suspicious processes.
6. Correlate findings across multiple log sources.
7. Document indicators of compromise and attacker behavior.

---

## Attack Scenarios Investigated

### Remote Desktop (RDP) Intrusion

Investigated authentication events to identify unauthorized access attempts against Windows systems.

Key activities included:

* Reviewing failed and successful logon events
* Identifying suspicious source systems
* Correlating authentication activity with attacker behavior
* Establishing an attack timeline

### Phishing-Based Initial Access

Analyzed multiple phishing scenarios involving malicious attachments and user execution.

Key activities included:

* Examining email-delivered payloads
* Tracing execution chains
* Investigating downloaded files
* Identifying suspicious external communications

### Malware Execution Analysis

Tracked malware activity after initial compromise.

Key activities included:

* Process creation monitoring
* Parent-child process analysis
* File creation and modification review
* Network communication investigation

### USB-Based Malware Propagation

Investigated malware execution from removable media.

Key activities included:

* Identifying executable launches from USB devices
* Tracking malware persistence mechanisms
* Detecting dropped files
* Investigating propagation behavior

---

## MITRE ATT&CK Techniques Observed

| Tactic                 | Examples of Techniques                               |
| ---------------------- | ---------------------------------------------------- |
| Initial Access         | Phishing, Exploitation of Public-Facing Applications |
| Execution              | User Execution                                       |
| Lateral Movement       | Remote Services                                      |
| Command and Control    | External Network Communication                       |
| Persistence            | Malware Deployment                                   |
| Collection & Discovery | Host Enumeration Activities                          |

---

## Detection Opportunities

During the investigation, several high-value detection opportunities were identified:

* Multiple failed authentication attempts followed by successful access
* Execution of files originating from user download locations
* Suspicious process creation chains
* Execution of files from removable media
* Unexpected outbound connections to external domains
* Malware replication behavior across storage devices

These behaviors could be monitored through SIEM correlation rules, endpoint telemetry, and Windows event logging.

---

## Key Takeaways

* Windows event logs provide critical visibility into attacker activity.
* Successful investigations require correlating multiple data sources rather than relying on a single event.
* User-driven attacks such as phishing remain one of the most effective initial access methods.
* Process creation and authentication logs are among the most valuable data sources during investigations.
* Mapping observations to MITRE ATT&CK improves threat classification and reporting.

---

## What I Learned

This room strengthened my understanding of how SOC analysts investigate Windows-based threats using host telemetry and event logs. It reinforced practical skills in threat hunting, incident investigation, attacker behavior analysis, and detection engineering.
The techniques covered closely mirror activities performed in real-world Security Operations Centers when responding to initial access and malware-related incidents.
