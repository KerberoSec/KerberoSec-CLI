# Bandit Level 11 → 12

## Objective

Retrieve the credential required to authenticate to Bandit Level 12.

The challenge contains data that has been transformed using ROT13. The
objective is to identify the transformation, reverse it, and recover the
original readable information.

This exercise develops practical skills in character transformation,
command-line text processing, pattern recognition, and secure handling of
recovered authentication material.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit11 |
| Target Account | bandit12 |
| Authorization | Authorized cybersecurity training lab |
| Training Type | Cybersecurity / CTF practice |

---

## Scenario

After authenticating to the Bandit Level 11 environment, the challenge
provides a text value whose characters have been transformed.

The transformation is ROT13.

The objective is to reverse the transformation and recover the original
text containing the credential required for the next level.

The challenge demonstrates that apparently unusual text does not necessarily
represent encryption or hashing. It may instead be the result of a simple
reversible character transformation.

---

## Initial Access

The environment was accessed through the authorized OverTheWire Bandit
training infrastructure.

Example connection:

```bash
ssh -p 2220 bandit11@bandit.labs.overthewire.org
```

Authentication was performed using the credential obtained from the previous
Bandit level.

Actual authentication material is intentionally excluded from this
repository.

---

## Initial Reconnaissance

The working directory was inspected after authentication.

Example:

```bash
ls -la
```

The challenge artifact was then identified and its contents were inspected.

Example:

```bash
cat <target-file>
```

The resulting text did not immediately appear to be normal plaintext.

This required additional analysis before attempting to retrieve the next
credential.

---

## Pattern Recognition

The observed text contained alphabetic characters that appeared consistently
transformed.

A useful analytical question was:

    "Does the text follow a known character-substitution pattern?"

ROT13 is a common transformation in which each alphabetic character is
replaced with the character located 13 positions away in the alphabet.

For example:

    A → N
    B → O
    C → P

and:

    N → A
    O → B
    P → C

Because the alphabet contains 26 letters, applying ROT13 twice returns the
original text.

---

## Understanding ROT13

ROT13 means:

    Rotate by 13 positions

The transformation can be represented conceptually as:

    Original text
          |
          v
       ROT13
          |
          v
    Transformed text

Applying ROT13 again:

    Transformed text
          |
          v
       ROT13
          |
          v
    Original text

This makes ROT13 a reversible character substitution technique.

---

## ROT13 Is Not Encryption

An important security lesson from this challenge is that ROT13 should not be
considered a cryptographic protection mechanism.

ROT13:

- Requires no secret key.
- Is deterministic.
- Is easily reversible.
- Provides no meaningful confidentiality.
- Is not suitable for protecting credentials or sensitive information.

Therefore:

    ROT13 ≠ Encryption

A credential protected only by ROT13 should be considered exposed if an
attacker obtains the transformed value.

---

## Command-Line Analysis

Linux provides several utilities that can perform character translation.

One appropriate approach is the `tr` command.

Conceptually:

```bash
tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

This maps each alphabetic character to its corresponding ROT13 character.

The transformation works for both uppercase and lowercase letters.

---

## Example Transformation

A simplified example:

    hello

After ROT13:

    uryyb

Applying the same transformation again:

    uryyb → hello

This illustrates the reversible nature of ROT13.

The example is unrelated to the actual Bandit credential.

---

## Investigation Command

The challenge data can be passed through the character-translation operation.

Example:

```bash
cat <target-file> | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

A direct input-redirection approach may also be used depending on the
challenge file structure.

The important analytical step is not simply executing the command, but
understanding why the character mapping reverses the transformation.

---

## Command Explanation

### `cat`

Reads the contents of the challenge file.

### `|`

The pipe operator sends the output of one command to another command.

### `tr`

Translates or deletes characters.

### `'A-Za-z'`

Defines the alphabetic characters that should be translated.

### `'N-ZA-Mn-za-m'`

Defines the corresponding ROT13 character mapping.

The result is the original readable text.

---

## Investigation Methodology

The investigation followed a structured process:

1. Establish authorized SSH access.
2. Enumerate the working directory.
3. Identify the challenge artifact.
4. Inspect the supplied text.
5. Recognize the unusual character transformation.
6. Form a hypothesis that the data uses ROT13.
7. Select an appropriate character-translation tool.
8. Apply the reverse transformation.
9. Inspect and validate the resulting plaintext.
10. Use the recovered credential only within the authorized lab.
11. Document the methodology without publishing sensitive authentication
   material.

---

## Observed Result

The ROT13 transformation was successfully reversed.

The resulting plaintext contained the credential required to authenticate to
the next Bandit level.

Credential:

    [REDACTED]

The actual credential is intentionally excluded from this public repository.

The recovered credential was used only within the authorized OverTheWire
Bandit training environment.

---

## Technical Analysis

ROT13 is a monoalphabetic substitution transformation.

Each letter is replaced by another letter at a fixed offset.

For lowercase characters:

    a → n
    b → o
    c → p
    ...
    m → z
    n → a
    o → b
    ...
    z → m

The same concept applies to uppercase characters.

Because the rotation is exactly half of the 26-character alphabet, ROT13 is
self-inverse:

    ROT13(ROT13(x)) = x

This property makes it especially easy to reverse.

---

## Techniques and Commands

The investigation involved:

- Linux filesystem enumeration
- Command-line text analysis
- Pattern recognition
- Character-substitution analysis
- ROT13 identification
- ROT13 decoding
- Standard input/output processing
- Transformation validation
- Plaintext verification
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training session.
2. Inspect the supplied challenge artifact.
3. Identify that the apparent text does not represent ordinary plaintext.
4. Analyze the transformation pattern affecting the characters.
5. Recognize the transformation as ROT13.
6. Apply a controlled ROT13 decoding operation.
7. Inspect the resulting plaintext for expected characteristics.
8. Validate that the decoded value represents the required next-stage
   training credential.
9. Avoid reproducing the credential in public documentation.
10. Record only the methodology and sanitized evidence.

Representative sanitized commands include:

```bash
cat <challenge-file>
```

```bash
tr 'A-Za-z' 'N-ZA-Mn-za-m' < <challenge-file>
```

The actual credential is intentionally excluded from this documentation.

The purpose of this section is to demonstrate character-substitution
analysis, command-line text transformation, encoding recognition, validation,
and secure handling of authentication material within an authorized
cybersecurity training environment.

---

## Security Implications

ROT13 should never be used to protect:

- Passwords
- API keys
- Authentication tokens
- Private information
- Cryptographic keys
- Confidential configuration
- Sensitive logs

If sensitive information is found in ROT13 form, an analyst should treat it
as recoverable plaintext rather than as securely protected data.

---

## SOC / Defensive Relevance

### Log Analysis

Security analysts may encounter transformed text in logs or application
artifacts.

Recognizing common transformations can prevent analysts from incorrectly
classifying data.

### Malware Analysis

Malware may use simple character transformations to make strings less obvious
during casual inspection.

ROT13-like transformations can be quickly reversed during static analysis.

### Incident Response

During incident investigations, analysts may encounter encoded or transformed
strings in scripts, configuration files, and collected artifacts.

Understanding simple reversible transformations helps analysts recover useful
information quickly.

### Detection Engineering

A security monitoring system may encounter suspicious command lines or script
content containing common transformation techniques.

The presence of ROT13 alone does not prove malicious activity. Analysts should
correlate it with process execution, user activity, network connections, and
other indicators.

---

## Analytical Considerations

A security analyst should avoid assuming that every transformed string is
malicious.

The correct questions include:

- What transformation was used?
- Why was the transformation used?
- Where did the data originate?
- What does the decoded content represent?
- Is the resulting content sensitive?
- Does the decoded information correlate with other evidence?
- Is the transformation being used for obfuscation?

Context remains important.

---

## MITRE ATT&CK Relevance

The exercise focuses on recognizing and reversing ROT13 character
substitution.

This is not a direct reproduction of a specific ATT&CK procedure. It provides
useful defensive context for recognizing simple obfuscation and transformed
content during security investigations.

## Skills Demonstrated

### Linux

- SSH authentication
- Directory enumeration
- File inspection
- Text processing
- Command pipelines
- Character translation

### Security Analysis

- Pattern recognition
- Transformation identification
- Data recovery
- Credential discovery
- Evidence validation
- Secure handling of recovered information

### Analytical Skills

- Hypothesis formation
- Tool selection
- Controlled testing
- Result interpretation
- Security-context analysis

---

## Tools Used

### SSH

Used to access the authorized Bandit environment.

### `ls`

Used for directory reconnaissance.

### `cat`

Used to inspect the challenge artifact.

### `tr`

Used to reverse the ROT13 character transformation.

### Bash

Used to execute commands and construct the investigation pipeline.

---

## Evidence

Evidence should demonstrate the analysis without exposing the recovered
credential.

Recommended evidence includes:

- SSH access to Bandit Level 11.
- Directory enumeration.
- Inspection of the transformed data.
- ROT13 analysis.
- Character-translation command.
- Sanitized decoded output.
- Successful progression to the next authorized level.

Suggested screenshot names:

    evidence/screenshots/bandit-11-reconnaissance.png

    evidence/screenshots/bandit-11-rot13-analysis.png

    evidence/screenshots/bandit-11-decoding.png

---

## Evidence Reference

Recommended repository references:

    evidence/screenshots/bandit-11-reconnaissance.png
    evidence/screenshots/bandit-11-rot13-analysis.png
    evidence/screenshots/bandit-11-decoding.png

If these screenshots were not captured during the original session, they
should only be added after reproducing the relevant steps.

Evidence must represent work that was actually performed.

Screenshots containing credentials must be sanitized before being added to the
public repository.

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

The credential was used only to progress through the authorized OverTheWire
Bandit environment.

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

This activity was performed within an authorized cybersecurity training
environment.

The techniques documented in this report should only be applied to systems
for which explicit authorization has been provided.

Appropriate environments include:

- Cybersecurity laboratories
- CTF competitions
- Personal systems
- Authorized security assessments
- Defensive research environments

---

## Knowledge Notes

### Character Substitution

Character substitution replaces one character with another according to a
defined mapping.

ROT13 is a particularly simple example.

### Reversible Transformation

A reversible transformation allows the original data to be recovered without
requiring a secret cryptographic key.

### Obfuscation

Simple transformations may sometimes be used as lightweight obfuscation.

Obfuscation should not be confused with strong security protection.

### Self-Inverse Transformation

ROT13 is self-inverse because applying the same transformation twice returns
the original text.

    ROT13(ROT13(data)) = data

---

## Investigation Workflow

The practical workflow can be summarized as:

    Reconnaissance
          |
          v
    Identify artifact
          |
          v
    Inspect transformed data
          |
          v
    Recognize ROT13 pattern
          |
          v
    Form hypothesis
          |
          v
    Apply character translation
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

1. Unusual text may be transformed rather than encrypted.
2. ROT13 is a reversible character substitution technique.
3. ROT13 provides no meaningful confidentiality.
4. Linux `tr` can perform useful character transformations.
5. Pipelines allow multiple command-line processing stages to be combined.
6. Analysts should validate assumptions rather than rely solely on visual
   inspection.
7. Recovered credentials must be treated as sensitive information.
8. Security analysts should distinguish obfuscation from encryption.
9. Simple transformations can appear in malware, scripts, logs, and
   configuration artifacts.
10. Evidence should demonstrate methodology without exposing credentials.

---

## Training Outcome

Successfully completed the Bandit Level 11 → 12 objective.

The exercise established practical understanding of ROT13, character
substitution, reversible transformations, Linux text processing, Bash
pipelines, security analysis, evidence validation, and secure credential
handling.

Status: Completed
