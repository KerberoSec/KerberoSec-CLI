# Host Artifacts

## Definition

Artifacts left behind on an endpoint after malware execution.

## Examples

- Registry keys
- Scheduled tasks
- File paths
- Services

## Detection Methods

- EDR solutions
- Windows Event Logs
- Sysmon
- Wazuh

## Advantages

- Harder for attackers to change consistently.

## Limitations

- May vary across malware versions.

## MITRE ATT&CK Relevance

Persistence and execution techniques.

## SOC Use Case

Analysts discover malware persistence through a suspicious scheduled task.
