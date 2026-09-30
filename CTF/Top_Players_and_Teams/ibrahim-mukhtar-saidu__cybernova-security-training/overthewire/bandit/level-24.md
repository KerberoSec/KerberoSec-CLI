# Bandit Level 24 → 25

## Objective

Analyze a network authentication service and identify the valid credential required to progress from Bandit Level 24 to Level 25.

The exercise involves interacting with an authorized TCP authentication service and systematically testing candidate credentials supplied by the training environment.

The primary learning objective is to understand controlled authentication testing, automation of repetitive tasks, response validation, and the defensive indicators associated with brute-force activity.

---

## Environment

| Item | Value |
|---|---|
| Platform | OverTheWire Bandit |
| Starting Account | bandit24 |
| Target Account | bandit25 |
| Protocol | TCP |
| Service Type | Network authentication service |
| Environment | Authorized CTF / training lab |
| Primary Skills | Network investigation, automation, authentication analysis |

---

## Challenge Description

The Bandit Level 24 environment provides access to a network service that requires authentication.

Unlike previous levels where a credential could be recovered directly from a file or transformed through encoding, this exercise requires testing multiple candidate values against the service.

The challenge therefore introduces a controlled example of repeated authentication attempts and provides an opportunity to study how defenders can recognize and investigate this behavior.

The actual successful credential is intentionally excluded from this public documentation.

---

## Investigation Approach

The investigation followed a structured authentication-testing workflow:

1. Confirm the authenticated Bandit account and environment.
2. Identify the network service and its connection parameters.
3. Understand the expected authentication format.
4. Review the available candidate credential material.
5. Prepare candidate inputs systematically.
6. Automate repetitive authentication attempts within the authorized training environment.
7. Compare service responses to distinguish unsuccessful and successful attempts.
8. Validate the successful response.
9. Preserve the result without publishing the credential.
10. Document the defensive implications of repeated authentication activity.

This workflow demonstrates systematic data preparation, controlled automation, network-service interaction, response analysis, and secure evidence handling.

---

## Security Concepts

The exercise demonstrates several important security concepts:

- TCP network services
- Authentication protocols
- Credential validation
- Automated authentication attempts
- Brute-force behavior
- Response-based validation
- Rate limiting considerations
- Account lockout considerations
- Credential protection
- Security monitoring opportunities

---

## Network Service Investigation

The first stage was to identify the network service used by the challenge.

The investigation focused on:

- Service reachability
- TCP connectivity
- Expected input format
- Authentication behavior
- Service responses

The service was treated as an authorized training target only.

The objective was not simply to connect to the service, but to understand how the authentication workflow behaved under repeated candidate inputs.

---

## Authentication Testing Method

The challenge required multiple candidate credentials to be evaluated against the service.

A controlled automation approach was used because manually submitting each candidate would be inefficient and error-prone.

The conceptual workflow was:

Candidate Dataset
       |
       v
Input Preparation
       |
       v
Authentication Request
       |
       v
Service Response
       |
       +------ Failure ------> Try Next Candidate
       |
       v
Success Indicator
       |
       v
Validate Result
       |
       v
Protect Credential

The automation was restricted to the authorized OverTheWire training environment.

Exact credentials and challenge-specific authentication material are intentionally omitted.

---

## Techniques and Commands

The investigation involved:

- Network service identification
- TCP connection testing
- Candidate-input generation
- Structured input processing
- Authentication request automation
- Response comparison
- Success-condition detection
- Controlled repetitive testing
- Credential redaction
- Evidence validation

The investigation workflow was:

1. Identify the authorized TCP authentication service and its connection parameters.
2. Confirm the expected authentication input format.
3. Prepare the candidate dataset in a controlled manner.
4. Submit candidate values systematically to the authorized service.
5. Capture and compare service responses.
6. Identify the response condition associated with a valid candidate.
7. Independently validate the successful result.
8. Record only sanitized evidence for public documentation.
9. Keep the discovered credential and challenge-specific authentication material outside the repository.

Representative sanitized command patterns may include:

```bash
nc <authorized-host> <service-port>
<candidate-generation-command> | <authorized-testing-workflow>
<response-validation-command>
```

The exact service address, candidate values, authentication implementation, successful credential, and reusable brute-force automation are intentionally omitted from the public documentation.

The purpose of this section is to document the investigation methodology and defensive learning rather than publish operational authentication-testing material.

---

## Response Analysis

An important part of the investigation was distinguishing unsuccessful authentication attempts from the successful response.

The service response was treated as validation evidence.

Conceptually:

| Observation | Interpretation |
|---|---|
| Authentication rejected | Candidate is invalid |
| Authentication continues | Continue controlled testing |
| Success indicator returned | Candidate requires validation |
| Next-level credential returned | Objective completed |

This demonstrates a basic but important security-analysis principle: automated testing must include a reliable condition for identifying and validating the expected result.

---

## Evidence Collection

Useful evidence for this level includes:

- Network-service identification
- Sanitized connection output
- Candidate-processing workflow
- Redacted success response
- Screenshot of successful completion without credentials
- Documentation of the investigation methodology

Evidence should demonstrate the investigation without exposing authentication material.

Only evidence that actually exists should be referenced in the repository.

---

## Evidence Validation

The successful candidate was validated through the authorized challenge service.

The validation process consisted of:

1. Submitting a candidate.
2. Observing the service response.
3. Detecting the expected success condition.
4. Confirming that the response corresponded to the Level 24 → 25 objective.
5. Recording only a sanitized result for public documentation.

The actual credential is not required as public evidence.

---

## Credential Handling

Authentication material discovered during the exercise is treated as sensitive training data.

The credential must not be published in:

- Git repositories
- GitHub
- README files
- Screenshots
- Reports
- Source code
- Example configuration files
- Public demonstrations

Public documentation should use:

`Credential: [REDACTED]`

This preserves the technical value of the report while preventing unnecessary credential disclosure.

---

## Defensive / SOC Relevance

Although this exercise is performed in a CTF environment, the underlying behavior has direct defensive relevance.

A SOC analyst should be able to recognize patterns associated with repeated authentication attempts, including:

- High volumes of authentication failures
- Rapid authentication attempts
- Repeated connections from one source
- Multiple candidate passwords against one account
- Authentication bursts
- Unusual login frequency
- Account lockout events
- Successful authentication following numerous failures

Potential defensive telemetry includes:

- Authentication logs
- Network connection logs
- Firewall logs
- Identity-provider logs
- Endpoint security telemetry
- SIEM correlation rules
- Account lockout events

A production detection could correlate repeated authentication failures within a defined time window and raise an alert when the behavior exceeds an expected threshold.

---

## MITRE ATT&CK Relevance

The strongest conceptual ATT&CK relationship for this exercise is:

- **T1110: Brute Force:** The challenge demonstrates repeated authentication attempts against a service in order to identify a valid credential.

This mapping is presented as defensive analytical context. The Bandit exercise is an authorized training scenario and should not be interpreted as malicious activity.

The exercise is particularly useful for understanding the observable behavior that defenders may associate with brute-force authentication attempts.

---

## Lessons Learned

The exercise demonstrated that:

- Repetitive authentication testing can be automated.
- Candidate inputs should be processed systematically.
- Network services can provide observable success and failure indicators.
- Automation requires a reliable success condition.
- Authentication attempts can generate valuable defensive telemetry.
- Rate limiting can reduce automated authentication abuse.
- Account lockout policies can provide additional protection.
- Credentials discovered during security exercises must remain protected.
- Brute-force behavior is both an offensive testing concept and a defensive detection opportunity.
- Authorized scope must always be established before performing repeated authentication testing.

---

## Limitations

This exercise uses a controlled OverTheWire training environment.

It does not represent the full complexity of production authentication systems.

Real-world environments may additionally involve:

- Multi-factor authentication
- CAPTCHA
- Account lockout policies
- Rate limiting
- Web application firewalls
- Identity providers
- Distributed authentication infrastructure
- SIEM correlation
- Behavioral analytics
- IP reputation systems
- Adaptive authentication
- Detection and response automation

Therefore, this exercise should be considered foundational training in authentication analysis and brute-force detection rather than a complete production authentication-testing methodology.

---

## Ethical Use

All activity documented here was performed against the authorized OverTheWire Bandit training environment.

The techniques should only be used against systems for which explicit authorization has been obtained.

Repeated authentication attempts against third-party systems without authorization may cause account lockouts, service disruption, or security incidents and are not permitted.

---

## Training Outcome

Successfully completed the Bandit Level 24 → 25 objective.

The exercise strengthened practical understanding of:

- TCP service interaction
- Authentication workflows
- Candidate-input processing
- Controlled automation
- Response analysis
- Brute-force behavior
- Credential protection
- Evidence validation
- SOC detection opportunities
- MITRE ATT&CK contextual mapping

**Status: Completed**
