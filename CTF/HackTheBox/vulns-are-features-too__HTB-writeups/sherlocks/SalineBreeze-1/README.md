# SalineBreeze-1

## 1. Starting with the MITRE ATT&CK page, which country is thought be behind Salt Typhoon?

[Salt Typhoon](https://attack.mitre.org/groups/G1045/)

> **ANSWER:** China

## 2. According to that page, Salt Typhoon has been active since at least when? (Year)

> **ANSWER:** 2019

## 3. What kind of infrastructure does Salt Typhoon target?

> **ANSWER:** Network

## 4. Salt Typhoon has been associated with multiple custom built malware, what is the name of the malware associated with the ID S1206?

> **ANSWER:** JumbledPath

## 5. What operating system does this malware target?

[JumbledPath](attack.mitre.org/software/S1206)

> **ANSWER:** Linux

## 6. What programming language is the malware written in?

> **ANSWER:** Go

## 7. On which vendor's devices does the malware act as a network sniffer?

> **ANSWER:** Cisco

## 8. The malware can perform 'Indicator Removal' by erasing logs. What is the MITRE ATT&CK ID for this?

> **ANSWER:** [T1070.002](https://attack.mitre.org/techniques/T1070/002/)

## 9. On December 20th, 2024, Picus Security released a blog on Salt Typhoon detailing some of the CVEs associated with the threat actor. What was the CVE for the vulnerability related to the Sophos Firewall?

[Salt Typhoon: A Persistent Threat to Global Telecommunications Infrastructure](www.picussecurity.com/resource/blog/salt-typhoon-telecommunications-threat)

> **ANSWER:** CVE-2022-3236

## 10. The blog demonstrates how the group modifies the registry to obtain persistence with a backdoor known as Crowdoor. Which registry key do they target?

Modify Registry: MITRE T1112

> **ANSWER:** `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`

## 11. What is the MITRE ATT&CK ID of the previous technique?

> **ANSWER:** T1112

## 12. On November 25th, 2024, TrendMicro published a blog post detailing the threat actor. What name does this blog primarily use to refer to the group?

[Game of Emperor: Unveiling Long Term Earth Estries Cyber Intrusions](https://www.trendmicro.com/en_vn/research/24/k/earth-estries.html)

> **ANSWER:** Earth Estries

## 13. The blog post identifies additional malware attributed to the threat actor. Which malware do they describe as a 'multi-modular backdoor...using a custom protocol protected by Transport Layer Security'

> **ANSWER:** GHOSTSPIDER

## 14. Most of the domains the malware communicates with have a .com top-level domain. One uses a .dev TLD. What is the full domain name for the .dev TLD?

From "Campaign Beta" image

> **ANSWER:** `telcom.grishamarkovgf8936.workers.dev`

## 15. What is the filename for the first GET request to the C&C server used by the malware?

From "Communication protocol" section

> **ANSWER:** `index.php`

## 16. On September 30th, 2021, a blog post was released on Securelist by Kaspersky. What was the threat actor's name at that time?

[GhostEmperor: From ProxyLogon to kernel mode](https://securelist.com/ghostemperor-from-proxylogon-to-kernel-mode/104407/)

> **ANSWER:** GhostEmperor

## 17. What is the name of the malware that this article focuses on?

> **ANSWER:** Demodex

## 18. What type of malware is the above malware?

> **ANSWER:** rootkit

## 19. The first stage consists of a malicious PowerShell dropper. What type of encryption is used to obfuscate the code?

Section "Infection chain overview", figure "Initial stage comprised of encrypted PowerShell code that is decrypted based on an attacker-provided AES key during run time"

> **ANSWER:** AES

## 20. The malware uses Input/Output Control codes to perform various tasks related to hiding malicious artifacts. What is the IOCTL code used by the malware to hide its service from the list within the services.exe process address space?

> **ANSWER:** 0x220300
