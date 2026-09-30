# **Bumblebee Writeup**
![image](https://github.com/user-attachments/assets/af466c6e-5896-4cf8-b8d7-9ec1ecfae77d)

An external contractor has accessed the internal forum here at Forela via the Guest Wi-Fi, and they appear to have stolen credentials for the administrative user! We have attached some logs from the forum and a full database dump in sqlite3 format to help you in your investigation.

**Tools:**
- DB Browser for SQLite
- Notepad++
- Visual Code
**Learned:**
- HTTP Analysis
- Analyzing malicious script embedded in php pages
- Timeline Analysis
- Database File Analysis
### **Question 1**
What was the username of the external contractor?

Initial analysis we are given 2 files. A database file an an access log. My thought process here is I will have to leverage the access log and I will look at the 'phpp_users' table to help reassure the account used. Initially in the table I am seeing alot of bot and crawler accounts. Only a few actually user accounts. I suspect one of them being the external contractor. More specfically I suspect one of these 3 being the user account as the other usre accounts seem directly related to phpp. 
	
![image](https://github.com/user-attachments/assets/901e57ea-a15e-431d-9c5e-3b978eb53f42)

Looking further into this I cross referenced the access logs and found that apool1 was the user. In the database I can see they have an active connection as apoole does not

**Answer:** apoole1
### **Question 2**
What IP address did the contractor use to create their account?

In the database file it provides an IP address column. I went ahead and went to the access logs and notices alot of activity on that IP logging into the admin pages.

![image](https://github.com/user-attachments/assets/e0585bd4-d1e7-4e8b-a60f-607a12c19709)

### **Answer:** 10.10.0.78
### **Question 3**
What is the post_id of the malicious post that the contractor made?

I wasn't able to find anything in the access logs so I went back to the database file and started looking through the tables. I found in the 'phpbb_posts' table Post ID 9 came from the external contractor IP saying 'Hello World'

![image](https://github.com/user-attachments/assets/9709d698-3bd1-45c6-9a91-8c7c124bd611)

**Answer:** 9
### **Question 4**
What is the full URI that the credential stealer sends its data to?

I went ahead and on the php post which is where the attacker posted something I took the text and opened it in Visual Code. I begin seeing some odd code within this text file. What I am looking for is code that would be a stealing creds. Upoi investigation I noticed this web page and this oddly named function on a 'onclick' event. I am going to find the function and see what its doing

![image](https://github.com/user-attachments/assets/acbbaad5-758f-4141-82b1-1e68c8862b83)

I see this is a java script function. This is a java script to steal the credentials of anyone by redirecting them when they go to that page saying their sessione xpired. Then it takes you to what you think is the login.php file but it is this update.php

![[Pasted image 20240823104201.png]]

**Answer:** http://10.10.0.78/update.php
### **Question 5**
When did the contractor log into the forum as the administrator? (UTC)

I thought I'd find this in the access log since it lgos out who access what and when. I found the TA IP address logging into the admin page here. Remember that +100 we actually want to subtract from the total time. Since its read 26/04/2023 11:53:12 subtract an entire 1 hour

![image](https://github.com/user-attachments/assets/93ee5954-d154-4ca2-8587-7bd152611069)

**Answer:** 26/04/2023 10:53:12
### **Question 6**
In the forum there are plaintext credentials for the LDAP connection, what is the password?

Continue using the DB file. i started poking around on other tables and found in the 'phpbb.config' table I saw it referenced LDAP connection info. I saw the plaintext password

![image](https://github.com/user-attachments/assets/ec4f8ca8-03d0-4af3-a877-d2d106e544c4)

**Answer:** Passw0rd1
### **Question 7**
What is the user agent of the Administrator user?

This is easy. Just go to the access log and find the ip address. The user agent is at the end of the log. Reminder a user agent is the information of the user that connected to your website.

![image](https://github.com/user-attachments/assets/a744e977-efea-477e-82cf-ee550d86b534)

**Answer:** Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36
### **Question 8**
What time did the contractor add themselves to the Administrator group? (UTC)

I remember seeing this in the 'phpbb.log'. This database table logs out anything that has happened.That is a unixepoch time. Convert it. I used Cyber Chef: [From UNIX Timestamp: CyberChef (gchq.github.io)](https://gchq.github.io/CyberChef/#recipe=From_UNIX_Timestamp('Seconds%20(s)')&input=MTY4MjUwNjQzMQ)

![image](https://github.com/user-attachments/assets/d1277580-25eb-486c-b722-a5d3ba2da9bc)

**Answer:** 26/04/2023 10:53:51
### **Question 9**
What time did the contractor download the database backup? (UTC)

In the same table you can see there was a backup operation performed but that is not when it got downloaded but it tells us when the operation began. I will be looking for logs after 26/04/2023 10:54:31

![image](https://github.com/user-attachments/assets/ad87e2af-167b-4227-84c6-94073e6cb829)

I suspect I will have to go back through the access logs it might have logged out the backup. I will search by 'backup'. I foudn the last log being the external contractor was able to download the database.

![image](https://github.com/user-attachments/assets/512c615f-0284-4820-acce-bafb82837456)

**Answer:** 26/04/2023 11:01:38
### **Question 10**
What was the size in bytes of the database backup as stated by access.log?

Understanding how to read HTTP logs will help us solve this. HTTP logs will always log out the IP, Data, request type, URI, something, status code, data transfer in bytes. looking at the last picture you can easily identify it was 34707 bytes in size.

![image](https://github.com/user-attachments/assets/766168c6-e969-40dd-b467-57789586abb6)

**Answer:** 34707

Overall, this was a fun sherlock highlighting the importance of understanding http logs and being able to analzye them as well as doing database file analysis as well.
