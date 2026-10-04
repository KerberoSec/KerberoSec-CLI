# Module 5: Managing Incidents

> **Portfolio scope:** Detailed notes on incident response, incident management, accountable logging, first-responder actions, evidence handling, and cyber crisis coordination.

## Module coverage

This module covered:

- the difference between incident response and incident management;
- logging for accountability;
- first-responder actions;
- preservation and documentation of evidence;
- containment and recovery decisions;
- escalation into cyber crisis management.

The central lesson is that incident response is an organizational capability, not only a technical procedure. Investigation quality depends on preparation, asset visibility, trustworthy telemetry, decision authority, communications, and rehearsed recovery.

---

## 1. Incident response versus incident management

**Incident response** focuses on technical and investigative actions: detection, analysis, containment, eradication, recovery, and evidence.

**Incident management** coordinates the wider response: severity, ownership, business priorities, legal and regulatory input, communications, executive decisions, vendors, and continuity.

A ransomware event may involve endpoint isolation and forensic collection, but it also requires decisions about business shutdown, customer communication, insurance, legal obligations, restoration priority, and third-party coordination.

---

## 2. Preparation before an incident

Response speed and accuracy are largely determined before the incident occurs.

### Required foundations

- current asset inventory;
- business criticality and data classification;
- identity and network diagrams;
- logging architecture and retention;
- endpoint and cloud telemetry;
- contact lists and escalation paths;
- incident roles and decision authority;
- secure out-of-band communications;
- evidence collection procedures;
- legal and regulatory guidance;
- tested backups and restoration procedures;
- vendor and cloud-provider contacts;
- tabletop and technical exercises.

### Incident roles

A response structure may include:

- incident commander;
- technical investigation lead;
- containment/recovery lead;
- evidence custodian;
- communications lead;
- legal/privacy representative;
- business-service owner;
- executive decision maker;
- vendor or third-party liaison.

One person may fill several roles in a small organization, but authority and responsibilities should still be explicit.

---

## 3. Identification and triage

An alert is not automatically an incident. Triage determines whether suspicious activity is real, its scope, urgency, and potential consequence.

### Initial triage questions

- What triggered the alert?
- Which identity, asset, application, or cloud resource is involved?
- Is the activity expected, authorized, or explainable?
- What time window is relevant?
- Are other assets showing related indicators?
- What privilege did the actor have?
- Is sensitive data or a critical service involved?
- Is the activity ongoing?
- What evidence could be lost quickly?
- Does the event meet a reporting or escalation threshold?

### Severity model

Severity should reflect business impact and urgency, not only alert confidence.

| Severity | Example criteria |
|---|---|
| S1: Critical | Active enterprise compromise, major outage, destructive activity, safety impact, or large sensitive-data exposure. |
| S2: High | Confirmed compromise of privileged identity or critical system with limited containment. |
| S3: Medium | Confirmed localized compromise or policy violation with manageable impact. |
| S4: Low | Suspicious event requiring investigation but no confirmed material impact. |

The organization should define who may declare each severity and what communications are mandatory.

### Scope expansion

A common mistake is investigating only the originally alerted host. Scope using shared indicators and relationships:

- same identity on other systems;
- same source IP or ASN;
- same process hash, command line, or parent process;
- same destination domain or certificate;
- same cloud role assumption;
- same email sender or attachment;
- same affected software version;
- same administrative change.

---

## 4. Logging for accountability

Logs should support reconstruction, attribution, and control validation.

### Event quality

A useful event includes:

- UTC timestamp and reliable time synchronization;
- actor identity or workload identity;
- source device, IP, and session;
- action attempted;
- target object or resource;
- success or failure;
- authorization decision where possible;
- request or correlation identifier;
- application and environment;
- relevant before/after state for sensitive changes.

### Important sources

- identity provider and MFA;
- endpoint detection and operating-system logs;
- DNS, proxy, firewall, VPN, and flow data;
- email security;
- application and API gateway logs;
- database audit logs;
- cloud control-plane and workload logs;
- container and orchestration events;
- CI/CD and source-control audit logs;
- key-management events;
- physical access where relevant.

### Log protection

- centralize events away from the originating host;
- restrict modification and deletion;
- monitor ingestion gaps;
- preserve original timestamps and fields;
- use retention aligned with investigative and legal needs;
- separate security logging from application debugging where appropriate;
- avoid sensitive credentials and unnecessary personal data.

### Correlation example

A suspicious cloud-console action can be correlated through:

1. identity-provider sign-in;
2. MFA method and device result;
3. cloud role assumption;
4. control-plane API call;
5. storage policy modification;
6. subsequent object-access logs;
7. alert and analyst actions.

A common request ID, session ID, or principal ID can significantly improve reconstruction.

---

## 5. First-responder actions

The first responder should preserve options. Unplanned actions can destroy evidence or alert an attacker.

### Stabilize and document

Record immediately:

- reporter and detection source;
- current date/time and time zone;
- affected assets and users;
- screenshots or exact alert text;
- observed commands, processes, files, connections, or changes;
- actions already taken;
- people notified;
- current business impact.

Use contemporaneous notes. Every significant action should include who performed it, when, why, and the result.

### Volatile versus persistent evidence

Volatile evidence may disappear on shutdown or process termination:

- running processes;
- active network connections;
- logged-on users;
- memory-resident malware or credentials;
- mounted shares;
- current system time;
- temporary files and command history not yet persisted.

Persistent evidence includes disk files, event logs, cloud audit logs, snapshots, mailboxes, and configuration history.

Whether to collect memory before isolation depends on risk, capability, and incident type. There is no universal rule to “always shut down” or “never shut down.” The decision should consider safety, ongoing impact, encryption, attacker activity, and evidence value.

### Safe evidence collection examples

Authorized Linux triage examples:

```bash
date -u
who
w
ps auxf
ss -plant
ip addr
ip route
journalctl --since '2 hours ago'
```

Authorized Windows triage examples:

```powershell
Get-Date -Format o
Get-CimInstance Win32_LoggedOnUser
Get-Process | Sort-Object CPU -Descending
Get-NetTCPConnection
Get-WinEvent -LogName Security -MaxEvents 200
```

These commands can alter access times or produce audit events; collection procedures should account for that. Enterprise responders normally use validated tooling and preserve outputs with hashes and case identifiers.

### Chain of custody

For evidence that may support legal or disciplinary action, document:

- unique evidence identifier;
- description and source;
- acquisition method;
- date/time and collector;
- cryptographic hash;
- storage location;
- every transfer or access;
- reason for transfer;
- final disposition.

Example hash verification:

```bash
sha256sum evidence-image.raw > evidence-image.raw.sha256
sha256sum -c evidence-image.raw.sha256
```

---

## 6. Containment strategy

Containment limits damage while preserving business operations and evidence.

### Short-term containment examples

- isolate an endpoint through EDR;
- disable or restrict a compromised account;
- revoke sessions and tokens;
- block malicious domains, IPs, or file hashes;
- remove public access from a cloud resource;
- stop a vulnerable service;
- segment an affected subnet;
- rotate exposed credentials;
- pause a compromised deployment pipeline.

### Containment risks

- attacker notices and accelerates destructive action;
- business service becomes unavailable;
- evidence is lost;
- a broad block disrupts legitimate dependencies;
- a disabled account prevents access to required logs or systems;
- incomplete credential rotation leaves alternate access paths.

### Decision record

Containment decisions should document:

- the threat being reduced;
- expected business impact;
- alternatives considered;
- approving authority;
- success criteria;
- rollback plan;
- monitoring after the action.

---

## 7. Eradication and recovery

Eradication removes the root cause and persistence. Recovery restores trusted service.

### Eradication activities

- remove malicious persistence;
- patch exploited vulnerabilities;
- correct exposed configuration;
- rotate credentials, keys, and tokens;
- rebuild systems from trusted sources;
- remove unauthorized accounts and permissions;
- update detections and block indicators;
- investigate related assets and supply-chain components.

Deleting one file is not sufficient if the attacker obtained reusable credentials or modified identity, cloud, or pipeline configuration.

### Recovery validation

Before returning to service:

- confirm the system was rebuilt or cleaned through an approved process;
- verify patches and configuration;
- validate account and permission state;
- test business functionality;
- increase monitoring;
- confirm backup integrity;
- review network exposure;
- ensure no related indicators remain;
- obtain business-owner approval where required.

Recovery may be staged, with the most critical services restored first and risk monitored closely.

---

## 8. Cyber crisis management

A cyber incident becomes a crisis when it threatens major business operations, legal obligations, safety, reputation, or stakeholder confidence.

### Crisis characteristics

- incomplete and rapidly changing information;
- high impact across multiple business units;
- executive decisions under time pressure;
- external communications and regulatory obligations;
- dependency on third parties;
- potential conflict between operational, legal, and investigative goals.

### Crisis command structure

A crisis team should maintain:

- a single incident commander or executive authority;
- regular situation reports;
- a decision log;
- confirmed facts separated from assumptions;
- workstreams for technology, business continuity, legal, communications, and customer impact;
- an out-of-band communication method;
- a schedule for executive updates.

### Situation report format

```text
Incident: INC-2026-014
Time: 2026-08-01 15:00 UTC
Severity: S1 Critical
Confirmed facts:
- Two production file servers encrypted.
- Domain administrator credential used from workstation WS-221.
- EDR isolation completed on 18 endpoints.
Unknowns:
- Initial access vector.
- Whether data was exfiltrated.
Business impact:
- Finance document access unavailable.
Actions completed:
- Compromised account disabled; sessions revoked.
- Backup environment isolated.
Next decisions required:
- Approve shutdown of remaining file-server segment.
- Approve external forensic vendor activation.
Next update: 16:00 UTC
```

This prevents unstructured status discussions and helps leadership decide based on current evidence.

---

## 9. Lessons learned and control improvement

A post-incident review should avoid blame and focus on system improvement.

Questions include:

- Which control failed, was absent, or was bypassed?
- Which detection worked and which telemetry was missing?
- How long did identification, containment, and recovery take?
- Were roles and authority clear?
- Were backups usable and isolated?
- Did communications create confusion or delay?
- Which assumptions proved false?
- Which actions should become automated tests or detections?
- Who owns each improvement and by when?

Outputs should be tracked like other engineering work, not filed away as a report.

---

## 10. Example investigation: suspicious privileged sign-in

### Detection

A privileged cloud account signs in from a new location and creates an access key.

### Triage

- validate the user’s travel and device;
- review MFA method and sign-in risk;
- identify all sessions and role assumptions;
- inspect actions before and after key creation;
- search for use of the new key;
- identify changes to logging, IAM, storage, and networking.

### Containment

- revoke active sessions;
- disable the new key;
- require secure reauthentication;
- temporarily restrict the account;
- preserve identity and cloud audit logs;
- monitor related accounts and source infrastructure.

### Eradication and recovery

- reset credentials and MFA enrollment through a verified process;
- remove unauthorized changes;
- review privilege assignments;
- confirm endpoint integrity;
- improve alerting for key creation and unusual role assumption;
- conduct a targeted access review.

### Evidence

- identity sign-in log;
- MFA event;
- cloud audit trail;
- key creation and usage events;
- endpoint browser and process telemetry;
- administrative ticket and user interview.

---

## Common failure modes

- shutting down a system reflexively without considering evidence and impact;
- treating the first alerted host as the entire scope;
- collecting logs that lack synchronized time or identity context;
- using shared administrator accounts;
- failing to document responder actions;
- restoring service without removing compromised credentials or persistence;
- allowing the incident chat to become the only decision record;
- communicating speculation as confirmed fact;
- conducting a lessons-learned meeting without assigning owners and deadlines;
- assuming backups work without regular restoration testing.

---

## Portfolio takeaway

I learned to treat incident response as an evidence-driven operational process. Strong response combines rapid triage, careful preservation, proportionate containment, root-cause removal, verified recovery, and disciplined crisis communication. Preparation and trustworthy logging are the controls that make every later step possible.

## References

- TryHackMe Security Engineer path: https://tryhackme.com/path/outline/security-engineer-training
- NIST SP 800-61 Rev. 3: https://csrc.nist.gov/pubs/sp/800/61/r3/final
- NIST Cybersecurity Framework 2.0: https://www.nist.gov/cyberframework
- CISA Incident Response resources: https://www.cisa.gov/resources-tools/resources/incident-response
