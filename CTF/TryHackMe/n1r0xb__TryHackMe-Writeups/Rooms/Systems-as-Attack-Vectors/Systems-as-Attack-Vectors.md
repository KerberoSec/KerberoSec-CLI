# <div align="center">[`Systems as Attack Vectors`](https://tryhackme.com/room/systemsattackvectors)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/c4212909-1d82-4bdc-b358-75b6f87e28d7" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`AWS`      |Amazon Web Services (AWS) is a comprehensive cloud computing platform offered by Amazon. It provides a wide range of services such as computing power, storage, databases, networking, analytics, and more, delivered over the internet on a pay-as-you-go basis.|
|`CIS`      |CIS (Centre for Internet Security) is a non-profit organisation that helps collect and define standards that can be implemented as preventative measures against cyber attacks.|
|`CVE`      |Common Vulnerabilities and Exposures (CVE), this term is given to a publicly disclosed vulnerability.|
|`IPS`      |Intrusion Prevention System (IPS) is a device or application that detects and stops intrusions attempts proactively. They are usually deployed in front of the protected asset and block any potential threat from reaching their target.|
|`Patching` |The process of applying a set of changes to an existing program or its supporting data to update, fix, or improve it.|
|`Zero-Day` |A zero-day (also known as a 0-day) is a vulnerability or security hole in a computer system unknown to its developers or anyone capable of mitigating it.|

---
## `Definition of System`

|**Breached System**|**Attack Value**|
|:------------------|:---------------|
|A personal laptop of a school student|Steal Steam profile and add the PC to a botnet|
|A laptop of the bank's senior IT administrator|Get access to the internal banking systems|
|A mail server of a criminal law company|Dump all mailboxes and blackmail the victim |
|A server at the heart of an industrial network|Encrypt the whole network with ransomware|
|A government website management panel|Damage the website content (defacement / activism)|

---

<b>*Q1: Can cyber attacks happen without victim intervention (Yea/Nay)?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Yea</code>
</details>

<b>*Q2: Can a breach of just a single system lead to disastrous consequences (Yea/Nay)?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Yea</code>
</details>

---
## `Attacks on Systems`

**How Systems are Attacked:**
* `Human-Led Attacks`
* `Vulnerabilities`
* `Supply Chain`

---

<b>*Q1: What is the term for a security flaw that can be exploited to breach a system?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Vulnerability</code>
</details>

<b>*Q2: What is the name of the attack when malware comes from a trusted app or library?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Supply Chain</code>
</details>

---
## `Vulnerabilities`

<b>*Q1: What is the CVE for the critical SharePoint vulnerability dubbed "ToolShell"?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>CVE-2025-53770</code>
</details>

<b>*Q2: How would you respond to a detected vulnerability on your system?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Patch</code>
</details>

---
## `Misconfigurations`

**Some Real-World Examples:**
* How ["123456" password](https://www.bleepingcomputer.com/news/security/123456-password-exposed-chats-for-64-million-mcdonalds-job-chatbot-applications/) exposed chats for 64 million McDonald's job applications.
* How a [misconfigured AWS cloud](https://www.bleepingcomputer.com/news/security/capital-one-data-breach-affects-106-million-people-suspect-arrested/#:~:text=intrusion%20occurred%20through%20a%20misconfigured%20web%20application%20firewall) resulted in a breach of 106 million bank customers.
* How improperly configured [smart fridges](https://www.sectigo.com/blog/when-refrigerators-attack-how-cyber-criminals-infect-appliances-and-how-manufacturers-can-stop-them) are silently used in full-scale botnet attacks.

**Responding to Misconfigurations:**
* **Penetration Testing:** Hire ethical "hackers" who simulate an attack and report on discovered security flaws.
* **Vulnerability Scans:** Periodically run tools that can detect default passwords or outdated software.
* **Configuration Audits:** Manually review the systems to match best practices like CIS benchmarks.

---

<b>*Q1: Can a system patch or software update fix the misconfigurations (Yea/Nay)?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Nay</code>
</details>

<b>*Q2: Which activity involves an authorized cyber attack to detect the misconfigurations?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Penetration Testing</code>
</details>

---
## `Practice`

**Most Common Mitigation Measures to Protect Your Systems:**

|**Mitigation**|**Description**|
|:-------------|:--------------|
|Patch Management|A process of tracking and patching the vulnerable systems significantly reduces the chance of a successful attack|
|Training for IT|If your IT knows the risks of misconfigurations, they are less likely to leave the systems unprotected|
|Network Protection|The system is much harder to breach if access to it is restricted to trusted people or IP addresses|
|Antivirus Protection|Same as with attacks on humans, a good antivirus can stop or at least detect many different attacks|

<b>*Q1: What flag did you receive after completing the "Systems at Risk" challenge?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{patch_or_reconfigure?}</code>
</details>

<b>*Q2: What flag did you receive after completing the "Remediation Plan" challenge?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{best_systems_defender!}</code>
</details>
