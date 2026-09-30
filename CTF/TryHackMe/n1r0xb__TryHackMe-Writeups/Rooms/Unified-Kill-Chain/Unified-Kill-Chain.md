# <div align="center">[`Unified Kill Chain`](https://tryhackme.com/room/unifiedkillchain)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/d1754007-60ad-4125-b437-a484f72c9a0c" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`C2`                |Command and Control (C2) Infrastructure are a set of programs used to communicate with a victim machine. This is comparable to a reverse shell, but is generally more advanced and often communicate via common network protocols, like HTTP, HTTPS and DNS.|
|`CIA Triad`         |Confidentiality, Integrity, and Availability (CIA) is the opposite of Disclosure, Alternation, and Destruction (DAD).|
|`CVSS`              |Common Vulnerability Scoring System.|
|`DREAD`             |A system used by microsoft to assess risk to computer security threats.|
|`Persistence`       |Malware often tries to keep a footprint in the system such that it keeps running even after a system restart. This is called persistence. For example, If a malware adds itself to the startup registry keys, it will persist even after a system restart.|
|`Phishing`          |When emails are sent to a target(s) purporting to be from a trusted entity to lure individuals into providing sensitive information.|
|`SDLC`              |Software Development Life Cycle is a software engineering concept which is the structured process of developing an application.|
|`Social Engineering`|The manipulation of individuals to divulge sensitive information, through various forms of communication.|
|`STRIDE`            |Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service (DoS), and Elevation of Privilege.|

---
## `What is a "Kill Chain"`

Originating from the military, a “Kill Chain” is a term used to explain the various stages of an attack. In the realm of cybersecurity, a “Kill Chain” is used to describe the methodology/path attackers such as hackers or APTs use to approach and intrude a target.

The objective is to understand an attacker's “Kill Chain” so that defensive measures can be put in place to either pre-emptively protect a system or disrupt an attacker's attempt.

---

<b>*Q1: Where does the term "Kill Chain" originate from?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Military</code>
</details>

---
## `What is "Threat Modelling"`

Threat modelling, in a cybersecurity context, is a series of steps to ultimately improve the security of a system.

Threat modelling is an important procedure in reducing the risk within a system or application, as it creates a high-level overview of an organisation's IT assets (an asset in IT is a piece of software or hardware) and the procedures to resolve vulnerabilities.

---

<b>*Q1: What is the technical term for a piece of software or hardware in IT (Information Technology?)*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Asset</code>
</details>

---
## `Introducing the Unified Kill Chain`

**The UKC states that there are 18 phases to an attack:**

<img width="1211" height="782" alt="UKC-Phases(UKC)-THM" src="https://github.com/user-attachments/assets/965110c1-dc59-414d-96f3-fac37286619d" />

---

<b>*Q1: In what year was the Unified Kill Chain framework released?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>2017</code>
</details>

<b>*Q2: According to the Unified Kill Chain, how many phases are there to an attack?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>18</code>
</details>

<b>*Q3: What is the name of the attack phase where an attacker employs techniques to evade detection?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Defense Evasion</code>
</details>

<b>*Q4: What is the name of the attack phase where an attacker employs techniques to remove data from a network?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Exfiltration</code>
</details>

<b>*Q5: What is the name of the attack phase where an attacker achieves their objectives?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Objectives</code>
</details>

---
## `Goal: In (Initial Foothold)`

The main focus of this series of phases is for an attacker to gain access to a system or networked environment.

**Reconnaissance (MITRE Tactic TA0043)**

**Weaponization (MITRE Tactic TA0001)**

**Social Engineering (MITRE Tactic TA0001)**

**Exploitation (MITRE Tactic TA0002)**

**Persistence (MITRE Tactic TA0003)**

**Defence Evasion (MITRE Tactic TA0005)**

**Command & Control (MITRE Tactic TA0011)**

**Pivoting (MITRE Tactic TA0008)**

---

<b>*Q1: What is an example of a tactic to gain a foothold using emails?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Phishing</code>
</details>

<b>*Q2: Impersonating an employee to request a password reset is a form of what?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Social Engineering</code>
</details>

<b>*Q3: An adversary setting up the Command & Control server is what phase of the Unified Kill Chain?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Weaponization</code>
</details>

<b>*Q4: Exploiting a vulnerability present on a system is what phase of the Unified Kill Chain?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Exploitation</code>
</details>

<b>*Q5: Moving from one system to another is an example of?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Pivoting</code>
</details>

<b>*Q6: Leaving behind a malicious service that allows the adversary to log back into the target is what?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Persistence</code>
</details>

---
## `Goal: Through (Network Propagation)`

The **"Through"** goal follows a successful foothold being established on the target network. If defensive controls prevent the attacker from achieving their objective, they will seek to gain additional access and privileges to systems. The attacker would set up a base on one of the systems to act as their pivot point and use it to gather information about the internal network.

**Pivoting (MITRE Tactic TA0008)**

**Discovery (MITRE Tactic TA0007)**

**Privilege Escalation (MITRE Tactic TA0004)**

**Execution (MITRE Tactic TA0002)**

**Credential Access (MITRE Tactic TA0006)**

**Lateral Movement (MITRE Tactic TA0008)**

---

<b>*Q1: As a SOC analyst, you pick up an alert pointing to failed logins from an administrator account.
What phase of the Unified Kill Chain would an attacker be seeking to achieve?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Privilege Escalation</code>
</details>

<b>*Q2: Mimikatz, a known post-exploitation tool, was detected on the IT Manager's workstation.
The Security logs show that the tool was attempting to dump OS and user secrets.
Which Unified Kill Chain phase does this activity correspond to?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Credential Access</code>
</details>

---
## `Goal: Out (Action on Objectives)`

The **"Out"** goal wraps up the journey of an adversary’s attack on an environment, where they have critical asset access and can fulfil their attack goals.

**Collection (MITRE Tactic TA0009)**

**Exfiltration (MITRE Tactic TA0010)**

**Impact (MITRE Tactic TA0040)**

---

<b>*Q1: While monitoring the network as a SOC analyst, you observe a big traffic spike.
Most of the network traffic is sent to an unknown, suspicious IP address.
What Unified Kill Chain phase could describe this activity?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Exfiltration</code>
</details>

<b>*Q2: Personally identifiable information (PII) has been released to the public by an adversary.
Your organisation is facing reputational losses and scrutiny for the breach.
What part of the CIA triad would be affected by this action?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Confidentiality</code>
</details>

---
## `Practical`

<b>*Q1: Match the scenario prompt to the correct phase of the Unified Kill Chain to reveal the flag at the end. What is the flag?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{UKC_SCENARIO}</code>
</details>
