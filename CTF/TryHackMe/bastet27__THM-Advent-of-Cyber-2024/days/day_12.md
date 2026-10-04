# 🎄 TryHackMe Advent of Cyber 2024: Day 12: Web Timing Attacks

## Objectives 🎯

Day 12 explores the concept of race conditions and web timing attacks. In this exercise, we will investigate how these vulnerabilities can be exploited to perform unintended actions, such as transferring funds multiple times in a banking application.

### Goals:
1. Understand web timing attacks and race conditions.
2. Learn how to exploit race conditions in web applications.
3. Implement solutions to prevent race conditions.

## Steps 🚀

### Step 1: Prepare the Environment
1. **Start Machines**:  
   - Click **Start Machine** to initialize the target machine.  
   - Click **Start AttackBox** to set up the AttackBox environment.
2. **Open Web Application**:  
   - Once the system boots completely (1-2 minutes), navigate to the banking app at `http://MACHINE_IP:5000/`.

### Step 2: Configure Burp Suite for Intercepting Requests
1. **Start Burp Suite**:  
   - On the AttackBox, click the Burp Suite icon on the desktop.
   - Click **Next** on the startup screen and then **Start Burp**.
2. **Configure Burp Suite's Proxy**:  
   - Go to the **Settings** tab and enable the option **Allow Burp's browser to run without a sandbox**.
3. **Open Browser with Burp Proxy**:  
   - In Burp Suite, go to **Proxy > Intercept > Open Browser** and visit `http://MACHINE_IP:5000`.
   - All HTTP requests will now be intercepted by Burp Suite.

### Step 3: Log In to the Banking Application
1. **Login Credentials**:  
   - Account Number: `110`  
   - Password: `tester`
2. **Navigate to the Dashboard**:  
   After logging in, you will see the dashboard with your current balance and available options like fund transfer.

### Step 4: Intercept the Fund Transfer Request
1. **Perform a Transaction**:  
   - Enter account number `111` and an amount of `$500` to transfer.  
   - Click **Transfer** and check the response in Burp Suite's **Proxy > HTTP History**.
2. **Capture POST Request**:  
   - The request will appear in the HTTP history. Right-click on the POST request and **Send to Repeater**.

### Step 5: Exploit the Race Condition
1. **Duplicate the Request**:  
   - In Burp Suite's **Repeater**, select the POST request.
   - Press **Ctrl+R** to duplicate the request 10 times.
2. **Create Tab Group for Parallel Execution**:  
   - Right-click on one of the requests and select **Create tab group**.
   - Name the group "funds" and select all 10 requests.
3. **Send Requests in Parallel**:  
   - In the tab group, click the **Send group in parallel** button to send all 10 requests simultaneously.
4. **Verify the Balance**:  
   - After sending the requests, navigate to the **/dashboard** to check if the balance is affected.

### Step 6: Check for the Flag
1. **Negative Balance**:  
   Due to the race condition, the fund transfer requests are processed simultaneously, resulting in a negative balance in the sender’s account and inflated balance in the recipient’s account.
2. **Flag**:  
   After refreshing the dashboard, the flag will be displayed.

## Key Findings 🔑

1. **Race Condition**:  
   The application failed to properly handle concurrent requests, allowing multiple fund transfers to be processed simultaneously, resulting in a negative balance.
2. **HTTP/2 Vulnerabilities**:  
   The adoption of HTTP/2 allowed multiple requests to be processed in a single packet, making timing differences more easily exploitable.
3. **Burp Suite**:  
   Burp Suite was invaluable for intercepting, manipulating, and sending requests in parallel to exploit the race condition vulnerability.

## Lessons Learned 🌟

### Security Insights:
- **Concurrency Issues**: Always ensure that sensitive operations (e.g., financial transactions) are properly locked and synchronized to prevent race conditions.
- **Web Timing Attacks**: Timing differences can be exploited to gain unauthorized access to information or perform actions like unauthorized transfers.
- **Preventive Measures**: Implementing atomic transactions and mutex locks can help mitigate these vulnerabilities.

### Tools and Techniques 🛠️
1. **Burp Suite**: Used for intercepting, modifying, and resending HTTP requests to exploit vulnerabilities.
2. **HTTP/2**: Be aware of HTTP/2's features, such as single-packet multi-requests, which can make timing attacks easier to execute.
3. **Race Conditions**: Critical to prevent unwanted actions caused by concurrent requests.

## Final Thoughts 🎁

This challenge highlights the importance of handling concurrency in web applications. Without proper locking mechanisms and transaction management, sensitive operations like fund transfers can be exploited to cause serious security issues. Always ensure that web applications are resilient to race conditions and timing attacks.

### Answers ✅
1. **What is the flag value after transferring over $2000 from Glitch’s account?**  
   **Answer**: `THM{WON_THE_RACE_007}`

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | **Web Timing Attacks**                  | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
