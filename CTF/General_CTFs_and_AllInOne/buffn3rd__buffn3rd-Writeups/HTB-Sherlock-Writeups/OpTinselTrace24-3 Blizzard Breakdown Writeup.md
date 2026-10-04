# **OpTinselTrace24-3 Blizzard Breakdown Writeup**
![image](https://github.com/user-attachments/assets/72215110-7abc-4b75-8b62-5bcd344f8e35)

Furious after discovering he's been left off the Nice List this holiday season, one particular elf: heavily influenced by Krampus: goes rogue, determined to take revenge. Consumed by anger, he hatches a sinister plan to sabotage Christmas by targeting Santa Claus' most critical asset: its S3 data archive! This repository holds sensitive information, including blueprints for new toys, holiday logistics, toy production schedules, and most importantly, the coveted gift list! With Christmas preparations in full swing, any disruption to this storage could cause chaos across the entire operation, threatening to derail everyone's holiday season. Will the holiday magic prevail, or will Christmas fall into dismay?

**Tools:**
	- JQ querying
**Learned:**
	- Proficiently parsing Cloudtrail Logs
	- AWS CloudTrail analysis
	- Data Exfiltration Analysis

Initial analysis we are given AWS logs, and a drive image. 
### **Question 1**
The Victim Elf shared credentials that allowed the Rogue Elf to access the workstation. What was the Client ID that was shared?

	Looking through the logs of the IRC chat you will see under the W4yne chats the user shared their ID

![image](https://github.com/user-attachments/assets/1fd692f2-08a1-4bc1-bb80-a70de811ba7b)

**Answer:** 95192516
### **Question 2**
What is the IP address of the Rogue Elf used during the attack?

	I took to the AWS Cloudtrail logs where I gzipped all the json files then merged them into one json file so I can leverage jq.

	Here is the command I ran: 
		- jq -r '.Records[].sourceIPAddress' merged_output.json *.json | sort | uniq

	It will then show the IP being the first one

![image](https://github.com/user-attachments/assets/6da27f29-1e6d-48dc-b6f1-1004801f1976)

**Answer:** 146.70.202.35
### **Question 3**
What is the name of the executable the victim ran to enable remote access to their system?

	I went directly to the prefetch files and began looking through them and noticed 'AA_v3.exe' which is not normal ona  windows workstation. 

![image](https://github.com/user-attachments/assets/573be52c-304e-466d-956c-00f6e374405c)

	As I was looking through the MFT file I came across this aa_nts.dll which I believe is a .dll apart of the AA_V3.exe.
	
**Answer:** aa_v3.exe
### **Question 4**
What time (UTC) did the Rogue Elf connect to the victim's workstation?

	You can gind the rogue connection time in the Ammyy logs on the computer. Convert the timestamp you find to PST UTC.

![image](https://github.com/user-attachments/assets/3fa1dcd2-acd4-48e3-9afa-bf89564f693c)

**Answer:** 2024-11-13 12:23:34
### **Question 5**
The Rogue Elf compromised an AWS Access Key. What is the AWS Access Key ID obtained from the victim's workstation?

	Using this filter:
	
	jq '.Records[] | select(.sourceIPAddress == "146.70.202.35")' merged_output.json

	I know in cloudtrail logs the accesskeyID is given therefore, since I know the IP of the victim I can find the access key they compromised.

![image](https://github.com/user-attachments/assets/b28d0418-f551-4139-8e97-1e80aabc845d)

**Answer:** AKIA52GPOBQCBFYGAYHI
### **Question 6**
Which S3 bucket did the Rogue Elf target during the incident?

	Filtering on the actions of the IP I found earlier 146.70.202.35 I created this jq search for it and I saw them interacting with this S3 bucket: arctic-archive-freezer

	jq '.Records[] | select(.sourceIPAddress == "146.70.202.35")' merged_output.json

![image](https://github.com/user-attachments/assets/ae21a8bf-0fcb-4f79-8b87-5ebe877d757c)

**Answer:** arctic-archive-freezer
### **Question 7**
Within the targeted S3 bucket, what is the name of the main directory where the files were stored?

	From the last screenshot you can see they were able to access a drawing file and you can see the main directory 

![image](https://github.com/user-attachments/assets/68cc3dff-c16c-4567-99bb-ffc2d2e31a38)

**Answer:** Claus_Operation_Data
### **Question 8**
What time (UTC) did the Rogue Elf disable versioning for the S3 bucket?

	Did a quick gogle search and learned the cloudtrail event name "Put BucketVersioning" is what is logged out anytime someone disables versioning on an S3 bucket. Therefore, I create this query to search for it

	jq '.Records[] | select(.eventName == "PutBucketVersioning")' merged_output.json

![image](https://github.com/user-attachments/assets/8080d934-928a-44c6-afa9-955aa39373de)

**Answer:** 2024-11-13 15:31:15
### **Question 9**
What is the MITRE ATT&CK Technique ID associated with the method used in Question 8?

	Doing some searching on Mitre I was able to find the ID

**Answer:** T1490
### **Question 10**
What time (UTC) was the first restore operation successfully initiated for the S3 objects?

	So, I created a query to search for the event RestoredObject which shows any restoration operations against an S3 bucket. It returned several results but reading through them  I was able to spot which was successfula nd I knew that because it did not yield an error message

	jq '.Records[] | select(.eventName == "RestoreObject")' merged_output.json

![image](https://github.com/user-attachments/assets/d2a97159-d414-4be6-87e9-a1ecf6e4fdd0)

**Answer:** 2024-11-13 15:43:49
### **Question 11**
Which retrieval option did the Rogue Elf use to restore the S3 objects?

	I saw the tier in the request parameters and doing some resereach I learned that is a parameter you can give it to be able to see the data in 1-5 mins

![image](https://github.com/user-attachments/assets/fe7a35a6-1697-47e3-9d99-56ecee54e1ca)

**Answer:** Expedited
### **Question 12**
What is the filename of the S3 object that the Rogue Elf attempted to delete?

	Using JQ and filtering on DeleteObject I can see what file was attempted to be removed

	jq '.Records[] | select(.eventName == "DeleteObject")' merged_output.json

![image](https://github.com/user-attachments/assets/29febfb1-c978-4461-9cda-c52a7990e195)

**Answer:** GiftList_Worldwide.csv
### **Question 13**
What is the size (MB) of the S3 object that the Rogue Elf targeted in Question 12?

	Once you find the file I built a query to search for the event name GetObject then the file name then counted how many occurences there were. the byte size of each GetObject is 8 mbs already so just count the occurecnes which is (19)

	`jq '.Records[] | select(.eventName == "GetObject" and (.resources[]?.ARN | test("GiftList_Worldwide.csv$")))' merged_output.json`

**Answer:** 152
### **Question 14**
The Rogue Elf uploaded corrupted files to the S3 bucket. What time (UTC) was the first object replaced during the attack?

	Doing a query on a PutObject event name which shows when someone replaces something in a S3 bucket I was able to find the first operation

	jq '.Records[]| select(.eventName == "PutObject")' merged_output.json

![image](https://github.com/user-attachments/assets/9f9dcb98-5a68-4296-99b6-1197a328a658)

**Answer:** 2024-11-13 16:10:03
### **Question 15**
What storage class was used for the S3 objects to mimic the original settings and avoid suspicion?

	In the same screenshot just rading below you will see the storage class they used to avoid detection

![image](https://github.com/user-attachments/assets/9ac77c1b-6fba-4cf0-bf83-a46cbcbf6704)

**Answer:** glacier

