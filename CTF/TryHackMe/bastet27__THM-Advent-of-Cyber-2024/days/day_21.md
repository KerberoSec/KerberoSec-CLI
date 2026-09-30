# 🎄 TryHackMe Advent of Cyber 2024: Day 21: Reverse Engineering

## Objectives 🎯
- Understand the structure of a binary file.
- Differentiate between disassembly and decompiling.
- Familiarize with multi-stage binaries and their behavior.
- Reverse-engineer a multi-stage binary to uncover its functionality.

## Steps 🚀
1. **Analyze the Binary with PEStudio:**
   - Open PEStudio and load the `WarevilleApp.exe` located at `C:\Users\Administrator\Desktop\`.
   - Extract key metadata, such as file hashes, sections, and indicators, to understand the binary's structure.

2. **Decompile the Binary with ILSpy:**
   - Open ILSpy and load `WarevilleApp.exe`.
   - Explore the decompiled code to understand the main function and any critical operations performed by the binary.

3. **Inspect the Binary Execution:**
   - Execute `WarevilleApp.exe` in the sandbox environment and monitor its actions.
   - Note any files downloaded, created, or executed during its runtime.

4. **Identify Stages of Execution:**
   - Investigate the second-stage binary downloaded to the `Downloads` folder.
   - Analyze the actions performed by the second-stage binary, such as file creation and C2 communication.

5. **Track C2 Server Communication:**
   - Use decompilation and execution observations to identify the C2 server and data exfiltration methods.

## Key Findings 🔑
- **Stage 1 Binary (`WarevilleApp.exe`):**
  - The main function, `DownloadAndExecuteFile`, downloads and executes a secondary binary, `explorer.exe`.
  - The file is downloaded from the domain `mayorc2.thm`.

- **Stage 2 Binary (`explorer.exe`):**
  - Creates a zip file, `CollectedFiles.zip`, containing victim's computer data.
  - Attempts to upload the zip file to the C2 server `anonymousc2.thm`.

## Lessons Learned 🌟
- **Binary Analysis:** Tools like PEStudio and ILSpy are essential for static analysis and understanding binary behavior.
- **Multi-Stage Binaries:** Multi-stage binaries complicate analysis and detection, making reverse engineering critical.
- **Controlled Execution:** Running binaries in a sandbox environment allows for safe observation of malicious behaviors.

### Tools and Techniques 🛠️
- **PEStudio:** For static analysis of Windows binaries, including metadata and indicators.
- **ILSpy:** For decompiling .NET binaries to understand the high-level logic.
- **Sandbox Environment:** Safe execution of suspicious binaries for behavioral analysis.

## Final Thoughts 🎁
This task provided valuable insights into reverse engineering techniques, including static and dynamic analysis. By decompiling and executing the binary in a sandbox, we uncovered its malicious actions and C2 communication.

### Answers ✅
1. **What is the function name that downloads and executes files in the WarevilleApp.exe?**  
   `DownloadAndExecuteFile`
2. **Once you execute the WarevilleApp.exe, it downloads another binary to the Downloads folder. What is the name of the binary?**  
   `explorer.exe`
3. **What domain name is the one from where the file is downloaded after running WarevilleApp.exe?**  
   `mayorc2.thm`
4. **The stage 2 binary is executed automatically and creates a zip file comprising the victim's computer data; what is the name of the zip file?**  
   `CollectedFiles.zip`
5. **What is the name of the C2 server where the stage 2 binary tries to upload files?**  
   `anonymousc2.thm`

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | **Reverse Engineering**                  |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
