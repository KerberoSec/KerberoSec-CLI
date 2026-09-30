# macOS Forensics: The Basics: SOC Investigation 
   
## Overview 

This project documents a forensic investigation conducted on a macOS disk image. The objective was to extract and validate user-level evidence to answer a targeted investigative question. 
 
---

## Objectives
 
* Analyze a mounted macOS disk image 
* Extract user-related artifacts
* Identify and validate critical evidence
* Simulate a SOC/DFIR investigation workflow 

---
 
## Investigation Summary

### Evidence Acquisition

* Mounted the disk image in read-only mode
* Ensured integrity before analysis

### File System Analysis

* Explored:

  * `/Users/`
  * `/Library/`
  * `/System/`

### Artifact Extraction

* Identified user data and configuration files
* Extracted relevant system and user artifacts

### Key Finding

* Recovered the target user’s password from the mounted image
* This serves as direct evidence of user activity

### Validation

* Correlated the extracted password with system artifacts
* Confirmed it as reliable ground truth evidence

---

## Results

* Successful extraction of user credentials
* Verified user presence and activity
* Established a base for further investigation

---

## SOC Mapping

| Phase         | Activity                     |
| ------------- | ---------------------------- |
| Detection     | Suspicious activity scenario |
| Investigation | Disk image analysis          |
| Evidence      | Extracted user password      |
| Validation    | Artifact correlation         |
| Outcome       | Confirmed user activity      |

---

## Skills Gained

* macOS forensic analysis
* Artifact-based investigation
* Evidence validation techniques
* Structured SOC workflow execution

---

## Key Takeaways

* macOS systems contain valuable forensic artifacts
* Direct evidence strengthens investigation conclusions
* Validation is critical in DFIR workflows

---

## Future Work

* Timeline reconstruction
* Deeper artifact analysis
* Automation using forensic tools
