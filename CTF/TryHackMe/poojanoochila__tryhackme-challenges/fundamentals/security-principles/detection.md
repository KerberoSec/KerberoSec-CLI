# Detection Scenarios Based on Security Principles

## 1. Confidentiality Breach

- Attack: Unauthorized data access / credential theft
- Indicators:
  - Multiple failed login attempts
  - Login from unusual location or device
- Log Source:
  - Authentication logs
- SOC Action:
  - Trigger alert
  - Enforce MFA
  - Investigate account activity

---

## 2. Integrity Violation

- Attack: File tampering / data manipulation
- Indicators:
  - File hash mismatch
  - Unexpected configuration changes
- Log Source:
  - File Integrity Monitoring (FIM)
  - System logs
- SOC Action:
  - Compare file hashes
  - Restore original files
  - Investigate unauthorized changes

---

## 3. Availability Attack

- Attack: DDoS / service disruption
- Indicators:
  - Sudden spike in traffic
  - Server downtime or slow response
- Log Source:
  - Network traffic logs
- SOC Action:
  - Block malicious IPs
  - Apply rate limiting
  - Escalate incident

---

## 4. Privilege Abuse (Least Privilege Violation)

- Attack: Unauthorized privilege escalation
- Indicators:
  - User gaining admin rights unexpectedly
- Log Source:
  - Access control logs
- SOC Action:
  - Revoke elevated privileges
  - Investigate user activity

---

## 5. Bypassing Defense Layers (Defense in Depth Failure)

- Attack: Multi-stage intrusion
- Indicators:
  - Alerts across multiple systems (endpoint + network)
- Log Source:
  - SIEM correlation
- SOC Action:
  - Correlate alerts
  - Identify attack chain
  - Contain affected systems
