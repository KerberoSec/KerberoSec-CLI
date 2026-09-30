# SSH Security & Investigation Notes

## Purpose

This note consolidates SSH concepts encountered during the OverTheWire
Bandit training and explains their relevance to secure remote access,
authentication analysis, incident investigation, and defensive operations.

## What Is SSH?

SSH (Secure Shell) is a protocol used to securely access remote systems
over an untrusted network.

SSH provides:

- Encrypted communication
- Server authentication
- Client authentication
- Integrity protection
- Secure remote command execution
- Secure file-transfer capabilities through related protocols

The default SSH service normally listens on TCP port 22, although
administrators may configure a different port.

## SSH Investigation Workflow

A practical SSH investigation can follow:

1. Identify the authorized target host.
2. Confirm the destination port.
3. Identify the SSH service.
4. Determine the authentication method.
5. Verify the server host key where appropriate.
6. Establish the authorized connection.
7. Observe authentication and session behavior.
8. Review relevant logs when investigating a system.
9. Document evidence without exposing credentials or private keys.

The general workflow is:

Observe → Identify → Authenticate → Investigate → Analyze → Document

## Common SSH Commands

Basic SSH connection:

```bash
ssh user@host

Connecting to a non-standard port:

ssh -p 2220 user@host

Using an authorized private key:

ssh -i /path/to/private_key user@host

Displaying the SSH client's version:

ssh -V

Testing whether an SSH service is reachable:

nc -vz host 22

For authorized service enumeration:

nmap -sV -p 22 host
```

These commands should only be used against systems within the authorized
scope of the investigation or training environment.

SSH Authentication

SSH supports multiple authentication mechanisms.

Common methods include:

Password authentication
Public-key authentication
Keyboard-interactive authentication
Certificate-based authentication
Multi-factor authentication when configured

Public-key authentication uses a key pair:

Private key: retained securely by the user
Public key: installed on the authorized server

The private key must remain confidential.

A leaked private SSH key can allow unauthorized access wherever the
corresponding public key is trusted.

SSH Private-Key Security

Private keys are sensitive authentication material.

They should:

Never be committed to a public repository
Never be included in screenshots
Never be pasted into public documentation
Be protected with appropriate filesystem permissions
Be protected with a passphrase where practical
Be rotated or revoked if exposure is suspected

Example documentation should use:

[REDACTED_PRIVATE_KEY]

rather than publishing the actual key.

SSH Host-Key Verification

SSH uses host keys to help clients authenticate the server.

During the first connection, SSH may display a message asking the user
to verify the server's host-key fingerprint.

Host-key verification helps defend against man-in-the-middle attacks.

A security-conscious workflow should not blindly accept an unexpected
host key.

Unexpected host-key changes can indicate:

Server reinstallation
Legitimate infrastructure changes
Key rotation
DNS or routing changes
Possible man-in-the-middle activity

The correct response depends on the environment and available evidence.

SSH Configuration

SSH client behavior can be influenced through configuration files.

A common user-level configuration file is:

~/.ssh/config

The system-wide SSH client configuration is commonly:

/etc/ssh/ssh_config

The SSH server configuration is commonly:

/etc/ssh/sshd_config

Configuration should be reviewed carefully because insecure settings can
increase the attack surface.

SSH File Permissions

SSH private keys should have restrictive permissions.

A commonly used permission model is:

chmod 600 ~/.ssh/id_rsa

The exact filename and permissions should follow the organization's
security policy.

Overly permissive private-key permissions can cause SSH clients to
reject the key or can expose authentication material to other local users.

SSH Investigation Evidence

Useful SSH investigation evidence may include:

Source IP address
Destination IP address
Destination port
Username
Authentication method
Authentication success or failure
Timestamp
Host-key information
Session duration
Executed commands where appropriate
Relevant authentication logs

Credentials and private keys should never be included in public evidence.

Sensitive values should be represented as:

[REDACTED]
Defensive / SOC Relevance

SSH activity is highly relevant to security operations.

A SOC analyst may investigate:

Repeated failed SSH authentication
Successful authentication following many failures
Authentication from unusual source addresses
Authentication at unusual times
New or unexpected SSH keys
Access to sensitive systems
Connections from unexpected geographic locations
Use of privileged accounts
Suspicious command execution after authentication

Useful detection data may include authentication logs, source addresses,
usernames, timestamps, and authentication outcomes.

Incident Investigation Considerations

When investigating suspicious SSH activity, analysts should correlate:

Authentication events
Source IP addresses
Account activity
Privilege changes
Process execution
File modifications
Network connections
Persistence mechanisms

A successful SSH login should not automatically be considered malicious.
The surrounding context determines whether the activity is suspicious.

Bandit Training Relevance

The Bandit exercises demonstrated several SSH-related concepts:

Remote Linux authentication
Non-standard SSH ports
SSH private-key authentication
Service identification
Secure remote access
Authentication troubleshooting
Restricted shell behavior
Credential-handling awareness

These exercises provide foundational knowledge for investigating Linux
systems and understanding authentication workflows.

Security Concepts

Important concepts demonstrated by SSH-based exercises include:

Authentication

Authentication establishes the identity of the connecting user.

Authorization

Authorization determines what the authenticated identity is permitted
to access or execute.

Confidentiality

SSH encrypts session communication to protect data from network observers.

Integrity

SSH provides protection against unauthorized modification of data during
the session.

Credential Protection

Private keys and passwords must be protected because possession of valid
authentication material can enable unauthorized access.

Defense in Depth

Strong authentication, host-key verification, least privilege, logging,
monitoring, and network restrictions provide multiple defensive layers.

Lessons Learned

The Bandit exercises demonstrated that SSH should be treated as both a
remote-access protocol and an important security telemetry source.

A reliable investigation workflow is:

Observe → Verify Host → Identify Authentication → Authenticate →
Review Evidence → Analyze Behavior → Document

The key lesson is that authentication success alone does not establish
whether activity is legitimate or malicious. Context and supporting
evidence are essential.

Ethical Use

SSH commands and investigation techniques should only be used against
systems owned by the user or for which explicit authorization has been
provided.

This note is intended for authorized cybersecurity training, controlled
laboratories, defensive administration, and security investigation.
