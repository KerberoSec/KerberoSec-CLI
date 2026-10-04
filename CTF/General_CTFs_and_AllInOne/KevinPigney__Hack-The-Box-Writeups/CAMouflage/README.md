### Introduction

This write-up documents my partial investigation of the **CAMouflage** Sherlock challenge on Hack The Box. I did not 100% complete this one, but the triage portion of the case still provided a useful DFIR workflow around Windows execution artifacts, disguised archive files, obfuscated batch logic, native binary abuse, and AutoIt-based payload execution.

Rather than forcing a complete answer guide, I am documenting the investigative path I followed, what I was able to validate, and where the analysis became more malware-reverse-engineering focused than expected.

### Tools Used

- EvtxECmd.exe
- PECmd.exe
- MFTECmd.exe
- bstrings.exe
- VirusTotal
- PEStudio
- PowerShell / CMD hashing

<br>

# CAMouflage Sherlock: DFIR Triage Write-up

**Hack The Box Initial Information:**

A newly launched campaign was observed targeting users through cracked applications. An alert was generated for unusual behavior on a user laptop, requiring host-based investigation to determine the root cause and suspicious activity chain.

<br>

**Executive Summary**

The investigation identified suspicious execution of a cracked application named `DOWNLOAD MASTERCAM X9 FULL CR`, which first ran on `2025-06-21 18:34:19`. Shortly after execution, suspicious `.wp5` files appeared under the Administrator user's Temp directory.

One of these files, `Play.wp5`, was determined to be a disguised Cabinet archive rather than a legitimate `.wp5` file. Prefetch evidence showed execution of `extrac32.exe`, a native Windows utility used to extract Cabinet files, shortly after the cracked installer ran. This supported the assessment that the malware used `extrac32.exe` to extract staged payload components from `Play.wp5`.

Further analysis showed that the unpacked `mysql.wp5` was not a normal `.wp5` file either. It was an obfuscated batch script that renamed or executed as `Mysql.wp5.bat`. After resolving the batch variables, the script revealed that it created a `448887` directory, rebuilt a renamed AutoIt interpreter named `Moscow.com`, concatenated multiple disguised `.wp5` chunks into a runtime-generated payload named `K`, and launched it using `Moscow.com K`.

Although I did not fully complete the final C2-domain task, the available evidence strongly supports a malware execution chain involving a cracked software lure, disguised file extensions, Cabinet extraction, obfuscated batch execution, payload reconstruction, and AutoIt-based execution.

<br>

**Initial Execution and Browser Activity**

I began by reviewing Prefetch since the scenario involved suspicious host activity after a cracked application was executed. Prefetch showed that the application DOWNLOAD MASTERCAM X9 FULL CR first ran at:

2025-06-21 18:34:19

To validate whether this execution aligned with user-driven activity, I also reviewed the user’s browser history using DB Browser for SQLite. The browser history showed several Bing searches for terms such as mastercam download for free and mastercam x9 full crack, along with visits to sites associated with cracked software downloads, including khophanmem[.]vn, fancli[.]com, media.cloud839v1[.]cfd, and filecr[.]com. This supported the assessment that the user was actively searching for and interacting with cracked Mastercam-related download sources before the suspicious executable ran.

This correlation between browser search history and Prefetch execution helped establish the likely initial access path: the user searched for cracked Mastercam software, downloaded or interacted with a suspicious installer, and then executed the cracked application.

<br>

**Suspicious Temp File Activity**

After correlating execution with `$MFT` activity, I observed suspicious files being created under:

```text
C:\Users\Administrator\AppData\Local\Temp\
```

Several of these files used the `.wp5` extension. One file, `Play.wp5`, stood out due to its larger size. After inspecting and submitting it to VirusTotal, I identified it as an obfuscated Cabinet archive rather than a legitimate `.wp5` document.

<br>

**Cabinet Extraction via extrac32.exe**

Reviewing Prefetch again, I identified execution of:

```text
extrac32.exe
```

This was significant because `extrac32.exe` is a legitimate Windows binary used to extract Cabinet archives. In this context, its execution shortly after the cracked installer and alongside `Play.wp5` strongly suggested native binary abuse.

The likely extraction command was functionally equivalent to:

```cmd
extrac32 /Y Play.wp5 *.*
```

This activity is consistent with the malware using a legitimate Windows utility to extract disguised payload components from the `.wp5` Cabinet archive.

<br>

**Obfuscated Batch Script: mysql.wp5**

Another suspicious file, `mysql.wp5`, was later identified as an obfuscated batch script. `$MFT` evidence showed it was renamed to or executed as:

```text
Mysql.wp5.bat
```

VirusTotal and manual review showed that the script searched for security-related process strings, including:

```text
bdservicehost
SophosHealth
AvastUI
AVGUI
nsWscSvc
ekrn
```

While reviewing the `MOSCOW.COM` Prefetch artifact, I noticed that the files loaded section referenced: `C:\Users\Administrator\AppData\Local\Temp\448887\K`

This stood out because K was not present as a normal file in the extracted archive or active Temp directory. The $UsnJrnl later helped explain this behavior by showing that K was created, written to, closed, and then deleted shortly after execution. This suggested that K was a short-lived runtime artifact rather than a static file included directly in the archive.

Further review of mysql.wp5 explained this behavior. The script used many junk lines and variable substitutions to hide the real commands. After resolving the variables, the important behavior became clear: the batch script changed into the 448887 directory and used copy /b to concatenate several disguised .wp5 chunks into a single payload named K.

The reconstructed command was:

```cmd
copy /b Runner.wp5+Art.wp5+Gba.wp5+Romania.wp5+Refugees.wp5+Authorization.wp5+Lock.wp5 K
```

The `/b` flag means binary mode, so the files were joined byte-for-byte rather than treated as text. This explained why `K` appeared in Prefetch and the USN Journal but was not present in the original archive as a standalone file.

<br>

**AutoIt Payload Execution**

After rebuilding `K`, the batch script launched:

```cmd
Moscow.com K
```

`Moscow.com` was later identified as a renamed AutoIt interpreter. Its original filename was:

```text
AutoIt3.exe
```

This was confirmed through VirusTotal and PEStudio metadata. The behavior indicates that `Moscow.com` acted as the AutoIt runtime, while `K` was the compiled AutoIt payload loaded by that process.

<br>

**Attack Chain Summary**

1. User executed cracked software named `DOWNLOAD MASTERCAM X9 FULL CR`
2. Suspicious `.wp5` files were created in the Administrator Temp directory
3. `Play.wp5` was identified as a disguised Cabinet archive
4. `extrac32.exe` was used to extract the Cabinet contents
5. `mysql.wp5` was identified as an obfuscated batch script
6. The batch script checked for security products
7. The batch script rebuilt `Moscow.com`
8. The batch script concatenated multiple `.wp5` chunks into `K`
9. `Moscow.com` was identified as renamed `AutoIt3.exe`
10. The payload was launched using `Moscow.com K`

<br>

**MITRE ATT&CK Mapping**

| Tactic | Technique | Evidence |
|---|---|---|
| Initial Access | User Execution: `T1204` | Cracked application executed by the user |
| Defense Evasion | Masquerading: `T1036` | `.wp5` files used to disguise CAB, batch, and payload chunks |
| Defense Evasion | System Binary Proxy Execution: `T1218` | `extrac32.exe` used to extract disguised Cabinet archive |
| Execution | Command and Scripting Interpreter: Windows Command Shell: `T1059.003` | `mysql.wp5` executed as an obfuscated batch script |
| Defense Evasion | Obfuscated Files or Information: `T1027` | Batch variables and chunked payload reconstruction |
| Execution | Command and Scripting Interpreter: AutoIt: `T1059` | `Moscow.com` identified as renamed AutoIt interpreter loading `K` |

<br>

**Limitations**

I did not fully complete the final C2-domain task. The investigation reached the point where the remaining analysis appeared to require deeper AutoIt payload decompilation or malware reverse engineering. In a real-world incident response scenario, I would expect the C2 domain to be identified through DNS, proxy, firewall, EDR/XDR, or SIEM telemetry before relying on decompilation of the payload.

Because of this, I am treating this report as a triage write-up rather than a complete Sherlock walkthrough.

<br>

**Lessons Learned**

This case was a useful reminder that file extensions should not be trusted. Multiple `.wp5` files were used to hide very different types of content, including a Cabinet archive, a batch script, and binary payload chunks.

The most valuable artifacts in this investigation were Prefetch, `$MFT`, and `$UsnJrnl`. Prefetch helped confirm execution and file references, while `$MFT` and `$UsnJrnl` helped explain the creation and deletion of runtime-generated files like `K`.

The biggest takeaway was how staged malware can use simple native Windows behavior, such as `extrac32.exe` and `copy /b`, to hide a more complex payload chain behind misleading filenames and runtime reconstruction.

<br>

**Final Assessment**

The evidence supports that the host executed a cracked application that staged and executed a disguised malware chain. The malware used `.wp5` extensions to camouflage multiple file types, abused `extrac32.exe` to extract a Cabinet archive, executed an obfuscated batch script, rebuilt a runtime payload named `K`, and launched that payload through a renamed AutoIt interpreter named `Moscow.com`.

Overall confidence for the host execution and payload reconstruction chain is **High**. Confidence for command-and-control details is **Low**, because the final C2-domain task was not completed and no supporting network artifact was identified in the reviewed collection.
