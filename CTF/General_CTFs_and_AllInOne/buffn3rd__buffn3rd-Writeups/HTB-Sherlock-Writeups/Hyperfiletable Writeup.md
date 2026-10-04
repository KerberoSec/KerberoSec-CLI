# **HyperFiletable Writeup**

There has been a new joiner in Forela, they have downloaded their onboarding documentation, however someone has managed to phish the user with a malicious attachment. We have only managed to pull the MFT record for the new user, are you able to triage this information?

**Tools:**
- MFTExplorer
- Timeline Explorer
**Learned:**
- MFT Analysis
- Malicious File Analysis
- Timeline Analysis

### **Question 1**
What is the MD5 hash of the MFT?

This is simple! Windows has built-in functions you can use to hash a file. These are built-in native to windowws. 

![image](https://github.com/user-attachments/assets/d94f5890-c82a-4d3a-8b11-ebc9f8b79533)

**Answer:** 3730c2fedcdc3ecd9b83cbea08373226
### **Question 2**
What is the name of the only user on the system?

You will need to analyze the MFT in order to view this. The MFT file will show you all the files on the given system. Looking under the 'Users' folder we will see the only user account ever created

![image](https://github.com/user-attachments/assets/cfba75fd-24ef-4ce7-a998-94021c802d05)

**Answer:** Randy Savage
### **Question 3**
What is the name of the malicious HTA that was downloaded by that user?

Going into the Users\downloads folder you will see where the malicious file was downloaded. But lets learn what a HTA file is and what it is used for. An HTML application (HTA) is an executable file that combines HTML and scripting code to create an application. This can allow a adversary to deliver malicious payloads such as malware, ransomware, or spyware.

![image](https://github.com/user-attachments/assets/79b9c320-aafc-4e98-8b5b-042f7771325f)

**Answer:** Onboarding.hta
### **Question 4**
What is the ZoneId of the download for the malicious HTA file?

Clicking on the hta file we can observed in the 'Overview' pane the details of the file. I found the ZoneID by scrolling down a bit.

![image](https://github.com/user-attachments/assets/80515496-25f9-43d3-be02-fb25b11c8422)

**Answer:** 3
### **Question 5**
What is the download URL for the malicious HTA?

This is easy. In the 'Overview' pane it gives a wealth of information about the file including the download URL

![image](https://github.com/user-attachments/assets/48ff05cc-bc0e-41d2-8e47-ab6d17f6d0f8)

**Answer:** https://doc-10-8k-docs.googleusercontent.com/docs/securesc/9p3kedtu9rd1pnhecjfevm1clqmh1kc1/9mob6oj9jdbq89eegoedo0c9f3fpmrnj/1680708975000/04991425918988780232/11676194732725945250Z/1hsQhtmZJW9xZGgniME93H3mXZIV4OKgX?e=download&uuid=56e1ab75-ea1e-41b7-bf92-9432cfa8b645&nonce=u98832u1r35me&user=11676194732725945250Z&hash=j5meb42cqr57pa0ef411ja1k70jkgphq
### **Question 6**
What is the allocated size for the HTA file? (bytes)

You can either use CyberChef or do the math by hand but in the screenshot above you will find the 'Allocated Size: 0x1000'. It is in hexidecimal so the base is 16. I used CyberChef to convert it and the answer is 4096

![image](https://github.com/user-attachments/assets/f4917232-6895-40bd-9aca-f39efd072848)

**Answer:** 4096
### **Question 7**
What is the real size of the HTA file? (bytes)

Same concept as above except instead of using the allcoated you will use the real size field which is how big the file actually was. I used CyberChef and it told me the actual size being 1144 bytes

![image](https://github.com/user-attachments/assets/a89b6777-5b93-40a4-ab28-3ce5036f4f56)

**Answer:** 1144
### **Question 8**
When was the powerpoint presentation downloaded by the user?

In the MFT, the 'Overview' pane will show when the file was created which means downloaded to the system.

**Answer:** 05/04/2023 13:11:49
### **Question 9**
The user has made notes of their work credentials, what is their password?

I found a work.txt document that showed their credentials. Looking at the details of the file you will see in the resident data field it will show the context of the file which is the users creds

![image](https://github.com/user-attachments/assets/c3a3a9c1-b914-4e87-904c-8e167312b837)

**Answer:** ReallyC00lDucks2023!
### **Question 10**
How many files remain under the C:\Users\ directory? (Recursively)

I had to do some research how to configure this but I used timeline explorer to pull in the data of the MFT. I crafted a filter that look at the C:\users folder and files were in use. It came back with 3,471.

**Answer:** 3471
