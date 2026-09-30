# **OpTinselTrace-5 Writeup**
![image](https://github.com/user-attachments/assets/240fdc6e-18e6-425e-be80-f80855b723dc)

You’ll notice a lot of our critical server infrastructure was recently transferred from the domain of our MSSP: Forela.local over to Northpole.local. We actually managed to purchase some second-hand servers from the MSSP who have confirmed they are as secure as Christmas is! It seems not as we believe Christmas is doomed and the attackers seemed to have the stealth of a clattering sleigh bell, or they didn’t want to hide at all!!!!!! We have found nasty notes from the Grinch on all of our TinkerTech workstations and servers! Christmas seems doomed. Please help us recover from whoever committed this naughty attack! Please note: these Sherlocks are built to be completed sequentially and in order!

**Tools:**
- Chainsaw
- Sigma

**Learned:**
- Timeline analysis/comparison
- Event Log Analysis
- Static Malware Analysis

### **Question 1**
Which CVE did the Threat Actor (TA) initially exploit to gain access to DC01?

Initial analysis we are given a KAPE image, and a folder with files that might have been used to encrypt the data. I think a good starting point for this might to be to tackle the event logs? I am going to learn how to use Sigma. Doing some reading on tools to help me detect thru the event logs I learned about Sigma. Spent some time thinking and here is what I came up with. Using chainsaw and sigma I crafted as command that would drop everything into a .txt file to help me filtrate through then I think using grep might be a better solution

I ended up finding this which looked abnormal to me. doing some research I learned this is an attack on a domain ctronoller through its replicaiton process to introduce malicious changes to its directory. The attacker will create a rogue DC on the network that seems legit then will be able to create accounts to perform malicious activities on the affected network

![image](https://github.com/user-attachments/assets/b5582dfb-2f57-4938-9ed0-870079d0586b)

I began searching for DC shadow CVE and found this: CVE-2020-1472

Answer: CVE-2020-1472

### **Question 2**
What time did the TA initially exploit the CVE? (UTC)

After learning that the attack was a DC Shadow attack and they exploited CVE 2020-1472 and what the attack type is I began patrolling around for information similar to know the attack is performed. I finally found where there was a unusual logon and where it failed… I suspected this was when the TA attempted to logon to the account

![image](https://github.com/user-attachments/assets/8d9017ac-acd2-4b70-a98f-6baffd73fc9d)

Answer: 2023-12: 13 09:24:23

### **Question 3**
What is the name of the executable related to the unusual service installed on the system around the time of the CVE exploitation?

I went to the system logs and filtered on event ID 7045 to see installed services and found this unusal service which was the service

![image](https://github.com/user-attachments/assets/8ae07350-843c-481a-9615-9d75c89ac22e)

Answer: hAvbdksT.exe

### **Question 4**
What date & time was the unusual service start?

Add 1 ms

![image](https://github.com/user-attachments/assets/d0676070-c3af-4430-8b7a-790b4278c6ee)

Answer: 2023-12: 13 09:24:24

### **Question 5**
What was the TA’s IP address within our internal network?

Using chainsaw I created this to filter on results of event ID 4624 which is a successful logon then I am wanting to use the system time and since we know when the service was started I suspected clsoely around that time the TA logged in which might show us their IP… Also, I had to look at the chainsaw help menu and spent a great amouunt of time to get this to work

- ./optinsel_trace search -t ‘Event.System.EventID: =4624’: timestamp ‘Event.System.TimeCreated_attributes.SystemTime’: from “2023-12: 13T09:24:23

Answer: 192.168.68.200

### **Question 6**
Please list all user accounts the TA utilised during their access. (Ascending order)

This one was a bit easier then last since I had a framework.. but since I knew the IP I removed the event ID field and added the IP. This created a filter for results of where the TA logged into various accounts

./optinsel_trace search ‘192.168.68.200’: timestamp ‘Event.System.TimeCreated_attributes.SystemTime’: from “2023-12: 13T09:24:23” | grep TargetUserName | sort | uniq

![image](https://github.com/user-attachments/assets/8e2324fa-a439-419d-94ef-55e0d3f4b6b6)

Answer: Administrator, Bytesparkle

### **Question 7**
What was the name of the scheduled task created by the TA?

Doing some digging in the task folder I found this one and by opening up I can see that it was created by onme of the accounts the TA accessed

![image](https://github.com/user-attachments/assets/afca3403-fca7-4326-b698-87345a3c923a)

Answer: svc_vnc

### **Question 8**
Santa’s memory is a little bad recently! He tends to write a lot of stuff down, but all our critical files have been encrypted! Which creature is Santa’s new sleigh design planning to use?

I saw we had some encrypted files and I saw a interesting DLL and to start I did some stringing on it. I ended up finding this…? I am wondering if that is a password potentially.

![image](https://github.com/user-attachments/assets/f2e3a471-a9f5-4a7c-8c73-b2eb9dc77acd)

At this point I was stuck so I took a page out of this persons writeup.

Following what he did in a cyber chef I was able to extract the non encrypted file revealing his big plan. I got confused but then realized the Unicorns are the name of the project, lol

![image](https://github.com/user-attachments/assets/ae57693c-7584-45a1-a839-d4d6fb01366a)

Answer: Unicorn

### **Question 9**
Please confirm the process ID of the process that encrypted our files.

So, I spent some time thinking how to find this. I thought maybe by looking at system logs I would have found it but no. I went back and looked through what I knew up to this point which was I knew the IP, and creation date of the tasks. I found that png file with the file extension .xmax which was apart of the attack and was a file that was encrypted.

Since I am looking for a PID the IP isn’t relevant in the search. So, this is what I came up with…

./optinsel_trace search ‘xmax’: timestamp ‘Event.System.TimeCreated_attributes.SystemTime’: from “2023-12: 13T09:24:23”
My idea was to look at all the events that included the encryption file extension that happened around or after when that task was created. This would give me a good idea oaf events that proceeded after everything I once knew. Finally, I was able to find data under the ‘UAC-FileVirtualization’ of when a .dll ran which was connected back to this PID 5828. I went to the logs my self to see these logs as I wasn’t aware of these. I learned something new!

![image](https://github.com/user-attachments/assets/97b3d026-e8b6-4b7c-b01d-e393b2403b18)

Answer: 5828

Happy to finally get around and posting the last writeup for the holiday challenge. I completed this campaign earlier this year but finally getting around to posting my writeup. This was a fun investigation overall. Didn’t do much malware investigation more just overall investigative work following an trail and lining up events
