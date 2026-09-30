# Hash Values

## Definition

A hash value is a unique fingerprint generated from a file using algorithms such as MD5, SHA1, or SHA256.

## Examples

- MD5
- SHA1
- SHA256

Example:

SHA256:
44d88612fea8a8f36de82e1278abb02f

## Detection Methods

- Antivirus solutions
- EDR platforms
- VirusTotal lookups
- Threat intelligence feeds

## Advantages

- Easy to search
- Precise identification

## Limitations

- Attackers can modify files slightly to generate new hashes.
- Very low operational cost for attackers.

## MITRE ATT&CK Relevance

Useful during malware identification and triage.

## SOC Use Case

An alert contains a file hash. Analysts check VirusTotal to determine whether the file is malicious.
