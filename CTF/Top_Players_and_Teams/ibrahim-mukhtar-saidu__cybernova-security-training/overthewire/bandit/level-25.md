# Bandit Level 25 → 26

## Objective

Analyze an SSH environment in which the normal login shell provides restricted behavior and determine how terminal characteristics and locally available privileged execution mechanisms affect the session.

The exercise focuses on SSH session behavior, restricted shells, pseudo-terminals, Linux permissions, Setuid executables, and controlled privilege-boundary analysis within the authorized OverTheWire Bandit environment.

The objective is to reach the next authorized training stage while documenting the investigation methodology without publishing challenge credentials or unnecessary exploit material.

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit25 |
| Target Account | bandit26 |
| Authorization | Authorized cybersecurity training lab |
| Investigation Type | SSH and shell behavior analysis |

## Investigation Approach

The investigation followed a structured SSH and privilege-boundary analysis workflow:

1. Establish the authorized SSH session for the Bandit training account.
2. Confirm the current identity, working directory, shell, and terminal context.
3. Inspect the available files, permissions, and locally accessible executables.
4. Determine how the restricted login shell behaves under different terminal conditions.
5. Examine pseudo-terminal allocation and terminal dimensions where relevant.
6. Identify locally available Setuid execution mechanisms associated with the challenge.
7. Use the authorized execution path to reach the next training stage.
8. Validate the resulting session and preserve only sanitized evidence.
9. Keep all challenge credentials and sensitive authentication material outside the public repository.

The investigation emphasizes understanding why the environment behaves differently rather than treating the challenge as a collection of commands to memorize.

## Security Concepts

The exercise demonstrates several security concepts relevant to Linux and SOC investigations:

- **SSH session behavior:** Authentication and session establishment can depend on client and terminal configuration.
- **Restricted shells:** Login shells may intentionally constrain command execution and user interaction.
- **Pseudo-terminals (PTYs):** Interactive terminal allocation can affect how applications and shells behave.
- **Terminal dimensions:** Programs may respond differently depending on the available terminal size and characteristics.
- **Process execution:** Understanding which process is launched after authentication helps explain restricted-session behavior.
- **Setuid execution:** Setuid programs can execute with the privileges of their file owner and therefore require careful permission analysis.
- **Linux permissions:** File ownership, mode bits, and executable permissions determine which security boundaries apply.
- **Privilege boundaries:** A program with elevated execution context can create a security boundary that must be carefully analyzed.
- **Credential protection:** Authentication material should be treated as sensitive evidence and excluded from public documentation.

These concepts are studied only within the authorized OverTheWire training environment.

## SOC / Blue Team Relevance

Although the exercise is performed in a CTF environment, the observed behaviors have practical defensive value.

A SOC analyst investigating an unusual SSH session could examine:

- Unexpected login shells or restricted-shell configurations.
- SSH sessions followed by unusual terminal or pseudo-terminal behavior.
- Execution of privileged or Setuid binaries.
- Child processes launched from an authenticated SSH session.
- Unexpected changes in effective user or group identity.
- Commands executed immediately after authentication.
- Abnormal process trees associated with interactive SSH sessions.
- Repeated attempts to manipulate terminal characteristics.
- Access to executables with elevated file privileges.

### Defensive Telemetry

Potential telemetry sources include:

| Telemetry | Investigation Value |
|---|---|
| SSH authentication logs | Identify successful and failed remote logins |
| Process creation logs | Detect unusual child processes and execution chains |
| Linux audit logs | Monitor privileged executable activity |
| File metadata | Identify Setuid binaries and permission changes |
| Shell history | Provide supporting command-execution evidence where available |
| EDR telemetry | Correlate processes, users, and execution context |
| SIEM events | Correlate SSH authentication with subsequent activity |

### Detection Opportunities

A production SOC could correlate:

**SSH Authentication → Interactive Session → Unusual Privileged Execution**

Additional detection logic could flag execution of Setuid programs from unexpected locations, unusual privilege transitions, or abnormal process trees following SSH authentication.

The key defensive lesson is that authentication success alone does not establish that subsequent activity is normal. Analysts should investigate the complete session context, including the user, terminal, process tree, executable permissions, and resulting privilege context.

## MITRE ATT&CK Relevance

The exercise has defensive relevance to techniques involving remote access and privilege-boundary abuse.

### T1021.004: Remote Services: SSH

The challenge begins through an SSH session. From a defensive perspective, SSH authentication should be correlated with subsequent interactive activity, process creation, and privilege changes.

Useful telemetry includes:

- SSH authentication events
- Source address and session information
- Interactive versus non-interactive sessions
- Process creation following authentication
- Session duration
- User and effective-user identity

### T1548.001: Abuse Elevation Control Mechanism: Setuid and Setgid

Setuid executables can execute with the privileges associated with their file owner. Unexpected execution of such programs can therefore represent an important privilege-boundary event.

Defenders should monitor for:

- Unexpected Setuid binaries
- Changes to Setuid permissions
- Execution of privileged binaries by unusual users
- Privilege transitions during SSH sessions
- Suspicious child processes spawned by privileged executables

The ATT&CK mappings are presented as defensive analytical context. The Bandit exercise itself is an authorized training activity.

---

## Techniques and Commands

The investigation involved:

- SSH session analysis
- Terminal and pseudo-terminal behavior analysis
- Restricted-shell investigation
- Process and executable inspection
- Shell/environment analysis
- Linux permission analysis
- Execution-context analysis
- Controlled interaction with the authorized training environment
- Secure credential handling

The investigation workflow was:

1. Establish the authorized SSH session for the challenge environment.
2. Observe the initial shell and terminal behavior.
3. Identify restrictions affecting normal command execution.
4. Inspect the available processes, executables, and execution context.
5. Analyze the relationship between the SSH session, shell, and available programs.
6. Determine how the restricted execution environment behaves under controlled interaction.
7. Validate the resulting challenge state within the authorized training environment.
8. Record only sanitized observations and evidence.
9. Keep challenge credentials and authentication material outside the public repository.

Representative sanitized investigation commands may include:

```bash
ssh -p <ssh-port> <training-user>@<authorized-host>
ps
ls -la
file <authorized-executable>
<sanitized-environment-inspection-command>
```

The exact challenge-specific executable, authentication material, shell-bypass procedure, and credential output are intentionally omitted from the public documentation.

The purpose of this section is to document the investigation methodology, Linux execution concepts, and defensive relevance without publishing unnecessary operational challenge details.

---

## Evidence / Screenshot Reference

Evidence for this level consists of the documented SSH investigation,
terminal behavior observations, and analysis of the restricted execution
environment.

Screenshots may be added selectively without exposing authentication
material.

## Credential Handling

Challenge credentials and private authentication material are not published.

Any SSH-related sensitive material used during the exercise remains outside
the public repository.

## Lessons Learned

This exercise reinforced several important concepts:

1. SSH session behavior can depend on terminal and pseudo-terminal characteristics.
2. A restricted login shell should be evaluated as part of the complete execution environment.
3. Process context and parent-child relationships are important when investigating unusual shell activity.
4. Setuid executables require careful analysis because they may execute with the privileges of their file owner.
5. Linux permissions are an important component of privilege-boundary analysis.
6. Unexpected shell transitions can provide useful SOC investigation signals.
7. Authentication material and challenge-specific credentials should remain protected.

## Training Outcome

This level strengthened understanding of SSH sessions, restricted execution environments, terminal behavior, Linux permissions, and privileged processes.

**Status: Completed**

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

All activity was performed within the authorized OverTheWire environment.
