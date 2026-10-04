# <div align="center">[`MITRE`](https://tryhackme.com/room/mitre)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/25f8b7a2-2444-456e-8516-5af33963dc03" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`EDR`      |Endpoint detection and response (EDR) is a series of tools that monitor devices for activity that could indicate a threat.|
|`MITRE`    |MITRE Adversarial Tactics, Techniques, and Common Knowledge (ATT&CK)|
|`SIEM`     |Security Information and Event Management system that is used to aggregate security information in the form of logs, alerts, artifacts and events into a centralized platform that would allow security analysts to perform near real-time analysis during security monitoring.|
---
## `ATT&CK® Framework`

The MITRE ATT&CK® framework is “a globally-accessible knowledge base of adversary tactics and techniques based on real-world observations.

---

<b>*Q1: What Tactic does the Hide Artifacts technique belong to in the ATT&CK Matrix?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Defense Evasion</code>
</details>

<b>*Q2: Which ID is associated with the Create Account technique?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>T1136</code>
</details>

---
## `ATT&CK in Operation`

|**Who**|**Their Goal**|**How They Use ATT&CK**|
|:---------:|:--------:|:---------------------:|
|`Cyber Threat Intelligence (CTI) Teams`|Collect and analyze threat information to improve an organization's security posture.|Map observed threat actor behavior to ATT&CK TTPs to create profiles that are actionable across the industry.|
|`SOC Analysts`                         |Investigate and triage security alerts.|Link activity to tactics and techniques to provide detailed context for alerts and prioritize incidents.|
|`Detection Engineers`                  |Design and improve detection systems.|Map SIEM/EDR and other rules to ATT&CK to ensure better detection efforts.|
|`Incident Responders`                  |Respond to and investigate security incidents.|Map incident timelines to MITRE tactics and techniques to better visualize the attack.|
|`Red & Purple Teams`                   |Emulate adversary behavior to test and improve defenses.|Build emulation plans and exercises aligned with techniques and known group operations.|

---

<b>*Q1: In which country is Mustang Panda based?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>China</code>
</details>

<b>*Q2: Which ATT&CK technique ID maps to Mustang Panda’s Reconnaissance tactics?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>T1598</code>
</details>

<b>*Q3: Which software is Mustang Panda known to use for Access Token Manipulation?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Cobalt Strike</code>
</details>

---
## `ATT&CK for Threat Intelligence`

---

<b>*Q1: Which APT group has targeted the aviation sector and has been active since at least 2013?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>APT33</code>
</details>

<b>*Q2: Which ATT&CK sub-technique used by this group is a key area of concern for companies using Office 365?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Cloud Accounts</code>
</details>

<b>*Q3: According to ATT&CK, what tool is linked to the APT group and the sub-technique you identified?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Ruler</code>
</details>

<b>*Q4: Which mitigation strategy advises removing inactive or unused accounts to reduce exposure to this sub-technique?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>User Account Management</code>
</details>

<b>*Q5: What Detection Strategy ID would you implement to detect abused or compromised cloud accounts?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>DET0546</code>
</details>

---
## `Cyber Analytics Repository (CAR)`

MITRE defines the Cyber Analytics Repository (CAR) as “a knowledge base of analytics developed by MITRE based on the MITRE ATT&CK adversary model.

---

<b>*Q1: Which ATT&CK Tactic is associated with CAR-2019-07-001?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Defense Evasion</code>
</details>

<b>*Q2: What is the Analytic Type for Access Permission Modification?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Situational Awareness</code>
</details>

---
## `MITRE D3FEND Framework`

D3FEND (Detection, Denial, and Disruption Framework Empowering Network Defense) is a structured framework that maps out defensive techniques and establishes a common language for describing how security controls work.

---

<b>*Q1: Which sub-technique of User Behavior Analysis would you use to analyze the geolocation data of user logon attempts?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>User Geolocation Logon Pattern Analysis</code>
</details>

<b>*Q2: Which digital artifact does this sub-technique rely on analyzing?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Network Traffic</code>
</details>

---
## `Other MITRE Projects`

---

<b>*Q1: What technique ID is associated with Scrape Blockchain Data in the AADAPT framework?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>ADT3025</code>
</details>

<b>*Q2: Which tactic does LLM Prompt Obfuscation belong to in the ATLAS framework?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Defense Evasion</code>
</details>
