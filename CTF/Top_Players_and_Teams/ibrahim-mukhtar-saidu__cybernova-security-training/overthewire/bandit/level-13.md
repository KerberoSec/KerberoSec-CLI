# Bandit Level 13 → 14

## Objective

Retrieve the credential required to authenticate to Bandit Level 14.

The challenge introduces SSH private-key authentication. Instead of using a
password directly to authenticate to the next Bandit account, a private SSH
key supplied within the authorized training environment must be used.

The exercise develops practical understanding of SSH key-based
authentication, private-key handling, file permissions, remote access, and
secure credential management.

---

## Environment

| Item                  | Details                               |
| --------------------- | ------------------------------------- |
| Platform              | OverTheWire Bandit                    |
| Source System         | Parrot OS                             |
| Shell                 | Bash                                  |
| Protocol              | SSH                                   |
| SSH Port              | 2220                                  |
| Starting Account      | bandit13                              |
| Target Account        | bandit14                              |
| Authentication Method | SSH private key                       |
| Authorization         | Authorized cybersecurity training lab |
| Primary Tool          | OpenSSH client                        |

---

## Scenario

After obtaining access to the Bandit Level 13 environment, the home
directory contains an SSH private key.

The objective is to use that key to authenticate to the Bandit Level 14
account and retrieve the credential required for the following level.

The exercise demonstrates a transition from password-based authentication to
public-key cryptography.

Conceptually:

```text
Bandit 13 environment
        |
        v
Locate SSH private key
        |
        v
Protect/use key appropriately
        |
        v
SSH key-based authentication
        |
        v
Bandit 14 account
        |
        v
Retrieve next credential
```

---

## Initial Reconnaissance

The first step is to inspect the Bandit Level 13 home directory.

Example:

```bash
ls -la
```

The directory contents are examined for files that may contain
authentication material.

The presence of an SSH private-key file changes the investigation approach
because the next level is designed around key-based authentication.

---

## SSH Private Key Identification

The supplied key should be identified before being used.

A useful command is:

```bash
file <private-key>
```

The key can also be inspected carefully without publishing its contents.

Example:

```bash
head -n 2 <private-key>
```

The actual private-key contents must never be copied into the public
portfolio.

Private keys are authentication credentials and should be treated as
sensitive material.

---

## Private-Key Permissions

SSH clients commonly require private keys to have restrictive filesystem
permissions.

The permissions can be inspected using:

```bash
ls -l <private-key>
```

If necessary within the authorized training environment, permissions can be
restricted with:

```bash
chmod 600 <private-key>
```

The principle is:

```text
Private key
    |
    v
Restrictive permissions
    |
    v
Reduced unauthorized access risk
```

A private SSH key should not normally be readable by unrelated users.

---

## SSH Key-Based Authentication

The OpenSSH client can use a private key with the `-i` option.

Example:

```bash
ssh -i <private-key> -p 2220 bandit14@bandit.labs.overthewire.org
```

The `-i` option specifies the identity file used for authentication.

The `-p` option specifies the SSH service port.

The target specifies the remote username and server.

Conceptually:

```text
ssh
 |
 +-- -i <private-key>
 |
 +-- -p 2220
 |
 +-- bandit14@bandit.labs.overthewire.org
```

---

## Authentication Process

SSH public-key authentication uses a key pair:

```text
Private Key                  Public Key
     |                           |
     |                           |
     v                           v
Client                    Remote Server
     |                           |
     +------ Authentication -----+
```

The private key remains with the client.

The corresponding public key is configured on the server.

The private key is used to prove possession of the secret key material
without transmitting the private key itself as a password.

---

## Why Private-Key Authentication Matters

SSH key authentication is widely used for:

* Linux server administration
* Cloud infrastructure
* DevOps environments
* Security operations
* Incident-response systems
* Automation
* Administrative access

Understanding how SSH keys work is therefore directly relevant to
cybersecurity operations.

---

## Command-by-Command Explanation

### `ls -la`

Lists files including hidden files.

This is useful during initial reconnaissance because important configuration
or authentication files may not appear in a normal directory listing.

---

### `file`

Identifies the probable type of a file.

This can help distinguish a private key from ordinary text or another file
format.

---

### `ls -l`

Displays file permissions, ownership, and other metadata.

This is useful for checking whether sensitive authentication material has
appropriate access restrictions.

---

### `chmod 600`

Restricts a private key so that the owner has read/write access while other
users have no access.

The exact permissions required may depend on the SSH implementation and
environment.

---

### `ssh -i`

Specifies the private key that the SSH client should use for authentication.

---

### `ssh -p`

Specifies the TCP port on which the SSH server is listening.

The Bandit environment uses port `2220` rather than the default SSH port.

---

## Observed Result

The supplied SSH private key was used to authenticate to the Bandit Level 14
account within the authorized training environment.

After successful authentication, the next-level credential was obtained from
the designated Bandit authentication location.

Credential:

```text
[REDACTED]
```

The actual credential is intentionally excluded from this public repository.

---

## Evidence Validation

The authentication process was validated by successfully accessing the
authorized Bandit Level 14 environment.

Evidence should demonstrate:

1. Identification of the supplied private-key file.
2. Inspection of the key's permissions.
3. Appropriate use of the SSH identity option.
4. Successful authentication.
5. Sanitized confirmation of the resulting access.

No private-key contents or authentication credentials should appear in
published evidence.

---

## Investigation Approach

The investigation focused on identifying and safely using an SSH private key
provided by the authorized training environment.

The workflow was:

1. Inspect the available files.
2. Identify the private-key artifact.
3. Validate the artifact type.
4. Inspect its filesystem permissions.
5. Correct permissions when required by the SSH client.
6. Use the key explicitly with SSH.
7. Specify the authorized destination account and port.
8. Validate successful authentication.
9. Avoid copying or publishing the private key.
10. Document the authentication mechanism without exposing credential material.

The investigation demonstrates both offensive-awareness and defensive
understanding of SSH key-based authentication.

## Techniques and Commands

The investigation involved:

- SSH session management
- Linux filesystem enumeration
- SSH private-key identification
- File-type and metadata inspection
- Private-key permission analysis
- OpenSSH identity-file configuration
- Public-key authentication analysis
- Authentication-context verification
- Secure credential handling
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training session.
2. Inspect the home directory for relevant authentication artifacts.
3. Identify the supplied SSH private key without exposing its contents.
4. Review the key file type and filesystem permissions.
5. Apply restrictive permissions when required by the authorized training
   environment.
6. Use the OpenSSH client with the appropriate identity file.
7. Verify successful authentication to the authorized target account.
8. Retrieve the required next-stage training information.
9. Keep the private key and recovered credentials outside public
   documentation.
10. Record only sanitized evidence of the authentication workflow.

Representative sanitized commands include:

```bash
ls -la
```

```bash
file <private-key>
```

```bash
ls -l <private-key>
```

```bash
chmod 600 <private-key>
```

```bash
ssh -i <private-key> -p <ssh-port> <target-user>@<authorized-host>
```

The actual private-key contents, credentials, account-specific authentication
material, and unnecessary challenge infrastructure details are intentionally
excluded from this public documentation.

The purpose of this section is to demonstrate SSH key-based authentication,
Linux permissions, authentication-material protection, and evidence handling
within an authorized cybersecurity training environment.

---

## Security Concepts

### Public-Key Cryptography

SSH key authentication uses asymmetric cryptography involving a private key
and a corresponding public key.

### Private-Key Protection

The private key must remain confidential.

Anyone who obtains an unrestricted private key may potentially use it to
authenticate as the associated identity, depending on the server-side
configuration.

### File Permissions

Linux permissions provide an important local control for protecting
authentication material.

### Authentication

SSH supports multiple authentication mechanisms, including passwords and
public-key authentication.

### Identity-Based Access

SSH keys can provide individual identities for users, administrators,
automation accounts, and services.

### Credential Exposure

Private keys should be treated as secrets even when they are generated for
temporary training environments.

---

## MITRE ATT&CK Relevance

The exercise focuses on SSH private-key identification and key-based
authentication.

The defensive security relevance includes understanding how exposed private
keys can enable unauthorized access. The exercise is therefore useful for
understanding credential-access and valid-account risks, while the exact
Bandit procedure should not be treated as a direct adversary emulation.

## Skills Demonstrated

* Linux filesystem enumeration
* Hidden-file inspection
* SSH client usage
* SSH key-based authentication
* Private-key identification
* Linux file-permission analysis
* `chmod` usage
* Remote authentication
* Secure credential handling
* Authentication troubleshooting
* Technical documentation

---

## Defensive / SOC Relevance

SSH key authentication is highly relevant to security operations.

### Unauthorized Key Usage

A compromised private key can potentially allow unauthorized access to
servers or cloud infrastructure.

SOC analysts should understand the significance of unexpected SSH
authentication events.

### SSH Monitoring

Security teams may monitor:

* Successful SSH logins
* Failed SSH authentication
* New authorized keys
* Unusual source addresses
* Unusual login times
* Privileged SSH sessions
* Unexpected administrative access

### Credential Theft

Private SSH keys are attractive targets because they can provide persistent
access without requiring a traditional password.

### Incident Response

During an investigation, analysts may need to determine:

* Which key was used
* Which account authenticated
* From which source
* When the authentication occurred
* Whether the key was expected
* Whether the key should be revoked

### Cloud Security

SSH keys are commonly encountered when administering Linux cloud
instances.

Poorly managed keys can create significant access-control risks.

---

## Example SOC Investigation Scenario

A monitoring system detects an unexpected SSH login to a Linux production
server.

An analyst could investigate:

```text
Authentication Event
        |
        v
Identify Account
        |
        v
Identify Source IP
        |
        v
Determine Authentication Method
        |
        v
Check Authorized Keys
        |
        v
Review User Activity
        |
        v
Assess Whether Access Was Legitimate
```

If an unknown SSH key was added shortly before the suspicious login, the
event could indicate unauthorized persistence.

This demonstrates why understanding SSH authentication mechanisms is useful
for SOC analysts.

---

## SSH Key Security Controls

Organizations can reduce SSH-key-related risk through controls such as:

* Strong private-key protection
* Appropriate filesystem permissions
* Centralized identity management
* Key rotation
* Key expiration where supported
* Removal of unused keys
* MFA or additional authentication controls
* SSH logging
* Network access restrictions
* Administrative access monitoring
* Privileged-access management

---

## Common Mistakes

### Publishing the Private Key

Never publish the private key in GitHub repositories, screenshots, or
documentation.

### Weak File Permissions

A private key with unnecessarily broad permissions increases the risk of
local credential exposure.

### Assuming SSH Keys Are Automatically Safe

Key-based authentication reduces reliance on passwords but does not eliminate
credential theft risks.

### Using the Wrong Username

The private key and target username must correspond to the intended
authentication configuration.

### Using the Wrong Port

The Bandit SSH service uses port `2220`.

### Confusing Public and Private Keys

The private key must remain secret.

The public key can generally be distributed to systems that need to verify
the identity.

---

## Evidence / Screenshot Reference

Recommended evidence directory:

```text
evidence/screenshots/bandit-13/
```

Suggested screenshots:

```text
bandit-13-01-directory-enumeration.png
bandit-13-02-key-permissions.png
bandit-13-03-file-identification.png
bandit-13-04-ssh-authentication.png
bandit-13-05-successful-access.png
```

Screenshots must be sanitized.

Do not capture:

* Private-key contents
* Passwords
* Tokens
* API keys
* Other authentication secrets

A terminal screenshot showing the command and successful authentication
without revealing sensitive material is sufficient evidence.

---

## Credential Handling

The Bandit Level 14 credential is intentionally represented as:

```text
[REDACTED]
```

The SSH private key used during the exercise is also intentionally excluded
from this repository.

The actual authentication material must not be committed to Git or uploaded
to GitHub.

If a private key or password is accidentally committed, it should be treated
as exposed and removed from service immediately where applicable.

Simply deleting a secret from the latest working tree may not remove it from
Git history.

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

All activities documented in this report were performed against the
authorized OverTheWire Bandit training environment.

The techniques described are intended for:

* Authorized cybersecurity laboratories
* CTF competitions
* Security education
* Defensive research
* Systems owned or explicitly authorized by the tester

SSH authentication techniques must not be used to access systems without
appropriate authorization.

---

## Lessons Learned

1. SSH supports secure public-key authentication.
2. Private keys are sensitive authentication material.
3. Linux file permissions are important for protecting private keys.
4. `ssh -i` allows an explicit identity file to be selected.
5. SSH authentication should be monitored in production environments.
6. Compromised private keys can create significant security risk.
7. Public keys and private keys have different security requirements.
8. Security evidence should demonstrate methodology without exposing secrets.
9. SSH key management is relevant to both traditional Linux infrastructure
   and cloud environments.
10. Authentication mechanisms should be understood from both an offensive
    and defensive perspective.

---

## Knowledge Notes

### SSH Key Pair

An SSH key pair consists of:

```text
Private Key → Secret
Public Key  → Distributed for verification
```

The private key must be protected.

### Authentication Flow

A simplified public-key authentication process is:

```text
Client
  |
  | Request authentication
  v
Server
  |
  | Challenge/proof process
  v
Client proves possession of private key
  |
  v
Server verifies against authorized public key
  |
  v
Authentication succeeds
```

### File Permissions

A private key should normally have restrictive permissions.

For example:

```text
-rw-------
```

represents read/write access for the owner with no access for group or
other users.

The exact requirements should be verified against the SSH implementation
being used.

---

## Portfolio Significance

This challenge provides evidence of practical experience with:

* SSH administration
* Linux authentication
* Public-key cryptography concepts
* Credential protection
* File permissions
* Remote access
* Security monitoring considerations

These are foundational skills for junior SOC analysts, security analysts,
Linux security roles, cloud-security roles, and incident-response positions.

The exercise also demonstrates the ability to understand an authentication
mechanism rather than relying solely on password-based access.

---

## Training Outcome

Successfully completed the Bandit Level 13 → 14 objective.

The exercise established practical understanding of SSH private-key
authentication, public-key cryptography concepts, Linux file permissions,
remote access, authentication security, credential protection, and SOC
monitoring relevance.

Status: Completed
