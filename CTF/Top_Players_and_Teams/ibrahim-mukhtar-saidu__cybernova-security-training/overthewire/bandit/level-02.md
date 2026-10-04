# Bandit Level 02 → 03

## Objective

Retrieve the credential required to authenticate to Bandit Level 03 from a
file whose filename contains spaces.

The exercise demonstrates how the Bash shell parses command-line input and
why filenames containing whitespace must be handled carefully.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit2 |
| Target Account | bandit3 |
| Authorization | Authorized cybersecurity training lab |

---

## Scenario

After authenticating to the Bandit Level 02 environment, the working
directory contains a file whose name includes multiple spaces.

The relevant filename is:

```text
spaces in this filename
```

The objective is to read the file and retrieve the credential required for
the next level.

The challenge demonstrates an important distinction between:

a filename containing spaces

and:

multiple command-line arguments
Initial Reconnaissance

The first step is to establish the current working directory:

pwd

The directory contents are then inspected:

ls -la

This allows the analyst to identify the available files and recognize that
the relevant filename contains whitespace.

A more explicit directory listing can also be performed with:

ls -lb

The -b option displays escape sequences for non-printing characters and
helps make unusual filenames easier to identify.

Command-Line Parsing Problem

A naive command such as:

cat spaces in this filename

does not treat the entire filename as one argument.

The shell performs word splitting and effectively passes multiple arguments
to cat:

spaces
in
this
filename

Instead of:

spaces in this filename

as a single filename.

This demonstrates that the shell interprets whitespace as an argument
separator unless the filename is properly quoted or escaped.

Safe Filename Handling

There are several safe ways to reference a filename containing spaces.

Method 1: Quoting

The filename can be enclosed in double quotes:

cat "spaces in this filename"

The shell treats the quoted text as a single argument.

Method 2: Single Quotes

Single quotes can also be used:

cat 'spaces in this filename'

This is useful when the filename contains characters that should not undergo
shell expansion.

Method 3: Escaping Spaces

Each space can be escaped using a backslash:

cat spaces\ in\ this\ filename

The backslashes tell the shell that the spaces belong to the filename rather
than separating arguments.

Preferred Investigation Approach

For security investigations and automation, quoting paths is generally easier
to read and less error-prone than manually escaping every space.

For example:

cat "spaces in this filename"

clearly communicates that the entire string represents one filesystem path.

Command Used
cat "spaces in this filename"
Command Breakdown

cat

Reads and displays the contents of a file.

"spaces in this filename"

The quotation marks prevent the shell from splitting the filename into
multiple arguments.

The resulting command sends the complete filename as a single argument to
cat.

Observed Result

The command successfully displayed the credential required to authenticate
to the next Bandit level.

The actual credential is intentionally excluded from this public portfolio.

Observed result:

[REDACTED]
Technical Explanation

Bash performs several stages of command processing before executing a
program.

One important stage is word splitting.

For example:

echo hello world

passes two arguments:

hello
world

Likewise:

cat spaces in this filename

is interpreted as multiple arguments.

Quoting changes this behavior:

cat "spaces in this filename"

The shell passes the complete string as one argument.

Conceptually:

Unquoted:

spaces in this filename
   ↓
spaces | in | this | filename

Quoted:

"spaces in this filename"
   ↓
spaces in this filename

This distinction is fundamental to reliable shell usage.

## Techniques and Commands

The investigation involved:

- Linux filesystem enumeration
- Directory and file inspection
- Filename analysis
- Handling filenames containing spaces
- Shell argument parsing
- Quoting and escaping techniques
- Command-line file access
- Exact artifact identification
- File content inspection
- Result validation
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training session.
2. Inspect the supplied directory and enumerate its contents.
3. Identify that the target artifact uses a filename containing spaces.
4. Account for shell word-splitting when referencing the artifact.
5. Use appropriate quoting or escaping to address the complete filename.
6. Inspect the identified artifact and retrieve its training data.
7. Validate the result against the challenge requirements.
8. Confirm that the result represents the required next-stage training
   credential.
9. Avoid reproducing the credential in public documentation.
10. Record only the methodology and sanitized evidence.

## Security Concept
Shell Argument Parsing

Command-line argument parsing is important in cybersecurity because many
security tools and scripts process filenames, usernames, log entries,
network addresses, or other external data.

If input is not handled correctly, whitespace and other special characters
can change how a command is interpreted.

## Security Relevance

Improper shell argument handling can contribute to:

Command injection
Argument injection
Incorrect file processing
Security automation failures
Log-processing errors
Unsafe administrative scripts

For example, a script that constructs shell commands from untrusted filenames
without proper quoting may behave unexpectedly.

## Defensive / SOC Relevance

Security analysts frequently process attacker-controlled or externally
generated data.

Examples include:

Malware filenames
Uploaded files
Web-server logs
Endpoint telemetry
Forensic artifacts
Suspicious process arguments
User-generated filenames

Understanding shell parsing helps analysts avoid introducing errors while
investigating these artifacts.

For security automation, safer approaches include:

Proper argument handling
Explicit path handling
Avoiding unnecessary shell interpretation
Using APIs that accept argument arrays
Validating untrusted input
Avoiding unsafe string concatenation
## Investigation Methodology

The investigation followed this process:

Authenticate
    ↓
Inspect working directory
    ↓
Identify unusual filename
    ↓
Recognize whitespace in filename
    ↓
Analyze shell word splitting
    ↓
Quote the filename
    ↓
Read the file
    ↓
Protect credential from publication
    ↓
Document the security implication

This demonstrates a repeatable host-investigation workflow.

## MITRE ATT&CK Relevance

The exercise involves identifying and handling files within an authenticated
filesystem. This is conceptually related to **T1083: File and Directory
Discovery**.

The technique is referenced to connect the laboratory activity with a
defensive understanding of filesystem discovery.

## Skills Demonstrated
Bash shell usage
Linux filesystem navigation
File enumeration
Filename analysis
Shell word splitting
Quoting and escaping
Safe command-line handling
Security automation awareness
Technical documentation
## Evidence / Screenshot Reference

Recommended public evidence:

evidence/screenshots/bandit-02-directory-enumeration.png

This screenshot should demonstrate identification of the filename containing
spaces.

A second screenshot can demonstrate the successful command:

evidence/screenshots/bandit-02-file-access.png

If the command output contains authentication material, redact the
credential before publishing the screenshot.

## Credential Handling

The credential obtained during the challenge is not included in the public
repository.

Instead, documentation uses:

[REDACTED]

Private authentication material should never be committed to a public
repository.

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

This exercise was performed exclusively against the authorized OverTheWire
Bandit training environment.

The techniques documented here should only be applied to systems for which
explicit authorization has been provided.

## Lessons Learned
Bash normally uses whitespace to separate command-line arguments.
Filenames containing spaces must be quoted or escaped.
Quoting preserves a filename as a single command argument.
Single and double quotes have different shell-expansion behavior.
Proper argument handling is important in security automation.
Untrusted filenames should never be blindly inserted into shell commands.
Security analysts must understand shell parsing when investigating Linux
systems.
Training credentials should not be published in public repositories.
## Training Outcome

Successfully completed the Bandit Level 02 → 03 objective.

The exercise established practical understanding of:

Linux filename handling
Bash word splitting
Quoting
Escaping
Safe command-line processing
Security automation considerations
Credential protection

Status: Completed
