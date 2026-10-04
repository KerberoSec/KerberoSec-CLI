# **Noted Writeup**
![image](https://github.com/user-attachments/assets/7dd6f03c-c96b-4f60-9d7f-536565806ef9)

Simon, a developer working at Forela, notified the CERT team about a note that appeared on his desktop. The note claimed that his system had been compromised and that sensitive data from Simon's workstation had been collected. The perpetrators performed data extortion on his workstation and are now threatening to release the data on the dark web unless their demands are met. Simon's workstation contained multiple sensitive files, including planned software projects, internal development plans, and application codebases. The threat intelligence team believes that the threat actor made some mistakes, but they have not found any way to contact the threat actors. The company's stakeholders are insisting that this incident be resolved and all sensitive data be recovered. They demand that under no circumstances should the data be leaked. As our junior security analyst, you have been assigned a specific type of DFIR (Digital Forensics and Incident Response) investigation in this case. The CERT lead, after triaging the workstation, has provided you with only the Notepad++ artifacts, suspecting that the attacker created the extortion note and conducted other activities with hands-on keyboard access. Your duty is to determine how the attack occurred and find a way to contact the threat actors, as they accidentally locked out their own contact information.

**Learned:** 
  - File System Analysis
  - XML Files

### **Question 1**
What is the full path of the script used by Simon for AWS operations?

Initial analysis of the files we are given a couple xml files and txt files. One thing to not is the file type have been changed to include the timestamp. The TA has done this to evade detection. I suspect we might find this script in one of the xml files more the config file if I had to guess. The reason I will go here first as this is the configuration file of the web server. I found the script! It appears Simon loaded the file whenever the config file was executed
	
![image](https://github.com/user-attachments/assets/07b0d5ac-871b-4fc3-8f70-758dd19871e1)

**Answer:** C:\Users\Simon.stark\Documents\Dev_Ops\AWS_objects migration.pl
### **Question 2**
The attacker duplicated some program code and compiled it on the system, knowing that the victim was a software engineer and had all the necessary utilities. They did this to blend into the environment and didn't bring any of their tools. This code gathered sensitive data and prepared it for exfiltration. What is the full path of the program's source file?

This one is a fun one! It appears the TA obfuscated their code and to evade detection altered the file type of the 'LootAndPurge.java' file to have the timestamp but when the system compiles it will read as a java file. I opened this file up and you can see the code and it is getting system information from the victim.

![image](https://github.com/user-attachments/assets/227f03e1-1653-414b-b540-7bdfc43f04e6)

**Answer:** C:\\Users\\simon.stark\\Desktop\\LootAndPurge.java
### **Question 3**
What's the name of the final archive file containing all the data to be exfiltrated?

Analyze the javascript code and you will see it is concatenating is exfil data with the zip folder name and then for th ehackers purposes it will give the message that it was successful

![image](https://github.com/user-attachments/assets/5bece575-70d3-42d5-97b8-a7af7ba96a51)

**Answer:** Forela-Dev-Data.zip
### **Question 4**
What's the timestamp in UTC when attacker last modified the program source file?

The file I will look at is the session.xml. I am familair enough to understand what this file purpose is for a web app but I am going to it will give info on the session of the webpage like when the attacker pulled in the 'lootandpurge' which has the sourcecode the attacker used. In the file you will see where the call in the 'lootandpurge' file, and its modified date as a windows file system date. You need to convert this from an Windows NT time stamp to a UTC time stamp:

![image](https://github.com/user-attachments/assets/cff7b68b-7553-423a-a826-4266d7b57106)

I accredit this to the writeup done by the author. I tried scowering the web for the alogrithim that was used and couldn't find it. I had to use the authors algorithim to solve this.

**Answer:** 2023-07-24 09:53:23
### **Question 5**
The attacker wrote a data extortion note after exfiltrating data. What is the crypto wallet address to which attackers demanded payment?

Visiting this url that was provided in the 'YOU GOT HACKED' text file: https://pastebin.ai/bigbsy36to. You will see the pastebin is password protected. Lets see if we can find the creds hardcoded somewhere. I found them. I revisited all the files and in the 'LootAndPurge.java' file where the attacker built the malicious code I was able to uncover.

After I got into the pastebin I saw the crypto wallet address

![image](https://github.com/user-attachments/assets/a544bccc-9bfb-4cb9-8d11-74ed31e7e9fc)

**Answer:** 0xca8fa8f0b631ecdb18cda619c4fc9d197c8affca
### **Question 6**
What's the email address of the person to contact for support?

In the PasteBin you can see the person of contacted

**Answer:** CyberJunkie@mail2torjgmxgexntbrmhvgluavhj7ouul5yar6ylbvjkxwqf6ixkwyd.onion
