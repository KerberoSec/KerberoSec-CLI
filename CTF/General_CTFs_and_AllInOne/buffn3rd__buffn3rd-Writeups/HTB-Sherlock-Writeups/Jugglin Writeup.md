# **Jugglin Writeup**
![image](https://github.com/user-attachments/assets/a99c8220-debb-46e9-91ee-cd92870c301d)

Forela Corporation heavily depends on the utilisation of the Windows Subsystem for Linux (WSL), and currently, threat actors are leveraging this feature, taking advantage of its elusive nature that makes it difficult for defenders to detect. In response, the red team at Forela has executed a range of commands using WSL2 and shared API logs for analysis.

**Tools:**
- API Monitoring

**Learned:**
- API Forensics
- How to monitor malicious API events
- How to secure an API based off its events

### **Question 1**
What was the initial command executed by the insider?

Initial analysis we are given 2 files with apmx64 extension. I have never heard of that so I will do some research

![image](https://github.com/user-attachments/assets/ab4aa439-ef73-4ac1-8649-ce3c1192a727)

These files come from the Windows operating system that logs information about excutable files that have run on the system. It looks like from research I can use an API Monitoring software to open these files. I found when they used the 'wsl.exe' they ran a command whoami which appears to be the first command

![image](https://github.com/user-attachments/assets/304cb406-0e84-4747-821f-bd4813eef335)

**Answer:** whoami
### **Question 2**
Which string function can be intercepted to monitor keystrokes by an insider?

I am unsure how to do this but will do some googling. I found an article that HTB posted about WSL2 activity with API hooking: [How to track WSL2 activity with API hooking (hackthebox.com)](https://www.hackthebox.com/blog/tracking-wsl-activity-with-api-hooking)

The article highlights in this section what the functions are to intercept keystrokes:

![image](https://github.com/user-attachments/assets/06ccdba6-2477-4a77-9d15-118bfd68d0dc)

![image](https://github.com/user-attachments/assets/ed112d78-dc3b-4249-86e2-fd6819664353)

**Answer:** RtlUnicodeToUTF8N, WideCharToMultiByte
### **Question 3**
Which Linux distribution the insider was interacting with?

I just peered through the API logs on the 'Insider.apmx64' and found it.

![image](https://github.com/user-attachments/assets/9ee6c442-aa6a-4a2b-a300-0e88c030c671)

**Answer:** kali
### **Question 4**
Which file did the insider access in order to read its contents?

Going off of what we know we can understand that RtlunicodeToUTF8N is apart of capturing keystrokes. I looked into the detail of it and found that it might be related to the kernel.dll??
	
![image](https://github.com/user-attachments/assets/40af0009-998a-43fd-8f45-27dc231c32fa)

I was confused so I did further research on how to solve this and I used the authors writeup to reference and that was hard to find! But you can see the insider used 'cat' to read the contents of the 'flag.txt'

**Answer:** flag.txt
### **Question 5**
Submit the first flag.

I went back to the wsl.exe and followed the API logs! I saw where the command 'cat flag.txt' came through and I knew I was getting close as I expected the API logs to show me the results. I found this in the Insider.apmx64

![image](https://github.com/user-attachments/assets/d8ef4376-cfd9-4727-827c-220f6995de9d)

**Answer:** HOOK_tH1$_apI_R7lUNIcoDet0utf8N
### **Question 6**
Which PowerShell module did the insider utilize to extract data from their machine?

In the API logs I found the module called 'Invoke-WebRequest' was used. This tell powershell to send HTTP/HTTPS request to a web server

![image](https://github.com/user-attachments/assets/af046de7-e226-4499-b9be-49107ccc7f6f)

**Answer:** Invoke-WebRequest
### **Question 7**
Which string function can be intercepted to monitor the usage of Windows tools via WSL by an insider?

Following the logs still you can see the function called ''. That is the function the API is using that we can monitor if ever invoked to alert on meaning that someone might be miss using the API

![image](https://github.com/user-attachments/assets/7e5102cf-0541-45e6-a0f0-dc56f83706aa)

**Answer:** RtlUTF8ToUnicodeN
### **Question 8**
The insider has also accessed 'confidential.txt'. Please provide the second flag for submission.

I found when they accessed the confidential.txt and found the flag. I can see them build out the 'cat confidential.txt'

![image](https://github.com/user-attachments/assets/4476c81e-d04d-40f5-a1a2-9425b97c8fe8)

**Answer:** H0ok_ThIS_@PI_rtlutf8TounICOD3N
### **Question 9**
Which command executed by the attacker resulted in a 'not found' response?

Not found response I am thinking I might be looking for an HTTP request. I was wrong which is okay! In the 'Attacker.apmx64' file looking through the logs I found where the attacker tried running a command and it returned the not found

Lsassy is a tool for pen testings and is designed to extract creds in plaint text from memory locations on a Wiundows machine

![image](https://github.com/user-attachments/assets/5f6dcfba-5147-41ab-9ec6-7e885d6bcf6b)

**Answer:** lsassy
### **Question 10**
Which link was utilized to download the 'lsassy' binary?
	
In the following logs you can see where the attacker ran the wget to download lsassy

![image](https://github.com/user-attachments/assets/83aeb8ea-01db-46e1-bc67-5082a10dcef3)

**Answer:** http://3.6.165.8/lsassy
### **Question 11**
What is the SHA1 hash of victim 'user' ?

So I got curious what the other modules and threads stuff was so I spent quite a bit of time looking through these finally I found in the threads where user informaton was at. I can see the attacker dumped the hash of the 'user' in a keys.txt

HINT: play around with the answer to find the hash. It is in there

![image](https://github.com/user-attachments/assets/5e06f9aa-859b-4ebe-ab36-3d959c7cfc06)

**Answer:** e8f97fba9104d1ea5047948e6dfb67facd9f5b73
### **Question 12**
When an attacker utilizes WSL2, which WIN32 API would you intercept to monitor its behavior?

This is actually easy as we can notice the API as we have been seeing it this entire challenge. First, lets understand what the WIN32 API is!
	
The WIN32 API is apart of Windows and allwos developers to create and manage Windows applications. SImply put when ever wsl.exe is ran it will use the 'WriteFile' API to execute anything. Therefore, monitoring this gives us visability to potential malicious activity using API's.

![image](https://github.com/user-attachments/assets/8b9318eb-910c-4600-8351-54cf270926c0)

**Answer:** WriteFile

This was a hard challenge! But I learned something new and did something I  have never done which was API forensics. This sherlock challenge me to use a new tool, understand it, and understand API forensics. This will be a nice tool to keep under my toolbet.
