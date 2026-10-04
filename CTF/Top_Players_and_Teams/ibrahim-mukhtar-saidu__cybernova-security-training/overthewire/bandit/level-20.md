# Bandit Level 20 → 21

## Objective

Use the provided setuid-based network utility to communicate with a local service and obtain the credential required for the Bandit Level 21 account.

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit20 |
| Target Account | bandit21 |
| Authorization | Authorized cybersecurity training lab |
| Investigation Type | Setuid execution and privilege context |

## Investigation Approach

The challenge focused on understanding how a privileged executable can interact with a local TCP service and how data exchanged over that connection can be used within an authorized security-training environment.

The investigation focused on:

1. Accessing the Bandit Level 20 environment.
2. Preparing a local TCP listener.
3. Identifying the relevant network port.
4. Using the provided privileged network mechanism.
5. Observing the data exchanged between the local endpoints.
6. Treating the resulting credential as sensitive information.
7. Keeping challenge credentials outside the public repository.

## Techniques and Commands

The investigation involved:

- SSH authentication
- TCP networking
- Netcat (`nc`)
- Localhost communication
- TCP listener configuration
- Setuid execution
- Privileged network-process analysis
- Secure credential handling

The investigation workflow was:

1. Access the Bandit Level 20 environment through the authorized SSH service.
2. Prepare a local TCP listener on the designated challenge port.
3. Verify that the listener is active and accepting connections.
4. Execute the provided setuid network utility according to the challenge requirements.
5. Observe the communication between the local endpoints.
6. Validate the returned challenge result without exposing the credential.
7. Keep sensitive challenge data outside the public repository.

A confirmed listener command from the investigation was:

```bash
nc -lv 31337
```

This creates a TCP listener on port `31337` for the authorized training exercise.

The challenge also involved a provided setuid network utility that communicates with a local TCP service. The challenge-specific utility invocation and credential output are intentionally omitted from the public documentation.

## Security Concepts

### TCP Communication

TCP provides reliable, connection-oriented communication between network endpoints.

Security analysts should understand how clients, servers, listeners, source ports, destination ports, and network connections interact.

### Localhost Services

Services bound to `localhost` are accessible from the local system and can still represent important security boundaries.

Unexpected local listeners or connections may warrant investigation.

### Setuid Network Programs

A setuid network utility combines two security-sensitive concepts:

- Elevated execution privileges
- Network communication

Such programs require careful security review because unsafe behavior can create privilege-escalation opportunities.

### Network Listeners

A TCP listener waits for incoming connections on a specified port.

For this exercise, the confirmed listener configuration used port `31337`.

## SOC / Blue Team Relevance

The concepts demonstrated in this level are relevant to SOC monitoring and Linux security investigations.

Analysts may investigate:

- Unexpected listening ports
- Suspicious localhost connections
- Privileged network processes
- Unusual parent-child process relationships
- Setuid executable execution
- Unexpected data exchanged between local services

Useful telemetry can include:

- Process execution logs
- Network connection logs
- Listening-port information
- File permission changes
- Authentication events

## MITRE ATT&CK Relevance

This exercise provides defensive learning relevant to:

- **T1548.001: Abuse Elevation Control Mechanism: Setuid and Setgid**

The network-communication concepts also provide supporting context for investigating suspicious local network activity.

The mapping is included for defensive learning and should not be interpreted as evidence of malicious activity within the Bandit environment.

## Evidence / Screenshot Reference

Recommended evidence:

- `evidence/screenshots/bandit-20-listener.png`
- `evidence/screenshots/bandit-20-network-communication.png`
- `evidence/screenshots/bandit-20-result-redacted.png`

Screenshots must be sanitized before being committed.

Do not include:

- Bandit passwords
- Private keys
- Tokens
- Sensitive challenge output

## Credential Handling

No Bandit password or sensitive credential is intentionally stored in this repository.

Challenge credentials should remain outside the public project directory or be redacted before documentation is committed.

## Learning Outcome

This level strengthened practical understanding of TCP networking, local service communication, network listeners, setuid execution, privileged processes, and secure credential handling.

## Lessons Learned

This exercise reinforced several practical Linux and network-security concepts:

- Local TCP listeners and client connections should be understood when investigating network activity.
- Privileged network-capable programs combine process, permission, and network security considerations.
- Unexpected localhost listeners or connections can provide useful investigation signals.
- Setuid execution should be evaluated together with the network behavior of the process.
- Security analysts should correlate process execution, file permissions, and network connections when investigating privilege-related activity.
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

Successfully completed the Bandit Level 20 → 21 objective.

The exercise strengthened practical understanding of:

- Local TCP service interaction
- Client-server communication
- Authentication workflows
- Network listeners
- Process and connection analysis
- Controlled network testing
- Defensive monitoring of unexpected local network activity

**Status: Completed**
