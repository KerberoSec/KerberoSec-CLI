# 🎄 TryHackMe Advent of Cyber 2024: Day 15: Active Directory

## Objectives 🎯

Day 15 focuses on exploring Active Directory (AD) architecture, investigating a domain controller breach, and identifying suspicious activities using tools like Event Viewer and PowerShell.

### Goals:
1. Understand Active Directory components and their significance.
2. Investigate potential breaches using logs and PowerShell history.
3. Identify suspicious Group Policy Objects (GPOs).

## Steps 🚀

### Step 1: Start the Machines
1. **Deploy the Target Machine**:  
   - Click **Start Machine** to deploy the Active Directory domain controller.
2. **Start the AttackBox**:  
   - Use the credentials provided to connect to the machine using RDP:
     - Username: `WAREVILLE\Administrator`
     - Password: `AOCInvestigations!`

### Step 2: Investigate User Login Events
1. **Open Event Viewer**:  
   - Navigate to **Windows Logs > Security**.
2. **Search for "Glitch_Malware"**:  
   - Use the **Find** feature to locate login events for the `Glitch_Malware` user.
3. **Answer Questions**:  
   - **Q1**: Find the last login date of `Glitch_Malware` (DD/MM/YYYY).  
     **Answer**: `07/11/2024`  
   - **Q2**: Find the Event ID for the login event.  
     **Answer**: `4624`

### Step 3: Review PowerShell History
1. **Locate PowerShell History File**:  
   - Open File Explorer and navigate to:
     ```
     C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
     ```
2. **Search for Enumeration Commands**:  
   - Look for commands related to AD user enumeration.
3. **Answer Question**:  
   - **Q3**: Identify the command used to enumerate AD users.  
     **Answer**:  
     `Get-ADUser -Filter * -Properties MemberOf | Select-Object Name`

### Step 4: Investigate PowerShell Logs
1. **Open PowerShell Logs**:  
   - Navigate to:
     ```
     Application and Services Logs > Windows PowerShell
     ```
2. **Search for Password Commands**:  
   - Use the **Find** feature to locate `$password` entries.
3. **Answer Question**:  
   - **Q4**: Identify the password set for `Glitch_Malware`.  
     **Answer**:  
     `SuperSecretP@ssw0rd!`

### Step 5: Review Group Policy Objects (GPOs)
1. **List All GPOs**:  
   - Open PowerShell and run:
     ```
     Get-GPO -All
     ```
2. **Identify Suspicious GPOs**:  
   - Look for unusual or recently modified GPOs.
3. **Answer Question**:  
   - **Q5**: Name of the installed GPO.  
     **Answer**:  
     `Malicious GPO - Glitch_Malware Persistence`

## Answers ✅

1. **On what day was Glitch_Malware last logged in?**  
   **Answer**: `07/11/2024`

2. **What event ID shows the login of the Glitch_Malware user?**  
   **Answer**: `4624`

3. **What was the command that was used to enumerate Active Directory users?**  
   **Answer**:  
   `Get-ADUser -Filter * -Properties MemberOf | Select-Object Name`

4. **What was Glitch_Malware's set password?**  
   **Answer**: `SuperSecretP@ssw0rd!`

5. **What is the name of the installed GPO?**  
   **Answer**: `Malicious GPO - Glitch_Malware Persistence`

## Lessons Learned 🌟

### Key Takeaways:
1. **Monitoring Logs**:  
   Event Viewer is crucial for identifying suspicious activities like unauthorized logins and unusual commands.
2. **Reviewing PowerShell Usage**:  
   PowerShell history and logs can reveal critical details about attacker activities.
3. **Securing Active Directory**:  
   Regular audits of GPOs and user accounts help detect and mitigate potential breaches.

### Tools and Techniques 🛠️
1. **Event Viewer**:  
   Essential for investigating login events and system activity.
2. **PowerShell**:  
   Powerful for querying AD objects and identifying anomalies.
3. **AD Hardening**:  
   Implementing secure configurations and monitoring policies to prevent exploitation.

## Final Thoughts 🎁

This task highlights the importance of proactive monitoring and auditing in Active Directory environments. By leveraging built-in tools like Event Viewer and PowerShell, defenders can uncover and mitigate threats effectively.

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | **Active Directory**                    | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
