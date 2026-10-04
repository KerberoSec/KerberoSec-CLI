---
type: resource-note
status: done
created: 2026-02-21
updated: 2026-03-12
tags: [security-writeup, tryhackme, security-basics, threat-modeling]
source: TryHackMe: Security Principles
platform: tryhackme
room: Security Principles
slug: security-principles
path: TryHackMe/00-foundations/security-principles.md
topic: 00-foundations
domain: [foundations, grc]
skills: [cia-triad, security-models, zero-trust, risk-basics, secure-by-design]
artifacts: [concept-notes, pattern-card]
sanitized: true
---

# Security Principles

## Summary

* “Secure” is relative to an adversary model (threat model): protecting against toddlers and industrial espionage are different problems.
* The CIA triad (Confidentiality, Integrity, Availability) is a minimal mental model for judging security goals; DAD (Disclosure, Alteration, Destruction/Denial) is a clean way to label attacks.
* Authenticity and Nonrepudiation extend CIA by answering “is it real?” and “can the sender deny it later?”
* Security models (Bell-LaPadula, Biba, Clark-Wilson) encode policies as rules; they trade off practicality vs strict guarantees.
* Defence-in-Depth and Zero Trust are architectural mindsets: multiple barriers + continuous verification.
* ISO/IEC 19249 provides a catalogue of secure architecture/design principles that can be mapped to concrete controls.
* Risk is a function of likelihood and impact; it emerges when a threat can exploit a vulnerability.

## Key Concepts

### 1.1 Start with an adversary model (Threat Modeling / 威胁建模)

* Security is not absolute; it is an optimization problem under constraints (time, money, usability).
* The right question: “Secure against whom, for what assets, under what assumptions?”
* Practical shorthand: define assets, adversaries, trust boundaries, and success criteria.

### 1.2 CIA triad (Confidentiality / Integrity / Availability)

* Confidentiality: only authorized parties can access data.
* Integrity: data cannot be changed without authorization; changes are detectable.
* Availability: systems/services are usable when needed.

Trade-off reality:

* Maxing confidentiality/integrity can reduce availability (e.g., strict controls slow operations).
* Maxing availability can increase exposure (more open pathways, larger attack surface).

Applied examples (compressed)

* E-commerce order

  * C: protect payment data from disclosure.
  * I: prevent attackers from altering shipping address/order contents.
  * A: ensure store/app is reachable to complete purchases.

* Patient records

  * C: legal + ethical confidentiality.
  * I: wrong edits can cause wrong treatment (safety-critical).
  * A: doctors need access at point-of-care.

### 1.3 Beyond CIA: Authenticity & Nonrepudiation

* Authenticity: data/action is genuine and from the claimed source.
* Nonrepudiation: parties cannot plausibly deny involvement after the fact.

Operational intuition:

* Low-stakes commerce might tolerate some fake orders; high-stakes logistics ("1000 cars") cannot.
* Digital signatures are a classic way to support nonrepudiation + integrity + origin authentication.

### 1.4 Parkerian Hexad (Parkerian Hexad / 帕克六要素)

Extends CIA into six attributes:

* Confidentiality
* Integrity
* Availability
* Authenticity
* Possession/Control (who physically/logically controls the data)
* Utility (data is usable in the required form)

Two extra attributes worth remembering:

* Utility: encrypted disk is “available” physically but useless without the key.
* Possession: ransomware can keep your data in-place while you lose control over it.

### 1.5 DAD triad (Disclosure / Alteration / Destruction-Denial)

* Disclosure ↔ attacks confidentiality
* Alteration ↔ attacks integrity
* Destruction/Denial ↔ attacks availability

Fast classification examples:

* Customer records leaked online → Disclosure.
* Attacker changes bank transfer recipient → Alteration.
* Backup + main power switched off, network down → Destruction/Denial.

### 1.6 Fundamental security models (security policy as rules)

Bell-LaPadula (BLP): confidentiality-first

* Simple Security Property: “no read up”
* Star (*) Property: “no write down”
* Discretionary Security Property: access matrix controls discretionary read/write

Mnemonic: “write up, read down.”

Biba: integrity-first

* Simple Integrity Property: “no read down”
* Star Integrity Property: “no write up”

Mnemonic: “read up, write down.”

Clark-Wilson: commercial integrity via well-formed transactions

* CDI (Constrained Data Item): protected data with integrity requirements
* UDI (Unconstrained Data Item): external/user input
* TP (Transformation Procedure): the only allowed way to transform UDIs/CDIs into valid CDIs
* IVP (Integrity Verification Procedure): checks CDIs remain valid

Operational idea: enforce separation of duties + only certified procedures can modify protected data.

### 1.7 Defence-in-Depth (DiD / 纵深防御)

* Multiple layers of controls across people/process/technology.
* Goal is not “impenetrable.” Goal is: increase attacker cost, reduce blast radius, improve detection.

Typical layers (example mapping):

* Identity: MFA, least privilege
* Endpoint: patching, EDR
* Network: segmentation, firewalling
* Application: secure SDLC, input validation
* Data: encryption, backups
* Monitoring/Response: logs, SIEM, playbooks

### 1.8 ISO/IEC 19249: architecture & design principles

Architectural principles (5):

1. Domain Separation
2. Layering
3. Encapsulation
4. Redundancy
5. Virtualization

Design principles (5):

1. Least Privilege
2. Attack Surface Minimisation
3. Centralized Parameter Validation
4. Centralized General Security Services
5. Preparing for Error and Exception Handling (fail-safe)

Room Q/A mapping (for quick recall):

* Turning off an insecure non-critical server → (2) Attack Surface Minimisation.
* New sales rep gets only product/price access → (1) Least Privilege.
* ATM code handles power/network failures carefully → (5) Error/Exception Handling.

### 1.9 Trust but Verify vs Zero Trust

* Trust but Verify: treat trust as practical necessity; compensate with logging/monitoring and periodic review.
* Zero Trust (ZTA): treat implicit trust as a vulnerability; require continuous authentication/authorization.

Implementation concept: microsegmentation

* Make segments as small as a host/service.
* Enforce policy for every flow (identity, device posture, context).

Business constraint:

* Zero Trust has a “friction budget.” Apply where value is high and workflows can tolerate controls.

### 1.10 Vulnerability vs Threat vs Risk

* Vulnerability: weakness (a condition you can fix or mitigate).
* Threat: potential danger actor/event that could exploit a weakness.
* Risk: likelihood × impact when a threat exploits a vulnerability.

Concrete example:

* Vulnerability: unpatched database with known exploit.
* Threat: adversaries using published PoC.
* Risk: probability of exploitation and the business impact (patient safety + legal exposure).

### 1.11 Shared Responsibility Model (cloud)

* Cloud security responsibilities split between provider and customer.
* Responsibilities shift by service model:

  * IaaS: customer owns OS hardening, patching, network security, workload config.
  * PaaS: provider manages more runtime/platform; customer owns app config, identity, data handling.
  * SaaS: provider manages most stack; customer owns identity, access, data governance.

## Pattern Cards

### 2.1 “Asset → CIA priorities” card

* Identify asset category: {money movement, safety-critical, PII, IP, public content}.
* Assign weights wC, wI, wA (0-3 scale).
* Choose controls that match the dominant weight.

Example: patient record system → high wC + high wI + high wA.

### 2.2 “Attack → DAD classification” card

* If data leaked → Disclosure.
* If data changed → Alteration.
* If service unavailable/destroyed → Destruction/Denial.

Use case: incident triage narratives become consistent and less emotional.

### 2.3 “Model selection” card

* Need confidentiality enforcement across levels → think BLP.
* Need integrity enforcement across levels → think Biba.
* Need commercial integrity + auditability + separation of duties → think Clark-Wilson.

### 2.4 “ISO/IEC 19249 mapping” card

* Domain Separation → sandboxing, privilege rings, tenancy boundaries.

* Layering → OSI-like stacks, app tiers, policy points.

* Encapsulation → stable APIs, no direct DB writes.

* Redundancy → HA pairs, multi-AZ, backups + restore tests.

* Virtualization → isolation, detonation, controlled observability.

* Least Privilege → RBAC/ABAC, scoped tokens.

* Attack Surface Minimisation → disable unused services/features.

* Centralized Parameter Validation → shared validation library/gateway.

* Centralized Security Services → centralized authn/authz/logging.

* Error/Exception Handling → fail-safe defaults + non-leaky errors.

### 2.5 “Risk math” card

* Risk ≈ Likelihood × Impact.
* Reduce likelihood: patching, MFA, segmentation.
* Reduce impact: backups, redundancy, least privilege, containment.

## Command Cookbook

### 3.1 Integrity checks (file hashing)

```bash
# Generate hash
sha256sum <FILE>

# Verify against known-good hash (example)
echo "<KNOWN_HASH>  <FILE>" | sha256sum -c
```

### 3.2 Availability quick checks

```bash
# Is the service listening?
ss -lntp | head

# Basic HTTP check
curl -I https://example.com
```

### 3.3 Minimal logging sanity (Linux)

```bash
# Recent auth events (system-dependent)
sudo journalctl -u ssh --since "1 hour ago" --no-pager | tail
```

(Keep this cookbook minimal; the room is conceptual. Add tooling only when you have a real lab context.)

## Evidence

* No room-provided artifacts were attached in this message.
* If you later add screenshots, store them under `assets/` and redact identifiers.

## Takeaways

* Security language becomes useful when it is operational: classify goals (CIA/Hexad), classify attacks (DAD), then map controls.
* Models and principles are not “theory-only.” They are vocabulary for designing systems and explaining trade-offs.
* Risk framing prevents cargo-cult security: prioritize based on likelihood and impact.

## References

* NIST Glossary: Confidentiality / Integrity / Availability / Authenticity / Non-repudiation / Defense-in-Depth / Threat / Risk.
* NIST SP 800-207: Zero Trust Architecture.
* ISO/IEC TS 19249:2017 overview page + technical specification.
* University lecture notes on BLP/Biba/Clark-Wilson (for formal rule statements).
* Cloud shared responsibility documentation (AWS, Microsoft Azure).

## CN: EN Glossary (mini)

* CIA Triad: 机密性/完整性/可用性
* Confidentiality: 机密性
* Integrity: 完整性
* Availability: 可用性
* DAD Triad: 泄露/篡改/破坏或拒绝服务
* Disclosure: 泄露
* Alteration: 篡改
* Destruction/Denial: 破坏/拒绝服务
* Authenticity: 真实性/源可信
* Nonrepudiation: 不可否认性
* Parkerian Hexad: 帕克六要素
* Possession/Control: 占有/控制权
* Utility: 可用性（信息是否“可用/有用”的形式）
* Security Model: 安全模型
* Bell-LaPadula (BLP): Bell-LaPadula 机密性模型
* Biba Model: Biba 完整性模型
* Clark-Wilson Model: Clark-Wilson 商业完整性模型
* Defence-in-Depth (DiD): 纵深防御
* Zero Trust (ZTA): 零信任架构
* Microsegmentation: 微分段
* Vulnerability: 漏洞/脆弱性
* Threat: 威胁
* Risk: 风险
* Shared Responsibility Model: 共同责任模型
