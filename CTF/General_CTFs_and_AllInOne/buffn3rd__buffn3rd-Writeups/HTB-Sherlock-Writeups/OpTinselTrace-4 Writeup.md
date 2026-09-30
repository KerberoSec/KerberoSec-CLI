# **OpTinselTrace-4 Writeup**
![image](https://github.com/user-attachments/assets/b6699109-ec3a-4b29-acc7-65802a931ae1)

Printers are important in Santa’s workshops, but we haven’t really tried to secure them! The Grinch and his team of elite hackers may try and use this against us! Please investigate using the packet capture provided! The printer server IP Address is 192.168.68.128 Please note: these Sherlocks are built to be completed sequentially and in order!

**Tools:**
- WireShark

**Learned:**
- Network Forensics

### **Question 1**
The performance of the network printer server has become sluggish, causing interruptions in the workflow at the North Pole workshop. Santa has directed us to generate a support request and examine the network data to pinpoint the source of the issue. He suspects that the Grinch and his group may be involved in this situation. Could you verify if there is an IP Address that is sending an excessive amount of traffic to the printer server?

We know the printer IP is 192.168.68.128 so I will filter on that then use the 'Statistics' feature to see who the top talker is. I found the top talker to be this address: 172.17.79.133. This might be indicative of unusual conversation

![image](https://github.com/user-attachments/assets/83416ca1-03ba-483f-adf7-462bc2f35aa0)

**Answer:** 172.17.79.133
### **Question 2**
Bytesparkle being the technical Lead, found traces of port scanning from the same IP identified in previous attack. Which port was then targeted for initial compromise of the printer?

9100 is the IP of the attack. Looking at the port usage for this IP I can see heavy amounts of traffic over 9100 which is indicative this might be the port used in compromise

![image](https://github.com/user-attachments/assets/5fad5215-5b31-4f2a-9002-57ad36a069df)

**Answer:** 9100
### **Question 3**
What is the full name of printer running on the server?

I followed one of the TCP streams and found the name that way. Following the TCP stream is a great way of getting additional information such as device names, creds used etc

![image](https://github.com/user-attachments/assets/c2db2441-0c89-4ab5-941e-af66d17fe385)

**Answer:** Northpole HP LaserJet 4200n
### **Question 4**
Grinch intercepted a list of nice and naughty children created by Santa. What was name of the second child on the nice list?

Following the TCP stream data it showed us where they queried the file "list1.txt" where the TA was able to see the info which was the list mentioned for the question

![image](https://github.com/user-attachments/assets/d01b6b56-32e8-46ce-afce-7832217549a7)

**Answer:** Douglas Price
### **Question 5**
The Grinch obtained a print job instruction file intended for a printer used by an employee named Elfin. It appears that Santa and the North Pole management team have made the decision to dismiss Elfin. Could you please provide the word for word rationale behind the decision to terminate Elfin's employment?

Continuing to follow the TCP stream I can see where they got there hands on the saved print job. I will continue to follow the TCP stream to see if I can find the reason.

![image](https://github.com/user-attachments/assets/2bb41e11-9068-4aa9-8f9b-4ca874801af1)

Shortly after I found the reason for the layoff:

![image](https://github.com/user-attachments/assets/e5f0b567-f234-4272-8f21-24dccfed65be)

**Answer:** The addressed employee is confirmed to be working with grinch and team. According to Clause 69 , This calls for an immediate expulsion.
### **Question 6**
What was the name of the scheduled print job?

I thought I found the job name being 'MerryChristmasJob' but that was not it. I will continue looking at other TCP streams.

![image](https://github.com/user-attachments/assets/ec0b38e7-9a64-4685-9f86-a20c0b1b62e8)

Wow, that took some time to find but I was able to find the job name

![image](https://github.com/user-attachments/assets/73885380-4a1b-460a-89da-ae374f6c3817)

**Answer:** MerryChristmas+BonusAnnouncment
### **Question 7**
Amidst our ongoing analysis of the current packet capture, the situation has escalated alarmingly. Our security system has detected signs of post-exploitation activities on a highly critical server, which was supposed to be secure with SSH key-only access. This development has raised serious concerns within the security team. While Bytesparkle is investigating the breach, he speculated that this security incident might be connected to the earlier printer issue. Could you determine and provide the complete path of the file on the printer server that enabled the Grinch to laterally move to this critical server?

Using the previous TCPs tream from where you found the job name. It has the RSA key! 

![image](https://github.com/user-attachments/assets/b0e5ff4f-3f8e-413a-aee0-9555ea329a76)

**Answer:** /Administration/securitykeys/ssh_systems/id_rsa
### **Question 8**
What is size of this file in bytes?

The file size is 1914. This can find this is in the same TCP stream as above. It calls out the file size in the TCP stream.

![image](https://github.com/user-attachments/assets/122168e5-4b5e-488c-b5c8-ed09876d4bf6)

**Answer:** 1914
### **Question 9**
What was the hostname of the other compromised critical server?

In the TCP stream we have been using there is a note that says what server the backup key is for.

![image](https://github.com/user-attachments/assets/f71e38ce-3b3e-4d43-a664-adf363838e25)

**Answer:** christmas.gifts
### **Question 10**
When did the Grinch attempt to delete a file from the printer? (UTC)

Found in packet no 3676 us where I found where they tried to delete the key. Checking the timestamp on when the packet came in it was 2023-12-08 12:18:14

![image](https://github.com/user-attachments/assets/da79a0e2-06ff-4eb7-baae-7666c98cf9ef)

**Answer:** 2023-12-08 12:18:14

This was a fun network forensics trying to identify an intrusion attempt using a vulnerable printer! What I learned here is digging deeper in each packet because the answer isn't going to be found in the first 100 packets. I learned to filter though packets on key words to help identify everything.

