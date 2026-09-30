# 08: Defensive Recommendations

| Phase | Attacker activity | Possible log | Detection method | Defense |
| ----- | ----------------- | ------------ | ---------------- | ------- |
| Discovery | Host discovery | Firewall, IDS | Multiple probes in a short period | Segmentation and IDS alerts |
| Web enumeration | Directory discovery | Web access/error logs | Many 404/403 responses | Rate limiting, WAF, remove unused files |
| Source review | Hidden HTML clue | Web access logs | Normal GET request | Do not store secrets in comments |
| SMB enumeration | Anonymous listing | SMB logs | Guest/anonymous sessions | Disable guest, require SMB signing |
| Panel login | Credential testing | Webmin/MiniServ logs, auth.log | Failed/successful login correlation | MFA, IP allowlist, strong passwords |
| Local escalation | Not verified | auth.log, journal, process logs | Abnormal sudo/SUID/cron changes | Least privilege and file-integrity monitoring |

MITRE ATT&CK mapping is educational analysis; unverified techniques are not asserted as confirmed behavior.
