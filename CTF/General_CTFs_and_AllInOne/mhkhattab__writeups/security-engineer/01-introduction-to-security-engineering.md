# Module 1: Introduction to Security Engineering

> **Portfolio scope:** Technical learning notes derived from the TryHackMe Security Engineer path. These notes explain concepts and lab methodology without reproducing flags or task answers.

## Module coverage

This module combined four foundational areas:

1. the role and operating model of a security engineer;
2. core security principles;
3. applied cryptography;
4. identity and access management (IAM).

The main engineering lesson is that security is not a single appliance or product. It is a set of design decisions, controls, telemetry, and operating processes that reduce the likelihood and impact of failure.

---

## 1. Security engineering as a systems discipline

A security engineer converts business and technical requirements into controls that can be implemented, measured, and maintained. The role sits between architecture, infrastructure, software delivery, identity, operations, and incident response.

A practical workflow is:

1. **Identify assets and business processes.** Determine what the organization depends on: identities, endpoints, source code, customer data, applications, cloud subscriptions, network services, backups, and third-party providers.
2. **Model trust and data movement.** Document who or what can access each asset, through which protocol, and across which trust boundary.
3. **Define security requirements.** Convert broad goals such as “protect customer information” into verifiable controls: encryption in transit, role-based access, audit events, retention, key rotation, recovery time, and tested backups.
4. **Implement preventive and detective controls.** Preventive controls reduce opportunity; detective controls expose attempted or successful abuse.
5. **Validate the implementation.** Configuration review, scanning, code analysis, penetration testing, logging tests, and recovery exercises provide evidence.
6. **Operate and improve.** Controls degrade through configuration drift, software changes, staff turnover, and new threats. Security therefore requires ownership, monitoring, and recurring review.

### Security requirements should be testable

A weak requirement says:

> The application must be secure.

A useful requirement says:

> Administrative actions must require an authenticated account with the `admin` role, must be re-authorized server-side for every request, and must generate an audit event containing the actor, action, target object, result, source IP, request identifier, and UTC timestamp.

The second requirement can be tested through unit tests, API tests, log inspection, and an access-control review.

---

## 2. Core security principles

### CIA triad

The CIA triad provides a simple impact model:

- **Confidentiality:** information is available only to authorized subjects.
- **Integrity:** information and system state cannot be modified without authorization or detection.
- **Availability:** authorized users can access required systems and data when needed.

A control may support more than one objective. For example, immutable backups primarily support availability, but they also help restore integrity after ransomware or destructive administrator activity.

### Authentication, authorization, and accountability

These functions are related but separate:

- **Identification:** a subject claims an identity.
- **Authentication:** the system verifies that claim.
- **Authorization:** the system decides what the authenticated subject may do.
- **Accountability:** activity can be attributed to a subject through trustworthy logs and governance.

A strong password does not fix broken authorization. Likewise, an access-control decision without reliable logging limits investigation and non-repudiation.

### Least privilege and need to know

Least privilege means granting only the permissions required to perform an approved function, for only as long as necessary. In practice this involves:

- separate standard and administrative accounts;
- just-in-time privilege elevation;
- scoped service-account permissions;
- removal of stale accounts and group memberships;
- periodic access reviews;
- denying broad wildcard permissions;
- restricting where privileged identities may authenticate.

### Defense in depth

Defense in depth assumes controls can fail. A public web application may therefore use:

- a reverse proxy or web application firewall;
- hardened application hosts;
- a segmented database network;
- parameterized database queries;
- least-privileged database accounts;
- secrets management;
- endpoint monitoring;
- centralized application and identity logs;
- tested backups.

No single layer is treated as perfect. The design limits blast radius and improves detection if one layer fails.

### Secure defaults and fail-safe behavior

Systems should deny access unless an explicit rule allows it. Error paths should also fail closed. For example, if an authorization service times out, a sensitive transaction should be rejected rather than automatically approved.

### Separation of duties

High-risk operations should not depend on one unchecked identity. Examples include requiring different roles to create and approve a payment, separating code authors from production deployment approval, and restricting backup deletion to a role distinct from normal infrastructure administration.

---

## 3. Cryptography: engineering use rather than algorithm memorization

Cryptography supports confidentiality, integrity, authenticity, and non-repudiation, but only when the entire implementation is sound. Algorithm choice, key generation, key storage, randomness, protocol design, and error handling all matter.

### Hash functions

A cryptographic hash maps arbitrary input to a fixed-length digest. Security-relevant properties include resistance to preimage, second-preimage, and collision attacks.

Common uses include:

- integrity verification;
- digital signatures;
- content addressing;
- password-verification constructions when combined with a dedicated password KDF.

Example integrity check in an authorized lab:

```bash
sha256sum artifact.bin
sha256sum -c artifact.bin.sha256
```

A plain fast hash such as SHA-256 is not an appropriate password-storage scheme by itself. Passwords should use a memory-hard or deliberately expensive KDF such as Argon2id, scrypt, bcrypt, or PBKDF2 with unique salts and appropriate parameters.

### HMAC

A Hash-based Message Authentication Code combines a secret key with a hash function to provide integrity and authenticity between parties sharing that key.

```bash
openssl dgst -sha256 -hmac 'LAB_SHARED_KEY' message.txt
```

Unlike a plain hash, an attacker who can modify both a file and its unkeyed digest cannot normally forge a valid HMAC without the secret.

### Symmetric encryption

Symmetric encryption uses the same secret key for encryption and decryption. It is efficient for bulk data protection. Modern designs should use an authenticated-encryption mode such as AES-GCM or ChaCha20-Poly1305 so that ciphertext modification is detected.

Engineering concerns include:

- unique nonces or IVs according to the mode’s requirements;
- secure key generation;
- rotation and revocation;
- separation of keys by purpose;
- avoiding hard-coded keys;
- protecting keys outside the encrypted data store.

### Asymmetric cryptography

Asymmetric systems use a public/private key pair. Common uses include key establishment, digital signatures, and certificate-based identity.

A signature workflow is conceptually:

1. hash the message;
2. sign the digest with the private key;
3. verify the signature with the public key;
4. validate the signer’s public key through a trusted distribution or certificate chain.

A signature proves possession of the private key at signing time; it does not automatically prove that the key belongs to the person or service claimed. That assurance comes from key management and identity validation.

### TLS and certificates

TLS protects data in transit and authenticates servers through X.509 certificates. Validation includes:

- certificate validity period;
- subject alternative name matching;
- trusted issuer chain;
- signature validity;
- acceptable algorithms and key sizes;
- revocation or replacement handling where applicable.

Useful lab inspection commands:

```bash
openssl s_client -connect example.test:443 -servername example.test -showcerts
openssl x509 -in server.crt -noout -text
```

The `-servername` option sends Server Name Indication (SNI), which is necessary when multiple TLS sites share one IP address.

### Key-management threat model

Encryption is ineffective if the application account can retrieve both the encrypted data and an unrestricted decryption key. A better design separates duties and limits key use through a key-management service or hardware-backed boundary. Questions to ask include:

- Who can request encryption and decryption?
- Can administrators export raw keys?
- Are key-use events logged?
- How are keys rotated without losing historical data?
- What happens when a key is suspected to be compromised?
- Are development and production keys separated?

---

## 4. Identity and access management

IAM is a control plane for users, workloads, devices, and services. A compromise in IAM can bypass otherwise strong endpoint or network controls.

### Identity lifecycle

A mature identity lifecycle covers:

1. **Joiner:** create identity from an authoritative source; assign minimum baseline access.
2. **Mover:** modify access when role, department, location, or responsibilities change.
3. **Leaver:** revoke sessions and access promptly; transfer ownership; preserve required records.
4. **Review:** periodically confirm that access remains justified.

Automated provisioning reduces manual errors, but the automation must use reliable source data and handle exceptions safely.

### Authentication controls

Key controls include:

- phishing-resistant MFA for privileged and high-risk access;
- password screening and rate limiting;
- secure account recovery;
- device and location context;
- session expiration and revocation;
- token audience, issuer, scope, and lifetime validation;
- detection of impossible travel, token replay, and repeated failures.

MFA does not remove the need for secure session management. Session cookies and bearer tokens are credentials and must be protected from theft, fixation, replay, and overlong lifetime.

### Authorization models

- **RBAC:** permissions are assigned to roles; users receive roles.
- **ABAC:** policy decisions use attributes such as department, device compliance, resource classification, location, and time.
- **ReBAC:** access derives from relationships, such as owner, member, manager, or collaborator.

Regardless of model, authorization should be enforced server-side and default to deny. Object-level and function-level checks must occur for every sensitive operation.

### Privileged access management

Privileged access should use stronger controls than normal access:

- separate admin identities;
- MFA and compliant-device requirements;
- approval or ticket linkage;
- time-limited elevation;
- credential vaulting and rotation;
- session recording where appropriate;
- alerts for sensitive changes;
- break-glass accounts protected and tested separately.

### Workload identities and secrets

Applications, automation jobs, and cloud workloads also need identities. Long-lived embedded credentials should be replaced with managed identities, short-lived tokens, or workload federation where possible.

Repository and pipeline controls should detect:

- API keys;
- private keys;
- database passwords;
- cloud access keys;
- tokens in configuration files;
- secrets accidentally included in build artifacts or logs.

---

## 5. Example engineering exercise

Consider an internal administrative API that allows support staff to reset customer MFA.

### Assets

- customer accounts;
- MFA enrollment records;
- support-agent identities;
- audit logs;
- API credentials and signing keys.

### Trust boundaries

- agent browser to API gateway;
- API gateway to identity service;
- application to audit pipeline;
- production control plane to administrators.

### Security requirements

- only the `support_mfa_reset` role may call the endpoint;
- agents must use MFA and a managed device;
- reset requests must reference a valid support ticket;
- high-risk accounts require secondary approval;
- all attempts, including failures, must be logged;
- reset tokens must be single-use and expire quickly;
- the API must not reveal whether an arbitrary email address exists;
- rate and anomaly controls must detect bulk reset attempts.

### Validation plan

- unit test role and object authorization;
- attempt direct API calls without the UI;
- test replay and expired tokens;
- remove the logging service in a test environment and confirm the API fails safely or buffers securely;
- verify that audit events include actor, target, ticket, result, request ID, and timestamp;
- confirm alerts fire for unusual volume.

This exercise illustrates how security principles become concrete engineering controls and evidence.

---

## Evidence and telemetry I would expect

Useful evidence for this module’s controls includes:

- identity-provider sign-in and risk logs;
- privileged-role activation records;
- key-management audit events;
- certificate inventory and expiry monitoring;
- secret-scanning findings;
- access-review results;
- administrative API audit events;
- control-test results and exceptions.

---

## Common implementation mistakes

- treating authentication as authorization;
- relying on client-side access checks;
- using encryption without authenticated integrity;
- storing keys beside encrypted data with the same permissions;
- assigning broad permanent administrative roles;
- failing to revoke sessions after account disablement;
- logging sensitive credentials or tokens;
- writing security requirements that cannot be tested;
- assuming deployment-time hardening will never drift.

---

## Portfolio takeaway

I learned to approach security engineering as a lifecycle: model the system, define measurable requirements, implement layered controls, collect evidence, and continuously validate that the design remains effective. The strongest implementation connects architecture, cryptography, identity, logging, and incident readiness rather than treating them as isolated topics.

## References

- TryHackMe Security Engineer path: https://tryhackme.com/path/outline/security-engineer-training
- NIST Cybersecurity Framework 2.0: https://www.nist.gov/cyberframework
- OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
- NIST Digital Identity Guidelines: https://pages.nist.gov/800-63-4/
