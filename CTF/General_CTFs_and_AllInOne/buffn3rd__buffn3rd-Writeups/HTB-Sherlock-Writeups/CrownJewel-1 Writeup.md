# **CrownJewel-1 Writeup**
![image](https://github.com/user-attachments/assets/bc900c0b-d440-4d96-acc1-533f912425ad)

Forela's domain controller is under attack. The Domain Administrator account is believed to be compromised, and it is suspected that the threat actor dumped the NTDS.dit database on the DC. We just received an alert of vssadmin being used on the DC, since this is not part of the routine schedule we have good reason to believe that the attacker abused this LOLBIN utility to get the Domain environment's crown jewel. Perform some analysis on provided artifacts for a quick triage and if possible kick the attacker as early as possible.

**Tools:**
- MFTExplorer
- Windows Event Viewer

**Learned:**
- Windows Log Analysis
- Timeline Analysis
### **Question 1**
Attackers can abuse the vssadmin utility to create volume shadow snapshots and then extract sensitive files like NTDS.dit to bypass security mechanisms. Identify the time when the Volume Shadow Copy service entered a running state.

	
We are given a few artifacts from the machine. A few event logs and the $MFT file. Since it is asking about a service my initial thought is to go to th esystem logs. System logs will tell you anything service related (stopped,started, restarted). Filter on event ID '7036' which means the service changed state

There is a quick way to find the 'Volume Shadow Copy'... press ctrl + f and search for 'Volume Shadow Copy'. Remember the initial timestamp you see is when it created the log so to know when the event of the service changing happened open up the system portion on the 'Details' page.
	
![image](https://github.com/user-attachments/assets/6ef14c9c-508c-49d0-975a-70a738b05e0f)

**Answer:** 2024-05-14 03:42:16
### **Question 2**
When a volume shadow snapshot is created, the Volume shadow copy service validates the privileges using the Machine account and enumerates User groups. Find the User groups it enumerates, the Subject Account name, and also identify the Process ID(in decimal) of the Volume shadow copy service process

We will utilize the security logs since it is wanting to know the user groups and subject account name and PID. The PID will actually get answered in the following question but good to note it down.

To help find the associated groups verify under the 'Process Information' it is talking about the 'Volume Shadow Service' executeable (VSSVC.exe). Check all the logs as I found it enumerated 2 groups: Administrator and Backup Operators. You can also note in the logs is the user account which is DC01$.

The PID is also highlighted and is in hexadecimal: 0x1190

![image](https://github.com/user-attachments/assets/9857d583-6365-4821-9523-ec99a80d479b)

**Answer:** Administrators, Backup Operators, DC01$
### **Question 3**
Identify the Process ID (in Decimal) of the volume shadow copy service process.
	
Take that hexxdecimal of the PID and convet it to decimal.
	
![image](https://github.com/user-attachments/assets/ee6befdd-ea0c-488b-bcf2-afdcd791d67b)

**Answer:** 0x1190
### **Question 4**
Find the assigned Volume ID/GUID value to the Shadow copy snapshot when it was mounted.

I know in the Microsoft-Windows-NTFS event log will show the volume ID. This logs out all tidbits of info of when your volumes get scanned to a minor change happening within them. This log holds all the detail of your volume and it perfect for trying to find the volume ID.

Since they made a copy I was looking for the name of th evolume to have copy it in. I did a ctrl + f on 'copy' and found the answer!

![image](https://github.com/user-attachments/assets/b69978eb-c497-4ba1-8973-908b8b961733)

**Answer:** {06c4a997-cca8-11ed-a90f-000c295644f9}
### **Question 5**
Identify the full path of the dumped NTDS database on disk.

Identifying the dumped path you will have to loadx up the $MFT file. The $MFT file which is the 'Master File Table' is the ledger for a Windows PC. It will have records of every file and folder on the system even ones you have deleted! It is a great Windows artifact for forensics especially on the windows file system

Common places to always checked for dumped/malicious files are under a users account in documents, downloads, pictures... because threat actors (TA) will dump things typically off in those areas where you would suspect legitament files to be. I found under the 'Administrator' account under documents is where the NTDS.dit was dumped. I had to search up what the NTDS database dump looked like and I found that file name so I searched for it in the MFT.

![[Pasted image 20240829183921.png]]

**Answer:** C:\\Users\\Administrator\\Documents\\backup_sync_Dc\\Ntds.dit
### **Question 6**
When was newly dumped ntds.dit created on disk?

	The great part about the $MFT file is it logs out when the file was created, modified and other tidbits of information! Here you can idenitfy when it was created.

![image](https://github.com/user-attachments/assets/c6c272fd-02a4-4a69-86c5-92d4760e9bdb)

**Answer:** SI_Created On
2024-05-14 03:44:22.8137562
### **Question 7**
A registry hive was also dumped alongside the NTDS database. Which registry hive was dumped and what is its file size in bytes?

Registry hives are important artifacts to only Windows OS. They primarly store system, software, user configs in a hierarchical database. In the terms of forensics they hold great value to help see if a TA has altered any settings in the registry which can give us detail that an attack took place to even if a users account setting was altered which might be indicative of an attack took palce.

The registry hive that was dropped was the SYSTEM registry. The SYSTEM registry stores configuration settings and options for both the operating system and installed applications.

The physical size is the size of the file. Convert the physical size from hexadecimal to its value which is 17563648. I used this online calculator to convert it: [Hex Calculator](https://www.calculator.net/hex-calculator.html?d2bnumber1=17563648&calctype=d2b&x=Calculate#decimal2hex)
	
![image](https://github.com/user-attachments/assets/9becd0f0-a3c1-4b3c-a513-243390b6eb6e)

**Answer:** SYSTEM, 17563648

This was a fun and simple windows system analysis. Giving us some of the most common artifacts of a windows system that we can troubleshoot to help track down a cyber incident. This sherlock highlight windows log analysis and timeline analysis by enabling us to tie events together when the information isn't the most formal.
