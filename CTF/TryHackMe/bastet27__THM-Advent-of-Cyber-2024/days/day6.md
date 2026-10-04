# 🎄 TryHackMe Advent of Cyber 2024: Day 6: Sandboxes and Malware Analysis Challenge

## Objectives 🎯

1. Detect and analyze malware behavior in a sandbox environment.  
2. Use YARA rules to identify malicious patterns and events.  
3. Decode obfuscated data using FLOSS to uncover hidden information.

## Steps 🚀

### Detecting Malware in the Sandbox
1. **Start the EDR Tool:**  
   - Open PowerShell, navigate to `C:\Tools`, and run:  
     ```
     .\JingleBells.ps1
     ```
   - This script monitors system events and triggers alerts on suspicious activities.

2. **Execute the Malware:**  
   - Navigate to `C:\Tools\Malware`.  
   - Double-click `MerryChristmas.exe` to simulate a malware event.

3. **Observe the Alert:**  
   - The EDR tool displays a popup with the first flag.

**Flag Found:** `THM{GlitchWasHere}`

### Extracting Obfuscated Strings with FLOSS
1. **Run FLOSS to Analyze Malware:**  
   - Open PowerShell and navigate to `C:\Tools\FLOSS`.  
   - Execute the command:  
     ```
     floss.exe C:\Tools\Malware\MerryChristmas.exe | Out-File C:\tools\malstrings.txt
     ```

2. **Analyze the Output:**  
   - Open the generated file `malstrings.txt` in a text editor.  
   - Use `CTRL+F` to search for the string **Mayor Malware**, revealing the second flag.

**Flag Found:** `THM{HiddenClue}`

## Key Findings 🔑

1. **Proactive Malware Detection:**  
   - The sandbox environment provided a safe space to execute and analyze malware behavior without risking system compromise.  

2. **Revealing Obfuscated Data:**  
   - FLOSS effectively extracted hidden strings and commands from obfuscated malware, aiding in analysis.  

3. **YARA Rule Efficiency:**  
   - YARA rules detected specific malicious behaviors, ensuring early identification of potential threats.

## Lessons Learned 🌟

1. **Evasion Techniques:**  
   - Malware developers use obfuscation and encoded payloads to bypass basic detection methods, highlighting the importance of advanced tools like FLOSS.

2. **Layered Defense Strategy:**  
   - Combining sandboxes, YARA rules, and real-time monitoring tools enhances threat detection and minimizes risks.

3. **Continuous Improvement:**  
   - Regularly updating detection mechanisms and practicing malware analysis is critical to staying ahead of evolving threats.

### Tools and Techniques 🛠️

1. **YARA:** Created and applied rules to detect specific malicious patterns.  
2. **FLOSS:** Decoded obfuscated strings to uncover hidden commands.  
3. **Sysmon:** Provided detailed logs for event monitoring and analysis.  

## Final Thoughts 🎁

Day 6 reinforced the value of sandbox environments for safe malware analysis. By leveraging tools like FLOSS and YARA, we gained insight into evasion techniques and improved detection capabilities. This challenge highlighted the importance of layered defenses and proactive threat hunting to counter ever-evolving adversaries.

### Answers ✅

1. **What is the flag displayed in the popup window after the EDR detects the malware?**  
   **Answer:** `THM{GlitchWasHere}`  

2. **What is the flag found in the malstrings.txt document after running FLOSS?**  
   **Answer:** `THM{HiddenClue}`  

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | **Sandboxes**                          | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
