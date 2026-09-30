# Incident Response Report

**Incident:** [Incident Name]  
**Date Detected:** [DD/MM/YYYY]  
**Date Resolved:** [DD/MM/YYYY]  
**Analyst:** [Your Name]  
**Severity:** [Low / Medium / High / Critical]  
**Status:** [Open / Contained / Resolved]

---

## 1. Executive Summary

### Incident Overview

On **[date]**, a security incident was identified involving **[system / account / application]**.

The incident was related to **[malware / compromised account / suspicious login / data exposure / phishing / unauthorized access]**.

### Business Impact

The incident affected:

- [System / application]
- [User / account]
- [Data]
- [Service availability]

### Current Status

**Status:** [Contained / Eradicated / Recovered]

[Brief explanation of the current situation.]

---

## 2. Scope and Objectives

### Affected Systems

| Asset | Type | Status |
|---|---|---|
| [System] | [Server / Endpoint / Cloud] | [Affected] |
| [System] | [Database / Application] | [Affected] |

### Objectives

The investigation aimed to:

- Determine what happened.
- Identify affected systems.
- Determine how the incident occurred.
- Contain the incident.
- Remove the threat.
- Restore affected systems.
- Identify ways to prevent recurrence.

---

# 3. Incident Timeline

| Date/Time | Event |
|---|---|
| [Time] | Suspicious activity detected |
| [Time] | Investigation started |
| [Time] | Affected system identified |
| [Time] | Account/system contained |
| [Time] | Threat removed |
| [Time] | Recovery started |
| [Time] | Incident resolved |

---

# 4. Detection

### How Was the Incident Detected?

The incident was detected through:

- [SIEM alert]
- [EDR alert]
- [User report]
- [Log analysis]
- [Security monitoring]

### Initial Indicators

The following suspicious activity was observed:

```text
[IP address]
[Domain]
[File hash]
[Username]
[Process]
[URL]
```

---

# 5. Investigation

## 5.1 Initial Findings

[Describe what was discovered first.]

Example:

> A suspicious login was detected from an unusual IP address. Further investigation showed multiple authentication attempts followed by a successful login.

## 5.2 Evidence Collected

The investigation used:

- System logs
- Authentication logs
- Firewall logs
- EDR alerts
- Network traffic
- File hashes
- Screenshots

### Evidence

[Insert screenshot]

**Figure 1: [Description]**

---

# 6. Indicators of Compromise

| Type | Indicator | Description |
|---|---|---|
| IP | [IP] | Suspicious source |
| Domain | [Domain] | Malicious domain |
| Hash | [SHA256] | Suspicious file |
| User | [Username] | Compromised account |
| File | [Filename] | Malicious/suspicious file |

---

# 7. Containment

The following actions were taken to limit the incident:

- [Disabled compromised account]
- [Isolated affected endpoint]
- [Blocked malicious IP]
- [Blocked malicious domain]
- [Removed unauthorized access]
- [Reset credentials]

### Result

[Explain whether the threat was successfully contained.]

---

# 8. Eradication

The following actions were performed to remove the cause of the incident:

- [Removed malware]
- [Deleted malicious files]
- [Removed persistence]
- [Patched vulnerability]
- [Reset credentials]
- [Removed unauthorized accounts]

### Root Cause

The primary cause of the incident was:

**[Root cause]**

Example:

> The incident was caused by a compromised user account using a weak password.

---

# 9. Recovery

Recovery actions included:

- [Restored affected system]
- [Reinstalled system]
- [Restored backup]
- [Changed credentials]
- [Applied security patches]
- [Verified system integrity]

### Recovery Status

**Status:** [Completed / In Progress]

[Explain what was restored and how the environment was validated.]

---

# 10. Lessons Learned

The incident highlighted the following security improvements:

### What Went Well

- [Detection worked correctly]
- [Response team acted quickly]
- [Backups were available]

### What Could Be Improved

- [Improve monitoring]
- [Improve password policy]
- [Improve patch management]
- [Improve logging]
- [Improve incident response procedures]

---

# 11. Recommendations

Recommended actions:

### Immediate

- [Action]
- [Action]

### Short Term

- [Action]
- [Action]

### Long Term

- [Action]
- [Action]

---

# 12. Conclusion

The investigation determined that **[brief explanation of incident]**.

The incident affected **[systems/users/data]** and resulted in **[impact]**.

The threat was **[contained/removed/resolved]**, and recovery activities were completed.

Additional security improvements are recommended to reduce the likelihood of a similar incident occurring again.

---

# 13. Appendix

## Tools Used

| Tool | Purpose |
|---|---|
| Wazuh | Security monitoring |
| Wireshark | Network analysis |
| VirusTotal | File/URL analysis |
| [Tool] | [Purpose] |

## Relevant Commands

```bash
[command]
```

```bash
[command]
```

## Additional Evidence

[Logs, screenshots, alerts, hashes, investigation notes, etc.]