---
title: "TryHackMe: IDS Fundamentals"
date: 2026-01-28
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "Learn the fundamentals of IDS, along with the experience of working with Snort."
---

## Answers

Can an intrusion detection system (IDS) prevent the threat after it detects it? Yea/Nay

**Nay**

Which type of IDS is deployed to detect threats throughout the network?

**Network Intrusion Detection System**

Which IDS leverages both signature-based and anomaly-based detection techniques?

**Hybrid IDS**

Which mode of Snort helps us to log the network traffic in a PCAP file?

**Packet Logging Mode**

What is the primary mode of Snort called?

**Network Intrusion Detection System Mode**

Where is the main directory of Snort that stores its files?

**/etc/snort**

Which field in the Snort rule indicates the revision number of the rule?

**rev**

Which protocol is defined in the sample rule created in the task?

**icmp**

What is the file name that contains custom rules for Snort?

**local.rules**

What is the IP address of the machine that tried to connect to the subject machine using SSH?

**10.11.90.211**

What other rule message besides the SSH message is detected in the PCAP file?

**Ping Detected**

What is the sid of the rule that detects SSH?

**1000002**

## Things You Should Know

An Intrusion Detection System (IDS) is like survellance cameras that can detect problems and malicious activity but they cannot act to stop it.

### Types of Intrusion Detection Systems

**Host Intrusion Detection System (HIDS):** A host-based solution that is installed on individual hosts/networks that are responsible for only detecting potential security threats associated with that host. They are detailed with data but difficult to manage in large networks.

**Network Intrusion Detection System (NIDS):** A network-based solution that is crucial in detecting potentially malicious activities within a whole network. They monitor the network traffic of all hosts on the network to detect suspicious activities. NIDS directs all the detection in the whole network to one centralized location to be viewed.

### IDS Detection Modes

**Signature-Based IDS:** Different cyber attacks have unique patterns that are stored in a database so the IDS can detect attacks that have been executed previously somewhere else. Signature-Based IDS cannot detect zero-day attacks which are attacks that have never been used before. Snort is an example of a Signature-Based IDS

**Anomaly-Based IDS:** This type of IDS learns the normal behavior of the network/system and preforms detections to find deviations or anomalies in the normal behavior. It can detect zero-day attacks since it goes based off of abnormalities in the system instead of previous signatures. However, it generats a lot of false positives since malicious programs can match legitimate programs.

**Hybrid IDS:** A Hybrid IDS combines a Signature-Based IDS and an Anomaly-Based IDS. It changes its detection mode based on if it was a signature matching the IDS database or if its a new threat. It leverages the strengths of both detection modes.

### Snort

**Packet Sniffer Mode:**

This mode reads and displays network packets without preforming an analysis on them. This allows you to display network traffic on the console or output it to a file. Its useful if you need to detect a specific problem that doesnt need diagnoses.

**Packet Logging Mode:**

This mode performs detection on the network traffic in real-time and displays detections as alerts for you to take action. It also can log all network traffic and detections in a PCAP (Standard Packet Capture Format) file so it can be referred to for analysis later on.

**Network Intrusion Detection System Mode:**

The NIDS mode is the primary mode of Snort that monitors network traffic in real-time while applying its rule files to detect attacks that match the patterns stored as signatures in its database.

## Snort Rule Formats

{Need Rule Format Image}

**Action:** When the rule triggers, what action will the rule take?

**Protocol:** What protocol (For example: ICMP) does this rule

**Source IP:** What IP is send the traffic to the destination?

**Source Port:** The port from which that traffic comes from.

**Destination IP:** What IP address is the traffic going to? It generates the alerts.

**Destination Port:** The Port that traffic goes to.

**Rule Metadata:** Metadata is defined at the end of a rule in parentheses. Some examples are:
- Message (msg)
- Signature ID (sid)
- Rule Revision (rev)
