---
status: done
created: 2026-04-03
updated: 2026-04-03
date: 2026-03-29
platform: tryhackme
room: Report Writing for SOC L2
slug: soc-l2-report-writing
path: notes/80-blue-team/soc-l2-report-writing.md
topic: 80-blue-team
domain: [security-operations, dfir]
skills: [reporting, risk-communication, incident-response, evidence-logging, workflow]
artifacts: [concept-notes, pattern-card]
---

# Report Writing for SOC L2

## Summary

* **L2 analysts bridge the SOC and the outside world.** Their output is no longer just ticket notes; it becomes reports that influence customer action, management understanding, and DFIR response.
* The three main communication directions in this room are: **C-level / leadership communication**, **MSSP customer incident reports**, and **DFIR handover notes**.
* The target audience determines everything: language depth, urgency, evidence density, and recommended actions.
* Good L2 reporting is **clear, actionable, evidence-based, audience-aware, and time-bounded**.
* AI can help draft reports, but it must not be trusted for **containment, eradication, or factual completeness** without analyst review.
* The practical challenges in this room mainly test five recurring failure modes: **missing context, ambiguous phrasing, unnecessary text, excessive response, and unprofessional tone**.

## 1. Why This Room Matters

L1 work is usually:

* alert triage
* brief escalation notes
* ticket updates
* internal-only communication

L2 work adds external-facing responsibility:

* communicate with customers
* summarize incidents for leadership
* hand over facts to DFIR / IR / CTI / InfoSec teams
* ensure the SOC's findings can actually be acted on

A technically correct investigation with a bad report is operationally weak.

## 2. L1 vs L2 Communication Model

```text
L1 -> finds, triages, escalates
L2 -> validates, explains, coordinates, reports
```

### Core Idea

L2 is where technical detection becomes organizational action.

That means L2 analysts need:

* technical accuracy
* business translation ability
* evidence discipline
* communication discipline

## 3. Main L2 Report Types

### 3.1 C-Level / Executive Report

Audience:

* CEO
* CFO
* CISO
* CTO
* senior management

Purpose:

* explain what happened
* explain business impact
* tell them what they need to do now
* explain what SOC is doing next

#### Rules for Executive Writing

* focus on business, not tooling
* avoid jargon
* keep the tone formal and calm
* state concrete impact and urgency
* set clear expectations and timelines
* do not panic, speculate, or overreact

### 3.2 MSSP Customer Incident Report

Audience:

* customer technical contacts
* customer management contacts
* internal SOC contacts in CC

Purpose:

* start containment quickly
* communicate confirmed facts
* tell the customer exactly what actions are required
* provide update timeline

#### Two Phases of Customer Communication

##### Initial report

Used when the incident is active and response must begin immediately.

It should answer:

* what was detected
* what the immediate risk is
* what the customer must do now
* what the SOC is doing meanwhile
* when the next update will arrive

##### Final report

Used after analysis is complete.

It should answer:

* how the attack started
* who or what was affected
* whether the incident is still ongoing
* what the confirmed impact is
* what the SOC did next
* why the SOC missed or did not block it, if relevant
* how to prevent recurrence

### 3.3 DFIR Handover Notes

Audience:

* DFIR team
* incident responders
* deeper forensic investigators

Purpose:

* transfer facts, not storytelling
* provide timeline, attack artifacts, scope, and response status
* give the next team a fast technical starting point

#### DFIR Notes Should Emphasize

* case context
* attack timeline
* affected assets
* response already performed
* indicators of compromise
* unknowns / gaps

#### DFIR Notes Should Avoid

* vague speculation
* management-style filler text
* generic recommendations with no evidence value
* unsupported claims

## 4. Communication Channels

| Channel | Best use |
| --- | --- |
| Voice call | urgent coordination requiring immediate response |
| Email | formal incident communication with audit trail |
| Ticketing system | structured customer / MSSP workflow |
| Corporate chat | internal quick coordination only |

### Practical Rule

Important decisions made on calls or chat should still be summarized in email or tickets.

## 5. Anatomy of a Good Initial Customer Report

A strong first email usually follows this structure:

```text
1. Urgent subject
2. Incident summary
3. Immediate customer actions
4. What SOC is doing now
5. When next update will arrive
```

### Pattern

#### Subject

* clear
* urgent
* incident-specific

Example style:

```text
[SOC Incident] Business Email Compromise on executive mailbox
```

#### Incident Summary

Include:

* affected identity / device / service
* timestamp
* what was observed
* why it matters

#### Customer Actions

Only actions that are:

* necessary now
* reasonable now
* proportional to evidence

#### SOC Next Steps

Use concrete expectations.

Bad:

```text
we will update you once we finalize it
```

Better:

```text
we will provide the next update within 30 minutes
```

## 6. What the Final Customer Report Must Answer

The room's model can be compressed into this checklist:

```text
How did the attack start?
Who / what was affected?
Is the attack still ongoing?
What is the known impact?
Why did the SOC miss it?
What will the SOC do next?
How can reinfection be prevented?
```

This is a very strong practical checklist for final customer-facing closure emails.

## 7. Executive / C-Level Writing Principles

### 7.1 What Executives Actually Need

Executives usually care about:

* business impact
* operational disruption
* urgency
* who is affected
* whether the situation is under control
* what they need to approve or support

They generally do **not** need:

* raw process trees
* long IOC lists
* tool syntax
* unbounded speculation

### 7.2 Common Executive-Report Mistakes From the Challenge

#### Mistake 1: Missing recipient context

Example issue from the challenge:

```text
To: j.adams@customer.thm, it@customer.thm
```

Problem class: **Missing recipient**

Meaning:

* the SOC team or internal tracking audience should also stay informed
* communication should preserve accountability and thread continuity

#### Mistake 2: Missing context in wording

Example:

```text
a login
```

Problem class: **Missing context**

Why it fails:

* which service?
* VPN?
* M365?
* workstation?
* SSO portal?

Weak nouns produce weak incident understanding.

#### Mistake 3: Excessive response

Example:

```text
Perform data wipe of Tim Balmer's laptop
```

Problem class: **Excessive response**

Why it fails:

* destructive
* disproportionate to known facts
* destroys possible evidence
* may create business disruption without justification

#### Mistake 4: Unclear timeline

Example:

```text
once we finalize it
```

Problem class: **Unclear timeline**

Executives need real expectations:

* in 30 minutes
* in 2 hours
* by end of day

#### Mistake 5: Unprofessional language

Example:

```text
don't ignore this email
```

Problem class: **Unprofessional language**

Better style:

```text
Please treat the above actions as urgent.
```

## 8. DFIR Handover Writing Principles

DFIR teams are not your customer's board.

They want:

* facts
* chronology
* artifacts
* scope
* already-taken actions
* confidence level

They do not want:

* generic fear language
* padded summary text
* unsupported assumptions

### 8.1 Strong DFIR Structure

```text
Case Summary
Timeline
SOC Response
Indicators
Known gaps / unknowns
```

### 8.2 Mistakes From the DFIR Challenge

#### Mistake 1: Unnecessary filler

Example:

```text
but given the overall nature of the circumstances surrounding the incident
```

Problem class: **Unnecessary text**

Why it fails:

* zero evidentiary value
* delays relevant facts
* sounds inflated

#### Mistake 2: Ambiguous phrasing

Example:

```text
OT environment may have been affected in some way
```

Problem class: **Ambiguous phrasing**

Why it fails:

* vague blast-radius claim
* no evidence anchor
* creates more questions than answers

#### Mistake 3: Missing actor

Example:

```text
was executed
```

Problem class: **Missing actor**

Why it fails:

* by what process?
* by whom?
* by which mechanism?

In DFIR handoff, verbs need actors.

#### Mistake 4: No evidence

Example:

```text
was exfiltrated
```

Problem class: **No evidence**

Why it fails:

* exfiltration claims require support
* destination / protocol / indicator should be tied in

#### Mistake 5: Missing context for indicators

Example:

```text
Other IPs
```

Problem class: **Missing context**

Why it fails:

* role of those IPs is undefined
* DFIR cannot prioritize or interpret them

## 9. AI in SOC Report Writing

AI is useful as a drafting assistant, especially when:

* English is not the analyst's first language
* time is limited
* the structure is repetitive
* the notes are messy but rich

### AI Can Help With

* structure
* phrasing
* tone adjustment
* summarization
* audience-specific rewriting

### But AI Is Dangerous When Used Blindly

#### 9.1 Sensitive data exposure

If prompts go to cloud services, pasted case content may leave your control.

#### 9.2 Filler text inflation

AI often writes too much, says too little, and hides the point.

#### 9.3 Hallucinations

If tool behavior is not explained, AI may misclassify legitimate activity as malicious.

#### 9.4 Destructive containment

AI may recommend operationally harmful actions that sound "secure" but are incorrect.

Example failure pattern:

```text
binary looks malicious -> quarantine core OS file -> system breaks
```

### Safe Rule

```text
AI drafts. Analyst decides.
```

## 10. What Good Context Looks Like for AI Prompts

A useful prompt should include as much validated context as possible.

Suggested context buckets:

* customer profile
* asset role
* user role
* incident timeline
* monitoring notes
* threat intelligence context
* historical similar incidents
* containment constraints
* target audience
* desired output length and tone

## 11. Report Patterns You Can Reuse

### 11.1 Executive Summary Pattern

```text
- What happened
- Why it matters to the business
- What the customer / leadership should do now
- What the SOC is doing next
- When the next update will arrive
```

### 11.2 Customer Initial Incident Email Pattern

```text
Subject: [SOC Incident] [confirmed threat] on [asset]

Dear Customer,

We are writing to notify you of a confirmed security incident affecting [asset or user]. At [time], our SOC observed [fact pattern]. The activity indicates [risk statement]. If not addressed promptly, this may result in [business or technical impact].

Immediate actions required from your side:
1. [action 1]
2. [action 2]

What we are doing meanwhile:
1. [SOC step 1]
2. [SOC step 2]

We will share the next update within [time-bound SLA].
```

### 11.3 DFIR Handover Pattern

```text
Case Summary
- one short factual paragraph

Timeline
- timestamped entries
- host / user / action / evidence

SOC Response
- isolation / blocking / customer comms / scope notes

Indicators
- files
- hashes
- IPs
- domains
- persistence
- tooling

Known Gaps
- limited logging
- missing sensor coverage
- unknown assets not yet confirmed
```

## 12. Practical Takeaways From the Room

* L2 is the first SOC tier where report writing becomes a core operational skill.
* External communication must be **auditable**, usually through email or ticketing.
* Initial reports start containment.
* Final reports close the incident loop.
* Executive reports should be **simple, formal, calm, and business-centered**.
* DFIR handover notes should be **dense with evidence, light on style flourishes**.
* AI is useful only when the analyst remains the final reviewer.

## 13. High-Value Editing Checklist

Before sending any L2 report, ask:

### Audience Fit

* Is this written for executives, customers, or DFIR?
* Does the level of technical detail match that audience?

### Actionability

* Does the reader know exactly what to do next?
* Are requested actions specific and realistic?

### Evidence Quality

* Are key claims supported by observed facts?
* Are speculation and unknowns clearly separated?

### Clarity

* Are vague phrases removed?
* Are timelines concrete?
* Are systems/services named precisely?

### Professional Tone

* no slang
* no panic language
* no filler
* no passive voice where actor matters

## 14. Mini Pattern Cards

### Pattern Card 1: Executive incident email

**Goal:** fast business understanding and immediate action.

**Use when:** leadership or customer management needs a concise update.

**Avoid:** raw IOCs, uncertain speculation, drastic remediation without basis.

### Pattern Card 2: DFIR handover

**Goal:** transfer investigative value, not presentation polish.

**Use when:** another technical response team is taking over or expanding the case.

**Avoid:** filler, unsupported exfiltration claims, unlabeled indicators.

### Pattern Card 3: AI draft review

**Goal:** convert generated text into analyst-grade output.

**Check for:**

* invented facts
* harsh containment
* wrong confidence level
* duplicated content
* hidden vague wording

## 15. Suggested Personal SOP for Your Own SOC Notes

For your own future writeups, a strong default pipeline is:

```text
1. Timeline first
2. Confirm evidence per claim
3. Decide audience
4. Draft short version
5. Expand only where needed
6. Remove filler
7. Add explicit next steps and ETA
8. Final QA
```

## 16. Takeaways

* In blue-team work, communication is part of the technical response surface.
* A sloppy report can delay containment as much as a missed alert.
* The best L2 reports are not the longest; they are the ones that let the next reader act immediately.
* Executive writing optimizes for clarity and confidence.
* DFIR writing optimizes for evidence transfer.
* AI can save time, but it should never own judgment.

## 17. Related Tools

* SIEM
* EDR
* ticketing systems
* secure email / case portals
* threat intel platforms
* internal wiki / incident knowledge base

## 18. Further Reading

* NIST incident response recommendations and considerations
* CISA incident response playbooks
* internal MSSP reporting templates and peer-review checklists

## 19. CN-EN Glossary

* Executive Summary: 高层摘要 / 管理层摘要
* Incident Summary: 事件摘要
* Handover Notes: 交接记录
* MSSP: 托管安全服务提供商
* DFIR: 数字取证与事件响应
* Evidence: 证据
* Indicator of Compromise (IOC): 入侵指标
* Containment: 遏制
* Eradication: 根除
* Remediation: 修复
* Escalation: 升级上报
* Audit Trail: 审计留痕
* Playbook: 处置剧本
* Timeline: 时间线
* Business Impact: 业务影响
* Ambiguous Phrasing: 模糊表述
* Excessive Response: 过度响应
* Missing Context: 缺少上下文
* Unprofessional Language: 不专业措辞

## 20. SOC Report Templates Pack

This section adds three ready-to-use English templates for common SOC L2 reporting scenarios. They are written to be practical, short enough to use under pressure, and structured so they can be adapted quickly without losing professionalism.

### General Usage Rules

Before sending any of these templates:

* replace all fill-in labels
* remove any section that you cannot support with evidence
* mark assumptions clearly if something is not yet confirmed
* keep timelines concrete
* make sure the recipients and CC list are correct
* verify that all requested actions are proportional to the evidence

---

### Template 1: Executive / C-Level Incident Summary

**When to use:** leadership needs a concise, business-facing incident summary.

**Audience:** CISO, CTO, CIO, CEO, senior business leadership.

**Goal:** explain what happened, why it matters to the business, what the immediate business risk is, what the SOC is doing next, and when the next update will arrive.

**Copy-ready template**

```text
To: [executive recipients]
CC: [security leadership], [soc mailbox]
Subject: [severity] Security Incident Update - [incident type] affecting [business unit or asset]

Dear [recipient name or team],

At [time UTC] on [date UTC], the SOC identified and confirmed a security incident involving [affected user, system, or service]. Based on the evidence currently available, the activity is consistent with [short incident description].

Business impact at this stage:
- [impact point 1]
- [impact point 2]
- [impact point 3]

Current status:
- Incident status: [active / contained / under investigation / recovered]
- Affected scope currently confirmed: [known scope]
- Ongoing risk: [yes or no, with short reason]

Actions already taken by the SOC:
- [SOC action 1]
- [SOC action 2]
- [SOC action 3]

Actions requested from leadership or business owners:
- [request 1]
- [request 2]

Next steps:
- [next step 1]
- [next step 2]
- [next step 3]

The next formal update will be provided by [next update time or timeframe].

Please let us know if you would like this update delivered in a call format as well.

Best regards,
[SOC team name]
[contact details]
```

**Field guide**

* `[short incident description]` should be one sentence, not a paragraph.
* `[known scope]` should only include confirmed assets or users.
* `[ongoing risk]` should avoid speculation.
* `[next update time or timeframe]` should be explicit, such as `within 30 minutes`, `by 15:00 UTC`, or `by end of day UTC`.

**Good example phrases**

* `The incident is currently contained to one user workstation.`
* `No evidence of domain-wide spread has been confirmed at this time.`
* `The main business risk is temporary disruption to finance operations and possible exposure of mailbox data.`

**Avoid**

* raw IOCs without explanation
* slang
* vague language such as `something suspicious happened`
* overly destructive recommendations without forensic basis

---

### Template 2: Customer Incident Notification and Containment Email

**When to use:** an MSSP customer or external client needs active incident-response communication.

**Audience:** customer IT contact, customer security contact, MSSP internal SOC mailbox.

**Goal:** notify the customer quickly, state confirmed facts only, ask for immediate containment support, explain what the SOC is doing in parallel, and preserve an audit trail.

**Copy-ready template**

```text
To: [customer primary contact]
CC: [customer security contact], [soc mailbox], [case owner]
Subject: [SOC Incident] [incident type] detected on [asset name]

Dear Customer,

We are writing to notify you of a confirmed security incident affecting your environment.

At [time UTC] on [date UTC], our SOC identified and confirmed [incident type] involving [asset name] ([asset role]) associated with [user name or service account]. The activity observed includes [short technical summary]. Based on the current evidence, this may result in [potential impact] if not addressed promptly.

Immediate actions required from your side:
1. [customer action 1]
2. [customer action 2]
3. [customer action 3]

What we are doing meanwhile:
1. [SOC action 1]
2. [SOC action 2]
3. [SOC action 3]

Current case status:
- Incident status: [active / contained / under investigation]
- Confirmed affected assets: [confirmed scope]
- Evidence of lateral movement: [yes / no / not confirmed]
- Evidence of data exposure or exfiltration: [yes / no / under review]

Expected next update:
We will share the next case update by [next update time or timeframe].

Please treat the requested actions as urgent. If needed, we are available for a call at [contact path].

Best regards,
[SOC team name]
[analyst name]
[case ID]
```

**Optional follow-up block for the final customer report**

If you want to reuse the same email thread for the final closure report, append the following section after the investigation is complete.

```text
Final Incident Summary
The investigation determined that the incident started when [root cause]. The confirmed affected assets were [final scope]. The confirmed impact was [confirmed impact]. The incident is now [final status], and no additional malicious activity has been observed since [time UTC].

Root Cause and Contributing Factors
- [root cause point 1]
- [root cause point 2]
- [detection or control gap]

Long-Term Recommendations
- [recommendation 1]
- [recommendation 2]
- [recommendation 3]
```

**Field guide**

* `[short technical summary]` should be 1-2 sentences maximum.
* `[potential impact]` should translate the detection into business or operational risk.
* `[customer actions]` should be doable right now.
* `[confirmed scope]` should never silently mix confirmed and assumed hosts.

**Good example phrases**

* `The host has been isolated, but stolen credentials cannot be recovered and must be rotated.`
* `At this time, one mailbox and one workstation are confirmed affected.`
* `Evidence of outbound data transfer is under review; no confirmed exfiltration has been established yet.`

**Avoid**

* `do not ignore this email`
* `wipe the laptop immediately` unless there is strong justification and forensic ownership is settled
* `a login was observed` without naming the service or portal
* `we will update you once we finalize it`

---

### Template 3: DFIR Handover Notes

**When to use:** a serious case is being transferred to an internal or external DFIR team.

**Audience:** DFIR consultants, incident responders, forensic investigators, internal IR / threat hunting teams.

**Goal:** transfer evidence, not presentation polish; provide enough context for the next team to continue fast; preserve the chronology of what was observed and what was already done.

**Copy-ready template**

```text
To: [DFIR team mailbox]
CC: [soc mailbox], [case owner], [IR manager]
Subject: [Handover Notes] [incident type] - [customer or environment name]

Case Summary
[one short paragraph summarizing incident type, scope, status, and why DFIR is needed]

Environment and Monitoring Context
- Customer / environment: [name]
- Monitored scope: [what the SOC can see]
- Primary log sources used: [SIEM, EDR, proxy, email, and other sources]
- Coverage gaps or blind spots: [known limitations]

Attack Timeline
[timestamp 1] | [host or user]
[factual event 1]

[timestamp 2] | [host or user]
[factual event 2]

[timestamp 3] | [host or user]
[factual event 3]

[timestamp 4] | [host or user]
[factual event 4]

Attack Scope
- Confirmed affected hosts: [host list]
- Confirmed affected users / identities: [user list]
- Potentially affected assets not yet confirmed: [potential scope]
- Sensitive systems or business processes involved: [sensitive scope]

SOC Response Already Performed
- [response action 1]
- [response action 2]
- [response action 3]
- Current host / user status: [isolated, disabled, monitored, and related states]

Indicators and Artifacts
- Malicious file(s): [file paths]
- Hashes: [MD5, SHA1, SHA256 as available]
- Domains: [domain list]
- IPs with role labels: [C2 IP], [staging IP], [phishing source IP], [exfiltration destination IP]
- Persistence: [task, service, run key, WMI, or similar]
- Commands / scripts observed: [key commands]
- Related alerts / case links: [links or IDs]

Known Unknowns
- [unknown point 1]
- [unknown point 2]
- [unknown point 3]

Evidence Confidence Notes
- Confirmed: [what is directly supported]
- Inferred: [what is reasonable but not fully confirmed]

Best regards,
[SOC team name]
[analyst name]
[case ID]
```

**Field guide**

* `Case Summary` should be one dense paragraph, not a narrative essay.
* Every timeline entry should include **time + actor or host + observed action**.
* Every IP or domain should have a role label when possible.
* Separate `confirmed` from `inferred` to reduce handover friction.

**Good example phrases**

* `EDR blocked execution of the ransomware binary on INT-FS-02.`
* `Exfiltration to 185.220.101.47:4444 is inferred from reverse-shell telemetry and outbound connection logs.`
* `The customer shut down the data center after phone confirmation with the SOC.`

**Avoid**

* `may have been affected in some way`
* `other IPs`
* `was executed` without saying by what process or mechanism
* unsupported exfiltration claims
* generic recommendations that a DFIR team already knows

## 21. Quick Selection Matrix

| Situation | Best template |
| --- | --- |
| Leadership needs a non-technical status update | Template 1 |
| Customer must take immediate containment action | Template 2 |
| Another technical response team is taking over | Template 3 |

## 22. Reusable Placeholder Set

You can standardize the following descriptive fields across your own notes and drafts:

```text
case ID
incident type
severity
time UTC
date UTC
asset name
asset role
user name
confirmed scope
potential impact
root cause
next update time or timeframe
SOC action
customer action
DFIR team mailbox
```

Using a stable fill-in vocabulary makes your drafts easier to automate, review, and convert into final reports.

## 23. Final Takeaway

A good SOC template does three things well:

* reduces writing friction during pressure
* preserves professional quality under time constraints
* prevents common communication failures such as vague wording, missing context, unsupported claims, and unclear ownership

These templates are meant to be adapted, not copied blindly. The more serious the incident, the more important it is to cut filler and keep every sentence anchored to evidence, action, or decision.
