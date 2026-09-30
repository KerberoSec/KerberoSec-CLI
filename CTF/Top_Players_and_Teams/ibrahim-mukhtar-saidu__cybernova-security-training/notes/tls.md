# TLS Security & Investigation Notes

## Purpose

This note consolidates TLS concepts encountered during the OverTheWire
Bandit training and explains their relevance to secure communications,
certificate analysis, service investigation, and defensive security.

## What Is TLS?

Transport Layer Security (TLS) is a cryptographic protocol designed to
protect communications between networked systems.

TLS provides three important security properties:

- Confidentiality
- Integrity
- Authentication

TLS is commonly used to protect application protocols such as HTTPS,
secure email, APIs, and other network services.

## TLS Investigation Workflow

A practical TLS investigation can follow:

1. Identify the authorized target and service port.
2. Determine whether the service expects TLS.
3. Establish a TLS connection using an appropriate client.
4. Observe the TLS handshake.
5. Inspect the server certificate.
6. Review certificate validation results.
7. Identify the negotiated protocol and cryptographic parameters.
8. Analyze connection behavior.
9. Document observations without exposing sensitive authentication data.

The general workflow is:

Observe → Identify Service → Establish TLS → Inspect Certificate →
Analyze Handshake → Validate → Document

## TLS Service Testing

OpenSSL provides a useful command-line TLS client.

For an authorized local training service:

```bash
openssl s_client -connect localhost:30001
```

A successful connection may provide information about:

TLS handshake
Server certificate
Certificate subject
Certificate issuer
Certificate validity
Certificate verification
Negotiated TLS version
Cipher suite
Server capabilities

The exact output depends on the server configuration and OpenSSL version.

TLS Handshake

The TLS handshake establishes the cryptographic parameters used for the
protected session.

At a high level, the handshake allows the client and server to:

Negotiate supported protocol parameters.
Select cryptographic algorithms.
Authenticate the server where certificate validation is used.
Establish shared session keys.
Begin protected application communication.

The handshake is therefore an important source of evidence when investigating
TLS-enabled services.

Certificates

A TLS server commonly presents a digital certificate.

Certificate information may include:

Subject
Issuer
Validity period
Public key information
Signature algorithm
Subject Alternative Names
Certificate chain information

A certificate helps a client determine whether the server identity can be
trusted according to the configured trust model.

Self-Signed Certificates

A self-signed certificate is signed by the certificate itself rather than
by a trusted external Certificate Authority.

Self-signed certificates are common in:

Development environments
Internal laboratories
Testing systems
Training environments

A self-signed certificate may generate a verification warning even though
the TLS handshake itself succeeds.

Therefore:

Certificate verification failure does not necessarily mean that TLS
encryption failed.

The handshake and certificate-validation results should be analyzed
separately.

Certificate Validation

Certificate validation may consider:

Trusted issuer
Certificate expiration
Hostname matching
Certificate chain
Key usage
Certificate constraints
Revocation status where applicable

An analyst should distinguish between:

TLS connection established
Certificate presented
Certificate trusted
Certificate hostname validated

These are related but different observations.

TLS Version and Cipher Suite

The negotiated TLS version and cipher suite provide useful information
about the security properties of a connection.

Modern TLS deployments should use appropriately supported versions and
strong cryptographic algorithms.

Legacy protocols and weak cryptographic configurations may increase
security risk.

For example, an investigation may record:

TLS version: [OBSERVED_VERSION]
Cipher suite: [OBSERVED_CIPHER]

Sensitive authentication information should not be included in public
documentation.

OpenSSL Investigation Techniques

OpenSSL can provide detailed TLS service information.

Basic connection:

openssl s_client -connect host:443

Specifying a server name for SNI:

openssl s_client -connect host:443 -servername host

Testing a specific TLS version where supported:

openssl s_client -connect host:443 -tls1_2

These commands should only be used against authorized systems.

Plaintext vs TLS-Protected Services

A key lesson from the Bandit training is that TCP connectivity alone does
not identify the application protocol.

For example:

TCP connection
      |
      v
Service detected
      |
      +---- Plaintext protocol
      |
      +---- TLS-protected protocol

An ordinary TCP client may successfully connect to a port while still being
unable to communicate correctly because the service expects a TLS handshake.

Protocol identification should therefore occur before interpreting service
responses.

Evidence Collection

Useful TLS investigation evidence may include:

Destination host
Destination port
Timestamp
TLS version
Cipher suite
Certificate subject
Certificate issuer
Certificate validity
Verification result
Connection outcome
Relevant OpenSSL output

Credentials, private keys, session secrets, and other authentication
material must not be published.

Sensitive values should be represented as:

[REDACTED]
Defensive / SOC Relevance

TLS analysis is relevant to security operations because encrypted
communications can contain important security telemetry.

A SOC analyst may investigate:

Unexpected TLS connections
Connections to suspicious destinations
Certificate anomalies
Expired certificates
Unexpected self-signed certificates
Weak TLS configurations
Unusual TLS versions
Unexpected encrypted services
Suspicious encrypted outbound traffic

TLS metadata can help analysts investigate network behavior even when the
application payload itself is encrypted.

Incident Investigation Considerations

When investigating suspicious encrypted traffic, analysts can correlate:

Source IP
Destination IP
Destination port
Timestamp
TLS version
Certificate information
DNS activity
Process responsible for the connection
Authentication events
Other network telemetry

Encryption should not automatically be interpreted as malicious.

The investigation should focus on context, destination, process behavior,
identity, timing, and other available evidence.

Bandit Training Relevance

The Bandit training demonstrated the difference between ordinary TCP
communication and TLS-protected service communication.

The investigation required recognizing that a service expected TLS and then
using an appropriate TLS client to establish communication.

This demonstrated:

Protocol identification
TLS service interaction
Certificate inspection
TLS verification behavior
Secure credential transmission
Network troubleshooting
Evidence interpretation
Security Concepts
Confidentiality

TLS encrypts application data so unauthorized network observers cannot
normally read the protected content.

Integrity

TLS helps detect unauthorized modification of protected communication.

Authentication

Certificates can provide a mechanism for authenticating the server.

Trust

Certificate validation depends on a configured trust model and should not
be treated as an automatic guarantee of security.

Secure Transport

Sensitive authentication material should be transmitted only through
appropriately protected channels.

Lessons Learned

The Bandit exercises demonstrated that a reachable TCP port does not by
itself identify the protocol or security properties of a service.

A reliable workflow is:

Observe → Identify Protocol → Establish TLS → Inspect Certificate →
Analyze Verification → Validate Communication → Document

The key lesson is to distinguish network connectivity, TLS establishment,
certificate validation, and application authentication as separate stages
of an investigation.

Ethical Use

TLS investigation techniques should only be used against systems owned by
the user or for which explicit authorization has been provided.

This note is intended for authorized cybersecurity training, controlled
laboratories, defensive administration, and security investigation.
