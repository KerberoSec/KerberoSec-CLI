# Bandit Level 31 → 32

## Objective

Interact with an authorized Git repository by identifying the required repository workflow, creating the expected file with the challenge-provided content, committing the change, and pushing it to the required remote branch.

The exercise focuses on Git repository interaction, file tracking, staging, commits, remote repositories, branch management, push operations, server-side validation, and secure handling of authentication material.

The objective is to complete the authorized training stage while documenting the Git workflow without publishing challenge credentials or sensitive repository information.

---

## Environment

| Item | Value |
|---|---|
| Platform | OverTheWire Bandit |
| Starting Account | bandit31 |
| Target Account | bandit32 |
| Protocol | SSH / Git |
| Repository Type | Git |
| Operating System | Linux |
| Environment | Authorized CTF / training lab |
| Primary Topics | Git workflow, remote repositories, branch management |
| Primary Investigation Tools | Git, SSH, standard Linux utilities |

---

## Challenge Description

The Bandit Level 31 environment provides an authorized Git repository with instructions describing a required file and repository operation.

Unlike levels that primarily involve recovering information, this stage emphasizes controlled interaction with a remote Git repository.

The workflow requires the participant to:

- Review repository instructions.
- Identify the required filename and content.
- Create the required file.
- Verify the working-tree state.
- Stage the intended change.
- Create a Git commit.
- Confirm the configured remote and branch.
- Push the commit to the authorized repository.
- Validate the server response.
- Avoid publishing authentication material.

The exercise demonstrates that Git operations should be performed deliberately, with repository state and remote configuration verified before changes are pushed.

---

## Investigation Approach

The investigation and execution followed a controlled Git workflow:

1. Inspect the repository README and available instructions.
2. Identify the required filename and expected content.
3. Create the required file in the authorized working directory.
4. Review `git status` to confirm the intended change.
5. Stage only the required file.
6. Review the staged change before committing.
7. Create a descriptive commit.
8. Verify the configured remote repository.
9. Confirm the target branch.
10. Push the commit to the authorized remote.
11. Review the server response for successful validation.
12. Record sanitized evidence without storing credentials.

The workflow emphasizes change control and verification rather than treating `git add`, `git commit`, and `git push` as interchangeable operations.

---

## Techniques and Commands

The investigation involved:

- Git repository instruction analysis
- Required-file identification
- File creation and content validation
- Git working-tree inspection
- Git staging-area analysis
- Commit creation and validation
- Remote repository inspection
- Branch verification
- Authorized push operations
- Server-side response validation
- Source-control change management
- Credential redaction and secure evidence handling

The investigation workflow was:

1. Review the repository instructions and identify the required repository operation.
2. Determine the expected filename and training content.
3. Create the required file within the authorized working directory.
4. Inspect the working-tree state before staging changes.
5. Stage only the intended file.
6. Review the staged change before creating the commit.
7. Create a descriptive commit containing only the intended change.
8. Inspect the configured remote and verify the target branch.
9. Push the commit only to the authorized training repository.
10. Analyze the server response to determine whether the training objective was satisfied.
11. Record sanitized evidence of the completed workflow.
12. Keep authentication material outside the repository and public documentation.

Representative sanitized investigation commands may include:

```bash
git status
git diff
git add <required-file>
git diff --cached
git commit -m "<sanitized-commit-message>"
git remote -v
git branch --show-current
git push <authorized-remote> <authorized-branch>
```

The exact repository address, required challenge content, credentials, authentication material, and challenge-specific validation response are intentionally omitted from the public documentation.

The purpose of this section is to demonstrate controlled Git change management, staging and commit validation, remote/branch verification, authorized push operations, and secure evidence handling without publishing sensitive challenge data.

---

## Security Concepts

This level demonstrates several important source-control concepts:

- **Git tracking:** Files must be tracked and staged before they become part of a commit.
- **Staging area:** The staging area provides a controlled boundary between working-tree changes and committed changes.
- **Commits:** Commits provide a persistent record of repository changes.
- **Remote repositories:** A remote repository provides the destination for synchronized Git history.
- **Branches:** Branches determine where commits are applied and shared.
- **Push operations:** A push transfers local commits to an authorized remote repository.
- **Repository validation:** Server-side systems can validate whether a submitted change satisfies expected conditions.
- **Change control:** Reviewing repository state before committing or pushing reduces accidental modifications.
- **Credential security:** Authentication material should not be embedded in files, commits, screenshots, or public documentation.

These concepts are practiced only within the authorized OverTheWire training environment.

---

## SOC / Blue Team Relevance

Git activity can provide valuable security telemetry during investigations involving source-code repositories and software supply chains.

A SOC or security engineering team should consider:

- Unexpected repository changes.
- Unauthorized commits.
- Suspicious pushes.
- Unexpected branch modifications.
- Changes to security-sensitive files.
- Abnormal repository access.
- Compromised developer or automation accounts.
- Supply-chain security risks.
- Unusual activity from CI/CD identities.

### Defensive Telemetry

Potential telemetry sources include:

| Telemetry | Investigation Value |
|---|---|
| Git audit logs | Identify repository and administrative activity |
| Push events | Identify who submitted repository changes |
| Commit metadata | Establish author, timing, and change relationships |
| Branch protection events | Detect attempted policy violations |
| Repository access logs | Identify unusual repository access |
| Identity-provider logs | Correlate Git activity with authenticated identities |
| CI/CD logs | Identify automated repository modifications |
| Secret-scanning alerts | Detect credentials introduced through commits |
| SIEM events | Correlate source-control activity with broader security events |

### Detection Opportunities

A production security program could correlate:

**Repository Access → File Modification → Commit → Push → Validation / Review**

Detection logic could flag:

- Pushes from unusual identities or locations.
- Unexpected changes to protected branches.
- Repository modifications outside normal working hours or workflows.
- Large or unusual changes from newly created accounts.
- Credentials detected in newly pushed commits.
- Repeated failed push attempts.
- Suspicious activity from CI/CD service accounts.

The key defensive lesson is that source-control operations should be treated as security-relevant events, particularly in environments where repositories support production software or infrastructure.

---

## MITRE ATT&CK Relevance

This level does not map cleanly to a specific MITRE ATT&CK adversary technique because the exercise primarily demonstrates legitimate Git repository administration and controlled source submission.

The activity is therefore documented as **defensive source-control workflow training** rather than being artificially mapped to an adversary technique.

From a defensive perspective, the same Git telemetry can still support investigations involving:

- Unauthorized repository access.
- Compromised developer accounts.
- Malicious code changes.
- Supply-chain compromise.
- Credential exposure.

ATT&CK mappings should be applied only where the observed behavior genuinely corresponds to the technique definition.

---

## Evidence / Screenshot Reference

Evidence should demonstrate the Git workflow without exposing authentication material or private repository information.

Recommended evidence includes:

1. Repository instructions identifying the required operation.
2. Creation of the required file.
3. `git status` showing the intended change.
4. Staging of the required file.
5. Commit creation.
6. Remote and branch verification.
7. Sanitized push output.
8. Successful server-side validation.

### Screenshot Guidance

Screenshots should show relevant commands and repository state while redacting:

- Passwords.
- Access tokens.
- Private keys.
- SSH authentication material.
- Private repository URLs where appropriate.
- Unnecessary account information.

A suitable evidence sequence is:

**Instructions → File Creation → Git Status → Commit → Remote/Branch Verification → Sanitized Push Result**

---

## Evidence Validation

The result should be considered validated when:

- The required file is present with the expected training content.
- Git recognizes the intended file change.
- The correct file is staged.
- A commit contains the intended change.
- The configured remote is the authorized training repository.
- The intended branch is confirmed.
- The commit is successfully pushed.
- The server response confirms the expected training condition.

Public documentation should contain only sanitized evidence.

Authentication material used during the exercise should never be included in screenshots, reports, commit messages, or public repository files.

---

## Credential Handling

Authentication material used to access the authorized training repository is intentionally excluded from this documentation.

Sensitive values should be represented as:

`[REDACTED]`

Challenge credentials should never be copied into:

- Public README files.
- Screenshots.
- Commit messages.
- Source-code examples.
- Issue trackers.
- Public reports.

If a real-world credential is accidentally exposed through a repository, the appropriate defensive response is to treat it as compromised, revoke or rotate it, investigate potential access, and perform appropriate repository remediation.

---

## Learning Outcome

This level strengthened practical understanding of:

- Git file tracking.
- Staging and commits.
- Remote repository configuration.
- Branch verification.
- Controlled push operations.
- Repository validation.
- Source-control change management.
- Secure credential handling.

The most important lesson is that repository changes should be deliberate and verifiable before they are pushed to a remote system.

From a SOC and Blue Team perspective, the exercise also reinforces the importance of monitoring repository access, commits, pushes, branch changes, identity activity, and secret-scanning results.

---

## Limitations

This exercise uses a controlled CTF repository and does not represent the full complexity of enterprise Git environments.

Real-world source-control investigations may additionally involve:

- Git hosting platforms.
- Protected branches.
- Pull requests and mandatory reviews.
- CI/CD pipelines.
- Code-signing systems.
- Centralized identity providers.
- Repository audit logs.
- Secret-scanning platforms.
- Software composition analysis.
- Enterprise incident-response procedures.
- Legal and compliance requirements.

The techniques demonstrated here should be adapted to the organization's authorized security processes and operational controls.

---

## Ethical Use

All repository activity was performed against the authorized OverTheWire Bandit training environment.

The techniques documented here are intended for cybersecurity education, defensive analysis, and authorized security testing only.

Do not modify, push to, or otherwise interact with repositories belonging to another person or organization without explicit authorization.

Challenge credentials and sensitive authentication material are intentionally excluded from this public documentation.

---

## Training Outcome

The level demonstrated a complete controlled Git submission workflow:

**Repository Instructions → File Creation → Git Status → Staging → Commit → Remote/Branch Verification → Authorized Push → Server Validation → Secure Reporting**

From a defensive perspective, the exercise highlights the importance of:

- Controlled source-code changes.
- Repository access monitoring.
- Branch protection.
- Commit and push auditing.
- Identity verification.
- Secret scanning.
- Supply-chain security controls.
- Sanitized evidence handling.

The resulting documentation records the Git workflow and security lessons without publishing challenge credentials or other sensitive training material.
