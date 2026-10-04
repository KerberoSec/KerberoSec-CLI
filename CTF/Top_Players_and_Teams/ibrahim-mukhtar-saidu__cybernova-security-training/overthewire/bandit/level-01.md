# Bandit Level 01 → 02

## Objective

Retrieve the credential required for Bandit Level 02 from a file whose
filename begins with a hyphen (`-`).

The objective is to understand how Linux command-line tools interpret
filenames that can be confused with command-line options and how to safely
reference such files.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit1 |
| Target Account | bandit2 |
| Authorization | Authorized cybersecurity training lab |

---

## Scenario

After authenticating as `bandit1`, the challenge requires retrieving
information from a file named:

`-`

The filename consists of a single hyphen.

A hyphen has a special meaning in many Unix command-line utilities because
it may be interpreted as an option or as a special standard-input/output
indicator.

The challenge therefore tests whether the analyst can distinguish between
a filename and a command-line argument.

---

## Initial Reconnaissance

The first step is to inspect the current working directory:

```bash
pwd

The command identifies the current filesystem location.

The directory contents can then be inspected with:

ls -la
```

This provides visibility into normal and hidden files and allows unusual
filenames to be identified.

The relevant file is:

-
Command-Line Problem

A naive command such as:

cat -

does not reliably mean "read the file named -".

For many Unix utilities, a standalone: is interpreted specially rather
than as an ordinary filename.

This creates an ambiguity between:

filename: -

and:

special command-line argument: -

Understanding this distinction is an important Linux command-line skill.

Safe File Referencing

One way to explicitly identify the file in the current directory is to use
a relative path:

cat ./-

The ./ prefix tells the shell and the command that the argument refers to
a file named: in the current directory.

The important distinction is:

-

versus:

./-

The second form is explicitly a filesystem path and therefore avoids the
ambiguity associated with a standalone hyphen.

Command Used
cat ./-
Command Breakdown

cat

Reads and displays file contents.

./

Represents the current working directory.

-

Refers to the file whose actual filename is a single hyphen.

Therefore:

cat ./-

means:

Display the contents of the file named: located in the current
directory.

Observed Result

The command successfully displayed the credential required to authenticate
to the next Bandit level.

The actual credential is intentionally not reproduced in this public
portfolio repository.

Observed result:

[REDACTED]
Technical Explanation

Linux command-line programs commonly process arguments using conventions
where arguments beginning with: are interpreted as options.

For example:

command -option

may cause -option to be interpreted as an option rather than a filename.

A filename beginning with: can therefore create ambiguity.

Using an explicit path such as:

./-

removes that ambiguity because the argument is clearly a filesystem path.

This is a small but important example of defensive command-line handling.

Alternative Safe Techniques

The same general problem can be handled using other techniques.

For example:

cat: -

The: convention tells many Unix utilities that option processing has
ended and that subsequent arguments should be interpreted as operands.

Another approach is to use an explicit path:

cat ./-

For this challenge, the explicit relative-path method is particularly easy
to understand and demonstrates clear filesystem reasoning.

## Techniques and Commands

The investigation involved:

- Linux filesystem enumeration
- Directory and file inspection
- Filename analysis
- Handling filenames beginning with `-`
- Shell option parsing awareness
- Explicit path specification
- Command-line file access
- Argument interpretation analysis
- Exact artifact identification
- File content inspection
- Result validation
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training session.
2. Inspect the supplied directory and enumerate its contents.
3. Identify that the target artifact has a filename beginning with a
   hyphen.
4. Recognize that command-line tools may interpret such a filename as
   an option rather than as a file path.
5. Use an explicit path representation to distinguish the filename from
   command-line options.
6. Inspect the identified artifact and retrieve its training data.
7. Validate the result against the challenge requirements.
8. Confirm that the result represents the required next-stage training
   credential.
9. Avoid reproducing the credential in public documentation.
10. Record only the methodology and sanitized evidence.

## Security Concept
Special Filename Handling

Attackers and administrators may encounter unusual filenames during:

Incident response
Malware analysis
File-system investigations
Log analysis
Forensic examination
Security automation
Server administration

A security analyst should not assume that every filename follows conventional
naming patterns.

Unexpected filenames can also be deliberately created to confuse automated
scripts or administrators.

## Security Relevance

Improper handling of filenames can cause security tools and scripts to
interpret attacker-controlled filenames as command-line options.

For example, poorly written automation that processes filenames without
proper argument handling may behave unexpectedly when encountering filenames
beginning with -.

This is particularly relevant to:

Security automation
Incident-response scripts
File-processing pipelines
Backup scripts
Malware collection tools
SOC investigation utilities
## Defensive / SOC Relevance

During a host investigation, an analyst may encounter files with unusual
names.

Correct command-line handling prevents accidental command execution or
incorrect interpretation of investigation targets.

For security automation, safer approaches include:

Using explicit paths
Using: where supported
Avoiding unsafe shell string construction
Properly escaping or quoting user-controlled filenames
Using APIs that separate arguments from shell commands

These practices help reduce command-injection and argument-injection risks.

## MITRE ATT&CK Relevance

The exercise involves locating and inspecting a file within the authenticated
environment. This is conceptually related to **T1083: File and Directory
Discovery**.

The mapping is provided as defensive analytical context and does not imply
that the CTF exercise directly reproduces adversary behavior.

## Skills Demonstrated
Linux filesystem navigation
Bash command-line usage
File enumeration
Special filename handling
Unix command argument interpretation
Safe file access
Basic security automation awareness
Technical documentation
## Investigation Methodology

The investigation followed this sequence:

Authenticate
    ↓
Inspect working directory
    ↓
Identify unusual filename
    ↓
Analyze command-line ambiguity
    ↓
Construct explicit filesystem path
    ↓
Read file contents
    ↓
Protect credential from publication
    ↓
Document security implications

This workflow demonstrates a repeatable approach that can be applied beyond
CTF environments.

## Evidence / Screenshot Reference

Recommended evidence for this level:

evidence/screenshots/bandit-01-file-enumeration.png

The screenshot should demonstrate the relevant filesystem investigation
without exposing the credential.

A second screenshot may be used for the successful file-access command:

evidence/screenshots/bandit-01-command-result.png

If the command output contains authentication material, redact the sensitive
value before adding the screenshot to the public repository.

## Credential Handling

The credential obtained from the challenge is intentionally excluded from
this public repository.

Public documentation uses:

[REDACTED]

Private credentials, authentication tokens, SSH keys, and other sensitive
authentication material should never be committed to a public Git repository.

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

This activity was performed exclusively within the authorized OverTheWire
Bandit cybersecurity training environment.

The techniques documented here should only be applied to systems for which
explicit authorization has been provided.

## Lessons Learned
Linux commands may interpret arguments beginning with: as options.
A filename can have a meaning that conflicts with command-line syntax.
Explicit filesystem paths can remove command-line ambiguity.
The: convention can terminate option processing for many Unix tools.
Security analysts must be comfortable handling unusual filesystem objects.
Investigation tools and automation should safely process attacker-
controlled filenames.
Credentials obtained during training should not be published publicly.
## Training Outcome

Successfully completed the Bandit Level 01 → 02 objective.

The exercise established practical understanding of:

Special filename handling
Unix command-line argument parsing
Explicit filesystem paths
Safe command execution
Credential protection

Status: Completed
