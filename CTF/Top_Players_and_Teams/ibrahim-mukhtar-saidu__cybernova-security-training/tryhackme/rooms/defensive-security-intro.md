# TryHackMe: Defensive Security Intro

## Overview

- **Platform:** TryHackMe
- **Learning Path:** Cyber Security 101
- **Room:** Defensive Security Intro
- **Category:** Defensive Security / SOC Fundamentals
- **Difficulty:** Introductory
- **Status:** Completed
- **Environment:** Authorized TryHackMe laboratory
- **Target:** FakeBank simulated banking environment

## Objective

The objective of this room was to develop practical introductory defensive
security and SOC skills by investigating and responding to a simulated
attack against FakeBank.

The exercise covered the progression from security alert detection through
investigation, containment, threat intelligence, and incident reporting.

The practical objectives were to:

1. Review a suspicious security alert.
2. Identify the username targeted by the attacker.
3. Determine the nature of the ongoing attack.
4. Contain the incident by locking the targeted account.
5. Investigate the suspected threat actor using threat intelligence.
6. Record the incident in the organization's threat intelligence system.
7. Produce a formal incident report.
8. Understand how SOC activity can be translated into repeatable defensive
   workflows.

## Environment

The exercise was performed entirely within the authorized TryHackMe
laboratory environment.

The simulated environment provided:

- A FakeBank security monitoring dashboard.
- An account-management interface.
- A threat intelligence platform.
- An incident-reporting system.
- Simulated security alerts and attack activity.
- A controlled banking environment for defensive investigation.

No production systems, real financial accounts, or unauthorized
infrastructure were targeted.

## Initial Detection

The investigation began with a critical alert indicating multiple failed
login attempts against FakeBank.

The alert identified the targeted username as:

`dave.saunders`

The requested page was:

`/login`

The activity was consistent with an automated credential attack.

This demonstrated a fundamental SOC workflow:

**Alert → Triage → Identify Target → Investigate → Contain**

The analyst's first responsibility was to understand what the alert
represented rather than immediately assuming that every failed login was
malicious.

## Alert Investigation

The monitoring dashboard showed repeated failed authentication attempts
against the same account.

The targeted account was:

`dave.saunders`

The activity indicated that an attacker was repeatedly attempting passwords
against the login interface.

This behavior is characteristic of brute-force activity, where an attacker
attempts multiple credentials until a valid password is discovered.

The investigation therefore established:

- **Target:** FakeBank
- **Username:** `dave.saunders`
- **Page:** `/login`
- **Attack behavior:** Repeated authentication attempts
- **Likely attack type:** Brute force
- **Threat actor identified by the laboratory:** `ShadowFigures`

## Containment

Once the targeted account was identified, the immediate defensive priority
was containment.

The `dave.saunders` account was disabled through the FakeBank account
management interface.

The system confirmed that the account had been successfully locked and could
no longer authenticate.

The laboratory confirmed that the account was successfully locked.

### Containment Analysis

Account locking reduced the immediate risk of the attacker successfully
authenticating with the targeted account.

This demonstrates the incident-response principle that an active threat
should be contained as quickly as practical while investigation continues.

Containment does not necessarily remove the underlying vulnerability or
identify the full scope of an incident. It is an immediate risk-reduction
measure.

## Threat Intelligence Investigation

After containment, the investigation moved to threat intelligence.

The suspected threat actor was identified as:

`ShadowFigures`

The FakeBank threat intelligence platform described ShadowFigures as a
credential-theft group associated with automated login attacks.

The threat profile contained information about:

- Known attack behavior.
- Previously targeted organisations.
- Known victims.
- Associated IP addresses.
- Relevant MITRE ATT&CK techniques.
- Indicators that could help defenders identify similar activity.

The investigation established that ShadowFigures had targeted:

`dave.saunders` on `/login`

The threat intelligence record was updated with the new incident.

The laboratory confirmed that the threat-intelligence update was successfully submitted.

## Threat Intelligence Analysis

Threat intelligence provides context that helps defenders move beyond a
single alert.

Instead of treating the login attempts as an isolated event, analysts can
compare observed behavior against known attacker techniques, infrastructure,
victims, and indicators.

The exercise demonstrated how threat intelligence can support:

1. Alert enrichment.
2. Attacker identification.
3. Indicator correlation.
4. Incident prioritisation.
5. Detection engineering.
6. Future investigations.

Threat intelligence should be continuously updated as new evidence becomes
available.

## Incident Reporting

The final phase required creation of a formal incident report.

The report documented the attack and connected the observed activity to the
previous investigation.

The generated incident reference was:

`SOC-2026-0901-001`

The report recorded the incident as critical and documented the relevant
attack details, targeted account, targeted page, threat actor, and response
activity.

This demonstrated the importance of maintaining an auditable record of
security incidents.

Incident reports help security teams:

- Preserve an investigation timeline.
- Document response actions.
- Support post-incident review.
- Improve future detection and response.
- Provide evidence for management or appropriate authorities when required.
- Turn individual incidents into organizational lessons.

## Findings

### Finding 1: Automated Brute-Force Activity

* **Severity:** Critical
* **Target:** `dave.saunders`
* **Endpoint:** `/login`
* **Observation:** Multiple failed login attempts were detected against a
  single account.
* **Analysis:** The repeated authentication attempts were consistent with
  automated brute-force activity.
* **Impact:** Successful authentication could have resulted in unauthorized
  account access.

### Finding 2: Targeted Credential Attack

* **Severity:** High
* **Threat Actor:** `ShadowFigures`
* **Observation:** The laboratory threat intelligence system associated the
  observed activity with a known credential-theft group.
* **Analysis:** The attacker was targeting login credentials through repeated
  authentication attempts.
* **Impact:** Credential compromise could provide unauthorized access to
  sensitive banking functionality.

## Defensive Response

The response followed a simplified incident-response workflow:

1. **Detection**: A critical suspicious-login alert was generated.
2. **Triage**: The alert was reviewed to identify the targeted account.
3. **Investigation**: The login activity and suspected threat actor were
   examined.
4. **Containment**: The targeted account was locked.
5. **Threat Intelligence**: The incident was added to the threat intelligence
   system.
6. **Reporting**: A formal incident report was created.

This workflow demonstrates how a SOC transforms raw security telemetry into
an actionable response.

## Recommended Defensive Controls

A real banking environment should use multiple layers of protection against
automated authentication attacks.

### 1. Multi-Factor Authentication

Require MFA for sensitive accounts and administrative functions to reduce the
impact of stolen or guessed passwords.

### 2. Rate Limiting

Limit authentication attempts from individual sources and apply stronger
controls when repeated failures occur.

### 3. Account Protection

Implement appropriate account lockout, temporary suspension, or progressive
delays after repeated authentication failures.

### 4. Strong Authentication Policies

Use strong password policies and prevent commonly compromised passwords from
being used.

### 5. Centralized Security Logging

Record authentication successes, failures, source addresses, usernames,
timestamps, and relevant application context.

### 6. Detection and Alerting

Create SIEM detections for abnormal authentication patterns, including
high-volume failures against one account or many accounts.

### 7. Threat Intelligence Enrichment

Correlate source IP addresses, domains, usernames, and other indicators with
trusted threat-intelligence sources.

### 8. Incident Response Procedures

Maintain documented playbooks for credential attacks, account compromise,
and suspicious authentication activity.

## MITRE ATT&CK Relevance

The simulated activity is primarily relevant to the MITRE ATT&CK
**Brute Force** technique family.

### Primary Mapping

- **T1110: Brute Force**
  - The attacker repeatedly attempted authentication against the same
    username.

### Contextual Mappings

The laboratory's threat-intelligence system also referenced:

- **T1110.001: Password Guessing**
- **T1110.004: Credential Stuffing**
- **T1078: Valid Accounts**
- **T1133: External Remote Services**

These should be treated as contextual references from the simulated
environment rather than confirmed classifications of a real-world threat
actor.

The strongest directly observed behavior in this exercise was repeated
authentication attempts against the `/login` endpoint.

## SOC Relevance

This room closely reflects several responsibilities performed by SOC
analysts.

### Alert Triage

Analysts must determine whether an alert represents normal behavior,
suspicious activity, or an active security incident.

### Investigation

Analysts collect context from dashboards, authentication records, threat
intelligence, and other security telemetry.

### Containment

When an active attack is confirmed, analysts take immediate actions to
reduce the risk of further compromise.

### Threat Intelligence

Analysts enrich investigations using information about known attackers,
indicators, techniques, and previous activity.

### Incident Reporting

Analysts document what happened, what was affected, what actions were taken,
and what should happen next.

## Detection Opportunities

A SIEM or security-monitoring platform could detect this type of activity
using rules such as:

**Multiple failed logins → Same username → Short time window → Alert**

Additional correlation could include:

- Multiple usernames targeted from one source.
- Authentication attempts from unusual geographic locations.
- High-volume login failures.
- Login attempts outside expected business patterns.
- Known malicious or suspicious source IP addresses.
- Successful login immediately following numerous failures.
- Account lockout followed by additional authentication attempts.

A simplified SOC detection workflow is:

**Authentication Logs → Detection Rule → Alert → IOC Extraction →
Threat Intelligence → Containment → Investigation → Incident Report**

## Lessons Learned

1. Security alerts require investigation and context.
2. Repeated authentication failures can indicate brute-force activity.
3. Containment should reduce immediate risk while investigation continues.
4. Account locking can prevent an attacker from successfully using a targeted
   account.
5. Threat intelligence provides useful context for security investigations.
6. SOC analysts need to connect alerts, indicators, attacker behavior, and
   response actions.
7. Incident reports provide an auditable record of security activity.
8. Effective defensive security combines prevention, detection, investigation,
   containment, and continuous improvement.

## Evidence

The room was completed entirely within the authorized TryHackMe laboratory
environment.

No screenshots were captured during the initial completion of this room.

If evidence is added later, only sanitized screenshots or supporting
artifacts suitable for public GitHub publication should be included.

Evidence must not expose:

- Passwords
- Private keys
- Authentication tokens
- Challenge credentials
- Sensitive account information
- Unnecessary challenge-specific data

The documented observations, successful containment, threat-intelligence
update, and incident-report workflow were used to support the findings in
this report.

## Ethical Scope

All activity documented in this report was performed within the authorized
TryHackMe laboratory environment.

The FakeBank environment was intentionally provided for cybersecurity
training.

The techniques described in this report must only be used against systems
for which explicit authorization has been provided.

No real banking systems, customer accounts, or unauthorized infrastructure
were targeted.

## Conclusion

The Defensive Security Intro room provided a practical introduction to the
SOC analyst workflow.

The exercise progressed from detection of suspicious authentication activity
to investigation, containment, threat intelligence enrichment, and formal
incident reporting.

The most important lesson was that defensive security is not limited to
detecting an alert. Analysts must understand the activity, determine its
significance, contain the immediate threat, gather useful intelligence, and
document the incident so that the organization can improve its defenses.

This room provides a strong foundation for subsequent SOC, SIEM, threat
intelligence, incident-response, and log-analysis training.
