---
title: "TryHackMe: Introduction to SIEM"
date: 2026-01-28
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "Learn the fundamentals of SIEM and explore its features and functionality."
---

## Answers

What does SIEM stand for?
**Security Information and Event Management System**

Is Registry-related activity host-centric or network-centric?
**host-centric**

Is VPN-related activity host-centric or network-centric?
**network-centric**

In which location within a Linux environment are HTTP logs stored?
**/var/log/httpd**

Which Event ID is generate when event logs are removed?
**104**

What type of alert may require tuning?
**False Positive**

After clicking on the *Start Suspicious Activity button*, which process caused the alert?
**cudominer.exe**

Find the event that caused the alert and identify the user responsible for the process execution.
**chris**

What is the hostname of the suspect user?
**HR_02**

Examine the rule and the suspicious process; which term matched the rule that caused the alert?
**miner**

Which option best represents the event?
**True Positive**

Selecting the right ACTION will display the FLAG. What is the FLAG?
**THM{000_SIEM_INTRO}**

## Things You Should Know

### SIEM Detection Rules
1. Collect data from sources
2. Aggregate data
3. Discover and detect threats
4. Identify breaches and investigate alerts

### Features of SIEM
- Centralized Log Collection
- Normalization of Logs
- Correlation of Logs
- Real-time Alerting
- Dashboards and Reporting

### How do SIEM solutions ingest logs?
**1. Agent/Forwarder**
   - A lightweight tool (an agent/forwarder) gets installed at the endpoint and its made to capture and send all important logs to the SIEM Server

**2. Syslog**
   - A common protocol that collects data from systems like web servers, databases, and more to send real-time data to a centralized destination

**3. Manual Upload**
   - Some SIEM solutions let users ingest offline data to have fast analysis. Once the data is ingested, it is normalized and available for analysis.

**4. Port-Forwarding**
   - SIEM solutions can be configured to listen on a specific port and the endpoints forward the data to the SIEM session on the listening port.

### How is a detection rule created?
There are **two** example cases in which different rules can be created

**1.** If a hacker is trying to cover their tracks after they exploit, they will try to delete their logs. However, there is an indicator that shows when someone tries to delete their logs. Event ID 104 is logged everytime a user tries to remove or clear event logs.

   **-Example Rule: If the Log source is WinEventLog AND EventID is 104, Then trigger an alert named Event Log Cleared**

**2.** Hackers use the command "whoami" to guage their permissions and priviledges and infilitration and priviledge escalation. When making a rule, you should have these 3 fields
   - **Log source**: identify what source is giving you the event logs
   - **Event ID**: identify the Event ID that is associated with the Process Execution activity. It will be a number
   - **NewProcessName**: Which process name/command will the rule identify ex: whoami, powershell.exe, & ws-server.jar
  
   **- Example Rule: If Log Source is WinEventLog AND EventCode is 4688, and NewProcessName contains whoami, then Trigger an ALERT WHOAMI command Execution DETECTED**

### Alert Investigation
Once an alert is triggered through SIEM, the events associated with that alert are examined and the rule is checked to see if the correct conditions are met. Based on that investigation, an analyst can determine if an alert is a True Positive (A real problem) or a False Positive (An alert that is not a problem and may be a mistake on the user or system)

**Actions to take if its a False Positive:**
- Revise and Edit rule to avoid similar false positives

**Actions to take if its a True Positive:**
- Preform further investigation
- Contact asset owner to ask about this activity
- Isolate infected host if suspicious activity is confirmed
- Block suspicious IP addresses
