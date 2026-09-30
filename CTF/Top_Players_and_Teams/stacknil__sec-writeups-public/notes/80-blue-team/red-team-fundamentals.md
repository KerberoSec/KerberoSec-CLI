---
status: done
created: 2026-04-13
updated: 2026-04-13
date: 2026-04-13
platform: tryhackme
room: Red Team Fundamentals
slug: red-team-fundamentals
path: notes/80-blue-team/red-team-fundamentals.md
topic: 80-blue-team
domain: [security-operations, detection-engineering, security-engineering]
skills: [security-models, threat-modeling, workflow, incident-response, detection]
artifacts: [concept-notes, lab-notes, pattern-card]
type: resource-note
source: User-provided room text and screenshots
next_action: Continue with threat intel for adversary emulation, detection engineering, and lateral movement basics
---

# Red Team Fundamentals

## Summary

* A **vulnerability assessment** asks: *what weaknesses exist across many systems?*
* A **penetration test** asks: *can those weaknesses actually be exploited, and what is the impact?*
* A **red team engagement** asks: *can a realistic adversary achieve a goal while staying stealthy enough to test detection and response?*
* Red teaming is not mainly about finding every bug. It is about **adversary emulation**, **goal-driven operations**, and **measuring blue-team readiness**.
* Typical red-team focus includes technical intrusion, social engineering, physical access, evasion, lateral movement, and actions on objectives.

```text
Vuln Assessment -> breadth
Pentest         -> exploitability + impact
Red Team        -> realism + stealth + blue-team testing
```

---

## 1. Why This Room Matters

Many beginners collapse several security activities into one mental box called "testing." That is a mistake.

The room's real value is conceptual: it separates three very different engagement models that often get discussed with the same vague language.

If you do not distinguish them clearly, you will misunderstand:

* what the client is paying for,
* what the operators are optimizing for,
* what the blue team is expected to learn,
* and why "red team" is not just "harder pentest."

This distinction is operationally important. It changes tooling, tempo, stealth, scope, and success criteria.

---

## 2. Vulnerability Assessment vs Pentest vs Red Team

### 2.1 Vulnerability Assessment

A vulnerability assessment is the broadest and usually the least adversary-realistic form.

Its goal is to identify as many weaknesses as possible across as many systems as possible.

**Core characteristics**

* broad coverage
* often tool-heavy and automated
* little or no exploitation
* host-by-host posture review
* remediation-oriented output

**Question it answers**

```text
What is wrong with this environment, in general?
```

**What it usually does not answer**

* Can the flaw really be exploited in this environment?
* Can flaws be chained together?
* Can the attacker remain undetected?
* Would the blue team respond correctly?

### 2.2 Penetration Test

A penetration test adds exploitation and post-exploitation logic.

It tries to determine whether identified weaknesses can actually be used to compromise systems and what practical impact that would create.

**Core characteristics**

* validates exploitability
* measures impact, not just exposure
* may chain weaknesses
* includes post-exploitation and pivoting
* still primarily prevention-oriented

**Question it answers**

```text
Can an attacker exploit this, and what could happen next?
```

**Important limitation**

A pentest is still usually constrained by time, budget, and reporting pressure. That often makes it **louder** and less stealth-focused than real adversary operations.

### 2.3 Red Team Engagement

A red team engagement is closer to **adversary emulation** than conventional testing.

The red team does not care about finding every issue. It only needs to find **one viable path** to the agreed objective while behaving in a way that pressures detection and response.

**Core characteristics**

* goal-driven, not coverage-driven
* stealth and evasion matter
* models real attacker behavior
* tests defensive detection and response
* often includes technical + human + physical layers

**Question it answers**

```text
Could a realistic attacker achieve a business-relevant objective before our defenders stop them?
```

---

## 3. First-Principles View

Here is the cleanest way to think about the three models.

| Engagement type | Optimization target | Noise tolerance | Breadth | Realism |
| --- | --- | ---: | ---: | ---: |
| Vulnerability Assessment | find weaknesses | high | very high | low |
| Pentest | prove exploitability and impact | medium/high | medium/high | medium |
| Red Team | emulate adversary and test defenses | low | selective | high |

### Practical translation

* **Assessment** optimizes for **inventory of weakness**.
* **Pentest** optimizes for **evidence of compromise path**.
* **Red team** optimizes for **realistic pressure on defenders**.

---

## 4. Why Regular Pentesting Is Not Enough Against Real Adversaries

The room correctly emphasizes that conventional testing has structural limitations.

### Main reasons

#### 4.1 Pentests are often loud

A pentester is usually not punished for being noisy. In fact, speed often matters more than stealth.

A real adversary behaves differently:

* avoids scans when possible
* limits exploit attempts
* blends into legitimate traffic
* prefers trust abuse over obvious exploits

#### 4.2 Non-technical vectors are often omitted

Conventional pentests frequently underweight:

* phishing
* phone pretexting
* credential theft through human error
* physical intrusion
* access-control bypass outside the network layer

#### 4.3 Security controls may be relaxed

In some pentests, allowlisting or rule relaxation happens so the testers can work efficiently.

That is understandable from a delivery perspective and bad as a proxy for real attacker conditions.

#### 4.4 Real attackers are persistent

The room references **APT** behavior. The key point is persistence is not just "stays longer." It means:

* patient campaign logic
* adaptive tradecraft
* long dwell time
* strong operational discipline
* objective continuity across failures

---

## 5. What Red Teaming Actually Tries to Measure

A red team engagement is ultimately a measurement system.

It measures whether the organization can:

* detect initial intrusion,
* investigate meaningfully,
* contain lateral movement,
* correlate weak signals,
* respond before crown-jewel compromise.

### Important mindset correction

The purpose is not for red team to "win."

The purpose is to create enough realistic pressure that the blue team, defenders, engineers, and leadership can improve.

That means a good red-team report is not a victory speech. It is a **defensive learning instrument**.

---

## 6. Red Team Objectives: Crown Jewels and Flags

Red-team goals are often framed as **flags**, **objectives**, or **crown jewels**.

These are business-relevant end states, for example:

* access the transaction database,
* obtain domain admin,
* access HR payroll data,
* reach a sensitive application from a user workstation,
* simulate exfiltration of regulated data.

### Why this matters

This forces the engagement to align with **business risk**, not generic technical activity.

A red-team path is only meaningful if it leads to something the organization actually cares about.

---

## 7. Attack Surfaces Considered in Red Teaming

The room highlights three major surfaces.

### 7.1 Technical Infrastructure

This includes:

* externally exposed services
* endpoint weaknesses
* identity misconfigurations
* privilege escalation paths
* lateral movement paths
* command-and-control opportunities

### 7.2 Social Engineering

This includes:

* phishing campaigns
* credential harvesting
* phone-based pretexting
* social-media-driven profiling
* business-process abuse

### 7.3 Physical Intrusion

This includes:

* unauthorized facility access
* badge cloning
* lock bypass
* rogue device placement
* local workstation compromise

### Key lesson

Real attacker pathways are usually **cross-domain**.
A phishing email may lead to endpoint foothold, which leads to hash theft, which leads to lateral movement, which leads to database access.

That chain is what red teaming is designed to emulate.

---

## 8. Types of Red Team Exercises

### Full Engagement

Simulates a realistic full attack path from initial access to objective.

### Assumed Breach

Starts from the assumption that the attacker already has a foothold.

This is useful when the organization wants to test:

* internal segmentation,
* privilege escalation,
* lateral movement,
* response maturity after compromise.

### Tabletop Exercise

A discussion-based scenario exercise. Less technically deep, but still useful for:

* coordination testing
* decision-making
* escalation paths
* communications planning

---

## 9. Teams / Cells in an Engagement

The room introduces the classic three-cell model.

### 9.1 Red Cell

The offensive side.

Responsible for:

* planning operations,
* emulating adversary behavior,
* executing TTPs,
* pursuing objectives under ROE.

### 9.2 Blue Cell

The defensive side.

Includes:

* SOC analysts
* responders
* defenders
* internal IT / security staff
* management in some escalation scenarios

Responsible for:

* detecting suspicious activity
* triaging alerts
* investigating signals
* containing and recovering

### 9.3 White Cell

The referee / control layer.

Responsible for:

* enforcing ROE
* coordinating safe execution
* maintaining fairness and safety
* correlating red activity with blue reactions
* controlling scope, pacing, and escalation

### Trusted Agent

A trusted agent is typically associated with the **white cell** because they help coordinate safe and authorized execution without breaking the realism of the exercise.

---

## 10. Red-Team Internal Roles

The room provides a simple hierarchy.

### Red Team Lead

Owns:

* high-level planning
* engagement design
* delegation
* alignment with objectives and ROE
* reporting oversight

### Assistant Lead

Supports:

* coordination
* operations management
* documentation
* operator synchronization

### Red Team Operators

Execute:

* recon
* phishing
* exploitation
* privilege escalation
* persistence
* lateral movement
* C2 operations

### Real-world note

Titles vary by organization. Some teams flatten hierarchy. Others split operators into specializations such as:

* infrastructure operator
* malware operator
* initial-access specialist
* social engineering operator
* adversary emulation analyst

---

## 11. TTP: What It Actually Means

The room asks for the expansion of **TTP**.

### TTP = Tactics, Techniques, and Procedures

The easiest way to remember this is:

* **Tactics** = the attacker's goal at a stage
* **Techniques** = how they achieve that goal
* **Procedures** = the specific implementation details they use in practice

```text
Why -> How -> With what exact tradecraft
```

This is why ATT&CK-style thinking is so useful. It turns messy attack behavior into structured, comparable building blocks.

---

## 12. Lockheed Martin Cyber Kill Chain

The room uses the **Lockheed Martin Cyber Kill Chain** as its main structure.

### Stages

1. Reconnaissance
2. Weaponization
3. Delivery
4. Exploitation
5. Installation
6. Command and Control
7. Actions on Objectives

### Simple interpretation

```text
Learn target
-> prepare attack package
-> deliver it
-> trigger execution
-> establish tooling
-> control compromised host
-> achieve mission goal
```

---

## 13. Kill Chain Stage Notes

### Reconnaissance

Collect information about the target.

Examples:

* OSINT
* email harvesting
* employee profiling
* tech stack discovery
* exposed infrastructure mapping

### Weaponization

Prepare the attack package.

Examples:

* malicious document
* exploit + payload bundle
* phishing attachment
* backdoored installer

### Delivery

Move the weaponized artifact to the target.

Examples:

* email
* web delivery
* USB
* drive-by interaction

### Exploitation

Exploit the target to gain execution.

Examples:

* vulnerability trigger
* macro execution
* credentialed abuse
* browser exploit

### Installation

Place or stage tooling on the target.

Examples:

* beacon dropper
* credential dumper
* persistence mechanism
* post-exploitation toolset

### Command and Control

Establish remote control.

Examples:

* C2 beaconing
* remote tasking
* covert channel setup

### Actions on Objectives

Do the thing that matters.

Examples:

* privilege takeover
* database access
* ransomware simulation
* data exfiltration
* business-process manipulation

---

## 14. Important Conceptual Nuance: Kill Chain vs ATT&CK

The room centers the Kill Chain, which is good for beginners. But it is worth understanding the limitation.

### Kill Chain is strong at

* summarizing an intrusion flow
* explaining attack progression simply
* framing a narrative

### Kill Chain is weaker at

* internal movement detail
* defensive coverage mapping at technique granularity
* modeling repeated or looping attacker actions

### ATT&CK is better for

* detailed TTP mapping
* detections and analytics alignment
* technique-level planning
* coverage gap analysis

So for learning:

```text
Kill Chain = strategic storyline
ATT&CK     = granular behavior map
```

---

## 15. Reading the Engagement Example in the Room

The room's comic-style engagement example is actually a useful operational chain.

### Stage 1: Planning

Red and white define an objective aligned with business impact.

### Stage 2: Intelligence Gathering

Red team builds realistic targeting context:

* employees
* technologies
* social media
* public posture
* sector-relevant adversary tradecraft

### Stage 3: Phishing Campaign

A phishing email creates initial access.
Important lesson: even if the blue team detects the campaign broadly, partial compromise may already exist.

### Stage 4: Local Privilege Escalation and Persistence

The red team uses missing patches and evasive tradecraft to escalate locally and extract credential material.

### Stage 5: Lateral Movement

The red team uses pass-the-hash and additional recon to move through the environment and pivot to systems closer to the objective.

### Stage 6: Actions on Objectives

The final access path reaches the desired target.

### What the room is really teaching

Red teaming is not one exploit.
It is **a chained operational narrative**.

---

## 16. Why Lateral Movement Matters So Much

Beginners often over-focus on "the initial exploit." That is not where most organizational pain lies.

The most dangerous question is:

```text
What can the attacker do after the first foothold?
```

That is why the room spends time on:

* dumped hashes
* local admin accounts
* pass-the-hash
* pivots through intermediate systems
* firewall constraints

### Operational reality

In many real incidents, the breach is not catastrophic because of initial access alone. It becomes catastrophic because identity, segmentation, monitoring, and internal control all fail in sequence.

---

## 17. Detection and Evasion as Core Red-Team Logic

The room repeatedly contrasts red teaming with conventional pentesting through stealth.

### Red-team operator mindset

* minimize host touch
* avoid unnecessary scanning
* adapt to defenses
* control alert volume
* blend with normal activity when possible

### Defensive lesson

Blue teams should not only detect obviously malicious tools.
They need to detect:

* unusual authentication patterns
* suspicious privilege changes
* atypical admin behavior
* new service creation
* beacon-like traffic
* internal movement anomalies

---

## 18. Pattern Cards

### Pattern Card: Breadth vs Depth vs Realism

**Assessment:** broad, shallow, inventory-driven
**Pentest:** deeper, exploitability-driven
**Red team:** narrower, realistic, detection-driven

### Pattern Card: Crown Jewel Objective

**Definition:** a business-relevant end state whose compromise matters
**Examples:** DB access, finance records, privileged identity, HR data

### Pattern Card: Assumed Breach

**Definition:** begin as if initial compromise already happened
**Use:** test post-compromise resilience faster

### Pattern Card: White Cell Function

**Definition:** safety, fairness, coordination, ROE enforcement
**Use:** keeps realism without losing control

### Pattern Card: Lateral Movement Risk

**Definition:** movement from an initial foothold to higher-value assets
**Key enablers:** weak credentials, reused hashes, trust paths, poor segmentation

---

## 19. Common Exam / Interview Answers

### Q: Would a vulnerability assessment prepare us to detect a real attacker?

**A:** Nay

### Q: During a penetration test, are you mainly worried about being detected by the client?

**A:** Nay

### Q: Highly organized skilled attacker groups are often called?

**A:** APTs

### Q: Goals in a red-team engagement are often called?

**A:** crown jewels / flags

### Q: TTP stands for?

**A:** Tactics, Techniques and Procedures

### Q: Is the main objective of a red team to find as many vulnerabilities in as many hosts as possible?

**A:** Nay

### Q: Which cell is responsible for offensive operations?

**A:** Red Cell

### Q: What cell is the trusted agent associated with?

**A:** White Cell

### Q: If Mimikatz is deployed on a target, where does it fit in the Kill Chain?

**A:** Installation

### Q: Which stage is about exploiting the target to execute code?

**A:** Exploitation

---

## 20. CN-EN Glossary

* Vulnerability Assessment: 漏洞评估
* Penetration Test / Pentest: 渗透测试
* Red Team Engagement: 红队演练 / 红队对抗
* Blue Team: 蓝队
* White Cell: 白队 / 裁判协调组
* Adversary Emulation: 对手模拟
* Crown Jewels: 皇冠资产 / 核心敏感目标
* TTPs: 战术、技术与流程
* Reconnaissance: 侦察
* Weaponization: 武器化
* Delivery: 投递
* Exploitation: 利用
* Installation: 安装 / 植入工具
* Command and Control (C2): 命令与控制
* Actions on Objectives: 目标行动阶段
* Lateral Movement: 横向移动
* Privilege Escalation: 权限提升
* Pass-the-Hash: 哈希传递攻击
* Persistence: 持久化
* ROE (Rules of Engagement): 交战规则 / 演练规则
* Trusted Agent: 可信协调人员
* APT (Advanced Persistent Threat): 高级持续性威胁

---

## 21. Takeaways

This room is fundamentally about **changing the optimization target** of security testing.

### The essential shift

* Vulnerability assessment asks what is weak.
* Pentest asks what is exploitable.
* Red teaming asks whether a realistic attacker can achieve a meaningful objective before defenders stop them.

That last question is strategically closer to real-world security.

### Three conclusions worth keeping

1. **Red teaming is not "more aggressive pentesting."** It is a different measurement model.
2. **Business-relevant goals matter more than host coverage.** Attackers do not need every weakness. They need one path.
3. **Detection and response are first-class outcomes.** A red-team engagement is successful when defenders learn, not when operators collect trophies.

---

## 22. Minimal Review Checklist

```text
[ ] I can clearly distinguish vulnerability assessments, pentests, and red-team exercises.
[ ] I know red teaming is goal-driven and stealth-oriented.
[ ] I understand why pentests are often louder than real attacks.
[ ] I remember the roles of red, blue, and white cells.
[ ] I know TTP means Tactics, Techniques, and Procedures.
[ ] I can list the seven Lockheed Martin Cyber Kill Chain stages.
[ ] I understand why lateral movement matters more than the first foothold alone.
[ ] I understand that red teaming exists to improve defenders, not to glorify attackers.
```

---

## 23. Suggested Next Notes

Natural follow-up topics:

* Threat Intelligence for Adversary Emulation
* Phishing Operations and Initial Access Tradecraft
* Windows Privilege Escalation Basics
* Credential Access and Pass-the-Hash
* Detection Engineering for Lateral Movement
* ATT&CK Mapping for Blue Team and Red Team
