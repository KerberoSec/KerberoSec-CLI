# 🎄 TryHackMe Advent of Cyber 2024: Day 4: Atomic Red Team

## Objectives 🎯

1. Identify artifacts created by a simulated spear-phishing attack.
2. Explore MITRE ATT&CK techniques and sub-techniques.
3. Simulate a ransomware attack and analyze the artifacts generated.
4. Create a detection rule to address gaps in monitoring and detection.

## Steps 🚀

### Step 1: Spear-Phishing Simulation

#### Running the Test
1. Executed the spear-phishing simulation using:
   ```
   Invoke-AtomicTest T1566.001 -TestNumbers 1
   ```
2. Located the generated file in:
   ```
   C:\Users\Administrator\AppData\Local\Temp\
   ```

#### Results
- **Flag found in the phishing artifact directory:**  
  **Answer:** `THM{GlitchTestingForSpearphishing}`

### Step 2: Exploring MITRE ATT&CK Techniques

#### Technique and Sub-Technique
1. **Identified the relevant technique ID:**  
   **Answer:** `T1059`
2. **Identified the sub-technique ID for Windows Command Shell:**  
   **Answer:** `T1059.003`

### Step 3: Simulating a Ransomware Attack

#### Running the Test
1. Displayed the details of the ransomware test using:
   ```
   Invoke-AtomicTest T1059.003 -ShowDetails
   ```
   - **Name of the Test:**  
     **Answer:** `Simulate BlackByte Ransomware Print Bombing`
   - **Name of the File Used:**  
     **Answer:** `Wareville_Ransomware.txt`
2. Simulated the ransomware attack:
   ```
   Invoke-AtomicTest T1059.003 -TestNumbers 4
   ```
3. Located the flag in the output.

#### Results
- **Flag from the ransomware simulation:**  
  **Answer:** `THM{R2xpdGNoIGlzIG5vdCB0aGUgZW5lbXk=}`

## Key Findings 🔑

1. **Spear-Phishing Artifacts:** The simulation created an artifact in a known location with a clear indicator of compromise.
2. **Windows Command Shell Usage:** The attack leveraged PowerShell commands, highlighting the need for robust process monitoring.
3. **Ransomware Activity:** The simulated ransomware created identifiable artifacts that can inform detection strategies.

## Lessons Learned 🌟

### MITRE ATT&CK Framework
- Provides a structured way to understand attacker behaviors and map them to defensive strategies.

### Threat Simulation Benefits
- **Gaps in Detection:** Simulations reveal blind spots in current monitoring setups.
- **Custom Detection Rules:** Artifacts from simulations can directly inform the creation of new detection rules.

### Crafting Effective Defenses
- Monitor suspicious PowerShell activity (`Invoke-WebRequest` is a red flag).
- Keep logs from tools like Sysmon centralized for analysis.

### Tools and Techniques 🛠️

1. **[Atomic Red Team](https://github.com/redcanaryco/atomic-red-team):** Conducted tests emulating adversarial techniques.  
2. **[MITRE ATT&CK](https://attack.mitre.org/):** Referenced techniques and sub-techniques for detailed analysis.  
3. **Sysmon:** Monitored processes and network connections during simulations.  
4. **Windows Event Viewer:** Analyzed logs and events generated during the attack.  

## Final Thoughts 🎁

Day 4 showcased the value of adversary emulation in identifying and addressing detection gaps. Simulating attacks like spear-phishing and ransomware provided critical insights into how attackers operate and how defenders can build stronger detection and prevention mechanisms. Combining tools like Atomic Red Team with MITRE ATT&CK offers a powerful approach to improving security posture.

### Answers ✅

1. **Flag found in the phishing artifact directory:**  
   **Answer:** `THM{GlitchTestingForSpearphishing}`
2. **What ATT&CK technique ID would be our point of interest?**  
   **Answer:** `T1059`
3. **What ATT&CK sub-technique ID focuses on the Windows Command Shell?**  
   **Answer:** `T1059.003`
4. **What is the name of the Atomic Test to be simulated?**  
   **Answer:** `Simulate BlackByte Ransomware Print Bombing`
5. **What is the name of the file used in the test?**  
   **Answer:** `Wareville_Ransomware.txt`
6. **What is the flag found from this Atomic Test?**  
   **Answer:** `THM{R2xpdGNoIGlzIG5vdCB0aGUgZW5lbXk=}`

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | **Atomic Red Team**                    | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
