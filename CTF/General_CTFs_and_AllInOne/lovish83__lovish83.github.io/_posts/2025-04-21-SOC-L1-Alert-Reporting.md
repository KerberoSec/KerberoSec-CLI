---
title: 'TryHackMe: SOC L1 Alert Reporting'
author: Hui_0_07
categories: [TryHackMe]
tags: [SOC, Alert Reporting, Escalation, Communication, L1 Analyst, L2 Analyst, Incident Response, SIEM, Cybersecurity]
render_with_liquid: false
media_subpath: /images/SOC_L1_Alert_Reporting/
image:
  path: intro.webp
---

This TryHackMe room is a **walkthrough-style training module** designed to guide SOC Level 1 (L1) analysts through essential post-triage procedures. It focuses on three critical areas: **alert reporting**, **escalation**, and **communication**. Learners practice writing structured reports using the Five Ws, escalating true positive alerts to L2 analysts, and handling real-world communication scenarios in a SOC environment. Interactive tasks and flags help reinforce concepts and simulate practical SOC workflows, making it ideal for preparing for SAL1 certification and real-world SOC duties.

*[Image: Tryhackme Room Link]*{: width="600" height="150" .shadow }
_<https://tryhackme.com/room/socl1alertreporting>_

## Task1: Introduction

During or after alert triage, L1 analysts might be unsure how to classify alerts and may need help from senior analysts or system owners. Some alerts could indicate real cyberattacks requiring urgent action.

This room introduces three key concepts:
- **Alert Reporting**
- **Alert Escalation**
- **Communication**

### Learning Objectives
- Understand SOC alert reporting and escalation
- Write professional alert comments and reports
- Learn escalation procedures and communication best practices
- Practice triaging in a simulated SOC environment
- Prepare for the SAL1 certification

### Prerequisites
- Complete the SOC L1 Alert Triage room
- Know basic cyberattack types
- Understand SOC L1 responsibilities

Use the SOC Dashboard to continue and practice writing reports and escalating alerts.

> ### ✅ Answer 1
> **Q: I am ready to start!**  
> **Ans: No Answer needed**

## Task 2: Alert Funnel

L1 analysts receive alerts via SIEM, EDR, or ticket systems. Most alerts are closed at L1, but complex threats go to L2. To handle this properly, you must understand:

- **Alert Reporting**: Document findings with evidence, especially for True Positives.
- **Alert Escalation**: Forward complex/confirmed threats to L2 for deeper investigation.
- **Communication**: Coordinate with other departments (e.g., IT, HR) for more context.

> ### ✅ Answer 1 
> **Q: What is the process of passing suspicious alerts to an L2 analyst for review?**  
> **Ans: Alert Escalation**

> ### ✅ Answer 2 
> **Q: What is the process of formally describing alert details and findings?**  
> **Ans: Alert Reporting**

## Task 3: Reporting Guide

L1 analysts must write detailed reports, not just label alerts. These reports help L2, DFIR, or IT teams understand the alert clearly.

### Report Format: The Five Ws:
- **Who**: Involved user (e.g., who logged in or downloaded a file)
- **What**: Specific actions taken
- **When**: Exact time the activity occurred
- **Where**: Devices, IPs, or domains involved
- **Why**: Reasoning behind the alert classification

> ### ✅ Answer 1 
> **Q: According to the SOC dashboard, which user email leaked the sensitive document?**  
> **Ans: m.boslan@tryhackme.thm**

> ### ✅ Answer 2 
> **Q: Who is the "sender" of the suspicious, likely phishing email?**  
> **Ans: support@microsoft.com**

> ### ✅ Answer 3 
> **Q: What flag did you receive after writing a good report using the Five Ws template?**  
> **Ans: THM{nice_attempt_faking_microsoft_support}**

> When writing your alert report, always include clear timestamps and evidence (like file names, IPs, or URLs). 
{: .prompt-tip }

## Task 4: Escalation Guide

After you assess the alert and create a report, you must decide whether to escalate it to L2. The alert should be escalated if:

- **Major Threat**: Indicates a cyberattack requiring further investigation.
- **Remediation Needed**: Actions like malware removal, isolation, or password reset are required.
- **Communication**: Involves customers, partners, or law enforcement.
- **Lack of Understanding**: You need help from senior analysts.

### Escalation Steps:
1. Write the alert report and provide your verdict.
2. Assign the alert to the L2 analyst on shift and notify them.

> ### ✅ Answer 1 
> **Q: Who is your current L2 in the SOC dashboard that you can assign (escalate) the alerts to?**  
> **Ans: E.Fleming**

> ### ✅ Answer 2 
> **Q: What flag did you receive after correctly escalating the alert from the previous task to L2?**  
> **Ans: THM{good_job_[REDACTED]_alert}**
*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 3 
> **Q: What flag did you receive after investigating the second new alert?**  
> **Ans: THM{looks_like_[REDACTED]_exchange}**
*[Image: Info]*{: width="600" height="150" .shadow }

## Task 5: SOC Communication

In critical situations, effective communication is key to resolving issues. Below are some common communication scenarios you may encounter:

- **Unavailable L2**: If L2 is unavailable for 30 minutes, escalate to L3 or your manager.
- **Account Compromise**: Use alternative contact methods (e.g., phone call) to validate compromised account login.
- **Overwhelming Alerts**: Prioritize alerts and inform L2 on shift about the situation.
- **Missed Attack**: Immediately contact L2 if you realize you've missed a malicious action.
- **SIEM Issues**: Report issues with SIEM logs to L2 or SOC engineer.

> ### ✅ Answer 1 
> **Q: Should you first try to contact your manager in case of a critical threat?**  
> **Ans: Nay**

> ### ✅ Answer 2 
> **Q: Should you immediately contact your L2 if you think you missed the attack?**  
> **Ans: Yea**

## Task 6: Conclusion

Great job mastering key SOC skills: alert reporting, escalation, and communication. These are essential for L1 analysts to handle alerts effectively and coordinate with L2 and other departments.

> ### ✅ Answer 1 
> **Q: Are you ready to move on?**  
> **Ans: No Answer Needed**
