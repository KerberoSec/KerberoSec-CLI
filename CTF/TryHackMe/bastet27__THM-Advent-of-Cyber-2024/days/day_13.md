# 🎄 TryHackMe Advent of Cyber 2024: Day 13: WebSockets

## Objectives 🎯

Day 13 focuses on understanding and exploiting WebSocket vulnerabilities. The challenge involves identifying a WebSocket message manipulation vulnerability in a car-tracking application and testing how the application handles unauthorized changes to WebSocket messages.

### Goals:
1. Learn how WebSockets work and their vulnerabilities.
2. Perform WebSocket message manipulation to track unauthorized users.
3. Identify flags through the exploitation of the application.

## Steps 🚀

### Step 1: Prepare the Environment
1. **Start Machines**:  
   - Click **Start Machine** to initialize the target environment.
   - Click **Start AttackBox** to set up the AttackBox.
2. **Access the Application**:  
   - Navigate to `http://MACHINE_IP` in the AttackBox browser.

### Step 2: Configure Burp Suite for WebSocket Traffic
1. **Start Burp Suite**:  
   - Open Burp Suite from the desktop of the AttackBox.
   - Click **Next** on the startup screen and then **Start Burp**.
2. **Enable Proxy Intercept**:  
   - Navigate to **Proxy > Intercept > Proxy Settings** in Burp Suite.
   - Ensure the proxy settings are configured as required and enable intercept.
3. **Initiate WebSocket Traffic**:  
   - Return to the browser and click **Track** in the Reindeer Tracker application.
   - Burp Suite will capture the WebSocket traffic.

### Step 3: Exploit WebSocket Message Manipulation
1. **Intercept the Request**:  
   - In Burp Suite, intercept the WebSocket traffic. You will see a message containing the `userId` parameter (e.g., `userId=5`).
2. **Manipulate the Request**:  
   - Change the value of `userId` from `5` to `8`.
   - Click the **Forward** button in Burp Suite to send the manipulated request.
3. **Check the Results**:  
   - Return to the browser and view the updated community reports.
   - Confirm that the new user (userId `8`) is now being tracked.

### Step 4: Further WebSocket Message Manipulation
1. **Intercept Message Posts**:  
   - Test if messages posted in the application can be manipulated. Attempt to post a message using a different `userId` or modify the content of the message.
2. **Capture Additional Flags**:  
   - Identify and capture any flags revealed through message manipulation.

## Key Findings 🔑

1. **WebSocket Message Manipulation**:  
   - The car-tracking application did not validate WebSocket messages properly, allowing unauthorized changes to user data and tracking.
2. **Improper Authorization**:  
   - The application lacked proper checks to ensure that only authorized users could track others or post messages.

## Lessons Learned 🌟

### Security Insights:
- **Validate WebSocket Messages**:  
  Applications must implement strict validation for all WebSocket messages, including user permissions and data integrity.
- **Use Secure Authentication**:  
  Ensure proper authentication and session management for WebSocket connections.
- **Encrypt WebSocket Traffic**:  
  Use encryption (e.g., TLS) to secure data in transit and prevent tampering.

### Tools and Techniques 🛠️
1. **Burp Suite**: Essential for capturing and manipulating WebSocket traffic.
2. **WebSocket Testing**: Focus on testing for message integrity and authentication flaws.

## Final Thoughts 🎁

This task highlights the importance of securing WebSocket connections and ensuring proper validation of user actions. WebSocket vulnerabilities, if left unchecked, can lead to unauthorized access and manipulation of sensitive data.

### Answers ✅
1. **What is the value of Flag1?**  
   **Answer**: `THM{dude_where_is_my_car}`
2. **What is the value of Flag2?**  
   **Answer**: `THM{my_name_is_malware._mayor_malware}`

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | ** WebSockets**                         | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
