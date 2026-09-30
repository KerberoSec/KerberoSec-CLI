# Detection Strategy: SSTI in Flask Applications

## Overview
Server-Side Template Injection (SSTI) can be detected by monitoring abnormal input patterns and application behavior.

---

## Indicators of Compromise (IoCs)

- Presence of template syntax in requests:
  - {{ }}
- Unusual query parameters
- Repeated probing attempts with varying payload structures
- Unexpected server-side errors (HTTP 500)

---

## Log Sources

- Web server access logs
- Application logs
- Error logs

---

## Detection Techniques

### Pattern-Based Detection
- Flag requests containing template expression syntax
- Monitor suspicious characters in input fields

### Behavioral Detection
- Identify abnormal request frequency
- Detect deviation from normal user behavior

---

## Example Detection Logic

- Alert if request contains:
  - "{{" AND "}}"
- Alert on repeated malformed requests within short intervals

---

## MITRE ATT&CK Mapping

- T1190: Exploit Public-Facing Application
- T1059: Command and Scripting Interpreter

---

## SOC Recommendations

- Implement Web Application Firewall (WAF) rules
- Enable detailed logging for web applications
- Monitor and alert on anomaly patterns
- Correlate events across multiple log sources
