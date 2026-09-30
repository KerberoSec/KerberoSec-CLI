# Detection Scenarios: Security Engineer Perspective

## 1. Brute Force Attack
- Indicator: Multiple failed login attempts
- Log Source: Authentication logs
- SOC Action:
  - Trigger alert
  - Block source IP
  - Investigate affected accounts

## 2. Suspicious Login Activity
- Indicator: Login from unusual location or time
- Log Source: Authentication + geo-location logs
- SOC Action:
  - Verify user activity
  - Enforce MFA
  - Flag as potential account compromise

## 3. Malware Infection
- Indicator: Unknown process execution, unusual outbound traffic
- Log Source: Endpoint logs, EDR tools
- SOC Action:
  - Isolate system
  - Analyze process behavior
  - Remove malicious files

## 4. Data Exfiltration
- Indicator: Large outbound data transfer
- Log Source: Network traffic logs
- SOC Action:
  - Block suspicious connections
  - Investigate destination IP
  - Escalate incident

## 5. Privilege Escalation
- Indicator: Sudden admin-level access
- Log Source: System and authentication logs
- SOC Action:
  - Verify access legitimacy
  - Revoke privileges if unauthorized
  - Investigate root cause
