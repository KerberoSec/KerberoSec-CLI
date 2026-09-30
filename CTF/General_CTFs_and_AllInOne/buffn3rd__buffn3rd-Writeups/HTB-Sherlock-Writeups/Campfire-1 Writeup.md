# **Campfire-1 Writeup**
![image](https://github.com/user-attachments/assets/224f1469-bd86-4a8d-8118-2395bb0d9c68)

Alonzo Spotted Weird files on his computer and informed the newly assembled SOC Team. Assessing the situation it is believed a Kerberoasting attack may have occurred in the network. It is your job to confirm the findings by analyzing the provided evidence. You are provided with: 
1- Security Logs from the Domain Controller 
2- PowerShell-Operational Logs from the affected workstation 
3- Prefetch Files from the affected workstation

**Tools Used:**
- Windows Event Viewer
- PECmd
- Timeline Explorer

**Learned:**
- Network Security
- Windows Event Log Analysis
- Windows Forensics
- Kerberoasting Analysis
- Timeline Analysis

### **Question 1**
Analyzing Domain Controller Security Logs, can you confirm the date & time when the kerberoasting activity occurred?

First, lets discuss what kerberoasting is and how it works so we can better understand what we are going to be looking for in the logs. Kerberoasting is a technique that abuses the Kerberos authentication protocol. Kerberos runs commonly over port 88 and is a method for authenticating users/services over a non-secure network. It is designed to ensure communications between users and services are secure while ensuring both parties are who they are. How the process works is 
	
As it stated open up the domain controller security logs. Initially we can see many request over Kerberos and failed authentication events. Let's dig into the various event ID's that are tied to the Kerberos protocol so we understand what to look for. Doing some research on important event ID to know for Kerberos authentication. ID's:
  - 4768: Kerberos Authentication Ticket (TGT). This indidcated that a Kerberos ticket granting ticket request was made which helps us track what computer requested the ticket
  - 4769: Kerberos Service Ticket was requested which just helps people monitor specific access request to a service
  - 4771:  Keraberos preauthentication failed. This is when the preauth fails which can help idenifty issues with user creds or unauthorizes access attempts.

	Event ID 4769 seems important to invesitgate as this is the process where it logs when  a ticket was requested. This would be the start to the process of Kerberos. I remember back in school learning about Kerberoasting and a indicator that it may have happened is you see an influx in ticket requested (4769) and if you look at the details of the security logs you will see a 'Ticket Encryption Type' field and you will want to hone in on that because usually attackers will try to use weak encryption to crack the service ticket which compromises your network security. I found the answer! Looking at the log below you can see the encryption type is '0x17' which I know means this ticket used a RC4 (Rivest Cipher 4) algorithim that is a weak symmetric key encryption susceptible to being cracked.
	
	![image](https://github.com/user-attachments/assets/a8695442-1c46-498b-848c-a8181d2d90ec)

**Answer:** 2024-05-21 03:18:09
### **Question 2**
What is the Service Name that was targeted?

This is easy since we found the start time of the attack it also calls out the service the attacker was making a request too.
	
![image](https://github.com/user-attachments/assets/955eb48e-703d-4384-b815-7f38eae9b138)

**Answer:** MSSQLService
### **Question 3**
It is really important to identify the Workstation from which this activity occurred. What is the IP Address of the workstation?

Again, these logs are invaulable with the information the yprovide. You can see the IP listed in the log. See below:
	
![image](https://github.com/user-attachments/assets/34d657e7-15a7-4342-9f3d-4284956f057a)

**Answer:** 172.17.79.129
### **Question 4**
Now that we have identified the workstation, a triage including PowerShell logs and Prefetch files are provided to you for some deeper insights so we can understand how this activity occurred on the endpoint. What is the name of the file used to Enumerate Active directory objects and possibly find Kerberoastable accounts in the network?

You can analyze the powershell logs in event viewer but to analyze prefetch files I recommend using PECmd which will allow you to parse them and put them into a .csv format that you can put in 'Timeline Explorer' to analyze the timeline of these prefetch files. Prefetch files are what speedup the loading of a specific application reosurce allow it to open your most used app faster. Prefetch files will tell on ytou whether an individual installed and ran some program so in terms of computer forensics these are invaluable as well! Since this question is asking for a file I have a hunch both of the logs and prefetch files will point out our culprit. I created the timeline files using 'PECmd'. I saw many executeable but nothing that stuck out or seemed unusual on a windows operating system
	
![image](https://github.com/user-attachments/assets/c0e7379d-aa54-417a-9caf-750c2ac09238)
	
Looking at the powershell logs we don't have many but I am noticing many around the 4100 range. I am going to research to better understand those:
	- 4100: Blocks script logs
	- 4104: This shows records of powershell script blocks text that were ran and what user did it.

The Event ID that makes most since to hone in on is 4100 since that is the one that blocks these scripts. Found the answer... we can see through the 4100 Event ID that they tried to run the script block text and it was blocked. We can also see the TA is the one who did it as it shows 'Unauthorized Access' in the logs
	
![image](https://github.com/user-attachments/assets/ff39fa85-4603-40e5-a0e8-3a7bca90db44)

**Answer:** powerview.ps1
### **Question 5**
When was this script executed?

Looking at the log right above it the TA ran a command to bypass the block allowing them to run it after they restarted powershell.

![image](https://github.com/user-attachments/assets/a40665b9-5851-4695-89b4-8b172f51f144)

Here we can see they successfully ran the powershell script.
	
![image](https://github.com/user-attachments/assets/04ee39fb-6109-49ba-b056-8f39e5b71767)

**Answer:** 2024-05-21 03:16:32
### **Question 6**
What is the full path of the tool used to perform the actual kerberoasting attack?

When I think of a tool I think of executeables! Therefore, our prefetch files that we parsed early that are sitting in Timeline Explorer would be perfect to spot this. To help narrow down lets factor in the time frame of when this attack started. We know the kerberoasting attack intially started on 5/21 3:18pm. I filtered my explorer and found a 'Rubeus.exe' file that was last ran then. This was the correct answer! My thought process behind this was simple. I knew the time the attack started which helped me pinpoint it to being this was the tool used.  The reason why I went towards my timeline explorer of the prefetch files is the prefetch files are to show what apps have been last run/frequently on a machine to help the apps load faster when they are rebooted back up.
	
![image](https://github.com/user-attachments/assets/0b96a7b2-e5a7-40e6-a65b-b54b2ac4da32)
	
**Answer:** C:\\Users\\Alonzo.spire\\Downloads\\Rubeus.exe
### **Question 7**
When was the tool executed to dump credentials?

This is easy as I can look at the 'Last Run' column and find that was when it was executed.

![image](https://github.com/user-attachments/assets/83046427-24ff-4604-bd29-bc4cfe12aac5)

**Answer:** 2024-05-21 03:18:08
