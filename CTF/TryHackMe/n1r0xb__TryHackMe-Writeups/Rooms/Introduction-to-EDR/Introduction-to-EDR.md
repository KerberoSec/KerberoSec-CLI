# <div align="center">[`Introduction to EDR`](https://tryhackme.com/room/introductiontoedrs)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/1ea03bcc-db36-4581-9ab4-eb409a5dc18e" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`AV`        |Antivirus software is a program or set of programs that are designed to prevent, search for, detect, and remove software viruses, and other malicious software like worms, trojans, adware, and more.|
|`C2`        |Command and Control (C2) Infrastructure are a set of programs used to communicate with a victim machine. This is comparable to a reverse shell, but is generally more advanced and often communicate via common network protocols, like HTTP, HTTPS and DNS.|
|`EDR`       |Endpoint detection and response (EDR) is a series of tools that monitor devices for activity that could indicate a threat.|
|`IOC`       |Indicator of Compromise is a forensic artifact observed on a network or in an operating system that, with high confidence, indicates a computer intrusion.|
|`MITRE`     |MITRE Adversarial Tactics, Techniques, and Common Knowledge (ATT&CK).|
|`PowerShell`|PowerShell is a task automation and configuration management program from Microsoft, consisting of a command-line shell and the associated scripting language.|
|`SIEM`      |Security Information and Event Management system that is used to aggregate security information in the form of logs, alerts, artifacts and events into a centralized platform that would allow security analysts to perform near real-time analysis during security monitoring.|
|`SOC`       |Security Operations Center (SOC) is a team of IT security professionals tasked with monitoring, preventing , detecting , investigating, and responding to threats within a company’s network and systems.|

---
## `What is an EDR?`

**Below are some of the EDR solutions in the market:**
* _CrowdStrike Falcon_
* _SentinelOne ActiveEDR_
* _Microsoft Defender for Endpoint_
* _OpenEDR_
* _Symantec EDR_

---
## `Features of EDR`

<img width="468" height="243" alt="Features-of-EDR(ItEDR)-THM" src="https://github.com/user-attachments/assets/851f1ccd-b373-4888-93ba-3b16eb8bd5e2" />

**Visibility:** It collects detailed data from the endpoints, which includes process modifications, registry modifications, file and folder modifications, user actions, and much more.

**Detection:** It incorporates signature-based detections as well as behavior-based detections, such as unexpected user activities.

**Response:** EDR also empowers analysts to take action on detected threats. These actions can be taken at any endpoint within the central EDR console.

**IMPORTANT NOTE:** An EDR is a host-only security solution and does not detect network-level threats.

---

<b>*Q1: Which feature of EDR provides a complete context for all the detections?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Visibility</code>
</details>

<b>*Q2: Which process spawned sc.exe?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>cmd.exe</code>
</details>

---
## `Beyond the Antivirus`

* The Antivirus (AV) may detect some basic threats, but to detect advanced threats that evade normal detections, we need an EDR. Unlike antivirus software's basic signature-based detection, it monitors and records the behaviors of the endpoint.
* An EDR also provides organization-wide visibility of any activity. For example, if a suspicious file is detected on one endpoint, the EDR will also check it across all the other endpoints.

|**Attack Steps**|**AV's Response**|**EDR's Response**|
|:--------------:|-----------------|------------------|
|Step #1|Does nothing if the downloaded file has no previous signature in the database|Logs the file download activity and monitors it|
|Step #2|Does nothing upon the opening of the document since winword.exe is a legitimate utility|Records the execution of winword.exe and keeps monitoring|
|Step #3|Does nothing if the executed macro has no previous signature|Detects and flags the macro execution due to the unusual parent-child relationship of winword.exe and PowerShell.exe processes|
|Step #4|Typically, AVs will not detect obfuscated PowerShell scripts|Flags the obfuscated script execution|
|Step #5|Will not flag malicious injection into svchost.exe since it does not monitor the memory injections|Detects Process Injection in svchost.exe|
|Step #6|Lacks Network Level Visibility|Flags the unexpected behaviour of svchost.exe, making an outbound connection|
|Final Action|May be marked as clean|Generates an alert with the full attack chain and enables the analyst to take actions from within the EDR|

---

<b>*Q1: In the given analogy, what presents an AV?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Immigration Check</code>
</details>

<b>*Q2: Which legitimate process was hijacked by the attacker in the scenario?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>svchost.exe</code>
</details>

<b>*Q3: Which security solution might mark this activity as clean?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Antivirus</code>
</details>

---
## `How an EDR works?`

**Agents:** We can integrate multiple endpoints with our EDR and manage them through a centralized console. The EDR agents can do some basic signature-based and behavior-based detections by themselves and send them to the EDR console, which triggers alerts.

**EDR Console:** All the detailed data sent by the EDR agents is correlated and analyzed through complex logic and machine learning algorithms.

**What Happens After Detections?** When a detection comes, it's a SOC analyst's responsibility to acknowledge the alert and prioritize it. The prioritization is made easy by the EDR itself. It gives severities to all the alerts (Critical, High, Medium, Low, Informational).

**EDR with Other Tools:** As a SOC Analyst, it is essential to understand that although a standalone EDR provides enough information to detect and respond to threats in an endpoint, it works alongside other security solutions to form a larger security ecosystem.

---

<b>*Q1: Which component of the EDR is responsible for collecting telemetry from the endpoints?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Agent</code>
</details>

<b>*Q2: An EDR agent is also known as a?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Sensor</code>
</details>

---
## `EDR Telemetry`

As already mentioned, EDR agents collect different data from their endpoints and push it to the EDR console. This data is known as **Telemetry**.

**Some Types of Telemetry Collected:**
* **Process Executions and Terminations:**
  It keeps track of all the running and idle processes, which helps to identify suspicious child-parent process relationships, suspicious executables initiating a process, malware payload, etc.
  
* **Network Connections:**
  All the endpoints' network connections are monitored, which helps identify any connection to a C2 server, unusual port usage, data exfiltration, or lateral movement within the network.
  
* **Command Line Activity:**
  It captures all the commands executed on the endpoints in CMD, PowerShell, etc., which helps to identify malicious command execution, obfuscated PowerShell script executions, which are often missed by a traditional antivirus.
  
* **Files and Folders Modifications:**
  Threat actors modify different files and folders during data staging, ransomware executions, and malicious file dropping. The EDR tracks this.
  
* **Registry Modifications:**
  The registry is a goldmine of information about the configurations in a Windows system. There are many registry modifications that occur during a malicious activity, and most of these are monitored by the EDR.

---

<b>*Q1: Which telemetry data helps in detecting C2 communications?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Network Connections</code>
</details>

<b>*Q2: Where are the configuration settings of a Windows system primarily stored?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Registry</code>
</details>

---
## `Detection and Response Capabilities`

**Detection:**
* `Behavioral Detection`
* `Anomaly Detection`
* `IOC Matching`
* `MITRE ATT&CK Mapping`
* `Machine Learning Algorithms`

**Response:**
* `Isolate Host`
* `Terminate Process`
* `Quarantine`
* `Remote Access`
* `Artefacts Collection`

---

<b>*Q1: Which feature of the EDR helps you identify threats based on known malicious behaviours?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>IOC Matching</code>
</details>

---
## `Investigate an alert on EDR`

<b>*Q1: Which tool was launched by CMD.exe to download the payload on DESKTOP-HR01?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>CURL.exe</code>
</details>

<b>*Q2: What is the absolute path to the downloaded malware on the DESKTOP-HR01 machine?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>C:\Users\Public\install.exe</code>
</details>

<b>*Q3: What is the absolute path to the suspicious syncsvc.exe on the WIN-ENG-LAPTOP03 machine*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>C:\Users\haris.khan\AppData\Local\Temp\syncsvc.exe</code>
</details>

<b>*Q4: On which URL was the exfiltration attempt being made on WIN-ENG-LAPTOP03?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>https://files-wetransfer.com/upload/session/ab12cd34ef56/dump_2025.dmp</code>
</details>

<b>*Q5: What was UpdateAgent.exe labelled by Threat Intel on DESKTOP-DEV01*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Known internal IT utility tool</code>
</details>
