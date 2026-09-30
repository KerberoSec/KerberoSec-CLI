# **OpTinselTrace24-4 Neural Noel Writeup**
![image](https://github.com/user-attachments/assets/71ab80e9-372b-4947-a2fe-63545909ca47)

Santa's North Pole Operations is developing an AI chatbot to handle the overwhelming volume of messages, gift requests, and communications from children worldwide during the holiday season. The AI system is designed to process these requests efficiently and provide support in case of any issues. As Christmas approaches, Santa's IT team observes unusual activity in the AI system. Suspicious files are being accessed, and the system is making unusual HTTP traffic. Additionally, the customer service department has reported strange and unexpected requests coming through the automated AI chatbot, raising the need for further investigation.

**Learned**:
- Log Analysis
- Timeline Analysis
### **Question 1**
What username did the attacker query the AI chatbot to check for its existence?

	Initial analysis the zip file contains a pcap, auth logs, and a history file. Within the pcap I thought the best way to find answers would first be to look at HTTP request and looking at the conversation I can see they asked for a username on the machine and the AI responded with the name 'juliet'

![image](https://github.com/user-attachments/assets/bef19ae5-ed4c-4ed5-8ba0-442018945458)

**Answer:** Juliet
### **Question 2**
What is the name of the AI chatbot that the attacker unsuccessfully attempted to manipulate into revealing data stored on its server?

	Here I saw where they asked for medical info and the chatbot responded with it cannot disclose that. Looking at the get request before the post I can see where they were loading the webpage which showed me the name of the chatbot

![image](https://github.com/user-attachments/assets/00baea4e-a012-4792-9632-a99031e1a468)

**Answer:** GDPR Chatbot
### **Question 3**
On which server technology is the AI chatbot running?

	Following the http conversation you can see the server agent

![image](https://github.com/user-attachments/assets/9205b465-e430-4262-8489-8ada93523058)

**Answer:** Werkzeug/3.1.3 Python/3.12.7
### **Question 4**
Which AI chatbot disclosed to the attacker that it could assist in viewing webpage content and files stored on the server?

	Similar to question 2 I just followed the HTTP request until I saw it gave info about the files stored on the server

![image](https://github.com/user-attachments/assets/54a334c0-6d0f-4692-b9e9-650597282b39)

**Answer:** Web & Files Chatbot
### **Question 5**
Which file exposed user credentials to the attacker?

	Continuing to look through the HTTP traffic I can see where they asked the chatbot what is inside of the creds.txt which exposed creds

![image](https://github.com/user-attachments/assets/84245f5c-3efb-456c-8d76-9b123bff128b)

**Answer:** creds.txt
### **Question 6**
What time did the attacker use the exposed credentials to log in?

	Checking the auth.log for "Noel" successful login I was able to locate it

![image](https://github.com/user-attachments/assets/e944ea18-e805-4f3b-9c01-214da464f3a9)

**Answer:**
### **Question 7**
Which CVE was exploited by the attacker to escalate privileges?

	With what we know now doing research you will find one posted by Unit42 over LangChain Gen AI: [Vulnerabilities in LangChain Gen AI](https://unit42.paloaltonetworks.com/langchain-vulnerabilities/)

	Which will highlight the CVE

**Answer:** CVE-2023-44467
### **Question 8**
Which function in the Python library led to the exploitation of the above vulnerability?

	In the bash history you can see they did a command injection

![image](https://github.com/user-attachments/assets/f1e4f3fc-031b-492d-952d-9a5f74f6abf5)

**Answer:** __import__
### **Question 9**
What time did the attacker successfully execute commands with root privileges?

	After the attacker got a foothold into the system they ran a command with root privlages. Here I was looking for when they were trying to run that ai-bot.py file

![image](https://github.com/user-attachments/assets/6dc11101-e810-41b6-8852-ad5324c4e8a1)

**Answer:** 06:56:41
