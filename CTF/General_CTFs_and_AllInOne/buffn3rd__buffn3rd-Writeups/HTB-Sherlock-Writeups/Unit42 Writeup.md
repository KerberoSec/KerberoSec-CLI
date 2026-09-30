# **Unit42 Writeup**
![image](https://github.com/user-attachments/assets/fa1ad5a3-f646-4649-af3b-97381b15411a)

In this Sherlock, you will familiarize yourself with Sysmon logs and various useful EventIDs for identifying and analyzing malicious activities on a Windows system. Palo Alto's Unit42 recently conducted research on an UltraVNC campaign, wherein attackers utilized a backdoored version of UltraVNC to maintain access to systems. This lab is inspired by that campaign and guides participants through the initial access stage of the campaign.

**Tools:**
- Windows Event Viewer
**Learned:**
- Windows Log Analysis

### **Question 1**
How many Event logs are there with Event ID 11?

Open up the sysmon log we got and filter on event ID '11' and you will see the number of events come back as 56.

![image](https://github.com/user-attachments/assets/8946c185-953e-4fb6-a7f6-53f49431806f)

**Answer:** 56
### **Question 2**
Whenever a process is created in memory, an event with Event ID 1 is recorded with details such as command line, hashes, process path, parent process path, etc. This information is very useful for an analyst because it allows us to see all programs executed on a system, which means we can spot any malicious processes being executed. What is the malicious process that infected the victim's system?

Filter on Event ID '1' to identify the malicious file that was executed. In the 2nd log that came in we saw that a file with an unusual file extension was brought into system emmory which raises a red flag in my head. This is a simple way to masquerade their malicious software by adding the double .exe
	
![image](https://github.com/user-attachments/assets/309e0ff8-8336-42a2-b1cd-2f018eadf634)

Through some research I found Event ID '3' will show network connections and it showed the technique that was used to get this malicious software and they used masqurading! For more information on what that is: https://attack.mitre.org/techniques/T1036/

![image](https://github.com/user-attachments/assets/fc9a96cc-4100-45e6-8b47-6c77c7697b51)

**Answer:** C:\\Users\\CyberJunkie\\Downloads\\Preventivo24.02.14.exe.exe
### **Question 3**
Which Cloud drive was used to distribute the malware?

Importnat to know all the Event ID's that can be generated through sysmon and a quick google search helped me identify the Event ID that would help me finding this. Filtering on '22' which shows you DNS logs you can see what the drive was to distribute this software.
	
![image](https://github.com/user-attachments/assets/63aafdf6-a0c9-45fb-8d2e-999865caf0ec)

**Answer:** dropbox
### **Question 4**
The initial malicious file time-stamped (a defense evasion technique, where the file creation date is changed to make it appear old) many files it created on disk. What was the timestamp changed to for a PDF file?

Event ID 2 is highlight any file creation time that was changed. I imagine I will see the malicious .exe in the log but the time will be altered. Filtering on it there are 16 events where the TA changed the time stamp. Found the log that indicated them doing a timestomp which is changing the time stamp on a log. Here we can did the timestomp then obfuscated it to a whole another part of the infected machines drive
	
![image](https://github.com/user-attachments/assets/28e40f27-2308-4df9-9500-881f6f759554)

**Answer:** 2024-01-14 08:10:06
### **Question 5**
The malicious file dropped a few files on disk. Where was "once.cmd" created on disk? Please answer with the full path along with the filename.

I believe Event ID '11' is what we want just by doing a google search. The reason I am choosing to search by this is it will show file creation and if there were files dropped on the disk maybe it logged it... Found the answer! Fitlering by that Event ID and reading the output of the log files I located the once.cmd and its path
	
![image](https://github.com/user-attachments/assets/091e7d59-9f25-4778-bd45-b0f1114d8fd2)

**Answer:** C:\\Users\\CyberJunkie\\AppData\\Roaming\\Photo and Fax Vn\\Photo and vn 1.1.2\install\\F97891C\\WindowsVolume\\Games\\once.cmd
### **Question 6**
The malicious file attempted to reach a dummy domain, most likely to check the internet connection status. What domain name did it try to connect to?

I will filter back on Event ID '22' as this was the DNS logs. I have a strong suscpision I will see this domain which I swore I saw earlier when looking through the logs. Found it! In this log you cna see the malware raching out to the example.com
	
![image](https://github.com/user-attachments/assets/9808a294-8f75-4c1d-adf8-3887c7d0ce0d)

**Answer:** www.example.com
### **Question 7**
Which IP address did the malicious process try to reach out to?

In the same log you can see the IPv4 address:

![image](https://github.com/user-attachments/assets/f856cfa4-a567-476a-b113-589103108c06)

**Answer:** 93.184.216.34
### **Question 8**
The malicious process terminated itself after infecting the PC with a backdoored variant of UltraVNC. When did the process terminate itself?

Doing some google searching I found event ID '5' will show process termination. My thought here is to filter on that and search for ultravnc or the malicious software. Found it! It was referncing the malicious software. But I was able to identify when the process for the malicious software was terminated
	
![image](https://github.com/user-attachments/assets/6b29a252-5e5c-4ad4-bb6e-cb809ef22f46)

**Answer:** 2024-02-14 03:41:58

Overall, this was fun forensics exercise highlighting sysmon log analysis. Understanding the various Event IDs and what they mean was key to solving this!
