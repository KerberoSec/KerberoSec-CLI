# **CrownJewel-2 Writeup**
![image](https://github.com/user-attachments/assets/e9778629-f88d-4b80-bd0a-dadb9f9b369b)

Forela's Domain environment is pure chaos. Just got another alert from the Domain controller of NTDS.dit database being exfiltrated. Just one day prior you responded to an alert on the same domain controller where an attacker dumped NTDS.dit via vssadmin utility. However, you managed to delete the dumped files kick the attacker out of the DC, and restore a clean snapshot. Now they again managed to access DC with a domain admin account with their persistent access in the environment. This time they are abusing ntdsutil to dump the database. Help Forela in these chaotic times!!

**Tools:**
- Windows Event Log
**Learned:**
- Windows Event Log Analysis
- Timeline Analysis
### **Question 1**
When utilizing ntdsutil.exe to dump NTDS on disk, it simultaneously employs the Microsoft Shadow Copy Service. What is the most recent timestamp at which this service entered the running state, signifying the possible initiation of the NTDS dumping process?

We are given just a few event logs. Since it is asking about a service my initial thought is to go to the system logs. System logs will tell you anything service related (stopped,started, restarted). Filter on event ID '7036' which means the service changed state

There is a quick way to find the 'Microsoft Shadow Copy Service'... press ctrl + f and search for 'Volume Shadow Copy'. Remember the initial timestamp you see is when it created the log so to know when the event of the service changing happened open up the system portion on the 'Details' page.

![image](https://github.com/user-attachments/assets/3bda283e-704f-4048-8530-51fba1e84405)

**Answer:** 2024-05-15 05:39:55
### **Question 2**
Identify the full path of the dumped NTDS file.

Identifying the dumped path you would usually use the $MFT file. Since this gives us the app logs you can actually go there to identify it. Remember the file that is generated from a NTDS dump called ntds.dit. I will do a ctrl + f to find just that

Common places to always checked for dumped/malicious files are under a users account in documents, downloads, pictures, temp folders etc. Threat actors (TA) will dump things typically off in those areas where you would suspect legitament files to be. Under the 'Active Directory' folder all under the 'Windows' folder you can find where the TA dumped the database.

![image](https://github.com/user-attachments/assets/ca6012db-ff03-4f8a-964b-d67bda604475)

**Answer:**  C:\Windows\Temp\dump_tmp\Active Directory\ntds.dit
### **Question 3**
When was the database dump created on the disk?

Open up the log furhter and go to th esystem etails to see when the event occured.

![image](https://github.com/user-attachments/assets/fab11d8d-6d00-40b9-be96-4eac9b9c9304)

**Answer:** 2024-05-15 05:39:56
### **Question 4**
When was the newly dumped database considered complete and ready for use?

In this log we can see they detached the database engine to the database which means the database is ready to go.

![image](https://github.com/user-attachments/assets/3e1ae9b0-7dcc-4977-b665-9e40a7c53659)

**Answer:** 2024-05-15 05:39:58
### **Question 5**
Event logs use event sources to track events coming from different sources. Which event source provides database status data like creation and detachment?

In the application logs you can see the source is 'ESENT'

![image](https://github.com/user-attachments/assets/b34e785f-bace-47c6-9e47-3cd58a7f498f)

**Answer:** ESENT
### **Question 6**
When ntdsutil.exe is used to dump the database, it enumerates certain user groups to validate the privileges of the account being used. Which two groups are enumerated by the ntdsutil.exe process? Also, find the Logon ID so we can easily track the malicious session in our hunt.

Opening the security logs and doing a find on 'ntdsutil.exe' it will find a few logs.. get through them all. The logs will show the groups it enumerated and I found 2 groups it enumerated. You will also note the login ID: 0x8DE3D

![image](https://github.com/user-attachments/assets/96b8e4ca-c75e-4780-ba5d-8057feb0a451)

**Answer:** Administrators, Backup Operators, 0x8DE3D
### **Question 7**
Now you are tasked to find the Login Time for the malicious Session. Using the Logon ID, find the Time when the user logon session started.

Take the login ID from the last task and go to the security logs as those log login/logout events of users and search for that user. Find the very last log as that will bewhen they first logged in. You can also filter on event ID '4624' as that shows when someone logged into the system. Here I found the last log indicating this was the first log for the login time of the user.

![image](https://github.com/user-attachments/assets/2b5cd828-6145-42fb-906e-d61a0cf877cf)

**Answer:** 2024-05-15 05:36:31

This was another fun challenge and a great follow up from CrownJewel-1. It helps you get further experience inside of the windows logs and generating the timeline of the even causing you to analyze every event making sure they line up.
