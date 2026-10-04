# **Ore Writeup**
![image](https://github.com/user-attachments/assets/076ed5a1-21f5-4144-bd4e-47a8ec475a2a)

One of our technical partners are currently managing our AWS infrastructure. We requested the deployment of some technology into the cloud. The solution proposed was an EC2 instance hosting the Grafana application. Not too long after the EC2 was deployed the CPU usage ended up sitting at a continuous 98%+ for a process named "xmrig". Important Information Our organisation's office public facing IP is 86.5.206.121, upon the deployment of the application we carried out some basic vulnerability testing and maintenance.

**Tools:**
- grep
**Learned:**
- Static Malware Analysis
- Research!

### **Question 1**
Which CVE lead to the initial compromise of the EC2?

Initial analysis the triage tooling used was catscale was we have catscale files and a user directory. Continuing my initial analysis I am poking through the 'usr' folder where I find the another folder named grafana. Not sure what that is I researched it and found it to be an open source analytics and viz web app.

![image](https://github.com/user-attachments/assets/b9529837-8534-45ef-b18c-b51f3ff88b4e)

Here I found a verisioning folder which told me the verision of the software. I will now just do research around Grafana v8.2.0... I found this CVE: CVE-2021-43798 being resonsible for this was a zero day exploit for a unauthorized arbritrary file read vuln :O

![image](https://github.com/user-attachments/assets/9109197e-1674-4bdd-9ebd-23f7e1aca550)

Here is a link to the PoC: [pedrohavay/exploit-grafana-CVE-2021-43798: This is a proof-of-concept exploit for Grafana's Unauthorized Arbitrary File Read Vulnerability (CVE-2021-43798). (github.com)](https://github.com/pedrohavay/exploit-grafana-CVE-2021-43798)

**Answer:** CVE-2021-43798
### **Question 2**
Please detail all malicious IP addresses used by the threat actor (TA) targeting our organisation.

Here I read that it might be good to do preliminary investigation on the PoC to better undertand what the malware is doing therefore, I looked at it a noticed the suer agent it is using which is a key detail

![image](https://github.com/user-attachments/assets/ee2f793c-4b51-404e-8699-cb036bc0edb3)

Also I noticed in the payload the url incldues /etc/passwd which I thought seemed odd and will keep my eye out for anything there

![image](https://github.com/user-attachments/assets/0fd9696d-9137-46e7-a65c-081914203051)

I dug further into the usr folder down to the grafana data folder where I found the 'logs folder. I began grep the 'addr' after I read the contents of the first few files and noticed that field might be good to search and I saw thhese results. Now I am wondering how I can pull back all the unique addresses

![image](https://github.com/user-attachments/assets/dc1df014-b2da-476e-9a89-3b2da1618e67)

I created a grep command where I recursivley went through the log files after spotting the IP's that I suspected being apart of this. I searched on the 'passwd' since that was the path I saw in the PoC. I tried addr but could never yield good results but then I cut it once it found the passwd at the '=' then took the length of 12 there. Then I had it sort it and then tell me the unique values

To further help undertand what I did since I saw the PoC and saw the code that sends the payload data to the /etc/passwd my thought was if I were to filter on that then that would be an indicator this informaton may be related to the grafana CVE. Furthermore, looking at the previous logs I noted the IP being 12(ish) long. So, that is where I utilized cut to trim it all up. I removed the 86.5.206.121 since we know this is the compromised server

![image](https://github.com/user-attachments/assets/9e37bbba-3f02-4bf6-9b81-79bd68ed4802)

**Answer:** 44.204.18.94,95.181.232.32,195.80.150.137
### **Question 3**
Which account to the TA utilise to authenticate to the host OS?

Here since we have a catscale image I know from my previous experineces if we use something called like the lastlog file it shows account logon. This information is invaluable when you know the tool and what it is supposed to produce. Here is documentation to read up on it if you are curious: [Cat-Scale Linux Incident Response Collection | WithSecure™ Labs](https://labs.withsecure.com/tools/cat-scale-linux-incident-response-collection)
	
I found the file and the user account I suspect they used was grafana given the only 2 other accounts that have been logged into were root and ubuntu and it has the server IP so I know its not the TA

![image](https://github.com/user-attachments/assets/36a117b5-5695-4c6f-a351-1c8934c887ae)

**Answer:** grafana
### **Question 4**
Which file did the TA modify in order to escalate privileges and run the mining service as "root"?

I will look under the grafana folder. This might be trucky... I will do some searching to find out how to look for files that were recently altered... I found a way! I learned the -la flag commonly used with the -ls flag will list directory contents that have been altered recently. I see .bash history might provide good detail.. it could show me commands they ran. Here is the command I used while being in the share directory: ls -la grafana/ which told it to list the directories in grafanaa that have been altered recenetly.

![image](https://github.com/user-attachments/assets/15df3318-6359-4362-b000-7e5e51979131)

Reading the .bash_history file I found where the attacker ran a nano command which allows them to edit the code for the 'updated.sh'

![image](https://github.com/user-attachments/assets/234782be-425d-41bb-af3d-593272d0bdee)

Interesting the attacker updated that file... I ended up finding the path to the file
	
**Answer:** /opt/automation/updater.sh
### **Question 5**
Which program did the TA utilise to download the injector.sh script?

Since they gave the file name I am going to grep it out! I will go under the catscale logs though I do not believe I would find info related to this under the usr directory. Interesting in the syslog events it found a weget command where it reached out to a server to download it

![[Pasted image 20240920144157.png]]

**Answer:** wget
### **Question 6**
Where was the crypto mining binary & config file initially downloaded to?

Since they already told us the file name being 'injector.sh'... I will have to search by the IP I saw to start to help identify where this was originally installed at. Boom! Filter on the IP and filtering out the injector.sh I was able to find the initial path in a syslog

![[Pasted image 20240920144735.png]]

**Answer:** /opt/automation/
### **Question 7**
Which program did the TA utilise to download both the crypto mining binary & configuration file?

Utilizing the same log I saw the command they ran and program they used which was curl

![image](https://github.com/user-attachments/assets/c4d80284-af1e-44ad-8948-6525ceb0ba2e)

**Answer:** curl
### **Question 8**
We need to confirm the exact time the SOC team began artefact collection as this was not included in the report. They utilise the same public facing IP address as our system administrators in Lincoln.

This confused me but after about an hour it hit me... I came back to this and understood catscale timestamps the files on the folder... it is right in front of your face!

![image](https://github.com/user-attachments/assets/2c614014-7cb9-4fc0-ac9c-a843093e0738)

**Answer:** 2022-11-24 15:01:00
### **Question 9**
Please confirm the password left by the system administrator in some Grafana configuration files.

Hmm.... I am going to grep and search for password on the grafana directory. Ha! This took a bit for me to find but I drilled into the grafana/conf folder and ran a recursive search for password

![image](https://github.com/user-attachments/assets/91237df9-1f21-4769-9aa2-c157c33f97da)

**Answer:** f0rela96789!
### **Question 10**
What was the mining threads value set to when xmrig was initiated?

When in doubt grep it out... After some time I found it by going into the catscale logs

![image](https://github.com/user-attachments/assets/3e3d709e-df75-4512-954c-c20ac4552361)

**Answer:** 0
### **Question 11**
Our CISO is requesting additional details surrounding which mining pool this may have been utilising. Please confirm which (if any) mining pool this the TA utilised.

Looking back at my other results a DNS record came through.. It ried te answer and it worked!

**Answer:** monero.herominers.com
### **Question 12**
We couldn't locate the crypto mining binary and configuration file in the original download location. Where did the TA move them to on the file system?

Continue to use the results from the previous tasks we can see its reading out of a different folder now

![image](https://github.com/user-attachments/assets/832da9f6-d372-41e3-9222-603158ab87d6)

**Answer:** /usr/share/.logstxt/
### **Question 13**
We have been unable to forensically recover the "injector.sh" script for analysis. We believe the TA may have ran a command to prevent us doing recovering the file. What command did the TA run?

Running the grep -r "injector.sh" going back to that syslog reading further into it I found this command: shred -u .injector.sh

**Answer:** shred -u ./injector.sh
### **Question 14**
How often does the cronjob created by our IT admins run for the script modified by the TA?

With my prior experince with Catscale from these HTB sherlocks I know under the persistence folder is a cron folder but its a subfolder of another folder.. let me go do some digging! I found a file named 'root' where that is the master for linux systems. I cat the file and saw that is runs daily at 8:30!

![image](https://github.com/user-attachments/assets/cd7b5e20-a606-475f-ad79-65530daaa1be)

**Answer:** daily: 08:30

I thoroughly enjoyed this challenge! This challenged enabled my static analysis of malware skills as well honed in on my ability of understanding the triage tool used as well as taught me how to grep better! 
