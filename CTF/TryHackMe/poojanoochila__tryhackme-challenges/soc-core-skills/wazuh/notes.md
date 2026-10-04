# 🧠 Wazuh Notes

## 🔹 Detection Logic
- Based on **rule matching**
- Logs are compared against predefined rules
- Alerts generated with severity levels

---

## 🚨 Alert Severity
- 0-3 → Informational  
- 4-7 → Low  
- 8-12 → Medium  
- 13+ → High  

---

## 📁 Log Sources
- System logs (Linux/Windows)
- Authentication logs
- Application logs
- Security events

---

## 🛡️ HIDS
- Monitors endpoint activity
- Detects:
  - Unauthorized access
  - Suspicious processes
  - Privilege escalation

---

## 📂 FIM
- Detects file changes
- Tracks:
  - File creation
  - File modification
  - File deletion

---

## 🐞 Vulnerability Detection
- Matches system data with CVEs
- Identifies outdated software

---

## 🔗 Workflow
1. Agent collects logs  
2. Sends to Manager  
3. Manager applies rules  
4. Alerts generated  
5. Stored in Elasticsearch  
6. Visualized in Kibana  

---

## 🧪 SOC Investigation Flow
1. Alert triggered  
2. Check severity  
3. Analyze logs  
4. Identify source  
5. Correlate events  
6. Decide impact  
7. Respond  

---

## 🎯 Keywords
SIEM, XDR, HIDS, FIM, Log Correlation, Alert Triage, Threat Detection
