# **OpTinselTrace24-5 Tale of Maple Syrup Writeup**
![image](https://github.com/user-attachments/assets/d535d3aa-fd69-4c67-9459-6c130efcea23)

Twinkle Snowberry who works as chief decorator in Santa’s workshop for years is suspected of assisting Krampus and his notorious Cyber group. Word is he has been having arguments with Santa for months. The most unfortunate thing finally happened, Santa's Workstation was ransomed. Twinkle’s Company owned phone is seized and a forensics acquisition is taking place to identify the suspicious activity.

**Tools:**
- ALEAPP
- Timeline Analysis
- bkcrack
- John The Ripper

**Learned:**
- Android Forensics
- Mobile Device Analysis
- Timeline Analysis

### **Question 1**
Identifying IOCs, accounts, or infrastructure is crucial for detecting breaches by attackers. Determine the email address used by the threat actor so it can be added to Santa's threat intel feed.

	Intiail analysis we are given a mobile image of an android device. Poking around I came across this file: C:\School\HTB\DFIR\TaleOfMapleSyrup\OPTT5-TRIAGE\data\mega.privacy.android.app\karere-MTJuaktENGh5RUnknsfFX1h0-2fcJ12pbmOW.db

	Reading the contacts table you will find the email

![image](https://github.com/user-attachments/assets/7a803c02-5ace-46fd-b5a6-031d2ae4c2b6)

**Answer**: krampusevilson@yahoo.com
### **Question 2**
Which application was used by the insider threat to communicate with the threat actor? Please provide the application's Android package name.

	I came back to this question since I saw it was mentioned in the database file that they werent allowed to use MEGA. I went back to the system files and found the app folder for it

**Answer**: mega.privacy.android.app
### **Question 3**
When was this application installed on the device?

	Using ALEAPP, I was able to find when the app was installed. ALEAPP can be found here for download: [Releases · abrignoni/ALEAPP](https://github.com/abrignoni/ALEAPP/releases)

![image](https://github.com/user-attachments/assets/3a58494b-d792-4eb9-86e8-635fd9b8c80e)

**Answer**: 2024-11-04 11:24:28
### **Question 4**
What is the agreed amount of money to be sent to the insider threat in exchange of him leaking Santa workshop's secrets?

	In the same file from question 1 I saw the agrgeed upon amount

![image](https://github.com/user-attachments/assets/89bc951b-85d0-4d9e-af44-5136dd1c2bbf)

**Answer**: $69000
### **Question 5**
Twinkle created a note on his phone using a note-keeping app. What were the contents of the note?

	In the keep DB file under the note_previews table you will find the contents of the note

![image](https://github.com/user-attachments/assets/f43bcb4a-8245-4343-a371-fdc2b81eb0f8)

**Answer**: I will need to find any ssh or rdp access that is open to internet. Will need to find their email address as well, maybe krampus will need those as well!!
### **Question 6**
What is the title of this note?

	Doing some research I found a few common note taking apps. One being keep and I found the folder and its .db file. under the tree_entity table I found the name of the file

![image](https://github.com/user-attachments/assets/994028f3-e93d-419f-9b77-78b30140db19)

**Answer**: Collect Information
### **Question 7**
When was the note created in the note-keeping app?

	Continuing to read the record you will see the Unix epoch time and using a Unix time converter it gives the timestamp of when it was created in UTC

![image](https://github.com/user-attachments/assets/da5a70e6-e92d-4b24-8a60-c1e599bd1768)

**Answer**: 2024-11-04 12:14:55
### **Question 8**
Twinkle Snowberry transferred a few files from his workstation to his mobile phone using an online file transfer service. What is the URL used to download the zip file on the mobile phone?

	This took some digging but my initial thought since they downloaded the zip file I thought of internet history. Therefore, I did find evidence of the use of Mozilla. Checking the manifest db file under the downlaods table I was able to find the download link

![image](https://github.com/user-attachments/assets/e8229f78-52f6-4df0-a54d-a6290392f5c8)

**Answer**: https://eu.justbeamit.com:8443/download?token=um9w7
### **Question 9**
When was this file shared with the threat actor by the insider, Twinkle Snowberry?
	
	Reading through the chat logs you will notice the attachment of the file they sent

![image](https://github.com/user-attachments/assets/e6dd50db-e93d-4b98-89b0-1d1ba72e897b)

**Answer**: 2024-11-05 12:04:24
### **Question 10**
Twinkle forgot the password of the archive file he sent to Krampus containing secrets. What was the password for the file?

	What helped me here was looking at context clues. First, I found the file in question where they zipped up the zipping(1).png and noticed they used ZipCrypto. I did some research on that and it uses legacy zip encryption process.
	
	Doing some research on tools to crack this old zip encryption I found bkcrack. Took me a bit to setup but once I understaood the tool which it needs the zip file, file to crack within zip archive, and a plaintext file to use for cracking it can crack it

![image](https://github.com/user-attachments/assets/7a9189db-8b63-4d49-865b-6bdc769d9699)

**Answer**: passdrow69#
### **Question 11**
What is the master password of the KeePass database that was leaked by the insider threat and handed over to the evil Krampus?

	Since the Keepass database file comes in a KDBX file we will use keepass2john tool which converts those files into a password cracking file compatible with John The Ripper. First we will want to extract the hash from the keepass file and save it to a file. After extracting the hash we can now use john the ripper and to get the password.

**Answer**:
### **Question 12**
What is the password for Santa's account on his North Pole workstation?

	After cracking the password to the keepass we can now unlock it and getting into it. You will see hte entry for Santas workstation open it and click the 3 elipses to view the password

![image](https://github.com/user-attachments/assets/7c283939-87c3-47b8-8dd3-945a33e76b49)

**Answer**: IHaveToSaveChristmas!$
### **Question 13**
Twinkle got his money in cryptocurrency so it can't be traced. Which cryptocurrency did he receive money in, and what was its address?

	WWithin the mega app db file I saw the conversation between the rogue elf and Twinkle and the wallet address and currency was given

![image](https://github.com/user-attachments/assets/9f4972dd-f9fa-40f2-a68f-ac4b4d3b5aae)

**Answer**: Elfereum:LVg2kJoFNg45Nbpy53h7Fe1wKyeNJHeXV2
