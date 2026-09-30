# 🎄 TryHackMe Advent of Cyber 2024: Day 16: Azure Key Vault

## Objectives 🎯

Day 16 explores an Azure tenant breach investigation and emphasizes the importance of securing cloud resources, particularly Azure Key Vault and Entra ID.

### Goals:
1. Understand Azure services like Azure Key Vault and Microsoft Entra ID.
2. Learn how to use Azure Cloud Shell and Azure CLI for tenant enumeration.
3. Investigate and identify a potential security breach.

## Steps 🚀

### Step 1: Connect to the Azure Portal
1. **Start Lab**:
   - Click the **Cloud Details** button to generate credentials.
   - Use the **Open Lab** button to navigate to the Azure Portal login page.
2. **Log in**:
   - Enter the provided credentials.
   - Skip MFA configuration and welcome messages.
3. **Launch Azure Cloud Shell**:
   - Click the terminal icon in the Azure Portal.
   - Select **Bash** for the command-line environment.
   - Use the **No storage account required** option to proceed.

### Step 2: Enumerate Users and Groups
1. **List Users**:
   ```
   az ad user list --filter "startsWith('wvusr-', displayName)"
   ```
   - Locate the user `wvusr-backupware` and note the leaked password.
   - **Answer**: `R3c0v3r_s3cr3ts!`

2. **List Groups**:
   ```
   az ad group list
   ```
   - Identify the **Secret Recovery Group** and its ID.
   - **Answer**: `7d96660a-02e1-4112-9515-1762d0cb66b7`

3. **List Group Members**:
   ```
   az ad group member list --group "Secret Recovery Group"
   ```

### Step 3: Verify Role Assignments
1. **Check Role Assignments**:
   ```
   az role assignment list --assignee REPLACE_WITH_SECRET_RECOVERY_GROUP_ID --all
   ```
   - Confirm roles assigned to the **Secret Recovery Group**:
     - `Key Vault Reader`
     - `Key Vault Secrets User`

### Step 4: Investigate Azure Key Vault
1. **List Accessible Key Vaults**:
   ```
   az keyvault list
   ```
   - Identify the key vault: `warevillesecrets`.

2. **List Vault Secrets**:
   ```
   az keyvault secret list --vault-name warevillesecrets
   ```
   - Find the secret name: `aoc2024`.
   - **Answer**: `aoc2024`

3. **Retrieve Secret Contents**:
   ```
   az keyvault secret show --vault-name warevillesecrets --name aoc2024
   ```
   - Extract the secret value: `WhereIsMyMind1999`.
   - **Answer**: `WhereIsMyMind1999`

## Answers ✅

1. **What is the password for backupware that was leaked?**  
   **Answer**: `R3c0v3r_s3cr3ts!`

2. **What is the group ID of the Secret Recovery Group?**  
   **Answer**: `7d96660a-02e1-4112-9515-1762d0cb66b7`

3. **What is the name of the vault secret?**  
   **Answer**: `aoc2024`

4. **What are the contents of the secret stored in the vault?**  
   **Answer**: `WhereIsMyMind1999`

5. **Liked today’s task?**  
   No answer needed.

## Lessons Learned 🌟

### Key Takeaways:
1. **Azure Enumeration**:  
   Enumerating users, groups, and role assignments is essential to understanding privilege levels and potential attack vectors.
2. **Azure Key Vault Security**:  
   Misconfigurations in role assignments can lead to unauthorized access to sensitive data.
3. **Logging and Monitoring**:  
   Always enable and review logs to detect suspicious activities and prevent data breaches.

### Tools and Techniques 🛠️
1. **Azure CLI**:  
   A powerful command-line tool for managing Azure resources.
2. **Azure Cloud Shell**:  
   Convenient for performing administrative tasks without additional setup.
3. **Role Assignments**:  
   Critical for controlling access to Azure resources.

## Final Thoughts 🎁

Today’s task demonstrates the importance of proper configuration and role management in Azure environments. By securing sensitive resources like Azure Key Vault, organizations can prevent unauthorized access and potential data breaches.

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | **Azure Exploitation**                  | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
