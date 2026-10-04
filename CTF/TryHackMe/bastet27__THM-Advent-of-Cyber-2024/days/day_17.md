# 🎄 TryHackMe Advent of Cyber 2024: Day 17: Log Analysis

## Objectives 🎯
- Analyze logs to identify suspicious activity.  
- Extract fields from unstructured log data.  
- Investigate unauthorized access and deletion of CCTV footage.  
- Use Splunk to parse, filter, and correlate log data for detailed analysis.  

## Steps 🚀

### Step 1: Analyze All Logs in `cctv_feed`
1. Use Splunk to load the `cctv_feed` data.
2. Run the query:
   ```
   index=cctv_feed
   ```
   Review unstructured logs to understand the fields and structure.

### Step 2: Extract and Validate Fields  
1. Use the **Extract New Fields** option to define custom fields:
   - `Timestamp`
   - `Event`
   - `User_id`
   - `UserName`
   - `Session_id`
2. Validate field parsing using sample logs. Adjust regex for comprehensive coverage:
   ```
   ^(?P<timestamp>\d+\-\d+\-\d+\s+\d+:\d+:\d+)\s+(?P<Event>(Login\s\w+|\w+))\s+(?P<user_id>\d+)?\s?(?P<UserName>\w+)\s+.*?(?P<Session_id>\w+)$
   ```

### Step 3: Investigate Specific Activities  
#### Successful Logins:
1. Query for logs with successful logins:
   ```
   index=cctv_feed *successful*
   ```

#### Deletion Events:
2. Query for deletion activities:
   ```
   index=cctv_feed *delete*
   ```

#### Session ID Correlation:
3. Investigate activities linked to the suspicious `Session_id`:
   ```
   index=cctv_feed *rij5uu4gt204q0d3eb7jj86okt*
   ```

## Key Findings 🔑

1. **Suspicious Activity**: Multiple login failures followed by a successful login for a suspicious user.
2. **Deletion Events**: Logs confirmed the deletion of CCTV footage.
3. **Correlated Evidence**: The same `Session_id` linked to suspicious activities in web logs and CCTV feed.

## Lessons Learned 🌟

1. **Importance of Log Parsing**: Structured data aids faster investigation.
2. **Field Extraction in SIEM**: Accurate regex ensures comprehensive log coverage.
3. **Session Correlation**: Linking events across datasets is crucial for identifying attackers.

## Tools and Techniques 🛠️

- **Splunk**: For log ingestion, searching, and visualization.
- **Regex**: For custom field extraction.
- **Search Processing Language (SPL)**: For data filtering and correlation.

## Final Thoughts 🎁
This task reinforced the importance of structured log analysis and correlation across datasets. It also demonstrated the need for enabling audit trails and regular monitoring to prevent unauthorized access.

### Answers ✅

1. **How many logs were captured associated with the successful login?**  
   **Answer:** `642`

2. **What is the `Session_id` associated with the attacker who deleted the recording?**  
   **Answer:** `rij5uu4gt204q0d3eb7jj86okt`

3. **What is the name of the attacker found in the logs, who deleted the CCTV footage?**  
   **Answer:** `mmalware`

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | **Log Analysis**                         |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
