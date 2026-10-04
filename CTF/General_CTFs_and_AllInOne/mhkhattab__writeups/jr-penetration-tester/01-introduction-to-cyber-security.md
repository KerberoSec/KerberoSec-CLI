# Module 1: Introduction to Cyber Security

> **Portfolio scope:** Technical learning notes from the legacy TryHackMe Jr Penetration Tester path. All examples assume explicit authorization and controlled lab systems.

## Module coverage

This module introduced:

- offensive security;
- defensive security;
- common cybersecurity roles;
- the relationship between attacker behavior, security controls, and business risk.

The main lesson is that offensive and defensive work are not opposites. A useful security assessment produces evidence that defenders can act on, while defensive telemetry helps testers determine whether an attack path is observable and containable.

---

## 1. Offensive security operating model

Offensive security simulates realistic attacker behavior within an approved scope. The objective is not simply to obtain access; it is to answer questions such as:

- Which assets are reachable?
- Which assumptions or controls can be bypassed?
- What level of access can be achieved?
- Can the weakness be chained with other conditions?
- What evidence would a defender see?
- What is the business impact?
- How should the issue be remediated and retested?

### Typical assessment types

- **Vulnerability assessment:** broad identification and prioritization of weaknesses, usually with limited exploitation.
- **Penetration test:** controlled validation of exploitable weaknesses and impact.
- **Web application assessment:** testing of authentication, authorization, input handling, business logic, and deployment configuration.
- **Network assessment:** discovery, service enumeration, configuration review, and controlled exploitation of infrastructure.
- **Red team:** objective-based simulation of a threat actor, usually testing people, process, and technology across a longer campaign.
- **Purple team:** collaborative offensive and defensive work focused on validating and improving detection and response.

The rules of engagement determine which model applies and what actions are permitted.

---

## 2. Defensive security operating model

Defensive security reduces attack likelihood and impact through:

- secure architecture;
- hardening and patching;
- identity and access controls;
- vulnerability management;
- endpoint, network, application, and cloud monitoring;
- detection engineering;
- incident response;
- backup and recovery;
- security awareness and governance.

### Prevention, detection, response, and recovery

A complete control strategy should consider all four:

1. **Prevent:** block or reduce the chance of compromise.
2. **Detect:** identify suspicious behavior or control failure.
3. **Respond:** contain and remove the threat.
4. **Recover:** restore trusted operations and learn from the event.

For example, patching an internet-facing service is preventive. Network and endpoint alerts for exploitation are detective. Isolating the host is responsive. Rebuilding and restoring data is recovery.

---

## 3. Attack lifecycle and defender visibility

An attacker commonly progresses through stages such as:

- reconnaissance;
- initial access;
- execution;
- persistence;
- privilege escalation;
- credential access;
- discovery;
- lateral movement;
- collection;
- command and control;
- exfiltration or impact.

This is not always linear. A tester may move between discovery and exploitation repeatedly.

### Evidence by stage

| Stage | Possible evidence |
|---|---|
| Reconnaissance | web logs, DNS queries, scan patterns, certificate transparency searches |
| Initial access | email events, web exploitation logs, VPN authentication, exposed-service telemetry |
| Execution | process creation, scripting logs, EDR alerts, child-process anomalies |
| Persistence | scheduled task, service, startup item, cloud access key, new OAuth application |
| Credential access | LSASS access, browser credential store access, suspicious token use |
| Discovery | account/group queries, network enumeration, cloud resource listing |
| Lateral movement | SMB/RDP/SSH/WinRM activity, remote service creation, new sessions |
| Exfiltration | unusual archive creation, outbound volume, cloud sharing, DNS tunneling patterns |

A professional penetration test can include a detection review: what controls fired, how quickly, and with what context.

---

## 4. Core security properties

### Confidentiality

Protects information from unauthorized disclosure. Typical controls:

- access control;
- encryption;
- segmentation;
- data minimization;
- secret management;
- monitoring of sensitive data access.

### Integrity

Protects data and system state from unauthorized modification. Controls include:

- digital signatures and hashes;
- authorization;
- change control;
- immutable logs;
- file-integrity monitoring;
- transaction controls.

### Availability

Ensures systems remain usable. Controls include:

- redundancy;
- capacity management;
- DDoS protection;
- rate limiting;
- tested backups;
- fault isolation;
- secure error handling.

### Authentication, authorization, accountability

- Authentication verifies identity.
- Authorization determines allowed actions.
- Accountability records activity so it can be attributed and investigated.

A login page may authenticate users correctly while the API still exposes another user’s records through broken authorization.

---

## 5. Ethical and legal boundaries

Technical ability does not grant permission. Before any assessment:

- obtain written authorization;
- identify exact targets and exclusions;
- define testing dates and time zones;
- document allowed and prohibited techniques;
- establish emergency contacts;
- define data handling and retention;
- define stop conditions;
- clarify whether denial-of-service, social engineering, password spraying, or persistence is allowed.

### Safe handling of findings

- collect the minimum evidence required;
- avoid unnecessary access to real sensitive records;
- redact credentials and personal data;
- encrypt notes and evidence;
- report critical issues through the agreed channel immediately;
- remove test artifacts and accounts;
- retain evidence only as authorized.

---

## 6. Career-role relationships

### Penetration tester

- plans assessments;
- performs reconnaissance and testing;
- validates weaknesses;
- documents evidence and impact;
- recommends remediation;
- retests fixes.

### Security analyst / SOC analyst

- monitors alerts;
- investigates events;
- correlates logs;
- escalates incidents;
- tunes detections;
- documents cases.

### Security engineer

- designs and implements controls;
- hardens systems;
- integrates logging and identity;
- automates security checks;
- supports incident response.

### Incident responder / digital forensics analyst

- preserves and analyzes evidence;
- scopes compromise;
- supports containment and recovery;
- reconstructs timelines;
- communicates findings.

### Application security engineer

- performs threat modelling and code review;
- integrates SAST/DAST/SCA;
- tests APIs and web applications;
- works with developers on remediation.

These roles overlap. A penetration tester benefits from understanding how defenders investigate, and a security engineer benefits from understanding attack paths.

---

## 7. Example attacker-defender analysis

Scenario: an exposed administrative web panel uses default credentials.

### Offensive perspective

1. discover the service through approved scanning;
2. identify the application and authentication flow;
3. test only approved credentials or lab defaults;
4. confirm access level;
5. determine whether sensitive configuration or additional systems are reachable;
6. stop at the agreed proof objective;
7. document evidence and cleanup.

### Defensive perspective

- remove default credentials during deployment;
- restrict the panel to a management network;
- require MFA;
- alert on default-account use and repeated failures;
- review administrative actions;
- maintain configuration baselines;
- rotate exposed secrets;
- investigate whether the account was previously used.

### Report statement

> The administrative interface was reachable from an untrusted network and accepted a default vendor credential. Successful access provided configuration-management privileges. The issue should be addressed by removing the default account or rotating the credential, restricting management access, requiring MFA, and reviewing historical authentication and configuration logs.

---

## 8. Evidence quality and reporting

A strong finding includes:

- title and severity;
- affected asset and environment;
- technical description;
- prerequisites;
- exact reproduction steps within scope;
- redacted request/response or command evidence;
- impact and realistic attack chain;
- remediation;
- references;
- retest criteria.

### Example evidence table

| Field | Value |
|---|---|
| Asset | `admin.lab.example` |
| Port | TCP/443 |
| Date/time | UTC timestamp |
| Identity | approved lab account |
| Observation | default credential accepted |
| Access | configuration administrator |
| Sensitive data accessed | none beyond proof required |
| Cleanup | session terminated; no changes made |

This is more useful than a screenshot with no context.

---

## 9. Professional habits developed

- maintain a timestamped activity log;
- save tool output in standard formats;
- separate confirmed facts from assumptions;
- change one variable at a time during testing;
- verify findings manually;
- avoid overclaiming impact;
- map issues to root cause, not only payload;
- describe both prevention and detection;
- preserve evidence securely;
- retest after remediation.

---

## Common mistakes

- confusing a vulnerability scan with a penetration test;
- treating an open port as a vulnerability by itself;
- using tools without understanding protocol behavior;
- testing outside written scope;
- collecting excessive sensitive information;
- reporting severity without business context;
- proving access but not explaining remediation;
- ignoring logs and defender visibility;
- failing to clean up lab artifacts;
- copying flags or walkthrough answers instead of documenting learning.

---

## Portfolio takeaway

This module established the mindset for the rest of the path: authorized testing, disciplined evidence collection, repeatable methodology, and communication of risk. I learned to analyze offensive actions together with the controls, telemetry, and recovery processes that should detect or limit them.

## References

- TryHackMe Jr Penetration Tester (Legacy): https://tryhackme.com/path/outline/jrpenetrationtester-legacy
- MITRE ATT&CK: https://attack.mitre.org/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
