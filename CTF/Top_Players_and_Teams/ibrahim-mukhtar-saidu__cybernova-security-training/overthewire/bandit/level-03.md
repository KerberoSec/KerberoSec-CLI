# Bandit Level 03 → 04

## Objective

Retrieve the credential required to authenticate to Bandit Level 04.

The credential is stored inside a hidden file within the `inhere`
directory.

The primary objective of this exercise is to identify hidden filesystem
objects and safely inspect their contents.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit3 |
| Target Account | bandit4 |
| Authorization | Authorized cybersecurity training lab |

---

## Scenario

After authenticating as `bandit3`, the home directory contains a directory
named `inhere`.

The relevant credential is not immediately visible through a normal directory
listing because it is stored in a hidden file.

The investigation therefore requires:

1. Inspecting the current directory.
2. Identifying the `inhere` directory.
3. Entering the directory.
4. Performing a hidden-file-aware directory listing.
5. Identifying the hidden file.
6. Reading the file contents.
7. Using the recovered credential only for the authorized next-level
   authentication.

This exercise demonstrates an important Linux investigation principle:
a normal directory listing does not necessarily reveal every filesystem
object.

---

## Initial Access

The training environment is accessed through SSH:

```bash
ssh -p 2220 bandit3@bandit.labs.overthewire.org
```

Authentication was performed using the credential obtained from the
previous Bandit level.

Initial Reconnaissance

After authentication, the first step is to inspect the home directory:

ls
Observed Result
inhere

The result indicates that the home directory contains a directory named
inhere.

Directory Enumeration

Enter the discovered directory:

cd inhere

Then perform a standard directory listing:

ls
Observed Result

The expected credential file is not displayed.

This indicates that the directory may contain hidden filesystem objects.

Hidden File Enumeration

Use the -a option with ls:

ls -la

The -a option instructs ls to display all directory entries, including
hidden files.

Observed Result

The directory contains a hidden file in addition to the standard . and
.. entries.

The relevant file is:

.hidden
File Inspection

The hidden file can be inspected using:

cat .hidden
Observed Result

The command returns the credential required for the next Bandit level.

The credential is intentionally not reproduced in this public documentation.

[REDACTED]
Command-by-Command Analysis
ls
ls

Lists visible files and directories in the current working directory.

It does not normally display hidden files whose names begin with ..

cd inhere
cd inhere

Changes the current working directory to the inhere directory.

This demonstrates filesystem navigation using relative paths.

ls -la
ls -la

Combines two useful options:

-l: displays detailed file information.
-a: displays all entries, including hidden files.

This is a common Linux investigation command because hidden files can contain
configuration data, application metadata, persistence mechanisms, or other
security-relevant information.

cat .hidden
cat .hidden

Reads the contents of the hidden file.

The explicit filename is important because .hidden is not normally shown
by a standard ls command.

Technical Explanation

Linux and Unix-like operating systems use a naming convention where filenames
beginning with a period (.) are treated as hidden by common directory-listing
utilities.

For example:

.hidden
.config
.ssh
.bashrc

These files are not inherently more secure simply because they are hidden.

The hidden-file convention is primarily a filesystem/user-interface
convention rather than an access-control mechanism.

A user with sufficient filesystem permissions can still discover and access
such files.

## Techniques and Commands

The investigation involved:

- Linux filesystem enumeration
- Directory and file inspection
- Hidden-file discovery
- Command-line filesystem analysis
- Targeted artifact identification
- File content inspection
- Search-result validation
- Candidate credential identification
- Evidence preservation
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training session.
2. Inspect the supplied directory and enumerate its contents.
3. Determine that the required artifact may not be visible through a
   basic directory listing.
4. Inspect the directory for hidden or otherwise non-obvious files.
5. Identify the relevant challenge artifact.
6. Inspect the identified artifact to determine whether it contains the
   expected training data.
7. Validate the result against the challenge requirements.
8. Confirm that the result represents the required next-stage training
   credential.
9. Avoid reproducing the credential in public documentation.
10. Record only the methodology and sanitized evidence.

## Security Concept
Hidden Files Are Not Access Control

A common security misconception is that hiding a file makes its contents
secure.

For example:

secret.txt

and:

.secret.txt

are both filesystem objects subject to normal Unix permissions.

The leading period only affects how common directory-listing tools display
the object.

Security should instead rely on:

Proper filesystem permissions
Ownership controls
Access control
Encryption
Authentication
Least privilege
Secure secret-management mechanisms
## Security Investigation Perspective

During a host-based investigation, analysts should not rely exclusively on
standard directory listings.

A basic investigation may include:

ls -la

and, when appropriate:

find . -maxdepth 2 -type f

These techniques can help identify files that may otherwise be overlooked.

Hidden files may include:

Configuration files
Application metadata
User shell configuration
SSH configuration
Persistence artifacts
Development files
Credentials accidentally stored on disk
Malicious files attempting to avoid casual discovery
## Defensive / SOC Relevance

Although this exercise is a controlled CTF challenge, the underlying concept
has practical defensive relevance.

Host Investigation

Security analysts investigating a Linux host should be able to enumerate
hidden files when searching for suspicious artifacts.

Credential Exposure

Credentials stored in plaintext files represent a potential security risk.

If credentials are discovered during an investigation, analysts should:

Avoid exposing them unnecessarily.
Preserve evidence according to organizational procedures.
Determine whether the credential is still valid.
Recommend credential rotation when appropriate.
Investigate how the credential was stored.
Assess whether other systems may use the same credential.
Threat Hunting

Hidden files can also be relevant during threat hunting.

An analyst may investigate:

~/.ssh/
~/.config/
~/.local/
~/.cache/

depending on the investigation scope and operating system.

MITRE ATT&CK Relevance

This specific challenge is primarily a Linux filesystem-learning exercise
rather than an exact simulation of an adversary technique.

However, the investigation concept can support broader defensive analysis
related to:

File and directory discovery
Credential exposure
Host artifact discovery
Persistence investigation

The important lesson is that filesystem visibility and filesystem access
control are separate concepts.

## MITRE ATT&CK Relevance

The hidden-file discovery activity is conceptually related to
**T1083: File and Directory Discovery**.

The exercise demonstrates how filesystem enumeration can reveal objects that
are not displayed by a basic directory listing. The mapping is provided as
defensive context rather than as a direct adversary emulation.

## Skills Demonstrated

This exercise demonstrated practical ability to:

Navigate Linux directories.
Enumerate directory contents.
Identify hidden files.
Use ls -la.
Interpret Linux filename conventions.
Read files using cat.
Distinguish visibility from access control.
Handle credentials safely.
Document a repeatable investigation process.
## Evidence

Recommended evidence for this level includes screenshots showing:

Evidence 1: Initial Directory
ls

Expected observation:

inhere

Suggested filename:

evidence/screenshots/bandit-03-initial-directory.png
Evidence 2: Hidden File Discovery
ls -la

Suggested filename:

evidence/screenshots/bandit-03-hidden-file.png
Evidence 3: File Inspection
cat .hidden

The screenshot should demonstrate that the file was successfully accessed,
but the credential should not be retained in the public repository.

Suggested filename:

evidence/screenshots/bandit-03-credential-retrieval-redacted.png
## Evidence Handling

Screenshots containing credentials should not be uploaded publicly in their
original form.

Before publishing evidence:

Crop unnecessary credential information.
Redact passwords.
Avoid exposing reusable authentication material.
Keep private evidence locally if necessary.
Never publish private SSH keys.

The goal of evidence collection is to demonstrate the investigation process,
not disclose secrets.

## Credential Handling

The credential obtained during this exercise is intentionally excluded from
this report.

Public documentation uses:

[REDACTED]

The actual credential should never be committed to Git.

If the credential appears in a screenshot, the screenshot should be redacted
before being added to the repository.

## Ethical Use

This exercise was performed exclusively within the authorized OverTheWire
Bandit training environment.

The techniques described here should only be used against systems for which
explicit authorization has been provided.

## Lessons Learned
1. Hidden does not mean protected

A file beginning with . is hidden from normal directory listings, but it
still exists in the filesystem.

2. Enumeration should be systematic

A good investigation should not stop after:

ls

When appropriate, additional enumeration such as:

ls -la

should be performed.

3. Visibility and permissions are different

A hidden file can still have normal Unix ownership and permission controls.

4. Credentials require careful handling

Even when a credential is discovered legitimately in a training environment,
it should not be unnecessarily exposed in public documentation.

5. Small Linux skills build larger security capabilities

Basic filesystem enumeration is foundational for:

SOC investigations
Incident response
Threat hunting
Linux security monitoring
Server administration
Digital forensics
## Knowledge Notes
Hidden Files

Linux commonly treats filenames beginning with . as hidden when using
standard directory-listing tools.

Example:

.bashrc
.profile
.ssh
.config
Useful Enumeration Commands
ls

Lists visible entries.

ls -a

Lists all entries, including hidden entries.

ls -la

Provides detailed information for all entries.

find . -maxdepth 2 -type f

Searches for regular files within a limited directory depth.

## Investigation Workflow

The investigation followed this process:

Authenticate
     ↓
Inspect home directory
     ↓
Identify "inhere"
     ↓
Enter directory
     ↓
Standard listing
     ↓
No visible credential
     ↓
Enumerate hidden files
     ↓
Identify ".hidden"
     ↓
Inspect file
     ↓
Credential recovered
     ↓
Credential protected/redacted

This workflow demonstrates a repeatable approach to Linux filesystem
investigation.

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

Successfully completed the Bandit Level 03 → 04 objective.

The exercise established practical understanding of Linux hidden files,
directory enumeration, filesystem visibility, and secure credential handling.

Status: Completed
