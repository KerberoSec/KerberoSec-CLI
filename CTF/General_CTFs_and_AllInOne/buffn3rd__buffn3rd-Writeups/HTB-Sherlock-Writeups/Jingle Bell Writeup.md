# **Jingle Bell Writeup**
![image](https://github.com/user-attachments/assets/3de76026-24f9-4387-87d1-ed1c2e8afa76)

Torrin is suspected to be an insider threat in Forela. He is believed to have leaked some data and removed certain applications from their workstation. They managed to bypass some controls and installed unauthorized software. Despite the forensic team's efforts, no evidence of data leakage was found. As a senior incident responder, you have been tasked with investigating the incident to determine the conversation between the two parties involved.

**Tools:**
- SQLite DB
**Learned**:
- Database Analysis
- HTTPS Analysis
### **Question 1**
Which software/application did Torrin use to leak Forela's secrets?

We are given a database file. The database program I chose to analyze this in is SQLite. From initial analysis I can see 8 tables. Looking through the notification table it has 23 rows of data. I see a column named 'Payload' this might be of interest especially if we are wanting to know a software app they used to leak secrets. This could have been through the web. Everything else isn't a software from my experience except Slack. And that answer is correct after trying it!

![image](https://github.com/user-attachments/assets/c8220452-eaa7-47a0-a0b9-bde1b2b200f1)

**Answer:** Slack
### **Question 2**

What's the name of the rival company to which Torrin leaked the data?

Clicking on the first row of data for the slack channel you can view the data on the right hand side in the tool. The title of the channel appears to be the name of the comapny the data was leaked to... at least that is what I suspect as the channel is oddly named to something specific. That is the correct answer. The reason I thought to look further into the data is though the payload just says 'slack' there is more data within each row that you can view. Dig into each row and you will uncover critical data

![image](https://github.com/user-attachments/assets/fa1e6c04-f7e9-4bcc-9a45-59f6a48cf555)

**Answer:** PrimeTech Innovations
### **Question 3**
What is the username of the person from the competitor organization whom Torrin shared information with?

Digging deeper into the same log reading each field you can see the message between Cyberjunkie and 'Cyberjunkie-PrimeTechDev' who is the other user from the competitor company.

![image](https://github.com/user-attachments/assets/72cc7a57-f236-4a16-ae6f-bcb8777bc0f0)

**Answer:** Cyberjunkie-PrimeTechDev
### **Question 4**
What's the channel name in which they conversed with each other?

For this one you will need to look at the other records related to slack. I found the answer in the last record for slack where they exchanged the secrets on this channel. This is a great challenge to better sharpen your skills on how to read XML:

![image](https://github.com/user-attachments/assets/ffa05433-a615-466d-b52f-fe08190a0a75)

**Answer:** forela-secrets-leak
### **Question 5**
What was the password for the archive server?

Continue looking at the various records you will see where Cyberjunkie-PrimeTechDev tells Cyberjunkie to post the archive files on their archive server and gives them the password:
	
![image](https://github.com/user-attachments/assets/5e2a5600-fe60-47cd-8ae5-b4d4eb5c6463)

**Answer:** Tobdaf8Qip$re@1
### **Question 6**
What was the URL provided to Torrin to upload stolen data to?

Again, keep digging through the records and you will see where they chat about a google drive link

![image](https://github.com/user-attachments/assets/5defe55b-ac24-43b6-b7bc-826248ee62d6)

In the log after they chatted about the link the person sent he link:

![image](https://github.com/user-attachments/assets/6fd31dcb-58ed-43cd-8ed6-dbf636f4ed07)

**Answer:** https://drive.google.com/drive/folders/1vW97VBmxDZUIEuEUG64g5DLZvFP-Pdll?usp=sharing
### **Question 7**
When was the above link shared with Torrin?

On that same message look at the columns of the record. That is a Unix timestamp. Convert it to a UTC timestamp

![image](https://github.com/user-attachments/assets/d3917e08-0109-4127-be18-6f7616d5f6e6)

**Answer:** 2023-04-20 10:34:49
### **Question 8**
For how much money did Torrin leak Forela's secrets?

In the very last record you can see the exchange of the money they did it for:

![image](https://github.com/user-attachments/assets/8b8dec6b-82fe-4d0b-bdc9-b46ad65c5eab)

**Answer:** £10000

Overall, this was a great challenge in analyzing a database file and reading logs between 2 individuals an insider threat and a company committing cyber espionage. It is a great challenge to get better hands on learning of reading XML code and using its artifacts to solve a incident.
