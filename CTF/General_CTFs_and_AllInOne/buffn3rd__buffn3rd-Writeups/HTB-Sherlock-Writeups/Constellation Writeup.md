# **Constellation Writeup**
![image](https://github.com/user-attachments/assets/3127b273-df20-4818-88ae-387fe03c8b67)

The SOC team has recently been alerted to the potential existence of an insider threat. The suspect employee's workstation has been secured and examined. During the memory analysis, the Senior DFIR Analyst succeeded in extracting several intriguing URLs from the memory. These are now provided to you for further analysis to uncover any evidence, such as indications of data exfiltration or contact with malicious entities. Should you discover any information regarding the attacking group or individuals involved, you will collaborate closely with the threat intelligence team. Additionally, you will assist the Forensics team in creating a timeline. Warning : This Sherlock will require an element of OSINT and some answers can be found outside of the provided artifacts to complete fully.

**Tools**: 
  - Unfurl ([unfurl (dfir.blog)](https://dfir.blog/unfurl/))
### **Question 1**
When did the suspect first start Direct Message (DM) conversations with the external entity (A possible threat actor group which targets organizations by paying employees to leak sensitive data)? (UTC)

Downloading the files given we are given 2 files. 

First, is the NDA instruction as a pdf file which looks like a NDA between a company committing cyber espionage and working with someone internal at the company they are wanting to gather info on

Lastly, is a .txt file that has 2 URLs. The first URL links to the discord channel where the NDA file was exchanged. Last URL goes out to a web search on how to zip files.

Since the question is wanting to know when they first started conversation I am going to look at the Discord URL since that is a platform for communication. Using Unfurl which extracts metadata from URLs we can see that they shared the NDA here and we can see the first time stamps ready left-to-right. Following the tree map down to it we can easily determine this is the time the communications first started

![image](https://github.com/user-attachments/assets/26b01779-2201-458f-a299-3f7f239a5bc7)

**Answer:** 2023-09-16 16:03:37
### **Question 2**
What was the name of the file sent to the suspected insider threat?

Using the picture from question 1 you can clearly see the name of the file exchanged and also in the files given it is provided there.

![image](https://github.com/user-attachments/assets/fc35bcdb-28a4-49fd-8f08-9500e14ac781)

**Answer:** NDA_Instructions.pdf
### **Question 3**
When was the file sent to the suspected insider threat? (UTC)

Following the timeline from left-to-right you can see the URL was prased from when the NDA_Insturctions.pdf file was shared and there you can see hte timestamp of when the file was sent to the insider threat

![image](https://github.com/user-attachments/assets/b06428e9-dc86-44ef-93e4-d8159b13c2a7)

**Answer:** 2023-09-27 05:27:02
### **Question 4**
The suspect utilised Google to search something after receiving the file. What was the search query?

Finding this google search is relativly easy as it is a provided link in the files given. Understanding how links are built you can easily unravel that link by looking at the "searc?q=" which means the search query which is what the person searched. Remove the '+' signs and you have what they searched
	
![image](https://github.com/user-attachments/assets/b5ee6e90-8e10-4871-82e4-b2188fc8ad74)

**Answer:** how to zip a folder using tar in linux
### **Question 5**
The suspect originally typed something else in search tab, but found a Google search result suggestion which they clicked on. Can you confirm which words were written in search bar by the suspect originally?

Looking at the URL link above. You can see another search query... This was their original query they did 'How to archive a folder using tar i'. But they clicked on a URl that was 'How to zip a folder using tar in linux'
	
![image](https://github.com/user-attachments/assets/4ef4be5e-9362-4a41-ad7f-1973c69832fb)

**Answer:** How to archive a folder using tar i
### **Question 6**
When was this Google search made? (UTC)

Using Unfurl we can parse out the URL and the metadata tied to it to see when it was first searched. Following the the tree we can go from the search and see 'ei' which is the first intital timestamp in the URL. From there it was able to pull out the timestamp and convert it into a readable format

![image](https://github.com/user-attachments/assets/7627b697-6bb8-4951-95bc-fe186309eef1)

**Answer:** 2023-09-27 05:31:45
### **Question 7**
What is the name of the Hacker group responsible for bribing the insider threat?

Looking at the files provided my intial thought was to look at the NDA file. That should hold some information regarding a company. Indeed, it tells us what the group name is that is contacting the insider threat and giving them the details on how to exfilitrate the data they want and to safely and securely upload it to their SSH server

![image](https://github.com/user-attachments/assets/b2071f4b-735a-43cd-9381-34880530bb8a)

**Answer:** AntiCorp Gr04p
### **Question 8**
What is the name of the person suspected of being an Insider Threat?

Looking at the NDA file the company addresses the insider threat Karen Riley.
	
![image](https://github.com/user-attachments/assets/b42b0eff-63c6-444c-84dd-62a0c23f91aa)

**Answer:** Karen Riley
### **Question 9**
What is the anomalous stated creation date of the file sent to the insider threat? (UTC)

The only way to figure this is to extract the meta data from the NDA file. Using a meta data viewer tool you cane xtract all the data about a file. I found an online meta data viewer called 'Groupdocs metadata viewer'. I can see the creation data is spoofed to a future data. I was not able to get the creation date to be accepted. I did some research and found the answer to be what is listed below.
	
![image](https://github.com/user-attachments/assets/8e97fdf8-2c45-4687-a073-2f18bd4160dc)

**Answer:** 2054-01-17 22:45:22
### **Question 10**
The Forela threat intel team are working on uncovering this incident. Any OpSec mistakes made by the attackers are crucial for Forela's security team. Try to help the TI team and confirm the real name of the agent/handler from Anticorp.

Here we are wanting to see how weak the threat actor operational security is. Doing further OSINT searches on other platforms like LinkedIn we can see an account out there for anticorp gr04p and if we view their public post we can see the account is owned by Abdullah Al Sajjad
![image](https://github.com/user-attachments/assets/f9f51bd0-e87b-4c6d-ba86-5e8a8d0be0f3)

**Answer:** Abdullah Al Sajjad
### **Question 11**
Which City does the threat actor belong to?

We can see the location of the threat actor on their LinkedIn profile.

![image](https://github.com/user-attachments/assets/04305365-6c7f-4fa8-8e54-829fce6801b1)

**Answer:** Bahawalpur

Overall, this was a fun challenge getting to use a new OSINT tool! This was super easy and one of my favorite I have done thus far.
