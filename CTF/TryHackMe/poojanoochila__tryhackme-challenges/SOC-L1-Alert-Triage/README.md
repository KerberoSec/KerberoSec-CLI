# SOC L1 Alert Triage: TryHackMe 

## Overview

This repository documents my completion of the **SOC L1 Alert Triage** room on TryHackMe. The room simulates the responsibilities of a Security Operations Center (SOC) Level 1 Analyst, focusing on alert investigation, triage, and incident validation.

The objective was to analyze security alerts, identify malicious activity, distinguish true positives from false positives, and make informed decisions based on available evidence.

---

## Skills Demonstrated

* Security Alert Analysis
* Incident Triage
* Threat Detection
* Log Analysis
* IOC Investigation
* Event Correlation
* SOC Workflow Understanding
* Security Operations Fundamentals
* Documentation and Reporting

---

## Learning Objectives

Throughout this room, I learned how to:

* Understand the role of a SOC Level 1 Analyst
* Review and prioritize incoming alerts
* Investigate suspicious events
* Analyze Indicators of Compromise (IOCs)
* Determine alert legitimacy
* Escalate incidents when required
* Document findings professionally

---

## Alert Triage Methodology

The following workflow was used during investigations:

### 1. Alert Review

* Identify alert severity
* Review alert description
* Determine affected assets
* Understand triggered detection rules

### 2. Initial Investigation

* Examine logs and event details
* Identify suspicious behaviors
* Review timestamps and affected users
* Collect available evidence

### 3. IOC Analysis

Examples of indicators investigated:

* Malicious IP addresses
* Suspicious domains
* File hashes
* Abnormal user activity
* Unusual process execution

### 4. Correlation

* Compare events across multiple sources
* Identify related activities
* Validate attack patterns
* Establish investigation timeline

### 5. Verdict

Classify the alert as:

* True Positive (TP)
* False Positive (FP)
* Benign Activity
* Requires Escalation

### 6. Documentation

Record:

* Findings
* Evidence
* Impact
* Recommended actions

---

## Investigation Example Template

### Alert Information

| Field      | Value               |
| ---------- | ------------------- |
| Alert Name | Example Alert       |
| Severity   | Medium              |
| Source     | SIEM                |
| Timestamp  | YYYY-MM-DD HH:MM:SS |
| Analyst    | Elsa                |

### Investigation Summary

A security alert was generated indicating suspicious activity on a monitored endpoint. The investigation involved reviewing related logs, validating indicators, and determining whether the activity represented a genuine threat.

### Findings

* Indicator identified
* Relevant log entries reviewed
* User activity analyzed
* Timeline established

### Verdict

**True Positive / False Positive**

### Reasoning

Provide evidence supporting the decision.

### Recommended Actions

* Block malicious indicators
* Monitor affected systems
* Escalate if necessary
* Update detection rules

---

## Key Takeaways

* Effective triage requires both technical analysis and critical thinking.
* Context is essential when determining alert legitimacy.
* Proper documentation improves incident response efficiency.
* Not every alert represents malicious activity.
* Analysts must balance speed and accuracy during investigations.

---

## Tools and Concepts Used

* SIEM Platforms
* Threat Intelligence
* IOC Analysis
* Log Investigation
* Event Correlation
* Incident Response Workflow
* Security Monitoring

---

## Career Relevance

This room provided hands-on exposure to tasks commonly performed by SOC Level 1 Analysts, including:

* Monitoring security alerts
* Investigating suspicious events
* Identifying potential threats
* Making escalation decisions
* Maintaining investigation records

These skills directly align with entry-level SOC Analyst responsibilities.

---

## Repository Structure

```
SOC-L1-Alert-Triage/
│
├── README.md
├── Investigation-Notes.md
├── Alert-Triage-Workflow.md
└── Lessons-Learned.md
```

---

## Disclaimer

This repository is intended for educational and portfolio purposes only. No challenge flags, answers, or proprietary content from TryHackMe have been disclosed.

