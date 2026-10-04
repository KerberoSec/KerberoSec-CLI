# **Lockpick4.0 Writeup**
![image](https://github.com/user-attachments/assets/ec131348-de88-4ea1-9224-e434a953a693)

Forela.org’s IT Helpdesk has been receiving reports from employees experiencing unusual behaviour on their Windows systems. Within 30 minutes, the number of affected systems increased drastically, with employees unable to access their files or run essential business applications. An ominous ransom note appeared on many screens, asking the users to communicate with the ransomware group’s customer service department. It became apparent that Forela.org was under a significant ransomware attack. As a member of Forela.org’s Incident Response (IR) team, you have been assigned a critical task. A ticket has been created for you to reverse engineer the ransomware that has compromised Forela.org’s Windows systems. Your objective is to fully understand the ransomware’s capabilities and extract any Indicators of Compromise (IOCs) to feed into the organisation’s detection tools, preventing further infection.

**Tools:**
  - Ghidra
  - x64dbg
  - PEStudio

**Learned:**
  - Ransomware Analysis
  - Static and Dynamic Analysis
  - Binary Analysis
### **Question 1**
What is the MD5 hash of the first file the ransomware writes to disk?

Initial analysis I found 3 files a danger.txt which contains a warning message and password to unzip the malware.zip and the malware.zip which is the malware. Opening the malware.zip with its password it gives a defenderscan.vhdx.

Mounting the virtual hard disk file I see other items

![image](https://github.com/user-attachments/assets/77a80fba-9af0-43af-805a-a7ea7c4d6dc0)

Opening the defenderscan.js file, I see a file name that is hard coded… I believe this might be the first file it creates?

![image](https://github.com/user-attachments/assets/3a6d6cdd-a7a3-47b6-a361-acfe90156a66)

I see some code that is taking a binary file then some function that ttakes a base 64 string and a bunch more. One thing I noticed is all this staging code and it looks like powershell is being used initially and shell

![image](https://github.com/user-attachments/assets/4a58c759-1fce-4b26-b4ba-58d6e39c85f5)

My next step since I believe that hardcoded file is the first file, I am going to run this dynamically. But first, I am going to disable the last 2 lines of code pictured above so it doesn’t delete the file. It worked it created the redbadger file and my thou9ght process of that being the first file was correct.

![image](https://github.com/user-attachments/assets/a4421170-7368-4bc0-a34f-9ddd1cc630af)

Answer: 2c92c3905a8b978787e83632739f7071

### **Question 2**
What is the string that the ransomware uses to check for local administrator privileges?

I noticed when I ran that it dropped another file that is a tmp file. I will investigate that. Interesting it looks like it is in powershell. I noticed I do see some DLL being loaded

![image](https://github.com/user-attachments/assets/bb24a0dd-021f-4055-9e7f-b892b4198e2b)

Found where they are checking for the administrator group

![image](https://github.com/user-attachments/assets/7879291b-cafc-4831-91df-b4656a4dadcc)

Answer: S-1-5: 32-544

### **Question 3**
What is the MITRE ATT&CK ID for the technique used by the threat actor to elevate their privileges?

Continuing my analysis of the powershell from th etemp file… these variables were encoded with base64 but I changed them to their

![image](https://github.com/user-attachments/assets/4d92a92f-9043-4153-bfc4-0a462a84535d)

In the picture below we can see it checks the admin group which is what we found earlier. If it isn’t it bypasses it using this csmtp.exe which I found in the GondorGate function then it does some more stuff after. Now that I am thinking I am not sure what cmstp.exe is. Cmstp.exe is a legit file used for installing connection manager profiles but it is common for cyber criminals to use it when wanting to bypass a UAC. Doing some google dorking I found the associated Mitre ID

![image](https://github.com/user-attachments/assets/84bca487-fe70-40c2-be8c-187c1734302e)

Answer: T1218.003

### **Question 4**
The ransomware starts a process using a signed binary, what is the full name of the signer?

I think since I know that temp file is a powershell file I will run it but I commented out the last 2 items since it is removing items. I don’t want to get rid of any potential artifacts. After detonating the malware it dropped 3 files which area the ones that were obfuscated that I deobfuscated: msmpeng.exe, msmpeng.exe, and mpsvc.dll

Running the msmpeng.exe through PEStudio I was able to see who it was signed by

![image](https://github.com/user-attachments/assets/9f98436b-4b86-492b-989e-9133ab2d253d)

Answer: Microsoft Corporation

### **Question 5**
What is the final payloads’ entry point function?

Continuing investigating the executable I found that it was importing the DLL that spawned as well as using the import ‘ServiceCrtMain’

Answer: ServiceCrtMain

### **Question 6**
How many Anti-Debugging techniques does the ransomware implement and what is the Windows API function that the final technique leverages?

Here I will do my analysis in Ghidra and pull in the .dll first for analysis. I will keep in mind to find the anti debugging techniques. Here I found a anti debugging technique which is a known malware technique to look for debuggers on the common stem

![image](https://github.com/user-attachments/assets/8237f611-95b7-4909-85d7-866bc7a91ded)

Continue in the FUN_180001ebd0 where you can find the anti debugger you will see the other functions used as anti debugging such as CreateToolhelp32Snapshot, Process32FirstW, and Process32NextW

![image](https://github.com/user-attachments/assets/953626ee-b270-45ea-8547-34dc45ca4719)

There we will see it call a function into a variable. From there you can see it calls the windows API we are looking for

![image](https://github.com/user-attachments/assets/4ab3e625-3fa4-476b-a9c6-96075cd85241)

Answer: 3, SetUnhandledExceptionFilter

### **Question 7**
The ransomware targets files with specific extensions, what is the list of extensions targeted in the exact order as the ransomware configuration stores them?

I was able to take the static analysis so far when I reverted to dynamic analysis. Utilizing x64dbg, I loaded the rundll32.exe and set breakpoints to monitor the mpsvc.dll file. Upon reaching the main ServiceCrtMain function, they set another breakpoint at the IsDebuggerPresent function. By choosing to “step over” I was able to go over all of it.

Next, after the CreateToolhelp32Snapshot function, I went over everything again which is just bypassing the protection. Same with the third protection… while stepping through the code, the first file extension targeted by the ransomware appeared in the stack window. Following this, I was able to copy the results to VSCode and saw it was a json file.

![image](https://github.com/user-attachments/assets/97964266-665c-469e-826f-ef5b1b9b77e6)

Answer: .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf, .txt, .csv, .rtf

### **Question 8**
What is the FQDN of the ransomware server the malware connects to?

During static analysis I uncovered a Win32 API ‘WinHttpOpen’ being called which I know is an API in Windows used to create new sessions that use HTTP. Using x64dbg I used the .dll file that was spawned, I noticed a WINHTTP.dll library and the WinHttpConnect function. After determining that WinHttpConnect was called only once in the main ServiceCrtMain function, the author manipulated jump instructions to control it and reach WinHttpConnect function.

![image](https://github.com/user-attachments/assets/f4046e18-9ae7-4502-aaae-bb655619e533)

Answer: api.ltchealthcare.co

### **Question 9**
What is the MITRE ATT&CK ID the ransomware uses to run its final payload?

We know that it creates 3 files. From there the executeable uses the .dll and the .dll has the malicious payload. I believe this is called ‘DLL sideloading’. doing research I found this is a technique

![image](https://github.com/user-attachments/assets/d21e3c0c-74bc-4926-966e-c491f3022402)

Answer: T1574.002

### **Question 10**
What is the full URL including port number of the ransomware groups customer service portal?

In the json we found earlier with the files to encrypt I saw ‘html-content’ and it appeared to be base64 encoded. I took that string to CyberChef to decode it and saved it as an html file. Here I found the URL

![image](https://github.com/user-attachments/assets/3a0764be-4da6-4524-9f4a-6918e53f500b)

Answer: yrwm7tdvrtejpx7ogfhax2xuxkqejp2qjb634qwwyoyabkt2eydssrad.onion:9001

### **Question 11**
What is the file extension used to store the newly encrypted files?

Running the ransomware the extension is ‘Evil’

![image](https://github.com/user-attachments/assets/b1555285-d1fc-4d78-a853-282945c28277)

Answer: .evil

That was so much fun. I spent about a good amount of time tackling this issue and finally resolving it. To be able to do ransomware analysis and leverage my static and binary analysis skills and see them come together to see what the ransomware was doing was fun
