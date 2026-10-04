# OverTheWire Bandit: Level Reports

This directory contains my technical documentation for the OverTheWire
Bandit wargame, covering **Bandit 00 → 33**.

The purpose of these reports is to document practical cybersecurity
investigation skills rather than simply record challenge completion.

## Coverage

The reports cover:

- Linux command-line investigation
- Filesystem navigation and discovery
- File permissions and ownership
- Hidden and unusual filenames
- Text processing and pattern matching
- Encoding and decoding
- Compression and archive analysis
- TCP services and network enumeration
- SSH authentication
- SSH private-key handling
- TLS/SSL service interaction
- Restricted shell analysis
- SUID and privilege-boundary analysis
- Cron and scheduled execution
- Shell scripting
- Git repository and history analysis
- Git branch and tag analysis
- Source-control security
- Basic privilege-escalation concepts

## Reports

| Level | Focus |
|---|---|
| 00 → 01 | Basic Linux file access |
| 01 → 02 | Special filename handling |
| 02 → 03 | Filenames containing spaces |
| 03 → 04 | Hidden files |
| 04 → 05 | File identification |
| 05 → 06 | File properties and permissions |
| 06 → 07 | System-wide file discovery |
| 07 → 08 | Targeted text search |
| 08 → 09 | Unique and duplicate data analysis |
| 09 → 10 | Human-readable strings |
| 10 → 11 | Base64 decoding |
| 11 → 12 | Character transformation |
| 12 → 13 | Multi-layer compression |
| 13 → 14 | SSH private-key authentication |
| 14 → 15 | TCP service authentication |
| 15 → 16 | TLS service interaction |
| 16 → 17 | Network enumeration and SSH key extraction |
| 17 → 18 | File comparison |
| 18 → 19 | Restricted SSH environment |
| 19 → 20 | SUID privilege escalation |
| 20 → 21 | TCP client/server authentication |
| 21 → 22 | Cron and scheduled execution |
| 22 → 23 | Automated file processing |
| 23 → 24 | Cron-executed script analysis |
| 24 → 25 | Network authentication and input automation |
| 25 → 26 | Restricted shell and terminal behavior |
| 26 → 27 | Restricted shell and executable behavior |
| 27 → 28 | Git repository history |
| 28 → 29 | Historical Git content |
| 29 → 30 | Git branches and development data |
| 30 → 31 | Git tags and repository metadata |
| 31 → 32 | Git commit and remote interaction |
| 32 → 33 | Restricted shell and command parsing |
| 33 | Final completion verification |

## Report Structure

Where applicable, individual reports document:

1. Objective
2. Investigation approach
3. Commands and observations
4. Technical analysis
5. Security concepts
6. SOC / Blue Team relevance
7. MITRE ATT&CK relevance
8. Evidence references
9. Credential-handling considerations
10. Learning outcome
11. Ethical-use scope

The level reports intentionally avoid publishing challenge passwords,
private SSH keys, tokens, or other authentication material.

## Defensive Perspective

Although Bandit is a CTF training environment, the exercises provide
transferable foundations for defensive security work.

Examples include:

- Investigating suspicious Linux activity
- Understanding authentication behavior
- Identifying exposed services
- Reviewing file permissions
- Recognizing privilege-boundary weaknesses
- Understanding scheduled execution
- Investigating shell behavior
- Reviewing Git history for sensitive-data exposure
- Connecting technical activity to detection opportunities

## Ethical Scope

All activities documented here were performed within the authorized
OverTheWire Bandit training environment.

The techniques described should only be used against systems for which
explicit authorization has been provided.

## Related Notes

Cross-level concepts are consolidated in:

- `notes/linux.md`
- `notes/networking.md`
- `notes/ssh.md`
- `notes/tls.md`
- `notes/privilege-escalation.md`
