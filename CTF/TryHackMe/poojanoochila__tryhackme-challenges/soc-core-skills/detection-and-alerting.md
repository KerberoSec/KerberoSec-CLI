# Detection and Alerting

## Detection Rules

Rules define conditions for identifying threats.

---

## Example Rules

- Failed logins > 5 → Alert
- Successful login after failures → Alert
- USB insertion → Alert
- High outbound traffic → Data exfiltration alert

---

## Detection Rule Example

### Event Log Cleared

IF:
- Log Source = WinEventLog
- Event ID = 104

THEN:
- Trigger alert

---

### Suspicious Command Execution

IF:
- Event ID = 4688
- Process = whoami

THEN:
- Trigger alert

---

## Key Concept

Detection rules rely on **field-value pairs** from normalized logs.
