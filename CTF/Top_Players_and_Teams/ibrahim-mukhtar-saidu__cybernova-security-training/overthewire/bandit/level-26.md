# Bandit Level 26 → 27

## Objective

Analyze a restricted SSH shell environment and determine how terminal characteristics, executable behavior, and privileged execution affect command access.

The exercise focuses on SSH key-based authentication, restricted shells, pseudo-terminals, terminal dimensions, process execution, Setuid programs, Linux permissions, and privilege-boundary analysis within the authorized OverTheWire Bandit environment.

The objective is to reach the next authorized training stage while documenting the investigation methodology without publishing private SSH keys, challenge credentials, or unnecessary challenge-specific exploit material.

---

## Environment

| Item | Value |
|---|---|
| Platform | OverTheWire Bandit |
| Starting Account | bandit26 |
| Target Account | bandit27 |
| Protocol | SSH |
| Operating System | Linux |
| Environment | Authorized CTF / training lab |
| Primary Topics | SSH keys, restricted shells, terminal behavior, Setuid, Linux permissions |
| Primary Investigation Tools | SSH, standard Linux utilities |

---

## Challenge Description

The Bandit Level 26 environment provides an SSH-accessible account whose normal login behavior is intentionally restricted.

The challenge demonstrates an important property of interactive Unix environments: terminal allocation and terminal dimensions can influence how programs behave.

The investigation therefore examines both the authentication context and the execution environment. The key questions are:

- What shell or executable is launched after authentication?
- How does the restricted environment respond to an interactive terminal?
- How do terminal dimensions affect the behavior of the provided executable?
- Which locally accessible files and permissions are relevant?
- Does a privileged execution mechanism change the effective execution context?

The successful path is documented conceptually rather than publishing challenge-specific credentials or a reusable exploit sequence.

---

## Investigation Approach

The investigation followed a structured SSH and privilege-boundary analysis workflow:

1. Establish the authorized SSH session using the challenge-provided authentication mechanism.
2. Confirm the current identity and execution context.
3. Observe the behavior of the restricted login environment.
4. Determine whether an interactive pseudo-terminal changes application behavior.
5. Examine terminal dimensions and their relationship to the observed behavior.
6. Inspect locally accessible executables and relevant file permissions.
7. Identify whether a Setuid execution mechanism is involved.
8. Analyze the resulting process and privilege context.
9. Use the authorized execution path to reach the next training stage.
10. Validate the resulting access and preserve only sanitized evidence.
11. Keep private SSH keys and challenge credentials outside public documentation.

The investigation emphasizes understanding the relationship between authentication, terminal state, process execution, and privilege boundaries rather than memorizing challenge-specific commands.

---

## Security Concepts

The exercise demonstrates several security concepts relevant to Linux security and SOC investigations:

- **SSH key-based authentication:** Public-key authentication can provide access without transmitting a password during normal authentication.
- **Restricted shells:** A login environment can constrain available commands or alter normal shell behavior.
- **Pseudo-terminals (PTYs):** Interactive SSH sessions may allocate a PTY that affects application behavior.
- **Terminal dimensions:** Some interactive programs respond to terminal width and height.
- **Process execution:** Identifying the process launched after authentication helps explain restricted-session behavior.
- **Setuid execution:** A Setuid executable can run with the privileges associated with its file owner.
- **Linux permissions:** File ownership and mode bits determine how executables can be accessed and executed.
- **Privilege boundaries:** Programs executing with elevated privileges require careful security analysis.
- **Credential protection:** Private keys and challenge authentication material should never be published.

These concepts are studied only within the authorized OverTheWire training environment.

---

## SOC / Blue Team Relevance

Although this is a CTF exercise, the observed behaviors have direct defensive value.

A SOC analyst investigating an unusual SSH session could examine:

- SSH authentication method and source information.
- Interactive versus non-interactive SSH sessions.
- Restricted-shell configurations.
- Terminal and pseudo-terminal allocation.
- Commands executed immediately after authentication.
- Unexpected shell or interpreter processes.
- Execution of Setuid or other privileged binaries.
- Changes in effective user or group identity.
- Child processes spawned from privileged executables.
- Abnormal process trees associated with an SSH session.

### Defensive Telemetry

Potential telemetry sources include:

| Telemetry | Investigation Value |
|---|---|
| SSH authentication logs | Identify successful and failed remote access |
| SSH daemon logs | Provide session and authentication context |
| Process creation logs | Identify shells, child processes, and execution chains |
| Linux audit logs | Monitor privileged executable activity |
| File metadata | Identify Setuid permissions and ownership |
| EDR telemetry | Correlate users, processes, and execution context |
| SIEM events | Correlate authentication with subsequent activity |

### Detection Opportunities

A production SOC could correlate:

**SSH Authentication → Interactive Session → Unusual Shell/Privileged Execution**

Additional detection logic could flag:

- Execution of Setuid programs by unusual users.
- Unexpected privilege transitions.
- Shell spawning from unusual parent processes.
- Privileged execution immediately following SSH authentication.
- Changes to Setuid permissions.
- Interactive sessions producing abnormal process trees.

The key defensive lesson is that authentication success does not establish that subsequent activity is legitimate. Analysts should investigate the complete session context.

---

## MITRE ATT&CK Relevance

The exercise has defensive relevance to remote access and privilege-boundary techniques.

### T1021.004: Remote Services: SSH

The challenge uses SSH as the remote access mechanism.

From a defensive perspective, analysts can correlate:

- SSH authentication events.
- Source address information.
- Session type.
- User identity.
- Process creation following authentication.
- Session duration.
- Subsequent privilege changes.

### T1548.001: Abuse Elevation Control Mechanism: Setuid and Setgid

Setuid executables can execute with the privileges associated with their file owner.

Defenders should monitor for:

- Unexpected Setuid binaries.
- Changes to Setuid permissions.
- Execution of privileged binaries by unusual users.
- Privilege transitions during remote sessions.
- Suspicious processes spawned by privileged executables.

These ATT&CK mappings are presented as defensive analytical context. The Bandit exercise itself is an authorized training activity.

---

## Techniques and Commands

The investigation involved:

- SSH key-based authentication
- Interactive SSH session analysis
- Restricted-shell investigation
- Pseudo-terminal behavior analysis
- Terminal-dimension analysis
- Process and executable inspection
- Linux permission analysis
- Setuid execution analysis
- Privilege-context validation
- Execution-context analysis
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized SSH session using the provided training credentials or key material.
2. Observe the initial shell behavior and determine whether normal interactive command execution is available.
3. Analyze the terminal and pseudo-terminal characteristics affecting the session.
4. Investigate how terminal dimensions and interactive behavior influence the restricted execution environment.
5. Inspect relevant processes, executables, ownership, and permission settings.
6. Determine the privilege and execution context associated with the relevant executable.
7. Interact with the restricted environment only within the authorized training challenge.
8. Validate successful progression to the next training stage.
9. Record only sanitized observations and evidence.
10. Keep private keys, challenge credentials, and challenge-specific bypass procedures outside the public repository.

Representative sanitized investigation commands may include:

```bash
ssh -p <ssh-port> -i <authorized-key> <training-user>@<authorized-host>
stty size
ps
ls -la <authorized-path>
file <authorized-executable>
```

The exact SSH key material, challenge-specific executable names, terminal manipulation sequence, shell-bypass procedure, and credential output are intentionally omitted from the public documentation.

The purpose of this section is to document the investigation methodology, Linux terminal behavior, execution context, and defensive relevance without publishing unnecessary operational challenge details.

---

## Evidence / Screenshot Reference

Useful evidence for this level includes:

- Sanitized SSH session output.
- Restricted-shell behavior observations.
- Terminal behavior observations.
- Relevant executable permission information.
- Sanitized process-context observations.
- Screenshot showing successful progression without authentication material.

Evidence should demonstrate the investigation methodology without exposing private keys or challenge credentials.

Only evidence that actually exists in the repository should be referenced.

---

## Evidence Validation

The investigation result should be validated through the authorized challenge environment.

Validation consists of:

1. Establishing the expected SSH session.
2. Confirming the restricted execution behavior.
3. Identifying the relevant terminal-dependent behavior.
4. Confirming the applicable executable and permission context.
5. Reaching the next authorized training stage.
6. Recording only sanitized evidence for public documentation.

The private SSH key and other authentication material are not required as public evidence.

---

## Credential Handling

Private SSH authentication material must be treated as sensitive.

The following should never be committed to the public repository:

- Private SSH keys.
- Passwords.
- Challenge credentials.
- Authentication tokens.
- Private configuration containing secrets.
- Unredacted screenshots containing authentication material.

Public documentation should use placeholders such as:

`Credential: [REDACTED]`

`Private Key: [NOT PUBLISHED]`

Repository ignore rules should be verified separately rather than assumed to provide complete secret protection. Sensitive material should remain outside the repository entirely.

---

## Learning Outcome

This level strengthened practical understanding of:

- SSH key-based authentication.
- Restricted shell behavior.
- Interactive terminal sessions.
- Pseudo-terminal allocation.
- Terminal-dependent application behavior.
- Linux file permissions.
- Setuid execution.
- Privilege boundaries.
- Process-context analysis.
- Secure credential handling.
- Defensive monitoring of remote sessions.

The exercise demonstrates how seemingly small differences in terminal state can significantly affect the behavior of an interactive security environment.

---

## Limitations

This exercise uses a controlled OverTheWire training environment and therefore does not represent the full complexity of production SSH infrastructure.

Real-world environments may additionally involve:

- Multi-factor authentication.
- Centralized identity providers.
- SSH certificates.
- Bastion hosts.
- Network access controls.
- Endpoint detection and response.
- Linux audit frameworks.
- SIEM correlation.
- Privileged access management.
- Session recording.
- Automated response controls.

The challenge should therefore be considered foundational training in SSH session analysis, restricted execution, and Linux privilege boundaries rather than a complete production SSH security methodology.

---

## Ethical Use

All activity documented here was performed against the authorized OverTheWire Bandit training environment.

The techniques described should only be used against systems for which explicit authorization has been obtained.

Private authentication material must never be reused, disclosed, or published.

Restricted-shell and privilege-boundary techniques should not be applied to third-party systems without explicit authorization.

---

## Training Outcome

Successfully completed the Bandit Level 26 → 27 objective.

The exercise strengthened practical understanding of:

- SSH authentication.
- Restricted shells.
- Terminal and PTY behavior.
- Process execution.
- Linux permissions.
- Setuid privilege boundaries.
- Defensive SSH monitoring.
- Evidence validation.
- Credential protection.
- MITRE ATT&CK contextual mapping.

**Status: Completed**
