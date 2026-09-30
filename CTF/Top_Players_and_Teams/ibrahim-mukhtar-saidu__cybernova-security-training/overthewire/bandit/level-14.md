# Bandit Level 14 → 15

## Objective

Retrieve the credential required to authenticate to Bandit Level 15.

The challenge introduces direct interaction with a local TCP service. The
credential obtained from the previous level must be transmitted to a service
listening on a specified localhost port.

The exercise develops practical understanding of TCP client/server
communication, localhost services, port-specific connections, command-line
network tools, authentication exchanges, and secure credential handling.

---

## Environment

| Item             | Details                               |
| ---------------- | ------------------------------------- |
| Platform         | OverTheWire Bandit                    |
| Source System    | Parrot OS                             |
| Shell            | Bash                                  |
| Network Protocol | TCP                                   |
| Starting Account | bandit14                              |
| Target Account   | bandit15                              |
| Service Host     | `localhost`                           |
| Service Port     | `30000`                               |
| Primary Tool     | Netcat (`nc`)                         |
| Authorization    | Authorized cybersecurity training lab |

---

## Scenario

The Bandit Level 14 environment provides access to a TCP service running
locally on the target system.

The objective is to send the current level credential to the specified
service and receive the credential required for the next level.

The exercise demonstrates a basic client/server authentication workflow:

```text
Bandit 14 Shell
      |
      v
Current Credential
      |
      v
TCP Client
      |
      | TCP connection
      v
localhost:30000
      |
      v
Authentication Service
      |
      v
Next-Level Credential
```

---

## Initial Reconnaissance

The first step is to understand the local environment and identify the
required service endpoint.

The challenge specifies a local TCP service on port `30000`.

The important connection parameters are:

```text
Host: localhost
Port: 30000
Protocol: TCP
```

`localhost` refers to the local system itself.

This means the connection does not require communication with an external
internet host.

---

## Understanding TCP Ports

A TCP port identifies a logical endpoint associated with a network service.

A simplified model is:

```text
Client
  |
  | TCP connection
  v
IP Address + Port
  |
  v
Listening Service
```

In this challenge:

```text
localhost:30000
```

identifies the service endpoint.

The IP address identifies the host while the port identifies the specific
network service.

---

## Localhost

`localhost` normally resolves to the local host.

Common loopback addresses include:

```text
127.0.0.1
::1
```

Traffic sent to localhost remains within the local system rather than being
routed to a remote machine.

Local services are common in:

* Development environments
* Security tools
* Databases
* Monitoring agents
* Management interfaces
* Application backends
* CTF laboratories

---

## Service Interaction

A command-line TCP client can be used to connect to the service.

A common utility is Netcat:

```bash
nc
```

A connection can be established using the host and port:

```bash
nc localhost 30000
```

The command means:

```text
nc
 |
 +-- Host: localhost
 |
 +-- Port: 30000
```

Once connected, input can be supplied to the service.

The challenge expects the current Bandit credential to be provided through
this connection.

---

## Authentication Exchange

The basic exchange can be represented as:

```text
Client                              Server
  |                                   |
  | ---- TCP connection ------------> |
  |                                   |
  | ---- Current credential --------> |
  |                                   |
  | <---- Authentication response ---- |
  |                                   |
  | <---- Next-level credential ------ |
  |                                   |
```

The service validates the supplied credential.

If the authentication value is correct, the service returns the credential
needed for the next level.

---

## Command-Line Workflow

A controlled workflow is:

### Step 1: Confirm the Current Credential

The credential for the current Bandit account was obtained during the
previous challenge.

It should be treated as sensitive authentication material.

### Step 2: Connect to the Service

Use:

```bash
nc localhost 30000
```

### Step 3: Provide the Credential

Enter the current level credential when the service accepts input.

### Step 4: Observe the Response

The service returns a response indicating whether the supplied credential
was accepted.

### Step 5: Capture the Result Safely

The next-level credential should be stored securely and must not be included
in public documentation.

---

## Alternative Non-Interactive Method

For controlled lab testing, input can also be piped into the TCP client.

Conceptually:

```bash
printf '%s\n' '<CURRENT_CREDENTIAL>' | nc localhost 30000
```

This demonstrates how command-line programs can exchange data through
standard input and output.

The actual credential should never be placed into public GitHub files,
shell-history screenshots, or documentation.

---

## Why Netcat Is Useful

Netcat is a simple network utility capable of creating TCP or UDP
connections.

It is commonly useful for:

* Testing network services
* Troubleshooting connectivity
* Sending test data
* Receiving service responses
* Checking whether a port is accessible
* Understanding simple client/server protocols

For security professionals, understanding basic network utilities is useful
during troubleshooting and controlled security testing.

---

## Service Discovery Perspective

Although this challenge provides the target port directly, a security
analyst should understand how such a service could be discovered.

For example, a TCP listener can potentially be identified through appropriate
local or authorized network enumeration.

A simplified investigation workflow is:

```text
Host
 |
 v
Enumerate Listening Services
 |
 v
Identify Port
 |
 v
Identify Protocol
 |
 v
Connect with Appropriate Client
 |
 v
Observe Service Behavior
```

This is a foundational service-enumeration concept.

---

## Technical Analysis

The challenge demonstrates a simple application-layer interaction over TCP.

The underlying TCP connection provides reliable byte-stream transport.

The application running on port `30000` then interprets the transmitted
data according to its own protocol.

This distinction is important:

```text
Application Layer
      |
      | Authentication data
      v
TCP
      |
      | Reliable transport
      v
IP / Network
```

Netcat provides a convenient interface for interacting with the TCP endpoint.

---

## Observed Result

The local TCP service accepted the current Bandit credential and returned
the credential required for Bandit Level 15.

Credential:

```text
[REDACTED]
```

The actual credential is intentionally excluded from this public repository.

The result was validated within the authorized OverTheWire Bandit
environment.

---

## Evidence Validation

The result was validated by using the returned credential for the next
authorized Bandit authentication step.

Evidence should demonstrate:

1. The target host and port.
2. The TCP client connection.
3. The authentication exchange.
4. The successful service response.
5. Sanitized confirmation of the resulting credential.

Actual credentials must not appear in published evidence.

---

## Investigation Approach

The investigation focused on interacting with an authorized service listening
on the local system.

The workflow was:

1. Confirm the current authentication context.
2. Identify the expected local service endpoint.
3. Establish a TCP connection to the authorized port.
4. Provide the required training credential through the expected input channel.
5. Observe the service response.
6. Validate the returned result.
7. Avoid unnecessary interaction with unrelated services.
8. Protect the recovered credential from public disclosure.

The exercise demonstrates basic network-service investigation, TCP client
interaction, authentication exchange, and evidence validation.

## Techniques and Commands

The investigation involved:

- Local TCP service analysis
- Host and port identification
- TCP client/server communication
- Localhost service interaction
- Netcat (`nc`) usage
- Standard input/output redirection
- Authentication-response analysis
- Service-response validation
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Confirm the authorized Bandit training environment and current account.
2. Identify the specified localhost TCP service and port.
3. Establish a controlled TCP connection using an appropriate client.
4. Provide the current-level authentication value only within the authorized
   training service.
5. Observe and validate the service response.
6. Confirm successful retrieval of the next-stage training information.
7. Avoid recording credentials in public documentation or screenshots.
8. Preserve only sanitized evidence of the service interaction.

Representative sanitized commands include:

```bash
nc <authorized-host> <service-port>
```

```bash
printf '%s\\n' '<CURRENT_CREDENTIAL>' | nc <authorized-host> <service-port>
```

The actual credential, challenge-specific response, and unnecessary
authentication material are intentionally omitted from this public
documentation.

The purpose of this section is to demonstrate TCP service interaction,
command-line network analysis, authentication-response validation, and secure
handling of sensitive training data within an authorized environment.

---

## Security Concepts

### TCP

Transmission Control Protocol provides reliable, connection-oriented
communication between network endpoints.

### Port

A TCP port identifies a logical service endpoint on a host.

### Localhost

Localhost refers to the machine on which the client is running.

### Client/Server Architecture

The client initiates communication while the server listens for and handles
incoming connections.

### Authentication

The service validates a supplied credential before returning the next
authorized resource.

### Standard Input and Output

Command-line utilities can exchange information through stdin and stdout,
allowing tools to be chained together.

### Service Enumeration

Identifying listening services and their associated ports is a foundational
network-security activity.

---

## MITRE ATT&CK Relevance

The exercise demonstrates interaction with an authorized network service over
TCP.

The activity provides defensive context for understanding service discovery,
network connections, and authentication monitoring. It should not be treated
as a direct reproduction of a specific adversary procedure.

## Skills Demonstrated

* Linux command-line networking
* TCP concepts
* Port-based service interaction
* Localhost/loopback understanding
* Netcat usage
* Client/server communication
* Standard input/output handling
* Basic service enumeration concepts
* Authentication exchange analysis
* Network troubleshooting
* Credential protection
* Technical documentation

---

## Defensive / SOC Relevance

The skills demonstrated in this level have direct relevance to SOC and
security operations.

### Network Service Monitoring

Security teams monitor systems for unexpected listening services and exposed
ports.

An unexpected service may increase the attack surface.

### Suspicious Local Services

A SOC analyst investigating a compromised host may need to determine:

* Which services are listening
* Which ports are open
* Which processes own those ports
* Whether the service is expected
* Whether the service is communicating externally

### Authentication Monitoring

Network services frequently process authentication data.

Analysts may investigate:

* Repeated authentication failures
* Successful authentication events
* Unusual source systems
* Unexpected authentication attempts
* Authentication anomalies

### Attack-Surface Management

Every listening network service represents a potential attack surface.

Security teams therefore need to understand:

```text
Service
   ↓
Port
   ↓
Exposure
   ↓
Potential Attack Surface
```

### Incident Response

During an incident, identifying unexpected listeners can help reveal:

* Unauthorized services
* Backdoors
* Temporary attacker infrastructure
* Misconfigured applications
* Suspicious management interfaces

---

## Example SOC Investigation Scenario

Suppose a Linux server unexpectedly begins listening on TCP port `30000`.

A SOC analyst could investigate:

```text
Unexpected Port
      |
      v
Identify Listening Process
      |
      v
Identify Executable
      |
      v
Review Configuration
      |
      v
Review Authentication Logs
      |
      v
Review Network Connections
      |
      v
Determine Legitimate or Suspicious
```

The analyst would then correlate the finding with system ownership,
deployment records, process activity, and network telemetry.

The Bandit exercise provides the foundational understanding required to
reason about this type of service.

---

## Common Mistakes

### Connecting to the Wrong Port

A TCP service is associated with a specific port. Connecting to another port
may result in a connection failure or a different service.

### Using the Wrong Host

`localhost` means the local machine. It is different from a remote hostname
or IP address.

### Sending the Wrong Credential

The service expects the credential associated with the current level.

### Publishing Credentials

Credentials should never be placed in public documentation.

### Confusing TCP With HTTP

A TCP service does not automatically mean that HTTP is being used.

The application protocol must be determined separately.

### Assuming Every Open Port Is Malicious

A listening port is not inherently malicious. Analysts must determine whether
the service is expected and authorized.

---

## Troubleshooting

If the TCP connection fails, a structured troubleshooting process can be
used.

### Check the Command

Verify the hostname and port:

```bash
nc localhost 30000
```

### Check Local Connectivity

Confirm that the service is accessible from the local environment.

### Check the Service

Where permitted, inspect local listening sockets using an appropriate system
utility.

For example:

```bash
ss -lnt
```

This can show TCP sockets in the listening state.

### Validate Input

Confirm that the correct current-level credential is being supplied.

### Observe the Response

A service may provide useful feedback when authentication succeeds or fails.

---

## Evidence / Screenshot Reference

Recommended evidence directory:

```text
evidence/screenshots/bandit-14/
```

Suggested screenshots:

```text
bandit-14-01-service-target.png
bandit-14-02-netcat-connection.png
bandit-14-03-authentication-exchange.png
bandit-14-04-sanitized-result.png
```

Screenshots should demonstrate methodology without exposing authentication
secrets.

Do not capture the actual password in a screenshot.

If the terminal displays the credential, crop or sanitize that portion before
publication.

---

## Credential Handling

The credential obtained during this challenge is sensitive authentication
material.

It is represented publicly as:

```text
[REDACTED]
```

The actual credential must not be committed to Git or uploaded to GitHub.

Avoid storing credentials in:

* Markdown files
* Shell scripts
* README files
* Screenshots
* Git commit messages
* Public issue trackers
* Public documentation

The credential was used only within the authorized OverTheWire Bandit
training environment.

---

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

All activities documented in this report were performed within the
authorized OverTheWire Bandit training environment.

The techniques described are intended for:

* Authorized cybersecurity laboratories
* CTF competitions
* Security education
* Defensive research
* Systems owned or explicitly authorized by the tester

Network-service interaction should only be performed against systems and
services for which appropriate authorization has been obtained.

---

## Lessons Learned

1. TCP services communicate through network endpoints identified by host and
   port.
2. `localhost` refers to the local system.
3. Netcat provides a simple interface for interacting with TCP services.
4. Client/server communication can be tested directly from the command line.
5. Standard input and output can be used to automate controlled network
   interactions.
6. Listening services contribute to a system's attack surface.
7. Open ports are not automatically malicious and require contextual analysis.
8. Authentication exchanges should be handled carefully.
9. Network services should be monitored for unexpected activity.
10. Service enumeration is an important foundation for security analysis.

---

## Knowledge Notes

### TCP Connection

A simplified TCP interaction is:

```text
Client
  |
  | SYN
  v
Server
  |
  | SYN-ACK
  v
Client
  |
  | ACK
  v
Established TCP Connection
```

The application can then exchange data over the established connection.

### Port Numbers

TCP uses numbered ports to distinguish services.

Examples commonly encountered in security work include:

```text
22    SSH
25    SMTP
53    DNS
80    HTTP
443   HTTPS
```

Port numbers alone do not guarantee the protocol actually running on them.

### Netcat

Netcat can act as a simple network client or listener.

This makes it useful for understanding network communication at a basic
level.

---

## Portfolio Significance

This challenge demonstrates practical familiarity with:

* TCP networking
* Linux networking utilities
* Service interaction
* Port-based communication
* Authentication workflows
* Network-service investigation
* Credential hygiene

These skills complement the Linux, SSH, and security-monitoring capabilities
demonstrated in the earlier Bandit levels.

The exercise also establishes a foundation for understanding network telemetry
and service-related alerts in SOC environments.

---

## Training Outcome

Successfully completed the Bandit Level 14 → 15 objective.

The exercise established practical understanding of TCP client/server
communication, localhost services, port-based service interaction, Netcat,
authentication exchanges, network-service investigation, attack-surface
concepts, evidence validation, and secure credential handling.

Status: Completed
