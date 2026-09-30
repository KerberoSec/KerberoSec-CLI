# **Nubilum-2 Writeup**
![image](https://github.com/user-attachments/assets/dc37a79d-f2ac-4943-a745-af26cc90fd4d)

Leading telecoms provider Forela uses AWS S3 as an essential part of their infrastructure. They can deploy applications quickly and do effective analytics on their sizable dataset thanks to it acting as both an application storage and a data lake storage. Recently, a user reported an urgent issue to the helpdesk: an inability to access files within a designated S3 directory. This disruption has not only impeded critical operations but has also raised immediate security concerns. The urgency of this situation demands a security-focused approach. Reports of a misconfigured S3 Bucket policy for the forela-fileshare bucket, resulting in unintended public access, highlight a potential security vulnerability that calls for immediate corrective measures. Consequently, a thorough investigation is paramount.

**Tools:**
- Linux Command Line
**Learned:**
- Json Querying
- Timeline analysis
- Log analysis

### **Question 1**
What was the originating IP address the Threat Actor (TA) used to infiltrate the Forela’s AWS account?

Initial analysis we are given another CloudTrail logs. To start I feel overwhelemd so I started think what makes sense. Previously have done the Nubilum-1 cloud forensics I remember the eventname brought me alot of success. Referncing AWS CloudTrail documentation I found that the eventname 'CreatAccessKey' where an access key is created for an IAM user. These keys are used as programmtic acccessed key which are designed with certain accessed programmed to it. So, I will go back to using jq and compile my logs in a json file.

Here is my query: jq '.Records[] | select(.eventName=="CreateAccessKey")' logs_compiled.json

What I can analyze here is it brought back 2 records. Both with the same source IP. From there I noticed te user agent is odd and they got an errorcode of access denied. I believe this is a TA as the IP is originates outside of normal private IP's and given the error and odd user agent I have a strong assumption it is them

![image](https://github.com/user-attachments/assets/53105211-8591-4b23-a3ce-4bc77d182de5)

**Answer:** 54.242.59.197
### **Question 2**
What was the time, filename, and Account ID of the first recorded s3 object accessed by the TA?

Since I know the IP of the TA, and I found through the docuemntation the 'GetObject' event name is whenever an object in a S3 bucket is accessed it logs it out. So, how I found the answer was first I compiled a jq query that was this: jq '.Records[] | select(.eventName=="GetObject" and .sourceIPAddress=="54.242.59.197")' logs_compiled.json

That was alot of logs... too many to look through. So what I did is I found the key field which was the file name

![image](https://github.com/user-attachments/assets/f43944ca-8111-428a-97fc-460155df76d7)

At that point I had an idea of grep out the "key" then sorting and filtering on uniq entries: jq '.Records[] | select(.eventName=="GetObject" and .sourceIPAddress=="54.242.59.197")' logs_compiled.json | grep "key" |sort|uniq

![image](https://github.com/user-attachments/assets/4dc8aa47-05a7-4e3c-bf57-a79787b0e878)

I found that the last file actually in the list was the first file accessed by the TA. This took time as I boiled down when these files were accessed based off the field in the json file. Here is my reworked query: jq '.Records[] | select(.eventName=="GetObject" and .sourceIPAddress=="54.242.59.197"and .key=="prod-EC2-readonly_accessKeys.csv")' logs_compiled.json

**Answer:** 2023-11-02T14:52:03Z,prod-EC2-readonly_accessKeys.csv,anonymous
### **Question 3**
How many Access Keys were compromised, at a minimum?

I had to get crafty but the query I went with was this: jq '.Records[] | select(.eventName=="GetObject" and .sourceIPAddress=="54.242.59.197" and .requestParameters.key != null) | .requestParameters.key' logs_compiled.json | uniq | wc -l

Here I wanted to continue looking at the GetObject ID logs since it showed me the access keys. I filtered on the TA IP, and then I filtered on the requestParaemeter.key field. There my outpput resulted in 7

**Answer:** 7
### **Question 4**
The TA executed a command to filter EC2 instances. What were the name and value used for filtering?

Hmm, I cannot find a field that show this info. I did research and found that the requestParameter should have a subfield named 'filterSet' I will put this data in my splunk instance for this one. Bingo! Found it. Under the requestParameters field I noticed a subfield named 'filterSet' in the meta data and I learned this will show on any user who applies filters to see items.

**Answer:** instance-state-name:running
### **Question 5**
Can you provide the count of unsuccessful discovery and privilege escalation attempts made by the TA before gaining elevated access with the compromised keys?

I tried building a jq query out and I kept getting 1401 results for the errod code when searching through the logs. That was not close, lol. I went back into my splunk instance and noticed a field of "host" which is the hostanme of the device the TA is using. Adding that to my filter in splunk I found 42 attempts of privilege escalation. 

![image](https://github.com/user-attachments/assets/47522935-d725-4d39-b0ac-abd7e0467aee)

**Answer:** 42
### **Question 6**
Which IAM user successfully gained elevated privileges in this incident?

Earlier I remember when 2 results came back for the query. I noticed one account failed the other didn't I found hte account that they esclated to: jq '.Records[] | select(.eventName=="GetObject" and .sourceIPAddress=="54.242.59.197")' logs_compiled.json

![image](https://github.com/user-attachments/assets/be3a2129-10ea-4de4-9892-231e89f32648)

**Answer:** dev-policy-specialist
### **Question 7**
Which event name permitted the threat actor to generate an admin-level policy?

Through some google dorking I figured out the PutUserPolicy is an event that is generated whenever an admin policy is applied to an account

**Answer:** PutUserPolicy
### **Question 8**
What is the name and statement of the policy that was created that gave a standard user account elevated privileges?

Filtering on the PutUserPolicy event ID I found this account and the policy created

![image](https://github.com/user-attachments/assets/b2bbbfdb-496b-43c9-8009-59c85df6093b)

**Answer:** sbhyy79zky,[{"Effect": "Allow","Action": "*","Resource": "*"}]
### **Question 9**
What was the ARN (Amazon Resource Name) used to encrypt the files?

So I did some more google dorking and I was wondering if there was an event to filter on. More specifically I wanted to know if there was a API call that can be made because at this point I was so lost. So I read through documentation and I talked to a cyber security analysts for things to think of and they mentioned about the AWS APi. Going back to documentation I foudn an event type called 'AwsApiCall'. Going back I filtered on all the events and found it. I jq'd on it and I found the arn that they used. how I tracked this down was I paid attention to the userName field and it was the admin account the TA got to and the user agent was the same as the one I found earlier  and I noted the key being a .pptx file which is common to encrypt

![image](https://github.com/user-attachments/assets/b78ece2a-615b-4a17-8eff-6b4cc6727666)

**Answer:** arn:aws:kms:us-east-1:263954014653:key/mrk-85e24f85d964469cba9e4589335dd0f4
### **Question 10**
What was the name of the file that the TA uploaded to the S3 bucket?

Filtering on the event 'PutObject' which logs out users who put items in S3 buckets I found the file: jq '.Records[] | select(.eventName=="PutObject" and .sourceIPAddress=="54.242.59.197")' logs_compiled.json

![image](https://github.com/user-attachments/assets/9a1d6de2-5f0b-401c-abf9-aa028c4027a2)

**Answer:** README2DECRYPT.txt
### **Question 11**
Which IAM user account did the TA modify in order to gain additional persistent access?

I remember seeing on the 'CreateAccessKey' and the forela-admin account got created: jq '.Records[] | select(.eventName=="CreateAccessKey")' logs_compiled.json

![image](https://github.com/user-attachments/assets/f857a510-3c19-4a65-a609-f87915211944)

**Answer:** forela-admin
### **Question 12**
What action was the user not authorized to perform to view or download the file in the S3 bucket?

I did a jq query on the error message field being not null. I see alot of different logs but I noticed some odd logs around an account named forela-john. Specifically this event

![image](https://github.com/user-attachments/assets/d22838a0-0f7c-45af-be41-6a37cbf9b21a)

**Answer:** kms:Decrypt
