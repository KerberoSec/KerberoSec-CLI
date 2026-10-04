# 🎄 TryHackMe Advent of Cyber 2024: Day 20: Traffic Analysis

## Objectives 🎯
- Investigate network traffic using Wireshark.
- Identify indicators of compromise (IOCs) in captured network traffic.
- Understand how command and control (C2) servers communicate with compromised systems.

## Steps 🚀
1. **Setup and Filtering Traffic:**
   - Start the VM and load the `C2_Traffic_Analysis.pcap` file in Wireshark.
   - Filter traffic originating from Marta May Ware's machine with the display filter: `ip.src == 10.10.229.217`.

2. **Analyzing Packets:**
   - Locate and analyze packets related to the `POST /initial`, `GET /command`, and `POST /exfiltrate` requests.
   - Right-click on interesting packets and follow the HTTP streams to observe back-and-forth communication.

3. **Decoding Beacons:**
   - Identify beacon traffic by observing packets sent at regular intervals.
   - Extract the encrypted beacon and decryption key from the PCAP.

4. **Decrypting Beacons with CyberChef:**
   - Open the CyberChef tool and set up the decryption operation.
   - Use AES decryption in ECB mode with the extracted key.
   - Paste the encrypted beacon into the input pane and decrypt to reveal the secret message.

5. **Extracting Critical Information:**
   - Determine the payload's initial message, C2 server IP address, commands sent, exfiltrated file, and secret beacon message.

## Key Findings 🔑
- The compromised machine communicated with a C2 server at `10.10.123.224`.
- Commands from the C2 server included reconnaissance activities like `whoami`.
- Critical file `credentials.txt` was exfiltrated to the C2 server.
- Encrypted beacon traffic carried the secret message `THM_Secret_101`.

## Lessons Learned 🌟
- **C2 Traffic Patterns:** Beacons are regular status updates from compromised machines to C2 servers.
- **Wireshark Techniques:** Filters, following HTTP streams, and analyzing packet bytes are crucial for uncovering malicious activities.
- **Decryption with CyberChef:** AES decryption can be leveraged to uncover encrypted communication.

### Tools and Techniques 🛠️
- **Wireshark:** For analyzing PCAP files and inspecting network traffic.
- **CyberChef:** For decryption of encrypted messages using AES.
- **HTTP Streams:** For reconstructing communication between clients and servers.

## Final Thoughts 🎁
This task highlights the importance of analyzing network traffic to uncover evidence of compromise. It also emphasizes understanding C2 communication and utilizing tools like Wireshark and CyberChef effectively.

### Answers ✅
1. **What was the first message the payload sent to Mayor Malware’s C2?**  
   `I am in Mayor!`
2. **What was the IP address of the C2 server?**  
   `10.10.123.224`
3. **What was the command sent by the C2 server to the target machine?**  
   `whoami`
4. **What was the filename of the critical file exfiltrated by the C2 server?**  
   `credentials.txt`
5. **What secret message was sent back to the C2 in an encrypted format through beacons?**  
   `THM_Secret_101`

## Table of Contents 📚

| Day  | Challenge                              | Day  | Challenge                               | Day  | Challenge                               |
|------|----------------------------------------|------|-----------------------------------------|------|-----------------------------------------|
| 📖  | [README](../README.md)                 | 9    | [Risk Assessment](days/day9.md)         | 17   | [Log Analysis](days/day_17.md)          |
| 1    | [OPSEC Challenge](days/day1.md)        | 10   | [Phishing](days/day_10.md)              | 18   | [Prompt Injection](days/day_18.md)      |
| 2    | [Log Analysis](days/day2.md)           | 11   | [Wi-Fi Attacks](days/day_11.md)         | 19   | [Game Hacking](days/day_19.md)          |
| 3    | [Log Analysis](days/day3.md)           | 12   | [Web Timing Attacks](days/day_12.md)    | 20   | **Traffic Analysis**                    |
| 4    | [Atomic Red Team](days/day4.md)        | 13   | [WebSockets](days/day_13.md)            | 21   | [Reverse Engineering](days/day_21.md)   |
| 5    | [XXE](days/day5.md)                    | 14   | [Certificate Mismanagement](days/day_14.md)| 22 | [Kubernetes DFIR](days/day_22.md)       |
| 6    | [Sandboxes](days/day6.md)              | 15   | [Active Directory](days/day_15.md)      | 23   | [Hash Cracking](days/day_23.md)         |
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | [Shellcodes](days/day8.md)             |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
