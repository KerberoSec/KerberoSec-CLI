# **BFT Writeup**
![image](https://github.com/user-attachments/assets/93f03029-9f22-4ca8-8e9d-541f162a322a)

In this Sherlock, you will become acquainted with MFT (Master File Table) forensics. You will be introduced to well-known tools and methodologies for analyzing MFT artifacts to identify malicious activity. During our analysis, you will utilize the MFTECmd tool to parse the provided MFT file, TimeLine Explorer to open and analyze the results from the parsed MFT, and a Hex editor to recover file contents from the MFT.

**Tools:**
- MFTExplorer

**Learned**:
- MFT Analysis

### **Question 1**
Simon Stark was targeted by attackers on February 13. He downloaded a ZIP file from a link received in an email. What was the name of the ZIP file he downloaded from the link?

First, lets discuss what a $MFT file is. It is a special file on NTFS system that will show all the files and directories on a volume. This is important in the terms of digital forensics as it shows us the metadata of every file such as their file names, type, timestamps, when they were created/access/or modified.

To read a $MFT file you will need a parser tool. I recommend using Eric Zimmermans MFTExplorer it opens and parses the $MFT file. **NOTE** depending on the size of the file it takes time to open it up as it has to parse out everything inside which contains all the metadata of a system.

After it has opened I will head to the downloads folder of Simon since it says he downloaded a zip file. As I suspected I found a suspicious file named stage.zip that looked odd.

![image](https://github.com/user-attachments/assets/cd5891f0-2f07-4c6b-a18f-04d723f967e8)

**Answer:** Stage-20240213T093324Z-001.zip
### **Question 2**
Examine the Zone Identifier contents for the initially downloaded ZIP file. This field reveals the HostUrl from where the file was downloaded, serving as a valuable Indicator of Compromise (IOC) in our investigation/analysis. What is the full Host URL from where this ZIP file was downloaded?

Here I was able to find a zone transfer which appears to be the website of where the file was downloaded but I want to talk about a Zone Identifier because in terms of MFT analysis it is important. A 'Zone Identifier' is an alternate data stream which is a feature of windows NTFS file systems about hte security zone from which a file was downloaded. It is a perfect way to identify where something was downloaded from
	
![image](https://github.com/user-attachments/assets/9d5a91ab-fc57-4198-93ed-8ba7e3d592d6)

**Answer:** https://storage.googleapis.com/drive-bulk-export-anonymous/20240213T093324.039Z/4133399871716478688/a40aecd0-1cf3-4f88-b55a-e188d5c1c04f/1/c277a8b4-afa9-4d34-b8ca-e1eb5e5f983c?authuser
### **Question 3**
What is the full path and name of the malicious file that executed malicious code and connected to a C2 server?

I saw that it appear hte zip file was unzipped. I am going to follow that trail. Following the folders down it brings us to a bat file. Examining the file I can see it is malicious code as its going out to a known malicious IP and downloading something

![image](https://github.com/user-attachments/assets/6d3a2447-0c08-43b3-9aa9-08bb0a259a92)

**Answer:** C:\\Users\\simon.stark\\Downloads\\Stage-20240213T093324Z-001\\Stage\\invoice\\invoices\invoice.bat
### **Question 4**
Analyze the $Created0x30 timestamp for the previously identified file. When was this file created on disk?

Looking at that I was able to identify the timestamp. The '$Created0x30' is the actual date the file was created.

![image](https://github.com/user-attachments/assets/96b9d623-a503-4f33-91b3-adbab4517061)

**Answer:** 2024-02-13 16:38:39
### **Question 5**
Finding the hex offset of an MFT record is beneficial in many investigative scenarios. Find the hex offset of the stager file from Question 3.

The hex offset shows you what part of disk partition it is located in. Looking at top of the file in the overview pane we can see its location

![image](https://github.com/user-attachments/assets/11b0ea55-ae8c-4399-b8fe-809055bbe8cf)

**Answer:** 16E3000
### **Question 6**
Each MFT record is 1024 bytes in size. If a file on disk has smaller size than 1024 bytes, they can be stored directly on MFT File itself. These are called MFT Resident files. During Windows File system Investigation, its crucial to look for any malicious/suspicious files that may be resident in MFT. This way we can find contents of malicious files/scripts. Find the contents of The malicious stager identified in Question3 and answer with the C2 IP and port.

Looking inside the file when the command runs it links directly out to a website to download something. In the HTTPS address it is going out to the C2 IP and port

![image](https://github.com/user-attachments/assets/ea2718db-e739-458a-a4a7-34025636eaee)

**Answer:** 43.204.110.203:6666

Overall, this was a great challenge analyzing an $MFT file and important fields that can help you on your digital forensics.
