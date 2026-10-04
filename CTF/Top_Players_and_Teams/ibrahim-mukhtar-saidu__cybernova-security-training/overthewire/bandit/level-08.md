# Bandit Level 08 → 09

## Objective

Retrieve the credential required to authenticate to Bandit Level 09 by
identifying the unique entry within a dataset containing many repeated
records.

The exercise introduces a basic data-analysis workflow using Linux
command-line utilities and pipelines.

The primary objective is to distinguish a unique record from repeated
records efficiently rather than manually inspecting the entire dataset.

---

## Environment

| Item | Details |
|---|---|
| Platform | OverTheWire Bandit |
| Source System | Parrot OS |
| Shell | Bash |
| Protocol | SSH |
| SSH Port | 2220 |
| Starting Account | bandit8 |
| Target Account | bandit9 |
| Authorization | Authorized cybersecurity training lab |
| Investigation Type | Duplicate and unique-record analysis |

---

## Scenario

The challenge provides a text file containing multiple records.

Most records occur more than once, while one record is unique.

The objective is to identify the unique record and use it as the credential
for the next level.

The investigation can be represented as:

```text
Raw Dataset
     |
     v
Inspect Dataset
     |
     v
Normalize Ordering
     |
     v
Identify Repeated Records
     |
     v
Identify Unique Record
     |
     v
Validate Finding
     |
     v
Protect Credential
```

## Investigation Approach

The investigation used a frequency-analysis approach. Instead of manually reviewing every record, the dataset was normalized through sorting and then filtered to identify the record that occurred only once.

The workflow was:

1. Establish the current working directory.
2. Identify and inspect the dataset.
3. Determine the investigation condition: identify the unique record.
4. Sort the dataset so identical records become adjacent.
5. Use `uniq -u` to isolate records occurring once.
6. Optionally use `uniq -c` to inspect frequency distribution.
7. Validate the resulting record against the challenge requirement.
8. Redact the recovered credential from public documentation.

This approach demonstrates efficient data reduction, frequency analysis, and repeatable command-line investigation.

Initial Reconnaissance

After authenticating to the Bandit Level 08 environment, the current
directory should be inspected.

pwd

This confirms the current working directory.

The available files can then be listed:

ls -la

Detailed file information can be obtained with:

ls -l

This establishes the investigation context before analyzing file contents.

Dataset Inspection

The relevant file contains many lines of text.

The number of records can be determined using:

wc -l data.txt

This provides an initial understanding of the dataset size.

A small sample can be inspected without necessarily printing the entire
dataset:

head data.txt

The end of the dataset can similarly be inspected with:

tail data.txt

The purpose of this reconnaissance is to understand the structure of the
data before selecting the analysis method.

Investigation Problem

The key observation is that the dataset contains repeated records.

The investigation question is:

Which record appears only once?

This is a frequency-analysis problem.

Instead of manually counting each line, command-line utilities can be
combined into a pipeline.

Command-Line Pipeline

A useful approach is:

sort data.txt | uniq -u

This pipeline consists of two stages:

data.txt
   |
   v
sort
   |
   v
Ordered records
   |
   v
uniq -u
   |
   v
Unique record

The resulting line identifies the unique record required by the challenge.

## Techniques and Commands

sort
sort data.txt

The sort command orders the input lines.

This is important because uniq operates on adjacent identical lines.

For example:

Before sorting:

alpha
beta
alpha
gamma
beta

After sorting:

alpha
alpha
beta
beta
gamma

The repeated records are now adjacent.

Why Sorting Matters

A common mistake is to use:

uniq -u data.txt

without sorting the input first.

uniq does not perform a global frequency analysis of arbitrary input.

It primarily compares adjacent lines.

Therefore, records that are identical but separated by other records may not
be recognized as duplicates.

The safer workflow is:

sort data.txt | uniq -u

This first places identical records together and then allows uniq to
identify records that occur only once.

uniq

The command:

uniq

removes or analyzes adjacent duplicate lines.

The -u option means:

-u = output only unique lines

Therefore:

sort data.txt | uniq -u

means:

Sort all records.
Group identical records together.
Output records that occur only once.
Pipeline Methodology

The complete pipeline can be understood as:

Input
  |
  v
sort
  |
  | Organize identical records
  v
uniq -u
  |
  | Remove repeated records from output
  v
Unique record

This demonstrates the Unix philosophy of combining small utilities to perform
a larger analytical task.

Alternative Analysis

The frequency of every record can also be examined using:

sort data.txt | uniq -c

This produces output conceptually similar to:

      1 unique_record
      2 repeated_record
      3 another_record

The exact counts depend on the dataset.

This method is useful when an analyst wants to understand the distribution
of records rather than immediately extracting the unique one.

The investigation can then identify the entry with a count of 1.

Comparing the Two Approaches
Direct unique extraction
sort data.txt | uniq -u

Advantages:

Concise
Fast
Directly addresses the challenge
Produces only unique records
Frequency analysis
sort data.txt | uniq -c

Advantages:

Shows occurrence counts
Provides additional analytical context
Useful when investigating unusual frequency patterns

For security investigations, the second method can sometimes provide more
context.

Observed Result

The pipeline successfully identified a single record that occurred only once
within the dataset.

That unique record represented the credential required for Bandit Level 09.

For public documentation, the credential is intentionally redacted:

Credential: [REDACTED]

No authentication material is stored in this repository.

Technical Analysis

This exercise demonstrates frequency-based data analysis.

The raw dataset contains multiple observations, making manual identification
of the unique record inefficient.

The analyst instead transforms the dataset into an ordered representation
and applies a duplicate-analysis operation.

Conceptually:

Unstructured Records
        |
        v
Ordering
        |
        v
Grouped Records
        |
        v
Frequency Analysis
        |
        v
Unique Observation

This pattern is broadly applicable to security data.

## Security Concept
Duplicate and Unique Event Analysis

Security analysts frequently investigate whether an event is:

Common
Repeated
Rare
Unique

Unusual frequency can sometimes be an important investigative signal.

For example:

100 successful logins
2 failed logins
1 unusual administrative action

The unusual event may deserve additional investigation.

The Bandit exercise provides a simplified example of this analytical concept.

## Defensive / SOC Relevance

SOC analysts routinely work with datasets containing repeated events.

Examples include:

Authentication logs
Firewall events
DNS queries
Endpoint telemetry
Web requests
Cloud audit events
Process execution records

Filtering and grouping repeated records can help analysts identify unusual
activity.

For example, a security analyst could use command-line processing to examine
repeated IP addresses in a log file.

A simplified workflow might be:

Log Dataset
    |
    v
Extract IP addresses
    |
    v
Sort
    |
    v
Count occurrences
    |
    v
Identify unusual frequencies
    |
    v
Investigate suspicious activity

This is conceptually related to the Bandit exercise.

Threat-Hunting Relevance

Frequency analysis can help develop threat-hunting hypotheses.

For example:

Question:
Which source IP appears unusually often?

Dataset:
Authentication logs.

Method:
Sort and count occurrences.

Result:
Identify high-frequency sources.

Next step:
Determine whether the activity is legitimate or suspicious.

Frequency alone does not prove malicious behavior.

It is an investigative signal that requires context and validation.

Detection Engineering Relevance

The same principle can be implemented in automated detection systems.

A simplified detection rule might be:

IF event_count(source_ip) > threshold
THEN generate investigation candidate

This becomes more useful when combined with additional context such as:

Username
Destination host
Time window
Authentication result
Geographic location
Device information
Known threat intelligence

The Bandit exercise therefore provides a foundation for understanding
frequency-based security analytics.

Data Reduction

The investigation demonstrates progressive reduction:

Entire Dataset
      |
      v
Sorted Dataset
      |
      v
Grouped Records
      |
      v
Unique Records
      |
      v
Validated Candidate

This is an important security-analysis technique.

Analysts often begin with large amounts of telemetry and progressively narrow
the dataset until only events requiring investigation remain.

Command-Line Investigation

The exercise demonstrates how several simple Unix tools can be combined:

sort
  +
uniq
  +
pipe

The pipe operator:

|

passes the output of one command directly into another command's input.

For example:

sort data.txt | uniq -u

can be interpreted as:

Run sort
    ↓
Take its output
    ↓
Send output to uniq
    ↓
Return unique records

This is one of the most important concepts in practical Linux command-line
work.

## Evidence Collection

Recommended evidence for this level:

evidence/screenshots/
└── bandit-08-unique-record-analysis.png

The screenshot should demonstrate:

The authenticated Bandit environment.
The relevant dataset.
The sort and uniq pipeline.
The resulting unique record.

The credential should be obscured before any screenshot is published
publicly.

## Evidence Reference
Evidence	Purpose
bandit-08-unique-record-analysis.png	Demonstrates duplicate/unique analysis
wc -l output	Demonstrates dataset reconnaissance
sort pipeline	Demonstrates data transformation
uniq -u result	Demonstrates unique-record identification
Redacted output	Demonstrates credential protection

Only evidence that actually exists should be referenced.

## Credential Handling

The unique record obtained from the challenge is authentication material
for the training environment.

It is intentionally not included in the public repository.

Public representation:

[REDACTED]

This prevents accidental disclosure of credentials while preserving the
technical explanation of the investigation.

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

All activities documented in this report were performed against the
authorized OverTheWire Bandit training environment.

The techniques should only be used against systems for which explicit
authorization has been provided.

This exercise is intended for:

Cybersecurity education
Authorized CTF environments
Defensive security training
Security research in controlled environments
Professional skills development
## MITRE ATT&CK Relevance

This exercise is a controlled text-analysis challenge rather than a direct reproduction of adversary behavior.

The strongest MITRE ATT&CK reference is:

- **T1083: File and Directory Discovery** is conceptually relevant to the broader discovery workflow demonstrated across the Bandit exercises.

For this specific level, the primary technical skill is frequency-based text analysis and data reduction. The ATT&CK reference is therefore presented as defensive analytical context rather than a claim that the challenge directly simulates an adversary procedure.

## Skills Demonstrated
Linux
File inspection
Text processing
Sorting
Duplicate analysis
Command pipelines
Standard input/output handling
Data Analysis
Frequency analysis
Dataset reduction
Duplicate identification
Unique-record identification
Result validation
Security
Investigation methodology
Anomaly identification
Evidence handling
Credential protection
## Professional Relevance

This exercise contributes to skills relevant to SOC analyst and
cybersecurity analyst roles.

The most transferable capabilities include:

Linux command-line analysis
Dataset filtering
Frequency-based investigation
Log-analysis fundamentals
Pipeline construction
Evidence validation
Security-focused reasoning

The exercise demonstrates that simple command-line utilities can be combined
to answer practical investigation questions efficiently.

## Lessons Learned
Large datasets should be analyzed systematically rather than manually.
sort can organize records so duplicate values become adjacent.
uniq operates on adjacent records.
uniq -u can identify records that occur only once after sorting.
The pipe operator allows multiple utilities to form an analytical
workflow.
uniq -c can provide useful frequency information.
Rare events can become useful investigation signals.
Frequency alone does not prove malicious activity.
Investigation results should be validated before being treated as
evidence.
Credentials discovered during security exercises should remain protected.
Command-line data processing skills are directly transferable to log
analysis and SOC workflows.
## Knowledge Notes

Related concepts are documented in:

../notes/linux.md
../notes/networking.md

Relevant topics include:

Linux pipelines
Text processing
Dataset filtering
Frequency analysis
Log analysis
Security investigation methodology
## Investigation Workflow

The investigation followed a repeatable process:

Observe
   ↓
Identify the dataset
   ↓
Understand the investigation question
   ↓
Select appropriate command-line tools
   ↓
Transform the dataset
   ↓
Analyze record frequency
   ↓
Identify the unique record
   ↓
Validate the finding
   ↓
Protect sensitive information
   ↓
Document evidence

This methodology can be adapted to real-world security-log analysis.

## Training Outcome

Successfully completed the Bandit Level 08 → 09 objective.

The exercise established practical understanding of Linux pipelines, sorting,
duplicate analysis, frequency analysis, unique-record identification,
dataset reduction, investigation methodology, and secure credential handling.

Status: Completed
