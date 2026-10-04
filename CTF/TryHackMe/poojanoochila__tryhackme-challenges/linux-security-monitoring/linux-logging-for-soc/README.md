# Linux Logging for SOC

## Overview

This repository documents my learning experience from the **Linux Logging for SOC** room on TryHackMe. The room introduced the primary Linux log sources used by Security Operations Centers (SOCs) to investigate incidents, detect suspicious behaviour, and reconstruct attack timelines.

Rather than focusing on finding challenge answers, the room emphasized understanding where Linux stores security-relevant information and how different log sources complement one another during an investigation.

---

## Objectives

* Understand the purpose of common Linux log files.
* Investigate authentication and SSH activity.
* Explore user and privilege management events.
* Analyse package installation history.
* Examine shell history for investigative context.
* Learn the basics of Linux runtime monitoring.
* Understand how `auditd` provides detailed forensic visibility.

---

## My Approach

To complete this room, I approached each task as a real-world SOC investigation rather than simply searching for answers.

My workflow included:

* Inspecting system log files to understand normal system activity.
* Filtering authentication logs to identify suspicious login attempts.
* Reviewing user management events to track account creation and privilege changes.
* Examining package management logs to understand software installation history.
* Investigating shell history files to reconstruct user actions.
* Learning how Linux system calls relate to process execution and monitoring.
* Using audit logs to trace file access, executed commands, and system activity.
* Correlating multiple log sources to build a complete picture of host activity.

This approach reinforced the importance of investigating evidence from multiple perspectives instead of relying on a single log source.

---

## Key Concepts Covered

* Linux System Logs
* Syslog
* Authentication Logs
* SSH Activity Monitoring
* User Account Management
* Privilege Escalation Detection
* Package Management Logs
* Bash History Analysis
* Linux System Calls
* Runtime Monitoring
* Auditd
* File Access Monitoring
* Process Execution Logging
* Timeline Reconstruction

---

## Skills Gained

After completing this room, I became more confident in:

* Navigating common Linux log locations.
* Analysing authentication events for suspicious activity.
* Investigating SSH login attempts.
* Detecting user account creation and privilege modifications.
* Reviewing package installation history during investigations.
* Using shell history as an investigative artifact.
* Understanding the role of Linux system calls in security monitoring.
* Analysing `auditd` logs to trace command execution and file access.
* Correlating Linux logs to reconstruct attacker behaviour.

---

## Key Takeaways

One of the biggest lessons from this room was that effective Linux investigations require combining information from multiple log sources. System logs provide operational context, authentication logs reveal access attempts, shell history offers insight into user actions, and audit logs provide detailed forensic evidence.

The room also highlighted the importance of structured log analysis and timeline reconstruction, both of which are essential skills for SOC analysts and incident responders.

---

## Conclusion

The **Linux Logging for SOC** room provided practical exposure to the logging mechanisms available on Linux systems and demonstrated how they support security monitoring and incident investigations. It strengthened my understanding of host-based log analysis and reinforced the importance of correlating different log sources to accurately identify and investigate suspicious activity.
