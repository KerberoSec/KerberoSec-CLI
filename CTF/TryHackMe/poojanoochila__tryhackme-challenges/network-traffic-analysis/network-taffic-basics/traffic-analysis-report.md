# Traffic Analysis Investigation Report

## Incident Summary

A workstation user clicked a phishing link which triggered an HTTP request to download a malicious PowerShell script.

---

## Investigation Objectives

- Capture network traffic
- Analyze HTTP communications
- Identify malicious payload
- Extract evidence

---

## Findings

### Network Path

Workstation → Firewall → Internet

### Capture Location

Network tap placed between workstation and firewall.

### Observed Activity

- HTTP communication detected
- Malicious PowerShell script downloaded
- Payload identified within HTTP response

---

## Security Impact

Successful malware delivery through phishing activity.

Potential risks:

- Initial Access
- Malware Execution
- Persistence
- Command and Control Communication

---

## Recommendations

- Enforce web filtering
- Monitor PowerShell activity
- Inspect HTTP downloads
- Implement phishing awareness training
- Deploy network monitoring solutions

---

## Conclusion

The investigation demonstrated how network traffic analysis can identify malicious downloads and provide visibility into attacker activity.
