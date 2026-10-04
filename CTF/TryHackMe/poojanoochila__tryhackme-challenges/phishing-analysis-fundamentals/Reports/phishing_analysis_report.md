# Phishing Email Analysis Report

## Executive Summary

A phishing email was analyzed to identify indicators of compromise and determine whether the message was malicious.

---

## Findings

### Suspicious Sender

- Sender address differed from the legitimate organization.
- Domain showed signs of spoofing.

### Social Engineering Indicators

- Urgent language used.
- Requested immediate action.
- Attempted to create panic.

### URL Analysis

- Hyperlinks redirected to suspicious domains.
- Domain reputation checks indicated risk.

### Email Authentication

- SPF: Failed/Investigated
- DKIM: Checked
- DMARC: Reviewed

---

## Indicators of Compromise

| Type | Indicator |
|--------|----------|
| Domain | example-phish.com |
| URL | hxxp://malicious-site[.]com |
| Email | attacker@example.com |

---

## Conclusion

The email displayed multiple phishing characteristics including sender spoofing, suspicious links, and social engineering tactics. The message should be classified as malicious and blocked.
