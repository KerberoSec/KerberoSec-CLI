# Networking Security & Investigation Notes

## Purpose

This note consolidates networking concepts encountered during the OverTheWire Bandit training and explains their relevance to cybersecurity investigation, service analysis, and defensive operations.

## Core Network Investigation Workflow

A practical network investigation commonly follows:

1. Identify the target host and authorized scope.
2. Determine relevant network addresses and ports.
3. Enumerate listening services.
4. Identify protocols and service behavior.
5. Determine whether communication is plaintext or encrypted.
6. Interact with the service using an appropriate client.
7. Analyze responses and connection behavior.
8. Document evidence and security implications.

Useful commands include:

```bash
hostname
ip addr
ip route
ss -tulpen
nc
nmap
openssl s_client
ssh
```
Ports and Services

A network port identifies a logical endpoint through which a service communicates.

Common examples include:

TCP 22: SSH
TCP 80: HTTP
TCP 443: HTTPS
TCP 30000+: training services

A port number alone does not prove which application is operating on that port. Service behavior and enumeration should be used to identify the protocol.

TCP Investigation

TCP provides reliable, connection-oriented communication.

Important concepts include:

Source and destination IP addresses
Source and destination ports
Listening sockets
Client/server roles
Connection establishment
Service responses

The ss command can identify local listening services and established connections.

ss -tulpen
Netcat

Netcat (nc) is a general-purpose network utility that can act as a TCP or UDP client or listener.

Example:

```bash
nc localhost 30000
```

This is useful when investigating a service that expects ordinary TCP communication.

The security lesson is that TCP connectivity does not automatically mean that the application protocol is plaintext. The expected protocol must first be identified.

TLS Services

Some services require Transport Layer Security rather than ordinary plaintext TCP communication.

A TLS-enabled service can be investigated with:

```bash
openssl s_client -connect localhost:30001
```

This can reveal:

TLS handshake behavior
Server certificate
Certificate subject
Certificate issuer
Certificate validity
Verification results
Negotiated protocol information

A self-signed certificate can produce verification warnings while the TLS session itself is successfully established.

SSH

SSH provides encrypted remote administration and authentication.

A typical connection is:

```bash
ssh user@host
```

A non-standard port can be specified with:

```bash
ssh -p 2220 user@host
```

SSH investigation should consider:

Authentication method
Destination host
Destination port
Key-based authentication
Password authentication
Host-key verification
Session behavior

Private keys and passwords must never be published in public documentation.

Network Enumeration

Network enumeration must only be performed within an authorized scope.

For an authorized training target, Nmap can identify reachable ports and services:

```bash
nmap -sV localhost
```

Useful observations include:

Open ports
Detected services
Service versions
Protocol behavior
Unexpected exposed services
Plaintext vs Encrypted Communication

An important investigation question is whether application data is transmitted securely.

Plaintext protocols may expose transmitted information to an observer.

Encrypted protocols such as TLS protect application traffic in transit.

A useful investigation sequence is:

Identify the TCP endpoint.
Determine the expected application protocol.
Select an appropriate client.
Observe the protocol handshake.
Determine whether encryption is present.
Document the security implications.
Security Analysis

Exposed network services increase an organization's attack surface.

Security teams should:

Minimize unnecessary exposed services.
Restrict services to authorized networks.
Use strong authentication.
Prefer encrypted protocols.
Monitor unusual connection attempts.
Keep network-facing software updated.
Disable obsolete or unnecessary protocols.

Unexpected listening services can indicate configuration errors, vulnerable applications, unauthorized software, or potentially malicious activity.

SOC / Blue Team Relevance

Network investigation is directly relevant to SOC operations.

Analysts may investigate:

Repeated connection attempts
Connections to unusual ports
Unexpected external destinations
Suspicious service exposure
Authentication failures
Unusual protocol behavior
Suspicious encrypted connections

Useful evidence sources include firewall logs, network-flow records, IDS/IPS alerts, DNS logs, proxy logs, and endpoint telemetry.

Network observations should be correlated with other evidence before drawing conclusions.

Evidence Handling

Important observations may include:

Source and destination addresses
Destination ports
Timestamps
Protocol
Service identification
Connection results
Relevant command output

Sensitive credentials, private keys, tokens, and authentication material should be removed or represented as [REDACTED] in public documentation.

Lessons Learned

The Bandit exercises demonstrated that network investigation requires more than simply connecting to an open port.

A reliable workflow is:

Observe → Enumerate → Identify Protocol → Select Client → Test → Analyze → Document

The key lesson is to match the investigation method to the actual service protocol.

Ethical Use

Network enumeration and service interaction must only be performed against systems for which explicit authorization has been provided.

These techniques are intended for authorized cybersecurity training, controlled laboratories, defensive administration, and security investigation.
