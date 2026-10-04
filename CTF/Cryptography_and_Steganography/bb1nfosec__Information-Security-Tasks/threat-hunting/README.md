# Threat Hunting

> Proactively searching for adversaries already inside the network: before alerts fire.

---

## Hunting vs. Detection

| Detection (reactive) | Threat Hunting (proactive) |
|----------------------|---------------------------|
| Waits for alert to fire | Assumes breach, looks for evidence |
| Alert-driven | Hypothesis-driven |
| Covers known TTPs | Finds unknown/novel TTPs |
| SIEM/EDR automated | Analyst-led investigation |

**Core assumption:** the attacker is already in. Hunting asks *where*.

---

## The Hunting Loop

```
1. HYPOTHESIS  →  "LOLBins being used to avoid AV"
2. COLLECT     →  Process creation, network, registry logs
3. INVESTIGATE →  Query, pivot, correlate anomalies
4. IMPROVE     →  Escalate confirmed threat → convert to detection rule
```

---

## Key Data Sources

| Source | What it catches |
|--------|----------------|
| Sysmon Event 1 (process create) | Malware execution, LOLBins |
| Sysmon Event 3 (network connect) | C2, lateral movement |
| DNS queries | C2 DGA, data exfil via DNS |
| PowerShell Event 4104 | Script-based attacks |
| WMI Events 19/20/21 | Persistence, lateral movement |
| Auth logs 4624/4625/4648 | Pass-the-hash, spray |

---

## LOLBin Hunt (KQL)

```kql
DeviceProcessEvents
| where FileName in~ ("certutil.exe","mshta.exe","regsvr32.exe",
                      "rundll32.exe","wscript.exe","bitsadmin.exe","wmic.exe")
| where ProcessCommandLine has_any ("http","ftp","\\\\","base64","decode")
| project Timestamp, DeviceName, AccountName, FileName, ProcessCommandLine
| order by Timestamp desc
```

---

## Lateral Movement Hunt (KQL)

```kql
// Pass-the-Hash: NTLM LogonType 3
SecurityEvent
| where EventID == 4624 and LogonType == 3
| where AuthenticationPackageName == "NTLM"
| where TargetUserName !endswith "$"
| summarize count() by TargetUserName, IpAddress, bin(TimeGenerated, 1h)
| where count_ > 5
```

---

## Beacon Detection (Python)

```python
import pandas as pd
from scipy.stats import variation

logs = pd.read_csv("proxy_logs.csv", parse_dates=["timestamp"])
grouped = logs.groupby(["src_ip","dst_domain"])["timestamp"]

def beacon_score(times):
    if len(times) < 5: return 0
    deltas = times.sort_values().diff().dropna().dt.total_seconds()
    return 1 - variation(deltas) if variation(deltas) < 2 else 0

suspects = grouped.apply(beacon_score).reset_index(name="score")
print(suspects[suspects.score > 0.85].sort_values("score", ascending=False))
```

---

## C2 DNS Tunnel Hunt

```kql
// High-entropy / long subdomain names → DGA / DNS tunnel
DnsEvents
| extend sub = tostring(split(Name, ".")[0])
| where strlen(sub) > 20
| where Name !has "microsoft" and Name !has "google"
| summarize count() by Name, ClientIP
| order by count_ desc
```

```bash
# Oversized TXT records in PCAP
tshark -r cap.pcap -Y "dns.qry.type==16" \
  -T fields -e dns.qry.name -e dns.txt | awk 'length($2)>50'
```

---

## MITRE ATT&CK Coverage

| Tactic | Priority Techniques |
|--------|-------------------|
| Execution | T1059 PowerShell, T1047 WMI, T1053 Scheduled Task |
| Persistence | T1547 Registry run keys, T1543 Services |
| Credential Access | T1003 LSASS dump, T1558.003 Kerberoasting |
| Lateral Movement | T1021.002 PsExec, T1021.006 WMI remote |
| C2 | T1071.001 HTTP beacon, T1071.004 DNS tunnel |
| Exfiltration | T1048.003 DNS exfil, T1074 staged |

---

## Tools

| Tool | Purpose |
|------|---------|
| [Velociraptor](https://github.com/Velocidex/velociraptor) | Hunt at scale across endpoints |
| [Hayabusa](https://github.com/Yamato-Security/hayabusa) | Fast Windows event log hunting |
| [chainsaw](https://github.com/WithSecureLabs/chainsaw) | Rapid Windows artefact triage |
| [Sigma](https://github.com/SigmaHQ/sigma) | Generic detection rules → any SIEM |
| [RITA](https://github.com/activecm/rita) | Beacon + DNS tunnel detection |
| [HELK](https://github.com/Cyb3rWard0g/HELK) | Hunting ELK stack |
| [DetectionLab](https://github.com/clong/DetectionLab) | Pre-built AD lab for practice |

---

## Practice Datasets

- [BOTS v3](https://github.com/splunk/botsv3): Splunk Boss of the SOC
- [EVTX Attack Samples](https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES): real attack event logs
- [PCAP Samples](https://www.malware-traffic-analysis.net): malware C2 captures
