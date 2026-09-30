# Bandit Level 17 → 18

## Objective

Identify the changed credential between two password files and use the resulting credential to authenticate to the Bandit Level 18 account.

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit17 |
| Target Account | bandit18 |
| Authorization | Authorized cybersecurity training lab |
| Investigation Type | File comparison and configuration analysis |

## Investigation Approach

The challenge provided two files containing password data. The investigation focused on comparing the files and identifying the entry that differed.

The workflow was:

1. Access the Bandit Level 17 environment using the SSH private key obtained from the previous level.
2. Inspect the available password files.
3. Compare the files to identify the changed entry.
4. Treat the differing value as the credential for the next level.
5. Use SSH to authenticate to the Bandit Level 18 account.

## Techniques and Commands

The investigation involved:

- SSH private-key authentication
- File inspection
- Text-file comparison
- diff for identifying differences
- Secure credential handling

A sanitized representative comparison command is:

```bash
diff <password-file-1> <password-file-2>
```

The comparison identifies the differing entry without documenting the actual challenge credential or relying on placeholder filenames that were not used in this repository.

The differing entry identifies the credential required for the next authorized authentication step.

## Security Concepts

### File Comparison

Comparing two versions of a file can reveal unauthorized modifications, configuration changes, or changed credentials.

The diff utility provides a concise way to identify differences between text files.

### Credential Security

Credentials discovered during a controlled security exercise should not be copied into public documentation.

Only the investigative method and sanitized results are documented in this repository.

### SSH Authentication

SSH can authenticate users using either passwords or cryptographic key pairs, depending on the server configuration.

## SOC / Blue Team Relevance

File comparison is useful during security investigations when analysts need to determine whether a configuration, account database, script, or other important file has changed.

Potential defensive applications include:

- Detecting unauthorized file modifications
- Investigating configuration drift
- Comparing known-good and suspicious files
- Supporting incident-response investigations
- Validating changes during security reviews

## MITRE ATT&CK Relevance

This exercise primarily develops defensive investigation skills rather than demonstrating a specific adversary technique.

The authentication portion provides contextual awareness of:

- **T1078: Valid Accounts**
- **T1021.004: Remote Services: SSH**

The file-comparison activity itself is better understood as a defensive investigation technique for identifying changes in security-relevant files rather than as a direct ATT&CK technique.

These mappings are provided for defensive learning and contextual analysis. The Bandit challenge is an authorized training exercise and should not be presented as evidence of adversary activity.

## Evidence / Screenshot Reference

Recommended evidence:

- Comparison of the two password files with sensitive output redacted
- Successful authentication to the next authorized Bandit level
- Terminal evidence showing the comparison workflow

Sensitive credentials must not appear in screenshots committed to the repository.

## Credential Handling

No Bandit password or private credential is intentionally stored in this repository.

Challenge credentials should remain outside the public project directory or be redacted before documentation is committed.

## Learning Outcome

This level strengthened practical understanding of file comparison, credential handling, SSH authentication, and investigation of changes between two versions of a file.

## Limitations

This exercise was performed in the controlled OverTheWire Bandit training
environment and therefore does not reproduce the complexity of a production
enterprise environment.

Limitations include:

- Synthetic or intentionally constructed challenge conditions.
- Limited system and network scope.
- No production authentication infrastructure.
- No enterprise SIEM, EDR, identity platform, or centralized logging.
- No real organizational incident-response process.
- Challenge objectives may simplify real-world investigative scenarios.
- Results should not be interpreted as evidence of production security
  capability by themselves.

The primary value of the exercise is the development of transferable Linux,
command-line investigation, analytical reasoning, evidence-handling, and
security-documentation skills.

## Ethical Use

This documentation is based on authorized activity within the OverTheWire Bandit training environment.

The techniques described should only be used against systems for which explicit authorization has been provided.

## Training Outcome

Successfully completed the Bandit Level 17 → 18 objective.

The exercise strengthened practical understanding of:

- File comparison
- Baseline and modified-file analysis
- Credential change identification
- Linux command-line investigation
- Difference analysis
- Sensitive-data handling
- Evidence validation

**Status: Completed**
