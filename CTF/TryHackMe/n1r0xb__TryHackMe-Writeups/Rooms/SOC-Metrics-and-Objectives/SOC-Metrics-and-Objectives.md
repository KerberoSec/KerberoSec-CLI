# <div align="center">[`SOC Metrics and Objectives`](https://tryhackme.com/room/socmetricsobjectives)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/2f34c6ba-b85e-4e05-8ac4-646c25a51ba8" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`EDR`      |Endpoint detection and response (EDR) is a series of tools that monitor devices for activity that could indicate a threat.|
|`MTTA`     |Mean Time to Acknowledge (MTTA) is the average time between the initial alert and the service provider (e.g. SOC L1 analysts) taking action.|
|`MTTD`     |Mean Time to Detect (MTTD) is the average time it takes for an organization to identify a security threat, incident, or a technical problem.|
|`MTTR`     |Mean Time to Response (MTTR) is the average time between the initial alert and response to it (e.g. malware removal, password reset, or system restore).|
|`SLA`      |Service Level Agreement (SLA) is a document signed between a service provider (e.g. SOC team) and its customer defining the uptime and quality requirements.|
|`SOAR`     |SOAR stands for Security Orchestration, Automation, and Response. It is a solution that helps organisations to streamline and automate their security operations, including incident management, threat intelligence, and vulnerability response.|
|`SOC`      |Security Operations Center (SOC) is a team of IT security professionals tasked with monitoring, preventing , detecting , investigating, and responding to threats within a company’s network and systems.|

---
## `Core Metrics`

|**Metric**|**Formula**|**Measures**|
|:---------|:----------|:-----------|
|Alert Count          |`AC = Total Count of Alerts Received`   |Overall load of SOC analysts|
|False Positive Rate  |`FPR = False Positives / Total Alerts`  |Level of noise in the alerts|
|Alert Escalation Rate|`AER = Escalated Alerts / Total Alerts` |Experience of L1 analysts   |
|Threat Detection Rate|`TDR = Detected Threats / Total Threats`|Reliability of the SOC team |

---

**Alerts Count:** 5 to 30 alerts per day per L1 analyst is a good metric.

**False Positive Rate:** 0% is an unachievable ideal, but 80% or higher is a serious problem.

**Alert Escalation Rate:** Aimed to be below 50%, or even better: below 20%.

**Threat Detection Rate:** Should always be at 100%.

---

<b>*Q1: Is zero alerts for one month a good sign for your SOC team? (Yea/Nay)*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Nay</code>
</details>

<b>*Q2: What is the False Positive Rate if only 10 out of 50 alerts appear to be real threats?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>80%</code>
</details>

---
## `Triage Metrics`

**Example Metrics**

<img width="911" height="287" alt="Triage-Metrics(SMaO)-THM" src="https://github.com/user-attachments/assets/c8ff887e-0bed-48af-9393-5d2ae33ef232" />

---

<b>*Q1: Imagine a scenario where the SOC team receives a critical alert on Saturday.
If the team works 8/5, on which day of the week will they acknowledge the alert?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Monday</code>
</details>

<b>*Q2: Imagine a scenario where an employee was lured into running data stealer malware.*</b>

  <b>*1. The SOC team received the "Connection to Redline Stealer C2" alert after 12 minutes.*</b>
  
  <b>*2. One of the L1 analysts on shift moved the alert to In Progress 10 minutes later.*</b>
  
  <b>*3. After 6 minutes, the alert was escalated to L2, who spent 35 minutes cleaning the malware.*</b>
  
  <b>*Provide the MTTD, MTTA, and MTTR via comma as your answer (e.g. 10,20,30).*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>12,10,51</code>
</details>

---
## `Improving Metrics`

|**Issue**|**Recommendations**|
|:-------:|:------------------|
|`False Positive Rate over 80%`         |**Your team receives too much noise in the alerts. Try to:** <ul><li>Exclude trusted activities like system updates from your EDR or SIEM detection rules</li><li>Consider automating alert triage for most common alerts using SOAR or custom scripts</li></ul>|
|`Mean Time to Detect over 30 mins`     |**Your team detects a threat with a high delay. Try to:** <ul><li>Contact SOC engineers to make the detection rules run faster or with a higher rate</li><li>Check if SIEM logs are collected in real-time, without a 10-minute delay</li></ul>|
|`Mean Time to Acknowledge over 30 mins`|**L1 analysts start alert triage with a high delay. Try to:** <ul><li>Ensure the analysts are notified in real-time when a new alert appears</li><li>Try to evenly distribute alerts in the queue between the analysts on shift</li></ul>|
|`Mean Time to Respond over 4 hours`    |**SOC team can't stop the breach in time. Try to:** <ul><li>As L1, make everything possible to quickly escalate the threats to L2</li><li>Ensure your team has documented what to do during different attack scenarios</li></ul>|

---

<b>*Q1: What is the highest acceptable False Positive Rate for SOC teams?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>80%</code>
</details>

<b>*Q2: Should all SOC roles work together to keep metrics improving? (Yea/Nay)*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Yea</code>
</details>

---
## `Practice Scenarios`

<b>*Q1: What flag did you get after completing the first scenario?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{mttr:quick_start_but_slow_response}</code>
</details>

<b>*Q2: What flag did you get after completing the second scenario?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{mttd:time_between_attack_and_alert}</code>
</details>

<b>*Q3: What flag did you get after completing the third scenario?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{fpr:the_main_cause_of_l1_burnout}</code>
</details>
