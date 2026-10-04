# CYBERNOVA Security Training

![Focus](https://img.shields.io/badge/Focus-Cybersecurity-red)
![Training](https://img.shields.io/badge/Training-CTF%20%7C%20Blue%20Team%20%7C%20Security%20Labs-blue)
![OverTheWire](https://img.shields.io/badge/OverTheWire-Bandit%2000--33-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

## Overview

This repository documents my hands-on cybersecurity training across
authorized Capture The Flag (CTF) platforms, defensive-security exercises,
and practical security laboratories.

The training collection is designed to build transferable skills in Linux,
networking, authentication, system investigation, web security, security
monitoring, incident analysis, privilege boundaries, and defensive security.

Each training exercise is approached as a technical investigation: observing
system behavior, enumerating relevant information, forming and testing
hypotheses, analyzing evidence, identifying the underlying security concept,
and documenting the findings.

The repository is organized by training platform and security domain so that
new CTF platforms, defensive exercises, and future cybersecurity laboratories
can be added without restructuring the project.

The exercises are maintained as a structured cybersecurity learning record
with technical explanations, observed results, security implications,
defensive/SOC relevance, lessons learned, and selected supporting evidence.

---

## Training Portfolio

The repository is organized into platform-specific training collections and
defensive-security exercises. New training can be added without restructuring
the repository.

| Training Area | Scope | Status |
|---|---|---|
| [OverTheWire Bandit](overthewire/bandit/) | Linux, command-line investigation, filesystems, permissions, SSH, networking, encoding, compression | Completed: 00 → 33 |
| [TryHackMe](tryhackme/) | Practical cybersecurity rooms across Linux, networking, web security, reconnaissance, vulnerability analysis, and defensive concepts | Active |
| [picoCTF](picoctf/) | CTF challenges covering cryptography, web security, forensics, reverse engineering, exploitation, and general security analysis | Initialized |
| [Hack The Box](hackthebox/) | Authorized laboratories covering reconnaissance, services, Linux/Windows security, web security, privilege escalation, and enterprise security | Initialized |
| [Defensive Security](defensive-security/) | Security monitoring, detection engineering, threat hunting, incident response, SIEM workflows, and defensive analysis | Initialized |

### Training Philosophy

The objective is to build practical, transferable cybersecurity capability
rather than simply accumulate completed challenges.

Training activities are documented with emphasis on:

- Technical investigation and evidence-based reasoning
- Linux and networking fundamentals
- Security enumeration and analysis
- Vulnerability and authentication concepts
- Detection and defensive thinking
- SOC and incident-response relevance
- Clear technical documentation
- Ethical and authorized security practice

---

## Objectives

The primary objectives of this training are to develop practical, transferable
cybersecurity skills through hands-on Linux and security challenges.

### Technical Objectives

- Develop strong Linux command-line proficiency.
- Investigate files, directories, permissions, ownership, and filesystem
  structures.
- Identify hidden, unusual, encoded, compressed, and archived data.
- Apply text-processing, filtering, and pattern-matching techniques.
- Develop foundational network enumeration and service-analysis skills.
- Understand TCP-based services and client/server communication.
- Practice SSH authentication and secure remote-access concepts.
- Inspect TLS/SSL connections and certificate information.
- Analyze restricted shell environments and command-execution behavior.
- Identify SUID executables and understand privilege boundaries.
- Understand real UID versus effective UID.
- Analyze basic privilege-escalation scenarios within authorized laboratories.
- Investigate Git repositories, history, branches, tags, and historical data.

### Investigation Objectives

- Follow a structured security-investigation methodology.
- Observe system behavior before forming conclusions.
- Enumerate relevant technical information using appropriate tools.
- Form and test technical hypotheses.
- Analyze evidence and distinguish observations from conclusions.
- Document findings clearly and reproducibly.
- Identify the security significance of technical findings.
- Connect laboratory techniques to defensive security and SOC workflows.

### Professional Objectives

- Strengthen practical Linux and networking foundations.
- Develop evidence-based technical documentation habits.
- Improve command-line troubleshooting and analytical reasoning.
- Practice explaining technical findings in a clear, professional manner.
- Translate hands-on CTF experience into transferable cybersecurity knowledge.

---

## Training Environment

The training was conducted from a Linux workstation against the authorized
OverTheWire Bandit training environment.

| Component | Details |
|---|---|
| Training Platform | OverTheWire Bandit |
| Operating System | Parrot OS |
| Shell | Bash |
| Primary Interface | SSH |
| Primary Language | Linux shell commands |
| Networking Tools | Nmap, OpenSSL, SSH |
| Target Environment | Authorized OverTheWire Bandit Linux servers |
| Training Type | Authorized cybersecurity laboratory |
| Documented Range | Bandit 00 → 33 |

### Working Method

The exercises were performed interactively through the Linux command line.
Tools and commands were selected according to the requirements of each
challenge and the behavior observed during investigation.

The general workflow was:

1. Establish access to the authorized training environment.
2. Inspect the available files, services, permissions, or shell behavior.
3. Identify relevant technical clues.
4. Select an appropriate command or security tool.
5. Form and test a technical hypothesis.
6. Analyze the resulting evidence.
7. Document the finding and underlying security concept.
8. Consider the defensive-security relevance.

No third-party systems were intentionally targeted as part of this training.

---

## Skills Demonstrated

The completed Bandit training demonstrates foundational practical skills in
Linux administration, command-line investigation, networking, authentication,
and security analysis.

### Linux & Host Investigation

- Linux filesystem navigation and directory inspection
- File discovery and metadata analysis
- Hidden-file identification
- File permissions and ownership analysis
- Symbolic-link handling
- Special and unusual filename handling
- File type identification
- Command-line text processing
- Pattern matching and targeted searches
- Compression and archive analysis

### Networking & Services

- TCP service interaction
- Port enumeration
- Service discovery
- Basic service and version identification
- Client/server communication
- Network-oriented troubleshooting
- Analysis of exposed services within an authorized laboratory

### Authentication & Secure Communications

- SSH authentication
- SSH private-key authentication
- Secure remote-access concepts
- TLS/SSL service interaction
- Certificate inspection
- Authentication-service analysis
- Credential-handling awareness

### Security Analysis

- SUID executable identification
- Real UID and effective UID concepts
- Privilege-boundary analysis
- Basic privilege-escalation concepts
- Restricted-shell analysis
- Command-execution behavior analysis
- Scheduled-execution analysis
- Attack-surface enumeration
- Git repository and historical-data investigation
- Sensitive-data exposure awareness

### Investigation & Documentation

- Structured command-line investigation
- Evidence-oriented analysis
- Hypothesis-driven troubleshooting
- Reproducible technical documentation
- Security-impact analysis
- Defensive-security interpretation
- Connecting technical observations to SOC and Blue Team concepts

---

## Bandit Progress

The Bandit training has been completed from **Bandit 00 → 33**.

The repository contains one technical report for each level, covering 34
documented levels in total.

| Level | Primary Security / Technical Focus | Status |
|---|---|---|
| 00 → 01 | Basic Linux file access | Completed |
| 01 → 02 | Special filename handling | Completed |
| 02 → 03 | Filenames containing spaces | Completed |
| 03 → 04 | Hidden files | Completed |
| 04 → 05 | File identification | Completed |
| 05 → 06 | File properties and permissions | Completed |
| 06 → 07 | System-wide file discovery | Completed |
| 07 → 08 | Searching structured text | Completed |
| 08 → 09 | Duplicate/unique data analysis | Completed |
| 09 → 10 | Human-readable strings | Completed |
| 10 → 11 | Base64 decoding | Completed |
| 11 → 12 | Character transformation | Completed |
| 12 → 13 | Multi-layer compression | Completed |
| 13 → 14 | SSH private-key authentication | Completed |
| 14 → 15 | TCP service authentication | Completed |
| 15 → 16 | TLS service interaction | Completed |
| 16 → 17 | Network enumeration and SSH key extraction | Completed |
| 17 → 18 | File comparison | Completed |
| 18 → 19 | Restricted shell / non-interactive SSH | Completed |
| 19 → 20 | SUID privilege-boundary analysis | Completed |
| 20 → 21 | TCP client/server authentication | Completed |
| 21 → 22 | Cron and scheduled execution | Completed |
| 22 → 23 | Automated file processing | Completed |
| 23 → 24 | Cron-executed script analysis | Completed |
| 24 → 25 | Network authentication and input automation | Completed |
| 25 → 26 | Restricted shell and terminal behavior | Completed |
| 26 → 27 | Restricted shell and executable behavior | Completed |
| 27 → 28 | Git repository history | Completed |
| 28 → 29 | Historical Git content | Completed |
| 29 → 30 | Git branches and development data | Completed |
| 30 → 31 | Git tags and repository metadata | Completed |
| 31 → 32 | Git commit and remote interaction | Completed |
| 32 → 33 | Restricted shell and command parsing | Completed |
| 33 | Final completion verification | Completed |

### Completion Summary

- **Levels completed:** Bandit 00 → 33
- **Level reports:** 34
- **Training status:** Completed
- **Documentation status:** All levels documented
- **Sensitive challenge credentials:** Not published

The progress table focuses on the technical and security concepts demonstrated
by each level rather than publishing challenge passwords or authentication
material.

---

## Documentation Structure

The repository uses a structured documentation model designed to make the
training auditable, reproducible, and easy for a technical reviewer or
recruiter to understand.

### Level Reports

Each Bandit level has a dedicated technical report under `overthewire/bandit/`.

The repository contains 34 level reports covering Bandit 00 → 33.

Each report is intended to document:

1. Objective
2. Environment
3. Challenge scenario
4. Initial observations
5. Investigation approach
6. Commands used
7. Command explanations
8. Observed results
9. Technical analysis
10. Security concept
11. Skills demonstrated
12. Defensive / SOC relevance
13. Evidence references
14. Credential-handling considerations
15. Lessons learned
16. Ethical-use scope

The goal is to document not only how a challenge was completed, but also why
a particular investigation method was selected and what broader cybersecurity
concept the exercise demonstrates.

### Cross-Level Knowledge Notes

Broader concepts encountered across multiple challenges are consolidated
under `notes/`.

The knowledge-note collection covers:

- Linux fundamentals
- Networking
- SSH
- TLS
- Privilege escalation

These notes provide cross-level explanations without unnecessarily duplicating
the individual challenge reports.

### Evidence

Evidence references are documented in the individual level reports.
Screenshots may be added selectively to demonstrate important technical
activities without exposing sensitive authentication material.

Evidence is intended to support important technical activities such as:

- Linux filesystem investigation
- File and permission analysis
- Network enumeration
- Service identification
- SSH authentication
- TLS connections
- Restricted-shell behavior
- SUID analysis
- Git investigation

Screenshots are supporting evidence and do not replace the technical
explanation contained in each level report.

### Credential Handling

Challenge passwords, private SSH keys, and other authentication material are
intentionally excluded from the public repository.

Sensitive values are represented as `[REDACTED]` where necessary.

The purpose of this repository is to demonstrate methodology, investigation,
technical reasoning, and security knowledge without exposing authentication
material.

### Documentation Quality Standard

Each level report should clearly distinguish between:

- Observation: what was directly observed.
- Analysis: what the observation means technically.
- Security significance: why the finding matters.
- Evidence: how the result can be verified.
- Defensive relevance: how the concept relates to security operations,
  investigation, or Blue Team work.

This structure makes the documentation easier to audit and evaluate.

### Defensive / SOC Relevance

The Bandit exercises provide foundational experience relevant to security
operations, including:

- Host and filesystem investigation
- Authentication analysis
- Network and service enumeration
- Restricted command execution analysis
- Privilege-boundary analysis
- Sensitive-data exposure awareness
- Evidence-driven investigation
- Linux command-line investigation

These exercises represent foundational laboratory training and are not
presented as equivalent to production SOC experience.

### Ethical Use

All activities documented in this repository were performed within authorized
cybersecurity training environments.

The techniques documented here should only be used against systems for which
explicit authorization has been provided.

### Learning Approach

The training follows a repeatable investigation workflow:

Observe → Enumerate → Form a hypothesis → Test → Analyze → Document evidence
→ Identify the security concept → Connect the finding to defensive security

This approach emphasizes transferable investigation skills rather than
memorization of individual challenge solutions.
