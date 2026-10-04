# Bandit Level 05 → 06

## Objective

Retrieve the credential required to authenticate to Bandit Level 06.

The credential is stored somewhere below the `inhere` directory.

The target file has specific filesystem characteristics, including:

- Human-readable content
- A specific file size
- Non-executable permissions

The objective is therefore to perform systematic filesystem discovery using
multiple search conditions rather than manually inspecting every file.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit5 |
| Target Account | bandit6 |
| Authorization | Authorized cybersecurity training lab |

---

## Scenario

After authentication as `bandit5`, the home directory contains an
`inhere` directory with a large number of files and directories.

The required credential is hidden among these filesystem objects.

The challenge requires identifying the correct file based on its properties.

The investigation therefore involves:

1. Inspecting the filesystem structure.
2. Determining the characteristics of the target file.
3. Searching recursively.
4. Filtering by file type.
5. Filtering by file size.
6. Filtering by permission characteristics.
7. Inspecting the resulting candidate.
8. Protecting the recovered credential.

---

## Investigation Approach

The investigation used a systematic filesystem-discovery approach. The target was identified by its known file characteristics rather than by filename alone.

The workflow was:

1. Inspect the `inhere` directory.
2. Enumerate regular files recursively.
3. Filter candidates by the known file size.
4. Exclude executable files.
5. Validate the remaining candidate with `file`.
6. Inspect the validated artifact.
7. Redact the recovered credential from public documentation.

## Initial Access

The environment is accessed through SSH:

```bash
ssh -p 2220 bandit5@bandit.labs.overthewire.org
```

Authentication uses the credential obtained from Bandit Level 04.

Initial Reconnaissance

Inspect the home directory:

ls -la
Observed Result

The directory contains:

inhere

Change into the directory:

cd inhere
Directory Enumeration

Inspect the available contents:

ls -la

The directory contains multiple nested directories.

Manually inspecting every file would be inefficient.

This creates an opportunity to use recursive filesystem search.

Understanding the Target Characteristics

The challenge identifies the target using properties rather than a known
filename.

The important characteristics are:

Human-readable
1033 bytes
Not executable

This means the investigation should search for a file matching the relevant
filesystem characteristics.

Recursive File Discovery

A basic recursive search can be performed with:

find . -type f
Explanation

The command consists of:

find .

Search from the current directory.

-type f

Return regular files only.

This produces a list of files beneath the current directory.

Because there may be many candidates, additional filtering is required.

File-Size Filtering

The target file has a specific size.

GNU find supports size-based filtering.

For a target of 1033 bytes:

find . -type f -size 1033c

The c suffix means bytes.

This reduces the number of candidate files significantly.

Permission Filtering

The target is also required to be non-executable.

File permissions can be investigated with:

find . -type f ! -executable

The ! operator negates the -executable condition.

This identifies files that are not executable by the current user.

Combining Search Conditions

A more targeted search can combine several conditions:

find . -type f -size 1033c ! -executable

This searches recursively for regular files that:

Have a size of 1033 bytes.
Are not executable.

This represents a more efficient investigation methodology than manually
opening every file.

File-Type Verification

Once a candidate is found, verify its type:

file ./path/to/candidate

The purpose of this step is to confirm that the candidate is a normal
human-readable text file rather than blindly trusting the search result.

Content Inspection

After confirming the candidate file, inspect it:

cat ./path/to/candidate
Observed Result

The command returns the credential required for Bandit Level 06.

The credential is intentionally not reproduced in this public repository.

[REDACTED]
## Techniques and Commands

ls -la
ls -la

Provides a detailed listing of the current directory, including hidden
entries.

This establishes the initial filesystem context.

find . -type f
find . -type f

Recursively searches from the current directory and returns regular files.

This is useful when the exact location of an artifact is unknown.

find . -type f -size 1033c
find . -type f -size 1033c

Searches for regular files with an exact size of 1033 bytes.

The c suffix specifies bytes.

find . -type f ! -executable
find . -type f ! -executable

Searches for regular files that are not executable by the current user.

Combined Search
find . -type f -size 1033c ! -executable

Combines multiple constraints to reduce the candidate set.

This demonstrates logical filtering during filesystem investigation.

file
file ./path/to/candidate

Determines the likely type of the identified artifact.

cat
cat ./path/to/candidate

Displays the contents of the selected file.

The resulting credential is treated as sensitive information.

Technical Explanation

The Linux find utility is one of the most useful command-line tools for
filesystem investigation.

It allows analysts and administrators to search using properties such as:

Filename
File type
Size
Permissions
Ownership
Modification time
Access time
Directory location

For example:

find /var/log -type f

can identify regular files beneath /var/log.

A more targeted investigation could use:

find /var/log -type f -size +1M

to identify files larger than one megabyte.

## Security Concept
Systematic Artifact Discovery

Security investigations often involve locating an unknown file among a large
number of filesystem objects.

An analyst should avoid relying only on filenames.

Instead, investigators can use multiple attributes to identify the correct
artifact.

For example:

Location
   +
File type
   +
Size
   +
Permissions
   +
Ownership
   =
Candidate artifact

This approach is useful during:

Incident response
Malware triage
Threat hunting
Digital forensics
Linux administration
Why Recursive Searching Matters

A suspicious artifact may not exist in the current directory.

It could be located several levels deeper:

inhere/
├── directory_a/
│   ├── file1
│   └── file2
├── directory_b/
│   └── directory_c/
│       └── file3
└── directory_d/
    └── file4

A recursive search allows the investigator to inspect the entire relevant
directory tree.

## Security Investigation Perspective

Suppose an analyst is investigating a compromised Linux server and has been
given the following information:

A suspicious file:
- exists somewhere under /tmp
- is a regular file
- is approximately 20 KB
- is not executable

Instead of manually browsing directories, the analyst could construct a
targeted search.

For example:

find /tmp -type f -size 20k ! -executable

The results can then be examined individually.

This demonstrates the same investigation principle practiced in the Bandit
challenge.

## Defensive / SOC Relevance

This level has strong relevance to defensive security operations.

Incident Response

Investigators often need to locate artifacts on a compromised host.

Threat Hunting

Threat hunters can search for files matching suspicious characteristics.

Malware Triage

File size, type, permissions, and location can provide useful initial
triage information.

Linux Security Monitoring

Unexpected files with unusual permissions or locations may warrant further
investigation.

## Evidence Collection

Search conditions can make artifact collection more systematic and
repeatable.

## MITRE ATT&CK Relevance

This exercise is primarily a controlled filesystem investigation challenge.

It provides practical foundations for defensive analysis associated with
MITRE ATT&CK concepts such as:

File and Directory Discovery
Command and Scripting Interpreter
Data from Local System

The challenge should not be represented as a direct reproduction of an
adversary technique. Instead, it demonstrates analyst skills useful for
investigating those behaviors.

## Skills Demonstrated

This exercise demonstrated:

Recursive filesystem enumeration
Linux find usage
File-type filtering
File-size filtering
Permission-based filtering
Logical search conditions
Candidate validation
File inspection
Command-line investigation
Evidence-oriented analysis
Secure credential handling
## Evidence

Recommended evidence for this level includes:

Evidence 1: Directory Reconnaissance

Command:

ls -la

Suggested filename:

evidence/screenshots/bandit-05-directory-enumeration.png
Evidence 2: Recursive Search

Command:

find . -type f

Suggested filename:

evidence/screenshots/bandit-05-recursive-file-search.png
Evidence 3: Targeted Search

Command:

find . -type f -size 1033c ! -executable

Suggested filename:

evidence/screenshots/bandit-05-targeted-file-search.png

This is the most important evidence for demonstrating the technical
investigation.

Evidence 4: File-Type Validation

Command:

file ./path/to/candidate

Suggested filename:

evidence/screenshots/bandit-05-file-validation.png
Evidence 5: Credential Retrieval

The final command may be captured for proof of successful completion.

However, the credential must be redacted before public publication.

Suggested filename:

evidence/screenshots/bandit-05-credential-redacted.png
## Evidence Handling

Evidence should demonstrate the investigation process without exposing
authentication material.

Before publishing screenshots:

Redact passwords.
Redact private keys.
Remove reusable authentication tokens.
Avoid exposing unrelated sensitive information.
Preserve original evidence locally if necessary.

The objective is to prove technical competency rather than publish secrets.

## Credential Handling

The credential obtained from this level is intentionally excluded from the
repository.

Public documentation uses:

[REDACTED]

No valid Bandit credentials should be committed to GitHub.

## Ethical Use

All activity documented in this report was performed within the authorized
OverTheWire Bandit training environment.

The techniques should only be applied to systems for which explicit
authorization has been provided.

## Lessons Learned
1. Search by characteristics, not only names

An unknown artifact can often be identified using properties such as size,
type, permissions, and location.

2. find is an important investigation tool

It provides powerful filesystem enumeration capabilities directly from the
Linux command line.

3. Multiple conditions improve investigation efficiency

Combining filters can dramatically reduce the number of candidate files.

4. Validate before trusting

After identifying a candidate, verify its type before treating it as the
expected artifact.

5. Systematic investigation is transferable

The same approach can be used during real Linux host investigations.

## Knowledge Notes
Common find Conditions

Regular files:

find . -type f

Directories:

find . -type d

Exact size in bytes:

find . -type f -size 1033c

Files larger than a size:

find . -type f -size +1M

Files smaller than a size:

find . -type f -size -1M

Files not executable:

find . -type f ! -executable
## Investigation Workflow

The investigation followed this process:

Authenticate
     ↓
Inspect filesystem
     ↓
Identify search scope
     ↓
Enumerate regular files
     ↓
Apply file-size filter
     ↓
Apply permission filter
     ↓
Validate candidate type
     ↓
Inspect candidate contents
     ↓
Credential recovered
     ↓
Credential redacted
     ↓
Document evidence

This demonstrates a repeatable approach to filesystem artifact discovery.

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

Successfully completed the Bandit Level 05 → 06 objective.

The exercise established practical understanding of recursive Linux
filesystem searching, multi-condition filtering, file-property analysis,
candidate validation, and secure credential handling.

Status: Completed
