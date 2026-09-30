# SOC / Blue Team

> Security Operations Center analyst notes: detection, alerting, triage, and response.

---

## SOC Analyst Workflow

```
Alert fires
    │
    ▼
1. TRIAGE      Is this a true positive or false positive?
    │
    ▼
2. SCOPE       How far did it spread? What assets affected?
    │
    ▼
3. CONTAIN     Isolate affected hosts, block IOCs
    │
    ▼
4. INVESTIGATE Root cause analysis
    │
    ▼
5. REMEDIATE   Remove persistence, patch vector
    │
    ▼
6. DOCUMENT    Incident report, lessons learned
```

---

## Alert Triage Questions

Every alert: ask these in order:
1. **Is the process/binary legitimate?** Check hash against VirusTotal, LOLBAS
2. **Is the parent process expected?** `cmd.exe` spawned by `winword.exe` → suspicious
3. **Is the network destination known?** Lookup IP/domain in threat intel
4. **Has this user/asset done this before?** Check baseline behavior
5. **What's the blast radius?** Is this one host or many?

---

## Detection Engineering

### Writing a Sigma Rule

```yaml
title: Suspicious certutil Usage
id: e011a729-98a6-4139-b5c4-bf6f6dd8239a
status: stable
description: Detects certutil used to decode files: common malware staging
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\certutil.exe'
        CommandLine|contains:
            - '-decode'
            - '-decodehex'
            - '-urlcache'
    condition: selection
falsepositives:
    - Legitimate certificate operations
level: high
tags:
    - attack.defense_evasion
    - attack.t1140
```

```bash
# Convert Sigma to Splunk / KQL / Elastic
sigma convert -t splunk rule.yml
sigma convert -t kusto rule.yml
```

### Detection Coverage Gap Analysis
```python
# Map your rules against MITRE ATT&CK
# Use https://mitre-attack.github.io/attack-navigator/
# Import your rule technique IDs, see blind spots
```

---

## Common Detection Queries

### PowerShell Encoded Command (Splunk)
```splunk
index=windows EventCode=4688
(CommandLine="*-EncodedCommand*" OR CommandLine="*-enc *" OR CommandLine="*-ec *")
| eval decoded=base64decode(replace(CommandLine,".*-e[nc]* ",""))
| table _time, ComputerName, User, CommandLine, decoded
```

### Suspicious Scheduled Task (KQL)
```kql
SecurityEvent
| where EventID in (4698, 4702)
| extend TaskXML = tostring(EventData)
| where TaskXML has_any ("powershell","cmd","wscript","mshta","http","temp","appdata")
| project TimeGenerated, Computer, Account, TaskXML
```

### Pass-the-Hash Detection
```kql
SecurityEvent
| where EventID == 4624
| where LogonType == 3
| where AuthenticationPackageName == "NTLM"
| where TargetUserName !endswith "$" and TargetUserName != "ANONYMOUS LOGON"
| summarize attempts=count() by TargetUserName, WorkstationName, IpAddress, bin(TimeGenerated,15m)
| where attempts > 3
```

---

## Threat Intelligence Integration

### VirusTotal API
```python
import requests

def vt_lookup(ioc, api_key):
    headers = {"x-apikey": api_key}
    if "/" in ioc:  # URL
        url = f"https://www.virustotal.com/api/v3/urls/{ioc}"
    elif len(ioc) in (32,40,64):  # Hash
        url = f"https://www.virustotal.com/api/v3/files/{ioc}"
    else:  # IP/Domain
        url = f"https://www.virustotal.com/api/v3/ip_addresses/{ioc}"
    r = requests.get(url, headers=headers)
    data = r.json().get("data",{}).get("attributes",{})
    stats = data.get("last_analysis_stats",{})
    return stats.get("malicious",0), stats.get("total",0)

malicious, total = vt_lookup("8.8.8.8", "YOUR_API_KEY")
print(f"{malicious}/{total} engines flagged")
```

### MISP Integration
```python
from pymisp import PyMISP

misp = PyMISP("https://misp.internal", "YOUR_KEY")
results = misp.search(value="192.168.1.100", type_attribute="ip-dst")
for event in results:
    print(event["Event"]["info"], event["Event"]["threat_level_id"])
```

---

## Playbooks

### Phishing Email Triage
```
1. Extract: sender, reply-to, links, attachments
2. Check sender domain: is it spoofed? Check SPF/DKIM/DMARC
3. Detonate links in sandbox (Any.run, urlscan.io)
4. Hash attachments → VirusTotal
5. Search mailboxes for same sender/subject/link (blast radius)
6. Block IOCs in email gateway
7. Notify affected users, reset credentials if clicked
```

### Ransomware Alert
```
1. Isolate the host IMMEDIATELY (network + AV quarantine)
2. Preserve memory dump before shutdown
3. Identify patient zero: check login history, USB, email
4. Find lateral movement: are other hosts encrypted?
5. Identify ransomware family (ID Ransomware tool)
6. Check backups: are they intact and offline?
7. Do NOT pay without legal/leadership approval
```

---

## Tools

| Tool | Purpose |
|------|---------|
| [Elastic SIEM](https://www.elastic.co/security) | Open SIEM with detection rules |
| [Wazuh](https://wazuh.com) | Open XDR: HIDS + log analysis |
| [TheHive](https://thehive-project.org) | Incident response platform |
| [MISP](https://www.misp-project.org) | Threat intel sharing |
| [Sigma](https://github.com/SigmaHQ/sigma) | Detection rules (SIEM-agnostic) |
| [YARA](https://github.com/VirusTotal/yara) | Malware pattern matching |
| [Any.run](https://any.run) | Interactive malware sandbox |
| [urlscan.io](https://urlscan.io) | URL detonation |

---

## Learning Path

1. Blue Team Labs Online / TryHackMe SOC path
2. SANS SEC555 (SIEM with Tactical Analytics)
3. [DetectionLab](https://github.com/clong/DetectionLab): Windows AD lab with Splunk
4. Write 10 Sigma rules: convert to your SIEM, tune false positives
5. Cert: CompTIA CySA+, GCIH (GIAC Certified Incident Handler)
