# File and Hash Threat Intelligence

> **Platform:** TryHackMe  
> **Difficulty:** Easy  
> **Category:** Threat Intelligence / Malware Analysis / SOC

## Overview

This repository documents my learning experience from the **File and Hash Threat Intelligence** room on TryHackMe. The room focuses on identifying suspicious files using file metadata, cryptographic hashes, and open-source threat intelligence platforms.

The exercises simulate real-world SOC investigations where suspicious files are analyzed using hash lookups, sandbox reports, and threat intelligence sources to determine their reputation, behavior, and potential impact.

---

## Objectives

- Identify suspicious files using naming conventions and metadata.
- Generate cryptographic file hashes.
- Perform hash reputation lookups using threat intelligence platforms.
- Analyze malware behavior using sandbox reports.
- Understand MITRE ATT&CK mappings from malware analysis.
- Correlate threat intelligence findings during investigations.

---

## Investigation Methodology

For each task, I followed a structured threat intelligence workflow similar to what a SOC analyst would perform:

1. Identify suspicious files based on naming patterns and file properties.
2. Generate file hashes to uniquely identify files.
3. Search threat intelligence platforms for known detections.
4. Review malware behavior using sandbox analysis.
5. Examine process execution, persistence mechanisms, and network activity.
6. Correlate findings to understand the malware's capabilities and potential impact.

This workflow demonstrated how hash-based intelligence significantly accelerates malware investigations and incident response.

---

## Commands Used

### Generate SHA256 Hash (PowerShell)

```powershell
Get-FileHash <filename> -Algorithm SHA256
```

---

### Generate SHA256 Hash (Command Prompt)

```cmd
certutil -hashfile <filename> SHA256
```

---

## Threat Intelligence Platforms Explored

- VirusTotal
- MalwareBazaar
- Hybrid Analysis

These platforms were used to:

- Verify file reputation
- Review antivirus detections
- Examine behavioral analysis
- Identify malware families
- View MITRE ATT&CK mappings
- Investigate process trees
- Analyze dropped files
- Review associated network indicators

---

## Key Concepts Covered

### File-Based Threat Intelligence

- File Hashes
- SHA256
- File Reputation
- Malware Classification
- Threat Labels

---

### Malware Analysis

- Static Analysis
- Dynamic Analysis
- Sandbox Reports
- Process Tree Analysis
- Behavioral Indicators

---

### Indicators of Compromise (IOCs)

- File Hashes
- File Names
- URLs
- IP Addresses
- Processes
- Registry Activity
- Dropped Files

---

### MITRE ATT&CK

The room introduced how malware behaviors can be mapped to the MITRE ATT&CK framework to better understand attacker techniques and support threat hunting activities.

---

## Skills Gained

After completing this room, I became more confident in:

- Identifying suspicious files.
- Generating cryptographic file hashes.
- Performing threat intelligence lookups.
- Interpreting VirusTotal analysis reports.
- Using MalwareBazaar for malware reputation checks.
- Investigating sandbox behavior using Hybrid Analysis.
- Understanding malware execution chains through process trees.
- Mapping malware behavior to the MITRE ATT&CK framework.
- Correlating threat intelligence findings to support incident investigations.

---

## Investigation Workflow

```text
Suspicious File
        │
        ▼
Generate SHA256 Hash
        │
        ▼
Threat Intelligence Lookup
(VirusTotal / MalwareBazaar)
        │
        ▼
Behavioral Analysis
(Hybrid Analysis)
        │
        ▼
Review Process Tree
        │
        ▼
Extract IOCs
        │
        ▼
Assess Malware Behavior
        │
        ▼
Support Incident Response
```

---

## Key Takeaways

One of the most valuable lessons from this room was understanding that a file's name can easily be changed, but its cryptographic hash remains a reliable identifier. Hash-based lookups enable analysts to quickly determine whether a file has been previously identified as malicious and gather intelligence from multiple trusted sources.

Another important takeaway was learning how sandbox reports complement hash reputation by revealing runtime behavior, process execution, persistence techniques, and potential attacker objectives.

