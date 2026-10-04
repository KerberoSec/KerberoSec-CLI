# Bandit Level 19 → 20

## Objective

Use the provided setuid-based mechanism to execute an authorized action with the privileges of the Bandit Level 20 account and obtain the credential required for the next level.

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit19 |
| Target Account | bandit20 |
| Authorization | Authorized cybersecurity training lab |
| Investigation Type | Setuid binary analysis |

## Investigation Approach

The challenge focused on understanding Linux setuid behavior and how a specially configured executable can run with the privileges of its file owner.

The investigation focused on:

1. Accessing the Bandit Level 19 environment.
2. Inspecting the available executable and its permissions.
3. Identifying the setuid property of the relevant binary.
4. Understanding which account privileges the executable could use.
5. Executing the authorized challenge action through the provided mechanism.
6. Obtaining the next-level credential without storing it in the repository.

## Techniques and Commands

The investigation involved:

- Linux file and permission inspection
- Setuid-bit identification
- Executable ownership analysis
- Privilege-context analysis
- Authorized execution of the provided setuid mechanism
- Secure credential handling

A sanitized inspection workflow is:

```bash
ls -l <setuid-executable>
file <setuid-executable>
```

The permission and ownership information were used to determine whether the executable had the setuid bit and which account owned it.

The challenge-specific executable name and credential output are intentionally omitted from the public documentation.

## Security Concepts

### Setuid

The Linux setuid permission allows an executable to run with the effective user identity of the file owner rather than only the identity of the user launching it.

Setuid programs require careful security review because vulnerabilities or unsafe behavior can result in unintended privilege use.

### File Permissions

Linux permissions provide access-control boundaries for files and executable programs.

Security investigations should examine:

- Owner
- Group
- Read/write/execute permissions
- Special permission bits such as setuid

### Privilege Context

A security analyst should distinguish between:

- Real user ID
- Effective user ID
- File ownership
- Privileges granted by executable configuration

Understanding these concepts is important when investigating unexpected privilege changes.

## SOC / Blue Team Relevance

Setuid binaries are relevant to Linux security monitoring because unexpected or unauthorized use may indicate privilege escalation activity.

A SOC analyst may investigate:

- Execution of unusual privileged binaries
- Unexpected changes to setuid permissions
- Suspicious process ancestry
- Privileged command execution
- File permission modifications
- Attempts to access protected resources

## MITRE ATT&CK Relevance

This exercise provides defensive learning relevant to:

- **T1548.001: Abuse Elevation Control Mechanism: Setuid and Setgid**

The mapping is included for defensive learning and should not be interpreted as evidence of malicious activity within the training environment.

## Evidence / Screenshot Reference

Recommended evidence:

- `evidence/screenshots/bandit-19-setuid-binary.png`
- `evidence/screenshots/bandit-19-permissions.png`
- `evidence/screenshots/bandit-19-authentication-result-redacted.png`

Screenshots should contain no passwords, private keys, or other sensitive credentials.

## Credential Handling

No Bandit password or sensitive credential is intentionally stored in this repository.

Challenge credentials should remain outside the public project directory or be redacted before documentation is committed.

## Learning Outcome

This level strengthened practical understanding of Linux file permissions, setuid behavior, effective privileges, privilege boundaries, and secure credential handling.

## Lessons Learned

This exercise reinforced several practical Linux security concepts:

- Special permission bits can change the security context of executable programs.
- File ownership and effective user identity are important during privilege investigations.
- Unexpected setuid binaries or permission changes can represent meaningful security-monitoring signals.
- Security analysts should examine both executable configuration and execution context when investigating privilege-related activity.
- Sensitive credentials obtained during authorized testing should be excluded from public documentation.

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

Successfully completed the Bandit Level 19 → 20 objective.

The exercise strengthened practical understanding of:

- Linux Setuid permissions
- Privilege boundaries
- Effective user identity
- Executable permission analysis
- Privileged command execution
- Least-privilege principles
- Detection opportunities involving unexpected privilege transitions

**Status: Completed**
