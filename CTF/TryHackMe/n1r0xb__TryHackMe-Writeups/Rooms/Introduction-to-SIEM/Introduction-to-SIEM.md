# <div align="center">[`Introduction to SIEM`](https://tryhackme.com/room/introtosiem)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/7be893ac-4675-4167-8c05-08cbe0bcad7b" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`ELK`       |ELK stands for Elasticsearch, Logstash, and Kibana. These are three open-source tools that are commonly used together to collect, store, analyse, and visualise data.|
|`FTP`       |File Transfer Protocol (FTP) is a protocol designed to help the efficient transfer of files between different and even non-compatible systems. It supports two modes for file transfer: binary and ASCII (text).|
|`IDS`       |Intrusion Detection System (IDS) is a system that detects unauthorised network and system intrusions. Examples include detecting unauthorised devices connected to the local network and unauthorised users accessing a system or modifying a file.|
|`IPS`       |Intrusion Prevention System (IPS) is a device or application that detects and stops intrusions attempts proactively. They are usually deployed in front of the protected asset and block any potential threat from reaching their target.|
|`PowerShell`|PowerShell is a task automation and configuration management program from Microsoft, consisting of a command-line shell and the associated scripting language.|
|`RDP`       |Remote Desktop Protocol is a protocol used to establish remote graphical sessions over the network.|
|`SSH`       |Secure Shell (SSH) refers to a cryptographic network protocol used in secure communication between devices. SSH encrypts data using cryptographic algorithms, such as Advanced Encryption System (AES) and is often used when logging in remotely to a computer or server.|
|`SIEM`      |Security Information and Event Management system that is used to aggregate security information in the form of logs, alerts, artifacts and events into a centralized platform that would allow security analysts to perform near real-time analysis during security monitoring.|
|`Splunk`    |Splunk is a platform for collecting, storing, and analysing machine data. It provides various tools for analysing data, including search, correlation, and visualisation. It is a powerful tool that organisations of all sizes can use to improve their IT operations and security posture.|
|`SOC`       |Security Operations Center (SOC) is a team of IT security professionals tasked with monitoring, preventing , detecting , investigating, and responding to threats within a company’s network and systems.|
|`VPN`       |A Virtual Private Network is a way to create a secure "tunnel" between two networks. For example, you use a VPN on TryHackMe to access the private network on which the machines operate. VPNs are also commonly used for an employee to log into their workplace when they are not on site (such as working from home or travelling for business matters). VPNs are also used where networks (such as coffee shops) do not provide encryption, and are a great way of preventing others from reading your network traffic.|

---
## `Introduction`

<b>*Q1: What does SIEM stand for?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Security Information and Event Management System</code>
</details>

---
## `Logs Everywhere, Answers Nowhere`

<img width="614" height="458" alt="Logs-Everywhere-Answers-Nowhere(ItSIEM)-THM" src="https://github.com/user-attachments/assets/30031169-a706-4316-981c-7a376ac1a4bf" />

**Host-Centric Log Sources:** These log sources capture events that occurred within or related to the host.

**Network-Centric Log Sources:** Network-related logs are generated when the hosts communicate with each other or access the internet to visit a website.

Until now, it seems pretty straightforward that these log sources generate logs, we analyze them, and identify malicious activities. However, it's not that simple. It has some challenges, including:
* **Numerous Log Sources**
* **No Centralization**
* **Limited Context**
* **Limited Analysis**
* **Format Issues**

---

<b>*Q1: Is Registry-related activity host-centric or network-centric?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Host-Centric</code>
</details>

<b>*Q2: Is VPN-related activity host-centric or network-centric?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Network-Centric</code>
</details>

---
## `Why SIEM?`

<img width="597" height="515" alt="Why-SIEM(ItSIEM)-THM" src="https://github.com/user-attachments/assets/f3e84be6-f043-4c88-8a86-c8f92bfb17db" />

**Features of SIEM**
* `Centralized Log Collection`
* `Normalization of Logs`
* `Correlation of Logs`
* `Real-Time Alerting`
* `Dashboards and Reporting`

---
## `Log Sources and Ingestion`

**Windows Machine:** Windows records every event that can be viewed through the Event Viewer. It assigns a unique ID to each type of log activity, making it easy for the analyst to examine and keep track of.

**Linux Machine:** Linux OS stores all the related logs, such as events, errors, warnings, etc. These are then ingested into SIEM for continuous monitoring. Some of the common locations where Linux stores logs are:
* /var/log/httpd: Contains HTTP Request  / Response and error logs.
* /var/log/cron: Events related to cron jobs are stored in this location.
* /var/log/auth.log and /var/log/secure: Stores authentication-related logs.
* /var/log/kern: This file stores kernel-related events.

**Web Server:** It is important to monitor all requests/responses coming in and out of the web server for any potential web attack attempt. In Linux, common locations to write all apache-related logs are /var/log/apache or /var/log/httpd.

**Log Ingestion:** All these logs provide a wealth of information and can help identify security issues. Each SIEM solution has its own way of ingesting the logs. Some common methods used by these SIEM solutions are:
* `Agent/Forwarder`
* `Syslog`
* `Manual Upload`
* `Port-Forwarding`

---

<b>*Q1: In which location within a Linux environment are HTTP logs stored?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>/var/log/httpd</code>
</details>

---
## `Alerting Process and Analysis`

SIEM solution has detection rules that catch threats. These rules play an important role in the timely detection of threats, allowing analysts to take action on time.

---

<b>*Q1: Which Event ID is generated when event logs are removed?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>104</code>
</details>

<b>*Q2: What type of alert may require tuning?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>False Positive</code>
</details>

---
## `Lab Work`

<b>*Q1: After clicking on the Start Suspicious Activity button, which process caused the alert?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>cudominer.exe</code>
</details>

<b>*Q2: Find the event that caused the alert and identify the user responsible for the process execution.*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Chris</code>
</details>

<b>*Q3: What is the hostname of the suspect user?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>HR_02</code>
</details>

<b>*Q4: Examine the rule and the suspicious process; which term matched the rule that caused the alert??*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Miner</code>
</details>

<b>*Q5: Which option best represents the event? Choose from the following:*</b>

* **_False Positive_**

* **_True Positive_**

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>True Positive</code>
</details>

<b>*Q6: Selecting the right ACTION will display the FLAG. What is the FLAG?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{000_SIEM_INTRO}</code>
</details>
