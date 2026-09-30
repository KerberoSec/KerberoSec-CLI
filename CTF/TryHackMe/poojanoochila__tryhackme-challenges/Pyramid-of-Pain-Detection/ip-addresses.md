# IP Addresses

## Definition

An IP address identifies a host on a network.

## Examples

- 185.220.101.1
- 45.33.32.156

## Detection Methods

- Firewall logs
- IDS/IPS
- SIEM correlation
- Threat intelligence feeds

## Advantages

- Easy to block
- Useful for identifying C2 infrastructure

## Limitations

- Attackers can quickly change servers.
- Cloud providers allow rapid IP rotation.

## MITRE ATT&CK Relevance

Command and Control infrastructure.

## SOC Use Case

Analysts investigate outbound connections to known malicious IPs.
