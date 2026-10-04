# **Campefire-2 Writeup**
![image](https://github.com/user-attachments/assets/2f4cef24-b36f-4b97-b438-35db6d03a4da)

Forela's Network is constantly under attack. The security system raised an alert about an old admin account requesting a ticket from KDC on a domain controller. Inventory shows that this user account is not used as of now so you are tasked to take a look at this. This may be an AsREP roasting attack as anyone can request any user's ticket which has preauthentication disabled.

**Tools:**
- Windows Event Viewer
**Learned:**
- Widows Event Log Analysis

First, lets discuss what an AsREP roasting attack is. It is another roasting attack that exploits a vulnerability in the Kerberos authentication. It targets user accounts that do not require pre-auth in AD.
### **Question 1**
When did the ASREP Roasting attack occur, and when did the attacker request the Kerberos ticket for the vulnerable user?

As stated in a pervious article on Campfire-1 understanding the various Event IDs that are related to the Kerberos protocol is crucial. Let's filter on Event ID '4768' because that is when a ticket was requested and previous experience might want to look for weak encryption so the ticket encryption field will be important so filtering on 0x17 will show it used the RC4 encryption standard which is weak encryption. This may point us in the right direction in understanding what account was used and the vulnerable user. Found it! My thinking was correct the attacker requested a ticket for hte account 'Arthur Kyle' and it used weak encryption
	
![image](https://github.com/user-attachments/assets/23681f6b-fd21-4aac-b166-77a395b7e867)

**Answer:** 2024-05-29 06:36:40
### **Question 2**
Please confirm the User Account that was targeted by the attacker.

This is easy as we already find the start of the attack and it calles the account out.
	
![image](https://github.com/user-attachments/assets/f4a3eb6c-6798-45b0-b433-df50150124c7)

**Answer:** arthur.kyle
### **Question 3**
What was the SID of the account?

Again, the initial finding has this detail. A SID is important as it identifies a user, group or computer account in a Windows environment. This is important in digital forensics as you cna trace events back to a specific user by utilizing their SID.

![image](https://github.com/user-attachments/assets/68f1efbf-6036-48c3-bec7-413222379ee9)

**Answer:** S-1-5-21-3239415629-1862073780-2394361899-1601
### **Question 4**
It is crucial to identify the compromised user account and the workstation responsible for this attack. Please list the internal IP address of the compromised asset to assist our threat-hunting team.

This can be found in the existing log we have been using. It will show the user account that was targetted and the workstaion IP.
	
![image](https://github.com/user-attachments/assets/0d1af78f-3b09-4087-ae83-c490cecc450b)

**Answer:** 172.17.79.129
### **Question 5**
We do not have any artifacts from the source machine yet. Using the same DC Security logs, can you confirm the user account used to perform the ASREP Roasting attack so we can contain the compromised account/s?

Now that we know the IP of the TA (172.17.79.129) lets utilzie the various logs and search for event id '4769' and I found the account that was used for the AsRep roasting attack

![image](https://github.com/user-attachments/assets/1719a887-3afa-4b1d-ba6b-819156809da7)

**Answer:** happy.grunwald

