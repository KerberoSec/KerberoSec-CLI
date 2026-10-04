# Bandit Level 28 → 29

## Objective

Investigate an authorized Git repository and determine whether sensitive information can remain recoverable through commit history even after it has been removed from the current version of a tracked file.

The exercise focuses on Git repository structure, commit history, revision comparison, deleted content, accidental credential exposure, source-control security, and defensive secret-management practices.

The objective is to retrieve the information required by the next authorized training stage while documenting the investigation methodology without publishing challenge credentials or sensitive repository content.

---

## Environment

| Item | Value |
|---|---|
| Platform | OverTheWire Bandit |
| Starting Account | bandit28 |
| Target Account | bandit29 |
| Protocol | SSH / Git |
| Repository Type | Git |
| Operating System | Linux |
| Environment | Authorized CTF / training lab |
| Primary Topics | Git history, revision comparison, credential exposure |
| Primary Investigation Tools | Git, SSH, standard Linux utilities |

---

## Challenge Description

The Bandit Level 28 environment provides an authorized Git repository containing historical information that must be investigated.

The key security concept is that the current working tree represents only the latest visible state of a repository. Earlier commits can contain content that has since been modified or removed.

This means that deleting a sensitive value from the current version of a file does not automatically eliminate its historical exposure.

The investigation therefore examines:

- The current repository state.
- Tracked files and their contents.
- Commit history and revision metadata.
- Differences between repository revisions.
- Content removed from later versions.
- Potentially exposed authentication material.
- Safe handling and documentation of discovered information.

The exercise demonstrates why security investigations involving source control should consider both current and historical repository states.

---

## Investigation Approach

The investigation followed a structured Git-history analysis workflow:

1. Establish access to the authorized Git repository.
2. Confirm the repository identity and local working context.
3. Inspect the repository structure and tracked files.
4. Review the commit history and available revisions.
5. Compare the current version with earlier revisions.
6. Identify content that was modified or removed.
7. Determine whether historical content contains security-relevant information.
8. Validate the finding against the authorized training objective.
9. Preserve only sanitized evidence for public documentation.
10. Keep challenge credentials and sensitive authentication material outside the public repository.

The investigation emphasizes understanding Git history as a security evidence source rather than treating individual Git commands as isolated techniques.

---

## Security Concepts

The exercise demonstrates several source-control security concepts:

- **Git history:** Git preserves previous repository states through commits.
- **Revision comparison:** Comparing revisions can reveal changes that are not visible in the latest working tree.
- **Deleted content:** Information removed from a current file may remain available in earlier commits.
- **Credential exposure:** Authentication material accidentally committed to source control can remain recoverable through repository history.
- **Repository metadata:** Commit information can provide useful context about when and how changes occurred.
- **Historical investigation:** Security reviews may require examining older revisions rather than only the latest branch state.
- **Secret management:** Credentials should be stored through appropriate secret-management mechanisms instead of source-controlled files.
- **Evidence preservation:** Investigators should preserve relevant evidence while preventing unnecessary disclosure of sensitive information.
- **Credential rotation:** Once a real credential has been exposed, removing it from the repository is not sufficient; the credential should also be revoked or rotated.

These concepts are studied only within the authorized OverTheWire training environment.

---

## SOC / Blue Team Relevance

Git history can become an important source of evidence during security investigations involving source-code repositories.

A SOC or security engineering team investigating possible credential exposure should examine:

- Secrets introduced through source-code commits.
- Credentials removed from the latest revision but retained historically.
- Unexpected changes to security-sensitive files.
- Unusual repository access or cloning activity.
- Suspicious commits or unexpected authorship.
- Sensitive configuration files committed to repositories.
- Repeated secret-scanning violations.
- Authentication material exposed through development workflows.
- Repository activity occurring shortly before or after a suspected credential compromise.

### Defensive Telemetry

Potential telemetry sources include:

| Telemetry | Investigation Value |
|---|---|
| Git audit logs | Identify repository access and administrative actions |
| Commit metadata | Establish when changes occurred and associated authorship |
| Repository access logs | Identify unusual cloning or repository access |
| Secret-scanning alerts | Detect credentials and tokens in source content |
| Pull-request activity | Review sensitive changes before merge |
| CI/CD logs | Identify secrets exposed during automated workflows |
| Identity-provider logs | Correlate repository activity with user authentication |
| SIEM events | Correlate source-control activity with other security events |

### Detection Opportunities

A defensive monitoring workflow could correlate:

**Repository Access → Sensitive Commit → Historical Secret Detection → Credential Rotation**

Detection logic could alert when:

- A commit introduces a credential-like value.
- A sensitive value is removed immediately after being introduced.
- A repository contains known secret patterns.
- A developer repeatedly commits sensitive configuration.
- A repository is cloned from an unusual location.
- A previously exposed credential remains active after discovery.

The key defensive lesson is that source-control history should be treated as potentially sensitive security data.

---

## MITRE ATT&CK Relevance

The exercise has defensive relevance to credential exposure through accessible data.

### T1552: Unsecured Credentials

The level demonstrates the risk of authentication material being stored in accessible source-control content or historical revisions.

From a defensive perspective, organizations should monitor for:

- Passwords embedded in source code.
- API keys and access tokens.
- Authentication material stored in configuration files.
- Secrets appearing in commit history.
- Sensitive values copied between repositories.
- Credentials that remain active after historical exposure.

### Defensive Controls

Useful controls include:

- Automated secret scanning.
- Pre-commit and pre-push checks.
- Protected branches.
- Repository access controls.
- Centralized secret-management systems.
- Credential rotation after confirmed exposure.
- Repository-history remediation where appropriate.
- Developer security awareness training.

The ATT&CK mapping is presented as defensive analytical context. The Bandit exercise itself is an authorized training activity.

---

## Techniques and Commands

The investigation involved:

- Git repository cloning
- Repository metadata inspection
- Tracked-file enumeration
- Commit-history inspection
- Revision comparison
- Historical-content analysis
- Deleted-content investigation
- Git object and revision inspection
- Source-control security analysis
- Sensitive-data identification
- Evidence redaction and credential-handling practices

The investigation workflow was:

1. Access the authorized training repository using the provided challenge credentials.
2. Clone or inspect the repository within the controlled training environment.
3. Review the repository structure and currently tracked files.
4. Inspect the commit history for relevant revisions.
5. Compare current content with previous revisions.
6. Investigate historical versions of files that may no longer contain the same content.
7. Identify security-relevant information present in repository history.
8. Validate the historical finding against the authorized challenge objective.
9. Record only sanitized evidence for public documentation.
10. Keep discovered credentials and sensitive authentication material outside the public repository.

Representative sanitized investigation commands may include:

```bash
git clone <authorized-repository>
git status
git log --oneline --all
git log --stat
git show <sanitized-revision>
git diff <sanitized-revision> <sanitized-revision>
git log --all -- <sanitized-file>
```

The exact repository address, credentials, revision identifiers, sensitive historical content, and challenge-specific authentication material are intentionally omitted from the public documentation.

The purpose of this section is to demonstrate source-control investigation, historical revision analysis, deleted-content investigation, and secure evidence handling without publishing sensitive challenge data.

---

## Evidence / Screenshot Reference

Evidence for this level consists of:

- Authorized repository access.
- Current repository-state observations.
- Commit-history analysis.
- Comparison of current and historical revisions.
- Identification of security-relevant historical content.
- Validation of the training objective.

Screenshots may be added selectively to demonstrate Git-history analysis without exposing credentials, tokens, passwords, or other sensitive repository content.

---

## Evidence Validation

The investigation should distinguish between:

1. Information present in the current working tree.
2. Information present in previous repository revisions.
3. Metadata associated with historical commits.
4. Sensitive authentication material discovered during the exercise.

A finding should be considered validated when:

- The relevant repository revision can be identified.
- The historical content can be reproduced within the authorized environment.
- The finding is consistent with the intended training objective.
- Public evidence can be sanitized without revealing the underlying credential.

Only sanitized findings should be included in the public portfolio repository.

---

## Credential Handling

Any credential or authentication material discovered during the challenge is intentionally excluded from public documentation.

Sensitive values should be represented as:

`[REDACTED]`

Credentials discovered during security exercises should never be copied into:

- Public README files.
- Screenshots.
- Commit messages.
- Source-code examples.
- Issue trackers.
- Public reports.

If a real-world credential is accidentally committed, the appropriate defensive response is to treat it as compromised, revoke or rotate it, investigate access, and then perform appropriate repository-history remediation.

---

## Learning Outcome

This level strengthened practical understanding of:

- Git repository structure.
- Commit history.
- Revision comparison.
- Historical-content analysis.
- Source-control security.
- Credential exposure.
- Secret scanning.
- Evidence handling.
- Secure software-development practices.

The most important lesson is that deleting sensitive information from the latest version of a file does not necessarily remove its historical exposure.

---

## Limitations

This exercise uses a controlled CTF repository and does not represent the full complexity of enterprise source-control environments.

Real-world investigations may additionally involve:

- Large repositories with many branches.
- Hosted Git platforms.
- Pull-request workflows.
- CI/CD pipelines.
- Multiple identity providers.
- Repository access and audit logs.
- Enterprise secret-scanning platforms.
- Credential-management systems.
- Legal and incident-response requirements.
- Repository-history rewriting and remediation procedures.

The techniques demonstrated here should be adapted to the organization's authorized security processes.

---

## Ethical Use

All investigation activity was performed against the authorized OverTheWire Bandit training environment.

The techniques documented here are intended for cybersecurity education, defensive analysis, and authorized security testing only.

Do not use repository-history inspection or credential-discovery techniques against repositories, accounts, or systems without explicit authorization.

---

## Training Outcome

The level demonstrated that Git repositories should be treated as historical security records rather than simply collections of current files.

From a defensive perspective, the exercise reinforces the importance of secret scanning, repository-history awareness, access control, credential rotation, evidence handling, and secure source-code management.
