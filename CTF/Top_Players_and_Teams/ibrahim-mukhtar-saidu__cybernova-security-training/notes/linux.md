# Linux Security & Investigation Notes

## Purpose

This note consolidates Linux concepts encountered throughout the OverTheWire Bandit training and explains their relevance to cybersecurity investigation and defensive operations.

## Core Linux Investigation Workflow

A practical Linux investigation commonly follows:

1. Identify the current user.
2. Confirm the working directory and host.
3. Enumerate files and directories.
4. Inspect permissions and ownership.
5. Identify unusual or hidden files.
6. Determine file types and content.
7. Search for relevant data.
8. Analyze execution and privilege boundaries.
9. Document observations and security implications.

Useful commands include:

```bash
whoami
pwd
hostname
id
ls -la
find
file
stat
cat
less
grep
Filesystem Investigation

Linux filesystems contain regular files, directories, symbolic links, special files, and hidden files.

Useful investigation commands include:

find . -type f
find . -type f -name "*.txt"
file suspicious-file
stat suspicious-file
ls -la

find can narrow an investigation by filename, type, size, ownership, permissions, or location.

file identifies the detected file format.

stat provides metadata such as permissions, ownership, size, and timestamps.

Permissions and Ownership

Linux permissions determine who can read, write, or execute a file.

Basic permissions are:

r: read
w: write
x: execute

Useful commands include:

ls -l
stat filename
id

Security investigations should pay particular attention to files that are writable or executable by unexpected users.

Hidden and Unusual Files

Linux hidden files commonly begin with a period.

Examples include:

.hidden
.config

They can be identified with:

ls -la
find . -name '.*'

Hidden does not automatically mean malicious. However, hidden files can contain security-relevant configuration or data.

Text Search and Filtering

Command-line filtering is essential for efficient investigation.

Examples:

grep "pattern" file.txt
grep -Rni "pattern" .
sort file.txt
uniq file.txt
strings binary-file

Pipes allow investigation results to be filtered and transformed efficiently.

File Types, Encoding, and Compression

Security investigations may encounter data whose representation is not immediately obvious.

Useful commands include:

file data
strings data
xxd data
base64 -d data

Common compression and archive tools include:

gzip
gunzip
bzip2
bunzip2
tar

The important principle is to identify the actual data format before selecting a decoding or decompression method.

Processes and Execution

Processes represent running programs and are important during host investigation.

Common commands include:

ps aux
ps -ef
top

Process information can help identify unexpected executables, suspicious command lines, or processes running under unexpected accounts.

Identity and Privilege

The effective identity of a process can differ from the identity of the user who launched it.

Useful commands include:

whoami
id

Special permission mechanisms such as SUID can affect execution privileges.

SUID files can be located with:

find / -perm -4000 -type f 2>/dev/null

The presence of an SUID executable is not automatically a vulnerability. Analysis must consider ownership, intended behavior, permissions, and whether unintended privilege changes are possible.

Symbolic Links

Symbolic links reference other filesystem objects.

They can be inspected with:

ls -l
readlink filename

Investigators should understand where a symbolic link points before treating its target as the object under examination.

Security Investigation Principles

Linux investigation should be evidence-driven.

Observation: what the system directly shows.

Analysis: what the observation means technically.

Security significance: why the behavior matters.

For example:

Observation: a file is owned by root and has the SUID bit set.
Analysis: the executable may run with the owner's effective privileges.
Security significance: unsafe behavior could create a privilege-boundary weakness.
Defensive / SOC Relevance

Linux command-line investigation provides foundational skills for SOC and Blue Team activities.

Relevant tasks include:

Investigating suspicious files
Reviewing permissions and ownership
Identifying unusual processes
Investigating authentication activity
Searching logs and system data
Identifying privilege-boundary weaknesses
Collecting supporting evidence
Documenting findings for incident response

These skills complement log analysis, endpoint monitoring, detection engineering, and incident-response workflows.

Lessons Learned

The Bandit exercises demonstrated that effective Linux security investigation depends on systematic enumeration and evidence analysis rather than memorizing individual commands.

A strong workflow is:

Observe → Enumerate → Identify → Test → Analyze → Document

Ethical Use

These techniques should only be used on systems owned by the user or for which explicit authorization has been provided.

This note is intended for authorized cybersecurity training, laboratories, defensive administration, and security investigation.
```
