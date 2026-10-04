# SOC Analyst Path

> **Platform:** LetsDefend  **Difficulty:** Beginner  **Category:** Blue Team / Defensive Security  **Status:** ✅ Completed

---

## 📋 Table of Contents

* [Challenge Overview](#challenge-overview)
* [Tools Used](#tools-used)
* [Walkthrough](#walkthrough)

  * [Module 1: Introduction to SOC](#module-1--introduction-to-soc)
  * [Module 2: SIEM and Analyst Relationship](#module-2--siem-and-analyst-relationship)
  * [Module 3: Log Management](#module-3--log-management)
  * [Module 4: EDR (Endpoint Detection and Response)](#module-4--edr-endpoint-detection-and-response)
  * [Module 5: SOAR](#module-5--soar)
  * [Module 6: Threat Intelligence Feed](#module-6--threat-intelligence-feed)
  * [Module 7: Common Mistakes by SOC Analysts](#module-7--common-mistakes-by-soc-analysts)
* [Flags / Answers](#flags--answers)
* [Key Takeaways](#key-takeaways)

---

## Challenge Overview

As part of my Blue Team learning journey, I completed the **SOC Analyst Learning Path** on LetsDefend. This path introduced me to the core concepts, workflows, and technologies used in a modern Security Operations Center (SOC).

Throughout the modules, I explored how SOC teams detect, investigate, and respond to security incidents using industry-standard tools such as SIEM, EDR, Log Management platforms, SOAR solutions, and Threat Intelligence feeds.

The hands-on exercises helped me understand how analysts investigate alerts, validate threats, reduce false positives, and coordinate response activities within a SOC environment.

### Topics I Covered

* SOC structure, responsibilities, and operational models
* Roles within a Security Operations Center
* SIEM alert investigation and triage workflows
* Centralized log management and event correlation
* Endpoint Detection and Response (EDR) investigations
* SOAR automation and playbook-driven response
* Threat Intelligence integration and IOC enrichment
* Common mistakes analysts make during investigations

---

## Tools Used

| Tool                    | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| SIEM                    | Alert monitoring and threat detection            |
| Log Management          | Centralized log collection and querying          |
| EDR                     | Endpoint monitoring and investigation            |
| SOAR                    | Security workflow automation                     |
| VirusTotal              | Reputation analysis for files, domains, and URLs |
| Talos Intelligence      | Threat intelligence enrichment                   |
| LetsDefend Threat Intel | IOC investigation and validation                 |

---

## Walkthrough 

### Module 1: Introduction to SOC

In this module, I learned how a **Security Operations Center (SOC)** functions as the central hub for monitoring, detecting, analyzing, and responding to cybersecurity incidents.

One of the key concepts introduced was the three foundational pillars of a SOC:

* **People**
* **Processes**
* **Technology**

I also explored different SOC operating models:

* **In-house SOC**: Managed internally by an organization.
* **Virtual SOC**: Operates remotely without a dedicated facility.
* **Co-Managed SOC**: Internal teams work alongside external MSSPs.
* **Command SOC**: Coordinates and oversees multiple SOC environments.

### Key SOC Roles

| Role               | Responsibility                              |
| ------------------ | ------------------------------------------- |
| SOC Analyst        | Alert triage, investigation, and response   |
| Incident Responder | Handles security incidents and containment  |
| Threat Hunter      | Proactively searches for advanced threats   |
| Security Engineer  | Maintains SOC tools and infrastructure      |
| SOC Manager        | Oversees operations, staffing, and strategy |

#### Question

**What type of SOC consists of both internal and external employees?**

**Answer:** `Co-Managed SOC`

---

### Module 2: SIEM and Analyst Relationship

This module focused on understanding how **SIEM (Security Information and Event Management)** platforms collect, normalize, correlate, and analyze logs from multiple sources to generate security alerts.

I learned the typical investigation workflow:

1. A detection rule generates an alert.
2. The alert appears in the monitoring queue.
3. An analyst takes ownership of the alert.
4. The alert moves into investigation.
5. Additional tools such as EDR, Log Management, and Threat Intelligence are used for analysis.
6. The analyst determines whether the alert is malicious or a false positive.

A valuable lesson from this section was understanding that false positives should be documented and shared with SIEM engineers so detection rules can be improved.

#### Question

**When you close an alert, which channel can you access it from?**

**Answer:** `Closed Alerts`

---

### Module 3: Log Management

In this module, I learned how centralized log management simplifies investigations by collecting logs from multiple sources into a single searchable interface.

Instead of reviewing logs individually across firewalls, proxies, endpoints, and email servers, analysts can query all available data from one location.

Common use cases include:

* Tracking communication with malicious IP addresses.
* Investigating suspicious domains.
* Detecting lateral movement.
* Identifying additional affected systems.

#### Questions

**What source IP address entered the URL https://github.com/apache/flink/compare?**

**Answer:** `172.16.17.54`

**What is the type of log that has a destination port of 52567 and source IP 8.8.8.8?**

**Answer:** `DNS`

---

### Module 4: EDR (Endpoint Detection and Response)

This section introduced me to the role of EDR solutions in endpoint monitoring and investigation.

I learned how EDR tools provide visibility into:

* Running processes
* Network connections
* Browser activity
* File executions
* Endpoint telemetry

Key capabilities explored:

* IOC searches across all endpoints
* Process analysis
* Live investigation sessions
* Endpoint containment

One important lesson was that containment isolates a device from the network while still allowing analysts to continue their investigation through the EDR platform.

#### Questions

**What is the hostname of the device where the nmap file with hash 83e0cfc95de1153d405e839e53d408f5 is executed?**

**Answer:** `EricProd`

**A Ps1.hta file was executed on hostname Roberto. What is the complete CMD command?**

**Answer:** `C:/Windows/System32/mshta.exe C:/Users/roberto/Desktop/Ps1.hta`

---

### Module 5: SOAR

In this module, I explored **Security Orchestration, Automation, and Response (SOAR)** technology.

SOAR platforms integrate security tools and automate repetitive tasks using playbooks.

Benefits include:

* Faster investigations
* Reduced manual effort
* Consistent response procedures
* Centralized workflow management

Within LetsDefend, the Case Management system functions similarly to a SOAR platform by automatically assigning investigation playbooks when incidents are created.

#### Question

**What can be used to conduct an analysis with SOAR?**

**Answer:** `Playbook`

---

### Module 6: Threat Intelligence Feed

This module focused on using Threat Intelligence feeds to enrich investigations.

I learned how analysts leverage external intelligence sources to validate:

* File hashes
* Domains
* URLs
* IP addresses

Threat Intelligence helps determine whether an IOC has been previously associated with malicious activity.

Sources explored included:

* VirusTotal
* Talos Intelligence
* LetsDefend Threat Intelligence

A key takeaway was that a clean VirusTotal result does not automatically mean a file is safe. Additional static and dynamic analysis may still be required.

#### Question

**What is the data source of the hash e1def6e8ab4b5bcb650037df234e2973?**

**Answer:** `AbuseCH`

---

### Module 7: Common Mistakes by SOC Analysts

The final module highlighted several common mistakes that can negatively impact investigations.

| Mistake                       | Lesson Learned                                           |
| ----------------------------- | -------------------------------------------------------- |
| Over-relying on VirusTotal    | Always validate findings using multiple sources.         |
| Short sandbox execution times | Malware may delay execution to evade detection.          |
| Incomplete log analysis       | Additional infected systems may be overlooked.           |
| Ignoring scan dates           | Outdated intelligence can lead to incorrect conclusions. |

This module reinforced the importance of thorough validation and comprehensive investigation techniques.

---

## Flags / Answers

| Module              | Question                                  | Answer                                                               |
| ------------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| Introduction to SOC | Internal and external employees SOC model | `Co-Managed SOC`                                                     |
| SIEM                | Closed alert channel                      | `Closed Alerts`                                                      |
| Log Management      | Source IP for GitHub URL                  | `172.16.17.54`                                                       |
| Log Management      | Log type lookup                           | `DNS`                                                                |
| EDR                 | Hostname running nmap hash                | `EricProd`                                                           |
| EDR                 | Complete CMD command                      | `C:/Windows/System32/mshta.exe C:/Users/roberto/Desktop/Ps1.hta`     |
| SOAR                | Tool used to conduct analysis             | `Playbook`                                                           |
| Threat Intelligence | Hash data source                          | `AbuseCH`                                                            |

---

## Key Takeaways

Completing this learning path helped me understand how modern SOC environments operate and how analysts use different tools together during investigations.

Some of the most important lessons I learned include:

1. A SOC analyst serves as the first line of defense against cyber threats.
2. Effective investigations require correlating data from multiple security platforms.
3. False positives are valuable opportunities to improve detection rules.
4. Containment is only one step in the incident response process.
5. Playbooks help ensure consistent investigations across teams.
6. Threat intelligence should support investigations, not replace analyst judgment.

Overall, this path provided a solid introduction to Blue Team operations and strengthened my understanding of SOC workflows and security monitoring practices.

---

*Writeup by Alisha-Chaudhary*
