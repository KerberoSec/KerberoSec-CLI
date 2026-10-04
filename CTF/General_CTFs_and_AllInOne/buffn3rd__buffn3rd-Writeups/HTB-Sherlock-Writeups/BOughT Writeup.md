# **BOughT Writeup**
![image](https://github.com/user-attachments/assets/a26901bf-4dfc-4082-9cf8-ea2bc3a2a37b)

A non-technical client recently purchased a used computer for personal use from a stranger they encountered online. Since acquiring the computer, the client has been using it without making any changes, specifically not installing or uninstalling any software. However, they have begun experiencing issues related to internet connectivity. This includes receiving error messages such as “Server Not Found” and encountering difficulties with video streaming. Despite these problems, checks with the Windows Network Troubleshooter indicate no issues with the internet connection itself. The client has provided a memory image and disk artifacts for investigation to determine if there are any underlying issues causing these problems.

**Tools:**
  - Volatility 3
  - Ghidra
  - FTK Imager
**Learned:**
  - Static Malware Analysis
  - Binary code analysis
  - C2 Domain analysis
  - Domain Generation Analysis
### **Question 1**
What is the best volatility profile match for the memory image?

Initial analysis we are given 2 files. A memory dump and a .ad1 which is just a storage of files. I loaded the .ad1 in FTK and will run volatility3 to analyze this memory dump. Running my scan using Vol3 I ran this python3 vol.py -f memdump.mem windows.info. It gave great info but nothing that will aid me right now.

![image](https://github.com/user-attachments/assets/f4d6c710-0338-4d94-bce1-0697e5b19261)

Using Vol2 I was able to uncover the potential profile it was using which was Win10x64_19041. I ran this command to figure that out which detects everything about the memory dump up to its profile: python3 vol.py -f memdump.mem imageinfo

**Answer:** Win10x64_19041

### **Question 2**
When was the image captured in UTC?

From my previous scan with Vol3 I was able to see when this memory dump was made

![image](https://github.com/user-attachments/assets/687e6453-1f56-443c-85ce-2119631a9a08)

**Answer:** 2023-08: 07 21:28:13

### **Question 3**
Check running processes and confirm the name of the suspicious running process.

Utilizing the pstree plugin it will list out all the running processes when the memory capture happened: python3 vol.py -f memdump.mem windows.pstree. Knowing this is a Windows system and I have a good understanding of what processes look normal to ones that done…. this one stood out to me as being abnormal

![image](https://github.com/user-attachments/assets/93e837e3-5adc-4bdf-8e39-79bc3e320bc5)

**Answer:** SecurityCheck.exe

### **Question 4**
What is the full path of malicious process?

Using the output from the pstree it shows the full path

**Answer:** C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp\SecurityCheck.exe

### **Question 5**
What is the sha256 value of the malware?

Here I will go to my FTK which has these files open and follow that path found in the previous question. Here I found the file so I exported it and will load it into VirusTotal for static analysis and to see its SHA256 hash

![image](https://github.com/user-attachments/assets/683901bd-83e3-4ca5-9de3-b20cd81bc5a7)

**Answer:** 4062963405cc71c032ca51ffd409e832120fcfd496969f4ef548774323c72413

### **Question 6**
What is the compilation timestamp for the malware?

When the program was ran was

![image](https://github.com/user-attachments/assets/c926ee7a-6227-4bca-96b6-211ccf1e85d8)

**Answer:** 2037-09: 03 08:20:55

### **Question 7**
What is the name of the mutex that the malware creates?

Using VirusTotal still I can see the mutexs it creates

![image](https://github.com/user-attachments/assets/88e6def7-8327-446c-949e-30207b73335e)

**Answer:** config_m2

### **Question 8**
At the top of main function which anti-debugging function is being used?

Here I think I will need to do binary static analysis. I will use Ghidra to disect the binary an analyze its contents. I wasn’t sure of any anti-debugging functions so I leveraged this person writeup to help me understand what to look for here.

What I learned is it is a Windows API call that checks the current process and if it is being debugged. When it returns values if a debugger is present it returns a non-zero if no debugger is present it is 0. This allowed the TA to attach this to a process that wasn’t being debugged bypassing any security measures

![image](https://github.com/user-attachments/assets/5123bb53-29f7-4a67-b6aa-d3a342b9cfcd)

**Answer:** IsDebuggerPresent

### **Question 9**
How many minutes does the malware sleep before calling above anti- debugging function?

Here I found how long the malware sleep which is in milliseconds so converting that over to minutes it was 15 mins it sleeps before calling that function

![image](https://github.com/user-attachments/assets/6a299171-a946-4f08-9cbf-c848d753bc7e)

**Answer:** 15

### **Question 10**
This malware uses DGA, how many unique C2 domains in total is this DGA capable of generating?

Learning about DGA it is domain generation algorithm and commonly used within malware to generate a large number of C2 domains which are then elveraged by the malware to communicate with to steal data, update the program, issue commands etc. Looking at what DGA code looks like I understood what to look for but felt lost. Leveraging the same person writeup I read through their thinking and understanding of what to look for and it made sense when they found the answer

Under this function is where the DGA alogorithm is made. The alorithm has 3 parts a time sensitive seed, a domain generator that uses the seed, and a top level domain.

Since we are wanting to find how many domains are capable of generating we will need to find the seed. Which I found…. reading the code on line 22 starts a forloop that loops through 6 tiomes then stops for looping. Then on line 28 a mod 9 is being used to perform the mathmatical function then on line 30 is where an if statment is being genrated to select a constant value. It will only select up to 5 places so, using to the power of 5 you get a possible 59049

Thank you to this person: https://mwalkowski.com/post/sherlock-bought/ for breaking this down and teaching me something.

![image](https://github.com/user-attachments/assets/2fcb24fc-cc66-4334-a99c-326c60781070)

**Answer:** 59049

### **Question 11**
How many unique C2 domains start with “rb”?

Since we know the algorithm we can figure out how man possabiltiies are available to be generated. Since we know how big the domains can be which is up to 5 letters and since this is is asking for domains top start with rb which is a fixed length of 2. Subtract those (5-2) you get 3. By doing a modulus of 9 to the power of 3 it is 729… 9X9 = 81X9 = 729

**Answer:** 729

### **Question 12**
How many unique C2 domains end with “rla”?

Since we know the algorithm we can figure out how man possabiltiies are available to be generated. Since we know how big the domains can be which is up to 5 letters and since this is is asking for domains top start with rla which is a fixed length of 3. Subtract those (5-3) you get 2. By doing a modulus of 9 to the power of 2 it is 81… 9X9 = 81

**Answer:** 81

### **Question 13**
Which file is being used to store active C2 domain?

I noticed in the main function from earlier some files being read from…. I am going to see anything in those in FTK

![image](https://github.com/user-attachments/assets/42bb212b-a801-47bd-b28d-f2faa8dba5eb)

It looks like the win.ini file is holding information about the active C2 domain

![image](https://github.com/user-attachments/assets/cd481f31-5b71-4abf-94d8-a2ee1730645f)

**Answer:** C:\Windows\Documents\win.ini

### **Question 14**
Which file is being used to store commands from the C2 server?

Inspecting the config.ini file I saw the commands there. I had to use a Base64 decode from CyberChef to decode it.

**Answer:** C:\Users\Public\config.ini

### **Question 15**
What was the active C2 FQDN at the time of artifact collection?

Found the active domain in the win.ini file

![image](https://github.com/user-attachments/assets/6c4d833b-4662-4746-9dd1-808f05e78175)

**Answer:** http://cl0lr8.xyz

### **Question 16**
How many kinds of DDoS attacks can this malware perform?

Not sure what I would be looking so I am going to step back into that other persons writeup and learn from them. Stepping back into the code this function defines the attack types. On line 41 you can see it calls another function and that function makes HTTP get request and it is designed to flood the web server with get request traffics to exhaust its resources.

![image](https://github.com/user-attachments/assets/a13a1271-fd8c-4e18-b2f9-247bbcc1983f)

**Answer:** 2

### **Question 17**
What is the FQDN of the target website.

I found this earlier with the config.ini file. It reaches back out to a domain that I assume is getting its commands from. You need to decode it with Base64
![image](https://github.com/user-attachments/assets/35870d7c-a717-4a71-b69e-21836f50bfd8)
![image](https://github.com/user-attachments/assets/90e7d0ff-2c4b-4bbb-ad0b-7a9c72b99f5e)

**Answer:** http://nbscl231sdn.mnj

### **Question 18**
What was the expiration date for the active attack at the time of artifact collection in UTC?

Oh! This was interesting because I hestiated at first but came back and realized I was right originally. In the config.ini file when you decode it you see and odd piece of at that is ‘1693482358’ that is actually a date of when the attack will expire. I converted the date

**Answer:** 2023-08: 31 11:45:58

### **Question 19**
How many GET requests does the malware perform against target domain before sleeping for a while?

Where we found the function that performed the attacks you will see a for loop and it goes up to 20 which would indicate it does this 20 times against a target domain before sleeping

![image](https://github.com/user-attachments/assets/ad76be7d-c49c-42bc-b3bd-43a038f8cda0)

**Answer:** 20

### **Question 20**
There seems to be another attack method with ICMP requests. How many of these requests can the malware send before sleeping for a while?

I will leverage the same writeup I have been using to learn from!

So, still using the same attack function you will notice the function “strcat” which concatenate strings together. Breaking them all down you will find a command of ‘ping -n 16 %s’. Here is our ICMP attack because ping uses ICMP

![image](https://github.com/user-attachments/assets/d723ab9a-7190-466d-bafd-1bdaf86a052c)

**Answer:** 16

### **Question 21**
Is this malware prone to Botnet hijacking?

Looking back on what we know now I can see this malware is used to perform network based attacks by utilizing DGA to create many different C2 servers so that it can always have communication to the malware. We saw that the config.ini was altered to point towards the active C2 domain therefore, I suspect that it can be apart of a botnet

**Answer:** Yes

I learned a lot from the other person writeup who is far more experienced in malware analysis. I am excited to continue on with the rest of the malware sherlocks and apply my knew knowledge. One thing that I took away was the importance of renaming variables and converting binary numbers. Once I understood what a variable was doing renaming it to something that made sense for what it was doing was beneficial.
