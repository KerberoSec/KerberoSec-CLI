# TryHackMe: Linux Fundamentals (Pt1)

## Overview

* **Platform:** TryHackMe
* **Room:** Linux Fundamentals (Pt1)
* **Difficulty:** Beginner
* **Category:** Linux / Cybersecurity Fundamentals
* **Status:** Completed
* **Tasks Completed:** 6/6
* **Environment:** Authorized TryHackMe Linux laboratory
* **Primary Platform:** Ubuntu Linux

## Objective

The objective of this room was to develop foundational Linux command-line skills through practical interaction with an Ubuntu laboratory machine.

The exercises covered:

* Identifying the current Linux user
* Producing terminal output
* Navigating the Linux filesystem
* Listing and reading files
* Locating files and searching file contents
* Combining commands with shell operators
* Redirecting command output
* Applying basic command-line skills in a practical arena

These capabilities form an important foundation for cybersecurity operations, particularly Linux system investigation, log analysis, incident response, and SOC workflows.

## Environment

The exercises were performed within the authorized TryHackMe laboratory environment using an Ubuntu Linux machine.

The lab machine was accessed only for the purposes of completing the assigned TryHackMe exercises.

Temporary laboratory IP addresses, challenge flags, passwords, tokens, and other authentication or challenge-sensitive values are intentionally excluded from this public report.

## Initial Observations

The room introduced the Linux terminal as the primary interface for interacting with a Linux system.

A key concept was that commands provide instructions to the operating system and return output that can be inspected or redirected for further analysis.

The room also demonstrated that basic Linux commands can be combined to perform more efficient investigation and data-handling tasks.

## Task 1: Introduction

The laboratory Ubuntu machine was deployed successfully and the room environment was initialized.

### Security relevance

Before beginning an investigation, an analyst should understand the environment being investigated and confirm that the intended laboratory or authorized system is being used.

## Task 2: Talking to Linux

The first commands introduced were:

```bash
whoami
```

and:

```bash
echo TryHackMe
```

### `whoami`

The `whoami` command identifies the effective user associated with the current shell session.

This is important during security investigations because the current user determines the permissions and access available to the investigator.

### `echo`

The `echo` command outputs supplied text.

Although simple, it is an important shell building block for scripts, variables, command testing, and redirecting generated output.

### SOC relevance

Understanding the current account and privilege context is important when investigating suspicious activity on Linux systems.

## Task 3: Finding Your Way Around

The room introduced four fundamental filesystem commands:

```bash
ls
```

Lists files and directories in the current location.

```bash
cd <directory>
```

Changes the current working directory.

```bash
cat <file>
```

Displays the contents of a text file.

```bash
pwd
```

Displays the current working directory.

### Security relevance

These commands form part of the basic toolkit used when manually investigating a Linux system.

An analyst may need to:

1. Establish the current filesystem location.
2. Identify relevant files and directories.
3. Navigate to an investigation target.
4. Inspect text-based logs or configuration files.

## Task 4: Let the Machine Do the Searching

The room introduced:

```bash
find
```

and:

```bash
grep
```

### `find`

`find` can locate files and directories according to conditions such as their names.

Example:

```bash
find -name passwords.txt
```

### `grep`

`grep` searches file contents for matching text.

Example:

```bash
grep "THM" access.log
```

The exercise demonstrated how searching can be automated instead of manually reviewing a large log file.

Challenge flags and other room-specific answer values are intentionally omitted from this public report.

### SOC relevance

`grep` is particularly useful when investigating text-based security logs.

Examples of defensive investigations may include searching authentication logs for:

```bash
grep "Failed password" auth.log
```

or identifying relevant events within application and web-server logs.

`find` can also assist an analyst in locating files of interest during host investigation.

## Task 5: Shell Operators

The room introduced several shell operators and output redirectors.

### Background execution

```bash
&
```

Runs a command in the background.

### Sequential execution

```bash
&&
```

Runs the next command after the preceding command completes successfully.

### Output redirection

```bash
>
```

Redirects command output to a file and overwrites existing contents.

Example:

```bash
echo "TryHackMe" > thm
```

### Output appending

```bash
>>
```

Redirects output to a file while appending to existing contents.

Example:

```bash
echo "thm" >> thm
```

### Security relevance

Shell operators allow analysts and administrators to combine commands and preserve investigation output.

For example:

```bash
grep "Failed password" auth.log > failed-logins.txt
```

can save relevant log entries for further analysis.

Appending additional evidence can be performed with:

```bash
grep "Accepted password" auth.log >> failed-logins.txt
```

When collecting evidence, analysts should take care not to overwrite original evidence or alter source data unnecessarily.

## Task 6: Practice Arena

The optional Practice Arena reinforced the commands introduced throughout the room.

The exercises required filesystem navigation, searching web-server log data, and redirecting command output.

The practice confirmed the practical application of:

* `cd`
* `grep`
* `echo`
* `>`
* Basic filesystem navigation

Challenge flags and challenge-specific answer values are deliberately excluded from this report.

## Investigation Methodology

The command-line workflow introduced in this room can be generalized into a basic Linux investigation process:

1. **Establish context**

   * Identify the current user with `whoami`.
   * Establish the current location with `pwd`.

2. **Explore the filesystem**

   * Use `ls` to identify relevant files and directories.
   * Use `cd` to navigate to the investigation location.

3. **Locate relevant artifacts**

   * Use `find` when the location of a file is unknown.

4. **Inspect evidence**

   * Use `cat` for appropriate text-based files.
   * Use `grep` to identify relevant content efficiently.

5. **Preserve useful output**

   * Redirect results using `>` or `>>` when appropriate.

6. **Validate results**

   * Review command output and confirm that the observed information supports the investigation hypothesis.

## Commands and Tools

Commands practiced during the room included:

```bash
whoami
echo
ls
cd
cat
pwd
find
grep
&
&&
>
>>
```

These commands were used only within the authorized TryHackMe laboratory environment.

No sensitive challenge credentials or authentication material are included in this report.

## Findings

### Finding 1: Linux command-line fundamentals are essential for security operations

* **Severity:** Informational
* **Observation:** The room demonstrated how basic Linux commands can be used to identify users, navigate filesystems, inspect files, search data, and process command output.
* **Analysis:** These capabilities provide a foundation for host-based security investigation and log analysis.
* **Security Impact:** Analysts without sufficient command-line skills may be slower or less effective when investigating Linux systems.

### Finding 2: Efficient log searching reduces manual investigation effort

* **Severity:** Informational
* **Observation:** `grep` was used to search a large web-server log for specific content.
* **Analysis:** Automated text searching allows analysts to quickly isolate potentially relevant events from large amounts of log data.
* **Security Impact:** Efficient filtering can reduce investigation time and help analysts identify suspicious activity more quickly.

### Finding 3: Shell redirection enables structured investigation output

* **Severity:** Informational
* **Observation:** Shell output was redirected into files using `>` and `>>`.
* **Analysis:** Redirecting command output allows analysts to preserve selected results for later review or processing.
* **Security Impact:** Improper use of redirection can overwrite useful information, so analysts should understand the distinction between overwriting and appending.

## MITRE ATT&CK Relevance

The room primarily focused on foundational Linux administration and command-line skills rather than demonstrating a specific adversary technique.

Therefore, MITRE ATT&CK mappings are intentionally limited rather than forcing techniques that were not meaningfully demonstrated.

### T1059.004: Command and Scripting Interpreter: Unix Shell

* **Relevance:** The exercises required interacting with a Linux shell and executing Unix commands.
* **Context:** Unix shell activity is relevant to both legitimate administration and adversary behavior. In a SOC environment, command execution should therefore be evaluated in context using user identity, process information, timestamps, parent processes, and other available telemetry.

This mapping describes the command-line technique at a conceptual level and does not imply malicious activity occurred during the TryHackMe exercise.

## Defensive / SOC Relevance

Linux command-line proficiency is directly relevant to SOC and Blue Team operations.

### Host investigation

An analyst may use commands such as:

```bash
whoami
pwd
ls
```

to establish basic host and user context.

### Log investigation

Commands such as:

```bash
grep
cat
```

can assist with inspecting and filtering text-based logs.

### Artifact discovery

`find` can help locate files relevant to an investigation, including scripts, configuration files, logs, or other artifacts.

### Evidence handling

Shell redirection can preserve selected investigation results, but analysts should avoid modifying original evidence unnecessarily.

In a production environment, evidence handling should follow organizational incident-response procedures and forensic requirements.

## Detection Opportunities

Organizations monitoring Linux systems can collect telemetry that provides additional context around command-line activity, including:

* User identity
* Process creation
* Parent/child process relationships
* Command execution
* Authentication events
* Privilege changes
* File access
* Network connections
* Shell history where appropriate
* System and application logs

A suspicious command should not be assessed in isolation. Analysts should correlate command activity with the user, host, time, process tree, authentication events, and network activity.

## Recommended Defensive Controls

Organizations can strengthen Linux monitoring by:

1. Centralizing relevant Linux authentication and system logs.
2. Monitoring privileged account activity.
3. Collecting appropriate process execution telemetry.
4. Restricting unnecessary administrative privileges.
5. Using centralized log analysis or SIEM platforms.
6. Establishing alerting for suspicious authentication and privilege behavior.
7. Maintaining secure and monitored administrative access.
8. Protecting log integrity and access controls.
9. Applying least-privilege principles.
10. Establishing documented incident-response procedures.

## Lessons Learned

* Linux command-line skills are foundational for cybersecurity investigations.
* `whoami` helps establish the current user context.
* `pwd`, `ls`, and `cd` provide basic filesystem navigation.
* `cat` can inspect text-based files.
* `find` helps locate files efficiently.
* `grep` is valuable for searching large log files.
* `>` overwrites redirected output while `>>` appends to a file.
* `&&` provides sequential command execution.
* Shell skills become increasingly valuable when investigating systems at scale.

## Evidence Handling

Evidence from the TryHackMe laboratory was used only to complete the authorized exercises.

The public report intentionally excludes:

* Challenge flags
* Passwords
* Authentication credentials
* Tokens
* Private keys
* Temporary laboratory credentials
* Other sensitive challenge-specific values

The report focuses on transferable skills, methodology, and security relevance rather than publishing challenge solutions.

## Evidence

Recommended evidence for the private learning record includes screenshots showing:

* Successful Linux laboratory deployment
* `whoami` command execution
* Basic filesystem navigation
* `find` / `grep` investigation
* Shell redirection exercises
* Practice Arena completion

Before publishing screenshots to GitHub, each image should be reviewed for:

* Challenge flags
* Passwords
* Tokens
* Session identifiers
* Temporary credentials
* Unnecessary IP addresses
* Personal account information

Only sanitized evidence should be published.

## Ethical Scope

All activity documented in this report was performed within the authorized TryHackMe laboratory environment.

The techniques described must only be used against systems for which explicit authorization has been provided.

The commands and concepts described can support both legitimate administration and security investigations. Their use outside an authorized environment may be unlawful or disruptive.

## Conclusion

Linux Fundamentals (Pt1) established a practical foundation for interacting with Linux through the command line.

The room demonstrated how basic commands can be combined to navigate systems, inspect files, search log data, and preserve command output.

These skills are directly transferable to SOC Analyst and Blue Team workflows, particularly Linux host investigation, log analysis, incident response, and security monitoring.

This room forms the first stage of the Linux component of the CYBERNOVA security training portfolio.

## Conclusion

Linux Fundamentals (Pt1) established a practical foundation for interacting with Linux through the command line.

The room strengthened core skills in user identification, filesystem navigation, file discovery, text searching, shell operators, and output redirection. These skills are directly transferable to Linux host investigation, log analysis, incident response, and SOC workflows.

This exercise also reinforced the importance of understanding command execution in context, preserving relevant investigation output, and operating only within authorized environments.

The next stage of the training roadmap will build on these fundamentals through progressively deeper networking, Windows, SOC, SIEM, detection, and incident-response exercises.
