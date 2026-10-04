---
title: 'TryHackMe: Logless Hunt'
author: Hui_0_07
categories: [TryHackMe]
tags: [Blue Teaming, Cyber Forensics, PowerShell, Windows Defender, RDP, Task Scheduler, Web Access Logs, Mimikatz, Malware Detection, Event Viewer, Incident Response, Digital Forensics]
render_with_liquid: false
media_subpath: /images/Logless_Hunt/
image:
  path: intro.webp
---

This TryHackMe room is a **walkthrough-style DFIR training module** designed to help analysts investigate advanced attack scenarios where threat actors attempt to cover their tracks by wiping **Windows Security logs**. Tailored for `DFIR practitioners` and `SOC L2/L3 analysts`, this room emphasizes using alternative log sources-such as **PowerShell**, **Task Scheduler**, **RDP**, and **Defender logs**-to trace attacker behavior. Learners will analyze a realistic compromise, from initial web exploitation to credential access, using built-in tools and artifacts. With a mix of guided tasks and independent challenges, this room sharpens investigative skills crucial for real-world incident response.

*[Image: Tryhackme Room Link]*{: width="600" height="150" .shadow }
_<https://tryhackme.com/room/loglesshunt>_

*[Image: Tryhackme Room Status]*{: width="600" height="150" .shadow }

## Task 1: Introduction

This DFIR TryHackMe room simulates a stealthy attack where Windows Security logs are cleared. Use native Windows artifacts to trace the intrusion from web exploitation to credential access.  

> ### ✅ Answer 1  
> **Q: Let's begin!**  
> **Ans: No answer needed**

## Task 2: Scenario

The company's IT team dismissed the breach due to cleared Security and System logs. However, signs of compromise later emerged, including crypto scam ads and high CPU usage. You’ve been asked to investigate an overlooked HR server (HR01-SRV) suspected to be part of the attack, especially due to a spike in HTTP traffic from the Users' subnet.

- **Event Log Tampering**: Attackers may clear logs to hide traces (e.g., Event ID 1102).
- **Low-Profile Targets**: Unused systems like HR01-SRV can become footholds.
- **DFIR Objective**: Use remaining logs and system artifacts to reconstruct events.

> ### ✅ Answer 1  
> **Q: What is the earliest Event ID you see in the Security logs?**  
> **Ans: `[REDACTED]`**

> It can easily be seen when opening `Event Viewer`.
{: .prompt-tip}

## Task 3: Initial Access | Web Access Logs

Web applications are common entry points for attackers, especially when exposed via IIS or Apache. Access logs are vital in DFIR to reconstruct HTTP interactions and identify malicious activity such as scans, brute-force attempts, and file uploads. Analyzing HR01-SRV’s Apache logs revealed key indicators of compromise.

- **Access Log Analysis**: Helps trace attacker IP, requests, and uploaded files.
- **Suspicious Activity**: Look for unusual POSTs, 200 responses on unexpected URLs, and large bursts of requests.
- **Indicators Found**: Web shell upload from external IP.

> ### ✅ Answer 1  
> **Q: What is the title of the HR01-SRV web app hosted on 80 port?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 2  
> **Q: Which IP performed an extensive web scan on the HR01-SRV web app?**  
> **Ans: `[REDACTED]`**

> It can easily be found in `access.log` at `C:\Apache24\logs\access.log`.
{: .prompt-tip}

> ### ✅ Answer 3  
> **Q: What is the absolute path to the file that the suspicious IP uploaded?**  
> **Ans: `C:\Apache24\[REDACTED]`**

> It can easily be found in `access.log` at `C:\Apache24\logs\access.log` and also look at the `Hint`.
{: .prompt-tip}

> ### ✅ Answer 4  
> **Q: Clearly, that's suspicious! What would you call the uploaded malware / backdoor?**  
> **Ans: `[REDACTED]`**

> Visit the site at `localhost/uploads/search.php?q=q`.
{: .prompt-tip}

## Task 4: From Web to RDP | PowerShell Logs

PowerShell logs are essential for tracing attacker activity, especially in fileless intrusions. By combining **ConsoleHost_history**, **event ID 600**, and **event ID 4104**, investigators can identify commands executed interactively or via scripts. These logs revealed the attacker’s post-exploitation behavior, including privilege checks, downloading payloads, and setting up RDP tunneling.

- **Key Logs Used**: `ConsoleHost_history`, Event IDs 600 & 4104
- **Indicators**: Initial recon, payload download, Defender bypass, RDP tunneling

> ### ✅ Answer 1  
> **Q: What was the first command entered by the attacker?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 2  
> **Q: What is the full URL of the file that the attacker attempted to download?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 3  
> **Q: What command was run to exclude the file from Windows Defender?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 4  
> **Q: Which remote access service was tunnelled using the uploaded binary?**  
> **Ans: `[REDACTED]`**

> This is easily understood from the scenario or story so far.
{: .prompt-tip}

## Task 5: Breached Admin | RDP Session Logs

To trace attacker activity via RDP, investigators used the **`TerminalServices-LocalSessionManager`** logs, focusing on event IDs:
- **21**: RDP login
- **24**: RDP disconnect
- **25**: RDP reconnect

By correlating session timestamps, usernames, and source IPs, we identified the attacker's successful login and activity window.

> ### ✅ Answer 1  
> **Q: What is the timestamp of the first suspicious RDP login?**  
> **Ans: `[REDACTED]`**

> Use `24-Hour` Format.
{: .prompt-tip} 

> ### ✅ Answer 2  
> **Q: What user did the attacker breach?**  
> **Ans: HR01-SRV\\`[REDACTED]`**

> ### ✅ Answer 3  
> **Q: What IP is shown as the source of the RDP login?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 4  
> **Q: What is the timestamp when the attacker disconnected from RDP?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

## Task 6: Persistence Traces | Scheduled Tasks

Scheduled tasks are often used for persistence, and can be tracked through:
- **Event ID 106**: Task creation
- **Event ID 100**: Task startup
- **Event ID 129**: Task process creation

The **TaskScheduler** log channel and Task XML offer insights into task behavior, useful for uncovering persistence mechanisms.

> ### ✅ Answer 1  
> **Q: What is the name of the suspicious scheduled task?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 2  
> **Q: When was the suspicious scheduled task created?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 3  
> **Q: What is the task's "Trigger" value as shown in Task Scheduler GUI?**  
> **Ans: `[REDACTED]`**

> Open Task Scheduler and go to `trigger` tab.
{: .prompt-tip}

> ### ✅ Answer 4  
> **Q: What is the full command line of the malicious task?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

## Task 7: Credential Access | Windows Defender

Windows Defender logs valuable insights into threat actor activity, especially if they failed to obfuscate their tools or malware. Key events such as detection (event ID 1116), remediation (event ID 1117), and configuration changes (event IDs 5001, 5007, 5013) provide useful data.

> ### ✅ Answer 1  
> **Q: What is the threat family ("Name") of the first quarantined file?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 2  
> **Q: And what is the threat family of the next detected malware?**  
> **Ans: `[REDACTED]`**

> ### ✅ Answer 3  
> **Q: What is the file name of the downloaded Mimikatz executable?**  
> **Ans: `[REDACTED]`**

*[Image: Info]*{: width="600" height="150" .shadow }

> ### ✅ Answer 4  
> **Q: Finally, which Mimikatz command was used to extract hashes from LSASS memory?**  
> **Ans: `[REDACTED]`**

> For this answer, check the `ConsoleHost_history.txt` file at `%AppData%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`.
{: .prompt-tip}

## Task 8: Conclusion

In this task, we reviewed various logs and their use in tracking adversary actions. Here's a brief summary of the concepts covered:

  - Basics of web access logs and their use in detecting web shell upload and usage
  - Three types of PowerShell logs, their differences, and use in tracking malicious actions
  - RDP session logs as a simpler, more compact alternative to the Security 4624 event ID
  - Task scheduler logs, their use to build execution timeline of scheduled tasks
  - Windows Defender logs, their use in malware detection and classification

> ### ✅ Answer 1  
> **Q: Hope you enjoyed this room!**  
> **Ans: No answer needed**

