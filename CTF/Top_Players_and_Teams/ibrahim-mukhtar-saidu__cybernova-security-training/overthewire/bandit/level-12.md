# Bandit Level 12 → 13

## Objective

Retrieve the credential required to authenticate to Bandit Level 13.

The challenge involves recovering data that has been transformed into a
hexadecimal representation and then identifying and extracting multiple
layers of compressed or archived data.

The primary objective is to develop practical skills in file reconstruction,
file-type identification, archive analysis, iterative extraction, and
command-line investigation.

---

## Environment

| Item             | Details                                                 |
| ---------------- | ------------------------------------------------------- |
| Platform         | OverTheWire Bandit                                      |
| Source System    | Parrot OS                                               |
| Shell            | Bash                                                    |
| Protocol         | SSH                                                     |
| Starting Account | bandit12                                                |
| Target Account   | bandit13                                                |
| Authorization    | Authorized cybersecurity training lab                   |
| Primary Tools    | `xxd`, `file`, compression utilities, archive utilities |

---

## Scenario

The challenge provides a file containing data represented as hexadecimal
characters.

The data cannot be treated as a normal plaintext file. The investigation
requires reconstructing the original binary data and then repeatedly
identifying and extracting the resulting artifacts until the final plaintext
credential is recovered.

This exercise simulates a common digital-investigation workflow:

1. Inspect the supplied artifact.
2. Determine its representation.
3. Reconstruct the original data.
4. Identify the resulting file type.
5. Apply the appropriate extraction technique.
6. Repeat the process as necessary.
7. Validate the final result.
8. Document the methodology without exposing credentials.

---

## Initial Reconnaissance

After authenticating to the Bandit Level 12 environment, the working
directory was inspected.

Example:

```bash
ls -la
```

The supplied challenge file was identified.

The file was then examined to understand its contents and representation.

---

## Working Directory Preparation

Because the original challenge data undergoes multiple transformations,
a temporary working directory is appropriate.

Example:

```bash
mktemp -d
```

The challenge artifact can then be copied into the temporary directory for
analysis.

This reduces the risk of modifying the original challenge file and reflects
a useful forensic-analysis practice: preserve the original artifact and
perform analysis on a working copy.

---

## Data Representation Analysis

The supplied file initially contains hexadecimal text.

A hexadecimal representation is not necessarily the original file itself.
Instead, each pair of hexadecimal characters can represent one byte of the
underlying binary data.

The investigation therefore begins by converting the hexadecimal
representation back into binary form.

A common Linux utility for this task is:

```bash
xxd
```

For example, hexadecimal text can be reconstructed with an appropriate
`xxd` reverse-conversion operation.

The important concept is that the direction of transformation matters:

```text
Hexadecimal text
       |
       v
Reverse hexadecimal conversion
       |
       v
Binary artifact
```

---

## File-Type Identification

After reconstructing the binary data, the resulting artifact should not be
assumed to be a specific compression format.

Instead, its actual type should be identified.

The Linux `file` utility is useful for this purpose:

```bash
file <artifact>
```

The output provides information about the detected file format.

This is an important investigation technique because the correct extraction
tool depends on the actual artifact type.

For example, an artifact may turn out to be:

* gzip-compressed data
* bzip2-compressed data
* tar archive data
* another recognized binary format

The workflow therefore follows:

```text
Artifact
   |
   v
file
   |
   v
Identify format
   |
   v
Select appropriate extraction tool
```

---

## Iterative Extraction

One of the main challenges in this exercise is that the data contains
multiple layers of transformation.

After one extraction operation, the resulting artifact must be examined
again.

The process is therefore iterative:

```text
Encoded artifact
      |
      v
Reconstruct
      |
      v
Identify file type
      |
      v
Extract
      |
      v
Identify new artifact
      |
      v
Extract again
      |
      v
Repeat until plaintext is reached
```

This prevents incorrect assumptions about the structure of the data.

---

## Command-Line Investigation Methodology

The investigation follows a repeatable process.

### Step 1: Preserve the Original

Create a working copy rather than repeatedly modifying the original artifact.

### Step 2: Inspect the Representation

Determine whether the supplied data is plaintext, encoded data, compressed
data, or another representation.

### Step 3: Reverse the Hexadecimal Representation

Convert the hexadecimal text into its underlying binary representation.

### Step 4: Identify the Resulting File

Use:

```bash
file <artifact>
```

### Step 5: Select the Correct Tool

Use the file-type information to determine the appropriate extraction or
decompression utility.

### Step 6: Extract One Layer

Decompress or unpack the artifact.

### Step 7: Repeat Identification

Run `file` against the newly produced artifact.

### Step 8: Continue Until Plaintext

Repeat the identification and extraction process until the final plaintext
data is reached.

### Step 9: Validate

Confirm that the resulting plaintext has the expected characteristics of the
next-level credential.

---

## Why `file` Is Important

The `file` command performs file-type identification based on information
contained within the file.

This is especially useful when:

* File extensions are missing.
* File names are misleading.
* Data has been renamed.
* Binary artifacts have unknown formats.
* Investigators need to determine which analysis tool to use.

In a security investigation, blindly applying extraction commands can waste
time or potentially alter evidence.

A safer approach is:

```text
Observe → Identify → Select Tool → Extract → Re-identify
```

---

## Compression Versus Encoding

This exercise reinforces an important distinction between encoding and
compression.

### Encoding

Encoding changes the representation of data.

Examples include:

* Hexadecimal
* Base64
* URL encoding

Encoding generally does not provide confidentiality.

### Compression

Compression reduces the size of data or represents it using a more efficient
format.

Examples include:

* gzip
* bzip2
* xz

Compression also does not inherently provide confidentiality.

Therefore, neither encoding nor ordinary compression should be treated as a
security mechanism for protecting passwords or secrets.

---

## Technical Analysis

The challenge demonstrates a layered data-processing problem.

The important analytical principle is to avoid assuming that one operation
will solve the entire problem.

Instead, every resulting artifact becomes a new investigation target.

Conceptually:

```text
Hexadecimal representation
        ↓
Binary reconstruction
        ↓
Compressed/archive artifact
        ↓
Extraction
        ↓
Another compressed/archive artifact
        ↓
Extraction
        ↓
Additional layer
        ↓
Final plaintext
```

The exact sequence of formats must be determined dynamically through file
identification.

---

## Investigation Decision Process

The investigation can be represented as a decision loop:

```text
                 ┌───────────────┐
                 │ Inspect file  │
                 └───────┬───────┘
                         │
                         v
                ┌─────────────────┐
                │ Identify format │
                └────────┬────────┘
                         │
                         v
                ┌─────────────────┐
                │ Known encoding? │
                └────────┬────────┘
                         │
                         v
                ┌─────────────────┐
                │ Reverse/Decode  │
                └────────┬────────┘
                         │
                         v
                ┌─────────────────┐
                │ Known archive/  │
                │ compression?    │
                └────────┬────────┘
                         │
                         v
                ┌─────────────────┐
                │ Extract layer   │
                └────────┬────────┘
                         │
                         v
                    Re-identify
                         │
                         └───────→ Repeat
```

This approach is transferable to incident-response and malware-analysis
workflows where analysts encounter unfamiliar artifacts.

---

## Observed Result

The investigation successfully reconstructed the supplied hexadecimal data
and identified the resulting file formats.

Multiple layers of compressed or archived data were processed sequentially.

Each layer was identified before the appropriate extraction operation was
performed.

The final plaintext contained the credential required to authenticate to
Bandit Level 13.

Credential:

```text
[REDACTED]
```

The actual credential is intentionally excluded from this public repository.

---

## Evidence Validation

The recovered value was treated as sensitive authentication material.

Validation was performed within the authorized OverTheWire Bandit training
environment.

The credential was not included in:

* Public documentation
* Screenshots
* Git history
* README files
* Repository source files

This preserves the educational value of the exercise while avoiding
unnecessary disclosure of authentication information.

---

## Investigation Approach

The investigation treated the supplied artifact as a potentially transformed
data object rather than assuming that its current representation was the
original file format.

The workflow was:

1. Preserve the original artifact.
2. Inspect its representation.
3. Reverse the hexadecimal representation.
4. Identify the resulting file type.
5. Select the appropriate extraction utility.
6. Extract one compression or archive layer.
7. Re-identify the resulting artifact.
8. Repeat the process until plaintext was recovered.
9. Validate the final result.
10. Protect the recovered credential from public disclosure.

This approach demonstrates iterative artifact analysis and emphasizes
validation after every transformation.

## Techniques and Commands

The investigation involved:

- Linux filesystem enumeration
- Temporary working-directory creation
- Preservation of the original challenge artifact
- Hexadecimal representation analysis
- Reverse hexadecimal conversion
- Binary file reconstruction
- File-type identification with `file`
- Compression and archive identification
- Iterative decompression and extraction
- Artifact re-identification after each extraction
- Command-line investigation methodology
- Evidence validation
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training session.
2. Inspect the supplied challenge artifact.
3. Create a temporary working directory for analysis.
4. Preserve the original artifact and work on a copy.
5. Identify the initial hexadecimal representation.
6. Reverse the hexadecimal representation to reconstruct the binary artifact.
7. Use `file` to identify the resulting artifact type.
8. Select the appropriate decompression or archive utility.
9. Extract one layer at a time.
10. Re-run file-type identification after every extraction.
11. Continue the identify → extract → re-identify cycle until plaintext is
    reached.
12. Validate that the final plaintext corresponds to the expected next-stage
    training credential.
13. Keep the recovered credential outside public documentation.
14. Record only sanitized evidence of the investigation process.

Representative sanitized commands include:

```bash
ls -la
```

```bash
mktemp -d
```

```bash
cp <source-artifact> <working-copy>
```

```bash
xxd -r <hex-input> <binary-output>
```

```bash
file <artifact>
```

    <appropriate-decompression-or-archive-command> <artifact>

```bash
file <extracted-artifact>
```

The exact challenge credential and unnecessary challenge-specific output are
intentionally omitted from this public documentation.

The purpose of this section is to demonstrate layered artifact analysis,
hexadecimal reconstruction, file-type identification, iterative extraction,
Linux command-line investigation, and secure evidence handling within an
authorized cybersecurity training environment.

---

## Security Concepts

### Hexadecimal Representation

Hexadecimal is a base-16 representation commonly used to display binary data.

### Binary File Analysis

Binary artifacts may contain structured data that cannot be interpreted
correctly as ordinary text.

### File Identification

Identifying the true file format is essential before selecting an extraction
or analysis tool.

### Compression

Compression changes how data is represented and stored but does not provide
confidentiality.

### Layered Data

Security artifacts may contain multiple nested transformations, requiring
iterative analysis.

### Evidence Preservation

Working on copies rather than modifying the original artifact is a useful
principle in forensic investigation.

### Credential Protection

Recovered credentials should be treated as sensitive information even when
they originate from a training environment.

---

## MITRE ATT&CK Relevance

The exercise demonstrates iterative identification and extraction of layered
file representations.

The activity is conceptually relevant to host-based artifact analysis and
discovery, but it should not be interpreted as a direct reproduction of an
adversary procedure. The ATT&CK relationship is therefore presented as
defensive analytical context.

## Skills Demonstrated

* Linux command-line investigation
* Temporary working-directory management
* File reconstruction
* Hexadecimal analysis
* Binary artifact handling
* File-type identification
* Compression identification
* Archive extraction
* Iterative investigation
* Command-line pipeline design
* Evidence validation
* Secure credential handling
* Technical documentation

---

## Defensive / SOC Relevance

Although this exercise is performed in a CTF environment, the underlying
skills have practical relevance to security operations.

### Host-Based Investigation

SOC analysts may encounter unfamiliar files during endpoint investigations.

Understanding file representations helps analysts determine what an artifact
actually contains.

### Malware Triage

Malware samples and suspicious attachments may be compressed, encoded, or
nested inside archives.

Analysts frequently need to identify and unpack these layers before further
analysis.

### Incident Response

During incident response, analysts may need to reconstruct or extract data
from collected artifacts.

A disciplined:

```text
Identify → Extract → Re-identify
```

workflow helps reduce incorrect assumptions.

### Evidence Handling

Preserving original artifacts and using working copies is consistent with
sound investigation practices.

### Detection Engineering

Understanding how attackers package or transform data can help analysts
recognize suspicious encoded or compressed content during monitoring.

---

## Example SOC Investigation Scenario

A hypothetical endpoint investigation identifies a suspicious file named:

```text
update.dat
```

The extension does not provide reliable information about the content.

An analyst could begin with:

```bash
file update.dat
```

If the result indicates compressed or archived data, the analyst can select
the appropriate analysis utility.

After extraction, the new artifact should again be identified rather than
blindly trusted.

The same methodology used in this Bandit exercise therefore transfers to:

* Malware triage
* Suspicious attachment analysis
* Incident-response investigations
* Threat-hunting workflows
* Digital-forensics workflows

---

## Common Mistakes

### Assuming the Extension Is Correct

A file extension does not guarantee the actual file format.

### Treating Hexadecimal as Encryption

Hexadecimal is an encoding/representation mechanism, not encryption.

### Extracting Without Identification

Running arbitrary decompression tools without first identifying the artifact
can lead to confusion.

### Modifying the Original Artifact

Repeatedly transforming the original file makes investigation less
controlled.

### Stopping After One Layer

Nested compression requires continued analysis until the final useful data is
reached.

### Publishing Credentials

Even CTF credentials should not be unnecessarily published in a professional
portfolio repository.

---

## Improved Investigation Workflow

A stronger workflow for similar problems is:

```text
1. Preserve original artifact
2. Create working copy
3. Inspect metadata/content
4. Identify representation
5. Reverse encoding if required
6. Identify file type
7. Extract one layer
8. Re-identify output
9. Repeat
10. Validate final result
11. Sanitize evidence
12. Document methodology
```

This demonstrates investigation discipline rather than command memorization.

---

## Evidence / Screenshot Reference

Recommended evidence for this level:

```text
evidence/screenshots/bandit-12/
```

Suggested screenshots:

1. Initial artifact inspection.
2. Hexadecimal representation analysis.
3. Reverse-conversion step.
4. `file` output identifying an intermediate artifact.
5. One or more extraction stages.
6. Final artifact identification.
7. Sanitized final validation.

Screenshots must not contain the actual credential.

Recommended naming convention:

```text
bandit-12-01-initial-inspection.png
bandit-12-02-hex-analysis.png
bandit-12-03-file-identification.png
bandit-12-04-extraction-stage.png
bandit-12-05-final-validation.png
```

---

## Credential Handling

The credential obtained from this exercise is authentication material for the
OverTheWire training environment.

It is intentionally represented as:

```text
[REDACTED]
```

The actual credential must not be committed to Git or uploaded to GitHub.

Credentials should also be removed from screenshots before publication.

This documentation demonstrates the process used to obtain and validate the
credential without exposing the secret itself.

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

The techniques described here are intended for:

* Authorized cybersecurity laboratories
* CTF competitions
* Security education
* Defensive research
* Systems owned or explicitly authorized by the tester

The same techniques should not be applied to systems without appropriate
authorization.

---

## Lessons Learned

1. Data representation must be distinguished from data protection.
2. Hexadecimal data can be reconstructed into binary form.
3. File extensions should not be blindly trusted.
4. The `file` utility is valuable for identifying unknown artifacts.
5. Nested archives and compression require iterative analysis.
6. Each extracted artifact should be treated as a new investigation target.
7. Working copies help preserve the original evidence.
8. Compression and encoding do not provide confidentiality.
9. Credentials discovered during investigations must be handled carefully.
10. A repeatable investigation workflow is more valuable than memorizing a
    single command.

---

## Knowledge Notes

### Hexadecimal

Hexadecimal uses sixteen symbols:

```text
0 1 2 3 4 5 6 7 8 9 A B C D E F
```

Two hexadecimal characters commonly represent one byte.

### File Signatures

Many file formats contain recognizable identifying information near the
beginning of the file.

Utilities such as `file` use such characteristics, among other information,
to determine probable file types.

### Nested Compression

An artifact may contain another compressed artifact.

Therefore:

```text
Extract → Identify → Extract → Identify
```

is a useful general pattern for layered data.

### Forensic Principle

When possible:

```text
Original Evidence
       |
       v
Working Copy
       |
       v
Analysis
```

This reduces accidental modification of the original evidence.

---

## Portfolio Significance

This level demonstrates more than the ability to solve a CTF challenge.

It provides evidence of practical familiarity with:

* Linux investigation
* Binary-data handling
* File-format identification
* Compression analysis
* Structured troubleshooting
* Evidence preservation
* Credential hygiene
* Security documentation

These capabilities form part of the foundation required for junior SOC,
security analyst, incident-response, and security operations roles.

---

## Training Outcome

Successfully completed the Bandit Level 12 → 13 objective.

The exercise established practical understanding of hexadecimal
representation, binary reconstruction, file-type identification, nested
compression, iterative extraction, evidence validation, forensic-style
workflow, and secure credential handling.

Status: Completed
