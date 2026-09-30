# Bandit Level 06 → 07

## Objective

Retrieve the credential required to authenticate to Bandit Level 07 by
locating a file somewhere on the system that satisfies a specific set of
filesystem properties.

The exercise extends the previous level's file-investigation methodology by
requiring system-wide searching rather than limiting the investigation to a
single directory.

The primary goal is to identify the correct artifact through measurable
filesystem attributes while avoiding unnecessary access to unrelated files.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit6 |
| Target Account | bandit7 |
| Authorization | Authorized cybersecurity training lab |
| Investigation Type | Filesystem artifact discovery |

---

## Scenario

The challenge requires locating a file stored somewhere on the Bandit
system.

Unlike earlier levels where the relevant file was located directly in the
current user's working directory, this exercise requires broader filesystem
enumeration.

The target artifact is identified through a combination of properties such as:

- File ownership
- Group ownership
- File size
- File location

This creates a practical filesystem-investigation scenario where the analyst
must translate descriptive requirements into command-line search criteria.

---

## Investigation Approach

The investigation translated the challenge requirements into specific filesystem search predicates.

The workflow was:

1. Establish the current filesystem context.
2. Identify the required owner, group, file type, and size.
3. Perform a system-wide recursive search.
4. Apply ownership and group filters.
5. Apply the file-size filter.
6. Handle expected permission-denied messages.
7. Validate the candidate with `ls -l` and `file`.
8. Inspect the validated artifact.
9. Redact the recovered credential from public documentation.

This approach demonstrates progressive filtering of a large filesystem search space into a small, verifiable candidate set.

## Investigation Objective

The investigation can be represented as:

```text
Starting Account
      |
      v
Understand File Requirements
      |
      v
Search Filesystem
      |
      v
Filter by Ownership
      |
      v
Filter by Group
      |
      v
Filter by File Size
      |
      v
Validate Candidate
      |
      v
Retrieve Credential
      |
      v
Authenticate to Next Level
```
Initial Reconnaissance

After authenticating to the Bandit Level 06 environment, the first step is to
inspect the current directory and understand the available files.

Example:

pwd
ls -la

The purpose of this step is not simply to look for the answer, but to
establish the initial filesystem context before beginning a broader
investigation.

Understanding the Search Requirements

The challenge provides several properties that distinguish the target file
from unrelated files.

Instead of manually inspecting the entire filesystem, the requirements can
be translated into predicates for the Linux find utility.

Conceptually:

Target file
    |
    +-- Specific owner
    |
    +-- Specific group
    |
    +-- Specific file size
    |
    +-- Regular file

This approach is more reliable than opening arbitrary files and manually
checking their contents.

Filesystem Enumeration

A system-wide search can be performed using:

find / -type f

However, this produces a large amount of output and is not an efficient
investigation method by itself.

A more effective approach is to combine the challenge requirements with
find predicates.

For example:

find / -type f -user bandit7 -group bandit6 -size 33c

The exact search criteria should be based on the challenge requirements
provided by the training environment.

## Techniques and Commands

The primary command-line techniques demonstrated were:

```bash
pwd
ls -la
find / -type f
find / -type f -user bandit7 -group bandit6 -size 33c
find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null
ls -l <candidate>
file <candidate>
cat <candidate>
```

These commands demonstrate recursive filesystem discovery, ownership and group filtering, exact byte-size matching, permission-error handling, candidate validation, and controlled artifact inspection.

Command Explanation
find
find /

Starts a recursive filesystem search from the root directory.

This allows the investigation to search locations outside the user's home
directory.

-type f
-type f

Restricts the search to regular files.

This removes directories, symbolic links, devices, sockets, and other
filesystem object types from the candidate set.

-user
-user bandit7

Filters results based on file ownership.

This is useful when a challenge specifies that the target artifact belongs to
a particular account.

-group
-group bandit6

Filters files according to their group ownership.

Combining owner and group conditions significantly reduces the search space.

-size
-size 33c

Filters files according to their size.

The c suffix specifies bytes.

Using file size as a search predicate provides another independent property
for validating the candidate.

Permission and Error Handling

A system-wide search may produce permission-denied messages because the
current user does not have access to every directory.

For example:

find: '/some/protected/path': Permission denied

This is expected behavior when performing filesystem enumeration without
elevated privileges.

For cleaner investigation output, error messages can be redirected:

find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null

The redirection:

2>/dev/null

sends standard error to /dev/null.

This allows the analyst to focus on valid search results.

It is important to understand that suppressing errors does not grant
additional permissions. It only changes how the command's output is
displayed.

Candidate Validation

After the search identifies a candidate file, it should be validated rather
than immediately trusted.

Useful commands include:

ls -l <candidate>

and:

file <candidate>

The ls -l command can confirm:

Owner
Group
Permissions
File size

The file command helps identify the type of the artifact.

This demonstrates an important investigation principle:

Search criteria identify candidates; validation confirms the candidate.

Credential Retrieval

After validating the correct artifact, its contents can be examined:

cat <candidate>

The command output contains the credential required for the next Bandit
level.

Public Repository Handling

The actual credential is intentionally not reproduced in this document.

For public documentation, the result should be represented as:

[REDACTED]

This prevents authentication material from being unnecessarily published.

Observed Result

The investigation successfully identified the target artifact by combining
multiple filesystem attributes.

The candidate satisfied the required ownership, group, and size conditions.

The contents of the validated file provided the credential necessary to
continue to Bandit Level 07.

Credential:

[REDACTED]
Technical Analysis

This exercise demonstrates the value of structured filesystem searches.

A naive approach would involve:

Searching every directory manually.
Opening many unrelated files.
Checking ownership manually.
Checking file sizes manually.
Attempting to identify the correct artifact from its contents.

This is inefficient.

The find utility allows the investigation to convert natural-language
requirements into machine-readable predicates.

For example:

Owner requirement
        ↓
-user

Group requirement
        ↓
-group

File type requirement
        ↓
-type f

Size requirement
        ↓
-size

The resulting search is repeatable, auditable, and significantly more
efficient.

## Security Concept
Filesystem Enumeration

Filesystem enumeration is the process of identifying files, directories,
permissions, ownership, and other filesystem properties.

Security analysts use filesystem enumeration during:

Host investigations
Malware analysis
Incident response
Threat hunting
Configuration audits
Privilege-escalation investigations

Understanding how files are organized and protected is fundamental to Linux
security.

Security Concept: File Ownership

Linux associates files with:

User Owner
Group Owner
Permissions

A simplified permission representation is:

-rw-r-----
 ^^^ ^^^ ^^^
  |   |   |
  |   |   +-- Others
  |   +------ Group
  +---------- Owner

Ownership and permissions determine which users and groups can interact with
an artifact.

Incorrect ownership or permissions can expose sensitive information.

Security Concept: Least Privilege

The exercise also demonstrates why users should not automatically have access
to every file on a system.

A properly configured Linux system should restrict access to sensitive
artifacts according to legitimate requirements.

The investigation encountered files that could not necessarily be accessed
by the current account.

This reinforces the principle of least privilege:

Users and processes should receive only the permissions necessary to
perform their legitimate tasks.

Security Concept: Search Optimization

A system-wide search can generate a significant amount of information.

Adding multiple predicates reduces unnecessary output.

Conceptually:

Entire Filesystem
       |
       v
Regular Files
       |
       v
Correct Owner
       |
       v
Correct Group
       |
       v
Correct Size
       |
       v
Validated Candidate

This is similar to filtering techniques used during security investigations
where analysts progressively reduce a large dataset to a small number of
relevant artifacts.

Attack-Surface Implications

From an offensive-security perspective, filesystem enumeration can reveal:

Sensitive configuration files
Credentials
Backup files
Application data
Misconfigured permissions
Executable files
Privileged artifacts

From a defensive perspective, unexpected access to sensitive files may be an
indicator of suspicious activity.

For example, an attacker who has obtained limited shell access may attempt to
search the filesystem for credentials or privileged files.

## Defensive / SOC Relevance

Although this is a CTF exercise, the underlying methodology has direct SOC
relevance.

Host Investigation

A SOC analyst investigating a compromised Linux host may need to identify
files matching specific characteristics.

For example:

Recently modified files
Unexpected executable files
World-writable files
Files owned by privileged accounts
Unusual configuration files
Suspicious files in temporary directories

The same command-line investigation principles apply.

Threat Hunting

Threat hunters may search for artifacts based on multiple conditions.

Examples include:

Owner
Group
Permissions
File type
Location
Modification time
File size

This exercise develops the habit of converting an investigation question into
specific technical search criteria.

Incident Response

During incident response, filesystem enumeration can help investigators
determine:

What files exist?
Who owns them?
What permissions are assigned?
Which files are unusual?
Are sensitive files exposed?
Are suspicious artifacts present?

These questions are common during Linux host investigations.

## MITRE ATT&CK Relevance

This exercise is a controlled filesystem-investigation challenge rather than a direct reproduction of adversary behavior.

The strongest MITRE ATT&CK reference is:

- **T1083: File and Directory Discovery**: relevant to the filesystem-enumeration concept demonstrated by the investigation.

From a defensive perspective, understanding filesystem discovery helps analysts recognize and investigate similar activity on Linux hosts.

This mapping is therefore a defensive analytical reference, not a claim that the Bandit challenge directly simulates an ATT&CK procedure.

## Skills Demonstrated
Linux
Filesystem navigation
Recursive filesystem searching
File ownership analysis
Group ownership analysis
File size analysis
File-type filtering
Permission-aware investigation
Standard error handling
Security
Artifact discovery
Evidence filtering
Candidate validation
Least-privilege awareness
Credential handling
Host-based investigation
Command-Line Analysis
find
ls
file
cat
Bash redirection
## Evidence Collection

Recommended evidence for this level includes screenshots showing the
investigation process without exposing credentials.

Suggested evidence:

evidence/screenshots/
└── bandit-06-filesystem-search.png

The screenshot should demonstrate:

The authenticated Bandit environment.
The filesystem search command.
The identified candidate.
Candidate validation.

Do not capture or publish the actual credential.

## Evidence Reference
Evidence	Purpose
bandit-06-filesystem-search.png	Demonstrates filesystem enumeration
Terminal search output	Shows filtering methodology
ls -l output	Demonstrates ownership and permissions
file output	Demonstrates artifact validation

If screenshots are not available, the repository should not claim that they
exist.

## Credential Handling

The credential obtained during this exercise is authentication material for
the training environment.

It is intentionally excluded from public documentation.

Public representation:

Credential: [REDACTED]

The repository demonstrates the methodology used to obtain and validate the
credential rather than publishing the credential itself.

This reflects a basic security principle:

Sensitive authentication material should not be unnecessarily exposed.

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

All activity documented in this report was performed against the authorized
OverTheWire Bandit training environment.

The techniques described should only be used against systems for which the
tester has explicit authorization.

This documentation is intended for:

Cybersecurity education
Authorized CTF environments
Defensive security training
Security research in controlled environments
Professional skills development
## Investigation Methodology

The investigation followed a repeatable process:

Observe
   ↓
Understand the requirements
   ↓
Translate requirements into search predicates
   ↓
Enumerate the filesystem
   ↓
Filter candidates
   ↓
Validate the artifact
   ↓
Retrieve required information
   ↓
Protect sensitive credentials
   ↓
Document the investigation

This methodology is transferable to real-world security operations.

## Lessons Learned
System-wide searches are more effective when precise filters are applied.
File ownership can be used as an investigation criterion.
Group ownership provides an additional validation attribute.
File size can help distinguish relevant artifacts from unrelated files.
Permission-denied messages are normal during non-privileged filesystem
enumeration.
Redirecting standard error can improve investigation readability.
Candidate artifacts should be validated before their contents are trusted.
Sensitive credentials should not be published in a public repository.
Linux command-line investigation skills are highly transferable to
security operations.
Combining multiple independent attributes produces more reliable search
results.
## Knowledge Notes

Related concepts are documented in:

../notes/linux.md
../notes/privilege-escalation.md

Relevant topics include:

Linux filesystem structure
File permissions
Ownership
Group permissions
Least privilege
Filesystem enumeration
Host-based investigation
## Professional Relevance

This exercise contributes to practical skills relevant to entry-level
cybersecurity and SOC roles.

The most transferable capabilities demonstrated are:

Linux command-line proficiency
Host investigation
Artifact discovery
Evidence filtering
Permission analysis
Security-focused troubleshooting
Credential protection
Structured technical documentation

The exercise also demonstrates the ability to explain not only what command
was executed, but why the command was appropriate and what security
concept it demonstrates.

## Training Outcome

Successfully completed the Bandit Level 06 → 07 objective.

The exercise established practical understanding of system-wide Linux
filesystem enumeration, ownership and group filtering, file-size filtering,
candidate validation, permission-aware investigation, and secure credential
handling.

Status: Completed
