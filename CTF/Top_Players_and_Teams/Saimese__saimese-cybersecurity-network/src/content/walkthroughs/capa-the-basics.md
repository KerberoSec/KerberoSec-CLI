---
title: "TryHackMe: CAPA: The Basics"
date: 2026-01-28
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "Learn to use CAPA to identify malicious capabilities."
---

## Answers

What command-line option would you use if you need to check what other parameters you can use with the tool? Use the shortest format.

**-h**

What command-line options are used to find detailed information on the malware's capabilities? Use the shortest format.

**-v**

What command-line options do you use to find very verbose information about the malware's capabilities? Use the shortest format.

**-vv**

What PowerShell command will you use to read the content of a file?

**Get-Content**

What is the sha256 of cryptbot.bin?

**ae7bc6b6f6ecb206a7b957e4bb86e0d11845c5b2d9f7a00a482bef63b567ce4c**

What is the Technique Identifier of Obfuscated Files or Information?

**T1027**

What is the Sub-Technique Identifier of Obfuscated Files or Information: Indicator Removal from Tools?

**T1027.005**

When CAPA tags a file with this MAEC value, it indicates that it demonstrates behaviour similar to, but not limited to, Activating persistence mechanisms?

**Launcher**

When CAPA tags a file with this MAEC value, it indicates that the file demonstrates behaviour similar to, but not limited to, Fetching additional payloads or resources from the internet?

**Downloader**

What serves as a catalogue of malware objectives and behaviours?

**Malware Behavior Catalogue**

Which field is based on ATT&CK tactics in the context of malware behaviour?

**Objective**

What is the Identifier of "Create Process" micro-behavior?

**C0017**

What is the behaviour with an Identifier of B0009?

**Virtual Machine Detection**

Malware can be used to obfuscate data using base64 and XOR. What is the related micro-behavior for this?

**Encode Data**

Which micro-behavior refers to "Malware is capable of initiating HTTP communications"?

**HTTP Communication**

Which top-level Namespace contains a set of rules specifically designed to detect behaviours, including obfuscation, packing, and anti-debugging techniques exhibited by malware to evade analysis?

**anti-analysis**

Which namespace contains rules to detect virtual machine (VM) environments? Note that this is not the TLN or Top-Level Namespace.

**anti-vm/vm-detection**

Which Top-Level Namespace contains rules related to behaviours associated with maintaining access or persistence within a compromised system? This namespace is focused on understanding how malware can establish and maintain a presence within a compromised environment, allowing it to persist and carry out malicious activities over an extended period.

**Persistence**

Which namespace addresses techniques such as String Encryption, Code Obfuscation, Packing, and Anti-Debugging Tricks, which conceal or obscure the true purpose of the code?

**Obfuscation**

Which Top-Level Namespace Is a staging ground for rules that are not quite polished?

**Nursery**

What rule yaml file was matched if the Capability or rule name is check HTTP status code?

**check-http-status-code.ymlcheck-http-status-code.yml**

What is the name of the Capability if the rule YAML file is reference-anti-vm-strings.yml?

**reference anti-VM strings**

Which TLN or Top-Level Namespace includes the Capability or rule name run PowerShell expression?

**Load-code**

Check the conditions inside the check-for-windows-sandbox-via-registry.yml rule file from this link. What is the value of the API that ends in Ex is it looking for?

**RegOpenKeyEx**

Which parameter allows you to output the result of CAPA into a .json file?

**-j**

What tool allows you to interactively explore CAPA results in your web browser?

**CAPA Web Explorer**

Which feature of this CAPA Web Explorer allows you to filter options or results?

**Global Search Box**

## Things You Should Know

**Syntax**

**-h** :Help message that shows info and exit (Example Syntax: capa -h)

**-v** :Enables verbose result document (Example Syntax: capa.exe .\cryptbot.bin -v)

**-vv** :Enables very verbose result document (Example Syntax: capa.exe .\cryptbot.bin -vv)

**Get-Content**: A PowerShell command that allows you to read the content of a file

### CAPA Results

**MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge)**

This framework functions as a strategic playbook that provides detailed insights into attackers methods from gaining initial access to maintaining a presence, escalating priviledges, evading defenses, moving laterally within a network, and more.

**MAEC (Malware Attribute Enumeration and Characterization)**

This is a specialized language designed to encode and communicate complex details concerning malware that contains a wide variety of attributes, including behaviors, artefacts, and interconnections among various instances of malware.

The table below shows the most commonly used MAEC values by CAPA

|MAEC Value|Description|
|Launcher|Exhibits behaviors that trigger specific actions similar to malware behavior|
|Downloader|Exhibits Behaviors wherein it downloads and execute other files, usually seen on more complex malware|

### Malware Behavior Catalogue (MBC)

The MBC is designed to support various aspects of malware analysis, such as labelling, similarity analysis, and standardized reporting. Its basically a catalogue of malware objectives and behaviors.
