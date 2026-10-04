# Bandit Level 10 → 11

## Objective

Retrieve the credential required to authenticate to Bandit Level 11.

The challenge requires identifying encoded data and converting it back into
its original readable representation.

The primary security concept demonstrated is the distinction between
encoding and encryption, together with practical use of Linux command-line
tools for data transformation.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit10 |
| Target Account | bandit11 |
| Authorization | Authorized cybersecurity training lab |
| Training Type | Cybersecurity / CTF practice |

---

## Scenario

The challenge provides data that has been encoded rather than encrypted.

The task is to recognize the encoding format, decode the data, and identify
the resulting credential.

This exercise builds on the command-line investigation techniques developed
in earlier Bandit levels.

Rather than treating an unfamiliar string as a password immediately, the
analyst should first determine whether the value represents encoded data.

---

## Initial Access

The Bandit Level 10 environment was accessed through SSH.

Example connection:

```bash
ssh -p 2220 bandit10@bandit.labs.overthewire.org
```

Authentication was performed using the credential obtained from the previous
authorized training level.

Sensitive authentication information is intentionally excluded from this
repository.

---

## Initial Reconnaissance

After establishing access to the environment, the working directory was
inspected.

Example command:

```bash
ls -la
```

The purpose of the initial reconnaissance was to identify the available
challenge artifact and determine how its contents should be processed.

The file contents were then inspected to determine whether the data appeared
to use a recognizable encoding format.

---

## Data Inspection

The challenge data appeared as a string using a restricted character set
consistent with Base64 representation.

Base64 commonly uses:

- Uppercase letters
- Lowercase letters
- Numbers
- `+`
- `/`
- `=` padding

The presence of these characteristics can provide an initial indication that
data may be Base64 encoded.

However, character appearance alone should not be considered definitive proof.
The data should be decoded and the result validated.

---

## Encoding vs Encryption

An important concept demonstrated by this exercise is the difference between
encoding and encryption.

### Encoding

Encoding transforms data into another representation so that it can be
stored or transmitted using a compatible format.

Base64 is an encoding scheme.

It does not provide confidentiality.

Anyone with the encoded value and knowledge of the encoding method can decode
the original data.

### Encryption

Encryption is designed to protect confidentiality by transforming plaintext
into ciphertext using a cryptographic algorithm and key.

Without the appropriate key or cryptographic weakness, encrypted data should
not normally be recoverable simply by applying a standard decoding operation.

Therefore:

    Base64 ≠ Encryption

This distinction is important when analyzing suspicious data, authentication
artifacts, configuration files, logs, and network traffic.

---

## Base64 Investigation

The Linux `base64` utility can decode Base64-encoded data.

Example:

```bash
base64 -d <target-file>
```

An equivalent long-form option is:

```bash
base64 --decode <target-file>
```

The decoded output can then be inspected and validated.

---

## Command Pipeline

A command pipeline can also be used when the encoded value needs to be
processed as part of a larger investigation.

Example:

```bash
cat <target-file> | base64 -d
```

A more direct approach is generally preferable when the input is already
stored in a file:

```bash
base64 -d <target-file>
```

This avoids unnecessary use of `cat` and demonstrates clearer command-line
processing.

---

## Investigation Methodology

The investigation followed a structured process:

1. Establish authorized SSH access.
2. Enumerate the working directory.
3. Identify the challenge artifact.
4. Inspect the stored data.
5. Recognize characteristics consistent with Base64.
6. Select an appropriate decoding utility.
7. Decode the data.
8. Inspect the resulting plaintext.
9. Validate the result within the authorized training environment.
10. Document the methodology without publishing the credential.

This workflow demonstrates controlled analysis rather than guessing.

---

## Observed Result

The encoded data was successfully decoded.

The decoded output contained the credential required for the next Bandit
level.

Credential:

    [REDACTED]

The actual credential is intentionally excluded from this public repository.

The decoded value was used only within the authorized OverTheWire Bandit
training environment.

---

## Technical Explanation

Base64 represents binary or textual data using a limited set of printable
characters.

The encoding process represents groups of binary data using Base64 characters.

Decoding reverses this representation:

    Base64 encoded data
            |
            v
       Base64 decoder
            |
            v
      Original data
            |
            v
        Validation

Base64 is therefore a reversible representation rather than a security
boundary.

---

## Techniques and Commands

The investigation involved:

- Linux filesystem enumeration
- Command-line text inspection
- Data representation analysis
- Base64 identification
- Base64 decoding
- Standard input/output processing
- Command pipelines
- Transformation validation
- Plaintext verification
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training session.
2. Inspect the supplied challenge artifact.
3. Identify that the apparent content is encoded rather than ordinary
   plaintext.
4. Recognize the encoding as Base64.
5. Apply a controlled Base64 decoding operation.
6. Validate the resulting plaintext.
7. Confirm that the decoded value represents the required next-stage
   training credential.
8. Avoid reproducing the credential in public documentation.
9. Record only the methodology and sanitized evidence.

Representative sanitized commands include:

```bash
base64 -d <encoded-file>
```

```bash
cat <encoded-file> | base64 -d
```

The actual credential is intentionally omitted from this public
documentation.

The purpose of this section is to demonstrate encoding identification,
command-line data transformation, pipeline usage, validation, and secure
handling of authentication material within an authorized cybersecurity
training environment.

---

## Security Implications

Base64 is frequently encountered during security investigations.

Examples include:

- Configuration files
- API payloads
- Authentication headers
- Email content
- Web application data
- Malware configuration
- Log entries
- Cloud service data
- PowerShell commands
- HTTP request parameters

Because Base64 does not provide confidentiality, organizations should not
treat Base64-encoded credentials or secrets as securely protected secrets.

If sensitive information is merely Base64 encoded, an attacker who obtains
the encoded value may be able to recover the underlying information easily.

---

## SOC / Defensive Relevance

### Log Analysis

Security analysts may encounter Base64 values in application or security
logs.

Recognizing Base64 can help analysts determine whether additional decoding
is required during an investigation.

### Malware Analysis

Malware sometimes stores configuration information or command data in encoded
form.

Decoding such values can expose useful indicators such as:

- URLs
- Domains
- IP addresses
- Commands
- File paths
- Configuration values

Base64 alone does not prove malicious intent. Context and correlation are
required.

### Web Security

Web applications may encode data before transmitting it.

Analysts should distinguish between encoding and cryptographic protection when
evaluating the security of an application.

### Incident Response

During incident response, analysts may encounter encoded artifacts collected
from endpoints, logs, memory, or network traffic.

Recognizing common encoding formats can accelerate initial triage.

---

## Security Analysis

The important analytical question is not simply:

    "Can this string be decoded?"

The more useful investigation questions are:

- What format is being used?
- Why is the data encoded?
- Where did the data originate?
- Is the decoded value sensitive?
- Is the decoded content expected?
- Does it correlate with other evidence?
- Does the encoding attempt to obscure suspicious activity?

This approach prevents analysts from treating encoding itself as evidence of
malicious activity.

---

## MITRE ATT&CK Relevance

The exercise focuses on recognizing Base64 encoding and decoding an encoded
artifact.

It does not directly reproduce an adversary technique. Encoded or transformed
data can occur during attacker activity, but the Bandit challenge itself is
best treated as an analytical training exercise rather than a direct ATT&CK
procedure simulation.

## Skills Demonstrated

### Linux

- SSH access
- Filesystem inspection
- Command-line processing
- Data decoding
- Standard Linux utilities
- Command pipelines

### Security Analysis

- Encoding identification
- Data transformation
- Credential discovery
- Evidence validation
- Sensitive-data handling

### Analytical Skills

- Pattern recognition
- Tool selection
- Hypothesis testing
- Result validation
- Security-context analysis

---

## Tools Used

### SSH

Used to establish authenticated access to the authorized Bandit environment.

### `ls`

Used for initial directory reconnaissance.

### `base64`

Used to decode the encoded challenge data.

### Bash

Used to execute commands and construct command pipelines.

---

## Evidence

Evidence should demonstrate the investigation methodology without exposing
authentication material.

Recommended evidence includes:

- Initial directory enumeration.
- Challenge-file identification.
- Encoded data inspection.
- Base64 decoding command.
- Sanitized decoded output.
- Successful progression to the next authorized level.

Suggested screenshot names:

    evidence/screenshots/bandit-10-reconnaissance.png

    evidence/screenshots/bandit-10-base64-analysis.png

    evidence/screenshots/bandit-10-decoding.png

---

## Evidence Reference

Recommended repository references:

    evidence/screenshots/bandit-10-reconnaissance.png
    evidence/screenshots/bandit-10-base64-analysis.png
    evidence/screenshots/bandit-10-decoding.png

If these screenshots were not captured during the original session, they
should only be added after reproducing the relevant steps.

Evidence must represent work that was actually performed.

Screenshots containing credentials should be sanitized before being added to
the public repository.

---

## Credential Handling

The credential discovered during this exercise is sensitive authentication
material.

It is intentionally represented as:

    [REDACTED]

The credential must not be committed to:

- Git
- GitHub
- README files
- Markdown reports
- Screenshots
- Issue trackers
- Public documentation

The credential was used only for progression within the authorized
OverTheWire Bandit environment.

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

This activity was conducted against the OverTheWire Bandit training
environment for authorized cybersecurity education.

The techniques documented here should only be applied to systems for which
explicit authorization has been provided.

Appropriate environments include:

- Cybersecurity laboratories
- CTF competitions
- Personal systems
- Authorized security assessments
- Defensive research environments

---

## Knowledge Notes

### Base64

Base64 is an encoding scheme used to represent binary data using printable
characters.

It is commonly used when systems need to transport data through channels that
expect text.

### Reversibility

Base64 encoding is intentionally reversible.

No secret cryptographic key is required to decode ordinary Base64 data.

### Confidentiality

Encoding does not provide confidentiality.

Sensitive data should be protected using appropriate security controls rather
than simply encoded.

### Analyst Awareness

Security analysts should recognize common encoding formats during investigation
because encoded data can otherwise appear unusual or suspicious without being
properly understood.

---

## Investigation Workflow

The practical workflow can be summarized as:

    Reconnaissance
          |
          v
    Identify artifact
          |
          v
    Inspect data
          |
          v
    Recognize encoding
          |
          v
    Select decoder
          |
          v
    Decode
          |
          v
    Analyze plaintext
          |
          v
    Validate result
          |
          v
    Protect sensitive information
          |
          v
    Document evidence

This workflow is transferable to Linux security analysis, SOC investigation,
incident response, malware triage, and digital forensics.

---

## Lessons Learned

This exercise reinforced several important concepts:

1. Encoded data should not automatically be confused with encrypted data.
2. Base64 is a representation mechanism, not a confidentiality mechanism.
3. Analysts should identify the data format before selecting an analysis tool.
4. Linux provides simple utilities for common data-transformation tasks.
5. Decoded information must be interpreted in context.
6. Sensitive decoded information should be handled securely.
7. Evidence should demonstrate methodology without exposing credentials.
8. Encoding may be encountered across logs, web traffic, malware, and
   configuration data.

---

## Training Outcome

Successfully completed the Bandit Level 10 → 11 objective.

The exercise established practical understanding of Base64 identification,
encoding versus encryption, command-line decoding, data transformation,
security analysis, evidence validation, and secure credential handling.

Status: Completed
