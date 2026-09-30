# **Logjammer Writeup**
![image](https://github.com/user-attachments/assets/7d65d420-8a19-4310-a17a-ec4add1ec9a9)

You have been presented with the opportunity to work as a junior DFIR consultant for a big consultancy. However, they have provided a technical assessment for you to complete. The consultancy Forela-Security would like to gauge your Windows Event Log Analysis knowledge. We believe the Cyberjunkie user logged in to his computer and may have taken malicious actions. Please analyze the given event logs and report back.

**Tools:**
- Windows Event Viewer
**Learned:**
- Windows Event Log Analysis
- Intrusion Analysis
- Timeline analysis

### **Question 1**
When did the cyberjunkie user first successfully log into his computer? (UTC)

By understanding the various windows event logs will help you solve this. The 'Security' log will show users who have accessed the a system. Specifically event ID '4624' which shows that represents a successful logon. Make sure to look at the username in the log and verify it was 'cyberjunkie'. Here we can see the first time 'cyberjunkie' logged on but you will see the field 'logged' that is actually when the log was created on the machine we want the UTC timestamp. Click 'Details' and you will find it there. Also note it is important to remember the SID as some logs won't log out the username rather the SID
	
![image](https://github.com/user-attachments/assets/1030a136-db21-45a4-a7b0-4aa1b180a63b)

**Answer:** 27/03/2023 14:37:09

### **Question 2**
The user tampered with firewall settings on the system. Analyze the firewall event logs to find out the Name of the firewall rule added?

You will have to look at the 'Windows Firewall' logs in order to see the firewall rules being tampered with. Initially opening it up I saw this rulename that did not look it belonged and lead me to think the TA added.

![image](https://github.com/user-attachments/assets/dcdc03b0-591e-4be9-964b-8b2a4099424f)

This looks like its a rule to allow metasploit to exploit communication between an endpoint and C2 node.

**Answer:** Metasploit C2 Bypass

### **Question 3**
Whats the direction of the firewall rule?

Direction is outbound which means it will allow outbound connections which for example, a C2 node would be outbound to your network.

![image](https://github.com/user-attachments/assets/050cb95b-f538-4c8f-aa7e-752cf2998c3f)

**Answer:** Outbound

### **Question 4**
The user changed audit policy of the computer. Whats the Subcategory of this changed policy?

For audit policy changes this can be found in security logs as it also audits. Doing some google searching I found event ID '4719' which shows an audit policy was changed

The only event under that ID was this. Which was the change that was made by the TA which can be verified by the SID that was logged.

![image](https://github.com/user-attachments/assets/b75d8440-d13f-4e50-8590-49b0637d700c)

### **Answer:** Other Object Access Events

**Question 5**
The user "cyberjunkie" created a scheduled task. Whats the name of this task?

This can be found in security logs. Event ID '4698' will show scheduled tasks created. Here we can note a few things. The name of the task, the task category which is an important detail as we found that answer the last question but this helps with building our timeline understanding that these events are directly related.
	
![image](https://github.com/user-attachments/assets/b92796e4-f80a-451a-a988-7ead5f3d2a01)

**Answer:** HTB-AUTOMATION

### **Question 6**
Whats the full path of the file which was scheduled for the task?

Here you can see what the task is doing by scrolling down in the log you will see the command.

![image](https://github.com/user-attachments/assets/7db131ba-1ffd-47b1-8d28-977f65bb29af)

**Answer:** C:\Users\CyberJunkie\Desktop\Automation-HTB.ps1

### **Question 7**
What are the arguments of the command?

Right below it we can find the argument

![image](https://github.com/user-attachments/assets/e10848f7-8431-4560-aa3e-488c34701666)

**Answer:** -A cyberjunkie@hackthebox.eu

### **Question 8**
The antivirus running on the system identified a threat and performed actions on it. Which tool was identified as malware by antivirus?

This can be found in the 'Windows Defender' logs since it found malware. To help filter event ID '1116' will show that malware has been identified. Here we can see the file name of the identified malware signature.

![image](https://github.com/user-attachments/assets/8c26a7b1-43e1-4f3a-b3fe-c8ec0a362d03)

**Answer:** Sharphound

### **Question 9**
Whats the full path of the malware which raised the alert?

In the same log filyou will be able to identify the file path!

![image](https://github.com/user-attachments/assets/ca27ac7f-ca38-4fae-bd8d-520df921ced5)

**Answer:** C:\Users\CyberJunkie\Downloads\SharpHound-v1.1.0.zip

### **Question 10**
What action was taken by the antivirus?

Filter on event ID '1117' as this shows the action that was taken by Windows Defender. Here we filtered on 1117 and can see on the SharpHound virus it quarantined it.

![image](https://github.com/user-attachments/assets/370c4946-c94b-4bdb-b7fc-cf0b563b4256)

**Answer:** Quarantine

### **Question 11**
The user used Powershell to execute commands. What command was executed by the user?

Filtering on event ID '4104' t his will shows remote execution which why we filter on this is if we think a machine is compromised and they accesses our pwoershell we will want to see any remote commands that were ran as this proves not only its been compromised but they have connectivity to the machine and they did something

![image](https://github.com/user-attachments/assets/4e420cdd-ee07-4631-90d5-bf8e4d50b04b)

**Answer:** Get-FileHash -Algorithm md5 .\Desktop\Automation-HTB.ps1

### **Question 12**
We suspect the user deleted some event logs. Which Event log file was cleared?

If we believe some logs have been deleted pulling from my knowledge I first think about going to security logs as this will show us any logs that were deleted. To confirm your suspicion you can filter on event ID '1102' which shows any logs that were cleared and here we can see the TA cleared logs but we are not sure what they were. Doing some research I uncovered the system logs will show logs that were cleared which makes alot of sense since because it is an event against the machine. Going to the system logs I filtered on event ID '104' and found the answer. Event ID '104' shows logs that were cleared on the system and what logs were cleared

![image](https://github.com/user-attachments/assets/fc77feb3-7dd8-4b91-b54f-a202239ed2ae)

**Answer:** Microsoft-Windows-Windows Firewall With Advanced Security/Firewall

Overall, this was a easy challenge for anyone wanting to understand the various log types that windows systems has. It allows for you to get more familiar with them and their correlating event ID's and what they mean and why they are useful in intrusion analysis. Also, utilizing these logs to verify there was an intrusion helped build a timeline of events by correlating events back to each other given their timestamps and correlating their descriptions helped determine that the log you were looking at was the correct answer and corresponded to the event.
