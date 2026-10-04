# 🎄 TryHackMe Advent of Cyber 2024: Day 14: Certificate Mismanagement

## Objectives 🎯

Day 14 focuses on understanding self-signed certificates, their vulnerabilities, and how attackers can exploit mismanagement. The task involves intercepting traffic using Burp Suite, extracting sensitive credentials, and exploiting insecure configurations.

### Goals:
1. Learn about self-signed certificates and their risks.
2. Simulate a Man-in-the-Middle (MITM) attack.
3. Intercept traffic and extract sensitive data.
4. Identify flags and access privileged accounts.

## Steps 🚀

### Step 1: Start the Machines
1. **Deploy the Target Machine**:  
   - Click **Start Machine** to deploy the Gift Scheduler server.
2. **Start the AttackBox**:  
   - Click **Start AttackBox** to set up the attacking environment.

### Step 2: Configure DNS Redirection
1. **Add Host Entry**:  
   Add the target machine’s IP and domain to the `/etc/hosts` file.
   ```
   echo "MACHINE_IP gift-scheduler.thm" >> /etc/hosts
   ```
2. **Verify the Entry**:  
   ```
   cat /etc/hosts
   ```

### Step 3: Access the Gift Scheduler Website
1. **Open the Website**:  
   - Navigate to `https://gift-scheduler.thm` using Firefox.
2. **Accept the Self-Signed Certificate**:  
   - Click **Advanced**, then **View Certificate**, and verify the certificate details.
   - Accept the risk and continue to access the website.

### Step 4: Intercept Traffic with Burp Suite
1. **Start Burp Suite**:  
   - Launch Burp Suite using `burp` in the terminal.
   - Accept the default settings and start Burp.
2. **Configure Proxy**:  
   - Navigate to **Proxy > Options**.
   - Add a new listener with the following details:
     - Port: `8080`
     - Address: Your AttackBox IP (`CONNECTION_IP`).
3. **Redirect Traffic**:  
   - Add another entry to `/etc/hosts`:
     ```
     echo "CONNECTION_IP wareville-gw" >> /etc/hosts
     ```
4. **Simulate User Traffic**:  
   - Navigate to the script directory and run the simulation script:
     ```
     cd ~/Rooms/AoC2024/Day14
     ./route-elf-traffic.sh
     ```

### Step 5: Extract Credentials and Flags
1. **Intercept Requests**:  
   - Go to Burp Suite’s **Proxy > HTTP History** tab.
   - Review intercepted POST requests for credentials.
2. **Extract Credentials**:  
   - Identify sensitive information, such as usernames and passwords, in POST requests.

## Answers ✅

1. **What is the name of the CA that has signed the Gift Scheduler certificate?**  
   **Answer**: `THM`

2. **What is the password for the snowballelf account?**  
   **Answer**: `c4rrotn0s3`

3. **What is the flag shown on the elves’ scheduling page?**  
   **Answer**: `THM{AoC-3lf0nth3Sh3lf}`

4. **What is the password for Marta May Ware’s account?**  
   **Answer**: `H0llyJ0llySOCMAS!`

5. **What is the flag shown on the admin page?**  
   **Answer**: `THM{AoC-h0wt0ru1nG1ftD4y}`

6. **If you enjoyed this task, feel free to check out the Burp Suite module.**  
   **Answer**: `No answer needed`

## Lessons Learned 🌟

### Security Insights:
- **Avoid Self-Signed Certificates**:  
   Self-signed certificates should only be used in isolated environments. They lack third-party verification and are vulnerable to MITM attacks.
- **Implement Strong Certificate Management**:  
   Always use trusted Certificate Authorities (CAs) for public-facing systems to ensure secure communications.
- **Monitor Network Traffic**:  
   Regularly analyze network traffic to detect anomalies and potential interception attempts.

### Tools and Techniques 🛠️
1. **Burp Suite**:  
   Essential for intercepting and analyzing HTTP/HTTPS traffic.
2. **MITM Simulations**:  
   Practical demonstrations of how improper certificate management can lead to vulnerabilities.

## Final Thoughts 🎁

This challenge emphasizes the critical importance of certificate management and the risks of self-signed certificates in production environments. By simulating a MITM attack, we gain practical insights into how attackers exploit these vulnerabilities to compromise sensitive systems.

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | **Certificate Mismanagement**           | 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
