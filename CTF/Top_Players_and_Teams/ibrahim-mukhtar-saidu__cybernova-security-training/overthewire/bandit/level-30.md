# Bandit Level 30 → 31

## Objective

Investigate an authorized Git repository and determine whether security-relevant information is stored in Git metadata, specifically through repository tags and the objects referenced by those tags.

## Environment

| Item | Value |
|---|---|
| Platform | OverTheWire Bandit |
| Starting Account | bandit30 |
| Target Account | bandit31 |
| Protocol | SSH / Git |
| Repository Type | Git |
| Operating System | Linux |
| Environment | Authorized CTF / training lab |
| Primary Topics | Git tags, Git objects, repository metadata, credential exposure |
| Primary Investigation Tools | Git, SSH, standard Linux utilities |

## Challenge Description

The Bandit Level 30 environment provides an authorized Git repository containing information that is not necessarily visible through the normal working tree.

The important security lesson is that Git repositories contain more than ordinary tracked files. Tags can reference Git objects, and those objects may contain security-relevant information that is not immediately visible when reviewing the current branch.

The investigation therefore examines:

- Repository metadata and structure.
- Available Git tags.
- Objects referenced by tags.
- Git object types and their contents.
- Security-relevant information stored outside the normal working tree.
- Safe handling of credentials discovered during the investigation.

The exercise demonstrates why source-control security reviews should consider repository metadata and objects in addition to current source files.

## Investigation Approach

The investigation focused on:

1. Inspecting repository history.
2. Enumerating Git tags.
3. Inspecting the discovered tag.
4. Determining the object type referenced by the tag.
5. Reading the object content.
6. Treating the resulting credential as sensitive.

## Techniques and Commands

The investigation involved:

- Git tag enumeration
- Git reference inspection
- Git object-type identification
- Git object inspection
- Repository metadata analysis
- Historical repository-state investigation
- Source-control security analysis
- Sensitive-data identification
- Evidence redaction and credential-handling practices

The investigation workflow was:

1. Access the authorized training repository within the controlled environment.
2. Enumerate available Git tags and identify references relevant to the challenge.
3. Inspect the selected tag without modifying repository content.
4. Determine the type of Git object referenced by the tag.
5. Resolve and inspect the referenced object using appropriate Git metadata commands.
6. Analyze the object for security-relevant information.
7. Validate the finding against the authorized training objective.
8. Record only sanitized evidence for public documentation.
9. Keep discovered credentials and sensitive authentication material outside the public repository.

Representative sanitized investigation commands may include:

```bash
git tag --list
git show <sanitized-tag>
git cat-file -t <sanitized-tag>
git cat-file -p <sanitized-tag>
git rev-parse <sanitized-tag>
```

The exact tag name, repository address, object identifiers, challenge credential, and sensitive object content are intentionally omitted from the public documentation.

The purpose of this section is to demonstrate Git reference analysis, object inspection, source-control security investigation, and secure evidence handling without publishing sensitive challenge data.

---

## Security Concepts

- Git tags
- Git objects
- Repository metadata
- Credential exposure
- Source-control security

## SOC / Blue Team Relevance

Git metadata can become an important source of evidence during source-control security investigations.

A SOC or security engineering team investigating a potential repository exposure should consider:

- Credentials stored in Git objects.
- Sensitive information referenced by tags.
- Unexpected tag creation or modification.
- Tags pointing to unusual or obsolete repository states.
- Security-sensitive configuration preserved in repository metadata.
- Repository access from unexpected identities or locations.
- Repeated secret exposure through source-control workflows.
- Developer or automation accounts creating unexpected repository references.

### Defensive Telemetry

Potential telemetry sources include:

| Telemetry | Investigation Value |
|---|---|
| Git audit logs | Identify repository and administrative activity |
| Tag creation/modification events | Detect unexpected repository references |
| Repository access logs | Identify unusual repository access |
| Commit and object metadata | Establish historical relationships and changes |
| Secret-scanning alerts | Detect credentials in repository content |
| CI/CD logs | Identify automated repository access |
| Identity-provider logs | Correlate repository activity with authenticated identities |
| SIEM events | Correlate source-control activity with other security events |

### Detection Opportunities

A production security program could correlate:

**Repository Access → Tag/Object Analysis → Secret Detection → Credential Rotation**

Additional detection logic could flag:

- New tags created by unusual identities.
- Tags referencing unexpected historical objects.
- Credentials detected inside Git objects.
- Repeated secret-scanning findings in the same repository.
- Sensitive configuration appearing in repository metadata.

The key defensive lesson is that repository security monitoring should account for Git metadata and object history, not only the latest files visible on the default branch.

---

## MITRE ATT&CK Relevance

The exercise has defensive relevance to credential exposure through accessible
repository content.

### T1552: Unsecured Credentials

The level demonstrates the defensive risk associated with authentication
material being stored in source-control objects or other accessible repository
data.

From a defensive perspective, organizations should monitor for:

- Passwords embedded in repository content.
- API keys and access tokens.
- Authentication material stored in Git objects.
- Credentials referenced by historical repository data.
- Sensitive configuration committed to source control.
- Secrets repeatedly detected by automated scanning.

### Defensive Controls

Useful controls include:

- Automated secret scanning.
- Pre-commit and pre-push secret detection.
- Repository access controls.
- Protected branches and controlled tag permissions.
- Centralized secret-management systems.
- Credential rotation after confirmed exposure.
- Repository-history remediation where appropriate.
- Monitoring of administrative repository activity.

The ATT&CK mapping is presented as defensive analytical context. The Bandit
exercise itself is an authorized training activity.

---

## Evidence / Screenshot Reference

Evidence for this level should demonstrate the investigation process without
revealing challenge credentials or other sensitive authentication material.

Recommended evidence includes:

1. Authorized repository access.
2. Git tag enumeration.
3. Identification of the relevant tag.
4. Git object-type analysis.
5. Controlled inspection of the referenced object.
6. Sanitized confirmation that security-relevant information was present.

### Screenshot Guidance

Screenshots should show commands and relevant structural findings while
redacting:

- Challenge credentials.
- Authentication tokens.
- Private keys.
- Sensitive repository data.
- Unnecessary account information.

A suitable screenshot sequence is:

**Tag Enumeration → Object Identification → Sanitized Object Inspection**

---

## Evidence Validation

The investigation should distinguish between:

1. The current working-tree contents.
2. Git references such as tags.
3. The object referenced by the tag.
4. The type of Git object being inspected.
5. Security-relevant information contained within the object.

A finding should be considered validated when:

- The relevant tag can be identified in the authorized repository.
- The referenced object can be resolved using Git metadata.
- The object type is confirmed.
- The object content can be inspected through an authorized Git command.
- The observed result is consistent with the intended training objective.

Public documentation should contain only sanitized evidence. The actual
challenge credential is deliberately excluded.

---

## Credential Handling

Any credential or authentication material discovered during the challenge is
intentionally excluded from the public repository.

Sensitive values should be represented as:

`[REDACTED]`

Challenge authentication material should never be copied into:

- Public README files.
- Screenshots.
- Commit messages.
- Source-code examples.
- Issue trackers.
- Public reports.

If a real-world credential is accidentally committed to a repository, the
appropriate defensive response is to treat it as compromised, revoke or
rotate it, investigate potential access, and perform appropriate repository
remediation.

---

## Learning Outcome

This level strengthened practical understanding of:

- Git tags and references.
- Git object types.
- Repository metadata analysis.
- Object-content inspection.
- Source-control security.
- Credential exposure through repository data.
- Security-focused evidence handling.
- Defensive secret-management practices.

The most important lesson is that a Git repository contains more than the
files visible in the current working tree. References such as tags can lead
to repository objects containing information that deserves security review.

From a SOC and Blue Team perspective, this reinforces the need to consider
repository metadata, historical content, access activity, and secret-scanning
results when investigating potential source-control exposure.

---

## Limitations

This exercise uses a controlled CTF repository and does not represent the
full complexity of enterprise source-control environments.

Real-world investigations may additionally involve:

- Large repositories with many branches, tags, and objects.
- Git hosting platforms and centralized audit logs.
- Pull requests and protected branch workflows.
- CI/CD systems and automated repository access.
- Multiple identity providers and privileged accounts.
- Enterprise secret-scanning platforms.
- Credential-revocation and rotation systems.
- Repository-history remediation.
- Legal, compliance, and incident-response requirements.

The techniques demonstrated here should be adapted to the organization's
authorized security processes and operational controls.

---

## Ethical Use

All investigation activity was performed against the authorized OverTheWire
Bandit training environment.

The techniques documented here are intended for cybersecurity education,
defensive analysis, and authorized security testing only.

Do not inspect repository metadata, recover credentials, or analyze repository
history belonging to another person or organization without explicit
authorization.

Challenge credentials and sensitive authentication material are intentionally
excluded from this public documentation.

---

## Training Outcome

The level demonstrated that Git repositories should be treated as security
relevant data stores rather than simply collections of current source files.

The exercise reinforced a practical investigation workflow:

**Repository Access → Tag Enumeration → Object Identification → Object Inspection → Evidence Validation → Secure Reporting**

From a defensive perspective, the exercise highlights the importance of:

- Repository-wide visibility.
- Secret scanning.
- Controlled tag and repository permissions.
- Credential rotation after exposure.
- Historical repository analysis.
- Security monitoring and audit logging.
- Sanitized evidence handling.

The resulting documentation records the security methodology and learning
outcome without publishing the challenge credential or other sensitive
training material.
