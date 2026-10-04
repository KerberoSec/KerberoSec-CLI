# Bandit Level 27 → 28

## Objective

Analyze an authorized Git repository and determine whether sensitive information can remain recoverable through repository history even when it is no longer present in the current working tree.

The exercise focuses on Git repository structure, tracked content, commit history, historical revisions, accidental credential exposure, source-control security, and defensive secret-management practices.

The objective is to retrieve the information required by the next authorized training stage while documenting the investigation methodology without publishing challenge credentials or sensitive repository content.

---

## Environment

| Item | Value |
|---|---|
| Platform | OverTheWire Bandit |
| Starting Account | bandit27 |
| Target Account | bandit28 |
| Protocol | SSH / Git |
| Repository Type | Git |
| Operating System | Linux |
| Environment | Authorized CTF / training lab |
| Primary Topics | Git, repository history, source-control security, credential exposure |
| Primary Investigation Tools | Git, SSH, standard Linux utilities |

---

## Challenge Description

The Bandit Level 27 environment introduces a Git repository that must be investigated as part of the authorized training exercise.

The important security lesson is that a repository is more than its current files. Git stores historical revisions, commit metadata, and previous versions of tracked content. As a result, sensitive information removed from the latest version may still remain recoverable from earlier commits.

The investigation therefore examines:

- Repository metadata and structure.
- Tracked files and current content.
- Commit history and revision information.
- Historical repository content.
- Potentially exposed authentication material.
- Safe handling of information discovered during the investigation.

The exercise demonstrates why deleting a secret from the latest version of a file does not necessarily remove it from version-control history.

---

## Investigation Approach

The investigation followed a structured source-control security workflow:

1. Establish access to the authorized Git repository.
2. Confirm the repository identity and local working context.
3. Inspect the repository structure and Git metadata.
4. Enumerate tracked files.
5. Review commit history and available revisions.
6. Compare current content with historical repository states.
7. Identify security-relevant information exposed through repository history.
8. Validate the recovered information against the authorized training objective.
9. Preserve only sanitized evidence for public documentation.
10. Keep challenge credentials and sensitive authentication material outside the repository.

The investigation emphasizes understanding repository history as a security data source rather than treating Git commands as isolated steps to memorize.

---

## Security Concepts

The exercise demonstrates several source-control security concepts:

- **Version control:** Git records changes to files over time and provides a history of repository states.
- **Commit history:** Previous commits may contain information that is no longer visible in the current working tree.
- **Tracked content:** Files committed to a repository become part of its version history unless history is deliberately rewritten.
- **Credential exposure:** Secrets accidentally committed to source control can remain recoverable even after deletion from the latest revision.
- **Repository metadata:** Git metadata can provide valuable information about project structure, authorship, timestamps, and historical changes.
- **Historical revision analysis:** Security investigations may require examining older revisions rather than only the current state.
- **Secret management:** Authentication material should be stored using appropriate secret-management mechanisms rather than hard-coded into source code or repositories.
- **Evidence preservation:** Investigators should preserve relevant findings while avoiding unnecessary disclosure of sensitive information.

These concepts are studied only within the authorized OverTheWire training environment.

---

## SOC / Blue Team Relevance

Repository history can become an important source of evidence during security investigations.

A SOC or security engineering team investigating a potential source-code leak should consider:

- Secrets accidentally committed to repositories.
- Credentials removed from the current branch but still present in historical commits.
- Unexpected repository modifications.
- Suspicious commits or unusual authorship.
- Unauthorized changes to security-sensitive configuration.
- Repository cloning or access from unexpected locations.
- Tokens or credentials exposed through source-control systems.
- Developers committing sensitive configuration files.
- Repeated secret exposure despite previous remediation.

### Defensive Telemetry

Potential telemetry sources include:

| Telemetry | Investigation Value |
|---|---|
| Git audit logs | Identify repository access and administrative actions |
| Commit metadata | Establish when and by whom changes were made |
| Repository access logs | Identify unusual cloning or repository access |
| Secret-scanning alerts | Detect credentials and tokens in source content |
| CI/CD logs | Identify secrets exposed during automated builds |
| Pull-request activity | Review changes before they enter protected branches |
| Identity-provider logs | Correlate repository access with user authentication |
| SIEM events | Correlate source-control activity with other security events |

### Detection Opportunities

A production security program could correlate:

**Repository Access → Suspicious Commit → Secret Detection → Credential Rotation**

Additional controls could alert on:

- New credentials detected in commits.
- Secrets appearing in public or unauthorized repositories.
- High-risk files containing authentication material.
- Unusual repository cloning activity.
- Commits that introduce and immediately remove sensitive values.
- Repeated secret-scanning violations by the same project or identity.

The key defensive lesson is that removing a secret from the current file does not necessarily eliminate the exposure. Historical repository states must also be considered.

---

## MITRE ATT&CK Relevance

The exercise has defensive relevance to credential exposure and the recovery of authentication material from accessible data sources.

### T1552: Unsecured Credentials

The level demonstrates the defensive risk associated with authentication material being stored in accessible source-control content or repository history.

From a defensive perspective, organizations should monitor for:

- Passwords embedded in source code.
- API keys and access tokens.
- Private authentication material.
- Credentials stored in configuration files.
- Secrets appearing in commit history.
- Sensitive values copied between repositories.

### Defensive Controls

Useful controls include:

- Automated secret scanning.
- Pre-commit hooks.
- Protected branches.
- Repository access controls.
- Centralized secret-management systems.
- Credential rotation after confirmed exposure.
- Repository-history remediation when appropriate.
- Developer security awareness training.

The ATT&CK mapping is presented as defensive analytical context. The Bandit exercise itself is an authorized training activity.

---

## Techniques and Commands

The investigation involved:

- Git repository cloning
- Repository metadata inspection
- Tracked-file enumeration
- Commit-history inspection
- Historical revision analysis
- Source-control content comparison
- Repository object inspection
- Sensitive-data identification
- Credential-handling and evidence-redaction practices

The investigation workflow was:

1. Access the authorized training repository using the provided challenge credentials.
2. Clone or inspect the repository within the controlled training environment.
3. Review the repository structure and tracked files.
4. Inspect commit history and identify relevant historical revisions.
5. Compare current content with previous revisions to identify changes.
6. Determine whether sensitive information was present in repository history.
7. Validate the historical finding against the authorized challenge objective.
8. Record only sanitized repository-analysis evidence.
9. Keep discovered credentials and sensitive authentication material outside the public repository.

Representative sanitized investigation commands may include:

```bash
git clone <authorized-repository>
git status
git log --oneline
git log --all --oneline
git show <sanitized-revision>
git diff <sanitized-revision> <sanitized-revision>
```

The exact repository address, credentials, sensitive historical content, and challenge-specific authentication material are intentionally omitted from the public documentation.

The purpose of this section is to demonstrate source-control investigation, historical revision analysis, and secure evidence handling without publishing sensitive challenge data.

---

## Evidence / Screenshot Reference

Evidence for this level consists of:

- Authorized repository access.
- Repository structure observations.
- Commit-history analysis.
- Historical-content investigation.
- Validation of the training objective.

Screenshots may be added selectively to demonstrate repository inspection and historical analysis without exposing credentials, tokens, or other sensitive repository content.

---

## Evidence Validation

The investigation should distinguish between:

1. Information present in the current working tree.
2. Information present in previous repository revisions.
3. Repository metadata associated with historical changes.
4. Sensitive authentication material discovered during the exercise.

A finding should be considered validated when it can be reproduced through the authorized repository history and is consistent with the intended training objective.

Public documentation should contain only sanitized evidence.

---

## Credential Handling

Any credential or authentication material discovered during the challenge is intentionally excluded from the public repository.

Sensitive values should be represented as:

`[REDACTED]`

Credentials discovered during security exercises should never be copied into:

- Public README files.
- Screenshots.
- Commit messages.
- Source-code examples.
- Issue trackers.
- Public reports.

If a real-world credential is accidentally committed, the appropriate defensive response is to treat it as compromised, revoke or rotate it, investigate access, and then remove the sensitive material through an appropriate repository-remediation process.

---

## Learning Outcome

This level strengthened practical understanding of:

- Git repository structure.
- Commit history.
- Historical revision analysis.
- Source-control security.
- Credential exposure.
- Secret scanning.
- Evidence handling.
- Secure software-development practices.

The most important lesson is that source-control history can preserve sensitive information long after it has been removed from the latest version of a file.

---

## Limitations

This exercise uses a controlled CTF repository and does not represent the full complexity of enterprise source-control environments.

Real-world investigations may additionally involve:

- Distributed Git hosting platforms.
- Large repositories and many branches.
- Pull-request workflows.
- CI/CD pipelines.
- Multiple identity providers.
- Repository access logs.
- Secret-scanning platforms.
- Credential-rotation systems.
- Legal and incident-response requirements.

The techniques demonstrated here should be adapted to the organization's authorized security processes.

---

## Ethical Use

All investigation activity was performed against the authorized OverTheWire Bandit training environment.

The techniques documented here are intended for cybersecurity education, defensive analysis, and authorized security testing only.

Do not use repository inspection or credential-discovery techniques against repositories, accounts, or systems without explicit authorization.

---

## Training Outcome

The level demonstrated that Git repositories must be treated as historical security records rather than simply collections of current files.

From a defensive perspective, the exercise reinforces the importance of secret scanning, access control, credential rotation, repository-history awareness, and secure source-code management.
