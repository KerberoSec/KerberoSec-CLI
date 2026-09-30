# Intro to Digital Forensics

> **Platform:** TryHackMe  
> **Difficulty:** Easy  
> **Category:** Digital Forensics / Incident Response / SOC

## Overview

This repository documents my learning experience from the **Intro to Digital Forensics** room on TryHackMe. The room introduces the fundamentals of digital forensics, covering the forensic investigation process, evidence handling, data acquisition, and the importance of maintaining evidence integrity during an investigation.

The room provides a foundational understanding of how digital evidence is collected, preserved, and analyzed to support incident response and legal investigations.

---

## Objectives

- Understand the fundamentals of Digital Forensics.
- Learn the stages of a forensic investigation.
- Understand the importance of evidence preservation.
- Learn about forensic acquisition methods.
- Understand chain of custody.
- Explore common forensic evidence sources.
- Learn best practices followed during forensic investigations.

---

## Learning Methodology

Throughout this room, I approached each topic from the perspective of a Digital Forensics Analyst investigating a security incident.

My learning process included:

- Understanding the digital forensic investigation lifecycle.
- Learning how evidence should be identified and preserved.
- Studying different evidence acquisition techniques.
- Understanding the role of forensic imaging.
- Learning why evidence integrity is critical during investigations.
- Exploring common forensic artifacts found on computer systems.
- Understanding how proper documentation supports investigations.

This approach helped me understand that digital forensics focuses on preserving and analyzing evidence without altering its original state.

---

## Concepts Covered

### Digital Forensics Fundamentals

- Digital Evidence
- Forensic Investigation
- Incident Response
- Evidence Preservation
- Evidence Analysis

---

### Forensic Investigation Process

- Identification
- Collection
- Preservation
- Examination
- Analysis
- Reporting

---

### Evidence Acquisition

- Live Acquisition
- Dead Acquisition
- Disk Imaging
- Memory Acquisition
- Forensic Copies

---

### Evidence Integrity

- Chain of Custody
- Hash Verification
- Evidence Documentation
- Integrity Validation

---

### Common Evidence Sources

- Hard Drives
- Memory (RAM)
- System Logs
- Browser Artifacts
- Email Data
- File Metadata
- Registry Information
- Network Logs

---

### Forensic Best Practices

- Preserve Original Evidence
- Work on Forensic Copies
- Maintain Documentation
- Verify Evidence Integrity
- Follow Chain of Custody
- Minimize Evidence Contamination

---

## Common Commands & Tools Introduced

Although this room was primarily theoretical, I became familiar with several tools commonly used during forensic investigations:

### Calculate File Hashes (Linux)

```bash
sha256sum <filename>
```

### Calculate MD5 Hash

```bash
md5sum <filename>
```

### Windows Hash Generation (PowerShell)

```powershell
Get-FileHash <filename> -Algorithm SHA256
```

### Windows Hash Generation (CMD)

```cmd
certutil -hashfile <filename> SHA256
```

These commands are commonly used to verify that digital evidence has not been modified during acquisition or analysis.

---

## Skills Gained

After completing this room, I became more confident in:

- Understanding the digital forensic investigation process.
- Identifying common digital evidence sources.
- Preserving forensic evidence correctly.
- Understanding forensic acquisition methods.
- Maintaining evidence integrity using cryptographic hashes.
- Understanding the importance of chain of custody.
- Applying forensic best practices during investigations.

---

## Digital Forensics Workflow

```text
Security Incident
        │
        ▼
Identify Evidence
        │
        ▼
Acquire Evidence
        │
        ▼
Verify Integrity
(Hash Validation)
        │
        ▼
Examine Evidence
        │
        ▼
Analyze Findings
        │
        ▼
Document Results
        │
        ▼
Generate Investigation Report
```

---

## Key Takeaways

One of the most valuable lessons from this room was understanding that preserving evidence is just as important as analyzing it. Any modification to the original evidence can compromise an investigation and reduce its legal reliability.

I also learned that maintaining proper documentation, verifying evidence integrity with cryptographic hashes, and following the chain of custody are essential practices for every forensic investigation.

---

## Conclusion

The **Intro to Digital Forensics** room provided a solid introduction to forensic investigation principles and evidence handling. It strengthened my understanding of evidence acquisition, integrity verification, and forensic workflows that support incident response and cybercrime investigations.

These concepts provide a strong foundation for roles in Digital Forensics, Incident Response, Threat Hunting, and Security Operations Centers (SOCs).
