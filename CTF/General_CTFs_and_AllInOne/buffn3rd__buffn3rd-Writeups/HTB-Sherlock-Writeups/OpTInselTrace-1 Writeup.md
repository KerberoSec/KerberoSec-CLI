# **OpTInselTrace-1 Writeup**
![image](https://github.com/user-attachments/assets/c20ea274-30af-445c-ae92-6c95dbff8843)

**Tools:**
- EM Client
- MFTExplorer
- DB Browser for SQLite

**Learned:**
- Email Analysis
- Insider Threat Analysis

### **Question 1**
What is the name of the email client that Elfin is using?

  Initial analysis we are given an image of their C drive. I see we are given and $MFT file. I will begin opening that up to see holistically what the file system on the system looked like. Maybe I will see evidence of the email client. As I was waiting for the $MFT to load in MFTExplorer. I was looking through the triage image and on this path 'OpTinselTrace-1 Campaign\elfidence_collection\TriageData\C\users\Elfin\Apdata\Roaming' I noticed a folder named 'eM Client'. First, the reason I was going into this folder is this folder holds application specific data. Since it is wanting us to find the email client I suspected this might give me more info. Doing research on what this is I found it is an email client therefore, that is the answer!

![image](https://github.com/user-attachments/assets/b7acd0c6-09bd-43e6-95b5-bb8e0a828e54)

**Answer:** eM client
### **Question 2**
What is the email the threat is using?

I suspect we will have to dig through the 'eM Client' folder and open up old conversations some how. I notice we have alot of .DAT files. I am going to use 'DB Browser for SQLite' to open these files to see if I can uncover any conversations that are going on. After some time of opening a ton of empty or not resoruceful files I found here: 'OpTinselTrace-1 Campaign\elfidence_collection\TriageData\C\users\Elfin\Appdata\Roaming\eM Client\32969170-c98d-4a48-b444-526374e467e4\23848ff4-bf57-4577-bdb7-06e8a178560d\mail_fti' file has conversation data. I will see if I can analyze the email headers of the DB records. I found the 'MailAddressIndex' table to be resourceful as it shows me all the emails that Elfin has contacted. This is a good source of record when I am trying to uncover the threat actors email.

![image](https://github.com/user-attachments/assets/4e9dbcff-101f-41f6-a012-758a7190724f)

I was able to trace back the email to 'definitelynotthegrinch@gmail.com'. On the 'LocalMailsIndex3' table it appeared to be the conversation history of all the people who Elfin contacted. Elfin was having a conversation with Wendy whose email address was that. I cross referenced it on the MailAddressIndex. How I was able to trace it back to that email was there TA name was 'Wendy' and after a few conversations Wendy wanted Elfin to give up a secret. Finally, Elfin caved and provided it to Wendy

![image](https://github.com/user-attachments/assets/6449f22f-3b32-479f-a322-ebf4bfd414d7)

**Answer:** definitelynotthegrinch@gmail.com
### **Question 3**
When does the threat actor reach out to Elfin?

This one was tricky. I had to remind myself to use the the evidence I was provided and try differnet analysis methods. I went ahead and downloaded eM Client then copied the 'eM Client' folder from the triage folder to my local machine eM Client folder so that it will load it up in my eM Client. I felt this was easiest to solve this one. Looking through the emails I was able to uncover when she originally messaged him

![image](https://github.com/user-attachments/assets/b1f873e4-05d8-4908-9a60-8d9377373f7e)

**Answer:** 2023-11-27 17:27:26
### **Question 4**
What is the name of Elfins boss?

Continuing to look through their email I found an email to his boss about him coming in early.

![image](https://github.com/user-attachments/assets/2e75d396-3282-4f86-8a01-f303c0a0e535)

**Answer:** elfuttin bigelf
### **Question 5**
What is the title of the email in which Elfin first mentions his access to Santas special files?

In the email titled 'work' that he sent to Wendy you can see in the body paragraph him mentioning his special access to santas special files.

![image](https://github.com/user-attachments/assets/d7b2fcd4-3395-46f2-bcf7-54ef058ff5bc)

**Answer:** Re: work
### **Question 6**
The threat actor changes their name, what is the new name + the date of the first email Elfin receives with it?

Reading through the emails I found where the TA changed their name and the data of when it happened. On this you need to read through the 'binaries' email to get the original date

![image](https://github.com/user-attachments/assets/e8718d07-12b3-49a7-b2a4-988160f3a827)

**Answer:** wendy elflower, 2023-11-28 10:00:21
### **Question 7**
What is the name of the bar that Elfin offers to meet the threat actor at?

In the same email thread Wendy offers to meet somewhere and Elfin mentions the bar called 'SnowGlobe'

![image](https://github.com/user-attachments/assets/fa09734d-ef22-46a5-af83-6d1b88a19060)

**Answer:** SnowGlobe
### **Question 8**
When does Elfin offer to send the secret files to the actor?

In this email named 'can't wait any longer' Elfin offers to send the secret files.

![image](https://github.com/user-attachments/assets/e645be16-d579-4433-9033-203da368ada2)

**Answer:** 2023-11-28 16:56:13
### **Question 9**
What is the search string for the first suspicious google search from Elfin? (Format: string)

This will require for you to look at the 'History.File'. 
  It took a bit of digging but I was able to find the file here: 'OpTinselTrace-1 Campaign\elfidence_collection\TriageData\C\users\Elfin\Appdata\Local\Google\Chrome\User Data\Default\History.file'. 
The reason you want this file beacuse this is your search history. I opened up the file with 'DB Browser for SQLite' and I found the first suspicious looking google search from elfin 'how to get around work security' which is indicative that he is going to become an insider threat.

![image](https://github.com/user-attachments/assets/4f36ed6e-6ef7-43fd-8eb6-162125d9c1d4)

**Answer:** how to get around work security
### **Question 10**
What is the name of the author who wrote the article from the CIA field manual?

I used the history file and on the 'urls' table I was able to find the URL to the field manual. Going out to the link I can also see who the writer is. What made me go to this table was I got curious what the table was and thought that maybe it shows URL's and I dind't think I was going to directly find the name of the writer unless I knew the URL he used to access it.

![image](https://github.com/user-attachments/assets/59db79dd-6b4a-4801-9dd7-452d88363a48)

**Answer:** Joost Minnaar
### **Question 11**
What is the name of Santas secret file that Elfin sent to the actor?

Digging through the files provided since this is an image of the insider threats machine I suspected he had the file on the machine... well he might have had to in order to send it to the TA. My intial thought was I could check the desktop folder which would show me whats on their desktop but this folder path caught my eye 'OpTinselTrace-1 Campaign\elfidence_collection\TriageData\C\users\Elfin\Appdata\Roaming\top-secret' under the roaming folder. I thought it was odd there was a folder created there since the roaming folder is for applications. I was able to confirm that was indeed the file sent

![image](https://github.com/user-attachments/assets/a4d7c586-17f7-400a-a09d-2ac07a8cb605)

**Answer:** santa_deliveries.zip
### **Question 12**
According to the filesystem, what is the exact CreationTime of the secret file on Elfins host?

So, I had to use MFTExplorer to find this answer. Load the $MFT file. I went to where I found the file originally. I tried the creation date from the file system directly and it didn't take it and I tried it of the zip file and didn't like it. But this is when the $MFT helps tell the actualy truth of when it was actually created. Looking at it in $MFT it was actually created on '2023-11-28 17:01:29' which is the correct answer!

![image](https://github.com/user-attachments/assets/76731c4f-d608-43db-bd2b-64f977179227)

**Answer:** 2023-11-28 17:01:29
### **Question 13**
What is the full directory name that Elfin stored the file in?

This is easy. Just look at the path of where you found it

![image](https://github.com/user-attachments/assets/f00ed220-ffaf-4799-8f67-26b30f5e79a1)

**Answer:** C:\\users\\Elfin\\Appdata\\Roaming\\top-secret
### **Question 14**
Which country is Elfin trying to flee to after he exfiltrates the file?

Going back to the history file in the 'url' table I noted this earlier at the end of their search history I saw they were looking at flights. Glad it came in handy during this investigation

![image](https://github.com/user-attachments/assets/5624f885-64d4-4388-9210-dc624862cdb0)

**Answer:** Greece
### **Question 15**
What is the email address of the apology letter the user (elfin) wrote out but didn’t send?

Since this is talking about an email they never sent my initial thought was to go back to the eM Client and check the drafts. I found the answer there

![image](https://github.com/user-attachments/assets/2938be3e-6bb4-401b-bf58-87579444e983)

**Answer:** Santa.claus@gmail.com
### **Question 16**
The head elf PixelPeppermint has requested any passwords of Elfins to assist in the investigation down the line. What’s the windows password of Elfin’s host?

In order to do this you will need to use impacket on the SAM file. The SAM file on a windows system is the file that holds the passwords for all the user account but they are hashed. You will need to run the impacket command line tool in linux to de-hash the passwords.

  Here is the command I ran: python3 secretsdump.py -sam /optinseltrace1/TriageData/C/Windows/system32/config/SAM -system /optinseltrace1/TriageData/C/Windows/system32/config/SYSTEM LOCAL

Take the hash of Elfin account:

![image](https://github.com/user-attachments/assets/743d7b79-6b89-433d-87f1-a35224e4a406)

Do hash this I used hashcat which is a password cracker. I created a file called 'hash.txt' and the wordlist.txt is a provided file from hashcat and the 'cracked.txt' is the output file. Here is my command: hashcat -m 0 -a 0 -o cracked.txt hash.txt wordlist.txt. The password is 'Santaknowskungfu'

**Answer:** Santaknowskungfu
