# Bandit Level 00 → 01

## Objective

Gain access to the Bandit Level 00 environment and retrieve the credential required to authenticate to Bandit Level 01.

The exercise establishes the basic workflow used throughout the Bandit training series: authenticate, inspect the environment, identify relevant files, retrieve required information, and document the result.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit0 |
| Target Account | bandit1 |
| Authorization | Authorized cybersecurity training lab |

---

## Scenario

The challenge begins with SSH access to the Bandit server.

After authentication, the objective is to inspect the home directory and identify the file containing the credential required for the next level.

This represents a basic host-based investigation involving filesystem enumeration and controlled credential retrieval.

---

## Initial Access

The Bandit environment is accessed through SSH:

```bash
ssh -p 2220 bandit0@bandit.labs.overthewire.org

The supplied Bandit Level 00 credential is used for authentication.

Credential values are intentionally omitted from this public repository.

```

## Investigation

After obtaining a shell, the first step is to inspect the current directory:

ls -la

The directory contents are reviewed to identify files that may contain information relevant to the challenge.

The target file for this level is:

readme

The file is then examined with:

cat readme

The resulting credential is used to authenticate to the next Bandit level.

Commands Used
Connect to the training server
ssh -p 2220 bandit0@bandit.labs.overthewire.org
Enumerate the current directory
ls -la
Read the challenge file
cat readme
Command-by-Command Analysis
ssh
ssh -p 2220 bandit0@bandit.labs.overthewire.org

Establishes an encrypted SSH connection to the authorized OverTheWire training environment.

The -p 2220 option specifies the non-default SSH port used by the Bandit service.

ls -la
ls -la

Lists directory contents.

The options provide:

-l: detailed file information
-a: include hidden files

Using ls -la is a useful initial enumeration technique when investigating an unfamiliar Linux directory.

cat
cat readme

Displays the contents of the readme file.

In this challenge, the file contains the credential required for the next level.

Observed Result

The readme file contained the credential required to continue from Bandit Level 00 to Level 01.

The credential is intentionally not reproduced in this public repository.

Technical Explanation

This level demonstrates a fundamental Linux investigation workflow:

SSH Authentication
       ↓
Directory Enumeration
       ↓
File Identification
       ↓
File Content Inspection
       ↓
Credential Retrieval
       ↓
Next-Level Authentication

The challenge is intentionally simple, but the workflow is important because the same pattern appears in real Linux administration, incident response, and security investigations.

## Investigation Approach

The investigation began by establishing authenticated access to the
authorized Bandit training environment and confirming the current user and
working directory.

The workflow was:

1. Authenticate to the assigned Bandit account.
2. Confirm the current user context.
3. Inspect the initial filesystem location.
4. Identify the artifact relevant to the challenge.
5. Apply the minimum commands necessary to validate the finding.
6. Use the recovered training credential only for progression to the next
   authorized level.
7. Avoid publishing authentication material.
8. Document the investigation methodology and security concepts demonstrated.

The emphasis is on establishing context before interacting with an artifact,
using repeatable command-line investigation techniques, and protecting
sensitive training credentials.

## Techniques and Commands

The investigation involved:

- SSH connection establishment
- Remote Linux authentication
- Command-line session management
- Working-directory identification
- Filesystem navigation
- Directory and file inspection
- Basic file-content retrieval
- Command-line evidence collection
- Result validation
- Credential protection
- Sanitized evidence collection

The investigation workflow was:

1. Establish the authorized Bandit training environment.
2. Connect to the designated training host using the provided SSH
   parameters.
3. Authenticate to the assigned training account.
4. Inspect the initial working environment and identify the supplied
   challenge artifact.
5. Use basic Linux filesystem commands to locate and inspect the artifact.
6. Retrieve the required training data from the identified file.
7. Validate the result against the challenge requirements.
8. Treat the retrieved value as sensitive training data and avoid
   reproducing it in public documentation.
9. Record only the methodology and sanitized evidence.

## Security Concept
Filesystem Enumeration

Before interacting with files on a Linux host, an analyst should understand what exists in the current environment.

Directory enumeration can reveal:

Configuration files
Logs
Scripts
Credentials
Hidden files
Application data
Temporary files

The security significance depends on the permissions and sensitivity of the discovered files.

## MITRE ATT&CK Relevance

This introductory exercise does not directly reproduce a specific adversary
procedure. However, the filesystem and environment-discovery activities are
conceptually related to **T1083: File and Directory Discovery**.

The mapping is provided as defensive context rather than as a claim that the
Bandit challenge itself is an adversary simulation.

## Skills Demonstrated
SSH authentication
Linux command-line navigation
Directory enumeration
File identification
File content inspection
Basic credential handling
Secure documentation practices
## Defensive / SOC Relevance

The same Linux commands used during this exercise can be relevant during authorized defensive investigations.

For example, a SOC analyst or incident responder may need to:

Identify files in a suspicious directory.
Investigate potentially exposed credentials.
Review configuration files.
Examine evidence collected from a compromised host.
Determine whether sensitive information is stored insecurely.

The important defensive lesson is that file discovery and permission analysis are foundational host-investigation skills.

## Lessons Learned
SSH provides encrypted remote access to Linux systems.
Directory enumeration should normally be performed before investigating files.
ls -la provides useful visibility into both normal and hidden files.
File contents should be treated as potentially sensitive information.
Credentials discovered during training should not be published publicly.
A simple, repeatable investigation workflow is useful for more advanced security analysis.
## Evidence

Evidence for this level should demonstrate the technical workflow without exposing authentication secrets.

Recommended evidence:

evidence/screenshots/
└── level-00/
    ├── 01-ssh-login.png
    ├── 02-directory-enumeration.png
    └── 03-file-inspection-redacted.png
## Evidence Requirements

Screenshots should show:

Successful SSH access to bandit0.
Directory enumeration using ls -la.
Identification of the readme file.
File inspection with the credential itself redacted if visible.

Do not upload screenshots containing reusable passwords or other authentication material.

## Credential Handling

The credential obtained during this exercise is intentionally excluded from the repository.

Public documentation should describe:

Where the credential was discovered.
How it was used.
Why it was necessary.

It should not publish the credential itself.

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

All activities documented here were performed within the authorized OverTheWire Bandit cybersecurity training environment.

The techniques should only be used against systems for which explicit authorization has been provided.

## Knowledge Notes
Related Topics
SSH
Linux filesystem navigation
File permissions
Credential handling
Host-based investigation

See the consolidated notes:

../notes/linux.md
../notes/ssh.md
## Training Outcome

Successfully completed the Bandit Level 00 → 01 objective and established the basic workflow used for subsequent levels.

Status: Completed
