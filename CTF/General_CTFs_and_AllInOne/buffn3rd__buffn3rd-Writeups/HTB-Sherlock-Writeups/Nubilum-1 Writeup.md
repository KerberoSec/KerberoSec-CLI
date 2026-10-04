# **Nubilum-1 Writeup**
![image](https://github.com/user-attachments/assets/621384e0-2bdd-4182-b71e-f0819d76f33e)

Our cloud administration team recently received a warning from Amazon that an EC2 instance deployed in our cloud environment is being utilised for malicious purposes. Our sysadmin team have no recollection of deploying this EC2, however do recall logging onto the AWS console and finding in excess of 6 EC2s running, which he did not recall deploying. You have been provided with the interview with our Cloud sysadmin within the triage.

**Tools**:
  - Linux CLI
**Learned**:
  - Json Querying
  - Timeline Analysis
  - Log Filtering and Analysis

### **Question 1**
Which AWS IAM account was compromised by the TA?

Initial analysis we can see there is a bunch of files in the unzipped files.. In the unzip we will observe cat scale logs, interview.txt, cloudtrail logs, a directory named unusual-directory, and forela storage (s3 bucket folder).

The cat scale logs are generated from a tool named CatScale that is a incident response collection tool used to pull data from Linux machines.

![image](https://github.com/user-attachments/assets/1a840bfa-ff05-446c-bb5e-d583befa04b4)

Here I will tackle the Cloudtrail logs as they will help me identify which IAM role was compromised because in the AWS logs I will see the assocaited IAM role with each account and I suspect I should see unusal activity with one. I did find some information to aid me such as a field named 'userName'

I spent some time sifting through the logs using grep so what I did is I used a regex to find the answer. Since in HTB it masks the answer with ('*') I first compiled my results into a json file. So, that the logs if I were to open them into a text editor are in a readable format and I can query them using the command jq, then I used grep: grep -E "[a-zA-Z0-9]{6}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{9}n and since earlier I found a useful field named userName I grepped on that and used the flag 'uniq' which only showe unique results and that is how I found the compromised IAM role

**Answer:** forela-ec2-automation
### **Question 2**
Where did the attacker locate the hard coded IAM credentials?

Here it doens't make sense to look in the CloudTrail logs for hard coded IAM creds. I suspect this is going to be located in a repository. Remember we are doing Cloud Forensics and are given other artifacts. Here I will begin in the S3 bucket folder. In there I found several files.

![image](https://github.com/user-attachments/assets/ea2b6b5f-3c32-4041-9b6d-ff3affbd4710)

What I am looking for is a file with a .json, .py like we see. Something that I know is a programming files. In personal experinces I have seen developers hardcode credentials which is a major security concern. As I expected.... here is where you can see hard coded creds. But I need to confirm if the TA has interacted with this file which will tell me they found this.

![image](https://github.com/user-attachments/assets/064a43c3-be3c-4eb3-b100-fba98d8068b5)

Here I peered through the CloudTrail logs. What I was keeping in my was the time when a file was interacted with and the ec2.py. Here I located where the ec2.py file was interacted with. How I got here took alot of research but I found some fields that I honed in on my search. I did a jq search on anything with a .Records where I created a statment looking for the userIdentity field being anonymous meaning the system could not identify who, where a access key was found (meaning the TA found the key from earlier), and they didnt get an access denied.

![image](https://github.com/user-attachments/assets/53561bf7-753b-4dff-b8fb-f0d0d0f19c0b)

**Answer:** /backups/ec2.py
### **Question 3**
In total how many EC2 hosts were deployed by the TA?

Now that I have confirmed they downloaded the ec2.py file which gave them the creds to the compromsied account. I need to understand how many hosts were deployed. Here I had to stop and think with what I knew. I knew the IAM name, forela-ec2-automation and from the previous question I identified when the file was downloaded. At this point I figured I could craft another jq to find my answer

My first query was this: jq '.Records[] | select(.userIdentity.userName == "forela-ec2-automation" and select(eventName=="RunInstances" and .eventTime >= "2023-01-24T22:37:59Z")' logs_compiled.json. Which gave this output which was too much. Then I thought how can I have it count. So I added a -wc flag to help count the output

![image](https://github.com/user-attachments/assets/dd913b40-c16e-4ad7-88d7-1550ef760073)

Boom! Perfect I got the answer by reworking my query: jq '.Records[] | select(.userIdentity.userName == "forela-ec2-automation" and select(eventName=="RunInstances" and .eventTime >= "2023-01-24T22:37:59Z")' logs_compiled.json | grep -i instanceid |wc -l

![image](https://github.com/user-attachments/assets/0a6b2196-abc7-4c73-83e3-99d9de9ad412)

**Answer:** 13
### **Question 4**
What is the name of the key pair/s generated by the attacker?

Here I learned CloudTrtail logs out an event called 'CreateKeyPair'. Let me build a jq using that event on my json compiled logs. Sweet I found the key pairs. I built a wuery to look for the events that generated the 'CreateKeyPair'. I first ran that and searched through the logs and saw the key but the field was 'keyName'. Then I went back to my original query and added a grep on the keyName

![image](https://github.com/user-attachments/assets/91ffb122-1751-43c4-8e77-58cb1a92329c)

**Answer:** 1337.key, 13337
### **Question 5**
What time were the key pair/s generated by the attacker?

Here is the query I ran: jq '.Records[] | select(.eventName=="CreateKeyPair")' logs_compiled.json | grep eventTime

![image](https://github.com/user-attachments/assets/69772ca8-c821-418f-ad92-71ad165bf8b1)

**Answer:** 2023-01-24T22:48:34Z,2023-01-25T12:01:38Z
### **Question 6**
What are the key pair ID/s of the key/s generated by the attacker?

I just removed the grep statement and searched through the fields and found the keyPairId field: jq '.Records[] | select(.eventName=="CreateKeyPair")' logs_compiled.json

![image](https://github.com/user-attachments/assets/cdec9f82-0577-4708-8cf4-3f368953e7a5)

**Answer:** key-0450dc836eaf2aa37
### **Question 7**
What is the description of the security group created by the attacker?

I had to do some research on the CloudTrail logs. I learned the 'CreateSecurityGroup' event name shows the creation of security groups. I felt this might be the best option for mke to figure out the security group the TA generated. There I found in the groupDescription field where it is named 'still here'

**Answer:** still here
### **Question 8**
At what time did the Sys Admin terminate the first set of EC2s deployed?

Back to documentaton on CloudTrail logs I found out it logs out an event named 'TerminateInstances'. Since I know when the event happened. Here is my first query: jq '.Records[] | select(.eventName=="TerminateInstances")' logs_compiled.json

I realized the output was too much so, I reworked it by adding when I knew the instances were created which allowed for better results. There I found when the first instance was shut down

![image](https://github.com/user-attachments/assets/3b35d1c2-2b23-487b-b383-99db4c224600)

**Answer:** 2023-01-24 23:25
### **Question 9**
Can we confirm the IP addresses used by the TA to abuse the leaked credentials? (Ascending Order)

It doesnt make since to run a query like I hav ebeen. I think I need to KISS (keep it simple stupid) and use a cat and use some flags like unique and sort. This took a while to come to this conclusion but after reviewing the field I wanted which was the sourceIPAdress I was able to get my results of 4 IP's

**Answer:** 95.181.232.4, 95.181.232.8, 95.181.232.9, 95.181.232.28
### **Question 10**
In addition to the CloudTrail data and S3 access we have provided artefacts from the endpoint reported by AWS. What is the name of the malicious application installed on the EC2 instance?

So, since they have produced the artifacts of the endpoint I suspect it is the unusual-directory. Instantly I noticed this is a PoshC2 framework which I know from the past they downloaded PoshC2 app

![image](https://github.com/user-attachments/assets/a8b53cc0-18e3-4437-872a-c2499824f77a)

**Answer:** PoshC2
### **Question 11**
Please can you provide the hostname and username details of any victims of the C2 server?

In the 'poshc2_server.log' file, I filtered on host to see if I'd get a hit and I ended up finding the compromised workstation

![image](https://github.com/user-attachments/assets/33bbb7dd-1301-46ea-a65f-19559d64fc2c)

**Answer:** DESKTOP-R4KM0GJ\Marcus Athony
