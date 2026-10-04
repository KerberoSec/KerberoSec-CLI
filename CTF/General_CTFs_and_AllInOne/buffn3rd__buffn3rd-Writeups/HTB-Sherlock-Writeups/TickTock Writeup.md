# **TickTock Writeup**
![image](https://github.com/user-attachments/assets/6baa4451-7e22-43fc-8248-05a690d4b9d2)

Gladys is a new joiner in the company, she has recieved an email informing her that the IT department is due to do some work on her PC, she is guided to call the IT team where they will inform her on how to allow them remote access. The IT team however are actually a group of hackers that are attempting to attack Forela.

**Tools:**
  - PECmd
  - Evtxcmd
  - MFTExplorer
  - Registry Explorer
  - Timeline Explorer
**Learned:**
  - Intrusion Analysis
  - Timeline Analysis using various artifacts from KAPE
  - Correlating system events
  - Malware Forensics

Initial analysis I see we are given an image of a drive using KAPE. Looks like Eric Zimmerman suite of tools will come in handy for this one!

### **Question 1**
What was the name of the executable that was uploaded as a C2 Agent?

The first thing I like to do is check the prefetch files which are files that are commonly run on a system. Therefore, they get cached in this directory for the system to quickly reference them and load the program: C\Windows\prefetch.

I put the prefetch files into a csv and analyze them using ‘Timeline Explorer’. Scrolling through the executables that have ran I noticed this one that ran called ‘Merlin.exe’. I am going to do research on it. Doing research it is a post-exploitation C2 server agent. This would be the file in question.

![image](https://github.com/user-attachments/assets/0424cf9e-3dec-42c5-8b05-6cd73e1829e2)

**Answer:** merlin.exe

### **Question 2**
What was the session id for in the initial access?

My initial thought in terms of a session ID is to go to the logs like Sysmon. But was unable to find anything so far. I did notice in the file structure ‘TeamViewer’ was used. I wonder if this was used for intial access. Using ‘Timeline Explorer’ on all the event logs that I parsed out with ‘Evtxcmd’… I can see team viewer was used. Also would like to note that I did find where merlin.exe actually created a directory C:temp

![image](https://github.com/user-attachments/assets/5407cc77-93ed-4674-bcb6-616f40f294d7)

Team viewer was used for initial access. I found the session ID being created in the ‘TeamViewer’ logs.

![image](https://github.com/user-attachments/assets/9e87c146-4ea3-4320-944b-7a63659ee0e9)

**Answer:** -2102926010

### **Question 3**
The attacker attempted to set a bitlocker password on the `C:` drive what was the password?

I found in the system registry using registry explorer where it extracted the registry hive for the ‘SYSTEM’ file located here: “Collection\C\Windows\System32\config”. In “Root\ControlSet001\Control\Bitlocker” I saw that the password was changed. Correlating this with a sysmon\security logs I found that it was changed. In the security ID logs I used event ID ‘4719’ which shows it was changed I was able to conclude there that the password is ‘reallylongpassword’

**Answer:** reallylongpassword

### **Question 4**
What name was used by the attacker?

I continued scrolling through the TeamViewer logs and noted this account was added as a participate. I presume this is our attacker

![image](https://github.com/user-attachments/assets/7b951b34-1a38-44e7-a2ae-622745388766)

**Answer:** Fritjof Olfasson

### **Question 5**
What IP address did the C2 connect back to?

I utilized the sysmon logs….. I found when merlin.exe was executed since that is the software that connects the c2 node to the infected PC. Then I opened up a log to see if it showed further detail on the executed file what it is doing. I found the IP and, port, and hostname. It is a AWS EC2 instance that the TA is using as a C2 server

![image](https://github.com/user-attachments/assets/717066f1-feb6-4fd7-8236-798eaeadfaf0)

**Answer:** 52.56.142.81

### **Question 6**
What category did Windows Defender give to the C2 binary file?

This is easy. You will want to use the ‘Windows Defender Operational’ logs. This should log out any malware, trojans, RATs it finds and show the binaries for it. I did some searching on the event ID that would help us identify this an event id ‘1009’ will as that is when windows defenders finds malware.

![image](https://github.com/user-attachments/assets/a3b644e3-8847-46c4-8b56-576070751aad)

**Answer:** VirTool:Win32/Myrddin.D

### **Question 7**
What was the filename of the powershell script the attackers used to manipulate time?

I continued my search in ‘Timeline Explorer’ of my event logs I parsed out. I searched on TeamViewer and went through each event. I found this PowerShell script that was embedded inside of TeamViewer. I did some research and found ‘Invoke-TimeWizard.ps1’ is a common tool used to spoof log times.

![image](https://github.com/user-attachments/assets/16dd67c6-4d57-42f4-8c04-9557d03b0175)

**Answer:** Invoke-TimeWizard.ps1

### **Question 8**
What time did the initial access connection start?

I will go back and leverage the TeamViewer logs to see when the user accessed the system. I found that the time they logged in was 2023/05/04 11:35:27. That is when they established connection with the endpoint they infected with malware and began communicating with on their C2 node.

![image](https://github.com/user-attachments/assets/f5cad19f-f0dd-4161-aa2f-21659ae1ccb6)

**Answer:** 2023/05/04 11:35:27

### **Question 9**
What is the SHA1 and SHA2 sum of the malicious binary?

Since we found some logs in Windows Defender alerting on the m’merlin.exe malware….. I bet it logged out the binaries somewhere. I found the answer here: C\ProgramData\Microsoft\Windows Defender\Support\MPLog-07102015-052145.log. Here by searching merlin it detected it and its binaries and gave the hashes for them

![image](https://github.com/user-attachments/assets/559eb858-8677-4302-bf14-784cf1c38705)

**Answer:** ac688f1ba6d4b23899750b86521331d7f7ccfb69:42ec59f760d8b6a50bbc7187829f62c3b6b8e1b841164e7185f497eb7f3b4db9

### **Question 10**
How many times did the powershell script change the time on the machine?

This can be found through filtering on the sysmon logs on event ID ‘13’ which shows a time change on the registry system. After filtering I got 2,371 events came across where the time was changed.

**Answer:** 2371

### **Question 11**
What is the SID of the victim user?

This can be found also in the sysmon/security logs. Leading up to here the evidential SID who is the victim is: S-1-5: 21-3720869868: 2926106253-3446724670: 1003 which is our user who has been affected by all of this.

![image](https://github.com/user-attachments/assets/cda442d5-e19c-487a-a7bf-b1e37540a4db)

**Answer:** S-1-5: 21-3720869868: 2926106253-3446724670: 1003

This was a challenging one. It required an extensive amount of analysis utilizing various tools such as registry explorer, $MFT analysis, PEcmd on prefetch and so much more. This was another great challenge that honed in on my skills of not only using Eric Zimmermans suite of tools but doing timeline analysis gathering all the artifacts from the tools and piecemealing them together to build a timeline of the intrusion where malware was used to infect someone's PC to become apart of a bot.
