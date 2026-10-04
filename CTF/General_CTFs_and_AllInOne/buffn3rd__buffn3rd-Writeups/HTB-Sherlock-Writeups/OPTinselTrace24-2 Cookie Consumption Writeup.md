# **OPTinselTrace24-2 Cookie Consumption Writeup**
![image](https://github.com/user-attachments/assets/e93f9422-0e30-4567-83e9-05475fbc403a)

Santa’s North Pole Operations have implemented the “Cookie Consumption Scheduler” (CCS), a crucial service running on a Kubernetes cluster. This service ensures Santa’s cookie and milk intake is balanced during his worldwide deliveries, optimizing his energy levels and health.

**Tools:**
- Linux CLI

**Learned:**
- Kubernetes Forensics
- Log Analysis

### **Question 1**
How many replicas are configured for the flask-app deployment?

	Initial analysis we are given a file that has a bunch of system logs, kubernetes logs, and general host information. Pokeing around I stumbled across the answer here default\describes\deployments log
	How I thought that might've been what I was looking for since its asking about app deployments I just checked the log and tried the answer of 3

![image](https://github.com/user-attachments/assets/e6883dd4-7a8c-4e0f-9d00-5b41c115488f)

**Answer:** 3

### **Question 2**
What is the NodePort through which the flask-app is exposed?

	inisde of the default/describes in the services.log I found the port there. I figured this one the one in question since it was talking about hte flask app so i thought hte service name was related

![image](https://github.com/user-attachments/assets/818a3da1-cdd8-49e8-a397-c821663864cc)

**Answer:** 30000/TCP

### **Question 3**
What time (UTC) did the attacker first initiate fuzzing on the /system/ endpoint?

	This one took sometime but I was able to analyze the logs indicating the fuzzing attack. Located in these logs: CookieConsumption/system_logs/node_logs/flask-app-77fbdcfcff-2tqgw_default_flask-app-0c6f23d9953921a31ec11074089eb67299221b05410a12185af82d8272bf1af5.log. Here I saw the beginnging of the fuzzing attack

![image](https://github.com/user-attachments/assets/97be99ca-3cbc-4498-83cf-6f9df51884bb)

**Answer:** 2024-11-08 22:02:48

### **Question 4**
Which endpoint did the attacker discover through fuzzing and subsequently exploit?

	I compiled all the Flaskapp logs together into one file then did a search for a status of 200 and I found the endpoint. The reason I searched by that is that told me it could successfully connect to it

![image](https://github.com/user-attachments/assets/0263d883-0851-4644-b377-ea5814591276)

**Answer:** /system/execute

### **Question 5**
Which program did the attacker attempt to install to access their HTTP pages?

	i found in the network logs where they were trying to access them via curl command
	
![image](https://github.com/user-attachments/assets/79d63523-ecdf-4c10-a120-777e6dacbebe)

**Answer:** curl

### **Question 6**
What is the IP address of the attacker?

	In the host-process.log I was looking through and noticed a curl command over http proxy and it was unusual as it was making it do a connection over bash to the IP which is not normal on a system

![image](https://github.com/user-attachments/assets/2ca3a4bd-2917-4fc1-9670-9d1f303bfd3d)

**Answer:** 10.129.231.112

### **Question 7**
What is the name of the pod that was compromised and used by the attacker as the initial foothold?

	In the flask-app-77fbdcfcff-2tqgw log file you will see this is where the TA first discovered the endpoint

**Answer: flask-app-77fbdcfcff-2tqgw**

### **Question 8**
What is the name of the malicious pod created by the attacker?

  In th epod.log it shows the running Pods info there is where I found the 'evil' pod

**Answer:** evil

### **Question 9**
What is the absolute path of the backdoor file left behind by the attacker?

	What I did is I made a grep statemnt that recursivley looped through the directories for "/opt/"

![image](https://github.com/user-attachments/assets/44a021e2-9c12-4d33-a10b-7183abd803a3)

**Answer:** /opt/backdoor.sh
