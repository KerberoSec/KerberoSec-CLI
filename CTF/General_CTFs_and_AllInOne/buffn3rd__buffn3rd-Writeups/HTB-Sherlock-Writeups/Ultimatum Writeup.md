# **Ultimatum Writeup**
![image](https://github.com/user-attachments/assets/7bfff936-cb9b-4e38-92fd-2e0ade03f944)

We are investigating a WordPress server believed to have been a target of a threat actor group who leveraged a vulnerable plugin.

Cat-Scale was the triage image tooling to capture the logs, system memory, and other important artifacts from the red-had Linux server that hosts the WordPress server ([Cat-Scale Linux Incident Response Collection | WithSecure™ Labs](https://labs.withsecure.com/tools/cat-scale-linux-incident-response-collection))
### **Question 1**
**Which security scanning tool was utilized by the attacker to fingerprint the blog website?**
	
Initially I began looking into the folders to understand what data we have. I am looking for a folder that might indicate a tool to scan for vulnerable services maybe nmap or metasploitable?

\catscale_out\Logs\var\log\apache2\access_log is where I found the answer. After analysis I found this was a Linux server and wordpress is a website. Apache is the common web service ran on Linux servers to run web apps. Hence why I ran to the access log which would show me any connection attemps to the Apache service. In the picture below, I did a simple search on "scanner" to see what results were yielded and I found the WPScan. I did some google fu finding out this is a common scanning tool used.
	
![image](https://github.com/user-attachments/assets/ec0cd701-90c2-4c16-9227-284ca974cc75)

**Answer:** WPScan/3.8.24
### **Question 2**
Which CVE was exploited by the attacker?

I solved this after I found a few more artifacts which allowed me to piece this together. To start, looking at the first picture is a clue of the CVE they used which was a plugin. The one in the picture is not the CVE but the detail to look at is the GET request for the plugins portion. They utilized a plugin called "Ultimate member" to create an admin account which allowed them to access WordPress admin page. 
The second picture I saw alot of logs where the threat actor IP was accessing the WordPress admin page and that is where I was getting confused on how but understanding what common vulnerabiltiies/attack vectors webistes are susceptible to for example, XSS, injection attacks, fuzzing, broken auth etc.
In this case the threat actor leveraged a plugin called ultimate member v2.6.7 which does not prevent vistors from being able to create user/admin accounts (https://nvd.nist.gov/vuln/detail/CVE-2023-3460)

Thus, the threat actor leveraged a vulneability on the WordPress server running v6.2.2 which does not check if a person visiting is a vistor or user from the company.
	
![image](https://github.com/user-attachments/assets/0a84a36a-3d1c-46ed-954e-5d90c56208f7)

**Answer:** CVE-2023-3460
### **Question 3**
What was the IP Address utilized by the attacker to exploit the CVE?
	
I found the IP here catscale_out\Logs\var\log\apache2\access.txt. Looking through it was another access file so, I did a search for "scanner" and found the IP. My thought process here was there has to be an IP tied to the scanner

![image](https://github.com/user-attachments/assets/a4b3bc63-6653-478c-8c19-5c2edb517a64)
	
**Answer:** 23.106.60.163
### **Question 4**
What is the name of the backdoor user added to the blog as part of the exploitation process?

Doing some further digging in the catscale_out\Logs\var\log\apache2\access.txt I found the backdoor. I went to the access.txt because this has shown me the threat actor IP and it shows me what they are doing on the WordPress server so I thought that this might show me them installing the backdoor. I see they used the scanner plugin to request make a request for a python script then you see an http request of 200 come through with secragon
	
![image](https://github.com/user-attachments/assets/4f45003c-e581-4a64-9bb9-e8515c6f508a)

**Answer:** secragon
### **Question 5**
After the exploit, the SOC team observed that the attacker's IP address changed and from the logs, it seems that the attacker manually explored the website after logging in. The SOC team believes that the previous IP seen during exploitation was a public cloud IP. What is the IP Address the attacker used after logging in to the site?
	
I found the IP here catscale_out\Logs\var\log\apache2\access.txt. Looking through the logs you can see where the adversary changed their IP when re-accessing the website
	
![image](https://github.com/user-attachments/assets/7d0b7d51-77bb-410f-91f8-b2ad3f00d9aa)
	
**Answer: 198.16.74.45
### **Question 6**
The SOC team has suspicions that the attacker added a web shell for persistent access. Confirm the full path of the web shell on the server.

I checked the apache2 folder since that is the access logs to it are. I assume I should be able to see the shell here. Looking at this picture I can see they tried a malicious HTTP GET request that was crafted to cd directories into the temp folder, remove all files and directories then download a file from that addressed called 'Mozi.a' and turn that file into an executable. This may point me in the right direction...
	
![image](https://github.com/user-attachments/assets/b8b47e16-f7a2-42b7-984d-5e05c9b73955)
	
So, after some searching I was able to find the answer. The CVE they used exploits a XSS vuln in the word press server there in the URL is where the reverse shell was setup where they used a .php file. This took a while to find and I found the answer here catscale_out\Logs\var\log\apache2\error.txt of the apache2 server. What led me here finally is doing some research it was mentioned that anything that is not normal behavior for HTML would end up here so I had a hunch and discovered this unique .php notice
	
![image](https://github.com/user-attachments/assets/778d25ee-5819-4220-9539-b47d148d9ea3)

After being challenged further to better understand Cat-Scale I read that the pot-webshell-first-1000.txt will contain info about all the jsp,asp, and php files which helps understand the web shell that was used. Right here I found they are using someone elses reverse shell so this tells me this is a somewhat sophisticated attack in the terms they implemneted it in a file but did not create the reverse shell on their own

![image](https://github.com/user-attachments/assets/1e68b784-4cfc-4c42-8663-95c82dff051a)

**Answer:** /var/www/html/wp-content/themes/twentytwentythree/patterns/hidden-comments.php
### **Question 7**
What was the value of the $shell variable in the web shell?

It was recommended for me to understand Cat-Scale further amd to look at its existing capabilities. In this file located here, \catscale_out\Misc\ip-172-31-11-131-20230808-0937-pot-webshell-first-1000. It gives you the content of the .php file. Also, it shows the reverse shell .php file and shows you its raw formatting which here you can seel the value $shell which is the shell that is being setup and the value that was used to set it up

Breaking up the $shell variable 
		- uname -a: shows system information
		- w: shows who is logged on
		- id: this prints user info
		- /bin/bash -i: create a bash shell that is interactive

![image](https://github.com/user-attachments/assets/01a2af07-dc97-4cc7-8f3f-0677cea1779f)

**Answer:** 'uname -a; w; id; /bin/bash -i';
### **Question 8**
What is the size of the webshell in bytes?

This one was harder to find as intially I was unsure but was further challenged to look further into the tool capability. I found the answer here: \catscale_out\Misc\ip-172-31-11-131-20230808-0937-full-timeline
	
Reading the documentation it explained this file to simply be similiar to a windows MFT file which I know master file tables on windows machines is the meta data of a computer. This told me all tid bits of info and since I knew the path of the web shell just simply searching for it in here it showed me the file size in bytes

![image](https://github.com/user-attachments/assets/55b6380e-1a40-49ff-ac62-a89e796905f4)
	
**Answer:** 2592
### **Question 9**
The SOC team believes that the attacker utilized the webshell to get RCE on the server. Can you confirm the C2 IP and Port?

Found the answer in the \catscale_out\Misc\ip-172-31-11-131-20230808-0937-pot-webshell-first-1000.txt. The reason I went to these files goes back to my understanding of the Cat-Scale tool. It is a triage tool used to gather logs and other systematic information during an incident.
	
Here doing a simple search on the reverse shell I found this is not a script kiddie but a step above as the reverse shell code they are using is someone elses and there in the .php file contents it breaks down the php-reverse-shell.php file and its contents showing us the IP to the C2 server and the port which was 6969 (haha)
	
![image](https://github.com/user-attachments/assets/e0819af4-7ece-4301-bae0-ef9e5e629e3c)

**Answer:** 43.204.24.76:6969 
### **Question 10**
What is the process ID of the process which enabled the Threat Actor (TA) to gain hands-on access to the server?

Intially it appears this might lead me to the PID as I want to specifically look for a process that was open using /bin/bash -i as that opens up the bash on the target server.

![image](https://github.com/user-attachments/assets/5d66dcda-aca9-4364-868e-d6b7b76040ac)

In this folder \catscale_out\Process_and_Network\ip-172-31-11-131-20230808-0937-processes-axwwSo.txt. This reason I went to the process and network folder is this triage image will show me the process information that running on the server when the image of it was taken. Which it did I found the process id that was created using this command /bin/bash -i again which opens a bash terminal on the targets machine which communicated back to the threat actor

![image](https://github.com/user-attachments/assets/a332ea45-3164-4cc4-9803-2871c46e0525)

**Answer:** 234521
### **Question 11**
What is the name of the script/tool utilized as part of internal enumeration and finding privilege escalation paths on the server?

ultimatum\catscale_out\Misc\ip-172-31-11-131-20230808-0937-dev-dir-files is where I found this answer. I got curious what LinEnum.sh was and did some google fu and found out it is a bash script that allows you to run commands related to privilege escalation so I had a hunch this is what the TA was doing to escalate to get root access
	
![image](https://github.com/user-attachments/assets/47a23b86-208c-45d5-961e-5a3e31ca2e0a)

**Answer:** LinEnum.sh

### **Post Incident Response**
Overall, this was a fun and challenge DFIR. It challenged my understanding of Linux webservers and how they are hosted. Furthermore, it highlighted my ability to to stay tenacious and connect the dots and make the timeline of the incident. It helped me understand the triage imaging tool used with was 'Cat Scale' and what logs to look at and for what reason. After looking at the documentation of the tool and understanding each section of the logs generated it further along my process of solving this challenge.
