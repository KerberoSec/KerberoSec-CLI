---
title: "Volt Typhoon: Retracing an APT with Splunk"
room: "Volt Typhoon"
platform: TryHackMe
url: https://tryhackme.com/room/volttyphoon
difficulty: Medium
date_solved: 2026-07-11
time_to_solve: "≈40m"
tags: [splunk, dfir, threat-hunting, apt, living-off-the-land]
cves: []
flags: { blue_team: true }
flagship: true
order: 30
---

A blue-team Splunk investigation of a **Volt Typhoon** intrusion: a Chinese state APT known for *living-off-the-land*. Across two weeks of logs you retrace the full kill chain: initial access via **Zoho ManageEngine ADSelfService Plus**, account takeover, LOLBin recon, AD database theft, credential access with mimikatz, C2, collection, and anti-forensics.

## Method
The room is pure log analysis: the "exploit" is knowing Volt Typhoon's TTPs (MITRE ATT&CK) and turning them into SPL. Each phase is a search over a specific sourcetype; the skill is pairing APT research with Splunk query craft.

## The kill chain (reconstructed)
- **Initial access: ADSelfService Plus.** Comb the ADSelfService logs for the takeover: a legitimate user's (Dean's) password is changed and their account seized (ISO-8601 timestamp recovered from the `action_name` = *Password Change* event). Shortly after, the attacker creates a **new administrator account** for persistence.
- **Discovery (LOLBins).** Classic living-off-the-land: a single `wmic /node:` call enumerates local drives across **server01 & server02** (`logicaldisk get caption, filesystem, freespace, size, volumename`).
- **AD database theft.** `ntdsutil` snapshots the AD database (`ntds.dit`), it's staged to a web server and compressed into a **password-protected archive** (the password is recoverable from the command line in the logs).
- **Persistence.** A **base64-encoded web shell** is dropped (planted under `C:\Windows\Temp\`).
- **Defense evasion.** RDP "Most Recently Used" registry traces are wiped with the **`Remove-ItemProperty`** PowerShell cmdlet; the earlier archive is **renamed + re-extensioned** to a `.gif` to blend in; a `HKLM\SYSTEM\CurrentControlSet\Control` key is queried to sniff for a virtualized (sandbox) environment.
- **Credential access.** `reg query` hunts saved creds in three tools (**OpenSSH, PuTTY, RealVNC**); a base64-decoded PowerShell one-liner **downloads and runs mimikatz** (`Invoke-WebRequest` → `Start-Process` with `sekurlsa::minidump lsass.dmp`).
- **Enumeration & collection.** `wevtutil` enumerates Windows logs for specific event IDs (`4624 / 4625 / 4769`); lateral movement to server-02 copies the web shell to a new name; three financial `.csv` files are copied out with PowerShell.
- **C2 & cleanup.** `netsh` sets up a port-proxy for C2 (a specific connect IP:port); finally the four Windows event-log channels (**Application, Security, Setup, System**) are cleared.

## Findings
All answers (the takeover timestamp, the new admin account, the `wmic`/mimikatz command lines, the archive password, the web-shell path, the netsh proxy, etc.) were recovered directly from the log data via targeted SPL. Exact values masked here per THM convention: the value is the *method*.

## The Lesson
Volt Typhoon barely uses malware: it's `wmic`, `ntdsutil`, `reg`, `wevtutil`, `netsh`, PowerShell. Detection isn't signature-matching; it's spotting *legitimate* tools used in *illegitimate* sequences. The APT research (their known LOLBin playbook) is as load-bearing as the Splunk skill: you can only query for what you know to look for.

