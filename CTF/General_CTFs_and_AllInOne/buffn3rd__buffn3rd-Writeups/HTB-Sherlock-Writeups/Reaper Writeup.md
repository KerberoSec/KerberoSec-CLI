# **Reaper Writeup**
![image](https://github.com/user-attachments/assets/152adfc9-90e0-418d-81d7-59841be328a1)

Our SIEM alerted us to a suspicious logon event which needs to be looked at immediately . The alert details were that the IP Address and the Source Workstation name were a mismatch .You are provided a network capture and event logs from the surrounding time around the incident timeframe. Corelate the given evidence and report back to your SOC Manager.

**Tools:**
- Windows Event Viewer
- Wireshark

**Learned:**
- Packet Capture Analysis
- Windows Event Log Analysis

### **Question 1**
What is the IP Address for Forela-Wkstn001?

Looking at the given files we are given only two. Packet capture and security logs. The best way I felt to find the IP address of the workstation was to open the packet capture to get a look at what was in there. My intial thought was to look for the DNS protocol to see if there was a query request sent on behalf of the Forela-Wkstn001. Which there was! Looking at the log below, we can see the DNS server responded to Forela-Wkstn001 DNS request and we can not the IP of the workstation
	
![image](https://github.com/user-attachments/assets/291e8ad6-074e-4c61-aca5-a794f3f08ab8)

**Answer:** 172.17.79.129
### **Question 2**
What is the IP Address for Forela-Wkstn002?

I am not seeing any DNS queries for the second workstation. My next thought is to try another protocol that might reveal this information. Another protocol that comes to mind is the Server Message block (SMB). This protocol is what enables users to access files on remote servers as well as connect to other resources remotely like printers. I begain thumbing through the various SMB2 logs filtering on them and was able to find a NTLMSSP_AUTH request. Which from past knowledge I know can show the host name. Which it did! What is also usefule about this log is it shows the IP.... the source IP is the IP of the workstation and the destionation IP is the remote resource it was trying to connect to but a NTLM auth request was sent to ensure they are authorized to contact the remote resource
	
![image](https://github.com/user-attachments/assets/62eeb605-0c73-4850-9137-8953f8575c01)

**Answer:** 172.17.79.136
### **Question 3**
Which user account's hash was stolen by attacker?

My intial thought of hashs that were stolen by an attacker is to immedately filter on NTLMSSP.... understanding the NTLM process is important here to help idenitfy the users account hash. The NTLM server challenge value is important to the authentication process of how passwords are exchanged over the network. The server will send a challenge to the client where the client responds by giving it their password which is hashed. The server then takes the hash of the password provided and the challenge and compares them to authenticate this is a legit user. Also, we can leverage our security logs by filtering on Event ID 4624 which is a logon event. Scrolling through we see all system logon attempts and just one account logon fro 'Arthur Kyle'. Lets line up the events in Wireshark to connect the dots. Filtering on the NTLM protocol I can see many session request fr arthur kyle which is indicative that someone was trying to log into his account. If I had to guess someone sniffed his password hash out and hashed out the passsword hash decrypting his password.
	
![image](https://github.com/user-attachments/assets/d98f675f-4320-407f-9d0c-c968ecb8e244)

**Answer:** 172.17.79.129
### **Question 4**
What is the IP Address of Unknown Device used by the attacker to intercept credentials?

If the attacker has an unknown device I suspect the attacker might've spoofed their IP to look like a private IP 172.x.x.x or 192.x.x.x. Looking at my picture from the last question you can easily identify the TA IP as the workstation is communicating with their device. It was able to intercept the creds by having the employees PC communicate the with his PC where he was able to take the hash of the password when it made the NTLM request to its device. The TA device was the one the employee PC was talking to the entire time
	
![image](https://github.com/user-attachments/assets/d04b36f3-42e4-4a20-a8dc-a5b5ca56849d)

**Answer:** 172.17.79.135
### **Question 5**
What was the fileshare navigated by the victim user account?

This is easy! Think about the protocls that are used for remote ocmmunication.... you should be thinking SMB2 as that protocol is what allows us to communicate to remote services/resources. In the first picture we can see the TA logging into the compromised account. Shortly after we can see the TA logged into that PC making a request out to a fileshare: \\DC01\Trip.... it seemed to not exist. I filtered on the SMB2 protocol as that would show many any fileshare requests and it did! I also knew the compromised PC IP so I filtered on that and saw the NTLM request where they got logged in and then shortly followed by accessing that file share.
	
![image](https://github.com/user-attachments/assets/44277938-62f2-47e5-b626-cefdb802ca7d)

**Answer:** \\\\DC01\\Trip
### **Question 6**
What is the source port used to logon to target workstation using the compromised account?

This is pretty easy. We already found the target workstation IP and we also know the account that was compromised! Let us go back and check out the security logs for this! Filter back on the logon event (4624). Go back and find arthurs logon and if you scroll down in the log you can see the source port that it was used to get logged onto their PC. This is a common usage of unusal ports.

![image](https://github.com/user-attachments/assets/b2653107-6430-47d5-8af1-a20436f8fd13)

**Answer:** 40252
### **Question 7**
What is the Logon ID for the malicious session?

Looking at the picture above it calls out the logon ID they used which is hexidecimal. 
	  
![image](https://github.com/user-attachments/assets/0572cdb6-e6f8-4e32-9e34-48c1866d32ef)

**Answer:** 0x64A799
### **Question 8**
The detection was based on the mismatch of hostname and the assigned IP Address. What is the workstation name and the source IP Address from which the malicious logon occur?

My thought process to find this was simple. I filtered on the NTLMSSP protocol as I already knew the 172.17.79.135 IP was the TA device. Opening up a NTLMSSP_AUTH I found that they masked their hostname to match the 'Forela-Wkstn002' except there is all capitalized. This alerted on the mismatch of the hostname and is assigned IP address because the assigned IP address to the 'Forela-Wkstn022' is actually 172.17.79.136

![image](https://github.com/user-attachments/assets/0e6adb1c-cefe-4dd9-a766-b6aa598e6026)

**Answer:** FORELA-WKSTN002, 172.17.79.135
### **Question 9**
When did the malicious logon happened. Please make sure the timestamp is in UTC?

My thought process here was since I already identified the first logon time in the security logs I can open up the event properities and go to the details tab and open 'System' I can find the UTC timestamp there and I did.

![image](https://github.com/user-attachments/assets/73e82dea-03dd-4477-80f1-bf06c136559d)

**Answer:** 2024-07-31 04:55:16
### **Question 10**
What is the share Name accessed as part of the authentication process by the malicious tool used by the attacker?

This was a bit tricky but I did further research on important event IDs in the security event. Event 5140 shows a file share that was accessed. Filtering on that event I can correlate this to the attacker by looking at the Logon ID.
	
![image](https://github.com/user-attachments/assets/50d8f591-5bcc-470a-93f9-80c97395f3af)

**Answer:** \\*\IPC$

Overall, this was a fun challenge! It further developed my understanding of how accounts authenticate on a network using NTLM and the importance of utilizing the SMB2 protocol for forensics.
