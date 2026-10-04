# **OpTInselTrace-3 Writeup**
![image](https://github.com/user-attachments/assets/934d3c1d-c7fb-46ff-9aff-d735cdb3aa4e)

Oh no! Our IT admin is a bit of a cotton-headed ninny-muggins, ByteSparkle left his VPN configuration file in our fancy private S3 location! The nasty attackers may have gained access to our internal network. We think they compromised one of our TinkerTech workstations. Our security team has managed to grab you a memory dump: please analyse it and answer the questions! Santa is waiting… Please note: these Sherlocks are built to be completed sequentially and in order!

**Tools:**
- Volatility3
- VirusTotal

**Learned:**
- Memory Forensics
- Static Malware Analysis
### **Question 1**
What is the name of the file that is likely copied from the shared folder (including the file extension)?

Doing a simple windows.filescan which scans all the files in the memory dump. Here is the command I ran: python3 vol.py -f /home/detection/Desktop/santaclaus.bin windows.files. Sometimes when looking for files I like to grep on .zip, .txt, .jpg, .png, .docx, .xlsx are just some filetypes I look for when doing forensics. These are common file formats where if someone was wanting to steal data it would normally be in that format.

I found a suspicious file on Santas desktop called: present_for_santa.zip
	
![image](https://github.com/user-attachments/assets/442e3a65-08e9-4cf1-82f5-53529597d1f1)

This appeares to be the file that would have been copied given where I found it.

**Answer:** present_for_santa.zip

### **Question 2**
What is the file name used to trigger the attack (including the file extension)?

Looks like this is a continuation from the previous file. We will want to dump the file using windows.dumpfile. Something to note! Look at my previous screenshot and you will see the memory address for where the data lies: 0xa48df8fb42a0
	
After looking at the memory dump of that location in the zip file you can see a click_for_present.lnk file. This is the file that will trigger the attack and run the present.vbs

![image](https://github.com/user-attachments/assets/f7c003da-ffbe-4465-92b3-62d133f2a29e)

**Answer:** click_for_present.lnk

### **Question 3**
What is the name of the file executed by click_for_present.lnk (including the file extension)?

I assume it is the present.vbs file but let me prove it. Using the 'exiftool' which is a command line tool for meta data analysis I can see this info about it
	
![image](https://github.com/user-attachments/assets/e334833b-cb8d-46b6-912c-685cd67bd33a)

So the next thing is you will want to take the obfuscated command line argument data and I believe in there we will find what file it calls. I learned something new. Initially I recognized this was base64 encoding and when I went to my usual tool to decode it... well it was clunky looking. I learned through the command line you can actually decode base64 by specifying the datatype with the flag of -d

![image](https://github.com/user-attachments/assets/80f4d69f-c6df-4fdb-978e-45878ef8e041)

**Answer:** present.vbs

### **Question 4**
What is the name of the program used by the vbs script to execute the next stage?

The field named "powershell.exe" is the program that will use the vba script. The metadata of the .lnk file tells us what program it wants the vbs script to open in

![image](https://github.com/user-attachments/assets/a611a807-eea7-49a4-9d00-8aa43a28a110)

**Answer:** powershell.exe

### **Question 5**
What is the name of the function used for the powershell script obfuscation?

Looking through the vbscript I saw this 'WrapPresent' being called out in a few spots. I believe that is the fucntion name that is obfuscating the script. Which it was! I did simple static code analysis inside my Ubuntu VM just using a text editor

![image](https://github.com/user-attachments/assets/6d0d79bf-7b75-44e8-8a25-c5547458ddee)

**Answer:** WrapPresent

### **Question 6**
What is the URL that the next stage was downloaded from?

Using VirusTotal, you can identify the URL it contacts! I enjoy using VirusTotal as it can disect any malicious file, URL, and links and give you immense detail about the file.

![image](https://github.com/user-attachments/assets/5378d968-b48a-4611-8b12-5e5547b95e43)

**Answer:** http://77.74.198.52/destroy_christmas/evil_present.jpg

### **Question 7**
What is the IP and port that the executable downloaded the shellcode from (IP:Port)?

So you have to rethink this one. You won't be able to obtain the port using the file. Since this is talking about the download this is talking about the zip file. Using VirusTotal on that to see what IP it is talking to and see if it will give us a port number.

After analyzing the zip file I found it talking to the same IP: 77.74.198.52 and the port which was 445.

**Answer:** 77.74.198.52:445

### **Question 8**
What is the process ID of the remote process that the shellcode was injected into?

Doing some research on volatility3 I learned that using the windows.netstat will dump network related info like addresses, ports, protocols, PIDs etc. This will be perfect since we are wanting to find the PID of where the shellcode was injected into

![image](https://github.com/user-attachments/assets/52d6c320-662f-41e2-a7d4-d212562331cd)

Here we can see that the IP it has been talking to established a connection on 447 and the PID of the process is 724. We can see this is where they established their C2. Here is the command I ran to yield the results: python3 vol.py -f /home/detection/Desktop/santaclaus.bin windows.netstat

**Answer:** 724

### **Question 9**
After the attacker established a Command & Control connection, what command did they use to clear all event logs?

Had to take a hint and found through warlocksmurg (https://github.com/warlocksmurf/HTBSherlock-writeups/blob/main/optinseltrace2023-sherlock/OpTinselTrace-3.md)

I need to go through the event logs. I will dump the powershell logs since we are talking a command.

![image](https://github.com/user-attachments/assets/b5db9b46-f019-47c1-bee8-ce397a92fdb4)

After dumping that event log I removed the .dat that was concatenated onto the dumped file just making it .evtx. This allowed for me to view it in EventViewer on my windows device.

![image](https://github.com/user-attachments/assets/a43daf29-fe62-4745-b45a-fb06e58cf197)

**Answer:** Get-EventLog -List | ForEach-Object { Clear-EventLog -LogName $_.Log }
### **Question 10**
What is the full path of the folder that was excluded from defender?

I am thinking we will have to dump the windows defender event logs. After dumping the logs and analyzing them I found that "C:\users\public" was the folder path to be excluded from analysis from Defender. Event ID 5007 is any configuration change that was made. Also, I noted looking through all the logs there was no other folder path updated. You can see the TA updated the system registry and in the 'Exclusion' section they had that path excluded

![image](https://github.com/user-attachments/assets/6dbe6ce4-4b6e-4deb-af1f-35969022da06)

**Answer:** C:\\users\\public

### **Question 11**
What is the original name of the file that was ingressed to the victim?

Since this is a file... I will dump the security, system, and app logs. I didn't find anything in those logs like I thought so I went back to the powershell logs and found this. I suspected that was the executeable but it was not. I think I will need to analyze that file. So i will run a windows.filescan to find its memory location to dump it.
	
![image](https://github.com/user-attachments/assets/fbcb1822-56e9-4b55-aaba-589ffa6e3757)

Bingo! Found it. Time to dump it: python3 vol.py -f /home/detection/Desktop/santaclaus.bin windows.dumpfiles --virtaddr 0xa48e00d10a90

![image](https://github.com/user-attachments/assets/b6c4f2fa-678b-4564-97b2-587499d6d330)

Running that through VirusTotal I found that the file original name is 'procdump.exe'.

**Answer:** procdump.exe

### **Question 12**
What is the name of the process targeted by procdump.exe?

The procdump.exe targets the lsaas.exe. In the powershell logs you can identify the renamed 'procdump' calling that lsass.exe to help mask it.

![image](https://github.com/user-attachments/assets/f74f5fab-6ced-48a7-90b0-71712936573e)

**Answer:** lsass.exe

This was a fun memory investigation with a tidbit of malware investigation. It challenge my memory forensic skills to go a bit deeper and get more familiar with the various plugins as they are key components in solving this!
