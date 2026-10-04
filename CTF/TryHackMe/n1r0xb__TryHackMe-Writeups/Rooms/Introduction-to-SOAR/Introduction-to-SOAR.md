# <div align="center">[`Introduction to SOAR`](https://tryhackme.com/room/soar)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/760c44d6-a287-4574-94c4-34b5155da486" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`CVE`      |Common Vulnerabilities and Exposures (CVE), this term is given to a publicly disclosed vulnerability|
|`EDR`      |Endpoint detection and response (EDR) is a series of tools that monitor devices for activity that could indicate a threat.|
|`Firewall` |A security tool, hardware or software that is used to filter network traffic by stopping unauthorized incoming and outgoing traffic.|
|`IAM`      |Identity and Access Management (IAM) is a framework/process for controlling and securing digital identities and user access in organisations.|
|`Phishing` |When emails are sent to a target(s) purporting to be from a trusted entity to lure individuals into providing sensitive information.|
|`SIEM`     |Security Information and Event Management system that is used to aggregate security information in the form of logs, alerts, artifacts and events into a centralized platform that would allow security analysts to perform near real-time analysis during security monitoring.|
|`SOAR`     |SOAR stands for Security Orchestration, Automation, and Response. It is a solution that helps organisations to streamline and automate their security operations, including incident management, threat intelligence, and vulnerability response.|
|`SOC`      |Security Operations Center (SOC) is a team of IT security professionals tasked with monitoring, preventing , detecting , investigating, and responding to threats within a company’s network and systems.|

---
## `Traditional SOC and Challenges`

**How Traditional SOCs Work**
* **Monitoring and Detection:**  This focuses on continuously scanning and flagging suspicious activities within a network environment. It leads to awareness of emerging threats and how to prevent them in their early stages.
* **Recovery and Remediation:** Organisations rely on their SOC to provide a hub for recovery and remediation when incidents occur. SOC teams operate as first responders when cyber threats are identified.
* **Threat Intelligence:** Monitoring environments continuously requires a constant flow of threat intelligence. This ensures that SOC teams have continuous and the latest feeds of threat data, such as IP addresses, hashes, domains, and other indicators.
* **Communication:** The SOC teams not only detect and respond to threats but also coordinate with IT teams and management to effectively communicate the threats and ensure that the incidents are addressed.

---

**Challenges Faced by SOCs**
* **Alert Fatigue:** Using numerous security tools triggers a large number of alerts within an SOC. Many of these alerts are false positives or insufficient for an investigation, leaving analysts overwhelmed and unable to address any serious security events.
* **Too Many Disconnected Tools:** Security tools are often deployed without integration within an organisation.
* **Manual Processes:** SOC investigation procedures are often not documented, leading to inefficient means of addressing threats.
* **Talent Shortage:** SOC teams find recruiting and expanding their talent pool difficult to address the growing security landscape and sophisticated threats.

---

<b>*Q1: How would you describe the experience of an overload of security events being triggered within a SOC?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Alert Fatigue</code>
</details>

---
## `Overcoming SOC Challenges with SOAR`

**What is SOAR?**

Security Orchestration, Automation, and Response (SOAR) is a tool that unifies all the security tools used in a SOC. With SOAR, SOC analysts do not need to switch between SIEM, EDR, Firewall, and other security tools for their investigations. They can operate all these tools within a single SOAR interface.

---

<b>*Q1: The act of connecting and integrating security tools and systems into seamless workflows is known as?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Orchestration</code>
</details>

<b>*Q2: What do we call a predefined list of actions to handle an incident?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Playbook</code>
</details>

---
## `Building SOAR Playbooks`

<b>*Q1: Is manual analysis vital within a SOAR workflow? Yay or Nay?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Yay</code>
</details>

<b>*Q2: From where is the CVE Patching playbook fetching the new CVEs?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Advisory Lists</code>
</details>

<b>*Q3: In the CVE Patching playbook, if the assets are found vulnerable even after the patch is deployed, what does the SOC develop next?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Mitigation Plan</code>
</details>

---
## `Threat Intel Workflow Practical`

`Case Ticket`
* **Automated Work Flows:** Create Case Ticket, Communicate Case Ticket, Assign Case Ticket, Update Case Ticket
* **Manual Work Flows:** Delete Case Ticket

`Threat Intel`
* **Automated Work Flows:** Fetch New Incident Alerts, Failed Fetch Notifications, Set Fetch Intervals
* **Manual Work Flows:** Discard Old Alerts

`Data Extraction`
* **Automated Work Flows:** Extract Domains, Extract IPs, Extract URLs
* **Manual Work Flows:** Analyst Extraction

`Reputation Checks`
* **Automated Work Flows:** Reputation Results Output
* **Manual Work Flows:** Analyst Validation, Sandbox Testing

`Course of Action`
* **Automated Work Flows:** Block Domains, Block URLs, Bock IPs, Update Case Tickets
* **Manual Work Flows:** Analyst Approve COA

---

<b>*Q1: What is the flag received?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{AUT0M@T1N6_S3CUR1T¥}</code>
</details>
