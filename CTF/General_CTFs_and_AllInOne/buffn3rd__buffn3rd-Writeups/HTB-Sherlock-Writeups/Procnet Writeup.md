# **Procnet Writeup**
![image](https://github.com/user-attachments/assets/90cad181-0b85-4b80-a5ac-fb647206ae3f)

With the rising utilization of open-source C2 frameworks by threat actors, our red team has simulated the functionalities of one such widely employed framework. The objective of this exercise is to aid blue teams in strengthening their defenses against these specific threats. We have been provided with PCAP files and APIs collected during the event, which will serve as valuable resources. Using the API Monitor: We are well-acquainted with opening PCAP and .EVTX files, but what are .apmx64 ? The .apmx64 file extension is associated with API Monitor, a software used to monitor and control API calls made by applications and services. To commence your analysis, follow the steps provided below: Download the API Monitor Navigate to "Files" and click on "Open" to view captured data from the file: "Employee.apmx64" or "DC01.apmx64" After opening the file, the "Monitoring Process" window will populate with a list of processes. Expand the view by clicking the '+' symbol to reveal the modules and threads associated with each process. The API calls can be observed in the "Summary" window. To focus our analysis on a specific module, click on the different DLLs loaded by the processes. TIP: When conducting analysis, it is advisable to begin by examining the API calls made by the process itself, rather than focusing solely on DLLs. For instance, if I intend to analyze the API calls of a process named csgo.exe, I will initially expand the view by clicking the '+' symbol. Then, I will narrow down my analysis specifically to 'csgo.exe' by selecting it, and I can further analyze other DLLs as needed.

**Tools:**
- Wireshark
- API Monitor

**Learned:** 
- Malicious API Calls
- Malware Analysis
- C2 Frameworks
- C2 Communication

### **Question 1**
To which IP address and port number is the malware attempting to establish a connection ?

I see it is talking about a csgo.exe... I am going to look through Wireshark to see if I can see that file being downloaded. Looking through the DC01 pcap I will filter on 'http' I do not see any file named csgo.exe but I did see a fifa.exe. I will move to the employee pcap.... I see where the csgo.exe file was downloaded. Looks like it finished installing it later.... Something I will note is the Source/dest IP... I will note the time it finishes which was around 7:23:20 UTC.... 

![image](https://github.com/user-attachments/assets/b05699a0-5400-4330-807d-a7e78d8421fc)

Fitlering on the src/dest IP I can see in the log trail that it establishes a connection with 3.6.165.8 over 443... initially the file was downloaded over HTTP proxy (8080) but after the csgo.exe finished downloading the communication port opened up which was 443

![image](https://github.com/user-attachments/assets/319c7108-edc2-487c-ba32-2879b0855328)

**Answer:** 3.6.165.8:443
### **Question 2**
Now that you are aware of the IP address and port number, what is the JA3 fingerprint of the C2 server ?

Doing some research I saw that wireshark does have the capability to show the JA3 fingerprint but you have to install a wireshark plugin which I did. Follow this: 

After setting it up I went back to the packet where TLS started at the 'Client Hello' and opened up the TLS portion to find the JA3 fingerprint

![image](https://github.com/user-attachments/assets/9717e72e-0e22-4edc-88ff-ad9b44bf3408)

**Answer:** 19e29534fd49dd27d09234e639c4057e
### **Question 3**
What is the name of the C2 framework being utilized by the red team ?

I searched the API logs and wireshark and was not sure what to do next. I did further research on how to identify a C2 framework and it was mentioned to download the file and do static malware analysis. After downloading the file I loaded it up in VirusTotal and you can see ClamAV has the signature.... reading this outputyou can see the name Sliver that is the framework it is using!

![image](https://github.com/user-attachments/assets/475f18e8-b92e-4c4e-b0ef-a9972fdcdcf7)

**Answer:** Sliver
### **Question 4**
Which WIN32 API provided the red team with the current directory information ?

Using the API Monitor tool, you can identify the API directory of that csgo.exe. So, open up the 'Employee.apmx' in API Monitor and locate the csgo.exe. In the picture below we can identify the API directory info based off the 'API' column. The APi that the csgo.exe is using is GetCurrentDirectoryW

![image](https://github.com/user-attachments/assets/17b56d01-4367-40cc-b56a-03301b6ea19c)

**Answer:** GetCurrentDirectoryW
### **Question 5**
Now that we have identified the C2 framework utilized by the red team, which C2 command is responsible for opening notepad.exe by default and loading the .NET CLR into it ?

I will follow the events of the csgo.exe. I did some further research on the Sliver C2 framework and found it is common for Sliver to create a notepad.exe with its binary in it and te notepad process it self is actually a sacrificial process for the binary to be injected in an actual running process where it sets up the reverse shell for the C2 node to talk to it.

![image](https://github.com/user-attachments/assets/0ca1622f-49b3-422b-adf2-98258c0baa28)

While learning about the C2 framework I learned about the C2 command the Sliver framework uses to execute binaries which is 'execute-assembly'. This is how it loads up notepad.exe which loads the .NET CLR then allows for the TA to load its malicious binaries into.

**Answer:** execute-assembly
### **Question 6**
What is the name of the module (DLL) that was loaded to gain access to Windows Vault ?

Doing research on Windows Vault and what it is and what DLL is needed in order to gain access. Windows vault is a safe for passwords, secrets, and other private information on a system. Vaultcli.dll is needed to be loaded into memory in order for you to access the Windows vault: [c#: Information about Vault.dll and Vaultcli.dll: Stack Overflow](https://stackoverflow.com/questions/14639207/information-about-vault-dll-and-vaultcli-dll#:~:text=Vaultcmd.exe%20(and%20its%20dependency,Platform)%20Windows%20started%20including%20Windows.)

Going back to API Monitor I will look under 'notepad.exe' and see what DLLs it loaded. I found where vaultcli.dll was loaded by notepad.exe which tells me it loaded successfully. From what we know so far we understand that a notepad is spun up to load the .NET CLR which then calls the Vaultcli.dll in it to access the windows vault. I was able to confirm under the 'notepad.exe' vaultcli.dll was found which indicates that this is apart of the Sliver framework

![image](https://github.com/user-attachments/assets/8db3c824-679b-43ca-bcac-ff4fa5515139)

**Answer:** vaultcli.dll
### **Question 7**
After loading the mentioned module, there were a series of WIN32 APIs loaded. Which specific Win32 API is responsible for enumerating vaults ?

Here I will do some further research to understand .NET CLR which allows it to run any .NET assembly. Remember the .NET CLR is loaded by the notepad.exe. Also, I looked at the vaultcli.dll and did not see any API's of interests. Learning through this C2 framework I learned that a clr.dll is spawned for .NET CLR to work. I am going to find that dll under the notepad.exe. Found it.... I will begin examining it further

Much better. I am seeing a few API calls which is what I expect. Therefore, I think this module might help me pinpoint the answer

![image](https://github.com/user-attachments/assets/fb41b000-fca1-4f17-bd5e-7141e891dd07)

Looking through the API logs on the clr.dll I found where it calls the 'vaultcli.dll' then after its loaded I see it making API calls out to VaultEnumeratVaults, and VaultEnumerateItems. Doing some research I found that VaultEnumerateVaults is the API that enumerates Windows Vaults.

![image](https://github.com/user-attachments/assets/ba3b870f-a60a-4a54-a004-1482f869f61a)

**Answer:** VaultEnumerateVaults
### **Question 8**
Which command did the attacker execute to identify domain admins ?

I will look further into the csgo.exe for the command. I see an API call to 'CreateProcessW'. Reading up on the 'CreateProcessW' it loads up a new process and runs the executeable. In this case I can see this is a command to check the domain admin group and to see who is a domain admin which is what the TA did here.

![image](https://github.com/user-attachments/assets/93fd8c61-d596-4f45-b042-441135831def)

**Answer:** net group "domain admins" /dom
### **Question 9**
The red team has provided us with a hint that they utilized one of the tools from "ARMORY" for lateral movement to DC01. What is the name of the tool ?

I am not sure what ARMORY is and will research that. ARMORY is the package manager that Sliver uses to deploy its packages. This helps the TA to deploy packages quickly and have them at the ready to deploy and begin using. If you want to understand more this is where I got my information: [BishopFox Sliver Adversary Emulation Framework: Splunk Security Content](https://research.splunk.com/stories/bishopfox_sliver_adversary_emulation_framework/#:~:text=Sliver%20is%20highly%20modular%20and,)%20(CyberReason%2C2023).)

Continuing inside of th ecsgo.exe I will see if I see any more odd API calls. I found what appears to be command line commands that g. I am going to research the to through on the API. I can see it referncing the DC01 computer name making me think I am in the right area. Those appear to be variables that are running the commands. I am going to research the C2 framework further to see if I can understand if these commands are expected and help find the tool.

This took some time but finally through this github repo I found the tool: [red-team-scripts/sliver.md at main · infosecn1nja/red-team-scripts (github.com)](https://github.com/infosecn1nja/red-team-scripts/blob/main/sliver.md)

![image](https://github.com/user-attachments/assets/645b62af-04f5-4983-8816-b34649340845)

This command in the picture is the same for what I saw in the API logs

![image](https://github.com/user-attachments/assets/11dfef64-1582-43fa-8ff7-9ef89591e06a)

**Answer:** sharpwmi
### **Question 10**
Which command was executed by the red team to extract/dump the contents of NTDS.DIT ?

From what I have learned is if someone is going to execute a command I know its using this API: 'CreateProcessW'. I did a ctrl + f in the csgo.exe, net.exe, and notepad.exe on 'CreateProcessW' and didn't find any further commands that I haven't already found.

I will use the DC01 API logs next. Initial analysis I can see more executeables here. I will do the same here as I did in the other API logs.

![image](https://github.com/user-attachments/assets/1ae45b0f-eb4e-4205-9219-bbcecab9133d)

From my search I found this: cmd /c ntdsutil "ac in ntds" ifm "cr fu %TEMP%\H00i0Z000.dat" q q. I am not fully sure what this is doing so I will find resources online to understand what it is doing.

![image](https://github.com/user-attachments/assets/9bded45f-e00e-4cdf-9586-06c5355a66ba)

Okay, now that I have read up on what the command does I am going to break it down here:
  - cmd /c: This tells it to open up command prompt... this entire command was ran in command prompt
  - ntdsutil: This is a cmd line tool for active directory domain services (AD DS) to do different tasks
  - "ac in ntds": This is telling the ntdsutil tool to start the active directory database instance
  - ifm: Install from media is the acronym and it creates an installation media for AD DS
  - "cr fu %TEMP%\H00i0Z000.dat": CR tells it to create and fu means full installation. So it is telling it to create a full installation media on the %TEMP%\H00i0Z000.dat file path and the file being named the .dat.

	This is the command that the red team ran to gather the contents of the NTDS.DIT after analyzing the command.

**Answer:** cmd /c ntdsutil "ac in ntds" ifm "cr fu %TEMP%\H00i0Z000.dat" q q
### **Question 11**
The red team has obtained the aforementioned dump by compressing it into a ZIP file. Which specific Win32 API is responsible for retrieving the full path of the file to be downloaded?

Still in the same file I found where the .dat file was called which is the dump and it being zipped up. In the zip file I found the API call 'GetFullPathNameW' which I researched and that API call downloads files

**Answer:** GetFullPathNameW

I enjoyed this other API log scavenger. This further improved my API log analysis capabilities. After getting all the details ironed out things fell into place once I knew what I was looking for.
