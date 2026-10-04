# TryHackMe: Offensive Security Intro

## Overview

* **Platform:** TryHackMe
* **Learning Path:** Cyber Security 101
* **Room:** Offensive Security Intro
* **Category:** Offensive Security / Web Security Fundamentals
* **Difficulty:** Introductory
* **Status:** Completed
* **Environment:** Authorized TryHackMe laboratory
* **Target:** FakeBank simulated web application

## Objective

The objective of this room was to develop an introductory understanding of
offensive security by investigating a deliberately vulnerable simulated
banking application.

The exercise focused on identifying weaknesses in an authorized web
application, discovering resources that were not directly linked from the
application, and understanding why sensitive functionality must be protected
by appropriate authentication and authorization controls.

The practical objectives were to:

1. Understand the difference between offensive and defensive security.
2. Perform basic web content discovery.
3. Identify a hidden application endpoint.
4. Investigate the security significance of an exposed administrative
   function.
5. Validate the weakness within the authorized laboratory.
6. Identify appropriate defensive controls.
7. Consider how similar activity could be detected and investigated by a SOC.

## Environment

The exercise was performed entirely within the authorized TryHackMe
laboratory environment.

The laboratory provided:

* A browser-based virtual desktop.
* A simulated FakeBank web application.
* A Linux terminal.
* The `dirb` web content discovery utility.
* A controlled banking account used to validate the security weakness.

The target was intentionally vulnerable and existed solely for security
training. No production systems or unauthorized infrastructure were targeted.

## Initial Observations

The room introduced the distinction between offensive and defensive security.

Offensive security involves identifying and validating weaknesses so that they
can be addressed before malicious actors exploit them.

Defensive security focuses on preventing, detecting, investigating, and
responding to malicious activity.

The practical exercise used a simulated banking application called FakeBank.

The application displayed a customer banking account and provided a controlled
environment for investigating the security of a sensitive administrative
function.

An important security principle established during the exercise was:

> A resource that is hidden from normal navigation is not necessarily secure.

This principle guided the subsequent web-content discovery process.

## Enumeration

### Web Content Discovery

After examining the FakeBank application, web content discovery was performed
against the authorized laboratory target.

The purpose was to identify web resources that were not exposed through the
application's normal navigation but could still be accessible.

The `dirb` utility was used for directory and content discovery.

Command used:

```bash
dirb http://fakebank.thm
```

The scan returned two discovered paths:

| Path             | HTTP Status | Observation                                             |
| ---------------- | ----------: | ------------------------------------------------------- |
| `/bank-transfer` |         200 | Accessible web resource identified by content discovery |
| `/images`        |         301 | Redirecting application resource directory              |

The `/bank-transfer` endpoint was the significant discovery because its name
suggested functionality associated with financial transfers.

The `/images` path appeared to be a normal application resource directory and
did not indicate the same level of security significance.

### Enumeration Analysis

The discovery demonstrated an important web-security principle:

**URL hiding is not an access-control mechanism.**

An endpoint does not become secure simply because it is omitted from visible
navigation.

If a web application exposes sensitive functionality, the server should
enforce authentication and authorization regardless of whether the endpoint
is publicly linked.

The `/bank-transfer` endpoint therefore became the focus of the next
investigation stage.

## Investigation Methodology

The investigation followed a simple security-testing workflow:

1. **Observe** the application's normal functionality.
2. **Enumerate** potentially hidden web resources.
3. **Identify** an endpoint associated with sensitive functionality.
4. **Access** the discovered endpoint within the authorized laboratory.
5. **Assess** whether appropriate access controls were present.
6. **Validate** the security impact using the room's controlled test account.
7. **Analyze** the weakness from a defensive perspective.

This approach demonstrates how security testing moves from discovery to
validation rather than assuming that a discovered endpoint is automatically
vulnerable.

## Administrative Function Analysis

The discovered `/bank-transfer` page exposed an administrative banking
function.

The room demonstrated that the page could be accessed without first
requiring appropriate authentication.

This created an access-control weakness because a sensitive financial
operation was exposed through an otherwise hidden endpoint.

The laboratory instructed the learner to use the verified training account
number from the earlier task and perform a controlled deposit.

The authorized test successfully changed the account balance and produced the
room's success confirmation.

No real financial account or production banking system was involved.

## Findings

### Finding 1: Exposed Sensitive Administrative Endpoint

* **Severity:** High
* **Evidence:** TryHackMe FakeBank `/bank-transfer` page discovered through
  `dirb`.
* **Observation:** A sensitive banking-transfer function was accessible
  through a discoverable web endpoint that was not protected by appropriate
  authentication.
* **Analysis:** The application relied on the endpoint being hidden rather
  than enforcing access control at the server side.
* **Security Impact:** An unauthorized user could potentially access
  administrative functionality and perform sensitive operations.

### Finding 2: Insufficient Access Control

* **Severity:** High
* **Evidence:** Controlled laboratory validation of the bank-transfer
  functionality.
* **Observation:** The administrative function allowed a banking operation
  without requiring appropriate authentication.
* **Analysis:** Sensitive operations must be protected by server-side
  authentication and authorization checks.
* **Security Impact:** In a real financial application, insufficient access
  control could lead to unauthorized transactions, financial loss, data
  manipulation, or compromise of customer trust.

## Root Cause

The primary security weakness was improper access control.

The application treated the obscurity of the `/bank-transfer` endpoint as
though it provided security.

This is an example of **security through obscurity** being used where actual
authentication and authorization controls were required.

The fundamental design problem was not that the endpoint was discoverable.
The problem was that sensitive functionality could be accessed without
appropriate authorization.

## Recommended Remediation

FakeBank should implement multiple layers of protection for sensitive
administrative functionality.

### 1. Require Authentication

Users accessing administrative functions should be required to authenticate
before the server processes the request.

### 2. Enforce Authorization

Authentication alone is insufficient.

The application should verify that the authenticated user has the specific
permissions required to perform administrative banking operations.

### 3. Perform Server-Side Access Checks

Access-control decisions must be enforced on the server.

Hiding links, changing URLs, or relying on client-side controls must not be
treated as security boundaries.

### 4. Protect Sensitive Transactions

Financial operations should require appropriate authorization and should be
validated server-side before execution.

### 5. Implement Security Logging

Administrative access and sensitive transaction attempts should generate
security-relevant audit records.

Useful fields include:

* Timestamp
* Username or account identity
* Source IP address
* Requested endpoint
* Action performed
* Authorization result
* Transaction identifier
* Success or failure status

### 6. Monitor for Suspicious Activity

Repeated access attempts to administrative endpoints, especially from
unauthenticated users or unusual sources, should be monitored and
investigated.

## MITRE ATT&CK Relevance

This introductory exercise has limited direct MITRE ATT&CK coverage because
the room focuses primarily on web-security fundamentals rather than a complete
real-world intrusion chain.

However, the activity is conceptually relevant to techniques involving
valid-account abuse and exploitation of exposed services when those behaviors
occur in real environments.

For this reason, MITRE ATT&CK mappings should only be applied where the
observed behavior genuinely matches the technique definition rather than
forcing a mapping onto the exercise.

## Defensive / SOC Relevance

Although this was an offensive-security training exercise, the scenario has
direct defensive value.

A SOC or security monitoring team could investigate:

* Requests to sensitive administrative endpoints.
* Access to administrative functionality by unexpected users.
* Repeated requests to hidden or uncommon application paths.
* Unauthorized access attempts.
* Unusual transaction activity.
* Administrative actions originating from unexpected IP addresses.
* Multiple failed authorization attempts.
* Successful sensitive operations performed outside normal workflows.

A web application firewall, centralized logging platform, SIEM, and application
audit logs could provide useful telemetry for detecting this type of activity.

A possible detection workflow would be:

**Web request → Administrative endpoint → Authentication/authorization result
→ User/source context → Transaction activity → Alert/investigation**

The key defensive lesson is that endpoint discovery itself is not necessarily
malicious. The security significance comes from what the discovered endpoint
allows a user to do and whether access is appropriately authorized.

## Evidence

The exercise was completed entirely within the authorized TryHackMe
laboratory environment.

No screenshots were captured during the initial completion of this room.

If evidence is added in the future, only sanitized screenshots or supporting
artifacts suitable for public GitHub publication should be included. Evidence
must not expose passwords, private keys, authentication tokens, challenge
credentials, sensitive account information, or unnecessary challenge-specific
secrets.

The recorded `dirb` output and observed application behavior were used to
support the findings documented in this report.

## Lessons Learned

1. Hidden URLs are not security controls.
2. Directory and content discovery can reveal application functionality that is
   not visible through normal navigation.
3. Sensitive functionality requires server-side authentication and
   authorization.
4. Authentication and authorization are separate security controls.
5. Security testing should validate findings within an authorized environment.
6. Offensive findings can be translated into defensive monitoring and
   detection opportunities.
7. Security documentation should explain not only what was discovered, but
   why the weakness matters and how it should be remediated.

## Ethical Scope

All activity documented in this report was performed within the authorized
TryHackMe laboratory environment.

The FakeBank application was intentionally provided as a controlled training
target.

The techniques described in this report must only be used against systems for
which explicit authorization has been provided.

No production banking systems, real customer accounts, or unauthorized
infrastructure were targeted.

## Conclusion

The Offensive Security Intro room demonstrated the relationship between
reconnaissance, web-content discovery, access-control analysis, controlled
validation, and defensive security.

The most important security lesson was that **security through obscurity is
not a substitute for authentication and authorization**.

From a SOC and defensive-security perspective, the exercise also demonstrates
how seemingly simple web requests can become security-relevant when they
provide access to sensitive functionality.

This room provides an introductory foundation for future TryHackMe exercises
covering web security, enumeration, authentication, vulnerability analysis,
and defensive investigation.
