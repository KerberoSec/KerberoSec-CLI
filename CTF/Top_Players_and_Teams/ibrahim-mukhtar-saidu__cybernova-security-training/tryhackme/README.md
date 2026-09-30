# TryHackMe Security Training

This directory documents hands-on cybersecurity training completed through
authorized TryHackMe learning environments.

The training focuses on practical cybersecurity skills across Linux,
networking, web security, reconnaissance, vulnerability analysis,
authentication, privilege escalation, security monitoring, and defensive
security concepts.

## Training Approach

Each room is approached as a structured technical investigation:

1. Understand the objective.
2. Enumerate the authorized environment.
3. Identify relevant services, technologies, and attack surfaces.
4. Form and test technical hypotheses.
5. Analyze evidence and observed behavior.
6. Identify the underlying security concept.
7. Document the methodology and findings.
8. Connect the exercise to defensive security and SOC relevance.

## Documentation Structure

- `rooms/`: Individual room reports
- `notes/`: TryHackMe-specific technical notes
- `evidence/`: Selected screenshots and supporting evidence

## Documentation Standard

Room reports should document:

- Objective
- Environment
- Initial observations
- Enumeration
- Investigation methodology
- Commands and tools used
- Observed results
- Technical analysis
- Security implications
- Defensive / SOC relevance
- MITRE ATT&CK relevance where applicable
- Evidence references
- Lessons learned
- Ethical-use scope

## Credential Handling

Challenge credentials, passwords, private keys, tokens, flags, and other
sensitive authentication material must not be published in the repository.

Sensitive values should be represented as `[REDACTED]` where necessary.

Local challenge artifacts should remain excluded through `.gitignore`.

## Ethical Scope

All activities documented here are performed within authorized TryHackMe
learning environments.

The techniques documented in this directory should only be used against
systems for which explicit authorization has been provided.

## Defensive Perspective

TryHackMe exercises are used as practical training for transferable
cybersecurity skills, including:

- Linux investigation
- Network reconnaissance
- Service enumeration
- Web-security analysis
- Authentication analysis
- Vulnerability assessment
- Privilege-boundary analysis
- Security monitoring
- Incident investigation
- Defensive security reasoning

These exercises represent controlled laboratory training and are not
presented as equivalent to production cybersecurity experience.

## Status

Training collection initialized.

Individual TryHackMe rooms will be added progressively as they are completed
and documented.
