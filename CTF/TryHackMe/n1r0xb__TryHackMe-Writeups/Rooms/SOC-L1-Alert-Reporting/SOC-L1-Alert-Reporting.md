# <div align="center">[`SOC L1 Alert Reporting`](https://tryhackme.com/room/socl1alertreporting)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/f3b67b19-db31-4023-84ef-f6afa80eeb7b" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`EDR`      |Endpoint detection and response (EDR) is a series of tools that monitor devices for activity that could indicate a threat.|
|`SIEM`     |Security Information and Event Management system that is used to aggregate security information in the form of logs, alerts, artifacts and events into a centralized platform that would allow security analysts to perform near real-time analysis during security monitoring.|

---
## `Alert Funnel`

* **Alert Reporting**
* **Alert Escalation**
* **Communication**

---

<b>*Q1: What is the process of passing suspicious alerts to an L2 analyst for review?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Alert Escalation</code>
</details>

<b>*Q2: What is the process of formally describing alert details and findings?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Alert Reporting</code>
</details>

---
## `Reporting Guide`

**Having L1 analysts write alert reports serves several key purposes:**

|**Alert Report Purpose**|**Explanation**|
|:----------------------:|:--------------|
|Provide context for escalation|<ul><li>A well-written report saves lots of time for L2 analysts</li><li>Also, it helps them quickly understand what happened</li></ul>|
|Save findings for the records |<ul><li>Raw SIEM logs are stored for 3-12 months, but alerts are kept indefinitely</li><li>As a result, it's better to keep all the context inside the alert, just in case</li></ul>|
|Improve investigation skills  |<ul><li>If you can't explain it simply, you don't understand it well enough</li><li>Report writing is a great way to boost L1 skills by summarising alerts</li></ul>|

---

**Report Format:**
* `Who:` Which user logs in, runs the command, or downloads the file
* `What:` What exact action or event sequence was performed
* `When:` When exactly did the suspicious activity start and end
* `Where:` Which device, IP, or website was involved in the alerts
* `Why:` **The most important W**, the reasoning for your final verdict

---

<b>*Q1: According to the SOC dashboard, which user email leaked the sensitive document?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>m.boslan@tryhackme.thm</code>
</details>

<b>*Q2: Looking at the new alerts, who is the "sender" of the suspicious, likely phishing email?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>support@microsoft.com</code>
</details>

<b>*Q3: Open the phishing alert, read its details, and try to understand the activity.
Using the Five Ws template, what flag did you receive after writing a good report?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{nice_attempt_faking_microsoft_support}</code>
</details>

---
## `Escalation Guide`

**You should excalate an alert if:**
1. The alert is an indicator of a major cyberattack requiring deeper investigation or DFIR
2. Remediation actions like malware removal, host isolation, or password reset are required
3. Communication with customers, partners, management, or law enforcement agencies is required
4. You just do not fully understand the alert and need some help from more senior analysts

---

<b>*Q1: Who is your current L2 in the SOC dashboard that you can assign (escalate) the alerts to?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>E.Fleming</code>
</details>

<b>*Q2: What flag did you receive after correctly escalating the alert from the previous task to L2?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{good_job_escalating_your_first_alert}</code>
</details>

<b>*Q3: Now, investigate the second new alert in the queue and provide a detailed alert comment.
Then, decide if you need to escalate this alert and move on according to the process.
After you finish your triage, you should receive a flag, which is your answer!*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{looks_like_webshell_via_old_exchange}</code>
</details>

---
## `SOC Communicataion`

**Communication Cases:**
* **You need to escalate an urgent, critical alert, but L2 is unavailable and does not respond for 30 minutes.**

    _Ensure you know where to find emergency contacts. First, try to call L2, then L3, and finally your manager._

* **The alert about Slack/Teams account compromise requires you to validate the login with the affected user.**

    _Do not contact the user through the breached chat: use alternative contact methods like a phone call._

* **You receive an overwhelming number of alerts during a short period of time, some of which are critical.**

    _Prioritise the alerts according to the workflow, but inform your L2 on shift about the situation._

* **After a few days, you realise that you misclassified the alert and likely missed a malicious action.**

    _Immediately reach out to your L2 explaining your concerns. Threat actors can be silent for weeks before impact._

* **You can not complete the alert triage since the SIEM logs are not parsed correctly or are not searchable.**

    _Do not skip the alert: investigate what you can and report the issue to your L2 on shift or SOC engineer._

---

<b>*Q1: Should you first try to contact your manager in case of a critical threat (Yea/Nay)?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Nay</code>
</details>

<b>*Q2: Should you immediately contact your L2 if you think you missed the attack (Yea/Nay)?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Yea</code>
</details>
