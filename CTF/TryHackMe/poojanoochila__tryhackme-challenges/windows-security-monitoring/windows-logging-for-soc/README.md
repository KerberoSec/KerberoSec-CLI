# Windows Logging for SOC

## Overview

In this room, I explored how Windows logging supports Security Operations Center (SOC) investigations. The exercises introduced the primary Windows log sources used to detect suspicious activity, investigate security incidents, and reconstruct attacker behaviour.

The room emphasized correlating multiple log sources instead of relying on a single event, providing a practical understanding of how analysts investigate real-world incidents.

---

## Objectives

* Understand the purpose of Windows Event Logs.
* Learn how to investigate authentication events.
* Analyse user and privilege management activities.
* Explore Sysmon for endpoint visibility.
* Investigate process creation and network activity.
* Understand how PowerShell history assists forensic investigations.
* Correlate multiple log sources during incident response.

---

## My Approach

During this room, I worked through each investigation by:

* Opening and analysing Windows Event Logs using Event Viewer.
* Filtering logs based on relevant Event IDs.
* Correlating authentication events to identify suspicious login activity.
* Tracking user account creation and privilege changes.
* Investigating Sysmon logs to understand process execution and network connections.
* Following process relationships to reconstruct attacker actions.
* Reviewing PowerShell history to understand executed administrative commands.
* Correlating different log sources to build a complete attack timeline.

Rather than focusing only on individual events, I learned the importance of connecting evidence across multiple logs to understand the full sequence of an attack.

---

## Key Concepts Covered

* Windows Security Logs
* Event IDs
* Successful and Failed Authentication
* RDP Log Analysis
* User Account Management
* Privilege Escalation Detection
* Sysmon
* Process Creation Monitoring
* Parent-Child Process Relationships
* Network Connection Monitoring
* Persistence Indicators
* PowerShell History
* Attack Timeline Reconstruction

---

## Skills Gained

After completing this room, I am more confident in:

* Navigating Windows Event Viewer.
* Identifying important Windows security events.
* Investigating authentication-related incidents.
* Detecting suspicious account activity.
* Analysing Sysmon process creation events.
* Correlating multiple log sources during investigations.
* Understanding endpoint telemetry from a SOC analyst's perspective.
* Building an attack timeline using Windows logs.

---

## Key Takeaways

One of the biggest lessons from this room was that a single event rarely tells the entire story. Effective investigations require correlating authentication logs, process execution, network activity, and user management events to understand what happened before, during, and after an incident.

This room also reinforced the importance of Windows logging and Sysmon as essential data sources for threat detection, incident response, and digital forensics.

---

## Conclusion

This room strengthened my understanding of Windows logging and its role in security operations. It provided practical experience analysing authentication events, process execution, and endpoint activity while reinforcing the importance of log correlation during incident investigations. The knowledge gained here forms a solid foundation for future SOC analyst and threat hunting activities.
