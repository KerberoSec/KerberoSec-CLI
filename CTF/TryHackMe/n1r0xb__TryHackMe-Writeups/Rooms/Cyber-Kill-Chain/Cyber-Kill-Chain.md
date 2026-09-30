# <div align="center">[`Cyber Kill Chain`](https://tryhackme.com/room/cyberkillchainzmt)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/2e5d711f-3fbf-405c-bcc9-96fe1b5701ab" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`APT`                |An advanced persistent threat (APT) is a stealthy threat actor, typically a nation state or state-sponsored group, which gains unauthorized access to a computer network and remains undetected for an extended period.|
|`Exploits`           |Programs or code that take advantage of the vulnerability or flaw in the application or system.|
|`Malware`            |Program or software that is designed to damage, disrupt, or gain unauthorized access to a computer.|
|`OSINT`              |Open source intelligence (OSINT) is the act of gathering and analyzing publicly available data for intelligence purposes.|
|`Payload`            |Malicious code that the attacker runs on the system.|
|`Phishing`           |When emails are sent to a target(s) purporting to be from a trusted entity to lure individuals into providing sensitive information.|
|`SOC`                |Security Operations Center (SOC) is a team of IT security professionals tasked with monitoring, preventing , detecting , investigating, and responding to threats within a company’s network and systems.|
|`Social Engineering` |The manipulation of individuals to divulge sensitive information, through various forms of communication.|

---
## `Introduction`

Lockheed Martin, a global security and aerospace company, that established the Cyber Kill Chain® framework for the cybersecurity industry in 2011 based on the military concept. The framework defines the steps used by adversaries or malicious actors in cyberspace.

The Cyber Kill Chain will help you understand and protect against ransomware attacks and security breaches, as well as Advanced Persistent Threats (APTs).

---
## `Reconnaissance`

**Reconnaissance** is the research and planning phase of an attack against a system or victim. Adversaries use this phase to gather information about their target to inform their next steps.

**OSINT:** Open-Source Intelligence

**Reconnaissance Types:**
* **Passive Recon:** This involves having no direct interaction with the target. This may include WHOIS lookups, social media scraping, or reviewing breach data.
* **Active Recon:** This involves direct contact with the target with activities such as social engineering, port scanning, banner grabbing, or probing for open services.

**Email harvesting** is the process of obtaining email addresses from public, paid, or free services.
* **[`theHarvester`](https://github.com/laramies/theHarvester)**
* **[`Hunter.io`](https://hunter.io/)**
* **[`OSINT Frameworks`](https://osintframework.com/)**

---

<b>*Q1: What is the name of the Intel Gathering Tool that is a web-based interface to the common tools and resources for open-source intelligence?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>OSINT Framework</code>
</details>

<b>*Q2: What is the definition for the email gathering process during the stage of reconnaissance?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Email Harvesting</code>
</details>

---
## `Weaponization`

 Turning the raw information into actionable attack tools through crafting **malware** and **exploits** into a **payload**.

 ---

<b>*Q1: What is the term for automated scripts embedded in Microsoft Office documents that can be used to perform tasks or exploited by attackers for malicious purposes?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Macro</code>
</details>

---
## `Delivery`

Choosing the method for transmitting the payload or the malware onto the target environment.

 ---

<b>*Q1: What do you call an attack targeting a specific group by infecting their frequently visited website?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Watering Hole Attack</code>
</details>

---
## `Exploitation`

**Exploitation** is the moment the attacker's code executes on the target, taking advantage of a known vulnerability.

---

<b>*Q1: What is the term for a cyber attack that exploits a software vulnerability that is unknown by software vendors?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Zero-Day</code>
</details>

---
## `Installation`

A **persistent backdoor** will let the attacker access the system he compromised in the past.

---

---

<b>*Q1: What technique is used to modify file time attributes to hide new or changes to existing files?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Timestomping</code>
</details>

<b>*Q2: What malicious script can be planted by an attacker on the web server to maintain access to the compromised system and enables the web server to be accessed remotely?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Web Shell</code>
</details>

---
## `Command & Control`

The compromised endpoint would communicate with an external server set up by an attacker to establish a command & control channel.

---

<b>*Q1: What is the C2 communication where the victim makes regular DNS requests to a DNS server and domain which belong to an attacker.*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>DNS Tunneling</code>
</details>

---
## `Actions on Objectives (Exfiltration)`

Taking action on the original objectives.

---

<b>*Q1: What technology is included in Microsoft Windows that can create backup copies or snapshots of files or volumes on the computer, even when they are in use?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Shadow Copy</code>
</details>

---
## `Practice Analysis`

<b>*Q1: What is the flag after you complete the static site?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{7HR347_1N73L_12_4w35om3}</code>
</details>
