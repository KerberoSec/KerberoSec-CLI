# 🎄 TryHackMe Advent of Cyber 2024: Day 2: Log Analysis Challenge

## Objectives 🎯

Day 2 focused on log analysis: a critical skill for any SOC analyst. The challenge involved:
1. Setting up Elastic SIEM to filter and analyze logs.
2. Identifying suspicious activity, such as failed login attempts and encoded commands.
3. Investigating the actions of key characters, Glitch and Mayor Malware, to determine their intent.

## Steps 🚀

### Step 1: Setting Up Elastic SIEM
1. Logged into Elastic SIEM with the provided credentials:
   - **Username:** elastic  
   - **Password:** elastic  
2. Accessed the **Discover** tab and adjusted the timeframe to:
   ```
   00:00 Nov 29, 2024: 23:30 Dec 1, 2024
   ```
3. Added the following fields to the filters:
   - `host.hostname`
   - `source.ip`
   - `user.name`
   - `process.command_line`
   - `event.outcome`

With Elastic SIEM ready, I began filtering and analyzing the logs.

### Step 2: Investigating the Logs

#### **Q1: What is the name of the account causing all the failed login attempts?**
- Query:
  ```
  event.outcome : failure
  ```
- Result:
  The `user.name` field identified the culprit.

**Answer:** `service_admin`

#### **Q2: How many failed logon attempts were observed?**
- Query:
  ```
  event.outcome : failure
  ```
- Result:
  The total hits displayed at the top-left corner of the Elastic SIEM chart.

**Answer:** `6791`

#### **Q3: What is the IP address of Glitch?**
- Query:
  ```
  host.hostname : ADM-01
  ```
- Result:
  The `source.ip` field from successful login events revealed the IP.

**Answer:** `10.0.255.1`

#### **Q4: When did Glitch successfully log on to ADM-01?**
- Query:
  ```
  host.hostname : ADM-01 and event.outcome : success
  ```
- Result:
  The `@timestamp` field indicated the login time.

**Answer:** `Dec 1, 2024 @ 08:54:39.0`

#### **Q5: What is the decoded command executed by Glitch to fix the systems of Wareville?**
- Query:
  ```
  event.category : process
  ```
- Result:
  The `process.command_line` field showed the encoded PowerShell command:
  ```
  powershell.exe -EncodedCommand SQBuAHMAdABhAGwAbAAtAFcAaQBuAGQAbwB3AHMAVQBwAGQAYQB0AGUAIAAtAEEAYwBjAGUAcAB0AEEAbABsACAALQBBAHUAdABvAFIAZQBiAG8AbwB0AA==
  ```

**Decoding Process:**
- Used **CyberChef** with the recipes:
  - **FromBase64**
  - **Decode Text (UTF-16LE)**
- Decoded Command:
  ```
  Install-WindowsUpdate -AcceptAll -AutoReboot
  ```

**Answer:** `Install-WindowsUpdate -AcceptAll -AutoReboot`

## Key Findings 🔑

1. **Failed Logins:** The `service_admin` account caused `6791` failed login attempts.
2. **Glitch’s Actions:** Despite suspicion, Glitch successfully logged in and fixed the system using a PowerShell command to update Windows.
3. **IP Investigation:** Glitch's login activity was traced to the IP address `10.0.255.1`.

## Lessons Learned 🌟

### Log Analysis Insights
1. **Context Is Crucial:** Logs often appear suspicious without proper context. Glitch was fixing the system, not attacking it.
2. **Filters Matter:** Effective filters in Elastic SIEM helped narrow down relevant events quickly.
3. **Encoded Commands:** Investigating encoded commands revealed intent and mitigated misinterpretation.

### Tools and Techniques 🛠️
1. [Elastic SIEM](https://www.elastic.co/what-is/siem): Filtered and analyzed logs to uncover suspicious activity.
2. [CyberChef](https://gchq.github.io/CyberChef/): Decoded Base64-encoded PowerShell commands with ease.

## Final Thoughts 🎁

Day 2 demonstrated the importance of log analysis in identifying suspicious activity and understanding its context. It was a great reminder that not all anomalies are malicious: Glitch was a hero in disguise, fixing Wareville's systems. Bring on Day 3!

### Answers ✅
1. **What is the name of the account causing all the failed login attempts?**  
   **Answer:** `service_admin`
2. **How many failed logon attempts were observed?**  
   **Answer:** `6791`
3. **What is the IP address of Glitch?**  
   **Answer:** `10.0.255.1`
4. **When did Glitch successfully log on to ADM-01?**  
   **Answer:** `Dec 1, 2024 @ 08:54:39.0`
5. **What is the decoded command executed by Glitch to fix the systems of Wareville?**  
   **Answer:** `Install-WindowsUpdate -AcceptAll -AutoReboot`
   
## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | **Log Analysis**                       | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
