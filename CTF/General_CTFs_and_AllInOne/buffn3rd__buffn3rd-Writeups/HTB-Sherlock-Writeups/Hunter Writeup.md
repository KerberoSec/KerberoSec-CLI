# **Hunter Writeup**
![image](https://github.com/user-attachments/assets/56ede865-416f-4b7f-b06c-c85bd344346f)

A SOC analyst received an alert about possible lateral movement and credential stuffing attacks. The alerts were not of high confidence and there was a chance of false positives as the SOC was newly deployed. Upon further analysis and network analysis by senior soc analyst it was confirmed that an attack took place. As part of incident response team you are assigned the incident ticket. The network capture device had some performance issues from some time so we unable to capture all traffic. You are provided with the Artifacts acquired from the endpoint and the limited network capture for analysis. Now it's your duty to conduct a deep dive with the provided data sources to understand how did the incident occurred.

**Tools:**
- Evtxcmd
- Amcache
- PEcmd
- Timeline Explorer
- Wireshark
**Learned:**
- Network Forensics
- Intrusion Forensics
- IoC Analysis
- CVE Analysis
- Timeline Analysis
### **Question 1**
What is the mitre technique ID of the tactic used by the attacker to gain initial access to the system?

I have looked htrough many of the event logs until I got to the system logs and foltered on event ID '7045' which shows a service was created. What lead me all here was I didn't find anything in the pwoershell logs that might have showed me how the attacker gained initial access. Not until I got to the system logs and did filtering on important Event ID's to help show IoC's I got to 7045 and saw this service name that didn't seem quite right.
	
Filtering on event ID 7045 in the system event log I saw the creation of a service named 'owUjOMCY.exe'. What was also odd was the name of the service didn't seem like an actual service name

![image](https://github.com/user-attachments/assets/ab8a0176-5e09-4e54-bb3f-4818fcc2b015)

**Answer:** T1569.002
### **Question 2**
When did attacker gain a foothold on the system? (UTC)

Since I know when the service was made I will go back to the sercurity logs and filter on '4624' which shows successful log ons. Awesome, this small amount of detail helped me line up events and figure out when te attacker gained a foothold. In the security logs I was able to look towards when the service was created and correlate log on events that happened during that time and noted one that seemed odd. 

The logon type is a 3 which means it was done over the network and the account used was Alonzo.Spire which is important detail.

![image](https://github.com/user-attachments/assets/1d2d5b50-904c-490d-b23a-2e0df4322a75)

**Answer:** 2023-06-21 11:19:34
### **Question 3**
What's the SHA1 hash of the exe which gave remote access to the attacker?

I had to do some research and I found the Amcache.hve file is a Windows registry hive that has information about software and excuteables that were ran. More specifcally it also shows the SHA1 hash of files that were ran. Using 'Amcache' parsing tool by Eric Zimmerman I parsed out the Amcache.hve artifact which can be found here: 2023-06-22T092426_Acquisition\C\Windows\AppCompat\Programs

After aprsing it out and opening it in Timeline Explorer I found the SHA1 hash in the 'UnassociatedFileEntries.csv'. Since earlier I found the malicious service that helped give them initial access. I found that executable and its SHA1 hash in the file

![image](https://github.com/user-attachments/assets/b5dbe741-f6e0-45ac-a31c-cd4de296bf82)

**Answer:**
23873bf2670cf64c2440058130548d4e4da412dd
### **Question 4**
When was whoami command executed on the system by the attacker? (UTC)

I went ahead and parsed all the event logs using ExtxeCmd but I did not find when the command was ran so I am wondering if the 'WHOAMI.exe' ran. I will check the prefetch files! The prefetch files are a perfect resource to see if a program has been ran as these store items that have been ran on the system. In the prefetch files I can see the whoami file was ran! I will use another tool called 'PEcmd' to see when it was pulled into system memor and ran it. This tool is designed to pull this information out of out.
	
![image](https://github.com/user-attachments/assets/562ce4cc-0126-4d4d-92a0-1d15ce9e61b9)

Here is when the file was actually executed

![image](https://github.com/user-attachments/assets/b566658a-fc8c-4d12-b317-27f1cf569a29)

**Answer:** 
### **Question 5**
We believe the attacker performed enumeration after gaining a foothold. They likely discovered a PDF document containing RDP credentials for an administrator's workstation. We believe the attacker accessed the contents of the file and utilised them to gain access to the endpoint. Find a way to recover contents of the PDF file and confirm the password.

I had to do a bunch of research to figure out what Windows artifact would help me here. After some research and asking some people I was prompted to look into the Windows.edb. Doing research on this artifact I learned that it is the database used by the Windows Search Service that stores indexed information about files and other items on a Windows system. It contains metadata so in terms of what I am wanting I am trying to find a pdf file. If any artifact will have this information it will be the this database file and it will show me the metadata on it aka the password.

I had to ask someone who is an experienced Cyber Analysts on a tool and they mentioned this one: Search Index DB Reporter. This tool is perfect for what I am needing as it is a cmdline tool that will parse it out into a csv which is human readable. I was able to find the answer being 'JollyRancherATForela22'

![image](https://github.com/user-attachments/assets/44db0b65-4f82-4277-b021-3560a59bfe7e)

**Answer:** JollyRancherATForela22
### **Question 6**
At what time did the adversary initially authenticate utilizing RDP? (UTC)

In order to solve this I went to the rdp event logs named 'RemoteDesktopServices'. I started looking through and reading each log as there werent many and came across this one.... where I noticed a connection was made to the compromised workstaton.

![image](https://github.com/user-attachments/assets/793539ea-88f5-4679-a0b1-caca8535cb77)

Not a ton of detail but after looking at when the event happened it was after the initial foothold of the system which we found earlier. 

![image](https://github.com/user-attachments/assets/58f9a675-83c5-48c1-a205-58ceed561aa4)

This could point to when they initially RDP'd in but its not for sure enough evidence but when I opened up the Security logs and filtered on event id "4624" that is when I was able to make the connection. I was looking for a logon type of 10 which meant the user logged on using RDP and I found it. I can now tie this events together and confirm this was the time the TA RDP'd in.

![image](https://github.com/user-attachments/assets/5f9b7eab-b752-4e00-b2f9-25bbda95fd26)

**Answer:** 2023-06-21 11:44:52
### **Question 7**
The security team have located numerous unusual PowerShell scripts on the host. We believe the adversary may have downloaded the tooling and renamed it to stay hidden. Please confirm the original name of the malicious PowerShell script utilised by the attacker.

My immideiate thought would be to check the powershell history and when I did I see they downloaded a sysmon config. Something interesting I see is those get commands to see domain controllers, users etc. I did some research from what I am seeing and it is suggesting is PowerView. It is a library within PowerShell to enumerate and gather Active Directory info.

The attacker ran the clean.ps1 script which ran these commands.... I suspect this is the PowerShell script but I need to find its original name.

![image](https://github.com/user-attachments/assets/45134565-a667-462d-8eb0-95be20956bf8)

Here is the GitHub repo for it: https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1

**Answer:** powerview.ps1
### **Question 8**
We believe the attacker enumerated installed applications on the system and found an application of interest. We have seen some alerts for a tool named Process Hacker. Which application were they interested it?

Earlier I had open alonzo.spire web history and going back to this I noticed they had quite a few searches. One of those being ProcessHacker... I was able to confirm they downloaded by looking at their download history. So, confirming this is installed.

![image](https://github.com/user-attachments/assets/457306ad-1da5-4ba8-b42a-7bfce14bee9b)

I was able to see in the prefetch files it was ran... Also, one thing to note is I noticed several other downloads like pc cleaner, filezilla, keepass, and stuff from GitHub... Still confused on how to solve this I stumbled across this folder path: C\Users\alonzo.spire\AppData\Roaming\Microsoft\Windows\Recent.. I learned that this is where Windows stores shortcuts for files and documents that have been recently accessed.

I think this might be a strong clue to help aid me here. Everything looks normal until I saw this dump file with a PID

![image](https://github.com/user-attachments/assets/470944e8-bb95-4a75-bc2b-c8415f1fe8ff)

I suspect that is the Keepass install because I see the other items he downloaded and not Keepass. Doing research that PID is the Keepass PID. Therefore, I suspect the TA was enumerating for and going to target Keepass.

**Answer:** Keepass
### **Question 9**
What was the name of the initial dump file?

This was answered with my initial finding. 

**Answer:** pid9180.dmp
### **Question 10**
The attackers downloaded a custom batch script from their C2 server. What is the full C2 domain url from where it was downloaded?

I suspect this Scout.bat is the bat file they downlaoded. I found that under the Pictures folder un the alonzo user. I am going to check powershell logs to see if I can find that

![image](https://github.com/user-attachments/assets/a188fb5f-1efb-4d3a-a56c-983b7faed9b1)

So far I have tried looking at PowerShell logs, Google Chrome and Edge web history and I did not see any history of the 'Scout.bat' file being downloaded. Another thing I will check is prefetch files... this can be useful to see if the 'Scout.Bat' was ran. Interesting... after I parsed through the prefetch files I noticed the certutil program was ran. I learned certutl is a command line utilit tool to mangae certifications for Windows environments.

![image](https://github.com/user-attachments/assets/8e02fcf4-58e9-4cc3-8e02-28805dd7f5ad)

What I learned is it builds out this folder path: C\Users\alonzo.spire\AppData\LocalLow\Microsoft\CryptnetUrlCache\MetaData which holds system files related to the CertUtil program. Here I can find meta data about commands ran, urls, certificates pulled down etc. I am going to see if I can read anything in the 10KB file.

![image](https://github.com/user-attachments/assets/818679b0-02ac-4b02-a742-fe962e217464)

Interesting I wonder if this is the batch script? Hmm, I think I am going to open all te system files to see if I can see anything else. I didn't find the URL. I am going to peek back at the original file I looked at. Interesting enough I scrolled back through and at the bottom of the script I found the URL.

![image](https://github.com/user-attachments/assets/5d21bae4-1170-48dd-9d45-0b59121f985b)

**Answer:** http://oakfurnitures.uk/ovxlabd/campaign/uk_orgs/Scout.bat
### **Question 11**
Whats the MD5 hash of the batch script?

Well the only thing i can think is saving the file I found in the CryptnetUrlCache that I thought was the Scout.bat folder and doing an MD5 hash of it.

![image](https://github.com/user-attachments/assets/0923cb2c-c7d6-4ad9-860a-540b6cc55c5c)

**Answer:** 93F595357E23C5FCE3ED694DAFA7C0A3
### **Question 12**
The attackers tried to exfiltrate the data to their FTP server but couldn't connect to it. The threat intelligence team wants you to collect more TTPs (Tactics, Techniques, and Procedures) and IOCs (Indicators of Compromise) related to the adversary. It would be really helpful for the TI team if you could provide some useful information regarding the attacker's infrastructure being used. Can you find the domain name and the password of their FTP server?

Oh! I found that they downloaded FileZilla therefore, I suspect they were trying to use that to exfil data back to their FTP server. Let me do research on how FileZillia builds its folder structure out. Under this folder: C\Users\alonzo.spire\AppData\Roaming\FileZilla

I opened up the xml file since I assumed that is the config for FileZilla and if I were to find anything I thought it would be here

![image](https://github.com/user-attachments/assets/79441070-27cc-414b-9ede-02a8bd29683c)

In order to get the password you will need to decode it form Base64

![image](https://github.com/user-attachments/assets/4dba4ad2-c47f-43a7-bd14-14d64d10aaea)

Ope, so the hostname I thought I found in the filezilla.xml was not it. Let me try this other xml file. Interesting in the last xml file I found te FTP server but I scratched my head as I thought the creds I found earlier were it they werent.

![image](https://github.com/user-attachments/assets/3fd42987-bd46-4667-a134-30048b7aa88e)

I actually after finding the FTP server I saw a different password and decoded that one and that was the creds to login.

**Answer:** ypmlads.ftp.fileserver:UionskHGTLDS
### **Question 13**
Upon failing their initial attempt to exfiltrate data, the SOC team observed further FTP data being sent to a cloud environment. It is believed that the attackers spun up an instance on the cloud and ran another FTP server hastily to exfiltrate the collected data. Please try to find more information regarding the adversary's infrastructure, so the Threat Intel team can better understand which group might be behind this attack. What is the remote path on the adversary's server where they stored the exfiltrated data?

I actually found this in the filezilla.xml

![image](https://github.com/user-attachments/assets/da6a1131-c687-4241-9f1b-cc982714bbfd)

**Answer:** /home/theyoungwolf/xchjfad/uk_campaigns
### **Question 14**
For how long did the tool used for exfiltrating data, run before being closed? (Answer in seconds)

A nifty way to solve this is to use the users NTUser.dat file which shows metadata about the user. The key detail is the recent activites showing the exfil tool runtime... This took time to find it but I learned through some research under this folder path in Registry Explorer: 'software\Microsoft\windows\currentversion\explorer\userassist'
	
I was able to find FileZilla being ran.

![image](https://github.com/user-attachments/assets/a65e5cf8-b774-4398-a952-cce3e833b726)

**Answer:** 648
### **Question 15**
The security team highlighted that information pertaining to a sensitive project may have been exfiltrated by the attackers and are now worried about the threat of extortion. Which directory did the attacker manage to stage and then exfiltrate?

This is easy. Use shell bags. The shellbags are Windows operating systems that store the view preferences and other metadata for folders that a user has accessed via Windows Explorer. To find the shellbags of the user you can go here: C:\Users\Alonzo.spire\Appdata\local\Microsoft\Windows\ and load the UsrClass.dat

I believe REDACTED_SENSITIVE is the folder path the TA touched given the timestamp of when it was last interacted with which is within the timeframe the TA had access to the system

![image](https://github.com/user-attachments/assets/e0facbf2-7dfc-4c27-9e34-da8c20fc61a3)

**Answer:** C:\Users\Alonzo.spire\Documents\REDACTED_SENSITIVE
### **Question 16**
What specific CVE did the attacker exploit to gain access to the sensitive contents?

Lets talk about what we know. The attacker gained a foothold on the system by a service. From there they ran the whoami.exe and then used RDP. They then downloaded keepass, filezilla, process hacker. and other apps to aid in their exfil. We understand KeePass was the app they enumerated using process hacker where they dumped its PID and were targetting and FileZilla was used to exfil data back to their FTP. Why would they want to target keepass since that is a known credential manager? 

Doing a quick Google search I found this article: https://sysdig.com/blog/keepass-cve-2023-32784-detection/#:~:text=During%20May%2C%20a%20new%20vulnerability,the%20process%20that%20was%20running.

CVE-2023-32784 is the answer! This vulnerability is what the TA exploited which allowed them to extract the master key in cleartext from the system memory of the running process.... so now I wonder what account password do they have access to
	
**Answer:** CVE-2023-32784
### **Question 17**
Find a way to access the sensitive information. The information was related to development of an internal application. What is the suggested name for this app?

Given that we know the CVE I will see if there is a POC. Here is the POC: https://github.com/vdohney/keepass-password-dumper/blob/main/Program.cs

I had the thought to go back to Wireshark I remember seeing FTP data. Here i found where they finished download a keepass.zip file

![image](https://github.com/user-attachments/assets/6445a43e-532e-4b64-97e8-de56679f2dcc)

I downlaoded the file and the keepass POC... In order to access it give it the password we found earlier. Running the program against the zip file it found the password. While extracting the keepass file there was a database file I extracted as well

![image](https://github.com/user-attachments/assets/4205413f-eff8-4022-8355-f15b89fc729e)

So, this is coming full circle. We have the master password for this database. Using it.. it unlocked the database with it and it showed the file they exfiled and opening that I found 2 more files. 

![image](https://github.com/user-attachments/assets/a69133f9-340f-4020-ac68-d7ab9e09e4f3)

I opened the 'Notes.txt' which showed the app name
	
![image](https://github.com/user-attachments/assets/874c82f8-c244-4ce5-86f5-fc3a36ce34e8)

**Answer:** C-Comms
### **Question 18**
SSN were also part of the sensitive project which was exfiltrated by the attacker. What is the SSN number of Arthur Morgan from zeeindustries?

Opening the other txt file I was able to uncover the SSN for Arthur Morgan

![image](https://github.com/user-attachments/assets/4eceacbc-0845-43ca-a4b5-1c2f897f3a17)

**Answer:** 762-67-5421
### **Question 19**
We believe the domain admin credentials have been leaked in this incident. Please confirm the Domain Admin password?

Yes they were you can find that within the database file by opening up the admin account!

**Answer:** PapxxuW5Ly8t3KSl8G1k

Wow, this took some time for me to complete. It required patience on my end following the various artifacts and piecing together the event and extracting data where it made sense. I did a lot of traversing through the folder structure and research! Overall, this taught me persistence is inevitable and it will leads to finding the answers but following the timeline of events and paying close attention to timestamps was important for me.
