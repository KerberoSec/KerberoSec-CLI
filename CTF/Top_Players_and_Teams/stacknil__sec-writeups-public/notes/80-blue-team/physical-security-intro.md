---
status: done
created: 2026-04-12
updated: 2026-04-12
date: 2026-04-12
platform: tryhackme
room: Physical Security Intro
slug: physical-security-intro
path: notes/80-blue-team/physical-security-intro.md
topic: 80-blue-team
domain: [access-control, foundations, security-operations]
skills: [security-models, risk-basics, compliance]
artifacts: [concept-notes, pattern-card, room-notes]
type: resource-note
source: User-provided room text and screenshots
next_action: Build a follow-up note on lock anatomy and non-destructive physical security concepts
---

# Physical Security Intro

## Summary

* This room is a **beginner introduction** to physical security in the context of red teaming and security assessments.
* The core message is simple: physical security is often ignored, but it can become a major weak point even when cyber controls look strong.
* The most important conceptual distinction in this room is the difference between **overt**, **covert**, and **surreptitious** entry.
* The room is introductory and resource-driven. It points learners toward well-known public educators and communities for further study.
* From a professional perspective, the first lesson is not "how to bypass barriers," but **how to classify entry methods, how to reason about detectability, and how to stay within legal authorization**.

```text
Physical security weakness
    -> barrier can be bypassed
    -> access is gained
    -> cyber compromise may follow
```

---

## 1. Why Physical Security Matters

Many security learners focus almost entirely on networks, applications, and endpoints. That is understandable, but incomplete.

A secure environment is not only:

* patched systems,
* strong passwords,
* MFA,
* EDR,
* segmentation.

It is also:

* controlled building access,
* secure storage of keys and badges,
* resistant locks and barriers,
* monitored entry points,
* staff awareness of tailgating and suspicious behavior.

In other words, **physical access can collapse digital trust boundaries**.

### Practical security principle

If an attacker can physically reach the wrong room, wrong cabinet, or wrong device, many logical protections become easier to defeat.

---

## 2. Ethical Framing

This room should be read with one constant boundary in mind:

**physical security testing only makes sense with explicit authorization.**

That matters for both red team work and independent learning.

### Minimum ethical model

* only test systems, doors, locks, or barriers you own, or are explicitly permitted to test
* avoid damage unless destructive testing is clearly authorized
* document methods and observations responsibly
* separate education from misuse

This is especially important in physical security, because even simple actions can cross legal lines very quickly.

---

## 3. Entry Classifications

The room introduces three fundamental entry types.

| Entry type | Meaning | Visibility after the event |
| --- | --- | --- |
| Overt | causes obvious damage or destruction | obvious to almost anyone |
| Covert | not obvious to untrained observers, but detectable by trained investigation | hidden at first, later discoverable |
| Surreptitious | designed to leave no observable evidence even under trained scrutiny | ideally undetectable |

### Mental model

```text
Overt         = obvious force
Covert        = hidden from casual observers
Surreptitious = hidden even from forensic review
```

This classification is more important than it first appears. It affects:

* detection likelihood
* incident response assumptions
* attribution difficulty
* post-event forensic confidence

---

## 4. Task 2 Answer Mapping

The room uses a fixed multiple-choice mapping:

| Number | Entry class |
| --- | --- |
| 1 | Overt |
| 2 | Covert |
| 3 | Surreptitious |

### Question set and answers

| Scenario | Classification | Answer |
| --- | --- | --- |
| Using an angle grinder to cut a lock open | Overt | 1 |
| Lock picking | Covert | 2 |
| Lock bypassing | Covert | 2 |
| Taking a photo of a key, decoding it, and duplicating it | Surreptitious | 3 |
| Determining a safe combination through surveillance | Surreptitious | 3 |
| Breaking a window to gain entry | Overt | 1 |

---

## 5. How to Think About These Examples

### 5.1 Overt

Overt methods are the easiest to classify.

Examples in the room:

* angle grinder on a lock
* breaking a window

These actions produce immediate visible evidence. Even an untrained person can usually tell that forced entry occurred.

**Security implication**
: overt entry is noisy, fast, and often effective, but it strongly increases detection and post-incident certainty.

### 5.2 Covert

Covert methods aim to avoid obvious visible damage.

Examples in the room:

* lock picking
* lock bypassing

A casual observer may not notice anything unusual. However, a trained investigator may still identify traces, manipulation, or other signs.

**Security implication**
: covert entry is often the practical middle ground in real assessments: less visible than brute force, but not perfectly invisible.

### 5.3 Surreptitious

Surreptitious entry is the hardest category and the most conceptually important.

Examples in the room:

* duplicating a key from visual information
* learning a safe combination through surveillance

The defining feature is not just "stealth," but **lack of attributable physical evidence**.

**Security implication**
: this category is dangerous for defenders because the barrier may appear untouched even after compromise.

---

## 6. Defensive Reading of the Same Concepts

This room is framed from the attacker-testing perspective, but the same material is useful for defenders.

### Defender questions

When reviewing a physical control, ask:

1. If this barrier fails, will the failure be obvious?
2. Could a bypass occur without visible damage?
3. If access happened, would we notice later during review?
4. Are there logs, cameras, seals, or procedures that reduce ambiguity?

### Detection-oriented perspective

| Control weakness | Defensive concern |
| --- | --- |
| Weak barrier only resists force | may stop overt entry, but not covert entry |
| No monitoring or seals | surreptitious access may go unnoticed |
| Poor incident documentation | covert entry may never be recognized correctly |

---

## 7. Red Team Usefulness

Why does this matter in a red team context?

Because physical access can support:

* badge theft or badge cloning opportunities
* workstation access
* rogue device placement
* key or document access
* password recovery material exposure
* internal network footholds

This is why physical security belongs in the larger attack chain.

```text
Physical weakness
   -> local access
   -> device or credential exposure
   -> internal foothold
   -> broader compromise
```

---

## 8. Beginner Resources Mentioned in the Room

The room points to several well-known public resources for introductory learning:

* **Deviant Ollam**
* **Patrick McNeil**
* **TOOOL** (The Open Organisation Of Lockpickers)

These are useful for:

* terminology
* legal/ethical framing
* non-destructive locksport basics
* understanding how physical barriers are designed and assessed

### Resource strategy

A good beginner path is:

1. learn vocabulary and classification first
2. understand legal and ethical boundaries
3. study lock and hardware anatomy conceptually
4. only then move to hands-on practice in authorized environments

---

## 9. Key Takeaways for Security Work

### 9.1 Physical security is not "extra" security

It is part of the same security model.

### 9.2 Entry method classification matters

The difference between overt, covert, and surreptitious entry changes how defenders interpret incidents.

### 9.3 Damage is not the only sign of compromise

A barrier can fail without obvious destruction.

### 9.4 Detection and evidence preservation matter

If a method is covert or surreptitious, the main defensive challenge becomes **visibility**, not only barrier strength.

### 9.5 Authorization is non-negotiable

This subject is professionally useful only when tied to lawful testing, defensive design, or sanctioned training.

---

## 10. Pattern Cards

### Pattern Card: Overt entry

**Definition:** physical access method that causes visible destruction
**Examples:** cutting, smashing, breaking
**Defender advantage:** easy post-event recognition
**Defender challenge:** may still be fast enough to matter

### Pattern Card: Covert entry

**Definition:** low-visibility entry, detectable mainly through skilled review
**Examples:** lock picking, some non-destructive bypasses
**Defender advantage:** may still leave forensic evidence
**Defender challenge:** casual staff may miss it completely

### Pattern Card: Surreptitious entry

**Definition:** entry designed to leave no detectable sign
**Examples:** intelligence-driven key duplication, combination recovery via surveillance
**Defender advantage:** very limited unless layered monitoring exists
**Defender challenge:** strongest ambiguity after the event

---

## 11. CN-EN Glossary

* Physical security: 实体安全 / 物理安全
* Red team engagement: 红队演练 / 红队任务
* Overt entry: 显性进入 / 破坏性进入
* Covert entry: 隐蔽进入
* Surreptitious entry: 秘密进入 / 难以取证的隐匿进入
* Barrier: 物理屏障
* Forensic investigation: 取证调查
* Detectability: 可检测性
* Authorization: 授权
* Locksport: 锁艺 / 非破坏性开锁竞技
* Bypass: 绕过
* Access control: 门禁控制
* Credential exposure: 凭证暴露
* Foothold: 初始立足点

---

## 12. Takeaways

This room is intentionally basic, but the foundation is good.

The real value is not memorizing a few multiple-choice answers. The value is learning a security lens:

* **How visible is an entry method?**
* **Would defenders notice it?**
* **Would investigators later prove it?**
* **What physical weakness could become digital compromise?**

That is the right mental transition from hobby curiosity to professional security reasoning.

---

## 13. Minimal Study Checklist

```text
[ ] I can define overt, covert, and surreptitious entry.
[ ] I can classify simple examples correctly.
[ ] I understand why physical security matters in red team work.
[ ] I understand why legal authorization matters.
[ ] I can explain how physical access may enable cyber compromise.
```

---

## 14. Suggested Next Note

A strong follow-up note would cover:

* basic lock anatomy
* common lock families
* entry evidence and forensic traces
* physical-to-digital attack chaining
* security controls that improve detection, not only resistance
