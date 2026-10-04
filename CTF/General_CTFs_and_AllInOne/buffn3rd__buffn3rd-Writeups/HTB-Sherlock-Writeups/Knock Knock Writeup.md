# **Knock Knock Writeup**
![image](https://github.com/user-attachments/assets/c571e326-c1c0-476f-8a3b-ff9fd48b8614)

A critical Forela Dev server was targeted by a threat group. The Dev server was accidentally left open to the internet which it was not supposed to be. The senior dev Abdullah told the IT team that the server was fully hardened and it's still difficult to comprehend how the attack took place and how the attacker got access in the first place. Forela recently started its business expansion in Pakistan and Abdullah was the one IN charge of all infrastructure deployment and management. The Security Team need to contain and remediate the threat as soon as possible as any more damage can be devastating for the company, especially at the crucial stage of expanding in other region. Thankfully a packet capture tool was running in the subnet which was set up a few months ago. A packet capture is provided to you around the time of the incident (1-2) days margin because we don't know exactly when the attacker gained access. As our forensics analyst, you have been provided the packet capture to assess how the attacker gained access. Warning : This Sherlock will require an element of OSINT to complete fully.

**Tools:**
- Wireshark
- NetworkMiner
- OSINT
- Kali Linux Command Line
**Learned:**
- Network Forensics Analysis
- Intrusion Analysis
- Data recovery
- Wireshark Filtering
- PCAP Analysis
- OSINT Analysis

Initial analysis we were given a pcap file for analysis.

### **Question 1**
Which ports did the attacker find open during their enumeration phase?

First, we need to identify the TA IP and the target machines IP. Appears the TA IP is 3.109.209.43 and the target machine IP is 172.31.39.46. I knew this by filtering on the protocol 'tcp' and saw some indication that port scanning was occuring given the tcp/ack response. My initial filter is this: 'ip.addr == 3.109.209.43 && tcp.flags.syn == 1 and tcp.flags.ack == 1' it is apparent that the ports that are open are: 21,22,3306,6379,8086

![image](https://github.com/user-attachments/assets/34860de5-8b4e-428b-aeaa-0c01193ba88d)

**Answer:** 21,22,3306,6379,8086

### **Question 2**
Whats the UTC time when attacker started their attack against the server?

This question is easy. Just look at when port 1 was scanned and that is the initial start of the scan

![image](https://github.com/user-attachments/assets/a6567d24-78ef-47d1-bfcf-f8034b74b570)

**Answer:** 21/03/2023 10:42:23

### **Question 3**
What's the MITRE Technique ID of the technique attacker used to get initial access?

Scrolling through the logs I saw the attacker had traffic go over FTP. So, I filtered on the traffic and noticed password spraying.

![image](https://github.com/user-attachments/assets/ebcc166e-9940-4f8a-b1eb-255b628ba15b)

This is indicative of how the attacker might have got in. I am going to continue looking through the FTP protocol to see if their was a success message. Researching about the response codes of FTP I found that 230 means login was successful which this helps prove how they got initial access to the system

Following the TCP stream I noted the creds that were successful in logging in.

![image](https://github.com/user-attachments/assets/bb6d3029-ff24-41a0-9cb7-c858f4f2102b)

Gathering all this data I suspect it is 'T1110.003' which is brute forcing through password spraying attacks.

**Answer:** T1110.003

### **Question 4**
What are valid set of credentials used to get initial foothold?

Looking at the last picture where I followed the TCP stream I was able to see the creds used.

**Answer:** tony.shephard:Summer2023!

### **Question 5**
What is the Malicious IP address utilized by the attacker for initial access?

I identified this through my initial anlaysis. You can see if you filter on ftp that an IP of 3.109.209.43 begins port scanning the target machine

![image](https://github.com/user-attachments/assets/09e40443-a3f4-4906-a6a3-00c1f0b6fd6e)

**Answer:** 3.109.209.43

### **Question 6**
What is name of the file which contained some config data and credentials?

Since I saw the attacker logged in using FTP I assumed this was how the exfiled some files out as I verified HTTP and SMB that there were no files exfiled through those. I did some research on if there were fields I can filter on in FTP. I found that if I filtered on 'ftp.request.command == "retr"' this looks for any commands that were run SPECIFICALLY for commands. The 'RETR' is the retrieve command in FTP where it goes to retrieve files.

I found 2 files: config, and fetch. I tried both for the answer and backup was the answer. Through research I was able to find that you can actually download the files which I will do. I will download the backup file using a tool called 'NetworkMiner' which will allow me to mine through the pcap file extracting the file

![image](https://github.com/user-attachments/assets/b11279f3-a477-4584-8937-1f645a6fe91d)

**Answer:** backup

### **Question 7**
Which port was the critical service running?

Under files in NetworkMiner I was able to find the 2 files that I saw over FTP. Opening the backup file in a text editor I can note that its doing some port knocking.

![image](https://github.com/user-attachments/assets/b593a6a4-6491-4a68-880b-a2347c628add)

The critical port is '24456' as that is within the command the TA is running and it wants connectivity to.
	
**Answer:** 24456

### **Question 8**
Whats the name of technique used to get to that critical service?

To get to the critical service it is known as 'Port Knocking'. Port knocking  is when ports on a firewall are opened by generating a sequence of connection attempts on a set of predefined closed ports. We can see that occur in the backup file we are viewing. It is going through those ports to get to the critical port where they want to open a service

![image](https://github.com/user-attachments/assets/072765a8-b17f-434f-be0d-137623cb59f4)

**Answer:** Port Knocking

### **Question 9**
Which ports were required to interact with to reach the critical service?

In the backup file you can see the ports needed to be interacted with'

![image](https://github.com/user-attachments/assets/937602f1-5ae6-4043-ac93-1520d8fc0eb3)

**Answer:** 29999,45087,50234

### **Question 10**
Whats the UTC time when interaction with previous question ports ended?

How I found this is I filtered on the first port in the backup file which is '29999' then I filtered on the TA IP: ip.addr == 3.109.209.43 && tcp.port == 29999

![image](https://github.com/user-attachments/assets/9d87fd57-e549-4b03-9758-5e582fae3bfc)

I changed my timestamp in Wireshark to display in UTC but this was the initial interaction with the very first port in the backup file.

**Answer:** 21/03/2023 10:58:50

### **Question 11**
What are set of valid credentials for the critical service?

In the backup file backup creds are stored

![image](https://github.com/user-attachments/assets/aab67d97-a01c-4cae-8b5b-d6adfc389047)

**Answer:** abdullah.yasin:XhlhGame_90HJLDASxfd&hoooad

### **Question 12**
At what UTC Time attacker got access to the critical server?

The user gained access to the system '172.31.39.46' here using the creds that were found in the backup file. I compiled all the data together and filtered on that Ip and the port knocking ports and finally I saw over port 24456 which is the port the TA wanted to connect to they finally gained access to the system. Also, I noted they downloaded a archived.sql, Done.docx, reminder.txt, .reminder. I will need to extract all of them.

![image](https://github.com/user-attachments/assets/7760ec0a-5564-40bc-9bd9-3d95041d0a8a)

**Answer:** 21/03/2023 11:00:01

### **Question 13**
Whats the AWS AccountID and Password for the developer "Abdullah"?

I was able to recover the files. Looking at the archive.sql file I looked at the sql dump and saw the AWS account ID for the developer creds who were leaked in the dump.

![image](https://github.com/user-attachments/assets/bd588565-68aa-4f29-91b2-6ac1b9adcab7)

**Answer:** 391629733297:yiobkod0986Y[adij@IKBDS

### **Question 14**
Whats the deadline for hiring developers for forela?

Opening the Done.docx I saw a horizontal barchart and at the top field name they are needing to hire 20 developers by 8/30/2023.

![image](https://github.com/user-attachments/assets/2c1eaacf-1552-4dc6-bd94-eb8153fd0e93)

**Answer:** 30/08/2023

### **Question 15**
When did CEO of forela was scheduled to arrive in pakistan?

In the reminder.txt it is a message that states that the CEO of Forela will arrive in the pakistan city at 3/8/2023

![image](https://github.com/user-attachments/assets/6b314165-472d-4a6f-8dcc-4343ff01c34e)

**Answer:** 08/03/2023

### **Question 16**
The attacker was able to perform directory traversel and escape the chroot jail. This caused attacker to roam around the filesystem just like a normal user would. Whats the username of an account other than root having /bin/bash set as default shell?

I took a hint on how to solve this. I had to utilize the .remidner.txt file. So I found that by searching the publioc GitHub repo (forela-finance/forela-dev) you can find this. Here is where the OSINT comes in to play! Through there I found the a .yaml file that had great detail on what it was doing. It appears it was downloading an SSH key, logging intoa  remote server via SSH, perform some actions on remote server then cleaning up the temp directory

Read the code further it looks like 'cyberjunkie' is a user and in the code I can see it having SSH access. I suspect this user might have sherll access. After trying the answer it was correct. I am going to download the github repo and run a git log. The reason I am wanting to do that is it will log out any previous commits to the repo... this might give me more info. This may help confirm my suspicion

![image](https://github.com/user-attachments/assets/bee7c991-9c6c-48b6-bf53-414ac3b00ab3)
	
So my thinking was correct in that I thought they had shell access based off this yaml file: https://github.com/forela-finance/forela-dev/blob/main/internal-dev.yaml

![image](https://github.com/user-attachments/assets/6c71e926-40c5-4482-bc4c-369d64a5db58)

**Answer:** cyberjunkie

### **Question 17**
Whats the full path of the file which lead to ssh access of the server by attacker?

This was exposed when the TA downloaded the archived.sql, Done.docx, reminder.txt and going back through the tcp stream I saw they downloaded a .reminder. I went back and look at the TCP stream as this was the only other time I identified they downloaded files and I found this file '.reminder'. I extracted it and saw it had the working directories for the SSH access which lead me there. Also, it was what lead to me go to GitHub to look at the repo

**Answer:** /opt/reminders/.reminder

### **Question 18**
Whats the SSH password which attacker used to access the server and get full access?

This took a bit of time. I had to google the git commands that are useful. I found a few to be of good use:
	- git clone (repo)
	- git log
	- git checkout (users ID)

I used Git clone to clone the repo in question then I used a git log to show me the repo commits to the current report. From there I learned that a git checkout will update the file in the repo with the user last commit but you have to provide the users ID token. Cyberjunkie had various commits so I checked all of them and found 'ffee1d9c3150b182c4d029d27245e308a8537a6' was the user ID token that exposed the SSH creds they used to gain access.

After each user ID token I had to manually check the .yaml file as it would update it with the past info that was once in the yaml file when they made the commit. Further proves they have SSH access like I thought

![image](https://github.com/user-attachments/assets/26ec90b4-3ba4-4623-871e-78905dc640ab)

**Answer:** YHUIhnollouhdnoamjndlyvbl398782bapd

### **Question 19**
Whats the full url from where attacker downloaded ransomware?

I found this in NetworkMiner as I was looking at all the files I went ahead and opened upm the ransomware folder as I was curious what it was. In the file path if you start from the IP address and proceed going to the right that is the address. Simple understanding of networking will help you solve this!

![image](https://github.com/user-attachments/assets/5f5afa33-90d9-43ad-b964-39ab09e4e762)

**Answer:** http://13.233.179.35/PKCampaign/Targets/Forela/Ransomware2_Server.zip

### **Question 20**
Whats the tool/util name and version which attacker used to download ransomware?

Looking back at NetworkMiner I can see the protocol, source and dest IP, and port it communicated with. I am going to build a filter inside of Wireshark to gind the Get request.I created a simple filter on: http && tcp.port 37808

It allowed me to see any traffic going on with that specific port that was HTTP related and I found the get request for the 'ansomware_server.zip'. I opened up the HTTP stream and I saw the user agent which was the tool used

![image](https://github.com/user-attachments/assets/3926d0f4-6a60-4878-84dc-393308df3eb2)

**Answer:** Wget/1.21.2

### **Question 21**
Whats the ransomware name?

In the same HTTP packet stream Is earched for the ransomware file name and I went through and at the end I found the name

![image](https://github.com/user-attachments/assets/e81f0b5a-8e89-4fe0-befa-81610889683b)

**Answer:** GonnaCry

Wow, this was a fun and time consuming sherlock. But once you had all the information you needed it all fell into place. This went over network forensics, OSINT analysis, intrusion analysis, malicious HTTP GETs and so much more. This definitely helped sharpen my skills within these domains!
