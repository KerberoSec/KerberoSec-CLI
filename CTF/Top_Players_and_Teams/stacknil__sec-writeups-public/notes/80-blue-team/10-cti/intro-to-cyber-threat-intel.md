---
status: done
created: 2026-04-12
updated: 2026-04-12
date: 2026-04-12
platform: tryhackme
room: Intro to Cyber Threat Intel
slug: intro-to-cyber-threat-intel
path: notes/80-blue-team/10-cti/intro-to-cyber-threat-intel.md
topic: 80-blue-team
domain: [blueteam, security-operations, detection-engineering]
skills: [source-evaluation, triage, workflow, threat-modeling, risk-communication, detection-engineering]
artifacts: [concept-notes, pattern-card, room-notes]
type: resource-note
source: User-provided room text and screenshots; external standards aligned to FIRST TLP 2.0, OASIS STIX/TAXII, and MITRE ATT&CK
next_action: Build a follow-up note on IOC enrichment workflow and MISP/OpenCTI operations
---

# Intro to Cyber Threat Intel

## Summary

* **Cyber Threat Intelligence (CTI)** gives raw security data operational meaning. It answers not only *what happened*, but *who may be behind it, how relevant it is, and what should be done next*.
* For a SOC L1 analyst, CTI is not abstract strategy. It is a practical triage amplifier used to enrich alerts, prioritize incidents, and reduce wasted effort.
* The room introduces four pillars: **what CTI is**, **how the CTI lifecycle works**, **which standards/frameworks are commonly used**, and **how to apply CTI in a simple threat-mapping exercise**.
* The most useful distinction is this: **data -> information -> intelligence**. Intelligence is the only layer that directly supports action.
* Analysts should also distinguish between **IOC**, **IOA**, and **TTP**. These are related, but operationally different.
* CTI sharing and usage require structure. This is where **TLP**, **STIX/TAXII**, and **MITRE ATT&CK** become important.

```text
Raw artefact
   -> annotate
   -> correlate
   -> assess relevance
   -> decide action
   = usable intelligence
```

---

## 1. Why CTI Matters in a SOC

A noisy SOC generates more events than humans can meaningfully interpret in isolation. CTI adds context, which changes triage quality.

Without CTI:

* an IP is just an IP
* a hash is just a hash
* an email sender is just a string

With CTI:

* the IP may be known C2 infrastructure
* the hash may map to an active malware family
* the sender may fit an observed phishing cluster

That shift is what separates **artifact handling** from **judgement**.

### Core triage questions CTI helps answer

1. Who or what is behind this indicator?
2. What behavior has been associated with it before?
3. What should the SOC do right now?

For an L1 analyst, this means CTI is not only about "looking things up". It is about deciding whether an alert should be:

* suppressed
* monitored
* escalated
* blocked
* correlated with other activity

---

## 2. Data vs Information vs Intelligence

This distinction is foundational.

| Layer | Meaning | Example | L1 consequence |
| --- | --- | --- | --- |
| Data | Raw observable | `91.185.23.222` | collect it |
| Information | Data with factual annotation | IP seen in outbound traffic; observed near suspicious email/download chain | record and enrich |
| Intelligence | Analyzed information with operational meaning | likely attacker infrastructure associated with phishing-driven compromise | take action or escalate |

### Practical framing

CTI begins when an analyst asks **so what?**

A value is not intelligence simply because it exists in a log. It becomes intelligence when:

* it is enriched,
* related to other events,
* assessed for relevance,
* and tied to a decision.

---

## 3. Indicator Vocabulary: IOC, IOA, TTP

### 3.1 IOC: Indicator of Compromise

Evidence that compromise may already exist.

Examples:

* known malicious IP
* malware file hash
* suspicious registry key
* phishing attachment name

### 3.2 IOA: Indicator of Attack

Behavior that indicates malicious activity is taking place, even if the exact malware family is not yet known.

Examples:

* unusual outbound traffic
* suspicious PowerShell execution
* registry persistence creation
* file download immediately followed by process execution

### 3.3 TTP: Tactics, Techniques, and Procedures

The adversary's behavioral playbook, often mapped through MITRE ATT&CK.

Examples:

* phishing delivery
* persistence via registry modification
* outbound C2 traffic
* use of commodity malware tools

### Operational difference

```text
IOC = what you can point at
IOA = what you can observe happening
TTP = how the attacker operates
```

---

## 4. Indicator Types Useful for L1 Triage

The room highlights common indicator classes and where to enrich them.

| Indicator type | Example | First questions | Typical enrichment sources |
| --- | --- | --- | --- |
| IP address | `91.185.23.222` | Is it malicious? internal? C2? scanner? | WHOIS, VirusTotal, AbuseIPDB, passive DNS |
| Domain / FQDN | `badbank.com` | New domain? spoofed? phishing infrastructure? | WHOIS, passive DNS, urlscan |
| URL | suspicious login or dropper link | Is it credential theft or payload delivery? | URLhaus, urlscan, sandbox |
| File hash / filename | `flbpfuh.exe` | Commodity malware? renamed dropper? | VT, sandbox, internal corpus |
| Email address | `vipivillain@badbank.com` | phishing sender? spoofed domain? previous campaigns? | MX/header review, internal mail telemetry |
| Local artifact | registry key / startup entry | persistence? benign admin change? | EDR, Sigma, internal baseline |

### Analyst habit

Do not memorize a single tool. Memorize the **indicator-to-question** relationship.

Example:

* IP -> infrastructure question
* email -> delivery and pretext question
* file -> malware/tooling question
* registry change -> persistence question

---

## 5. CTI Sources

The room separates intelligence sources into four operational classes.

### 5.1 Internal telemetry

Highest immediate relevance.

Examples:

* SIEM alerts
* EDR detections
* email gateway events
* user-reported phishing

### 5.2 Commercial services

Higher fidelity, often curated, but may be constrained by licensing and sharing limits.

### 5.3 Open-source intelligence (OSINT)

Useful, fast, wide coverage, but should be cross-validated before disruptive action.

### 5.4 Communities / ISACs

Sector-specific sharing can provide high-context indicators relevant to an organization's threat model.

### Key principle

**Actionability matters more than volume.**

Over-ingesting feeds without curation degrades analyst trust and increases false positives.

---

## 6. Threat Intelligence Classifications

The room divides CTI into four levels.

| Classification | Focus | Example output |
| --- | --- | --- |
| Strategic | executive/business risk view | annual ransomware trends report |
| Tactical | adversary behavior / TTP view | ATT&CK-style advisory on malspam techniques |
| Operational | campaign-specific intent and targeting | threat activity summary for a live actor cluster |
| Technical | atomic indicators | IPs, hashes, domains, filenames |

### For SOC L1

The daily workflow is dominated by **technical intelligence**, but good analysts constantly move upward:

* from technical indicators,
* to tactical behavior,
* to operational story.

---

## 7. CTI Lifecycle

The room uses a six-phase lifecycle. This is the most important process model in the note.

```text
Direction
   -> Collection
   -> Processing
   -> Analysis
   -> Dissemination
   -> Feedback
```

### 7.1 Direction

This is where intelligence requirements are defined.

Questions are set here, for example:

* Which IPs/domains are targeting PostgreSQL?
* Which malware families are active this week?

This phase is critical because bad questions create irrelevant collection.

### 7.2 Collection

Gather raw material from selected sources.

Examples:

* vendor feeds
* AbuseIPDB
* internal MISP / OpenCTI data
* threat reports

### 7.3 Processing

Standardize and prepare the collected data.

This includes:

* normalization
* deduplication
* tagging
* TLP labeling
* format conversion into operational outputs

The room specifically identifies this stage as where data is converted into usable structured formats.

### 7.4 Analysis

Turn processed information into judgement.

This means:

* checking local relevance
* confirming sightings
* measuring confidence
* deciding action level

#### Example confidence model

| Confidence | Source agreement | Local evidence | Action |
| --- | --- | --- | --- |
| High | same IOC in 2+ sources | local attempt observed | block immediately |
| Medium | single trusted source | no local hit | alert / monitor |
| Low | OSINT only | no context | hold and watch |

### 7.5 Dissemination

Give the right intelligence to the right consumer in the right format.

| Stakeholder | Needs |
| --- | --- |
| Firewall team | blocklist or change ticket |
| Endpoint team | YARA / detection rules |
| CTI platform | normalized indicator objects |
| Management | concise risk summary |

### 7.6 Feedback

Measure whether the workflow helped.

Typical outputs:

* lower dwell time
* reduced false positives
* expanded scope for next iteration

---

## 8. Traffic Light Protocol (TLP)

TLP governs how far intelligence may be shared. The room uses the common four-label model.

| TLP | Meaning | Analyst behavior |
| --- | --- | --- |
| CLEAR | no restriction | broad internal/public reuse as allowed |
| GREEN | community sharing allowed, not public | share with trusted peer groups |
| AMBER | limited sharing, need-to-know basis | keep internal / controlled |
| RED | named recipients only | tightly restrict access |

### Important rule

When multiple sources conflict, the **stricter handling rule should prevail** in operational practice.

That is exactly the kind of detail junior analysts often miss.

---

## 9. STIX, TAXII, and Platform Thinking

The room distinguishes **feeds** from **platforms**.

### 9.1 Feeds

A feed is a stream of indicators.

Examples:

* CSV
* JSON
* STIX bundles
* TAXII-delivered indicator collections

### 9.2 Platforms

A platform is the environment where indicators are stored, related, tagged, searched, and updated.

Examples:

* MISP
* OpenCTI

### 9.3 STIX

**STIX** is the structured data model used to represent cyber threat information in machine-readable form.

### 9.4 TAXII

**TAXII** is the transport/API layer used to exchange CTI, especially STIX-based content.

### Practical mental model

```text
STIX = the language / schema
TAXII = the delivery mechanism / exchange protocol
Platform = where your organization stores and works with the intel
```

---

## 10. MITRE ATT&CK, D3FEND, and Kill Chain

### 10.1 MITRE ATT&CK

Use ATT&CK to describe adversary behavior in a common language.

Example analyst note:

```text
Observed phishing-led initial access followed by persistence and outbound C2-like traffic.
Potential ATT&CK mapping: phishing / persistence / command-and-control.
```

The point is not to impress with ATT&CK IDs. The point is to make triage portable across analysts, tools, and teams.

### 10.2 MITRE D3FEND

If ATT&CK says **how attackers operate**, D3FEND helps frame **how defenders respond**.

This is useful when a triage note should include not only diagnosis, but also a suggested defensive control.

### 10.3 Cyber Kill Chain

The room also covers the classical kill chain:

1. Reconnaissance
2. Weaponisation
3. Delivery
4. Exploitation
5. Installation
6. Command & Control
7. Actions on Objectives

### Practical value

Kill chain is simpler than ATT&CK. It is good for quick mental placement of an event during triage.

Example:

* phishing email -> Delivery
* malware execution -> Exploitation / Installation
* outbound flow to attacker IP -> Command & Control
* data theft -> Actions on Objectives

---

## 11. Vulnerability Side of CTI: CVE, CVSS, NVD

Threat intelligence is not only about malware and adversaries. It also intersects with vulnerability management.

| Term | Meaning |
| --- | --- |
| CVE | identifier for a vulnerability |
| CVSS | severity scoring system |
| NVD | database linking CVEs to affected products, scoring, references |

For SOC L1, this matters because many alerts are vulnerability-related rather than active-compromise-related.

---

## 12. Practical Analysis: SIEM Mini Case

Based on the provided screenshot, the event chain is short but coherent.

### 12.1 Observed timeline

| Time | Event |
| --- | --- |
| Jun 12 08:40 | Email received by John Doe from `vipivillain@badbank.com` |
| Jun 12 08:41 | File download initiated by John Doe: `flbpfuh.exe` |
| Jun 12 08:42 | Registry files modified |
| Jun 12 16:34 | Outbound network flow to `91.185.23.222` |
| Jun 13 11:47 | John Doe account logged off |
| Jun 13 11:48 | Administrator account logged on successfully |

### 12.2 Likely interpretation

This is a basic phishing-to-compromise narrative:

1. **Delivery**: phishing email arrives
2. **Execution**: user downloads malicious executable
3. **Persistence / host change**: registry modification
4. **C2 / exfil path**: outbound flow to attacker-controlled IP
5. **Privilege impact**: later admin login suggests further compromise or credential abuse

### 12.3 Extracted threat details from the screenshot

| Field | Value |
| --- | --- |
| Source email address | `vipivillain@badbank.com` |
| Downloaded file | `flbpfuh.exe` |
| Threat actor extraction / external IP | `91.185.23.222` |
| Victim email recipient | `John Doe` |
| User victim logged account | `Administrator` was later observed logging in successfully |
| Malware tool | likely the downloaded executable `flbpfuh.exe` |

### Caution

The screenshot provided does **not** show the final success message after completing the threat profile. That value should be treated as **not verified from available evidence**.

---

## 13. Pattern Cards

### Pattern Card: Indicator enrichment

**Input:** IP / hash / sender / filename
**Question:** does this artifact have known malicious context?
**Action:** enrich before deciding severity

### Pattern Card: TLP handling

**Problem:** same indicator comes from sources with different sharing labels
**Rule:** carry forward the stricter handling boundary

### Pattern Card: Feed overload

**Problem:** too many indicators, low trust, analyst fatigue
**Fix:** prioritize relevance and actionability over feed volume

### Pattern Card: CTI dissemination

**Problem:** same detail sent to everyone
**Fix:** adapt output by audience: SOC, firewall, endpoint, management

---

## 14. Workflow Template for L1 Analysts

```text
1. Collect the alert artifact.
2. Identify artifact type.
3. Enrich from trusted sources.
4. Check internal sightings and history.
5. Map to likely behavior or ATT&CK technique.
6. Assign confidence and relevance.
7. Recommend action: suppress / monitor / escalate / block.
8. Preserve TLP and source metadata.
```

---

## 15. Pitfalls

### 15.1 Treating all feeds as equal

They are not.

### 15.2 Confusing data with intelligence

A value in a table is not automatically meaningful.

### 15.3 Ignoring local relevance

A highly malicious IOC may still be irrelevant if it does not intersect your environment.

### 15.4 Forgetting sharing controls

TLP handling mistakes can create legal, contractual, or trust problems.

### 15.5 Escalating without a story

A good CTI triage note should contain:

* artifact
* context
* confidence
* relevance
* next action

---

## 16. ASCII Diagram

```text
Alert
  |
  v
Artifact identified
  |
  v
Enrichment
  |
  +--> external context
  +--> internal sightings
  +--> past behavior
  |
  v
Analysis
  |
  v
Actionable intelligence
  |
  +--> block
  +--> monitor
  +--> escalate
  +--> report
```

---

## 17. CN-EN Glossary

* Cyber Threat Intelligence (CTI): 网络威胁情报
* Indicator of Compromise (IOC): 失陷指标
* Indicator of Attack (IOA): 攻击指标
* Tactics, Techniques, and Procedures (TTPs): 战术、技术与过程
* Enrichment: 情报富化 / 指标补充分析
* Dissemination: 分发 / 情报下发
* Feedback loop: 反馈闭环
* Traffic Light Protocol (TLP): 交通灯协议
* Structured Threat Information Expression (STIX): 结构化威胁信息表达
* Trusted Automated eXchange of Indicator Information (TAXII): 可信威胁情报自动交换协议
* Command and Control (C2): 命令与控制
* Kill Chain: 攻击链
* Confidence level: 置信度
* Actionability: 可操作性
* Threat report: 威胁报告

---

## 18. Takeaways

This room is introductory, but the core lesson is strong:

**CTI is decision support, not trivia.**

An L1 analyst does not need to become a full-time intelligence researcher. What they need is:

* a way to classify artifacts,
* a repeatable enrichment process,
* a discipline for source handling,
* and a habit of turning observations into operational judgement.

That is the bridge from "I saw a suspicious IP" to "this alert matters, here is why, and here is the next action."
