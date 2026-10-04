# Bandit Level 15 → 16

## Objective

Retrieve the credential required to authenticate to Bandit Level 16.

The exercise requires interacting with a network service protected by TLS and submitting the appropriate Bandit credential through an encrypted connection.

The objective is to understand how secure network services can be investigated and accessed using command-line TLS tooling while maintaining proper credential-handling practices.

---

## Environment

| Item | Value |
|---|---|
| Platform | OverTheWire Bandit |
| Starting Account | bandit15 |
| Target Account | bandit16 |
| Protocol | TLS/SSL |
| Service | localhost |
| Port | 30001 |
| Primary Tool | OpenSSL |
| Operating System | Linux |

---

## Challenge Description

After authenticating to the `bandit15` account, the environment contains a credential associated with the previous authentication level.

The next credential must be obtained by communicating with a local network service listening on TCP port `30001`.

Unlike the previous level, this service expects communication over TLS rather than an ordinary plaintext TCP connection.

This introduces an important security concept: the transport protocol must match the service requirements.

---

## Initial Environment Investigation

The environment was first inspected to confirm the authenticated identity and working directory.

```bash
whoami
pwd
hostname
```

The commands confirmed that the session was operating as:

bandit15

The home directory was:

/home/bandit15

The host was also confirmed as the Bandit training server.

## Credential File Investigation

The home directory contained a file associated with the previous authentication level:

ls -la

The relevant file was:

<previous-level-credential-file>

Its permissions indicated that it was readable by the bandit15 user.

The file was treated as sensitive authentication material and was not included in the public project documentation.

## Understanding the Network Service

The Level 15 service listens on:

localhost:30001

An initial connection was attempted using:

openssl s_client -connect localhost:30001

The connection was successfully established.

The server presented a TLS certificate with:

Subject: CN=SnakeOil
Issuer: CN=SnakeOil

The certificate was self-signed, producing:

Verification error: self-signed certificate
Verify return code: 18

This does not prevent communication with the authorized training service.

The important observation was that TLS negotiation succeeded and the service was ready to receive application data.

## Why the Initial Connection Appeared to Hang

Running:

openssl s_client -connect localhost:30001

established the TLS connection but did not automatically submit the required credential.

The terminal displayed:

read R BLOCK

This indicates that the client was waiting for input from the connected service.

Therefore, the credential needed to be supplied through the established TLS connection.

## TLS Authentication Procedure

The credential obtained during the previous Bandit level was supplied to the TLS service using OpenSSL.

The general procedure was:

printf '%s\n' '<REDACTED_PREVIOUS_LEVEL_CREDENTIAL>' | \
openssl s_client -connect localhost:30001 -quiet

The actual credential was intentionally omitted from this repository.

The TLS service returned:

Correct!

This confirmed that the submitted credential was accepted.

## Result

The service returned the credential required for the next Bandit level.

Service response: Correct!
Credential: [REDACTED]

The credential was validated only within the authorized OverTheWire Bandit environment.

It is intentionally excluded from this public repository.

## Technical Analysis

This exercise demonstrated the difference between ordinary TCP communication and TLS-protected communication.

The previous level used a plaintext network service accessed with Netcat.

This level required a TLS client because the service was configured to expect an encrypted TLS connection.

The workflow was therefore:

```text
Previous Level Credential
          |
          v
    OpenSSL TLS Client
          |
          v
 localhost:30001
          |
          v
    TLS Handshake
          |
          v
   Credential Submission
          |
          v
     Service Validation
          |
          v
    Next-Level Credential
```

## Investigation Approach

The investigation followed a protocol-aware workflow rather than treating the reachable TCP service as a generic plaintext endpoint.

The workflow was:

1. Confirm the authenticated identity and host context.
2. Inspect the available credential material without publishing it.
3. Identify the target service and TCP port.
4. Determine that the service expects TLS.
5. Establish a TLS session with `openssl s_client`.
6. Observe and interpret the certificate and verification behavior.
7. Submit the authorized credential through the encrypted connection.
8. Validate the application response.
9. Redact authentication material from public documentation.

This approach demonstrates protocol identification, TLS service investigation, authentication validation, and secure evidence handling.

## Techniques and Commands

The primary command-line techniques demonstrated were:

```bash
whoami
pwd
hostname
ls -la
openssl s_client -connect localhost:30001
printf '%s\n' '<REDACTED_PREVIOUS_LEVEL_CREDENTIAL>' | \
openssl s_client -connect localhost:30001 -quiet
```

These commands demonstrate identity verification, environment discovery, filesystem inspection, TLS connection establishment, encrypted credential submission, and service-response validation.

## TLS Certificate Observations

The server presented a self-signed certificate.

Relevant observations included:

TLS connection successfully established
TLS 1.3 negotiated
RSA 4096-bit server certificate
Self-signed certificate
Certificate verification warning
Encrypted application communication

The self-signed certificate is expected in this controlled training environment.

In a production environment, certificate validation would be an important security control.

## Security Significance

The exercise demonstrates several important defensive security concepts.

1. Encryption in Transit

TLS protects application data while it travels between the client and server.

Without encryption, credentials transmitted over a network could potentially be exposed to unauthorized observers.

2. Certificate Validation

TLS certificates help clients establish trust in the server.

A self-signed certificate should not automatically be trusted in a production environment unless the trust relationship is intentionally configured.

3. Service Identification

Knowing which protocol a service expects is essential during network investigation.

A plaintext client may fail against a TLS-enabled service even when the correct port is reachable.

4. Credential Protection

Credentials should not be unnecessarily displayed, copied into logs, screenshots, shell history, or public repositories.

The actual Bandit credentials were therefore redacted from this documentation.

## Command-Line Investigation Skills

The exercise reinforced practical Linux and security-analysis skills including:

whoami
pwd
hostname
ls -la
openssl s_client
printf

These commands support identity verification, environment discovery, filesystem inspection, and secure network-service interaction.

## Evidence Validation

The result was validated through the service response:

Correct!

This provides direct evidence that the submitted credential was accepted by the authorized training service.

The actual credential is not required as evidence in the public repository.

## Credential Handling

Credentials discovered during this exercise are considered sensitive authentication material.

The credentials must not be committed to:

Git repositories
GitHub
README files
Screenshots
Public reports
Shell scripts
Example configuration files

Public documentation should use placeholders such as:

Credential: [REDACTED]

Only the methodology and sanitized validation result should be documented.

## Defensive / SOC Relevance

Although this is a CTF exercise, the underlying skills have practical SOC relevance.

A security analyst may need to:

Identify network services
Determine the protocol used by a service
Analyze TLS connections
Inspect certificate information
Understand authentication flows
Distinguish transport-layer failures from authentication failures
Protect discovered credentials
Preserve useful evidence without exposing secrets

These skills contribute to network investigation, incident response, security monitoring, and defensive troubleshooting.

## MITRE ATT&CK Relevance

This exercise is primarily a controlled Linux, networking, TLS, and authentication training exercise rather than a direct simulation of adversary behavior.

A limited conceptual ATT&CK relationship is:

- **T1078: Valid Accounts:** Relevant as authentication context because the exercise requires a valid credential to access the next stage of the authorized training environment.

This mapping is presented as defensive analytical context rather than a claim that the Bandit exercise reproduces the adversary technique.

The exercise does not provide sufficient evidence to claim a direct **T1021: Remote Services** procedure because the target service is accessed locally through `localhost:30001`.

## Lessons Learned

The exercise demonstrated that:

A reachable TCP port does not necessarily indicate plaintext communication.
TLS-enabled services require an appropriate TLS client.
openssl s_client is useful for manually investigating TLS services.
Self-signed certificates generate verification warnings.
A successful TLS handshake does not automatically mean application authentication has succeeded.
Application data must still be supplied after establishing the TLS connection.
Authentication credentials should be treated as sensitive information.
Evidence can be validated without publishing the secret itself.
Protocol identification is an important part of network investigation.
Secure credential handling is part of professional security documentation.
## Limitations

This exercise uses a controlled OverTheWire training environment.

The environment does not represent the full complexity of production TLS infrastructure.

Real-world environments may additionally involve:

Certificate authorities
Certificate chains
Mutual TLS
SNI
Load balancers
Proxies
Network segmentation
SIEM monitoring
Endpoint telemetry
Authentication logging
Centralized identity providers

Therefore, the techniques demonstrated here should be considered foundational rather than a complete TLS troubleshooting methodology.

## Ethical Use

All techniques documented here were performed within the authorized OverTheWire Bandit training environment.

The commands and techniques should only be used against systems for which explicit authorization has been obtained.

Unauthorized credential collection, network probing, or authentication attempts against third-party systems are not permitted.

## Training Outcome

Successfully completed the Bandit Level 15 → 16 objective.

The exercise established practical understanding of:

TLS/SSL communication
OpenSSL client usage
TCP service interaction
TLS certificate inspection
Self-signed certificate behavior
Authentication over encrypted channels
Network-service investigation
Credential protection
Evidence validation
Security analysis

Status: Completed
