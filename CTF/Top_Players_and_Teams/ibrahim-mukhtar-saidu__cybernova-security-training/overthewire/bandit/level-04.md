# Bandit Level 04 → 05

## Objective

Retrieve the credential required to authenticate to Bandit Level 05.

The credential is stored in one of several files located inside the
`inhere` directory.

The challenge requires identifying which file contains human-readable
text rather than blindly reading every file.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit4 |
| Target Account | bandit5 |
| Authorization | Authorized cybersecurity training lab |

---

## Scenario

After authenticating as `bandit4`, the home directory contains an
`inhere` directory.

Inside this directory are multiple files.

The challenge is designed to require file-type identification rather than
assuming that every file is ordinary text.

The investigation therefore involves:

1. Inspecting the directory.
2. Enumerating the files.
3. Identifying their file types.
4. Locating the human-readable file.
5. Inspecting only the relevant file.
6. Protecting the recovered credential from public disclosure.

---

## Initial Access

The environment is accessed through SSH:

```bash
ssh -p 2220 bandit4@bandit.labs.overthewire.org
```

Authentication uses the credential obtained from the previous level.

Initial Reconnaissance

Inspect the home directory:

ls -la
Observed Result

The directory contains:

inhere

Change into the directory:

cd inhere
File Enumeration

List the files:

ls -la
Observed Result

Multiple files are present.

The filenames alone do not identify which file contains the required
credential.

This means additional analysis is required.

File-Type Identification

Use the file command:

file ./*

The file utility examines file contents and attempts to determine the
type of data stored in each file.

Expected Investigation Result

Most of the files are identified as non-text or binary data, while one file
is identified as containing human-readable ASCII text.

The exact credential is intentionally omitted from this public report.

[REDACTED]
File Inspection

After identifying the readable file, inspect it with:

cat ./<identified-file>

Replace <identified-file> with the filename reported by file.

Observed Result

The command returns the credential required for Bandit Level 05.

The credential is not reproduced in this repository.

[REDACTED]
Command-by-Command Analysis
ls -la
ls -la

Displays directory contents, including hidden entries, with detailed
metadata.

This provides an initial inventory of the available files.

file
file ./*

The file utility attempts to identify the type of each supplied file
based on its contents.

This is useful when a filename does not provide enough information about
what a file contains.

Examples of possible classifications include:

ASCII text
UTF-8 Unicode text
data
ELF executable
gzip compressed data
POSIX tar archive
cat
cat ./<identified-file>

Reads the contents of the selected file.

Using the explicitly identified filename avoids unnecessarily processing
all files.

Technical Explanation

A filename and extension are not reliable indicators of the actual contents
of a file.

For example, a file named:

document.txt

could contain binary data, while a file with no extension could contain
ordinary text.

The file command analyzes the contents of a file and uses recognized
patterns and metadata to determine its likely type.

This is particularly useful during Linux security investigations.

## Techniques and Commands

The investigation involved:

- Linux filesystem enumeration
- Directory and file inspection
- File metadata analysis
- File-type identification with `file`
- Binary-versus-text classification
- Output filtering
- Candidate artifact identification
- Command-line investigation
- Result validation
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training session.
2. Inspect the supplied directory and enumerate the available files.
3. Determine that the challenge requires identifying the file containing
   human-readable content.
4. Inspect candidate files using appropriate command-line utilities.
5. Use file-type information to distinguish text content from binary data.
6. Filter the results to isolate the relevant human-readable artifact.
7. Validate the identified content against the challenge requirements.
8. Confirm that the result represents the required next-stage training
   credential.
9. Avoid reproducing the credential in public documentation.
10. Record only the methodology and sanitized evidence.

## Security Concept
File-Type Identification

Security analysts frequently need to determine what type of artifact they
are examining.

Examples include:

Executables
Scripts
Archives
Compressed files
Configuration files
Logs
Documents
Binary data

File-type identification helps investigators choose the appropriate
analysis tool.

For example:

file suspicious_file

may reveal that an apparently harmless file is actually an executable.

## Security Investigation Perspective

During a host investigation, an analyst should avoid assuming that a file
is safe or harmless based solely on its name.

A basic investigation may include:

ls -la
file ./*

Additional analysis may then use tools appropriate for the identified type.

For example:

strings suspicious_file

may help identify readable strings within a binary artifact.

Other tools may be appropriate for archives, executables, network captures,
or compressed files.

## Defensive / SOC Relevance

This exercise has practical relevance to security operations.

Malware Triage

Security analysts may receive suspicious files whose extensions are
misleading.

The file command can provide a quick first indication of the actual
artifact type.

Incident Response

During incident response, investigators may need to identify unknown files
collected from compromised systems.

Threat Hunting

File-type analysis can help identify suspicious executables or scripts
hidden among ordinary files.

Evidence Analysis

Correctly identifying an artifact helps investigators select appropriate
tools for deeper analysis.

MITRE ATT&CK Relevance

The challenge itself is an educational filesystem exercise and should not
be presented as a direct reproduction of a single ATT&CK technique.

However, the underlying investigation skills support defensive analysis
related to:

File and Directory Discovery
Command and Scripting Interpreter
Malware/File Analysis
Host-based investigation

The important defensive lesson is that file names alone should not be
treated as trustworthy evidence of file type.

## MITRE ATT&CK Relevance

The file-type identification workflow is conceptually related to
**T1083: File and Directory Discovery**, while the inspection of filesystem
artifacts supports broader host-based investigation.

The ATT&CK reference is provided as defensive analytical context rather than
as a claim that the challenge directly simulates an adversary procedure.

## Skills Demonstrated

This exercise demonstrated:

Linux filesystem navigation
Directory enumeration
File-type identification
Use of the file utility
Selective file inspection
Command-line investigation
Evidence-oriented analysis
Secure credential handling
## Evidence

Recommended evidence for this level:

Evidence 1: File Enumeration

Command:

ls -la

Suggested filename:

evidence/screenshots/bandit-04-file-enumeration.png
Evidence 2: File-Type Analysis

Command:

file ./*

Suggested filename:

evidence/screenshots/bandit-04-file-type-analysis.png

This is the most important screenshot for demonstrating the technical
investigation.

Evidence 3: Credential Retrieval

Show the successful command execution if desired, but redact the actual
credential.

Suggested filename:

evidence/screenshots/bandit-04-credential-redacted.png
## Evidence Handling

Public screenshots must not expose reusable authentication material.

Before publishing evidence:

Redact credentials.
Do not publish private keys.
Do not publish authentication tokens.
Do not include unrelated personal information.
Keep original sensitive evidence locally if required.

The purpose of the screenshot is to demonstrate methodology and successful
execution.

## Credential Handling

The credential recovered during this exercise is intentionally excluded.

Public documentation uses:

[REDACTED]

This repository demonstrates the investigation process rather than exposing
authentication material.

## Ethical Use

All activity documented here was performed within the authorized
OverTheWire Bandit training environment.

The techniques should only be used against systems for which explicit
authorization has been provided.

## Lessons Learned
1. File extensions are not trustworthy

The actual contents of a file should be verified rather than inferred from
its name.

2. file is a useful first-stage investigation tool

It provides a quick way to classify unknown artifacts.

3. Investigation should be evidence-driven

Rather than opening every file blindly, identify relevant artifacts first
and then analyze them.

4. File analysis is foundational to security operations

The ability to identify and classify files is useful during:

Incident response
Malware triage
Threat hunting
Digital forensics
Linux administration
5. Credentials should not enter public repositories

Even credentials obtained from a training environment should be treated as
sensitive information during documentation.

## Knowledge Notes
The file Command

Basic usage:

file filename

Multiple files:

file ./*

The command examines file content and reports its likely type.

Why This Matters

A security analyst may encounter:

report.pdf
image.jpg
update.sh
backup

but filenames alone do not establish what the files actually contain.

File-type identification provides an additional layer of investigation.

## Investigation Workflow

The investigation followed this process:

Authenticate
     ↓
Inspect home directory
     ↓
Enter "inhere"
     ↓
Enumerate files
     ↓
Identify file types
     ↓
Locate readable text file
     ↓
Inspect selected artifact
     ↓
Credential recovered
     ↓
Credential redacted
     ↓
Document evidence

This represents a repeatable first-stage file investigation workflow.

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

## Training Outcome

Successfully completed the Bandit Level 04 → 05 objective.

The exercise established practical understanding of Linux file-type
identification, command-line investigation, selective artifact analysis,
and secure credential handling.

Status: Completed
