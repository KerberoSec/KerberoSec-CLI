# Module 2: Threats and Risks

> **Portfolio scope:** Technical learning notes for governance, threat modelling, risk management, and vulnerability management. No TryHackMe flags or copied task answers are included.

## Module coverage

This module linked four disciplines that are frequently handled separately but should operate as one system:

- governance and regulation;
- threat modelling;
- risk management;
- vulnerability management.

The central lesson is that a vulnerability scanner does not determine business risk by itself. Risk depends on the asset, threat scenario, weakness, exposure, safeguards, and consequence. Governance assigns authority and accountability for deciding what to do.

---

## 1. Governance, policy, standards, and evidence

Security governance defines how decisions are made and who is accountable. A typical hierarchy is:

- **Policy:** mandatory management intent, such as requiring least privilege and incident reporting.
- **Standard:** specific mandatory requirements, such as approved TLS versions or password-storage methods.
- **Procedure:** repeatable steps for performing a task, such as offboarding an employee.
- **Guideline:** recommended practice that allows justified variation.
- **Control evidence:** logs, tickets, configurations, reviews, and test results showing that requirements operate.

A policy without an owner, enforcement mechanism, exception process, and evidence requirement is difficult to govern.

### Example control definition

**Control objective:** Restrict production administrative access.

**Implementation:** Administrators use separate privileged accounts, phishing-resistant MFA, managed workstations, and just-in-time elevation.

**Evidence:** Identity-provider logs, privileged-access activation records, device-compliance events, quarterly access reviews, and alerts for emergency-account use.

**Owner:** Head of Infrastructure.

**Review frequency:** Quarterly and after major architecture changes.

**Exception process:** Time-limited approval with documented risk and compensating controls.

This structure turns a general requirement into an auditable control.

### Regulation versus security

Compliance establishes obligations and minimum expectations, but passing an audit does not prove the absence of exploitable risk. A control may exist on paper yet be poorly scoped, bypassable, or unsupported by telemetry. Engineering validation must therefore complement compliance review.

---

## 2. Threat modelling methodology

Threat modelling is a structured way to identify what can go wrong before or during implementation. A practical process answers four questions:

1. What are we building or protecting?
2. What can go wrong?
3. What will we do about it?
4. Did the controls work?

### Step 1: Define scope and assumptions

Record:

- system purpose;
- users and administrators;
- sensitive data;
- external dependencies;
- deployment model;
- trust assumptions;
- out-of-scope components;
- security and availability objectives.

Hidden assumptions are a common source of design flaws. For example, “traffic from the internal network is trusted” is a threat-model assumption that should be challenged.

### Step 2: Build a data-flow model

A data-flow diagram (DFD) normally contains:

- external entities;
- processes;
- data stores;
- data flows;
- trust boundaries.

For each flow, document protocol, authentication, data classification, encryption, and authorization. Trust boundaries deserve special attention because they mark a change in control or privilege.

### Step 3: Identify threats with STRIDE

STRIDE provides a systematic prompt:

| Category | Security property | Example question |
|---|---|---|
| Spoofing | Authentication | Can an attacker impersonate a user, service, or device? |
| Tampering | Integrity | Can requests, configuration, or stored data be modified? |
| Repudiation | Accountability | Can an actor deny an action because logging is incomplete? |
| Information Disclosure | Confidentiality | Can sensitive data cross a boundary without protection? |
| Denial of Service | Availability | Can a dependency, queue, or resource be exhausted? |
| Elevation of Privilege | Authorization | Can a low-privileged subject gain a higher privilege? |

STRIDE is not a risk score. It identifies candidate threats that still require context and prioritization.

### Step 4: Model attack paths

A threat becomes more useful when written as a chain:

> An internet attacker sends a crafted document to an employee. The document executes code through an unpatched parser, steals a browser session, accesses the cloud console, and modifies a storage policy to expose sensitive data.

This chain can be decomposed into preventive and detective controls at each step. MITRE ATT&CK can help map behaviors and telemetry, but it does not replace business-impact analysis.

### Step 5: Write actionable threat statements

A strong threat statement includes:

- threat actor or initiating condition;
- attack vector;
- affected component;
- exploited weakness;
- security consequence;
- relevant control gap.

Example:

> A compromised build account could publish a modified package because release signing and independent approval are absent, causing downstream systems to execute untrusted code.

### Step 6: Select treatments

Treatments include:

- avoid the risky function;
- mitigate with design or operational controls;
- transfer part of the financial consequence;
- accept the residual risk with authority and expiry date.

A control should be mapped to a specific threat and have a validation method.

---

## 3. Risk analysis

Risk is frequently described as a function of likelihood and impact, but both terms require evidence.

### Likelihood factors

- attacker capability and motivation;
- exposure to untrusted networks;
- privileges or user interaction required;
- exploit maturity;
- asset discoverability;
- frequency of the vulnerable operation;
- presence and reliability of preventive controls;
- observed threat activity.

### Impact factors

- confidentiality, integrity, and availability effects;
- number and sensitivity of affected records;
- financial loss and fraud potential;
- operational downtime;
- regulatory or contractual obligations;
- safety consequences;
- recovery complexity;
- reputational damage;
- ability to detect and contain the event.

### Example qualitative matrix

| Likelihood | Definition |
|---|---|
| Low | Requires rare conditions, strong access, or advanced capability; effective controls exist. |
| Medium | Feasible with known techniques; partial controls or meaningful prerequisites exist. |
| High | Exposed, repeatable, low-complexity, or actively exploited; controls are weak or absent. |

| Impact | Definition |
|---|---|
| Low | Limited local effect, quick recovery, no sensitive data or material business interruption. |
| Medium | Departmental impact, limited sensitive data, or material but recoverable disruption. |
| High | Enterprise-wide interruption, major data exposure, fraud, safety impact, or legal consequence. |

The matrix should not create false precision. The reasoning and evidence behind the rating matter more than the cell color.

### Example risk register entry

```text
Risk ID: R-APP-014
Asset: Customer billing API
Scenario: Authenticated users can modify the accountId parameter and access another tenant's invoices.
Threat: External customer or compromised account
Weakness: Missing object-level authorization
Likelihood: High
Impact: High
Existing controls: Authentication, API gateway logging
Treatment: Add policy-based object authorization; add negative integration tests; alert on cross-tenant access attempts
Owner: Application Engineering Manager
Target date: 2026-08-30
Residual risk: Low after retest
Evidence: Pull request, automated test result, penetration-test retest, SIEM alert test
```

### Residual risk

Residual risk is the risk remaining after controls. It must be accepted by an appropriate owner rather than silently inherited by the security team.

---

## 4. Vulnerability management as an operational lifecycle

Vulnerability management is broader than running a scanner. A mature lifecycle includes:

1. **Asset discovery and ownership**
2. **Coverage validation**
3. **Weakness identification**
4. **Triage and validation**
5. **Risk-based prioritization**
6. **Remediation or mitigation**
7. **Retesting and closure**
8. **Metrics and continuous improvement**

### Asset inventory is foundational

A scan cannot assess an unknown asset. Inventory should include:

- business owner and technical owner;
- environment and network location;
- software and version;
- internet exposure;
- data classification;
- criticality;
- authentication method;
- patch and support status;
- maintenance window;
- backup and recovery information.

Cloud and container environments require discovery of ephemeral assets, images, serverless functions, managed services, identities, and public configuration: not only traditional hosts.

### Scanner result validation

A vulnerability result should be checked for:

- exact product and component;
- actual version and patch level;
- whether the vulnerable feature is enabled;
- network reachability;
- authentication prerequisites;
- compensating controls;
- evidence of false positive or backported fix;
- exploit availability and active exploitation.

Banner versions alone are insufficient because vendors may backport security fixes without changing the upstream version string.

### Prioritization model

CVSS is useful for technical severity, but practical prioritization should combine:

- severity;
- known exploitation, such as CISA KEV inclusion;
- internet exposure;
- exploitability in the local configuration;
- asset criticality;
- available detection and containment;
- remediation complexity;
- time since discovery;
- concentration of similar weaknesses.

A medium-severity vulnerability on an exposed identity service may deserve faster action than a high-severity issue on an isolated, non-critical test system.

### Remediation options

- patch or upgrade;
- disable the vulnerable function;
- change configuration;
- restrict network access;
- reduce privileges;
- add authentication or segmentation;
- deploy a virtual patch or compensating control;
- replace or retire the asset;
- accept the risk temporarily with an expiry date.

### Retesting

Closure should require evidence. Retesting should confirm that:

- the original weakness is no longer reproducible;
- the fix did not create an alternate bypass;
- all affected instances were addressed;
- compensating controls operate as designed;
- monitoring detects attempted exploitation where applicable.

---

## 5. Threat-modelling example: document-processing service

### Architecture

- users upload documents through a web application;
- files are stored in object storage;
- a queue triggers a parser service;
- extracted text is saved to a database;
- administrators review failed documents through an internal portal.

### Trust boundaries

1. internet user to web application;
2. web application to object storage;
3. queue to parser container;
4. parser to database;
5. administrator workstation to internal portal.

### Selected threats

| Threat | Weakness | Control | Validation |
|---|---|---|---|
| Malicious file executes parser exploit | Parser runs with broad privileges | Sandbox parser, non-root container, read-only filesystem, egress deny | Submit safe test files; verify runtime policy and blocked egress |
| Cross-tenant document access | Object key accepted without ownership check | Server-side object authorization | Negative API tests using another tenant’s identifier |
| Storage bucket exposure | Public-access configuration permitted | Organization policy and continuous configuration monitoring | Attempt public policy in test account; confirm denial and alert |
| Queue flooding | No per-user quotas | Rate limiting, bounded queues, backpressure | Load test and observe rejection rather than service collapse |
| Sensitive data in logs | Parser logs full document content | Structured redacted logging | Review logs with seeded test secrets |
| Admin account takeover | Weak authentication | Phishing-resistant MFA and privileged workstation | Identity policy test and sign-in-log review |

### Risk decision

The parser exploit may receive the highest priority because it processes untrusted files automatically and could provide a path into internal data stores. The design response should reduce privilege and network reach before relying only on patching.

---

## 6. Metrics that reveal program quality

Useful measures include:

- percentage of critical assets with an owner;
- scanner coverage by asset class;
- median time to validate critical findings;
- remediation age by exposure and exploitability;
- recurrence rate after closure;
- percentage of accepted risks past expiry;
- control-test pass rate;
- percentage of high-risk architecture changes receiving threat modelling;
- number of known-exploited vulnerabilities on exposed systems;
- retest success rate.

A single “number of vulnerabilities” metric can be misleading because better discovery may initially increase the count.

---

## Common failure modes

- treating compliance as proof of security;
- threat modelling only after implementation;
- creating diagrams without trust boundaries or data classifications;
- using STRIDE labels without actionable threat statements;
- ranking every finding only by CVSS;
- accepting risk without owner or expiry date;
- closing findings based on a ticket status rather than retest evidence;
- scanning known servers while missing cloud, SaaS, identities, and ephemeral workloads;
- measuring remediation speed without considering asset criticality and exploitation.

---

## Portfolio takeaway

I learned to connect architecture-level threats to operational vulnerability management and governance. My preferred output is not a list of generic threats; it is a traceable set of scenarios, controls, owners, validation steps, and residual-risk decisions that can be reviewed throughout the system lifecycle.

## References

- TryHackMe Security Engineer path: https://tryhackme.com/path/outline/security-engineer-training
- TryHackMe Threats and Risks module: https://tryhackme.com/module/threats-and-risks
- NIST Cybersecurity Framework 2.0: https://www.nist.gov/cyberframework
- NIST SP 800-30 Rev. 1, Guide for Conducting Risk Assessments: https://csrc.nist.gov/pubs/sp/800/30/r1/final
- MITRE ATT&CK: https://attack.mitre.org/
- CISA Known Exploited Vulnerabilities Catalog: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
