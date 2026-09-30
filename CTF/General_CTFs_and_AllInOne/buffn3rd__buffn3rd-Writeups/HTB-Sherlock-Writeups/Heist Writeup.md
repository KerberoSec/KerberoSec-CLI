# **Heist Writeup**
![image](https://github.com/user-attachments/assets/d32cd80f-10f3-4c0a-b7b4-53b7743ba26c)

Forela recently received complaints from viewers that the live stream on their YouTube channel was showing strange content. Instead of the usual company content, the live stream showed videos promoting cryptocurrency scams. The channel was used to showcase the company's products and services and provide educational content related to the industry they were in. Alonzo Spire, the IT administrator of Forela, managed the YouTube channel. The incident response team was notified of an incident as soon as complaints were received. Alonzo's system was triaged and artefacts were acquired from his system for forensics analysis to confirm how the company's channel got hacked.

**Tools:**
- Timeline Explorer
- MFTECmd
- PECmd
- Wireshark
- SrumECmd
**Learned:**
- Windows Forensics
- Windows Artifacts Importance
- Timeline analysis
- Network Forensics
### **Question 1**
At what time was the suspected phishing email received in the victim's inbox? (UTC)

From the files provdied were are given a network packet capture, emial, and KAPE image. My initial thought is to look at the contents of the email which I will do in my ubuntu machine. I found when Alonzo received the email. By doing a simple 'cat' and the email file name you can read the contents of the email

![image](https://github.com/user-attachments/assets/7ab162ed-5c6b-4f9b-9bda-21890ed65468)

**Answer:** 2023-04-11 08:55:22
### **Question 2**
Please provide the download URL that was utilised to retrieve the file initially downloaded as part of this security event.

Since they downloaded a malicious file I thought it would've been the attachment in the emial but it was not. Therefore, I will go to the users web browser history file found here: C:\School\HTB\DFIR\Heist DFIR\Heist\Acquisition\C\Users\alonzo.spire\AppData\Local\Google\Chrome\User Data\Default\History

Using DB Browser for SQLite I read hte contents of the file. Under the downlaods file I found the malicious file they downloaded named 'Forela-Partnership.zip'. A little trick I have learned is these entries are tied together with their ID's therefore I took the ID of 12 and went to the URLS table and found the URL based off its corresponding ID

![image](https://github.com/user-attachments/assets/ef650acc-56f3-462b-8eb0-abcdb81835b9)

**Answer:** https://doc-0s-5g-docs.googleusercontent.com/docs/securesc/sjpaukai4p255id8irbsaa0d1ds9k29c/o8kmueker1h57tkoe14o1osgi4uhbafl/1681208325000/03105725814018983462/13809461445078444789Z/1KsmFJYLzRefViXzeyWYOoojfewRmJgpp?e=download&uuid=d3c34b3f-c99f-42b3-84b3-dfc4ac4f609a&nonce=iojdml3dsj58i&user=13809461445078444789Z&hash=o5gmgdrljfhdo4hvrt3oparan4sq0hm5
### **Question 3**
What is the name of the file suspected to have been initially downloaded as part of this security event?

The name of the malicious file is: Forela-Partnership.zip. I found this through the downloads

**Answer:** Forela-Partnership.zip
### **Question 4**
When was this file downloaded onto the system?

From the downlaods table I copied the 17-digit webkit timestamp and used this website to convert it to UTC: [WebKit/Chrome Timestamp Converter (epochconverter.com)](https://www.epochconverter.com/webkit)

**Answer:** 2023-04-11 10:19:24
### **Question 5**
What is the name of the file that initiated malicious activity on the endpoint?

Hmm, as I wait for the MFTExplorer to load up I will parse it with the cmdline program MFTECmd then will load it into timeline explorer. My idea here is I will search by the download location of the zip file first and see what files I find in there and see if I can make a connection.

Filtering on the downlaods folder of alonzo I found this double ext file which is a tell-tell that this is related as TA will commonly due this to masquerade their executables

![image](https://github.com/user-attachments/assets/1a6fc4b4-80ab-4961-9108-fe4a9f78e7d5)

**Answer:** Partnership.pdf.exe
### **Question 6**
What file type was the malicious payload disguised as to deceive the user into executing it?

The TA masqueraded it being a pdf to hide the .exe

**Answer:** pdf
### **Question 7**
From which directory path was the malicious file executed?

My initial thought is to check the prefetch files which I will parse those out with Eric Zimmerman nifty PECmd! My idea here is to search by the file I found in the downlaods to show me its execution path

![image](https://github.com/user-attachments/assets/23c2669e-6144-422c-b015-cbe5d12fd05f)

**Answer:** C:\\USERS\\ALONZO.SPIRE\\DOCUMENTS\
### **Question 8**
There was a file on users desktop with a note. What were the contents of the note?

Using MFTExplorer, I discovered a file named 'remidner.txt'. I can see the contents of the folder stating: Contact Pakistan operations team to get updates and assist them if needed

**Answer:** Contact Pakistan operations team to get updates and assist them if needed
### **Question 9**
At what time was the malicious file was executed?

Using the prefetch files that I parsed I was able to discover when its last run time was

![image](https://github.com/user-attachments/assets/229691ab-d5a7-44f7-9f3a-ad9f2588a656)

**Answer:** 2023-04-11 10:20:06
### **Question 10**
The malicious file dropped 2 files on the system which performed further actions on the endpoint. What's the name of these 2 files? (alphabetical order)

Using the prefetch files I filtered on the time of the execution of the original malicious file. Then I found these too files that were executed shortly after the original files execution leading me to believe these are the 2 files it dropped

![image](https://github.com/user-attachments/assets/c91b8a3a-725e-495a-92ce-29cd5ef61fa4)

**Answer:** SI168290.EXE, UN598654.EXE
### **Question 11**
One of the files from Question 10 dropped two more files onto the system. What are the names of these files? (in alphabetical order)

Staying filtered on the timestamp of the orinigal I found 2 more files that were in the same folder path that were dropped I assume from this file originall: UN598654.EXE

![image](https://github.com/user-attachments/assets/13e17be4-4cca-4d05-9bd7-c806df934783)

**Answer:** PRO5093.EXE, QU2705.EXE
### **Question 12**
What's the malicious C2 IP Address and port?

Here I switched to the pcap file we have. Initial analysis I did some statistics filtering to see if I can identify top talkers. All the IP addresses I saw were private IP's not the C2 server. One thing I can try is looking at what was communicating over the network during the time the malware file was executed.Interesting find here... As I am looking at the traffic during the time of the file that had the malware that was executed I can see it making an outbound request to this server over a uncommon port

![image](https://github.com/user-attachments/assets/fb75b203-ae1f-411c-86f9-beafb4d1e9be)

Following the tcp stream this is the C2 server given the communication we see

![image](https://github.com/user-attachments/assets/8379f29c-ffb6-437a-8069-a1ff590c5b92)

**Answer:** 176.113.115.145:4125
### **Question 13**
What's the malware family of the malicious file?

Following that URl in the TCP stream If ollowed in the last task. I put it in VirusTotal and it got a hit. The malware family it is apart of is Redline

![image](https://github.com/user-attachments/assets/78b4e1ee-a447-4180-a4be-e6fcec43c81d)

**Answer:** Redline
### **Question 14**
Which malicious file exfiltrated data from the endpoint?

Following the tcp stream I found this file which appears to be the file that exfils data from the endpoint. Doing research on IXP001.tmp it is a file that is an info stealer.

![image](https://github.com/user-attachments/assets/9d752c2d-2efa-4009-b1b1-9d916b4d2b8b)

**Answer:** C:\USERS\ALONZO.SPIRE\APPDATA\LOCAL\TEMP\IXP001.TMP\QU2705.EXE
### **Question 15**
What's the process ID of the malicious file used to exfiltrate data?

Still continue to look at the TCP stream what I did is I filtered on the file name 'IXP000.tmp' as I thought it might show us the PID it attachs to and it did

![image](https://github.com/user-attachments/assets/7fbe43c2-f3dc-4c32-a56c-b5853916d617)

**Answer:** 3924
### **Question 16**
There was another alert after this incident of data exfiltration from another FTP server hosting critical files. Our TI team believe there may have been an internal credential leak. What's the IP address and the password of the FTP server which Alonzo had access to?

I thought since the creds were leaked it might've been from the info stealer so Is tayed inside the same TCP stream. I filtered on alonzo name and I found the IP and password

![image](https://github.com/user-attachments/assets/07803734-7ad8-4d87-863d-02239aa27f06)

**Answer:** 13.45.67.23:TheAwesomeGrape
### **Question 17**
What was the password of the YouTube channel which was hacked?

Here we can see the info stealer at work captuing the creds of alonzo youtube account

![image](https://github.com/user-attachments/assets/321af75d-c53a-4870-a9c7-595b55898d4f)

**Answer:** yoUKnoWnoThiNGJoNSNoW
### **Question 18**
Alonzo reported unauthorised use of his credit card and assumed his card details were stolen. Please confirm his credit card number.

I spent an hour then did reearch then found this persons right up on how they did it and after that it made so much sense. They took the TCP stream and put it in a text editor then searched using regex...[HTB Sherlock: Heist Writeup | Michał Walkowski (mwalkowski.com)](https://mwalkowski.com/post/sherlock-heist/)
	
Ironically the CC'd number was right after the creds of the youtube account was exposed.

![image](https://github.com/user-attachments/assets/364238d1-f8f3-403e-9c4f-e8186899fcea)

**Answer:** 4012873018191881
### **Question 19**
A migration plan document was also stolen in the attack which included some sensitive internal information. Who sent the document to Alonzo?

I filtered on migration since they mentioned it was a migration doc. I didn't know if the file had the name migration in it but I ended up finding it

![image](https://github.com/user-attachments/assets/fc4872ed-e0c3-4a82-aae8-0aeddde40256)

But I need to extract it so, I will use https://hexed.it/ which I learned from: https://mwalkowski.com/post/sherlock-heist/

I rebuilt the file but had to readup on how to do that. This was a tedious task

![image](https://github.com/user-attachments/assets/b86244be-4004-43f7-ab78-836fd490a2aa)

**Answer:** Abdullah Yasin
### **Question 20**
Forela is planning to upgrade its infrastructure as its expanding globally. What's the date when the infrastructure will be upgraded?

I had to find the Infra upgrade.docx file adn rebuilt it from its bits. Again, it was tedious but I found the answer

![image](https://github.com/user-attachments/assets/55ebbf18-7eb0-44c4-8705-7a4c75d0e13a)

**Answer:** 2024-01-17
### **Question 21**
How many bytes of data were sent by the malicious process found in question 14? Please note: the PCAP data does not provide the answer.

Doing some google searching I found out that the SRUDB.dat file is an important windows artifact! This file collects diagnostics from the windows environment. I am wondering if from there it might show that file from task 14. Using Eric Zimmerman v SrumECmd it will parse the file out. Here is my command:

SrumECmd.exe -f C:\School\HTB\DFIR\Heist DFIR\Heist\Acquisition\C\Windows\System32\SRU\SRUDB.dat" --csv "C:\temp\heist"

![image](https://github.com/user-attachments/assets/65ff6bf9-dc23-4ddc-869d-01b1e49630d3)

**Answer:** 107059

I thoroughly enjoyed this challenge. So far, I felt equipped tackling each challenge with the various tools and using my skillset to solve this. This was a fun network triage identifying a malicious file that was downloaded which ultimate lead to it being an info stealer allowing the TA to gain access to a youtube channel and someone credit card. 

