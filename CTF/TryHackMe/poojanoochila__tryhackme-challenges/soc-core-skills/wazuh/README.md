# 🔐 Wazuh: SIEM & XDR (TryHackMe)

## 📌 Overview
Wazuh is an open-source **SIEM (Security Information and Event Management)** and **XDR (Extended Detection and Response)** platform used in SOC environments for **centralized log collection, correlation, threat detection, and incident response**.

This room demonstrates how security teams monitor endpoints, analyze logs, and detect threats in real time using a **rule-based detection engine**.

---

## 🎯 Learning Objectives
- Understand Wazuh architecture (Manager, Agent, ELK Stack)
- Perform log collection and normalization
- Analyze alerts and rule-based detections
- Explore HIDS (Host-based Intrusion Detection System)
- Investigate events via dashboard

---

## 🏗️ Architecture

Agent → Manager → Elasticsearch → Kibana

- **Wazuh Agent** → Collects logs from endpoints  
- **Wazuh Manager** → Analyzes logs using rules  
- **Elasticsearch** → Stores processed logs  
- **Kibana** → Visualizes alerts and events  

---

## ⚙️ Key Features

### 🔍 Log Analysis
- Aggregates logs from multiple sources
- Normalizes and parses data
- Detects anomalies using rules

### 🚨 Alerting
- Rule-based detection engine
- Alerts assigned severity levels

### 🛡️ HIDS
- Detects suspicious endpoint activity
- Monitors system behavior

### 📁 File Integrity Monitoring (FIM)
- Tracks file changes
- Detects unauthorized modifications

### 🐞 Vulnerability Detection
- Identifies known CVEs
- Helps prioritize patching

---

## 🧪 Hands-on Tasks
- Navigated Kibana dashboard
- Analyzed alerts and logs
- Investigated rule triggers
- Observed agent-manager workflow

---

## 🧩 SOC Mapping

| SOC Task              | Wazuh Feature        |
|-----------------------|---------------------|
| Log Collection        | Agents              |
| Correlation           | Rule Engine         |
| Detection             | SIEM + HIDS         |
| Monitoring            | Kibana              |
| Investigation         | Log Analysis        |

---

## 🚀 Key Takeaways
- Centralized logging improves visibility
- Rule-based detection enables early threat detection
- Wazuh simulates real SOC workflows
- Strong foundation for SIEM tools

---

## 🏁 Conclusion
This room provides practical exposure to a **real-world SIEM/XDR platform**, helping build essential SOC analyst skills such as **log analysis, alert triage, and threat detection**.
