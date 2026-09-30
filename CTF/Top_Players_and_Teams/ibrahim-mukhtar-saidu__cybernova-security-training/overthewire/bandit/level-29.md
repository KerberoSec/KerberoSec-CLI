# Bandit Level 29 → 30

## Objective

Investigate an authorized Git repository and determine whether security-relevant information is exposed through branches or development-related repository content that is not present in the default branch.

The exercise focuses on Git branch enumeration, remote and development branches, repository history, branch comparison, development artifacts, accidental credential exposure, source-control security, and defensive repository monitoring.

The objective is to retrieve the information required by the next authorized training stage while documenting the investigation methodology without publishing challenge credentials or sensitive repository content.

---

## Environment

| Item | Value |
|---|---|
| Platform | OverTheWire Bandit |
| Starting Account | bandit29 |
| Target Account | bandit30 |
| Protocol | SSH / Git |
| Repository Type | Git |
| Operating System | Linux |
| Environment | Authorized CTF / training lab |
| Primary Topics | Git branches, development artifacts, repository security |
| Primary Investigation Tools | Git, SSH, standard Linux utilities |

---

## Challenge Description

The Bandit Level 29 environment provides an authorized Git repository in which relevant information is not necessarily located on the default branch.

The important security lesson is that reviewing only the default branch does not provide complete visibility into a repository. Development, testing, feature, and remote branches may contain older code, debugging information, configuration data, or sensitive material that is absent from the primary branch.

The investigation therefore examines:

- Available local and remote branches.
- Branch relationships and repository structure.
- Differences between branches.
- Commit history associated with development work.
- Development or testing artifacts.
- Security-sensitive information exposed outside the default branch.
- Safe handling of information discovered during the investigation.

The exercise demonstrates why repository security reviews should consider the complete accessible repository rather than only the branch used for production development.

---

## Investigation Approach

The investigation followed a structured source-control security workflow:

1. Establish access to the authorized Git repository.
2. Confirm the repository identity and local working context.
3. Inspect repository metadata and available branches.
4. Enumerate local and remote branch references.
5. Identify branches that differ from the default branch.
6. Review commits associated with relevant development branches.
7. Compare branch contents and inspect security-relevant differences.
8. Identify information exposed through non-default repository states.
9. Validate the finding against the authorized training objective.
10. Preserve only sanitized evidence for public documentation.
11. Keep challenge credentials and sensitive authentication material outside the repository.

The investigation emphasizes branch visibility and repository-wide analysis rather than treating Git commands as isolated steps to memorize.

---

## Security Concepts

The exercise demonstrates several source-control security concepts:

- **Git branches:** Branches provide separate lines of development and may contain content unavailable from the default branch.
- **Remote branches:** Remote references can reveal repository states that are not represented by the currently checked-out branch.
- **Branch comparison:** Comparing branches can identify configuration, code, or security-relevant differences.
- **Development artifacts:** Debugging files, test configuration, temporary code, and development notes may expose information that should not be broadly accessible.
- **Repository visibility:** Security posture depends on the complete set of repository content accessible to an identity.
- **Credential exposure:** Secrets accidentally committed to any accessible branch can create security risk even if absent from the default branch.
- **Source-control history:** Historical commits can preserve information that has been removed from later repository states.
- **Access control:** Repository and branch permissions should restrict sensitive development content to appropriate users.
- **Evidence preservation:** Investigators should preserve relevant findings while avoiding unnecessary disclosure of sensitive material.

These concepts are studied only within the authorized OverTheWire training environment.

---

## SOC / Blue Team Relevance

Development branches can become a source of security-relevant evidence during incident response, source-code reviews, and investigations into accidental data exposure.

A SOC or security engineering team investigating suspicious repository activity should consider:

- Access to unusual or rarely used branches.
- Repository cloning followed by branch enumeration.
- Access to development or testing branches by unexpected identities.
- Sensitive configuration appearing outside protected branches.
- Credentials or tokens committed to development branches.
- Debugging artifacts that reveal internal infrastructure.
- Unexpected branch creation or modification.
- Unauthorized changes to security-sensitive files.
- Repository access followed by suspicious source-code downloads.

### Defensive Telemetry

Potential telemetry sources include:

| Telemetry | Investigation Value |
|---|---|
| Repository access logs | Identify repository access and cloning activity |
| Git audit logs | Track branch, repository, and administrative actions |
| Branch creation events | Identify unexpected development activity |
| Commit metadata | Establish authorship and timing of changes |
| Pull-request activity | Review proposed changes and branch relationships |
| Secret-scanning alerts | Detect credentials and tokens across branches |
| CI/CD logs | Identify sensitive data exposed during automated builds |
| Identity-provider logs | Correlate repository activity with authenticated users |
| SIEM events | Correlate source-control activity with other security events |

### Detection Opportunities

A production security program could correlate:

**Repository Access → Branch Enumeration → Sensitive Branch Access → Source-Code Retrieval**

Additional detection logic could flag:

- Unusual access to development branches.
- Access to sensitive branches by identities outside the expected development group.
- New branches containing credentials or sensitive configuration.
- Large repository downloads following unusual authentication activity.
- Repeated secret-scanning violations within development branches.
- Branch modifications that introduce and quickly remove sensitive information.

The key defensive lesson is that the default branch is not necessarily the complete security boundary. All accessible branches should be considered part of the repository's security and monitoring scope.

---

## MITRE ATT&CK Relevance

The exercise has defensive relevance to credential exposure and the discovery of sensitive information stored in accessible repository content.

### T1552: Unsecured Credentials

Authentication material stored in development branches, configuration files, or repository history can become accessible to users who obtain access to those repository states.

From a defensive perspective, organizations should monitor for:

- Passwords embedded in source code.
- API keys and access tokens.
- Private authentication material.
- Credentials stored in development configuration.
- Secrets present in non-default branches.
- Sensitive values preserved in repository history.

### Defensive Controls

Useful controls include:

- Secret scanning across all branches.
- Pre-commit and pre-push security checks.
- Protected branches.
- Repository and branch access controls.
- Centralized secret-management systems.
- Credential rotation after confirmed exposure.
- Repository-history remediation when appropriate.
- Monitoring of unusual branch access.
- Developer security awareness training.

The ATT&CK mapping is presented as defensive analytical context. The Bandit exercise itself is an authorized training activity.

---

## Techniques and Commands

The investigation involved:

- Git repository cloning
- Branch enumeration
- Local and remote branch inspection
- Branch comparison
- Commit-history inspection
- Development-artifact investigation
- Historical revision analysis
- Repository-wide security analysis
- Sensitive-data identification
- Evidence redaction and credential-handling practices

The investigation workflow was:

1. Access the authorized training repository using the provided challenge credentials.
2. Clone or inspect the repository within the controlled training environment.
3. Review the repository structure and identify available branches.
4. Enumerate local and remote branch references.
5. Compare the default branch with other available repository states.
6. Inspect commits associated with relevant development branches.
7. Review historical revisions for security-relevant content.
8. Determine whether information absent from the default branch is present elsewhere in the repository.
9. Validate the finding against the authorized challenge objective.
10. Record only sanitized repository-analysis evidence.
11. Keep discovered credentials and sensitive authentication material outside the public repository.

Representative sanitized investigation commands may include:

```bash
git clone <authorized-repository>
git status
git branch --all
git log --oneline --all
git log --oneline <sanitized-branch>
git diff <default-branch> <sanitized-development-branch>
git show <sanitized-revision>
```

The exact repository address, credentials, branch names, revision identifiers, sensitive historical content, and challenge-specific authentication material are intentionally omitted from the public documentation.

The purpose of this section is to demonstrate branch enumeration, source-control investigation, historical analysis, and secure evidence handling without publishing sensitive challenge data.

---

## Evidence / Screenshot Reference

Evidence for this level consists of:

- Authorized repository access.
- Branch enumeration results.
- Identification of non-default repository states.
- Branch comparison observations.
- Commit-history analysis.
- Validation of the training objective.

Screenshots may be added selectively to demonstrate branch analysis without exposing credentials, tokens, internal configuration, or other sensitive repository content.

---

## Evidence Validation

The investigation should distinguish between:

1. Content present in the default branch.
2. Content present in development or other branches.
3. Content preserved in historical commits.
4. Repository metadata associated with branch activity.
5. Sensitive authentication material discovered during the exercise.

A finding should be considered validated when it can be reproduced through the authorized repository state or history and is consistent with the intended training objective.

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

- Git branches.
- Local and remote branch enumeration.
- Branch comparison.
- Development repository states.
- Source-control security.
- Credential exposure.
- Repository-wide security review.
- Evidence handling.
- Secure software-development practices.

The most important lesson is that reviewing only the default branch can provide an incomplete picture of a repository's security posture.

---

## Limitations

This exercise uses a controlled CTF repository and does not represent the full complexity of enterprise source-control environments.

Real-world investigations may additionally involve:

- Large distributed repositories.
- Multiple development teams.
- Protected and unprotected branches.
- Pull-request workflows.
- CI/CD pipelines.
- Repository-hosting audit logs.
- Identity and access-management systems.
- Automated secret-scanning platforms.
- Credential-rotation systems.
- Legal and incident-response requirements.

The techniques demonstrated here should be adapted to the organization's authorized security processes.

---

## Ethical Use

All investigation activity was performed against the authorized OverTheWire Bandit training environment.

The techniques documented here are intended for cybersecurity education, defensive analysis, and authorized security testing only.

Do not use repository inspection, branch enumeration, or credential-discovery techniques against repositories, accounts, or systems without explicit authorization.

---

## Training Outcome

The level demonstrated that repository security cannot be evaluated reliably by examining only the default branch.

From a defensive perspective, the exercise reinforces the importance of repository-wide visibility, branch access controls, secret scanning, monitoring, credential rotation, and secure source-code management.
