# Linux Threat Detection 1

> **Platform:** TryHackMe
> **Difficulty:** Easy
> **Category:** SOC / Blue Team / Threat Detection

## Overview

This repository documents my learning experience from the **Linux Threat Detection 1** room on TryHackMe. The room focuses on detecting common Linux attack techniques by analysing authentication logs, application logs, and audit records to reconstruct attacker activity.

Rather than simply identifying indicators of compromise, the room emphasizes developing an investigative mindset by correlating multiple log sources and tracing malicious activity from initial access to post-exploitation.

---

## Objectives

* Investigate SSH authentication activity.
* Detect brute-force attacks against Linux systems.
* Analyse publicly exposed services as attack vectors.
* Understand process tree analysis.
* Investigate suspicious process execution using `auditd`.
* Correlate multiple log sources during incident investigations.
* Recognize common Linux Initial Access techniques.

---

## Investigation Methodology

I approached each challenge as a real-world SOC investigation by following a structured workflow:

1. Reviewed the relevant Linux log source.
2. Applied filtering techniques to isolate suspicious events.
3. Identified abnormal authentication or application activity.
4. Correlated related events across multiple log sources.
5. Built process relationships to determine the origin of suspicious commands.
6. Validated findings by tracing the complete attack chain instead of relying on a single indicator.

This methodology mirrors the investigation process commonly used by SOC analysts during incident response.

---

## Commands Used During Investigation

### SSH Authentication Analysis

Review SSH authentication events:

```bash
cat /var/log/auth.log | grep "sshd"
```

Identify failed authentication attempts:

```bash
cat /var/log/auth.log | grep "Failed password"
```

Review successful SSH logins:

```bash
cat /var/log/auth.log | grep "Accepted"
```

---

### Application Log Analysis

Inspect web server access logs:

```bash
cat access.log
```

Review application activity to understand how user input was processed:

```bash
cat /opt/<application_directory>/<application_file>
```

---

### Auditd Investigation

Search for execution of a specific process:

```bash
ausearch -i -x <process_name>
```

Trace a process using its Process ID (PID):

```bash
ausearch -i --pid <PID>
```

Continue tracing parent-child relationships until the originating process is identified.

---

### Process Tree Analysis

Correlate:

* Process ID (PID)
* Parent Process ID (PPID)
* Executed command
* Parent application

This helps determine how a suspicious process originated and whether it was launched by a legitimate application or attacker-controlled process.

---

## Key Concepts Covered

* Linux Authentication Logs
* SSH Monitoring
* Password Brute Force Detection
* Initial Access Detection
* Public Service Exploitation
* Application Log Analysis
* Linux Audit Framework (`auditd`)
* Process Tree Analysis
* Parent and Child Process Relationships
* Reverse Shell Investigation
* MITRE ATT&CK Initial Access Techniques

---

## Skills Gained

After completing this room, I am more confident in:

* Analysing SSH authentication logs.
* Detecting brute-force attacks through log analysis.
* Investigating suspicious remote logins.
* Understanding how exposed services can become initial access vectors.
* Using `auditd` to investigate process execution.
* Building process trees to reconstruct attacker activity.
* Correlating authentication, application, and audit logs.
* Applying structured investigation techniques during incident response.

---

## Key Takeaways

This room reinforced that successful threat detection relies on correlation rather than isolated events. Authentication logs reveal how access was obtained, application logs provide context around exploited services, and audit logs allow analysts to trace command execution and reconstruct the complete attack chain.

Process tree analysis proved to be one of the most valuable techniques for identifying the true origin of suspicious activity, making it an essential skill for Linux-focused SOC investigations.

---

## Conclusion

The **Linux Threat Detection 1** room strengthened my understanding of Linux threat detection by combining authentication analysis, application log review, and audit-based process investigation. It provided hands-on experience following attacker activity from initial access through process execution while reinforcing investigation techniques commonly used in Security Operations Centers (SOCs), threat hunting, and incident response.
