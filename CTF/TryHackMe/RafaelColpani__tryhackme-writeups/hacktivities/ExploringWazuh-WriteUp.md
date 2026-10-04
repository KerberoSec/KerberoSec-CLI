> **Platform:** TryHackMe
> **Room:** Exploring Wazuh
> **Category:** SIEM
> **Tools Used:** Wazuh

# Exploring Wazuh

**Date:** 2026-08-17

## Description

> Explore Wazuh: an all-in-one and free security solution.

## Task 1: Let's get started!

No answer needed.

## Task 2: Start the VM and let's go!

No answer needed.

## Task 3: Wazuh Agents

The first task was to check the status of the agents managed by Wazuh.

**Question:** What is the status of the agents managed by this Wazuh?

<details>
<summary>Click for the answer</summary>

**Answer:** Disconnected

</details>

After that, I opened the Windows agent to inspect its system information.

**Question:** What is the CPU field value?

<details>
<summary>Click for the answer</summary>

**Answer:** AMD EPYC 7571

</details>

## Task 4: IT Hygiene and Configuration Assessment

I opened the Windows agent and navigated to the **IT Hygiene** tab. Under **Software > Packages**, I checked the installed software.

**Question:** What custom text editor is installed there?

<details>
<summary>Click for the answer</summary>

**Answer:** Notepad++

</details>

Next, I opened the Linux agent and navigated to the **Configuration Assessment** tab.

The tab provides information about the agent's compliance with security benchmarks.

**Question:** What is the CIS Benchmark score of the Linux agent?

<details>
<summary>Click for the answer</summary>

**Answer:** 46%

</details>

## Task 5: Vulnerabilities

The next task focused on vulnerabilities detected by Wazuh.

For the Windows agent, I checked the vulnerabilities associated with **Notepad++** and looked for the most recent CVE.

**Question:** What is the latest Notepad++ vulnerability found on the Windows agent?

<details>
<summary>Click for the answer</summary>

**Answer:** CVE-2026-25926

</details>

For the Linux agent, I checked the critical vulnerabilities and looked for the earliest one.

**Question:** What is the earliest critical vulnerability found on the Linux agent?

<details>
<summary>Click for the answer</summary>

**Answer:** CVE-2021-3773

</details>

## Task 6: Defender Alerts and Demo Dashboard

I navigated to **Discover** and searched for Windows Defender alerts from the last five years.

The following query can be used:

```text
data.win.system.eventID: 1116
```

This event ID is associated with Windows Defender malware detection events.

**Question:** What is the threat name of the detected malware?

<details>
<summary>Click for the answer</summary>

**Answer:** Trojan:Win32/CobaltStrike.PU!MTB

</details>

After that, I opened the **Demo Dashboard** to inspect the overall event data.

**Question:** How many total events are shown?

<details>
<summary>Click for the answer</summary>

**Answer:** 5495

</details>

## Task 7: Wazuh Rules and Decoders

Wazuh uses **decoders** to process raw log data and extract structured fields from it. This allows Wazuh to understand and analyze information contained in different types of logs.

**Question:** How do you call the Wazuh element that extracts fields from raw logs?

<details>
<summary>Click for the answer</summary>

**Answer:** Decoder

</details>

Wazuh rules have different severity levels. A higher `rule.level` indicates a more severe alert.

**Question:** What Wazuh alert is more critical, the one with `rule.level` set to **10** or **15**?

<details>
<summary>Click for the answer</summary>

**Answer:** 15

</details>

## Task 8: Home Lab

The room recommends trying the different Wazuh features in a personal home lab.

No answer needed.

## Task 9: Complete the Room!

The room is now complete.

No answer needed.

## Conclusion

This room provided an introduction to **Wazuh** and its capabilities as a security monitoring platform.

During the room, I explored Wazuh agents, IT Hygiene, Configuration Assessment, vulnerability detection, Windows Defender alerts, dashboards, decoders, and alert severity levels.

Some of the key concepts covered were:

* **Agents**: endpoints monitored by Wazuh.
* **IT Hygiene**: information about installed software and packages.
* **Configuration Assessment**: security configuration and CIS Benchmark compliance.
* **Vulnerability Detection**: identification of vulnerabilities and associated CVEs.
* **Alerts**: security events detected and analyzed by Wazuh.
* **Decoders**: components that extract structured fields from raw logs.
* **Rules**: determine how events are classified and assigned severity levels.

Overall, this room was a useful introduction to Wazuh and its role in security monitoring and SIEM environments.
