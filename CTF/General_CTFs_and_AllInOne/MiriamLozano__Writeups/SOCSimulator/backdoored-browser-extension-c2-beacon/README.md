# Write-up: Backdoored Browser Extension: Following the C2 Beacon

![Platform](https://img.shields.io/badge/Platform-SOCSimulator-blue?style=flat-square)
![Difficulty](https://img.shields.io/badge/Difficulty-Easy-brightgreen?style=flat-square)
![Role](https://img.shields.io/badge/Role-SOC_Analyst-8A2BE2?style=flat-square)
![Category](https://img.shields.io/badge/Category-Incident_Investigation-critical?style=flat-square)

**Author:** Miriam Lozano

**Date:** 14/08/2026

---------------------
## Scenario summary

A Chrome productivity extension was silently trojanized after an auto-update on a workstation. The new version introduced two scripts: one to fetch instructions from a C2 domain, and the other one to steal session cookies and API tokens directly from the browser.

The attack did not drop malicious files on the disk (fileless), using only legitimate HTTPS traffic to exfiltrate data to a VULTR server. Consequently, the only trail is found in the proxy and firewall logs. The aim of this laboratory is to trace the incident within SIEM records to identify the beacon, credential theft and exfiltration.

## Objectives and challenges
- Identify the initial attack vector.
- Trace the C2 beaconing pattern and identify the C2 domain.
- Pinpoint the IP destination where the session tokens were exfiltrated.
- Identify the script fingerprints to confirm the infection.
- Locate the key the data was stored under in the Chrome extension to determine if hosts in the estate have been compromised.
- Map the attack techniques to the MITRE ATT&CK framework.

## Walkthrough

### 1. Identification of the C2 Beacon

Following log analysis, **medium** and **high-severity** events were identified targeting two malicious IP addresses. The traffic consisted of **GET** requests to which the server responded successfully (HTTP 200), establishing a consistent communication pattern.

- **Identified Domain:** graphqlnetwork.pro

- **Temporal Evidence:** These events occurred immediately following the automatic extension update.

*[Image: Logs from SIEM]*

### 2. Detection of Data Exfiltration
Anomalous activity was detected within the Chrome browser where an injected script accessed and read cookies from the active tab. Subsequently, two **POST** requests matching data exfiltration to an external server were identified:

- **Destination IP:** 149.248.2.160
- **Data Volume:** The first transfer contained 7,340 bytes, followed by a second of 2,210 bytes.

*[Image: Exfiltration logs]*
>**Note**: While the IP address has been identified, it should not be relied upon as a permanent Indicator of Compromise (IoC), as it is likely dynamic and subject to rapid change.

### 3. Estate-Wide Sweep Strategy
To verify if other hosts in the environment have been compromised, it is necessary to search for the **fingerprints** of the malicious scripts injected into the browser.

- Priority Action: Furthermore, locating the specific **storage key** used to cache the extension's configuration within Chrome is crucial. This will significantly accelerate the detection process and confirm whether other endpoints have been infected, even if they did not generate network traffic toward the C2 at the time of analysis.

## Timeline reconstruction

| **Hour** | **severity** | **Source**         | **event**                                                                  |
|----------|--------------|--------------------|----------------------------------------------------------------------------|
| 13:43:00 | info         | windows-chrome     | extension-update                                                           |
| 13:46:00 | medium       | web-proxy          | extension component fetched JSON config over HTTPS                         |
| 13:46:00 | critical     | edr-file-inventory | new file in chrome extension                                               |
| 13:46:00 | critical     | edr-file-inventory | new file in chrome extension                                               |
| 13:52:00 | high         | web-proxy          | fetch instructions from a second IP                                         |
| 14:06:00 | high         | windows-chrome     | Injected content script. Read cookie store and session token for active tab |
| 14:09:00 | critical     | web-proxy          | exfiltrating data to the server (POST)                                     |
| 14:09:00 | critical     | web-proxy          | exfiltrating data to the server (POST)                                     |

## IOCs

 - script fingerprint: b0827dc54349b10098a7370ada4ea44ba668b264ccca2db5676be1c32e6cc154
 - IP destination address: 149.248.2.160
 - C2 domain: graphqlnetwork.pro
 - Storage key: graphqlnetwork_ext_manage

## MITRE ATT&CK Techniques

```T1539 : Steal Web Session Cookie ```

## Proposed incident response

To enrich this write-up, I want to suggest the remediation and mitigation for this incident.

1. Isolate the host from the network immediately to prevent lateral movement.
2. Block the C2 domain and IP address in the firewall and web proxy to cut off communication.
3. Revoke the tokens for the affected users to invalidate them and force a new login session.
4. Perform an automated search across all endpoints using the malicious script fingerprints and the specific Chrome Local Storage key.
5. Remove and uninstall the infected extension via group policy or EDR.
6. Audit all browser extensions the company trusts and remove those with excessive permissions.
7. Educate users about the risks of installing unverified browser extensions.

## Lesson learned

- Since there are no changes on the disk, this attack can only be detected through the web proxy and firewall data.
- This type of attack does not require knowing the password or the username because it steals the browser access token, bypassing even the MFA.

## Skills developed

- Reading HTTPS alerts from a SIEM logger
- Mapping attacks to the MITRE ATT&CK framework

## References

MITRE ATT&CK PAGE [https://attack.mitre.org/]

SOCSimulator: The Backdoored Browser Extension: Following the C2 Beacon [https://www.socsimulator.com/training-operations/malicious-chrome-extension-cookie-theft-walkthrough]
