# Bandit Level 09 → 10

## Objective

Retrieve the credential required to authenticate to Bandit Level 10.

The challenge involves identifying human-readable information embedded within
a file containing binary and non-printable data.

The primary objective is to distinguish meaningful textual data from binary
content and identify the relevant credential without unnecessarily processing
the entire dataset manually.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit9 |
| Target Account | bandit10 |
| Authorization | Authorized cybersecurity training lab |
| Training Type | Defensive security / CTF practice |

---

## Scenario

The Bandit Level 09 → 10 exercise presents a file containing a mixture of
binary data and human-readable strings.

The required credential is embedded within the file rather than being presented
as ordinary readable text.

This requires a different investigation approach from previous levels.

Instead of assuming that the entire file can be interpreted as normal text, the
investigation focuses on extracting printable character sequences and reducing
the resulting data to identify the relevant record.

This is representative of a common digital-investigation technique where useful
information may be embedded inside files that are not intended to be read as
ordinary text.

---

## Initial Access

The Bandit Level 09 environment was accessed through SSH.

Example connection:

```bash
ssh -p 2220 bandit9@bandit.labs.overthewire.org
```

Authentication was performed using the credential obtained from the previous
authorized training level.

Sensitive authentication information is intentionally excluded from this
repository.

---

## Initial Reconnaissance

After establishing the SSH session, the working directory was inspected.

Example command:

```bash
ls -la
```

The purpose of this step was to determine which files were available in the
Bandit Level 09 home directory.

The investigation then focused on identifying the challenge file and
determining how its contents should be interpreted.

---

## File Investigation

A normal text-processing approach is not always appropriate when a file
contains binary or non-printable information.

The first step was therefore to inspect the file characteristics.

Example command:

```bash
file <target-file>
```

The `file` utility attempts to identify the type and characteristics of a
file based on its contents.

This helps determine whether the artifact should be treated as ordinary text,
binary data, an archive, an executable, or another format.

---

## Printable String Extraction

The `strings` utility was used to extract sequences of printable characters
from the file.

Example:

```bash
strings <target-file>
```

The purpose of this command is to reduce a binary or mixed-content file into
human-readable character sequences.

This is useful when investigating:

- Binary files
- Executables
- Memory dumps
- Firmware
- Disk images
- Network captures
- Malformed or mixed-format files
- Suspicious artifacts

---

## Filtering the Output

The raw `strings` output can contain many unrelated values.

Therefore, command-line filtering can be used to reduce the investigation
dataset.

Examples include:

```bash
strings <target-file>
``` | grep '<pattern>'

or:

```bash
strings <target-file>
``` | less

The exact filtering strategy depends on the characteristics of the challenge
data.

The objective is to identify the relevant human-readable record without
assuming that every printable string is meaningful.

---

## Investigation Methodology

The investigation followed a structured process:

1. Identify the available artifact.
2. Determine the file type.
3. Recognize that the file contains non-text data.
4. Extract printable character sequences.
5. Reduce the resulting output.
6. Identify the candidate credential.
7. Validate the result by using it only within the authorized Bandit
   environment.
8. Record the methodology without publishing the credential.

This approach demonstrates evidence-driven command-line investigation rather
than blind trial and error.

---

## Observed Result

The investigation successfully identified a human-readable credential embedded
within the challenge file.

Credential:

    [REDACTED]

The credential was validated only against the authorized OverTheWire Bandit
training environment.

The actual credential is intentionally excluded from this public repository.

---

## Technical Explanation

Binary files can contain byte sequences that do not correspond to readable
characters.

When such a file is displayed directly using a conventional text utility,
the output may contain:

- Garbled characters
- Control characters
- Non-printable bytes
- Unreadable data
- Mixed binary and text content

The `strings` utility addresses this problem by scanning the file for
printable character sequences.

Conceptually, the workflow is:

    Binary / mixed file
          |
          v
    Printable-character extraction
          |
          v
    Human-readable strings
          |
          v
    Filtering / investigation
          |
          v
    Relevant artifact
          |
          v
    Credential validation

This makes `strings` a useful first-pass triage tool when investigating unknown
binary artifacts.

---

## Why `strings` Is Useful

The `strings` utility does not fully analyze the underlying file format.

Instead, it provides a quick way to identify readable character sequences
embedded within otherwise difficult-to-read data.

For security analysts, this can provide useful initial clues such as:

- Usernames
- URLs
- Domain names
- File paths
- Error messages
- Configuration values
- Embedded commands
- Identifiers
- Suspicious text
- Potential secrets

The output must still be validated because printable strings alone do not prove
that a value is malicious, sensitive, or relevant.

---

## Techniques and Commands

The investigation involved:

- Linux filesystem enumeration
- File metadata inspection
- Binary artifact analysis
- Printable-string extraction
- `strings` utility usage
- Output filtering
- Pattern-based searching
- Command-line pipeline construction
- Candidate credential identification
- Result validation
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training session.
2. Inspect the supplied challenge artifact.
3. Determine that the file contains binary or mixed-format data rather than
   ordinary plaintext.
4. Extract printable character sequences from the artifact.
5. Filter the extracted output for relevant candidate strings.
6. Validate the candidate result against the challenge requirements.
7. Confirm that the result represents the required next-stage training
   credential.
8. Avoid reproducing the credential in public documentation.
9. Record only the methodology and sanitized evidence.

Representative sanitized commands include:

```bash
strings <artifact>
```

```bash
strings <artifact>
``` | grep -E '<sanitized-pattern>'

The actual credential and unnecessary challenge-specific authentication
material are intentionally excluded from this public documentation.

The purpose of this section is to demonstrate binary artifact triage,
printable-string extraction, command-line filtering, result validation, and
secure handling of authentication material within an authorized training
environment.

---

## Security Concept

### Binary Artifact Triage

The central security concept demonstrated by this exercise is rapid triage of
binary or mixed-format artifacts.

Security investigations frequently involve files that cannot be interpreted
simply by opening them as text.

Analysts may therefore use lightweight command-line tools to extract useful
indicators before performing deeper analysis.

The exercise demonstrates the importance of selecting an investigation method
based on the characteristics of the evidence.

---

## Command-Line Concepts Demonstrated

### `file`

Identifies probable file type and characteristics.

Example:

```bash
file <target-file>
```

### `strings`

Extracts printable character sequences.

Example:

```bash
strings <target-file>
```

### `grep`

Filters output according to a pattern.

Example:

```bash
strings <target-file>
``` | grep '<pattern>'

### `less`

Allows large command output to be inspected interactively.

Example:

```bash
strings <target-file>
``` | less

### Pipes

The pipe operator connects the output of one command to the input of another.

Example:

```bash
strings <target-file>
``` | grep '<pattern>'

This creates a simple investigation pipeline.

---

## MITRE ATT&CK Relevance

The exercise primarily demonstrates artifact triage and printable-string
extraction rather than a direct adversary technique.

**T1083: File and Directory Discovery** is conceptually relevant to the
broader artifact-identification workflow, while the primary security value is
the development of host-based investigation and data-triage skills.

The mapping is therefore presented as defensive context.

## Skills Demonstrated

### Linux

- Command-line investigation
- File-type identification
- Binary artifact triage
- Text extraction
- Output filtering
- Pipeline construction
- Evidence validation

### Security Analysis

- Artifact inspection
- Data reduction
- Indicator identification
- Credential discovery
- Evidence-based investigation
- Secure handling of sensitive information

### Analytical Skills

- Hypothesis formation
- Tool selection
- Output interpretation
- Candidate validation
- Avoiding unnecessary assumptions

---

## Defensive / SOC Relevance

Although this exercise is performed in a CTF environment, the underlying
techniques are relevant to defensive security operations.

### Malware Triage

Analysts can use `strings` as an initial triage technique when examining
unknown executables or suspicious files.

Potential findings can include:

- URLs
- IP addresses
- Command-line arguments
- File paths
- Registry paths
- Error messages
- Embedded configuration values

These findings can provide initial indicators for deeper malware analysis.

### Incident Response

During an incident investigation, analysts may encounter suspicious artifacts
that cannot immediately be interpreted as normal text.

Quick extraction of printable strings can help establish initial context.

### Threat Hunting

Readable strings discovered in suspicious files can potentially become
indicators for further searches across endpoints, logs, or other collected
artifacts.

### Digital Forensics

Artifact triage is an important part of digital-forensic workflows.

Investigators often need to rapidly identify useful information before
performing more expensive or specialized analysis.

---

## Security Considerations

`strings` should be treated as an investigative aid rather than a complete
analysis tool.

Important limitations include:

- Printable strings may be irrelevant.
- Sensitive information may be encoded or encrypted.
- Malware may intentionally obfuscate strings.
- Binary structures may require specialized parsers.
- Extracted strings may not preserve their original context.
- A printable value does not automatically indicate malicious activity.

Therefore, extracted information should be correlated with additional evidence
before making security conclusions.

---

## Evidence

Evidence for this exercise should demonstrate the investigation process rather
than expose authentication material.

Recommended evidence includes:

- Directory listing showing the challenge artifact.
- File-type identification.
- `strings` execution.
- Filtered investigation output.
- Successful validation of the result within the authorized lab.

Suggested screenshot naming:

    evidence/screenshots/bandit-09-file-investigation.png

    evidence/screenshots/bandit-09-strings-analysis.png

    evidence/screenshots/bandit-09-filtered-result.png

Credentials and private authentication material must not appear in screenshots
uploaded to the public repository.

---

## Evidence Reference

Public repository evidence:

    evidence/screenshots/bandit-09-file-investigation.png
    evidence/screenshots/bandit-09-strings-analysis.png
    evidence/screenshots/bandit-09-filtered-result.png

If screenshots were not captured during the original session, the evidence
references should be added only after reproducing the relevant steps in the
authorized training environment.

Evidence should never be fabricated.

---

## Credential Handling

The credential obtained during this exercise is sensitive authentication
material.

It is intentionally represented as:

    [REDACTED]

The credential must not be committed to Git, GitHub, screenshots, README
files, notes, issue trackers, or other public locations.

The credential was used only to progress through the authorized OverTheWire
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

This activity was conducted against the OverTheWire Bandit training
environment, which is specifically provided for cybersecurity education.

The techniques documented here should only be applied to:

- Authorized laboratories
- CTF environments
- Systems owned by the tester
- Systems for which explicit authorization has been provided

The methodology should not be used to inspect files or extract credentials
from systems without authorization.

---

## Knowledge Notes

### Printable Data

Printable strings are sequences of characters that can be represented in a
human-readable form.

Binary files can contain such sequences even when the overall file is not a
normal text document.

### Data Reduction

Large command outputs should be progressively reduced using appropriate
filters.

This improves analyst efficiency and reduces the likelihood of overlooking
important information.

### Evidence Validation

Finding a potentially interesting string is only the beginning of an
investigation.

Analysts should validate whether the value is relevant and whether it
corresponds to the expected artifact or activity.

---

## Investigation Workflow

The practical workflow used in this exercise can be summarized as:

    Reconnaissance
          |
          v
    Identify artifact
          |
          v
    Determine file characteristics
          |
          v
    Extract printable data
          |
          v
    Filter and reduce output
          |
          v
    Identify candidate
          |
          v
    Validate within authorized lab
          |
          v
    Document methodology
          |
          v
    Protect sensitive evidence

This workflow is transferable to broader Linux investigation and incident
response activities.

---

## Lessons Learned

This exercise reinforced several important lessons:

1. Not every file should be treated as ordinary text.
2. File characteristics should be investigated before selecting analysis
   tools.
3. `strings` provides a useful first-pass technique for binary artifact triage.
4. Command pipelines can significantly reduce investigation time.
5. Extracted strings must be interpreted in context.
6. Potential credentials should be treated as sensitive information.
7. Evidence should demonstrate methodology without exposing secrets.
8. Lightweight command-line tools can provide valuable initial forensic clues.

---

## Training Outcome

Successfully completed the Bandit Level 09 → 10 objective.

The exercise established practical understanding of binary artifact triage,
printable-string extraction, command-line pipelines, output filtering,
evidence validation, and secure credential handling.

Status: Completed
